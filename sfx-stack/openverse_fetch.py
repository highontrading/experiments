#!/usr/bin/env python3
"""Layer 1: search Openverse for free sounds and download candidates.

Openverse (WordPress) indexes ~5M openly licensed audio files (Freesound, Jamendo, Wikimedia...).
The API needs no key for light use: https://api.openverse.org/v1/audio/

    python openverse_fetch.py --plan plan.json --out work/candidates
    python openverse_fetch.py --type whoosh --query "fast whoosh" --query "swoosh transition" --out work/candidates

Each plan entry is {"type": "<real-sfx pack type>", "queries": [...], "n": 10}. Files land in
OUT/<type>/ov_<id>.<ext> with OUT/manifest.json holding title, creator, licence and landing URL for
every file, so credits can always be written. Licences default to cc0,pdm (no attribution needed);
add --license by to widen the pool (then credits are REQUIRED).
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.openverse.org/v1/audio/"
TOKEN_URL = "https://api.openverse.org/v1/auth_tokens/token/"
UA = "sfx-stack/1.0 (openverse-fetch)"
_TOKEN = None
WAIT_MAX = 0      # seconds we may sleep on a 429 (set by --wait)


def token():
    """Bearer token from OPENVERSE_CLIENT_ID / OPENVERSE_CLIENT_SECRET (free app registration, much higher
    limits than anonymous). Without them the anonymous limit applies: 100/min, 1000/day per IP."""
    global _TOKEN
    cid, sec = os.environ.get("OPENVERSE_CLIENT_ID"), os.environ.get("OPENVERSE_CLIENT_SECRET")
    if _TOKEN is None and cid and sec:
        body = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid,
                                       "client_secret": sec}).encode()
        req = urllib.request.Request(TOKEN_URL, data=body, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            _TOKEN = json.load(r)["access_token"]
    return _TOKEN


def get_json(url, tries=4):
    headers = {"User-Agent": UA}
    if token():
        headers["Authorization"] = f"Bearer {token()}"
    waited = 0
    k = 0
    while True:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                after = int(e.headers.get("Retry-After") or 30)
                if waited + after <= WAIT_MAX:
                    print(f"  rate limited: waiting {after}s", file=sys.stderr)
                    time.sleep(after + 1)
                    waited += after
                    continue
                sys.exit(f"openverse: rate limited (HTTP 429, retry after {after}s). The anonymous quota is "
                         f"1000 requests/day per IP. Set OPENVERSE_CLIENT_ID/OPENVERSE_CLIENT_SECRET "
                         f"(free: POST https://api.openverse.org/v1/auth_tokens/register/), or pass --wait SECONDS.")
            k += 1
            if k >= tries:
                raise
            time.sleep(2 * k)
        except urllib.error.URLError:
            k += 1
            if k >= tries:
                raise
            time.sleep(2 * k)


def download(url, dest, tries=3):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            dest.write_bytes(data)
            return len(data)
        except Exception:
            if k == tries - 1:
                raise
            time.sleep(2 * (k + 1))


def search(query, licenses, max_dur, page_size=20):
    params = {
        "q": query,
        "license": licenses,
        "page_size": page_size,
    }
    # No `category` or `length` filter: category=sound_effect matches almost nothing (Freesound files carry no
    # category), and length=short means about 30 s to 2 min, which drops exactly the short effects we want.
    # Duration is filtered on our side instead.
    url = API + "?" + urllib.parse.urlencode(params)
    return get_json(url).get("results", [])


def slug(s, n=48):
    return re.sub(r"[^a-z0-9]+", "_", (s or "").lower()).strip("_")[:n] or "untitled"


def fetch_type(stype, queries, n, out, manifest, licenses, max_dur, min_dur):
    folder = out / stype
    folder.mkdir(parents=True, exist_ok=True)
    have = {m["id"] for m in manifest.values()}
    got = 0
    for q in queries:
        for r in search(q, licenses, max_dur):
            if got >= n:
                break
            dur = (r.get("duration") or 0) / 1000.0
            if r["id"] in have or not r.get("url"):
                continue
            if dur and (dur > max_dur or dur < min_dur):
                continue
            ext = (r.get("filetype") or Path(urllib.parse.urlparse(r["url"]).path).suffix.lstrip(".") or "mp3").lower()
            # the type word stays in the file name so real-sfx's name rules agree with the catalog type
            name = f"ov_{stype}_{slug(r.get('title'))}_{r['id'][:8]}.{ext}"
            dest = folder / name
            try:
                size = download(r["url"], dest)
            except Exception as e:
                print(f"  skip {r['id'][:8]}: {e}", file=sys.stderr)
                continue
            have.add(r["id"])
            manifest[f"{stype}/{name}"] = {
                "id": r["id"], "type": stype, "query": q, "title": r.get("title"),
                "creator": r.get("creator"), "license": r.get("license"),
                "license_version": r.get("license_version"), "license_url": r.get("license_url"),
                "landing": r.get("foreign_landing_url"), "source": r.get("source"),
                "duration": dur, "bytes": size,
            }
            got += 1
            print(f"  {stype:8s} {dur:5.2f}s {r.get('license'):4s} {r.get('title')!s:.60}")
        if got >= n:
            break
        time.sleep(0.6)   # stay polite to the anonymous rate limit
    return got


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plan", help="JSON list of {type, queries, n}")
    ap.add_argument("--type", help="one pack type (whoosh, impact, pop, click, chime, riser, typing, foley ...)")
    ap.add_argument("--query", action="append", default=[], help="search words (repeatable)")
    ap.add_argument("--n", type=int, default=10, help="candidates per type")
    ap.add_argument("--out", required=True)
    ap.add_argument("--license", default="cc0,pdm", help="comma list: cc0,pdm,by,by-sa ... (default cc0,pdm)")
    ap.add_argument("--max-dur", type=float, default=8.0)
    ap.add_argument("--min-dur", type=float, default=0.05)
    ap.add_argument("--wait", type=int, default=0, help="seconds to sleep in total on rate limits (default 0: stop)")
    a = ap.parse_args()
    global WAIT_MAX
    WAIT_MAX = a.wait

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    mpath = out / "manifest.json"
    manifest = json.loads(mpath.read_text()) if mpath.exists() else {}

    plan = json.loads(Path(a.plan).read_text()) if a.plan else []
    if a.type:
        plan.append({"type": a.type, "queries": a.query or [a.type], "n": a.n})
    if not plan:
        ap.error("give --plan or --type")

    for p in plan:
        print(f"[{p['type']}] {', '.join(p['queries'])}")
        got = fetch_type(p["type"], p["queries"], p.get("n", a.n), out, manifest, a.license,
                         p.get("max_dur", a.max_dur), p.get("min_dur", a.min_dur))
        print(f"  -> {got} files")
        mpath.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(f"manifest: {mpath} ({len(manifest)} files)")


if __name__ == "__main__":
    main()
