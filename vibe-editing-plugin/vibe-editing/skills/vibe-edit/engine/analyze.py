"""Stage 2: analyze the raw footage.

Writes <project>/analysis.json with:
  transcript words (word-level timestamps), silences, phrase units, retake and filler
  candidates, colour stats of the source, and a contact sheet for Claude to look at.
"""
from __future__ import annotations

import difflib
import re
from pathlib import Path

from common import (VIDEO_EXT, die, extract_frames_rgb, log, probe, rel, run, save_json, load_json, tile_frames)

FILLERS = {"um", "umm", "uh", "uhh", "uhm", "erm", "er", "ah", "ahh", "hmm", "hm", "mm", "mmm"}
FILLER_PROMPT = "Umm, so, uh, let me think, like, hmm... Okay, here's what I'm, like, thinking."
SENT_END = re.compile(r"[.?!।]$")


def norm_word(w: str) -> str:
    return re.sub(r"[^\w']+", "", w.lower())


# ---------------------------------------------------------------- source
def collect_source(project: Path) -> Path:
    """One raw clip -> use it. Several -> join them in name order into build/source.mp4."""
    raw = project / "raw"
    clips = sorted([p for p in raw.glob("*") if p.suffix.lower() in VIDEO_EXT]) if raw.exists() else []
    if not clips:
        die(f"No video found in {raw}. Put your footage in the raw/ folder.")
    if len(clips) == 1:
        return clips[0]
    out = project / "build" / "source.mp4"
    if out.exists() and out.stat().st_mtime > max(c.stat().st_mtime for c in clips):
        return out
    log(f"joining {len(clips)} clips in name order -> build/source.mp4")
    info = probe(clips[0])
    w, h = info.get("width", 1920) // 2 * 2, info.get("height", 1080) // 2 * 2
    fps = info.get("fps", 30)
    args, parts = [], []
    for i, c in enumerate(clips):
        args += ["-i", str(c)]
        ci = probe(c)
        a = f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo[a{i}]" if ci["has_audio"] else \
            f"anullsrc=r=48000:cl=stereo,atrim=duration={ci['duration']:.3f}[a{i}]"
        parts.append(f"[{i}:v]scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,"
                     f"setsar=1,fps={fps}[v{i}];{a}")
    fc = ";".join(parts) + ";" + "".join(f"[v{i}][a{i}]" for i in range(len(clips))) + \
        f"concat=n={len(clips)}:v=1:a=1[v][a]"
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-v", "error", *args, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-c:a", "aac", "-b:a", "256k", str(out)])
    return out


# ---------------------------------------------------------------- transcript
def transcribe(audio: Path, model_size: str, language: str | None):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        die("faster-whisper is not installed. Run:  python ve.py setup")
    import wave
    import numpy as np
    log(f"transcribing with Whisper '{model_size}' (first run downloads the model)...")
    # decode ourselves (16 kHz mono wav made by ffmpeg) so faster-whisper never needs PyAV
    with wave.open(str(audio), "rb") as wf:
        samples = np.frombuffer(wf.readframes(wf.getnframes()), dtype="<i2").astype(np.float32) / 32768.0
    model = WhisperModel(model_size, device="auto", compute_type="int8")
    segments, info = model.transcribe(
        samples, word_timestamps=True, language=language or None, vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 400}, condition_on_previous_text=False,
        initial_prompt=FILLER_PROMPT if (language in (None, "en")) else None, beam_size=5)
    words = []
    for seg in segments:
        for w in seg.words or []:
            txt = w.word.strip()
            if not txt:
                continue
            words.append({"w": txt, "s": round(w.start, 3), "e": round(w.end, 3),
                          "p": round(getattr(w, "probability", 1.0), 3)})
    log(f"language: {info.language} ({info.language_probability:.2f}), {len(words)} words")
    return {"language": info.language, "words": words}


def import_transcript(path: Path):
    data = load_json(path)
    words = data["words"] if isinstance(data, dict) else data
    out = []
    for w in words:
        out.append({"w": w.get("w") or w.get("word") or w.get("text"),
                    "s": float(w.get("s", w.get("start"))), "e": float(w.get("e", w.get("end"))),
                    "p": float(w.get("p", 1.0))})
    return {"language": (data.get("language") if isinstance(data, dict) else None) or "en", "words": out}


# ---------------------------------------------------------------- audio
def detect_silences(audio: Path, noise_db=-35, min_d=0.35):
    r = run(["ffmpeg", "-v", "info", "-i", str(audio), "-af", f"silencedetect=noise={noise_db}dB:d={min_d}",
             "-f", "null", "-"], check=False)
    out, start = [], None
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", line)
        if m:
            start = float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", line)
        if m and start is not None:
            out.append([round(start, 3), round(float(m.group(1)), 3)])
            start = None
    return out


def loudness(path: Path):
    r = run(["ffmpeg", "-v", "info", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], check=False)
    lufs = peak = None
    for line in r.stderr.splitlines()[-30:]:
        m = re.search(r"I:\s+(-?[\d.]+) LUFS", line)
        if m:
            lufs = float(m.group(1))
        m = re.search(r"Peak:\s+(-?[\d.]+) dBFS", line)
        if m:
            peak = float(m.group(1))
    return {"lufs": lufs, "true_peak": peak}


# ---------------------------------------------------------------- units, retakes, fillers
def build_units(words, split_gap=0.30):
    """Group words into phrase units: split on pauses and sentence ends."""
    units, cur = [], []
    for i, w in enumerate(words):
        if cur:
            gap = w["s"] - cur[-1]["e"]
            if gap > split_gap or SENT_END.search(cur[-1]["w"]):
                units.append(cur)
                cur = []
        cur.append(dict(w, i=i))
    if cur:
        units.append(cur)
    out = []
    for k, u in enumerate(units):
        txt = " ".join(x["w"] for x in u)
        filler = all(norm_word(x["w"]) in FILLERS for x in u)
        out.append({"id": f"u{k + 1}", "start": u[0]["s"], "end": u[-1]["e"], "w0": u[0]["i"], "w1": u[-1]["i"],
                    "text": txt, "filler": filler})
    return out


def find_retakes(units, words, window=4):
    """Mark phrases that are said again shortly after (false starts and repeated takes).
    Keeps the LATER take, which is usually the good one."""
    toks = [[norm_word(words[i]["w"]) for i in range(u["w0"], u["w1"] + 1)] for u in units]
    toks = [[t for t in ts if t and t not in FILLERS] for ts in toks]
    marks = {}
    for i, a in enumerate(toks):
        if len(a) < 2:
            continue
        for j in range(i + 1, min(len(units), i + 1 + window)):
            b = toks[j]
            if len(b) < 2:
                continue
            k = min(len(a), len(b), 4)
            prefix = a[:k] == b[:k] and k >= 2
            ratio = difflib.SequenceMatcher(None, a, b).ratio()
            contained = len(a) >= 3 and " ".join(a) in " ".join(b)
            if prefix or contained or (ratio >= 0.72 and len(a) >= 3):
                why = "false start" if (prefix or contained) and len(a) < len(b) else "repeated take"
                marks[i] = {"unit": units[i]["id"], "again_at": units[j]["start"], "kept": units[j]["id"],
                            "similarity": round(ratio, 2), "kind": why}
                # short phrases between the bad take and the retake are usually part of the mistake
                for m in range(i + 1, j):
                    if units[m]["end"] - units[m]["start"] < 2.5 and m not in marks:
                        marks[m] = {"unit": units[m]["id"], "again_at": units[j]["start"], "kept": units[j]["id"],
                                    "similarity": 0, "kind": "between takes"}
                break
    return [marks[k] for k in sorted(marks)]


def color_stats(frames):
    """Lab mean/std, saturation, contrast, warmth, palette, grain and vignette estimates."""
    import numpy as np
    from lut import rgb_to_lab
    if not frames:
        return None
    px = np.concatenate([f.reshape(-1, 3) for f in frames]).astype(np.float64) / 255.0
    lab = rgb_to_lab(px)
    mx, mn = px.max(1), px.min(1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    luma = px @ np.array([0.2126, 0.7152, 0.0722])
    # palette: k-means on a sample
    rng = np.random.default_rng(1)
    sample = px[rng.choice(len(px), size=min(6000, len(px)), replace=False)]
    k = 6
    cent = sample[rng.choice(len(sample), k, replace=False)]
    for _ in range(12):
        d = ((sample[:, None, :] - cent[None]) ** 2).sum(-1)
        lab_ = d.argmin(1)
        for c in range(k):
            pts = sample[lab_ == c]
            if len(pts):
                cent[c] = pts.mean(0)
    counts = np.bincount(lab_, minlength=k)
    order = counts.argsort()[::-1]
    palette = ["#%02x%02x%02x" % tuple(int(v * 255) for v in cent[c]) for c in order]
    # grain: high-frequency residual; vignette: corner vs centre brightness
    grains, vigs = [], []
    for f in frames:
        g = f.astype(np.float64).mean(2)
        blur = (g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:] + g[1:-1, 1:-1]) / 5
        grains.append(float(np.median(np.abs(g[1:-1, 1:-1] - blur))))
        h, w = g.shape
        cy, cx = h // 4, w // 4
        centre = g[cy:h - cy, cx:w - cx].mean()
        corners = np.mean([g[:cy, :cx].mean(), g[:cy, -cx:].mean(), g[-cy:, :cx].mean(), g[-cy:, -cx:].mean()])
        vigs.append(float(1 - corners / max(centre, 1)))
    return {
        "lab_mean": [round(float(v), 3) for v in lab.mean(0)],
        "lab_std": [round(float(v), 3) for v in lab.std(0)],
        "brightness": round(float(luma.mean()), 3),
        "contrast": round(float(luma.std()), 3),
        "saturation": round(float(sat.mean()), 3),
        "warmth": round(float(lab[:, 2].mean() + 0.3 * lab[:, 1].mean()), 2),
        "palette": palette,
        "grain": round(float(np.median(grains)), 2),
        "vignette": round(float(np.median(vigs)), 3),
    }


# ---------------------------------------------------------------- main
def analyze(project: Path, model="small", language=None, transcript=None, force=False):
    project = Path(project).resolve()
    out_path = project / "analysis.json"
    src = collect_source(project)
    info = probe(src)
    if not info["has_video"]:
        die(f"{src.name} has no video stream")
    adir = project / "build" / "analysis"
    adir.mkdir(parents=True, exist_ok=True)

    prev = load_json(out_path)
    if prev and not force and not transcript and prev.get("source") == rel(src, project) \
            and prev.get("source_mtime") == round(src.stat().st_mtime) and prev.get("model") == model:
        log("analysis.json is up to date (use --force to redo)")
        return prev

    audio = adir / "audio16k.wav"
    if info["has_audio"]:
        run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(audio)])
        tr = import_transcript(Path(transcript)) if transcript else transcribe(audio, model, language)
        silences = detect_silences(audio)
        loud = loudness(src)
    else:
        log("no audio track: skipping transcript")
        tr, silences, loud = {"language": None, "words": []}, [], {}

    words = tr["words"]
    units = build_units(words)
    retakes = find_retakes(units, words)
    fillers = [u["id"] for u in units if u["filler"]]
    filler_words = [i for i, w in enumerate(words) if norm_word(w["w"]) in FILLERS]

    dur = info["duration"]
    n = 12 if dur > 20 else 8
    times = [dur * (i + 0.5) / n for i in range(n)]
    contact = tile_frames(src, times, adir / "contact.jpg", cols=4, width=320)
    colors = color_stats(extract_frames_rgb(src, times[::2], 128))

    speech = sum(u["end"] - u["start"] for u in units)
    gaps = [b["start"] - a["end"] for a, b in zip(units, units[1:])]
    stats = {
        "duration": round(dur, 2),
        "words": len(words),
        "speech_seconds": round(speech, 2),
        "wpm": round(len(words) / max(speech, 1) * 60, 1),
        "head_silence": round(units[0]["start"], 2) if units else 0,
        "tail_silence": round(dur - units[-1]["end"], 2) if units else 0,
        "pauses_over_0_5s": sum(1 for g in gaps if g > 0.5),
        "pause_seconds_over_0_5s": round(sum(g for g in gaps if g > 0.5), 2),
        "retake_candidates": len(retakes),
        "filler_words": len(filler_words),
    }
    analysis = {
        "source": rel(src, project), "source_mtime": round(src.stat().st_mtime), "model": model,
        "probe": info, "language": tr["language"], "words": words, "units": units,
        "silences": silences, "retakes": retakes, "filler_units": fillers, "filler_words": filler_words,
        "loudness": loud, "color": colors, "contact_sheet": rel(contact, project) if contact else None,
        "stats": stats,
    }
    save_json(out_path, analysis)
    log(f"analysis.json written: {stats['duration']}s, {stats['words']} words, "
        f"{stats['pauses_over_0_5s']} long pauses, {len(retakes)} retake candidates, {len(filler_words)} fillers")
    return analysis
