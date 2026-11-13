// A07 · "Taste is the skill" (English, 9:16, no VO). A feed of same-looking AI ads scrolls past, then one vivid ad
// stops the scroll. Captions: white story-sticker text boxes (black Inter, slight tilt).
const T_STOP = 3.0, T_ZOOM = 4.6, T_EX = 7.6, T_LEARN = 10.0, T_END = 11.8;
const STK = [  // [t0, t1, text, highlight word, y]
  [0.3, 1.6, "Feeds are full of AI ads", null, 0.20], [1.6, 3.0, "that all look the same.", null, 0.20],
  [3.1, 4.6, "Then one stops the scroll.", null, 0.15], [4.8, 6.1, "The tools are easy.", null, 0.16], [6.1, 7.6, "Taste is the skill.", "Taste", 0.16],
  [7.7, 10.0, "Light. Colour. Story.", null, 0.16], [10.0, 11.8, "Learn the direction.", "direction.", 0.42],
];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "taste-is-the-skill",
  images: { b1: "assets/img/site/i06.jpg", b2: "assets/img/site/i19.jpg", e1: "assets/img/site/i22.jpg", e2: "assets/img/site/i13.jpg", e3: "assets/img/site/i31.jpg", e4: "assets/img/site/i12.jpg" },
  seqs: ["hero"],
  music: { file: "build/music/130.mp3", offset: 8, gain: -10, fadeOut: 0.8 },
  sfx: [["swipe", 0.2, -10], ["swipe", 0.9, -12], ["swipe", 1.6, -12], ["swipe", 2.3, -14], ["boom", T_STOP, -10], ...STK.map((s) => ["pop", s[0], -14]),
        ["shutter", T_EX, -10], ["shutter", T_EX + 0.8, -10], ["shutter", T_EX + 1.6, -10], ["whoosh", T_END - 0.1, -12]],
  post(x, y, w, im, o = {}) {   // a feed post card; returns height
    const hh = 110 * u, ih = w * (o.ar || 1.25); g.fillStyle = "#fff"; g.fillRect(x, y, w, hh + ih + 170 * u);
    g.fillStyle = o.av || "#ddd"; g.beginPath(); g.arc(x + 60 * u, y + 55 * u, 32 * u, 0, 7); g.fill();
    txt(o.name || "brand.store", x + 110 * u, y + 44 * u, { size: 30 * u, weight: 700, color: "#111", align: "left" });
    txt("Sponsored", x + 110 * u, y + 78 * u, { size: 24 * u, weight: 500, color: "#777", align: "left" });
    g.save(); g.beginPath(); g.rect(x, y + hh, w, ih); g.clip();
    if (o.draw) o.draw(x, y + hh, w, ih); else { g.filter = o.filter || "none"; cover(im, x, y + hh, w, ih, o.z || 1.1, o.ax ?? 0.5, 0.5); g.filter = "none"; }
    if (o.tag) { g.fillStyle = "rgba(255,255,255,0.85)"; rr(x + w / 2 - 200 * u, y + hh + ih / 2 - 40 * u, 400 * u, 80 * u, 8 * u); g.fill(); txt(o.tag, x + w / 2, y + hh + ih / 2, { size: 34 * u, weight: 600, fam: F.serif, color: "#555" }); }
    g.restore();
    const iy = y + hh + ih + 50 * u; g.strokeStyle = "#111"; g.lineWidth = 4 * u;
    [0, 1, 2].forEach((k) => { g.beginPath(); g.arc(x + 60 * u + k * 80 * u, iy, 20 * u, 0, 7); g.stroke(); });
    txt(o.cap || "Introducing our new collection ✦ shop now", x + 40 * u, iy + 70 * u, { size: 26 * u, weight: 500, color: "#333", align: "left" });
    return hh + ih + 170 * u;
  },
  sticker(t, s) {
    const [t0, t1, text, hi, yy] = s; if (t < t0 || t >= t1) return;
    const p = oB(clamp((t - t0) / 0.25)), size = 66 * u; font(size, 800, F.inter); const lines = wrap(text, W * 0.78);
    g.save(); g.translate(CX, H * yy); g.rotate(-0.025); g.scale(p, p);
    lines.forEach((ln, i) => { const w = tw(ln) + 60 * u, y = i * size * 1.35;
      g.fillStyle = "#fff"; rr(-w / 2, y - size * 0.68, w, size * 1.36, 18 * u); g.fill();
      if (hi && ln.includes(hi)) { font(size, 800, F.inter); const pre = ln.slice(0, ln.indexOf(hi)), x0 = -w / 2 + 30 * u + tw(pre), hw = tw(hi); g.fillStyle = C.lime; rr(x0 - 8 * u, y - size * 0.55, hw + 16 * u, size * 1.1, 10 * u); g.fill(); }
      txt(ln, 0, y + 2 * u, { size, weight: 800, color: C.ink }); });
    g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#ffffff", fg: C.ink, strike: "#9a9a9a" }); grain(t, 0.03); return; }
    bg("#ececec");
    const pw = 1000 * u, px = CX - pw / 2;
    if (t < T_ZOOM) {
      // scroll offset: fast, decelerating into the hero post
      const postH = 110 * u + pw * 1.25 + 170 * u + 30 * u;
      const off = ioC(prog(t, 0, T_STOP)) * postH * 5;
      const same = [["b1", "minimal. timeless. yours.", "sepia(0.5) saturate(0.4)"], ["b2", "elevate your routine", "sepia(0.6) saturate(0.35) hue-rotate(-10deg)"], ["b1", "luxury, redefined", "sepia(0.4) saturate(0.3) brightness(1.05)"], ["b2", "the new standard", "sepia(0.55) saturate(0.3)"], ["b1", "crafted for you", "sepia(0.5) saturate(0.35) brightness(0.95)"]];
      for (let k = 0; k < 6; k++) {
        const y = 140 * u + k * postH - off; if (y > H || y + postH < 0) continue;
        if (k < 5) this.post(px, y, pw, IM[same[k][0]], { filter: same[k][2], tag: same[k][1], z: 1.2 + k * 0.05, ax: 0.3 + k * 0.1, av: "#cfc6b8" });
        else this.post(px, y, pw, null, { name: "your.brand", av: C.lime, cap: "Directed with AI. Not just generated.", draw: (x, yy, w, h) => cover(seq("hero", t, 2.2), x, yy, w, h, 1.05) });
      }
      // "SAME PROMPT" stamps on the beige ads
      if (t < T_STOP - 0.3) { const k = Math.floor(t / 0.45) % 3; txt("SAME PROMPT", CX + (k - 1) * 220 * u, H * 0.52 + k * 120 * u, { size: 40 * u, fam: F.mono, weight: 700, color: "rgba(200,40,40,0.75)" }); }
    } else if (t < T_EX) {   // hero fills the screen
      const p = oC(prog(t, T_ZOOM, T_ZOOM + 0.5)); const x = lerp(px, 0, p), w = lerp(pw, W, p), y0 = lerp(140 * u + 110 * u, 0, p), h = lerp(pw * 1.25, H, p);
      cover(seq("hero", t, 2.2), x, y0, w, h, 1.05); shade(0, H * 0.35, 0.45, true);
    } else {   // three more vivid examples, quick cuts
      const ims = ["e1", "e2", "e3", "e4"]; const k = Math.min(3, Math.floor((t - T_EX) / 0.8)); cover(IM[ims[k]], 0, 0, W, H, 1.05 + 0.04 * ((t - T_EX) % 0.8)); shade(0, H * 0.35, 0.4, true);
      if (t >= T_LEARN) { g.fillStyle = `rgba(0,0,0,${0.55 * prog(t, T_LEARN, T_LEARN + 0.3)})`; g.fillRect(0, 0, W, H); }
    }
    STK.forEach((s) => this.sticker(t, s));
    grain(t, 0.04);
  },
};
