import json,os,urllib.request,concurrent.futures as cf
K=os.environ['ELEVENLABS_API_KEY']; H={"User-Agent":"curl/8","xi-api-key":K,"Content-Type":"application/json"}
def post(url,body,out):
    r=urllib.request.Request(url,data=json.dumps(body).encode(),headers=H)
    open(out,'wb').write(urllib.request.urlopen(r,timeout=600).read()); return out
S="https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
jobs=[
 ('glitch.mp3',{"text":"harsh digital glitch burst, data corruption, VHS tracking error, electronic stutter and static crackle","duration_seconds":1.0,"prompt_influence":0.6}),
 ('glitch2.mp3',{"text":"short digital glitch transition, bitcrushed stutter, datamosh noise burst","duration_seconds":0.6,"prompt_influence":0.6}),
 ('subswell.mp3',{"text":"deep sub bass swell rising, cinematic tension inhale, low rumble building, dark","duration_seconds":1.5,"prompt_influence":0.5}),
 ('impact.mp3',{"text":"massive cinematic trailer impact boom hit, deep sub drop, metallic reverb tail","duration_seconds":3.5,"prompt_influence":0.6}),
 ('riser.mp3',{"text":"fast white noise riser sweep up with accelerating snare roll, trailer build tension","duration_seconds":3.4,"prompt_influence":0.6}),
 ('projector.mp3',{"text":"old 16mm film projector running, mechanical clicking, vintage film reel noise, crackle","duration_seconds":8.0,"prompt_influence":0.6}),
 ('shutter.mp3',{"text":"rapid DSLR camera shutter burst, continuous high speed shooting clicks","duration_seconds":2.3,"prompt_influence":0.6}),
 ('whoosh.mp3',{"text":"fast whoosh swoosh transition, air swipe","duration_seconds":0.7,"prompt_influence":0.6}),
 ('typing.mp3',{"text":"fast typing on a laptop keyboard, crisp key clicks","duration_seconds":2.0,"prompt_influence":0.6}),
]
with cf.ThreadPoolExecutor(5) as ex:
    fs=[ex.submit(post,S,b,n) for n,b in jobs]
    fs.append(ex.submit(post,"https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",{"prompt":"Emotional cinematic ambient breakdown in F minor, warm felt piano melody, soft evolving string pads, hopeful and inspiring, spacious reverb, no drums, no vocals, slow 72 bpm, gentle swell toward the end","music_length_ms":13000,"model_id":"music_v1","force_instrumental":True},'../music/breakdown.mp3'))
    for f in fs: print('ok',f.result())
