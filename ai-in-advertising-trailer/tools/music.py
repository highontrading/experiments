"""Generate the score with ElevenLabs Music using a section plan locked to a 125 BPM grid.
usage: python3 music.py OUT.mp3 [seed]"""
import os, sys, json, urllib.request
G = ["dark cinematic electronic trailer score", "125 BPM", "A minor", "deep distorted sub bass",
     "glitchy digital textures", "tense, premium, modern tech documentary", "instrumental"]
NEG = ["vocals", "singing", "lyrics", "acoustic guitar", "happy", "cheesy EDM drops", "orchestral choir"]
S = [
 ("cold open drone",  11040, ["huge cinematic sub booms every two beats", "low sustained distorted drone", "glitch stutters", "no hi-hats, no four-on-the-floor"], ["four on the floor kick", "melody"]),
 ("groove one",        3360, ["punchy four-on-the-floor kick enters", "driving pulsing dark synth bass", "tight hats"], ["melody"]),
 ("breakdown one",     7200, ["drums stop completely", "cold digital pads", "data glitch textures", "rising tension, reverse swells at the end"], ["kick", "drums"]),
 ("drop one",          5760, ["hard four-on-the-floor kick on every beat", "aggressive dark synth bass", "metallic percussion", "high energy"], ["melody"]),
 ("breakdown two",     6240, ["drums out", "pulsing sub bass only", "filtered textures", "build tension to a hit"], ["kick", "drums"]),
 ("drop two",          5760, ["four-on-the-floor kick returns hard", "dark driving bass", "glitch fills"], ["melody"]),
 ("breakdown three",   9600, ["no drums", "wide dark atmospheric pads", "slow rising synth swell", "anticipation, something big is coming"], ["kick", "drums"]),
 ("final drop",        9600, ["full energy four-on-the-floor", "rising synth arpeggios", "huge sub bass", "triumphant but dark"], []),
 ("outro tail",        3360, ["music stops, one final boom", "long reverb tail fading to silence"], ["drums"]),
]
plan = {"positive_global_styles": G, "negative_global_styles": NEG,
        "sections": [{"section_name": n, "positive_local_styles": p, "negative_local_styles": ng, "duration_ms": d, "lines": []} for n, d, p, ng in S]}
body = {"composition_plan": plan, "model_id": "music_v1"}
if len(sys.argv) > 2: body["seed"] = int(sys.argv[2])
req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", data=json.dumps(body).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try:
    r = urllib.request.urlopen(req, timeout=600); open(sys.argv[1], "wb").write(r.read()); print("ok", sum(s[1] for s in S) / 1000, "s")
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read()[:600])
