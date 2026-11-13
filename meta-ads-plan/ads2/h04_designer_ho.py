"""H04 · AIA_HI_DESIGNER_VID_v1 · Hinglish · 'Designer ho? Static post toh bana lete ho.' · 9:16 · VO Neeraj
Captions: SINGLE WORD (huge Anton). Designers -> video ads, model shoots, AI UGC -> full campaign for clients."""
from common import *

W, H = 1080, 1920; OFF = 0.25
words = VO("h04", hl=["video", "campaign", "UGC"], offset=OFF); wt = wt_of(words)
T_STATIC, T_AB, T_MODEL, T_AUR, T_CLIENTS, T_SEEKHO = wt("Static"), wt("Ab"), wt("model"), wt("aur"), wt("Clients"), wt("Seekho")
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
static_img = np.asarray(Image.open(os.path.join(R, "out", "AIA_OLDNEW_IMG_v1_4x5.jpg")).convert("RGB").resize((760, 950)))


def static_post(dur):
    base = Image.new("RGB", (W, H), (30, 30, 34)); card = rounded(Image.fromarray(static_img), 24)
    base.paste(card, ((W - 760) // 2, 330), card); yield from still(np.asarray(base), dur, (1.0, 1.05))


segs, _ = seq(0, [
    (T_STATIC, C(ST(24448), 2.0, 0.5), "dip"), (T_AB - T_STATIC, static_post),
    (T_MODEL - T_AB, C(S["V09"], 4.6, 0.5), "flash"), (T_AUR - T_MODEL, C(S["V07"], 1.0, 0.5)), (T_CLIENTS - T_AUR, C(S["V03"], 5.0, 0.5)),
    (T_SEEKHO - T_CLIENTS, grid([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V02"], 3.0, 0.5), (S["V11"], 4.0, 0.45)], stagger=0.1), "flash"),
    (CARD - T_SEEKHO, phone_scroll([(22600, 24200)], ST(24448), 2.0, cy=0.40), "whip"),
])
thumbs = thumbs_from([(S["V09"], 5.0, 0.5), (S["V07"], 1.0, 0.5), (S["V03"], 5.0, 0.5)], 400, 560)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_dark(W, H, k, thumbs, headline=("Designer se", "Creative Director."), accent=PINK, cta="Abhi enroll karo")))
caps = Caps(W, H, words, style="single", y=1240, accent=PINK)
ovs = [cap_ov(caps, CARD, scrim_b=0.4)]
audio = dict(music=(MU("bed_a.mp3"), 10.0, 0.1, 1.5), vo=(vo_path("h04"), OFF), sfx=[(SF("swoosh.mp3"), T_AB - 0.1, -8), (SF("ding.mp3"), CARD + 0.6, -8)],
             music_gain=-11, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_HI_DESIGNER_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
