# Vibe Editor — effect module API (for contributors)

Engine: `plugin/vibe-editor/skills/edit/scripts/` (`vibe.py` entry, package `vibe_engine/`).
Read these first: `vibe_engine/text.py` (Ctx + helpers — the API), `vibe_engine/fx_text.py` (worked examples:
`ev_card`, `ev_checklist`, `ev_counter`, `ev_pill`), `vibe_engine/render.py` (how modules are loaded).

## Module contract

A module (`vibe_engine/fx_<name>.py`) exposes:

```python
EVENTS = {"phone": ev_phone, ...}          # type -> fn(ctx, e) -> (a, b) window or None
DOCS = {"phone": "iPhone mockup … options: position left|right|center, title, messages[], …"}  # one line each
HIDE_CAPTIONS = {"phone"}                   # types that hide captions while visible (optional)
```
`render.py` auto-imports `fx_ui`, `fx_data`, `fx_decor` if present. Effects are pure ASS (libass) overlays drawn
on top of the video. Every event dict `e` comes straight from the user's `edit.json`.

## Coordinates & time
- Design space is `ctx.W × ctx.H` (1080×1920 for 9:16, 1920×1080 for 16:9, 1080×1080, 1080×1350). Never hardcode
  1080/1920 — use fractions of `ctx.W/ctx.H` and multiply sizes by `ctx.u` (= min(W,H)/1080).
- `a, b = ev_window(ctx, e, default_dur)` resolves `at` / `dur` / `until` (seconds, negative = from end, or a spoken
  phrase). All your lines must live inside `[a, b]` (stagger inside the window).
- Safe area: `ctx.safe_top/safe_bottom/safe_left/safe_right`. Use `ctx.clamp_y(yc, h)` / `ctx.clamp_x(xc, w)` for any
  block so nothing goes off-screen or under the platform UI (bottom 14% in 9:16).
- Positions: `ypos(ctx, e.get("position"), "upper")` accepts top|upper|center|lower|bottom or 0–1;
  `xpos(ctx, e.get("x"), 0.5)` accepts left|center|right or 0–1.

## Drawing API (on `ctx`)
- `ctx.shape(a, b, path, color, alpha, tag, layer, x=0, y=0, an=7, blur=0, outline=None, bord=0)` — vector shape.
  `path` from text.py helpers: `rrect(w,h,r,x,y)`, `rect`, `circle(r,cx,cy)`, `ellipse`, `polygon(pts)`, `star`,
  `check_path`, `thick_line(x1,y1,x2,y2,w)`, `arrow_path`, `heart`, `path_poly(points, w)`.
  Pattern for absolute coords: build the path in screen coordinates and pass `tag="\\an7\\pos(0,0)"`.
  Pattern for animatable objects: build the path at origin, pass `tag=enter_tag("pop", cx, cy, u) + exit_tag("fade", ms)`
  (anchors at centre with `\an5`, so scale/rotate animate around the centre). `alpha` 0=opaque, 255=invisible.
- `st = ctx.style(font_key, size, color, outline, bord, shad, box=False, back=None)` → style name (size is the
  *nominal* size × u; fonts are auto-normalised to the same cap height). Font keys: `ctx.fkey("title")`,
  `ctx.fkey("body")`, `ctx.fkey("serif")`, or library keys like `"inter-extrabold"`, `"space-mono"`, `"instrument-serif-italic"`,
  `"marker"`, `"anton"` (see `library/fonts.json`).
- `ctx.add(a, b, style, "{" + tags + "}" + text, layer)` — one text line. Always `esc()` user text, or use
  `ctx.markup(text, color, accent)` which supports `*accent*` words.
- `ctx.draw_lines(a, b, st, lines, font_key, size, x, yc, lh, tagfn(xx,yy,i), color, accent, layer, stagger, extra,
  register=True, clamp=True)` — multi-line text placed line by line (tight spacing, caps centred, clamped, registered).
- `lines, fs = ctx.wrap(text, font_key, size, max_w, max_lines)` — exact wrapping/shrinking (uses real glyph metrics).
- `ctx.text_w(text, font_key, size)` — exact pixel width; `ctx.cap_shift(font_key, size)` — add to y for `\an5`
  text so capitals are visually centred (draw_lines does this for you).
- `ctx.card(a, b, cx, cy, w, h, fill, alpha=0, radius=36, layer=4, shadow=True, anim="pop", outline=None, bord=0)`
  — rounded card with soft shadow + entrance; registers its box.
- `ctx.register(a, b, x0, y0, x1, y1, kind="graphic")` — tell the layout manager what area you occupy
  (captions automatically move away from it). Register the overall bounding box of each effect once
  (card/draw_lines already register; if you draw with raw shapes, register yourself). Use `kind="ui"` for UI mockups.
- `enter_tag(kind, x, y, u, dur_ms, delay)`: pop slide slide-down slide-left slide-right drop fade blur rise bounce
  elastic flip zoom punch stamp spin swing flicker zoom-out none. `exit_tag(kind, dur_ms)`: fade shrink blur up none.
- Sounds: `ctx.extra_sfx.append((time, "pop", 0.5))`. Names: whoosh whoosh-fast swipe pop bubble click mouse-click typing
  ding notification success error riser impact bass-drop shutter glitch tick tick-tock cash heartbeat sparkle boing
  record-stop zoom (more may be added). Respect `e.get("sfx")` (False/None disables, a name overrides).
- Colours: neutral palette `ctx.ui` = paper `#F6F4EF`, card `#FFFFFF`, ink `#161616`, muted `#8A8A8E`, line `#E4E2DC`,
  dark `#161616`, dark2 `#262628`, on_dark `#F4F3EF`, green `#34C759`, red `#FF3B30`, blue `#0A84FF`, accent (brand).
  **Effects must default to the neutral palette** (white/cream/charcoal/grey glass) so they suit any video; use
  `ctx.accent` only for small highlights; let users override with `color`, `fill`, `accent`, `theme: light|dark`.
- `c_tag(hex)` → ASS colour tag value; `a_tag(alpha)`.

## ASS techniques that work well
- Reveal/wipe: `\clip(x0,0,x0,H)\t(t1,t2,\clip(x0,0,x1,H))` (rectangular clip animates).
- Typing: emit successive events with growing prefixes, anchored left (`\an4`) so text doesn't jump.
- Per-letter fades: inline per-char `{\alpha&HFF&\t(d,d+200,\alpha&H00&)}c` (do NOT animate per-char \fscx — it shifts layout).
- Motion: `\move(x1,y1,x2,y2,t1,t2)`; rotation `\frz`; 3D `\frx \fry`; blur `\blur`; drop shadow = same shape offset,
  black, alpha 0xA0, `blur`.
- Per-frame animation (orbits, rolling numbers): emit one short event per frame (`1/30 s`) — fine for a few seconds.
- Drawings use `\p1`; colours via `\1c`, outline `\3c` + `\bord`, `\1a` alpha.
- Deterministic randomness: `random.Random(seed)` (never global random) so re-renders look identical.

## Robustness rules (very important — customers must never see a broken video)
- Never crash on missing/odd params: default everything, coerce types (`float(e.get("x", 0.5))` inside try or with
  safe defaults), cap list lengths (e.g. max 6 items), truncate overly long strings, wrap text with `ctx.wrap`.
- Everything stays on-screen (clamp) and readable (min font size ~40×u, contrast: dark text on light cards or vice versa).
- Keep effects away from the face area when that makes sense (face ≈ x 0.3–0.7, y 0.2–0.5 in 9:16) — e.g. side
  panels, top banners, bottom-half cards — unless the effect is meant to frame the face (cursor, orbit).
- An exception inside your function is caught by the renderer (the effect is skipped with a warning) — but aim for zero.
- Return `(a, b)`.

## Testing (do this for every effect)
Workspace: `/tmp/claude-0/-home-user-experiments/f0fb2adc-ad77-565e-97a8-446187717981/scratchpad/test/ws`
Your job (use ONLY yours; others are used in parallel): `fx-ui`, `fx-data` or `fx-decor`. Timeline: see
`ws/.vibe/jobs/<job>/timeline.txt` (≈19 s talking clip; spoken phrases you can anchor to).

```bash
E=/home/user/experiments/vibe-editor/plugin/vibe-editor/skills/edit/scripts/vibe.py
WS=/tmp/claude-0/-home-user-experiments/f0fb2adc-ad77-565e-97a8-446187717981/scratchpad/test/ws
python3 $E check <job> --ws $WS --edit /path/to/your_test.json
python3 $E render <job> --ws $WS --preview --edit /path/to/your_test.json
python3 $E stills <job> --ws $WS --times 1.0,2.5,4.0     # -> ws/.vibe/jobs/<job>/storyboard.jpg
```
Then open `storyboard.jpg` with the Read tool and LOOK at it. Check: correct look, nothing cut off, text readable,
animation mid-states sensible (grab frames during entrance too), neutral colours, no overlap with captions.
Test also `--format 16:9` once for a couple of effects. Iterate until each effect looks polished/premium.
Write test edit JSONs in your own scratch folder, e.g. `.../scratchpad/agent_<name>/`.
Run `python3 -m pyflakes vibe_engine/fx_<name>.py` before finishing.
