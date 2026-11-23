import json, sys, base64, subprocess
voice, model, out = sys.argv[1], sys.argv[2], sys.argv[3]
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
text = open('v2/script.txt').read().strip()
body = {"text": text, "model_id": model, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True, "speed": speed}}
r = subprocess.run(["curl","-s","-m","400","-X","POST",f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
    "-H","xi-api-key: dummy","-H","Content-Type: application/json","--data-binary","@-"], input=json.dumps(body).encode(), capture_output=True)
try: d = json.loads(r.stdout)
except Exception: print(r.stdout[:500]); raise
if "audio_base64" not in d: print(json.dumps(d)[:600]); sys.exit(1)
open(out + ".mp3", "wb").write(base64.b64decode(d["audio_base64"]))
json.dump(d["alignment"], open(out + ".align.json", "w"))
print("end", d["alignment"]["character_end_times_seconds"][-1])
