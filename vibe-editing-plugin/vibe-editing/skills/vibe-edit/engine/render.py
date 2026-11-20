"""Stage 6: render edit.json to a video.

  ve.py render <project> --mode preview   fast, half resolution  -> out/preview.mp4
  ve.py render <project> --mode final     full quality + QC      -> out/<name>_v<N>.mp4

Two passes: (1) the audio mix (voice chain, music with ducking, SFX) to build/mix.wav and a
loudness measurement, (2) the picture (cuts, reframe, punch-ins, look, B-roll, captions)
muxed with the mix normalised to the target loudness.
"""
from __future__ import annotations

import json
import math
import re
import shutil
import time
from pathlib import Path

from captions import AssBuilder
from common import (AUDIO_EXT, FONTS, FONTS_DIR, IMAGE_EXT, SFX_DIR, TimeMap, die, filter_script_args, load_json,
                    log, probe, rel, run, run_ffmpeg_progress, save_json)
from lut import blend_cube, transfer_lut, write_cube
from style import full_style


def even(x) -> int:
    return max(2, int(round(x / 2)) * 2)


def snap(t, fps):
    return round(round(t * fps) / fps, 6)


def merged_segments(edit, fps):
    segs = [s for s in edit["segments"] if s.get("keep", True)]
    segs.sort(key=lambda s: s["start"])
    out = []
    for s in segs:
        a, b = snap(s["start"], fps), snap(s["end"], fps)
        if b - a < 1.0 / fps:
            continue
        z = float(s.get("zoom", 1.0) or 1.0)
        if out and abs(out[-1]["start_end"][1] - a) < 1e-4 and abs(out[-1]["zoom"] - z) < 1e-6:
            out[-1]["start_end"][1] = b
        else:
            out.append({"start_end": [a, b], "zoom": z})
    return [(o["start_end"][0], o["start_end"][1], o["zoom"]) for o in out]


def reframe_filter(info, fmt, zoom, label):
    """Crop (or fit with blurred background) the source to the output frame, with punch-in zoom."""
    sw, sh = info["width"], info["height"]
    W, H = fmt["width"], fmt["height"]
    rf = fmt.get("reframe") or {}
    mode = rf.get("mode", "crop")
    rx, ry = float(rf.get("x", 0.5)), float(rf.get("y", 0.42))
    ta = W / H
    if mode == "fit_blur":
        fw, fh = even(W * zoom), even(H * zoom)
        return (f"split=2[{label}a][{label}b];[{label}a]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H},boxblur=24:2,eq=brightness=-0.06[{label}bg];[{label}b]scale={fw}:{fh}:"
                f"force_original_aspect_ratio=decrease[{label}fg];[{label}bg][{label}fg]overlay=(W-w)/2:(H-h)/2,"
                f"setsar=1")
    if sw / sh > ta:
        ch, cw = sh, sh * ta
    else:
        cw, ch = sw, sw / ta
    cw, ch = cw / zoom, ch / zoom
    cw, ch = min(sw, even(cw)), min(sh, even(ch))
    x = int(max(0, min(sw - cw, (sw - cw) * rx)))
    y = int(max(0, min(sh - ch, (sh - ch) * ry)))
    return f"crop={cw}:{ch}:{x}:{y},scale={W}:{H}:flags=lanczos,setsar=1"


def look_filters(look, build: Path, an, style, mode):
    if not look.get("enabled", True):
        return []
    f = []
    lut_path = None
    if look.get("lut"):
        src = Path(look["lut"])
        if not src.is_absolute():
            src = build.parent.parent / src
        if src.exists():
            lut_path = blend_cube(src, build / "look.cube", look.get("lut_strength", 1.0))
    elif look.get("lut_from_reference") and style.get("reference_stats") and an.get("color"):
        grid = transfer_lut(an["color"], style["reference_stats"], look.get("lut_strength", 0.6))
        lut_path = write_cube(build / "look.cube", grid)
    if lut_path:
        f.append("lut3d=file=look.cube:interp=tetrahedral")
    c, s = float(look.get("contrast", 1)), float(look.get("saturation", 1))
    b, g = float(look.get("brightness", 0)), float(look.get("gamma", 1))
    if (c, s, b, g) != (1.0, 1.0, 0.0, 1.0):
        f.append(f"eq=contrast={c:.3f}:saturation={s:.3f}:brightness={b:.3f}:gamma={g:.3f}")
    w = float(look.get("warmth", 0))
    if abs(w) > 0.01:
        f.append(f"colorbalance=rs={0.08 * w:.3f}:bs={-0.08 * w:.3f}:rm={0.05 * w:.3f}:bm={-0.05 * w:.3f}")
    v = float(look.get("vignette", 0))
    if v > 0.01:
        f.append(f"vignette=angle={0.2 + 0.5 * min(v, 1):.3f}")
    sh = float(look.get("sharpen", 0))
    if sh > 0.01 and mode == "final":
        f.append(f"unsharp=5:5:{0.8 * min(sh, 1):.2f}:5:5:0")
    gr = float(look.get("grain", 0))
    if gr > 0.01:
        f.append(f"noise=c0s={int(4 + 20 * min(gr, 1))}:c0f=t+u")
    return f


def sfx_path(name, project: Path):
    p = Path(name)
    for c in [project / name, project / "sfx" / name, SFX_DIR / f"{name}.wav", SFX_DIR / name]:
        if c.exists() and c.is_file():
            return c
    if p.is_absolute() and p.exists():
        return p
    return None


def project_file(project: Path, f):
    p = Path(f)
    return p if p.is_absolute() else project / p


# ---------------------------------------------------------------- audio pass
def render_audio(project, edit, an, info, segs, tmap, build, style):
    total = tmap.total
    snd = edit.get("sound", {})
    on = snd.get("enabled", True)
    inputs = ["-i", str(project / edit["source"])]
    fc = []
    labels = []
    for i, (a, b, _z) in enumerate(segs):
        d = b - a
        if info["has_audio"]:
            fade = min(0.012, d / 4)
            fc.append(f"[0:a]atrim=start={a:.6f}:end={b:.6f},asetpts=PTS-STARTPTS,aresample=48000,"
                      f"aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d={fade:.4f},"
                      f"afade=t=out:st={max(0, d - fade):.4f}:d={fade:.4f}[a{i}]")
        else:
            fc.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={d:.6f}[a{i}]")
        labels.append(f"[a{i}]")
    fc.append("".join(labels) + f"concat=n={len(segs)}:v=0:a=1[ac]")
    if on and snd.get("voice_cleanup", True):
        fc.append("[ac]highpass=f=75,afftdn=nf=-28:tn=1,acompressor=threshold=0.1:ratio=3:attack=5:release=120:"
                  "makeup=1.6[voice]")
    else:
        fc.append("[ac]anull[voice]")
    mix = ["[vo]"]
    music = (snd.get("music") or {}) if on else {}
    mfile = project_file(project, music["file"]) if music.get("file") else None
    if mfile and not mfile.exists():
        log(f"music file not found, skipping: {mfile}")
        mfile = None
    if mfile:
        fc.append("[voice]asplit=2[vo][vsc]")
        idx = inputs.count("-i")
        inputs += ["-stream_loop", "-1", "-i", str(mfile)]
        lvl = float(music.get("level_db", -21))
        fo = max(0.0, total - 1.5)
        fc.append(f"[{idx}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={lvl}dB,"
                  f"atrim=0:{total:.3f},afade=t=in:d=0.6,afade=t=out:st={fo:.3f}:d=1.5[mus0]")
        if music.get("duck", True):
            fc.append("[mus0][vsc]sidechaincompress=threshold=0.02:ratio=9:attack=15:release=380:makeup=1[mus]")
        else:
            fc.append("[mus0]anull[mus]")
        mix.append("[mus]")
    else:
        fc.append("[voice]anull[vo]")

    hits = []
    if on:
        for x in snd.get("sfx", []):
            if not x.get("enabled", True):
                continue
            t = tmap.to_out(float(x["t"])) + float(x.get("offset", 0))
            hits.append((max(0.0, t), x["sound"], float(x.get("gain_db", style["sound"].get("sfx_level_db", -11)))))
        if edit.get("hook", {}).get("enabled") and snd.get("hook_sfx"):
            hits.append((0.05, snd["hook_sfx"], float(style["sound"].get("sfx_level_db", -11))))
        for it in edit.get("texts", []):
            name = it.get("sfx", style["sound"].get("sfx_on_text") if style["sound"].get("sfx", True) else None)
            if name and it.get("enabled", True):
                hits.append((tmap.to_out(float(it["start"])), name, float(style["sound"].get("sfx_level_db", -11)) - 2))
    for k, (t, name, gain) in enumerate(hits):
        p = sfx_path(name, project)
        if not p:
            log(f"sfx '{name}' not found, skipping")
            continue
        idx = inputs.count("-i")
        inputs += ["-i", str(p)]
        ms = int(t * 1000)
        fc.append(f"[{idx}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={gain:.1f}dB,"
                  f"adelay={ms}|{ms}[sx{k}]")
        mix.append(f"[sx{k}]")
    if len(mix) > 1:
        fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first:dropout_transition=0,"
                                 f"apad,atrim=0:{total:.6f}[mix]")
    else:
        fc.append(f"[vo]apad,atrim=0:{total:.6f}[mix]")
    script = build / "audio_graph.txt"
    script.write_text(";\n".join(fc), encoding="utf-8")
    out = build / "mix.wav"
    run(["ffmpeg", "-y", "-v", "error", *inputs, *filter_script_args(script.name), "-map", "[mix]",
         "-c:a", "pcm_s24le", "-ar", "48000", out.name], cwd=build)
    # loudness pass 1
    target = float(snd.get("loudness_lufs", -14))
    r = run(["ffmpeg", "-v", "info", "-i", out.name, "-af", f"loudnorm=I={target}:TP=-1.0:LRA=11:print_format=json",
             "-f", "null", "-"], cwd=build, check=False)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    stats = json.loads(m.group(0)) if m else None
    return out, stats, target, len(hits)


# ---------------------------------------------------------------- main
def render(project: Path, mode="preview", out_name=None):
    project = Path(project).resolve()
    edit = load_json(project / "edit.json")
    an = load_json(project / "analysis.json") or {}
    if not edit:
        die("edit.json not found. Run the plan step first.")
    style = full_style(edit.get("style"))
    src = project / edit["source"]
    if not src.exists():
        die(f"source video missing: {src}")
    info = probe(src)
    fmt = dict(edit["format"])
    fps = float(fmt.get("fps", 30))
    W, H = fmt["width"], fmt["height"]
    segs = merged_segments(edit, fps)
    if not segs:
        die("every segment is cut: nothing to render")
    tmap = TimeMap([(a, b) for a, b, _ in segs])
    total = tmap.total
    build = project / "build" / "render"
    build.mkdir(parents=True, exist_ok=True)
    fdir = build / "fonts"
    fdir.mkdir(exist_ok=True)
    for f in FONTS_DIR.iterdir():
        if f.suffix.lower() in (".ttf", ".otf") and not (fdir / f.name).exists():
            shutil.copy2(f, fdir / f.name)
    t0 = time.time()
    log(f"{mode} render: {len(segs)} pieces, {total:.1f}s output from {info['duration']:.1f}s source")

    # ---- subtitles
    ass = AssBuilder(W, H, style)
    if edit.get("captions", {}).get("enabled") and edit["captions"].get("lines"):
        ass.captions(edit["captions"]["lines"], tmap)
    hk = edit.get("hook", {})
    if hk.get("enabled") and hk.get("options"):
        ch = min(int(hk.get("chosen", 0)), len(hk["options"]) - 1)
        ass.hook(hk["options"][ch], float(hk.get("duration", 2.6)))
    if edit.get("texts"):
        ass.texts(edit["texts"], tmap)
    has_ass = bool(ass.events)
    if has_ass:
        ass.write(build / "captions.ass")

    # ---- audio
    mix, lstats, target, nsfx = render_audio(project, edit, an, info, segs, tmap, build, style)

    # ---- picture
    inputs = ["-i", str(src)]
    fc = []
    vl = []
    for i, (a, b, z) in enumerate(segs):
        fc.append(f"[0:v]trim=start={a:.6f}:end={b:.6f},setpts=PTS-STARTPTS,fps={fps},"
                  f"{reframe_filter(info, fmt, z, f'r{i}')},format=yuv420p[v{i}]")
        vl.append(f"[v{i}]")
    fc.append("".join(vl) + f"concat=n={len(segs)}:v=1:a=0[vc]")
    cur = "vc"
    lf = look_filters(edit.get("look", {}), build, an, style, mode)
    if lf:
        fc.append(f"[{cur}]{','.join(lf)}[vl]")
        cur = "vl"
    n_in = 1
    for k, br in enumerate(list(edit.get("broll", [])) + [dict(g, mode="graphic") for g in edit.get("graphics", [])]):
        if not br.get("enabled", True):
            continue
        p = project_file(project, br["file"])
        if not p.exists():
            log(f"b-roll/graphic not found, skipping: {p}")
            continue
        T = tmap.to_out(float(br["start"]))
        D = (tmap.to_out(float(br["end"]), snap="prev") - T) if br.get("end") is not None else probe(p)["duration"]
        if D <= 0.05:
            continue
        if p.suffix.lower() in IMAGE_EXT:
            inputs += ["-loop", "1", "-t", f"{D + 0.1:.3f}", "-i", str(p)]
        else:
            inputs += ["-i", str(p)]
        frm = float(br.get("from", 0))
        m = br.get("mode", "full")
        pre = f"[{n_in}:v]trim=start={frm:.3f}:duration={D:.3f},setpts=PTS-STARTPTS+{T:.3f}/TB,fps={fps},"
        if m == "pip":
            sc = float(br.get("scale", 0.42))
            pw, ph = even(W * sc), even(H * (0.5 if H > W else 0.6))
            fc.append(pre + f"scale=w={pw}:h={ph}:force_original_aspect_ratio=decrease,format=yuva420p[b{k}]")
            pos = f"x=W-w-{int(W * 0.05)}:y={int(H * 0.12)}"
        elif m == "graphic":
            fc.append(pre + f"scale={W}:{H},format=yuva420p[b{k}]")
            pos = "x=0:y=0"
        else:
            zoom = ""
            if p.suffix.lower() in IMAGE_EXT and br.get("ken_burns", True):
                zoom = (f",scale={even(W * 1.08)}:{even(H * 1.08)},crop={W}:{H}:"
                        f"x='(in_w-out_w)*min(1,max(0,(t-{T:.3f})/{max(D, 0.1):.3f}))':y=(in_h-out_h)/2")
            fc.append(pre + f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}{zoom},setsar=1,"
                            f"format=yuva420p[b{k}]")
            pos = "x=0:y=0"
        fc.append(f"[{cur}][b{k}]overlay={pos}:enable='between(t,{T:.3f},{T + D:.3f})':eof_action=pass[o{k}]")
        cur = f"o{k}"
        n_in += 1
    tail = []
    if mode == "preview":
        tail.append(f"scale={even(W / 2)}:{even(H / 2)}")
    if has_ass:
        tail.append("ass=captions.ass:fontsdir=fonts")
    tail.append("format=yuv420p")
    fc.append(f"[{cur}]{','.join(tail)}[vout]")
    vscript = build / "video_graph.txt"
    vscript.write_text(";\n".join(fc), encoding="utf-8")

    an_idx = n_in
    inputs += ["-i", str(mix)]
    if lstats:
        af = (f"loudnorm=I={target}:TP=-1.0:LRA=11:measured_I={lstats['input_i']}:measured_TP={lstats['input_tp']}:"
              f"measured_LRA={lstats['input_lra']}:measured_thresh={lstats['input_thresh']}:"
              f"offset={lstats['target_offset']}:linear=true,aresample=48000")
    else:
        af = f"loudnorm=I={target}:TP=-1.0:LRA=11,aresample=48000"

    outdir = project / "out"
    outdir.mkdir(exist_ok=True)
    if mode == "preview":
        out = outdir / "preview.mp4"
        venc = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "27"]
        aenc = ["-c:a", "aac", "-b:a", "128k"]
    else:
        name = out_name or edit.get("export", {}).get("name") or f"{project.name}_v{edit.get('version', 1)}"
        out = outdir / f"{name}.mp4"
        venc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high"]
        aenc = ["-c:a", "aac", "-b:a", "192k"]
    cmd = ["ffmpeg", "-y", *inputs, *filter_script_args(vscript.name), "-map", "[vout]", "-map", f"{an_idx}:a",
           "-af", af, *venc, "-pix_fmt", "yuv420p", "-r", str(fps), *aenc, "-ar", "48000",
           "-t", f"{total:.3f}", "-movflags", "+faststart", str(out)]
    save_json(build / "last_render.json", {"mode": mode, "cmd": cmd, "segments": segs, "total": total})
    code, err = run_ffmpeg_progress(cmd, total, cwd=build, label=mode)
    if code != 0:
        die("ffmpeg failed:\n" + "\n".join(err.strip().splitlines()[-20:]))
    took = time.time() - t0
    log(f"done in {took:.0f}s -> {out}")
    result = {"output": rel(out, project), "mode": mode, "seconds": round(total, 2), "render_time": round(took, 1),
              "segments": len(segs), "sfx": nsfx}
    if mode == "final":
        result["qc"] = qc(out, edit, style, total, target)
        save_json(out.with_suffix(".qc.json"), result["qc"])
    return result


# ---------------------------------------------------------------- QC
def qc(out: Path, edit, style, expected, target):
    info = probe(out)
    r = run(["ffmpeg", "-v", "info", "-i", str(out), "-af", "ebur128=peak=true", "-vf",
             "blackdetect=d=0.25:pix_th=0.06", "-f", "null", "-"], check=False)
    lufs = tp = None
    blacks = []
    for line in r.stderr.splitlines():
        m = re.search(r"I:\s+(-?[\d.]+) LUFS", line)
        if m:
            lufs = float(m.group(1))
        m = re.search(r"Peak:\s+(-?[\d.]+) dBFS", line)
        if m:
            tp = float(m.group(1))
        m = re.search(r"black_start:([\d.]+) black_end:([\d.]+)", line)
        if m:
            blacks.append([float(m.group(1)), float(m.group(2))])
    checks = []

    def add(name, ok, detail):
        checks.append({"check": name, "ok": bool(ok), "detail": detail})

    add("duration", abs(info["duration"] - expected) < 0.25, f"{info['duration']:.2f}s (planned {expected:.2f}s)")
    add("loudness", lufs is not None and abs(lufs - target) <= 1.5, f"{lufs} LUFS (target {target})")
    add("true peak", tp is not None and tp <= -0.5, f"{tp} dBFS")
    add("black frames", not blacks, f"{len(blacks)} black stretches" + (f" at {blacks[:3]}" if blacks else ""))
    vertical = edit["format"]["height"] > edit["format"]["width"]
    if edit.get("captions", {}).get("enabled") and vertical:
        y = style["captions"]["position_y"]
        add("captions safe zone", 0.12 <= y <= 0.78,
            f"captions centred at {y:.0%} of height (Reels/TikTok UI covers the bottom ~20%)")
    add("resolution", (info.get("width"), info.get("height")) == (edit["format"]["width"], edit["format"]["height"]),
        f"{info.get('width')}x{info.get('height')}")
    size_mb = out.stat().st_size / 1e6
    add("file size", size_mb < 4000, f"{size_mb:.1f} MB")
    passed = all(c["ok"] for c in checks)
    log("QC " + ("passed" if passed else "found issues") + ": " +
        "; ".join(f"{'OK' if c['ok'] else 'CHECK'} {c['check']} ({c['detail']})" for c in checks))
    return {"passed": passed, "checks": checks}
