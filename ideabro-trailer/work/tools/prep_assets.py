import json,os,glob,subprocess
from PIL import Image
ROOT='public'
def img(n): return f'studio/img/i{n:02d}.jpg'
def aspect(path):
    p=os.path.join(ROOT,path)
    if path.endswith('.mp4'):
        w,h=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip().split(',')[:2]
        return int(w)/int(h)
    w,h=Image.open(p).size; return w/h
A={}
# --- public-domain sets (fallback to studio stills until collected) ---
pd=sorted(glob.glob(f'{ROOT}/pd/strobe/*.jpg'))
A['strobe']=([p[len(ROOT)+1:] for p in pd]+[img(i) for i in (19,26,28,39)]) if pd else [img(i) for i in [1,3,5,6,8,9,10,12,13,15,16,17,19,21,22,23,24,25,26,27,28,29,30,31,33,34,35,36,37,38,39]]
old=sorted(glob.glob(f'{ROOT}/pd/old/*.jpg'))
A['old']=[p[len(ROOT)+1:] for p in old][:9] or [img(i) for i in [10,15,18,24,25,27,8,2,16]]
def era(name,fallback):
    for ext,video in (('mp4',True),('jpg',False)):
        p=f'pd/eras/{name}.{ext}'
        if os.path.exists(os.path.join(ROOT,p)): return dict(src=p,video=video,aspect=aspect(p))
    return dict(src=fallback,video=False,aspect=aspect(fallback))
A['eras']=dict(print=era('print',img(9)),television=era('television',img(36)))
A['feed']=[img(i) for i in [37,27,25,39,2,16,20,28,33,24]]
A['studioTiles']=[dict(src=s,video=s.endswith('.mp4'),slot=k) for s,k in [
 ('studio/tile_donut.mp4',1),(img(37),2),(img(27),3),('studio/tile_jar.mp4',4),('studio/tile_outfit.mp4',0),(img(2),5),(img(47),6),(img(24),7),(img(8),8),(img(15),9),
 ('studio/tile_gloss.mp4',1),(img(39),4),('studio/tile_fashion.mp4',0),(img(25),6)]]
A['studioSlotsH']=[[0.50,0.50,0.16,0.36],[0.34,0.36,0.15,0.32],[0.66,0.38,0.17,0.30],[0.36,0.68,0.17,0.32],[0.64,0.67,0.15,0.34],[0.21,0.52,0.13,0.34],[0.80,0.52,0.13,0.36],[0.50,0.22,0.14,0.26],[0.50,0.80,0.15,0.28],[0.88,0.27,0.10,0.28]]
A['studioSlotsV']=[[0.50,0.50,0.40,0.24],[0.27,0.33,0.38,0.20],[0.73,0.35,0.38,0.22],[0.28,0.68,0.40,0.21],[0.72,0.66,0.38,0.22],[0.50,0.19,0.34,0.16],[0.50,0.82,0.36,0.17],[0.18,0.50,0.28,0.18],[0.84,0.50,0.28,0.19],[0.75,0.15,0.26,0.14]]
P={}
for k,f in [('product','product'),('model','model'),('film','film'),('ugc','ugc'),('course','course'),('capstone','capstone'),('taste','taste')]:
    s=f'studio/{f}.mp4'; P[k]=dict(src=s,aspect=aspect(s))
P['meta']=dict(images=[img(i) for i in [45,46,47,48,49]],aspect=1.5)
A['proof']=P
json.dump(A,open('src/data/assets.json','w'),indent=1)
print('strobe',len(A['strobe']),'old',len(A['old']),'eras',A['eras'])
