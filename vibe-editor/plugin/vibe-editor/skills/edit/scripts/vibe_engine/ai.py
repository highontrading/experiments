"""AI person segmentation (MODNet, Apache-2.0) and the effects built on it."""
import os
import subprocess
import time
import urllib.request

from .core import FPS, find_media, ffmpeg, info, user_cache, warn, die
from .fx_video import png_mask
from .text import ev_window

MODEL_URL = "https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx"
MODEL_SIZE_MIN = 20_000_000

AI_TYPES = {"background", "outline", "cutout", "sticker", "clone", "dolly", "frame_break"}


def model_path():
    return os.path.join(user_cache(), "modnet.onnx")


def ensure_model(quiet=False):
    p = model_path()
    if os.path.exists(p) and os.path.getsize(p) > MODEL_SIZE_MIN:
        return p
    if not quiet:
        info("🧠 Downloading the AI cut-out model (one time, ~26 MB)…")
    tmp = p + ".part"
    try:
        with urllib.request.urlopen(MODEL_URL, timeout=120) as r, open(tmp, "wb") as f:
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)
        if os.path.getsize(tmp) < MODEL_SIZE_MIN:
            raise IOError("download incomplete")
        os.replace(tmp, p)
    except Exception as e:
        try:
            os.remove(tmp)
        except OSError:
            pass
        die(f"Could not download the AI cut-out model ({e}). Check the internet connection (huggingface.co) and retry.")
    return p


def available():
    try:
        import onnxruntime  # noqa
        import numpy  # noqa
        return True
    except Exception:
        return False


def mask_size(RW, RH, preview):
    short = 256 if preview else 384
    if RW <= RH:
        mw = short
        mh = int(round(short * RH / RW / 32)) * 32
    else:
        mh = short
        mw = int(round(short * RW / RH / 32)) * 32
    return mw, mh


def compute_mask(base_path, windows, total, RW, RH, out_path, preview=False, sample_every=3):
    """Run segmentation on frames inside `windows` and write a full-length grayscale mask video.

    Returns {frame_index: small_mask_array} samples for readability checks."""
    import numpy as np
    import onnxruntime as ort
    sess = ort.InferenceSession(ensure_model(), providers=["CPUExecutionProvider"])
    iname = sess.get_inputs()[0].name
    MW, MH = mask_size(RW, RH, preview)
    n_frames = int(round(total * FPS)) + 2
    need = np.zeros(n_frames, bool)
    for a, b in windows:
        i0, i1 = max(0, int((a - 0.25) * FPS)), min(n_frames, int((b + 0.25) * FPS) + 1)
        need[i0:i1] = True
    dec = subprocess.Popen([ffmpeg(), "-v", "error", "-i", base_path, "-vf", f"scale={MW}:{MH}", "-f", "rawvideo",
                            "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen([ffmpeg(), "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{MW}x{MH}",
                            "-r", str(FPS), "-i", "-", "-c:v", "ffv1", out_path], stdin=subprocess.PIPE)
    fsz = MW * MH * 3
    prev = None
    samples = {}
    zero = bytes(MW * MH)
    t0 = time.time()
    done = 0
    i = 0
    while True:
        buf = dec.stdout.read(fsz)
        if len(buf) < fsz:
            break
        if i < n_frames and need[i]:
            img = np.frombuffer(buf, np.uint8).reshape(MH, MW, 3).astype(np.float32)
            x = ((img / 255.0 - 0.5) / 0.5).transpose(2, 0, 1)[None]
            m = sess.run(None, {iname: x})[0][0, 0]
            m = np.clip(m, 0, 1)
            if prev is not None:
                m = 0.65 * m + 0.35 * prev
            prev = m
            # tighten soft edges a little
            mm = np.clip((m - 0.2) / 0.62, 0, 1)
            out = (mm * 255).astype(np.uint8)
            enc.stdin.write(out.tobytes())
            if i % sample_every == 0:
                samples[i] = out[::2, ::2].copy()
            done += 1
        else:
            prev = None
            enc.stdin.write(zero)
        i += 1
    dec.stdout.close()
    dec.wait()
    enc.stdin.close()
    enc.wait()
    if done:
        info(f"🧠 AI cut-out: {done} frames in {time.time() - t0:.0f}s")
    return samples, (MW, MH)


def coverage(samples, msize, box, a, b, W, H):
    """Fraction of a text box covered by the person (0..1) across the window."""
    import numpy as np
    MW, MH = msize
    x0, y0, x1, y1 = box
    sx, sy = (MW / 2) / W, (MH / 2) / H
    vals = []
    for idx, m in samples.items():
        t = idx / FPS
        if a <= t <= b:
            xa, xb = max(0, int(x0 * sx)), min(m.shape[1], int(x1 * sx) + 1)
            ya, yb = max(0, int(y0 * sy)), min(m.shape[0], int(y1 * sy) + 1)
            if xb > xa and yb > ya:
                vals.append(float(np.mean(m[ya:yb, xa:xb])) / 255.0)
    return max(vals) if vals else 0.0


# --------------------------------------------------------------------------- graph compositing

class MaskPool:
    """Hands out independent copies of the mask stream (each filter label can be used once)."""

    def __init__(self, G, idx):
        self.G = G
        self.idx = idx
        self.base = G.lab("mk")
        self.pos = len(G.lines)
        G.push("__MASK__")
        self.labels = []

    def get(self):
        lab = self.G.lab("m")
        self.labels.append(lab)
        return lab

    def finalize(self):
        G = self.G
        RW, RH = G.RW, G.RH
        head = f"[{self.idx}:v]scale={RW}:{RH}:flags=bicubic,format=gray,gblur=sigma=1.2[{self.base}]"
        n = len(self.labels)
        if n == 0:
            G.lines[self.pos] = head.replace(f"[{self.base}]", "[mk_unused]") + ";[mk_unused]nullsink"
        elif n == 1:
            G.lines[self.pos] = head + f";[{self.base}]null[{self.labels[0]}]"
        else:
            G.lines[self.pos] = head + f";[{self.base}]split={n}" + "".join(f"[{l}]" for l in self.labels)


def _dilate(G, mlab, px):
    out = G.lab("dl")
    n = max(1, int(px))
    G.push(f"[{mlab}]" + ",".join(["dilation"] * n) + f"[{out}]")
    return out


def _rgba_from(G, video_lab, mask_lab):
    out = G.lab("ct")
    G.push(f"[{video_lab}]format=yuva420p[{out}v];[{out}v][{mask_lab}]alphamerge[{out}]")
    return out


def _solid(G, color, alpha_lab):
    out = G.lab("sd")
    G.push(f"color=c=0x{color.lstrip('#')}:s={G.RW}x{G.RH}:r={FPS}:d={G.total + 1:.3f},format=yuva420p[{out}c];"
           f"[{out}c][{alpha_lab}]alphamerge[{out}]")
    return out


def _bg_source(G, ctx, spec, ws, a, b, base_lab=None):
    spec = spec or "#F2F0EB"
    if spec == "blur" and base_lab:
        out = G.lab("bb")
        G.push(f"[{base_lab}]gblur=sigma={30 * (0.5 if G.preview else 1):.0f},eq=brightness=-0.05[{out}]")
        return out
    if isinstance(spec, str) and spec.startswith("#"):
        return G.canvas(spec)
    p = find_media(ws, spec, "broll")
    if not p:
        return G.canvas("#F2F0EB")
    img = p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
    idx = G.add_input((["-loop", "1"] if img else ["-stream_loop", "-1"]) + ["-t", f"{b - a + 0.5:.3f}", "-i", p])
    out = G.lab("bf")
    G.push(f"[{idx}:v]scale={G.RW}:{G.RH}:force_original_aspect_ratio=increase,crop={G.RW}:{G.RH},fps={FPS},"
           f"setpts=PTS-STARTPTS+{a:.3f}/TB,format=yuv420p[{out}]")
    return out


def apply_ai(G, ctx, events, pool, ws):
    u = ctx.u
    sx = G.RW / ctx.W
    for e in events:
        typ = e.get("type")
        if typ not in AI_TYPES:
            continue
        if typ == "sticker":
            typ = "cutout"
        dflt = {"dolly": 1.6, "outline": 2.5}.get(typ, 2.0)
        a, b = ev_window(ctx, e, dflt)
        if typ == "background":
            keep, src, bgsrc = G.split(3)
            bg = _bg_source(G, ctx, e.get("bg", "blur"), ws, a, b, bgsrc)
            if e.get("bg", "blur") != "blur":
                G.push(f"[{bgsrc}]nullsink")
            out = G.lab("bgm")
            G.push(f"[{bg}]format=yuv420p[{out}b];[{src}]format=yuv420p[{out}s];[{out}b][{out}s][{pool.get()}]maskedmerge[{out}]")
            G.cur = G.overlay(keep, out, a=a, b=b)
        elif typ == "outline":
            keep = G.cur
            m1, m2 = pool.get(), pool.get()
            d = _dilate(G, m1, float(e.get("width", 7)) * u * sx)
            ring = G.lab("rg")
            G.push(f"[{d}][{m2}]blend=all_mode=subtract[{ring}]")
            solid = _solid(G, e.get("color", "#FFFFFF"), ring)
            if e.get("glow"):
                gl = G.lab("gw")
                G.push(f"[{solid}]gblur=sigma=8[{gl}]")
                keep = G.overlay(keep, gl, a=a, b=b)
            G.cur = G.overlay(keep, solid, a=a, b=b)
        elif typ == "cutout":
            keep, src = G.split(2)
            m1, m2 = pool.get(), pool.get()
            freeze = e.get("freeze", True)
            vlab = src
            if freeze:
                fz = G.lab("fz")
                n = int((b - a) * FPS) + 2
                G.push(f"[{src}]trim=start={a:.3f}:end={a + 1.0 / FPS + 0.001:.3f},setpts=PTS-STARTPTS,loop=loop={n}:size=1,"
                       f"setpts=N/{FPS}/TB+{a:.3f}/TB[{fz}]")
                G.push(f"[{m1}]trim=start={a:.3f}:end={a + 1.0 / FPS + 0.001:.3f},setpts=PTS-STARTPTS,loop=loop={n}:size=1,"
                       f"setpts=N/{FPS}/TB+{a:.3f}/TB[{fz}m1]")
                G.push(f"[{m2}]trim=start={a:.3f}:end={a + 1.0 / FPS + 0.001:.3f},setpts=PTS-STARTPTS,loop=loop={n}:size=1,"
                       f"setpts=N/{FPS}/TB+{a:.3f}/TB[{fz}m2]")
                vlab, m1, m2 = fz, f"{fz}m1", f"{fz}m2"
            person = _rgba_from(G, vlab, m1)
            d = _dilate(G, m2, float(e.get("outline", 14)) * u * sx)
            white = _solid(G, e.get("outline_color", "#FFFFFF"), d)
            st = G.lab("stk")
            G.push(f"[{white}][{person}]overlay=format=auto[{st}]")
            sc = float(e.get("scale", 0.86))
            tilt = float(e.get("tilt", -4))
            sw, sh = int(G.RW * sc) // 2 * 2, int(G.RH * sc) // 2 * 2
            st2 = G.lab("stk")
            G.push(f"[{st}]scale={sw}:{sh},rotate={tilt}*PI/180:c=none:ow=rotw({tilt}*PI/180):oh=roth({tilt}*PI/180)[{st2}]")
            bg = _bg_source(G, ctx, e.get("bg", ctx.ui["paper"]), ws, a, b)
            shadow = G.lab("sh")
            G.push(f"[{st2}]split[{st2}a][{st2}b];[{st2}b]colorchannelmixer=rr=0:gg=0:bb=0:aa=0.35,gblur=sigma=14[{shadow}]")
            comp = G.overlay(bg, shadow, f"(W-w)/2+{14 * u * sx:.0f}", f"(H-h)/2+{30 * u * sx:.0f}")
            comp = G.overlay(comp, f"{st2}a", "(W-w)/2", f"(H-h)/2+{float(e.get('y_offset', 0.04)) * G.RH:.0f}")
            G.cur = G.overlay(keep, comp, a=a, b=b)
        elif typ == "clone":
            keep, src = G.split(2)
            count = max(1, min(6, int(e.get("count", 4))))
            person = _rgba_from(G, src, pool.get())
            labs = [G.lab("cl") for _ in range(count + 1)]
            G.push(f"[{person}]split={count + 1}" + "".join(f"[{l}]" for l in labs))
            cur = keep
            sc = float(e.get("scale", 0.62))
            spread = float(e.get("spread", 0.26))
            offsets = []
            for i in range(count):
                side = -1 if i % 2 == 0 else 1
                step = i // 2 + 1
                offsets.append(side * step * spread)
            for i, off in enumerate(sorted(offsets, key=abs, reverse=True)):
                s = sc * (0.92 ** (abs(off) / spread - 1))
                cw, ch = int(G.RW * s) // 2 * 2, int(G.RH * s) // 2 * 2
                c2 = G.lab("cs")
                delay = 0.08 * i
                G.push(f"[{labs[i]}]scale={cw}:{ch},format=yuva420p,colorchannelmixer=aa=0.95[{c2}]")
                x = f"(W-w)/2+{off * G.RW:.0f}"
                y = f"{G.RH * float(e.get('y', 0.06)):.0f}+(H-h)*0.5-{G.RH * 0.06:.0f}"
                cur = G.overlay(cur, c2, x, y, a + delay, b)
            G.cur = G.overlay(cur, labs[count], "0", "0", a, b)
        elif typ == "dolly":
            keep, src, zsrc = G.split(3)
            amt = float(e.get("amount", 1.35)) - 1
            p = f"min(1,max(0,(in/30-{a:.3f})/{max(0.2, b - a):.3f}))"
            zl = G.lab("dz")
            G.push(f"[{zsrc}]zoompan=z='1+{amt:.3f}*(1-{p})':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*0.42':d=1:s={G.RW}x{G.RH}:fps={FPS}[{zl}]")
            out = G.lab("dm")
            G.push(f"[{zl}]format=yuv420p[{out}z];[{src}]format=yuv420p[{out}s];[{out}z][{out}s][{pool.get()}]maskedmerge[{out}]")
            G.cur = G.overlay(keep, out, a=a, b=b)
        elif typ == "frame_break":
            keep, src = G.split(2)
            s = float(e.get("scale", 0.80))
            sw, sh = int(G.RW * s) // 2 * 2, int(G.RH * s) // 2 * 2
            X, Y = (G.RW - sw) // 2, int(G.RH * 0.12)
            fx0, fy0 = X + int(sw * 0.07), Y + int(sh * float(e.get('frame_top', 0.40)))
            fw, fh = int(sw * 0.86) // 2 * 2, int(sh * 0.56) // 2 * 2
            sc = G.lab("fb")
            G.push(f"[{src}]scale={sw}:{sh}[{sc}];[{sc}]split[{sc}a][{sc}b]")
            inset = G.lab("fi")
            G.push(f"[{sc}a]crop={fw}:{fh}:{fx0 - X}:{fy0 - Y}[{inset}]")
            canvas = G.canvas(e.get("bg", ctx.ui["paper"]))
            comp = G.overlay(canvas, inset, str(fx0), str(fy0))
            bw = max(4, int(10 * u * sx))
            c2 = G.lab("fbx")
            G.push(f"[{comp}]drawbox=x={fx0 - bw}:y={fy0 - bw}:w={fw + 2 * bw}:h={fh + 2 * bw}:color=0x{e.get('frame_color', '#161616').lstrip('#')}:t={bw}[{c2}]")
            m = pool.get()
            ms = G.lab("fm")
            G.push(f"[{m}]scale={sw}:{sh}[{ms}]")
            person = _rgba_from(G, f"{sc}b", ms)
            pc = G.lab("fpc")
            G.push(f"[{person}]crop={sw}:{fy0 - Y + fh}:0:0[{pc}]")
            comp2 = G.overlay(c2, pc, str(X), str(Y))
            G.cur = G.overlay(keep, comp2, a=a, b=b)
        ctx.extra_sfx.append((a, e.get("sfx", {"cutout": "pop", "clone": "whoosh", "dolly": "riser", "frame_break": "whoosh",
                                                "background": "whoosh-fast", "outline": "sparkle"}.get(typ, "pop")), 0.45))


def apply_behind(G, behind_file, pool):
    keep, src = G.split(2)
    bt = G.lab("bt")
    G.push(f"[{src}]ass={behind_file}[{bt}]")
    out = G.lab("bh")
    G.push(f"[{bt}]format=yuv420p[{out}t];[{keep}]format=yuv420p[{out}k];[{out}t][{out}k][{pool.get()}]maskedmerge[{out}]")
    G.cur = out


def ai_windows(ctx, events, behind_groups):
    wins = []
    for e in events:
        if e.get("type") in AI_TYPES:
            a, b = ev_window(ctx, e, 2.0)
            wins.append((a, b))
    for (g, a, b) in behind_groups:
        wins.append((a, b))
    return wins


_unused = (png_mask, warn)

DOCS = {
    "background": "AI: replace the background behind you. bg '#hex' | 'blur' | image/video file, dur",
    "outline": "AI: glowing/solid outline traced around you. color, width, glow",
    "cutout": "AI: sticker cut-out of you (white border, tilt, drop shadow) on a clean background. freeze (true), bg, scale, tilt, outline",
    "clone": "AI: copies of you fan out behind you. count (1–6), scale, spread",
    "dolly": "AI: vertigo / dolly zoom — background zooms while you stay still. amount, dur",
    "frame_break": "AI: you inside a frame with your head breaking out of it. frame_top, frame_color, bg",
}
