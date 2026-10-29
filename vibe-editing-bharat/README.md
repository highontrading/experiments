# Edit in Your Language (Apni Bhasha Mein Edit Karo)

A 9:16 film, about 91 seconds long. An empty timeline gets filled and edited by six Indian
languages, each asking for one edit in its own words. At the end the finished reel plays.
The voices are ElevenLabs `eleven_v4`, built from real footage, real photos and real cut-outs
in the collage-poster design system (cloud sky, clothesline and pegs, windows on a green hill,
lime and magenta type).

| Output | What it is |
| --- | --- |
| `out/edit_in_your_language_share.mp4` | the film, 1080x1920, 30 fps, about 7.4 Mbps, AAC stereo at -14 LUFS (84 MB; this is the copy kept in git) |
| `out/edit_in_your_language.mp4` | the high-bitrate master (275 MB). Too big for GitHub, so `make.sh` rebuilds it and it is not committed |
| `out/poster.jpg` | a still from the finished reel |

## Running order

| Time | Scene | Layout | Voice |
| --- | --- | --- | --- |
| 0:00 | Greetings | white pills popping into the sky | 10 greetings: hi, bn, ta, gu, te, mr, pa, kn, ml, or |
| 0:06 | India speaks… | poster type: magenta handwriting, lime 121 → 1ᴱᴺ, an English-only menu bar | EN |
| 0:14 | Empty timeline | six blank prints pegged on a rope, which then dock at the top as the tracker | EN |
| 0:21 | Hindi · Varanasi | clothesline print and film strip; the first 2 s are snipped and fall | HI |
| 0:29 | Bangla · Kolkata | collage: the yellow tram hangs from pegs; bows snap on each beat and the print jump-cuts | BN |
| 0:38 | Marathi · Mumbai | tabletop on the grass: checker path, speed ramp to 2.4×, the local train charges past | MR |
| 0:45 | Telugu · Hyderabad | windows on the green hill: shutters open, golden-hour warm grade | TE |
| 0:54 | Tamil · Chennai | push through the blue window into a full-bleed beach; the caption grows huge | TA |
| 1:02 | Gujarati · Ahmedabad | patang poster: subtitles in 7 languages ride the kite's tail | GU |
| 1:11 | The finished reel | the six tracker prints fly together into one card, cut on the beat with every edit applied | music |
| 1:20 | Outro | lime 6 / 1 / 0, VIBE EDITING written in cloud | EN + HI |

The transitions are continuous camera moves rather than cuts:
- Hindi → Bangla: a slide.
- Bangla → Marathi: the camera tilts down from the sky onto the grass.
- Marathi → Telugu: a soft zoom-dissolve.
- Telugu → Tamil: the camera flies through the blue window.
- After every language: its shot shrinks and flies into its slot on the tracker.

## Two cuts

| Cut | Narrator | Under each bubble | Output |
| --- | --- | --- | --- |
| English | Viraj (Indian English) | English meaning | `out/edit_in_your_language_share.mp4` |
| Hinglish | Raju (Hindi), lines like "India में सैकड़ों भाषाएँ बोली जाती हैं…" | Hinglish meaning, e.g. "Tram ka shot daalo, aur music ki har beat pe cut karo." | `out/edit_in_your_language_hinglish_share.mp4` |

The six language lines and the greetings are the same in both cuts. In the Hinglish cut the
on-screen words are Hinglish too ("khaali!", "6 bhashayein · 1 video · 0 clip drag kiye").
The cuts share every scene; the narrator's word cues and on-screen strings live in `CUE` and
`STR` at the top of `lib/scenes.js`.

## Build

```bash
./make.sh            # full build -> out/
./make.sh stills     # contact sheet of key moments -> build/sheet.jpg
./make.sh encode     # re-mix and re-encode from existing frames
VERSION=hinglish ./make.sh   # the Hinglish cut (same flags)
```

| File | Role |
| --- | --- |
| `script.json` | every voice line: text, language and voice |
| `tts.py` | voices each line with `eleven_v4`, with timestamps (cached by hash; only changed lines cost credits) |
| `timing.py` | scene, voice and SFX timing → `build/timing.js` (renderer) and `build/timing.json` (mixer) |
| `prep.py` | footage → 30 fps JPG frames, and a 128 BPM beat grid from the music |
| `lib/core.js` | sky, grain, rope, pegs, prints, word-by-word captions |
| `lib/scenes.js` | the 11 scenes |
| `lib/film.js` | transitions, the tracker and the frame loop |
| `render.js` | headless Chromium, 4 workers |
| `mix.py` | voices + ducked music + city ambience + SFX → loudnorm |

The voices were added to the ElevenLabs library as "Bharat <LANG> – <name>" (Viraj, Simran,
Ashwat, Kalyani, Madhavi, Muthu, Chinmay). Each Indian-language line was checked by transcribing
it back with ElevenLabs Scribe.

## Credits

The full list (author, license, source) is in `assets/CREDITS.md`. Most Wikimedia items are
CC BY / CC BY-SA, so post this line with the video:

> Footage & photos via Wikimedia Commons (CC BY / BY-SA): Akankshasharma584, Anita Paliwal, Rameshng,
> Hridoy Kundu, Indrajit Das, Prahlad lali, Shailya, PROPOLI87, shankar s., Oleg Yunakov, Pmau, Mmorell,
> psyberartist, VSchagow, Fornax, Vis M, Stilfehler, WillaMissionary, Titus Tscharntke. Sky, music
> ("India" by Arulo) and SFX: Mixkit. Voices: ElevenLabs.
