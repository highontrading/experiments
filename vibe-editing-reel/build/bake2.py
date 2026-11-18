"""HQ bake for one take: RVM matte (finer internal res), Real-ESRGAN on the head region, Lanczos 1.5x for the rest,
light sharpen, crisp alpha, premium relight keyed to the tracked face. Outputs are 1080x1920 (the stage draws them
in 720-space coordinates, so it needs no change).
  OUT/raw/NNNNN.jpg  upscaled untouched frame      OUT/pre/NNNNN.webp  graded RGBA cut-out      OUT/faces.json
usage: python3 bake2.py RAW.mp4 RVM_WEIGHTS ESRGAN_WEIGHTS edl.json OUT"""
import sys, os, json, subprocess, bisect, time, numpy as np, torch, cv2
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rvm_net, esrgan
src, rw, ew, edl, out = sys.argv[1:6]
for d in ('raw', 'pre'): os.makedirs(f'{out}/{d}', exist_ok=True)
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "4"))); net = rvm_net.load(rw); sr = esrgan.load(ew)
W, H, OW, OH = 720, 1280, 1080, 1920
want = sorted(set(json.load(open(edl))['frames'])); last = want[-1]
done_already = {int(f[:5]) for f in os.listdir(f'{out}/pre')}
cas = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
SIDE = (np.clip(xx / OW * 1.3 - .3, 0, 1) * np.clip(1.2 - yy / (OH * .9), 0, 1))[..., None]
face = None; faces = {}
def track(img):
    global face
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY); f = cas.detectMultiScale(g, 1.1, 5, minSize=(70, 70))
    if len(f):
        x, y, w, h = max(f, key=lambda r: r[2] * r[3]); c = np.array([x + w / 2, y + h / 2, w], np.float32)
        face = c if face is None or abs(c[2] - face[2]) > face[2] * .35 else face * .7 + c * .3
    if face is None: face = np.array([360, 560, 170], np.float32)
    return face.copy()
def head_up(img, f):
    """Lanczos 1.5x for the frame, Real-ESRGAN on the head + hair, feathered in."""
    base = np.asarray(Image.fromarray(img).resize((OW, OH), Image.LANCZOS)).astype(np.float32)
    cx, cy, fw = f; x0 = int(max(0, cx - fw * 1.25)); x1 = int(min(W, cx + fw * 1.25)); y0 = int(max(0, cy - fw * 1.45)); y1 = int(min(H, cy + fw * 1.05))
    x0 -= x0 % 4; y0 -= y0 % 4; crop = np.ascontiguousarray(img[y0:y1, x0:x1])
    cw, ch = int((x1 - x0) * 1.5), int((y1 - y0) * 1.5)
    up = esrgan.upscale(sr, crop, cw, ch).astype(np.float32)
    lz = base[int(y0 * 1.5):int(y0 * 1.5) + ch, int(x0 * 1.5):int(x0 * 1.5) + cw]; ch, cw = lz.shape[:2]; up = up[:ch, :cw]
    m = np.zeros((ch, cw), np.float32); b = int(min(ch, cw) * .14); m[b:-b, b:-b] = 1
    m = cv2.GaussianBlur(m, (0, 0), b * .5)[..., None]
    base[int(y0 * 1.5):int(y0 * 1.5) + ch, int(x0 * 1.5):int(x0 * 1.5) + cw] = lz * (1 - m * .72) + up * m * .72
    im = Image.fromarray(base.clip(0, 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1.3, percent=55, threshold=2))
    return np.asarray(im)
def despill(rgb, af):
    """Edge decontamination: colours at the matte edge are rebuilt from the subject's interior (bled outward),
    so no wall colour survives in hair or along the shoulders."""
    m = (af > .93).astype(np.float32); c = rgb.astype(np.float32)
    num = cv2.GaussianBlur(c * m[..., None], (0, 0), 6); den = cv2.GaussianBlur(m, (0, 0), 6)[..., None] + 1e-4
    num2 = cv2.GaussianBlur(c * m[..., None], (0, 0), 18); den2 = cv2.GaussianBlur(m, (0, 0), 18)[..., None] + 1e-4
    inner = np.where(den > .05, num / den, num2 / den2)
    w = np.clip((af - .35) / .6, 0, 1)[..., None] ** 1.5                      # 1 inside, 0 at the outer fringe
    lum_in = inner @ np.array([.299, .587, .114], np.float32); lum_c = c @ np.array([.299, .587, .114], np.float32)
    keep_detail = inner + (np.minimum(lum_c, lum_in + 10) - lum_in)[..., None] * .5   # keep strand texture, never brighter
    out = c * w + keep_detail * (1 - w)
    return out.clip(0, 255).astype(np.uint8)
def deglint(rgb, f, af):
    """Grey wall-lit glints on the top of the hair: low-saturation bright pixels above the forehead pulled toward the hair tone."""
    c = rgb.astype(np.float32); top = int((f[1] - f[2] * .3) * 1.5)
    if top <= 0: return rgb
    r = c[:top]; mx, mn = r.max(2), r.min(2); lum = r @ np.array([.299, .587, .114], np.float32); sat = (mx - mn) / (mx + 1)
    g = np.clip((lum - 85) / 45, 0, 1) * np.clip((.34 - sat) / .12, 0, 1)
    g = cv2.GaussianBlur(g, (0, 0), 1.5)[..., None]
    am = np.clip((af[:top] - .5) * 2, 0, 1)[..., None] * (1 - g)          # hair interior, glints excluded
    dark = cv2.GaussianBlur(r * am, (0, 0), 9) / (cv2.GaussianBlur(am, (0, 0), 9)[..., None] + 1e-3)
    c[:top] = r * (1 - g) + np.minimum(r, dark + 6) * g
    return c.clip(0, 255).astype(np.uint8)
def grade(rgb, a, f):
    rgb = rgb.astype(np.float32) / 255; lum = rgb @ np.array([.299, .587, .114], np.float32)
    rgb = np.clip((rgb - .5) * 1.1 + .48, 0, 1)
    rgb = rgb * (1 + np.array([.05, .012, -.05], np.float32) * lum[..., None]) * .9
    kx, ky = f[0] * 1.5, (f[1] - 10) * 1.5
    key = np.exp(-(((xx - kx) / 420.) ** 2 + ((yy - ky) / 520.) ** 2))[..., None]
    rgb = rgb * (.62 + .44 * key)
    A = Image.fromarray(a); er = np.asarray(A.filter(ImageFilter.MinFilter(9))).astype(np.float32) / 255
    edge = np.clip(a.astype(np.float32) / 255 - er, 0, 1); edge = cv2.GaussianBlur(edge, (0, 0), 2.5)[..., None]
    rgb = rgb + edge * SIDE * np.array([1.0, .74, .45], np.float32) * .5
    rgb = rgb * (1 - edge * .3) + edge * .3 * np.array([.16, .11, .08], np.float32)
    return (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
rec = [None] * 4; idx = -1; prev = -999; n = 0; t0 = time.time()
with torch.no_grad():
    while idx < last:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        idx += 1; use = idx in want
        if not use:
            k = bisect.bisect_left(want, idx)
            if k >= len(want) or want[k] - idx > 12 or idx % 2: continue
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        if idx - prev > 30: rec = [None] * 4
        fgr, pha, rec = net(torch.from_numpy(img).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.5); prev = idx
        f = track(img); faces[idx] = [float(v) for v in f]
        if not use or idx in done_already: continue
        hi = head_up(img, f)
        Image.fromarray(hi).save(f'{out}/raw/{idx:05d}.jpg', quality=93)
        af = np.clip((cv2.resize(pha[0, 0].numpy(), (OW, OH), interpolation=cv2.INTER_LANCZOS4) - .5) * 1.08 + .5, 0, 1)
        a = (af * 255).round().astype(np.uint8)
        fg_hi = deglint(despill(hi, af), f, af)
        Image.fromarray(np.dstack([grade(fg_hi, a, f), a])).save(f'{out}/pre/{idx:05d}.webp', quality=92, method=3)
        n += 1
        if n % 50 == 0: print(n, '/', len(want), round((time.time() - t0) / n, 2), 's/frame', flush=True)
p.kill(); json.dump(faces, open(f'{out}/faces.json', 'w')); print('done', n, round(time.time() - t0), 's')
