# W07: Voiceover + Dubbing (Hindi / English / Hinglish)

**Goal:** Make a clear, natural voiceover for your ad, and the same ad in a second language.
**Time:** 30–60 minutes · **Used in:** Lecture 6

**Tools + models:** ElevenLabs (text to speech, dubbing) · Suno (music) · Claude with `vibe-editor`
**Skills:** `sound-director`, `vibe-editor`
**Inputs:** final script with timings, the edited video (or the shot list)

---

## Steps

**1. Write for the ear** → *AI chat* + `sound-director`
- Give it the script and the total time. Ask for a VO script that fits the time (about 2.3–2.6 words per second in English; Hindi usually needs a little more time).
- **Output:** VO script with pauses marked, plus voice direction (age, accent, energy, pace).
- **Check:** read it out loud with a stopwatch. Too long? Cut words, don't speed up.

**2. Pick the voice** → *ElevenLabs*
- Filter by language and accent (Indian English, Hindi). Test 3 voices with your first line. Pick the one that matches the Brand Bible.
- Save voice name + settings in the Brand Bible.

**3. Generate** → *ElevenLabs text to speech*
- Generate line by line or in 2–3 chunks (easier to fix one line).
- Use punctuation to direct: commas for small pauses, "..." for longer pauses, short sentences for punch.
- Make 2–3 takes of the key lines (hook, CTA).
- **Check:** pronunciation of the brand name. Fix by spelling it how it sounds (e.g. "Kay-sar and Co.").

**4. Hindi / Hinglish version** → *AI chat* + `sound-director`, then *ElevenLabs*
- Don't translate word for word. Ask for an adaptation: same meaning, same length, natural spoken Hindi or Hinglish.
- Generate with a Hindi-capable voice, or use ElevenLabs dubbing on the finished English VO/video.
- **Check:** a native speaker listens once. Does it sound like a person, or like a translation?

**5. Music** → *Suno* + `sound-director` jingle brief
- Instrumental bed at the right BPM and length. Make it a little longer than the video.

**6. Mix** → *Claude* + `vibe-editor`
- "Add vo.mp3 starting at 0.5 s, music under it with ducking, music fades out over the last 1.5 s, loudness -14 LUFS."
- **Check:** VO clearly louder than music on phone speakers.

---

## Finished-output checklist
- [ ] VO fits the time without rushing
- [ ] Brand name pronounced correctly
- [ ] Hindi / Hinglish version adapted, not translated
- [ ] Music ducks under VO; ends cleanly
- [ ] Voice and music plans allow commercial use
