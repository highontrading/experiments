// A10 · "Diwali campaign, budget tight?" (Hinglish VO Anika, 4:5 feed). Maroon + gold festive world: diya footage,
// drawn marigold garlands, gold-framed AI festive shots. Captions: gold Playfair with glow.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_L1 = L[1].at, T_L2 = Wd(2, 0), T_L3 = Wd(3, 0), T_END = L[3].v1 + 0.6;
const GOLD = "#F3C969", MAROON = "#3a0912";
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "diwali-campaign_hinglish",
  images: { look: "assets/img/site/i00.jpg", rings: "assets/img/site/i18.jpg", face: "assets/img/site/i22.jpg", woman2: "assets/img/site/i21.jpg" },
  seqs: ["diya", "hands", "flame", "woman"],
  music: { file: "build/music/205.mp3", offset: 10, gain: -6, duck: -6, fadeOut: 0.8 },
  sfx: [["shimmer", 0.3, -10], ["shimmer", T_L1, -12], ["pop", Wd(1, 1), -14], ["shutter", Wd(1, 2), -12], ["tick", T_L2 + 0.4, -10], ["tick", Wd(2, 2) + 0.2, -10], ["shimmer", T_L3, -10], ["shimmer", T_END, -8]],
  sparks(t, n = 60) {   // floating gold bokeh
    for (let k = 0; k < n; k++) { const x = rnd(k) * W, sp = 20 + rnd(k + 9) * 50, y = (H + 100 - ((t * sp * u + rnd(k + 3) * H) % (H + 200))), r = (2 + rnd(k + 5) * 7) * u;
      const a = 0.25 + 0.5 * Math.abs(Math.sin(t * 2 + k)); g.fillStyle = `rgba(243,201,105,${a})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  },
  garland(y, t, t0, dir = 1) {   // marigold string swinging in
    const p = oC(prog(t, t0, t0 + 0.6)); for (let k = 0; k < 26; k++) { const x = (k / 25) * W, yy = y + Math.sin(k / 25 * Math.PI) * 60 * u * dir + (1 - p) * -200 * u * dir;
      g.fillStyle = k % 3 === 0 ? "#e8590c" : "#f59f00"; g.beginPath(); g.arc(x, yy, 22 * u, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.arc(x - 6 * u, yy - 6 * u, 8 * u, 0, 7); g.fill(); }
  },
  frame(im, x, y, w, h, t, t0, isSeq) {   // ornate gold frame
    const p = oB(clamp((t - t0) / 0.4)); g.save(); g.translate(x, y); g.scale(p, p);
    g.shadowColor = "rgba(243,201,105,0.6)"; g.shadowBlur = 40 * u; g.fillStyle = GOLD; g.fillRect(-w / 2 - 16 * u, -h / 2 - 16 * u, w + 32 * u, h + 32 * u); g.shadowBlur = 0;
    g.strokeStyle = MAROON; g.lineWidth = 3 * u; g.strokeRect(-w / 2 - 8 * u, -h / 2 - 8 * u, w + 16 * u, h + 16 * u);
    g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.save(); g.clip(); if (isSeq) cover(seq(im, t, t0), -w / 2, -h / 2, w, h); else cover(IM[im], -w / 2, -h / 2, w, h, 1.04 + 0.03 * prog(t, t0, t0 + 3)); g.restore();
    g.restore();
  },
  render(t) {
    if (t >= T_END) { bg(MAROON); this.sparks(t); endCard(t, T_END, { bg: false, fg: GOLD, titleFam: F.play, titleWeight: 700, sub: "Festive campaigns · by Ideabro Studio", subColor: "#f5e6c8", logo: "white", strike: "#b98", accent: "#f59f00", button: { fill: GOLD, shadow: "#e8590c" } }); grain(t, 0.06); return; }
    bg(MAROON);
    if (t < T_L1) { cover(seq("diya", t, 0, { loop: false }), 0, 0, W, H, 1.05); vignette(0.75); }
    else if (t < T_L2) {
      g.save(); g.globalAlpha = 0.55; cover(seq("hands", t, T_L1, { loop: false }), 0, 0, W, H, 1.05); g.restore(); vignette(0.7);
      if (t >= Wd(1, 1)) this.garland(120 * u, t, Wd(1, 1), 1);
      if (t >= Wd(1, 2)) this.frame("look", CX, H * 0.5, 520 * u, 700 * u, t, Wd(1, 2));
    } else if (t < T_L3) {
      cover(seq("woman", t, T_L2, { loop: false }), 0, 0, W, H, 1.05); vignette(0.6); g.fillStyle = "rgba(58,9,18,0.25)"; g.fillRect(0, 0, W, H);
      [["studio", T_L2 + 0.4, 0.3], ["set designer", Wd(2, 2) + 0.2, 0.42]].forEach(([s, st, yy]) => { if (t < st) return; const p = oB(clamp((t - st) / 0.3));
        g.save(); g.translate(CX, H * yy); g.scale(p, p); font(46 * u, 700, F.inter); const w = tw(s) + 110 * u; g.fillStyle = "rgba(20,4,8,0.75)"; rr(-w / 2, -40 * u, w, 80 * u, 40 * u); g.fill();
        txt(s, -20 * u, 2 * u, { size: 46 * u, weight: 700, color: "#f5e6c8" }); txt("✕", w / 2 - 44 * u, 2 * u, { size: 44 * u, weight: 800, color: "#ff6b6b" });
        g.strokeStyle = "#ff6b6b"; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(-w / 2 + 30 * u, 0); g.lineTo(-w / 2 + 30 * u + (w - 110 * u) * prog(t, st + 0.15, st + 0.4), 0); g.stroke(); g.restore(); });
    } else {
      cover(seq("flame", t, T_L3), 0, 0, W, H, 1.1); g.fillStyle = "rgba(58,9,18,0.7)"; g.fillRect(0, 0, W, H);
      this.garland(90 * u, t, T_L3, 1);
      this.frame("rings", CX - 230 * u, H * 0.48, 380 * u, 500 * u, t, T_L3 + 0.1);
      this.frame("face", CX + 230 * u, H * 0.48, 380 * u, 500 * u, t, T_L3 + 0.35);
      txt("THE DIWALI EDIT · MADE WITH AI", CX, H * 0.48 + 310 * u, { size: 26 * u, fam: F.mono, weight: 700, color: GOLD, alpha: oC(prog(t, T_L3 + 0.6, T_L3 + 1)) });
    }
    this.sparks(t, 40);
    capClean(t, voChunk(t, 5, 0.5), H * 0.84, { size: 62 * u, fam: F.play, weight: 700, color: GOLD, shadow: 22, shadowColor: "rgba(0,0,0,0.9)" });
    grain(t, 0.06);
  },
};
