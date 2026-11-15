// C05 · "Swipe right" (English, 9:16, music only). A dating-app deck of ways to make ads: swipe left on studio
// bookings, casting, reshoots and waiting; swipe right on AI & Advertising — "It's a match!".
// Captions: card titles (white Inter Black on a dark gradient) + NOPE / LIKE stamps.
const CARDS = [  // [title, sub, src, dir]
  ["Studio booking", "2 days · weather permitting · ₹₹₹", "studio", -1], ["Model casting", "3 rounds of auditions", "crew", -1],
  ["The reshoot", "\"Can we try one more angle?\"", "product", -1], ["Waiting on edits", "2 weeks, minimum", "laptop", -1],
  ["AI & Advertising", "11 modules · direct ads with AI", "i38", 1],
];
const C0 = 1.0, CS = 1.75, T_MATCH = C0 + CARDS.length * CS, T_END = T_MATCH + 2.6, PINK = "#ff4f7b";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "swipe-right",
  images: { i38: "assets/img/site/i38.jpg", i35: "assets/img/site/i35.jpg" },
  seqs: ["studio", "crew", "product", "laptop"],
  music: { file: "build/music_el/swipe.mp3", offset: 0, gain: -10, fadeOut: 0.8 },
  sfx: [...CARDS.map((c, i) => ["flick", C0 + i * CS + 1.1, -8]), ["match", T_MATCH, -6], ["whoosh", T_END - 0.1, -12]],
  card(c, x, y, r, t, stamp) {
    const [title, sub, src] = c, w = 900 * u, h = 1180 * u; g.save(); g.translate(x, y); g.rotate(r);
    g.shadowColor = "rgba(0,0,0,0.25)"; g.shadowBlur = 40 * u; g.fillStyle = "#222"; rr(-w / 2, -h / 2, w, h, 40 * u); g.fill(); g.shadowBlur = 0;
    g.save(); rr(-w / 2, -h / 2, w, h, 40 * u); g.clip(); cover(SRC(src, t, 0), -w / 2, -h / 2, w, h, 1.05, 0.5, 0.4);
    const gr = g.createLinearGradient(0, h * 0.05, 0, h / 2); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.85)"); g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
    txt(title, -w / 2 + 50 * u, h / 2 - 170 * u, { size: fitSize(title, w - 100 * u, 84 * u, 900, F.inter), weight: 900, color: "#fff", align: "left" });
    txt(sub, -w / 2 + 50 * u, h / 2 - 90 * u, { size: 38 * u, weight: 600, color: "#eee", align: "left" });
    if (stamp) { const [lab, col, a, side] = stamp; g.save(); g.globalAlpha = a; g.translate(side * 230 * u, -h / 2 + 170 * u); g.rotate(-side * 0.25); g.strokeStyle = col; g.lineWidth = 10 * u; rr(-170 * u, -70 * u, 340 * u, 140 * u, 16 * u); g.stroke();
      txt(lab, 0, 4 * u, { size: 96 * u, fam: F.archivo, weight: 400, color: col }); g.restore(); }
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fff4f7", fg: C.ink, button: { fill: PINK, color: "#fff", shadow: C.ink }, cta: "Swipe right  →" }); return; }
    bg("#fff4f7");
    txt("ad", CX - 70 * u, 250 * u, { size: 64 * u, fam: F.grot, weight: 800, color: PINK, align: "right" }); txt("match ♥", CX - 60 * u, 250 * u, { size: 64 * u, fam: F.grot, weight: 800, color: C.ink, align: "left" });
    if (t < T_MATCH) {
      txt("Swipe on how you make ads.", CX, 360 * u, { size: 44 * u, weight: 700, color: "#555", alpha: oC(prog(t, 0.2, 0.6)) });
      const k = clamp(Math.floor((t - C0) / CS), 0, CARDS.length - 1), st = C0 + k * CS, c = CARDS[k], dir = c[3];
      if (k + 1 < CARDS.length) { g.save(); g.translate(CX, 1080 * u); g.scale(0.94, 0.94); g.translate(-CX, -1080 * u); this.card(CARDS[k + 1], CX, 1080 * u, 0, t, null); g.restore(); }
      const sp = ioC(prog(t, st + 1.05, st + 1.45)), lean = prog(t, st + 0.5, st + 1.05);
      const stamp = t >= st + 0.5 ? [dir < 0 ? "NOPE" : "LIKE", dir < 0 ? "#ff3b3b" : "#2ecc71", clamp(lean * 1.5), dir < 0 ? 1 : -1] : null;
      this.card(c, CX + dir * (lean * 60 + sp * 1100) * u, 1060 * u, dir * (lean * 0.06 + sp * 0.35), t, stamp);
      // buttons
      [["✕", "#ff3b3b", -1], ["♥", "#2ecc71", 1]].forEach(([s, col, d]) => { const k = Math.floor((t - C0) / CS), act = k >= 0 && k < CARDS.length && CARDS[k][3] === d && t - C0 - k * CS > 0.6;
        g.save(); g.translate(CX + d * 170 * u, 1760 * u); const sc = act ? 1.15 : 1; g.scale(sc, sc); g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.15)"; g.shadowBlur = 20 * u; g.beginPath(); g.arc(0, 0, 80 * u, 0, 7); g.fill(); g.shadowBlur = 0;
        txt(s, 0, 4 * u, { size: 72 * u, weight: 900, color: col }); g.restore(); });
    } else {
      const p = oB(clamp((t - T_MATCH) / 0.45)); bg(PINK);
      for (let k = 0; k < 24; k++) { const a = rnd(k) * 6.28, d = prog(t, T_MATCH, T_MATCH + 1.5) * (300 + rnd(k + 3) * 600) * u; txt("♥", CX + Math.cos(a) * d, 900 * u + Math.sin(a) * d, { size: (30 + rnd(k + 7) * 50) * u, color: "#fff", alpha: 1 - prog(t, T_MATCH + 1, T_MATCH + 2.2) }); }
      g.save(); g.translate(CX, 620 * u); g.scale(p, p); txt("It's a", 0, -90 * u, { size: 90 * u, fam: F.grot, weight: 700, color: "#fff" }); txt("MATCH!", 0, 40 * u, { size: 190 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore();
      [["i35", -1], ["logo", 1]].forEach(([im, d]) => { const q = oB(clamp((t - T_MATCH - 0.3) / 0.4)); g.save(); g.translate(CX + d * 170 * u * q, 1050 * u); g.fillStyle = "#fff"; g.beginPath(); g.arc(0, 0, 150 * u, 0, 7); g.fill();
        g.beginPath(); g.arc(0, 0, 138 * u, 0, 7); g.clip(); if (im === "logo") { g.fillStyle = C.ink; g.fillRect(-150 * u, -150 * u, 300 * u, 300 * u); logo(0, 0, 120 * u, "white"); } else cover(IM[im], -138 * u, -138 * u, 276 * u, 276 * u); g.restore(); });
      txt("You and AI & Advertising like each other.", CX, 1300 * u, { size: 40 * u, weight: 700, color: "#fff", alpha: oC(prog(t, T_MATCH + 0.7, T_MATCH + 1.0)) });
    }
  },
};
