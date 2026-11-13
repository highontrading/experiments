"""E03 · AIA_ONEPHOTO_VID_v1 · 'This is all you start with: one product photo.' · 9:16 · VO Jessica
Captions: SINGLE WORD (huge Anton, one word at a time). Plain photo -> packshot -> lifestyle -> model -> video ad -> 2x2 campaign."""
from common import *

W, H = 1080, 1920; OFF = 0.25
words = VO("e03", hl=["one", "campaign", "photo"], offset=OFF); wt = wt_of(words)
T_FROM, T_LIFE, T_MODEL, T_AND, T_ONE2, T_LEARN = wt("From"), wt("Lifestyle"), wt("Model"), wt("And"), wt("One", 10), wt("Learn")
END = words[-1]["e"] + 0.4; CARD = END; DUR = CARD + 3.6
segs, _ = seq(0, [
    (wt("one") - 0.1, C(S["V09"], 0.3, 0.5, z=(1.0, 1.05)), "dip"),
    (T_FROM - wt("one") + 0.1, polaroid(S["V09"], 2.0, 0.5)),
    (T_LIFE - T_FROM, C(S["V08"], 0.3, 0.5, zoom=1.18), "whip"),
    (T_MODEL - T_LIFE, C(S["V11"], 0.2, 0.45)),
    (T_AND - T_MODEL, C(S["V12"], 3.0, 0.5)),
    ((T_ONE2 - T_AND) * 0.5, C(S["V09"], 4.6, 0.5, z=(1.0, 1.12)), "flash"),
    ((T_ONE2 - T_AND) * 0.5, C(S["V09"], 9.5, 0.5)),
    (T_LEARN - T_ONE2, grid([(S["V09"], 1.0, 0.5), (S["V08"], 5.5, 0.5), (S["V11"], 4.0, 0.45), (S["V13"], 2.0, 0.5)], stagger=0.18), "flash"),
    (CARD - T_LEARN, phone_scroll([(6140, 8000)], S["V09"], 6.0, cy=0.40), "whip"),
])
thumbs = thumbs_from([(S["V09"], 1.0, 0.5), (S["V08"], 1.0, 0.5), (S["V11"], 4.0, 0.45)], 460, 620)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("One product photo.", "One whole campaign."), hl="Learn how.")))
caps = Caps(W, H, words, style="single", y=1240)
ovs = [cap_ov(caps, CARD, scrim_b=0.4)]
audio = dict(music=(MU("trendy.mp3"), 1.9, 0.2, 1.5), vo=(vo_path("e03"), OFF),
             sfx=[(SF("shutter.mp3"), wt("photo") - 0.05, -2), (SF("swoosh.mp3"), T_FROM - 0.1, -8), (SF("boom.mp3"), T_ONE2, -9), (SF("pop.mp3"), CARD + 0.5, -8)],
             music_gain=-12, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_ONEPHOTO_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
