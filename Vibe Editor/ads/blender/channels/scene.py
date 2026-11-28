"""Ad 2 'CHANNELS': one black retro CRT on a seamless light-grey sweep, soft studio light (poster look)."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common as K  # noqa: E402
C = K.C

C.reset(seed=11)
grey = C.mat("sweep_grey", (0.60, 0.60, 0.61), 0.85)
K.sweep(width=10, depth=8, height=6, radius=2.2, m=grey, y0=0.9)

e, scr = K.tv("hero", (0, 0, 0), w=0.62, style="black", layout="bottom", on=True)

C.world((0.55, 0.55, 0.56), strength=0.18)
C.area((-1.4, -1.6, 2.0), (0, 0, 0.3), 200, (1.6, 1.2), (1.0, 0.97, 0.93), "RECTANGLE", name="key", reflect=True)
C.area((1.6, -1.4, 0.6), (0, 0, 0.3), 70, 1.4, (0.92, 0.95, 1.0), "DISK", name="fill", reflect=False)
C.area((0.0, 1.2, 1.6), (0, 0.2, 0.3), 90, 1.0, (1.0, 1.0, 1.0), "DISK", name="rim", reflect=False)

cam = C.camera("cam", [(1, (0.0, -2.55, 0.36), (0.0, 0.0, 0.30))], lens=70, fstop=5.6, handheld=0.0)
C.sc.camera = cam
C.render_settings(frames=(1, 1), res=(1296, 2304), fps=30, samples=96, motion_blur=False)
C.compositor(bloom_mix=-0.85, bloom_threshold=1.0, bloom_size=7, distortion=-0.004, dispersion=0.004)
C.save()
