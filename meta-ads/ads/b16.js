// B16 · "2019 vs 2026" (English, 9:16, music only). Real production footage on a worn VHS tape ("ads in 2019"),
// the tape ejects, then crisp AI footage ("ads in 2026"). Captions: JetBrains Mono white, same spot in both halves.
const P1 = [["studio", "Book the studio."], ["product", "Hire the crew."], ["set", "Wait two weeks."]], P2 = [["cafe", "Type the idea."], ["beach", "Direct the light."], ["cheetah", "Ship today."]];
const CS = 2.0, T_EJ = P1.length * CS, T2 = T_EJ + 0.8, T_LAST = T2 + P2.length * CS, T_END = T_LAST + 1.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "ads-2019-vs-2026",
  seqs: ["studio", "product", "set", "cafe", "beach", "cheetah"],
  music: { file: "build/music_el/synthwave.mp3", offset: 0, gain: -10, fadeOut: 0.8 },
  sfx: [["vhs", 0.0, -12], ["glitch", T_EJ, -8], ["vhs", T_EJ + 0.1, -10], ["boom", T2, -10], ...P2.slice(1).map((_, i) => ["whip", T2 + (i + 1) * CS, -14]), ["shimmer", T_LAST, -14], ["whoosh", T_END - 0.1, -12]],
  vhs(t) {
    g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.18; g.drawImage(cv, 8 * u, 0); g.restore();       // colour bleed
    g.fillStyle = "rgba(0,0,0,0.18)"; for (let y = 0; y < H; y += 5 * u) g.fillRect(0, y, W, 2 * u);                        // scanlines
    const by = ((t * 0.37) % 1) * H; g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, by, W, 60 * u);                    // tracking band
    for (let k = 0; k < 18; k++) { const y = by + rnd(FR(t) + k) * 60 * u; g.fillStyle = `rgba(255,255,255,${0.2 * rnd(k + FR(t))})`; g.fillRect(rnd(k * 3 + FR(t)) * W, y, 80 * u + rnd(k) * 200 * u, 2 * u); }
    vignette(0.6);
    const tc = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(FR(t) % 30).padStart(2, "0")}`;
    txt("PLAY ▶", 80 * u, 240 * u, { size: 52 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", shadow: 6 }); txt("SP  " + tc, W - 80 * u, 240 * u, { size: 40 * u, fam: F.mono, weight: 700, color: "#fff", align: "right", shadow: 6 });
    txt("JAN. 14 2019", 80 * u, H - 330 * u, { size: 44 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", shadow: 6 });
  },
  cap(t, s, t0, t1) { const a = Math.min(oC(prog(t, t0 + 0.1, t0 + 0.35)), 1 - prog(t, t1 - 0.15, t1)); capText(s, H * 0.7, a, prog(t, t0 + 0.1, t0 + 0.4), { size: 72 * u, fam: F.mono, weight: 700, shadow: 14, shadowColor: "rgba(0,0,0,0.8)", rise: 0.1 }); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b14", fg: "#fff", cta: "Make ads the 2026 way  →" }); grain(t, 0.04); return; }
    bg("#000");
    if (t < T_EJ) {
      const k = Math.floor(t / CS), t0 = k * CS; g.save(); g.filter = "saturate(0.7) contrast(1.1) brightness(0.95) blur(1.2px)"; kb(seq(P1[k][0], t, t0), t, t0, CS, 1.08, 1.1, 0.5, 0.45); g.restore();
      this.vhs(t); txt("ADS IN 2019", CX, 420 * u, { size: 88 * u, fam: F.mono, weight: 700, color: "#fff", shadow: 10 }); this.cap(t, P1[k][1], t0, t0 + CS);
      txt("REAL FOOTAGE", CX, 500 * u, { size: 26 * u, fam: F.mono, color: "#fff", alpha: 0.7, ls: 4 });
    } else if (t < T2) {   // eject: noise + STOP
      const id = g.createImageData(270, 480); for (let i = 0; i < id.data.length; i += 4) { const v = rnd(i * 0.13 + FR(t) * 7.7) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      const c2 = document.createElement("canvas"); c2.width = 270; c2.height = 480; c2.getContext("2d").putImageData(id, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c2, 0, 0, W, H); g.imageSmoothingEnabled = true;
      g.fillStyle = "rgba(0,0,40,0.5)"; g.fillRect(0, 0, W, H); txt(t < T_EJ + 0.45 ? "STOP ■" : "EJECT ⏏", CX, CY, { size: 110 * u, fam: F.mono, weight: 700, color: "#fff", shadow: 10 });
    } else if (t < T_LAST) {
      const k = Math.floor((t - T2) / CS), t0 = T2 + k * CS; kb(seq(P2[k][0], t, t0), t, t0, CS, 1.02, 1.08, 0.5, 0.45); flash(t, T2, 0.3);
      shade(H * 0.5, H, 0.78); shade(0, H * 0.3, 0.5, true);
      txt("ADS IN 2026", CX, 420 * u, { size: 88 * u, fam: F.mono, weight: 700, color: "#fff", shadow: 10 }); txt("MADE WITH AI", CX, 500 * u, { size: 26 * u, fam: F.mono, color: "#fff", alpha: 0.8, ls: 4 });
      this.cap(t, P2[k][1], t0, t0 + CS);
    } else {
      kb(seq("cheetah", t, T_LAST - CS), t, T_LAST - CS, CS + 1.8, 1.08, 1.12); g.fillStyle = `rgba(0,0,0,${0.6 * prog(t, T_LAST, T_LAST + 0.4)})`; g.fillRect(0, 0, W, H);
      capText("Same ad.\nNo tape. No studio.\nNo two-week wait.", CY, oC(prog(t, T_LAST, T_LAST + 0.3)), prog(t, T_LAST + 0.1, T_LAST + 0.9), { size: 66 * u, fam: F.mono, weight: 700, stagger: true, lh: 1.3 });
    }
    grain(t, 0.05);
  },
};
