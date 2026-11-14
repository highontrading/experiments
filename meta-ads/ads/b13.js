// B13 · "A day as an AI ad director" (English VO Jessica, 9:16). Time-stamped day-in-the-life: brief, mood board,
// product shots, video edit, client approval. Captions: white pill, ink words, pink active word; time chips top-left.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const SC = [  // [line, time chip, shots [[src, t-offset word idx]]]
  [0, null, [["desk", 0]]], [1, "9:00 AM", [["i40", 0]]], [2, "11:00 AM", [["i41", 0]]], [3, "1:00 PM", [["i38", 0], ["i35", 3], ["i32", 4]]],
  [4, "4:00 PM", [["i42", 0]]], [5, "6:00 PM", [["i39b", 0]]],
];
const T_END = L[5].v1 + 0.9;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "day-as-ai-ad-director",
  images: { i40: "assets/img/site/i40.jpg", i41: "assets/img/site/i41.jpg", i38: "assets/img/site/i38.jpg", i35: "assets/img/site/i35.jpg", i32: "assets/img/site/i32.jpg", i42: "assets/img/site/i42.jpg", i39b: "assets/img/site/i38.jpg" },
  seqs: ["desk"],
  music: { file: "build/music_el/lofi.mp3", offset: 0, gain: -11, duck: -6, fadeOut: 0.8 },
  sfx: [...[1, 2, 3, 4, 5].map((l) => ["tick", L[l].at, -10]), ["notif", Wd(5, 1), -6], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: C.cream, grid: C.grid, fg: C.ink, strike: "#8a8a8a", button: { fill: C.pink }, cta: "Start your day one  →" }); grain(t, 0.04); return; }
    bg("#111");
    let k = 0; SC.forEach((s, i) => { if (t >= L[s[0]].at - 0.08) k = i; });
    const [li, chip, shots] = SC[k], t0 = L[li].at - 0.08;
    let j = 0; shots.forEach((s, i) => { if (t >= (s[1] ? Wd(li, s[1]) - 0.05 : t0)) j = i; });
    const st = shots[j][1] ? Wd(li, shots[j][1]) - 0.05 : t0;
    g.save(); g.globalAlpha = oC(prog(t, st, st + 0.25)); kb(SRC(shots[j][0], t, st), t, st, 3, 1.04, 1.12, shots[j][0] === "i37" ? 0.5 : 0.5, 0.5); g.restore();
    shade(H * 0.55, H, 0.6); shade(0, H * 0.25, 0.45, true);
    if (chip) { const p = oB(clamp((t - t0) / 0.3)); font(56 * u, 700, F.mono); const w0 = tw(chip) + 70 * u; g.save(); g.translate(60 * u + w0 / 2, 260 * u); g.scale(p, p);
      g.fillStyle = "#fff"; rr(-w0 / 2, -44 * u, w0, 88 * u, 44 * u); g.fill(); txt(chip, 0, 3 * u, { size: 56 * u, fam: F.mono, weight: 700, color: C.ink }); g.restore();
      // day progress bar
      const dp = (k - 1) / 4; g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(60 * u, 340 * u, W - 120 * u, 8 * u); g.fillStyle = C.pink; g.fillRect(60 * u, 340 * u, (W - 120 * u) * lerp(dp, dp + 0.25, oC(prog(t, t0, t0 + 0.6))) , 8 * u); }
    if (k === 5) { const p = oB(clamp((t - Wd(5, 1) + 0.05) / 0.35)); g.save(); g.translate(CX, 560 * u); g.scale(p, p);
      g.fillStyle = "rgba(250,250,250,0.96)"; rr(-440 * u, -110 * u, 880 * u, 220 * u, 40 * u); g.fill();
      g.fillStyle = C.lime; rr(-400 * u, -70 * u, 90 * u, 90 * u, 22 * u); g.fill(); txt("✓", -355 * u, -24 * u, { size: 56 * u, weight: 900, color: C.ink });
      txt("Client · now", -280 * u, -56 * u, { size: 28 * u, weight: 600, color: "#777", align: "left" }); txt("Approved! 😍 Launching Monday.", -280 * u, -6 * u, { size: 40 * u, weight: 700, color: C.ink, align: "left" });
      txt("Can we do the festive set next?", -280 * u, 48 * u, { size: 32 * u, weight: 500, color: "#444", align: "left" }); g.restore(); }
    capPill(t, voChunk(t, 4, 0.5), H * 0.765, { size: 64 * u, bg: "rgba(255,255,255,0.95)", color: C.ink, hi: "#d6339a" });
    grain(t, 0.04);
  },
};
