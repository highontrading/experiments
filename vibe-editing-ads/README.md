# Vibe Editing: Meta ads

Three premium-edited ads for **Vibe Editing**, cut from the raw selfie takes (IMG_2508 / 2511 / 2512).
The edit is the pitch: the first half is styled as the "typical AI edit" the script mocks
(flat grade, yellow Montserrat captions, emoji pops, an "AI EDIT DETECTED" scan). On "but see my edit"
it glitches, flashes and flips into the premium look: warm cinematic grade, serif + grotesk kinetic
captions, words tucked behind the head with a depth matte, orbiting words, halo rings, a workflow panel,
a comment-VIBE bubble and a "Learn the workflow" CTA and end card.

| File (`out/`) | Ad | Length |
| --- | --- | --- |
| `VibeEditing_Ad1_English_9x16.mp4` / `_4x5.mp4` | IMG_2508, English, wall → sunset reveal | 30.8 s |
| `VibeEditing_Ad2_Hinglish_9x16.mp4` / `_4x5.mp4` | IMG_2511, "words moving around my head" | 36.2 s |
| `VibeEditing_Ad3_Hinglish_9x16.mp4` / `_4x5.mp4` | IMG_2512, "captions you are seeing right now" | 33.3 s |

9:16 (1080x1920) is for Reels / Stories; 4:5 (1080x1350) is the feed cut, a centre crop that keeps the
title, the card and the CTA. H.264 High, 30 fps, AAC 256k, −14 LUFS.

## The edit decisions (edit/cuts.json)

- **2508**: opening "So", the repeated "Everything looks very basic" and the walk to the terrace
  ("how I edit this type of videos") are cut; the wall→sunset jump becomes the reveal.
- **2511**: opening "So", filler "Like"s, the "A-anyone" stutter, a 4 s dead pause, the abandoned
  "So if you want to learn premium skills--" restart and the car-horn tail are cut.
- **2512**: the repeated "and every edit is looking very basic", filler "And"/"Like" are cut.
- All pauses over 0.3 s are tightened. Every cut was re-transcribed to confirm no word was clipped.

## Pipeline

| Step | Tool |
| --- | --- |
| HDR (HLG) → SDR tone map, 2560x1440 intermediates, warm grade | ffmpeg zscale + hable, `tools/extract.sh` |
| Word timestamps | ElevenLabs Scribe |
| Cut list from word ranges + audio energy | `tools/build_edl.py` |
| Dialogue: 12 ms crossfades, denoise, EQ, de-ess, compression | `tools/cut_audio.py` |
| Portrait matte per frame (text behind head) | MODNet (Apache-2.0), `tools/matte_batch.py`, `tools/neck.py` |
| Creative timeline (captions, MG, camera, SFX) keyed to word indices | `tools/timeline.py` |
| Frame renderer: canvas stage in headless Chromium | `stage.html`, `stage.js`, `render.js` |
| Music bed (ElevenLabs Music) on a bar grid, downbeat on the reveal; SFX (ElevenLabs) | `tools/mix.py` |
| Encode 9:16 + 4:5 | `tools/encode.sh` |

Theme: near-black backdrop that warms into an ember/amber glow at the reveal, film grain, Inter Tight +
Instrument Serif Italic, amber `#FFB15C` → ember `#FF7A2F`, a floating rounded card. Fonts are OFL.

`./make.sh` rebuilds everything once the raw clips are tone-mapped into `/home/user/work`.
