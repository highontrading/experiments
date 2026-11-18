# MODNet portrait matte for a frame or directory of frames.
import sys, os, numpy as np, onnxruntime as ort, cv2, time
sess = ort.InferenceSession(os.environ.get("MODNET", "/home/user/models/modnet.onnx"),
                            providers=["CPUExecutionProvider"])
def matte(img_bgr, H=512):
    h, w = img_bgr.shape[:2]
    W = int(round(w * H / h / 32)) * 32
    x = cv2.resize(img_bgr, (W, H), interpolation=cv2.INTER_AREA)[:, :, ::-1].astype(np.float32)
    x = (x / 127.5 - 1.0).transpose(2, 0, 1)[None]
    m = sess.run(None, {"input": x})[0][0, 0]
    return m
if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    img = cv2.imread(src); t = time.time(); m = matte(img); print("ms", (time.time()-t)*1000)
    cv2.imwrite(dst, (np.clip(m, 0, 1) * 255).astype(np.uint8))
