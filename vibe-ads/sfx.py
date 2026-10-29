# Sound-effect pack from ElevenLabs' newest SFX model (eleven_text_to_sound_v3). Cached: existing files are kept.
import json, os, urllib.request
KEY = os.environ["ELEVENLABS_API_KEY"]
PACK = {
    "whoosh_soft": ("soft airy whoosh, a paper cut-out sliding past the camera, clean, no music", 0.9),
    "whoosh_fast": ("fast short swish whoosh transition, crisp, no music", 0.6),
    "paper_slide": ("a sheet of thick paper sliding across a paper desk, close mic", 0.8),
    "paper_rustle": ("crisp paper rustle, a paper cut-out being picked up and placed", 1.0),
    "snip": ("single sharp scissors snip cutting through rubber, close mic", 0.6),
    "thud": ("a cardboard cut-out landing flat on a paper table, soft thud", 0.4),
    "pop": ("small soft pop, a speech bubble appearing, playful", 0.3),
    "typing": ("fast typing on a laptop keyboard, close mic, dry", 1.6),
    "shutter": ("vintage camera shutter click", 0.5),
    "zap": ("short electric spark zap, cartoonish but real", 0.6),
    "projector": ("old 35mm film projector running, mechanical clatter", 2.0),
    "tick": ("clock ticking fast, tension", 2.0),
    "pen_tick": ("pen ticking a checkbox on paper, quick scratch", 0.6),
    "riser": ("short cinematic riser swell building up into a reveal, no melody", 2.2),
    "chime": ("bright positive success chime, short, modern", 0.9),
    "tear": ("paper tearing quickly", 0.8),
    "squish": ("wet rubbery squelch, octopus tentacle slapping", 0.6),
    "stamp": ("rubber stamp pressed hard on paper", 0.5),
}
os.makedirs("assets/audio", exist_ok=True)
for name, (prompt, dur) in PACK.items():
    out = f"assets/audio/sfx_{name}.mp3"
    if os.path.exists(out): continue
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
        data=json.dumps({"text": prompt, "model_id": "eleven_text_to_sound_v3", "duration_seconds": max(0.5, dur), "prompt_influence": 0.6}).encode(),
        headers={"xi-api-key": KEY, "content-type": "application/json"})
    with urllib.request.urlopen(req) as r:
        open(out, "wb").write(r.read()); print(f"{name:12s} cost {r.headers.get('character-cost')}")
