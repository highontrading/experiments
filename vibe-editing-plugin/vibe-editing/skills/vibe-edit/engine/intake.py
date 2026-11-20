"""Take the files the user gives (anywhere on disk) and set up the project folders.

  ve.py intake --video <file> [--video <file2>] [--ref <file or folder> ...] [--name my-reel]
  ve.py intake --project my-reel --ref <file>        (add a reference later)

Files outside the workspace are COPIED (the originals stay where they are). Files the user
dropped loose in the workspace folder are MOVED into the project so the workspace stays tidy.
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from common import IMAGE_EXT, VIDEO_EXT, die, log, probe, rel

SUBDIRS = ("raw", "refs", "broll", "music", "sfx", "out")


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:40] or "my-edit"


def _place(src: Path, dest_dir: Path, ws: Path):
    src = src.resolve()
    dest = dest_dir / src.name
    if src.parent == dest_dir.resolve():
        return dest, "already there"
    n = 2
    while dest.exists():
        dest = dest_dir / f"{src.stem}-{n}{src.suffix}"
        n += 1
    loose_in_workspace = src.parent == ws
    if loose_in_workspace:
        shutil.move(str(src), str(dest))
        return dest, "moved"
    shutil.copy2(src, dest)
    return dest, "copied"


def _orientation(path: Path):
    try:
        if path.suffix.lower() in IMAGE_EXT | VIDEO_EXT:
            info = probe(path)
            if info.get("width") and info.get("height"):
                r = info["width"] / info["height"]
                return "vertical" if r < 0.9 else "square" if r < 1.1 else "horizontal"
    except SystemExit:
        pass
    return None


def intake(workspace: Path, videos=(), refs=(), name=None, project=None):
    ws = Path(workspace).resolve()
    videos = [Path(v) for v in videos or []]
    refs = [Path(r) for r in refs or []]
    for f in videos + refs:
        if not f.exists():
            die(f"file not found: {f}")
    for v in videos:
        if v.suffix.lower() not in VIDEO_EXT:
            die(f"not a video file: {v}")
    if project:
        pj = Path(project)
        pj = pj if pj.is_absolute() else ws / pj
    else:
        if not videos:
            die("give the video to edit (--video) or an existing project (--project)")
        base = slug(name or videos[0].stem)
        pj, n = ws / base, 2
        while (pj / "edit.json").exists() or (pj / "raw").exists() and any((pj / "raw").iterdir()):
            pj = ws / f"{base}-{n}"
            n += 1
    for d in SUBDIRS:
        (pj / d).mkdir(parents=True, exist_ok=True)
    (ws / "styles").mkdir(exist_ok=True)

    placed = {"raw": [], "refs": []}
    for v in videos:
        dest, how = _place(v, pj / "raw", ws)
        placed["raw"].append({"file": rel(dest, ws), "how": how})
    for r in refs:
        if r.is_dir():
            for f in sorted(r.iterdir()):
                if f.suffix.lower() in VIDEO_EXT | IMAGE_EXT:
                    dest, how = _place(f, pj / "refs", ws)
                    placed["refs"].append({"file": rel(dest, ws), "how": how})
        else:
            dest, how = _place(r, pj / "refs", ws)
            placed["refs"].append({"file": rel(dest, ws), "how": how})

    raw_files = sorted(p for p in (pj / "raw").iterdir() if p.suffix.lower() in VIDEO_EXT)
    ref_files = sorted(p for p in (pj / "refs").iterdir() if p.suffix.lower() in VIDEO_EXT | IMAGE_EXT)
    src_or = _orientation(raw_files[0]) if raw_files else None
    ref_or = next((o for o in (_orientation(r) for r in ref_files) if o), None)
    target = ref_or or src_or or "vertical"
    suggest = {"vertical": "reels", "square": "square", "horizontal": "youtube"}[target]
    out = {"project": rel(pj, ws), "placed": placed,
           "raw_clips": [rel(p, ws) for p in raw_files], "references": [rel(p, ws) for p in ref_files],
           "footage_orientation": src_or, "reference_orientation": ref_or, "suggested_platform": suggest}
    if len(raw_files) > 1:
        out["note"] = "several clips in raw/ will be joined in name order into one edit"
    log(f"project ready: {pj}")
    print(json.dumps(out, indent=2))
    return out
