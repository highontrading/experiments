"""Download Mixkit thumbs for ids matching regex; build labeled contact sheet. contact.py index.json outdir name regex [max]"""
import sys, re, json, os, urllib.request, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont
idx, out, name, pat = sys.argv[1:5]; mx = int(sys.argv[5]) if len(sys.argv) > 5 else 40
d = json.load(open(idx)); os.makedirs(f"{out}/thumbs", exist_ok=True)
ids = [i for i, v in d.items() if re.search(pat, v["slug"])][:mx]
UA = {"User-Agent": "Mozilla/5.0"}
def get(i):
    p = f"{out}/thumbs/{i}.jpg"
    if not os.path.exists(p):
        try: open(p, "wb").write(urllib.request.urlopen(urllib.request.Request(f"https://assets.mixkit.co/videos/{i}/{i}-thumb-360-0.jpg", headers=UA), timeout=30).read())
        except Exception: return None
    return p
with cf.ThreadPoolExecutor(12) as ex: paths = list(ex.map(get, ids))
W, H, C = 320, 180, 6
rows = (len(ids) + C - 1) // C
sheet = Image.new("RGB", (W * C, (H + 26) * rows), "white"); dr = ImageDraw.Draw(sheet)
f = ImageFont.load_default(14) if hasattr(ImageFont, "load_default") else None
for n, (i, p) in enumerate(zip(ids, paths)):
    x, y = (n % C) * W, (n // C) * (H + 26)
    if p:
        try:
            im = Image.open(p).convert("RGB"); im.thumbnail((W, H)); sheet.paste(im, (x, y))
        except Exception: pass
    dr.text((x + 3, y + H + 4), f"{i} {d[i]['slug'][:34]}", fill="black", font=f)
sheet.save(f"{out}/{name}.jpg", quality=80); print(f"{out}/{name}.jpg", len(ids))
