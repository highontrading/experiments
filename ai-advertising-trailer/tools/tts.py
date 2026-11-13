import json,os,sys,urllib.request
K=os.environ['ELEVENLABS_API_KEY']
def tts(name,voice,text,model='eleven_multilingual_v2',stab=0.45,sim=0.8,style=0.3,speed=1.0):
    body={"text":text,"model_id":model,"voice_settings":{"stability":stab,"similarity_boost":sim,"style":style,"use_speaker_boost":True,"speed":speed}}
    if model=='eleven_v3': body["voice_settings"]={"stability":stab}
    r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",data=json.dumps(body).encode(),headers={"User-Agent":"curl/8","xi-api-key":K,"Content-Type":"application/json"})
    open(name+'.mp3','wb').write(urllib.request.urlopen(r).read()); print('ok',name)
JEET='WfBTMYP9caYrcT3CNdFn'; AMRUT='LHJy3mhZWsvhUjy0zUM1'; ANIKA='RABOvaPec1ymXz02oDQi'; REY='YWaBwjubozVSPD1RgnRa'
jobs={
 'L1':(JEET,"एक ad shoot के लिए... क्या क्या चाहिए?",{}),
 'L2':(AMRUT,"Studio, camera, crew, model... और कम से कम तीन हफ्ते।",{'speed':1.05}),
 'L3a':(ANIKA,"[amused] Shoot? कौन सा shoot?",{'model':'eleven_v3','stab':0.5}),
 'L3b':(ANIKA,"Shoot? ... कौन सा shoot?",{'style':0.6}),
 'L4':(REY,"Generate button तो आज सबके पास है। लेकिन AI से ऐसा ad बनाना, जो shoot किया हुआ लगे... वही है असली skill.",{'stab':0.5,'style':0.35}),
 'L5':(REY,"AI and Advertising. अब shoot... optional है।",{'stab':0.5,'style':0.4}),
}
for k in (sys.argv[1:] or jobs):
    v,t,o=jobs[k]; tts(k,v,t,**o)
