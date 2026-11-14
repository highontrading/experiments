# Workflow 02: One Product Photo → Campaign Images
> You end with a full image set (packshots, lifestyle, a model shot and Meta statics in every size), all showing your real product.

| Time | Skill to attach | Tools | Modules |
|---|---|---|---|
| 60–90 min | `ad-image-director` | Google Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6) | 3, 4, 8 |

## You need
- Your product, a phone and a window
- A sheet of plain white paper
- Your Brand Bible (from Workflow 01)
- The `ad-image-director` skill attached in Claude, ChatGPT or Gemini

## Steps

### Step 1 · Shoot your reference photos
**Tool:** Phone · **You get:** 5 sharp product photos
Put the product on white paper next to a window. Hold the phone at product height.
Shoot the front, both sides, the back and the top.
**Check:** zoom in. Every word on the label must be readable.

### Step 2 · Plan the image set
**Tool:** Claude / ChatGPT / Gemini + `ad-image-director` · **You get:** 12 ready prompts
Attach the front photo and your Brand Bible, then type:
**Type this:**
```text
Follow this skill. My product is Kesar & Co. Saffron Glow Face Serum. Label text: "Kesar & Co." / "Saffron Glow Face Serum" / "30 ml". Plan 12 images for a Diwali campaign: 4 packshots, 4 lifestyle, 2 festive, 2 e-commerce. Give me a prompt for each.
```
**Check:** every prompt has a PRODUCT LOCK line and a ratio.

### Step 3 · Make the hero packshot
**Tool:** Google Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6) · **You get:** 1 hero image
Upload your front photo as the reference first. Then paste prompt P01. Make 2–4 takes and pick the best one.
**Check:** don't make anything else yet. Go to Step 4 first.

### Step 4 · Check it against the real product
**Tool:** `ad-image-director` (Mode 2) · **You get:** SHIP, FIX or REGENERATE
**Type this:**
```text
Check this image against my real product photo. Is the label, logo and shape right?
```
If it says FIX, paste the edit prompt it gives you into the same image tool.
**Check:** only SHIP images move on.

### Step 5 · Make the rest of the set
**Tool:** Google Flow or ChatGPT · **You get:** 11 more images
Upload the real photo **and** your approved hero as references. Paste the prompts one by one.
Change only the set and props. Keep the light and colours the same.
**Check:** run Step 4 on every image with a readable label.

### Step 6 · Add your brand model (optional)
**Tool:** `ad-image-director` (Mode 3) · **You get:** a model who looks the same in every shot
**Type this:**
```text
Create a brand model for my audience: Indian women 22–35 who love skincare. Give me 3 options, then a character sheet prompt and one portrait with my product.
```
**Check:** same face in every image, true skin tone, no lightening.

### Step 7 · Turn the best images into Meta statics
**Tool:** `ad-image-director` (Mode 5) · **You get:** statics in 9:16, 4:5 and 1:1, plus 10 variations
**Type this:**
```text
Turn my hero image into 9:16, 4:5 and 1:1 statics with space for a headline. Then give me a 10-variation plan and file names.
```
**Check:** nothing important in the top 14% or bottom 20% of the 9:16.

## Done when
- [ ] 4 packshots, 4 lifestyle, 2 festive and 2 e-commerce images are made
- [ ] Every hero image passed the accuracy check (SHIP)
- [ ] Light and colours match across the whole set
- [ ] Statics exist in 9:16, 4:5 and 1:1 with headline space
- [ ] Files are named like `KESAR_DIWALI_GLOW_V01_STATIC_4x5_v01.png`

## Common mistakes
- Pasting the prompt without uploading the product photo first, so the AI invents a new bottle.
- Asking for headlines inside the image. AI text breaks; add text in editing.
- Changing the light, set and angle all at once, so you can't tell what fixed or broke the image.
