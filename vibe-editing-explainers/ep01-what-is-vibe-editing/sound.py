"""Sound: voiceover + lo-fi bed + close, soft foley on every move. Reads build/timeline.json.

Every effect lands on the same cue the picture uses (stage.js), so a block that lays down
on "mood" also sounds on "mood".
    python sound.py  ->  build/mix.wav (48 kHz stereo, loudness-normalised to -14 LUFS)
"""
import json, pathlib, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent
A = ROOT.parent / "assets"
TL = json.load(open(ROOT / "build/timeline.json"))
C, LINES = TL["cue"], TL["lines"]
SR = 48000
N = int(TL["dur"] * SR)
rng = np.random.default_rng(3)


def load(path, peak_db=None):
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


# ------------------------------------------------------------------ voice --
take = load(ROOT / "vo/take.mp3")
vo = np.zeros((N, 2))
for k, l in LINES.items():
    a, b = int((l["src0"] - 0.06) * SR), int((l["src1"] + 0.22) * SR)
    seg = take[max(0, a):b].copy()
    fade = np.ones(len(seg)); fi, fo = int(0.012 * SR), int(0.06 * SR)
    fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
    seg *= fade[:, None]
    i = int((l["t0"] - 0.06) * SR)
    vo[i:i + len(seg)] += seg[: N - i]
vo = filt(vo, "highpass", 75)
# gentle leveller: 3:1 above -24 dBFS on a 30 ms RMS
rms = np.sqrt(np.convolve(vo.mean(1) ** 2, np.ones(int(0.03 * SR)) / int(0.03 * SR), "same")) + 1e-9
lvl = 20 * np.log10(rms)
gain = np.where(lvl > -24, (-24 + (lvl + 24) / 3) - lvl, 0)
vo *= db(gain)[:, None]
vo *= db(-3) / (np.abs(vo).max() + 1e-9)

# ------------------------------------------------------------------ music --
bed = load(A / "music/lofi_02_lily_j.mp3")
mus = np.zeros((N, 2))
mus[: min(N, len(bed))] = bed[:N]
t = np.arange(N) / SR
voice_on = np.convolve((np.abs(vo).mean(1) > 0.01).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
voice_on = np.clip(voice_on * 3, 0, 1)
# smooth the duck: fast in, slow out
duck = np.zeros(N); a_in, a_out = 1 - np.exp(-1 / (0.08 * SR)), 1 - np.exp(-1 / (0.5 * SR))
for i in range(1, N):
    v = voice_on[i]
    duck[i] = duck[i - 1] + (v - duck[i - 1]) * (a_in if v > duck[i - 1] else a_out)
mgain = db(-9) * (1 - 0.55 * duck)
mgain *= np.clip(t / 1.2, 0, 1)                                    # fade in
mgain *= np.clip((TL["dur"] - t) / 2.6, 0, 1) ** 1.5               # fade out
mus *= mgain[:, None]
mus = filt(mus, "lowpass", 9000)

# ------------------------------------------------------------------ foley --
SFX = {p.stem: load(p, peak_db=-1) for p in (A / "sfx").glob("*.mp3")}
fx = np.zeros((N, 2))


def onset(x):
    e = np.abs(x).mean(1)
    return int(np.argmax(e > e.max() * 0.08))


def peak(x):
    e = np.convolve(np.abs(x).mean(1), np.ones(480) / 480, "same")
    return int(np.argmax(e))


def hit(name, at, gain_db=-12, pan=0.0, align="onset", rate=1.0, length=None, hp=None):
    x = SFX[name]
    if rate != 1.0:  # small pitch/speed change so repeats don't sound copied
        idx = np.arange(0, len(x) - 1, rate)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, ch]) for ch in (0, 1)], 1)
    if length:
        x = x[: onset(x) + int(length * SR)].copy()
        f = int(0.04 * SR); x[-f:] *= np.linspace(1, 0, f)[:, None]
    if hp:
        x = filt(x, "highpass", hp)
    off = peak(x) if align == "peak" else onset(x)
    i = int(at * SR) - off
    if i < 0:
        x, i = x[-i:], 0
    x = x[: N - i] * db(gain_db)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    fx[i:i + len(x), 0] += x[:, 0] * l
    fx[i:i + len(x), 1] += x[:, 1] * r


def lay(at, x=0, quiet=0):   # a paper block laid down on the mat
    hit("paper_slide" if rng.random() < 0.6 else "paper_quick", at + 0.02, -13 + quiet, pan=x / 700, rate=rng.uniform(0.94, 1.06))


def card(at, x=0):           # a card slides in: air + paper
    hit("air_woosh", at + 0.18, -24, pan=x / 700, align="peak", length=0.9)
    hit("paper_slide", at + 0.05, -15, pan=x / 700, rate=0.92)


def pop(at, x=0, g=-18):
    hit("light_pop", at, g, pan=x / 700, rate=rng.uniform(0.9, 1.15))


def typing(a, b, g=-19):
    x = SFX["laptop_typing"]
    o = onset(x) + int(1.0 * SR)
    seg = x[o:o + int((b - a) * SR)].copy()
    f = int(0.08 * SR); seg[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(a * SR); seg = seg[: N - i] * db(g)
    fx[i:i + len(seg)] += seg


# camera glides: one soft air pass per move (peak in the middle of the glide)
starts = [C["s_title"], C["s_past"], C["s_flip"], C["s_how"], C["s_scale"], C["s_role"], C["s_outro"]]
for k, s in enumerate(starts):
    hit("air_woosh" if k % 2 == 0 else "short_wind_swoosh", s - 0.35 + 0.5, -15, pan=(-0.3 if k % 2 else 0.3), align="peak")
# intro: the mat settles
hit("page_turn", 0.05, -14)
hit("tech_slide", 0.2, -24)

# hook
card(0.15, 0); pop(0.45, 450, -24); pop(0.65, -470, -24)
lay(C["hook_never"] - 0.05, -120); lay(C["hook_timeline"] - 0.05, 170)
hit("mouse_click", C["hook_dragged"], -10, pan=0.2)
pop(C["hook_dragged"] + 0.05, -250, -16)
card(C["hook_written"] - 0.1, 0)
typing(C["hook_written"] + 0.2, C["s_title"] - 0.2)
lay(C["hook_code"] - 0.1, -110); lay(C["hook_ai"] - 0.05, 200); pop(C["hook_ai"] + 0.2, 380, -20)


def cover(at):  # the cover comp lands piece by piece (stage.js titleComp)
    hit("long_pop", at - 0.1, -16, pan=0.2)
    pop(at + 0.05, -290, -18)
    lay(at + 0.25, -110, quiet=2); lay(at + 0.55, 170, quiet=2); lay(at + 0.85, -10, quiet=2)
    pop(at + 1.0, 300, -20); pop(at + 0.45, 60, -24); pop(at + 1.15, 330, -22)


cover(C["title_vibe"] - 0.3)
pop(C["title_vibe"] - 0.6, -440, -24)

# past
lay(C["past_century"] - 0.25, -200)
card(C["past_this"] - 0.45, 0)
hit("vintage_shutter", C["past_this"] - 0.2, -22, pan=-0.1)
lay(C["past_cutting"] - 0.05, -150); lay(C["past_hand"] - 0.05, 200)
card(C["past_dragging"] - 0.3, 300)
lay(C["past_frame"] - 0.05, -40)
card(C["past_hours"] - 0.35, 270); lay(C["past_hours"] - 0.05, -170)
hit("paper_quick", C["past_hours"] + 0.1, -12, pan=0.5, rate=0.9)   # clock sticker
tk = C["past_hours"] + 0.15
while tk < C["s_flip"] - 0.5:  # the clock running: soft ticks that slow down
    hit("typewriter_soft_click", tk, -24, pan=0.35, rate=rng.uniform(0.95, 1.1))
    tk += 0.09 + 0.25 * ((tk - C["past_hours"]) / (C["s_flip"] - C["past_hours"])) ** 2

# flip
lay(C["flip_flips"] - 0.75, -150); lay(C["flip_flips"] - 0.05, 230)
card(C["flip_describe"] - 0.5, -200); card(C["flip_describe"] - 0.2, 20)
typing(C["flip_describe"] + 0.1, C["flip_plain"] + 0.5)
lay(C["flip_mood"] - 0.05, -260); lay(C["flip_pace"] - 0.05, 10); lay(C["flip_look"] - 0.05, 270)

# how
card(C["s_how"] + 0.25, -150)
lay(C["how_agent"] - 0.1, -150); pop(C["how_agent"] + 0.1, 60, -20)
card(C["how_code"] - 0.3, 0)
typing(C["how_code"], C["how_code"] + 2.9, -21)
for k, x in (("how_clip", 380), ("how_caption", 400), ("how_sound", 380)):
    pop(C[k], x, -16)
hit("tech_slide", C["how_renders"], -18)
hit("camera_shutter", C["how_video"] + 0.15, -12, pan=0.1)
card(C["how_video"] - 0.1, 30); hit("long_pop", C["how_video"] + 0.15, -20)

# scale
lay(C["s_scale"] + 0.35, -130); card(C["s_scale"] + 0.25, 0)
lay(C["scale_line"] - 0.05, 250)
hit("ui_click", C["scale_faster"], -14); card(C["scale_faster"] - 0.3, -180)
hit("ui_click", C["scale_hindi"], -14); card(C["scale_hindi"] - 0.3, 220)
hit("ui_click", C["scale_hundred"], -14)
for i in range(26):   # a hundred tiles popping in, centre outwards
    pop(C["scale_hundred"] - 0.05 + 0.8 * (i / 25) ** 1.3, rng.uniform(-450, 450), -25 + rng.uniform(-3, 2))
lay(C["scale_hundred"] + 0.1, 0)

# role
for i in range(3):
    hit("mouse_click", C["role_stop"] - 0.1 + i * 0.25, -11 - 2 * i, pan=-0.05)
hit("mouse_click", C["role_clicking"], -12)
lay(C["role_stop"] - 0.1, -60)
hit("small_sweep", C["role_clicking"] + 0.25, -20)
hit("paper_slide", C["role_clicking"] + 0.2, -14, pan=0.6, rate=0.85)
card(C["role_start"] - 0.35, 0)
lay(C["role_start"] - 0.05, -120); lay(C["role_directing"] - 0.05, 150)
pop(C["role_directing"] + 0.1, 420, -20)

# outro
cover(C["s_outro"] + 0.45)
hit("switch_tap", C["outro_follow"] + 0.15, -9, pan=-0.3)
pop(C["outro_follow"] + 0.3, -300, -20)

fx = filt(fx, "highpass", 90)

# ------------------------------------------------------------------ mix --
mix = vo * db(0) + mus + fx * db(-1)
mix = filt(mix, "highpass", 30)
out = ROOT / "build/mix_raw.wav"
pcm = np.clip(mix, -1, 1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "2", "-i", "-", str(out)],
               input=pcm.astype(np.float64).tobytes(), check=True)
# two-pass loudness normalisation to -14 LUFS, true peak -1.5 dB
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
      f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-af", af, "-ar", str(SR), str(ROOT / "build/mix.wav")], check=True)
print(f"mix: {TL['dur']} s, input {j['input_i']} LUFS -> -14 LUFS")
