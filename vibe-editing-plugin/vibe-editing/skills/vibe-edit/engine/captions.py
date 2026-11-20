"""Build the .ass subtitle file: captions (word highlight, pop, emphasis), hook, kinetic type,
titles, lower thirds and labels. Times come in as SOURCE times and are mapped to output time."""
from __future__ import annotations

import re
import textwrap

from common import ass_c, ass_color, font_info


def ts(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, rem = divmod(cs, 360000)
    m, rem = divmod(rem, 6000)
    s, c = divmod(rem, 100)
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"


def esc(text: str) -> str:
    return text.replace("\\", "⧵").replace("{", "(").replace("}", ")").replace("\n", " ")


def apply_case(text: str, case: str) -> str:
    if case == "upper":
        return text.upper()
    if case == "lower":
        return text.lower()
    if case == "title":
        return text.title()
    return text


def strip_punct(w: str) -> str:
    return re.sub(r"[,.;:!?]+$", "", w) if len(w) > 1 else w


def normalize_line(line: dict) -> list:
    """If the line text was edited on the board, re-time the words to the new text."""
    words = line.get("words") or []
    text = (line.get("text") or "").strip()
    if not words:
        return []
    old = " ".join(w["w"] for w in words)
    if not text or text == old:
        return words
    new = text.split()
    if len(new) == len(words):
        return [dict(w, w=n) for w, n in zip(words, new)]
    s, e = words[0]["s"], words[-1]["e"]
    step = (e - s) / max(1, len(new))
    emph = {w["w"].lower() for w in words if w.get("emph")}
    return [{"w": n, "s": s + i * step, "e": s + (i + 1) * step, "emph": n.lower() in emph} for i, n in enumerate(new)]


class AssBuilder:
    def __init__(self, width: int, height: int, style: dict):
        self.W, self.H = width, height
        self.style = style
        self.k = height / 1920 if height >= width else width / 1920  # sizes are authored for 1080x1920
        self.events = []

    # -------------------------------------------------------------- header
    def header(self) -> str:
        cap, hook, mot = self.style["captions"], self.style["hook"], self.style["motion"]
        k = self.k

        def style_line(name, font_key, size, primary, outline_col, outline, shadow, shadow_col, border_style=1,
                       back=None, back_alpha=0.0, align=5, spacing=0):
            _, (_f, fam, bold, _w, _v, ratio) = font_info(font_key)
            return (f"Style: {name},{fam},{int(size * k / ratio)},{ass_color(primary)},{ass_color(primary)},"
                    f"{ass_color(outline_col)},{ass_color(back or shadow_col, back_alpha)},{-1 if bold else 0},0,0,0,"
                    f"100,100,{spacing},0,{border_style},{outline * k:.1f},{shadow * k:.1f},{align},60,60,60,1")

        cap_box = bool(cap.get("box"))
        lines = [
            "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {self.W}", f"PlayResY: {self.H}", "WrapStyle: 0",
            "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "", "[V4+ Styles]",
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, "
            "Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
            "MarginL, MarginR, MarginV, Encoding",
            style_line("Cap", cap["font"], cap["size"], cap["color"],
                       cap["box_color"] if cap_box else cap["outline_color"],
                       (14 if cap_box else cap["outline"]), cap["shadow"], cap["shadow_color"],
                       border_style=3 if cap_box else 1, spacing=cap.get("letter_spacing", 0)),
            style_line("Hook", hook["font"], hook["size"], hook["color"], hook["box_color"], 18, 0, "#000000",
                       border_style=3),
            style_line("Text", mot["font"], 110, mot["color"], "#000000", 7, 4, "#000000"),
            style_line("Title", mot["font"], 100, mot["color"], "#000000", 0, 6, "#000000"),
            style_line("Lower", mot["font"], 44, "#111111", "#FFFFFF", 16, 0, "#000000", border_style=3, align=1),
            style_line("Label", mot["font"], 40, "#111111", mot.get("accent", "#FFE14D"), 12, 0, "#000000",
                       border_style=3),
            "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
        ]
        return "\n".join(lines)

    def add(self, start, end, style, text, layer=0):
        if end - start < 0.02:
            return
        self.events.append(f"Dialogue: {layer},{ts(start)},{ts(end)},{style},,0,0,0,,{text}")

    # -------------------------------------------------------------- captions
    def captions(self, lines, tmap):
        cap = self.style["captions"]
        k = self.k
        cx, cy = self.W // 2, int(cap["position_y"] * self.H)
        base, act, emc = cap["color"], cap["active_color"], cap.get("emphasis_color") or cap["active_color"]
        hl, anim = cap.get("highlight", "color"), cap.get("animation", "pop")
        mapped = []
        for ln in lines:
            ws = normalize_line(ln)
            mw = []
            for w in ws:
                if not tmap.inside((w["s"] + w["e"]) / 2):
                    continue
                s = tmap.to_out(w["s"])
                e = tmap.to_out(max(w["s"] + 0.01, w["e"] - 0.001), snap="prev")
                mw.append(dict(w, os=s, oe=max(e, s + 0.05)))
            if mw:
                mapped.append(mw)
        for li, mw in enumerate(mapped):
            nxt = mapped[li + 1][0]["os"] if li + 1 < len(mapped) else None
            line_end = mw[-1]["oe"] + 0.25
            if nxt is not None:
                line_end = min(line_end, nxt)
            line_end = max(line_end, mw[-1]["oe"])
            texts = [esc(apply_case(strip_punct(w["w"]), cap["case"])) for w in mw]

            def intro(first: bool) -> str:
                pos = f"\\an5\\pos({cx},{cy})"
                if not first:
                    return pos
                if anim == "pop":
                    return pos + "\\fscx70\\fscy70\\t(0,90,\\fscx108\\fscy108)\\t(90,150,\\fscx100\\fscy100)"
                if anim == "fade":
                    return pos + "\\fad(90,0)"
                if anim == "slide":
                    return f"\\an5\\move({cx},{cy + int(40 * k)},{cx},{cy},0,140)\\fad(80,0)"
                return pos

            def word_col(i, active):
                if active:
                    return act
                return emc if mw[i].get("emph") else base

            if hl == "word":
                for i, w in enumerate(mw):
                    end = mw[i + 1]["os"] if i + 1 < len(mw) else line_end
                    col = emc if w.get("emph") else base
                    self.add(w["os"], end, "Cap", "{" + intro(True) + f"\\c{ass_c(col)}" + "}" + texts[i])
                continue
            if hl == "none":
                body = " ".join(("{\\c" + ass_c(word_col(i, False)) + "}" + t) for i, t in enumerate(texts))
                self.add(mw[0]["os"], line_end, "Cap", "{" + intro(True) + "}" + body)
                continue
            for i, w in enumerate(mw):
                start = mw[0]["os"] if i == 0 else w["os"]
                end = mw[i + 1]["os"] if i + 1 < len(mw) else line_end
                parts = []
                for j, t in enumerate(texts):
                    if j == i:
                        if hl == "box":
                            parts.append("{\\c" + ass_c(base if cap.get("box") else "#111111") + "\\3c" + ass_c(act) +
                                         f"\\bord{int(12 * k)}\\shad0" + "}" + t +
                                         "{\\r}")
                        elif hl == "scale":
                            parts.append("{\\c" + ass_c(act) + "\\fscx112\\fscy112}" + t + "{\\fscx100\\fscy100}")
                        else:
                            parts.append("{\\c" + ass_c(act) + "}" + t)
                    else:
                        parts.append("{\\c" + ass_c(word_col(j, False)) + "}" + t)
                self.add(start, end, "Cap", "{" + intro(i == 0) + "}" + " ".join(parts))

    # -------------------------------------------------------------- hook
    def hook(self, text, duration):
        hk = self.style["hook"]
        if not text:
            return
        t = apply_case(text, hk.get("case", "upper"))
        wrapped = "\\N".join(textwrap.wrap(esc(t), 18 if self.H > self.W else 34)) or esc(t)
        cy = int(hk["position_y"] * self.H)
        anim = ("\\fscx60\\fscy60\\t(0,110,\\fscx106\\fscy106)\\t(110,180,\\fscx100\\fscy100)"
                if hk.get("animation", "pop") == "pop" else "\\fad(120,0)")
        self.add(0, duration, "Hook", "{\\an5\\pos(" + f"{self.W // 2},{cy}" + ")" + anim + "\\fad(0,150)}" + wrapped,
                 layer=2)

    # -------------------------------------------------------------- texts
    def texts(self, items, tmap):
        mot = self.style["motion"]
        acc = mot.get("accent", "#FFE14D")
        k = self.k
        for it in items:
            if not it.get("enabled", True):
                continue
            s = tmap.to_out(float(it["start"]))
            e = tmap.to_out(float(it["end"]), snap="prev")
            if e - s < 0.15:
                e = s + max(0.8, float(it["end"]) - float(it["start"]))
            kind = it.get("type", "kinetic")
            txt = apply_case(it.get("text", ""), it.get("case", "upper"))
            y = int(float(it.get("y", 0.45 if kind != "lower_third" else 0.80)) * self.H)
            x = int(float(it.get("x", 0.5)) * self.W)
            dur_ms = int((e - s) * 1000)
            if kind == "kinetic":
                words = esc(txt).split()
                if not words:
                    continue
                n = len(words)
                step = min(220, max(90, int(dur_ms * 0.5 / n)))
                rows, row = [], []
                for i, w in enumerate(words):
                    t0 = i * step
                    col = acc if (it.get("accent_words") and w.lower() in [a.lower() for a in it["accent_words"]]) \
                        else (acc if i == n - 1 and it.get("accent_last", True) else mot["color"])
                    row.append("{\\alpha&HFF&\\fscx140\\fscy140\\c" + ass_c(col) +
                               f"\\t({t0},{t0 + 1},\\alpha&H00&)\\t({t0},{t0 + 140},\\fscx100\\fscy100)" + "}" + w)
                    if len(row) == 2 or i == n - 1:
                        rows.append(" ".join(row))
                        row = []
                size = it.get("size")
                ratio = font_info(mot["font"])[1][5]
                fs = f"\\fs{int(size * k / ratio)}" if size else ""
                self.add(s, e, "Text", "{\\an5\\pos(" + f"{x},{y}" + ")" + fs + "\\fad(0,120)}" + "\\N".join(rows),
                         layer=3)
            elif kind == "title":
                self.add(s, e, "Title", "{\\an5\\pos(" + f"{x},{y}" + ")\\fad(200,200)\\fscx92\\fscy92"
                         "\\t(0,400,\\fscx100\\fscy100)}" + esc(txt), layer=3)
            elif kind == "lower_third":
                sub = it.get("subtitle")
                x0 = int(70 * k)
                ratio = font_info(mot["font"])[1][5]
                body = esc(txt) + ("\\N{\\fs" + str(int(30 * k / ratio)) + "}" + esc(sub) if sub else "")
                self.add(s, e, "Lower", "{\\an1\\move(" + f"{-int(600 * k)},{y},{x0},{y},0,260" + ")\\fad(0,200)}" +
                         body, layer=3)
            elif kind == "label":
                self.add(s, e, "Label", "{\\an5\\pos(" + f"{x},{y}" + ")\\fscx50\\fscy50\\t(0,120,\\fscx104\\fscy104)"
                         "\\t(120,180,\\fscx100\\fscy100)\\fad(0,120)}" + esc(txt), layer=3)

    def write(self, path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(self.header() + "\n" + "\n".join(self.events) + "\n")
        return path
