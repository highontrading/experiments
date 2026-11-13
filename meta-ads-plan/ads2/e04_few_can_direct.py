"""E04 · AIA_DIRECTION_VID_v1 · 'Anyone can press generate. Few can direct.' · 9:16 · VO George (warm British)
Captions: SERIF EDITORIAL (Instrument Serif italic, lime highlight on key words). Taste / art-direction angle."""
from common import *

W, H = 1080, 1920; OFF = 0.3
words = VO("e04", hl=["direct", "direction", "human", "touch", "teach"], offset=OFF); wt = wt_of(words)
T_FEW, T_FEEDS, T_DIFF, T_LIGHT, T_COLOUR, T_COMP, T_AND, T_THATS, T_AI = (wt("Few"), wt("Feeds"), wt("The", 7), wt("light"), wt("colour"),
                                                                          wt("composition"), wt("and", 11.5), wt("That's"), wt("AI", 14.5))
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
segs, _ = seq(0, [
    (T_FEW, C(ST(41273), 3.0, 0.5, z=(1.0, 1.08)), "dip"),
    (T_FEEDS - T_FEW, C(S["V12"], 1.0, 0.5, z=(1.02, 1.1))),
    (T_DIFF - T_FEEDS, same_wall(S["V13"], 6.0), "glitch"),
    (T_LIGHT - T_DIFF, C(S["V12"], 6.5, 0.5), "flash"),
    (T_COLOUR - T_LIGHT, C(S["V10"], 5.0, 0.5)),
    (T_COMP - T_COLOUR, C(S["V11"], 10.0, 0.5)),
    (T_AND - T_COMP, C(S["V07"], 0.5, 0.5)),
    (T_THATS - T_AND, C(D("O_IC1N.mp4"), 0.4, 0.42)),
    (T_AI - T_THATS, C(D("O_9E0I.mp4"), 6.5, 0.5, z=(1.0, 1.1))),
    (CARD - T_AI, C(D("O_BAka.mp4"), 13.0, 0.5)),
], "fade")
thumbs = thumbs_from([(S["V12"], 2.0, 0.5), (S["V07"], 1.0, 0.5), (S["V10"], 5.0, 0.5)], 460, 620)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("Anyone can press generate.", "Few can direct."), hl="Learn to direct.")))
caps = Caps(W, H, words, style="serif", y=1290, maxw=900)


def wall_label(frame, t):
    if T_FEEDS <= t < T_DIFF:
        frame = over(frame, text_block(W, H, ["SAME PROMPT. SAME LOOK."], 820, "JetBrainsMono", 44, WHITE, anim=(t - T_FEEDS) / 0.3, box=(214, 40, 40), wght=700))
    return frame


ovs = [cap_ov(caps, CARD, scrim_b=0.45, strength=0.6), wall_label]
audio = dict(music=(MU("chill.mp3"), 1.0, 0.8, 1.8), vo=(vo_path("e04"), OFF), sfx=[(SF("glitch2.mp3"), T_FEEDS, -10), (SF("title.mp3"), CARD, -12)],
             music_gain=-9, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_DIRECTION_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
