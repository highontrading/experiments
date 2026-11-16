// M04 · Meta ad cut from T04 "AI Fashion Film" (9:16, music only).
window.AD = metaCut({
  slug: "meta-ai-fashion-film", tag: "AI FASHION FILMS",
  music: { file: "build/music_el/tr_fashion.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  hook: { s: "soho", rows: [[["this fashion film", "B", 0.75]], [["was never shot.", "S"]]], y: 1340 },
  shots: [{ s: "office", d: 1.7, rows: [[["a corner office,", "S"]], [["no set.", "B"]]], y: 1380 }, { s: "car", d: 1.7, rows: [[["a ride home,", "S"]], [["no car.", "B"]]], y: 1380 },
    { s: "sky2", d: 1.7, rows: [[["a skyline,", "S"]], [["no flight.", "B"]]], y: 1380 }, { s: "golden", d: 1.7, rows: [[["golden hour,", "S"]], [["on demand.", "B"]]], y: 1380 }],
  cta: { s: "train", rows: [[["direct", "S"], ["your own", "B", 0.8]], [["fashion film.", "B", 0.8]]], price: false, bullets: ["Consistent models & looks", "Cinematic light & camera", "Lookbooks to campaign films"] },
});
