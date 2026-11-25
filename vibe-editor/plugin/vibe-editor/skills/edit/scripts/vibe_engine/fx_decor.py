"""Kinetic, decorative and transition overlays.

Paper-note headline walls, pseudo-3D orbits (letters / UI cards), stacked chips, slot-machine word rollers,
hand-drawn doodles / arrows / circles / frames (stroke draw-on + line boil), manga speed lines, shockwaves,
confetti, sparkles, door + paper-tear transitions, scrolling type walls, light leaks, comic bursts and
word stickers. Pure ASS (libass) — every effect defaults to the neutral palette (white, cream, charcoal, greys)
and uses the brand accent only as a small highlight.
"""
import bisect
import math
import random
import re
import zlib

from .core import FPS, resolve_font
from .text import c_tag, ellipse, esc, ev_window, polygon, rect, rrect, sizes_map, theme_color

DT = 1.0 / FPS
INK = "#161616"
CHARCOAL = "#1C1C1E"
CREAM = "#F3EDE0"
PAPER = "#F6F4EF"
WHITE = "#FFFFFF"

_NAMED = {"white": WHITE, "cream": CREAM, "paper": PAPER, "charcoal": CHARCOAL, "black": "#000000", "ink": INK,
          "grey": "#9A9A9E", "gray": "#9A9A9E", "dark": CHARCOAL, "light": "#F4F3EF", "silver": "#D8D8DC"}


# --------------------------------------------------------------------------- small safe helpers

def _num(v, d, lo=None, hi=None):
    try:
        f = float(v)
        if not math.isfinite(f):
            raise ValueError
    except (TypeError, ValueError):
        f = float(d)
    if lo is not None:
        f = max(lo, f)
    if hi is not None:
        f = min(hi, f)
    return f


def _color(ctx, v, default):
    if v is None or v is False or not str(v).strip():
        return default
    s = str(v).strip()
    if s.lower() in _NAMED:
        return _NAMED[s.lower()]
    s = str(theme_color(ctx, s.lower() if s.lower() in ("accent", "accent2", "card", "text") else s))
    if re.fullmatch(r"#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", s):
        return "#" + s.lstrip("#")
    return default


def _fx(ctx, v, d):
    names = {"left": 0.22, "center": 0.5, "centre": 0.5, "middle": 0.5, "right": 0.78}
    if isinstance(v, str) and v.strip().lower() in names:
        v = names[v.strip().lower()]
    f = _num(v, d)
    return f * ctx.W if -1.0 <= f <= 2.0 else f


def _fy(ctx, v, d):
    names = {"top": 0.15, "upper": 0.27, "center": 0.45, "centre": 0.45, "middle": 0.45, "lower": 0.62,
             "bottom": 0.76}
    if isinstance(v, str) and v.strip().lower() in names:
        v = names[v.strip().lower()]
    f = _num(v, d)
    return f * ctx.H if -1.0 <= f <= 2.0 else f


def _xy(ctx, e, dx, dy):
    return _fx(ctx, e.get("x"), dx), _fy(ctx, e.get("y", e.get("position")), dy)


def _pt(ctx, v, dx, dy):
    if isinstance(v, dict):
        return _fx(ctx, v.get("x"), dx), _fy(ctx, v.get("y"), dy)
    if isinstance(v, (list, tuple)) and len(v) >= 2:
        return _fx(ctx, v[0], dx), _fy(ctx, v[1], dy)
    return dx * ctx.W, dy * ctx.H


def _target(ctx, v, d):
    """[x, y, w, h]: centre + size, fractions of the frame (or pixels when > 2). Returns pixels."""
    vals = [None] * 4
    if isinstance(v, dict):
        vals = [v.get("x"), v.get("y"), v.get("w", v.get("width")), v.get("h", v.get("height"))]
    elif isinstance(v, (list, tuple)):
        vals = (list(v) + [None] * 4)[:4]
    cx, cy = _fx(ctx, vals[0], d[0]), _fy(ctx, vals[1], d[1])
    w, h = _num(vals[2], d[2]), _num(vals[3], d[3])
    w = w * ctx.W if w <= 2 else w
    h = h * ctx.H if h <= 2 else h
    w = max(40 * ctx.u, min(abs(w), ctx.W * 1.3))
    h = max(40 * ctx.u, min(abs(h), ctx.H * 1.3))
    return cx, cy, w, h


def _rng(e, salt):
    key = f"{salt}|{e.get('seed', 0)}|{e.get('at')}|{str(e.get('text', ''))[:40]}"
    return random.Random(zlib.crc32(key.encode("utf-8", "replace")))


def _items(v, default, maxn=6, maxlen=28):
    if isinstance(v, str):
        v = re.split(r"[|\n]", v)
    if not isinstance(v, (list, tuple)):
        v = default
    out = [str(x).strip()[:maxlen] for x in v if x is not None and not isinstance(x, (dict, list)) and str(x).strip()]
    return (out or list(default))[:maxn]


def _text(v, default, maxlen=40):
    s = default if v is None or isinstance(v, (dict, list)) else str(v)
    s = re.sub(r"\s+", " ", s).strip()[:maxlen]
    return s or default


def _sfx(ctx, e, t, name, vol=0.5):
    """Default sound — only when the user did not choose one (`sfx`: name / false)."""
    if "sfx" in e:
        return
    ctx.extra_sfx.append((round(max(0.0, t), 3), name, vol))


def _size(e, default, lo=20, hi=900, key="size"):
    return _num(sizes_map(e.get(key), default), default, lo, hi)


def _eo(p):
    p = min(1.0, max(0.0, p))
    return 1 - (1 - p) ** 3


def _ei(p):
    p = min(1.0, max(0.0, p))
    return p * p * p


def _eio(p):
    p = min(1.0, max(0.0, p))
    return p * p * (3 - 2 * p)


def _back(p, s=1.6):
    p = min(1.0, max(0.0, p)) - 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


def _rot(x, y, deg):
    """Rotate clockwise on screen (y down)."""
    r = math.radians(deg)
    c, s = math.cos(r), math.sin(r)
    return x * c - y * s, x * s + y * c


def _al(v):
    return f"&H{max(0, min(255, int(round(v)))):02X}&"


def _dr(ctx, a, b, path, tag, layer, color=WHITE, alpha=0, bord=0, ocolor=None, oalpha=None, blur=0, behind=None):
    """One vector drawing. Static colours first, then `tag` (positions + animations) so \\t wins."""
    if not path or b <= a + 0.001:
        return
    s = f"{{\\bord{bord:.4g}\\shad0\\1c{c_tag(color)}\\1a{_al(alpha)}"
    if ocolor:
        s += f"\\3c{c_tag(ocolor)}"
    if oalpha is not None:
        s += f"\\3a{_al(oalpha)}"
    if blur:
        s += f"\\blur{blur:.3g}"
    s += tag + "\\p1}" + path
    ctx.add(a, b, ctx.shape_style(), s, layer, behind=behind)


def _poly_path(pts):
    return polygon(pts) if pts else ""


# --------------------------------------------------------------------------- hand-drawn stroke engine

def _catmull(pts, closed=False, per=8):
    n = len(pts)
    if n < 3:
        return list(pts)
    P = [pts[-1]] + list(pts) + [pts[0], pts[1]] if closed else [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(per):
            t = k / per
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(P[-2])
    return out


def _resample(pts, step):
    if len(pts) < 2:
        return list(pts)
    out = [pts[0]]
    carry = 0.0
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg <= 1e-9:
            continue
        d = step - carry
        while d <= seg:
            t = d / seg
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
            d += step
        carry = seg - (d - step)
    if math.hypot(out[-1][0] - pts[-1][0], out[-1][1] - pts[-1][1]) > 0.5:
        out.append(pts[-1])
    return out


def _cum(pts):
    c = [0.0]
    for i in range(1, len(pts)):
        c.append(c[-1] + math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    return c


def _prefix(pts, cum, L):
    if L <= 0 or len(pts) < 2:
        return pts[:1]
    if L >= cum[-1]:
        return pts
    i = max(1, bisect.bisect_right(cum, L))
    seg = (cum[i] - cum[i - 1]) or 1.0
    t = (L - cum[i - 1]) / seg
    p = (pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t)
    return pts[:i] + [p]


def _spath(pts):
    """Zero-area there-and-back path: rendered with \\bord it becomes a round-capped stroke."""
    q = []
    for x, y in pts:
        p = (int(round(x)), int(round(y)))
        if not q or q[-1] != p:
            q.append(p)
    if not q:
        return ""
    if len(q) == 1:
        q.append((q[0][0] + 1, q[0][1]))
    seq = q + q[-2::-1]
    return f"m {seq[0][0]} {seq[0][1]} l " + " ".join(f"{x} {y}" for x, y in seq[1:])


def _make_strokes(defs, rng, jit, step, fscale):
    """defs: [(points_px, smooth, closed)] → wobbly hand-drawn polylines (smooth displacement field)."""
    p = [rng.uniform(0, 6.283) for _ in range(4)]
    f1, f2 = rng.uniform(2.4, 3.6), rng.uniform(6.0, 8.5)
    fs = max(1.0, fscale)
    out = []
    for pts, smooth, closed in defs:
        pp = []
        for x, y in pts:
            ux, uy = x / fs, y / fs
            dx = jit * (math.sin(f1 * ux + 1.7 * uy + p[0]) + 0.45 * math.sin(f2 * uy - 1.3 * ux + p[1]))
            dy = jit * (math.sin(f1 * uy - 1.9 * ux + p[2]) + 0.45 * math.sin(f2 * ux + 1.1 * uy + p[3]))
            pp.append((x + dx, y + dy))
        if smooth and len(pp) >= 3:
            pp = _catmull(pp, closed)
        elif closed and pp:
            pp = pp + [pp[0]]
        out.append(_resample(pp, step))
    return out


def _variants(defs, rng, n, jit, step, fscale):
    return [_make_strokes(defs, rng, jit, step, fscale) for _ in range(max(1, n))]


def _bbox(strokes, x, y, rot, pad):
    pts = [_rot(px, py, rot) for s in strokes for (px, py) in s]
    if not pts:
        return x - pad, y - pad, x + pad, y + pad
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return x + min(xs) - pad, y + min(ys) - pad, x + max(xs) + pad, y + max(ys) + pad


def _strokes_fx(ctx, a, b, variants, x, y, color, width, layer, t0=None, draw=0.5, anim="draw", rot=0.0,
                shadow=True, boil=0.12, out_ms=260, alpha=0, glow=False):
    """Draw-on (per-frame growing path) or pop, then a 'line boil' hold cycling jittered variants, then fade."""
    u = ctx.u
    if not variants or not variants[0]:
        return
    bord = max(1.0, width / 2.0)
    rz = f"\\frz{-rot:.1f}" if rot else ""
    pos = f"\\an7\\pos({x:.0f},{y:.0f})" + rz
    spos = f"\\an7\\pos({x + 2 * u:.0f},{y + 5 * u:.0f})" + rz
    sh_a = max(alpha, 0x98)

    def emit(t1, t2, path, extra=""):
        t2 = min(t2, b)
        if t2 <= t1 + 0.001 or not path:
            return
        if shadow:
            _dr(ctx, t1, t2, path, spos + extra, layer - 1, "#000000", sh_a, bord=bord + 1.5 * u, ocolor="#000000",
                oalpha=sh_a, blur=round(6 * u, 1))
        if glow:
            _dr(ctx, t1, t2, path, pos + extra, layer - 1, color, max(alpha, 0xA0), bord=bord * 2.6, ocolor=color,
                oalpha=max(alpha, 0xA0), blur=round(10 * u, 1))
        _dr(ctx, t1, t2, path, pos + extra, layer, color, alpha, bord=bord, ocolor=color, oalpha=alpha,
            blur=round(0.7 * u, 2))

    fulls = [" ".join(_spath(s) for s in var if s) for var in variants]
    t = max(a, a if t0 is None else t0)
    if t >= b - 0.05:
        return
    th = t
    if anim != "pop":
        v0 = variants[0]
        cums = [_cum(s) for s in v0]
        total = sum(c[-1] for c in cums) or 1.0
        nf = max(2, int(round(max(0.1, draw) * FPS)))
        for k in range(nf):
            ts = t + k * DT
            if ts >= b - DT:
                break
            p = (k + 1) / nf
            L = total * (0.5 * p + 0.5 * _eio(p))
            parts, acc = [], 0.0
            for s, c in zip(v0, cums):
                if L <= acc:
                    break
                parts.append(_spath(_prefix(s, c, L - acc)))
                acc += c[-1]
            emit(ts, ts + DT, " ".join(parts))
        th = t + nf * DT
    if th >= b - 0.01:
        return
    out_s = min(out_ms / 1000.0, (b - th) * 0.5)
    t_out = max(th, b - out_s)
    cur, idx = th, 0
    nv = len(fulls)
    if anim == "pop":
        e1 = min(t_out, th + 0.28)
        emit(th, e1, fulls[0], "\\fscx0\\fscy0\\t(0,150,\\fscx116\\fscy116)\\t(150,260,\\fscx100\\fscy100)")
        cur, idx = e1, 1
    while cur < t_out - 0.005:
        nxt = t_out if (not boil or nv < 2) else min(t_out, cur + boil)
        if t_out - nxt < (boil or 0) * 0.5:
            nxt = t_out
        emit(cur, nxt, fulls[idx % nv])
        cur, idx = nxt, idx + 1
    emit(t_out, b, fulls[idx % nv], f"\\fad(0,{int(out_s * 1000)})")


# --------------------------------------------------------------------------- doodle shapes (unit space ~ -0.5..0.5)

def _dot(cx, cy, r=0.028):
    return ([(cx + r * math.cos(i * math.pi / 4), cy + r * math.sin(i * math.pi / 4)) for i in range(8)], True, True)


def _loop(rx, ry, a0, turns, n=28, grow=0.06, cx=0.0, cy=0.0):
    pts = []
    for i in range(n + 1):
        th = a0 + 2 * math.pi * turns * i / n
        r = 1 + grow * i / n
        pts.append((cx + rx * r * math.cos(th), cy + ry * r * math.sin(th)))
    return pts


def _sparkle_pts(cx, cy, r, seg=6):
    tips = [(cx + r * math.cos(-math.pi / 2 + k * math.pi / 2), cy + r * math.sin(-math.pi / 2 + k * math.pi / 2))
            for k in range(5)]
    pts = []
    for k in range(4):
        (x0, y0), (x1, y1) = tips[k], tips[k + 1]
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        qx, qy = cx + (mx - cx) * 0.12, cy + (my - cy) * 0.12
        for i in range(seg):
            t = i / seg
            pts.append(((1 - t) ** 2 * x0 + 2 * (1 - t) * t * qx + t * t * x1,
                        (1 - t) ** 2 * y0 + 2 * (1 - t) * t * qy + t * t * y1))
    pts.append(tips[0])
    return pts


def _shape_defs(name, rng):
    if name == "star":
        pts = []
        for i in range(11):
            ang = -math.pi / 2 + i * math.pi / 5
            r = 0.5 if i % 2 == 0 else 0.205
            pts.append((r * math.cos(ang), r * math.sin(ang) + 0.04))
        pts.append((pts[0][0] + (pts[1][0] - pts[0][0]) * 0.22, pts[0][1] + (pts[1][1] - pts[0][1]) * 0.22))
        return [(pts, False, False)]
    if name == "heart":
        pts = []
        for i in range(31):
            t = i / 28 * 2 * math.pi
            x = 16 * math.sin(t) ** 3
            y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
            pts.append((x / 34, y / 34 - 0.075))
        return [(pts, True, False)]
    if name == "arrow":
        shaft = [(-0.46, 0.24), (-0.18, 0.04), (0.12, -0.1), (0.42, -0.14)]
        head = [(0.25, -0.29), (0.44, -0.14), (0.27, 0.02)]
        return [(shaft, True, False), (head, False, False)]
    if name == "circle":
        return [(_loop(0.49, 0.41, rng.uniform(-2.3, -1.8), 1.12), True, False)]
    if name == "underline":
        return [([(-0.5, 0.0), (-0.2, 0.035), (0.15, 0.012), (0.5, -0.04), (0.16, 0.07), (-0.32, 0.105)], True, False)]
    if name == "sparkle":
        return [(_sparkle_pts(-0.06, 0.06, 0.42), False, False), (_sparkle_pts(0.34, -0.34, 0.13, 4), False, False)]
    if name == "lightning":
        pts = [(0.12, -0.5), (-0.24, 0.05), (0.03, 0.05), (-0.13, 0.5), (0.27, -0.1), (0.0, -0.1), (0.12, -0.5)]
        pts.append((0.12 - 0.36 * 0.15, -0.5 + 0.55 * 0.15))
        return [(pts, False, False)]
    if name == "crown":
        body = [(-0.42, 0.26), (-0.48, -0.2), (-0.21, 0.02), (0.0, -0.34), (0.21, 0.02), (0.48, -0.2), (0.42, 0.26),
                (-0.42, 0.26), (-0.36, 0.26)]
        return [(body, False, False), ([(-0.44, 0.38), (0.44, 0.38)], False, False),
                _dot(-0.49, -0.29, 0.03), _dot(0.0, -0.44, 0.03), _dot(0.49, -0.29, 0.03)]
    if name == "question":
        curve = [(-0.24, -0.2), (-0.17, -0.37), (0.0, -0.46), (0.2, -0.39), (0.24, -0.2), (0.12, -0.06), (0.0, 0.05),
                 (0.0, 0.18)]
        return [(curve, True, False), _dot(0.0, 0.4, 0.035)]
    if name == "exclamation":
        return [([(0.02, -0.48), (0.0, -0.12), (-0.01, 0.18)], True, False), _dot(0.0, 0.4, 0.035)]
    if name == "smile":
        return [(_loop(0.46, 0.46, rng.uniform(-2.2, -1.9), 1.06, grow=0.03), True, False),
                ([(-0.16, -0.17), (-0.16, -0.05)], False, False), ([(0.16, -0.17), (0.16, -0.05)], False, False),
                ([(-0.25, 0.08), (-0.13, 0.2), (0.0, 0.245), (0.13, 0.2), (0.25, 0.08)], True, False)]
    if name == "clapper":
        body = [(-0.45, -0.06), (0.45, -0.06), (0.45, 0.42), (-0.45, 0.42), (-0.45, -0.06), (-0.38, -0.06)]
        band = [(-0.45, 0.1), (0.45, 0.1)]
        strokes = [(body, False, False), (band, False, False)]
        for k in range(4):
            x0 = -0.36 + k * 0.23
            strokes.append(([(x0, -0.06), (x0 + 0.1, 0.1)], False, False))
        hx, hy = -0.45, -0.12
        bar = [(0, 0), (0.9, 0), (0.9, -0.16), (0, -0.16), (0, 0)]
        rb = [(hx + _rot(px, py, -14)[0], hy + _rot(px, py, -14)[1]) for px, py in bar]
        strokes.append((rb, False, False))
        for k in range(3):
            p0, p1 = _rot(0.14 + k * 0.25, 0, -14), _rot(0.24 + k * 0.25, -0.16, -14)
            strokes.append(([(hx + p0[0], hy + p0[1]), (hx + p1[0], hy + p1[1])], False, False))
        return strokes
    if name == "scribble":
        pts = []
        n, loops = 90, 4.5
        amp = rng.uniform(0.85, 1.1)
        for i in range(n + 1):
            t = i / n
            ph = 2 * math.pi * loops * t
            pts.append((-0.42 + 0.84 * t - 0.1 * math.sin(ph), 0.17 * amp * math.cos(ph) * (0.85 + 0.25 * math.sin(t * 5))))
        return [(pts, False, False)]
    if name == "burst":
        lines = []
        for i in range(10):
            ang = i * 2 * math.pi / 10 + rng.uniform(-0.12, 0.12)
            r0, r1 = 0.22 + rng.uniform(-0.03, 0.03), 0.5 * rng.uniform(0.78, 1.0)
            lines.append(([(r0 * math.cos(ang), r0 * math.sin(ang)), (r1 * math.cos(ang), r1 * math.sin(ang))], False, False))
        return lines
    return _shape_defs("star", rng)


DOODLE_SHAPES = ["star", "heart", "arrow", "circle", "underline", "sparkle", "lightning", "crown", "question",
                 "exclamation", "smile", "clapper", "scribble", "burst"]


def _scale_defs(defs, size):
    return [([(x * size, y * size) for x, y in pts], sm, cl) for pts, sm, cl in defs]


def ev_doodle(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    raw = e.get("shapes")
    multi = isinstance(raw, (list, tuple)) and len(raw) > 0
    specs = list(raw)[:8] if multi else [e.get("shape", "star")]
    slots = [(0.78, 0.17), (0.21, 0.2), (0.84, 0.4), (0.16, 0.42), (0.5, 0.085), (0.76, 0.6), (0.24, 0.6), (0.5, 0.66)]
    if ctx.W > ctx.H:
        slots = [(0.72, 0.2), (0.28, 0.22), (0.82, 0.55), (0.18, 0.55), (0.5, 0.12), (0.7, 0.82), (0.3, 0.82), (0.5, 0.88)]
    stagger = _num(e.get("stagger"), 0.18, 0, 2)
    base = {k: e[k] for k in ("color", "size", "stroke", "anim", "boil", "shadow", "draw", "glow") if k in e}
    rng = _rng(e, "doodle")
    sounds = 0
    for i, sp in enumerate(specs):
        if multi:
            d = dict(base, **sp) if isinstance(sp, dict) else dict(base, shape=sp)
            dx, dy = slots[i % len(slots)]
        else:
            d = e
            dx, dy = (0.76, 0.2) if ctx.H > ctx.W else (0.7, 0.22)
        shape = str(d.get("shape", "star")).strip().lower()
        if shape not in DOODLE_SHAPES:
            shape = "star"
        size = _size(d, 170, 30, 900) * u
        x = _fx(ctx, d.get("x"), dx)
        y = _fy(ctx, d.get("y"), dy)
        x = min(max(x, ctx.safe_left + size * 0.45), ctx.safe_right - size * 0.45)
        y = ctx.clamp_y(y, size * 0.9)
        rot = _num(d.get("rotate"), rng.uniform(-8, 8), -360, 360)
        color = _color(ctx, d.get("color"), WHITE)
        width = _num(d.get("stroke"), max(5.0, min(14.0, size / u * 0.052)), 1, 60) * u
        anim = "pop" if str(d.get("anim", "draw")).lower() == "pop" else "draw"
        t0 = a + i * stagger
        if t0 >= b - 0.2:
            break
        defs = _scale_defs(_shape_defs(shape, rng), size)
        boil = _num(d.get("boil"), 0.12, 0, 1) if d.get("boil", True) is not False else 0
        var = _variants(defs, rng, 3 if boil else 1, size * 0.011, max(3.0, 4.5 * u), size)
        draw = _num(d.get("draw"), 0.45 if shape not in ("scribble", "clapper", "smile", "burst") else 0.65, 0.1, 3)
        _strokes_fx(ctx, a, b, var, x, y, color, width, 16, t0=t0, draw=draw, anim=anim, rot=rot,
                    shadow=d.get("shadow", True) is not False, boil=boil, glow=bool(d.get("glow")))
        x0, y0, x1, y1 = _bbox(var[0], x, y, rot, width)
        ctx.register(t0, b, x0, y0, x1, y1)
        if sounds < 3:
            snd = "sparkle" if shape in ("star", "sparkle", "crown") else ("pop" if anim == "pop" else "swipe")
            _sfx(ctx, e, t0 + 0.02, snd, 0.32 if snd != "pop" else 0.45)
            sounds += 1
    return a, b


# --------------------------------------------------------------------------- arrow / circle highlight / frame

def _label_font(e, default="caveat"):
    return resolve_font(e.get("font") or default)


def ev_arrow(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    tx, ty = _pt(ctx, e.get("target", e.get("to")), 0.42, 0.42)
    if e.get("from") is not None or e.get("start") is not None:
        sx, sy = _pt(ctx, e.get("from", e.get("start")), 0.66, 0.56)
    elif e.get("x") is not None or e.get("y") is not None:
        sx, sy = _xy(ctx, e, 0.66, 0.56)
    else:
        sx = tx + (-0.26 if tx > ctx.W / 2 else 0.26) * min(ctx.W, ctx.H)
        sy = ty + (0.14 * ctx.H if ty < ctx.H * 0.6 else -0.14 * ctx.H)
    sx = min(max(sx, ctx.safe_left), ctx.safe_right)
    sy = min(max(sy, ctx.safe_top), ctx.safe_bottom)
    dx, dy = tx - sx, ty - sy
    L = math.hypot(dx, dy)
    if L < 60 * u:
        sx, sy = tx + 160 * u, ty + 160 * u
        dx, dy, L = tx - sx, ty - sy, math.hypot(tx - sx, ty - sy)
    ux_, uy_ = dx / L, dy / L
    gap = min(26 * u, L * 0.1)
    ex, ey = tx - ux_ * gap, ty - uy_ * gap
    bend = _num(e.get("bend"), 0.28, -1, 1)
    nx, ny = -uy_, ux_
    if bend >= 0 and ny > 0:  # bow upward by default (looks like a thrown arc)
        nx, ny = -nx, -ny
    mx, my = (sx + ex) / 2 + nx * bend * L * 0.5, (sy + ey) / 2 + ny * bend * L * 0.5

    def q(t):
        return ((1 - t) ** 2 * sx + 2 * (1 - t) * t * mx + t * t * ex, (1 - t) ** 2 * sy + 2 * (1 - t) * t * my + t * t * ey)
    shaft = [q(i / 14) for i in range(15)]
    px, py = q(0.93)
    tdx, tdy = ex - px, ey - py
    tl = math.hypot(tdx, tdy) or 1
    tdx, tdy = tdx / tl, tdy / tl
    hl = min(max(0.16 * L, 30 * u), 70 * u)
    w1 = _rot(-tdx, -tdy, 30)
    w2 = _rot(-tdx, -tdy, -30)
    head = [(ex + w1[0] * hl, ey + w1[1] * hl), (ex, ey), (ex + w2[0] * hl, ey + w2[1] * hl)]
    defs = [(shaft, True, False), (head, False, False)]
    rng = _rng(e, "arrow")
    width = _num(e.get("stroke"), 9, 1, 50) * u
    color = _color(ctx, e.get("color"), WHITE)
    boil = 0.12 if e.get("boil", True) is not False else 0
    var = _variants(defs, rng, 3 if boil else 1, 2.4 * u, max(3.0, 4.5 * u), 220 * u)
    label = e.get("text")
    t_draw = a + (0.12 if label else 0.0)
    _strokes_fx(ctx, a, b, var, 0, 0, color, width, 16, t0=t_draw, draw=_num(e.get("draw"), 0.5, 0.1, 3),
                anim="pop" if e.get("anim") == "pop" else "draw", boil=boil, shadow=e.get("shadow", True) is not False)
    x0, y0, x1, y1 = _bbox(var[0], 0, 0, 0, width)
    if label:
        font = _label_font(e)
        fs = _size(e, 72, 30, 200) * u
        lines, fs = ctx.wrap(_text(label, "", 48), font, fs, ctx.W * 0.5, max_lines=2, min_size=40 * u)
        tw = max(ctx.text_w(ln, font, fs) for ln in lines)
        lh = fs * 1.05
        th = lh * len(lines)
        vx, vy = sx - q(0.12)[0], sy - q(0.12)[1]
        vl = math.hypot(vx, vy) or 1
        vx, vy = vx / vl, vy / vl
        off = abs(vx) * tw / 2 + abs(vy) * th / 2 + 22 * u
        lx = ctx.clamp_x(sx + vx * off, tw + 10 * u)
        ly = ctx.clamp_y(sy + vy * off, th + 10 * u)
        st = ctx.style(font, fs, color, "#000000", 0, round(3 * u), back="#000000", back_alpha=0x70)
        dur = int((b - a) * 1000)
        ctx.draw_lines(a, b, st, lines, font, fs, lx, ly, lh,
                       lambda xx, yy, i: (f"\\an5\\pos({xx:.0f},{yy:.0f})\\frz4\\fscx70\\fscy70\\alpha&HFF&"
                                          f"\\t(0,90,\\alpha&H00&)\\t(0,180,\\fscx104\\fscy104)\\t(180,260,\\fscx100\\fscy100)"
                                          f"\\t({max(0, dur - 240)},{dur},\\alpha&HFF&)"),
                       color, ctx.accent, 17, register=True, clamp=True)
    ctx.register(a, b, x0, y0, x1, y1)
    _sfx(ctx, e, t_draw + 0.03, "swipe", 0.35)
    return a, b


def ev_circle_highlight(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    cx, cy, w, h = _target(ctx, e.get("target"), (0.5, 0.34, 0.56, 0.3))
    rng = _rng(e, "circle")
    rx, ry = w / 2 * 1.05, h / 2 * 1.07
    a0 = rng.uniform(-2.5, -2.1)
    s1 = []
    for i in range(41):
        th = a0 + 2 * math.pi * 1.07 * i / 40
        r = 1 + 0.035 * math.sin(2 * th + 0.7) + 0.05 * i / 40
        s1.append((rx * r * math.cos(th), ry * r * math.sin(th)))
    s2 = []
    a1 = a0 + 0.5
    for i in range(37):
        th = a1 + 2 * math.pi * 0.96 * i / 36
        r = 0.985 + 0.03 * math.sin(3 * th + 2.0)
        p = _rot(rx * 0.97 * r * math.cos(th), ry * 1.03 * r * math.sin(th), 3.5)
        s2.append(p)
    defs = [(s1, False, False), (s2, False, False)]
    width = _num(e.get("stroke"), 8, 1, 50) * u
    color = _color(ctx, e.get("color"), WHITE)
    boil = 0.12 if e.get("boil", True) is not False else 0
    var = _variants(defs, rng, 3 if boil else 1, 3.0 * u, max(3.0, 5 * u), 260 * u)
    _strokes_fx(ctx, a, b, var, cx, cy, color, width, 16, t0=a, draw=_num(e.get("draw"), 0.7, 0.1, 3), boil=boil,
                shadow=e.get("shadow", True) is not False, rot=_num(e.get("rotate"), 0, -90, 90))
    x0, y0, x1, y1 = _bbox(var[0], cx, cy, 0, width)
    ctx.register(a, b, x0, y0, x1, y1)
    _sfx(ctx, e, a + 0.02, "swipe", 0.3)
    return a, b


def ev_scribble_frame(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    rng = _rng(e, "frame")
    has_t = e.get("target") is not None
    if has_t:
        cx, cy, w, h = _target(ctx, e.get("target"), (0.5, 0.4, 0.6, 0.3))
        x0, y0, x1, y1 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    else:
        ins = _num(e.get("inset"), 0.045, 0.0, 0.3)
        m = ins * min(ctx.W, ctx.H)
        x0, y0, x1, y1 = m, m, ctx.W - m, ctx.H - m
    C = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

    def sides(jit, over):
        out = []
        for k in range(4):
            (px, py), (qx, qy) = C[k], C[(k + 1) % 4]
            L = math.hypot(qx - px, qy - py) or 1
            ux_, uy_ = (qx - px) / L, (qy - py) / L
            o1, o2 = over * rng.uniform(0.3, 1.2), over * rng.uniform(0.6, 1.5)
            pts = [(px - ux_ * o1 + rng.uniform(-jit, jit) * -uy_, py - uy_ * o1 + rng.uniform(-jit, jit) * ux_)]
            nmid = 3
            for j in range(1, nmid + 1):
                t = j / (nmid + 1)
                jj = rng.uniform(-jit, jit)
                pts.append((px + (qx - px) * t - uy_ * jj, py + (qy - py) * t + ux_ * jj))
            pts.append((qx + ux_ * o2 + rng.uniform(-jit, jit) * -uy_, qy + uy_ * o2 + rng.uniform(-jit, jit) * ux_))
            out.append((pts, True, False))
        return out
    color = _color(ctx, e.get("color"), WHITE)
    width = _num(e.get("stroke"), 7, 1, 40) * u
    boil = 0.12 if e.get("boil", True) is not False else 0
    draw = _num(e.get("draw"), 0.8, 0.1, 4)
    v1 = _variants(sides(7 * u, 22 * u), rng, 3 if boil else 1, 3 * u, max(4.0, 7 * u), 300 * u)
    _strokes_fx(ctx, a, b, v1, 0, 0, color, width, 16, t0=a, draw=draw, boil=boil,
                shadow=e.get("shadow", True) is not False)
    if e.get("double", True) is not False:
        v2 = _variants(sides(10 * u, 30 * u), rng, 3 if boil else 1, 3 * u, max(4.0, 7 * u), 300 * u)
        _strokes_fx(ctx, a, b, v2, 0, 0, color, width * 0.55, 16, t0=a + draw * 0.45, draw=draw * 0.9, boil=boil,
                    shadow=False, alpha=0x50)
    if has_t:
        ctx.register(a, b, x0 - width, y0 - width, x1 + width, y1 + width)
    _sfx(ctx, e, a + 0.02, "swipe", 0.3)
    return a, b



# --------------------------------------------------------------------------- notes wall

NOTE_ITEMS = ["Big news", "Wait… what?", "Game changer", "Everyone's talking", "No way!", "This changes everything",
              "Must watch", "100% real", "Mind blown"]


def _tape_path(w, h, rng):
    teeth = 3
    pts = [(-w / 2, -h / 2), (w / 2, -h / 2)]
    for k in range(1, teeth * 2):
        pts.append((w / 2 + (h * 0.13 if k % 2 else -h * 0.05) + rng.uniform(-1, 1), -h / 2 + h * k / (teeth * 2)))
    pts += [(w / 2, h / 2), (-w / 2, h / 2)]
    for k in range(teeth * 2 - 1, 0, -1):
        pts.append((-w / 2 - (h * 0.13 if k % 2 else -h * 0.05) + rng.uniform(-1, 1), -h / 2 + h * k / (teeth * 2)))
    return pts


def ev_notes_wall(ctx, e):
    a, b = ev_window(ctx, e, 3.5)
    u = ctx.u
    items = _items(e.get("items"), NOTE_ITEMS, 9, 40)
    n = int(_num(e.get("count"), max(5, len(items)), 1, 9))
    items = (items * 9)[:n]
    rng = _rng(e, "notes")
    portrait = ctx.H > ctx.W * 1.2
    if portrait:
        slots = [(0.17, 0.115), (0.84, 0.285), (0.83, 0.115), (0.16, 0.30), (0.5, 0.095), (0.85, 0.465), (0.15, 0.485),
                 (0.21, 0.65), (0.79, 0.655)]
        nw = 250 * u
    else:
        slots = [(0.11, 0.2), (0.89, 0.5), (0.89, 0.2), (0.11, 0.5), (0.11, 0.8), (0.89, 0.8), (0.27, 0.13), (0.73, 0.13),
                 (0.27, 0.87)]
        nw = 290 * u
    nw *= _num(e.get("scale"), 1.0, 0.5, 1.6)
    font = resolve_font(e.get("font") or "marker")
    ink = _color(ctx, e.get("text_color"), INK)
    paper = e.get("color") or e.get("fill")
    fills = [_color(ctx, paper, WHITE)] if paper else [WHITE, CREAM, "#FBF8F1", "#EFE9DC"]
    stag = min(0.16, max(0.06, (b - a) * 0.3 / max(1, n)))
    dur_ms_out = 220
    for i in range(n):
        sx, sy = slots[i % len(slots)]
        fs0 = 46 * u * nw / (250 * u)
        lines, fs = ctx.wrap(items[i], font, fs0, nw - 46 * u, max_lines=3, min_size=34 * u)
        lh = fs * 1.18
        nh = max(nw * 0.66, len(lines) * lh + 64 * u)
        cx = ctx.clamp_x(sx * ctx.W + rng.uniform(-10, 10) * u, nw * 1.06)
        cy = ctx.clamp_y(sy * ctx.H + rng.uniform(-8, 8) * u, nh * 1.08)
        r = rng.uniform(3.5, 8.0) * (1 if i % 2 else -1)
        r0 = r + (12 if r > 0 else -12)
        t0 = a + 0.05 + i * stag
        t1 = b - (n - 1 - i) * 0.04
        if t0 >= t1 - 0.3:
            continue
        ms = int((t1 - t0) * 1000)
        es = max(300, ms - dur_ms_out)
        anim = (f"\\frz{-r0:.1f}\\fscx20\\fscy20\\t(0,170,\\fscx107\\fscy107\\frz{-r:.1f})\\t(170,280,\\fscx100\\fscy100)"
                f"\\t({es},{ms},\\fscx90\\fscy90)\\fad(90,{dur_ms_out})")
        pos = f"\\an7\\pos({cx:.0f},{cy:.0f})"
        fill = fills[rng.randrange(len(fills))] if len(fills) > 1 else fills[0]
        _dr(ctx, t0, t1, rrect(nw, nh, 5 * u, -nw / 2 + 7 * u, -nh / 2 + 13 * u), pos + anim, 12, "#000000", 0xA6,
            blur=round(16 * u))
        _dr(ctx, t0, t1, rrect(nw, nh, 5 * u, -nw / 2, -nh / 2), pos + anim, 13, fill)
        # faint fold shading along the bottom edge
        _dr(ctx, t0, t1, rect(nw, nh * 0.22, -nw / 2, nh * 0.28), pos + anim, 13, "#000000", 0xF2, blur=round(10 * u))
        tw, th_ = nw * rng.uniform(0.34, 0.42), 34 * u
        tp = [_rot(px, py, rng.uniform(-6, 6)) for px, py in _tape_path(tw, th_, rng)]
        tp = [(px + rng.uniform(-14, 14) * u, py - nh / 2 + 2 * u) for px, py in tp]
        _dr(ctx, t0, t1, _poly_path(tp), pos + anim, 15, "#E7E1D3", 0x38)
        st = ctx.style(font, fs, ink, "#000000", 0, 0)
        body = "\\N".join(ctx.markup(ln, ink, ctx.accent) for ln in lines)
        ctx.add(t0, t1, st, "{" + f"\\an5\\pos({cx:.0f},{cy + ctx.cap_shift(font, fs) + 4 * u:.0f})\\org({cx:.0f},{cy:.0f})"
                f"\\q2" + anim + "}" + body, 14)
        ctx.register(t0, t1, cx - nw / 2, cy - nh / 2 - th_ / 2, cx + nw / 2, cy + nh / 2)
        if i < 9:
            _sfx(ctx, e, t0 + 0.02, "pop" if i % 2 == 0 else "bubble", 0.3)
    return a, b


# --------------------------------------------------------------------------- orbits

def _wrap180(v):
    return (v + 180.0) % 360.0 - 180.0


def ev_orbit_text(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    mn = min(ctx.W, ctx.H)
    cx, cy = _xy(ctx, e, 0.5, 0.30)
    R = _num(e.get("radius"), 0.36)
    R = R * mn if R <= 2 else R
    R = max(80 * u, min(R, 0.95 * mn))
    tilt = math.radians(_num(e.get("tilt"), 15, 3, 80))
    ry = R * math.sin(tilt)
    roll = _num(e.get("roll"), -6, -60, 60)
    speed = _num(e.get("speed"), 0.28, -3, 3)
    text = _text(e.get("text"), "WATCH THIS", 40)
    if e.get("uppercase", True) is not False:
        text = text.upper()
    sep = e.get("separator")
    sep = " • " if sep is None else str(sep)[:6]
    unit = text if text.endswith((" ", "•")) else text + sep
    font = resolve_font(e.get("font") or ctx.fkey("title"))
    fs = _size(e, 62, 24, 200) * u
    C = 2 * math.pi * R
    nonsp = max(1, len(unit.replace(" ", "")))
    uw = max(1.0, ctx.text_w(unit, font, fs))
    k = max(1, int(round(C / uw)))
    k = min(k, max(1, 44 // nonsp))
    fs *= min(1.6, max(0.5, C * 0.96 / (k * uw)))
    chars = list(unit * k)
    widths = [max(ctx.text_w(ch, font, fs), fs * 0.28) for ch in chars]
    total = sum(widths)
    cum, phi = 0.0, []
    for w in widths:
        phi.append(-(cum + w / 2) / total * 2 * math.pi)
        cum += w
    th0 = math.pi / 2 + (ctx.text_w(text, font, fs) / 2) / total * 2 * math.pi
    om = 2 * math.pi * speed
    color = _color(ctx, e.get("color"), WHITE)
    st = ctx.style(font, fs, color, "#000000", 0, round(3 * u), back="#000000", back_alpha=0x88)
    shift = ctx.cap_shift(font, fs)
    wrap = bool(e.get("wrap"))
    idx = [j for j, ch in enumerate(chars) if ch.strip()]
    nf = max(1, int((b - a) * FPS))
    step = max(2, int(math.ceil(len(idx) * nf / 2600.0)))
    fin, fout = min(0.45, (b - a) * 0.3), min(0.4, (b - a) * 0.3)

    def state(j, t):
        ein = _eo((t - a) / fin) if fin > 0 else 1
        env = min(ein, _eo((b - t) / fout) if fout > 0 else 1)
        rr = 0.8 + 0.2 * ein
        th = th0 + phi[j] + om * (t - a) + (1 - ein) * 0.6
        ex, ey = R * rr * math.cos(th), ry * rr * math.sin(th)
        x, y = _rot(ex, ey, roll)
        d = math.sin(th)
        s = 100 * (0.6 + 0.4 * (d + 1) / 2)
        al = 0xC4 * ((1 - d) / 2) ** 1.2
        al = 255 - (255 - al) * env
        fry = _wrap180(math.degrees(th) - 90)
        return cx + x, cy + y + shift * s / 100, s, al, fry, d

    for j in idx:
        k0 = 0
        while k0 < nf:
            k1 = min(nf, k0 + step)
            t1, t2 = a + k0 * DT, (a + k1 * DT if k1 < nf else b)
            x1, y1, s1, al1, f1, d1 = state(j, t1)
            x2, y2, s2, al2, f2, d2 = state(j, t2)
            f2 = f1 + _wrap180(f2 - f1)
            dm = (d1 + d2) / 2
            tag = (f"\\an5\\move({x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f})\\frz{-roll:.1f}\\fry{f1:.1f}\\fscx{s1:.0f}\\fscy{s1:.0f}"
                   f"\\alpha{_al(al1)}\\t(\\fry{f2:.1f}\\fscx{s2:.0f}\\fscy{s2:.0f}\\alpha{_al(al2)})")
            ctx.add(t1, t2, st, "{" + tag + "}" + esc(chars[j]), 17 if dm > 0 else 13,
                    behind=(dm < 0) if wrap else None)
            k0 = k1
    ctx.register(a, b, cx - R, cy - ry - fs, cx + R, cy + ry + fs)
    _sfx(ctx, e, a, "whoosh", 0.35)
    return a, b


def ev_orbit_cards(ctx, e):
    a, b = ev_window(ctx, e, 3.5)
    u = ctx.u
    mn = min(ctx.W, ctx.H)
    items = _items(e.get("items"), ["Captions", "B-roll", "Sound FX", "Zoom", "Color grade"], 6, 18)
    n = len(items)
    cx, cy = _xy(ctx, e, 0.5, 0.30)
    R = _num(e.get("radius"), 0.38)
    R = R * mn if R <= 2 else R
    R = max(100 * u, min(R, 0.95 * mn))
    ry = R * math.sin(math.radians(_num(e.get("tilt"), 16, 3, 80)))
    roll = _num(e.get("roll"), -5, -60, 60)
    speed = _num(e.get("speed"), 0.16, -2, 2)
    dark = str(e.get("theme", "light")).lower() == "dark"
    fill = _color(ctx, e.get("fill"), "#202022" if dark else WHITE)
    ink = _color(ctx, e.get("color"), "#F4F3EF" if dark else INK)
    dotc = _color(ctx, e.get("accent"), ctx.accent)
    font = resolve_font(e.get("font") or ctx.fkey("body"))
    fs = _size(e, 46, 24, 110) * u
    pad, dot = 28 * u, 15 * u
    h = fs * 1.95
    st = ctx.style(font, fs, ink, "#000000", 0, 0)
    shift = ctx.cap_shift(font, fs)
    cards = []
    for it in items:
        tw = ctx.text_w(it, font, fs)
        w = tw + 2 * pad + dot + 14 * u
        cards.append((it, w, rrect(w, h, h * 0.3, -w / 2, -h / 2), ellipse(dot / 2, dot / 2, -w / 2 + pad + dot / 2, 0)))
    om = 2 * math.pi * speed
    nf = max(1, int((b - a) * FPS))
    step = max(2, int(math.ceil(n * 4 * nf / 2600.0)))

    def state(i, t):
        ein = _eo((t - a - i * 0.07) / 0.45)
        env = min(ein, _eo((b - t) / 0.35))
        th = math.pi / 2 + 2 * math.pi * i / n + om * (t - a) + (1 - ein) * 0.5
        rr = 0.75 + 0.25 * ein
        x, y = _rot(R * rr * math.cos(th), ry * rr * math.sin(th), roll)
        d = math.sin(th)
        s = (0.62 + 0.38 * (d + 1) / 2) * (0.4 + 0.6 * ein) * 100
        al = 255 - (255 - 0x90 * ((1 - d) / 2) ** 1.3) * env
        return cx + x, cy + y, s, al, d

    k0 = 0
    while k0 < nf:
        k1 = min(nf, k0 + step)
        t1, t2 = a + k0 * DT, (a + k1 * DT if k1 < nf else b)
        S = [(state(i, t1), state(i, t2)) for i in range(n)]
        order = sorted(range(n), key=lambda i: S[i][0][4] + S[i][1][4])
        for rank, i in enumerate(order):
            (x1, y1, s1, al1, d1), (x2, y2, s2, al2, d2) = S[i]
            it, w, path, dpath = cards[i]
            L = 12 + 4 * rank
            bl = round(2.2 * u * (1 - (d1 + 1) / 2), 1)
            sc = f"\\fscx{s1:.0f}\\fscy{s1:.0f}"
            sc2 = f"\\fscx{s2:.0f}\\fscy{s2:.0f}"
            sh1, sh2 = 0xA0 + (0xFF - 0xA0) * al1 / 255, 0xA0 + (0xFF - 0xA0) * al2 / 255
            _dr(ctx, t1, t2, path, f"\\an7\\move({x1:.0f},{y1 + 10 * u * s1 / 100:.0f},{x2:.0f},{y2 + 10 * u * s2 / 100:.0f})"
                + sc + f"\\alpha{_al(sh1)}\\t({sc2}\\alpha{_al(sh2)})", L, "#000000", sh1, blur=round(14 * u))
            mv = f"\\an7\\move({x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f})"
            _dr(ctx, t1, t2, path, mv + sc + f"\\alpha{_al(al1)}\\t({sc2}\\alpha{_al(al2)})", L + 1, fill, al1, blur=bl)
            _dr(ctx, t1, t2, dpath, mv + sc + f"\\alpha{_al(al1)}\\t({sc2}\\alpha{_al(al2)})", L + 2, dotc, al1)
            ox = (dot + 14 * u) / 2
            ctx.add(t1, t2, st, "{" + f"\\an5\\move({x1 + ox * s1 / 100:.0f},{y1 + shift * s1 / 100:.0f},{x2 + ox * s2 / 100:.0f},"
                    f"{y2 + shift * s2 / 100:.0f}){sc}\\alpha{_al(al1)}" + (f"\\blur{bl}" if bl else "") +
                    f"\\t({sc2}\\alpha{_al(al2)})" + "}" + esc(it), L + 3)
        k0 = k1
    maxw = max(c[1] for c in cards)
    ctx.register(a, b, cx - R - maxw / 2, cy - ry - h, cx + R + maxw / 2, cy + ry + h)
    _sfx(ctx, e, a, "whoosh", 0.3)
    _sfx(ctx, e, a + 0.1, "pop", 0.3)
    return a, b


# --------------------------------------------------------------------------- head stack / chip roll

def ev_head_stack(ctx, e):
    items = _items(e.get("items"), ["Clone row", "Blade slice", "Ripple delete", "Auto captions"], 6, 24)
    n = len(items)
    a, b = ev_window(ctx, e, max(2.8, 0.5 * n + 1.5))
    u = ctx.u
    x, y = _xy(ctx, e, 0.5, 0.22)
    font = resolve_font(e.get("font") or "space-mono")
    fs = _size(e, 50, 24, 110) * u
    h, gap, pad = fs * 1.75, 10 * u, 28 * u
    avail = y - ctx.safe_top
    if n * (h + gap) > avail and avail > 0:
        sc = max(0.62, avail / (n * (h + gap)))
        fs, h, gap, pad = fs * sc, h * sc, gap * sc, pad * sc
    if n * (h + gap) > y - ctx.safe_top:
        y = min(ctx.safe_bottom, ctx.safe_top + n * (h + gap))
    dark = str(e.get("theme", "light")).lower() == "dark"
    fill = _color(ctx, e.get("fill"), "#1E1E20" if dark else WHITE)
    ink = _color(ctx, e.get("color"), "#F4F3EF" if dark else INK)
    dotc = _color(ctx, e.get("accent"), ctx.accent)
    st = ctx.style(font, fs, ink, "#000000", 0, 0)
    shift = ctx.cap_shift(font, fs)
    rng = _rng(e, "stack")
    interval = max(0.2, min(0.5, (b - a - 1.1) / max(1, n)))
    t_exit = b - 0.42
    fall = 0.3
    nfall = max(3, int(round(fall * FPS)))
    x0s, x1s, ytop = [], [], y
    for i, it in enumerate(items):
        t_i = a + 0.05 + i * interval
        if t_i + fall >= t_exit - 0.1:
            break
        lines, fs_i = ctx.wrap(it, font, fs, ctx.W * 0.8 - 2 * pad, max_lines=1)
        txt = lines[0] if lines else it
        tw = ctx.text_w(txt, font, fs_i)
        dot = 11 * u * fs / (42 * u)
        w = tw + 2 * pad + dot + 12 * u
        cxi = ctx.clamp_x(x + rng.uniform(-16, 16) * u, w + 20 * u)
        yc = y - i * (h + gap) - h / 2
        ytop = yc - h / 2
        rot = rng.uniform(-5.5, 5.5)
        path = rrect(w, h, h * 0.26, -w / 2, -h / 2)
        dpath = ellipse(dot / 2, dot / 2, -w / 2 + pad + dot / 2, 0)
        ox = (dot + 12 * u) / 2
        x0s.append(cxi - w / 2)
        x1s.append(cxi + w / 2)
        stx = st if fs_i == fs else ctx.style(font, fs_i, ink, "#000000", 0, 0)

        def chip(t1, t2, yy1, yy2, extra, rz):
            mv = f"\\an7\\move({cxi:.0f},{yy1:.0f},{cxi:.0f},{yy2:.0f})\\frz{-rz:.1f}"
            _dr(ctx, t1, t2, path, f"\\an7\\move({cxi + 3 * u:.0f},{yy1 + 9 * u:.0f},{cxi + 3 * u:.0f},{yy2 + 9 * u:.0f})"
                f"\\frz{-rz:.1f}" + extra, 12 + 3 * i, "#000000", 0xA8, blur=round(12 * u))
            _dr(ctx, t1, t2, path, mv + extra, 13 + 3 * i, fill)
            _dr(ctx, t1, t2, dpath, mv + extra, 14 + 3 * i, dotc)
            ctx.add(t1, t2, stx, "{" + f"\\an5\\move({cxi + ox:.0f},{yy1 + shift:.0f},{cxi + ox:.0f},{yy2 + shift:.0f})"
                    f"\\org({cxi:.0f},{(yy1 + yy2) / 2:.0f})\\frz{-rz:.1f}" + extra + "}" + esc(txt), 14 + 3 * i)
        ystart = -h - 30 * u
        for k in range(nfall):
            p1, p2 = (k / nfall) ** 2, ((k + 1) / nfall) ** 2
            tk = t_i + k * DT
            chip(tk, tk + DT, ystart + (yc - ystart) * p1, ystart + (yc - ystart) * p2, "", rot)
        tl = t_i + nfall * DT
        te = t_exit + (n - 1 - i) * 0.04
        chip(tl, te, yc, yc, "\\fscx112\\fscy82\\t(0,80,\\fscx96\\fscy106)\\t(80,190,\\fscx100\\fscy100)", rot)
        od = int((b - te) * 1000)
        chip(te, b, yc, yc - 46 * u, f"\\fad(0,{max(60, od - 20)})", rot)
        _sfx(ctx, e, tl - 0.01, "pop" if i % 2 == 0 else "click", 0.38)
    if x0s:
        ctx.register(a, b, min(x0s), ytop, max(x1s), y)
    return a, b


def ev_chip_roll(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    items = _items(e.get("items"), ["Premiere", "CapCut", "After Effects", "DaVinci", "Claude"], 12, 24)
    final = _text(e.get("final"), items[-1], 24)
    font = resolve_font(e.get("font") or ctx.fkey("title"))
    fs = _size(e, 72, 30, 180) * u
    words = items + [final]
    prefix = _text(e.get("prefix"), "", 30)
    maxw = max(ctx.text_w(w, font, fs) for w in words)
    pre_w = ctx.text_w(prefix, font, fs) if prefix else 0
    lim = ctx.W * 0.86 - (pre_w + 30 * u if prefix else 0)
    if maxw > lim * 0.8:
        k = max(0.4, lim * 0.8 / maxw)
        fs, maxw, pre_w = fs * k, maxw * k, pre_w * k
    padx = fs * 0.62
    h = fs * 1.62
    pw = maxw + 2 * padx
    gap = 24 * u if prefix else 0
    tot = pre_w + gap + pw
    x, y = _xy(ctx, e, 0.5, 0.2)
    x = ctx.clamp_x(x, tot)
    y = ctx.clamp_y(y, h + 20 * u)
    pcx = x - tot / 2 + pre_w + gap + pw / 2
    fill = _color(ctx, e.get("fill"), WHITE)
    ink = _color(ctx, e.get("color"), INK)
    st = ctx.style(font, fs, ink, "#000000", 0, 0)
    shift = ctx.cap_shift(font, fs)
    rng = _rng(e, "roll")
    n = len(items)
    L = max(n + 1, int(_num(e.get("spins"), 11, 3, 40)))
    start = rng.randrange(n)
    seq = [items[(i + start) % n] for i in range(L - 1)] + [final]
    rh = h * 0.92
    tr0 = a + 0.28
    rd = _num(e.get("roll"), min(1.7, (b - a) * 0.55), 0.3, 8)
    rd = min(rd, max(0.3, b - tr0 - 0.3))
    t_land = tr0 + rd
    land_ms = int((t_land - a) * 1000)
    total = (L - 1) * rh

    def off(t):
        p = (t - tr0) / rd
        if p <= 0:
            return 0.0
        if p >= 1:
            return total
        return total * (1 - (1 - p) ** 3.2) + total * 0.012 * math.sin(p * math.pi) * (p > 0.6)
    dur = int((b - a) * 1000)
    pulse = f"\\t({land_ms},{land_ms + 90},\\fscx106\\fscy106)\\t({land_ms + 90},{land_ms + 220},\\fscx100\\fscy100)"
    pop = "\\fscx30\\fscy30\\t(0,160,\\fscx108\\fscy108)\\t(160,260,\\fscx100\\fscy100)"
    ppos = f"\\an7\\pos({pcx:.0f},{y:.0f})"
    path = rrect(pw, h, h / 2, -pw / 2, -h / 2)
    _dr(ctx, a, b, rrect(pw, h, h / 2, -pw / 2, -h / 2 + 12 * u), ppos + pop + pulse + "\\fad(0,250)", 12, "#000000", 0xA0,
        blur=round(18 * u))
    _dr(ctx, a, b, path, ppos + pop + pulse + "\\fad(0,250)", 13, fill)
    # inner top/bottom shading = depth of a drum
    for sgn in (-1, 1):
        _dr(ctx, a, b, rect(pw * 0.8, h * 0.16, -pw * 0.4, sgn * h * 0.5 - (h * 0.16 if sgn > 0 else 0)),
            ppos + pop + "\\fad(0,250)" + f"\\clip({pcx - pw / 2:.0f},{y - h / 2:.0f},{pcx + pw / 2:.0f},{y + h / 2:.0f})",
            15, "#000000", 0xD8, blur=round(8 * u))
    if prefix:
        pst = ctx.style(font, fs, _color(ctx, e.get("prefix_color"), WHITE), "#000000", 0, round(4 * u), back="#000000",
                        back_alpha=0x70)
        ctx.add(a, b, pst, "{" + f"\\an4\\pos({x - tot / 2:.0f},{y + shift:.0f})\\alpha&HFF&\\t(0,200,\\alpha&H00&)"
                f"\\fad(0,250)" + "}" + ctx.markup(prefix, WHITE, ctx.accent), 14)
    clip = f"\\clip({pcx - pw / 2 + 4 * u:.0f},{y - h / 2 + 3 * u:.0f},{pcx + pw / 2 - 4 * u:.0f},{y + h / 2 - 3 * u:.0f})"
    # first word sits still with the pill pop
    if tr0 > a:
        ctx.add(a, tr0, st, "{" + f"\\an5\\pos({pcx:.0f},{y + shift:.0f})" + clip + pop + "}" + esc(seq[0]), 14)
    t = tr0
    last_row, ticks, last_tick = 0, 0, -1.0
    while t < t_land - 1e-4:
        t2 = min(t_land, t + DT)
        o, o2 = off(t), off(t2)
        v = abs(o2 - o) / max(1e-3, t2 - t) / rh
        bl = min(6.0, v * 0.22) * u
        sy = 100 + min(22, v * 0.9)
        for j in range(max(0, int(o / rh) - 1), min(L, int(o / rh) + 3)):
            dy = j * rh - o
            if abs(dy) > rh * 1.05:
                continue
            al = min(255, abs(dy) / rh * 330)
            ctx.add(t, t2, st, "{" + f"\\an5\\pos({pcx:.0f},{y + dy + shift:.0f})\\alpha{_al(al)}\\fscy{sy:.0f}"
                    + (f"\\blur{bl:.1f}" if bl > 0.3 else "") + clip + "}" + esc(seq[j]), 14)
        row = int((o + rh / 2) / rh)
        if row != last_row and ticks < 14 and t - last_tick > 0.065:
            _sfx(ctx, e, t, "tick", 0.22)
            ticks += 1
            last_tick = t
        last_row = row
        t = t2
    ctx.add(t_land, b, st, "{" + f"\\an5\\pos({pcx:.0f},{y + shift:.0f})" + clip +
            "\\t(0,90,\\fscx108\\fscy108)\\t(90,220,\\fscx100\\fscy100)" + f"\\fad(0,{min(250, int((b - t_land) * 500))})" + "}"
            + esc(final), 14)
    ctx.register(a, b, x - tot / 2, y - h / 2, x + tot / 2, y + h / 2)
    _sfx(ctx, e, t_land, "pop", 0.5)
    _ = dur
    return a, b


# --------------------------------------------------------------------------- energy: speed lines, shockwave, confetti, sparkles

def ev_speed_lines(ctx, e):
    a, b = ev_window(ctx, e, 1.2)
    u = ctx.u
    W, H = ctx.W, ctx.H
    cx, cy = _xy(ctx, e, 0.5, 0.42)
    col = _color(ctx, e.get("color"), WHITE)
    base_al = _num(e.get("alpha"), 0x28 if col.upper() != "#000000" else 0x10, 0, 240)
    n = int(_num(e.get("count"), 72, 12, 180))
    k = _num(e.get("radius"), 1.0, 0.2, 3)
    rx, ry = 0.30 * W * k, 0.24 * H * k
    Rout = max(math.hypot(cx - px, cy - py) for px in (0, W) for py in (0, H)) + 60 * u
    rng = _rng(e, "speed")
    t = a
    fin, fout = min(0.12, (b - a) / 4), min(0.18, (b - a) / 4)
    while t < b - 1e-3:
        t2 = min(b, t + 2 * DT)
        parts = []
        for m in range(n):
            th = (m + rng.uniform(-0.45, 0.45)) * 2 * math.pi / n
            ct, sn = math.cos(th), math.sin(th)
            cr = 1 / math.sqrt((ct / rx) ** 2 + (sn / ry) ** 2)
            rt = cr * rng.uniform(1.0, 1.75)
            hw = rng.uniform(2.5, 20) * u
            bx, by = cx + ct * Rout, cy + sn * Rout
            parts.append(polygon([(cx + ct * rt, cy + sn * rt), (bx - sn * hw, by + ct * hw), (bx + sn * hw, by - ct * hw)]))
        env = min(1.0, (t2 - a) / fin if fin else 1, (b - t) / fout if fout else 1)
        _dr(ctx, t, t2, " ".join(parts), "\\an7\\pos(0,0)", 22, col, 255 - (255 - base_al) * max(0, env), blur=round(0.8 * u, 1))
        t = t2
    _sfx(ctx, e, a, "whoosh-fast", 0.4)
    return a, b


def ev_shockwave(ctx, e):
    a, b = ev_window(ctx, e, 0.9)
    u = ctx.u
    cx, cy = _xy(ctx, e, 0.5, 0.42)
    col = _color(ctx, e.get("color"), WHITE)
    Rmax = _num(e.get("radius"), 0.5)
    Rmax = Rmax * math.hypot(ctx.W, ctx.H) if Rmax <= 2 else Rmax
    rings = int(_num(e.get("rings"), 3, 1, 5))
    life = max(0.3, min(b - a, 0.85))
    for k in range(rings):
        t0 = a + k * 0.09
        if t0 >= b - 0.1:
            break
        t1 = min(b, t0 + life)
        ms = int((t1 - t0) * 1000)
        R = Rmax * (1 - 0.2 * k)
        w0 = max(3.0, 20 - 6 * k) * u
        tag = (f"\\an7\\pos({cx:.0f},{cy:.0f})\\fscx4\\fscy4\\3a&H00&"
               f"\\t(0,{ms},0.45,\\fscx100\\fscy100\\bord{1.2 * u:.1f}\\blur{14 * u:.0f}\\3a&HFF&)")
        _dr(ctx, t0, t1, ellipse(R, R), tag, 22, col, 255, bord=w0, ocolor=col, blur=round(2 * u, 1))
    # core glow + flash
    _dr(ctx, a, min(b, a + 0.45), ellipse(110 * u, 110 * u),
        f"\\an7\\pos({cx:.0f},{cy:.0f})\\fscx20\\fscy20\\t(0,130,\\fscx130\\fscy130)\\fad(0,300)", 21, col, 0x40,
        blur=round(36 * u))
    if e.get("flash", True) is not False:
        _dr(ctx, a, min(b, a + 0.28), rect(ctx.W, ctx.H), "\\an7\\pos(0,0)\\fad(0,230)", 23, col,
            _num(e.get("flash_alpha"), 0x90, 0, 255))
    rng = _rng(e, "shock")
    for i in range(int(_num(e.get("debris"), 14, 0, 40))):
        ang = rng.uniform(0, 2 * math.pi)
        dist = Rmax * rng.uniform(0.18, 0.42)
        rr = rng.uniform(4, 10) * u
        t1 = min(b, a + rng.uniform(0.35, 0.6))
        ms = int((t1 - a) * 1000)
        _dr(ctx, a, t1, ellipse(rr, rr), f"\\an7\\move({cx:.0f},{cy:.0f},{cx + math.cos(ang) * dist:.0f},"
            f"{cy + math.sin(ang) * dist:.0f},0,{ms})\\t(0,{ms},\\fscx20\\fscy20)\\fad(0,{int(ms * 0.6)})", 22, col, 0x10)
    _sfx(ctx, e, a, "impact", 0.5)
    return a, b


def ev_confetti(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    W, H = ctx.W, ctx.H
    mode = "burst" if str(e.get("mode", "rain")).lower() in ("burst", "cannon", "pop") else "rain"
    n = int(_num(e.get("count"), 70 if mode == "rain" else 60, 8, 160))
    cols = e.get("colors")
    if isinstance(cols, (list, tuple)) and cols:
        palette = [_color(ctx, c, WHITE) for c in list(cols)[:8]]
    else:
        acc = _color(ctx, e.get("accent"), ctx.accent)
        palette = [WHITE, WHITE, CREAM, "#D9D4C9", "#A6A6AA", "#2B2B2E", acc, acc]
    scale = _num(e.get("scale"), 1.0, 0.3, 3)
    rng = _rng(e, "confetti")
    ox, oy = _xy(ctx, e, 0.5, 0.62)
    seg = 4 * DT
    fade_s = min(0.45, (b - a) * 0.25)
    for i in range(n):
        kind = rng.choice(("rect", "rect", "strip", "circle", "square", "tri"))
        s = rng.uniform(1.1, 1.9) * u * scale
        path = {"rect": rect(22 * s, 12 * s, -11 * s, -6 * s), "strip": rect(32 * s, 7 * s, -16 * s, -3.5 * s),
                "circle": ellipse(7 * s, 7 * s), "square": rect(14 * s, 14 * s, -7 * s, -7 * s),
                "tri": polygon([(0, -9 * s), (9 * s, 7 * s), (-9 * s, 7 * s)])}[kind]
        color = rng.choice(palette)
        rz, wz = rng.uniform(0, 360), rng.uniform(150, 520) * rng.choice((-1, 1))
        rx, wx = rng.uniform(0, 360), rng.uniform(250, 800) * rng.choice((-1, 1))
        amp, fq, ph = rng.uniform(15, 60) * u, rng.uniform(0.45, 1.0), rng.uniform(0, 6.28)
        if mode == "rain":
            ts = a + rng.uniform(0, min(0.9, (b - a) * 0.4))
            x, y = rng.uniform(-0.03, 1.03) * W, -rng.uniform(0.02, 0.3) * H
            vx, vy = rng.uniform(-50, 50) * u, rng.uniform(300, 600) * u
            g, vt, drag = 1100 * u, rng.uniform(420, 760) * u, 0.0
        else:
            ts = a + rng.uniform(0, 0.08)
            x, y = ox + rng.uniform(-15, 15) * u, oy
            ang = math.radians(rng.uniform(-158, -22))
            sp = rng.uniform(1200, 2700) * u
            vx, vy = sp * math.cos(ang), sp * math.sin(ang)
            g, vt, drag = 2300 * u, rng.uniform(380, 700) * u, 2.4
        tl, sub = 0.0, 1.0 / 120
        pts = []
        while True:
            sway = amp * math.sin(2 * math.pi * fq * tl + ph) * (1 if mode == "rain" else min(1.0, tl / 0.6))
            pts.append((ts + tl, x + sway, y, rz + wz * tl, rx + wx * tl))
            if ts + tl >= b or y > H + 60 * u or len(pts) > 400:
                break
            for _ in range(int(round(seg / sub))):
                if drag:
                    dmp = math.exp(-drag * sub)
                    vx *= dmp
                    vy *= dmp if vy < 0 else 1
                vy = min(vt, vy + g * sub)
                x += vx * sub
                y += vy * sub
            tl += seg
        for j in range(len(pts) - 1):
            t1, x1, y1, z1, r1 = pts[j]
            t2, x2, y2, z2, r2 = pts[j + 1]
            t2 = min(t2, b)
            if t2 <= t1 or t1 < a:
                continue
            a1 = 255 * (1 - min(1.0, max(0.0, (b - t1) / fade_s)))
            a2 = 255 * (1 - min(1.0, max(0.0, (b - t2) / fade_s)))
            fade = f"\\alpha{_al(a1)}\\t(\\frz{-z2:.0f}\\frx{r2:.0f}\\alpha{_al(a2)})" if a2 > 0 else \
                f"\\t(\\frz{-z2:.0f}\\frx{r2:.0f})"
            _dr(ctx, t1, t2, path, f"\\an7\\move({x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f})\\frz{-z1:.0f}\\frx{r1:.0f}" + fade,
                18, color, a1 if a2 > 0 else 0)
    _sfx(ctx, e, a, "pop", 0.5)
    _sfx(ctx, e, a + 0.05, "sparkle", 0.3)
    return a, b


def _sparkle_path(r):
    k = 0.11 * r
    f = _f
    return (f"m 0 {f(-r)} b {f(k)} {f(-k)} {f(k)} {f(-k)} {f(r)} 0 b {f(k)} {f(k)} {f(k)} {f(k)} 0 {f(r)} "
            f"b {f(-k)} {f(k)} {f(-k)} {f(k)} {f(-r)} 0 b {f(-k)} {f(-k)} {f(-k)} {f(-k)} 0 {f(-r)}")


def _f(v):
    return f"{v:.0f}"


def ev_sparkles(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    cx, cy, w, h = _target(ctx, e.get("target"), (0.5, 0.33, 0.55, 0.3))
    n = int(_num(e.get("count"), 12, 3, 40))
    col = _color(ctx, e.get("color"), WHITE)
    s0 = _size(e, 74, 10, 300) * u
    rng = _rng(e, "sparkles")
    for i in range(n + n // 2):
        dot = i >= n
        ang = (i + rng.uniform(-0.4, 0.4)) / (n if not dot else max(1, n // 2)) * 2 * math.pi
        rr = rng.uniform(0.78, 1.22)
        x = min(max(cx + w / 2 * rr * math.cos(ang), ctx.safe_left), ctx.safe_right)
        y = min(max(cy + h / 2 * rr * math.sin(ang), ctx.safe_top), ctx.safe_bottom)
        s = s0 * (rng.uniform(0.4, 1.1) if not dot else 0.16)
        path = _sparkle_path(s / 2) if not dot else ellipse(s / 2, s / 2)
        t = a + rng.uniform(0, 0.5)
        rz = rng.uniform(-20, 20)
        while t < b - 0.2:
            t2 = min(b, t + rng.uniform(0.55, 1.0))
            ms = int((t2 - t) * 1000)
            m1 = int(ms * 0.42)
            tag = (f"\\an7\\pos({x:.0f},{y:.0f})\\frz{rz:.0f}\\fscx0\\fscy0\\t(0,{m1},\\fscx100\\fscy100\\frz{rz - 35:.0f})"
                   f"\\t({m1},{ms},\\fscx0\\fscy0\\frz{rz - 80:.0f})")
            if not dot:
                _dr(ctx, t, t2, path, tag, 15, col, 0x60, bord=round(s * 0.1, 1), ocolor=col, oalpha=0x90,
                    blur=round(s * 0.22, 1))
            _dr(ctx, t, t2, path, tag, 16, col, 0)
            t = t2 + rng.uniform(0.0, 0.3)
    ctx.register(a, b, cx - w / 2 * 1.2, cy - h / 2 * 1.2, cx + w / 2 * 1.2, cy + h / 2 * 1.2)
    _sfx(ctx, e, a, "sparkle", 0.45)
    return a, b


# --------------------------------------------------------------------------- transitions

def ev_doors(ctx, e):
    text = _text(e.get("text"), "", 40) if e.get("text") else ""
    a, b = ev_window(ctx, e, 1.4 if text else 0.8)
    u = ctx.u
    W, H = ctx.W, ctx.H
    D = b - a
    tc, th = (0.25 * D, 0.42 * D) if text else (0.34 * D, 0.2 * D)
    to = D - tc - th
    light = str(e.get("theme", "dark")).lower() == "light"
    col = _color(ctx, e.get("color"), "#ECE6DA" if light else CHARCOAL)
    edge = "#FFFFFF" if light else "#4A4A4E"
    pad = 90 * u
    halfw = W / 2 + 4
    lp = rect(halfw, H + 40, -halfw, -20)
    rp = rect(halfw, H + 40, 0, -20)
    le = rect(3 * u, H + 40, -3 * u, -20)
    re_ = rect(3 * u, H + 40, 0, -20)
    ls = rect(70 * u, H + 40, 0, -20)
    rs = rect(70 * u, H + 40, -70 * u, -20)
    # subtle vertical sheen on each panel
    lsh = rect(halfw * 0.45, H + 40, -halfw * 0.75, -20)
    rsh = rect(halfw * 0.45, H + 40, halfw * 0.3, -20)

    def panels(t1, t2, xl, xr, extra=""):
        _dr(ctx, t1, t2, ls, f"\\an7\\pos({xl:.0f},0)" + extra, 40, "#000000", 0x70, blur=round(34 * u))
        _dr(ctx, t1, t2, rs, f"\\an7\\pos({xr:.0f},0)" + extra, 40, "#000000", 0x70, blur=round(34 * u))
        _dr(ctx, t1, t2, lp, f"\\an7\\pos({xl:.0f},0)" + extra, 41, col)
        _dr(ctx, t1, t2, rp, f"\\an7\\pos({xr:.0f},0)" + extra, 41, col)
        _dr(ctx, t1, t2, lsh, f"\\an7\\pos({xl:.0f},0)" + extra, 42, WHITE, 0xF4, blur=round(60 * u))
        _dr(ctx, t1, t2, rsh, f"\\an7\\pos({xr:.0f},0)" + extra, 42, WHITE, 0xF4, blur=round(60 * u))
        _dr(ctx, t1, t2, le, f"\\an7\\pos({xl:.0f},0)" + extra, 43, edge, 0x30)
        _dr(ctx, t1, t2, re_, f"\\an7\\pos({xr:.0f},0)" + extra, 43, edge, 0x30)

    nfc = max(2, int(round(tc * FPS)))
    for k in range(nfc):
        q = ((k + 1) / nfc) ** 2.2
        t1 = a + k * DT
        panels(t1, min(a + tc, t1 + DT), -pad + (W / 2 + pad) * q, W + pad - (W / 2 + pad) * q)
    th0 = a + tc
    panels(th0, th0 + th, W / 2, W / 2)
    # light seam
    _dr(ctx, th0, th0 + th, rect(2.5 * u, H, W / 2 - 1.25 * u, 0), "\\an7\\pos(0,0)\\fad(60,80)", 44, WHITE, 0x50)
    _dr(ctx, th0, th0 + th, rect(18 * u, H, W / 2 - 9 * u, 0), "\\an7\\pos(0,0)\\fad(60,80)", 44, WHITE, 0xB0,
        blur=round(14 * u))
    if text:
        font = resolve_font(e.get("font") or ctx.fkey("title"))
        tcol = _color(ctx, e.get("text_color"), INK if light else "#F4F3EF")
        lines, fs = ctx.wrap(text.upper() if e.get("uppercase", True) is not False else text, font,
                             _size(e, 92, 30, 220) * u, W * 0.8, max_lines=2)
        st = ctx.style(font, fs, tcol, "#000000", 0, 0)
        ms = int((th + to * 0.25) * 1000)
        ctx.draw_lines(th0, th0 + th + to * 0.25, st, lines, font, fs, W / 2, H * 0.45, fs * 1.1,
                       lambda xx, yy, i: (f"\\an5\\pos({xx:.0f},{yy:.0f})\\fscx92\\fscy92\\t(0,{ms},\\fscx102\\fscy102)"
                                          f"\\fad(140,{min(160, ms // 3)})"), tcol, ctx.accent, 45, register=False)
    to0 = th0 + th
    nfo = max(2, int(round(to * FPS)))
    for k in range(nfo):
        q = _eio((k + 1) / nfo) * 0.6 + _ei((k + 1) / nfo) * 0.4
        t1 = to0 + k * DT
        panels(t1, b if k == nfo - 1 else t1 + DT, W / 2 - (W / 2 + pad) * q, W / 2 + (W / 2 + pad) * q)
    _sfx(ctx, e, a, "swipe", 0.4)
    _sfx(ctx, e, th0 - 0.02, "impact", 0.3)
    _sfx(ctx, e, to0, "whoosh", 0.4)
    return a, b


def ev_paper_tear(ctx, e):
    text = _text(e.get("text"), "", 40) if e.get("text") else ""
    a, b = ev_window(ctx, e, 1.5 if text else 1.0)
    u = ctx.u
    W, H = ctx.W, ctx.H
    D = b - a
    t_in = min(0.24, D * 0.25)
    t_hold = D * (0.36 if text else 0.18)
    paper = _color(ctx, e.get("color"), "#F2ECDF")
    rng = _rng(e, "tear")
    tilt = rng.choice((-1, 1)) * 0.03 * H
    ym = _num(e.get("tear_y"), 0.58, 0.2, 0.85) * H
    jag = []
    x = -0.2 * W
    ph = rng.uniform(0, 6.28)
    while x <= 1.2 * W:
        yb = ym + tilt * (x / W - 0.5) * 2 + 14 * u * math.sin(x / W * 5 + ph)
        jag.append((x, yb + rng.uniform(-13, 13) * u))
        x += rng.uniform(14, 30) * u

    def fringe(sign):
        return [(px, py + sign * rng.uniform(5, 12) * u) for px, py in jag]
    top = [(-0.2 * W, -0.35 * H), (1.2 * W, -0.35 * H)] + jag[::-1]
    topf = [(-0.2 * W, -0.35 * H), (1.2 * W, -0.35 * H)] + fringe(1)[::-1]
    bot = jag + [(1.2 * W, 1.35 * H), (-0.2 * W, 1.35 * H)]
    botf = fringe(-1) + [(1.2 * W, 1.35 * H), (-0.2 * W, 1.35 * H)]
    P = {k: _poly_path(v) for k, v in (("top", top), ("topf", topf), ("bot", bot), ("botf", botf))}
    font = resolve_font(e.get("font") or "marker")
    tcol = _color(ctx, e.get("text_color"), INK)
    lines, fs = ([], 0)
    if text:
        lines, fs = ctx.wrap(text, font, _size(e, 100, 30, 220) * u, W * 0.8, max_lines=2)
    st = ctx.style(font, fs or 60, tcol, "#000000", 0, 0)
    ty = min(ym - 0.14 * H, H * 0.38)

    def sheet(t1, t2, dxt, dyt, rt, dxb, dyb, rb, extra="", tear=0.0):
        ot = f"\\org({W / 2 + dxt:.0f},{H * 0.25 + dyt:.0f})\\frz{-rt:.2f}"
        ob = f"\\org({W / 2 + dxb:.0f},{H * 0.8 + dyb:.0f})\\frz{-rb:.2f}"
        if tear:
            sa = 255 - (255 - 0x80) * min(1.0, tear * 3)
            _dr(ctx, t1, t2, P["top"], f"\\an7\\pos({dxt:.0f},{dyt + 14 * u * min(1.0, tear * 3):.0f})" + ot + extra, 40,
                "#000000", sa, blur=round(22 * u))
            _dr(ctx, t1, t2, P["bot"], f"\\an7\\pos({dxb:.0f},{dyb - 14 * u * min(1.0, tear * 3):.0f})" + ob + extra, 40,
                "#000000", sa, blur=round(22 * u))
            _dr(ctx, t1, t2, P["topf"], f"\\an7\\pos({dxt:.0f},{dyt:.0f})" + ot + extra, 41, "#FFFFFF", 0x10,
                blur=round(1.5 * u, 1))
            _dr(ctx, t1, t2, P["botf"], f"\\an7\\pos({dxb:.0f},{dyb:.0f})" + ob + extra, 41, "#FFFFFF", 0x10,
                blur=round(1.5 * u, 1))
        else:
            _dr(ctx, t1, t2, rect(1.4 * W, 50 * u, -0.2 * W, -0.35 * H - 50 * u), f"\\an7\\pos({dxt:.0f},{dyt:.0f})" + extra,
                40, "#000000", 0x70, blur=round(30 * u))
        _dr(ctx, t1, t2, P["top"], f"\\an7\\pos({dxt:.0f},{dyt:.0f})" + ot + extra, 42, paper)
        _dr(ctx, t1, t2, P["bot"], f"\\an7\\pos({dxb:.0f},{dyb:.0f})" + ob + extra, 42, paper)
        # soft paper shading
        _dr(ctx, t1, t2, rect(1.4 * W, 0.3 * H, -0.2 * W, -0.1 * H), f"\\an7\\pos({dxt:.0f},{dyt:.0f})" + ot + extra, 43,
            "#FFFFFF", 0xC0, blur=round(80 * u))
        if lines:
            lh = fs * 1.1
            y0 = ty - lh * (len(lines) - 1) / 2
            for i, ln in enumerate(lines):
                ctx.add(t1, t2, st, "{" + f"\\an5\\pos({W / 2 + dxt:.0f},{y0 + i * lh + ctx.cap_shift(font, fs) + dyt:.0f})" + ot
                        + extra + "}" + ctx.markup(ln, tcol, ctx.accent), 44)

    nfi = max(2, int(round(t_in * FPS)))
    for k in range(nfi):
        oy = H * 1.4 * (1 - _eo((k + 1) / nfi))
        t1 = a + k * DT
        sheet(t1, t1 + DT, 0, oy, 0, 0, oy, 0)
    th0 = a + nfi * DT
    sheet(th0, th0 + t_hold, 0, 0, 0, 0, 0, 0)
    tt0 = th0 + t_hold
    nft = max(2, int(round((b - tt0) * FPS)))
    for k in range(nft):
        p = (k + 1) / nft
        qa = p ** 2.2
        qb = max(0.0, (p - 0.08) / 0.92) ** 2.0
        t1 = tt0 + k * DT
        sheet(t1, b if k == nft - 1 else t1 + DT, -30 * u * qa, -H * 0.9 * qa, -6 * qa, 25 * u * qb, H * 0.75 * qb, 5 * qb,
              tear=p)
    _sfx(ctx, e, a, "swipe", 0.4)
    _sfx(ctx, e, tt0, "whoosh-fast", 0.5)
    return a, b


# --------------------------------------------------------------------------- backgrounds: type wall, light leak

def ev_typewall(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    W, H = ctx.W, ctx.H
    text = _text(e.get("text"), "EVERYBODY'S TALKING", 60)
    if e.get("uppercase", True) is not False:
        text = text.upper()
    font = resolve_font(e.get("font") or "anton")
    fs = _size(e, 230, 60, 700) * u
    pitch = fs * _num(e.get("line_height"), 0.86, 0.5, 2)
    rows = int(_num(e.get("rows"), math.ceil(H / pitch) + 1, 1, 24))
    if e.get("rows") is not None:
        pitch = H / max(1, rows - 0.5)
        fs = pitch / _num(e.get("line_height"), 0.86, 0.5, 2)
    sep = e.get("separator")
    unit = text + ("   " if sep is None else " " + str(sep)[:4] + " ")
    uw = max(10.0, ctx.text_w(unit, font, fs))
    speed = _num(e.get("speed"), 160, 0, 3000) * u
    travel = speed * (b - a)
    reps = int(math.ceil((W + travel + uw) / uw)) + 1
    while reps > 2 and len(unit) * reps > 400:
        reps -= 1
    col = _color(ctx, e.get("color"), WHITE)
    al = _num(e.get("alpha"), 0x68, 0, 250)
    style = str(e.get("style", "mixed")).lower()
    shift = ctx.cap_shift(font, fs)
    rng = _rng(e, "typewall")
    y_first = (H - (rows - 1) * pitch) / 2
    for r in range(rows):
        yc = y_first + r * pitch
        d = -1 if r % 2 == 0 else 1
        phase = rng.uniform(0, uw)
        L0 = -phase if d < 0 else -travel - phase
        L1 = L0 + d * travel
        outline = style == "outline" or (style == "mixed" and r % 2 == 1)
        st = ctx.style(font, fs, col, col, round(2.5 * u, 1) if outline else 0, 0)
        alpha = f"\\1a&HFF&\\3a{_al(max(al - 0x20, 0))}" if outline else f"\\1a{_al(al)}"
        t0 = a + r * 0.035
        ctx.add(t0, b, st, "{" + alpha + f"\\an4\\move({L0:.0f},{yc + shift:.0f},{L1:.0f},{yc + shift:.0f})"
                f"\\fad(300,350)" + "}" + esc(unit * reps), 1)
    _sfx(ctx, e, a, "whoosh", 0.3)
    return a, b


LEAK_PALETTES = {"warm": ["#FF7A2F", "#FF4F6D", "#FFB347", "#FF9A3C"], "pink": ["#FF5C8A", "#FF8FB1", "#FF6F61"],
                 "gold": ["#FFC15E", "#FFAA33", "#FFE29A"], "cool": ["#6FA8FF", "#B07BFF", "#6FE3FF"],
                 "red": ["#FF3B30", "#FF6A3D", "#FF2D55"]}


def ev_light_leak(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    W, H = ctx.W, ctx.H
    inten = _num(e.get("intensity"), 1.0, 0.1, 2.0)
    cname = str(e.get("color", "warm")).lower()
    colors = LEAK_PALETTES.get(cname) or [_color(ctx, e.get("color"), "#FF7A2F")]
    side = str(e.get("side", "left")).lower()
    rng = _rng(e, "leak")
    nb = int(_num(e.get("count"), 4, 1, 7))
    D = b - a
    big = max(W, H)
    fi, fo = int(min(600, D * 350)), int(min(700, D * 400))
    for i in range(nb):
        rx = big * rng.uniform(0.26, 0.42)
        ry = rx * rng.uniform(0.55, 0.9)
        if side in ("left", "right"):
            x0 = rng.uniform(-0.15, 0.25) * W
            y0 = rng.uniform(0.0, 1.0) * H
            x1, y1 = x0 + rng.uniform(0.3, 0.6) * W, y0 + rng.uniform(-0.15, 0.15) * H
            if side == "right":
                x0, x1 = W - x0, W - x1
        else:
            y0 = rng.uniform(-0.15, 0.2) * H
            x0 = rng.uniform(0.0, 1.0) * W
            x1, y1 = x0 + rng.uniform(-0.15, 0.15) * W, y0 + rng.uniform(0.25, 0.5) * H
            if side == "bottom":
                y0, y1 = H - y0, H - y1
        col = colors[i % len(colors)]
        t0 = a + i * D * 0.07
        for f, al in ((1.0, 0xDC), (0.62, 0xCC), (0.3, 0xB8)):
            al2 = 255 - (255 - al) * inten
            _dr(ctx, t0, b, ellipse(rx * f, ry * f), f"\\an7\\move({x0:.0f},{y0:.0f},{x1:.0f},{y1:.0f})\\frz{rng.uniform(-40, 40):.0f}"
                f"\\fad({fi},{fo})\\t(\\fscx118\\fscy110)", 1, col, al2, blur=round(min(90, 70 * f + 20) * u))
    _dr(ctx, a, b, rect(W, H), f"\\an7\\pos(0,0)\\fad({fi},{fo})", 1, colors[0], 255 - (255 - 0xEC) * inten)
    return a, b


# --------------------------------------------------------------------------- stickers: burst, word sticker

def ev_burst(ctx, e):
    a, b = ev_window(ctx, e, 1.8)
    u = ctx.u
    text = _text(e.get("text"), "WOW!", 18)
    if e.get("uppercase", True) is not False:
        text = text.upper()
    font = resolve_font(e.get("font") or "bangers")
    R = _size(e, 170, 60, 500) * u
    land = ctx.W > ctx.H
    x, y = _xy(ctx, e, 0.76 if not land else 0.78, 0.2 if not land else 0.26)
    x = ctx.clamp_x(x, 2.3 * R)
    y = ctx.clamp_y(y, 2.1 * R)
    fill = _color(ctx, e.get("fill"), WHITE)
    ink = _color(ctx, e.get("color"), INK)
    oc = _color(ctx, e.get("outline"), INK)
    shc = _color(ctx, e.get("shadow"), CHARCOAL)
    spikes = int(_num(e.get("spikes"), 16, 8, 30))
    rot = _num(e.get("rotate"), -6, -60, 60)
    rng = _rng(e, "burst")

    def bpath(rr):
        pts = []
        for i in range(2 * spikes):
            ang = i * math.pi / spikes + rr.uniform(-0.07, 0.07)
            r = R * (rr.uniform(0.92, 1.08) if i % 2 == 0 else rr.uniform(0.64, 0.72))
            pts.append((r * math.cos(ang) * 1.12, r * math.sin(ang)))
        return pts
    vs = [bpath(rng) for _ in range(3)]
    so = (12 * u, 14 * u)
    paths = [(_poly_path(v), _poly_path([(px + so[0], py + so[1]) for px, py in v])) for v in vs]
    pos = f"\\an7\\pos({x:.0f},{y:.0f})"
    t_in = min(b - 0.25, a + 0.42)
    t_out = max(t_in, b - 0.2)
    enter = (f"\\frz{-(rot - 24):.1f}\\fscx0\\fscy0\\t(0,180,\\fscx120\\fscy120\\frz{-rot:.1f})"
             f"\\t(180,300,\\fscx93\\fscy93)\\t(300,400,\\fscx100\\fscy100)")
    rz = f"\\frz{-rot:.1f}"

    def emit(t1, t2, k, extra):
        if t2 <= t1:
            return
        _dr(ctx, t1, t2, paths[k][1], pos + extra, 15, shc, 0x18)
        _dr(ctx, t1, t2, paths[k][0], pos + extra, 16, fill, 0, bord=round(7 * u, 1), ocolor=oc)
    emit(a, t_in, 0, enter)
    t, k = t_in, 1
    while t < t_out - 1e-3:
        t2 = min(t_out, t + 0.14)
        emit(t, t2, k % 3, rz)
        t, k = t2, k + 1
    ms = int((b - t_out) * 1000)
    emit(t_out, b, k % 3, rz + f"\\t(0,{ms},\\fscx0\\fscy0)\\fad(0,{ms})")
    lines, fs = ctx.wrap(text, font, R * 0.8, R * 1.5, max_lines=2)
    st = ctx.style(font, fs, ink, "#000000", 0, 0)
    lh = fs * 1.0
    y0 = y - lh * (len(lines) - 1) / 2
    dur = int((b - a - 0.06) * 1000)
    es = max(0, dur - 200)
    for i, ln in enumerate(lines):
        ctx.add(a + 0.06, b, st, "{" + f"\\an5\\pos({x:.0f},{y0 + i * lh + ctx.cap_shift(font, fs):.0f})\\org({x:.0f},{y:.0f})"
                f"\\frz{-(rot - 24):.1f}\\fscx0\\fscy0\\t(0,170,\\fscx122\\fscy122\\frz{-rot:.1f})\\t(170,300,\\fscx100\\fscy100)"
                f"\\t({es},{dur},\\fscx0\\fscy0)" + "}" + ctx.markup(ln, ink, ctx.accent), 17)
    ctx.register(a, b, x - 1.12 * R, y - R, x + 1.12 * R + so[0], y + R + so[1])
    _sfx(ctx, e, a, "pop", 0.55)
    return a, b


def ev_word_sticker(ctx, e):
    a, b = ev_window(ctx, e, 2.2)
    u = ctx.u
    text = _text(e.get("text"), "WOW", 30)
    if e.get("uppercase", True) is not False:
        text = text.upper()
    font = resolve_font(e.get("font") or ctx.fkey("title"))
    fs = _size(e, 120, 40, 320) * u
    lines, fs = ctx.wrap(text, font, fs, ctx.W * 0.6, max_lines=2)
    lh = fs * 1.06
    bw = max(ctx.text_w(ln, font, fs) for ln in lines)
    bh = lh * len(lines)
    border = _num(e.get("border"), max(10.0, fs / u * 0.15), 0, 60) * u
    land = ctx.W > ctx.H
    x, y = _xy(ctx, e, 0.72 if not land else 0.76, 0.22 if not land else 0.25)
    x = ctx.clamp_x(x, bw + 2 * border + 24 * u)
    y = ctx.clamp_y(y, bh + 2 * border + 24 * u)
    rot = _num(e.get("rotate"), -6, -60, 60)
    tc = _color(ctx, e.get("color"), INK)
    bc = _color(ctx, e.get("border_color"), WHITE)
    st_sh = ctx.style(font, fs, "#000000", "#000000", round(border, 1), 0)
    st_b = ctx.style(font, fs, bc, bc, round(border, 1), 0)
    st_t = ctx.style(font, fs, tc, "#000000", 0, 0)
    r = -rot
    ms = int((b - a) * 1000)
    es = max(460, ms - 240)
    anim = (f"\\frz{r + 18:.1f}\\fscx20\\fscy20\\t(0,140,\\fscx114\\fscy114\\frz{r - 7:.1f})"
            f"\\t(140,250,\\fscx96\\fscy96\\frz{r + 4.5:.1f})\\t(250,350,\\fscx100\\fscy100\\frz{r - 2:.1f})\\t(350,440,\\frz{r:.1f})")
    t, sgn = 700, 1
    while t + 420 < es and t < 6000:
        anim += f"\\t({t},{t + 420},\\frz{r + sgn * 1.8:.1f})"
        t, sgn = t + 420, -sgn
    anim += f"\\t({es},{es + 90},\\fscx110\\fscy110)\\t({es + 90},{ms},\\fscx0\\fscy0)"
    y0 = y - lh * (len(lines) - 1) / 2
    shift = ctx.cap_shift(font, fs)
    for i, ln in enumerate(lines):
        yy = y0 + i * lh + shift
        body = esc(ln.replace("*", ""))
        ctx.add(a, b, st_sh, "{" + f"\\an5\\pos({x + 5 * u:.0f},{yy + 10 * u:.0f})\\org({x + 5 * u:.0f},{y + 10 * u:.0f})"
                f"\\alpha&H90&\\blur{8 * u:.0f}" + anim + "}" + body, 15)
        ctx.add(a, b, st_b, "{" + f"\\an5\\pos({x:.0f},{yy:.0f})\\org({x:.0f},{y:.0f})\\blur{0.8 * u:.1f}" + anim + "}" + body, 16)
        ctx.add(a, b, st_t, "{" + f"\\an5\\pos({x:.0f},{yy:.0f})\\org({x:.0f},{y:.0f})" + anim + "}" +
                ctx.markup(ln, tc, ctx.accent), 17)
    ctx.register(a, b, x - bw / 2 - border, y - bh / 2 - border, x + bw / 2 + border, y + bh / 2 + border)
    _sfx(ctx, e, a, "pop", 0.55)
    return a, b


# --------------------------------------------------------------------------- registry

EVENTS = {
    "notes_wall": ev_notes_wall,
    "orbit_text": ev_orbit_text,
    "orbit_cards": ev_orbit_cards,
    "head_stack": ev_head_stack,
    "chip_roll": ev_chip_roll,
    "doodle": ev_doodle,
    "arrow": ev_arrow,
    "circle_highlight": ev_circle_highlight,
    "speed_lines": ev_speed_lines,
    "shockwave": ev_shockwave,
    "confetti": ev_confetti,
    "sparkles": ev_sparkles,
    "doors": ev_doors,
    "paper_tear": ev_paper_tear,
    "typewall": ev_typewall,
    "light_leak": ev_light_leak,
    "burst": ev_burst,
    "word_sticker": ev_word_sticker,
    "scribble_frame": ev_scribble_frame,
}

DOCS = {}

HIDE_CAPTIONS = set()
