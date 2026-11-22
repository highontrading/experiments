"""Generates assets/city.png - a night city seen from a high window: deep blue sky, building
silhouettes with warm/cool lit windows, a few street-light points. It is mapped on an emissive
card far behind the window; depth of field turns the lit windows into bokeh discs."""
import os, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(11)
HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 2048, 1024
im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
for y in range(H):                      # sky: deep navy at top -> murky blue-violet haze at the horizon
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(6 + 26 * t ** 2), int(10 + 26 * t ** 2), int(26 + 40 * t ** 1.5)))
WARM = [(255, 190, 110), (255, 210, 150), (255, 170, 90), (250, 225, 190)]
COOL = [(170, 205, 255), (140, 180, 240), (220, 235, 255)]
for layer, (base, hmin, hmax, shade, lit_p) in enumerate([(0.62, 0.15, 0.40, (14, 17, 28), 0.10),
                                                           (0.72, 0.10, 0.55, (9, 11, 18), 0.16),
                                                           (0.82, 0.05, 0.62, (5, 6, 10), 0.22)]):
    x = random.randint(-60, 0)
    while x < W:
        bw = random.randint(70, 190); top = int(H * (base - random.uniform(hmin, hmax)))
        d.rectangle([x, top, x + bw, H], fill=shade)
        if random.random() < 0.3: d.rectangle([x + bw // 3, top - random.randint(20, 60), x + bw // 3 + 6, top], fill=shade)
        wx, wy = 10 + layer * 2, 14 + layer * 3
        for yy in range(top + 12, H - 10, wy):
            for xx in range(x + 8, x + bw - 8, wx):
                if random.random() < lit_p:
                    c = random.choice(WARM if random.random() < 0.7 else COOL)
                    k = random.uniform(0.35, 1.0)
                    d.rectangle([xx, yy, xx + wx // 2, yy + wy // 2], fill=tuple(int(v * k) for v in c))
        x += bw + random.randint(-10, 25)
for i in range(60):                     # street lights / car lights near the bottom
    xx = random.randint(0, W); yy = random.randint(int(H * 0.86), H - 6); r = random.randint(2, 5)
    d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=random.choice([(255, 180, 90), (255, 90, 60), (255, 230, 200)]))
glow = im.filter(ImageFilter.GaussianBlur(14))
im = Image.blend(im, glow, 0.25)
os.makedirs(os.path.join(HERE, 'assets'), exist_ok=True)
im.save(os.path.join(HERE, 'assets', 'city.png')); print('wrote assets/city.png')

# assets/film_label.png - a generic (unbranded) 35 mm cartridge wrap: wraps once around the cylinder UVs
from PIL import ImageFont
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
lw, lh = 1024, 256
lab = Image.new('RGB', (lw, lh), (196, 150, 38)); d = ImageDraw.Draw(lab)
d.rectangle([0, 0, lw, 40], fill=(28, 24, 20)); d.rectangle([0, lh - 40, lw, lh], fill=(28, 24, 20))
d.rectangle([0, 96, lw, 112], fill=(150, 30, 22))
for x0 in (40, 560):
    d.text((x0, 120), "NOCTA 400", font=F(64), fill=(25, 20, 15))
    d.text((x0 + 4, 52), "35mm  COLOR NEGATIVE  36 EXP", font=F(30), fill=(40, 30, 15))
for x in range(0, lw, 12): d.line([(x, lh - 34), (x, lh - 8)], fill=(90, 80, 60), width=2)
lab = lab.filter(ImageFilter.GaussianBlur(0.8))
lab.save(os.path.join(HERE, 'assets', 'film_label.png')); print('wrote assets/film_label.png')
