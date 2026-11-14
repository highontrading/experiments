// B17 · "5 AI ads you can make this weekend" (English VO Liam, 9:16, price on end card). A countdown of five ad
// formats, each with a lime number card. Captions: clean white Inter, fade-up, lower third.
const L = window.TL.lines;
const ITEMS = [[1, "01", "HERO PRODUCT SHOT", [["i35", 0], ["i33", 0.9]]], [2, "02", "MODEL LOOKBOOK", [["i00", 0], ["i21", 0.9]]], [3, "03", "UGC VIDEO", [["ugc", 0]]],
  [4, "04", "CINEMATIC CAR SPOT", [["car4", 0]]], [5, "05", "FULL CAMPAIGN", [["i38", 0], ["i40", 0.7], ["i41", 1.4], ["i42", 2.1]]]];
const MONT = ["i35", "i00", "i38", "i21", "i32"], T_END = L[5].v1 + 0.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "five-ai-ads-this-weekend",
  images: Object.fromEntries(["i35", "i33", "i00", "i21", "i38", "i40", "i41", "i42", "i32"].map((k) => [k, `assets/img/site/${k}.jpg`])),
  seqs: ["ugc", "car4"],
  music: { file: "build/music_el/luxhouse.mp3", offset: 0, gain: -11, duck: -6, fadeOut: 0.8 },
  sfx: [["boom", 0.3, -12], ...ITEMS.map((it) => ["whip", L[it[0]].at - 0.05, -12]), ...ITEMS.map((it) => ["pop", L[it[0]].at + 0.1, -12]), ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d0d0d", fg: "#fff", price: true, accent: C.lime, cta: "Start this weekend  →" }); grain(t, 0.04); return; }
    bg("#000");
    let k = -1; ITEMS.forEach((it, i) => { if (t >= L[it[0]].at - 0.05) k = i; });
    if (k < 0) {
      const m = Math.floor(t / 0.55) % MONT.length; g.save(); g.filter = "brightness(0.5)"; kb(IM[MONT[m]], t, 0, 3.5, 1.05, 1.12); g.restore();
      const p = oB(clamp((t - 0.25) / 0.4)); g.save(); g.translate(CX, 640 * u); g.scale(p, p); g.fillStyle = C.lime; rr(-170 * u, -190 * u, 340 * u, 380 * u, 40 * u); g.fill();
      txt("5", 0, 10 * u, { size: 340 * u, fam: F.grot, weight: 800, color: C.ink }); g.restore();
      txt("AI ADS · THIS WEEKEND", CX, 920 * u, { size: 52 * u, fam: F.grot, weight: 800, color: "#fff", alpha: oC(prog(t, 0.5, 0.9)), ls: 2 });
    } else {
      const [li, n, lab, shots] = ITEMS[k], t0 = L[li].at - 0.05; let j = 0; shots.forEach((s, i) => { if (t >= t0 + s[1]) j = i; });
      const st = t0 + shots[j][1]; g.save(); g.globalAlpha = oC(prog(t, st, st + 0.2)); kb(SRC(shots[j][0], t, st), t, st, 2.2, 1.04, 1.1, 0.5, 0.4); g.restore();
      shade(0, H * 0.3, 0.5, true); shade(H * 0.55, H, 0.7);
      const p = oB(clamp((t - t0) / 0.3)); g.save(); g.translate(60 * u + 90 * u, 300 * u); g.scale(p, p); g.fillStyle = C.lime; rr(-90 * u, -90 * u, 180 * u, 180 * u, 28 * u); g.fill();
      txt(n, 0, 6 * u, { size: 104 * u, fam: F.grot, weight: 800, color: C.ink }); g.restore();
      txt(lab, 270 * u, 300 * u, { size: fitSize(lab, W - 330 * u, 56 * u, 800, F.grot), fam: F.grot, weight: 800, color: "#fff", align: "left", alpha: oC(prog(t, t0 + 0.1, t0 + 0.35)), shadow: 10 });
      // progress dots
      ITEMS.forEach((_, i) => { g.fillStyle = i <= k ? C.lime : "rgba(255,255,255,0.35)"; rr(270 * u + i * 70 * u, 360 * u, 56 * u, 10 * u, 5 * u); g.fill(); });
    }
    capClean(t, voChunk(t, 4, 0.5), H * 0.74, { size: 76 * u, weight: 800, color: "#fff", shadow: 14, shadowColor: "rgba(0,0,0,0.6)" });
    grain(t, 0.04);
  },
};
