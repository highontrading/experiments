# The chain prompt

Paste this into Claude Code from the repo root and replace the two placeholders. It runs the three layers in
order and stops at the points where a human ear is worth more than a model.

---

```
Sound-design VIDEO.mp4 with real sounds using the three-layer stack in sfx-stack/ (read sfx-stack/README.md
first; the skills are in .claude/skills/real-sfx and .claude/skills/earshot).

0. Setup check: run `bash sfx-stack/setup.sh` if `~/.venvs/sfx/bin/earshot doctor` fails. Use
   ~/.venvs/sfx/bin/python for every earshot step.

1. Moments first (real-sfx). Find every moment that needs a sound, BEFORE sourcing:
   - if the project writes an event list or synthesizes its own sound (timeline.py, cues.json, audio.cjs),
     export that list - it beats frame analysis;
   - otherwise run real-sfx look.py + find_moments.py --fine on the video and write the event list from
     the frames (references/typed-cues.md): the frame where each thing STARTS to happen.
   List the distinct event kinds and how many of each.

2. Source (Openverse). Write sfx-stack/plans/<name>.json: one entry per event kind with 3-4 search queries
   and a one-line "listen" description of the ideal sound. Run openverse_fetch.py (CC0/PDM only unless I say
   otherwise; 6-12 candidates per type).

3. Listen and pick (earshot). Run earshot_pick.py on the candidates. It keeps files that match the "listen"
   line (strong/plausible) and that earshot hears as real recordings, and has earshot make new takes for any
   type with fewer than 3 survivors. Show me the picks table (type, kept, made, best z). If a type is thin,
   rewrite its queries or "listen" line and run steps 2-3 again for that type only.

4. Place (real-sfx). Register the library (setup.py add-library openverse sfx-stack/library --tier main
   --index), then from_cues.py with --ui library and --kind for any kind real-sfx does not know, mix.py
   --plan, then mix.py. If the video has its own synthesized SFX, take them OUT (stems or unbake) so nothing
   doubles; keep music and voice.

5. Check (both). Run real-sfx critique.py and earshot timeline/critique on the result. Fix what they flag
   (sheet.py set / levels.py) and re-mix until critique is 8+. Then give me: the new MP4, the SFX-only WAV,
   CREDITS.md, and the five timestamps critique says I should listen to myself.

Do not present any pick as "listened to": say what earshot measured and what I still need to hear.
```

---

## Why this order

- **Moments before sounds.** Sourcing per event kind (not per "whatever sounds cool") keeps the film one
  palette: 13 whooshes come from the same 6 kept files, pitch-cycled by real-sfx.
- **Openverse gives breadth, earshot gives judgment.** Search text on Freesound is written by uploaders and is
  noisy; a CLAP score against a plain description and a realness check throw out the 60-80% that would not work.
- **Generated is the fallback, not the default.** earshot's catalogue is learned from public-domain recordings,
  but a real recording from a person with a microphone still wins when one exists.
- **real-sfx owns the timeline.** It lands each sound by its audible start or peak on the exact frame, matches
  the author's levels, tunes pitched sounds to the score and removes the synthesized layer it replaces.
