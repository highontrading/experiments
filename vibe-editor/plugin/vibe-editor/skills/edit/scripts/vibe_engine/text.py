"""ASS drawing/text foundation: colours, shapes, exact text metrics, layout manager, animations, Ctx."""
import math
import re

from .core import fonts_reg, resolve_font, norm_word, info, warn

# --------------------------------------------------------------------------- colours / time


NAMED_COLORS = {"white": "FFFFFF", "black": "000000", "red": "FF3B30", "green": "34C759", "blue": "0A84FF",
                "yellow": "FFD400", "orange": "FF9500", "pink": "FF2D78", "purple": "8B5CF6", "gray": "8A8A8E",
                "grey": "8A8A8E", "cream": "F6F4EF", "gold": "F2C66D", "teal": "14B8A6", "navy": "1E3A8A"}


def _hex(h):
    if not isinstance(h, str):
        h = "#FFFFFF"
    h = NAMED_COLORS.get(h.strip().lower(), h)
    h = (h or "#FFFFFF").strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if not re.fullmatch(r"[0-9a-fA-F]{6}", h):
        h = "FFFFFF"
    return h.upper()


def ass_color(hexstr, alpha=0):
    h = _hex(hexstr)
    return f"&H{alpha:02X}{h[4:6]}{h[2:4]}{h[0:2]}"


def c_tag(hexstr):
    h = _hex(hexstr)
    return f"&H{h[4:6]}{h[2:4]}{h[0:2]}&"


def a_tag(alpha):
    return f"&H{max(0, min(255, int(alpha))):02X}&"


def ass_time(t):
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def ass_header(W, H, styles):
    out = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
           "WrapStyle: 2", "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "",
           "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
           "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, "
           "MarginR, MarginV, Encoding"]
    for st in styles:
        name, font, size, prim, sec, outc, back, bold, italic, bstyle, bord, shad = st
        out.append(f"Style: {name},{font},{size},{prim},{sec},{outc},{back},{-1 if bold else 0},{-1 if italic else 0},"
                   f"0,0,100,100,0,0,{bstyle},{bord},{shad},5,0,0,0,1")
    out += ["", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text", ""]
    return "\n".join(out)


def esc(text):
    return str(text).replace("\\", "/").replace("{", "(").replace("}", ")")


# --------------------------------------------------------------------------- shapes (ASS drawing paths)

def _f(v):
    return f"{v:.0f}"


def rrect(w, h, r, x=0, y=0):
    r = max(0, min(r, w / 2, h / 2))
    k = r * 0.4477
    x2, y2 = x + w, y + h
    return " ".join([f"m {_f(x + r)} {_f(y)}", f"l {_f(x2 - r)} {_f(y)}",
                     f"b {_f(x2 - k)} {_f(y)} {_f(x2)} {_f(y + k)} {_f(x2)} {_f(y + r)}",
                     f"l {_f(x2)} {_f(y2 - r)}", f"b {_f(x2)} {_f(y2 - k)} {_f(x2 - k)} {_f(y2)} {_f(x2 - r)} {_f(y2)}",
                     f"l {_f(x + r)} {_f(y2)}", f"b {_f(x + k)} {_f(y2)} {_f(x)} {_f(y2 - k)} {_f(x)} {_f(y2 - r)}",
                     f"l {_f(x)} {_f(y + r)}", f"b {_f(x)} {_f(y + k)} {_f(x + k)} {_f(y)} {_f(x + r)} {_f(y)}"])


def rect(w, h, x=0, y=0):
    return f"m {_f(x)} {_f(y)} l {_f(x + w)} {_f(y)} {_f(x + w)} {_f(y + h)} {_f(x)} {_f(y + h)}"


def ellipse(rx, ry, cx=0, cy=0):
    k = 0.5523
    return " ".join([f"m {_f(cx)} {_f(cy - ry)}",
                     f"b {_f(cx + rx * k)} {_f(cy - ry)} {_f(cx + rx)} {_f(cy - ry * k)} {_f(cx + rx)} {_f(cy)}",
                     f"b {_f(cx + rx)} {_f(cy + ry * k)} {_f(cx + rx * k)} {_f(cy + ry)} {_f(cx)} {_f(cy + ry)}",
                     f"b {_f(cx - rx * k)} {_f(cy + ry)} {_f(cx - rx)} {_f(cy + ry * k)} {_f(cx - rx)} {_f(cy)}",
                     f"b {_f(cx - rx)} {_f(cy - ry * k)} {_f(cx - rx * k)} {_f(cy - ry)} {_f(cx)} {_f(cy - ry)}"])


def circle(r, cx=0, cy=0):
    return ellipse(r, r, cx, cy)


def polygon(pts):
    if not pts:
        return ""
    return f"m {_f(pts[0][0])} {_f(pts[0][1])} " + " ".join(f"l {_f(x)} {_f(y)}" for x, y in pts[1:])


def star(r, cx=0, cy=0, points=5, inner=0.45):
    pts = []
    for i in range(points * 2):
        ang = -math.pi / 2 + i * math.pi / points
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return polygon(pts)


def check_path(s, x=0, y=0):
    pts = [(0.18, 0.52), (0.40, 0.74), (0.82, 0.28), (0.74, 0.20), (0.40, 0.58), (0.26, 0.44)]
    return polygon([(x + px * s, y + py * s) for px, py in pts])


def thick_line(x1, y1, x2, y2, w):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    return polygon([(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)])


def arrow_path(length, w, head=None):
    """Arrow pointing right, starting at 0,0 (vertical centre)."""
    head = head or w * 3
    return polygon([(0, -w / 2), (length - head, -w / 2), (length - head, -head * 0.6), (length, 0),
                    (length - head, head * 0.6), (length - head, w / 2), (0, w / 2)])


def heart(s, cx=0, cy=0):
    return (f"m {_f(cx)} {_f(cy + s * 0.35)} b {_f(cx - s * 0.9)} {_f(cy - s * 0.25)} {_f(cx - s * 0.45)} {_f(cy - s * 0.95)} "
            f"{_f(cx)} {_f(cy - s * 0.45)} b {_f(cx + s * 0.45)} {_f(cy - s * 0.95)} {_f(cx + s * 0.9)} {_f(cy - s * 0.25)} "
            f"{_f(cx)} {_f(cy + s * 0.35)}")


def path_poly(points, w):
    """Stroke through a polyline as joined thick segments (separate subpaths)."""
    return " ".join(thick_line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], w)
                    for i in range(len(points) - 1))


# --------------------------------------------------------------------------- positions

POS_Y = {"top": 0.15, "upper": 0.27, "center": 0.45, "middle": 0.45, "lower": 0.62, "bottom": 0.76}


def ypos(ctx, v, default):
    if v is None:
        v = default
    if isinstance(v, (int, float)):
        return ctx.H * float(v)
    s = str(v)
    if s in POS_Y:
        return ctx.H * POS_Y[s]
    try:
        return ctx.H * float(s)
    except ValueError:
        return ctx.H * (POS_Y.get(default, 0.45) if isinstance(default, str) else float(default))


def xpos(ctx, v, default=0.5):
    if v is None:
        v = default
    if isinstance(v, str):
        v = {"left": 0.28, "center": 0.5, "right": 0.72}.get(v, default)
    return ctx.W * float(v)


def ev_window(ctx, e, default_dur):
    a = ctx.t(e.get("at"), 0.0)
    if e.get("until") is not None:
        b = ctx.t(e.get("until"), a + default_dur, end=True)
    else:
        try:
            b = a + float(e.get("dur", default_dur))
        except (TypeError, ValueError):
            b = a + default_dur
    a = max(0.0, min(a, ctx.dur - 0.2))
    b = min(b, ctx.dur)
    return a, max(b, a + 0.2)


# --------------------------------------------------------------------------- animations

def enter_tag(kind, x, y, u, dur_ms=1000, delay=0):
    """\\pos/\\move + transforms for an element anchored at its centre (\\an5)."""
    x, y = round(x), round(y)
    d = int(delay)
    k = (kind or "pop").lower()
    if k == "none":
        return f"\\an5\\pos({x},{y})"
    if k == "fade":
        return f"\\an5\\pos({x},{y})\\alpha&HFF&\\t({d},{d + 220},\\alpha&H00&)"
    if k == "pop":
        return (f"\\an5\\pos({x},{y})\\fscx30\\fscy30\\alpha&HFF&\\t({d},{d + 60},\\alpha&H00&)"
                f"\\t({d},{d + 170},\\fscx110\\fscy110)\\t({d + 170},{d + 260},\\fscx100\\fscy100)")
    if k in ("slide", "slide-up", "up"):
        return f"\\an5\\move({x},{y + round(90 * u)},{x},{y},{d},{d + 280})\\alpha&HFF&\\t({d},{d + 200},\\alpha&H00&)"
    if k in ("slide-down", "down"):
        return f"\\an5\\move({x},{y - round(90 * u)},{x},{y},{d},{d + 280})\\alpha&HFF&\\t({d},{d + 200},\\alpha&H00&)"
    if k in ("slide-left", "left"):
        return f"\\an5\\move({x + round(160 * u)},{y},{x},{y},{d},{d + 300})\\alpha&HFF&\\t({d},{d + 200},\\alpha&H00&)"
    if k in ("slide-right", "right"):
        return f"\\an5\\move({x - round(160 * u)},{y},{x},{y},{d},{d + 300})\\alpha&HFF&\\t({d},{d + 200},\\alpha&H00&)"
    if k == "drop":
        return (f"\\an5\\move({x},{y - round(260 * u)},{x},{y},{d},{d + 240})\\t({d + 240},{d + 320},\\fscy90\\fscx106)"
                f"\\t({d + 320},{d + 400},\\fscy100\\fscx100)")
    if k == "blur":
        return f"\\an5\\pos({x},{y})\\blur{round(18 * u)}\\alpha&HFF&\\t({d},{d + 320},\\blur0\\alpha&H00&)"
    if k == "rise":
        return (f"\\an5\\move({x},{y + round(40 * u)},{x},{y},{d},{d + 380})\\blur{round(6 * u)}\\alpha&HFF&"
                f"\\t({d},{d + 380},\\blur0\\alpha&H00&)")
    if k == "bounce":
        return (f"\\an5\\move({x},{y - round(140 * u)},{x},{y},{d},{d + 220})\\t({d + 220},{d + 300},\\fscy84\\fscx112)"
                f"\\t({d + 300},{d + 380},\\fscy106\\fscx96)\\t({d + 380},{d + 450},\\fscy100\\fscx100)")
    if k == "elastic":
        return (f"\\an5\\pos({x},{y})\\fscx0\\fscy0\\t({d},{d + 160},\\fscx118\\fscy118)\\t({d + 160},{d + 260},\\fscx92\\fscy92)"
                f"\\t({d + 260},{d + 340},\\fscx104\\fscy104)\\t({d + 340},{d + 420},\\fscx100\\fscy100)")
    if k == "flip":
        return f"\\an5\\pos({x},{y})\\frx90\\alpha&HFF&\\t({d},{d + 320},\\frx0\\alpha&H00&)"
    if k == "zoom":
        return f"\\an5\\pos({x},{y})\\fscx60\\fscy60\\alpha&HFF&\\t({d},{d + 260},\\fscx100\\fscy100\\alpha&H00&)"
    if k == "punch":
        return f"\\an5\\pos({x},{y})\\fscx170\\fscy170\\alpha&HFF&\\t({d},{d + 150},\\fscx100\\fscy100\\alpha&H00&)"
    if k == "stamp":
        return (f"\\an5\\pos({x},{y})\\frz-7\\fscx240\\fscy240\\alpha&H80&"
                f"\\t({d},{d + 120},\\fscx92\\fscy92\\alpha&H00&)\\t({d + 120},{d + 190},\\fscx100\\fscy100)")
    if k == "spin":
        return f"\\an5\\pos({x},{y})\\frz-180\\fscx20\\fscy20\\t({d},{d + 320},\\frz0\\fscx100\\fscy100)"
    if k == "swing":
        return (f"\\an5\\pos({x},{y})\\frz-14\\alpha&HFF&\\t({d},{d + 120},\\alpha&H00&)\\t({d},{d + 220},\\frz6)"
                f"\\t({d + 220},{d + 340},\\frz-2)\\t({d + 340},{d + 420},\\frz0)")
    if k == "zoom-out":
        return f"\\an5\\pos({x},{y})\\fscx100\\fscy100\\t({d},{max(d + 300, dur_ms)},\\fscx114\\fscy114)\\alpha&HFF&\\t({d},{d + 200},\\alpha&H00&)"
    if k == "flicker":
        seq = "".join(f"\\t({d + i * 50},{d + i * 50 + 1},\\alpha&H{('00' if i % 2 else 'C0')}&)" for i in range(7))
        return f"\\an5\\pos({x},{y})\\alpha&HFF&{seq}\\t({d + 360},{d + 361},\\alpha&H00&)"
    return f"\\an5\\pos({x},{y})\\fscx30\\fscy30\\t({d},{d + 170},\\fscx110\\fscy110)\\t({d + 170},{d + 260},\\fscx100\\fscy100)"


def exit_tag(kind, dur_ms):
    k = (kind or "fade").lower()
    s = max(0, dur_ms - 180)
    if k == "none":
        return ""
    if k in ("shrink", "pop"):
        return f"\\t({s},{dur_ms},\\fscx0\\fscy0)"
    if k == "blur":
        return f"\\t({s},{dur_ms},\\blur20\\alpha&HFF&)"
    if k == "up":
        return f"\\t({s},{dur_ms},\\fscy130\\alpha&HFF&)"
    return f"\\t({s},{dur_ms},\\alpha&HFF&)"


# --------------------------------------------------------------------------- context

class Ctx:
    def __init__(self, W, H, brand, owords, duration, preview=False):
        self.W, self.H = W, H
        self.u = min(W, H) / 1080.0
        self.brand = brand
        self.fonts = fonts_reg()
        self.words = owords
        self.dur = duration
        self.preview = preview
        self.lines = []  # (group, layer, start, end, style, text, behind)
        self.styles = {}
        self.extra_sfx = []  # (time, name, vol)
        self.boxes = []  # (a, b, x0, y0, x1, y1, kind, group)
        self.group = None
        self.behind = False
        self.force_front = set()
        self.video_requests = []  # video-level needs registered by ASS effects (glass blur, spotlight …)
        portrait = H > W
        self.safe_top = H * (0.07 if portrait else 0.05)
        self.safe_bottom = H * (0.86 if portrait else 0.94)
        self.safe_left = W * 0.05
        self.safe_right = W * 0.95
        acc = brand.get("colors", {}).get("accent") or "#FFD400"
        self.ui = {"paper": "#F6F4EF", "card": "#FFFFFF", "ink": "#161616", "muted": "#8A8A8E", "line": "#E4E2DC",
                   "dark": "#161616", "dark2": "#262628", "on_dark": "#F4F3EF", "glass": "#FFFFFF",
                   "green": "#34C759", "red": "#FF3B30", "blue": "#0A84FF", "accent": acc}

    # ---- colours / fonts
    def col(self, key, fallback):
        return self.brand.get("colors", {}).get(key) or fallback

    @property
    def accent(self):
        return self.col("accent", "#FFD400")

    def font(self, key):
        return self.fonts.get(resolve_font(key)) or self.fonts["poppins-black"]

    def fkey(self, role):
        return resolve_font(self.brand.get("fonts", {}).get(role) or {"title": "poppins-black", "body": "inter-extrabold",
                                                                          "serif": "instrument-serif"}.get(role, "poppins-black"))

    def size_px(self, key, nominal):
        return max(6, round(nominal * self.font(key).get("norm", 1.0)))

    def text_w(self, text, key, nominal):
        f = self.font(key)
        text = re.sub(r"\*", "", str(text))
        px = self.size_px(key, nominal)
        if "adv" in f and "den" in f:
            adv = f["adv"]
            avg = f.get("avg", f["den"] * 0.4)
            tot = sum(adv.get(ch, avg if not ch.isspace() else adv.get(" ", avg * 0.5)) for ch in text)
            return tot * px / f["den"]
        return len(text) * f.get("width", 0.5) * px

    def cap_shift(self, key, nominal):
        """Pixels to move \\an5 text down so capital letters are visually centred."""
        f = self.font(key)
        if not all(k in f for k in ("den", "asc", "cap")):
            return 0
        px = self.size_px(key, nominal)
        return (f["den"] / 2 - (f["asc"] - f["cap"] / 2)) * px / f["den"]

    def style(self, font_key, size=60, color="#FFFFFF", outline="#000000", bord=0, shad=0, box=False, back=None,
              back_alpha=0x78, secondary=None):
        key_font = resolve_font(font_key)
        f = self.fonts.get(key_font) or self.fonts["poppins-black"]
        px = self.size_px(key_font, size)
        key = (f["family"], px, color, outline, bord, shad, box, back, back_alpha, secondary, f.get("bold"), f.get("italic"))
        for n, (k, _) in self.styles.items():
            if k == key:
                return n
        name = f"S{len(self.styles)}"
        self.styles[name] = (key, (name, f["family"], px, ass_color(color), ass_color(secondary or color),
                                   ass_color(outline), ass_color(back or "#000000", back_alpha),
                                   f.get("bold", False), f.get("italic", False), 3 if box else 1, bord, shad))
        return name

    def shape_style(self):
        return self.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)

    # ---- output lines
    def add(self, start, end, style, text, layer=1, behind=None):
        if end <= start or end <= 0 or start >= self.dur + 0.01:
            return
        end = min(end, self.dur)
        b = self.behind if behind is None else behind
        if self.group in self.force_front:
            b = False
        self.lines.append((self.group, layer, start, end, style, text, b))

    def shape(self, start, end, path, color="#FFFFFF", alpha=0, tag="", layer=4, x=0, y=0, an=7, blur=0,
              outline=None, bord=0):
        st = self.shape_style()
        extra = f"\\blur{blur}" if blur else ""
        oc = f"\\3c{c_tag(outline)}" if outline else ""
        pos = "" if ("\\pos" in tag or "\\move" in tag) else f"\\an{an}\\pos({round(x)},{round(y)})"
        self.add(start, end, st, "{" + pos + tag + f"\\bord{bord}\\shad0{oc}\\1c{c_tag(color)}\\1a{a_tag(alpha)}{extra}\\p1" + "}" + path,
                 layer=layer)

    # ---- layout manager
    def register(self, a, b, x0, y0, x1, y1, kind="graphic"):
        self.boxes.append((a, b, min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1), kind, self.group))

    def occupied(self, a, b, x0, y0, x1, y1, margin=None, kinds=None):
        m = (18 * self.u) if margin is None else margin
        for (ba, bb, bx0, by0, bx1, by1, kind, g) in self.boxes:
            if kinds and kind not in kinds:
                continue
            if a < bb - 0.02 and b > ba + 0.02 and x0 < bx1 + m and x1 > bx0 - m and y0 < by1 + m and y1 > by0 - m:
                return True
        return False

    def clamp_y(self, yc, h):
        top, bot = self.safe_top + h / 2, self.safe_bottom - h / 2
        if top > bot:
            return (self.safe_top + self.safe_bottom) / 2
        return min(max(yc, top), bot)

    def clamp_x(self, xc, w):
        lo, hi = self.safe_left + w / 2, self.safe_right - w / 2
        if lo > hi:
            return self.W / 2
        return min(max(xc, lo), hi)

    # ---- text helpers
    def wrap(self, text, font_key, size, max_w, max_lines=4, min_size=None):
        size = float(size)
        min_size = min_size or size * 0.45
        text = re.sub(r"\*([^*]+)\*", lambda m: " ".join(f"*{w}*" for w in m.group(1).split()), str(text))
        raw_lines = [ln for ln in re.split(r"\\n|\n|\|", text)]
        lines = raw_lines
        for _ in range(40):
            lines = []
            for rl in raw_lines:
                cur = ""
                for wd in rl.split():
                    cand = (cur + " " + wd).strip()
                    if cur and self.text_w(cand, font_key, size) > max_w:
                        lines.append(cur)
                        cur = wd
                    else:
                        cur = cand
                lines.append(cur)
            widest = max([self.text_w(ln, font_key, size) for ln in lines] or [0])
            if (widest <= max_w and len(lines) <= max_lines) or size <= min_size:
                return lines, size
            size *= 0.93
        return lines, size

    def markup(self, line, color, accent):
        parts = re.split(r"(\*[^*]+\*)", esc(line))
        out = ""
        for p in parts:
            if p.startswith("*") and p.endswith("*") and len(p) > 2:
                out += "{\\c" + c_tag(accent) + "}" + p[1:-1] + "{\\c" + c_tag(color) + "}"
            else:
                out += p.replace("*", "")
        return out

    def draw_lines(self, a, b, style, lines, font_key, size, x, yc, lh, tagfn, color, accent, layer, stagger=0.0,
                   extra="", register=True, clamp=True, kind="graphic"):
        """Place each line ourselves: tight identical spacing, capitals centred, kept inside the safe area."""
        block_h = lh * len(lines)
        if clamp:
            yc = self.clamp_y(yc, block_h)
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = self.cap_shift(font_key, size)
        maxw = 0
        for i, ln in enumerate(lines):
            yy = y0 + i * lh
            w = self.text_w(ln, font_key, size)
            maxw = max(maxw, w)
            xx = self.clamp_x(x, w) if clamp else x
            self.add(a + i * stagger, b, style, "{" + tagfn(xx, yy + shift, i) + extra + "}" + self.markup(ln, color, accent),
                     layer=layer)
        if register:
            self.register(a, b, x - maxw / 2, yc - block_h / 2, x + maxw / 2, yc + block_h / 2, kind)
        return yc, maxw, block_h

    def card(self, a, b, cx, cy, w, h, fill, alpha=0, radius=36, layer=4, shadow=True, anim="pop", outline=None,
             bord=0, register=True, delay=0):
        u = self.u
        path = rrect(w, h, radius * u)
        tag = enter_tag(anim, cx, cy, u, int((b - a) * 1000), delay)
        if shadow:
            stag = enter_tag(anim, cx, cy + 16 * u, u, int((b - a) * 1000), delay)
            self.shape(a, b, path, "#000000", 0xA0, stag + exit_tag("fade", int((b - a) * 1000)), layer, blur=round(22 * u))
        self.shape(a, b, path, fill, alpha, tag + exit_tag("fade", int((b - a) * 1000)), layer + 1, outline=outline, bord=bord)
        if register:
            self.register(a, b, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
        return tag

    # ---- time
    def find_phrase(self, phrase, occurrence=1, end=False):
        target = [norm_word(x) for x in str(phrase).split() if norm_word(x)]
        if not target:
            return None
        ws = [norm_word(w["text"]) for w in self.words]
        hits = 0
        for i in range(len(ws) - len(target) + 1):
            ok = True
            for k in range(len(target)):
                w = ws[i + k]
                if not w or not (w.startswith(target[k]) or target[k].startswith(w)):
                    ok = False
                    break
            if ok:
                hits += 1
                if hits == occurrence:
                    return self.words[i + len(target) - 1]["end"] if end else self.words[i]["start"]
        return None

    def t(self, v, default=0.0, end=False):
        if v is None:
            return default
        if isinstance(v, bool):
            return default
        if isinstance(v, (int, float)):
            return self.dur + v if v < 0 else float(v)
        s = str(v).strip()
        m = re.fullmatch(r"(-?)(?:(\d+):)?(\d+(?:\.\d+)?)", s)
        if m:
            val = int(m.group(2) or 0) * 60 + float(m.group(3))
            return self.dur - val if m.group(1) else val
        occ = 1
        mm = re.match(r"(.*)#(\d+)$", s)
        if mm:
            s, occ = mm.group(1).strip(), int(mm.group(2))
        r = self.find_phrase(s, occ, end)
        if r is None:
            warn(f"Phrase not found in speech: '{s}' — using {default:.1f}s")
            return default
        return r


def sizes_map(v, default):
    sizes = {"xs": 48, "s": 64, "m": 88, "l": 118, "xl": 148, "xxl": 190, "huge": 260}
    if v is None:
        return default
    if isinstance(v, str):
        return sizes.get(v, default)
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def theme_color(ctx, v):
    names = {"card": ctx.col("card", "#FFFFFF"), "accent": ctx.accent, "dark": ctx.col("dark", "#161616"),
             "text": ctx.col("text", "#FFFFFF"), "accent2": ctx.col("accent2", "#8B5CF6"), "paper": ctx.ui["paper"],
             "ink": ctx.ui["ink"], "muted": ctx.ui["muted"], "white": "#FFFFFF", "black": "#000000"}
    return names.get(v, v)


def log(msg):
    info(msg)
