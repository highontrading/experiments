"""E01 · AIA_SHOOTQUOTE_VID_v1 · D2C founders · 'Just got a quote for a product shoot?' · 9:16 · VO Raj (Indian English)
Captions: BOLD YELLOW (uppercase, active word yellow). Sample shoot quote card -> 'OVER BUDGET' stamp -> AI outputs -> course -> ₹2,999."""
from common import *

W, H = 1080, 1920; OFF = 0.3
words = VO("e01", hl=["AI", "₹2,999", "laptop"], offset=OFF)
def wt(word, after=0.0): return next(w["s"] for w in words if w["w"].lower().strip() == word.lower() and w["s"] >= after)

T_STUDIO, T_PHOTO, T_MODEL, T_CREW = wt("Studio"), wt("Photographer"), wt("Model"), wt("Crew")
T_BILL, T_NOW, T_ONE, T_PRODUCT = wt("The"), wt("Now"), wt("one"), wt("Product", 11)
T_MODELS, T_VIDEO, T_ALL, T_LEARN, T_ONLY = wt("model", 12), wt("video"), wt("all", 14), wt("Learn"), wt("Only")
VO_END = words[-1]["e"]; CARD = VO_END + 0.5; DUR = CARD + 3.6

LINES = [("Studio · 1 day", "₹25,000", T_STUDIO), ("Photographer", "₹30,000", T_PHOTO), ("Model · per day", "₹20,000", T_MODEL), ("Crew + edit", "₹25,000", T_CREW)]


def invoice(t):
    """sample shoot quote card, slides in at 0.5s; lines appear as spoken; stamp at 'fast'"""
    cw, ch = 880, 760; im = Image.new("RGBA", (cw + 30, ch + 30), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 18, cw + 14, ch + 18], 26, fill=(0, 0, 0, 110))
    d.rounded_rectangle([0, 0, cw, ch], 26, fill=(252, 250, 244, 255))
    f = F("JetBrainsMono", 30, 700); d.text((48, 44), "SAMPLE SHOOT QUOTE", font=f, fill=(150, 150, 150, 255))
    d.text((cw - 48 - d.textlength("#0427", font=f), 44), "#0427", font=f, fill=(150, 150, 150, 255))
    d.line([(48, 104), (cw - 48, 104)], fill=(220, 216, 205, 255), width=3)
    y = 140; fl = F("Inter", 46, 600); fr = F("Poppins-SemiBold", 46)
    for name, amt, ts in LINES:
        a = ease((t - ts + 0.05) / 0.2)
        if a <= 0: y += 96; continue
        d.text((48 + 30 * (1 - a), y), name, font=fl, fill=INK + (int(255 * a),))
        draw(d, (cw - 48 - text_w(d, amt, fr), y - 4), amt, fr, INK + (int(255 * a),)); y += 96
    a = ease((t - T_BILL) / 0.25)
    if a > 0:
        d.line([(48, y + 10), (cw - 48, y + 10)], fill=INK + (255,), width=4)
        ft = F("Poppins-Black", 74); draw(d, (48, y + 36), "TOTAL", ft, INK + (int(255 * a),))
        s = "₹1,00,000+"; draw(d, (cw - 48 - text_w(d, s, ft), y + 36), s, ft, (214, 40, 40, int(255 * a)))
    st = (t - (T_BILL + 0.9)) / 0.18
    if st > 0:      # stamp slams in
        sc = 1.0 + 0.8 * (1 - ease(st)); stamp = Image.new("RGBA", (640, 190), (0, 0, 0, 0)); sd = ImageDraw.Draw(stamp)
        sd.rounded_rectangle([6, 6, 634, 184], 18, outline=(214, 40, 40, 235), width=12)
        fs = F("Anton-Regular", 120); s = "OVER BUDGET"; sd.text(((640 - sd.textlength(s, font=fs)) / 2, 18), s, font=fs, fill=(214, 40, 40, 235))
        stamp = scale_img(stamp.rotate(12, expand=True, resample=Image.BICUBIC), sc)
        im.alpha_composite(stamp, (int(cw / 2 - stamp.width / 2), int(ch / 2 - stamp.height / 2 + 40)))
    return im


def invoice_ov(frame, t):
    if not (0.4 <= t < T_NOW + 0.25): return frame
    k = ease((t - 0.4) / 0.35); out_k = ease((t - T_NOW) / 0.25)
    card = invoice(t); y = int(250 + 700 * (1 - k)) - int(1400 * out_k)
    return over(frame, card, ((W - card.width) // 2, y))


def price_ov(frame, t):
    if not (T_ONLY - 0.1 <= t < CARD): return frame
    k = (t - T_ONLY + 0.1); sc = 1 + 0.5 * (1 - ease(k / 0.18))
    lay = text_block(W, H, ["ONLY"], 560, "Anton-Regular", 120, WHITE, anim=k / 0.15)
    frame = over((frame * 0.55).astype(np.uint8), lay)
    big = text_block(W, 520, ["₹2,999"], 40, "Poppins-Black", int(230 * sc), YELLOW, anim=k / 0.12, stroke=6)
    return over(frame, big, (0, 650))


phone_seg = phone_scroll([(0, 2300), (6140, 7900)], ST(41274), 3.0, cy=0.40)


segs, t = seq(0, [
    (T_STUDIO, C(ST(44119), 1.0, 0.5), "dip"),
    (T_PHOTO - T_STUDIO, C(ST(3249), 2.0, 0.45)),
    (T_MODEL - T_PHOTO, C(ST(2374), 3.0, 0.5)),
    (T_CREW - T_MODEL, C(ST(50639), 2.0, 0.55)),
    (T_BILL - T_CREW, C(ST(1512), 8.0, 0.5)),
    (T_NOW - T_BILL, C(ST(29467), 4.0, 0.5, z=(1.0, 1.12))),
    (T_ONE - T_NOW, C(S["V08"], 0.2, 0.5, mode="blurfit"), "whip"),
    (T_PRODUCT - T_ONE, C(S["V13"], 1.0, 0.5)),
    (T_MODELS - T_PRODUCT, C(S["V09"], 4.5, 0.5)),
    (T_VIDEO - T_MODELS, C(S["V07"], 1.0, 0.5)),
    (T_ALL - T_VIDEO, C(S["V11"], 4.0, 0.45)),
    (T_LEARN - T_ALL, C(ST(41274), 2.0, 0.5)),
    (T_ONLY - T_LEARN, phone_seg, "whip"),
    (CARD - T_ONLY, C(S["V13"], 5.0, 0.5, z=(1.1, 1.2)), "flash"),
])
thumbs = thumbs_from([(S["V13"], 3.0, 0.5), (S["V09"], 9.0, 0.5), (S["V11"], 4.0, 0.45)], 400, 540)
segs.append(end_seg(CARD, DUR - CARD, lambda k: end_yellow(W, H, k, thumbs, headline=("Skip the shoot.", "Learn to", "direct AI."))))

caps = Caps(W, H, words, style="bold_yellow", y=1300)
ovs = [cap_ov(caps, CARD, cap_until=T_ONLY - 0.1), invoice_ov, price_ov]
audio = dict(music=(MU("hype.mp3"), 0.0, 0.3, 1.5), vo=(vo_path("e01"), OFF),
             sfx=[(SF("pop.mp3"), ts, -6) for _, _, ts in LINES] + [(SF("stamp.mp3"), T_BILL + 0.9, -2), (SF("swoosh.mp3"), T_NOW - 0.1, -6),
                  (SF("boom.mp3"), T_ONLY, -6), (SF("ding.mp3"), CARD + 0.6, -8)],
             music_gain=-11, vo_gain=2)

if __name__ == "__main__":
    out = os.path.join(OUT, "AIA_SHOOTQUOTE_VID_v1_9x16.mp4")
    print(render(out, W, H, segs, ovs, audio)); sheet(out)
