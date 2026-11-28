"""Generate the custom sound kit + music beds with ElevenLabs (proxy injects the key)."""
import json, os, sys, subprocess, concurrent.futures as cf, urllib.request

WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = {
 "ve-whoosh-air":   ("soft airy cinematic whoosh passing by, smooth, premium, clean, no hit", 1.0),
 "ve-whoosh-deep":  ("deep cinematic whoosh with low rumble, smooth transition swoosh, premium trailer", 1.3),
 "ve-swish":        ("very fast short swish, quick air swipe for text animation, crisp", 0.5),
 "ve-riser":        ("short tension riser building up, white noise and synth swell, cinematic, ends abruptly", 1.6),
 "ve-reverse":      ("reverse cymbal swell rising into a cut, smooth cinematic", 1.4),
 "ve-hit":          ("deep cinematic sub boom impact hit with short tail, punchy, premium trailer", 1.6),
 "ve-thump":        ("soft low bass thump, subtle punch, clean, short", 0.6),
 "ve-click":        ("soft modern UI click, subtle, clean, tactile", 0.5),
 "ve-pop":          ("soft bubbly UI pop, light and satisfying, clean", 0.5),
 "ve-tick":         ("tiny crisp tick sound like a text cursor typing one letter, very subtle", 0.5),
 "ve-glitch":       ("short digital glitch stutter, data corruption burst, clean modern", 0.6),
 "ve-shimmer":      ("magical light shimmer sparkle swell, airy chimes, short", 1.4),
 "ve-scroll":       ("finger flicking and scrolling on a phone screen, quick swipe whoosh, subtle", 0.6),
 "ve-neon":         ("neon light tube buzzing on with electric flicker, short", 0.9),
 "ve-pen":          ("marker pen drawing a quick line on paper, scribble stroke, short", 0.8),
 "ve-camera":       ("camera shutter click with mechanical film wind, crisp", 0.6),
 "ve-tape":         ("tape stop slow down effect, short, music stopping", 0.8),
 "ve-ding":         ("bright clean notification ding, modern, pleasant", 0.7),
 "ve-cash":         ("satisfying coins counting up, quick arcade style score tally, short", 1.0),
 "ve-film":         ("film projector light flicker burst with soft whoosh, analog, short", 1.0),
}
MUSIC = {
 "m-kinetic":  "Minimal modern lo-fi hip hop instrumental for a premium designer reel, soft Rhodes chords, warm punchy kick and crisp snare, subtle vinyl texture, deep sub bass, 88 bpm, confident, clean, sparse arrangement, starts immediately, no vocals",
 "m-editorial":"Cinematic emotional ambient instrumental, soft felt piano melody, warm analog pads, gentle pulsing heartbeat percussion, slow build, introspective and premium, film score feel, starts immediately, no vocals",
 "m-split":    "Upbeat modern tech product launch instrumental, plucky synths, clean claps, bouncy bass, bright and optimistic, 112 bpm, social media ad energy, starts immediately, no vocals",
 "m-neon":     "Dark futuristic electronic instrumental, pulsing analog synth arpeggio, deep sub bass, crisp minimal trap hats, sleek and techy, 120 bpm, premium tech brand, starts immediately, no vocals",
 "m-docu":     "Warm inspirational documentary instrumental, minimal piano ostinato with soft strings and light pulsing percussion, hopeful, thoughtful, polished, 96 bpm, starts immediately, no vocals",
}

def post(url, body, out):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={
        "xi-api-key": "dummy", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r, open(out, "wb") as f:
        f.write(r.read())
    return out

def sfx(name, prompt, dur):
    out = os.path.join(WS, "sounds", name + ".mp3")
    if os.path.exists(out): return out
    return post("https://api.elevenlabs.io/v1/sound-generation",
                {"text": prompt, "duration_seconds": dur, "prompt_influence": 0.55}, out)

def music(name, prompt):
    out = os.path.join(WS, "music", name + ".mp3")
    if os.path.exists(out): return out
    return post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
                {"prompt": prompt, "music_length_ms": 17000}, out)

if __name__ == "__main__":
    os.makedirs(os.path.join(WS, "sounds"), exist_ok=True); os.makedirs(os.path.join(WS, "music"), exist_ok=True)
    with cf.ThreadPoolExecutor(2) as ex:
        futs = [ex.submit(sfx, k, *v) for k, v in SFX.items()] + [ex.submit(music, k, v) for k, v in MUSIC.items()]
        for f in cf.as_completed(futs):
            try: print("ok", os.path.basename(f.result()))
            except Exception as e: print("FAIL", e)
