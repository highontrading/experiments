"""E10 · AIA_STUDENTS_VID_v1 · 'What IdeaBro students say' · 4:5 feed · no VO, chill piano
Captions: MINIMAL SUBTITLE (clean lines on soft black bars). Real testimonials from the course page, verbatim."""
from common import *

W, H = 1080, 1350
Q = [("IdeaBro didn't just teach me tools. It rewired how I think about ideas.", "My client work is now at a completely different level.", "Aryan Sinha", "Brand Designer", S["V12"], 1.0),
     ("I went from copying trends to setting them.", "The cohort gave me the language and systems to lead creative direction with confidence.", "Ketan Parikh", "Content Creator", S["V07"], 0.3),
     ("The way they blend taste, AI tools, and creative strategy is unlike anything in the market.", "This is the creative school the internet was missing.", "Sonam Gautam", "Freelancer & Studio Founder", D("O_uoJa.mp4"), 12.0)]
HOOK = 2.2; QD = 5.6
segs = [Seg(0, HOOK, CW(S["V13"], 2.0, 0.5, z=(1.0, 1.06)), "dip")]
items = [("What IdeaBro students say", 0.2, HOOK - 0.05)]
for i, (a, b, n, r, src, t) in enumerate(Q):
    t0 = HOOK + i * QD
    segs.append(Seg(t0, t0 + QD, CW(src, t, 0.5, z=(1.02, 1.1)), "fade"))
    items += [(a, t0 + 0.3, t0 + QD * 0.5), (b, t0 + QD * 0.5, t0 + QD - 0.1)]
CARD = HOOK + 3 * QD; DUR = CARD + 3.8
thumbs = thumbs_from([(S["V12"], 2.0, 0.5), (S["V13"], 3.0, 0.5), (S["V07"], 1.0, 0.5)], 400, 520)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_cream(W, H, k, thumbs, headline=("Join the creative", "school for AI ads."), hl="AI & Advertising.")))
words, chunks, spans = script_words(items, hl=["completely", "setting", "missing."])
caps = Caps(W, H, words, chunks, "subtitle", y=930, spans=spans, maxw=900, size=50)


def name_ov(frame, t):
    if t >= CARD: return frame
    frame = A2.scrim(frame, top=0.25, bottom=0.55, strength=0.6); frame = put_badge(frame, "white", 54, 50)
    for i, (a, b, n, r, *_x) in enumerate(Q):
        t0 = HOOK + i * QD
        if t0 <= t < t0 + QD:
            k = (t - t0) / 0.4
            frame = over(frame, text_block(W, H, ["“"], 640, "InstrumentSerif-Regular", 260, LIME, anim=k, shadow=False))
            chip = Image.new("RGBA", (W, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(chip); f1 = F("Inter", 38, 700); f2 = F("JetBrainsMono", 26, 600)
            ini = "".join(p[0] for p in n.split()); x = (W - 480) // 2
            d.ellipse([x, 18, x + 76, 94], fill=PINK + (255,)); d.text((x + 38 - d.textlength(ini, font=F("Inter", 30, 800)) / 2, 38), ini, font=F("Inter", 30, 800), fill=INK + (255,))
            d.text((x + 96, 20), n, font=f1, fill=WHITE + (255,)); d.text((x + 96, 66), r.upper(), font=f2, fill=(200, 200, 200, 255))
            frame = over(frame, chip, (0, 1150 + int(20 * (1 - ease(k)))))
    return frame


ovs = [name_ov, cap_ov(caps, CARD, scrim_b=0, badge=None)]
audio = dict(music=(MU("chill.mp3"), 0.0, 0.8, 1.8), sfx=[(SF("pop.mp3"), HOOK + i * QD + 0.3, -10) for i in range(3)], music_gain=-4)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_STUDENTS_VID_v1_4x5.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
