# Vibe Editing plugin

Step-by-step AI video editing in Claude Code. You upload a video; Claude asks what you want
at every step and shows you images to choose from. Nothing is rendered until you approve the
**storyboard**.

1. **Your video + brief**: where it's going (Meta ad, reel, YouTube, lesson), the kind of edit, target length, CTA
2. **Reference**: upload a reel or photos; Claude studies it and shows a style card
3. **Captions**: 8 caption styles (+ your reference's) rendered on your own video. Pick a letter
4. **Motion graphics**: kinetic type, labels, lower thirds, title cards, CTA button
5. **Music + sound effects**: your own, a free library (Openverse: Jamendo, Freesound), or ElevenLabs
6. **Colour look**: natural, bright, warm, cool, punchy, film, or your reference's colours
7. **Edit plan**: cuts (pauses, retakes, fillers), hooks, text moments, for your approval
8. **Storyboard**: numbered frames of the planned edit; change anything by panel number
9. **Render**: final video with a quality check (length, loudness, safe zones)

Skills: `vibe-edit` (the workflow), `vibe-style` (reference analysis), `vibe-setup` (install).

**Start here: [GUIDE.md](GUIDE.md).** Needs Claude Code, Python 3.9+, ffmpeg 5+. Runs on your
laptop. By Ideabro Studio · https://community.ideabrostudio.com/courses/vibe-editing
