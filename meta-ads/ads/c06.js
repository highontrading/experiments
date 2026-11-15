// C06 · "The People vs. The Photoshoot" (English VO Bill, 4:5 feed). A courtroom case: exhibits A and B (real shoot
// footage) against exhibit C (an AI-made campaign), then the verdict stamp.
// Captions: court-record transcript in JetBrains Mono on a dark strip, plus Cinzel gold headings.
const L = window.TL.lines, GOLD = "#E9B949";
const EX = [[1, "A", "studio", "REAL FOOTAGE · 2-DAY STUDIO BOOKING"], [2, "B", "crew", "REAL FOOTAGE · FULL CREW"], [3, "C", "i38", "MADE WITH AI · NO STUDIO, NO CREW"]];
const T_V = L[4].at, T_END = L[4].v1 + 0.9;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "people-vs-photoshoot",
  images: { i38: "assets/img/site/i38.jpg", i35: "assets/img/site/i35.jpg", i22: "assets/img/site/i22.jpg" },
  seqs: ["studio", "crew"],
  music: { file: "build/music_el/courtroom.mp3", offset: 0, gain: -12, duck: -6, fadeOut: 1.0 },
  sfx: [["gavel", 0.1, -6], ...EX.map((e) => ["pageflip", L[e[0]].at - 0.1, -10]), ["stamp", T_V + 1.1, -4], ["gavel", T_V + 1.3, -6], ["whoosh", T_END - 0.1, -12]],
  wood() { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "#2b1a10"); gr.addColorStop(0.5, "#3d2616"); gr.addColorStop(1, "#2b1a10"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 180 * u) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, 0, 4 * u, H); g.fillStyle = "rgba(255,220,180,0.05)"; g.fillRect(x + 6 * u, 0, 2 * u, H); }
    for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 2 * u; g.beginPath(); const y = rnd(k) * H; g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 20 * u, W * 0.6, y - 20 * u, W, y + 10 * u); g.stroke(); } },
  evidence(src, lab, tag, x, y, w, h, r, p, t, t0) { g.save(); g.translate(x, y); g.rotate(r); g.scale(p, p);
    g.fillStyle = "#f4efe4"; g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 30 * u; g.fillRect(-w / 2 - 20 * u, -h / 2 - 20 * u, w + 40 * u, h + 110 * u); g.shadowBlur = 0;
    g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); cover(SRC(src, t, t0), -w / 2, -h / 2, w, h, 1.03); g.restore();
    txt(tag, -w / 2, h / 2 + 50 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#3a2a1a", align: "left" });
    // manila tag
    g.save(); g.translate(w / 2 - 60 * u, -h / 2 - 10 * u); g.rotate(0.12); g.fillStyle = "#d9b77a"; rr(-110 * u, -50 * u, 220 * u, 100 * u, 10 * u); g.fill(); txt(`EXHIBIT ${lab}`, 0, 3 * u, { size: 34 * u, fam: F.mono, weight: 700, color: "#3a2a1a" }); g.restore();
    g.restore(); },
  render(t) {
    if (t >= T_END) { this.wood(); g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, W, H); endCard(t, T_END, { bg: false, fg: "#fff", titleFam: F.cinzel, titleWeight: 700, titleSize: 76, title: "AI & ADVERTISING", button: { fill: GOLD, shadow: "#fff" }, cta: "Case closed. Enroll  →" }); grain(t, 0.05); return; }
    this.wood();
    txt("THE PEOPLE", CX, 110 * u, { size: 44 * u, fam: F.cinzel, weight: 700, color: GOLD, ls: 6, alpha: oC(prog(t, 0.2, 0.7)) });
    txt("vs.", CX, 165 * u, { size: 40 * u, fam: F.corm, weight: 500, style: "italic", color: "#fff", alpha: oC(prog(t, 0.4, 0.9)) });
    txt("THE PHOTOSHOOT", CX, 220 * u, { size: 44 * u, fam: F.cinzel, weight: 700, color: GOLD, ls: 6, alpha: oC(prog(t, 0.6, 1.1)) });
    let k = -1; EX.forEach((e, i) => { if (t >= L[e[0]].at - 0.1) k = i; });
    if (k < 0) { // scales of justice
      g.save(); g.translate(CX, 640 * u); g.globalAlpha = oC(prog(t, 0.3, 0.8)); g.strokeStyle = GOLD; g.lineWidth = 8 * u; const tl = Math.sin(t * 1.5) * 0.12;
      g.beginPath(); g.moveTo(0, -220 * u); g.lineTo(0, 240 * u); g.moveTo(-120 * u, 240 * u); g.lineTo(120 * u, 240 * u); g.stroke(); g.rotate(tl); g.beginPath(); g.moveTo(-260 * u, -180 * u); g.lineTo(260 * u, -180 * u); g.stroke();
      [-1, 1].forEach((d) => { g.beginPath(); g.moveTo(d * 260 * u, -180 * u); g.lineTo(d * 260 * u - 70 * u, -40 * u); g.moveTo(d * 260 * u, -180 * u); g.lineTo(d * 260 * u + 70 * u, -40 * u); g.stroke(); g.beginPath(); g.arc(d * 260 * u, -40 * u, 80 * u, 0, Math.PI); g.stroke(); }); g.restore(); }
    else if (t < T_V) {
      const [li, lab, src, tag] = EX[k], t0 = L[li].at - 0.1, p = oB(clamp((t - t0) / 0.4));
      if (k === 2) { const subs = ["i38", "i35", "i22"], j = Math.min(2, Math.floor((t - t0) / 1.4)); this.evidence(subs[j], lab, tag, CX, 620 * u, 760 * u, 600 * u, -0.02, p, t, t0); }
      else this.evidence(src, lab, tag, CX, 620 * u, 760 * u, 600 * u, k ? 0.025 : -0.03, p, t, t0);
    } else {   // verdict
      const p = clamp((t - T_V - 1.1) / 0.18), s = 1.8 - 0.8 * oC(p);
      txt("VERDICT", CX, 470 * u, { size: 90 * u, fam: F.cinzel, weight: 700, color: "#fff", ls: 10, alpha: oC(prog(t, T_V, T_V + 0.4)) });
      g.save(); g.translate(CX, 700 * u); g.rotate(-0.08); g.scale(s, s); g.globalAlpha = clamp(p * 2); g.strokeStyle = "#e5383b"; g.lineWidth = 10 * u; rr(-380 * u, -95 * u, 760 * u, 190 * u, 16 * u); g.stroke();
      txt("LEARN TO DIRECT AI", 0, 6 * u, { size: fitSize("LEARN TO DIRECT AI", 680 * u, 68 * u, 400, F.archivo), fam: F.archivo, weight: 400, color: "#e5383b" }); g.restore();
    }
    // court record transcript (caption)
    const ch = voChunk(t, 6, 0.5); g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect(0, H - 270 * u, W, 200 * u);
    txt("COURT RECORD", 60 * u, H - 230 * u, { size: 22 * u, fam: F.mono, weight: 700, color: GOLD, align: "left", ls: 3 });
    if (ch) { font(40 * u, 700, F.mono); const s = ch.filter((w) => t >= w.s - 0.05).map((w) => w.w).join(" "); wrap(s, W - 120 * u).slice(0, 2).forEach((ln, i) => txt(ln, 60 * u, H - 165 * u + i * 52 * u, { size: 40 * u, fam: F.mono, weight: 700, color: "#fff", align: "left" })); }
    grain(t, 0.05);
  },
};
