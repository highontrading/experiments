// C19 · "Breathe" (English VO Lily, 9:16). A guided-meditation pattern interrupt: slow AI nature footage, a breathing
// circle that grows and shrinks with the voice — "There is no studio to book today."
// Captions: soft white Cormorant Garamond italic, one full line at a time, centred under the breathing circle.
const L = window.TL.lines, CL = [[0, "pond"], [1, "sea"], [2, "sunset"], [3, "tree"], [4, "earth"]], T_END = L[4].v1 + 1.0;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.8, slug: "breathe",
  seqs: ["pond", "sea", "sunset", "tree", "earth"],
  music: { file: "build/music_el/calm.mp3", offset: 0, gain: -9, duck: -4, fadeOut: 1.5 },
  sfx: [["bowl", 0.2, -10], ["bowl", L[2].at - 0.3, -14], ["bowl", L[4].at - 0.2, -12], ["whoosh", T_END - 0.1, -16]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#f4efe9", fg: C.ink, titleStyle: "italic", button: { fill: C.lav }, cta: "Begin, gently  →" }); return; }
    bg("#000");
    let k = 0; CL.forEach((c, i) => { if (t >= L[c[0]].at - 0.6) k = i; }); const t0 = L[CL[k][0]].at - 0.6, t1 = k + 1 < CL.length ? L[CL[k + 1][0]].at - 0.6 : T_END;
    const prevA = k ? 1 - prog(t, t0, t0 + 1.2) : 0;
    g.save(); g.filter = "saturate(0.85) brightness(0.9)"; if (prevA > 0) { const pk = k - 1, pt0 = L[CL[pk][0]].at - 0.6; kb(seq(CL[pk][1], t, pt0), t, pt0, t0 - pt0 + 1.2, 1.04, 1.12); }
    g.globalAlpha = k ? oC(prog(t, t0, t0 + 1.2)) : oC(prog(t, 0, 1.2)); kb(seq(CL[k][1], t, t0), t, t0, t1 - t0 + 1.2, 1.04, 1.12); g.restore();
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(205,188,255,0.25)"); gr.addColorStop(1, "rgba(246,184,234,0.25)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, W, H);
    // breathing circle: in during L0, hold, out during L2
    let r; const b0 = L[0].words[3]?.s ?? 2, b2 = L[2].at;
    if (t < b0) r = 120; else if (t < b0 + 3.5) r = lerp(120, 260, Math.sin(prog(t, b0, b0 + 3.5) * Math.PI / 2)); else if (t < b2) r = 260; else if (t < b2 + 4) r = lerp(260, 120, Math.sin(prog(t, b2, b2 + 4) * Math.PI / 2)); else r = 120 + 12 * Math.sin(t * 1.2);
    g.save(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 3 * u; g.beginPath(); g.arc(CX, H * 0.38, r * u, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,0.08)"; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.arc(CX, H * 0.38, r * u + 30 * u, 0, 7); g.stroke(); g.restore();
    const lbl = t >= b0 && t < b0 + 3.5 ? "breathe in" : t >= b2 && t < b2 + 4 ? "breathe out" : ""; if (lbl) txt(lbl, CX, H * 0.38, { size: 40 * u, fam: F.corm, weight: 500, style: "italic", color: "#fff", alpha: 0.9 });
    // line caption
    let li = -1; L.forEach((l, i) => { if (t >= l.words[0].s - 0.3) li = i; });
    if (li >= 0) { const l = L[li], end = li + 1 < L.length ? L[li + 1].words[0].s - 0.4 : T_END; const a = Math.min(oC(prog(t, l.words[0].s - 0.3, l.words[0].s + 0.6)), 1 - prog(t, end - 0.4, end));
      capText(l.cap, H * 0.66, a, prog(t, l.words[0].s - 0.3, l.words[0].s + 0.9), { size: 80 * u, fam: F.corm, weight: 500, style: "italic", lh: 1.2, maxW: W * 0.8, shadow: 20, shadowColor: "rgba(0,0,0,0.4)", rise: 0.1 }); }
    txt("FOOTAGE MADE WITH AI", CX, H * 0.86, { size: 22 * u, fam: F.mono, weight: 700, color: "#fff", alpha: 0.6, ls: 4 });
    grain(t, 0.04);
  },
};
