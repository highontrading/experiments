// C17 · "Objections, answered" (English VO: Chris objects, Matilda answers; 9:16, shows price). Four common doubts
// appear as quotes, get struck through in red marker, and the answer slams in with proof.
// Captions: objections in grey Instrument Serif italic quotes; answers in ink Inter Black on lime boxes.
const L = window.TL.lines, RED = "#ff4d4f";
const PAIRS = [[0, 1, "type"], [2, 3, "i22"], [4, 5, "lessons"], [6, 7, "price"]], T_END = L[7].v1 + 0.9;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "objections-answered",
  images: { i22: "assets/img/site/i22.jpg", i35: "assets/img/site/i35.jpg" },
  music: { file: "build/music_el/drive.mp3", offset: 0, gain: -12, duck: -6, fadeOut: 0.8 },
  sfx: PAIRS.flatMap(([q, a]) => [["pencil", L[a].at - 0.25, -8], ["stamp", L[a].at, -10]]).concat([["register", L[7].at + 0.4, -10], ["whoosh", T_END - 0.1, -12]]),
  proof(kind, t, t0) {
    const y = 1180 * u, p = oC(prog(t, t0 + 0.2, t0 + 0.6)); g.save(); g.globalAlpha = p;
    if (kind === "type") { g.fillStyle = "#1c1c1c"; rr(90 * u, y - 200 * u, W - 180 * u, 400 * u, 24 * u); g.fill(); txt("PROMPT", 130 * u, y - 150 * u, { size: 24 * u, fam: F.mono, weight: 700, color: C.lime, align: "left", ls: 3 });
      typeText(t, "Brown leather shoes on whitewashed steps, hard noon sun, long shadows, 85mm, editorial.", 130 * u, y - 90 * u, t0 + 0.3, 40, { size: 34 * u, fam: F.mono, color: "#fff", maxW: W - 280 * u, lh: 1.45, caretColor: C.lime }); }
    else if (kind === "i22") { g.save(); g.beginPath(); rr(150 * u, y - 260 * u, W - 300 * u, 520 * u, 24 * u); g.clip(); cover(IM.i22, 150 * u, y - 260 * u, W - 300 * u, 520 * u, 1.05 + 0.05 * prog(t, t0, t0 + 3), 0.6, 0.35); g.restore();
      txt("AI-GENERATED", W - 180 * u, y + 220 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", align: "right", shadow: 8 }); }
    else if (kind === "lessons") { ["01  Strategy & briefs", "02  Product shots", "03  Models & sets", "04  Video ads", "05  Voice & music"].forEach((s, i) => { const q = oC(prog(t, t0 + 0.3 + i * 0.15, t0 + 0.6 + i * 0.15)), yy = y - 220 * u + i * 100 * u;
        g.fillStyle = "#1c1c1c"; rr(150 * u, yy - 40 * u, W - 300 * u, 80 * u, 16 * u); g.fill(); txt(s, 190 * u, yy + 2 * u, { size: 36 * u, weight: 700, color: "#fff", align: "left", alpha: q });
        g.fillStyle = C.lime; g.beginPath(); g.arc(W - 200 * u, yy, 18 * u, 0, 7); g.fill(); }); txt("Watch anytime. Pause anytime.", CX, y + 300 * u, { size: 36 * u, weight: 600, color: "#aaa" }); }
    else if (kind === "price") { const q = oB(clamp((t - t0 - 0.3) / 0.4)); g.save(); g.translate(CX, y - 40 * u); g.scale(q, q); txt(PRICE, 0, 0, { size: 240 * u, weight: 900, color: C.lime }); g.restore();
      txt("one-time · lifetime access · 11 modules", CX, y + 130 * u, { size: 38 * u, weight: 600, color: "#ddd", alpha: q }); }
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#111", fg: "#fff", price: true, accent: C.lime, cta: "No more excuses  →" }); return; }
    bg("#111");
    let k = 0; PAIRS.forEach((pr, i) => { if (t >= L[pr[0]].at - 0.1) k = i; }); const [qi, ai, kind] = PAIRS[k], tq = L[qi].at - 0.1, ta = L[ai].at;
    txt(`DOUBT ${k + 1} OF 4`, CX, 300 * u, { size: 28 * u, fam: F.mono, weight: 700, color: "#777", ls: 4 });
    // objection quote
    const qa = oC(prog(t, tq, tq + 0.3)), s = "“" + L[qi].cap + "”"; font(96 * u, 400, F.serif, "italic"); const lines = wrap(s, W * 0.84);
    lines.forEach((ln, i) => { const y = 470 * u + i * 104 * u; txt(ln, CX, y, { size: 96 * u, fam: F.serif, style: "italic", weight: 400, color: "#9a9a9a", alpha: qa });
      const sp = ioC(prog(t, ta - 0.3, ta - 0.05)); if (sp > 0) { font(96 * u, 400, F.serif, "italic"); const w = tw(ln); g.strokeStyle = RED; g.lineWidth = 12 * u; g.lineCap = "round"; g.beginPath(); g.moveTo(CX - w / 2 - 10 * u, y + 6 * u); g.lineTo(CX - w / 2 - 10 * u + (w + 20 * u) * sp, y - 4 * u); g.stroke(); } });
    // answer
    if (t >= ta - 0.05) { const p = oB(clamp((t - ta + 0.05) / 0.3)); font(70 * u, 900, F.inter); const al = wrap(L[ai].cap, W * 0.8), y0 = 470 * u + lines.length * 104 * u + 80 * u;
      al.forEach((ln, i) => { const w = tw(ln) + 50 * u, y = y0 + i * 96 * u; g.save(); g.translate(CX, y); g.scale(p, p); g.fillStyle = C.lime; rr(-w / 2, -44 * u, w, 88 * u, 12 * u); g.fill(); txt(ln, 0, 3 * u, { size: 70 * u, weight: 900, color: C.ink }); g.restore(); });
      this.proof(kind, t, ta); }
  },
};
