"""Colour science for 'copy the look': sRGB <-> Lab and a 3D LUT that moves your footage's
colour statistics toward a reference (Reinhard-style transfer with safety clamps)."""
from __future__ import annotations

from pathlib import Path

import numpy as np

_M = np.array([[0.4124564, 0.3575761, 0.1804375],
               [0.2126729, 0.7151522, 0.0721750],
               [0.0193339, 0.1191920, 0.9503041]])
_MI = np.linalg.inv(_M)
_WHITE = np.array([0.95047, 1.0, 1.08883])


def _lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _gam(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def rgb_to_lab(rgb):
    """rgb: (...,3) floats 0..1 -> Lab (...,3)"""
    xyz = _lin(np.asarray(rgb, dtype=np.float64)) @ _M.T / _WHITE
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], -1)


def lab_to_rgb(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    fy = (L + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200
    f = np.stack([fx, fy, fz], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * _WHITE
    return _gam(xyz @ _MI.T)


def transfer_lut(src_stats: dict, ref_stats: dict, strength=0.7, size=33):
    """LUT grid (size^3, 3) mapping source colours toward the reference look."""
    ms, ss = np.array(src_stats["lab_mean"]), np.maximum(np.array(src_stats["lab_std"]), 1e-3)
    mr, sr = np.array(ref_stats["lab_mean"]), np.array(ref_stats["lab_std"])
    ratio = np.clip(sr / ss, [0.75, 0.55, 0.55], [1.4, 1.8, 1.8])
    shift = np.clip(mr - ms, [-14, -12, -12], [14, 12, 12])
    g = np.linspace(0, 1, size)
    # .cube order: red changes fastest
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    lab = rgb_to_lab(rgb)
    new = (lab - ms) * ratio + ms + shift
    # protect skin-ish tones and neutrals a little: blend chroma change by original chroma
    out = lab_to_rgb(new)
    s = float(np.clip(strength, 0, 1))
    return rgb * (1 - s) + out * s


def write_cube(path, grid, size=33, title="vibe-look"):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="ascii") as f:
        f.write(f'TITLE "{title}"\nLUT_3D_SIZE {size}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for r, g, b in np.clip(grid, 0, 1):
            f.write(f"{r:.6f} {g:.6f} {b:.6f}\n")
    return path


def read_cube(path):
    size, rows = None, []
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.upper().startswith("LUT_3D_SIZE"):
            size = int(line.split()[1])
        elif line[0].isdigit() or line[0] in "-.":
            rows.append([float(x) for x in line.split()[:3]])
    return size, np.array(rows)


def blend_cube(src_path, out_path, strength):
    """Mix an existing .cube with identity (strength 0..1)."""
    size, grid = read_cube(src_path)
    g = np.linspace(0, 1, size)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")
    ident = np.stack([r, gg, b], -1).reshape(-1, 3)
    s = float(np.clip(strength, 0, 1))
    return write_cube(out_path, ident * (1 - s) + grid * s, size)
