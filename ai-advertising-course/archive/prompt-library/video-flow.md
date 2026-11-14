# Video Prompt Library: Google Flow

For **Google Flow** with **Google Omni Flash 1.2**. You can swap in any video model: the structure stays the same.

**Video prompt formula (7 parts):**
`SHOT TYPE + SUBJECT & ACTION + CAMERA MOVE + LIGHT & MOOD + SOUND + DURATION/PACE + CONSISTENCY` + `Avoid:` line

**Flow modes** (use whichever of these your version of Flow shows):
- **Text to Video:** no image; good for moods, textures and B-roll.
- **Frames to Video:** start frame (+ optional end frame). **Use this for every product shot.**
- **Ingredients / reference to Video:** combine references (product + person + set).
- **Extend / scene builder:** continue a good clip or build a sequence.

**Rules:**
1. Start product shots from an approved image (it passed `product-accuracy-checker`).
2. One camera move per shot. Slow moves keep labels sharp.
3. 4–8 second shots. Short shots fail less.
4. Always add the CONSISTENCY line.

**Standard CONSISTENCY line:**
```
Consistency: same product, set and light as the start frame. The label stays sharp and readable and the product does not change shape.
```

---

## 1. Camera moves (product shots)

**Slow push-in**
```
Close-up product shot. The [Kesar & Co. serum bottle] stands still on cream silk while tiny dust particles float in the light. Camera: very slow, smooth push-in towards the label. Light & mood: warm golden side light, calm and premium. Sound: soft room tone, one gentle sitar note. Duration: 5 seconds, slow. Consistency: same product, set and light as the start frame, label sharp and readable, product does not change shape. Avoid: fast motion, label changing, extra objects.
```

**Orbit**
```
Medium close-up product shot. The [product] stands on a round travertine plinth. Camera: smooth 45-degree orbit from left to right around the product, at product height. Light & mood: hard golden window light, leaf shadows moving slightly. Sound: soft whoosh, light ambience. Duration: 6 seconds, smooth and steady. Consistency: same product, set and light as the start frame, label sharp and readable, product does not change shape. Avoid: full 360 spin, wobble, label warping.
```

**Pull-out reveal**
```
Extreme close-up to wide shot. Starts on the gold cap of the [product], then reveals the whole bottle on a Diwali set with diyas and marigolds. Camera: slow smooth pull-out and slight rise. Light & mood: warm diya glow, festive. Sound: soft bells, warm pad. Duration: 6 seconds. Consistency: same product, set and light as the start frame, label sharp and readable. Avoid: camera shake, diyas going out, extra bottles.
```

**Top-down rotate**
```
Top-down flat lay. The [product] lies on cream silk with saffron threads around it. Camera: slow 20-degree clockwise rotation looking straight down. Light & mood: soft even daylight, calm. Sound: soft fabric rustle. Duration: 5 seconds. Consistency: same product, set and light as the start frame, label readable. Avoid: objects moving by themselves, label changing.
```

**Low-angle hero tilt-up**
```
Low-angle hero shot. The [product] stands on a black glossy surface. Camera: slow tilt up from the reflection to the gold cap. Light & mood: dark luxury, narrow strip light, gold rim glow. Sound: deep low hum, soft shimmer. Duration: 5 seconds. Consistency: same product, set and light as the start frame, label sharp. Avoid: grey blacks, flicker.
```

**Dolly slide with parallax**
```
Medium shot. The [product] on a vanity with jasmine and a brass tray in the foreground. Camera: slow dolly slide right, foreground objects passing past the lens for parallax. Light & mood: soft morning light, fresh. Sound: birds outside the window, soft ambience. Duration: 6 seconds. Consistency: same product, set and light as the start frame. Avoid: foreground covering the label for more than 1 second.
```

## 2. Product motion

**Dropper lift**
```
Close-up. A hand lifts the gold dropper out of the [product] bottle; one golden drop forms at the tip and falls. Camera: static, locked off. Light & mood: warm backlight that makes the drop glow. Sound: soft glass clink, a tiny drip sound. Duration: 5 seconds, slow and precise. Consistency: same bottle and hand as the start frame, label stays readable, hand has five fingers. Avoid: extra fingers, the dropper changing shape, fast motion.
```

**Product drop-in**
```
Medium close-up. The [product] drops into frame from above and lands softly on cream silk, the fabric ripples outward. Camera: static, then a tiny push-in after the landing. Light & mood: soft golden light. Sound: soft whoosh, a muffled thud, fabric swish. Duration: 4 seconds. Consistency: same product as the start frame, label facing camera after landing. Avoid: bouncing, spinning, label upside down.
```

**Spin to label**
```
Close-up. The [product] slowly turns on a rotating stand and stops with the label facing the camera. Camera: static. Light & mood: clean studio light, premium. Sound: soft mechanical click at the stop. Duration: 5 seconds. Consistency: same product as the start frame, label text unchanged when it faces the camera. Avoid: fast spin, label text changing.
```

## 3. Pours and splashes

**Liquid pour**
```
Close-up. Golden serum pours slowly from above into a small glass dish, forming a smooth glossy ribbon. Camera: slow push-in. Light & mood: warm backlight, rich glow. Sound: soft liquid pour, gentle ambience. Duration: 5 seconds, slow motion. Consistency: same set and light as the start frame. Avoid: splashing, a watery or oily look.
```

**Drink splash (Fizzbar)**
```
Slow-motion product shot. The [Fizzbar can] bursts up through a wave of mango juice, droplets and mango slices flying past the camera. Camera: slight slow push-in. Light & mood: bright backlight, glowing droplets, fresh and energetic. Sound: big fizzy splash, can hiss, upbeat percussion hit. Duration: 4 seconds, slow motion. Consistency: same can as the start frame, logo readable at the end. Avoid: deformed can, brown juice, logo melting.
```

**Can open + fizz**
```
Close-up. A finger pulls the tab of the cold [Fizzbar can], fine fizz mist escapes, condensation drops run down. Camera: static macro. Light & mood: cool rim light, warm front light. Sound: crisp can crack and fizz, very close. Duration: 4 seconds. Consistency: same can as the start frame, label readable. Avoid: extra fingers, the can changing shape.
```

**Chai pour (food)**
```
Medium close-up. Masala chai is poured from a steel kettle from high up into a glass, making a frothy top, steam rising. Camera: static, slightly low. Light & mood: warm morning kitchen light, cosy. Sound: chai pour, a spoon clinking, kitchen ambience. Duration: 5 seconds. Consistency: same set as the start frame. Avoid: liquid floating, too much steam.
```

## 4. Fabric and fashion

**Kurta in the wind**
```
Full-body shot. [CHARACTER BLOCK] in the [Loom Street indigo block-print kurta] walks slowly through a haveli courtyard, the fabric moving softly in the breeze. Camera: slow tracking shot alongside her, eye level. Light & mood: soft open shade, warm walls. Sound: footsteps on stone, light breeze, birds. Duration: 6 seconds. Consistency: same woman, same kurta print and colour as the start frame. Avoid: print changing, face changing, stiff walk.
```

**Saree drape swirl**
```
Medium shot. A woman twirls once and the [Loom Street red-and-gold silk saree] pallu swirls out in slow motion. Camera: static, slight push-in. Light & mood: warm golden hour, festive. Sound: soft fabric swish, a gentle music swell. Duration: 5 seconds, slow motion. Consistency: same woman and saree pattern as the start frame. Avoid: fabric merging with her body, the pattern melting.
```

**Fabric macro**
```
Extreme close-up. Hand-block-printed cotton fabric moves gently as fingers run across it. Camera: slow slide left. Light & mood: soft side light showing the weave. Sound: soft fabric rustle. Duration: 4 seconds. Consistency: same print as the start frame. Avoid: a digital-looking pattern.
```

## 5. Tech reveal

**Gadget reveal**
```
Product reveal. [Wireless earbuds case] slowly opens, a soft light glows from inside, one earbud lifts out a little. Camera: slow orbit 30 degrees right plus a slight push-in. Light & mood: dark, sleek, blue-white rim light. Sound: soft magnetic click, a subtle synth swell. Duration: 5 seconds. Consistency: same product, logo and colour as the start frame. Avoid: extra earbuds, logo changing, plastic look.
```

**Phone screen-on**
```
Close-up. A [smartphone] lying face-down flips over by itself and the screen lights up with soft colours. Camera: static top-down. Light & mood: dark desk, glowing screen. Sound: soft whoosh and a UI chime. Duration: 4 seconds. Consistency: same phone as the start frame. Avoid: readable fake app logos, warped edges.
```

## 6. UGC handheld

**Selfie talking take**
```
Handheld selfie video on a phone front camera. [CHARACTER BLOCK] sits on her bed, holds the [product] up to the camera and says: "Okay so, I've been using this for two weeks and honestly... look." Camera: handheld, small natural movements, slightly high angle. Light & mood: natural window light, real bedroom, casual. Sound: her voice, natural room sound. Duration: 6 seconds. Consistency: same woman and product as the start frame, label readable when she holds it up, lips in sync with the line. Avoid: studio look, perfect stable camera, beauty filter.
```

**GRWM mirror take**
```
Handheld phone video in a bathroom mirror. [CHARACTER BLOCK] puts three drops of the serum on her fingertips and pats it into her cheeks while smiling at the mirror. Camera: phone held in one hand, small shakes. Light & mood: bathroom light plus window light, real and casual. Sound: soft room echo, a light background beat. Duration: 6 seconds. Consistency: same woman and product as the start frame. Avoid: perfect studio light, extra fingers, a changed face.
```

**Unboxing hands**
```
POV handheld unboxing. Hands open a cream Kesar & Co. box, peel tissue paper and lift out the [product] towards the camera. Camera: POV, handheld, natural. Light & mood: daylight on a desk. Sound: cardboard opening, paper crinkle, a happy "ooh". Duration: 7 seconds. Consistency: same box and product as the start frame, label readable at the end. Avoid: extra hands, the product appearing from nowhere.
```

## 7. CGI giant product

**Giant product in the street**
```
Wide establishing shot. A giant [product], 5 storeys tall, stands in a real Jaipur street at golden hour. Auto-rickshaws drive past its base, people stop and look up. Camera: slow crane up from street level to the gold cap. Light & mood: golden hour, long shadows, epic and believable. Sound: city traffic, horns, a deep cinematic boom. Duration: 7 seconds. Consistency: same giant product as the start frame, label readable, the product casts a real shadow. Avoid: the product floating, scale changing, a toy look.
```

**Fly-through window**
```
FPV-style flying shot. The camera flies through a carved sandstone jharokha window and into a room where the [product] glows on a silk table. Camera: smooth FPV forward fly-through, slowing at the product. Light & mood: from bright outside to warm interior glow. Sound: whoosh, then a quiet warm room tone. Duration: 6 seconds. Consistency: same product as the end frame, label readable. Avoid: shaky motion, the room changing.
```

## 8. Festive

**Diwali diyas lighting**
```
Close-up. A hand lights the last of a row of brass diyas next to the [product]; as each flame catches, the bottle glows warmer. Camera: slow slide right along the diyas, ending on the product. Light & mood: warm, glowing, festive. Sound: match strike, soft flame flutter, distant fireworks. Duration: 6 seconds. Consistency: same product, set and light as the start frame, label readable. Avoid: fire touching the product, flickering exposure.
```

**Terrace party**
```
Wide shot. [CHARACTER BLOCK] in a cream-and-red silk kurta laughs with friends on a terrace with string lights and diyas, fireworks bursting softly in the night sky behind. Camera: slow dolly right. Light & mood: warm string lights, joyful. Sound: laughter, distant fireworks, festive music. Duration: 6 seconds. Consistency: same woman and outfit as the start frame. Avoid: faces changing, fireworks too close.
```

**Marigold rain**
```
Medium shot. Marigold petals fall slowly around the [product] on cream silk. Camera: very slow push-in. Light & mood: golden light, celebratory. Sound: soft bells, petals landing. Duration: 5 seconds, slow motion. Consistency: same product and set as the start frame, petals don't cover the label. Avoid: petals stacking on the bottle, the label changing.
```
