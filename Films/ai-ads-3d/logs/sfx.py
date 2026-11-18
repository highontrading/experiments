import json, urllib.request, subprocess, os, sys
SFX = {
 "terminal": ("empty airport terminal at 3am, air conditioning hum, distant floor polisher, very quiet, large reverberant hall", 15.0),
 "belt":     ("airport baggage carousel conveyor running, metal slats rattling and rubber rumble, steady, close", 10.0),
 "flaps":    ("heavy rubber curtain strips slapping as a suitcase pushes through, airport baggage belt", 1.5),
 "backhall": ("industrial baggage handling hall at night, conveyors and motors humming, distant beeps", 12.0),
 "servo":    ("industrial robot arm servo motor whirr and click, short", 1.2),
 "thud":     ("cardboard delivery box dropping onto a rubber conveyor belt, single soft thud", 0.8),
 "buzz":     ("smartphone vibrating on a hard suitcase, two short buzzes", 1.0),
 "bag":      ("hard shell suitcase sliding down a steel chute and bumping onto a carousel", 1.5),
 "bell":     ("a single ding of a reception desk service bell in a large empty hall", 2.0),
}
os.makedirs("assets/sound", exist_ok=True)
for name in (sys.argv[1:] or SFX):
    text, dur = SFX[name]
    out = f"assets/sound/{name}.wav"
    if os.path.exists(out): continue
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation",
        data=json.dumps({"text": text, "duration_seconds": dur, "prompt_influence": 0.5}).encode(),
        headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    mp3 = f"assets/sound/{name}.mp3"
    with urllib.request.urlopen(req, timeout=120) as r, open(mp3, "wb") as f: f.write(r.read())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "48000", "-ac", "2", out], check=True)
    os.remove(mp3)
    with open("LICENSES.csv", "a") as f:
        f.write(f'{out},{name} (generated),ElevenLabs sound effects (user account),https://elevenlabs.io,ElevenLabs terms (generated for this user),https://elevenlabs.io/terms-of-use,none,"generated from the prompt: {text}",2026-11-18,sfx,generated audio\n')
    print(name, "ok")
