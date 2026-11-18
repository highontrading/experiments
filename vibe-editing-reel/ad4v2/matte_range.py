"""RVM alpha for a list of 60fps source indices (sequential, warm-started). usage: matte_range.py RAW.mp4 WEIGHTS OUT i0 i1"""
import sys, os, subprocess, numpy as np, torch
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build')); import rvm_net
src, wts, out, i0, i1 = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]); os.makedirs(out, exist_ok=True)
torch.set_num_threads(4); net = rvm_net.load(wts); W, H = 720, 1280; rec = [None] * 4
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
with torch.no_grad():
    for idx in range(i1 + 1):
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        if idx < i0 - 12: continue
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        fgr, pha, rec = net(torch.from_numpy(img).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.5)
        if idx >= i0: Image.fromarray((pha[0, 0].numpy() * 255).round().astype(np.uint8)).resize((1080, 1920), Image.LANCZOS).save(f'{out}/{idx:05d}.png')
p.kill(); print('done')
