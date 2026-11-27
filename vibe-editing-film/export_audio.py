"""Hand the film's sound to real-sfx: a typed cue list and a music-only stem.

    python export_audio.py  ->  build/cues.json              every SFX event from timeline.py, in real-sfx kinds
                                build/audio/stems/music.wav  the score as in out/vibe_editing.mp4, minus the SFX
                                build/audio/stems/sfx.wav    the synthesized SFX layer alone (for A/B and unbake)

The stems go through the same master chain as sound.py, with the compressor and the loudness gain driven by
the FULL mix, so music.wav + sfx.wav is the original track and music.wav sits at the level it had in the film.
"""
import json
import pathlib

import numpy as np
from scipy.io import wavfile

import sound as S
import timeline as TL

OUT = pathlib.Path(__file__).parent / "build"

# timeline kind -> (real-sfx kind, gain relative to nominal). Kinds real-sfx does not know (boing, powerdown,
# yay) keep their own name and are routed with from_cues.py --kind (see ../sfx-stack/README.md).
KIND = {
    "knock": ("thump", 1.0), "peel": ("paper", 0.9), "riser": ("riser", 0.8), "pop": ("pop", 1.2),
    "boing": ("boing", 0.6), "pomf": ("thump", 0.8), "whoosh": ("whoosh", 0.9), "click": ("click", 1.0),
    "blip": ("pop", 0.7), "snap": ("tick", 0.8), "tick": ("tick", 0.5), "swish": ("whoosh", 0.8),
    "sparkle": ("magic", 0.9), "select": ("click", 0.8), "thwack": ("hit", 1.0), "shimmer": ("magic", 1.0),
    "ding": ("chime", 1.0), "rewind": ("whoosh", 0.9), "skate": ("whoosh", 0.8), "scrub": ("tick", 0.4),
    "powerdown": ("powerdown", 0.7), "boom": ("boom", 1.1), "yay": ("yay", 0.9),
}


def cues():
    ev = TL.events()
    out = []
    keys = [e["t"] for e in ev if e["kind"] == "keytap"]
    if keys:   # one typing stretch: real-sfx cuts single real keystrokes out of a typing recording
        out.append({"t": round(keys[0], 3), "type": "key", "len": round(keys[-1] - keys[0] + 0.08, 3),
                    "n": len(keys), "src": "keytap"})
    for e in ev:
        k = e["kind"]
        if k in ("keytap", "brass"):          # brass is part of the music
            continue
        kind, g = KIND[k]
        c = {"t": round(e["t"], 3), "type": kind, "g": g, "src": k, "frame": e["frame"]}
        if "dur" in e:
            c["len"] = round(e["dur"], 3)
        out.append(c)
    return out


def stems():
    S.music()
    S.sfx()
    bed = S.mix_bed * S.pump() + S.mix_drm
    fx = S.mix_fx * 0.9
    full = S.filt((bed + fx).T, "highpass", 25).T
    bed = S.filt(bed.T, "highpass", 25).T
    fx = full - bed
    # every gain stage of sound.py's master is driven by the full mix; measure it there and apply it to each stem
    lvl = np.abs(full).max(axis=1)
    a, r = np.exp(-1 / (0.005 * S.SR)), np.exp(-1 / (0.12 * S.SR))
    envl = np.zeros(S.N)
    e = 0.0
    for i, v in enumerate(lvl):
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        envl[i] = e
    gr = 10 ** (np.minimum(0, (-16 - 20 * np.log10(envl + 1e-9)) * (1 - 1 / 3.0)) / 20)
    x = full * gr[:, None]
    norm = 10 ** (-12 / 20) / (np.sqrt(np.mean(x[int(2 * S.SR):int(10 * S.SR)] ** 2)) + 1e-9)
    t0, t1 = TL.T["fade"]
    t = np.arange(S.N) / S.SR
    fade = np.clip((t1 - t) / (t1 - t0), 0, 1) ** 1.5
    x = x * (norm * fade)[:, None]
    ceil = 10 ** (-1.0 / 20)
    peak = S.maximum_filter1d(np.abs(x).max(axis=1), size=int(0.004 * S.SR))
    g = np.minimum(1, ceil / (peak + 1e-9))
    g = np.minimum(g, np.convolve(g, np.ones(96) / 96, mode="same"))
    gain = (gr * norm * fade * g)[:, None]
    (OUT / "audio" / "stems").mkdir(parents=True, exist_ok=True)
    for name, x in (("music", bed), ("sfx", fx)):
        y = x * gain
        wavfile.write(OUT / "audio" / "stems" / f"{name}.wav", S.SR, y.astype(np.float32))   # float: a stem may pass 0 dBFS
        print(f"{name}.wav  peak {20 * np.log10(np.abs(y).max() + 1e-9):.1f} dBFS")


def main():
    OUT.mkdir(exist_ok=True)
    c = cues()
    (OUT / "cues.json").write_text(json.dumps(c, indent=1))
    kinds = {}
    for x in c:
        kinds[x["type"]] = kinds.get(x["type"], 0) + 1
    print(f"cues.json: {len(c)} cues  " + ", ".join(f"{k} x{n}" for k, n in sorted(kinds.items())))
    stems()


if __name__ == "__main__":
    main()
