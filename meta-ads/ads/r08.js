// R08 · "NO-SHOOT ADVERTISING" — fast poster edit (style ref 8). Grey/white editorial bg, huge black Anton words,
// footage cut-outs with lime rings, a torn red poster with giant white condensed type, product cards stamped
// "MADE WITH AI", beat-cut labels, a ramping counter, an Instagram-style profile card. Music r08 (drift phonk).
const B = 0.6035, at = (n) => 0.07 + n * B;
const S = [0, at(4), at(8), at(12), at(18), at(22), at(34), at(46), at(56), at(62), at(68)], T_END = S[10];
const RED = "#e0262b", LIME = "#c6f432", INK = "#0d0d0d";
const CUTS = [["nk_box", "FASHION"], ["glasses", "CGI"], ["ugc_glow", "UGC"], ["belt", "BEAUTY"], ["moto", "FILMS"], ["london", "BILLBOARDS"]];
const TILES = ["falls", "beach", "giant_city", "phone_store", "surf", "faces"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "no-shoot-advertising",
  seqs: ["ny_close", "luna_lime", "berry", "bottles", "can_spin", ...CUTS.map((c) => c[0]), "giant_girl", "ny2", ...TILES],
  music: { file: "build/music_el/r08.mp3", offset: 0, gain: -6, fadeOut: 0.8 },
  sfx: [...S.slice(1, 10).map((s) => ["hit_punch", s, -9]), ["paper_slide", S[1], -10], ...[0, 1, 2, 3].map((i) => ["stamp", S[3] + 1.2 + i * 0.3, -10]), ...CUTS.map((c, i) => ["swoosh_fast", S[5] + i * 2 * B - 0.08, -12]),
        ["riser_short", S[6] + 2.0, -10], ["register", S[6] + 4.3, -10], ["ui_click", S[9] + 1.2, -6], ["hit_big", T_END, -8]],
  grey() { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#e9eaec"); gr.addColorStop(1, "#c9cbcf"); g.fillStyle = gr; g.fillRect(0, 0, W, H); tex("paperW", 0.25); },
  huge(s, x, y, size, t, t0, o = {}) { const p = clamp((t - t0) / 0.16); if (p <= 0) return; const sz = Math.min(size, fitSize(s, o.maxW || W * 0.9, size, 400, F.anton)); g.save(); g.translate(x, y); g.scale(lerp(1.25, 1, oC(p)), lerp(1.25, 1, oC(p)));
    txt(s, 0, 0, { size: sz, fam: F.anton, weight: 400, color: o.color || INK, alpha: clamp(p * 3), align: o.align || "center", shadow: o.shadow || 0 }); g.restore(); },
  torn(x, y, w, h, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); for (let k = 0; k <= 30; k++) g.lineTo(x + (w * k) / 30, y + (rnd(k * 3.1) - 0.5) * 30 * u); g.lineTo(x + w, y + h);
    for (let k = 30; k >= 0; k--) g.lineTo(x + (w * k) / 30, y + h + (rnd(k * 5.7) - 0.5) * 30 * u); g.closePath(); g.fill(); },
  rings(cx, cy, r, t) { for (let i = 0; i < 4; i++) { g.strokeStyle = i % 2 ? INK : LIME; g.lineWidth = 46 * u; g.beginPath(); g.arc(cx, cy, r + i * 92 * u, Math.PI * 0.9 + t * 0.4, Math.PI * 2.1 + t * 0.4); g.stroke(); } },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#e9eaec", fg: INK, titleFam: F.anton, titleWeight: 400, titleSize: 130, title: "AI & ADVERTISING", button: { fill: RED, color: "#fff", shadow: INK }, cta: "JOIN NOW  →" }); return; }
    const k = cutIdx(t, S.slice(0, 10)), t0 = S[k];
    if (k === 0) { bg("#111"); this.rings(CX, 1200 * u, 260 * u, t); vcard(seq("ny_close", t, 0), CX - 300 * u, 760 * u, 600 * u, 900 * u, { r: 0, shadow: 60, filter: "contrast(1.1)" });
      this.huge("THIS", 80 * u, 330 * u, 220 * u, t, 0.07, { color: "#fff", align: "left" }); this.huge("IS", 80 * u, 530 * u, 220 * u, t, at(1), { color: "#fff", align: "left" }); this.huge("AI ADS.", W - 80 * u, 530 * u, 140 * u, t, at(2), { color: LIME, align: "right" }); }
    else if (k === 1) { bg("#111"); g.save(); g.filter = "grayscale(1) contrast(1.3) brightness(0.6)"; cover(IM.i0, 0, 0, W, H, 1.1); g.restore(); this.torn(0, 220 * u, W, 820 * u, RED);
      this.huge("NO-SHOOT", CX, 450 * u, 260 * u, t, t0, { color: "#fff" }); this.huge("ADVERTISING", CX, 760 * u, 210 * u, t, t0 + B, { color: "#fff" });
      vcard(seq("luna_lime", t, t0), CX - 280 * u, 1000 * u, 560 * u, 680 * u, { shadow: 60, rot: -0.03 }); txt("AI & ADVERTISING", 90 * u, 1700 * u, { size: 26 * u, fam: F.mono, weight: 700, color: "#fff", align: "left" }); }
    else if (k === 2) { this.grey(); this.huge("and the", 90 * u, 820 * u, 140 * u, t, t0, { align: "left" }); this.huge("wild thing is", 90 * u, 990 * u, 160 * u, t, t0 + B, { align: "left" }); }
    else if (k === 3) { this.grey(); [["berry", 120, 320], ["bottles", 560, 320], ["can_spin", 120, 960], ["luna_lime", 560, 960]].forEach(([s2, x, y], i) => {
        const p = oB(clamp((t - t0 - i * 0.12) / 0.3)); g.save(); g.translate((x + 200) * u, (y + 280) * u); g.scale(p, p); g.fillStyle = "#fff"; rr(-200 * u, -280 * u, 400 * u, 560 * u, 14 * u); g.fill(); g.restore();
        if (p > 0.5) { vcard(seq(i === 3 ? "can_spin" : s2, t, t0), (x + 16) * u, (y + 16) * u, 368 * u, 430 * u, { shadow: false, filter: i === 3 ? "hue-rotate(90deg)" : "none" }); txt(["Citrus can", "Fruit shots", "Lime soda", "Sparkling can"][i], (x + 24) * u, (y + 490) * u, { size: 26 * u, fam: F.tight, weight: 800, color: INK, align: "left" });
          txt("AI product shoot", (x + 24) * u, (y + 526) * u, { size: 20 * u, fam: F.tight, weight: 500, color: "#777", align: "left" }); }
        const sp = clamp((t - t0 - 1.2 - i * 0.3) / 0.15); if (sp > 0) { g.save(); g.translate((x + 200) * u, (y + 230) * u); g.rotate(-0.12); g.scale(1.6 - 0.6 * sp, 1.6 - 0.6 * sp); g.globalAlpha = sp; g.fillStyle = RED; rr(-160 * u, -46 * u, 320 * u, 92 * u, 8 * u); g.fill();
          txt("MADE WITH AI", 0, 4 * u, { size: 46 * u, fam: F.anton, weight: 400, color: "#fff" }); g.restore(); } }); }
    else if (k === 4) { this.grey(); this.huge("let me", 90 * u, 860 * u, 180 * u, t, t0, { align: "left" }); this.huge("show you.", 90 * u, 1060 * u, 200 * u, t, t0 + B, { align: "left", color: RED });
      g.fillStyle = RED; g.fillRect(90 * u, 1180 * u, (W - 180 * u) * oC(prog(t, t0 + 1.4, t0 + 2.0)), 14 * u); }
    else if (k === 5) { const j = Math.min(CUTS.length - 1, Math.floor((t - t0) / (2 * B))), tj = t0 + j * 2 * B; g.save(); g.filter = "contrast(1.1)"; kb(seq(CUTS[j][0], t, tj), t, tj, 2 * B, 1.14, 1.04, 0.5, 0.4); g.restore();
      shade(H * 0.6, H, 0.6); this.huge(CUTS[j][1], CX, 1450 * u, 230 * u, t, tj, { color: "#fff", shadow: 20 }); txt(`${j + 1}/${CUTS.length}`, W - 80 * u, 300 * u, { size: 34 * u, fam: F.anton, weight: 400, color: "#fff", align: "right", shadow: 10 }); }
    else if (k === 6) { this.grey(); const n = Math.round(lerp(1, 100, Math.pow(prog(t, t0 + 0.6, t0 + 4.4), 1.6)));
      g.fillStyle = RED; g.fillRect(CX - 330 * u, 560 * u, 660 * u, 1000 * u); vcard(seq("giant_girl", t, t0), CX - 300 * u, 600 * u, 600 * u, 940 * u, { shadow: false, ay: 0.4 });
      this.huge(`${n} ADS`, CX, 380 * u, 230 * u, t, t0); txt(n < 100 ? "from one product photo" : "from one product photo. no shoot.", CX, 1660 * u, { size: 40 * u, fam: F.tight, weight: 800, color: INK }); }
    else if (k === 7) { this.grey(); const p = oX(clamp((t - t0) / 0.5)); g.save(); g.translate(0, (1 - p) * 400 * u); g.fillStyle = "#fff"; rr(70 * u, 260 * u, W - 140 * u, 1380 * u, 30 * u); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(190 * u, 390 * u, 70 * u, 0, 7); g.fill(); logo(190 * u, 390 * u, 70 * u, "white");
      txt("ai.and.advertising", 290 * u, 360 * u, { size: 40 * u, fam: F.tight, weight: 800, color: INK, align: "left" }); txt("by Ideabro Studio", 290 * u, 410 * u, { size: 28 * u, fam: F.tight, weight: 500, color: "#666", align: "left" });
      [["11", "modules"], ["41", "lessons"], ["∞", "ideas"]].forEach(([a, b2], i) => { txt(a, (230 + i * 300) * u, 530 * u, { size: 56 * u, fam: F.tight, weight: 800, color: INK }); txt(b2, (230 + i * 300) * u, 585 * u, { size: 26 * u, fam: F.tight, weight: 500, color: "#666" }); });
      g.fillStyle = "#2f6bff"; rr(110 * u, 640 * u, 420 * u, 70 * u, 14 * u); g.fill(); txt("Join", 320 * u, 676 * u, { size: 32 * u, fam: F.tight, weight: 800, color: "#fff" });
      g.fillStyle = "#eee"; rr(550 * u, 640 * u, 420 * u, 70 * u, 14 * u); g.fill(); txt("Message", 760 * u, 676 * u, { size: 32 * u, fam: F.tight, weight: 800, color: INK });
      TILES.forEach((s2, i) => { const c = i % 3, r = Math.floor(i / 3), tw0 = (W - 140 * u - 8 * u) / 3; vcard(seq(s2, t, t0), 70 * u + c * (tw0 + 4 * u), 740 * u + r * (tw0 * 1.3 + 4 * u), tw0, tw0 * 1.3, { shadow: false }); });
      g.restore(); }
    else if (k === 8) { g.save(); g.filter = "grayscale(0.3) contrast(1.15)"; kb(seq("ny2", t, t0), t, t0, S[9] - t0, 1.05, 1.12); g.restore(); shade(0, H * 0.4, 0.6, true);
      this.huge("THIS COULD", CX, 330 * u, 150 * u, t, t0, { color: "#fff" }); this.huge("BE YOU.", CX, 520 * u, 230 * u, t, t0 + B, { color: LIME }); }
    else { bg("#0d0d0d"); const p = oB(clamp((t - t0) / 0.4)), rg = g.createLinearGradient(CX - 200 * u, 700 * u, CX + 200 * u, 1100 * u); rg.addColorStop(0, "#feda75"); rg.addColorStop(0.4, "#d62976"); rg.addColorStop(1, "#4f5bd5");
      g.save(); g.translate(CX, 900 * u); g.scale(p, p); g.strokeStyle = rg; g.lineWidth = 26 * u; rr(-190 * u, -190 * u, 380 * u, 380 * u, 100 * u); g.stroke(); logo(0, 0, 170 * u, "white"); g.restore();
      txt("AI & ADVERTISING", CX, 1230 * u, { size: 70 * u, fam: F.anton, weight: 400, color: "#fff", alpha: oC(prog(t, t0 + 0.4, t0 + 0.7)) });
      joinButton(t, t0 + 0.9, CX, 1420 * u, "Join now", { fill: RED, color: "#fff", glow: "rgba(224,38,43,0.6)", tapAt: 0.6 }); }
    grain(t, 0.04);
  },
  images: { i0: "assets/img/site/i24.jpg" },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[6], kicker: "NO-SHOOT ADVERTISING", h1: "This could", h2: "be you.", f1: F.anton, s1: "", f2: F.anton, accent: LIME, btn: RED, glow: "rgba(224,38,43,0.6)",
  end: { bg: "#e9eaec", fg: INK, titleFam: F.anton, titleWeight: 400, titleSize: 130, title: "AI & ADVERTISING", button: { fill: RED, color: "#fff", shadow: INK } } });
