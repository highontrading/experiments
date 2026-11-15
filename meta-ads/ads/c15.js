// C15 · "The whole course on one board" (English VO Alice, 4:5 feed). A whiteboard explainer: marker strokes draw a
// staircase of the three levels and the capstone, with taped-up AI work as examples.
// Captions: Permanent Marker subtitles in ink under the board; board labels drawn in coloured marker.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, BLUE = "#1f5fbf", GREEN = "#1f8f4e", RED = "#c62f2f", INK = "#1b1b1b";
const STEPS = [[1, "LEVEL 1", "THE IMAGE", BLUE, 70, 190, ["i35", "i00"]], [2, "LEVEL 2", "MOTION & SOUND", GREEN, 70, 410, ["i22", "i19"]], [3, "LEVEL 3", "AGENCY STANDARD", RED, 70, 630, ["i38", "i32"]]];
const T_CAP = L[4].at, T_END = L[4].v1 + 0.9;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "course-on-one-board",
  images: { i35: "assets/img/site/i35.jpg", i00: "assets/img/site/i00.jpg", i22: "assets/img/site/i22.jpg", i38: "assets/img/site/i38.jpg", i19: "assets/img/site/i19.jpg", i32: "assets/img/site/i32.jpg" },
  music: { file: "build/music_el/ukulele.mp3", offset: 0, gain: -13, duck: -6, fadeOut: 1.0 },
  sfx: [["marker", 0.4, -12], ...STEPS.map((s) => ["marker", L[s[0]].at, -12]), ...STEPS.map((s) => ["pop", L[s[0]].at + 1.4, -14]), ["marker", T_CAP, -12], ["ding", T_CAP + 1.2, -12], ["whoosh", T_END - 0.1, -12]],
  write(s, x, y, t0, t, o = {}) { const p = clamp((t - t0) / (o.dur || 0.6)); if (p <= 0) return; const size = o.size || 52 * u; font(size, 400, F.marker); const w = tw(s);
    g.save(); g.beginPath(); g.rect(x - (o.align === "center" ? w / 2 : 0) - 10 * u, y - size, (w + 20 * u) * p, size * 2); g.clip(); txt(s, x, y, { size, fam: F.marker, weight: 400, color: o.color || INK, align: o.align || "left" }); g.restore(); },
  stroke(pts, t0, t, col, dur = 0.6, lw = 7) { const p = clamp((t - t0) / dur); if (p <= 0) return; let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    g.save(); g.strokeStyle = col; g.lineWidth = lw * u; g.lineCap = "round"; g.lineJoin = "round"; g.setLineDash([len * u * p, len * u]); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * u, y * u) : g.moveTo(x * u, y * u))); g.stroke(); g.restore(); },
  photo(im, x, y, w, h, r, t0, t) { const p = oB(clamp((t - t0) / 0.3)); if (p <= 0) return; g.save(); g.translate(x * u, y * u); g.rotate(r); g.scale(p, p); g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.2)"; g.shadowBlur = 14 * u; g.fillRect(-w / 2 * u - 8 * u, -h / 2 * u - 8 * u, w * u + 16 * u, h * u + 16 * u); g.shadowBlur = 0;
    g.save(); g.beginPath(); g.rect(-w / 2 * u, -h / 2 * u, w * u, h * u); g.clip(); cover(IM[im], -w / 2 * u, -h / 2 * u, w * u, h * u); g.restore(); g.fillStyle = "rgba(240,230,170,0.85)"; g.fillRect(-40 * u, -h / 2 * u - 20 * u, 80 * u, 30 * u); g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fdfdfb", fg: INK, titleFam: F.marker, titleWeight: 400, titleSize: 90, cta: "Start at level 1  →" }); return; }
    // board
    bg("#d9dcdf"); g.fillStyle = "#fdfdfb"; g.fillRect(30 * u, 30 * u, W - 60 * u, H - 260 * u); const sh = g.createLinearGradient(0, 0, W, H); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(200,210,220,0.15)"); sh.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = sh; g.fillRect(30 * u, 30 * u, W - 60 * u, H - 260 * u);
    g.fillStyle = "#b9bec4"; g.fillRect(30 * u, H - 238 * u, W - 60 * u, 16 * u);
    this.write("AI & ADVERTISING", CX, 110 * u, 0.4, t, { size: 64 * u, align: "center", dur: 0.9 });
    this.stroke([[300, 150], [780, 145]], 1.2, t, INK, 0.4, 5);
    // staircase steps
    STEPS.forEach(([li, lv, name, col, x, y, ims], i) => { const t0 = L[li].at;
      this.stroke([[x, y], [x + 480, y], [x + 480, y + 170], [x, y + 170], [x, y]], t0, t, col, 0.8, 7);
      this.write(lv, x + 30, y + 58, t0 + 0.4, t, { size: 40 * u, color: col, dur: 0.3 }); this.write(name, x + 30, y + 125, t0 + 0.7, t, { size: fitSize(name, 420 * u, 52 * u, 400, F.marker), color: INK, dur: 0.5 });
      ims.forEach((im, j) => this.photo(im, 680 + j * 190, y + 85, 150, 170, (j % 2 ? 0.07 : -0.05), t0 + 1.4 + j * 0.3, t));
      this.stroke([[x + 240, y + 178], [x + 240, y + 225], [x + 225, y + 210], [x + 240, y + 225], [x + 255, y + 210]], t0 + 2.0, t, INK, 0.4, 5); });
    // capstone star + portfolio
    const t0 = T_CAP; const sx = 200, sy = 830, pts = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 40 : 95; pts.push([sx - 60 + Math.cos(a) * r, sy + 70 + Math.sin(a) * r]); }
    this.stroke(pts, t0, t, "#d4a017", 0.8, 7); this.write("CAPSTONE", 300, 915, t0 + 0.6, t, { size: 60 * u, color: "#d4a017", dur: 0.4 });
    this.write("→ a real campaign for your portfolio", 300, 1040, t0 + 1.2, t, { size: 38 * u, color: INK, dur: 0.6 });
    if (t >= t0 + 1.6) { const p = oC(prog(t, t0 + 1.6, t0 + 2.0)); g.save(); g.strokeStyle = "#d4a017"; g.lineWidth = 6 * u; g.globalAlpha = p; g.beginPath(); g.ellipse(455 * u, 915 * u, 210 * u, 70 * u, -0.05, 0, 7); g.stroke(); g.restore(); }
    // subtitles in marker
    capClean(t, voChunk(t, 6, 0.5), H - 120 * u, { size: 48 * u, fam: F.marker, weight: 400, color: INK });
  },
};
