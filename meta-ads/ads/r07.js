// R07 · "HERE'S WHAT YOU NEED TO KNOW" — cinematic story (style ref 7). Cinematic footage with small white italic serif
// captions floating mid-frame (Instrument Serif), crumpled-paper interlude cards, giant serif single words ("story.",
// "craft."), and a tablet on a wooden desk showing the course. VO Brian. Music r07 (quiet piano → epic climax).
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_MON = L[9].v1 + 0.3, MON = ["fly", "leopard", "island", "car", "earth"], MD = 1.35, T_TTL = T_MON + MON.length * MD, T_END = T_TTL + 2.2;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "heres-what-you-need-to-know",
  seqs: ["crew", "nk_pink", "glasses", "smile", "ugc_hands", "ny_bag", "sky_phone", "backlit", "aquarium", "luna", "zep", "sunset", "site", ...MON],
  music: { file: "build/music_el/r07.mp3", offset: 0, gain: -4, duck: -4, fadeOut: 1.4 },
  sfx: [["paper_slide", L[1].at - 0.15, -10], ["rev_swell", L[2].at - 1.2, -14], ["hit_punch", L[2].at, -12], ["glitch_hit", Wd(4, 0), -14], ["glitch_hit", Wd(4, 2), -14], ["glitch_hit", Wd(4, 4), -12],
        ["hit_big", L[5].at, -10], ...[0, 1, 2, 3].map((i) => ["hit_punch", Wd(6, i) - 0.05, -10]), ["hit_big", L[7].at, -6], ["paper_slide", L[8].at - 0.1, -10],
        ...MON.map((m, i) => ["hit_punch", T_MON + i * MD, -8]), ["hit_big", T_TTL, -4], ["hit_big", T_END, -8]],
  cap(t, li, y, o = {}) { const l = L[li], end = li + 1 < L.length ? L[li + 1].at - 0.15 : T_MON; if (t < l.words[0].s - 0.1 || t > end) return;
    const ch = []; let cur = []; l.words.forEach((w) => { cur.push(w); if (cur.length === (o.n || 3) || /[.,]$/.test(w.w)) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
    let c = ch[0]; ch.forEach((x) => { if (t >= x[0].s - 0.08) c = x; }); const s = c.map((w) => w.w).join(" "), p = oC(clamp((t - c[0].s + 0.08) / 0.3));
    g.save(); g.filter = p < 1 ? `blur(${(1 - p) * 6 * u}px)` : "none"; txt(s, o.x ?? CX, y, { size: o.size || 64 * u, fam: F.serif, style: "italic", weight: 400, color: o.color || "#fff", alpha: p, shadow: 24, shadowColor: "rgba(0,0,0,0.6)" }); g.restore(); },
  foot(src, t, t0, d, o = {}) { g.save(); g.filter = o.f || "contrast(1.1) saturate(0.9) sepia(0.12)"; kb(seq(src, t, t0), t, t0, d, o.z0 || 1.04, o.z1 || 1.1, o.ax ?? 0.5, o.ay ?? 0.4); g.restore(); vignette(0.45); },
  tablet(src, t, t0) { const p = oX(clamp((t - t0) / 0.7)), w = 720 * u, h = 960 * u; g.save(); g.translate(CX + 120 * u, lerp(1900 * u, 1020 * u, p)); g.rotate(-0.06);
    g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 60 * u; g.shadowOffsetY = 30 * u; g.fillStyle = "#151515"; rr(-w / 2, -h / 2, w, h, 40 * u); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.save(); rr(-w / 2 + 26 * u, -h / 2 + 26 * u, w - 52 * u, h - 52 * u, 18 * u); g.clip(); const im = seq(src, t, t0); if (im) { const sw = w - 52 * u, sc = sw / im.width; g.drawImage(im, 0, 0, im.width, im.height * 0.86, -sw / 2, -h / 2 + 26 * u, sw, im.height * 0.86 * sc); } g.restore(); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0f0c0a", fg: "#fff", titleFam: F.serif, titleStyle: "italic", cta: "Join now  →" }); grain(t, 0.06); return; }
    let li = 0; L.forEach((l, i) => { if (t >= l.at - 0.15) li = i; }); const t0 = L[li].at - 0.15, d = (li + 1 < L.length ? L[li + 1].at : T_MON) - t0;
    if (t >= T_TTL) { this.foot("earth", t, T_MON + 4 * MD, MD + 2.2, { z0: 1.1, z1: 1.2 }); g.fillStyle = `rgba(0,0,0,${0.5 * prog(t, T_TTL, T_TTL + 0.5)})`; g.fillRect(0, 0, W, H);
      blurWord("AI & Advertising", CX, CY - 30 * u, 120 * u, t, T_TTL, { fam: F.serif, style: "italic", weight: 400, from: 1.15, dur: 0.5 }); txt("a course by Ideabro Studio", CX, CY + 80 * u, { size: 40 * u, fam: F.serif, style: "italic", weight: 400, color: "#ddd", alpha: oC(prog(t, T_TTL + 0.5, T_TTL + 1)) }); grain(t, 0.06); return; }
    if (t >= T_MON) { const j = Math.min(MON.length - 1, Math.floor((t - T_MON) / MD)), tj = T_MON + j * MD; this.foot(MON[j], t, tj, MD, { z0: 1.12, z1: 1.04 }); flash(t, tj, 0.1, "255,255,255", 0.5);
      txt("made with AI", CX, H * 0.52, { size: 54 * u, fam: F.serif, style: "italic", weight: 400, color: "#fff", alpha: 0.9, shadow: 20 }); grain(t, 0.06); return; }
    if (li === 0) { this.foot("crew", t, 0, d + 0.15, { f: "contrast(1.15) saturate(0.7) sepia(0.2) brightness(0.85)" }); this.cap(t, 0, H * 0.5); }
    else if (li === 1) { tex("paperW"); g.save(); g.globalAlpha = 0.5; g.strokeStyle = "rgba(0,0,0,0.06)"; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(rnd(k) * W, 0); g.lineTo(rnd(k + 9) * W, H); g.stroke(); } g.restore(); this.cap(t, 1, H * 0.48, { color: "#1b1b1b", size: 56 * u }); }
    else if (li === 2) { this.foot("nk_pink", t, t0, d); this.cap(t, 2, H * 0.5); }
    else if (li === 3) { this.foot("glasses", t, t0, d); this.cap(t, 3, H * 0.52); }
    else if (li === 4) { const sub = [["smile", Wd(4, 0)], ["ugc_hands", Wd(4, 2)], ["ny_bag", Wd(4, 4)]], j = sub.reduce((a, s, i) => (t >= s[1] - 0.12 ? i : a), 0); this.foot(sub[j][0], t, sub[j][1] - 0.12, 1.5, { ay: 0.35 });
      if (j === 2) { g.fillStyle = "rgba(230,230,40,0.38)"; g.globalCompositeOperation = "multiply"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over"; } this.cap(t, 4, H * 0.5, { n: 2 }); }
    else if (li === 5) { this.foot("sky_phone", t, t0, d); this.cap(t, 5, H * 0.52); }
    else if (li === 6) { const sub = ["backlit", "aquarium", "luna", "zep"], j = Math.max(0, L[6].words.reduce((a, w, i) => (t >= w.s - 0.1 ? i : a), 0)); this.foot(sub[j], t, Wd(6, j) - 0.1, 1.1, { z0: 1.1, z1: 1.03 });
      blurWord(L[6].words[j].w.toLowerCase(), CX, H * 0.48, 230 * u, t, Wd(6, j) - 0.1, { fam: F.serif, style: "italic", weight: 400, from: 1.25 }); }
    else if (li === 7) { this.foot("sunset", t, t0, d); blurWord("craft.", CX, H * 0.47, 300 * u, t, Wd(7, 2) - 0.1, { fam: F.serif, style: "italic", weight: 400, from: 1.3, dur: 0.45 });
      txt("that's the", CX, H * 0.36, { size: 60 * u, fam: F.serif, style: "italic", weight: 400, color: "#fff", alpha: oC(prog(t, t0 + 0.1, t0 + 0.4)), shadow: 20 }); }
    else { tex("wood"); this.tablet("site", t, L[8].at - 0.15); const p8 = oC(prog(t, L[8].at, L[8].at + 0.5));
      txt("If you", 90 * u, 330 * u, { size: 120 * u, fam: F.serif, style: "italic", weight: 400, color: "#fff", align: "left", alpha: p8, shadow: 20 });
      txt("want ads like this,", 90 * u, 430 * u, { size: 64 * u, fam: F.serif, style: "italic", weight: 400, color: "#f3e3c8", align: "left", alpha: oC(prog(t, Wd(8, 3), Wd(8, 3) + 0.4)), shadow: 20 });
      if (li === 9) { blurWord("learn", 90 * u, 1520 * u, 150 * u, t, Wd(9, 0) - 0.1, { fam: F.serif, style: "italic", weight: 400, align: "left" }); blurWord("AI & Advertising.", 90 * u, 1640 * u, 80 * u, t, Wd(9, 1) - 0.1, { fam: F.serif, style: "italic", weight: 400, align: "left", color: "#f3e3c8" }); } }
    grain(t, 0.06);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: L[6].at - 0.15, kicker: "BEFORE YOU HIRE A FILM CREW", h1: "Learn the", h2: "craft.", f2: F.serif, accent: "#f3e3c8", btn: "#f3e3c8", glow: "rgba(243,227,200,0.5)",
  end: { bg: "#0f0c0a", fg: "#fff", titleFam: F.serif, titleStyle: "italic" } });
