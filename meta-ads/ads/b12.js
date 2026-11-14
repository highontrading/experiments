// B12 · "Mood board → campaign" (English, 4:5 feed, music only). A pinned mood board (palette, light, texture, set,
// casting) turns into the six-frame campaign that matches it. Captions: JetBrains Mono labels, ink on cream.
const PINS = [  // [t, kind, label, x, y, w, h, rot, extra]
  [1.0, "sw", "01 PALETTE", 80, 230, 400, 230, -0.03], [1.8, "img", "02 LIGHT — hard noon sun", 540, 210, 460, 300, 0.03, ["i35", 0.5, 0.8, 1.5]],
  [2.6, "img", "03 TEXTURE — leather", 80, 560, 300, 300, 0.02, ["i32", 0.42, 0.78, 3.0]], [3.4, "img", "04 SET — whitewashed steps", 420, 580, 300, 380, -0.02, ["i34", 0.5, 0.6, 1.2]],
  [4.2, "img", "05 CASTING", 760, 580, 250, 330, 0.03, ["i24", 0.5, 0.3, 1.1]], [5.0, "type", "06 TYPE", 80, 960, 640, 180, -0.01],
];
const SW = ["#6E9BC8", "#EEE8DE", "#9A5A2E", "#1a1a1a"], CAMP = ["i31", "i32", "i33", "i34", "i35", "i36"];
const T_SWAP = 6.4, T_LINE = 11.6, T_END = 14.2;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "moodboard-to-campaign",
  images: Object.fromEntries(["i35", "i32", "i34", "i24", ...CAMP].map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/lofi.mp3", offset: 12, gain: -9, fadeOut: 1.0 },
  sfx: [...PINS.map((p) => ["pop", p[0], -12]), ["whoosh", T_SWAP, -10], ...CAMP.map((_, i) => ["shutter", T_SWAP + 0.6 + i * 0.6, -12]), ["whoosh", T_END - 0.15, -14]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", cta: "Learn creative direction  →" }); grain(t, 0.04); return; }
    gridBg();
    typeText(t, t < T_SWAP ? "MOOD BOARD / summer shoe drop" : "CAMPAIGN / 6 frames, zero shoots", 80 * u, 120 * u, t < T_SWAP ? 0.2 : T_SWAP + 0.2, 40, { size: 38 * u, fam: F.mono, weight: 700, color: C.ink, caretColor: C.ink });
    const out = ioC(prog(t, T_SWAP - 0.2, T_SWAP + 0.4));
    if (out < 1) PINS.forEach(([t0, kind, lab, x, y, w, h, r, ex]) => { if (t < t0) return; const p = oB(clamp((t - t0) / 0.3)); x *= u; y *= u; w *= u; h *= u;
      g.save(); g.translate(x + w / 2 - out * W, y + h / 2); g.rotate(r); g.scale(p, p); g.translate(-w / 2, -h / 2);
      g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(8 * u, 10 * u, w, h); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
      if (kind === "sw") SW.forEach((c, i) => { g.fillStyle = c; g.fillRect(14 * u + i * (w - 28 * u) / 4, 14 * u, (w - 28 * u) / 4 - 6 * u, h - 70 * u); });
      if (kind === "img") { g.save(); g.beginPath(); g.rect(12 * u, 12 * u, w - 24 * u, h - 64 * u); g.clip(); cover(IM[ex[0]], 12 * u, 12 * u, w - 24 * u, h - 64 * u, ex[3], ex[1], ex[2]); g.restore(); }
      if (kind === "type") { txt("Walk in the sun.", 24 * u, 70 * u, { size: 64 * u, fam: F.serif, weight: 400, style: "italic", color: C.ink, align: "left" }); txt("SERIF HEADLINE · MONO DETAILS", 24 * u, 130 * u, { size: 22 * u, fam: F.mono, color: "#777", align: "left" }); }
      txt(lab, 16 * u, h - 26 * u, { size: 22 * u, fam: F.mono, weight: 700, color: C.ink, align: "left" });
      g.fillStyle = "#e5484d"; g.beginPath(); g.arc(w / 2, 4 * u, 12 * u, 0, 7); g.fill();   // pin
      g.restore(); });
    if (t >= T_SWAP) {   // the campaign: six frames
      const cw = 300 * u, chh = 400 * u;
      CAMP.forEach((k, i) => { const st = T_SWAP + 0.6 + i * 0.6; if (t < st) return; const p = oX(clamp((t - st) / 0.4)), c = i % 3, r = Math.floor(i / 3);
        const x = 80 * u + c * (cw + 30 * u), y = 210 * u + r * (chh + 30 * u) + (1 - p) * 80 * u; g.save(); g.globalAlpha = p; g.fillStyle = C.ink; g.fillRect(x + 6 * u, y + 6 * u, cw, chh);
        g.beginPath(); g.rect(x, y, cw, chh); g.clip(); cover(IM[k], x, y, cw, chh, 1.02); g.restore(); txt(`F${i + 1}`, x + 16 * u, y + chh - 24 * u, { size: 22 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", alpha: p, shadow: 6 }); });
      if (t >= T_LINE) { const p = oC(prog(t, T_LINE, T_LINE + 0.4)); g.save(); g.globalAlpha = p; g.fillStyle = C.lime; g.strokeStyle = C.ink; g.lineWidth = 3 * u; rr(80 * u, 1110 * u, W - 160 * u, 130 * u, 18 * u); g.fill(); g.stroke(); g.restore();
        txt("Every frame matches the board.", CX, 1155 * u, { size: 40 * u, fam: F.mono, weight: 700, color: C.ink, alpha: p }); txt("That's direction. We teach it.", CX, 1205 * u, { size: 32 * u, fam: F.mono, color: C.ink, alpha: p }); }
    }
    if (t < T_SWAP) txt("Before you prompt, you direct.", 80 * u, 1240 * u, { size: 34 * u, fam: F.mono, color: C.ink, align: "left", alpha: oC(prog(t, 5.4, 5.8)) });
    grain(t, 0.04);
  },
};
