"""One decode pass over the take: save every source frame the cut uses (jpg) and RVM-matte the ones inside the composited ranges.
usage: python3 prep7.py WEIGHTS"""
import sys, os, subprocess, numpy as np, torch
from PIL import Image
import common as C
sys.path.insert(0, os.path.join(C.HERE, '..', 'build')); import rvm_net
f = C.find
RANGES = [(0, C.OS(f('premiere')) + .3),                                   # hook (words behind head) + music waveform behind
          (C.OE(f('magazine.')) - .4, C.OE(f('handwritten.')) + .4),     # magazine masthead + words behind head
          (C.OE(f('whiteboard.')) - .5, C.OS(f('because')) + .2),        # whiteboard cut-out
          (C.OS(f('back.')) - 1.4 - .3, C.OE(f('back.')) + 1.0),        # put me back
          (C.OE(f('below.')) - .5, C.SPEECH)]                             # end-card still
need = sorted(set(C.E['frames']))
matte = sorted({C.E['frames'][min(C.N - 1, int(t * 30))] for a, b in RANGES for t in np.arange(a, b, 1 / 30)})
os.makedirs(C.FR, exist_ok=True); os.makedirs(C.ALPHA, exist_ok=True)
print('frames', len(need), 'mattes', len(matte), flush=True)
torch.set_num_threads(3); net = rvm_net.load(sys.argv[1]); W, H = 1080, 1920; rec = [None] * 4; last = -99
NS, MS = set(need), set(matte); top = max(need)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', C.RAW, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
i = 0; done = 0
with torch.no_grad():
    while i <= top:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        if i in NS or i in MS or any(0 < m - i <= 8 for m in matte[:0]):
            img = np.frombuffer(b, np.uint8).reshape(H, W, 3)
            if i in NS and not os.path.exists(f'{C.FR}/{i:05d}.jpg'): Image.fromarray(img).save(f'{C.FR}/{i:05d}.jpg', quality=95)
            if i in MS and not os.path.exists(f'{C.ALPHA}/{i:05d}.png'):
                if i - last > 12: rec = [None] * 4
                _, pha, rec = net(torch.from_numpy(img.copy()).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.25)
                Image.fromarray((pha[0, 0].numpy() * 255).round().astype(np.uint8)).save(f'{C.ALPHA}/{i:05d}.png'); last = i; done += 1
                if done % 100 == 0: print('matte', done, '/', len(matte), flush=True)
        i += 1
p.kill(); print('done', flush=True)
