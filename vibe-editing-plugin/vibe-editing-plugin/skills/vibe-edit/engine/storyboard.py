"""The storyboard: the edit as numbered frames, before anything is rendered.

  ve.py storyboard <project> [--panels N]
      -> <project>/storyboard/v<version>_p1.png (p2, p3 … for longer videos)
      -> <project>/storyboard/v<version>.json  (panel number -> output/source time, for changes)

Each panel is a real frame of the planned edit (the cut, framing, punch-in, colour look,
captions, hook, motion text and B-roll exactly as they will render), with notes underneath:
what is said, which text appears, sound effects, zoom and what was cut just before.
"""
from __future__ import annotations

import math
from pathlib import Path

from captions import apply_case, normalize_line
from common import fmt_time, load_json, log, save_json
from render import render_frames
from sheets import grid_sheet


def _beats(c, max_panels):
    total = c.total
    tm = c.tmap
    pri, other = [], []
    hk = c.edit.get("hook", {})
    pri.append(min(0.5, total / 3))
    for it in c.edit.get("texts", []):
        if it.get("enabled", True):
            s, e = tm.to_out(float(it["start"])), tm.to_out(float(it["end"]), snap="prev")
            pri.append(s + min(0.6, max(0.2, (e - s) / 2)))
    for br in c.edit.get("broll", []):
        if br.get("enabled", True):
            s = tm.to_out(float(br["start"]))
            pri.append(s + 0.5)
    for k, off in enumerate(tm.offsets[1:], 1):
        if c.segs[k][1] - c.segs[k][0] > 0.8:
            other.append(off + 0.45)
    gap = max(1.2, total / max(1, max_panels))
    t = 0.0
    while t < total:
        other.append(t + gap / 2)
        t += gap
    min_sep = max(0.6, total / (max_panels * 2.2))
    chosen = []
    for t in sorted(set(round(x, 2) for x in pri)):
        if all(abs(t - x) >= min_sep * 0.6 for x in chosen):
            chosen.append(t)
    rest = sorted(set(round(x, 2) for x in other))
    for t in rest:
        if len(chosen) >= max_panels:
            break
        if all(abs(t - x) >= min_sep for x in chosen):
            chosen.append(t)
    chosen = sorted(x for x in chosen if 0 <= x < total - 0.05)[:max_panels]
    # nudge to the middle of the nearest spoken caption word so the highlight shows
    words = []
    for ln in c.edit.get("captions", {}).get("lines", []):
        for w in normalize_line(ln):
            m = (w["s"] + w["e"]) / 2
            if tm.inside(m):
                words.append(tm.to_out(m))
    out = []
    for t in chosen:
        near = min(words, key=lambda x: abs(x - t)) if words else None
        out.append(near if near is not None and abs(near - t) < 0.35 else t)
    return sorted(set(round(x, 3) for x in out))


def _notes(c, t, n):
    tm, edit = c.tmap, c.edit
    offs = tm.offsets
    i = max(k for k in range(len(c.segs)) if offs[k] <= t + 1e-9)
    a, b, z = c.segs[i]
    src_t = a + (t - offs[i])
    lines = []
    said = ""
    for ln in edit.get("captions", {}).get("lines", []):
        ws = [w for w in normalize_line(ln) if tm.inside((w["s"] + w["e"]) / 2)]
        if ws and tm.to_out(ws[0]["s"]) - 0.05 <= t <= tm.to_out(ws[-1]["e"]) + 0.3:
            said = " ".join(w["w"] for w in ws)
            break
    if not said:
        ws = [w["w"] for w in c.an.get("words", []) if abs(w["s"] - src_t) < 1.2 and tm.inside((w["s"] + w["e"]) / 2)]
        said = " ".join(ws)
    if said:
        lines.append(f"“{said}”")
    hk = edit.get("hook", {})
    if hk.get("enabled") and hk.get("options") and t < float(hk.get("duration", 2.6)):
        lines.append("HOOK: " + hk["options"][min(int(hk.get("chosen", 0)), len(hk["options"]) - 1)])
    for it in edit.get("texts", []):
        if it.get("enabled", True):
            s, e = tm.to_out(float(it["start"])), tm.to_out(float(it["end"]), snap="prev")
            if s - 0.05 <= t <= e:
                lines.append(f"{it.get('type', 'text').replace('_', ' ').upper()}: {it.get('text', '')}")
    for br in edit.get("broll", []):
        s, e = tm.to_out(float(br["start"])), tm.to_out(float(br.get("end", br["start"] + 2)), snap="prev")
        if br.get("enabled", True) and s <= t <= e:
            lines.append(f"B-ROLL: {Path(br['file']).name} ({br.get('mode', 'full')})")
    snd = edit.get("sound", {})
    hits = []
    if snd.get("enabled", True):
        for x in snd.get("sfx", []):
            if x.get("enabled", True):
                xt = tm.to_out(float(x["t"])) + float(x.get("offset", 0))
                if abs(xt - t) <= 0.7:
                    hits.append(Path(str(x["sound"])).stem)
        if hk.get("enabled") and snd.get("hook_sfx") and t < 0.8:
            hits.append(snd["hook_sfx"])
    if hits:
        lines.append("SFX: " + ", ".join(dict.fromkeys(hits)))
    extra = []
    if z and z != 1.0:
        extra.append(f"zoom {z:.2f}x")
    if i > 0 and t - offs[i] < 1.0:
        removed = a - c.segs[i - 1][1]
        if removed > 0.05:
            why = [s.get("reason", "") for s in edit["segments"] if not s.get("keep", True)
                   and s["start"] >= c.segs[i - 1][1] - 0.01 and s["end"] <= a + 0.01]
            kinds = sorted({("retake" if ("take" in w or "false" in w) else "filler" if "filler" in w else "pause")
                            for w in why})
            extra.append(f"cut {removed:.1f}s before ({', '.join(kinds) or 'pause'})")
    if extra:
        lines.append(" · ".join(extra))
    return {"panel": n, "out_time": round(t, 2), "source_time": round(src_t, 2), "lines": lines}


def storyboard(project: Path, panels=None):
    project = Path(project).resolve()
    edit = load_json(project / "edit.json")
    if not edit:
        from common import die
        die("edit.json not found: plan the edit first")
    total_guess = sum(s["end"] - s["start"] for s in edit["segments"] if s.get("keep", True))
    if panels is None:
        panels = max(6, min(10, round(total_guess / 2.8))) if total_guess <= 75 else min(30, round(total_guess / 8))
    vertical = edit["format"]["height"] > edit["format"]["width"]
    per_page = 10 if vertical else 9
    sb = project / "storyboard"
    frames_dir = project / "build" / "storyboard" / "frames"
    for old in frames_dir.glob("*.jpg") if frames_dir.exists() else []:
        old.unlink()
    from render import prepare
    c0 = prepare(project, mode="final", build_name="storyboard")
    times = _beats(c0, panels)
    log(f"storyboard: rendering {len(times)} frames of the planned edit")
    files, c = render_frames(project, times, frames_dir, width=540 if vertical else 960)
    notes = [_notes(c, t, k + 1) for k, t in enumerate(times)]
    v = edit.get("version", 1)
    sb.mkdir(exist_ok=True)
    music = (edit.get("sound", {}).get("music") or {}).get("file")
    cuts = [s for s in edit["segments"] if not s.get("keep", True)]
    raw = (c.an.get("probe") or {}).get("duration") or 0
    sub = (f"{edit['format']['width']}x{edit['format']['height']} · {edit.get('brief', {}).get('platform', '')} · "
           f"{fmt_time(raw)} raw -> {fmt_time(c.total)} edit · {len(cuts)} cuts · style {edit.get('style_name')} · "
           f"captions {c.style['captions']['font']} · music {Path(music).name if music else 'none'}")
    pages = []
    n_pages = math.ceil(len(times) / per_page)
    for pg in range(n_pages):
        chunk = list(range(pg * per_page, min(len(times), (pg + 1) * per_page)))
        pnl = [(files[k], f"#{k + 1}  {fmt_time(times[k])}", notes[k]["lines"]) for k in chunk]
        out = sb / f"v{v}_p{pg + 1}.png"
        title = f"Storyboard · {project.name} · v{v}" + (f" · page {pg + 1}/{n_pages}" if n_pages > 1 else "")
        grid_sheet(title, sub, pnl, out,
                   note="Change anything by panel number (\"#3: bigger text\"), or approve to render.")
        pages.append(out)
    save_json(sb / f"v{v}.json", {"version": v, "total": round(c.total, 2), "panels": notes,
                                  "pages": [p.name for p in pages]})
    for p in pages:
        log(f"storyboard page: {p}")
    return pages
