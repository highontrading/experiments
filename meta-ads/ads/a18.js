// A18 · "THE SHOOT IS OPTIONAL NOW." (English VO Steven, 9:16). Brutalist mega-type: each word fills the screen with
// AI footage playing inside the letters, then a beat-cut montage of the drive's AI films. Captions: knockout type.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const WORDS = [["THE", "w0"], ["SHOOT", "w1"], ["IS", "w2"], ["OPTIONAL", "w3"], ["NOW.", "w4"]];
const T_L1 = L[1].at, T_MON = L[2].v1 + 0.15, B = 0.667, T_END = T_MON + 6 * B;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "the-shoot-is-optional-now",
  seqs: ["w0", "w1", "w2", "w3", "w4", "m1", "m2", "m3", "m4"],
  music: { file: "../ai-advertising-trailer/build/music/score_a.mp3", offset: 0.0, gain: -9, duck: -6, fadeOut: 0.6 },
  sfx: [...WORDS.map((_, i) => ["boom", Wd(0, i), -14]), ["whip", T_L1, -10], ["whip", Wd(2, 0), -10], ...[0, 1, 2, 3, 4, 5].map((k) => ["shutter", T_MON + k * B, -14]), ["boom", T_END - 0.05, -8]],
  masked(text, seqName, t, t0, size, y) {   // footage clipped to the letters
    const off = document.createElement("canvas"); off.width = W; off.height = H; const o = off.getContext("2d");
    const im = seq(seqName, t, t0); if (im) { const s = Math.max(W / im.width, H / im.height) * 1.1; o.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); }
    o.globalCompositeOperation = "destination-in"; o.font = `400 ${size}px Anton`; o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff"; o.fillText(text, CX, y);
    g.drawImage(off, 0, 0);
    g.save(); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 3 * u; font(size, 400, F.anton); g.textAlign = "center"; g.textBaseline = "middle"; g.strokeText(text, CX, y); g.restore();
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#000", fg: "#fff", titleFam: F.anton, titleWeight: 400, titleSize: 120, title: "AI & ADVERTISING" }); grain(t, 0.06); return; }
    bg("#000");
    if (t < T_L1) {   // one word at a time, screen-filling
      let k = 0; WORDS.forEach((w, i) => { if (t >= Wd(0, i) - 0.03) k = i; });
      const [wd, sq] = WORDS[k], st = Wd(0, k) - 0.03; const size = fitSize(wd, W * 0.94, 900 * u, 400, F.anton), p = oC(clamp((t - st) / 0.15));
      g.save(); g.translate(CX, CY); g.scale(1.15 - 0.15 * p, 1.15 - 0.15 * p); g.translate(-CX, -CY); this.masked(wd, sq, t, st, size, CY); g.restore();
      txt(`${k + 1}/5`, W - 60 * u, 120 * u, { size: 28 * u, fam: F.mono, color: "#777", align: "right" });
    } else if (t < T_MON) {   // "Shoot-quality ads." / "Without the shoot." stacked, footage inside
      const two = t >= Wd(2, 0) - 0.03;
      const a = two ? "WITHOUT" : "SHOOT-", b = two ? "THE SHOOT." : "QUALITY ADS.";
      this.masked(a, two ? "w3" : "w1", t, T_L1, fitSize(a, W * 0.92, 420 * u, 400, F.anton), CY - 230 * u);
      this.masked(b, two ? "w4" : "w0", t, T_L1, fitSize(b, W * 0.92, 420 * u, 400, F.anton), CY + 170 * u);
      if (two) { g.fillStyle = C.lime; g.fillRect(CX - 300 * u, CY + 410 * u, 600 * u * oC(prog(t, Wd(2, 0), Wd(2, 0) + 0.4)), 14 * u); }
    } else {   // montage on the beat
      const k = Math.min(3, Math.floor((t - T_MON) / B)); const names = ["m1", "m2", "m3", "m4", "w0", "w2"];
      const kk = Math.min(5, Math.floor((t - T_MON) / B)); cover(seq(names[kk], t, T_MON + kk * B), 0, 0, W, H, 1.08 - 0.04 * ((t - T_MON) % B) / B);
      shade(H * 0.65, H, 0.65);
      txt("ALL MADE WITH AI · NO CAMERA, NO CREW", CX, H * 0.78, { size: 30 * u, fam: F.mono, weight: 700, color: "#fff" });
      txt(["CAR CHASE", "OCEAN", "JUNGLE", "ANCIENT CITY", "WILDLIFE", "SNOW"][kk], CX, H * 0.73, { size: 70 * u, fam: F.anton, weight: 400, color: C.lime });
    }
    grain(t, 0.07);
  },
};
