"""Voiceovers (with character timestamps) and soothing music beds for the four Meta ads (ElevenLabs)."""
import base64, json, os, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
VO = {
 "signal":   ("nPczCjzI2devNBz1zQrb", "Every feed wants something new. Every single day. Reels. Shorts. Stories. Ads. You don't need more hours. You need Vibe Editor. One raw clip in. Scroll-stopping edits out."),
 "channels": ("onwK4e9ZLuTAKqWW03F9", "One clip. Five channels. Kinetic. Editorial. Before and after. Neon. Documentary. Same footage, every style. Vibe Editor."),
 "wall":     ("cjVigY5qzO86Huf0OWal", "This is one video. Shot once. Edited a hundred different ways. Ninety-plus effects. Forty-seven caption styles. Thirty-six looks. Find the edit that sells. Vibe Editor."),
 "dream":    ("SAz9YHcvj6GT2YYXdXww", "Somewhere between the idea, and the post, there's the edit you keep imagining. Vibe Editor takes you there. Describe the vibe. It does the rest."),
}
MUSIC = {
 "signal":   "Dreamy nostalgic lo-fi synthwave ambient, warm analog pads, soft tape-saturated beat, gentle bass, calm and hypnotic, 80 bpm, no vocals, no drops, starts immediately",
 "channels": "Soft retro 1980s ambient synth music, gentle twinkling arpeggio, warm VHS nostalgia, calm and elegant, 85 bpm, no vocals, no drops, starts immediately",
 "wall":     "Cinematic ambient instrumental, warm evolving pads, gentle pulsing heartbeat, soft felt piano, slowly building and inspiring, no drops, no vocals, starts immediately",
 "dream":    "Dreamy soothing ambient music, airy pads, soft piano and gentle guitar harmonics, light wind chimes, peaceful and hopeful, 70 bpm, no vocals, starts immediately",
}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()
def vo(name):
    vid, text = VO[name]
    out = os.path.join(HERE, "audio", f"vo-{name}.mp3")
    if os.path.exists(out): return out
    d = json.loads(post(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
                        {"text": text, "model_id": "eleven_multilingual_v2",
                         "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True}}))
    open(out, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"], open(out.replace(".mp3", ".json"), "w"))
    return out
def music(name):
    out = os.path.join(HERE, "audio", f"music-{name}.mp3")
    if os.path.exists(out): return out
    open(out, "wb").write(post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {"prompt": MUSIC[name], "music_length_ms": 24000}))
    return out
if __name__ == "__main__":
    with cf.ThreadPoolExecutor(2) as ex:
        fs = [ex.submit(vo, n) for n in VO] + [ex.submit(music, n) for n in MUSIC]
        for f in cf.as_completed(fs):
            try: print("ok", os.path.basename(f.result()))
            except Exception as e: print("FAIL", e)
