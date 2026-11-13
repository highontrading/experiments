"""H02 · AIA_HI_SHOWREEL_VID_v1 · Hinglish · 'Ye ad shoot nahi hua hai.' · 9:16 · VO Reyaansh (deep brand voice)
Captions: OUTLINE (hollow Anton, spoken word fills). Cinematic AI showreel from the Drive folders, cut on the trailer score."""
from common import *

W, H = 1080, 1920; OFF = 0.35
words = VO("h02", hl=["AI", "direction"], offset=OFF); wt = wt_of(words)
T_NA1, T_NA2, T_NA3, T_SIRF, T_AAP, T_AI = wt("Na"), wt("na", 2.9), wt("na", 3.7), wt("Sirf"), wt("Aap"), wt("AI", 8.5)
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
first = [(D("O_9E0I.mp4"), 0.2), (D("O_E-mM.mp4"), 2.0), (D("O_BAka.mp4"), 1.0)]
segs, _ = seq(0, [
    (T_NA1 * 0.36, C(D("O_9E0I.mp4"), 0.3, 0.5), "dip"), (T_NA1 * 0.32, C(D("O_9E0I.mp4"), 3.4, 0.55)), (T_NA1 * 0.32, C(D("O_E-mM.mp4"), 1.5, 0.5)),
    (T_NA2 - T_NA1, C(D("A_utOs.mp4"), 4.0, 0.5), "flash"), (T_NA3 - T_NA2, C(S["V12"], 2.0, 0.5), "flash"), (T_SIRF - T_NA3, C(D("A_FCHv.mp4"), 3.0, 0.5), "flash"),
    ((T_AAP - T_SIRF) / 2, C(D("O_BAka.mp4"), 1.0, 0.5), "whip"), ((T_AAP - T_SIRF) / 2, C(D("O_BAka.mp4"), 8.0, 0.5)),
    ((T_AI - T_AAP) / 2, C(D("O_uoJa.mp4"), 13.0, 0.5), "glitch"), ((T_AI - T_AAP) / 2, C(S["V13"], 3.0, 0.5)),
    (CARD - T_AI, C(D("N_pY4a.mp4"), 6.0, 0.5, z=(1.0, 1.1)), "flash"),
])
thumbs = thumbs_from([(D("O_9E0I.mp4"), 3.4, 0.55), (D("A_utOs.mp4"), 5.0, 0.5), (S["V13"], 3.0, 0.5)], 400, 560)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_dark(W, H, k, thumbs, headline=("Ye sab AI hai.", "Seekho kaise."), cta="Abhi enroll karo")))
caps = Caps(W, H, words, style="outline", y=1220, size=140)
ovs = [cap_ov(caps, CARD, scrim_b=0.45, strength=0.6)]
audio = dict(music=(MU("score_v2_alt.mp3"), 13.9, 0.1, 1.6), vo=(vo_path("h02"), OFF),
             sfx=[(SF("boom2.mp3"), T_NA1, -10), (SF("glitch1.mp3"), T_AAP, -10), (SF("title.mp3"), CARD, -12)], music_gain=-9, vo_gain=3)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_HI_SHOWREEL_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
