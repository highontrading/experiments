// C11 · "The comic" (English, 4:5 feed, music only). A six-panel comic page: the boss wants 30 ads by Friday with zero
// budget; our marketer directs them with AI — KA-BOOM. The camera moves panel to panel, then pulls out to the page.
// Captions: Bangers speech bubbles, yellow narration boxes, halftone dots.
const P = [  // [x,y,w,h (page units of 1080x1350), image, ax, bubbles[[text, bx, by, tail]], sfx text, narration]
  [30, 30, 500, 420, "i21", 0.5, [["WE NEED 30 NEW ADS. BY FRIDAY.", 270, 110, "bl"]], null, "MONDAY, 9:02 AM."],
  [550, 30, 500, 420, "i24", 0.5, [["WITH WHAT BUDGET?!", 740, 370, "ur"]], null, null],
  [30, 470, 500, 420, "i21", 0.3, [["ZERO.", 380, 560, "bl"]], "GULP!", null],
  [550, 470, 500, 420, "desk", 0.5, [["TIME TO DIRECT.", 800, 560, "br"]], null, "BUT HE'D LEARNED A THING OR TWO…"],
  [30, 910, 1020, 260, "grid", 0.5, [], "KA-BOOM!", "30 ADS. NO SHOOT."],
  [30, 1190, 1020, 130, "end", 0.5, [], null, null],
];
const PS = 2.1, T_OUT = P.length - 1, T_PULL = 5 * PS, T_END = T_PULL + 2.4, GRID = ["i35", "i38", "i22", "i00", "i32", "i12"];
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "the-comic",
  images: Object.fromEntries(["i21", "i24", ...GRID].map((k) => [k, `assets/img/site/${k}.jpg`])),
  seqs: ["desk"],
  music: { file: "build/music_el/comic.mp3", offset: 0, gain: -10, fadeOut: 1.0 },
  sfx: [["pageflip", 0.1, -10], ...[1, 2, 3, 4].map((i) => ["whip", i * PS, -12]), ["boom", 2 * PS + 0.4, -16], ["boom", 4 * PS + 0.3, -8], ["shimmer", T_PULL, -14], ["whoosh", T_END - 0.1, -12]],
  init() { const c = document.createElement("canvas"); c.width = c.height = 12; const x = c.getContext("2d"); x.fillStyle = "rgba(0,0,0,0.35)"; x.beginPath(); x.arc(6, 6, 2.2, 0, 7); x.fill(); this.dots = g.createPattern(c, "repeat"); },
  bubble(s, bx, by, tail, a) { if (a <= 0) return; font(40 * u, 400, F.comic); const lines = wrap(s, 380 * u), w = Math.max(...lines.map(tw)) + 60 * u, h = lines.length * 46 * u + 40 * u;
    g.save(); g.globalAlpha = a; g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = 5 * u; g.beginPath(); g.ellipse(bx * u, by * u, w / 2 + 10 * u, h / 2 + 10 * u, 0, 0, 7); g.fill(); g.stroke();
    const tx = tail.endsWith("l") ? -1 : 1, up = tail.startsWith("u") ? -1 : 1, ey = by * u + up * h / 2; g.beginPath(); g.moveTo(bx * u + tx * w * 0.15, ey); g.lineTo(bx * u + tx * w * 0.32, ey + up * 60 * u); g.lineTo(bx * u + tx * w * 0.02, ey + up * 4 * u); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(bx * u, by * u, w / 2 + 6 * u, h / 2 + 6 * u, 0, 0, 7); g.fill();
    lines.forEach((ln, i) => txt(ln, bx * u, by * u + (i - (lines.length - 1) / 2) * 46 * u + 3 * u, { size: 40 * u, fam: F.comic, weight: 400, color: "#000" })); g.restore(); },
  panel(i, t) { const [x, y, w, h, im, ax, bubs, sfx, nar] = P[i], t0 = i * PS; x * 1; const X = x * u, Y = y * u, Wd = w * u, Hd = h * u;
    g.fillStyle = "#fff"; g.fillRect(X, Y, Wd, Hd); g.save(); g.beginPath(); g.rect(X, Y, Wd, Hd); g.clip();
    if (im === "grid") { GRID.forEach((k, j) => { const gw = Wd / 6; g.filter = "contrast(1.25) saturate(1.4)"; cover(IM[k], X + j * gw, Y, gw, Hd); g.filter = "none"; g.strokeStyle = "#000"; g.lineWidth = 4 * u; g.strokeRect(X + j * gw, Y, gw, Hd); }); }
    else if (im === "end") { g.fillStyle = "#FFD43B"; g.fillRect(X, Y, Wd, Hd); txt("“…HOW?!”  —  “AI & ADVERTISING.”", X + Wd / 2, Y + Hd / 2 + 4 * u, { size: 52 * u, fam: F.comic, weight: 400, color: "#000" }); }
    else { g.filter = "contrast(1.35) saturate(1.5) brightness(1.05)"; cover(SRC(im, t, 0), X, Y, Wd, Hd, 1.1, ax, 0.18); g.filter = "none"; }
    g.fillStyle = this.dots; g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.5; g.fillRect(X, Y, Wd, Hd); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.restore();
    g.strokeStyle = "#000"; g.lineWidth = 8 * u; g.strokeRect(X, Y, Wd, Hd);
    const ba = oC(prog(t, t0 + 0.35, t0 + 0.6)); bubs.forEach(([s, bx, by, tail]) => this.bubble(s, bx, by, tail, t < 0 ? 1 : ba));
    if (nar) { const na = t < 0 ? 1 : oC(prog(t, t0 + 0.1, t0 + 0.35)); g.save(); g.globalAlpha = na; font(30 * u, 400, F.comic); const nw = tw(nar) + 40 * u; g.fillStyle = "#FFD43B"; g.fillRect(X + 16 * u, Y + Hd - 70 * u, nw, 54 * u); g.strokeStyle = "#000"; g.lineWidth = 4 * u; g.strokeRect(X + 16 * u, Y + Hd - 70 * u, nw, 54 * u);
      txt(nar, X + 36 * u, Y + Hd - 41 * u, { size: 30 * u, fam: F.comic, weight: 400, color: "#000", align: "left" }); g.restore(); }
    if (sfx) { const sp = t < 0 ? 1 : oB(clamp((t - t0 - 0.4) / 0.3)); g.save(); g.translate(X + Wd * 0.62, Y + Hd * 0.42); g.rotate(-0.15); g.scale(sp, sp);
      txt(sfx, 0, 0, { size: (sfx.length > 6 ? 150 : 110) * u, fam: F.comic, weight: 400, color: "#e5383b", stroke: "#000", strokeW: 14 * u }); txt(sfx, 0, 0, { size: (sfx.length > 6 ? 150 : 110) * u, fam: F.comic, weight: 400, color: "#FFD43B" }); g.restore(); }
  },
  page(t, upto) { bg("#f2ead8"); for (let i = 0; i <= upto; i++) this.panel(i, t); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#FFD43B", fg: C.ink, titleFam: F.comic, titleWeight: 400, titleSize: 120, title: "AI & ADVERTISING", button: { fill: "#e5383b", color: "#fff", shadow: C.ink }, cta: "Be the hero  →" }); return; }
    const k = Math.min(4, Math.floor(t / PS));
    // camera: frame panel k, glide from k-1
    const rect = (i) => { const [x, y, w, h] = P[i]; const s = Math.min(W / ((w + 60) * u), H / ((h + 60) * u)); return { s, cx: (x + w / 2) * u, cy: (y + h / 2) * u }; };
    let cam; if (t >= T_PULL) { const p = ioC(prog(t, T_PULL, T_PULL + 0.9)), a = rect(4); cam = { s: lerp(a.s, 1, p), cx: lerp(a.cx, CX, p), cy: lerp(a.cy, H / 2, p) }; }
    else { const a = rect(Math.max(0, k - 1)), b = rect(k), p = k ? ioC(prog(t, k * PS, k * PS + 0.5)) : 1; cam = { s: lerp(a.s, b.s, p), cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p) }; }
    bg("#f2ead8"); g.save(); g.translate(CX, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.cx, -cam.cy); this.page(t, t >= T_PULL ? 5 : k); g.restore();
    grain(t, 0.03);
  },
};
