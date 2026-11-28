"""Ad 3 — THE WALL. One TV plays the raw take; on "edited a hundred different ways" the wall lights up screen by
screen with different edits while the camera pulls back; stat type; one screen chosen; every screen shows the logo."""
import math
import os
import random
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vcomp as V  # noqa: E402

VO0 = 0.4
HERO = "SCR_r3_237"
KEYS = ["kinetic", "editorial", "neon", "docu", "optimized", "split", "kinetic_hi", "editorial_hi", "neon_hi", "docu_hi",
        "optimized_hi", "split_hi"]


def times():
    w = V.vo_words("wall")
    s = [x[1] + VO0 for x in w]
    # This is one video. Shot once. Edited a hundred different ways. Ninety-plus effects. Forty-seven caption styles.
    # Thirty-six looks. Find the edit that sells. Vibe Editor.
    return dict(edited=s[6], ninety=s[11], fortyseven=s[13], thirtysix=s[16], find=s[18], vibe=s[23], end=w[-1][2] + VO0)


def logo_card(w, h):
    def draw(d, im):
        d.rectangle([0, 0, w, h], fill=(26, 52, 222, 255))
        f = V.font("display_xb", int(h * 0.3))
        d.text((w / 2, h * 0.36), "VIBE", font=f, fill=(240, 242, 255, 255), anchor="mm")
        d.text((w / 2, h * 0.68), "EDITOR", font=f, fill=(240, 242, 255, 255), anchor="mm")
    return (V.text_layer(draw, (w, h))[..., :3] * 255).astype(np.uint8)


def stat_layer(num, label, prog):
    def draw(d, im):
        n = int(round(num * V.ease_out(prog)))
        txt = f"{n}+" if label == "EFFECTS" else f"{n}"
        f = V.font("display_xb", 300)
        for off, a in ((10, 140), (5, 110)):
            d.text((V.W / 2, 860 + off), txt, font=f, fill=(0, 0, 0, a), anchor="mm")
        d.text((V.W / 2, 860), txt, font=f, fill=(255, 255, 255, 255), anchor="mm")
        fl = V.font("display_xb", 70)
        d.text((V.W / 2, 1050 + 6), label, font=fl, fill=(0, 0, 0, 150), anchor="mm")
        d.text((V.W / 2, 1050), label, font=fl, fill=(255, 255, 255, 255), anchor="mm")
    return V.text_layer(draw)


def main():
    T = times()
    dur = T["end"] + 2.3
    n = int(round(dur * V.FPS))
    Pw = V.Plate("wall")
    Pc = V.Plate("wall_close")
    rnd = random.Random(4)
    # small decoded copies for wall screens, a big one for the hero
    small = {k: V.Clip(k, 200, 150, fit="crop", focus=0.32, start=0.0) for k in KEYS}
    raw_big = V.Clip("raw", 720, 540, fit="pillar", start=1.0, dur=6)
    hero_big = V.Clip("kinetic", 720, 540, fit="pillar", start=2.2, dur=6)
    pick_big = V.Clip("optimized", 300, 225, fit="crop", focus=0.3, start=2.6, dur=6)
    logo_s = logo_card(200, 150)
    logo_b = logo_card(720, 540)
    assign = {}
    hx, hy = Pw.screens[HERO]["center"]
    maxd = max(math.dist((hx, hy), s["center"]) for s in Pw.screens.values())
    for name, s in Pw.screens.items():
        assign[name] = (rnd.choice(KEYS), rnd.uniform(0, 9), math.dist((hx, hy), s["center"]) / maxd)
    hero_close = min(Pc.screens, key=lambda k: math.dist(Pc.screens[k]["center"], (Pc.w / 2, Pc.h / 2)))
    stats = [(T["ninety"], 90, "EFFECTS"), (T["fortyseven"], 47, "CAPTION STYLES"), (T["thirtysix"], 36, "LOOKS")]
    out = os.path.join(V.ADS, "renders", "ad3-wall-video.mp4")
    wr = V.Writer(out)
    lockup = V.text_layer(lambda d, im: (
        d.text((V.W / 2, 1530), "vibe editor", font=V.font("display_xb", 110), fill=(255, 255, 255, 255), anchor="mm"),
        d.text((V.W / 2, 1640), "One clip. Endless edits.", font=V.font("display", 50), fill=(225, 228, 240, 255), anchor="mm")))
    cut = T["edited"]
    for k in range(n):
        t = k / V.FPS
        if t < cut:  # close-up on the hero TV playing the raw take
            canvas = Pc.img.copy()
            glow = np.zeros_like(canvas)
            for name, s in Pc.screens.items():
                if name == hero_close:
                    img = V.crt(raw_big.at(t))
                    if t < 0.25:
                        img = img * V.ease(t / 0.25)
                else:
                    img = np.full((150, 200, 3), 0.025, np.float32) + V.static_noise(150, 200, k + len(name)) * 0.05
                V.place(canvas, s, img, reflect=0.3, glow=glow)
            zoom = 1.0 + 0.10 * V.ease(t / cut)
            frame = V.camera(canvas, zoom=zoom, cx=0.5, cy=0.5)
            g = V.camera(glow, zoom=zoom, cx=0.5, cy=0.5)
            frame = V.finish(frame, t, grain=0.03, vignette=0.25, bloom=0.35, glowimg=g)
        else:
            canvas = Pw.img.copy()
            glow = np.zeros_like(canvas)
            lt = t - cut
            for name, s in Pw.screens.items():
                if not s["on"]:
                    continue
                key, off, dist = assign[name]
                on_t = 0.12 + dist * 1.3
                if name == HERO:
                    on_t = 0.0
                if t >= T["vibe"] - 0.05:  # every screen shows the logo
                    img = V.crt(logo_b if name == HERO else logo_s, scan=0.12)
                    if t - T["vibe"] < 0.12:
                        img = V.static_noise(*img.shape[:2], k)
                elif lt < on_t:
                    img = np.full((150, 200, 3), 0.02, np.float32)
                else:
                    if name == HERO:
                        img = V.crt(pick_big.at(lt)) if t >= T["find"] - 0.1 else V.crt(hero_big.at(lt))
                    else:
                        # re-shuffle content on each stat beat
                        shuffle = sum(1 for (ts, _, _) in stats if t >= ts)
                        kk = KEYS[(KEYS.index(key) + shuffle * 5) % len(KEYS)]
                        img = V.crt(small[kk].at(lt + off))
                    if lt - on_t < 0.08 or any(0 <= t - ts < 0.06 for (ts, _, _) in stats):
                        img = V.static_noise(*img.shape[:2], k + int(off * 10)) * 0.8 + img * 0.2
                    if T["find"] <= t < T["vibe"] - 0.05 and name != HERO:
                        img = img * (1 - 0.72 * V.ease((t - T["find"]) / 0.35))
                V.place(canvas, s, img.astype(np.float32), reflect=0.3, glow=glow)
            # camera: pull back from the hero screen to the full wall, then a slow push
            p = V.ease((lt) / 2.6)
            zoom = 2.6 + (1.0 - 2.6) * p
            cx = (hx / Pw.w) * (1 - p) + 0.5 * p
            cy = (hy / Pw.h) * (1 - p) + 0.47 * p
            if lt > 2.6:
                zoom = 1.0 + 0.05 * V.ease((lt - 2.6) / (dur - cut - 2.6))
            frame = V.camera(canvas, zoom=zoom, cx=cx, cy=cy)
            g = V.camera(glow, zoom=zoom, cx=cx, cy=cy)
            frame = V.finish(frame, t, grain=0.03, vignette=0.25, bloom=0.3, glowimg=g)
            for (ts, num, label) in stats:
                nxt = min([s_ for (s_, _, _) in stats if s_ > ts] + [T["find"]])
                if ts <= t < nxt:
                    a = V.ease((t - ts) / 0.15) * (1 - V.ease((t - nxt + 0.15) / 0.15))
                    frame = V.over(frame, stat_layer(num, label, (t - ts) / 0.5), alpha=a, dy=(1 - V.ease_out((t - ts) / 0.3)) * 30)
            if t >= T["vibe"]:
                a = V.ease((t - T["vibe"] - 0.3) / 0.4)
                dark = np.zeros_like(frame)
                frame = frame * (1 - 0.35 * a) + dark * 0.35 * a
                frame = V.over(frame, lockup, alpha=a, dy=(1 - a) * 20)
        if t < 0.3:
            frame = frame * V.ease(t / 0.3)
        if t > dur - 0.4:
            frame = frame * V.ease((dur - t) / 0.4)
        wr.write(frame)
    wr.close()
    print("WROTE", out, n)


def audio():
    import mix as MX
    T = times()
    dur = T["end"] + 2.3
    sfx = [("sfx-crt-on.mp3", 0.15, -10), ("sfx-whoosh-soft.mp3", T["edited"], -8), ("sfx-ch-switch.mp3", T["edited"] + 0.05, -10)]
    for s in (T["ninety"], T["fortyseven"], T["thirtysix"]):
        sfx += [("sfx-ch-switch.mp3", s, -14), ("sfx-pop-ui.mp3", s + 0.05, -10)]
    sfx += [("sfx-riser-soft.mp3", T["find"] + 1.0, -12), ("sfx-boom-soft.mp3", T["vibe"], -6), ("sfx-chime.mp3", T["vibe"] + 0.35, -14)]
    wav = MX.mix("ad3-wall", dur, vo=[("vo-wall.mp3", VO0, 0, None, 0)], music=("music-wall.mp3", -14, 0.6, 1.5, 0.0),
                 beds=[("sfx-crt-hum.mp3", 0.0, -24, 1.0)], sfx=sfx)
    return MX.mux(os.path.join(V.ADS, "renders", "ad3-wall-video.mp4"), wav, os.path.join(V.OUT, "ads", "ad3-wall.mp4"))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "audio":
        print(audio())
    else:
        main()
