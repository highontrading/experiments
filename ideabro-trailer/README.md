# Ideabro Studio · AI in Advertising trailer

56-second course trailer, 16:9 and 9:16, built in Remotion and modelled on the pacing and devices of the AI Masterclass trailer.

## Pipeline
1. `work/script.json`: narration lines. `work/tools/gen_vo.py` generates them with ElevenLabs (voice "Brian").
2. `work/tools/build_vo.py`: trims pauses, applies tempo, writes `work/vo_timeline.json` with word timings.
3. `work/tools/make_timeline.py`: builds `src/data/timeline.json` (scene boundaries, caption cards, SFX cues). Picture and sound both read it.
4. `work/tools/prep_assets.py`: builds `src/data/assets.json` from `public/`.
5. `work/tools/mix.py`: mixes VO, music (`audio/music/bed_v3.mp3`) and SFX to `audio/mix_final.wav` at -14 LUFS.
6. Render: `npm run render:h` / `npm run render:v` (add `--muted`), then mux with the mix.

Media (studio clips, public-domain archive material, audio) is not committed; see `.gitignore`.
