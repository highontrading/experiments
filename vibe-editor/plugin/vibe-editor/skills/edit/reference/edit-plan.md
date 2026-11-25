# Edit plan reference (`edit.json`)

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


## Effects: Text & titles

| type | what / options |
|---|---|
| `card` | Rounded info card. text, sub, label (chip), style note/paper/dark/accent/myth/fact/tip/quote/glass/dark-glass/outline (glass styles blur the video behind them), position, anim pop/slide/fade/rise/…, size, width |
| `checklist` | Card whose items tick on one by one. items[], title (shows '1 of 3'), times[] (phrases/seconds), style light/dark (dark = frosted dark glass), position |
| `countdown` | 3-2-1 big numbers with ticks. from |
| `counter` | Number count-up. from, to, prefix (₹ $), suffix (% K L), decimals, label, position, indian (lakh commas; auto with ₹) |
| `cta` | Call-to-action pill (default last 2.8s, brand CTA). text, style pill/dark/light, position |
| `flash` | White/colour flash. dur (0.3), color |
| `letterbox` | Cinematic black bars slide in. dur, size |
| `lower_third` | Name bar that slides in. text (name), sub (@handle) |
| `progress_bar` | Thin bar that fills across the video. position top/bottom, color |
| `stamp` | Rotated slam-in word ('WRONG', 'SAVED!'). Same options as title. |
| `tag` | Small pill label (app name, 'Day 3', location). text, position, fill, color |
| `text` | Smaller on-screen text (same options as title; default fade, centre). |
| `title` | Big animated headline. text (*accent* words, / new line), style: pop slide slide-down slide-left slide-right drop punch stamp fade blur rise bounce elastic flip zoom zoom-out spin swing flicker typewriter split glow highlight wipe cascade flip-chars glitch marker underline outline sketch press ransom serif stack 3d glass neon blow scatter; position top/upper/center/lower/bottom/0-1, size s/m/l/xl/xxl/huge/px, font, color, accent, exit fade/shrink/blur/up/none, rotate{x,y,z} (3d), behind:true (AI: text behind you) |

## Effects: Video & camera

| type | what / options |
|---|---|
| `blackout` | Cut to black, optional centred text. dur, text |
| `blur` | Blur the video. dur, amount |
| `broll` | Cut away to a clip/image from broll/. file, from, mode full/pip/split-top/split-bottom, size, y |
| `bw` | Black & white moment. dur |
| `darken` | Dim the video. dur, amount 0.1–0.5 |
| `double_exposure` | Blend you with a b-roll clip (screen blend, B&W). file, from, dur |
| `filter` | Advanced: any ffmpeg video filter for a time window (validated first). filter, dur |
| `frame` | Put the video inside a designed frame. style newspaper/banknote/polaroid/phone/window/magazine/film/tv, text (headline/caption), sub, number (banknote), masthead (newspaper/magazine), window [x,y,w,h] |
| `freeze` | Freeze frame (audio keeps playing) + flash + optional stamped label. text, dur, scale (<1 = framed), tilt |
| `glitch` | RGB-split glitch moment (+ sound). dur |
| `image` | Logo/sticker/PNG/GIF/transparent video overlay. file (default brand logo), position top-right/top-left/top/center/bottom-right/bottom-left/bottom or x,y, size |
| `impact` | Manga impact frame: high-contrast B&W + speed lines + big text + shake. text, dur |
| `invert` | Colour-inverted flash moment. dur |
| `layout` | Re-layout the frame. style split-top/split-bottom/pip/card, file (other half / background), size, corner |
| `mirror` | Horizontally mirrored moment. dur |
| `overlay` | Same as image (for transparent .mov/.webm/.gif animations you bring). |
| `pixelate` | Pixelate moment (censor / transition). dur, amount |
| `pullback` | Video shrinks from full screen into a window/phone on a clean canvas. style window/phone, text, sub, ramp |
| `rack_focus` | Focus pull: blurry → sharp (direction in) or sharp → blurry (out). dur, amount |
| `sepia` | Sepia moment. dur |
| `shake` | Camera shake. dur 0.3–0.5, amount |
| `slice` | Blade slice: white slash + the frame splits and slides. angle, amount |
| `spotlight` | Darken everything except a soft circle. x, y (0–1), size, darkness |
| `text_mask` | Giant letters filled with your video on a paper background ('letter dive'). text, font, size, zoom, canvas |
| `vhs` | VHS tape moment (colour bleed + noise). dur |
| `zoom` | Camera zoom. style punch/push/slow/pulse/pull/through (fast zoom-through cut), amount 1.1–2.2, focus [x,y] |

## Effects: AI cut-out (needs the person visible)

| type | what / options |
|---|---|
| `background` | AI: replace the background behind you. bg '#hex' / 'blur' / image/video file, dur |
| `clone` | AI: copies of you fan out behind you. count (1–6), scale, spread |
| `cutout` | AI: sticker cut-out of you (white border, tilt, drop shadow) on a clean background. freeze (true), bg, scale, tilt, outline |
| `dolly` | AI: vertigo / dolly zoom — background zooms while you stay still. amount, dur |
| `frame_break` | AI: you inside a frame with your head breaking out of it. frame_top, frame_color, bg |
| `outline` | AI: glowing/solid outline traced around you. color, width, glow |

## Effects: UI & social mockups

| type | what / options |
|---|---|
| `browser` | Browser window (traffic-light dots, URL bar types `url`, loading bar) then the page loads (skeleton blocks + optional title/text). options: url, title, text, position, x, theme light/dark, accent. |
| `call` | Incoming-call banner (dark glass pill) with avatar, name, sub, red/green buttons; accept button breathes and rings. options: name, sub, declined (true → decline tap + 'Call declined' chip at 60%), declined_text, position, theme dark/light, avatar (colour). |
| `chat` | DM conversation: bubbles appear one by one (them = grey left, me = blue right) with a typing-dots indicator before each 'them' message. options: messages[] ({from: me/them, text} or alternating strings, max 6), position, x, theme, me_color, them_color. |
| `comment` | Comment box types `text` ('Add a comment…' placeholder, Post turns blue), then posts it as a comment row with username + heart that gets liked. options: text, user (default brand handle or 'you'), posted (default true), placeholder, position, theme, accent. |
| `cursor` | Live cursor with a name chip glides in, drags a selection box around `target` with corner handles and a live 'W × H' chip. options: target [x, y, w, h] fractions (default face area), label ('You'), click (ripple + mouse click), color (selection colour), dims (fixed chip text). |
| `keyboard` | On-screen keyboard slides up; a text field above it types `text` with key-press pop-ups and a predictive bar. options: text, suggestions[3] (default: built from the typed word), placeholder, theme light/dark, accent. |
| `notification` | iOS-like notification banner drops in from the top with a bounce and slides out. options: app, title, body, time ('now'), icon (letter), icon_color, position, theme light/dark. |
| `phone` | Phone mockup (rounded bezel + island) slides in showing a chat or a list. options: position left/right/center, y, size s/m/l, title (header), messages[] (strings alternate sides, or {from: me/them, text}; appear one by one), lines[] (generic rows; used when no messages), theme light/dark, accent. |
| `poll` | Poll sticker: question + 2–4 options; a vote is tapped, then bars fill to their percentages. options: question, options[] (strings or {text, percent}), percents[], vote (index or false), position, theme, accent. |
| `post_card` | Generic social post card: avatar, name, handle, text, reply/repost/like/views row; pops in, counts tick up and the heart gets liked. options: name, handle, text, time, likes, reposts, comments, views (numbers or '1.2K'), tick (true), liked (true), verified (false), position, theme. |
| `prompt` | AI chat prompt box: typed `text` with blinking caret, round send button (pressed at the end), optional label chip. options: text, label (default 'AI', false hides), placeholder, position, theme, accent. |
| `question` | Question-box sticker: coloured header 'Ask me a question' with avatar, body field with typed `text` or a placeholder. options: title, text, placeholder, header (colour, default brand accent), position, theme. |
| `search` | Search bar types `text`, then a suggestions dropdown appears (one row gets tapped). options: text, suggestions[2–4], select (row index or false), placeholder, position, x, theme, accent. |
| `story_sticker` | Story-style tilted pill sticker with a drawn icon that springs in. options: style location/link/mention/hashtag/music/time, text, tilt (deg, default -4), size s/m/l, badge (icon colour), position (default top), x, theme light/dark. |
| `voice_note` | Voice-message bubble: play button, waveform that fills while playing, counting duration, avatar. options: duration ('0:07'), play (default true), side left/right, name, position (default upper), x, seed, theme, accent. |

## Effects: Data & info-graphics

| type | what / options |
|---|---|
| `bar_chart` | Editorial bar chart on a card: bars grow staggered from the baseline, values count up on top, max (or `highlight` index) bar in accent. Options: values[] (≤8), labels[], title, sub, prefix/currency, suffix, decimals, highlight (index/false); theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). Default position lower. |
| `calendar` | Mini month calendar card; the `day` gets circled with a draw-on accent ring and an optional label chip ('Launch day'). Options: day, month (1-12 or name), year, date (YYYY-MM-DD), label, marked[] (dots), week_start monday/sunday; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `dial` | Big cream clock/day dial (ticks, serif numerals, ink lines) sliding in from the side, partly off-frame like a sundial, its hand sweeping. Options: side right/left, labels[] (default 12,1..11), from/to (label positions, e.g. 7 → 11.5), word (text rotating along the hand), size (0.2-0.65 of min(W,H)), offset (0-0.6 off-frame), position (y), fill, color, accent, theme dark. |
| `kpi` | KPI tile: small label, big number counting up, ▲/▼ delta pill (green/red, drawn triangle), optional note and a drawn sparkline. Options: value, from, prefix/currency, suffix, decimals, label, delta (e.g. 23 or -8), delta_suffix (default %), delta_label, spark[] (auto if omitted), sparkline true/false; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `line_chart` | Line chart: line draws left→right over a faint grid with dots and a soft area fill; a chip (default 'SCALE ↗', arrow drawn) pops at the last point. Options: values[] (≤12), labels[] (default M T W T F S S for 7 values), title, sub, label (chip text, '' to hide), area true/false; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `list_panel` | Agenda side panel ('IN THIS VIDEO 03/05'): header + numbered items; an accent highlight pill moves to each item at `times` (phrases or seconds), past items get a drawn ✓. Dark glass by default. Options: items[] (≤8), times[], title, side right/left, width (default 0.36 of W), position (default upper), theme light/dark, accent. |
| `post_wall` | Wall of rounded grey thumbnail tiles filling row by row across the top half, with an accent counter chip counting from→to (e.g. 823 POSTS → 1,711 POSTS). Options: from, to, label (default posts), prefix, cols, rows, height (0-1, default 0.44), run (s), position (default top), theme. |
| `price_tag` | Swinging price tag (with hole and string): old price struck through, new price pops in, round discount badge stamps on. Options: old, new, currency (default ₹, Indian digit grouping), badge (auto '-40%', '' to hide), label, tilt, decimals; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `progress_ring` | Circular progress ring filling to value % with the number counting up in the centre and a label below. Options: value (0-100), label, title, suffix (default %), decimals, radius (px at 1080); theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `rating` | Star rating card: stars fill one by one to value (halves supported) with a counting score '4.5 /5' and a label. Options: value, stars (3-10, default 5), label, title, score true/false; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `stat_bars` | Horizontal comparison bars filling in sequence with labels and counting percentages; top item in accent. Options: items [{label, value}] or labels[]+values[] (≤6), max (default 100), prefix, suffix (default %), highlight, title, sub; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `timeline` | Steps with dots joined by a line that draws on; each label appears in turn and the current step glows in accent (past steps get a ✓). Horizontal in 16:9/1:1, vertical in 9:16 (or `direction`). Options: steps[] (strings or {label, sub}) ≤6, subs[]/dates[], times[], direction horizontal/vertical, title; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |
| `versus` | A vs B comparison card: two columns with titles and 2-4 bullets revealed left then right, a round VS badge, optional winner highlight. Options: a/b (or left/right) as {title, items[]} or titles[] + items_a[]/items_b[], winner a/b, uppercase; theme light/dark, position top/upper/center/lower/bottom/0-1, x, width (0-1 of W), accent, fill, color, sfx (false or a sound name). |

## Effects: Kinetic, decor & transitions

| type | what / options |
|---|---|
| `arrow` | Hand-drawn curved arrow drawn on from a start point to `target`, optional handwritten label at the tail. Options: target [x,y] (default 0.42,0.42), from [x,y] (or x,y; auto if omitted), bend (-1..1, 0.28), text, font (caveat), size (label, 72), color, stroke (9), draw (s), anim draw/pop. |
| `burst` | Comic starburst (white, ink outline, hard shadow) popping with a tilt and wobbling, with text. Options: text ('WOW!'), x,y (default 0.76,0.2), size (radius, 170), rotate, spikes (16), fill, color, outline, shadow, font (bangers). |
| `chip_roll` | Slot-machine word roller: white pill, words roll vertically (fast → eased, motion blur, ticks) and land on the last item or `final`. Options: items[], final, prefix (white text left of the pill, e.g. 'Made with'), x,y/position (default 0.5,0.2), roll (seconds), spins (rows rolled, 11), size, font, fill, color. |
| `circle_highlight` | Imperfect hand-drawn ellipse (two overlapping strokes) drawn on around `target` [x,y,w,h] (centre + size as frame fractions, default [0.5,0.34,0.56,0.3]). Options: color, stroke (8), draw (0.7 s), rotate, boil false. |
| `confetti` | Falling, tumbling confetti (rects, strips, dots, triangles; neutral + accent). Options: mode rain/burst (burst shoots up from x,y default 0.5,0.62), count (70), colors[], accent, scale, dur, seed. |
| `doodle` | Hand-drawn white doodle drawn on stroke-by-stroke (or popped) with a subtle hand-drawn line boil. Options: shape star/heart/arrow/circle/underline/sparkle/lightning/crown/question/exclamation/smile/clapper/scribble/burst, x,y (default 0.76,0.2), size (170), rotate, color, stroke (px), anim draw/pop, draw (s), boil false, glow true, shadow false; shapes:[name or {shape,x,y,size,rotate,color,anim}] places several (auto-spread around the head), stagger (0.18 s). |
| `doors` | Transition: two charcoal panels slide in, meet with a light seam, then open. Options: dur (0.8; 1.4 with text), text (title shown while closed), theme dark/light, color, text_color, font, size. |
| `head_stack` | Monospace chips drop from above one by one and stack on top of the head, then float away. Options: items[] (≤6), x,y (stack base = top of head, default 0.5,0.22), theme light/dark, fill, color, accent, size, font (default space-mono), seed. |
| `light_leak` | Warm film light leak: big blurred translucent blobs drifting across with a soft wash. Options: color warm/pink/gold/cool/red/hex, side left/right/top/bottom, intensity (0.1–2), count (4), dur. |
| `notes_wall` | Headline wall: 5–9 paper notes (white/cream, tilted, tape strip, marker ink) pop in around the frame edges, keeping the face clear. Options: items[] (short texts, *accent* ok), count 1–9, color (paper), text_color, font (default marker), scale 0.5–1.6, seed. |
| `orbit_cards` | 4–6 small rounded UI cards (label + accent dot) orbiting a point in pseudo-3D with depth scale/fade. Options: items[] (≤6 labels), x,y (0.5,0.30), radius (0.38), tilt (16), roll, speed (0.16 turns/s), theme light/dark, fill, color, accent, size, font. |
| `orbit_text` | Ring of letters orbiting a point in pseudo-3D (back half small, dim and mirrored). Options: text (repeated to fill the ring), x,y (default head 0.5,0.30), radius (fraction of the short side, default 0.36), tilt (deg, 15), roll (deg, -6), speed (turns/s, 0.28; negative = reverse), size, font, color, separator ' • ', wrap true (back half goes behind the speaker via AI cut-out). |
| `paper_tear` | Transition: a cream paper sheet slides up over the video, then tears along a jagged line and the halves fly apart. Options: dur (1.0; 1.5 with text), text (marker ink on the paper, *accent* ok), color, text_color, font, tear_y (0.2–0.85). |
| `scribble_frame` | Rough hand-drawn rectangle (double sketch lines, overshooting corners) drawn on around the screen edges or a `target` [x,y,w,h]. Options: inset (0.045), color, stroke (7), draw (0.8 s), double false, boil false. |
| `shockwave` | 2–5 expanding rings with fading blur, core glow, debris dots and an optional flash. Options: x,y (0.5,0.42), color, rings (3), radius (fraction of the diagonal, 0.5), flash false, flash_alpha, debris (count, 14). |
| `sparkles` | Twinkling 4-point stars + tiny dots around a region. Options: target [x,y,w,h] (default the head), count (12), size (74), color. |
| `speed_lines` | Manga radial speed lines rushing toward a point, flickering every 2 frames. Options: x,y (0.5,0.42), color white/black/hex, alpha (0–255), count (72), radius (clear zone multiplier, 1.0). |
| `typewall` | Rows of huge repeated text scrolling sideways in alternating directions, filling the frame (filled + outline rows). Best with "behind": true. Options: text, style mixed/solid/outline, color, alpha (0x68), size (230), rows, speed (px/s, 160), font (anton), separator, line_height. |
| `word_sticker` | Die-cut word sticker: big word with a thick white border and shadow, pops in, wiggles, pops out. Options: text ('WOW'), x,y (default 0.72,0.22), size (120), rotate (-6), color (text, ink), border_color (white), border (px), font, uppercase false. |

## Effects: Advanced / custom

| type | what / options |
|---|---|
| `ass` | Advanced: a brand-new animation written in ASS override tags (Claude designs it). layers[{start,end,layer,font,size,color,text/shape}], params; placeholders {W} {H} {cx} {cy} {accent} {dur_ms} {text} |

## Preset combos (26): one line, several effects
Use `{"type": "<name>", "at": …, <params>}`; times inside are relative.

| preset | what | params |
|---|---|---|
| `hook-slam` | Opening hook: punch zoom + slamming title + flash + impact. | text |
| `breaking-news` | Breaking-news style banner with a red label. | text |
| `money-moment` | Money count-up with confetti and a cash sound. | from, to, prefix, label |
| `mind-blown` | Manga impact frame + shockwave + shake. | text |
| `plot-twist` | Focus pull + glitch title. | text |
| `the-secret` | Spotlight on you + elegant serif reveal. | text |
| `hot-take` | Rotated stamp + comic burst + shake. | text |
| `wrong` | Black & white + red WRONG stamp + buzzer. | text |
| `correct` | Green CORRECT stamp + sparkles + success jingle. | text |
| `big-reveal` | Darken + drum roll, then a flash and title on the reveal. | text |
| `quick-tip` | Tip card with a doodle star. | text, label |
| `pov` | POV title that types on, with cinematic bars. | text |
| `before-after` | BEFORE (black & white) then AFTER (colour) with a flash. | split |
| `warning` | Red warning label + dim + alarm. | text |
| `game-changer` | Two-tone stacked title with sparkles and a magic chime. | text |
| `comment-keyword` | Comment box typing your keyword + CTA (for lead magnets). | keyword |
| `follow-cta` | Follow CTA with a hand-drawn arrow and heart pop. | text |
| `save-this` | SAVE THIS label with a doodle star. | text |
| `cover-story` | Huge magazine word behind you (AI cut-out). | text |
| `freeze-label` | Freeze frame with a stamped label and camera flash. | text |
| `manga` | Manga impact frame with speed lines. | text |
| `newspaper` | You on the front page of a newspaper. | text, sub |
| `money-note` | You printed on a banknote with a big number. | number, sub |
| `sticker-me` | Freeze into a sticker cut-out with a word sticker. | text |
| `clone-army` | Copies of you fan out behind you. | count |
| `type-wall` | Huge scrolling text rows behind you (AI cut-out). | text |

## Caption styles (47)

| style | look |
|---|---|
| `bold-pop` | Heavy white words, the spoken word pops in yellow. The classic viral reel look. (anim `pop`, font `poppins-black`) |
| `clean` | Calm sentence-case captions with a soft shadow. Good for explainers and professionals. (anim `fade`, font `inter-extrabold`) |
| `karaoke` | Whole line shown, words fill with colour as they are spoken. (anim `karaoke`, font `archivo-black`) |
| `single-word` | One huge word at a time, centred. High-energy, fast-paced edits. (anim `single`, font `anton`) |
| `boxed` | Black text on a white box, like a sticker label. (anim `fade`, font `inter-extrabold`) |
| `neon` | White words with a green neon glow on the spoken word. (anim `pop`, font `poppins-extrabold`) |
| `handwritten` | Friendly handwriting that types on word by word. (anim `typewriter`, font `caveat`) |
| `minimal` | Small, low, subtle captions that stay out of the way. (anim `fade`, font `inter-bold`) |
| `red-hot` | Condensed caps, the spoken word flashes red. Bold, urgent. (anim `pop`, font `bebas`) |
| `comic` | Yellow comic-book letters with a thick outline. (anim `pop`, font `bangers`) |
| `elegant` | Serif captions with gold emphasis. Luxury, lifestyle, storytelling. (anim `fade`, font `serif`) |
| `typewriter` | Wide techy caps that type on word by word. (anim `typewriter`, font `archivo-expanded`) |
| `blob-purple` | The spoken word gets a rounded purple highlight blob behind it. (anim `blob`, font `poppins-black`) |
| `blob-yellow` | The spoken word turns black on a yellow highlighter blob. (anim `blob`, font `poppins-black`) |
| `hindi-bold` | Devanagari (Hindi script) captions, yellow pop on the spoken word. (anim `pop`, font `devanagari`) |
| `serif-mix` | Clean sans words; key words switch to an elegant italic serif (the 'aesthetic' look). (anim `serif`, font `inter-extrabold`) |
| `aesthetic` | Lowercase italic serif, soft fade. Lifestyle, vlogs, aesthetic edits. (anim `fade`, font `instrument-serif-italic`) |
| `kinetic` | Kinetic typography: emphasis words jump in bigger and coloured. (anim `kinetic`, font `montserrat-black`) |
| `stack` | Words stacked line by line, emphasis words big in accent (the 'digital zoom' look). (anim `stack`, font `poppins-black`) |
| `fill-sweep` | Each word fills smoothly with colour as it is spoken. (anim `fill`, font `montserrat-black`) |
| `underline` | Clean captions; the spoken word gets underlined in colour. (anim `underline`, font `inter-extrabold`) |
| `outline-fill` | Hollow outlined words that fill solid when spoken. (anim `outline`, font `anton`) |
| `glow-word` | The spoken word glows softly in the accent colour. (anim `glow`, font `poppins-extrabold`) |
| `bounce` | Playful rounded font, the spoken word bounces. (anim `bounce`, font `lilita`) |
| `flip` | Chunky caps; the spoken word flips in. (anim `flip`, font `archivo-black`) |
| `blur-in` | The spoken word sharpens from a soft blur. Smooth and premium. (anim `blur`, font `montserrat-bold`) |
| `slide-up` | Each caption slides up into place. (anim `slide`, font `barlow-black`) |
| `rise` | Sentence-case captions that rise gently with a soft focus pull. (anim `rise`, font `inter-extrabold`) |
| `mono-code` | Monospace 'terminal' captions that type on. Tech, AI, coding. (anim `typewriter`, font `space-mono`) |
| `pixel` | 8-bit pixel captions. Gaming, retro, nostalgia. (anim `typewriter`, font `pixel`) |
| `marker` | Thick marker handwriting with a white pop. (anim `pop`, font `marker`) |
| `tall-single` | One tall condensed word at a time, huge. Hype edits. (anim `single`, font `barlow-condensed-black`) |
| `classic-yellow` | Montserrat Black caps, spoken word in yellow. The proven high-retention style. (anim `pop`, font `montserrat-black`) |
| `blob-dark` | Neutral: the spoken word sits on a charcoal highlight blob. (anim `blob`, font `poppins-black`) |
| `blob-white` | Neutral: the spoken word turns black on a white blob. (anim `blob`, font `poppins-black`) |
| `lowercase` | Minimal lowercase captions, no outline. Calm and modern. (anim `fade`, font `inter-bold`) |
| `magazine` | Big editorial serif headlines word by word. Luxury, fashion, food. (anim `fade`, font `abril`) |
| `hinglish-bold` | Mukta ExtraBold: perfect for Hinglish (Roman + Devanagari mixed). (anim `pop`, font `mukta`) |
| `hindi-clean` | Clean Devanagari captions (Hind), soft fade. (anim `fade`, font `hind`) |
| `hindi-headline` | Display Devanagari serif (Rozha One) for dramatic Hindi. (anim `pop`, font `rozha`) |
| `tamil-bold` | Tamil script captions, pop highlight. (anim `pop`, font `tamil-hind`) |
| `telugu-bold` | Telugu script captions, pop highlight. (anim `pop`, font `telugu`) |
| `bengali-bold` | Bengali script captions, pop highlight. (anim `pop`, font `bengali-hind`) |
| `gujarati-bold` | Gujarati script captions, pop highlight. (anim `pop`, font `gujarati-hind`) |
| `punjabi-bold` | Punjabi (Gurmukhi) captions, pop highlight. (anim `pop`, font `gurmukhi-mukta`) |
| `kannada-bold` | Kannada script captions, pop highlight. (anim `pop`, font `kannada`) |
| `malayalam-bold` | Malayalam script captions, pop highlight. (anim `pop`, font `malayalam`) |

## Looks (36)
`natural` Barely touched: a little contrast, true colours. · `punchy` Crisp contrast and richer colour. Safe default for talking heads. · `warm` Golden, cosy skin tones. · `cool` Clean blue-ish tech look. · `cinematic` Teal shadows, warm skin, soft vignette. Film-like. · `moody` Darker, desaturated, dramatic. · `vintage` Faded film with warm cast and grain. · `bw` High-contrast black and white. · `airy` Bright, light, soft. Lifestyle, beauty, food. · `matte` Lifted blacks, flat modern creator look. · `vivid` Loud, saturated, colourful. Gaming, kids, fun. · `neon-night` Magenta-cyan night-time vibe. · `clean-neutral` Neutral, true-to-life with gentle clarity. Works on anything. · `soft-neutral` Soft, slightly lifted, low contrast. Calm talking heads. · `creator-pop` Bright, clean, saturated creator look. · `teal-orange` Hollywood teal shadows + orange skin. · `warm-film` Warm Kodak-style film: golden mids, soft roll-off, grain. · `fuji-green` Fuji-style film: cool greens, gentle contrast. · `golden-hour` Sunset-gold glow on skin and highlights. · `nordic` Cold, clean Scandinavian blue-grey. · `muted-earth` Desaturated earthy tones. Documentary, travel. · `pastel` Faded pastel: lifted shadows, soft colours. · `high-key` Very bright, airy, white backgrounds. · `low-key` Dark, contrasty, dramatic. · `bleach-bypass` Gritty silver film look, low saturation, high contrast. · `sepia` Old-photo sepia. · `noir` Film-noir black & white with deep shadows and vignette. · `cyberpunk` Neon magenta/cyan city vibe. · `vhs` 90s VHS tape: soft, colour bleed, noise. · `chrome` Crisp metallic, punchy blues and whites. · `rose` Soft rose/pink tint. Beauty, fashion. · `mint` Fresh mint-teal highlights. · `night-blue` Moonlit blue night. · `desert` Hot dusty orange-beige. · `forest` Rich deep greens. · `matte-black` Modern matte: lifted blacks, crushed highlights, muted.

## Sounds (50)
`whoosh` · `whoosh-fast` · `swipe` · `pop` · `bubble` · `click` · `mouse-click` · `typing` · `ding` · `notification` · `success` · `error` · `riser` · `impact` · `bass-drop` · `shutter` · `glitch` · `tick` · `tick-tock` · `cash` · `heartbeat` · `sparkle` · `boing` · `record-stop` · `zoom` · `tap` · `toggle` · `swish` · `whoosh-long` · `reverse-whoosh` · `coin` · `level-up` · `alarm` · `kick` · `clap` · `snap` · `laser` · `beep` · `countdown-beep` · `enter-key` · `paper` · `camera-flash` · `magic` · `bubble-pop` · `transition-hit` · `ding-dong` · `message-sent` · `heart-pop` · `drum-roll` · `swoosh-up`

Pairings: titles → whoosh/impact/swoosh-up; cards & pills → pop; UI → tap/mouse-click/typing/notification/message-sent; money → cash/coin; myths → error, facts → success/ding; reveals → riser/drum-roll then impact/bass-drop; funny → boing/record-stop; transitions → whoosh-fast/swish/transition-hit. User sounds in `sounds/` by file name.

## Fonts (73 + the user's own in `fonts/`)
`poppins-black` · `poppins-extrabold` · `poppins-bold` · `poppins-semibold` · `montserrat-black` · `montserrat-extrabold` · `montserrat-bold` · `montserrat-black-italic` · `inter-extrabold` · `inter-bold` · `barlow-black` · `barlow-extrabold` · `barlow-semibold` · `barlow-condensed` · `barlow-condensed-black` · `kanit-black` · `kanit-semibold` · `anton` · `bebas` · `archivo-black` · `archivo-expanded` · `russo-one` · `chakra-petch` · `black-ops` · `bowlby` · `rubik-mono` · `bungee` · `lilita` · `luckiest` · `bangers` · `righteous` · `monoton` · `ultra` · `abril` · `serif` · `dm-serif` · `serif-italic` · `instrument-serif` · `instrument-serif-italic` · `shrikhand` · `pacifico` · `satisfy` · `caveat` · `marker` · `gloria` · `shadows` · `special-elite` · `space-mono` · `space-mono-regular` · `plex-mono` · `plex-mono-medium` · `pixel` · `vt323` · `noto-black` · `noto-bold` · `devanagari` · `devanagari-bold` · `hind` · `mukta` · `rozha` · `kalam` · `yatra` · `tamil` · `tamil-hind` · `telugu` · `bengali` · `bengali-hind` · `gujarati` · `gujarati-hind` · `kannada` · `malayalam` · `gurmukhi` · `gurmukhi-mukta`

All fonts render at the same visual size for the same `size` (auto-normalised). Native-script text needs a script font (devanagari/hind/mukta/rozha/kalam/yatra · tamil · telugu · bengali · gujarati · kannada · malayalam · gurmukhi).

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
