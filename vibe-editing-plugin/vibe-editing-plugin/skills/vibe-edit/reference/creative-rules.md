# Creative rules (the taste layer)

The engine does the mechanical edit. These rules are for the calls you make in stage 4.
They are defaults: the user's direction and the reference style always win.

## Cuts and pacing
- Reels: `tight`. Remove every pause over ~0.3 s, all false starts, all "um/uh".
- Lessons / long-form: `natural` or `relaxed`. Keep breathing room; only cut pauses over 0.5–0.9 s
  and real mistakes. Students need time to think.
- A pause before a punchline or a reveal is content. Restore it.
- A deliberate repeat ("Never. Never.") is content. Restore it.
- Never cut mid-word. If a cut sounds abrupt, extend the kept segment by 0.05–0.1 s.

## Hook (first 1–3 seconds)
- Max ~7 words, from the person's actual point. Pattern ideas: the result ("I edit reels in 15
  minutes"), the contrarian line ("Stop editing on a timeline"), the curiosity gap ("This one
  setting changed my reels").
- Write 3 options; put the strongest first. No clickbait the video doesn't pay off.
- For lessons: usually no hook text; use a title card or lower third instead.

## Captions
- One idea per line. 2–4 words per line for reels, 5–8 for 16:9.
- Emphasis: the payoff word of a line, numbers, money, results. At most 1 per line, and not on
  every line, or nothing stands out.
- Fix spelling of names, brands, tools (Claude, ChatGPT, Premiere, DaVinci, Higgsfield…).
- Keep captions above the bottom 20% on 9:16 (`position_y` ≤ 0.78) and below the top 12%.
- If the reference uses one-word-at-a-time captions, use `highlight: word` and size 110–140.

## Punch-ins (zoom)
- Alternate 1.0 / 1.10–1.15 on cuts for talking heads. That hides jump cuts.
- Bigger punch (1.2–1.25) only on a key line, not twice in a row.
- No punch-ins on lessons unless asked.

## Motion text
- Kinetic type: the 1–3 most important words of a key sentence, timed to when they're said.
- Lower third: the speaker's name/title in the first 5 s of a video that introduces someone.
- Labels: steps, tools, numbered points ("STEP 2 · CAPTIONS").
- Title card: section breaks in lessons.
- Density: about one text element per 8–12 s for reels; less for lessons. Never stack two
  text elements over the captions at the same time.

## Sound design
- Voice first: `voice_cleanup: true`, final loudness -14 LUFS.
- Music: ducked under speech, level -20 to -24 dB. Lessons: -26 or no music.
- SFX: whoosh on punch-in cuts (not every one: medium density = every 2nd), pop on kinetic
  text and hook, ding on a reveal or result, riser into a big moment (place it so it ends on the
  moment: `t` = moment, `offset` = −1.5), impact/boom for one dramatic hit per video at most.
- SFX gain around −11 dB; whooshes a bit lower (−15 dB). If in doubt, quieter.

## Look
- With a reference style: `lut_from_reference: true`, strength 0.4–0.7. Faces must still look
  like skin. If they turn orange/green, lower the strength.
- Without: contrast 1.03–1.08, saturation 1.05–1.12, vignette 0.1–0.2, sharpen 0.3.
- Grain only if the reference has it.

## Meta ads (Instagram / Facebook)
- The first 2 seconds decide everything: open on the strongest line or the result, with the
  hook text on screen. Cut any warm-up ("Hi guys, so today…").
- Captions always on (most people watch muted), large, high contrast, inside the safe zone:
  nothing important in the top 14% or the bottom 35% of a 9:16 ad.
- One idea per ad. 15–30 s for cold audiences, up to 60 s for warm ones.
- Show the offer as text at least once (kinetic or label) and end on a CTA button
  (`cta` text) in the last 2–3 s, matching the ad's CTA.
- Music: upbeat but under the voice (−20 to −24 dB, ducked). Use licences that allow commercial
  use; prefer no-credit ones (CC0) or the user's own / ElevenLabs tracks.
- Offer 4:5 (feed) and 1:1 versions after the 9:16 is approved.

## Lessons (course videos)
- `--platform lesson`: 16:9, smaller captions at the bottom, no hook, no punch-ins, natural pace.
- Add a title card at the start of each section and lower-third labels for key terms.
- Cut retakes and long silences, but keep the teacher's rhythm.
