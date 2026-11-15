// C16 · "One more thing" (English VO Daniel, 9:16, shows price). A tech-keynote reveal on a black stage: gradient type,
// giant numbers, three floating feature cards with reflections, a pause — then "₹2,999. For life."
// Captions: the keynote slides themselves — Inter 800 with gradient fills, centred.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T1 = L[1].at, T2 = L[2].at, T3 = L[3].at, T4 = L[4].at, T_END = L[4].v1 + 0.9;
const CARDS = [["i35", "Product shoots", Wd(2, 0)], ["i22", "Video ads", Wd(2, 2)], ["i38", "Meta ads", Wd(2, 5)]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "one-more-thing",
  images: { i35: "assets/img/site/i35.jpg", i22: "assets/img/site/i22.jpg", i38: "assets/img/site/i38.jpg" },
  music: { file: "build/music_el/keynote.mp3", offset: 0, gain: -10, duck: -6, fadeOut: 1.0 },
  sfx: [["shimmer", 0.2, -16], ["whoosh", T1, -14], ...CARDS.map((c) => ["pop", c[2], -14]), ["applause", T4 + 1.4, -12], ["sub", T4, -10], ["whoosh", T_END - 0.1, -12]],
  grad(s, x, y, size, c1, c2, o = {}) { font(size, o.weight || 800, o.fam || F.inter); const w = tw(s); const gr = g.createLinearGradient(x - w / 2, y - size / 2, x + w / 2, y + size / 2); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    g.save(); g.globalAlpha = o.alpha ?? 1; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = gr; g.fillText(s, x, y); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#000", fg: "#fff", price: true, accent: "#F6B8EA", cta: "Get it for life  →" }); return; }
    bg("#000"); const spot = g.createRadialGradient(CX, H * 0.42, 50 * u, CX, H * 0.42, 900 * u); spot.addColorStop(0, "rgba(60,60,80,0.45)"); spot.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = spot; g.fillRect(0, 0, W, H);
    if (t < T1) { const p = oC(prog(t, 0.3, 1.0)); this.grad("We built a course", CX, H * 0.42, 92 * u, "#ffffff", "#9aa0aa", { alpha: p }); this.grad("for people who make ads.", CX, H * 0.42 + 110 * u, 72 * u, "#c9ccd3", "#7d828c", { alpha: oC(prog(t, 0.9, 1.6)) }); }
    else if (t < T2) {
      const a = oB(clamp((t - Wd(1, 0) + 0.05) / 0.4)), b = oB(clamp((t - Wd(1, 2) + 0.05) / 0.4));
      g.save(); g.translate(CX, H * 0.34); g.scale(a, a); this.grad("11", 0, 0, 380 * u, "#D8F5A2", "#7FB8FF"); g.restore(); txt("modules", CX, H * 0.34 + 210 * u, { size: 52 * u, weight: 600, color: "#aaa", alpha: a });
      g.save(); g.translate(CX, H * 0.6); g.scale(b, b); this.grad("41", 0, 0, 380 * u, "#F6B8EA", "#CDBCFF"); g.restore(); txt("lessons", CX, H * 0.6 + 210 * u, { size: 52 * u, weight: 600, color: "#aaa", alpha: b });
    } else if (t < T3) {
      CARDS.forEach(([im, lab, st], i) => { if (t < st - 0.05) return; const p = oC(clamp((t - st + 0.05) / 0.6)), y = 380 * u + i * 430 * u, x = CX + (i - 1) * 40 * u, w = 760 * u, h = 360 * u, fl = Math.sin(t * 1.4 + i) * 8 * u;
        g.save(); g.translate(x, y + h / 2 + (1 - p) * 120 * u + fl); g.globalAlpha = p;
        g.save(); g.beginPath(); rr(-w / 2, -h / 2, w, h, 36 * u); g.clip(); cover(IM[im], -w / 2, -h / 2, w, h, 1.05, 0.5, i === 0 ? 0.85 : i === 2 ? 0.5 : 0.4);
        const gl = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); gl.addColorStop(0, "rgba(255,255,255,0.18)"); gl.addColorStop(0.4, "rgba(255,255,255,0)"); g.fillStyle = gl; g.fillRect(-w / 2, -h / 2, w, h);
        const gb = g.createLinearGradient(0, 0, 0, h / 2); gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(1, "rgba(0,0,0,0.7)"); g.fillStyle = gb; g.fillRect(-w / 2, 0, w, h / 2); g.restore();
        txt(lab, -w / 2 + 40 * u, h / 2 - 50 * u, { size: 52 * u, weight: 800, color: "#fff", align: "left" }); g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 2 * u; rr(-w / 2, -h / 2, w, h, 36 * u); g.stroke(); g.restore(); });
      if (t >= Wd(2, 7) - 0.05) this.grad("All with AI.", CX, H * 0.895, 76 * u, "#D8F5A2", "#7FB8FF", { alpha: oC(prog(t, Wd(2, 7) - 0.05, Wd(2, 7) + 0.4)) });
    } else if (t < T4) { this.grad("One more thing.", CX, H * 0.45, 100 * u, "#ffffff", "#9aa0aa", { alpha: oC(prog(t, T3 + 0.2, T3 + 0.9)) }); }
    else { const p = oB(clamp((t - T4) / 0.6), 1.2); g.save(); g.translate(CX, H * 0.42); g.scale(p, p); this.grad(PRICE, 0, 0, 250 * u, "#E9B949", "#F6B8EA"); g.restore();
      this.grad("For life.", CX, H * 0.42 + 200 * u, 96 * u, "#ffffff", "#9aa0aa", { alpha: oC(prog(t, Wd(4, 1) - 0.1, Wd(4, 1) + 0.4)) });
      txt("One-time payment · 11 modules · 41 lessons", CX, H * 0.42 + 300 * u, { size: 34 * u, weight: 600, color: "#888", alpha: oC(prog(t, T4 + 1.4, T4 + 1.8)) }); }
  },
};
