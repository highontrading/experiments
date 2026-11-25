"""Command-line interface for the Vibe Editor engine."""
import argparse
import json
import os
import subprocess
import sys
import time

from . import ai, render
from .core import (DEFAULT_BRAND, LIB, VERSION, WS_DIRS, VibeError, build_segments, captions_reg, die, ensure_fonts,
                   ffmpeg, ffmpeg_candidates, find_ws, fmt_ts, fonts_reg, has_libass, info, job_dir, lib, load_json,
                   looks_reg, presets_reg, probe, reset_ffmpeg, resolve_job, run_ff, save_json, set_ws, slug,
                   sounds_reg, timeline_text, transcribe, TimeMap, ws_paths)

PIP_PKGS = ["faster-whisper", "imageio-ffmpeg", "fonttools", "onnxruntime", "numpy"]


def pip_install(pkgs):
    base = [sys.executable, "-m", "pip", "install", "--upgrade", "--disable-pip-version-check"]
    last = ""
    for extra in ([], ["--user"], ["--break-system-packages"], ["--user", "--break-system-packages"]):
        p = subprocess.run(base + extra + pkgs, capture_output=True, text=True)
        if p.returncode == 0:
            return True, ""
        last = p.stderr[-800:]
    return False, last


def cmd_install(a):
    info(f"Python {sys.version.split()[0]} at {sys.executable}")
    if sys.version_info < (3, 9):
        die("Python 3.9 or newer is needed.")
    info("Installing speech engine, ffmpeg, font tools and AI cut-out runtime (one time, a few minutes)…")
    ok, err = pip_install(PIP_PKGS)
    if not ok:
        ok, err = pip_install(PIP_PKGS[:3])
        if not ok:
            die("pip install failed:\n" + err)
        info("⚠️  AI cut-out runtime could not be installed — everything else works.")
    info("✅ Python packages installed")
    reset_ffmpeg()
    info(f"✅ ffmpeg: {ffmpeg()}")
    if not a.skip_model:
        info(f"Downloading speech model '{a.model}' (one time)…")
        from faster_whisper import WhisperModel
        WhisperModel(a.model, device="cpu", compute_type="int8")
        info("✅ Speech model ready")
        if ai.available():
            try:
                ai.ensure_model()
                info("✅ AI cut-out model ready")
            except VibeError as e:
                info(f"⚠️  {e}")
    info("\n🎉 Vibe Editor is installed. Run `doctor` to double-check.")


def cmd_doctor(a):
    ok = True

    def row(good, label, fix="", soft=False):
        nonlocal ok
        if not soft:
            ok = ok and good
        info(f"{'✅' if good else ('⚠️ ' if soft else '❌')} {label}" + ("" if good else f"\n     fix: {fix}"))

    row(sys.version_info >= (3, 9), f"Python {sys.version.split()[0]}", "Install Python 3.10+ from python.org")
    try:
        import faster_whisper  # noqa
        row(True, f"Speech engine (faster-whisper {faster_whisper.__version__})")
    except Exception:
        row(False, "Speech engine missing", "python3 vibe.py install")
    ff = next((c for c in ffmpeg_candidates() if has_libass(c)), None)
    row(bool(ff), f"ffmpeg with subtitles/motion support: {ff or 'missing'}", "python3 vibe.py install")
    try:
        import fontTools  # noqa
        row(True, "Font tools (your own fonts are measured exactly)")
    except Exception:
        row(False, "Font tools missing (own fonts less precise)", "python3 vibe.py install", soft=True)
    if ai.available():
        mp = ai.model_path()
        row(os.path.exists(mp), "AI cut-out (text behind you, stickers, background swap)" +
            ("" if os.path.exists(mp) else " — model downloads on first use"), "python3 vibe.py install", soft=True)
    else:
        row(False, "AI cut-out runtime missing (text-behind / cut-out effects disabled)", "python3 vibe.py install", soft=True)
    ws = find_ws(a.ws)
    set_ws(ws)
    fonts = fonts_reg()
    nuser = sum(1 for f in fonts.values() if f.get("_user"))
    row(len(fonts) > 10, f"Library: {len(fonts)} fonts ({nuser} yours), {len(sounds_reg())} sounds, "
        f"{len(captions_reg())} caption styles, {len(looks_reg())} looks, {len(render.KNOWN)} effect types, "
        f"{len(presets_reg())} preset combos")
    row(os.path.exists(os.path.join(ws, "vibe.json")), f"Workspace: {ws}",
        "python3 vibe.py init \"<folder>\"  (creates inbox/, output/, brand/ …)")
    try:
        tf = os.path.join(ws, ".vibe_write_test")
        open(tf, "w").close()
        os.remove(tf)
        row(True, "Workspace is writable")
    except Exception as e:
        row(False, f"Workspace not writable ({e})", "Choose a folder you own, e.g. Documents/Vibe Editor")
    if ff and a.render_test:
        t0 = time.time()
        tmp = os.path.join(ws, ".vibe", "doctor")
        os.makedirs(tmp, exist_ok=True)
        from .text import ass_header
        with open(os.path.join(tmp, "t.ass"), "w", encoding="utf-8") as f:
            f.write(ass_header(1080, 1920, [("T", "Poppins Black", 90, "&H00FFFFFF", "&H00FFFFFF", "&H00000000", "&H00000000",
                                             False, False, 1, 6, 0)])
                    + "Dialogue: 0,0:00:00.00,0:00:01.00,T,,0,0,0,,{\\an5\\pos(540,960)}Vibe ✓\n")
        try:
            fdir = os.path.relpath(ensure_fonts(ws), tmp).replace("\\", "/")
            run_ff(["-f", "lavfi", "-i", "color=c=0x222222:s=1080x1920:d=1:r=30", "-vf",
                    f"ass=t.ass:fontsdir={fdir}", "-c:v", "libx264", "-preset", "ultrafast", "t.mp4"],
                   cwd=tmp, desc="render test")
            row(True, f"Test render OK ({time.time() - t0:.1f}s)")
        except VibeError as e:
            row(False, f"Test render failed: {e}", "see error above")
    info("\nAll good! 🎬" if ok else "\nSome checks failed — apply the fixes above.")
    sys.exit(0 if ok else 1)


def cmd_init(a):
    ws = os.path.abspath(a.path)
    os.makedirs(ws, exist_ok=True)
    for d in WS_DIRS:
        os.makedirs(os.path.join(ws, d), exist_ok=True)
    os.makedirs(os.path.join(ws, "styles", "effects"), exist_ok=True)
    if not os.path.exists(os.path.join(ws, "vibe.json")):
        save_json(os.path.join(ws, "vibe.json"), {"vibe_editor": VERSION, "created": time.strftime("%Y-%m-%d")})
    bp = ws_paths(ws)["brand"]
    if not os.path.exists(bp):
        save_json(bp, DEFAULT_BRAND)
    ensure_fonts(ws)
    readme = os.path.join(ws, "START HERE.txt")
    with open(readme, "w", encoding="utf-8") as f:
        f.write(
            "VIBE EDITOR\n===========\n\n"
            "inbox/       Put your raw videos here.\n"
            "output/      Finished reels, covers and captions appear here.\n"
            "brand/       Your logo + brand.json (colours, fonts, caption style, CTA).\n"
            "broll/       Extra clips or images to cut away to.\n"
            "music/       Background music you have the rights to use.\n"
            "references/  Reels or screenshots you love, so Claude can match the style.\n"
            "fonts/       Your own fonts (.ttf / .otf) — usable in every effect.\n"
            "sounds/      Your own sound effects (.wav / .mp3) — use them by file name.\n"
            "looks/       Your own colour grades (.cube LUT files).\n"
            "styles/      Your saved caption styles, looks and custom effects.\n\n"
            "Then just tell Claude:  /vibe-editor:edit  make my latest video a reel\n")
    info(f"✅ Workspace ready: {ws}")
    for d in WS_DIRS:
        info(f"   {d}/")


def cmd_prep(a):
    src = os.path.abspath(a.video)
    if not os.path.exists(src):
        die(f"Video not found: {src}")
    ws = find_ws(a.ws or os.path.dirname(src))
    if not os.path.exists(os.path.join(ws, "vibe.json")):
        info(f"(No workspace found — creating one at {ws})")
        cmd_init(argparse.Namespace(path=ws))
    set_ws(ws)
    name = slug(a.name or os.path.splitext(os.path.basename(src))[0])
    jd = job_dir(ws, name)
    os.makedirs(jd, exist_ok=True)
    pr = probe(src)
    if not pr["has_video"]:
        die("That file has no video track.")
    info(f"🎬 {os.path.basename(src)}: {pr['width']}x{pr['height']}, {pr['duration']:.1f}s, "
         f"audio={'yes' if pr['has_audio'] else 'no'}")
    from .core import load_brand
    brand = load_brand(ws)
    lang = a.lang or (brand.get("language") if brand.get("language") not in (None, "", "auto") else None)
    words, det = ([], None)
    if pr["has_audio"] and not a.no_transcribe:
        words, det = transcribe(src, lang, a.model)
    save_json(os.path.join(jd, "words.json"), words)
    save_json(os.path.join(jd, "job.json"), {"name": name, "source": src, "probe": pr, "language": det,
                                             "created": time.strftime("%Y-%m-%d %H:%M")})
    edit_path = os.path.join(jd, "edit.json")
    if not os.path.exists(edit_path) or a.reset:
        save_json(edit_path, {
            "format": a.format or "9:16",
            "reframe": {"mode": "crop", "x": 0.5, "y": 0.5},
            "look": brand.get("look", "punchy"),
            "cuts": {"remove_pauses": True, "max_pause": 0.45, "remove_fillers": True, "drop_words": [], "drop": []},
            "captions": {"enabled": True, "style": brand.get("caption_style", "bold-pop"), "emphasis": []},
            "audio": {"denoise": False, "loudness": -14},
            "events": [],
        })
    with open(os.path.join(jd, "transcript.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(f"#{w['i']:<4} {fmt_ts(w['start'])}  {w['text']}" + ("  (?)" if w["p"] < 0.5 else "")
                          for w in words))
    edit = load_json(edit_path)
    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    tl = timeline_text(tm.words(words))
    with open(os.path.join(jd, "timeline.txt"), "w", encoding="utf-8") as f:
        f.write(tl)
    info(f"\n✂️  Auto-cut: {pr['duration']:.1f}s → {tm.duration:.1f}s ({len(segs)} pieces kept)")
    info(f"📁 Job: {name}  ({jd})")
    info("\n--- Edited timeline (output time) ---")
    info(tl if tl else "(no speech detected)")


def cmd_fix(a):
    ws, jd = resolve_job(a)
    words = load_json(os.path.join(jd, "words.json"), [])
    try:
        fixes = load_json(a.fixes) if os.path.exists(a.fixes) else json.loads(a.fixes)
    except json.JSONDecodeError as e:
        die(f"Fixes must be JSON like {{\"12\":\"word\"}} ({e})")
    by_i = {w["i"]: w for w in words}
    removed = set()
    for k, v in fixes.items():
        try:
            lo, hi = (map(int, str(k).split("-")) if "-" in str(k) else (int(k), int(k)))
        except ValueError:
            die(f"Bad word index '{k}'")
        if lo not in by_i or hi not in by_i:
            die(f"Word index {k} not found")
        by_i[lo]["text"] = v
        by_i[lo]["end"] = by_i[hi]["end"]
        removed.update(range(lo + 1, hi + 1))
    words = [w for w in words if w["i"] not in removed]
    save_json(os.path.join(jd, "words.json"), words)
    info(f"✅ Applied {len(fixes)} fixes")
    cmd_timeline(a)


def cmd_timeline(a):
    ws, jd = resolve_job(a)
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    edit = load_json(os.path.join(jd, "edit.json"), {})
    segs = build_segments(words, job["probe"]["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    tl = timeline_text(tm.words(words))
    with open(os.path.join(jd, "timeline.txt"), "w", encoding="utf-8") as f:
        f.write(tl)
    info(f"Output length: {tm.duration:.1f}s  ({len(segs)} pieces)\n")
    info(tl)


def cmd_render(a):
    render.render_job(a)


def cmd_check(a):
    render.check_job(a)


def cmd_list(a):
    ws = find_ws(a.ws)
    set_ws(ws)
    what = a.what

    def mark(v):
        return " ★yours" if v.get("_user") else ""
    if what in ("captions", "all"):
        reg = captions_reg()
        info(f"CAPTION STYLES ({len(reg)})")
        for k, v in reg.items():
            info(f"  {k:16s} {v.get('desc', '')}{mark(v)}")
    if what in ("looks", "all"):
        reg = looks_reg()
        info(f"\nLOOKS ({len(reg)})")
        for k, v in reg.items():
            info(f"  {k:16s} {v.get('desc', '')}{mark(v)}")
    if what in ("sfx", "sounds", "all"):
        reg = sounds_reg()
        info(f"\nSOUND EFFECTS ({len(reg)})")
        for k, v in reg.items():
            info(f"  {k:16s} {v.get('desc', '')}{mark(v)}")
    if what in ("fonts", "all"):
        reg = fonts_reg()
        info(f"\nFONTS ({len(reg)})")
        for k, v in reg.items():
            info(f"  {k:24s} {v.get('desc', '')}{mark(v)}")
    if what in ("effects", "all"):
        docs = render.all_effect_docs()
        info(f"\nEFFECTS ({len(docs)} types; full options in reference/edit-plan.md)")
        for k in sorted(docs):
            info(f"  {k:16s} {docs[k]}")
    if what in ("presets", "all"):
        reg = presets_reg()
        info(f"\nPRESET COMBOS ({len(reg)})  — use {{\"type\": \"<name>\", \"at\": …, \"text\": …}}")
        for k, v in reg.items():
            info(f"  {k:18s} {v.get('desc', '')}{mark(v)}")


def cmd_save(a):
    """Save a caption style / look / effect preset into the workspace's styles/ folder."""
    ws = find_ws(a.ws)
    set_ws(ws)
    try:
        data = load_json(a.json) if os.path.exists(a.json) else json.loads(a.json)
    except json.JSONDecodeError as e:
        die(f"Style must be valid JSON ({e})")
    name = slug(a.name)
    if a.kind == "effect":
        path = os.path.join(ws, "styles", "effects", f"{name}.json")
        if "events" not in data:
            die('An effect preset needs "events": [...] (and optional "params", "desc").')
        save_json(path, data)
    else:
        fname = {"caption": "captions.json", "look": "looks.json"}[a.kind]
        path = os.path.join(ws, "styles", fname)
        cur = load_json(path, {}) or {}
        if a.kind == "caption":
            base = dict(captions_reg().get(data.pop("base", "bold-pop"), {}))
            base.pop("_user", None)
            base.update(data)
            data = base
        if a.kind == "look" and not (data.get("filter") or data.get("lut")):
            die('A look needs "filter" (ffmpeg filters) or "lut" (path to a .cube file).')
        cur[name] = data
        save_json(path, cur)
    info(f"✅ Saved {a.kind} '{name}' → {path}")


def cmd_fonts(a):
    ws = find_ws(a.ws)
    set_ws(ws)
    reg = fonts_reg()
    mine = {k: v for k, v in reg.items() if v.get("_user")}
    if not mine:
        info("No fonts of yours yet. Put .ttf / .otf files in the workspace's fonts/ (or brand/) folder.")
    for k, v in mine.items():
        info(f"  {k:24s} → \"{v['family']}\"  (use \"font\": \"{k}\")")
    ensure_fonts(ws)


def main(argv=None):
    ap = argparse.ArgumentParser(prog="vibe.py", description="Vibe Editor engine")
    ap.add_argument("--version", action="version", version=VERSION)
    sp = ap.add_subparsers(dest="cmd", required=True)

    p = sp.add_parser("install")
    p.add_argument("--model", default="small")
    p.add_argument("--skip-model", action="store_true")
    p.set_defaults(fn=cmd_install)

    p = sp.add_parser("doctor")
    p.add_argument("--ws")
    p.add_argument("--no-render-test", dest="render_test", action="store_false")
    p.set_defaults(fn=cmd_doctor)

    p = sp.add_parser("init")
    p.add_argument("path")
    p.set_defaults(fn=cmd_init)

    p = sp.add_parser("prep")
    p.add_argument("video")
    p.add_argument("--name")
    p.add_argument("--ws")
    p.add_argument("--lang")
    p.add_argument("--model", default="small")
    p.add_argument("--format", choices=list(render.FORMATS))
    p.add_argument("--reset", action="store_true")
    p.add_argument("--no-transcribe", action="store_true")
    p.set_defaults(fn=cmd_prep)

    p = sp.add_parser("fix")
    p.add_argument("job")
    p.add_argument("fixes")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_fix)

    p = sp.add_parser("timeline")
    p.add_argument("job")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_timeline)

    for nm, fn in (("render", cmd_render), ("check", cmd_check)):
        p = sp.add_parser(nm)
        p.add_argument("job")
        p.add_argument("--ws")
        p.add_argument("--preview", action="store_true")
        p.add_argument("--format", choices=list(render.FORMATS))
        p.add_argument("--edit")
        p.add_argument("--preset", default="medium")
        p.add_argument("--crf", type=int, default=18)
        p.set_defaults(fn=fn)

    p = sp.add_parser("stills")
    p.add_argument("job")
    p.add_argument("--ws")
    p.add_argument("--times")
    p.add_argument("--file")
    p.set_defaults(fn=render.cmd_stills)

    p = sp.add_parser("peek")
    p.add_argument("video")
    p.add_argument("--n", default=12)
    p.add_argument("--start")
    p.add_argument("--end")
    p.add_argument("--width", type=int, default=360)
    p.add_argument("--out")
    p.add_argument("--ws")
    p.set_defaults(fn=render.cmd_peek)

    p = sp.add_parser("cover")
    p.add_argument("job")
    p.add_argument("--title", required=True)
    p.add_argument("--sub")
    p.add_argument("--at")
    p.add_argument("--position", choices=["top", "center", "bottom"], default="top")
    p.add_argument("--font")
    p.add_argument("--format", choices=list(render.FORMATS))
    p.add_argument("--ws")
    p.set_defaults(fn=render.cmd_cover)

    p = sp.add_parser("list")
    p.add_argument("what", nargs="?", default="all",
                   choices=["all", "captions", "looks", "sfx", "sounds", "fonts", "effects", "presets"])
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_list)

    p = sp.add_parser("save")
    p.add_argument("kind", choices=["caption", "look", "effect"])
    p.add_argument("name")
    p.add_argument("json", help="JSON text or a .json file")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_save)

    p = sp.add_parser("fonts")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_fonts)

    a = ap.parse_args(argv)
    try:
        a.fn(a)
    except VibeError as e:
        print(f"\n❌ {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(130)
    except BrokenPipeError:
        pass


_unused = (LIB, lib)
