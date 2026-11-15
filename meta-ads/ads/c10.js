// C10 · "Made, not shot" — the exhibition (English, 4:5 feed, music only). A slow camera glide along a gallery wall:
// AI ad work hung as framed art under spotlights, each with a museum placard.
// Captions: museum wall text — Cormorant Garamond italic titles, Inter small-caps details.
const ART = [["i35", "Walk in the Sun", "Footwear campaign, hero frame"], ["i22", "Gold, Morning", "Jewellery close-up"], ["i00", "The Green Dupatta", "Festive lookbook"],
  ["i38", "Monday, Orange", "Beverage launch set"], ["i19", "Blue Hour, Linen", "Menswear editorial"]];
const T_IN = 2.2, AS = 2.2, T_OUT = T_IN + ART.length * AS, T_END = T_OUT + 2.6, SP = 1180;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "made-not-shot-exhibition",
  images: Object.fromEntries(ART.map((a) => [a[0], `assets/img/site/${a[0]}.jpg`])),
  music: { file: "build/music_el/classical.mp3", offset: 0, gain: -8, fadeOut: 1.2 },
  sfx: [["shimmer", 0.2, -18], ["whoosh", T_OUT, -16], ["whoosh", T_END - 0.1, -14]],
  wall(off) {
    bg("#ebe5da"); g.fillStyle = "#d9d1c3"; g.fillRect(0, H * 0.82, W, H * 0.18); g.fillStyle = "#c9c0b0"; g.fillRect(0, H * 0.82, W, 6 * u);
    g.fillStyle = "rgba(0,0,0,0.06)"; for (let x = -((off) % 300) * u; x < W; x += 300 * u) g.fillRect(x, H * 0.82, 2 * u, H * 0.18);
  },
  frame(im, x, y, w, h) {
    const sg = g.createRadialGradient(x + w / 2, y - 80 * u, 20 * u, x + w / 2, y + h / 2, h * 0.9); sg.addColorStop(0, "rgba(255,244,220,0.55)"); sg.addColorStop(1, "rgba(255,244,220,0)"); g.fillStyle = sg; g.fillRect(x - w, y - 300 * u, w * 3, h + 600 * u);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 40 * u; g.shadowOffsetY = 20 * u; g.fillRect(x - 30 * u, y - 30 * u, w + 60 * u, h + 60 * u); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.fillStyle = "#1c1814"; g.fillRect(x - 30 * u, y - 30 * u, w + 60 * u, h + 60 * u); g.fillStyle = "#f7f3ec"; g.fillRect(x - 12 * u, y - 12 * u, w + 24 * u, h + 24 * u);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); cover(IM[im], x, y, w, h); g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#ebe5da", fg: C.ink, titleStyle: "italic", cta: "Build your portfolio  →" }); grain(t, 0.03); return; }
    const kk = clamp(Math.floor((t - T_IN) / AS), 0, ART.length - 1), pan = t < T_IN ? 0 : t < T_OUT ? (kk + ioC(clamp((t - T_IN - kk * AS) / 0.8))) * SP : ART.length * SP; const off = pan;
    this.wall(off);
    // title wall
    const tx = CX - off * u - SP * u * 0.0;
    if (pan < SP) { g.save(); g.translate(-pan * u, 0);
      txt("MADE, NOT SHOT.", CX, 500 * u, { size: 74 * u, fam: F.cinzel, weight: 700, color: C.ink, ls: 6, alpha: oC(prog(t, 0.2, 0.9)) });
      txt("An exhibition of AI advertising", CX, 590 * u, { size: 52 * u, fam: F.corm, weight: 500, style: "italic", color: "#4a3f33", alpha: oC(prog(t, 0.6, 1.2)) });
      txt("GALLERY 01  ·  AI & ADVERTISING  ·  IDEABRO STUDIO", CX, 680 * u, { size: 22 * u, weight: 600, color: "#6b6052", ls: 4, alpha: oC(prog(t, 0.9, 1.4)) }); g.restore(); }
    // artworks (positioned along the wall)
    ART.forEach(([im, title, med], i) => { const wx = CX + (i + 1) * SP * u - pan * u; if (wx < -600 * u || wx > W + 600 * u) return;
      const w = 560 * u, h = 700 * u, x = wx - w / 2 - 160 * u, y = 170 * u; this.frame(im, x, y, w, h);
      // placard to the right of the frame
      const px = x + w + 50 * u, py = y + h - 160 * u; g.fillStyle = "#fbf8f2"; g.shadowColor = "rgba(0,0,0,0.12)"; g.shadowBlur = 12 * u; g.fillRect(px, py, 320 * u, 190 * u); g.shadowBlur = 0;
      txt(title, px + 20 * u, py + 44 * u, { size: 34 * u, fam: F.corm, weight: 500, style: "italic", color: C.ink, align: "left" });
      txt("2026", px + 20 * u, py + 82 * u, { size: 22 * u, weight: 600, color: "#6b6052", align: "left" });
      txt(med, px + 20 * u, py + 116 * u, { size: 19 * u, weight: 500, color: "#6b6052", align: "left" });
      txt("Generative image,", px + 20 * u, py + 146 * u, { size: 19 * u, weight: 500, color: "#6b6052", align: "left" });
      txt("art-directed. No shoot.", px + 20 * u, py + 170 * u, { size: 19 * u, weight: 500, color: "#6b6052", align: "left" }); });
    // bottom wall text, consistent slot
    if (t >= T_IN && t < T_OUT) { const k = Math.floor((t - T_IN) / AS), t0 = T_IN + k * AS, a = Math.min(oC(prog(t, t0 + 0.6, t0 + 1.0)), 1 - prog(t, t0 + AS - 0.2, t0 + AS));
      txt(`No. ${k + 1} of ${ART.length}  ·  made with AI`, CX, H * 0.9, { size: 30 * u, weight: 600, color: "#4a3f33", alpha: a, ls: 2 }); }
    if (t >= T_OUT) { const p = oC(prog(t, T_OUT, T_OUT + 0.6)); g.fillStyle = `rgba(235,229,218,${0.85 * p})`; g.fillRect(0, 0, W, H);
      capText("The exhibition\nis your portfolio.", 560 * u, p, prog(t, T_OUT + 0.2, T_OUT + 1.0), { size: 96 * u, fam: F.corm, weight: 500, style: "italic", color: C.ink, stagger: true, lh: 1.1 });
      txt("Learn to make work like this.", CX, 800 * u, { size: 36 * u, weight: 600, color: "#4a3f33", alpha: oC(prog(t, T_OUT + 1.0, T_OUT + 1.4)) }); }
    grain(t, 0.03);
  },
};
