"""E02 · AIA_PROMPT2AD_VID_v1 · 'This ad started as one sentence.' · 9:16 · no VO, music + typing SFX
Captions: MONO typewriter (prompt-box UI). Three prompts -> three studio outputs -> 'Direction is the skill.'"""
from common import *

W, H = 1080, 1920
PROMPTS = [
    ("Golden hair-mask jar floating above the clouds, model seated on the lid, lemon slices falling, editorial light", S["V13"], 0.6),
    ("Macro: glitter lip gloss, chrome tube, flash photography, wet shine", S["V10"], 3.2),
    ("Lemonade can on a beach table, volleyball behind, golden hour, then a guy takes a sip", S["V11"], 0.3),
]
TYPE, GEN, SHOW = [2.6, 2.0, 2.2], 0.7, 2.3
HOOK = 2.3
segs, ovs, sfx = [], [], []
t = 0.0
segs.append(Seg(0, HOOK, C(S["V13"], 3.5, 0.5, z=(1.0, 1.1)), "dip")); t = HOOK
blocks = []
for k, (p, src, tin) in enumerate(PROMPTS):
    bg = (cv2.GaussianBlur(frame_at(src, tin + 1.0, W, H), (0, 0), 30) * 0.35).astype(np.uint8)
    t0 = t; t1 = t0 + TYPE[k] + GEN; segs.append(Seg(t0, t1, (lambda b: (lambda d: still(b, d, (1.0, 1.04))))(bg), "flash" if k else "whip"))
    segs.append(Seg(t1, t1 + SHOW, C(src, tin, 0.5, z=(1.04, 1.12)), "flash"))
    blocks.append((t0, t0 + TYPE[k], t1, t1 + SHOW, p, k)); sfx += [(SF("typing.mp3"), t0 + 0.1, -10), (SF("pop.mp3"), t0 + TYPE[k], -6), (SF("zap.mp3"), t1 - 0.1, -10)]
    t = t1 + SHOW
OUTRO = t
segs += seq(OUTRO, [(0.75, C(S["V09"], 5.0, 0.5)), (0.75, C(S["V12"], 2.0, 0.5)), (0.75, C(S["V07"], 1.5, 0.5)), (1.25, C(S["V08"], 5.5, 0.5))], "flash")[0]
CARD = OUTRO + 3.5; DUR = CARD + 3.6
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V10"], 5.0, 0.5), (S["V11"], 4.0, 0.45)], 400, 560)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_dark(W, H, k, thumbs, headline=("The prompt is easy.", "Direction is", "the skill."), accent=LIME)))

words, chunks, spans = script_words([("This ad started as one sentence.", 0.25, HOOK - 0.05),
                                     ("The prompt is the easy part.", OUTRO + 0.05, OUTRO + 1.7),
                                     ("Direction is the skill.", OUTRO + 1.7, CARD - 0.05)], hl=["sentence.", "direction", "skill."])
caps = Caps(W, H, words, chunks, "mono", y=1330, spans=spans, maxw=900)


def prompt_ov(frame, t):
    for (t0, te, t1, t2, p, k) in blocks:
        if t0 <= t < t1:
            n = int(len(p) * ease((t - t0) / (te - t0)) ** 0.9) if t < te else len(p)
            st = "typing" if t < te else "generating"; kk = (t - t0) if t < te else (t - te) / (t1 - te)
            frame = over(frame, prompt_ui(W, H, p, n, st, kk, y=560, label=f"PROMPT 0{k + 1}"))
        elif t1 <= t < t2:      # output label chip
            lab = text_block(W, H, [f"OUTPUT 0{k + 1}"], 1500, "JetBrainsMono", 40, LIME, anim=(t - t1) / 0.2, wght=700)
            frame = over(frame, lab)
    return frame


ovs = [cap_ov(caps, CARD, scrim_b=0.38), prompt_ov]
audio = dict(music=(MU("pulse.mp3"), 2.0, 0.2, 1.5), sfx=sfx + [(SF("boom.mp3"), OUTRO, -8), (SF("ding.mp3"), CARD + 0.6, -8)], music_gain=-6)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_PROMPT2AD_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
