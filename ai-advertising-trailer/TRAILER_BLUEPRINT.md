# AI & Advertising: Hinglish trailer v1, blueprint

The trailer follows the "Industrial 47" structure beat for beat, adapted to "the old ad shoot vs the AI way".

**Specs:** 1920×1080, 24 fps, 76.5 s, 144 BPM. One beat is exactly 10 frames, and every montage cut is 20 frames.

| Time | Section | Picture | Sound / VO (Hinglish) | On-screen text |
|---|---|---|---|---|
| 0.00–0.67 | Glitch open | Colour-bar noise and datamosh, with an "ERROR_404 // SHOOT_NOT_FOUND" flash | Glitch burst | — |
| 0.25–7.25 | **Archival "interview"** | 1956 RCA *Story of Television* interview (Prelinger, public domain). Each listed word gets a B-roll cut: TV studio set, film camera, crew shooting, a 1959 studio commercial with models. Ends on a 118% punch-in. | Vintage-filtered dub. **Q:** "Ek ad shoot ke liye… kya kya chahiye?" **A:** "Studio. Camera. Crew. Model… aur kam se kam teen hafte." | Subtitles, one word or phrase per cut |
| 7.25–9.50 | **Strobe** | 18 AI campaign stills from the Ideabro site, 3 frames each | Camera-shutter burst and riser | — |
| 9.50–10.63 | Pixelate → **1 s black** | — | Sub swell | — |
| 10.63–12.08 | **Punchline** | AI creator (Laneige UGC film) looking into the lens | **"Shoot? Kaun sa shoot?"** | "SHOOT? KAUN SA SHOOT?" |
| **12.08** | **DROP** | — | 144 BPM hybrid trailer/phonk track with dhol and tabla accents | — |
| 12.08–55.4 | **Montage, 7 chapters × 8 cuts** | Product → Model & fashion → UGC → CGI → Campaign films → Meta ads → lead-in. Includes a recorded *AI Ad Studio* prompt-to-image screen capture and a scroll capture of the course site. | Music only | Chapter labels for 2.5 s each: PRODUCT SHOOT — BINA STUDIO / MODEL SHOOT — BINA MODEL / UGC ADS — BINA CREATOR / CGI ADS — BINA 3D TEAM / CAMPAIGN FILMS — BINA CREW / META ADS — 20 VARIATIONS, EK DIN MEIN / 11 MODULES · 41 LESSONS |
| 37.1–37.9 | Burst | 5 × 4-frame impact shots | — | — |
| 55.4–58.75 | Double-time build | 8 × 10-frame cuts | Riser | — |
| 58.75–59.88 | Hero hit + glitch melt | Exploding-car CGI | Impact | — |
| 59.88–70.42 | **Breakdown** | 3 long slow-motion holds (fashion film, night-drive film, Total Repair film) | Piano and pads. Narrator: **"Generate button toh aaj sabke paas hai. Lekin AI se aisa ad banana, jo shoot kiya hua lage… wohi hai asli skill."** | Subtitles |
| 70.42–70.88 | Glitch logo reveal | Stripes → pixelated card in noise box → sharpen | Glitch | — |
| 70.88–76.5 | **End card** | IB mark / **AI & ADVERTISING** / SHOOT-QUALITY ADS, WITHOUT THE SHOOT. / IDEABRO STUDIO · ENROLL NOW | Impact and sub tail. VO: **"AI and Advertising. Ab shoot… optional hai."** | — |

A persistent **IDEABRO STUDIO** stencil watermark sits top-right at 72% opacity (the reference's "INDUSTRIAL 47" bug).

## Asset sources
- **Ideabro site** (community.ideabrostudio.com/courses/ai-and-advertising): 15 AI ad films and 45 campaign stills.
- **Archive:** Prelinger Archives, public domain:
  - *The Story of Television* (1956)
  - *Behind the Lens* (1940)
  - *Classic Television Commercials Pt II* (1948/59)
- **Screen recordings:**
  - an AI Ad Studio prompt → 4 variations UI, built for the trailer and recorded headless
  - a scroll capture of the course page
- **ElevenLabs:**
  - VO: Jeet (Q), Amrut (A), Anika (punchline), Reyaansh (narrator)
  - Music v1: main 144 BPM track and the breakdown piano
  - SFX: 9 pieces (glitches, sub swell, impact, riser, projector, shutter, whoosh, typing)

## Rebuild
The scripts are in `tools/`. Run them in this order:
1. `edl.py` (the cut list)
2. `render.py` (frame-accurate picture with glitches, subtitles and watermark)
3. `mix.py` (audio placement, ducking, two-pass loudnorm to -14 LUFS)
