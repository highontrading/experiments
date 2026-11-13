import json,subprocess,numpy as np,soundfile as sf,sys
sys.path.insert(0,'work/tools'); from words import words
SR=48000; TEMPO=1.03; MAXGAP=0.24
S=[l for l in json.load(open('work/script.json')) ]
GAP_AFTER={'L01':.45,'L02':.5,'L03':.35,'L04':.3,'L05':.35,'L06':.35,'L07':.4,'L08':.35,'L09':.25,'L10':.45,'L11':.3,'L12':.65,'L13':.35,'L14':.4,'L15':.75,'L16':.3,'L17':.3,'L18':0}
def load(p):
    return subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
out=[]; t=0.0; master=[]
for l in S:
    y=np.frombuffer(load(f"audio/vo/{l['id']}.mp3"),dtype=np.float32).copy()
    W=words(f"audio/vo/{l['id']}.align.json")
    # true audio end: last sample above -45 dBFS envelope
    env=np.convolve(np.abs(y),np.ones(480)/480,'same'); thr=10**(-45/20)
    idx=np.where(env>thr)[0]; a_end=(idx[-1]/SR+0.06) if len(idx) else len(y)/SR
    a_start=max(0,(idx[0]/SR-0.02)) if len(idx) else 0
    # build keep segments, compressing gaps between words
    segs=[]; mapping=[]  # (orig_t, new_t)
    cur=a_start; newt=0.0; pieces=[]
    for i,(w,ws,we) in enumerate(W):
        if i>0:
            pe=W[i-1][2]; gap=ws-pe
            if gap>MAXGAP+0.06:
                # keep pe..pe+MAXGAP/2 and ws-MAXGAP/2..ws
                cut_a=pe+MAXGAP/2; cut_b=ws-MAXGAP/2
                pieces.append((cur,cut_a)); cur=cut_b
    pieces.append((cur,a_end))
    # assemble with 8ms crossfades
    xf=int(0.008*SR); buf=np.zeros(0,np.float32); offs=[]
    for (a,b) in pieces:
        seg=y[int(a*SR):int(b*SR)].copy()
        offs.append((a,len(buf)/SR - (xf/SR if len(buf) else 0)))
        if len(buf) and len(seg)>xf:
            r=np.linspace(0,1,xf,dtype=np.float32); buf[-xf:]=buf[-xf:]*(1-r)+seg[:xf]*r; buf=np.concatenate([buf,seg[xf:]])
        else: buf=np.concatenate([buf,seg])
    def mapt(x):
        best=None
        for (a,b),(oa,nb) in zip(pieces,offs):
            if x>=a-1e-6: best=(oa,nb)
        oa,nb=best; return (x-oa+nb)/TEMPO
    sf.write('/tmp/_t.wav',buf,SR)
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/_t.wav','-filter:a',f'atempo={TEMPO}','-ar',str(SR),f"audio/vo/{l['id']}_proc.wav"])
    d=sf.info(f"audio/vo/{l['id']}_proc.wav").duration
    ww=[{'w':w,'s':round(t+mapt(max(ws,a_start)),3),'e':round(t+mapt(min(we,a_end)),3)} for w,ws,we in W]
    master.append({'id':l['id'],'text':l['text'],'start':round(t,3),'end':round(t+d,3),'words':ww})
    t+=d+GAP_AFTER[l['id']]
json.dump(master,open('work/vo_timeline.json','w'),indent=1)
for m in master: print(m['id'],f"{m['start']:6.2f}-{m['end']:6.2f}",' '.join(f"{w['w']}@{w['s']:.2f}" for w in m['words']))
print('VO ends',master[-1]['end'])
