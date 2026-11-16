// T02 · TRAILER "AI UGC" (English, 9:16, music only). Native-feeling creator content — selfie reviews, OOTDs,
// GRWMs, unboxings — every creator AI-generated, one shot per source, cut on the beat.
// Captions: lowercase cream Poppins cover lines with white serif italic accents, plus handwritten Caveat callouts and
// arrows pointing at the "creator" (the reference style: "Who am I trying to impress? → HER").
const BD = 0.5106, T0 = 0.0;
const SH = [["selfie", 5.7], ["serum", 4], ["ootd", 4], ["skate", 4], ["floor", 4], ["grwm", 2], ["unbox", 4], ["bridge", 3.2], ["skin", 3.3], ["walk", 4], ["fit", 5]].map(([s, b]) => ({ s, d: BD * b, z0: 1.0, z1: 1.06 }));
SH[1].ay = 0.3; SH[4].ay = 0.4;
const T_TITLE = T0 + SH.reduce((a, s) => a + s.d, 0), T_END = T_TITLE + 3.4;
const CAP = [  // per shot: rows, y, [arrow x1,y1,x2,y2,label]
  [[[["she's reviewing", "B"]], [["collagen.", "S"]]], 290, [640, 600, 520, 760, "not a real person"]],
  [[[["so is", "B"]], [["she.", "S", 1.2]]], 290, [720, 470, 600, 640, "AI"]],
  [[[["the OOTD?", "B"]], [["generated.", "S"]]], 290],
  [[[["no location", "B"]], [["fee.", "S", 1.2]]], 1380],
  [[[["no wardrobe", "B"]], [["budget.", "S", 1.2]]], 290],
  [[[["GRWM", "Y", 1.6]]], 1380],
  [[[["unboxing,", "B"]], [["without shipping.", "S"]]], 1380],
  [[[["no casting", "B"]], [["call.", "S", 1.2]]], 290],
  [[[["real-looking skin.", "B", 0.8]], [["not a real face.", "S", 0.9]]], 1420],
  [[[["this is", "S"], ["AI UGC.", "B"]]], 290],
  [[[["and it feels", "S"]], [["native", "B"], ["to the feed.", "S"]]], 1380],
];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "trailer-ai-ugc",
  seqs: SH.map((s) => s.s),
  music: { file: "build/music_el/tr_ugc.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  sfx: [["pop", 0.3, -14], ["whoosh", T_TITLE - 0.2, -10], ["sub", T_TITLE, -10]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#111", fg: "#fff", titleFam: F.dms, titleStyle: "italic", cta: "Learn AI UGC  →" }); grain(t, 0.05); return; }
    bg("#000");
    if (t < T_TITLE) {
      const { k, t0, sh } = drawShot(t, SH, T0, { punch: 0.04 }); shade(0, H * 0.3, 0.5, true); shade(H * 0.62, H, 0.55);
      const [rows, y, ar] = CAP[k]; edCap(t, t0 + 0.05, t0 + sh.d - 0.05, rows, { y: y * u, x: 80 * u, size: 100 * u });
      if (ar) { const p = clamp((t - t0 - 0.6) / 0.5); handArrow(ar[0] * u, ar[1] * u, ar[2] * u, ar[3] * u, p, CREAM, 0.3);
        if (p > 0.5) txt(ar[4], ar[0] * u - (ar[4].length > 3 ? 120 : 0) * u, ar[1] * u - 50 * u, { size: (ar[4].length > 3 ? 66 : 120) * u, fam: F.hand, weight: 700, color: CREAM, align: "left", alpha: clamp((p - 0.5) * 3), shadow: 12 }); }
      // creator-style chrome: a small AI tag + progress dots
      g.fillStyle = "rgba(0,0,0,0.45)"; rr(W - 250 * u, 200 * u, 190 * u, 54 * u, 27 * u); g.fill(); txt("● AI CREATOR", W - 155 * u, 228 * u, { size: 22 * u, fam: F.mono, weight: 700, color: "#fff" });
    } else {
      kb(seq("fit", t, T_TITLE - SH[SH.length - 1].d), t, T_TITLE, 4, 1.06, 1.12); shade(H * 0.4, H, 0.9 * oC(prog(t, T_TITLE, T_TITLE + 0.5)));
      edCap(t, T_TITLE + 0.1, T_END, [[["learn", "S"], ["AI UGC", "B"]], [["in", "S"], ["AI & Advertising.", "B", 0.7]]], { y: 1180 * u, x: 80 * u, size: 120 * u });
    }
    filmGrade(t, 0.05);
  },
};
