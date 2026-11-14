# Image Prompt Library

For **Nano Banana 1.1** (Google Flow / Gemini) and **GPT Image 2.6** (ChatGPT). You can swap in any image
model: the structure stays the same.

**Image prompt formula (8 parts):**
`SUBJECT + PRODUCT LOCK + SET + LIGHT + CAMERA/LENS + STYLING & MOOD + BRAND LOOK + FORMAT` + `Avoid:` line

**How to use:**
1. Always upload your real product photo as the reference image.
2. Replace the words in [brackets]. The examples use Kesar & Co., Loom Street and Fizzbar.
3. Replace the BRAND LOOK part with your own LOOK BLOCK from your Brand Bible.
4. Make 2–4 takes. Check every image with the `product-accuracy-checker` skill.

**Standard PRODUCT LOCK line (copy into every product prompt):**
```
PRODUCT LOCK: use the exact product from the reference image. Same shape, same label text, same logo, same cap, same colours. Do not redesign, do not add or remove text, keep the label sharp and readable.
```

---

## 1. Studio packshots

**Hero packshot on seamless**
```
Hero product shot of the [Kesar & Co. Saffron Glow Face Serum, 30 ml amber glass dropper bottle] standing upright, centred. PRODUCT LOCK: use the exact product from the reference image, same shape, label text, logo, gold cap and colours, label sharp and readable. Set: seamless cream background (#F6EBD9) with a soft floor shadow. Light: large soft key light from the left, thin rim light on the right edge of the glass, warm glow through the amber glass. Camera: 100mm macro, f/8, straight-on at product height. Styling & mood: clean, premium, minimal. Brand look: warm, palette saffron #E8862A, deep red #8E1B1B, cream #F6EBD9, gold #C9A24B. Format: 4:5. Avoid: misspelled label, clear glass, pump instead of dropper, extra products, clutter.
```

**Packshot on a plinth with shadows**
```
The [product] on a round cream travertine plinth. PRODUCT LOCK: exact product from the reference image, label sharp and readable. Set: warm beige wall, a single dried saffron flower beside the plinth. Light: hard golden sunlight from the left through a window, long leaf shadows across the wall. Camera: 85mm, f/5.6, slightly low angle to make the product feel heroic. Styling & mood: calm, editorial, luxurious. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: changing the label, cold light, busy background.
```

**Floating packshot with ingredients**
```
The [product] floating at a slight 10° tilt, surrounded by floating saffron threads and a few cream silk petals frozen in mid-air. PRODUCT LOCK: exact product from the reference image, label facing camera and readable. Set: soft gradient from cream to warm saffron. Light: soft top light, gentle glow behind the bottle. Camera: 100mm, f/5.6, straight-on. Styling & mood: light, dreamy, premium. Brand look: [LOOK BLOCK]. Format: 1:1. Avoid: ingredients covering the label, extra bottles, cartoon look.
```

**Dark luxury packshot**
```
The [product] on a black glossy surface with a perfect reflection. PRODUCT LOCK: exact product from the reference image. Set: pure black background. Light: one narrow strip softbox from above-left, gold rim light on the cap, amber glow inside the glass. Camera: 100mm macro, f/11, eye level. Styling & mood: dramatic, luxury, quiet. Brand look: gold #C9A24B highlights, deep red #8E1B1B accents. Format: 4:5. Avoid: grey blacks, dust, misspelled label.
```

## 2. Lifestyle scenes

**Vanity morning**
```
The [product] on a marble bathroom vanity next to a folded cream towel, a small brass tray and a sprig of jasmine. PRODUCT LOCK: exact product from the reference image, label readable. Set: bright Indian bathroom, warm wood mirror frame softly out of focus. Light: soft morning window light from the left. Camera: 50mm, f/2.8, eye level, product in the left third. Styling & mood: fresh, calm, real home. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: hotel look, clutter, cold light.
```

**In-hand lifestyle**
```
Close-up of a woman's hand with warm medium-brown skin and natural short nails holding the [product] at chest height, a gold ring on one finger. PRODUCT LOCK: exact product from the reference image, label facing camera and readable, hand does not cover the logo. Set: blurred sunlit bedroom with plants. Light: soft window light from the right. Camera: 85mm, f/2.2. Styling & mood: natural, real, warm. Brand look: [LOOK BLOCK]. Format: 9:16. Avoid: extra fingers, plastic skin, lighter skin tone, covered label.
```

**Office desk**
```
The [product] on a light-wood office desk next to a laptop, a cup of masala chai and a small plant. PRODUCT LOCK: exact product from the reference image, label readable. Set: modern Indian office, soft blurred colleagues in the background. Light: daylight from large windows, warm accent from a desk lamp. Camera: 35mm, f/2.8, slightly above. Styling & mood: busy-life, real. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: messy desk, cold office light, other brands' logos.
```

**Travel / bag shot**
```
The [product] peeking out of an open tan leather travel pouch on a hotel bed with white sheets, sunglasses and a boarding pass nearby. PRODUCT LOCK: exact product from the reference image, label visible and readable. Light: warm late-afternoon sun. Camera: top-down 45°, 35mm, f/4. Styling & mood: travel, freedom, on-the-go. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: real airline logos, readable personal details.
```

## 3. E-commerce listing images

**White background (main image)**
```
E-commerce main image of the [product], front view, centred, filling 85% of the frame height. PRODUCT LOCK: exact product from the reference image, every word on the label sharp. Set: pure white background #FFFFFF, very soft natural shadow under the product. Light: even, bright, soft studio light, no colour cast. Camera: 100mm, f/11, straight-on. Format: 1:1, 2000x2000. Avoid: props, text, gradients, reflections over the label.
```

**Infographic base (add text later)**
```
The [product] on the right half of the frame, leaving clean empty space on the left for text. PRODUCT LOCK: exact product from the reference image. Set: soft cream background #F6EBD9 with 3 small saffron threads near the bottle. Light: soft even studio light. Camera: 100mm, straight-on. Format: 1:1. Avoid: any text or icons in the image, clutter in the empty space.
```

**Scale shot (in hand)**
```
A hand holding the [product] to show its real size, neutral background. PRODUCT LOCK: exact product from the reference image, correct real size compared with the hand (a 30 ml bottle is about the height of a palm). Light: soft even light. Camera: 50mm, f/5.6. Format: 1:1. Avoid: oversized or tiny product, extra fingers.
```

**Texture / ingredient image**
```
A single drop of golden serum on a glass slide with saffron threads beside it, the [product] softly out of focus behind. PRODUCT LOCK: exact product from the reference image. Light: soft backlight that makes the serum glow. Camera: 100mm macro, f/4. Format: 1:1. Avoid: unreal colours, the serum looking like oil or honey.
```

## 4. Model and fashion

**Brand model portrait with product**
```
Portrait of [CHARACTER BLOCK: Ananya, 27-year-old Indian woman, warm medium-brown skin with real texture and faint freckles, oval face, dark brown almond eyes, small gold nose stud, shoulder-length wavy black hair], holding the [product] near her cheek and smiling softly. PRODUCT LOCK: exact product from the reference image, label facing camera. Set: warm cream wall with soft leaf shadows. Light: golden-hour sun from the left, soft fill. Camera: 85mm, f/2, eye level. Styling & mood: gold jhumkas, cream silk top, natural makeup, glowing healthy skin. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: lighter skin than described, plastic skin, heavy makeup, different face from the reference.
```

**Lookbook full body (Loom Street)**
```
Full-body fashion lookbook shot of [CHARACTER BLOCK] wearing a [Loom Street handloom cotton kurta in indigo with white block-print motifs, straight cut, mid-calf length, with white cotton palazzos and tan kolhapuri sandals]. GARMENT LOCK: keep the exact print, colour and cut from the garment reference image. Set: old Jaipur haveli courtyard with pink sandstone arches. Light: soft open shade, warm bounce from the walls. Camera: 50mm, f/4, full body, eye level. Styling & mood: relaxed, confident, modern Indian. Format: 4:5. Avoid: changing the print, wrong colours, warped hands, stiff pose.
```

**Fabric detail**
```
Close-up of the [Loom Street indigo block-print kurta] fabric: sleeve and cuff detail with visible hand-block print texture and slightly uneven natural cotton weave. GARMENT LOCK: exact print and colour from the reference image. Light: soft side light to show texture. Camera: 100mm macro, f/5.6. Format: 1:1. Avoid: digital-looking print, perfect machine pattern, shiny fabric.
```

**Festive group**
```
Three Indian friends in their late 20s with different skin tones (light-medium, medium-brown, deep brown) and body types, wearing [Loom Street] festive silk kurtas and a saree in saffron, deep red and gold, laughing on a terrace with diyas and string lights. Light: warm evening, diya glow on faces, soft string-light bokeh. Camera: 35mm, f/2.8. Styling & mood: joyful, real, festive. Format: 4:5. Avoid: identical faces, lighter skin than described, extra limbs, stiff posing.
```

## 5. Beauty macro

**Serum drop**
```
Extreme macro of a single golden serum drop falling from a glass dropper, frozen in mid-air, with a tiny saffron thread inside the drop. PRODUCT LOCK: the dropper and cap match the reference product. Set: soft cream background. Light: backlight that makes the drop glow, small sparkle highlight. Camera: 100mm macro, f/5.6, very shallow focus. Mood: luxurious, precise. Format: 9:16. Avoid: oily look, too many drops, plastic dropper.
```

**Skin texture with product**
```
Macro of real cheek skin, warm medium-brown, with visible pores and fine natural texture, a fingertip pressing a drop of golden serum in. Light: soft warm window light. Camera: 100mm macro, f/4. Mood: honest, real, healthy glow. Format: 4:5. Avoid: airbrushed skin, plastic skin, lighter skin, "before/after" claims.
```

**Cream swatch**
```
Macro of a thick cream swatch swirled on a cream ceramic tile, soft peaks, with the [product] out of focus behind. PRODUCT LOCK: exact product from the reference image. Light: soft top light with gentle shadows in the swirl. Camera: 100mm macro, f/4, 30° angle. Format: 1:1. Avoid: plastic-looking cream, overly shiny surface.
```

## 6. Food and beverage

**Can with splash (Fizzbar)**
```
The [Fizzbar sparkling mango drink, 300 ml slim aluminium can] bursting through a wave of mango juice, droplets frozen in mid-air, mango slices flying around it. PRODUCT LOCK: exact can from the reference image, same label design, logo and colours, label readable. Set: bright saffron-yellow gradient background. Light: hard backlight for glowing droplets, soft front fill. Camera: 85mm, f/8, fast shutter look. Mood: fresh, loud, thirst-making. Format: 9:16. Avoid: misspelled logo, deformed can, brown muddy juice.
```

**Condensation hero**
```
The [Fizzbar can] standing on crushed ice, covered in fine cold condensation drops, a few drops running down. PRODUCT LOCK: exact can from the reference image, label readable through the drops. Light: cool rim light, warm front light. Camera: 100mm, f/8, eye level. Format: 4:5. Avoid: drops covering the logo, plastic ice.
```

**Food table (top-down)**
```
Top-down shot of an Indian festive snack table: a brass thali with kaju katli, mathri and chakli, the [product] placed at the top right, marigold petals, a small diya. PRODUCT LOCK: exact product from the reference image. Light: soft warm daylight from the top left. Camera: top-down, 35mm, f/5.6. Mood: warm, generous, real. Format: 4:5. Avoid: plastic-looking food, too much food, other brands' packaging.
```

## 7. Luxury and accessories

**Jewellery on fabric**
```
A [gold kundan necklace with green enamel and pearl drops] laid on folded deep-red raw silk. PRODUCT LOCK: exact piece from the reference image, same stones, same layout. Light: one soft spotlight from above-left making the gold glow, deep shadows. Camera: 100mm macro, f/8, 45° angle. Mood: rich, heritage, quiet luxury. Format: 4:5. Avoid: extra stones, warped chain, fake sparkle stars.
```

**Watch editorial**
```
A [steel watch with a navy dial] resting on a stack of old leather-bound books next to a brass compass. PRODUCT LOCK: exact watch from the reference image, same dial, hands and logo. Light: low warm side light, soft shadows. Camera: 100mm macro, f/5.6. Mood: classic, timeless. Format: 4:5. Avoid: changing the dial text, extra hands, wrong logo.
```

**Bag in architecture**
```
A [tan leather structured handbag] on a white marble step in a minimal modern building with strong geometric shadows. PRODUCT LOCK: exact bag from the reference image, same stitching, hardware and logo. Light: hard midday sun, crisp shadows. Camera: 50mm, f/8, low angle. Mood: minimal, high-fashion. Format: 4:5. Avoid: changed hardware, wrong colour, people in frame.
```

## 8. CGI and surreal

**Giant product in a city**
```
A giant [product], as tall as a 5-storey building, standing in the middle of a real Jaipur street at golden hour, people and auto-rickshaws small at its base looking up. PRODUCT LOCK: exact product from the reference image, label readable even at this scale. Light: golden-hour sun, long shadows, the product casting a real shadow on the street. Camera: 24mm, low angle from street level. Mood: epic, surprising, believable. Brand look: [LOOK BLOCK]. Format: 9:16. Avoid: toy look, wrong scale, misspelled label, floating product with no shadow.
```

**Product as architecture**
```
A surreal minimal world where the [product] is a palace tower: a doorway at its base, tiny staircase, small figures walking in, surrounded by saffron dunes. PRODUCT LOCK: exact product shape and label from the reference image. Light: soft warm desert light. Camera: 35mm, slightly low. Mood: dreamy, imaginative. Format: 4:5. Avoid: cartoon look, extra towers, label changes.
```

**Ingredient storm**
```
The [product] standing calmly in the centre while a swirling storm of saffron threads and cream silk ribbons spirals around it. PRODUCT LOCK: exact product from the reference image, label clear. Light: soft glow from behind, warm. Camera: 50mm, eye level. Mood: powerful, magical. Format: 9:16. Avoid: ribbons covering the label, chaos, dark mood.
```

## 9. Festive (India)

**Diwali packshot**
```
The [product] on cream silk surrounded by lit brass diyas, marigold petals and a small rangoli in saffron and deep red. PRODUCT LOCK: exact product from the reference image, label readable. Light: warm diya glow from below and the sides, soft golden key light from the left, bokeh of string lights behind. Camera: 85mm, f/2.8, slightly low. Mood: festive, warm, premium. Brand look: [LOOK BLOCK]. Format: 4:5. Avoid: too many diyas, fire touching the product, cheap glitter, misspelled label.
```

**Diwali gift box**
```
An open premium gift box in cream with a gold foil pattern, the [product] sitting in a velvet slot, with a handwritten card and a few marigold petals. PRODUCT LOCK: exact product from the reference image. Light: warm golden light, soft shadows. Camera: 50mm, 45° top angle. Mood: thoughtful gift, premium. Format: 1:1. Avoid: readable text on the card, other brands, extra products.
```

**Rakhi / sibling gift**
```
A sister's hands tying a simple gold-thread rakhi on her brother's wrist, the [product] in a small gift bag on the table in front. PRODUCT LOCK: exact product from the reference image, visible in the bag. Light: soft morning light, warm. Camera: 50mm, f/2.8. Mood: warm, family. Format: 4:5. Avoid: extra fingers, the product hidden.
```

**Wedding season**
```
The [product] on a bride's dressing table with gold bangles, a mehendi cone, jasmine strings and a mirror reflecting soft fairy lights. PRODUCT LOCK: exact product from the reference image, label readable. Light: warm evening light, fairy-light bokeh. Camera: 85mm, f/2. Mood: excited, celebration. Format: 4:5. Avoid: clutter around the label, cold light.
```
