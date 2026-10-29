"""Voiceover: one ElevenLabs take with character timestamps, cut into lines.
    python lib/tts.py <video-dir> [--force]  ->  <dir>/vo/take.mp3, alignment.json, lines.json
Skips the API call when vo/take.mp3 already exists (re-recording costs credits)."""
import base64, json, os, pathlib, sys, urllib.request

D = pathlib.Path(sys.argv[1]).resolve()
S = json.load(open(D / "script.json"))
vo = D / "vo"; vo.mkdir(exist_ok=True)
if not (vo / "take.mp3").exists() or "--force" in sys.argv:
    text = "\n\n".join(l["text"] for l in S["lines"])
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{S['voice_id']}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": S["model_id"],
                         "voice_settings": S.get("voice_settings", {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15,
                                                                    "use_speaker_boost": True, "speed": 0.95})}).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=300))
    (vo / "take.mp3").write_bytes(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"], open(vo / "alignment.json", "w"))

al = json.load(open(vo / "alignment.json"))
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
json.dump(out, open(vo / "lines.json", "w"), indent=1)
for l in out: print(f"{l['id']:8} {l['t0']:6.2f} -> {l['t1']:6.2f}  ({l['t1'] - l['t0']:.2f}s)")
