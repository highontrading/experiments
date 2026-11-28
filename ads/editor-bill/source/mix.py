import subprocess, json, re, sys
S='/tmp/claude-0/-home-user-experiments/ca6e399f-72c8-521b-b0f2-e52a1ef0c3d2/scratchpad'
W=S+'/sfx/wav/'
BASE=S+'/Vibe Editor/output/editor-bill-base.mp4'
MUSIC=S+'/Vibe Editor/music/score-edit.mp3'
O=1.70; TOTAL=36.667
def peak(f):
    out=subprocess.run(['ffmpeg','-i',f,'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
    return float(re.search(r'max_volume: (-?[\d.]+)',out).group(1))
# (name, time, gain_dB, is_global, max_len)
G=True; A=False
cues=[
 ('ringtone',0.00,-7,G,1.44),('tap',1.42,-5,G,None),('connect',1.50,-9,G,None),('whoosh-cine',1.60,-7,G,None),
 ('sub-boom',0.02,-15,A,None),
 ('whoosh-zoom',2.40,-12,A,None),
 ('stamp-hit',4.05,-5,A,None),('sub-boom',4.06,-9,A,None),
 ('record-scratch',5.38,-8,A,None),
 ('panel-in',6.62,-14,A,None),('tick-tock',6.85,-15,A,1.55),
 ('panel-in',8.60,-14,A,None),('counter-roll',8.68,-14,A,2.25),('cash-register',10.95,-7,A,None),('sub-boom',10.98,-8,A,None),
 ('bass-whoosh',11.66,-8,A,None),
 ('ui-pop',13.68,-9,A,None),('ui-pop',14.47,-9,A,None),
 ('whoosh-cine',15.62,-10,A,None),('sub-boom',15.78,-7,A,None),('ui-pop',16.60,-11,A,None),
 ('panel-in',17.55,-14,A,None),('typing',17.95,-16,A,None),('typing',20.50,-17,A,2.7),
 ('blade',19.87,-8,A,None),('whoosh-zoom',22.62,-10,A,None),('send',23.36,-11,A,None),
 ('success',23.66,-7,A,None),('confetti',23.93,-10,A,None),
 ('whoosh-cine',24.56,-9,A,None),
 ('drumroll',24.86,-10,A,0.80),
 ('panel-in',25.50,-14,A,None),('cash-register',25.66,-7,A,None),('sub-boom',25.67,-8,A,None),
 ('ui-pop',26.98,-9,A,None),
 ('stamp-hit',28.06,-7,A,None),('stamp-hit',29.00,-8,A,None),
 ('panel-in',29.45,-14,A,None),('check',30.17,-7,A,None),('check',32.07,-7,A,None),
 ('whoosh-cine',32.86,-11,A,None),('ui-pop',32.94,-7,A,None),
]
peaks={}
args=['ffmpeg','-v','error','-y','-i',BASE,'-i',MUSIC]
fc=[]
for k,(n,t,g,isg,ml) in enumerate(cues):
    f=W+n+'.wav'
    if n not in peaks: peaks[n]=peak(f)
    args+=['-i',f]
    gt=t if isg else t+O
    gain=(-1-peaks[n])+g
    chain=f'[{k+2}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={gain:.2f}dB'
    if ml: chain+=f',atrim=0:{ml},afade=t=out:st={max(0,ml-0.08):.3f}:d=0.08'
    ms=int(round(gt*1000)); chain+=f',adelay={ms}|{ms}[s{k}]'
    fc.append(chain)
ms=int(O*1000)
fc.append(f'[0:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},asplit=2[v][vsc]')
fc.append(f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.42,afade=t=in:d=0.25,adelay={ms}|{ms}[m]')
fc.append('[m][vsc]sidechaincompress=threshold=0.025:ratio=5:attack=25:release=380:makeup=1[md]')
ins='[v][md]'+''.join(f'[s{k}]' for k in range(len(cues)))
fc.append(f'{ins}amix=inputs={len(cues)+2}:normalize=0:dropout_transition=0,atrim=0:{TOTAL},apad=whole_dur={TOTAL}[mix]')
args+=['-filter_complex',';'.join(fc),'-map','[mix]','-c:a','pcm_s16le',S+'/mix.wav']
r=subprocess.run(args,capture_output=True,text=True)
print(r.returncode, r.stderr[-2000:])
