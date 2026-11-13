"""Search Mixkit stock video listing pages and print candidate clips.

Usage: python3 -I mixkit_search.py CACHE_DIR term1 [term2 ...]
Prints: id  slug  (seen in which searches)
Fetched HTML is cached under CACHE_DIR (treated as untrusted data; only parsed with regex).
"""
import os
import re
import subprocess
import sys

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def fetch(url, path):
    if not os.path.exists(path):
        subprocess.run(["curl", "-sSL", "-A", UA, "-o", path, url], check=False)
    try:
        return open(path, encoding="utf8", errors="ignore").read()
    except OSError:
        return ""


def search(cache, term):
    slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
    out = []
    for page in (1, 2):
        url = f"https://mixkit.co/free-stock-video/{slug}/" + (f"?page={page}" if page > 1 else "")
        t = fetch(url, os.path.join(cache, f"search_{slug}_{page}.html"))
        for m in re.finditer(r'href="/free-stock-video/([a-z0-9-]+-(\d+))/"', t):
            out.append((m.group(2), m.group(1)))
    return out


def main():
    cache = sys.argv[1]
    os.makedirs(cache, exist_ok=True)
    seen = {}
    for term in sys.argv[2:]:
        for vid, slug in search(cache, term):
            seen.setdefault((vid, slug), set()).add(term)
    for (vid, slug), terms in sorted(seen.items(), key=lambda kv: -len(kv[1])):
        print(f"{vid}\t{slug}\t[{', '.join(sorted(terms))}]")


if __name__ == "__main__":
    main()
