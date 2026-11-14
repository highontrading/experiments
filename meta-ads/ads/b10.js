// B10 · "₹2,999 mein kya milta hai?" (Hinglish VO Jeet, 9:16, shows price). A course box opens and the contents pop
// out as lime-numbered cards. Captions: ink Space Grotesk words on lime highlighter (the site look), centred low.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const ITEMS = [  // [t, big, label, image]
  [Wd(1, 0), "11", "MODULES", "i35"], [Wd(1, 2), "41", "LESSONS", "i00"], [Wd(2, 0), "∞", "PROMPT LIBRARY", "i18"], [Wd(2, 2), "✦", "READY TEMPLATES", "i41"],
  [Wd(3, 1), "★", "CAPSTONE CAMPAIGN", "i40"], [Wd(4, 1), "∞", "LIFETIME ACCESS", "i42"],
];
const T_OPEN = L[0].v1 - 0.2, T_END = L[4].v1 + 0.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "kya-milta-hai_hinglish",
  images: Object.fromEntries(ITEMS.map((i) => [i[3], `assets/img/site/${i[3]}.jpg`])),
  music: { file: "build/music_el/indian.mp3", offset: 4, gain: -12, duck: -6, fadeOut: 0.8 },
  sfx: [["boxopen", T_OPEN, -6], ...ITEMS.map((i) => ["pop", i[0], -10]), ["register", L[0].words[0].e, -12], ["whoosh", T_END - 0.1, -12]],
  card(it, x, y, w, h, s, r) {
    const [, big, lab, im] = it; g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s);
    g.fillStyle = C.ink; rr(-w / 2 + 8 * u, -h / 2 + 8 * u, w, h, 22 * u); g.fill(); g.fillStyle = "#fff"; g.strokeStyle = C.ink; g.lineWidth = 4 * u; rr(-w / 2, -h / 2, w, h, 22 * u); g.fill(); g.stroke();
    g.save(); rr(-w / 2 + 16 * u, -h / 2 + 16 * u, w - 32 * u, h * 0.5, 14 * u); g.clip(); cover(IM[im], -w / 2 + 16 * u, -h / 2 + 16 * u, w - 32 * u, h * 0.5); g.restore();
    g.fillStyle = C.lime; g.strokeStyle = C.ink; rr(-w / 2 + 16 * u, h * 0.06, 150 * u, 110 * u, 14 * u); g.fill(); g.stroke();
    txt(big, -w / 2 + 91 * u, h * 0.06 + 58 * u, { size: 72 * u, fam: F.grot, weight: 800, color: C.ink });
    font(40 * u, 700, F.grot); wrap(lab, w - 220 * u).forEach((ln, i) => txt(ln, -w / 2 + 190 * u, h * 0.06 + 40 * u + i * 44 * u, { size: 40 * u, fam: F.grot, weight: 700, color: C.ink, align: "left" }));
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", price: true, cta: "Abhi enroll karo  →" }); grain(t, 0.04); return; }
    gridBg();
    // price tag headline
    const hp = oB(clamp((t - 0.3) / 0.35)); g.save(); g.translate(CX, 260 * u); g.scale(hp, hp); g.fillStyle = C.ink; rr(-250 * u, -75 * u, 500 * u, 150 * u, 24 * u); g.fill();
    txt(PRICE, 0, 4 * u, { size: 104 * u, fam: F.grot, weight: 800, color: C.lime }); g.restore();
    // the box
    const bx = CX, by = 1000 * u + ioC(prog(t, ITEMS[2][0] + 0.3, ITEMS[2][0] + 0.8)) * 1000 * u, bw = 560 * u, bh = 300 * u, op = ioC(prog(t, T_OPEN, T_OPEN + 0.5));
    g.fillStyle = "#c9a26b"; g.strokeStyle = C.ink; g.lineWidth = 4 * u; g.fillRect(bx - bw / 2, by, bw, bh); g.strokeRect(bx - bw / 2, by, bw, bh);
    txt("AI & ADVERTISING", bx, by + bh / 2 - 20 * u, { size: 40 * u, fam: F.grot, weight: 800, color: C.ink }); txt("by Ideabro Studio · handle with taste", bx, by + bh / 2 + 30 * u, { size: 24 * u, fam: F.mono, color: C.ink });
    [-1, 1].forEach((sd) => { g.save(); g.translate(bx + sd * bw / 2, by); g.rotate(sd * (-0.1 - op * 2.1) * -1 * -1); g.fillStyle = "#b88d55"; g.fillRect(sd < 0 ? 0 : -bw / 2, -10 * u, bw / 2, 20 * u); g.strokeRect(sd < 0 ? 0 : -bw / 2, -10 * u, bw / 2, 20 * u); g.restore(); });
    // cards fly out of the box into a 2x3 grid
    const cw = 440 * u, ch = 300 * u;
    ITEMS.forEach((it, i) => { if (t < it[0] - 0.05) return; const p = oX(clamp((t - it[0] + 0.05) / 0.45)), c = i % 2, r = Math.floor(i / 2);
      const tx = CX + (c ? 1 : -1) * 240 * u, ty = 500 * u + r * 320 * u; this.card(it, lerp(bx, tx, p), lerp(1100 * u, ty, p), cw, ch, lerp(0.3, 1, p), (c ? 0.03 : -0.03) * p); });
    capHighlight(t, voChunk(t, 3, 0.5), H * 0.80, { size: 70 * u, fam: F.grot, weight: 700, cols: [C.lime] });
    grain(t, 0.04);
  },
};
