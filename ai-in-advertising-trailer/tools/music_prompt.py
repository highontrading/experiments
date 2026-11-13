"""usage: python3 music_prompt.py OUT.mp3 LENGTH_MS "prompt" """
import os, sys, json, urllib.request
body = {"prompt": sys.argv[3], "music_length_ms": int(sys.argv[2]), "model_id": "music_v1", "force_instrumental": True}
req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", data=json.dumps(body).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try:
    open(sys.argv[1], "wb").write(urllib.request.urlopen(req, timeout=600).read()); print("ok", sys.argv[1])
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read()[:600])
