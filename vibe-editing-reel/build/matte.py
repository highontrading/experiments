"""Matte the subject on every used source frame (RVM) and find the face (OpenCV Haar, smoothed later).
usage: python3 matte.py RAW_MP4 WEIGHTS OUT_DIR edl.json [limit]
writes OUT_DIR/fg/NNNNN.webp (RGBA), OUT_DIR/raw/NNNNN.jpg, OUT_DIR/faces.json   (NNNNN = 60 fps index)"""
import sys, json, subprocess, os, time, bisect
import numpy as np, torch, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rvm_net

src, weights, out, edl = sys.argv[1:5]
limit = int(sys.argv[5]) if len(sys.argv) > 5 else 10**9
torch.set_num_threads(4)
net = rvm_net.load(weights)
W, H, SFPS = 720, 1280, 60
e = json.load(open(edl))
want = set(int(round(t * SFPS)) for t in e['frame_src'])
want |= set(range(int(51.0 * SFPS), int(56.5 * SFPS), 2)) | set(range(int(58.0 * SFPS), int(67.0 * SFPS), 2))  # profile B-roll
wl = sorted(want); last_want = wl[-1]
os.makedirs(f'{out}/fg', exist_ok=True); os.makedirs(f'{out}/raw', exist_ok=True)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
cas = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
prof = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
rec = [None] * 4; faces = {}; idx = -1; done = 0; t0 = time.time(); last = -999
with torch.no_grad():
    while idx < last_want:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        idx += 1
        use = idx in want
        if not use:
            k = bisect.bisect_left(wl, idx)          # warm up the recurrent state just before a used range
            if k >= len(wl) or wl[k] - idx > 12 or idx % 2: continue
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        if idx - last > 30: rec = [None] * 4
        x = torch.from_numpy(img.copy()).permute(2, 0, 1).float().div(255).unsqueeze(0)
        fgr, pha, rec = net(x, *rec, downsample_ratio=0.4)
        last = idx
        if not use: continue
        a = (pha[0, 0].numpy() * 255).round().astype(np.uint8)
        fg = (fgr[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)   # spill-free colour
        Image.fromarray(np.dstack([fg, a])).save(f'{out}/fg/{idx:05d}.webp', quality=92, method=3)
        Image.fromarray(img).save(f'{out}/raw/{idx:05d}.jpg', quality=90)
        g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        f = cas.detectMultiScale(g, 1.1, 5, minSize=(50, 50)); kind = 'front'
        if len(f) == 0:
            kind = 'profile'
            f = list(prof.detectMultiScale(g, 1.1, 4, minSize=(50, 50)))
            f += [(W - x - w, y, w, h) for (x, y, w, h) in prof.detectMultiScale(cv2.flip(g, 1), 1.1, 4, minSize=(50, 50))]
        ys, xs = np.nonzero(a[:, ::4] > 128)
        top = int(ys.min()) if len(ys) else 0
        rec_face = [int(v) for v in max(f, key=lambda r: r[2] * r[3])] + [kind] if len(f) else None
        faces[idx] = dict(face=rec_face, top=top)
        done += 1
        if done % 100 == 0: print(done, 'frames', round((time.time() - t0) / done, 3), 's/frame', flush=True)
        if done >= limit: break
p.kill()
json.dump(faces, open(f'{out}/faces.json', 'w'))
print('done', done, 'frames in', round(time.time() - t0), 's')
