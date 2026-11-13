// A13 · "POV: client bolta hai..." (Hinglish, 9:16, no VO — meme format). White caption bar on top, footage below.
// Captions: meme top-bar (black Inter on white). Music: comic funk.
const PANELS = [  // [t0, t1, top text, seq or "grid", sub]
  [0, 4.3, "POV: client bolta hai “Monday tak 30 ad variations chahiye”", "stress"],
  [4.3, 8.3, "Purana tareeka: 30 variations = 3 shoots, 2 hafte, 1 bada bill", "frust"],
  [8.3, 10.4, "AI & Advertising seekhne ke baad:", "calm"],
  [10.4, 13.6, "30 variations. Ek din mein. Bina shoot ke.", "grid"],
];
const T_END = 13.6;
const THUMBS = ["i31", "i32", "i33", "i34", "i35", "i36", "i37", "i38", "i39", "i41", "i00", "i12", "i18", "i19", "i21", "i22", "i24", "i30", "i04", "i06"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "pov-30-variations_hinglish",
  images: Object.fromEntries(THUMBS.map((s) => [s, `assets/img/site/${s}.jpg`])),
  seqs: ["stress", "frust", "calm"],
  music: { file: "build/music/1140.mp3", offset: 0, gain: -8, fadeOut: 0.8 },
  sfx: [["notif", 0.3, -6], ["notif", 1.2, -8], ["boom", 4.3, -10], ["shimmer", 8.3, -10], ...Array.from({ length: 30 }, (_, k) => ["pop", 10.5 + k * 0.07, -18]), ["register", 12.8, -8], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#fff", fg: C.ink, strike: "#9a9a9a", cta: "Seekho abhi  →" }); grain(t, 0.03); return; }
    bg("#fff");
    const P = PANELS.filter((p) => t >= p[0]).pop();
    const bar = 520 * u;
    // footage area
    g.save(); g.beginPath(); g.rect(0, bar, W, H - bar); g.clip();
    if (P[3] === "grid") {
      bg("#111"); const cols = 5, cw = W / cols, chh = cw * 1.25;
      for (let k = 0; k < 30; k++) { const st = 10.5 + k * 0.07; if (t < st) continue; const p = oB(clamp((t - st) / 0.2)); const x = (k % cols) * cw, y = bar + Math.floor(k / cols) * chh;
        g.save(); g.translate(x + cw / 2, y + chh / 2); g.scale(p, p); g.beginPath(); g.rect(-cw / 2 + 3 * u, -chh / 2 + 3 * u, cw - 6 * u, chh - 6 * u); g.clip(); cover(IM[THUMBS[k % THUMBS.length]], -cw / 2, -chh / 2, cw, chh, 1.1 + 0.15 * rnd(k), rnd(k + 1), rnd(k + 2)); g.restore(); }
      const n = Math.min(30, Math.max(0, Math.floor((t - 10.5) / 0.07) + 1));
      g.fillStyle = n >= 30 ? "#1b7f3a" : C.ink; rr(CX - 220 * u, H - 330 * u, 440 * u, 110 * u, 55 * u); g.fill();
      txt(`${n}/30 ${n >= 30 ? "✓" : ""}`, CX, H - 274 * u, { size: 60 * u, weight: 900, color: "#fff" });
    } else cover(seq(P[3], t, P[0], { loop: false }), 0, bar, W, H - bar, 1.05);
    if (P[3] === "frust") {   // little shoot counter
      const k = Math.min(3, 1 + Math.floor((t - P[0]) / 1.2)); g.fillStyle = "rgba(0,0,0,0.7)"; rr(60 * u, bar + 50 * u, 380 * u, 90 * u, 45 * u); g.fill();
      txt(`SHOOT ${k}/3 · DAY ${k * 4}`, 250 * u, bar + 96 * u, { size: 34 * u, fam: F.mono, weight: 700, color: "#ff6b6b" });
    }
    g.restore();
    // meme bar
    g.fillStyle = "#fff"; g.fillRect(0, 0, W, bar);
    const p = oC(clamp((t - P[0]) / 0.18)); font(64 * u, 800, F.inter); const lines = wrap(P[2], W * 0.86);
    lines.forEach((ln, i) => txt(ln, 60 * u, bar / 2 + (i - (lines.length - 1) / 2) * 80 * u + 30 * u, { size: 64 * u, weight: 800, color: "#000", align: "left", alpha: p }));
    txt("@ideabrostudio", 60 * u, 120 * u, { size: 26 * u, fam: F.mono, color: "#999", align: "left" });
    grain(t, 0.03);
  },
};
