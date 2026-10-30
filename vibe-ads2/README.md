# Vibe Editing Hinglish Meta ads, v2 (rebuilt on the reference videos' design systems)

These are the same five stories, voices and CTA as `../vibe-ads`. Each ad has been rebuilt on the
look of one of the five reference videos, with much more movement:
- **Shot changes:** a new shot every 1–1.5 s, landing on spoken words, as in the references.
- **Camera:** pushes and drifts inside every shot, with punches and shakes on the hits.
- **Transitions:** zoom-blur warp with RGB split, glitch slices, cyan negative flashes, focus pulls, cloud wipes made from real sky footage, and a scissor split that cuts the frame in two.
- **Kinetic type:** set word by word on the voice, plus rolling counters.

| Ad | Story | Reference design system | Shots |
| --- | --- | --- | --- |
| `v2_a1_timeline_ka_jaal` | Editing software as an octopus trap | **Crimson editorial**: deep red vignette, B&W halftone engravings, Playfair/Bodoni serif, red scribbles, split-face tear, rolling counters, light rays | 25 |
| `v2_a2_1913_se_future` | From Phalke's 1913 scissors to vibe editing | **Cinematic storytelling**: graded full-bleed archival footage, spotlit rooms, extruded yellow titles, torn sticker labels, serif italics on fabric, white studio payoff | 24 |
| `v2_a3_ek_video_poora_india` | One video, every Indian language | **Maximalist**: red/blue block type, real hands punching toward camera, pixel odometers, sticky notes on graph paper, warp cuts between real cities | 19 |
| `v2_a4_uljhan_chhodo` | Tangled editing vs. speaking the edit | **VOX tutorial**: green cutting mat, editor windows with sketch outlines and push-pins, panicking cursor, error dialog, phone mockup showing each spoken edit, cloud wipes | 15 |
| `v2_a5_apni_desk_badlo` | A creator's to-do list | **Clean minimal**: white grid, giant black words, prompt box, magenta flash cuts, "You" and "AI" cursors building a pastel timeline, app dock on the grass | 17 |

## Audio
- **Voices:** unchanged from v1, `eleven_v4`.
- **Music:** a new dark editorial score for Ad 1 (`music_v2_5`); Ads 2–5 reuse their v1 beds.
- **Sound effects:** eight new ones from `eleven_text_to_sound_v3` (impact, glitch, warp, click, typewriter, buzz, soft pop).
- **Sound placement:** each shot declares its sounds and each transition type has a default sound. The page exports them to `build/<ad>/sfx.json` for `mix.py`.

## Build
```bash
./make.sh a1           # → out/v2_a1_timeline_ka_jaal.mp4 (+ _master, not in git)
./make.sh a1 stills    # contact sheet → build/a1/sheet.jpg
```

| File | What it holds |
| --- | --- |
| `lib/fx.js` | camera, transitions, kinetic type, odometer, scribbles, arrows, stickers, extruded and grunge titles, editor windows, pins, cursors, the five backgrounds |
| `lib/film.js` | the shot runner: shots start on `[line, word]`, transitions sit on the cut, sound cues are exported |
| `ads/a1.js` … `ads/a5.js` | one ad per file |

Assets, fonts, voices and the credits list are shared with `../vibe-ads` (symlinked). Credits are in
`../vibe-ads/assets/CREDITS.md`. The reference videos used for study are not in the repo.
