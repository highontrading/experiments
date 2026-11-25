"""Data / info-graphic effects: bar & line charts, progress ring, stat bars, post wall, dial, agenda panel, timeline,
rating, versus, price tag, KPI tile and calendar.

Design: premium editorial info-graphics in a neutral palette (white / dark-glass panels, charcoal ink, grey grid lines)
with the brand accent used only for the key highlight. Every effect works with zero options
(`{"type": "bar_chart", "at": 2}`) and accepts `theme: light|dark`, `position`, `title`, custom data and `accent`.
"""
import calendar as _cal
import datetime
import math
import random
import re

from .core import FPS, resolve_font
from .fx_text import fmt_num
from .text import circle, esc, ev_window, rect, rrect, theme_color, xpos, ypos

FO = 220  # fade-out ms used by every element
FR = 1.0 / FPS
ARROW_CHARS = "↗↑⬆➚➶⤴⇧⬈"


# --------------------------------------------------------------------------- safe parsing

def _num(v, d):
    if v is None or isinstance(v, bool):
        return d
    if isinstance(v, str):
        s = v.strip().split("/")[0]
        s = re.sub(r"[^0-9.\-]", "", s)
        if s.count(".") > 1:
            s = s.replace(".", "", s.count(".") - 1)
        v = s
    try:
        x = float(v)
    except (TypeError, ValueError):
        return d
    if math.isnan(x) or math.isinf(x):
        return d
    return x


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


def _nums(v, maxn=8):
    """List of numbers or None."""
    if isinstance(v, str):
        v = [p for p in re.split(r"[;|\s]+", v) if p]
    if not isinstance(v, (list, tuple)):
        return None
    out = [_num(x, None) for x in v[:maxn]]
    out = [x for x in out if x is not None]
    return out or None


def _strs(v, maxn=8, maxlen=40):
    if isinstance(v, str):
        v = [p.strip() for p in v.split("|")]
    if not isinstance(v, (list, tuple)):
        return None
    out = [_trunc(str(x if x is not None else ""), maxlen) for x in v[:maxn]]
    return out or None


def _trunc(s, n):
    s = str(s).strip()
    return s if len(s) <= n else s[:n - 1].rstrip() + "…"


def _str(e, key, default, maxlen=40):
    if key not in e:
        return default
    v = e.get(key)
    if v is None or v is False:
        return ""
    return _trunc(str(v), maxlen)


def _ease(p):
    p = _clamp(p, 0.0, 1.0)
    return 1 - (1 - p) ** 3


def _ease_io(p):
    p = _clamp(p, 0.0, 1.0)
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def _ms(t):
    return int(round(t * 1000))


def _dec_for(vals):
    return 1 if any(abs(v - round(v)) > 1e-6 for v in vals) else 0


def _fmt(v, pre="", suf="", dec=0, indian=False, compact=False):
    if compact:
        x = abs(v)
        steps = [(1e7, "Cr"), (1e5, "L"), (1e3, "K")] if indian else [(1e9, "B"), (1e6, "M"), (1e3, "K")]
        for div, unit in steps:
            if x >= div:
                q = v / div
                s = f"{q:.1f}" if abs(q) < 100 else f"{q:.0f}"
                if s.endswith(".0"):
                    s = s[:-2]
                return f"{pre}{s}{unit}{suf}"
    return f"{pre}{fmt_num(v, dec, indian)}{suf}"


def _landscape(ctx):
    return ctx.W > ctx.H * 1.2


def _width(ctx, e, port, land, cap):
    frac = _num(e.get("width"), None)
    if frac is None:
        frac = land if _landscape(ctx) else port
    frac = _clamp(frac, 0.25, 0.96)
    return max(300 * ctx.u, min(ctx.W * frac, cap * ctx.u))


def _xp(ctx, v, d=0.5):
    try:
        if isinstance(v, bool) or not isinstance(v, (int, float, str, type(None))):
            v = None
        return xpos(ctx, v, d)
    except (TypeError, ValueError):
        return xpos(ctx, None, d)


def _yp(ctx, v, d):
    try:
        if isinstance(v, bool) or not isinstance(v, (int, float, str, type(None))):
            v = None
        return ypos(ctx, v, d)
    except (TypeError, ValueError):
        return ypos(ctx, None, d)


def _col(ctx, v, default):
    """User colour (hex or theme name) or the default when missing/invalid."""
    if not isinstance(v, str) or not v.strip():
        return default
    c = theme_color(ctx, v.strip())
    if not isinstance(c, str) or not re.fullmatch(r"#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", c.strip()):
        return default
    return c if c.startswith("#") else "#" + c


# --------------------------------------------------------------------------- colours

def _rgb(h):
    h = str(h or "#FFFFFF").strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if not re.fullmatch(r"[0-9a-fA-F]{6}", h):
        h = "FFFFFF"
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def _lum(h):
    def ch(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = _rgb(h)
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def _contrast(a, b):
    la, lb = _lum(a), _lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def _on(h):
    return "#161616" if _lum(h) > 0.33 else "#FFFFFF"


def _mix(a, b, t):
    ra, rb = _rgb(a), _rgb(b)
    return "#" + "".join(f"{int(round((x + (y - x) * t) * 255)):02X}" for x, y in zip(ra, rb))


def _pal(ctx, e, default="light"):
    th = str(e.get("theme") or default).lower()
    dark = th in ("dark", "glass", "dark-glass", "black", "night")
    acc = _col(ctx, e.get("accent"), ctx.accent)
    if dark:
        P = {"dark": True, "panel": "#18181A", "panel_a": 0x40, "ink": "#F4F3EF", "muted": "#A3A3A8", "grid": "#3A3A3D",
             "track": "#38383B", "bar": "#E4E2DC", "soft": "#2A2A2D", "glass": True}
    else:
        P = {"dark": False, "panel": "#FFFFFF", "panel_a": 0, "ink": "#161616", "muted": "#8A8A8E", "grid": "#ECEAE4",
             "track": "#EDEBE5", "bar": "#2B2B2E", "soft": "#F4F2ED", "glass": False}
        if th in ("paper", "cream"):
            P.update(panel=ctx.ui["paper"], grid="#E3E0D8", track="#E6E3DB", soft="#ECE9E1")
    if _col(ctx, e.get("fill"), None):
        P["panel"] = _col(ctx, e.get("fill"), P["panel"])
        P["dark"] = _lum(P["panel"]) < 0.3
        if P["dark"] and not dark:
            P.update(ink="#F4F3EF", muted="#A3A3A8", grid="#3A3A3D", track="#38383B", bar="#E4E2DC", soft="#2A2A2D")
    P["ink"] = _col(ctx, e.get("color"), P["ink"])
    P["accent"] = acc
    P["acc_text"] = acc if _contrast(acc, P["panel"]) >= 2.4 else P["ink"]
    P["on_acc"] = _on(acc)
    return P


# --------------------------------------------------------------------------- geometry

def _area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))


def _poly(pts):
    """Closed polygon, forced clockwise (on screen) so unions of sub-paths never punch holes (non-zero winding)."""
    if len(pts) < 3:
        return ""
    if _area(pts) < 0:
        pts = pts[::-1]
    return f"m {pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join(f"l {x:.1f} {y:.1f}" for x, y in pts[1:])


def _seg(x1, y1, x2, y2, w):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    return _poly([(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)])


def _polyline(pts, w, caps=True):
    parts = [_seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w) for i in range(len(pts) - 1)]
    joints = pts if caps else pts[1:-1]
    parts += [_circ(w / 2, x, y) for x, y in joints]
    return " ".join(p for p in parts if p)


def _circ(r, cx=0, cy=0, ccw=False):
    if not ccw:
        return circle(r, cx, cy)
    k = 0.5523
    return " ".join([f"m {cx:.1f} {cy - r:.1f}",
                     f"b {cx - r * k:.1f} {cy - r:.1f} {cx - r:.1f} {cy - r * k:.1f} {cx - r:.1f} {cy:.1f}",
                     f"b {cx - r:.1f} {cy + r * k:.1f} {cx - r * k:.1f} {cy + r:.1f} {cx:.1f} {cy + r:.1f}",
                     f"b {cx + r * k:.1f} {cy + r:.1f} {cx + r:.1f} {cy + r * k:.1f} {cx + r:.1f} {cy:.1f}",
                     f"b {cx + r:.1f} {cy - r * k:.1f} {cx + r * k:.1f} {cy - r:.1f} {cx:.1f} {cy - r:.1f}"])


def _ring(ro, ri, cx=0, cy=0):
    return _circ(ro, cx, cy) + " " + _circ(ri, cx, cy, ccw=True)


def _pt(cx, cy, r, deg):
    t = math.radians(deg)
    return cx + r * math.sin(t), cy - r * math.cos(t)


def _arc(cx, cy, ro, ri, d0, d1, step=3.0, caps=True):
    """Thick arc from angle d0 to d1 (degrees, 0 = 12 o'clock, clockwise)."""
    if d1 - d0 < 0.3:
        return ""
    if d1 - d0 >= 359.9:
        return _ring(ro, ri, cx, cy)
    n = max(2, int((d1 - d0) / step) + 2)
    outer = [_pt(cx, cy, ro, d0 + (d1 - d0) * i / (n - 1)) for i in range(n)]
    inner = [_pt(cx, cy, ri, d1 - (d1 - d0) * i / (n - 1)) for i in range(n)]
    p = _poly(outer + inner)
    if caps:
        rm, cr = (ro + ri) / 2, (ro - ri) / 2
        for d in (d0, d1):
            x, y = _pt(cx, cy, rm, d)
            p += " " + _circ(cr, x, y)
    return p


def _star(r, cx=0, cy=0, inner=0.47):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return _poly(pts)


def _check(s, cx=0, cy=0, w=None):
    """Drawn tick mark centred on (cx, cy), size s."""
    w = w or s * 0.17
    pts = [(cx - s * 0.36, cy + s * 0.02), (cx - s * 0.10, cy + s * 0.28), (cx + s * 0.40, cy - s * 0.26)]
    return _polyline(pts, w)


def _arrow_ur(s, cx=0, cy=0):
    """Up-right arrow (↗) drawn as a shape, centred."""
    w = s * 0.17
    a = (cx - s * 0.40, cy + s * 0.40)
    t = (cx + s * 0.40, cy - s * 0.40)
    shaft = _seg(a[0], a[1], t[0] - s * 0.12, t[1] + s * 0.12, w)
    head = _poly([(t[0] + w * 0.15, t[1] - w * 0.15), (t[0] + w * 0.15, t[1] + s * 0.50), (t[0] - s * 0.50, t[1] - w * 0.15)])
    return shaft + " " + head + " " + _circ(w / 2, a[0], a[1])


def _tri(s, cx=0, cy=0, up=True):
    k = 1 if up else -1
    return _poly([(cx, cy - k * s * 0.5), (cx + s * 0.58, cy + k * s * 0.45), (cx - s * 0.58, cy + k * s * 0.45)])


# --------------------------------------------------------------------------- tags / drawing helpers

def _anim(kind, x, y, u, dist=34):
    x, y = round(x), round(y)
    d = round(dist * u)
    if kind == "rise":
        return f"\\move({x},{y + d},{x},{y},0,380)"
    if kind == "drop":
        return f"\\move({x},{y - d},{x},{y},0,380)"
    if kind == "from-left":
        return f"\\move({x - d},{y},{x},{y},0,380)"
    if kind == "from-right":
        return f"\\move({x + d},{y},{x},{y},0,380)"
    if kind == "pop":
        return f"\\pos({x},{y})\\fscx40\\fscy40\\t(0,170,\\fscx110\\fscy110)\\t(170,270,\\fscx100\\fscy100)"
    if kind == "pop-big":
        return f"\\pos({x},{y})\\fscx20\\fscy20\\t(0,200,\\fscx118\\fscy118)\\t(200,320,\\fscx96\\fscy96)\\t(320,400,\\fscx100\\fscy100)"
    if kind == "grow":
        return f"\\pos({x},{y})\\fscx88\\fscy88\\t(0,320,0.5,\\fscx100\\fscy100)"
    return f"\\pos({x},{y})"


def _fad(fi, fo=FO):
    return f"\\fad({int(fi)},{int(fo)})"


def _shape(ctx, a, b, path, color, x=0, y=0, anim="none", fi=180, fo=FO, layer=6, alpha=0, extra="", blur=0,
           outline=None, bord=0):
    """Shape whose path is built around its own origin, placed at (x, y) (\\an7 → scale/rotate around origin)."""
    if b <= a or not path:
        return
    ctx.shape(a, b, path, color, alpha, "\\an7" + _anim(anim, x, y, ctx.u) + _fad(fi, fo) + extra, layer, blur=blur,
              outline=outline, bord=bord)


def _abs(ctx, a, b, path, color, fi=180, fo=FO, layer=6, alpha=0, extra="", blur=0, outline=None, bord=0):
    """Shape with a path in absolute screen coordinates."""
    if b <= a or not path:
        return
    ctx.shape(a, b, path, color, alpha, "\\an7\\pos(0,0)" + _fad(fi, fo) + extra, layer, blur=blur, outline=outline, bord=bord)


def _text(ctx, a, b, font, size, color, text, x, y, an=5, anim="none", fi=180, fo=FO, layer=9, extra="", raw=False):
    if b <= a or text is None or str(text) == "":
        return
    st = ctx.style(font, size, color, "#000000", 0, 0)
    yy = y + ctx.cap_shift(font, size)
    ctx.add(a, b, st, "{" + f"\\an{an}" + _anim(anim, x, yy, ctx.u) + _fad(fi, fo) + extra + "}" + (text if raw else esc(text)),
            layer)


def _fit(ctx, text, font, size, max_w, min_frac=0.62):
    text = str(text)
    s = size
    while ctx.text_w(text, font, s) > max_w and s > size * min_frac:
        s *= 0.94
    if ctx.text_w(text, font, s) > max_w:
        while len(text) > 1 and ctx.text_w(text + "…", font, s) > max_w:
            text = text[:-1]
        text = text.rstrip() + "…"
    return text, s


def _wrap(ctx, text, font, size, max_w, max_lines=2, min_frac=0.78):
    lines, fs = ctx.wrap(str(text), font, size, max_w, max_lines=max_lines, min_size=size * min_frac)
    lines = [ln for ln in lines if ln.strip()] or [""]
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip() + "…"
    out = []
    for ln in lines:
        t, s2 = _fit(ctx, ln.replace("*", ""), font, fs, max_w, 1.0)
        out.append(t)
    return out, fs


def _numfont(ctx, e, sample=""):
    k = resolve_font(e.get("font") or ctx.fkey("title"))
    adv = ctx.font(k).get("adv")
    if adv and any(ch not in adv for ch in str(sample) if not ch.isspace()):
        return "inter-extrabold"
    return k


def _body(ctx):
    return ctx.fkey("body")


def _label_font(ctx):
    k = ctx.fkey("body")
    return "inter-bold" if k == "inter-extrabold" else k


def _sfx(ctx, e, t, name, vol=0.45):
    if "sfx" in e and not e.get("sfx"):
        return
    if isinstance(e.get("sfx"), str):
        return
    ctx.extra_sfx.append((max(0.0, t), name, vol))


def _sfx_custom(ctx, e, a):
    s = e.get("sfx")
    if isinstance(s, str) and s.strip():
        ctx.extra_sfx.append((a, s.strip(), float(_num(e.get("sfx_volume"), 0.55))))


def _panel(ctx, a, b, cx, cy, w, h, P, radius=38, anim="rise", layer=4, register=True):
    u = ctx.u
    path = rrect(w, h, radius * u, -w / 2, -h / 2)
    if P["glass"]:
        ctx.video_requests.append({"kind": "blur_region", "a": a + 0.2, "b": max(a + 0.3, b - 0.12), "x": cx - w / 2,
                                   "y": cy - h / 2, "w": w, "h": h, "r": radius * u, "sigma": 24})
        _shape(ctx, a, b, path, P["panel"], cx, cy, anim, 260, FO, layer + 1, alpha=P["panel_a"], extra="\\3a&H9A&",
               outline="#FFFFFF", bord=max(1, round(1.6 * u)))
    else:
        _shape(ctx, a, b, path, "#000000", cx, cy + 16 * u, anim, 260, FO, layer, alpha=0xB0, blur=round(26 * u))
        _shape(ctx, a, b, path, P["panel"], cx, cy, anim, 260, FO, layer + 1, alpha=P["panel_a"])
    if register:
        ctx.register(a, b, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)


def _roll(ctx, t0, run, b, font, size, color, x, yfn, txtfn, an=5, layer=10, first="\\fad(140,0)", last="", ease=_ease):
    """Per-frame text (count-ups, labels riding on growing bars). yfn(p)/txtfn(p) get eased progress 0..1."""
    if t0 >= b:
        return
    n = max(1, int(run * FPS))
    st = ctx.style(font, size, color, "#000000", 0, 0)
    sh = ctx.cap_shift(font, size)
    for i in range(n + 1):
        p = ease(i / n)
        s0 = t0 + i * FR
        s1 = t0 + (i + 1) * FR if i < n else b
        if s0 >= b:
            break
        s1 = min(s1, b)
        tag = f"\\an{an}\\pos({x:.0f},{yfn(p) + sh:.0f})"
        if i == 0:
            tag += first
        if i == n or s1 >= b:
            tag += last + f"\\fad(0,{FO})"
        ctx.add(s0, s1, st, "{" + tag + "}" + esc(txtfn(p)), layer)
        if s1 >= b:
            break


class _Head:
    """Panel title (+ optional sub) measured first, drawn later."""

    def __init__(self, ctx, e, P, max_w, default=None, size=46):
        u = ctx.u
        self.title = _str(e, "title", default, 70)
        self.sub = _str(e, "sub", "", 90)
        self.font, self.sfont = _body(ctx), _label_font(ctx)
        self.lines, self.fs = ([], 0)
        self.slines, self.sfs = ([], 0)
        if self.title:
            self.lines, self.fs = _wrap(ctx, self.title, self.font, size * u, max_w, 2, 0.8)
        if self.sub:
            self.slines, self.sfs = _wrap(ctx, self.sub, self.sfont, 32 * u, max_w, 2, 0.85)
        self.lh, self.slh = self.fs * 1.18, self.sfs * 1.3
        self.h = 0
        if self.lines:
            self.h = len(self.lines) * self.lh + (len(self.slines) * self.slh + 8 * u if self.slines else 0) + 30 * u
        self.P = P

    def draw(self, ctx, a, b, left, top, layer=9):
        y = top + self.lh / 2
        for ln in self.lines:
            _text(ctx, a, b, self.font, self.fs, self.P["ink"], ln, left, y, an=4, anim="rise", fi=260, layer=layer)
            y += self.lh
        y += 8 * ctx.u - self.lh / 2 + self.slh / 2
        for ln in self.slines:
            _text(ctx, a + 0.06, b, self.sfont, self.sfs, self.P["muted"], ln, left, y, an=4, anim="rise", fi=260, layer=layer)
            y += self.slh


def _place(ctx, e, w, h, default_pos="lower", default_x=0.5):
    cx = ctx.clamp_x(_xp(ctx, e.get("x"), default_x), w)
    cy = ctx.clamp_y(_yp(ctx, e.get("position", e.get("y")), default_pos), h)
    return cx, cy


def _series(e, key="values", maxn=8):
    return _nums(e.get(key), maxn)


def _hi(e, vals):
    raw = e.get("highlight")
    best = vals.index(max(vals))
    if raw is False:
        return -1
    if raw is None:
        return best
    hi = int(_num(raw, best))
    if hi < 0:
        hi += len(vals)
    return hi if 0 <= hi < len(vals) else -1


def _affix(e, vals_default):
    pre = _str(e, "prefix", "", 6) or _str(e, "currency", "", 4)
    suf = _str(e, "suffix", "K" if vals_default else "", 8)
    dec = e.get("decimals")
    return pre, suf, dec


# =========================================================================== 1. bar_chart

def ev_bar_chart(ctx, e):
    u = ctx.u
    vals = _series(e, "values", 8)
    default = vals is None
    if default:
        vals = [18, 32, 27, 45, 72]
    n = len(vals)
    labels = _strs(e.get("labels"), 8, 20) or (["Jan", "Feb", "Mar", "Apr", "May"] if default else [])
    labels = (labels + [""] * n)[:n]
    pre, suf, dec = _affix(e, default)
    dec = int(_clamp(_num(dec, _dec_for(vals)), 0, 3))
    indian = bool(e.get("indian", "₹" in pre))
    a, b = ev_window(ctx, e, 4.6 + 0.2 * n)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.88, 0.5, 1000)
    pad = 52 * u
    head = _Head(ctx, e, P, w - 2 * pad, "Monthly views" if default else None)
    lab_fs = 34 * u
    h = w * 0.66 + head.h
    h = min(h, (ctx.safe_bottom - ctx.safe_top) * 0.94)
    cx, cy = _place(ctx, e, w, h)
    left, right, top = cx - w / 2 + pad, cx + w / 2 - pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P)
    head.draw(ctx, a + 0.12, b, left, top)
    chart_top = top + head.h + 62 * u
    base = cy + h / 2 - pad - lab_fs * 1.5
    hmax = max(40 * u, base - chart_top)
    # grid
    grid = " ".join(rect(right - left, max(1, 2 * u), left, base - hmax * k) for k in (1 / 3, 2 / 3, 1.0))
    _abs(ctx, a + 0.2, b, grid, P["grid"], 300, layer=6)
    _abs(ctx, a + 0.2, b, rect(right - left, max(2, 3 * u), left, base - 1.5 * u), P["muted"], 300, layer=6, alpha=0x70)
    slot = (right - left) / n
    bw = min(slot * 0.6, 150 * u)
    rad = min(14 * u, bw / 2)
    vmax = max(max(vals), 0)
    hi = _hi(e, vals)
    comp = bool(e.get("compact", max(abs(v) for v in vals) >= 100000))
    texts = [_fmt(v, pre, suf, dec, indian, comp) for v in vals]
    nfont = _numfont(ctx, e, "".join(texts))
    vfs = 40 * u
    for t in texts:
        vfs = min(vfs, _fit(ctx, t, nfont, 40 * u, slot * 0.96, 0.55)[1])
    lfont = _label_font(ctx)
    stg = min(0.2, 1.4 / n)
    g = 0.62
    t_start = a + 0.5
    for i, v in enumerate(vals):
        ti = t_start + i * stg
        xc = left + slot * (i + 0.5)
        hb = max(6 * u, hmax * max(0.0, v) / vmax) if vmax > 0 else 6 * u
        topb = base - hb
        rb = min(rad, hb / 2)
        path = rrect(bw, hb, rb, xc - bw / 2, topb) + " " + rect(bw, rb, xc - bw / 2, base - rb)
        col = P["accent"] if i == hi else P["bar"]
        x0, x1 = int(xc - bw / 2 - 2), int(xc + bw / 2 + 2)
        clip = (f"\\clip({x0},{int(base + 1)},{x1},{int(base + 1)})"
                f"\\t(0,{_ms(g)},0.55,\\clip({x0},{int(topb - 2)},{x1},{int(base + 1)}))")
        _abs(ctx, ti, b, path, col, 0, layer=7, extra=clip)
        vcol = P["acc_text"] if i == hi else P["ink"]
        _roll(ctx, ti, g, b, nfont, vfs, vcol, xc, lambda p, hb=hb: base - hb * p - 30 * u,
              lambda p, v=v: _fmt(v * p, pre, suf, dec, indian, comp), layer=9, ease=lambda q: q ** 0.55)
        if labels[i]:
            lt, lfs = _fit(ctx, labels[i], lfont, lab_fs, slot * 0.94, 0.7)
            _text(ctx, ti, b, lfont, lfs, P["ink"] if i == hi else P["muted"], lt, xc, base + lab_fs * 0.95, anim="rise",
                  fi=220, layer=9)
        _sfx(ctx, e, ti, "pop", 0.28)
    _sfx(ctx, e, t_start + (n - 1) * stg + g, "ding", 0.3)
    return a, b


# =========================================================================== 2. line_chart

def _chip(ctx, a, b, P, text, arrow, cx, cy, font, fs, layer=12, fill=None, ink=None):
    """Pill label (optional drawn ↗) rising in at (cx, cy). Returns (w, h)."""
    u = ctx.u
    fill = fill or P["accent"]
    ink = ink or _on(fill)
    tw = ctx.text_w(text, font, fs) if text else 0
    s = fs * 0.78
    gap = 12 * u if (text and arrow) else 0
    padx = 30 * u
    w = padx * 2 + tw + (gap + s if arrow else 0)
    h = fs * 1.75
    _shape(ctx, a, b, rrect(w, h, h / 2, -w / 2, -h / 2), "#000000", cx, cy + 8 * u, "rise", 200, layer=layer, alpha=0xB8,
           blur=round(14 * u))
    _shape(ctx, a, b, rrect(w, h, h / 2, -w / 2, -h / 2), fill, cx, cy, "rise", 200, layer=layer + 1)
    x0 = cx - w / 2 + padx
    if text:
        _text(ctx, a, b, font, fs, ink, text, x0, cy, an=4, anim="rise", fi=200, layer=layer + 2)
    if arrow:
        _shape(ctx, a, b, _arrow_ur(s), ink, x0 + tw + gap + s / 2, cy, "rise", 200, layer=layer + 2)
    return w, h


def _split_arrow(label):
    s = str(label)
    arrow = any(c in s for c in ARROW_CHARS)
    for c in ARROW_CHARS:
        s = s.replace(c, "")
    return s.strip(), arrow


def ev_line_chart(ctx, e):
    u = ctx.u
    vals = _series(e, "values", 12)
    default = vals is None
    if default:
        vals = [12, 18, 15, 26, 24, 38, 52]
    if len(vals) == 1:
        vals = [vals[0] * 0.5, vals[0]]
    n = len(vals)
    labels = _strs(e.get("labels"), 12, 12)
    if labels is None:
        labels = list("MTWTFSS") if n == 7 else []
    labels = (labels + [""] * n)[:n]
    a, b = ev_window(ctx, e, 5.0)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.88, 0.5, 1000)
    pad = 52 * u
    head = _Head(ctx, e, P, w - 2 * pad, "Weekly growth" if default else None)
    lab_fs = 32 * u
    h = min(w * 0.66 + head.h, (ctx.safe_bottom - ctx.safe_top) * 0.94)
    cx, cy = _place(ctx, e, w, h)
    left, right, top = cx - w / 2 + pad, cx + w / 2 - pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P)
    head.draw(ctx, a + 0.12, b, left, top)
    chart_top = top + head.h + 96 * u
    base = cy + h / 2 - pad - (lab_fs * 1.5 if any(labels) else 6 * u)
    # grid
    rows = 4
    grid = " ".join(rect(right - left, max(1, 2 * u), left, chart_top - 30 * u + (base - chart_top + 30 * u) * k / rows)
                    for k in range(rows + 1))
    _abs(ctx, a + 0.2, b, grid, P["grid"], 300, layer=6)
    lo, hi = min(vals), max(vals)
    span = (hi - lo) or max(abs(hi), 1)
    lo -= span * 0.18
    hi += span * 0.04
    px0, px1 = left + 16 * u, right - 16 * u
    pts = [(px0 + (px1 - px0) * i / (n - 1), base - (v - lo) / (hi - lo) * (base - chart_top)) for i, v in enumerate(vals)]
    lw = 8 * u
    t_l = a + 0.55
    T = _clamp(0.18 * n + 0.6, 1.0, 2.2)
    cx0, cx1 = int(px0 - lw * 2), int(px1 + lw * 2)
    clip = f"\\clip({cx0},0,{cx0},{ctx.H})\\t(0,{_ms(T)},\\clip({cx0},0,{cx1},{ctx.H}))"
    if e.get("area", True):
        area = _poly(pts + [(pts[-1][0], base), (pts[0][0], base)])
        _abs(ctx, t_l, b, area, P["accent"], 0, layer=7, alpha=0xD4 if P["dark"] else 0xC0, extra=clip)
    lcol = P["accent"]
    if not P["dark"] and _contrast(lcol, P["panel"]) < 1.6:
        # pale accent (e.g. yellow) on white: give the stroke a charcoal core so it reads
        _abs(ctx, t_l, b, _polyline(pts, lw + 5 * u), P["ink"], 0, layer=8, extra=clip)
    _abs(ctx, t_l, b, _polyline(pts, lw), lcol, 0, layer=8, extra=clip)

    def at_x(x):
        return t_l + T * (x - cx0) / max(1, (cx1 - cx0))

    lfont = _label_font(ctx)
    slot = (px1 - px0) / max(1, n - 1)
    for i, (x, y) in enumerate(pts):
        ti = at_x(x)
        if i < n - 1:
            _shape(ctx, ti, b, _circ(8 * u), P["panel"] if not P["glass"] else "#18181A", x, y, "pop", 80, layer=9,
                   outline=P["ink"] if not P["dark"] else P["accent"], bord=round(5 * u))
        if labels[i]:
            lt, lfs = _fit(ctx, labels[i], lfont, lab_fs, slot * 0.92, 0.7)
            _text(ctx, a + 0.3 + 0.04 * i, b, lfont, lfs, P["muted"], lt, x, base + lab_fs * 0.95, fi=250, layer=9)
    # last point: accent dot + pulse
    lx, ly = pts[-1]
    te = t_l + T
    _shape(ctx, te - 0.05, b, _circ(15 * u), P["accent"], lx, ly, "pop", 60, layer=10,
           outline=P["ink"] if not P["dark"] else None, bord=round(4 * u) if not P["dark"] else 0)
    for k in range(2):
        tp = te + 0.05 + k * 0.45
        _shape(ctx, tp, tp + 0.7, _circ(15 * u), P["accent"], lx, ly, "none", 0, 0, layer=9, alpha=0x40,
               extra="\\t(0,700,\\fscx320\\fscy320\\1a&HFF&)")
    label = e.get("label", "SCALE ↗")
    if label:
        text, arrow = _split_arrow(_trunc(label, 24))
        cfont = _numfont(ctx, e, text)
        cfs = 40 * u
        text, cfs = _fit(ctx, text, cfont, cfs, w * 0.6, 0.7) if text else ("", cfs)
        tw = ctx.text_w(text, cfont, cfs) if text else 0
        cw = 60 * u + tw + ((12 * u if text else 0) + cfs * 0.78 if arrow else 0)
        ch = cfs * 1.75
        ccx = _clamp(lx - cw / 2 + 24 * u, cx - w / 2 + 20 * u + cw / 2, cx + w / 2 - 16 * u - cw / 2)
        ccy = ly - 44 * u - ch / 2
        if ccy - ch / 2 < top + head.h - 6 * u:
            ccy = ly + 44 * u + ch / 2
        _chip(ctx, te + 0.08, b, P, text, arrow, ccx, ccy, cfont, cfs)
        _sfx(ctx, e, te + 0.08, "success", 0.38)
    _sfx(ctx, e, t_l, "whoosh", 0.22)
    return a, b


# =========================================================================== 3. progress_ring

def ev_progress_ring(ctx, e):
    u = ctx.u
    val = _clamp(_num(e.get("value"), 75), 0, 100)
    a, b = ev_window(ctx, e, 4.0)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    R = _clamp(_num(e.get("radius"), 165), 90, 260) * u
    th = R * 0.19
    pad = 58 * u
    w = max(2 * R + 2 * pad + 40 * u, _num(e.get("width"), 0) * ctx.W)
    w = min(w, ctx.W * 0.9)
    head = _Head(ctx, e, P, w - 2 * pad, None, 42)
    lfont = _label_font(ctx)
    label = _str(e, "label", "Completed", 60)
    llines, lfs = _wrap(ctx, label, lfont, 36 * u, w - 2 * pad, 2) if label else ([], 0)
    llh = lfs * 1.25
    h = pad + head.h + 2 * R + (28 * u + len(llines) * llh if llines else 0) + pad
    cx, cy = _place(ctx, e, w, h)
    top = cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P, radius=44)
    head.draw(ctx, a + 0.12, b, cx - w / 2 + pad, top)
    rcx, rcy = cx, top + head.h + R
    _abs(ctx, a + 0.15, b, _ring(R, R - th, rcx, rcy), P["track"], 300, layer=7)
    t0 = a + 0.5
    run = 0.5 + 1.3 * val / 100
    nfr = max(1, int(run * FPS))
    for i in range(nfr + 1):
        p = _ease(i / nfr)
        s0 = t0 + i * FR
        if s0 >= b:
            break
        s1 = min(b, t0 + (i + 1) * FR) if i < nfr else b
        path = _arc(rcx, rcy, R, R - th, 0, 360 * val / 100 * p, 3.0)
        if path:
            ctx.shape(s0, s1, path, P["accent"], 0, "\\an7\\pos(0,0)" + (f"\\fad(0,{FO})" if i == nfr else ""), 8)
    suf = _str(e, "suffix", "%", 4)
    dec = int(_clamp(_num(e.get("decimals"), _dec_for([val])), 0, 2))
    nfont = _numfont(ctx, e, suf)
    nt = _fmt(val, "", suf, dec)
    _, nfs = _fit(ctx, nt, nfont, R * 0.62, (R - th) * 1.55, 0.4)
    _roll(ctx, t0, run, b, nfont, nfs, P["ink"], rcx, lambda p: rcy, lambda p: _fmt(val * p, "", suf, dec), layer=10,
          last="\\fscx110\\fscy110\\t(0,180,\\fscx100\\fscy100)")
    y = rcy + R + 28 * u + llh / 2
    for ln in llines:
        _text(ctx, a + 0.35, b, lfont, lfs, P["muted"], ln, cx, y, anim="rise", fi=260, layer=9)
        y += llh
    for k in range(int(run / 0.32)):
        _sfx(ctx, e, t0 + 0.1 + k * 0.32, "tick", 0.16)
    _sfx(ctx, e, t0 + run, "success" if val >= 100 else "ding", 0.36)
    return a, b


# =========================================================================== 4. stat_bars

def _items_pairs(e, maxn=6):
    items = e.get("items")
    out = []
    if isinstance(items, (list, tuple)):
        for it in items[:maxn]:
            if isinstance(it, dict):
                lab = it.get("label", it.get("name", it.get("text", "")))
                out.append((_trunc(lab, 64), _num(it.get("value", it.get("v")), 0)))
            elif isinstance(it, (list, tuple)) and it:
                out.append((_trunc(it[0], 64), _num(it[1] if len(it) > 1 else 0, 0)))
            elif isinstance(it, str):
                m = re.match(r"(.*?)[:=]\s*([-\d.,]+)\s*%?$", it)
                if m:
                    out.append((_trunc(m.group(1), 64), _num(m.group(2), 0)))
    if not out:
        vals = _nums(e.get("values"), maxn)
        labs = _strs(e.get("labels"), maxn, 30)
        if vals:
            labs = (labs or []) + [""] * len(vals)
            out = list(zip(labs[:len(vals)], vals))
    return out


def ev_stat_bars(ctx, e):
    u = ctx.u
    items = _items_pairs(e)
    default = not items
    if default:
        items = [("Instagram", 82), ("YouTube", 64), ("TikTok", 47), ("LinkedIn", 21)]
    n = len(items)
    vals = [v for _, v in items]
    vmax = _num(e.get("max"), None)
    if vmax is None:
        vmax = 100 if max(vals) <= 100 else max(vals)
    vmax = max(vmax, 1e-9)
    pre = _str(e, "prefix", "", 6)
    suf = _str(e, "suffix", "%" if vmax == 100 else "", 8)
    dec = int(_clamp(_num(e.get("decimals"), _dec_for(vals)), 0, 2))
    indian = bool(e.get("indian", "₹" in pre))
    a, b = ev_window(ctx, e, 2.4 + 0.5 * n + 1.2)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.86, 0.5, 960)
    pad = 52 * u
    head = _Head(ctx, e, P, w - 2 * pad, "Where my audience is" if default else None)
    lfs, bh = 38 * u, 20 * u
    pre_texts = [_fmt(v, pre, suf, dec, indian) for v in vals]
    nfont = _numfont(ctx, e, "".join(pre_texts))
    widest = max(ctx.text_w(t, nfont, lfs) for t in pre_texts)
    lfont = _body(ctx)
    lw_max = w - 2 * pad - widest - 30 * u
    wrapped = [_wrap(ctx, lab, lfont, lfs, lw_max, 2, 0.82) for lab, _ in items]
    llh = lfs * 1.2
    row_hs = [len(ln) * llh + 16 * u + bh + 34 * u for ln, _ in wrapped]
    h = pad + head.h + sum(row_hs) - 34 * u + pad
    cx, cy = _place(ctx, e, w, h)
    left, right, top = cx - w / 2 + pad, cx + w / 2 - pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P)
    head.draw(ctx, a + 0.12, b, left, top)
    hi = _hi(e, vals)
    stg = min(0.5, 2.2 / n)
    g = 0.7
    y = top + head.h
    for i, (lab, v) in enumerate(items):
        ti = a + 0.45 + i * stg
        lines, lf2 = wrapped[i]
        ly = y + lfs * 0.6
        for k, ln in enumerate(lines):
            _text(ctx, ti, b, lfont, lf2, P["ink"], ln, left, ly + k * llh, an=4, anim="rise", fi=220, layer=9)
        by = ly + (len(lines) - 1) * llh + lfs * 0.6 + 16 * u
        bw = right - left
        _abs(ctx, ti, b, rrect(bw, bh, bh / 2, left, by), P["track"], 200, layer=7)
        fw = max(bh, bw * _clamp(v / vmax, 0, 1))
        col = P["accent"] if i == hi else P["bar"]
        clip = (f"\\clip({int(left - 2)},{int(by - 4)},{int(left - 2)},{int(by + bh + 4)})"
                f"\\t(0,{_ms(g)},0.55,\\clip({int(left - 2)},{int(by - 4)},{int(left + fw + 2)},{int(by + bh + 4)}))")
        _abs(ctx, ti + 0.1, b, rrect(fw, bh, bh / 2, left, by), col, 0, layer=8, extra=clip)
        _roll(ctx, ti + 0.1, g, b, nfont, lfs, P["ink"], right, lambda p, ly=ly: ly,
              lambda p, v=v: _fmt(v * p, pre, suf, dec, indian), an=6, layer=9, ease=lambda q: q ** 0.55)
        _sfx(ctx, e, ti, "pop", 0.26)
        y += row_hs[i]
    _sfx(ctx, e, a + 0.55 + (n - 1) * stg + g, "ding", 0.3)
    return a, b


# =========================================================================== 5. post_wall

def ev_post_wall(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 4.0)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    land = _landscape(ctx)
    cols = int(_clamp(_num(e.get("cols"), 12 if land else 7), 3, 16))
    gap = 10 * u
    ww = ctx.W * _clamp(_num(e.get("width"), 0.92), 0.4, 0.98)
    tile = (ww - gap * (cols - 1)) / cols
    hfrac = _clamp(_num(e.get("height"), 0.44), 0.15, 0.8)
    rows = int(_clamp(_num(e.get("rows"), round(ctx.H * hfrac / (tile + gap))), 1, 12))
    wh = rows * tile + (rows - 1) * gap
    cx = ctx.clamp_x(_xp(ctx, e.get("x"), 0.5), ww)
    cy = ctx.clamp_y(_yp(ctx, e.get("position", e.get("y")), "top"), wh + 60 * u)
    x0, y0 = cx - ww / 2, cy - wh / 2
    rng = random.Random(7919 + rows * 31 + cols)
    if P["dark"]:
        shades = ["#2A2A2D", "#333336", "#3C3C40", "#46464A", "#232325", "#505055"]
    else:
        shades = ["#E9E6DF", "#DEDAD2", "#D2CEC5", "#C6C2B9", "#F1EEE8", "#B9B5AC"]
    run = _clamp(_num(e.get("run"), min(2.4, (b - a) * 0.62)), 0.4, max(0.5, b - a - 0.4))
    t0 = a + 0.15
    total = rows * cols
    rad = min(14 * u, tile * 0.14)
    for r in range(rows):
        for c in range(cols):
            k = r * cols + c
            ti = t0 + run * (k / total) ** 0.9
            x, y = x0 + c * (tile + gap) + tile / 2, y0 + r * (tile + gap) + tile / 2
            col = rng.choice(shades)
            _shape(ctx, ti, b, rrect(tile, tile, rad, -tile / 2, -tile / 2), col, x, y,
                   "none", 0, layer=6, extra="\\fscx55\\fscy55\\alpha&HFF&\\t(0,150,\\fscx100\\fscy100\\alpha&H00&)")
            kind = rng.random()
            dcol = _mix(col, "#FFFFFF" if not P["dark"] else "#8A8A8E", 0.45)
            if kind < 0.28:
                s = tile * 0.22
                _shape(ctx, ti + 0.06, b, _tri(s, 0, 0).replace("m", "m", 1), dcol, x, y, "none", 0, layer=7,
                       extra="\\frz-90\\alpha&HFF&\\t(0,150,\\alpha&H00&)")
            elif kind < 0.5:
                bar = " ".join([rrect(tile * 0.5, tile * 0.07, tile * 0.035, -tile * 0.36, tile * 0.18),
                                rrect(tile * 0.3, tile * 0.07, tile * 0.035, -tile * 0.36, tile * 0.3)])
                _shape(ctx, ti + 0.06, b, bar, dcol, x, y, "none", 0, layer=7, extra="\\alpha&HFF&\\t(0,150,\\alpha&H00&)")
        _sfx(ctx, e, t0 + run * (r * cols / total) ** 0.9, "tick", 0.22)
    # counter chip
    frm, to = _num(e.get("from"), 823), _num(e.get("to"), 1711)
    dec = int(_clamp(_num(e.get("decimals"), 0), 0, 2))
    label = _str(e, "label", "posts", 20).upper()
    pre = _str(e, "prefix", "", 6)
    indian = bool(e.get("indian", "₹" in pre))
    nfont = _numfont(ctx, e, pre + label)
    fs = 54 * u
    widest = max(_fmt(frm, pre, "", dec, indian), _fmt(to, pre, "", dec, indian), key=len) + (" " + label if label else "")
    widest, fs = _fit(ctx, widest, nfont, fs, ww * 0.8, 0.6)
    cw = ctx.text_w(widest, nfont, fs) + 80 * u
    chh = fs * 1.8
    ccy = y0 + wh / 2 if str(e.get("chip", "center")) != "bottom" else min(y0 + wh, ctx.safe_bottom - chh / 2)
    _shape(ctx, a + 0.1, b, rrect(cw, chh, chh / 2, -cw / 2, -chh / 2), "#000000", cx, ccy + 10 * u, "pop", 120, layer=11,
           alpha=0xA8, blur=round(18 * u))
    _shape(ctx, a + 0.1, b, rrect(cw, chh, chh / 2, -cw / 2, -chh / 2), P["accent"], cx, ccy, "pop", 120, layer=12)
    ink = P["on_acc"]
    tail = (" " + label) if label else ""
    _roll(ctx, a + 0.1, 0.0, t0, nfont, fs, ink, cx, lambda p: ccy, lambda p: _fmt(frm, pre, "", dec, indian) + tail,
          layer=13, first="\\fad(150,0)")
    _roll(ctx, t0, run, b, nfont, fs, ink, cx, lambda p: ccy, lambda p: _fmt(frm + (to - frm) * p, pre, "", dec, indian) + tail,
          layer=13, first="", last="\\fscx112\\fscy112\\t(0,180,\\fscx100\\fscy100)", ease=_ease_io)
    ctx.register(a, b, x0, y0, x0 + ww, max(y0 + wh, ccy + chh / 2))
    _sfx(ctx, e, t0 + run, "success", 0.38)
    return a, b


# =========================================================================== 6. dial

def ev_dial(ctx, e):
    u = ctx.u
    a, b = ev_window(ctx, e, 4.5)
    _sfx_custom(ctx, e, a)
    m = min(ctx.W, ctx.H)
    R = m * _clamp(_num(e.get("size"), 0.42), 0.2, 0.65)
    side = str(e.get("side", "right")).lower()
    right = side != "left"
    off = _clamp(_num(e.get("offset"), 0.3), 0.0, 0.6)
    cxf = ctx.W - R + 2 * R * off if right else R - 2 * R * off
    cy = _yp(ctx, e.get("position", e.get("y")), 0.55 if _landscape(ctx) else 0.64)
    cy = _clamp(cy, ctx.safe_top + R * 0.3, ctx.safe_bottom - R * 0.3)
    cxs = ctx.W + R + 20 * u if right else -R - 20 * u
    labels = _strs(e.get("labels"), 24, 6) or ["12"] + [str(i) for i in range(1, 12)]
    n = len(labels)
    paper = _col(ctx, e.get("fill"), None) or ("#1C1B19" if str(e.get("theme")) == "dark" else "#F2EBDD")
    ink = _col(ctx, e.get("color"), None) or "#1F1C17"
    if _lum(paper) < 0.3 and not _col(ctx, e.get("color"), None):
        ink = "#F2EBDD"
    acc = _col(ctx, e.get("accent"), ctx.accent)
    sfont = ctx.fkey("serif")
    adv = ctx.font(sfont).get("adv")
    if adv and any(ch not in adv for ch in "".join(labels)):
        sfont = _body(ctx)
    nfs = R * 0.16
    # static elements relative to centre: (kind, payload, ox, oy, colour, layer, extra)
    els = []
    els.append(("shape", _circ(R), 0, 18 * u, "#000000", 4, {"alpha": 0x98, "blur": round(30 * u)}))
    els.append(("shape", _circ(R), 0, 0, paper, 5, {}))
    els.append(("shape", _ring(R - R * 0.035, R - R * 0.05), 0, 0, ink, 6, {}))
    els.append(("shape", _ring(R * 0.47, R * 0.47 - max(2, 2.5 * u)), 0, 0, ink, 6, {"alpha": 0x90}))
    minor_per = 5 if n == 12 else 4
    total = n * minor_per
    minor, major = [], []
    for k in range(total):
        d = 360 * k / total
        if k % minor_per == 0:
            p1, p2 = _pt(0, 0, R * 0.92, d), _pt(0, 0, R * 0.82, d)
            major.append(_seg(p1[0], p1[1], p2[0], p2[1], max(3, R * 0.016)))
        else:
            p1, p2 = _pt(0, 0, R * 0.92, d), _pt(0, 0, R * 0.875, d)
            minor.append(_seg(p1[0], p1[1], p2[0], p2[1], max(2, R * 0.0065)))
    els.append(("shape", " ".join(minor), 0, 0, ink, 6, {"alpha": 0x30}))
    els.append(("shape", " ".join(major), 0, 0, ink, 6, {}))
    for i, lab in enumerate(labels):
        px, py = _pt(0, 0, R * 0.68, 360 * i / n)
        lt, lf = _fit(ctx, lab, sfont, nfs, R * 0.3, 0.5)
        els.append(("text", (lt, lf), px, py, ink, 7, {}))
    # slide-in in three linear pieces approximating ease-out
    slide = 0.75
    keys = [0.0, 0.22, 0.45, slide]
    xs = [cxs + (cxf - cxs) * _ease(t / slide) for t in keys]

    def emit(t0, t1, xa, xb, dur_ms, fi, fo, el):
        kind, pay, ox, oy, col, layer, opt = el
        mv = f"\\move({xa + ox:.0f},{cy + oy:.0f},{xb + ox:.0f},{cy + oy:.0f},0,{dur_ms})" if dur_ms else f"\\pos({xb + ox:.0f},{cy + oy:.0f})"
        fd = f"\\fad({fi},{fo})" if (fi or fo) else ""
        if kind == "shape":
            ctx.shape(t0, t1, pay, col, opt.get("alpha", 0), "\\an7" + mv + fd, layer, blur=opt.get("blur", 0))
        else:
            txt, fs = pay
            st = ctx.style(sfont, fs, col, "#000000", 0, 0)
            sh = ctx.cap_shift(sfont, fs)
            mv = (f"\\move({xa + ox:.0f},{cy + oy + sh:.0f},{xb + ox:.0f},{cy + oy + sh:.0f},0,{dur_ms})" if dur_ms
                  else f"\\pos({xb + ox:.0f},{cy + oy + sh:.0f})")
            ctx.add(t0, t1, st, "{\\an5" + mv + fd + "}" + esc(txt), layer)

    for el in els:
        for j in range(3):
            t0, t1 = a + keys[j], a + keys[j + 1]
            emit(t0, t1, xs[j], xs[j + 1], _ms(keys[j + 1] - keys[j]), 120 if j == 0 else 0, 0, el)
        emit(a + slide, b, cxf, cxf, 0, 0, FO, el)
    # hand
    if right:
        d_from, d_to = 210.0, 345.0
    else:
        d_from, d_to = 15.0, 150.0
    if e.get("from") is not None:
        d_from = 360 * _num(e.get("from"), 0) / n
    if e.get("to") is not None:
        d_to = 360 * _num(e.get("to"), 0) / n
    if d_to < d_from and e.get("direction", "cw") != "ccw":
        d_to += 360
    hand = _poly([(-R * 0.024, R * 0.13), (R * 0.024, R * 0.13), (R * 0.012, -R * 0.56), (0, -R * 0.64), (-R * 0.012, -R * 0.56)])
    hand_el = ("shape", hand, 0, 0, ink, 8, {})
    cap_el = ("shape", _circ(R * 0.05), 0, 0, acc, 9, {})
    dot_el = ("shape", _circ(R * 0.018), 0, 0, ink, 10, {})
    for el in (hand_el, cap_el, dot_el):
        for j in range(3):
            t0, t1 = a + keys[j], a + keys[j + 1]
            kind, pay, ox, oy, col, layer, opt = el
            ctx.shape(t0, t1, pay, col, 0, f"\\an7\\move({xs[j]:.0f},{cy:.0f},{xs[j + 1]:.0f},{cy:.0f},0,{_ms(keys[j + 1] - keys[j])})"
                      f"\\frz{-d_from:.1f}" + ("\\fad(120,0)" if j == 0 else ""), layer)
    sweep_ms = _ms(max(0.3, b - a - slide - 0.5))
    ctx.shape(a + slide, b, hand, ink, 0, f"\\an7\\pos({cxf:.0f},{cy:.0f})\\frz{-d_from:.1f}"
              f"\\t(0,{sweep_ms},0.75,\\frz{-d_to:.1f})\\fad(0,{FO})", 8)
    ctx.shape(a + slide, b, _circ(R * 0.05), acc, 0, f"\\an7\\pos({cxf:.0f},{cy:.0f})\\fad(0,{FO})", 9)
    ctx.shape(a + slide, b, _circ(R * 0.018), ink, 0, f"\\an7\\pos({cxf:.0f},{cy:.0f})\\fad(0,{FO})", 10)
    word = _str(e, "word", "", 18)
    if word:
        wfont = _body(ctx)
        wt, wfs = _fit(ctx, word.upper(), wfont, R * 0.085, R * 0.4, 0.5)
        st = ctx.style(wfont, wfs, ink, "#000000", 0, 0)
        sh = ctx.cap_shift(wfont, wfs)
        wx, wy = cxf + R * 0.1, cy + sh - R * 0.045
        ctx.add(a + slide, b, st, "{" + f"\\an1\\pos({wx:.0f},{wy:.0f})\\org({cxf:.0f},{cy:.0f})\\frz{90 - d_from:.1f}"
                f"\\t(0,{sweep_ms},0.75,\\frz{90 - d_to:.1f})\\fsp{2 * u:.0f}\\fad(200,{FO})" + "}" + esc(wt), 9)
    x0, x1 = max(0, cxf - R), min(ctx.W, cxf + R)
    ctx.register(a, b, x0, max(0, cy - R), x1, min(ctx.H, cy + R))
    _sfx(ctx, e, a, "whoosh", 0.4)
    _sfx(ctx, e, a + slide, "tick-tock", 0.45)
    return a, b


# =========================================================================== 7. list_panel

def ev_list_panel(ctx, e):
    u = ctx.u
    items = _strs(e.get("items"), 8, 48)
    if not items:
        items = ["The problem", "Sleep 7 hours", "20-minute blocks", "Teach a friend", "The 40% boost"]
    n = len(items)
    a, b = ev_window(ctx, e, max(6.0, 1.6 * n + 1.2))
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e, "dark")
    side = str(e.get("side", "right")).lower()
    right = side != "left"
    land = _landscape(ctx)
    w = ctx.W * _clamp(_num(e.get("width"), 0.24 if land else 0.36), 0.2, 0.6)
    w = max(w, 330 * u)
    pad = 26 * u
    hfs, ifs, nfs = 27 * u, 38 * u, 30 * u
    bfont, lfont = _body(ctx), _label_font(ctx)
    nfont = "space-mono"
    numw = 56 * u
    text_w = w - 2 * pad - numw - 16 * u
    rows = []
    for it in items:
        lines, fs = _wrap(ctx, it, bfont, ifs, text_w, 2, 0.82)
        rows.append((lines, fs))
    lh = ifs * 1.2
    row_hs = [len(ln) * lh + 30 * u for ln, _ in rows]
    header_h = hfs + 40 * u
    h = pad + header_h + sum(row_hs) + pad * 0.6
    margin = ctx.W * 0.035
    cx = (ctx.W - margin - w / 2) if right else (margin + w / 2)
    if e.get("x") is not None:
        cx = ctx.clamp_x(_xp(ctx, e.get("x"), 0.5), w)
    cy = ctx.clamp_y(_yp(ctx, e.get("position", e.get("y")), "upper"), h)
    x0, top = cx - w / 2, cy - h / 2
    anim_in = "from-right" if right else "from-left"
    # panel
    path = rrect(w, h, 28 * u, -w / 2, -h / 2)
    if P["glass"]:
        ctx.video_requests.append({"kind": "blur_region", "a": a + 0.35, "b": max(a + 0.4, b - 0.12), "x": cx - w / 2,
                                   "y": top, "w": w, "h": h, "r": 28 * u, "sigma": 24})
        ctx.shape(a, b, path, P["panel"], 0x40, "\\an7" + _anim(anim_in, cx, cy, u, 60) + _fad(260) + "\\3a&H9A&", 4,
                  outline="#FFFFFF", bord=max(1, round(1.6 * u)))
    else:
        ctx.shape(a, b, path, "#000000", 0xB0, "\\an7" + _anim(anim_in, cx, cy + 12 * u, u, 60) + _fad(260), 4, blur=round(22 * u))
        ctx.shape(a, b, path, P["panel"], P["panel_a"], "\\an7" + _anim(anim_in, cx, cy, u, 60) + _fad(260), 5)
    ctx.register(a, b, x0, top, x0 + w, top + h, kind="ui")
    # times
    times = e.get("times") if isinstance(e.get("times"), (list, tuple)) else None
    step = (b - a - 0.9) / max(n, 1)
    tl = []
    for i in range(n):
        t = ctx.t(times[i], a + 0.6 + i * step) if times and i < len(times) else a + 0.6 + i * step
        t = _clamp(t, a + 0.45, b - 0.3)
        if tl and t < tl[-1] + 0.25:
            t = min(tl[-1] + 0.25, b - 0.3)
        tl.append(t)
    # header
    hy = top + pad + hfs * 0.6
    title = _str(e, "title", "In this video", 30).upper()
    _text(ctx, a + 0.1, b, lfont, hfs, P["muted"], title, x0 + pad, hy, an=4, anim=anim_in, fi=260, layer=8,
          extra=f"\\fsp{1.5 * u:.1f}")
    for i, t in enumerate(tl):
        t2 = tl[i + 1] if i + 1 < n else b
        _text(ctx, t, t2, nfont, hfs, P["ink"] if i < n else P["muted"], f"{i + 1:02d}/{n:02d}", x0 + w - pad, hy, an=6,
              fi=120 if i == 0 else 0, fo=FO if i == n - 1 else 0, layer=8)
    if tl:
        _text(ctx, a + 0.1, tl[0], nfont, hfs, P["muted"], f"00/{n:02d}", x0 + w - pad, hy, an=6, anim=anim_in, fi=260,
              fo=0, layer=8)
    div_y = top + pad + header_h - 16 * u
    ctx.shape(a + 0.15, b, rect(w - 2 * pad, max(1, 1.5 * u), x0 + pad, div_y), P["ink"], 0xC0,
              "\\an7" + _anim(anim_in, 0, 0, u, 60) + _fad(260), 6)
    # rows
    y = top + pad + header_h
    centers = []
    for i, hh in enumerate(row_hs):
        centers.append(y + hh / 2)
        y += hh
    acc, on_acc = P["accent"], P["on_acc"]
    done_col = P["acc_text"] if not P["dark"] else acc
    for i, (lines, fs) in enumerate(rows):
        ry = centers[i]
        ti = tl[i]
        tn = tl[i + 1] if i + 1 < n else b + 1
        states = [(a, ti, "future"), (ti, min(tn, b), "current")]
        if tn < b:
            states.append((tn, b, "past"))
        for (s0, s1, stt) in states:
            if s1 <= s0:
                continue
            first = s0 <= a + 1e-6
            an_k = anim_in if first else "none"
            fi = 260 if first else 120
            last = s1 >= b - 1e-6
            fo = FO if last else 0
            s1x = s1 if last else s1 + 0.0
            if stt == "future":
                ncol, tcol, talpha = P["muted"], P["ink"], 0x00
            elif stt == "current":
                ncol, tcol, talpha = on_acc, on_acc, 0x00
            else:
                ncol, tcol, talpha = done_col, P["muted"], 0x00
            nx = x0 + pad + 14 * u
            if stt == "past":
                _shape(ctx, s0, s1x, _check(30 * u), ncol, nx + 12 * u, ry, "pop" if not first else an_k, fi, fo, layer=9)
            else:
                _text(ctx, s0 + (0.02 * i if first else 0), s1x, nfont, nfs, ncol, f"{i + 1:02d}", nx, ry, an=4, anim=an_k,
                      fi=fi, fo=fo, layer=9)
            ly = ry - (len(lines) - 1) * lh / 2
            for ln in lines:
                _text(ctx, s0 + (0.02 * i if first else 0), s1x, bfont, fs, tcol, ln, x0 + pad + numw + 16 * u, ly, an=4,
                      anim=an_k, fi=fi, fo=fo, layer=9, extra=f"\\alpha&H{talpha:02X}&" if talpha else "")
                ly += lh
        # highlight pill for this item's current interval
        ph = row_hs[i] - 10 * u
        pw = w - 2 * 12 * u
        pill = rrect(pw, ph, min(18 * u, ph / 2), -pw / 2, -ph / 2)
        s1 = min(tn, b)
        if s1 > ti:
            if i == 0:
                tag = f"\\an7\\pos({cx:.0f},{ry:.0f})\\fscx70\\fscy70\\t(0,180,\\fscx100\\fscy100)\\fad(150,{FO if s1 >= b else 0})"
            else:
                tag = (f"\\an7\\move({cx:.0f},{centers[i - 1]:.0f},{cx:.0f},{ry:.0f},0,220)"
                       f"\\fad(0,{FO if s1 >= b else 0})")
            ctx.shape(ti, s1, pill, acc, 0, tag, 7)
        _sfx(ctx, e, ti, "click", 0.35)
    _sfx(ctx, e, a, "whoosh-fast", 0.3)
    return a, b


# =========================================================================== 8. timeline

def _steps(e, maxn=6):
    raw = e.get("steps", e.get("items"))
    out = []
    if isinstance(raw, str):
        raw = [p.strip() for p in raw.split("|")]
    if isinstance(raw, (list, tuple)):
        for it in raw[:maxn]:
            if isinstance(it, dict):
                out.append((_trunc(it.get("label", it.get("text", "")), 40), _trunc(it.get("sub", it.get("date", "")) or "", 30)))
            else:
                out.append((_trunc(it, 40), ""))
    subs = _strs(e.get("subs", e.get("dates")), maxn, 30)
    if subs and out:
        out = [(lab, sub or (subs[i] if i < len(subs) else "")) for i, (lab, sub) in enumerate(out)]
    return out


def ev_timeline(ctx, e):
    u = ctx.u
    steps = _steps(e)
    default = not steps
    if default:
        steps = [("Idea", "Week 1"), ("Script", "Week 2"), ("Shoot", "Week 3"), ("Launch", "Week 4")]
    n = len(steps)
    a, b = ev_window(ctx, e, max(4.5, 1.0 * n + 1.8))
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    direction = str(e.get("direction", "horizontal" if ctx.W >= ctx.H * 1.1 else "vertical")).lower()
    vertical = direction.startswith("v")
    pad = 52 * u
    bfont, lfont = _body(ctx), _label_font(ctx)
    times = e.get("times") if isinstance(e.get("times"), (list, tuple)) else None
    step_t = (b - a - 1.2) / max(n, 1)
    tl = []
    for i in range(n):
        t = ctx.t(times[i], a + 0.6 + i * step_t) if times and i < len(times) else a + 0.6 + i * step_t
        t = _clamp(t, a + 0.5, b - 0.3)
        if tl and t < tl[-1] + 0.2:
            t = min(tl[-1] + 0.2, b - 0.3)
        tl.append(t)
    r = 15 * u
    lw = 6 * u
    if vertical:
        lfs, sfs = 46 * u, 32 * u
        w = _width(ctx, e, 0.74, 0.42, 860)
        if e.get("width") is None:
            need = max(max(ctx.text_w(lab, bfont, lfs), ctx.text_w(sub, lfont, sfs)) for lab, sub in steps)
            tdef = _str(e, "title", "The plan" if default else "", 70)
            need = max(need + 70 * u, ctx.text_w(tdef, bfont, 46 * u) if tdef else 0)
            w = _clamp(need + 2 * pad + 40 * u, ctx.W * 0.5 if not _landscape(ctx) else ctx.W * 0.28, w)
        head = _Head(ctx, e, P, w - 2 * pad, "The plan" if default else None)
        tx_w = w - 2 * pad - 70 * u
        rows = []
        for lab, sub in steps:
            ll, f1 = _wrap(ctx, lab, bfont, lfs, tx_w, 2)
            sl, f2 = _wrap(ctx, sub, lfont, sfs, tx_w, 1) if sub else ([], sfs)
            hh = len(ll) * lfs * 1.18 + (sfs * 1.35 if sl else 0) + 46 * u
            rows.append((ll, f1, sl, f2, hh))
        h = pad + head.h + sum(rw[4] for rw in rows) - 30 * u + pad
        cx, cy = _place(ctx, e, w, h)
        left, top = cx - w / 2 + pad, cy - h / 2 + pad
        _panel(ctx, a, b, cx, cy, w, h, P)
        head.draw(ctx, a + 0.12, b, left, top)
        dx = left + r + 4 * u
        y = top + head.h
        pts = []
        for ll, f1, sl, f2, hh in rows:
            pts.append((dx, y + lfs * 0.6))
            y += hh
        # track + progressive line
        _abs(ctx, a + 0.25, b, rrect(lw, pts[-1][1] - pts[0][1], lw / 2, dx - lw / 2, pts[0][1]), P["track"], 300, layer=6)
        for i in range(1, n):
            y0, y1 = pts[i - 1][1], pts[i][1]
            s = max(tl[i - 1] + 0.05, tl[i] - 0.45)
            clip = (f"\\clip({int(dx - 20 * u)},{int(y0)},{int(dx + 20 * u)},{int(y0)})"
                    f"\\t(0,{_ms(tl[i] - s)},\\clip({int(dx - 20 * u)},{int(y0)},{int(dx + 20 * u)},{int(y1)}))")
            _abs(ctx, s, b, rect(lw, y1 - y0, dx - lw / 2, y0), P["bar"], 0, layer=7, extra=clip)
        for i, (ll, f1, sl, f2, hh) in enumerate(rows):
            px, py = pts[i]
            ti = tl[i]
            tn = tl[i + 1] if i + 1 < n else b
            _timeline_dot(ctx, P, ti, tn, b, px, py, r, i)
            yy = py
            for ln in ll:
                _text(ctx, ti, b, bfont, f1, P["ink"], ln, px + r + 34 * u, yy, an=4, anim="from-left", fi=220, layer=9)
                yy += lfs * 1.18
            for ln in sl:
                _text(ctx, ti + 0.08, b, lfont, f2, P["muted"], ln, px + r + 34 * u, yy - lfs * 0.18 + sfs * 0.3, an=4,
                      anim="from-left", fi=220, layer=9)
            _sfx(ctx, e, ti, "pop", 0.3)
    else:
        w = _width(ctx, e, 0.92, 0.82, 1500)
        head = _Head(ctx, e, P, w - 2 * pad, "The plan" if default else None)
        slot = (w - 2 * pad) / n
        lfs, sfs = 38 * u, 28 * u
        rows = []
        for lab, sub in steps:
            ll, f1 = _wrap(ctx, lab, bfont, lfs, slot * 0.9, 2)
            sl, f2 = _wrap(ctx, sub, lfont, sfs, slot * 0.9, 1) if sub else ([], sfs)
            rows.append((ll, f1, sl, f2))
        maxl = max(len(rw[0]) for rw in rows)
        anysub = any(rw[2] for rw in rows)
        h = pad + head.h + 2 * r + 40 * u + maxl * lfs * 1.18 + (sfs * 1.5 if anysub else 0) + pad
        cx, cy = _place(ctx, e, w, h)
        left, top = cx - w / 2 + pad, cy - h / 2 + pad
        _panel(ctx, a, b, cx, cy, w, h, P)
        head.draw(ctx, a + 0.12, b, left, top)
        dy = top + head.h + r + 6 * u
        pts = [(left + slot * (i + 0.5), dy) for i in range(n)]
        _abs(ctx, a + 0.25, b, rrect(pts[-1][0] - pts[0][0], lw, lw / 2, pts[0][0], dy - lw / 2), P["track"], 300, layer=6)
        for i in range(1, n):
            x0_, x1_ = pts[i - 1][0], pts[i][0]
            s = max(tl[i - 1] + 0.05, tl[i] - 0.45)
            clip = (f"\\clip({int(x0_)},{int(dy - 20 * u)},{int(x0_)},{int(dy + 20 * u)})"
                    f"\\t(0,{_ms(tl[i] - s)},\\clip({int(x0_)},{int(dy - 20 * u)},{int(x1_)},{int(dy + 20 * u)}))")
            _abs(ctx, s, b, rect(x1_ - x0_, lw, x0_, dy - lw / 2), P["bar"], 0, layer=7, extra=clip)
        for i, (ll, f1, sl, f2) in enumerate(rows):
            px, py = pts[i]
            ti = tl[i]
            tn = tl[i + 1] if i + 1 < n else b
            _timeline_dot(ctx, P, ti, tn, b, px, py, r, i)
            yy = py + r + 40 * u
            for ln in ll:
                _text(ctx, ti, b, bfont, f1, P["ink"], ln, px, yy, anim="rise", fi=220, layer=9)
                yy += lfs * 1.18
            for ln in sl:
                _text(ctx, ti + 0.08, b, lfont, f2, P["muted"], ln, px, yy - lfs * 0.1 + sfs * 0.2, anim="rise", fi=220, layer=9)
            _sfx(ctx, e, ti, "pop", 0.3)
    _sfx(ctx, e, tl[-1] + 0.3, "ding", 0.3)
    return a, b


def _timeline_dot(ctx, P, ti, tn, b, px, py, r, i):
    u = ctx.u
    acc = P["accent"]
    # current: accent dot + halo; past: solid ink dot with a small tick
    _shape(ctx, ti, b, _circ(r), P["bar"], px, py, "pop", 80, layer=8)
    if tn > ti:
        last = tn >= b - 1e-6
        _shape(ctx, ti, tn, _circ(r * 2.0), acc, px, py, "pop", 120, FO if last else 120, layer=7, alpha=0xA0)
        _shape(ctx, ti, tn, _circ(r * 1.12), acc, px, py, "pop", 80, FO if last else 120, layer=9,
               outline=P["ink"] if not P["dark"] else None, bord=round(3 * u) if not P["dark"] else 0)
    if tn < b:
        _shape(ctx, tn, b, _check(r * 1.25), P["panel"] if not P["glass"] else "#18181A", px, py, "pop", 80, layer=9)


# =========================================================================== 9. rating

def ev_rating(ctx, e):
    u = ctx.u
    nst = int(_clamp(_num(e.get("stars"), 5), 3, 10))
    val = _clamp(round(_num(e.get("value"), 4.5) * 2) / 2, 0, nst)
    a, b = ev_window(ctx, e, 3.8)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.8, 0.42, 820)
    pad = 54 * u
    head = _Head(ctx, e, P, w - 2 * pad, None, 42)
    sr = min(56 * u, (w - 2 * pad) / (nst * 2.35))
    sgap = sr * 2.35
    nfont = _numfont(ctx, e)
    score_fs = 118 * u
    lfont = _label_font(ctx)
    label = _str(e, "label", "Average rating", 60)
    llines, lfs = _wrap(ctx, label, lfont, 36 * u, w - 2 * pad, 2) if label else ([], 0)
    show_score = e.get("score", True) is not False
    h = pad + head.h + (score_fs * 1.05 + 30 * u if show_score else 0) + 2 * sr + (30 * u + len(llines) * lfs * 1.25 if llines else 0) + pad
    cx, cy = _place(ctx, e, w, h)
    top = cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P, radius=44)
    head.draw(ctx, a + 0.12, b, cx - w / 2 + pad, top)
    y = top + head.h
    t0 = a + 0.5
    stg = 0.22
    full_n = math.ceil(val)
    run = max(0.4, stg * max(1, full_n))
    if show_score:
        sy = y + score_fs * 0.5
        dec = 1
        tot = _fmt(val, "", "", dec)
        sw = ctx.text_w(tot, nfont, score_fs)
        mfs = score_fs * 0.42
        mt = f"/{nst}"
        mw = ctx.text_w(mt, nfont, mfs)
        gx = cx - (sw + 10 * u + mw) / 2
        _roll(ctx, t0, run, b, nfont, score_fs, P["ink"], gx, lambda p: sy, lambda p: _fmt(val * p, "", "", dec), an=4,
              layer=10, last="\\fscx108\\fscy108\\t(0,160,\\fscx100\\fscy100)", ease=lambda q: q)
        _text(ctx, a + 0.4, b, nfont, mfs, P["muted"], mt, gx + sw + 10 * u, sy + score_fs * 0.5 - mfs * 0.5 - score_fs * 0.02,
              an=4, anim="rise", fi=240, layer=10)
        y += score_fs * 1.05 + 30 * u
    sy = y + sr
    x_first = cx - sgap * (nst - 1) / 2
    for i in range(nst):
        x = x_first + sgap * i
        _shape(ctx, a + 0.3 + 0.03 * i, b, _star(sr), "#55555A" if P["dark"] else P["track"], x, sy, "pop", 100, layer=8)
        fill = _clamp(val - i, 0, 1)
        if fill <= 0:
            continue
        ti = t0 + stg * i
        extra = ""
        if fill < 1:
            extra = f"\\clip({int(x - sr - 4)},{int(sy - sr - 8)},{int(x)},{int(sy + sr + 8)})"
        _shape(ctx, ti, b, _star(sr), P["accent"], x, sy, "pop-big", 60, layer=9, extra=extra)
        _sfx(ctx, e, ti, "pop", 0.22 + 0.03 * i)
    y = sy + sr + 30 * u
    for ln in llines:
        _text(ctx, a + 0.45, b, lfont, lfs, P["muted"], ln, cx, y + lfs * 0.6, anim="rise", fi=260, layer=9)
        y += lfs * 1.25
    _sfx(ctx, e, t0 + run + 0.05, "ding", 0.32)
    return a, b


# =========================================================================== 10. versus

def _side(e, keys, ikeys, default):
    for k in keys:
        v = e.get(k)
        if isinstance(v, dict):
            return _trunc(v.get("title", v.get("name", default[0])), 24), _strs(v.get("items"), 4, 60) or []
        if isinstance(v, str) and v:
            title = v
            for ik in ikeys:
                if _strs(e.get(ik), 4, 60):
                    return _trunc(title, 24), _strs(e.get(ik), 4, 60)
            return _trunc(title, 24), []
    for ik in ikeys:
        if _strs(e.get(ik), 4, 60):
            return default[0], _strs(e.get(ik), 4, 60)
    return None


def ev_versus(ctx, e):
    u = ctx.u
    titles = _strs(e.get("titles"), 2, 24) or []
    A = _side(e, ("a", "left"), ("items_a", "left_items", "a_items"), (titles[0] if titles else "A", []))
    B = _side(e, ("b", "right"), ("items_b", "right_items", "b_items"), (titles[1] if len(titles) > 1 else "B", []))
    default = A is None and B is None
    if default:
        A = ("Old way", ["Hours of editing", "Generic templates", "Posting when you can"])
        B = ("New way", ["Edit in minutes", "On-brand motion", "Post every day"])
    A = A or (titles[0] if titles else "A", [])
    B = B or (titles[1] if len(titles) > 1 else "B", [])
    if titles:
        A = (titles[0], A[1])
        if len(titles) > 1:
            B = (titles[1], B[1])
    win = e.get("winner", "b" if default else None)
    win = {"a": 0, "left": 0, "0": 0, "1": 1, "b": 1, "right": 1}.get(str(win).lower(), None) if win is not None else None
    if isinstance(e.get("winner"), int) and not isinstance(e.get("winner"), bool):
        win = 0 if e["winner"] == 0 else 1
    na, nb = len(A[1]), len(B[1])
    a, b = ev_window(ctx, e, max(4.5, 1.6 + 0.4 * (na + nb) + 1.2))
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.92, 0.62, 1300)
    pad = 46 * u
    head = _Head(ctx, e, P, w - 2 * pad, None, 42)
    gap = 96 * u
    colw = (w - 2 * pad - gap) / 2
    tfont = _numfont(ctx, e)
    bfont = _body(ctx)
    tfs, ifs = 54 * u, 37 * u
    cols = []
    for (title, items) in (A, B):
        tt, tf = _fit(ctx, title.upper() if e.get("uppercase", True) else title, tfont, tfs, colw - 76 * u, 0.5)
        its = [_wrap(ctx, it, bfont, ifs, colw - 44 * u, 2, 0.82) for it in items]
        hh = sum(len(ln) * ifs * 1.2 + 24 * u for ln, _ in its)
        cols.append((tt, tf, its, hh))
    body_h = max(cols[0][3], cols[1][3], 40 * u)
    th_ = tfs * 1.9
    h = pad + head.h + th_ + 26 * u + body_h + pad * 0.8
    cx, cy = _place(ctx, e, w, h)
    left, top = cx - w / 2 + pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P)
    head.draw(ctx, a + 0.12, b, left, top)
    ty = top + head.h + th_ / 2
    by0 = ty + th_ / 2 + 26 * u
    # divider + VS badge
    _abs(ctx, a + 0.2, b, rect(max(1, 2 * u), h - head.h - pad * 1.6, cx - 1 * u, top + head.h), P["grid"], 300, layer=6)
    br = 48 * u
    bcol = P["ink"]
    _shape(ctx, a + 0.3, b, _circ(br), bcol, cx, ty, "pop-big", 80, layer=10, outline=P["panel"] if not P["glass"] else None,
           bord=round(8 * u) if not P["glass"] else 0)
    vfont = _numfont(ctx, e)
    _text(ctx, a + 0.3, b, vfont, 36 * u, _on(bcol), "VS", cx, ty, anim="pop-big", fi=80, layer=11)
    _sfx(ctx, e, a + 0.3, "whoosh-fast", 0.3)
    t = a + 0.55
    end_t = t
    reveal = []
    for ci, (tt, tf, its, hh) in enumerate(cols):
        ccx = left + colw / 2 + ci * (colw + gap)
        reveal.append((ci, ccx, t))
        tcol = P["ink"]
        is_win = win == ci
        tw_ = ctx.text_w(tt, tfont, tf)
        _text(ctx, t, b, tfont, tf, tcol, tt, ccx, ty, anim="rise", fi=220, layer=10)
        _sfx(ctx, e, t, "pop", 0.3)
        t += 0.3
        y = by0
        bx = ccx - colw / 2 + 12 * u
        for (lines, fs) in its:
            ry = y + ifs * 0.6
            _shape(ctx, t, b, _circ(7 * u), P["accent"] if is_win else P["muted"], bx + 6 * u, ry, "pop", 80, layer=9)
            yy = ry
            for ln in lines:
                _text(ctx, t, b, bfont, fs, P["ink"], ln, bx + 30 * u, yy, an=4, anim="rise", fi=220, layer=9)
                yy += ifs * 1.2
            y += len(lines) * ifs * 1.2 + 24 * u
            _sfx(ctx, e, t, "pop", 0.18)
            t += 0.32
        t += 0.15
        end_t = t
        if is_win:
            win_info = (ccx, tw_, tt, tf)
    if win is not None:
        ccx, tw_, tt, tf = win_info
        tw_ = ctx.text_w(tt, tfont, tf)
        pw, ph = min(tw_ + 56 * u, colw - 8 * u), tf * 1.65
        tw0 = end_t + 0.1
        _shape(ctx, tw0, b, rrect(pw, ph, ph / 2, -pw / 2, -ph / 2), P["accent"], ccx, ty, "pop", 80, layer=11)
        _text(ctx, tw0, b, tfont, tf, P["on_acc"], tt, ccx, ty, anim="pop", fi=80, layer=12)
        # crown-ish badge: small check disc
        _shape(ctx, tw0 + 0.15, b, _circ(20 * u), P["ink"], ccx + pw / 2 - 6 * u, ty - ph / 2 + 4 * u, "pop-big", 60, layer=13)
        _shape(ctx, tw0 + 0.15, b, _check(26 * u), P["accent"], ccx + pw / 2 - 6 * u, ty - ph / 2 + 4 * u, "pop-big", 60,
               layer=14)
        _sfx(ctx, e, tw0, "success", 0.38)
    return a, b


# =========================================================================== 11. price_tag

def ev_price_tag(ctx, e):
    u = ctx.u
    cur = _str(e, "currency", "₹", 4)
    old_raw, new_raw = e.get("old", 2499), e.get("new", 1499)
    indian = bool(e.get("indian", "₹" in cur))
    dec = int(_clamp(_num(e.get("decimals"), 2 if _dec_for([_num(old_raw, 0), _num(new_raw, 0)]) else 0), 0, 2))

    def price(v):
        x = _num(v, None)
        if x is None or (isinstance(v, str) and re.search(r"[A-Za-z]", v) and not re.fullmatch(r"\s*[\d.,]+\s*", v)):
            return _trunc(v, 14) if v not in (None, False) else ""
        return _fmt(x, cur, "", dec, indian)

    old_t, new_t = price(old_raw), price(new_raw)
    o, nn = _num(old_raw, None), _num(new_raw, None)
    badge = e.get("badge")
    if badge is None:
        badge = f"-{round((o - nn) / o * 100)}%" if (o and nn is not None and o > nn > 0) else "SALE"
    badge = _trunc(badge, 6) if badge else ""
    a, b = ev_window(ctx, e, 3.8)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    tag_fill = P["panel"] if not P["glass"] else "#1D1D1F"
    tw = _width(ctx, e, 0.66, 0.36, 720)
    th = tw * 0.46
    cx, cy = _place(ctx, e, tw + 60 * u, th + 120 * u)
    k = th * 0.42  # length of the pointed end
    xl, xr = -tw / 2, tw / 2
    rr = 26 * u
    kk = rr * 0.55
    body = " ".join([f"m {xl:.1f} 0", f"l {xl + k:.1f} {-th / 2:.1f}", f"l {xr - rr:.1f} {-th / 2:.1f}",
                     f"b {xr - rr + kk:.1f} {-th / 2:.1f} {xr:.1f} {-th / 2 + rr - kk:.1f} {xr:.1f} {-th / 2 + rr:.1f}",
                     f"l {xr:.1f} {th / 2 - rr:.1f}",
                     f"b {xr:.1f} {th / 2 - rr + kk:.1f} {xr - rr + kk:.1f} {th / 2:.1f} {xr - rr:.1f} {th / 2:.1f}",
                     f"l {xl + k:.1f} {th / 2:.1f}"])
    hx, hr = xl + k * 0.62, 17 * u
    tag_path = body + " " + _circ(hr, hx, 0, ccw=True)
    # swing from the hole
    ox, oy = cx + hx, cy
    tilt = _num(e.get("tilt"), -4)
    seq = [(0, 22), (260, -10), (480, 5), (680, -2.5), (860, tilt)]
    swing = f"\\org({ox:.0f},{oy:.0f})\\frz{seq[0][1]}"
    prev = 0
    for ms, ang in seq[1:]:
        swing += f"\\t({prev},{ms},\\frz{ang})"
        prev = ms
    static = f"\\org({ox:.0f},{oy:.0f})\\frz{tilt}"
    settle = a + 0.9

    def shp(t0, path, col, lx, ly, layer, extra="", alpha=0, blur=0, fi=150, sw=True, anim=""):
        tag = f"\\an7\\pos({cx + lx:.0f},{cy + ly:.0f})" + anim + (swing if sw else static) + _fad(fi) + extra
        ctx.shape(t0, b, path, col, alpha, tag, layer, blur=blur)

    def txt(t0, font, fs, col, s, lx, ly, layer, an=5, sw=True, anim="", fi=150):
        st = ctx.style(font, fs, col, "#000000", 0, 0)
        tag = (f"\\an{an}\\pos({cx + lx:.0f},{cy + ly + ctx.cap_shift(font, fs):.0f})" + anim + (swing if sw else static)
               + _fad(fi))
        ctx.add(t0, b, st, "{" + tag + "}" + esc(s), layer)

    # string through the hole
    shp(a, _seg(hx, 0, hx - 70 * u, -th * 0.95, max(2, 3.5 * u)), P["ink"] if not P["dark"] else "#E4E2DC", 0, 0, 7)
    shp(a, tag_path, "#000000", 0, 14 * u, 4, alpha=0xA8, blur=round(22 * u))
    shp(a, tag_path, tag_fill, 0, 0, 5)
    shp(a, _ring(hr + 7 * u, hr, hx, 0), P["muted"], 0, 0, 6, alpha=0x40)
    nfont = _numfont(ctx, e, cur)
    tx0 = hx + hr + 40 * u
    avail = xr - 40 * u - tx0
    tcx = tx0 + avail / 2
    label = _str(e, "label", "Launch offer" if ("old" not in e and "new" not in e) else "", 30)
    ly = -th * 0.30
    if label:
        lfont = _label_font(ctx)
        lt, lfs = _fit(ctx, label.upper(), lfont, 30 * u, avail, 0.7)
        txt(a + 0.1, lfont, lfs, P["muted"], lt, tcx, ly, 8)
    oy_ = -th * 0.10 if label else -th * 0.18
    ofs = 50 * u
    if old_t:
        ot, ofs = _fit(ctx, old_t, nfont, ofs, avail, 0.6)
        txt(a, nfont, ofs, P["muted"], ot, tcx, oy_, 8)
        ow = ctx.text_w(ot, nfont, ofs)
        st0 = settle + 0.05
        strike = _seg(-ow / 2 - 8 * u, 6 * u, ow / 2 + 8 * u, -6 * u, max(3, 6 * u))
        x0c = int(cx + tcx - ow / 2 - 20 * u)
        clip = ""
        # strike drawn with a short wipe (in unrotated space – close enough at a small tilt)
        clip = f"\\clip({x0c},0,{x0c},{ctx.H})\\t(0,220,\\clip({x0c},0,{int(x0c + ow + 40 * u)},{ctx.H}))"
        shp(st0, strike, ctx.ui["red"], tcx, oy_, 9, extra=clip, sw=False, fi=0)
        _sfx(ctx, e, st0, "swipe", 0.35)
    nfs = 112 * u
    nt, nfs = _fit(ctx, new_t, nfont, nfs, avail, 0.45)
    ny = th * 0.17 if label else th * 0.12
    tn = settle + 0.35
    txt(tn, nfont, nfs, P["ink"], nt, tcx, ny, 9, sw=False, fi=60,
        anim="\\fscx30\\fscy30\\t(0,170,\\fscx112\\fscy112)\\t(170,280,\\fscx100\\fscy100)")
    _sfx(ctx, e, tn, "cash", 0.45)
    if badge:
        bfont = _numfont(ctx, e, badge)
        br = th * 0.25
        bt, bfs = _fit(ctx, badge, bfont, 46 * u, br * 1.6, 0.5)
        bx, by_ = xr - br * 0.55, -th / 2 - br * 0.25
        tb = tn + 0.35
        stamp = "\\fscx220\\fscy220\\t(0,140,\\fscx92\\fscy92)\\t(140,220,\\fscx100\\fscy100)"
        shp(tb, _circ(br), "#000000", bx, by_ + 8 * u, 10, alpha=0xB0, blur=round(12 * u), sw=False, anim=stamp, fi=60)
        shp(tb, _circ(br), P["accent"], bx, by_, 11, sw=False, anim=stamp, fi=60)
        st = ctx.style(bfont, bfs, P["on_acc"], "#000000", 0, 0)
        th_r = math.radians(tilt)
        ddx, ddy = cx + bx - ox, cy + by_ - oy
        rx = ox + ddx * math.cos(th_r) + ddy * math.sin(th_r)
        ry = oy - ddx * math.sin(th_r) + ddy * math.cos(th_r)
        ctx.add(tb, b, st, "{" + f"\\an5\\pos({rx:.0f},{ry + ctx.cap_shift(bfont, bfs):.0f})" + stamp
                + f"\\frz{tilt + 12}" + _fad(60) + "}" + esc(bt), 12)
        _sfx(ctx, e, tb, "pop", 0.4)
    ctx.register(a, b, cx - tw / 2 - 40 * u, cy - th / 2 - th * 0.5, cx + tw / 2 + 20 * u, cy + th / 2 + 30 * u)
    return a, b


# =========================================================================== 12. kpi

def ev_kpi(ctx, e):
    u = ctx.u
    val = _num(e.get("value"), 48250)
    frm = _num(e.get("from"), 0)
    pre = _str(e, "prefix", "", 6) or _str(e, "currency", "", 4)
    if "value" not in e and "prefix" not in e and "currency" not in e:
        pre = "$"
    suf = _str(e, "suffix", "", 8)
    dec = int(_clamp(_num(e.get("decimals"), _dec_for([val])), 0, 2))
    indian = bool(e.get("indian", "₹" in pre))
    delta = _num(e.get("delta"), 23 if "delta" not in e else None)
    dsuf = _str(e, "delta_suffix", "%", 4)
    a, b = ev_window(ctx, e, 3.8)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.84, 0.45, 880)
    pad = 50 * u
    lfont, nfont = _label_font(ctx), _numfont(ctx, e, pre + suf)
    label = _str(e, "label", "Monthly revenue", 40).upper()
    lfs = 30 * u
    big = _fmt(val, pre, suf, dec, indian)
    nfs = 140 * u
    _, nfs = _fit(ctx, big, nfont, nfs, w - 2 * pad, 0.4)
    dl = _str(e, "delta_label", "vs last month" if "delta" not in e else "", 40)
    spark = _nums(e.get("spark"), 24)
    if spark is None:
        rng = random.Random(int(abs(val)) % 9973 + 1)
        upw = (delta is None) or delta >= 0
        spark, v = [], 10.0
        for i in range(12):
            v += rng.uniform(-2.4, 3.6) if upw else rng.uniform(-3.6, 2.4)
            spark.append(v)
    show_spark = e.get("sparkline", True) is not False and len(spark) >= 2
    sh = 110 * u if show_spark else 0
    h = pad + lfs * 1.4 + 14 * u + nfs * 1.05 + (lfs * 1.4 if dl else 0) + (24 * u + sh if show_spark else 0) + pad
    cx, cy = _place(ctx, e, w, h)
    left, right, top = cx - w / 2 + pad, cx + w / 2 - pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P)
    ly = top + lfs * 0.7
    _text(ctx, a + 0.12, b, lfont, lfs, P["muted"], _fit(ctx, label, lfont, lfs, (right - left) * 0.6, 0.7)[0], left, ly, an=4,
          anim="rise", fi=240, layer=9, extra=f"\\fsp{1.5 * u:.1f}")
    ny = ly + lfs * 0.7 + 14 * u + nfs * 0.52
    t0 = a + 0.35
    run = min(1.3, (b - a) * 0.45)
    _roll(ctx, t0, run, b, nfont, nfs, P["ink"], left, lambda p: ny, lambda p: _fmt(frm + (val - frm) * p, pre, suf, dec, indian),
          an=4, layer=10, last="\\fscx104\\fscy104\\t(0,160,\\fscx100\\fscy100)")
    if delta is not None:
        up = delta >= 0
        if P["dark"]:
            pbg, pfg = ("#1E3A28", "#4ADE80") if up else ("#3D1E1E", "#FF7A70")
        else:
            pbg, pfg = ("#E3F5E8", "#178A3E") if up else ("#FDE8E6", "#D1302A")
        dt = ("+" if up and delta > 0 else "") + _fmt(delta, "", dsuf, _dec_for([delta]))
        if not up:
            dt = "−" + _fmt(abs(delta), "", dsuf, _dec_for([delta]))
            if nfont != "inter-extrabold" and "−" not in (ctx.font(nfont).get("adv") or {"−": 1}):
                dt = "-" + dt[1:]
        dfs = 32 * u
        dw = ctx.text_w(dt, nfont, dfs) + dfs * 0.8 + 52 * u
        dh = dfs * 1.65
        dcx = right - dw / 2
        td = t0 + run - 0.1
        _shape(ctx, td, b, rrect(dw, dh, dh / 2, -dw / 2, -dh / 2), pbg, dcx, ly, "pop", 80, layer=10)
        _shape(ctx, td, b, _tri(dfs * 0.62, 0, 0, up), pfg, right - dw + 22 * u + dfs * 0.36, ly, "pop", 80, layer=11)
        _text(ctx, td, b, nfont, dfs, pfg, dt, right - dw + 26 * u + dfs * 0.8, ly, an=4, anim="pop", fi=80, layer=11)
    y = ny + nfs * 0.53
    if dl:
        _text(ctx, t0 + 0.2, b, lfont, lfs, P["muted"], _fit(ctx, dl, lfont, lfs, right - left, 0.7)[0], left, y + lfs * 0.6,
              an=4, anim="rise", fi=240, layer=9)
        y += lfs * 1.4
    if show_spark:
        y += 24 * u
        lo, hi = min(spark), max(spark)
        sp = (hi - lo) or 1
        pts = [(left + (right - left) * i / (len(spark) - 1), y + sh - (v - lo) / sp * sh * 0.9 - sh * 0.05)
               for i, v in enumerate(spark)]
        ts = t0 + 0.1
        T = run + 0.2
        cx0, cx1 = int(left - 10 * u), int(right + 12 * u)
        clip = f"\\clip({cx0},0,{cx0},{ctx.H})\\t(0,{_ms(T)},\\clip({cx0},0,{cx1},{ctx.H}))"
        _abs(ctx, ts, b, _poly(pts + [(right, y + sh), (left, y + sh)]), P["accent"], 0, layer=7,
             alpha=0xD4 if P["dark"] else 0xC4, extra=clip)
        if not P["dark"] and _contrast(P["accent"], P["panel"]) < 1.6:
            _abs(ctx, ts, b, _polyline(pts, 9 * u), P["ink"], 0, layer=8, extra=clip)
        _abs(ctx, ts, b, _polyline(pts, 5 * u), P["accent"], 0, layer=8, extra=clip)
        _shape(ctx, ts + T - 0.05, b, _circ(10 * u), P["accent"], pts[-1][0], pts[-1][1], "pop", 60, layer=9,
               outline=P["ink"] if not P["dark"] else None, bord=round(3 * u) if not P["dark"] else 0)
    money = bool(re.search(r"[$₹€£¥]", pre + suf))
    _sfx(ctx, e, t0 + run, "cash" if money else "ding", 0.4)
    return a, b


# =========================================================================== 13. calendar

MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november",
          "december"]


def _month(v, default):
    if v is None:
        return default
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return int(_clamp(v, 1, 12))
    s = str(v).strip().lower()
    for i, m in enumerate(MONTHS):
        if s[:3] == m[:3]:
            return i + 1
    x = _num(s, None)
    return int(_clamp(x, 1, 12)) if x else default


def ev_calendar(ctx, e):
    u = ctx.u
    today = datetime.date.today()
    year, month, day = today.year, today.month, None
    if e.get("date"):
        m = re.match(r"\s*(\d{4})-(\d{1,2})(?:-(\d{1,2}))?", str(e["date"]))
        if m:
            year, month = int(m.group(1)), int(_clamp(int(m.group(2)), 1, 12))
            if m.group(3):
                day = int(m.group(3))
    month = _month(e.get("month"), month)
    year = int(_clamp(_num(e.get("year"), year), 1900, 2200))
    day = int(_num(e.get("day"), day if day else (today.day if (year, month) == (today.year, today.month) else 15)))
    ndays = _cal.monthrange(year, month)[1]
    day = int(_clamp(day, 1, ndays))
    label = _str(e, "label", "Launch day" if ("day" not in e and "label" not in e and "date" not in e) else "", 30)
    marked = [int(x) for x in (_nums(e.get("marked"), 31) or []) if 1 <= x <= ndays]
    sunday = str(e.get("week_start", "monday")).lower().startswith("sun")
    a, b = ev_window(ctx, e, 3.8)
    _sfx_custom(ctx, e, a)
    P = _pal(ctx, e)
    w = _width(ctx, e, 0.8, 0.42, 780)
    pad = 46 * u
    cal = _cal.Calendar(6 if sunday else 0).monthdayscalendar(year, month)
    nweeks = len(cal)
    cell = (w - 2 * pad) / 7
    rowh = min(cell, 92 * u)
    hfs = 46 * u
    wfs = 26 * u
    dfs = min(36 * u, rowh * 0.42)
    head_h = hfs * 1.4 + 26 * u
    wk_h = wfs * 2.0
    h = pad + head_h + wk_h + nweeks * rowh + pad * (1.25 if label else 0.7)
    cx, cy = _place(ctx, e, w, h + (40 * u if label else 0))
    left, right, top = cx - w / 2 + pad, cx + w / 2 - pad, cy - h / 2 + pad
    _panel(ctx, a, b, cx, cy, w, h, P, radius=40)
    bfont, lfont = _body(ctx), _label_font(ctx)
    title = f"{MONTHS[month - 1].capitalize()}"
    hy = top + hfs * 0.6
    _text(ctx, a + 0.12, b, bfont, hfs, P["ink"], title, left, hy, an=4, anim="rise", fi=240, layer=9)
    tw_ = ctx.text_w(title, bfont, hfs)
    _text(ctx, a + 0.16, b, bfont, hfs, P["muted"], str(year), left + tw_ + 16 * u, hy, an=4, anim="rise", fi=240, layer=9)
    # chevrons
    for k, sgn in ((0, -1), (1, 1)):
        chx = right - 14 * u - (1 - k) * 60 * u
        pts = [(chx - sgn * 7 * u, hy - 13 * u), (chx + sgn * 7 * u, hy), (chx - sgn * 7 * u, hy + 13 * u)]
        _abs(ctx, a + 0.2, b, _polyline(pts, 4.5 * u), P["muted"], 260, layer=9)
    wy = top + head_h + wfs * 0.6
    names = ["M", "T", "W", "T", "F", "S", "S"]
    if sunday:
        names = ["S"] + names[:6]
    for i, nm in enumerate(names):
        _text(ctx, a + 0.18, b, lfont, wfs, P["muted"], nm, left + cell * (i + 0.5), wy, fi=260, layer=9)
    gy0 = top + head_h + wk_h
    _abs(ctx, a + 0.18, b, rect(right - left, max(1, 1.5 * u), left, gy0 - 14 * u), P["grid"], 260, layer=7)
    target = None
    for r_, week in enumerate(cal):
        for c_, d in enumerate(week):
            if not d:
                continue
            x, y = left + cell * (c_ + 0.5), gy0 + rowh * (r_ + 0.5)
            weekend = (c_ >= 5) if not sunday else (c_ in (0, 6))
            col = P["muted"] if weekend else P["ink"]
            td = a + 0.22 + 0.008 * (r_ * 7 + c_)
            if d == day:
                target = (x, y)
            _text(ctx, td, b, lfont, dfs, col, str(d), x, y, fi=200, layer=9)
            if d in marked and d != day:
                _shape(ctx, td + 0.2, b, _circ(4.5 * u), P["accent"] if P["dark"] else P["ink"], x, y + dfs * 0.78, "pop", 60, layer=9)
    if target:
        x, y = target
        t0 = a + 0.75
        run = 0.6
        rr = min(cell, rowh) * 0.46
        thk = max(3, 5.5 * u)
        nfr = max(1, int(run * FPS))
        for i in range(nfr + 1):
            p = _ease_io(i / nfr)
            s0 = t0 + i * FR
            s1 = min(b, t0 + (i + 1) * FR) if i < nfr else b
            if s0 >= b:
                break
            path = _arc(x, y, rr + thk / 2, rr - thk / 2, -40, -40 + 385 * p, 6)
            if path:
                ctx.shape(s0, s1, path, P["accent"], 0, "\\an7\\pos(0,0)" + (f"\\fad(0,{FO})" if i == nfr else ""), 10)
        # filled dot under the number after circling
        _shape(ctx, t0 + run, b, _circ(rr - thk), P["accent"], x, y, "pop", 60, layer=9, alpha=0x30 if not P["dark"] else 0x10)
        _text(ctx, t0 + run, b, bfont, dfs, P["on_acc"], str(day), x, y, anim="pop", fi=60, layer=11)
        _sfx(ctx, e, t0, "swipe", 0.3)
        if label:
            cfont = _numfont(ctx, e, label)
            cfs = 34 * u
            lt, cfs = _fit(ctx, label, cfont, cfs, w * 0.8, 0.7)
            cyy = cy + h / 2
            _chip(ctx, t0 + run + 0.1, b, P, lt, False, cx, cyy, cfont, cfs, layer=12)
            _sfx(ctx, e, t0 + run + 0.1, "ding", 0.35)
    return a, b


# =========================================================================== registry

def _guard(fn):
    """Keep every line/sound an effect emits inside its returned window (very short windows stay valid)."""
    def run(ctx, e):
        if not isinstance(e, dict):
            return None
        n_lines, n_sfx = len(ctx.lines), len(ctx.extra_sfx)
        r = fn(ctx, e)
        if not r:
            return r
        a, b = r
        out = []
        for ln in ctx.lines[n_lines:]:
            s0, s1 = max(ln[2], a), min(ln[3], b)
            if s1 - s0 > 0.005:
                out.append(ln[:2] + (s0, s1) + ln[4:])
        ctx.lines[n_lines:] = out
        ctx.extra_sfx[n_sfx:] = [x for x in ctx.extra_sfx[n_sfx:] if a - 0.05 <= x[0] <= b]
        return r
    run.__name__ = fn.__name__
    return run


EVENTS = {
    "bar_chart": ev_bar_chart,
    "line_chart": ev_line_chart,
    "progress_ring": ev_progress_ring,
    "stat_bars": ev_stat_bars,
    "post_wall": ev_post_wall,
    "dial": ev_dial,
    "list_panel": ev_list_panel,
    "timeline": ev_timeline,
    "rating": ev_rating,
    "versus": ev_versus,
    "price_tag": ev_price_tag,
    "kpi": ev_kpi,
    "calendar": ev_calendar,
}
EVENTS = {k: _guard(v) for k, v in EVENTS.items()}

_COMMON = "theme light|dark, position top|upper|center|lower|bottom|0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name)"

DOCS = {
    "bar_chart": "Editorial bar chart on a card: bars grow staggered from the baseline, values count up on top, max (or "
                 "`highlight` index) bar in accent. Options: values[] (≤8), labels[], title, sub, prefix/currency, suffix, "
                 "decimals, highlight (index|false); " + _COMMON + ". Default position lower.",
    "line_chart": "Line chart: line draws left→right over a faint grid with dots and a soft area fill; a chip (default "
                  "'SCALE ↗', arrow drawn) pops at the last point. Options: values[] (≤12), labels[] (default M T W T F S S "
                  "for 7 values), title, sub, label (chip text, '' to hide), area true|false; " + _COMMON + ".",
    "progress_ring": "Circular progress ring filling to value % with the number counting up in the centre and a label below. "
                     "Options: value (0-100), label, title, suffix (default %), decimals, radius (px at 1080); " + _COMMON + ".",
    "stat_bars": "Horizontal comparison bars filling in sequence with labels and counting percentages; top item in accent. "
                 "Options: items [{label, value}] or labels[]+values[] (≤6), max (default 100), prefix, suffix (default %), "
                 "highlight, title, sub; " + _COMMON + ".",
    "post_wall": "Wall of rounded grey thumbnail tiles filling row by row across the top half, with an accent counter chip "
                 "counting from→to (e.g. 823 POSTS → 1,711 POSTS). Options: from, to, label (default posts), prefix, cols, "
                 "rows, height (0-1, default 0.44), run (s), position (default top), theme.",
    "dial": "Big cream clock/day dial (ticks, serif numerals, ink lines) sliding in from the side, partly off-frame like a "
            "sundial, its hand sweeping. Options: side right|left, labels[] (default 12,1..11), from/to (label positions, e.g. "
            "7 → 11.5), word (text rotating along the hand), size (0.2-0.65 of min(W,H)), offset (0-0.6 off-frame), position "
            "(y), fill, color, accent, theme dark.",
    "list_panel": "Agenda side panel ('IN THIS VIDEO 03/05'): header + numbered items; an accent highlight pill moves to "
                  "each item at `times` (phrases or seconds), past items get a drawn ✓. Dark glass by default. Options: "
                  "items[] (≤8), times[], title, side right|left, width (default 0.36 of W), position (default upper), theme "
                  "light|dark, accent.",
    "timeline": "Steps with dots joined by a line that draws on; each label appears in turn and the current step glows in "
                "accent (past steps get a ✓). Horizontal in 16:9/1:1, vertical in 9:16 (or `direction`). Options: steps[] "
                "(strings or {label, sub}) ≤6, subs[]/dates[], times[], direction horizontal|vertical, title; " + _COMMON + ".",
    "rating": "Star rating card: stars fill one by one to value (halves supported) with a counting score '4.5 /5' and a "
              "label. Options: value, stars (3-10, default 5), label, title, score true|false; " + _COMMON + ".",
    "versus": "A vs B comparison card: two columns with titles and 2-4 bullets revealed left then right, a round VS badge, "
              "optional winner highlight. Options: a/b (or left/right) as {title, items[]} or titles[] + items_a[]/items_b[], "
              "winner a|b, uppercase; " + _COMMON + ".",
    "price_tag": "Swinging price tag (with hole and string): old price struck through, new price pops in, round discount "
                 "badge stamps on. Options: old, new, currency (default ₹, Indian digit grouping), badge (auto '-40%', "
                 "'' to hide), label, tilt, decimals; " + _COMMON + ".",
    "kpi": "KPI tile: small label, big number counting up, ▲/▼ delta pill (green/red, drawn triangle), optional note and a "
           "drawn sparkline. Options: value, from, prefix/currency, suffix, decimals, label, delta (e.g. 23 or -8), "
           "delta_suffix (default %), delta_label, spark[] (auto if omitted), sparkline true|false; " + _COMMON + ".",
    "calendar": "Mini month calendar card; the `day` gets circled with a draw-on accent ring and an optional label chip "
                "('Launch day'). Options: day, month (1-12 or name), year, date (YYYY-MM-DD), label, marked[] (dots), "
                "week_start monday|sunday; " + _COMMON + ".",
}

HIDE_CAPTIONS = {"bar_chart", "line_chart", "progress_ring", "stat_bars", "versus", "timeline", "rating", "price_tag", "kpi",
                 "calendar"}
