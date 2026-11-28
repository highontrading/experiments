"""Ad 4 — DREAM. A surreal meadow: a cloud with a retro TV on top, a ladder leaning up to it. Soothing VO with
breathing room, elegant serif captions, drifting pollen, a slow push toward the TV as the raw take becomes the edit."""
import math
import os
import random
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vcomp as V  # noqa: E402

# VO phrases (source start, source end) and where they sit on the timeline
PHRASES = [(0.0, 1.32, 1.0), (1.39, 2.30, 2.55), (2.39, 4.52, 3.75), (4.57, 6.25, 6.9), (6.34, 7.55, 9.0), (7.64, 8.87, 10.5)]


def phrase_words():
    w = V.vo_words("dream")
    out = []
    for (s0, s1, at) in PHRASES:
        ws = [(x[0], x[1] - s0 + at, x[2] - s0 + at) for x in w if s0 - 0.01 <= x[1] < s1]
        out.append(ws)
    return out


def caption_layer(words, t, y=1600):
    """Elegant italic serif caption (wraps to two balanced lines), words fading in on their spoken time."""
    def draw(d, im):
        f = V.font("serif_i", 92)
        sp = d.textlength(" ", font=f)
        widths = [d.textlength(x[0], font=f) for x in words]
        lines = [list(range(len(words)))]
        if sum(widths) + sp * (len(words) - 1) > 920:
            best = None
            for k in range(1, len(words)):
                a_ = sum(widths[:k]) + sp * (k - 1)
                b_ = sum(widths[k:]) + sp * (len(words) - k - 1)
                if best is None or max(a_, b_) < best[0]:
                    best = (max(a_, b_), k)
            lines = [list(range(best[1])), list(range(best[1], len(words)))]
        y0 = y - (len(lines) - 1) * 55
        for li, idx in enumerate(lines):
            tot = sum(widths[i] for i in idx) + sp * (len(idx) - 1)
            x = V.W / 2 - tot / 2
            yy = y0 + li * 110
            for i in idx:
                wd, s0, e0 = words[i]
                a = V.ease((t - s0 + 0.05) / 0.35)
                if a > 0:
                    d.text((x + 3, yy + 4), wd, font=f, fill=(0, 0, 0, int(110 * a)), anchor="lm")
                    d.text((x, yy), wd, font=f, fill=(255, 255, 255, int(255 * a)), anchor="lm")
                x += widths[i] + sp
    return V.text_layer(draw)


def main():
    PW = phrase_words()
    end_vo = PW[-1][-1][2]
    dur = end_vo + 3.0
    n = int(round(dur * V.FPS))
    P = V.Plate("dream")
    scr = list(P.screens.values())[0]
    sx, sy = scr["center"]
    raw = V.Clip("raw", 480, 360, fit="pillar", start=0.8, dur=6)
    edits = [V.Clip(k, 480, 360, fit="pillar", start=s, dur=5) for k, s in (("editorial", 3.9), ("kinetic", 2.4), ("neon", 9.6), ("docu", 7.3))]
    from ad_wall import logo_card
    logo = logo_card(480, 360)
    rnd = random.Random(11)
    pollen = [dict(x=rnd.uniform(0, V.W), y=rnd.uniform(0, V.H), vx=rnd.uniform(-12, 18), vy=rnd.uniform(-22, -6),
                   r=rnd.uniform(1.2, 3.6), a=rnd.uniform(0.35, 0.9), ph=rnd.uniform(0, 6.28)) for _ in range(70)]
    t_edit = PW[2][2][1]  # "edit" in "there is the edit you keep imagining"
    t_vibe = PW[3][0][1]
    end_card = V.text_layer(lambda d, im: (
        d.text((V.W / 2, 1520), "vibe editor", font=V.font("serif_i", 150), fill=(255, 255, 255, 255), anchor="mm"),
        d.text((V.W / 2, 1640), "Describe the vibe. Get the edit.", font=V.font("display", 48), fill=(245, 246, 250, 255), anchor="mm")))
    out = os.path.join(V.ADS, "renders", "ad4-dream-video.mp4")
    wr = V.Writer(out)
    for k in range(n):
        t = k / V.FPS
        canvas = P.img.copy()
        glow = np.zeros_like(canvas)
        if t < t_edit:
            img = V.crt(raw.at(t), scan=0.12)
        elif t < dur - 2.6:
            idx = min(int((t - t_edit) / 1.6), len(edits) - 1)
            img = V.crt(edits[idx].at(t - t_edit), scan=0.12)
            if (t - t_edit) % 1.6 < 0.06 and t - t_edit > 0.1:
                img = img * 0.4 + V.static_noise(360, 480, k) * 0.6
        else:
            img = V.crt(logo, scan=0.1)
        if abs(t - t_edit) < 0.08:
            img = V.static_noise(360, 480, k) * 0.8
        V.place(canvas, scr, img.astype(np.float32), reflect=0.35, glow=glow)
        # slow dreamy push toward the TV on the cloud
        p = V.ease(t / dur)
        zoom = 1.0 + 0.95 * p
        cx = 0.5 * (1 - p) + (sx / P.w) * p
        cy = 0.47 * (1 - p) + (sy / P.h + 0.13) * p
        frame = V.camera(canvas, zoom=zoom, cx=cx, cy=cy)
        g = V.camera(glow, zoom=zoom, cx=cx, cy=cy)
        frame = V.finish(frame, t, grain=0.028, vignette=0.18, bloom=0.22, glowimg=g)
        # drifting pollen / dust motes
        ov = frame
        for q in pollen:
            x = (q["x"] + q["vx"] * t + 14 * math.sin(t * 0.8 + q["ph"])) % V.W
            y = (q["y"] + q["vy"] * t) % V.H
            r = q["r"]
            x0, y0 = int(x - r * 3), int(y - r * 3)
            x1, y1 = int(x + r * 3) + 1, int(y + r * 3) + 1
            if x0 < 0 or y0 < 0 or x1 > V.W or y1 > V.H:
                continue
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
            a = np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2 * r * r))[..., None] * q["a"] * 0.7
            ov[y0:y1, x0:x1] = ov[y0:y1, x0:x1] * (1 - a) + np.array([1.0, 0.97, 0.88], np.float32) * a
        frame = ov
        # soft warm light leak on the vibe line
        if t_vibe - 0.3 < t < t_vibe + 1.6:
            a = math.sin(math.pi * (t - t_vibe + 0.3) / 1.9) * 0.22
            yy = np.linspace(0, 1, V.H, dtype=np.float32)[:, None, None]
            frame = frame + np.array([1.0, 0.75, 0.45], np.float32) * a * np.exp(-((yy - 0.15) / 0.25) ** 2)
        for ws in PW:
            s0, e0 = ws[0][1], ws[-1][2]
            nxt = min([w2[0][1] for w2 in PW if w2[0][1] > s0] + [dur - 2.6])
            if s0 - 0.1 <= t < nxt - 0.05:
                a = 1 - V.ease((t - (nxt - 0.45)) / 0.4)
                frame = V.over(frame, caption_layer(ws, t), alpha=a)
        if t >= dur - 2.6:
            a = V.ease((t - (dur - 2.6)) / 0.6)
            frame = V.over(frame, end_card, alpha=a, dy=(1 - a) * 18)
        if t < 0.5:
            frame = frame * V.ease(t / 0.5) + (1 - V.ease(t / 0.5)) * 0.98
        if t > dur - 0.5:
            frame = frame * V.ease((dur - t) / 0.5)
        wr.write(np.clip(frame, 0, 1))
    wr.close()
    print("WROTE", out, n)


def audio():
    import mix as MX
    PW = phrase_words()
    dur = PW[-1][-1][2] + 3.0
    vo = [("vo-dream.mp3", at, s0, s1 + 0.05, 0) for (s0, s1, at) in PHRASES]
    t_edit = PW[2][2][1]
    sfx = [("sfx-chime.mp3", 0.6, -16), ("sfx-ch-switch.mp3", t_edit, -18), ("sfx-whoosh-soft.mp3", PW[3][0][1] - 0.2, -14),
           ("sfx-chime.mp3", dur - 2.5, -13), ("sfx-boom-soft.mp3", dur - 2.55, -12)]
    wav = MX.mix("ad4-dream", dur, vo=vo, music=("music-dream.mp3", -11, 1.2, 2.0, 0.0),
                 beds=[("sfx-meadow.mp3", 0.0, -20, 1.5)], sfx=sfx, duck_db=-6)
    return MX.mux(os.path.join(V.ADS, "renders", "ad4-dream-video.mp4"), wav, os.path.join(V.OUT, "ads", "ad4-dream.mp4"))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "audio":
        print(audio())
    else:
        main()
