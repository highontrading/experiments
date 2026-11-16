// R06 · "THIS IS AI ADVERTISING" — sepia portfolio (style ref 6). Beige textured paper; sepia footage boxes on dark
// rectangles; headline = small grey lead + big bold Inter Tight word + Great Vibes script underneath + small paragraph;
// stacked "profile" stat cards with yellow highlights; a counter with flying polaroids; then sepia footage with white
// bold kinetic lines and a signature. Music r06 (soul hip-hop, 89 BPM), no VO.
const B = 0.6707, at = (n) => 0.07 + n * B;
const S = [0, at(6), at(11), at(16), at(22), at(30), at(39), at(60)], T_END = S[7];
const INK = "#2b2620", SEP = "sepia(0.75) grayscale(0.35) contrast(1.15) brightness(0.95)";
const KIN = [[0, "tree", [["AI is", 60], ["the prime example", 90], ["of creativity", 110], ["over budget.", 120]]], [1, "office", [["speed", 150], ["over excuses.", 110]]],
  [2, "train", [["taste", 150], ["over tools.", 120]]], [3, "backlit", [["direction", 130], ["over luck.", 120]]], [4, "ny_car", [["start", 160], ["today.", 160]]]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "this-is-ai-advertising-portfolio",
  seqs: ["ny_glasses", "berry", "faces", "carwin", "ugc_hair", "tree", "office", "train", "backlit", "ny_car"],
  music: { file: "build/music_el/r06.mp3", offset: 0, gain: -5, fadeOut: 1.0 },
  sfx: [...S.slice(1, 7).map((s) => ["hit_punch", s, -9]), ["paper_slide", S[4] + 0.1, -10], ["paper_slide", S[4] + 0.6, -12], ["paper_slide", S[4] + 1.1, -12], ["riser_short", S[5] + 1.2, -12], ["hit_big", S[5] + 3.4, -8],
        ...[1, 2, 3, 4].map((i) => ["swoosh_fast", S[6] + i * (S[7] - S[6]) / 5 - 0.1, -12]), ["hit_big", T_END, -8]],
  head(lead, big, script, para, t, t0, y, o = {}) {
    if (lead) txt(lead, o.x ?? CX, y - 90 * u, { size: 40 * u, fam: F.dms, style: "italic", weight: 400, color: "#7b6f62", alpha: oC(prog(t, t0, t0 + 0.4)), align: o.align });
    blurWord(big, o.x ?? CX, y, Math.min(170 * u, fitSize(big, W * 0.86, 170 * u, 800, F.tight)), t, t0 + 0.2, { fam: F.tight, color: INK, from: 1.25, align: o.align });
    if (script) { const p = clamp((t - t0 - 0.55) / 0.6); font(110 * u, 400, F.vibes); const w = tw(script), x = (o.x ?? CX) + 60 * u; g.save(); g.beginPath(); g.rect(x - w / 2 - 20 * u, y + 40 * u, (w + 40 * u) * oC(p), 200 * u); g.clip();
      txt(script, x, y + 140 * u, { size: 110 * u, fam: F.vibes, weight: 400, color: INK }); g.restore(); }
    if (para) { font(24 * u, 500, F.tight); wrap(para, 560 * u).forEach((ln, i) => txt(ln, CX, y + (script ? 240 : 150) * u + i * 32 * u, { size: 24 * u, fam: F.tight, weight: 500, color: "#6f6458", alpha: oC(prog(t, t0 + 0.9, t0 + 1.3)) })); }
  },
  box(src, t, t0, y, w, h, o = {}) { const p = oX(clamp((t - t0 - (o.d || 0.3)) / 0.5)); if (p <= 0) return; g.save(); g.globalAlpha = clamp(p * 2);
    g.fillStyle = "#2a2622"; g.fillRect(CX - w / 2, y + (1 - p) * 140 * u, w, h); g.restore(); vcard(seq(src, t, t0), CX - w / 2 + 16 * u, y + 16 * u + (1 - p) * 140 * u, w - 32 * u, h - 32 * u, { filter: SEP, shadow: false, ay: o.ay ?? 0.35 }); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#d8ccb8", fg: INK, titleFam: F.dms, titleStyle: "italic", titleWeight: 400, titleSize: 120, title: "AI & Advertising", button: { fill: "#f2d24b", shadow: INK }, cta: "Join now  →" }); grain(t, 0.06); return; }
    const k = cutIdx(t, S.slice(0, 7)), t0 = S[k];
    if (k < 6) { tex("paperB"); }
    if (k === 0) { this.head("this is", "AI", "Advertising", null, t, t0, 380 * u); this.box("ny_glasses", t, t0, 760 * u, 600 * u, 640 * u, { ay: 0.3 }); }
    else if (k === 1) { this.head("a proven", "shortcut", null, "From one product photo to a full campaign, without booking a single studio day.", t, t0, 380 * u); this.box("berry", t, t0, 800 * u, 640 * u, 560 * u); }
    else if (k === 2) { this.head("a trusted", "craft", "for creators", "Light, lens, texture and story: the same rules great photographers use, now directed with AI.", t, t0, 380 * u); this.box("faces", t, t0, 860 * u, 600 * u, 560 * u, { ay: 0.3 }); }
    else if (k === 3) { txt("and most", CX, 330 * u, { size: 44 * u, fam: F.dms, style: "italic", weight: 400, color: "#7b6f62", alpha: oC(prog(t, t0, t0 + 0.3)) });
      const p = clamp((t - t0 - 0.3) / 0.6); font(120 * u, 400, F.vibes); g.save(); g.beginPath(); g.rect(0, 340 * u, W * oC(p), 160 * u); g.clip(); txt("importantly", CX, 420 * u, { size: 120 * u, fam: F.vibes, weight: 400, color: INK }); g.restore();
      this.box("carwin", t, t0, 560 * u, 720 * u, 560 * u, { d: 0.5 }); this.head("", "learnable", null, "Eleven modules, step by step. If you can describe a picture, you can direct one.", t, t0 + 1.0, 1260 * u); }
    else if (k === 4) { blurWord("11 modules", CX, 330 * u, 110 * u, t, t0, { fam: F.tight, color: INK }); txt("across one course", CX + 120 * u, 410 * u, { size: 48 * u, fam: F.dms, style: "italic", weight: 400, color: "#7b6f62", alpha: oC(prog(t, t0 + 0.3, t0 + 0.6)) });
      [["AI & Advertising", "Product shoots · models · sets", "Level 1"], ["AI & Advertising", "Video ads · voice · music · UGC", "Level 2"], ["AI & Advertising", "Meta ads · finishing · capstone", "Level 3"]].forEach(([a, b2, c], i) => {
        const p = oX(clamp((t - t0 - 0.2 - i * 0.5) / 0.5)), y = (560 + i * 300) * u + (1 - p) * 300 * u; if (p <= 0) return; g.save(); g.globalAlpha = clamp(p * 2);
        g.fillStyle = "#f6f0e4"; g.shadowColor = "rgba(0,0,0,0.25)"; g.shadowBlur = 30 * u; rr(110 * u, y, W - 220 * u, 250 * u, 22 * u); g.fill(); g.shadowBlur = 0;
        g.save(); g.beginPath(); g.arc(200 * u, y + 90 * u, 54 * u, 0, 7); g.clip(); logo(200 * u, y + 90 * u, 70 * u, "ink"); g.restore(); g.strokeStyle = INK; g.lineWidth = 3 * u; g.beginPath(); g.arc(200 * u, y + 90 * u, 54 * u, 0, 7); g.stroke();
        txt(a + " ✓", 280 * u, y + 70 * u, { size: 44 * u, fam: F.tight, weight: 800, color: INK, align: "left" }); font(30 * u, 500, F.tight); const bw = tw(b2) + 24 * u;
        g.fillStyle = "#f2d24b"; g.fillRect(268 * u, y + 100 * u, bw * oC(clamp((t - t0 - 0.7 - i * 0.5) / 0.4)), 44 * u); txt(b2, 280 * u, y + 123 * u, { size: 30 * u, fam: F.tight, weight: 500, color: INK, align: "left" });
        g.fillStyle = "#e8dfcf"; rr(150 * u, y + 175 * u, W - 300 * u, 48 * u, 24 * u); g.fill(); txt(c, CX, y + 200 * u, { size: 26 * u, fam: F.tight, weight: 600, color: INK }); g.restore(); }); }
    else if (k === 5) { const n = t < t0 + 3.3 ? 1 : Math.round(lerp(1, 100, oC(prog(t, t0 + 3.3, t0 + 4.4))));
      this.box("ugc_hair", t, t0, 820 * u, 640 * u, 760 * u, { d: 0.1, ay: 0.3 });
      for (let i = 0; i < 14; i++) { const st = t0 + 3.3 + i * 0.12; if (t < st) continue; const q = prog(t, st, st + 1.6), a0 = rnd(i) * 6.28, x = CX + Math.cos(a0) * 700 * u * (1 - q) + (rnd(i + 3) - 0.5) * 1000 * u * q, y = 1800 * u - q * 1050 * u * (0.6 + rnd(i + 7) * 0.4);
        g.save(); g.translate(x, y); g.rotate((rnd(i + 2) - 0.5) * 1.2 + q * (rnd(i + 4) - 0.5) * 2); g.fillStyle = "#f6f0e4"; g.shadowColor = "rgba(0,0,0,0.3)"; g.shadowBlur = 20 * u; g.fillRect(-90 * u, -110 * u, 180 * u, 220 * u); g.shadowBlur = 0;
        g.filter = SEP; cover(IM["p" + (i % 8)], -78 * u, -98 * u, 156 * u, 160 * u); g.filter = "none"; g.restore(); }
      const big = n === 1 ? "1 photo" : `${n} ads`; g.fillStyle = "rgba(216,204,184,0.0)"; txt(big, CX, 470 * u, { size: 190 * u, fam: F.dms, weight: 400, color: INK, shadow: 20, shadowColor: "rgba(216,204,184,0.9)" }); txt(n === 1 ? "is all it takes" : "from one photo", CX + 160 * u, 590 * u, { size: 70 * u, fam: F.vibes, weight: 400, color: INK, shadow: 20, shadowColor: "rgba(216,204,184,0.9)" }); }
    else { const n = KIN.length, d = (S[7] - S[6]) / n, j = Math.min(n - 1, Math.floor((t - t0) / d)), tj = t0 + j * d, [, src, rows] = KIN[j];
      g.save(); g.filter = "sepia(0.6) grayscale(0.5) contrast(1.15) brightness(0.85)"; kb(seq(src, t, tj), t, tj, d, 1.04, 1.12, 0.5, 0.4); g.restore(); vignette(0.5); shade(H * 0.45, H, 0.5);
      let yy = (rows.length > 2 ? 960 : 1080) * u; rows.forEach(([s, sz], i) => { const st = tj + 0.15 + i * 0.4, z = Math.min(sz * u, fitSize(s, W * 0.84, sz * u, 800, F.tight)); if (i) yy += z * 0.5;
        blurWord(s, 90 * u, yy, z, t, st, { fam: F.tight, align: "left", alpha: i === rows.length - 1 ? 1 : 0.9 }); yy += z * 0.55; });
      if (j === n - 1) txt("Ideabro Studio", W - 90 * u, 1560 * u, { size: 60 * u, fam: F.dms, style: "italic", weight: 400, color: "#f3e6cf", align: "right", alpha: oC(prog(t, tj + 1.0, tj + 1.6)) }); }
    grain(t, 0.07);
  },
  images: Object.fromEntries(["i31", "i32", "i33", "i35", "i38", "i00", "i21", "i19"].map((k, i) => ["p" + i, `assets/img/site/${k}.jpg`])),
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[5], kicker: "THIS IS AI ADVERTISING", h1: "A proven", h2: "shortcut.", f1: F.vibes, s1: "", f2: F.tight, accent: "#f2d24b", btn: "#f2d24b", glow: "rgba(242,210,75,0.5)", scrim: "rgba(30,24,18,0.72)",
  end: { bg: "#d8ccb8", fg: INK, titleFam: F.dms, titleStyle: "italic", titleWeight: 400, titleSize: 120, title: "AI & Advertising", button: { fill: "#f2d24b", shadow: INK } } });
