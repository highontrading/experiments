// R02 · "WHAT CHANGED" — documentary story (style ref 2). Warm/grey grade, gold-framed photo, newspaper clippings on a
// wooden desk, a red "AI" logo reveal with colour streaks, white paper cards, and a phone on the desk showing the course.
// Captions: Instrument Serif italic, white, centred on the subject's chest line, word-by-word with the VO (George);
// the turn ("The brands that learned it…") switches to big bold white Inter Tight kinetic words.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_END = L[9].v1 + 2.4, RED = "#e50914";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "what-changed-documentary",
  seqs: ["studio", "prodshoot", "crew", "luna", "berry", "ugc2_talk", "ugc_drink", "faces", "zep", "leopard", "aquarium", "office", "ny_walk", "giant_girl", "site"],
  music: { file: "build/music_el/r02.mp3", offset: 0, gain: -7, duck: -5, fadeOut: 1.2 },
  sfx: [["camera_flash", 0.4, -14], ["paper_slide", L[2].at - 0.1, -10], ["paper_slide", L[2].at + 1.6, -12], ["paper_slide", L[2].at + 3.0, -12], ["bass_drop", L[3].at + 0.2, -6],
        ["glitch_hit", L[3].at + 1.4, -10], ["hit_punch", L[4].at, -10], ["swoosh_fast", L[5].at - 0.1, -12], ["hit_punch", L[6].at, -10], ["rev_swell", L[7].at - 1.3, -10],
        ["hit_big", L[7].at, -8], ["hit_punch", L[8].at, -8], ["paper_slide", L[9].at - 0.1, -12], ["hit_big", T_END, -8]],
  cap(t, li, y, o = {}) {   // serif italic, words revealed as spoken, whole line visible until next line
    const l = L[li], end = li + 1 < L.length ? L[li + 1].at - 0.1 : T_END; if (t < l.words[0].s - 0.1 || t > end) return;
    const size = o.size || 78 * u; font(size, 400, F.serif, "italic"); const words = l.words, sp = size * 0.26;
    const rows = [[]]; let rw = 0; words.forEach((w) => { const ww = tw(w.w); if (rw + ww > W * 0.78 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ ...w, ww }); rw += ww + sp; });
    rows.forEach((row, ri) => { const tot = row.reduce((a, b) => a + b.ww, 0) + sp * (row.length - 1); let x = CX - tot / 2; const yy = y + (ri - (rows.length - 1) / 2) * size * 1.08;
      row.forEach((w) => { const p = oC(clamp((t - w.s + 0.06) / 0.3)); if (p > 0) { g.save(); g.filter = p < 1 ? `blur(${(1 - p) * 8 * u}px)` : "none";
        txt(w.w, x + w.ww / 2, yy + (1 - p) * 14 * u, { size, fam: F.serif, style: "italic", weight: 400, color: o.color || "#fff", alpha: p, shadow: 22, shadowColor: "rgba(0,0,0,0.55)" }); g.restore(); } x += w.ww + sp; }); });
  },
  warm(src, t, t0, d, o = {}) { g.save(); g.filter = o.f || "sepia(0.18) saturate(0.85) contrast(1.06)"; kb(seq(src, t, t0), t, t0, d, o.z0 || 1.04, o.z1 || 1.1, o.ax ?? 0.5, o.ay ?? 0.4); g.restore(); },
  clipping(x, y, w, h, rot, head, src, t, t0, p) {
    g.save(); g.translate(x, y + (1 - p) * 500 * u); g.rotate(rot); g.globalAlpha = clamp(p * 2); g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 30 * u; g.shadowOffsetY = 12 * u;
    g.fillStyle = "#efe6d2"; g.beginPath(); g.moveTo(-w / 2, -h / 2); for (let k = 0; k <= 20; k++) g.lineTo(-w / 2 + (w * k) / 20, -h / 2 + (rnd(k + x) - 0.5) * 10 * u); g.lineTo(w / 2, h / 2); g.lineTo(-w / 2, h / 2); g.closePath(); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    txt("THE AD DAILY", -w / 2 + 30 * u, -h / 2 + 46 * u, { size: 22 * u, fam: F.play, weight: 700, color: "#3a2f22", align: "left", ls: 2 }); g.fillStyle = "#3a2f22"; g.fillRect(-w / 2 + 30 * u, -h / 2 + 64 * u, w - 60 * u, 2 * u);
    font(46 * u, 700, F.play); wrap(head, w - 60 * u).forEach((ln, i) => txt(ln, -w / 2 + 30 * u, -h / 2 + 115 * u + i * 52 * u, { size: 46 * u, fam: F.play, weight: 700, color: "#1d1812", align: "left" }));
    const iy = -h / 2 + 240 * u; vcard(seq(src, t, t0), -w / 2 + 30 * u, iy, w * 0.55, h - 290 * u, { filter: "grayscale(1) contrast(1.2) sepia(0.25)", shadow: false });
    for (let k = 0; k < 9; k++) { g.fillStyle = "rgba(40,30,20,0.35)"; g.fillRect(-w / 2 + w * 0.55 + 50 * u, iy + k * 34 * u, w * 0.45 - 80 * u - (k % 3) * 20 * u, 10 * u); }
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#14100c", fg: "#fff", titleFam: F.serif, titleStyle: "italic", cta: "Join now  →", sub: "the future of advertising, by Ideabro Studio" }); grain(t, 0.06); return; }
    let li = 0; L.forEach((l, i) => { if (t >= l.at - 0.15) li = i; }); const t0 = L[li].at - 0.15, d = (li + 1 < L.length ? L[li + 1].at : T_END) - t0;
    if (t < L[1].at - 0.15) {   // gold-framed photo on a grey wall
      const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#d8d8d6"); gr.addColorStop(1, "#9c9c98"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const s = lerp(1.0, 1.12, prog(t, 0, L[1].at)), fw = 620 * u * s, fh = 760 * u * s, x = CX - fw / 2, y = 620 * u - fh / 2;
      g.save(); g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 50 * u; g.shadowOffsetY = 26 * u; const gg = g.createLinearGradient(x, y, x + fw, y + fh); gg.addColorStop(0, "#c9a24b"); gg.addColorStop(0.5, "#f3dc96"); gg.addColorStop(1, "#9c7424");
      g.fillStyle = gg; g.fillRect(x - 40 * u, y - 40 * u, fw + 80 * u, fh + 80 * u); g.restore(); g.fillStyle = "#6e5420"; g.fillRect(x - 8 * u, y - 8 * u, fw + 16 * u, fh + 16 * u);
      vcard(seq("studio", t, 0), x, y, fw, fh, { filter: "grayscale(1) contrast(1.15)", shadow: false });
      this.cap(t, 0, 1260 * u, { color: "#1c1c1c" }); txt("archive · 2019", CX, 1360 * u, { size: 30 * u, fam: F.serif, style: "italic", weight: 400, color: "#444", alpha: oC(prog(t, 1.4, 1.9)) });
    } else if (li === 1) { this.warm("prodshoot", t, t0, d); shade(H * 0.5, H, 0.55); this.cap(t, 1, H * 0.66); }
    else if (li === 2) {   // newspaper clippings on the desk
      tex("wood"); const cl = [[0, "Studio booked for two more weeks", "crew", -0.06, 520], [1.5, "Reshoot ordered after test fails", "prodshoot", 0.05, 900], [3.0, "Ad budget gone before launch", "studio", -0.03, 1270]];
      cl.forEach(([dl, h, src, r, y]) => this.clipping(CX + (dl === 1.5 ? 40 : -30) * u, y * u, 900 * u, 520 * u, r, h, src, t, t0, oX(clamp((t - t0 - dl) / 0.5))));
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 1500 * u, W, 220 * u); this.cap(t, 2, 1600 * u, { size: 66 * u });
    } else if (li === 3) {   // the turn: red AI mark + colour streaks, then "What changed."
      const tA = t0 + 1.6; if (t < tA) { bg("#050505"); const p = oC(prog(t, t0 + 0.15, t0 + 1.1)), sc = lerp(0.6, 1.15, prog(t, t0, tA));
        g.save(); g.translate(CX, CY); g.scale(sc, sc); for (let k = 6; k >= 0; k--) txt("AI", 0, k * 6 * u, { size: 420 * u, fam: F.tight, weight: 800, color: k ? "#5a0006" : RED, alpha: p }); g.restore();
        if (t > tA - 0.45) { const q = prog(t, tA - 0.45, tA); for (let k = 0; k < 24; k++) { g.fillStyle = ["#e50914", "#2b6cff", "#ffb02e", "#7d2cff"][k % 4]; g.globalAlpha = q * 0.85; g.fillRect((k / 24) * W, 0, W / 30, H); } g.globalAlpha = 1; } }
      else { tex("paperW"); this.cap(t, 3, CY, { color: "#1c1c1c", size: 92 * u }); }
    } else if (li === 4) {   // gallery wall: one photo → the campaign
      g.save(); g.filter = "grayscale(1) brightness(0.7)"; tex("paperB"); g.restore(); g.fillStyle = "rgba(40,40,40,0.55)"; g.fillRect(0, 0, W, H);
      [["luna", 80, 360, -0.02], ["berry", 560, 360, 0.02]].forEach(([s, x, y, r], i) => { const p = oX(clamp((t - t0 - i * 0.6) / 0.5)); if (p > 0) {
        g.save(); g.globalAlpha = p; g.fillStyle = "#111"; g.fillRect((x - 18) * u, (y - 18) * u, 476 * u, 736 * u); g.restore(); vcard(seq(s, t, t0), x * u, y * u, 440 * u, 700 * u, { rot: r, shadow: 40, s: lerp(0.85, 1, p) }); } });
      g.fillStyle = "rgba(0,0,0,0.0)"; this.cap(t, 4, 1300 * u);
    } else if (li === 5) {   // AI creators, each labelled
      const sub = [["ugc2_talk", 0], ["ugc_drink", 1.45], ["faces", 2.9]], k = sub.reduce((a, s, i) => (t - t0 >= s[1] ? i : a), 0); this.warm(sub[k][0], t, t0 + sub[k][1], 1.6, { f: "contrast(1.05) saturate(0.95)", ay: 0.3 });
      shade(H * 0.5, H, 0.6); txt(["AI creator · skincare", "AI creator · wellness", "AI model · serum"][k], CX, 1120 * u, { size: 46 * u, fam: F.serif, style: "italic", weight: 400, color: "#fff", shadow: 16, alpha: oC(prog(t, t0 + sub[k][1] + 0.1, t0 + sub[k][1] + 0.4)) });
      this.cap(t, 5, H * 0.7, { size: 66 * u });
    } else if (li === 6) { const sub = [["zep", 0], ["leopard", 1.3], ["aquarium", 2.5]], k = sub.reduce((a, s, i) => (t - t0 >= s[1] ? i : a), 0); this.warm(sub[k][0], t, t0 + sub[k][1], 1.5, { f: "contrast(1.1) saturate(0.9)" }); shade(H * 0.5, H, 0.6); this.cap(t, 6, H * 0.7, { size: 70 * u }); }
    else if (li === 7) {   // the turn: bold kinetic words
      const k = t - t0 < 2.1 ? 0 : 1; g.save(); g.filter = "grayscale(0.85) contrast(1.15) brightness(0.8)"; kb(seq(k ? "ny_walk" : "office", t, t0 + k * 2.1), t, t0, d, 1.04, 1.12, 0.5, 0.4); g.restore();
      const ws = L[7].words, rs = [76 * u, Math.min(140 * u, fitSize(ws.slice(3).map((x) => x.w).join("  "), W * 0.86, 140 * u, 800, F.tight))];
      ws.forEach((w, i) => { const row = i < 3 ? 0 : 1, words = row ? ws.slice(3) : ws.slice(0, 3); font(rs[row], 800, F.tight);
        const tot = words.reduce((a, x) => a + tw(x.w) + 24 * u, -24 * u); let x0 = CX - tot / 2; for (const x of words) { if (x === w) break; x0 += tw(x.w) + 24 * u; }
        blurWord(w.w, x0 + tw(w.w) / 2, (row ? 470 : 340) * u, rs[row], t, w.s - 0.05, { fam: F.tight, from: 1.3 }); });
    } else if (li === 8) { this.warm("giant_girl", t, t0, d, { f: "contrast(1.08)", ay: 0.35 }); shade(H * 0.45, H, 0.7);
      blurWord("This is", CX, 1180 * u, 70 * u, t, Wd(8, 0) - 0.05, { fam: F.serif, weight: 400, style: "italic" }); blurWord("AI in", CX, 1300 * u, 120 * u, t, Wd(8, 2) - 0.05, { fam: F.tight });
      blurWord("advertising.", CX, 1430 * u, 120 * u, t, Wd(8, 4) - 0.05, { fam: F.tight, color: "#ffd9a8" }); }
    else {   // phone on the desk with the course
      tex("wood"); font(300 * u, 800, F.tight); txt("LEARN", CX, 560 * u, { size: 300 * u, fam: F.tight, weight: 800, color: "rgba(255,255,255,0.10)" });
      const p = oX(clamp((t - t0) / 0.6)); phoneMock(seq("site", t, t0), CX, lerp(1700 * u, 960 * u, p), 470 * u, t, { rot: -0.05 * (1 - p) });
      this.cap(t, 9, 1640 * u, { size: 70 * u });
    }
    grain(t, 0.06); vignette(0.3);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: L[7].at - 0.15, kicker: "WHAT CHANGED?", h1: "Ads are", h2: "made with AI now.", end: { bg: "#14100c", fg: "#fff", titleFam: F.serif, titleStyle: "italic" } });
