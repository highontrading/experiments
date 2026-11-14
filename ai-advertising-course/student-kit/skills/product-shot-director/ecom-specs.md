# E-commerce listing image set (reference for product-shot-director)

Marketplace rules change. **Check the seller help pages of Amazon / Flipkart / Meesho / your
Shopify theme on the day you upload.** The set below is a safe, common structure.

| # | Image | Ratio / size | Notes |
|---|---|---|---|
| 1 | Main image | 1:1, 2000x2000 px | Pure white background (#FFFFFF), product fills ~85% of frame, no text, no props, no logos added, real product only. |
| 2 | 3/4 angle | 1:1 | White or light grey, shows depth and cap/closure. |
| 3 | Scale / in-hand | 1:1 | Product in a hand or next to a common object so size is clear. |
| 4 | Infographic | 1:1 | Product + 3–4 short benefit call-outs (add text in Canva/edit, not in the AI prompt). |
| 5 | Ingredients / material close-up | 1:1 | Macro of texture, fabric weave, ingredient. |
| 6 | Lifestyle in use | 1:1 or 4:5 | Real setting, person using it. |
| 7 | What's in the box / variants | 1:1 | All sizes or shades, true colours. |

Main image prompt template:
```
E-commerce main image of <PRODUCT> on a pure white #FFFFFF seamless background.
PRODUCT LOCK: exact product from the reference image — same label text, logo, shape, colours and size; do not redesign.
Light: even soft studio light from both sides, very soft natural shadow under the product only.
Camera: 100mm, straight-on at product height, f/11, everything sharp.
Format: 1:1 square, product centred, filling about 85% of the frame.
Avoid: props, text, watermarks, gradients, coloured background, reflections that hide the label.
```

Infographic base prompt (text added later):
```
Clean product infographic base: <PRODUCT> on the right half of the frame on a soft cream background, empty space on the left half for 4 text call-outs.
PRODUCT LOCK: exact product from the reference image — same label, logo, shape, colours.
Light: soft studio light. Format: 1:1. Avoid: any text, icons or letters in the image.
```
