# Edit plan reference (`edit.json`)

Each job has one `edit.json` in `<workspace>/.vibe/jobs/<job>/`. `prep` writes a starter; you rewrite it. All times are on the **edited (output) timeline**, the one `timeline` prints.

## Times

Any `at` / `until` accepts:
- seconds: `4.2`
- from the end: `-3` (3s before the end)
- `"0:04.5"`
- **a spoken phrase** (best): `"here's the thing"`: starts when that phrase is spoken. Add `#2` for the 2nd occurrence: `"tip number#2"`. For `until`, the phrase's **end** is used.

Duration: `"dur": 2.5` or `"until": "<phrase or time>"`.

## Full example

```json
{
  "format": "9:16",
  "reframe": {"mode": "crop", "x": 0.5, "y": 0.5},
  "look": "punchy",
  "cuts": {"remove_pauses": true, "max_pause": 0.45, "remove_fillers": true,
           "drop_words": [[25, 31]], "drop": []},
  "captions": {"enabled": true, "style": "bold-pop", "emphasis": ["sleep", "40%"]},
  "audio": {"denoise": false, "loudness": -14,
            "music": {"file": "lofi.mp3", "volume": 0.12, "duck": true}},
  "events": [
    {"type": "title", "text": "Stop studying *the night before*", "at": 0, "until": "exam", "style": "pop", "sfx": "whoosh"},
    {"type": "zoom", "at": "here's the thing", "dur": 1.0, "style": "punch", "amount": 1.3},
    {"type": "flash", "at": "your brain"},
    {"type": "card", "style": "tip", "label": "TIP 1", "text": "Sleep *7 hours*", "sub": "Memories are saved while you sleep", "at": "tip number one", "until": "hours"},
    {"type": "broll", "file": "notes.mp4", "at": "revise", "dur": 1.6, "sfx": "whoosh-fast"},
    {"type": "checklist", "title": "The 3 rules", "items": ["Sleep 7 hours", "20-minute blocks", "Teach a friend"], "at": "tip number three", "until": "friend", "times": ["tip number three", "teach", "friend"]},
    {"type": "counter", "from": 0, "to": 40, "suffix": "%", "label": "higher scores", "at": "students", "until": "higher"},
    {"type": "glitch", "at": "follow"},
    {"type": "progress_bar"},
    {"type": "cta", "text": "Follow for more *study hacks*"}
  ],
  "output": {"name": "exam-tips"}
}
```

## Top-level keys

| key | values |
|---|---|
| `format` | `"9:16"` (default, Reels/Shorts), `"16:9"` (YouTube), `"1:1"`, `"4:5"` |
| `reframe` | `mode`: `crop` (fill frame; set `x`/`y` 0–1 to choose what part of a landscape video to keep, e.g. speaker on the left → `x: 0.3`), `fit-blur` (whole video + blurred background), `fit` (black bars). `zoom`: 1.0–1.3 extra crop-in. |
| `look` | colour grade: `natural punchy warm cool cinematic moody vintage bw airy matte vivid neon-night none` |
| `cuts` | `remove_pauses` (true), `max_pause` seconds kept between words (0.3 = very tight/fast, 0.6 = relaxed), `remove_fillers` (um/uh), `drop_words` list of `[from, to]` word indices to delete (retakes, mistakes), `drop` list of `[start, end]` **source** seconds, `start`/`end` source seconds to trim, `pad_before`/`pad_after` |
| `captions` | `enabled`, `style` (below), `emphasis` [words always in accent colour], `position` (0–1 height or top/upper/center/lower/bottom), `max_words` per caption, `uppercase`, `highlight` colour, `font` (font key), `size` |
| `audio` | `denoise` (true for noisy rooms/fans), `loudness` LUFS (-14 = Instagram/YouTube standard), `music`: `{file (from music/), volume 0.08–0.2, duck true}` |
| `auto_sfx` | `false` to disable the automatic sounds that effects add |
| `brand_override` | override brand.json for this video, e.g. `{"colors": {"accent": "#FF3B30"}}` |
| `output` | `{"name": "file-name"}` |

## Caption styles

`bold-pop` (viral default, yellow pop), `clean` (calm sentence case), `karaoke` (fill as spoken), `single-word` (one huge word), `boxed` (black on white), `neon` (green glow), `handwritten` (Caveat, types on), `minimal` (small, low), `red-hot` (condensed, red), `comic` (yellow comic), `elegant` (serif + gold), `typewriter` (wide techy, types on), `blob-purple` / `blob-yellow` (highlight blob behind spoken word), `hindi-bold` (Devanagari).

Native scripts: set `"font"` to `devanagari`, `tamil`, `telugu`, `bengali`, `gujarati`, `kannada`, `malayalam`, `gurmukhi` (and `"uppercase": false`). Hinglish in Roman script works with every style.

## Event types

Every event: `type`, `at`, `dur` or `until`. Optional on most: `sfx` (sound name), `sfx_volume`, `hide_captions` (true/false; cards, checklists, counters, countdowns and CTAs hide captions by default), `disabled: true`.

Text accents: wrap words in `*stars*` to colour them with the brand accent. `|` forces a new line.

| type | what | options |
|---|---|---|
| `title` | big animated headline | `text`, `style`: `pop` `slide` `drop` `punch` `stamp` `fade` `typewriter` `split` `glow` `highlight` `zoom-out`; `position`: top/upper/center/lower/bottom or 0–1; `size`: s m l xl xxl or px; `font`, `color`, `accent`, `uppercase` (default true), `x`, `width` |
| `text` | smaller on-screen text | same as title (default fade, centre, size 64) |
| `stamp` | rotated slam-in word ("WRONG", "SAVED!") | same as title |
| `card` | rounded info card | `text`, `sub`, `label` (chip, e.g. "TIP 1"), `style`: `note` `dark` `accent` `myth` `fact` `tip` `quote` `glass`; `position`, `anim`: pop slide fade; `size`, `width` |
| `checklist` | card with items that tick on one by one | `items` [..], `title`, `times` [phrases/seconds per item], `fill` (card/dark/accent), `position` |
| `counter` | number counts up | `from`, `to`, `prefix` ("₹", "$"), `suffix` ("%", "K", "L"), `decimals`, `label`, `position`, `indian` (lakh commas; auto with ₹) |
| `cta` | call-to-action pill, defaults to last 2.8s | `text` (default brand CTA), `style`: pill dark light, `position` |
| `tag` | small pill label (app name, location, "Day 3") | `text`, `position`, `style` |
| `lower_third` | name bar slides in | `text` (name, default brand name), `sub` (default @handle) |
| `progress_bar` | thin bar fills across the video | `position`: top/bottom, `color` |
| `countdown` | 3-2-1 with ticks | `from` |
| `flash` | white flash (great on cuts/reveals) | `dur` (0.3), `color` |
| `letterbox` | cinematic bars slide in | `dur`, `size` |
| `zoom` | camera zoom on the speaker | `style`: `punch` (quick in, hold, out), `push` (slow creep in), `pulse` (in and out), `pull` (start close, ease out); `amount` 1.1–1.5; `focus` [x, y] 0–1 (default face area [0.5, 0.42]) |
| `shake` | camera shake | `dur` (0.3–0.5), `amount` |
| `glitch` | RGB-split glitch (+ sound) | `dur` (0.25) |
| `bw` | black & white moment | `dur` |
| `blur` | blur video (behind a card/title) | `dur`, `amount` |
| `darken` | dim video (behind a big title) | `dur`, `amount` 0.1–0.4 |
| `broll` | cut away to a clip/image from `broll/` | `file`, `from` (start inside the clip), `mode`: `full` / `pip` (picture-in-picture top), `size`, `y` |
| `image` | logo/sticker overlay | `file` (default brand logo), `position`: top-right top-left top center bottom-right bottom-left, `size` (0.22) |
| `sfx` | sound effect | `name`, `volume` (0.55) |

## Sound effects

`whoosh whoosh-fast swipe pop bubble click mouse-click typing ding notification success error riser impact bass-drop shutter glitch tick tick-tock cash heartbeat sparkle boing record-stop zoom`

Pairings: titles → whoosh / impact; cards & pills → pop; checklists → pop (auto); money → cash; myths → error, facts → success / ding; reveals → riser then impact / bass-drop; app/screen moments → mouse-click / typing / notification; funny → boing / record-stop.

## Note → change cheat sheet

| user says | change |
|---|---|
| "title bigger" | title `size` → "xl"/"xxl" |
| "captions lower / higher" | `captions.position` 0.78 / 0.6 |
| "captions smaller" | `captions.size` (style default ±15) |
| "faster / tighter" | `cuts.max_pause` 0.3, more zooms |
| "slower / more natural" | `cuts.max_pause` 0.7 |
| "remove the part where…" | find word indices in transcript → `drop_words` |
| "more energy" | punch zooms every 3–4s, flashes on cuts, `vivid`/`punchy` look, `bold-pop`/`red-hot` captions |
| "more premium / calm" | `cinematic`/`matte` look, `clean`/`elegant` captions, `push` zooms, fewer sounds |
| "my face is cut off" | `reframe.x`/`y`, or `fit-blur` |
| "music too loud" | `music.volume` 0.08 |
| "noisy audio" | `audio.denoise: true` |
| "no sounds" | `auto_sfx: false`, remove sfx events |

## Engine commands

```
install [--model small]        doctor                 init "<folder>"
prep <video> [--lang hi] [--name x] [--model medium] [--format 16:9] [--reset]
fix <job> '{"12":"word","3-4":"merged"}'              timeline <job>
render <job> [--preview] [--format 16:9]              stills <job> [--times 1,4.5]
cover <job> --title "…" [--at phrase] [--position top|center|bottom] [--sub "…"]
peek <any-video> [--n 12]      list [captions|looks|sfx|fonts|effects]
```
