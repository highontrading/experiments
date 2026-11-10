# AI in Advertising: course promo

A 10 second, 9:16 (1080x1920) 3D promo for an AI & Advertising course, made with the
`3d-animator` skill (`.claude/skills/3d-animator`).

**Logline:** a glowing glass AI orb drops onto a walnut desk and rolls into a phone showing a dull
grey "BIG SALE" ad. The ad turns into a personalised one, its click-through rate climbs from 0.4%
to 4.1%, three result bars shoot up, and the CTA lands: *Same budget. Smarter ads. Join the AI &
Advertising Course.*

| File | What it is |
|---|---|
| `ai_advertising_course.html` | the animation: open in Chrome, press **Sound on**, or **Save video** |
| `ai_advertising_course.mp4` | frame-exact render with sound (30 fps, H.264 + AAC) |

## Change the words

Edit the `COPY` block near the top of the HTML (`kicker`, `head`, `cta`, `sub`), then re-render:

```bash
node .claude/skills/3d-animator/scripts/render.mjs ai-advertising-promo/ai_advertising_course.html
```

The HTML loads three.js from cdn.jsdelivr.net, so it needs to be online. Fonts (Inter, OFL) are
embedded in the file.
