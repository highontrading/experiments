// C12 · "Darr" (Hinglish VO Rahul, 9:16). A horror teaser about a marketer's real fear: an empty content calendar,
// a new ad needed every day, zero shoot budget — then the lights come on: people who can make ads with AI aren't scared.
// Captions: blood-red Archivo Black, glitch-jittered, centred low; flips to warm white Inter in the relief scene.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, RED = "#ff2a2a";
const T_CAL = L[1].at, T_DAY = L[2].at, T_BUD = L[3].at, T_LIGHT = L[4].at, T_END = L[4].v1 + 0.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "darr_hinglish",
  seqs: ["laptop", "stress", "window", "pond"],
  music: { file: "build/music_el/horror.mp3", offset: 0, gain: -10, duck: -5, fadeOut: 0.8 },
  sfx: [["heartbeat", 0.2, -8], ["thunder", T_CAL - 0.2, -10], ["glitch", T_DAY, -10], ["heartbeat", T_DAY + 0.4, -8], ["boom", T_BUD + 0.8, -8], ["shimmer", T_LIGHT, -10], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fff8ee", fg: C.ink, cta: "Darr khatam karo  →" }); return; }
    const lit = t >= T_LIGHT, lp = oC(prog(t, T_LIGHT, T_LIGHT + 0.6));
    bg("#000");
    if (!lit) {
      const flick = rnd(FR(t) * 0.7) > 0.93 ? 0.4 : 1;
      if (t < T_CAL) { g.save(); g.filter = `brightness(${0.45 * flick}) contrast(1.3) saturate(0.3)`; kb(seq("laptop", t, 0), t, 0, T_CAL, 1.1, 1.2); g.restore(); }
      else if (t < T_BUD) { // the empty calendar
        g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H); const cx = 90 * u, cy = 430 * u, cw = (W - 180 * u) / 7, ch = 150 * u;
        txt("CONTENT CALENDAR — THIS MONTH", CX, 360 * u, { size: 34 * u, fam: F.mono, weight: 700, color: "#888", ls: 3 });
        for (let i = 0; i < 30; i++) { const x = cx + (i % 7) * cw, y = cy + Math.floor(i / 7) * ch; g.strokeStyle = "#333"; g.lineWidth = 2 * u; g.strokeRect(x, y, cw, ch); txt(String(i + 1), x + 14 * u, y + 26 * u, { size: 22 * u, fam: F.mono, color: "#555", align: "left" });
          if (t >= T_DAY && i <= Math.floor((t - T_DAY) * 9)) { g.fillStyle = `rgba(255,42,42,${0.25 + 0.15 * Math.sin(t * 8 + i)})`; g.fillRect(x + 4 * u, y + 4 * u, cw - 8 * u, ch - 8 * u); txt("AD?", x + cw / 2, y + ch / 2 + 10 * u, { size: 30 * u, fam: F.archivo, weight: 400, color: RED }); } }
        vignette(0.85);
      } else { g.save(); g.filter = `brightness(${0.4 * flick}) contrast(1.4) saturate(0.2)`; kb(seq("stress", t, T_BUD), t, T_BUD, 3, 1.15, 1.25); g.restore(); g.fillStyle = "rgba(120,0,0,0.25)"; g.fillRect(0, 0, W, H);
        const p = clamp((t - T_BUD - 0.8) / 0.15); if (p > 0) { g.save(); g.translate(CX, 760 * u); g.scale(1.6 - 0.6 * p, 1.6 - 0.6 * p); txt("₹0", 0, 0, { size: 300 * u, fam: F.archivo, weight: 400, color: RED, alpha: p, shadow: 30, shadowColor: "rgba(255,0,0,0.6)" }); g.restore(); } }
      // scanline + noise
      g.fillStyle = "rgba(0,0,0,0.25)"; for (let y = 0; y < H; y += 4 * u) g.fillRect(0, y, W, 1.5 * u);
      // captions: blood red, glitch jitter
      const ch = voChunk(t, 4, 0.4); if (ch) { const s = ch.filter((w) => t >= w.s - 0.05).map((w) => w.w).join(" ").toUpperCase(); const j = (rnd(FR(t)) - 0.5) * 6 * u;
        font(82 * u, 400, F.archivo); wrap(s, W * 0.86).forEach((ln, i, a) => { const y = H * 0.72 + (i - (a.length - 1) / 2) * 96 * u;
          txt(ln, CX + j + 4 * u, y, { size: 82 * u, fam: F.archivo, weight: 400, color: "rgba(0,255,255,0.35)" }); txt(ln, CX - j, y, { size: 82 * u, fam: F.archivo, weight: 400, color: RED }); }); }
    } else {
      // lights on: warm, AI footage, calm
      kb(seq(t < Wd(4, 6) ? "window" : "pond", t, T_LIGHT), t, T_LIGHT, 3, 1.02, 1.08); g.fillStyle = `rgba(255,240,220,${0.9 * (1 - lp)})`; g.fillRect(0, 0, W, H);
      shade(H * 0.5, H, 0.55);
      txt("MADE WITH AI", CX, 300 * u, { size: 28 * u, fam: F.mono, weight: 700, color: "#fff", ls: 6, alpha: lp, shadow: 8 });
      capClean(t, voChunk(t, 5, 0.5), H * 0.72, { size: 74 * u, weight: 800, color: "#fff", shadow: 14, shadowColor: "rgba(0,0,0,0.5)" });
    }
    grain(t, lit ? 0.04 : 0.12);
  },
};
