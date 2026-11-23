import numpy as np, glob, os
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
from scipy import ndimage
rng=np.random.default_rng(7)
os.makedirs('A/out',exist_ok=True)
def bw(rgb, contrast=1.25):
    a=np.asarray(rgb).astype(np.float32)
    l=0.30*a[...,0]+0.59*a[...,1]+0.11*a[...,2]
    # S curve
    l=np.clip((l-0.5)*contrast+0.5,0,1)
    l=l*l*(3-2*l)*0.35+l*0.65
    # slight warm-neutral tone, lifted blacks like print
    l=0.06+l*0.9
    out=np.stack([l*1.0,l*0.985,l*0.955],-1)
    return out
def grain(arr,amt=0.045):
    n=rng.normal(0,amt,arr.shape[:2]).astype(np.float32)
    n=ndimage.gaussian_filter(n,0.6)
    return np.clip(arr+n[...,None],0,1)
def to_img(a): return Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8))

# ---- cutouts
for f in sorted(glob.glob('A/cut/*.png')):
    n=os.path.basename(f)[:-4]
    im=Image.open(f).convert('RGBA')
    src=Image.open(f'A/src/{n}.jpg').convert('RGB').resize(im.size,Image.LANCZOS)
    al=np.asarray(im)[...,3].astype(np.float32)/255
    al=np.clip((al-0.35)/0.3,0,1)
    m=al>0.5
    lab,k=ndimage.label(m)
    if k>1:
        sz=ndimage.sum(m,lab,range(1,k+1)); keep=np.isin(lab,1+np.where(sz>sz.max()*0.04)[0])
        keep=ndimage.binary_dilation(keep,iterations=3)
        al=al*keep
    ys,xs=np.where(al>0.05); pad=20
    y0,y1,x0,x1=max(0,ys.min()-pad),min(al.shape[0],ys.max()+pad),max(0,xs.min()-pad),min(al.shape[1],xs.max()+pad)
    rgb=np.asarray(src).astype(np.float32)[y0:y1,x0:x1]/255; al=al[y0:y1,x0:x1]
    h=rgb.shape[0]; s=max(1,900/h) if h<900 else 1
    if s>1:
        rgb=np.asarray(Image.fromarray((rgb*255).astype(np.uint8)).resize((int(rgb.shape[1]*s),int(h*s)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,80,2))).astype(np.float32)/255
        al=np.asarray(Image.fromarray((al*255).astype(np.uint8)).resize((rgb.shape[1],rgb.shape[0]),Image.LANCZOS)).astype(np.float32)/255
        al=ndimage.gaussian_filter(al,1.0); al=np.clip((al-0.3)/0.4,0,1)
    # pad for stroke
    P=16
    rgb=np.pad(rgb,((P,P),(P,P),(0,0))); al=np.pad(al,P)
    stroke=ndimage.binary_dilation(al>0.5,iterations=9).astype(np.float32)
    stroke=ndimage.gaussian_filter(stroke,0.8)
    cream=np.array([0.95,0.93,0.885])
    for mode in ('bw','col'):
        c=bw(rgb) if mode=='bw' else np.clip(rgb*1.03,0,1)
        c=grain(c,0.04 if mode=='bw' else 0.025)
        comp=c*al[...,None]+cream*(1-al[...,None])
        A=np.maximum(al,stroke)
        o=np.dstack([comp,A]); Image.fromarray((np.clip(o,0,1)*255).astype(np.uint8),'RGBA').save(f'A/out/cut_{n}_{mode}.png')
    print('cut',n,rgb.shape)

# ---- rect photos
for n in ['seeds','circle_meeting','village_meeting','training','sabha','meeting','kids_center','youth_seated','weaving','watermelon','millet_woman','volunteers','health','nutrition','farmer_woman','veg_woman','farmer_man','youth_leaders']:
    im=Image.open(f'A/src/{n}.jpg').convert('RGB')
    if im.width>1600: im=im.resize((1600,int(im.height*1600/im.width)),Image.LANCZOS)
    elif im.width<900:
        s=900/im.width; im=im.resize((900,int(im.height*s)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,70,2))
    a=np.asarray(im).astype(np.float32)/255
    to_img(grain(bw(a),0.045)).save(f'A/out/ph_{n}_bw.jpg',quality=90)
    to_img(grain(a,0.02)).save(f'A/out/ph_{n}_col.jpg',quality=90)
for f in glob.glob('A/src/news_*.jpg'):
    n=os.path.basename(f)[5:-4]
    im=Image.open(f).convert('RGB'); s=1.6; im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    a=np.asarray(im).astype(np.float32)/255
    l=bw(a,1.1); l=l*np.array([1,0.97,0.9])  # newsprint yellowing
    to_img(grain(l,0.03)).save(f'A/out/news_{n}.jpg',quality=88)

# ---- paper texture
W,H=2400,1400
def fbm(w,h,octs):
    t=np.zeros((h,w),np.float32)
    for s,amp in octs:
        z=rng.normal(0,1,(h//s+2,w//s+2)).astype(np.float32)
        z=np.asarray(Image.fromarray(z).resize((w,h),Image.BICUBIC))
        t+=z*amp
    return t
t=fbm(W,H,[(400,0.5),(120,0.35),(30,0.25),(6,0.18),(2,0.12)])
fib=ndimage.gaussian_filter(rng.normal(0,1,(H,W)).astype(np.float32),(0.5,6))*0.6
base=np.array([0.925,0.905,0.86])
yy,xx=np.mgrid[0:H,0:W]; d=np.sqrt(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2)
v=1-0.10*np.clip(d-0.5,0,1)**1.5
p=base[None,None,:]*(1+0.018*t[...,None]+0.012*fib[...,None])*v[...,None]
# few stains
for i in range(6):
    cx,cy,rad=rng.uniform(0,W),rng.uniform(0,H),rng.uniform(80,300)
    dd=np.sqrt((xx-cx)**2+(yy-cy)**2)/rad
    ring=np.exp(-((dd-1)**2)/0.004)*0.025+np.clip(1-dd,0,1)*0.012
    p=p*(1-ring[...,None]*np.array([0.6,0.9,1.4]))
to_img(p).save('A/out/paper.jpg',quality=92)
# ---- grain tiles
for i in range(8):
    g=rng.normal(0.5,0.16,(540,960)).astype(np.float32); g=ndimage.gaussian_filter(g,0.7)
    to_img(np.repeat(g[...,None],3,-1)).save(f'A/out/grain{i}.png')
print('done')
