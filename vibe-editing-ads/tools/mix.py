"""Final audio for one ad: dialogue + music bed (muffled "basic" before the turn, full after,
downbeat on the reveal, ducked under the voice) + SFX cues from the timeline.
  python3 tools/mix.py 2511   -> build/2511/mix.wav
"""
import json, os, subprocess, sys, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = "/home/user/work"
SR = 48000
BEAT0, BAR = 0.035, 4 * 60 / 120.2      # measured from the generated track


def load(path, sr=SR, ch=2, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if af: cmd += ["-af", af]
    cmd += ["-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, ch).copy()


def save(path, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", path],
                   input=np.ascontiguousarray(x, np.float32).tobytes(), check=True)


def db(g): return 10 ** (g / 20)


def music_bed(total):
    full = load(f"{WORK}/music.mp3")
    a, b = int((BEAT0 + 14 * BAR) * SR), int((BEAT0 + 6 * BAR) * SR)   # loop bars 6..14
    out, F = full[:a].copy(), int(0.04 * SR)
    ramp = np.linspace(0, 1, F)[:, None]
    while len(out) < total:
        seg = full[b:a].copy()
        out[-F:] = out[-F:] * (1 - ramp) + seg[:F] * ramp
        out = np.concatenate([out, seg[F:]])
    return out


def main(n):
    tl = json.load(open(f"{ROOT}/build/{n}/timeline.json"))
    dur, TR, end = tl["dur"], tl["turn"]["tr"], tl["speech_end"]
    N = int(dur * SR)
    dlg = load(f"{WORK}/dlg_{n}.wav")
    voice = np.zeros((N, 2), np.float32); voice[:min(N, len(dlg))] = dlg[:N]

    # music: a bar line lands exactly on the reveal
    k = int(np.ceil((TR - BEAT0) / BAR)); off = BEAT0 + k * BAR - TR
    bed = music_bed(int((dur + off + 1) * SR))[int(off * SR):][:N]
    tmp = f"{ROOT}/build/{n}/_bed.wav"; save(tmp, bed)
    muff = load(tmp, af="lowpass=f=650,lowpass=f=900,highpass=f=120,volume=-3dB")[:N]
    t = np.arange(N) / SR
    w = np.clip((t - (TR - 0.06)) / 0.12, 0, 1)[:, None]
    # tail: hold under the end card, fade the last 1.4 s
    fade = np.clip((dur - t) / 1.4, 0, 1)[:, None]
    music = (muff * (1 - w) * db(-3) + bed * w) * fade
    # duck under the voice (envelope follower on the dialogue)
    env = np.abs(voice[:, 0]); hop = 480
    e = np.array([env[i:i + hop].max() for i in range(0, N, hop)])
    e = np.convolve(e, np.ones(12) / 12, mode="same")
    duck = np.interp(np.arange(N), np.arange(len(e)) * hop, np.clip(e / 0.12, 0, 1))
    music *= (db(-17) * (1 - 0.45 * duck))[:, None]
    # end card: lift the music once the voice is gone
    music *= (1 + 0.9 * np.clip((t - end) / 0.4, 0, 1))[:, None]

    # sfx
    fx = np.zeros((N, 2), np.float32); cache = {}
    for c in tl["sfx"]:
        if c["name"] not in cache:
            x = load(f"{WORK}/sfx/{c['name']}.mp3"); x /= max(1e-4, np.abs(x).max()); cache[c["name"]] = x * db(-6)
        x = cache[c["name"]] * c["g"]
        i = int(c["t"] * SR)
        if c["name"] == "riser":            # the riser should end on the reveal
            i = int((TR - len(x) / SR + 0.05) * SR)
        if i < 0: x = x[-i:]; i = 0
        j = min(N, i + len(x)); fx[i:j] += x[:j - i]
    mix = voice + music + fx * db(-4)
    raw = f"{ROOT}/build/{n}/_mix_raw.wav"; save(raw, mix)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    "alimiter=limit=0.95:attack=3:release=60,loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", str(SR),
                    f"{ROOT}/build/{n}/mix.wav"], check=True)
    os.remove(raw); os.remove(tmp)
    print(n, "mix ok", dur, "music offset %.3f" % off)


if __name__ == "__main__":
    for n in sys.argv[1:]: main(n)
