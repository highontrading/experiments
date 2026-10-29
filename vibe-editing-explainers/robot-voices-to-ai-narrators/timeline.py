"""Timeline: voice from 0:00 with the take's own short pauses; cues named after words.
    python timeline.py -> build/timeline.json, build/timeline.js, build/wave.js"""
import json, pathlib, subprocess, sys
import numpy as np
sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "doubt": 0.42, "ibm": 0.42, "phones": 0.38, "neural": 0.38,
                             "today": 0.25, "outro": 0.32}, tail=3.4)
w, L, E = T.w, T.L, T.E
C = {
    "y1939": w("hook", "1939"), "fair": w("hook", "new"), "worlds": w("hook", "world's"),
    "bell": w("hook", "bell"), "machine": w("hook", "machine"), "talk": w("hook", "talk"),
    "called": w("hook", "it"), "voder": w("hook", "voder"),
    "few": L("doubt"), "human": w("doubt", "human"),
    "y1961": w("ibm", "1961"), "ibm": w("ibm", "an"), "sang": w("ibm", "sang"), "daisy": w("ibm", "daisy"),
    "fifty": L("phones"), "phones": w("phones", "phones"), "back": w("phones", "back"),
    "neural": w("neural", "neural"), "breathe": w("neural", "breathe"), "pause": w("neural", "pause"),
    "laugh": w("neural", "laugh"),
    "voice": L("today"), "rightnow": w("today", "right"), "seconds": w("today", "seconds"),
    "oneline": w("today", "one"), "language": w("today", "language"), "tone": w("today", "tone"),
    "century": L("outro"), "narrator": w("outro", "narrator"), "setting": w("outro", "setting"),
    "follow": w("outro", "follow"),
}
C["cover"] = C["century"] + 0.9
T.save(C)

# the voice's loudness envelope at 100 Hz on the film's clock, for the live waveform
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "vo/take.mp3", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
env = np.zeros(int(T.dur * 100) + 1)
for l in T.lines.values():
    for k in range(int(l["t0"] * 100), int((l["t1"] + 0.2) * 100)):
        s = int((k / 100 - l["t0"] + l["src0"]) * 16000)
        seg = x[max(0, s - 80): s + 80]
        if k < len(env) and len(seg): env[k] = float(np.sqrt(np.mean(seg ** 2)))
env = np.clip(env / (env.max() + 1e-9), 0, 1)
pathlib.Path("build/wave.js").write_text("window.WAVE = " + json.dumps([round(v, 3) for v in env]) + ";\n")
