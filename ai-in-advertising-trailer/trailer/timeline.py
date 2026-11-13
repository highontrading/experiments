"""Single source of truth for the AI in Advertising trailer.
v2: cut to one continuous ElevenLabs score (136 BPM, slow intro -> drops). Picture and sound both read this file."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
GEN = os.path.join(ROOT, "generated")  # committed copies of the ElevenLabs VO / music / SFX
A = os.path.join(ROOT, "assets")
FPS, W, H = 25, 1920, 1080
PY0, PH = 107, 866              # 2.21:1 letterbox picture area (rows 107..972)
GRID0, PER = 0.064, 0.4411     # beat grid of the score (136.02 BPM)
BEAT = PER
DUR = 56.0
NF = int(round(DUR * FPS))      # 1400 frames


def T(n):
    """time of beat n of the score"""
    return round(GRID0 + PER * n, 3)


def F(t):
    return int(round(t * FPS))


# ---------------------------------------------------------------- voiceover
VO_DIR = "vo2"   # v2 voice: 1.12x, no long pauses
VO_START = {"l1": 1.36, "l2": 9.85, "l3": 11.70, "l4": 14.30, "l5": 28.35, "l6": 38.00}


def gen_path(kind, name):
    p = os.path.join(B, kind, name)
    return p if os.path.exists(p) else os.path.join(GEN, kind, name)


def vo_words(key):
    d = json.load(open(gen_path(VO_DIR, key + ".json")))
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


# ---------------------------------------------------------------- structure (all on the score's beats)
T_L1, T_BRIDGE, T_MACH, T_MODELS, T_BUILD, T_DROP1 = T(3), T(18), T(22), T(32), T(37), T(48)
T_L5, T_PROOF, T_L6, T_BARRAGE, T_TITLE = T(64), T(77), T(86), T(104), T(110)
T_DROP2, T_STOP, T_FINAL, T_HIT = T(70), T(100), T(102), T(120)
SMEAR0 = T_MODELS - 0.26                 # horizontal smear exit of the ALGORITHMS card
L5_GLITCH0, L5_DARK0 = T_DROP2, T_DROP2 + 0.40   # "FROM MAD MEN TO MIDJOURNEY" glitches out on drop 2
L5_STROBE = 33.50                        # strobe decoder after "prompts"
TITLE0, TITLE_LOCK, TITLE_FADE, T_TAIL = T_TITLE, T(111), T_HIT + 0.40, T_HIT + 1.30
KICK_RANGES = [(T(29), T(37)), (T_DROP1, T_STOP), (T_FINAL, T_HIT + 0.1)]   # where cards/shots pulse on the beat
HITS = [T(0), T(16), T(31), T_DROP1, T(64), T_DROP2, T_FINAL, T_HIT]


def _shots(start_beat, plan):
    """plan: list of (beats, kind, params) laid end to end from start_beat"""
    out, b = [], start_beat
    for nb, kind, p in plan:
        out.append((T(b), T(b + nb), kind, p)); b += nb
    return out


# Footage shots: (start_s, end_s, kind, params).
#   video: src, t (in-point), z=(z0, z1) zoom
#   still: png, r0/r1 = (cx, cy, w) crop in image px (h = w / 2.217)
#   seqv:  dir, i0..i1 frame range across the shot, rect
SHOTS = [
    # ---- cold open (0 - T3): channel-surf flashes on the opening boom
    (0.00, 0.24, "video", dict(src=hd(4332), t=6.0, z=(1.08, 1.16))),
    (0.32, 0.44, "video", dict(src=arc("Televisi1960"), t=1043.6, z=(1.0, 1.04))),
    (0.52, 0.64, "video", dict(src=hd(4447), t=8.0, z=(1.1, 1.14))),
    (0.64, 1.04, "video", dict(src=arc("Designfo1956"), t=97.6, z=(1.02, 1.10))),
    (1.04, T_L1, "video", dict(src=arc("Televisi1960"), t=683.6, z=(1.0, 1.06))),
] + _shots(18, [  # ---- bridge
    (2, "video", dict(src=hd(36897), t=4.0, z=(1.0, 1.08))),
    (1, "video", dict(src=hd(44066), t=5.0, z=(1.05, 1.12))),
    (1, "video", dict(src=hd(22938), t=20.0, z=(1.0, 1.05))),
]) + _shots(37, [  # ---- build montage: cuts accelerate 2 -> 1 -> 1/2 beat into drop 1
    (2, "video", dict(src=hd(23282), t=3.0, z=(1.0, 1.14))),
    (2, "seqv", dict(dir=seq("midjourney_scroll"), i0=10, i1=45, rect=(1100, 560, 1500))),
    (2, "video", dict(src=hd(47792), t=6.0, z=(1.05, 1.18))),
    (1, "seqv", dict(dir=seq("veo_hero"), i0=10, i1=40, rect=(960, 600, 1500))),
    (1, "video", dict(src=hd(5399), t=3.0, z=(1.0, 1.05))),
    (1, "seqv", dict(dir=seq("chatgpt_hd"), i0=30, i1=90, rect=(1120, 380, 1600))),
    (0.5, "video", dict(src=hd(12268), t=4.0, z=(1.0, 1.1))),
    (0.5, "video", dict(src=hd(47050), t=6.0, z=(1.05, 1.15))),
    (0.5, "video", dict(src=hd(4128), t=5.0, z=(1.05, 1.15))),
    (0.5, "video", dict(src=hd(2374), t=4.0, z=(1.0, 1.1))),
]) + _shots(48, [  # ---- drop 1: one shot per beat
    (1, "video", dict(src=hd(23219), t=5.0, z=(1.0, 1.16))),
    (1, "video", dict(src=hd(47257), t=5.0, z=(1.05, 1.14))),
    (1, "still", dict(png=scr("elevenlabs_full.png"), r0=(1440, 1000, 2400), r1=(1600, 1040, 2150))),
    (1, "video", dict(src=hd(221), t=8.0, z=(1.1, 1.22))),
    (1, "still", dict(png=scr("runway_full.png"), r0=(1440, 760, 2600), r1=(1440, 800, 2150))),
    (1, "video", dict(src=hd(20961), t=4.0, z=(1.05, 1.15))),
    (1, "seqv", dict(dir=seq("midjourney_scroll"), i0=40, i1=69, rect=(1250, 600, 1300))),
    (1, "video", dict(src=hd(32989), t=6.0, z=(1.0, 1.12))),
    (1, "still", dict(png=scr("veo_full.png"), r0=(1440, 760, 2400), r1=(1440, 800, 2000))),
    (1, "video", dict(src=hd(8811), t=5.0, z=(1.0, 1.1))),
    (1, "seqv", dict(dir=seq("chatgpt_hd"), i0=80, i1=112, rect=(1300, 380, 1300))),
    (1, "video", dict(src=hd(47051), t=4.0, z=(1.0, 1.12))),
    (1, "still", dict(png=scr("anthropic_full.png"), r0=(1440, 520, 2400), r1=(1440, 560, 2000))),
    (1, "video", dict(src=hd(41157), t=3.0, z=(1.0, 1.1))),
    (1, "seqv", dict(dir=seq("higgsfield_scroll"), i0=0, i1=30, rect=(960, 640, 1500))),
    (1, "seqv", dict(dir=seq("metalib_scroll"), i0=0, i1=20, rect=(860, 560, 1500))),
]) + _shots(77, [  # ---- proof montage: headlines and the Ad Library
    (2, "still", dict(png=scr("meta_wsj_full.png"), r0=(720, 560, 1300), r1=(740, 860, 1100))),
    (1, "video", dict(src=hd(13192), t=4.0, z=(1.0, 1.08))),
    (2, "seqv", dict(dir=seq("metalib_scroll"), i0=20, i1=59, rect=(860, 560, 1500))),
    (1, "still", dict(png=scr("coke_tr_full.png"), r0=(1170, 900, 1150), r1=(1170, 1250, 950))),
    (1, "still", dict(png=scr("adx_full.png"), r0=(1400, 850, 1500), r1=(1400, 880, 1150))),
    (1, "video", dict(src=hd(4401), t=6.0, z=(1.0, 1.08))),
    (1, "still", dict(png=scr("drum_full.png"), r0=(1050, 760, 950), r1=(1050, 770, 820))),
]) + _shots(104, [  # ---- final-drop barrage: half-beat flashes, then a pan
    (0.5, "still", dict(png=scr("wpp_full.png"), r0=(1400, 400, 1500), r1=(1400, 470, 1500))),
    (0.5, "still", dict(png=scr("sm_full.png"), r0=(1100, 620, 1300), r1=(1100, 700, 1300))),
    (0.5, "still", dict(png=scr("veo_full.png"), r0=(1440, 760, 2400), r1=(1440, 820, 2300))),
    (0.5, "seqv", dict(dir=seq("midjourney_scroll"), i0=55, i1=69, rect=(1300, 600, 1100))),
    (0.5, "still", dict(png=scr("coke_tr_full.png"), r0=(1170, 1250, 1000), r1=(1170, 1330, 1000))),
    (0.5, "still", dict(png=scr("meta_wsj_full.png"), r0=(720, 520, 1200), r1=(720, 600, 1200))),
    (0.5, "still", dict(png=scr("anthropic_full.png"), r0=(1440, 520, 2200), r1=(1440, 590, 2200))),
    (0.5, "seqv", dict(dir=seq("higgsfield_scroll"), i0=30, i1=49, rect=(960, 600, 1500))),
    (2, "still", dict(png=scr("metalib_full.png"), r0=(900, 1500, 1500), r1=(1900, 1560, 1500))),
])

# Transition / glitch events on footage: (start_s, end_s, type)
FX = [
    (0.24, 0.32, "black"), (0.44, 0.52, "black"), (0.80, 0.88, "slice"), (0.92, 1.04, "mosh"), (1.28, 1.36, "slice"),
    (T_MACH - 0.12, T_MACH, "slice"), (T(46) - 0.08, T(46), "slice"), (T(47), T(47) + 0.08, "slice"),
    (T_DROP1, T_DROP1 + 0.08, "rgbhit"), (T(56), T(56) + 0.08, "slice"), (T(60), T(60) + 0.08, "rgbhit"),
    (T_PROOF, T_PROOF + 0.08, "rgbhit"), (T(81), T(81) + 0.08, "slice"), (T_BARRAGE, T_BARRAGE + 0.08, "rgbhit"),
]

# Logo row for the reveal (assets/logos_png)
LOGOS = ["openai", "claude", "googlegemini", "meta", "elevenlabs", "googleads"]

# Collage tiles for "THEN CAME THE MACHINES": (dx, dy from centre, src, t)
TILES = [
    (60, -235, hd(23219), 3.0), (-345, 70, hd(47050), 4.0), (-130, 0, hd(20961), 3.0),
    (95, 0, hd(32989), 4.0), (330, -40, hd(47051), 3.0), (-40, 235, scr("midjourney_view.png"), 0),
]

# ---------------------------------------------------------------- sound map
MUSIC = [  # (start, end, file, offset_in_file, gain_db, fade_in, fade_out): one continuous score, no gaps
    (0.00, DUR, "score_v2.mp3", 0.0, 0.0, 0.0, 0.5),
    (1.20, T(31), "bed_E.mp3", 3.0, -6.0, 0.6, 0.25),     # low drone (bed pitched to E) fills the quiet intro/bridge
    (T(36), T_DROP1, "bed_E.mp3", 12.0, -12.0, 0.4, 0.04),  # ...and the build
]
SFX = [  # (time, file, gain_db); for "riser" the time is where it ENDS
    (0.00, "glitch2", -8), (0.24, "glitch1", -10), (0.52, "glitch1", -10), (0.92, "glitch3", -8),
    (4.93, "glitch1", -10), (5.88, "glitch2", -10), (7.08, "glitch3", -9),
    (T_BRIDGE, "whoosh", -9), (T_MACH - 0.12, "glitch2", -8), (11.45, "glitch3", -11), (SMEAR0, "whoosh", -5), (T_MODELS, "glitch1", -11),
    (T(31), "riser", -9), (T_DROP1, "riser", -6), (T(46.5), "glitch2", -12),
    (T_DROP1, "boom2", -5), (T_L5, "boom", -7), (L5_GLITCH0, "glitch3", -5), (L5_STROBE, "zap", -6), (T_PROOF, "boom2", -6),
    (T_L6, "boom", -9), (41.55, "glitch1", -11), (43.90, "glitch2", -10), (T_STOP, "zap", -5), (T_FINAL, "boom2", -3),
    (T_BARRAGE, "whoosh", -9), (T_TITLE, "title", -3), (T_HIT, "boom", -4),
]
