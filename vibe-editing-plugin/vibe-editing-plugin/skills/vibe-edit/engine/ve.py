#!/usr/bin/env python3
"""Vibe Editing engine. One command, many steps (the vibe-edit skill says WHEN to run each):

  setup / doctor                         install / check everything
  intake --video F [--ref R]             make a project from files anywhere (copies/moves them in)
  intake --project P --ref R             add a reference later
  analyze <project>                      transcript, dead space, retakes, fillers  -> analysis.json
  show <project> [what]                  summary | transcript | segments | captions | retakes | brief
  style extract <refs..> --name N        scrape a style from videos/photos -> styles/N/
  style card <name> · style list         style card image · saved styles
  captions <project>                     caption style choices, rendered on the user's video (PNG)
  motion <project>                       motion graphics choices (PNG)
  looks <project>                        colour look choices (PNG)
  music search|get|generate <project>    free library (Openverse), or ElevenLabs
  sfx search|get|generate <project>      free library (Freesound via Openverse), or ElevenLabs
  keys set elevenlabs <KEY> · keys show
  plan <project>                         build edit.json from analysis + brief.json + style
  restyle <project> --style N            apply a style to an existing edit (keeps cuts, text, sound)
  storyboard <project>                   THE EDIT BOARD: numbered frames of the planned edit (PNG)
  render <project> --mode preview|final  render (final runs the quality check)
  frames <project> --at 1,5 [--video out/x.mp4]   grab frames to check something
  open <file> · versions <project> [--restore N] · new <name>
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

HOME_DIR = Path.home() / ".vibe-editing"
VENV = HOME_DIR / "venv"
VENV_PY = VENV / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
HERE = Path(__file__).resolve().parent


def _maybe_reexec():
    """Run inside the plugin's own virtualenv when it exists (setup creates it)."""
    if os.environ.get("VIBE_NO_VENV") or not VENV_PY.exists():
        return
    try:
        if Path(sys.prefix).resolve() == VENV.resolve():
            return
    except OSError:
        return
    if len(sys.argv) > 1 and sys.argv[1] == "setup":
        return
    env = dict(os.environ, VIBE_NO_VENV="1")
    r = subprocess.run([str(VENV_PY), str(Path(__file__).resolve()), *sys.argv[1:]], env=env)
    sys.exit(r.returncode)


_maybe_reexec()
sys.path.insert(0, str(HERE))
for _stream in (sys.stdout, sys.stderr):  # old Windows consoles can't print every character
    try:
        _stream.reconfigure(errors="replace")
    except (AttributeError, ValueError):
        pass


# ---------------------------------------------------------------- setup / doctor
def cmd_setup(_a):
    import venv
    HOME_DIR.mkdir(parents=True, exist_ok=True)
    if not VENV_PY.exists():
        print(f"creating virtual environment at {VENV} ...")
        venv.EnvBuilder(with_pip=True).create(VENV)
    req = HERE.parent / "requirements.txt"
    print("installing packages (faster-whisper, numpy, Pillow) ... this takes a minute or two")
    r = subprocess.run([str(VENV_PY), "-m", "pip", "install", "--upgrade", "pip", "-q"])
    r = subprocess.run([str(VENV_PY), "-m", "pip", "install", "-r", str(req), "-q"])
    if r.returncode != 0:
        print("pip install failed. Check your internet connection and run setup again.")
        sys.exit(1)
    print("packages installed.")
    subprocess.run([str(VENV_PY), str(Path(__file__).resolve()), "doctor"], env=dict(os.environ, VIBE_NO_VENV="1"))


def cmd_doctor(_a):
    import shutil
    from common import FONTS, FONTS_DIR, SFX_DIR, ffmpeg_major
    ok = True
    mac, win = sys.platform == "darwin", os.name == "nt"

    def line(good, name, detail="", fix=""):
        nonlocal ok
        ok = ok and good
        print(f"  {'OK ' if good else 'FIX'}  {name:<22} {detail}")
        if not good and fix:
            print(f"        -> {fix}")

    print("Vibe Editing doctor")
    v = sys.version_info
    line(v >= (3, 9), "Python", f"{v.major}.{v.minor}.{v.micro} ({sys.executable})",
         "install Python 3.10+ from python.org" if not mac else "brew install python")
    ff = shutil.which("ffmpeg")
    fix_ff = "brew install ffmpeg" if mac else "winget install Gyan.FFmpeg  (then reopen the terminal)" if win \
        else "sudo apt install ffmpeg"
    line(bool(ff), "ffmpeg", ff or "not found", fix_ff)
    line(bool(shutil.which("ffprobe")), "ffprobe", shutil.which("ffprobe") or "not found", fix_ff)
    if ff:
        major = ffmpeg_major()
        line(major >= 5, "ffmpeg version", str(major), "update ffmpeg to version 5 or newer")
        filt = subprocess.run(["ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True).stdout
        for f in ("ass", "sidechaincompress", "loudnorm", "lut3d", "afftdn"):
            line(f" {f} " in filt, f"ffmpeg filter {f}", "", "install a full ffmpeg build (brew/winget/gyan.dev 'full')")
    try:
        import numpy
        line(True, "numpy", numpy.__version__)
    except ImportError:
        line(False, "numpy", "missing", "python ve.py setup")
    try:
        import PIL
        line(True, "Pillow", PIL.__version__)
    except ImportError:
        line(False, "Pillow", "missing", "python ve.py setup")
    try:
        import faster_whisper
        line(True, "faster-whisper", faster_whisper.__version__)
    except ImportError:
        line(False, "faster-whisper", "missing", "python ve.py setup")
    missing = [k for k, v in FONTS.items() if not (FONTS_DIR / v[0]).exists()]
    line(not missing, "fonts", f"{len(FONTS) - len(missing)}/{len(FONTS)}", f"missing: {missing}")
    sfx = list(SFX_DIR.glob("*.wav"))
    line(len(sfx) >= 10, "sound effects", f"{len(sfx)} built-in", "python ve.py sfx-build")
    line(VENV_PY.exists(), "plugin venv", str(VENV) if VENV_PY.exists() else "not created", "python ve.py setup")
    print("\nAll good. You're ready to vibe edit." if ok else "\nFix the lines marked FIX, then run doctor again.")
    sys.exit(0 if ok else 1)


# ---------------------------------------------------------------- project commands
def cmd_new(a):
    p = Path(a.name).resolve()
    for d in ("raw", "refs", "broll", "music", "sfx", "out"):
        (p / d).mkdir(parents=True, exist_ok=True)
    (p.parent / "styles").mkdir(exist_ok=True)
    print(f"project ready: {p}\n  put your footage in   {p / 'raw'}\n  reference videos/photos in {p / 'refs'}\n"
          f"  optional: broll/ music/ sfx/")


def cmd_analyze(a):
    from analyze import analyze
    analyze(Path(a.project), model=a.model, language=a.language, transcript=a.transcript, force=a.force)
    cmd_show(argparse.Namespace(project=a.project, what="summary"))


def cmd_show(a):
    from common import fmt_time, load_json
    pj = Path(a.project)
    an = load_json(pj / "analysis.json")
    ed = load_json(pj / "edit.json")
    what = a.what
    if what == "summary":
        if not an:
            sys.exit("no analysis.json yet")
        st = an["stats"]
        print(f"Source: {an['source']}  {an['probe'].get('width')}x{an['probe'].get('height')} "
              f"@ {an['probe'].get('fps')}fps, {st['duration']}s, language {an.get('language')}")
        print(f"Speech {st['speech_seconds']}s, {st['words']} words ({st['wpm']} wpm). Dead space at start "
              f"{st['head_silence']}s, end {st['tail_silence']}s, {st['pauses_over_0_5s']} pauses >0.5s "
              f"({st['pause_seconds_over_0_5s']}s).")
        print(f"Retake candidates: {st['retake_candidates']}  ·  filler words: {st['filler_words']}")
        print(f"Contact sheet: {an.get('contact_sheet')}")
        if ed:
            keep = sum(s["end"] - s["start"] for s in ed["segments"] if s["keep"])
            print(f"edit.json v{ed.get('version')}: keeps {keep:.1f}s of {st['duration']}s, "
                  f"{len(ed['captions']['lines'])} caption lines, style {ed.get('style_name')}")
    elif what == "transcript":
        for u in an["units"]:
            flag = " [filler]" if u["filler"] else ""
            for r in an["retakes"]:
                if r["unit"] == u["id"]:
                    flag += f" [{r['kind']} -> {r['kept']}]"
            print(f"{u['id']:>5} {fmt_time(u['start'])}-{fmt_time(u['end'])}  {u['text']}{flag}")
    elif what == "retakes":
        for r in an["retakes"]:
            u = next(x for x in an["units"] if x["id"] == r["unit"])
            k = next(x for x in an["units"] if x["id"] == r["kept"])
            print(f"{r['kind']:>14}: {fmt_time(u['start'])} \"{u['text']}\"\n{'':>16}kept {fmt_time(k['start'])} "
                  f"\"{k['text']}\"")
    elif what == "segments":
        for s in ed["segments"]:
            z = f" zoom {s.get('zoom', 1):.2f}" if s["keep"] and s.get("zoom", 1) != 1 else ""
            print(f"{s['id']:>5} {'KEEP' if s['keep'] else 'cut '} {fmt_time(s['start'])}-{fmt_time(s['end'])} "
                  f"{s['reason']:<28}{z}  {s.get('text', '')[:70]}")
    elif what == "brief":
        import json as _j
        print(_j.dumps(load_json(pj / "brief.json", {}), indent=2))
    elif what == "captions":
        for c in ed["captions"]["lines"]:
            em = [w["w"] for w in c["words"] if w.get("emph")]
            print(f"{c['id']:>5} {fmt_time(c['start'])}  {c['text']}" + (f"   (emphasis: {', '.join(em)})" if em else ""))


def cmd_style(a):
    from sheets import style_card_png as card
    from style import extract, list_styles
    ws = Path(a.workspace).resolve() if a.workspace else Path.cwd()
    if a.action == "extract":
        if not a.name:
            sys.exit("give the style a name: --name my-style")
        sdir, auto = extract(a.refs, a.name, ws)
        out = card(sdir)
        print(f"\nStyle draft: {sdir / 'style.json'}\nLook at these contact sheets, then fill the TODO fields "
              f"and run 'style card {a.name}':")
        for tag, d in auto["sheets"].items():
            for k, p in d.items():
                print(f"  {sdir / p}")
        print(f"Style card: {out}")
    elif a.action == "card":
        sdir = ws / "styles" / a.refs[0] if a.refs else None
        if not sdir or not (sdir / "style.json").exists():
            sys.exit(f"style not found: {sdir}")
        print(card(sdir))
    elif a.action == "list":
        for s in list_styles(ws):
            print(f"{s['name']:<24} {s['font'] or '':<18} {s['description'] or ''}")


def cmd_intake(a):
    from intake import intake
    ws = Path(a.workspace).resolve() if a.workspace else Path.cwd()
    intake(ws, videos=a.video, refs=a.ref, name=a.name, project=a.project)


def cmd_restyle(a):
    from plan import restyle
    restyle(Path(a.project), a.style)
    cmd_show(argparse.Namespace(project=a.project, what="summary"))


def cmd_plan(a):
    from plan import plan
    addons = [x.strip() for x in a.addons.split(",")] if a.addons else None
    plan(Path(a.project), style_name=a.style, platform=a.platform, pace=a.pace, addons=addons,
         cut_fillers=not a.keep_fillers, keep_retakes=a.keep_retakes, force=a.force)
    cmd_show(argparse.Namespace(project=a.project, what="summary"))


def cmd_storyboard(a):
    from storyboard import storyboard
    for p in storyboard(Path(a.project), panels=a.panels):
        print(p)


def cmd_sheet(a):
    import sheets
    fn = {"captions": sheets.caption_sheet, "motion": sheets.motion_sheet, "looks": sheets.look_sheet}[a.cmd]
    print(fn(Path(a.project), platform=a.platform))


def cmd_audio(a):
    import audio_sources as au
    kind = "music" if a.cmd == "music" else "sfx"
    if a.action == "search":
        au.search(Path(a.project), " ".join(a.args), kind=kind, cc0_only=a.cc0, min_s=a.min, max_s=a.max)
    elif a.action == "get":
        au.get(Path(a.project), a.args, kind=kind)
    elif a.action == "generate":
        if kind == "music":
            au.generate_music(Path(a.project), " ".join(a.args), seconds=a.seconds or 30, name=a.name)
        else:
            au.generate_sfx(Path(a.project), " ".join(a.args), seconds=a.seconds, name=a.name)


def cmd_keys(a):
    import audio_sources as au
    if a.action == "set":
        if len(a.args) != 2:
            sys.exit("usage: ve.py keys set elevenlabs <KEY>")
        au.set_key(a.args[0], a.args[1])
    else:
        au.show_keys()


def cmd_render(a):
    import json
    from render import render
    res = render(Path(a.project), mode=a.mode, out_name=a.name)
    print(json.dumps(res, indent=2))


def cmd_frames(a):
    from common import load_json, tile_frames
    pj = Path(a.project)
    if a.video:
        src = Path(a.video) if Path(a.video).is_absolute() else pj / a.video
    else:
        src = pj / load_json(pj / "analysis.json")["source"]
    times = [float(x) for x in a.at.split(",")]
    out = pj / "build" / ("frames_out.jpg" if a.video else "frames.jpg")
    tile_frames(src, times, out, cols=min(4, len(times)), width=360)
    print(out)


def cmd_open(a):
    """Open a file with the computer's default app (image viewer for PNGs, player for videos)."""
    p = Path(a.path).resolve()
    if not p.exists():
        sys.exit(f"not found: {p}")
    try:
        if os.name == "nt":
            os.startfile(str(p))  # noqa: windows only
        elif sys.platform == "darwin":
            subprocess.run(["open", str(p)], check=False)
        else:
            subprocess.run(["xdg-open", str(p)], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:  # headless machines: just print the path
        print(f"(could not open automatically: {e})")
    print(p)


def cmd_versions(a):
    from plan import list_versions, restore_version
    if a.restore:
        print(restore_version(Path(a.project), a.restore))
    for v in list_versions(Path(a.project)):
        print(f"v{v['version']:<4} {v['saved_at']}  {v['note']}")


def cmd_sfx_build(_a):
    from common import SFX_DIR
    from sfx_synth import build
    print(build(SFX_DIR))


def main():
    ap = argparse.ArgumentParser(prog="ve.py", description="Vibe Editing engine")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("setup").set_defaults(fn=cmd_setup)
    sub.add_parser("doctor").set_defaults(fn=cmd_doctor)
    sub.add_parser("sfx-build").set_defaults(fn=cmd_sfx_build)
    p = sub.add_parser("new"); p.add_argument("name"); p.set_defaults(fn=cmd_new)
    p = sub.add_parser("analyze"); p.add_argument("project")
    p.add_argument("--model", default="small", help="tiny | base | small | medium | large-v3 (slower, more accurate)")
    p.add_argument("--language", default=None, help="e.g. en, hi. Default: auto-detect")
    p.add_argument("--transcript", default=None, help="use an existing word-level transcript JSON")
    p.add_argument("--force", action="store_true"); p.set_defaults(fn=cmd_analyze)
    p = sub.add_parser("show"); p.add_argument("project")
    p.add_argument("what", nargs="?", default="summary", choices=["summary", "transcript", "segments", "captions",
                                                                 "retakes", "brief"]); p.set_defaults(fn=cmd_show)
    p = sub.add_parser("style"); p.add_argument("action", choices=["extract", "card", "list"])
    p.add_argument("refs", nargs="*"); p.add_argument("--name"); p.add_argument("--workspace")
    p.set_defaults(fn=cmd_style)
    p = sub.add_parser("intake"); p.add_argument("--video", action="append", default=[])
    p.add_argument("--ref", action="append", default=[]); p.add_argument("--name"); p.add_argument("--project")
    p.add_argument("--workspace"); p.set_defaults(fn=cmd_intake)
    p = sub.add_parser("restyle"); p.add_argument("project"); p.add_argument("--style", required=True)
    p.set_defaults(fn=cmd_restyle)
    p = sub.add_parser("plan"); p.add_argument("project"); p.add_argument("--style", default=None)
    p.add_argument("--platform", default=None, choices=["reels", "shorts", "tiktok", "meta-ad", "meta-feed",
                                                        "portrait", "square", "youtube", "lesson"])
    p.add_argument("--pace", default=None, choices=["tight", "natural", "relaxed"])
    p.add_argument("--addons", default=None, help="comma list: captions,hook,zoom,sound,music,look,motion")
    p.add_argument("--keep-fillers", action="store_true"); p.add_argument("--keep-retakes", action="store_true")
    p.add_argument("--force", action="store_true"); p.set_defaults(fn=cmd_plan)
    p = sub.add_parser("storyboard"); p.add_argument("project"); p.add_argument("--panels", type=int)
    p.set_defaults(fn=cmd_storyboard)
    for name in ("captions", "motion", "looks"):
        p = sub.add_parser(name); p.add_argument("project"); p.add_argument("--platform")
        p.set_defaults(fn=cmd_sheet)
    for name in ("music", "sfx"):
        p = sub.add_parser(name); p.add_argument("action", choices=["search", "get", "generate"])
        p.add_argument("project"); p.add_argument("args", nargs="*")
        p.add_argument("--cc0", action="store_true", help="only licences that need no credit")
        p.add_argument("--min", type=float); p.add_argument("--max", type=float)
        p.add_argument("--seconds", type=float); p.add_argument("--name")
        p.set_defaults(fn=cmd_audio)
    p = sub.add_parser("keys"); p.add_argument("action", choices=["set", "show"]); p.add_argument("args", nargs="*")
    p.set_defaults(fn=cmd_keys)
    p = sub.add_parser("render"); p.add_argument("project")
    p.add_argument("--mode", default="preview", choices=["preview", "final"]); p.add_argument("--name")
    p.set_defaults(fn=cmd_render)
    p = sub.add_parser("frames"); p.add_argument("project"); p.add_argument("--at", required=True)
    p.add_argument("--video", help="a rendered file instead of the raw video, e.g. out/preview.mp4")
    p.set_defaults(fn=cmd_frames)
    p = sub.add_parser("open"); p.add_argument("path"); p.set_defaults(fn=cmd_open)
    p = sub.add_parser("versions"); p.add_argument("project"); p.add_argument("--restore", type=int)
    p.set_defaults(fn=cmd_versions)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
