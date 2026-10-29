# Vibe Editing: five Hinglish Meta ads

There are five 9:16 (1080x1920) ads, 36–51 s long, each built on one of the reference design
systems. All five use the same structure:

1. A hook in the first 3 seconds.
2. The problem, made worse.
3. Vibe Editing as the fix.
4. Real proof: a prompt, real code, and a real video made this way.
5. The multilingual twist.
6. A CTA, "Vibe Editing join करो", followed by a chorus of other Indian languages saying the same thing.

Every ad has burned-in Roman-Hinglish captions, timed word by word, because most Meta ads are watched muted.

| Ad | Design system | Story | Length |
| --- | --- | --- | --- |
| `a1_timeline_ka_jaal` | crumpled paper, engraved B&W cut-outs, red octopus, green halftone discs | "Ruko! Ye octopus nahi… ye aapka editing software hai." Tentacles carry menus, plugins and render bills; the evening disappears; scissors cut the tentacles; then Bolo → AI code → video | 45.9 s |
| `a2_1913_se_future` | graph paper, vintage B&W people, flat blue shapes, red lightning, time badge | 1913: Dadasaheb Phalke cutting *Raja Harishchandra* by hand → Moviola, Steenbeck, computer, timeline → "100 saal, kaam wahi" → the experiment works → Vibe Editing → every language → "Future mein pehla kadam rakho" | 51.3 s |
| `a3_ek_video_poora_india` | peach paper, stop-motion landmarks, purple labels, grungy condensed type | "Ek video banao… aur poora India dekhe." Re-editing for every language is the pain; one line, "Ise Tamil mein bhi banao", flips a real phone's captions; a taxi tours Delhi → Chennai → Kolkata → Mumbai; 9 phones, 9 languages; chorus in 8 languages | 42.9 s |
| `a4_uljhan_chhodo` | grid sky, yellow sun, teal grass, giant hand from above | A landmark tangled in wires: "Kya aapki editing bhi aisi hi uljhi hui hai?" Three spoken commands untangle it while the edits land on a real video inside the sun; languages sprout from the grass; the hand lowers the join button | 36.1 s |
| `a5_apni_desk_badlo` | top-down desk on a grid mat, real objects, dark photo card, dark subtitle pills | The to-do list says "Ek reel edit karna… poora din". Footage ✓, idea ✓, editing ??? Then the card flips to Vibe Editing; a prompt goes in, real code comes out, the reel plays; sticky notes in every script; the to-do gets ticked | 46.1 s |

## ElevenLabs (latest model in every category)

| What | Model | Notes |
| --- | --- | --- |
| Voice | `eleven_v4` | Narrators: Bunty (punchy reel voice) on a1 and a4; Raju (storyteller) on a2; Monika (Indian English, social) on a3 and a5. Chorus: native voices for bn, ta, te, mr, gu, kn, ml, pa |
| Music | `music_v2_5` | One bed per ad, prompted with the story's timestamps: tense under the problem, lifting at the reveal, a clean final hit on the CTA |
| SFX | `eleven_text_to_sound_v3` | An 18-sound pack: snips, paper, pops, stamps, typing, zaps, risers, chimes |

Every voice line was transcribed back with ElevenLabs Scribe to check the language and wording.

## Real assets only

There is nothing AI-generated in the visuals:
- Every cut-out is a real photo or a public-domain engraving.
- Every clip is real footage: *Raja Harishchandra* (1913), a 1954 film-editing bench, Mixkit footage, and city clips from the Bharat film.
- The "video" in the proof shots is the real multilingual reel made with vibe editing in `../vibe-editing-bharat`.
- The code on screen is real code from that project.

The full credits list is in `assets/CREDITS.md`. Several items are CC BY / CC BY-SA, so post a credits line with
the ads, or in the landing page's footer. For example:

> Images & footage: Wikimedia Commons (CC BY/BY-SA, see credits), Internet Archive (public domain), Mixkit. Voices, music & SFX: ElevenLabs.

## Build

```bash
./make.sh a1           # timing → frames → render → mix → out/a1_timeline_ka_jaal.mp4 (+ _master)
./make.sh a1 stills    # a 16-frame contact sheet → build/a1/sheet.jpg
```

| File | Role |
| --- | --- |
| `script.json` | every line: Devanagari for the voice, Roman Hinglish for the captions (same word count) |
| `tts.py`, `sfx.py`, `music.py` | ElevenLabs generation, cached; only new or changed items cost credits |
| `timing.py` | scenes, voice cues, chorus and word-timed SFX for each ad |
| `lib/kit.js` | print treatments (B&W halftone, duotone), captions, the real-code panel, the prompt box, the phone / hand-phone / laptop, CTA and chorus |
| `ads/a1.js` … `ads/a5.js` | one file per ad: its design system, scenes, transitions and caption style |
| `lib/film.js` | scene compositor (slide, whip, push-up, zoom-through, torn-paper wipe), the captions overlay, grain |
