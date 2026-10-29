"""Shared mixer: voiceover + ducked music bed + foley, normalised to -14 LUFS.

    import sys; sys.path.insert(0, "../lib")
    from mixer import Mixer
    m = Mixer(__file__, music="lofi_02_lily_j.mp3", music_db=-9)
    m.lay(t, x)          # paper block laid down
    m.card(t, x)         # card slides in (air + paper)
    m.pop(t, x)          # soft pop
    m.glide(t)           # camera / layout transition: one air pass peaking at t
    m.typing(a, b)       # real keyboard typing between a and b
    m.hit("camera_shutter", t, -12)
    m.finish()           # -> build/mix.wav

Every effect is peak-normalised to -1 dBFS before its gain, so gains are comparable.
"""
import json, pathlib, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000


def _load(path, peak_db=None):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    if peak_db is not None:
        x *= 10 ** (peak_db / 20) / (np.abs(x).max() + 1e-9)
    return x


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x, axis=0)


def db(v):
    return 10 ** (v / 20)


class Mixer:
    def __init__(self, file, music, music_db=-9, music_offset=0.0, duck=0.55, seed=3):
        self.dir = pathlib.Path(file).resolve().parent
        self.A = self.dir.parent / "assets"
        self.TL = json.load(open(self.dir / "build/timeline.json"))
        self.C = self.TL["cue"]
        self.N = int(self.TL["dur"] * SR)
        self.rng = np.random.default_rng(seed)
        self.fx = np.zeros((self.N, 2))
        self.vo = self._voice()
        self.mus = self._music(music, music_db, music_offset, duck)
        self.SFX = {p.stem: _load(p, peak_db=-1) for p in (self.A / "sfx").glob("*.mp3")}

    # ------------------------------------------------------------ voice --
    def _voice(self):
        take = _load(self.dir / "vo/take.mp3")
        vo = np.zeros((self.N, 2))
        for l in self.TL["lines"].values():
            a, b = int((l["src0"] - 0.06) * SR), int((l["src1"] + 0.22) * SR)
            seg = take[max(0, a):b].copy()
            fade = np.ones(len(seg)); fi, fo = int(0.012 * SR), int(0.06 * SR)
            fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
            seg *= fade[:, None]
            i = int((l["t0"] - 0.06) * SR)
            vo[i:i + len(seg)] += seg[: self.N - i]
        vo = filt(vo, "highpass", 75)
        n = int(0.03 * SR)
        rms = np.sqrt(np.convolve(vo.mean(1) ** 2, np.ones(n) / n, "same")) + 1e-9
        lvl = 20 * np.log10(rms)
        vo *= db(np.where(lvl > -24, (-24 + (lvl + 24) / 3) - lvl, 0))[:, None]   # 3:1 leveller
        return vo * db(-3) / (np.abs(vo).max() + 1e-9)

    # ------------------------------------------------------------ music --
    def _music(self, name, music_db, offset, duck_amt):
        bed = _load(self.A / "music" / name)[int(offset * SR):]
        mus = np.zeros((self.N, 2)); mus[: min(self.N, len(bed))] = bed[: self.N]
        t = np.arange(self.N) / SR
        n = int(0.25 * SR)
        on = np.clip(np.convolve((np.abs(self.vo).mean(1) > 0.01).astype(float), np.ones(n) / n, "same") * 3, 0, 1)
        duck = np.zeros(self.N); a_in, a_out = 1 - np.exp(-1 / (0.08 * SR)), 1 - np.exp(-1 / (0.5 * SR))
        for i in range(1, self.N):
            v = on[i]; duck[i] = duck[i - 1] + (v - duck[i - 1]) * (a_in if v > duck[i - 1] else a_out)
        g = db(music_db) * (1 - duck_amt * duck) * np.clip(t / 1.2, 0, 1) * np.clip((self.TL["dur"] - t) / 2.6, 0, 1) ** 1.5
        return filt(mus * g[:, None], "lowpass", 9000)

    # ------------------------------------------------------------ foley --
    @staticmethod
    def _onset(x):
        e = np.abs(x).mean(1); return int(np.argmax(e > e.max() * 0.08))

    @staticmethod
    def _peak(x):
        return int(np.argmax(np.convolve(np.abs(x).mean(1), np.ones(480) / 480, "same")))

    def hit(self, name, at, gain_db=-12, pan=0.0, align="onset", rate=1.0, length=None, hp=None):
        x = self.SFX[name]
        if rate != 1.0:
            idx = np.arange(0, len(x) - 1, rate)
            x = np.stack([np.interp(idx, np.arange(len(x)), x[:, ch]) for ch in (0, 1)], 1)
        if length:
            x = x[: self._onset(x) + int(length * SR)].copy()
            f = min(len(x), int(0.04 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
        if hp:
            x = filt(x, "highpass", hp)
        i = int(at * SR) - (self._peak(x) if align == "peak" else self._onset(x))
        if i < 0: x, i = x[-i:], 0
        if i >= self.N: return
        x = x[: self.N - i] * db(gain_db)
        pan = max(-1, min(1, pan))
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        self.fx[i:i + len(x), 0] += x[:, 0] * l
        self.fx[i:i + len(x), 1] += x[:, 1] * r

    def lay(self, at, x=0, quiet=0):
        self.hit("paper_slide" if self.rng.random() < 0.6 else "paper_quick", at + 0.02, -13 + quiet, pan=x / 700,
                 rate=self.rng.uniform(0.94, 1.06))

    def card(self, at, x=0, quiet=0):
        self.hit("air_woosh", at + 0.18, -24 + quiet, pan=x / 700, align="peak", length=0.9)
        self.hit("paper_slide", at + 0.05, -15 + quiet, pan=x / 700, rate=0.92)

    def pop(self, at, x=0, g=-18):
        self.hit("light_pop", at, g, pan=x / 700, rate=self.rng.uniform(0.9, 1.15))

    def glide(self, at, k=0, g=-15):
        self.hit("air_woosh" if k % 2 == 0 else "short_wind_swoosh", at, g, pan=(-0.3 if k % 2 else 0.3), align="peak")

    def typing(self, a, b, g=-19):
        x = self.SFX["laptop_typing"]
        o = self._onset(x) + int(1.0 * SR)
        seg = x[o:o + int((b - a) * SR)].copy()
        f = min(len(seg), int(0.08 * SR)); seg[-f:] *= np.linspace(1, 0, f)[:, None]
        i = int(a * SR); seg = seg[: self.N - i] * db(g)
        self.fx[i:i + len(seg)] += seg

    # ------------------------------------------------------------ master --
    def finish(self, fx_db=-1):
        mix = filt(self.vo + self.mus + filt(self.fx, "highpass", 90) * db(fx_db), "highpass", 30)
        raw = self.dir / "build/mix_raw.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "2", "-i", "-", str(raw)],
                       input=np.clip(mix, -1, 1).astype(np.float64).tobytes(), check=True)
        m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
        j = json.loads(m[m.rindex("{"):])
        af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
              f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, "-ar", str(SR), str(self.dir / "build/mix.wav")], check=True)
        print(f"mix: {self.TL['dur']} s, input {j['input_i']} LUFS -> -14 LUFS")
