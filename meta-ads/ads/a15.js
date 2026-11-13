// A15 · "The prompt is the shoot" (English, 9:16, no VO). A dark terminal types a director's prompt (subject, light,
// lens, mood); the frame renders with a scanline reveal; variations follow. Captions: typed mono, green prompt.
const PROMPT = [["subject", "brown oxfords on a whitewashed step"], ["light", "hard Mediterranean sun, long shadow"], ["lens", "85mm, f/2.8, eye level"], ["mood", "quiet luxury, summer campaign"]];
const T_CMD = 0.4, T_P = 2.0, PS = 0.9, T_REN = T_P + PROMPT.length * PS + 0.2, T_OUT = T_REN + 1.0, T_VAR = T_OUT + 1.8, T_TAG = T_VAR + 1.8, T_END = T_TAG + 2.2;
const GRN = "#7CFC9A";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "the-prompt-is-the-shoot",
  images: { out: "assets/img/site/i35.jpg", v1: "assets/img/site/i31.jpg", v2: "assets/img/site/i32.jpg", v3: "assets/img/site/i33.jpg" },
  music: { file: "build/music/140.mp3", offset: 2, gain: -11, fadeOut: 0.8 },
  sfx: [["keys", T_CMD, -10], ...PROMPT.map((_, i) => ["keys", T_P + i * PS, -14]), ["riser", T_REN - 0.6, -14], ["boom", T_OUT, -10], ["pop", T_VAR, -12], ["pop", T_VAR + 0.15, -12], ["pop", T_VAR + 0.3, -12], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d1117", fg: "#e6edf3", button: { fill: GRN, shadow: "#1f6f3f" }, cta: "Learn to direct  →", titleFam: F.mono, titleSize: 76, titleWeight: 700 }); grain(t, 0.04); return; }
    bg("#0d1117");
    // window chrome
    const wx = 50 * u, wy = 180 * u, ww = W - 100 * u, wh = 1480 * u;
    g.fillStyle = "#161b22"; rr(wx, wy, ww, wh, 22 * u); g.fill(); g.strokeStyle = "#30363d"; g.lineWidth = 2 * u; rr(wx, wy, ww, wh, 22 * u); g.stroke();
    ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(wx + 40 * u + i * 34 * u, wy + 38 * u, 11 * u, 0, 7); g.fill(); });
    txt("ideabro — direct", CX, wy + 40 * u, { size: 24 * u, fam: F.mono, color: "#8b949e" });
    const x0 = wx + 40 * u; let y = wy + 120 * u;
    typeText(t, "$ ideabro direct --campaign oxford-summer", x0, y, T_CMD, 36, { size: 32 * u, color: "#e6edf3", caret: t < T_P });
    y += 80 * u;
    PROMPT.forEach(([k, v], i) => { const st = T_P + i * PS; if (t < st) return; txt(`${k}:`, x0, y, { size: 32 * u, fam: F.mono, color: "#79c0ff", align: "left" });
      typeText(t, v, x0 + 170 * u, y, st + 0.1, 40, { size: 32 * u, color: GRN, maxW: ww - 260 * u, caret: t < st + PS && i === PROMPT.length - 1 || (t < st + PS && t < T_REN) }); y += 64 * u; });
    if (t >= T_REN) {
      const p = prog(t, T_REN, T_OUT); y = wy + 520 * u;
      txt(t < T_OUT ? `rendering frame… ${Math.round(p * 100)}%` : "✓ frame ready · 1 product photo in, campaign out", x0, y, { size: 28 * u, fam: F.mono, color: t < T_OUT ? "#d29922" : GRN, align: "left" });
      g.fillStyle = "#30363d"; g.fillRect(x0, y + 30 * u, ww - 80 * u, 10 * u); g.fillStyle = GRN; g.fillRect(x0, y + 30 * u, (ww - 80 * u) * p, 10 * u);
      const ox = x0, oy = y + 80 * u, ow = ww - 80 * u, oh = 820 * u;
      if (t < T_VAR) {
        g.save(); g.beginPath(); g.rect(ox, oy, ow, oh * oC(p)); g.clip(); cover(IM.out, ox, oy, ow, oh, 1.04 + 0.03 * prog(t, T_OUT, T_VAR)); g.restore();
        if (p < 1) { g.fillStyle = "rgba(124,252,154,0.55)"; g.fillRect(ox, oy + oh * oC(p) - 4 * u, ow, 8 * u); }
      } else {
        const cw = (ow - 20 * u) / 2, chh = (oh - 20 * u) / 2;
        ["out", "v1", "v2", "v3"].forEach((n, k) => { const st = T_VAR + k * 0.15 - 0.15; const q = k === 0 ? 1 : oB(clamp((t - st) / 0.25)); const x = ox + (k % 2) * (cw + 20 * u), yy = oy + Math.floor(k / 2) * (chh + 20 * u);
          g.save(); g.translate(x + cw / 2, yy + chh / 2); g.scale(q, q); g.beginPath(); g.rect(-cw / 2, -chh / 2, cw, chh); g.clip(); cover(IM[n], -cw / 2, -chh / 2, cw, chh, 1.05); g.restore(); });
        txt("variations: 4", ox, oy + oh + 50 * u, { size: 28 * u, fam: F.mono, color: "#8b949e", align: "left" });
      }
    }
    // tagline over a dimmed window
    if (t >= T_TAG) { const p = oC(prog(t, T_TAG, T_TAG + 0.35)); g.fillStyle = `rgba(13,17,23,${0.82 * p})`; g.fillRect(0, 0, W, H);
      typeText(t, "The prompt is the shoot.", CX - 380 * u, CY - 60 * u, T_TAG + 0.1, 30, { size: 58 * u, weight: 700, color: "#fff", caret: false });
      typeText(t, "Learn to write it like a director.", CX - 380 * u, CY + 40 * u, T_TAG + 0.9, 34, { size: 38 * u, color: GRN }); }
    grain(t, 0.04);
  },
};
