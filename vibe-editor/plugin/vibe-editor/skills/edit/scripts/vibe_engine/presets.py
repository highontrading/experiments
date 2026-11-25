"""Preset combos (built-in + user-saved) and raw custom ASS effects Claude can design."""
import copy
import re

from .core import presets_reg, resolve_font, warn
from .text import ass_color, c_tag, ev_window

PLACEHOLDER = re.compile(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}")


def _subst(v, params):
    if isinstance(v, str):
        m = PLACEHOLDER.fullmatch(v)
        if m and m.group(1) in params:
            return params[m.group(1)]
        return PLACEHOLDER.sub(lambda mm: str(params.get(mm.group(1), mm.group(0))), v)
    if isinstance(v, list):
        return [_subst(x, params) for x in v]
    if isinstance(v, dict):
        return {k: _subst(x, params) for k, x in v.items()}
    return v


def expand(ctx, events, known, depth=0):
    if depth > 3:
        return events
    reg = presets_reg()
    out = []
    for e in events:
        typ = e.get("type")
        name = e.get("name") if typ == "preset" else typ
        if (typ == "preset" or typ not in known) and name in reg:
            p = reg[name]
            params = dict(p.get("params", {}))
            params.update({k: v for k, v in e.items() if k not in ("type", "name")})
            base = ctx.t(e.get("at"), 0.0)
            pdur = e.get("dur")
            subs = []
            for sub in p.get("events", []):
                s = _subst(copy.deepcopy(sub), params)
                at = s.get("at")
                if at is None:
                    s["at"] = base
                elif isinstance(at, (int, float)) and not isinstance(at, bool):
                    s["at"] = base + float(at)
                elif isinstance(at, str) and re.fullmatch(r"\+\d+(\.\d+)?", at.strip()):
                    s["at"] = base + float(at.strip()[1:])
                if "dur" not in s and "until" not in s and pdur is not None:
                    s["dur"] = pdur
                if e.get("behind") and "behind" not in s:
                    s["behind"] = True
                subs.append(s)
            out += expand(ctx, subs, known, depth + 1)
        else:
            out.append(e)
    return out


def ev_ass(ctx, e):
    """Raw ASS effect: e.g. a brand-new animation Claude designed from a reference.

    {"type": "ass", "at": 2, "dur": 1.5, "params": {"word": "WOW"},
     "layers": [{"start": 0, "end": 1.5, "layer": 8, "font": "anton", "size": 160, "color": "#FFFFFF",
                 "text": "{\\\\an5\\\\pos({cx},{cy})\\\\frz-20\\\\t(0,400,\\\\frz0)}{word}"},
                {"shape": true, "color": "{accent}", "text": "{\\\\an7\\\\pos(0,0)\\\\p1}m 0 0 l 100 0 100 20 0 20"}]}
    """
    a, b = ev_window(ctx, e, 1.5)
    u = ctx.u
    params = {"W": ctx.W, "H": ctx.H, "cx": round(ctx.W / 2), "cy": round(ctx.H * 0.45), "u": round(u, 4),
              "accent": ctx.accent, "accent_ass": c_tag(ctx.accent), "dur_ms": int((b - a) * 1000),
              "text": e.get("text", ""), "white": "&HFFFFFF&", "black": "&H000000&"}
    params.update(e.get("params") or {})
    layers = e.get("layers") or []
    if not layers:
        warn("Custom 'ass' effect has no layers — skipped.")
        return a, b
    for ly in layers:
        ly = _subst(copy.deepcopy(ly), params)
        s0 = a + float(ly.get("start", 0))
        s1 = a + float(ly.get("end", b - a))
        if ly.get("shape"):
            st = ctx.shape_style()
            txt = str(ly.get("text", ""))
            if "\\1c" not in txt and ly.get("color"):
                txt = txt.replace("{", "{\\1c" + c_tag(ly["color"]) + "\\bord0\\shad0", 1) if txt.startswith("{") else txt
        else:
            font = resolve_font(ly.get("font") or ctx.fkey("title"))
            st = ctx.style(font, float(ly.get("size", 90)) * u, ly.get("color", "#FFFFFF"), ly.get("outline", "#000000"),
                           round(float(ly.get("bord", 0)) * u), round(float(ly.get("shad", 0)) * u))
            txt = str(ly.get("text", ""))
        ctx.add(s0, s1, st, txt, layer=int(ly.get("layer", 8)))
    if e.get("box"):
        x0, y0, x1, y1 = e["box"]
        ctx.register(a, b, x0 * ctx.W, y0 * ctx.H, x1 * ctx.W, y1 * ctx.H)
    return a, b


EVENTS = {"ass": ev_ass}
_unused = (ass_color,)

DOCS = {"ass": "Advanced: a brand-new animation written in ASS override tags (Claude designs it). layers[{start,end,layer,font,size,"
               "color,text|shape}], params; placeholders {W} {H} {cx} {cy} {accent} {dur_ms} {text}"}
