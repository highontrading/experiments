# Workflow 03: Images to Video Ad
> You end with video clips, a voiceover, music and sound effects, ready to edit into a Reel.

| Time | Skill to attach | Tools | Modules |
|---|---|---|---|
| 60–120 min | `ad-video-director` | Google Flow (Google Omni Flash 1.2), ElevenLabs, Suno | 5, 6, 7, 10 |

## You need
- Your approved images from Workflow 02 (with the label correct)
- Your script and storyboard from Workflow 01
- Your `brand-bible.md`
- Your product reference photos

## Steps

### Step 1 · Plan the shots
**Tool:** Claude, ChatGPT or Gemini + `ad-video-director` · **You get:** a shot list
Attach the skill, your script, brand bible and images. Ask for a shot list.
**Type this:**
```text
Here is my 15s script and my approved images. Make a 5-shot film for a 9:16 Reel. Give me a shot list and a continuity sheet.
```
**Check:** each shot has one action and one camera move, and lasts 3–8 seconds.

### Step 2 · Get the video prompts
**Tool:** same chat · **You get:** one Flow prompt per shot
**Type this:**
```text
Now write the Google Flow prompt for every shot. Use Frames to Video with my images as start frames.
```
**Check:** every prompt has a "Consistency" line, so the label stays the same.

### Step 3 · Make the clips in Flow
**Tool:** Google Flow · Google Omni Flash 1.2 · **You get:** 2–3 takes per shot
Pick **Frames to Video** (or whichever mode your Flow shows). Upload the start frame, paste the
prompt, and make 2–3 takes. Save them in `03_video/`.
**Check:** watch each take 3 times: for the feel, for the label, and for errors (hands, faces, flicker).

### Step 4 · Fix weak shots
**Tool:** same chat · **You get:** a better prompt
Tell the skill what went wrong, in one line.
**Type this:**
```text
Shot 3: the label melted at the end. Give me a fixed prompt.
```
**Check:** the label is readable in your best take of every shot.

### Step 5 · Add voice, music and sound
**Tool:** ElevenLabs + Suno · **You get:** a voiceover, music bed, jingle tag and 3–5 SFX
**Type this:**
```text
Write my voiceover in Hinglish for this 15s script, plus a Suno music bed, a 4-second sonic logo and 4 sound effects.
```
Paste the voice prompt into ElevenLabs and the music prompt into Suno. Save everything in `04_audio/`.
**Check:** the voiceover fits the time when you read it aloud with a timer.

### Step 6 · Optional: a UGC or hybrid version
**Tool:** same chat · **You get:** a second ad from the same product
**Type this:**
```text
Make a 20s UGC review version with an AI creator, in Hinglish. Keep it honest.
```
Or, if you have phone footage: "Here are my phone clips. Which shots should stay real, and what should AI add?"
**Check:** the AI creator is never presented as a real customer.

### Step 7 · Hand off to editing
**Tool:** same chat · **You get:** a vibe edit prompt for Workflow 04
**Type this:**
```text
Give me the cut order and a vibe edit prompt for the vibe-editor skill.
```
**Check:** you have the clips, the audio and the vibe edit prompt in one folder.

## Done when
- [ ] Every shot has one approved take with the label correct
- [ ] Voiceover fits the length (English, Hindi or Hinglish)
- [ ] Music bed (no vocals) + sonic logo + 3–5 SFX are saved
- [ ] Cut order and vibe edit prompt are ready
- [ ] Files are named like `KESAR_DIWALI_GLOW_S03_9x16_v01.mp4`

## Common mistakes
- Using Text to Video for product shots. Use Frames to Video from an approved image.
- Asking for two camera moves in one shot. Pick one; slow moves keep the label sharp.
- Writing the voiceover too long. Keep to about 2.5 words per second.
