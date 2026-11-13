"""Index + download Mixkit free stock music (Mixkit Stock Music Free License) by tag -> build/music/<id>.mp3, index.json"""
import json, re, sys, os, urllib.request, html
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
os.makedirs("build/music", exist_ok=True)
idx = json.load(open("build/music/index.json")) if os.path.exists("build/music/index.json") else {}
for tag in sys.argv[1:]:
    try: h = urllib.request.urlopen(urllib.request.Request(f"https://mixkit.co/free-stock-music/tag/{tag}/", headers=UA), timeout=30).read().decode("utf8", "ignore")
    except Exception as e: print("fail", tag, e); continue
    ids = list(dict.fromkeys(re.findall(r'assets\.mixkit\.co/music/(\d+)/\1\.mp3', h)))
    titles = re.findall(r'item-grid-card__title[^>]*>\s*([^<]+?)\s*<', h)
    for i, mid in enumerate(ids):
        if mid not in idx: idx[mid] = {"id": mid, "tag": tag, "title": html.unescape(titles[i]) if i < len(titles) else ""}
    print(tag, len(ids))
json.dump(idx, open("build/music/index.json", "w"), indent=0); print("total", len(idx))
