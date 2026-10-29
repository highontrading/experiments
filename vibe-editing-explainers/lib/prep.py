"""Write <dir>/build/assets.js: footage frame counts, cut-out objects (+ phone screens), extras."""
import json, pathlib, sys

D = pathlib.Path(sys.argv[1]).resolve()
A = D.parent / "assets"
scr = A / "objects/screens.json"
screens = json.load(open(scr)) if scr.exists() else {}
screens.update({p.name[:-len(".screen.json")]: json.load(open(p)) for p in (A / "objects").glob("*.screen.json")})
assets = {
    "footage": {d.name: len(list(d.glob("f*.jpg"))) for d in sorted((A / "footage").iterdir()) if d.is_dir()},
    "objects": {p.stem: {"path": f"../assets/objects/{p.name}", **({"screen": screens[p.stem]} if p.stem in screens else {})}
                for p in sorted((A / "objects").glob("*.png"))},
    "images": {p.stem: f"../assets/images/{p.name}" for p in sorted((A / "images").glob("*.*"))} if (A / "images").exists() else {},
}
(D / "build").mkdir(exist_ok=True)
(D / "build/assets.js").write_text("window.ASSETS = " + json.dumps(assets) + ";\n")
