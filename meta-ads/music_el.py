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
 "trailer": (40000, "Hollywood blockbuster movie trailer music, deep braams, ticking pulse, huge taiko hits, rising strings, silence drop then massive final hit, instrumental"),
 "news": (30000, "Breaking news TV channel theme, urgent synth stabs, ticking hi-hats, dramatic brass hits, Indian news bulletin energy, 120 BPM, instrumental"),
 "wrapped": (35000, "Bright upbeat electro pop, punchy claps, catchy synth hook, celebratory year-in-review energy, 124 BPM, instrumental"),
 "phonk": (35000, "Hard-hitting phonk trap beat, heavy 808, cowbell, aggressive and confident, very clear strong beats, 140 BPM, instrumental"),
 "race": (35000, "High-energy drum and bass racing track, fast breakbeats, driving bass, adrenaline, 172 BPM, instrumental"),
 "classical": (40000, "Elegant string quartet, refined classical museum gallery atmosphere, gentle and luxurious, instrumental"),
 "comic": (35000, "Playful cartoon orchestral score, pizzicato, brass stabs, comedic timing, superhero triumphant ending, instrumental"),
 "horror": (35000, "Horror trailer, eerie drones, creaking, heartbeat, dissonant strings building tension, then sudden release into warm hopeful synth, instrumental"),
 "travel": (35000, "Breezy travel vlog music, acoustic guitar, light percussion, Mediterranean sunny mood, upbeat, 110 BPM, instrumental"),
 "cricket": (35000, "Indian cricket stadium anthem, dhol and tabla, crowd energy, trumpets, celebratory, 128 BPM, instrumental"),
 "ukulele": (40000, "Friendly explainer video music, ukulele, glockenspiel, claps, light and curious, 100 BPM, instrumental"),
 "keynote": (40000, "Minimal premium tech keynote music, airy ambient pads, soft pulse, inspiring build, instrumental"),
 "drive": (35000, "Confident modern hip hop beat, warm keys, crisp drums, motivational, 92 BPM, instrumental"),
 "calm": (40000, "Guided meditation ambient, soft warm pads, singing bowl, gentle breath-like swells, very calm, instrumental"),
 "shehnai": (35000, "Joyful Indian wedding music, shehnai melody, dhol and nagada, festive and grand, instrumental"),
 "courtroom": (35000, "Courtroom drama score, suspenseful low strings, timpani, building to a decisive verdict hit, instrumental"),
 "kitchen": (35000, "Jazzy cooking show music, upright bass, brushed drums, playful piano, warm and fun, 115 BPM, instrumental"),
 "search": (35000, "Curious minimal electronic, plucky synths, soft beat, light and modern, 105 BPM, instrumental"),
 "swipe": (35000, "Flirty funky pop, slap bass, finger snaps, playful brass, 112 BPM, instrumental"),
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
with cf.ThreadPoolExecutor(2) as ex:
    for r in ex.map(gen, T.items()): print(*r)
