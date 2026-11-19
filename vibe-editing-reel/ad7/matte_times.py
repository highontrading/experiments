"""RVM alpha for a native 1080x1920 take at given source times (or a contiguous frame range, warm-started).
usage: matte_times.py RAW.mp4 WEIGHTS OUT_DIR  --range f0 f1   |  --times t1,t2,..   (times in seconds; files named by source frame index)"""
import sys, os, subprocess, json, numpy as np, torch
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build')); import rvm_net
src, wts, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True); a = sys.argv[4:]
fps = eval(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip())
torch.set_num_threads(int(os.environ.get('OMP_NUM_THREADS', 4))); net = rvm_net.load(wts); W, H = 1080, 1920
def frames(i0, i1):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{max(0, i0 - 10) / fps:.4f}', '-i', src, '-frames:v', str(i1 - max(0, i0 - 10) + 1), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    k = max(0, i0 - 10)
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        yield k, np.frombuffer(b, np.uint8).reshape(H, W, 3); k += 1
def run(i0, i1):
    rec = [None] * 4
    with torch.no_grad():
        for idx, img in frames(i0, i1):
            fgr, pha, rec = net(torch.from_numpy(img.copy()).permute(2, 0, 1).float().div(255)[None], *rec, downsample_ratio=0.25)
            if idx >= i0: Image.fromarray((pha[0, 0].numpy() * 255).round().astype(np.uint8)).save(f'{out}/{idx:05d}.png')
if a[0] == '--range': run(int(a[1]), int(a[2]))
else:
    for t in [float(x) for x in a[1].split(',')]: i = int(round(t * fps)); run(i, i)
print('done', fps)
