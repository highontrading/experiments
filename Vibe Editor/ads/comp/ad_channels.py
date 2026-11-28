"""Ad 2 — CHANNELS. One CRT on a seamless grey poster; the screen flips through our edits like TV channels,
blue justified captions under the set (poster reference), our logo mark on top, end card on the tube."""
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vcomp as V  # noqa: E402

BLUE = (30, 78, 222)
VO0 = 0.6
SW, SH = 880, 624  # screen content resolution (4:3-ish like the tube)


def build_states():
    w = {k: s + VO0 for k, s, e in [(w_[0].strip(".,").lower(), w_[1], w_[2]) for w_ in V.vo_words("channels")]}
    words = V.vo_words("channels")
    t = [x[1] + VO0 for x in words]
    # word starts: one clip five channels kinetic editorial before and after neon documentary same footage every style vibe editor
    T = dict(one=t[0], five=t[2], kinetic=t[4], editorial=t[5], before=t[6], neon=t[9], docu=t[10], same=t[11],
             vibe=t[15], end=words[-1][2] + VO0)
    S = [
        ("power", 0.0, 0.40, None),
        ("video", 0.40, T["five"] - 0.08, dict(key="raw", start=1.0, osd="CH 00  RAW", cap=("ONE RAW CLIP. NO CUTS, NO CAPTIONS,", "NO MOTION, NO SOUND DESIGN. JUST A TAKE."))),
        ("title", T["five"] - 0.08, T["kinetic"] - 0.1, dict(lines=["REPORT:", "ONE CLIP", "FIVE CHANNELS"], osd="CH 00",
                                                             cap=("HOW ONE RAW CLIP BECOMES FIVE COMPLETELY", "DIFFERENT EDITS WITH VIBE EDITOR"))),
        ("video", T["kinetic"] - 0.1, T["editorial"] - 0.1, dict(key="kinetic", start=2.2, osd="CH 01", cap=("CH 01  KINETIC TYPE. WORDS AROUND AND", "BEHIND YOU. COLOUR-SWAP BACKGROUNDS."))),
        ("video", T["editorial"] - 0.1, T["before"] - 0.1, dict(key="editorial", start=3.9, osd="CH 02", cap=("CH 02  EDITORIAL. GROTESK MEETS RED", "ITALIC SERIF. B-ROLL CARDS. LIGHT LEAKS."))),
        ("video", T["before"] - 0.1, T["neon"] - 0.1, dict(key="split", start=8.2, osd="CH 03", cap=("CH 03  BEFORE AND AFTER. THE RAW TAKE", "AND THE EDIT, PLAYING IN PERFECT SYNC."))),
        ("video", T["neon"] - 0.1, T["docu"] - 0.1, dict(key="neon", start=9.4, osd="CH 04", cap=("CH 04  NEON. DESIGN-TOOL SELECTION", "BOXES, GLOWING SERIF, LIVE COUNTERS."))),
        ("video", T["docu"] - 0.1, T["same"] - 0.08, dict(key="docu", start=7.2, osd="CH 05", cap=("CH 05  DOCUMENTARY. KEYWORD CAPTIONS,", "LINE ICONS, ILLUSTRATED SLIDES."))),
        ("surf", T["same"] - 0.08, T["vibe"] - 0.1, dict(cap=("CAPTIONS. MOTION GRAPHICS. SOUND DESIGN.", "COLOUR. CUTS. ALL FROM ONE RAW CLIP."))),
        ("title", T["vibe"] - 0.1, T["end"] + 2.2, dict(lines=["VIBE", "EDITOR"], osd="CH 99", big=True,
                                                        cap=("EDIT ANY CLIP INTO ANY STYLE.", "DESCRIBE THE VIBE. GET THE EDIT."))),
        ("off", T["end"] + 2.2, T["end"] + 2.55, None),
    ]
    return S, T


def title_card(lines, osd, big=False, t=0.0):
    """Blue CRT title screen with white grotesk type and a green OSD channel number (poster reference)."""
    def draw(d, im):
        d.rectangle([0, 0, SW, SH], fill=(26, 52, 222, 255))
        f = V.font("display_xb", 150 if big else 92)
        fs = V.font("display_xb", 64)
        if big:
            ys = [SH * 0.40, SH * 0.66]
            for ln, yy in zip(lines, ys):
                d.text((SW * 0.5, yy), ln, font=f, fill=(238, 240, 255, 255), anchor="mm")
        else:
            d.text((SW * 0.18, SH * 0.36), lines[0], font=fs, fill=(238, 240, 255, 255), anchor="lm")
            d.text((SW * 0.18, SH * 0.52), lines[1], font=f, fill=(238, 240, 255, 255), anchor="lm")
            d.text((SW * 0.82, SH * 0.69), lines[2], font=f, fill=(238, 240, 255, 255), anchor="rm")
        d.text((SW * 0.07, SH * 0.1), osd, font=V.font("mono", 58), fill=(90, 255, 200, 230), anchor="lm")
    lay = V.text_layer(draw, (SW, SH))
    img = lay[..., :3].copy()
    # soft phosphor bloom on the type
    import cv2
    img = img + cv2.GaussianBlur(img * (img.mean(axis=2, keepdims=True) > 0.6), (0, 0), 6) * 0.35
    return np.clip(img, 0, 1)


def osd_layer(text):
    def draw(d, im):
        d.text((SW * 0.07, SH * 0.1), text, font=V.font("mono", 58), fill=(90, 255, 200, 235), anchor="lm")
    return V.text_layer(draw, (SW, SH))


def mark(d, cx, cy, s, color):
    """Our logo mark: a rounded play triangle inside a tilted orbit ring."""
    from PIL import Image, ImageDraw
    big = Image.new("RGBA", (int(s * 4), int(s * 4)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(big)
    c = s * 2
    bd.ellipse([c - s * 1.7, c - s * 0.62, c + s * 1.7, c + s * 0.62], outline=color, width=max(3, int(s * 0.16)))
    big = big.rotate(28, resample=Image.BICUBIC)
    bd = ImageDraw.Draw(big)
    tri = [(c - s * 0.42, c - s * 0.62), (c - s * 0.42, c + s * 0.62), (c + s * 0.68, c)]
    bd.polygon(tri, fill=color)
    return big


def main():
    S, T = build_states()
    P = V.Plate("channels")
    scr = list(P.screens.values())[0]
    dur = S[-1][2]
    n = int(round(dur * V.FPS))
    # poster type layers in plate space (moves with the camera push)
    PW, PH = P.w, P.h
    from PIL import Image

    def cap_layer(cap):
        def draw(d, im):
            f = V.font("display", 40)
            V.justify(d, cap[0], 180, PW - 180, 1785, f, BLUE + (255,))
            V.justify(d, cap[1], 180, PW - 180, 1840, f, BLUE + (255,))
        return V.text_layer(draw, (PW, PH))

    def frame_layer(d, im):
        m = mark(d, 0, 0, 46, BLUE + (255,))
        im.alpha_composite(m, (int(PW / 2 - m.width / 2), int(330 - m.height / 2)))
        d.text((PW / 2, 2010), "vibe editor", font=V.font("display_xb", 64), fill=BLUE + (255,), anchor="mm")
    static_layer = V.text_layer(frame_layer, (PW, PH))
    caps = {}
    osds = {}
    titles = {}
    clips = {}
    surf_keys = ["kinetic", "editorial", "neon", "docu", "optimized", "split", "kinetic_hi", "neon_hi", "docu_hi", "editorial_hi"]
    for (kind, a, b, cfg) in S:
        if cfg and "cap" in cfg:
            caps[cfg["cap"]] = cap_layer(cfg["cap"])
        if kind == "video":
            clips[cfg["key"]] = V.Clip(cfg["key"], SW, SH, fit="pillar", start=cfg["start"], dur=8)
            osds[cfg["osd"]] = osd_layer(cfg["osd"])
        if kind == "title":
            titles[tuple(cfg["lines"])] = title_card(cfg["lines"], cfg["osd"], cfg.get("big", False))
    for k in surf_keys:
        clips.setdefault(k, V.Clip(k, SW, SH, fit="pillar", start=2.0 + (surf_keys.index(k) * 1.7) % 8, dur=4))
    out = os.path.join(V.ADS, "renders", "ad2-channels-video.mp4")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    wr = V.Writer(out)
    switches = [a for (kind, a, b, cfg) in S if kind in ("video", "title", "surf")]
    prev_cap = None
    for k in range(n):
        t = k / V.FPS
        canvas = P.img.copy()
        cur = next(s for s in S if s[1] <= t < s[2]) if t < dur else S[-1]
        kind, a, b, cfg = cur
        lt = t - a
        if kind == "power":
            img = np.zeros((SH, SW, 3), np.float32)
            p = V.ease_out(lt / 0.4)
            hh = max(2, int(SH * p * p))
            ww = int(SW * min(1, p * 2.2))
            y0 = SH // 2 - hh // 2
            img[y0:y0 + hh, SW // 2 - ww // 2:SW // 2 + ww // 2] = 0.95
        elif kind == "off":
            img = titles[("VIBE", "EDITOR")].copy()
            p = V.ease(lt / 0.35)
            sq = max(0.004, 1 - p)
            hh = max(2, int(SH * sq))
            out_img = np.zeros_like(img)
            import cv2
            small = cv2.resize(img, (SW, hh)) * (1 + p * 1.5)
            out_img[SH // 2 - hh // 2:SH // 2 - hh // 2 + hh] = small
            img = out_img
        elif kind == "video":
            img = V.crt(clips[cfg["key"]].at(lt))
            img = V.over(img, osds[cfg["osd"]], alpha=1.0 if lt < 1.6 else max(0, 1 - (lt - 1.6) / 0.3))
        elif kind == "title":
            img = V.crt((titles[tuple(cfg["lines"])] * 255).astype(np.uint8), scan=0.12, blur=0.8)
        else:  # channel surfing montage
            idx = int(lt / 0.26) % len(surf_keys)
            img = V.crt(clips[surf_keys[idx]].at(lt))
            if (lt % 0.26) < 0.05:
                img = V.static_noise(SH, SW, k)
        # static burst at each channel change
        for s0 in switches:
            if 0 <= t - s0 < 0.1 and s0 > 0.5:
                img = V.static_noise(SH, SW, k) * 0.85 + img * 0.15
        img = img * (0.97 + 0.03 * math.sin(t * 50))  # tiny CRT flicker
        V.place(canvas, scr, img.astype(np.float32), reflect=0.35)
        # type on the poster
        canvas = V.over(canvas, static_layer)
        if cfg and "cap" in cfg:
            fade = V.ease((lt - 0.1) / 0.2)
            canvas = V.over(canvas, caps[cfg["cap"]], alpha=fade)
            if prev_cap is not None and prev_cap is not caps[cfg["cap"]] and lt < 0.12:
                canvas = V.over(canvas, prev_cap, alpha=1 - V.ease(lt / 0.12))
        if cfg and "cap" in cfg and lt >= 0.25:
            prev_cap = caps[cfg["cap"]]
        zoom = 1.0 + 0.075 * V.ease(t / dur)
        frame = V.camera(canvas, zoom=zoom, cx=0.5, cy=0.49)
        wr.write(V.finish(frame, t, grain=0.018, vignette=0.12))
    wr.close()
    print("WROTE", out, n, "frames")


if __name__ == "__main__" and len(sys.argv) == 1:
    main()


def audio():
    import mix as MX
    S, T = build_states()
    dur = S[-1][2]
    sfx = [("sfx-crt-on.mp3", 0.12, -7)]
    for (kind, a, b, cfg) in S:
        if kind in ("video", "title", "surf") and a > 0.5:
            sfx.append(("sfx-ch-switch.mp3", a + 0.03, -9))
        if kind == "surf":
            t = a + 0.26
            while t < b - 0.1:
                sfx.append(("sfx-remote.mp3", t, -15))
                t += 0.26
    sfx += [("sfx-boom-soft.mp3", T["vibe"] + 0.02, -7), ("sfx-chime.mp3", T["vibe"] + 0.25, -14), ("sfx-crt-off.mp3", dur - 0.3, -8)]
    wav = MX.mix("ad2-channels", dur, vo=[("vo-channels.mp3", VO0, 0, None, 0)],
                 music=("music-channels.mp3", -15, 1.0, 1.4, 0.0), beds=[("sfx-crt-hum.mp3", 0.0, -27, 1.0)], sfx=sfx)
    os.makedirs(os.path.join(V.OUT, "ads"), exist_ok=True)
    return MX.mux(os.path.join(V.ADS, "renders", "ad2-channels-video.mp4"), wav, os.path.join(V.OUT, "ads", "ad2-channels.mp4"))


if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "audio":
    print(audio())
