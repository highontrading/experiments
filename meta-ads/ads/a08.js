// A08 · "Departures" (English, 9:16, no VO). An airport split-flap board lists the 11 modules as flights,
// then flips to "NOW BOARDING: AI & ADVERTISING $29". Captions: split-flap characters, amber on black.
const MODS = [["AI01", "NEW AD PLAYBOOK", "L1"], ["AI02", "BRIEF + BIG IDEA", "L1"], ["AI03", "PRODUCT SHOTS", "L1"], ["AI04", "MODELS + SETS", "L1"],
  ["AI05", "VIDEO ADS + FILMS", "L2"], ["AI06", "VOICE + MUSIC", "L2"], ["AI07", "AI UGC CREATORS", "L2"], ["AI08", "META ADS TESTING", "L3"],
  ["AI09", "EDIT + END CARDS", "L3"], ["AI10", "HYBRID SHOOT + AI", "L3"], ["AI11", "CAPSTONE CAMPAIGN", "L3"]];
const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+&$.·-";
const T_BOARD = 0.8, T_FINAL = 9.4, T_END = 12.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "departures-board",
  music: { file: "build/music/132.mp3", offset: 4, gain: -12, fadeOut: 0.8 },
  sfx: [["flap", T_BOARD, -8], ["flap", T_BOARD + 1.0, -12], ["flap", T_BOARD + 2.2, -12], ["flap", T_FINAL, -6], ["flap", T_FINAL + 0.6, -10], ["notif", T_FINAL + 1.6, -10], ["whoosh", T_END - 0.1, -12]],
  cell(x, y, w, h, target, t, t0, seed) {   // one split-flap cell flipping toward `target`
    const flips = 6 + Math.floor(rnd(seed) * 10), dt = 0.045, k = Math.floor((t - t0) / dt);
    let ch = " ";
    if (t >= t0) ch = k >= flips ? target : CH[(Math.floor(rnd(seed * 7 + k) * CH.length))];
    const mid = t >= t0 && k < flips && ((t - t0) % dt) / dt < 0.5;
    g.fillStyle = "#171717"; rr(x, y, w, h, 5 * u); g.fill();
    g.fillStyle = "#222"; rr(x, y, w, h / 2, 5 * u); g.fill();
    txt(ch, x + w / 2, y + h / 2 + 2 * u, { size: h * 0.78, weight: 400, fam: F.bebas, color: ch === " " ? "#000" : C.yellow, alpha: mid ? 0.6 : 1 });
    g.fillStyle = "#000"; g.fillRect(x, y + h / 2 - 1.5 * u, w, 3 * u);
  },
  row(s, x, y, n, t, t0, seed, cw = 38 * u, chh = 60 * u) {
    const str = s.padEnd(n).slice(0, n);
    for (let i = 0; i < n; i++) this.cell(x + i * (cw + 4 * u), y, cw, chh, str[i], t, t0 + i * 0.025, seed * 31 + i);
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", button: { fill: C.yellow }, cta: "Board now  →" }); grain(t, 0.06); return; }
    bg("#0b0b0b");
    const hp = oC(prog(t, 0, 0.5));
    txt("✈  DEPARTURES", 60 * u, 200 * u, { size: 74 * u, weight: 400, fam: F.bebas, color: "#fff", align: "left", alpha: hp, ls: 4 });
    txt("IDEABRO STUDIO · TERMINAL AI", W - 60 * u, 208 * u, { size: 22 * u, fam: F.mono, color: "#9a9a9a", align: "right", alpha: hp });
    txt("FLIGHT", 60 * u, 300 * u, { size: 22 * u, fam: F.mono, color: "#777", align: "left", alpha: hp });
    txt("DESTINATION", 290 * u, 300 * u, { size: 22 * u, fam: F.mono, color: "#777", align: "left", alpha: hp });
    txt("GATE", W - 140 * u, 300 * u, { size: 22 * u, fam: F.mono, color: "#777", align: "left", alpha: hp });
    if (t < T_FINAL) {
      MODS.forEach(([code, dest, gate], i) => {
        const y = 340 * u + i * 92 * u, t0 = T_BOARD + i * 0.22;
        this.row(code, 60 * u, y, 4, t, t0, i + 1, 40 * u, 62 * u);
        this.row(dest, 250 * u, y, 17, t, t0 + 0.1, i + 50, 36 * u, 62 * u);
        this.row(gate, W - 140 * u, y, 2, t, t0 + 0.2, i + 90, 36 * u, 62 * u);
      });
      // a status line that cycles
      const st = t < 5.5 ? "11 MODULES  41 LESSONS" : "SELF-PACED  LIFETIME";
      this.row(st, 60 * u, 1400 * u, 22, t, t < 5.5 ? 3.6 : 5.5, 200, 40 * u, 66 * u);
      txt("L1 THE IMAGE · L2 MOTION & SOUND · L3 THE AGENCY STANDARD", CX, 1520 * u, { size: 24 * u, fam: F.mono, color: "#8a8a8a", alpha: oC(prog(t, 4.2, 4.8)) });
    } else {
      txt("NOW BOARDING", CX, 520 * u, { size: 44 * u, fam: F.mono, weight: 700, color: C.lime, alpha: (FR(t) % 30 < 20) ? 1 : 0.4 });
      this.row("AI & ADVERTISING", 90 * u, 640 * u, 16, t, T_FINAL, 300, 52 * u, 92 * u);
      this.row("FARE $29  WAS $99", 90 * u, 790 * u, 16, t, T_FINAL + 0.5, 400, 52 * u, 92 * u);
      this.row("GATE: ENROLL NOW", 90 * u, 940 * u, 16, t, T_FINAL + 1.0, 500, 52 * u, 92 * u);
      txt("One ticket. Every module. Lifetime access.", CX, 1180 * u, { size: 40 * u, weight: 600, color: "#fff", alpha: oC(prog(t, T_FINAL + 1.8, T_FINAL + 2.3)) });
    }
    grain(t, 0.06);
  },
};
