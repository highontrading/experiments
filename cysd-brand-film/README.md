# CYSD — Brand Film (Annual Report 2025–26)

A 90-second brand film for **CYSD, the Centre for Youth and Social Development** (Odisha,
since 1982), built from the 2025–26 Annual Report. It follows an archival collage look:
aged paper, typewritten documents, black-and-white cut-out photographs, one cornflower-blue
"play" triangle as the recurring accent, and rubber-stamp imprints. In the climax the
pictures bloom from black and white into colour on the word "Together".

| File | What it is |
| --- | --- |
| `out/cysd_brand_film.mp4` | the film: 1920x1080, 30 fps, 90 s, H.264 + AAC, narrated |
| `out/cysd_brand_film_no_vo.mp4` | the same picture with music and SFX only (no narration) |
| `out/cysd_brand_film_attentionlabs.mp4` | client preview: the narrated film with the Attention Labs watermark, bottom right |
| `out/cysd_brand_film_attentionlabs_no_vo.mp4` | client preview, music and SFX only, watermarked |
| `out/poster.jpg` | a still for thumbnails |
| `src/index.html` | the whole film as `setTime(t)`: 13 scenes, transitions, grain, dust, shake |
| `src/render.js` | renders frames or stills with headless Chromium (Playwright) |
| `src/process.py`, `src/cut.py` | photo treatment (B&W grade, grain, cut-out stroke) and background removal |
| `src/footage_segments.txt` | which stock clips and in-points the film uses |
| `audio/vo.py`, `audio/sfx.py`, `audio/mix.py` | narration, sound effects and the final mix |

## Structure

| Time | Scene | Narration |
| --- | --- | --- |
| 0:00 | File open: "Odisha, 1982." typed, EST. 1982 stamp | — |
| 0:04 | Chapter 01: volunteers cut-out, blue triangle with sunrise footage | "In 1982, a handful of young volunteers…" |
| 0:12 | The founding belief, word-synced quote over sowing footage | "…lasting change begins when people believe…" |
| 0:20 | Timeline 1982 → 2025, ends on 44 YEARS | "Forty-four years on, that belief has taken root." |
| 0:24 | Outreach map of Odisha, 6,80,000+ lives, 1,440 villages, 13 districts, 72% tribal, 83% women | "…over six lakh eighty thousand lives…" |
| 0:32 | 01 Personal: 350 leaders, 684+ volunteers, 53 youth clubs | young community leaders |
| 0:40 | 02 Social: 96.4% immunisation, 141 children recovered, 18,228 linkages | mothers and children |
| 0:46 | 03 Economic: 55,304 households, 20,134 farmers, 1,57,815 quintals | farmers and fair markets |
| 0:52 | 04 Ecological: 11,402 ha natural farming, 17 water bodies, 222.5 acres | healing the land |
| 0:58 | 05 Institutional: 299 Palli Sabhas, 154 Gram Sabhas, 9 Special Mahila Gram Sabhas | local democracy |
| 1:05 | Montage of field photos and press clippings, colour bloom on "Together." | "…something people do, together." |
| 1:13 | ENABLE · EMPOWER · INCLUDE stamped on the beat | the CYSD motto |
| 1:20 | Logo end card, tagline, 44 years, www.cysd.org | "Rooted in communities…" |

All figures come from the Annual Report 2025–26 (Outreach, p. 5; Key Programmatic
Achievements, p. 7).

## Sources

- **CYSD photographs**: images from the Annual Report 2025–26 and from www.cysd.org.
- **Stock footage**: [Mixkit](https://mixkit.co/license/#videoFree) (free licence): rice
  terraces, misty valley sunrise, hand sowing seeds, germinating beans, farmer in a paddy,
  tea plantation, falling rice, fishing boats at sunrise, light leaks.
- **Map**: the Outreach map from the report, re-coloured.
- **Music, narration and sound effects**: generated with ElevenLabs (Eleven Music, a
  library Indian-English narrator voice, and the Sound Effects model).
- **Fonts**: Playfair Display, Special Elite, Oswald (Google Fonts, OFL).

## Build

Requires Node with `playwright` (Chromium), Python 3 with `numpy`, `scipy`, `Pillow`,
`rembg`, and `ffmpeg`. The asset folders (`img/`, `fonts/`, `frames/`) that
`src/index.html` reads are produced by `process.py`, `cut.py` and the ffmpeg commands
for `footage_segments.txt`. They are not committed, because the frames alone are ~350 MB.

```bash
node render.js stills 6.5,26.5,72.2 ../stills 4     # check frames
node render.js frames 0 2700 ../out 4               # all 2700 frames
python3 ../audio/mix.py                              # mix.wav
ffmpeg -framerate 30 -i ../out/%05d.jpg -i mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k cysd_brand_film.mp4
```
