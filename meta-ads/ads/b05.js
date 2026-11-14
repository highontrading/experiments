// B05 · "Name the camera" (English VO Steven, 9:16). Each shot is framed by the viewfinder of the camera named in
// the prompt: action cam, phone selfie, drone, 35mm film. Captions: JetBrains Mono caps on black tape, lower third.
const L = window.TL.lines;
const MODES = [  // [line, seq, label, prompt]
  [0, "intro", null, null], [1, "action", "ACTION CAMERA", "shot on an action camera, ultra wide, underwater POV"],
  [2, "phone", "PHONE SELFIE", "front camera selfie video, handheld, natural daylight"], [3, "drone", "DRONE", "drone shot, top-down over the city, golden light"],
  [4, "film", "35MM FILM", "shot on 35mm film, backlit, soft grain"], [5, "out", null, null],
];
const T_END = L[5].v1 + 0.7;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "name-the-camera",
  seqs: ["intro", "action", "phone", "drone", "film", "out"],
  music: { file: "build/music_el/lofi.mp3", offset: 4, gain: -11, duck: -6, fadeOut: 0.8 },
  sfx: [["beep", L[1].at, -10], ["shutter", L[2].at, -10], ["beep", L[3].at, -10], ["shutter", L[4].at, -8], ["focus", L[5].at, -12], ["whoosh", T_END - 0.1, -12]],
  osd(mode, t) {
    const wc = "rgba(255,255,255,0.92)", m = 70 * u; g.strokeStyle = wc; g.lineWidth = 4 * u;
    const corner = (x, y, dx, dy) => { g.beginPath(); g.moveTo(x, y + dy * 60 * u); g.lineTo(x, y); g.lineTo(x + dx * 60 * u, y); g.stroke(); };
    const tc = (s) => { const f = FR(s) % 30, sec = Math.floor(s); return `00:00:${String(sec).padStart(2, "0")}:${String(f).padStart(2, "0")}`; };
    if (mode === "action") {
      corner(m, 200 * u, 1, 1); corner(W - m, 200 * u, -1, 1); corner(m, H - 300 * u, 1, -1); corner(W - m, H - 300 * u, -1, -1);
      txt("4K · 60 · SUPERWIDE", m + 10 * u, 270 * u, { size: 28 * u, fam: F.mono, weight: 700, color: wc, align: "left" });
      g.fillStyle = "#ff3b30"; if (FR(t) % 30 < 20) { g.beginPath(); g.arc(W - m - 300 * u, 270 * u, 12 * u, 0, 7); g.fill(); }
      txt(tc(t - L[1].at), W - m - 10 * u, 270 * u, { size: 28 * u, fam: F.mono, weight: 700, color: wc, align: "right" });
      g.strokeRect(W - m - 80 * u, H - 380 * u, 70 * u, 34 * u); g.fillStyle = wc; g.fillRect(W - m - 76 * u, H - 376 * u, 46 * u, 26 * u);
    } else if (mode === "phone") {
      g.fillStyle = "rgba(0,0,0,0.25)"; rr(CX - 90 * u, 200 * u, 180 * u, 54 * u, 27 * u); g.fill(); txt("00:" + String(Math.floor(t - L[2].at)).padStart(2, "0"), CX + 12 * u, 228 * u, { size: 28 * u, weight: 700, color: "#fff" });
      g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(CX - 50 * u, 228 * u, 9 * u, 0, 7); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 8 * u; g.beginPath(); g.arc(CX, H - 330 * u, 62 * u, 0, 7); g.stroke(); g.fillStyle = "#ff3b30"; rr(CX - 26 * u, H - 356 * u, 52 * u, 52 * u, 10 * u); g.fill();
      txt("0.5×   1×   2×", CX, H - 450 * u, { size: 28 * u, weight: 700, color: "#fff", alpha: 0.85 });
    } else if (mode === "drone") {
      g.strokeStyle = wc; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(CX - 60 * u, CY); g.lineTo(CX + 60 * u, CY); g.moveTo(CX, CY - 60 * u); g.lineTo(CX, CY + 60 * u); g.stroke();
      g.beginPath(); g.arc(CX, CY, 140 * u, 0, 7); g.stroke();
      [["ALT", "120.4 m"], ["H.S", "8.2 m/s"], ["DIST", "1.3 km"], ["GPS", "18 SAT"]].forEach(([a, b], i) => { txt(a, m + i * 240 * u, 250 * u, { size: 22 * u, fam: F.mono, color: "#9be7ff", align: "left" }); txt(b, m + i * 240 * u, 285 * u, { size: 30 * u, fam: F.mono, weight: 700, color: wc, align: "left" }); });
      txt("◉ REC  " + tc(t - L[3].at), W - m, H - 360 * u, { size: 26 * u, fam: F.mono, weight: 700, color: wc, align: "right" });
    } else if (mode === "film") {
      g.fillStyle = "rgba(0,0,0,0.0)"; g.strokeStyle = "rgba(255,240,200,0.9)"; g.lineWidth = 3 * u; g.strokeRect(m + 30 * u, 260 * u, W - 2 * m - 60 * u, H - 640 * u);
      g.beginPath(); g.arc(CX, CY - 60 * u, 50 * u, 0, 7); g.stroke();
      txt("125   F2.8   ISO 400   [ 24 / 36 ]", CX, H - 330 * u, { size: 30 * u, fam: F.mono, weight: 700, color: "#ffe9b0" });
      txt("●  ●  ●  ○  ○", CX, H - 285 * u, { size: 22 * u, fam: F.mono, color: "#ffe9b0", alpha: 0.8 });
    }
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", cta: "Learn the camera language  →" }); grain(t, 0.05); return; }
    bg("#000");
    let k = 0; MODES.forEach((md, i) => { if (t >= L[md[0]].at - 0.08) k = i; });
    const [li, sq, label, prompt] = MODES[k], t0 = L[li].at - 0.08;
    g.save(); if (sq === "film") g.filter = "sepia(0.25) contrast(1.05) saturate(0.95)"; if (sq === "action") g.filter = "saturate(1.25) contrast(1.08)";
    kb(seq(sq, t, t0), t, t0, 3, sq === "phone" ? 1.12 : 1.04, sq === "phone" ? 1.16 : 1.1, 0.5, 0.45); g.restore();
    if (sq === "film") grain(t, 0.14);
    flash(t, t0 + 0.08, 0.12);
    shade(H * 0.5, H, 0.55);
    if (label) {
      this.osd(sq, t);
      const lp = oB(clamp((t - t0 - 0.1) / 0.3)); g.save(); g.translate(CX, 400 * u); g.scale(lp, lp);
      font(44 * u, 700, F.mono); const w0 = tw(label) + 50 * u; g.fillStyle = "#fff"; rr(-w0 / 2, -36 * u, w0, 72 * u, 8 * u); g.fill(); txt(label, 0, 2 * u, { size: 44 * u, fam: F.mono, weight: 700, color: "#111" }); g.restore();
      // prompt typed under the label
      g.save(); g.fillStyle = "rgba(0,0,0,0.6)"; rr(80 * u, 470 * u, W - 160 * u, 110 * u, 14 * u); g.fill(); g.restore();
      typeText(t, prompt, 110 * u, 505 * u, t0 + 0.4, 55, { size: 26 * u, fam: F.mono, color: "#fff", maxW: W - 230 * u, lh: 1.35 });
    }
    // captions: mono caps on black tape
    const ch = voChunk(t, 4, 0.5);
    if (ch) { const s = ch.map((w) => w.w).join(" ").toUpperCase(); font(54 * u, 700, F.mono); const lines = wrap(s, W * 0.8);
      lines.forEach((ln, i) => { const y = H * 0.70 + (i - (lines.length - 1) / 2) * 78 * u, w0 = tw(ln) + 40 * u; g.fillStyle = "rgba(0,0,0,0.85)"; g.fillRect(CX - w0 / 2, y - 36 * u, w0, 72 * u);
        txt(ln, CX, y + 2 * u, { size: 54 * u, fam: F.mono, weight: 700, color: "#fff" }); }); }
    grain(t, 0.04);
  },
};
