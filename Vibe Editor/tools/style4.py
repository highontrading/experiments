"""Style 4 — neon lime (reference: design-tool selection box with guides around captions, glowing italic serif
emphasis, glowing counters, black space scenes with lime glow + metal gears, motion-blur streak text)."""
import math
import random

from velib import Plan, L, S, tw, ms, c, rect, rrect, circle, ring
from chunks import chunks

SMALL = "ve-inter-regular"
SERIF = "instrument-serif-italic"
LIME = "#C9FF2E"
LIME_CORE = "#ECFF9A"
REFRAME = {"en": {"mode": "crop", "x": 0.5, "y": 0.4, "zoom": 1.25}, "hi": {"mode": "crop", "x": 0.52, "y": 0.62, "zoom": 1.45}}
CAP_Y = {"en": 1180, "hi": 1230}


def glow_text(x, y, an, text, t0, t1, size=150, font=SERIF, intro="pop", core=LIME_CORE, glow=LIME, fsp=0, extra=""):
    T = ms(t1 - t0)
    if intro == "pop":
        a = "\\fscx80\\fscy80\\t(0,200,\\fscx104\\fscy104)\\t(200,320,\\fscx100\\fscy100)"
    elif intro == "blur":
        a = "\\fscx118\\fscy118\\t(0,260,\\fscx100\\fscy100)"
    else:
        a = ""
    base = f"\\an{an}\\pos({x:.0f},{y:.0f})\\fsp{fsp}{a}{extra}"
    fi = (lambda v: f"\\alpha&HFF&\\t(0,150,\\alpha{v})") if intro != "none" else (lambda v: f"\\alpha{v}")
    out = f"\\t({T - 160},{T},\\alpha&HFF&)" if intro != "none" or T > 400 else ""
    return [
        L(t0, t1, "{" + base + "\\blur24\\bord12\\3c&H000000&" + fi("&H88&") + out + "}" + text,
          font=font, size=size, color="#000000", layer=6),
        L(t0, t1, "{" + base + f"\\blur26\\bord10\\3c{c(glow)}" + fi("&H58&") + out + "}" + text,
          font=font, size=size, color=glow, layer=7),
        L(t0, t1, "{" + base + f"\\blur3\\bord2\\3c{c(glow)}" + fi("&H00&") + out + "}" + text,
          font=font, size=size, color=core, layer=8),
    ]


def small_text(x, y, an, text, t0, t1, size=58, color="#FFFFFF"):
    T = ms(t1 - t0)
    mv = f"\\an{an}\\move({x:.0f},{y + 10:.0f},{x:.0f},{y:.0f},0,240)"
    return [
        L(t0, t1, "{" + mv + f"\\blur10\\bord4\\3c&H000000&\\alpha&HFF&\\t(0,200,\\alpha&H68&)\\t({T - 150},{T},\\alpha&HFF&)}}" + text,
          font=SMALL, size=size, color="#000000", layer=7),
        L(t0, t1, "{" + mv + f"\\blur4\\alpha&HFF&\\t(0,200,\\blur0\\alpha&H00&)\\t({T - 150},{T},\\alpha&HFF&)}}" + text,
          font=SMALL, size=size, color=color, layer=8),
    ]


def selection_box(x0, y0, x1, y1, dur, color=LIME, guides=True):
    """Figma-like selection: guides across the frame, box outline, square handles; draws on quickly."""
    T = ms(dur)
    fade = f"\\alpha&HFF&\\t(0,160,\\alpha&H00&)\\t({T - 160},{T},\\alpha&HFF&)"
    lays = []
    t = 3
    if guides:
        gfade = f"\\alpha&HFF&\\t(0,200,\\alpha&H70&)\\t({T - 160},{T},\\alpha&HFF&)"
        for yy in (y0, y1):
            lays.append(S(0, dur, "{\\an7\\pos(0,0)" + gfade + "\\p1}" + rect(0, yy - 1, 1080, 2), color, layer=4))
        for xx in (x0, x1):
            lays.append(S(0, dur, "{\\an7\\pos(0,0)" + gfade + "\\p1}" + rect(xx - 1, 0, 2, 1920), color, layer=4))
    lays.append(S(0, dur, f"{{\\an7\\pos(0,0)\\alpha&HFF&\\t(0,200,\\alpha&H78&)\\t({T - 160},{T},\\alpha&HFF&)\\p1}}" +
                  rect(x0, y0, x1 - x0, y1 - y0), "#000000", layer=4))
    from velib import outline_rect
    lays.append(S(0, dur, "{\\an7\\pos(0,0)" + fade + "\\p1}" + outline_rect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2, t), color, layer=5))
    hs = 9
    for (hx, hy) in ((x0, y0), ((x0 + x1) / 2, y0), (x1, y0), (x0, y1), ((x0 + x1) / 2, y1), (x1, y1)):
        lays.append(S(0, dur, "{\\an7\\pos(0,0)" + fade + "\\p1}" + circle(hx, hy, hs), "#FFFFFF", layer=6))
    return lays


def cap_chunk(ch, y, lead=0.04, box=True):
    """Small sans words + emphasis words in glowing italic serif, inside an optional selection box."""
    at = max(0.0, ch.start - lead)
    end = ch.end - at
    words = ch.words
    emph = [w for w in words if w[0] in ch.emph]
    pre = [w for w in words if w[0] < emph[0][0]]
    post = [w for w in words if w[0] > emph[-1][0]]
    etxt = " ".join(w[1] for w in emph)
    esize = 165
    if tw(etxt, SERIF, esize) > 860:
        esize = int(esize * 860 / tw(etxt, SERIF, esize))
    ew = tw(etxt, SERIF, esize)
    lays = []
    y_e = y
    if pre:
        ptxt = " ".join(w[1] for w in pre)
        lays += small_text(540, y - esize * 0.62, 5, ptxt, pre[0][2] - at, end)
    lays += glow_text(540, y_e, 5, etxt, emph[0][2] - at, end, size=esize)
    if post:
        ptxt = " ".join(w[1] for w in post)
        lays += small_text(540, y + esize * 0.55, 5, ptxt, post[0][2] - at, end, size=52)
    if box:
        bw = max(ew, tw(" ".join(w[1] for w in pre), SMALL, 58) if pre else 0) + 120
        x0, x1 = 540 - bw / 2, 540 + bw / 2
        y0, y1 = y - esize * 0.62 - 50, y + esize * 0.55 + 46
        lays = selection_box(x0, y0, x1, y1, end) + lays
    return at, end, lays


# -------------------------------------------------------------- full-screen scenes
def stars(n=70, seed=1):
    rnd = random.Random(seed)
    parts = []
    for _ in range(n):
        x, y, r = rnd.uniform(0, 1080), rnd.uniform(0, 1920), rnd.choice([1.2, 1.6, 2.2, 3.0])
        parts.append(circle(x, y, r))
    return " ".join(parts)


def gear_path(cx, cy, r_out=110, r_in=88, teeth=12, hole=34):
    pts = []
    for k in range(teeth * 4):
        ang = 2 * math.pi * k / (teeth * 4)
        rr = r_out if (k % 4) in (1, 2) else r_in
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    d = "m " + " l ".join(f"{x:.1f} {y:.1f}" for x, y in pts[:1]) + " l " + " ".join(f"{x:.1f} {y:.1f}" for x, y in pts[1:])
    k = 0.5523 * hole
    inner = (f" m {cx:.1f} {cy - hole:.1f} b {cx - k:.1f} {cy - hole:.1f} {cx - hole:.1f} {cy - k:.1f} {cx - hole:.1f} {cy:.1f} "
             f"b {cx - hole:.1f} {cy + k:.1f} {cx - k:.1f} {cy + hole:.1f} {cx:.1f} {cy + hole:.1f} "
             f"b {cx + k:.1f} {cy + hole:.1f} {cx + hole:.1f} {cy + k:.1f} {cx + hole:.1f} {cy:.1f} "
             f"b {cx + hole:.1f} {cy - k:.1f} {cx + k:.1f} {cy - hole:.1f} {cx:.1f} {cy - hole:.1f}")
    return d + inner


def gear(x, y, scale, dur, spin=90, r=110):
    """Metal gear spinning about its centre (drawn in a 2r box so \\org = centre)."""
    T = ms(dur)
    path = gear_path(r, r, r_out=r, r_in=int(r * 0.8), hole=int(r * 0.32))
    base = f"\\an7\\pos({x - r * scale:.0f},{y - r * scale:.0f})\\org({x:.0f},{y:.0f})\\fscx{scale * 100:.0f}\\fscy{scale * 100:.0f}\\frz0\\t(0,{T},\\frz{-spin})"
    return [
        S(0, dur, "{" + base + "\\blur18\\alpha&H60&\\p1}" + path, "#000000", layer=3),
        S(0, dur, "{" + base + "\\bord3\\3c&HE8E4E0&\\blur1\\p1}" + path, "#8E9296", layer=4),
        S(0, dur, "{" + base + "\\blur10\\alpha&H90&\\p1}" + gear_path(r, r - 18, r_out=int(r * 0.7), r_in=int(r * 0.55), hole=int(r * 0.32)), "#FFFFFF", layer=5),
    ]


def space_scene(dur, glow_side="bottom", gears=True, seed=1):
    T = ms(dur)
    fin = f"\\alpha&HFF&\\t(0,120,\\alpha&H00&)\\t({T - 120},{T},\\alpha&HFF&)"
    lays = [S(0, dur, "{\\an7\\pos(0,0)" + fin + "\\p1}" + rect(-10, -10, 1100, 1940), "#040503", layer=2)]
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\alpha&HFF&\\t(0,150,\\alpha&H50&)\\p1}" + stars(80, seed), "#FFFFFF", layer=3))
    gy = 1900 if glow_side == "bottom" else 0
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur120\\alpha&HFF&\\t(0,300,\\alpha&H10&)\\p1}" + circle(760, gy, 560), "#9BE81A", layer=3))
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\blur90\\alpha&HFF&\\t(0,300,\\alpha&H30&)\\p1}" + circle(860, gy + 60, 330), "#E9FF8A", layer=3))
    if gears:
        lays += gear(120, 140, 1.0, dur, spin=120)
        lays += gear(950, 1640, 1.25, dur, spin=-90)
        lays += gear(900, 520, 0.45, dur, spin=200)
        lays += gear(150, 760, 0.38, dur, spin=-160)
    return lays


def build(lang):
    p = Plan(lang, f"style4-neon-{lang}", look={"filter": "eq=contrast=1.07:saturation=1.04:brightness=-0.01,colorbalance=gs=0.01:bs=-0.01,vignette=PI/5"},
             music="m-neon.wav", music_vol=0.22, reframe=REFRAME[lang])
    C = {c_.role: c_ for c_ in chunks(p.w, lang)}
    D = p.dur
    cy = CAP_Y[lang]
    scene_roles = {"hook2", "scroll"}
    C["show"].end = max(D - 1.05, C["show"].words[-1][2] + 0.05)
    special = {"twosec", "tenx", "reels"}
    for k, (role, ch) in enumerate(C.items()):
        if role in scene_roles or role in special:
            continue
        at, end, lays = cap_chunk(ch, cy, box=(k % 2 == 0))
        p.ass(at, end, lays)
        p.sfx("ve-swish", ch.start, 0.13)

    p.ev(type="zoom", at=0, dur=0.6, style="punch", amount=1.12)
    p.sfx("ve-whoosh-air", 0.0, 0.3)

    # ---- scene: "nobody tells you" / "jo koi nahi batata" on black space with gears
    h2 = C["hook2"]
    at = h2.start - 0.06
    dur = h2.end - at
    lays = space_scene(dur, seed=3)
    emph = [w for w in h2.words if w[0] in h2.emph]
    pre = [w for w in h2.words if w[0] < emph[0][0]]
    post = [w for w in h2.words if w[0] > emph[-1][0]]
    lays += glow_text(540, 900, 5, " ".join(w[1] for w in emph), emph[0][2] - at, dur, size=210, intro="blur")
    if pre:
        lays += small_text(540, 770, 5, " ".join(w[1] for w in pre), pre[0][2] - at, dur, size=64)
    if post:
        lays += small_text(560, 1035, 5, " ".join(w[1] for w in post), post[0][2] - at, dur, size=64)
    p.ass(at, dur, lays)
    p.sfx("ve-whoosh-deep", at + 0.05, 0.38)
    p.sfx("ve-neon", emph[0][2], 0.3)

    # ---- scene (EN only): white "Reels" type card with a lime swoosh
    if "reels" in C:
        r = C["reels"]
        at = r.start - 0.05
        dur = r.end - at
        T = ms(dur)
        lays = [S(0, dur, "{\\an7\\pos(0,0)\\p1}" + rect(-10, -10, 1100, 1940), "#F4F5F0", layer=2)]
        lays.append(L(0, dur, f"{{\\an5\\pos(540,820)\\fsp-6\\fscx112\\fscy112\\t(0,300,\\fscx100\\fscy100)\\blur8\\t(0,200,\\blur0)}}Reels",
                      font="ve-grotesk-black", size=330, color="#4A5A12", layer=5))
        lays.append(L(0.0, dur, "{\\an5\\pos(540,1010)\\alpha&HFF&\\t(80,260,\\alpha&H00&)}about", font=SMALL, size=64, color="#4A5A12", layer=5))
        sw = "m -80 1300 b 300 1180 700 1420 1160 1120"
        lays.append(S(0, dur, "{\\an7\\pos(0,0)\\bord5\\3c" + c(LIME) + "\\1a&HFF&\\blur1\\clip(0,0,0,1920)\\t(0,500,\\clip(0,0,1080,1920))\\p1}" + sw + " l 1160 1121 b 700 1421 300 1181 -80 1301", LIME, layer=6))
        lays.append(S(0, dur, "{\\an7\\pos(0,0)\\bord3\\3c&H222222&\\1a&HFF&\\blur1\\clip(0,0,0,1920)\\t(80,600,\\clip(0,0,1080,1920))\\p1}m -80 1360 b 260 1260 760 1480 1160 1200 l 1160 1201 b 760 1481 260 1261 -80 1361", "#222222", layer=6))
        p.ass(at, dur, lays)
        p.sfx("ve-whoosh-air", at + 0.05, 0.32)

    # ---- two seconds: eye icon + glowing count-up on the speaker
    ts = C["twosec"]
    at = ts.start - 0.04
    dur = ts.end - at
    lays = []
    ex, ey = 540, cy - 210
    eye = (f"m {ex - 90} {ey} b {ex - 50} {ey - 62} {ex + 50} {ey - 62} {ex + 90} {ey} b {ex + 50} {ey + 62} {ex - 50} {ey + 62} {ex - 90} {ey}")
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\fscy10\\t(0,200,\\fscy100)\\p1}" + eye, "#FFFFFF", layer=7))
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\p1}" + circle(ex, ey, 30), "#111111", layer=8))
    lays.append(S(0, dur, "{\\an7\\pos(0,0)\\p1}" + circle(ex + 10, ey - 10, 9), "#FFFFFF", layer=9))
    steps = 20
    t_c = 0.12
    for k in range(steps + 1):
        v = 2.0 * k / steps
        a0 = t_c + k * 0.03
        a1 = t_c + (k + 1) * 0.03 if k < steps else dur
        lays += glow_text(540, cy - 40, 5, f"{v:.1f}s", a0, a1, size=190, font="ve-inter-medium", intro="none")
    lab = " ".join(w[1] for w in ts.words)
    lays += small_text(540, cy + 90, 5, lab, 0.05, dur, size=56)
    p.ass(at, dur, lays)
    p.sfx("ve-tick", at + 0.15, 0.3)
    p.sfx("ve-ding", at + t_c + steps * 0.03, 0.22)

    # ---- scroll: black scene with a motion-blurred streak word
    sc = C["scroll"]
    at = sc.start - 0.05
    dur = sc.end - at
    T = ms(dur)
    lays = space_scene(dur, gears=False, seed=9)
    i_s = [w for w in sc.words if w[0] in sc.emph][0]
    t0 = i_s[2] - at
    for k, (dx, al) in enumerate(((-260, "&HC0&"), (-120, "&H90&"), (0, "&H00&"))):
        lays.append(L(t0, dur, f"{{\\an5\\fsp-4\\move({1500 + dx},960,{540 + dx // 6},960,0,260)\\blur{14 - k * 5}\\fscx{150 - k * 20}\\alpha{al}\\t(260,400,\\fscx100\\blur0)}}{i_s[1]}",
                      font="ve-grotesk-black", size=250, color=LIME_CORE if k == 2 else LIME, layer=6 + k))
    rest = [w for w in sc.words if w[0] != i_s[0]]
    if rest:
        lays += small_text(540, 1120, 5, " ".join(w[1] for w in rest), rest[0][2] - at, dur, size=60)
    p.ass(at, dur, lays)
    p.sfx("ve-whoosh-deep", at + 0.03, 0.35)
    p.sfx("ve-swish", at + t0 + 0.1, 0.35)

    # ---- "same video": lime light flash on the face
    sm = C["same"]
    p.ev(type="light_leak", at=round(sm.start - 0.25, 3), dur=0.9, color="#D8FF4A", side="top", intensity=1.3)
    p.ev(type="zoom", at=round(sm.start, 3), dur=1.3, style="push", amount=1.08)
    p.sfx("ve-reverse", sm.start, 0.3)

    # ---- 10x: glowing counter "1x → 10x" + "more views"
    t10 = C["tenx"]
    at = t10.start - 0.04
    dur = t10.end - at
    lays = []
    i10 = [w for w in t10.words if w[0] in t10.emph][0]
    t0 = i10[2] - at
    for n in range(1, 11):
        a0 = t0 + (n - 1) * 0.04
        a1 = t0 + n * 0.04 if n < 10 else dur
        lays += glow_text(540, cy - 30, 5, f"{n}x", a0, a1, size=260, font="ve-inter-medium", intro="none")
    lays += glow_text(540, cy + 150, 5, "Views+" if lang == "en" else "Views+", t0 + 0.4, dur, size=130)
    before = [w for w in t10.words if w[0] < i10[0]]
    if before:
        lays += small_text(540, cy - 200, 5, " ".join(w[1] for w in before), before[0][2] - at, dur, size=58)
    after = [w for w in t10.words if w[0] > i10[0]]
    if after:
        lays += small_text(540, cy + 270, 5, " ".join(w[1] for w in after), after[0][2] - at, dur, size=52)
    p.ass(at, dur, lays)
    p.ev(type="zoom", at=round(at + t0, 3), dur=0.5, style="punch", amount=1.1)
    p.sfx("ve-cash", at + t0, 0.35)
    p.sfx("ve-neon", at + t0 + 0.42, 0.25)

    # ---- end: space scene with the product name
    t_l = max(D - 1.05, C["show"].words[-1][2] + 0.05)
    dur = D - t_l
    lays = space_scene(dur, seed=5)
    lays += glow_text(540, 900, 5, "Vibe Editor", 0.1, dur, size=190, intro="blur")
    lays += small_text(540, 1040, 5, "edit like this, in minutes" if lang == "en" else "aise edit karo, minutes mein", 0.3, dur, size=56)
    p.ass(t_l, dur, lays)
    p.sfx("ve-whoosh-deep", t_l, 0.35)
    p.sfx("ve-shimmer", t_l + 0.15, 0.28)
    return p


if __name__ == "__main__":
    import sys
    for lang in sys.argv[1:] or ["en", "hi"]:
        print(build(lang).save())
