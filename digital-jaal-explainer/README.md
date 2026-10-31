# Jaal aur Paani — 9:16 explainer

A 42.5 s vertical (1080×1920, 30 fps) explainer for a digital-marketing agency, Hinglish voiceover.
The design follows the reference posts: off-white paper texture, black-and-white real footage cut out with
white sticker borders and torn edges, red circles, beige marker bars and red dot grids. All imagery is **real
stock footage** (Mixkit, free licence); there are no AI images.

| File | What it is |
| --- | --- |
| `out/jaal_aur_paani_explainer.mp4` | the finished video: H.264 + AAC 256k, -14 LUFS |
| `out/poster.jpg` | end-card frame |
| `stage.html`, `stage.js` | the whole film as `renderAt(t)`: 14 scenes and 10 transition types on one canvas |
| `render.js` | headless Chromium renderer (stills, or frame ranges piped to ffmpeg) |
| `clips.json` | the 23 footage cuts: Mixkit id, in-point, length, green-screen key |
| `sfx_cues.json` | every sound-effect hit: time, file, gain |
| `tools/` | Mixkit search, frame prep + chroma key, tracking, ElevenLabs TTS/SFX, audio mix |
| `assets/vo` | ElevenLabs voiceover (voice "Jeet", multilingual v2), script and word timings |
| `assets/music`, `assets/sfx` | ElevenLabs music bed (composed to the VO's sections) and 20 sound effects |

## Scenes

| Time | Line | Picture |
| --- | --- | --- |
| 0.0 | Digital duniya mein sirf website hona... | laptop with a mock website comped into its green screen |
| 2.75 | dukaan khol ke board na lagane jaisa hai | shop sign flipping to OPEN, an empty hanging signboard, BOARD struck out |
| 5.15 | Socho! | green-screen thinker keyed as a collage cut-out, SOCHO! slams in |
| 6.3 | ...customers aayenge kahan se? | empty street, "Visitors today 0", confused man cut-out |
| 9.75 | Website ek jaal hai... machhli nahi pakadti | fishing nets in a circle frame, crossed-out fish |
| 13.4 | Uske liye paani bhi toh chahiye!! | school of fish; PAANI filled with real water footage |
| 17.3 | Google... social media... aur ads | three footage bands slam in, search bar types, likes float |
| 21.2 / 24.75 / 26.95 | Branding / Social media / Website | 01–02–03 chapters: logo design, phone user + likes, card checkout → parcel delivered |
| 30.75 | sahi strategy zaroori hai | chess queen in a red circle, team planning |
| 33.55 | jaal aur paani, dono chahiye? | net card + water card joined by a red plus, real sea along the bottom |
| 36.4 | neeche button par click karo | green-screen hand and phone, our CTA screen comped in, press + swipe |
| 38.7 | Baat karte hain! | caller cut-out, ABHI CLICK KAREIN button |

Transitions: paper tear, white flash, whip pan, zoom-blur, water wave, colour bars, red iris, vertical whip,
reverse tear, slices.

## Build

```bash
./make.sh clips     # download source clips
./make.sh prep      # frames + chroma key + tracking  -> build/frames
./make.sh stills 5.6 19 41   # check frames
./make.sh           # render (about 3 min on 4 cores) + mix -> out/
```

Copy and timing live in `stage.js` (word times are VO time + 0.5 s); colours are `COL` at the top.
