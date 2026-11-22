#!/usr/bin/env python3
"""Sound design: generate layers with ElevenLabs sound effects, then mix them on a timeline.

  python3 sfx.py plan.json OUT.wav

plan.json:
{
  "duration": 7.0,
  "layers": [
    {"name": "room",   "prompt": "quiet sunlit study, distant birds, faint CRT hum, no music", "len": 8, "at": 0,   "gain": 0.55},
    {"name": "pad",    "prompt": "warm nostalgic analog synth pad swelling, no drums",       "len": 8, "at": 0,   "gain": 0.30, "fade_in": 2},
    {"name": "whoosh", "prompt": "soft airy cinematic whoosh transition",                      "len": 1.5, "at": 3.3, "gain": 0.45},
    {"name": "keys",   "prompt": "a few soft clicks on a vintage mechanical keyboard",         "len": 2.5, "at": 4.4, "gain": 0.6}
  ]
}

Needs the ElevenLabs API reachable at api.elevenlabs.io with a key in ELEVENLABS_API_KEY
(or a proxy that injects it). If unavailable, drop in any licensed WAV/MP3 by giving a layer
"file": "path" instead of "prompt". Output is loudness-normalised to -16 LUFS (social standard).
"""
import json, os, subprocess, sys, urllib.request

def generate(prompt, seconds, path):
    if os.path.exists(path): return path
    body = json.dumps({"text": prompt, "duration_seconds": float(min(max(seconds, 0.5), 22)), "prompt_influence": 0.6}).encode()
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation", data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")})
    with urllib.request.urlopen(req) as r, open(path, "wb") as f: f.write(r.read())
    return path

def main(plan_path, out):
    plan = json.load(open(plan_path)); d = plan["duration"]
    work = os.path.join(os.path.dirname(os.path.abspath(out)), "sfx_layers"); os.makedirs(work, exist_ok=True)
    inputs, chains = [], []
    for i, L in enumerate(plan["layers"]):
        src = L.get("file") or generate(L["prompt"], L.get("len", d), os.path.join(work, L["name"] + ".mp3"))
        inputs += ["-i", src]
        ms = int(L.get("at", 0) * 1000)
        ch = f"[{i}]volume={L.get('gain', 0.5)}"
        if L.get("fade_in"): ch += f",afade=t=in:d={L['fade_in']}"
        if ms: ch += f",adelay={ms}|{ms}"
        chains.append(ch + f"[a{i}]")
    n = len(plan["layers"])
    fc = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(n)) + \
         f"amix=inputs={n}:normalize=0,atrim=0:{d},afade=t=out:st={max(d - 0.8, 0)}:d=0.8,loudnorm=I=-16:TP=-1.5"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-ar", "48000", out], check=True)
    print(out)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
