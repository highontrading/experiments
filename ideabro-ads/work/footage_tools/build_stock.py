"""Trim all selected stock clips into assets/stock/ and write stock_entries.json.

Usage: python3 -I build_stock.py   (paths are fixed below)
"""
import json
import os
import subprocess

ROOT = "/home/user/experiments/ideabro-ads"
TOOLS = os.path.join(ROOT, "work/footage_tools")
STOCK = os.path.join(ROOT, "assets/stock")
MIXKIT_LIC = ("Mixkit Stock Video Free License (verified on clip page): free for commercial and personal use "
              "incl. online ads, no attribution; https://mixkit.co/license/")
COVERR_LIC = ("Coverr License (stock library, non-premium, non-AI): free for commercial use incl. ads, "
              "no attribution; https://coverr.co/license")

COVERR = [
    ("h", "student-laptop-desk-lamp", "coverr-student-doing-a-marketing-assignment-on-her-laptop-6604-1080p.mp4",
     "https://coverr.co/videos/student-doing-a-marketing-assignment-on-her-laptop-pjhqoptbyb",
     "Student doing a marketing assignment on her laptop at a desk with a lamp"),
    ("j", "sunrise-city-skyline", "coverr-sunrise-in-buenos-aires-5605-1080p.mp4",
     "https://coverr.co/videos/sunrise-in-buenos-aires-4ysdowrdkc", "Dawn breaking over a city skyline (Buenos Aires)"),
    ("j", "morning-street-sunrise", "coverr-sunrise-on-street-in-mexico-city-2715-1080p.mp4",
     "https://coverr.co/videos/sunrise-on-street-in-mexico-city-7ues6gg1lf", "Empty city street at sunrise (Mexico City)"),
    ("f", "indian-artisan-pottery", "coverr-woman-making-pottery-3410-1080p.mp4",
     "https://coverr.co/videos/woman-making-pottery-dfhdltggy1",
     "Indian woman's hands shaping clay on a pottery wheel (maker / small-business craft)"),
]

# manual start overrides (seconds) after reviewing sheets; filled in on later passes
OVERRIDES = json.load(open(os.path.join(TOOLS, "trim_overrides.json"))) if os.path.exists(
    os.path.join(TOOLS, "trim_overrides.json")) else {}


def main():
    os.makedirs(STOCK, exist_ok=True)
    recs = json.load(open(os.path.join(TOOLS, "mixkit_records.json")))
    jobs = []
    for key, r in recs.items():
        jobs.append((r["letter"], r["short"], r["raw"], r["source_url"], r["title"].replace(" - Free Stock Video", "").strip(),
                     f"{MIXKIT_LIC}; source quality {r['quality']}p"))
    for letter, short, fn, url, desc in COVERR:
        jobs.append((letter, short, os.path.join(ROOT, "assets/raw/coverr", fn), url, desc, COVERR_LIC + "; source 1080p"))
    out_entries = []
    for letter, short, src, url, desc, lic in jobs:
        name = f"{letter}_{short}"
        out = os.path.join(STOCK, name + ".mp4")
        ov = OVERRIDES.get(name, {})
        if ov.get("drop"):
            continue
        args = ["python3", "-I", os.path.join(TOOLS, "trim.py"), src, out, str(ov.get("len", 6)), str(ov.get("start", "auto"))]
        res = subprocess.run(args, capture_output=True, text=True)
        if res.returncode != 0:
            print("FAIL", name, res.stderr[-300:])
            continue
        info = json.loads(res.stdout.strip().splitlines()[-1])
        print(name, info)
        out_entries.append({"path": out, "category": f"stock_{letter}", "description": desc,
                            "source_url": url, "license": lic, "duration": info["duration"],
                            "width": info["width"], "height": info["height"],
                            "trim_from_source_s": info["start"]})
    json.dump(out_entries, open(os.path.join(TOOLS, "stock_entries.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
