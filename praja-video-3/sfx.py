"""Sound effects and music bed from ElevenLabs (sound-generation + music).

    python3 sfx.py            -> build/sfx/<name>.mp3 for every entry in SFX
    python3 sfx.py music SECS -> build/music/bed.mp3
Files already on disk are reused.
"""
import os
import pathlib
import sys
import time

import requests

ROOT = pathlib.Path(__file__).parent
KEY = {"xi-api-key": os.environ["ELEVENLABS_API_KEY"]}

SFX = {
    "whoosh_a": ("Fast swipe of a large paper sheet sliding across a desk, airy paper whoosh, close mic", 1.0),
    "whoosh_b": ("Quick soft whoosh of a paper card flying past, short and clean", 0.8),
    "slap_a": ("A single sheet of thick paper dropped flat onto a wooden table, soft slap, close", 0.5),
    "slap_b": ("Light cardboard card placed down on a desk, gentle tap and paper flutter", 0.5),
    "tape_a": ("Masking tape pulled quickly off the roll and pressed down on paper, short rip", 0.8),
    "tape_b": ("Short strip of paper tape torn by hand, quick crisp tear", 0.6),
    "stamp": ("Rubber stamp pressed hard onto paper on a wooden desk, single firm thud", 0.6),
    "type": ("Vintage manual typewriter, a quick burst of key strikes, no bell", 1.6),
    "marker": ("Felt tip marker drawing a quick circle on paper, short squeak and scratch", 0.9),
    "flick": ("Tiny paper cutout letter flicked onto paper, very light dry tap", 0.3),
    "pop": ("Soft subtle user interface pop, clean and warm, very short", 0.3),
    "click": ("Single crisp computer mouse click", 0.3),
    "chat": ("Gentle chat message received blip, soft and friendly", 0.4),
    "ding": ("Soft gentle success chime, warm bell tone, short", 1.0),
    "tick": ("Fast mechanical counter ticking up, light clicks rolling", 1.4),
    "swell": ("Soft cinematic reveal swell with a light shimmer, paper rustle at the start", 1.6),
    "thud": ("Low soft muted knock on a wooden table, disappointed tone, single hit", 0.5),
    "rustle": ("Several sheets of paper gently shuffled and rustled on a desk", 1.2),
    "tear": ("A sheet of paper slowly torn in half, crisp tear", 1.0),
}

MUSIC_PROMPT = (
    "Calm, hopeful documentary underscore for a civic explainer about citizens and city government. "
    "Soft felt piano motif, warm analog pads, light plucked strings and gentle marimba, "
    "a soft brushed shaker and low kick entering after the intro, steady 92 BPM, "
    "optimistic and thoughtful, never dramatic, sits under a voice-over. "
    "Gradually builds a little warmer in the last minute and ends with a gentle resolved piano chord. "
    "Instrumental, no vocals."
)


def post(url, body, dest):
    for attempt in range(4):
        r = requests.post(url, json=body, headers=KEY, timeout=600,
                          params={"output_format": "mp3_44100_128"})
        if r.ok:
            dest.write_bytes(r.content)
            return
        print("retry", dest.name, r.status_code, r.text[:300])
        time.sleep(2 ** (attempt + 1))
    r.raise_for_status()


if len(sys.argv) > 1 and sys.argv[1] == "music":
    out = ROOT / "build/music/bed.mp3"
    out.parent.mkdir(parents=True, exist_ok=True)
    if not out.exists():
        post("https://api.elevenlabs.io/v1/music",
             {"prompt": MUSIC_PROMPT, "music_length_ms": int(float(sys.argv[2]) * 1000),
              "force_instrumental": True}, out)
    print(out)
else:
    d = ROOT / "build/sfx"
    d.mkdir(parents=True, exist_ok=True)
    for name, (prompt, secs) in SFX.items():
        out = d / f"{name}.mp3"
        if out.exists():
            continue
        post("https://api.elevenlabs.io/v1/sound-generation",
             {"text": prompt, "duration_seconds": max(0.5, secs), "prompt_influence": 0.6}, out)
        print(name)
