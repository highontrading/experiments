"""Single source of truth for the AI in Advertising trailer.
Grid: 25 fps, 125 BPM -> 1 beat = 0.48 s = 12 frames exactly. Picture and sound both read this file."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
GEN = os.path.join(ROOT, "generated")  # committed copies of the ElevenLabs VO / music / SFX
A = os.path.join(ROOT, "assets")
FPS, W, H = 25, 1920, 1080
PY0, PH = 107, 866              # 2.21:1 letterbox picture area (rows 107..972)
BEAT = 0.48
DUR = 61.92
NF = int(round(DUR * FPS))      # 1548 frames


def F(t):
    return int(round(t * FPS))


# ---------------------------------------------------------------- voiceover
VO_START = {"l1": 2.52, "l2": 13.56, "l3": 15.84, "l4": 19.74, "l5": 27.48, "l6": 39.48}


def gen_path(kind, name):
    p = os.path.join(B, kind, name)
    return p if os.path.exists(p) else os.path.join(GEN, kind, name)


def vo_words(key):
    d = json.load(open(gen_path("vo", key + ".json")))
    a = d["alignment"]; out = []; cur = ""; s = e = None
    for c, a0, a1 in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if c.isalnum() or c == "'":
            if s is None: s = a0
            cur += c; e = a1
        elif cur:
            out.append((cur, s + VO_START[key], e + VO_START[key])); cur = ""; s = None
    if cur: out.append((cur, s + VO_START[key], e + VO_START[key]))
    return out


# ---------------------------------------------------------------- sources
def hd(i): return os.path.join(B, "footage", "hd", f"{i}.mp4")
def arc(n): return os.path.join(B, "footage", "archive", f"{n}.mp4")
def scr(n): return os.path.join(B, "screens", n)
def seq(n): return os.path.join(B, "screens", "seq", n)


# Footage shots: (start_s, end_s, kind, params).
#   video: src, in, [z0, z1] zoom, [dx, dy] drift (fraction of frame), speed
#   still: png, rect0 (cx, cy, w) in image px, rect1, (h = w / 2.217)
#   seqv:  folder, i0, i1 (frame index range mapped across shot), rect
SHOTS = [
    # ---- cold open (0 - 2.40)
    (0.00, 0.24, "video", dict(src=hd(4332), t=6.0, z=(1.08, 1.16))),
    (0.32, 0.44, "video", dict(src=arc("Televisi1960"), t=1043.6, z=(1.0, 1.04), bw=False)),
    (0.52, 0.64, "video", dict(src=hd(4447), t=8.0, z=(1.1, 1.14))),
    (0.64, 1.52, "video", dict(src=arc("Designfo1956"), t=97.6, z=(1.02, 1.10))),
    (1.52, 2.36, "video", dict(src=arc("Televisi1960"), t=683.45, z=(1.0, 1.06))),
    # ---- bridge (11.04 - 13.44)
    (11.04, 11.76, "video", dict(src=hd(36897), t=4.0, z=(1.0, 1.06))),
    (11.76, 12.48, "video", dict(src=hd(44066), t=5.0, z=(1.05, 1.12))),
    (12.48, 13.44, "video", dict(src=hd(22938), t=20.0, z=(1.0, 1.05))),
    # ---- beat montage (21.60 - 27.36): one shot per beat
    (21.60, 22.08, "video", dict(src=hd(23282), t=3.0, z=(1.0, 1.12))),
    (22.08, 22.56, "seqv", dict(dir=seq("midjourney_scroll"), i0=20, i1=50, rect=(1100, 560, 1500))),
    (22.56, 23.04, "video", dict(src=hd(47792), t=6.0, z=(1.05, 1.15))),
    (23.04, 23.52, "seqv", dict(dir=seq("veo_hero"), i0=10, i1=40, rect=(960, 600, 1500))),
    (23.52, 24.00, "video", dict(src=hd(5399), t=3.0, z=(1.0, 1.04))),
    (24.00, 24.48, "seqv", dict(dir=seq("chatgpt_hd"), i0=40, i1=112, rect=(1120, 380, 1600))),
    (24.48, 24.96, "video", dict(src=hd(12268), t=4.0, z=(1.0, 1.1))),
    (24.96, 25.44, "seqv", dict(dir=seq("higgsfield_scroll"), i0=0, i1=40, rect=(960, 600, 1700))),
    (25.44, 25.92, "video", dict(src=hd(47257), t=5.0, z=(1.05, 1.12))),
    (25.92, 26.40, "still", dict(png=scr("elevenlabs_full.png"), r0=(1440, 1000, 2400), r1=(1640, 1050, 2300))),
    (26.40, 26.88, "video", dict(src=hd(221), t=8.0, z=(1.1, 1.2))),
    (26.88, 27.36, "still", dict(png=scr("runway_full.png"), r0=(1440, 760, 2600), r1=(1440, 800, 2200))),
    # ---- proof montage (33.60 - 39.36)
    (33.60, 34.56, "still", dict(png=scr("meta_wsj_full.png"), r0=(720, 560, 1300), r1=(740, 860, 1100))),
    (34.56, 35.04, "video", dict(src=hd(13192), t=4.0, z=(1.0, 1.08))),
    (35.04, 36.00, "seqv", dict(dir=seq("metalib_scroll"), i0=0, i1=59, rect=(860, 560, 1500))),
    (36.00, 36.96, "still", dict(png=scr("coke_tr_full.png"), r0=(1170, 900, 1150), r1=(1170, 1300, 950))),
    (36.96, 37.44, "video", dict(src=hd(8766), t=5.0, z=(1.05, 1.15))),
    (37.44, 38.40, "still", dict(png=scr("adx_full.png"), r0=(1400, 850, 1500), r1=(1400, 880, 1150))),
    (38.40, 38.88, "video", dict(src=hd(4401), t=6.0, z=(1.0, 1.06))),
    (38.88, 39.36, "still", dict(png=scr("drum_full.png"), r0=(1050, 760, 950), r1=(1050, 770, 820))),
    # ---- barrage (48.96 - 51.36)
    (48.96, 49.08, "still", dict(png=scr("wpp_full.png"), r0=(1400, 400, 1500), r1=(1400, 470, 1500))),
    (49.08, 49.20, "still", dict(png=scr("sm_full.png"), r0=(1100, 620, 1300), r1=(1100, 700, 1300))),
    (49.20, 49.32, "still", dict(png=scr("veo_full.png"), r0=(1440, 760, 2400), r1=(1440, 820, 2300))),
    (49.32, 49.44, "seqv", dict(dir=seq("midjourney_scroll"), i0=60, i1=69, rect=(1300, 600, 1100))),
    (49.44, 49.56, "still", dict(png=scr("coke_tr_full.png"), r0=(1170, 1250, 1000), r1=(1170, 1330, 1000))),
    (49.56, 49.68, "still", dict(png=scr("meta_wsj_full.png"), r0=(720, 520, 1200), r1=(720, 600, 1200))),
    (49.68, 49.80, "still", dict(png=scr("anthropic_full.png"), r0=(1440, 520, 2200), r1=(1440, 590, 2200))),
    (49.80, 51.36, "still", dict(png=scr("metalib_full.png"), r0=(900, 1500, 1500), r1=(1900, 1560, 1500))),
]

# Transition / glitch events on footage: (start_s, end_s, type)
FX = [
    (0.24, 0.32, "black"), (0.44, 0.52, "black"),
    (1.24, 1.36, "slice"), (1.40, 1.56, "mosh"), (2.20, 2.32, "slice"),
    (13.32, 13.44, "slice"),
    (49.80, 49.88, "rgbhit"), (21.60, 21.68, "rgbhit"), (33.60, 33.68, "rgbhit"),
]

# Logo row for the reveal (assets/logos_png)
LOGOS = ["openai", "claude", "googlegemini", "meta", "elevenlabs", "googleads"]

# Collage tiles for "THEN CAME THE MACHINES": (dx, dy from centre, src, t)
TILES = [
    (60, -235, hd(23219), 3.0), (-345, 70, hd(47050), 4.0), (-130, 0, hd(20961), 3.0),
    (95, 0, hd(32989), 4.0), (330, -40, hd(47051), 3.0), (-40, 235, scr("midjourney_view.png"), 0),
]

# ---------------------------------------------------------------- sound map
MUSIC = [  # (start, end, file, offset_in_file, gain_db, fade_in, fade_out)
    (0.00, 11.04, "score_a.mp3", 0.00, 0.0, 0.0, 0.04),
    (2.20, 11.04, "bed_a.mp3", 17.0, -8.0, 0.8, 0.06),   # sustained drone under line 1
    (11.04, 14.40, "drums_a.mp3", 0.031, 0.0, 0.0, 0.25),
    (14.40, 18.72, "bed_a.mp3", 3.00, -1.0, 0.25, 0.0),
    (19.68, 21.60, "bed_a.mp3", 8.00, -3.0, 0.40, 0.02),
    (21.60, 27.36, "drums_a.mp3", 0.031 + 3.84, 0.0, 0.0, 0.03),
    (27.36, 33.60, "bed_a.mp3", 10.0, -1.0, 0.05, 0.02),
    (33.60, 39.36, "drums_a.mp3", 0.031, 0.0, 0.0, 0.03),
    (39.36, 48.96, "bed_a.mp3", 14.0, -1.0, 0.05, 0.02),
    (48.96, 58.56, "drums_b_A.mp3", None, 0.0, 0.0, 0.6),
]
SFX = [  # (time, file, gain_db); for "riser" the time is where it ENDS
    (0.00, "glitch2", -6), (0.24, "glitch1", -8), (0.52, "glitch1", -8), (1.24, "glitch2", -8), (1.40, "glitch3", -6),
    (2.20, "glitch1", -8), (2.36, "powerdown", -10),
    (13.32, "glitch2", -6), (13.44, "glitch1", -8), (13.50, "tick", -10),
    (15.60, "glitch3", -9), (18.40, "whoosh", -3), (18.62, "powerdown", -8),
    (19.74, "glitch1", -14), (20.68, "glitch2", -13), (21.60, "riser", -11),
    (21.60, "boom2", -2), (27.36, "boom", -4),
    (29.95, "glitch3", -4), (32.88, "zap", -4), (33.60, "boom2", -2),
    (39.36, "boom", -5), (43.55, "glitch1", -8), (46.50, "glitch2", -7), (46.86, "zap", -3),
    (48.96, "riser", -4), (48.96, "boom2", -1), (49.80, "whoosh", -6),
    (51.36, "powerdown", -9), (51.60, "title", 0), (58.56, "boom", -2),
]
