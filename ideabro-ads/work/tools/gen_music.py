import json,urllib.request,os,concurrent.futures as cf
key=os.environ['ELEVENLABS_API_KEY']
T={
 "M2_tick":("Minimal electronic instrumental, ticking clock percussion, pulsing analog synth arpeggio, starts dark and sparse like midnight and gradually brightens and builds into an uplifting sunrise feel, 110 BPM, no vocals",26000),
 "M3_lux":("Elegant minimal deep house instrumental for a luxury fashion film, smooth groove, warm rhodes chords, soft shaker, sophisticated and expensive, 118 BPM, no vocals",24000),
 "M4_festive":("Modern Indian festive instrumental for a Diwali brand film, dhol groove, sitar and bansuri melody, shimmering bells, warm and celebratory with a cinematic lift, 100 BPM, no vocals",22000),
 "M5_desi":("Upbeat modern Indian indie-pop instrumental for a social media ad, bright plucky guitar, light tabla and snappy claps, catchy and positive, leaves space for a voiceover, 105 BPM, no vocals",22000),
 "M6_glitch":("Dark glitchy electronic instrumental, stuttering bit-crushed beats, digital noise and distortion for 9 seconds, then a sudden clean transition into a smooth, premium cinematic synth pad with soft piano, no vocals",22000),
 "M7_quiz":("Playful tense game-show instrumental, ticking pizzicato strings and pulsing bass, suspenseful countdown feeling with small rises every 4 seconds, modern and polished, no vocals",22000),
 "M8_vinyl":("Warm vintage soul funk instrumental with vinyl crackle, groovy bassline, rhodes, light drums, confident and cool, 92 BPM, no vocals",24000),
}
def gen(k):
    p,ms=T[k]; body={"prompt":p,"music_length_ms":ms,"model_id":"music_v2","force_instrumental":True}
    r=urllib.request.urlopen(urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":key,"Content-Type":"application/json"}),timeout=500)
    open(f"audio/music/{k}.mp3","wb").write(r.read()); return k
with cf.ThreadPoolExecutor(3) as ex:
    for k in ex.map(gen,T): print(k,'ok',flush=True)
