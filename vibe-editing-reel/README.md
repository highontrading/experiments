# Vibe Editing Reel (recreating the "captions behind my head" edit)

| File | What it is |
| --- | --- |
| `BREAKDOWN.md` | Frame-by-frame analysis of the reference reel (991 frames at 30 fps): shot list, type system, every animation, grade, sound, build pipeline |
| `SCRIPT.md` | The "Vibe Editing" script mapped to shots, plus the recording rules |
| `reference/transcript_words.json` | Word-level timestamps of the reference (word, seconds, frame) |
| `reference/keyframes_k*.jpg` | Full-resolution key frames of each signature effect |
| `reference/contact_f000-059.jpg` | First 2 s at every frame (the intro orbit and matte flash) |

Next step: record the 8 shots in `SCRIPT.md`, upload them, and the edit gets built from them.

## The edit (from `Raw1`)

| File | What it is |
| --- | --- |
| `out/vibe_editing_reel.mp4` | The edited reel: 1080x1920, 30 fps, 36.6 s, -14 LUFS |
| `out/*_v2.mp4` | v2: ElevenLabs music bed + 13 ElevenLabs SFX used sparingly (`build/sound2.py`, sources in `build/sfx/`), every caption fully readable, lower captions kept above the Instagram caption bar, pulsing CTA on the ad |
| `out/vibe_editing_comparison_ad.mp4` | The raw take beside the AI edit, with "AI edited this." and a "Learn the workflow" CTA. All text sits inside the Reels safe zone. |
| `build/` | The pipeline: `edl.py` (cut plan), `matte.py` + `rvm_net.py` (subject matte), `gen_rooms.py` (AI rooms, SSD-1B + LCM-LoRA), `prep_data.py`, `stage.html/js` + `render.js` (the edit as code), `sound.py` (SFX + mix), `comp.py` (comparison ad) |

The rooms were generated locally with Segmind SSD-1B (Apache-2.0) and the LCM-LoRA (OpenRAIL++).
The fonts are Google Fonts under the OFL.
