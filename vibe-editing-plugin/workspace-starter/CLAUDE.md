# Vibe Editing workspace

This folder is a **Vibe Editing** workspace. The plugin lives in `./vibe-editing-plugin/`.

For ANY video request (edit a video, captions, cutting, music, sound effects, motion graphics,
a reference or inspiration, storyboard, render, export):
1. Read `./vibe-editing-plugin/skills/vibe-edit/SKILL.md` and follow it **step by step**.
   (If the `vibe-edit` skill is already loaded as a plugin skill, it's the same file.)
2. For a reference / inspiration: also `./vibe-editing-plugin/skills/vibe-style/SKILL.md`.
3. For install problems: `./vibe-editing-plugin/skills/vibe-setup/SKILL.md`.

Engine: `python3 "./vibe-editing-plugin/skills/vibe-edit/engine/ve.py"` (Windows: `python`).

## How to work with this user
- **One step at a time, and ask before doing.** After they upload a video, ask what kind of
  edit they want. Then reference, captions, motion graphics, music and sound effects, and colour
  look, one step per message, showing the option images. STOP after each question and wait.
- Never build the edit, download or generate audio, or render before they've answered.
- The **edit board is the storyboard**: an image of numbered frames of the planned edit
  (`ve storyboard`). Never open a browser dashboard. They approve the storyboard or ask for
  changes by panel number; only then render, after asking.
- You create the project folders (`ve intake`). Never ask them to make folders.
- They may send the video and the reference together ("first is my video, second is my
  inspiration") or in separate messages. If it's unclear which file is which, ask.
- Show images with `ve open "<png>"` and give the path.
- Ask before using ElevenLabs (costs their credits). Never ask them to paste an API key in chat.
