// C07 · "Today's recipe" (English VO Chris, 4:5 feed). A cooking-show recipe card for a luxury ad: one product photo,
// golden hour, a pinch of haze, an 85mm lens; it "cooks" from flat to premium, then gets plated in three formats.
// Captions: Playfair italic subtitles on cream; ingredients in Caveat handwriting.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, RED = "#c8102e";
const ING = [[Wd(1, 1), "1 product photo"], [Wd(2, 1), "2 cups golden hour"], [Wd(2, 4), "a pinch of haze"], [Wd(2, 9), "1 × 85mm lens"]];
const T_REN = L[3].at, T_PLATE = Wd(3, 4) - 0.05, T_SERVE = L[4].at, T_END = L[4].v1 + 0.8;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "todays-recipe",
  images: { im: "assets/img/site/i38.jpg" },
  music: { file: "build/music_el/kitchen.mp3", offset: 0, gain: -12, duck: -6, fadeOut: 1.0 },
  sfx: [["pageflip", 0.2, -10], ...ING.map((i) => ["pencil", i[0], -12]), ["sizzle", Wd(2, 1), -16], ["shimmer", T_REN, -14], ["ding", T_PLATE - 0.2, -10], ...[0, 1, 2].map((i) => ["pop", T_PLATE + i * 0.3, -12]), ["whoosh", T_END - 0.1, -12]],
  dish(x, y, w, h, q) {  // q: 0 flat → 1 premium
    g.save(); g.beginPath(); rr(x, y, w, h, 18 * u); g.clip();
    g.filter = `saturate(${lerp(0.35, 1.05, q)}) contrast(${lerp(0.75, 1.05, q)}) brightness(${lerp(1.2, 1.0, q)}) sepia(${lerp(0, 0.08, q)})`; cover(IM.im, x, y, w, h, 1.55, 0.06, 0.5); g.filter = "none";
    if (q > 0) { const gr = g.createRadialGradient(x + w * 0.8, y + h * 0.15, 10, x + w * 0.8, y + h * 0.15, w); gr.addColorStop(0, `rgba(255,190,110,${0.35 * q})`); gr.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = gr; g.fillRect(x, y, w, h); }
    g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fbf6ec", fg: C.ink, titleFam: F.play, titleWeight: 700, titleStyle: "", button: { fill: RED, color: "#fff", shadow: C.ink }, cta: "Get the full cookbook  →" }); return; }
    bg("#fbf6ec");
    // gingham band
    for (let x = 0; x < W; x += 40 * u) for (let y = 0; y < 80 * u; y += 40 * u) { g.fillStyle = ((x + y) / (40 * u)) % 2 < 1 ? RED : "#fff"; g.fillRect(x, y, 40 * u, 40 * u); }
    g.fillStyle = "rgba(200,16,46,0.15)"; g.fillRect(0, 0, W, 80 * u);
    // recipe card (left column)
    const cp = oC(prog(t, 0.1, 0.5)); g.save(); g.globalAlpha = cp;
    txt("RECIPE No. 041", 70 * u, 150 * u, { size: 24 * u, fam: F.mono, weight: 700, color: RED, align: "left", ls: 3 });
    txt("The Luxury Ad", 70 * u, 225 * u, { size: 76 * u, fam: F.play, weight: 700, style: "italic", color: C.ink, align: "left" });
    txt("Prep 10 min  ·  Cook 1 render  ·  No studio", 70 * u, 290 * u, { size: 28 * u, fam: F.mono, color: "#6b5a4a", align: "left" });
    g.fillStyle = "#e6dccb"; g.fillRect(70 * u, 325 * u, W - 140 * u, 3 * u);
    txt("INGREDIENTS", 70 * u, 375 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#6b5a4a", align: "left", ls: 3 }); g.restore();
    ING.forEach(([t0, s], i) => { if (t < t0 - 0.05) return; const p = oC(prog(t, t0 - 0.05, t0 + 0.3)), y = 440 * u + i * 66 * u;
      g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.strokeRect(70 * u, y - 18 * u, 36 * u, 36 * u); g.strokeStyle = RED; g.lineWidth = 5 * u; g.beginPath(); g.moveTo(76 * u, y); g.lineTo(86 * u, y + 12 * u); g.lineTo(76 * u + 34 * u * p, y - 22 * u * p); g.stroke();
      txt(s, 130 * u, y + 2 * u, { size: 52 * u, fam: F.hand, weight: 700, color: C.ink, align: "left", alpha: p }); });
    // the dish (right column)
    const dx = 600 * u, dy = 380 * u, dw = 410 * u, dh = 520 * u;
    if (t >= Wd(1, 1) - 0.05 && t < T_PLATE) {
      const q = t < Wd(2, 1) ? 0 : clamp((ING.filter((i) => t >= i[0]).length - 1) / 3 * 0.7 + (t >= T_REN ? 0.3 * prog(t, T_REN, T_PLATE - 0.2) : 0)), p = oB(clamp((t - Wd(1, 1) + 0.05) / 0.35));
      g.save(); g.translate(dx + dw / 2, dy + dh / 2); g.scale(p, p); g.translate(-dx - dw / 2, -dy - dh / 2); g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.15)"; g.shadowBlur = 30 * u; rr(dx - 14 * u, dy - 14 * u, dw + 28 * u, dh + 28 * u, 26 * u); g.fill(); g.shadowBlur = 0;
      this.dish(dx, dy, dw, dh, q); g.restore();
      // sprinkles falling on each ingredient
      ING.slice(1).forEach(([t0]) => { if (t < t0 || t > t0 + 0.9) return; for (let k = 0; k < 20; k++) { const yy = dy - 60 * u + ((t - t0) * 700 + rnd(k) * 200) * u; if (yy > dy + dh) continue; g.fillStyle = `rgba(233,185,73,${0.9 - (t - t0)})`; g.beginPath(); g.arc(dx + rnd(k + 5) * dw, yy, 6 * u, 0, 7); g.fill(); } });
      if (t >= T_REN) { const rp = prog(t, T_REN, T_PLATE - 0.2); g.strokeStyle = RED; g.lineWidth = 10 * u; g.beginPath(); g.arc(dx + dw / 2, dy + dh + 80 * u, 34 * u, -Math.PI / 2, -Math.PI / 2 + rp * 6.283); g.stroke();
        txt(`rendering ${Math.round(rp * 100)}%`, dx + dw / 2, dy + dh + 145 * u, { size: 26 * u, fam: F.mono, color: "#6b5a4a" }); }
      txt(q < 0.05 ? "raw" : q < 0.95 ? "cooking…" : "done", dx + dw / 2, dy - 40 * u, { size: 40 * u, fam: F.hand, weight: 700, color: RED });
    }
    if (t >= T_PLATE) {  // plated in three formats
      const fm = [[1, 1, "1:1"], [4, 5, "4:5"], [9, 16, "9:16"]], hh = 380 * u, cy = 900 * u, gap = 50 * u;
      const tot = fm.reduce((acc, f) => acc + hh * f[0] / f[1], 0) + gap * 2; let x = CX - tot / 2;
      fm.forEach(([a, b, lab], i) => { const p = oB(clamp((t - T_PLATE - i * 0.3) / 0.35)), ww = hh * a / b, y = cy - hh / 2;
        g.save(); g.translate(x + ww / 2, cy); g.scale(p, p); g.translate(-x - ww / 2, -cy); g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.15)"; g.shadowBlur = 24 * u; rr(x - 10 * u, y - 10 * u, ww + 20 * u, hh + 20 * u, 16 * u); g.fill(); g.shadowBlur = 0;
        this.dish(x, y, ww, hh, 1); txt(lab, x + ww / 2, y + hh + 45 * u, { size: 30 * u, fam: F.mono, weight: 700, color: C.ink, alpha: 1 - prog(t, T_SERVE - 0.2, T_SERVE) }); g.restore(); x += ww + gap; });
      if (t >= T_SERVE) txt("Serves: your entire feed.", CX, 1225 * u - 75 * u - 30 * u, { size: 60 * u, fam: F.hand, weight: 700, color: RED, alpha: oC(prog(t, T_SERVE, T_SERVE + 0.3)) });
    }
    // subtitles
    g.fillStyle = "rgba(20,20,20,0.88)"; g.fillRect(0, H - 150 * u, W, 150 * u);
    capClean(t, voChunk(t, 6, 0.5), H - 75 * u, { size: 46 * u, fam: F.play, weight: 600, style: "italic", color: "#fff" });
    grain(t, 0.03);
  },
};
