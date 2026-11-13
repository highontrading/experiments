"""Assemble assets/manifest.json from drive notes, stock entries and screen entries.
Only files that still exist on disk are included (so deleting a weak clip and re-running drops it).

Usage: python3 -I build_manifest.py
"""
import json
import os
import subprocess

ROOT = "/home/user/experiments/ideabro-ads"
TOOLS = os.path.join(ROOT, "work/footage_tools")
A = os.path.join(ROOT, "assets")


def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", p], capture_output=True, text=True)
    j = json.loads(r.stdout)
    return round(float(j["format"]["duration"]), 2), j["streams"][0]["width"], j["streams"][0]["height"]


def main():
    out = []
    notes = json.load(open(os.path.join(TOOLS, "drive_notes.json")))
    for rel, n in notes.items():
        p = os.path.join(A, "drive", rel)
        if not os.path.exists(p):
            continue
        d, w, h = probe(p)
        desc = n["desc"]
        if n.get("logo_flag"):
            desc += " BRAND/IP FLAG: " + n["logo_flag"] + "."
        out.append({"path": p, "category": "drive", "description": desc,
                    "source_url": f"https://drive.google.com/file/d/{n['id']}/view",
                    "license": "User's own Google Drive footage (Ideabro Studio); clear any third-party brands/IP flagged before use in ads",
                    "duration": d, "width": w, "height": h,
                    "drive_subfolder": rel.split("/")[0], "brand_flag": n.get("logo_flag", "")})
    for fn in ("stock_entries.json", "extra_stock_entries.json", "screen_entries.json"):
        fp = os.path.join(TOOLS, fn)
        if not os.path.exists(fp):
            continue
        for e in json.load(open(fp)):
            if os.path.exists(e["path"]):
                d, w, h = probe(e["path"])
                e.update({"duration": d, "width": w, "height": h})
                out.append(e)
    json.dump(out, open(os.path.join(A, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    from collections import Counter
    print(len(out), Counter(e["category"] for e in out))


if __name__ == "__main__":
    main()
