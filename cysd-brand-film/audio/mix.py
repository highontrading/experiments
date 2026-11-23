import subprocess,numpy as np,json
SR=48000;DUR=90.0;N=int(SR*DUR)
def load(f,filt=None):
    cmd=['ffmpeg','-v','error','-i',f]+(['-af',filt] if filt else [])+['-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,np.float32).reshape(-1,2).copy()
def db(x):return 10**(x/20)
def peak_off(a):
    env=np.convolve(np.abs(a[:,0]),np.ones(240)/240,'same');return env.argmax()/SR
def place(bus,a,t,g=0.0,fade_out=None,maxlen=None):
    if maxlen: a=a[:int(maxlen*SR)].copy()
    if fade_out:
        n=min(len(a),int(fade_out*SR));a[-n:]*=np.linspace(1,0,n)[:,None]
    s=int(round(t*SR));
    if s<0:a=a[-s:];s=0
    e=min(N,s+len(a));bus[s:e]+=a[:e-s]*db(g)
# ---------- VO
vo=np.zeros((N,2),np.float32)
VOF="highpass=f=85,equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3dB,aecho=0.8:0.5:38:0.06"
P={0:4.40,1:12.40,2:20.45,3:24.55,4:33.0,5:40.85,6:47.0,7:53.2,8:59.3,9:66.0,11:80.9}
for i,t in P.items(): place(vo,load(f'vo{i:02d}.wav',VOF),t,0)
v10=load('vo10.wav',VOF)
for (a,b),t in zip([(0,1.0),(1.1,2.6),(2.6,None)],[74.0,75.88,77.91]):
    seg=v10[int(a*SR):(int(b*SR) if b else None)].copy();n=int(0.03*SR);seg[-n:]*=np.linspace(1,0,n)[:,None];place(vo,seg,t,0)
vo/=np.abs(vo).max()+1e-9;vo*=db(-3)
# ---------- music with ducking
mu=load('music_a.mp3');mu=mu[:N] if len(mu)>=N else np.vstack([mu,np.zeros((N-len(mu),2),np.float32)])
mu/=np.abs(mu).max()+1e-9
env=np.convolve(np.abs(vo[:,0]),np.ones(int(0.05*SR))/int(0.05*SR),'same')
act=(env>0.01).astype(np.float32)
# smooth gate: attack 120ms, release 450ms
g=np.zeros(N,np.float32);a_=1-np.exp(-1/(0.12*SR));r_=1-np.exp(-1/(0.45*SR));cur=0
step=48
for i in range(0,N,step):
    tgt=act[i];k=1-(1-(a_ if tgt>cur else r_))**step;cur+= (tgt-cur)*k;g[i:i+step]=cur
duck=db(-7.5*g)
t=np.arange(N)/SR
musg=db(-2.0)*np.ones(N)
musg*=np.where(t>88.6,np.clip(1-(t-88.6)/1.4,0,1),1)          # end fade
musg*=np.clip(t/0.25,0,1)
mu*= (duck*musg)[:,None]
# ---------- SFX
sx=np.zeros((N,2),np.float32)
S={k:load(f'sfx/{k}.mp3') for k in ['stamp1','stamp2','boom','shutter','tape','paper_slide','paper_rustle','whoosh_big','whoosh_soft','riser','typewriter','tw_bell','pencil','flip_counter','projector','crackle','film_leader','pageflip']}
for k in S: S[k]/=np.abs(S[k]).max()+1e-9
def hit(k,t,g,**kw): place(sx,S[k],t-peak_off(S[k]),g,**kw)
# intro
place(sx,S['film_leader'],0.0,-14,fade_out=0.6)
place(sx,S['projector'],0.0,-21,fade_out=1.5,maxlen=4.4)
place(sx,S['typewriter'],0.85,-15,fade_out=0.15,maxlen=1.45)
place(sx,S['tw_bell'],2.25,-17)
place(sx,S['typewriter'],2.55,-20,fade_out=0.1,maxlen=0.9)
# stamps (visual impact at a+0.11)
for tt,k,gg in [(3.0,'stamp1',-5),(8.08,'stamp2',-7),(23.3,'stamp1',-3),(38.6,'stamp2',-7),(45.02,'stamp1',-7),(51.12,'stamp2',-7),(57.22,'stamp1',-7),(63.32,'stamp2',-7),
                (74.07,'stamp1',-2),(76.07,'stamp1',-2),(78.07,'stamp1',-2),(87.0,'stamp2',-8)]:
    hit(k,tt+0.11,gg)
for tt in [74.07,76.07,78.07]: hit('boom',tt+0.11,-15,fade_out=1.0)
hit('boom',23.41,-12,fade_out=1.5)
# timeline cards
for i,tt in enumerate([20.57,21.06,21.57,22.06,22.57,23.08]): hit('stamp2' if i%2 else 'paper_slide',tt+0.11,-14)
# triangle wipes
for a in [4.06,20.3,32.5]: hit('whoosh_big',a,-9)
# sheet slides (incoming lands ~a+0.3td)
for a,td in [(12.1,.55),(24.3,.55),(40.6,.5),(46.7,.5),(52.8,.5),(58.9,.5),(73.1,.6),(80.6,.55)]:
    hit('whoosh_soft',a-0.15,-13); hit('paper_slide',a+0.05,-12)
# hero entrances & polaroids in pillars
for a in [32.5,40.6,46.7,52.8,58.9]:
    hit('paper_rustle',a+0.6,-18); hit('tape',a+1.05,-19)
# typing bursts
for tt,d,gg in [(18.4,1.3,-19),(28.3,0.55,-21),(29.9,0.35,-21),(82.8,1.7,-21)]: place(sx,S['typewriter'],tt,gg,fade_out=0.1,maxlen=d)
for a in [32.5,40.6,46.7,52.8,58.9]: place(sx,S['typewriter'],a+0.3,-21,fade_out=0.1,maxlen=0.7)
# pencil underlines / rules
for tt in [10.5,16.2,17.85,28.6,30.3,82.2]: place(sx,S['pencil'],tt,-20,maxlen=0.6,fade_out=0.2)
# counters
place(sx,S['flip_counter'],26.3,-18); place(sx,S['flip_counter'],29.3,-20,maxlen=1.0,fade_out=0.3)
# montage
place(sx,S['riser'],65.0-3.3,-15)
hit('boom',65.0,-6,fade_out=2.0); hit('whoosh_big',65.0,-12)
for i,a in enumerate([0.30,0.80,1.55,2.05,2.85,3.35,4.10,4.60,5.20]):
    hit(['shutter','paper_slide','tape'][i%3],65.0+a+0.12,-13)
for tt in [66.06,67.57,68.82,70.08]: hit('whoosh_soft',tt,-17)
hit('boom',70.93+0.12,-3,fade_out=2.5); hit('whoosh_big',70.93,-10)
# room tone crackle
cr=S['crackle']
for k in range(12): place(sx,cr,k*7.9,-33)
# ---------- master
mix=mu*db(-1.5)+vo*db(0)+sx*db(-1)
mix[:,:]=np.tanh(mix*1.1)/1.1
mix/=np.abs(mix).max();mix*=db(-1.0)
import wave
pcm=(np.clip(mix,-1,1)*32767).astype('<i2')
w=wave.open('mix_raw.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes());w.close()
# music+sfx only alt
alt=mu*db(-1.0)+sx*db(-1);alt=np.tanh(alt*1.1)/1.1;alt/=np.abs(alt).max();alt*=db(-1.0)
w=wave.open('mix_novo_raw.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(alt,-1,1)*32767).astype('<i2').tobytes());w.close()
print('ok')
