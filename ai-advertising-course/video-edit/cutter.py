#!/usr/bin/env python3
"""Cut lessons from the raw recordings: dead-air compression, filler/stutter removal,
manual cuts, click-free audio, white captions, 1080p30 H.264 export.

  python3 cutter.py plan            # build EDLs + captions + report for all lessons (no render)
  python3 cutter.py render 2.3 4.1  # render the listed lessons (or 'all')
"""
import json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np
from lessons import LESSONS, PROTECT, GLOSSARY, NO_CAPTION, VO_SEQS, VO_RANGE, SIDE_CAPTION

HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"; WORK = HERE / "work"; OUT = HERE / "out"
WORK.mkdir(exist_ok=True); OUT.mkdir(exist_ok=True)
FPS = 30; SR = 48000
GAP_MIN = 0.8          # gaps longer than this get compressed...
KEEP_BEFORE = 0.28     # ...keeping this much after the previous word
KEEP_AFTER = 0.22      # ...and this much before the next word
FILLERS = {"uh", "um", "uhm", "erm", "hmm"}

_audio = {}
_words = {}


def audio(src):
    if src not in _audio:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(RAW / f"{src}.mov"), "-vn", "-ac", "1",
                              "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        _audio[src] = np.frombuffer(raw, dtype=np.float32)
    return _audio[src]


def words(src):
    if src not in _words:
        d = json.load(open(HERE / "audio" / f"{src}.json"))
        _words[src] = [w for w in d["words"] if w["type"] in ("word", "audio_event")]
    return _words[src]


def in_protect(src, a, b):
    return any(a < pe and b > ps for ps, pe in PROTECT.get(src, []))


def loud_fraction(src, a, b):
    x = audio(src)[int(a * SR):int(b * SR)]
    if len(x) < SR // 20:
        return 0.0
    n = len(x) // (SR // 20)
    fr = x[:n * (SR // 20)].reshape(n, -1)
    rms = 20 * np.log10(np.sqrt((fr ** 2).mean(axis=1)) + 1e-9)
    return float((rms > -33).mean())


def norm(t):
    return re.sub(r"[^\w']", "", t.lower())


def auto_cuts(src, a, b):
    """Dead air, fillers, stutters inside [a,b]. Returns list of (start,end,reason)."""
    ws = [w for w in words(src) if a <= w["start"] < b]
    cuts = []
    items = [w for w in ws if w["type"] == "word"]
    # fillers and hyphen fragments
    for i, w in enumerate(items):
        t = norm(w["text"])
        nxt = items[i + 1]["start"] if i + 1 < len(items) else w["end"] + 0.3
        prv = items[i - 1]["end"] if i > 0 else w["start"] - 0.3
        if in_protect(src, w["start"], w["end"]):
            continue
        frag = re.fullmatch(r"[A-Za-z]{1,4}-{1,2}", w["text"].strip(",.")) is not None
        if t in FILLERS or frag:
            cuts.append((max(prv + 0.04, w["start"] - 0.03), max(w["end"] + 0.02, nxt - 0.05), f"filler '{w['text']}'"))
    # adjacent repeats (stutters / restarts), longest first
    toks = [norm(w["text"]) for w in items]
    i = 0
    while i < len(items):
        hit = False
        for n in (6, 5, 4, 3, 2, 1):
            if i + 2 * n <= len(items) and toks[i:i + n] == toks[i + n:i + 2 * n] and all(toks[i:i + n]):
                s, e = items[i]["start"], items[i + n]["start"]
                if e - s < 6 and not in_protect(src, s, e):
                    cuts.append((s - 0.02, e - 0.04, "repeat '" + " ".join(w["text"] for w in items[i:i + n]) + "'"))
                    i += n; hit = True; break
        if not hit:
            i += 1
    # dead air between any audible items (words + audio events)
    pts = [(w["start"], w["end"]) for w in ws]
    edges = [(a, a)] + pts + [(b, b)]
    for (s0, e0), (s1, e1) in zip(edges, edges[1:]):
        g0, g1 = e0, s1
        if g1 - g0 > GAP_MIN and not in_protect(src, g0, g1):
            if loud_fraction(src, g0, g1) < 0.5:
                cuts.append((g0 + KEEP_BEFORE, g1 - KEEP_AFTER, f"dead air {g1 - g0:.1f}s"))
    return cuts


def subtract(a, b, cuts):
    cuts = sorted((max(a, s), min(b, e)) for s, e in cuts if e > a and s < b and e - s > 0.02)
    keep, cur = [], a
    for s, e in cuts:
        if s > cur:
            keep.append((cur, s))
        cur = max(cur, e)
    if cur < b:
        keep.append((cur, b))
    return keep


def grid(t):
    return round(t * FPS) / FPS


def plan(L):
    blocks = []
    log = []
    for src, a, b in L["blocks"]:
        a, b = grid(a), grid(b)
        man = [(s, e, r) for (cs, s, e, r) in L["cuts"] if cs == src and s < b and e > a]
        auto = auto_cuts(src, a, b)
        keep = subtract(a, b, [(s, e) for s, e, _ in man + auto])
        keep = [(grid(s), grid(e)) for s, e in keep]
        keep = [(s, e) for s, e in keep if e - s >= 0.1]
        merged = []
        for s, e in keep:
            if merged and s <= merged[-1][1]:
                merged[-1] = (merged[-1][0], max(e, merged[-1][1]))
            else:
                merged.append((s, e))
        blocks.append(dict(src=src, a=a, b=b, keep=merged))
        log += [dict(src=src, s=round(s, 2), e=round(e, 2), why=r) for s, e, r in man]
        log += [dict(src=src, s=round(s, 2), e=round(e, 2), why=r) for s, e, r in auto if not r.startswith("dead air")]
        dead = sum(e - s for s, e, r in auto if r.startswith("dead air") and e > s)
        log.append(dict(src=src, why=f"dead air removed: {dead:.0f}s in {sum(1 for *_, r in auto if r.startswith('dead air'))} gaps"))
    return blocks, log


def clean_caption(text):
    t = text
    for pat, rep in GLOSSARY:
        t = re.sub(pat, rep, t)
    def dehyph(m):
        a, b = m.group(1), m.group(2)
        return b if b.lower().startswith(a.lower()) else m.group(0)
    for _ in range(4):
        t = re.sub(r"\b(\w{1,6})-(\w+)", dehyph, t)
    t = re.sub(r"\b(?!e-com|x-ray)([A-Za-z])-(\w{2,})", r"\2", t)
    t = t.replace("--", "").replace("...", "…")
    t = re.sub(r"(^|\s)-\w+", r"\1", t)          # trailing halves of cut words ("-rup")
    t = re.sub(r"(\w)-(?=\s|$)", r"\1", t)        # dangling hyphens ("effect-")
    t = re.sub(r"(^|\s)…(?=\s|$)", r"\1", t)      # stray ellipses
    t = re.sub(r"\s{2,}", " ", t).strip()
    return t


def vo_marked(src):
    """Indices (into word-type list) of words that belong to the ad's own voiceover."""
    if src not in VO_RANGE:
        return set()
    lo, hi = VO_RANGE[src]
    ws = [w for w in words(src) if w["type"] == "word"]
    seqs = [q.split() for q in VO_SEQS]
    toks = [norm(w["text"]).replace("'", "") for w in ws]
    seqs = [[t.replace("'", "") for t in q] for q in seqs]
    def is_sub(run):
        n = len(run)
        return any(q[k:k + n] == run for q in seqs for k in range(len(q) - n + 1))
    marked, i = set(), 0
    while i < len(ws):
        if not (lo <= ws[i]["start"] <= hi):
            i += 1; continue
        j = i
        while j < len(ws) and lo <= ws[j]["start"] <= hi and is_sub(toks[i:j + 1]):
            j += 1
        run = j - i
        if run >= 2 or (run == 1 and toks[i] in ("luna", "lighter")):
            marked.update(range(i, j)); i = j
        else:
            i += 1
    return marked


def build_captions(blocks):
    cap_words = []
    off = 0.0
    for blk in blocks:
        ws = [w for w in words(blk["src"]) if w["type"] == "word"]
        vo = vo_marked(blk["src"])
        nocap = NO_CAPTION.get(blk["src"], [])
        side = SIDE_CAPTION.get(blk["src"], [])
        for s, e in blk["keep"]:
            for wi, w in enumerate(ws):
                mid = (w["start"] + w["end"]) / 2
                if s <= mid < e:
                    t = norm(w["text"])
                    if t in FILLERS or re.fullmatch(r"[A-Za-z]{1,4}-{1,2}", w["text"].strip(",.")):
                        continue
                    if wi in vo or any(a <= mid < b for a, b in nocap):
                        continue
                    sty = "Side" if any(a <= mid < b for a, b in side) else "Cap"
                    cap_words.append((off + max(w["start"], s) - s, off + min(w["end"], e) - s, w["text"], sty))
            off += e - s
    cues, cur = [], []
    def flush():
        if cur:
            text = clean_caption(" ".join(x[2] for x in cur)).strip()
            if text:
                sty = cur[0][3]
                if not cues or cues[-1][2].rstrip().endswith((".", "?", "!", "…")):
                    text = text[0].upper() + text[1:]
                cues.append([cur[0][0], cur[-1][1], text, sty])
        cur.clear()
    for i, w in enumerate(cap_words):
        if cur:
            length = len(" ".join(x[2] for x in cur + [w]))
            gap = w[0] - cur[-1][1]
            if w[3] != cur[-1][3] or length > (60 if w[3] == "Side" else 80) or gap > 0.7 or (w[1] - cur[0][0]) > 5.5 or \
               (cur[-1][2].endswith((".", "?", "!")) and len(" ".join(x[2] for x in cur)) > 20):
                flush()
        cur.append(w)
    flush()
    for i, c in enumerate(cues):
        c[1] = c[1] + 0.25
        if i + 1 < len(cues):
            c[1] = min(c[1], cues[i + 1][0] - 0.02)
        if c[1] - c[0] < 0.7:
            c[1] = min(c[0] + 0.7, cues[i + 1][0] - 0.02) if i + 1 < len(cues) else c[0] + 0.7
    return cues, off


def wrap(text, width=44):
    if len(text) <= width:
        return text
    if width < 30:  # narrow side captions: greedy wrap into short lines
        out, line = [], ""
        for wd in text.split():
            if line and len(line) + 1 + len(wd) > width:
                out.append(line); line = wd
            else:
                line = (line + " " + wd).strip()
        out.append(line)
        return r"\N".join(out)
    words_ = text.split()
    best, best_d = None, 1e9
    for k in range(1, len(words_)):
        l1, l2 = " ".join(words_[:k]), " ".join(words_[k:])
        d = max(len(l1), len(l2))
        if d < best_d:
            best, best_d = l1 + r"\N" + l2, d
    return best


def ass_time(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def write_ass(cues, path):
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter SemiBold,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2.6,1,2,160,160,58,1
Style: Side,Inter SemiBold,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2.6,1,1,80,1300,140,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [f"Dialogue: 0,{ass_time(s)},{ass_time(e)},{st},,0,0,0,,{wrap(t, 22 if st == 'Side' else 44)}" for s, e, t, st in cues]
    path.write_text(head + "\n".join(lines) + "\n", encoding="utf-8")


def write_srt(cues, path):
    def st(t):
        ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    path.write_text("\n".join(f"{i}\n{st(s)} --> {st(e)}\n{t}\n" for i, (s, e, t, *_r) in enumerate(cues, 1)), encoding="utf-8")


def build_audio(blocks, path):
    fade = int(0.006 * SR)
    parts = []
    for blk in blocks:
        x = audio(blk["src"])
        for s, e in blk["keep"]:
            seg = x[int(round(s * SR)):int(round(e * SR))].copy()
            if len(seg) > 2 * fade:
                seg[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
                seg[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
            parts.append(seg)
    y = np.concatenate(parts)
    pcm = (np.clip(y, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    return len(y) / SR


def fname(L):
    title = re.sub(r"[^\w]+", "-", L["title"].lower()).strip("-")
    return f"{L['id']} {L['title']}".replace(":", " -").replace("/", "-").replace("+", "and") + ".mp4"


def render(L):
    blocks, _ = plan(L)
    tag = L["id"]
    cues, total = build_captions(blocks)
    ass = WORK / f"{tag}.ass"; write_ass(cues, ass); write_srt(cues, OUT / fname(L).replace(".mp4", ".srt"))
    wav = WORK / f"{tag}.wav"; build_audio(blocks, wav)
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    args = ["ffmpeg", "-y", "-v", "error", "-stats"]
    fc = []
    for i, blk in enumerate(blocks):
        args += ["-ss", f"{blk['a']:.3f}", "-t", f"{blk['b'] - blk['a'] + 0.2:.3f}", "-i", str(RAW / f"{blk['src']}.mov")]
        expr = "+".join(f"gte(t,{s - blk['a'] - 0.004:.3f})*lt(t,{e - blk['a'] - 0.004:.3f})" for s, e in blk["keep"])
        (WORK / f"{tag}_sel{i}.txt").write_text(expr)
        fc.append(f"[{i}:v]fps={FPS},select='{expr}',setpts=N/({FPS}*TB)[v{i}]")
    n = len(blocks)
    args += ["-i", str(wav)]
    fc.append("".join(f"[v{i}]" for i in range(n)) + (f"concat=n={n}:v=1:a=0[vc]" if n > 1 else "null[vc]"))
    fc.append(f"[vc]subtitles={ass}:fontsdir=/usr/share/fonts/opentype/inter,format=yuv420p[vout]")
    fc.append(f"[{n}:a]{ln},aresample={SR},pan=stereo|c0=c0|c1=c0[aout]")
    fcs = WORK / f"{tag}_fc.txt"; fcs.write_text(";\n".join(fc))
    out = OUT / fname(L)
    args += ["-filter_complex_script", str(fcs), "-map", "[vout]", "-map", "[aout]",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-r", str(FPS),
             "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", str(out)]
    subprocess.run(args, check=True)
    return out, total


def main():
    cmd = sys.argv[1]
    sel = sys.argv[2:]
    todo = LESSONS if not sel or sel == ["all"] else [L for L in LESSONS if L["id"] in sel]
    if cmd == "plan":
        rep = []
        for L in todo:
            blocks, log = plan(L)
            raw = sum(b["b"] - b["a"] for b in blocks)
            kept = sum(e - s for b in blocks for s, e in b["keep"])
            cues, _ = build_captions(blocks)
            write_srt(cues, WORK / f"{L['id']}.srt")
            rep.append(dict(id=L["id"], title=L["title"], raw=round(raw), kept=round(kept), cuts=len(log), log=log))
            print(f"{L['id']:>4}  {raw/60:5.1f} min raw -> {kept/60:5.1f} min   {L['title']}")
        json.dump(rep, open(WORK / "plan.json", "w"), indent=1)
    elif cmd == "render":
        for L in todo:
            out, total = render(L)
            print("done", out.name, f"{total/60:.1f} min")


if __name__ == "__main__":
    main()
