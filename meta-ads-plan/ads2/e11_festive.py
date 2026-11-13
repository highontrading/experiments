"""E11 · AIA_FESTIVE_VID_v1 · 'Diwali. Wedding season. New Year.' · 9:16 · VO Anika (Indian English)
Captions: YELLOW BOX (active word on a tilted yellow box). Festive grade: candle bokeh screen-blended over AI product films."""
from common import *

W, H = 1080, 1920; OFF = 0.3
words = VO("e11", hl=["Diwali", "festive", "yourself"], offset=OFF); wt = wt_of(words)
T_WED, T_NEW, T_EVERY, T_PUT, T_ON, T_IN, T_WITHOUT, T_LEARN, T_AND = (wt("Wedding"), wt("New"), wt("Every"), wt("Put"), wt("on", 9), wt("in", 10),
                                                                       wt("without"), wt("Learn"), wt("and", 15))
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
fest = lambda make, t_b=2.0, amt=0.7: screen_blend(make, ST(38507), t_b, amt)
segs, _ = seq(0, [
    (T_WED, C(ST(41731), 2.0, 0.5, z=(1.0, 1.1)), "dip"), (T_NEW - T_WED, C(ST(33805), 4.0, 0.5)), (T_EVERY - T_NEW, C(ST(41301), 3.0, 0.5)),
    (T_PUT - T_EVERY, fest(C(S["V13"], 1.5, 0.5), 2.0, 0.45), "flash"), (T_ON - T_PUT, fest(C(S["V08"], 5.4, 0.5), 5.0, 0.7)),
    (T_IN - T_ON, fest(C(S["V12"], 2.0, 0.5), 3.0, 0.6)), (T_WITHOUT - T_IN, fest(C(S["V10"], 5.0, 0.5), 6.0, 0.55)),
    (T_LEARN - T_WITHOUT, fest(C(S["V11"], 3.5, 0.45), 1.0, 0.4)),
    (T_AND - T_LEARN, phone_scroll([(6140, 6900)], ST(38507), 4.0, cy=0.40), "whip"),
    (CARD - T_AND, fest(C(S["V09"], 9.5, 0.5), 7.0, 0.5), "flash"),
])
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V08"], 1.0, 0.5), (S["V11"], 4.0, 0.45)], 400, 540)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_yellow(W, H, k, thumbs, headline=("This season's", "ads, made", "by you."))))
caps = Caps(W, H, words, style="yellow_box", y=1300)
ovs = [cap_ov(caps, CARD, scrim_b=0.4)]
audio = dict(music=(MU("festive.mp3"), 5.5, 0.3, 1.6), vo=(vo_path("e11"), OFF), sfx=[(SF("ding.mp3"), CARD + 0.6, -8)], music_gain=-11, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_FESTIVE_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
