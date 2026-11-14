// B06 · "How much does an ad like this cost?" (English VO Reyaansh, 9:16, shows price). Luxury product frames, the
// usual cost lines get struck out in red, then the course price. Captions: white Inter Black, active word in red.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, RED = "#E5383B";
const ITEMS = [["STUDIO DAY", "i32", Wd(1, 1)], ["CREW", "i24", Wd(1, 3)], ["MODEL", "i21", Wd(1, 5)]];
const T_NONE = L[2].at, T_PRICE = L[3].at, T_END = L[3].v1 + 0.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "what-does-this-ad-cost",
  images: { i18: "assets/img/site/i18.jpg", i32: "assets/img/site/i32.jpg", i24: "assets/img/site/i24.jpg", i21: "assets/img/site/i21.jpg", i22: "assets/img/site/i22.jpg" },
  music: { file: "build/music_el/luxhouse.mp3", offset: 8, gain: -10, duck: -6, fadeOut: 0.8 },
  sfx: [...ITEMS.map((it) => ["stamp", it[2], -12]), ["tear", T_NONE + 0.5, -8], ["stamp", T_NONE + 1.1, -6], ["register", T_PRICE + 1.7, -10], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0c0c0c", fg: "#fff", price: true, accent: "#fff", button: { fill: RED, color: "#fff", shadow: "#fff" }, cta: "Enroll now  →" }); grain(t, 0.05); return; }
    bg("#000");
    if (t < ITEMS[0][2] - 0.05) { kb(IM.i18, t, 0, ITEMS[0][2], 1.02, 1.12, 0.5, 0.45); }
    else if (t < T_NONE) { const k = ITEMS.reduce((a, it, i) => (t >= it[2] - 0.05 ? i : a), 0); kb(IM[ITEMS[k][1]], t, ITEMS[k][2], 1.2, 1.05, 1.12, 0.5, 0.35); }
    else if (t < T_PRICE) kb(IM.i22, t, T_NONE, T_PRICE - T_NONE, 1.02, 1.1, 0.5, 0.4);
    else { kb(IM.i18, t, T_PRICE, 4, 1.1, 1.18); g.fillStyle = `rgba(0,0,0,${0.6 * prog(t, T_PRICE, T_PRICE + 0.4)})`; g.fillRect(0, 0, W, H); }
    shade(H * 0.45, H, 0.7);
    // the cost list (builds during line 1, struck out on line 2)
    if (t >= ITEMS[0][2] - 0.05 && t < T_PRICE) {
      ITEMS.forEach(([lab, , st], i) => { if (t < st - 0.05) return; const p = oB(clamp((t - st + 0.05) / 0.25)), y = 330 * u + i * 130 * u;
        g.save(); g.translate(CX, y); g.scale(p, p); font(64 * u, 900, F.inter); const w0 = tw(lab) + 70 * u; g.fillStyle = "rgba(0,0,0,0.72)"; rr(-w0 / 2, -50 * u, w0, 100 * u, 12 * u); g.fill();
        txt(lab, 0, 3 * u, { size: 64 * u, weight: 900, color: "#fff" });
        const sp = ioC(prog(t, T_NONE + 0.4 + i * 0.12, T_NONE + 0.7 + i * 0.12)); if (sp > 0) { g.strokeStyle = RED; g.lineWidth = 10 * u; g.beginPath(); g.moveTo(-w0 / 2 + 10 * u, 0); g.lineTo(-w0 / 2 + 10 * u + (w0 - 20 * u) * sp, 0); g.stroke(); }
        g.restore(); });
      if (t >= T_NONE + 1.1) { const p = clamp((t - T_NONE - 1.1) / 0.18), s = 1.6 - 0.6 * oC(p); g.save(); g.translate(CX, 780 * u); g.rotate(-0.08); g.scale(s, s); g.globalAlpha = clamp(p * 2);
        g.strokeStyle = RED; g.lineWidth = 8 * u; rr(-300 * u, -70 * u, 600 * u, 140 * u, 14 * u); g.stroke(); txt("MADE WITH AI", 0, 4 * u, { size: 74 * u, weight: 900, color: RED }); g.restore(); }
    }
    if (t >= T_PRICE) {
      const p = oB(clamp((t - T_PRICE - 1.6) / 0.35));
      txt("AI & ADVERTISING · FULL COURSE", CX, 600 * u, { size: 34 * u, fam: F.mono, weight: 700, color: "#fff", alpha: oC(prog(t, T_PRICE + 0.2, T_PRICE + 0.6)), ls: 3 });
      g.save(); g.translate(CX, 760 * u); g.scale(p, p); txt(PRICE, 0, 0, { size: 230 * u, weight: 900, color: "#fff" }); g.restore();
      txt("one-time  ·  lifetime access", CX, 900 * u, { size: 40 * u, weight: 600, color: "#fff", alpha: 0.85 * oC(prog(t, T_PRICE + 2.0, T_PRICE + 2.4)) });
    }
    capPop(t, voChunk(t, 3, 0.4), H * 0.735, { size: 92 * u, weight: 900, upper: false, hi: RED, stroke: "rgba(0,0,0,0)", strokeW: 0, shadow: 18, bounce: 0.6 });
    grain(t, 0.04);
  },
};
