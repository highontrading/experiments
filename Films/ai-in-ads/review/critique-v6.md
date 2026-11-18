# Critique: draft-v6

1. **53.4–54.2 s** · The robot arm swings in across the lit window and its gripper sits on top of the refrain plate, covering "아라리요" for about half a second (strip-53.8s, both frames). It reads as one thing passing through another, and it hides the one line the film is about at the moment "The machine writes the verses now" lands. **Fix:** move the arm's path down by about 60 px (at 960x540), so the gripper stays below the plate's bottom edge, or have it stop about 20 px short of the plate. Do not let it cross the plate.
2. **2–7.5 s** · The "versions of one advert" plate runs off the left edge of the frame, so the "v" is clipped from about 4 s to 7.5 s (strip-5s, sheet tiles 5–7). The counter hexagon also sits hard against the top-left corner, and the robot's head is cut by the right edge. The first title of the film looks cut off. **Fix:** shift the counter and plate group about 40 px right and 15 px down, and the robot about 30 px left, so each keeps a margin of at least 24 px.
3. **13–23 s** · The refrain plate the whole film hangs on is too small to read on a phone: about 14% of the frame wide, with Hangul about 7 px tall at 540p (strip-14.5s, strip-21s). A second, dimmer copy is cut by the left frame edge at 15 s and 21–22 s. It only becomes readable at 25 s. **Fix:** scale the plate up by about 1.8x from its first appearance at 13 s, matching its size at 26 s, and move the duplicate inside the frame or drop it.

Verdict: FIX
Red items:
- 53.4–54.2 s robot arm crosses and hides the refrain plate
- 4–7.5 s "versions of one advert" plate clipped by the left frame edge
Polish: The refrain is unreadable on a phone at 13–23 s (scale it up). From 33–37 s the grid of heads only gets denser, with no new event: let one window go dark, or let one card land, before the cut. The robot is also cut by the right edge at 59–62 s; pull it in about 30 px. Sound is on target (-13.8 LUFS, peak -2.5 dBFS, no unscripted silence, no scene flagged).
Evidence: sheet.jpg (every 1 s, 0–62 s); strips at 4.5 s, 36 s and 53.5 s (12 frames each); 2-frame strips at 5 s, 14.5 s, 21 s, 53.8 s and 61.4 s; report.txt (hook PASS, cuts at 7.5/12.5/27.5/45.0, no black/frozen/duplicate/pop/repeat frames, scene 3 flagged camera-led, I -13.8 LUFS, LRA 7.7, peak -2.5 dBFS, no silences).
