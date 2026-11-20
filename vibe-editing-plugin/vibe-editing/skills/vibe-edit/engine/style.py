"""Stage 3: the style scraper.

  ve.py style extract refs/reel.mp4 [more refs...] --name my-style
      -> styles/my-style/auto.json      measured numbers (pacing, colour, sound)
      -> styles/my-style/style.json     draft style (measured values filled, the rest marked TODO)
      -> styles/my-style/*.jpg          contact sheets for Claude to look at
  ve.py style card my-style            -> styles/my-style/style_card.html
  ve.py style list
"""
from __future__ import annotations

import base64
import copy
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np

from analyze import color_stats, loudness
from common import (FONTS, FONTS_DIR, IMAGE_EXT, VIDEO_EXT, die, extract_frames_rgb, font_info, log, probe, rel,
                    run, save_json, load_json, tile_frames)

DEFAULT_STYLE = {
    "name": "vibe-default",
    "description": "Clean bold reel style: white heavy captions, yellow active word, pop-in, light punch-ins.",
    "sources": [],
    "pacing": {"pace": "tight", "cuts_per_min": None, "avg_shot_seconds": None, "punch_in": True,
               "zoom_scale": 1.12, "zoom_pattern": "alternate", "zoom_motion": "cut"},
    "captions": {"font": "Poppins Black", "size": 88, "case": "upper", "words_per_line": 3, "position_y": 0.70,
                 "color": "#FFFFFF", "active_color": "#FFE14D", "emphasis_color": "#FFE14D",
                 "outline_color": "#000000", "outline": 6, "shadow": 3, "shadow_color": "#000000",
                 "box": False, "box_color": "#000000", "box_opacity": 0.0, "highlight": "color",
                 "animation": "pop", "letter_spacing": 0},
    "hook": {"font": "Poppins Black", "size": 64, "case": "upper", "color": "#111111", "box_color": "#FFFFFF",
             "box_opacity": 0.0, "position_y": 0.17, "animation": "pop", "duration": 2.6},
    "motion": {"font": "Poppins Black", "color": "#FFFFFF", "accent": "#FFE14D", "kinetic_type": True,
               "lower_thirds": True, "title_cards": False, "labels": True, "transition": "jump"},
    "look": {"lut_from_reference": False, "lut_strength": 0.6, "contrast": 1.05, "saturation": 1.08,
             "brightness": 0.0, "gamma": 1.0, "warmth": 0.0, "vignette": 0.15, "grain": 0.0, "sharpen": 0.3},
    "sound": {"voice_cleanup": True, "music": True, "music_level_db": -21, "duck": True, "sfx": True,
              "sfx_level_db": -11, "sfx_density": "medium", "sfx_on_zoom": "whoosh", "sfx_on_hook": "pop",
              "sfx_on_text": "pop"},
    "reference_stats": None,
}

TODO = "TODO: fill from the frames"


def deep_merge(base, over):
    out = copy.deepcopy(base)
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def full_style(style: dict | None) -> dict:
    """A style with every field present (missing fields fall back to the default)."""
    s = deep_merge(DEFAULT_STYLE, style or {})
    for sec in ("captions", "hook", "motion"):
        if isinstance(s[sec].get("font"), str):
            s[sec]["font"] = font_info(s[sec]["font"])[0]
    return s


# ---------------------------------------------------------------- measuring a reference video
def scene_cuts(path, threshold=0.22):
    r = run(["ffmpeg", "-v", "info", "-i", str(path), "-an", "-vf",
             f"scale=240:-2,select='gt(scene,{threshold})',showinfo", "-f", "null", "-"], check=False)
    return [round(float(m.group(1)), 3) for m in re.finditer(r"pts_time:([\d.]+)", r.stderr)]


def motion_energy(path, dur):
    times = [i * 0.25 for i in range(int(min(dur, 20) / 0.25))]
    fr = extract_frames_rgb(path, times[:80], 64)
    if len(fr) < 2:
        return None
    diffs = [float(np.abs(a.astype(int) - b.astype(int)).mean()) for a, b in zip(fr, fr[1:]) if a.shape == b.shape]
    return round(float(np.median(diffs)) / 255, 4) if diffs else None


def audio_stats(path, dur):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le",
                        "-"], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        return None
    x = np.frombuffer(r.stdout, dtype="<i2").astype(np.float32) / 32768
    hop = 512
    n = len(x) // hop
    if n < 10:
        return None
    frames = x[: n * hop].reshape(n, hop)
    rms = np.sqrt((frames ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms + 1e-9)
    near_silent = float((db < -45).mean())
    spec = np.abs(np.fft.rfft(frames * np.hanning(hop), axis=1))
    flux = np.maximum(spec[1:] - spec[:-1], 0).sum(1)
    thr = np.median(flux) + 3.0 * np.std(flux)
    peaks = [i for i in range(1, len(flux) - 1) if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
    # merge onsets closer than 120 ms
    onsets, last = [], -1e9
    for p in peaks:
        t = p * hop / 16000
        if t - last > 0.12:
            onsets.append(t)
            last = t
    loud = loudness(path)
    return {"lufs": loud.get("lufs"), "near_silent_ratio": round(near_silent, 3),
            "continuous_bed_likely": near_silent < 0.03, "hits_per_min": round(len(onsets) / max(dur, 1) * 60, 1)}


def extract(refs, name, workspace: Path):
    workspace = Path(workspace).resolve()
    sdir = workspace / "styles" / name
    sdir.mkdir(parents=True, exist_ok=True)
    vids = [Path(r) for r in refs if Path(r).suffix.lower() in VIDEO_EXT]
    imgs = [Path(r) for r in refs if Path(r).suffix.lower() in IMAGE_EXT]
    for d in [Path(r) for r in refs if Path(r).is_dir()]:
        imgs += sorted(p for p in d.iterdir() if p.suffix.lower() in IMAGE_EXT)
        vids += sorted(p for p in d.iterdir() if p.suffix.lower() in VIDEO_EXT)
    missing = [r for r in refs if not Path(r).exists()]
    if missing:
        die(f"reference not found: {missing}")
    if not vids and not imgs:
        die("give at least one reference video or image")

    auto = {"name": name, "videos": [], "images": [], "sheets": {}}
    all_frames = []
    for vi, v in enumerate(vids):
        info = probe(v)
        dur = info["duration"]
        cuts = scene_cuts(v)
        bounds = [0.0] + cuts + [dur]
        shots = [b - a for a, b in zip(bounds, bounds[1:]) if b - a > 0.05]
        mids = [(a + b) / 2 for a, b in zip(bounds, bounds[1:]) if b - a > 0.05]
        if len(mids) > 16:
            mids = [mids[int(i * len(mids) / 16)] for i in range(16)]
        if len(mids) < 8:
            mids = [dur * (i + 0.5) / 8 for i in range(8)]
        tag = f"v{vi + 1}"
        tw = 270 if info.get("height", 1) >= info.get("width", 1) else 400
        sheets = {"shots": tile_frames(v, mids, sdir / f"{tag}_shots.jpg", cols=4, width=tw),
                  "hook": tile_frames(v, [i * 0.5 for i in range(int(min(dur, 3.5) / 0.5) + 1)],
                                      sdir / f"{tag}_hook.jpg", cols=4, width=tw)}
        for k, frac in enumerate([0.3, 0.55, 0.8]):
            t0 = dur * frac
            sheets[f"burst{k + 1}"] = tile_frames(v, [t0 + i / 12 for i in range(8)], sdir / f"{tag}_burst{k + 1}.jpg",
                                                  cols=4, width=tw)
        for k, frac in enumerate([0.4, 0.7]):
            sheets[f"detail{k + 1}"] = tile_frames(v, [dur * frac], sdir / f"{tag}_detail{k + 1}.jpg", cols=1,
                                                   width=720, label=False)
        auto["sheets"][tag] = {k: rel(p, sdir) for k, p in sheets.items() if p}
        frames = extract_frames_rgb(v, [dur * (i + 0.5) / 10 for i in range(10)], 128)
        all_frames += frames
        auto["videos"].append({
            "file": str(v), "duration": round(dur, 2), "width": info.get("width"), "height": info.get("height"),
            "fps": info.get("fps"), "cuts": len(cuts),
            "cuts_per_min": round(len(cuts) / max(dur, 1) * 60, 1),
            "avg_shot_seconds": round(float(np.mean(shots)), 2) if shots else None,
            "motion_energy": motion_energy(v, dur),
            "audio": audio_stats(v, dur) if info.get("has_audio") else None,
            "color": color_stats(frames),
        })
    if imgs:
        tmp = sdir / ".imgs"
        tmp.mkdir(exist_ok=True)
        for i, im in enumerate(imgs[:16]):
            run(["ffmpeg", "-y", "-v", "error", "-i", str(im), "-vf",
                 "scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2:white",
                 "-q:v", "3", str(tmp / f"i{i:03d}.jpg")])
        cols = min(4, len(imgs))
        rows = (min(len(imgs), 16) + cols - 1) // cols
        run(["ffmpeg", "-y", "-v", "error", "-framerate", "1", "-i", str(tmp / "i%03d.jpg"), "-vf",
             f"tile={cols}x{rows}:padding=6:color=white", "-frames:v", "1", "-q:v", "3", str(sdir / "images.jpg")])
        shutil.rmtree(tmp, ignore_errors=True)
        auto["sheets"]["images"] = {"images": "images.jpg"}
        frames = [f for im in imgs for f in extract_frames_rgb(im, [0], 160)]
        all_frames += frames
        auto["images"] = [{"file": str(i)} for i in imgs]
        auto["images_color"] = color_stats(frames)

    auto["color"] = color_stats(all_frames)
    save_json(sdir / "auto.json", auto)

    # ------------------------------------------------ draft style.json
    style = copy.deepcopy(DEFAULT_STYLE)
    style["name"] = name
    style["description"] = TODO
    style["sources"] = [str(p) for p in vids + imgs]
    if auto["videos"]:
        v0 = auto["videos"][0]
        shot = v0["avg_shot_seconds"] or 3
        style["pacing"].update(cuts_per_min=v0["cuts_per_min"], avg_shot_seconds=v0["avg_shot_seconds"],
                               pace="tight" if shot < 2.5 else "natural" if shot < 5 else "relaxed")
        a = v0.get("audio") or {}
        if a:
            style["sound"]["music"] = bool(a.get("continuous_bed_likely", True))
            hpm = a.get("hits_per_min") or 0
            style["sound"]["sfx_density"] = "high" if hpm > 40 else "medium" if hpm > 18 else "low"
    c = auto["color"]
    if c:
        style["reference_stats"] = {k: c[k] for k in ("lab_mean", "lab_std", "brightness", "contrast", "saturation",
                                                    "warmth", "palette", "grain", "vignette")}
        graded = abs(c["warmth"]) > 6 or c["saturation"] > 0.42 or c["saturation"] < 0.18 or c["contrast"] > 0.27
        style["look"].update(lut_from_reference=True, lut_strength=0.65 if graded else 0.45,
                             contrast=1.0, saturation=1.0, warmth=0.0,
                             vignette=round(min(0.6, max(0.0, c["vignette"] * 2)), 2),
                             grain=round(min(0.6, max(0.0, (c["grain"] - 1.5) / 6)), 2))
        pal = c["palette"]
        style["motion"]["accent"] = _most_saturated(pal) or style["motion"]["accent"]
    for sec, fields in {"captions": ["font", "size", "case", "words_per_line", "position_y", "color", "active_color",
                                     "outline", "highlight", "animation"],
                        "hook": ["font", "color", "box_color", "position_y"],
                        "motion": ["font", "kinetic_type", "lower_thirds", "title_cards", "transition"],
                        "pacing": ["punch_in", "zoom_scale", "zoom_motion"]}.items():
        style[sec]["_todo"] = fields
    save_json(sdir / "style.json", style)
    log(f"style draft written to {sdir / 'style.json'}")
    return sdir, auto


def _most_saturated(pal):
    best, bs = None, 0.25
    for hx in pal:
        r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
        mx, mn = max(r, g, b), min(r, g, b)
        s = (mx - mn) / mx if mx else 0
        if s > bs and mx > 0.35:
            best, bs = hx, s
    return best.upper() if best else None


# ---------------------------------------------------------------- style card
def _font_face(key):
    k, (file, *_rest) = font_info(key)
    data = base64.b64encode((FONTS_DIR / file).read_bytes()).decode()
    fmt = "opentype" if file.endswith(".otf") else "truetype"
    return f"@font-face{{font-family:'{k}';src:url(data:font/{fmt};base64,{data}) format('{fmt}');}}"


def card(style_dir: Path):
    sdir = Path(style_dir)
    s = full_style(load_json(sdir / "style.json"))
    auto = load_json(sdir / "auto.json", {}) or {}
    cap, hook, look, motion = s["captions"], s["hook"], s["look"], s["motion"]
    fonts = {cap["font"], hook["font"], motion["font"]}
    faces = "".join(_font_face(f) for f in fonts)
    sheets = []
    for tag, d in (auto.get("sheets") or {}).items():
        for k, p in d.items():
            if (sdir / p).exists() and not k.startswith("detail"):
                sheets.append((f"{tag} · {k}", p))
    bg = None
    for tag, d in (auto.get("sheets") or {}).items():
        if "detail1" in d:
            bg = d["detail1"]
            break
        if "images" in d:
            bg = d["images"]
    pal = (s.get("reference_stats") or {}).get("palette") or []
    words = "THIS IS YOUR CAPTION STYLE".split()
    wpl = max(1, int(cap["words_per_line"]))
    shown = words[:wpl]
    k_active = min(1, len(shown) - 1)
    scale = 360 / 1080

    def cap_html():
        out = []
        for i, w in enumerate(shown):
            col = cap["active_color"] if (i == k_active and cap["highlight"] != "none") else cap["color"]
            extra = ""
            if i == k_active and cap["highlight"] == "box":
                extra = f"background:{cap['active_color']};color:{cap['color']};border-radius:8px;padding:0 6px;"
                col = "#111"
            if i == k_active and cap["highlight"] == "scale":
                extra = "display:inline-block;transform:scale(1.12);"
            t = w if cap["case"] != "lower" else w.lower()
            out.append(f"<span style='color:{col};{extra}'>{html.escape(t)}</span>")
        return " ".join(out)

    stroke = cap["outline"] * scale
    cap_css = (f"font-family:'{cap['font']}';font-size:{cap['size'] * scale:.1f}px;"
               f"letter-spacing:{cap['letter_spacing']}px;"
               f"-webkit-text-stroke:{stroke:.1f}px {cap['outline_color']};paint-order:stroke fill;"
               f"text-shadow:0 {cap['shadow'] * scale:.1f}px 0 {cap['shadow_color']};"
               f"top:{cap['position_y'] * 100:.1f}%;" +
               (f"background:{cap['box_color']};padding:4px 10px;border-radius:6px;" if cap["box"] else ""))
    hook_txt = "THE HOOK SITS HERE"
    hook_css = (f"font-family:'{hook['font']}';font-size:{hook['size'] * scale:.1f}px;color:{hook['color']};"
                f"top:{hook['position_y'] * 100:.1f}%;" +
                (f"background:{hook['box_color']};" if hook.get("box_opacity", 0) < 1 else ""))
    rows = lambda d: "".join(f"<tr><td>{html.escape(str(k))}</td><td>{html.escape(str(v))}</td></tr>"
                             for k, v in d.items() if not str(k).startswith("_"))
    todo = [f"{sec}.{f}" for sec in ("captions", "hook", "motion", "pacing") for f in s[sec].get("_todo", [])]
    page = f"""<!doctype html><html><head><meta charset="utf-8"><title>Style card · {html.escape(s['name'])}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{faces}
:root{{--bg:#f4f1ea;--fg:#141414;--mut:#6b6b6b;--card:#fff;--line:#e3ded3}}
@media (prefers-color-scheme:dark){{:root{{--bg:#121212;--fg:#f2f2f2;--mut:#a0a0a0;--card:#1d1d1d;--line:#333}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}}
.wrap{{max-width:1100px;margin:0 auto;padding:28px 16px}}
h1{{font-size:34px;margin:0}} .mut{{color:var(--mut)}}
.grid{{display:grid;grid-template-columns:380px 1fr;gap:24px;margin-top:20px}}
@media(max-width:800px){{.grid{{grid-template-columns:1fr}}}}
.phone{{width:360px;height:640px;border-radius:28px;overflow:hidden;position:relative;background:#333 center/cover;
  {f"background-image:url('{bg}');" if bg else ""}box-shadow:0 20px 50px rgba(0,0,0,.25)}}
.cap,.hook{{position:absolute;left:0;right:0;text-align:center;transform:translateY(-50%);line-height:1.1;padding:0 18px;
  {"text-transform:uppercase;" if cap["case"] == "upper" else ""}}}
.hook span{{padding:6px 12px;border-radius:8px;{"text-transform:uppercase;" if hook["case"] == "upper" else ""}}}
.box{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px}}
.sw{{display:inline-block;width:46px;height:46px;border-radius:10px;margin:0 6px 6px 0;border:1px solid var(--line)}}
table{{border-collapse:collapse;width:100%;font-size:14px}} td{{padding:4px 6px;border-bottom:1px solid var(--line)}}
td:first-child{{color:var(--mut);width:42%}}
.sheets img{{max-width:100%;border-radius:10px;margin:6px 0;border:1px solid var(--line)}}
.todo{{background:#fff3cd;color:#664d03;border-radius:10px;padding:10px 14px}}
</style></head><body><div class="wrap">
<h1>{html.escape(s['name'])}</h1><p class="mut">{html.escape(s.get('description') or '')}</p>
{f'<p class="todo">Still to fill in: {", ".join(todo)}</p>' if todo else ''}
<div class="grid"><div>
 <div class="phone"><div class="hook" style="{hook_css}"><span style="background:{hook['box_color']}">{hook_txt}</span></div>
 <div class="cap" style="{cap_css}">{cap_html()}</div></div>
 <div class="box" style="margin-top:16px"><b>Palette</b><br>{''.join(f'<span class="sw" title="{p}" style="background:{p}"></span>' for p in pal)}</div>
</div><div>
 <div class="box"><b>Captions</b> · {html.escape(cap['font'])}<table>{rows(cap)}</table></div>
 <div class="box"><b>Pacing</b><table>{rows(s['pacing'])}</table></div>
 <div class="box"><b>Look</b><table>{rows(look)}</table></div>
 <div class="box"><b>Motion</b><table>{rows(motion)}</table></div>
 <div class="box"><b>Sound</b><table>{rows(s['sound'])}</table></div>
 <div class="box"><b>Hook</b><table>{rows(hook)}</table></div>
</div></div>
<div class="box sheets"><b>What the scraper looked at</b>{''.join(f'<p class="mut">{html.escape(t)}</p><img src="{p}" loading="lazy">' for t, p in sheets)}</div>
</div></body></html>"""
    out = sdir / "style_card.html"
    out.write_text(page, encoding="utf-8")
    return out


def list_styles(workspace: Path):
    sd = Path(workspace) / "styles"
    out = []
    for d in sorted(sd.glob("*/style.json")) if sd.exists() else []:
        s = load_json(d) or {}
        out.append({"name": d.parent.name, "description": s.get("description"),
                    "font": (s.get("captions") or {}).get("font")})
    return out
