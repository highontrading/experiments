"""Video-level effects and the filter-graph builder."""
import os
import re
import subprocess

from .core import FPS, find_media, looks_reg, run_ff, warn, ffmpeg, resolve_font
from .text import (c_tag, circle, enter_tag, esc, ev_window, exit_tag, polygon, rect, rrect, sizes_map, xpos, ypos)


# --------------------------------------------------------------------------- graph builder

class Graph:
    def __init__(self, RW, RH, total, cwd, preview=False):
        self.inputs = []
        self.n_in = 0
        self.lines = []
        self.cur = None
        self.k = 0
        self.RW, self.RH = RW, RH
        self.total = total
        self.cwd = cwd
        self.preview = preview
        self.dropped = []

    def add_input(self, args):
        self.inputs += args
        idx = self.n_in
        self.n_in += 1
        return idx

    def lab(self, p="x"):
        self.k += 1
        return f"{p}{self.k}"

    def push(self, s):
        self.lines.append(s)

    def chain(self, filt):
        new = self.lab("v")
        self.push(f"[{self.cur}]{filt}[{new}]")
        self.cur = new
        return new

    def split(self, n=2):
        labs = [self.lab("s") for _ in range(n)]
        self.push(f"[{self.cur}]split={n}" + "".join(f"[{l}]" for l in labs))
        return labs

    def overlay(self, base, top, x="0", y="0", a=None, b=None, extra=""):
        new = self.lab("o")
        en = f":enable='between(t,{a:.3f},{b:.3f})'" if a is not None else ""
        self.push(f"[{base}][{top}]overlay=x='{x}':y='{y}'{en}:eof_action=pass{extra}[{new}]")
        return new

    def canvas(self, color, a=0.0):
        lab = self.lab("c")
        self.push(f"color=c=0x{color.lstrip('#')}:s={self.RW}x{self.RH}:r={FPS}:d={self.total + 1:.3f}[{lab}]")
        return lab


# --------------------------------------------------------------------------- helpers

def png_mask(path, W, H, kind="rrect", r=0, feather=0, invert=False, cx=None, cy=None, rx=None, ry=None, darkness=0.0,
             angle=None):
    """Write a grayscale/RGBA mask PNG with numpy + ffmpeg (no PIL needed)."""
    import numpy as np
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    if kind == "rrect":
        r = max(1.0, min(r, W / 2, H / 2))
        dx = np.maximum(np.maximum(r - xx, xx - (W - 1 - r)), 0)
        dy = np.maximum(np.maximum(r - yy, yy - (H - 1 - r)), 0)
        d = np.sqrt(dx * dx + dy * dy) - r
        m = np.clip(0.5 - d, 0, 1)
    elif kind == "ellipse":
        cx = W / 2 if cx is None else cx
        cy = H / 2 if cy is None else cy
        rx = W / 2 if rx is None else rx
        ry = H / 2 if ry is None else ry
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        f = max(feather, 1e-3)
        m = np.clip((1 - d) / f, 0, 1) if feather else (d <= 1).astype(np.float32)
    elif kind == "halfplane":
        ang = angle if angle is not None else -0.35
        nx, ny = np.sin(ang), np.cos(ang)
        m = (((xx - W / 2) * nx + (yy - H / 2) * ny) < 0).astype(np.float32)
    else:
        m = np.ones((H, W), np.float32)
    if invert:
        m = 1 - m
    if darkness:
        rgba = np.zeros((H, W, 4), np.uint8)
        rgba[..., 3] = (np.clip(1 - m, 0, 1) * 255 * darkness).astype(np.uint8)
        data, fmt = rgba.tobytes(), "rgba"
    else:
        data, fmt = (m * 255).astype(np.uint8).tobytes(), "gray"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", fmt, "-s", f"{W}x{H}", "-i", "-",
                    path], input=data, check=True)
    return path


_VALID = {}


def filter_ok(filt):
    if filt in _VALID:
        return _VALID[filt]
    p = subprocess.run([ffmpeg(), "-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=64x64:d=0.2:r=10", "-vf", filt,
                        "-f", "null", "-"], capture_output=True, text=True)
    ok = p.returncode == 0
    _VALID[filt] = ok
    if not ok:
        warn(f"Custom filter rejected by ffmpeg, skipped: {filt[:80]} ({p.stderr.strip().splitlines()[-1][:120] if p.stderr.strip() else ''})")
    return ok


def look_chain(look, jd):
    if not look or look == "none":
        return ""
    if isinstance(look, dict):
        spec = look
    else:
        reg = looks_reg()
        if look not in reg:
            warn(f"Look '{look}' not found — using 'natural'.")
            look = "natural"
        spec = reg.get(look, {})
    parts = []
    if spec.get("lut"):
        src = spec["lut"]
        if os.path.isfile(src):
            stem, ext = os.path.splitext(os.path.basename(src).lower())
            name = "lut_" + re.sub(r"[^a-z0-9]+", "_", stem) + (ext if ext in (".cube", ".3dl", ".dat", ".m3d", ".csp") else ".cube")
            dst = os.path.join(jd, name)
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
                import shutil
                shutil.copy2(src, dst)
            f = f"lut3d=file={name}"
            p = subprocess.run([ffmpeg(), "-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=32x32:d=0.1", "-vf", f,
                                "-f", "null", "-"], capture_output=True, text=True, cwd=jd)
            if p.returncode == 0:
                parts.append(f)
            else:
                warn(f"LUT {os.path.basename(src)} could not be read — skipped.")
        else:
            warn(f"LUT file missing: {src}")
    if spec.get("filter"):
        if filter_ok(spec["filter"]):
            parts.append(spec["filter"])
    return ",".join(parts)


# --------------------------------------------------------------------------- zoom (zoompan)

def zoom_expr(ctx, zooms, shake):
    terms = []
    focus = None
    for z in zooms:
        a, b = z["_a"], z["_b"]
        st = z.get("style", "punch")
        default_amt = {"punch": 1.25, "through": 2.2, "push": 1.15, "slow": 1.12, "pulse": 1.18, "pull": 1.25}.get(st, 1.2)
        amt = float(z.get("amount", default_amt)) - 1.0
        if st == "punch":
            ri, ro = 0.12, 0.08
        elif st in ("push", "slow"):
            ri, ro = max(b - a, 0.2), 0.04
        elif st == "pulse":
            ri, ro = (b - a) / 2, (b - a) / 2
        elif st == "pull":
            ri, ro = 0.01, max(b - a, 0.2)
        elif st == "through":
            ri, ro = max(b - a, 0.15), 0.01
        else:
            ri, ro = 0.12, 0.08
        T = "(in/30)"
        up = f"min(1,max(0,({T}-{a:.3f})/{ri:.3f}))"
        dn = f"min(1,max(0,({b:.3f}-{T})/{ro:.3f}))"
        if st == "through":
            e = f"{amt:.4f}*pow({up},2.2)*({dn})"
        else:
            e = f"{amt:.4f}*(({up})*({up})*(3-2*({up})))*(({dn})*({dn})*(3-2*({dn})))"
        terms.append(e)
        if z.get("focus"):
            focus = z["focus"]
    for s in shake:
        terms.append(f"0.06*between(in/30,{s['_a']:.3f},{s['_b']:.3f})")
    z = "1+" + "+".join(terms) if terms else "1"
    fx, fy = (focus or [0.5, 0.42])
    sx = "+".join(f"{float(s.get('amount', 14)) * ctx.u:.1f}*sin(in*2.1)*between(in/30,{s['_a']:.3f},{s['_b']:.3f})" for s in shake) or "0"
    sy = "+".join(f"{float(s.get('amount', 14)) * ctx.u:.1f}*cos(in*2.7)*between(in/30,{s['_a']:.3f},{s['_b']:.3f})" for s in shake) or "0"
    x = f"max(0,min(iw-iw/zoom,(iw-iw/zoom)*{fx}+({sx})))"
    y = f"max(0,min(ih-ih/zoom,(ih-ih/zoom)*{fy}+({sy})))"
    return z, x, y


def reframe_filter(pr, W, H, rf):
    mode = (rf or {}).get("mode", "crop")
    fx, fy = float((rf or {}).get("x", 0.5)), float((rf or {}).get("y", 0.5))
    if mode in ("fit-blur", "blur"):
        return (f"split[rf_bg][rf_fg];[rf_bg]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                f"boxblur=luma_radius=40:luma_power=2,eq=brightness=-0.08[rf_bg2];"
                f"[rf_fg]scale={W}:{H}:force_original_aspect_ratio=decrease[rf_fg2];"
                f"[rf_bg2][rf_fg2]overlay=(W-w)/2:(H-h)/2,setsar=1")
    if mode == "fit":
        return f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1"
    zoom = max(1.0, float((rf or {}).get("zoom", 1.0)))
    return (f"scale={int(W * zoom) // 2 * 2}:{int(H * zoom) // 2 * 2}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H}:(iw-{W})*{fx}:(ih-{H})*{fy},setsar=1")


# --------------------------------------------------------------------------- window filters (pre-AI)

def window_filters(G, ctx, events):
    chain = []
    for e in events:
        typ = e.get("type")
        if typ not in ("glitch", "bw", "blur", "darken", "filter", "impact", "rack_focus", "blackout", "vhs", "invert",
                       "sepia", "pixelate", "mirror"):
            continue
        dflt = {"glitch": 0.35, "impact": 0.9, "rack_focus": 0.7, "blackout": 1.2}.get(typ, 1.5)
        a_, b_ = ev_window(ctx, e, dflt)
        en = f"enable='between(t,{a_:.3f},{b_:.3f})'"
        pv = 0.5 if G.preview else 1.0
        if typ == "glitch":
            s = int(float(e.get("amount", 18)) * ctx.u * pv)
            chain += [f"rgbashift=rh={s}:bh=-{s}:gv={max(1, s // 2)}:{en}", f"noise=alls=30:allf=t:{en}"]
        elif typ == "bw":
            chain.append(f"hue=s=0:{en}")
        elif typ == "sepia":
            chain.append(f"colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:{en}")
        elif typ == "invert":
            chain.append(f"negate=enable='between(t,{a_:.3f},{b_:.3f})'")
        elif typ == "pixelate":
            p = max(2, int(float(e.get("amount", 24)) * pv))
            chain.append(f"scale=iw/{p}:ih/{p}:flags=neighbor:{en},scale={G.RW}:{G.RH}:flags=neighbor")
        elif typ == "mirror":
            chain.append(f"hflip=enable='between(t,{a_:.3f},{b_:.3f})'")
        elif typ == "vhs":
            chain += [f"rgbashift=rh=4:bh=-4:{en}", f"noise=alls=18:allf=t:{en}", f"eq=saturation=0.8:contrast=1.1:{en}"]
        elif typ == "blur":
            chain.append(f"gblur=sigma={float(e.get('amount', 18)) * pv:.1f}:{en}")
        elif typ == "darken":
            chain.append(f"eq=brightness=-{float(e.get('amount', 0.25)):.2f}:{en}")
        elif typ == "blackout":
            chain.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=black:t=fill:{en}")
        elif typ == "impact":
            chain.append(f"hue=s=0:{en}")
            chain.append(f"unsharp=5:5:1.4:{en}")
            chain.append(f"curves=all='0/0 0.30/0.04 0.52/0.93 1/1':{en}")
        elif typ == "rack_focus":
            n = 6
            direction = e.get("direction", "in")
            peak = float(e.get("amount", 24)) * pv
            d = (b_ - a_) / n
            for i in range(n):
                sig = peak * (1 - i / n) if direction == "in" else peak * ((i + 1) / n)
                if sig < 0.6:
                    continue
                chain.append(f"gblur=sigma={sig:.1f}:enable='between(t,{a_ + i * d:.3f},{a_ + (i + 1) * d:.3f})'")
        elif typ == "filter":
            f = str(e.get("filter", ""))
            if f and filter_ok(f):
                chain.append(f"{f}:{en}" if "enable" not in f and "," not in f else f)
    if chain:
        G.chain(",".join(chain))


def freeze_frames(G, ctx, events):
    for e in events:
        if e.get("type") != "freeze":
            continue
        a_, b_ = ev_window(ctx, e, 1.2)
        keep, src = G.split(2)
        fz = G.lab("fz")
        tilt = float(e.get("tilt", 0))
        scale = float(e.get("scale", 1.0))
        extra = ""
        if scale != 1.0 or tilt:
            sw = int(G.RW * scale) // 2 * 2
            sh = int(G.RH * scale) // 2 * 2
            extra = f",scale={sw}:{sh}"
            if tilt:
                extra += f",format=rgba,rotate={tilt}*PI/180:c=none:ow=rotw({tilt}*PI/180):oh=roth({tilt}*PI/180)"
        G.push(f"[{src}]trim=start={a_:.3f}:end={a_ + 1.0 / FPS + 0.001:.3f},setpts=PTS-STARTPTS,"
               f"loop=loop={int((b_ - a_) * FPS) + 2}:size=1,setpts=N/{FPS}/TB+{a_:.3f}/TB{extra}[{fz}]")
        if scale != 1.0 or tilt:
            bg = G.lab("fb")
            G.push(f"[{keep}]split[{bg}a][{bg}b]")
            dim = G.lab("fd")
            G.push(f"[{bg}b]gblur=sigma=18,eq=brightness=-0.15[{dim}]")
            base2 = G.overlay(f"{bg}a", dim, a=a_, b=b_)
            G.cur = G.overlay(base2, fz, "(W-w)/2", "(H-h)/2", a_, b_)
        else:
            G.cur = G.overlay(keep, fz, a=a_, b=b_)
        if e.get("flash", True):
            ctx.extra_sfx.append((a_, e.get("sfx", "shutter"), 0.6))


def blur_regions(G, ctx):
    for i, r in enumerate(ctx.video_requests):
        if r.get("kind") != "blur_region":
            continue
        sx = G.RW / ctx.W
        x, y, w, h = [max(0, int(v * sx)) // 2 * 2 for v in (r["x"], r["y"], r["w"], r["h"])]
        w = min(w, G.RW - x)
        h = min(h, G.RH - y)
        if w < 8 or h < 8:
            continue
        mpath = os.path.join(G.cwd, f"mask_rr_{w}x{h}.png")
        if not os.path.exists(mpath):
            png_mask(mpath, w, h, "rrect", r=r.get("r", 36) * sx)
        idx = G.add_input(["-loop", "1", "-i", mpath])
        keep, src = G.split(2)
        g = G.lab("gl")
        sig = r.get("sigma", 22) * (0.5 if G.preview else 1)
        G.push(f"[{src}]crop={w}:{h}:{x}:{y},gblur=sigma={sig:.1f},eq=brightness=0.04:saturation=1.1,format=yuva420p[{g}c];"
               f"[{idx}:v]format=gray,scale={w}:{h}[{g}m];[{g}c][{g}m]alphamerge[{g}]")
        G.cur = G.overlay(keep, g, str(x), str(y), r["a"], r["b"])


def spotlight(G, ctx, events):
    for e in events:
        if e.get("type") != "spotlight":
            continue
        a_, b_ = ev_window(ctx, e, 2.0)
        cx = float(e.get("x", 0.5)) * G.RW
        cy = float(e.get("y", 0.40)) * G.RH
        rad = float(e.get("size", 0.36)) * G.RW
        mpath = os.path.join(G.cwd, f"spot_{int(cx)}_{int(cy)}_{int(rad)}_{G.RW}.png")
        png_mask(mpath, G.RW, G.RH, "ellipse", cx=cx, cy=cy, rx=rad, ry=rad * 1.25, feather=0.35,
                 darkness=float(e.get("darkness", 0.78)))
        idx = G.add_input(["-loop", "1", "-t", f"{b_ - a_ + 0.5:.3f}", "-i", mpath])
        sp = G.lab("sp")
        G.push(f"[{idx}:v]format=rgba,fade=t=in:st=0:d=0.3:alpha=1,fade=t=out:st={max(0, b_ - a_ - 0.3):.3f}:d=0.3:alpha=1,"
               f"setpts=PTS-STARTPTS+{a_:.3f}/TB[{sp}]")
        G.cur = G.overlay(G.cur, sp, a=a_, b=b_)


def overlays(G, ctx, events, ws, look):
    k = 0
    for e in events:
        typ = e.get("type")
        if typ == "broll":
            a_, b_ = ev_window(ctx, e, 3.0)
            p = find_media(ws, e.get("file"), "broll")
            if not p:
                continue
            is_img = p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
            dur = b_ - a_
            if is_img:
                idx = G.add_input(["-loop", "1", "-t", f"{dur + 0.5:.3f}", "-i", p])
            else:
                idx = G.add_input(["-ss", f"{float(e.get('from', 0)):.3f}", "-t", f"{dur + 0.5:.3f}", "-i", p])
            mode = e.get("mode", "full")
            RW, RH = G.RW, G.RH
            if mode == "full":
                sc = f"scale={RW}:{RH}:force_original_aspect_ratio=increase,crop={RW}:{RH},setsar=1"
                pos = ("0", "0")
            elif mode in ("split-top", "split-bottom"):
                sc = f"scale={RW}:{RH // 2}:force_original_aspect_ratio=increase,crop={RW}:{RH // 2},setsar=1"
                pos = ("0", "0" if mode == "split-top" else str(RH // 2))
            else:
                pw = int(RW * float(e.get("size", 0.86))) // 2 * 2
                sc = f"scale={pw}:-2,setsar=1"
                pos = ("(W-w)/2", f"{RH * float(e.get('y', 0.12)):.0f}")
            kb = ""
            if is_img and e.get("kenburns", True) and mode == "full":
                kb = f",zoompan=z='1+0.0015*on':d=1:s={RW}x{RH}:fps={FPS}"
            lk = look_chain(look, G.cwd)
            lk = ("," + lk) if lk else ""
            b = G.lab("b")
            G.push(f"[{idx}:v]{sc}{kb},fps={FPS}{lk},format=yuva420p,fade=t=in:st=0:d=0.15:alpha=1,"
                   f"setpts=PTS-STARTPTS+{a_:.3f}/TB[{b}]")
            G.cur = G.overlay(G.cur, b, pos[0], pos[1], a_, b_)
            k += 1
        elif typ in ("image", "overlay", "sticker_file"):
            a_, b_ = ev_window(ctx, e, 3.0)
            p = find_media(ws, e.get("file") or ctx.brand.get("logo"), "brand")
            if not p:
                continue
            low = p.lower()
            if low.endswith(".gif"):
                idx = G.add_input(["-ignore_loop", "0", "-t", f"{b_ - a_ + 0.5:.3f}", "-i", p])
            elif low.endswith((".mov", ".webm", ".mp4", ".mkv")):
                idx = G.add_input(["-stream_loop", "-1", "-t", f"{b_ - a_ + 0.5:.3f}", "-i", p])
            else:
                idx = G.add_input(["-loop", "1", "-t", f"{b_ - a_ + 0.5:.3f}", "-i", p])
            iw = int(G.RW * float(e.get("size", 0.22))) // 2 * 2
            RW, RH = G.RW, G.RH
            posmap = {"top-right": (f"W-w-{RW * 0.05:.0f}", f"{RH * 0.06:.0f}"), "top-left": (f"{RW * 0.05:.0f}", f"{RH * 0.06:.0f}"),
                      "center": ("(W-w)/2", "(H-h)/2"), "bottom-right": (f"W-w-{RW * 0.05:.0f}", f"H-h-{RH * 0.16:.0f}"),
                      "top": ("(W-w)/2", f"{RH * 0.08:.0f}"), "bottom-left": (f"{RW * 0.05:.0f}", f"H-h-{RH * 0.16:.0f}"),
                      "bottom": ("(W-w)/2", f"H-h-{RH * 0.16:.0f}")}
            pos = posmap.get(e.get("position", "top-right"), posmap["top-right"])
            if isinstance(e.get("x"), (int, float)) and isinstance(e.get("y"), (int, float)):
                pos = (f"{float(e['x']) * RW:.0f}-w/2", f"{float(e['y']) * RH:.0f}-h/2")
            i_ = G.lab("i")
            G.push(f"[{idx}:v]scale={iw}:-2,fps={FPS},format=yuva420p,fade=t=in:st=0:d=0.25:alpha=1,"
                   f"setpts=PTS-STARTPTS+{a_:.3f}/TB[{i_}]")
            G.cur = G.overlay(G.cur, i_, pos[0], pos[1], a_, b_)
            k += 1
        elif typ == "double_exposure":
            a_, b_ = ev_window(ctx, e, 2.5)
            p = find_media(ws, e.get("file"), "broll")
            if not p:
                continue
            img = p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
            idx = G.add_input((["-loop", "1"] if img else ["-ss", f"{float(e.get('from', 0)):.3f}"]) +
                              ["-t", f"{b_ - a_ + 0.5:.3f}", "-i", p])
            keep, src = G.split(2)
            d = G.lab("de")
            G.push(f"[{idx}:v]scale={G.RW}:{G.RH}:force_original_aspect_ratio=increase,crop={G.RW}:{G.RH},fps={FPS},hue=s=0,"
                   f"setpts=PTS-STARTPTS+{a_:.3f}/TB,format=yuv420p[{d}b];"
                   f"[{src}]hue=s=0,eq=contrast=1.2,format=yuv420p[{d}a];[{d}a][{d}b]blend=all_mode=screen:shortest=0[{d}]")
            G.cur = G.overlay(keep, d, a=a_, b=b_)


# --------------------------------------------------------------------------- frames / layouts / text mask / pullback

FRAME_TEMPLATES = {
    # canvas colour, window (x, y, w, h as fractions), shape, video filter
    "newspaper": {"canvas": "#EFE9DC", "win": (0.18, 0.26, 0.64, 0.40), "shape": "rect",
                  "filter": "hue=s=0,eq=contrast=1.35:brightness=0.03,noise=alls=10:allf=t"},
    "banknote": {"canvas": "#E4E6D6", "win": (0.17, 0.15, 0.66, 0.46), "shape": "ellipse",
                 "filter": "hue=s=0,eq=contrast=1.4,colorchannelmixer=.55:.30:.10:0:.45:.55:.10:0:.35:.40:.15"},
    "polaroid": {"canvas": "#2B2B2B", "win": (0.14, 0.18, 0.72, 0.50), "shape": "rect",
                 "filter": "eq=saturation=0.85:contrast=1.05,curves=all='0/0.05 1/0.97'"},
    "phone": {"canvas": "#EDEBE6", "win": (0.22, 0.17, 0.56, 0.62), "shape": "rrect", "radius": 0.07, "filter": ""},
    "window": {"canvas": "#EDEBE6", "win": (0.08, 0.27, 0.84, 0.40), "shape": "rrect", "radius": 0.02, "filter": ""},
    "magazine": {"canvas": "#111111", "win": (0.0, 0.0, 1.0, 1.0), "shape": "rect", "filter": "eq=contrast=1.08:saturation=1.05"},
    "film": {"canvas": "#0E0E0E", "win": (0.06, 0.24, 0.88, 0.44), "shape": "rect", "filter": "eq=saturation=0.9,noise=alls=8:allf=t"},
    "tv": {"canvas": "#1A1A1A", "win": (0.10, 0.28, 0.80, 0.38), "shape": "rrect", "radius": 0.05,
           "filter": "eq=saturation=1.2:contrast=1.15,noise=alls=12:allf=t"},
}


def _win_px(G, tpl, e):
    wx, wy, ww, wh = e.get("window") or tpl["win"]
    return (int(wx * G.RW) // 2 * 2, int(wy * G.RH) // 2 * 2, int(ww * G.RW) // 2 * 2, int(wh * G.RH) // 2 * 2)


def frames_layouts(G, ctx, events, ws):
    for e in events:
        typ = e.get("type")
        if typ == "frame":
            tpl = FRAME_TEMPLATES.get(e.get("style", "newspaper"), FRAME_TEMPLATES["newspaper"])
            a_, b_ = ev_window(ctx, e, 2.5)
            x, y, w, h = _win_px(G, tpl, e)
            keep, src = G.split(2)
            canvas = G.canvas(e.get("canvas", tpl["canvas"]))
            f = G.lab("fr")
            filt = tpl.get("filter") or "null"
            G.push(f"[{src}]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},{filt},format=yuva420p[{f}v]")
            vin = f"{f}v"
            if tpl["shape"] in ("ellipse", "rrect"):
                mpath = os.path.join(G.cwd, f"mask_{tpl['shape']}_{w}x{h}.png")
                if not os.path.exists(mpath):
                    png_mask(mpath, w, h, tpl["shape"], r=tpl.get("radius", 0.05) * G.RW)
                idx = G.add_input(["-loop", "1", "-i", mpath])
                G.push(f"[{idx}:v]format=gray,scale={w}:{h}[{f}m];[{f}v][{f}m]alphamerge[{f}a]")
                vin = f"{f}a"
            comp = G.overlay(canvas, vin, str(x), str(y))
            G.cur = G.overlay(keep, comp, a=a_, b=b_)
        elif typ == "pullback":
            a_, b_ = ev_window(ctx, e, 2.5)
            tpl = FRAME_TEMPLATES.get(e.get("style", "window"), FRAME_TEMPLATES["window"])
            x, y, w, h = _win_px(G, tpl, e)
            s_end = w / G.RW
            ramp = float(e.get("ramp", 0.55))
            keep, src = G.split(2)
            canvas = G.canvas(e.get("canvas", tpl["canvas"]))
            p = f"min(1,max(0,(t-{a_:.3f})/{ramp:.3f}))"
            ease = f"(1-pow(1-{p},3))"
            sc = f"(1-(1-{s_end:.4f})*{ease})"
            pb = G.lab("pb")
            G.push(f"[{src}]scale=w='trunc({G.RW}*{sc}/2)*2':h='trunc({G.RH}*{sc}/2)*2':eval=frame[{pb}]")
            tx = f"(W-w)/2+({x + w / 2 - G.RW / 2:.1f})*{ease}"
            ty = f"(H-h)/2+({y + h / 2 - G.RH / 2:.1f})*{ease}"
            new = G.lab("o")
            G.push(f"[{canvas}][{pb}]overlay=x='{tx}':y='{ty}':eval=frame[{new}]")
            G.cur = G.overlay(keep, new, a=a_, b=b_)
        elif typ == "layout":
            a_, b_ = ev_window(ctx, e, 3.0)
            style = e.get("style", "split-top")
            keep, src = G.split(2)
            canvas = G.canvas(e.get("canvas", ctx.ui["paper"]))
            other = None
            if e.get("file"):
                p = find_media(ws, e["file"], "broll")
                if p:
                    img = p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
                    idx = G.add_input((["-loop", "1"] if img else ["-stream_loop", "-1"]) + ["-t", f"{b_ - a_ + 0.5:.3f}", "-i", p])
                    other = idx
            RW, RH = G.RW, G.RH
            l_ = G.lab("ly")
            if style in ("split-top", "split-bottom"):
                vh = RH // 2 // 2 * 2
                G.push(f"[{src}]scale={RW}:{vh}:force_original_aspect_ratio=increase,crop={RW}:{vh}[{l_}v]")
                vy = vh if style == "split-top" else 0
                comp = G.overlay(canvas, f"{l_}v", "0", str(vy))
                if other is not None:
                    G.push(f"[{other}:v]scale={RW}:{vh}:force_original_aspect_ratio=increase,crop={RW}:{vh},fps={FPS},"
                           f"setpts=PTS-STARTPTS+{a_:.3f}/TB[{l_}o]")
                    comp = G.overlay(comp, f"{l_}o", "0", str(0 if style == "split-top" else vh))
            elif style == "pip":
                pw = int(RW * float(e.get("size", 0.38))) // 2 * 2
                ph = int(pw * RH / RW) // 2 * 2
                base = canvas
                if other is not None:
                    G.push(f"[{other}:v]scale={RW}:{RH}:force_original_aspect_ratio=increase,crop={RW}:{RH},fps={FPS},"
                           f"setpts=PTS-STARTPTS+{a_:.3f}/TB[{l_}o]")
                    base = G.overlay(canvas, f"{l_}o")
                mpath = os.path.join(G.cwd, f"mask_rrect_{pw}x{ph}.png")
                if not os.path.exists(mpath):
                    png_mask(mpath, pw, ph, "rrect", r=pw * 0.08)
                idx = G.add_input(["-loop", "1", "-i", mpath])
                G.push(f"[{src}]scale={pw}:{ph},format=yuva420p[{l_}v];[{idx}:v]format=gray,scale={pw}:{ph}[{l_}m];"
                       f"[{l_}v][{l_}m]alphamerge[{l_}a]")
                corner = e.get("corner", "bottom-right")
                px = f"W-w-{RW * 0.05:.0f}" if "right" in corner else f"{RW * 0.05:.0f}"
                py = f"H-h-{RH * 0.16:.0f}" if "bottom" in corner else f"{RH * 0.08:.0f}"
                comp = G.overlay(base, f"{l_}a", px, py)
            else:  # card: video in a rounded card on the canvas
                cw = int(RW * float(e.get("size", 0.8))) // 2 * 2
                ch = int(cw * RH / RW * 0.62) // 2 * 2
                mpath = os.path.join(G.cwd, f"mask_rrect_{cw}x{ch}.png")
                if not os.path.exists(mpath):
                    png_mask(mpath, cw, ch, "rrect", r=cw * 0.05)
                idx = G.add_input(["-loop", "1", "-i", mpath])
                G.push(f"[{src}]scale={cw}:{ch}:force_original_aspect_ratio=increase,crop={cw}:{ch},format=yuva420p[{l_}v];"
                       f"[{idx}:v]format=gray,scale={cw}:{ch}[{l_}m];[{l_}v][{l_}m]alphamerge[{l_}a]")
                comp = G.overlay(canvas, f"{l_}a", "(W-w)/2", f"{RH * float(e.get('y', 0.40)):.0f}-h/2")
            G.cur = G.overlay(keep, comp, a=a_, b=b_)
        elif typ == "text_mask":
            a_, b_ = ev_window(ctx, e, 2.2)
            k = len(G.lines)
            mfile = f"mask_text_{k}.ass"
            _write_text_mask(ctx, e, a_, b_, os.path.join(G.cwd, mfile))
            keep, src = G.split(2)
            canvas = G.canvas(e.get("canvas", ctx.ui["paper"]))
            m = G.lab("tm")
            G.push(f"color=c=black:s={ctx.W}x{ctx.H}:r={FPS}:d={G.total + 1:.3f},ass={mfile},scale={G.RW}:{G.RH},format=gray[{m}m];"
                   f"[{src}]format=yuva420p[{m}v];[{m}v][{m}m]alphamerge[{m}a]")
            comp = G.overlay(canvas, f"{m}a")
            G.cur = G.overlay(keep, comp, a=a_, b=b_)
        elif typ == "slice":
            a_, b_ = ev_window(ctx, e, 0.6)
            mpath = os.path.join(G.cwd, f"mask_half_{G.RW}x{G.RH}.png")
            if not os.path.exists(mpath):
                png_mask(mpath, G.RW, G.RH, "halfplane", angle=float(e.get("angle", -0.35)))
            idx = G.add_input(["-loop", "1", "-i", mpath])
            keep, src = G.split(2)
            s_ = G.lab("sl")
            G.push(f"[{src}]format=yuva420p[{s_}v];[{idx}:v]format=gray,scale={G.RW}:{G.RH}[{s_}m];[{s_}v][{s_}m]alphamerge[{s_}]")
            dist = float(e.get("amount", 60)) * ctx.u * G.RW / ctx.W
            prog = f"min(1,max(0,(t-{a_:.3f})/0.18))*min(1,max(0,({b_:.3f}-t)/0.18))"
            new = G.lab("o")
            G.push(f"[{keep}][{s_}]overlay=x='-{dist:.1f}*{prog}':y='{dist * 0.4:.1f}*{prog}':enable='between(t,{a_:.3f},{b_:.3f})':eval=frame[{new}]")
            G.cur = new


def _write_text_mask(ctx, e, a, b, path):
    from .text import Ctx, ass_header
    m = Ctx(ctx.W, ctx.H, ctx.brand, ctx.words, ctx.dur)
    u = ctx.u
    font = resolve_font(e.get("font", "dm-serif"))
    text = str(e.get("text", "dive."))
    size = sizes_map(e.get("size"), 520) * u
    zoom = float(e.get("zoom", 1.2))
    lines, fs = m.wrap(text, font, size, ctx.W * 0.92 / max(1.0, zoom * 0.9), max_lines=2)
    st = m.style(font, fs, "#FFFFFF", "#FFFFFF", 0, 0)
    dur_ms = int((b - a) * 1000)
    lh = fs * 1.0
    y = ctx.H * float(e.get("y", 0.47))
    y0 = y - lh * (len(lines) - 1) / 2
    for i, ln in enumerate(lines):
        m.add(a, b, st, "{" + f"\\an5\\pos({ctx.W / 2:.0f},{y0 + i * lh + m.cap_shift(font, fs):.0f})\\fscx90\\fscy90"
              f"\\t(0,{dur_ms},\\fscx{90 * zoom:.0f}\\fscy{90 * zoom:.0f})" + "}" + esc(ln), layer=1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(ass_header(ctx.W, ctx.H, [v[1] for v in m.styles.values()]) +
                "\n".join(f"Dialogue: {l[1]},{_t(l[2])},{_t(l[3])},{l[4]},,0,0,0,,{l[5]}" for l in m.lines) + "\n")


def _t(t):
    from .text import ass_time
    return ass_time(t)


# --------------------------------------------------------------------------- ASS parts of video effects

def ass_freeze(ctx, e):
    a, b = ev_window(ctx, e, 1.2)
    u = ctx.u
    if e.get("flash", True):
        ctx.shape(a, a + 0.25, rect(ctx.W, ctx.H), "#FFFFFF", 0, "\\an7\\pos(0,0)\\fad(0,250)", 30)
    if e.get("text"):
        font = ctx.fkey("title")
        fs = sizes_map(e.get("size"), 60) * u
        tw = ctx.text_w(str(e["text"]).upper(), font, fs) + 70 * u
        h = fs * 1.7
        cx = ctx.clamp_x(xpos(ctx, e.get("x"), 0.5), tw)
        cy = ctx.clamp_y(ypos(ctx, e.get("position"), "upper"), h)
        rot = float(e.get("label_tilt", -4))
        tag = enter_tag("stamp", cx, cy, u) + f"\\frz{rot}" + exit_tag("fade", int((b - a) * 1000))
        ctx.shape(a, b, rrect(tw, h, 10 * u), e.get("label_color", "#FFFFFF"), 0, tag, 26)
        st = ctx.style(font, fs, e.get("label_text", "#161616"), "#000000", 0, 0)
        ctx.add(a, b, st, "{" + enter_tag("stamp", cx, cy + ctx.cap_shift(font, fs), u) + f"\\frz{rot}" + "}" + esc(str(e["text"]).upper()), layer=27)
        ctx.register(a, b, cx - tw / 2, cy - h / 2, cx + tw / 2, cy + h / 2)
    return a, b


def ass_impact(ctx, e):
    a, b = ev_window(ctx, e, 0.9)
    u = ctx.u
    import math
    import random
    rng = random.Random(int(a * 1000))
    cx, cy = ctx.W / 2, ctx.H * 0.42
    paths = []
    R = max(ctx.W, ctx.H) * 0.9
    for i in range(46):
        ang = i * (2 * math.pi / 46) + rng.uniform(-0.04, 0.04)
        inner = R * rng.uniform(0.42, 0.6)
        wdt = rng.uniform(0.006, 0.02)
        p1 = (cx + inner * math.cos(ang), cy + inner * math.sin(ang))
        p2 = (cx + R * math.cos(ang - wdt), cy + R * math.sin(ang - wdt))
        p3 = (cx + R * math.cos(ang + wdt), cy + R * math.sin(ang + wdt))
        paths.append(polygon([p1, p2, p3]))
    ms = int((b - a) * 1000)
    ctx.shape(a, b, " ".join(paths), "#000000", 0, f"\\an7\\pos(0,0)\\fad(40,120)", 20)
    ctx.shape(a, a + 0.12, rect(ctx.W, ctx.H), "#FFFFFF", 0, "\\an7\\pos(0,0)\\fad(0,120)", 31)
    if e.get("text", "") != "":
        font = resolve_font(e.get("font", "anton"))
        fs = sizes_map(e.get("size"), 190) * u
        text = str(e.get("text", "IMPACT")).upper()
        lines, fs = ctx.wrap(text, font, fs, ctx.W * 0.94, max_lines=2)
        st = ctx.style(font, fs, "#FFFFFF", "#000000", round(10 * u), 0)
        ctx.draw_lines(a, b, st, lines, font, fs, ctx.W / 2, ypos(ctx, e.get("position"), "bottom"), fs * 1.05,
                       lambda xx, yy, i: enter_tag("punch", xx, yy, u) + exit_tag("fade", ms), "#FFFFFF", ctx.accent, 22)
    ctx.extra_sfx.append((a, e.get("sfx", "impact"), 0.7))
    return a, b


def ass_frame(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    style = e.get("style", "newspaper")
    tpl = FRAME_TEMPLATES.get(style, FRAME_TEMPLATES["newspaper"])
    wx, wy, ww, wh = e.get("window") or tpl["win"]
    W, H = ctx.W, ctx.H
    X, Y, WW, WH = wx * W, wy * H, ww * W, wh * H
    ms = int((b - a) * 1000)
    ink = "#1A1A1A"
    fade = f"\\fad(120,{min(160, ms // 4)})"
    title = str(e.get("text", ""))
    sub = str(e.get("sub", ""))
    serif = resolve_font("dm-serif")
    body = ctx.fkey("body")
    if style == "newspaper":
        st = ctx.style(serif, 92 * u, ink, ink, 0, 0)
        ctx.add(a, b, st, "{" + f"\\an5\\pos({W / 2:.0f},{H * 0.075 + ctx.cap_shift(serif, 92 * u):.0f})" + fade + "}" +
                esc(e.get("masthead", "The Daily Reel")), layer=10)
        ctx.shape(a, b, rect(W * 0.9, 3 * u, W * 0.05, H * 0.12) + " " + rect(W * 0.9, 1.5 * u, W * 0.05, H * 0.128),
                  ink, 0, "\\an7\\pos(0,0)" + fade, 10)
        if title:
            lines, fs = ctx.wrap(title.upper(), serif, 96 * u, W * 0.9, max_lines=2)
            st2 = ctx.style(serif, fs, ink, ink, 0, 0)
            ctx.draw_lines(a, b, st2, lines, serif, fs, W / 2, H * 0.19, fs * 1.02, lambda xx, yy, i: f"\\an5\\pos({xx:.0f},{yy:.0f})" + fade,
                           ink, ink, 10, clamp=False)
        sst = ctx.style(serif, 40 * u, ink, ink, 0, 0)
        for col in range(3):
            cx0 = W * 0.06 + col * W * 0.3
            for r_ in range(7):
                yy = Y + WH + 40 * u + r_ * 34 * u
                if yy > H * 0.95:
                    break
                ctx.shape(a, b, rect(W * 0.26 * (0.7 + 0.3 * ((r_ * 7 + col * 3) % 5) / 4), 9 * u, cx0, yy), ink, 0xB0, "\\an7\\pos(0,0)" + fade, 10)
        if sub:
            ctx.add(a, b, sst, "{" + f"\\an5\\pos({W / 2:.0f},{Y + WH + 18 * u:.0f})\\i1" + fade + "}" + esc(sub), layer=10)
    elif style == "banknote":
        green = "#2F4A35"
        ctx.shape(a, b, rrect(W * 0.94, H * 0.94, 30 * u, W * 0.03, H * 0.03), "#000000", 0xFF, "\\an7\\pos(0,0)" + fade, 10,
                  outline=green, bord=round(6 * u))
        ctx.shape(a, b, rrect(W * 0.88, H * 0.88, 20 * u, W * 0.06, H * 0.06), "#000000", 0xFF, "\\an7\\pos(0,0)" + fade, 10,
                  outline=green, bord=round(2 * u))
        cx_, cy_ = X + WW / 2, Y + WH / 2
        from .text import ellipse
        ctx.shape(a, b, ellipse(WW / 2 + 14 * u, WH / 2 + 14 * u, cx_, cy_), "#000000", 0xFF, "\\an7\\pos(0,0)" + fade, 10,
                  outline=green, bord=round(5 * u))
        num = str(e.get("number", e.get("text", "100")))
        nst = ctx.style(serif, 130 * u, green, green, 0, 0)
        ctx.add(a, b, nst, "{" + f"\\an5\\pos({W / 2:.0f},{H * 0.735 + ctx.cap_shift(serif, 130 * u):.0f})" + fade + "}" + esc(num), layer=10)
        if sub:
            sst = ctx.style(serif, 48 * u, green, green, 0, 0)
            ctx.add(a, b, sst, "{" + f"\\an5\\pos({W / 2:.0f},{H * 0.815:.0f})" + fade + "}" + esc(sub.upper()), layer=10)
        cst = ctx.style(serif, 40 * u, green, green, 0, 0)
        for (px, py) in ((0.14, 0.09), (0.86, 0.09), (0.14, 0.91), (0.86, 0.91)):
            ctx.add(a, b, cst, "{" + f"\\an5\\pos({W * px:.0f},{H * py:.0f})" + fade + "}" + esc(num), layer=10)
    elif style == "polaroid":
        pad = 26 * u
        ctx.shape(a, b, rect(WW + pad * 2, WH + pad * 2 + 170 * u, X - pad, Y - pad), "#FAFAF7", 0, "\\an7\\pos(0,0)" + fade, 3)
        if title:
            hf = resolve_font("marker")
            st = ctx.style(hf, 70 * u, ink, ink, 0, 0)
            ctx.add(a, b, st, "{" + f"\\an5\\pos({W / 2:.0f},{Y + WH + 90 * u:.0f})" + fade + "}" + esc(title), layer=10)
    elif style == "phone":
        ctx.shape(a, b, rrect(WW + 26 * u, WH + 26 * u, 0.07 * W + 13 * u, X - 13 * u, Y - 13 * u), "#000000", 0xFF,
                  "\\an7\\pos(0,0)" + fade, 10, outline="#111111", bord=round(14 * u))
        ctx.shape(a, b, rrect(WW * 0.32, 34 * u, 17 * u, X + WW * 0.34, Y + 14 * u), "#000000", 0, "\\an7\\pos(0,0)" + fade, 11)
        if title:
            lines, fs = ctx.wrap(title, ctx.fkey("title"), 80 * u, W * 0.86, max_lines=2)
            st = ctx.style(ctx.fkey("title"), fs, ink, ink, 0, 0)
            ctx.draw_lines(a, b, st, lines, ctx.fkey("title"), fs, W / 2, H * 0.09, fs * 1.1,
                           lambda xx, yy, i: enter_tag("rise", xx, yy, u) + fade, ink, ctx.accent, 10, clamp=False)
    elif style == "window":
        ctx.shape(a, b, rrect(WW, 56 * u, 0.02 * W, X, Y - 56 * u), "#FFFFFF", 0, "\\an7\\pos(0,0)" + fade, 10)
        for i, c in enumerate(("#FF5F57", "#FEBC2E", "#28C840")):
            ctx.shape(a, b, circle(10 * u, X + 34 * u + i * 32 * u, Y - 28 * u), c, 0, "\\an7\\pos(0,0)" + fade, 11)
        if e.get("url", True):
            ctx.shape(a, b, rrect(WW * 0.5, 30 * u, 15 * u, X + WW * 0.25, Y - 43 * u), "#EFEFEF", 0, "\\an7\\pos(0,0)" + fade, 11)
        if title:
            lines, fs = ctx.wrap(title, ctx.fkey("title"), 84 * u, W * 0.86, max_lines=2)
            st = ctx.style(ctx.fkey("title"), fs, ink, ink, 0, 0)
            ctx.draw_lines(a, b, st, lines, ctx.fkey("title"), fs, W / 2, H * 0.14, fs * 1.1,
                           lambda xx, yy, i: enter_tag("rise", xx, yy, u) + fade, ink, ctx.accent, 10, clamp=False)
        if sub:
            sst = ctx.style(body, 46 * u, "#555555", "#000000", 0, 0)
            ctx.add(a, b, sst, "{" + f"\\an5\\pos({W / 2:.0f},{Y + WH + 70 * u:.0f})" + fade + "}" + esc(sub), layer=10)
    elif style == "magazine":
        mf = resolve_font(e.get("font", "dm-serif"))
        mt = str(e.get("masthead", title or "VIBE")).upper()
        lines, fs = ctx.wrap(mt, mf, 330 * u, W * 0.96, max_lines=1)
        st = ctx.style(mf, fs, e.get("color", "#FFFFFF"), "#000000", 0, round(3 * u))
        behind = e.get("behind", True)
        ctx.add(a, b, st, "{" + f"\\an5\\pos({W / 2:.0f},{H * 0.14 + ctx.cap_shift(mf, fs):.0f})" + fade + "}" + esc(lines[0]),
                layer=8, behind=behind)
        if sub:
            sst = ctx.style(body, 48 * u, "#FFFFFF", "#000000", 0, round(2 * u))
            ctx.add(a, b, sst, "{" + f"\\an4\\pos({W * 0.07:.0f},{H * 0.80:.0f})" + fade + "}" + esc(sub.upper()), layer=10)
    elif style == "film":
        for side in (Y - 70 * u, Y + WH + 18 * u):
            for i in range(14):
                ctx.shape(a, b, rrect(40 * u, 50 * u, 6 * u, W * 0.06 + i * W * 0.064, side), "#F2F2F2", 0x20, "\\an7\\pos(0,0)" + fade, 10)
    elif style == "tv":
        ctx.shape(a, b, rrect(WW + 60 * u, WH + 60 * u, 0.06 * W, X - 30 * u, Y - 30 * u), "#000000", 0xFF,
                  "\\an7\\pos(0,0)" + fade, 10, outline="#3A3A3A", bord=round(22 * u))
    ctx.register(a, b, 0, 0, W, H, "frame")
    if "sfx" not in e:
        ctx.extra_sfx.append((a, "whoosh", 0.4))
    return a, b


def ass_slice(ctx, e):
    a, b = ev_window(ctx, e, 0.6)
    u = ctx.u
    import math
    ang = float(e.get("angle", -0.35))
    L = math.hypot(ctx.W, ctx.H)
    cx, cy = ctx.W / 2, ctx.H / 2
    dx, dy = math.cos(ang) * L / 2, -math.sin(ang) * L / 2
    from .text import thick_line
    path = thick_line(cx - dx, cy - dy, cx + dx, cy + dy, 7 * u)
    ctx.shape(a, a + 0.25, path, "#FFFFFF", 0, f"\\an7\\pos(0,0)\\clip(0,0,1,{ctx.H})\\t(0,120,\\clip(0,0,{ctx.W},{ctx.H}))\\fad(0,120)", 28,
              blur=round(2 * u))
    ctx.shape(a, a + 0.25, path, "#FFFFFF", 0x60, f"\\an7\\pos(0,0)\\clip(0,0,1,{ctx.H})\\t(0,120,\\clip(0,0,{ctx.W},{ctx.H}))\\fad(0,140)", 27,
              blur=round(14 * u))
    ctx.extra_sfx.append((a, e.get("sfx", "whoosh-fast"), 0.6))
    return a, b


def ass_blackout(ctx, e):
    a, b = ev_window(ctx, e, 1.2)
    if e.get("text"):
        from .fx_text import ev_title
        ev_title(ctx, dict({"style": "fade", "position": "center", "size": "l", "at": a, "dur": b - a}, **{k: v for k, v in e.items() if k not in ("type", "at", "until", "dur")}),
                 118, "center")
    return a, b


def ass_text_mask(ctx, e):
    a, b = ev_window(ctx, e, 2.2)
    ctx.register(a, b, 0, 0, ctx.W, ctx.H, "frame")
    if "sfx" not in e:
        ctx.extra_sfx.append((a, "whoosh", 0.45))
    return a, b


def ass_pullback(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    tpl = FRAME_TEMPLATES.get(e.get("style", "window"), FRAME_TEMPLATES["window"])
    ee = dict(e)
    ee["style"] = e.get("style", "window")
    if ee["style"] in ("window", "phone"):
        sub_e = dict(ee, at=a + float(e.get("ramp", 0.55)), dur=max(0.3, b - a - float(e.get("ramp", 0.55))))
        sub_e.pop("until", None)
        ass_frame(ctx, sub_e)
    _ = tpl
    ctx.extra_sfx.append((a, e.get("sfx", "whoosh"), 0.4))
    return a, b


ASS_EVENTS = {"freeze": ass_freeze, "impact": ass_impact, "frame": ass_frame, "slice": ass_slice, "blackout": ass_blackout,
              "text_mask": ass_text_mask, "pullback": ass_pullback}

HIDE_CAPTIONS = {"frame", "text_mask", "impact", "blackout", "pullback"}

VIDEO_TYPES = {"zoom", "shake", "glitch", "bw", "blur", "darken", "broll", "image", "overlay", "freeze", "rack_focus",
               "impact", "spotlight", "frame", "pullback", "layout", "text_mask", "double_exposure", "slice", "blackout",
               "filter", "vhs", "invert", "sepia", "pixelate", "mirror", "sticker_file"}
_unused = (run_ff, c_tag)

DOCS = {
    "zoom": "Camera zoom. style punch|push|slow|pulse|pull|through (fast zoom-through cut), amount 1.1–2.2, focus [x,y]",
    "shake": "Camera shake. dur 0.3–0.5, amount",
    "glitch": "RGB-split glitch moment (+ sound). dur",
    "bw": "Black & white moment. dur",
    "sepia": "Sepia moment. dur",
    "invert": "Colour-inverted flash moment. dur",
    "pixelate": "Pixelate moment (censor / transition). dur, amount",
    "mirror": "Horizontally mirrored moment. dur",
    "vhs": "VHS tape moment (colour bleed + noise). dur",
    "blur": "Blur the video. dur, amount",
    "darken": "Dim the video. dur, amount 0.1–0.5",
    "blackout": "Cut to black, optional centred text. dur, text",
    "impact": "Manga impact frame: high-contrast B&W + speed lines + big text + shake. text, dur",
    "rack_focus": "Focus pull: blurry → sharp (direction in) or sharp → blurry (out). dur, amount",
    "freeze": "Freeze frame (audio keeps playing) + flash + optional stamped label. text, dur, scale (<1 = framed), tilt",
    "spotlight": "Darken everything except a soft circle. x, y (0–1), size, darkness",
    "broll": "Cut away to a clip/image from broll/. file, from, mode full|pip|split-top|split-bottom, size, y",
    "image": "Logo/sticker/PNG/GIF/transparent video overlay. file (default brand logo), position top-right|top-left|top|center|bottom-right|bottom-left|bottom or x,y, size",
    "overlay": "Same as image (for transparent .mov/.webm/.gif animations you bring).",
    "double_exposure": "Blend you with a b-roll clip (screen blend, B&W). file, from, dur",
    "frame": "Put the video inside a designed frame. style newspaper|banknote|polaroid|phone|window|magazine|film|tv, "
             "text (headline/caption), sub, number (banknote), masthead (newspaper/magazine), window [x,y,w,h]",
    "pullback": "Video shrinks from full screen into a window/phone on a clean canvas. style window|phone, text, sub, ramp",
    "layout": "Re-layout the frame. style split-top|split-bottom|pip|card, file (other half / background), size, corner",
    "text_mask": "Giant letters filled with your video on a paper background ('letter dive'). text, font, size, zoom, canvas",
    "slice": "Blade slice: white slash + the frame splits and slides. angle, amount",
    "filter": "Advanced: any ffmpeg video filter for a time window (validated first). filter, dur",
}
