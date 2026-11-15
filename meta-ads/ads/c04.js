// C04 · "Your year in ads, Wrapped" (English, 9:16, music only). A year-in-review story: bold colour blocks, giant
// counting numbers, bouncing shapes. It imagines the viewer's next year after the course.
// Captions: huge Archivo Black numbers/words with small Space Grotesk labels, always top-left aligned in the same grid.
const S = [  // [bg, fg, label, value, kind, extra]
  ["#F6B8EA", C.ink, "Imagine your next year in ads.", "Wrapped.", "intro"], ["#D8F5A2", C.ink, "Studio days booked", 0, "num"],
  ["#7FB8FF", C.ink, "Creatives you made", 365, "num"], ["#FFD43B", C.ink, "Your top format", "9:16", "phone"], ["#CDBCFF", C.ink, "Your top skill", "DIRECTION.", "word"],
  ["#141414", "#D8F5A2", "Your ad personality", "THE AI AD\nDIRECTOR", "collage"],
];
const SD = 2.2, T_END = S.length * SD + 0.4, COL = ["i35", "i38", "i22", "i00", "i32", "i21"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "your-year-wrapped",
  images: Object.fromEntries(COL.map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/wrapped.mp3", offset: 0, gain: -9, fadeOut: 0.8 },
  sfx: [...S.map((_, i) => ["whip", i * SD, -12]), ["sub", SD * 1 + 0.5, -12], ["coin", SD * 2 + 1.4, -12], ["pop", SD * 3 + 0.6, -10], ["stamp", SD * 4 + 0.5, -10], ["shimmer", SD * 5 + 0.4, -12], ["whoosh", T_END - 0.1, -12]],
  shapes(t, k, fg) { for (let i = 0; i < 5; i++) { const a = t * (0.6 + i * 0.15) + i * 1.3 + k, x = CX + Math.cos(a) * (300 + i * 60) * u, y = H * 0.55 + Math.sin(a * 1.2) * (500 + i * 40) * u, r = (80 + i * 40) * u;
    g.fillStyle = fg; g.globalAlpha = 0.08; if (i % 2) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } else { g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); } g.globalAlpha = 1; } },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#141414", fg: "#fff", cta: "Start your year  →" }); grain(t, 0.03); return; }
    const k = Math.min(S.length - 1, Math.floor(t / SD)), t0 = k * SD, [bgc, fg, label, val, kind] = S[k];
    // wipe in from bottom
    const wp = oX(prog(t, t0, t0 + 0.35)); if (k) { bg(S[k - 1][0]); } g.fillStyle = bgc; g.fillRect(0, H * (1 - wp), W, H * wp);
    g.save(); g.beginPath(); g.rect(0, H * (1 - wp), W, H * wp); g.clip(); this.shapes(t, k, fg);
    const x = 90 * u, lp = oC(prog(t, t0 + 0.15, t0 + 0.45)); g.translate(0, (kind === "collage" ? 40 : 200) * u);
    txt(`0${k + 1}`, x, 330 * u, { size: 34 * u, fam: F.mono, weight: 700, color: fg, align: "left", alpha: 0.6 * lp });
    capText(label, 420 * u, lp, lp, { size: 58 * u, fam: F.grot, weight: 700, color: fg, align: "left", x, maxW: W - 180 * u });
    const vp = oB(clamp((t - t0 - 0.45) / 0.35));
    if (kind === "num") { const n = Math.round(val * oC(prog(t, t0 + 0.45, t0 + 1.4))); g.save(); g.translate(x, 860 * u); g.scale(vp, vp); txt(String(n), 0, 0, { size: 420 * u, fam: F.archivo, weight: 400, color: fg, align: "left" }); g.restore();
      txt(k === 1 ? "Zero. Every shoot was a prompt." : "One a day. Every day.", x, 1130 * u, { size: 44 * u, fam: F.grot, weight: 700, color: fg, align: "left", alpha: oC(prog(t, t0 + 1.2, t0 + 1.5)) }); }
    else if (kind === "intro") { g.save(); g.translate(x, 860 * u); g.rotate(-0.04 * (1 - vp)); g.scale(vp, vp); txt(val, 0, 0, { size: fitSize(val, W - 200 * u, 200 * u, 400, F.archivo), fam: F.archivo, weight: 400, color: fg, align: "left" }); g.restore(); }
    else if (kind === "word") { g.save(); g.translate(x, 820 * u); g.scale(vp, vp); txt(val, 0, 0, { size: fitSize(val, W - 180 * u, 200 * u, 400, F.archivo), fam: F.archivo, weight: 400, color: fg, align: "left" }); g.restore();
      ["light", "lens", "story", "taste"].forEach((w, i) => { const q = oB(clamp((t - t0 - 0.9 - i * 0.15) / 0.3)); g.save(); g.translate(x + 120 * u + i * 220 * u, 1060 * u); g.scale(q, q); g.fillStyle = C.ink; rr(-95 * u, -40 * u, 190 * u, 80 * u, 40 * u); g.fill(); txt(w, 0, 3 * u, { size: 38 * u, fam: F.grot, weight: 700, color: bgc }); g.restore(); }); }
    else if (kind === "phone") { g.save(); g.translate(x, 760 * u); g.scale(vp, vp); txt(val, 0, 0, { size: 300 * u, fam: F.archivo, weight: 400, color: fg, align: "left" }); g.restore();
      txt("REELS", x, 980 * u, { size: 90 * u, fam: F.archivo, weight: 400, color: fg, align: "left", alpha: vp });
      const pp = oB(clamp((t - t0 - 0.7) / 0.4)); g.save(); g.translate(W - 300 * u, 1250 * u); g.rotate(0.08); g.scale(pp, pp); g.fillStyle = C.ink; rr(-170 * u, -320 * u, 340 * u, 640 * u, 40 * u); g.fill();
      g.beginPath(); rr(-155 * u, -305 * u, 310 * u, 610 * u, 30 * u); g.clip(); cover(IM.i22, -155 * u, -305 * u, 310 * u, 610 * u, 1.05 + 0.05 * prog(t, t0, t0 + SD)); g.restore(); }
    else if (kind === "collage") { capText(val, 820 * u, vp, vp, { size: 130 * u, fam: F.archivo, weight: 400, color: fg, align: "left", x, lh: 1.0 });
      COL.forEach((c, i) => { const q = oB(clamp((t - t0 - 0.8 - i * 0.1) / 0.3)), cx = x + 130 * u + (i % 3) * 300 * u, cy = 1220 * u + Math.floor(i / 3) * 300 * u; g.save(); g.translate(cx, cy); g.rotate((i % 2 ? 1 : -1) * 0.06); g.scale(q, q); g.fillStyle = "#fff"; g.fillRect(-135 * u, -135 * u, 270 * u, 270 * u); g.beginPath(); g.rect(-125 * u, -125 * u, 250 * u, 250 * u); g.clip(); cover(IM[c], -125 * u, -125 * u, 250 * u, 250 * u); g.restore(); }); }
    g.restore();
    // progress segments (story style)
    S.forEach((_, i) => { g.fillStyle = k === 5 ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"; rr(60 * u + i * 165 * u, 200 * u, 150 * u, 8 * u, 4 * u); g.fill(); g.fillStyle = k === 5 ? "#fff" : C.ink; rr(60 * u + i * 165 * u, 200 * u, 150 * u * (i < k ? 1 : i === k ? prog(t, t0, t0 + SD) : 0), 8 * u, 4 * u); g.fill(); });
    grain(t, 0.03);
  },
};
