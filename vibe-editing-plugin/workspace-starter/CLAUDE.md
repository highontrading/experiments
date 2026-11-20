# Vibe Editing workspace

This folder is a **Vibe Editing** workspace. The editing skills live in `./vibe-editing/skills/`.

For ANY video request (edit a video, cut dead space or retakes, captions, hook, sound design,
music, colour, motion text, "edit it like this", a reference or inspiration, render, export):
1. Read `./vibe-editing/skills/vibe-edit/SKILL.md` and follow it. (If the `vibe-edit` skill is
   already loaded as a plugin skill, it's the same file. Use it.)
2. For copying a style from a reference video or photos, also read
   `./vibe-editing/skills/vibe-style/SKILL.md`.
3. For install problems, read `./vibe-editing/skills/vibe-setup/SKILL.md`.

The engine: `python3 "./vibe-editing/skills/vibe-edit/engine/ve.py"` (Windows: `python`).

## How the user works here (keep it short for them)
- They give you files in any order: in one message or across several, attached in the chat,
  dropped loose in this folder, or as a path. Usually "the first is my video, the second is my
  reference / inspiration". If it's unclear which is which, ask once.
- **You** create the project folders. Never ask the user to make folders or move files:
  `ve intake --video "<file>" --ref "<file>"` (or `--project <name> --ref "<file>"` when the
  reference comes later). It copies files from outside this folder and moves loose files in.
- If the reference arrives after you planned the edit: scrape it (vibe-style), then
  `ve restyle <project> --style <name>`. That keeps the cuts, caption text, hook and sound.
- Default to **quick mode** (see the vibe-edit skill): no questionnaire, sensible defaults,
  straight to the edit board. Tell the user in one line which stage you're in.
- Rendered videos go to `<project>/out/`. Tell the user the file name when done.
