"""usage: python3 sfx.py OUTDIR  -- generates all SFX with ElevenLabs sound generation"""
import os, sys, json, urllib.request, concurrent.futures as cf
OUT = sys.argv[1]
SFX = {
 "boom":      ("Massive cinematic sub boom impact, deep trailer hit with long dark tail", 3.0),
 "boom2":     ("Deep trailer braam hit, distorted low brass and sub, dark tech thriller", 4.0),
 "glitch1":   ("Short digital glitch stutter, data corruption, bit crushed electronic click burst", 0.6),
 "glitch2":   ("Fast digital glitch zap, VHS tape distortion crackle, electronic error burst", 0.8),
 "glitch3":   ("Heavy digital glitch distortion burst with bass, corrupted signal, cyberpunk transition", 1.2),
 "riser":     ("Rising reverse swell riser, dark cinematic tension build into a drop, sucking reverse cymbal", 2.0),
 "whoosh":    ("Fast cinematic whoosh swipe transition, airy digital swish", 0.8),
 "zap":       ("Electric neon flicker buzz, fluorescent light turning on with electric zaps", 1.5),
 "tick":      ("Single soft digital data blip, UI tick, very short", 0.5),
 "powerdown": ("Tape stop power down, electronics shutting off, digital signal dying", 1.0),
 "title":     ("Epic deep cinematic title impact hit with sub boom and metallic shimmer, long reverb tail", 5.0),
 "static":    ("Low quiet analog TV static noise hiss with VHS hum, steady", 4.0),
}
def gen(k):
    text, dur = SFX[k]
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", data=json.dumps(body).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    try:
        open(f"{OUT}/{k}.mp3", "wb").write(urllib.request.urlopen(req, timeout=300).read()); return k + " ok"
    except urllib.error.HTTPError as e:
        return f"{k} HTTP {e.code} {e.read()[:200]}"
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(gen, [a for a in (sys.argv[2:] or SFX)]): print(r)
