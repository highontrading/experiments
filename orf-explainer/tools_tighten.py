# Shrink long silences in the VO, remap word timings through the same warp.
import json, re, subprocess, sys, numpy as np, wave
src, words_in, out_wav, words_out = sys.argv[1:5]
CAP = float(sys.argv[5]) if len(sys.argv) > 5 else 0.30
log = subprocess.run(["ffmpeg","-hide_banner","-i",src,"-af","silencedetect=n=-42dB:d=0.2","-f","null","-"],capture_output=True,text=True).stderr
starts=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",log)]
ends=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",log)]
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,"-ac","1","-ar","48000","build/vo_raw.wav"],check=True)
w=wave.open("build/vo_raw.wav"); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
dur=len(x)/sr
# keep segments: remove middle part of each silence beyond CAP
cuts=[]
for s,e in zip(starts,ends):
    if s<0.05: # leading silence: keep 0.05
        cuts.append((0.0,max(0,e-0.05))); continue
    if e>=dur-0.01: cuts.append((s+0.25,dur)); continue
    L=e-s
    if L>CAP:
        a=s+CAP/2; b=e-CAP/2; cuts.append((a,b))
# build output with 8ms crossfades
out=[];pos=0.0;fade=int(0.008*sr)
def seg(a,b): return x[int(a*sr):int(b*sr)].copy()
pieces=[];t=0.0
keep=[];prev=0.0
for a,b in cuts:
    if a>prev: keep.append((prev,a))
    prev=b
if prev<dur: keep.append((prev,dur))
y=np.zeros(0,np.float32)
for a,b in keep:
    p=seg(a,b)
    if len(y)>fade and len(p)>fade:
        r=np.linspace(0,1,fade)
        y[-fade:]=y[-fade:]*(1-r)+p[:fade]*r
        y=np.concatenate([y,p[fade:]])
    else: y=np.concatenate([y,p])
def warp(t):
    acc=0.0
    for a,b in keep:
        if t<a: return acc - 0  # inside a cut: map to boundary
        if t<=b: return acc+(t-a)
        acc+=b-a
    return acc
W=json.load(open(words_in))
for wd in W: wd['s']=round(warp(wd['s']),3); wd['e']=round(warp(wd['e']),3)
json.dump(W,open(words_out,'w'),indent=0)
ww=wave.open(out_wav,'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(sr)
ww.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes()); ww.close()
print("in",round(dur,2),"out",round(len(y)/sr,2),"cuts",len(cuts))
