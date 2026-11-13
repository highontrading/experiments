"""E06 · AIA_MODULES_VID_v1 · 'Everything inside AI & Advertising, in 30 seconds' · 4:5 (1080x1350) feed · no VO
Typographic module counter (huge outline numbers + pink-box titles) over a matching clip per module."""
from common import *

W, H = 1080, 1350
MODS = [("AI in advertising:", "the new playbook", ST(41273), 3.0, 0.5),
        ("Briefs, strategy", "and the big idea", ST(24448), 4.0, 0.5),
        ("AI product", "photography", S["V08"], 0.3, 0.5),
        ("Models, styling", "and virtual sets", S["V12"], 2.0, 0.5),
        ("AI video ads and", "campaign films", D("O_BAka.mp4"), 8.0, 0.5),
        ("Sound, voice", "and music", ST(44054), 3.0, 0.5),
        ("AI UGC and brand", "ambassadors", S["V02"], 3.0, 0.5),
        ("Meta ads: statics,", "variations, testing", ST(50771), 6.0, 0.5),
        ("Editing, end cards", "and brand kits", ST(41274), 4.0, 0.5),
        ("Hybrid ads:", "real shoot + AI", ST(50639), 3.0, 0.5),
        ("Capstone:", "your full campaign", S["V13"], 2.0, 0.5)]
MOFF = 13.9; beats = beat_grid("score_v2_alt.mp3", MOFF)
INTRO = beats[4]; per = 4                     # 4 beats (~1.76s) per module
starts = [INTRO + 0] + [beats[4 + per * (i + 1)] for i in range(len(MODS))]
CARD = starts[-1]; DUR = CARD + 3.8
segs = [Seg(0, INTRO, CW(S["V13"], 4.0, 0.5, z=(1.0, 1.08)), "dip")]
for i, (a, b, src, t, fx) in enumerate(MODS):
    segs.append(Seg(starts[i], starts[i + 1], CW(src, t, fx, z=(1.04, 1.12)), "punch"))
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V02"], 3.0, 0.5)], 400, 520)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("11 modules.", "41 lessons."), hl="One full campaign.")))


def mod_ov(frame, t):
    if t >= CARD: return frame
    frame = A2.scrim(frame, top=0.5, bottom=0.25, strength=0.6)
    frame = put_badge(frame, "white", 60, 50)
    if t < INTRO:
        frame = over(frame, text_block(W, H, ["Everything inside", ("AI & Advertising", INK, PINK)], 430, "Poppins-Black", 84, WHITE, anim=t / 0.4))
        return over(frame, text_block(W, H, ["in 20 seconds ↓"], 690, "JetBrainsMono", 40, WHITE, anim=(t - 0.3) / 0.3, wght=700))
    i = max(k for k in range(len(MODS)) if starts[k] <= t + 1e-6); lt = t - starts[i]; a, b = MODS[i][:2]
    num = f"{i + 1:02d}"; f = F("Anton-Regular", 300); im = Image.new("RGBA", (W, 380), (0, 0, 0, 0))
    m1 = Image.new("L", im.size, 0); m2 = Image.new("L", im.size, 0)
    ImageDraw.Draw(m1).text((70, 0), num, font=f, fill=255, stroke_width=5, stroke_fill=255); ImageDraw.Draw(m2).text((70, 0), num, font=f, fill=255)
    m = np.clip(np.asarray(m1, np.int16) - np.asarray(m2, np.int16) * (0 if lt > 0.25 else 1), 0, 255).astype(np.uint8)
    lay = np.zeros((380, W, 4), np.uint8); lay[..., :3] = 255; lay[..., 3] = (m * ease(lt / 0.15)).astype(np.uint8)
    frame = over(frame, Image.fromarray(lay), (0, 120 + int(30 * (1 - ease(lt / 0.2)))))
    frame = over(frame, text_block(W, H, [f"/ {len(MODS)}"], 300, "JetBrainsMono", 46, WHITE, anim=1, align="left", x=330, wght=700))
    frame = over(frame, text_block(W, H, [(a, INK, PINK)], 520, "Poppins-Black", 76, WHITE, anim=lt / 0.18, align="left", x=70, box_pad=18))
    frame = over(frame, text_block(W, H, [(b, INK, LIME)], 625, "Poppins-Black", 76, WHITE, anim=(lt - 0.08) / 0.18, align="left", x=70, box_pad=18))
    bw = int((W - 140) * (i + 1) / len(MODS))   # progress bar
    bar = Image.new("RGBA", (W, 20), (0, 0, 0, 0)); bd = ImageDraw.Draw(bar)
    bd.rounded_rectangle([70, 4, W - 70, 14], 5, fill=(255, 255, 255, 70)); bd.rounded_rectangle([70, 4, 70 + bw, 14], 5, fill=LIME + (255,))
    return over(frame, bar, (0, H - 80))


audio = dict(music=(MU("score_v2_alt.mp3"), MOFF, 0.05, 1.6), sfx=[(SF("tick.mp3"), s, -6) for s in starts[:-1]] + [(SF("boom.mp3"), CARD, -8)], music_gain=-7)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_MODULES_VID_v1_4x5.mp4"); print(render(out, W, H, segs, [mod_ov], audio)); sheet(out)
