"""Glossy 3D chrome graffiti-style 'GTA VI' logo + grunge background.
build_logo(scale) -> (rgb float32 BGR premultiplied, alpha, face_mask)  ; build_bg(W,H)"""
import numpy as np, cv2, math
from PIL import Image, ImageDraw, ImageFont

def _mask(text, font, size, kern, ss):
    f = ImageFont.truetype(font, int(size * ss))
    widths = [f.getlength(c) for c in text]
    tw = int(sum(widths) + kern * size * ss * (len(text) - 1)) + int(size * ss * 2.5)
    h = int(size * ss * 1.8)
    m = Image.new("L", (tw, h), 0)
    d = ImageDraw.Draw(m)
    x = int(size * ss * 1.2)
    spikes = []; idx = 0
    for c, w in zip(text, widths):
        if c == " ":
            x += size * ss * 0.30
            continue
        lm = Image.new("L", m.size, 0); ld = ImageDraw.Draw(lm)
        ld.text((x, int(size * ss * 0.25)), c, font=f, fill=255)
        bb = lm.getbbox(); m.paste(255, mask=lm)
        if bb:
            x0, y0, x1, y1 = bb; lw, lh = x1 - x0, y1 - y0
            spikes.append((idx, x0, y0, lw, lh))
        idx += 1
        x += w + kern * size * ss
    n = len(spikes)
    for i, (k, x0, y0, lw, lh) in enumerate(spikes):
        poly = []
        if i == 0:   # big flaring thorn out of the bottom-left
            poly.append([(x0 + 0.30 * lw, y0 + 0.55 * lh), (x0 + 0.45 * lw, y0 + 0.95 * lh), (x0 - 0.10 * lw, y0 + 1.02 * lh), (x0 - 0.55 * lw, y0 + 1.18 * lh), (x0 - 0.05 * lw, y0 + 0.80 * lh)])
            poly.append([(x0 + 0.35 * lw, y0 + 0.05 * lh), (x0 + 0.65 * lw, y0 + 0.15 * lh), (x0 + 0.05 * lw, y0 - 0.22 * lh)])
        if i == n - 1:  # thorn out of the bottom-right
            poly.append([(x0 + 0.70 * lw, y0 + 0.55 * lh), (x0 + 0.55 * lw, y0 + 0.95 * lh), (x0 + 1.10 * lw, y0 + 1.02 * lh), (x0 + 1.75 * lw, y0 + 1.20 * lh), (x0 + 1.05 * lw, y0 + 0.78 * lh)])
            poly.append([(x0 + 0.2 * lw, y0 + 0.08 * lh), (x0 + 0.8 * lw, y0 + 0.06 * lh), (x0 + 1.0 * lw, y0 - 0.25 * lh)])
        if 0 < i < n - 1:  # small top thorns
            if i % 2 == 0:  # slanted thorn leaning right off the top
                poly.append([(x0 + 0.45 * lw, y0 + 0.12 * lh), (x0 + 0.85 * lw, y0 + 0.10 * lh), (x0 + 1.05 * lw, y0 - 0.16 * lh)])
        for pg in poly:
            d.polygon(pg, fill=255)
    a = np.asarray(m).astype(np.float32) / 255
    ys, xs = np.where(a > 0.5)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

def _warp(m, skew=0.16, arch=0.10, stretch=1.0):
    h, w = m.shape
    pad = int(h * 0.6)
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    H, W = m.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u = (xx - W / 2) / (w / 2)
    # arch: outer letters drop down, slight perspective scale (centre taller)
    yoff = arch * h * u ** 2
    sy = 1 + 0.10 * (1 - np.clip(u ** 2, 0, 1))
    src_y = (yy - H / 2 - yoff) / sy / stretch + H / 2
    src_x = xx + skew * (yy - H / 2)
    out = cv2.remap(m, src_x, src_y, cv2.INTER_LINEAR, borderValue=0)
    ys, xs = np.where(out > 0.5)
    p = int(h * 0.05)
    return out[max(0, ys.min() - p):ys.max() + p, max(0, xs.min() - p):xs.max() + p]

def build_logo(scale=1.0, text="GTA VI", font="MetalMania-Regular.ttf", size=470):
    ss = 2  # supersample
    m = _mask(text, font, size * scale, -0.06, ss)
    m = _warp(m)
    kk = scale * size / 470.0
    depth = int(34 * kk * ss)
    pad = depth + int(120 * kk * ss)
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    H, W = m.shape
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    # ---- extrusion (down-right), shaded blue chrome sides
    ext = np.zeros((H, W), np.float32)
    ext_rgb = np.zeros((H, W, 3), np.float32)
    dirx, diry = 0.35, 1.0
    for k in range(depth, 0, -1):
        sh = np.roll(np.roll(m, int(k * diry), 0), int(k * dirx), 1)
        t = k / depth
        # banded metallic side: dark navy with glossy horizontal streaks
        band = 0.5 + 0.5 * np.cos((yy * 7 + t * 1.2) * math.pi)
        col = np.stack([0.75 + 0.25 * band, 0.25 + 0.35 * band, 0.30 + 0.35 * band], -1) * (0.45 + 0.55 * (1 - t)) + np.clip((band - 0.85) / 0.15, 0, 1)[..., None] * 0.2
        new = sh * (1 - ext)
        ext_rgb += new[..., None] * col
        ext = np.clip(ext + new, 0, 1)
    # dark edge between face and extrusion
    face = m
    rim = np.clip(cv2.dilate(m, np.ones((int(5 * kk * ss) | 1,) * 2, np.uint8)) - m, 0, 1)
    # ---- bevel height field from distance transform
    mb = (m > 0.5).astype(np.uint8)
    dist = cv2.distanceTransform(mb, cv2.DIST_L2, 5).astype(np.float32)
    bw = 16 * kk * ss
    hgt = np.clip(dist / bw, 0, 1)
    hgt = np.sin(hgt * math.pi / 2)
    hgt = cv2.GaussianBlur(hgt, (0, 0), 1.5 * ss)
    gy, gx = np.gradient(hgt * bw * 0.9)
    nz = np.ones_like(gx)
    nrm = np.sqrt(gx ** 2 + gy ** 2 + nz ** 2)
    nx, ny, nz = -gx / nrm, -gy / nrm, nz / nrm
    # environment reflection: chrome maps normal to a pink/white/blue studio env
    L = np.array([-0.45, -0.65, 0.62]); L /= np.linalg.norm(L)
    lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    # reflection vector z-up view
    rx, ry = 2 * nz * nx, 2 * nz * ny - 0
    env_v = np.clip(0.38 - ry * 0.8 + (yy - 0.5) * 0.9, 0, 1)   # sky (top) -> floor (bottom)
    pink = np.array([0.95, 0.38, 1.0])     # BGR hot pink/violet
    lilac = np.array([1.0, 0.70, 1.0])
    blue = np.array([1.0, 0.35, 0.18])
    deep = np.array([0.55, 0.10, 0.28])
    e = env_v[..., None]
    face_col = np.where(e < 0.45, pink + (lilac - pink) * (e / 0.45),
                        lilac + (blue - lilac) * np.clip((e - 0.45) / 0.4, 0, 1))
    # bevel edges tilt -> bluer and darker
    tilt = np.clip(1 - nz, 0, 1)[..., None] * 1.5
    face_col = face_col * (1 - np.clip(tilt, 0, 1)) + (blue * 0.9 + deep * 0.1) * np.clip(tilt, 0, 1) * (0.6 + 0.6 * lam[..., None])
    # specular highlights
    Hh = L + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh)
    spec = np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1) ** 60
    face_col = face_col * (0.75 + 0.35 * lam[..., None]) + spec[..., None] * 1.1
    # glossy top streak inside letters
    streak = np.clip(1 - np.abs(yy - 0.38) / 0.05, 0, 1) * (hgt > 0.9)
    face_col += streak[..., None] * 0.18
    face_col = np.clip(face_col, 0, 1.2)
    # ---- glow
    allm = np.maximum(ext, m)
    g1 = cv2.GaussianBlur(allm, (0, 0), 22 * kk * ss)
    g2 = cv2.GaussianBlur(allm, (0, 0), 70 * kk * ss)
    glow_rgb = g1[..., None] * np.array([1.0, 0.25, 0.75]) * 0.9 + g2[..., None] * np.array([1.0, 0.2, 0.55]) * 0.8
    glow_a = np.clip(g1 * 0.9 + g2 * 0.7, 0, 1)
    rgb = glow_rgb.copy()
    a = glow_a.copy()
    # extrusion over glow
    rgb = rgb * (1 - ext[..., None]) + ext_rgb
    a = np.maximum(a, ext)
    rgb = rgb * (1 - rim[..., None]) + rim[..., None] * np.array([0.30, 0.05, 0.12])
    a = np.maximum(a, rim)
    rgb = rgb * (1 - face[..., None]) + face[..., None] * face_col
    a = np.maximum(a, face)
    ys, xs = np.where(a > 0.02)
    sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
    rgb, a, face = rgb[sl], a[sl], face[sl]
    h2, w2 = a.shape
    ds = lambda z: cv2.resize(z, (w2 // ss, h2 // ss), interpolation=cv2.INTER_AREA)
    return ds(rgb.astype(np.float32)), ds(a.astype(np.float32)), ds(face.astype(np.float32))

def build_bg(W, H, seed=3):
    rng = np.random.default_rng(seed)
    base = np.zeros((H, W, 3), np.float32) + np.array([0.075, 0.035, 0.045])  # very dark navy-violet (BGR)
    n = np.zeros((H, W), np.float32)
    for s in (2, 8, 32, 128):
        nn = rng.normal(0, 1, (max(2, H // s), max(2, W // s))).astype(np.float32)
        n += cv2.resize(nn, (W, H), interpolation=cv2.INTER_CUBIC) * (0.6 / math.sqrt(s) + 0.01)
    base += n[..., None] * 0.02
    # paper crease (wiggly vertical line) + scratches
    cr = np.zeros((H, W), np.float32)
    x = W * 0.70
    pts = []
    for y in range(0, H + 20, 20):
        x += rng.normal(0, 3)
        pts.append((int(x), y))
    cv2.polylines(cr, [np.array(pts, np.int32)], False, 1.0, max(1, W // 900), cv2.LINE_AA)
    for _ in range(40):
        x0, y0 = rng.uniform(0, W), rng.uniform(0, H)
        ang = rng.normal(math.pi / 2, 0.3); ln = rng.uniform(10, 80) * W / 1920
        cv2.line(cr, (int(x0), int(y0)), (int(x0 + math.cos(ang) * ln), int(y0 + math.sin(ang) * ln)), float(rng.uniform(0.2, 0.6)), 1, cv2.LINE_AA)
    cr = cv2.GaussianBlur(cr, (0, 0), 0.8) * (0.4 + 0.6 * (rng.random((H, W)) > 0.3))
    base += cr[..., None] * 0.18
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    base *= np.clip(1.15 - 0.55 * r, 0.25, 1.1)[..., None]
    return np.clip(base, 0, 1)

if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    W, H = 1920, 1080
    bg = build_bg(W, H)
    rgb, a, _ = build_logo(1.0, font=sys.argv[1])
    h, w = a.shape
    x0, y0 = (W - w) // 2, (H - h) // 2
    out = bg.copy()
    reg = out[y0:y0 + h, x0:x0 + w]
    out[y0:y0 + h, x0:x0 + w] = reg * (1 - a[..., None]) + rgb
    cv2.imwrite(sys.argv[2], (np.clip(out, 0, 1) * 255).astype(np.uint8))
    print(w, h)
