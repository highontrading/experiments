# One source of truth for when things happen. Writes build/timing.json (for the
# audio mix) and build/timing.js (window.T, for the renderer).
import json, os
VERSION = os.environ.get("VERSION", "en")              # en | hinglish
SUF = "" if VERSION == "en" else "_" + VERSION
# the narrator's three lines per version; scenes always refer to them as en1/en2/en3
NAR = {"en": {"en1": "en1", "en2": "en2", "en3": "en3"}, "hinglish": {"en1": "hx1", "en2": "hx2", "en3": "hx3"}}[VERSION]
S = json.load(open("script.json"))
LINES = {l["id"]: l for l in S["lines"]}
def vdur(i): i = NAR.get(i, i); return json.load(open(f"voice/{i}.json"))["alignment"]["character_end_times_seconds"][-1]

scenes, voices, sfx = [], [], []
def scene(name, dur, **kw):
    start = scenes[-1]["start"] + scenes[-1]["dur"] if scenes else 0.0
    scenes.append(dict(name=name, start=round(start, 3), dur=round(dur, 3), **kw)); return start
def voice(i, at):
    src = NAR.get(i, i)
    a = json.load(open(f"voice/{src}.json"))["alignment"]
    L = LINES[src]
    tr = L.get("hx", L.get("en", "")) if VERSION == "hinglish" else L.get("en", "")
    voices.append(dict(id=i, file=src, at=round(at, 3), dur=round(vdur(i), 3), lang=L["lang"], text=L["text"],
                       en=tr, chars=a["characters"], t0=a["character_start_times_seconds"],
                       t1=a["character_end_times_seconds"]))
def fx(name, at, gain=1.0): sfx.append(dict(name=name, at=round(at, 3), gain=gain))

# 0 · greeting chorus in ten languages over the sky
GREET = ["g_hi", "g_bn", "g_ta", "g_gu", "g_te", "g_mr", "g_pa", "g_kn", "g_ml", "g_or"]
s = scene("greet", 5.9)
for k, g in enumerate(GREET):
    voice(g, s + 0.35 + k * 0.48); fx("pop", s + 0.33 + k * 0.48, 0.5)
fx("whoosh_1", s + 5.2, 0.7)
# 1 · "India speaks in hundreds of languages…"
s = scene("speaks", max(7.7, vdur("en1") + 0.6)); voice("en1", s + 0.25)
# 2 · "Not anymore. Here's an empty timeline…"
s = scene("empty", max(7.2, vdur("en2") + 0.75)); voice("en2", s + 0.2); fx("clip", s + 3.3, 0.8); fx("clip", s + 3.55, 0.6); fx("clip", s + 3.8, 0.6)

# 3–8 · one language each: the shot gets pegged, the voice asks, the edit happens
LANG = [("hi", "ghat"), ("bn", "tram"), ("mr", "local"), ("te", "charminar"), ("ta", "marina"), ("gu", "kites")]
for i, (lang, clip) in enumerate(LANG):
    d = vdur(lang)
    s = scene(lang, 0.75 + d + 3.9, clip=clip, vo=round(0.75 + d, 3))   # vo: local time the voice ends
    voice(lang, s + 0.75)
    fx("clip", s + 0.35, 0.9)
    fx("whoosh_2" if i % 2 else "whoosh_1", s - 0.25, 0.6)
    edit = s + 0.75 + d + 0.35                                            # the edit lands just after the ask
    fx({"hi": "snip", "bn": "pop", "mr": "whoosh_2", "te": "pop", "ta": "pop", "gu": "flutter"}[lang], edit, 0.8)
    fx("clip", s + 0.75 + d + 3.9 - 0.45, 0.5)                            # thumbnail lands on the tracker
# 9 · the finished reel
s = scene("reel", 8.6); fx("whoosh_1", s - 0.2, 0.7)
# 10 · "Six languages. One video…" + "अब edit करो…"
s = scene("outro", 11.2); fx("whoosh_2", s - 0.1, 0.6)
voice("en3", s + 0.5); voice("hi_end", s + 0.5 + vdur("en3") + 0.55)
end = scenes[-1]["start"] + scenes[-1]["dur"]

T = dict(version=VERSION, fps=30, W=1080, H=1920, dur=round(end, 3), scenes=scenes, voices=voices, sfx=sfx, langs=LANG)
os.makedirs("build", exist_ok=True)
json.dump(T, open(f"build/timing{SUF}.json", "w"), ensure_ascii=False, indent=1)
open(f"build/timing{SUF}.js", "w").write("window.T = " + json.dumps(T, ensure_ascii=False) + ";\n")
for sc in scenes: print(f'{sc["name"]:8s} {sc["start"]:6.2f} → {sc["start"] + sc["dur"]:6.2f}')
print("total", round(end, 2), "s")
