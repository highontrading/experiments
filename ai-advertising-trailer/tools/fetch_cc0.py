"""Fetch CC0 / public-domain photos from Openverse.
usage: python3 tools/fetch_cc0.py <outdir> <per_query> "query1" "query2" ...
Writes <outdir>/<slug>_<n>.jpg and appends to <outdir>/credits.jsonl"""
import json, os, re, sys, time, urllib.request, urllib.parse
UA = {"User-Agent": "TrailerAssetFetcher/1.0 (video-production)"}
out, per, queries = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
os.makedirs(out, exist_ok=True)
def get(url, tries=6, timeout=40):
    for k in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
        except Exception as e:
            time.sleep(2 + 2 * k); err = e
    raise err
for q in queries:
    slug = re.sub(r"[^a-z0-9]+", "_", q.lower()).strip("_")
    try:
        res = json.loads(get("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
            {"q": q, "license": "cc0,pdm", "page_size": per * 3, "mature": "false"})))["results"]
    except Exception as e:
        print("SEARCH FAIL", q, e); continue
    n = 0
    for r in res:
        if n >= per: break
        fn = f"{out}/{slug}_{n}.jpg"
        try:
            data = get(r["url"], tries=2, timeout=30)
            if len(data) < 15000: continue
            open(fn, "wb").write(data); n += 1
            with open(f"{out}/credits.jsonl", "a") as f:
                f.write(json.dumps({"file": os.path.basename(fn), "title": r.get("title"), "creator": r.get("creator"),
                                    "license": r.get("license"), "source": r.get("foreign_landing_url")}) + "\n")
        except Exception: pass
    print(q, "->", n)
