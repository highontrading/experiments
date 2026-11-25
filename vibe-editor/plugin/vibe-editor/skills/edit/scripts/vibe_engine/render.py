"""Render orchestration: plan → (AI masks) → filter graph → ffmpeg, with a safety net."""
import importlib
import math
import os
import shutil
import time
import traceback

from . import ai, captions, fx_text, fx_video, presets
from .core import (FPS, SR, WARNINGS, VibeError, build_segments, die, ensure_fonts, find_ws, info, load_brand,
                   load_json, probe, resolve_job, run_ff, save_json, set_ws, slug, sound_path, TimeMap, warn, ws_paths)
from .text import Ctx, ass_header, ass_time, ev_window

FORMATS = {"9:16": (1080, 1920), "16:9": (1920, 1080), "1:1": (1080, 1080), "4:5": (1080, 1350)}

_MODULES = [fx_text, presets]
for _name in ("fx_ui", "fx_data", "fx_decor"):
    try:
        _MODULES.append(importlib.import_module(f".{_name}", __package__))
    except ImportError:
        pass
    except Exception as _ex:  # a broken add-on module must never take the engine down
        print(f"⚠️  Effect pack '{_name}' failed to load and was skipped: {_ex}", flush=True)

ASS_HANDLERS = {}
HIDE_CAPTIONS = set()
for _m in _MODULES:
    ASS_HANDLERS.update(getattr(_m, "EVENTS", {}))
    HIDE_CAPTIONS |= set(getattr(_m, "HIDE_CAPTIONS", set()))
HIDE_CAPTIONS |= fx_video.HIDE_CAPTIONS | {"cutout", "sticker", "frame_break"}
KNOWN = set(ASS_HANDLERS) | set(fx_video.ASS_EVENTS) | fx_video.VIDEO_TYPES | ai.AI_TYPES | {"sfx", "preset"}

_VIDEO_ALL = set(fx_video.VIDEO_TYPES) - {"broll", "image", "overlay"}
SAFE_LEVELS = [
    set(),
    {"filter", "ass", "frame", "pullback", "layout", "text_mask", "slice", "double_exposure"},
    {"filter", "ass", "frame", "pullback", "layout", "text_mask", "slice", "double_exposure"} | ai.AI_TYPES | {"__behind__", "freeze",
                                                                                                             "spotlight", "__blur__"},
    _VIDEO_ALL | ai.AI_TYPES | {"__behind__", "__blur__", "ass", "filter"},
    "__captions_only__",
]


def all_effect_docs():
    docs = {}
    for m in _MODULES + [fx_video, ai]:
        docs.update(getattr(m, "DOCS", {}))
    return docs


# --------------------------------------------------------------------------- plan

def build_plan(ws, jd, edit, fmt, preview, force_front=None, drop_types=()):
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    brand = load_brand(ws)
    for k, v in (edit.get("brand_override") or {}).items():
        brand[k] = dict(brand.get(k, {}), **v) if isinstance(v, dict) else v
    pr = job["probe"]
    W, H = FORMATS[fmt]
    RW, RH = (W // 2 // 2 * 2, H // 2 // 2 * 2) if preview else (W, H)
    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    ctx = Ctx(W, H, brand, tm.words(words), tm.duration, preview)
    ctx.force_front = set(force_front or ())
    raw = [dict(e) for e in (edit.get("events") or []) if isinstance(e, dict) and not e.get("disabled")]
    events = presets.expand(ctx, raw, KNOWN)
    clean = []
    for e in events:
        t = e.get("type")
        if t not in KNOWN:
            warn(f"Unknown effect type '{t}' — skipped. (Run `list effects`.)")
            continue
        if t in drop_types or drop_types == "__captions_only__":
            continue
        clean.append(e)
    events = clean
    hide = []
    for i, e in enumerate(events):
        typ = e.get("type")
        ctx.group = i
        ctx.behind = bool(e.get("behind")) and "__behind__" not in drop_types
        n_lines, n_boxes, n_req, n_sfx = len(ctx.lines), len(ctx.boxes), len(ctx.video_requests), len(ctx.extra_sfx)
        try:
            r = None
            if typ in fx_video.ASS_EVENTS:
                r = fx_video.ASS_EVENTS[typ](ctx, e)
            if typ in ASS_HANDLERS:
                r = ASS_HANDLERS[typ](ctx, e)
            if r and e.get("hide_captions", typ in HIDE_CAPTIONS):
                hide.append(r)
            if e.get("sfx") and typ in ASS_HANDLERS and typ not in ("checklist", "counter", "countdown", "cta", "tag", "lower_third"):
                at = r[0] if r else ctx.t(e.get("at"), 0.0)
                if not any(abs(s[0] - at) < 0.02 and s[1] == e["sfx"] for s in ctx.extra_sfx):
                    ctx.extra_sfx.append((at, e["sfx"], float(e.get("sfx_volume", 0.55))))
        except VibeError:
            raise
        except Exception as ex:  # one broken effect must never break the video
            del ctx.lines[n_lines:]
            del ctx.boxes[n_boxes:]
            del ctx.video_requests[n_req:]
            del ctx.extra_sfx[n_sfx:]
            warn(f"Effect #{i + 1} ({typ}) could not be built and was skipped: {ex}")
            if os.environ.get("VIBE_DEBUG"):
                traceback.print_exc()
    ctx.group = None
    ctx.behind = False
    if "__blur__" in drop_types or drop_types == "__captions_only__":
        ctx.video_requests = []
    try:
        captions.build_captions(ctx, edit.get("captions", {}), hide)
    except Exception as ex:
        warn(f"Captions style failed ({ex}) — falling back to bold-pop.")
        ctx.lines = [l for l in ctx.lines if not str(l[0]).startswith("cap:")]
        captions.build_captions(ctx, {"style": "bold-pop"}, hide)
    return {"job": job, "pr": pr, "W": W, "H": H, "RW": RW, "RH": RH, "segs": segs, "tm": tm, "ctx": ctx,
            "events": events, "brand": brand, "fmt": fmt}


def write_ass(ctx, path, behind):
    styles = [v[1] for v in ctx.styles.values()] or [("S0", "Poppins Black", 40, "&H00FFFFFF", "&H00FFFFFF", "&H00000000",
                                                     "&H96000000", False, False, 1, 0, 0)]
    lines = [l for l in ctx.lines if bool(l[6]) == behind]
    lines.sort(key=lambda l: (l[1], l[2]))
    with open(path, "w", encoding="utf-8") as f:
        f.write(ass_header(ctx.W, ctx.H, styles))
        for (g, layer, s, e, st, txt, b) in lines:
            f.write(f"Dialogue: {layer},{ass_time(s)},{ass_time(e)},{st},,0,0,0,,{txt}\n")
    return len(lines)


def behind_groups(ctx):
    groups = {}
    for (g, layer, s, e, st, txt, b) in ctx.lines:
        if b:
            a0, b0 = groups.get(g, (s, e))
            groups[g] = (min(a0, s), max(b0, e))
    return [(g, a, b) for g, (a, b) in groups.items()]


def group_box(ctx, g):
    bx = [b for b in ctx.boxes if b[7] == g]
    if not bx:
        return None
    return (min(b[2] for b in bx), min(b[3] for b in bx), max(b[4] for b in bx), max(b[5] for b in bx))


# --------------------------------------------------------------------------- graph

def select_expr(segs, eps):
    return "+".join(f"between(t,{x:.4f},{y - eps:.5f})" for x, y in segs)


def base_chain(G, plan, src_idx, edit):
    pr, segs = plan["pr"], plan["segs"]
    sel = select_expr(segs, 0.5 / FPS)
    G.push(f"[{src_idx}:v]setpts=PTS-STARTPTS,fps={FPS},select='{sel}',setpts=N/{FPS}/TB,"
           + fx_video.reframe_filter(pr, G.RW, G.RH, edit.get("reframe")) + "[v0]")
    G.cur = "v0"


def zoom_chain(G, ctx, events):
    zooms, shakes = [], []
    for e in events:
        t = e.get("type")
        if t in ("zoom", "shake", "impact"):
            a_, b_ = ev_window(ctx, e, {"zoom": 1.5, "shake": 0.4, "impact": 0.9}[t])
            if t == "impact":
                e = dict(e, _a=a_, _b=min(b_, a_ + 0.45), amount=18)
                shakes.append(e)
                continue
            e["_a"], e["_b"] = a_, b_
            (zooms if t == "zoom" else shakes).append(e)
            if e.get("sfx"):
                ctx.extra_sfx.append((a_, e["sfx"], float(e.get("sfx_volume", 0.5))))
    if zooms or shakes:
        z, x, y = fx_video.zoom_expr(ctx, zooms, shakes)
        G.chain(f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={G.RW}x{G.RH}:fps={FPS}")


def audio_graph(G, plan, edit, audio_idx, ws, ctx):
    pr, segs, tm = plan["pr"], plan["segs"], plan["tm"]
    au = edit.get("audio", {}) or {}
    if pr["has_audio"]:
        asel = select_expr(segs, 0.5 / SR)
        v = (f"[{audio_idx}:a]asetpts=PTS-STARTPTS,aresample={SR},aselect='{asel}',asetpts=N/SR/TB,"
             f"aformat=sample_fmts=fltp:channel_layouts=stereo,highpass=f=70")
        if au.get("denoise"):
            v += ",afftdn=nr=12:nf=-30"
        v += ",acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2"
        v += f",loudnorm=I={float(au.get('loudness', -14))}:TP=-1.5:LRA=11,aresample={SR},atrim=0:{tm.duration:.3f}"
        voice = "voice_pre"
        G.push(v + f"[{voice}]")
    else:
        voice = "voice_pre"
        G.push(f"anullsrc=r={SR}:cl=stereo,atrim=0:{tm.duration:.3f}[{voice}]")
    mix = []
    music = au.get("music") or {}
    mp = None
    if music.get("file"):
        from .core import find_media
        mp = find_media(ws, music["file"], "music")
    if mp:
        idx = G.add_input(["-stream_loop", "-1", "-i", mp])
        vol = float(music.get("volume", 0.14))
        G.push(f"[{idx}:a]aresample={SR},aformat=sample_fmts=fltp:channel_layouts=stereo,atrim=0:{tm.duration:.3f},"
               f"volume={vol},afade=t=in:d=0.6,afade=t=out:st={max(0, tm.duration - 1.5):.3f}:d=1.5[mus]")
        if music.get("duck", True) and pr["has_audio"]:
            G.push(f"[{voice}]asplit[voice][vsc]")
            G.push("[mus][vsc]sidechaincompress=threshold=0.04:ratio=6:attack=30:release=350[musd]")
            mix = ["voice", "musd"]
        else:
            G.push(f"[{voice}]anull[voice]")
            mix = ["voice", "mus"]
    else:
        G.push(f"[{voice}]anull[voice]")
        mix = ["voice"]
    sfx_list = []
    for e in plan["events"]:
        if e.get("type") == "sfx":
            sfx_list.append((ctx.t(e.get("at"), 0.0), e.get("name", "whoosh"), float(e.get("volume", 0.55))))
    if edit.get("auto_sfx", True):
        sfx_list += ctx.extra_sfx
    seen = set()
    n = 0
    for (t0, name, vol) in sorted(sfx_list):
        key = (round(t0, 2), name)
        if t0 >= tm.duration or key in seen:
            continue
        seen.add(key)
        p = sound_path(name)
        if not p:
            continue
        idx = G.add_input(["-i", p])
        ms = int(max(0, t0) * 1000)
        G.push(f"[{idx}:a]aresample={SR},aformat=sample_fmts=fltp:channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[sx{n}]")
        mix.append(f"sx{n}")
        n += 1
    if len(mix) > 1:
        G.push("".join(f"[{m}]" for m in mix) + f"amix=inputs={len(mix)}:duration=first:normalize=0,alimiter=limit=0.95,"
               f"atrim=0:{tm.duration:.3f}[aout]")
    else:
        G.push("[voice]anull[aout]")
    return n


def build_graph(plan, edit, ws, jd, preview, drop, base_path=None, mask_path=None):
    ctx, events = plan["ctx"], plan["events"]
    G = fx_video.Graph(plan["RW"], plan["RH"], plan["tm"].duration, jd, preview)
    src = plan["job"]["source"]
    look = edit.get("look", plan["brand"].get("look", "punchy"))
    if base_path:
        bidx = G.add_input(["-i", base_path])
        G.push(f"[{bidx}:v]null[v0]")
        G.cur = "v0"
        aidx = G.add_input(["-i", src])
    else:
        aidx = G.add_input(["-i", src])
        base_chain(G, plan, aidx, edit)
        zoom_chain(G, ctx, events)
    lk = fx_video.look_chain(look, jd)
    if lk:
        G.chain(lk)
    fx_video.window_filters(G, ctx, events)
    if "freeze" not in drop:
        fx_video.freeze_frames(G, ctx, events)
    pool = None
    if mask_path:
        midx = G.add_input(["-i", mask_path])
        pool = ai.MaskPool(G, midx)
        ai.apply_ai(G, ctx, events, pool, ws)
        if os.path.exists(os.path.join(jd, "behind.ass")) and "__behind__" not in drop:
            ai.apply_behind(G, "behind.ass", pool)
    fx_video.overlays(G, ctx, events, ws, look)
    fx_video.frames_layouts(G, ctx, events, ws)
    if "spotlight" not in drop:
        fx_video.spotlight(G, ctx, events)
    if "__blur__" not in drop:
        fx_video.blur_regions(G, ctx)
    fontsdir = os.path.relpath(ensure_fonts(ws), jd).replace("\\", "/")
    G.chain(f"ass=overlay.ass:fontsdir={fontsdir},format=yuv420p")
    if pool:
        pool.finalize()
        if fontsdir:
            G.lines = [l.replace("ass=behind.ass", f"ass=behind.ass:fontsdir={fontsdir}") for l in G.lines]
    G.push(f"[{G.cur}]null[vout]")
    n_sfx = audio_graph(G, plan, edit, aidx, ws, ctx)
    return G, n_sfx


# --------------------------------------------------------------------------- commands

def render_job(a):
    WARNINGS.clear()
    ws, jd = resolve_job(a)
    set_ws(ws)
    job = load_json(os.path.join(jd, "job.json"))
    edit = load_json(a.edit) if getattr(a, "edit", None) else load_json(os.path.join(jd, "edit.json"), {})
    if not os.path.exists(job["source"]):
        die(f"Source video moved or deleted: {job['source']}")
    fmt = a.format or edit.get("format", "9:16")
    if fmt not in FORMATS:
        warn(f"Unknown format {fmt} — using 9:16")
        fmt = "9:16"
    preview = a.preview
    t_start = time.time()
    last_err = None
    for level, drop in enumerate(SAFE_LEVELS):
        if level and last_err:
            info(f"🛟 Retrying in safe mode (level {level}): skipping {', '.join(sorted(t for t in drop if not t.startswith('__'))) or 'advanced layers'}")
        try:
            out = _render_once(ws, jd, edit, fmt, preview, drop, a)
            if level:
                warn(f"Rendered in safe mode — some advanced effects were skipped ({last_err.splitlines()[0][:160]}).")
            info(f"✅ Done in {time.time() - t_start:.0f}s → {out}")
            if WARNINGS:
                info(f"   ({len(WARNINGS)} note(s) above)")
            return out
        except VibeError as ex:
            last_err = str(ex)
            if "failed" not in last_err:
                raise
            if os.environ.get("VIBE_DEBUG"):
                print(last_err)
    die("Render failed even in safe mode:\n" + (last_err or ""))


def _render_once(ws, jd, edit, fmt, preview, drop, a):
    plan = build_plan(ws, jd, edit, fmt, preview, drop_types=drop)
    ctx = plan["ctx"]
    tm = plan["tm"]
    need_ai = any(e.get("type") in ai.AI_TYPES for e in plan["events"]) or any(l[6] for l in ctx.lines)
    base_path = mask_path = None
    if need_ai and not ai.available():
        warn("AI cut-out needs onnxruntime (`python3 vibe.py install`). Text-behind and cut-out effects were shown in front / skipped.")
        need_ai = False
        drop = set(drop) | ai.AI_TYPES | {"__behind__"}
        plan = build_plan(ws, jd, edit, fmt, preview, drop_types=drop)
        ctx = plan["ctx"]
    if need_ai:
        base_path = os.path.join(jd, "base_preview.mp4" if preview else "base.mp4")
        G0 = fx_video.Graph(plan["RW"], plan["RH"], tm.duration, jd, preview)
        sidx = G0.add_input(["-i", plan["job"]["source"]])
        base_chain(G0, plan, sidx, edit)
        zoom_chain(G0, plan["ctx"], plan["events"])
        G0.push(f"[{G0.cur}]null[vout]")
        info("🎞  Preparing base video for AI effects…")
        run_ff(G0.inputs + ["-filter_complex", ";".join(G0.lines), "-map", "[vout]", "-an", "-c:v", "libx264",
                            "-preset", "ultrafast" if preview else "veryfast", "-crf", "16" if preview else "10",
                            "-r", str(FPS), "-pix_fmt", "yuv420p", "-t", f"{tm.duration:.3f}", base_path], cwd=jd,
               desc="base render")
        mask_path = os.path.join(jd, "mask_preview.mkv" if preview else "mask.mkv")
        bg = behind_groups(ctx)
        wins = ai.ai_windows(ctx, plan["events"], bg)
        samples, msize = ai.compute_mask(base_path, wins, tm.duration, plan["RW"], plan["RH"], mask_path, preview)
        # readability check: anything behind the person must stay readable
        force = set()
        for (g, ga, gb) in bg:
            box = group_box(ctx, g)
            if not box:
                continue
            cov = ai.coverage(samples, msize, box, ga, gb, ctx.W, ctx.H)
            limit = 0.30 if str(g).startswith("cap:") else 0.42
            if cov > limit:
                force.add(g)
        if force:
            n_caps = sum(1 for g in force if str(g).startswith("cap:"))
            n_fx = len(force) - n_caps
            warn(f"Readability check: moved {n_fx} effect(s) and {n_caps} caption(s) in front of you — "
                 f"they were hidden behind you.")
            plan = build_plan(ws, jd, edit, fmt, preview, force_front=force, drop_types=drop)
            ctx = plan["ctx"]
    write_ass(ctx, os.path.join(jd, "overlay.ass"), behind=False)
    nb = write_ass(ctx, os.path.join(jd, "behind.ass"), behind=True)
    if not nb or not mask_path:
        try:
            os.remove(os.path.join(jd, "behind.ass"))
        except OSError:
            pass
        if nb and not mask_path:
            # no AI available: draw behind-lines in front instead
            ctx.lines = [l[:6] + (False,) for l in ctx.lines]
            write_ass(ctx, os.path.join(jd, "overlay.ass"), behind=False)
    G, n_sfx = build_graph(plan, edit, ws, jd, preview, drop, base_path, mask_path)
    job = plan["job"]
    out_name = slug((edit.get("output") or {}).get("name") or job["name"])
    suffix = "" if fmt == "9:16" else "-" + fmt.replace(":", "x")
    if preview:
        out = os.path.join(jd, f"preview{suffix}.mp4")
        venc = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "28"]
    else:
        os.makedirs(ws_paths(ws)["output"], exist_ok=True)
        out = os.path.join(ws_paths(ws)["output"], f"{out_name}{suffix}.mp4")
        venc = ["-c:v", "libx264", "-preset", getattr(a, "preset", "medium"), "-crf", str(getattr(a, "crf", 18)),
                "-profile:v", "high"]
    with open(os.path.join(jd, "graph.txt"), "w", encoding="utf-8") as f:
        f.write(";\n".join(G.lines))
    info(f"🎞  Rendering {'preview' if preview else 'final'} {fmt} ({G.RW}x{G.RH}), {tm.duration:.1f}s, "
         f"{len(plan['events'])} effects, {n_sfx} sounds…")
    run_ff(G.inputs + ["-filter_complex", ";".join(G.lines), "-map", "[vout]", "-map", "[aout]"] + venc +
           ["-r", str(FPS), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            "-t", f"{tm.duration:.3f}", out], cwd=jd, desc="render")
    save_json(os.path.join(jd, "last_render.json"), {
        "file": out, "duration": tm.duration, "preview": preview, "format": fmt,
        "events": [{"type": e.get("type"), "at": round(ctx.t(e.get("at"), 0.0), 2)} for e in plan["events"]],
        "warnings": list(WARNINGS)})
    return out


def check_job(a):
    """Validate an edit plan without rendering: unknown effects, missing files, overlaps, off-screen items."""
    WARNINGS.clear()
    ws, jd = resolve_job(a)
    edit = load_json(a.edit) if getattr(a, "edit", None) else load_json(os.path.join(jd, "edit.json"), {})
    fmt = getattr(a, "format", None) or edit.get("format", "9:16")
    plan = build_plan(ws, jd, edit, fmt if fmt in FORMATS else "9:16", True)
    ctx = plan["ctx"]
    issues = 0
    gb = [b for b in ctx.boxes if b[6] in ("graphic", "ui")]
    for i in range(len(gb)):
        for j in range(i + 1, len(gb)):
            A, B = gb[i], gb[j]
            if A[7] == B[7]:
                continue
            if A[0] < B[1] - 0.05 and A[1] > B[0] + 0.05 and A[2] < B[4] and A[4] > B[2] and A[3] < B[5] and A[5] > B[3]:
                ov_t = (max(A[0], B[0]), min(A[1], B[1]))
                info(f"⚠️  Overlap {ov_t[0]:.1f}–{ov_t[1]:.1f}s: effect #{(A[7] or 0) + 1} and #{(B[7] or 0) + 1} cover the same area. "
                     f"Move one (position) or change timing.")
                issues += 1
    for b in gb:
        if b[3] < -5 or b[5] > ctx.H + 5 or b[2] < -5 or b[4] > ctx.W + 5:
            info(f"⚠️  Effect #{(b[7] or 0) + 1} goes off-screen at {b[0]:.1f}s.")
            issues += 1
    for e in plan["events"]:
        a_, b_ = ev_window(ctx, e, 1.0)
        if a_ >= plan["tm"].duration - 0.05:
            info(f"⚠️  {e.get('type')} starts after the video ends ({a_:.1f}s) — it won't show.")
            issues += 1
    n_caps = len({l[0] for l in ctx.lines if str(l[0]).startswith("cap:")})
    info(f"\nPlan: {plan['tm'].duration:.1f}s · {len(plan['events'])} effects · {n_caps} caption groups · "
         f"{len(WARNINGS)} warnings · {issues} layout issues")
    info("✅ Looks good to render." if not (WARNINGS or issues) else "Fix the notes above (or render anyway — the engine skips anything broken).")
    return issues


def cmd_stills(a):
    ws, jd = resolve_job(a)
    lr = load_json(os.path.join(jd, "last_render.json"))
    if not lr:
        die("Render first (use --preview for speed).")
    src = a.file or lr["file"]
    dur = lr["duration"]
    if a.times:
        times = [float(x) for x in a.times.split(",") if x.strip()]
    else:
        ev = sorted({e["at"] for e in lr.get("events", [])})
        times = [min(dur - 0.1, t + 0.6) for t in ev][:11]
        if len(times) < 6:
            n = 8
            times = sorted(set(times + [dur * (i + 0.5) / n for i in range(n)]))[:12]
    times = [max(0.0, min(dur - 0.05, t)) for t in times]
    tmp = os.path.join(jd, "stills")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    for i, t in enumerate(times):
        run_ff(["-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "3",
                os.path.join(tmp, f"f{i:02d}.jpg")], desc="still")
    cols = min(6, len(times))
    rows = math.ceil(len(times) / cols)
    out = os.path.join(jd, "storyboard.jpg")
    run_ff(["-framerate", "1", "-i", os.path.join(tmp, "f%02d.jpg"), "-vf",
            f"tile={cols}x{rows}:padding=8:margin=8:color=0x202020", "-frames:v", "1", "-q:v", "3", out], desc="tile")
    info(f"🖼  Storyboard ({len(times)} frames at {', '.join(f'{t:.1f}s' for t in times)}) → {out}")


def cmd_peek(a):
    src = os.path.abspath(a.video)
    if not os.path.exists(src):
        die(f"Video not found: {src}")
    pr = probe(src)
    n = max(2, min(int(a.n), 30))
    ws = find_ws(a.ws or os.path.dirname(src))
    tmp = os.path.join(ws, ".vibe", "peek", slug(os.path.splitext(os.path.basename(src))[0]))
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    t0 = float(a.start or 0)
    t1 = float(a.end) if a.end else pr["duration"]
    times = [t0 + (t1 - t0) * (i + 0.5) / n for i in range(n)]
    for i, t in enumerate(times):
        run_ff(["-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={a.width}:-2", "-q:v", "3",
                os.path.join(tmp, f"f{i:02d}.jpg")], desc="peek")
    cols = min(6, n)
    rows = math.ceil(n / cols)
    out = a.out or os.path.join(tmp, "contact.jpg")
    run_ff(["-framerate", "1", "-i", os.path.join(tmp, "f%02d.jpg"), "-vf",
            f"tile={cols}x{rows}:padding=8:margin=8:color=0x202020", "-frames:v", "1", "-q:v", "3", out], desc="tile")
    info(f"🖼  {os.path.basename(src)}: {pr['width']}x{pr['height']}, {pr['duration']:.1f}s — {n} frames at "
         f"{', '.join(f'{t:.1f}s' for t in times)}\n→ {out}")


def cmd_cover(a):
    ws, jd = resolve_job(a)
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    edit = load_json(os.path.join(jd, "edit.json"), {})
    brand = load_brand(ws)
    pr = job["probe"]
    fmt = a.format or edit.get("format", "9:16")
    W, H = FORMATS.get(fmt, FORMATS["9:16"])
    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    ctx = Ctx(W, H, brand, tm.words(words), tm.duration)
    t_out = ctx.t(a.at, min(1.0, tm.duration / 3))
    t_src = tm.to_src(t_out)
    u = ctx.u
    pos = a.position
    y = {"top": H * 0.20, "center": H * 0.45, "bottom": H * 0.72}[pos]
    band_y = 0 if pos == "top" else H * 0.5 if pos == "bottom" else H * 0.25
    from .text import rect
    ctx.shape(0, 5, rect(W, H * 0.5), "#000000", 0x70, f"\\an7\\pos(0,{band_y:.0f})", 1, blur=round(60 * u))
    from .core import resolve_font
    font = resolve_font(a.font or brand.get("fonts", {}).get("title", "poppins-black"))
    lines, fs = ctx.wrap(a.title.upper(), font, 132 * u, W * 0.88, max_lines=4)
    st = ctx.style(font, fs, "#FFFFFF", "#000000", round(8 * u), round(6 * u))
    lh = fs * 1.1
    ctx.draw_lines(0, 5, st, lines, font, fs, W / 2, y, lh, lambda xx, yy, i: f"\\an5\\pos({xx:.0f},{yy:.0f})", "#FFFFFF",
                   brand["colors"]["accent"], 5)
    if a.sub:
        bf = resolve_font("inter-extrabold")
        sst = ctx.style(bf, 56 * u, brand["colors"]["accent"], "#000000", round(5 * u), round(3 * u))
        from .text import esc
        ctx.add(0, 5, sst, "{" + f"\\an5\\pos({W / 2:.0f},{ctx.clamp_y(y, lh * len(lines)) + lh * len(lines) / 2 + 50 * u:.0f})" + "}" +
                esc(a.sub.upper()), layer=5)
    write_ass(ctx, os.path.join(jd, "cover.ass"), behind=False)
    fontsdir = os.path.relpath(ensure_fonts(ws), jd).replace("\\", "/")
    lk = fx_video.look_chain(edit.get("look", brand.get("look", "punchy")), jd)
    lf = (lk + ",") if lk else ""
    out_name = slug((edit.get("output") or {}).get("name") or job["name"])
    os.makedirs(ws_paths(ws)["output"], exist_ok=True)
    out = os.path.join(ws_paths(ws)["output"], f"{out_name}-cover.jpg")
    rf = fx_video.reframe_filter(pr, W, H, edit.get("reframe"))
    vf = f"[0:v]{rf}[r];[r]{lf}ass=cover.ass:fontsdir={fontsdir}[o]"
    run_ff(["-ss", f"{t_src:.3f}", "-i", job["source"], "-frames:v", "1", "-filter_complex", vf, "-map", "[o]",
            "-q:v", "2", out], cwd=jd, desc="cover")
    info(f"✅ Cover (frame at {t_out:.1f}s) → {out}")
