# AI in Advertising: trailer

A 53-second trailer for **AI in Advertising by Ideabro Studio**. It is built in the style of the reference
studied in `REFERENCE_BREAKDOWN.md`: a word-synced manifesto with a circle match-cut strobe, film-scan frames, an
orb wipe into the "new world", a split-door "gap", orbiting orbs, neon fork lines, and a hard musical stop into a silent end card.

| File | What it is |
| --- | --- |
| `out/AI_in_Advertising_trailer_16x9.mp4` | YouTube / landscape: 1920×1080, 30 fps, 53.2 s, mastered to −14 LUFS |
| `out/AI_in_Advertising_trailer_9x16.mp4` | Reels / Shorts: 1080×1920, 30 fps, 53.2 s, mastered to −12 LUFS |
| `REFERENCE_BREAKDOWN.md` | frame-by-frame study of the reference |
| `PLAN.md` | the script and shot plan as approved |
| `CREDITS.md` | sources and licences for every third-party still |

## Script (voice: ElevenLabs "Steven — Deep Documentary Narrator")

> Advertising has always followed the same pattern. A new medium appears. Print. Radio. Television. The internet.
> And every time… not every brand makes the jump. Some still book the studio, the crew, the three-week shoot… like it still makes sense.
> Others wake up inside the new one. And move. No studio. No crew. No waiting. One product photo becomes a whole campaign.
> Right now, AI is that medium. And the gap between brands that direct it, and brands that ignore it… is growing every single day.
> Shoot-quality ads. Without the shoot. Two kinds of advertisers are forming. The ones who shoot. And the ones who direct. Which one are you?

## How it is built

| File | Role |
| --- | --- |
| `vo.py`, `music.py`, `sfx.py` | ElevenLabs: voiceover lines with word timestamps, the score (composition plan), 15 SFX |
| `timeline.py` | **the single source of truth**: VO placed on the score's 90 BPM beat grid, scene times, hit lists |
| `stage.html`, `stage.js` | the whole film as `renderAt(t)` on a canvas; one layout system for 16:9 and 9:16 |
| `render.js` | renders frames with headless Chromium (Playwright) |
| `mix.py`, `master.sh` | re-arranges the score stems (breakdown, gap dip, last-bar loop, hard stop), ducks music under the VO, places SFX by their transient peaks, masters |
| `prep.py`, `tools/` | asset prep: CC0 photo fetch, circle-centred crops, clip frame extraction |
| `make.sh` | the full build |

```bash
./make.sh audio     # VO, score, SFX (needs ELEVENLABS_API_KEY), score stems via demucs
./make.sh assets    # fetch CC0 photos, crop, prep stills + clip frames
./make.sh stills    # test stills for both formats -> build/stills/
./make.sh           # mix, master, render both formats, encode -> out/
```

A full render takes about 2.5 minutes per format on 4 CPU cores.

## Changing it

- **Copy and timing:** to change a line, edit it in `vo.py` and run `python3 vo.py <line index>`. Then move the line's start in
  `VO_AT` in `timeline.py`. Captions, cuts and SFX all follow automatically.
- **Brand:** colours are at the top of `stage.js` (`CREAM`, `LIME`, `PINK`, `LAV`, `INK`), taken from the course page. Fonts
  (Instrument Serif, JetBrains Mono, Inter) are in `assets/fonts/`. The IB mark is in `assets/img/ib_logo_white.png`.
- **Showcase clips:** edit `PROOF` in `timeline.py` (clip, beat range, lower-third title) and `CLIPS` in `prep.py` (source in-point).
