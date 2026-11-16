// T01 · TRAILER "The Future of Advertising" (English VO Brian, 9:16). Beat-cut montage of CGI billboards, giants and
// impossible product worlds (all AI), one shot per source. Captions: editorial cover lines — bold cream Poppins mixed
// with white DM Serif italic — set in the shot's empty space, plus hand-drawn arrows that point at what isn't real.
const L = window.TL.lines, BD = 0.5343, T0 = 0.1;
const SH = ["earth", "tube", "bill", "glasses", "giant", "legs", "plane", "phone", "float", "sky", "surf", "bags"].map((s) => ({ s, d: BD * 4, z0: 1.02, z1: 1.09 }));
SH[0].ax = 0.5; SH[5].d = BD * 3.2;
const T_TITLE = T0 + SH.reduce((a, s) => a + s.d, 0), T_END = T_TITLE + 3.6;
const CAPS = [  // [line, rows, y, align, arrow?]
  [0, [[["Advertising", "B"]], [["just", "S"], ["changed.", "B"]]], 300, "left"],
  [1, [[["Billboards", "B"]], [["that bend", "S"], ["physics.", "B"]]], 1340, "left", [700, 1250, 610, 820, "not real"]],
  [2, [[["Campaigns", "B"]], [["without a", "S"], ["single shoot.", "B", 0.8]]], 1380, "left"],
  [3, [[["Whole worlds,", "B"]], [["built from", "S"], ["words.", "B"]]], 280, "left"],
  [4, [[["This is the", "S"], ["future", "B"]], [["of advertising.", "B", 0.9]]], 1380, "left"],
  [5, [[["And you can", "S"]], [["learn", "B"], ["to make it.", "S"]]], 300, "left"],
];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "trailer-future-of-advertising",
  seqs: [...SH.map((s) => s.s), "island"],
  music: { file: "build/music_el/tr_future.mp3", offset: 0, gain: -8, duck: -6, fadeOut: 1.2 },
  sfx: [["whoosh", T_TITLE - 0.3, -10], ["boom", T_TITLE, -8], ["shimmer", T_TITLE + 0.2, -14]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", titleFam: F.dms, titleStyle: "italic", cta: "Join the course  →" }); grain(t, 0.05); return; }
    bg("#000");
    if (t < T_TITLE) {
      drawShot(t, SH, T0); shade(0, H * 0.32, 0.5, true); shade(H * 0.62, H, 0.6);
      CAPS.forEach(([li, rows, y, align, ar]) => { const l = L[li], end = li + 1 < L.length ? L[li + 1].at - 0.3 : T_TITLE - 0.1;
        edCap(t, l.words[0].s - 0.1, end, rows, { y: y * u, x: 80 * u, align, size: 104 * u });
        if (ar && t < end) { const p = clamp((t - l.words[0].s - 0.5) / 0.6); handArrow(ar[0] * u, ar[1] * u, ar[2] * u, ar[3] * u, p, CREAM, -0.35);
          if (p > 0.6) txt(ar[4], ar[0] * u + 20 * u, ar[1] * u + 50 * u, { size: 64 * u, fam: F.hand, weight: 700, color: CREAM, align: "left", alpha: Math.min(1, (p - 0.6) * 3) * clamp((end - t) / 0.25), shadow: 12 }); } });
      txt("MADE WITH AI", W - 70 * u, 230 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", align: "right", alpha: 0.85, ls: 4, shadow: 10 });
    } else {   // title over the floating island
      kb(seq("island", t, T_TITLE - 0.5), t, T_TITLE, 4, 1.04, 1.12); shade(H * 0.45, H, 0.85 * oC(prog(t, T_TITLE, T_TITLE + 0.6)));
      edCap(t, T_TITLE + 0.15, T_END, [[["AI &", "B"]], [["Advertising", "S"]]], { y: 1250 * u, x: CX, align: "center", size: 170 * u });
      edCap(t, T_TITLE + 0.9, T_END, [[["THE FUTURE OF ADS, TAUGHT BY IDEABRO STUDIO", "M", 0.2]]], { y: 1460 * u, x: CX, align: "center", size: 130 * u, ls: 3 });
    }
    filmGrade(t, 0.06);
  },
};
