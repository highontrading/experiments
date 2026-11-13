"""E07 · AIA_MIDNIGHT_VID_v1 · 'Midnight. A brief lands.' · 9:16 · VO Raj · Captions: KARAOKE (line shown, words turn yellow)
Clock ticks 00:00 -> 07:58 across the six workflow steps (Brief, Concept, Visuals, Motion, Edit, Launch)."""
from common import *

W, H = 1080, 1920; OFF = 0.3
words = VO("e07", hl=["sunrise", "live"], offset=OFF); wt = wt_of(words)
STEPS = ["Brief", "Concept", "Visuals", "Motion", "Edit", "Launch"]
TS = [wt(s, 6.0) for s in STEPS]   # the step words come after "No shoot." (~6.5s)
T_A, T_NEW, T_NO, T_BY, T_THATS = wt("A"), wt("New"), wt("No"), wt("By", 11.0), wt("That's")
CARD = words[-1]["e"] + 0.5; DUR = CARD + 3.6
STEP_CLIPS = [C(ST(1781), 3.0, 0.5), C(ST(41273), 6.0, 0.5), C(S["V13"], 2.0, 0.5), C(S["V09"], 4.6, 0.5), C(ST(44054), 5.0, 0.5), C(ST(50771), 3.0, 0.5)]
items = [(T_A, C(ST(17450), 10.0, 0.5), "dip"), (T_NEW - T_A, C(ST(17450), 20.0, 0.6)), (T_NO - T_NEW, C(ST(24344), 3.0, 0.5)),
         (TS[0] - T_NO, C(ST(46353), 4.0, 0.5, gr=dict(lift=-25)))]
for i in range(6): items.append(((TS[i + 1] if i < 5 else T_BY) - TS[i], STEP_CLIPS[i], "flash"))
items += [(T_THATS - T_BY, C(ST(33805), 6.0, 0.5, z=(1.0, 1.1)), "dip"), (CARD - T_THATS, phone_scroll([(15605, 17000)], ST(17450), 10.0, cy=0.40), "whip")]
segs, _ = seq(0, items)
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V09"], 5.0, 0.5), (S["V11"], 4.0, 0.45)], 400, 560)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_dark(W, H, k, thumbs, headline=("Brief at midnight.", "Live by morning."))))
caps = Caps(W, H, words, style="karaoke", y=1330, maxw=880, chunks=None)


def clock(t):
    if t < TS[0]: m = 0 + int(t * 2)
    elif t < T_BY: k = (t - TS[0]) / (T_BY - TS[0]); m = int(60 + k * (7 * 60 - 60))
    else: m = 7 * 60 + 58
    return f"{m // 60:02d}:{m % 60:02d}"


def clock_ov(frame, t):
    if t >= T_THATS: return frame
    frame = over(frame, text_block(W, H, [clock(t)], 250, "JetBrainsMono", 150, WHITE, anim=1, wght=700))
    if T_A <= t < T_NO + 0.6:   # brief notification
        k = ease((t - T_A) / 0.3) - ease((t - T_NO - 0.3) / 0.3); n = notif("New brief · launch campaign", "Hero ad needed by 9 AM. Budget: tight.")
        frame = over(frame, n, (50, int(470 - 320 * (1 - k))))
    if TS[0] <= t < T_BY:       # step chips
        chip_w = 150; x0 = (W - (6 * chip_w + 5 * 12)) // 2; im = Image.new("RGBA", (W, 90), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = F("JetBrainsMono", 26, 700)
        for i, s in enumerate(STEPS):
            on = t >= TS[i]; x = x0 + i * (chip_w + 12)
            d.rounded_rectangle([x, 10, x + chip_w, 74], 32, fill=(LIME + (255,)) if on else (0, 0, 0, 150), outline=(255, 255, 255, 120), width=2)
            lab = f"{i + 1:02d} {s}"[:9]; d.text((x + (chip_w - d.textlength(lab, font=f)) / 2, 28), lab, font=f, fill=INK + (255,) if on else (220, 220, 220, 255))
        frame = over(frame, im, (0, 470))
    return frame


ovs = [cap_ov(caps, CARD, scrim_b=0.4), clock_ov]
audio = dict(music=(MU("pulse.mp3"), 8.0 - TS[0] + 0.0 if TS[0] < 8 else 0.0, 0.3, 1.6), vo=(vo_path("e07"), OFF),
             sfx=[(SF("ding.mp3"), T_A, -4)] + [(SF("tick.mp3"), s, -6) for s in TS] + [(SF("boom.mp3"), T_BY, -9)], music_gain=-10, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_MIDNIGHT_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
