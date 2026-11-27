# Reference Style — Design System ("yonomi" coach reel)

Source: a 20.4 s, 720×1280, 30 fps "raw vs final" portfolio reel. The white page, the `raw`/`final`
labels, the grey "raw" card and the Telegram handle are only the editor's **portfolio wrapper**.
The style we copy is the **"final" card** (crop `392×730+266+292`). Every frame of it (612) was checked.
Key frames: `keyframes_A.png`, `keyframes_B.png`. 30 fps strips: `frames30_*.png` (frame numbers are printed on them).

---

## 1. Shot-by-shot breakdown (frame numbers @30 fps)

| # | Frames | Time | What's on screen | Text / motion | How it starts |
|---|---|---|---|---|---|
| 1 | 0–39 | 0.00–1.30 | Talking head, waist-up, warm wood-slat studio | Hook **stacked captions**: `you're / one / of the` → `Fitness / coaches`; slow push-in (~6%) | **Blur → sharp** focus pull, f0–4 |
| 2 | 40–79 | 1.33–2.63 | **3D render b-roll**: white low-poly mountains, a small glossy **yellow mannequin** in the foreground, grey pebbles, light floor grid | Small white sans `one of the biggest` types on letter by letter (f45–64), then big **yellow script** `Challenges` with glow blurs in, f65–69 | Shot 1 blurs out over 6 f (f34–39), cut, b-roll sharpens over 5 f |
| 3 | 80–102 | 2.67–3.40 | Same 3D world, low angle, mountain against a grey sky | **Yellow glow sans** `you up against` rises in from the top word by word with blur (f82–96) | Blur-out + camera tilt/zoom with motion blur |
| 4 | 103–127 | 3.43–4.23 | Light **blueprint grid wall** (#E3E8EE, thin dark major lines, faint minor grid) | A **black square panel slams down** from above with heavy vertical motion blur, overshoots, settles −3°→0° by f111. `Is standing out` reveals one glyph per frame, each glyph rising and fading in (f108–121) | Hard cut + whoosh |
| 5 | 128–201 | 4.27–6.70 | Same wall, **camera whip-pans right** to the next grid cell (one continuous canvas: the `t` of "out" stays at the left edge). Wall is in slight 3D perspective | **Lime arc** draws on (f130–139), `from other coaches` types on (f133–150), long hold with slow drift | 6-frame horizontal whip with heavy motion blur |
| 6 | 202–258 | 6.73–8.60 | Talking head, tighter (chest-up) | Stacked `before / and / afters.` (the new word blurs in over 2–3 f), then single words `Without`, `context` | Hard cut |
| 7 | 259–302 | 8.63–10.07 | **Word-flash sequence**: full-screen cards switch **black / white / black / white** | `It won't` (13 f) · `really` (7 f) · `help you` (8 f) · `much` (16 f), centred | Hard cut on each word |
| 8 | 303–441 | 10.10–14.70 | **UI explainer scene** on white | Orange **profile card** swings in from the bottom-left (motion blur, 3D tilt, overshoot, settles f312); contents build in: avatar emoji → pill placeholders → `Expert`, `Posts`/`Subs`, `Helping you with your stuff`, `- Fast delivery - Good quality`, `Text me` (f305–319). Gentle float. f334–349: a **huge black ✕ spins in** from the top-right with motion blur → it shrinks and spins down into a small **＋** under the card (f350–368) → the ＋ opens into a **3×3 grid of orange "?" tiles** that fade/scale in (peach → orange) while the card lifts up (f369–390). Holds with float | Swoop-in + whoosh |
| 9 | 442–612 | 14.73–20.40 | Talking head, medium | **Single-word captions**: `in`, `a way`, `that`, `demonstrates`, `why`, `your`, `method`, `is`, `superior`, `for`, `your`, `niche.`, `Video`, `testimonials,`, `when`, `conducted`, `in the` | Hard cut |

**Pacing:** 12 scene changes in 20.4 s (one every **1.7 s** on average). **~65% of the runtime (1.3–14.7 s) is full-screen
graphics or b-roll that replaces the speaker**; the voice carries the story. Talking-head stretches run 1.2–5.7 s.
Structure: *hook on face → visual metaphor (3D b-roll) → kinetic type panels → face → word-flash punchline → UI explainer → face.*

---

## 2. Typography

| Role | Spec |
|---|---|
| Captions and all UI/panel text | Neo-grotesk display bold (looks like SF Pro Display Bold). **We use Inter ExtraBold** (`inter-extrabold`, free/OFL; SF Pro can't be licensed for this). **Tight tracking −3 to −4%** (`\fsp-3…-4`). Keep the case as spoken (`Fitness`, `Video`, `It won't`) and keep punctuation (`niche.`, `testimonials,`) |
| Caption size | ~115–120 px for one word at 1080 wide (`demonstrates` fills ~80% of the width); centre at **y ≈ 0.50 H** (on the chest) |
| Hook stacks | 2–3 lines, **leading ≈ 0.80**, lines **zig-zag**: line 1 slightly left of centre, line 2 right-aligned under line 1, line 3 pushed further left. Lines overlap a little |
| Accent script | Big flowing script (`satisfy`), yellow with glow, tilted ~4°, paired with a small sans kicker above-right. Rare: once per video |
| Glow titles | Inter ExtraBold, yellow `#E6D23A`, wide soft glow, on b-roll only |
| Colour | White on footage/black; near-black `#0B0B0B` on white/grid. No outline. Soft drop shadow only on footage |

**Word animation:** each new word goes from 0→100% opacity with **8 px blur → 0** and a **~12 px rise** over **3–4 frames**
(the first frame shows it as ~55% grey). Panel text reveals **one glyph per frame**, each glyph rising from just below
the baseline. Caption swaps are **hard cuts**: a word stays for its spoken length, 4–13 frames (0.13–0.43 s).

---

## 3. Colour

| Token | Hex | Use |
|---|---|---|
| Black | `#000000` | flash cards, panels, ✕ icon |
| White | `#FFFFFF` | captions, flash cards, UI background |
| Canvas grey | `#E3E8EE` | blueprint wall |
| Minor grid | `#D3D9E1` | faint 90 px grid |
| Major line | `#454449` | thin structural lines |
| Yellow accent | `#E6D23A` (glow) · `#D8C428` (script) | b-roll titles, 3D mannequin |
| Lime | `#B8C000` | hand-drawn arc |
| Orange UI | `#E1B15B` → `#D67F3A` diagonal gradient; pills `#EFD2AF`; button `#F2E8DC` | profile card, "?" tiles |
| Studio | wood `#4E413F`/`#3A2F2B`, shirt `#131313` | talking-head grade target |

**Rule: a monochrome base plus *one* accent per scene** (yellow in the 3D world, lime on the grid wall, orange in the UI scene).

**Grade (`yonomi-warm`):** warm, slightly desaturated studio look. Brown woods, natural skin with no orange push, deep but
not crushed blacks, mild contrast, soft vignette, no grain. B-roll stays neutral cool grey.

---

## 4. Motion language

- **Nothing just appears.** Everything enters with blur: focus pulls, motion-blurred slams, blur-in words. The only hard
  pops are caption swaps and the word-flash cards.
- **Physical 3D cards:** panels and UI cards come in tilted in perspective, **overshoot and settle** (~8–10 frames, ease-out-back),
  then **float** (slow drift plus ~1° tilt) for the whole hold.
- **Camera on the graphics:** one continuous canvas (the grid wall) that the camera **whip-pans** across (6 frames of motion blur).
- **Transitions:** (a) face ↔ b-roll = blur out 6 f / blur in 5 f; (b) into graphic panels = slam or swoop + whoosh;
  (c) back to the face = hard cut; (d) punchline = black/white word flashes.
- **Icons transform:** ✕ spins → shrinks into ＋ → opens into a grid. Shapes carry the idea from one beat to the next.
- **Timing:** entrances 4–10 frames, holds 1–2 s, scene changes every ~1.7 s.

## 5. Sound
Tight VO: pauses cut to about 0.1 s, and loudness never drops below −35 dB, so there is no dead air. A **low music bed**
is ducked under the voice the whole way. **Subtle whooshes** play only on big moves (panel slam ~3.6 s, whip pan, card swoop).
**No pops or dings on captions.**

---

## 6. How this maps to Vibe Editor (saved in `styles/`)

| Signature | Use |
|---|---|
| Brand profile | `brand/brand.json` → caption `yonomi-word`, look `yonomi-warm`, Inter ExtraBold, accents |
| Single-word captions | caption style `yonomi-word` (1–2 words, blur-in, chest height) |
| Hook stacks | caption style `yonomi-stack` (stacked, tight leading). *Zig-zag offsets need the custom caption generator (to be built on the first real edit)* |
| Opener | `{"type":"yo-open","at":0}` |
| Face ↔ b-roll transition | `{"type":"yo-blur-cut","at":<cut−0.2>}` |
| Word-flash punchline | `yo-flash-black` / `yo-flash-white`, `text`, `dur` 0.25–0.45, alternating |
| Black panel on grid wall | `{"type":"yo-panel","text":"…","dur":1}` |
| Lime arc + text | `{"type":"yo-swoosh","text":"…","dur":1.5}` |
| Yellow glow title on b-roll | `{"type":"yo-glow-title","text":"…","y":560}` |
| Script + kicker title | `{"type":"yo-script-title","script":"Challenges","small":"one of the biggest"}` |
| Global | `auto_sfx: false`, `cuts.max_pause: 0.25`, music volume ~0.1 with duck |

**Built per video (depends on the script):**
1. **3D metaphor b-roll** (white low-poly world plus one yellow figure/object): generated per idea with Higgsfield
   image→video or the Blender `cinematic-3d-video` skill, then dropped into `broll/`.
2. **UI explainer scenes** (orange cards, icon morphs, tile grids) and the **whip-pan grid canvas**: rendered as
   HTML/canvas with Playwright (the same approach as `vibe-editing-film/`), then laid over the edit as full-screen clips.
3. **Zig-zag hook captions**: an ASS generator driven by the word timings.
