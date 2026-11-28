"""Style 3 — before/after split (reference: textured light canvas, AFTER card on top, raw BEFORE card below,
condensed white caps + small yellow italic serif, money-badge style graphics, list cards, rotating ring text)."""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from velib import Plan, L, S, tw, ms, c, rrect, circle, ring, WS
from chunks import chunks

LIBF = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/library/fonts/"
BIGF = "anton"
SMALLF = "ve-playfair-italic"
YEL = "#F6C945"
REFRAME = {"en": {"mode": "crop", "x": 0.5, "y": 0.205}, "hi": {"mode": "crop", "x": 0.5, "y": 0.38}}
FACE_Y = {"en": 445, "hi": 345}
CW, CH = 1920, 1080


# ------------------------------------------------------------------ captions in the AFTER card (16:9 space)
def cap_block(ch, y_big=800, lead=0.04):
    at = max(0.0, ch.start - lead)
    end = ch.end - at
    T = ms(end)
    emph = [w for w in ch.words if w[0] in ch.emph]
    rest = [w for w in ch.words if w[0] not in ch.emph]
    layers = []
    big = " ".join(w[1].upper() for w in emph)
    size = 190
    if tw(big, BIGF, size) > 1500:
        size = int(size * 1500 / tw(big, BIGF, size))
    t0 = emph[0][2] - at
    base = f"\\an5\\pos(960,{y_big})\\fscx70\\fscy70\\t({ms(t0)},{ms(t0) + 140},\\fscx108\\fscy108)\\t({ms(t0) + 140},{ms(t0) + 240},\\fscx100\\fscy100)"
    layers.append(L(0, end, "{" + base + f"\\blur18\\bord8\\3c&H000000&\\alpha&HFF&\\t({ms(t0)},{ms(t0) + 120},\\alpha&H70&)\\t({T - 120},{T},\\alpha&HFF&)}}" + big,
                    font=BIGF, size=size, color="#000000", layer=7))
    layers.append(L(0, end, "{" + base + f"\\alpha&HFF&\\t({ms(t0)},{ms(t0) + 100},\\alpha&H00&)\\t({T - 120},{T},\\alpha&HFF&)}}" + big,
                    font=BIGF, size=size, color="#FFFFFF", layer=8))
    pre = [w for w in rest if w[0] < emph[0][0]]
    post = [w for w in rest if w[0] > emph[-1][0]]
    for grp, y_s in ((pre, y_big - size * 0.56), (post, y_big + size * 0.56)):
        if not grp:
            continue
        small = " ".join(w[1] for w in grp)
        t1 = grp[0][2] - at
        b2 = f"\\an5\\move(960,{y_s + 14:.0f},960,{y_s:.0f},{ms(t1)},{ms(t1) + 220})"
        layers.append(L(0, end, "{" + b2 + f"\\blur9\\bord7\\3c&H000000&\\alpha&HFF&\\t({ms(t1)},{ms(t1) + 160},\\alpha&H48&)\\t({T - 120},{T},\\alpha&HFF&)}}" + small,
                        font=SMALLF, size=84, color="#000000", layer=7))
        layers.append(L(0, end, "{" + b2 + f"\\alpha&HFF&\\t({ms(t1)},{ms(t1) + 160},\\alpha&H00&)\\t({T - 120},{T},\\alpha&HFF&)}}" + small,
                        font=SMALLF, size=84, color=YEL, layer=8))
    return at, end, layers


def list_cards(p, ch, items, x=1480, y0=250):
    """Three tinted feature cards stacking in on the right (like the reference's service cards)."""
    tints = [("#E6FBEF", "#21B866"), ("#FFE9EF", "#E5486F"), ("#FFF6D6", "#E0A400")]
    at = ch.start - 0.05
    dur = ch.end - at
    lays = []
    for k, (title, sub) in enumerate(items):
        t0 = 0.12 + 0.28 * k
        y = y0 + k * 128
        bg, ic = tints[k % 3]
        T = ms(dur)
        mv = f"\\move({x + 120},{y},{x},{y},{ms(t0)},{ms(t0) + 260})\\alpha&HFF&\\t({ms(t0)},{ms(t0) + 180},\\alpha&H00&)\\t({T - 150},{T},\\alpha&HFF&)"
        shadow_mv = f"\\move({x + 120},{y},{x},{y},{ms(t0)},{ms(t0) + 260})\\alpha&HFF&\\t({ms(t0)},{ms(t0) + 180},\\alpha&HB8&)\\t({T - 150},{T},\\alpha&HFF&)"
        lays.append(S(0, dur, "{\\an7" + shadow_mv + "\\blur14\\p1}" + rrect(-6, 12, 432, 104, 26), "#000000", layer=5))
        lays.append(S(0, dur, "{\\an7" + mv + "\\p1}" + rrect(0, 0, 420, 100, 24), bg, layer=6))
        lays.append(S(0, dur, "{\\an7" + mv + "\\p1}" + circle(50, 50, 28), ic, layer=7))
        lays.append(S(0, dur, "{\\an7" + mv + "\\p1}m 36 51 l 46 61 66 40 70 44 46 69 32 55", "#FFFFFF", layer=8))
        lays.append(L(0, dur, "{\\an4" + mv.replace(f"({x + 120},{y},{x},{y}", f"({x + 220},{y + 38},{x + 100},{y + 38}") + "}" + title,
                      font="inter-extrabold", size=40, color="#141414", layer=8))
        lays.append(L(0, dur, "{\\an4" + mv.replace(f"({x + 120},{y},{x},{y}", f"({x + 220},{y + 74},{x + 100},{y + 74}") + "}" + sub,
                      font="inter-bold", size=26, color="#6B6B6B", layer=8))
        p.sfx("ve-pop", at + t0, 0.32)
    p.ass(at, dur, lays)


def badge(p, t_hit, until, x=960, y=420, label="MORE VIEWS"):
    """Gold coin with a fast 1x→10x tally and a pill label (like the reference's money badge)."""
    at = t_hit - 0.05
    dur = until - at
    T = ms(dur)
    pop = f"\\fscx40\\fscy40\\t(0,180,\\fscx110\\fscy110)\\t(180,300,\\fscx100\\fscy100)\\t({T - 160},{T},\\fscx80\\fscy80\\alpha&HFF&)"
    lays = [
        S(0, dur, f"{{\\an5\\pos({x},{y})\\blur40\\alpha&H70&{pop}\\p1}}" + circle(150, 150, 150), "#FFC83D", layer=5),
        S(0, dur, f"{{\\an5\\pos({x},{y}){pop}\\p1}}" + circle(120, 120, 120), "#F2B825", layer=6),
        S(0, dur, f"{{\\an5\\pos({x},{y}){pop}\\p1}}" + ring(104, 104, 104, 8), "#C98A0B", layer=7),
    ]
    for n in range(1, 11):
        a0 = 0.05 + (n - 1) * 0.035
        a1 = 0.05 + n * 0.035 if n < 10 else dur
        lays.append(L(a0, a1, f"{{\\an5\\pos({x},{y + 4})}}{n}X", font="anton", size=100, color="#1A1206", layer=8))
    pill_y = y + 165
    pw = tw(label, "inter-extrabold", 40) + 70
    lays.append(S(0.25, dur, f"{{\\an7\\pos(0,0)\\alpha&HFF&\\t(0,150,\\alpha&H00&)\\t({T - 410},{T - 250},\\alpha&HFF&)\\p1}}" +
                  rrect(x - pw / 2, pill_y - 34, pw, 68, 34), YEL, layer=7))
    lays.append(L(0.25, dur, f"{{\\an5\\pos({x},{pill_y})\\alpha&HFF&\\t(0,150,\\alpha&H00&)\\t({T - 410},{T - 250},\\alpha&HFF&)}}{label}",
                  font="inter-extrabold", size=40, color="#1A1206", layer=8))
    p.ass(at, dur, lays)
    p.sfx("ve-cash", at + 0.05, 0.4)
    p.sfx("ve-thump", at + 0.05, 0.45)


def ghost_word(p, ch, text, y, size=420):
    """Huge faded outline word behind the speaker."""
    at = ch.start - 0.05
    dur = ch.end - at
    T = ms(dur)
    lay = [L(0, dur, f"{{\\an5\\pos(960,{y})\\fsp6\\fscx90\\fscy90\\t(0,500,\\fscx100\\fscy100)\\1a&HFF&\\bord4\\3c&HFFFFFF&\\3a&HFF&\\t(0,200,\\3a&H50&)\\t({T - 150},{T},\\3a&HFF&)}}{text}",
             font="anton", size=size, color="#FFFFFF", layer=3)]
    p.ass(at, dur, lay, behind=True)


def build_after(lang):
    p = Plan(lang, f"style3-after-{lang}", look={"filter": "eq=contrast=1.08:saturation=1.08:brightness=0.01,colorbalance=rs=0.02:bs=-0.02,vignette=PI/6"},
             music="m-split.wav", music_vol=0.2, fmt="16:9", reframe=REFRAME[lang])
    C = {c_.role: c_ for c_ in chunks(p.w, lang)}
    D = p.dur
    for role, ch in C.items():
        at, end, layers = cap_block(ch)
        p.ass(at, end, layers)
        p.sfx("ve-swish", ch.start, 0.14)
    p.ev(type="zoom", at=0, dur=0.6, style="punch", amount=1.15)
    p.sfx("ve-whoosh-air", 0.0, 0.3)
    v = C["views"]
    p.ev(type="darken", at=round(v.start, 3), until=round(v.end, 3), amount=0.45)
    ghost_word(p, v, "VIEWS" if lang == "en" else "VIEWS", FACE_Y[lang] - 40)
    p.sfx("ve-hit", [w[2] for w in v.words if w[0] in v.emph][0], 0.4)
    ed = C["editing"]
    p.ev(type="pixelate", at=round(ed.start - 0.08, 3), dur=0.28, amount=24)
    p.ev(type="zoom", at=round(ed.start, 3), dur=0.5, style="punch", amount=1.12)
    p.sfx("ve-glitch", ed.start, 0.3)
    ts = C["twosec"]
    p.ev(type="darken", at=round(ts.start, 3), until=round(ts.end, 3), amount=0.4)
    ghost_word(p, ts, "2 SEC", FACE_Y[lang] - 40, size=460)
    p.sfx("ve-tick", ts.start + 0.1, 0.3)
    p.sfx("ve-tick", ts.start + 0.45, 0.3)
    sc = C["scroll"]
    p.ev(type="broll", at=round(sc.start - 0.05, 3), until=round(sc.end, 3), file="hands-phone.mp4", **{"from": 4})
    p.sfx("ve-scroll", sc.start + 0.1, 0.45)
    sm = C["same"]
    p.ev(type="zoom", at=round(sm.start, 3), dur=1.4, style="push", amount=1.1)
    p.ev(type="flash", at=round(sm.start - 0.04, 3), dur=0.2)
    p.sfx("ve-whoosh-deep", sm.start, 0.35)
    ed2 = C["edited"]
    items = [("Captions", "word-by-word, auto"), ("Motion", "graphics & zooms"), ("Sound", "designed, not dumped")] if lang == "en" else \
        [("Captions", "word-by-word, auto"), ("Motion", "graphics & zooms"), ("Sound", "perfectly placed")]
    # keep the cards up through the 10x beat
    class _W:  # window spanning edited -> start of tenx
        start, end = ed2.start, C["tenx"].start
    list_cards(p, _W, items)
    t10 = C["tenx"]
    t_hit = [w[2] for w in t10.words if w[0] in t10.emph][0]
    p.ev(type="zoom", at=round(t_hit, 3), dur=0.5, style="punch", amount=1.12)
    badge(p, t_hit, t10.end, x=1500, y=400)
    p.ev(type="zoom", at=round(C["show"].start, 3), dur=D - C["show"].start, style="slow", amount=1.06)
    return p


def build_before(lang):
    p = Plan(lang, f"style3-before-{lang}", look="natural", music=None, fmt="16:9", reframe=REFRAME[lang])
    d = p.json()
    d["auto_sfx"] = False
    return p, d


# ------------------------------------------------------------------ canvas compositor (PIL)
def font(name, size):
    return ImageFont.truetype(LIBF + name, size)


def make_static(W=1080, H=1920):
    rng = np.random.default_rng(7)
    yy, xx = np.mgrid[0:H // 4, 0:W // 4].astype(np.float32)
    field = np.zeros_like(xx)
    for _ in range(14):
        cx, cy, s, a = rng.uniform(0, W // 4), rng.uniform(0, H // 4), rng.uniform(40, 120), rng.uniform(-1, 1)
        field += a * np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * s * s))
    field = (field - field.min()) / (field.max() - field.min())
    bands = np.floor(field * 22)
    edge = (np.abs(np.diff(bands, axis=0, prepend=bands[:1])) + np.abs(np.diff(bands, axis=1, prepend=bands[:, :1]))) > 0
    lines = Image.fromarray((edge * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(0.8))
    base = np.zeros((H, W, 3), np.float32)
    g = np.clip(1 - np.sqrt(((np.mgrid[0:H, 0:W][1] - W / 2) / W) ** 2 + ((np.mgrid[0:H, 0:W][0] - H * 0.45) / H) ** 2) * 1.1, 0, 1)
    base[...] = (np.array([226, 229, 229]) + np.array([20, 18, 18]) * g[..., None])
    ln = np.asarray(lines, np.float32)[..., None] / 255.0
    base = base * (1 - 0.09 * ln)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def make_ring(radius=600, text="VIBE EDITOR  •  ", size=30):
    d = radius * 2 + 120
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    f = font("Inter-Bold.otf", size)
    circ = 2 * math.pi * radius
    reps = max(1, int(circ // f.getlength(text)))
    chars = text * reps
    k_sp = circ / sum(f.getlength(ch) for ch in chars)
    x = 0.0
    for ch in chars:
        cw = f.getlength(ch) * k_sp
        ang = (x + cw / 2) / radius
        tile = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(tile).text((size, size), ch, font=f, fill=(70, 74, 76, 150), anchor="mm")
        tile = tile.rotate(-math.degrees(ang), resample=Image.BICUBIC)
        px_ = d / 2 + radius * math.cos(ang - math.pi / 2) - size
        py_ = d / 2 + radius * math.sin(ang - math.pi / 2) - size
        img.alpha_composite(tile, (int(px_), int(py_)))
        x += cw
    return img


def pill(draw, cx, cy, text, f, fill, color, padx=26, h=48):
    w = f.getlength(text) + padx * 2
    draw.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], h / 2, fill=fill)
    draw.text((cx, cy + 1), text, font=f, fill=color, anchor="mm")


def make_overlay(top_box, bot_box, lang, W=1080, H=1920):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    f1 = font("Inter-ExtraBold.otf", 25)
    tx, ty, tw_, th = top_box
    bx, by, bw, bh = bot_box
    label = "EDITED WITH VIBE EDITOR" if lang == "en" else "VIBE EDITOR SE EDIT KIYA"
    pill(d, tx + tw_ / 2, ty, label, f1, (16, 16, 16, 255), (255, 255, 255, 255), padx=30, h=46)
    pill(d, tx + tw_ / 2, ty + th, "AFTER", f1, (16, 16, 16, 255), (255, 255, 255, 255), padx=24, h=42)
    pill(d, bx + bw / 2, by + bh, "BEFORE  ·  RAW", f1, (255, 255, 255, 255), (16, 16, 16, 255), padx=24, h=42)
    # logo
    fl = font("Anton-Regular.ttf", 76)
    fs = font("Inter-ExtraBold.otf", 22)
    cx, cy = W / 2, 1650
    d.text((cx - 70, cy), "VE", font=fl, fill=(18, 18, 18, 255), anchor="mm")
    d.text((cx - 18, cy - 14), "VIBE", font=fs, fill=(18, 18, 18, 255), anchor="lm")
    d.text((cx - 18, cy + 14), "EDITOR", font=fs, fill=(18, 18, 18, 255), anchor="lm")
    return ov


def card_layer(size, radius, glow=True):
    w, h = size
    m = Image.new("L", (w * 2, h * 2), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * 2 - 1, h * 2 - 1], radius * 2, fill=255)
    m = m.resize((w, h), Image.LANCZOS)
    pad = 90
    sh = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    a = Image.new("L", sh.size, 0)
    ImageDraw.Draw(a).rounded_rectangle([pad, pad + 14, pad + w, pad + h + 14], radius, fill=120)
    a = a.filter(ImageFilter.GaussianBlur(30))
    sh.putalpha(a)
    halo = Image.new("RGBA", sh.size, (255, 255, 255, 0))
    ah = Image.new("L", sh.size, 0)
    ImageDraw.Draw(ah).rounded_rectangle([pad - 16, pad - 16, pad + w + 16, pad + h + 16], radius + 16, fill=230)
    halo.putalpha(ah.filter(ImageFilter.GaussianBlur(22)))
    return m, sh, halo, pad


def reader(path, w, h):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h}:flags=lanczos,fps=30", "-f", "rawvideo",
                             "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)


def composite(after, before, out, lang, dur):
    W, H = 1080, 1920
    top = (48, 250, 984, 554)
    bot = (110, 1000, 860, 484)
    static = make_static().convert("RGBA")
    ring_img = make_ring()
    overlay = make_overlay(top, bot, lang)
    tm, tsh, thalo, tpad = card_layer(top[2:], 30)
    bm, bsh, bhalo, bpad = card_layer(bot[2:], 26)
    rng = np.random.default_rng(3)
    P = [dict(x=rng.uniform(0, W), y=rng.uniform(0, H), vx=rng.uniform(-14, 14), vy=rng.uniform(-30, -8),
              r=rng.uniform(1.5, 5.5), a=rng.uniform(70, 160), rot=rng.uniform(0, 180)) for _ in range(46)]
    ra = reader(after, top[2], top[3])
    rb = reader(before, bot[2], bot[3])
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-i", after, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out],
                           stdin=subprocess.PIPE)
    n = int(round(dur * 30))
    fa = top[2] * top[3] * 3
    fb = bot[2] * bot[3] * 3
    last_a = last_b = None
    for k in range(n):
        t = k / 30
        ba = ra.stdout.read(fa)
        bb = rb.stdout.read(fb)
        if len(ba) == fa:
            last_a = Image.frombytes("RGB", top[2:], ba)
        if len(bb) == fb:
            last_b = Image.frombytes("RGB", bot[2:], bb)
        fr = static.copy()
        # particles (dust flecks drifting up)
        dd = ImageDraw.Draw(fr)
        for q in P:
            x = (q["x"] + q["vx"] * t) % W
            y = (q["y"] + q["vy"] * t) % H
            r = q["r"]
            dd.ellipse([x - r, y - r * 0.55, x + r, y + r * 0.55], fill=(40, 40, 40, int(q["a"])))
        # rotating ring text
        rr = ring_img.rotate(-t * 9, resample=Image.BICUBIC)
        fr.alpha_composite(rr, (int(700 - rr.width / 2), int(640 - rr.height / 2)))
        e = 1 - (1 - min(1.0, t / 0.45)) ** 3
        for (img, mask, sh, halo, pad, box, delay) in ((last_b, bm, bsh, bhalo, bpad, bot, 0.08), (last_a, tm, tsh, thalo, tpad, top, 0.0)):
            if img is None:
                continue
            ee = 1 - (1 - min(1.0, max(0.0, (t - delay) / 0.45))) ** 3
            s = 0.94 + 0.06 * ee
            x, y, w, h = box
            cx, cy = x + w / 2, y + h / 2 + (1 - ee) * 40
            if s < 0.999:
                sw, shh = int(w * s), int(h * s)
                img2, m2 = img.resize((sw, shh), Image.BILINEAR), mask.resize((sw, shh), Image.BILINEAR)
                sh2 = sh.resize((int(sh.width * s), int(sh.height * s)))
                ha2 = halo.resize((int(halo.width * s), int(halo.height * s)))
            else:
                sw, shh, img2, m2, sh2, ha2 = w, h, img, mask, sh, halo
            fr.alpha_composite(ha2, (int(cx - ha2.width / 2), int(cy - ha2.height / 2)))
            fr.alpha_composite(sh2, (int(cx - sh2.width / 2), int(cy - sh2.height / 2)))
            if ee < 1:
                m2 = m2.point(lambda v, ee=ee: int(v * ee))
            fr.paste(img2, (int(cx - sw / 2), int(cy - shh / 2)), m2)
        ov = overlay
        if e < 1:
            ov = overlay.copy()
            ov.putalpha(overlay.getchannel("A").point(lambda v, e=e: int(v * e)))
        fr.alpha_composite(ov)
        enc.stdin.write(fr.convert("RGB").tobytes())
    enc.stdin.close()
    enc.wait()
    ra.kill()
    rb.kill()
    return out


if __name__ == "__main__":
    import json
    for lang in sys.argv[1:] or ["en", "hi"]:
        print(build_after(lang).save())
        _, d = build_before(lang)
        path = os.path.join(WS, "plans", f"style3-before-{lang}.json")
        json.dump(d, open(path, "w"), indent=1)
        print(path)
