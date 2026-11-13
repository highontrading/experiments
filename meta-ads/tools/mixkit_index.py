"""Index Mixkit free stock videos for search slugs -> build/stock/index.json (id, title, slug, thumb). Mixkit Free License."""
import json, re, sys, urllib.request, os, time
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
idx = json.load(open("build/stock/index.json")) if os.path.exists("build/stock/index.json") else {}
for term in sys.argv[1:]:
    try: h = urllib.request.urlopen(urllib.request.Request(f"https://mixkit.co/free-stock-video/{term}/", headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception as e: print("fail", term, e); continue
    n = 0
    for m in re.finditer(r'href="/free-stock-video/([a-z0-9-]+)-(\d+)/"', h):
        slug, vid = m.group(1), m.group(2)
        if vid in idx: continue
        idx[vid] = {"id": vid, "title": slug.replace("-", " "), "term": term,
                    "thumb": f"https://assets.mixkit.co/videos/{vid}/{vid}-thumb-360-0.jpg"}; n += 1
    print(term, n); time.sleep(0.5)
json.dump(idx, open("build/stock/index.json", "w"), indent=0)
print("total", len(idx))
