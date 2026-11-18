import sys, os, json, numpy as np, cv2
os.environ.setdefault("OMP_NUM_THREADS", "2")
import onnxruntime as ort
n, part, parts = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
W = "/home/user/work"; edl = json.load(open("/home/user/experiments/vibe-editing-ads/edit/edl.json"))[n]
so = ort.SessionOptions(); so.intra_op_num_threads = 2
sess = ort.InferenceSession("/home/user/models/modnet.onnx", so, providers=["CPUExecutionProvider"])
need = set()
for s in edl["segments"]:
    for f in range(int(s["in"] * 30) - 2, int(s["out"] * 30) + 3): need.add(max(0, f))
need = sorted(need)[part::parts]
os.makedirs(f"{W}/mk_{n}", exist_ok=True); meta = {}
for f in need:
    p = f"{W}/fr_{n}/s{f+1:05d}.jpg"
    if not os.path.exists(p): continue
    img = cv2.imread(p); x = cv2.resize(img, (576, 512), interpolation=cv2.INTER_AREA)[:, :, ::-1].astype(np.float32)
    x = (x / 127.5 - 1).transpose(2, 0, 1)[None]
    m = np.clip(sess.run(None, {"input": x})[0][0, 0], 0, 1)
    cv2.imwrite(f"{W}/mk_{n}/s{f+1:05d}.png", (m * 255).astype(np.uint8))
    b = m > 0.5; rows = np.where(b.any(1))[0]
    if len(rows):
        top = rows[0]; band = b[top:top + 200]   # head band (~ top 200 of 512 rows)
        cols = np.where(band.any(0))[0]
        meta[f] = [round(top / 512, 4), round(cols.mean() / 576, 4) if len(cols) else .5,
                   round((cols[-1] - cols[0]) / 576, 4) if len(cols) else .4]
json.dump(meta, open(f"{W}/mk_{n}/meta_{part}.json", "w"))
print(n, part, "done", len(need))
