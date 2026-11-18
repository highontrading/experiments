"""Matte every used source frame (RVM, sequential) and bake the premium relight into the cut-out.
Writes OUT/raw/NNNNN.jpg (untouched) and OUT/pre/NNNNN.webp (graded RGBA). NNNNN = 60 fps source index.
usage: python3 bake.py RAW.mp4 WEIGHTS edl.json OUT"""
import sys, os, json, subprocess, bisect, time, numpy as np, torch
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
import rvm_net
src, wts, edl, out = sys.argv[1:5]
for d in ('raw', 'pre'): os.makedirs(f'{out}/{d}', exist_ok=True)
torch.set_num_threads(4); net = rvm_net.load(wts); W, H = 720, 1280
want = sorted(set(json.load(open(edl))['frames'])); last = want[-1]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
KEY = np.exp(-(((xx - 360) / 280.) ** 2 + ((yy - 560) / 347.) ** 2))[..., None]
SIDE = (np.clip(xx / W * 1.3 - .3, 0, 1) * np.clip(1.2 - yy / (H * .9), 0, 1))[..., None]
def grade(rgb, a):
    rgb = rgb.astype(np.float32) / 255; lum = rgb @ np.array([.299, .587, .114], np.float32)
    rgb = np.clip((rgb - .5) * 1.1 + .48, 0, 1)
    rgb = rgb * (1 + np.array([.05, .012, -.05], np.float32) * lum[..., None]) * .9
    rgb = rgb * (.62 + .44 * KEY)
    A = Image.fromarray(a); er = np.asarray(A.filter(ImageFilter.MinFilter(7))).astype(np.float32) / 255
    edge = np.clip(a.astype(np.float32) / 255 - er, 0, 1)
    edge = (np.asarray(Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255)[..., None]
    rgb = rgb + edge * SIDE * np.array([1.0, .74, .45], np.float32) * .55
    rgb = rgb * (1 - edge * .3) + edge * .3 * np.array([.16, .11, .08], np.float32)
    return (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
rec = [None] * 4; idx = -1; prev = -999; done = 0; t0 = time.time()
with torch.no_grad():
    while idx < last:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        idx += 1; use = idx in want
        if not use:
            k = bisect.bisect_left(want, idx)
            if k >= len(want) or want[k] - idx > 12 or idx % 2: continue
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        if idx - prev > 30: rec = [None] * 4
        fgr, pha, rec = net(torch.from_numpy(img.copy()).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.4); prev = idx
        if not use: continue
        a = (pha[0, 0].numpy() * 255).round().astype(np.uint8); fg = (fgr[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
        Image.fromarray(img).save(f'{out}/raw/{idx:05d}.jpg', quality=92)
        Image.fromarray(np.dstack([grade(fg, a), a])).save(f'{out}/pre/{idx:05d}.webp', quality=93, method=3)
        done += 1
        if done % 100 == 0: print(done, '/', len(want), round((time.time() - t0) / done, 2), 's/frame', flush=True)
p.kill(); print('done', done, round(time.time() - t0), 's')
