"""V3 timeline: frame map, smoothed head/neck track, word times, voice + music amplitude.
  python3 tools/v3_timeline.py   -> build/v3/timeline.js
The creative beats themselves live in stage_v3.js and are keyed to word indices (W(i))."""
import json, os, glob, bisect, math, wave, subprocess, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = "/home/user/work3"
FPS = 30
TAIL = 2.4            # end card after the last word
MUSIC_AT_WORD = 23    # "music." -> the drop lands just after the enter key
BEAT0, BPM = None, 123.0


def main():
    e = json.load(open(f"{ROOT}/edit/v3_edl.json"))
    segs, speech_end = e["segments"], e["duration"]
    dur = speech_end + TAIL
    nfr = int(math.ceil(dur * FPS))
    total = len(glob.glob(f"{WORK}/fr/s*.jpg"))
    frames = []
    for k in range(nfr):
        t = k / FPS
        if t < speech_end:
            j = max(i for i, s in enumerate(segs) if s["t"] <= t + 1e-6)
            src = segs[j]["in"] + (t - segs[j]["t"])
        else:
            src = segs[-1]["out"] + (t - speech_end)
        frames.append(min(total, int(round(src * FPS)) + 1))
    meta = {}
    for p in glob.glob(f"{WORK}/mk/meta_*.json"):
        meta.update({int(k): v for k, v in json.load(open(p)).items()})
    keys = sorted(meta)
    def near(f):
        if f in meta: return meta[f]
        if not keys: return [0.36, 0.5, 0.2, 0.52]
        i = bisect.bisect_left(keys, f); c = [keys[x] for x in (i - 1, i) if 0 <= x < len(keys)]
        return meta[min(c, key=lambda x: abs(x - f))]
    raw = [near(f) for f in frames]
    head = []
    for c in range(4):
        v = [r[c] for r in raw]; sm = []
        for i in range(len(v)):
            a, b = max(0, i - 7), min(len(v), i + 8); sm.append(round(float(np.median(v[a:b])), 4))
        head.append(sm)
    words = {w["i"]: [w["start"], w["end"], w["text"]] for w in e["words"]}
    # voice amplitude per frame
    wf = wave.open(f"{WORK}/dlg.wav"); sr = wf.getframerate(); ch = wf.getnchannels()
    au = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).reshape(-1, ch)[:, 0] / 32768.
    hop = sr // FPS
    amp = [float(np.sqrt(np.mean(au[k * hop:(k + 1) * hop] ** 2))) if k * hop < len(au) else 0. for k in range(nfr)]
    mx = max(amp) or 1; amp = [round(min(1, a / mx * 1.4), 3) for a in amp]
    # music: drop time, bass-band envelope per frame (for audio-reactive graphics)
    music_t = words[MUSIC_AT_WORD][1] + 0.42
    m = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{WORK}/music.mp3", "-af", "lowpass=f=160", "-ac", "1",
                                      "-ar", "12000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16) / 32768.
    mh = 12000 // FPS
    menv = []
    for k in range(nfr):
        t = k / FPS - music_t
        if t < 0: menv.append(0.); continue
        i = int(t * 12000); menv.append(float(np.sqrt(np.mean(m[i:i + mh] ** 2))) if i + mh < len(m) else 0.)
    mm = max(menv) or 1; menv = [round(x / mm, 3) for x in menv]
    tl = dict(fps=FPS, dur=round(dur, 3), nframes=nfr, speech_end=speech_end, frames=frames, head=head, words=words,
              amp=amp, menv=menv, music_t=round(music_t, 3), frame_dir=f"{WORK}/fr", mask_dir=f"{WORK}/mk",
              stock_dir=f"{WORK}/stock", has_mask=[os.path.exists(f"{WORK}/mk/s{f:05d}.png") for f in frames])
    os.makedirs(f"{ROOT}/build/v3", exist_ok=True)
    open(f"{ROOT}/build/v3/timeline.js", "w").write("window.TL = " + json.dumps(tl) + ";")
    json.dump({k: tl[k] for k in ("dur", "nframes", "speech_end", "music_t")}, open(f"{ROOT}/build/v3/meta.json", "w"))
    print("dur %.2f frames %d music_t %.2f masks %d/%d" % (dur, nfr, music_t, sum(tl["has_mask"]), nfr))


if __name__ == "__main__":
    main()
