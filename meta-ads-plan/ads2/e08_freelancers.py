"""E08 · AIA_FREELANCE_VID_v1 · 'Freelancers, designers, agencies, listen up.' · 9:16 · VO Liam
Captions: PINK BOX (each word on an ink box, active word pink, key words lime). Services + portfolio angle (no income claims)."""
from common import *

W, H = 1080, 1920; OFF = 0.25
words = VO("e08", hl=["week", "portfolio", "pitch", "price"], offset=OFF); wt = wt_of(words)
T_DES, T_AG, T_BR, T_LEARN, T_AIU, T_CF, T_THEN, T_AI2, T_ELE, T_CAP = (wt("designers"), wt("agencies"), wt("Brands"), wt("Learn"), wt("AI", 8),
                                                                       wt("campaign", 9), wt("then"), wt("AI", 12.5), wt("Eleven"), wt("capstone"))
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
segs, _ = seq(0, [
    (T_DES, C(ST(24448), 2.0, 0.5), "dip"), (T_AG - T_DES, C(ST(41292), 2.0, 0.5)), (T_BR - T_AG, C(ST(42643), 3.0, 0.5)),
    (T_LEARN - T_BR, grid([(S["V13"], 1.0, 0.5), (S["V11"], 3.0, 0.45), (S["V08"], 5.5, 0.5), (S["V09"], 9.0, 0.5),
                           (S["V10"], 5.0, 0.5), (S["V12"], 2.0, 0.5)], cols=2, rows=3, stagger=0.12), "flash"),
    (T_AIU - T_LEARN, C(S["V08"], 1.0, 0.5)), (T_CF - T_AIU, C(S["V03"], 5.0, 0.5)), (T_THEN - T_CF, C(D("O_BAka.mp4"), 8.0, 0.5)),
    (T_AI2 - T_THEN, C(ST(42643), 6.0, 0.5)), (T_ELE - T_AI2, C(ST(41274), 6.0, 0.5)),
    (T_CAP - T_ELE, phone_scroll([(22600, 25400)], ST(41274), 3.0, cy=0.40), "whip"),
    (CARD - T_CAP, C(S["V13"], 6.0, 0.5, z=(1.05, 1.15)), "flash"),
])
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V03"], 5.0, 0.5), (S["V12"], 2.0, 0.5)], 460, 620)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("Offer shoots, films", "and ad sets"), hl="to every client.")))
caps = Caps(W, H, words, style="pink_box", y=1300)
ovs = [cap_ov(caps, CARD, scrim_b=0.35)]
audio = dict(music=(MU("bed_E.mp3"), 1.5, 0.4, 1.6), vo=(vo_path("e08"), OFF),
             sfx=[(SF("swoosh.mp3"), T_BR - 0.1, -8), (SF("pop.mp3"), T_LEARN, -8), (SF("ding.mp3"), CARD + 0.6, -8)], music_gain=-12, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_FREELANCE_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
