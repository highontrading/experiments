"""Sound effects for the four ads (ElevenLabs sound generation)."""
import json, os, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
SFX = {
 "crt-on":      ("old CRT television switching on, electric thunk, high pitched whine rising, static crackle settling", 1.6),
 "crt-off":     ("old CRT television switching off, quick electric pop and fading whine", 1.0),
 "ch-switch":   ("TV remote click then short burst of analog static noise, channel change", 0.6),
 "remote":      ("single soft plastic TV remote button click", 0.5),
 "crt-hum":     ("room full of old CRT televisions humming, soft electrical buzz, gentle static, ambient room tone", 12.0),
 "meadow":      ("peaceful summer meadow ambience, soft breeze through tall grass, distant birdsong, calm", 14.0),
 "whoosh-soft": ("soft gentle airy whoosh, smooth, cinematic, no hit", 1.2),
 "riser-soft":  ("soft warm cinematic riser swelling gently, airy, ends smoothly", 2.5),
 "boom-soft":   ("soft deep cinematic boom with long warm tail, gentle, premium logo reveal", 2.5),
 "chime":       ("delicate magical chime sparkle, soft and dreamy", 1.5),
 "pop-ui":      ("soft bubbly pop, light, satisfying", 0.5),
 "static-tail": ("analog TV static noise fading out", 1.2),
}
def post(url, body, out):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r, open(out, "wb") as f:
        f.write(r.read())
    return out
def sfx(n, p, d):
    o = os.path.join(HERE, "audio", f"sfx-{n}.mp3")
    return o if os.path.exists(o) else post("https://api.elevenlabs.io/v1/sound-generation", {"text": p, "duration_seconds": d, "prompt_influence": 0.5}, o)
if __name__ == "__main__":
    with cf.ThreadPoolExecutor(2) as ex:
        for f in cf.as_completed([ex.submit(sfx, k, *v) for k, v in SFX.items()]):
            try: print("ok", os.path.basename(f.result()))
            except Exception as e: print("FAIL", e)
