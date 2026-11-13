// A06 · "Anyone can press generate. Few can direct." (English VO, trailer voice, 9:16). Director's-monitor framing
// (frame lines, timecode, A-CAM) around AI footage from the Ideabro drive, clapper slate on "direct".
// Captions: yellow cinema subtitles in the lower bar.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_CLAP = Wd(1, 0), T_END = L[4].v1 + 0.6;
const CUTS = [  // [start, seq|image, label]
  [Wd(2, 0), "cheetah", "LIGHT"], [Wd(2, 1), "sea", "COLOUR"], [Wd(2, 2), "leopard", "COMPOSITION"],
  [Wd(3, 0), "img:shoe", "THE REAL PRODUCT"], [Wd(3, 3), "zep", "ONE LOOK"], [Wd(3, 5), "moto", "EVERY FRAME"], [Wd(3, 6) + 0.35, "car", ""],
  [Wd(4, 0), "bts", "SHOT"], [Wd(4, 4), "cheetah", "NOT GENERATED"],
];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "anyone-can-generate-few-can-direct",
  images: { shoe: "assets/img/site/i31.jpg" },
  seqs: ["cheetah", "car", "moto", "leopard", "sea", "zep", "bts"],
  music: { file: "build/music/676.mp3", offset: 0, gain: -10, duck: -8, fadeOut: 0.8 },
  sfx: [["tick", Wd(0, 2), -8], ["glitch", Wd(0, 3), -10], ["clapper", T_CLAP - 0.05, -2], ["boom", T_CLAP, -8], ...CUTS.map((c) => ["shutter", c[0], -16]), ["riser", L[4].v0 - 1.6, -14], ["boom", T_END - 0.05, -8]],
  monitor(t) {   // director's monitor overlay
    const fx = 40 * u, fy = 330 * u, fw = W - 80 * u, fh = 1160 * u;
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 2 * u;
    const c = 50 * u; [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x + sx * c, y); g.lineTo(x, y); g.lineTo(x, y + sy * c); g.stroke(); });
    const f = FR(t), tc = `00:00:${String(Math.floor(t)).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
    txt("A-CAM  ·  35mm  ·  T2.0", fx, fy - 40 * u, { size: 26 * u, fam: F.mono, color: "#fff", align: "left", alpha: 0.8 });
    txt(tc, fx + fw, fy - 40 * u, { size: 26 * u, fam: F.mono, color: "#fff", align: "right", alpha: 0.8 });
    if (f % 30 < 18) { g.fillStyle = "#e53935"; g.beginPath(); g.arc(fx + fw - 260 * u, fy - 40 * u, 9 * u, 0, 7); g.fill(); }
    return [fx, fy, fw, fh];
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#050505", fg: "#fff", titleFam: F.serif, sub: "Learn to direct, not just generate", button: { fill: C.yellow } }); grain(t, 0.08); return; }
    bg("#050505");
    const [fx, fy, fw, fh] = [40 * u, 330 * u, W - 80 * u, 1160 * u];
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    if (t < T_CLAP) {   // "press generate": a bland prompt box, button pressed, flat grey result
      g.fillStyle = "#1b1b1b"; g.fillRect(fx, fy, fw, fh);
      txt("a product ad, high quality, 4k", CX, fy + 380 * u, { size: 34 * u, fam: F.mono, color: "#9a9a9a" });
      const pressed = t > Wd(0, 3) - 0.1; const bs = pressed ? 0.94 : 1;
      g.save(); g.translate(CX, fy + 520 * u); g.scale(bs, bs); g.fillStyle = pressed ? "#555" : "#777"; rr(-180 * u, -50 * u, 360 * u, 100 * u, 50 * u); g.fill(); txt("Generate", 0, 2 * u, { size: 38 * u, weight: 700, color: "#eee" }); g.restore();
      if (pressed) { const p = prog(t, Wd(0, 3), Wd(0, 3) + 0.5); g.fillStyle = `rgba(120,120,120,${0.5 * p})`; g.fillRect(fx + 140 * u, fy + 640 * u, fw - 280 * u, 380 * u);
        txt("same as everyone else’s", CX, fy + 830 * u, { size: 30 * u, fam: F.mono, color: "#bbb", alpha: p }); }
    } else if (t < CUTS[0][0]) {   // clapper slate
      const p = prog(t, T_CLAP - 0.05, T_CLAP + 0.12); g.fillStyle = "#0a0a0a"; g.fillRect(fx, fy, fw, fh);
      g.save(); g.translate(CX, fy + fh * 0.52);
      g.fillStyle = "#141414"; g.strokeStyle = "#fff"; g.lineWidth = 4 * u; rr(-380 * u, -200 * u, 760 * u, 460 * u, 12 * u); g.fill(); g.stroke();
      [["SCENE", "01"], ["TAKE", "1"], ["DIRECTOR", "YOU"]].forEach(([a, b], i) => { txt(a, -340 * u, -110 * u + i * 120 * u, { size: 30 * u, fam: F.mono, color: "#aaa", align: "left" }); txt(b, 340 * u, -110 * u + i * 120 * u, { size: 70 * u, fam: F.bebas, weight: 400, color: "#fff", align: "right" }); });
      g.save(); g.translate(-380 * u, -200 * u); g.rotate(-0.45 * (1 - oC(p)));
      g.fillStyle = "#fff"; g.fillRect(0, -70 * u, 760 * u, 70 * u); g.fillStyle = "#141414"; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(k * 100 * u, -70 * u); g.lineTo(k * 100 * u + 50 * u, -70 * u); g.lineTo(k * 100 * u + 90 * u, 0); g.lineTo(k * 100 * u + 40 * u, 0); g.fill(); }
      g.restore(); g.restore();
    } else {
      const c = CUTS.filter((x) => t >= x[0]).pop(); const k = CUTS.indexOf(c), z = 1.06 + 0.06 * prog(t, c[0], (CUTS[k + 1] || [T_END])[0]);
      if (c[1].startsWith("img:")) cover(IM[c[1].slice(4)], fx, fy, fw, fh, z); else cover(seq(c[1], t, c[0], { loop: false }), fx, fy, fw, fh, z);
      if (c[2] === "COMPOSITION") { g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 2 * u; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(fx + fw * i / 3, fy); g.lineTo(fx + fw * i / 3, fy + fh); g.moveTo(fx, fy + fh * i / 3); g.lineTo(fx + fw, fy + fh * i / 3); g.stroke(); } }
      // cinematic grade
      g.fillStyle = "rgba(20,30,40,0.12)"; g.fillRect(fx, fy, fw, fh); vignette(0.45);
      if (c[2]) { const p = oC(clamp((t - c[0]) / 0.25)); txt(c[2], fx + 40 * u, fy + 60 * u, { size: 30 * u, fam: F.mono, weight: 700, color: C.yellow, align: "left", alpha: p, ls: 3 }); }
    }
    g.restore();
    this.monitor(t);
    // big title line for the two hook lines, subtitles for the rest
    if (t < CUTS[0][0]) { const ch = voChunk(t, 4, 0.4); capBlock(t, ch, 1640 * u, { size: 110 * u, fam: F.anton, hiWord: "direct", hi: C.yellow }); }
    else capSubtitle(t, voChunk(t, 6, 0.4), 1630 * u, { size: 58 * u });
    grain(t, 0.08);
  },
};
