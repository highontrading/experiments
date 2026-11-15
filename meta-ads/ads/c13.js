// C13 · "Postcards" (Hinglish VO Anika, 9:16). Postcards land on a kraft-paper desk: "Santorini", "Dubai",
// "New York" — all made with AI — then the last one is from home, where the budget actually lives.
// Captions: Caveat handwriting in ink, written under each postcard (same slot every time).
const L = window.TL.lines;
const PC = [[0, "i35", "Greetings from “Santorini”", "SANTORINI", -0.06], [1, "dubai", "Greetings from “Dubai”", "DUBAI", 0.05], [2, "nyc", "Greetings from “New York”", "NEW YORK", -0.04], [3, "home", "Greetings from home", "HOME", 0.03]];
const T_ALL = L[4].at, T_END = L[4].v1 + 0.8, INK = "#1d2b5a";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "postcards_hinglish",
  images: { i35: "assets/img/site/i35.jpg" },
  seqs: ["dubai", "nyc", "home"],
  music: { file: "build/music_el/travel.mp3", offset: 0, gain: -11, duck: -6, fadeOut: 0.8 },
  sfx: [...PC.map((p) => ["swipe", L[p[0]].at - 0.1, -10]), ...PC.map((p) => ["stamp", L[p[0]].at + 0.5, -12]), ["shimmer", T_ALL, -12], ["whoosh", T_END - 0.1, -12]],
  card(p, x, y, r, s, t) {
    const [li, src, greet, city] = p, w = 860 * u, h = 640 * u; g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s);
    g.fillStyle = "#fbf7ee"; g.shadowColor = "rgba(0,0,0,0.3)"; g.shadowBlur = 30 * u; g.shadowOffsetY = 12 * u; g.fillRect(-w / 2, -h / 2, w, h); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.save(); g.beginPath(); g.rect(-w / 2 + 24 * u, -h / 2 + 24 * u, w - 48 * u, h - 48 * u); g.clip(); cover(SRC(src, t, L[li].at), -w / 2 + 24 * u, -h / 2 + 24 * u, w - 48 * u, h - 48 * u, 1.05, 0.5, src === "i35" ? 0.9 : 0.4); g.restore();
    // big retro city letters
    txt(city, 0, h / 2 - 90 * u, { size: fitSize(city, w - 120 * u, 130 * u, 400, F.archivo), fam: F.archivo, weight: 400, color: "#ffd43b", stroke: "#1d2b5a", strokeW: 10 * u });
    // stamp + postmark
    g.save(); g.translate(w / 2 - 110 * u, -h / 2 + 110 * u); g.rotate(0.06); g.fillStyle = "#fff"; g.fillRect(-70 * u, -85 * u, 140 * u, 170 * u); g.fillStyle = li === 3 ? "#e5383b" : "#2a9d8f"; g.fillRect(-58 * u, -73 * u, 116 * u, 146 * u);
    txt(li === 3 ? "₹" : "AI", 0, 4 * u, { size: 60 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore();
    g.save(); g.translate(w / 2 - 210 * u, -h / 2 + 150 * u); g.rotate(-0.2); g.strokeStyle = "rgba(29,43,90,0.7)"; g.lineWidth = 4 * u; g.beginPath(); g.arc(0, 0, 70 * u, 0, 7); g.stroke();
    txt(li === 3 ? "HOME" : "MADE WITH AI", 0, 0, { size: 18 * u, fam: F.mono, weight: 700, color: "rgba(29,43,90,0.8)" }); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(80 * u, -30 * u + k * 20 * u); g.bezierCurveTo(140 * u, -40 * u + k * 20 * u, 180 * u, -20 * u + k * 20 * u, 240 * u, -30 * u + k * 20 * u); g.stroke(); } g.restore();
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#d8c3a0", fg: C.ink, cta: "Ghar baithe seekho  →" }); grain(t, 0.05); return; }
    bg("#d8c3a0"); for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(90,60,30,${0.05 + rnd(k) * 0.06})`; g.fillRect(rnd(k + 1) * W, rnd(k + 2) * H, 3 * u, 3 * u); }
    if (t < T_ALL) {
      let k = 0; PC.forEach((p, i) => { if (t >= L[p[0]].at - 0.1) k = i; });
      for (let i = 0; i <= k; i++) { const p = PC[i], t0 = L[p[0]].at - 0.1, q = oX(clamp((t - t0) / 0.5)), off = (k - i) * 18 * u;
        this.card(p, CX + (1 - q) * W * (i % 2 ? 1 : -1) - off, 800 * u - off, p[4] + (1 - q) * 0.5, 1, t); }
      // handwritten caption, same slot
      const p = PC[k], t0 = L[p[0]].at, a = oC(prog(t, t0 + 0.2, t0 + 0.6));
      txt(p[2], CX, 1290 * u, { size: 76 * u, fam: F.hand, weight: 700, color: INK, alpha: a });
      const ch = voChunk(t, 6, 0.4); if (ch) txt(ch.filter((w) => t >= w.s - 0.05).map((w) => w.w).join(" "), CX, 1400 * u, { size: 64 * u, fam: F.hand, weight: 600, color: "#3a2a1a" });
    } else {
      PC.forEach((p, i) => { const q = ioC(prog(t, T_ALL, T_ALL + 0.6)); this.card(p, lerp(CX, CX + ((i % 2) - 0.5) * 420 * u, q), lerp(800 * u, 560 * u + Math.floor(i / 2) * 420 * u, q), p[4] * 1.5, lerp(1, 0.5, q), t); });
      txt("All made with AI. Except the last one.", CX, 1430 * u, { size: 64 * u, fam: F.hand, weight: 700, color: INK, alpha: oC(prog(t, T_ALL + 0.5, T_ALL + 0.9)) });
      const ch = voChunk(t, 6, 0.4); if (ch) txt(ch.filter((w) => t >= w.s - 0.05).map((w) => w.w).join(" "), CX, 1530 * u, { size: 58 * u, fam: F.hand, weight: 600, color: "#3a2a1a" });
    }
    grain(t, 0.05);
  },
};
