// B03 · "4 words that make AI shots look expensive" (English VO Charlie, 9:16). A lighting lesson in four numbered
// prompt words, each shown on footage that uses it. Captions: Bebas Neue, white with yellow numbers, always centred.
const L = window.TL.lines, Y = "#FFD43B";
const WORDS = [["01", "HAZE", "haze3", "soft atmospheric haze, god rays through the trees"], ["02", "BACKLIGHT", "back", "subject backlit by a low sun, glowing hair rim"],
  ["03", "GOLDEN HOUR", "gold2", "warm golden hour, long soft shadows"], ["04", "85MM", "i22", "85mm portrait lens, f/1.8, creamy background"]];
const T_END = L[5].v1 + 0.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "four-words-expensive",
  images: { i22: "assets/img/site/i22.jpg", i21: "assets/img/site/i21.jpg" },
  seqs: ["intro", "haze3", "back", "gold2"],
  music: { file: "build/music_el/luxhouse.mp3", offset: 0, gain: -11, duck: -6, fadeOut: 0.8 },
  sfx: [...[1, 2, 3, 4].map((i) => ["sub", L[i].at, -10]), ...[1, 2, 3, 4].map((i) => ["typewriter", L[i].words[1].s + 0.3, -20]), ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", titleFam: F.bebas, titleWeight: 400, titleSize: 140, title: "AI & ADVERTISING", button: { fill: Y, shadow: "#fff" }, cta: "Learn the light  →" }); grain(t, 0.05); return; }
    bg("#000");
    let k = -1; for (let i = 1; i <= 4; i++) if (t >= L[i].at - 0.05) k = i;
    if (t >= L[5].at - 0.05) k = 5;
    if (k === -1) { kb(seq("intro", t, 0), t, 0, L[1].at, 1.05, 1.15); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, W, H); }
    else if (k <= 4) {
      const [n, word, src, prompt] = WORDS[k - 1], t0 = L[k].at - 0.05;
      g.save(); g.globalAlpha = oC(prog(t, t0, t0 + 0.25)); kb(SRC(src, t, t0), t, t0, 3, 1.02, 1.1, 0.5, 0.4); g.restore();
      shade(H * 0.35, H, 0.75);
      const p = oC(prog(t, L[k].words[0].s, L[k].words[0].s + 0.3)), q = oB(clamp((t - L[k].words[1].s + 0.05) / 0.3));
      txt(n, CX, H * 0.47, { size: 150 * u, fam: F.bebas, weight: 400, color: Y, alpha: p });
      if (q > 0) { g.save(); g.translate(CX, H * 0.585); g.scale(q, q); txt(word, 0, 0, { size: fitSize(word, W * 0.86, 250 * u, 400, F.bebas), fam: F.bebas, weight: 400, color: "#fff" }); g.restore(); }
      // prompt chip: what you actually type
      const pt = L[k].words[1].s + 0.3; if (t >= pt) {
        g.save(); g.globalAlpha = oC(prog(t, pt, pt + 0.2)); g.fillStyle = "rgba(0,0,0,0.7)"; g.strokeStyle = "rgba(255,212,59,0.8)"; g.lineWidth = 2 * u;
        rr(90 * u, H * 0.665, W - 180 * u, 150 * u, 20 * u); g.fill(); g.stroke(); g.restore();
        txt("PROMPT", 125 * u, H * 0.665 + 36 * u, { size: 22 * u, fam: F.mono, weight: 700, color: Y, align: "left", alpha: oC(prog(t, pt, pt + 0.2)), ls: 3 });
        typeText(t, prompt, 125 * u, H * 0.665 + 82 * u, pt, 48, { size: 28 * u, fam: F.mono, color: "#fff", maxW: W - 260 * u, lh: 1.35, caretColor: Y });
      }
      txt("4 WORDS THAT MAKE AI SHOTS LOOK EXPENSIVE", CX, 250 * u, { size: 34 * u, fam: F.bebas, weight: 400, color: "#fff", alpha: 0.85, ls: 3 });
    } else {   // recap: four frames in a 2x2, then the line
      const t0 = L[5].at - 0.05, p = oC(prog(t, t0, t0 + 0.5)), gw = W / 2, gh = H * 0.3;
      WORDS.forEach(([n, word, src], i) => { const x = (i % 2) * gw, y = H * 0.12 + Math.floor(i / 2) * gh; g.save(); g.globalAlpha = clamp(p * 1.5 - i * 0.12); g.beginPath(); g.rect(x + 4 * u, y + 4 * u, gw - 8 * u, gh - 8 * u); g.clip(); cover(SRC(src, t, t0), x, y, gw, gh, 1.05); g.restore();
        txt(`${n}  ${word}`, x + 30 * u, y + gh - 40 * u, { size: 44 * u, fam: F.bebas, weight: 400, color: "#fff", align: "left", alpha: p, shadow: 10 }); });
    }
    if (k === -1 || k === 5) capClean(t, voChunk(t, 4, 0.5), k === 5 ? H * 0.80 : H * 0.6, { size: 118 * u, fam: F.bebas, weight: 400, color: "#fff", lh: 1.0 });
    grain(t, 0.05);
  },
};
