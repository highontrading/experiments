import sys
from rembg import remove, new_session
from PIL import Image
sess=new_session(sys.argv[1])
for n in sys.argv[2:]:
    im=Image.open(f'src/{n}.jpg').convert('RGB')
    if max(im.size)>2400:
        s=2400/max(im.size); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    out=remove(im,session=sess,alpha_matting=False)
    out.save(f'cut/{n}.png'); print(n,out.size,flush=True)
