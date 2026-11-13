// A19 · "Who it's for" (English VO Jessica, 9:16). Pastel persona trading cards (site colours) deal in one per
// persona, then fan out into a hand. Captions: big ink Space Grotesk, word-by-word.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const CARDS = [
  ["D2C founders", "Launch, festive and sale ads without an agency.", C.lime, "i35", [0, 0]], ["Marketers", "Feed Meta the fresh creative it needs, every week.", C.pink, "i39", [0, 1]],
  ["Designers", "Add photo and video production to your skills.", C.sky, "i22", [0, 2]], ["Freelancers", "Offer shoots, films and ad sets to clients.", C.lav, "i13", [1, 0]],
  ["Creators", "Pitch brands with campaign-level work.", C.yellow, "i21", [1, 1]], ["Students", "Build a portfolio that gets you hired.", "#ffffff", "i19", [1, 2]],
];
const T_FAN = Wd(2, 0), T_PRICE = Wd(3, 0), T_END = L[3].v1 + 0.5;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "who-its-for",
  images: Object.fromEntries(CARDS.map((c) => [c[3], `assets/img/site/${c[3]}.jpg`])),
  music: { file: "build/music/33.mp3", offset: 2, gain: -10, duck: -7, fadeOut: 0.8 },
  sfx: [...CARDS.map((c) => ["pageflip", Wd(c[4][0], c[4][1]) - 0.05, -10]), ["whoosh", T_FAN, -10], ["coin", T_PRICE + 0.6, -10], ["whoosh", T_END - 0.1, -12]],
  card(c, x, y, w, h, r, s, t) {
    const [title, line, col, im] = c; g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s);
    g.fillStyle = C.ink; rr(-w / 2 + 10 * u, -h / 2 + 10 * u, w, h, 28 * u); g.fill();
    g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 4 * u; rr(-w / 2, -h / 2, w, h, 28 * u); g.fill(); g.stroke();
    const ih = h * 0.52; g.save(); rr(-w / 2 + 26 * u, -h / 2 + 26 * u, w - 52 * u, ih, 18 * u); g.clip(); cover(IM[im], -w / 2 + 26 * u, -h / 2 + 26 * u, w - 52 * u, ih, 1.08); g.restore();
    g.strokeStyle = C.ink; g.lineWidth = 3 * u; rr(-w / 2 + 26 * u, -h / 2 + 26 * u, w - 52 * u, ih, 18 * u); g.stroke();
    txt(title, -w / 2 + 34 * u, -h / 2 + ih + 90 * u, { size: fitSize(title, w - 70 * u, 66 * u, 700, F.grot), weight: 700, fam: F.grot, color: C.ink, align: "left" });
    font(30 * u, 500, F.inter); wrap(line, w - 70 * u).forEach((ln, i) => txt(ln, -w / 2 + 34 * u, -h / 2 + ih + 150 * u + i * 40 * u, { size: 30 * u, weight: 500, color: "#2a2a2a", align: "left" }));
    txt("AI & ADVERTISING", -w / 2 + 34 * u, h / 2 - 40 * u, { size: 20 * u, fam: F.mono, weight: 700, color: C.ink, align: "left" });
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", cta: "Pick your card  →" }); grain(t, 0.04); return; }
    gridBg();
    const w = 600 * u, h = 860 * u, fan = ioC(prog(t, T_FAN, T_FAN + 0.6));
    CARDS.forEach((c, i) => {
      const st = Wd(c[4][0], c[4][1]) - 0.05; if (t < st) return;
      const p = oX(clamp((t - st) / 0.35)), x0 = CX + (1 - p) * W * 0.9, r0 = (i % 2 ? 0.05 : -0.05) + (1 - p) * 0.4;
      const fa = (i - 2.5) * 0.17, fx = CX + Math.sin(fa) * 760 * u, fy = 1260 * u - Math.cos(fa) * 420 * u;
      const x = lerp(x0, fx, fan), y = lerp(820 * u, fy, fan), r = lerp(r0, fa, fan), s = lerp(1, 0.62, fan);
      this.card(c, x, y, w, h, r, s, t);
    });
    if (t >= T_PRICE) { const p = oB(clamp((t - T_PRICE - 0.5) / 0.35)); g.save(); g.translate(CX, 330 * u); g.scale(p, p); g.fillStyle = C.ink; rr(-260 * u, -70 * u, 520 * u, 140 * u, 70 * u); g.fill();
      txt("$29  ·  was $99", 0, 4 * u, { size: 56 * u, weight: 800, color: C.lime }); g.restore(); }
    capClean(t, voChunk(t, 4, 0.5), t < T_FAN ? 1520 * u : 1600 * u, { size: 76 * u, fam: F.grot, weight: 700, color: C.ink });
    grain(t, 0.04);
  },
};
