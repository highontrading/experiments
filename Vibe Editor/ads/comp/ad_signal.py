"""Ad 1 — SIGNAL. A dark den of glowing CRTs and floating app icons around a creator in a chair; the feeds
demand "Reels. Shorts. Stories. Ads."; every screen turns into Vibe Editor; we push into the centre TV for
"one raw clip in, scroll-stopping edits out"; end card."""
import math
import os
import random
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vcomp as V  # noqa: E402

VO0 = 0.9
KEYS = ["kinetic", "editorial", "neon", "docu", "optimized", "split", "kinetic_hi", "editorial_hi", "neon_hi", "docu_hi"]


def times():
    w = V.vo_words("signal")
    s = [x[1] + VO0 for x in w]
    e = [x[2] + VO0 for x in w]
    # Every feed wants something new. Every single day. Reels. Shorts. Stories. Ads. You don't need more hours.
    # You need Vibe Editor. One raw clip in. Scroll-stopping edits out.
    return dict(start=s[0], day=s[5], reels=s[8], shorts=s[9], stories=s[10], ads=s[11], dont=s[12], need=s[17],
                vibe=s[19], one=s[21], scroll=s[25], out_end=e[27], end=e[-1])


def icon_sprites(path):
    """Split the icon layer into connected components so each icon floats on its own."""
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    im = cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA).astype(np.float32) / (65535.0 if im.dtype == np.uint16 else 255.0)
    a = (im[..., 3] > 0.03).astype(np.uint8)
    a = cv2.dilate(a, np.ones((9, 9), np.uint8))
    nlab, lab, stats, cents = cv2.connectedComponentsWithStats(a)
    sprites = []
    rnd = random.Random(2)
    for i in range(1, nlab):
        x, y, w, h, area = stats[i]
        if area < 400:
            continue
        pad = 20
        x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(im.shape[1], x + w + pad), min(im.shape[0], y + h + pad)
        patch = im[y0:y1, x0:x1].copy()
        patch[..., 3] *= (lab[y0:y1, x0:x1] == i)
        sprites.append(dict(patch=patch, x=x0, y=y0, ph=rnd.uniform(0, 6.28), f=rnd.uniform(0.25, 0.45), amp=rnd.uniform(8, 18)))
    return sprites


def paste_rgba(canvas, patch, x, y, scale=1.0, rot=0.0):
    if scale != 1.0 or rot:
        h, w = patch.shape[:2]
        M = cv2.getRotationMatrix2D((w / 2, h / 2), rot, scale)
        patch = cv2.warpAffine(patch, M, (w, h), flags=cv2.INTER_LINEAR)
    h, w = patch.shape[:2]
    x, y = int(round(x)), int(round(y))
    X0, Y0 = max(0, x), max(0, y)
    X1, Y1 = min(canvas.shape[1], x + w), min(canvas.shape[0], y + h)
    if X1 <= X0 or Y1 <= Y0:
        return
    p = patch[Y0 - y:Y1 - y, X0 - x:X1 - x]
    a = p[..., 3:4]
    c = canvas[Y0:Y1, X0:X1]
    c[..., :3] = c[..., :3] * (1 - a) + p[..., :3] * a
    c[..., 3:4] = c[..., 3:4] + a * (1 - c[..., 3:4])


def word_layer(text, size=230, y=1500, color=(255, 255, 255)):
    def draw(d, im):
        f = V.font("display_xb", size)
        for off, a in ((12, 120), (6, 120)):
            d.text((V.W / 2, y + off), text, font=f, fill=(0, 0, 0, a), anchor="mm")
        d.text((V.W / 2, y), text, font=f, fill=color + (255,), anchor="mm")
    return V.text_layer(draw)


def main():
    T = times()
    dur = T["end"] + 2.6
    n = int(round(dur * V.FPS))
    P = V.Plate("signal")
    icons = icon_sprites(os.path.join(V.ADS, "blender", "signal_icons", "plate", "beauty_0001.png"))
    rnd = random.Random(7)
    small = {k: V.Clip(k, 200, 150, fit="crop", focus=0.32) for k in KEYS}
    logo_s = None
    hero = min(P.screens, key=lambda k: math.dist(P.screens[k]["center"], (P.w / 2, P.h * 0.36)) if P.screens[k]["on"] else 1e9)
    hx, hy = P.screens[hero]["center"]
    assign = {name: (rnd.choice(KEYS), rnd.uniform(0, 9), rnd.uniform(0, 0.6)) for name in P.screens}
    big_raw = V.Clip("raw", 1080, 1920, fit="crop", start=1.0, dur=4)
    big = {k: V.Clip(k, 1080, 1920, fit="crop", start=s, dur=3) for k, s in
           (("kinetic", 2.4), ("editorial", 3.9), ("neon", 9.6), ("docu", 7.3), ("split", 8.0), ("optimized", 2.6))}
    from ad_wall import logo_card
    logo_s = logo_card(200, 150)
    words = [(T["reels"], "Reels."), (T["shorts"], "Shorts."), (T["stories"], "Stories."), (T["ads"], "Ads.")]
    wl = {w: word_layer(w) for _, w in words}
    hours = word_layer("more hours?", 120, 1500, (235, 235, 240))
    lock = V.text_layer(lambda d, im: (
        d.text((V.W / 2, 860), "vibe editor", font=V.font("display_xb", 150), fill=(255, 255, 255, 255), anchor="mm"),
        d.text((V.W / 2, 1000), "One raw clip in.", font=V.font("display", 62), fill=(225, 228, 240, 255), anchor="mm"),
        d.text((V.W / 2, 1080), "Scroll-stopping edits out.", font=V.font("display", 62), fill=(225, 228, 240, 255), anchor="mm"),
        d.rounded_rectangle([V.W / 2 - 230, 1200, V.W / 2 + 230, 1300], 50, fill=(255, 255, 255, 255)),
        d.text((V.W / 2, 1250), "Try Vibe Editor", font=V.font("display_xb", 46), fill=(10, 10, 12, 255), anchor="mm")))
    in_lock = V.text_layer(lambda d, im: (
        d.text((V.W / 2, 1560), "vibe editor", font=V.font("display_xb", 120), fill=(255, 255, 255, 255), anchor="mm")))
    out = os.path.join(V.ADS, "renders", "ad1-signal-video.mp4")
    wr = V.Writer(out)
    t_push = T["one"] - 0.6
    for k in range(n):
        t = k / V.FPS
        canvas = P.img.copy()
        glow = np.zeros_like(canvas)
        for name, s in P.screens.items():
            if not s["on"]:
                continue
            key, off, delay = assign[name]
            on_t = T["start"] - 0.5 + delay
            if t < on_t:
                img = np.full((150, 200, 3), 0.02, np.float32)
            elif T["dont"] - 0.05 <= t < T["need"] - 0.05:  # "you don't need more hours" -> dead air static
                img = V.static_noise(150, 200, k + int(off * 7)) * 0.55
            elif T["need"] - 0.05 <= t:
                img = V.crt(logo_s, scan=0.12)
                if t - T["need"] < 0.1:
                    img = V.static_noise(150, 200, k) * 0.8
            else:
                beat = sum(1 for (ts, _) in words if t >= ts)
                kk = KEYS[(KEYS.index(key) + beat * 3) % len(KEYS)]
                img = V.crt(small[kk].at(t + off))
                if t - on_t < 0.1 or any(0 <= t - ts < 0.07 for (ts, _) in words):
                    img = V.static_noise(150, 200, k + int(off * 7)) * 0.7 + img * 0.3
            V.place(canvas, s, img.astype(np.float32), reflect=0.28, glow=glow)
        # camera: slow push through the den, then a dive into the hero TV
        base_zoom = 1.0 + 0.10 * V.ease(t / t_push)
        if t < t_push:
            zoom, cx, cy = base_zoom, 0.5, 0.47
        else:
            p = V.ease((t - t_push) / 0.75)
            zoom = 1.10 + p * 4.2
            cx = 0.5 * (1 - p) + (hx / P.w) * p
            cy = 0.47 * (1 - p) + (hy / P.h) * p
        frame = V.camera(canvas, zoom=zoom, cx=cx, cy=cy)
        g = V.camera(glow, zoom=zoom, cx=cx, cy=cy)
        # icons: their own float + stronger parallax than the wall
        pl = np.zeros((P.h, P.w, 4), np.float32)
        pulse = 1.0 + 0.06 * sum(math.exp(-((t - ts) / 0.12) ** 2) for (ts, _) in words)
        for sp in icons:
            bob = math.sin(t * 2 * math.pi * sp["f"] + sp["ph"]) * sp["amp"]
            paste_rgba(pl, sp["patch"], sp["x"], sp["y"] + bob, scale=pulse, rot=math.sin(t * 0.9 + sp["ph"]) * 3)
        iz = 1.0 + (zoom - 1.0) * 1.35
        icon_l = V.camera(pl, zoom=iz, cx=cx, cy=cy)
        frame = frame * (1 - icon_l[..., 3:4]) + icon_l[..., :3] * icon_l[..., 3:4]
        frame = V.finish(frame, t, grain=0.035, vignette=0.28, bloom=0.32, glowimg=g)
        # the dive lands inside the TV: full-frame raw clip, then the edits rapid-fire
        if t >= t_push + 0.55:
            lt = t - (t_push + 0.55)
            if t < T["scroll"] - 0.05:
                full = V.crt(big_raw.at(lt), scan=0.08, blur=0.4)
            else:
                order = ["kinetic", "editorial", "neon", "docu", "split", "optimized"]
                st = t - (T["scroll"] - 0.05)
                kk = order[min(int(st / 0.32), len(order) - 1)]
                full = V.crt(big[kk].at(st), scan=0.08, blur=0.4)
            a = V.ease((t - t_push - 0.55) / 0.2)
            frame = frame * (1 - a) + full * a
            if t < T["scroll"] - 0.05:
                frame = V.over(frame, word_layer("RAW", 90, 260, (255, 255, 255)), alpha=a)
        for (ts, w) in words:
            nxt = min([s_ for (s_, _) in words if s_ > ts] + [T["dont"] - 0.1])
            if ts <= t < nxt:
                pr = V.ease_out((t - ts) / 0.18)
                frame = V.over(frame, wl[w], alpha=pr, dy=(1 - pr) * 40)
        if T["dont"] <= t < T["need"] - 0.05:
            frame = V.over(frame, hours, alpha=V.ease((t - T["dont"] - 0.35) / 0.2))
        if T["need"] <= t < t_push:
            frame = V.over(frame, in_lock, alpha=V.ease((t - T["vibe"] + 0.1) / 0.25))
        if t >= T["out_end"] + 0.15:  # end card
            a = V.ease((t - T["out_end"] - 0.15) / 0.35)
            frame = frame * (1 - 0.8 * a)
            frame = V.over(frame, lock, alpha=a, dy=(1 - a) * 20)
        if t < 0.35:
            frame = frame * V.ease(t / 0.35)
        if t > dur - 0.35:
            frame = frame * V.ease((dur - t) / 0.35)
        wr.write(frame)
    wr.close()
    print("WROTE", out, n)


def audio():
    import mix as MX
    T = times()
    dur = T["end"] + 2.6
    sfx = [("sfx-crt-on.mp3", T["start"] - 0.4, -8)]
    for ts in (T["reels"], T["shorts"], T["stories"], T["ads"]):
        sfx += [("sfx-ch-switch.mp3", ts, -13), ("sfx-pop-ui.mp3", ts + 0.03, -9)]
    sfx += [("sfx-static-tail.mp3", T["dont"], -14), ("sfx-boom-soft.mp3", T["need"], -8),
            ("sfx-whoosh-soft.mp3", T["one"] - 0.25, -6), ("sfx-ch-switch.mp3", T["scroll"], -12),
            ("sfx-chime.mp3", T["out_end"] + 0.2, -14)]
    wav = MX.mix("ad1-signal", dur, vo=[("vo-signal.mp3", VO0, 0, None, 0)], music=("music-signal.mp3", -14, 0.8, 1.5, 0.0),
                 beds=[("sfx-crt-hum.mp3", 0.0, -24, 1.0)], sfx=sfx)
    return MX.mux(os.path.join(V.ADS, "renders", "ad1-signal-video.mp4"), wav, os.path.join(V.OUT, "ads", "ad1-signal.mp4"))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "audio":
        print(audio())
    else:
        main()
