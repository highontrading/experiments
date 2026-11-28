"""Frame-accurate motion-graphic clips (rounded video cards on a canvas) rendered with PIL + ffmpeg pipes."""
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FPS = 30


def read_frames(src, start, dur, w, h, vf_extra=""):
    """Decode src from start for dur seconds, scaled to cover w x h."""
    vf = f"fps={FPS},scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"
    if vf_extra:
        vf += "," + vf_extra
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{dur + 0.2:.3f}", "-i", src, "-vf", vf,
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw, np.uint8)[: n * w * h * 3].reshape(n, h, w, 3)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def rounded_mask(w, h, r, ss=3):
    m = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)


def card_clip(src, src_start, dur, out, canvas=(0, 0, 0), size=(1080, 1920), box=(160, 430, 760, 1060), radius=46,
              scale_from=0.9, scale_time=0.55, inner_zoom=(1.0, 1.08), vf_extra="", shadow=True, canvas_img=None,
              border=None):
    """Video inside a rounded card that scales in (ease-out) on a solid/image canvas, slow push-in inside."""
    W, H = size
    bx, by, bw, bh = box
    zmax = max(inner_zoom)
    fw, fh = int(bw * zmax) // 2 * 2, int(bh * zmax) // 2 * 2
    frames = read_frames(src, src_start, dur, fw, fh, vf_extra)
    n = int(round(dur * FPS))
    base = Image.open(canvas_img).convert("RGB").resize((W, H)) if canvas_img else Image.new("RGB", (W, H), canvas)
    mask_full = rounded_mask(bw, bh, radius)
    shadow_img = None
    if shadow:
        sh = Image.new("L", (bw + 160, bh + 160), 0)
        ImageDraw.Draw(sh).rounded_rectangle([80, 95, 80 + bw, 95 + bh], radius, fill=150)
        shadow_img = sh.filter(ImageFilter.GaussianBlur(38))
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                          "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for k in range(n):
        t = k / FPS
        fr = frames[min(k, len(frames) - 1)]
        z = inner_zoom[0] + (inner_zoom[1] - inner_zoom[0]) * (t / max(dur, 0.01))
        # crop the centre for the inner push-in, then resize to the card size
        cw, chh = max(16, min(fw, int(fw / z))), max(16, min(fh, int(fh / z)))
        x0, y0 = (fw - cw) // 2, (fh - chh) // 2
        img = Image.fromarray(fr[y0:y0 + chh, x0:x0 + cw]).resize((bw, bh), Image.BILINEAR)
        s = scale_from + (1 - scale_from) * ease_out(t / scale_time) if scale_time > 0 else 1.0
        sw, shh = max(2, int(bw * s)), max(2, int(bh * s))
        cx, cy = bx + bw / 2, by + bh / 2
        frame = base.copy()
        if shadow_img is not None:
            shs = shadow_img.resize((int(shadow_img.width * s), int(shadow_img.height * s)))
            dark = Image.new("RGB", shs.size, (0, 0, 0))
            frame.paste(dark, (int(cx - shs.width / 2), int(cy - shs.height / 2 + 10 * s)), shs)
        if border:
            bwid, bcol = border
            bm = rounded_mask(sw + 2 * bwid, shh + 2 * bwid, int((radius + bwid) * s))
            frame.paste(Image.new("RGB", bm.size, bcol), (int(cx - bm.width / 2), int(cy - bm.height / 2)), bm)
        frame.paste(img.resize((sw, shh), Image.BILINEAR), (int(cx - sw / 2), int(cy - shh / 2)),
                    mask_full.resize((sw, shh), Image.BILINEAR))
        p.stdin.write(frame.tobytes())
    p.stdin.close()
    p.wait()
    return out


if __name__ == "__main__":
    import sys
    card_clip(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4])
