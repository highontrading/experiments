// R10 · "EVERYTHING EVOLVED" — minimal glow (style ref 10). Black with drifting blue/violet glow, small white Inter Tight
// paired with Instrument Serif italic, a blue highlight box on the key word, UI pills, floating footage cards on a faint
// grid, a giant motion-blurred blue word on white, scattered letters converging, logo + Join. Music r10 (sleek electronic).
const B = 0.5108, Z = 1.091, at = (n) => Z + n * B;
const S = [0, at(8), at(14), at(20), at(28), at(40), at(48), at(56), at(68), at(76), at(84)], T_END = S[10];
const BLU = "#2f5bff", MONTAGE = [["moto", "films"], ["sea", "worlds"], ["skate", "campaigns"], ["garden", "stories"]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "everything-evolved",
  seqs: ["sunset", "prodshoot", "backlit", "cafe", "giant_city", "beachcan", "desert", "pull", "island", "nyc", "garden", "moto", "sea", "skate"],
  music: { file: "build/music_el/r10.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  sfx: [...S.slice(1, 10).map((s) => ["hit_punch", s, -10]), ["swoosh_fast", S[1] + 0.9, -12], ["ui_click", S[3] + 1.4, -6], ["glitch_hit", S[3] + 1.0, -12], ["rev_swell", S[5] - 1.3, -10], ["hit_big", S[5], -8],
        ...MONTAGE.map((m, i) => ["swoosh_fast", S[8] + i * 2 * B - 0.08, -12]), ["ui_click", S[9] + 1.6, -6], ["hit_big", T_END, -6]],
  glow(t, a = 1) { bg("#020306"); [[0.3, 0.75, "rgba(47,91,255,0.55)"], [0.75, 0.3, "rgba(120,80,255,0.35)"], [0.5, 1.0, "rgba(40,120,255,0.4)"]].forEach(([x, y, c], i) => {
      const cx = W * (x + 0.08 * Math.sin(t * 0.4 + i)), cy = H * (y + 0.05 * Math.cos(t * 0.3 + i)), r = g.createRadialGradient(cx, cy, 10 * u, cx, cy, 900 * u); r.addColorStop(0, c); r.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.globalAlpha = a; g.fillStyle = r; g.fillRect(0, 0, W, H); g.restore(); }); },
  pair(a, b2, y, t, t0, o = {}) {   // small sans + serif italic, centred
    font(o.size || 70 * u, 500, F.tight); const wa = tw(a + " "); font(o.size || 70 * u, 400, F.serif, "italic"); const wb = tw(b2); const x0 = CX - (wa + wb) / 2, sz = o.size || 70 * u;
    const pa = oC(clamp((t - t0) / 0.4)), pb = oC(clamp((t - t0 - 0.3) / 0.4));
    if (o.box && t > t0 + (o.boxAt || 0.9)) { const q = oC(clamp((t - t0 - (o.boxAt || 0.9)) / 0.25)); g.fillStyle = BLU; g.fillRect(x0 + wa - 10 * u, y - sz * 0.62, (wb + 20 * u) * q, sz * 1.24); }
    txt(a, x0, y, { size: sz, fam: F.tight, weight: 500, color: o.c1 || "#fff", align: "left", alpha: pa }); txt(b2, x0 + wa, y + (1 - pb) * 20 * u, { size: sz, fam: F.serif, style: "italic", weight: 400, color: o.c2 || "#fff", align: "left", alpha: pb }); },
  pill(s, cx, cy, t, t0, o = {}) { const p = oB(clamp((t - t0) / 0.35)); if (p <= 0) return; font(46 * u, 500, F.tight); const w = tw(s) + 120 * u; g.save(); g.translate(cx, cy); g.scale(p, p);
    g.fillStyle = "#fff"; g.shadowColor = "rgba(47,91,255,0.25)"; g.shadowBlur = 40 * u; rr(-w / 2, -50 * u, w, 100 * u, 50 * u); g.fill(); g.shadowBlur = 0; g.strokeStyle = "rgba(47,91,255,0.35)"; g.lineWidth = 2 * u; rr(-w / 2, -50 * u, w, 100 * u, 50 * u); g.stroke();
    txt(s, -20 * u, 2 * u, { size: 46 * u, fam: F.tight, weight: 500, color: o.color || BLU }); txt("↗", w / 2 - 50 * u, 0, { size: 36 * u, color: BLU });
    if (o.strike) { const sp = oC(clamp((t - o.strike) / 0.3)); g.strokeStyle = "#ff3b5c"; g.lineWidth = 6 * u; g.beginPath(); g.moveTo(-w / 2 + 30 * u, 0); g.lineTo(-w / 2 + 30 * u + (w - 60 * u) * sp, 0); g.stroke(); } g.restore(); },
  grid() { g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 1.5 * u; g.beginPath(); for (let x = 0; x < W; x += 135 * u) { g.moveTo(x, 0); g.lineTo(x, H); } for (let y = 0; y < H; y += 135 * u) { g.moveTo(0, y); g.lineTo(W, y); } g.stroke(); },
  render(t) {
    if (t >= T_END) { this.glow(t); endCard(t, T_END, { bg: false, fg: "#fff", titleFam: F.serif, titleStyle: "italic", button: { fill: BLU, color: "#fff", shadow: "#fff" }, cta: "Join now  →" }); grain(t, 0.04); return; }
    const k = cutIdx(t, S.slice(0, 10)), t0 = S[k];
    if (k <= 2) { this.glow(t, k === 0 ? oC(prog(t, 0, 2)) : 1); }
    if (k === 0) { const p = oC(prog(t, 0.3, 1.4)); g.save(); g.globalAlpha = p; vcard(seq("sunset", t, 0), CX - 220 * u, 330 * u, 440 * u, 480 * u, { r: 28 * u, shadow: 50, shadowColor: "rgba(47,91,255,0.4)", s: lerp(0.9, 1, p) }); g.restore(); this.pair("Everything", "evolved.", 960 * u, t, Z, { box: true, boxAt: 1.6 }); }
    else if (k === 1) { const p = oC(prog(t, t0, t0 + 0.6)); g.save(); g.globalAlpha = p; vcard(seq("prodshoot", t, t0), CX - 220 * u, 330 * u, 440 * u, 480 * u, { r: 28 * u, shadow: 50, filter: "grayscale(1) brightness(0.8)" }); g.restore();
      txt("still shooting like 2015", CX, 860 * u, { size: 26 * u, fam: F.mono, color: "#8a93b5", alpha: p, ls: 2 }); this.pair("Advertising", "didn't.", 960 * u, t, t0, { c2: "#9fb4ff" }); }
    else if (k === 2) { this.pair("So we", "rebuilt it.", 820 * u, t, t0); const p = oB(clamp((t - t0 - 1.0) / 0.4)); g.save(); g.translate(CX, 1060 * u); g.scale(p, p); g.shadowColor = "rgba(47,91,255,0.9)"; g.shadowBlur = 60 * u; logo(0, 0, 150 * u, "white"); g.restore(); }
    else if (k === 3) { bg("#f7f8fb"); this.pill("Shoot", CX, 820 * u, t, t0, { strike: t0 + 1.0, color: "#999" }); this.pill("Prompt", CX, 1000 * u, t, t0 + 1.3);
      this.pair("Same ad.", "Zero shoot.", 1250 * u, t, t0 + 1.8, { c1: "#111", c2: "#111", size: 64 * u }); }
    else if (k === 4) { bg("#020306"); this.grid(); const cards = [["backlit", 90, 330, 380, 500, -0.04], ["cafe", 610, 380, 380, 480, 0.05], ["giant_city", 110, 1060, 380, 520, 0.03], ["beachcan", 600, 1040, 400, 540, -0.05]];
      cards.forEach(([s2, x, y, w, h, r], i) => { const p = oX(clamp((t - t0 - i * 0.2) / 0.6)); if (p <= 0) return; const fl = Math.sin(t * 1.3 + i) * 12 * u;
        vcard(seq(s2, t, t0), x * u, y * u + fl + (1 - p) * 200 * u, w * u, h * u, { r: 24 * u, rot: r, shadow: 50, shadowColor: "rgba(47,91,255,0.35)" }); });
      g.fillStyle = "rgba(2,3,6,0.6)"; rr(CX - 260 * u, 880 * u, 520 * u, 150 * u, 75 * u); g.fill(); blurWord("Create", CX, 955 * u, 110 * u, t, t0 + 1.0, { fam: F.tight, weight: 500 }); }
    else if (k === 5) { bg("#ffffff"); const sz = fitSize("create", W * 0.9, 420 * u, 800, F.tight); blurWord("create", CX, 900 * u, sz, t, t0, { fam: F.tight, weight: 800, color: BLU, from: 2.2, dur: 0.5 });
      this.pair("Create &", "launch.", 1220 * u, t, t0 + 1.4, { c1: BLU, c2: "#111", size: 72 * u }); }
    else if (k === 6) { bg("#ffffff"); vcard(seq("desert", t, t0), CX - 230 * u, 330 * u, 460 * u, 620 * u, { r: 28 * u, shadow: 40 });
      txt("•", CX - 300 * u, 1120 * u, { size: 60 * u, color: BLU, alpha: oC(prog(t, t0 + 0.3, t0 + 0.6)) });
      this.pair("Shoot", "nothing.", 1130 * u, t, t0 + 0.4, { c1: "#111", c2: "#111", size: 90 * u }); this.pair("Sell", "everything.", 1260 * u, t, t0 + 1.4, { c1: "#111", c2: BLU, size: 90 * u }); }
    else if (k === 7) { this.glow(t); const cards = [["pull", 120, 420, 300, 380, -0.1], ["island", 660, 360, 320, 420, 0.08], ["nyc", 160, 1150, 340, 400, 0.06]];
      cards.forEach(([s2, x, y, w, h, r], i) => { const p = oX(clamp((t - t0 - 0.3 - i * 0.2) / 0.6)); if (p > 0) vcard(seq(s2, t, t0), x * u, y * u + (1 - p) * 150 * u + Math.sin(t + i) * 10 * u, w * u, h * u, { r: 24 * u, rot: r, shadow: 40, s: p }); });
      for (let i = 0; i < 6; i++) { const ox = rnd(i) * W, oy = rnd(i + 3) * H, q = oC(prog(t, t0 + 0.2, t0 + 2.4)); g.save(); g.globalAlpha = 0.85 * (1 - q); g.fillStyle = BLU; g.beginPath(); g.arc(lerp(ox, CX, q), lerp(oy, 980 * u, q), (30 + 30 * rnd(i + 8)) * u, 0, 7); g.fill(); g.restore(); }
      const word = "beyond the shoot", lp = oC(prog(t, t0 + 1.2, t0 + 3.2)); font(84 * u, 500, F.tight); const tw0 = tw(word); let x = CX - tw0 / 2;
      for (let i = 0; i < word.length; i++) { const ch = word[i], cw = tw(ch), sx = x + cw / 2, sy = 980 * u + (rnd(i * 3 + 1) - 0.5) * 1400 * u; txt(ch, lerp(sx, x + cw / 2, lp), lerp(sy, 980 * u, lp), { size: 84 * u, fam: F.tight, weight: 500, color: "#fff", alpha: 0.4 + 0.6 * lp }); font(84 * u, 500, F.tight); x += cw; } }
    else if (k === 8) { const j = Math.min(3, Math.floor((t - t0) / (2 * B))), tj = t0 + j * 2 * B; g.save(); g.filter = "contrast(1.08) saturate(1.05)"; kb(seq(MONTAGE[j][0], t, tj), t, tj, 2 * B, 1.12, 1.04); g.restore();
      g.fillStyle = "rgba(2,3,6,0.25)"; g.fillRect(0, 0, W, H); shade(H * 0.55, H, 0.6); this.pair("new", MONTAGE[j][1] + ".", 1400 * u, t, tj, { size: 84 * u }); }
    else { this.glow(t); const p = oB(clamp((t - t0) / 0.4)); g.save(); g.translate(CX, 760 * u); g.scale(p, p); g.shadowColor = "rgba(47,91,255,0.9)"; g.shadowBlur = 60 * u; logo(0, 0, 170 * u, "white"); g.restore();
      this.pair("AI &", "Advertising", 990 * u, t, t0 + 0.3, { size: 92 * u }); joinButton(t, t0 + 1.0, CX, 1260 * u, "Join now", { fill: BLU, color: "#fff", glow: "rgba(47,91,255,0.7)", tapAt: 0.6 });
      txt("community.ideabrostudio.com", CX, 1420 * u, { size: 28 * u, fam: F.mono, color: "#fff", alpha: 0.7 * oC(prog(t, t0 + 1.6, t0 + 2.0)) }); }
    grain(t, 0.03);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[6], kicker: "EVERYTHING EVOLVED", h1: "Advertising", h2: "rebuilt with AI.", f1: F.serif, f2: F.tight, accent: "#9fb4ff", btn: BLU, glow: "rgba(47,91,255,0.7)", scrim: "rgba(2,3,6,0.78)",
  end: { bg: "#020306", fg: "#fff", titleFam: F.serif, titleStyle: "italic", button: { fill: BLU, color: "#fff", shadow: "#fff" } } });
