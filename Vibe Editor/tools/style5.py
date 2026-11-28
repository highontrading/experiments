"""Style 5 — documentary (reference: warm low-key interview grade, small condensed caps around a big glowing yellow
keyword, orange italic serif glow words, glowing white line icons, pale illustration slides with leaf shadows and
black silhouettes)."""
import math
import random

from velib import Plan, L, S, tw, ms, c, rect, rrect, circle, ring
from chunks import chunks

CAPS = "bebas"
BIG = "montserrat-black"
SERIF = "instrument-serif-italic"
YEL = "#EEFF3C"
ORANGE = "#FF6B2C"
CAP_Y = {"en": 1150, "hi": 1240}
SERIF_ROLES = {"hook2", "problem", "views", "scroll", "edited"}


def glow(x, y, an, text, t0, t1, font, size, color, glow_col=None, extra="", intro=True):
    T = ms(t1 - t0)
    g = glow_col or color
    a = "\\fscx70\\fscy70\\t(0,160,\\fscx106\\fscy106)\\t(160,260,\\fscx100\\fscy100)" if intro else ""
    base = f"\\an{an}\\pos({x:.0f},{y:.0f}){a}{extra}"
    fo = f"\\t({T - 150},{T},\\alpha&HFF&)"
    return [
        L(t0, t1, "{" + base + "\\blur16\\bord6\\3c&H000000&\\alpha&HFF&\\t(0,120,\\alpha&H70&)" + fo + "}" + text, font=font, size=size, color="#000000", layer=6),
        L(t0, t1, "{" + base + f"\\blur22\\bord9\\3c{c(g)}\\alpha&HFF&\\t(0,120,\\alpha&H60&)" + fo + "}" + text, font=font, size=size, color=g, layer=7),
        L(t0, t1, "{" + base + "\\alpha&HFF&\\t(0,100,\\alpha&H00&)" + fo + "}" + text, font=font, size=size, color=color, layer=8),
    ]


def caps(x, y, an, text, t0, t1, size=62, color="#FFFFFF"):
    T = ms(t1 - t0)
    mv = f"\\an{an}\\fsp1\\move({x:.0f},{y + 8:.0f},{x:.0f},{y:.0f},0,200)"
    return [
        L(t0, t1, "{" + mv + f"\\blur10\\bord4\\3c&H000000&\\alpha&HFF&\\t(0,160,\\alpha&H60&)\\t({T - 150},{T},\\alpha&HFF&)}}" + text.upper(), font=CAPS, size=size, color="#000000", layer=6),
        L(t0, t1, "{" + mv + f"\\alpha&HFF&\\t(0,160,\\alpha&H00&)\\t({T - 150},{T},\\alpha&HFF&)}}" + text.upper(), font=CAPS, size=size, color=color, layer=8),
    ]


def cap_chunk(ch, y, serif=False, lead=0.04):
    at = max(0.0, ch.start - lead)
    end = ch.end - at
    emph = [w for w in ch.words if w[0] in ch.emph]
    pre = [w for w in ch.words if w[0] < emph[0][0]]
    post = [w for w in ch.words if w[0] > emph[-1][0]]
    etxt = " ".join(w[1] for w in emph)
    lays = []
    if serif:
        size = 170
        if tw(etxt, SERIF, size) > 900:
            size = int(size * 900 / tw(etxt, SERIF, size))
        lays += glow(540, y, 5, etxt.lower(), emph[0][2] - at, end, SERIF, size, "#FFB089", ORANGE)
        ew = tw(etxt.lower(), SERIF, size)
    else:
        size = 128
        if tw(etxt.upper(), BIG, size) > 900:
            size = int(size * 900 / tw(etxt.upper(), BIG, size))
        lays += glow(540, y, 5, etxt.upper(), emph[0][2] - at, end, BIG, size, YEL, "#C8E000")
        ew = tw(etxt.upper(), BIG, size)
    if pre:
        lays += caps(540 - ew / 2 + 6, y - size * 0.62, 4, " ".join(w[1] for w in pre), pre[0][2] - at, end)
    if post:
        lays += caps(540 + ew / 2 - 6, y + size * 0.6, 6, " ".join(w[1] for w in post), post[0][2] - at, end, size=56)
    return at, end, lays


# ------------------------------------------------------------------ glowing line icons (draw-on with a clip wipe)
def icon(kind, x, y, t0, t1, s=1.0, color="#FFFFFF"):
    T = ms(t1 - t0)
    S_ = 180 * s
    paths = {
        "play": [rrect(0, 20, 180, 140, 26), "m 70 55 l 125 90 70 125 l 70 55"],
        "watch": [ring(90, 100, 72, 0.1), "m 78 10 l 102 10", "m 90 10 l 90 28", "m 90 100 l 90 52", "m 90 100 l 122 118"],
        "phone": [rrect(40, 0, 100, 180, 18), "m 62 40 l 118 40", "m 62 64 l 118 64", "m 62 88 l 104 88", "m 62 112 l 118 112", "m 78 160 l 102 160"],
        "chart": ["m 15 170 l 15 15", "m 15 170 l 175 170", "m 30 145 l 70 110 105 125 160 45", "m 132 45 l 160 45 160 73"],
        "scissors": [ring(45, 140, 28, 0.1), ring(135, 140, 28, 0.1), "m 62 118 l 150 10", "m 118 118 l 30 10"],
        "eye": ["m 0 90 b 40 30 140 30 180 90 b 140 150 40 150 0 90", ring(90, 90, 30, 0.1)],
    }
    lays = []
    x0, y0 = x - S_ / 2, y - S_ / 2
    clip0 = f"\\clip({x0 - 20:.0f},{y0 - 20:.0f},{x0 - 19:.0f},{y0 + S_ + 20:.0f})"
    clip1 = f"\\clip({x0 - 20:.0f},{y0 - 20:.0f},{x0 + S_ + 20:.0f},{y0 + S_ + 20:.0f})"
    for k, pth in enumerate(paths[kind]):
        base = (f"\\an7\\pos({x0:.0f},{y0:.0f})\\fscx{s * 100:.0f}\\fscy{s * 100:.0f}\\1a&HFF&"
                f"{clip0}\\t(0,520,{clip1})\\t({T - 150},{T},\\alpha&HFF&)")
        lays.append(S(t0, t1, "{" + base + f"\\bord11\\blur14\\3c{c(color)}\\3a&H70&\\p1}}" + pth, color, layer=6))
        lays.append(S(t0, t1, "{" + base + f"\\bord5\\blur0.6\\3c{c(color)}\\p1}}" + pth, color, layer=7))
    return lays


# ------------------------------------------------------------------ illustration slides
def palm_frond(cx, cy, length, angle, leaves=11, width=26):
    """A stylised palm frond: thin elongated leaves along a curved stem (filled path)."""
    parts = []
    for k in range(leaves):
        t = (k + 1) / (leaves + 1)
        bx = cx + math.cos(angle) * length * t
        by = cy + math.sin(angle) * length * t
        for side in (-1, 1):
            la = angle + side * (0.9 - 0.4 * t)
            ll = length * (0.42 - 0.25 * t)
            tx, ty = bx + math.cos(la) * ll, by + math.sin(la) * ll
            nx, ny = -math.sin(la) * width * (1 - t * 0.5) / 2, math.cos(la) * width * (1 - t * 0.5) / 2
            mx, my = (bx + tx) / 2, (by + ty) / 2
            parts.append(f"m {bx:.0f} {by:.0f} b {mx + nx:.0f} {my + ny:.0f} {mx + nx:.0f} {my + ny:.0f} {tx:.0f} {ty:.0f} "
                         f"b {mx - nx:.0f} {my - ny:.0f} {mx - nx:.0f} {my - ny:.0f} {bx:.0f} {by:.0f}")
    return " ".join(parts)


def slide_bg(dur, kind="leaf"):
    T = ms(dur)
    fin = f"\\alpha&HFF&\\t(0,140,\\alpha&H00&)\\t({T - 140},{T},\\alpha&HFF&)"
    lays = []
    if kind == "leaf":
        lays.append(S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + rect(-10, -10, 1100, 1940), "#DCE5E1", layer=2))
        lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur90" + fin.replace("&H00&", "&H30&") + "\\p1}" + circle(540, 900, 520), "#F2F6F4", layer=2))
        for (cx, cy, ln, ang) in ((-60, -40, 640, 0.75), (40, -80, 520, 1.15), (1140, 1990, 660, -2.4), (1100, 2060, 520, -2.0)):
            lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur4" + fin.replace("&H00&", "&H60&") + "\\p1}" + palm_frond(cx, cy, ln, ang), "#8E9A95", layer=3))
    else:
        lays.append(S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + rect(-10, -10, 1100, 1940), "#E9E9E7", layer=2))
        lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur80" + fin.replace("&H00&", "&H20&") + "\\p1}" + circle(540, 900, 560), "#FAFAF9", layer=2))
        for (bx, by, r) in ((1060, 120, 150), (980, -20, 110), (20, 1840, 170), (140, 1960, 120)):
            lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur18" + fin.replace("&H00&", "&H50&") + "\\p1}" + circle(bx + 10, by + 22, r), "#000000", layer=3))
            lays.append(S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + circle(bx, by, r), "#1A1A1A", layer=4))
    return lays


def thinker(x, y, dur, s=1.0):
    """Black silhouette of a standing person with a hand on the chin."""
    T = ms(dur)
    fin = f"\\alpha&HFF&\\t(80,260,\\alpha&H00&)\\t({T - 140},{T},\\alpha&HFF&)"
    k = s
    parts = [circle(x, y - 330 * k, 52 * k),
             rrect(x - 78 * k, y - 262 * k, 156 * k, 300 * k, 46 * k),
             rrect(x - 66 * k, y + 20 * k, 58 * k, 330 * k, 22 * k),
             rrect(x + 8 * k, y + 20 * k, 58 * k, 330 * k, 22 * k),
             f"m {x + 40 * k:.0f} {y - 200 * k:.0f} l {x + 70 * k:.0f} {y - 225 * k:.0f} {x + 22 * k:.0f} {y - 300 * k:.0f} {x - 4 * k:.0f} {y - 286 * k:.0f}"]
    lays = [S(0, dur, "{\\an7\\pos(0,0)\\blur14" + fin.replace("&H00&", "&H90&") + "\\p1}" + " ".join(p.replace(" ", " ") for p in parts), "#000000", layer=4),
            S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + " ".join(parts), "#111111", layer=5)]
    for j, (qx, qy, rot) in enumerate(((x + 46, y - 470, 10), (x + 96, y - 500, -8), (x + 146, y - 480, 14))):
        lays.append(L(0.25 + 0.12 * j, dur, f"{{\\an5\\pos({qx * 1:.0f},{qy * 1:.0f})\\frz{rot}\\fscx40\\fscy40\\t(0,160,\\fscx100\\fscy100)\\t({T - 140 - int((0.25 + 0.12 * j) * 1000)},{T - int((0.25 + 0.12 * j) * 1000)},\\alpha&HFF&)}}?",
                      font=CAPS, size=110, color="#111111", layer=6))
    return lays


def phone_sil(x, y, dur):
    """Black phone silhouette with feed rows scrolling up inside."""
    T = ms(dur)
    fin = f"\\alpha&HFF&\\t(60,240,\\alpha&H00&)\\t({T - 140},{T},\\alpha&HFF&)"
    w, h = 360, 700
    lays = [S(0, dur, "{\\an7\\pos(0,0)\\blur20" + fin.replace("&H00&", "&H90&") + "\\p1}" + rrect(x - w / 2 + 14, y - h / 2 + 24, w, h, 56), "#000000", layer=4),
            S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + rrect(x - w / 2, y - h / 2, w, h, 56), "#111111", layer=5)]
    clip = f"\\clip({x - w / 2 + 22:.0f},{y - h / 2 + 60:.0f},{x + w / 2 - 22:.0f},{y + h / 2 - 50:.0f})"
    rows = " ".join(rrect(x - w / 2 + 34, y - h / 2 + 80 + k * 150, w - 68, 120, 16) for k in range(10))
    lays.append(S(0, dur, "{\\an7\\move(0,0,0,-900,0," + str(T) + ")" + clip + fin.replace("&H00&", "&H00&") + "\\p1}" + rows, "#E9E9E7", layer=6))
    return lays


def build(lang):
    p = Plan(lang, f"style5-docu-{lang}",
             look={"filter": "curves=all='0/0 0.25/0.15 0.5/0.38 0.75/0.66 1/0.93',colorbalance=rs=0.07:gs=0.02:bs=-0.07:rh=0.04:bh=-0.05,eq=saturation=0.9,vignette=PI/3.4"},
             music="m-docu.wav", music_vol=0.2)
    C = {c_.role: c_ for c_ in chunks(p.w, lang)}
    D = p.dur
    y = CAP_Y[lang]
    t_end = max(D - 1.05, C["show"].words[-1][2] + 0.05)
    C["show"].end = t_end
    slides = {"hook2": "leaf", "scroll": "blob"}

    icons = {"content": "play", "editing": "scissors", "twosec": "watch", "decide": "eye", "tenx": "chart",
             "same": "play"}
    for role, ch in C.items():
        if role in slides:
            continue
        at, end, lays = cap_chunk(ch, y, serif=role in SERIF_ROLES)
        if role in icons:
            lays += icon(icons[role], 540, y - 300, 0.05, end, s=0.95)
            p.sfx("ve-pen", at + 0.08, 0.22)
        p.ass(at, end, lays)
        p.sfx("ve-click", ch.start, 0.18)

    p.ev(type="zoom", at=0, dur=2.0, style="push", amount=1.08)
    p.sfx("ve-whoosh-air", 0.0, 0.25)

    # ---- slide 1: thinker silhouette on a pale leafy background
    h2 = C["hook2"]
    at = h2.start - 0.06
    dur = h2.end - at
    lays = slide_bg(dur, "leaf") + thinker(540, 980, dur, 1.0)
    emph = [w for w in h2.words if w[0] in h2.emph]
    pre = [w for w in h2.words if w[0] < emph[0][0]]
    post = [w for w in h2.words if w[0] > emph[-1][0]]
    lays += glow(540, 1470, 5, " ".join(w[1] for w in emph).lower(), emph[0][2] - at, dur, SERIF, 170, ORANGE, "#FF8A50")
    if pre:
        lays += caps(330, 1370, 4, " ".join(w[1] for w in pre), pre[0][2] - at, dur, color="#222222")
    if post:
        lays += caps(760, 1570, 6, " ".join(w[1] for w in post), post[0][2] - at, dur, color="#222222", size=58)
    p.ass(at, dur, lays)
    p.sfx("ve-whoosh-deep", at + 0.03, 0.34)
    p.sfx("ve-pop", at + 0.3, 0.2)

    # ---- slide 2: phone silhouette with a scrolling feed
    sc = C["scroll"]
    at = sc.start - 0.06
    dur = sc.end - at
    lays = slide_bg(dur, "blob") + phone_sil(540, 820, dur)
    i_s = [w for w in sc.words if w[0] in sc.emph][0]
    rest = [w for w in sc.words if w[0] != i_s[0]]
    lays.append(L(i_s[2] - at, dur, f"{{\\an5\\pos(540,1340)\\fscx70\\fscy70\\t(0,160,\\fscx104\\fscy104)\\t(160,260,\\fscx100\\fscy100)}}{i_s[1].upper()}",
                  font=BIG, size=170, color="#111111", layer=7))
    pre = [w for w in rest if w[0] < i_s[0]]
    post = [w for w in rest if w[0] > i_s[0]]
    if pre:
        lays += caps(540, 1225, 5, " ".join(w[1] for w in pre), pre[0][2] - at, dur, color="#333333", size=58)
    if post:
        lays += caps(540, 1460, 5, " ".join(w[1] for w in post), post[0][2] - at, dur, color="#333333", size=58)
    p.ass(at, dur, lays)
    p.sfx("ve-whoosh-deep", at + 0.03, 0.34)
    p.sfx("ve-scroll", at + 0.25, 0.4)

    # ---- moments
    v = C["views"]
    p.sfx("ve-hit", [w[2] for w in v.words if w[0] in v.emph][0], 0.38)
    p.ev(type="zoom", at=round(C["twosec"].start, 3), dur=1.2, style="push", amount=1.08)
    p.sfx("ve-tick", C["twosec"].start + 0.2, 0.3)
    p.sfx("ve-tick", C["twosec"].start + 0.55, 0.3)
    p.ev(type="light_leak", at=round(C["same"].start - 0.25, 3), dur=0.8, color="warm", side="left", intensity=1.0)
    p.sfx("ve-film", C["same"].start - 0.1, 0.25)
    t10 = C["tenx"]
    p.ev(type="zoom", at=round(t10.start, 3), dur=1.2, style="push", amount=1.1)
    p.sfx("ve-thump", [w[2] for w in t10.words if w[0] in t10.emph][0], 0.4)

    # ---- end slide
    dur = D - t_end
    lays = slide_bg(dur, "blob")
    lays.append(S(0, dur, "{\\an5\\pos(540,760)\\fscx60\\fscy60\\t(0,200,\\fscx100\\fscy100)\\p1}" + circle(110, 110, 110), "#111111", layer=6))
    lays.append(S(0, dur, "{\\an5\\pos(552,760)\\fscx60\\fscy60\\t(0,200,\\fscx100\\fscy100)\\p1}m 0 0 l 80 50 0 100", "#E9E9E7", layer=7))
    lays.append(L(0.1, dur, "{\\an5\\pos(540,1000)\\fscx80\\fscy80\\t(0,220,\\fscx100\\fscy100)}VIBE EDITOR", font=BIG, size=120, color="#111111", layer=7))
    lays += caps(540, 1100, 5, "edit like a documentary. in minutes." if lang == "en" else "documentary jaisa edit. minutes mein.", 0.3, dur, color="#333333", size=52)
    p.ass(t_end, dur, lays)
    p.sfx("ve-whoosh-deep", t_end, 0.32)
    p.sfx("ve-shimmer", t_end + 0.15, 0.25)
    return p


if __name__ == "__main__":
    import sys
    for lang in sys.argv[1:] or ["en", "hi"]:
        print(build(lang).save())
