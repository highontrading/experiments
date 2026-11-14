# Lecture 06: Sound, voice and music

- **Target raw length:** 45–55 min (4 lessons of 10–14 min)
- **Lessons covered:** 6.1 Voiceovers and dubbing in Hindi and English · 6.2 AI music and brand jingles · 6.3 Directing dialogue and lip-sync · 6.4 Sound design that sells
- **Level:** 2 (Motion & sound)

## Before you hit record

- **Tabs open:** ElevenLabs, Suno, Google Flow (Google Omni Flash 1.2 with sound), Claude (Kesar Project).
- **Files open:** `workflows/W07-voiceover-and-dub.md`, `prompt-library/audio.md`, the 15s and 30s Kesar scripts from Lecture 2.
- **Skills ready:** `skills/sound-director/SKILL.md`, `skills/vibe-editor/SKILL.md`.
- **Headphones on** for checking, but play the audio out loud for the recording (or route system audio into your recorder).
- **Pre-generate:**
  - Kesar 15s VO in English and in Hindi/Hinglish (2 voices each).
  - 2 Suno jingle options plus a 5-second sonic logo.
  - 1 Flow clip of Meera saying one line (native audio).
  - The Kesar 15s cut in 3 versions: silent, music only, full sound design.

## Cold open (30–60s)

Play the same 15s ad twice: first silent, then with the full mix.

> **"Same pictures. One feels like an ad, one feels like a brand. Sound is half the ad, and it's the half most people skip."**

---

## Lesson 6.1: Voiceovers and dubbing in Hindi and English

Say **"LESSON 6.1"** on camera.

- **Goal:** A directed VO in English and Hindi/Hinglish, timed to the 15s script.

**Talking points**
1. **"A voice is casting. Pick it like you'd pick an actor."** Age, warmth, energy, accent.
2. Write the VO for the ear: short sentences, one idea per line, numbers written the way they're spoken ("aath sau ninyanve rupaye" or "eight ninety-nine").
3. Directing with text: use punctuation for pauses (… and —), CAPS sparingly for emphasis, and write the emotion before the line.
4. Timing: 15 seconds ≈ 30–35 English words. Hindi runs a little longer, so cut words rather than speeding the voice up.
5. Hinglish for metros, pure Hindi for Tier 2/3, regional languages when you have the budget. **"Speak the language your customer thinks in."**
6. Dubbing: keep the same voice across languages so the brand sounds like one person.

**Live demo**
1. Attach `skills/sound-director/SKILL.md`:
   ```
   Write the VO for our 15s Kesar Diwali script in English and in Hinglish. Add ElevenLabs direction: voice type, pace, emotion per line, and pauses. Must fit 15 seconds.
   ```
2. In ElevenLabs, pick a warm female voice in her late 20s. Paste the Hinglish line with its direction, e.g.:
   ```
   (warm, a little rushed) Party mein do ghante… aur parlour slot? Zero.
   (calm, smiling) Bas teen drops. Kesar & Co. Saffron Glow.
   (confident) Diwali glow, ghar pe. Free mini with every order.
   ```
3. Generate 2 takes, compare them, pick one. Then show the English version in the same voice.
4. Download as WAV to `04_audio/`.

**Show on screen:** the VO script with direction notes, the ElevenLabs settings, waveform A/B.

**Common mistakes**
1. Writing the VO like printed ad copy, so it sounds robotic.
2. A VO that's too long, then sped up to fit.
3. A different voice in every ad of the campaign.

**Student gets:** `student-kit/skills/sound-director/SKILL.md`, `student-kit/workflows/W07-voiceover-and-dub.md`, `student-kit/prompt-library/audio.md`

**Assignment:** Make your 15s VO in two languages or styles.

---

## Lesson 6.2: AI music and brand jingles

Say **"LESSON 6.2"** on camera.

- **Goal:** A brand jingle and a 5-second sonic logo.

**Talking points**
1. **"A sonic logo is the 5 seconds people remember with their eyes closed."**
2. A jingle brief has: genre, BPM, mood, instruments, vocal type, a lyric hook with the brand name, and the length.
3. Write the lyrics yourself (or with the skill). Keep the brand name to 2–3 syllables and singable.
4. Music under VO: instrumental, lower energy, no lyrics fighting the voice.
5. Commercial use: check your Suno plan's terms before using it for a client.

**Live demo**
1. `sound-director`:
   ```
   Write a Suno jingle brief for Kesar & Co. Diwali: festive Indian pop, warm, shehnai and dhol with a modern beat. Give me lyrics (Hinglish), a style prompt, and a separate 5-second sonic logo prompt. Also an instrumental bed for under VO.
   ```
2. In Suno, paste the style prompt and the lyrics. Example style line:
   ```
   festive Indian pop, 100 BPM, shehnai melody, soft dhol groove, warm female vocal, bright and celebratory, modern clean mix
   ```
3. Play the 2 pre-made jingle options and the sonic logo. Pick one.

**Show on screen:** the jingle brief, the Suno screen, the lyrics on screen with the brand name highlighted.

**Common mistakes**
1. A full song when you needed 15 seconds.
2. A brand name hidden in the middle of a long line.
3. Music with vocals under a voiceover.

**Student gets:** `student-kit/prompt-library/audio.md` (jingle section)

**Assignment:** Make a jingle or sonic logo for your brand.

---

## Lesson 6.3: Directing dialogue and lip-sync

Say **"LESSON 6.3"** on camera.

- **Goal:** One believable talking shot.

**Talking points**
1. Two ways to do it:
   - **Native audio in the video model:** write the line inside the Flow prompt (Google Omni Flash 1.2) so the voice and lips come together.
   - **Separate:** make the VO in ElevenLabs, then use a lip-sync tool on the clip.
2. **"Short lines. One sentence per shot. Long dialogue is where AI faces fall apart."**
3. Write the delivery: "says warmly, smiling, looking into the camera".
4. Check: mouth shapes match the words, eyes blink naturally, no teeth glitches.
5. If the mouth looks wrong, cut to a product shot over the line. **"The edit can save the take."**

**Live demo**
1. `sound-director`:
   ```
   Write a Flow prompt where Meera says one Hinglish line to camera with native audio. 6 seconds. Keep her face consistent with the sheet.
   ```
2. In Flow (Ingredients/reference to Video with Meera's sheet):
   ```
   SHOT TYPE: medium close-up, selfie-style, eye level.
   SUBJECT & ACTION: Meera sits at her dresser, holds the Kesar & Co. serum next to her face, smiles and says to camera: "Diwali party mein do ghante bache the… aur yeh glow? Teen drops."
   CAMERA MOVE: locked-off, very slight handheld feel.
   LIGHT & MOOD: warm evening light and diya glow, friendly and real.
   SOUND: her voice clear and natural, light room ambience, faint festive sounds outside.
   DURATION/PACE: 6 seconds, natural speaking pace.
   CONSISTENCY: same Meera as the reference sheet; serum label readable.
   Avoid: extra fingers, mouth glitches, face changing, subtitles.
   ```
3. Play the pre-made clip. Point out one small glitch and show where you'd cut away.

**Show on screen:** the clip played twice, the second time at half speed to check the lip-sync.

**Common mistakes**
1. 20-word lines in one shot.
2. Never watching at half speed, so glitches slip through.
3. Robotic delivery because there was no emotion direction in the prompt.

**Student gets:** `student-kit/workflows/W06-ugc-pipeline.md` (dialogue section), `student-kit/skills/sound-director/SKILL.md`

**Assignment:** Make one 5–6 second talking shot with your brand model.

---

## Lesson 6.4: Sound design that sells

Say **"LESSON 6.4"** on camera.

- **Goal:** Mix VO + music + SFX into the 15s ad at the right levels.

**Talking points**
1. Three layers: **VO on top, music underneath, SFX on the moments.**
2. SFX that sell: the dropper "plip", a glass clink, a whoosh on a fast cut, sizzle/fizz for food, fabric swish, a soft riser into the logo.
3. **"Sound tells the eye where to look."** Put an SFX on every key product moment.
4. Levels: the VO clearly on top, the music ducked under the VO, the final loudness around -14 LUFS for social.
5. Play the A/B/C: silent → music only → full mix.

**Live demo**
1. `sound-director`:
   ```
   Make a sound design plan for our 15s Kesar edit: list each SFX with its timestamp, and give me SFX prompts I can generate in ElevenLabs.
   ```
2. Generate one SFX in ElevenLabs (e.g., "single soft liquid drop from a glass dropper, close mic, clean").
3. Mix with `vibe-editor` in Claude (preview of Lecture 9):
   ```
   Add the VO, put the instrumental bed under it with ducking, add these SFX at the timestamps, normalize to -14 LUFS. Export 9:16.
   ```
4. Play the A/B/C versions.

**Show on screen:** a 3-lane audio timeline graphic (VO / Music / SFX), the A/B/C comparison.

**Common mistakes**
1. Music louder than the VO.
2. SFX on everything, so it sounds like a cartoon.
3. Never checking on a phone speaker, where most people hear it.

**Student gets:** `student-kit/prompt-library/audio.md` (SFX section), `student-kit/skills/vibe-editor/SKILL.md`

**Assignment:** Mix your 15s ad with VO, music and at least 3 SFX.

---

## Wrap-up

> "Your ad now has a voice, a jingle and sound that sells. **Next lecture: AI UGC. Creators that feel real, reviews, unboxings, and a brand face you can use every week. Plus the honesty rules that keep you safe.**"

## Edit notes for Claude

- Cold open: the silent version with a "MUTE" icon, then the full mix with a "SOUND ON" icon.
- 6.1: show the waveforms of take A and take B. Subtitle the Hinglish lines in English.
- 6.2: put the lyrics on screen in sync with the jingle.
- 6.3: replay the talking clip at 0.5x with a "check lip-sync" label.
- 6.4: animate the 3 audio lanes. Show the A/B/C versions with labels.
- Make sure the system audio is clearly audible in every demo. Normalize the instructor voice to -16 LUFS for the lessons.
