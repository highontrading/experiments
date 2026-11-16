// R04 · "ONE MORE AGENCY" — dark tech UI (style ref 4). Navy-black space with floating UI words at different depths,
// a glowing orange trace line, cursor swarms on red, a cream panel with chat bubbles, and footage with small bold
// lowercase captions at chest height (Inter Tight 800, white). VO Adam. Finale: chrome "2026" over a small frame.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_MON = L[8].v1 + 0.5, T_FIN = T_MON + 5.0, T_END = T_FIN + 3.4, ORA = "#ff7a1a", BLUE = "#2f6bff";
const MON = [["fly", 0], ["island", 1.25], ["glasses", 2.5], ["clouds", 3.75]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "one-more-agency",
  seqs: ["laptop", "skate", "ny2_close", "berry", "ugc2_face", "cheetah", "golden", "nk_walk", "fly", "island", "glasses", "clouds", "carwin"],
  music: { file: "build/music_el/r04.mp3", offset: 0, gain: -6, duck: -5, fadeOut: 1.0 },
  sfx: [["riser_short", 0.0, -14], ["glitch_hit", L[1].at, -10], ["swoosh_fast", L[2].at - 0.1, -10], ["hit_punch", L[2].at, -8], ["ui_click", L[3].at + 0.3, -8], ["notif", L[3].at + 0.9, -10], ["notif", L[3].at + 1.8, -10],
        ["hit_punch", L[4].at, -10], ["bass_drop", L[5].at, -6], ["hit_punch", Wd(6, 0), -8], ["hit_punch", Wd(6, 3), -8], ["hit_punch", Wd(6, 5), -8], ["swoosh_fast", L[7].at - 0.1, -10],
        ["hit_big", L[8].at, -8], ...MON.map((m) => ["hit_punch", T_MON + m[1], -9]), ["hit_big", T_FIN, -6], ["hit_big", T_END, -8]],
  space(t) { bg("#05070d"); const r = g.createRadialGradient(CX, H * 0.4, 50 * u, CX, H * 0.4, 1200 * u); r.addColorStop(0, "rgba(40,70,140,0.35)"); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 6; i++) g.fillRect(W - 60 * u, (300 + i * 40) * u, 14 * u, 2 * u); txt("REC · 4K · 24FPS", W - 60 * u, 1560 * u, { size: 18 * u, fam: F.mono, color: "rgba(255,255,255,0.4)", align: "right" }); },
  trace(t, t0, o = {}) { const p = clamp((t - t0) / (o.dur || 1.4)); const N = 80, n = Math.floor(N * p); if (n < 2) return; g.save(); g.strokeStyle = o.col || ORA; g.lineWidth = 7 * u; g.shadowColor = o.col || ORA; g.shadowBlur = 30 * u; g.lineCap = "round"; g.beginPath();
    for (let i = 0; i <= n; i++) { const k = i / N, x = W * (0.1 + 0.8 * k) + Math.sin(k * 9 + (o.ph || 0)) * 180 * u, y = H * (o.y0 ?? 0.15) + k * H * (o.span ?? 0.7) + Math.cos(k * 6) * 120 * u; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); },
  floaty(s, x, y, size, t, t0, o = {}) { const p = oC(clamp((t - t0) / 0.5)); if (p <= 0) return; g.save(); g.filter = o.blur ? `blur(${o.blur * u}px)` : "none";
    txt(s, x + (1 - p) * 40 * u * (o.dir || 1), y, { size, fam: o.fam || F.tight, weight: o.w || 500, style: o.style || "", color: o.color || "#e8ecf5", alpha: p * (o.a ?? 1), align: o.align || "center" }); g.restore(); },
  cap(t, y, col) { const ch = voChunk(t, 3, 0.35); if (!ch) return; const s = ch.filter((w) => t >= w.s - 0.05).map((w) => w.w).join(" ").toLowerCase(); if (!s) return;
    font(68 * u, 800, F.tight); const lines = wrap(s, W * 0.62); lines.forEach((ln, i) => txt(ln, CX, y + (i - (lines.length - 1) / 2) * 66 * u, { size: 68 * u, fam: F.tight, weight: 800, color: col || "#fff", shadow: col ? 0 : 24, shadowColor: "rgba(0,0,0,0.7)", ls: -1 })); },
  foot(src, t, t0, d, o = {}) { g.save(); g.filter = o.f || "contrast(1.08) saturate(0.95)"; kb(seq(src, t, t0), t, t0, d, 1.03, 1.1, o.ax ?? 0.5, o.ay ?? 0.4); g.restore(); shade(H * 0.45, H, 0.55); },
  cursor(x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col || "#fff"; g.strokeStyle = "#111"; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 64 * u); g.lineTo(16 * u, 50 * u); g.lineTo(28 * u, 76 * u); g.lineTo(40 * u, 70 * u); g.lineTo(28 * u, 44 * u); g.lineTo(50 * u, 44 * u); g.closePath(); g.fill(); g.stroke(); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#05070d", fg: "#fff", titleFam: F.tight, titleWeight: 800, titleSize: 110, button: { fill: ORA, color: "#111", shadow: BLUE }, cta: "Join now  →" }); grain(t, 0.05); return; }
    let li = 0; L.forEach((l, i) => { if (t >= l.at - 0.12) li = i; }); const t0 = L[li].at - 0.12;
    if (t < L[1].at - 0.12) { this.space(t); this.trace(t, 0.2, { y0: 0.1, span: 0.8 });
      const ws = L[0].words; [[0, 330, 600, 92, 0], [1, 520, 760, 64, 3], [2, 760, 900, 110, 0], [3, 360, 1060, 54, 4], [4, 600, 1180, 84, 0], [5, 420, 1320, 120, 0], [6, 760, 1450, 70, 2]].forEach(([i, x, y, s, bl]) => {
        if (ws[i]) this.floaty(ws[i].w, x * u, y * u, s * u, t, ws[i].s - 0.05, { blur: bl, w: i === 5 ? 800 : 500 }); });
      g.fillStyle = "rgba(30,60,140,0.6)"; const cp = oC(prog(t, 1.4, 1.8)); g.save(); g.globalAlpha = cp; rr(140 * u, 1560 * u, 520 * u, 70 * u, 35 * u); g.fill(); g.restore(); txt("✎ Hey, we need new ads…", 180 * u, 1596 * u, { size: 28 * u, fam: F.tight, color: "#cfe0ff", align: "left", alpha: cp }); }
    else if (li === 1) { this.space(t); g.save(); g.globalAlpha = 0.35; this.foot("laptop", t, t0, 3.6, { f: "grayscale(1) brightness(0.6)" }); g.restore();
      this.floaty("in", 380 * u, 760 * u, 70 * u, t, Wd(1, 0) - 0.05); this.floaty("2026,", 600 * u, 760 * u, 120 * u, t, Wd(1, 1) - 0.05, { w: 800 });
      [["that's", 380, 960, 60], ["a", 560, 960, 60], ["problem.", CX, 1080, 140]].forEach(([s, x, y, z], i) => this.floaty(s, x * u, y * u, z * u, t, Wd(1, 2 + i) - 0.05, { w: i === 2 ? 800 : 500, color: i === 2 ? ORA : "#e8ecf5" }));
      for (let i = 0; i < 2; i++) { g.fillStyle = `rgba(255,200,120,${0.6 + 0.4 * Math.sin(t * 9 + i)})`; g.beginPath(); g.ellipse(CX + (i ? 60 : -60) * u, 560 * u, 18 * u, 8 * u, 0, 0, 7); g.fill(); } }
    else if (li === 2) { g.save(); g.filter = "grayscale(1) contrast(1.2)"; kb(seq("skate", t, t0), t, t0, 4.6, 1.05, 1.12); g.restore(); g.fillStyle = "rgba(200,20,30,0.62)"; g.globalCompositeOperation = "multiply"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 26; i++) { const p = clamp((t - t0 - i * 0.07) / 0.3); if (p > 0) this.cursor(rnd(i) * W * 0.9, (300 + rnd(i + 5) * 1200) * u + Math.sin(t * 3 + i) * 10 * u, 0.8 + rnd(i + 9) * 0.6, i % 5 ? "rgba(255,255,255,0.85)" : "#fff"); }
      this.floaty("thousands of brands", CX, 760 * u, 66 * u, t, Wd(2, 0) - 0.05, { w: 800 }); this.floaty("are posting", CX, 840 * u, 50 * u, t, Wd(2, 3) - 0.05);
      blurWord("the same", CX, 980 * u, 70 * u, t, Wd(2, 5) - 0.05, { fam: F.tight, weight: 500, color: "#fff" }); blurWord("CREATIVE", CX, 1120 * u, 170 * u, t, Wd(2, 7) - 0.05, { fam: F.tight, weight: 800, style: "italic", color: BLUE }); }
    else if (li === 3) { bg("#f3ecd8"); g.strokeStyle = "#e0451f"; g.lineWidth = 26 * u; g.beginPath(); g.moveTo(-50 * u, 300 * u); g.bezierCurveTo(300 * u, 200 * u, 200 * u, 900 * u, 120 * u, 1700 * u); g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2 * u; for (let i = 0; i < 30; i++) g.strokeRect(W - 90 * u, (300 + i * 40) * u, 20 * u, 2 * u);
      const cp = oB(clamp((t - t0) / 0.4)); g.save(); g.translate(CX, 880 * u); g.scale(cp, cp); g.fillStyle = "#16181d"; g.beginPath(); g.arc(0, 0, 330 * u, 0, 7); g.fill(); g.restore();
      [["Client", "Need 30 new ads by Monday 🙏", 0.5, -1], ["Client", "Different hooks, same product", 1.3, -1], ["You", "…with what crew?", 2.2, 1]].forEach(([who, s, d, side], i) => { const q = oB(clamp((t - t0 - d) / 0.3)); if (q <= 0) return;
        font(34 * u, 600, F.tight); const w = tw(s) + 60 * u, y = (760 + i * 120) * u; g.save(); g.translate(CX + side * 40 * u, y); g.scale(q, q); g.fillStyle = side < 0 ? "#3a3d45" : BLUE; rr(-w / 2, -40 * u, w, 80 * u, 40 * u); g.fill();
        txt(s, 0, 2 * u, { size: 34 * u, fam: F.tight, weight: 600, color: "#fff" }); g.restore(); });
      this.cap(t, 1380 * u, "#16181d"); }
    else if (li === 4) { bg("#f3ecd8"); g.fillStyle = "#1f3a33"; g.beginPath(); g.moveTo(W, 200 * u); g.lineTo(W - 420 * u, 700 * u); g.lineTo(W, 1100 * u); g.fill(); g.fillStyle = "#1f3a33"; g.beginPath(); g.moveTo(0, 1200 * u); g.lineTo(380 * u, 1500 * u); g.lineTo(0, 1800 * u); g.fill();
      g.strokeStyle = "#f0a020"; g.lineWidth = 8 * u; g.beginPath(); g.moveTo(0, 700 * u); g.bezierCurveTo(400 * u, 600 * u, 700 * u, 1100 * u, W, 900 * u); g.stroke();
      this.floaty("you're just", CX, 830 * u, 60 * u, t, Wd(4, 0) - 0.05, { color: "#1b1b1b" }); blurWord("ONE MORE", CX, 950 * u, 150 * u, t, Wd(4, 2) - 0.05, { fam: F.tight, weight: 800, style: "italic", color: BLUE });
      this.floaty("agency.", CX, 1070 * u, 70 * u, t, Wd(4, 4) - 0.05, { color: "#1b1b1b", w: 800 }); }
    else if (li === 5) { this.foot("ny2_close", t, t0, 3.3, { ay: 0.3 }); this.cap(t, H * 0.68); }
    else if (li === 6) { const sub = [["berry", Wd(6, 0)], ["ugc2_face", Wd(6, 3)], ["cheetah", Wd(6, 5)]], j = sub.reduce((a, s, i) => (t >= s[1] - 0.1 ? i : a), 0); this.foot(sub[j][0], t, sub[j][1] - 0.1, 2, { ay: j === 1 ? 0.3 : 0.45 });
      txt(["01 / PRODUCT", "02 / UGC", "03 / FILM"][j], 70 * u, 290 * u, { size: 26 * u, fam: F.mono, weight: 700, color: ORA, align: "left", ls: 3 }); this.cap(t, H * 0.68); }
    else if (li === 7) { this.foot("golden", t, t0, 3.5); if (t - t0 < 0.4) { const fl = 1 - (t - t0) / 0.4; const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(40,90,255,0)"); gr.addColorStop(0.5, `rgba(60,110,255,${fl})`); gr.addColorStop(1, "rgba(40,90,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      this.cap(t, H * 0.68); }
    else if (li === 8 && t < T_MON) { this.foot("nk_walk", t, t0, 3.5, { ay: 0.35 }); this.cap(t, H * 0.68); }
    else if (t < T_FIN) { const j = MON.reduce((a, m, i) => (t >= T_MON + m[1] ? i : a), 0), tj = T_MON + MON[j][1]; this.foot(MON[j][0], t, tj, 1.3); this.trace(t, T_MON, { dur: 5, y0: 0.05, span: 0.9, ph: 2 });
      txt(["no studio", "no crew", "no location", "no limits"][j], CX, H * 0.62, { size: 72 * u, fam: F.tight, weight: 800, color: "#fff", shadow: 24, shadowColor: "rgba(0,0,0,0.7)" }); }
    else { bg("#000"); const p = oC(prog(t, T_FIN, T_FIN + 0.5)); vcard(seq("carwin", t, T_FIN), CX - 230 * u, 520 * u, 460 * u, 760 * u, { shadow: false, s: lerp(1.2, 1, p) });
      const cg = g.createLinearGradient(0, 1150 * u, 0, 1450 * u); cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.45, "#9aa3b5"); cg.addColorStop(0.55, "#4b5263"); cg.addColorStop(1, "#d7dce6");
      const sp = oB(clamp((t - T_FIN - 0.2) / 0.4)); g.save(); g.translate(CX, 1300 * u); g.scale(sp, sp); font(230 * u, 800, F.tight); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = cg; g.shadowColor = "rgba(120,160,255,0.5)"; g.shadowBlur = 40 * u; g.fillText("“2026”", 0, 0); g.restore();
      txt("join the batch", CX, 1050 * u, { size: 44 * u, fam: F.tight, weight: 800, color: "#fff", alpha: oC(prog(t, T_FIN + 0.6, T_FIN + 1.0)) }); }
    grain(t, 0.05);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: L[7].at - 0.12, kicker: "2026 · AI ADVERTISING", h1: "Don't be", h2: "one more agency.", f1: F.tight, s1: "", accent: ORA, btn: ORA, glow: "rgba(255,122,26,0.5)",
  end: { bg: "#05070d", fg: "#fff", titleFam: F.tight, titleWeight: 800, titleSize: 110, button: { fill: ORA, color: "#111", shadow: BLUE } } });
