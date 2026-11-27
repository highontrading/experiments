"""Build .vibe/jobs/raw1/edit.json — Blue Glow edit of the studio-rebrand talk."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "blueglow"))
import lockup as L  # noqa: E402

WS = os.path.dirname(HERE)
H = 1920
ev = []

# ---------------------------------------------------------------- transitions (A-roll side of the vertical push)
PUSH = 0.30
OUTS = [10.05, 36.20]      # talking head drops out downward
INS = [13.00, 42.73]       # talking head rises back in from below


def sm(a):
    p = f"clip((t-{a:.3f})/{PUSH},0,1)"
    return f"({p}*{p}*(3-2*{p}))"


terms = [f"between(t,{a:.3f},{a + PUSH:.3f})*(ih/3)*{sm(a)}" for a in OUTS]
terms += [f"(0-between(t,{a:.3f},{a + PUSH:.3f})*(ih/3)*(1-{sm(a)}))" for a in INS]
off = "+".join(terms)
blur_en = "+".join(f"between(t,{a + 0.03:.3f},{a + PUSH - 0.03:.3f})" for a in OUTS + INS)
push_filter = (f"pad=iw:ih*3:0:ih:color=0x04102A,crop=iw:ih/3:0:'ih/3-({off})',"
               f"dblur=angle=90:radius=30:enable='{blur_en}'")
ev.append({"type": "filter", "at": 0, "dur": 60, "filter": push_filter})

# scenes (pre-rendered navy grid backgrounds that push in from the top and leave upward)
ev.append({"type": "overlay", "file": "bg_scene1.mov", "at": 9.75, "dur": 3.55, "size": 1.0, "x": 0.5, "y": 0.5})
ev.append({"type": "overlay", "file": "bg_scene2.mov", "at": 35.90, "dur": 7.13, "size": 1.0, "x": 0.5, "y": 0.5})

# opening focus pull
ev.append({"type": "rack_focus", "at": 0, "dur": 0.26, "direction": "in", "amount": 26})

# ---------------------------------------------------------------- chest lock-ups (A-roll)
Y = 0.655
K = 54  # kicker size


def kick(t, at, **kw):
    return dict({"segs": [{"text": t, "font": "kicker", "grad": "flat"}], "size": K, "at": at, "spread": 0.35}, **kw)


def hero(t, at, grad="cyan", font="serif", size=200, **kw):
    return dict({"segs": [{"text": t, "font": font, "grad": grad}], "size": size, "at": at}, **kw)


def sub(t, at, grad="white", size=58):
    return {"segs": [{"text": t, "font": "kicker", "grad": grad}], "size": size, "at": at, "tuck": True}


ev += L.lockup([kick("A true appreciation for", 1.16), hero("Japanese", 2.48), sub("culture", 2.84)],
               out=3.42, y=Y, seed=1, max_w=0.58)
ev += L.lockup([kick("Into our", 4.90),
                {"segs": [{"text": "Studio  ", "font": "sans", "grad": "cyan"},
                          {"text": "Style", "font": "serif", "grad": "white"}], "size": 150, "at": 5.70}],
               out=6.60, y=Y, seed=2, max_w=0.60)
ev += L.lockup([kick("It made sense to have a", 7.18), hero("Rebrand", 8.66), sub("& a retreat", 9.52)],
               out=9.90, out_dur=0.12, y=Y, seed=3, max_w=0.58)
ev += L.lockup([kick("I really love the different", 13.74), hero("Elements", 14.56), sub("& texture", 15.28)],
               out=16.40, y=Y, seed=4, max_w=0.58)

# over b-roll B (her back in the black blazer)
ev += L.lockup([kick("We love to incorporate", 30.07, size=46), hero("Ceramics", 30.79, size=170)],
               out=32.40, y=0.70, x=0.40, seed=5, max_w=0.44)
ev += L.lockup([kick("Quite a few", 33.55), hero("Urns", 34.15, size=220), sub("on the wall & shelves", 34.95, size=42)],
               out=35.90, out_dur=0.15, y=0.70, x=0.42, seed=6, max_w=0.46)

ev += L.lockup([kick("Designed to make you feel", 43.84), hero("Relaxed", 45.10), sub("& calm", 45.98)],
               out=46.28, out_dur=0.12, y=Y, seed=7, max_w=0.58)
ev += L.lockup([kick("We can't wait to", 46.94),
                {"segs": [{"text": "Welcome ", "font": "sans", "grad": "cyan"},
                          {"text": "you", "font": "serif", "grad": "white"}], "size": 150, "at": 47.46}],
               out=48.40, out_dur=0.25, out_mode="fade", y=Y, seed=8, max_w=0.62)

# ---------------------------------------------------------------- scene 1: "the perfect opportunity"
ev += L.plain_type("and I thought that was the", 10.42, 11.18, y=0.40, size=60, per_char=0.028)
ev += L.lockup([hero("Perfect", 11.30, grad="gold", size=220, order="ltr", spread=0.28),
                {"segs": [{"text": "Opportunity", "font": "serif", "grad": "white"}], "size": 118, "at": 11.60,
                 "order": "ltr", "spread": 0.45}],
               out=12.80, out_dur=0.15, y=0.42, seed=9, max_w=0.70, gap=0.10)
# gold 4-point sparkle at the top-right of "Perfect"
pw = L.text_w("Perfect", "dm-serif", 220)
sx, sy = 540 + pw / 2 + 18, 0.42 * H - 150
star = "m 0 -60 b 7 -12 12 -7 60 0 b 12 7 7 12 0 60 b -7 12 -12 7 -60 0 b -12 -7 -7 -12 0 -60"
for glow in (True, False):
    col = "&H4ACFFF&" if glow else "&HC2F4FF&"
    blur = "\\blur10\\alpha&H40&" if glow else "\\blur0.8"
    ev.append({"type": "ass", "at": 11.62, "dur": 1.30, "sfx": False, "layers": [{
        "start": 0, "layer": 14 if not glow else 13, "shape": True, "color": "#FFFFFF",
        "text": f"{{\\an5\\pos({sx:.0f},{sy:.0f})\\p1\\1c{col}{blur}\\bord0\\shad0\\fscx0\\fscy0\\frz-30"
                f"\\t(0,220,\\fscx115\\fscy115\\frz0)\\t(220,340,\\fscx100\\fscy100)\\t(340,1300,\\frz25)"
                f"\\t(1050,1200,\\alpha&HFF&)}}{star}"}]})

# ---------------------------------------------------------------- scene 2: search pill + "warm natural inviting"
PY = int(0.36 * H)
PW, PH = 900, 118
t_in, t_exit = 36.48, 39.12
R = PH / 2
rr = (f"m {R:.0f} 0 l {PW - R:.0f} 0 b {PW + 4:.0f} 0 {PW + 4:.0f} {PH} {PW - R:.0f} {PH} l {R:.0f} {PH} "
      f"b -4 {PH} -4 0 {R:.0f} 0")
PX0, PY0 = 540 - PW // 2, PY - PH // 2
exit_ms = int((t_exit - t_in) * 1000)
mv = (f"\\move({PX0},{PY0},{PX0 + 240},{-260 - PH // 2},{exit_ms + 160},{exit_ms + 420})\\org(540,{PY})"
      f"\\t({exit_ms},{exit_ms + 260},\\frz-8)\\t({exit_ms + 200},{exit_ms + 420},\\blur14)")
pill_dur = t_exit - t_in + 0.45
ev.append({"type": "ass", "at": t_in, "dur": pill_dur, "sfx": False, "layers": [
    {"start": 0, "layer": 10, "shape": True, "color": "#0A1C3F",
     "text": f"{{\\an7{mv}\\p1\\1c&H3F1C0A&\\1a&H28&\\bord2.5\\3c&HA86E3A&\\shad0\\alpha&HFF&\\fscx92\\fscy92"
             f"\\t(0,200,\\alpha&H00&\\fscx100\\fscy100)\\1a&H28&}}{rr}"}]})
# comet light sweeping along the bottom edge (3 passes)
for k in range(3):
    a = t_in + 0.15 + k * 0.82
    ev.append({"type": "ass", "at": a, "dur": 0.8, "sfx": False, "layers": [
        {"start": 0, "layer": 11, "shape": True, "color": "#7FDCFF",
         "text": f"{{\\an7\\move({PX0 + 20},{PY0 + PH - 4},{PX0 + PW - 280},{PY0 + PH - 4},0,780)"
                 f"\\p1\\1c&HFFDC7F&\\blur5\\bord0\\shad0\\alpha&HFF&\\t(0,120,\\alpha&H00&)\\t(620,780,\\alpha&HFF&)}}"
                 f"m 0 0 l 260 0 l 260 6 l 0 6"}]})
# typed text synced to "sheer curtains from ceiling to floor"
typed = "Sheer curtains, ceiling to floor"
t0, t1 = 36.59, 38.70
parts = []
n = len(typed)
for i, ch in enumerate(typed):
    ms = int((t0 - t_in + (t1 - t0) * i / n) * 1000)
    parts.append(ch if ch == " " else f"{{\\alpha&HFF&\\t({ms},{ms + 40},\\alpha&H00&)}}{ch}")
tx = 540 - PW / 2 + 56
mv_t = (f"\\move({tx:.0f},{PY + 2},{tx + 240:.0f},{-258},{exit_ms + 160},{exit_ms + 420})\\org(540,{PY})"
        f"\\t({exit_ms},{exit_ms + 260},\\frz-8)\\t({exit_ms + 200},{exit_ms + 420},\\blur14)")
ev.append({"type": "ass", "at": t_in, "dur": pill_dur, "sfx": False, "layers": [
    {"start": 0, "layer": 12, "font": "poppins-semibold", "size": 46, "color": "#FFFFFF",
     "text": f"{{\\an4{mv_t}\\bord0\\shad0}}" + "".join(parts)}]})

ev += L.lockup([kick("Filter the light for a", 39.73),
                hero("Warm", 40.99, size=190), hero("Natural", 41.25, grad="white", size=170),
                hero("Inviting", 41.77, font="sans", size=140)],
               out=42.42, out_dur=0.18, y=0.42, seed=10, max_w=0.66, gap=0.16)

# ---------------------------------------------------------------- props
# glass cards over b-roll A (lantern / candle / magazine)
ev.append({"type": "overlay", "file": "cards_style.mov", "at": 17.80, "dur": 3.95, "size": 1.0, "x": 0.5, "y": 0.5})
# glowing material icons on the chest, popping on each word
ev.append({"type": "overlay", "file": "icons_materials.mov", "at": 22.30, "dur": 7.55, "size": 1.0, "x": 0.5, "y": 0.655})

# punch-in jump cut on the closing line
ev.append({"type": "zoom", "style": "punch", "amount": 1.1, "at": 46.34, "dur": 2.39})

# ---------------------------------------------------------------- sound design (no music bed)
S = [(0.0, "bass-drop", 0.55), (0.02, "sparkle", 0.25),
     (10.05, "bass-drop", 0.5), (10.05, "whoosh", 0.35), (11.58, "sparkle", 0.35),
     (13.00, "bass-drop", 0.45), (13.00, "whoosh", 0.3),
     (18.16, "pop", 0.3), (20.24, "pop", 0.3), (20.30, "swish", 0.2), (21.40, "impact", 0.35), (21.40, "swish", 0.3),
     (22.74, "tick", 0.35), (25.30, "tick", 0.35), (27.20, "tick", 0.35), (28.46, "tick", 0.35),
     (36.20, "bass-drop", 0.5), (36.20, "whoosh", 0.35), (36.59, "typing", 0.22), (39.12, "swoosh-up", 0.3),
     (40.99, "sparkle", 0.22), (42.73, "bass-drop", 0.45), (42.73, "whoosh", 0.3), (46.34, "transition-hit", 0.25)]
ev += [{"type": "sfx", "at": t, "name": nme, "volume": v} for t, nme, v in S]

edit = {
    "format": "9:16", "reframe": {"mode": "crop", "x": 0.5, "y": 0.5}, "look": "blue-glow-soft",
    "cuts": {"remove_pauses": True, "max_pause": 0.45, "remove_fillers": True, "drop_words": [], "drop": []},
    "captions": {"enabled": False}, "audio": {"denoise": False, "loudness": -14}, "auto_sfx": False,
    "events": ev, "output": {"name": "studio-rebrand-blueglow"},
}
json.dump(edit, open(os.path.join(WS, ".vibe/jobs/raw1/edit.json"), "w"), indent=1)
print(f"{len(ev)} events written")
