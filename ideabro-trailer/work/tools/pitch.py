import librosa,numpy as np,sys
for f in sys.argv[1:]:
    a=f.split(':'); y,sr=librosa.load(a[0],sr=16000,offset=float(a[1]) if len(a)>1 else 0,duration=float(a[2]) if len(a)>2 else None)
    f0,v,_=librosa.pyin(y,fmin=60,fmax=300,sr=sr); f0=f0[v]
    print(a[0].split('/')[-1], f"dur={len(y)/sr:.2f}s medianF0={np.nanmedian(f0):.0f}Hz p10-90={np.nanpercentile(f0,10):.0f}-{np.nanpercentile(f0,90):.0f}")
