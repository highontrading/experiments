"""Stage 4: build the edit plan, edit.json (the single source of truth for the storyboard and the render).

All times in edit.json are SOURCE times (seconds in the raw video). The renderer maps them
to output time after the cuts, so turning a cut on or off never breaks captions or SFX.
"""
from __future__ import annotations

import re
import shutil
import time
from pathlib import Path

from analyze import FILLERS, SENT_END, norm_word
from common import PRESETS, die, load_json, log, rel, resolve_style, save_json
from style import full_style

PACE = {  # pause longer than `cut` is removed; pads keep breaths natural
    "tight":   {"cut": 0.28, "pre": 0.06, "post": 0.10},
    "natural": {"cut": 0.50, "pre": 0.10, "post": 0.18},
    "relaxed": {"cut": 0.85, "pre": 0.15, "post": 0.30},
}
ALL_ADDONS = ["captions", "hook", "zoom", "sound", "music", "look", "motion"]


def versions_dir(project: Path) -> Path:
    return Path(project) / "versions"


def save_edit(project: Path, edit: dict, note: str = "") -> Path:
    """Write edit.json and keep a numbered copy in versions/."""
    project = Path(project)
    vd = versions_dir(project)
    vd.mkdir(parents=True, exist_ok=True)
    n = len(list(vd.glob("edit.v*.json"))) + 1
    edit["version"] = n
    edit["saved_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    if note:
        edit["version_note"] = note
    save_json(vd / f"edit.v{n:03d}.json", edit)
    save_json(project / "edit.json", edit)
    return project / "edit.json"


def list_versions(project: Path):
    out = []
    for p in sorted(versions_dir(project).glob("edit.v*.json")):
        e = load_json(p) or {}
        out.append({"version": e.get("version"), "saved_at": e.get("saved_at"), "note": e.get("version_note", "")})
    return out


def restore_version(project: Path, n: int):
    p = versions_dir(project) / f"edit.v{int(n):03d}.json"
    if not p.exists():
        die(f"version {n} not found")
    e = load_json(p)
    return save_edit(project, e, f"restored v{n}")


# ---------------------------------------------------------------- segments
def build_segments(an: dict, pace: str, cut_fillers=True, keep_retakes=False):
    words, units = an["words"], an["units"]
    dur = an["probe"]["duration"]
    P = PACE.get(pace, PACE["tight"])
    retake_ids = {r["unit"]: r for r in an.get("retakes", [])}

    # split units at filler words so "um" in the middle of a phrase can be cut cleanly
    pieces = []
    for u in units:
        idx = list(range(u["w0"], u["w1"] + 1))
        cur, cur_f = [], None
        for i in idx:
            f = norm_word(words[i]["w"]) in FILLERS
            if cur and f != cur_f:
                pieces.append((u, cur, cur_f))
                cur = []
            cur.append(i)
            cur_f = f
        if cur:
            pieces.append((u, cur, cur_f))

    segs = []
    for u, idx, is_filler in pieces:
        s, e = words[idx[0]]["s"], words[idx[-1]]["e"]
        text = " ".join(words[i]["w"] for i in idx)
        keep, reason = True, "speech"
        if is_filler:
            keep, reason = (not cut_fillers), "filler word"
        rt = retake_ids.get(u["id"])
        if rt and not is_filler:
            keep = keep_retakes
            reason = f"{rt['kind']}: said again at {rt['again_at']:.1f}s"
        segs.append({"start": s, "end": e, "keep": keep, "reason": reason, "text": text, "kind": "speech",
                     "w0": idx[0], "w1": idx[-1]})

    # fill the gaps between speech pieces
    out, t = [], 0.0
    for k, sg in enumerate(segs):
        gap_start, gap_end = t, sg["start"]
        gap = gap_end - gap_start
        prev = out[-1] if out else None
        if gap > 0.001:
            head = prev is None
            if head or gap > P["cut"]:
                pre = 0.0 if head else min(P["post"], gap / 2)
                post = min(P["pre"], gap / 2) if not head else min(P["pre"], gap)
                if prev and pre > 0:
                    prev["end"] = round(prev["end"] + pre, 3)
                cs, ce = gap_start + pre, gap_end - post
                if ce - cs > 0.02:
                    out.append({"start": round(cs, 3), "end": round(ce, 3), "keep": False, "kind": "gap",
                                "reason": "dead space at start" if head else f"pause {gap:.2f}s", "text": ""})
                sg = dict(sg, start=round(gap_end - post, 3))
            else:  # short natural pause: split it between neighbours
                mid = round(gap_start + gap / 2, 3)
                if prev:
                    prev["end"] = mid
                sg = dict(sg, start=mid)
        out.append(sg)
        t = sg["end"]
    if dur - t > 0.02:
        if out and out[-1]["keep"]:
            out[-1]["end"] = round(min(dur, t + P["post"]), 3)
            t = out[-1]["end"]
        if dur - t > 0.02:
            out.append({"start": round(t, 3), "end": round(dur, 3), "keep": False, "kind": "gap",
                        "reason": "dead space at end", "text": ""})
    for i, s in enumerate(out):
        s["id"] = f"s{i + 1}"
        s["start"], s["end"] = round(s["start"], 3), round(s["end"], 3)
    return out


def assign_zoom(segs, style):
    pac = style["pacing"]
    z = float(pac.get("zoom_scale") or 1.12)
    on = bool(pac.get("punch_in"))
    pattern = pac.get("zoom_pattern", "alternate")
    k = 0
    for s in segs:
        if not s["keep"]:
            continue
        if not on:
            s["zoom"] = 1.0
            continue
        if pattern == "alternate":
            s["zoom"] = 1.0 if k % 2 == 0 else z
        elif pattern == "every3":
            s["zoom"] = z if k % 3 == 2 else 1.0
        else:
            s["zoom"] = 1.0
        k += 1


# ---------------------------------------------------------------- captions
def build_captions(an, segs, style):
    cap = style["captions"]
    wpl = max(1, int(cap.get("words_per_line") or 3))
    max_chars = wpl * 9
    words = an["words"]
    kept = [(s["start"], s["end"]) for s in segs if s["keep"]]

    def is_kept(w):
        m = (w["s"] + w["e"]) / 2
        return any(a <= m < b for a, b in kept)

    lines, cur = [], []

    def flush():
        if cur:
            lines.append(cur.copy())
            cur.clear()

    prev = None
    for w in words:
        if not is_kept(w) or norm_word(w["w"]) in FILLERS:
            if cur and prev and w["s"] - prev["e"] > 0.2:
                flush()
            continue
        if cur:
            chars = sum(len(x["w"]) + 1 for x in cur) + len(w["w"])
            if (len(cur) >= wpl or w["s"] - cur[-1]["e"] > 0.35 or SENT_END.search(cur[-1]["w"])
                    or (cur[-1]["w"].endswith(",") and len(cur) >= max(1, wpl - 1)) or chars > max_chars):
                flush()
        cur.append(w)
        prev = w
    flush()
    out = []
    for i, ln in enumerate(lines):
        ws = []
        for w in ln:
            clean = w["w"].strip()
            emph = bool(re.search(r"\d", clean)) or clean.startswith(("₹", "$"))
            ws.append({"w": clean, "s": w["s"], "e": w["e"], "emph": emph})
        out.append({"id": f"c{i + 1}", "start": ws[0]["s"], "end": ws[-1]["e"],
                    "text": " ".join(x["w"] for x in ws), "words": ws})
    return out


# ---------------------------------------------------------------- main
def default_addons(platform):
    if platform == "lesson":
        return ["captions", "sound", "look", "motion"]
    return ["captions", "hook", "zoom", "sound", "look", "motion"]


def platform_style(style, platform, addons):
    """Adjust a style for the platform and the chosen add-ons (in place)."""
    if platform == "meta-ad":  # Meta Reels/Stories ads: CTA and ad UI cover the bottom 35%, top 14%
        style["captions"]["position_y"] = min(style["captions"]["position_y"], 0.58)
        style["hook"]["position_y"] = max(style["hook"]["position_y"], 0.2)
    if platform == "lesson":
        style["captions"].update(size=min(style["captions"]["size"], 60), position_y=0.86, words_per_line=6,
                                 highlight="none", animation="fade", case="as-is")
    if "zoom" not in addons:
        style["pacing"]["punch_in"] = False
    return style


def regroup_lines(lines, wpl):
    """Re-split caption lines to a new words-per-line, keeping text edits and emphasis."""
    from captions import normalize_line
    words = [w for ln in lines for w in normalize_line(ln)]
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= wpl or w["s"] - cur[-1]["e"] > 0.35 or SENT_END.search(cur[-1]["w"])):
            out.append(cur)
            cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return [{"id": f"c{i + 1}", "start": ws[0]["s"], "end": ws[-1]["e"], "text": " ".join(x["w"] for x in ws),
             "words": ws} for i, ws in enumerate(out)]


def restyle(project: Path, style_name: str):
    """Apply a (new) style to an existing edit.json. Keeps cuts, caption text, hook options, texts,
    B-roll, music and SFX; replaces the look, caption/hook/motion styling and punch-in pattern."""
    project = Path(project).resolve()
    edit = load_json(project / "edit.json")
    if not edit:
        die("edit.json not found: run the plan step first")
    sraw, sdir = resolve_style(style_name, project)
    if not sraw:
        die(f"style '{style_name}' not found in {project.parent / 'styles'}")
    style = full_style(sraw)
    for sec in ("captions", "hook", "motion", "pacing"):
        style[sec].pop("_todo", None)
    platform = edit.get("brief", {}).get("platform", "reels")
    addons = edit.get("brief", {}).get("addons") or default_addons(platform)
    platform_style(style, platform, addons)
    old_wpl = int(edit["style"]["captions"].get("words_per_line", 3))
    edit["style"] = style
    edit["style_name"] = style_name
    edit["style_dir"] = rel(sdir, project)
    edit["look"] = dict(style["look"], enabled=edit.get("look", {}).get("enabled", "look" in addons))
    edit["hook"]["duration"] = style["hook"].get("duration", edit["hook"].get("duration", 2.6))
    assign_zoom(edit["segments"], style)
    new_wpl = int(style["captions"].get("words_per_line", 3))
    if edit.get("captions", {}).get("lines") and new_wpl != old_wpl:
        edit["captions"]["lines"] = regroup_lines(edit["captions"]["lines"], new_wpl)
    snd = edit.get("sound", {})
    if snd.get("music"):
        snd["music"]["level_db"] = style["sound"].get("music_level_db", snd["music"].get("level_db", -21))
    out = save_edit(project, edit, f"restyled with {style_name}")
    log(f"applied style '{style_name}' (cuts, caption text, hook, texts and sound kept)")
    return out


def brief_addons(brief):
    """Add-ons implied by the user's answers in brief.json."""
    a = []
    if brief.get("captions", {}) is not None:  # missing = default captions, null = no captions
        a.append("captions")
    if brief.get("hook", True):
        a.append("hook")
    if brief.get("zoom", brief.get("platform") not in ("lesson",)):
        a.append("zoom")
    sfx = (brief.get("sfx") or {}).get("source", "builtin") if brief.get("sfx") is not None else "none"
    if sfx != "none" or brief.get("music"):
        a.append("sound")
    if brief.get("music"):
        a.append("music")
    a.append("look")
    if (brief.get("motion") or {}).get("types"):
        a.append("motion")
    return a


def plan(project: Path, style_name=None, platform=None, pace=None, addons=None, cut_fillers=True,
         keep_retakes=False, force=False):
    project = Path(project).resolve()
    brief = load_json(project / "brief.json", {}) or {}
    platform = platform or brief.get("platform") or "reels"
    style_name = style_name or brief.get("style")
    pace = pace or brief.get("pace")
    if not addons and brief:
        addons = brief_addons(brief)
    an = load_json(project / "analysis.json")
    if not an:
        die("analysis.json not found. Run:  ve.py analyze <project>")
    if (project / "edit.json").exists() and not force:
        die("edit.json already exists. Use --force to rebuild it (the current one is kept in versions/).")
    sraw, sdir = resolve_style(style_name, project)
    if style_name and style_name not in ("none", "default") and not sraw:
        die(f"style '{style_name}' not found in {project.parent / 'styles'}")
    style = full_style(sraw)
    for sec in ("captions", "hook", "motion", "pacing"):
        style[sec].pop("_todo", None)
    pace = pace or ("natural" if platform == "lesson" else style["pacing"].get("pace")) or "tight"
    addons = addons or default_addons(platform)
    cap_choice = brief.get("captions") or {}
    if cap_choice.get("preset") and cap_choice["preset"] != "R":
        from sheets import CAPTION_PRESETS
        if cap_choice["preset"] in CAPTION_PRESETS:
            style["captions"].update(CAPTION_PRESETS[cap_choice["preset"]][1])
    style["captions"].update(cap_choice.get("overrides") or {})
    platform_style(style, platform, addons)

    segs = build_segments(an, pace, cut_fillers, keep_retakes)
    assign_zoom(segs, style)
    caps = build_captions(an, segs, style) if "captions" in addons else []
    fmt = dict(PRESETS.get(platform, PRESETS["reels"]))
    src = an["probe"]
    src_vertical = src.get("height", 1) > src.get("width", 1)
    tgt_vertical = fmt["height"] > fmt["width"]
    fmt["reframe"] = {"mode": "crop" if src_vertical == tgt_vertical or tgt_vertical else "fit_blur",
                      "x": 0.5, "y": 0.42}

    # placeholder hook: the first complete short sentence in the first 15 s (Claude replaces it)
    first_sentence, cur = "", []
    for w in an["words"]:
        if w["s"] > 15:
            break
        mid = (w["s"] + w["e"]) / 2
        if norm_word(w["w"]) in FILLERS or not any(x["keep"] and x["start"] <= mid < x["end"] for x in segs):
            continue
        cur.append(w["w"])
        if SENT_END.search(w["w"]):
            if 3 <= len(cur) <= 10:
                first_sentence = " ".join(cur).rstrip(".!?")
                break
            cur = []
    sfx = []
    if "sound" in addons and style["sound"].get("sfx", True):
        density = {"low": 4, "medium": 2, "high": 1}.get(style["sound"].get("sfx_density", "medium"), 2)
        zcount = 0
        for a, b in zip([s for s in segs if s["keep"]], [s for s in segs if s["keep"]][1:]):
            if b.get("zoom", 1) != a.get("zoom", 1):
                zcount += 1
                if zcount % density == 0 and style["sound"].get("sfx_on_zoom"):
                    sfx.append({"id": f"x{len(sfx) + 1}", "sound": style["sound"]["sfx_on_zoom"],
                                "t": round(b["start"], 3), "offset": -0.12, "gain_db": style["sound"]["sfx_level_db"] - 4})
    kept_first = next((s["start"] for s in segs if s["keep"]), 0.0)
    edit = {
        "version": 0,
        "approved": False,
        "project": project.name,
        "source": an["source"],
        "style_name": (style_name if sraw else "vibe-default"),
        "style_dir": rel(sdir, project) if sdir else None,
        "brief": {"platform": platform, "pace": pace, "addons": addons, "target_length": None, "notes": ""},
        "format": fmt,
        "segments": segs,
        "captions": {"enabled": "captions" in addons, "lines": caps},
        "hook": {"enabled": "hook" in addons, "options": [first_sentence.upper()] if first_sentence else [],
                 "chosen": 0, "duration": style["hook"].get("duration", 2.6)},
        "texts": [],
        "broll": [],
        "graphics": [],
        "sound": {"enabled": "sound" in addons, "voice_cleanup": style["sound"].get("voice_cleanup", True),
                  "music": {"file": None, "level_db": style["sound"].get("music_level_db", -21),
                            "duck": style["sound"].get("duck", True)} if "music" in addons or "sound" in addons
                  else {"file": None},
                  "sfx": sfx, "hook_sfx": style["sound"].get("sfx_on_hook") if "hook" in addons else None,
                  "loudness_lufs": -14},
        "look": dict(style["look"], enabled="look" in addons),
        "style": style,
        "export": {"preset": platform, "name": None},
        "first_kept": kept_first,
    }
    if platform == "lesson":
        edit["look"]["vignette"] = 0.0
        edit["hook"]["enabled"] = False
    # ---- the user's answers (brief.json)
    if brief:
        edit["brief"].update({k: brief[k] for k in ("edit_type", "target_length", "cta", "notes") if k in brief})
        edit["brief"]["motion"] = brief.get("motion")
        lk = brief.get("look")
        if lk:
            from sheets import LOOK_PRESETS
            if lk == "reference":
                edit["look"].update(lut_from_reference=True)
            elif lk in LOOK_PRESETS:
                edit["look"].update(LOOK_PRESETS[lk])
        m = brief.get("music") or {}
        if m.get("file"):
            edit["sound"]["music"] = {"file": m["file"], "level_db": m.get("level_db", style["sound"].get(
                "music_level_db", -21)), "duck": m.get("duck", True)}
        sfx_src = (brief.get("sfx") or {}).get("source", "builtin") if brief.get("sfx") is not None else "none"
        if sfx_src == "none":
            edit["sound"]["sfx"], edit["sound"]["hook_sfx"] = [], None
        mot = brief.get("motion") or {}
        if brief.get("cta") and "cta" in (mot.get("types") or []):
            last = [sg for sg in segs if sg["keep"]][-1]
            edit["texts"].append({"id": "cta", "type": "cta", "text": brief["cta"].upper(),
                                  "start": round(max(last["start"], last["end"] - 2.5), 3),
                                  "end": round(last["end"], 3), "y": 0.40,  # above the captions, inside safe zones
                                  "enabled": True})
    out = save_edit(project, edit, "first plan")
    cut = sum(s["end"] - s["start"] for s in segs if not s["keep"])
    keep = sum(s["end"] - s["start"] for s in segs if s["keep"])
    log(f"edit.json written: {len(segs)} segments, keeps {keep:.1f}s, cuts {cut:.1f}s, {len(caps)} caption lines")
    return out
