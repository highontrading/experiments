# Voice every line of script.json with ElevenLabs eleven_v4, with character timestamps.
#   python3 tts.py            only lines whose text/voice changed (cached by hash)
#   python3 tts.py --only a1_3  re-take one line
import base64, hashlib, json, os, sys, urllib.request
KEY = os.environ["ELEVENLABS_API_KEY"]
S = json.load(open("script.json"))
only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
os.makedirs("voice", exist_ok=True)
used = 0
for ln in S["lines"]:
    if only and ln["id"] not in only: continue
    vid = S["voices"][ln["voice"]]
    h = hashlib.sha1(f'{vid}|{ln["text"]}|{ln["lang"]}'.encode()).hexdigest()[:10]
    meta_p = f'voice/{ln["id"]}.json'
    if not only and os.path.exists(meta_p) and json.load(open(meta_p)).get("hash") == h: continue
    body = {"text": ln["text"], "model_id": "eleven_v4", "language_code": ln["lang"]}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r: d = json.load(r)
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        if "language_code" in err:          # some models infer the language themselves
            body.pop("language_code"); req.data = json.dumps(body).encode()
            with urllib.request.urlopen(req) as r: d = json.load(r)
        else: sys.exit(f'{ln["id"]}: {e.code} {err}')
    open(f'voice/{ln["id"]}.mp3', "wb").write(base64.b64decode(d["audio_base64"]))
    al = d.get("normalized_alignment") or d["alignment"]
    json.dump({"hash": h, "text": ln["text"], "alignment": d["alignment"]}, open(meta_p, "w"), ensure_ascii=False)
    used += len(ln["text"])
    print(f'{ln["id"]:7s} {d["alignment"]["character_end_times_seconds"][-1]:5.2f}s  {ln["text"]}')
print("characters sent:", used)
