"""Generate VO lines with ElevenLabs (character timestamps). usage: python3 vo.py OUTDIR"""
import os, sys, json, base64, urllib.request
OUT = sys.argv[1]
VOICE = os.environ.get("VO_VOICE", "FF7KdobWPaiR0vkcALHF")  # David - Movie Trailer Narrator
LINES = {
    "l1": ("They said advertising was ruled by instinct. By gut... budget... and luck.", 0.92),
    "l2": ("Then came the machines.", 0.95),
    "l3": ("Algorithms learned the audience.", 1.0),
    "l4": ("Models started creating.", 0.95),
    "l5": ("From Mad Men to Midjourney. From briefs... to prompts.", 0.95),
    "l6": ("Now, a new creative department emerges. Built not by agencies... but by AI.", 0.95),
}
only = sys.argv[2:] or list(LINES)
for k in only:
    text, speed = LINES[k]
    body = {"text": text, "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25, "speed": speed}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req))
    open(f"{OUT}/{k}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump({"text": text, "alignment": d["alignment"]}, open(f"{OUT}/{k}.json", "w"))
    a = d["alignment"]; print(k, "end %.2fs" % a["character_end_times_seconds"][-1], text)
