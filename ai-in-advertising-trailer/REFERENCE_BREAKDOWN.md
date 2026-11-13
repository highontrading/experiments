# Reference breakdown: "Alpha Premiere League" (First Light, YouTube `EyS8fX1sOoE`)

Analysed from the 1080p file: **1920×1080, 25 fps, 51.72 s, 1,293 frames, every frame read.**
Audio: AAC stereo 44.1 kHz. Cut detection, optical flow, luma/colour per frame, plus
beat, kick, transient and spectrogram analysis of the soundtrack (`tools/analyze.py`).

Times are `seconds (frame number)`. 1 frame = 0.04 s.

---

## 1. The idea in one line

A 50-second **"history → disruption → reveal" teaser**: three short sentences of voiceover
are typed on screen in a pixel font, and between them come **beat-cut montages** of
real-world footage and screen recordings. Ends on a black title card.
The whole thing is built on one rule:

> **Text sections have no kick drum. Footage sections have the kick, and every cut lands on it.**

The music drops out under each sentence so the line can land. Then it slams back in for the proof montage.

---

## 2. Global look (applies to every frame)

| Element | Spec |
|---|---|
| Frame | 1920×1080 with a **2.21:1 letterbox**: black bars **107 px** top and bottom, picture area 1920×866 (rows 107–974). The bars never move. |
| Frame rate | 25 fps. Fast cuts are counted in single frames. |
| Text-card background | Two values: **near-black `#050505`** in Act 1 and the title, **charcoal `#1D1F1F`** in every later text card. Flat, no gradient. |
| VHS overlay (always on) | Thin **horizontal dropout streaks**: dashed white lines, 1–2 px tall, a few per frame, re-randomised every frame. Fine grain. They're most visible on the dark cards. |
| Footage grade | Crushed blacks, punchy contrast, warm skin, slightly soft because the sources are upscaled web video. **Chromatic aberration** (red/cyan edge split) on high-contrast edges. Nothing is clean; everything looks recorded off a screen. |
| Typography | One **all-caps pixel / bitmap display font**, white. On a fixed left anchor it grows to the right as it types. Cap height ≈ 50 px at 1080p. Tight tracking. Its "N" is drawn like "II", a clear marker of the pixel-font style. The title adds "Presenting" in a **thin, light, lowercase humanist sans** above the main line. |
| Bracket device | Two white **pixel-block corner shapes** (stepped L / tetromino-like). One sits upper-left of the text, the other lower-right. They frame each sentence card from Act 3 on, glitch in with RGB edges, and later overlap the first and last logo. |
| Text animation | **Typewriter, synced to the VO**: about one character per frame while the word is spoken, held between words. Changes use glitch swaps, backspace-delete, or a strobe "decoder" scan. Never a plain fade. |

---

## 3. Shot-by-shot timeline

### ACT 0 — Cold open: "chaos" flashes (0.00–2.28), no VO
Half-time sub-bass booms (one about every 0.97 s) with high glitch ticks at 0.09 / 0.33 / 0.52.

| Time (frames) | Shot | Treatment |
|---|---|---|
| 0.00–0.16 (0–3) | TV news anchor in front of a red/blue ticker wall ("-1.7%") | Heavy RGB split, slight push-in |
| 0.16–0.24 (4–5) | Red LED "DJ UPDATE" ticker | 2-frame flash |
| 0.24–0.32 (6–7) | **Black** with VHS streaks | 2-frame flash-to-black |
| 0.32–0.40 (8–9) | Red 3D stock chart (stock footage) | 2-frame flash |
| 0.40–0.52 (10–12) | **Black** | 3 frames |
| 0.52–1.40 (13–34) | Film trading-floor wide, chaotic | 1.24–1.36: **vertical-slice glitch** (frame cut into vertical strips offset up/down) |
| 1.40–1.56 (35–38) | → **datamosh / pixel-block** transition into the next shot | Blocky compression smear, RGB fringes |
| 1.56–2.28 (39–56) | Film trader at desk, medium shot | 2.12–2.20: vertical-slice glitch out |
| 2.28 (57) | Hard cut to near-black | — |

**Rhythm:** 2–3 frame flashes alternating with black frames, then two longer shots (~0.9 s and ~0.7 s).
It feels like a TV being channel-surfed.

### ACT 1 — "They said the market was ruled by… emotion / fear / greed / chance" (2.28–9.72)
Near-black card, the **sustained sub drone (≈C1, 32 Hz) pulsing every ~0.97 s**, no kick.

| Time | Event |
|---|---|
| 2.44 | VO starts "They…". Text types from a **fixed left anchor (x≈203 px)**, vertically centred, one char per frame with the VO |
| 4.6–5.0 | Line completes: `THEY SAID THE MARKET WAS RULED BY EMOTION` |
| 6.12–6.44 | **Glitch word-swap EMOTION → FEAR**: the last word's glyphs scramble and flip vertically for ~8 frames. High-frequency glitch SFX at 6.25 |
| 7.28–7.60 | Same glitch swap **FEAR → GREED** (SFX 7.62) |
| 8.84–8.92 | Whole line **defocuses (blur)** (SFX 8.84) and the last word becomes CHANCE |
| 8.92 | **Smash punch-in ~2×**: the line now reads `…AS RULED BY CHANCE`, cropped off the left edge, big and sharp |
| 9.52–9.68 | "CHANCE" glitches into a **skewed / italic distortion** for 4 frames |
| 9.72 | Hard cut to footage |

### ACT 2 — Short footage bridge (9.72–11.80)
The sub note changes at 10.3 s (to ≈C2). **Four-on-the-floor kick starts at 10.6 s** (≈126 BPM).

| Time | Shot |
|---|---|
| 9.72–10.40 | Trader on the phone, low angle, looking up (film) |
| 10.40–11.08 | Packed trading pit, wide, warm |
| 11.08–11.80 | TV presenter in front of a blue "Exchange Map" wall. 11.64–11.72: **vertical-slice glitch** out |

### ACT 3 — "Then came the machines." → "ALGORITHMS" (11.80–15.24)
Charcoal card. **Kick drops out at ~12.5 s.** Pads, glitch textures.

| Time | Event |
|---|---|
| 11.80–11.88 | Charcoal frame; a single **rainbow RGB glitch "T"** blinks in |
| 12.00–12.80 | `THEN CAME THE MACHINES` types centre-frame. At the same time a **collage of ~6 small video tiles** (tech-keynote footage, about 190×170 px each) pops in around the text in a **plus/cross layout** (top, left, centre, right, bottom). The **two white pixel brackets** glitch in, top-left and bottom-right |
| 13.36–13.60 | Text **slice-glitch + italic skew**, then it swaps |
| 13.56–13.72 | **Green pixel-mosaic dissolve** spreads across frame → a **green "digital rain" (Matrix-style code)** overlay fades over everything; tiles stay, tinted green |
| 13.70–15.00 | `ALGORITHMS` holds (VO: "Algorithms learned the game") |
| 15.04–15.20 | **Horizontal motion-smear exit**: the whole comp streaks sideways like a whip-pan |
| **15.24–16.10** | **Pure black + DIGITAL SILENCE** (audio is truly −∞ dB from 15.3 to 16.0). The "breath" before the next line |

### ACT 4 — "MODELS EVOLVED" (16.12–17.64)
| Time | Event |
|---|---|
| 16.12–16.30 | `MODELS` **resolves out of pixel noise** (ghosted blocky smear → sharp), placed centre-right (x≈1290) |
| 16.76–17.00 | `EVOLVED` arrives with an overlap glitch (two words briefly superimposed) |
| 16.1–17.4 | Sound: VO plus a **wobbling, rippling riser** (visible as a wave pattern in the spectrogram) building to the drop |

### ACT 5 — Beat montage (17.64–22.92): **one cut per beat**
Kick back at **17.74**. Cuts every **~0.48 s (12 frames)**, all on the kick.

| Time | Shot | Motion |
|---|---|---|
| 17.64 | Red LED stock board | Scrolls up |
| 18.16 | Tech CEO on stage, dark, purple light leak at top | Static |
| 18.64 | Another tech CEO on stage, blue background | Static |
| 19.08 | Blue LED ticker ("JKQ 56.66 +1.37") | Scrolling |
| 19.24 | **Green wireframe terrain fly-through** (retro CG) | Fast forward motion |
| 19.56 | Bloomberg-terminal screen, close crop | Slight drift |
| 20.04 | AI CEO on stage | Static |
| 20.56 | **Code editor screen recording** (OpenAI API JavaScript) | Slow drift |
| 21.04 | Archival office footage, warm VHS | — |
| 21.52 | Archival TV interview | — |
| 22.00 | Investor speaking into a mic | — |
| 22.48 | Old CRT trading terminal (blue/red grid) | — |
| 22.92 | Cut to charcoal | — |

### ACT 6 — "From Wall Street to Web3, from chaos to code" (22.92–27.68)
**Kick off again** (one isolated hit at 25.53). Charcoal card with brackets.

| Time | Event |
|---|---|
| 22.96–24.40 | `FROM WALL STREET TO WEB3` types from a left anchor (x≈260), with the brackets: upper-left at x≈183–253, lower-right at x≈697–807 |
| 24.92–25.40 | **Heavy glitch-out**: RGB split, horizontal block displacement, dithered pixel scanlines, duplicated text layers, then a dissolve to near-black |
| 25.44–27.10 | Resets and types `FROM CHAOS TO CODE` |
| **27.12–27.68** | **Strobe "decoder" transition on the drop**: frames alternate **white / dark** in 1–2 frame pulses. The text turns grey, and each frame **one letter lights up with a lens-flare glint**, the glint stepping across the line letter by letter (F-R-O-M…C-O-D-E). **Kick slams back at 27.30** |

### ACT 7 — Proof montage of screen recordings (27.72–32.80), kick on

| Time | Shot | Motion |
|---|---|---|
| 27.72–28.52 | **Tweet screenshot** ("…best demonstration of why LLM trading is broken…") with an AI-model P&L line chart | **Scrolls up** into the chart, slight zoom |
| 28.52–29.12 | Bombay Stock Exchange building with LED ticker, low angle (stock footage) | Static |
| 29.12–29.68 | Film celebration / party scene | — |
| 29.68–30.24 | **Trading-app screen recording**: candlesticks, HIGHER/LOWER buttons, cursor | Static |
| 30.24–30.80 | **Tweet** ("Interesting how Deepseek-R1 manages to beat frontier LLMs…") with a dashboard screenshot below | Scrolls up; the screenshot has a **slight barrel / curved-glass warp** |
| 30.80–31.40 | **Live AI-trading dashboard**: positions table + equity chart | **Push-in** |
| 31.40–32.00 | Official speaking at a podium, blue background | — |
| 32.00–32.80 | Event / crowd footage | — |

### ACT 8 — "Now a new arena emerges, built not for humans, but for AIs, to prove their edge" (32.80–39.56)
**Kick off.** Charcoal card + brackets.

| Time | Event |
|---|---|
| 32.84–34.40 | `NOW A NEW ARENA EMERGES` types |
| 34.96–35.20 | **Backspace-delete**: characters erase right to left, fast |
| 35.20–36.40 | `BUILT NOT FOR HUMANS` types |
| 36.40–36.76 | Text **dissolves letter by letter to grey**, and the **first AI logo fades in** where the text began |
| 36.80–37.30 | **Logo row strobes on**: 6 logos, frames alternate on/off as each new one is added (stutter-build) |
| 37.30–39.56 | Row of **6 glowing AI logos** holds (OpenAI, Claude, Gemini, Perplexity, DeepSeek, Grok): soft **bloom glow** + RGB fringe, slight flicker. The **brackets overlap the first and last logo**. VO: "…but for AIs to prove their edge" |

### ACT 9 — Rapid-fire barrage (39.56–41.96), kick + extra hits
| Time | Event |
|---|---|
| 39.56–40.40 | **Tweet barrage**: ~8 tweet/screenshot crops, **2–4 frames each**, all scrolling fast (crypto manipulation thread, "Buy the dips" posts with a red **SCAM** stamp, a tariff post with a pointing-hand emoji, a "$TRUMP sniped" post) |
| 40.40–41.96 | AI leaderboard chart screen recording; **slow lateral pan** across the chart into the positions table |
| 41.96 | Hard cut to **pure black** |

### ACT 10 — Title (41.96–49.52) + tail (49.52–51.72)
| Time | Event |
|---|---|
| 41.96–42.24 | Black (7 frames) |
| 42.28–42.76 | **Horizontal light-streak wipe**: a white smeared bar shoots in from the left and stretches the text horizontally (pixel-stretch). It resolves into the title from right to left |
| 42.76–48.70 | Locked title, centred: small `Presenting` (thin sans) above `ALPHA PREMIERE LEAGUE` (pixel font, ≈976 px wide). Subtle flicker + VHS streaks. Music: kick continues plus **rising synth arps/sweeps** every ~2 bars (diagonal lines in the spectrogram from 43 s) |
| 48.70–49.48 | Title **fades down to grey**; last kick at 49.18 |
| 49.52–51.72 | End card: charcoal + VHS streaks only, music **reverb tail fades to silence** |

---

## 4. Sound design structure

**Track:** dark cinematic electronic, **≈126 BPM** (kick spacing 0.476 s). Sub-bass sits on **C** in the intro and
title and **A** in the middle sections. Overall loudness is high and compressed (≈ −6 to −12 dB RMS).

```
time    0     2.3        9.7  10.6 12.5     15.3 16.1  17.7     22.5    27.3       32.5        39.6         49.2  51.7
music   [booms][sub drone, half-time][4/4 kick][pads ][SIL][riser][4/4 kick][break][4/4 kick][   break   ][4/4 kick + arps][tail]
VO              "They said … chance"           "Then came…" "Models" "evolved"  "From Wall St…" "Now a new arena…"
picture flashes  TEXT CARD         FOOTAGE     TEXT+collage  BLK  TEXT  MONTAGE   TEXT CARD  SCREEN-RECS  TEXT → LOGOS  BARRAGE → TITLE
```

| Layer | What it does | Where |
|---|---|---|
| **Kick (4/4)** | Drives the montages. **Every montage cut lands on a kick** | 10.6–12.5, 17.7–22.5, 27.3–32.5, 39.6–49.2 |
| **Sub drone / booms** | Carries the intro and the first sentence. Half-time pulse every ~0.97 s | 0–9.7 |
| **Drop-outs** | The kick vanishes under every sentence, so the VO always sits on pads/sub | 12.5–17.7, 22.5–27.3, 32.5–39.6 |
| **Digital silence** | One full stop: 0.8 s of pure black with zero audio | 15.3–16.1 |
| **Riser / wobble** | Pulls out of the silence into the montage | 16.1–17.4 |
| **Glitch SFX** | A short high-band tick or crunch on every text glitch / word swap / logo strobe | 6.25, 7.62, 8.84, 12.0–13.7, 25.0, 25.9, 33.6–35.3, 36.8–38.2 |
| **Drop hit** | Kick re-entry *on* the strobe transition | 27.30 |
| **Arps / sweeps** | Rising synth lines under the title for lift | 43–49 |
| **Tail** | Reverb fade to silence under the empty VHS card | 49.2–51.7 |
| **VO** | Narrator, close-mic, sits on top. Speech starts 2.40, 11.92, 16.4, 23.0, 33.0. **Every line is typed on screen in sync** | — |

---

## 5. Edit grammar (the reusable recipe)

1. **Alternate modes:** TEXT CARD (VO, no kick, 3–7 s) ↔ FOOTAGE (kick, cut on every beat, 2–5 s).
2. **Footage shot length = 1 beat (12 frames)** in montages; **2–4 frames** in the cold open and the final barrage.
3. **Never fade.** Transitions are: hard cut, vertical-slice glitch, datamosh, horizontal smear/whip, strobe, light-streak wipe.
4. **Text is typed with the voice** and changes by glitch swap, punch-in, backspace or the strobe decoder.
5. **One reveal object** before the title (here: the row of AI logos).
6. **Screen recordings are cropped tight**, often overscanned past the frame edge, and moved: scroll, push-in or lateral pan. Never shown flat and static.
7. **One true silence** in the middle, for contrast.
8. **The title gets the most space:** 0.3 s of black, a streak wipe, then 6 s held over the full-energy music.

---

# Blueprint: "AI in Advertising" trailer (same structure, our content)

Target: **1920×1080 (2.21:1 letterbox), 25 fps, ~52 s**. The same timings as above, so we can lay our material on the proven grid.

### VO script (same word count and slots as the original)

| Slot | Original | Ours (draft) |
|---|---|---|
| 2.4–9.7 | "They said the market was ruled by emotion, by fear, greed, and chance." | **"They said advertising was ruled by instinct. By gut, budget, and luck."** On-screen swaps: `INSTINCT → GUT → BUDGET → LUCK` (punch-in on LUCK) |
| 11.9–15.2 | "Then came the machines. Algorithms learned the game." | **"Then came the machines. Algorithms learned the audience."** Cards: `THEN CAME THE MACHINES` → `ALGORITHMS` |
| 16.1–17.6 | "Models evolved." | **"Models started creating."** Card: `MODELS CREATE` |
| 23.0–27.7 | "From Wall Street to Web3, from chaos to code." | **"From Mad Men to Midjourney. From briefs to prompts."** Strobe decoder on `FROM BRIEFS TO PROMPTS` |
| 33.0–39.6 | "Now a new arena emerges, built not for humans but for AIs to prove their edge." | **"Now a new creative department emerges. Not built by agencies, but by AI."** Logos: ChatGPT, Claude, Gemini, Midjourney, Runway, ElevenLabs (or the tools the course teaches) |
| 42–49.5 | Title: Presenting / ALPHA PREMIERE LEAGUE | **Presenting / AI IN ADVERTISING** (optional subtitle line: the course or channel name) |

### Footage slots to fill

| Slot | Duration | What we need (search terms) |
|---|---|---|
| Cold open 0–2.3 | 6 flashes | Times Square billboards, a vintage TV commercial, a TV-ratings board, an old agency boardroom, a newspaper print ad, a CRT TV of ad breaks |
| Bridge 9.7–11.8 | 3 shots | Ad-agency pitch meeting, 90s print-ad layout desk, focus-group room behind one-way glass |
| Collage 12–15.2 | 6 tiles | Short loops of AI keynotes / product launches (OpenAI, Google I/O, Meta Connect) |
| Beat montage 17.6–22.9 | 11 shots × 12 frames | Midjourney 4-up grid generating, Sora/Veo clip, Runway UI timeline, Meta Ads Manager (Advantage+), Google Performance Max, an AI avatar/UGC ad, an ElevenLabs voice waveform, a prompt being typed, a render progress bar, a well-known AI-made brand ad, a code/API screen |
| Proof montage 27.7–32.8 | 8 shots | **Screen recordings**: tweets/headlines about AI ads, a campaign dashboard with ROAS climbing, a before/after ad, generating an ad live in a tool, a Cannes Lions / industry-event clip |
| Barrage 39.6–42 | ~8 × 3 frames + 1.5 s pan | Rapid tweets and headlines ("AI ad", "agency layoffs", "made in 1 hour") → a slow pan across one big dashboard |

### How we'll build it
- **Text cards, brackets, VHS streaks, strobe decoder, logo row, title** can be generated in code (the same HTML-canvas → frames → FFmpeg pipeline as `vibe-editing-film/`), driven by one `timeline` file, so picture and sound stay frame-locked.
- **Footage and screen recordings** get the treatments in code too: letterbox crop, RGB split, vertical-slice glitch, datamosh, scroll/push-in/pan.
- **Music:** a licensed or AI-generated ~126 BPM dark cinematic electronic track that follows the section map in §4 (kick drop-outs under each VO line, 0.8 s silence at ~15.3 s, drop at ~27.3 s). Alternatively, build our own from the same section map.
- **VO:** recorded or ElevenLabs, cut to the slot times above.

### Rights note
The reference uses Hollywood film clips, broadcast TV and other people's tweets. For a course / channel trailer,
prefer **our own screen recordings, AI-generated clips, and stock or press footage we're allowed to use**. Treat
film/TV clips as placeholders unless we have the rights or a solid fair-use case.
