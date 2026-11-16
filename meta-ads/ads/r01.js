// R01 · "NOBODY TELLS YOU THIS" — editorial paper collage (style ref 1). White grain paper, faint grid, corner marks,
// mono labels, barcode footer; B&W cut-out footage cards; captions mix Great Vibes script + Inter Tight bold + serif italic.
// Music r01 (dark luxury hip-hop, 89 BPM); every scene change lands on a bar.
const B = 0.6707, Z = 0.72, bar = (n) => Z + n * 4 * B;
const S = [0, bar(1) + 2 * B, bar(3), bar(4) + 2 * B, bar(6), bar(7) + 2 * B, bar(9), bar(11), bar(13), bar(15) + 0.4];
const T_END = S[9];
const INK = "#121212", MID = "#6b6b6b";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "nobody-tells-you-this",
  seqs: ["storm", "ny_strut", "can_spin", "luna", "ugc_hi", "cheetah", "belt", "falls", "surf", "plane"],
  music: { file: "build/music_el/r01.mp3", offset: 0, gain: -5, fadeOut: 1.0 },
  sfx: [["hit_big", Z, -10], ...S.slice(1, 9).map((s) => ["hit_punch", s, -9]), ["swoosh_fast", S[2] - 0.15, -12], ["paper_slide", S[1] + 0.1, -12], ["paper_slide", S[6] + 0.1, -12],
        ["rev_swell", S[7] - 1.4, -12], ["camera_flash", S[3] + 0.6, -14], ["typing_fast", S[8] + 0.6, -16], ["hit_big", T_END, -8]],
  paper(t, dark) {
    if (dark) { bg("#0a0a0a"); } else { tex("paperW"); }
    g.strokeStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)"; g.lineWidth = 1.2 * u; g.beginPath();
    for (let x = 60 * u; x < W; x += 80 * u) { g.moveTo(x, 0); g.lineTo(x, H); } for (let y = 40 * u; y < H; y += 80 * u) { g.moveTo(0, y); g.lineTo(W, y); } g.stroke();
    const c = dark ? "#cfcfcf" : INK, m = dark ? "#8a8a8a" : MID;
    txt("AI & ADVERTISING", 70 * u, 160 * u, { size: 22 * u, fam: F.mono, weight: 700, color: c, align: "left", ls: 2 });
    txt("IDEABRO STUDIO — FIELD NOTES", 70 * u, 192 * u, { size: 16 * u, fam: F.mono, color: m, align: "left", ls: 1 });
    txt(`000${Math.min(9, 1 + S.filter((s) => t >= s).length - 1)}`, W - 70 * u, 160 * u, { size: 26 * u, fam: F.serif, style: "italic", weight: 400, color: c, align: "right" });
    [[60, 260], [W / u - 60, 260], [60, 1560], [W / u - 60, 1560]].forEach(([x, y]) => { g.strokeStyle = c; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(x * u - 12 * u, y * u); g.lineTo(x * u + 12 * u, y * u); g.moveTo(x * u, y * u - 12 * u); g.lineTo(x * u, y * u + 12 * u); g.stroke(); });
    // footer strip
    g.strokeStyle = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.5)"; g.lineWidth = 1.5 * u; g.strokeRect(70 * u, 1620 * u, W - 140 * u, 120 * u);
    g.fillStyle = dark ? "#1b3cff" : "#1b3cff"; g.fillRect(90 * u, 1640 * u, 90 * u, 30 * u); txt("2026", 135 * u, 1656 * u, { size: 18 * u, fam: F.mono, weight: 700, color: "#fff" });
    barcode(200 * u, 1640 * u, 300 * u, 80 * u, 3, c); txt("NO SHOOT REQUIRED", 540 * u, 1650 * u, { size: 16 * u, fam: F.mono, weight: 700, color: c, align: "left" });
    txt("41 LESSONS · 11 MODULES", 540 * u, 1680 * u, { size: 16 * u, fam: F.mono, color: m, align: "left" }); txt("✕ ⊞ ◎", W - 100 * u, 1680 * u, { size: 26 * u, color: c, align: "right" });
  },
  card(src, t, t0, x, y, w, h, o = {}) {   // B&W photo card sliding in
    const p = oX(clamp((t - t0 - (o.delay || 0)) / 0.5)); if (p <= 0) return; const dy = (1 - p) * 120 * u;
    vcard(seq(src, t, t0), x, y + dy, w, h, { filter: o.color ? "contrast(1.08)" : "grayscale(1) contrast(1.3) brightness(1.05)", border: o.border || "#111", bw: 8 * u, shadow: 50, rot: o.rot || 0, z: o.z || 1.06, ax: o.ax, ay: o.ay });
  },
  script(s, x, y, size, t, t0, o = {}) { const p = clamp((t - t0) / (o.dur || 0.6)); if (p <= 0) return; font(size, 400, F.vibes); const w = tw(s);
    const al = o.align || "center", x0 = al === "center" ? x - w / 2 : al === "right" ? x - w : x; g.save(); g.beginPath(); g.rect(x0 - 20 * u, y - size, (w + 40 * u) * oC(p), size * 2); g.clip();
    txt(s, x, y, { size, fam: F.vibes, weight: 400, color: o.color || INK, align: al }); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#f2f0ec", fg: INK, titleFam: F.dms, titleStyle: "italic", titleWeight: 400, titleSize: 120, title: "AI & Advertising", sub: "BY IDEABRO STUDIO", cta: "Join now  →" }); grain(t, 0.05); return; }
    const k = cutIdx(t, S.slice(0, 9)), t0 = S[k];
    if (k === 0) {   // NOBODY tells you this.
      this.paper(t, true); const im = seq("storm", t, 0); g.save(); g.globalAlpha = 0.55; vcard(im, 70 * u, 300 * u, W - 140 * u, 1240 * u, { filter: "grayscale(1) brightness(0.55) contrast(1.3)", shadow: false }); g.restore();
      blurWord("NOBODY", CX, 820 * u, 200 * u, t, Z, { fam: F.dms, weight: 400, from: 1.25 }); txt("NOBODY", CX + 4 * u, 824 * u, { size: 200 * u, fam: F.dms, weight: 400, color: "rgba(255,255,255,0.12)", alpha: clamp((t - Z) / 0.4) });
      blurWord("tells you this.", CX, 960 * u, 64 * u, t, Z + 2 * B, { fam: F.tight, weight: 500, color: "#d9d9d9" });
    } else if (k === 1) {   // the best ads were never shot
      this.paper(t); txt("2026", W - 140 * u, 330 * u, { size: 28 * u, fam: F.mono, weight: 700, color: INK, align: "right", alpha: oC(prog(t, t0, t0 + 0.3)) });
      blurWord("The best ads", 110 * u, 400 * u, 92 * u, t, t0 + 0.05, { align: "left", fam: F.tight, color: INK, from: 1.1 });
      blurWord("of 2026", 110 * u, 500 * u, 92 * u, t, t0 + 0.25, { align: "left", fam: F.dms, weight: 400, style: "italic", color: INK, from: 1.1 });
      this.card("ny_strut", t, t0, 140 * u, 610 * u, 800 * u, 760 * u, { ay: 0.3 });
      this.script("were never", W - 120 * u, 1440 * u, 96 * u, t, t0 + 1.4, { align: "right" }); blurWord("shot.", W - 120 * u, 1530 * u, 84 * u, t, t0 + 2.1, { align: "right", fam: F.tight, color: INK });
    } else if (k === 2) {   // budgets didn't stop them. AI sharpened them.
      this.paper(t); this.script("Budgets", CX, 560 * u, 150 * u, t, t0 + 0.05); blurWord("didn't stop them.", CX, 680 * u, 60 * u, t, t0 + 0.6, { fam: F.tight, weight: 500, color: INK });
      const p = oX(clamp((t - t0 - 1.2) / 0.5)); if (p > 0) vcard(seq("can_spin", t, t0 + 1.2), lerp(-700 * u, 160 * u, p), 780 * u, 760 * u, 420 * u, { filter: "grayscale(1) contrast(1.3)", border: "#111", bw: 6 * u, rot: -0.05 * (1 - p) });
      blurWord("AI", 210 * u, 1330 * u, 96 * u, t, t0 + 1.8, { align: "left", fam: F.tight, color: INK }); this.script("sharpened", 360 * u, 1340 * u, 120 * u, t, t0 + 2.0, { align: "left" }); blurWord("them.", W - 150 * u, 1440 * u, 54 * u, t, t0 + 2.6, { align: "right", fam: F.tight, weight: 500, color: INK });
    } else if (k >= 3 && k <= 5) {   // PRODUCT / UGC / FILMS taught them ...
      this.paper(t); const D = [["PRODUCT", "precision", "luna", 0.5, 0.5], ["UGC", "speed", "ugc_hi", 0.5, 0.3], ["FILMS", "storytelling", "cheetah", 0.5, 0.5]][k - 3];
      blurWord(D[0], 110 * u, 400 * u, 120 * u, t, t0 + 0.05, { align: "left", fam: F.tight, color: INK, from: 1.15 });
      font(120 * u, 800, F.tight); const wx = 110 * u + tw(D[0]) + 24 * u; blurWord("taught them", wx, 390 * u, 32 * u, t, t0 + 0.35, { align: "left", fam: F.tight, weight: 500, color: MID });
      this.script(D[1], wx + 10 * u, 480 * u, 100 * u, t, t0 + 0.6, { align: "left" });
      // circle diagram + card
      const cp = oC(prog(t, t0 + 0.2, t0 + 1.0)); g.save(); g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2 * u; g.beginPath(); g.arc(CX, 1010 * u, 400 * u * cp, 0, 7); g.stroke();
      g.setLineDash([8 * u, 10 * u]); g.beginPath(); g.arc(CX, 1010 * u, 455 * u * cp, -1.2, -1.2 + 6 * cp); g.stroke(); g.restore();
      this.card(D[2], t, t0, CX - 300 * u, 690 * u, 600 * u, 640 * u, { color: k === 4 && t > t0 + 1.6, ax: D[3], ay: D[4], rot: k === 4 ? 0.02 : -0.02 });
      txt(`FIG. 0${k - 2}  —  AI ${D[0]}`, CX, 1440 * u, { size: 20 * u, fam: F.mono, weight: 700, color: INK, alpha: oC(prog(t, t0 + 1.0, t0 + 1.3)), ls: 3 });
    } else if (k === 6) {   // two spec cards (ref: Apple / iPhone cards)
      bg("#0d0d0d"); const ct = [["AI & ADVERTISING", "011", "MODULES", "belt"], ["PRODUCT SHOOT", "004", "NO STUDIO", "falls"]];
      ct.forEach(([a, n, b2, src], i) => { const p = oX(clamp((t - t0 - i * 0.25) / 0.5)), x = 90 * u, y = (i ? 1000 : 300) * u + (1 - p) * 200 * u, w = W - 180 * u, h = 640 * u;
        g.save(); g.globalAlpha = clamp(p * 2); g.fillStyle = "#efe9dc"; rr(x, y, w, h, 26 * u); g.fill(); g.fillStyle = "#ff5a1f"; rr(x + 30 * u, y + 30 * u, 70 * u, 70 * u, 14 * u); g.fill();
        txt(a, x + 120 * u, y + 66 * u, { size: 50 * u, fam: F.tight, weight: 800, color: INK, align: "left" });
        txt(n, x + 30 * u, y + 180 * u, { size: 130 * u, fam: F.tight, weight: 800, color: INK, align: "left" }); barcode(x + 380 * u, y + 130 * u, 300 * u, 80 * u, i + 5, INK);
        txt(b2, x + 380 * u, y + 240 * u, { size: 26 * u, fam: F.mono, weight: 700, color: INK, align: "left", ls: 3 });
        vcard(seq(i ? (t - t0 < 2.6 ? "falls" : "surf") : "belt", t, t0), x + 30 * u, y + 290 * u, w - 60 * u, h - 320 * u, { r: 18 * u, shadow: false, z: 1.05 }); g.restore(); });
    } else if (k === 7) {   // black interlude, handwritten
      bg("#050505"); const im = seq("plane", t, t0); vcard(im, 240 * u, 520 * u, 600 * u, 340 * u, { filter: "contrast(1.1)", shadow: false });
      const L2 = [["Sometimes", 0.2], ["the shoot", 0.8], ["is the thing", 1.5], ["slowing you down.", 2.2]];
      L2.forEach(([s, d], i) => i % 2 ? blurWord(s, CX + (i === 3 ? 60 : -40) * u, (980 + i * 90) * u, 52 * u, t, t0 + d, { fam: F.tight, weight: 500, color: "#d6d6d6" }) : this.script(s, CX + (i ? 40 : -60) * u, (980 + i * 90) * u, 92 * u, t, t0 + d, { color: "#f2f2f2" }));
    } else if (k === 8) {   // the course document
      this.paper(t); txt("THE COURSE", CX, 380 * u, { size: 28 * u, fam: F.mono, weight: 700, color: INK, ls: 8, alpha: oC(prog(t, t0, t0 + 0.3)) });
      blurWord("“AI & ADVERTISING”", CX, 470 * u, 70 * u, t, t0 + 0.15, { fam: F.tight, color: INK, from: 1.2 });
      for (let i = 2; i >= 0; i--) { const p = oX(clamp((t - t0 - 0.3 - (2 - i) * 0.15) / 0.5)); g.save(); g.translate(CX, 1000 * u + (1 - p) * 300 * u); g.rotate((i - 1) * 0.06 * p); g.globalAlpha = clamp(p * 2);
        g.fillStyle = "#fbfaf7"; g.shadowColor = "rgba(0,0,0,0.25)"; g.shadowBlur = 40 * u; g.fillRect(-300 * u, -380 * u, 600 * u, 760 * u); g.shadowBlur = 0; g.restore(); }
      const dp = oC(prog(t, t0 + 0.7, t0 + 1.1)); g.save(); g.globalAlpha = dp;
      txt("The Masterplan", CX - 250 * u, 700 * u, { size: 50 * u, fam: F.tight, weight: 800, color: INK, align: "left" }); txt("for AI-made advertising", CX - 250 * u, 750 * u, { size: 28 * u, fam: F.dms, style: "italic", weight: 400, color: MID, align: "left" });
      ["01  Strategy & briefs", "02  AI product shoots", "03  Models & sets", "04  AI video ads", "05  Voice & music", "06  AI UGC", "07  AI films", "08  Meta ads"].forEach((s, i) => {
        const q = oC(prog(t, t0 + 1.0 + i * 0.12, t0 + 1.3 + i * 0.12)); txt(s, CX - 250 * u, (830 + i * 58) * u, { size: 30 * u, fam: F.mono, weight: 400, color: INK, align: "left", alpha: q });
        g.fillStyle = `rgba(0,0,0,${0.08 * q})`; g.fillRect(CX - 250 * u, (850 + i * 58) * u, 500 * u, 2 * u); });
      g.restore(); this.script("join the next batch", CX, 1480 * u, 72 * u, t, t0 + 2.4);
    }
    grain(t, k === 0 || k === 7 ? 0.09 : 0.05);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[6], kicker: "AI & ADVERTISING", h1: "The best ads", h2: "aren't shot.", accent: "#ff5a1f", btn: "#ff5a1f", glow: "rgba(255,90,31,0.5)", end: { bg: "#f2f0ec", fg: INK, titleFam: F.dms, titleStyle: "italic", titleWeight: 400, titleSize: 120, title: "AI & Advertising" } });
