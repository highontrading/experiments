# edit.json reference

`edit.json` is the whole edit. The storyboard and the renderer both read it; you write it. All times
are **seconds in the raw (source) video**. The renderer maps them to output time after the cuts,
so turning a cut on or off never breaks captions, text or SFX timing.

Every save (`ve plan`, `ve restyle`, or `plan.save_edit`) bumps `version` and keeps a copy in `versions/`.
When you edit it by hand, keep it valid JSON and don't rename fields.

```jsonc
{
  "version": 3,                       // set automatically on save
  "approved": false,                  // set true when the user approves the storyboard
  "source": "raw/clip.mp4",           // or build/source.mp4 when several clips were joined
  "style_name": "cloud-notes",
  "brief": { "platform": "reels", "pace": "tight", "addons": ["captions","hook","zoom","sound","look","motion"] },

  "format": { "width": 1080, "height": 1920, "fps": 30,
              "reframe": { "mode": "crop",   // "crop" fills the frame | "fit_blur" fits with a blurred background
                           "x": 0.5,         // horizontal framing 0 = left edge, 1 = right edge
                           "y": 0.42 } },    // vertical framing (matters when zoomed / cropping vertical)

  "segments": [                       // covers the whole source, in order
    { "id": "s1", "start": 0.0, "end": 0.62, "keep": false, "kind": "gap",    "reason": "dead space at start" },
    { "id": "s2", "start": 0.62, "end": 3.98, "keep": true,  "kind": "speech", "reason": "speech",
      "text": "this is how I edit a reel", "zoom": 1.12 },   // zoom 1.0 = no punch-in
    { "id": "s5", "start": 5.48, "end": 7.66, "keep": false, "kind": "speech",
      "reason": "false start: said again at 8.1s" }
  ],

  "captions": { "enabled": true,
    "lines": [ { "id": "c1", "start": 0.72, "end": 1.9,
                 "text": "So this is",          // edit freely: words are re-timed if the count changes
                 "words": [ { "w": "So", "s": 0.72, "e": 1.1, "emph": false } ] } ] },

  "hook": { "enabled": true, "options": ["I EDIT REELS IN 15 MINUTES", "..."], "chosen": 0,
            "duration": 2.6 },        // seconds at the start of the OUTPUT

  "texts": [                          // motion text, source times
    { "type": "kinetic", "text": "15 MINUTES", "start": 2.9, "end": 3.95, "y": 0.42,
      "accent_words": ["MINUTES"], "size": 110, "sfx": "pop" },          // words slam in one by one
    { "type": "title", "text": "STEP 1", "start": 18.8, "end": 20.0 },  // centred title card
    { "type": "lower_third", "text": "AVI · IDEABRO STUDIO", "subtitle": "Founder", "start": 1.5, "end": 4.0 },
    { "type": "label", "text": "STEP 1 · ANALYZE", "start": 8.0, "end": 10.6, "y": 0.30, "x": 0.5 },
    { "type": "cta", "text": "JOIN NOW →", "start": 20.1, "end": 22.6, "y": 0.40 }   // button for ads
  ],                                  // optional on every item: "enabled": false, "case": "upper|as-is", "sfx": null

  "broll": [ { "file": "broll/laptop.mp4", "start": 8.0, "end": 10.5,
               "mode": "full",        // "full" covers the frame | "pip" small window top-right
               "from": 0.0,           // start offset inside the B-roll clip
               "ken_burns": true } ], // slow pan for still images

  "graphics": [ { "file": "build/graphics/intro.mov", "start": 0.0 } ],  // full-frame overlays with alpha

  "sound": { "enabled": true, "voice_cleanup": true,     // hum/rumble cut, light denoise, compression
             "music": { "file": "music/track.mp3", "level_db": -21, "duck": true },
             "sfx": [ { "id": "x1", "sound": "whoosh", "t": 3.98, "offset": -0.12, "gain_db": -15 },
                      { "id": "x2", "sound": "sfx/deep-whoosh-1.mp3", "t": 9.0 } ],   // built-in name or a file
             "hook_sfx": "pop",
             "loudness_lufs": -14 },                    // -14 for Reels/Shorts/YouTube, -16 for lessons is fine

  "look": { "enabled": true,
            "lut_from_reference": true, "lut_strength": 0.6,   // match the reference style's colours
            "lut": null,                                       // or a path to your own .cube file
            "contrast": 1.0, "saturation": 1.0, "brightness": 0.0, "gamma": 1.0,
            "warmth": 0.0,        // -1 cool .. +1 warm
            "vignette": 0.15, "grain": 0.0, "sharpen": 0.3 },

  "brief": { "platform": "meta-ad", "edit_type": "ugc-ad", "target_length": 30, "cta": "...", "motion": {...} },
  "style": { /* full copy of the style: captions, hook, motion, pacing, look, sound, reference_stats */ },
  "export": { "preset": "reels", "name": null }   // name -> out/<name>.mp4
}
```

## Style fields used at render time (`edit.style`)

| Field | Values |
|---|---|
| `captions.font` | one of the bundled fonts (see `vibe-style` skill) |
| `captions.size` | em size in px on a 1080×1920 frame. 80–100 typical for reels |
| `captions.case` | `upper` · `as-is` · `lower` · `title` |
| `captions.words_per_line` | 1–6 (3 is typical for reels) |
| `captions.position_y` | 0–1 of the frame height (keep 0.15–0.78 on 9:16: the app UI covers the bottom) |
| `captions.color / active_color / emphasis_color / outline_color / shadow_color` | `#RRGGBB` |
| `captions.outline / shadow` | px |
| `captions.box / box_color` | solid box behind the line |
| `captions.highlight` | `color` (active word colour) · `box` (marker behind active word) · `scale` · `word` (one word at a time) · `none` |
| `captions.animation` | `pop` · `fade` · `slide` · `none` |
| `hook.*` | font, size, case, color, box_color, position_y, animation |
| `motion.font / color / accent` | kinetic/title/label text |
| `pacing.zoom_scale` | punch-in amount, 1.08–1.25 |

## Helpers
- `ve show <p> segments|captions|transcript|retakes|summary|brief`: compact views, cheaper than reading JSON.
- `ve storyboard <p>`: after every change, to show the user.
- `ve versions <p>` / `ve versions <p> --restore N`.
- To regenerate the draft from scratch: `ve plan <p> --force ...` (the old one stays in versions/).
