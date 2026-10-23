"""Voice-over: one ElevenLabs take per slide (7+8 and 22+23 in one take each).

    python3 vo.py   ->  build/vo/take_XX.mp3 + take_XX.json (char timings)
                        build/vo/segments.json (every caption segment with its time)
Takes already on disk are reused, so a re-run costs no credits.
Neighbouring takes are passed as previous_text / next_text so the delivery flows.
"""
import base64
import json
import os
import pathlib
import time

import requests

from script import JOIN, SLIDES

VOICE = "LHJy3mhZWsvhUjy0zUM1"          # Amrut Deshmukh, Booklet Guy (Hindi)
MODEL = "eleven_v4"
SETTINGS = {"stability": 0.6, "similarity_boost": 0.8, "style": 0.05, "speed": 0.94,
            "use_speaker_boost": True}
OUT = pathlib.Path(__file__).parent / "build/vo"
OUT.mkdir(parents=True, exist_ok=True)

# group slides into takes
takes = []
for num, segs in SLIDES:
    if num in JOIN:
        takes[-1]["slides"].append((num, segs))
    else:
        takes.append({"slides": [(num, segs)]})
for i, tk in enumerate(takes):
    tk["id"] = f"take_{i + 1:02d}"
    tk["segs"] = [(num, r, d) for num, segs in tk["slides"] for r, d in segs]
    tk["text"] = " ".join(d for _, _, d in tk["segs"])


def synth(i, tk):
    mp3, js = OUT / f"{tk['id']}.mp3", OUT / f"{tk['id']}.json"
    if mp3.exists() and js.exists():
        return json.loads(js.read_text())
    body = {"text": tk["text"], "model_id": MODEL, "language_code": "hi",
            "voice_settings": SETTINGS}
    if i > 0:
        body["previous_text"] = takes[i - 1]["text"]
    if i + 1 < len(takes):
        body["next_text"] = takes[i + 1]["text"]
    for attempt in range(4):
        r = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",
            params={"output_format": "mp3_44100_128"}, json=body, timeout=180,
            headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"]})
        if r.ok:
            break
        print("retry", tk["id"], r.status_code, r.text[:200])
        time.sleep(2 ** (attempt + 1))
    r.raise_for_status()
    d = r.json()
    mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    al = d["alignment"]
    js.write_text(json.dumps(al, ensure_ascii=False))
    print(tk["id"], len(tk["text"]), "chars", f"{al['character_end_times_seconds'][-1]:.2f}s")
    return al


segments = []
for i, tk in enumerate(takes):
    al = synth(i, tk)
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    assert "".join(chars) == tk["text"], tk["id"]
    pos = 0
    for k, (num, roman, deva) in enumerate(tk["segs"]):
        a, b = pos, pos + len(deva) - 1
        segments.append({"take": tk["id"], "slide": num, "text": roman,
                         "t0": round(st[a], 3), "t1": round(en[b], 3)})
        pos = b + 2  # skip the joining space
(OUT / "segments.json").write_text(json.dumps(
    {"takes": [{"id": t["id"], "slides": [n for n, _ in t["slides"]]} for t in takes],
     "segments": segments}, ensure_ascii=False, indent=1))
print("segments:", len(segments))
