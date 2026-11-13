"""E09 · AIA_TOOLSTACK_VID_v1 · '12 tools. One workflow.' · 9:16 · no VO, beat-cut on the trailer score (136 BPM)
Captions: OUTLINE (hollow Anton, active word filled). Tool names are text only (no third-party logos)."""
from common import *

W, H = 1080, 1920; MOFF = 14.19
beats = beat_grid("score_v2.mp3", MOFF)
TOOLS = [("ChatGPT", "briefs & scripts", ST(1781), 3.0), ("Claude", "strategy & copy", ST(24448), 6.0), ("Gemini", "research & ideas", ST(41273), 7.0),
         ("Nano Banana", "product shots", S["V13"], 1.0), ("Midjourney", "art direction", S["V12"], 2.5), ("Veo", "video scenes", D("O_BAka.mp4"), 9.0),
         ("Kling", "motion", S["V09"], 4.6), ("Runway", "VFX edits", D("A_utOs.mp4"), 6.0), ("ElevenLabs", "voiceovers", ST(44054), 3.0),
         ("Suno", "jingles", ST(41307), 4.0), ("CapCut", "the edit", ST(41274), 5.0), ("Meta Ads Manager", "the launch", ST(42133), 3.0)]
INTRO = beats[4]
starts = [INTRO + 0] + [beats[4 + 2 * (i + 1)] for i in range(len(TOOLS))]
OUTRO = starts[-1]; CARD = beats[4 + 2 * len(TOOLS) + 8]; DUR = CARD + 3.6
segs = [Seg(0, INTRO, C(D("O_9E0I.mp4"), 3.4, 0.55, z=(1.0, 1.1)), "dip")]
for i, (name, what, src, t) in enumerate(TOOLS):
    segs.append(Seg(starts[i], starts[i + 1], C(src, t, 0.5, z=(1.05, 1.12)), ["punch", "whip", "flash", "glitch"][i % 4]))
segs += [Seg(OUTRO, CARD, grid([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V09"], 9.0, 0.5), (S["V11"], 4.0, 0.45)], stagger=0.1), "flash")]
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V09"], 9.0, 0.5)], 400, 540)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_yellow(W, H, k, thumbs, headline=("12 tools.", "One workflow.", "Learn it."))))
items = [("12 tools.", 0.1, INTRO)] + [(n, starts[i], starts[i + 1]) for i, (n, *_r) in enumerate(TOOLS)] + [("One workflow.", OUTRO, CARD - 0.05)]
words, chunks, spans = script_words(items, hl=["workflow."])
for c, (s, e) in zip(chunks, spans):           # each tool lights up on its own beat
    for j in c: words[j]["s"] = s + 0.03 * (j - c[0]); words[j]["e"] = e - 0.05
caps = Caps(W, H, words, chunks, "outline", y=1180, spans=spans, maxw=980, size=150)


def sub_ov(frame, t):
    for i, (n, what, *_r) in enumerate(TOOLS):
        if starts[i] <= t < starts[i + 1]:
            frame = over(frame, text_block(W, H, [what.upper()], 1370, "JetBrainsMono", 44, LIME, anim=(t - starts[i]) / 0.15, wght=700))
            frame = over(frame, text_block(W, H, [f"{i + 1:02d}/12"], 300, "JetBrainsMono", 40, WHITE, anim=1, wght=700))
    if OUTRO <= t < CARD:
        frame = over(frame, text_block(W, H, ["AI & Advertising shows you", "how they fit together."], 1370, "Poppins-SemiBold", 52, WHITE, anim=(t - OUTRO - 0.3) / 0.3))
    return frame


ovs = [cap_ov(caps, CARD, scrim_b=0.45, strength=0.6), sub_ov]
audio = dict(music=(MU("score_v2.mp3"), MOFF, 0.05, 1.6), sfx=[(SF("title.mp3"), CARD, -12)], music_gain=-5)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_TOOLSTACK_VID_v1_9x16.mp4"); print(render(out, W, H, segs, ovs, audio)); sheet(out)
