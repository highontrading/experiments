import sys,glob,os
from PIL import Image,ImageDraw
d,prefix,out=sys.argv[1],sys.argv[2],sys.argv[3]
fs=sorted(glob.glob(f'{d}/{prefix}_*.jpg'),key=lambda f: float(f.rsplit('_',1)[1][:-4]))
ims=[Image.open(f) for f in fs]; w,h=ims[0].size; cols=min(8,len(ims)); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*(h+16)),'#333'); dr=ImageDraw.Draw(S)
for i,(f,im) in enumerate(zip(fs,ims)):
    x=(i%cols)*w; y=(i//cols)*(h+16); S.paste(im,(x,y+16)); dr.text((x+3,y+2),f.rsplit('_',1)[1][:-4]+'s',fill='yellow')
S.save(out,quality=82)
