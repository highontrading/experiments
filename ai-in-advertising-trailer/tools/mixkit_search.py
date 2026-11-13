"""usage: python3 mixkit_search.py OUT.json term ... -> {term: [[id, slug], ...]} (merges into existing OUT)"""
import sys, re, json, os, time, urllib.request
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/124"}
def get(url):
    try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception: return ""
def parse(h):
    out, seen = [], set()
    for slug, vid in re.findall(r'href="/free-stock-video/([a-z0-9-]+?)-(\d+)/"', h):
        if vid not in seen: seen.add(vid); out.append([int(vid), slug])
    return out
res = json.load(open(sys.argv[1])) if os.path.exists(sys.argv[1]) else {}
for term in sys.argv[2:]:
    s = term.replace(" ", "-"); o = []
    for url in [f"https://mixkit.co/free-stock-video/discover/{s}/", f"https://mixkit.co/free-stock-video/{s}/"]:
        o = parse(get(url))
        if o: break
        time.sleep(1)
    res[term] = o; print(term, len(o)); time.sleep(0.7)
json.dump(res, open(sys.argv[1], "w"))
