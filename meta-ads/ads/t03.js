// T03 · TRAILER "The Product Shoot" (English, 9:16, music only). Liquid, light and impossible sets — cans dropping,
// lime splashes, a serum in a waterfall, a cosmetics conveyor — all AI, one shot per source, cut on the beat.
// Captions: a luxury spec-sheet system — one huge white DM Serif italic verb per shot, a mono shot label above it and
// a cream Poppins line below. Same three slots every shot.
const BD = 0.6036, T0 = 0.0;
const SH = [["drop", 5, "Drop.", "can, studio white"], ["lime", 4, "Splash.", "sparkling lime, macro"], ["falls", 4, "Mist.", "serum, desert waterfall"], ["green", 4, "Burst.", "citrus can, jungle green"],
  ["pull", 1.8, "Open.", "ring-pull, 1000fps"], ["dropper", 2.6, "Glow.", "serum, skin close-up"], ["belt", 4, "Build.", "cosmetics, runway conveyor"], ["bus", 4, "Set.", "yogurt, toy-town street"],
  ["beach", 4, "Ride.", "cola, surfboard"], ["snow", 4, "Float.", "bag, snow peaks"], ["latte", 3.3, "Pour.", "iced latte, dark studio"]].map(([s, b, v, l]) => ({ s, d: BD * b, z0: 1.0, z1: 1.05, v, l }));
const T_TITLE = T0 + SH.reduce((a, s) => a + s.d, 0), T_END = T_TITLE + 3.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "trailer-the-product-shoot",
  seqs: SH.map((s) => s.s),
  music: { file: "build/music_el/tr_product.mp3", offset: 0, gain: -6, fadeOut: 1.2 },
  sfx: [["whoosh", 0.0, -14], ...SH.map((s, i) => ["whip", T0 + SH.slice(0, i).reduce((a, x) => a + x.d, 0), -18]).slice(1), ["boom", T_TITLE, -8]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0a0a0a", fg: "#fff", titleFam: F.dms, titleStyle: "italic", cta: "Learn the product shoot  →" }); grain(t, 0.05); return; }
    bg("#000");
    if (t < T_TITLE) {
      const { k, t0, sh } = drawShot(t, SH, T0, { punch: 0.06 }); shade(0, H * 0.28, 0.55, true); shade(H * 0.66, H, 0.65);
      const e = t0 + sh.d - 0.04;
      edCap(t, t0 + 0.05, e, [[[`SHOT ${String(k + 1).padStart(2, "0")} — ${sh.l.toUpperCase()}`, "M", 0.26]]], { y: 230 * u, x: 80 * u, size: 100 * u, ls: 3 });
      edCap(t, t0 + 0.1, e, [[[sh.v, "S", 1.0]]], { y: 1390 * u, x: 80 * u, size: 190 * u, shadow: 30 });
      edCap(t, t0 + 0.25, e, [[["no studio. no photographer.", "b", 0.42]]], { y: 1575 * u, x: 86 * u, size: 100 * u });
      txt("MADE WITH AI", W - 80 * u, 230 * u, { size: 24 * u, fam: F.mono, weight: 700, color: CREAM, align: "right", alpha: 0.9, ls: 3, shadow: 8 });
    } else {
      g.save(); g.filter = "brightness(0.45) blur(6px)"; cover(seq("latte", t, T_TITLE - SH[SH.length - 1].d), 0, 0, W, H, 1.1); g.restore();
      edCap(t, T_TITLE + 0.1, T_END, [[["The product shoot", "B", 0.6]], [["is a", "S"], ["prompt", "S"], ["now.", "B", 0.9]]], { y: 760 * u, x: CX, align: "center", size: 124 * u });
      edCap(t, T_TITLE + 0.9, T_END, [[["AI & ADVERTISING · BY IDEABRO STUDIO", "M", 0.22]]], { y: 1100 * u, x: CX, align: "center", size: 120 * u, ls: 3 });
    }
    filmGrade(t, 0.05);
  },
};
