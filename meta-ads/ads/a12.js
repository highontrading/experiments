// A12 · "None of these creators exist" (English VO Jessica, 9:16). Phone-camera UI (REC, timer, grid) over AI UGC clips
// from the Ideabro drive; "AI-GENERATED" chips; then the clip lands inside a feed with floating hearts.
// Captions: TikTok-style pop, white with black stroke, pink active word.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_L1 = Wd(1, 0), T_L2 = Wd(2, 0), T_L3 = Wd(3, 0), T_END = L[3].v1 + 0.5;
const CLIPS = [[0, "kitchen"], [Wd(0, 4), "sandwich"], [Wd(0, 6), "gym"], [T_L1, "beach"], [Wd(1, 4), "garden"], [T_L2, "kitchen"], [Wd(2, 6), "sandwich"], [T_L3, "beach"]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "ai-ugc-creators-dont-exist",
  seqs: ["kitchen", "sandwich", "gym", "beach", "garden"],
  music: { file: "build/music/695.mp3", offset: 6, gain: -10, duck: -8, fadeOut: 0.8 },
  sfx: [["shutter", 0.15, -8], ...CLIPS.slice(1).map((c) => ["swipe", c[0], -14]), ["glitch", Wd(0, 6), -12], ...[0, 2, 5].map((k) => ["pop", Wd(1, k), -10]), ["notif", T_L2 + 0.8, -12], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", button: { fill: C.pink }, cta: "Learn AI UGC  →" }); grain(t, 0.05); return; }
    bg("#000");
    const c = CLIPS.filter((x) => t >= x[0]).pop();
    const inFeed = t >= T_L2 && t < T_L3;
    if (!inFeed) { cover(seq(c[1], t, c[0]), 0, 0, W, H, 1.02 + 0.03 * prog(t, c[0], c[0] + 2)); }
    else {   // the clip inside a feed post, hearts floating
      bg("#fff"); const pw = 920 * u, ph = 1300 * u, px = CX - pw / 2, py = 250 * u;
      g.fillStyle = C.pink; g.beginPath(); g.arc(px + 40 * u, py - 60 * u, 30 * u, 0, 7); g.fill();
      txt("mira.daily", px + 90 * u, py - 72 * u, { size: 30 * u, weight: 700, color: "#111", align: "left" }); txt("Sponsored · AI-generated creator", px + 90 * u, py - 38 * u, { size: 22 * u, weight: 500, color: "#777", align: "left" });
      g.save(); rr(px, py, pw, ph, 24 * u); g.clip(); cover(seq(c[1], t, c[0]), px, py, pw, ph, 1.05); g.restore();
      for (let k = 0; k < 14; k++) { const st = T_L2 + 0.3 + k * 0.22; if (t < st) continue; const p = (t - st) / 1.6; if (p > 1) continue;
        const x = px + pw - 120 * u + Math.sin(k * 2.1 + p * 6) * 40 * u, y = py + ph - 120 * u - p * 600 * u, s = (34 + 14 * rnd(k)) * u;
        g.globalAlpha = 1 - p; txt("♥", x, y, { size: s * 2, weight: 700, color: k % 2 ? "#ff3b6b" : "#ff7aa8" }); g.globalAlpha = 1; }
      txt("♥  Like      ↗  Share      Shop now  →", px + 20 * u, py + ph + 60 * u, { size: 30 * u, weight: 700, color: "#111", align: "left" });
    }
    if (!inFeed) {   // camera UI
      shade(0, 260 * u, 0.5, true); shade(H - 500 * u, H, 0.5);
      if (FR(t) % 30 < 20) { g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(80 * u, 120 * u, 14 * u, 0, 7); g.fill(); }
      txt(`REC  00:${String(Math.floor(t)).padStart(2, "0")}:${String(FR(t) % 30).padStart(2, "0")}`, 110 * u, 122 * u, { size: 30 * u, fam: F.mono, weight: 700, color: "#fff", align: "left" });
      txt("4K · 30", W - 60 * u, 122 * u, { size: 26 * u, fam: F.mono, color: "#fff", align: "right" });
      g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 2 * u; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(W * i / 3, 200 * u); g.lineTo(W * i / 3, H - 300 * u); g.moveTo(0, H * i / 3); g.lineTo(W, H * i / 3); g.stroke(); }
      if (t >= Wd(0, 4)) { const p = oB(clamp((t - Wd(0, 4)) / 0.3)); g.save(); g.translate(CX, 300 * u); g.scale(p, p); g.fillStyle = "rgba(255,255,255,0.92)"; rr(-210 * u, -38 * u, 420 * u, 76 * u, 38 * u); g.fill();
        txt("●  AI-GENERATED", 0, 2 * u, { size: 30 * u, fam: F.mono, weight: 700, color: "#e0245e" }); g.restore(); }
      if (t >= T_L1 && t < T_L2) [["No casting", 0], ["No shipping product", 2], ["No reshoots", 5]].forEach(([s, k], i) => { const st = Wd(1, k); if (t < st) return; const p = oB(clamp((t - st) / 0.25));
        g.save(); g.translate(CX + (i - 1) * 40 * u, 470 * u + i * 110 * u); g.rotate((i - 1) * 0.04); g.scale(p, p); font(44 * u, 800, F.inter); const w = tw(s + "  ✕") + 60 * u;
        g.fillStyle = "#fff"; rr(-w / 2, -40 * u, w, 80 * u, 16 * u); g.fill(); txt(s + "  ✕", 0, 2 * u, { size: 44 * u, weight: 800, color: C.ink }); g.restore(); });
    }
    capPop(t, voChunk(t, 3, 0.5), H * 0.735, { size: 82 * u, hi: C.pink });
    grain(t, 0.04);
  },
};
