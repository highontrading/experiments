"""ElevenLabs sound effects. sfx.py name 'prompt' duration"""
import sys, os, json, urllib.request
name, prompt, dur = sys.argv[1], sys.argv[2], float(sys.argv[3])
req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
    data=json.dumps({"text": prompt, "duration_seconds": dur, "prompt_influence": 0.6}).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try: open(name + ".mp3", "wb").write(urllib.request.urlopen(req, timeout=120).read()); print("ok", name)
except urllib.error.HTTPError as e: print(name, e.read().decode())
