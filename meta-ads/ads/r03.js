// R03 · "MAKING ADS ALONE?" — retro grunge (style ref 3). Dark olive grunge texture with a spotlight, beige retro CRT
// monitors and glass domes holding the footage, red label boxes, trophy under a spotlight.
// Captions: Anton white caps + Pixelify Sans, with red tag boxes for the key word. Music r03 (gritty boom-bap, 92 BPM).
const B = 0.6385, Z = 0.7, at = (n) => Z + n * B;
const S = [0, at(4), at(10), at(16), at(22), at(30), at(36), at(42), at(48), at(58)], T_END = S[9];
const RED = "#d62828", CREAMX = "#efe6cf", YEL = "#f2c230";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "making-ads-alone",
  seqs: ["laptop", "studio", "sky_girl", "luna_lime", "faces", "can_drop", "ugc_hands", "moto", "stress", "epica_bus", "beachcan", "ny_cross"],
  music: { file: "build/music_el/r03.mp3", offset: 0, gain: -5, fadeOut: 0.8 },
  sfx: [...S.slice(1, 9).map((s) => ["hit_punch", s, -9]), ["typing_fast", 0.2, -14], ["glitch_hit", S[1] + 0.9, -10], ["glitch_hit", S[1] + 1.6, -12], ["ding", S[2] + 1.9, -8],
        ["coin", S[4], -12], ["coin", S[4] + 1.7, -12], ["coin", S[4] + 3.4, -12], ["bass_drop", S[5], -8], ["powerup", S[6] + 0.3, -12], ["stamp", S[7] + 0.9, -8], ["powerup", S[8] + 0.4, -10], ["hit_big", T_END, -8]],
  room(t, lit = 1) { tex("grunge"); const r = g.createRadialGradient(CX, 760 * u, 60 * u, CX, 760 * u, 1000 * u); r.addColorStop(0, `rgba(255,240,180,${0.2 * lit})`); r.addColorStop(1, "rgba(0,0,0,0.55)"); g.fillStyle = r; g.fillRect(0, 0, W, H); },
  crt(src, cx, cy, w, t, t0, o = {}) {
    const h = w * 0.82, p = oB(clamp((t - t0 - (o.delay || 0)) / 0.35)); if (p <= 0) return; g.save(); g.translate(cx, cy); g.scale(p, p); g.rotate(o.rot || 0);
    g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 50 * u; g.shadowOffsetY = 26 * u; g.fillStyle = CREAMX; rr(-w / 2, -h / 2, w, h, 34 * u); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.fillStyle = "#c8bea3"; rr(-w / 2 + 14 * u, h / 2 - 70 * u, w - 28 * u, 50 * u, 12 * u); g.fill(); g.fillStyle = RED; g.beginPath(); g.arc(w / 2 - 60 * u, h / 2 - 45 * u, 10 * u, 0, 7); g.fill();
    const sw = w - 90 * u, sh = h - 150 * u; g.save(); rr(-sw / 2, -h / 2 + 40 * u, sw, sh, 30 * u); g.clip(); g.fillStyle = "#111"; g.fillRect(-sw / 2, -h / 2 + 40 * u, sw, sh);
    if (src) { g.filter = o.filter || "contrast(1.1) saturate(1.1)"; cover(seq(src, t, t0), -sw / 2, -h / 2 + 40 * u, sw, sh, 1.08, o.ax ?? 0.5, o.ay ?? 0.4); g.filter = "none"; }
    if (o.draw) o.draw(-sw / 2, -h / 2 + 40 * u, sw, sh); g.fillStyle = "rgba(0,0,0,0.18)"; for (let y = -h / 2 + 40 * u; y < -h / 2 + 40 * u + sh; y += 5 * u) g.fillRect(-sw / 2, y, sw, 2 * u);
    const gl = g.createRadialGradient(-sw * 0.2, -h / 2 + 90 * u, 10 * u, 0, 0, sw); gl.addColorStop(0, "rgba(255,255,255,0.18)"); gl.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gl; g.fillRect(-sw / 2, -h / 2 + 40 * u, sw, sh);
    g.restore(); g.fillStyle = "#b9ae90"; g.fillRect(-w * 0.18, h / 2, w * 0.36, 40 * u); g.restore();
  },
  dome(src, cx, cy, w, t, t0, o = {}) {
    const p = oX(clamp((t - t0 - (o.delay || 0)) / 0.5)); if (p <= 0) return; const y = cy - (1 - p) * 900 * u, h = w * 1.25, sw = Math.sin(t * 1.6 + cx) * 0.03;
    g.save(); g.translate(cx, y); g.rotate(sw); g.strokeStyle = "#8a8a7a"; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(0, -h / 2 - 30 * u); g.lineTo(0, -h / 2 - 900 * u); g.stroke();
    g.fillStyle = RED; g.beginPath(); g.arc(0, -h / 2 - 30 * u, 16 * u, 0, 7); g.fill();
    g.save(); g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(-w / 2, -h / 2 + w / 2); g.arc(0, -h / 2 + w / 2, w / 2, Math.PI, 0); g.lineTo(w / 2, h / 2); g.closePath(); g.clip();
    cover(seq(src, t, t0), -w / 2, -h / 2, w, h, 1.1); g.fillStyle = "rgba(180,220,230,0.12)"; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
    g.strokeStyle = "rgba(230,245,250,0.85)"; g.lineWidth = 6 * u; g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(-w / 2, -h / 2 + w / 2); g.arc(0, -h / 2 + w / 2, w / 2, Math.PI, 0); g.lineTo(w / 2, h / 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 10 * u; g.beginPath(); g.arc(0, -h / 2 + w / 2, w / 2 - 28 * u, Math.PI * 1.15, Math.PI * 1.45); g.stroke();
    g.fillStyle = "#3a3a32"; rr(-w / 2 - 20 * u, h / 2 - 10 * u, w + 40 * u, 40 * u, 10 * u); g.fill(); g.restore();
  },
  label(s, cx, cy, size, t, t0, o = {}) { const p = oB(clamp((t - t0) / 0.3)); if (p <= 0) return; font(size, 400, F.anton); const w = tw(s) + size * 0.7, h = size * 1.25;
    g.save(); g.translate(cx, cy); g.rotate(o.rot ?? -0.03); g.scale(p, p); g.fillStyle = o.bg || RED; rr(-w / 2, -h / 2, w, h, 8 * u); g.fill(); if (o.border) { g.strokeStyle = "#fff"; g.lineWidth = 5 * u; rr(-w / 2, -h / 2, w, h, 8 * u); g.stroke(); }
    txt(s, 0, 3 * u, { size, fam: F.anton, weight: 400, color: o.color || "#fff" }); g.restore(); },
  big(s, cx, cy, size, t, t0, o = {}) { const p = oB(clamp((t - t0) / 0.28)); if (p <= 0) return; g.save(); g.translate(cx, cy); g.scale(lerp(1.3, 1, oC(clamp((t - t0) / 0.2))), lerp(1.3, 1, oC(clamp((t - t0) / 0.2))));
    txt(s, 0, 0, { size: Math.min(size, fitSize(s, W * 0.88, size, 400, o.fam || F.anton)), fam: o.fam || F.anton, weight: o.fam === F.pixs ? 700 : 400, color: o.color || "#fff", alpha: clamp(p * 2), shadow: 18, shadowColor: "rgba(0,0,0,0.6)" }); g.restore(); },
  render(t) {
    if (t >= T_END) { this.room(t); endCard(t, T_END, { bg: false, fg: "#fff", titleFam: F.anton, titleWeight: 400, titleSize: 130, title: "AI & ADVERTISING", button: { fill: RED, color: "#fff", shadow: "#000" }, cta: "JOIN NOW  →" }); grain(t, 0.06); return; }
    const k = cutIdx(t, S.slice(0, 9)), t0 = S[k]; this.room(t, k === 5 ? 0.4 : 1);
    if (k === 0) { this.big("MAKING ADS", CX, 330 * u, 130 * u, t, Z); this.label("ALONE?", CX, 470 * u, 110 * u, t, Z + 2 * B); this.crt("laptop", CX, 1020 * u, 820 * u, t, t0, { filter: "grayscale(0.6) contrast(1.2)" }); }
    else if (k === 1) { this.big("STUCK ON A", CX, 330 * u, 110 * u, t, t0); this.label("SHOOT?", CX, 460 * u, 110 * u, t, t0 + 2 * B);
      this.crt("studio", CX, 1030 * u, 820 * u, t, t0, { filter: "grayscale(0.4) contrast(1.15)", draw: (x, y, w, h) => {
        [["BUDGET EXCEEDED", 0.9, 0.12, 0.2], ["RESHOOT REQUIRED", 1.6, 0.3, 0.45], ["MODEL CANCELLED", 2.3, 0.08, 0.68]].forEach(([s2, d, fx, fy]) => { if (t < t0 + d) return; const q = oB(clamp((t - t0 - d) / 0.2));
          g.save(); g.translate(x + w * (fx + 0.32), y + h * fy); g.scale(q, q); g.fillStyle = "#e8e8e8"; g.fillRect(-200 * u, -50 * u, 400 * u, 100 * u); g.fillStyle = "#1f3ea8"; g.fillRect(-200 * u, -50 * u, 400 * u, 26 * u);
          txt("⚠ " + s2, 0, 16 * u, { size: 28 * u, fam: F.pixs, weight: 700, color: "#111" }); g.restore(); }); } }); }
    else if (k === 2) { this.big("WHAT IF", CX, 330 * u, 110 * u, t, t0); this.label("NO STUDIO?", CX, 460 * u, 100 * u, t, t0 + 2 * B);
      this.crt("sky_girl", CX, 1030 * u, 820 * u, t, t0, { draw: (x, y, w, h) => { if (t < t0 + 1.9) return; const q = oB(clamp((t - t0 - 1.9) / 0.25)); g.save(); g.translate(x + w / 2, y + h * 0.78); g.scale(q, q);
        g.fillStyle = YEL; rr(-150 * u, -46 * u, 300 * u, 92 * u, 10 * u); g.fill(); txt("✓ SOLVED", 0, 4 * u, { size: 40 * u, fam: F.pixs, weight: 700, color: "#111" }); g.restore(); } }); }
    else if (k === 3) { this.dome("luna_lime", 300 * u, 760 * u, 380 * u, t, t0); this.dome("faces", 780 * u, 700 * u, 380 * u, t, t0, { delay: 0.25 });
      this.big("made for", CX, 1150 * u, 70 * u, t, t0 + 0.9, { fam: F.pixs }); this.label("MARKETERS", CX, 1260 * u, 100 * u, t, t0 + 1.3); this.big("who want to", CX, 1370 * u, 60 * u, t, t0 + 1.8, { fam: F.pixs }); this.big("GET BETTER.", CX, 1470 * u, 110 * u, t, t0 + 2.2); }
    else if (k === 4) { const sub = [["can_drop", "PRODUCT SHOTS"], ["ugc_hands", "AI UGC"], ["moto", "AI FILMS"]], j = Math.min(2, Math.floor((t - t0) / (4 * B * 0.85))), tj = t0 + j * 4 * B * 0.85;
      this.big("LEARN TO MAKE", CX, 330 * u, 90 * u, t, t0); this.label(sub[j][1], CX, 470 * u, 100 * u, t, tj); this.crt(sub[j][0], CX, 1030 * u, 820 * u, t, tj, { ay: j === 1 ? 0.3 : 0.45 });
      [0, 1, 2].forEach((i) => { g.fillStyle = i <= j ? YEL : "rgba(255,255,255,0.25)"; g.fillRect(CX - 150 * u + i * 110 * u, 1460 * u, 80 * u, 14 * u); }); }
    else if (k === 5) { const im = seq("stress", t, t0); g.save(); g.globalAlpha = 0.55; vcard(im, 140 * u, 600 * u, 800 * u, 600 * u, { filter: "grayscale(1) brightness(0.6)", shadow: false }); g.restore();
      this.big("STRUGGLE", CX, 360 * u, 170 * u, t, t0, { color: "#8f2a2a" }); this.big("alone anymore?", CX, 480 * u, 60 * u, t, t0 + 2 * B, { fam: F.pixs, color: "#bdbdbd" }); this.label("NOT ANYMORE.", CX, 1350 * u, 90 * u, t, t0 + 4 * B, { bg: YEL, color: "#111" }); }
    else if (k === 6) { const p = oC(prog(t, t0, t0 + 0.5)); g.save(); g.globalAlpha = p * 0.45; const cone = g.createLinearGradient(0, 0, 0, H); cone.addColorStop(0, "rgba(255,230,140,0.9)"); cone.addColorStop(1, "rgba(255,230,140,0)");
        g.fillStyle = cone; g.beginPath(); g.moveTo(CX - 60 * u, 0); g.lineTo(CX + 60 * u, 0); g.lineTo(CX + 420 * u, H * 0.75); g.lineTo(CX - 420 * u, H * 0.75); g.fill(); g.restore();
      this.big("COMPETE", CX, 330 * u, 140 * u, t, t0); this.label("WITH BIG BRANDS", CX, 470 * u, 80 * u, t, t0 + 2 * B);
      this.crt("epica_bus", 290 * u, 1050 * u, 470 * u, t, t0, { delay: 0.4 }); this.crt("beachcan", 790 * u, 1050 * u, 470 * u, t, t0, { delay: 0.6 });
      const tp = oB(clamp((t - t0 - 1.2) / 0.4)); if (tp > 0) { g.save(); g.translate(CX, 1370 * u); g.scale(tp, tp); g.fillStyle = YEL; g.beginPath(); g.moveTo(-90 * u, -120 * u); g.lineTo(90 * u, -120 * u); g.quadraticCurveTo(80 * u, 20 * u, 0, 30 * u); g.quadraticCurveTo(-80 * u, 20 * u, -90 * u, -120 * u); g.fill();
        g.fillRect(-14 * u, 30 * u, 28 * u, 50 * u); g.fillRect(-60 * u, 80 * u, 120 * u, 24 * u); g.strokeStyle = YEL; g.lineWidth = 12 * u; g.beginPath(); g.arc(-95 * u, -80 * u, 40 * u, 1.5, 4.5, false); g.stroke(); g.beginPath(); g.arc(95 * u, -80 * u, 40 * u, -1.4, 1.6); g.stroke(); g.restore(); } }
    else if (k === 7) { this.big("THE COURSE IS", CX, 360 * u, 100 * u, t, t0); const cp = oB(clamp((t - t0 - 0.5) / 0.4));
      g.save(); g.translate(CX, 860 * u); g.rotate(-0.04); g.scale(cp, cp); g.fillStyle = "#f4efe2"; g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 40 * u; rr(-300 * u, -320 * u, 600 * u, 640 * u, 20 * u); g.fill(); g.shadowBlur = 0;
      g.fillStyle = RED; rr(-300 * u, -320 * u, 600 * u, 140 * u, 20 * u); g.fill(); g.fillRect(-300 * u, -220 * u, 600 * u, 40 * u); txt("2026", 0, -250 * u, { size: 60 * u, fam: F.pixs, weight: 700, color: "#fff" });
      txt("new", 0, 30 * u, { size: 210 * u, fam: F.vibes, weight: 400, color: RED }); txt("11 MODULES · 41 LESSONS", 0, 220 * u, { size: 32 * u, fam: F.pixs, weight: 700, color: "#222" }); g.restore();
      this.label("LIFETIME ACCESS", CX, 1340 * u, 70 * u, t, t0 + 1.4, { bg: YEL, color: "#111", rot: 0.03 }); }
    else { this.crt("ny_cross", CX, 960 * u, 720 * u, t, t0, { delay: 0 }); this.big("AND MAKE", CX, 330 * u, 110 * u, t, t0 + 0.2); this.label("SOMETHING WORTH WATCHING", CX, 460 * u, 64 * u, t, t0 + 0.8);
      this.label("JOIN NOW →", CX, 1420 * u, 96 * u, t, t0 + 2.0, { bg: RED, border: true }); }
    grain(t, 0.07); vignette(0.35);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[5], kicker: "MADE FOR MARKETERS", h1: "Make ads", h2: "without a shoot.", accent: YEL, btn: RED, glow: "rgba(214,40,40,0.55)", f1: F.anton, s1: "", f2: F.anton,
  end: { bg: "#1a2316", fg: "#fff", titleFam: F.anton, titleWeight: 400, titleSize: 130, title: "AI & ADVERTISING", button: { fill: RED, color: "#fff", shadow: "#000" } } });
