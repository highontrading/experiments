"""SFX with ElevenLabs eleven_text_to_sound_v3 -> build/sfx/<name>.mp3"""
import json, os, sys, urllib.request
SFX = {
 "receipt": (2.0, "thermal receipt printer printing a long receipt, fast mechanical whirr"),
 "tear": (0.6, "paper receipt torn off quickly"),
 "typewriter": (2.0, "fast typewriter typing, crisp keys"),
 "keys": (2.0, "fast laptop keyboard typing, clean"),
 "flap": (1.5, "airport split flap display board flipping letters, clattering"),
 "pageflip": (0.8, "glossy magazine page flip"),
 "stamp": (0.6, "heavy rubber stamp thud on paper"),
 "register": (1.0, "cash register cha-ching"),
 "pencil": (1.0, "pencil quickly ticking a checkbox on paper"),
 "coin": (0.5, "8-bit retro game coin pickup"),
 "powerup": (1.2, "8-bit retro game power up level complete jingle"),
 "notif": (0.6, "smartphone message notification ping"),
 "clapper": (0.6, "film clapperboard slate snap"),
 "shutter": (0.5, "camera shutter click"),
 "swipe": (0.5, "phone screen swipe scroll whoosh, soft"),
 "shimmer": (1.5, "festive golden sparkle shimmer, bells, magical"),
 "riser": (2.5, "short cinematic tension riser into impact"),
 "boom": (1.5, "deep cinematic boom impact"),
 "clock": (4.0, "fast ticking stopwatch, crisp mechanical ticks, steady"),
 "vhs": (1.5, "VHS tape inserted into VCR and rewinding, mechanical whirr"),
 "ding": (0.8, "bright game show correct answer ding"),
 "beep": (0.5, "digital camcorder record start beep"),
 "boxopen": (1.0, "cardboard box flaps opening quickly"),
 "sub": (1.5, "deep sub bass drop hit, cinematic"),
 "send": (0.5, "messaging app message sent swoosh, soft"),
 "focus": (0.6, "camera lens autofocus servo whirr and beep"),
}
only = sys.argv[1:]
for n, (d, txt) in SFX.items():
    if only and n not in only: continue
    if os.path.exists(f"build/sfx/{n}.mp3"): continue
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
        data=json.dumps({"text": txt, "duration_seconds": d, "prompt_influence": 0.6, "model_id": "eleven_text_to_sound_v3"}).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    try: data = urllib.request.urlopen(req, timeout=120).read(); open(f"build/sfx/{n}.mp3", "wb").write(data); print("ok", n)
    except urllib.error.HTTPError as e: print("FAIL", n, e.code, e.read()[:200])
