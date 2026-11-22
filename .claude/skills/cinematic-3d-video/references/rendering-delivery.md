# Rendering budget, distributed rendering, assembly and delivery

## Contents
1. Budget math
2. Preview vs final settings
3. Distributing frames across cloud sessions
4. GPU option
5. Assembly, grade, social exports
6. Verification before handing over

## 1. Budget math
Measure, don't guess: render ONE final-quality frame at full res and time it
(`time blender -b scene.blend -P render.py -- still F out.png`). Then:
`total = seconds_per_frame x frames / machines`.
Reference numbers (4 CPU cores, 720x1280, 48 samples adaptive 0.02, OIDN, the retro desk scene):
~100 s/frame on the coordinating machine, ~65 s on fresh worker sessions. 168 frames on 7 machines ~ 30-40 min.
1080x1920 costs ~2.25x; doubling samples ~1.7x; a volume box ~1.5-2x.

Render 720x1280 and upscale to 1080x1920 in assemble.sh unless the budget allows native 1080p -
with grain and bloom on top, the difference is hard to see on a phone.

## 2. Settings
| Stage | Command | Purpose |
|---|---|---|
| Look-dev | `render.py -- still F out.png --pct 30 --samples 16` | composition, light direction (~15-30 s) |
| Look-dev detail | `--pct 50 --samples 24` | materials, focus, readability |
| Timing test | `--pct 100` (scene samples) | the number for the budget |
| Final | `render_chunk.sh scene.blend S E` | 8-bit PNG frames -> near-lossless chunk |

Keep the scene's own samples at 48 (adaptive 0.02) for finals: OIDN with albedo/normal passes
holds texture detail, and the grain in post hides residual denoise smoothness. Go to 64-96 only if
you see blotchy/flickering shadows in a contact sheet.

## 3. Distributing frames across cloud sessions
When `create_session` (claude-code-remote) is available, fan out instead of waiting hours:
1. Put the scene project (scene.py, its texture scripts, any generated images, an `assets.txt`
   or setup script listing the Poly Haven ids) in the repo, commit and push the working branch.
   Do not commit downloaded assets or .blend files - workers re-fetch them (deterministic, CC0).
2. Split frames into equal ranges (24 frames each works well). Keep one range for yourself and
   start it with `run_in_background`.
3. Create one session per range with `source_url` = repo, `source_revision` = your branch, and a
   self-contained prompt like:

   ```
   You are a render worker. Do exactly this without asking questions:
   1. cd <repo>/<project dir>. Run: export CINE_LIB=<repo>/.claude/skills/cinematic-3d-video/scripts
   2. Run the project's setup (fetch assets, make textures) then build:
      $(bash $CINE_LIB/setup_blender.sh) -b -P scene.py -- scene.blend   (Bash timeout 600000)
   3. Run `bash $CINE_LIB/render_chunk.sh scene.blend S E chunks` with run_in_background; wait for it.
   4. Check chunks/chunk_SSSS_EEEE.mkv has E-S+1 frames (ffprobe -count_frames).
   5. git add -f the chunk, commit "Render chunk S-E", push to your session's development branch
      (if push is rejected: fetch, merge, push again).
   6. send_message to session_id <coordinator id>: "CHUNK S-E DONE branch=<branch>" or "CHUNK S-E FAILED: <why>".
   Do not modify scripts. Do not open a pull request.
   ```
4. End your turn; worker messages arrive as notifications. On each: `git fetch origin <branch> &&
   git merge --no-edit FETCH_HEAD`, verify the chunk's frame count.
5. Workers that report "idle" right after starting are fine - they're waiting on their background render.
   Check `list_events` only if one goes quiet far past the expected time.

Everything must be deterministic across machines: seeded RNG (`cine.reset(seed)`), same Blender
version (setup_blender.sh pins 4.2.3), same asset resolutions.

## 4. GPU option
If the user has a GPU box (e.g. Higgsfield `gpu_rent` with credits, or their own machine), set
`sc.cycles.device = 'GPU'` and enable OptiX/CUDA in preferences in the scene script; a single
modern GPU is typically 20-50x a 4-core CPU. Always quote the hourly price and get approval
before renting anything.

## 5. Assembly
```
bash scripts/assemble.sh chunks out/film.mp4 out/mix.wav 1080x1920
```
Produces `film.mp4` (master, crf 14 - large because of grain) and `film_social.mp4` (~14 Mbps,
what to upload). Override the look with `GRADE="..." bash assemble.sh ...`.
Other aspect ratios: render at 1280x720 / 1080x1080 and pass `1920x1080` / `1080x1080`.

## 6. Verify before handing over
- `ffprobe` frame count = sum of chunk ranges; duration matches the sound plan.
- `contact_sheet.sh film.mp4 sheet.jpg 2` and look at it: continuity across chunk boundaries,
  no black/duplicate frames, grade consistent.
- Look at one full-res frame from each shot.
- Then send the social file to the user (SendUserFile) and say what's in it, honestly, including
  anything that differs from the brief.
