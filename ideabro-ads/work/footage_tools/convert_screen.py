"""Cut Playwright .webm recordings to their marked window and encode H.264 mp4 into assets/screen/.

Usage: python3 -I convert_screen.py REC_DIR
"""
import json
import os
import subprocess
import sys

ROOT = "/home/user/experiments/ideabro-ads"
OUT = os.path.join(ROOT, "assets/screen")
URL = "https://community.ideabrostudio.com/courses/ai-and-advertising"
DESC = {
    "mob_scroll": "Mobile 1080x1920 smooth top-to-bottom scroll through the whole AI & Advertising course page",
    "mob_hero": "Mobile 1080x1920 parked on the hero (headline 'Shoot-quality ads, without the shoot. Learn AI Advertising.', $29 CTA, campaign card fan)",
    "mob_table": "Mobile 1080x1920 parked on 'The shoot is optional now' old-way vs AI-way comparison table",
    "mob_curriculum": "Mobile 1080x1920 on 'What you'll learn' curriculum with modules 01 and 03 ('AI product photography') expanded, lessons listed",
    "mob_pricing": "Mobile 1080x1920 parked on the pricing card ($29, 70% off, feature list, Enroll button)",
    "desk_hero": "Desktop 1920x1080 parked on the hero",
    "desk_curriculum": "Desktop 1920x1080 on the curriculum; module 03 'AI product photography' expands, then a gentle scroll down to it",
}


# extra lead-in to skip stale screencast frames seen at clip start (checked on contact sheets)
LEAD = {"mob_curriculum": 2.0, "desk_curriculum": 1.4}


def main():
    rec = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    entries = []
    for shot, desc in DESC.items():
        w = os.path.join(rec, shot + ".webm")
        j = os.path.join(rec, shot + ".json")
        if not (os.path.exists(w) and os.path.exists(j)):
            print("missing", shot)
            continue
        m = json.load(open(j))
        start, end = m["start"] + 0.1 + LEAD.get(shot, 0.0), m["end"]
        out = os.path.join(OUT, f"screen_{shot}.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-i", w, "-t", f"{end - start:.2f}",
                        "-an", "-vf", "format=yuv420p", "-r", "25", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], check=True)
        entries.append({"path": out, "category": "screen", "description": desc, "source_url": URL,
                        "license": "Ideabro Studio's own course page (first-party screen recording)"})
        print("ok", out)
    json.dump(entries, open(os.path.join(ROOT, "work/footage_tools/screen_entries.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
