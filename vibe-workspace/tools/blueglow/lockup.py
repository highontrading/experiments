"""Blue Glow kinetic typography -> Vibe Editor `ass` events.

A lock-up is a stack of lines (kicker / hero / sub). Each line can mix segments of different fonts.
Letters reveal in scrambled (or left-to-right) order with blur -> sharp, a per-letter colour gradient
and a soft glow layer underneath. Exit = random letter dissolve or a quick fade.
"""
import os
import random
import sys

ENGINE_DIR = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/scripts"
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)
from vibe_engine.text import Ctx  # noqa: E402

W, H = 1080, 1920
_CTX = Ctx(W, H, {"colors": {}, "fonts": {}}, [], 60.0)

GRAD = {
    "cyan": ["#54BAE6", "#6CD6E8", "#CCDBE4"],
    "gold": ["#FFC93A", "#FFE36A", "#FFF4C2"],
    "white": ["#FFFFFF", "#EEF4F8", "#CCDBE4"],
    "flat": ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
}
GLOW = {"cyan": "#5FD2FF", "gold": "#FFCF4A", "white": "#BFEFFF", "flat": "#CFEFFF"}

FONTS = {"kicker": "poppins-semibold", "serif": "dm-serif", "sans": "poppins-bold"}


def _hex(c):
    c = c.lstrip("#")
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


def _ass(rgb):
    r, g, b = rgb
    return f"&H{b:02X}{g:02X}{r:02X}&"


def _lerp_grad(stops, t):
    t = max(0.0, min(1.0, t))
    n = len(stops) - 1
    i = min(int(t * n), n - 1)
    f = t * n - i
    a, b = _hex(stops[i]), _hex(stops[i + 1])
    return tuple(round(a[k] + (b[k] - a[k]) * f) for k in range(3))


def text_w(text, font, size):
    return _CTX.text_w(text, font, size)


def cap_h(font, size):
    f = _CTX.font(font)
    px = _CTX.size_px(font, size)
    return f.get("cap", f.get("den", 1000) * 0.7) * px / f.get("den", 1000)


def cap_shift(font, size):
    return _CTX.cap_shift(font, size)


def _ms(x):
    return int(round(x * 1000))


def _line_strings(segs, t_line, t_out_a, t_out_b, order, spread, seed, out_mode, glow):
    """Build the per-character override string for one line (relative times in ms from t_line)."""
    chars = []  # (seg_index, char)
    for si, s in enumerate(segs):
        for ch in s["text"]:
            chars.append((si, ch))
    idx = [i for i, (_, ch) in enumerate(chars) if not ch.isspace()]
    n = max(1, len(idx))
    rng = random.Random(seed)
    ranks = list(range(n))
    if order == "random":
        rng.shuffle(ranks)
    rank_of = {ci: ranks[k] for k, ci in enumerate(idx)}
    out_ranks = list(range(n))
    rng.shuffle(out_ranks)
    out_of = {ci: out_ranks[k] for k, ci in enumerate(idx)}
    fade_in = 0.13
    total_vis = len(chars)
    parts = []
    for i, (si, ch) in enumerate(chars):
        if ch.isspace():
            parts.append(ch)
            continue
        seg = segs[si]
        t_in0 = (rank_of[i] / n) * spread
        t_in1 = t_in0 + fade_in
        # gradient position across the whole line
        pos = i / max(1, total_vis - 1)
        rgb = _lerp_grad(GRAD[seg.get("grad", "cyan")], pos) if not glow else _hex(GLOW[seg.get("grad", "cyan")])
        full = "&H00&" if not glow else "&H78&"
        blur0 = 9 if not glow else 16
        blur1 = 0.6 if not glow else 14
        if out_mode == "random":
            o0 = (t_out_a - t_line) + (out_of[i] / n) * (t_out_b - t_out_a - 0.08)
            o1 = o0 + 0.09
        else:
            o0, o1 = t_out_a - t_line, t_out_b - t_line
        tag = (f"{{\\1c{_ass(rgb)}\\alpha&HFF&\\blur{blur0}"
               f"\\t({_ms(t_in0)},{_ms(t_in1)},\\alpha{full}\\blur{blur1})"
               f"\\t({_ms(o0)},{_ms(o1)},\\alpha&HFF&\\blur{blur0})}}")
        parts.append(tag + ch.replace("{", "(").replace("}", ")"))
    return "".join(parts)


def lockup(lines, out, y=0.64, x=0.5, out_mode="random", out_dur=0.18, seed=1, max_w=0.64, gap=0.22, layer=12,
           behind=False):
    """lines: [{"segs":[{"text","font"(kicker|serif|sans),"grad"}], "size", "at", "order", "spread", "align",
                "tuck": True (sub tucked under previous line's right edge)}]
    Returns a list of engine events (type 'ass')."""
    # measure + auto-shrink lines that are too wide
    meas = []
    for ln in lines:
        size = float(ln["size"])
        segs = [dict(s, font=FONTS.get(s.get("font", "kicker"), s.get("font", "kicker"))) for s in ln["segs"]]
        tot = sum(text_w(s["text"], s["font"], size) for s in segs)
        lim = W * max_w
        if tot > lim:
            size *= lim / tot
            tot = lim
        widths = [text_w(s["text"], s["font"], size) for s in segs]
        ch = max(cap_h(s["font"], size) for s in segs)
        meas.append({"ln": ln, "size": size, "segs": segs, "w": tot, "widths": widths, "cap": ch})
    # vertical stacking by cap centres
    ys = []
    cur = 0.0
    for k, m in enumerate(meas):
        if k == 0:
            cur = m["cap"] / 2
        else:
            prev = meas[k - 1]
            g = gap * min(prev["cap"], m["cap"])
            if m["ln"].get("tuck"):
                g = 0.30 * prev["cap"]
            cur += prev["cap"] / 2 + g + m["cap"] / 2
        ys.append(cur)
    block_h = ys[-1] + meas[-1]["cap"] / 2
    top = y * H - block_h / 2
    cx = x * W
    events = []
    t_out_a = out
    t_out_b = out + out_dur
    for k, m in enumerate(meas):
        ln = m["ln"]
        t_line = float(ln["at"])
        lx = cx
        if ln.get("tuck") and k > 0:
            ref = meas[k - 1]
            lx = cx + ref["w"] / 2 - m["w"] / 2 + ln.get("dx", 0)
        elif ln.get("align") == "left":
            lx = cx - meas[0]["w"] / 2 + m["w"] / 2
        lx += ln.get("dx", 0) if not ln.get("tuck") else 0
        ycap = top + ys[k]
        # segments laid out left->right; each segment its own \an5 event so fonts can differ
        left = lx - m["w"] / 2
        seg_x = []
        for w_ in m["widths"]:
            seg_x.append(left + w_ / 2)
            left += w_
        order = ln.get("order", "random")
        spread = float(ln.get("spread", 0.22 if order == "random" else 0.45))
        for si, s in enumerate(m["segs"]):
            yy = ycap + cap_shift(s["font"], m["size"])
            for glow in (True, False):
                body = _line_strings([s], t_line, t_out_a, t_out_b, order, spread, seed * 31 + k * 7 + si, out_mode,
                                     glow)
                pre = f"{{\\an5\\pos({seg_x[si]:.0f},{yy:.0f})\\q2"
                if glow:
                    pre += f"\\bord6\\3c{_ass(_hex(GLOW[s.get('grad', 'cyan')]))}\\shad0"
                else:
                    pre += "\\bord0\\shad0"
                pre += "}"
                events.append({
                    "type": "ass", "at": round(t_line, 3), "dur": round(t_out_b + 0.05 - t_line, 3),
                    "behind": behind, "sfx": False,
                    "layers": [{"start": 0, "layer": layer - (1 if glow else 0), "font": s["font"],
                                "size": round(m["size"], 1), "color": "#FFFFFF", "text": pre + body}],
                })
    return events


def plain_type(text, at, out, y=0.36, size=60, font="kicker", per_char=0.045, layer=12):
    """Typewriter-pop plain white text (graphic scenes): each letter pops from 60% scale."""
    f = FONTS.get(font, font)
    w = text_w(text, f, size)
    x0 = W / 2 - w / 2
    yy = y * H + cap_shift(f, size)
    parts = []
    for i, ch in enumerate(text):
        if ch.isspace():
            parts.append(ch)
            continue
        t0 = _ms(i * per_char)
        parts.append(f"{{\\alpha&HFF&\\fscx60\\fscy60\\t({t0},{t0 + 60},\\alpha&H00&\\fscx100\\fscy100)"
                     f"\\t({_ms(out - at)},{_ms(out - at + 0.15)},\\alpha&HFF&)}}{ch}")
    body = "".join(parts)
    dur = out - at + 0.2
    fade = ""
    return [{"type": "ass", "at": round(at, 3), "dur": round(dur, 3), "sfx": False,
             "layers": [{"start": 0, "layer": layer, "font": f, "size": size, "color": "#FFFFFF",
                         "text": f"{{\\an4\\pos({x0:.0f},{yy:.0f})\\bord3\\3c&HFFEFCF&\\blur3{fade}}}" + body}]}]
