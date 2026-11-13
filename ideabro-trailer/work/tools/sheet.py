import sys,glob
from PIL import Image,ImageDraw
comp,order,out,cols=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4])
names=[l.split()[0] for l in open(order)]
ims=[(n,Image.open(f'stills/{comp}_{n}.jpg')) for n in names]
w,h=ims[0][1].size; sc=min(1,480/w) if w>h else min(1,300/w); tw,th=int(w*sc),int(h*sc)
rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*tw,rows*(th+18)),'#333'); d=ImageDraw.Draw(S)
for i,(n,im) in enumerate(ims):
    x=(i%cols)*tw; y=(i//cols)*(th+18); S.paste(im.resize((tw,th)),(x,y+18)); d.text((x+3,y+3),n,fill='yellow')
S.save(out,quality=85)
