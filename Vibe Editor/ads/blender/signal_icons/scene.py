"""Icons-only layer of the Signal scene (everything else held out, transparent film)."""
import os
os.environ["ICONS"] = "1"
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "signal", "scene.py")
exec(compile(open(SRC).read(), SRC, "exec"), {"__file__": SRC, "__name__": "__main__"})
