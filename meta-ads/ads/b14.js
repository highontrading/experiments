// B14 · "AI or real?" (English, 9:16, music only). Five-round quiz: guess before the timer runs out, then the
// reveal. Mix of AI images and real stock footage (labelled honestly). Captions: Archivo Black white, yellow tags.
const Y = "#FFD43B";
const R = [["real1", "REAL", "Stock footage of a real person"], ["beach", "AI", "Generated video"], ["i22", "AI", "Generated image"], ["real2", "REAL", "Stock footage, real shoot"], ["i19", "AI", "Generated image"]];
const R0 = 1.4, RS = 2.7, T_OUT = R0 + R.length * RS, T_END = T_OUT + 2.4;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "ai-or-real-quiz",
  images: { i22: "assets/img/site/i22.jpg", i19: "assets/img/site/i19.jpg" },
  seqs: ["real1", "beach", "real2"],
  music: { file: "build/music_el/quiz.mp3", offset: 0, gain: -10, fadeOut: 0.8 },
  sfx: [["pop", 0.3, -10], ...R.flatMap((_, i) => [["clock", R0 + i * RS + 0.2, -18], ["ding", R0 + i * RS + 1.75, -10]]), ["boom", T_OUT, -12], ["whoosh", T_END - 0.1, -12]],
  btn(label, x, y, state, a) {  // state: 0 idle, 1 correct, -1 wrong
    const w = 380 * u, h = 130 * u; g.save(); g.globalAlpha = a * (state === -1 ? 0.35 : 1); g.fillStyle = state === 1 ? Y : "rgba(255,255,255,0.92)"; rr(x - w / 2, y - h / 2, w, h, 65 * u); g.fill();
    txt(label, x, y + 4 * u, { size: 64 * u, fam: F.archivo, weight: 400, color: C.ink }); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", button: { fill: Y, shadow: "#fff" }, cta: "Learn to make it  →" }); grain(t, 0.04); return; }
    bg("#0b0b0b");
    if (t < R0) {
      const p = oB(clamp((t - 0.2) / 0.4)); g.save(); g.translate(CX, CY - 80 * u); g.scale(p, p);
      txt("AI", 0, -150 * u, { size: 260 * u, fam: F.archivo, weight: 400, color: Y }); txt("OR", 0, 40 * u, { size: 110 * u, fam: F.archivo, weight: 400, color: "#fff" }); txt("REAL?", 0, 200 * u, { size: 200 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore();
      txt("5 rounds. Be honest.", CX, CY + 300 * u, { size: 44 * u, weight: 700, color: "#fff", alpha: oC(prog(t, 0.6, 0.9)) });
    } else if (t < T_OUT) {
      const k = Math.floor((t - R0) / RS), t0 = R0 + k * RS, [src, ans, note] = R[k], rev = t >= t0 + 1.75;
      g.save(); g.globalAlpha = oC(prog(t, t0, t0 + 0.2)); kb(SRC(src, t, t0), t, t0, RS, 1.0, 1.05, 0.5, 0.35); g.restore();
      shade(0, H * 0.22, 0.6, true); shade(H * 0.55, H, 0.65);
      // round tag + timer
      g.fillStyle = Y; rr(60 * u, 210 * u, 300 * u, 70 * u, 35 * u); g.fill(); txt(`ROUND ${k + 1} / 5`, 210 * u, 247 * u, { size: 34 * u, fam: F.archivo, weight: 400, color: C.ink });
      const tl = 1 - prog(t, t0 + 0.2, t0 + 1.7); g.fillStyle = "rgba(255,255,255,0.25)"; rr(400 * u, 233 * u, W - 460 * u, 24 * u, 12 * u); g.fill(); g.fillStyle = tl < 0.3 ? "#ff4d4f" : "#fff"; rr(400 * u, 233 * u, (W - 460 * u) * tl, 24 * u, 12 * u); g.fill();
      const ba = oC(prog(t, t0 + 0.15, t0 + 0.4));
      this.btn("AI", CX - 210 * u, H * 0.68, rev ? (ans === "AI" ? 1 : -1) : 0, ba); this.btn("REAL", CX + 210 * u, H * 0.68, rev ? (ans === "REAL" ? 1 : -1) : 0, ba);
      if (!rev) txt("AI or real?", CX, H * 0.6, { size: 72 * u, fam: F.archivo, weight: 400, color: "#fff", alpha: ba });
      else { const p = oB(clamp((t - t0 - 1.75) / 0.3)); g.save(); g.translate(CX, H * 0.585); g.scale(p, p); txt(ans === "AI" ? "IT'S AI." : "IT'S REAL.", 0, 0, { size: 104 * u, fam: F.archivo, weight: 400, color: Y }); g.restore();
        txt(note, CX, H * 0.76, { size: 36 * u, weight: 600, color: "#fff", alpha: 0.85 * p }); }
    } else {
      const p = oC(prog(t, T_OUT, T_OUT + 0.4));
      R.forEach((r, i) => { const x = 60 * u + i * 196 * u; g.save(); g.globalAlpha = p; g.beginPath(); rr(x, 560 * u, 180 * u, 320 * u, 14 * u); g.clip(); cover(SRC(r[0], T_OUT, 0), x, 560 * u, 180 * u, 320 * u); g.restore();
        g.fillStyle = r[1] === "AI" ? Y : "#fff"; rr(x + 30 * u, 900 * u, 120 * u, 50 * u, 25 * u); g.fill(); txt(r[1], x + 90 * u, 927 * u, { size: 28 * u, fam: F.archivo, weight: 400, color: C.ink, alpha: p }); });
      capText("Couldn't tell?\nNeither can your customers.", H * 0.62, p, prog(t, T_OUT + 0.2, T_OUT + 0.8), { size: 70 * u, fam: F.archivo, weight: 400, stagger: true, lh: 1.25 });
      txt("Learn to make AI visuals this real.", CX, H * 0.75, { size: 44 * u, weight: 700, color: Y, alpha: oC(prog(t, T_OUT + 1.0, T_OUT + 1.4)) }); txt("", 0, 0, {});
    }
    grain(t, 0.04);
  },
};
