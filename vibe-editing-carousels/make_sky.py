"""Paint the cloud-sky backdrop: a soft blue sky with lit cumulus, a bit of haze.

Writes assets/img/sky.jpg at 1300x1620 (a little larger than the 1080x1350 slide,
so the stage can drift and zoom it). Film grain is added live by the stage.
"""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1300, 1620
rng = np.random.default_rng(7)


def noise(scale):
    """Smooth value noise: a random grid upsampled with bicubic."""
    gw, gh = max(2, int(W / scale)) + 2, max(2, int(H / scale)) + 2
    g = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8))
    return np.asarray(g.resize((W, H), Image.BICUBIC), dtype=np.float32) / 255


def fbm(base, octaves=6, gain=0.52):
    v, amp, tot, s = 0, 1.0, 0, base
    for _ in range(octaves):
        v = v + amp * noise(s)
        tot += amp
        amp *= gain
        s /= 2.1
    return v / tot


y = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
x = np.ones((H, 1)) * np.linspace(0, 1, W)[None, :]

# Cloud density: big puffy masses, denser toward the lower half and right side,
# with a clearer patch top-left like the reference.
def blur(a, r):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def shift_down(a, k):
    """b[y] = a[y - k], edge-padded: the value k px above."""
    return np.concatenate([np.repeat(a[:1], k, axis=0), a[:-k]], axis=0)


base = fbm(380) + 0.16 * (y - 0.4) + 0.06 * (x - 0.5) \
    - 0.10 * np.exp(-((x - 0.22) ** 2 + (y - 0.16) ** 2) / 0.05)
detail = fbm(70, 5)
dens = base + 0.10 * (detail - 0.5)
d = np.clip((dens - 0.46) / 0.16, 0, 1)
d = d * d * (3 - 2 * d)

# Light from above: lit where the cloud above is thinner; thick bellies go warm grey.
T = blur(d, 18)
lit = np.clip(0.62 + 2.2 * (T - shift_down(T, 34)), 0, 1)
lit = lit * (0.82 + 0.36 * detail)
belly = np.clip(blur(d, 60) * 1.4 - 0.5, 0, 1)
lit = np.clip(lit - 0.25 * belly * (1 - lit), 0, 1)

sky_top = np.array([84, 130, 192], np.float32)
sky_bot = np.array([146, 182, 222], np.float32)
sky = sky_top[None, None] * (1 - y[..., None]) + sky_bot[None, None] * y[..., None]
sky = sky + (fbm(160, 4)[..., None] - 0.5) * 18          # mottled blue

cloud_hi = np.array([252, 250, 246], np.float32)
cloud_lo = np.array([196, 186, 174], np.float32)            # warm beige bellies
cloud = cloud_lo[None, None] * (1 - lit[..., None]) + cloud_hi[None, None] * lit[..., None]

a = np.clip(d * 1.1, 0, 1)[..., None]
img = sky * (1 - a) + cloud * a
img = img * 0.97 + 6                                        # lift blacks, slightly flat

out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.4))
out.save("assets/img/sky.jpg", quality=92)
print("-> assets/img/sky.jpg", out.size)
