"""Text effects: titles (30+ animation styles), cards, checklists, counters, pills, lower thirds, bars."""
import random
import re

from .core import num, FPS, resolve_font
from .text import (a_tag, c_tag, check_path, enter_tag, esc, ev_window, exit_tag, path_poly, rect, rrect, sizes_map,
                   theme_color, ypos, xpos)

TITLE_STYLES = ["pop", "slide", "slide-down", "slide-left", "slide-right", "drop", "punch", "stamp", "fade", "blur",
                "rise", "bounce", "elastic", "flip", "zoom", "zoom-out", "spin", "swing", "flicker", "typewriter", "split",
                "glow", "highlight", "wipe", "cascade", "flip-chars", "glitch", "marker", "underline", "outline", "sketch",
                "press", "ransom", "serif", "stack", "3d", "glass", "neon", "blow", "scatter"]

STYLE_FONTS = {"sketch": "marker", "serif": "instrument-serif-italic", "press": "dm-serif", "glass": "poppins-black",
               "neon": "poppins-extrabold", "stamp": "anton"}


def _rng(ctx, salt):
    return random.Random(hash((salt, round(ctx.dur, 2))) & 0xFFFFFFFF)


def ev_title(ctx, e, size_default=118, pos_default="top"):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    style = (e.get("style") or "pop").lower()
    if style not in TITLE_STYLES:
        style = "pop"
    font = resolve_font(e.get("font") or STYLE_FONTS.get(style) or ctx.fkey("title"))
    color = e.get("color") or ctx.col("text", "#FFFFFF")
    accent = e.get("accent") or ctx.accent
    size = sizes_map(e.get("size"), size_default) * u
    text = str(e.get("text", ""))
    upper = e.get("uppercase", style not in ("serif", "sketch", "glass") and not font.startswith(("instrument", "caveat")))
    if upper:
        text = text.upper()
    max_w = ctx.W * num(e.get("width"), 0.86)
    lines, fs = ctx.wrap(text, font, size, max_w, max_lines=int(num(e.get("max_lines"), 4)))
    x = xpos(ctx, e.get("x"), 0.5)
    y = ypos(ctx, e.get("position", e.get("y")), pos_default)
    box = style == "highlight" or bool(e.get("box"))
    st = ctx.style(font, fs, color, e.get("outline_color", "#000000"),
                   round((18 if box else num(e.get("outline"), 0 if style in ("serif", "glass", "press") else 6, 0, 40)) * u),
                   round(num(e.get("shadow"), 0 if style in ("glass",) else 4, 0, 40) * u),
                   box=box, back=accent if box else "#000000", back_alpha=0)
    dur_ms = int((b - a) * 1000)
    lh = ctx.size_px(font, fs) * num(e.get("line_height"), 1.0) * (1.12 / ctx.font(font).get("norm", 1.0) * ctx.font(font).get("norm", 1.0))
    lh = fs * 1.12
    exit_k = e.get("exit", "fade")
    ex = exit_tag(exit_k if style != "blow" else "none", dur_ms)

    def lines_with(tagfn, layer=6, stagger=0.0, extra="", c=color, acc=accent, register=True):
        return ctx.draw_lines(a, b, st, lines, font, fs, x, y, lh, tagfn, c, acc, layer, stagger, extra, register=register)

    if style in ("pop", "slide", "slide-down", "slide-left", "slide-right", "drop", "punch", "stamp", "fade", "blur",
                 "rise", "bounce", "elastic", "flip", "zoom", "zoom-out", "spin", "swing", "flicker"):
        stag = 0.07 if style in ("pop", "slide", "drop", "punch", "rise", "bounce", "blur", "flip", "elastic") else 0.0
        lines_with(lambda xx, yy, i: enter_tag(style, xx, yy, u, dur_ms) + ex, stagger=stag)
        return a, b

    if style == "highlight":
        dark = e.get("text_color", ctx.col("dark", "#161616"))
        ctx.draw_lines(a, b, st, lines, font, fs, x, y, fs * 1.5, lambda xx, yy, i: enter_tag("pop", xx, yy, u) + ex,
                       dark, "#FFFFFF", 6, 0.07, "\\3c" + c_tag(accent) + "\\c" + c_tag(dark))
        return a, b

    if style == "glow":
        lines_with(lambda xx, yy, i: enter_tag("pop", xx, yy, u) + ex, layer=5, stagger=0.07, register=False,
                   extra=f"\\blur{round(16 * u)}\\bord{round(10 * u)}\\3c" + c_tag(accent))
        lines_with(lambda xx, yy, i: enter_tag("pop", xx, yy, u) + ex, stagger=0.07)
        return a, b

    if style == "neon":
        ncol = e.get("color") or accent
        st2 = ctx.style(font, fs, "#FFFFFF", ncol, round(3 * u), 0)
        ctx.draw_lines(a, b, st2, lines, font, fs, x, y, lh, lambda xx, yy, i: enter_tag("flicker", xx, yy, u) + ex, "#FFFFFF",
                       "#FFFFFF", 5, extra=f"\\blur{round(18 * u)}\\bord{round(12 * u)}\\3c" + c_tag(ncol), register=False)
        ctx.draw_lines(a, b, st2, lines, font, fs, x, y, lh, lambda xx, yy, i: enter_tag("flicker", xx, yy, u) + ex, "#FFFFFF",
                       "#FFFFFF", 6, extra="\\3c" + c_tag(ncol))
        return a, b

    if style == "glass":
        st2 = ctx.style(font, fs, "#FFFFFF", "#FFFFFF", round(2 * u), 0)
        common = lambda xx, yy, i: enter_tag("rise", xx, yy, u) + ex  # noqa: E731
        ctx.draw_lines(a, b, st2, lines, font, fs, x, y + 6 * u, lh, common, "#000000", "#000000", 4,
                       extra=f"\\1a&HB0&\\3a&HFF&\\blur{round(14 * u)}", register=False)
        ctx.draw_lines(a, b, st2, lines, font, fs, x, y, lh, common, "#FFFFFF", "#FFFFFF", 5,
                       extra=f"\\1a&H9A&\\3a&H30&\\blur{round(1.5 * u, 1)}")
        ctx.draw_lines(a, b, st2, lines, font, fs, x - 2 * u, y - 3 * u, lh, common, "#FFFFFF", "#FFFFFF", 6,
                       extra=f"\\1a&HE0&\\3a&H80&\\bord{round(1 * u)}", register=False)
        return a, b

    if style == "3d":
        rot = e.get("rotate") or {}
        rx, ry, rz = float(rot.get("x", 8)), float(rot.get("y", -28)), float(rot.get("z", -4))
        tagfn = lambda xx, yy, i: (enter_tag("fade", xx, yy, u) + f"\\frx{rx}\\fry{ry}\\frz{rz}\\fax{float(rot.get('shear', 0))}" + ex)  # noqa: E731
        ctx.draw_lines(a, b, st, lines, font, fs, x + 10 * u, y + 12 * u, lh, tagfn, "#000000", "#000000", 5,
                       extra=f"\\1a&H70&\\bord0\\blur{round(10 * u)}", register=False)
        lines_with(tagfn)
        return a, b

    if style == "typewriter":
        yc = ctx.clamp_y(y, lh * len(lines))
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        total = sum(len(re.sub(r"\*", "", ln)) for ln in lines)
        step = min(0.055, (b - a) * 0.5 / max(total, 1))
        t0 = a
        for li, ln in enumerate(lines):
            plain = ln
            w = ctx.text_w(plain, font, fs)
            xl = ctx.clamp_x(x, w) - w / 2
            yy = y0 + li * lh + shift
            n = len(plain)
            for i in range(1, n + 1):
                part = plain[:i] + ("*" if plain[:i].count("*") % 2 else "")
                s0 = t0 + (i - 1) * step
                s1 = t0 + i * step if (i < n or li < len(lines) - 1) else b
                if i == n:
                    s1 = b
                ctx.add(s0, s1, st, "{" + f"\\an4\\pos({xl:.0f},{yy:.0f})" + ex + "}" + ctx.markup(part, color, accent), layer=6)
            t0 += n * step
        ctx.register(a, b, x - max_w / 2, yc - lh * len(lines) / 2, x + max_w / 2, yc + lh * len(lines) / 2)
        if e.get("sfx", "typing") and "sfx" not in e:
            ctx.extra_sfx.append((a, "typing", 0.35))
        return a, b

    if style == "split":
        if len(lines) == 1 and " " in lines[0]:
            ws_ = lines[0].split()
            lines = [" ".join(ws_[:len(ws_) // 2]), " ".join(ws_[len(ws_) // 2:])]
        tagfn = lambda xx, yy, i: (f"\\an5\\move({(-ctx.W * 0.6 if i % 2 == 0 else ctx.W * 1.6):.0f},{yy:.0f},{xx:.0f},{yy:.0f},0,280)" + ex)  # noqa: E731
        ctx.draw_lines(a, b, st, lines, font, fs, x, y, lh, tagfn, color, accent, 6, 0.08)
        return a, b

    if style in ("cascade", "flip-chars"):
        per = min(45, int(dur_ms * 0.4 / max(1, sum(len(l) for l in lines))))

        def char_body(ln, base_delay):
            out = ""
            plain = re.split(r"(\*[^*]+\*)", esc(ln))
            k = 0
            for p in plain:
                acc_on = p.startswith("*") and p.endswith("*") and len(p) > 2
                seg = p[1:-1] if acc_on else p.replace("*", "")
                for ch in seg:
                    d = base_delay + k * per
                    k += 1
                    col = accent if acc_on else color
                    if style == "cascade":
                        out += "{\\c" + c_tag(col) + f"\\alpha&HFF&\\blur{round(8 * u)}\\t({d},{d + 220},\\alpha&H00&\\blur0)" + "}" + ch
                    else:
                        out += "{\\c" + c_tag(col) + f"\\frx90\\alpha&HFF&\\t({d},{d + 260},\\frx0\\alpha&H00&)" + "}" + ch
            return out, k
        yc = ctx.clamp_y(y, lh * len(lines))
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        delay = 0
        maxw = 0
        for li, ln in enumerate(lines):
            body, k = char_body(ln, delay)
            delay += k * per
            w = ctx.text_w(ln, font, fs)
            maxw = max(maxw, w)
            ctx.add(a, b, st, "{" + f"\\an5\\pos({ctx.clamp_x(x, w):.0f},{y0 + li * lh + shift:.0f})" + ex + "}" + body, layer=6)
        ctx.register(a, b, x - maxw / 2, yc - lh * len(lines) / 2, x + maxw / 2, yc + lh * len(lines) / 2)
        return a, b

    if style == "wipe":
        yc = ctx.clamp_y(y, lh * len(lines))

        def tagfn(xx, yy, i):
            w = ctx.text_w(lines[i], font, fs)
            x0, x1 = xx - w / 2 - 10 * u, xx + w / 2 + 10 * u
            d = i * 120
            return (f"\\an5\\pos({xx:.0f},{yy:.0f})\\clip({x0:.0f},0,{x0:.0f},{ctx.H})"
                    f"\\t({d},{d + 420},\\clip({x0:.0f},0,{x1:.0f},{ctx.H}))" + ex)
        ctx.draw_lines(a, b, st, lines, font, fs, x, yc, lh, tagfn, color, accent, 6)
        return a, b

    if style in ("marker", "underline"):
        yc, maxw, bh = lines_with(lambda xx, yy, i: enter_tag("fade", xx, yy, u) + ex, layer=7)
        y0 = yc - lh * (len(lines) - 1) / 2
        for i, ln in enumerate(lines):
            w = ctx.text_w(ln, font, fs) + 30 * u
            xx = ctx.clamp_x(x, w)
            x0 = xx - w / 2
            yy = y0 + i * lh
            if style == "marker":
                hh, top = fs * 0.62, yy - fs * 0.22
                shape = rrect(w, hh, 10 * u, x0, top)
                col, al = e.get("marker_color", accent), 0x30
            else:
                hh, top = 9 * u, yy + fs * 0.42
                shape = rrect(w, hh, 4 * u, x0, top)
                col, al = e.get("marker_color", accent), 0
            d = 150 + i * 160
            ctx.shape(a, b, shape, col, al, f"\\an7\\pos(0,0)\\clip({x0:.0f},0,{x0:.0f},{ctx.H})"
                      f"\\t({d},{d + 380},\\clip({x0:.0f},0,{x0 + w:.0f},{ctx.H}))" + ex, layer=6)
        return a, b

    if style == "outline":
        st2 = ctx.style(font, fs, color, color, round(3 * u), 0)
        lines_with(lambda xx, yy, i: enter_tag("fade", xx, yy, u) + f"\\1a&HFF&\\t(350,700,\\1a&H00&)" + ex,
                   extra="", c=color)
        ctx.lines[-1:]  # noqa
        for i in range(len(lines)):
            pass
        _ = st2
        return a, b

    if style == "sketch":
        yc, maxw, bh = lines_with(lambda xx, yy, i: (f"\\an5\\pos({xx:.0f},{yy:.0f})\\clip({xx - ctx.text_w(lines[i], font, fs) / 2 - 20 * u:.0f},0,"
                                                      f"{xx - ctx.text_w(lines[i], font, fs) / 2 - 20 * u:.0f},{ctx.H})"
                                                      f"\\t({i * 200},{i * 200 + 520},\\clip({xx - ctx.text_w(lines[i], font, fs) / 2 - 20 * u:.0f},0,"
                                                      f"{xx + ctx.text_w(lines[i], font, fs) / 2 + 20 * u:.0f},{ctx.H}))" + ex),
                                  layer=7)
        w = maxw + 20 * u
        x0 = ctx.clamp_x(x, w) - w / 2
        ybase = yc + bh / 2 + 8 * u
        rng = _rng(ctx, text)
        pts = [(x0 + i * w / 14, ybase + (rng.uniform(-5, 5) + (6 if i % 2 else -6)) * u) for i in range(15)]
        ctx.shape(a, b, path_poly(pts, 6 * u), e.get("marker_color", accent), 0,
                  f"\\an7\\pos(0,0)\\clip({x0:.0f},0,{x0:.0f},{ctx.H})\\t(450,900,\\clip({x0:.0f},0,{x0 + w:.0f},{ctx.H}))" + ex, layer=6)
        return a, b

    if style == "press":
        common = lambda xx, yy, i: (f"\\an5\\pos({xx:.0f},{yy:.0f})\\fscx112\\fscy112\\alpha&HFF&"  # noqa: E731
                                    f"\\t(0,90,\\alpha&H00&)\\t(0,140,\\fscx100\\fscy100)" + ex)
        st2 = ctx.style(font, fs, color, "#000000", 0, 0)
        ctx.draw_lines(a, b, st2, lines, font, fs, x - 2 * u, y - 2 * u, lh, common, "#000000", "#000000", 5,
                       extra="\\1a&H90&\\blur2", register=False)
        ctx.draw_lines(a, b, st2, lines, font, fs, x + 2 * u, y + 2 * u, lh, common, "#FFFFFF", "#FFFFFF", 5,
                       extra="\\1a&HB0&\\blur1", register=False)
        ctx.draw_lines(a, b, st2, lines, font, fs, x, y, lh, common, color, accent, 6)
        ctx.extra_sfx.append((a, "impact", 0.35))
        return a, b

    if style == "ransom":
        rng = _rng(ctx, text)
        papers = [("#FFFFFF", "#111111"), ("#F3E9D2", "#111111"), ("#111111", "#FFFFFF"), ("#D9C7A7", "#1A1A1A"),
                  ("#E8E8E8", "#111111"), (accent, "#111111")]
        fonts_ = ["dm-serif", "anton", "archivo-black", "bebas", "instrument-serif", "poppins-black", "marker"]
        fonts_ = [resolve_font(f) for f in fonts_]
        csize = fs * 0.95
        ytot = len(lines) * csize * 1.35
        yc = ctx.clamp_y(y, ytot)
        y0 = yc - ytot / 2 + csize * 0.67
        k = 0
        maxw = 0
        for li, ln in enumerate(lines):
            chars = [c for c in re.sub(r"\*", "", ln)]
            widths = []
            picks = []
            for ch in chars:
                f = rng.choice(fonts_)
                cw = ctx.text_w(ch if ch != " " else "n", f, csize) + 26 * u
                widths.append(cw if ch != " " else 22 * u)
                picks.append(f)
            tw = sum(widths)
            maxw = max(maxw, tw)
            cx = ctx.clamp_x(x, tw) - tw / 2
            yy = y0 + li * csize * 1.35
            for ch, cw, f in zip(chars, widths, picks):
                if ch == " ":
                    cx += cw
                    continue
                bg, fg = rng.choice(papers)
                rot = rng.uniform(-8, 8)
                d = k * 60
                k += 1
                bh = csize * 1.15
                tag = (f"\\an5\\pos({cx + cw / 2:.0f},{yy:.0f})\\frz{rot:.1f}\\fscx40\\fscy40\\alpha&HFF&"
                       f"\\t({d},{d + 60},\\alpha&H00&)\\t({d},{d + 160},\\fscx108\\fscy108)\\t({d + 160},{d + 230},\\fscx100\\fscy100)" + ex)
                ctx.shape(a, b, rrect(cw - 6 * u, bh, 4 * u), "#000000", 0x90, tag.replace(f"pos({cx + cw / 2:.0f},{yy:.0f})",
                                                                                            f"pos({cx + cw / 2 + 5 * u:.0f},{yy + 7 * u:.0f})"),
                          layer=5, blur=round(6 * u))
                ctx.shape(a, b, rrect(cw - 6 * u, bh, 4 * u), bg, 0, tag, layer=6)
                cst = ctx.style(f, csize, fg, "#000000", 0, 0)
                ctx.add(a, b, cst, "{" + tag.replace(f"pos({cx + cw / 2:.0f},{yy:.0f})",
                                                     f"pos({cx + cw / 2:.0f},{yy + ctx.cap_shift(f, csize):.0f})") + "}" + esc(ch), layer=7)
                cx += cw
        ctx.register(a, b, x - maxw / 2, yc - ytot / 2, x + maxw / 2, yc + ytot / 2)
        if "sfx" not in e:
            ctx.extra_sfx.append((a, "pop", 0.4))
        return a, b

    if style in ("serif",):
        words_lines = lines
        yc = ctx.clamp_y(y, lh * len(words_lines))
        y0 = yc - lh * (len(words_lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        d = 0
        maxw = 0
        for li, ln in enumerate(words_lines):
            w = ctx.text_w(ln, font, fs)
            maxw = max(maxw, w)
            body = ""
            for wd in ln.split():
                acc_on = wd.startswith("*") and wd.endswith("*")
                wtxt = esc(wd.strip("*"))
                body += ("{\\c" + c_tag(accent if acc_on else color) + f"\\alpha&HFF&\\blur{round(8 * u)}"
                         f"\\t({d},{d + 300},\\alpha&H00&\\blur0)" + "}" + wtxt + " ")
                d += 140
            ctx.add(a, b, st, "{" + f"\\an5\\pos({ctx.clamp_x(x, w):.0f},{y0 + li * lh + shift:.0f})" + ex + "}" + body.strip(), layer=6)
        ctx.register(a, b, x - maxw / 2, yc - lh * len(words_lines) / 2, x + maxw / 2, yc + lh * len(words_lines) / 2)
        return a, b

    if style == "stack":
        # two-tone stacked words: line i alternates colour, each blurs in, whole block slowly zooms
        cols = [color, accent]
        tagfn = lambda xx, yy, i: (f"\\an5\\pos({xx:.0f},{yy:.0f})\\blur{round(14 * u)}\\alpha&HFF&"  # noqa: E731
                                   f"\\t({i * 180},{i * 180 + 320},\\blur0\\alpha&H00&)"
                                   f"\\t(0,{dur_ms},\\fscx108\\fscy108)" + ex)
        yc = ctx.clamp_y(y, lh * len(lines))
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        maxw = 0
        for i, ln in enumerate(lines):
            w = ctx.text_w(ln, font, fs)
            maxw = max(maxw, w)
            c = cols[i % 2]
            ctx.add(a, b, st, "{" + tagfn(ctx.clamp_x(x, w), y0 + i * lh + shift, i) + "\\c" + c_tag(c) + "}" +
                    ctx.markup(ln, c, accent), layer=6)
        ctx.register(a, b, x - maxw / 2, yc - lh * len(lines) / 2, x + maxw / 2, yc + lh * len(lines) / 2)
        return a, b

    if style == "glitch":
        rng = _rng(ctx, text)
        yc = ctx.clamp_y(y, lh * len(lines))
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        steps = 8
        maxw = 0
        for i, ln in enumerate(lines):
            w = ctx.text_w(ln, font, fs)
            maxw = max(maxw, w)
            xx, yy = ctx.clamp_x(x, w), y0 + i * lh + shift
            for s in range(steps):
                t0 = a + s * 0.045
                t1 = t0 + 0.045
                for colr, sign in (("#FF2D55", -1), ("#00E5FF", 1)):
                    dx = sign * rng.uniform(6, 22) * u
                    dy = rng.uniform(-6, 6) * u
                    ctx.add(t0, t1, st, "{" + f"\\an5\\pos({xx + dx:.0f},{yy + dy:.0f})\\1a&H40&\\bord0\\shad0\\c{c_tag(colr)}" + "}" +
                            esc(re.sub(r"\*", "", ln)), layer=5)
            ctx.add(a, b, st, "{" + f"\\an5\\pos({xx:.0f},{yy:.0f})" + ex + "}" + ctx.markup(ln, color, accent), layer=6)
        ctx.register(a, b, x - maxw / 2, yc - lh * len(lines) / 2, x + maxw / 2, yc + lh * len(lines) / 2)
        if "sfx" not in e:
            ctx.extra_sfx.append((a, "glitch", 0.45))
        return a, b

    if style in ("blow", "scatter"):
        rng = _rng(ctx, text)
        yc = ctx.clamp_y(y, lh * len(lines))
        y0 = yc - lh * (len(lines) - 1) / 2
        shift = ctx.cap_shift(font, fs)
        maxw = 0
        tsplit = (b - 0.6) if style == "blow" else (a + 0.6)
        tsplit = max(a + 0.1, min(b - 0.1, tsplit))
        for i, ln in enumerate(lines):
            plain = re.sub(r"\*", "", ln)
            w = ctx.text_w(plain, font, fs)
            maxw = max(maxw, w)
            xx, yy = ctx.clamp_x(x, w), y0 + i * lh + shift
            if style == "blow":
                ctx.add(a, tsplit, st, "{" + enter_tag("pop", xx, yy, u) + "}" + ctx.markup(ln, color, accent), layer=6)
            else:
                ctx.add(tsplit, b, st, "{" + f"\\an5\\pos({xx:.0f},{yy:.0f})" + exit_tag("fade", int((b - tsplit) * 1000)) + "}" +
                        ctx.markup(ln, color, accent), layer=6)
            cx = xx - w / 2
            for ch in plain:
                cw = ctx.text_w(ch, font, fs)
                if ch.strip():
                    px_, py_ = cx + cw / 2, yy
                    dx, dy = rng.uniform(140, 520) * u, rng.uniform(-380, 120) * u
                    rot = rng.uniform(-160, 160)
                    if style == "blow":
                        ms = int((b - tsplit) * 1000)
                        tag = (f"\\an5\\move({px_:.0f},{py_:.0f},{px_ + dx:.0f},{py_ + dy:.0f},0,{ms})"
                               f"\\t(0,{ms},\\frz{rot:.0f}\\alpha&HFF&\\blur{round(6 * u)})")
                        ctx.add(tsplit, b, st, "{" + tag + "}" + esc(ch), layer=6)
                    else:
                        ms = int((tsplit - a) * 1000)
                        tag = (f"\\an5\\move({px_ - dx:.0f},{py_ + dy:.0f},{px_:.0f},{py_:.0f},0,{ms})\\frz{rot:.0f}\\alpha&HFF&"
                               f"\\blur{round(6 * u)}\\t(0,{ms},\\frz0\\alpha&H00&\\blur0)")
                        ctx.add(a, tsplit, st, "{" + tag + "}" + esc(ch), layer=6)
                cx += cw
        ctx.register(a, b, x - maxw / 2, yc - lh * len(lines) / 2, x + maxw / 2, yc + lh * len(lines) / 2)
        if style == "blow" and "sfx" not in e:
            ctx.extra_sfx.append((tsplit, "whoosh", 0.4))
        return a, b

    lines_with(lambda xx, yy, i: enter_tag("pop", xx, yy, u) + ex)
    return a, b


def _fix_outline(ctx, e):
    """Outline-to-fill title (separate for clarity)."""
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    font = resolve_font(e.get("font") or ctx.fkey("title"))
    color = e.get("color") or ctx.col("text", "#FFFFFF")
    accent = e.get("accent") or ctx.accent
    size = sizes_map(e.get("size"), 118) * u
    text = str(e.get("text", ""))
    if e.get("uppercase", True):
        text = text.upper()
    lines, fs = ctx.wrap(text, font, size, ctx.W * num(e.get("width"), 0.86))
    x = xpos(ctx, e.get("x"), 0.5)
    y = ypos(ctx, e.get("position", e.get("y")), "top")
    st = ctx.style(font, fs, color, color, round(3 * u), 0)
    dur_ms = int((b - a) * 1000)
    ctx.draw_lines(a, b, st, lines, font, fs, x, y, fs * 1.12,
                   lambda xx, yy, i: enter_tag("fade", xx, yy, u) + f"\\1a&HFF&\\t({300 + i * 120},{700 + i * 120},\\1a&H00&)" +
                   exit_tag(e.get("exit", "fade"), dur_ms), color, accent, 6)
    return a, b


# --------------------------------------------------------------------------- cards

CARD_THEMES = {
    "note": {"fill": "card", "text": "ink", "label_bg": "accent", "label_text": "ink"},
    "paper": {"fill": "paper", "text": "ink", "label_bg": "ink", "label_text": "#FFFFFF"},
    "dark": {"fill": "#161616", "text": "#FFFFFF", "label_bg": "accent", "label_text": "ink"},
    "accent": {"fill": "accent", "text": "ink", "label_bg": "ink", "label_text": "#FFFFFF"},
    "myth": {"fill": "card", "text": "ink", "label_bg": "#FF3B30", "label_text": "#FFFFFF", "label": "MYTH"},
    "fact": {"fill": "card", "text": "ink", "label_bg": "#22C55E", "label_text": "#FFFFFF", "label": "FACT"},
    "tip": {"fill": "card", "text": "ink", "label_bg": "accent", "label_text": "ink", "label": "TIP"},
    "quote": {"fill": "#161616", "text": "#FFFFFF", "label_bg": "accent", "label_text": "ink", "font": "instrument-serif-italic"},
    "glass": {"fill": "#FFFFFF", "alpha": 0xC8, "text": "#FFFFFF", "label_bg": "#FFFFFF", "label_text": "ink", "blur_bg": True,
              "outline": "#FFFFFF"},
    "dark-glass": {"fill": "#141414", "alpha": 0x50, "text": "#FFFFFF", "label_bg": "accent", "label_text": "ink", "blur_bg": True,
                   "outline": "#FFFFFF"},
    "outline": {"fill": "#000000", "alpha": 0xFF, "text": "#FFFFFF", "label_bg": "#FFFFFF", "label_text": "ink", "outline": "#FFFFFF"},
}


def ev_card(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    th = dict(CARD_THEMES.get(e.get("style", "note"), CARD_THEMES["note"]))
    fill = theme_color(ctx, e.get("fill", th["fill"]))
    tcol = theme_color(ctx, e.get("color", th["text"]))
    accent = ctx.accent
    font = resolve_font(e.get("font") or th.get("font") or ctx.fkey("title"))
    body_font = ctx.fkey("body")
    w = ctx.W * num(e.get("width"), 0.82)
    pad = 52 * u
    text = str(e.get("text", ""))
    if e.get("style") == "quote":
        text = f"“{text}”"
    lines, fs = ctx.wrap(text, font, sizes_map(e.get("size"), 86) * u, w - 2 * pad, max_lines=5)
    sub_lines, sfs = ([], 0)
    if e.get("sub"):
        sub_lines, sfs = ctx.wrap(str(e["sub"]), body_font, 50 * u, w - 2 * pad, max_lines=4)
    lh, slh = fs * 1.14, sfs * 1.25
    h = pad * 2 + len(lines) * lh + (len(sub_lines) * slh + 20 * u if sub_lines else 0)
    cx = xpos(ctx, e.get("x"), 0.5)
    cy = ctx.clamp_y(ypos(ctx, e.get("position", e.get("y")), "center"), h + 40 * u)
    anim = e.get("anim", "pop")
    if th.get("blur_bg"):
        ctx.video_requests.append({"kind": "blur_region", "a": a, "b": b, "x": cx - w / 2, "y": cy - h / 2, "w": w, "h": h,
                                   "r": 36 * u, "sigma": 22})
    ctx.card(a, b, cx, cy, w, h, fill, th.get("alpha", 0), layer=4, anim=anim, outline=th.get("outline"),
             bord=round(2 * u) if th.get("outline") else 0, shadow=not th.get("blur_bg") and th.get("alpha", 0) < 0x80)
    top = cy - h / 2 + pad
    st = ctx.style(font, fs, tcol, "#000000", 0, 0)
    ty = top + len(lines) * lh / 2
    dur_ms = int((b - a) * 1000)
    tagfn = lambda xx, yy, i: enter_tag(anim, xx, yy, u) + exit_tag("fade", dur_ms)  # noqa: E731
    ctx.draw_lines(a, b, st, lines, font, fs, cx, ty, lh, tagfn, tcol, accent if fill != accent else "#FFFFFF", 7,
                   clamp=False, register=False)
    if sub_lines:
        sst = ctx.style(body_font, sfs, tcol, "#000000", 0, 0)
        sy = top + len(lines) * lh + 20 * u + len(sub_lines) * slh / 2
        ctx.draw_lines(a, b, sst, sub_lines, body_font, sfs, cx, sy, slh, tagfn, tcol, accent, 7, extra="\\alpha&H30&",
                       clamp=False, register=False)
    label = e.get("label", th.get("label"))
    if label:
        lfs = 46 * u
        lfont = ctx.fkey("title")
        lw = ctx.text_w(str(label).upper(), lfont, lfs) + 56 * u
        lhh = lfs * 1.7
        lcx = cx - w / 2 + lw / 2 + 28 * u
        lcy = cy - h / 2
        ctx.card(a + 0.08, b, lcx, lcy, lw, lhh, theme_color(ctx, th["label_bg"]), radius=lhh / 2, layer=8, shadow=False,
                 anim="pop", register=False)
        lst = ctx.style(lfont, lfs, theme_color(ctx, th["label_text"]), "#000000", 0, 0)
        ctx.add(a + 0.08, b, lst, "{" + enter_tag("pop", lcx, lcy + ctx.cap_shift(lfont, lfs), u) + exit_tag("fade", dur_ms) + "}" +
                esc(str(label).upper()), layer=9)
    return a, b


def ev_checklist(ctx, e):
    items = [str(i) for i in (e.get("items") or [])]
    if not items:
        return None
    a, b = ev_window(ctx, e, max(3.0, 1.2 * len(items)))
    u = ctx.u
    dark = e.get("style") == "dark"
    w = ctx.W * num(e.get("width"), 0.84)
    pad = 46 * u
    fs = sizes_map(e.get("size"), 64) * u
    font = ctx.fkey("title")
    row_h = fs * 1.75
    title = e.get("title")
    tfs = fs * 0.62
    head = tfs * 2.0 if title else 0
    h = pad * 2 + len(items) * row_h + head
    cx = ctx.W * 0.5
    cy = ctx.clamp_y(ypos(ctx, e.get("position"), "center"), h + 40 * u)
    fill = "#121212" if dark else theme_color(ctx, e.get("fill", "card"))
    ink = "#FFFFFF" if dark else theme_color(ctx, e.get("color", "ink"))
    if dark:
        ctx.video_requests.append({"kind": "blur_region", "a": a, "b": b, "x": cx - w / 2, "y": cy - h / 2, "w": w, "h": h,
                                   "r": 36 * u, "sigma": 24})
    ctx.card(a, b, cx, cy, w, h, fill, 0x38 if dark else 0, layer=4, anim="slide", shadow=not dark,
             outline="#FFFFFF" if dark else None, bord=round(1.5 * u) if dark else 0)
    top = cy - h / 2 + pad
    dur_ms = int((b - a) * 1000)
    times = e.get("times")
    step = (b - a - 0.4) / max(len(items), 1)
    item_times = [ctx.t(times[i]) if times and i < len(times) else a + 0.25 + i * step for i in range(len(items))]
    if title:
        tst = ctx.style(ctx.fkey("body"), tfs, ink, "#000000", 0, 0)
        ctx.add(a + 0.15, b, tst, "{" + f"\\an4\\pos({cx - w / 2 + pad:.0f},{top + tfs * 0.7 + ctx.cap_shift(ctx.fkey('body'), tfs):.0f})"
                "\\alpha&H60&\\fad(150,160)" + "}" + esc(str(title).upper()), layer=7)
        # "1 of 3" counter on the right
        cst = ctx.style(ctx.fkey("body"), tfs, ink, "#000000", 0, 0)
        for i, ta in enumerate(item_times):
            tb = item_times[i + 1] if i + 1 < len(item_times) else b
            ctx.add(max(a + 0.15, ta), tb, cst, "{" + f"\\an6\\pos({cx + w / 2 - pad:.0f},{top + tfs * 0.7 + ctx.cap_shift(ctx.fkey('body'), tfs):.0f})"
                    "\\alpha&H60&" + "}" + f"{i + 1} of {len(items)}", layer=7)
        top += head
    box = fs * 1.0
    for i, it in enumerate(items):
        ta = item_times[i]
        ry = top + i * row_h + row_h / 2
        bx = cx - w / 2 + pad
        ctx.shape(a, b, rrect(box, box, 12 * u), "#FFFFFF", 0xFF, f"\\an4\\pos({bx:.0f},{ry:.0f})\\fad(100,160)", 7,
                  outline=ink, bord=round(4 * u))
        ctx.shape(ta + 0.12, b, rrect(box, box, 12 * u), ctx.accent, 0,
                  f"\\an4\\pos({bx:.0f},{ry:.0f})\\fscx30\\fscy30\\t(0,120,\\fscx115\\fscy115)\\t(120,200,\\fscx100\\fscy100)\\fad(0,160)", 8)
        ctx.shape(ta + 0.12, b, check_path(box), "#161616", 0, f"\\an4\\pos({bx:.0f},{ry:.0f})\\fad(60,160)", 9)
        lines, ifs = ctx.wrap(it, font, fs, w - 2 * pad - box - 30 * u, max_lines=1)
        ist = ctx.style(font, ifs, ink, "#000000", 0, 0)
        ctx.add(ta, b, ist, "{" + f"\\an4\\move({bx + box + 60 * u:.0f},{ry + ctx.cap_shift(font, ifs):.0f},{bx + box + 28 * u:.0f},"
                f"{ry + ctx.cap_shift(font, ifs):.0f},0,200)\\fad(140,160)" + "}" + ctx.markup(lines[0], ink, ctx.accent), layer=8)
        if e.get("sfx", "pop"):
            ctx.extra_sfx.append((ta + 0.1, e.get("sfx", "pop"), 0.5))
    return a, b


def fmt_num(v, decimals=0, indian=False):
    decimals = max(0, min(4, int(decimals)))
    if decimals:
        return f"{v:,.{decimals}f}"
    n = int(round(abs(v)))
    if indian and n > 999:
        s = str(n)
        head, tail = s[:-3], s[-3:]
        head = re.sub(r"(\d)(?=(\d\d)+$)", r"\1,", head)
        return ("-" if v < 0 else "") + head + "," + tail
    return ("-" if v < 0 else "") + f"{n:,}"


def ev_counter(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    def num(v, d):
        try:
            x = float(v)
            return d if x != x or abs(x) == float("inf") else max(-1e15, min(1e15, x))
        except (TypeError, ValueError):
            return d
    frm, to = num(e.get("from", 0), 0.0), num(e.get("to", 100), 100.0)
    dec = int(max(0, min(4, num(e.get("decimals", 0), 0))))
    pre, suf = str(e.get("prefix", "")), str(e.get("suffix", ""))
    font = resolve_font(e.get("font", "noto-black"))
    size = sizes_map(e.get("size"), 150) * u
    color = e.get("color") or ctx.col("text", "#FFFFFF")
    x = xpos(ctx, e.get("x"), 0.5)
    y = ctx.clamp_y(ypos(ctx, e.get("position"), "upper"), size * 1.6)
    st = ctx.style(font, size, color, "#000000", round(7 * u), round(5 * u))
    run = min(num(e.get("run"), (b - a) * 0.7, 0.1), b - a)
    n = max(2, int(run * FPS))
    shift = ctx.cap_shift(font, size)
    widest = ctx.text_w(pre + fmt_num(max(abs(frm), abs(to)), dec, e.get("indian", "₹" in pre)) + suf, font, size)
    for i in range(n + 1):
        p = 1 - (1 - i / n) ** 3
        v = frm + (to - frm) * p
        t0 = a + i / FPS
        t1 = a + (i + 1) / FPS if i < n else b
        tag = f"\\an5\\pos({x:.0f},{y + shift:.0f})"
        if i == 0:
            tag += "\\fad(120,0)"
        if i == n:
            tag += "\\fscx112\\fscy112\\t(0,160,\\fscx100\\fscy100)\\fad(0,180)\\c" + c_tag(e.get("end_color", ctx.accent))
        ctx.add(t0, t1, st, "{" + tag + "}" + esc(pre + fmt_num(v, dec, e.get("indian", "₹" in pre)) + suf), layer=6)
    lab_h = 0
    if e.get("label"):
        lf = ctx.fkey("body")
        lst = ctx.style(lf, 52 * u, color, "#000000", round(4 * u), round(3 * u))
        ly = y + size * 0.72
        ctx.add(a + 0.1, b, lst, "{" + f"\\an5\\pos({x:.0f},{ly + ctx.cap_shift(lf, 52 * u):.0f})\\fad(200,180)" + "}" +
                esc(str(e["label"]).upper()), layer=6)
        lab_h = 70 * u
    ctx.register(a, b, x - widest / 2, y - size * 0.55, x + widest / 2, y + size * 0.55 + lab_h)
    if e.get("sfx", "cash") and to != frm:
        ctx.extra_sfx.append((a + run, e.get("sfx", "cash"), 0.45))
    return a, b


def ev_pill(ctx, e, default_text, default_pos, default_at=None, default_dur=2.8):
    if e.get("at") is None and default_at is not None:
        e = dict(e, at=default_at)
    a, b = ev_window(ctx, e, default_dur)
    u = ctx.u
    text = str(e.get("text") or default_text)
    style = e.get("style", "pill")
    fs = sizes_map(e.get("size"), 68) * u
    font = ctx.fkey("title")
    fill = theme_color(ctx, e.get("fill", "accent" if style == "pill" else "#161616" if style == "dark" else "card"))
    tcol = theme_color(ctx, e.get("color", "ink" if style in ("pill", "light") else "#FFFFFF"))
    lines, fs2 = ctx.wrap(text, font, fs, ctx.W * 0.74, max_lines=2)
    tw = max(ctx.text_w(l, font, fs2) for l in lines)
    w = tw + 90 * u
    h = fs2 * 1.15 * len(lines) + 56 * u
    cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), w)
    cy = ctx.clamp_y(ypos(ctx, e.get("position"), default_pos), h)
    ctx.card(a, b, cx, cy, w, h, fill, radius=min(h / 2, 60 * u), layer=10, anim="pop")
    st = ctx.style(font, fs2, tcol, "#000000", 0, 0)
    dur_ms = int((b - a) * 1000)
    ctx.draw_lines(a, b, st, lines, font, fs2, cx, cy, fs2 * 1.15, lambda xx, yy, i: enter_tag("pop", xx, yy, u) + exit_tag("fade", dur_ms),
                   tcol, "#FFFFFF" if fill == ctx.accent else ctx.accent, 12, clamp=False, register=False)
    if e.get("sfx", "pop"):
        ctx.extra_sfx.append((a, e.get("sfx", "pop"), 0.5))
    return a, b


def ev_lower_third(ctx, e):
    a, b = ev_window(ctx, e, 3.5)
    u = ctx.u
    name = str(e.get("text") or ctx.brand.get("name") or "")
    sub = e.get("sub") or (("@" + ctx.brand["handle"].lstrip("@")) if ctx.brand.get("handle") else "")
    font, body = ctx.fkey("title"), ctx.fkey("body")
    fs, sfs = 56 * u, 38 * u
    w = max(ctx.text_w(name.upper(), font, fs), ctx.text_w(sub, body, sfs)) + 90 * u
    h = fs * 1.3 + (sfs * 1.4 if sub else 0) + 40 * u
    x0 = ctx.W * 0.07
    cy = ctx.clamp_y(ypos(ctx, e.get("position"), 0.58), h)
    ctx.shape(a, b, rrect(w, h, 18 * u), ctx.col("dark", "#161616"), 0x18,
              f"\\an4\\move({-w:.0f},{cy:.0f},{x0:.0f},{cy:.0f},0,280)\\fad(0,200)", 10)
    ctx.shape(a, b, rrect(12 * u, h, 6 * u), ctx.accent, 0, f"\\an4\\move({-w:.0f},{cy:.0f},{x0:.0f},{cy:.0f},0,280)\\fad(0,200)", 11)
    nst = ctx.style(font, fs, "#FFFFFF", "#000000", 0, 0)
    ty = cy - h / 2 + 20 * u + fs * 0.65
    ctx.add(a + 0.12, b, nst, "{" + f"\\an4\\move({x0 + 10 * u:.0f},{ty + ctx.cap_shift(font, fs):.0f},{x0 + 40 * u:.0f},{ty + ctx.cap_shift(font, fs):.0f},0,250)\\fad(150,200)" + "}" +
            esc(name.upper()), layer=12)
    if sub:
        sst = ctx.style(body, sfs, ctx.accent, "#000000", 0, 0)
        sy = ty + fs * 0.55 + sfs * 0.75
        ctx.add(a + 0.2, b, sst, "{" + f"\\an4\\move({x0 + 10 * u:.0f},{sy + ctx.cap_shift(body, sfs):.0f},{x0 + 40 * u:.0f},{sy + ctx.cap_shift(body, sfs):.0f},0,250)\\fad(150,200)" + "}" + esc(sub), layer=12)
    ctx.register(a, b, x0, cy - h / 2, x0 + w, cy + h / 2)
    if e.get("sfx", "whoosh-fast"):
        ctx.extra_sfx.append((a, e.get("sfx", "whoosh-fast"), 0.4))
    return a, b


def ev_progress(ctx, e):
    u = ctx.u
    a = ctx.t(e.get("at"), 0.0)
    b = ctx.t(e.get("end"), ctx.dur) if e.get("end") is not None else ctx.dur
    hgt = num(e.get("height"), 12) * u
    y = 0 if e.get("position", "top") == "top" else ctx.H - hgt
    ms = int((b - a) * 1000)
    ctx.shape(a, b, rect(ctx.W, hgt), "#FFFFFF", 0xB0, f"\\an7\\pos(0,{y:.0f})", 20)
    ctx.shape(a, b, rect(ctx.W, hgt), e.get("color", ctx.accent), 0,
              f"\\an7\\pos(0,{y:.0f})\\clip(0,0,1,{ctx.H})\\t(0,{ms},\\clip(0,0,{ctx.W},{ctx.H}))", 21)
    return None


def ev_flash(ctx, e):
    a = ctx.t(e.get("at"), 0.0)
    d = num(e.get("dur"), 0.3)
    ctx.shape(a, a + d, rect(ctx.W, ctx.H), e.get("color", "#FFFFFF"), 0, f"\\an7\\pos(0,0)\\fad(0,{int(d * 1000)})", 30)
    return None


def ev_letterbox(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    bh = ctx.H * num(e.get("size"), 0.1)
    ctx.shape(a, b, rect(ctx.W, bh), "#000000", 0, f"\\an7\\move(0,{-bh:.0f},0,0,0,300)\\fad(0,250)", 25)
    ctx.shape(a, b, rect(ctx.W, bh), "#000000", 0, f"\\an7\\move(0,{ctx.H:.0f},0,{ctx.H - bh:.0f},0,300)\\fad(0,250)", 25)
    return None


def ev_countdown(ctx, e):
    try:
        n = max(1, min(10, int(num(e.get("from"), 3))))
    except (TypeError, ValueError, OverflowError):
        n = 3
    a, b = ev_window(ctx, e, float(n))
    step = (b - a) / n
    u = ctx.u
    font = resolve_font(e.get("font", "anton"))
    size = sizes_map(e.get("size"), 320) * u
    st = ctx.style(font, size, e.get("color", "#FFFFFF"), "#000000", round(10 * u), round(6 * u))
    y = ctx.clamp_y(ypos(ctx, e.get("position"), "center"), size * 1.2)
    for i in range(n):
        t0 = a + i * step
        ctx.add(t0, t0 + step, st, "{" + f"\\an5\\pos({ctx.W / 2:.0f},{y + ctx.cap_shift(font, size):.0f})\\fscx40\\fscy40"
                "\\t(0,150,\\fscx110\\fscy110)\\t(150,240,\\fscx100\\fscy100)\\fad(0,120)" + "}" + str(n - i), layer=14)
        ctx.extra_sfx.append((t0, e.get("sfx", "tick"), 0.6))
    ctx.register(a, b, ctx.W / 2 - size * 0.4, y - size * 0.6, ctx.W / 2 + size * 0.4, y + size * 0.6)
    return a, b


def ev_outline_title(ctx, e):
    return _fix_outline(ctx, e)


EVENTS = {
    "title": lambda c, e: (ev_outline_title(c, e) if (e.get("style") == "outline") else ev_title(c, e, 118, "top")),
    "text": lambda c, e: ev_title(c, dict({"style": "fade", "size": 64}, **e), 64, "center"),
    "stamp": lambda c, e: ev_title(c, dict({"style": "stamp", "size": 110, "position": "center"}, **e), 110, "center"),
    "card": ev_card,
    "checklist": ev_checklist,
    "counter": ev_counter,
    "cta": lambda c, e: ev_pill(c, e, c.brand.get("cta") or "Follow for more", "lower", default_at=-2.8),
    "tag": lambda c, e: ev_pill(c, dict({"style": "light", "size": 50}, **e), "", "upper", default_dur=2.5),
    "lower_third": ev_lower_third,
    "progress_bar": ev_progress,
    "flash": ev_flash,
    "letterbox": ev_letterbox,
    "countdown": ev_countdown,
}

HIDE_CAPTIONS = {"card", "checklist", "counter", "countdown", "cta"}
_unused = (a_tag,)

DOCS = {
    "title": "Big animated headline. text (*accent* words, | new line), style: pop slide slide-down slide-left slide-right drop "
             "punch stamp fade blur rise bounce elastic flip zoom zoom-out spin swing flicker typewriter split glow highlight "
             "wipe cascade flip-chars glitch marker underline outline sketch press ransom serif stack 3d glass neon blow scatter; "
             "position top|upper|center|lower|bottom|0-1, size s|m|l|xl|xxl|huge|px, font, color, accent, exit fade|shrink|blur|up|none, "
             "rotate{x,y,z} (3d), behind:true (AI: text behind you)",
    "text": "Smaller on-screen text (same options as title; default fade, centre).",
    "stamp": "Rotated slam-in word ('WRONG', 'SAVED!'). Same options as title.",
    "card": "Rounded info card. text, sub, label (chip), style note|paper|dark|accent|myth|fact|tip|quote|glass|dark-glass|outline "
            "(glass styles blur the video behind them), position, anim pop|slide|fade|rise|…, size, width",
    "checklist": "Card whose items tick on one by one. items[], title (shows '1 of 3'), times[] (phrases/seconds), style light|dark "
                 "(dark = frosted dark glass), position",
    "counter": "Number count-up. from, to, prefix (₹ $), suffix (% K L), decimals, label, position, indian (lakh commas; auto with ₹)",
    "cta": "Call-to-action pill (default last 2.8s, brand CTA). text, style pill|dark|light, position",
    "tag": "Small pill label (app name, 'Day 3', location). text, position, fill, color",
    "lower_third": "Name bar that slides in. text (name), sub (@handle)",
    "progress_bar": "Thin bar that fills across the video. position top|bottom, color",
    "flash": "White/colour flash. dur (0.3), color",
    "letterbox": "Cinematic black bars slide in. dur, size",
    "countdown": "3-2-1 big numbers with ticks. from",
}
