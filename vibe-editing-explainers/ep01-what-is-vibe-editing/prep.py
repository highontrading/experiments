"""Write build/timeline.js and build/assets.js for stage.html (file:// pages can't fetch JSON)."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
A = ROOT.parent / "assets"
tl = json.load(open(ROOT / "build/timeline.json"))
(ROOT / "build/timeline.js").write_text("window.TL = " + json.dumps(tl) + ";\n")
screens = json.load(open(A / "objects/screens.json"))
assets = {
    "footage": {d.name: len(list(d.glob("f*.jpg"))) for d in sorted((A / "footage").iterdir())},
    "objects": {p.stem: {"path": f"../assets/objects/{p.name}", **({"screen": screens[p.stem]} if p.stem in screens else {})}
                for p in sorted((A / "objects").glob("*.png"))},
    "paper": "../assets/paper/motion_picture_news_1918_p35.jpg",
}
(ROOT / "build/assets.js").write_text("window.ASSETS = " + json.dumps(assets) + ";\n")
print("footage:", assets["footage"]); print("objects:", list(assets["objects"]))
