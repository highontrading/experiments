# AI & Advertising: trailer plan (draft for review)

This is the reference's structure (see `REFERENCE_BREAKDOWN.md`) rebuilt around our course:
*Shoot-quality ads, without the shoot.* It is English, faster than the reference, and about 50 s at 16:9 1920×1080.
A 9:16 cut can come from the same timeline.

## The idea

The reference argues that history repeats: a force arrives and people split. Ours argues that
**advertising repeats: a new medium arrives and brands split** into the ones still booking
shoots and the ones who direct AI.

## Draft voiceover (~115 words)

| Act | Voiceover | Picture (reference device → ours) |
|---|---|---|
| Hook | "Advertising has always followed the same pattern." | 1-frame match-cut strobe of **circles**: camera lenses, apertures, ring lights, spotlights, film reels, vinyl, TV knobs, radio dials, an eye's iris, then a zoom out to Earth |
| | "A new medium appears." | Black, rising words. Light-leak flash and **drop** |
| History | "Print. Radio. Television. The internet." | Film-scan frames: vintage print ad, radio studio, 60s TV spot, early web banner |
| | "And every time, not every brand makes the jump." | Black, rising words |
| Old world | "Some still book the studio, the crew, the three-week shoot, like it still makes sense." | Collage of shoot gear (film camera, light rig, call sheet, storyboard, casting Polaroids, invoice), which **explodes** outward. The orb is born |
| New world | "Others wake up inside the new one, and move." | Orb wipe to **our cream background**. Tool icons pop in around the word (ChatGPT, Claude, Gemini, Nano Banana, Midjourney, Veo, Kling, Runway, ElevenLabs, Suno), then a whip-pan |
| | "No studio. No crew. No waiting." | Fades, one beat each |
| | "One product photo becomes a whole campaign." | **Our studio work** builds as a collage on cream (site stills: shoes, lip gloss, Ava can, Osmosis, lookbooks) |
| | "AI is that medium." | Empty frame, fade-in |
| The gap | "And the gap between brands that direct it and brands that ignore it is growing every single day." | **Split-door on "gap"** to black. Product orb with 8 satellite ad formats orbiting (packshot, UGC, model shoot, film, Meta static…) that collapse into one |
| Proof | "Shoot-quality ads. Without the shoot." | Fast showcase of **our AI ad videos** in film frames with lower thirds ("Campaign film · made with AI", "AI UGC · no shoot") on the beat |
| Ultimatum | "Two kinds of advertisers are forming. The ones who shoot, and the ones who direct. Which one are you?" | Neon **fork lines**, with the hard musical stop on "you?" |
| End card | — (silence and glitch ticks) | **Ideabro Studio · AI & Advertising**, pill button "Learn AI Advertising", then the URL. Our fonts and the lime/pink accent |

## Look

- Black and our cream (in place of pure white). Lime `#d9f5a0` and pink `#f5b8e8` highlights only on
  key words such as "direct" and "Learn AI Advertising", the way the site highlights headlines.
- Caption face: a tight grotesk (Inter Bold) for the voiceover, as in the reference. The end card
  uses the site's serif display face and mono button style.

## Sources

- **Ours:** 15 AI ad videos and 43 stills from the course page, already downloaded.
- **Stock and generated:** circle-montage stills, history plates, old-world props (stock or generated).
- **Sound (ElevenLabs):** a deep, calm male voiceover; a cinematic 808-and-pads track (~80 BPM, minor key)
  with a silence → drop → break → build → hard-stop arc; and the SFX list from the breakdown §5.
- **No third-party broadcast clips or real people we don't have rights to.**

## Build

The same engine as `vibe-editing-film/`: an HTML/canvas stage driven by one `timeline.py`
holding the voiceover word timings. It is rendered with Playwright, then mixed and encoded with ffmpeg
at −14 LUFS for YouTube or −11 LUFS for Reels.
