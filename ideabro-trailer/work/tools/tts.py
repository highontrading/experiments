import json,sys,base64,os,urllib.request
key=os.environ['ELEVENLABS_API_KEY']
def tts(voice,text,out,prev=None,nxt=None,model="eleven_multilingual_v2",settings=None):
    body={"text":text,"model_id":model,"voice_settings":settings or {"stability":0.55,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True,"speed":0.95}}
    if prev: body["previous_text"]=prev
    if nxt: body["next_text"]=nxt
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"xi-api-key":key,"Content-Type":"application/json"})
    r=urllib.request.urlopen(req,timeout=120); d=json.load(r)
    open(out,"wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"],open(out.rsplit('.',1)[0]+".align.json","w"))
    return d
if __name__=="__main__":
    tts(sys.argv[1],sys.argv[2],sys.argv[3])
