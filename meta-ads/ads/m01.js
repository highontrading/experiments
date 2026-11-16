// M01 · Meta ad cut from T01 "The Future of Advertising" (9:16, music only, shows price). Hook → 5 proof shots → CTA with Join button.
window.AD = metaCut({
  slug: "meta-future-of-advertising", tag: "THE FUTURE OF ADS",
  music: { file: "build/music_el/tr_future.mp3", offset: 0, gain: -7, fadeOut: 1.0 },
  hook: { s: "tube", rows: [[["The future of", "S"]], [["advertising", "B"]], [["is already here.", "S"]]], y: 1320 },
  shots: [{ s: "giant", d: 1.8, rows: [[["giants", "B"], ["on Main St.", "S"]]], y: 1440 }, { s: "plane", d: 1.8, rows: [[["launches,", "B"], ["mid-air.", "S"]]], y: 1440 },
    { s: "phone", d: 1.8, rows: [[["stores", "B"], ["that float.", "S"]]], y: 1440 }, { s: "surf", d: 1.8, rows: [[["zero", "S"], ["shoots.", "B"]]], y: 1440 }],
  cta: { s: "island", rows: [[["Learn to", "S"]], [["make this.", "B"]]], price: true, bullets: ["AI product shoots & CGI ads", "AI UGC, films & video ads", "Meta ads that convert"] },
});
