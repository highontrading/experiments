"""Batch 3 · three trailer ads in the winning AIA_TRAILER_VID_v1 format (4:5).
Each 16:9 trailer from the Drive folder plays in a centred band. Above it: a two-line serif hook. Below it: a caption line
(T2/T3 only: their in-frame kinetic text is too small at feed size), the mono price bar and a sub line. Ends on a 3.6 s end card.

usage: python3 ads3/trailer_ads.py [t1|t2|t3 ...] [--stills t,t,...]"""
import os, sys, json, functools
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
import numpy as np, cv2
from PIL import Image, ImageDraw
import adkit as K
import adkit2 as A2

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = lambda n: os.path.join(R, "assets", "trailers3", n)
OUT = os.path.join(R, "out3"); os.makedirs(OUT, exist_ok=True)
W, H, FPS, CARD_D = 1080, 1350, 30, 3.6
INK, WHITE, LIME, PINK, YELLOW = K.INK, K.WHITE, K.LIME, K.PINK, A2.YELLOW

# ------------------------------------------------------------------ captions (display text, start s)
T2_CAPS = [
    (0.00, "Advertising has always"), (1.24, "followed the same pattern."), (3.04, "A new medium appears."),
    (4.64, "Print. Radio."), (5.86, "Television. The internet."), (7.80, "And every time,"),
    (9.44, "not every brand makes the jump."), (11.80, "Some still book the studio,"), (13.26, "the crew, the three-week shoot."),
    (15.16, "Like it still makes sense."), (16.76, "Others wake up"), (17.40, "inside the new one."), (18.40, "And move."),
    (19.18, "No studio. No crew."), (21.02, "No waiting."), (21.80, "One product photo"), (22.66, "becomes a whole campaign."),
    (24.20, "Right now, AI is that medium."), (26.44, "And the gap between brands"), (28.14, "that direct it"),
    (28.96, "and brands that ignore it"), (30.32, "is growing every single day."), (32.56, "Shoot-quality ads."),
    (34.06, "Without the shoot."), (41.02, "Two kinds of advertisers"), (42.46, "are forming."),
    (43.82, "The ones who shoot."), (45.70, "And the ones who direct."),
]
T3_CAPS = [
    (0.00, "Advertising has always"), (1.06, "followed the same pattern."), (2.66, "A new medium arrives."),
    (4.34, "Print."), (5.16, "Television."), (6.04, "Social."), (7.28, "And every time,"),
    (8.20, "not every brand makes it across."), (10.68, "Some carry the old playbook"), (12.16, "with them, like it still works."),
    (14.50, "Others wake up"), (15.24, "inside the new one"), (16.18, "and ship."), (18.08, "No studio. No crew."),
    (19.92, "They launch the campaign"), (20.96, "before the shoot was even booked."), (23.18, "Right now, AI is that medium."),
    (25.78, "And the gap between"), (26.82, "those who direct it"), (28.00, "and those who just press generate"),
    (29.72, "is widening every single day."), (32.76, "Product shoots. Model shoots."), (35.00, "Campaign films. UGC."),
    (37.74, "Meta ads."), (38.92, "11 modules. 41 lessons."), (42.14, "From the first brief"),
    (42.96, "to a launched campaign."), (45.04, "The tools are easy."), (46.26, "Taste is the skill."),
    (47.86, "Two kinds of advertisers"), (49.22, "are forming."), (50.34, "The line is being drawn."), (52.00, "Which side are you on?"),
]

ADS = {
    "t1": dict(
        name="AIA_TRAILER_HI_SHOOT_VID_v1_4x5", src="T1_youtube_v2.mp4", tdur=75.3,
        hook=[("Ab shoot", None), ("optional hai.", YELLOW)], hsize=132, vy=372, caps=None,
        bar="AI & ADVERTISING · 11 MODULES · ₹2,999", sub="by Ideabro Studio · lifetime access",
        thumbs=[(22.1, 0.5, 1.33), (26.9, 0.5, 1.33), (14.9, 0.5, 1.33)],
        end=("dark", dict(headline=("Shoot-quality ads,", "bina shoot ke."), accent=YELLOW, cta="Enroll karo",
                          sub="11 modules · 41 lessons · lifetime access"))),
    "t2": dict(
        name="AIA_TRAILER_DIRECT_VID_v1_4x5", src="T2_trailer.mp4", tdur=51.0,
        hook=[("Shoot it,", None), ("or direct it?", LIME)], hsize=120, vy=338, caps=(T2_CAPS, LIME, {"AI", "direct", "direct.", "campaign."}),
        bar="AI & ADVERTISING · 11 MODULES · ₹2,999", sub="by Ideabro Studio · lifetime access",
        thumbs=[(17.3, 0.5, 1.33), (23.3, 0.5, 1.33), (47.3, 0.5, 1.33)], thumb_src="T1_youtube_v2.mp4",
        end=("cream", dict(headline=("The ones who shoot.", "And the ones who"), hl="direct.", cta="Enroll now · ₹2,999  →"))),
    "t3": dict(
        name="AIA_TRAILER_SIDE_VID_v1_4x5", src="T3_ideabro.mp4", tdur=54.0,
        hook=[("Which side", None), ("are you on?", PINK)], hsize=120, vy=338, caps=(T3_CAPS, PINK, {"AI", "direct", "ship.", "Taste", "skill."}),
        bar="AI & ADVERTISING · 11 MODULES · ₹2,999", sub="41 lessons · lifetime access",
        thumbs=[(19.7, 0.5, 1.33), (28.1, 0.5, 1.33), (34.1, 0.5, 1.33)], thumb_src="T1_youtube_v2.mp4",
        end=("dark", dict(headline=("Tools are easy.", "Taste is the skill."), accent=PINK, cta="Enroll now",
                          sub="11 modules · 41 lessons · lifetime access", kicker="AI & ADVERTISING · BY IDEABRO STUDIO"))),
}
VW, VH = 1080, 608


# ------------------------------------------------------------------ static chrome
def hook_layer(lines, size):
    """two centred serif lines; a line with a colour gets an ink-text colour box (like the winner's lime box)"""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = K.serif(size)
    asc, desc = f.getmetrics(); bh = int(asc + desc * 0.35); y = 52; pad = 22
    for txt, col in lines:
        w = K.tlen(d, txt, f); x = (W - w) / 2
        if col: d.rectangle([x - pad, y, x + w + pad, y + bh], fill=col + (255,))
        K.draw_text(d, (x, y - int(desc * 0.05)), txt, f, (INK if col else WHITE) + (255,))
        y += bh + 4
    return im, y


def chrome(cfg):
    base = np.zeros((H, W, 3), np.uint8); base[:] = (8, 8, 8)
    im, _ = hook_layer(cfg["hook"], cfg["hsize"])
    vb = cfg["vy"] + VH
    by = vb + (70 if not cfg["caps"] else 128)
    im.alpha_composite(K.text_layer(W, H, [[(cfg["bar"], "mono")]], by, 1.0, msize=36))
    im.alpha_composite(K.text_layer(W, H, [[(cfg["sub"], "plain")]], by + 80, 1.0, size=52, shadow=False))
    return K.over(base, im)


# ------------------------------------------------------------------ caption strip under the video
CAP_H = 92


def cap_font(px): return A2.F("Inter", px, 800)


def build_caps(caps, words, end_t):
    """-> list of (t0, t1, [(word, t_reveal)])"""
    out = []
    for i, (t0, txt) in enumerate(caps):
        t1n = caps[i + 1][0] if i + 1 < len(caps) else end_t
        ws = txt.split(); stt = [w for w in words if t0 - 0.05 <= w[0] < t1n - 0.05]
        if len(stt) == len(ws): times = [w[0] for w in stt]
        else:
            last = stt[-1][0] if stt else t0 + 0.3 * len(ws); times = list(np.linspace(t0, max(t0, last), len(ws)))
        last_end = (stt[-1][1] if stt else times[-1] + 0.4)
        t1 = min(t1n, last_end + 0.9)
        out.append((t0, t1, list(zip(ws, times))))
    return out


@functools.lru_cache(512)
def cap_strip(key, accent, hl):
    """key = (tuple of words, n revealed, fade step 0..6). Returns RGBA strip (W x CAP_H)."""
    ws, n, fstep = key; a = fstep / 6.0
    im = Image.new("RGBA", (W, CAP_H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    px = 50; f = cap_font(px); sp = d.textlength(" ", font=f)
    tw = sum(d.textlength(w, font=f) for w in ws) + sp * (len(ws) - 1)
    if tw > W - 110: px = int(px * (W - 110) / tw); f = cap_font(px); sp = d.textlength(" ", font=f); tw = sum(d.textlength(w, font=f) for w in ws) + sp * (len(ws) - 1)
    x = (W - tw) / 2; asc, desc = f.getmetrics(); y = (CAP_H - asc - desc) / 2 + 4
    for i, w in enumerate(ws):
        ww = d.textlength(w, font=f); on = i < n
        if on and w in hl:
            d.rounded_rectangle([x - 10, y + 2, x + ww + 10, y + asc + desc * 0.55], 8, fill=accent + (int(255 * a),))
            d.text((x, y), w, font=f, fill=INK + (int(255 * a),))
        else:
            d.text((x, y), w, font=f, fill=(WHITE + (int(255 * a),)) if on else (110, 110, 110, int(255 * a)))
        x += ww + sp
    return im


def cap_frame(frame, t, chunks, accent, hl, y):
    for t0, t1, ws in chunks:
        if t0 <= t < t1:
            n = sum(1 for _, tr in ws if tr <= t + 0.02)
            fs = int(min(6, (t - t0) / 0.12 * 6)) if t - t0 < 0.12 else 6
            fo = int(max(0, min(6, (t1 - t) / 0.12 * 6)))
            strip = cap_strip((tuple(w for w, _ in ws), n, min(fs, fo)), accent, frozenset(hl))
            lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); lay.alpha_composite(strip, (0, y))
            return K.over(frame, lay)
    return frame


# ------------------------------------------------------------------ end card
def thumbs_for(cfg):
    src = SRC(cfg.get("thumb_src", cfg["src"]))
    return [K.decode(src, t, 0.05, 460, 620, fx, 0.42, z)[0] for t, fx, z in cfg["thumbs"]]


def end_frame(cfg, k, thumbs):
    kind, kw = cfg["end"]
    if kind == "cream": return K.endcard_frame(W, H, k, thumbs, **kw)
    return A2.end_dark(W, H, k, thumbs, **kw)


# ------------------------------------------------------------------ render
def words_of(cfg):
    p = SRC(cfg["src"].replace(".mp4", "_stt.json"))
    return [(w[0], w[1], w[2].strip()) for s in json.load(open(p)) for w in s["w"]]


def frames(cfg, times=None):
    base = chrome(cfg); vy = cfg["vy"]; src = SRC(cfg["src"]); thumbs = thumbs_for(cfg)
    chunks = build_caps(cfg["caps"][0], words_of(cfg), cfg["tdur"]) if cfg["caps"] else None
    cy = vy + VH + 18

    def compose(fr, t):
        out = base.copy(); out[vy:vy + VH] = fr
        if chunks: out = cap_frame(out, t, chunks, cfg["caps"][1], cfg["caps"][2], cy)
        return out
    if times is not None:
        for t in times:
            if t < cfg["tdur"]: yield compose(K.decode(src, t, 0.04, VW, VH)[0], t)
            else: yield end_frame(cfg, t - cfg["tdur"], thumbs)
        return
    t = 0.0; step = 5.0; tdur = cfg["tdur"]; i = 0
    while t < tdur - 1e-6:
        d = min(step, tdur - t); fr = K.decode(src, t, d, VW, VH)
        for f in fr[:int(round(d * FPS))]:
            yield compose(f, i / FPS); i += 1
        t += d
    for j in range(int(round(CARD_D * FPS))): yield end_frame(cfg, j / FPS, thumbs)


def render(key):
    cfg = ADS[key]; out = os.path.join(OUT, cfg["name"] + ".mp4")
    vid, wav = os.path.join(OUT, f"_{key}_v.mp4"), os.path.join(OUT, f"_{key}.wav")
    n = K.write_video(vid, frames(cfg), W, H); dur = n / FPS
    boom = os.path.join(R, "..", "ai-in-advertising-trailer", "generated", "sfx", "boom.mp3")
    K.mix_audio(wav, dur, music=(SRC(cfg["src"]), 0.0, 0.01, 0.8), sfx=[(boom, cfg["tdur"], -6)], music_gain=0)
    K.mux(vid, wav, out); os.remove(vid); os.remove(wav)
    print(key, out, n, round(dur, 2))


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--stills" in args:
        i = args.index("--stills"); ts = [float(x) for x in args[i + 1].split(",")]; keys = args[:i] or list(ADS)
        for k in keys:
            ims = list(frames(ADS[k], ts))
            sheet = np.concatenate([cv2.resize(x, (W // 2, H // 2)) for x in ims], axis=1)
            p = os.path.join(OUT, f"_stills_{k}.jpg"); Image.fromarray(sheet).save(p, quality=88); print(p)
    else:
        for k in (args or list(ADS)): render(k)
