"""Close-up camera on the hero TV of the wall scene (same seeded layout)."""
import os
os.environ["CAM"] = "close"
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "wall", "scene.py")
exec(compile(open(SRC).read(), SRC, "exec"), {"__file__": SRC, "__name__": "__main__"})
