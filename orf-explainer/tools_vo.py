import json, sys, base64, subprocess
voice = sys.argv[1]; speed = float(sys.argv[2]); out = sys.argv[3]
text = open('script.txt').read().strip()
body = {"text": text, "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.48, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True, "speed": speed}}
r = subprocess.run(["curl","-s","-m","300","-X","POST",f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
    "-H","xi-api-key: dummy","-H","Content-Type: application/json","--data-binary","@-"], input=json.dumps(body).encode(), capture_output=True)
d = json.loads(r.stdout)
open(out + ".mp3", "wb").write(base64.b64decode(d["audio_base64"]))
json.dump(d["alignment"], open(out + ".align.json", "w"))
print("end", d["alignment"]["character_end_times_seconds"][-1])
