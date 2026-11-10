"""Mix voiceover + music bed (ducked) + SFX cues into one track, loudness-normalised to -14 LUFS.
usage: python mix.py <video_id> <build_dir> <sfx_dir> <music.mp3> <out.wav>
Needs numpy and ffmpeg."""
import json, subprocess, sys, numpy as np

vid, build, sfxdir, music, out = sys.argv[1:6]
SR = 48000
info = json.load(open(f'{build}/{vid}_info.json'))
total = info['total']

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

GAIN = {'whoosh': 0.32, 'impact': 0.55, 'pop': 0.32, 'tick': 0.28, 'glitch': 0.4, 'chime': 0.5, 'rewind': 0.5, 'ding': 0.45, 'thud': 0.45, 'down': 0.5}
bank = {k: load(f'{sfxdir}/{k}.mp3') for k in GAIN}
# a whoosh peaks at the cut: shift it back by the time of its loudest moment
peak = {k: (int(np.argmax(np.convolve(np.abs(v).mean(1), np.ones(2400) / 2400, 'same'))) if k == 'whoosh' else 0) for k, v in bank.items()}
N = int(total * SR) + SR
fx = np.zeros((N, 2), np.float32)
last = {}
for c in info['cues']:
    k = c['s']
    if k not in bank: continue
    if c['t'] - last.get(k, -9) < 0.25: continue        # never stack the same sound
    last[k] = c['t']
    s = bank[k] * GAIN[k] * (c.get('g', 0.5) / 0.5)
    i = int(c['t'] * SR) - peak[k]
    if i < 0: s = s[-i:]; i = 0
    j = min(N, i + len(s)); fx[i:j] += s[: j - i]
np.clip(fx, -1, 1).astype(np.float32).tofile(f'{build}/{vid}_sfx.f32')

# ffmpeg: duck music under the voice, add SFX, normalise
fc = (
    f"[1:a]atrim=0:{total},afade=t=in:d=0.6,afade=t=out:st={total - 2.6}:d=2.6,volume=0.55[mus];"
    "[0:a]aresample=48000,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=1.6,asplit=2[vo][key];"
    "[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[duck];"
    "[2:a]volume=1.0[sfx];"
    "[vo][duck][sfx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=7[out]"
)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{build}/{vid}_vo.mp3', '-i', music,
                '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', f'{build}/{vid}_sfx.f32',
                '-filter_complex', fc, '-map', '[out]', '-ar', str(SR), '-t', str(total), out], check=True)
print('mixed', out)
