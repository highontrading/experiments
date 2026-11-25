"""Word-by-word captions with many animation types and collision-free placement."""
import re

from .core import captions_reg, norm_word, resolve_font, warn
from .text import c_tag, esc, ypos

ANIMS = ["pop", "fade", "karaoke", "typewriter", "single", "blob", "bounce", "slide", "rise", "fill", "underline",
         "kinetic", "flip", "blur", "outline", "glow", "serif", "stack", "none"]


def resolve_style(ctx, cfg):
    styles = captions_reg()
    name = cfg.get("style") or ctx.brand.get("caption_style") or "bold-pop"
    if name not in styles:
        warn(f"Caption style '{name}' not found — using bold-pop. (Run `list captions`.)")
        name = "bold-pop"
    st = dict(styles[name])
    for k, v in cfg.items():
        if k not in ("style", "enabled", "emphasis", "behind", "hide_during"):
            st[k] = v
    if cfg.get("highlight") is None and cfg.get("use_brand_color", True) and st.get("brand_highlight", True):
        if st.get("highlight") not in (st.get("color"), "#111111", "#161616", None):
            st["highlight"] = ctx.accent
    st["font"] = resolve_font(st.get("font", "poppins-black"))
    if st.get("anim") not in ANIMS:
        warn(f"Caption animation '{st.get('anim')}' unknown — using pop.")
        st["anim"] = "pop"
    return st


def _groups(ctx, st, maxw, max_w_px, size):
    groups, cur = [], []
    for w in ctx.words:
        txt = w["text"].upper() if st.get("uppercase") else w["text"]
        ww = dict(w, disp=esc(txt))
        if cur:
            line = " ".join(x["disp"] for x in cur + [ww])
            gap = w["start"] - cur[-1]["end"]
            if (len(cur) >= maxw or gap > 0.55 or ctx.text_w(line, st["font"], size) > max_w_px * 1.9
                    or re.search(r"[.?!,।]$", cur[-1]["text"])):
                groups.append(cur)
                cur = []
        cur.append(ww)
    if cur:
        groups.append(cur)
    return groups


def build_captions(ctx, cfg, hide_ranges):
    cfg = cfg or {}
    if not cfg.get("enabled", True) or not ctx.words:
        return
    st = resolve_style(ctx, cfg)
    u = ctx.u
    size = float(st.get("size", 80)) * u
    font = st["font"]
    px = ctx.size_px(font, size)
    y_pref = ypos(ctx, cfg.get("position", st.get("position")), 0.70)
    color, hl = st.get("color", "#FFFFFF"), st.get("highlight", ctx.accent)
    outline_c = st.get("outline", "#000000")
    ow = round(float(st.get("outline_w", 6)) * u)
    emph = {norm_word(e) for e in cfg.get("emphasis", []) or []}
    emph_c = cfg.get("emphasis_color") or st.get("emphasis_color") or ctx.accent
    sname = ctx.style(font, size, color, outline_c, ow, round(float(st.get("shadow", 3)) * u), box=st.get("box", False),
                      back=st.get("box_color", "#000000"), back_alpha=st.get("box_alpha", 0x60 if st.get("box") else 0x78),
                      secondary=st.get("unfilled", color))
    anim = st["anim"]
    max_w = ctx.W * 0.84
    maxw = int(cfg.get("max_words", st.get("max_words", 3)))
    serif_key = resolve_font(st.get("emphasis_font") or ctx.brand.get("fonts", {}).get("serif") or "instrument-serif-italic")
    serif_f = ctx.font(serif_key)
    big = float(st.get("emphasis_scale", 1.35))
    behind = bool(cfg.get("behind"))
    lh_mult = float(st.get("line_height", 1.08))

    groups = _groups(ctx, st, maxw, max_w, size)

    def hidden(a, b):
        return any(a < hb and b > ha for ha, hb in hide_ranges)

    def word_w(x):
        is_e = norm_word(x["text"]) in emph
        if is_e and anim in ("kinetic", "stack"):
            return ctx.text_w(x["disp"], font, size * big)
        if is_e and anim == "serif":
            return ctx.text_w(x["disp"], serif_key, size * 1.15)
        return ctx.text_w(x["disp"], font, size)

    space = ctx.text_w(" ", font, size)
    for gi, g in enumerate(groups):
        g_start = g[0]["start"]
        nxt = groups[gi + 1][0]["start"] if gi + 1 < len(groups) else ctx.dur
        g_end = min(max(g[-1]["end"] + 0.25, g_start + 0.4), nxt)
        if hidden(g_start, g_end):
            continue
        # split into lines that fit
        lines, cur, cur_w = [], [], 0
        for x in g:
            w_ = word_w(x)
            if cur and cur_w + space + w_ > max_w:
                lines.append(cur)
                cur, cur_w = [], 0
            cur.append(x)
            cur_w += (space if cur_w else 0) + w_
        if cur:
            lines.append(cur)
        if anim == "stack" and len(g) > 1:
            lines = [[x] for x in g] if len(g) <= 3 else lines
        if len(lines) > 3:
            lines = lines[:3]
        line_sizes = []
        for ln in lines:
            m = size
            for x in ln:
                if norm_word(x["text"]) in emph and anim in ("kinetic", "stack"):
                    m = max(m, size * big)
            line_sizes.append(m)
        lh = [s * lh_mult for s in line_sizes]
        block_h = sum(lh)
        widths = [sum(word_w(x) for x in ln) + space * (len(ln) - 1) for ln in lines]
        bw = max(widths) if widths else 0
        # choose a free vertical slot
        y = None
        cands = [y_pref] + [ctx.H * f for f in (0.80, 0.62, 0.30, 0.20) if abs(ctx.H * f - y_pref) > 60 * u]
        for cy in cands:
            cy = ctx.clamp_y(cy, block_h)
            if not ctx.occupied(g_start, g_end, ctx.W / 2 - bw / 2, cy - block_h / 2, ctx.W / 2 + bw / 2, cy + block_h / 2,
                                kinds={"graphic", "ui"}):
                y = cy
                break
        if y is None:
            continue  # nowhere free: skip this caption rather than cover a graphic
        ctx.group = f"cap:{gi}"
        if behind:
            ctx.register(g_start, g_end, ctx.W / 2 - bw / 2, y - block_h / 2, ctx.W / 2 + bw / 2, y + block_h / 2, "caption")
        y0 = y - block_h / 2
        shift = ctx.cap_shift(font, size)
        flat = [x for ln in lines for x in ln]
        for wi, w in enumerate(flat):
            a = g_start if wi == 0 else w["start"]
            b = flat[wi + 1]["start"] if wi + 1 < len(flat) else g_end
            if b <= a:
                continue
            yy = y0
            k_global = 0
            for li, ln in enumerate(lines):
                yy_line = yy + lh[li] / 2
                yy += lh[li]
                parts = []
                for x in ln:
                    k = k_global
                    k_global += 1
                    is_e = norm_word(x["text"]) in emph
                    base = emph_c if is_e else color
                    active = (k == wi)
                    past = k < wi
                    t = x["disp"]
                    if anim == "single":
                        if not active:
                            continue
                        parts.append("{\\c" + c_tag(base) + "\\fscx70\\fscy70\\t(0,90,\\fscx108\\fscy108)\\t(90,160,\\fscx100\\fscy100)}" + t)
                        continue
                    if anim == "typewriter" and k > wi:
                        continue
                    if anim in ("kinetic", "stack") and is_e:
                        fs = ctx.size_px(font, size * big)
                        parts.append("{\\fs" + str(fs) + "\\c" + c_tag(hl if active else emph_c) +
                                     ("\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)" if active else "") + "}" + t +
                                     "{\\fs" + str(px) + "\\c" + c_tag(color) + "}")
                        continue
                    if anim == "serif" and is_e:
                        sp = ctx.size_px(serif_key, size * 1.15)
                        parts.append("{\\fn" + serif_f["family"] + "\\fs" + str(sp) + ("\\i1" if serif_f.get("italic") else "") +
                                     "\\c" + c_tag(emph_c) + "\\bord0" + ("\\alpha&HFF&\\t(0,200,\\alpha&H00&)" if active else "") +
                                     "}" + t + "{\\fn" + ctx.font(font)["family"] + "\\fs" + str(px) + "\\i0\\c" + c_tag(color) +
                                     f"\\bord{ow}" + "}")
                        continue
                    if anim == "fade" or anim == "none" or anim == "serif":
                        parts.append("{\\c" + c_tag(base) + "}" + t)
                    elif anim == "karaoke":
                        parts.append("{\\c" + c_tag(hl if k <= wi else base) + "}" + t)
                    elif anim == "fill":
                        if past:
                            parts.append("{\\c" + c_tag(hl) + "}" + t)
                        elif active:
                            dur_cs = max(1, int((b - a) * 100))
                            parts.append("{\\kf" + str(dur_cs) + "\\1c" + c_tag(hl) + "\\2c" + c_tag(base) + "}" + t +
                                         "{\\1c" + c_tag(base) + "}")
                        else:
                            parts.append("{\\c" + c_tag(base) + "}" + t)
                    elif anim == "blob":
                        if active:
                            parts.append("{\\c" + c_tag(hl) + "\\3c" + c_tag(st.get("blob", ctx.accent)) +
                                         f"\\bord{round(14 * u)}" + "}" + t + "{\\3c" + c_tag(outline_c) + f"\\bord{ow}" + "}")
                        else:
                            parts.append("{\\c" + c_tag(base) + "}" + t)
                    elif anim == "underline":
                        parts.append("{\\c" + c_tag(hl if active else base) + ("\\u1" if active else "") + "}" + t + "{\\u0}")
                    elif anim == "outline":
                        if active or past:
                            parts.append("{\\1a&H00&\\c" + c_tag(hl if active else base) + "}" + t)
                        else:
                            parts.append("{\\1a&HFF&\\3c" + c_tag(base) + "}" + t + "{\\1a&H00&\\3c" + c_tag(outline_c) + "}")
                    elif anim == "glow":
                        if active:
                            parts.append("{\\c" + c_tag(hl) + "\\3c" + c_tag(hl) + f"\\bord{round(4 * u)}\\blur{round(6 * u)}" + "}" + t +
                                         "{\\3c" + c_tag(outline_c) + f"\\bord{ow}\\blur0" + "}")
                        else:
                            parts.append("{\\c" + c_tag(base) + "}" + t)
                    elif anim in ("pop", "typewriter", "bounce", "flip", "blur", "kinetic", "stack", "slide", "rise"):
                        if active:
                            fx = {"pop": "\\fscx88\\fscy88\\t(0,80,\\fscx112\\fscy112)\\t(80,150,\\fscx104\\fscy104)",
                                  "bounce": "\\fscy70\\fscx115\\t(0,90,\\fscy115\\fscx94)\\t(90,170,\\fscy100\\fscx100)",
                                  "flip": "\\frx80\\t(0,160,\\frx0)",
                                  "blur": f"\\blur{round(10 * u)}\\t(0,160,\\blur0)"}.get(anim, "")
                            parts.append("{\\c" + c_tag(hl) + fx + "}" + t + "{\\fscx100\\fscy100\\frx0\\blur0\\c" + c_tag(color) + "}")
                        else:
                            parts.append("{\\c" + c_tag(base) + "}" + t)
                    else:
                        parts.append(t)
                if not parts:
                    continue
                body = " ".join(parts)
                xx = ctx.W / 2
                if anim == "slide" and wi == 0:
                    lead = "{\\an5\\move(" + f"{xx:.0f},{yy_line + shift + 50 * u:.0f},{xx:.0f},{yy_line + shift:.0f},0,180" + ")\\fad(120,0)"
                elif anim == "rise" and wi == 0:
                    lead = "{\\an5\\move(" + f"{xx:.0f},{yy_line + shift + 24 * u:.0f},{xx:.0f},{yy_line + shift:.0f},0,260" + f")\\blur{round(5 * u)}\\t(0,260,\\blur0)\\fad(160,0)"
                else:
                    lead = "{\\an5\\pos(" + f"{xx:.0f},{yy_line + shift:.0f}" + ")"
                    if wi == 0 and anim in ("fade", "serif", "pop"):
                        lead += "\\fad(90,0)"
                if st.get("glow") and anim != "glow":
                    ctx.add(a, b, sname, lead + f"\\blur{round(10 * u)}\\3c" + c_tag(hl) + f"\\bord{round(8 * u)}" + "}" + body,
                            layer=2, behind=behind)
                ctx.add(a, b, sname, lead + "}" + body, layer=3, behind=behind)
    ctx.group = None
