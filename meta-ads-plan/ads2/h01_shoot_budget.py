"""H01 · AIA_HI_SHOOTBUDGET_VID_v1 · Hinglish · 'Shoot ka budget nahi hai? Koi baat nahi.' · 9:16 · VO Rahul (Hinglish)
Captions: YELLOW TEXT (all-yellow uppercase, active word flips white). Ends on a ₹2,999 price slam."""
from common import *

W, H = 1080, 1920; OFF = 0.25
words = VO("h01", hl=["₹2,999"], offset=OFF); wt = wt_of(words)
T_KOI, T_EK, T_PROD, T_MODEL, T_VIDEO, T_SAB, T_SEEKHO, T_SIRF = (wt("Koi"), wt("Ek"), wt("Product", 4), wt("model"), wt("video"), wt("sab"),
                                                                   wt("Seekho"), wt("Sirf"))
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
segs, _ = seq(0, [
    (T_KOI, C(ST(50639), 2.0, 0.55), "dip"), (T_EK - T_KOI, C(S["V13"], 1.0, 0.5), "whip"),
    (T_PROD - T_EK, polaroid(S["V09"], 2.0, 0.5, label="sirf_ek_photo.jpg")),
    (T_MODEL - T_PROD, C(S["V08"], 0.3, 0.5), "flash"), (T_VIDEO - T_MODEL, C(S["V12"], 2.0, 0.5)), (T_SAB - T_VIDEO, C(S["V09"], 4.6, 0.5)),
    (T_SEEKHO - T_SAB, grid([(S["V13"], 3.0, 0.5), (S["V11"], 3.5, 0.45), (S["V10"], 5.0, 0.5), (S["V07"], 1.0, 0.5)], stagger=0.1), "flash"),
    (T_SIRF - T_SEEKHO, phone_scroll([(0, 1300)], ST(50639), 3.0, cy=0.40), "whip"),
    (CARD - T_SIRF, C(S["V13"], 6.0, 0.5, z=(1.1, 1.2)), "flash"),
])
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V11"], 4.0, 0.45)], 400, 540)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_yellow(W, H, k, thumbs, headline=("Shoot nahi,", "skill chahiye."), cta="Abhi enroll karo")))
caps = Caps(W, H, words, style="yellow_text", y=1300)


def price_ov(frame, t):
    if not (T_SIRF - 0.05 <= t < CARD): return frame
    k = t - T_SIRF + 0.05; frame = (frame * 0.55).astype(np.uint8)
    frame = over(frame, text_block(W, H, ["SIRF"], 560, "Anton-Regular", 120, WHITE, anim=k / 0.15))
    return over(frame, text_block(W, 520, ["₹2,999"], 40, "Poppins-Black", int(230 * (1 + 0.5 * (1 - ease(k / 0.18)))), YELLOW, anim=k / 0.12, stroke=6), (0, 650))


ovs = [cap_ov(caps, CARD, cap_until=T_SIRF - 0.05), price_ov]
audio = dict(music=(MU("hype.mp3"), 4.0, 0.2, 1.5), vo=(vo_path("h01"), OFF),
             sfx=[(SF("swoosh.mp3"), T_KOI - 0.1, -6), (SF("shutter.mp3"), T_EK + 0.6, -3), (SF("boom.mp3"), T_SIRF, -6), (SF("ding.mp3"), CARD + 0.6, -8)],
             music_gain=-11, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_HI_SHOOTBUDGET_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
