"""Download Mixkit clips listed in a TSV and verify each clip's license on its page.

Usage: python3 -I fetch_mixkit.py LIST.tsv RAW_DIR RECORDS.json
LIST.tsv columns: letter  short_name  id  slug
Writes RAW_DIR/<id>.mp4 and appends records (license string, title, url) to RECORDS.json.
"""
import html
import json
import os
import re
import subprocess
import sys

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def curl(url, out):
    r = subprocess.run(["curl", "-sSL", "-A", UA, "-o", out, "-w", "%{http_code}", url],
                       capture_output=True, text=True)
    return r.stdout.strip()


def main():
    lst, raw, rec_path = sys.argv[1:4]
    os.makedirs(raw, exist_ok=True)
    recs = json.load(open(rec_path)) if os.path.exists(rec_path) else {}
    for line in open(lst):
        if not line.strip() or line.startswith("#"):
            continue
        letter, short, vid, slug = line.split()
        key = f"{letter}_{short}"
        if key in recs and os.path.exists(recs[key]["raw"]):
            continue
        page_url = f"https://mixkit.co/free-stock-video/{slug}/"
        page_file = os.path.join(raw, f"{vid}.html")
        curl(page_url, page_file)
        t = open(page_file, encoding="utf8", errors="ignore").read()
        lic = sorted(set(re.findall(r"Mixkit Stock Video (?:Free|Restricted) License", t)))
        m = re.search(r"<title>(.*?)</title>", t, re.S)
        title = html.unescape(m.group(1).strip()) if m else slug
        if lic != ["Mixkit Stock Video Free License"]:
            print(f"SKIP {key} {vid}: license={lic}")
            continue
        out = os.path.join(raw, f"{vid}.mp4")
        res = None
        m = re.search(r'(https://assets\.mixkit\.co/[^"]*?/' + vid + r'-(?:video-)?)(?:720|360)\.mp4', t)
        base = m.group(1) if m else f"https://assets.mixkit.co/videos/{vid}/{vid}-"
        for q in ("1080", "720"):
            code = curl(f"{base}{q}.mp4", out)
            if code == "200" and os.path.getsize(out) > 100000:
                res = q
                break
        if not res:
            print(f"FAIL {key} {vid}")
            continue
        recs[key] = {"letter": letter, "short": short, "id": vid, "source_url": page_url,
                     "title": title, "license": lic[0], "quality": res, "raw": out}
        print(f"OK {key} {vid} {res} {title}")
        json.dump(recs, open(rec_path, "w"), indent=1)
    json.dump(recs, open(rec_path, "w"), indent=1)


if __name__ == "__main__":
    main()
