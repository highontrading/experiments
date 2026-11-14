// B01 · "This is AI." (English, 9:16, music only). A slow, luxurious reel of AI-made footage and stills, each
// labelled in one elegant line. Captions: white Instrument Serif, always the same size and spot (lower centre).
const CUTS = [  // [source, text, ax]
  ["beach", "This is AI.", 0.62], ["cafe", "So is this.", 0.55], ["tree", "And this.", 0.5], ["i22", "Every pore. Every ring.", 0.5],
  ["pond", "No location scout.", 0.5], ["cam", "No camera crew.", 0.5], ["i06", "No set builder.", 0.5], ["ferris", "No permits.", 0.5],
  ["desert", "Just direction.", 0.5], ["i21", "We'll teach you to make\nimages this real.", 0.5],
];
const D0 = 1.55, T_END = CUTS.length * D0 + 0.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.8, slug: "this-is-ai",
  images: { i22: "assets/img/site/i22.jpg", i06: "assets/img/site/i06.jpg", i21: "assets/img/site/i21.jpg" },
  seqs: ["beach", "cafe", "tree", "pond", "cam", "ferris", "desert"],
  music: { file: "build/music_el/ethereal.mp3", offset: 0, gain: -6, fadeOut: 1.2 },
  sfx: [["shimmer", 0.1, -16], ["whoosh", T_END - 0.15, -14]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d0c0b", fg: "#fff", titleStyle: "italic", cta: "Learn to direct AI  →" }); grain(t, 0.05); return; }
    const k = Math.min(CUTS.length - 1, Math.floor(t / D0)), t0 = k * D0, [src, text, ax] = CUTS[k];
    bg("#000");
    const dur = k === CUTS.length - 1 ? D0 + 0.6 : D0;
    g.save(); g.globalAlpha = k ? oC(prog(t, t0, t0 + 0.35)) : oC(prog(t, 0, 0.5));
    kb(SRC(src, t, t0), t, t0, dur, 1.03, 1.1, ax, 0.45); g.restore();
    // soft dark floor for the caption, same on every cut
    shade(H * 0.56, H, 0.62);
    const isLast = k === CUTS.length - 1, a = isLast ? oC(prog(t, t0 + 0.1, t0 + 0.6)) : Math.min(oC(prog(t, t0 + 0.12, t0 + 0.5)), 1 - prog(t, t0 + D0 - 0.18, t0 + D0));
    capText(text, H * 0.705, a, prog(t, t0 + 0.12, t0 + 0.6), { size: 92 * u, fam: F.serif, weight: 400, color: "#fff", lh: 1.08, shadow: 18, shadowColor: "rgba(0,0,0,0.55)", rise: 0.15 });
    // tiny label, consistent
    txt("MADE WITH AI  ·  NOT SHOT", CX, H * 0.705 + (isLast ? 150 : 95) * u, { size: 22 * u, fam: F.mono, weight: 400, color: "#fff", alpha: 0.7 * a, ls: 4 });
    grain(t, 0.05);
  },
};
