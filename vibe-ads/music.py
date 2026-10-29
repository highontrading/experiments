# One music bed per ad from ElevenLabs Music (music_v2_5), composed in sections that follow the story.
import json, os, sys, urllib.request
KEY = os.environ["ELEVENLABS_API_KEY"]
GLOBAL = ["instrumental", "modern Indian ad music", "clean mix for voice-over", "punchy"]
NEG = ["vocals", "singing", "lyrics", "spoken words"]
PLAN = {  # ad: (global styles, [(section, styles, start scene)])
 "a1": (["playful electronic", "tabla", "synth bass", "118 bpm"], [
        ("problem", ["sparse", "tense", "pizzicato strings", "ticking hi-hat", "a little mischievous"], "hook"),
        ("solution", ["uplifting", "full groove", "bright synths", "claps", "confident"], "pipeline"),
        ("finale", ["big", "anthemic", "energetic", "ends on a clean final hit"], "cta")]),
 "a2": (["cinematic", "storytelling"], [
        ("past", ["vintage silent-film piano", "light mechanical percussion", "curious", "nostalgic"], "phalke"),
        ("turn", ["building riser", "tension", "anticipation"], "experiment"),
        ("future", ["modern electronic", "tabla and sitar textures", "confident", "120 bpm"], "pipeline"),
        ("finale", ["triumphant", "energetic", "ends on a clean final hit"], "cta")]),
 "a3": (["energetic Indian pop EDM", "dhol", "124 bpm", "travel montage"], [
        ("intro", ["bright opening hit", "excited"], "hook"),
        ("problem", ["muted", "filtered", "waiting"], "problem"),
        ("go", ["full energy", "dhol groove", "catchy synth lead"], "oneline"),
        ("finale", ["celebratory", "big drop", "ends on a clean final hit"], "cta")]),
 "a4": (["quirky", "plucky", "112 bpm"], [
        ("tangle", ["tense", "plucked strings", "slightly off-kilter", "light"], "hook"),
        ("release", ["warm", "groovy", "relieved", "bass and claps"], "commands"),
        ("finale", ["uplifting", "confident", "ends on a clean final hit"], "cta")]),
 "a5": (["lo-fi house", "warm keys", "tabla loops", "100 bpm"], [
        ("morning", ["calm", "slightly stuck", "lo-fi chill"], "desk"),
        ("lift", ["upbeat", "bright", "bouncy groove"], "meet"),
        ("finale", ["feel-good", "confident", "ends on a clean final hit"], "cta")]),
}
for ad in (sys.argv[1:] or PLAN):
    out = f"assets/audio/music_{ad}.mp3"
    if os.path.exists(out): print(ad, "exists"); continue
    T = json.load(open(f"build/{ad}/timing.json"))
    start = {s["name"]: s["start"] for s in T["scenes"]}
    total = int((T["dur"] + 0.8) * 1000)
    g, secs = PLAN[ad]
    edges = [int(start[s[2]] * 1000) for s in secs] + [total]
    edges[0] = 0
    # music_v2_5 takes a text prompt; the story structure is spelled out with timestamps
    parts = [f"{edges[k] / 1000:.0f}-{edges[k + 1] / 1000:.0f}s {n}: {', '.join(st)}" for k, (n, st, _) in enumerate(secs)]
    prompt = (", ".join(GLOBAL + g) + ". Structure: " + "; ".join(parts) +
              ". No vocals, no singing. Leave space for a voice-over; the changes between parts must land exactly on those times.")
    sections = [dict(section_name=n, duration_ms=edges[k + 1] - edges[k]) for k, (n, _, _) in enumerate(secs)]
    body = dict(model_id="music_v2_5", prompt=prompt, music_length_ms=total, force_instrumental=True)
    req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": KEY, "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=600) as r: open(out, "wb").write(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"{ad}: {e.code} {e.read().decode()[:600]}")
    print(ad, "ok", [(s["section_name"], s["duration_ms"]) for s in sections])
