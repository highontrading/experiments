"""adkit: tiny compositor for Meta ad videos in the Ideabro Studio site style.
Shots (full-bleed / 2-up stack / 4-up grid) from any video, brand text overlays, an animated end card,
and an ffmpeg audio mix (music + VO + SFX, loudness-normalised)."""
import os, subprocess, math, functools, json
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONTS = os.path.join(ROOT, "assets", "fonts")
FPS = 30
CREAM, GRID, INK = (241, 239, 230), (226, 222, 209), (20, 20, 20)
PINK, LIME, WHITE = (246, 184, 234), (216, 245, 162), (255, 255, 255)


@functools.lru_cache(None)
def font(name, px):
    f = ImageFont.truetype(os.path.join(FONTS, name), px)
    if name.startswith(("JetBrains", "Inter")):
        try: f.set_variation_by_axes([700] if name.startswith("JetBrains") else [14, 700])
        except Exception: pass
    return f


def serif(px): return font("InstrumentSerif-Regular.ttf", px)
def inter(px): return font("Inter.ttf", px)


@functools.lru_cache(None)
def inter_light(px):
    f = ImageFont.truetype(os.path.join(FONTS, "Inter.ttf"), px)
    try: f.set_variation_by_axes([32, 250])
    except Exception: pass
    return f


def rupee_font(f):
    return inter_light(int(f.size * 0.78)) if "Serif" in f.path else inter(f.size)


def draw_text(d, xy, txt, f, fill):
    """draw text, rendering the rupee sign with Inter (the brand fonts lack it). Returns width."""
    x, y = xy
    parts = txt.split("₹")
    for i, part in enumerate(parts):
        if i:
            fi = rupee_font(f)
            d.text((x, y + (int(f.size * 0.16) if "Serif" in f.path else 0)), "₹", font=fi, fill=fill); x += d.textlength("₹", font=fi)
        d.text((x, y), part, font=f, fill=fill); x += d.textlength(part, font=f)
    return x - xy[0]


def tlen(d, txt, f):
    parts = txt.split("₹"); w = sum(d.textlength(p, font=f) for p in parts)
    if len(parts) > 1: w += (len(parts) - 1) * d.textlength("₹", font=rupee_font(f))
    return w
def serif_i(px): return font("InstrumentSerif-Italic.ttf", px)
def mono(px): return font("JetBrainsMono.ttf", px)


# ------------------------------------------------------------------ video decode
def decode(src, t, dur, W, H, fx=0.5, fy=0.5, zoom=1.0):
    """Return frames (n,H,W,3) uint8 covering WxH from src starting at t, with crop focus (fx,fy)."""
    n = max(1, int(round(dur * FPS)))
    cap = cv2.VideoCapture(src); sw, sh = cap.get(3), cap.get(4); cap.release()
    s = max(W / sw, H / sh) * zoom
    cw, ch = W / s, H / s
    x0 = max(0, min(sw - cw, fx * sw - cw / 2)); y0 = max(0, min(sh - ch, fy * sh - ch / 2))
    vf = f"crop={int(cw)}:{int(ch)}:{int(x0)}:{int(y0)},scale={W}:{H}:flags=lanczos,fps={FPS},format=rgb24"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", src, "-t", f"{dur + 0.2:.3f}", "-vf", vf,
                          "-frames:v", str(n), "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    if len(a) < n: a = np.concatenate([a, np.repeat(a[-1:], n - len(a), 0)])
    return a


def push(frames, z0=1.0, z1=1.06):
    """slow push-in across a shot"""
    n, H, W, _ = frames.shape; out = np.empty_like(frames)
    for i in range(n):
        z = z0 + (z1 - z0) * i / max(1, n - 1)
        M = np.array([[z, 0, W / 2 * (1 - z)], [0, z, H / 2 * (1 - z)]], np.float32)
        out[i] = cv2.warpAffine(frames[i], M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return out


def grade(frames, contrast=1.06, sat=1.06):
    x = frames.astype(np.float32)
    g = x.mean(axis=3, keepdims=True)
    x = g + (x - g) * sat
    x = (x - 128) * contrast + 128
    return np.clip(x, 0, 255).astype(np.uint8)


def shot_full(W, H, src, t, dur, fx=0.5, fy=0.5, z=(1.0, 1.06)):
    return grade(push(decode(src, t, dur, W, H, fx, fy), *z))


def shot_stack(W, H, a, b, dur, gap=8, bg=(10, 10, 10)):
    """a, b = (src, t, fx). Two horizontal tiles stacked, full width."""
    th = (H - gap) // 2
    A = grade(push(decode(a[0], a[1], dur, W, th, a[2]), 1.0, 1.05))
    B = grade(push(decode(b[0], b[1], dur, W, th, b[2]), 1.05, 1.0))
    out = np.empty((len(A), H, W, 3), np.uint8); out[:] = bg
    out[:, :th] = A; out[:, th + gap:th + gap + th] = B[:, :H - th - gap]
    return out


def shot_grid(W, H, tiles, dur, gap=8, bg=(10, 10, 10)):
    """tiles = 4 x (src, t, fx) in a 2x2 grid"""
    tw, th = (W - gap) // 2, (H - gap) // 2
    out = np.empty((int(round(dur * FPS)), H, W, 3), np.uint8); out[:] = bg
    for k, (src, t, fx) in enumerate(tiles):
        f = grade(push(decode(src, t, dur, tw, th, fx), 1.0, 1.06))
        r, c = divmod(k, 2); y, x = r * (th + gap), c * (tw + gap)
        out[:len(f), y:y + th, x:x + tw] = f[:len(out)]
    return out


# ------------------------------------------------------------------ text
def text_layer(W, H, lines, y, anim=1.0, align="center", shadow=True, size=150, msize=46):
    """lines: list of lists of (text, style). styles: w (white on ink box) | pink | lime (ink on colour box) |
    plain (white, shadow only) | mono (white mono on ink box). Returns RGBA PIL image; anim 0..1 = slide-up/fade."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    a = max(0.0, min(1.0, anim)); e = 1 - (1 - a) ** 3; dy = int((1 - e) * 46); alpha = int(255 * min(1, a * 1.6))
    cy = y + dy
    for line in lines:
        segs = []
        for txt, st in line:
            f = mono(msize) if st == "mono" else serif(size)
            segs.append((txt, st, f, tlen(d, txt, f)))
        pad = 22 if segs[0][1] != "mono" else 20
        total = sum(w + 2 * pad for _, _, _, w in segs) + 10 * (len(segs) - 1)
        x = (W - total) / 2 if align == "center" else 90
        f0 = segs[0][2]; asc, desc = f0.getmetrics()
        bh = int(asc + desc * 0.35) if segs[0][1] != "mono" else int(asc + desc + 18)
        for txt, st, f, w in segs:
            box = {"pink": PINK, "lime": LIME, "w": INK, "mono": INK}.get(st)
            fill = INK if st in ("pink", "lime") else WHITE
            if box is not None:
                ba = alpha if st in ("pink", "lime") else int(alpha * 0.88)
                d.rectangle([x, cy, x + w + 2 * pad, cy + bh], fill=box + (ba,))
            elif shadow:
                sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x + pad, cy), txt, font=f, fill=(0, 0, 0, int(alpha * 0.85)))
                img = Image.alpha_composite(img, sh_blur(sh)); d = ImageDraw.Draw(img)
            ty = cy + (8 if st == "mono" else -int(desc * 0.05))
            draw_text(d, (x + pad, ty), txt, f, fill + (alpha,)); x += w + 2 * pad + 10
        cy += bh + 4
    return img


def st_size(st): return 124


def sh_blur(im):
    a = np.asarray(im).copy(); a[..., 3] = cv2.GaussianBlur(a[..., 3], (0, 0), 9); return Image.fromarray(a)


def over(frame, layer):
    """alpha-composite RGBA PIL layer onto RGB uint8 frame"""
    L = np.asarray(layer, np.float32); a = L[..., 3:4] / 255.0
    return (frame.astype(np.float32) * (1 - a) + L[..., :3] * a).astype(np.uint8)


def scrim(frame, top=0.0, bottom=0.0, mid=None, strength=0.55):
    """darken top/bottom gradients (and optional band around mid y) for legibility"""
    H = frame.shape[0]; y = np.linspace(0, 1, H)[:, None, None]
    m = np.ones_like(y)
    if top: m = m * (1 - strength * np.clip(1 - y / top, 0, 1))
    if bottom: m = m * (1 - strength * np.clip((y - (1 - bottom)) / bottom, 0, 1))
    if mid is not None:
        c, w = mid; m = m * (1 - strength * np.exp(-((y - c) / w) ** 2))
    return (frame.astype(np.float32) * m).astype(np.uint8)


# ------------------------------------------------------------------ end card
def paper(W, H):
    im = Image.new("RGB", (W, H), CREAM); d = ImageDraw.Draw(im)
    for x in range(0, W, 36): d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H, 36): d.line([(0, y), (W, y)], fill=GRID, width=1)
    return im


def endcard_frame(W, H, k, thumbs, headline=("Shoot-quality ads,", "without the shoot."), hl="Learn AI Advertising.",
                  sub="11 modules · 41 lessons · lifetime access", cta="Enroll now · ₹2,999  →"):
    """k = seconds since card start. thumbs: list of RGB numpy images for the card fan."""
    im = paper(W, H); d = ImageDraw.Draw(im)
    e = lambda t0, dur=0.35: max(0.0, min(1.0, (k - t0) / dur))
    ease = lambda x: 1 - (1 - x) ** 3
    top = int(H * 0.15) if H > W * 1.5 else int(H * 0.07)
    # brand line
    f = mono(36); t = "IDEABRO STUDIO  ·  COURSE"
    d.text(((W - d.textlength(t, font=f)) / 2, top), t, font=f, fill=INK)
    # headline
    hy = top + 90; fs = 134 if H > W * 1.5 else 118
    for i, ln in enumerate(headline):
        a = ease(e(0.05 + 0.08 * i)); f = serif(fs); w = d.textlength(ln, font=f)
        d.text(((W - w) / 2, hy + int((1 - a) * 30)), ln, font=f, fill=tuple(int(c * a + 241 * (1 - a)) for c in INK))
        hy += int(fs * 0.98)
    a = ease(e(0.25)); f = serif(fs); w = d.textlength(hl, font=f); pad = 20
    x0 = (W - w) / 2 - pad; asc, desc = f.getmetrics()
    d.rectangle([x0, hy + 8, x0 + (w + 2 * pad) * a, hy + asc + desc * 0.6], fill=PINK)
    d.text(((W - w) / 2, hy), hl, font=f, fill=INK); hy += int(fs * 1.25)
    # thumbnail fan
    if thumbs:
        tw, th = (320, 430) if H > W * 1.5 else (250, 330)
        cx, cy = W / 2, hy + th / 2 + 20; n = len(thumbs)
        for i, tb in enumerate(thumbs):
            a = ease(e(0.35 + 0.07 * i, 0.4))
            ang = (i - (n - 1) / 2) * 9; off = (i - (n - 1) / 2) * (tw * 0.72)
            card = Image.fromarray(cv2.resize(tb, (tw, th), interpolation=cv2.INTER_AREA)).convert("RGBA")
            m = Image.new("L", (tw, th), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, tw - 1, th - 1], 22, fill=255); card.putalpha(m)
            border = Image.new("RGBA", (tw + 8, th + 8), (0, 0, 0, 0)); ImageDraw.Draw(border).rounded_rectangle([0, 0, tw + 7, th + 7], 26, fill=INK + (255,))
            border.alpha_composite(card, (4, 4)); r = border.rotate(-ang, expand=True, resample=Image.BICUBIC)
            yy = cy + abs(i - (n - 1) / 2) * 14 + (1 - a) * 60 - r.height / 2
            if a > 0: im.paste(r, (int(cx + off - r.width / 2), int(yy)), r)
        hy = int(cy + th / 2 + 70)
    # sub + CTA
    f = mono(38); w = d.textlength(sub, font=f); d.text(((W - w) / 2, hy), sub, font=f, fill=INK); hy += 84
    a = ease(e(0.6, 0.3)); f = mono(52); w = tlen(d, cta, f)
    bw, bh = w + 96, 124; bx = (W - bw) / 2; by = hy + (1 - a) * 20
    d.rounded_rectangle([bx + 8, by + 8, bx + bw + 8, by + bh + 8], 14, fill=(80, 70, 140))
    d.rounded_rectangle([bx, by, bx + bw, by + bh], 14, fill=LIME, outline=INK, width=3)
    draw_text(d, (bx + 48, by + (bh - 64) / 2), cta, f, INK)
    hy = by + bh + 50
    f = mono(34); t = "community.ideabrostudio.com"; d.text(((W - d.textlength(t, font=f)) / 2, hy), t, font=f, fill=(90, 90, 90))
    return np.asarray(im)


# ------------------------------------------------------------------ assembly
def write_video(path, frames_iter, W, H):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    n = 0
    for fr in frames_iter: p.stdin.write(np.ascontiguousarray(fr).tobytes()); n += 1
    p.stdin.close(); p.wait(); return n


def mix_audio(out_wav, dur, music=None, vo=None, sfx=(), music_gain=-6, vo_gain=0, duck=-8):
    """music=(path, offset, fade_in, fade_out); vo=(path, start); sfx=[(path, t, gain_db)]"""
    inputs, filt, labels = [], [], []
    if music:
        p, off, fi, fo = music
        inputs += ["-ss", f"{off:.3f}", "-t", f"{dur:.3f}", "-i", p]
        filt.append(f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={music_gain}dB,"
                    f"afade=t=in:d={fi},afade=t=out:st={dur - fo:.3f}:d={fo}[m]")
    k = 1 if music else 0
    if vo:
        inputs += ["-i", vo[0]]; filt.append(f"[{k}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={vo_gain}dB,adelay={int(vo[1]*1000)}|{int(vo[1]*1000)},apad[v]"); k += 1
    for i, (p, t, g) in enumerate(sfx):
        inputs += ["-i", p]; filt.append(f"[{k}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,adelay={int(t*1000)}|{int(t*1000)},apad[s{i}]"); labels.append(f"[s{i}]"); k += 1
    if music and vo:
        filt.append("[v]asplit=2[v1][v2]")
        filt.append(f"[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350:makeup=1[md]")
        mixl = "[md][v1]" + "".join(labels)
    else:
        mixl = ("[m]" if music else "") + ("[v]" if vo else "") + "".join(labels)
    n = mixl.count("[")
    filt.append(f"{mixl}amix=inputs={n}:normalize=0:duration=longest,atrim=0:{dur:.3f},loudnorm=I=-14:TP=-1.2:LRA=9[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ar", "44100", out_wav], check=True)


def mux(video, audio, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out], check=True)


# ------------------------------------------------------------------ kinetic captions (white theme)
@functools.lru_cache(None)
def cap_font(px):
    f = ImageFont.truetype(os.path.join(FONTS, "Inter.ttf"), px)
    try: f.set_variation_by_axes([32, 800])
    except Exception: pass
    return f


def vo_words(alignment_json, offset=0.0):
    a = json.load(open(alignment_json)); out = []; cur = ""; s = e = None
    for c, a0, a1 in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if c.isalnum() or c == "'":
            if s is None: s = a0
            cur += c; e = a1
        elif cur: out.append((cur, s + offset, e + offset)); cur = ""; s = None
    if cur: out.append((cur, s + offset, e + offset))
    return out


class Captions:
    """Word-by-word kinetic captions. chunks: list of lists of word indices shown together.
    Words appear as spoken (pop-in), the active word sits on a white pill in black, the rest are white."""

    def __init__(self, W, H, words, chunks, y=1330, size=104, hold=0.45, maxw=960):
        self.W, self.H, self.words, self.chunks, self.y, self.size, self.hold, self.maxw = W, H, words, chunks, y, size, hold, maxw
        self.f = cap_font(size); d = ImageDraw.Draw(Image.new("L", (8, 8)))
        self.space = max(d.textlength(" ", font=self.f), size * 0.42); self.layouts = []
        for ch in chunks:      # lay out each chunk on 1–2 centred lines
            ws = [(i, words[i][0], d.textlength(words[i][0], font=self.f)) for i in ch]
            lines, cur, cw = [], [], 0
            for i, w, tw in ws:
                if cur and cw + self.space + tw > maxw: lines.append(cur); cur, cw = [], 0
                cur.append((i, w, tw)); cw += (self.space if len(cur) > 1 else 0) + tw
            lines.append(cur)
            pos = {}; lh = int(size * 1.18)
            for li, ln in enumerate(lines):
                tot = sum(tw for _, _, tw in ln) + self.space * (len(ln) - 1); x = (W - tot) / 2
                for i, w, tw in ln: pos[i] = (x, y + li * lh, tw); x += tw + self.space
            self.layouts.append(pos)

    def chunk_at(self, t):
        for k, ch in enumerate(self.chunks):
            start = self.words[ch[0]][1] - 0.04
            nxt = self.words[self.chunks[k + 1][0]][1] - 0.04 if k + 1 < len(self.chunks) else 1e9
            end = min(nxt, self.words[ch[-1]][2] + self.hold)
            if start <= t < end: return k
        return None

    def layer(self, t):
        img = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0)); k = self.chunk_at(t)
        if k is None: return None
        shadow = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow); d = ImageDraw.Draw(img)
        for i in self.chunks[k]:
            w, s, e = self.words[i]
            if t < s - 0.04: continue
            x, y, tw = self.layouts[k][i]
            age = t - (s - 0.04); p = min(1.0, age / 0.14)
            sc = 1.0 + 0.14 * (1 - p) ** 2 - 0.03 * math.sin(p * math.pi)       # pop-in with a little overshoot
            fs = max(8, int(self.size * sc)); f = cap_font(fs)
            wtw = d.textlength(w, font=f); cx = x + tw / 2; xx = cx - wtw / 2; yy = y + (self.size - fs) * 0.55 - 8 * (1 - p)
            active = s - 0.04 <= t < e + 0.06
            if active:
                pad = 14; asc, desc = f.getmetrics()
                d.rounded_rectangle([xx - pad, yy + fs * 0.08, xx + wtw + pad, yy + asc + desc * 0.55], radius=int(fs * 0.22), fill=(255, 255, 255, 255))
                d.text((xx, yy), w, font=f, fill=(15, 15, 15, 255))
            else:
                sd.text((xx, yy + 4), w, font=f, fill=(0, 0, 0, 200))
                d.text((xx, yy), w, font=f, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0, 110))
        a = np.asarray(shadow).copy(); a[..., 3] = cv2.GaussianBlur(a[..., 3], (0, 0), 7)
        base = Image.fromarray(a); base.alpha_composite(img)
        return base
