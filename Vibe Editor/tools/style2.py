"""Style 2 — editorial (reference: stacked white grotesk + red italic serif, rounded b-roll cards on black, light leaks)."""
import os

from velib import Plan, L, tw, ms, c, WS
from chunks import chunks
from mograph import card_clip

SANS = "inter-extrabold"
BIG = "ve-grotesk-black"
RED_F = "ve-playfair-italic"
RED = "#D3172F"
HEAD = {"en": dict(top=0.17), "hi": dict(top=0.29)}


def sans_word(x, y, an, text, t0, t1, font=SANS, size=70, color="#FFFFFF", fsp=-1, rise=18):
    T = ms(t1 - t0)
    mv = f"\\an{an}\\fsp{fsp}\\move({x:.0f},{y + rise:.0f},{x:.0f},{y:.0f},0,300)"
    return [
        L(t0, t1, "{" + mv + f"\\blur16\\bord4\\3c&H000000&\\alpha&HFF&\\t(0,240,\\alpha&HA0&)\\t({T - 160},{T},\\alpha&HFF&)}}" + text,
          font=font, size=size, color="#000000", layer=7),
        L(t0, t1, "{" + mv + f"\\blur8\\alpha&HFF&\\t(0,240,\\blur0\\alpha&H00&)\\t({T - 160},{T},\\alpha&HFF&\\blur6)}}" + text,
          font=font, size=size, color=color, layer=8),
    ]


def red_word(x, y, an, text, t0, t1, size=150, color=RED, font=RED_F):
    """Italic serif word that writes on left-to-right (animated clip)."""
    T = ms(t1 - t0)
    w = tw(text, font, size) + 60
    x0 = x - (w if an in (6, 3, 9) else (w / 2 if an in (5, 2, 8) else 0)) - 30
    y0, y1 = y - size, y + size
    clip0 = f"\\clip({x0:.0f},{y0:.0f},{x0 + 1:.0f},{y1:.0f})"
    clip1 = f"\\clip({x0:.0f},{y0:.0f},{x0 + w + 60:.0f},{y1:.0f})"
    base = f"\\an{an}\\pos({x:.0f},{y:.0f}){clip0}\\t(0,420,0.6,{clip1})"
    return [
        L(t0, t1, "{" + base + f"\\blur14\\bord3\\3c&H000000&\\alpha&H90&\\t({T - 160},{T},\\alpha&HFF&)}}" + text,
          font=font, size=size, color="#000000", layer=7),
        L(t0, t1, "{" + base + f"\\t({T - 160},{T},\\alpha&HFF&)}}" + text, font=font, size=size, color=color, layer=9),
    ]


def big_word(x, y, an, text, t0, t1, size=210, color="#FFFFFF", font=BIG):
    T = ms(t1 - t0)
    fit = 980 / max(1, tw(text, font, size, -6))
    if fit < 1:
        size = int(size * fit)
    base = f"\\an{an}\\fsp-6\\pos({x:.0f},{y:.0f})\\fscx106\\fscy106\\t(0,260,\\fscx100\\fscy100)"
    return [
        L(t0, t1, "{" + base + f"\\blur20\\bord6\\3c&H000000&\\alpha&HFF&\\t(0,200,\\alpha&H98&)\\t({T - 160},{T},\\alpha&HFF&)}}" + text,
          font=font, size=size, color="#000000", layer=7),
        L(t0, t1, "{" + base + f"\\blur12\\alpha&HFF&\\t(0,200,\\blur0\\alpha&H00&)\\t({T - 160},{T},\\alpha&HFF&\\blur8)}}" + text,
          font=font, size=size, color=color, layer=8),
    ], size


def compose(ch, top, variant="A", lead=0.05, big=215, small=70, red=150):
    """Editorial stack: small sans line, a big word (white grotesk or red italic) and the rest."""
    at = max(0.0, ch.start - lead)
    end = ch.end - at
    words = ch.words
    emph = [w for w in words if w[0] in ch.emph]
    pre = [w for w in words if w[0] < emph[0][0]]
    post = [w for w in words if w[0] > emph[-1][0]]
    layers = []
    y = top
    if pre:
        txt = " ".join(w[1] for w in pre)
        layers += sans_word(120 if variant != "B" else 540, y, 4 if variant != "B" else 5, txt, pre[0][2] - at, end, size=small)
        y += small * 0.62
    etxt = " ".join(w[1] for w in emph)
    if variant == "B":
        y += red * 0.55
        layers += red_word(540, y, 5, etxt, emph[0][2] - at, end, size=int(red * 1.45))
        y += red * 0.8
        if post:
            layers += sans_word(960, y, 6, " ".join(w[1] for w in post), post[0][2] - at, end, size=small)
    else:
        y += big * 0.42
        bl, bsize = big_word(540, y, 5, etxt, emph[0][2] - at, end, size=big)
        layers += bl
        y += bsize * 0.5
        if post:
            layers += red_word(960, y, 6, post[0][1], post[0][2] - at, end, size=red)
            if len(post) > 1:
                y += red * 0.55
                layers += sans_word(960, y, 6, " ".join(w[1] for w in post[1:]), post[1][2] - at, end, size=small)
    return at, end, layers


def card_window(lang, C, role):
    if role == "editing":
        return (C["editing"].start, C["views"].end_speech + 0.05) if lang == "en" else (C["problem"].start, C["editing"].end)
    return C[role].start, C[role].end


def cards(lang, C):
    os.makedirs(os.path.join(WS, "broll", "gen"), exist_ok=True)
    out = {}
    spec = {"editing": ("color-grading.mp4", 8.0), "twosec": ("eye-closeup.mp4", 2.5)}
    for role, (src, s0) in spec.items():
        a0, a1 = card_window(lang, C, role)
        dur = a1 - a0 + 0.3
        f = os.path.join(WS, "broll", "gen", f"s2-{lang}-{role}.mp4")
        if not os.path.exists(f):
            card_clip(os.path.join(WS, "broll", src), s0, dur, f, canvas=(8, 6, 6), box=(150, 600, 780, 1000),
                      radius=44, scale_from=0.86, scale_time=0.5, inner_zoom=(1.0, 1.1),
                      vf_extra="eq=contrast=1.05:saturation=0.9,colorbalance=rs=0.05:bs=-0.04")
        out[role] = os.path.relpath(f, os.path.join(WS, "broll"))
    return out


def build(lang):
    p = Plan(lang, f"style2-editorial-{lang}",
             look={"filter": "eq=contrast=1.06:saturation=0.9:brightness=-0.02,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rh=0.03:bh=-0.04,vignette=PI/4.5,noise=alls=6:allf=t"},
             music="m-editorial.wav", music_vol=0.22)
    C = {c_.role: c_ for c_ in chunks(p.w, lang)}
    D = p.dur
    top = HEAD[lang]["top"] * 1920
    upper = 120 if lang == "en" else 170
    lower = upper
    card = cards(lang, C)

    p.ev(type="background", at=0, dur=D, bg="bg/warm-room.png")
    p.ev(type="zoom", at=0, dur=2.4, style="push", amount=1.07)
    p.ev(type="zoom", at=round(C["same"].start, 3), dur=2.0, style="push", amount=1.08)
    p.ev(type="zoom", at=round(C["show"].start, 3), dur=D - C["show"].start, style="slow", amount=1.05)

    variants = {"hook": ("A", upper), "hook2": ("B", upper), "reels": ("A", upper), "content": ("A", lower),
                "problem": ("B", upper), "editing": ("B", 150), "views": ("A", 150 if lang == "en" else upper), "decide": ("B", lower),
                "twosec": ("A", 150), "stay": ("A", upper), "scroll": ("B", 150), "same": ("A", upper),
                "edited": ("B", lower), "tenx": ("A", upper), "show": ("A", upper)}
    for role, ch in C.items():
        var, y = variants.get(role, ("A", upper))
        big = 300 if role == "tenx" else 215
        at, end, layers = compose(ch, y, var, big=big)
        p.ass(at, end, layers)
        p.sfx("ve-whoosh-air", ch.start, 0.14)

    # b-roll cards + full-screen cut-away, with warm light leaks on the cuts
    for role in ("editing", "twosec"):
        a0, a1 = card_window(lang, C, role)
        p.ev(type="broll", at=round(a0 - 0.05, 3), until=round(a1, 3), file=card[role])
        p.ev(type="light_leak", at=round(a0 - 0.2, 3), dur=0.7, color="warm", side="left", intensity=1.1)
        p.ev(type="light_leak", at=round(a1 - 0.25, 3), dur=0.6, color="warm", side="right", intensity=0.8)
        p.sfx("ve-film", a0 - 0.05, 0.3)
    ch = C["scroll"]
    p.ev(type="broll", at=round(ch.start - 0.05, 3), until=round(ch.end, 3), file="woman-phone-vertical.mp4", **{"from": 1.5})
    p.ev(type="filter", at=round(ch.start - 0.05, 3), until=round(ch.end, 3),
         filter="eq=brightness=-0.06:saturation=0.85,colorbalance=rs=0.05:bs=-0.05")
    p.sfx("ve-scroll", ch.words[0][2], 0.4)
    p.ev(type="light_leak", at=round(C["same"].start - 0.25, 3), dur=0.9, color="gold", side="right", intensity=1.3)
    p.ev(type="flash", at=round(C["same"].start - 0.05, 3), dur=0.25, color="#FFE9D0")
    p.sfx("ve-reverse", C["same"].start, 0.3)
    p.sfx("ve-thump", C["same"].start, 0.4)
    v = C["views"]
    p.sfx("ve-hit", [w[2] for w in v.words if w[0] in v.emph][0], 0.42)
    t10 = C["tenx"]
    p.sfx("ve-hit", [w[2] for w in t10.words if w[0] in t10.emph][0], 0.4)
    p.sfx("ve-shimmer", [w[2] for w in t10.words if w[0] in t10.emph][0] + 0.1, 0.25)

    # end lockup: "Vibe" grotesk + "Editor" red italic writing on
    t_l = max(D - 1.0, C["show"].words[-1][2] + 0.05)
    floor = "{\\an7\\pos(0,0)\\blur60\\alpha&HFF&\\t(0,300,\\alpha&H40&)\\p1}m -100 1330 l 1180 1330 1180 2050 -100 2050"
    lay = [{"start": 0, "end": round(D - t_l, 3), "layer": 5, "shape": True, "color": "#000000", "text": floor}]
    bl, _ = big_word(540, 1470, 5, "Vibe", 0.0, D - t_l, size=190)
    lay += bl
    lay += red_word(700, 1580, 5, "Editor", 0.15, D - t_l, size=170)
    lay += sans_word(540, 1690, 5, "edit like this in minutes", 0.3, D - t_l, size=48, color="#F2E8DE", fsp=1)
    p.ass(t_l, D - t_l, lay)
    p.sfx("ve-shimmer", t_l + 0.15, 0.3)
    return p


if __name__ == "__main__":
    import sys
    for lang in sys.argv[1:] or ["en", "hi"]:
        print(build(lang).save())
