# rembg cutouts -> B&W subject + thick yellow outline, trimmed. usage: tools_cutout.py out_dir in1.png in2.png ...  (or --seq)
import sys, os, numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
from rembg import remove, new_session
out = sys.argv[1]; files = sys.argv[2:]
s = new_session('isnet-general-use')
OUT = int(os.environ.get('OUTLINE', '16')); BOX = os.environ.get('BOX')
os.makedirs(out, exist_ok=True)
for f in files:
    im = Image.open(f).convert('RGB')
    cut = remove(im, session=s, post_process_mask=True)
    a = cut.split()[3]
    a = a.point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.GaussianBlur(0.7))
    g = ImageOps.grayscale(im); g = ImageOps.autocontrast(g, cutoff=1); g = ImageEnhance.Contrast(g).enhance(1.25)
    pad = OUT * 2 + 4
    W, H = im.size
    canvas = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
    big_a = Image.new('L', canvas.size, 0); big_a.paste(a, (pad, pad))
    dil = big_a.filter(ImageFilter.MaxFilter(OUT * 2 + 1 if OUT * 2 + 1 <= 61 else 61)).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 100 else 0).filter(ImageFilter.GaussianBlur(0.8))
    yellow = Image.new('RGBA', canvas.size, (255, 233, 92, 255)); yellow.putalpha(dil)
    canvas = Image.alpha_composite(canvas, yellow)
    subj = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); gg = g.convert('RGBA'); gg.putalpha(a); subj.paste(gg, (pad, pad), gg)
    canvas = Image.alpha_composite(canvas, subj)
    if BOX: bb = tuple(int(v) for v in BOX.split(','))
    else: bb = dil.getbbox()
    canvas.crop(bb).save(os.path.join(out, os.path.basename(f)))
    print(os.path.basename(f), bb, flush=True)
