#!/usr/bin/env python3
"""Search and download CC0 assets from Poly Haven (models, PBR textures, HDRIs). No API key needed.

  python3 polyhaven.py search models "computer desk lamp book"   # rank assets by keyword hits
  python3 polyhaven.py search textures "walnut veneer"
  python3 polyhaven.py search hdris "sunset interior"
  python3 polyhaven.py model  potted_plant_02 [--res 2k] [--out assets]   -> assets/<id>/<id>.gltf (+ textures)
  python3 polyhaven.py texture black_walnut_veneer_02 [--res 2k]          -> assets/tex/<id>/{Diffuse,nor_gl,Rough}.jpg
  python3 polyhaven.py hdri   studio_small_09 [--res 2k]                  -> assets/hdri/<id>.exr

Real scanned props and surfaces are the fastest way to escape the 'clean CG' look - use them
for anything organic or messy (plants, books, paper, fabric, worn wood, stone).
"""
import argparse, json, os, sys, urllib.request

UA = [("User-Agent", "cinematic-3d-video-skill/1.0")]  # the API rejects requests without a UA
op = urllib.request.build_opener(); op.addheaders = UA; urllib.request.install_opener(op)
API = "https://api.polyhaven.com"


def get_json(url):
    return json.load(urllib.request.urlopen(url))


def fetch(url, path):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    if not os.path.exists(path):
        urllib.request.urlretrieve(url, path)
    return path


def search(kind, query, limit=25):
    t = {'models': 'models', 'textures': 'textures', 'hdris': 'hdris'}[kind]
    data = get_json(f"{API}/assets?t={t}")
    words = [w.lower() for w in query.split()]
    scored = []
    for k, v in data.items():
        hay = ' '.join([k, v.get('name', '')] + v.get('tags', []) + v.get('categories', [])).lower()
        s = sum(hay.count(w) for w in words)
        if s: scored.append((s, k, v))
    for s, k, v in sorted(scored, key=lambda x: -x[0])[:limit]:
        print(f"{k:32s} score={s:<3d} {', '.join(v.get('categories', [])[:3])} | {', '.join(v.get('tags', [])[:6])}")


def model(aid, res, out):
    d = get_json(f"{API}/files/{aid}")
    if 'gltf' not in d: sys.exit(f"{aid}: no glTF download (keys: {list(d)[:8]})")
    r = res if res in d['gltf'] else sorted(d['gltf'])[0]
    g = d['gltf'][r]['gltf']; base = os.path.join(out, aid)
    p = fetch(g['url'], os.path.join(base, f"{aid}.gltf"))
    for rel, v in g.get('include', {}).items(): fetch(v['url'], os.path.join(base, rel))
    print(p)


def texture(aid, res, out):
    d = get_json(f"{API}/files/{aid}")
    folder = os.path.join(out, 'tex', aid)
    for m in ['Diffuse', 'nor_gl', 'Rough', 'arm', 'Displacement']:
        if m in d:
            r = res if res in d[m] else sorted(d[m])[0]
            fetch(d[m][r]['jpg']['url'] if 'jpg' in d[m][r] else d[m][r]['png']['url'], os.path.join(folder, f"{m}.jpg"))
    print(folder)


def hdri(aid, res, out):
    d = get_json(f"{API}/files/{aid}")
    h = d['hdri']; r = res if res in h else sorted(h)[0]
    print(fetch(h[r]['exr']['url'], os.path.join(out, 'hdri', f"{aid}.exr")))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['search', 'model', 'texture', 'hdri'])
    ap.add_argument('args', nargs='+')
    ap.add_argument('--res', default='2k')
    ap.add_argument('--out', default='assets')
    a = ap.parse_args()
    if a.cmd == 'search': search(a.args[0], ' '.join(a.args[1:]))
    else:
        for aid in a.args: {'model': model, 'texture': texture, 'hdri': hdri}[a.cmd](aid, a.res, a.out)
