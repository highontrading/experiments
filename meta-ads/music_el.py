"""Custom music beds with ElevenLabs music_v2_5 -> build/music_el/<name>.mp3"""
import json, os, sys, urllib.request, concurrent.futures as cf
T = {
 "epic": (45000, "Epic cinematic trailer score, deep taiko drums, rising strings and brass, dark to triumphant, 90 BPM, instrumental"),
 "indian": (40000, "Modern Indian pop beat for a brand ad, tabla and dholak groove, sitar plucks, punchy 808 bass, bright and upbeat, 105 BPM, instrumental"),
 "lofi": (40000, "Upbeat lo-fi hip hop, warm Rhodes keys, soft vinyl crackle, laid-back drums, morning productivity vibe, 88 BPM, instrumental"),
 "luxhouse": (40000, "Minimal luxury deep house for a premium fashion and jewellery ad, sleek bass, crisp hats, elegant chords, 120 BPM, instrumental"),
 "quiz": (32000, "Playful game show music, pizzicato strings, claps and marimba, quirky and bright, 120 BPM, instrumental"),
 "tension": (40000, "Ticking clock tension track, pulsing synth bass, building percussion, urgent countdown energy, resolves at the end, 120 BPM, instrumental"),
 "synthwave": (35000, "Retro 80s synthwave, analog synths, gated reverb drums, VHS nostalgia turning into modern clean production halfway, 100 BPM, instrumental"),
}
os.makedirs("build/music_el", exist_ok=True)
def gen(item):
    n, (ms, prompt) = item; out = f"build/music_el/{n}.mp3"
    if os.path.exists(out): return n, "exists"
    req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192",
        data=json.dumps({"prompt": prompt, "music_length_ms": ms, "model_id": "music_v2_5", "force_instrumental": True}).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    try: data = urllib.request.urlopen(req, timeout=600).read(); open(out, "wb").write(data); return n, "ok"
    except urllib.error.HTTPError as e: return n, f"FAIL {e.code} {e.read()[:200]}"
with cf.ThreadPoolExecutor(1) as ex:
    for r in ex.map(gen, T.items()): print(*r)
