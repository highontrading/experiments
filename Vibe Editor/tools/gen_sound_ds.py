"""Soft close-mic ASMR sound set + calm music bed for the DESIGN_SYSTEM edit (ElevenLabs; the proxy injects the key)."""
import json, os, urllib.request, concurrent.futures as cf
WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = {
 "ds-swell":   ("warm soft low swell, gentle airy bloom, close-mic, calm, no hit, smooth", 1.6),
 "ds-tap":     ("very soft close-mic tap on a wooden desk, muted, gentle, ASMR", 0.5),
 "ds-paper":   ("soft paper sheet swipe across a table, close-mic ASMR, gentle", 0.6),
 "ds-whoosh":  ("silky soft fabric whoosh, quick, airy, close-mic, no harsh highs", 0.5),
 "ds-pop":     ("tiny soft bubble pop, gentle, close-mic ASMR, muted", 0.5),
 "ds-click":   ("gentle soft mouse click, muted, close-mic", 0.5),
 "ds-shimmer": ("soft glassy shimmer, delicate glass chime swell, gentle, calm", 1.2),
}
MUSIC = {"m-calm": "Calm premium instrumental music bed: soft felt piano keys and warm ambient pads, light brushed percussion, 88 bpm, steady and gentle, no drops, no builds, no vocals, elegant and minimal, starts immediately"}
def post(url, body, out):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r, open(out, "wb") as f:
        f.write(r.read())
    return out
def sfx(n, p, d):
    o = os.path.join(WS, "sounds", "src", n + ".mp3")
    return o if os.path.exists(o) else post("https://api.elevenlabs.io/v1/sound-generation", {"text": p, "duration_seconds": d, "prompt_influence": 0.6}, o)
def music(n, p):
    o = os.path.join(WS, "music", "src", n + ".mp3")
    return o if os.path.exists(o) else post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {"prompt": p, "music_length_ms": 18000}, o)
if __name__ == "__main__":
    with cf.ThreadPoolExecutor(2) as ex:
        fs = [ex.submit(sfx, k, *v) for k, v in SFX.items()] + [ex.submit(music, k, v) for k, v in MUSIC.items()]
        for f in cf.as_completed(fs):
            try: print("ok", os.path.basename(f.result()))
            except Exception as e: print("FAIL", e)
