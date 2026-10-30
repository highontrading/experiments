# Timing for every ad: scenes follow the voice lines; the CTA chorus and end card follow the last line.
# Writes build/<ad>/timing.js (window.T for the renderer) and build/<ad>/timing.json (for the mixer).
import json, os, sys
S = json.load(open("script.json"))
L = {l["id"]: l for l in S["lines"]}
def al(i): return json.load(open(f"voice/{i}.json"))["alignment"]
def vdur(i): return al(i)["character_end_times_seconds"][-1]
def wstarts(i):
    """start time of each space-separated word of a line"""
    a = al(i); out = []; cur = False
    for ch, t in zip(a["characters"], a["character_start_times_seconds"]):
        if ch == " ": cur = False
        elif not cur: out.append(t); cur = True
    return out

# scene list: (scene, [lines], gap after the scene's last line)
ADS = {
 "a1": dict(scenes=[("hook", ["a1_1"], .35), ("tags", ["a1_2"], .3), ("night", ["a1_3"], .25), ("cut", ["a1_4"], 1.0),
                    ("pipeline", ["a1_5"], .5), ("langs", ["a1_6"], .3), ("daur", ["a1_7"], .3), ("cta", ["a1_8"], 0)],
            chorus=["ta", "bn", "te", "mr"], lead=.3,
            sfx=[("stamp", "a1_1", 0, .9), ("squish", "a1_1", "w3", .7), ("pop", "a1_2", "w0", .6), ("pop", "a1_2", "w2", .6),
                 ("pop", "a1_2", "w4", .6), ("pop", "a1_2", "w9", .6), ("tick", "a1_3", 0.4, .6), ("whoosh_fast", "a1_4", -.2, .7),
                 ("snip", "a1_4", 1.75, 1), ("snip", "a1_4", 2.05, .9), ("squish", "a1_4", 2.2, .6), ("typing", "a1_5", 0.4, .6),
                 ("chime", "a1_5", 5.2, .6), ("pop", "a1_6", "w0", .6), ("pop", "a1_6", "w3", .6), ("pop", "a1_6", "w6", .6),
                 ("stamp", "a1_7", "w4", .9), ("riser", "a1_8", -1.6, .6), ("chime", "a1_8", "w4", .8)]),
 "a2": dict(scenes=[("phalke", ["a2_1"], .4), ("machines", ["a2_2"], .35), ("same", ["a2_3"], .3), ("experiment", ["a2_4"], .35),
                    ("pipeline", ["a2_5"], .4), ("langs", ["a2_6"], .35), ("cta", ["a2_7"], 0)],
            chorus=["ta", "bn", "te", "gu"], lead=.3,
            sfx=[("projector", "a2_1", 0.2, .5), ("snip", "a2_1", "w12", .9), ("zap", "a2_2", "w0", .8), ("zap", "a2_2", "w4", .8),
                 ("zap", "a2_2", "w6", .8), ("tick", "a2_3", 2.2, .5), ("paper_slide", "a2_3", "w8", .6), ("snip", "a2_3", "w9", .7),
                 ("paper_slide", "a2_3", "w10", .6), ("riser", "a2_4", -0.3, .6), ("zap", "a2_4", "w5", 1), ("stamp", "a2_4", "w6", .9),
                 ("typing", "a2_5", "w5", .6), ("chime", "a2_5", "w10", .7), ("pop", "a2_6", "w8", .6), ("pop", "a2_6", "w9", .6),
                 ("pop", "a2_6", "w10", .6), ("pop", "a2_6", "w11", .6), ("whoosh_soft", "a2_7", -.2, .7), ("chime", "a2_7", "w11", .8)]),
 "a3": dict(scenes=[("hook", ["a3_1"], .35), ("problem", ["a3_2"], .3), ("oneline", ["a3_3"], .35), ("tour", ["a3_4"], .4),
                    ("auto", ["a3_5"], .3), ("future", ["a3_6"], .3), ("cta", ["a3_7"], 0)],
            chorus=["ta", "bn", "te", "mr", "gu", "kn", "ml", "pa"], gap=.62, lead=.3,
            sfx=[("whoosh_soft", "a3_1", 0, .7), ("thud", "a3_1", "w2", .8), ("thud", "a3_1", "w5", .8), ("stamp", "a3_2", "w5", .7),
                 ("stamp", "a3_2", "w8", .7), ("stamp", "a3_2", "w11", .7), ("tick", "a3_2", "w12", .5), ("typing", "a3_3", "w5", .6),
                 ("chime", "a3_3", "w11", .7), ("whoosh_fast", "a3_4", "w0", .6), ("whoosh_fast", "a3_4", "w2", .6),
                 ("whoosh_fast", "a3_4", "w4", .6), ("whoosh_fast", "a3_4", "w6", .6), ("thud", "a3_5", "w0", .8), ("thud", "a3_5", "w1", .8),
                 ("thud", "a3_5", "w2", .8), ("stamp", "a3_6", "w3", .9), ("chime", "a3_7", "w3", .8)]),
 "a4": dict(scenes=[("hook", ["a4_1"], .35), ("problem", ["a4_2"], .35), ("shift", ["a4_3"], .4), ("commands", ["a4_4"], .5),
                    ("clean", ["a4_5"], .3), ("langs", ["a4_6"], .35), ("cta", ["a4_7"], 0)],
            chorus=["mr", "gu", "kn", "ml"], lead=.3,
            sfx=[("squish", "a4_1", 0.1, .5), ("pop", "a4_2", "w0", .6), ("pop", "a4_2", "w1", .6), ("pop", "a4_2", "w2", .6),
                 ("tear", "a4_2", "w4", .9), ("whoosh_soft", "a4_3", "w4", .7), ("snip", "a4_4", "w5", .8), ("chime", "a4_4", "w8", .6),
                 ("pop", "a4_4", "w11", .7), ("typing", "a4_5", 0.2, .5), ("chime", "a4_5", "w8", .6), ("pop", "a4_6", "w0", .5),
                 ("pop", "a4_6", "w3", .5), ("pop", "a4_6", "w5", .5), ("riser", "a4_7", -1.2, .5), ("chime", "a4_7", "w5", .8)]),
 "a5": dict(scenes=[("desk", ["a5_1"], .35), ("stuck", ["a5_2"], .3), ("meet", ["a5_3"], .5), ("prompt", ["a5_4"], .45),
                    ("langs", ["a5_5"], .35), ("done", ["a5_6"], .3), ("cta", ["a5_7"], 0)],
            chorus=["mr", "gu", "ta", "pa"], lead=.3,
            sfx=[("paper_slide", "a5_1", 0.1, .6), ("paper_rustle", "a5_1", "w8", .6), ("paper_slide", "a5_2", "w0", .6),
                 ("pen_tick", "a5_2", "w1", .7), ("pen_tick", "a5_2", "w4", .7), ("tick", "a5_2", "w9", .5), ("whoosh_soft", "a5_3", 0, .7),
                 ("shutter", "a5_3", "w2", .8), ("typing", "a5_4", "w3", .6), ("chime", "a5_4", "w17", .7), ("thud", "a5_5", "w0", .7),
                 ("thud", "a5_5", "w1", .7), ("thud", "a5_5", "w2", .7), ("thud", "a5_5", "w3", .7), ("pen_tick", "a5_6", "w1", .9),
                 ("paper_slide", "a5_6", "w5", .5), ("whoosh_soft", "a5_7", -.2, .6), ("chime", "a5_7", "w6", .8)]),
}

def build(ad):
    A = ADS[ad]; t = A["lead"]; scenes, voices, sfx = [], [], []
    def voice(i, at, role=None):
        a = al(i)
        voices.append(dict(id=i, at=round(at, 3), dur=round(vdur(i), 3), lang=L[i]["lang"], text=L[i]["text"],
                           roman=L[i].get("roman", ""), words=[round(x, 3) for x in wstarts(i)], role=role or "nar"))
    for k, (name, ids, gap) in enumerate(A["scenes"]):
        s0 = 0 if k == 0 else t - 0.25
        for i in ids:
            voice(i, t); t += vdur(i) + (gap if i == ids[-1] else 0.2)
        if scenes: scenes[-1]["dur"] = round(s0 - scenes[-1]["start"], 3)
        scenes.append(dict(name=name, start=round(s0, 3), lines=ids))
    # chorus: each language says "join" in turn, overlapping a little
    t -= 0.0
    c0 = t + 0.35
    for j, lang in enumerate(A["chorus"]):
        voice(f"cta_{lang}", c0 + j * A.get("gap", 0.95), role="chorus")
    end = voices[-1]["at"] + voices[-1]["dur"] + 1.6
    scenes[-1]["dur"] = round(end - scenes[-1]["start"], 3)
    V = {v["id"]: v for v in voices}
    for name, line, off, gain in A["sfx"]:
        v = V[line]
        at = v["at"] + (v["words"][int(off[1:])] if isinstance(off, str) else off)
        sfx.append(dict(name=name, at=round(at, 3), gain=gain))
    T = dict(ad=ad, fps=30, W=1080, H=1920, dur=round(end, 3), scenes=scenes, voices=voices, sfx=sfx, chorus=A["chorus"])
    os.makedirs(f"build/{ad}", exist_ok=True)
    json.dump(T, open(f"build/{ad}/timing.json", "w"), ensure_ascii=False, indent=1)
    open(f"build/{ad}/timing.js", "w").write("window.T = " + json.dumps(T, ensure_ascii=False) + ";\n")
    return T

if __name__ == "__main__":
    for ad in (sys.argv[1:] or ADS):
        T = build(ad)
        print(ad, f"{T['dur']:.1f}s ", " ".join(f"{s['name']}@{s['start']:.1f}" for s in T["scenes"]))
