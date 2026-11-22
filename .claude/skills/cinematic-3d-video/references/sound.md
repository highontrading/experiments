# Sound design for short cinematic clips

Picture sells "real", sound sells "expensive". A silent render feels like a demo.

## Layers (bottom to top)
1. **Bed / room tone** - the space itself: room with distant birds (day), city hum + distant
   traffic (night), studio air (product). Gain 0.4-0.6. Always present, full length.
2. **Object hum** - what the hero sounds like when idle: CRT whine, fan, fridge hum, engine idle. Often
   folded into the bed prompt.
3. **Music pad** (optional) - one sustained warm chord or a sparse texture; gain 0.2-0.35, fade in 1.5-2 s.
   Keep it simple so a voiceover or trending audio can sit on top.
4. **Transitions** - soft whoosh starting ~0.7 s before each cut (gain 0.4-0.5).
5. **Foley synced to picture** - key clicks, a switch, a cup set down, paper. Place with "at" to
   the second the action is on screen (frame / fps).
6. **Accent** - a low impact or shimmer on the final reveal / logo.

## plan.json for scripts/sfx.py
```json
{
  "duration": 7.0,
  "layers": [
    {"name": "room", "prompt": "Quiet sunlit study room at golden hour, soft distant birds outside a half-open window, faint high-pitched hum and gentle fan of an old CRT computer, intimate, no music", "len": 8, "at": 0, "gain": 0.55},
    {"name": "pad", "prompt": "Warm nostalgic analog synth pad, single sustained soft chord slowly swelling, lo-fi tape warmth, cinematic, no drums", "len": 8, "at": 0, "gain": 0.30, "fade_in": 2},
    {"name": "whoosh", "prompt": "Soft airy cinematic whoosh transition, subtle and smooth", "len": 1.5, "at": 3.3, "gain": 0.45},
    {"name": "keys", "prompt": "A few soft slow clicks on a vintage beige mechanical computer keyboard, close up, quiet room", "len": 2.5, "at": 4.4, "gain": 0.6}
  ]
}
```
Prompt tips: describe the space, distance ("close up", "distant"), texture ("lo-fi", "airy") and
say "no music" on non-music layers. Keep each layer <= 22 s (ElevenLabs limit).

If ElevenLabs isn't reachable, ask the user for audio files or produce the video silent and say so -
never claim sound was added when it wasn't.
