"""UI / social-media mockup effects: phone, keyboard, search, call, voice note, comment, AI prompt, notification, chat,
post card, browser, live cursor, poll, question box and stickers.

Premium, neutral (Apple-like) look: white / off-white cards, charcoal text, light grey lines, a dark-glass variant
(`theme: "dark"`), soft shadows, rounded corners and spring-y entrances. Generic styling only (no brand names/logos).

Every mockup is built on `_Rig`: a group of elements (shapes + text) that share one entrance/exit transform. The rig
samples every element once per video frame and merges identical consecutive frames, so composite cards slide / pop /
scale as one object (exact, no drifting parts) while static periods cost a single ASS line.
"""
import math
import random
import re

from .core import FPS
from .text import (a_tag, c_tag, check_path, circle, ellipse, esc, ev_window, heart, polygon, rect, rrect, star,
                   theme_color, thick_line, xpos, ypos)

F_BODY = "inter-bold"
F_HEAD = "inter-extrabold"
_FPS = float(FPS or 30)

# --------------------------------------------------------------------------- small safe helpers


def _cl(v, lo=0.0, hi=1.0):
    return lo if v < lo else hi if v > hi else v


def _ease_out(p):
    p = _cl(p)
    return 1 - (1 - p) ** 3


def _ease_io(p):
    p = _cl(p)
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def _back(p, s=1.70158):
    p = _cl(p)
    q = p - 1
    return q * q * ((s + 1) * q + s) + 1


def _num(v, d, lo=None, hi=None):
    try:
        x = float(v)
        if x != x or x in (float("inf"), float("-inf")):
            x = d
    except (TypeError, ValueError):
        x = d
    if lo is not None:
        x = max(lo, x)
    if hi is not None:
        x = min(hi, x)
    return x


def _str(v, d="", n=140):
    if v is None or isinstance(v, (dict, list, tuple, bool)):
        v = d
    s = " ".join(str(v).split())
    if not s:
        s = " ".join(str(d).split())
    if len(s) > n:
        s = s[:n - 1].rstrip() + "…"
    return s


def _bool(v, d):
    if v is None:
        return d
    if isinstance(v, str):
        return v.strip().lower() not in ("0", "false", "no", "off", "none", "")
    return bool(v)


def _list(v, n):
    if isinstance(v, (list, tuple)):
        return list(v)[:n]
    if isinstance(v, str) and v.strip():
        return [v]
    return []


def _initial(name, d="A"):
    for ch in str(name or ""):
        if ch.isalnum():
            return ch.upper()
    return d


def _rgb(h):
    h = str(h or "").strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if not re.fullmatch(r"[0-9a-fA-F]{6}", h):
        return None
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _lum(h):
    c = _rgb(h)
    if not c:
        return 1.0
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255.0


def _on(fill):
    """Readable text colour on top of `fill`."""
    return "#161616" if _lum(fill) > 0.62 else "#FFFFFF"


def _mix(c1, c2, t):
    a, b = _rgb(c1) or (255, 255, 255), _rgb(c2) or (255, 255, 255)
    return "#" + "".join(f"{round(a[i] * t + b[i] * (1 - t)):02X}" for i in range(3))


def _color(ctx, v, d):
    if not v or not isinstance(v, str):
        return d
    c = theme_color(ctx, v)
    return c if _rgb(c) else d


def _sfx_on(e):
    v = e.get("sfx", True)
    return not (v is False or v is None or (isinstance(v, str) and v.strip().lower() in ("", "none", "off", "false")))


def _main_sfx(ctx, e, t, name, vol=0.5):
    """The effect's signature sound. A custom `sfx` name is played by the renderer at the start instead."""
    if not _sfx_on(e) or isinstance(e.get("sfx"), str):
        return
    ctx.extra_sfx.append((t, name, vol))


def _sub_sfx(ctx, e, t, name, vol=0.4):
    if _sfx_on(e) and t < ctx.dur - 0.05:
        ctx.extra_sfx.append((t, name, vol))


def _typing_sfx(ctx, e, t0, t1, vol=0.3):
    if not _sfx_on(e) or t1 - t0 < 0.04:
        return
    if t1 - t0 < 0.35:
        _sub_sfx(ctx, e, t0, "click", 0.4)
        return
    t = t0
    while t < t1 - 0.25:
        _sub_sfx(ctx, e, t, "typing", vol)
        t += 1.55


def _type_times(n, t0, t1, min_step=0.045, max_step=0.12, seed=7):
    """Times at which each of n characters appears (human-ish rhythm), plus the end time."""
    if n <= 0:
        return [], t0
    span = max(0.05, t1 - t0)
    step = _cl(span / n, min_step, max_step)
    if step * n > span:
        step = max(0.012, span / n)
    rng = random.Random(seed + n)
    times, t = [], t0
    for _ in range(n):
        times.append(t)
        t += step * rng.uniform(0.7, 1.3)
    k = (min(t, t0 + span) - t0) / max(1e-6, t - t0)
    times = [t0 + (x - t0) * k for x in times]
    return times, t0 + (t - t0) * k


def _w(ctx, frac, max_u):
    return min(ctx.W * frac, max_u * ctx.u, ctx.safe_right - ctx.safe_left)


def _st(ctx, font, fs, color):
    return ctx.style(font, fs, color, "#000000", 0, 0)


def _fit1(ctx, text, font, fs, maxw, minr=0.75):
    """One line: shrink down to `minr`, then truncate with an ellipsis."""
    text = str(text)
    s = fs
    while ctx.text_w(text, font, s) > maxw and s > fs * minr:
        s *= 0.95
    if ctx.text_w(text, font, s) > maxw:
        while len(text) > 1 and ctx.text_w(text + "…", font, s) > maxw:
            text = text[:-1]
        text = text.rstrip() + "…"
    return text, s


def _wrapn(ctx, text, font, fs, maxw, maxl, shrink=0.82):
    lines, s = ctx.wrap(str(text), font, fs, maxw, max_lines=maxl, min_size=fs * shrink)
    lines = [ln for ln in lines if ln.strip()] or [""]
    if len(lines) > maxl:
        lines = lines[:maxl]
        lines[-1] = lines[-1].rstrip(" .,;:") + "…"
    out = []
    for ln in lines:
        if ctx.text_w(ln, font, s) > maxw:
            ln, _ = _fit1(ctx, ln, font, s, maxw, 1.0)
        out.append(ln)
    return out, s


def _tail_fit(ctx, text, font, fs, maxw):
    if ctx.text_w(text, font, fs) <= maxw:
        return text
    while len(text) > 1 and ctx.text_w("…" + text, font, fs) > maxw:
        text = text[1:]
    return "…" + text


def _plain(s):
    return str(s).replace("*", "")


# --------------------------------------------------------------------------- path helpers

def _p(v):
    return f"{v:.0f}"


def _rev(path):
    """Reverse one closed subpath made of m / l / b commands (used to cut holes, any fill rule)."""
    tok = path.split()
    i, cmd, start, segs, cur = 0, None, None, [], None
    while i < len(tok):
        t = tok[i]
        if t in ("m", "l", "b", "n"):
            cmd = t
            i += 1
            continue
        if cmd == "m":
            start = cur = (tok[i], tok[i + 1])
            i += 2
        elif cmd == "l":
            pt = (tok[i], tok[i + 1])
            segs.append(("l", cur, [pt]))
            cur = pt
            i += 2
        elif cmd == "b":
            pts = [(tok[i], tok[i + 1]), (tok[i + 2], tok[i + 3]), (tok[i + 4], tok[i + 5])]
            segs.append(("b", cur, pts))
            cur = pts[2]
            i += 6
        else:
            i += 1
    if start is None:
        return ""
    out = [f"m {cur[0]} {cur[1]}"]
    for kind, s0, pts in reversed(segs):
        if kind == "l":
            out.append(f"l {s0[0]} {s0[1]}")
        else:
            out.append(f"b {pts[1][0]} {pts[1][1]} {pts[0][0]} {pts[0][1]} {s0[0]} {s0[1]}")
    return " ".join(out)


def _ring(R, r, cx=0, cy=0):
    return circle(R, cx, cy) + " " + _rev(circle(r, cx, cy))


def _rring(w, h, r, t, x=0, y=0):
    """Rounded-rectangle outline of thickness t (outer box w×h at x,y)."""
    return rrect(w, h, r, x, y) + " " + _rev(rrect(w - 2 * t, h - 2 * t, max(0, r - t), x + t, y + t))


def _handset(s):
    """Phone handset glyph centred on 0,0 (size s)."""
    pts = [(0.22, 0.06), (0.28, 0.03, 0.33, 0.05, 0.36, 0.10), (0.45, 0.27), (0.48, 0.32, 0.46, 0.37, 0.42, 0.40),
           (0.36, 0.44), (0.42, 0.55, 0.47, 0.60, 0.57, 0.65), (0.61, 0.60), (0.64, 0.56, 0.69, 0.55, 0.73, 0.57),
           (0.90, 0.66), (0.95, 0.69, 0.96, 0.74, 0.94, 0.79), (0.88, 0.90), (0.85, 0.95, 0.79, 0.97, 0.73, 0.96),
           (0.42, 0.90, 0.12, 0.62, 0.05, 0.28), (0.04, 0.22, 0.06, 0.17, 0.10, 0.14)]
    out = []
    for i, p in enumerate(pts):
        q = [(v - 0.5) * s for v in p]
        if i == 0:
            out.append(f"m {_p(q[0])} {_p(q[1])}")
        elif len(q) == 2:
            out.append(f"l {_p(q[0])} {_p(q[1])}")
        else:
            out.append("b " + " ".join(_p(v) for v in q))
    return " ".join(out)


def _mag_paths(s):
    """Magnifier (ring + handle) centred on 0,0."""
    R, t = s * 0.30, s * 0.085
    cx = cy = -s * 0.08
    return _ring(R, R - t, cx, cy) + " " + thick_line(cx + R * 0.62, cy + R * 0.62, s * 0.40, s * 0.40, t * 1.25)


def _arrow_up(s):
    w, hw, h = s * 0.16, s * 0.34, s * 0.78
    return polygon([(-w / 2, h / 2), (-w / 2, -h * 0.02), (-hw, -h * 0.02), (0, -h / 2), (hw, -h * 0.02), (w / 2, -h * 0.02),
                    (w / 2, h / 2)])


def _heart_outline(s, t):
    k = max(0.35, 1 - 2.2 * t / s)
    return heart(s, 0, 0) + " " + _rev(heart(s * k, 0, -s * 0.05 * (1 - k)))


def _icon(kind, s):
    """Small sticker / UI icons centred on 0,0. Returns a list of (path, rot) parts."""
    if kind == "location":
        tip, top = s * 0.48, -s * 0.46
        body = (f"m 0 {_p(tip)} b {_p(-s * 0.10)} {_p(s * 0.30)} {_p(-s * 0.34)} {_p(s * 0.06)} {_p(-s * 0.34)} {_p(-s * 0.12)} "
                f"b {_p(-s * 0.34)} {_p(-s * 0.33)} {_p(-s * 0.19)} {_p(top)} 0 {_p(top)} "
                f"b {_p(s * 0.19)} {_p(top)} {_p(s * 0.34)} {_p(-s * 0.33)} {_p(s * 0.34)} {_p(-s * 0.12)} "
                f"b {_p(s * 0.34)} {_p(s * 0.06)} {_p(s * 0.10)} {_p(s * 0.30)} 0 {_p(tip)}")
        return [(body + " " + _rev(circle(s * 0.13, 0, -s * 0.13)), 0)]
    if kind == "link":
        w, h, t = s * 0.50, s * 0.30, s * 0.085
        r1 = _rring(w, h, h / 2, t, -s * 0.42, -h / 2)
        r2 = _rring(w, h, h / 2, t, -s * 0.08, -h / 2)
        return [(r1, 45), (r2, 45)]
    if kind == "music":
        t = s * 0.09
        return [(ellipse(s * 0.15, s * 0.11, -s * 0.24, s * 0.27) + " " + ellipse(s * 0.15, s * 0.11, s * 0.20, s * 0.19) + " " +
                 rect(t, s * 0.62, -s * 0.13, -s * 0.36) + " " + rect(t, s * 0.62, s * 0.31 - t, -s * 0.44) + " " +
                 polygon([(-s * 0.13, -s * 0.36), (s * 0.31, -s * 0.44), (s * 0.31, -s * 0.28), (-s * 0.13, -s * 0.20)]), 0)]
    if kind == "time":
        R, t = s * 0.42, s * 0.085
        return [(_ring(R, R - t) + " " + thick_line(0, s * 0.03, 0, -s * 0.24, t) + " " + thick_line(-s * 0.02, 0, s * 0.17, s * 0.08, t), 0)]
    if kind == "sparkle":
        return [(star(s * 0.5, 0, 0, 4, 0.34), 0), (star(s * 0.2, s * 0.36, -s * 0.34, 4, 0.36), 0)]
    if kind == "lock":
        return [(rrect(s * 0.56, s * 0.44, s * 0.08, -s * 0.28, -s * 0.04) + " " +
                 _rring(s * 0.38, s * 0.56, s * 0.19, s * 0.08, -s * 0.19, -s * 0.46), 0)]
    return [(circle(s * 0.3), 0)]


# --------------------------------------------------------------------------- the rig (grouped, per-frame animation)

def _local(kind, tl, d, u):
    """Element-level entrance: returns (dx, dy, scale, fade)."""
    if d <= 0 or tl >= d:
        return 0.0, 0.0, 1.0, 1.0
    p = tl / d
    if kind == "pop":
        return 0.0, 0.0, 0.55 + 0.45 * _back(p, 2.2), _cl(p / 0.3)
    if kind == "spring":
        return 0.0, 0.0, _back(p, 2.6), _cl(p / 0.2)
    if kind == "rise":
        return 0.0, 26 * u * (1 - _ease_out(p)), 1.0, _cl(p / 0.6)
    if kind == "drop":
        return 0.0, -22 * u * (1 - _ease_out(p)), 1.0, _cl(p / 0.6)
    if kind == "left":
        return -40 * u * (1 - _ease_out(p)), 0.0, 1.0, _cl(p / 0.6)
    if kind == "right":
        return 40 * u * (1 - _ease_out(p)), 0.0, 1.0, _cl(p / 0.6)
    if kind == "grow":
        return 0.0, 0.0, _ease_out(p), _cl(p / 0.3)
    return 0.0, 0.0, 1.0, _ease_out(p)


class _Rig:
    def __init__(self, ctx, a, b, cx, cy, enter="pop", exit="fade", tin=0.5, tout=0.32, edx=0.0, edy=0.0, xdx=0.0,
                 xdy=0.0, rot=0.0, erot=0.0):
        self.ctx, self.a, self.b, self.cx, self.cy = ctx, a, b, cx, cy
        d = max(0.2, b - a)
        self.enter, self.exit = enter, exit
        self.tin = 0.0 if enter == "none" else max(0.05, min(tin, d * 0.4))
        self.tout = 0.0 if exit == "none" else max(0.05, min(tout, d * 0.3))
        self.edx, self.edy, self.xdx, self.xdy, self.rot, self.erot = edx, edy, xdx, xdy, rot, erot
        self.u = ctx.u
        self.els = []

    def gstate(self, t):
        ox = oy = 0.0
        s = f = 1.0
        r = self.rot
        if self.tin > 0 and t < self.a + self.tin:
            p = _cl((t - self.a) / self.tin)
            k = self.enter
            if k == "slide":
                e = 1 - (1 - p) ** 4
                ox, oy, f = self.edx * (1 - e), self.edy * (1 - e), _cl(p / 0.3)
            elif k == "drop":
                e = _back(p, 1.3)
                ox, oy, f = self.edx * (1 - e), self.edy * (1 - e), _cl(p / 0.25)
            elif k == "pop":
                s, f = 0.84 + 0.16 * _back(p, 1.8), _cl(p / 0.35)
            elif k == "spring":
                s, f = _back(p, 2.4), _cl(p / 0.2)
                r += self.erot * (1 - _ease_out(p))
            elif k == "rise":
                oy, f = 60 * self.u * (1 - _ease_out(p)), _cl(p / 0.6)
            else:
                f = _ease_out(p)
        if self.tout > 0 and t > self.b - self.tout:
            q = _cl((t - (self.b - self.tout)) / self.tout)
            k = self.exit
            if k == "slide":
                e = q * q
                ox, oy = ox + self.xdx * e, oy + self.xdy * e
                f *= 1 - _cl((q - 0.35) / 0.65)
            elif k == "shrink":
                s *= 1 - 0.25 * q * q
                f *= 1 - q
            elif k == "up":
                oy -= 50 * self.u * q * q
                f *= 1 - q
            else:
                s *= 1 - 0.04 * q
                f *= 1 - q
        return ox, oy, s, f, r

    def _add(self, kind, payload, x, y, layer, t0, t1, alpha, anim, adur, delay, pivot, out, rot, dyn, an, **kw):
        el = dict(k=kind, p=payload, x=x, y=y, layer=layer, t0=self.a if t0 is None else t0,
                  t1=self.b if t1 is None else t1, al=alpha, anim=anim, adur=adur, delay=delay, pivot=pivot, out=out,
                  rot=rot, dyn=dyn, an=an)
        el.update(kw)
        self.els.append(el)

    def shape(self, path, x, y, color, alpha=0, layer=20, t0=None, t1=None, outline=None, bord=0, oalpha=None, blur=0,
              anim=None, adur=0.32, delay=0.0, pivot=None, out=0.0, rot=0.0, dyn=None):
        self._add("s", path, x, y, layer, t0, t1, alpha, anim, adur, delay, pivot, out, rot, dyn, 7, c=color, oc=outline,
                  bord=bord, oal=alpha if oalpha is None else oalpha, blur=blur)

    def text(self, txt, style, x, y, an=5, layer=22, t0=None, t1=None, alpha=0, anim=None, adur=0.32, delay=0.0,
             pivot=None, out=0.0, rot=0.0, dyn=None):
        self._add("t", txt, x, y, layer, t0, t1, alpha, anim, adur, delay, pivot, out, rot, dyn, an, style=style)

    def shadow(self, path, x, y, layer=19, strength=1.0, **kw):
        u = self.u
        self.shape(path, x, y + 14 * u, "#000000", alpha=int(255 - 92 * strength), blur=round(22 * u), layer=layer, **kw)

    def reg(self, x0, y0, x1, y1, a=None, b=None):
        self.ctx.register(self.a if a is None else a, self.b if b is None else b, x0, y0, x1, y1, kind="ui")

    def _frame(self, el, t):
        ox, oy, gs, gf, gr = self.gstate(t)
        ldx = ldy = 0.0
        ls = lf = 1.0
        tl = t - el["t0"] - el["delay"]
        if tl < 0:
            return None
        an = el["anim"]
        if an:
            res = an(tl) if callable(an) else _local(an, tl, el["adur"], self.u)
            if res is None:
                return None
            ldx, ldy, ls, lf = res
        if el["out"] > 0:
            lf *= _cl((el["t1"] - t) / el["out"])
        if el["dyn"]:
            d = el["dyn"](t)
            if d is None:
                return None
            ldx, ldy, ls, lf = ldx + d[0], ldy + d[1], ls * d[2], lf * d[3]
        f, S = gf * lf, gs * ls
        if f < 0.012 or S < 0.01:
            return None
        px, py = el["pivot"] or (el["x"], el["y"])
        ax, ay = px + (el["x"] + ldx - px) * ls, py + (el["y"] + ldy - py) * ls
        dx, dy = (ax - self.cx) * gs, (ay - self.cy) * gs
        if abs(gr) > 0.01:
            th = math.radians(gr)
            c, s_ = math.cos(th), math.sin(th)
            dx, dy = dx * c + dy * s_, -dx * s_ + dy * c
        X, Y = self.cx + dx + ox, self.cy + dy + oy
        R = gr + el["rot"]
        tag = f"\\an{el['an']}\\pos({X:.0f},{Y:.0f})"
        if abs(S - 1) > 0.002:
            tag += f"\\fscx{S * 100:.1f}\\fscy{S * 100:.1f}"
        if abs(R) > 0.05:
            tag += f"\\frz{R:.1f}"
        a1 = 255 - (255 - el["al"]) * f
        if el["k"] == "s":
            path = el["p"](t) if callable(el["p"]) else el["p"]
            if not path:
                return None
            tag += f"\\bord{el['bord']:.1f}\\shad0\\1c{c_tag(el['c'])}\\1a{a_tag(a1)}"
            if el["bord"]:
                tag += f"\\3c{c_tag(el['oc'] or el['c'])}\\3a{a_tag(255 - (255 - el['oal']) * f)}"
            if el["blur"]:
                tag += f"\\blur{el['blur']}"
            return "{" + tag + "\\p1}" + path
        txt = el["p"](t) if callable(el["p"]) else el["p"]
        if not txt:
            return None
        if a1 > 0.5:
            tag += f"\\alpha{a_tag(a1)}"
        return "{" + tag + "}" + txt

    def flush(self):
        ctx = self.ctx
        sst = ctx.shape_style()
        for el in self.els:
            t0, t1 = max(el["t0"], self.a), min(el["t1"], self.b)
            if t1 - t0 < 0.01:
                continue
            k0, k1 = math.ceil(t0 * _FPS - 1e-6), math.ceil(t1 * _FPS - 1e-6)
            style = sst if el["k"] == "s" else el["style"]
            prev, start = None, k0
            for k in range(k0, k1):
                txt = self._frame(el, k / _FPS)
                if txt != prev:
                    if prev is not None:
                        ctx.add(max(0.0, (start - 0.5) / _FPS), (k - 0.5) / _FPS, style, prev, el["layer"])
                    prev, start = txt, k
            if prev is not None:
                ctx.add(max(0.0, (start - 0.5) / _FPS), (k1 - 0.5) / _FPS, style, prev, el["layer"])
        self.els = []


# --------------------------------------------------------------------------- palette / shared parts

def _pal(ctx, e, default="light"):
    th = str(e.get("theme") or e.get("style_theme") or default).lower()
    dark = th in ("dark", "glass", "dark-glass", "black", "night")
    if dark:
        p = {"dark": True, "card": "#1C1C1E", "card2": "#2C2C2E", "ink": "#F4F3EF", "muted": "#98989D",
             "line": "#3A3A3C", "field": "#2C2C2E", "screen": "#0B0B0C", "bubble": "#2C2C2E", "outline": "#FFFFFF",
             "oal": 0xD8}
    else:
        p = {"dark": False, "card": "#FFFFFF", "card2": "#F2F2F7", "ink": "#161616", "muted": "#8A8A8E",
             "line": "#E5E5EA", "field": "#F2F2F7", "screen": "#FFFFFF", "bubble": "#E9E9EB", "outline": "#000000",
             "oal": 0xF0}
    p["card"] = _color(ctx, e.get("fill"), p["card"])
    p["ink"] = _color(ctx, e.get("color"), p["ink"])
    p["acc"] = _color(ctx, e.get("accent"), ctx.ui.get("blue", "#0A84FF"))
    return p


def _card(rig, x0, y0, w, h, r, pal, layer=20, shadow=True, **kw):
    path = rrect(w, h, r)
    if shadow:
        rig.shadow(path, x0, y0, layer=layer - 1, strength=0.75 if pal["dark"] else 1.0, **kw)
    rig.shape(path, x0, y0, pal["card"], layer=layer, outline=pal["outline"], bord=round(1.5 * rig.u, 1),
              oalpha=pal["oal"], **kw)


def _avatar(rig, ctx, x, y, d, name, fill, layer=24, ring=None, **kw):
    if ring:
        rig.shape(circle(d / 2 + ring[1]), x, y, ring[0], layer=layer, **kw)
    rig.shape(circle(d / 2), x, y, fill, layer=layer + 1, **kw)
    fs = d * 0.46
    rig.text(esc(_initial(name)), _st(ctx, F_HEAD, fs, _on(fill)), x, y + ctx.cap_shift(F_HEAD, fs), 5, layer + 2, **kw)


def _blink(rig, path, x, y, color, t0, t1, layer, period=0.5):
    t = t0
    while t < t1 - 0.02:
        rig.shape(path, x, y, color, layer=layer, t0=t, t1=min(t1, t + period))
        t += period * 2


def _typed_lines(rig, ctx, lines, times, t_end, x, y_first, lh, font, fs, color, layer, caret_col=None, maxw=None,
                 tail=False, blink_to=None, t_hide=None):
    """Type `lines` (already wrapped) char by char; caret follows; optional blinking caret afterwards."""
    u = ctx.u
    st = _st(ctx, font, fs, color)
    shift = ctx.cap_shift(font, fs)
    ch = fs * 1.18
    cw = max(2.0, 3.6 * u)
    caret = rrect(cw, ch, cw / 2)
    k = 0
    last = (x, y_first)
    for li, ln in enumerate(lines):
        yy = y_first + li * lh
        for i in range(1, len(ln) + 1):
            ta = times[k] if k < len(times) else t_end
            tb = times[k + 1] if k + 1 < len(times) else t_end
            k += 1
            vis = ln[:i]
            if tail and maxw:
                vis = _tail_fit(ctx, vis, font, fs, maxw)
            rig.text(esc(vis), st, x, yy + shift, 4, layer, t0=ta, t1=(t_hide or rig.b) if i == len(ln) else tb,
                     out=0.1 if (t_hide and i == len(ln)) else 0.0)
            if caret_col and tb > ta:
                cx_ = x + ctx.text_w(vis, font, fs) + 4 * u
                rig.shape(caret, cx_, yy - ch / 2, caret_col, layer=layer + 1, t0=ta, t1=tb)
                last = (cx_, yy)
    if caret_col and blink_to and blink_to > t_end:
        _blink(rig, caret, last[0], last[1] - ch / 2, caret_col, t_end, blink_to, layer + 1)
    return last


def _norm_msgs(v, n=6):
    out = []
    for i, m in enumerate(_list(v, n)):
        if isinstance(m, dict):
            side = str(m.get("from", m.get("side", "them"))).lower()
            text = m.get("text", "")
        else:
            side, text = ("them" if i % 2 == 0 else "me"), m
        text = _str(text, "", 160)
        if not text:
            continue
        out.append({"side": "me" if side in ("me", "right", "you", "self", "sent") else "them", "text": text})
    return out


def _bubble(rig, ctx, t0, bx, by, bw, bh, lines, fs, lh, padx, pady, side, fill, tcol, acc, layer, r, out=0.0, t1=None):
    pivot = (bx + bw, by + bh) if side == "me" else (bx, by + bh)
    kw = dict(t0=t0, t1=t1, anim="pop", adur=0.34, pivot=pivot, out=out)
    rig.shape(rrect(bw, bh, r), bx, by, fill, layer=layer, **kw)
    u = ctx.u
    tk = min(r * 0.9, 22 * u)
    if side == "me":
        tail = (f"m {_p(-tk * 1.2)} {_p(-tk * 1.1)} b {_p(-tk * 0.4)} {_p(-tk * 0.6)} {_p(0)} {_p(-tk * 0.3)} {_p(tk * 0.45)} 0 "
                f"b {_p(-tk * 0.3)} {_p(tk * 0.15)} {_p(-tk * 0.9)} {_p(-tk * 0.1)} {_p(-tk * 1.4)} {_p(-tk * 0.4)}")
        rig.shape(tail, bx + bw, by + bh, fill, layer=layer, **kw)
    else:
        tail = (f"m {_p(tk * 1.2)} {_p(-tk * 1.1)} b {_p(tk * 0.4)} {_p(-tk * 0.6)} {_p(0)} {_p(-tk * 0.3)} {_p(-tk * 0.45)} 0 "
                f"b {_p(tk * 0.3)} {_p(tk * 0.15)} {_p(tk * 0.9)} {_p(-tk * 0.1)} {_p(tk * 1.4)} {_p(-tk * 0.4)}")
        rig.shape(tail, bx, by + bh, fill, layer=layer, **kw)
    st = _st(ctx, F_BODY, fs, tcol)
    shift = ctx.cap_shift(F_BODY, fs)
    for j, ln in enumerate(lines):
        rig.text(ctx.markup(ln, tcol, acc if fill != acc else tcol), st, bx + padx, by + pady + lh * (j + 0.5) + shift, 4,
                 layer + 1, **kw)


def _layout_msgs(ctx, msgs, fs, maxbw, padx, pady, lh):
    out = []
    for m in msgs:
        lines, _ = _wrapn(ctx, m["text"], F_BODY, fs, maxbw - 2 * padx, 4, shrink=1.0)
        tw = max(ctx.text_w(ln, F_BODY, fs) for ln in lines)
        out.append(dict(m, lines=lines, w=tw + 2 * padx, h=len(lines) * lh + 2 * pady))
    return out


def _typing_dots(rig, ctx, t0, t1, bx, by, side, fill, dot_col, layer, k=1.0):
    u = ctx.u
    w, h = 132 * u * k, 82 * u * k
    pivot = (bx + w, by + h) if side == "me" else (bx, by + h)
    kw = dict(t0=t0, t1=t1, anim="pop", adur=0.28, pivot=pivot, out=0.12)
    rig.shape(rrect(w, h, h / 2), bx, by, fill, layer=layer, **kw)
    rig.shape(circle(10 * u * k), bx - 4 * u * k, by + h + 2 * u * k, fill, layer=layer, **kw)
    for i in range(3):
        cx = bx + w / 2 + (i - 1) * 30 * u * k
        cy = by + h / 2

        def bob(t, i=i, t0=t0):
            ph = ((t - t0) * 2.4 - i * 0.18) % 1.0
            v = max(0.0, math.sin(ph * math.pi * 2))
            return 0.0, -7 * u * k * v, 1.0, 0.45 + 0.55 * v
        rig.shape(circle(9 * u * k), cx, cy, dot_col, layer=layer + 1, dyn=bob, **kw)
    return w, h


# --------------------------------------------------------------------------- 1. phone

def ev_phone(ctx, e):
    u = ctx.u
    msgs = _norm_msgs(e.get("messages"))
    rows = [_str(x, "", 90) for x in _list(e.get("lines"), 7)]
    rows = [r for r in rows if r]
    mode = "lines" if (rows and not msgs) else "messages"
    if mode == "messages" and not msgs:
        msgs = _norm_msgs(["Did you finish the edit?", "Almost done, sending now", "Can't wait to see it!"])
    n_items = len(msgs) if mode == "messages" else len(rows)
    a, b = ev_window(ctx, e, min(9.0, 2.2 + 0.9 * n_items))
    D = b - a
    pal = _pal(ctx, e)
    sc = {"s": 0.82, "small": 0.82, "m": 1.0, "medium": 1.0, "l": 1.16, "large": 1.16}.get(str(e.get("size", "m")).lower())
    if sc is None:
        sc = _num(e.get("size"), 1.0, 0.5, 1.4)
    pw = 460 * u * sc
    ph = pw * 2.05
    avail = (ctx.safe_bottom - ctx.safe_top) * 0.97
    if ph > avail:
        pw, ph = pw * avail / ph, avail
    if pw > ctx.W * 0.62:
        ph, pw = ph * ctx.W * 0.62 / pw, ctx.W * 0.62
    k = pw / (460 * u)
    side = str(e.get("position", "right")).lower()
    if side not in ("left", "right", "center", "centre", "middle"):
        side = "right"
    m = ctx.W * 0.065
    cx = {"right": ctx.W - m - pw / 2, "left": m + pw / 2}.get(side, ctx.W / 2)
    if e.get("x") is not None:
        cx = xpos(ctx, e.get("x"), 0.5)
    cx = ctx.clamp_x(cx, pw)
    cy = ctx.clamp_y(ypos(ctx, e.get("y"), 0.47), ph)
    x0, y0 = cx - pw / 2, cy - ph / 2
    if side == "right":
        edx, edy = ctx.W - x0 + 60 * u, 0.0
    elif side == "left":
        edx, edy = -(x0 + pw + 60 * u), 0.0
    else:
        edx, edy = 0.0, ctx.H - y0 + 60 * u
    rig = _Rig(ctx, a, b, cx, cy, "slide", "slide", tin=0.62, tout=0.45, edx=edx, edy=edy, xdx=edx, xdy=edy)
    R = 0.16 * pw
    body = rrect(pw, ph, R)
    rig.shadow(body, x0, y0, layer=18, strength=1.1)
    btn = "#2C2C2E"
    for (bx_, by_, bh_) in ((x0 - 5 * u * k, y0 + 0.19 * ph, 0.065 * ph), (x0 - 5 * u * k, y0 + 0.27 * ph, 0.065 * ph),
                            (x0 + pw - 2 * u * k, y0 + 0.24 * ph, 0.11 * ph)):
        rig.shape(rrect(7 * u * k, bh_, 3 * u * k), bx_, by_, btn, layer=19)
    rig.shape(body, x0, y0, "#1B1B1D", layer=20, outline="#5A5A5E", bord=round(2 * u * k, 1), oalpha=0x40)
    bz = 0.034 * pw
    sx0, sy0, sw, sh = x0 + bz, y0 + bz, pw - 2 * bz, ph - 2 * bz
    sr = R - bz
    rig.shape(rrect(sw, sh, sr), sx0, sy0, pal["screen"], layer=21)
    ink = pal["ink"]
    # header
    top = sy0 + 0.125 * pw
    if mode == "messages":
        ad = 0.125 * pw
        nfs = 30 * u * k
        hb = top + ad + nfs * 1.9
        hdr = "#F5F5F7" if not pal["dark"] else "#161618"
        rig.shape(rrect(sw, hb - sy0, sr), sx0, sy0, hdr, layer=22)
        rig.shape(rect(sw, min(sr, (hb - sy0) / 2)), sx0, hb - min(sr, (hb - sy0) / 2), hdr, layer=22)
        title = _str(e.get("title"), "Alex", 28)
        _avatar(rig, ctx, cx, top + ad / 2, ad, title, "#A1A1A8" if not pal["dark"] else "#48484A", layer=23)
        title, nfs = _fit1(ctx, title, F_BODY, nfs, sw * 0.7)
        rig.text(esc(title), _st(ctx, F_BODY, nfs, ink), cx, top + ad + nfs * 0.95 + ctx.cap_shift(F_BODY, nfs), 5, 23)
    else:
        tfs = 52 * u * k
        title, tfs = _fit1(ctx, _str(e.get("title"), "Notes", 40), F_HEAD, tfs, sw * 0.84)
        rig.text(esc(title), _st(ctx, F_HEAD, tfs, ink), sx0 + 0.075 * pw, top + tfs * 0.55 + ctx.cap_shift(F_HEAD, tfs), 4, 23)
        hb = top + tfs * 1.4
    rig.shape(rect(sw, max(1.0, 1.6 * u)), sx0, hb, pal["line"], layer=23)
    # status bar + island
    iw, ih = 0.30 * pw, 0.082 * pw
    iy0 = sy0 + 0.026 * pw
    rig.shape(rrect(iw, ih, ih / 2), cx - iw / 2, iy0, "#000000", layer=24)
    iyc = iy0 + ih / 2
    sfs = 27 * u * k
    rig.text("9:41", _st(ctx, F_HEAD, sfs, ink), (sx0 + 0.06 * pw + cx - iw / 2) / 2, iyc + ctx.cap_shift(F_HEAD, sfs), 5, 24)
    xr = (cx + iw / 2 + sx0 + sw - 0.05 * pw) / 2
    bw_, bh_ = 5 * u * k, 3 * u * k
    sig = " ".join(rrect(bw_, (7 + 3 * i) * u * k, 1.5 * u * k, i * (bw_ + bh_), (9 - 3 * i) * u * k) for i in range(4))
    rig.shape(sig, xr - 40 * u * k, iyc - 8 * u * k, ink, layer=24)
    rig.shape(_rring(34 * u * k, 17 * u * k, 5 * u * k, 2.2 * u * k) + " " + rrect(24 * u * k, 9 * u * k, 2.5 * u * k, 5 * u * k, 4 * u * k) +
              " " + rrect(3 * u * k, 7 * u * k, 1.5 * u * k, 36 * u * k, 5 * u * k), xr + 2 * u * k, iyc - 8.5 * u * k, ink, layer=24)
    # home indicator
    rig.shape(rrect(0.34 * pw, 6 * u * k, 3 * u * k), cx - 0.17 * pw, sy0 + sh - 20 * u * k, ink, alpha=0x30, layer=24)
    ctop, cbot = hb + 26 * u * k, sy0 + sh - 52 * u * k
    t_first = a + min(0.8, D * 0.25)
    if mode == "messages":
        fs = 36 * u * k
        padx, pady, lh = 26 * u * k, 17 * u * k, fs * 1.26
        items = _layout_msgs(ctx, msgs, fs, sw * 0.76, padx, pady, lh)
        y = ctop
        placed = []
        for i, it in enumerate(items):
            if i and items[i - 1]["side"] != it["side"]:
                y += 10 * u * k
            if y + it["h"] > cbot:
                break
            placed.append((it, y))
            y += it["h"] + 12 * u * k
        step = _cl((b - 0.7 - t_first) / max(1, len(placed)), 0.3, 1.2)
        for i, (it, by) in enumerate(placed):
            t = t_first + i * step
            me = it["side"] == "me"
            bx = sx0 + sw - 20 * u * k - it["w"] if me else sx0 + 20 * u * k
            fill = pal["acc"] if me else pal["bubble"]
            tcol = _on(fill) if me else ink
            _bubble(rig, ctx, t, bx, by, it["w"], it["h"], it["lines"], fs, lh, padx, pady, it["side"], fill, tcol,
                    pal["acc"], 26, min(it["h"] / 2, 34 * u * k))
            _sub_sfx(ctx, e, t, "bubble" if me else "pop", 0.4)
    else:
        fs = 38 * u * k
        lh = fs * 1.28
        y = ctop
        lx = sx0 + 0.075 * pw + 26 * u * k
        maxw = sx0 + sw - 0.06 * pw - lx
        step = _cl((b - 0.8 - t_first) / max(1, len(rows)), 0.12, 0.45)
        for i, r_ in enumerate(rows):
            lines, rfs = _wrapn(ctx, r_, F_BODY, fs, maxw, 2, shrink=1.0)
            rh = len(lines) * lh + 30 * u * k
            if y + rh > cbot:
                break
            t = t_first + i * step
            kw = dict(t0=t, anim="rise", adur=0.35)
            rig.shape(circle(7 * u * k), sx0 + 0.075 * pw + 4 * u * k, y + 15 * u * k + lh / 2, pal["acc"], layer=26, **kw)
            st = _st(ctx, F_BODY, rfs, ink)
            for j, ln in enumerate(lines):
                rig.text(ctx.markup(ln, ink, pal["acc"]), st, lx, y + 15 * u * k + lh * (j + 0.5) + ctx.cap_shift(F_BODY, rfs), 4, 26, **kw)
            rig.shape(rect(sx0 + sw - lx, max(1.0, 1.5 * u)), lx, y + rh, pal["line"], layer=25, **kw)
            y += rh
            _sub_sfx(ctx, e, t, "tick", 0.25)
    rig.reg(x0, y0, x0 + pw, y0 + ph)
    rig.flush()
    _main_sfx(ctx, e, a, "whoosh", 0.45)
    return a, b


# --------------------------------------------------------------------------- 2. keyboard

_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
_FILLERS = ["the", "and", "I", "you", "is", "it", "so"]


def ev_keyboard(ctx, e):
    u = ctx.u
    text = _str(e.get("text"), "on my way!", 90)
    a, b = ev_window(ctx, e, _cl(1.8 + len(text) * 0.09, 3.0, 7.0))
    D = b - a
    pal = _pal(ctx, e)
    dark = pal["dark"]
    kw_ = min(ctx.W - 2 * 22 * u, 1040 * u)
    k = kw_ / (1040 * u)
    pad, gap = 14 * u * k, 12 * u * k
    kwid = (kw_ - 2 * pad - 9 * gap) / 10
    kh = kwid * 1.3
    pred_h = 92 * u * k
    rgap = 22 * u * k
    panel_h = pad + pred_h + 4 * kh + 3 * rgap + pad * 1.8
    fh = 108 * u * k
    fgap = 22 * u * k
    portrait = ctx.H > ctx.W
    bottom = ctx.safe_bottom - (0.02 if portrait else 0.01) * ctx.H
    total = fh + fgap + panel_h
    if bottom - total < ctx.safe_top:
        bottom = ctx.safe_top + total
    py0 = bottom - panel_h
    kx0 = (ctx.W - kw_) / 2
    fy0 = py0 - fgap - fh
    rig = _Rig(ctx, a, b, ctx.W / 2, py0 + panel_h / 2, "slide", "slide", tin=0.5, tout=0.38,
               edy=ctx.H - fy0 + 30 * u, xdy=ctx.H - fy0 + 30 * u)
    panel = "#2A2A2C" if dark else "#D4D6DC"
    keyc = "#5B5B5F" if dark else "#FFFFFF"
    spec = "#3C3C3F" if dark else "#ABB0BC"
    kshadow = "#101011" if dark else "#8C8F96"
    kink = "#FFFFFF" if dark else "#161616"
    rig.shadow(rrect(kw_, panel_h, 40 * u * k), kx0, py0, layer=18, strength=0.8)
    rig.shape(rrect(kw_, panel_h, 40 * u * k), kx0, py0, panel, layer=20, outline=pal["outline"], bord=round(1.5 * u, 1),
              oalpha=pal["oal"])
    keys = {}
    kr = 11 * u * k
    lfs = 46 * u * k
    lst = _st(ctx, F_BODY, lfs, kink)
    lshift = ctx.cap_shift(F_BODY, lfs)

    def key(x, y, w, label=None, fill=keyc, lab_fs=None, store=None):
        rig.shape(rrect(w, kh, kr), x, y + 3 * u * k, kshadow, layer=21)
        rig.shape(rrect(w, kh, kr), x, y, fill, layer=22)
        if label:
            if lab_fs:
                rig.text(esc(label), _st(ctx, F_BODY, lab_fs, kink), x + w / 2, y + kh / 2 + ctx.cap_shift(F_BODY, lab_fs), 5, 24)
            else:
                rig.text(esc(label), lst, x + w / 2, y + kh / 2 + lshift, 5, 24)
        if store:
            keys[store] = (x, y, w)

    ky = py0 + pad + pred_h
    for i, ch in enumerate(_ROWS[0]):
        key(kx0 + pad + i * (kwid + gap), ky, kwid, ch, store=ch)
    ky2 = ky + kh + rgap
    off = (kwid + gap) / 2
    for i, ch in enumerate(_ROWS[1]):
        key(kx0 + pad + off + i * (kwid + gap), ky2, kwid, ch, store=ch)
    ky3 = ky2 + kh + rgap
    lw = 7 * kwid + 6 * gap
    lx = kx0 + (kw_ - lw) / 2
    for i, ch in enumerate(_ROWS[2]):
        key(lx + i * (kwid + gap), ky3, kwid, ch, store=ch)
    sw_ = lx - 2 * gap - (kx0 + pad)
    key(kx0 + pad, ky3, sw_, fill=spec)
    rig.shape(_arrow_up(kh * 0.5) , kx0 + pad + sw_ / 2, ky3 + kh / 2, kink, layer=24)
    dx_ = lx + lw + 2 * gap
    key(dx_, ky3, sw_, fill=spec)
    s_ = kh * 0.42
    rig.shape(polygon([(-s_ * 0.62, 0), (-s_ * 0.25, -s_ * 0.36), (s_ * 0.6, -s_ * 0.36), (s_ * 0.6, s_ * 0.36), (-s_ * 0.25, s_ * 0.36)]),
              dx_ + sw_ / 2, ky3 + kh / 2, kink, layer=24)
    xs = s_ * 0.16
    rig.shape(thick_line(-xs, -xs, xs, xs, s_ * 0.09) + " " + thick_line(-xs, xs, xs, -xs, s_ * 0.09), dx_ + sw_ / 2 + s_ * 0.12,
              ky3 + kh / 2, spec, layer=25)
    ky4 = ky3 + kh + rgap
    inner = kw_ - 2 * pad
    w123 = (kwid + gap) * 2.5 - gap
    wsp = inner - 2 * w123 - 2 * gap
    sfs = 36 * u * k
    key(kx0 + pad, ky4, w123, "123", fill=spec, lab_fs=sfs)
    key(kx0 + pad + w123 + gap, ky4, wsp, "space", lab_fs=sfs, store=" ")
    key(kx0 + pad + w123 + gap + wsp + gap, ky4, w123, "return", fill=spec, lab_fs=sfs)
    # text field
    rig.shadow(rrect(kw_, fh, fh / 2), kx0, fy0, layer=18, strength=0.7)
    rig.shape(rrect(kw_, fh, fh / 2), kx0, fy0, pal["card"], layer=20, outline=pal["outline"], bord=round(1.5 * u, 1),
              oalpha=pal["oal"])
    tfs = 46 * u * k
    tx = kx0 + 40 * u * k
    bd = fh * 0.72
    maxw = kw_ - 40 * u * k - bd - 44 * u * k
    ts = a + min(0.75, D * 0.22)
    te_lim = b - max(0.5, D * 0.18)
    times, tend = _type_times(len(text), ts, min(te_lim, ts + len(text) * 0.13), 0.05, 0.13, seed=len(text))
    fyc = fy0 + fh / 2
    ph_txt = _str(e.get("placeholder"), "Message", 40)
    rig.text(esc(ph_txt), _st(ctx, F_BODY, tfs, pal["muted"]), tx, fyc + ctx.cap_shift(F_BODY, tfs), 4, 23,
             t1=times[0] if times else b)
    _typed_lines(rig, ctx, [text], times, b, tx, fyc, 0, F_BODY, tfs, pal["ink"], 23, caret_col=pal["acc"], maxw=maxw,
                 tail=True, blink_to=b)
    bcx = kx0 + kw_ - 14 * u * k - bd / 2
    t_btn = times[0] if times else ts
    rig.shape(circle(bd / 2), bcx, fyc, pal["acc"], layer=23, t0=t_btn, anim="pop", adur=0.3)
    rig.shape(_arrow_up(bd * 0.62), bcx, fyc, _on(pal["acc"]), layer=24, t0=t_btn, anim="pop", adur=0.3, pivot=(bcx, fyc))
    # predictive bar
    cellw = kw_ / 3
    pyc = py0 + pad + pred_h / 2 - 4 * u * k
    for i in (1, 2):
        rig.shape(rect(max(1.0, 2 * u), pred_h * 0.42), kx0 + cellw * i, pyc - pred_h * 0.21, kshadow, alpha=0x60, layer=22)
    pfs = 40 * u * k
    custom = [_str(s, "", 30) for s in _list(e.get("suggestions"), 3)]
    custom = [s for s in custom if s]
    words = [(m.start(), m.end()) for m in re.finditer(r"\S+", text)]

    def sugg(n):
        if custom:
            return (custom + ["", "", ""])[:3]
        typed = text[:n]
        cur = ""
        full = ""
        for (s0, s1) in words:
            if s0 < n <= s1:
                cur, full = text[s0:n], text[s0:s1]
        if not cur:
            return ["I", "The", "I'm"]
        full = re.sub(r"[^\w']+$", "", full) or full
        fill = _FILLERS[len(typed) % len(_FILLERS)]
        alt = full if full.lower() != cur.lower() else fill
        return [f"“{cur}”", alt, fill if alt != fill else "you"]
    bounds = [a] + times[1:] + [b] if times else [a, b]
    prev, seg0 = None, a
    segs = []
    for i in range(len(bounds) - 1):
        sg = sugg(i + 1 if times and bounds[i] >= times[0] else 0) if times else sugg(0)
        if sg != prev:
            if prev is not None:
                segs.append((seg0, bounds[i], prev))
            prev, seg0 = sg, bounds[i]
    if prev is not None:
        segs.append((seg0, b, prev))
    for (s0, s1, sg) in segs:
        for i, word in enumerate(sg):
            if not word:
                continue
            wd, wfs = _fit1(ctx, word, F_BODY, pfs, cellw - 30 * u * k)
            col = pal["ink"] if (i == 1 and not custom) or custom else (kink if dark else "#3A3A3C")
            rig.text(esc(wd), _st(ctx, F_BODY, wfs, col), kx0 + cellw * (i + 0.5), pyc + ctx.cap_shift(F_BODY, wfs), 5, 23,
                     t0=s0, t1=s1)
    # key presses
    pop_fs = 66 * u * k
    pst = _st(ctx, F_BODY, pop_fs, kink)
    for i, ch in enumerate(text):
        t = times[i]
        dur = _cl((times[i + 1] - t) if i + 1 < len(times) else 0.14, 0.07, 0.16)
        kk = keys.get(ch.upper())
        if not kk:
            continue
        x, y, w = kk
        if ch == " ":
            rig.shape(rrect(w, kh, kr), x, y, spec, layer=23, t0=t, t1=t + dur)
            continue
        pw_, ph_ = kwid * 1.42, kh * 1.3
        px = _cl(x + w / 2 - pw_ / 2, kx0 + 6 * u, kx0 + kw_ - pw_ - 6 * u)
        py = y - ph_ - 6 * u * k
        rig.shape(rrect(w, kh, kr), x, y, spec if not dark else "#7A7A7E", layer=23, t0=t, t1=t + dur)
        rig.shadow(rrect(pw_, ph_, 18 * u * k), px, py, layer=26, strength=0.6, t0=t, t1=t + dur)
        rig.shape(rrect(pw_, ph_, 18 * u * k), px, py, keyc, layer=27, t0=t, t1=t + dur)
        rig.text(esc(ch.upper()), pst, px + pw_ / 2, py + ph_ / 2 + ctx.cap_shift(F_BODY, pop_fs), 5, 28, t0=t, t1=t + dur)
    rig.reg(kx0, fy0, kx0 + kw_, py0 + panel_h)
    rig.flush()
    _main_sfx(ctx, e, a, "whoosh-fast", 0.4)
    if times:
        _typing_sfx(ctx, e, times[0], tend)
    return a, b


# --------------------------------------------------------------------------- 3. search

def ev_search(ctx, e):
    u = ctx.u
    text = _str(e.get("text"), "how to edit reels", 70)
    sugg = [_str(s, "", 70) for s in _list(e.get("suggestions"), 4)]
    sugg = [s for s in sugg if s]
    if not sugg:
        base = text.rstrip("?!. ")
        sugg = [f"{base} for beginners", f"{base} fast", f"{base} step by step"]
    a, b = ev_window(ctx, e, _cl(2.6 + len(text) * 0.07 + 0.3 * len(sugg), 3.5, 7.0))
    D = b - a
    pal = _pal(ctx, e)
    sw = _w(ctx, 0.86, 940)
    sh = 124 * u
    row_h = 100 * u
    gap = 16 * u
    dd_h = len(sugg) * row_h + 24 * u
    total = sh + gap + dd_h
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), sw)
    cyb = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.56), total)
    ytop = cyb - total / 2
    x0 = cx - sw / 2
    rig = _Rig(ctx, a, b, cx, ytop + sh / 2, "pop", "fade", tin=0.45)
    _card(rig, x0, ytop, sw, sh, sh / 2, pal, layer=20)
    pyc = ytop + sh / 2
    rig.shape(_mag_paths(50 * u), x0 + 60 * u, pyc, pal["muted"], layer=22)
    fs = 46 * u
    tx = x0 + 106 * u
    maxw = sw - 106 * u - 56 * u
    ts = a + min(0.55, D * 0.15)
    times, tend = _type_times(len(text), ts, min(b - D * 0.5, ts + len(text) * 0.1), 0.045, 0.11, seed=3)
    rig.text(esc(_str(e.get("placeholder"), "Search", 40)), _st(ctx, F_BODY, fs, pal["muted"]), tx, pyc + ctx.cap_shift(F_BODY, fs),
             4, 22, t1=times[0] if times else b)
    t_dd = min(tend + 0.2, b - 0.6)
    _typed_lines(rig, ctx, [text], times, b, tx, pyc, 0, F_BODY, fs, pal["ink"], 22, caret_col=pal["acc"], maxw=maxw,
                 tail=True, blink_to=t_dd)
    dy0 = ytop + sh + gap
    kw = dict(t0=t_dd, anim="drop", adur=0.3)
    _card(rig, x0, dy0, sw, dd_h, 40 * u, pal, layer=20, **kw)
    rfs = 42 * u
    sel = e.get("select", 0)
    sel = None if sel is False or sel is None else int(_num(sel, 0, 0, len(sugg) - 1))
    t_sel = t_dd + 0.5 + 0.08 * len(sugg) + 0.5
    if t_sel > b - 0.45:
        sel = None
    for i, s in enumerate(sugg):
        ry = dy0 + 12 * u + i * row_h
        rc = ry + row_h / 2
        kr = dict(t0=t_dd + 0.12 + i * 0.08, anim="rise", adur=0.3)
        if sel == i:
            rig.shape(rrect(sw - 24 * u, row_h - 8 * u, 28 * u), x0 + 12 * u, ry + 4 * u, pal["card2"], layer=21, t0=t_sel,
                      anim="fade", adur=0.15)
        rig.shape(_mag_paths(36 * u), x0 + 60 * u, rc, pal["muted"], layer=22, **kr)
        line, f2 = _fit1(ctx, s, F_BODY, rfs, sw - 106 * u - 80 * u)
        if line.lower().startswith(text.lower()) and text:
            mk = "{\\c" + c_tag(pal["muted"]) + "}" + esc(line[:len(text)]) + "{\\c" + c_tag(pal["ink"]) + "}" + esc(line[len(text):])
        else:
            mk = esc(line)
        rig.text(mk, _st(ctx, F_BODY, f2, pal["ink"]), tx, rc + ctx.cap_shift(F_BODY, f2), 4, 22, **kr)
        ax = x0 + sw - 56 * u
        al = 13 * u
        rig.shape(thick_line(al, al, -al, -al, 4.5 * u) + " " + polygon([(-al - 2 * u, -al - 2 * u), (al * 0.35, -al - 2 * u),
                                                                       (-al - 2 * u, al * 0.35)]), ax, rc, pal["muted"],
                  layer=22, **kr)
        if i:
            rig.shape(rect(sw - 106 * u - 30 * u, max(1.0, 1.5 * u)), tx, ry, pal["line"], layer=21, **kr)
    rig.reg(x0, ytop, x0 + sw, ytop + total)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.45)
    if times:
        _typing_sfx(ctx, e, times[0], tend)
    _sub_sfx(ctx, e, t_dd, "bubble", 0.3)
    if sel is not None:
        _sub_sfx(ctx, e, t_sel, "mouse-click", 0.55)
    return a, b


# --------------------------------------------------------------------------- 4. call

def ev_call(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 3.6)
    D = b - a
    light = str(e.get("theme", "dark")).lower() == "light"
    fill = _color(ctx, e.get("fill"), "#FFFFFF" if light else "#1C1C1E")
    ink = _color(ctx, e.get("color"), "#161616" if light else "#FFFFFF")
    sub_c = "#8A8A8E" if light else "#AEAEB2"
    name = _str(e.get("name", e.get("title")), "Alex", 40)
    sub = _str(e.get("sub"), "mobile", 40)
    cw = _w(ctx, 0.92, 990)
    ch = 196 * u
    if e.get("position", e.get("y")) is None:
        cy = ctx.safe_top + ch / 2 + 18 * u
    else:
        cy = ypos(ctx, e.get("position", e.get("y")), "top")
    cy = ctx.clamp_y(cy, ch)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), cw)
    x0, x1 = cx - cw / 2, cx + cw / 2
    declined = _bool(e.get("declined"), False)
    td = a + 0.6 * D
    bb = min(b, td + 0.34) if declined else b
    rig = _Rig(ctx, a, bb, cx, cy, "drop", "shrink" if declined else "up", tin=0.55, tout=0.3, edy=-(cy + ch), xdy=0)
    path = rrect(cw, ch, ch / 2)
    rig.shadow(path, x0, cy - ch / 2, layer=19, strength=0.9)
    rig.shape(path, x0, cy - ch / 2, fill, alpha=0x0A, layer=20, outline="#FFFFFF" if not light else "#000000",
              bord=round(1.5 * u, 1), oalpha=0xD0 if not light else 0xF0)
    pad, ad, bd, bgap = 34 * u, 128 * u, 112 * u, 24 * u
    _avatar(rig, ctx, x0 + pad + ad / 2, cy, ad, name, _color(ctx, e.get("avatar"), "#8E8E93" if not light else "#B9B9BF"), layer=21)
    acc_x = x1 - pad - bd / 2
    dec_x = acc_x - bd - bgap
    tx = x0 + pad + ad + 28 * u
    maxw = dec_x - bd / 2 - 22 * u - tx
    nfs = 50 * u
    name_l, nfs = _fit1(ctx, name, F_HEAD, nfs, maxw, 0.7)
    sfs = 38 * u
    sub_l, sfs = _fit1(ctx, sub, F_BODY, sfs, maxw, 0.8)
    rig.text(esc(name_l), _st(ctx, F_HEAD, nfs, ink), tx, cy - 24 * u + ctx.cap_shift(F_HEAD, nfs), 4, 22)
    rig.text(esc(sub_l), _st(ctx, F_BODY, sfs, sub_c), tx, cy + 32 * u + ctx.cap_shift(F_BODY, sfs), 4, 22)
    green, red = ctx.ui["green"], ctx.ui["red"]
    t_ring = a + 0.5

    def ripple(t, period=1.1):
        if t < t_ring:
            return None
        p = ((t - t_ring) % period) / period
        return 0.0, 0.0, 1.0 + 0.45 * _ease_out(p), (1 - p) * 0.9

    def breathe(t):
        if t < t_ring:
            return 0.0, 0.0, 1.0, 1.0
        p = ((t - t_ring) % 1.1) / 1.1
        return 0.0, 0.0, 1.0 + 0.05 * math.sin(p * math.pi) ** 2, 1.0

    def press(t):
        if not declined or t < td - 0.22:
            return 0.0, 0.0, 1.0, 1.0
        p = _cl((t - (td - 0.22)) / 0.22)
        return 0.0, 0.0, 1.0 - 0.14 * math.sin(p * math.pi), 1.0
    rig.shape(_ring(bd / 2, bd / 2 - 5 * u), acc_x, cy, green, layer=21, dyn=ripple, t1=td if declined else None)
    rig.shape(circle(bd / 2), acc_x, cy, green, layer=22, dyn=breathe)
    rig.shape(_handset(bd * 0.48), acc_x, cy, "#FFFFFF", layer=23, dyn=breathe)
    rig.shape(circle(bd / 2), dec_x, cy, red, layer=22, dyn=press)
    rig.shape(_handset(bd * 0.48), dec_x, cy + 2 * u, "#FFFFFF", layer=23, rot=-135, dyn=press)
    rig.reg(x0, cy - ch / 2, x1, cy + ch / 2)
    rig.flush()
    _main_sfx(ctx, e, a, "notification", 0.5)
    if declined and td < b - 0.3:
        _sub_sfx(ctx, e, td - 0.12, "click", 0.5)
        cfs = 42 * u
        label = _str(e.get("declined_text"), "Call declined", 40)
        label, cfs = _fit1(ctx, label, F_BODY, cfs, cw * 0.7)
        cd = 64 * u
        chh = 104 * u
        cw2 = 28 * u + cd + 22 * u + ctx.text_w(label, F_BODY, cfs) + 40 * u
        cx0 = cx - cw2 / 2
        rig2 = _Rig(ctx, td + 0.1, b, cx, cy, "pop", "up", tin=0.4, tout=0.3)
        rig2.shadow(rrect(cw2, chh, chh / 2), cx0, cy - chh / 2, layer=19, strength=0.8)
        rig2.shape(rrect(cw2, chh, chh / 2), cx0, cy - chh / 2, fill, alpha=0x0A, layer=20, outline="#FFFFFF" if not light else "#000000",
                   bord=round(1.5 * u, 1), oalpha=0xD0 if not light else 0xF0)
        rig2.shape(circle(cd / 2), cx0 + 28 * u + cd / 2, cy, red, layer=21)
        rig2.shape(_handset(cd * 0.5), cx0 + 28 * u + cd / 2, cy + 1 * u, "#FFFFFF", layer=22, rot=-135)
        rig2.text(esc(label), _st(ctx, F_BODY, cfs, ink), cx0 + 28 * u + cd + 22 * u, cy + ctx.cap_shift(F_BODY, cfs), 4, 22)
        rig2.reg(cx0, cy - chh / 2, cx0 + cw2, cy + chh / 2)
        rig2.flush()
        _sub_sfx(ctx, e, td + 0.1, "pop", 0.4)
    return a, b


# --------------------------------------------------------------------------- 5. voice note

def _dur_secs(s):
    m = re.fullmatch(r"\s*(\d+):(\d{1,2})\s*", str(s))
    if m:
        return int(m.group(1)) * 60 + int(m.group(2))
    return int(_num(s, 7, 1, 3599))


def ev_voice_note(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 4.0)
    D = b - a
    pal = _pal(ctx, e)
    total = _dur_secs(e.get("duration", "0:07"))
    vw = _w(ctx, 0.82, 840)
    vh = 168 * u
    side = str(e.get("side", "left")).lower()
    default_x = 0.5
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), default_x), vw)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), "upper"), vh)
    x0, y0 = cx - vw / 2, cy - vh / 2
    rig = _Rig(ctx, a, b, cx, cy, "pop", "fade", tin=0.45)
    _card(rig, x0, y0, vw, vh, 50 * u, pal, layer=20)
    pad = 30 * u
    pd = 100 * u
    ad = 88 * u
    if side == "right":
        av_x = x0 + pad + ad / 2
        play_x = x0 + vw - pad - pd / 2
        wx0, wx1 = av_x + ad / 2 + 28 * u, play_x - pd / 2 - 30 * u
    else:
        play_x = x0 + pad + pd / 2
        av_x = x0 + vw - pad - ad / 2
        wx0, wx1 = play_x + pd / 2 + 30 * u, av_x - ad / 2 - 28 * u
    _avatar(rig, ctx, av_x, cy, ad, e.get("name") or ctx.brand.get("name") or ctx.brand.get("handle") or "A",
            _color(ctx, e.get("avatar"), "#A1A1A8" if not pal["dark"] else "#48484A"), layer=22)
    rig.shape(circle(15 * u), av_x + ad * 0.36, cy + ad * 0.36, pal["card"], layer=25)
    rig.shape(circle(11 * u), av_x + ad * 0.36, cy + ad * 0.36, pal["acc"], layer=26)
    acc = pal["acc"]
    rig.shape(circle(pd / 2), play_x, cy, acc, layer=22)
    play = _bool(e.get("play"), True)
    tp = a + min(0.7, D * 0.2)
    L = max(0.3, min(float(total), b - tp - 0.45))
    tq = tp + L
    ic = _on(acc)
    tri = polygon([(-pd * 0.13, -pd * 0.2), (pd * 0.22, 0), (-pd * 0.13, pd * 0.2)])
    pause = rrect(pd * 0.1, pd * 0.38, pd * 0.04, -pd * 0.15, -pd * 0.19) + " " + rrect(pd * 0.1, pd * 0.38, pd * 0.04, pd * 0.05, -pd * 0.19)
    if play:
        rig.shape(tri, play_x + pd * 0.03, cy, ic, layer=23, t1=tp)
        rig.shape(pause, play_x, cy, ic, layer=23, t0=tp, t1=tq, anim="pop", adur=0.2)
        rig.shape(tri, play_x + pd * 0.03, cy, ic, layer=23, t0=tq, anim="pop", adur=0.2)
    else:
        rig.shape(tri, play_x + pd * 0.03, cy, ic, layer=23)
    wyc = cy - 16 * u
    bw = 7 * u
    step_ = 14 * u
    n = max(8, int((wx1 - wx0 + step_ - bw) / step_))
    rng = random.Random(int(_num(e.get("seed"), 11)) + n)
    hs, v = [], 0.5
    for i in range(n):
        v = _cl(0.55 * v + 0.45 * rng.uniform(0.15, 1.0), 0.15, 1.0)
        env = 0.55 + 0.45 * math.sin(math.pi * (i + 0.5) / n)
        hs.append(max(0.16, v * env))
    base = "#C7C7CC" if not pal["dark"] else "#5A5A5E"
    maxh = 64 * u
    ox = wx0 + ((wx1 - wx0) - ((n - 1) * step_ + bw)) / 2
    for i, hh in enumerate(hs):
        h = maxh * hh
        bx = ox + i * step_
        pth = rrect(bw, h, bw / 2, -bw / 2, -h / 2)
        rig.shape(pth, bx + bw / 2, wyc, base, layer=22)
        if play:
            tb = tp + L * (i + 0.5) / n

            def bump(t, tb=tb):
                p = (t - tb) / 0.25
                return 0.0, 0.0, 1.0 + (0.35 * math.sin(_cl(p) * math.pi) if 0 <= p <= 1 else 0.0), 1.0
            rig.shape(pth, bx + bw / 2, wyc, acc, layer=23, t0=tb, dyn=bump)
    if play:
        def knob(t):
            p = _cl((t - tp) / L)
            return (ox + p * ((n - 1) * step_ + bw)) - ox, 0.0, 1.0, 1.0
        rig.shape(circle(11 * u), ox, wyc, acc, layer=24, t0=tp, anim="pop", adur=0.2, dyn=knob)
    dfs = 34 * u
    dst = _st(ctx, F_BODY, dfs, pal["muted"])
    dy = cy + 46 * u + ctx.cap_shift(F_BODY, dfs)

    def fmt(s):
        return f"{int(s) // 60}:{int(s) % 60:02d}"
    if play:
        rig.text(fmt(total), dst, ox, dy, 4, 23, t1=tp)
        rig.text(lambda t: fmt(min(total, (t - tp) / L * total)), dst, ox, dy, 4, 23, t0=tp, t1=tq)
        rig.text(fmt(total), dst, ox, dy, 4, 23, t0=tq)
    else:
        rig.text(fmt(total), dst, ox, dy, 4, 23)
    rig.reg(x0, y0, x0 + vw, y0 + vh)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.45)
    if play:
        _sub_sfx(ctx, e, tp, "click", 0.45)
    return a, b


# --------------------------------------------------------------------------- 6. comment

def ev_comment(ctx, e):
    u = ctx.u
    text = _str(e.get("text"), "EDIT", 120)
    posted = _bool(e.get("posted"), True)
    a, b = ev_window(ctx, e, _cl(2.8 + len(text) * 0.08 + (1.4 if posted else 0), 3.5, 8.0))
    D = b - a
    pal = _pal(ctx, e)
    handle = str(ctx.brand.get("handle") or "").strip().lstrip("@")
    user = _str(e.get("user"), handle or "you", 30)
    cw = _w(ctx, 0.88, 940)
    pad, ad, ch = 28 * u, 84 * u, 148 * u
    post_fs = 44 * u
    post_w = ctx.text_w("Post", F_HEAD, post_fs)
    fx0 = pad + ad + 22 * u
    fw = cw - fx0 - pad - post_w - 26 * u
    fh = 96 * u
    cfs = 44 * u
    clh = cfs * 1.26
    hw = 70 * u
    tw_max = cw - fx0 - pad - hw
    clines, cfs = _wrapn(ctx, text, F_BODY, cfs, tw_max, 3)
    ufs = 36 * u
    pc_h = pad + ufs * 1.3 + 12 * u + len(clines) * clh + pad * 0.8
    pgap = 18 * u
    total = ch + ((pc_h + pgap) if posted else 0)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), cw)
    cyb = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.64), total)
    x0 = cx - cw / 2
    iy0 = cyb + total / 2 - ch
    rig = _Rig(ctx, a, b, cx, iy0 + ch / 2, "rise", "fade", tin=0.45)
    _card(rig, x0, iy0, cw, ch, 44 * u, pal, layer=20)
    icy = iy0 + ch / 2
    me_col = _color(ctx, e.get("avatar"), ctx.accent)
    _avatar(rig, ctx, x0 + pad + ad / 2, icy, ad, user, me_col, layer=21)
    rig.shape(rrect(fw, fh, fh / 2), x0 + fx0, icy - fh / 2, pal["field"], layer=21)
    tx = x0 + fx0 + 30 * u
    fs = 42 * u
    ts = a + min(0.6, D * 0.15)
    te_lim = (b - 1.6) if posted else (b - 0.6)
    times, tend = _type_times(len(text), ts, max(ts + 0.2, min(te_lim, ts + len(text) * 0.12)), 0.05, 0.12, seed=5)
    tpost = min(tend + 0.4, b - 0.9) if posted else b
    if posted and tpost <= tend:
        tpost = tend + 0.05
    rig.text(esc(_str(e.get("placeholder"), "Add a comment…", 40)), _st(ctx, F_BODY, fs, pal["muted"]), tx,
             icy + ctx.cap_shift(F_BODY, fs), 4, 22, t1=times[0] if times else b)
    if posted:
        rig.text(esc(_str(e.get("placeholder"), "Add a comment…", 40)), _st(ctx, F_BODY, fs, pal["muted"]), tx,
                 icy + ctx.cap_shift(F_BODY, fs), 4, 22, t0=tpost, anim="fade", adur=0.2)
    _typed_lines(rig, ctx, [text], times, tpost, tx, icy, 0, F_BODY, fs, pal["ink"], 22, caret_col=pal["acc"],
                 maxw=fw - 50 * u, tail=True, blink_to=tpost, t_hide=tpost if posted else None)
    pst_m = _st(ctx, F_HEAD, post_fs, pal["muted"])
    pst_a = _st(ctx, F_HEAD, post_fs, pal["acc"])
    px = x0 + cw - pad
    py = icy + ctx.cap_shift(F_HEAD, post_fs)
    t_on = times[0] if times else b
    rig.text("Post", pst_m, px, py, 6, 22, t1=t_on, alpha=0x50)

    def press(t):
        if not posted or t < tpost - 0.05:
            return 0.0, 0.0, 1.0, 1.0
        p = _cl((t - (tpost - 0.05)) / 0.22)
        return 0.0, 0.0, 1.0 - 0.12 * math.sin(p * math.pi), 1.0
    rig.text("Post", pst_a, px, py, 6, 22, t0=t_on, t1=tpost + 0.25 if posted else None, anim="fade", adur=0.15, dyn=press,
             pivot=(px - post_w / 2, py))
    if posted:
        rig.text("Post", pst_m, px, py, 6, 22, t0=tpost + 0.25, alpha=0x50)
        pc0 = iy0 - pgap - pc_h
        kw = dict(t0=tpost + 0.05, anim="rise", adur=0.38)
        _card(rig, x0, pc0, cw, pc_h, 40 * u, pal, layer=20, **kw)
        ay = pc0 + pad + ad / 2
        _avatar(rig, ctx, x0 + pad + ad / 2, ay, ad, user, me_col, layer=21, **kw)
        ux = x0 + fx0
        uy = pc0 + pad + ufs * 0.65
        ul, ufs2 = _fit1(ctx, user, F_HEAD, ufs, tw_max - 90 * u)
        rig.text(esc(ul), _st(ctx, F_HEAD, ufs2, pal["ink"]), ux, uy + ctx.cap_shift(F_HEAD, ufs2), 4, 22, **kw)
        rig.text("now", _st(ctx, F_BODY, ufs * 0.9, pal["muted"]), ux + ctx.text_w(ul, F_HEAD, ufs2) + 16 * u,
                 uy + ctx.cap_shift(F_BODY, ufs * 0.9), 4, 22, **kw)
        cst = _st(ctx, F_BODY, cfs, pal["ink"])
        for j, ln in enumerate(clines):
            yy = pc0 + pad + ufs * 1.3 + 12 * u + clh * (j + 0.5)
            rig.text(ctx.markup(ln, pal["ink"], pal["acc"]), cst, ux, yy + ctx.cap_shift(F_BODY, cfs), 4, 22, **kw)
        hx = x0 + cw - pad - 22 * u
        hy = pc0 + pc_h / 2
        hs = 40 * u
        th = tpost + 0.95
        rig.shape(_heart_outline(hs, 4 * u), hx, hy, pal["muted"], layer=22, t1=th if th < b - 0.3 else None, **kw)
        if th < b - 0.3:
            rig.shape(heart(hs), hx, hy, ctx.ui["red"], layer=22, t0=th, anim="spring", adur=0.4)
            _sub_sfx(ctx, e, th, "pop", 0.4)
        _sub_sfx(ctx, e, tpost - 0.05, "click", 0.5)
        _sub_sfx(ctx, e, tpost + 0.08, "bubble", 0.35)
        rig.reg(x0, pc0, x0 + cw, iy0 + ch, a=tpost)
    rig.reg(x0, iy0, x0 + cw, iy0 + ch)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.4)
    if times:
        _typing_sfx(ctx, e, times[0], tend)
    return a, b


# --------------------------------------------------------------------------- 7. prompt

def ev_prompt(ctx, e):
    u = ctx.u
    text = _str(e.get("text"), "Write a scroll-stopping hook for my next reel", 220)
    a, b = ev_window(ctx, e, _cl(2.4 + len(text) * 0.06, 3.5, 8.0))
    D = b - a
    pal = _pal(ctx, e)
    pw = _w(ctx, 0.88, 960)
    pad = 40 * u
    fs = 46 * u
    lh = fs * 1.32
    lines, fs = _wrapn(ctx, text, F_BODY, fs, pw - 2 * pad, 4)
    lh = fs * 1.32
    nl = max(2, len(lines))
    tb = 92 * u
    ph = pad + nl * lh + 18 * u + tb + 18 * u
    label = e.get("label", "AI")
    label = _str(label, "AI", 30) if label not in (False, None, "") else ""
    chh = 66 * u
    cgap = 18 * u
    total = ph + ((chh + cgap) if label else 0)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), pw)
    cyb = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.62), total)
    x0 = cx - pw / 2
    by0 = cyb + total / 2 - ph
    rig = _Rig(ctx, a, b, cx, by0 + ph / 2, "rise", "fade", tin=0.5)
    _card(rig, x0, by0, pw, ph, 48 * u, pal, layer=20)
    ink, acc = pal["ink"], pal["acc"]
    ty0 = by0 + pad + lh / 2
    tx = x0 + pad
    ts = a + min(0.75, D * 0.2)
    n = sum(len(ln) for ln in lines)
    tsend_lim = b - max(0.6, D * 0.15)
    times, tend = _type_times(n, ts, max(ts + 0.2, min(tsend_lim - 0.4, ts + n * 0.07)), 0.03, 0.075, seed=9)
    tsend = min(tend + 0.45, b - 0.4)
    rig.text(esc(_str(e.get("placeholder"), "Ask anything…", 50)), _st(ctx, F_BODY, fs, pal["muted"]), tx,
             ty0 + ctx.cap_shift(F_BODY, fs), 4, 22, t1=times[0] if times else b)
    ch_ = fs * 1.18
    caret = rrect(max(2.0, 3.6 * u), ch_, 2 * u)
    if times:
        _blink(rig, caret, tx - 2 * u, ty0 - ch_ / 2, ink, a + 0.3, times[0] - 0.02, 23, 0.32)
    _typed_lines(rig, ctx, lines, times, tend, tx, ty0, lh, F_BODY, fs, ink, 22, caret_col=ink, blink_to=b)
    # toolbar
    tyc = by0 + ph - 18 * u - tb / 2
    pd = 72 * u
    rig.shape(_ring(pd / 2, pd / 2 - 3 * u), x0 + pad - 4 * u + pd / 2, tyc, pal["line"], layer=22)
    pl = 13 * u
    rig.shape(rect(pl * 2, 4 * u, -pl, -2 * u) + " " + rect(4 * u, pl * 2, -2 * u, -pl), x0 + pad - 4 * u + pd / 2, tyc,
              pal["muted"], layer=22)
    sd = 84 * u
    sx = x0 + pw - pad + 4 * u - sd / 2
    on_fill = "#F4F3EF" if pal["dark"] else "#161616"
    off_fill = pal["line"]
    t_on = times[0] if times else b

    def press(t):
        if t < tsend:
            return 0.0, 0.0, 1.0, 1.0
        p = _cl((t - tsend) / 0.24)
        return 0.0, 0.0, 1.0 - 0.14 * math.sin(p * math.pi), 1.0
    rig.shape(circle(sd / 2), sx, tyc, off_fill, layer=22, t1=t_on)
    rig.shape(_arrow_up(sd * 0.58), sx, tyc, "#FFFFFF" if not pal["dark"] else "#8A8A8E", layer=23, t1=t_on)
    rig.shape(circle(sd / 2), sx, tyc, on_fill, layer=22, t0=t_on, anim="pop", adur=0.25, dyn=press)
    rig.shape(_arrow_up(sd * 0.58), sx, tyc, _on(on_fill), layer=23, t0=t_on, anim="pop", adur=0.25, dyn=press)
    if label:
        lfs = 36 * u
        lab, lfs = _fit1(ctx, label, F_HEAD, lfs, pw * 0.6)
        lw = 26 * u + 34 * u + 14 * u + ctx.text_w(lab, F_HEAD, lfs) + 30 * u
        ly0 = by0 - cgap - chh
        kw = dict(t0=a + 0.15, anim="pop", adur=0.35)
        rig.shadow(rrect(lw, chh, chh / 2), x0, ly0, layer=19, strength=0.6, **kw)
        rig.shape(rrect(lw, chh, chh / 2), x0, ly0, pal["card"], layer=20, outline=pal["outline"], bord=round(1.5 * u, 1),
                  oalpha=pal["oal"], pivot=(x0, ly0 + chh), **kw)
        for pth, _r in _icon("sparkle", 34 * u):
            rig.shape(pth, x0 + 26 * u + 17 * u, ly0 + chh / 2, acc, layer=21, pivot=(x0, ly0 + chh), **kw)
        rig.text(esc(lab), _st(ctx, F_HEAD, lfs, ink), x0 + 26 * u + 34 * u + 14 * u, ly0 + chh / 2 + ctx.cap_shift(F_HEAD, lfs),
                 4, 21, pivot=(x0, ly0 + chh), **kw)
    rig.reg(x0, cyb - total / 2, x0 + pw, by0 + ph)
    rig.flush()
    _main_sfx(ctx, e, a, "whoosh-fast", 0.35)
    if times:
        _typing_sfx(ctx, e, times[0], tend)
    if tsend < b - 0.3:
        _sub_sfx(ctx, e, tsend, "mouse-click", 0.5)
    return a, b


# --------------------------------------------------------------------------- 8. notification

def ev_notification(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 3.2)
    pal = _pal(ctx, e)
    app = _str(e.get("app"), ctx.brand.get("name") or "Messages", 30)
    title = _str(e.get("title"), "New message", 60)
    body = _str(e.get("body", e.get("text")), "Your reel just hit 10,000 views!", 160)
    nw = _w(ctx, 0.92, 990)
    pad = 32 * u
    isz = 100 * u
    tx_off = pad + isz + 26 * u
    tw = nw - tx_off - pad
    afs, tfs, bfs = 33 * u, 44 * u, 41 * u
    title_l, tfs = _fit1(ctx, title, F_HEAD, tfs, tw, 0.8)
    blines, bfs = _wrapn(ctx, body, F_BODY, bfs, tw, 2)
    blh = bfs * 1.28
    nh = pad + afs * 1.35 + 10 * u + tfs * 1.25 + len(blines) * blh + pad * 0.9
    nh = max(nh, isz + 2 * pad)
    if e.get("position", e.get("y")) is None:
        cy = ctx.safe_top + nh / 2 + 10 * u
    else:
        cy = ypos(ctx, e.get("position", e.get("y")), "top")
    cy = ctx.clamp_y(cy, nh)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), nw)
    x0, y0 = cx - nw / 2, cy - nh / 2
    rig = _Rig(ctx, a, b, cx, cy, "drop", "slide", tin=0.6, tout=0.35, edy=-(y0 + nh + 40 * u), xdy=-(y0 + nh + 40 * u))
    _card(rig, x0, y0, nw, nh, 46 * u, pal, layer=20)
    ic = _color(ctx, e.get("icon_color"), ctx.accent)
    ix, iy = x0 + pad, cy - isz / 2
    rig.shape(rrect(isz, isz, isz * 0.24), ix, iy, ic, layer=21)
    ifs = isz * 0.5
    rig.text(esc(_initial(e.get("icon") or app)), _st(ctx, F_HEAD, ifs, _on(ic)), ix + isz / 2, cy + ctx.cap_shift(F_HEAD, ifs), 5, 22)
    tx = x0 + tx_off
    y = y0 + pad + afs * 0.6
    now = _str(e.get("time"), "now", 12)
    nw_ = ctx.text_w(now, F_BODY, afs)
    app_l, afs2 = _fit1(ctx, app.upper(), F_BODY, afs, tw - nw_ - 20 * u)
    rig.text(esc(app_l), _st(ctx, F_BODY, afs2, pal["muted"]), tx, y + ctx.cap_shift(F_BODY, afs2), 4, 22)
    rig.text(esc(now), _st(ctx, F_BODY, afs, pal["muted"]), x0 + nw - pad, y + ctx.cap_shift(F_BODY, afs), 6, 22)
    y += afs * 0.75 + 10 * u + tfs * 0.62
    rig.text(esc(title_l), _st(ctx, F_HEAD, tfs, pal["ink"]), tx, y + ctx.cap_shift(F_HEAD, tfs), 4, 22)
    y += tfs * 0.62 + blh / 2
    bst = _st(ctx, F_BODY, bfs, pal["ink"])
    for j, ln in enumerate(blines):
        rig.text(ctx.markup(ln, pal["ink"], pal["acc"]), bst, tx, y + j * blh + ctx.cap_shift(F_BODY, bfs), 4, 22, alpha=0x18)
    rig.reg(x0, y0, x0 + nw, y0 + nh)
    rig.flush()
    _main_sfx(ctx, e, a, "notification", 0.5)
    return a, b


# --------------------------------------------------------------------------- 9. chat

def ev_chat(ctx, e):
    u = ctx.u
    msgs = _norm_msgs(e.get("messages"))
    if not msgs:
        msgs = _norm_msgs([{"from": "them", "text": "How do you edit so fast?"},
                           {"from": "me", "text": "One simple trick"},
                           {"from": "them", "text": "Teach me!!"}])
    n_them = sum(1 for m in msgs if m["side"] == "them")
    a, b = ev_window(ctx, e, min(9.0, 1.0 + 0.8 * len(msgs) + 0.6 * n_them))
    pal = _pal(ctx, e)
    cw = _w(ctx, 0.86, 920)
    fs = 44 * u
    padx, pady, lh = 32 * u, 20 * u, fs * 1.26
    items = _layout_msgs(ctx, msgs, fs, cw * 0.76, padx, pady, lh)
    gap_same, gap_diff = 10 * u, 22 * u
    avail = (ctx.safe_bottom - ctx.safe_top) * 0.9
    placed, total = [], 0.0
    for i, it in enumerate(items):
        g = 0 if not placed else (gap_same if items[i - 1]["side"] == it["side"] else gap_diff)
        if total + g + it["h"] > avail:
            break
        placed.append((it, total + g))
        total += g + it["h"]
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), cw)
    cyb = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.6), total)
    ytop = cyb - total / 2
    x0 = cx - cw / 2
    rig = _Rig(ctx, a, b, cx, cyb, "none", "fade", tout=0.32)
    them_fill = _color(ctx, e.get("them_color"), "#E9E9EB" if not pal["dark"] else "#2C2C2E")
    them_ink = _on(them_fill)
    me_fill = _color(ctx, e.get("me_color"), pal["acc"])
    t = a + 0.15
    nt = sum(1 for it, _ in placed if it["side"] == "them")
    budget = max(0.25, (b - 0.6 - t) / max(1, len(placed) + 0.7 * nt))
    for it, oy in placed:
        by = ytop + oy
        me = it["side"] == "me"
        if not me:
            tdur = _cl(budget * 0.7, 0.25, 0.9)
            if tdur >= 0.35:
                _typing_dots(rig, ctx, t, t + tdur, x0 + 14 * u, by + it["h"] - 82 * u, "them", them_fill, "#8E8E93", 24)
                t += tdur
        bx = x0 + cw - it["w"] if me else x0 + 14 * u
        fill = me_fill if me else them_fill
        tcol = _on(me_fill) if me else them_ink
        _bubble(rig, ctx, t, bx, by, it["w"], it["h"], it["lines"], fs, lh, padx, pady, it["side"], fill, tcol, pal["acc"], 26,
                min(it["h"] / 2, 40 * u))
        _sub_sfx(ctx, e, t, "bubble" if me else "pop", 0.4)
        t += budget
    rig.reg(x0, ytop, x0 + cw, ytop + total)
    rig.flush()
    return a, b


# --------------------------------------------------------------------------- 10. post card

def _parse_count(v, d):
    if v is None:
        return d
    if isinstance(v, (int, float)):
        return max(0.0, float(v))
    m = re.fullmatch(r"\s*([\d.,]+)\s*([kKmMbB]?)\s*", str(v))
    if not m:
        return d
    try:
        x = float(m.group(1).replace(",", ""))
    except ValueError:
        return d
    return x * {"": 1, "k": 1e3, "m": 1e6, "b": 1e9}[m.group(2).lower()]


def _fmt_count(v):
    v = max(0, int(round(v)))
    if v >= 1_000_000:
        s = f"{v / 1e6:.1f}".rstrip("0").rstrip(".")
        return s + "M"
    if v >= 10_000:
        return f"{v / 1e3:.1f}".rstrip("0").rstrip(".") + "K"
    return f"{v:,}"


def _ic_reply(s):
    t = s * 0.085
    w, h = s * 0.84, s * 0.66
    return (_rring(w, h, h * 0.45, t, -w / 2, -h / 2 - s * 0.06) + " " +
            polygon([(-s * 0.2, h / 2 - s * 0.08), (-s * 0.26, s * 0.44), (s * 0.02, h / 2 - s * 0.08)]))


def _ic_repost(s):
    t = s * 0.085
    hd = s * 0.15
    top = (thick_line(-s * 0.32, s * 0.12, -s * 0.32, -s * 0.22, t) + " " + thick_line(-s * 0.32 - t / 2, -s * 0.22, s * 0.22, -s * 0.22, t)
                   + " " + polygon([(s * 0.18, -s * 0.22 - hd), (s * 0.40, -s * 0.22), (s * 0.18, -s * 0.22 + hd)]))
    bot = (thick_line(s * 0.32, -s * 0.12, s * 0.32, s * 0.22, t) + " " + thick_line(s * 0.32 + t / 2, s * 0.22, -s * 0.22, s * 0.22, t)
           + " " + polygon([(-s * 0.18, s * 0.22 - hd), (-s * 0.40, s * 0.22), (-s * 0.18, s * 0.22 + hd)]))
    return top + " " + bot


def _ic_views(s):
    w = s * 0.14
    return " ".join(rrect(w, s * hh, w / 2, -s * 0.33 + i * s * 0.26, s * 0.36 - s * hh) for i, hh in enumerate((0.36, 0.66, 0.5)))


def ev_post_card(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 4.0)
    D = b - a
    pal = _pal(ctx, e)
    handle = str(ctx.brand.get("handle") or "").strip().lstrip("@")
    name = _str(e.get("name"), ctx.brand.get("name") or "Creator", 36)
    hdl = _str(e.get("handle"), "@" + (handle or "creator"), 30)
    if not hdl.startswith("@"):
        hdl = "@" + hdl
    text = _str(e.get("text"), "Consistency beats talent when talent isn't consistent.", 280)
    pw = _w(ctx, 0.88, 940)
    pad = 42 * u
    ad = 104 * u
    tfs = 46 * u
    tlh = tfs * 1.3
    lines, tfs = _wrapn(ctx, text, F_BODY, tfs, pw - 2 * pad, 6)
    tlh = tfs * 1.3
    cfs = 36 * u
    head_h = ad
    ph = pad + head_h + 26 * u + len(lines) * tlh + 30 * u + max(1.0, 1.5 * u) + 26 * u + 50 * u + pad * 0.8
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), pw)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.6), ph)
    x0, y0 = cx - pw / 2, cy - ph / 2
    rig = _Rig(ctx, a, b, cx, cy, "pop", "fade", tin=0.5)
    _card(rig, x0, y0, pw, ph, 44 * u, pal, layer=20)
    ink, muted = pal["ink"], pal["muted"]
    acy = y0 + pad + ad / 2
    _avatar(rig, ctx, x0 + pad + ad / 2, acy, ad, name, _color(ctx, e.get("avatar"), ctx.accent), layer=21)
    nx = x0 + pad + ad + 24 * u
    nfs = 44 * u
    verified = _bool(e.get("verified"), False)
    name_l, nfs = _fit1(ctx, name, F_HEAD, nfs, pw - (nx - x0) - pad - (60 * u if verified else 0) - 60 * u)
    rig.text(esc(name_l), _st(ctx, F_HEAD, nfs, ink), nx, acy - 22 * u + ctx.cap_shift(F_HEAD, nfs), 4, 22)
    if verified:
        vx = nx + ctx.text_w(name_l, F_HEAD, nfs) + 14 * u + 17 * u
        rig.shape(star(19 * u, 0, 0, 8, 0.82), vx, acy - 22 * u, pal["acc"], layer=22)
        rig.shape(check_path(26 * u, -13 * u, -13 * u), vx, acy - 22 * u, _on(pal["acc"]), layer=23)
    hfs = 36 * u
    hl, hfs = _fit1(ctx, hdl + " · " + _str(e.get("time"), "2h", 10), F_BODY, hfs, pw - (nx - x0) - pad - 60 * u)
    rig.text(esc(hl), _st(ctx, F_BODY, hfs, muted), nx, acy + 26 * u + ctx.cap_shift(F_BODY, hfs), 4, 22)
    for i in range(3):
        rig.shape(circle(4.5 * u), x0 + pw - pad - 6 * u - i * 16 * u, acy - 22 * u, muted, layer=22)
    ty = y0 + pad + head_h + 26 * u + tlh / 2
    tst = _st(ctx, F_BODY, tfs, ink)
    for j, ln in enumerate(lines):
        rig.text(ctx.markup(ln, ink, pal["acc"]), tst, x0 + pad, ty + j * tlh + ctx.cap_shift(F_BODY, tfs), 4, 22)
    ly = y0 + pad + head_h + 26 * u + len(lines) * tlh + 30 * u
    rig.shape(rect(pw - 2 * pad, max(1.0, 1.5 * u)), x0 + pad, ly, pal["line"], layer=21)
    ry = ly + 26 * u + 25 * u
    counts = [("reply", _parse_count(e.get("comments", e.get("replies")), 42)),
              ("repost", _parse_count(e.get("reposts"), 86)),
              ("like", _parse_count(e.get("likes"), 1240)),
              ("views", _parse_count(e.get("views"), 18400))]
    tick = _bool(e.get("tick"), True)
    liked = _bool(e.get("liked"), True)
    t0c = a + min(0.65, D * 0.2)
    trun = _cl(D * 0.4, 0.4, 1.6)
    tl_ = t0c + 0.35 if t0c + 0.35 < b - 0.4 else None
    slot = (pw - 2 * pad) / 4
    isz = 42 * u
    cst = _st(ctx, F_BODY, cfs, muted)
    red = ctx.ui["red"]
    for i, (kind, v) in enumerate(counts):
        ix = x0 + pad + i * slot + isz / 2
        if kind == "reply":
            rig.shape(_ic_reply(isz), ix, ry, muted, layer=22)
        elif kind == "repost":
            rig.shape(_ic_repost(isz), ix, ry, muted, layer=22)
        elif kind == "views":
            rig.shape(_ic_views(isz), ix, ry, muted, layer=22)
        else:
            if liked and tl_:
                rig.shape(_heart_outline(isz * 0.95, 4 * u), ix, ry + 4 * u, muted, layer=22, t1=tl_)
                rig.shape(heart(isz * 0.95), ix, ry + 4 * u, red, layer=22, t0=tl_, anim="spring", adur=0.4)
            else:
                rig.shape(_heart_outline(isz * 0.95, 4 * u), ix, ry + 4 * u, muted, layer=22)
        txx = ix + isz / 2 + 14 * u
        yy = ry + ctx.cap_shift(F_BODY, cfs)
        final = v + (1 if kind == "like" and liked else 0)
        if tick and v > 0:
            v0 = v * 0.82

            def val(t, v0=v0, final=final):
                p = _ease_out((t - t0c) / trun)
                return esc(_fmt_count(v0 + (final - v0) * p))
            rig.text(val, cst, txx, yy, 4, 22)
        else:
            rig.text(esc(_fmt_count(final)), cst, txx, yy, 4, 22)
        if kind == "like" and liked and tl_:
            rig.text(esc(_fmt_count(final)), _st(ctx, F_BODY, cfs, red), txx, yy, 4, 23, t0=max(tl_, t0c + trun))
    rig.reg(x0, y0, x0 + pw, y0 + ph)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.45)
    if liked and tl_:
        _sub_sfx(ctx, e, tl_, "bubble", 0.35)
    return a, b


# --------------------------------------------------------------------------- 11. browser

def ev_browser(ctx, e):
    u = ctx.u
    url = _str(e.get("url"), "yourwebsite.com", 60)
    a, b = ev_window(ctx, e, _cl(2.8 + len(url) * 0.05, 3.5, 7.0))
    D = b - a
    pal = _pal(ctx, e)
    portrait = ctx.H > ctx.W
    bw = min(_w(ctx, 0.9, 980), (ctx.W * 0.62) if not portrait else 1e9, 1250 * u)
    bh = min(bw * (0.86 if portrait else 0.66), (ctx.safe_bottom - ctx.safe_top) * 0.9)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), bw)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.5 if portrait else "center"), bh)
    x0, y0 = cx - bw / 2, cy - bh / 2
    rig = _Rig(ctx, a, b, cx, cy, "pop", "fade", tin=0.5)
    R = 30 * u
    _card(rig, x0, y0, bw, bh, R, pal, layer=20)
    tbh = 96 * u
    bar = "#F2F2F4" if not pal["dark"] else "#2C2C2E"
    rig.shape(rrect(bw, tbh + R, R), x0, y0, bar, layer=21)
    rig.shape(rect(bw, R), x0, y0 + tbh, pal["card"], layer=21)
    rig.shape(rect(bw, max(1.0, 1.5 * u)), x0, y0 + tbh, pal["line"], layer=22)
    for i, c in enumerate(("#FF5F57", "#FEBC2E", "#28C840")):
        rig.shape(circle(12 * u), x0 + 40 * u + i * 36 * u, y0 + tbh / 2, c, layer=22)
    ux0 = x0 + 170 * u
    uw = bw - 170 * u - 40 * u
    uh = 60 * u
    rig.shape(rrect(uw, uh, uh / 2), ux0, y0 + tbh / 2 - uh / 2, pal["card"] if not pal["dark"] else "#3A3A3C", layer=22)
    for pth, _r in _icon("lock", 26 * u):
        rig.shape(pth, ux0 + 34 * u, y0 + tbh / 2 + 2 * u, pal["muted"], layer=23)
    ufs = 34 * u
    utx = ux0 + 60 * u
    ts = a + min(0.55, D * 0.15)
    times, tend = _type_times(len(url), ts, min(b - D * 0.5, ts + len(url) * 0.06), 0.03, 0.07, seed=13)
    tload = min(tend + 0.2, b - 0.8)
    _typed_lines(rig, ctx, [url], times, b, utx, y0 + tbh / 2, 0, F_BODY, ufs, pal["ink"], 23, caret_col=pal["acc"],
                 maxw=uw - 90 * u, tail=True, blink_to=tload)
    ld = 0.55

    def lbar(t):
        p = _ease_out((t - tload) / ld)
        w_ = max(4 * u, bw * p)
        return rect(w_, 4 * u)

    def lfade(t):
        return 0.0, 0.0, 1.0, 1.0 - _cl((t - tload - ld) / 0.25)
    rig.shape(lbar, x0, y0 + tbh - 2 * u, pal["acc"], layer=23, t0=tload, t1=tload + ld + 0.3, dyn=lfade)
    # page
    pp = 48 * u
    px0 = x0 + pp
    pw_ = bw - 2 * pp
    py = y0 + tbh + 40 * u
    pbot = y0 + bh - 40 * u
    sk = pal["card2"] if not pal["dark"] else "#2C2C2E"
    tc = tload + 0.25
    title = _str(e.get("title"), "", 80)
    body = _str(e.get("text"), "", 200)
    els = []
    if title:
        tfs = 58 * u
        tl, tfs = _wrapn(ctx, title, F_HEAD, tfs, pw_, 2)
        for ln in tl:
            els.append(("text", ln, F_HEAD, tfs, pal["ink"], tfs * 1.22))
        els.append(("gap", 18 * u))
    else:
        els.append(("bar", pw_ * 0.62, 40 * u))
        els.append(("gap", 22 * u))
    if body:
        bfs = 40 * u
        bl, bfs = _wrapn(ctx, body, F_BODY, bfs, pw_, 3)
        for ln in bl:
            els.append(("text", ln, F_BODY, bfs, pal["muted"], bfs * 1.32))
        els.append(("gap", 26 * u))
    else:
        for wv in (0.94, 0.8):
            els.append(("bar", pw_ * wv, 22 * u))
            els.append(("gap", 16 * u))
        els.append(("gap", 14 * u))
    els.append(("hero", 0))
    for wv in (0.9, 0.7, 0.82):
        els.append(("gap", 18 * u))
        els.append(("bar", pw_ * wv, 22 * u))
    i_ = 0
    for el in els:
        if el[0] == "gap":
            py += el[1]
            continue
        kw = dict(t0=tc + 0.07 * i_, anim="rise", adur=0.35)
        i_ += 1
        if el[0] == "text":
            _, ln, fnt, fz, col, lhh = el
            if py + lhh > pbot:
                break
            rig.text(ctx.markup(ln, col, pal["acc"]), _st(ctx, fnt, fz, col), px0, py + lhh / 2 + ctx.cap_shift(fnt, fz), 4, 23, **kw)
            py += lhh
        elif el[0] == "bar":
            if py + el[2] > pbot:
                break
            rig.shape(rrect(el[1], el[2], el[2] / 2), px0, py, sk, layer=22, **kw)
            py += el[2]
        else:
            hh = min(pw_ * 0.46, pbot - py - 3 * 40 * u)
            if hh < 80 * u:
                continue
            rig.shape(rrect(pw_, hh, 24 * u), px0, py, sk, layer=22, **kw)
            icn = min(hh * 0.4, 120 * u)
            mc = "#C7C7CC" if not pal["dark"] else "#48484A"
            mx, my = px0 + pw_ / 2, py + hh / 2
            rig.shape(polygon([(-icn * 0.6, icn * 0.4), (-icn * 0.15, -icn * 0.2), (icn * 0.1, icn * 0.1), (icn * 0.3, -icn * 0.05),
                               (icn * 0.6, icn * 0.4)]), mx, my, mc, layer=23, **kw)
            rig.shape(circle(icn * 0.13), mx + icn * 0.25, my - icn * 0.32, mc, layer=23, **kw)
            py += hh
    rig.reg(x0, y0, x0 + bw, y0 + bh)
    rig.flush()
    _main_sfx(ctx, e, a, "whoosh", 0.4)
    if times:
        _typing_sfx(ctx, e, times[0], tend)
    _sub_sfx(ctx, e, tload, "click", 0.45)
    return a, b


# --------------------------------------------------------------------------- 12. cursor

_CURSOR = [(0, 0), (0, 17.6), (4.3, 13.7), (7.2, 20.5), (10.0, 19.3), (7.2, 12.7), (12.8, 12.7)]


def ev_cursor(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 3.6)
    D = b - a
    tg = e.get("target")
    vals = [0.28, 0.16, 0.44, 0.34]
    if isinstance(tg, (list, tuple)) and len(tg) >= 4:
        vals = [_num(tg[i], vals[i], 0.0, 1.0) for i in range(4)]
    fx, fy, fw, fh = vals
    tx0 = _cl(fx * ctx.W, ctx.W * 0.02, ctx.W * 0.9)
    ty0 = _cl(fy * ctx.H, ctx.H * 0.03, ctx.H * 0.85)
    tx1 = _cl((fx + max(0.03, fw)) * ctx.W, tx0 + 40 * u, ctx.W * 0.98)
    ty1 = _cl((fy + max(0.03, fh)) * ctx.H, ty0 + 40 * u, ctx.H * 0.92)
    acc = _color(ctx, e.get("color"), ctx.ui["blue"])
    label = _str(e.get("label"), "You", 24)
    click = _bool(e.get("click"), False)
    k = _cl((D - 0.35) / 2.6, 0.25, 1.0)
    t_arr = a + 0.95 * k
    t_d0 = t_arr + 0.12 * k
    t_d1 = t_d0 + 0.85 * k
    t_set = t_d1 + 0.45 * k
    P0 = (ctx.W + 90 * u, max(ty1, ctx.H * 0.62) + 120 * u)
    A, B = (tx0, ty0), (tx1, ty1)
    C = ((P0[0] + A[0]) / 2 + 60 * u, A[1] + (P0[1] - A[1]) * 0.15)
    rest = (B[0] + 34 * u, B[1] + 26 * u)

    def cpos(t):
        if t < t_arr:
            p = _ease_io((t - a) / max(0.01, t_arr - a))
            q = 1 - p
            return (q * q * P0[0] + 2 * q * p * C[0] + p * p * A[0], q * q * P0[1] + 2 * q * p * C[1] + p * p * A[1])
        if t < t_d0:
            return A
        if t < t_d1:
            p = _ease_io((t - t_d0) / (t_d1 - t_d0))
            return (A[0] + (B[0] - A[0]) * p, A[1] + (B[1] - A[1]) * p)
        p = _ease_out((t - t_d1) / max(0.01, t_set - t_d1))
        return (B[0] + (rest[0] - B[0]) * p, B[1] + (rest[1] - B[1]) * p)

    def corner(t):
        if t < t_d0:
            return A
        if t < t_d1:
            return cpos(t)
        return B
    rig = _Rig(ctx, a, b, ctx.W / 2, ctx.H / 2, "none", "fade", tout=0.32)
    sw_ = max(2.0, 3.5 * u)

    def box_path(t):
        x2, y2 = corner(t)
        if abs(x2 - A[0]) < 2 or abs(y2 - A[1]) < 2:
            return None
        xa, xb, ya, yb = min(A[0], x2), max(A[0], x2), min(A[1], y2), max(A[1], y2)
        return " ".join([rect(xb - xa, sw_, xa, ya - sw_ / 2), rect(xb - xa, sw_, xa, yb - sw_ / 2),
                         rect(sw_, yb - ya, xa - sw_ / 2, ya), rect(sw_, yb - ya, xb - sw_ / 2, ya)])

    def fill_path(t):
        x2, y2 = corner(t)
        if abs(x2 - A[0]) < 2 or abs(y2 - A[1]) < 2:
            return None
        return rect(abs(x2 - A[0]), abs(y2 - A[1]), min(A[0], x2), min(A[1], y2))
    rig.shape(fill_path, 0, 0, acc, alpha=0xE6, layer=20, t0=t_d0)
    rig.shape(box_path, 0, 0, acc, layer=21, t0=t_d0)
    hs = 20 * u
    for (hx, hy) in ((A[0], A[1]), (B[0], A[1]), (A[0], B[1]), (B[0], B[1])):
        rig.shape(rect(hs, hs, -hs / 2, -hs / 2), hx, hy, "#FFFFFF", layer=22, t0=t_d1, outline=acc, bord=round(3 * u, 1),
                  anim="spring", adur=0.3)
    # dimension chip
    dims_fixed = e.get("dims")
    dfs = 34 * u
    chh = 58 * u
    below = B[1] + 24 * u + chh <= ctx.safe_bottom

    def dim_txt(t):
        if dims_fixed:
            return esc(_str(dims_fixed, "", 24))
        x2, y2 = corner(t)
        return f"{abs(x2 - A[0]):.0f} × {abs(y2 - A[1]):.0f}"

    def chip_dyn(t):
        x2, y2 = corner(t)
        mx = (A[0] + x2) / 2
        my = (max(A[1], y2) + 22 * u + chh / 2) if below else (min(A[1], y2) - 22 * u - chh / 2)
        return mx, my

    def chip_path(t):
        w_ = ctx.text_w(dim_txt(t), F_HEAD, dfs) + 40 * u
        return rrect(w_, chh, 12 * u, -w_ / 2, -chh / 2)

    def chip_move(t):
        mx, my = chip_dyn(t)
        return mx, my, 1.0, 1.0
    t_chip = t_d0 + 0.15 * k
    rig.shape(chip_path, 0, 0, acc, layer=23, t0=t_chip, anim="fade", adur=0.15, dyn=chip_move)
    rig.text(dim_txt, _st(ctx, F_HEAD, dfs, "#FFFFFF"), 0, ctx.cap_shift(F_HEAD, dfs), 5, 24, t0=t_chip, anim="fade",
             adur=0.15, dyn=chip_move)
    # cursor
    cs = 3.3 * u
    cur = polygon([(x * cs, y * cs) for x, y in _CURSOR])
    lfs = 34 * u
    lw = ctx.text_w(label, F_HEAD, lfs) + 36 * u
    lh = 56 * u
    flip = rest[0] + 40 * u + lw > ctx.W * 0.98
    lox = -lw - 14 * u if flip else 32 * u
    loy = 62 * u

    def pressd(t):
        x, y = cpos(t)
        s = 1.0
        if t_arr - 0.05 <= t <= t_d0 + 0.12:
            s = 0.88
        return x, y, s, 1.0

    def follow(t):
        x, y = cpos(t)
        return x, y, 1.0, 1.0
    rig.shape(cur, 3 * u, 6 * u, "#000000", alpha=0xA0, blur=round(5 * u), layer=27, dyn=pressd, pivot=(0, 0))
    rig.shape(cur, 0, 0, "#FFFFFF", layer=28, outline="#161616", bord=round(2.6 * u, 1), dyn=pressd, pivot=(0, 0))
    rig.shape(rrect(lw, lh, lh / 2), lox, loy, acc, layer=28, dyn=follow)
    rig.text(esc(label), _st(ctx, F_HEAD, lfs, _on(acc)), lox + lw / 2, loy + lh / 2 + ctx.cap_shift(F_HEAD, lfs), 5, 29, dyn=follow)
    if click:
        def rip(t):
            p = (t - (t_arr - 0.03)) / 0.45
            if p > 1:
                return None
            return 0.0, 0.0, 0.35 + 1.0 * _ease_out(p), 1 - _cl(p)
        rig.shape(_ring(46 * u, 40 * u), A[0], A[1], acc, layer=26, t0=t_arr - 0.03, t1=t_arr + 0.45, dyn=rip)
        _sub_sfx(ctx, e, t_arr - 0.03, "mouse-click", 0.6)
    rig.reg(tx0 - 20 * u, ty0 - 20 * u, tx1 + 20 * u, ty1 + (90 * u if below else 20 * u))
    rig.flush()
    return a, b


# --------------------------------------------------------------------------- 13. poll

_DEF_PCT = {1: [100], 2: [68, 32], 3: [52, 31, 17], 4: [41, 27, 20, 12]}


def ev_poll(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 4.0)
    D = b - a
    pal = _pal(ctx, e)
    q = _str(e.get("question", e.get("title", e.get("text"))), "Would you try this?", 120)
    raw = _list(e.get("options"), 4) or ["Yes", "Not yet"]
    opts, pcts = [], []
    for o in raw:
        if isinstance(o, dict):
            opts.append(_str(o.get("text"), "", 50))
            pcts.append(o.get("percent"))
        else:
            opts.append(_str(o, "", 50))
            pcts.append(None)
    opts = [o or "—" for o in opts]
    ep = _list(e.get("percents", e.get("percent")), 4)
    for i in range(len(opts)):
        if pcts[i] is None and i < len(ep):
            pcts[i] = ep[i]
    if any(p is None for p in pcts):
        pcts = list(_DEF_PCT[len(opts)])
    pcts = [_num(p, 0, 0, 100) for p in pcts]
    win = max(range(len(pcts)), key=lambda i: pcts[i])
    vote = e.get("vote", win)
    vote = None if vote is False or vote is None else int(_num(vote, win, 0, len(opts) - 1))
    pw = _w(ctx, 0.8, 840)
    pad = 38 * u
    qfs = 50 * u
    qlines, qfs = _wrapn(ctx, q, F_HEAD, qfs, pw - 2 * pad, 3)
    qlh = qfs * 1.22
    oh, og = 100 * u, 18 * u
    ph = pad + len(qlines) * qlh + 30 * u + len(opts) * oh + (len(opts) - 1) * og + pad
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), pw)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.6), ph)
    x0, y0 = cx - pw / 2, cy - ph / 2
    rig = _Rig(ctx, a, b, cx, cy, "pop", "fade", tin=0.5)
    _card(rig, x0, y0, pw, ph, 44 * u, pal, layer=20)
    ink, acc = pal["ink"], pal["acc"]
    qst = _st(ctx, F_HEAD, qfs, ink)
    for j, ln in enumerate(qlines):
        rig.text(ctx.markup(ln, ink, acc), qst, cx, y0 + pad + qlh * (j + 0.5) + ctx.cap_shift(F_HEAD, qfs), 5, 22)
    tr = a + _cl(D * 0.42, 0.8, 2.2)
    tv = tr - 0.3
    fdur = 0.75
    ow = pw - 2 * pad
    ofs = 44 * u
    ost = _st(ctx, F_BODY, ofs, ink)
    pst = _st(ctx, F_HEAD, ofs, ink)
    oy = y0 + pad + len(qlines) * qlh + 30 * u
    orr = 28 * u
    for i, o in enumerate(opts):
        ry = oy + i * (oh + og)
        rc = ry + oh / 2
        rig.shape(rrect(ow, oh, orr), x0 + pad, ry, pal["field"], layer=21)
        frac = pcts[i] / 100.0
        tint = _mix(acc, pal["field"], 0.5 if i == win else 0.24)

        def bar(t, frac=frac):
            w_ = ow * frac * _ease_out((t - tr) / fdur)
            if w_ < 2 * u:
                return None
            return rrect(w_, oh, min(orr, w_ / 2))
        rig.shape(bar, x0 + pad, ry, tint, layer=22, t0=tr)
        pwid = ctx.text_w("100%", F_HEAD, ofs)
        ol, ofs2 = _fit1(ctx, o, F_BODY, ofs, ow - 60 * u - pwid - 70 * u)
        rig.text(ctx.markup(ol, ink, acc), ost if ofs2 == ofs else _st(ctx, F_BODY, ofs2, ink), x0 + pad + 30 * u,
                 rc + ctx.cap_shift(F_BODY, ofs2), 4, 23)

        def pct_txt(t, v=pcts[i]):
            return f"{v * _ease_out((t - tr) / fdur):.0f}%"
        rig.text(pct_txt, pst, x0 + pad + ow - 28 * u, rc + ctx.cap_shift(F_HEAD, ofs), 6, 23, t0=tr, anim="fade", adur=0.2)
        if vote == i:
            vx = x0 + pad + 30 * u + ctx.text_w(ol, F_BODY, ofs2) + 34 * u
            rig.shape(circle(19 * u), vx, rc, acc, layer=24, t0=tv, anim="spring", adur=0.35)
            rig.shape(check_path(28 * u, -14 * u, -14 * u), vx, rc, _on(acc), layer=25, t0=tv, anim="spring", adur=0.35,
                      pivot=(vx, rc))

            def rip(t, t0=tv):
                p = (t - t0) / 0.45
                if p > 1:
                    return None
                return 0.0, 0.0, 0.4 + 0.9 * _ease_out(p), 0.6 * (1 - _cl(p))
            rig.shape(_ring(oh * 0.6, oh * 0.6 - 5 * u), vx, rc, acc, layer=24, t0=tv, t1=tv + 0.45, dyn=rip)
    rig.reg(x0, y0, x0 + pw, y0 + ph)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.45)
    if vote is not None and tv < b - 0.3:
        _sub_sfx(ctx, e, tv, "mouse-click", 0.5)
    if tr < b - 0.3:
        _sub_sfx(ctx, e, tr, "whoosh-fast", 0.3)
    return a, b


# --------------------------------------------------------------------------- 14. question box

def ev_question(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 3.8)
    D = b - a
    pal = _pal(ctx, e)
    title = _str(e.get("title"), "Ask me a question", 70)
    text = _str(e.get("text"), "", 160)
    hdr = _color(ctx, e.get("header", e.get("color")), ctx.accent)
    hink = _on(hdr)
    pal["ink"] = "#F4F3EF" if pal["dark"] else "#161616"
    qw = _w(ctx, 0.8, 840)
    ad = 104 * u
    pad = 36 * u
    tfs = 50 * u
    tlines, tfs = _wrapn(ctx, title, F_HEAD, tfs, qw - 2 * pad, 2)
    tlh = tfs * 1.2
    hh = ad / 2 + 22 * u + len(tlines) * tlh + 30 * u
    bfs = 46 * u
    blh = bfs * 1.3
    blines, bfs = _wrapn(ctx, text, F_BODY, bfs, qw - 2 * pad - 60 * u, 3) if text else ([""], bfs)
    blh = bfs * 1.3
    fh = max(1, len(blines)) * blh + 56 * u
    qh = hh + pad + fh + pad
    total = qh + ad / 2
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), qw)
    cyb = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), 0.6), total)
    x0 = cx - qw / 2
    y0 = cyb + total / 2 - qh
    rig = _Rig(ctx, a, b, cx, y0 + qh / 2, "pop", "fade", tin=0.5)
    R = 44 * u
    _card(rig, x0, y0, qw, qh, R, pal, layer=20)
    rig.shape(rrect(qw, hh, R), x0, y0, hdr, layer=21)
    rig.shape(rect(qw, min(R, hh / 2)), x0, y0 + hh - min(R, hh / 2), hdr, layer=21)
    _avatar(rig, ctx, cx, y0, ad, ctx.brand.get("name") or ctx.brand.get("handle") or e.get("name") or "A",
            _color(ctx, e.get("avatar"), "#A1A1A8"), layer=23, ring=(pal["card"], 6 * u))
    tst = _st(ctx, F_HEAD, tfs, hink)
    for j, ln in enumerate(tlines):
        rig.text(ctx.markup(ln, hink, hink), tst, cx, y0 + ad / 2 + 22 * u + tlh * (j + 0.5) + ctx.cap_shift(F_HEAD, tfs), 5, 22)
    fy0 = y0 + hh + pad
    fw = qw - 2 * pad
    rig.shape(rrect(fw, fh, 30 * u), x0 + pad, fy0, pal["field"], layer=21)
    fx = x0 + pad + 30 * u
    fyl = fy0 + 28 * u + blh / 2
    if text:
        ts = a + min(0.7, D * 0.2)
        n = sum(len(ln) for ln in blines)
        times, tend = _type_times(n, ts, max(ts + 0.2, min(b - 0.6, ts + n * 0.08)), 0.035, 0.09, seed=17)
        lines_c = [ln.replace("*", "") for ln in blines]
        if len(blines) == 1 and fh:
            fyl = fy0 + fh / 2
        _typed_lines(rig, ctx, lines_c, times, tend, fx, fyl, blh, F_BODY, bfs, pal["ink"], 22, caret_col=pal["acc"],
                     blink_to=b)
        _typing_sfx(ctx, e, ts, tend)
    else:
        ph_ = _str(e.get("placeholder"), "Type something…", 50)
        rig.text(esc(ph_), _st(ctx, F_BODY, bfs, pal["muted"]), cx, fy0 + fh / 2 + ctx.cap_shift(F_BODY, bfs), 5, 22)
    rig.reg(x0, y0 - ad / 2, x0 + qw, y0 + qh)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.45)
    return a, b


# --------------------------------------------------------------------------- 15. sticker

_STICKER_DEF = {"location": "Your city", "link": "yourlink.com", "mention": "yourhandle", "hashtag": "trending",
                "music": "Original audio", "time": "9:41"}


def ev_sticker(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 2.6)
    pal = _pal(ctx, e)
    style = str(e.get("style", "location")).lower()
    if style not in _STICKER_DEF:
        style = "location"
    handle = str(ctx.brand.get("handle") or "").strip().lstrip("@")
    default = handle if (style == "mention" and handle) else _STICKER_DEF[style]
    text = _str(e.get("text"), default, 40)
    if style == "mention":
        text = text.lstrip("@")
    if style == "hashtag":
        text = text.lstrip("#")
    if style not in ("link", "music"):
        text = text.upper()
    sc = {"s": 0.8, "small": 0.8, "m": 1.0, "l": 1.22, "large": 1.22}.get(str(e.get("size", "m")).lower())
    if sc is None:
        sc = _num(e.get("size"), 1.0, 0.5, 1.8)
    fs = 50 * u * sc
    d = fs * 1.5
    vpad = 16 * u * sc
    h = d + 2 * vpad
    lp = vpad
    tgap = 18 * u * sc
    rp = 30 * u * sc
    text, fs2 = _fit1(ctx, text, F_HEAD, fs, ctx.W * 0.8 - (lp + d + tgap + rp), 0.7)
    w = lp + d + tgap + ctx.text_w(text, F_HEAD, fs2) + rp
    tilt = _num(e.get("tilt"), -4.0, -25, 25)
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), w + 20 * u)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), "top"), h + 30 * u)
    x0, y0 = cx - w / 2, cy - h / 2
    rig = _Rig(ctx, a, b, cx, cy, "spring", "shrink", tin=0.5, tout=0.28, rot=tilt, erot=14)
    R = min(h / 2, 30 * u * sc)
    rig.shadow(rrect(w, h, R), x0, y0, layer=19, strength=0.8)
    rig.shape(rrect(w, h, R), x0, y0, pal["card"], layer=20)
    badge = _color(ctx, e.get("badge", e.get("icon_color")), ctx.accent)
    ic = _on(badge)
    bx, by = x0 + lp + d / 2, cy
    rig.shape(circle(d / 2), bx, by, badge, layer=21)
    if style in ("mention", "hashtag"):
        g = "@" if style == "mention" else "#"
        gfs = d * 0.62
        rig.text(g, _st(ctx, F_HEAD, gfs, ic), bx, by + ctx.cap_shift(F_HEAD, gfs) - (gfs * 0.04 if g == "@" else 0), 5, 22)
    else:
        for pth, r_ in _icon(style, d * 0.62):
            rig.shape(pth, bx, by, ic, layer=22, rot=r_)
    rig.text(esc(text), _st(ctx, F_HEAD, fs2, pal["ink"]), x0 + lp + d + tgap, cy + ctx.cap_shift(F_HEAD, fs2), 4, 22)
    rig.reg(x0, y0, x0 + w, y0 + h)
    rig.flush()
    _main_sfx(ctx, e, a, "pop", 0.5)
    return a, b


# --------------------------------------------------------------------------- registry

EVENTS = {
    "phone": ev_phone,
    "keyboard": ev_keyboard,
    "search": ev_search,
    "call": ev_call,
    "voice_note": ev_voice_note,
    "comment": ev_comment,
    "prompt": ev_prompt,
    "notification": ev_notification,
    "chat": ev_chat,
    "post_card": ev_post_card,
    "browser": ev_browser,
    "cursor": ev_cursor,
    "poll": ev_poll,
    "question": ev_question,
    "story_sticker": ev_sticker,
}

DOCS = {
    "phone": "Phone mockup (rounded bezel + island) slides in showing a chat or a list. options: position left|right|center, "
             "y, size s|m|l, title (header), messages[] (strings alternate sides, or {from: me|them, text}; appear one "
             "by one), lines[] (generic rows; used when no messages), theme light|dark, accent.",
    "keyboard": "On-screen keyboard slides up; a text field above it types `text` with key-press pop-ups and a "
                "predictive bar. options: text, suggestions[3] (default: built from the typed word), placeholder, "
                "theme light|dark, accent.",
    "search": "Search bar types `text`, then a suggestions dropdown appears (one row gets tapped). options: text, "
              "suggestions[2–4], select (row index or false), placeholder, position, x, theme, accent.",
    "call": "Incoming-call banner (dark glass pill) with avatar, name, sub, red/green buttons; accept button breathes "
            "and rings. options: name, sub, declined (true → decline tap + 'Call declined' chip at 60%), "
            "declined_text, position, theme dark|light, avatar (colour).",
    "voice_note": "Voice-message bubble: play button, waveform that fills while playing, counting duration, avatar. "
                  "options: duration ('0:07'), play (default true), side left|right, name, position (default upper), "
                  "x, seed, theme, accent.",
    "comment": "Comment box types `text` ('Add a comment…' placeholder, Post turns blue), then posts it as a comment row "
               "with username + heart that gets liked. options: text, user (default brand handle or 'you'), posted "
               "(default true), placeholder, position, theme, accent.",
    "prompt": "AI chat prompt box: typed `text` with blinking caret, round send button (pressed at the end), optional "
              "label chip. options: text, label (default 'AI', false hides), placeholder, position, theme, accent.",
    "notification": "iOS-like notification banner drops in from the top with a bounce and slides out. options: app, "
                    "title, body, time ('now'), icon (letter), icon_color, position, theme light|dark.",
    "chat": "DM conversation: bubbles appear one by one (them = grey left, me = blue right) with a typing-dots "
            "indicator before each 'them' message. options: messages[] ({from: me|them, text} or alternating strings, "
            "max 6), position, x, theme, me_color, them_color.",
    "post_card": "Generic social post card: avatar, name, handle, text, reply/repost/like/views row; pops in, counts "
                 "tick up and the heart gets liked. options: name, handle, text, time, likes, reposts, comments, views "
                 "(numbers or '1.2K'), tick (true), liked (true), verified (false), position, theme.",
    "browser": "Browser window (traffic-light dots, URL bar types `url`, loading bar) then the page loads (skeleton "
               "blocks + optional title/text). options: url, title, text, position, x, theme light|dark, accent.",
    "cursor": "Live cursor with a name chip glides in, drags a selection box around `target` with corner handles and a "
              "live 'W × H' chip. options: target [x, y, w, h] fractions (default face area), label ('You'), click "
              "(ripple + mouse click), color (selection colour), dims (fixed chip text).",
    "poll": "Poll sticker: question + 2–4 options; a vote is tapped, then bars fill to their percentages. options: "
            "question, options[] (strings or {text, percent}), percents[], vote (index or false), position, theme, "
            "accent.",
    "question": "Question-box sticker: coloured header 'Ask me a question' with avatar, body field with typed `text` or "
                "a placeholder. options: title, text, placeholder, header (colour, default brand accent), position, "
                "theme.",
    "story_sticker": "Story-style tilted pill sticker with a drawn icon that springs in. options: style location|link|mention|"
               "hashtag|music|time, text, tilt (deg, default -4), size s|m|l, badge (icon colour), position (default "
               "top), x, theme light|dark.",
}

HIDE_CAPTIONS = {"phone", "keyboard", "search", "comment", "prompt", "chat", "post_card", "browser", "poll", "question"}
