// B15 · "The proposal" (English, 4:5 feed, music only). A freelancer's campaign proposal types itself out —
// deliverables, timeline, "shoot required: no" — AI visuals attach, the client approves in a comment.
// Captions: the document itself (Inter ink on white) + one lime-highlighted payoff line.
const ROWS = [[1.6, "✓  24 campaign stills"], [2.2, "✓  6 short video ads"], [2.8, "✓  3 UGC-style scripts"], [3.4, "✓  Launch kit for Meta"]];
const T_TL = 4.3, T_ATT = 6.0, T_COM = 9.2, T_PAY = 11.2, T_END = 13.6, ATT = ["i38", "i40", "i35", "i42"];
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "the-proposal",
  images: Object.fromEntries(ATT.map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/luxhouse.mp3", offset: 20, gain: -10, fadeOut: 1.0 },
  sfx: [["keys", 0.3, -14], ...ROWS.map((r) => ["pencil", r[0], -14]), ["keys", T_TL, -16], ...ATT.map((_, i) => ["pop", T_ATT + i * 0.35, -12]), ["notif", T_COM, -8], ["ding", T_PAY, -14], ["whoosh", T_END - 0.15, -14]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", cta: "Learn the skill  →" }); grain(t, 0.03); return; }
    bg("#e9e7e1");
    const sc = t >= T_COM ? lerp(1, 0.94, ioC(prog(t, T_COM, T_COM + 0.5))) : 1, px = 70 * u, py = 60 * u, pw = W - 140 * u, ph = H - 60 * u;
    g.save(); g.translate(CX, H / 2); g.scale(sc, sc); g.translate(-CX, -H / 2); g.translate(t >= T_COM ? -60 * u * ioC(prog(t, T_COM, T_COM + 0.5)) : 0, 0);
    g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(px + 8 * u, py + 8 * u, pw, ph); g.fillStyle = "#fff"; g.fillRect(px, py, pw, ph);
    const x = px + 70 * u; let y = py + 110 * u;
    typeText(t, "Campaign Proposal", x, y, 0.2, 30, { size: 64 * u, fam: F.serif, weight: 400, color: C.ink, caret: t < 1.0 });
    txt("For: monday. Orange Juice   ·   Prepared by: you   ·   v1", x, y + 60 * u, { size: 24 * u, fam: F.mono, color: "#777", align: "left", alpha: oC(prog(t, 0.9, 1.2)) });
    g.fillStyle = "#eee"; g.fillRect(x, y + 95 * u, pw - 140 * u, 2 * u); y += 160 * u;
    txt("DELIVERABLES", x, y, { size: 24 * u, fam: F.mono, weight: 700, color: "#999", align: "left", alpha: oC(prog(t, 1.3, 1.5)) });
    ROWS.forEach(([t0, s], i) => { if (t >= t0) typeText(t, s, x, y + 60 * u + i * 56 * u, t0, 40, { size: 36 * u, fam: F.inter, weight: 500, color: C.ink, caret: false }); });
    y += 320 * u;
    if (t >= T_TL) { txt("TIMELINE", x, y, { size: 24 * u, fam: F.mono, weight: 700, color: "#999", align: "left" }); txt("SHOOT REQUIRED", x + 420 * u, y, { size: 24 * u, fam: F.mono, weight: 700, color: "#999", align: "left" });
      typeText(t, "5 days", x, y + 56 * u, T_TL + 0.1, 20, { size: 44 * u, fam: F.inter, weight: 700, color: C.ink, caret: false });
      const np = oC(prog(t, T_TL + 0.8, T_TL + 1.1)); g.fillStyle = C.lime; g.fillRect(x + 410 * u, y + 30 * u, 110 * u * np, 54 * u); txt("No", x + 420 * u, y + 58 * u, { size: 44 * u, fam: F.inter, weight: 700, color: C.ink, align: "left", alpha: np }); }
    y += 140 * u;
    if (t >= T_ATT) { txt("ATTACHED VISUALS  (made with AI)", x, y, { size: 24 * u, fam: F.mono, weight: 700, color: "#999", align: "left" });
      const tw4 = (pw - 140 * u - 3 * 16 * u) / 4; ATT.forEach((k, i) => { const p = oB(clamp((t - T_ATT - i * 0.35) / 0.3)); if (p <= 0) return; const xx = x + i * (tw4 + 16 * u) + tw4 / 2, yy = y + 40 * u + tw4 * 0.65;
        g.save(); g.translate(xx, yy); g.scale(p, p); g.beginPath(); rr(-tw4 / 2, -tw4 * 0.65, tw4, tw4 * 1.3, 12 * u); g.clip(); cover(IM[k], -tw4 / 2, -tw4 * 0.65, tw4, tw4 * 1.3, 1, i === 0 ? 0.1 : 0.5); g.restore(); }); }
    g.restore();
    // client comment (margin)
    if (t >= T_COM) { const p = oB(clamp((t - T_COM - 0.3) / 0.35)); g.save(); g.translate(W - 290 * u, 420 * u); g.scale(p, p);
      g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.18)"; g.shadowBlur = 30 * u; rr(-250 * u, -120 * u, 500 * u, 240 * u, 20 * u); g.fill(); g.shadowBlur = 0;
      g.fillStyle = C.pink; g.beginPath(); g.arc(-200 * u, -70 * u, 30 * u, 0, 7); g.fill(); txt("C", -200 * u, -68 * u, { size: 30 * u, weight: 800, color: C.ink });
      txt("Client", -155 * u, -82 * u, { size: 28 * u, weight: 700, color: C.ink, align: "left" }); txt("just now", -155 * u, -50 * u, { size: 22 * u, color: "#888", weight: 500, align: "left" });
      txt("Approved. 🙌", -215 * u, 10 * u, { size: 34 * u, weight: 700, color: C.ink, align: "left" }); txt("When can we start the", -215 * u, 56 * u, { size: 30 * u, weight: 500, color: "#333", align: "left" }); txt("next one?", -215 * u, 94 * u, { size: 30 * u, weight: 500, color: "#333", align: "left" }); g.restore(); }
    if (t >= T_PAY) { const p = oC(prog(t, T_PAY, T_PAY + 0.4)); g.save(); g.globalAlpha = p; g.fillStyle = C.ink; rr(70 * u, H - 230 * u, W - 140 * u, 150 * u, 22 * u); g.fill(); g.restore();
      txt("Proposals like this start with one skill.", CX, H - 155 * u, { size: 40 * u, weight: 700, color: C.lime, alpha: p }); }
    grain(t, 0.03);
  },
};
