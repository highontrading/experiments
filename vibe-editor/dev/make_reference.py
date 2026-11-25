#!/usr/bin/env python3
"""Generate skills/edit/reference/edit-plan.md from the engine's live registries (always in sync)."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.join(HERE, "..", "plugin", "vibe-editor", "skills", "edit")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from vibe_engine import ai, core, fx_text, fx_video, presets, render  # noqa: E402

HEAD = r'''# Edit plan reference (`edit.json`)

Each job has one `edit.json` in `<workspace>/.vibe/jobs/<job>/`. `prep` writes a starter; you rewrite it.
All times are on the **edited (output) timeline**, the one `timeline` prints. Validate with `check <job>`.

## Times
Every `at` / `until` accepts: seconds `4.2` · from the end `-3` · `"0:04.5"` · **a spoken phrase** (best): `"here's the thing"`
(add `#2` for the 2nd occurrence). `until` uses the phrase's end. Duration: `"dur": 2.5` or `"until": …`.

## Full example
```json
{
  "format": "9:16",
  "reframe": {"mode": "crop", "x": 0.5, "y": 0.5},
  "look": "clean-neutral",
  "cuts": {"remove_pauses": true, "max_pause": 0.45, "remove_fillers": true, "drop_words": [[25, 31]], "drop": []},
  "captions": {"enabled": true, "style": "classic-yellow", "emphasis": ["sleep", "40%"]},
  "audio": {"denoise": false, "loudness": -14, "music": {"file": "lofi.mp3", "volume": 0.12, "duck": true}},
  "events": [
    {"type": "hook-slam", "at": 0, "text": "Stop studying *the night before*"},
    {"type": "title", "text": "SLEEP", "at": "your brain", "dur": 1.6, "style": "fade", "font": "dm-serif", "size": 420, "position": 0.24, "behind": true},
    {"type": "card", "style": "tip", "label": "TIP 1", "text": "Sleep *7 hours*", "at": "tip number one", "until": "hours"},
    {"type": "search", "text": "how to remember faster", "at": "revise", "dur": 2.2},
    {"type": "checklist", "title": "The 3 rules", "items": ["Sleep 7 hours", "20-minute blocks", "Teach a friend"], "at": "tip number three", "until": "friend"},
    {"type": "counter", "from": 0, "to": 40, "suffix": "%", "label": "higher scores", "at": "students", "until": "higher"},
    {"type": "glitch", "at": "follow"},
    {"type": "cta", "text": "Follow for more *study hacks*"}
  ],
  "output": {"name": "exam-tips"}
}
```

## Top-level keys
| key | values |
|---|---|
| `format` | `"9:16"` (Reels/Shorts), `"16:9"` (YouTube), `"1:1"`, `"4:5"` |
| `reframe` | `mode`: `crop` (fill; `x`/`y` 0–1 choose the part of a landscape video to keep), `fit-blur` (whole video + blurred bg), `fit` (bars); `zoom` 1.0–1.3 |
| `look` | a look name (below), a user LUT name (file in `looks/`), or `{"filter": "<ffmpeg filters>"}` / `{"lut": "file.cube"}` |
| `cuts` | `remove_pauses`, `max_pause` (0.3 tight … 0.7 relaxed), `remove_fillers`, `drop_words` [[from,to]], `drop` [[start,end]] source secs, `start`/`end`, `pad_before`/`pad_after` |
| `captions` | `enabled`, `style`, `emphasis` [words], `behind` (true = captions behind you, AI; auto-moved in front when hidden), `position`, `max_words`, `uppercase`, `highlight`, `font`, `size`, `anim`, `emphasis_color`, `emphasis_font`, `emphasis_scale`, `outline_w`, `shadow`, `box` |
| `audio` | `denoise`, `loudness` (-14), `music` {file, volume 0.08–0.2, duck} |
| `auto_sfx` | `false` = no automatic sounds |
| `brand_override` | e.g. `{"colors": {"accent": "#FF3B30"}, "fonts": {"title": "anton"}}` |
| `output` | `{"name": "file-name"}` |

## Common event options
Every event: `type`, `at`, `dur`/`until`. Most also take: `sfx` (sound name or false), `sfx_volume`, `hide_captions`,
`disabled`, `behind` (**AI: draw it behind the person**; works on titles, text, typewall, stickers, doodles … the engine checks
readability and moves it in front if the person would hide it), `position` (top/upper/center/lower/bottom or 0–1), `x`/`y` (0–1),
`size` (s/m/l/xl/xxl/huge or a number), `color`, `fill`, `accent`, `font` (any font key, a user font key, or a family name),
`theme` (light/dark for panels & UI). Text: `*accent*` words, `|` new line. Unknown/odd values never crash: they fall back to defaults.
'''

TAIL = r'''
## Note → change cheat sheet
| user says | change |
|---|---|
| "title bigger" | `size` → "xl"/"xxl" |
| "captions lower/higher/smaller" | `captions.position` 0.78/0.6, `captions.size` |
| "faster/tighter" | `cuts.max_pause` 0.3, more zooms |
| "slower/natural" | `cuts.max_pause` 0.7 |
| "remove the part where…" | word indices from transcript → `drop_words` |
| "more energy" | punch zooms every 3–4s, flashes, `creator-pop`/`vivid` look, `classic-yellow`/`red-hot` captions, presets `hook-slam`, `mind-blown` |
| "more premium/calm" | `cinematic`/`clean-neutral`/`matte` look, `rise`/`serif-mix`/`aesthetic` captions, `push` zooms, `serif`/`wipe` titles, fewer sounds |
| "text behind me" | `"behind": true` on a big title near the head (position 0.2–0.3), or `cover-story` / `type-wall` presets |
| "my face is cut off" | `reframe.x`/`y` or `fit-blur` |
| "music too loud" | `music.volume` 0.08 |
| "noisy audio" | `audio.denoise: true` |
| "no sounds" | `auto_sfx: false` |

## Engine commands
```
install · doctor · init "<folder>" · fonts · list [captions|looks|sounds|fonts|effects|presets]
prep <video> [--lang hi] [--name x] [--model medium] [--format 16:9] [--reset]
fix <job> '{"12":"word","3-4":"merged"}' · timeline <job>
check <job> [--edit plan.json] · render <job> [--preview] [--format 16:9] [--edit plan.json]
stills <job> [--times 1,4.5] · cover <job> --title "…" [--at phrase] [--position top|center|bottom] [--sub "…"]
peek <any-video> [--n 12] [--start s --end s --width 540]
save caption|look|effect <name> '<json>'
```
'''


def main():
    core.set_ws(None)
    docs = {}
    groups = [("Text & titles", fx_text), ("Video & camera", fx_video), ("AI cut-out (needs the person visible)", ai),
              ("Advanced / custom", presets)]
    for name in ("fx_ui", "fx_data", "fx_decor"):
        mod = sys.modules.get(f"vibe_engine.{name}")
        if mod:
            title = {"fx_ui": "UI & social mockups", "fx_data": "Data & info-graphics", "fx_decor": "Kinetic, decor & transitions"}[name]
            groups.insert(-1, (title, mod))
    out = [HEAD]
    n = 0
    for title, mod in groups:
        d = getattr(mod, "DOCS", {})
        if not d:
            continue
        out.append(f"\n## Effects: {title}\n\n| type | what / options |\n|---|---|")
        for k in sorted(d):
            out.append(f"| `{k}` | {d[k].replace('|', '/')} |")
            n += 1
            docs[k] = d[k]
    pr = core.lib("presets.json")
    out.append(f"\n## Preset combos ({len(pr)}): one line, several effects\nUse `{{\"type\": \"<name>\", \"at\": …, <params>}}`; times inside are relative.\n\n| preset | what | params |\n|---|---|---|")
    for k, v in pr.items():
        out.append(f"| `{k}` | {v.get('desc', '')} | {', '.join(f'{p}' for p in v.get('params', {}))} |")
    caps = core.lib("captions.json")
    out.append(f"\n## Caption styles ({len(caps)})\n\n| style | look |\n|---|---|")
    for k, v in caps.items():
        out.append(f"| `{k}` | {v.get('desc', '')} (anim `{v.get('anim')}`, font `{v.get('font')}`) |")
    looks = core.lib("looks.json")
    out.append(f"\n## Looks ({len(looks)})\n" + " · ".join(f"`{k}` {v['desc']}" for k, v in looks.items()))
    sfx = core.lib("sfx/sfx.json")
    out.append(f"\n## Sounds ({len(sfx)})\n" + " · ".join(f"`{k}`" for k in sfx) +
               "\n\nPairings: titles → whoosh/impact/swoosh-up; cards & pills → pop; UI → tap/mouse-click/typing/notification/message-sent; "
               "money → cash/coin; myths → error, facts → success/ding; reveals → riser/drum-roll then impact/bass-drop; funny → boing/record-stop; "
               "transitions → whoosh-fast/swish/transition-hit. User sounds in `sounds/` by file name.")
    fonts = core.lib("fonts.json")
    out.append(f"\n## Fonts ({len(fonts)} + the user's own in `fonts/`)\n" + " · ".join(f"`{k}`" for k in fonts) +
               "\n\nAll fonts render at the same visual size for the same `size` (auto-normalised). Native-script text needs a script font "
               "(devanagari/hind/mukta/rozha/kalam/yatra · tamil · telugu · bengali · gujarati · kannada · malayalam · gurmukhi).")
    out.append(TAIL)
    path = os.path.join(SKILL, "reference", "edit-plan.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"wrote {path}: {n} effect types, {len(pr)} presets, {len(caps)} captions, {len(looks)} looks, {len(sfx)} sounds, {len(fonts)} fonts")
    _ = render


if __name__ == "__main__":
    main()
