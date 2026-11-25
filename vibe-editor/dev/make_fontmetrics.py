#!/usr/bin/env python3
"""Build library/fonts.json (registry) + library/fontmetrics.json (exact metrics) and verify libass picks each font.

Usage: python3 dev/make_fontmetrics.py
"""
import json, os, subprocess, sys
import numpy as np
from fontTools.ttLib import TTFont
L = os.path.join(os.path.dirname(__file__), "..", "plugin", "vibe-editor", "skills", "edit", "library")
F = os.path.join(L, "fonts")

# key: (file, description, family-override, bold, italic)
REG = [
 ("poppins-black", "Poppins-Black.ttf", "Heavy rounded geometric — the default punchy reel font", "Poppins Black", False),
 ("poppins-extrabold", "Poppins-ExtraBold.ttf", "Slightly lighter Poppins", "Poppins ExtraBold", False),
 ("poppins-bold", "Poppins-Bold.ttf", "Clean bold geometric", "Poppins", True),
 ("poppins-semibold", "Poppins-SemiBold.ttf", "Poppins for body text on cards", "Poppins SemiBold", False),
 ("montserrat-black", "Montserrat-Black.ttf", "Montserrat Black — bold modern classic", None, False),
 ("montserrat-extrabold", "Montserrat-ExtraBold.ttf", "Montserrat ExtraBold", None, False),
 ("montserrat-bold", "Montserrat-Bold.ttf", "Montserrat Bold — great body/caption font", None, False),
 ("montserrat-black-italic", "Montserrat-BlackItalic.ttf", "Montserrat Black Italic — sporty, fast", None, False),
 ("inter-extrabold", "Inter-ExtraBold.otf", "Inter ExtraBold — neutral, very readable", "Inter ExtraBold", False),
 ("inter-bold", "Inter-Bold.otf", "Inter Bold — neutral UI font", "Inter", True),
 ("barlow-black", "Barlow-Black.ttf", "Barlow Black — friendly grotesque", None, False),
 ("barlow-extrabold", "Barlow-ExtraBold.ttf", "Barlow ExtraBold", None, False),
 ("barlow-semibold", "Barlow-SemiBold.ttf", "Barlow SemiBold — clean body text", None, False),
 ("barlow-condensed", "BarlowCondensed-ExtraBold.ttf", "Barlow Condensed ExtraBold — tall, compact", None, False),
 ("barlow-condensed-black", "BarlowCondensed-Black.ttf", "Barlow Condensed Black", None, False),
 ("kanit-black", "Kanit-Black.ttf", "Kanit Black — techy, bold", None, False),
 ("kanit-semibold", "Kanit-SemiBold.ttf", "Kanit SemiBold", None, False),
 ("anton", "Anton-Regular.ttf", "Anton — tall condensed impact font for huge words", "Anton", False),
 ("bebas", "BebasNeue-Regular.ttf", "Bebas Neue — condensed all-caps display", "Bebas Neue", False),
 ("archivo-black", "ArchivoBlack-Regular.ttf", "Archivo Black — chunky grotesque", "Archivo Black", False),
 ("archivo-expanded", "Archivo-Expanded-900.ttf", "Archivo Expanded Black — wide, techy, premium", "Archivo Expanded Black", False),
 ("russo-one", "RussoOne-Regular.ttf", "Russo One — sporty, gaming", None, False),
 ("chakra-petch", "ChakraPetch-Bold.ttf", "Chakra Petch Bold — futuristic tech", None, False),
 ("black-ops", "BlackOpsOne-Regular.ttf", "Black Ops One — military stencil", None, False),
 ("bowlby", "BowlbyOne-Regular.ttf", "Bowlby One — fat retro display", None, False),
 ("rubik-mono", "RubikMonoOne-Regular.ttf", "Rubik Mono One — blocky monospace display", None, False),
 ("bungee", "Bungee-Regular.ttf", "Bungee — urban signage", None, False),
 ("lilita", "LilitaOne-Regular.ttf", "Lilita One — playful bold", None, False),
 ("luckiest", "LuckiestGuy-Regular.ttf", "Luckiest Guy — cartoon / kids", None, False),
 ("bangers", "Bangers-Regular.ttf", "Bangers — comic book", "Bangers", False),
 ("righteous", "Righteous-Regular.ttf", "Righteous — retro rounded", None, False),
 ("monoton", "Monoton-Regular.ttf", "Monoton — neon tube outline (use big)", None, False),
 ("ultra", "Ultra-Regular.ttf", "Ultra — heavy slab serif", None, False),
 ("abril", "AbrilFatface-Regular.ttf", "Abril Fatface — magazine headline serif", None, False),
 ("serif", "DMSerifDisplay-Regular.ttf", "DM Serif Display — elegant high-contrast serif", "DM Serif Display", False),
 ("dm-serif", "DMSerifDisplay-Regular.ttf", "DM Serif Display — elegant high-contrast serif", "DM Serif Display", False),
 ("serif-italic", "DMSerifDisplay-Italic.ttf", "DM Serif Display Italic", "DM Serif Display", False),
 ("instrument-serif", "InstrumentSerif-Regular.ttf", "Instrument Serif — trendy editorial serif", None, False),
 ("instrument-serif-italic", "InstrumentSerif-Italic.ttf", "Instrument Serif Italic — the 'aesthetic' script-like serif", None, False),
 ("shrikhand", "Shrikhand-Regular.ttf", "Shrikhand — bold retro italic display", None, False),
 ("pacifico", "Pacifico-Regular.ttf", "Pacifico — surfy brush script", None, False),
 ("satisfy", "Satisfy-Regular.ttf", "Satisfy — elegant script", None, False),
 ("caveat", "Caveat-600.ttf", "Caveat — friendly handwriting", "Caveat SemiBold", False),
 ("marker", "PermanentMarker-Regular.ttf", "Permanent Marker — thick marker handwriting", "Permanent Marker", False),
 ("gloria", "GloriaHallelujah.ttf", "Gloria Hallelujah — doodle handwriting", None, False),
 ("shadows", "ShadowsIntoLight.ttf", "Shadows Into Light — light pen handwriting", None, False),
 ("special-elite", "SpecialElite-Regular.ttf", "Special Elite — typewriter", None, False),
 ("space-mono", "SpaceMono-Bold.ttf", "Space Mono Bold — code / tech mono", None, False),
 ("space-mono-regular", "SpaceMono-Regular.ttf", "Space Mono Regular", None, False),
 ("plex-mono", "IBMPlexMono-Bold.ttf", "IBM Plex Mono Bold — clean code font", None, False),
 ("plex-mono-medium", "IBMPlexMono-Medium.ttf", "IBM Plex Mono Medium", None, False),
 ("pixel", "PressStart2P-Regular.ttf", "Press Start 2P — 8-bit pixel game", None, False),
 ("vt323", "VT323-Regular.ttf", "VT323 — retro terminal", None, False),
 ("noto-black", "NotoSans-Black.ttf", "Noto Sans Black — wide symbol coverage (₹ € ✓)", "Noto Sans Black", False),
 ("noto-bold", "NotoSans-Bold.ttf", "Noto Sans Bold", "Noto Sans", True),
 ("devanagari", "NotoSansDevanagari-Black.ttf", "Hindi/Marathi (Devanagari) — Noto Black", "Noto Sans Devanagari Black", False),
 ("devanagari-bold", "NotoSansDevanagari-Bold.ttf", "Devanagari — Noto Bold", "Noto Sans Devanagari", True),
 ("hind", "Hind-Bold.ttf", "Hind Bold — clean Hindi + Latin", None, False),
 ("mukta", "Mukta-ExtraBold.ttf", "Mukta ExtraBold — modern Hindi + Latin", None, False),
 ("rozha", "RozhaOne-Regular.ttf", "Rozha One — Hindi display serif (headlines)", None, False),
 ("kalam", "Kalam-Bold.ttf", "Kalam — Hindi handwriting", None, False),
 ("yatra", "YatraOne-Regular.ttf", "Yatra One — Hindi decorative display", None, False),
 ("tamil", "NotoSansTamil-Bold.ttf", "Tamil — Noto Bold", "Noto Sans Tamil", True),
 ("tamil-hind", "HindMadurai-Bold.ttf", "Hind Madurai — Tamil + Latin", None, False),
 ("telugu", "NotoSansTelugu-Bold.ttf", "Telugu — Noto Bold", "Noto Sans Telugu", True),
 ("bengali", "NotoSansBengali-Bold.ttf", "Bengali/Assamese — Noto Bold", "Noto Sans Bengali", True),
 ("bengali-hind", "HindSiliguri-Bold.ttf", "Hind Siliguri — Bengali + Latin", None, False),
 ("gujarati", "NotoSansGujarati-Bold.ttf", "Gujarati — Noto Bold", "Noto Sans Gujarati", True),
 ("gujarati-hind", "HindVadodara-Bold.ttf", "Hind Vadodara — Gujarati + Latin", None, False),
 ("kannada", "NotoSansKannada-Bold.ttf", "Kannada — Noto Bold", "Noto Sans Kannada", True),
 ("malayalam", "NotoSansMalayalam-Bold.ttf", "Malayalam — Noto Bold", "Noto Sans Malayalam", True),
 ("gurmukhi", "NotoSansGurmukhi-Bold.ttf", "Punjabi (Gurmukhi) — Noto Bold", "Noto Sans Gurmukhi", True),
 ("gurmukhi-mukta", "MuktaMahee-ExtraBold.ttf", "Mukta Mahee — Punjabi + Latin", None, False),
]
CPS = list(range(32, 127)) + list(range(160, 256)) + [0x20B9, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2022, 0x2713, 0x2192, 0x20AC, 0x2605]
reg, met = {}, {}
for key, fn, desc, fam, bold in REG:
    t = TTFont(os.path.join(F, fn))
    os2, upm = t["OS/2"], t["head"].unitsPerEm
    name = t["name"]
    nm = lambda i: str(name.getName(i, 3, 1, 0x409) or name.getName(i, 1, 0, 0) or "")
    family = fam or nm(4)
    italic = "italic" in fn.lower()
    cmap, hm = t.getBestCmap(), t["hmtx"]
    adv = {chr(c): hm[cmap[c]][0] for c in CPS if c in cmap}
    vals = [v for v in adv.values() if v]
    reg[key] = {"file": fn, "family": family, "bold": bold, "desc": desc}
    if italic and fam:
        reg[key]["italic"] = False
    met[key] = {"den": os2.usWinAscent + os2.usWinDescent, "asc": os2.usWinAscent,
                "cap": getattr(os2, "sCapHeight", 0) or int(upm * 0.7), "upm": upm,
                "avg": round(sum(vals) / len(vals), 1) if vals else upm * 0.5, "adv": adv}
json.dump(reg, open(os.path.join(L, "fonts.json"), "w"), indent=1, ensure_ascii=False)
json.dump(met, open(os.path.join(L, "fontmetrics.json"), "w"), separators=(",", ":"), ensure_ascii=False)

# verify libass picks each font: measured ink width must be close to fontTools prediction
bad = 0
for key, v in reg.items():
    m = met[key]
    txt = "Hamburgefonstiv" if not key.startswith(("devanagari", "tamil", "telugu", "bengali", "gujarati", "kannada", "malayalam", "gurmukhi")) or key.endswith(("-hind", "-mukta")) else None
    if txt is None:
        continue
    pred = sum(m["adv"].get(c, m["avg"]) for c in txt) * 100 / m["den"]
    ass = f"""[Script Info]
PlayResX: 3000
PlayResY: 300
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,{v['family']},100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,{-1 if v['bold'] else 0},0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:01.00,S,,0,0,0,,{{\\an5\\pos(1500,150)}}{txt}
"""
    open("/tmp/fm.ass", "w").write(ass)
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:s=3000x300:d=0.1", "-vf", f"ass=/tmp/fm.ass:fontsdir={F}", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    a = np.frombuffer(p.stdout, np.uint8).reshape(300, 3000)
    cols = np.where(a.max(0) > 40)[0]
    w = (cols[-1] - cols[0]) if len(cols) else 0
    ratio = w / pred if pred else 0
    flag = "" if 0.85 < ratio < 1.12 else "   <-- MISMATCH (libass may not find this family)"
    if flag:
        bad += 1
    print(f"{key:24s} family='{v['family']}' ink/pred={ratio:.2f}{flag}")
print(f"{len(reg)} fonts, {bad} mismatches")
