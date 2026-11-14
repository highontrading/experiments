#!/usr/bin/env python3
"""Make captions (SRT + styled ASS with word-by-word highlight) for a video.

From word timings (best: from Whisper, faster-whisper, ElevenLabs speech-to-text, etc.):
  python3 captions.py --words words.json --ratio 9:16 --out captions
From a script you paste (timings are estimated evenly, then you check them):
  python3 captions.py --script script.txt --start 0.3 --end 14.5 --ratio 9:16 --out captions
Writes captions.srt (for upload / CapCut) and captions.ass (styled, for burning in):
  ffmpeg -i in.mp4 -vf "ass=captions.ass:fontsdir=fonts" -c:a copy out.mp4

words.json can be any of: a list of {"word"|"text", "start", "end"}; Whisper JSON
({"segments":[{"words":[...]}]}); ElevenLabs JSON ({"words":[{"text","start","end","type"}]}).
Works with Hindi/Hinglish: pass a font that has Devanagari, e.g. --font "Noto Sans Devanagari".
"""
import argparse, json, re

SIZES = {"9:16": (1080, 1920), "4:5": (1080, 1350), "1:1": (1080, 1080), "16:9": (1920, 1080)}

def load_words(path):
    d = json.load(open(path, encoding="utf-8"))
    if isinstance(d, dict) and "segments" in d:
        d = [w for s in d["segments"] for w in s.get("words", [])]
    elif isinstance(d, dict) and "words" in d:
        d = d["words"]
    out = []
    for w in d:
        if w.get("type") and w["type"] != "word":
            continue
        text = (w.get("word") or w.get("text") or "").strip()
        if text:
            out.append((text, float(w["start"]), float(w["end"])))
    return out

def estimate(script, start, end):
    words = script.split()
    # longer words get a bit more time; pauses after . , ? !
    weights = [len(w) + 3 + (4 if re.search(r"[.,?!।]$", w) else 0) for w in words]
    total, t, out = sum(weights), start, []
    for w, k in zip(words, weights):
        d = (end - start) * k / total
        out.append((w, t, t + d)); t += d
    return out

def chunks(words, n, max_gap=0.6):
    cur = []
    for w in words:
        if cur and (len(cur) >= n or w[1] - cur[-1][2] > max_gap or re.search(r"[.?!।]$", cur[-1][0])):
            yield cur; cur = []
        cur.append(w)
    if cur:
        yield cur

def ts_srt(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"

def ts_ass(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def ass_color(hexstr):
    h = hexstr.lstrip("#")
    return f"&H00{h[4:6]}{h[2:4]}{h[0:2]}".upper()

def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--words"); src.add_argument("--script")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float)
    ap.add_argument("--ratio", default="9:16", choices=SIZES)
    ap.add_argument("--per-line", type=int, default=3, help="words on screen at once")
    ap.add_argument("--font", default="Arial Black")
    ap.add_argument("--size", type=int, default=0, help="font size px (0 = auto)")
    ap.add_argument("--color", default="#FFFFFF")
    ap.add_argument("--highlight", default="#E8862A", help="current word colour ('' = no highlight)")
    ap.add_argument("--outline", default="#000000")
    ap.add_argument("--upper", action="store_true", help="ALL CAPS (skip for Hindi)")
    ap.add_argument("--pos", type=float, default=0.30, help="distance of captions from bottom, 0-1 of height")
    ap.add_argument("--out", default="captions")
    a = ap.parse_args()
    if a.words:
        words = load_words(a.words)
    else:
        if a.end is None:
            ap.error("--script needs --end (seconds where the voice stops)")
        words = estimate(open(a.script, encoding="utf-8").read(), a.start, a.end)
    W, H = SIZES[a.ratio]
    size = a.size or int(W * 0.075)
    groups = list(chunks(words, a.per_line))
    with open(a.out + ".srt", "w", encoding="utf-8") as f:
        for i, g in enumerate(groups, 1):
            f.write(f"{i}\n{ts_srt(g[0][1])} --> {ts_srt(g[-1][2])}\n{' '.join(w[0] for w in g)}\n\n")
    up = (lambda s: s.upper()) if a.upper else (lambda s: s)
    hi = ass_color(a.highlight) if a.highlight else None
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Cap,{a.font},{size},{ass_color(a.color)},{ass_color(a.color)},{ass_color(a.outline)},"
        f"&H80000000,-1,0,0,0,100,100,0,0,1,{max(3, size // 12)},2,2,{int(W*0.08)},{int(W*0.08)},{int(H*a.pos)},1",
        "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for g in groups:
        if not hi:
            lines.append(f"Dialogue: 0,{ts_ass(g[0][1])},{ts_ass(g[-1][2])},Cap,,0,0,0,,{up(' '.join(w[0] for w in g))}")
            continue
        for j, (word, s, e) in enumerate(g):
            end = g[j + 1][1] if j + 1 < len(g) else e
            txt = " ".join(
                (f"{{\\c{hi}\\fscx112\\fscy112}}{up(w[0])}{{\\r}}" if k == j else up(w[0]))
                for k, w in enumerate(g))
            lines.append(f"Dialogue: 0,{ts_ass(s)},{ts_ass(end)},Cap,,0,0,0,,{txt}")
    open(a.out + ".ass", "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print(f"Wrote {a.out}.srt and {a.out}.ass ({len(groups)} caption groups, {len(words)} words)")

if __name__ == "__main__":
    main()
