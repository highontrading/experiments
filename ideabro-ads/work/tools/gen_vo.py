import json,sys,base64,os,urllib.request
key=os.environ['ELEVENLABS_API_KEY']; S=json.load(open('work/vo_scripts.json'))
os.makedirs('audio/vo',exist_ok=True)
for ad in (sys.argv[1:] or S):
    s=S[ad]; tts=' '.join(p[1] for p in s['pairs'])
    body={"text":tts,"model_id":"eleven_v4"}
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{s['voice']}/with-timestamps?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":key,"Content-Type":"application/json"})
    d=json.load(urllib.request.urlopen(req,timeout=180))
    open(f"audio/vo/{ad}.mp3","wb").write(base64.b64decode(d["audio_base64"]))
    a=d["alignment"]; st=a['character_start_times_seconds']; en=a['character_end_times_seconds']
    # map pairs to char ranges in tts string
    words=[]; pos=0
    for cap,sp in s['pairs']:
        i=tts.index(sp,pos); j=i+len(sp); pos=j
        words.append({"w":cap,"s":round(st[i],3),"e":round(en[j-1],3)})
    json.dump({"text":tts,"words":words,"dur":round(en[-1],3)},open(f"audio/vo/{ad}.json","w"),indent=0)
    print(ad,'dur',round(en[-1],2),' '.join(f"{w['w']}@{w['s']:.2f}" for w in words[:6]),'...',flush=True)
