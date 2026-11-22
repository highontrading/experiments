# MODNet mattes for vertical frames (part k of n) -> /home/user/work3/mk/sNNNNN.png (576x1024 grey) + head/neck meta
import sys, os, json, glob, numpy as np, cv2, onnxruntime as ort
part, parts = int(sys.argv[1]), int(sys.argv[2])
so = ort.SessionOptions(); so.intra_op_num_threads = 2
sess = ort.InferenceSession("/home/user/models/modnet.onnx", so, providers=["CPUExecutionProvider"])
files = sorted(glob.glob("/home/user/work3/fr/s*.jpg"))[part::parts]; meta = {}
for p in files:
    n = int(os.path.basename(p)[1:6])
    img = cv2.imread(p); x = cv2.resize(img, (512, 896), interpolation=cv2.INTER_AREA)[:, :, ::-1].astype(np.float32)
    m = np.clip(sess.run(None, {"input": ((x / 127.5 - 1).transpose(2, 0, 1)[None])})[0][0, 0], 0, 1)
    m = cv2.resize(m, (576, 1024), interpolation=cv2.INTER_LINEAR)
    cv2.imwrite(f"/home/user/work3/mk/s{n:05d}.png", (m * 255).astype(np.uint8))
    b = m > 0.5; rows = np.where(b.any(1))[0]
    if len(rows):
        top = rows[0]; band = b[top:top + 140]; cols = np.where(band.any(0))[0]
        w = b.sum(1).astype(float); a = top + 60; seg = w[a:a + 260]
        neck = a + int(np.argmin(seg)) if len(seg) else top + 200
        meta[n] = [round(top / 1024, 4), round(cols.mean() / 576, 4), round((cols[-1] - cols[0]) / 576, 4), round(neck / 1024, 4)]
json.dump(meta, open(f"/home/user/work3/mk/meta_{part}.json", "w")); print("done", part, len(files))
