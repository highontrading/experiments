# Footage -> JPG frame sequences (30 fps) + build/footage.js; music -> beat grid build/music.js.
#   python3 prep.py            only clips whose frames are missing or older than the mp4
#   python3 prep.py --music    only redo the beat analysis
import glob, json, os, subprocess, sys
MUSIC_START = 0.0          # seconds into music.mp3 where the film's audio starts
os.makedirs("build/frames", exist_ok=True)
meta = {}
if "--music" not in sys.argv:
    for mp4 in sorted(glob.glob("assets/footage/*.mp4")):
        name = os.path.splitext(os.path.basename(mp4))[0]
        if name.endswith("_alt"): continue
        out = f"build/frames/{name}"
        stale = not os.path.exists(f"{out}/0001.jpg") or os.path.getmtime(f"{out}/0001.jpg") < os.path.getmtime(mp4)
        if stale:
            subprocess.run(["rm", "-rf", out]); os.makedirs(out)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp4, "-vf",
                            "fps=30,scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
                            "-q:v", "3", f"{out}/%04d.jpg"], check=True)
        n = len(glob.glob(f"{out}/*.jpg"))
        w, h = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                                 "stream=width,height", "-of", "csv=p=0", f"{out}/0001.jpg"]).decode().strip().split(","))
        meta[name] = dict(n=n, w=w, h=h)
        print(f"{name:10s} {n:4d} frames  {w}x{h}{'  (new)' if stale else ''}")
    open("build/footage.js", "w").write("window.FOOT = " + json.dumps(meta) + ";\n")

import librosa, numpy as np
y, sr = librosa.load("assets/audio/music.mp3", sr=22050, offset=MUSIC_START, duration=110)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", tightness=120)
bpm = float(np.atleast_1d(tempo)[0])
# regularise: fit a straight grid through the detected beats
k = np.arange(len(beats)); per, off = np.polyfit(k, beats, 1)
off = off % per
grid = [round(off + i * per, 4) for i in range(int((110 - off) / per))]
open("build/music.js", "w").write("window.MUSIC = " + json.dumps(dict(bpm=round(60 / per, 3), offset=round(off, 4), start=MUSIC_START, beats=grid)) + ";\n")
print(f"music: {60 / per:.2f} BPM (librosa said {bpm:.1f}), first beat {off:.3f}s, {len(beats)} beats detected")
