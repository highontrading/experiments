# Caption, text and end-card recipes

The commands for the `vibe-captions-and-endcards` skill. ✅ = run and checked on **ffmpeg 6.1**
with test clips, including a frame grab to look at the result.

Fonts: in the commands, `fontfile=fonts/Inter-Bold.ttf` means a font file in a `fonts/` folder
next to your video. Download fonts free from Google Fonts (Inter, Archivo Black, Noto Sans
Devanagari, Mukta). On Windows, write paths with forward slashes: `fontfile=C\:/Windows/Fonts/arialbd.ttf`
(note the `\:` after the drive letter).

---

## 1. Transcribe (get word timings)

Extract clean audio first ✅:
```bash
ffmpeg -y -i edit.mp4 -vn -ac 1 -ar 16000 audio.wav
```

**faster-whisper** (free, runs on your computer; downloads a model the first time):
```bash
pip install faster-whisper
```
```python
from faster_whisper import WhisperModel
import json
model = WhisperModel("small", compute_type="int8")          # "medium" = better Hindi, slower
segments, info = model.transcribe("audio.wav", word_timestamps=True, language=None)  # or "hi" / "en"
words = [{"word": w.word, "start": w.start, "end": w.end} for s in segments for w in s.words]
json.dump(words, open("words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
```

**openai-whisper** command line:
```bash
pip install openai-whisper
whisper audio.wav --model small --word_timestamps True --output_format json
```

**ElevenLabs Speech-to-Text** (or any API that returns word timings): save the JSON response
as `words.json`. `captions.py` reads the ElevenLabs `words` list and skips the spacing entries ✅.

No transcription? Paste your script into `script.txt` and use `--script` mode (below).

---

## 2. Make SRT + styled ASS captions ✅

From word timings (Whisper, faster-whisper or ElevenLabs JSON all work):
```bash
python3 scripts/captions.py --words words.json --ratio 9:16 --per-line 3 --font "Arial Black" --highlight "#E8862A" --upper --out captions
```
From a pasted script (timing estimated between `--start` and `--end`, the seconds where the voice starts and stops):
```bash
python3 scripts/captions.py --script script.txt --start 0.3 --end 14.5 --ratio 9:16 --out captions
```
Hindi (Devanagari). Use a Devanagari font and no `--upper` ✅ (matras checked in a frame grab):
```bash
python3 scripts/captions.py --words words_hi.json --ratio 9:16 --font "Noto Sans Devanagari" --highlight "#E8862A" --out captions_hi
```

| Option | What it does | Default |
|---|---|---|
| `--per-line` | words on screen at once (1 = one huge word, 4 = calm) | 3 |
| `--highlight` | colour of the word being spoken; `""` = off | #E8862A |
| `--color` / `--outline` | text / outline colour | white / black |
| `--size` | font size in px (0 = auto, about 7.5% of width) | 0 |
| `--pos` | height above the bottom edge, 0–1 (0.30 = outside the bottom UI zone) | 0.30 |
| `--upper` | ALL CAPS (English only) | off |

---

## 3. Burn captions into the video ✅

Styled ASS (word-by-word highlight):
```bash
ffmpeg -y -i edit.mp4 -vf "ass=captions.ass:fontsdir=fonts" -c:a copy edit_captions.mp4
```
Simple SRT with a style set in the command (CapCut-like white + outline):
```bash
ffmpeg -y -i edit.mp4 -vf "subtitles=captions.srt:force_style='FontName=Arial,FontSize=16,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Alignment=2,MarginV=110'" -c:a copy edit_captions.mp4
```
ASS colours are written `&H00BBGGRR` (blue-green-red, reversed). Saffron #E8862A = `&H002A86E8`.
For SRT `force_style`, FontSize and MarginV are measured on a small 384x288 grid, so `FontSize=16` is
already big. For ASS files from `captions.py`, sizes are real pixels.

Keep the SRT as a separate file too: upload it to Meta / YouTube as the caption track.

---

## 4. Text overlays ✅

Offer box from 1 s to 4 s, in the upper area (put the text in a file so `%`, `:` and `₹` need no escaping):
```bash
printf "FLAT 40%% OFF" > offer.txt
ffmpeg -y -i edit.mp4 -vf "drawtext=fontfile=fonts/ArchivoBlack-Regular.ttf:textfile=offer.txt:fontsize=80:fontcolor=white:box=1:boxcolor=0x8E1B1B@0.9:boxborderw=24:x=(w-text_w)/2:y=h*0.18:enable='between(t,1,4)'" -c:a copy edit_offer.mp4
```
(On Windows, create `offer.txt` in Notepad instead of using `printf`.)

Hook title, fading in over the first 0.4 s:
```bash
ffmpeg -y -i edit.mp4 -vf "drawtext=fontfile=fonts/ArchivoBlack-Regular.ttf:textfile=hook.txt:fontsize=84:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=h*0.22:alpha='min(1,t/0.4)':enable='lt(t,2.2)'" -c:a copy edit_hook.mp4
```
Font by name instead of by file (if it's installed on the system) ✅: `drawtext=font='Arial':text='NEW':…`

Several overlays: chain `drawtext=…,drawtext=…` with a comma, each with its own `enable=`.

---

## 5. End cards ✅

**A. Brand end card from scratch** (3 s, 9:16): cream background, logo fades in, tagline fades in,
CTA button appears at 1 s, fades out at the end:
```bash
ffmpeg -y -f lavfi -i "color=c=0xF6EBD9:s=1080x1920:d=3:r=30" -loop 1 -t 3 -i logo.png -f lavfi -i "anullsrc=r=48000:cl=stereo" -filter_complex "[1:v]scale=640:-1,format=rgba,fade=t=in:st=0.2:d=0.5:alpha=1[lg];[0:v][lg]overlay=(W-w)/2:H*0.36:shortest=1[b];[b]drawtext=fontfile=fonts/Inter-Bold.ttf:textfile=tagline.txt:fontsize=72:fontcolor=0x8E1B1B:x=(w-text_w)/2:y=h*0.53:alpha='if(lt(t,0.6),0,min(1,(t-0.6)/0.4))',drawtext=fontfile=fonts/Inter-Bold.ttf:textfile=cta.txt:fontsize=48:fontcolor=white:box=1:boxcolor=0xE8862A:boxborderw=34:x=(w-text_w)/2:y=h*0.63:enable='gte(t,1.0)',fade=t=out:st=2.6:d=0.4,format=yuv420p[v]" -map "[v]" -map 2:a -t 3 -c:v libx264 -crf 18 -r 30 -c:a aac -ar 48000 endcard.mp4
```
For 4:5 use `s=1080x1350`; for 1:1 use `s=1080x1080`. The logo should be a transparent PNG.
To end on the music instead of silence, leave out the `anullsrc` input and add the music in the
final sound step.

**B. Join the end card to the edit** ✅ (both 9:16, 30 fps):
```bash
ffmpeg -y -i edit_captions.mp4 -i endcard.mp4 -filter_complex "[0:v]fps=30,setsar=1,format=yuv420p[v0];[1:v]fps=30,setsar=1,format=yuv420p[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac -movflags +faststart final.mp4
```

**C. Freeze the last product shot + logo + CTA on top** ✅ (holds 2.5 s, often converts better than
a plain card). Set `gte(t,6)` to the edit's length:
```bash
ffmpeg -y -i edit.mp4 -i logo.png -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=2.5[base];[1:v]scale=420:-1,format=rgba[lg];[base][lg]overlay=(W-w)/2:H*0.18:enable='gte(t,6)'[b];[b]drawtext=fontfile=fonts/Inter-Bold.ttf:textfile=cta.txt:fontsize=50:fontcolor=white:box=1:boxcolor=0xE8862A:boxborderw=30:x=(w-text_w)/2:y=h*0.66:enable='gte(t,6.3)'[v];[0:a]apad=pad_dur=2.5[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac -movflags +faststart final_cta.mp4
```

---

## 6. Check your work ✅
```bash
ffmpeg -y -ss 1.5 -i final.mp4 -frames:v 1 check_hook.jpg
ffmpeg -y -ss 8 -i final.mp4 -frames:v 1 check_endcard.jpg
```
Open the pictures. Is the text readable at phone size? Is it inside the safe zone? Are the
Hindi matras correct? Is the brand name spelled right?

---

## Verified list (ffmpeg 6.1.1)
✅ audio extract · `captions.py` from script / plain word list / Whisper JSON / ElevenLabs JSON ·
SRT output · ASS word-highlight burn-in (checked in a frame grab) · Hindi Devanagari burn-in (checked
in a frame grab; matras correct) · SRT burn-in with force_style · drawtext offer box with textfile ·
drawtext by font name · brand end card A (checked in a frame grab) · end card join B · freeze + logo
+ CTA C · frame grabs.
Not run here: the faster-whisper and openai-whisper transcription itself (they need a model
download). The commands follow each tool's documented usage.
