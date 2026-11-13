// A17 · "What our students say" (English, 4:5 feed, no VO). Three real testimonials from the course page as editorial
// quote cards over warm, slow-moving AI imagery. Captions: large Instrument Serif quotes, pink quote marks.
const Qs = [
  ["IdeaBro didn’t just teach me tools. It rewired how I think about ideas. My client work is now at a completely different level.", "Aryan Sinha", "Brand Designer", "AS", "i21"],
  ["I went from copying trends to setting them. The cohort gave me the language and systems to lead creative direction with confidence.", "Ketan Parikh", "Content Creator", "KP", "i19"],
  ["The way they blend taste, AI tools, and creative strategy is unlike anything in the market.", "Sonam Gautam", "Freelancer & Studio Founder", "SG", "i00"],
];
const Q0 = 0.4, QS = 4.3, T_END = Q0 + Qs.length * QS;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "student-voices",
  images: { i21: "assets/img/site/i21.jpg", i19: "assets/img/site/i19.jpg", i00: "assets/img/site/i00.jpg" },
  music: { file: "build/music/587.mp3", offset: 0, gain: -4, fadeOut: 1.0 },
  sfx: Qs.map((_, i) => ["pageflip", Q0 + i * QS - 0.1, -12]).concat([["shimmer", T_END, -14]]),
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", sub: "Join them · by Ideabro Studio" }); grain(t, 0.04); return; }
    const k = clamp(Math.floor((t - Q0) / QS), 0, Qs.length - 1), [q, name, role, ini, im] = Qs[k], t0 = Q0 + k * QS;
    bg("#1a1410"); g.save(); g.globalAlpha = 0.5; cover(IM[im], 0, 0, W, H, 1.08 + 0.05 * prog(t, t0, t0 + QS)); g.restore();
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(26,20,16,0.55)"); gr.addColorStop(1, "rgba(26,20,16,0.92)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // fade between quotes
    const fin = oC(prog(t, t0, t0 + 0.5)), fout = k < Qs.length - 1 ? 1 - prog(t, t0 + QS - 0.35, t0 + QS) : 1 - prog(t, T_END - 0.3, T_END);
    g.save(); g.globalAlpha = fin * fout;
    txt("FROM OUR STUDENTS", 80 * u, 130 * u, { size: 24 * u, fam: F.mono, weight: 700, color: C.pink, align: "left", ls: 3 });
    txt(`0${k + 1} / 03`, W - 80 * u, 130 * u, { size: 24 * u, fam: F.mono, color: "#cfc6b8", align: "right" });
    txt("“", 80 * u, 300 * u, { size: 300 * u, fam: F.serif, weight: 400, color: C.pink, align: "left" });
    font(66 * u, 400, F.serif); const lines = wrap(q, W - 160 * u);
    lines.forEach((ln, i) => { const p = oC(clamp((t - t0 - 0.2 - i * 0.12) / 0.5)); txt(ln, 80 * u, 430 * u + i * 82 * u + (1 - p) * 16 * u, { size: 66 * u, fam: F.serif, weight: 400, color: "#f6efe4", align: "left", alpha: p }); });
    const ny = 430 * u + lines.length * 82 * u + 80 * u, np = oC(clamp((t - t0 - 1.2) / 0.4));
    g.globalAlpha *= np; g.fillStyle = C.lime; g.beginPath(); g.arc(120 * u, ny, 40 * u, 0, 7); g.fill(); txt(ini, 120 * u, ny + 2 * u, { size: 30 * u, weight: 800, color: C.ink });
    txt(name, 185 * u, ny - 16 * u, { size: 38 * u, weight: 700, color: "#fff", align: "left" }); txt(role, 185 * u, ny + 26 * u, { size: 26 * u, fam: F.mono, color: "#cfc6b8", align: "left" });
    g.restore();
    grain(t, 0.06);
  },
};
