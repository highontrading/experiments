import sys,subprocess,glob,os
from PIL import Image,ImageDraw
ids=sys.argv[2:]; out=sys.argv[1]; rows=[]
for id in ids:
    f=f'out/final/{id}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-vf','fps=1.5,scale=90:160','/tmp/ms_%03d.jpg'])
    fr=sorted(glob.glob('/tmp/ms_*.jpg')); ims=[Image.open(x).copy() for x in fr]
    for x in fr: os.remove(x)
    rows.append((id,ims))
W=max(len(r[1]) for r in rows)*90; S=Image.new('RGB',(W,len(rows)*176),'#222'); d=ImageDraw.Draw(S)
for i,(id,ims) in enumerate(rows):
    d.text((3,i*176+2),id,fill='yellow')
    for k,im in enumerate(ims): S.paste(im,(k*90,i*176+16))
S.save(out,quality=78); print(S.size)
