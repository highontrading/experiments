// T04 · TRAILER "An AI Fashion Film" (English, 9:16, music only). Street-style and editorial moments — Soho walks,
// a corner office, a giant in the city, golden hour — every frame AI, one shot per source.
// Captions: lowercase fashion-diary lines in the reference style ("her casual day out / lately in delhi"):
// a small white serif italic lead, a cream Poppins line and a Fraunces italic tail, set beside the subject.
const BD = 0.5106, T_IN = 1.8;
const SH = [["soho", 4.6, [["her", "S", 0.7]], [["monday commute,", "B", 0.62]], [["lately in soho", "R", 0.7]], "right"],
  ["box", 4.6, [["the walk", "S", 0.7]], [["was rendered.", "B", 0.62]], [["3d tracked, ai lit", "R", 0.6]], "left"],
  ["office", 4.6, [["a corner office", "S", 0.7]], [["no set builders", "B", 0.62]], [["no permits", "R", 0.6]], "left"],
  ["car", 4.6, [["his ride home", "S", 0.7]], [["never happened.", "B", 0.62]], [["shot nowhere", "R", 0.6]], "left"],
  ["sky2", 3.6, [["the outfit,", "S", 0.7]], [["the skyline.", "B", 0.62]], [["one prompt", "R", 0.6]], "left"],
  ["city", 4.6, [["a city", "S", 0.7]], [["her size.", "B", 0.62]], [["obviously ai", "R", 0.6]], "left"],
  ["golden", 4.6, [["golden hour,", "S", 0.7]], [["on demand.", "B", 0.62]], [["every day", "R", 0.6]], "left"],
  ["beach", 4.6, [["a vacation", "S", 0.7]], [["nobody took.", "B", 0.62]], [["still the best ad", "R", 0.6]], "left"]].map(([s, b, a, m, z, side]) => ({ s, d: BD * b, a, m, z, side, z0: 1.0, z1: 1.06 }));
SH[6].ax = 0.5; SH[7].ax = 0.6;
const T_TITLE = T_IN + SH.reduce((a, s) => a + s.d, 0), T_END = T_TITLE + 3.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "trailer-ai-fashion-film",
  seqs: [...SH.map((s) => s.s), "train"],
  music: { file: "build/music_el/tr_fashion.mp3", offset: 0, gain: -6, fadeOut: 1.2 },
  sfx: [["shutter", T_IN, -12], ["shutter", T_TITLE, -10]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#14110e", fg: "#fff", titleFam: F.dms, titleStyle: "italic", cta: "Direct your film  →" }); grain(t, 0.06); return; }
    bg("#0c0b0a");
    if (t < T_IN) {  // cold open: title card on black
      edCap(t, 0.2, T_IN - 0.05, [[["an", "S", 0.6], ["ai", "R", 0.6]], [["fashion film", "B", 0.8]]], { y: 860 * u, x: CX, align: "center", size: 120 * u });
      edCap(t, 0.7, T_IN - 0.05, [[["NOTHING HERE WAS SHOT ON A CAMERA", "M", 0.2]]], { y: 1110 * u, x: CX, align: "center", size: 120 * u, ls: 3 });
    } else if (t < T_TITLE) {
      const { k, t0, sh } = drawShot(t, SH, T_IN, { punch: 0.03 }); shade(H * 0.55, H, 0.6); const e = t0 + sh.d - 0.05;
      const right = sh.side === "right", x = right ? W - 80 * u : 80 * u, al = right ? "right" : "left";
      edCap(t, t0 + 0.1, e, [sh.a], { y: 1240 * u, x, align: al, size: 120 * u }); edCap(t, t0 + 0.25, e, [sh.m], { y: 1335 * u, x, align: al, size: 120 * u }); edCap(t, t0 + 0.4, e, [sh.z], { y: 1425 * u, x, align: al, size: 120 * u });
      txt(`${String(k + 1).padStart(2, "0")} / ${SH.length}`, W - 70 * u, 230 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff", align: "right", alpha: 0.8, shadow: 8 });
      txt("ai fashion film", 70 * u, 230 * u, { size: 34 * u, fam: F.dms, style: "italic", weight: 400, color: "#fff", align: "left", alpha: 0.85, shadow: 8 });
    } else {
      kb(seq("train", t, T_TITLE), t, T_TITLE, 4, 1.04, 1.1); shade(H * 0.35, H, 0.85 * oC(prog(t, T_TITLE, T_TITLE + 0.5)));
      edCap(t, T_TITLE + 0.15, T_END, [[["directed,", "S", 0.9]], [["not shot.", "B"]]], { y: 1150 * u, x: 80 * u, size: 140 * u });
      edCap(t, T_TITLE + 0.9, T_END, [[["learn ai fashion films at", "R", 0.42]], [["AI & Advertising", "B", 0.45]]], { y: 1420 * u, x: 84 * u, size: 140 * u });
    }
    filmGrade(t, 0.06);
  },
};
