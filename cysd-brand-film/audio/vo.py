import json,subprocess,urllib.request,sys
V="9PvnT6XRzlljoaDG6Knu"
L=[
"In nineteen eighty-two, a handful of young volunteers in Odisha set out with one simple belief.",
"That lasting change begins when people believe they have the power to shape their own future.",
"Forty-four years on, that belief has taken root.",
"Today, it reaches over six lakh eighty thousand lives, in fourteen hundred villages.",
"We nurture young community leaders, who carry their villages' voices to where decisions are made.",
"We help mothers and children grow up healthy, with over ninety-six percent immunisation.",
"We stand with farmers, linking more than twenty thousand of them to fair markets.",
"We heal the land, with natural farming, and water bodies brought back to life.",
"And we strengthen local democracy, where Gram Sabhas listen, and women lead.",
"Because development is not something done for people. It is something people do, together.",
"Enable. Empower. Include.",
"C Y S D. Rooted in communities. Driven by values. Committed to the future.",
]
sel=[int(x) for x in sys.argv[1:]] or range(len(L))
for i in sel:
    body={"text":L[i],"model_id":"eleven_multilingual_v2",
          "voice_settings":{"stability":0.55,"similarity_boost":0.8,"style":0.25,"use_speaker_boost":True,"speed":1.0},
          "previous_text":L[i-1] if i>0 else None,"next_text":L[i+1] if i+1<len(L) else None}
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V}/with-timestamps?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
    r=json.loads(urllib.request.urlopen(req,timeout=120).read())
    import base64
    open(f"vo{i:02d}.mp3","wb").write(base64.b64decode(r["audio_base64"]))
    json.dump(r["alignment"],open(f"vo{i:02d}.json","w"))
    # trim silence both ends -> wav
    subprocess.run(["ffmpeg","-v","error","-y","-i",f"vo{i:02d}.mp3","-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,asetpts=N/SR/TB","-ar","48000",f"vo{i:02d}.wav"])
    d=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"vo{i:02d}.wav"],capture_output=True,text=True).stdout.strip()
    print(i,d,L[i][:50])
