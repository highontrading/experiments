"""Places the voiceover (hook + shared T01 body) on the clock and names cues after words.
    python timeline.py  ->  build/timeline.json + build/timeline.js"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "raw": 0.35, "tell": 0.2, "c1": 0.25, "c2": 0.25, "c3": 0.25,
                             "c4": 0.25, "just": 0.3, "outro": 0.35}, tail=2.6)
w, L, E = T.w, T.L, T.E
C = {
    # hook: split screen
    "h_raw": w("hook", "raw"), "h_left": w("hook", "left"), "h_finished": w("hook", "finished"),
    "h_reel": w("hook", "reel"), "h_right": w("hook", "right"), "h_end": E("hook"),
    # body
    "raw": L("raw"), "r_raw": w("raw", "raw"), "r_clip": w("raw", "clip"), "r_no": w("raw", "no"), "r_edits": w("raw", "edits"),
    "tell": L("tell"), "t_tell": w("tell", "tell"), "t_agent": w("tell", "agent"), "t_want": w("tell", "want"), "t_end": E("tell"),
    "c1": L("c1"), "c1_cut": w("c1", "cut"), "c1_pauses": w("c1", "pauses"), "c1_done": w("c1", "done"),
    "c2": L("c2"), "c2_bold": w("c2", "bold"), "c2_captions": w("c2", "captions"), "c2_done": w("c2", "done"),
    "c3": L("c3"), "c3_warmer": w("c3", "warmer"), "c3_soft": w("c3", "soft"), "c3_music": w("c3", "music"),
    "c3_done": w("c3", "done"),
    "c4": L("c4"), "c4_thirty": w("c4", "thirty"), "c4_end": w("c4", "end"), "c4_logo": w("c4", "logo"),
    "c4_done": w("c4", "done"),
    "just": L("just"), "j_no1": w("just", "no"), "j_timeline": w("just", "timeline"), "j_no2": w("just", "no", 2),
    "j_keyframes": w("just", "keyframes"), "j_just": w("just", "just"), "j_talking": w("just", "talking"),
    "outro": L("outro"), "o_vibe": w("outro", "vibe"), "o_follow": w("outro", "follow"), "o_join": w("outro", "join"),
    "o_vibe2": w("outro", "vibe", 2), "o_editing": w("outro", "editing", 2), "o_end": E("outro"),
}
C["cover"] = C["h_right"] + 0.3
T.save(C)

# Voice envelope on the film's clock (60 per second), for the live mic waveform.
import json, subprocess
import numpy as np
SR, FPS_E = 16000, 60
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(T.dir / "vo/take.mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
env = np.zeros(int(T.dur * FPS_E) + 1)
for l in T.lines.values():
    a, b = int(l["src0"] * SR), int(l["src1"] * SR)
    seg = x[a:b]
    n = len(seg) // (SR // FPS_E)
    if n <= 0: continue
    rms = np.sqrt((seg[: n * (SR // FPS_E)].reshape(n, -1) ** 2).mean(1))
    i0 = int(l["t0"] * FPS_E)
    env[i0:i0 + n] = rms[: len(env) - i0]
env = np.clip(env / (np.percentile(env[env > 0], 95) + 1e-6), 0, 1.2)
(T.dir / "build/env.js").write_text("window.ENV = " + json.dumps([round(float(v), 3) for v in env]) + ";\n")
