"""Generate the voiceover line by line with ElevenLabs (character timestamps) -> build/vo/."""
import json, os, base64, sys, urllib.request
VOICE = "VMCgCMbBs53ElBxVD4VB"  # Steven - Deep Documentary Narrator
LINES = [
 "Advertising has always followed the same pattern.",
 "A new medium appears.",
 "Print.", "Radio.", "Television.", "The internet.",
 "And every time... not every brand makes the jump.",
 "Some still book the studio, the crew, the three-week shoot...",
 "like it still makes sense.",
 "Others wake up inside the new one. And move.",
 "No studio. No crew. No waiting.",
 "One product photo becomes a whole campaign.",
 "Right now, AI is that medium.",
 "And the gap between brands that direct it, and brands that ignore it...",
 "is growing every single day.",
 "Shoot-quality ads. Without the shoot.",
 "Two kinds of advertisers are forming.",
 "The ones who shoot. And the ones who direct.",
 "Which one are you?",
]
only = set(map(int, sys.argv[1:]))
os.makedirs("build/vo", exist_ok=True)
for i, text in enumerate(LINES):
    if only and i not in only: continue
    body = {"text": text, "model_id": "eleven_multilingual_v2",
            "previous_text": LINES[i-1] if i else None, "next_text": LINES[i+1] if i+1 < len(LINES) else None,
            "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True, "speed": 0.97}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req))
    open(f"build/vo/l{i:02d}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
    a = d["alignment"]
    # words from characters
    words, cur, st = [], "", None
    for ch, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if ch.isspace():
            if cur: words.append({"w": cur, "s": st, "e": pe}); cur = ""
        else:
            if not cur: st = s
            cur += ch; pe = e
    if cur: words.append({"w": cur, "s": st, "e": pe})
    json.dump({"text": text, "words": words}, open(f"build/vo/l{i:02d}.json", "w"))
    print(i, text, "|", " ".join(f"{w['w']}@{w['s']:.2f}" for w in words))
