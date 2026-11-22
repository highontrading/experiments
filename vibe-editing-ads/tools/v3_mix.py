"""V3 mix: dialogue + music that only starts when he asks for it (downbeat on the enter key), ducked under
the voice + every SFX cue exported by the stage (build/v3/sfx.json).  -> build/v3/mix.wav"""
import json, os, subprocess, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W3 = "/home/user/work3"; SR = 48000
def load(p, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", p] + (["-af", af] if af else []) + ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
db = lambda g: 10 ** (g / 20)
meta = json.load(open(f"{ROOT}/build/v3/meta.json")); cues = json.load(open(f"{ROOT}/build/v3/sfx.json"))
dur, mt, end = meta["dur"], meta["music_t"], meta["speech_end"]; N = int(dur * SR); t = np.arange(N) / SR
voice = np.zeros((N, 2), np.float32); d = load(f"{W3}/dlg.wav"); voice[:min(N, len(d))] = d[:N]
# music: first strong transient of the track lands on the drop
mus = load(f"{W3}/music.mp3"); env = np.abs(mus[:SR * 3, 0]); first = int(np.argmax(env > 0.35 * env.max()))
mus = mus[max(0, first - int(0.01 * SR)):]
music = np.zeros((N, 2), np.float32); i0 = int(mt * SR); n = min(N - i0, len(mus)); music[i0:i0 + n] = mus[:n]
music *= (np.clip((t - mt) / 0.02, 0, 1) * np.clip((dur - t) / 1.4, 0, 1))[:, None]
# duck under the voice
e = np.abs(voice[:, 0]); hop = 480; ev = np.array([e[k:k + hop].max() for k in range(0, N, hop)]); ev = np.convolve(ev, np.ones(10) / 10, "same")
duck = np.interp(np.arange(N), np.arange(len(ev)) * hop, np.clip(ev / 0.12, 0, 1))
board = [c["t"] for c in cues if c["name"] == "thud"]
gain = db(-15) * (1 - 0.45 * duck)
# a touch quieter under the whiteboard explainer, full after the voice ends
wb0 = next((c["t"] for c in cues if c["name"] == "swipe" and c["t"] > 30), None)
if wb0: gain *= np.where((t > wb0) & (t < wb0 + 27), db(-2.5), 1.0)
gain *= 1 + 0.9 * np.clip((t - end) / 0.4, 0, 1)
music *= gain[:, None]
fx = np.zeros((N, 2), np.float32); cache = {}
for c in cues:
    if c["name"] == "__music": continue
    p = f"{W3}/sfx/{c['name']}.mp3"
    if not os.path.exists(p): print("missing sfx", c["name"]); continue
    if c["name"] not in cache: x = load(p); x /= max(1e-4, np.abs(x).max()); cache[c["name"]] = x * db(-6)
    x = cache[c["name"]] * c["g"]; i = int(c["t"] * SR)
    if c["name"] in ("rise",): i = int((c["t"] - len(x) / SR + 0.15) * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); fx[i:j] += x[:j - i]
mix = voice + music + fx * db(-5)
raw = f"{ROOT}/build/v3/_raw.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", raw], input=mix.astype(np.float32).tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "alimiter=limit=0.95:attack=3:release=60,loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", str(SR), f"{ROOT}/build/v3/mix.wav"], check=True)
os.remove(raw); print("mix ok", dur, "music at", mt, "cues", len(cues))
