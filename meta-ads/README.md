# Meta ads: AI & Advertising (Ideabro Studio)

There are 20 ads. Each is a single file in `ads/aNN.js`, drawn on one canvas by the shared engine in `core.js` and rendered with headless Chromium.
`ADS.md` has the theme, caption style and ready-to-paste Meta copy for every ad. `out/` has the MP4s and `_all_ads_overview.jpg`.

| File | Role |
| --- | --- |
| `vo_spec.py`, `vo.py` | VO scripts (Roman captions + Devanagari TTS for Hinglish) → ElevenLabs **eleven_v4** with timestamps |
| `build_tl.py` | places VO lines and maps caption words onto the TTS timing → `build/<ad>/tl.js` |
| `sfx.py` | SFX with ElevenLabs **eleven_text_to_sound_v3** |
| `seqs.py`, `prep.py` | which video clips each ad uses (Drive / Mixkit) → frame sequences |
| `core.js` | engine: palette, fonts, ~12 caption styles (pop, block, subtitle, clean, highlight, serif, typewriter, split-flap, pixel, handwritten, meme, gold), end card, grain |
| `ads/aNN.js` | each ad's scenes, timing, music and SFX cues |
| `render.js`, `mix.py`, `master.sh`, `make_ad.sh` | render → mix (VO ducking) → master (−14 LUFS) → encode |
| `tools/` | Mixkit indexers, QA contact sheets, poster grid |

```bash
python3 vo.py && python3 build_tl.py && python3 sfx.py   # audio (needs ELEVENLABS_API_KEY)
./make_ad.sh a07                                         # build one ad -> out/a07_*.mp4
node render.js a07 --times 1,4,8                          # quick stills -> build/stills/
```

## Changing things

- **Price or offer:** edit `endCard()` in `core.js`. Every ad's end card updates together.
- **A line of copy:** VO ads use `vo_spec.py` (then `python3 vo.py <ad>` after deleting that ad's `build/vo/<ad>_*` files, then `python3 build_tl.py <ad>`). Text-only ads are edited in their `ads/aNN.js`.
- **Brand colours and fonts:** they're at the top of `core.js` (`C`, `F`).
