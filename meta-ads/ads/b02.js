// B02 · "Pause anywhere." (English, 4:5 feed, music only). AI stills held long enough to inspect; a magnifier
// lands on the hardest details (metal, nails, fur, thread). Captions: white Instrument Serif, top, one line each.
const SH = [  // [src, caption, fx, fy, ax, ay]
  ["i22", "Pause anywhere.", 0.80, 0.40, 0.5, 0.4], ["i18", "Zoom in.", 0.50, 0.59, 0.5, 0.5], ["i32", "Still sharp.", 0.40, 0.72, 0.5, 0.5],
  ["i21", "Every thread.", 0.50, 0.52, 0.5, 0.5], ["i00", "Every fold.", 0.42, 0.62, 0.5, 0.5],
];
const S0 = 2.5, T_FIN = SH.length * S0, T_END = T_FIN + 2.4;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "pause-anywhere",
  images: { i22: "assets/img/site/i22.jpg", i18: "assets/img/site/i18.jpg", i21: "assets/img/site/i21.jpg", i00: "assets/img/site/i00.jpg", i32: "assets/img/site/i32.jpg" },
  music: { file: "build/music_el/ethereal.mp3", offset: 6, gain: -6, fadeOut: 1.2 },
  sfx: [...SH.map((_, i) => ["focus", i * S0 + 0.7, -14]), ["shimmer", T_FIN, -16], ["whoosh", T_END - 0.15, -14]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d0c0b", fg: "#fff", titleStyle: "italic", cta: "Learn the craft  →" }); grain(t, 0.05); return; }
    bg("#000");
    if (t < T_FIN) {
      const k = Math.floor(t / S0), t0 = k * S0, [src, cap, fx, fy, ax, ay] = SH[k], im = SRC(src, t, t0);
      const z = lerp(1.0, 1.04, prog(t, t0, t0 + S0));
      g.save(); g.globalAlpha = k ? oC(prog(t, t0, t0 + 0.3)) : 1; cover(im, 0, 0, W, H, z, ax, ay); g.restore();
      // magnifier in place over the detail
      const lp = oB(clamp((t - t0 - 0.7) / 0.35)), lout = 1 - prog(t, t0 + S0 - 0.25, t0 + S0);
      if (lp > 0 && lout > 0) {
        const s = Math.max(W / im.width, H / im.height) * z, iw = im.width * s, ih = im.height * s, ix = (W - iw) * ax, iy = (H - ih) * ay;
        const cx = ix + fx * iw, cy = iy + fy * ih, r = 210 * u * lp * lout;
        g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); const Z = 3.2; g.drawImage(im, cx - (cx - ix) * Z, cy - (cy - iy) * Z, iw * Z, ih * Z); g.restore();
        g.save(); g.strokeStyle = "#fff"; g.lineWidth = 5 * u; g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 30 * u; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.restore();
        const ly = cy + r + 40 * u < H - 60 * u ? cy + r + 40 * u : cy - r - 40 * u;
        g.save(); g.globalAlpha = lp * lout; g.fillStyle = "rgba(10,10,10,0.75)"; rr(cx - 80 * u, ly - 24 * u, 160 * u, 48 * u, 24 * u); g.fill();
        txt("320%", cx, ly + 1 * u, { size: 26 * u, fam: F.mono, weight: 700, color: "#fff" }); g.restore();
      }
      shade(0, H * 0.3, 0.6, true);
      const a = Math.min(oC(prog(t, t0 + 0.1, t0 + 0.45)), 1 - prog(t, t0 + S0 - 0.2, t0 + S0));
      capText(cap, 150 * u, a, prog(t, t0 + 0.1, t0 + 0.6), { size: 96 * u, fam: F.serif, weight: 400, shadow: 16, shadowColor: "rgba(0,0,0,0.5)", rise: 0.15 });
      txt(`0${k + 1} / 0${SH.length}`, W - 60 * u, H - 60 * u, { size: 24 * u, fam: F.mono, color: "#fff", alpha: 0.75, align: "right" });
      txt("AI-GENERATED  ·  PAUSE & ZOOM", 60 * u, H - 60 * u, { size: 24 * u, fam: F.mono, color: "#fff", alpha: 0.75, align: "left", ls: 2 });
    } else {   // finale: the five frames as a contact strip, then the line
      const p = oC(prog(t, T_FIN, T_FIN + 0.6));
      const tw5 = W / 5;
      SH.forEach((s, i) => { const im = SRC(s[0], T_FIN, 0); g.save(); g.beginPath(); g.rect(i * tw5 + 3 * u, H * 0.18 + (1 - p) * (i % 2 ? 60 : -60) * u, tw5 - 6 * u, H * 0.5); g.clip(); cover(im, i * tw5, H * 0.18 + (1 - p) * (i % 2 ? 60 : -60) * u, tw5, H * 0.5, 1, s[2], 0.5); g.restore(); });
      capText("This is AI imagery,\ndone right.", H * 0.82, p, prog(t, T_FIN + 0.3, T_FIN + 1.0), { size: 88 * u, fam: F.serif, weight: 400, stagger: true, rise: 0.15 });
    }
    grain(t, 0.05);
  },
};
