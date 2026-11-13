// A16 · "Things my brand doesn't need anymore" (English, 9:16, no VO). A notes-app page on lined yellow paper;
// items get ticked and struck with a pencil, polaroids of AI work get taped on. Captions: handwritten (Caveat).
const ITEMS = ["Studio booking", "Model casting", "A 3-week shoot", "Reshoot budget", "Waiting on the edit"];
const I0 = 1.6, IS = 0.8, T_NEED = I0 + ITEMS.length * IS + 0.4, T_TICK = T_NEED + 1.4, T_POL = T_TICK + 0.6, T_END = T_POL + 2.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "notes-app-checklist",
  images: { p1: "assets/img/site/i33.jpg", p2: "assets/img/site/i39.jpg", p3: "assets/img/site/i22.jpg" },
  music: { file: "build/music/763.mp3", offset: 0, gain: -9, fadeOut: 0.8 },
  sfx: [["pencil", 0.6, -10], ...ITEMS.map((_, i) => ["pencil", I0 + i * IS + 0.25, -8]), ["typewriter", T_NEED, -18], ["pencil", T_TICK, -4], ["pop", T_POL, -10], ["pop", T_POL + 0.25, -10], ["pop", T_POL + 0.5, -10], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fff6c8", fg: C.ink, strike: "#9a8f60", titleFam: F.hand, titleWeight: 700, titleSize: 130, cta: "Get it for $29  →" }); grain(t, 0.04); return; }
    bg("#fff6c8");
    // lines + margin
    g.strokeStyle = "rgba(90,140,200,0.35)"; g.lineWidth = 2 * u; for (let y = 300 * u; y < H; y += 100 * u) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = "rgba(220,80,80,0.45)"; g.beginPath(); g.moveTo(120 * u, 0); g.lineTo(120 * u, H); g.stroke();
    // app header
    txt("‹ Notes", 60 * u, 110 * u, { size: 40 * u, weight: 600, color: "#c79a00", align: "left" }); txt("Done", W - 60 * u, 110 * u, { size: 40 * u, weight: 700, color: "#c79a00", align: "right" });
    txt("Today, 11:47 PM", CX, 200 * u, { size: 28 * u, weight: 500, color: "#8a7d4a" });
    const hp = oC(prog(t, 0.3, 0.8)); txt("Things my brand", 160 * u, 300 * u - 28 * u, { size: 84 * u, weight: 700, fam: F.hand, color: C.ink, align: "left", alpha: hp });
    txt("doesn't need anymore:", 160 * u, 400 * u - 28 * u, { size: 84 * u, weight: 700, fam: F.hand, color: C.ink, align: "left", alpha: hp });
    ITEMS.forEach((s, i) => {
      const st = I0 + i * IS; if (t < st) return; const y = 300 * u + (i + 2) * 100 * u - 28 * u, p = oC(clamp((t - st) / 0.2));
      g.globalAlpha = p; g.strokeStyle = C.ink; g.lineWidth = 3.5 * u; rr(160 * u, y - 26 * u, 50 * u, 50 * u, 10 * u); g.stroke();
      txt(s, 240 * u, y, { size: 64 * u, weight: 600, fam: F.hand, color: C.ink, align: "left" });
      const tp = prog(t, st + 0.25, st + 0.45); if (tp > 0) { g.strokeStyle = "#1b7f3a"; g.lineWidth = 6 * u; g.beginPath(); g.moveTo(168 * u, y); g.lineTo(168 * u + 14 * u * clamp(tp * 2), y + 14 * u * clamp(tp * 2)); if (tp > 0.5) g.lineTo(182 * u + 26 * u * (tp - 0.5) * 2, y + 14 * u - 40 * u * (tp - 0.5) * 2); g.stroke();
        font(64 * u, 600, F.hand); const w = tw(s); g.strokeStyle = "rgba(20,20,20,0.75)"; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(236 * u, y + 4 * u); g.lineTo(236 * u + (w + 10 * u) * tp, y - 2 * u); g.stroke(); }
      g.globalAlpha = 1;
    });
    if (t >= T_NEED) {
      const y = 300 * u + 8 * 100 * u - 28 * u, p = oC(prog(t, T_NEED, T_NEED + 0.3));
      txt("Things it needs:", 160 * u, y, { size: 70 * u, weight: 700, fam: F.hand, color: C.ink, align: "left", alpha: p });
      g.globalAlpha = p; g.strokeStyle = C.ink; g.lineWidth = 3.5 * u; rr(160 * u, y + 100 * u - 26 * u, 50 * u, 50 * u, 10 * u); g.stroke(); g.globalAlpha = 1;
      const s = "AI & Advertising — $29"; const n = clamp(Math.floor((t - T_NEED - 0.3) * 22), 0, s.length);
      font(70 * u, 700, F.hand); const w = tw(s.slice(0, n));
      g.fillStyle = "rgba(216,245,162,0.9)"; g.fillRect(236 * u, y + 100 * u - 40 * u, w + 10 * u, 76 * u);
      txt(s.slice(0, n), 240 * u, y + 100 * u, { size: 70 * u, weight: 700, fam: F.hand, color: C.ink, align: "left" });
      if (t >= T_TICK) { const tp = prog(t, T_TICK, T_TICK + 0.25), yy = y + 100 * u; g.strokeStyle = "#1b7f3a"; g.lineWidth = 7 * u; g.beginPath(); g.moveTo(166 * u, yy); g.lineTo(180 * u, yy + 16 * u); g.lineTo(180 * u + 34 * u * tp, yy + 16 * u - 48 * u * tp); g.stroke();
        // heart doodle
        txt("♥", 236 * u + w + 60 * u, yy - 6 * u, { size: 70 * u, color: "#e0245e", alpha: tp }); }
    }
    if (t >= T_POL) {
      [["p1", 260, 1560, -0.08], ["p2", 560, 1610, 0.05], ["p3", 850, 1550, -0.03]].forEach(([n, x, y, r], k) => { const st = T_POL + k * 0.25; if (t < st) return; const p = oB(clamp((t - st) / 0.3));
        const w = 280 * u, h = 340 * u; g.save(); g.translate(x * u, y * u); g.rotate(r); g.scale(p, p); g.shadowColor = "rgba(0,0,0,0.25)"; g.shadowBlur = 20 * u; g.fillStyle = "#fff"; g.fillRect(-w / 2, -h / 2, w, h); g.shadowBlur = 0;
        g.save(); g.beginPath(); g.rect(-w / 2 + 16 * u, -h / 2 + 16 * u, w - 32 * u, h - 90 * u); g.clip(); cover(IM[n], -w / 2 + 16 * u, -h / 2 + 16 * u, w - 32 * u, h - 90 * u); g.restore();
        txt(["made w/ AI", "no shoot", "same night"][k], 0, h / 2 - 38 * u, { size: 40 * u, weight: 700, fam: F.hand, color: C.ink });
        g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-50 * u, -h / 2 - 18 * u, 100 * u, 36 * u); g.restore(); });
    }
    grain(t, 0.04);
  },
};
