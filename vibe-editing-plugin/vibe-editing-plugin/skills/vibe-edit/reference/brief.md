# brief.json: the user's answers

`<project>/brief.json` records what the user chose in steps 1–6. `ve plan` reads it, and so do
the option sheets (platform, style). Update it after every answer. Missing keys fall back to
defaults; `null` means "none".

```jsonc
{
  "platform": "meta-ad",          // meta-ad | reels | shorts | tiktok | meta-feed | portrait | square | youtube | lesson
  "edit_type": "ugc-ad",          // free text: clean talking-head, hype, ugc-ad, cinematic, explainer, podcast-clip…
  "target_length": 30,            // seconds, or null = keep all the content
  "cta": "Join now · 50% off",    // call to action (ads); used by the CTA motion type
  "pace": "tight",                // tight | natural | relaxed (lessons: natural)
  "style": "bold-yellow",         // a style in styles/, or null for the default
  "captions": { "preset": "B",    // A–H from the caption sheet, or "R" = the reference style's captions
                "overrides": { "active_color": "#FFD60A", "size": 92, "position_y": 0.6, "words_per_line": 2 } },
                                  // "captions": null -> no captions
  "hook": true,                   // hook text in the first seconds
  "zoom": true,                   // punch-in zooms on cuts
  "motion": { "types": ["kinetic", "label", "lower_third", "title", "cta"], "density": "balanced" },
                                  // minimal ≈ 1 per 15 s · balanced ≈ 1 per 8–10 s · heavy ≈ 1 per 4–5 s
  "lower_third": { "name": "Avi", "title": "Founder, Ideabro Studio" },
  "look": "warm",                 // natural | bright | warm | cool | punchy | film | reference
  "music": { "file": "music/upbeat-corporate.mp3", "level_db": -22, "source": "library" },
                                  // null -> no music; source: own | library | elevenlabs
  "sfx": { "source": "library", "files": ["sfx/deep-whoosh-1.mp3"], "density": "medium" },
                                  // source: builtin | library | elevenlabs | none
  "notes": "anything else the user asked for"
}
```

Platform notes:
- **meta-ad**: 9:16, captions kept at ≤58% height and the hook at ≥20%. Meta's ad UI covers
  the top ~14% and bottom ~35%. Hook in the first 2 s, captions on (most people watch muted).
- **meta-feed / portrait**: 4:5. **square**: 1:1. Offer these as extra versions of an ad.
- **lesson**: 16:9, small captions at the bottom, no hook, no punch-ins, natural pace.
