import json,os,sys,urllib.request
op=urllib.request.build_opener(); op.addheaders=[("User-Agent","scene-builder/1.0")]; urllib.request.install_opener(op)
def get(u,p):
    os.makedirs(os.path.dirname(p),exist_ok=True)
    if not os.path.exists(p): urllib.request.urlretrieve(u,p)
def files(a): return json.load(urllib.request.urlopen(f"https://api.polyhaven.com/files/{a}"))
for a in sys.argv[1].split(','):
    d=files(a); g=d['gltf']['2k']['gltf']; base=f"assets/{a}"
    get(g['url'],f"{base}/{a}.gltf")
    for rel,v in g.get('include',{}).items(): get(v['url'],f"{base}/{rel}")
    print('model',a)
for a in sys.argv[2].split(','):
    d=files(a)
    for m in ['Diffuse','nor_gl','Rough','arm','Displacement']:
        if m in d: get(d[m]['2k']['jpg']['url'],f"assets/tex/{a}/{m}.jpg")
    print('tex',a)
