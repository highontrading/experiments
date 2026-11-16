// M05 · Meta ad cut from T05 "AI Films" (9:16, music only, shows price).
window.AD = metaCut({
  slug: "meta-ai-films", tag: "AI FILMS",
  music: { file: "build/music_el/tr_film.mp3", offset: 14, gain: -8, fadeOut: 1.0 },
  hook: { s: "storm", rows: [[["None of this", "S"]], [["was filmed.", "B"]]], y: 1380 },
  shots: [{ s: "window", d: 1.7, rows: [[["no", "S"], ["location.", "B"]]], y: 1440 }, { s: "leopard", d: 1.7, rows: [[["no", "S"], ["wildlife crew.", "B", 0.85]]], y: 1440 },
    { s: "tree", d: 1.7, rows: [[["no", "S"], ["permits.", "B"]]], y: 1440 }, { s: "sunset", d: 1.7, rows: [[["just", "S"], ["direction.", "B"]]], y: 1440 }],
  cta: { s: "earth", rows: [[["Direct your", "S"]], [["first AI film.", "B"]]], price: true, bullets: ["Story, shots & storyboards", "Image-to-video, voice, music", "Film-grade finishing"] },
});
