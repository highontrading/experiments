# ffmpeg recipes for vibe editing

These are the commands used by the `vibe-editor` and `vibe-captions-and-endcards` skills. Each
recipe marked ✅ was run and checked on **ffmpeg 6.1** (Linux) on test clips. They use only
standard filters, so they also work on ffmpeg 5, 6 and 7 for Mac and Windows.

How to read them:
- `in.mp4`, `music.mp3`, `vo.wav`, `logo.png` are placeholders. Replace them with your file names.
- Times are in seconds (`2.5`) or `hh:mm:ss.ms` (`00:00:02.500`).
- On Windows PowerShell, keep the double quotes as written. Run each command on one line.
- `-y` overwrites the output without asking. Remove it if you want to be asked first.
- Quality: `-crf 18` looks the same as the source. `-crf 23` gives smaller files. `-preset fast` renders faster, `-preset slow` gives smaller files.

---

## 0. Install and check

| System | Install command |
|---|---|
| Mac | `brew install ffmpeg` (install Homebrew first from brew.sh) |
| Windows | `winget install Gyan.FFmpeg` then close and reopen the terminal |
| Linux | `sudo apt install ffmpeg` |
| Python only, no admin rights | `pip install imageio-ffmpeg` then use the path from `python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"` |

```bash
ffmpeg -version
```

---

## 1. Look at your media first ✅

Codec, size, frame rate and length of every stream:
```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,duration -show_entries format=duration,size -of compact in.mp4
```

One frame as a picture (to check a moment):
```bash
ffmpeg -y -ss 2 -i in.mp4 -frames:v 1 -q:v 2 frame.jpg
```

Contact sheet (one frame per second, 3x2 grid). Useful for "show me what's in this clip":
```bash
ffmpeg -y -i in.mp4 -vf "fps=1,scale=320:-1,tile=3x2" -frames:v 1 contact.jpg
```

Small preview GIF:
```bash
ffmpeg -y -i in.mp4 -t 2 -vf "fps=12,scale=480:-1" preview.gif
```

---

## 2. Trim

Fast trim with no re-encode. The cut snaps to the nearest keyframe, so it can be a little off:
```bash
ffmpeg -y -ss 00:00:01.5 -to 00:00:04 -i in.mp4 -c copy trim.mp4
```

Frame-accurate trim (re-encodes). Use this for ads:
```bash
ffmpeg -y -i in.mp4 -ss 1.5 -to 4 -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k trim.mp4
```

---

## 3. Make clips match, then join them

AI clips from different tools differ in size, frame rate and audio. Convert each one to the same
format first:
```bash
ffmpeg -y -i clip.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1" -c:v libx264 -crf 18 -preset fast -c:a aac -ar 48000 -ac 2 -b:a 192k clip_norm.mp4
```
If a clip has no audio (common with AI video), add silent audio so the join step still works:
```bash
ffmpeg -y -i clip.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -shortest -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1" -c:v libx264 -crf 18 -preset fast -c:a aac -ar 48000 -ac 2 -b:a 192k clip_norm.mp4
```

Join converted clips with no re-encode. `list.txt` has one line per clip: `file 'clip1_norm.mp4'`
```bash
ffmpeg -y -f concat -safe 0 -i list.txt -c copy joined.mp4
```

Join any clips in one step, re-encoding and filling a 9:16 frame:
```bash
ffmpeg -y -i a.mp4 -i b.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p[v0];[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k joined.mp4
```
For 3+ clips, add `[2:v]…[v2]` and `[2:a]…[a2]` blocks and set `n=3`.

Crossfade between two clips (offset = length of clip A minus the fade length; clips must be the
same size and frame rate):
```bash
ffmpeg -y -i a_norm.mp4 -i b_norm.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=5.5[v];[0:a][1:a]acrossfade=d=0.5[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac xfade.mp4
```
Other transitions: `fadeblack`, `wipeleft`, `slideup`, `circleopen`, `zoomin`, `smoothleft`.
For ads, hard cuts on the beat usually beat fancy transitions.

---

## 4. Cut on the beat ✅

1) Find the beats (in the skill folder, `scripts/beats.py`, needs numpy; uses librosa if installed):
```bash
python3 scripts/beats.py music.mp3            # every beat
python3 scripts/beats.py music.mp3 --every 2  # every 2nd beat (calmer)
python3 scripts/beats.py --bpm 120 --length 30   # you know the BPM: no detection needed
```
2) Or do it in one go: cut the clips to the beat, fill the frame, add the music and export:
```bash
python3 scripts/beat_cut.py --music music.mp3 --length 15 --ratio 9:16 --every 2 --out edit.mp4 clip1.mp4 clip2.mp4 clip3.mp4
```
Options: `--fit blur` keeps the whole frame on a blurred background. `--skip 0.5` drops the first
0.5 s of each clip (AI clips often start frozen). `--bpm 128` skips detection.

Manual BPM math, if you have no Python: one beat = `60 / BPM` seconds.
At 120 BPM, a beat is 0.5 s, 2 beats are 1.0 s and 4 beats (one bar) are 2.0 s. At 128 BPM, a beat is 0.469 s.
Cut each clip to a whole number of beats with the trim recipe above, then join them.
Check by ear. If the cuts feel early or late, shift every cut by the same amount (`--offset`).

---

## 5. Reframe for every placement ✅

Centre crop 16:9 → 9:16 (fills the frame; the sides are lost):
```bash
ffmpeg -y -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1" -c:a copy out_9x16.mp4
```
Same, but the subject is left of centre (0 = far left, 0.5 = centre, 1 = far right):
```bash
ffmpeg -y -i in.mp4 -vf "crop=ih*9/16:ih:(iw-ih*9/16)*0.25:0,scale=1080:1920,setsar=1" -c:a copy out_9x16.mp4
```
Keep the whole picture, with a blurred copy behind it (good for wide product shots):
```bash
ffmpeg -y -i in.mp4 -filter_complex "[0:v]split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:2,eq=brightness=-0.08[bgb];[fg]scale=1080:-2[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1[v]" -map "[v]" -map 0:a -c:a copy out_9x16_blur.mp4
```
4:5 feed, 1:1 square and 1.91:1 link ad:
```bash
ffmpeg -y -i in.mp4 -vf "crop=ih*4/5:ih,scale=1080:1350,setsar=1" -c:a copy out_4x5.mp4
ffmpeg -y -i in.mp4 -vf "crop=ih:ih,scale=1080:1080,setsar=1" -c:a copy out_1x1.mp4
ffmpeg -y -i in.mp4 -vf "scale=1200:-2,crop=1200:628,setsar=1" -c:a copy out_191x1.mp4
```
Any source to any ratio (fill and crop the centre). Use this when you don't know the source size:
```bash
ffmpeg -y -i in.mp4 -vf "scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,setsar=1" -c:a copy out_4x5.mp4
```

---

## 6. Speed

2x faster (video and audio):
```bash
ffmpeg -y -i in.mp4 -filter_complex "[0:v]setpts=PTS/2[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" fast.mp4
```
Slow motion 2x with smoothed frames (no audio; add music after):
```bash
ffmpeg -y -i in.mp4 -filter:v "setpts=2.0*PTS,minterpolate=fps=30:mi_mode=blend" -an slow.mp4
```
Speed ramp: normal speed, then slow (2.5x) from 2–4 s, then normal again:
```bash
ffmpeg -y -i in.mp4 -filter_complex "[0:v]trim=0:2,setpts=PTS-STARTPTS[a];[0:v]trim=2:4,setpts=(PTS-STARTPTS)*2.5[b];[0:v]trim=4:6,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,fps=30[v]" -map "[v]" -an ramp.mp4
```
Reverse a short clip (fine for clips up to about 10 s; uses a lot of memory):
```bash
ffmpeg -y -i in.mp4 -vf reverse -af areverse reversed.mp4
```

---

## 7. Zoom and motion

Punch-in: zoom to 1.25x from 2–3.5 s (an emphasis beat):
```bash
ffmpeg -y -i in.mp4 -filter_complex "[0:v]split[a][b];[b]scale=iw*1.25:-2,crop=1920:1080[z];[a][z]overlay=0:0:enable='between(t,2,3.5)'[v]" -map "[v]" -map 0:a -c:a copy punchin.mp4
```
Set `crop=` to the source size (for 9:16 sources, `crop=1080:1920`).
Note: putting a time expression inside `crop=w=…` does **not** zoom, because crop sets its size
once. Use the overlay method above.

Slow push-in on a still product image (Ken Burns), 4 s, 9:16:
```bash
ffmpeg -y -loop 1 -framerate 30 -t 4 -i still.png -vf "scale=3840:-2,zoompan=z='min(zoom+0.0012,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1080x1920:fps=30,format=yuv420p" -t 4 -c:v libx264 push.mp4
```
`d` = frames (seconds x 30). Raise `0.0012` for a faster push.

---

## 8. Freeze frame

Hold the last frame for 1.5 s (for end cards and CTAs):
```bash
ffmpeg -y -i in.mp4 -vf "tpad=stop_mode=clone:stop_duration=1.5" -af "apad=pad_dur=1.5" -c:v libx264 -c:a aac freeze_end.mp4
```
Freeze at 3 s for 1.5 s, then carry on (sound pauses too, so it stays in sync):
```bash
ffmpeg -y -i in.mp4 -filter_complex "[0:v]trim=0:3,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1.5[v1];[0:v]trim=start=3,setpts=PTS-STARTPTS[v2];[0:a]atrim=0:3,asetpts=PTS-STARTPTS,apad=pad_dur=1.5[a1];[0:a]atrim=start=3,asetpts=PTS-STARTPTS[a2];[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -c:a aac freeze_mid.mp4
```

---

## 9. Colour looks ✅

Warm golden (Kesar & Co. look):
```bash
ffmpeg -y -i in.mp4 -vf "colorbalance=rs=0.08:gs=0.02:bs=-0.08:rm=0.05:bm=-0.05,eq=contrast=1.06:saturation=1.12:gamma=0.98" -c:a copy warm.mp4
```
Teal & orange:
```bash
ffmpeg -y -i in.mp4 -vf "colorbalance=rs=-0.10:bs=0.12:rh=0.10:bh=-0.10,eq=contrast=1.08:saturation=1.10" -c:a copy teal_orange.mp4
```
Film / vintage (faded curves, grain, vignette):
```bash
ffmpeg -y -i in.mp4 -vf "curves=preset=vintage,noise=alls=8:allf=t,vignette=PI/5" -c:a copy film.mp4
```
Clean black & white:
```bash
ffmpeg -y -i in.mp4 -vf "hue=s=0,eq=contrast=1.2" -c:a copy bw.mp4
```
Soft matte (lifted blacks, softer whites; premium and editorial):
```bash
ffmpeg -y -i in.mp4 -vf "curves=master='0/0.04 0.5/0.52 1/0.96'" -c:a copy matte.mp4
```
LUT file (.cube) from your brand kit or a LUT pack:
```bash
ffmpeg -y -i in.mp4 -vf "lut3d=file=brand_look.cube" -c:a copy graded.mp4
```
Film grain only, and light sharpening (helps AI footage look "shot"):
```bash
ffmpeg -y -i in.mp4 -vf "noise=alls=10:allf=t+u" -c:a copy grain.mp4
ffmpeg -y -i in.mp4 -vf "unsharp=5:5:0.6" -c:a copy sharp.mp4
```
Grade every clip with **the same** look. Mixed looks are the fastest way to make a campaign
look AI-made.

---

## 10. Music, voice and sound effects ✅

Add a music bed under the clip's own sound (music at 25%, fades in and out):
```bash
ffmpeg -y -i in.mp4 -i music.mp3 -filter_complex "[1:a]volume=0.25,afade=t=in:d=0.5,afade=t=out:st=5:d=1[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k with_music.mp4
```
Replace the sound with music:
```bash
ffmpeg -y -i in.mp4 -i music.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest music_only.mp4
```
**Ducking**: the music drops by about 10 dB while the voice-over talks and comes back up in the pauses:
```bash
ffmpeg -y -i video_with_vo.mp4 -i music.mp3 -filter_complex "[0:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];[1:a]aformat=channel_layouts=stereo,volume=0.6[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck];[vo][duck]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k ducked.mp4
```
If the voice-over is a separate file (silent video + music + VO):
```bash
ffmpeg -y -i video.mp4 -i music.mp3 -i vo.wav -filter_complex "[2:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];[1:a]aformat=channel_layouts=stereo,volume=0.6[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck];[vo][duck]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -shortest ducked.mp4
```
The VO sets the length (`duration=first`). If the video is longer than the VO, put the music
first in `amix` instead.

Sound effects on cuts (a whoosh at 2.0 s and at 4.5 s; `adelay` is in milliseconds, written for
both channels):
```bash
ffmpeg -y -i in.mp4 -i whoosh.wav -i whoosh.wav -filter_complex "[1:a]adelay=2000|2000,volume=0.8[s1];[2:a]adelay=4500|4500,volume=0.8[s2];[0:a][s1][s2]amix=inputs=3:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac sfx.mp4
```
Clean up a phone voice-over (cut rumble, reduce noise, even out the level):
```bash
ffmpeg -y -i talk.mp4 -af "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3:attack=5:release=100,loudnorm=I=-14:TP=-1.5:LRA=11" -c:v copy -c:a aac clean.mp4
```

Loudness for social (-14 LUFS, peaks under -1.5 dB). Measure first, then fix:
```bash
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary -f null -
ffmpeg -y -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k loud_ok.mp4
```
(Measure prints to the screen. Look for `Input Integrated`. In the test, -21.8 LUFS became -14.0 LUFS.)

Extract audio for transcription (16 kHz mono WAV, what speech-to-text tools prefer):
```bash
ffmpeg -y -i in.mp4 -vn -ac 1 -ar 16000 audio.wav
```

---

## 11. Fades ✅
```bash
ffmpeg -y -i in.mp4 -vf "fade=t=in:st=0:d=0.4,fade=t=out:st=5.5:d=0.5" -af "afade=t=in:st=0:d=0.4,afade=t=out:st=5.5:d=0.5" -c:v libx264 -c:a aac faded.mp4
```
`st` for the fade-out = clip length minus fade length. Ads usually start **without** a fade-in.

---

## 12. Logo watermark ✅
Top-right, 220 px wide, 85% opacity, 40 px margin (keep it out of the 9:16 top 14% if it's a Reel):
```bash
ffmpeg -y -i in.mp4 -i logo.png -filter_complex "[1:v]scale=220:-1,format=rgba,colorchannelmixer=aa=0.85[lg];[0:v][lg]overlay=W-w-40:40[v]" -map "[v]" -map 0:a -c:a copy logo.mp4
```
For a Reel, use `overlay=W-w-40:H*0.15` so the logo sits below the profile-name area.

---

## 13. Remove dead air (pauses) ✅
Find the pauses:
```bash
ffmpeg -i talk.mp4 -af silencedetect=noise=-35dB:d=0.6 -f null -
```
Cut them all in one go (keeps 0.15 s around each cut so it doesn't feel choppy):
```bash
python3 scripts/cut_silence.py talk.mp4 talk_tight.mp4 --noise -35 --min 0.6 --pad 0.15
```
In the test, 10.0 s became 7.6 s. In a noisy room, raise `--noise` to `-30`. For a faster,
jumpier creator style, lower `--min` to `0.35`.

---

## 14. Export presets for Meta ✅
Final export (any ratio): H.264 High, yuv420p, 30 fps, AAC 48 kHz, fast start:
```bash
ffmpeg -y -i edit.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p" -c:v libx264 -profile:v high -crf 18 -preset medium -c:a aac -ar 48000 -b:a 192k -movflags +faststart BRAND_CAMPAIGN_CONCEPT_H01_FORMAT_9x16_v01.mp4
```
All three main ratios from one master (Mac/Linux shell loop):
```bash
for r in "9x16 1080 1920" "4x5 1080 1350" "1x1 1080 1080"; do set -- $r; ffmpeg -y -i master.mp4 -vf "scale=$2:$3:force_original_aspect_ratio=increase,crop=$2:$3,setsar=1,fps=30,format=yuv420p" -c:v libx264 -profile:v high -crf 18 -preset medium -c:a aac -ar 48000 -b:a 192k -movflags +faststart "KESAR_DIWALI_GLOW_H01_UGC_$1_v01.mp4"; done
```
On Windows, run the three commands one by one. Before you upload, check the size with
`ffprobe -v error -show_entries format=size,duration -of default=nw=1 file.mp4`. Then check
the safe zones by eye: grab a frame (recipe 1) and look at the top 14% and the bottom 20%.

---

## Verified list (ffmpeg 6.1.1, test clips: testsrc2 1080p30 + sine tones)

✅ probe · frame grab · contact sheet · GIF · fast trim · exact trim · normalize · concat demuxer ·
concat filter (mixed 30/25 fps, 1080p/720p) · xfade + acrossfade · crop 9:16 centre and offset ·
blurred-background 9:16 · 4:5 · 1:1 · 1.91:1 · 2x speed · minterpolate slow-mo · speed ramp ·
reverse · punch-in (overlay method; checked by frame comparison) · Ken Burns zoompan · freeze end ·
freeze mid with audio · warm · teal & orange · vintage film · B&W · custom curves · lut3d (.cube) ·
grain · sharpen · music bed · music replace · sidechain ducking (measured ~10 dB dip under voice) ·
SFX with adelay + amix · voice cleanup · loudnorm measure + apply (-21.8 → -14.0 LUFS) ·
16 kHz audio extract · fades · logo overlay with alpha · silencedetect · `cut_silence.py` ·
`beats.py` (120 BPM click track → ~119.5 BPM; 128 BPM → ~128.8) · `beat_cut.py` (9:16 crop and
4:5 blur modes) · Meta export in 9x16 / 4x5 / 1x1.
Captions and end-card commands are verified in `../vibe-captions-and-endcards/`.
