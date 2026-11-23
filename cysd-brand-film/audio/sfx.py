import json,urllib.request,concurrent.futures as cf
S={
"stamp1":("Heavy wooden rubber stamp slammed down hard onto paper on a wooden desk, single solid punchy thud",1.0),
"stamp2":("Rubber stamp pressed firmly onto a document on a desk, one crisp thump",0.8),
"typewriter":("Vintage mechanical typewriter typing quickly, crisp clacking key strikes, no bell",3.0),
"tw_bell":("Typewriter carriage return, bell ding then carriage slide",1.3),
"paper_slide":("Single sheet of paper sliding quickly across a wooden table",0.9),
"paper_rustle":("Handling crisp old paper documents, short rustle",1.2),
"whoosh_soft":("Soft smooth cinematic air whoosh transition",1.2),
"whoosh_big":("Deep cinematic whoosh sweeping past with low rumble",1.8),
"projector":("Old 16mm film projector running, steady mechanical clicking rattle",6.0),
"riser":("Cinematic airy tension riser swelling upward, building anticipation",3.5),
"boom":("Deep warm cinematic boom impact hit with long reverb tail",3.0),
"shutter":("Vintage film camera shutter click and film advance lever",0.9),
"tape":("Piece of masking tape torn off and pressed onto paper",1.0),
"pageflip":("Quickly flipping through pages of an old paper book",1.4),
"flip_counter":("Mechanical split flap counter flipping rapidly then stopping",1.6),
"crackle":("Subtle warm vinyl record crackle ambience, no music",8.0),
"pencil":("Pencil quickly drawing a line on paper",1.0),
"film_leader":("Old film reel starting up, projector clatter and soft beep",2.5),
}
def go(k):
    t,d=S[k]
    body={"text":t,"duration_seconds":d,"prompt_influence":0.6}
    req=urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
    try:
        open(f"{k}.mp3","wb").write(urllib.request.urlopen(req,timeout=180).read()); return k,"ok"
    except Exception as e: return k,str(e)+str(getattr(e,'read',lambda:b'')()[:200])
with cf.ThreadPoolExecutor(3) as ex:
    for r in ex.map(go,S): print(r,flush=True)
