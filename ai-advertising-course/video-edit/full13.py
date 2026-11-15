#!/usr/bin/env python3
"""Module 13 full lecture: showcase intro + intro + 8 parts with title cards + chapters."""
import subprocess, textwrap
from pathlib import Path
from lessons import LESSONS
from cutter import fname, OUT, RAW
from full import card, dur, ENC, CARDS, FONT, tf

HERE = Path(__file__).resolve().parent
ACCENT = "0xfcab79"
CASE = "CASE STUDY 2  ·  AROMA MAGIC SUNSCREEN"
PARTS = [  # (lesson id used, part title)
    ("13.0", "What this case study covers"),
    ("13.1", "Static ads from a real product photo"),
    ("3.3", "Hero shot and the full static set in Flow"),
    ("8.1", "Static ads in the style of Pinterest references"),
    ("7.1", "UGC ad: idea, references and caption style"),
    ("6.3", "Connect ElevenLabs to Claude: automatic voice, music and SFX"),
    ("7.2", "UGC clips in Google Flow with Claude-made audio"),
    ("9.4", "Vibe edit with a reference style: voice swap, captions, final ad"),
    ("9.5", "Every aspect ratio and fixing a mispronounced word"),
]


def label_filter(name, lines):
    out = []
    for i, (text, font, size, color, x, y, box) in enumerate(lines):
        b = ":box=1:boxcolor=black@0.55:boxborderw=14" if box else ""
        out.append(f"drawtext=fontfile={FONT}{font}:textfile={tf(f'{name}_{i}', text)}:fontsize={size}:fontcolor={color}:x={x}:y={y}{b}")
    return ",".join(out)


def showcase():
    g = CARDS / "sc_gallery.mp4"
    lab = label_filter("scg", [("WHAT WE'LL MAKE", "Inter-SemiBold.otf", 30, ACCENT, 80, 70, True),
                               ("Static ads from one phone photo", "Inter-SemiBold.otf", 46, "white", 80, 130, True)])
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", str(HERE / "work" / "gallery.png"),
                    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "5",
                    "-vf", "crop=1300:731:565:122,scale=3840:2160,zoompan=z='min(zoom+0.0007,1.1)':d=150:s=1920x1080:fps=30,"
                           f"{lab},fade=t=in:st=0:d=0.4,fade=t=out:st=4.6:d=0.4",
                    *ENC, "-shortest", str(g)], check=True)
    a = CARDS / "sc_ad.mp4"
    lab2 = label_filter("sca", [("WHAT WE'LL MAKE", "Inter-SemiBold.otf", 30, ACCENT, 80, 70, False),
                                ("Hinglish UGC ad", "InterDisplay-Medium.otf", 56, "white", 80, 118, False),
                                ("24 seconds · AI creator, voice,\nmusic, captions and end card,\nall made with the 4 skills", "Inter-Regular.otf", 30, "0xc8ccd4", 80, 200, False)])
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "2834.95", "-t", "24.95", "-i", str(RAW / "vid3.mov"),
                    "-vf", f"fps=30,{lab2},fade=t=in:st=0:d=0.3,fade=t=out:st=24.4:d=0.5",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=24.3:d=0.6", *ENC, str(a)], check=True)
    return [g, a]


def main():
    g, a = showcase()
    seq = [("What we'll make", g), (None, a)]
    seq.append(("Start", card("m13_open", 5.0, [
        (CASE, "Inter-SemiBold.otf", 30, ACCENT, 200, 350),
        ("Static ads + a Hinglish UGC ad", "InterDisplay-Medium.otf", 88, "white", 200, 410),
        ("Module 13 · the full build, from one phone photo to every ad format.\nAd Strategist → Image Director → Video Director → Vibe Editor.",
         "Inter-Regular.otf", 34, "0xc8ccd4", 200, 540)], ACCENT)))
    total = len(PARTS)
    for k, (lid, title) in enumerate(PARTS, 1):
        L = [l for l in LESSONS if l["id"] == lid][0]
        part = "Intro" if k == 1 else f"Part {k - 1}"
        c = card(f"m13_{k}", 3.0, [
            (CASE, "Inter-SemiBold.otf", 30, ACCENT, 200, 350),
            (part, "Inter-Medium.otf", 40, "0xc8ccd4", 200, 410),
            ("\n".join(textwrap.wrap(title, 34)), "InterDisplay-Medium.otf", 80, "white", 200, 470),
            (f"{k} / {total}", "Inter-Medium.otf", 28, "0x9297a0", 1640, 980),
            ("AI & Advertising  ·  Module 13", "Inter-Regular.otf", 28, "0x9297a0", 200, 980)], ACCENT)
        seq.append((f"{part}: {title}", c))
        seq.append((None, OUT / fname(L)))
    seq.append(("End", card("m13_close", 4.0, [
        (CASE, "Inter-SemiBold.otf", 30, ACCENT, 200, 350),
        ("One product. Every format.", "InterDisplay-Medium.otf", 92, "white", 200, 410),
        ("Now take your own product through the same workflow.", "Inter-Regular.otf", 40, "0xc8ccd4", 200, 540)], ACCENT)))
    lst = HERE / "work" / "m13_list.txt"
    lst.write_text("".join(f"file '{p}'\n" for _, p in seq))
    t, marks = 0.0, []
    for label, p in seq:
        if label:
            marks.append((t, label))
        t += dur(p)
    meta = [";FFMETADATA1", "title=AI & Advertising - Module 13 - Case study: Aroma Magic sunscreen (full lecture)"]
    yt = []
    for i, (st, label) in enumerate(marks):
        en = marks[i + 1][0] if i + 1 < len(marks) else t
        meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(st * 1000)}", f"END={int(en * 1000)}", f"title={label}"]
        yt.append(f"{int(st // 3600)}:{int(st % 3600 // 60):02d}:{int(st % 60):02d} {label}")
    (HERE / "work" / "m13.ffmeta").write_text("\n".join(meta) + "\n")
    outd = HERE / "full13"; outd.mkdir(exist_ok=True)
    out = outd / "Module 13 - Case study - Aroma Magic sunscreen (full lecture).mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-i", str(HERE / "work" / "m13.ffmeta"), "-map", "0", "-map_metadata", "1", "-map_chapters", "1",
                    "-c", "copy", "-movflags", "+faststart", str(out)], check=True)
    (outd / "chapters.txt").write_text("\n".join(yt) + "\n")
    print("\n".join(yt)); print(f"total {t / 60:.1f} min ->", out)


if __name__ == "__main__":
    main()
