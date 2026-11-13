"""usage: python3 music_plan.py OUT.mp3 variant  -- composition-plan score with a slow->explosive arc (~56 s)"""
import os, sys, json, urllib.request
v = sys.argv[2]
G = {"a": ["epic hybrid trailer music", "136 BPM", "hard-hitting modern drums", "huge distorted bass", "glitch stutters", "high energy",
           "dopamine rush", "tech hype trailer", "instrumental"],
     "b": ["cinematic electronic trap trailer", "136 BPM", "aggressive 808s and punchy kicks", "bright supersaw synths", "rising arpeggios",
           "euphoric, hype, adrenaline", "premium YouTube tech trailer", "instrumental"]}[v]
NEG = ["vocals", "singing", "lyrics", "acoustic guitar", "slow ballad", "ambient only", "lo-fi"]
S = [("intro tension", 9000, ["slow tense intro", "ticking clock synth pulse", "deep sub hits every two beats", "dark filtered pads rising", "no full drums yet"], ["full drum kit"]),
     ("build", 11000, ["drums enter: driving kick and snare at 136 BPM", "rising synth arpeggio", "growing energy every bar", "snare roll building at the end"], []),
     ("drop one", 17000, ["huge drop", "relentless four-on-the-floor kick with trap hats", "heavy distorted bass", "bright supersaw stabs", "maximum adrenaline"], ["breakdown", "silence"]),
     ("pre-final build", 5000, ["filtered rising build", "fast snare roll", "uplifter riser", "tension peaks"], ["silence"]),
     ("final drop", 11000, ["biggest drop", "everything at full power", "euphoric epic synth lead", "pounding drums", "glitch fills"], ["breakdown"]),
     ("end hit", 3000, ["one massive final impact hit", "long reverb tail fading out"], ["drums"])]
plan = {"positive_global_styles": G, "negative_global_styles": NEG,
        "sections": [{"section_name": n, "positive_local_styles": p, "negative_local_styles": ng, "duration_ms": d, "lines": []} for n, d, p, ng in S]}
body = {"composition_plan": plan, "model_id": "music_v1"}
req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", data=json.dumps(body).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try: open(sys.argv[1], "wb").write(urllib.request.urlopen(req, timeout=600).read()); print("ok", sys.argv[1])
except urllib.error.HTTPError as e: print("HTTP", e.code, e.read()[:400])
