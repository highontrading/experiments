#!/usr/bin/env python3
"""Join the 16 lesson videos into one full lecture with title cards and chapter markers."""
import json, subprocess, textwrap
from pathlib import Path
from lessons import LESSONS
from cutter import fname, OUT

HERE = Path(__file__).resolve().parent
CARDS = HERE / "work" / "cards"; CARDS.mkdir(parents=True, exist_ok=True)
FONT = "/usr/share/fonts/opentype/inter/"
BG = "0x181d26"
MODULES = {
    "1": ("AI in advertising: the new playbook", "0xfcab79"),
    "2": ("Briefs, strategy and the big idea", "0xa8d8c4"),
    "3": ("AI product photography", "0xf4d35e"),
    "4": ("Models, styling and virtual sets", "0xfcab79"),
    "5": ("AI video ads and campaign films", "0xa8d8c4"),
    "6": ("Sound, voice and music", "0xf4d35e"),
    "9": ("Editing, end cards and brand kits", "0xd9a441"),
}
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-r", "30",
       "-profile:v", "high", "-level", "4.0", "-video_track_timescale", "15360",
       "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2"]


def tf(name, text):
    p = CARDS / f"{name}.txt"; p.write_text(text, encoding="utf-8"); return str(p)


def card(name, dur, layers, accent):
    """layers: list of (text, font, size, color, x, y)."""
    vf = [f"drawbox=x=160:y=330:w=8:h=300:color={accent}:t=fill"]
    for i, (text, font, size, color, x, y) in enumerate(layers):
        vf.append(f"drawtext=fontfile={FONT}{font}:textfile={tf(f'{name}_{i}', text)}:fontsize={size}:"
                  f"fontcolor={color}:x={x}:y={y}:line_spacing=14")
    vf.append(f"fade=t=in:st=0:d=0.35,fade=t=out:st={dur - 0.4:.2f}:d=0.4")
    out = CARDS / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error",
                    "-f", "lavfi", "-i", f"color=c={BG}:s=1920x1080:r=30:d={dur}",
                    "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo",
                    "-vf", ",".join(vf), "-t", str(dur), *ENC, "-shortest", str(out)], check=True)
    return out


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)


def main():
    seq, chapters = [], []
    total = len(LESSONS)
    # opening card
    seq.append(("Start", card("open", 5.0, [
        ("AI & ADVERTISING  ·  IDEABRO STUDIO", "Inter-SemiBold.otf", 30, "0xfcab79", 200, 350),
        ("Building an ad from scratch", "InterDisplay-Medium.otf", 92, "white", 200, 410),
        ("The full workflow in one video: 7 modules, 16 lessons.\nStrategist → Image Director → Video Director → Vibe Editor.",
         "Inter-Regular.otf", 36, "0xc8ccd4", 200, 540),
    ], "0xfcab79")))
    prev_mod = None
    for k, L in enumerate(LESSONS, 1):
        mod = L["id"].split(".")[0]
        mname, accent = MODULES[mod]
        first = mod != prev_mod
        nice = L["title"].replace("characters + product + set", "characters, product and set").replace(" + a clean", " and a clean")
        title = "\n".join(textwrap.wrap(nice, 34))
        layers = [
            (f"MODULE {mod}  ·  {mname.upper()}", "Inter-SemiBold.otf", 30, accent, 200, 350),
            (f"Lesson {L['id']}", "Inter-Medium.otf", 40, "0xc8ccd4", 200, 410),
            (title, "InterDisplay-Medium.otf", 80, "white", 200, 470),
            (f"{k} / {total}", "Inter-Medium.otf", 28, "0x9297a0", 1640, 980),
            ("AI & Advertising  ·  Building an ad from scratch", "Inter-Regular.otf", 28, "0x9297a0", 200, 980),
        ]
        c = card(f"L{L['id']}", 4.0 if first else 3.0, layers, accent)
        seq.append((f"{L['id']} {nice}", c))
        seq.append((None, OUT / fname(L)))
        prev_mod = mod
    seq.append(("End", card("close", 4.0, [
        ("AI & ADVERTISING  ·  IDEABRO STUDIO", "Inter-SemiBold.otf", 30, "0xd9a441", 200, 350),
        ("That's the full workflow.", "InterDisplay-Medium.otf", 92, "white", 200, 410),
        ("Now build your own ad, then share it with us.", "Inter-Regular.otf", 40, "0xc8ccd4", 200, 540),
    ], "0xd9a441")))

    lst = HERE / "work" / "full_list.txt"
    lst.write_text("".join(f"file '{p}'\n" for _, p in seq))
    t, meta, yt = 0.0, [";FFMETADATA1", "title=AI & Advertising - Building an ad from scratch (full lecture)"], []
    marks = []
    for label, p in seq:
        if label:
            marks.append((t, label))
        t += dur(p)
    for i, (st, label) in enumerate(marks):
        en = marks[i + 1][0] if i + 1 < len(marks) else t
        meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(st * 1000)}", f"END={int(en * 1000)}", f"title={label}"]
        yt.append(f"{int(st // 3600)}:{int(st % 3600 // 60):02d}:{int(st % 60):02d} {label}")
    (HERE / "work" / "chapters.ffmeta").write_text("\n".join(meta) + "\n")
    out = OUT.parent / "full" / "AI & Advertising - Building an ad from scratch (full lecture).mp4"
    out.parent.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-i", str(HERE / "work" / "chapters.ffmeta"), "-map", "0", "-map_metadata", "1", "-map_chapters", "1",
                    "-c", "copy", "-movflags", "+faststart", str(out)], check=True)
    (out.parent / "chapters.txt").write_text("\n".join(yt) + "\n")
    print("\n".join(yt)); print(f"total {t/60:.1f} min ->", out)


if __name__ == "__main__":
    main()
