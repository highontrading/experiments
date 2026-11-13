"""adkit2: toolkit v2 for the 20-ad batch.
- streaming clip reader (cover / blur-fit / card), push-ins, grades, cut transitions
- caption engine with many styles (pill, bold_yellow, yellow_text, yellow_box, pink_box, karaoke, subtitle,
  single, serif, mono, outline, ig) driven by ElevenLabs word timings or by scripted phrases
- logo badge, end cards (cream / dark / yellow / over-video), phone screen-scroll, prompt UI, invoice card
- render(): timeline of segments + overlay callbacks -> mp4 with audio mix (reuses adkit.mix_audio / mux)
"""
import os, sys, math, json, functools, subprocess, random
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import adkit as K

ROOT = K.ROOT
A = lambda *p: os.path.join(ROOT, "assets", *p)
FONTS = A("fonts")
FPS = 30
INK, WHITE, CREAM = (20, 20, 20), (255, 255, 255), (241, 239, 230)
PINK, LIME = (246, 184, 234), (216, 245, 162)
YELLOW = (255, 214, 10)
GRID = (226, 222, 209)
STUDIO = {l.split()[0]: A(l.split()[1]) for l in open(A("studio", "index.txt"))}
TR = os.path.join(ROOT, "..", "ai-in-advertising-trailer", "generated")
MUSIC = lambda n: os.path.join(TR, "music", n)
SFX = lambda n: os.path.join(TR, "sfx", n) if os.path.exists(os.path.join(TR, "sfx", n)) else A("sfx", n)


# ------------------------------------------------------------------ fonts
@functools.lru_cache(None)
def F(name, px, wght=None):
    path = os.path.join(FONTS, name if name.endswith(".ttf") else name + ".ttf")
    f = ImageFont.truetype(path, int(px))
    if name.startswith("Inter"):
        try: f.set_variation_by_axes([min(32, max(14, px * 0.3)), wght or 700])
        except Exception: pass
    elif name.startswith("JetBrains"):
        try: f.set_variation_by_axes([wght or 700])
        except Exception: pass
    return f


def fb(f):
    """fallback font with the rupee glyph, same size"""
    return F("Poppins-ExtraBold", f.size) if "Poppins" not in f.path else f


def has_rupee(f): return "Poppins" in f.path or "Inter" in f.path


def text_w(d, s, f):
    if "₹" not in s or has_rupee(f): return d.textlength(s, font=f)
    parts = s.split("₹"); return sum(d.textlength(p, font=f) for p in parts) + (len(parts) - 1) * d.textlength("₹", font=fb(f))


def draw(d, xy, s, f, fill, **kw):
    """draw text; rupee glyph rendered with a fallback font where needed"""
    if "₹" not in s or has_rupee(f):
        d.text(xy, s, font=f, fill=fill, **kw); return
    x, y = xy
    for i, p in enumerate(s.split("₹")):
        if i:
            g = fb(f); d.text((x, y + f.size * 0.04), "₹", font=g, fill=fill, **kw); x += d.textlength("₹", font=g)
        d.text((x, y), p, font=f, fill=fill, **kw); x += d.textlength(p, font=f)


# ------------------------------------------------------------------ video sources
def probe(src):
    cap = cv2.VideoCapture(src); w, h, fps, n = cap.get(3), cap.get(4), cap.get(5), cap.get(7); cap.release()
    return w, h, (n / fps if fps else 0)


def _ffmpeg_frames(src, t, dur, vf, W, H, speed=1.0):
    n = max(1, int(round(dur * FPS)))
    pre = f"setpts=PTS/{speed}," if speed != 1.0 else ""
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.3f}", "-i", src, "-t", f"{dur * speed + 0.3:.3f}",
           "-filter_complex", f"[0:v]{pre}{vf},fps={FPS},format=rgb24[o]", "-map", "[o]", "-frames:v", str(n), "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    fs = W * H * 3; last = None; k = 0
    while k < n:
        b = p.stdout.read(fs)
        if len(b) < fs: break
        last = np.frombuffer(b, np.uint8).reshape(H, W, 3); k += 1; yield last
    p.stdout.close(); p.wait()
    while k < n and last is not None: k += 1; yield last


def cover_vf(src, W, H, fx=0.5, fy=0.5, zoom=1.0):
    sw, sh, _ = probe(src); s = max(W / sw, H / sh) * zoom; cw, ch = W / s, H / s
    x0 = max(0, min(sw - cw, fx * sw - cw / 2)); y0 = max(0, min(sh - ch, fy * sh - ch / 2))
    return f"crop={int(cw)}:{int(ch)}:{int(x0)}:{int(y0)},scale={W}:{H}:flags=lanczos"


def blurfit_vf(src, W, H, fy=0.5, scale=1.0):
    """fit whole frame by width (times scale), over a blurred cover of itself"""
    sw, sh, _ = probe(src); fw = int(W * scale) // 2 * 2; fh = int(sh * fw / sw) // 2 * 2
    y = int((H - fh) * fy); x = (W - fw) // 2
    return (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=28:2,eq=brightness=-0.12:saturation=1.1[bg];"
            f"[b]scale={fw}:{fh}:flags=lanczos[fg];[bg][fg]overlay={x}:{y}")


def grade_frame(f, contrast=1.06, sat=1.08, warm=0.0, lift=0.0):
    x = f.astype(np.float32); g = x.mean(axis=2, keepdims=True); x = g + (x - g) * sat; x = (x - 128) * contrast + 128 + lift
    if warm: x[..., 0] *= 1 + warm; x[..., 2] *= 1 - warm
    return np.clip(x, 0, 255).astype(np.uint8)


def zoom_frame(f, z, cx=0.5, cy=0.5, rot=0.0):
    if abs(z - 1) < 1e-3 and not rot: return f
    H, W = f.shape[:2]
    M = cv2.getRotationMatrix2D((W * cx, H * cy), rot, z)
    return cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def clip(src, t, dur, W, H, mode="cover", fx=0.5, fy=0.5, z=(1.0, 1.07), speed=1.0, gr=None, zoom=1.0, fit_scale=1.0):
    """generator of graded frames with a push-in from z[0] to z[1]"""
    vf = cover_vf(src, W, H, fx, fy, zoom) if mode == "cover" else blurfit_vf(src, W, H, fy, fit_scale)
    n = max(1, int(round(dur * FPS))); gr = gr or {}
    for i, f in enumerate(_ffmpeg_frames(src, t, dur, vf, W, H, speed)):
        zz = z[0] + (z[1] - z[0]) * (i / max(1, n - 1))
        yield grade_frame(zoom_frame(f, zz), **gr)


def still(img, dur, z=(1.0, 1.05)):
    n = max(1, int(round(dur * FPS)))
    for i in range(n): yield zoom_frame(img, z[0] + (z[1] - z[0]) * i / max(1, n - 1))


def color_frames(W, H, rgb, dur):
    f = np.empty((H, W, 3), np.uint8); f[:] = rgb
    for _ in range(max(1, int(round(dur * FPS)))): yield f


def frame_at(src, t, W, H, fx=0.5, fy=0.5, mode="cover"):
    vf = cover_vf(src, W, H, fx, fy) if mode == "cover" else blurfit_vf(src, W, H, fy)
    return next(_ffmpeg_frames(src, t, 0.04, vf, W, H))


# ------------------------------------------------------------------ cut transitions (applied to first frames of a segment)
def fx_apply(kind, f, i, prev=None):
    if kind == "punch" and i < 7:                     # punch-in zoom settling
        return zoom_frame(f, 1.0 + 0.10 * (1 - i / 7) ** 2)
    if kind == "flash" and i < 4:
        a = [0.85, 0.5, 0.25, 0.1][i]; return (f.astype(np.float32) * (1 - a) + 255 * a).astype(np.uint8)
    if kind == "whip" and i < 6:
        k = int(60 * (1 - i / 6)) * 2 + 1; s = int(140 * (1 - i / 6) ** 2)
        g = cv2.blur(f, (k, 1)); return np.roll(g, s, axis=1)
    if kind == "glitch" and i < 5:
        o = f.copy(); s = 18 - i * 3
        o[..., 0] = np.roll(f[..., 0], s, axis=1); o[..., 2] = np.roll(f[..., 2], -s, axis=1)
        H = f.shape[0]
        for _ in range(4):
            y = random.randint(0, H - 40); h = random.randint(8, 40); o[y:y + h] = np.roll(o[y:y + h], random.randint(-60, 60), axis=1)
        return o
    if kind == "fade" and i < 6 and prev is not None:
        a = i / 6; return (prev.astype(np.float32) * (1 - a) + f.astype(np.float32) * a).astype(np.uint8)
    if kind == "dip" and i < 5:                       # dip from black
        return (f.astype(np.float32) * (i / 5)).astype(np.uint8)
    return f


# ------------------------------------------------------------------ compositing
def over(frame, layer, xy=(0, 0)):
    """alpha-composite an RGBA PIL image (any size) onto an RGB uint8 frame at xy"""
    if layer is None: return frame
    L = np.asarray(layer); x, y = xy; h, w = L.shape[:2]; H, W = frame.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x0 >= x1 or y0 >= y1: return frame
    sub = L[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32); a = sub[..., 3:4] / 255.0
    out = frame.copy(); reg = out[y0:y1, x0:x1].astype(np.float32)
    out[y0:y1, x0:x1] = (reg * (1 - a) + sub[..., :3] * a).astype(np.uint8)
    return out


def shadow_of(img, blur=8, alpha=0.8, off=(0, 4)):
    a = np.asarray(img)[..., 3].astype(np.float32) * alpha
    a = cv2.GaussianBlur(a, (0, 0), blur); s = np.zeros(np.asarray(img).shape, np.uint8); s[..., 3] = np.clip(a, 0, 255)
    s = Image.fromarray(s); out = Image.new("RGBA", img.size, (0, 0, 0, 0)); out.alpha_composite(s, (off[0], off[1]) if off[0] >= 0 and off[1] >= 0 else (0, 0))
    return out


def scrim(frame, top=0.0, bottom=0.0, strength=0.55, band=None):
    return K.scrim(frame, top, bottom, band, strength)


def rounded(img, r):
    m = Image.new("L", img.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], r, fill=255)
    img = img.convert("RGBA"); img.putalpha(m); return img


# ------------------------------------------------------------------ logo
@functools.lru_cache(None)
def logo_img(color="white", h=60):
    im = Image.open(A("brand", f"logo_{color}.png")); return im.resize((int(im.width * h / im.height), h), Image.LANCZOS)


@functools.lru_cache(None)
def badge(color="white", h=46, text="IDEABRO STUDIO", sub=None, bg=None):
    lg = logo_img(color, h); f = F("JetBrainsMono", int(h * 0.52), 700)
    d0 = ImageDraw.Draw(Image.new("L", (4, 4))); tw = d0.textlength(text, font=f)
    w = lg.width + 16 + int(tw) + (36 if bg else 0); hh = h + (24 if bg else 0)
    im = Image.new("RGBA", (w, hh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if bg: d.rounded_rectangle([0, 0, w - 1, hh - 1], hh // 2, fill=bg)
    ox = 18 if bg else 0; oy = 12 if bg else 0
    im.alpha_composite(lg, (ox, oy)); c = WHITE if color == "white" else INK
    d.text((ox + lg.width + 16, oy + (h - f.size) / 2 - 2), text, font=f, fill=c + (255,))
    return im


def put_badge(frame, color="white", y=96, h=56, align="center", bg=None, shadow=True):
    b = badge(color, h, bg=bg); W = frame.shape[1]
    x = (W - b.width) // 2 if align == "center" else 64
    if shadow and not bg and color == "white": frame = over(frame, shadow_of(b, 6, 0.6, (0, 2)), (x, y))
    return over(frame, b, (x, y))


# ------------------------------------------------------------------ word timing
PUNCT = set(",.?!;:\"“”—–…()")


def vo_words(alignment_json, offset=0.0, display=None, hl=()):
    """words from ElevenLabs alignment. Keeps trailing punctuation as 'p'. display: optional list (same length) of
    words to show instead (e.g. Roman Hinglish for Devanagari VO); '' merges a word into the previous one."""
    a = json.load(open(alignment_json)); out = []; cur = ""; s = e = None
    chars = a["characters"]; st = a["character_start_times_seconds"]; en = a["character_end_times_seconds"]
    for i, (c, a0, a1) in enumerate(zip(chars, st, en)):
        if not c.isspace() and c not in PUNCT:
            if s is None: s = a0
            cur += c; e = a1
        else:
            if cur: out.append({"w": cur, "s": s + offset, "e": e + offset, "p": ""}); cur = ""; s = None
            if c in PUNCT and out and c not in "“\"(": out[-1]["p"] += c
    if cur: out.append({"w": cur, "s": s + offset, "e": e + offset, "p": ""})
    if display is not None:
        assert len(display) == len(out), (len(display), len(out), [o["w"] for o in out])
        res = []
        for o, dw in zip(out, display):
            if dw == "" and res: res[-1]["e"] = o["e"]; res[-1]["p"] = o["p"]
            else:
                o = dict(o); dw = dw.rstrip("".join(PUNCT))
                o["w"] = dw if dw != "₹2" else "₹2,999"; res.append(o)
        out = res
    hl = {h.lower() for h in hl}
    for o in out: o["hl"] = o["w"].lower().strip(".,!?") in hl
    return out


def auto_chunks(words, maxn=3, maxchars=18):
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        n = sum(len(words[j]["w"]) for j in cur)
        if len(cur) >= maxn or n >= maxchars or any(c in w["p"] for c in ".?!,;:—"):
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    return chunks


def script_words(items, hl=()):
    """items: [(text, t0, t1)] -> words + chunks + spans; words revealed sequentially across the phrase"""
    words, chunks, spans = [], [], []; hl = {h.lower() for h in hl}
    for text, t0, t1 in items:
        toks = text.split(); n = len(toks); step = min(0.2, (t1 - t0) * 0.55 / max(1, n)); idx = []
        for i, tk in enumerate(toks):
            s = t0 + i * step; p = ""
            while tk and tk[-1] in PUNCT and len(tk) > 1: p = tk[-1] + p; tk = tk[:-1]
            words.append({"w": tk, "s": s, "e": s + step * 1.6 if i < n - 1 else t1 - 0.1, "p": p, "hl": tk.lower() in hl})
            idx.append(len(words) - 1)
        chunks.append(idx); spans.append((t0, t1))
    return words, chunks, spans


# ------------------------------------------------------------------ caption styles
STYLES = {
    "pill":        dict(font="Inter", wght=800, size=98, upper=False, mode="word"),
    "bold_yellow": dict(font="Poppins-Black", size=112, upper=True, mode="word"),
    "yellow_text": dict(font="Poppins-Black", size=108, upper=True, mode="word"),
    "yellow_box":  dict(font="Poppins-ExtraBold", size=92, upper=False, mode="word"),
    "pink_box":    dict(font="Inter", wght=800, size=86, upper=False, mode="word"),
    "karaoke":     dict(font="Poppins-ExtraBold", size=74, upper=False, mode="line"),
    "subtitle":    dict(font="Inter", wght=560, size=52, upper=False, mode="line"),
    "single":      dict(font="Anton-Regular", size=200, upper=True, mode="word"),
    "serif":       dict(font="InstrumentSerif-Italic", size=104, upper=False, mode="word"),
    "mono":        dict(font="JetBrainsMono", wght=600, size=54, upper=False, mode="type"),
    "outline":     dict(font="Anton-Regular", size=150, upper=True, mode="word"),
    "ig":          dict(font="Poppins-SemiBold", size=60, upper=False, mode="line"),
}


class Caps:
    """Caption track. words: list of dicts (w, s, e, p, hl). chunks: lists of word indices.
    spans: optional explicit (start, end) per chunk. style: key of STYLES. y: top of the caption block."""

    def __init__(self, W, H, words, chunks=None, style="pill", y=1260, spans=None, hold=0.4, maxw=940, size=None, accent=YELLOW,
                 show_punct=False):
        self.W, self.H, self.words, self.style, self.y, self.hold, self.maxw, self.accent = W, H, words, style, y, hold, maxw, accent
        self.cfg = dict(STYLES[style]);
        if size: self.cfg["size"] = size
        self.chunks = chunks or auto_chunks(words, 1 if style == "single" else (2 if style in ("bold_yellow", "yellow_text", "outline") else 3))
        self.show_punct = show_punct
        sz = self.cfg["size"]; self.f = F(self.cfg["font"], sz, self.cfg.get("wght"))
        self.spans = spans or self._spans()
        self.d0 = ImageDraw.Draw(Image.new("L", (4, 4)))
        self.space = max(self.d0.textlength(" ", font=self.f), sz * {"single": 0.3, "outline": 0.34, "bold_yellow": 0.5, "yellow_text": 0.5, "yellow_box": 0.46, "pink_box": 0.5, "pill": 0.44}.get(style, 0.36))
        self.layouts = [self._layout(ch) for ch in self.chunks]

    def txt(self, w):
        s = w["w"] + (w["p"] if self.show_punct else "")
        return s.upper() if self.cfg["upper"] else s

    def _spans(self):
        sp = []
        for k, ch in enumerate(self.chunks):
            s = self.words[ch[0]]["s"] - 0.05
            nxt = self.words[self.chunks[k + 1][0]]["s"] - 0.05 if k + 1 < len(self.chunks) else 1e9
            sp.append((s, min(nxt, self.words[ch[-1]]["e"] + self.hold)))
        return sp

    def _layout(self, ch):
        ws = [(i, self.txt(self.words[i]), text_w(self.d0, self.txt(self.words[i]), self.f)) for i in ch]
        lines, cur, cw = [], [], 0
        for i, w, tw in ws:
            if cur and cw + self.space + tw > self.maxw: lines.append(cur); cur, cw = [], 0
            cur.append((i, w, tw)); cw += (self.space if len(cur) > 1 else 0) + tw
        lines.append(cur)
        lh = int(self.cfg["size"] * {"karaoke": 1.32, "subtitle": 1.5, "ig": 1.42, "serif": 1.05, "mono": 1.6, "single": 1.0}.get(self.style, 1.16))
        pos = {}; widths = []
        for li, ln in enumerate(lines):
            tot = sum(tw for _, _, tw in ln) + self.space * (len(ln) - 1); x = (self.W - tot) / 2; widths.append((x, tot))
            for i, w, tw in ln: pos[i] = (x, self.y + li * lh, tw, li); x += tw + self.space
        return {"pos": pos, "lines": lines, "lh": lh, "widths": widths}

    def chunk_at(self, t):
        for k, (s, e) in enumerate(self.spans):
            if s <= t < e: return k
        return None

    # -------------------------------------------------- render
    def layer(self, t):
        k = self.chunk_at(t)
        if k is None: return None
        img = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        sh = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        st = self.style; L = self.layouts[k]; ch = self.chunks[k]; c0 = self.spans[k][0]
        getattr(self, "_r_" + {"yellow_text": "bold_yellow"}.get(st, st))(t, k, L, ch, c0, d, sd, img)
        a = np.asarray(sh).copy()
        if a[..., 3].any():
            a[..., 3] = cv2.GaussianBlur(a[..., 3], (0, 0), 9 if st in ("single", "serif") else 6)
            base = Image.fromarray(a); base.alpha_composite(img); return base
        return img

    def _pop(self, t, s, dur=0.14, amp=0.14):
        p = max(0.0, min(1.0, (t - s) / dur)); return p, 1.0 + amp * (1 - p) ** 2 - 0.03 * math.sin(p * math.pi)

    def _word_iter(self, t, L, ch, visible_all=False):
        for i in ch:
            w = self.words[i]
            if not visible_all and t < w["s"] - 0.05: continue
            x, y, tw, li = L["pos"][i]; yield i, w, x, y, tw

    def _r_pill(self, t, k, L, ch, c0, d, sd, img):
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            p, sc = self._pop(t, w["s"] - 0.05); f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc)), self.cfg.get("wght"))
            s = self.txt(w); ww = text_w(d, s, f); xx = x + tw / 2 - ww / 2; yy = y + (self.cfg["size"] - f.size) * 0.55 - 8 * (1 - p)
            if w["s"] - 0.05 <= t < w["e"] + 0.06:
                asc, desc = f.getmetrics(); pad = 14
                d.rounded_rectangle([xx - pad, yy + f.size * 0.08, xx + ww + pad, yy + asc + desc * 0.55], int(f.size * 0.22),
                                    fill=(255, 255, 255, 255) if not w["hl"] else self.accent + (255,))
                draw(d, (xx, yy), s, f, (15, 15, 15, 255))
            else:
                draw(sd, (xx, yy + 4), s, f, (0, 0, 0, 210))
                draw(d, (xx, yy), s, f, (255, 255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0, 120))

    def _r_bold_yellow(self, t, k, L, ch, c0, d, sd, img):
        alt = self.style == "yellow_text"
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            act = w["s"] - 0.05 <= t < w["e"] + 0.08
            p, sc = self._pop(t, w["s"] - 0.05, 0.12, 0.16)
            if act: sc *= 1.04
            f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc))); s = self.txt(w); ww = text_w(d, s, f)
            xx = x + tw / 2 - ww / 2; yy = y + (self.cfg["size"] - f.size) * 0.5 - 10 * (1 - p)
            if alt: col = WHITE if act else YELLOW
            else: col = YELLOW if (act or w["hl"]) else WHITE
            draw(sd, (xx, yy + 8), s, f, (0, 0, 0, 230))
            draw(d, (xx, yy), s, f, col + (255,), stroke_width=max(6, f.size // 13), stroke_fill=(0, 0, 0, 255))

    def _r_yellow_box(self, t, k, L, ch, c0, d, sd, img):
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            act = w["s"] - 0.05 <= t < w["e"] + 0.06
            p, sc = self._pop(t, w["s"] - 0.05); f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc)))
            s = self.txt(w); ww = text_w(d, s, f); xx = x + tw / 2 - ww / 2; yy = y + (self.cfg["size"] - f.size) * 0.5 - 6 * (1 - p)
            if act or w["hl"]:
                asc, desc = f.getmetrics(); pad = 12
                rot = Image.new("RGBA", (int(ww + 2 * pad + 8), int(asc + desc * 0.5 + 8)), (0, 0, 0, 0))
                ImageDraw.Draw(rot).rounded_rectangle([4, 4, rot.width - 4, rot.height - 4], 10, fill=YELLOW + (255,))
                rot = rot.rotate(-2 if i % 2 else 2, expand=True, resample=Image.BICUBIC)
                img.alpha_composite(rot, (int(xx - pad - 4), int(yy + f.size * 0.06 - 4)))
                draw(d, (xx, yy), s, f, INK + (255,))
            else:
                draw(sd, (xx, yy + 5), s, f, (0, 0, 0, 220))
                draw(d, (xx, yy), s, f, (255, 255, 255, 255), stroke_width=5, stroke_fill=(0, 0, 0, 255))

    def _r_pink_box(self, t, k, L, ch, c0, d, sd, img):
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            act = w["s"] - 0.05 <= t < w["e"] + 0.06
            p, sc = self._pop(t, w["s"] - 0.05, 0.12, 0.10); f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc)), self.cfg.get("wght"))
            s = self.txt(w); ww = text_w(d, s, f); xx = x + tw / 2 - ww / 2; yy = y + (self.cfg["size"] - f.size) * 0.5
            asc, desc = f.getmetrics(); pad = 14
            box = PINK if act else (LIME if w["hl"] else INK); col = INK if (act or w["hl"]) else WHITE
            d.rectangle([xx - pad, yy + f.size * 0.04, xx + ww + pad, yy + asc + desc * 0.7], fill=box + (255 if act or w["hl"] else 235,))
            draw(d, (xx, yy), s, f, col + (255,))

    def _r_karaoke(self, t, k, L, ch, c0, d, sd, img):
        a = min(1.0, (t - c0) / 0.12); f = self.f
        xs = [x for x, _ in L["widths"]]; ws = [w for _, w in L["widths"]]
        y0 = self.y - 26; y1 = self.y + L["lh"] * len(L["lines"]) - 8
        bx0 = min(xs) - 40; bx1 = max(x + w for x, w in L["widths"]) + 40
        d.rounded_rectangle([bx0, y0, bx1, y1], 28, fill=(0, 0, 0, int(150 * a)))
        for i, w, x, y, tw in self._word_iter(t, L, ch, True):
            s = self.txt(w); done = t >= w["s"] - 0.03
            if done:
                prog = min(1.0, (t - w["s"] + 0.03) / max(0.08, w["e"] - w["s"]))
                col = YELLOW if (prog >= 0.5 or w["hl"]) else WHITE
                draw(d, (x, y - 4 * (1 - prog)), s, f, col + (int(255 * a),))
            else:
                draw(d, (x, y), s, f, (255, 255, 255, int(150 * a)))

    def _r_subtitle(self, t, k, L, ch, c0, d, sd, img):
        a = min(1.0, (t - c0) / 0.15); f = self.f; pad = 22
        for li, (x, w) in enumerate(L["widths"]):
            y = self.y + li * L["lh"]; asc, desc = f.getmetrics()
            d.rounded_rectangle([x - pad, y - 12, x + w + pad, y + asc + desc + 6], 14, fill=(0, 0, 0, int(165 * a)))
        for i, w, x, y, tw in self._word_iter(t, L, ch, True):
            draw(d, (x, y), self.txt(w), f, (LIME if w["hl"] else WHITE) + (int(255 * a),))

    def _r_single(self, t, k, L, ch, c0, d, sd, img):
        for i, w, x, y, tw in self._word_iter(t, L, ch, True):
            p, sc = self._pop(t, c0, 0.16, 0.45)
            f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc))); s = self.txt(w); ww = text_w(d, s, f)
            if ww > self.W - 120: f = F(self.cfg["font"], int(f.size * (self.W - 120) / ww)); ww = text_w(d, s, f)
            xx = (self.W - ww) / 2; yy = y + (self.cfg["size"] - f.size) * 0.5
            col = self.accent if w["hl"] else WHITE; al = min(1.0, p * 5)
            draw(sd, (xx, yy + 10), s, f, (0, 0, 0, int(255 * al)))
            draw(d, (xx, yy), s, f, col + (int(255 * al),), stroke_width=3, stroke_fill=(0, 0, 0, int(160 * al)))

    def _r_serif(self, t, k, L, ch, c0, d, sd, img):
        f = self.f
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            a = min(1.0, (t - w["s"] + 0.05) / 0.25); e = 1 - (1 - a) ** 3; yy = y + 18 * (1 - e); s = self.txt(w)
            if w["hl"]:
                asc, desc = f.getmetrics(); pad = 10
                d.rectangle([x - pad, yy + f.size * 0.18, x - pad + (tw + 2 * pad) * e, yy + asc + desc * 0.4], fill=LIME + (255,))
                draw(d, (x, yy), s, f, INK + (int(255 * a),))
            else:
                draw(sd, (x, yy + 3), s, f, (0, 0, 0, int(230 * a)))
                draw(d, (x, yy), s, f, (250, 247, 236, int(255 * a)))

    def _r_mono(self, t, k, L, ch, c0, d, sd, img):
        f = self.f; a = min(1.0, (t - c0) / 0.1); pad = 26
        x0 = min(x for x, _ in L["widths"]); x1 = max(x + w for x, w in L["widths"])
        y0 = self.y - pad; y1 = self.y + L["lh"] * len(L["lines"]) - L["lh"] + f.size + pad + 8
        d.rounded_rectangle([x0 - pad - 10, y0, x1 + pad + 30, y1], 16, fill=(12, 12, 12, int(225 * a)), outline=(255, 255, 255, int(60 * a)), width=2)
        last = None
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            s = self.txt(w); n = len(s); vis = n if t >= w["e"] else max(1, int(n * (t - w["s"] + 0.05) / max(0.05, w["e"] - w["s"])))
            draw(d, (x, y), s[:vis], f, (LIME if w["hl"] else WHITE) + (255,)); last = (x + text_w(d, s[:vis], f), y)
        if last and int(t * 2.5) % 2 == 0:
            d.rectangle([last[0] + 6, last[1] + 6, last[0] + 6 + f.size * 0.5, last[1] + f.size * 1.05], fill=LIME + (255,))

    def _r_outline(self, t, k, L, ch, c0, d, sd, img):
        for i, w, x, y, tw in self._word_iter(t, L, ch):
            act = w["s"] - 0.05 <= t < w["e"] + 0.08
            p, sc = self._pop(t, w["s"] - 0.05, 0.12, 0.18); f = F(self.cfg["font"], max(8, int(self.cfg["size"] * sc)))
            s = self.txt(w); ww = text_w(d, s, f); xx = x + tw / 2 - ww / 2; yy = y + (self.cfg["size"] - f.size) * 0.5
            if act or w["hl"]:
                draw(sd, (xx, yy + 6), s, f, (0, 0, 0, 230)); draw(d, (xx, yy), s, f, (YELLOW if w["hl"] and not act else WHITE) + (255,))
            else:
                m1 = Image.new("L", (self.W, self.H), 0); m2 = Image.new("L", (self.W, self.H), 0)
                draw(ImageDraw.Draw(m1), (xx, yy), s, f, 255, stroke_width=4, stroke_fill=255); draw(ImageDraw.Draw(m2), (xx, yy), s, f, 255)
                m = np.clip(np.asarray(m1, np.int16) - np.asarray(m2, np.int16), 0, 255).astype(np.uint8)
                lay = np.zeros((self.H, self.W, 4), np.uint8); lay[..., :3] = 255; lay[..., 3] = m
                img.alpha_composite(Image.fromarray(lay)); draw(sd, (xx, yy + 4), s, f, (0, 0, 0, 120))

    def _r_ig(self, t, k, L, ch, c0, d, sd, img):
        p, sc = self._pop(t, c0, 0.16, 0.12); f = self.f; pad = 24; asc, desc = f.getmetrics()
        lay = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
        for li, (x, w) in enumerate(L["widths"]):
            y = self.y + li * L["lh"]
            ld.rounded_rectangle([x - pad, y - 14, x + w + pad, y + asc + desc + 4], 20, fill=(255, 255, 255, 255))
        for i, w, x, y, tw in self._word_iter(t, L, ch, True):
            draw(ld, (x, y - 4), self.txt(w), f, ((214, 40, 120) if w["hl"] else INK) + (255,))
        if abs(sc - 1) > 1e-3:
            cx, cy = self.W / 2, self.y + L["lh"] * len(L["lines"]) / 2
            lay = lay.transform(lay.size, Image.AFFINE, (1 / sc, 0, cx - cx / sc, 0, 1 / sc, cy - cy / sc), resample=Image.BILINEAR)
        img.alpha_composite(lay)


# ------------------------------------------------------------------ headline / text blocks
def text_block(W, H, lines, y, font="Poppins-Black", size=110, color=WHITE, anim=1.0, stroke=0, box=None, box_pad=22,
               shadow=True, align="center", x=80, lh=1.08, wght=None, upper=False, highlight=None):
    """lines: list of str or list of (str, color, boxcolor). anim 0..1 slide/fade-in."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img); sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    a = max(0.0, min(1.0, anim)); e = 1 - (1 - a) ** 3; dy = int((1 - e) * 40); al = int(255 * min(1, a * 1.5))
    f = F(font, size, wght); asc, desc = f.getmetrics(); cy = y + dy
    for ln in lines:
        segs = [(ln, color, box)] if isinstance(ln, str) else ([ln] if isinstance(ln, tuple) else ln)
        segs = [(s.upper() if upper else s, c, b) for s, c, b in segs]
        widths = [text_w(d, s, f) for s, _, _ in segs]; gap = size * 0.28
        tot = sum(widths) + gap * (len(segs) - 1) + sum(2 * box_pad for _, _, b in segs if b)
        cx = (W - tot) / 2 if align == "center" else x
        for (s, c, b), w in zip(segs, widths):
            if b:
                d.rectangle([cx, cy + size * 0.06, cx + w + 2 * box_pad, cy + asc + desc * 0.55], fill=tuple(b[:3]) + (al,)); cx += box_pad
            elif shadow: draw(sd, (cx, cy + 6), s, f, (0, 0, 0, int(al * 0.9)))
            draw(d, (cx, cy), s, f, tuple(c[:3]) + (al,), **({"stroke_width": stroke, "stroke_fill": (0, 0, 0, al)} if stroke else {}))
            cx += w + gap + (box_pad if b else 0)
        cy += int(size * lh)
    if shadow:
        a2 = np.asarray(sh).copy(); a2[..., 3] = cv2.GaussianBlur(a2[..., 3], (0, 0), 10); base = Image.fromarray(a2); base.alpha_composite(img); return base
    return img


def ease(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3


# ------------------------------------------------------------------ CTA button / stickers
def cta_button(text, font="Poppins-ExtraBold", size=50, bg=YELLOW, fg=INK, pad=(54, 30), radius=None, arrow=True, outline=None):
    f = F(font, size); d0 = ImageDraw.Draw(Image.new("L", (4, 4))); s = text; fa = F("Inter", size, 800)
    aw = d0.textlength("  →", font=fa) if arrow else 0
    w = int(text_w(d0, s, f) + aw + 2 * pad[0]); h = int(size * 1.25 + 2 * pad[1] - 10)
    im = Image.new("RGBA", (w + 10, h + 10), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    r = radius if radius is not None else h // 2
    d.rounded_rectangle([8, 8, w + 8, h + 8], r, fill=(0, 0, 0, 120))
    d.rounded_rectangle([0, 0, w, h], r, fill=bg + (255,), outline=(outline + (255,)) if outline else None, width=3 if outline else 0)
    draw(d, (pad[0], (h - size * 1.25) / 2 + 2), s, f, fg + (255,))
    if arrow: d.text((pad[0] + text_w(d, s, f), (h - size * 1.25) / 2 - 2), "  →", font=fa, fill=fg + (255,))
    return im


def pulse(t, period=1.1, amp=0.04): return 1 + amp * (0.5 + 0.5 * math.sin(2 * math.pi * t / period))


def scale_img(im, s):
    if abs(s - 1) < 1e-3: return im
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BICUBIC)


# ------------------------------------------------------------------ end cards
def thumbs_from(specs, w=460, h=620):
    return [frame_at(src, t, w, h, fx) for src, t, fx in specs]


def end_dark(W, H, k, thumbs, headline=("Make ads like this.", "With AI."), price="₹2,999", sub="11 modules · 41 lessons · lifetime access",
             cta="Enroll now", accent=YELLOW, bgframe=None, kicker="AI & ADVERTISING · ONLINE COURSE"):
    """dark end card: optional blurred video bg, logo, big headline, thumb strip, price + CTA"""
    if bgframe is not None:
        bg = cv2.GaussianBlur(bgframe, (0, 0), 22).astype(np.float32) * 0.32; im = Image.fromarray(bg.astype(np.uint8)).convert("RGBA")
    else: im = Image.new("RGBA", (W, H), (12, 12, 12, 255))
    d = ImageDraw.Draw(im); tall = H > W * 1.5
    top = int(H * (0.10 if tall else 0.06))
    b = badge("white", 46); im.alpha_composite(b, ((W - b.width) // 2, top))
    f = F("JetBrainsMono", 30, 600); d.text(((W - d.textlength(kicker, font=f)) / 2, top + 84), kicker, font=f, fill=(200, 200, 200, 255))
    y = top + 150; fs = 112 if tall else 96
    for i, ln in enumerate(headline):
        a = ease((k - 0.05 - 0.08 * i) / 0.35); fh = F("Poppins-Black", fs); w = text_w(d, ln, fh)
        if w > W - 100: fh = F("Poppins-Black", int(fs * (W - 100) / w)); w = text_w(d, ln, fh)
        col = accent if i == len(headline) - 1 else WHITE
        draw(d, ((W - w) / 2, y + 30 * (1 - a)), ln, fh, col + (int(255 * a),)); y += int(fs * 1.12)
    y += 30
    if thumbs:
        n = len(thumbs); tw = int((W - 120 - (n - 1) * 18) / n); th = int(tw * (1.42 if tall else 1.2))
        for i, tb in enumerate(thumbs):
            a = ease((k - 0.3 - 0.07 * i) / 0.4)
            c = rounded(Image.fromarray(cv2.resize(tb, (tw, th), interpolation=cv2.INTER_AREA)), 18)
            if a > 0: c.putalpha(Image.fromarray((np.asarray(c)[..., 3] * a).astype(np.uint8))); im.alpha_composite(c, (60 + i * (tw + 18), int(y + 40 * (1 - a))))
        y += th + 50
    f = F("Poppins-Black", 120 if tall else 96); a = ease((k - 0.55) / 0.3)
    pw = text_w(d, price, f); draw(d, ((W - pw) / 2, y), price, f, WHITE + (int(255 * a),)); y += int(f.size * 1.2)
    f = F("Inter", 34, 500); w = text_w(d, sub, f); draw(d, ((W - w) / 2, y), sub, f, (210, 210, 210, int(255 * a))); y += 74
    btn = scale_img(cta_button(cta, bg=accent), pulse(k) * ease((k - 0.7) / 0.25) if k > 0.7 else 0.01)
    im.alpha_composite(btn, ((W - btn.width) // 2, int(y + (110 - btn.height) / 2)))
    y += 150; f = F("Inter", 30, 500); s = "community.ideabrostudio.com"; d.text(((W - d.textlength(s, font=f)) / 2, y), s, font=f, fill=(160, 160, 160, 255))
    return np.asarray(im.convert("RGB"))


def end_yellow(W, H, k, thumbs, headline=("Your next ad", "doesn't need", "a shoot."), price="₹2,999", sub="Lifetime access · 41 lessons", cta="Enroll now"):
    im = Image.new("RGBA", (W, H), YELLOW + (255,)); d = ImageDraw.Draw(im); tall = H > W * 1.5
    top = int(H * (0.09 if tall else 0.05)); b = badge("black", 46); im.alpha_composite(b, ((W - b.width) // 2, top))
    y = top + 120; fs = 128 if tall else 104
    for i, ln in enumerate(headline):
        a = ease((k - 0.05 - 0.08 * i) / 0.3); fh = F("Anton-Regular", fs); s = ln.upper(); w = text_w(d, s, fh)
        if w > W - 100: fh = F("Anton-Regular", int(fs * (W - 100) / w)); w = text_w(d, s, fh)
        draw(d, ((W - w) / 2, y + 30 * (1 - a)), s, fh, INK + (int(255 * a),)); y += int(fs * 1.08)
    y += 30
    if thumbs:
        n = len(thumbs); tw = int((W - 140 - (n - 1) * 20) / n); th = int(tw * (1.35 if tall else 1.1))
        for i, tb in enumerate(thumbs):
            a = ease((k - 0.3 - 0.07 * i) / 0.4); c = Image.fromarray(cv2.resize(tb, (tw, th), interpolation=cv2.INTER_AREA)).convert("RGBA")
            fr = Image.new("RGBA", (tw + 12, th + 12), INK + (255,)); fr.alpha_composite(c, (6, 6)); fr = fr.rotate((i - (n - 1) / 2) * -4, expand=True, resample=Image.BICUBIC)
            if a > 0: im.alpha_composite(fr, (70 + i * (tw + 20) - 6, int(y + 50 * (1 - a))))
        y += th + 70
    f = F("Poppins-Black", 96); a = ease((k - 0.55) / 0.3); s = f"Only {price}"; w = text_w(d, s, f); draw(d, ((W - w) / 2, y), s, f, INK + (int(255 * a),)); y += 118
    f = F("Poppins-SemiBold", 36); w = text_w(d, sub, f); draw(d, ((W - w) / 2, y), sub, f, INK + (255,)); y += 80
    btn = scale_img(cta_button(cta, bg=INK, fg=YELLOW), pulse(k) * ease((k - 0.7) / 0.25) if k > 0.7 else 0.01)
    im.alpha_composite(btn, ((W - btn.width) // 2, int(y + (110 - btn.height) / 2)))
    y += 150; f = F("Inter", 30, 600); s = "community.ideabrostudio.com"; d.text(((W - d.textlength(s, font=f)) / 2, y), s, font=f, fill=INK + (255,))
    return np.asarray(im.convert("RGB"))


def end_cream(W, H, k, thumbs, **kw):
    f = K.endcard_frame(W, H, k, thumbs, **kw)
    return f


def end_over_video(frame, k, headline=("Learn to make", "ads like this."), cta="Enroll now · ₹2,999", sub="AI & Advertising · 11 modules · lifetime access",
                   accent=YELLOW, y_frac=0.56):
    """CTA panel over a darkened, still-moving clip"""
    H, W = frame.shape[:2]; f = (frame.astype(np.float32) * (1 - 0.45 * ease(k / 0.4))).astype(np.uint8)
    f = put_badge(f, "white", int(H * 0.08))
    lay = text_block(W, H, list(headline), int(H * y_frac) - 240, "Poppins-Black", 100 if H > W * 1.5 else 86, WHITE, anim=k / 0.4)
    f = over(f, lay)
    btn = scale_img(cta_button(cta, bg=accent), pulse(k) * ease((k - 0.35) / 0.25) if k > 0.35 else 0.01)
    f = over(f, btn, ((W - btn.width) // 2, int(H * y_frac) + 20))
    s = text_block(W, H, [sub], int(H * y_frac) + 180, "Inter", 34, (230, 230, 230), anim=(k - 0.5) / 0.3, wght=500)
    return over(f, s)


# ------------------------------------------------------------------ phone screen-scroll (course page capture)
@functools.lru_cache(None)
def page_img(name="mobile"):
    return np.asarray(Image.open(A("screen", f"course_{name}_full.png")).convert("RGB"))


def phone_frame(W, H, y_scroll, bg, scale=0.78, cy=0.5, tilt=0.0, page="mobile"):
    """render a phone showing the course page at scroll y (in page px) over background frame bg"""
    pg = page_img(page); pw = pg.shape[1]; ph_view = int(pw * 2.06)
    y = int(max(0, min(pg.shape[0] - ph_view, y_scroll))); view = pg[y:y + ph_view]
    sw = int(W * scale); sh = int(sw * ph_view / pw); scr = cv2.resize(view, (sw, sh), interpolation=cv2.INTER_AREA)
    bez = 18; body = Image.new("RGBA", (sw + 2 * bez, sh + 2 * bez), (0, 0, 0, 0)); bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, body.width - 1, body.height - 1], 70, fill=(14, 14, 16, 255), outline=(70, 70, 76, 255), width=3)
    body.alpha_composite(rounded(Image.fromarray(scr), 54), (bez, bez))
    bd.rounded_rectangle([body.width / 2 - 70, bez + 16, body.width / 2 + 70, bez + 52], 18, fill=(0, 0, 0, 255))
    if tilt: body = body.rotate(tilt, expand=True, resample=Image.BICUBIC)
    out = over(bg, shadow_of(body, 30, 0.7, (0, 0)), ((W - body.width) // 2, int(H * cy - body.height / 2) + 30))
    return over(out, body, ((W - body.width) // 2, int(H * cy - body.height / 2)))


# ------------------------------------------------------------------ prompt UI
def prompt_ui(W, H, text, chars, state="typing", k=0.0, y=None, label="PROMPT"):
    """dark glass prompt box with typed text. state: typing | generating (shimmer bar k 0..1)"""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    bw = W - 120; x0 = 60; f = F("JetBrainsMono", 44, 500)
    # wrap
    words = text.split(); lines, cur = [], ""
    for w in words:
        if d.textlength((cur + " " + w).strip(), font=f) > bw - 80: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    lines.append(cur)
    bh = 150 + len(lines) * 62 + 90; y0 = y if y is not None else (H - bh) // 2
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], 34, fill=(18, 18, 22, 236), outline=(255, 255, 255, 50), width=2)
    fl = F("JetBrainsMono", 30, 700); d.text((x0 + 40, y0 + 34), "✦ " + label if False else label, font=fl, fill=LIME + (255,))
    d.ellipse([x0 + bw - 70, y0 + 36, x0 + bw - 46, y0 + 60], fill=(255, 95, 86, 255))
    shown = chars; yy = y0 + 100; last = (x0 + 40, yy)
    for ln in lines:
        s = ln[:max(0, shown)]; shown -= len(ln) + 1
        d.text((x0 + 40, yy), s, font=f, fill=(240, 240, 240, 255)); last = (x0 + 40 + d.textlength(s, font=f), yy)
        if shown < 0: break
        yy += 62
    if state == "typing" and int(k * 3) % 2 == 0:
        d.rectangle([last[0] + 6, last[1] + 6, last[0] + 30, last[1] + 52], fill=LIME + (255,))
    # bottom bar: generate button / shimmer
    by = y0 + bh - 74
    if state == "generating":
        d.rounded_rectangle([x0 + 40, by, x0 + bw - 40, by + 26], 13, fill=(255, 255, 255, 30))
        d.rounded_rectangle([x0 + 40, by, x0 + 40 + (bw - 80) * ease(k), by + 26], 13, fill=LIME + (255,))
        d.text((x0 + 40, by - 50), "generating…", font=F("JetBrainsMono", 30, 500), fill=(200, 200, 200, 255))
    else:
        fb_ = F("Poppins-SemiBold", 32); s = "Generate  ↵"; w = d.textlength(s, font=fb_)
        d.rounded_rectangle([x0 + bw - w - 100, by - 14, x0 + bw - 40, by + 46], 30, fill=LIME + (255,))
        d.text((x0 + bw - w - 70, by - 8), s, font=fb_, fill=INK + (255,))
    return img


# ------------------------------------------------------------------ render pipeline
class Seg:
    def __init__(self, t0, t1, make, fx=None, post=None):
        self.t0, self.t1, self.make, self.fx, self.post = t0, t1, make, fx, post


def render(out_path, W, H, segs, overlays=(), audio=None, tmp_tag=None):
    """segs: list of Seg(t0, t1, make(dur)->frame generator, fx, post(frame,t,local_t)->frame)
    overlays: list of fn(frame, t) -> frame. audio: dict for K.mix_audio (minus out_wav/dur)."""
    segs = sorted(segs, key=lambda s: s.t0); dur = segs[-1].t1; n = int(round(dur * FPS))
    tag = tmp_tag or os.path.splitext(os.path.basename(out_path))[0]
    tmpv = os.path.join(os.path.dirname(out_path), f"_{tag}_v.mp4"); tmpa = os.path.join(os.path.dirname(out_path), f"_{tag}_a.wav")

    def frames():
        si = -1; gen = None; li = 0; prev = None; last = None
        for fi in range(n):
            t = fi / FPS
            while si + 1 < len(segs) and t >= segs[si + 1].t0 - 1e-6:
                si += 1; s = segs[si]; gen = s.make(s.t1 - s.t0); li = 0; prev = last
            s = segs[si]
            try: f = next(gen)
            except StopIteration: f = last
            f = np.ascontiguousarray(f)
            if s.fx: f = fx_apply(s.fx, f, li, prev)
            if s.post: f = s.post(f, t, t - s.t0)
            last = f
            for ov in overlays: f = ov(f, t)
            li += 1
            yield f
    nfr = K.write_video(tmpv, frames(), W, H)
    if audio:
        K.mix_audio(tmpa, dur, **audio); K.mux(tmpv, tmpa, out_path); os.remove(tmpa)
    else:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmpv, "-c", "copy", "-movflags", "+faststart", out_path], check=True)
    os.remove(tmpv)
    return nfr, dur


def contact_sheet(video, out_jpg, times, w=270):
    cap = cv2.VideoCapture(video); tiles = []
    for t in times:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, im = cap.read()
        if ok:
            s = w / im.shape[1]; im = cv2.resize(im, (w, int(im.shape[0] * s))); cv2.putText(im, f"{t:.1f}", (6, 22), 0, 0.7, (0, 255, 255), 2); tiles.append(im)
    cap.release(); rows = [np.hstack(tiles[i:i + 8] + [np.zeros_like(tiles[0])] * (8 - len(tiles[i:i + 8]))) for i in range(0, len(tiles), 8)]
    cv2.imwrite(out_jpg, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 80])
