"""Generate VO with ElevenLabs eleven_v4 + character timestamps -> build/vo/<ad>_<i>.mp3/.json"""
import json, os, sys, base64, urllib.request
from vo_spec import ADS, V
only = sys.argv[1:]
os.makedirs("build/vo", exist_ok=True)
for ad, spec in ADS.items():
    if only and ad not in only: continue
    L = spec["lines"]
    for i, (cap, tts) in enumerate(L):
        out = f"build/vo/{ad}_{i}"
        if os.path.exists(out + ".json"): continue
        body = {"text": tts, "model_id": "eleven_v4", "language_code": spec["lang"],
                "previous_text": L[i-1][1] if i else None, "next_text": L[i+1][1] if i + 1 < len(L) else None}
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[spec['voice']]}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(body).encode(), headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
        try: d = json.load(urllib.request.urlopen(req, timeout=120))
        except urllib.error.HTTPError as e: print("FAIL", ad, i, e.code, e.read()[:300]); continue
        open(out + ".mp3", "wb").write(base64.b64decode(d["audio_base64"]))
        a = d["alignment"]
        json.dump({"cap": cap, "tts": tts, "chars": a["characters"], "s": a["character_start_times_seconds"], "e": a["character_end_times_seconds"]}, open(out + ".json", "w"))
        print(ad, i, round(a["character_end_times_seconds"][-1], 2), cap)
