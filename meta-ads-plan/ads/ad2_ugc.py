"""Ad 2 · AIA_AIUGC_VID_v1 · "This creator doesn't exist." · 9:16, ~18.6 s"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import adkit as K

R = os.path.join(os.path.dirname(__file__), "..")
A = lambda *p: os.path.join(R, "assets", *p)
TR = os.path.join(R, "..", "ai-in-advertising-trailer")
OUT = os.path.join(R, "out"); os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
S = {l.split()[0]: A(l.split()[1]) for l in open(A("studio", "index.txt"))}
D = lambda n: A("drive", n)

CARD_T, CARD_D = 14.6, 4.0
DUR = CARD_T + CARD_D
SHOTS = [  # (t0, t1, kind, args)
    (0.0, 3.3, "full", (S["V03"], 0.3, 0.5)),
    (3.3, 6.2, "stack", ((D("O_IC1N.mp4"), 0.5, 0.42), (D("O_IC1N.mp4"), 6.4, 0.55))),        # same AI creator, two scenes
    (6.2, 9.0, "grid", [(S["V02"], 0.3, 0.42), (S["V04"], 4.2, 0.5), (D("O_vlog_prompt.mp4"), 1.6, 0.55), (D("O_F3kR.mp4"), 4.5, 0.45)]),
    (9.0, 11.4, "full", (S["V03"], 10.4, 0.5)),
    (11.4, CARD_T, "stack", ((S["V02"], 3.4, 0.5), (D("O_vlog_prompt.mp4"), 4.6, 0.5))),
]
TEXT = [
    (0.00, 1.95, [[("This creator", "w")], [("doesn't exist.", "pink")]], 560),
    (1.95, 3.30, [[("Neither did", "w")], [("this shoot.", "lime")]], 560),
    (3.30, 6.20, [[("Same face.", "w")], [("Every video.", "pink")]], 800),
    (6.20, 9.00, [[("Reviews. Hauls.", "w")], [("Unboxings. Vlogs.", "lime")]], 800),
    (9.00, 11.40, [[("All made", "w")], [("with AI.", "pink")]], 560),
    (11.40, CARD_T, [[("Make UGC ads", "w")], [("without creators.", "lime")]], 800),
]


def shot(kind, a, dur):
    if kind == "full": return K.shot_full(W, H, a[0], a[1], dur, a[2])
    if kind == "stack": return K.shot_stack(W, H, a[0], a[1], dur)
    return K.shot_grid(W, H, a, dur)


def frames():
    cache = {}
    for t0, t1, kind, a in SHOTS:
        fr = shot(kind, a, t1 - t0); n = int(round((t1 - t0) * K.FPS))
        for i in range(n):
            t = t0 + i / K.FPS; f = fr[min(i, len(fr) - 1)]
            if kind == "full": f = K.scrim(f, top=0.18, bottom=0.25, strength=0.35)
            for k, (b0, b1, lines, y) in enumerate(TEXT):
                if b0 <= t < b1:
                    an = min(1.0, (t - b0) / 0.18); key = (k, round(an, 2))
                    if key not in cache: cache[key] = K.text_layer(W, H, lines, y, an)
                    f = K.over(f, cache[key])
            yield f
    th = [K.decode(S["V03"], 1.0, 0.05, 460, 620)[0], K.decode(D("O_IC1N.mp4"), 1.0, 0.05, 460, 620, 0.42)[0],
          K.decode(S["V02"], 0.3, 0.05, 460, 620, 0.42)[0]]
    for i in range(int(round(CARD_D * K.FPS))):
        yield K.endcard_frame(W, H, i / K.FPS, th, headline=("Make UGC ads,", "without creators."))


if __name__ == "__main__":
    vid = os.path.join(OUT, "_ad2_video.mp4"); wav = os.path.join(OUT, "_ad2.wav")
    n = K.write_video(vid, frames(), W, H)
    K.mix_audio(wav, DUR, music=(os.path.join(TR, "generated", "music", "score_v2.mp3"), 12.86, 0.3, 1.6),
                vo=(os.path.join(R, "build", "vo", "ad2.mp3"), 0.15),
                sfx=[(os.path.join(TR, "generated", "sfx", "whoosh.mp3"), CARD_T - 0.25, -8), (os.path.join(TR, "generated", "sfx", "boom.mp3"), CARD_T, -8)],
                music_gain=-8, vo_gain=2)
    K.mux(vid, wav, os.path.join(OUT, "AIA_AIUGC_VID_v1_9x16.mp4"))
    print("frames", n, "dur", DUR)
