// C09 · "The race" (English, 9:16, music only). Split-screen drag race: top lane is a traditional shoot (real stock
// footage, days ticking), bottom lane is the AI workflow (AI footage) — it crosses the line while the shoot is still on day 9.
// Captions: race HUD — Bebas lane labels, mono checkpoint chips, a big centre countdown.
const TR = [[1.6, "BOOK STUDIO", "DAY 1", "studio"], [4.6, "CAST MODELS", "DAY 4", "product"], [7.8, "SHOOT", "DAY 9", "set"]];
const AI = [[1.6, "BRIEF", "cafe"], [3.0, "VISUALS", "beach"], [4.4, "VIDEO", "tree"], [5.8, "VARIATIONS", "cafe"]], T_WIN = 7.0, T_LINE = 10.4, T_END = 12.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "the-race",
  seqs: ["studio", "product", "set", "cafe", "beach", "tree"],
  music: { file: "build/music_el/race.mp3", offset: 0, gain: -10, fadeOut: 0.8 },
  sfx: [["beep", 0.2, -10], ["beep", 0.6, -10], ["beep", 1.0, -8], ["boom", 1.4, -12], ...AI.map((a) => ["whip", a[0], -14]), ["powerup", T_WIN, -8], ["cheer", T_WIN + 0.1, -16], ["whoosh", T_END - 0.1, -12]],
  lane(y, h, label, col, src, t0, t, prog0, chips, done) {
    g.save(); g.beginPath(); g.rect(0, y, W, h); g.clip(); g.filter = label.startsWith("TRAD") ? "saturate(0.6) brightness(0.8)" : "saturate(1.1)"; kb(seq(src, t, t0), t, t0, 3, 1.05, 1.1, 0.5, 0.5, 0, y, W, h); g.filter = "none";
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, y, W, h); g.restore();
    txt(label, 50 * u, y + 70 * u, { size: 72 * u, fam: F.bebas, weight: 400, color: col, align: "left", shadow: 10 });
    // track
    const ty = y + h - 90 * u; g.fillStyle = "rgba(255,255,255,0.25)"; rr(50 * u, ty, W - 100 * u, 20 * u, 10 * u); g.fill(); g.fillStyle = col; rr(50 * u, ty, (W - 100 * u) * prog0, 20 * u, 10 * u); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(50 * u + (W - 100 * u) * prog0, ty + 10 * u, 22 * u, 0, 7); g.fill();
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#fff" : "#000"; g.fillRect(W - 60 * u, ty - 30 * u + i * 7 * u, 10 * u, 7 * u); g.fillStyle = i % 2 ? "#000" : "#fff"; g.fillRect(W - 50 * u, ty - 30 * u + i * 7 * u, 10 * u, 7 * u); }
    chips.forEach(([s, sub], i) => { font(38 * u, 700, F.mono); const w0 = tw("✓ " + s + (sub ? "  " + sub : "")) + 40 * u, cy = y + 160 * u + i * 76 * u;
      g.fillStyle = "rgba(0,0,0,0.65)"; rr(50 * u, cy - 32 * u, w0, 64 * u, 10 * u); g.fill(); txt("✓ " + s, 70 * u, cy + 2 * u, { size: 38 * u, fam: F.mono, weight: 700, color: "#fff", align: "left" });
      if (sub) { font(38 * u, 700, F.mono); txt(sub, 70 * u + tw("✓ " + s + "  "), cy + 2 * u, { size: 38 * u, fam: F.mono, weight: 700, color: col, align: "left" }); } });
    if (done) { const p = oB(clamp((t - T_WIN) / 0.35)); g.save(); g.translate(W - 250 * u, y + 110 * u); g.rotate(-0.08); g.scale(p, p); g.fillStyle = col; rr(-190 * u, -60 * u, 380 * u, 120 * u, 16 * u); g.fill();
      txt("FINISHED", 0, 4 * u, { size: 80 * u, fam: F.bebas, weight: 400, color: C.ink }); g.restore(); }
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", cta: "Switch lanes  →" }); grain(t, 0.04); return; }
    bg("#000");
    const hh = 840 * u, y1 = 120 * u, y2 = y1 + hh + 60 * u;
    // traditional lane
    const tk = TR.reduce((a, s, i) => (t >= s[0] ? i : a), 0), trp = clamp((t - 1.4) / 26);
    this.lane(y1, hh, "TRADITIONAL SHOOT", "#ff8a65", TR[tk][3], TR[tk][0], t, trp, TR.filter((s) => t >= s[0]).map((s) => [s[1], s[2]]), false);
    const day = t < 1.4 ? 0 : Math.min(9, 1 + Math.floor((t - 1.4) / 0.75)); txt(t >= T_WIN ? `STILL ON DAY ${day}…` : `DAY ${day}`, W - 60 * u, y1 + 70 * u, { size: 64 * u, fam: F.bebas, weight: 400, color: "#fff", align: "right", shadow: 10 });
    // AI lane
    const ak = AI.reduce((a, s, i) => (t >= s[0] ? i : a), 0), aip = clamp((t - 1.4) / (T_WIN - 1.4));
    this.lane(y2, hh, "AI WORKFLOW", C.lime, AI[ak][2], AI[ak][0], t, aip, AI.filter((s) => t >= s[0]).map((s) => [s[1], ""]), t >= T_WIN);
    txt(t >= T_WIN ? "SAME DAY" : "DAY 1", W - 60 * u, y2 + 70 * u, { size: 64 * u, fam: F.bebas, weight: 400, color: C.lime, align: "right", shadow: 10, alpha: t >= T_WIN ? 0 : 1 });
    // middle strip
    g.fillStyle = "#111"; g.fillRect(0, y1 + hh, W, 60 * u); txt("VS", CX, y1 + hh + 32 * u, { size: 48 * u, fam: F.bebas, weight: 400, color: "#fff" });
    // countdown
    if (t < 1.4) { const n = t < 0.4 ? "3" : t < 0.8 ? "2" : t < 1.2 ? "1" : "GO!"; g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect(0, 0, W, H); txt(n, CX, CY, { size: 360 * u, fam: F.bebas, weight: 400, color: n === "GO!" ? C.lime : "#fff" }); }
    if (t >= T_LINE) { const p = oC(prog(t, T_LINE, T_LINE + 0.4)); g.fillStyle = `rgba(0,0,0,${0.75 * p})`; g.fillRect(0, 0, W, H);
      capText("Same brief.\nDifferent finish line.", CY - 40 * u, p, prog(t, T_LINE, T_LINE + 0.8), { size: 110 * u, fam: F.bebas, weight: 400, stagger: true, lh: 1.0 });
      txt("Illustrative timeline", CX, CY + 170 * u, { size: 26 * u, fam: F.mono, color: "#aaa", alpha: p }); }
    grain(t, 0.04);
  },
};
