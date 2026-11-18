"""Matte a few key frames of the Ad 1 take (RVM, warmed up on the preceding frames).
usage: python3 matte_frames.py RAW.mp4 WEIGHTS OUT_DIR t1 t2 ...   -> OUT_DIR/raw_<t>.png, OUT_DIR/fg_<t>.png (RGBA)"""
import sys, os, subprocess, numpy as np, torch
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
import rvm_net
src, wts, out = sys.argv[1:4]; ts = [float(t) for t in sys.argv[4:]]
os.makedirs(out, exist_ok=True); torch.set_num_threads(4)
net = rvm_net.load(wts); W, H = 720, 1280
for t in ts:
    t0 = max(0, t - 0.4)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t0}', '-i', src, '-t', f'{t - t0 + 0.01}', '-vf', 'fps=30',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    n = len(p) // (W * H * 3); rec = [None] * 4
    with torch.no_grad():
        for i in range(n):
            img = np.frombuffer(p[i * W * H * 3:(i + 1) * W * H * 3], np.uint8).reshape(H, W, 3)
            fgr, pha, rec = net(torch.from_numpy(img.copy()).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.4)
    fg = (fgr[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8); a = (pha[0, 0].numpy() * 255).round().astype(np.uint8)
    Image.fromarray(img).save(f'{out}/raw_{t}.png'); Image.fromarray(np.dstack([fg, a])).save(f'{out}/fg_{t}.png')
    print('matted', t, n, 'frames')
