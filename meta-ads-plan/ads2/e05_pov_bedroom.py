"""E05 · AIA_POV_VID_v1 · 'POV: you made this ad at 2am from your bedroom' · 9:16 · no VO, trending music
Captions: IG-NATIVE (white rounded text boxes). Fast beat-cut showreel of studio + drive AI films."""
from common import *

W, H = 1080, 1920; MOFF = 1.95
beats = [b for b in beat_grid("trendy.mp3", MOFF)]
step = 2   # cut every 2 beats (~0.74s)
cuts = [0.0] + beats[step::step]
CLIPS = [(S["V13"], 3.0, 0.5), (S["V09"], 4.6, 0.5), (S["V11"], 3.5, 0.45), (D("O_BAka.mp4"), 8.0, 0.5), (S["V07"], 1.0, 0.5), (S["V10"], 6.0, 0.5),
         (D("O_IC1N.mp4"), 8.5, 0.5), (S["V12"], 6.6, 0.5), (D("O_9E0I.mp4"), 3.5, 0.55), (D("O_E-mM.mp4"), 6.5, 0.5), (D("A_utOs.mp4"), 5.0, 0.5),
         (S["V08"], 6.0, 0.5), (D("O_uoJa.mp4"), 13.0, 0.5), (S["V02"], 3.5, 0.5), (D("A_5zq.mp4"), 9.0, 0.5), (S["V03"], 8.0, 0.5),
         (D("N_pY4a.mp4"), 6.0, 0.5), (S["V13"], 7.0, 0.5)]
CARD = cuts[len(CLIPS)]; DUR = CARD + 3.8
segs = []
for i, (src, t, fx) in enumerate(CLIPS):
    segs.append(Seg(cuts[i], cuts[i + 1], C(src, t, fx, z=(1.0, 1.08)), ["punch", "whip", "flash", "glitch"][i % 4] if i else "dip"))
lastclip = D("O_9E0I.mp4")
segs.append(Seg(CARD, DUR, (lambda d: (lambda g: (end_over_video(f, i / FPS, ("Make ads like", "this. With AI."), "Enroll now · ₹2,999") for i, f in enumerate(g)))(
    clip(lastclip, 6.0, d, W, H, z=(1.0, 1.1)))), "dip"))
p = cuts
words, chunks, spans = script_words([
    ("POV: you made this ad at 2am from your bedroom", 0.1, p[4]),
    ("no studio. no crew. no budget.", p[4], p[8]),
    ("just a laptop + AI + taste", p[8], p[12]),
    ("clients think you own a production house", p[12], p[15]),
    ("learn the exact workflow, link below", p[15], CARD - 0.05)], hl=["2am", "taste", "production", "house"])
caps = Caps(W, H, words, chunks, "ig", y=1240, spans=spans, maxw=820, show_punct=True)
ovs = [cap_ov(caps, CARD, scrim_b=0.3, strength=0.35)]
audio = dict(music=(MU("trendy.mp3"), MOFF, 0.05, 1.4), sfx=[(SF("ding.mp3"), CARD + 0.3, -8)], music_gain=-5)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_POV_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
