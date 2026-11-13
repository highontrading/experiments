// A09 · "Your AI ad stack" (Hinglish VO Jeet, 9:16). Twelve tool tiles, lines from tools to the ad each one makes,
// then the tiles stack into one tower with "free tier" tags. Captions: highlighter boxes (lime / pink) on the site's cream grid.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_Q = Wd(1, 0), T_STACK = Wd(2, 0), T_FREE = Wd(3, 0), T_END = L[3].v1 + 0.6;
const TOOLS = [["ChatGPT", "#141414", "openai", "#fff"], ["Claude", "#D97757", "claude", "#fff"], ["Gemini", "#fff", "googlegemini", "#4C8DF6"],
  ["Nano Banana", C.yellow, null, C.ink], ["Midjourney", C.lav, null, C.ink], ["Veo", C.lime, null, C.ink], ["Kling", C.pink, null, C.ink],
  ["Runway", C.sky, null, C.ink], ["ElevenLabs", "#141414", "elevenlabs", "#fff"], ["Suno", "#fff", "suno", C.ink], ["CapCut", "#fff", null, C.ink], ["Meta Ads", "#0866FF", "meta", "#fff"]];
const OUTS = [  // [label, tool indices, kind]
  ["Product shot", [3, 4], "img"], ["Video ad", [5, 6, 7], "car"], ["Voice + music", [8, 9], "wave"], ["UGC ad", [5, 10], "ugc"]];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "ai-ad-stack_hinglish",
  images: { shot: "assets/img/site/i31.jpg", openai: "assets/logos/openai.svg", claude: "assets/logos/claude.svg", googlegemini: "assets/logos/googlegemini.svg",
            elevenlabs: "assets/logos/elevenlabs.svg", suno: "assets/logos/suno.svg", meta: "assets/logos/meta.svg" },
  seqs: ["car", "ugc"],
  music: { file: "build/music/126.mp3", offset: 3, gain: -11, duck: -7, fadeOut: 0.8 },
  sfx: [...TOOLS.map((_, i) => ["pop", 0.35 + i * 0.09, -15]), ...OUTS.map((_, i) => ["tick", Wd(1, 1 + i) , -10]), ["whoosh", T_STACK, -8], ["stamp", T_FREE, -8], ["coin", T_FREE + 0.3, -10], ["whoosh", T_END - 0.1, -12]],
  init() { this.G = {}; },
  glyph(name, col) { const k = name + col; if (!this.G[k]) { const c = document.createElement("canvas"); c.width = c.height = 200; const x = c.getContext("2d"); x.drawImage(IM[name], 0, 0, 200, 200); x.globalCompositeOperation = "source-in"; x.fillStyle = col; x.fillRect(0, 0, 200, 200); this.G[k] = c; } return this.G[k]; },
  tile(i, x, y, s) {
    const [lab, bgc, svg, fg] = TOOLS[i], r = s * 0.2;
    g.fillStyle = C.lav; rr(x - s / 2 + 6 * u, y - s / 2 + 6 * u, s, s, r); g.fill();
    g.fillStyle = bgc; g.strokeStyle = C.ink; g.lineWidth = 3 * u; rr(x - s / 2, y - s / 2, s, s, r); g.fill(); g.stroke();
    if (svg) { const gs = s * 0.46; g.drawImage(this.glyph(svg, fg), x - gs / 2, y - gs / 2 - s * 0.08, gs, gs); txt(lab, x, y + s * 0.33, { size: s * 0.12, fam: F.mono, weight: 700, color: fg }); }
    else { const fs = fitSize(lab, s * 0.82, s * 0.2, 800, F.inter); txt(lab, x, y, { size: fs, weight: 800, color: fg }); }
  },
  pos(i) { const c = i % 3, r = Math.floor(i / 3); return [CX + (c - 1) * 300 * u, 380 * u + r * 250 * u]; },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a" }); grain(t, 0.04); return; }
    gridBg();
    const stackP = ioC(prog(t, T_STACK, T_STACK + 0.7));
    TOOLS.forEach((_, i) => {
      const st = 0.35 + i * 0.09; if (t < st) return; const p = oB(clamp((t - st) / 0.3));
      let [x, y] = this.pos(i);
      if (t >= T_Q && t < T_STACK) { const used = OUTS.some((o, k) => t >= Wd(1, 1 + k) && o[1].includes(i)); x -= 170 * u; if (!used && t > Wd(1, 1)) g.globalAlpha = 0.45; }
      // stack: tiles collapse into a tower at the centre
      const sx = CX, sy = 380 * u + i * 62 * u; x = lerp(x, sx, stackP); y = lerp(y, sy, stackP);
      const s = lerp(190, 150, stackP) * u * p;
      this.tile(i, x, y, s); g.globalAlpha = 1;
      if (t >= T_FREE && i % 2 === 0) { const fp = oB(clamp((t - T_FREE - i * 0.03) / 0.25)); g.save(); g.translate(x + 140 * u, y); g.rotate(-0.08); g.scale(fp, fp);
        g.fillStyle = C.lime; g.strokeStyle = C.ink; g.lineWidth = 2.5 * u; rr(-70 * u, -24 * u, 140 * u, 48 * u, 24 * u); g.fill(); g.stroke(); txt("free tier", 0, 2 * u, { size: 22 * u, fam: F.mono, weight: 700, color: C.ink }); g.restore(); }
    });
    // tool -> ad output connections
    if (t >= T_Q && t < T_STACK + 0.2) {
      g.save(); g.globalAlpha = 1 - prog(t, T_STACK - 0.1, T_STACK + 0.2);
      OUTS.forEach(([lab, idx, kind], k) => {
        const st = Wd(1, 1 + k); if (t < st) return; const p = oC(clamp((t - st) / 0.3)), ox = W - 200 * u, oy = 420 * u + k * 270 * u, ow = 300 * u, oh = 220 * u;
        idx.forEach((i) => { const [x, y] = this.pos(i); g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.setLineDash([10 * u, 8 * u]); g.beginPath(); g.moveTo(x - 170 * u + 95 * u, y); g.bezierCurveTo(x + 200 * u, y, ox - 260 * u, oy, lerp(x, ox - ow / 2, p), lerp(y, oy, p)); g.stroke(); g.setLineDash([]); });
        g.save(); g.translate(ox, oy); g.scale(p, p); g.fillStyle = C.lav; g.fillRect(-ow / 2 + 7 * u, -oh / 2 + 7 * u, ow, oh); g.beginPath(); g.rect(-ow / 2, -oh / 2, ow, oh); g.save(); g.clip();
        if (kind === "img") cover(IM.shot, -ow / 2, -oh / 2, ow, oh); else if (kind === "car" || kind === "ugc") cover(seq(kind, t, st), -ow / 2, -oh / 2, ow, oh);
        else { g.fillStyle = C.ink; g.fillRect(-ow / 2, -oh / 2, ow, oh); g.fillStyle = C.lime; for (let b = 0; b < 24; b++) { const bh = (0.2 + 0.8 * Math.abs(Math.sin(b * 1.7 + t * 9))) * oh * 0.6; g.fillRect(-ow / 2 + 20 * u + b * 11 * u, -bh / 2, 6 * u, bh); } }
        g.restore(); g.strokeStyle = C.ink; g.lineWidth = 3 * u; g.strokeRect(-ow / 2, -oh / 2, ow, oh);
        txt(lab, 0, oh / 2 + 30 * u, { size: 26 * u, fam: F.mono, weight: 700, color: C.ink }); g.restore();
      });
      g.restore();
    }
    if (t >= T_STACK + 0.5) txt("YOUR AI AD STACK", CX, 300 * u, { size: 34 * u, fam: F.mono, weight: 700, color: C.ink, alpha: oC(prog(t, T_STACK + 0.5, T_STACK + 0.9)) });
    capHighlight(t, voChunk(t, 3, 0.5), H * 0.74, { size: 64 * u });
    grain(t, 0.04);
  },
};
