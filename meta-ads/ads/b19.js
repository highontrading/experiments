// B19 · "One brief, 60 minutes" (English, 9:16, music only). A countdown challenge: the timer races from 60:00 while
// the campaign builds stage by stage — brief, board, stills, motion, edit, delivered. Captions: JetBrains Mono timer
// + white Inter stage labels, always in the same two slots.
const TS = 0.8, TE = 12.6, T_END = 14.6;
const ST = [[60, "BRIEF IN", "i40", 0.5], [50, "MOOD BOARD", "i41", 0.4], [38, "HERO STILLS", "i38", 0.1], [26, "MOTION", "i39", 0.5], [13, "FINAL EDIT", "i42", 0.5], [0, "DELIVERED ✓", "i38", 0.08]];
const tAt = (m) => TS + (60 - m) / 60 * (TE - TS);
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "one-brief-60-minutes",
  images: { i40: "assets/img/site/i40.jpg", i41: "assets/img/site/i41.jpg", i38: "assets/img/site/i38.jpg", i39: "assets/img/site/i39.jpg", i42: "assets/img/site/i42.jpg" },
  music: { file: "build/music_el/tension.mp3", offset: 6, gain: -9, fadeOut: 0.8 },
  sfx: [["clock", 0.6, -18], ["clock", 4.6, -18], ["clock", 8.6, -18], ...ST.map((s) => ["whip", tAt(s[0]), -12]), ["ding", tAt(0), -8], ["boom", tAt(0), -12], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", button: { fill: "#ff4d4f", color: "#fff", shadow: "#fff" }, cta: "Learn the workflow  →" }); grain(t, 0.04); return; }
    bg("#0b0b0b");
    let k = 0; ST.forEach((s, i) => { if (t >= tAt(s[0])) k = i; });
    const [m, lab, im, ax] = ST[k], t0 = tAt(m);
    if (t >= TS) { g.save(); g.beginPath(); g.rect(0, 520 * u, W, 1000 * u); g.clip(); g.globalAlpha = oC(prog(t, t0, t0 + 0.25)); const big = k === ST.length - 1; kb(IM[im], t, t0, 2.5, big ? 1.6 : 1.05, big ? 1.7 : 1.12, ax, 0.5, 0, 520 * u, W, 1000 * u); g.restore();
      g.strokeStyle = "rgba(255,255,255,0.15)"; g.lineWidth = 2 * u; g.strokeRect(0, 520 * u, W, 1000 * u); }
    // timer
    const rem = t < TS ? 3600 : Math.max(0, 3600 * (1 - prog(t, TS, TE))), mm = Math.floor(rem / 60), ss = Math.floor(rem % 60);
    const urgent = rem < 600 && rem > 0;
    txt(`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, CX, 330 * u, { size: 210 * u, fam: F.mono, weight: 700, color: rem === 0 ? C.lime : urgent && FR(t) % 10 < 5 ? "#ff4d4f" : "#fff" });
    txt("CHALLENGE: ONE BRIEF. 60 MINUTES.", CX, 190 * u, { size: 34 * u, fam: F.mono, weight: 700, color: "#ff4d4f", ls: 2 });
    g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(90 * u, 450 * u, W - 180 * u, 10 * u); g.fillStyle = rem === 0 ? C.lime : "#ff4d4f"; g.fillRect(90 * u, 450 * u, (W - 180 * u) * prog(t, TS, TE), 10 * u);
    // stage label (white, same slot)
    if (t >= TS) { const p = oB(clamp((t - t0) / 0.3)); g.save(); g.translate(CX, 1620 * u); g.scale(p, p); txt(lab, 0, 0, { size: 88 * u, weight: 900, color: k === ST.length - 1 ? C.lime : "#fff" }); g.restore();
      txt(`STAGE ${k + 1} / ${ST.length}`, CX, 1715 * u, { size: 28 * u, fam: F.mono, color: "#aaa", ls: 3 }); }
    else txt("Ready?", CX, 1620 * u, { size: 88 * u, weight: 900, color: "#fff", alpha: oC(prog(t, 0.1, 0.4)) });
    grain(t, 0.04);
  },
};
