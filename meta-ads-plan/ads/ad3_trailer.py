"""Ad 3 · AIA_TRAILER_VID_v1 · launch trailer reframed to 4:5 with hook + price bars, plus end card."""
import os, sys, subprocess
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import numpy as np
import adkit as K

R = os.path.join(os.path.dirname(__file__), "..")
TR = os.path.join(R, "..", "ai-in-advertising-trailer")
SRC = os.path.join(TR, "out", "ai_in_advertising_trailer_v2.mp4")
if not os.path.exists(SRC): SRC = os.path.join(TR, "out", "ai_in_advertising_trailer_v2_preview.mp4")
OUT = os.path.join(R, "out"); os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1350
VW, VH = 1080, 608; VY = 372
TDUR = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
TDUR = min(TDUR, 55.0)                        # drop the trailer's own silent tail
CARD_D = 3.6
DUR = TDUR + CARD_D


def chrome(t):
    from PIL import Image
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    top = K.text_layer(W, H, [[("Advertising", "plain")], [("just changed.", "lime")]], 52, 1.0, size=132)
    im.alpha_composite(top)
    bot = K.text_layer(W, H, [[("AI & ADVERTISING · 11 MODULES · ₹2,999", "mono")]], VY + VH + 70, 1.0, msize=36)
    im.alpha_composite(bot)
    sub = K.text_layer(W, H, [[("by Ideabro Studio · lifetime access", "plain")]], VY + VH + 150, 1.0, size=52, shadow=False)
    im.alpha_composite(sub)
    return im


def frames():
    layer = chrome(0); base = np.zeros((H, W, 3), np.uint8); base[:] = (8, 8, 8)
    base = K.over(base, layer)
    step = 5.0; t = 0.0
    while t < TDUR - 1e-6:
        d = min(step, TDUR - t)
        fr = K.decode(SRC, t, d, VW, VH)
        for f in fr[:int(round(d * K.FPS))]:
            out = base.copy(); out[VY:VY + VH] = f; yield out
        t += d
    th = [K.decode(os.path.join(R, "assets", "studio", n), tt, 0.05, 460, 620)[0] for n, tt in
          [("1794509925138-fb291663-4730-49f2-b5ae-4cee07e984f0.mp4", 3.0), ("1794509925138-86bd528b-324c-449d-b922-04b5b4f9e34c.mp4", 9.0),
           ("1794509925138-af27720d-5b41-42e7-b5fa-284e5cd2c945.mp4", 4.0)]]
    for i in range(int(round(CARD_D * K.FPS))):
        yield K.endcard_frame(W, H, i / K.FPS, th)


if __name__ == "__main__":
    vid = os.path.join(OUT, "_ad3_video.mp4"); wav = os.path.join(OUT, "_ad3.wav")
    n = K.write_video(vid, frames(), W, H)
    K.mix_audio(wav, DUR, music=(SRC, 0.0, 0.01, 0.6), sfx=[(os.path.join(TR, "generated", "sfx", "boom.mp3"), TDUR, -6)], music_gain=0)
    K.mux(vid, wav, os.path.join(OUT, "AIA_TRAILER_VID_v1_4x5.mp4"))
    print("frames", n, "dur", round(DUR, 2))
