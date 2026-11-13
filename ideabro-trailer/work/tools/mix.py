import json,subprocess,numpy as np,soundfile as sf,sys
SR=48000
T=json.load(open('src/data/timeline.json')); N=int((T['total']+0.3)*SR)
def load(p,sr=SR,ch=2):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac',str(ch),'-ar',str(sr),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,ch).copy()
def ff(x,af):
    sf.write('/tmp/_in.wav',x,SR); subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/_in.wav','-af',af,'/tmp/_out.wav']); return sf.read('/tmp/_out.wav',dtype='float32')[0]
def place(buf,x,t,g_db=0.0):
    i=int(round(t*SR)); 
    if i<0: x=x[-i:]; i=0
    n=min(len(x),len(buf)-i)
    if n>0: buf[i:i+n]+=x[:n]*10**(g_db/20)
def db(x): return 20*np.log10(max(1e-9,x))
# ---- VO ----
vo=np.zeros((N,2),np.float32)
for l in T['vo']:
    x=load(f"audio/vo/{l['id']}_proc.wav"); place(vo,x,l['s'])
vo=ff(vo,"highpass=f=75,equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=4000:t=q:w=1:g=2.5,acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=2")
# ---- music ----
m=load('audio/music/bed_v3.mp3'); off=int(T['musicOffset']*SR); m=m[off:off+N]
m=np.pad(m,((0,max(0,N-len(m))),(0,0)))
# after the peak, splice the bar-aligned build (track 40-46 s) so the bed climbs into the hard stop
full=load('audio/music/bed_v3.mp3'); peakT=48.0-T['musicOffset']; sp=peakT+0.12
seg=full[int(40.12*SR):int(40.12*SR)+int((T['total']-sp+0.2)*SR)]
i0=int(sp*SR); n=min(len(seg),N-i0); xf=int(0.12*SR)
r=np.linspace(0,1,xf)[:,None]
m[i0:i0+xf]=m[i0:i0+xf]*(1-r)+seg[:xf]*r; m[i0+xf:i0+n]=seg[xf:n]
mhp=ff(m,"highpass=f=180:poles=2,highpass=f=180:poles=2")
t=np.arange(N)/SR
a,b=T['proof'][0]-0.1,T['proof'][1]-0.05
w=np.clip((t-a)/0.3,0,1)*np.clip((b-t)/0.3,0,1)
mus=m*(1-w)[:,None]+mhp*w[:,None]*1.25
stop=T['musicStop']; mus*=np.clip((stop-t)/0.035,0,1)[:,None]
# duck under VO (envelope follower)
env=np.abs(vo).max(1); k=int(0.01*SR); env=np.convolve(env,np.ones(k)/k,'same')
sm=np.zeros_like(env); att=np.exp(-1/(0.03*SR)); rel=np.exp(-1/(0.35*SR)); s=0
for i in range(0,N,48):
    e=env[i]; c=att if e>s else rel; c=c**48; s=e+(s-e)*c; sm[i:i+48]=s
duck=1-0.55*np.clip(sm/0.08,0,1)
mus=mus*duck[:,None]*10**(-3/20)
# ---- sfx ----
fx=np.zeros((N,2),np.float32); cache={}
for c in T['sfx']:
    if c['n'] not in cache: cache[c['n']]=load(f"audio/sfx/{c['n']}.mp3")
    x=cache[c['n']]
    if abs(c['r']-1)>1e-3:
        idx=np.arange(0,len(x)-1,c['r']); x=np.stack([np.interp(idx,np.arange(len(x)),x[:,j]) for j in range(2)],1).astype(np.float32)
    place(fx,x,c['t'],c['g'])
pj=load('audio/sfx/projector.mp3')
for a,b in T['projector']:
    seg=np.tile(pj,(int((b-a)/ (len(pj)/SR))+2,1))[:int((b-a)*SR)]
    r=np.linspace(0,1,len(seg)); fade=np.clip(np.minimum(r*(b-a)/0.15,(1-r)*(b-a)/0.15),0,1)
    place(fx,seg*fade[:,None],a,-20)
mix=vo*1.0+mus+fx
sf.write('audio/mix_pre.wav',mix,SR)
# two-pass loudnorm to -14 LUFS, -1 dBTP
r=subprocess.run(['ffmpeg','-hide_banner','-i','audio/mix_pre.wav','-af','loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
js=json.loads(r[r.rindex('{'):r.rindex('}')+1])
af=f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg','-v','error','-y','-i','audio/mix_pre.wav','-af',af,'-ar','48000','-t',str(T['total']),'audio/mix_final.wav'])
print('pre-mix', js['input_i'],'LUFS ->', 'final written')
