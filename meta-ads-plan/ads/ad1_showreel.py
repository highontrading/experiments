"""Ad 1 · AIA_SHOWREEL_VID_v1 · "None of this was shot." · 9:16, ~17.5 s"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import numpy as np, cv2
import adkit as K

R = os.path.join(os.path.dirname(__file__), "..")
A = lambda *p: os.path.join(R, "assets", *p)
TR = os.path.join(R, "..", "ai-in-advertising-trailer")
OUT = os.path.join(R, "out"); os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
S = {l.split()[0]: A(l.split()[1]) for l in open(A("studio", "index.txt"))}

MUSIC_OFF = 19.237                        # score_v2: drop 1 lands at ad t = 2.0
beat = lambda n: 0.064 + 0.4411 * n - MUSIC_OFF
CARD_T, CARD_D = beat(74), 4.0
DUR = CARD_T + CARD_D

shots = [(0.0, beat(48), dict(src=S["V13"], t=3.6, fx=0.5, z=(1.0, 1.08)))]
plan = [  # (src, in-point, focus-x)
    (S["V10"], 1.05, 0.5), (S["V09"], 8.4, 0.5), (A("drive", "O_BAka.mp4"), 13.2, 0.5), (S["V11"], 4.2, 0.5),
    (S["V08"], 6.1, 0.5), (S["V07"], 1.0, 0.5), (A("drive", "O_9E0I.mp4"), 3.0, 0.58), (S["V12"], 7.0, 0.5),
    (A("drive", "O_E-mM.mp4"), 5.0, 0.55), (S["V14"], 0.0, 0.5), (A("drive", "O_uoJa.mp4"), 9.5, 0.5),
    (S["V11"], 9.4, 0.5), (S["V09"], 14.4, 0.5),
]
for i, (src, t, fx) in enumerate(plan):
    shots.append((beat(48 + 2 * i), beat(50 + 2 * i), dict(src=src, t=t, fx=fx)))

TEXT = [  # (t0, t1, lines, y)
    (0.00, 1.95, [[("None of this", "w")], [("was shot.", "pink")]], 600),
    (1.95, 3.05, [[("No studio.", "w")]], 720),
    (3.05, 4.05, [[("No model.", "w")]], 720),
    (4.05, 5.20, [[("No crew.", "w")]], 720),
    (5.20, 7.95, [[("Just AI", "w")], [("+ direction.", "lime")]], 600),
    (7.95, 10.60, [[("Learn to make", "w")], [("ads like this.", "pink")]], 600),
    (10.60, CARD_T, [[("PRODUCT · BEAUTY · FOOD", "mono")], [("FASHION · UGC · FILM", "mono")]], 700),
]


def thumbs():
    out = []
    for src, t, fx in [(S["V13"], 3.0, 0.5), (S["V09"], 9.0, 0.5), (A("drive", "O_BAka.mp4"), 13.6, 0.5)]:
        out.append(K.decode(src, t, 0.05, 460, 620, fx)[0])
    return out


def frames():
    cache = {}
    for (t0, t1, p) in shots:
        fr = K.shot_full(W, H, p["src"], p["t"], t1 - t0, p["fx"], z=p.get("z", (1.0, 1.06)))
        n = int(round((t1 - t0) * K.FPS))
        for i in range(n):
            t = t0 + i / K.FPS; f = K.scrim(fr[min(i, len(fr) - 1)], top=0.18, bottom=0.25, mid=(0.38, 0.16), strength=0.30)
            for k, (a, b, lines, y) in enumerate(TEXT):
                if a <= t < b:
                    an = min(1.0, (t - a) / 0.18); key = (k, round(an, 2))
                    if key not in cache: cache[key] = K.text_layer(W, H, lines, y, an)
                    f = K.over(f, cache[key])
            yield f
    th = thumbs()
    for i in range(int(round(CARD_D * K.FPS))):
        yield K.endcard_frame(W, H, i / K.FPS, th)


if __name__ == "__main__":
    vid = os.path.join(OUT, "_ad1_video.mp4"); wav = os.path.join(OUT, "_ad1.wav")
    n = K.write_video(vid, frames(), W, H)
    K.mix_audio(wav, DUR, music=(os.path.join(TR, "generated", "music", "score_v2.mp3"), MUSIC_OFF, 0.05, 1.6),
                vo=(os.path.join(R, "build", "vo", "ad1.mp3"), 0.15),
                sfx=[(os.path.join(TR, "generated", "sfx", "boom.mp3"), CARD_T, -6), (os.path.join(TR, "generated", "sfx", "whoosh.mp3"), CARD_T - 0.25, -8)],
                music_gain=-5, vo_gain=2)
    K.mux(vid, wav, os.path.join(OUT, "AIA_SHOWREEL_VID_v1_9x16.mp4"))
    print("frames", n, "dur", round(DUR, 2))
