// A01 · "Shoot ka bill" (Hinglish VO, 9:16). A thermal receipt prints the cost of a traditional shoot,
// tears off, and a tiny $29 receipt prints instead. Captions: kinetic pop, yellow active word.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const ITEMS = [  // [label, amount, appear time]
  ["STUDIO RENTAL x2 DAYS", "45,000", Wd(1, 0)], ["PHOTOGRAPHER + ASSIST", "60,000", Wd(1, 1)], ["MODELS x3", "90,000", Wd(1, 2)],
  ["STYLIST + MAKEUP", "35,000", Wd(1, 3)], ["LIGHTS + CREW", "40,000", Wd(2, 0)], ["LOCATION + PERMITS", "30,000", Wd(2, 0) + 0.25],
  ["RETOUCH + EDIT", "50,000", Wd(2, 1)],
];
const T_TOTAL = Wd(2, 2), T_TEAR = Wd(3, 0), T_NEW = Wd(4, 0), T_END = L[4].v1 + 0.5;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "shoot-ka-bill_hinglish",
  images: { shoe: "assets/img/site/i35.jpg", s1: "assets/img/site/i31.jpg", s2: "assets/img/site/i32.jpg", s3: "assets/img/site/i33.jpg",
            s4: "assets/img/site/i34.jpg", s5: "assets/img/site/i36.jpg", j1: "assets/img/site/i37.jpg", j2: "assets/img/site/i39.jpg" },
  seqs: ["studio"],
  music: { file: "build/music/305.mp3", offset: 2, gain: -9, duck: -8, fadeOut: 0.8 },
  sfx: [["receipt", 0.25, -8], ...ITEMS.map((it) => ["tick", it[2], -14]), ["register", T_TOTAL, -8], ["tear", T_TEAR - 0.05, -4],
        ["whoosh", T_TEAR + 0.1, -10], ["pop", Wd(3, 3), -10], ["receipt", T_NEW, -10], ["stamp", L[4].words[5].s, -4], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t < T_END) this.scene(t); else endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, accent: "#d33", strike: "#8a8a8a", cta: "Enroll now  →" });
    capPop(t, voChunk(t, 3, 0.5), H * 0.73, { size: 84 * u });
    grain(t, 0.06);
  },
  receipt(x, y, w, lines, total, opts = {}) {   // draws a thermal receipt (paper) of given visible height
    const h = opts.h; g.save();
    g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 40 * u; g.fillStyle = "#f7f5ef"; g.fillRect(x, y, w, h); g.shadowBlur = 0;
    // zigzag bottom edge
    g.fillStyle = "#f7f5ef"; g.beginPath(); const zz = 18 * u; for (let k = 0; k <= w / zz; k++) { g.lineTo(x + k * zz, y + h + (k % 2 ? zz * 0.6 : 0)); } g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.fill();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    const m = 44 * u; let yy = y + 84 * u; const s = 46 * u;
    txt(opts.title || "PRODUCT SHOOT", x + w / 2, yy, { size: 56 * u, weight: 700, fam: F.mono, color: C.ink }); yy += 60 * u;
    txt(opts.sub || "3-DAY CAMPAIGN · INVOICE #0417", x + w / 2, yy, { size: 28 * u, weight: 400, fam: F.mono, color: "#555" }); yy += 44 * u;
    g.fillStyle = "#999"; for (let k = x + m; k < x + w - m; k += 16 * u) g.fillRect(k, yy, 8 * u, 2 * u); yy += 50 * u;
    lines.forEach(([a, b, a2]) => { if (a2 === undefined || opts.t >= a2) { txt(a, x + m, yy, { size: s * 0.82, weight: 400, fam: F.mono, color: C.ink, align: "left" }); txt(b, x + w - m, yy, { size: s * 0.82, weight: 700, fam: F.mono, color: C.ink, align: "right" }); yy += 66 * u; } });
    if (total) { g.fillStyle = "#999"; for (let k = x + m; k < x + w - m; k += 16 * u) g.fillRect(k, yy, 8 * u, 2 * u); yy += 64 * u;
      txt(total[0], x + m, yy, { size: 54 * u, weight: 700, fam: F.mono, color: C.ink, align: "left" }); txt(total[1], x + w - m, yy, { size: 64 * u, weight: 700, fam: F.mono, color: total[2] || "#c62828", align: "right" }); yy += 66 * u;
      txt(total[3] || "", x + w / 2, yy, { size: 26 * u, weight: 400, fam: F.mono, color: "#777" }); }
    g.restore();
  },
  scene(t) {
    if (t < T_TEAR + 0.6) {
      bg("#0d0d0d");
      const im = seq("studio", t, 0, { loop: false }); g.save(); g.filter = `blur(${6 * u}px) brightness(0.45)`; cover(im, -20, -20, W + 40, H + 40, 1.05); g.restore();
      // receipt prints downward, then tears and falls
      const rw = 900 * u, rx = CX - rw / 2; const shown = ITEMS.filter((i) => t >= i[2]).length;
      let rh = 300 * u + shown * 66 * u + (t >= T_TOTAL ? 230 * u : 0); rh = Math.min(rh, 300 * u + prog(t, 0.25, 1.4) * 1400 * u);
      let ry = H * 0.1, rot = 0;
      if (t > T_TEAR) { const p = iC(prog(t, T_TEAR, T_TEAR + 0.6)); ry += p * H * 1.1; rot = p * 0.35; }
      g.save(); g.translate(CX, ry); g.rotate(rot); g.translate(-CX, -ry);
      this.receipt(rx, ry, rw, ITEMS, t >= T_TOTAL ? ["TOTAL", "₹3,50,000", "#c62828", "*typical estimate, metro city, 1 product"] : null, { h: rh, t });
      g.restore();
      // printer slot
      g.fillStyle = "#1c1c1c"; rr(CX - 480 * u, H * 0.1 - 34 * u, 960 * u, 40 * u, 12 * u); g.fill();
      if (t > T_TOTAL && t < T_TEAR) { const p = oB(clamp((t - T_TOTAL - 0.1) / 0.3)); g.save(); g.translate(CX + 230 * u, H * 0.6); g.rotate(-0.25); g.scale(p, p);
        g.strokeStyle = "#c62828"; g.lineWidth = 6 * u; rr(-170 * u, -50 * u, 340 * u, 100 * u, 10 * u); g.stroke(); txt("LAKHON MEIN", 0, 4 * u, { size: 40 * u, fam: F.mono, weight: 700, color: "#c62828" }); g.restore(); }
    }
    if (t >= T_TEAR + 0.25) {   // one product photo -> campaign
      const a = prog(t, T_TEAR + 0.25, T_TEAR + 0.5); g.save(); g.globalAlpha = a; gridBg(); g.restore();
      const cards = [["s1", -300, -420], ["s2", 300, -440], ["j1", -320, 160], ["s3", 310, 170], ["s4", -40, -700], ["j2", 20, 520]];
      cards.forEach(([n, x, y], k) => { const st = Wd(3, 3) + k * 0.12; if (t < st) return; const p = oB(clamp((t - st) / 0.25));
        const im = IM[n], w = 300 * u, h = w * im.height / im.width; g.save(); g.translate(CX + x * u, H * 0.42 + y * u); g.rotate((k % 2 ? 1 : -1) * 0.06); g.scale(p, p);
        g.fillStyle = C.lav; g.fillRect(-w / 2 + 8 * u, -h / 2 + 8 * u, w, h); g.drawImage(im, -w / 2, -h / 2, w, h); g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); });
      const im = IM.shoe, w = 420 * u * (t >= T_NEW ? 1 - 0.3 * oC(prog(t, T_NEW, T_NEW + 0.4)) : 1), h = w * im.height / im.width, yy = H * 0.42 - (t >= T_NEW ? oC(prog(t, T_NEW, T_NEW + 0.4)) * 260 * u : 0);
      g.save(); g.globalAlpha = a; g.fillStyle = C.lav; g.fillRect(CX - w / 2 + 10 * u, yy - h / 2 + 10 * u, w, h); g.drawImage(im, CX - w / 2, yy - h / 2, w, h); g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.strokeRect(CX - w / 2, yy - h / 2, w, h);
      txt("1 PRODUCT PHOTO", CX, yy - h / 2 - 34 * u, { size: 28 * u, fam: F.mono, color: C.ink }); g.restore();
      if (t >= T_NEW) {   // the $29 receipt
        const rw = 760 * u, rh = Math.min(640 * u, 140 * u + prog(t, T_NEW, T_NEW + 0.9) * 700 * u);
        g.save(); g.translate(0, H * 0.36); this.receipt(CX - rw / 2, 0, rw, [["AI & ADVERTISING", "COURSE"], ["11 MODULES · 41 LESSONS", ""], ["LIFETIME ACCESS", ""]], ["TOTAL", "$29", "#1b7f3a", "launch price · was $99"], { h: rh, t, title: "IDEABRO STUDIO", sub: "ONE-TIME · NO SHOOT NEEDED" }); g.restore();
        const ts = L[4].words[5].s; if (t > ts) { const p = oB(clamp((t - ts) / 0.25)); g.save(); g.translate(CX + 210 * u, H * 0.36 + 560 * u); g.rotate(-0.2); g.scale(p, p);
          g.strokeStyle = "#1b7f3a"; g.lineWidth = 6 * u; rr(-150 * u, -46 * u, 300 * u, 92 * u, 10 * u); g.stroke(); txt("SIRF $29", 0, 4 * u, { size: 44 * u, fam: F.mono, weight: 700, color: "#1b7f3a" }); g.restore(); }
      }
    }
  },
};
