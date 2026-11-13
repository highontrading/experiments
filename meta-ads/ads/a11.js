// A11 · "The price tag" (English VO Reyaansh, 4:5 feed). A luxury boutique price tag swings on its string:
// $99 is struck, $29 stamped, the tag flips to show what's inside. Captions: large Instrument Serif.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_29 = Wd(1, 0), T_FLIP = Wd(2, 0), T_LIFE = Wd(3, 0), T_END = L[3].v1 + 0.6;
const GOLD = "#E8C77A";
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "price-tag-luxury",
  images: { bgimg: "assets/img/site/i04.jpg" },
  music: { file: "build/music/640.mp3", offset: 2, gain: -9, duck: -7, fadeOut: 0.8 },
  sfx: [["tick", 0.3, -12], ["pencil", T_29 - 0.05, -6], ["stamp", T_29 + 0.25, -4], ["pageflip", T_FLIP - 0.1, -6], ["stamp", T_LIFE + 0.1, -6], ["register", Wd(3, 2), -10], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0c0b09", fg: GOLD, logo: "white", subColor: "#e9e2d0", strike: "#776", accent: "#c0392b", button: { fill: GOLD, shadow: "#6b5a2e" } }); grain(t, 0.06); return; }
    bg("#0c0b09"); g.save(); g.globalAlpha = 0.35; g.filter = "blur(14px) saturate(0.6)"; cover(IM.bgimg, -40, -40, W + 80, H + 80, 1.1 + 0.03 * t); g.restore(); vignette(0.8);
    // string
    const ax = CX, ay = -20 * u, swing = 0.12 * Math.exp(-t * 0.35) * Math.sin(t * 2.6) + (t > T_29 ? 0.05 * Math.exp(-(t - T_29) * 2) * Math.sin((t - T_29) * 14) : 0);
    const len = 360 * u; const tx = ax + Math.sin(swing) * len, ty = ay + Math.cos(swing) * len;
    g.strokeStyle = "#cbb27a"; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(ax, ay); g.lineTo(tx, ty); g.stroke();
    // tag (flips horizontally at T_FLIP)
    const fp = prog(t, T_FLIP - 0.15, T_FLIP + 0.25), sx = Math.abs(Math.cos(fp * Math.PI)), back = fp > 0.5;
    const tw0 = 560 * u, th0 = 760 * u;
    g.save(); g.translate(tx, ty); g.rotate(swing); g.scale(Math.max(0.02, sx), 1);
    g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 50 * u; g.shadowOffsetY = 20 * u;
    g.fillStyle = "#f3ecdd"; g.beginPath(); g.moveTo(-tw0 / 2 + 80 * u, 0); g.lineTo(tw0 / 2 - 80 * u, 0); g.lineTo(tw0 / 2, 90 * u); g.lineTo(tw0 / 2, th0); g.lineTo(-tw0 / 2, th0); g.lineTo(-tw0 / 2, 90 * u); g.closePath(); g.fill();
    g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.fillStyle = "#0c0b09"; g.beginPath(); g.arc(0, 60 * u, 18 * u, 0, 7); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3 * u; g.beginPath(); g.arc(0, 60 * u, 24 * u, 0, 7); g.stroke();
    g.strokeStyle = "rgba(20,20,20,0.15)"; g.lineWidth = 2 * u; g.strokeRect(-tw0 / 2 + 24 * u, 120 * u, tw0 - 48 * u, th0 - 150 * u);
    if (!back) {
      txt("IDEABRO STUDIO", 0, 170 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#6b5a2e", ls: 3 });
      txt("AI & Advertising", 0, 250 * u, { size: 58 * u, fam: F.serif, weight: 400, color: C.ink });
      txt("the complete course", 0, 300 * u, { size: 26 * u, fam: F.serif, style: "italic", weight: 400, color: "#555" });
      txt("$99", 0, 450 * u, { size: 150 * u, fam: F.play, weight: 700, color: t > T_29 ? "#9a9a9a" : C.ink });
      if (t > T_29) { const sp = prog(t, T_29 - 0.05, T_29 + 0.15); g.strokeStyle = "#c0392b"; g.lineWidth = 9 * u; g.beginPath(); g.moveTo(-150 * u, 470 * u); g.lineTo(-150 * u + 300 * u * sp, 420 * u); g.stroke();
        const p = oB(clamp((t - T_29 - 0.25) / 0.25)); g.save(); g.translate(40 * u, 600 * u); g.rotate(-0.12); g.scale(p, p);
        g.strokeStyle = "#c0392b"; g.lineWidth = 7 * u; rr(-170 * u, -75 * u, 340 * u, 150 * u, 14 * u); g.stroke(); txt("$29", 0, 6 * u, { size: 110 * u, fam: F.play, weight: 700, color: "#c0392b" }); g.restore(); }
    } else {
      g.scale(1, 1); txt("WHAT'S INSIDE", 0, 180 * u, { size: 26 * u, fam: F.mono, weight: 700, color: "#6b5a2e", ls: 3 });
      ["11 modules", "41 lessons", "Prompt library", "Brief + storyboard templates", "Capstone campaign", "Pricing & pitching AI ads"].forEach((s, i) => {
        const p = oC(clamp((t - T_FLIP - 0.2 - i * 0.18) / 0.3)); txt(s, 0, 260 * u + i * 66 * u, { size: 40 * u, fam: F.serif, weight: 400, color: C.ink, alpha: p }); });
      if (t >= T_LIFE) { const p = oB(clamp((t - T_LIFE - 0.1) / 0.25)); g.save(); g.translate(0, 680 * u); g.rotate(0.06); g.scale(p, p);
        g.fillStyle = "#1b4d2e"; rr(-220 * u, -44 * u, 440 * u, 88 * u, 44 * u); g.fill(); txt("LIFETIME · ONE PAYMENT", 0, 3 * u, { size: 28 * u, fam: F.mono, weight: 700, color: "#f3ecdd" }); g.restore(); }
    }
    g.restore();
    capClean(t, voChunk(t, 4, 0.5), H * 0.885, { size: 76 * u, fam: F.serif, weight: 400, color: "#f3ecdd", shadow: 14, shadowColor: "rgba(0,0,0,0.9)" });
    grain(t, 0.06);
  },
};
