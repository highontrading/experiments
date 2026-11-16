// M03 · Meta ad cut from T03 "The Product Shoot" (9:16, music only, shows price).
window.AD = metaCut({
  slug: "meta-ai-product-shoot", tag: "AI PRODUCT SHOOTS",
  music: { file: "build/music_el/tr_product.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  hook: { s: "drop", rows: [[["No studio", "B"]], [["shot this.", "S"]]], y: 1380 },
  shots: [{ s: "lime", d: 1.7, rows: [[["Splash.", "S", 1.4]]], y: 1440 }, { s: "falls", d: 1.7, rows: [[["Mist.", "S", 1.4]]], y: 1440 },
    { s: "belt", d: 1.7, rows: [[["Build.", "S", 1.4]]], y: 1440 }, { s: "beach", d: 1.7, rows: [[["Ride.", "S", 1.4]]], y: 1440 }],
  cta: { s: "latte", rows: [[["Your product.", "B", 0.8]], [["Any world.", "S"]]], price: true, bullets: ["From one product photo", "Liquid, light & CGI sets", "Every ratio for Meta"] },
});
