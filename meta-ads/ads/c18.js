// C18 · "Shoot nahi, prompt karo!" (Hinglish jingle with vocals, made with ElevenLabs music, 9:16). A karaoke lyric
// video: each sung line sits big in the centre, words fill yellow as they're sung, a ball bounces word to word,
// AI visuals change behind every line. Captions: karaoke lyrics in Archivo Black, white → yellow fill.
const LY = [  // [line, [[word, start]...], bg]
  ["Shoot nahi, prompt karo!", [3.5, 4.22, 5.02, 5.28], "beach"], ["Shoot nahi, prompt karo!", [6.08, 6.24, 7.04, 7.32], "i35"],
  ["Ek photo se poora campaign", [8.14, 8.34, 8.74, 9.02, 9.46], "cafe"], ["Studio ka kya kaam?", [10.18, 10.48, 10.9, 11.1], "i38"],
  ["Light, lens aur thoda sa taste", [11.9, 12.4, 12.88, 13.12, 13.4, 13.66], "i22"], ["Ad ready, subah-shaam", [13.92, 14.14, 14.96], "ugc"],
  ["AI & Advertising", [16.02, 16.72, 17.3], "i00"], ["Seekho Ideabro ke saath", [18.34, 18.72, 19.48, 19.66], "tree"],
  ["Shoot nahi, prompt karo", [20.28, 20.52, 21.32, 21.56], "i32"], ["Ab ad banana aapke haath!", [22.06, 22.3, 22.74, 23.3, 23.8], "i12"],
];
const LEND = (i) => (i + 1 < LY.length ? LY[i + 1][1][0] - 0.05 : 24.9), T_END = 25.6, Y = "#FFD43B", COLS = ["#ff4f7b", "#7c4dff", "#00b894", "#ff9f1c"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "shoot-nahi-prompt-karo_jingle",
  images: Object.fromEntries(["i35", "i38", "i22", "i00", "i32", "i12"].map((k) => [k, `assets/img/site/${k}.jpg`])),
  seqs: ["beach", "cafe", "ugc", "tree"],
  music: { file: "build/music_el/jingle.mp3", offset: 0, gain: -4, fadeOut: 1.5 },
  sfx: [],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#1a0b2e", fg: "#fff", button: { fill: Y, shadow: "#ff4f7b" }, cta: "Prompt karo  →" }); grain(t, 0.03); return; }
    let k = -1; LY.forEach((l, i) => { if (t >= l[1][0] - 0.25) k = i; });
    bg("#1a0b2e");
    if (k < 0) { // intro: title + bouncing equaliser
      const p = oB(clamp((t - 0.3) / 0.5)); g.save(); g.translate(CX, CY - 100 * u); g.scale(p, p); txt("♪ THE AI & ADVERTISING", 0, -60 * u, { size: 52 * u, fam: F.archivo, weight: 400, color: Y }); txt("JINGLE", 0, 60 * u, { size: 160 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore();
      for (let i = 0; i < 18; i++) { const h = (40 + 120 * Math.abs(Math.sin(t * 6 + i * 0.7))) * u; g.fillStyle = COLS[i % 4]; rr(CX - 18 * 26 * u + i * 52 * u, CY + 200 * u - h / 2, 36 * u, h, 18 * u); g.fill(); }
    } else {
      const [line, ws, src] = LY[k], t0 = ws[0] - 0.25;
      g.save(); g.globalAlpha = oC(prog(t, t0, t0 + 0.25)); kb(SRC(src, t, t0), t, t0, LEND(k) - t0, 1.04, 1.12, src === "ugc" ? 0.6 : 0.5, 0.4); g.restore();
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(26,11,46,0.55)"); gr.addColorStop(0.45, "rgba(26,11,46,0.25)"); gr.addColorStop(1, "rgba(26,11,46,0.85)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // lyric with karaoke fill
      const words = line.split(" "), size = Math.min(110 * u, fitSize(line, W * 1.6, 110 * u, 400, F.archivo)); font(size, 400, F.archivo); const sp = size * 0.3;
      const rows = [[]]; let rw = 0; words.forEach((w, i) => { const ww = tw(w); if (rw + ww > W * 0.86 && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(i); rw += ww + sp; });
      const ly = H * 0.62, lh = size * 1.2; let ballX = null, ballY = null;
      rows.forEach((row, ri) => { const tot = row.reduce((a, i) => a + tw(words[i]), 0) + sp * (row.length - 1); let x = CX - tot / 2; const y = ly + (ri - (rows.length - 1) / 2) * lh;
        row.forEach((i) => { const w = words[i], ww = tw(w), s0 = ws[i] ?? ws[ws.length - 1], s1 = ws[i + 1] ?? (s0 + 0.5), f = clamp((t - s0) / Math.max(0.15, s1 - s0));
          txt(w, x + ww / 2, y, { size, fam: F.archivo, weight: 400, color: "#fff", stroke: "rgba(26,11,46,0.9)", strokeW: 12 * u });
          if (f > 0) { g.save(); g.beginPath(); g.rect(x - 4 * u, y - size, (ww + 8 * u) * f, size * 2); g.clip(); txt(w, x + ww / 2, y, { size, fam: F.archivo, weight: 400, color: Y, stroke: "rgba(26,11,46,0.9)", strokeW: 12 * u }); g.restore(); }
          if (t >= s0 - 0.05 && t < s1) { ballX = x + ww / 2; ballY = y - size * 0.75 - Math.abs(Math.sin((t - s0) / Math.max(0.15, s1 - s0) * Math.PI)) * 40 * u; }
          font(size, 400, F.archivo); x += ww + sp; }); font(size, 400, F.archivo); });
      if (ballX !== null) { g.fillStyle = "#ff4f7b"; g.beginPath(); g.arc(ballX, ballY, 18 * u, 0, 7); g.fill(); }
      // next line preview
      if (k + 1 < LY.length) txt(LY[k + 1][0], CX, ly + rows.length * lh / 2 + 120 * u, { size: 44 * u, fam: F.archivo, weight: 400, color: "#fff", alpha: 0.45 });
      txt("♪ NOW PLAYING · SHOOT NAHI, PROMPT KARO", CX, 280 * u, { size: 28 * u, fam: F.mono, weight: 700, color: "#fff", alpha: 0.8, ls: 2 });
      txt("VISUALS MADE WITH AI", CX, 330 * u, { size: 22 * u, fam: F.mono, weight: 700, color: Y, alpha: 0.8, ls: 3 });
    }
    grain(t, 0.03);
  },
};
