"""Compose the score from the drop (t=4.50 s) to the hard stop with ElevenLabs Music (composition plan)."""
import json, os, sys, urllib.request
G = ["cinematic trailer", "dark hybrid trap", "deep 808 sub bass", "orchestral strings and brass stabs",
     "modern tech advertising", "90 BPM", "F# minor", "instrumental", "punchy, polished, wide mix"]
N = ["vocals", "singing", "lyrics", "choir words", "lo-fi", "acoustic guitar", "jazz", "happy pop"]
S = [
 ("Drop and groove", 10900, ["huge sub boom impact on the first beat", "half-time 808 groove", "tight kick and clap", "dark plucked synth ostinato", "low string pulses"], ["silence at start"]),
 ("Breakdown", 3500, ["drums drop out", "filtered pads and a lone high piano ping", "tension", "reverse cymbal swell rising into the last beat"], ["kick", "808"]),
 ("New world", 13800, ["full groove returns, brighter and wider", "808 and kick", "shimmering arpeggiated synth", "string ostinato", "confident forward motion"], []),
 ("Peak", 8900, ["peak energy", "driving drums with fills", "brass stabs on the downbeats", "big 808 slides", "epic"], []),
 ("Final build", 7050, ["massive tension riser", "accelerating hi-hat and snare roll", "rising strings", "white noise riser growing louder to the very end", "ends abruptly at full intensity with no tail"], ["fade out", "outro", "reverb tail"]),
]
plan = {"positive_global_styles": G, "negative_global_styles": N,
        "sections": [{"section_name": n, "duration_ms": d, "positive_local_styles": p, "negative_local_styles": q, "lines": []} for n, d, p, q in S]}
tag = sys.argv[1] if len(sys.argv) > 1 else "a"
req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
    data=json.dumps({"composition_plan": plan, "model_id": "music_v1", "respect_sections_durations": True}).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try:
    r = urllib.request.urlopen(req, timeout=600)
except urllib.error.HTTPError as e:
    print(e.code, e.read()[:600]); sys.exit(1)
open(f"build/music/score_{tag}.mp3", "wb").write(r.read())
print("ok", r.headers.get("song-id"), dict(r.headers).keys())
