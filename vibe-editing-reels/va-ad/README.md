# VA ad: Dynamic Word Reels, v2

A 26.8 s talking-head ad, edited with the *design system* learned from the reference reel
(see `vibe-editor-workspace/styles/DYNAMIC-WORD-REELS.md`). It uses new layouts made for this script, not copies of the reference's effects.

Output: `vibe-editor-workspace/output/va-reel-v2.mp4` and `va-reel-v2-raw-vs-edited.mp4`.

## What carries over from the reference (the system)
- One phrase, one designed object, cleared before the next phrase. No running captions.
- Type pairing: light Inter lead line + editorial italic serif accent with a blue gradient.
- Glossy gradient numbers, frosted-glass UI, depth (graphics behind the presenter).
- Motion: 0.2 s blur-in with a slight horizontal smear, smear-out exits, cubic ease-out counters, draw-on strokes.
- Sync: graphics land just before the word; checks and chips land on the word.

## What is new for this video
| Time | Phrase | Layout |
|---|---|---|
| 0.0 | opener | soft light scan travels down through the presenter (inspired by the cut-out blink) |
| 0.3 | "looking to hire" | *hire?* behind the head |
| 1.4 | "a virtual assistant" | job-post composer types "Virtual Assistant"; Post turns blue |
| 2.9 | "highly trained… your industry" | candidate card; "highly trained" check draws; industry roller lands on *yours* |
| 6.5 | "$8 an hour, all in" | price ticket; odometer rolls $0→$8; */ hour*; "all in" check |
| 10.0 | "No fees, no contracts" | *fees* / *contracts* struck through with a pen line |
| 11.8 | "bilingual" | *hello* morphs to *hola* |
| 13.4 | "US hours" | dark-glass 24 h dial, 9–5 arc draws |
| 14.9 | "tools you already use" | glass app tiles orbit him in 3D (back half behind his body) |
| 17.7 | "we handle everything…" | soft defocus "breath" at the cut; *everything*; payroll / compliance / ongoing coaching tick on |
| 22.4 | "Click the Learn More button" | glass button; cursor glides in and clicks; ripple |
| 23.4 | "book a call" | booking card, a day gets selected |
| 24.9 | "for free" | *free* behind the head, holds to the end |

Depth: info cards live in the clean upper zone *behind* his head. A skin matte lets his hands pass *in front of* the glass.
Camera: a different push-in on each cut segment hides the jump cuts.

## Sound (ASMR-level, everything synthesised in `sound.py`)
- No stock whooshes. Palette: soft key ticks, quiet glass "tinks" (bell partials), breathy air swells, felt-pen scrapes, odometer micro-ticks, a soft cursor click.
- Effect sounds peak about 24 dB under the voice peaks. The felt-piano bed sits about 19 dB under the voice and ducks a further 5 dB while he talks.
- Voice: low-cut, slight de-mud, gentle de-ess and 2.4:1 compression. Master: −14 LUFS, −1.5 dBTP.

## Rebuild
`./make.sh` (needs the Vibe Editor job `talk1` prepped, Playwright Chromium, scipy + soundfile).
