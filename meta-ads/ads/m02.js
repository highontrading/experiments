// M02 · Meta ad cut from T02 "AI UGC" (9:16, music only). Hook with arrow → proof shots → CTA with Join button.
window.AD = metaCut({
  slug: "meta-ai-ugc", tag: "AI UGC",
  music: { file: "build/music_el/tr_ugc.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  hook: { s: "selfie", rows: [[["None of these", "B", 0.8]], [["creators", "S"], ["exist.", "B", 0.8]]], y: 300, arrow: [640, 600, 520, 760, "100% AI"] },
  shots: [{ s: "serum", d: 1.7, rows: [[["reviews,", "B"]], [["no samples.", "S"]]], y: 300, ay: 0.3 }, { s: "ootd", d: 1.7, rows: [[["OOTDs,", "B"]], [["no wardrobe.", "S"]]], y: 300 },
    { s: "skin", d: 1.7, rows: [[["skincare,", "B"]], [["no model fee.", "S"]]], y: 1420 }, { s: "walk", d: 1.7, rows: [[["street style,", "B"]], [["no location.", "S"]]], y: 300 }],
  cta: { s: "fit", rows: [[["Make", "S"], ["AI UGC", "B"]], [["that feels real.", "S"]]], price: false, bullets: ["Consistent AI creators", "Scripts, voice & lip-sync", "Ready for Reels & Meta"] },
});
