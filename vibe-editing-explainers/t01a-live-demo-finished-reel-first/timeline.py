"""T01A: place the composed voiceover (hook + shared T01 body) on the clock, name the cues,
and write a 60 fps loudness envelope of the narration for the live mic waveform.
    python timeline.py  ->  build/timeline.json, build/timeline.js, build/env.js
"""
import json, subprocess, sys
sys.path.insert(0, "../lib")
import numpy as np
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "raw": 0.4, "tell": 0.15, "c1": 0.25, "c2": 0.22, "c3": 0.22,
                             "c4": 0.2, "just": 0.2, "outro": 0.25}, tail=2.9)
w, L, E = T.w, T.L, T.E
C = {
    # hook: the finished reel, then the rewind
    "finished": w("hook", "finished"), "reel": w("hook", "reel"), "now": w("hook", "now"),
    "rewind": w("hook", "rewind"),
    # scene starts (each layout lands just before its line)
    "s_raw": L("raw") - 0.3, "s_tell": L("tell") - 0.2, "s_c1": L("c1") - 0.2, "s_c2": L("c2") - 0.2,
    "s_c3": L("c3") - 0.2, "s_c4": L("c4") - 0.2, "s_just": L("just") - 0.2, "s_outro": L("outro") - 0.2,
    # raw
    "raw": w("raw", "raw"), "noedits": w("raw", "no"),
    # tell
    "tell": w("tell", "tell"), "agent": w("tell", "agent"), "want": w("tell", "want"),
    # commands
    "cut": w("c1", "cut"), "pauses": w("c1", "pauses"), "done1": w("c1", "done"),
    "add": w("c2", "add"), "bold": w("c2", "bold"), "captions": w("c2", "captions"), "done2": w("c2", "done"),
    "warmer": w("c3", "warmer"), "soft": w("c3", "soft"), "music": w("c3", "music"), "done3": w("c3", "done"),
    "thirty": w("c4", "thirty"), "logo": w("c4", "logo"), "done4": w("c4", "done"),
    # just talking
    "timeline": w("just", "timeline"), "keyframes": w("just", "keyframes"), "talking": w("just", "just"),
    # outro
    "thats": w("outro", "that's"), "vibe": w("outro", "vibe"), "follow": w("outro", "follow"),
    "join": w("outro", "join"),
}
C["cover"] = 0.75
T.save(C)

# narration envelope, placed exactly as the mixer places each line (src0..src1 -> t0)
SR, FPS = 16000, 60
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "vo/take.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
env = np.zeros(int(T.dur * FPS) + 2)
for l in T.lines.values():
    a, b = int(l["src0"] * SR), int(l["src1"] * SR)
    seg = x[a:b]
    hop = SR // FPS
    n = len(seg) // hop
    r = np.sqrt((seg[: n * hop].reshape(n, hop) ** 2).mean(1)) if n else np.zeros(0)
    i0 = int(l["t0"] * FPS)
    env[i0:i0 + n] = np.maximum(env[i0:i0 + n], r[: len(env) - i0])
env = np.clip(env / (np.percentile(env[env > 0], 95) + 1e-9), 0, 1.2)
open("build/env.js", "w").write("window.ENV = " + json.dumps({"fps": FPS, "v": [round(float(v), 3) for v in env]}) + ";\n")
