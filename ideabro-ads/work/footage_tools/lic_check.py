"""Print the Mixkit license for each clip id (slug looked up from cached search pages).

Usage: python3 -I lic_check.py SEARCH_CACHE PAGE_CACHE id1 id2 ...
"""
import glob
import os
import re
import subprocess
import sys

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def main():
    scache, pcache, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(pcache, exist_ok=True)
    slugs = {}
    for f in glob.glob(os.path.join(scache, "*.html")):
        for m in re.finditer(r'href="/free-stock-video/([a-z0-9-]+-(\d+))/"', open(f, errors="ignore").read()):
            slugs[m.group(2)] = m.group(1)
    for vid in ids:
        slug = slugs.get(vid)
        if not slug:
            print(f"{vid}\t?\tno slug")
            continue
        p = os.path.join(pcache, f"{vid}.html")
        if not os.path.exists(p) or os.path.getsize(p) < 1000:
            subprocess.run(["curl", "-sSL", "-A", UA, "-o", p, f"https://mixkit.co/free-stock-video/{slug}/"])
        t = open(p, errors="ignore").read()
        lic = sorted(set(re.findall(r"Mixkit (?:Stock Video )?(?:Free|Restricted) License", t)))
        print(f"{vid}\t{'FREE' if lic == ['Mixkit Stock Video Free License'] else 'NO'}\t{lic}\t{slug}")


if __name__ == "__main__":
    main()
