# Tiny Wikimedia Commons client with backoff (the shared egress IP gets 429s).
import json, sys, time, urllib.request, urllib.parse
UA = "VibeEditingBharat/1.0 (https://github.com/highontrading/experiments; research use)"
def get(url, tries=8):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == tries - 1: raise
            time.sleep(float(e.headers.get("retry-after") or 3) * (1.5 ** i))
def api(**p):
    p.update(format="json", formatversion=2)
    return json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)))
def search(q, n=20, kind="video"):
    """-> [(title, width, height, duration, mime, size, license, url)]"""
    d = api(action="query", generator="search", gsrsearch=(f"{q} filemime:video" if kind == "video" else f"{q} filetype:bitmap"), gsrnamespace=6, gsrlimit=n,
            prop="imageinfo", iiprop="url|size|mime|extmetadata", iiextmetadatafilter="LicenseShortName|Artist")
    out = []
    for pg in d.get("query", {}).get("pages", []):
        ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {})
        out.append((pg["title"], ii.get("width"), ii.get("height"), round(ii.get("duration") or 0, 1), ii["mime"], ii["size"] // 1024,
                    md.get("LicenseShortName", {}).get("value"), ii["url"]))
    return out
if __name__ == "__main__":
    kind = sys.argv[2] if len(sys.argv) > 2 else "video"
    for r in search(sys.argv[1], kind=kind): print(" | ".join(map(str, r[:7])))
