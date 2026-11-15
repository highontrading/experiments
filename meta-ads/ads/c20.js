// C20 · "Shubh Aarambh" — the wedding invitation (Hinglish/English, 9:16, music only, shows price). An Indian wedding
// card on maroon with gold borders and marigold garlands: "the union of Your Ideas & AI", venue your laptop,
// shagun ₹2,999. Captions: gold Yatra One (Devanagari) + Playfair Display italic + Cormorant details.
const GOLD = "#E9B949", MAR = "#5a0f1e", ORANGE = "#f39c12";
const ROWS = [[6.2, "Venue", "Your laptop"], [6.9, "Muhurat", "Anytime · self-paced"], [7.6, "Duration", "Lifetime access"], [8.3, "Shagun", "₹2,999 only"], [9.0, "RSVP", "Enroll now"]];
const T_OPEN = 1.4, T_END = 12.4;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "shubh-aarambh-invite",
  music: { file: "build/music_el/shehnai.mp3", offset: 0, gain: -8, fadeOut: 1.0 },
  sfx: [["bell", 0.2, -10], ["boxopen", T_OPEN, -12], ["shimmer", 2.4, -12], ["bell", 4.6, -12], ...ROWS.map((r) => ["pop", r[0], -16]), ["shimmer", 10.2, -12], ["whoosh", T_END - 0.1, -12]],
  border(a) { g.save(); g.globalAlpha = a; g.strokeStyle = GOLD; g.lineWidth = 4 * u; g.strokeRect(70 * u, 300 * u, W - 140 * u, H - 520 * u); g.lineWidth = 1.5 * u; g.strokeRect(90 * u, 320 * u, W - 180 * u, H - 560 * u);
    [[90, 320], [W / u - 90, 320], [90, H / u - 240], [W / u - 90, H / u - 240]].forEach(([x, y]) => { for (let k = 0; k < 8; k++) { g.beginPath(); g.ellipse(x * u, y * u, 34 * u, 12 * u, k * Math.PI / 8, 0, 7); g.stroke(); } g.fillStyle = GOLD; g.beginPath(); g.arc(x * u, y * u, 8 * u, 0, 7); g.fill(); });
    for (let x = 140; x < W / u - 120; x += 40) { g.fillStyle = GOLD; g.beginPath(); g.arc(x * u, 300 * u, 4 * u, 0, 7); g.fill(); g.beginPath(); g.arc(x * u, H - 220 * u, 4 * u, 0, 7); g.fill(); } g.restore(); },
  garland(t) { const drop = oX(prog(t, 0, 0.9)); for (let s = 0; s < 7; s++) { const x = (90 + s * 150) * u, len = (120 + (s % 2) * 80) * u * drop;
      for (let y = 0; y < len; y += 26 * u) { g.fillStyle = (y / (26 * u)) % 3 < 1 ? "#ffd166" : ORANGE; g.beginPath(); g.arc(x + Math.sin(t * 2 + s + y * 0.01) * 4 * u, y + 13 * u, 14 * u, 0, 7); g.fill(); }
      g.fillStyle = "#2e7d32"; g.beginPath(); g.ellipse(x, len + 20 * u, 10 * u, 22 * u, 0, 0, 7); g.fill(); }
    g.strokeStyle = ORANGE; g.lineWidth = 10 * u; g.beginPath(); g.moveTo(0, 30 * u); for (let x = 0; x <= W; x += 20 * u) g.lineTo(x, 30 * u + Math.sin(x / (150 * u) * Math.PI) * 50 * u * drop); g.stroke(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: MAR, fg: "#fff", accent: GOLD, price: true, titleFam: F.play, titleWeight: 700, button: { fill: GOLD, shadow: "#fff" }, cta: "RSVP: Enroll now  →" }); grain(t, 0.05); return; }
    bg(MAR); const vg = g.createRadialGradient(CX, CY, 100 * u, CX, CY, 1100 * u); vg.addColorStop(0, "#7a1a2e"); vg.addColorStop(1, "#3a0812"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    // faint mandala
    g.save(); g.translate(CX, CY); g.rotate(t * 0.05); g.strokeStyle = "rgba(233,185,73,0.10)"; g.lineWidth = 2 * u; for (let k = 0; k < 24; k++) { g.rotate(Math.PI / 12); g.beginPath(); g.ellipse(0, 260 * u, 80 * u, 260 * u, 0, 0, 7); g.stroke(); } g.restore();
    this.border(oC(prog(t, 0.6, 1.4)));
    const y0 = 470 * u, ap = (d, du = 0.5) => oC(prog(t, d, d + du));
    txt("॥ शुभ आरंभ ॥", CX, y0, { size: 92 * u, fam: F.yatra, weight: 400, color: GOLD, alpha: ap(2.2) });
    txt("IDEABRO STUDIO", CX, y0 + 130 * u, { size: 40 * u, fam: F.cinzel, weight: 700, color: "#fff", alpha: ap(3.0), ls: 6 });
    txt("cordially invites you to the union of", CX, y0 + 195 * u, { size: 44 * u, fam: F.corm, weight: 500, style: "italic", color: "#f3d9b1", alpha: ap(3.4) });
    const up = oB(clamp((t - 4.4) / 0.5)); g.save(); g.translate(CX, y0 + 340 * u); g.scale(up, up); txt("Your Ideas", 0, 0, { size: 110 * u, fam: F.play, weight: 600, style: "italic", color: GOLD }); g.restore();
    txt("♥", CX, y0 + 450 * u, { size: 60 * u, color: "#ff6b6b", alpha: ap(4.9) });
    const up2 = oB(clamp((t - 5.2) / 0.5)); g.save(); g.translate(CX, y0 + 560 * u); g.scale(up2, up2); txt("AI", 0, 0, { size: 140 * u, fam: F.play, weight: 600, style: "italic", color: GOLD }); g.restore();
    ROWS.forEach(([d, k, v], i) => { const y = y0 + 720 * u + i * 76 * u, a = ap(d, 0.4); txt(k, CX - 30 * u, y, { size: 38 * u, fam: F.cinzel, weight: 700, color: GOLD, align: "right", alpha: a, ls: 2 });
      txt(v, CX + 10 * u, y, { size: 44 * u, fam: F.corm, weight: 500, style: "italic", color: i === 3 ? "#ffd166" : "#fff", align: "left", alpha: a }); });
    txt("Your presence is requested at 11 modules & 41 lessons.", CX, y0 + 1150 * u, { size: 34 * u, fam: F.corm, weight: 500, style: "italic", color: "#f3d9b1", alpha: ap(10.2) });
    // doors opening at the start
    if (t < T_OPEN + 0.8) { const op = ioC(prog(t, T_OPEN, T_OPEN + 0.8)); [-1, 1].forEach((d) => { g.save(); g.fillStyle = "#4a0a17"; const x = d < 0 ? -op * CX : CX + op * CX; g.fillRect(x, 0, CX, H);
      g.strokeStyle = GOLD; g.lineWidth = 6 * u; g.strokeRect(x + 30 * u, 60 * u, CX - 60 * u, H - 120 * u); txt(d < 0 ? "शुभ" : "आरंभ", x + CX / 2, CY, { size: 120 * u, fam: F.yatra, weight: 400, color: GOLD }); g.restore(); }); }
    this.garland(t);
    grain(t, 0.05);
  },
};
