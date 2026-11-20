"""Music and sound effects from anywhere:

  own files      the user drops them in <project>/music or <project>/sfx
  built-in       12 generated SFX (whoosh, pop, ding …), free for any use
  openverse      free library search, no key needed: music (Jamendo, ccMixter …) and
                 sound effects (Freesound). Only licences that allow commercial use.
  elevenlabs     generate music or SFX from a text prompt (needs the user's ElevenLabs key)

  ve.py music search <project> "upbeat corporate" [--cc0] [--min 20] [--max 240]
  ve.py music get <project> 2 5                       (numbers from the last search)
  ve.py music generate <project> "warm lofi beat, no vocals" --seconds 30
  ve.py sfx search <project> "whoosh"   ·  ve.py sfx get <project> 1
  ve.py sfx generate <project> "deep cinematic whoosh" --seconds 1.2 --name whoosh-deep
  ve.py keys set elevenlabs <KEY>  ·  ve.py keys show
Every download is written to <project>/CREDITS.txt with its licence and attribution.
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from common import HOME_DIR, die, load_json, log, save_json

UA = {"User-Agent": "VibeEditing/1.1 (video editing plugin)"}
OPENVERSE = "https://api.openverse.org/v1/audio/"
KEYS = HOME_DIR / "keys.json"
ATTRIBUTION_FREE = {"cc0", "pdm"}


def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", (t or "track").lower()).strip("-")[:40] or "track"


# ---------------------------------------------------------------- keys
def get_key(name):
    env = {"elevenlabs": "ELEVENLABS_API_KEY"}.get(name, name.upper() + "_API_KEY")
    if os.environ.get(env):
        return os.environ[env]
    return (load_json(KEYS, {}) or {}).get(name)


def set_key(name, value):
    data = load_json(KEYS, {}) or {}
    data[name] = value.strip()
    save_json(KEYS, data)
    try:
        os.chmod(KEYS, 0o600)
    except OSError:
        pass
    print(f"saved {name} key to {KEYS}")


def show_keys():
    data = load_json(KEYS, {}) or {}
    for k in ("elevenlabs",):
        v = get_key(k)
        print(f"{k:<12} {'set' if v else 'not set'}")


# ---------------------------------------------------------------- http
def _get_json(url):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        die(f"search failed ({e.code}): {e.read()[:200]!r}")
    except urllib.error.URLError as e:
        die(f"no connection to the music library: {e.reason}")


def _download(url, dest: Path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
    return dest


def _credit(project: Path, line: str):
    with open(Path(project) / "CREDITS.txt", "a", encoding="utf-8") as f:
        f.write(line.rstrip() + "\n")


# ---------------------------------------------------------------- openverse
def search(project: Path, query: str, kind="music", cc0_only=False, min_s=None, max_s=None, n=8):
    params = {"q": query, "page_size": 20}
    if cc0_only:
        params["license"] = "cc0,pdm"
    else:
        params["license_type"] = "commercial"
    if kind == "music":
        params["category"] = "music"
    else:
        params["source"] = "freesound"
    words = query.split()
    results, used = [], query
    # the free catalogue is small: if nothing matches, retry with fewer words
    for k in range(len(words), 0, -1):
        used = " ".join(words[:k])
        params["q"] = used
        results = _get_json(OPENVERSE + "?" + urllib.parse.urlencode(params)).get("results", [])
        if results:
            break
    if used != query and results:
        print(f"(no exact match for \"{query}\": showing results for \"{used}\")")
    res = []
    for r in results:
        lic = (r.get("license") or "").lower()
        if any(x in lic for x in ("nc", "nd")) or "sampling" in lic:
            continue
        dur = (r.get("duration") or 0) / 1000
        if kind == "music" and ((min_s and dur and dur < min_s) or (max_s and dur and dur > max_s)):
            continue
        res.append({"title": r.get("title"), "creator": r.get("creator"), "duration": round(dur, 1),
                    "license": f"{lic} {r.get('license_version') or ''}".strip(), "source": r.get("source"),
                    "url": r.get("url"), "page": r.get("foreign_landing_url"),
                    "attribution": r.get("attribution") or "",
                    "attribution_required": lic not in ATTRIBUTION_FREE,
                    "tags": [t.get("name") for t in (r.get("tags") or [])][:6]})
        if len(res) >= n:
            break
    pj = Path(project)
    (pj / kind_dir(kind)).mkdir(parents=True, exist_ok=True)
    save_json(pj / kind_dir(kind) / "last_search.json", {"query": query, "results": res})
    if not res:
        print("nothing found: try other words (mood, genre, instrument, tempo)")
    for i, r in enumerate(res, 1):
        att = "credit needed" if r["attribution_required"] else "no credit needed"
        print(f"{i:>2}. {r['title']}  ·  {r['creator']}  ·  {r['duration']}s  ·  {r['license']} ({att})  ·  {r['source']}")
        if r["tags"]:
            print(f"    tags: {', '.join(t for t in r['tags'] if t)}")
        print(f"    listen: {r['page']}")
    return res


def kind_dir(kind):
    return "music" if kind == "music" else "sfx"


def get(project: Path, numbers, kind="music"):
    pj = Path(project)
    last = load_json(pj / kind_dir(kind) / "last_search.json")
    if not last:
        die(f"search first:  ve.py {kind_dir(kind)} search <project> \"...\"")
    out = []
    for n in numbers:
        n = int(n)
        if not 1 <= n <= len(last["results"]):
            die(f"no result #{n} in the last search")
        r = last["results"][n - 1]
        ext = ".mp3"
        dest = pj / kind_dir(kind) / f"{slug(r['title'])}{ext}"
        log(f"downloading #{n}: {r['title']}")
        _download(r["url"], dest)
        _credit(pj, f"{dest.name}: \"{r['title']}\" by {r['creator']}, {r['license']} ({r['source']}) {r['page']}"
                    + ("" if not r["attribution_required"] else f"  | Credit: {r['attribution']}"))
        out.append(dest)
        print(f"saved {dest.relative_to(pj)}" + ("  (credit required, see CREDITS.txt)" if r["attribution_required"]
                                                  else ""))
    return out


# ---------------------------------------------------------------- elevenlabs
def _eleven(path, body, dest: Path):
    key = get_key("elevenlabs")
    if not key:
        die("No ElevenLabs key. Get one at elevenlabs.io (Profile → API keys), then:\n"
            "  ve.py keys set elevenlabs <your-key>     (or set the ELEVENLABS_API_KEY environment variable)")
    req = urllib.request.Request("https://api.elevenlabs.io" + path, data=json.dumps(body).encode(),
                                 headers={**UA, "xi-api-key": key, "Content-Type": "application/json",
                                          "Accept": "audio/mpeg"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
            f.write(r.read())
    except urllib.error.HTTPError as e:
        die(f"ElevenLabs error {e.code}: {e.read()[:300]!r}")
    return dest


def generate_music(project: Path, prompt: str, seconds=30, name=None):
    pj = Path(project)
    (pj / "music").mkdir(parents=True, exist_ok=True)
    dest = pj / "music" / f"eleven-{slug(name or prompt)}.mp3"
    log(f"generating {seconds}s of music with ElevenLabs (uses your ElevenLabs credits)...")
    _eleven("/v1/music", {"prompt": prompt, "music_length_ms": int(max(10, min(300, seconds)) * 1000)}, dest)
    _credit(pj, f"{dest.name}: generated with ElevenLabs Music, prompt \"{prompt}\" (check your ElevenLabs plan's "
                f"commercial-use terms)")
    print(f"saved {dest.relative_to(pj)}")
    return dest


def generate_sfx(project: Path, prompt: str, seconds=None, name=None):
    pj = Path(project)
    (pj / "sfx").mkdir(parents=True, exist_ok=True)
    dest = pj / "sfx" / f"{slug(name or prompt)}.mp3"
    body = {"text": prompt, "prompt_influence": 0.5}
    if seconds:
        body["duration_seconds"] = float(max(0.5, min(22, seconds)))
    log("generating a sound effect with ElevenLabs (uses your ElevenLabs credits)...")
    _eleven("/v1/sound-generation", body, dest)
    _credit(pj, f"{dest.name}: generated with ElevenLabs Sound Effects, prompt \"{prompt}\"")
    print(f"saved {dest.relative_to(pj)}  ->  use it as \"sfx/{dest.name}\" in edit.json")
    return dest
