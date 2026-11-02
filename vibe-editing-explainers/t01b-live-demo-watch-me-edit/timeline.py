"""T01B · Watch me edit this by just talking. Lines from the composed take (hook + shared T01 body)."""
import json, subprocess, sys
import numpy as np
sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "raw": 0.4, "tell": 0.3, "c1": 0.35, "c2": 0.3, "c3": 0.3,
                             "c4": 0.3, "just": 0.4, "outro": 0.45}, tail=3.0)
w, L, E = T.w, T.L, T.E
cue = {
    "watch": w("hook", "watch"), "edit": w("hook", "edit"), "this": w("hook", "this"), "just0": w("hook", "just"),
    "by": w("hook", "by"), "talking0": w("hook", "talking"),
    "raw": L("raw"), "rawclip": w("raw", "clip"), "noedits": w("raw", "no"),
    "tell": L("tell"), "agent": w("tell", "agent"), "want": w("tell", "want"),
    "c1": L("c1"), "pauses": w("c1", "pauses"), "done1": w("c1", "done"),
    "c2": L("c2"), "bold": w("c2", "bold"), "captions": w("c2", "captions"), "done2": w("c2", "done"),
    "c3": L("c3"), "warmer": w("c3", "warmer"), "music": w("c3", "music"), "done3": w("c3", "done"),
    "c4": L("c4"), "thirty": w("c4", "thirty"), "logo": w("c4", "logo"), "done4": w("c4", "done"),
    "just": L("just"), "notimeline": w("just", "timeline"), "nokey": w("just", "keyframes"), "talking": w("just", "talking"),
    "outro": L("outro"), "vibe": w("outro", "vibe"), "follow": w("outro", "follow"), "join": w("outro", "join"),
    "vibe2": w("outro", "vibe", 2), "outroEnd": E("outro"),
}
cue["cover"] = cue["captions"] + 0.6
out = T.save(cue)

# narration loudness envelope at 60 Hz on the film's clock, so the mic waveform moves with the voice
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "vo/take.mp3", "-ac", "1", "-ar", "24000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32); SR = 24000
env = np.zeros(int(T.dur * 60) + 1)
for l in T.lines.values():
    a, b = int(l["src0"] * SR), int(l["src1"] * SR)
    seg = x[a:b]; n = len(seg) // 400
    r = np.sqrt((seg[: n * 400].reshape(n, 400) ** 2).mean(1)) if n else np.zeros(0)
    t0 = l["t0"]
    for i, v in enumerate(r):
        k = int((t0 + i * 400 / SR) * 60)
        if 0 <= k < len(env): env[k] = max(env[k], v)
env = np.clip(env / (np.percentile(env[env > 0], 95) + 1e-9), 0, 1.2)
open("build/env.js", "w").write("window.ENV = [" + ",".join(f"{v:.3f}" for v in env) + "];\n")
