// A20 · "Select your level" (English, 9:16, no VO). Retro game UI: the course's three levels and the capstone boss,
// power-ups, "1 CREDIT = $29", PRESS START. Captions: pixel font (Press Start 2P), CRT scanlines.
const LV = [["LEVEL 1", "THE IMAGE", "Strategy, product shots, models, sets", "4 STAGES", "#7CFC9A"], ["LEVEL 2", "MOTION & SOUND", "Video ads, films, voice, music, UGC", "3 STAGES", "#79c0ff"],
  ["LEVEL 3", "AGENCY STANDARD", "Meta ads, finishing, hybrid shoots", "4 STAGES", "#ffbd2e"], ["BOSS", "CAPSTONE CAMPAIGN", "Brief to launch. Your portfolio piece.", "FINAL", "#ff6b6b"]];
const T0 = 1.6, LS = 1.3, T_PU = T0 + LV.length * LS + 0.3, T_START = T_PU + 2.2, T_END = T_START + 1.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "select-your-level",
  music: { file: "build/music/466.mp3", offset: 0, gain: -10, fadeOut: 0.8 },
  sfx: [["powerup", 0.3, -10], ...LV.map((_, i) => ["coin", T0 + i * LS, -8]), ["powerup", T_PU, -10], ["coin", T_PU + 0.5, -12], ["coin", T_PU + 1.0, -12], ["powerup", T_START, -6]],
  crt() { g.fillStyle = "rgba(0,0,0,0.22)"; for (let y = 0; y < H; y += 6 * u) g.fillRect(0, y, W, 3 * u); vignette(0.55); },
  render(t) {
    if (t >= T_END) { bg("#0b0d2a"); endCard(t, T_END, { bg: false, fg: "#fff", titleFam: F.pixel, titleWeight: 400, titleSize: 54, title: "AI & ADVERTISING", button: { fill: "#7CFC9A", shadow: "#ff6b6b", fam: F.pixel, size: 26 * u }, cta: "PRESS START ▶" }); this.crt(); return; }
    bg("#0b0d2a");
    // starfield
    for (let k = 0; k < 70; k++) { const x = rnd(k) * W, y = (rnd(k + 3) * H + t * (20 + rnd(k + 5) * 60) * u) % H; g.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * rnd(k + 9)})`; g.fillRect(x, y, 4 * u, 4 * u); }
    const tp = oC(prog(t, 0.2, 0.6));
    txt("AI & ADVERTISING", CX, 230 * u, { size: 58 * u, fam: F.pixel, weight: 400, color: "#fff", alpha: tp, shadow: 0 });
    txt("— SELECT YOUR LEVEL —", CX, 330 * u, { size: 26 * u, fam: F.pixel, weight: 400, color: "#ffbd2e", alpha: tp });
    LV.forEach(([a, b, d, s, col], i) => {
      const st = T0 + i * LS; const y = 470 * u + i * 230 * u, on = t >= st, sel = on && t < st + LS && t < T_PU, p = oB(clamp((t - st) / 0.25));
      g.save(); g.globalAlpha = on ? 1 : 0.35;
      g.strokeStyle = on ? col : "#444"; g.lineWidth = 6 * u; g.fillStyle = sel ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.3)"; g.fillRect(100 * u, y, 880 * u, 190 * u); g.strokeRect(100 * u, y, 880 * u, 190 * u);
      txt(a, 140 * u, y + 52 * u, { size: 24 * u, fam: F.pixel, weight: 400, color: col, align: "left" }); txt(s, 940 * u, y + 52 * u, { size: 18 * u, fam: F.pixel, weight: 400, color: "#aaa", align: "right" });
      txt(b, 140 * u, y + 108 * u, { size: fitSize(b, 800 * u, 38 * u, 400, F.pixel), fam: F.pixel, weight: 400, color: "#fff", align: "left" });
      txt(d, 140 * u, y + 158 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#ccc", align: "left" });
      if (on) { g.globalAlpha = 1; txt(i < 3 ? "★ UNLOCKED" : "☠ READY", 940 * u, y + 158 * u, { size: 16 * u, fam: F.pixel, weight: 400, color: col, align: "right", alpha: p }); }
      if (sel && FR(t) % 16 < 10) txt("▶", 70 * u, y + 100 * u, { size: 40 * u, fam: F.pixel, weight: 400, color: "#fff" });
      g.restore();
    });
    if (t >= T_PU) {
      const y = 1430 * u, p = oC(prog(t, T_PU, T_PU + 0.3)); g.globalAlpha = p;
      txt("POWER-UPS", CX, y, { size: 26 * u, fam: F.pixel, weight: 400, color: "#ffbd2e" });
      ["PROMPT LIBRARY", "TEMPLATES", "LIFETIME UPDATES"].forEach((s, i) => { const q = oB(clamp((t - T_PU - 0.2 - i * 0.5) / 0.3)); g.save(); g.translate(CX + (i - 1) * 310 * u, y + 90 * u); g.scale(q, q);
        g.fillStyle = ["#7CFC9A", "#79c0ff", "#ff6b6b"][i]; g.fillRect(-140 * u, -40 * u, 280 * u, 80 * u); txt(s, 0, 2 * u, { size: fitSize(s, 250 * u, 18 * u, 400, F.pixel), fam: F.pixel, weight: 400, color: "#0b0d2a" }); g.restore(); });
      g.globalAlpha = 1;
    }
    if (t >= T_START) { txt("1 CREDIT = $29", CX, 1640 * u, { size: 40 * u, fam: F.pixel, weight: 400, color: "#7CFC9A" });
      if (FR(t) % 20 < 13) txt("PRESS START", CX, 1730 * u, { size: 34 * u, fam: F.pixel, weight: 400, color: "#fff" }); }
    this.crt();
  },
};
