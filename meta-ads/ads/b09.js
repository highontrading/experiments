// B09 · "Local brand, national look" (Hinglish VO Tina, 9:16). Real local-market footage in a flat phone frame,
// then the same kind of product in a premium AI campaign. Captions: clean white Inter, fade-up, lower third.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T1 = L[1].at, T2 = L[2].at, T3 = L[3].at, T4 = L[4].at, T_END = L[4].v1 + 0.7;
const PREM = [[T2, "i38", 0.0, "SAME PRODUCT"], [Wd(2, 2) - 0.05, "i35", 0.5, "PREMIUM LIGHTING"], [Wd(2, 4) - 0.05, "i06", 0.5, "PREMIUM SETS"], [T3, "i40", 0.5, "BRIEF → CAMPAIGN"], [Wd(3, 3) - 0.05, "i41", 0.3, "NO AGENCY RETAINER"], [T4, "i42", 0.5, "AI & ADVERTISING"]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "local-brand-national-look_hinglish",
  images: { i38: "assets/img/site/i38.jpg", i35: "assets/img/site/i35.jpg", i06: "assets/img/site/i06.jpg", i40: "assets/img/site/i40.jpg", i41: "assets/img/site/i41.jpg", i42: "assets/img/site/i42.jpg" },
  seqs: ["market"],
  music: { file: "build/music_el/indian.mp3", offset: 18, gain: -12, duck: -6, fadeOut: 0.8 },
  sfx: [["swipe", T1, -12], ["shimmer", T2 - 0.1, -12], ...PREM.slice(1).map((p) => ["whip", p[0], -14]), ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0e0e0e", fg: "#fff", cta: "Abhi seekhiye  →" }); grain(t, 0.04); return; }
    bg("#0e0e0e");
    if (t < T2) {
      // real footage: the "before" — full-bleed market, then a flat phone snapshot
      if (t < T1) { kb(seq("market", t, 0), t, 0, T1, 1.05, 1.1); }
      else { g.save(); g.filter = "blur(18px) brightness(0.45)"; cover(seq("market", t, 0), 0, 0, W, H, 1.2); g.restore();
        const p = oB(clamp((t - T1) / 0.4)), pw = 640 * u, ph = 860 * u; g.save(); g.translate(CX, 700 * u); g.rotate(-0.04); g.scale(p, p);
        g.fillStyle = "#fff"; rr(-pw / 2 - 20 * u, -ph / 2 - 20 * u, pw + 40 * u, ph + 120 * u, 18 * u); g.fill();
        g.save(); g.beginPath(); g.rect(-pw / 2, -ph / 2, pw, ph); g.clip(); g.filter = "saturate(0.45) contrast(0.7) brightness(1.18) blur(1.5px)"; cover(IM.i38, -pw / 2, -ph / 2, pw, ph, 1.6, 0.08, 0.5); g.restore();
        txt("our_ad_final_v2.jpg", 0, ph / 2 + 52 * u, { size: 30 * u, fam: F.mono, color: "#555" }); g.restore(); }
      txt(t < T1 ? "REAL FOOTAGE" : "THE USUAL PRODUCT PHOTO", 60 * u, 230 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", alpha: 0.75, ls: 3 });
    } else {
      const k = PREM.reduce((a, p, i) => (t >= p[0] ? i : a), 0), [t0, im, ax, lab] = PREM[k];
      g.save(); g.globalAlpha = oC(prog(t, t0, t0 + 0.25)); kb(IM[im], t, t0, 2.2, 1.04, 1.12, ax, 0.5); g.restore();
      flash(t, T2, 0.25);
      const lp = oC(prog(t, t0 + 0.1, t0 + 0.4)); font(30 * u, 700, F.mono); const lw = tw(lab) + 50 * u;
      g.save(); g.globalAlpha = lp; g.fillStyle = "rgba(255,255,255,0.92)"; rr(60 * u, 205 * u, lw, 56 * u, 28 * u); g.fill(); g.restore();
      txt(lab, 60 * u + lw / 2, 234 * u, { size: 30 * u, fam: F.mono, weight: 700, color: C.ink, alpha: lp });
      g.fillStyle = "rgba(0,0,0,0.6)"; rr(W - 300 * u, 207 * u, 240 * u, 54 * u, 27 * u); g.fill(); txt("MADE WITH AI", W - 180 * u, 235 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", ls: 2 });
    }
    shade(H * 0.5, H, 0.88);
    capClean(t, voChunk(t, 4, 0.5), H * 0.72, { size: 74 * u, weight: 800, color: "#fff", shadow: 14, shadowColor: "rgba(0,0,0,0.6)" });
    grain(t, 0.04);
  },
};
