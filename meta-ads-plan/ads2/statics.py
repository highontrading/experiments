"""Five static ads, each in 4:5 (1080x1350, Feed) and 9:16 (1080x1920, Stories/Reels).
S1 VALUE STACK · S2 ONE PHOTO -> CAMPAIGN · S3 HINGLISH COST · S4 TESTIMONIAL · S5 CURRICULUM"""
from common import *

INK2 = (16, 16, 18)


def save(im, name):
    p = os.path.join(OUT, name); im.convert("RGB").save(p, quality=95); print(p); return p


def centered(d, y, s, f, fill, W):
    draw(d, ((W - text_w(d, s, f)) / 2, y), s, f, fill)


def photo(src, t, w, h, fx=0.5, gray=0.0):
    f = frame_at(src, t, w, h, fx).astype(np.float32)
    if gray: g = f.mean(axis=2, keepdims=True); f = g * gray + f * (1 - gray)
    return Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))


def framed(im, r=22, border=3, col=INK):
    w, h = im.size; out = Image.new("RGBA", (w + 2 * border, h + 2 * border), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    d.rounded_rectangle([0, 0, out.width - 1, out.height - 1], r + border, fill=col + (255,)); out.alpha_composite(rounded(im, r), (border, border))
    return out


def drop(base, im, xy, off=(10, 12), col=(80, 70, 140)):
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); a = np.asarray(im)[..., 3]
    s = np.zeros(a.shape + (4,), np.uint8); s[..., :3] = col; s[..., 3] = a; base.alpha_composite(Image.fromarray(s), (xy[0] + off[0], xy[1] + off[1])); base.alpha_composite(im, xy)


def button(base, y, text, W, bg=LIME, fg=INK, size=48, shadow=True):
    b = cta_button(text, "JetBrainsMono", size, bg, fg, pad=(48, 30), radius=14, outline=INK)
    base.alpha_composite(b, ((W - b.width) // 2, y)); return y + b.height


# ------------------------------------------------------------------ S1 value stack (cream, site style)
def s1(W, H):
    tall = H > 1500; im = K.paper(W, H).convert("RGBA"); d = ImageDraw.Draw(im)
    y = 70 if not tall else 120; b = badge("black", 50); im.alpha_composite(b, ((W - b.width) // 2, y)); y += 100
    f = F("InstrumentSerif-Regular", 104 if not tall else 118)
    centered(d, y, "Everything advertising", f, INK, W); y += int(f.size * 0.98)
    s = "needs, in one course."; w = text_w(d, s, f); x = (W - w) / 2; asc, desc = f.getmetrics()
    d.rectangle([x - 16, y + 12, x + w + 16, y + asc + desc * 0.5], fill=PINK); draw(d, (x, y), s, f, INK); y += int(f.size * 1.25)
    tw = (W - 120 - 2 * 24) // 3; th = int(tw * (1.25 if tall else 0.8))
    for i, (src, t, fx) in enumerate([(S["V13"], 3.0, 0.5), (S["V12"], 2.0, 0.5), (S["V11"], 4.0, 0.45)]):
        c = framed(photo(src, t, tw, th, fx)); drop(im, c, (60 + i * (tw + 24), y))
    y += th + (60 if tall else 40)
    items = ["11 modules · 41 lessons", "Product, model, video, UGC & Meta ad workflows", "Prompt library for ad photos and video",
             "Brief, storyboard & campaign templates", "Capstone campaign for your portfolio", "How to price & pitch AI ad services", "Lifetime access + future updates"]
    if not tall: items = items[:6]
    fi = F("Inter", 36 if not tall else 40, 560); rh = 54 if not tall else 76
    for s in items:
        d.rounded_rectangle([86, y + 4, 128, y + 46], 10, fill=LIME, outline=INK, width=3); d.text((95, y - 2), "✓", font=F("Inter", 36, 800), fill=INK)
        draw(d, (156, y), s, fi, INK); y += rh
    y += 20 if not tall else 50
    fp = F("Poppins-Black", 96 if not tall else 120); s = "₹2,999"; centered(d, y, s, fp, INK, W); y += int(fp.size * 1.12)
    centered(d, y, "one-time · instant access · self-paced", F("JetBrainsMono", 30, 500), (90, 90, 90), W); y += 66
    button(im, y, "Enroll now", W)
    return im


# ------------------------------------------------------------------ S2 one photo -> whole campaign (dark)
def s2(W, H):
    tall = H > 1500; im = Image.new("RGBA", (W, H), INK2 + (255,)); d = ImageDraw.Draw(im)
    y = 60 if not tall else 120; b = badge("white", 50); im.alpha_composite(b, ((W - b.width) // 2, y)); y += 96
    f = F("Poppins-Black", 84 if not tall else 96)
    centered(d, y, "1 product photo", f, WHITE, W); y += int(f.size * 1.08)
    s = "into a whole campaign."; centered(d, y, s, f, YELLOW, W); y += int(f.size * 1.3)
    # left: the plain photo; right: 2x2 outputs
    pw = 300 if not tall else 330; ph = int(pw * 1.3)
    gw = W - 60 - pw - 80 - 60; tw = (gw - 16) // 2; th = int(tw * (1.32 if tall else 1.0))
    gy = y; py = gy + (2 * th + 16 - ph) // 2
    pol = Image.new("RGBA", (pw + 30, ph + 90), (255, 255, 255, 255)); pol.paste(photo(S["V09"], 2.0, pw, ph), (15, 15))
    ImageDraw.Draw(pol).text((18, ph + 30), "product.jpg", font=F("JetBrainsMono", 28, 600), fill=(90, 90, 90))
    pol = pol.rotate(4, expand=True, resample=Image.BICUBIC); im.alpha_composite(pol, (40, py - 20))
    ax = 60 + pw + 26; d.text((ax, gy + th - 50), "→", font=F("Inter", 90, 800), fill=YELLOW)
    gx = W - 60 - gw
    for k, (t, fx) in enumerate([(4.6, 0.5), (6.2, 0.5), (9.5, 0.5), (12.0, 0.5)]):
        r, c = divmod(k, 2); tile = framed(photo(S["V09"], t, tw, th, fx), 16, 3, WHITE); im.alpha_composite(tile, (gx + c * (tw + 16), gy + r * (th + 16)))
    y = gy + 2 * th + 16 + (50 if not tall else 80)
    chips = ["PACKSHOTS", "LIFESTYLE", "MODELS", "VIDEO ADS"]; fc = F("JetBrainsMono", 28, 700)
    tot = sum(d.textlength(c, font=fc) + 44 for c in chips) + 12 * 3; x = (W - tot) / 2
    for c in chips:
        w = d.textlength(c, font=fc) + 44; d.rounded_rectangle([x, y, x + w, y + 56], 28, outline=(255, 255, 255, 180), width=2)
        d.text((x + 22, y + 12), c, font=fc, fill=WHITE); x += w + 12
    y += 100 if not tall else 140
    centered(d, y, "Learn it in AI & Advertising · ₹2,999", F("Poppins-SemiBold", 44), WHITE, W); y += 90
    b = cta_button("Enroll now", bg=YELLOW); im.alpha_composite(b, ((W - b.width) // 2, y))
    return im


# ------------------------------------------------------------------ S3 Hinglish cost comparison (yellow/black)
def s3(W, H):
    tall = H > 1500; im = Image.new("RGBA", (W, H), YELLOW + (255,)); d = ImageDraw.Draw(im)
    y = 60 if not tall else 120; b = badge("black", 50); im.alpha_composite(b, ((W - b.width) // 2, y)); y += 100
    f = F("Anton-Regular", 120 if not tall else 140)
    for s in ["EK SHOOT KA KHARCHA", "YA POORI SKILL?"]:
        fs = f
        if text_w(d, s, f) > W - 100: fs = F("Anton-Regular", int(f.size * (W - 100) / text_w(d, s, f)))
        centered(d, y, s, fs, INK, W); y += int(fs.size * 1.04)
    y += 30 if not tall else 60
    cw = (W - 60 * 2 - 30) // 2; ch = int(cw * (1.15 if tall else 0.78))
    for i, (src, t, fx, gray, lab, price, note, col) in enumerate([
            (ST(50639), 2.0, 0.55, 0.85, "EK PRODUCT SHOOT", "₹1,00,000+*", "studio · crew · model", (200, 40, 40)),
            (S["V13"], 3.0, 0.5, 0.0, "POORI SKILL", "₹2,999", "lifetime · 41 lessons", INK)]):
        x = 60 + i * (cw + 30); card = Image.new("RGBA", (cw, ch + 230), WHITE + (255,)); cd = ImageDraw.Draw(card)
        card.paste(photo(src, t, cw - 24, ch - 24, fx, gray), (12, 12))
        cd.text((24, ch + 12), lab, font=F("JetBrainsMono", 30, 700), fill=(110, 110, 110))
        fp = F("Poppins-Black", 74)
        if text_w(cd, price, fp) > cw - 48: fp = F("Poppins-Black", int(74 * (cw - 48) / text_w(cd, price, fp)))
        draw(cd, (24, ch + 52), price, fp, col + (255,))
        if i == 0:
            pw_ = text_w(cd, price, fp); cd.line([(20, ch + 106), (28 + pw_, ch + 96)], fill=(200, 40, 40), width=8)
        cd.text((24, ch + 160), note, font=F("Inter", 30, 500), fill=(90, 90, 90))
        card = rounded(card, 22); drop(im, card, (x, y), (10, 12), INK)
    y += ch + 230 + (40 if not tall else 80)
    centered(d, y, "Product shoot, model shoot, video ad — sab AI se.", F("Poppins-SemiBold", 38 if not tall else 42), INK, W); y += 80
    b = cta_button("Abhi enroll karo", bg=INK, fg=YELLOW); im.alpha_composite(b, ((W - b.width) // 2, y)); y += b.height + 26
    centered(d, y, "*sample estimate: 1-day studio, photographer, model, crew + edit", F("Inter", 24, 500), (70, 60, 10), W)
    return im


# ------------------------------------------------------------------ S4 testimonial (photo + serif quote)
def s4(W, H):
    tall = H > 1500; bg = frame_at(S["V12"], 2.0, W, H, 0.5).astype(np.float32)
    g = np.linspace(0, 1, H)[:, None, None]; bg = bg * (0.95 - 0.65 * np.clip((g - 0.25) / 0.5, 0, 1))
    im = Image.fromarray(bg.astype(np.uint8)).convert("RGBA"); d = ImageDraw.Draw(im)
    y = 60 if not tall else 120; b = badge("white", 50); im.alpha_composite(b, ((W - b.width) // 2, y))
    y = int(H * (0.40 if not tall else 0.45))
    d.text((70, y - 140), "“", font=F("InstrumentSerif-Regular", 300), fill=LIME)
    fq = F("InstrumentSerif-Regular", 76 if not tall else 84)
    lines = ["IdeaBro didn’t just teach", "me tools. It rewired how", "I think about ideas.", "My client work is now at a", "completely different level."]
    for i, s in enumerate(lines):
        if i == 4:
            w = text_w(d, s, fq); d.rectangle([66, y + 14, 74 + w, y + fq.size * 0.98], fill=LIME); draw(d, (70, y), s, fq, INK)
        else: draw(d, (70, y), s, fq, (250, 247, 236))
        y += int(fq.size * 1.08)
    y += 30
    d.ellipse([70, y, 150, y + 80], fill=PINK); d.text((92, y + 20), "AS", font=F("Inter", 32, 800), fill=INK)
    d.text((172, y + 2), "Aryan Sinha", font=F("Inter", 40, 700), fill=WHITE); d.text((172, y + 50), "BRAND DESIGNER · IDEABRO STUDENT", font=F("JetBrainsMono", 24, 600), fill=(210, 210, 210))
    y += 140 if not tall else 190
    d.text((70, y), "AI & Advertising · 11 modules · ₹2,999", font=F("Poppins-SemiBold", 40), fill=WHITE); y += 80
    b = cta_button("Join the course", bg=LIME); im.alpha_composite(b, (70, y))
    return im


# ------------------------------------------------------------------ S5 curriculum (cream magazine)
def s5(W, H):
    tall = H > 1500; im = K.paper(W, H).convert("RGBA"); d = ImageDraw.Draw(im)
    y = 56 if not tall else 110; b = badge("black", 46); im.alpha_composite(b, (60, y))
    d.text((W - 60 - d.textlength("41 LESSONS", font=F("JetBrainsMono", 30, 700)), y + 8), "41 LESSONS", font=F("JetBrainsMono", 30, 700), fill=INK)
    y += 90; f = F("InstrumentSerif-Italic", 108 if not tall else 136); d.text((56, y), "What you’ll learn", font=f, fill=INK); y += int(f.size * 1.08)
    LV = [("LEVEL 1 · THE IMAGE", PINK, ["AI in advertising: the new playbook", "Briefs, strategy and the big idea", "AI product photography", "Models, styling and virtual sets"]),
          ("LEVEL 2 · MOTION & SOUND", LIME, ["AI video ads and campaign films", "Sound, voice and music", "AI UGC and brand ambassadors"]),
          ("LEVEL 3 · THE AGENCY STANDARD", (170, 200, 255), ["Meta ads: statics, variations, testing", "Editing, end cards and brand kits", "Hybrid ads: real shoot + AI", "Capstone: your full campaign"])]
    n = 1; fl = F("JetBrainsMono", 26, 700); fm = F("Inter", 34 if not tall else 38, 560); rh = 46 if not tall else 64
    for lab, col, mods in LV:
        w = d.textlength(lab, font=fl); d.rounded_rectangle([60, y, 60 + w + 36, y + 46], 23, fill=col, outline=INK, width=2); d.text((78, y + 8), lab, font=fl, fill=INK); y += 62
        for m in mods:
            d.text((70, y + 2), f"{n:02d}", font=F("JetBrainsMono", 30, 700), fill=(140, 140, 140)); draw(d, (130, y), m, fm, INK); y += rh; n += 1
        y += 14 if not tall else 30
    y += 6
    tw = (W - 120 - 3 * 16) // 4; th = int(tw * (1.3 if tall else 0.75))
    for i, (src, t, fx) in enumerate([(S["V13"], 3.0, 0.5), (S["V07"], 1.0, 0.5), (S["V02"], 3.0, 0.5), (S["V09"], 9.0, 0.5)]):
        im.alpha_composite(framed(photo(src, t, tw, th, fx), 14), (60 + i * (tw + 16), y))
    y += th + (34 if not tall else 70)
    button(im, y, "Enroll now · ₹2,999", W, size=44)
    return im


if __name__ == "__main__":
    for fn, name in [(s1, "AIA_VALUESTACK_IMG_v1"), (s2, "AIA_ONEPHOTO_IMG_v1"), (s3, "AIA_HI_KHARCHA_IMG_v1"), (s4, "AIA_TESTIMONIAL_IMG_v1"), (s5, "AIA_CURRICULUM_IMG_v1")]:
        save(fn(1080, 1350), name + "_4x5.jpg"); save(fn(1080, 1920), name + "_9x16.jpg")
