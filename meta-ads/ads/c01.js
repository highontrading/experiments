// C01 · "The Trailer" (English VO Don, 9:16). A full Hollywood-style trailer for the course: "In a world..." title
// cards in Cinzel over a dark-graded montage of AI footage, braam hits on every cut, a giant title reveal.
// Captions: Cinzel caps, letter-spaced, centred, one VO line at a time (trailer title-card style).
const L = window.TL.lines, POOL = ["storm", "zep", "earth", "leopard", "car", "sea", "run", "dinner", "cafe", "beach", "desert", "boom"];
const T_TITLE = L[4].at - 0.3, T_END = L[4].v1 + 0.9;
const CUTS = (() => { const out = []; let t = 0, k = 0; while (t < T_TITLE) { const inLine = L.some((l) => t >= l.at - 0.1 && t < l.v1); out.push([t, POOL[k % POOL.length]]); t += inLine ? 1.35 : 0.42; k++; } return out; })();
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.8, slug: "the-trailer",
  seqs: POOL,
  music: { file: "build/music_el/trailer.mp3", offset: 0, gain: -8, duck: -5, fadeOut: 1.2 },
  sfx: [["braam", 0.2, -6], ["braam", L[2].at - 0.5, -6], ["boom", L[3].at - 0.3, -8], ["braam", T_TITLE, -4], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#000", fg: "#fff", titleFam: F.cinzel, titleWeight: 700, titleSize: 78, title: "AI & ADVERTISING", sub: "AN IDEABRO STUDIO COURSE", button: { fill: "#E9B949", shadow: "#fff" }, cta: "Enroll now  →" }); grain(t, 0.06); return; }
    bg("#000");
    if (t < T_TITLE) {
      const k = cutIdx(t, CUTS.map((c) => c[0])), [t0, s] = CUTS[k], t1 = k + 1 < CUTS.length ? CUTS[k + 1][0] : T_TITLE;
      const inLine = L.some((l) => t >= l.at - 0.1 && t < l.v1);
      g.save(); g.filter = "contrast(1.12) saturate(0.8) brightness(0.95)"; kb(seq(s, t, t0), t, t0, t1 - t0, 1.08, 1.16); g.restore();
      g.fillStyle = "rgba(10,20,30,0.25)"; g.globalCompositeOperation = "multiply"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
      g.fillStyle = `rgba(0,0,0,${inLine ? 0.32 : 0.08})`; g.fillRect(0, 0, W, H); vignette(0.75);
      if (!inLine) flash(t, t0, 0.07, "255,255,255", 0.5);
      // title card for the current line
      let li = -1; L.forEach((l, i) => { if (i < 4 && t >= l.at - 0.1 && t < l.v1 + 0.3) li = i; });
      if (li >= 0) { const l = L[li], a = Math.min(oC(prog(t, l.at - 0.1, l.at + 0.5)), 1 - prog(t, l.v1, l.v1 + 0.3)), z = lerp(1.0, 1.06, prog(t, l.at, l.v1 + 0.3));
        g.save(); g.translate(CX, CY); g.scale(z, z); g.translate(-CX, -CY);
        capText(l.cap.replace(/\.\.\./g, "").toUpperCase(), CY, a, 1, { size: 64 * u, fam: F.cinzel, weight: 700, ls: 6, lh: 1.45, maxW: W * 0.8, shadow: 30, shadowColor: "rgba(255,200,120,0.35)" }); g.restore(); }
    } else {   // title reveal
      const p = prog(t, T_TITLE, T_TITLE + 1.4); g.save(); g.filter = "brightness(0.35) saturate(0.6)"; kb(seq("earth", t, T_TITLE), t, T_TITLE, 4, 1.05, 1.15); g.restore(); vignette(0.8);
      // lens flare sweep
      const fx = lerp(-W * 0.3, W * 1.3, ioC(prog(t, T_TITLE + 0.2, T_TITLE + 1.6))); const gr = g.createRadialGradient(fx, CY, 0, fx, CY, 500 * u); gr.addColorStop(0, "rgba(255,220,160,0.55)"); gr.addColorStop(1, "rgba(255,220,160,0)");
      g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(255,230,190,0.35)"; g.fillRect(0, CY - 2 * u, W, 4 * u);
      const z = lerp(1.25, 1.0, oC(p)); g.save(); g.translate(CX, CY - 40 * u); g.scale(z, z);
      txt("AI & ADVERTISING", 0, 0, { size: 82 * u, fam: F.cinzel, weight: 700, color: "#fff", alpha: oC(p), ls: 2, shadow: 40, shadowColor: "rgba(255,200,120,0.6)" }); g.restore();
      txt("NOW ENROLLING", CX, CY + 90 * u, { size: 40 * u, fam: F.cinzel, weight: 700, color: "#E9B949", alpha: oC(prog(t, T_TITLE + 1.2, T_TITLE + 1.8)), ls: 14 });
    }
    // letterbox bars
    g.fillStyle = "#000"; g.fillRect(0, 0, W, 170 * u); g.fillRect(0, H - 170 * u, W, 170 * u);
    grain(t, 0.08);
  },
};
