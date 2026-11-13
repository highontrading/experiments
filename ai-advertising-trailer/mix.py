"""Mix VO + re-arranged score stems + SFX from build/timeline.json -> build/mix.wav (48 kHz stereo, pre-master).
Score: build/music/score_a.mp3 (ElevenLabs Music) split with demucs into drums/bass/other; the arrangement
(breakdown, hard stop) is done here. SFX: build/sfx/*.mp3 (ElevenLabs sound generation)."""
import json, numpy as np, librosa, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
TL = json.load(open("build/timeline.json")); T, EV = TL["T"], TL["EV"]
DUR = TL["dur"]; N = int(DUR * SR) + SR
def db(x): return 10 ** (x / 20)
def load(p):
    y, _ = librosa.load(p, sr=SR, mono=False)
    return np.stack([y, y]) if y.ndim == 1 else y
def place(bus, y, at, gain=0.0, fade_in=0.0, fade_out=0.01, cut=None):
    y = y.copy() * db(gain)
    if cut is not None: y = y[:, :max(1, int((cut - at) * SR))]
    n = y.shape[1]
    if fade_in > 0: y[:, :int(fade_in * SR)] *= np.linspace(0, 1, int(fade_in * SR))
    fo = min(n, int(fade_out * SR));
    if fo > 0: y[:, n - fo:] *= np.linspace(1, 0, fo)
    i = int(at * SR)
    if i < 0: y = y[:, -i:]; i = 0
    j = min(N, i + y.shape[1]); bus[:, i:j] += y[:, :j - i]
def peak_t(y):   # time of the loudest transient (for aligning impacts)
    e = np.abs(y).mean(0); k = int(0.01 * SR); e = np.convolve(e, np.ones(k) / k, "same"); return np.argmax(e) / SR
def env_gain(points):   # piecewise-linear automation [(t, dB), ...] -> gain curve
    t = np.arange(N) / SR; ts, vs = zip(*points); return db(np.interp(t, ts, vs))

music = np.zeros((2, N)); vo = np.zeros((2, N)); sfx = np.zeros((2, N))
STEM = "build/music/stems/htdemucs/score_a/"
drums, bass, other = load(STEM + "drums.wav"), load(STEM + "bass.wav"), load(STEM + "other.wav")
at = TL["score_at"]
dbus, bbus, obus = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))
place(dbus, drums, at, fade_out=0.005, cut=T["stop"]); place(bbus, bass, at, fade_out=0.005, cut=T["stop"]); place(obus, other, at, fade_out=0.005, cut=T["stop"])

# breakdown: drums+bass out, the rest low-passed, from "like it still makes sense" to the cream world
b0, b1 = T["scatter"], T["cream"]
dbus *= env_gain([(0, 0), (b0 - 0.02, 0), (b0 + 0.03, -60), (b1 - 0.03, -60), (b1, 0), (DUR + 1, 0)])
bbus *= env_gain([(0, 0), (b0 - 0.02, 0), (b0 + 0.03, -60), (b1 - 0.03, -60), (b1, 0), (DUR + 1, 0)])
lp = sosfilt(butter(4, 700, "low", fs=SR, output="sos"), obus, axis=1)
mixk = np.interp(np.arange(N) / SR, [0, b0 - 0.02, b0 + 0.05, b1 - 0.05, b1, DUR + 1], [0, 0, 1, 1, 0, 0])
obus = obus * (1 - mixk) + lp * mixk * db(2)
# drums drop out for the beat of the "gap" split, back on "between"
dbus *= env_gain([(0, 0), (T["gap"] - 0.02, 0), (T["gap"] + 0.02, -18), (27.45, -18), (27.5, 0), (DUR + 1, 0)])
# finale: strip drums for the first bar so the riser has room, then back in
f0 = T["finale"]
dbus *= env_gain([(0, 0), (f0 - 0.02, 0), (f0 + 0.02, -60), (f0 + 2.6, -60), (f0 + 2.8, -3), (DUR + 1, -3)])
# the score fades out on its own at ~47.3 s: loop the bar before (beats 58-62) up to the hard stop
def B(k): return TL['drop'] + k * TL['beat']
a0, a1 = int(B(58) * SR), int(B(62) * SR); L4 = a1 - a0; xf = int(0.01 * SR)
for bus in (dbus, bbus, obus):
    seg = bus[:, a0:a1].copy(); seg[:, :xf] *= np.linspace(0, 1, xf)
    bus[:, a1:a1 + xf] *= np.linspace(1, 0, xf); bus[:, a1 + xf:] = 0; bus[:, a1:a1 + L4] += seg
    bus[:, int(T['stop'] * SR):] = 0; bus[:, int(T['stop'] * SR) - 240:int(T['stop'] * SR)] *= np.linspace(1, 0, 240)
music = dbus + bbus + obus
music *= env_gain([(0, 0), (T["proof"], 0), (T["proof"] + 0.1, 1.5), (T["finale"], 1.5), (T["finale"] + 0.1, 0), (DUR + 1, 0)])

# VO
for l in TL["L"]:
    y = load(f"build/vo/l{l['i']:02d}.mp3"); place(vo, y, l["at"], gain=1.0, fade_out=0.04)

# duck music under VO (fast attack, slow release, up to -7 dB)
e = np.abs(vo).mean(0); k = int(0.02 * SR); e = np.convolve(e, np.ones(k) / k, "same")
act = np.clip(e / 0.02, 0, 1); rel = np.zeros_like(act); a_up, a_dn = 1 - np.exp(-1 / (0.015 * SR)), 1 - np.exp(-1 / (0.30 * SR))
v = 0.0
for i in range(0, N, 32):   # block-wise envelope follower
    x = act[i]; v += (x - v) * (1 - (1 - (a_up if x > v else a_dn)) ** 32); rel[i:i + 32] = v
music *= db(-7 * rel)

# SFX
S = {n: load(f"build/sfx/{n}.mp3") for n in ["intro_riser", "rev_swell", "flash_boom", "whoosh", "whip", "orb_ping", "orb_expand",
                                              "pop", "card_drop", "scatter", "glitch", "tick", "split", "final_riser", "sub_drop"]}
place(sfx, S["intro_riser"], 0.0, gain=-7, fade_in=0.4, fade_out=0.02, cut=T["hook_end"] - 0.02)
for c in EV["hook_cuts"][1:]: place(sfx, S["tick"], c, gain=-24)
place(sfx, S["rev_swell"], TL["drop"] - S["rev_swell"].shape[1] / SR + 0.02, gain=-6, fade_in=0.3, fade_out=0.02)
for hit in [TL["drop"], T["proof"], T["finale"]]:
    place(sfx, S["flash_boom"], hit - peak_t(S["flash_boom"]), gain=-3, fade_out=0.3)
for t in EV["ow_pops"]: place(sfx, S["card_drop"], t - 0.01, gain=-10)
place(sfx, S["scatter"], T["scatter"] - 0.05, gain=-5)
place(sfx, S["orb_ping"], T["orb_born"], gain=-9)
place(sfx, S["orb_expand"], T["cream"] - S["orb_expand"].shape[1] / SR + 0.15, gain=-6, fade_in=0.2)
for t in EV["logo_pops"]: place(sfx, S["pop"], t, gain=-14)
place(sfx, S["whip"], T["whip"] - 0.05, gain=-5)
for t in EV["camp_pops"]: place(sfx, S["pop"], t, gain=-13)
place(sfx, S["card_drop"], T["product"], gain=-9)
place(sfx, S["split"], T["gap"] + 0.02 - peak_t(S["split"]) * 0.3, gain=-3)
place(sfx, S["orb_ping"], EV["orb_ignite"], gain=-11)
place(sfx, S["whoosh"], EV["sats_in"] - 0.1, gain=-9)
place(sfx, S["sub_drop"], 29.70, gain=-6, fade_out=0.3)
for c in TL["proof"][1:]: place(sfx, S["tick"], c["s"], gain=-17)
fr = S["final_riser"]; place(sfx, fr, T["stop"] - 5.15, gain=-7, fade_in=1.0, fade_out=0.008, cut=T["stop"])
for h in [T["endcard"] + 0.14, T["endcard"] + 0.58]: place(sfx, S["glitch"][:, :int(0.12 * SR)], h, gain=-10, fade_out=0.02)
place(sfx, S["tick"], T["url"], gain=-14)

mix = vo + music * db(-2) + sfx * db(-1)
mix = mix[:, :int(DUR * SR)]
sf.write("build/mix.wav", mix.T.astype(np.float32), SR, subtype="FLOAT")
for name, bus in [("vo", vo), ("music", music), ("sfx", sfx)]: sf.write(f"build/bus_{name}.wav", bus[:, :int(DUR * SR)].T.astype(np.float32), SR, subtype="FLOAT")
print("peak", np.abs(mix).max())
