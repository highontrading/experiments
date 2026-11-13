// A03 · "One photo → a whole campaign" (English VO Steven, 9:16). Swiss grid on black, 1 → 20 counter,
// big stacked block captions (Anton) with a lime key word. Score: the trailer's own 90 BPM track.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_GRID = Wd(1, 0), T_CAT = Wd(2, 0), T_NO = Wd(3, 0), T_END = L[4].v1 + 0.45;
const STILLS = ["i31", "i32", "i33", "i34", "i36", "i37", "i39", "i40", "i38", "i00", "i12", "i19", "i21", "i24", "i30", "i18", "i22", "i11", "i06", "i13"];
const CATS = [  // word index in line 2 -> which cells light up
  { w: 0, label: "STUDIO", cells: [0, 2, 5, 8] }, { w: 2, label: "LIFESTYLE", cells: [1, 3, 6, 10, 11] },
  { w: 3, label: "MODELS", cells: [4, 9, 7] }, { w: 4, label: "MOTION", cells: [12, 13, 14, 15] },
];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "one-photo-whole-campaign",
  images: Object.fromEntries([["shoe", "assets/img/site/i35.jpg"], ...STILLS.map((s) => [s, `assets/img/site/${s}.jpg`])]),
  seqs: ["m1", "m2", "m3", "m4"],
  music: { file: "../ai-advertising-trailer/build/music/score_a.mp3", offset: 0.03, gain: -11, duck: -7, fadeOut: 0.6 },
  sfx: [["shutter", 0.35, -6], ...Array.from({ length: 16 }, (_, k) => ["pop", T_GRID + 0.1 + k * 0.08, -16]), ...CATS.map((c) => ["tick", Wd(2, c.w), -10]),
        ["boom", T_NO, -6], ["whoosh", T_END - 0.1, -10]],
  cell(k) {   // 4 x 4 grid inside the frame
    const gx = 60 * u, gy = 330 * u, gw = W - 120 * u, gh = 1060 * u, cw = gw / 4, ch = gh / 4;
    return [gx + (k % 4) * cw, gy + Math.floor(k / 4) * ch, cw, ch];
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", button: { fill: C.lime } }); grain(t, 0.06); return; }
    bg("#0b0b0b");
    // swiss guide lines
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 1.5 * u;
    for (let k = 0; k <= 4; k++) { const [x] = this.cell(k); g.beginPath(); g.moveTo(60 * u + k * (W - 120 * u) / 4, 0); g.lineTo(60 * u + k * (W - 120 * u) / 4, H); g.stroke(); }
    // counter
    const n = t < T_GRID ? 1 : Math.min(20, 1 + Math.floor((t - T_GRID) / 0.08));
    txt("INPUT", 60 * u, 170 * u, { size: 26 * u, fam: F.mono, color: "#8a8a8a", align: "left" });
    txt("1 PHOTO", 60 * u, 222 * u, { size: 54 * u, fam: F.anton, weight: 400, color: "#fff", align: "left" });
    if (t >= T_GRID) { txt("OUTPUT", W - 60 * u, 170 * u, { size: 26 * u, fam: F.mono, color: "#8a8a8a", align: "right" });
      txt(`${n} ADS`, W - 60 * u, 222 * u, { size: 54 * u, fam: F.anton, weight: 400, color: C.lime, align: "right" }); }
    const gp = t < T_NO ? 1 : 1 - oC(prog(t, T_NO, T_NO + 0.35));
    if (t < T_GRID) {   // the one photo, big
      const im = IM.shoe, w = 700 * u * (1 + 0.03 * prog(t, 0, T_GRID)), h = w * im.height / im.width, p = oC(prog(t, 0.2, 0.6));
      g.save(); g.globalAlpha = p; g.drawImage(im, CX - w / 2, 860 * u - h / 2, w, h); g.strokeStyle = "#fff"; g.lineWidth = 3 * u; g.strokeRect(CX - w / 2, 860 * u - h / 2, w, h); g.restore();
    } else if (gp > 0) {
      g.save(); g.globalAlpha = gp;
      let cat = null; for (const c of CATS) if (t >= Wd(2, c.w) - 0.03 && t < T_NO) cat = c;
      for (let k = 0; k < 16; k++) {
        const st = T_GRID + 0.1 + k * 0.08; if (t < st) continue;
        const [x, y, w, h] = this.cell(k), p = oB(clamp((t - st) / 0.22)), pad = 6 * u;
        g.save(); g.translate(x + w / 2, y + h / 2); g.scale(p, p);
        const dim = cat && !cat.cells.includes(k);
        g.beginPath(); g.rect(-w / 2 + pad, -h / 2 + pad, w - 2 * pad, h - 2 * pad); g.save(); g.clip();
        const motion = cat && cat.label === "MOTION" && cat.cells.includes(k);
        if (motion) cover(seq(["m1", "m2", "m3", "m4"][cat.cells.indexOf(k)], t, Wd(2, 4)), -w / 2, -h / 2, w, h);
        else cover(IM[k === 5 ? "shoe" : STILLS[k]], -w / 2, -h / 2, w, h, 1.05);
        if (dim) { g.fillStyle = "rgba(0,0,0,0.72)"; g.fillRect(-w / 2, -h / 2, w, h); }
        g.restore();
        if (cat && !dim) { g.strokeStyle = C.lime; g.lineWidth = 5 * u; g.strokeRect(-w / 2 + pad, -h / 2 + pad, w - 2 * pad, h - 2 * pad); }
        g.restore();
      }
      if (cat) txt(cat.label, CX, 1470 * u, { size: 34 * u, fam: F.mono, weight: 700, color: C.lime });
      g.restore();
    }
    // captions: block caps, lime key word
    const ch = voChunk(t, 4, 0.4);
    if (t < T_GRID) capBlock(t, ch, 1640 * u, { size: 130 * u, hiWord: "one" });
    else if (t < T_CAT) capBlock(t, ch, 1600 * u, { size: 120 * u, hiWord: "campaign" });
    else if (t < T_NO) { /* category labels carry this line */ }
    else capBlock(t, ch, CY, { size: 250 * u, hiWord: "AI" });
    grain(t, 0.06);
  },
};
