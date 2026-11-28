"""Style 1 — kinetic typography (reference: scattered lowercase grotesk, text behind you, dark spotlight, colour swaps)."""
from velib import Plan, L, S, tw, ms, rect, c
from chunks import chunks

FONT = "ve-grotesk-black"
SCRIPT = "ve-script"
GREEN = "#43E07A"
HEAD = {"en": dict(x=0.47, top=0.17, y=0.27), "hi": dict(x=0.5, top=0.29, y=0.36)}


def word_layers(x, y, an, text, t0, t1, font=FONT, size=120, color="#FFFFFF", fsp=-3, shadow=True, rise=16,
                scale0=112, extra="", glow=None):
    """One kinetic word: blur-in + settle, blur-out at the end. Times relative to the event start."""
    T = ms(t1 - t0)
    mv = f"\\an{an}\\fsp{fsp}\\move({x:.0f},{y + rise:.0f},{x:.0f},{y:.0f},0,320)\\fscx{scale0}\\fscy{scale0}\\t(0,220,\\fscx100\\fscy100)"
    out = []
    if shadow:
        out.append(L(t0, t1, "{" + mv + f"\\blur18\\bord5\\3c&H000000&\\alpha&HFF&\\t(0,200,\\alpha&H90&)\\t({T - 150},{T},\\alpha&HFF&)" + extra + "}" + text,
                     font=font, size=size, color="#000000", layer=7))
    if glow:
        out.append(L(t0, t1, "{" + mv + f"\\blur24\\bord8\\3c{c(glow)}\\alpha&HFF&\\t(0,200,\\alpha&H70&)\\t({T - 150},{T},\\alpha&HFF&)" + extra + "}" + text,
                     font=font, size=size, color=glow, layer=7))
    out.append(L(t0, t1, "{" + mv + f"\\blur10\\alpha&HFF&\\t(0,220,\\blur0\\alpha&H00&)\\t({T - 150},{T},\\alpha&HFF&\\blur8)" + extra + "}" + text,
                 font=font, size=size, color=color, layer=8))
    return out


def cascade(ch, yc, small=112, big=220, first="left", xl=84, xr=996, color="#FFFFFF", emph_color=None,
            script_emph=False, fit=520, lead=0.05):
    """Words stacked on alternating left/right lines; emphasis words big. Returns layers relative to chunk start."""
    lines = []
    for (i, t, s, e) in ch.words:
        em = i in ch.emph
        size = big if em else small
        font = SCRIPT if (em and script_emph) else FONT
        if script_emph and em:
            size = int(big * 1.25)
        item = dict(t=t.lower() if font == FONT else t.lower(), s=s, size=size, font=font, em=em)
        if lines and not em and not lines[-1][-1]["em"] and \
                tw(" ".join(w["t"] for w in lines[-1]) + " " + item["t"], FONT, small) < fit:
            lines[-1].append(item)
        else:
            lines.append([item])
    heights = [max(w["size"] for w in ln) * (0.78 if any(w["font"] == SCRIPT for w in ln) else 0.86) for ln in lines]
    top = yc - sum(heights) / 2
    layers = []
    at = ch.start - lead
    for k, ln in enumerate(lines):
        left = (k % 2 == 0) == (first == "left")
        y = top + sum(heights[:k]) + heights[k] / 2
        # place words of the line one after another
        widths = [tw(w["t"], w["font"], w["size"], -3) for w in ln]
        space = 0.26 * ln[0]["size"]
        total = sum(widths) + space * (len(ln) - 1)
        x = xl if left else xr - total
        x = max(40, min(x, 1040 - total))
        for w, wd in zip(ln, widths):
            col = emph_color if (w["em"] and emph_color) else color
            layers += word_layers(x, y, 4, w["t"], w["s"] - at, ch.end - at, font=w["font"], size=w["size"], color=col)
            x += wd + space
    return at, ch.end - at, layers


def hero(ch, word_i, x, y, size, color="#FFFFFF", font=FONT, lead=0.05, an=5, glow=None, fsp=-8, shadow=False,
         small_words=True, small_y=None, small_x=None, small_size=96, small_an=5):
    """One giant word (usually behind the head) + the remaining words small."""
    at = ch.start - lead
    layers = []
    for (i, t, s, e) in ch.words:
        if i == word_i:
            layers += word_layers(x, y, an, t.lower(), s - at, ch.end - at, font=font, size=size, color=color,
                                  fsp=fsp, shadow=shadow, rise=30, scale0=120, glow=glow)
    if small_words:
        rest = " ".join(t.lower() for (i, t, s, e) in ch.words if i != word_i)
        if rest:
            s0 = ch.words[0][2] if ch.words[0][0] != word_i else ch.words[1][2]
            layers += word_layers(small_x if small_x is not None else x, small_y, small_an, rest, s0 - at, ch.end - at,
                                  size=small_size, color=color, shadow=(color == "#FFFFFF"))
    return at, ch.end - at, layers


def build(lang):
    p = Plan(lang, f"style1-kinetic-{lang}", look={"filter": "eq=contrast=1.12:saturation=0.82:brightness=-0.025,vignette=PI/5"},
             music="m-kinetic.wav", music_vol=0.2)
    hd = HEAD[lang]
    Y = lambda f: f * 1920  # noqa: E731
    C = {c_.role: c_ for c_ in chunks(p.w, lang)}
    D = p.dur

    # ---------------- backgrounds (AI) and colour swaps
    same, tenx, show = C["same"], C["tenx"], C["show"]
    p.ev(type="background", at=0, until=round(same.start, 3), bg="bg/teal-spot.png")
    p.ev(type="background", at=round(same.start, 3), until=round(tenx.start, 3), bg="bg/red-wall.png")
    p.ev(type="background", at=round(tenx.start, 3), until=round(show.start, 3), bg="bg/white-seamless.png")
    p.ev(type="bw", at=round(tenx.start, 3), until=round(show.start, 3))
    p.ev(type="background", at=round(show.start, 3), dur=round(D - show.start, 3), bg="bg/teal-spot.png")

    # ---------------- camera
    p.ev(type="zoom", at=0, dur=1.1, style="push", amount=1.08)
    p.ev(type="zoom", at=round(C["views"].start, 3), dur=1.2, style="push", amount=1.1)
    p.ev(type="zoom", at=round(same.start, 3), dur=1.4, style="push", amount=1.1)
    p.ev(type="zoom", at=round(tenx.start, 3), dur=1.3, style="push", amount=1.12)
    p.ev(type="zoom", at=round(show.start, 3), dur=D - show.start, style="slow", amount=1.06)

    def add(block, behind=False):
        at, dur, layers = block
        p.ass(at, dur, layers, behind=behind)

    head_top = Y(hd["top"])
    # ---------------- text beats
    for role, ch in C.items():
        if role == "hook":
            add(cascade(ch, head_top + 60, small=150, big=230, first="left"), behind=True)
        elif role == "hook2":
            add(cascade(ch, head_top + 70, small=140, big=200, script_emph=True, first="right"), behind=False)
        elif role == "reels":
            add(hero(ch, 6, 540, head_top + 40, 360, small_y=head_top - 140, small_size=100), behind=True)
            p.sfx("ve-whoosh-air", ch.words[1][2], 0.32)
        elif role == "content":
            add(cascade(ch, Y(0.70), small=124, big=210, first="left"))
        elif role == "problem":
            add(hero(ch, 13, 540, head_top + 40, 300, small_y=head_top - 140, small_size=110), behind=True)
        elif role == "editing":
            # b-roll cut-away: colour grading close-up with a giant green word
            a0 = ch.start - 0.06
            p.ev(type="broll", at=round(a0, 3), until=round(ch.end, 3), file="color-grading.mp4", **{"from": 6})
            p.ev(type="filter", at=round(a0, 3), until=round(ch.end, 3), filter="eq=brightness=-0.08:contrast=1.1")
            i_ed = [w[0] for w in ch.words if w[0] in ch.emph][0]
            add(hero(ch, i_ed, 540, Y(0.47), 250 if lang == "en" else 270, color=GREEN, glow=None, shadow=True,
                     small_y=Y(0.37), small_size=110))
            p.sfx("ve-whoosh-deep", a0 + 0.05, 0.42)
        elif role == "views":
            i_v = ch.idx[0] if lang == "hi" else 17
            add(hero(ch, i_v, 540, head_top + 40, 380, small_y=head_top - 140,
                     small_size=104), behind=True)
            p.sfx("ve-hit", ch.words[-1][2] if lang == "en" else ch.start, 0.5)
        elif role == "decide":
            add(cascade(ch, Y(0.70), small=124, big=200, first="right"))
        elif role == "twosec":
            a0 = ch.start - 0.06
            p.ev(type="broll", at=round(a0, 3), until=round(ch.end, 3), file="eye-closeup.mp4", **{"from": 3})
            p.ev(type="filter", at=round(a0, 3), until=round(ch.end, 3), filter="eq=brightness=-0.12:saturation=0.8")
            add(cascade(ch, Y(0.5), small=130, big=250, first="left"))
            p.sfx("ve-whoosh-deep", a0 + 0.05, 0.38)
            p.sfx("ve-tick", ch.words[-1][2], 0.35)
        elif role == "stay":
            add(cascade(ch, head_top + 60, small=130, big=260, first="left"), behind=True)
        elif role == "scroll":
            a0 = ch.start - 0.05
            p.ev(type="broll", at=round(a0, 3), until=round(ch.end, 3), file="hands-phone.mp4", **{"from": 4})
            p.ev(type="filter", at=round(a0, 3), until=round(ch.end, 3), filter="eq=brightness=-0.1")
            i_s = [w[0] for w in ch.words if w[0] in ch.emph][0]
            at = ch.start - 0.05
            # streaking "scroll": motion-blurred word sliding up
            T = ms(ch.end - at)
            s_rel = [w[2] for w in ch.words if w[0] == i_s][0] - at
            layers = [L(s_rel, ch.end - at, "{\\an5\\fsp-8\\move(540,1260,540,960,0,260)\\blur14\\fscy140\\t(0,260,\\blur0\\fscy100)"
                        f"\\t({T - ms(s_rel) - 150},{T - ms(s_rel)},\\alpha&HFF&)}}scroll", font=FONT, size=330)]
            rest = " ".join(w[1].lower() for w in ch.words if w[0] != i_s)
            if rest:
                layers += word_layers(540, 770, 5, rest, 0.05, ch.end - at, size=110)
            p.ass(at, ch.end - at, layers)
            p.sfx("ve-scroll", s_rel + at, 0.5)
            p.sfx("ve-swish", a0 + 0.02, 0.3)
        elif role == "same":
            i_v = ch.idx[-1]
            add(hero(ch, i_v, 540, head_top + 40, 340, small_y=head_top - 140,
                     small_size=104), behind=True)
            p.sfx("ve-reverse", ch.start, 0.35)
            p.sfx("ve-thump", ch.start, 0.5)
        elif role == "edited":
            add(cascade(ch, Y(0.70), small=200, big=200, script_emph=False, first="left", emph_color=None))
        elif role == "tenx":
            i10 = [w[0] for w in ch.words if w[1] == "10x"][0]
            at = ch.start - 0.05
            layers = []
            for (i, t, s, e) in ch.words:
                if i == i10:
                    layers += word_layers(540, head_top + 60, 5, "10x", s - at, ch.end - at, size=470, color="#141414",
                                          fsp=-14, shadow=False, rise=40, scale0=130)
            rest_before = " ".join(t.lower() for (i, t, s, e) in ch.words if i < i10)
            rest_after = " ".join(t.lower() for (i, t, s, e) in ch.words if i > i10 and t.lower() not in ("times", "guna"))
            if rest_before:
                layers += word_layers(84, head_top - 150, 4, rest_before, 0.05, ch.end - at, size=110, color="#141414",
                                      shadow=False)
            if rest_after:
                s_aft = [s for (i, t, s, e) in ch.words if i > i10 and t.lower() not in ("times", "guna")][0]
                layers += word_layers(996, head_top + 290, 6, rest_after, s_aft - at, ch.end - at, size=140,
                                      color="#141414", shadow=False)
            p.ass(at, ch.end - at, layers, behind=True)
            p.sfx("ve-hit", [s for (i, t, s, e) in ch.words if i == i10][0], 0.45)
        elif role == "show":
            add(cascade(ch, head_top + 60, small=150, big=240, first="left"), behind=True)

    # ---------------- end lockup: small "edited with" + vibe editor
    t_l = max(D - 0.95, C["show"].words[-1][2] + 0.1)
    lay = word_layers(540, 1560, 5, "edited with", 0.0, D - t_l, size=58, color="#FFFFFF", fsp=0, rise=10) + \
        word_layers(540, 1660, 5, "vibe editor", 0.08, D - t_l, size=150, color="#FFFFFF", fsp=-4, rise=20)
    p.ass(t_l, D - t_l, lay)
    p.sfx("ve-shimmer", t_l + 0.1, 0.3)

    # ---------------- sound: swish on each chunk + transitions
    for role, ch in C.items():
        if role not in ("editing", "twosec", "scroll"):
            p.sfx("ve-swish", ch.start, 0.16)
    p.sfx("ve-whoosh-air", 0.02, 0.3)
    return p


if __name__ == "__main__":
    import sys
    for lang in sys.argv[1:] or ["en", "hi"]:
        print(build(lang).save())
