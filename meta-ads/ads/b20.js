// B20 · "For the ones who direct" (English VO Brian, 9:16). A slow cinematic manifesto over AI footage.
// Captions: letter-spaced white Inter caps, one full line at a time, dead centre.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const CUTS = [[0, "storm"], [L[1].at - 0.1, "zep"], [L[2].at - 0.1, "window"], [Wd(2, 4) - 0.05, "leopard"], [Wd(2, 6) - 0.05, "tree"], [L[3].at - 0.1, "sea"], [L[4].at - 0.1, "earth"]];
const T_END = L[4].v1 + 1.0;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.8, slug: "for-the-ones-who-direct",
  seqs: ["storm", "zep", "window", "leopard", "tree", "sea", "earth"],
  music: { file: "build/music_el/epic.mp3", offset: 2, gain: -9, duck: -5, fadeOut: 1.0 },
  sfx: [["boom", 0.2, -12], ["whoosh", L[3].at - 0.2, -14], ["riser", L[4].at - 1.6, -14], ["boom", L[4].at, -10], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#050505", fg: "#fff", titleStyle: "italic", cta: "Take your turn  →" }); grain(t, 0.05); return; }
    bg("#000");
    const k = cutIdx(t, CUTS.map((c) => c[0])), t0 = CUTS[k][0], t1 = k + 1 < CUTS.length ? CUTS[k + 1][0] : T_END;
    g.save(); g.globalAlpha = k ? oC(prog(t, t0, t0 + 0.3)) : oC(prog(t, 0, 0.6)); g.filter = "contrast(1.08) saturate(0.9)"; kb(seq(CUTS[k][1], t, t0), t, t0, t1 - t0, 1.05, 1.12); g.restore();
    g.fillStyle = "rgba(0,0,0,0.38)"; g.fillRect(0, 0, W, H); vignette(0.7);
    // letterbox
    g.fillStyle = "#000"; g.fillRect(0, 0, W, 150 * u); g.fillRect(0, H - 150 * u, W, 150 * u);
    // current line, whole, letter-spaced
    let li = -1; L.forEach((l, i) => { if (t >= l.words[0].s - 0.15) li = i; });
    if (li >= 0) { const l = L[li], end = li + 1 < L.length ? L[li + 1].words[0].s - 0.25 : T_END; const a = Math.min(oC(prog(t, l.words[0].s - 0.15, l.words[0].s + 0.35)), 1 - prog(t, end - 0.25, end));
      capText(l.cap.toUpperCase(), CY, a, prog(t, l.words[0].s - 0.15, l.words[0].s + 0.5), { size: 50 * u, weight: 600, ls: 12, lh: 1.6, maxW: W * 0.8, rise: 0.2, shadow: 20, shadowColor: "rgba(0,0,0,0.7)" }); }
    grain(t, 0.07);
  },
};
