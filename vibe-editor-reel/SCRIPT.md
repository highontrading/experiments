# Vibe Editor — "Editors are working on this reel • LIVE"
### Full breakdown of the reference reel + production script for Vibe Editor (Google Flow · Omni Flash 1.2)

---

## PART 1 — What the reference video actually is (frame-by-frame analysis)

**Specs:** 720×1280 (9:16), 30 fps, 41.4 s, 1,239 frames. AAC stereo audio.
**Raw footage:** ONE locked-off camera, high-angle/top-down (~60° down from a ceiling corner), slight wide-lens distortion. A creator lies on a striped sofa wearing over-ear headphones and a clip-on lav mic, talking to camera. **Every "edit" you see is an overlay.** The footage itself is almost untouched: there are no hard cuts in the whole video.

**The concept (why it works):** the reel shows *itself being edited* while you watch. Five coloured multiplayer cursors (Figma-style) each carry a `✳ Claude` pill. As he names each job, that cursor's pill **renames to the job** (Sound → Transcript → Cuts → Captions → Camera) and does it on screen. The viewer watches the edit get built in real time, so it doubles as a product demo.

### 1.1 Timeline of the reference (timestamps from word-level transcript + frame numbers)

| Time | Frames | VO | What happens on screen |
|---|---|---|---|
| 0.00–0.25 | 0–7 | — | **Empty sofa.** Hook card already on screen with a purple Figma selection box labelled `hook` + `887 × 218` size tag. Five cursors idle as coloured dots. A red `skip 0.2s` label blinks. The lav mic lies on the cushion. |
| 0.25–0.70 | 7–21 | "You are…" | He **dives into frame from the bottom** (heavy motion blur), lands on the sofa. The cushion squash is the "impact". |
| 0.7–1.4 | 21–42 | "…currently watching" | Settles, starts talking. Cursors drift. A red dashed measurement line runs across him. |
| 1.4–2.0 | 42–60 | "five clones" | The dots **pop into labelled pills** `✳ Claude` one after another (yellow, blue, red, green, purple), each with a tiny scale-overshoot. |
| 2.0–5.1 | 60–153 | "edit this video, all while I'm just sitting here recording" | Cursors build a **layout grid**: pink vertical centre line, green dashed `safe area`, yellow `voice` box (`344 × 150`), blue `words` box (`800 × 118`), pink `centre` tag, a white pill `Luke ● recording` (name tag), size readouts under every box. Fast cursor moves get **motion-blur streaks**. |
| 5.1–5.5 | 153–165 | (breath) | **Transition #1:** hook card + guides **blur-dissolve** (gaussian blur up + opacity down over ~6 frames) and the **Voice widget** (dark glass panel with grey waveform, `ceiling` label) blurs in at the same spot. Nothing cuts. Everything melts into the next state. |
| 5.6–8.7 | 168–261 | "One of them is adjusting the audio to make sure it's absolutely perfect." | Yellow pill renames to `✳ Sound`. It grabs the waveform's `◇` handle and **drags it**, and the waveform fills **grey → yellow** from left to right. Label changes `ceiling` → `mic ✓`. |
| 9.4–11.6 | 282–348 | "One of them is typing out every single word that I say." | Blue → `✳ Transcript`. A monospace box tagged `transcript` **types the words in sync with speech**. Tiny blue timestamp chips (`10.4`, `10.6`, `10.8`…) sit above each word. Grey placeholder bars show words not yet spoken. |
| 12.3–15.5 | 369–465 | "Another one cuts out my bad takes, like when I mispronounce certain…" | Red → `✳ Cuts`. The transcript keeps typing. On "mispronounce" a **red spell-check squiggle** appears under the word, the Transcript cursor says `huh?`, and the Cuts cursor says `on it`. |
| 15.5–18.3 | 465–550 | (sigh, dead air) | A red `bad take 2.4s → 2.9s` counter ticks up. The line turns **red-highlighted**, `(sigh)` appears, the text gets **struck through**, and a red badge `◀◀ -0.4s → -1.5s → -2.7s` counts the rewind. The line wipes away. *(The bad take is deliberately LEFT IN the audio. The joke is the demo.)* |
| 18.4–20.2 | 552–606 | "Like when I mispronounce certain words." | Clean retake types fresh in the box. |
| 20.8–21.8 | 624–654 | "One's making the captions." | Purple → `✳ Captions`. The box tag changes to `captions` with an `Aa` font chip. **The monospace transcript morphs into a styled caption** (bold white sans, unspoken words at ~40% opacity). From here on, captions stay in this style. |
| 22.3–24.0 | 669–720 | "One is zooming in and out." | Green → `✳ Camera`. It draws a `9:16 crop` box from a tiny `95 × 169` up to `540 × 960`, a `Zoom 2×` chip appears, and **the frame punches in 2× on the word "in"** (~23.2 s). A `Zoom out` chip follows, and the frame eases back out on "out" (~24.0 s). |
| 24.4–25.4 | 732–762 | "I don't touch any of it." | A dark glass **leaderboard panel** blurs in, with rows that **count up**: `Sound 4 edits · Transcript 39 · Cuts 8 · Captions 7 · Camera 7`, then a highlighted white row `Luke 0 edits`. |
| 26.0–27.6 | 780–828 | "All I do is tell them what to change." | A chat bubble with his avatar **types** "zoom out, show all my other reels" → blue send arrow → green ✓. The Camera cursor says `on it`. |
| 28.0–28.5 | 840–855 | "Every single reel…" | **Transition #2 (the money shot):** the whole frame **shrinks into one tile** of a 3×3 grid. Behind it, the same footage is blown up and blurred as a background. Dashed coloured slots appear for the other tiles. |
| 28.5–31.3 | 855–940 | "…on this account is made just like this" | The tiles **fill one by one** with his other reels (filename tags like `karpathy.mp4`, `this one`, `piano.mp4`, `explore.mp4`), and cursors work inside every tile. The grid drifts slowly. |
| 31.3–31.6 | 940–950 | (continues) | **Transition #3:** push back into the centre tile → full frame again. |
| 31.4–33.2 | 942–996 | "and it takes one prompt to set it up." | An orange `✳ 1 prompt` tag + a dark Claude-style prompt box **types**: *"I want you, my coding agent, set up as my personal video editor, the way @… has it on Instagram."* The send button is clicked, and the box shrinks and blurs out. |
| 33.8–35.4 | 1014–1062 | "Comment editor, and I'll send it to you." | Purple draws a `comments` box → an **Instagram comment sheet** blurs in. The Transcript cursor types `EDITOR`, the Cuts cursor clicks **Post**, and the comment appears as "you · now · EDITOR". |
| 35.0–36.0 | 1050–1080 | — | An **Instagram DM notification drops in at the top**: "*creator* — Here's the prompt 👇". |
| 36.1–37.1 | 1083–1113 | "Right, I'm out." | The comment sheet blur-dissolves. He swings his legs off the sofa. |
| 37.3–39.5 | 1119–1185 | "They'll finish it." | He **walks out the bottom of frame**. All pills switch `✳` → `✓` (job done). |
| 39.0–40.0 | 1170–1200 | `[mouse clicks]` | Cuts draws a `reset cushion` box and Camera draws a `reset mic` box. The messed-up cushion and mic **snap back** to their exact positions from frame 0. |
| 40.0–41.4 | 1200–1239 | `[mouse clicks]` | Purple redraws the `hook` box, the hook card **re-types** "5 Claudes are editing this video. ● Live", and the pills collapse back to dots. **The last frame equals the first frame, so the reel loops seamlessly.** People rewatch without noticing, and watch time climbs. |

### 1.2 The design system (copy this, not the content)

- **Hook card:** black rounded rectangle (radius ~24 px at 1080 w), headline in heavy geometric sans with a soft white outer glow, subline in regular weight, then a red `●` dot and **Live**. It sits at the top third. It is the *only* big text on screen until the captions.
- **Cursors:** standard macOS arrow, filled with the cursor colour and a white outline, plus a pill label (`✳ Name`) offset bottom-right. 5 colours: yellow, blue, red-orange, green, purple. They move in **eased arcs**, never straight lines, with small idle wobble. Fast moves get a 3–4 frame **directional blur streak**.
- **Figma chrome:** dashed boxes in the cursor's colour, small square corner handles, a tiny tag top-left (`voice`, `words`, `hook`), and a black size readout pill under the box (`800 × 118`). These make it read as "software is working".
- **Type:** headline/captions in a geometric grotesk. Transcript, labels and size readouts in **monospace**. Captions are small (not giant MrBeast captions): bold white, current word bright, upcoming words ~40% opacity, lower third.
- **Motion rules (the "smoothness"):**
  1. **Nothing hard-cuts.** Every element enters with **blur-in** (blur 20→0 px, opacity 0→100, scale 96→100%, ~6–8 frames, ease-out) and leaves with **blur-out**.
  2. **Text always types.** Character by character, synced to speech.
  3. **State changes morph in place:** waveform grey→yellow, monospace→caption font, `✳`→`✓`, `Claude`→`Sound`.
  4. **The camera only moves when the VO says so:** zoom in on "in", out on "out", zoom-out-to-grid on "every single reel".
  5. **Overlays hide the seams.** The rewind badge, the grid zoom-out and the blur-dissolves sit exactly where a cut would be visible.
- **Sound / ASMR layer (this is half the feel):** clean, close voice (lav), *no music* or almost none. Under it sits a constant bed of **UI foley**: soft mouse clicks on every cursor click, quiet mechanical-keyboard ticks under all typing, a soft "air" swish on every blur transition, a tick-tick counter on the leaderboard, a tape-rewind scrub on the bad-take rewind, and an Instagram notification ding. The **last 3.3 s are ONLY mouse clicks** in near-silence, which works as the ASMR outro and the loop point.

---

## PART 2 — Your version: concept for Vibe Editor

**Why this format fits your product:** Vibe Editor *literally is* Claude (or ChatGPT) editing your video on your laptop. The reference shows the fantasy. Your product is the real thing. Every cursor job maps one-to-one to a real feature on your page:

| Cursor (colour from your site's card palette) | Job label | Real Vibe Editor feature it demos |
|---|---|---|
| 🟡 Butter yellow `#FBE38E` | `✳ Sound` | Clean, levelled voice, background noise removed |
| 🔵 Sky blue `#BFE3FF` (dark text) | `✳ Transcript` | Word-by-word transcript |
| 🟠 Peach `#FFC9A8` | `✳ Cuts` | Cuts silences, "umm/uh", retakes, and **shows the plan before it cuts** |
| 🟣 Lilac `#E9C6F7` (text `#7E22CE`) | `✳ Captions` | Word-by-word **Hinglish captions in Roman ↔ Devanagari** |
| 🟢 Lime `#D9F99D` (text `#2F5D0A`) | `✳ Camera` | Zooms and punch-ins, Reels/Shorts/YouTube formats |
| ⚪ (6th, optional) white/graphite | `✳ B-roll` | B-roll matched to your words |

> Use your brand's pastel cards (lime, cream, lilac, peach, sky) as cursor colours and your lilac "talking" speech-bubble shape for the chat bubble. The reel then looks like your landing page come to life.

**Hook card text (pick one):**
- A (recommended): **"5 editors are editing this reel."** / sub: *running on my laptop.* **● LIVE**
- B: **"Claude is editing this reel."** / sub: *right now, on my laptop.* **● LIVE**
- C (Hinglish audience): **"5 editors iss reel ko edit kar rahe hain."** **● LIVE**

**CTA word:** `VIBE` (your existing reels already use *Comment "VIBE"*, so stay consistent).

**Your own twists (so it isn't a copy):**
1. **Hinglish caption flip.** On the captions beat, the caption is typed in Roman Hinglish, the Captions cursor clicks a toggle `Roman | देवनागरी`, and the same words morph into Devanagari. Nobody else can show this, and it's your #1 differentiator.
2. **"Plan before it edits."** On the bad-take beat, the Cuts cursor first pops a tiny plan card (`Plan: cut 2.7s retake ✓ Approve`), Approve gets clicked, then the cut happens. That demos your safety feature.
3. **The grid zoom-out shows "one video → a week of content".** Instead of "all my other reels", zoom out to reveal **this reel + a 6-slide carousel + a static post + a cover + a post caption**, all generated from this one take (straight from your landing page).
4. **Privacy beat.** A small lock chip `🔒 footage stays on this laptop` blurs in during the leaderboard.
5. **Price beat:** leaderboard bottom row: `Editor cost: ₹1,500/reel` struck through → `Vibe Editor: ₹1,499 once`.

---

## PART 3 — The script (≈42 s, built as 3 × 14 s Omni Flash clips)

### How the 15-second limit is handled
- **3 generations of ~14 s each** (leave ~1 s of handle per clip).
- Each clip's **last frame is the first frame of the next** (in Flow use *Frames to Video* / *Extend* with the last frame as the start image). Camera, set, wardrobe and light stay identical.
- **Seams are hidden by overlays,** exactly like the reference:
  - Seam 1 (14 s) sits inside the **bad-take rewind** (`◀◀ -2.7s` badge + tape scrub). A jump there reads as an intentional cut.
  - Seam 2 (28 s) sits inside the **zoom-out-to-grid** transition. The frame is tiny and blurred at that moment.
- **Loop:** clip 1 starts with an empty sofa and clip 3 ends with an empty sofa. In post, the `reset cushion` / `reset mic` boxes cover a 6-frame crossfade from clip 3's last frame to clip 1's first frame.

### Before you generate: lock the "ingredients"
Generate (or shoot) **one reference still** first and reuse it as the start/reference image for all 3 clips:
> Top-down high-angle photo from a ceiling corner, 9:16, of a bright, lived-in Indian apartment living room in soft daylight: a cream linen 3-seater sofa with olive and terracotta cushions, a brass floor lamp, a monstera plant in a ceramic pot, a low dark-wood coffee table, a jute rug on warm wooden flooring, white walls with a small framed print. A small black clip-on lavalier microphone with a thin cable lies on the middle cushion. No people, no text, no logos. Realistic phone-camera look, slight wide-angle distortion.

Then a version **with the creator** for clips 2–3 (use yourself, or define a consistent character):
> [CREATOR]: Indian man/woman, mid-20s, short neat hair, clean look, wearing an oversized plain black hoodie (no logo, no print), light blue relaxed jeans, white socks, matte black over-ear headphones on, black clip-on lav mic on the hoodie drawstring.

> ⚠️ Put this in every prompt: **no on-screen text, no captions, no UI, no logos, no subtitles, no music, no camera movement.** AI-generated text always looks broken. ALL graphics are added in post.

---

### 🎬 CLIP 1 — 0:00 → 0:14 — "The hook + Sound + Transcript + bad take"

**Omni Flash 1.2 prompt:**
> Static locked-off camera, top-down high-angle view from a ceiling corner (about 60° downward), vertical 9:16, realistic smartphone footage, slight wide-angle lens, soft natural daylight. [SET from reference still]. The sofa is empty for the first quarter second. Then [CREATOR] dives into frame from the bottom edge and lands on his back on the sofa with a soft bounce, the cushions squashing. He settles into a relaxed lounging pose, head on the armrest pillow, one knee up, looking up into the camera, and immediately starts talking casually and confidently, with natural hand gestures, like he's telling a friend something cool. He says, in a relaxed Indian-English accent:
> "You're watching five editors cut this reel… live. And I'm just lying here. One's cleaning up my audio. One's typing every word I say. Another one cuts my bad takes, like when I mispro… mispronunce—" He stumbles on the word, laughs, sighs, and shakes his head.
> Close lavalier-mic audio, quiet room tone, no music. No text, no captions, no UI, no logos, no camera movement.

**VO timing target:**
| t | Line |
|---|---|
| 0.3–2.9 | "You're watching five editors cut this reel… live." |
| 3.2–4.4 | "And I'm just lying here." |
| 5.0–6.6 | "One's cleaning up my audio." |
| 7.2–9.0 | "One's typing every word I say." |
| 9.6–12.6 | "Another one cuts my bad takes, like when I mispro… mispronunce—" |
| 12.6–14.0 | *(laughs / sigh)* |

**Overlays & SFX (post):**
| t | Overlay | SFX |
|---|---|---|
| 0.0 | Hook card already on screen inside a lilac dashed `hook` box + `880 × 220` readout. 5 cursors as coloured dots. | room tone |
| 0.2–0.7 | (He dives in.) Add an extra 2-frame shake on the landing. | soft cushion *thump* + cloth swish |
| 1.3–2.0 | Dots pop into pills `✳ Vibe` one by one (yellow, blue, peach, lilac, lime), scale 80→108→100%. | 5 tiny ascending *pops* |
| 2.0–4.6 | Cursors build Figma chrome: centre line, `safe area`, `voice` box, `words` box, size readouts, name tag `[Name] ● recording`. | soft clicks on each box corner |
| 4.6–5.0 | **Blur-dissolve:** hook + guides melt out, Voice widget (dark glass, grey waveform, `room` label) melts in top-left. | air *whoosh* (low, short) |
| 5.0–6.8 | Yellow pill renames `✳ Vibe` → `✳ Sound`. Drags waveform handle: grey → yellow fill, a `noise removed` chip, then `mic ✓`. | drag *click-hold*, faint rising sweep, a ✓ *tick* |
| 7.2–9.2 | Blue → `✳ Transcript`. Monospace box `transcript` types words live with timestamp chips. | soft keyboard ticks synced to letters |
| 9.6–11.5 | Peach → `✳ Cuts`. Transcript keeps typing "Another one cuts my bad takes, like when I misprounce…" | keyboard ticks |
| 11.5–12.6 | Red squiggle under "misprounce". Transcript cursor: `huh?`. **Plan card** pops from Cuts: `Plan: cut 2.7s retake — Approve?` | error *bonk* (very soft), pop |
| 12.6–13.4 | Cursor clicks **Approve ✓**. Line goes red-highlighted, `(sigh)` appears, `bad take 2.7s` counter ticks up. | click, counter ticks |
| 13.4–14.0 | Strike-through sweeps across the line. Red badge `◀◀ -0.8s → -2.7s` counts. **← SEAM 1 goes here** | tape-rewind scrub (0.6 s) |

---

### 🎬 CLIP 2 — 0:14 → 0:28 — "Retake + Hinglish captions + zoom + I don't touch it"

**Start frame:** last frame of Clip 1 (him lying on the sofa, same pose).

**Omni Flash 1.2 prompt:**
> Continue the exact same shot: static locked-off top-down camera, same room, same lighting, same [CREATOR] lying on the sofa in the same pose and outfit. He composes himself, smiles, and says the line cleanly and confidently, with relaxed hand gestures and occasional small shrugs, looking up into the camera:
> "Like when I mispronounce words. One's doing my captions — in Hinglish. One's zooming in… and out." On "in" he leans slightly toward the camera, on "out" he leans back. "I don't touch the timeline. I just tell them what to change." He makes a small "that's it" hand gesture and relaxes.
> Close lavalier-mic audio, quiet room tone, no music. No text, no captions, no UI, no logos, no camera movement.

**VO timing target:**
| t | Line |
|---|---|
| 14.5–16.4 | "Like when I mispronounce words." |
| 17.0–19.3 | "One's doing my captions… in Hinglish." |
| 19.8–21.8 | "One's zooming in… and out." |
| 22.4–23.9 | "I don't touch the timeline." |
| 24.6–26.8 | "I just tell them what to change." |
| 26.8–28.0 | *(beat; small gesture)* |

**Overlays & SFX:**
| t | Overlay | SFX |
|---|---|---|
| 14.0–14.4 | Struck line wipes left and the box is empty. | swish |
| 14.5–16.4 | Clean retake types: "Like when I mispronounce words." Small green `retake kept ✓` chip. | keyboard ticks, ✓ tick |
| 17.0–17.8 | Lilac → `✳ Captions`. Tag becomes `captions` + `Aa` chip. **Monospace morphs into your caption style** (pick from Vibe Editor's 47 caption styles: bold white, current word highlighted). | soft *shimmer* |
| 17.8–19.3 | Caption shows Roman Hinglish: **"captions bhi, Hinglish mein"**. Cursor clicks toggle `Roman \| देवनागरी` → morphs to **"कैप्शन्स भी, हिंग्लिश में"**. | click, letter *flutter* |
| 19.8–20.4 | Lime → `✳ Camera`. Draws `9:16 crop` box growing `100 × 178 → 540 × 960`, `Zoom 2×` chip. | drag click |
| 20.5 (on "in") | **Punch-in 2×** (ease-in-out, 8 frames) centred on face. | low *whomp* / camera shutter-ish whoosh |
| 21.4 (on "out") | `Zoom out` chip → ease back to 1×. | reverse whoosh |
| 22.4–24.0 | **Leaderboard** dark glass panel blurs in. Rows count up: `Sound 6 · Transcript 41 · Cuts 9 · Captions 12 · Camera 4 · B-roll 3`, then highlighted row `[Your name] 0 edits`. Lock chip `🔒 footage stays on this laptop`. | rapid counter *tick-tick-tick* |
| 24.0–24.5 | Leaderboard blur-out. | air whoosh |
| 24.6–26.8 | **Chat bubble** (your lilac speech-bubble shape) with avatar types: *"zoom out, show what else you made from this video"*. Send arrow → green ✓. Lime cursor: `on it`. | keyboard ticks, *send* whoop, ✓ |
| 27.6–28.0 | Frame starts shrinking. **← SEAM 2 goes here** | whoosh starts |

---

### 🎬 CLIP 3 — 0:28 → 0:42 — "One video → a week of content + CTA + exit + loop"

**Start frame:** last frame of Clip 2.

**Omni Flash 1.2 prompt:**
> Continue the exact same shot: static locked-off top-down camera, same room, same lighting, same [CREATOR] lounging on the sofa. He talks to camera with easy confidence: "Every reel on this page is made like this, on my own laptop. It's one plugin, inside Claude. Comment 'VIBE' and I'll send it to you." He points down toward the bottom of the frame on "comment". Then he says: "Right, I'm out. They'll finish it." He swings his legs off the sofa, gets up, and walks out of frame through the bottom edge, leaving the sofa empty with the cushions slightly messed up and the lav mic lying on the middle cushion. The empty room holds still for the last two seconds.
> Close lavalier-mic audio, quiet room tone, no music. No text, no captions, no UI, no logos, no camera movement.

**VO timing target:**
| t | Line |
|---|---|
| 28.2–31.2 | "Every reel on this page is made like this, on my own laptop." |
| 31.8–33.4 | "It's one plugin, inside Claude." |
| 34.0–36.2 | "Comment VIBE and I'll send it to you." |
| 36.8–37.6 | "Right, I'm out." |
| 37.9–38.8 | "They'll finish it." |
| 38.8–42.0 | *(he walks out → empty sofa; clicks only)* |

**Overlays & SFX:**
| t | Overlay | SFX |
|---|---|---|
| 28.0–28.6 | **Zoom-out-to-grid:** the full frame shrinks into the centre tile of a 3×3 grid. Background = the same frame scaled 140%, blurred 40 px, darkened 30%. Dashed coloured empty slots appear. | long soft whoosh + subtle *riser* |
| 28.6–31.2 | Slots fill one by one with what Vibe Editor made **from this one take**: `reel.mp4` (this one), `carousel 1/6`, `carousel 2/6`, `static-post.png`, `cover.jpg`, `caption.txt` ("Editing ke liye ab timeline ki zaroorat nahi 🎬…"), plus 2 of your real *Made with Vibe Editor* reels. Cursors work inside each tile. Grid drifts 3% slowly. Caption: **"ek video → poore hafte ka content"** (or English). | a soft *pop* per tile, light clicks |
| 31.2–31.6 | Push back into the centre tile → full frame. | reverse whoosh |
| 31.8–33.4 | `✳ 1 plugin` lime tag + a dark **Claude-style prompt box** types: *"Edit this like my usual reels: cut pauses, Hinglish captions, punch in on the key line."* A **plan card** answers: `Plan ✓ · Preview ✓ · Export`. Small chip: `₹1,499 · one-time`. | keyboard ticks, send whoop |
| 33.4–33.8 | Prompt box blur-out. | swish |
| 34.0–36.2 | Lilac draws a `comments` box → **Instagram comment sheet** blurs in. Transcript cursor types `VIBE`, Cuts clicks **Post**, comment appears "you · now · VIBE". | typing ticks, click, soft *pop* |
| 35.6–36.6 | **IG DM notification** drops from top: "*[your handle]* — Here's Vibe Editor 👇". | iPhone-style notification *ding* (quiet) |
| 36.8–37.4 | Comment sheet blur-out. | swish |
| 37.6–39.6 | He leaves the frame. All pills flip `✳` → `✓`. | 5 soft ✓ ticks, footsteps |
| 39.6–40.6 | Peach draws `reset cushion` box, lime draws `reset mic` box. **Under the boxes, crossfade 6 frames to Clip 1 frame 0** (cushions/mic snap back). | 2 clicks, tiny *snap* |
| 40.6–42.0 | Lilac redraws the `hook` box and the hook card **re-types** "5 editors are editing this reel. ● LIVE". Pills collapse to dots. **Last frame = first frame → loop.** | only mouse clicks + room tone (ASMR outro) |

---

## PART 4 — Post-production spec

### Build it with Vibe Editor itself (the meta flex)
Make the overlays inside Vibe Editor, then show that in your caption/comments: *"this reel was edited by the thing it's about."* Briefs you can paste into Claude:

1. `/vibe-editor:style` → *"Design a custom effect called 'Live Editors': 5 multiplayer cursors (macOS arrow, white outline) with pill labels `✳ Name` in my brand pastels (lime #D9F99D, butter #FBE38E, lilac #E9C6F7, peach #FFC9A8, sky #BFE3FF). Cursors move in eased arcs with motion-blur on fast moves. Support: rename pill, click with ripple, draw dashed Figma box with corner handles + tag + size readout, ✳→✓ swap. Every element enters/exits with blur-in/blur-out (blur 20→0px, 7 frames, ease-out). Save as my style."*
2. `/vibe-editor:edit` → *"Stitch clip1, clip2, clip3 with no visible cuts, hiding seam 1 under the bad-take rewind badge and seam 2 under the zoom-out-to-grid. DO NOT cut the bad take; keep it. Captions: word-by-word, small bold white, upcoming words 40% opacity, lower third; Roman→Devanagari flip at 17.8s. Punch-in 2× on 'in' (20.5s), out on 'out' (21.4s). Then apply the Live Editors overlays per the timeline in SCRIPT.md. Sound: level voice, add UI foley per timeline, no music. Make the last frame match the first frame for a loop."*
3. `/vibe-editor:cover` → cover + caption + hashtags.

### Type
- Headline / captions: a geometric grotesk (e.g. *Plus Jakarta Sans ExtraBold*, *General Sans Bold*, or whatever matches your site's heading font).
- Transcript / tags / readouts: *JetBrains Mono* or *IBM Plex Mono*.
- Devanagari: *Mukta* or *Hind* (bold).

### Audio mix (ASMR recipe)
- Voice: −14 LUFS integrated, light de-noise, gentle compression, low-cut at 80 Hz. Keep it *close and dry*. The intimacy is the ASMR.
- UI foley sits **−18 to −24 dB under the voice** (felt more than heard), slightly panned toward where each cursor is on screen (yellow left, peach right…).
- Typing ticks: one tick per 2–3 characters (not every letter, which sounds frantic).
- Whooshes: short (150–250 ms), soft, airy. No cinematic booms.
- Music: none. If you must, a lo-fi bed at −32 dB, and **cut it** at 38.8 s so the outro is clicks only.

### Common AI-clip pitfalls (and fixes)
| Problem | Fix |
|---|---|
| Camera drifts / pushes in | Add "tripod-locked, zero camera movement" twice. Stabilise in post if needed. |
| Face or outfit changes between clips | Always start from the previous clip's last frame. Keep the wardrobe description identical word for word. |
| Voice changes between clips | Run all 3 clips' audio through one consistent voice (speech-to-speech), or record the VO yourself and lip-sync. |
| Model adds random text/logos | Plain black hoodie. "No text, no logos" in every prompt. Crop or paint out leftovers. |
| Lines too long for 14 s | Keep each clip ≤ 34 spoken words. Trim lines rather than speed up. |
| Bad-take stumble doesn't happen | Write it phonetically ("mispro… mispronunce") and add "he stumbles on the word and laughs". Generate 3–4 variants and pick the best. |

---

## PART 5 — Hinglish VO version (same timings)

**Clip 1:** "Tum abhi paanch editors ko ye reel edit karte dekh rahe ho… live. Aur main bas yahan leta hua hoon. Ek mera audio clean kar raha hai. Ek har word type kar raha hai jo main bolta hoon. Aur ek mere bad takes kaat-ta hai, jaise jab main koi word galat bol… galat bolta—" *(laughs)*
**Clip 2:** "Jaise jab main koi word galat bolta hoon. Ek captions bana raha hai, Hinglish mein. Ek zoom in kar raha hai… aur out. Main timeline ko haath bhi nahi lagata. Bas bolta hoon kya change karna hai."
**Clip 3:** "Is page ki har reel aise hi banti hai, mere apne laptop pe. Ek plugin hai, Claude ke andar. Comment karo 'VIBE', main bhej dunga. Chalo, main chala. Ye finish kar denge."

---

### Post caption (starter)
> Paanch editors. Zero timeline. 🎬
> Ye poori reel Vibe Editor ne edit ki, mere laptop pe, Claude ke andar.
> Comment **"VIBE"** and I'll DM you the link 👇
> #vibeediting #aivideoediting #claudeai #contentcreator #reelsindia #hinglish
