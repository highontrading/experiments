// A02 · "The old way / The AI way" (English, 4:5 feed, no VO). Editorial ledger on the site's cream grid.
// Each row: the old way gets struck through, the AI way gets a lime highlighter and a thumbnail of real AI work.
const ROWS = [
  ["Product photos", "Book a studio, photographer and stylist", "Generate scenes from one product photo", "shoe"],
  ["Models", "Cast, book and pay per day", "Consistent AI models you direct", "look"],
  ["Video ads", "Crew, location, edit suite", "Image-to-video, voiceover, edit", "car"],
  ["Music", "License a track or hire a composer", "Generate a jingle that fits the brand", "juice"],
  ["Turnaround", "Days to weeks", "The same day", "ring"],
  ["New variations", "Another shoot", "Another prompt", "shoe2"],
];
const R0 = 1.6, STEP = 1.45, T_END = R0 + ROWS.length * STEP + 1.0;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "old-way-vs-ai-way",
  images: { shoe: "assets/img/site/i35.jpg", look: "assets/img/site/i00.jpg", car: "assets/img/site/i13.jpg", juice: "assets/img/site/i39.jpg",
            ring: "assets/img/site/i18.jpg", shoe2: "assets/img/site/i33.jpg" },
  music: { file: "build/music/1167.mp3", offset: 0, gain: -12, fadeOut: 1.0 },
  sfx: ROWS.flatMap((_, i) => [["pencil", R0 + i * STEP + 0.55, -10], ["pop", R0 + i * STEP + 0.85, -14]]).concat([["whoosh", T_END - 0.15, -10]]),
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a" }); grain(t, 0.04); return; }
    gridBg();
    const hp = oC(prog(t, 0.1, 0.6));
    txt("The shoot is", CX, 120 * u - (1 - hp) * 20 * u, { size: 92 * u, weight: 400, fam: F.serif, color: C.ink, alpha: hp });
    // "optional now." with lime highlighter
    font(92 * u, 400, F.serif, "italic"); const ow = tw("optional now."), hx = CX - ow / 2 - 14 * u;
    g.fillStyle = C.lime; g.fillRect(hx, 168 * u, (ow + 28 * u) * oC(prog(t, 0.45, 0.9)), 96 * u);
    txt("optional now.", CX, 218 * u, { size: 92 * u, weight: 400, fam: F.serif, style: "italic", color: C.ink, alpha: hp });
    const top = 320 * u, colL = 70 * u, colM = 300 * u, colR = 640 * u, rowH = 150 * u;
    const lp = oC(prog(t, 0.6, 1.1));
    g.globalAlpha = lp;
    txt("THE OLD WAY", colM, top, { size: 26 * u, weight: 700, fam: F.mono, color: "#8a8a8a", align: "left" });
    txt("THE AI WAY", colR, top, { size: 26 * u, weight: 700, fam: F.mono, color: C.ink, align: "left" });
    g.globalAlpha = 1;
    ROWS.forEach(([label, old, ai, im], i) => {
      const st = R0 + i * STEP; if (t < st) return;
      const y = top + 50 * u + i * rowH, p = oC(clamp((t - st) / 0.35));
      g.save(); g.globalAlpha = p; g.translate(0, (1 - p) * 20 * u);
      g.strokeStyle = C.ink; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(colL, y); g.lineTo(W - colL, y); g.stroke();
      txt(label, colL, y + 44 * u, { size: 30 * u, weight: 700, fam: F.inter, color: C.ink, align: "left" });
      font(28 * u, 400, F.mono); const ol = wrap(old, colR - colM - 40 * u);
      ol.forEach((ln, k) => txt(ln, colM, y + 44 * u + k * 36 * u, { size: 28 * u, weight: 400, fam: F.mono, color: "#6d6d6d", align: "left" }));
      // strike-through old
      const sp = prog(t, st + 0.5, st + 0.75);
      ol.forEach((ln, k) => { font(28 * u, 400, F.mono); const lw = tw(ln); g.strokeStyle = "#d33"; g.lineWidth = 3.5 * u; g.beginPath(); g.moveTo(colM - 4 * u, y + 46 * u + k * 36 * u); g.lineTo(colM - 4 * u + (lw + 8 * u) * sp, y + 44 * u + k * 36 * u); g.stroke(); });
      // AI way with highlighter
      font(30 * u, 700, F.inter); const al = wrap(ai, W - colL - colR - 120 * u); const hp2 = oC(prog(t, st + 0.8, st + 1.1));
      al.forEach((ln, k) => { const lw = tw(ln); g.fillStyle = C.lime; g.fillRect(colR - 8 * u, y + 24 * u + k * 40 * u, (lw + 16 * u) * hp2, 40 * u); txt(ln, colR, y + 44 * u + k * 40 * u, { size: 30 * u, weight: 700, color: C.ink, align: "left" }); });
      // thumbnail of real AI work
      const tp = oB(clamp((t - st - 0.85) / 0.3)); if (tp > 0) { const s = 96 * u * tp; g.save(); g.translate(W - colL - 50 * u, y + 62 * u); g.rotate(0.05 * (i % 2 ? 1 : -1));
        g.fillStyle = C.lav; g.fillRect(-s / 2 + 5 * u, -s / 2 + 5 * u, s, s); g.beginPath(); g.rect(-s / 2, -s / 2, s, s); g.save(); g.clip(); cover(IM[im], -s / 2, -s / 2, s, s); g.restore(); g.strokeStyle = C.ink; g.lineWidth = 2.5 * u; g.strokeRect(-s / 2, -s / 2, s, s); g.restore(); }
      g.restore();
    });
    const fp = oC(prog(t, T_END - 1.2, T_END - 0.7));
    txt("Every frame on the right was made with AI.", CX, H - 90 * u, { size: 26 * u, weight: 400, fam: F.mono, color: C.ink, alpha: fp });
    grain(t, 0.04);
  },
};
