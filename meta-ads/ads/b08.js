// B08 · "Budget vs output" (Hinglish VO Rahul, 9:16). A balance scale tips from budget-heavy to output-heavy, then
// one product photo multiplies into fifty creatives. Captions: dark pill, white words, lime active word.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const POOL = ["i35", "i31", "i32", "i33", "i34", "i36", "i37", "i38", "i39", "i40", "i41"];
const T_FLIP = L[1].at, T_GRID = L[2].at, T_AI = L[3].at, T_OUT = L[4].at, T_END = L[4].v1 + 0.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "budget-vs-output_hinglish",
  images: Object.fromEntries(POOL.map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/indian.mp3", offset: 10, gain: -12, duck: -6, fadeOut: 0.8 },
  sfx: [["coin", 0.6, -10], ["coin", 0.8, -12], ["coin", 1.0, -12], ["whoosh", T_FLIP + 0.2, -10], ["stamp", T_FLIP + 0.7, -10], ["pop", T_GRID + 0.3, -12], ["riser", T_GRID + 0.9, -14], ["boom", T_AI, -12], ["whoosh", T_END - 0.1, -12]],
  thumb(k, x, y, s, r = 0) { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = C.ink; g.fillRect(-s / 2 + 5 * u, -s / 2 + 5 * u, s, s); g.beginPath(); g.rect(-s / 2, -s / 2, s, s); g.save(); g.clip(); cover(IM[POOL[k % POOL.length]], -s / 2, -s / 2, s, s); g.restore(); g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.strokeRect(-s / 2, -s / 2, s, s); g.restore(); },
  pan(x, y, label, draw) { g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 130 * u, y + 230 * u); g.moveTo(x, y); g.lineTo(x + 130 * u, y + 230 * u); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, y + 236 * u, 170 * u, 30 * u, 0, 0, 7); g.fill(); g.stroke(); draw(x, y + 220 * u);
    g.fillStyle = C.ink; rr(x - 120 * u, y + 290 * u, 240 * u, 64 * u, 32 * u); g.fill(); txt(label, x, y + 323 * u, { size: 30 * u, fam: F.mono, weight: 700, color: C.lime }); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", cta: "Skill seekho  →" }); grain(t, 0.04); return; }
    gridBg();
    if (t < T_GRID) {
      const after = t >= T_FLIP, tilt = after ? lerp(-0.22, 0.22, oB(clamp((t - T_FLIP - 0.2) / 0.6), 1.2)) : -0.22 * oC(prog(t, 0.4, 1.2));
      txt(after ? "AB" : "PEHLE", CX, 300 * u, { size: 120 * u, fam: F.archivo, weight: 400, color: C.ink });
      const px = CX, py = 520 * u, arm = 320 * u;
      g.fillStyle = C.ink; g.beginPath(); g.moveTo(px - 60 * u, py + 620 * u); g.lineTo(px + 60 * u, py + 620 * u); g.lineTo(px + 14 * u, py); g.lineTo(px - 14 * u, py); g.fill();
      const lx = px - Math.cos(tilt) * arm, ly = py - Math.sin(tilt) * arm, rx = px + Math.cos(tilt) * arm, ry = py + Math.sin(tilt) * arm;
      g.strokeStyle = C.ink; g.lineWidth = 12 * u; g.beginPath(); g.moveTo(lx, ly); g.lineTo(rx, ry); g.stroke(); g.fillStyle = C.lime; g.beginPath(); g.arc(px, py, 22 * u, 0, 7); g.fill(); g.stroke();
      const coins = after ? 2 : 9, imgs = after ? 6 : 1;
      this.pan(lx, ly, "BUDGET", (x, y) => { for (let i = 0; i < coins; i++) { g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.beginPath(); g.ellipse(x + ((i % 2) - 0.5) * 20 * u, y - i * 26 * u, 80 * u, 22 * u, 0, 0, 7); g.fill(); g.stroke(); } txt("₹", x, y - coins * 26 * u - 30 * u, { size: 60 * u, weight: 900, color: C.ink }); });
      this.pan(rx, ry, "OUTPUT", (x, y) => { for (let i = 0; i < imgs; i++) this.thumb(i, x + ((i % 3) - 1) * 70 * u, y - 70 * u - Math.floor(i / 3) * 110 * u, 120 * u, (i % 2 ? 0.08 : -0.06)); });
    } else {
      // one product photo -> 50 creatives
      const n = 50, cols = 10, cell = 98 * u, gx = CX - (cols * cell) / 2 + cell / 2, gy = 660 * u, sp = prog(t, T_GRID + 0.9, T_AI - 0.2);
      const shownN = t < T_GRID + 0.9 ? 1 : Math.max(1, Math.floor(1 + 49 * ioC(sp)));
      const z = t >= T_AI ? lerp(1, 1.08, prog(t, T_AI, T_END)) : 1;
      g.save(); g.translate(CX, 900 * u); g.scale(z, z); g.translate(-CX, -900 * u);
      for (let i = 0; i < shownN && i < n; i++) { const c = i % cols, r = Math.floor(i / cols);
        if (i === 0 && shownN === 1) { const p = oB(clamp((t - T_GRID) / 0.4)); this.thumb(0, CX, 860 * u, 460 * u * p); }
        else this.thumb(i, gx + c * cell, gy + r * cell, cell - 12 * u, 0); }
      g.restore();
      const cnt = String(Math.min(50, shownN)).padStart(2, "0");
      g.fillStyle = C.ink; rr(CX - 190 * u, 1250 * u, 380 * u, 110 * u, 55 * u); g.fill(); txt(`${cnt} / 50`, CX, 1307 * u, { size: 60 * u, fam: F.mono, weight: 700, color: C.lime });
      if (t >= T_AI) { const p = oB(clamp((t - T_AI) / 0.3)); g.save(); g.translate(CX, 420 * u); g.scale(p, p); g.fillStyle = C.lime; g.strokeStyle = C.ink; g.lineWidth = 4 * u; rr(-250 * u, -60 * u, 500 * u, 120 * u, 20 * u); g.fill(); g.stroke();
        txt("MADE WITH AI", 0, 4 * u, { size: 56 * u, fam: F.archivo, weight: 400, color: C.ink }); g.restore(); }
    }
    capPill(t, voChunk(t, 3, 0.4), H * 0.775, { size: 64 * u, hi: C.lime });
    grain(t, 0.04);
  },
};
