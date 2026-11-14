# Lesson cutter

How the raw lecture recordings (`vid1.mov`, `vid2.mov`) became the 16 lesson videos.

1. Transcribe each recording with word timestamps (ElevenLabs speech-to-text) into `audio/<vid>.json`.
2. `python3 mklines.py audio/vid2.json v2.txt` gives a readable transcript with every pause marked; `ctx.py` prints exact word times around a cut point.
3. `lessons.py` is the edit decision list: which time ranges make each lesson, the hand-picked cuts (fumbles, tangents, phone rings) and the caption glossary.
4. `python3 cutter.py plan` previews lengths and every cut; `python3 cutter.py render all` exports.

What `cutter.py` does automatically: compresses silences over 0.8 s to about 0.5 s (never inside
trailer, film, music, SFX or ad playback), removes "uh"/"um", stutters and repeated restarts, builds
click-free audio, normalizes loudness, burns white captions (Inter SemiBold, thin outline) and
exports 1080p30 H.264 + AAC. Raw media and outputs are not stored in the repo.
