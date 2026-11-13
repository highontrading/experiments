import json,sys
sys.path.insert(0,'work/tools')
from tts import tts
S=json.load(open('work/script.json'))
for i,l in enumerate(S):
    prev=' '.join(x['text'] for x in S[max(0,i-2):i]) or None
    nxt=S[i+1]['text'] if i+1<len(S) else None
    tts("nPczCjzI2devNBz1zQrb",l['text'],f"audio/vo/{l['id']}.mp3",prev=prev,nxt=nxt,
        settings={"stability":0.6,"similarity_boost":0.8,"style":0.2,"use_speaker_boost":True,"speed":0.9})
    print(l['id'],'ok',flush=True)
