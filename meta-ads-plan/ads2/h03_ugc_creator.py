"""H03 · AIA_HI_UGC_VID_v1 · Hinglish · 'Ye creator real nahi hai.' · 9:16 · VO Anika (Hindi, upbeat)
Captions: WHITE PILL kinetic (active word on a white pill). AI UGC: unboxing, café review, haul, kitchen vlog, travel selfie."""
from common import *

W, H = 1080, 1920; OFF = 0.25
words = VO("h03", hl=["UGC"], offset=OFF); wt = wt_of(words)
T_YE2, T_SAB, T_BR, T_AUR, T_SEEKHO = wt("Ye", 1.5), wt("Sab"), wt("Brands"), wt("Aur"), wt("Seekho")
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
segs, _ = seq(0, [
    (T_YE2, C(S["V02"], 0.3, 0.44), "dip"), (T_SAB - T_YE2, C(S["V03"], 4.0, 0.5)),
    ((T_BR - T_SAB) / 2, C(S["V04"], 6.0, 0.5)), ((T_BR - T_SAB) / 2, C(D("O_vlog_prompt.mp4"), 12.3, 0.5)),
    (T_AUR - T_BR, C(ST(50771), 3.0, 0.5)), ((T_SEEKHO - T_AUR) / 2, C(ST(41292), 3.0, 0.5)), ((T_SEEKHO - T_AUR) / 2, C(D("O_IC1N.mp4"), 0.5, 0.42)),
    (CARD - T_SEEKHO, phone_scroll([(6140, 7400)], S["V03"], 6.0, cy=0.40), "whip"),
])
thumbs = thumbs_from([(S["V03"], 8.0, 0.5), (S["V02"], 3.0, 0.5), (D("O_IC1N.mp4"), 0.5, 0.42)], 460, 620)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("UGC ads,", "bina creators ke."), hl="Seekho kaise.", cta="Enroll karo · ₹2,999  →")))
caps = Caps(W, H, words, style="pill", y=1300)
ovs = [cap_ov(caps, CARD, scrim_b=0.35)]
audio = dict(music=(MU("trendy.mp3"), 1.9, 0.2, 1.5), vo=(vo_path("h03"), OFF), sfx=[(SF("pop.mp3"), T_SAB, -6), (SF("ding.mp3"), T_BR, -8)],
             music_gain=-13, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_HI_UGC_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
