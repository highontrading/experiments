#!/usr/bin/env python3
"""Layer 2: earshot listens to every Openverse candidate and keeps the ones that work.

Claude cannot hear. earshot can: a CLAP text-audio model ranks each file against the description in the plan
("a fast clean air whoosh swish ..."), and its realness model says whether the file is a real recording or
code-synthesized. Survivors go into a sorted library that real-sfx reads directly (catalog.json). A type with
too few survivors gets new takes from `earshot make` (rendered from earshot's catalogue of designs learned from
public-domain recordings), marked as generated in the credits.

    python earshot_pick.py --plan plans/x.json --candidates work/candidates --library library
    (run it with the Python that has earshot[listen], e.g. ~/.venvs/sfx/bin/python)

Writes LIBRARY/<type>/..., LIBRARY/catalog.json (file, type, source), LIBRARY/picks.json (every score) and
LIBRARY/CREDITS.md.
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

GOOD = ("strong", "plausible")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plan", required=True)
    ap.add_argument("--candidates", required=True, help="folder written by openverse_fetch.py")
    ap.add_argument("--library", required=True, help="output library folder (sorted pack for real-sfx)")
    ap.add_argument("--keep", type=int, default=6, help="best files kept per type")
    ap.add_argument("--min", type=int, default=3, help="fewer good files than this: earshot makes the rest")
    ap.add_argument("--min-real", type=float, default=0.5, help="drop candidates earshot hears as synthesized")
    ap.add_argument("--no-make", action="store_true", help="never generate, leave thin types thin")
    a = ap.parse_args()

    from earshot import api   # models load once and stay warm for every type

    plan = json.loads(Path(a.plan).read_text())
    cand = Path(a.candidates)
    lib = Path(a.library)
    lib.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((cand / "manifest.json").read_text()) if (cand / "manifest.json").exists() else {}
    catalog, picks, credits = [], {}, []

    for p in plan:
        stype, query = p["type"], p.get("listen") or p["queries"][0]
        folder = cand / stype
        files = sorted(x for x in folder.glob("*") if x.is_file()) if folder.exists() else []
        rows = []
        if files:
            ranked = api.rank([str(f) for f in files], query)
            for r in ranked["results"]:
                try:
                    real = api.realness(r["path"])
                    r["p_real"], r["real_verdict"] = real.get("p_real"), real.get("verdict")
                except Exception as e:   # noqa: BLE001
                    r["p_real"], r["real_verdict"] = None, f"error: {e}"
                rows.append(r)
        good = [r for r in rows if r["verdict"] in GOOD and not r["near_silent"]
                and (r["p_real"] is None or r["p_real"] >= a.min_real)]
        kept = good[:a.keep]
        (lib / stype).mkdir(exist_ok=True)
        for r in kept:
            src = Path(r["path"])
            shutil.copy2(src, lib / stype / src.name)
            m = manifest.get(f"{stype}/{src.name}", {})
            catalog.append({"file": f"{stype}/{src.name}", "type": stype,
                            "source": m.get("title") or src.stem, "origin": "openverse", "z": r["z"],
                            "p_real": r["p_real"]})
            credits.append(m | {"file": f"{stype}/{src.name}"})
        made = []
        if len(kept) < a.min and not a.no_make:
            n = a.min - len(kept)
            out = lib / stype / f"earshot_{stype}.wav"
            res = api.make(query, str(out), n=n)
            for f in res.get("files", []):
                f = Path(f)
                catalog.append({"file": f"{stype}/{f.name}", "type": stype, "source": f"earshot {res.get('sound')}",
                                "origin": "earshot-make"})
                made.append(f.name)
            print(f"  earshot make: {res.get('summary', '').splitlines()[0] if res.get('summary') else made}")
        picks[stype] = {"query": query, "candidates": len(files), "kept": [Path(r["path"]).name for r in kept],
                        "made": made, "scores": [{k: r.get(k) for k in ("name", "z", "verdict", "p_real",
                                                                         "real_verdict", "sounds_most_like")}
                                                 for r in rows]}
        best = f"best z {rows[0]['z']:+.1f} ({rows[0]['verdict']})" if rows else "no candidates"
        print(f"[{stype}] {len(files)} heard, {len(good)} good, kept {len(kept)}, made {len(made)}; {best}")

    (lib / "catalog.json").write_text(json.dumps(catalog, indent=1, ensure_ascii=False))
    (lib / "picks.json").write_text(json.dumps(picks, indent=1, ensure_ascii=False))
    lines = ["# Sound credits", "", "Openverse sounds kept by earshot. CC0 / PDM need no attribution; it is listed "
             "anyway. Files named `earshot_*` were rendered by earshot (yours to use).", "",
             "| file | title | creator | licence | source |", "|---|---|---|---|---|"]
    for c in credits:
        lines.append(f"| `{c['file']}` | {c.get('title', '')} | {c.get('creator', '')} | "
                     f"{(c.get('license') or '').upper()} {c.get('license_version') or ''} | {c.get('landing', '')} |")
    (lib / "CREDITS.md").write_text("\n".join(lines) + "\n")
    print(f"library: {lib} ({len(catalog)} sounds) -> catalog.json, picks.json, CREDITS.md")


if __name__ == "__main__":
    sys.exit(main())
