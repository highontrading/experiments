import json,os,urllib.request,sys,concurrent.futures as cf
key=os.environ['ELEVENLABS_API_KEY']
SFX={
 "tick":("Single crisp camera shutter click, very short, dry, close up",0.5),
 "flash":("Old film projector light flare burst, airy whoosh with soft film crackle and flicker, cinematic transition",1.2),
 "projector":("16mm film projector running, steady mechanical clatter loop, soft",4.0),
 "pop":("Soft short pop of a photo print placed on a table, subtle, clean",0.5),
 "scatter":("Fast airy whoosh of paper photos scattering outward",1.0),
 "riser":("Soft airy shimmering riser swelling into bright white light",1.3),
 "whip":("Fast whip swish whoosh passing left to right",0.6),
 "impact":("Deep cinematic sub boom impact with short tail, trailer hit",2.0),
 "shimmer":("Glassy crystalline rising tone, shimmering, magical, smooth",2.5),
 "ui":("Minimal clean digital user interface click",0.4),
 "line":("Electric neon light hum sweep, light beam drawing across, smooth",1.5),
 "bubble":("Soft glossy bubble pop, short, satisfying",0.4),
}
def gen(k):
    t,d=SFX[k]
    body={"text":t,"duration_seconds":d,"prompt_influence":0.6}
    req=urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":key,"Content-Type":"application/json"})
    open(f"audio/sfx/{k}.mp3","wb").write(urllib.request.urlopen(req,timeout=120).read()); return k
with cf.ThreadPoolExecutor(4) as ex:
    for k in ex.map(gen,SFX): print(k,"ok",flush=True)
