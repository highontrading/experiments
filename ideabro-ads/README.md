# Ideabro Studio · AI & Advertising — 20 Meta ads (9:16)

Remotion project. Each ad is `src/ads/AXX.tsx`; shared toolkit (caption styles, end card, media, audio ducking) in `src/lib.tsx`.

- Voiceovers: ElevenLabs Eleven v4 (`work/tools/gen_vo.py`, scripts in `work/vo_scripts.json`; word timings in `src/data/vo/`).
- Music: ElevenLabs music_v2 (`work/tools/gen_music.py`); SFX: ElevenLabs sound generation.
- Footage: studio work from the course page, the user's Drive, Mixkit/Coverr free-licence stock, public-domain archive (LoC / Prelinger). See `assets/manifest.json` (not committed).
- Render all: `node work/tools/render_all.mjs` (renders, then two-pass loudnorm to -14 LUFS into `out/final/`).
- Stills for review: `node work/tools/stills.mjs work/stills "A01-ShootIsOptional:1,5,9"`.

Media is not committed (see `.gitignore`).
