// B04 · "One image. Five film stocks." (English, 4:5 feed, music only). The same AI frame re-graded by naming a
// film stock in the prompt; a wipe reveals each look. Captions: JetBrains Mono labels in colour-coded tags.
const LOOKS = [  // [name, css filter, tag colour, tint rgba, note]
  ["NO STOCK", "none", "#d9d9d9", null, "clean digital default"],
  ["PORTRA 400", "sepia(0.35) saturate(1.1) contrast(0.92) brightness(1.08)", "#F3C77A", "rgba(255,190,120,0.10)", "warm skin, soft pastels"],
  ["CINESTILL 800T", "hue-rotate(-18deg) saturate(0.9) contrast(1.15) brightness(0.9)", "#7FB8FF", "rgba(30,100,170,0.22)", "tungsten blue, red halation"],
  ["EKTACHROME", "saturate(1.55) contrast(1.15)", "#FF8A65", null, "punchy slide-film colour"],
  ["TRI-X 400", "grayscale(1) contrast(1.35) brightness(0.98)", "#ffffff", null, "gritty black & white"],
  ["FUJI 400H", "hue-rotate(8deg) saturate(0.85) brightness(1.08) contrast(0.95)", "#9EE6B8", "rgba(120,200,160,0.10)", "airy greens, cool shadows"],
];
const T0 = 1.6, LS = 1.9, T_FIN = T0 + LOOKS.length * LS, T_END = T_FIN + 2.6;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "five-film-stocks",
  images: { im: "assets/img/site/i12.jpg" },
  music: { file: "build/music_el/lofi.mp3", offset: 0, gain: -9, fadeOut: 1.0 },
  sfx: [...LOOKS.slice(1).map((_, i) => ["shutter", T0 + (i + 1) * LS, -10]), ["whoosh", T_FIN, -12], ["whoosh", T_END - 0.15, -14]],
  graded(k, x, y, w, h, z = 1.04) {
    const [n, f, , tint] = LOOKS[k]; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.filter = f; cover(IM.im, 60 * u, 230 * u, W - 120 * u, 820 * u, z, 0.5, 0.12); g.filter = "none";
    if (tint) { g.fillStyle = tint; g.fillRect(x, y, w, h); }
    if (n.startsWith("CINESTILL")) { const r = g.createRadialGradient(W * 0.62, 400 * u, 10 * u, W * 0.62, 400 * u, 360 * u); r.addColorStop(0, "rgba(255,80,40,0.18)"); r.addColorStop(1, "rgba(255,80,40,0)"); g.fillStyle = r; g.fillRect(x, y, w, h); }
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#121212", fg: "#fff", cta: "Learn to grade with words  →" }); grain(t, 0.06); return; }
    bg("#121212");
    const fx = 60 * u, fy = 230 * u, fw = W - 120 * u, fh = 820 * u;
    // film rebate: sprocket holes above and below the frame
    g.fillStyle = "#1d1d1d"; g.fillRect(0, fy - 70 * u, W, fh + 140 * u);
    for (let x = 30 * u; x < W; x += 72 * u) { g.fillStyle = "#121212"; rr(x, fy - 52 * u, 34 * u, 30 * u, 6 * u); g.fill(); rr(x, fy + fh + 22 * u, 34 * u, 30 * u, 6 * u); g.fill(); }
    if (t < T_FIN) {
      const k = clamp(Math.floor((t - T0) / LS) + 1, 0, LOOKS.length - 1), ts = T0 + (k - 1) * LS;
      if (t < T0) this.graded(0, fx, fy, fw, fh);
      else { const wp = ioC(prog(t, ts, ts + 0.5)); this.graded(k - 1, fx, fy, fw, fh); this.graded(k, fx + fw * (1 - wp), fy, fw * wp, fh);
        if (wp < 1) { g.fillStyle = "#fff"; g.fillRect(fx + fw * (1 - wp) - 2 * u, fy, 4 * u, fh); } }
      const kk = t < T0 ? 0 : k, [n, , col, , note] = LOOKS[kk], lp = oB(clamp((t - (t < T0 ? 0.3 : ts + 0.25)) / 0.3));
      // tag
      font(40 * u, 700, F.mono); const tw0 = tw(n) + 60 * u; g.save(); g.translate(fx + 30 * u + tw0 / 2, fy + fh - 60 * u); g.scale(lp, lp);
      g.fillStyle = col; rr(-tw0 / 2, -34 * u, tw0, 68 * u, 10 * u); g.fill(); txt(n, 0, 2 * u, { size: 40 * u, fam: F.mono, weight: 700, color: "#111" }); g.restore();
      txt(`FRAME ${String(kk).padStart(2, "0")} / 05`, fx + fw - 20 * u, fy - 100 * u, { size: 24 * u, fam: F.mono, color: "#8a8a8a", align: "right" });
      // header + prompt line (same mono theme)
      txt(t < T0 ? "ONE AI IMAGE." : "FIVE FILM STOCKS.", fx, 120 * u, { size: 56 * u, fam: F.mono, weight: 700, color: "#fff", align: "left" });
      txt(kk ? `prompt: "... shot on ${n.toLowerCase()}"` : `prompt: "couple running with their dog, summer"`, fx, fy + fh + 120 * u, { size: 30 * u, fam: F.mono, color: col === "#ffffff" ? "#ddd" : col, align: "left" });
      txt(note, fx, fy + fh + 170 * u, { size: 30 * u, fam: F.mono, color: "#9a9a9a", align: "left" });
    } else {  // all five side by side
      const p = ioC(prog(t, T_FIN, T_FIN + 0.7)), sw = fw / 5;
      for (let k = 1; k < LOOKS.length; k++) { const x = fx + (k - 1) * sw; this.graded(k, x + (k > 1 ? 3 * u : 0), fy, sw * p + (1 - p) * fw - 3 * u, fh); }
      for (let k = 1; k < LOOKS.length; k++) { const x = fx + (k - 1) * sw + sw / 2; txt(LOOKS[k][0].split(" ")[0], x, fy + fh - 40 * u, { size: 22 * u, fam: F.mono, weight: 700, color: "#fff", alpha: p, shadow: 8 }); }
      txt("ONE WORD CHANGES THE WHOLE FILM.", fx, 120 * u, { size: 44 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", alpha: oC(prog(t, T_FIN + 0.4, T_FIN + 0.8)) });
      txt("We teach the vocabulary of light, lens and film.", fx, fy + fh + 130 * u, { size: 30 * u, fam: F.mono, color: "#ddd", align: "left", alpha: oC(prog(t, T_FIN + 0.8, T_FIN + 1.2)) });
    }
    grain(t, 0.07);
  },
};
