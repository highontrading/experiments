# AI & Advertising: explainer reel series (IdeaBro Studio)

Three upload-ready 9:16 explainer reels about how AI is changing advertising, in the style analysed in
`../reference-analysis/explainer-reel-style-breakdown.md`: a fast voiceover, a bold headline per sentence
with one coloured keyword, cinematic 3D "illustration" sets, sourced data cards with rolling numbers,
semantic effects, and an IdeaBro Studio end card: **Join AI & Advertising · Link in bio**.

| File | Type | Length |
|---|---|---|
| `out/01_the_2_day_ad.mp4` | **Deep-dive**: the ad-making chain, before and after AI | 1:25 |
| `out/02_100_milliseconds.mp4` | **POV**: what happens in the 100 ms before you see an ad | 1:23 |
| `out/03_5_ad_jobs_ai_rewrote.mp4` | **Fast listicle**: 5 jobs AI rewrote, 1 it can't | 0:55 |

All are 1080x1920, 30 fps, H.264 + AAC, mixed to about -14 LUFS (Instagram/TikTok/Shorts loudness).

## How they are made

| Part | Tool |
|---|---|
| Voiceover | ElevenLabs TTS (`eleven_multilingual_v2`, voice "Raj – Indian English Ads & Social"), with character timestamps so every headline lands on its sentence |
| Music bed | ElevenLabs Music (instrumental underscore, same bed across the series) |
| Sound effects | ElevenLabs sound generation (whoosh, impact, pop, tick, glitch, chime, rewind, ding, thud, power-down) |
| 3D sets | three.js, built in code (`engine/scenes.js`): venue screen, agency floor, 3D-software grid, wall of ad variants, server corridor, phone feed, night city with billboard and shopfronts, AI orb |
| Overlays | 2D canvas (`engine/overlay.js`): headlines, data cards, chips, floating labels, sources, end card |
| Render | headless Chromium + ffmpeg (`tools/render.mjs`), audio mix in `tools/mix.py` |

Scripts are in `scripts/*.json` (one `vo` + `head` per beat; `[g]gold[/g]`, `[o]orange[/o]`,
`[r]red[/r]`, `[c]cyan[/c]` mark the keyword). Shot lists are in `shots/*.js`.

All brands shown inside the illustrations (KORA, NOVA, LUMI...) and shop names are fictional.

## Sources used on screen

- Kalshi's NBA Finals ad (Google Veo 3, ~2 days, prompting cost under $2,000, 300–400 generations for 15 clips):
  [NPR, 23 Jun 2025](https://www.npr.org/2025/06/23/nx-s1-5432712/ai-video-ad-kalshi-advertising-nba-finals)
- Coca-Cola's 2025 AI holiday ad (5 AI specialists, 70,000+ clips, ~30 days):
  [TheWrap](https://www.thewrap.com/coca-cola-ai-christmas-ad-2025/); backlash in 2024 and 2025:
  [Tom's Guide](https://www.tomsguide.com/ai/ai-image-video/coca-cola-turns-to-ai-for-its-christmas-ad-in-2025-sparking-mixed-reactions)
- Meta's AI-powered ad tools passing a $60B annual revenue run rate (Q3 2025 earnings call):
  [summary](https://rallies.ai/news/metas-advantage-ai-ads-reach-60b-annual-run-rate-capex-to-surge-in-2026)
- Meta's reported goal to fully automate ad creation and targeting by end of 2026 (WSJ, June 2025):
  [Campaign Asia](https://www.campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831)
- Cadbury #NotJustACadburyAd / Shah Rukh Khan-My-Ad (AI-recreated face and voice, 2,000+ local stores):
  [WPP case study](https://www.wpp.com/en/case-studies/ogilvy-and-wavemaker-notjustacadburyad)
- Buyers expect ~40% of video ads to be built with gen AI by 2026:
  [IAB, Jul 2025](https://www.iab.com/news/nearly-90-of-advertisers-will-use-gen-ai-to-build-video-ads/)
- Real-time ad auctions run in roughly 100 ms (industry rule of thumb, e.g.
  [AWS architecture blog](https://aws.amazon.com/blogs/architecture/serving-billions-of-ads-with-amazon-elasticache-for-redis))

## Re-render

```bash
node tools/render.mjs v1_chain info build/v1_chain_info.json
node tools/render.mjs v1_chain video 0 9999 out/v1_video.mp4
python tools/mix.py v1_chain build <sfx_dir> <music.mp3> build/v1_mix.wav
```
