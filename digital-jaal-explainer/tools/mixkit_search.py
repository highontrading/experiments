"""Search Mixkit tag pages; print id|slug for each result. Usage: mixkit_search.py OUTDIR tag [tag...]"""
import sys, re, json, os, urllib.request
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
res = {}
for tag in sys.argv[2:]:
    for page in ("", "?page=2"):
        url = f"https://mixkit.co/free-stock-video/{tag}/{page}"
        try:
            html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode("utf8", "ignore")
        except Exception as e:
            print("ERR", tag, e, file=sys.stderr); break
        items = re.findall(r'href="/free-stock-video/([a-z0-9-]+)-(\d+)/"', html)
        for slug, vid in items:
            res.setdefault(vid, {"slug": slug, "tags": set()})["tags"].add(tag)
json.dump({k: {"slug": v["slug"], "tags": sorted(v["tags"])} for k, v in res.items()}, open(f"{out}/index.json", "w"), indent=1)
for k, v in res.items(): print(k, v["slug"], ",".join(sorted(v["tags"])))
