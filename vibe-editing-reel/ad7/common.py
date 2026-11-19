"""Ad 7 shared timing + source access."""
import os, json, subprocess, numpy as np
from functools import lru_cache
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SC = os.environ.get('V4', '/tmp/claude-0/-home-user-experiments/67b3db71-a2b5-52d4-baa7-e442b86ff3f9/scratchpad/v4')
RAW = f'{SC}/raw/main1.mp4'
E = json.load(open(f'{HERE}/edl.json')); WD = E['words']; N = E['nframes']; SPEECH = E['speech']; FSRC = E['fps_src']
def OS(i): return WD[i]['os'] - .03
def OE(i): return WD[i]['oe']
def find(word, k=0, after=0.):
    """index of the k-th word (case/punct-insensitive) starting at output time >= after."""
    c = 0
    for i, w in enumerate(WD):
        if w['os'] >= after and w['w'].lower().strip('.,?!') == word.lower().strip('.,?!'):
            if c == k: return i
            c += 1
    raise KeyError(word)
def src_index(t):
    t = min(max(t, 0), SPEECH - 1 / 30); return E['frames'][min(N - 1, int(round(t * 30)))]
FR = f'{SC}/frames'          # decoded source frames (jpg, by source index) — filled by extract.py
def raw_src(i):
    p = f'{FR}/{i:05d}.jpg'
    if not os.path.exists(p):
        os.makedirs(FR, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{i / FSRC:.4f}', '-i', RAW, '-frames:v', '1', '-q:v', '2', p], check=True)
    return np.asarray(Image.open(p).convert('RGB'))
def raw(t): return raw_src(src_index(t))
ALPHA = f'{SC}/alpha'
def alpha(t):
    i = src_index(t)
    for k in range(0, 8):
        for q in (i - k, i + k):
            p = f'{ALPHA}/{q:05d}.png'
            if os.path.exists(p): return np.asarray(Image.open(p))
    raise FileNotFoundError(f'alpha {i}')
