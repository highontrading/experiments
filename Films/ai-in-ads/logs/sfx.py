import json, urllib.request, subprocess, os, sys
SFX = {
 "stamp":   ("a heavy brass rubber stamp slammed onto paper on a wooden desk, single hit, close", 1.0),
 "stamp2":  ("a small metal mechanical stamp pressing paper, short dry clack, close", 0.6),
 "flutter": ("hundreds of small paper slips scattering and fluttering down in a room", 3.0),
 "lamp":    ("an oil lamp wick catching fire, soft whoosh and flame flutter, quiet room", 2.0),
 "creak":   ("old wooden lattice door frame creaking softly", 2.0),
 "paste":   ("a wet paper poster being brushed flat onto a wall with a paste brush, one stroke", 1.2),
 "gears":   ("small brass clockwork gears ratcheting, mechanical automaton arm moving", 2.0),
 "room":    ("quiet traditional wooden room at night, faint oil lamp flame, distant crickets, room tone", 12.0),
 "city":    ("apartment block at night, distant traffic hum, faint muffled tv, air conditioners, calm", 14.0),
 "dawn":    ("city courtyard at dawn, a few birds, far traffic starting, cold morning air", 9.0),
 "rodtap":  ("a thin wooden rod tapping a paper screen, soft single tap", 0.5),
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
