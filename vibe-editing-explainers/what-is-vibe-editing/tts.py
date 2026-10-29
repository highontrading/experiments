"""Voiceover: one ElevenLabs take with character timestamps, cut into lines.
    python tts.py  ->  vo/take.mp3, vo/alignment.json, vo/lines.json
"""
import base64, json, os, pathlib, urllib.request

S = json.load(open("script.json"))
text = "\n\n".join(l["text"] for l in S["lines"])
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{S['voice_id']}/with-timestamps?output_format=mp3_44100_128",
    data=json.dumps({
        "text": text,
        "model_id": S["model_id"],
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 0.95},
    }).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
)
d = json.load(urllib.request.urlopen(req, timeout=180))
pathlib.Path("vo").mkdir(exist_ok=True)
open("vo/take.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
al = d["alignment"]
json.dump(al, open("vo/alignment.json", "w"))

# where each line starts/ends in the take, plus word timings inside it
chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
full = "".join(chars)
out, pos = [], 0
for l in S["lines"]:
    i = full.index(l["text"], pos); j = i + len(l["text"]); pos = j
    words, w0 = [], None
    for k in range(i, j + 1):
        c = full[k] if k < len(full) else " "
        if c.strip() and w0 is None: w0 = k
        if (not c.strip() or k == j) and w0 is not None:
            words.append({"w": full[w0:k], "t0": st[w0], "t1": en[k - 1]}); w0 = None
    out.append({"id": l["id"], "text": l["text"], "t0": st[i], "t1": en[j - 1], "words": words})
json.dump(out, open("vo/lines.json", "w"), indent=1)
for l in out: print(f"{l['id']:6} {l['t0']:6.2f} -> {l['t1']:6.2f}  ({l['t1']-l['t0']:.2f}s)")
