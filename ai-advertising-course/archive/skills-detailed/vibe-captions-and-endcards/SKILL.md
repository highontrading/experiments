---
name: vibe-captions-and-endcards
description: Adds captions (auto or from a script, word-by-word highlight, English, Hindi or Hinglish), text overlays (hooks, offers, prices) and logo + CTA end cards to ad videos with ffmpeg, all in the brand-kit look. Use it after the edit is cut, or when the user asks for subtitles, captions, on-screen text, an end card, a CTA or a brand kit for videos.
---
# Vibe Captions & End Cards

> Works in Claude (upload as a Skill or paste), ChatGPT (Custom GPT instructions or paste),
> Gemini (Gem instructions or paste), Claude Code / any coding agent (put in `.claude/skills/`).
> Uses **ffmpeg** (with libass, which normal builds include) and `scripts/captions.py` in this folder.
> Exact commands: `caption-and-endcard-recipes.md` in this folder. For cutting the edit itself,
> use the `vibe-editor` skill. Same working modes: **A** (terminal: you run it), **B** (in-chat
> code: short clips), **C** (no code: CapCut steps + commands). Say which mode you're in first.

This is **Step 4 · Layer** of the Vibe Editing system: captions → motion titles → one look.
Add one layer at a time and check each.

## When to use
- "Add captions to this Reel" / "Hindi subtitles"
- "Put 'FLAT 40% OFF' on screen from 2 to 5 seconds"
- "Make an end card with my logo and 'Shop now'"
- "Set up my brand kit so every video looks the same"

## What I need from you
1. **The video** (cut and final length).
2. **The words**, one of: (a) let me transcribe it (Mode A/B with Whisper or speech-to-text), (b) a
   transcript file with word timings (Whisper / ElevenLabs JSON), or (c) **your script pasted
   in**. I'll space it over the voice-over and you check the timing.
3. **Language**: English, Hindi (Devanagari) or Hinglish (Hindi in Latin letters, e.g. "Glow aayega, guaranteed").
4. **Brand kit** (or I'll fill in the block below with you): font, colours, logo file, CTA, website.
5. **Ratio** (9:16 default).

## Brand kit block (fill once, reuse in every video)
```
BRAND KIT
Brand: Kesar & Co.
Fonts: Headline = Archivo Black (or Arial Black) · Captions = Inter Bold · Hindi = Noto Sans Devanagari Bold
Colours: primary #E8862A (saffron) · dark #8E1B1B (deep red) · light #F6EBD9 (cream) · accent #C9A24B (gold)
Caption style: white, black outline, current word in saffron, 3 words at a time, lower third
Logo: kesar_logo.png (transparent PNG, at least 1000 px wide)
CTA: "Shop now · kesarandco.in"   Offer style: cream text on deep-red box
End card: cream background, logo centre, tagline in deep red, CTA button in saffron, 2.5–3 s
Look: warm golden (see vibe-editor recipe 9)
```

## How I work

### 1 · Get the words with timings
- **Mode A/B, transcribe**: extract audio (`ffmpeg -y -i in.mp4 -vn -ac 1 -ar 16000 audio.wav`),
  then use one of these:
  - `pip install faster-whisper`, then word timestamps (`model.transcribe("audio.wav", word_timestamps=True)`) → save as JSON.
  - `pip install openai-whisper` → `whisper audio.wav --model small --word_timestamps True --output_format json`.
  - Any speech-to-text API the user has (ElevenLabs Speech-to-Text returns word timings as JSON).
  - For Hindi, set the language to `hi`. Hinglish usually transcribes better as `en` or `hi` mixed. Always proofread brand names.
- **No transcription available**: take the pasted script and use `--script` mode. The timings are
  estimated between the VO start and end. Tell the user: "Timings are estimated. Check the first and last words."
- **Always fix the spelling** of the brand, product and offer before burning in.

### 2 · Make the caption files
```bash
python3 scripts/captions.py --words words.json --ratio 9:16 --per-line 3 --font "Arial Black" --highlight "#E8862A" --upper --out captions
python3 scripts/captions.py --script script.txt --start 0.3 --end 14.5 --ratio 9:16 --out captions
```
This gives `captions.srt` (to upload to Meta / YouTube, or import into CapCut) and `captions.ass`
(styled, word-by-word highlight, placed inside the safe zone).
Options: `--per-line 1` (one big word, very punchy) up to `4` (calmer). `--highlight ""` turns
the highlight off. `--pos 0.30` puts captions 30% up from the bottom. Leave out `--upper` for Hindi.

### 3 · Burn in
```bash
ffmpeg -y -i edit.mp4 -vf "ass=captions.ass:fontsdir=fonts" -c:a copy edit_captions.mp4
```
Put the font files in a `fonts/` folder (download free from Google Fonts: Inter, Archivo Black,
Noto Sans Devanagari). If a font is missing, libass falls back to another font. Grab a frame and
check that it looks right.

### 4 · Text overlays (hooks, offers, prices)
Use `drawtext` with `textfile=` (no escaping trouble with %, :, ₹) and `enable='between(t,a,b)'`.
Hook text in the first 2 s; offer on screen for at least 2 s; never more than about 7 words at once.

### 5 · End card
Build a 2.5–3 s end card from the brand kit: background colour → logo fades in → tagline →
CTA button. Then join it to the edit (commands in the recipes file). Or freeze the last product
frame and put the CTA over it, which often converts better than a plain card. Test both.

### 6 · Check, then hand over
Grab frames at the hook, mid-caption and end card. Look at them. Then run the director pass:
"Give me up to 3 notes."

## Output format
1. Mode line + language + what source the words came from.
2. **Caption preview table**: # · time · text (so the user can proofread before burning in).
3. Commands (own code blocks), run (A/B) or to run (C).
4. Mode C: **CapCut steps**: Text → Auto captions → language → select style → set font/colour/outline from the brand kit → position above the bottom 20% → Text → Add text for the offer (set start/end) → import the end card or build it with Text + Image.
5. Outputs: file names, plus frame grabs (A/B).

## Caption style rules
- **Size**: about 7–8% of video width (≈ 75–85 px on 1080 wide). Bold, with an outline or shadow. Readable on a phone with the sound off.
- **Position (9:16)**: keep out of the top 14% and bottom 20% (Instagram/Facebook UI). Lower third or centre.
- **Chunks**: 2–4 words at a time, broken at natural phrase ends. One line, two at most.
- **Highlight** the current word in the brand accent colour. That's enough motion; skip bouncing emoji captions on premium brands.
- **Hindi**: Devanagari needs a font that supports it (Noto Sans Devanagari, Mukta, Hind). Never use ALL CAPS styling on Hindi. Check that the matras (vowel signs) render correctly in a frame grab.
- **Hinglish**: write it the way the creator speaks ("Yeh serum ne meri skin ko glow diya"), not formal Hindi.
- Upload the `.srt` too (for accessibility and for placements that show their own captions).

## Rules
- Never burn in text you haven't shown the user to proofread when it includes prices, offers, claims or the brand name.
- No claims in captions that the brand can't prove ("clinically proven", "100% results"). Flag them and suggest the `ad-policy-check` skill.
- Keep the original. Write `_captions`, `_endcard` versions.
- Use only fonts the user has the right to use (Google Fonts are free for commercial use).
