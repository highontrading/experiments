# 🎬 Vibe Editor

Your AI reel editor inside Claude. Drop a raw video, say what you want, get a finished reel.

## Install (2 minutes)

1. Open the **Claude desktop app** → **Customize → Plugins → Add → Upload plugin** → choose `vibe-editor.zip`.
2. Start a new task, share a folder for your videos, and type **`/vibe-editor:setup`**.
   Claude installs the editor (one time, a few minutes), creates your **Vibe Editor** folder and asks about your style.

## Make a reel

1. Put your raw video in **Vibe Editor → inbox**.
2. Tell Claude in your own words:
   > `/vibe-editor:edit` my latest video, energetic, Hinglish captions, big title behind me for the hook, follow CTA at the end
3. Claude cuts pauses and retakes, writes captions and shows you a **storyboard**.
4. Give notes like you would to an editor: *"title bigger"*, *"remove where I laugh"*, *"add a search bar when I say Google"*.
5. Say **"render it"**. The reel, cover and post caption land in **Vibe Editor → output**.

## Make it yours

- **Copy a style you love**: drop a reel or screenshot in `references/` and say *"`/vibe-editor:style` make my captions and effects like this"*.
- **Your fonts** → put `.ttf/.otf` files in `fonts/` · **your sounds** → `.wav/.mp3` in `sounds/` · **your colour grade** → `.cube` LUT in `looks/`.
- **Anything new**: ask for an effect that isn't in the library. Claude designs it, tests it and saves it as yours.

## Commands

| type | what it does |
|---|---|
| `/vibe-editor:setup` | First-time install + your brand style |
| `/vibe-editor:edit` | Edit a video into a reel (also batch: "edit all my inbox videos") |
| `/vibe-editor:style` | Match a reference, create custom effects, add your fonts/sounds/looks |
| `/vibe-editor:effects` | See and preview the whole library |
| `/vibe-editor:cover` | Cover image + post caption |
| `/vibe-editor:doctor` | Fix any problem |

You can also just talk normally ("edit my new video"). Claude picks the right one.

## What's inside

- Auto-cut pauses, "umm"s and retakes · word-by-word captions in **47 styles**
- Hindi, Hinglish (Roman or Devanagari), Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi + 50 more languages
- **90+ motion effects**: 40 title animations, cards, checklists, counters, UI mockups (phone, keyboard, search, call, DM, comment, notification, AI prompt, cursor…), charts, doodles, stickers, transitions, frames (newspaper, banknote, polaroid…)
- **AI cut-out effects**: text behind you, sticker cut-out, outline, background swap, clone row, dolly zoom, frame break
- **36 looks** · **50 original sounds** · background music with auto-ducking · **70+ fonts**
- Cover + post caption · 9:16, 16:9, 1:1, 4:5 exports
- Learns your brand and saved styles

## What you need

A Mac or Windows computer (8 GB RAM works; more is faster), ~4 GB free space, a paid Claude plan (Pro is enough to start), internet once for setup. Everything runs on **your** computer; Vibe Editor never uploads your videos.

Fonts: SIL Open Font License / Apache 2.0. Sounds: original. AI cut-out model: MODNet (Apache 2.0). All safe for client work.
