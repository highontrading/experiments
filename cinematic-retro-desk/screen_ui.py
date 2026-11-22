from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1024,768
im=Image.new('RGB',(W,H),(62,92,96)); d=ImageDraw.Draw(im)
F=lambda s,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono%s.ttf'%('-Bold' if b else ''),s)
# desktop pattern
for y in range(0,H,4): d.line([(0,y),(W,y)],fill=(56,84,88))
# window
x0,y0,x1,y1=70,60,954,700
d.rectangle([x0+8,y0+8,x1+8,y1+8],fill=(30,44,46))
d.rectangle([x0,y0,x1,y1],fill=(236,234,226),outline=(30,30,30),width=3)
d.rectangle([x0,y0,x1,y0+44],fill=(214,212,204),outline=(30,30,30),width=3)
for i in range(6): d.line([(x0+10,y0+10+i*5),(x1-10,y0+10+i*5)],fill=(150,150,146))
d.rectangle([x0+380,y0+6,x1-380,y0+38],fill=(214,212,204)); d.text((x0+400,y0+10),"untitled film",font=F(22,True),fill=(20,20,20))
d.rectangle([x0+14,y0+10,x0+38,y0+34],fill=(236,234,226),outline=(30,30,30),width=2)
# menu
d.text((x0+20,y0+56),"File   Edit   Scene   Render   Help",font=F(20),fill=(40,40,40))
d.line([(x0,y0+86),(x1,y0+86)],fill=(60,60,60),width=2)
d.text((x0+30,y0+108),"Describe your film:",font=F(24,True),fill=(25,25,25))
d.rectangle([x0+30,y0+146,x1-30,y0+200],fill=(255,255,252),outline=(40,40,40),width=2)
d.text((x0+46,y0+158),"cool 3D video_",font=F(28),fill=(15,15,15))
# preview pane
d.rectangle([x0+30,y0+226,x1-30,y0+470],fill=(18,20,24),outline=(40,40,40),width=2)
for i in range(0,240,6): d.line([(x0+32,y0+228+i),(x1-32,y0+228+i)],fill=(26,29,34))
d.text((x0+60,y0+252),"> loading skill.md",font=F(22),fill=(120,220,150))
d.text((x0+60,y0+286),"> camera ....... ok",font=F(22),fill=(120,220,150))
d.text((x0+60,y0+320),"> light ........ ok",font=F(22),fill=(120,220,150))
d.text((x0+60,y0+354),"> motion ....... ok",font=F(22),fill=(120,220,150))
d.text((x0+60,y0+388),"> sound ........ ok",font=F(22),fill=(120,220,150))
d.text((x0+60,y0+424),"> rendering frame 0142 / 0192",font=F(22),fill=(240,200,110))
# checkboxes
cx=x0+30
for lab in ["camera","light","motion","sound"]:
    d.rectangle([cx,y0+500,cx+26,y0+526],fill=(255,255,252),outline=(30,30,30),width=2)
    d.line([(cx+5,y0+513),(cx+11,y0+520),(cx+22,y0+504)],fill=(20,20,20),width=4)
    d.text((cx+36,y0+500),lab,font=F(22),fill=(25,25,25)); cx+=200
# button
d.rounded_rectangle([x1-260,y0+560,x1-30,y0+616],radius=12,fill=(236,234,226),outline=(20,20,20),width=4)
d.text((x1-218,y0+573),"Generate",font=F(26,True),fill=(15,15,15))
d.text((x0+30,y0+580),"Skill: 3D-ANIMATOR.md",font=F(20),fill=(70,70,70))
im=im.filter(ImageFilter.GaussianBlur(0.6))
# scanlines
px=im.load()
for y in range(0,H,3):
    for x in range(W):
        r,g,b=px[x,y]; px[x,y]=(int(r*.82),int(g*.82),int(b*.82))
# CRT vignette + phosphor softness
import math
vig=Image.new('L',(W,H),0); vd=ImageDraw.Draw(vig)
for i in range(60):
    a=int(255*(i/60)**0.6); vd.rounded_rectangle([i*2,i*2,W-i*2,H-i*2],radius=80,outline=a,width=3)
vd.rounded_rectangle([120,120,W-120,H-120],radius=60,fill=255)
vig=vig.filter(ImageFilter.GaussianBlur(40))
black=Image.new('RGB',(W,H),(4,6,6))
im=Image.composite(im,black,vig)
glow=im.filter(ImageFilter.GaussianBlur(6))
im=Image.blend(im,glow,0.25)
im.save('assets/screen_ui.png')
