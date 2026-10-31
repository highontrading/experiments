"""ElevenLabs TTS with timestamps. tts.py voice_id model out_prefix textfile [stability] [style]"""
import sys, os, json, base64, urllib.request
vid, model, out, tf = sys.argv[1:5]
stab = float(sys.argv[5]) if len(sys.argv) > 5 else 0.45
style = float(sys.argv[6]) if len(sys.argv) > 6 else 0.35
body = {"text": open(tf).read().strip(), "model_id": model,
        "voice_settings": {"stability": stab, "similarity_boost": 0.8, "style": style, "use_speaker_boost": True}}
if model == "eleven_v3": body["voice_settings"] = {"stability": 0.5, "similarity_boost": 0.8}
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
    data=json.dumps(body).encode(), headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try: d = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: print(e.read().decode()); sys.exit(1)
open(out + ".mp3", "wb").write(base64.b64decode(d["audio_base64"]))
json.dump(d.get("alignment"), open(out + ".align.json", "w"), ensure_ascii=False)
a = d["alignment"]; print(out, "dur", a["character_end_times_seconds"][-1])
