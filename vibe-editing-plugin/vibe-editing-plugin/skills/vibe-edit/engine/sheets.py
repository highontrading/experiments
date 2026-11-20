"""Image sheets the user picks from (no browser): caption styles, motion graphics, colour looks,
and the style card. Every sample is rendered by the real renderer on a frame of the user's own
video, so what they pick is what they get.

  ve.py captions <project>   -> <project>/choices/captions.png   (A–H + R from the reference style)
  ve.py motion <project>     -> <project>/choices/motion.png     (kinetic, label, lower third, title, CTA)
  ve.py looks <project>      -> <project>/choices/looks.png      (natural, bright, warm, cool, punchy, film, R)
"""
from __future__ import annotations

import copy
import shutil
from pathlib import Path

from captions import AssBuilder
from common import FONTS_DIR, PRESETS, TimeMap, die, load_json, log, probe, resolve_style, run
from style import full_style

CAPTION_PRESETS = {
    "A": ("Bold pop", {"font": "Poppins Black", "size": 88, "case": "upper", "words_per_line": 3, "color": "#FFFFFF",
                       "active_color": "#FFE14D", "emphasis_color": "#FFE14D", "outline_color": "#000000",
                       "outline": 6, "shadow": 3, "box": False, "highlight": "color", "animation": "pop"}),
    "B": ("Marker highlight", {"font": "Poppins ExtraBold", "size": 84, "case": "upper", "words_per_line": 3,
                               "color": "#FFFFFF", "active_color": "#FFE14D", "emphasis_color": "#FFE14D",
                               "outline_color": "#000000", "outline": 5, "shadow": 0, "box": False,
                               "highlight": "box", "animation": "pop"}),
    "C": ("One word at a time", {"font": "Luckiest Guy", "size": 132, "case": "upper", "words_per_line": 1,
                                 "color": "#FFFFFF", "active_color": "#FFFFFF", "emphasis_color": "#FFE14D",
                                 "outline_color": "#000000", "outline": 8, "shadow": 4, "box": False,
                                 "highlight": "word", "animation": "pop"}),
    "D": ("Clean minimal", {"font": "Inter ExtraBold", "size": 64, "case": "as-is", "words_per_line": 4,
                            "color": "#FFFFFF", "active_color": "#FFFFFF", "emphasis_color": "#FFFFFF",
                            "outline_color": "#000000", "outline": 0, "shadow": 3, "box": False,
                            "highlight": "none", "animation": "fade"}),
    "E": ("Subtitle box", {"font": "Inter Bold", "size": 58, "case": "as-is", "words_per_line": 5,
                           "color": "#FFFFFF", "active_color": "#FFFFFF", "emphasis_color": "#FFE14D",
                           "outline_color": "#000000", "outline": 0, "shadow": 0, "box": True,
                           "box_color": "#000000", "highlight": "none", "animation": "fade"}),
    "F": ("Condensed impact", {"font": "Anton", "size": 104, "case": "upper", "words_per_line": 3,
                               "color": "#FFFFFF", "active_color": "#00E5FF", "emphasis_color": "#00E5FF",
                               "outline_color": "#000000", "outline": 6, "shadow": 2, "box": False,
                               "highlight": "color", "animation": "pop"}),
    "G": ("Elegant serif", {"font": "DM Serif Display", "size": 86, "case": "as-is", "words_per_line": 3,
                            "color": "#FFFFFF", "active_color": "#F4D9A6", "emphasis_color": "#F4D9A6",
                            "outline_color": "#000000", "outline": 0, "shadow": 4, "box": False,
                            "highlight": "color", "animation": "fade"}),
    "H": ("Handwritten", {"font": "Permanent Marker", "size": 82, "case": "as-is", "words_per_line": 3,
                          "color": "#FFFFFF", "active_color": "#FF7AB6", "emphasis_color": "#FF7AB6",
                          "outline_color": "#000000", "outline": 5, "shadow": 0, "box": False,
                          "highlight": "color", "animation": "slide"}),
}

LOOK_PRESETS = {
    "natural": {"contrast": 1.02, "saturation": 1.03, "brightness": 0.0, "gamma": 1.0, "warmth": 0.0,
                "vignette": 0.0, "grain": 0.0, "sharpen": 0.25, "lut_from_reference": False},
    "bright": {"contrast": 1.05, "saturation": 1.10, "brightness": 0.03, "gamma": 0.97, "warmth": 0.05,
               "vignette": 0.0, "grain": 0.0, "sharpen": 0.4, "lut_from_reference": False},
    "warm": {"contrast": 1.05, "saturation": 1.08, "brightness": 0.0, "gamma": 1.0, "warmth": 0.45,
             "vignette": 0.15, "grain": 0.0, "sharpen": 0.3, "lut_from_reference": False},
    "cool": {"contrast": 1.06, "saturation": 1.0, "brightness": 0.0, "gamma": 1.0, "warmth": -0.4,
             "vignette": 0.1, "grain": 0.0, "sharpen": 0.3, "lut_from_reference": False},
    "punchy": {"contrast": 1.16, "saturation": 1.22, "brightness": 0.0, "gamma": 1.0, "warmth": 0.1,
               "vignette": 0.22, "grain": 0.0, "sharpen": 0.5, "lut_from_reference": False},
    "film": {"contrast": 0.95, "saturation": 0.85, "brightness": 0.01, "gamma": 1.05, "warmth": 0.2,
             "vignette": 0.25, "grain": 0.3, "sharpen": 0.1, "lut_from_reference": False},
}

MOTION_SAMPLES = [
    ("Kinetic type", {"type": "kinetic", "text": "15 MINUTES", "y": 0.42}),
    ("Label / callout", {"type": "label", "text": "STEP 1 · ANALYZE", "y": 0.30}),
    ("Lower third", {"type": "lower_third", "text": "YOUR NAME", "subtitle": "Founder, Your Brand", "y": 0.80}),
    ("Title card", {"type": "title", "text": "CHAPTER ONE", "y": 0.45}),
    ("CTA button (ads)", {"type": "cta", "text": "SHOP NOW →", "y": 0.60}),
]


# ---------------------------------------------------------------- Pillow helpers
def pil():
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        die("Pillow is not installed. Run:  ve.py setup")
    return Image, ImageDraw, ImageFont


def font(size, heavy=False):
    _, _, ImageFont = pil()
    f = FONTS_DIR / ("Poppins-Black.ttf" if heavy else "Inter-Bold.otf")
    return ImageFont.truetype(str(f), size)


def wrap(draw, text, fnt, width, max_lines=4):
    words, lines, cur = str(text).split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
            if len(lines) >= max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    if len(lines) == max_lines and len(" ".join(lines)) < len(text):
        lines[-1] = lines[-1].rstrip(".,") + "…"
    return lines


def grid_sheet(title, subtitle, panels, out, cols=None, panel_w=None, note=None):
    """panels: list of (image_path, heading, [lines]). Writes a PNG contact sheet."""
    Image, ImageDraw, _ = pil()
    ims = [Image.open(p).convert("RGB") if p and Path(p).exists() else None for p, _, _ in panels]
    ref = next((i for i in ims if i), None)
    if ref is None:
        die("no frames to put on the sheet")
    ar = ref.width / ref.height
    vertical = ar < 0.9
    cols = cols or (5 if vertical else 3 if ar > 1.3 else 4)
    panel_w = panel_w or (340 if vertical else 600 if ar > 1.3 else 420)
    panel_h = int(panel_w / ar)
    text_h = 175
    gap, pad, head = 28, 48, 150 + (34 if subtitle else 0)
    rows = (len(panels) + cols - 1) // cols
    W = pad * 2 + cols * panel_w + (cols - 1) * gap
    H = head + rows * (panel_h + text_h + gap) + pad + (60 if note else 0)
    sheet = Image.new("RGB", (W, H), (246, 244, 239))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 40), title, font=font(46, True), fill=(17, 17, 17))
    if subtitle:
        for i, ln in enumerate(wrap(d, subtitle, font(24), W - 2 * pad, 2)):
            d.text((pad, 108 + i * 32), ln, font=font(24), fill=(90, 90, 90))
    f_head, f_body = font(25), font(21)
    for k, ((_, heading, lines), im) in enumerate(zip(panels, ims)):
        r, cidx = divmod(k, cols)
        x = pad + cidx * (panel_w + gap)
        y = head + r * (panel_h + text_h + gap)
        d.rounded_rectangle([x - 2, y - 2, x + panel_w + 2, y + panel_h + 2], 14, fill=(20, 20, 20))
        if im:
            sheet.paste(im.resize((panel_w, panel_h)), (x, y))
        d.text((x, y + panel_h + 12), heading, font=f_head, fill=(17, 17, 17))
        yy = y + panel_h + 48
        for ln in lines:
            for wl in wrap(d, ln, f_body, panel_w, 2):
                if yy > y + panel_h + text_h - 20:
                    break
                d.text((x, yy), wl, font=f_body, fill=(70, 70, 70))
                yy += 27
    if note:
        d.text((pad, H - pad - 30), note, font=font(24), fill=(120, 90, 0))
    sheet.save(out, optimize=True)
    return out


# ---------------------------------------------------------------- single-frame sample renders
def _fonts_into(build: Path):
    fd = build / "fonts"
    fd.mkdir(parents=True, exist_ok=True)
    for f in FONTS_DIR.iterdir():
        if f.suffix.lower() in (".ttf", ".otf") and not (fd / f.name).exists():
            shutil.copy2(f, fd / f.name)


def _context(project: Path, platform=None):
    project = Path(project).resolve()
    an = load_json(project / "analysis.json")
    edit = load_json(project / "edit.json")
    brief = load_json(project / "brief.json", {}) or {}
    if an:
        src = project / an["source"]
    else:
        from analyze import collect_source
        src = collect_source(project)
    info = probe(src)
    plat = platform or brief.get("platform") or (edit or {}).get("brief", {}).get("platform")
    if not plat:
        plat = "reels" if info.get("height", 1) >= info.get("width", 1) else "youtube"
    fmt = dict((edit or {}).get("format") or PRESETS.get(plat, PRESETS["reels"]))
    if "reframe" not in fmt:
        src_v = info.get("height", 1) > info.get("width", 1)
        tgt_v = fmt["height"] > fmt["width"]
        fmt["reframe"] = {"mode": "crop" if src_v == tgt_v or tgt_v else "fit_blur", "x": 0.5, "y": 0.42}
    # a frame where the person is talking: middle of the longest phrase, else 40% in
    t = info["duration"] * 0.4
    if an and an.get("units"):
        u = max(an["units"], key=lambda u: u["end"] - u["start"])
        t = (u["start"] + u["end"]) / 2
    sname = brief.get("style") or (edit or {}).get("style_name")
    sraw, _ = resolve_style(sname, project) if sname and sname != "vibe-default" else (None, None)
    return project, src, info, fmt, t, plat, sraw, edit, an


def _render_sample(src, src_t, info, fmt, build, out, style, setup, look=None):
    """Render one frame with an ASS built by setup(builder)."""
    from render import look_filters, reframe_filter
    W, H = fmt["width"], fmt["height"]
    b = AssBuilder(W, H, style)
    setup(b)
    ass = build / f"{Path(out).stem}.ass"
    b.write(ass)
    chain = [f"[0:v]{reframe_filter(info, fmt, 1.0, 'r')},format=yuv420p[v0]"]
    cur = "v0"
    if look:
        chain.append(f"[{cur}]{','.join(look)}[vl]")
        cur = "vl"
    chain.append(f"[{cur}]setpts=PTS-STARTPTS+0.6/TB,ass={ass.name}:fontsdir=fonts,scale={420 if H > W else 640}:-2[out]")
    from common import IMAGE_EXT
    inp = ["-loop", "1", "-i", str(src)] if Path(src).suffix.lower() in IMAGE_EXT else \
        ["-ss", f"{src_t:.3f}", "-i", str(src)]
    run(["ffmpeg", "-y", "-v", "error", *inp, "-filter_complex", ";".join(chain),
         "-map", "[out]", "-frames:v", "1", "-update", "1", "-q:v", "2", str(Path(out).resolve())], cwd=build)
    if not Path(out).exists():
        die(f"could not render a sample frame from {Path(src).name}")
    return out


def _sample_line(text="THIS IS HOW YOUR CAPTIONS LOOK", wpl=3):
    words = text.split()[:max(1, wpl)]
    ws = [{"w": w, "s": 0.3 * i, "e": 0.3 * i + 0.28, "emph": False} for i, w in enumerate(words)]
    if len(ws) == 1:
        ws[0]["s"], ws[0]["e"] = 0.0, 1.5
    if len(ws) > 1:
        ws[1]["s"], ws[1]["e"] = 0.3, 0.95
        for i in range(2, len(ws)):
            ws[i]["s"], ws[i]["e"] = 0.95 + 0.3 * (i - 2), 1.2 + 0.3 * (i - 2)
    return [{"id": "c1", "start": 0, "end": ws[-1]["e"], "text": " ".join(w["w"] for w in ws), "words": ws}]


def caption_sheet(project, platform=None):
    project, src, info, fmt, t, plat, sraw, edit, an = _context(project, platform)
    from plan import platform_style
    build = project / "build" / "choices"
    _fonts_into(build)
    out_dir = project / "choices"
    out_dir.mkdir(exist_ok=True)
    items = []
    if sraw:
        items.append(("R", f"From your reference ({sraw.get('name', 'style')})", sraw.get("captions", {})))
    items += [(k, name, cfg) for k, (name, cfg) in CAPTION_PRESETS.items()]
    panels = []
    sample_text = "THIS IS HOW YOUR CAPTIONS LOOK"
    if an and an.get("words"):
        ws = [w["w"].strip(",.") for w in an["words"] if len(w["w"]) > 1][:6]
        if len(ws) >= 3:
            sample_text = " ".join(ws)
    for key, name, cfg in items:
        st = full_style({"captions": cfg})
        platform_style(st, plat, ["captions"])
        line = _sample_line(sample_text, int(st["captions"]["words_per_line"]))
        tm = TimeMap([(0, 10)])
        f = _render_sample(src, t, info, fmt, build, build / f"cap_{key}.jpg", st,
                           lambda b, line=line, tm=tm: b.captions(line, tm))
        c = st["captions"]
        panels.append((f, f"{key} · {name}", [f"{c['font']}, {c['case']}, {c['words_per_line']} words/line",
                                              f"highlight: {c['highlight']}, {c['animation']}"]))
    out = out_dir / "captions.png"
    grid_sheet("Caption styles", f"Rendered on your video · {plat}. Pick a letter, or mix: \"B but in the font of F\".",
               panels, out, note="Reply with a letter (and any tweak: colour, size, position, words per line).")
    log(f"caption choices: {out}")
    return out


def motion_sheet(project, platform=None, style_name=None):
    project, src, info, fmt, t, plat, sraw, edit, an = _context(project, platform)
    build = project / "build" / "choices"
    _fonts_into(build)
    out_dir = project / "choices"
    out_dir.mkdir(exist_ok=True)
    st = full_style((edit or {}).get("style") or sraw)
    panels = []
    for i, (name, item) in enumerate(MOTION_SAMPLES):
        it = dict(item, start=0.0, end=5.0, enabled=True)
        tm = TimeMap([(0, 10)])
        f = _render_sample(src, t, info, fmt, build, build / f"mot_{i}.jpg", st,
                           lambda b, it=it, tm=tm: b.texts([it], tm))
        panels.append((f, f"{i + 1} · {name}", [f"font {st['motion']['font']}, accent {st['motion']['accent']}"]))
    out = out_dir / "motion.png"
    grid_sheet("Motion graphics", "Rendered on your video. Choose which ones to use and how often "
               "(minimal · balanced · heavy).", panels, out,
               note="Reply e.g. \"1 and 3, balanced\" or \"none\". Colours and font follow your style.")
    log(f"motion choices: {out}")
    return out


def look_sheet(project, platform=None):
    project, src, info, fmt, t, plat, sraw, edit, an = _context(project, platform)
    from render import look_filters
    build = project / "build" / "choices"
    _fonts_into(build)
    out_dir = project / "choices"
    out_dir.mkdir(exist_ok=True)
    looks = list(LOOK_PRESETS.items())
    if sraw and sraw.get("reference_stats") and an and an.get("color"):
        looks.insert(0, ("reference", dict(LOOK_PRESETS["natural"], lut_from_reference=True,
                                           lut_strength=(sraw.get("look") or {}).get("lut_strength", 0.6))))
    st = full_style(sraw)
    panels = []
    for name, lk in looks:
        sub = build / f"look_{name}"
        sub.mkdir(exist_ok=True)
        lf = look_filters(dict(lk, enabled=True), sub, an or {}, st, "final")
        lf = [x.replace("file=look.cube", f"file=look_{name}/look.cube") for x in lf]
        f = _render_sample(src, t, info, fmt, build, build / f"look_{name}.jpg", st, lambda b: None, look=lf)
        desc = "matches your reference's colours" if name == "reference" else \
            f"contrast {lk['contrast']}, saturation {lk['saturation']}, warmth {lk['warmth']}"
        panels.append((f, name.upper(), [desc]))
    out = out_dir / "looks.png"
    grid_sheet("Colour looks", "Rendered on your video. Pick one, or describe your own (\"warm but less saturated\").",
               panels, out, note="Reply with a name. 'natural' keeps it close to your camera.")
    log(f"look choices: {out}")
    return out


# ---------------------------------------------------------------- style card (image)
def style_card_png(style_dir: Path):
    """A PNG style card: the style's captions + hook rendered on a reference frame, palette, values."""
    Image, ImageDraw, _ = pil()
    sdir = Path(style_dir)
    s = full_style(load_json(sdir / "style.json"))
    auto = load_json(sdir / "auto.json", {}) or {}
    ref_img = None
    for d in (auto.get("sheets") or {}).values():
        for k in ("detail1", "images"):
            if k in d and (sdir / d[k]).exists():
                ref_img = sdir / d[k]
                break
        if ref_img:
            break
    build = sdir / ".card"
    _fonts_into(build)
    preview = None
    if ref_img:
        info = probe(ref_img)
        W0, H0 = info.get("width", 720), info.get("height", 1280)
        vertical = H0 >= W0
        fmt = {"width": 1080 if vertical else 1920, "height": 1920 if vertical else 1080,
               "reframe": {"mode": "crop", "x": 0.5, "y": 0.42}}
        info.setdefault("duration", 1)
        hook_text = "THE HOOK SITS HERE"

        def setup(b):
            b.captions(_sample_line("THIS IS YOUR CAPTION STYLE", int(s["captions"]["words_per_line"])),
                       TimeMap([(0, 10)]))
            b.hook(hook_text, 5)
        preview = _render_sample(ref_img, 0, info, fmt, build, build / "card_preview.jpg", s, setup)
    W, H = 1500, 980
    card = Image.new("RGB", (W, H), (246, 244, 239))
    d = ImageDraw.Draw(card)
    x0 = 48
    if preview:
        im = Image.open(preview).convert("RGB")
        ph = 880
        pw = int(im.width * ph / im.height)
        if pw > 700:
            pw, ph = 700, int(im.height * 700 / im.width)
        card.paste(im.resize((pw, ph)), (48, 50))
        x0 = 48 + pw + 48
    d.text((x0, 50), s["name"], font=font(44, True), fill=(17, 17, 17))
    yy = 112
    for ln in wrap(d, s.get("description") or "", font(22), W - x0 - 48, 3):
        d.text((x0, yy), ln, font=font(22), fill=(90, 90, 90))
        yy += 30
    yy += 14
    pal = (s.get("reference_stats") or {}).get("palette") or []
    for i, hx in enumerate(pal[:6]):
        d.rounded_rectangle([x0 + i * 70, yy, x0 + i * 70 + 58, yy + 58], 10, fill=hx, outline=(200, 200, 200))
    yy += 84 if pal else 0
    c, p, lk, m, snd = s["captions"], s["pacing"], s["look"], s["motion"], s["sound"]
    rows = [
        ("Captions", f"{c['font']} · {c['size']}px · {c['case']} · {c['words_per_line']} words/line"),
        ("", f"text {c['color']} · active {c['active_color']} · outline {c['outline']} · {c['highlight']} · {c['animation']}"),
        ("", f"position {int(c['position_y'] * 100)}% of height" + (" · box" if c.get("box") else "")),
        ("Hook", f"{s['hook']['font']} · {s['hook']['color']} on {s['hook']['box_color']}"),
        ("Pacing", f"{p['pace']} · {p.get('cuts_per_min') or '–'} cuts/min · punch-ins "
                   f"{'×' + str(p['zoom_scale']) if p['punch_in'] else 'off'}"),
        ("Motion", ", ".join(k for k in ("kinetic_type", "lower_thirds", "title_cards", "labels") if m.get(k))
         + f" · accent {m['accent']}"),
        ("Look", ("matches reference colours (LUT " + str(lk['lut_strength']) + ")" if lk.get("lut_from_reference")
                  else f"contrast {lk['contrast']}, saturation {lk['saturation']}, warmth {lk['warmth']}")
         + f" · vignette {lk['vignette']} · grain {lk['grain']}"),
        ("Sound", f"music {'yes' if snd.get('music') else 'no'} · SFX density {snd.get('sfx_density')}"),
    ]
    for k, v in rows:
        if k:
            d.text((x0, yy), k.upper(), font=font(20), fill=(150, 120, 30))
            yy += 28
        for ln in wrap(d, v, font(22), W - x0 - 48, 2):
            d.text((x0, yy), ln, font=font(22), fill=(30, 30, 30))
            yy += 30
        yy += 6
    todo = [f"{sec}.{f}" for sec in ("captions", "hook", "motion", "pacing") for f in s[sec].get("_todo", [])]
    if todo:
        d.text((x0, H - 70), "Still to fill: " + ", ".join(todo)[:90], font=font(20), fill=(170, 60, 40))
    out = sdir / "style_card.png"
    card.save(out, optimize=True)
    shutil.rmtree(build, ignore_errors=True)
    return out
