// A14 · "Every ratio from one concept" (English, 4:5 feed, no VO). Clean white studio: one AI creative morphs through
// every Meta placement ratio (1:1, 4:5, 9:16, 16:9, 1.91:1), then "10 variations from one idea" fills a grid.
// Captions: small mono pill labels + a serif headline.
const RAT = [["Feed", "1:1", 1, "i39"], ["Feed", "4:5", 0.8, "i38"], ["Reels & Stories", "9:16", 0.5625, "i39"], ["In-stream", "16:9", 1.778, "i41"], ["Link ad", "1.91:1", 1.91, "i37"]];
const R0 = 1.4, RS = 1.35, T_VAR = R0 + RAT.length * RS, T_END = T_VAR + 2.8;
const VARS = ["i31", "i32", "i33", "i34", "i35", "i36", "i37", "i38", "i39", "i41"];
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "every-ratio-one-concept",
  images: Object.fromEntries([...new Set([...RAT.map((r) => r[3]), ...VARS])].map((s) => [s, `assets/img/site/${s}.jpg`])),
  music: { file: "build/music/662.mp3", offset: 4, gain: -11, fadeOut: 0.8 },
  sfx: [...RAT.map((_, i) => ["whip", R0 + i * RS - 0.08, -14]), ...VARS.map((_, k) => ["pop", T_VAR + 0.2 + k * 0.1, -14]), ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fafafa", fg: C.ink, strike: "#9a9a9a" }); grain(t, 0.03); return; }
    bg("#fafafa");
    const hp = oC(prog(t, 0.1, 0.6));
    txt("One concept.", CX, 120 * u, { size: 86 * u, weight: 400, fam: F.serif, color: C.ink, alpha: hp });
    txt(t < T_VAR ? "Every ratio." : "Ten variations.", CX, 210 * u, { size: 86 * u, weight: 400, fam: F.serif, style: "italic", color: C.ink, alpha: hp });
    if (t < T_VAR) {
      const k = clamp(Math.floor((t - R0) / RS), -1, RAT.length - 1);
      const cur = k < 0 ? RAT[0] : RAT[k], prev = k <= 0 ? RAT[0] : RAT[k - 1];
      const mp = k < 0 ? 0 : oX(prog(t, R0 + k * RS, R0 + k * RS + 0.45));
      const ar = lerp(prev[2], cur[2], mp), maxW = 860 * u, maxH = 820 * u;
      let w = maxW, h = w / ar; if (h > maxH) { h = maxH; w = h * ar; }
      const y = 330 * u + maxH / 2;
      g.fillStyle = "rgba(0,0,0,0.08)"; rr(CX - w / 2 + 14 * u, y - h / 2 + 18 * u, w, h, 18 * u); g.fill();
      g.save(); rr(CX - w / 2, y - h / 2, w, h, 18 * u); g.clip(); cover(IM[mp > 0.5 ? cur[3] : prev[3]], CX - w / 2, y - h / 2, w, h, 1.05); g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 3 * u; rr(CX - w / 2, y - h / 2, w, h, 18 * u); g.stroke();
      if (k >= 0) { const lp = oB(clamp((t - R0 - k * RS - 0.3) / 0.3)); g.save(); g.translate(CX, y + h / 2 + 70 * u); g.scale(lp, lp);
        font(34 * u, 700, F.mono); const s = `${cur[1]}  ·  ${cur[0]}`, pw = tw(s) + 60 * u; g.fillStyle = C.lime; g.strokeStyle = C.ink; g.lineWidth = 2.5 * u; rr(-pw / 2, -34 * u, pw, 68 * u, 34 * u); g.fill(); g.stroke();
        txt(s, 0, 2 * u, { size: 34 * u, fam: F.mono, weight: 700, color: C.ink }); g.restore(); }
      // placement dots
      RAT.forEach((_, i) => { g.fillStyle = i <= k ? C.ink : "#cfcfcf"; g.beginPath(); g.arc(CX + (i - 2) * 40 * u, H - 90 * u, 9 * u, 0, 7); g.fill(); });
    } else {
      const cols = 5, cw = 180 * u, chh = 225 * u, gx = CX - (cols * cw + (cols - 1) * 16 * u) / 2;
      VARS.forEach((s, k) => { const st = T_VAR + 0.2 + k * 0.1; if (t < st) return; const p = oB(clamp((t - st) / 0.25)); const x = gx + (k % cols) * (cw + 16 * u), y = 400 * u + Math.floor(k / cols) * (chh + 20 * u);
        g.save(); g.translate(x + cw / 2, y + chh / 2); g.scale(p, p); g.fillStyle = C.lav; g.fillRect(-cw / 2 + 6 * u, -chh / 2 + 6 * u, cw, chh); g.beginPath(); g.rect(-cw / 2, -chh / 2, cw, chh); g.save(); g.clip(); cover(IM[s], -cw / 2, -chh / 2, cw, chh, 1.05); g.restore();
        g.strokeStyle = C.ink; g.lineWidth = 2.5 * u; g.strokeRect(-cw / 2, -chh / 2, cw, chh); txt(`V${k + 1}`, -cw / 2 + 30 * u, -chh / 2 + 26 * u, { size: 20 * u, fam: F.mono, weight: 700, color: "#fff", shadow: 6 }); g.restore(); });
      txt("Module 08 · Meta ads: statics, variations and testing", CX, 980 * u, { size: 28 * u, fam: F.mono, color: C.ink, alpha: oC(prog(t, T_VAR + 1.3, T_VAR + 1.8)) });
    }
    grain(t, 0.03);
  },
};
