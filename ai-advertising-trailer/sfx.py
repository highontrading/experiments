"""Generate the SFX set with ElevenLabs sound-generation -> build/sfx/<name>.mp3"""
import json, os, sys, urllib.request
SFX = {
 "intro_riser":  (3.2, "cinematic rising choir and string pad swelling crescendo, tension building, ends abruptly"),
 "rev_swell":    (1.6, "reverse cymbal and reverse piano swell rising into an impact, cinematic"),
 "flash_boom":   (2.5, "deep cinematic sub bass boom impact with a bright whoosh, trailer hit"),
 "whoosh":       (1.0, "fast airy cinematic whoosh transition"),
 "whip":         (0.8, "very fast whip pan swoosh, sharp"),
 "orb_ping":     (2.0, "magical glassy shimmer ping, bright sine bell sparkle, ethereal"),
 "orb_expand":   (1.5, "rising airy whoosh swelling into bright white light, cinematic"),
 "pop":          (0.5, "soft UI pop bubble click, clean, satisfying"),
 "card_drop":    (0.5, "paper photo card slap down on table, short"),
 "scatter":      (1.2, "explosive whoosh of papers and photos scattering outward, cinematic"),
 "glitch":       (0.6, "short digital glitch tick, data stutter"),
 "tick":         (0.5, "tiny camera shutter click, crisp"),
 "split":        (1.0, "heavy deep door slam whoosh, low sub thud, dark"),
 "final_riser":  (7.0, "huge cinematic tension riser, white noise and strings rising, accelerating snare roll, extremely intense, ends abruptly at peak"),
 "sub_drop":     (2.0, "deep sub bass drop down sweep, cinematic"),
}
only = sys.argv[1:]
os.makedirs("build/sfx", exist_ok=True)
for name, (dur, text) in SFX.items():
    if only and name not in only: continue
    body = {"text": text, "duration_seconds": dur, "prompt_influence": 0.5}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", data=json.dumps(body).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    try:
        open(f"build/sfx/{name}.mp3", "wb").write(urllib.request.urlopen(req, timeout=120).read()); print("ok", name)
    except urllib.error.HTTPError as e:
        print("FAIL", name, e.code, e.read()[:200])
