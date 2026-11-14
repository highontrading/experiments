// B18 · "AI can't do hands, right?" (English VO Sarah, 4:5 feed). AI hand close-ups; a magnifier lands on rings,
// nails, knuckles and light as each word is spoken. Captions: white Inter Black, black outline, word-by-word, low.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const LP = [[Wd(2, 0), "i18", 0.49, 0.30], [Wd(2, 1), "i18", 0.16, 0.21], [Wd(2, 2), "i22", 0.66, 0.50], [Wd(2, 3), "i22", 0.80, 0.39]];
const T_LAST = L[3].at, T_OUT = L[4].at, T_END = L[4].v1 + 0.8;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "ai-cant-do-hands",
  images: { i18: "assets/img/site/i18.jpg", i22: "assets/img/site/i22.jpg", i00: "assets/img/site/i00.jpg" },
  music: { file: "build/music_el/ethereal.mp3", offset: 14, gain: -8, duck: -6, fadeOut: 1.0 },
  sfx: [...LP.map((l) => ["focus", l[0] - 0.05, -12]), ["shimmer", T_LAST, -14], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d0c0b", fg: "#fff", cta: "Learn it properly  →" }); grain(t, 0.04); return; }
    bg("#000");
    if (t < LP[0][0] - 0.05) { const z = t < L[1].at ? lerp(1.0, 1.05, prog(t, 0, L[1].at)) : lerp(1.05, 1.5, ioC(prog(t, L[1].at, L[1].at + 1.0)));
      cover(IM.i18, 0, 0, W, H, z, t < L[1].at ? 0.5 : 0.15, t < L[1].at ? 0.5 : 0.3); }
    else if (t < T_LAST) {
      const k = LP.reduce((a, l, i) => (t >= l[0] - 0.05 ? i : a), 0), [t0, im, fx, fy] = LP[k];
      cover(IM[im], 0, 0, W, H, 1.0); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, W, H);
      const s = Math.max(W / IM[im].width, H / IM[im].height), iw = IM[im].width * s, ih = IM[im].height * s, ix = (W - iw) / 2, iy = (H - ih) / 2, cx = ix + fx * iw, cy = iy + fy * ih;
      const p = oB(clamp((t - t0 + 0.05) / 0.3)), r = 230 * u * p; g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); const Z = 2.8; g.drawImage(IM[im], cx - (cx - ix) * Z, cy - (cy - iy) * Z, iw * Z, ih * Z); g.restore();
      g.save(); g.strokeStyle = "#fff"; g.lineWidth = 6 * u; g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 30 * u; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.restore();
    } else if (t < T_OUT) kb(IM.i22, t, T_LAST, 2.2, 1.0, 1.06, 0.5, 0.4);
    else kb(IM.i00, t, T_OUT, 2.4, 1.02, 1.08, 0.5, 0.35);
    shade(H * 0.62, H, 0.65);
    txt("AI-GENERATED", 60 * u, 70 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", alpha: 0.8, ls: 3, shadow: 8 });
    capPop(t, voChunk(t, 3, 0.5), H * 0.85, { size: 84 * u, weight: 900, upper: false, hi: "#fff", color: "#fff", stroke: "#000", strokeW: 12, bounce: 0.8 });
    grain(t, 0.04);
  },
};
