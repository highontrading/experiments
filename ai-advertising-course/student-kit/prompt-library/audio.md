# Audio Prompt Library

Voiceover with **ElevenLabs**, music and jingles with **Suno**, sound effects with ElevenLabs sound effects
(or Flow's native audio). The `sound-director` skill writes all of these for your brand.
**Check the commercial-use terms of your plan before using audio in paid ads.**

---

## 1. Voiceover direction (ElevenLabs)

ElevenLabs reads punctuation as direction. Use commas for short pauses, "..." for longer pauses, short
sentences for punch, and spell hard brand names the way they sound.

**Voice brief (paste into the voice library search / voice design)**
```
Warm Indian English female voice, late 20s, calm and confident, soft smile in the voice, medium-slow pace, clear but not posh, natural not announcer-like.
```
```
Young Indian male voice, early 20s, energetic and friendly, Hinglish-friendly, fast but clear, sounds like a creator talking to friends.
```
```
Mature Hindi female voice, 40s, warm and trustworthy, like a mother giving advice, slow and gentle.
```
```
Deep cinematic male voice, Indian English, slow and dramatic, for a premium brand film.
```

**English VO script (Kesar & Co. 15s)**
```
Three drops.
Long days... Diwali in ten.
Real Kashmiri saffron, with niacinamide.
Your glow, ready.
Kay-sar and Co. Shop the Diwali Glow.
```

**Hindi VO script (adapted, not translated)**
```
Bas teen boondein.
Lambi thakaan bhari shaamein... aur Diwali sirf das din door.
Asli Kashmiri kesar, niacinamide ke saath.
Aapka glow, taiyaar.
Kesar and Co. Diwali Glow, abhi shop karein.
```

**Hinglish VO script (creator style)**
```
Okay so, Diwali mein sirf das din bache hain... aur meri skin? Bilkul thaki hui.
Yeh hai Kesar and Co. ka saffron serum. Teen drops, bas.
Do hafte baad... honestly, photos mein glow dikh raha hai.
Link bio mein hai, thank me later.
```

**Direction lines to add as notes (for each take)**
| Line type | Direction |
|---|---|
| Hook | "Say it slowly, almost a whisper, like sharing a secret." |
| Problem | "Tired, relatable, a small sigh before the line." |
| Product | "Clear and proud, a little slower on the product name." |
| Proof | "Confident, matter-of-fact." |
| CTA | "Warm smile in the voice, upbeat, not shouting." |

**Pronunciation fixes**
| Word | Write it as |
|---|---|
| Kesar | Kay-sar |
| Niacinamide | nye-uh-SIN-uh-mide |
| Kolhapuri | Kol-ha-poo-ree |
| Fizzbar | Fizz-bar |

## 2. Music and jingles (Suno)

**Brand bed (instrumental)**
```
Instrumental, warm Indian fusion, soft sitar melody over a gentle lo-fi electronic beat, 95 BPM, premium and calm, builds slightly at 20 seconds, clean ending at 30 seconds, no vocals
```

**Festive upbeat**
```
Instrumental, festive Indian pop, dhol and tabla groove with bright synth plucks and shehnai hook, 112 BPM, joyful Diwali celebration energy, short intro, strong ending hit, no vocals
```

**Luxury minimal**
```
Instrumental, minimal luxury ambient, soft piano, deep warm pads, subtle santoor sparkles, 70 BPM, elegant and slow, cinematic, no drums, no vocals
```

**Drink / energetic (Fizzbar)**
```
Instrumental, upbeat summer pop, funky bass, claps, bright brass stabs, 120 BPM, fun and refreshing, punchy ending, no vocals
```

**UGC / creator background**
```
Instrumental, light lo-fi hip-hop, soft keys, relaxed groove, 85 BPM, casual creator vibe, quiet enough for talking over, no vocals
```

**Jingle with lyrics (Kesar & Co.)**
```
Style: warm Indian pop, female vocal, sitar and soft beat, 98 BPM, catchy, 20 seconds
Lyrics:
[Verse]
Teen boondein, sunehri shaam
Kesar ka jaadu, glow tamaam
[Hook]
Kesar and Co., Kesar and Co.
Real saffron, real glow
```

**Jingle with lyrics (Fizzbar, English)**
```
Style: bright summer pop, playful male and female vocals, claps, 122 BPM, 15 seconds, very catchy
Lyrics:
[Hook]
Pop it, sip it, feel the fizz
Mango sunshine, that's what it is
Fizz-bar! (Fizz-bar!)
```

**Sonic logo (2–5 s)**
```
Short sonic logo, 3 seconds, single sitar pluck into a warm shimmering chime and a soft low swell, premium, ends clean
```
```
Short sonic logo, 2 seconds, can crack, fizz, and a bright two-note synth "ding-ding", fun and fresh
```

## 3. Sound effects

Use 3–4 SFX per ad on key moments (hook, product reveal, transition, end card).
```
Soft airy whoosh, short, smooth, for a gentle transition, 1 second
```
```
Glass dropper clink on an amber glass bottle, close-up, crisp, 1 second
```
```
Single liquid drip into a small pool, close, clean, 1 second
```
```
Silk fabric swish, soft and luxurious, 1 second
```
```
Aluminium can opening with a crack and a long fizz, very close, 2 seconds
```
```
Big cold drink splash with ice, slow and juicy, 2 seconds
```
```
Match strike and a small flame catching, close, 2 seconds
```
```
Distant Diwali fireworks and soft crowd cheer, ambience, 5 seconds
```
```
Cardboard box opening and tissue paper crinkle, close, 3 seconds
```
```
Deep cinematic boom with a low rumble, for a giant product reveal, 2 seconds
```
```
Bright UI pop and soft sparkle, for text appearing on screen, 1 second
```
```
Camera shutter click, single, crisp, 1 second
```

## 4. Mix guide (tell `vibe-editor` these levels)
| Layer | Level |
|---|---|
| Voiceover | loudest, clear |
| Music under VO | about 12–18 dB lower than VO (ducking) |
| Music without VO | full, then fade in the last 1–1.5 s |
| SFX | short, about as loud as the music, never over the VO |
| Final | -14 LUFS, peaks below -1 dB |
