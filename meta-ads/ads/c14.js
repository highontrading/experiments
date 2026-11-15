// C14 · "Cricket commentary" (Hinglish VO Jeet as commentator, 9:16). Every ad format is a ball: product shot goes for
// four, model lookbook and video ad go for six, and the campaign brings up a century — all without a shoot.
// Captions: broadcast commentary ribbon (white Inter Black on navy, yellow active word) + a TV score bug.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, Y = "#FFD43B", NAVY = "#0a1a3f";
const BALLS = [[0, "i35", "FOUR!", 4, "PRODUCT SHOT"], [1, "i00", "SIX!", 10, "MODEL LOOKBOOK"], [2, "ugc2", "SIX!", 16, "VIDEO AD"]];
const T_100 = L[3].at, T_CTA = L[4].at, T_END = L[4].v1 + 0.8, GRID = ["i35", "i38", "i22", "i00", "i32", "i21", "i12", "i19", "i24"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "cricket-commentary_hinglish",
  images: Object.fromEntries(GRID.map((k) => [k, `assets/img/site/${k}.jpg`])),
  seqs: ["ugc2"],
  music: { file: "build/music_el/cricket.mp3", offset: 0, gain: -13, duck: -7, fadeOut: 0.8 },
  sfx: [...BALLS.map((b) => ["bat", Wd(b[0], 2) - 0.1, -6]), ...BALLS.map((b) => ["cheer", Wd(b[0], 3), -14]), ["cheer", T_100 + 0.6, -10], ["powerup", T_100 + 0.6, -14], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: NAVY, fg: "#fff", button: { fill: Y, shadow: "#fff" }, cta: "Aap bhi khelo  →" }); grain(t, 0.03); return; }
    bg(NAVY);
    let k = -1; BALLS.forEach((b, i) => { if (t >= L[b[0]].at - 0.1) k = i; });
    let runs = 0; BALLS.forEach((b) => { if (t >= Wd(b[0], 3)) runs = b[3]; }); if (t >= T_100 + 0.6) runs = 100;
    if (t < T_100) {
      const [li, src, call, , lab] = BALLS[k], t0 = L[li].at - 0.1, hit = Wd(li, 2) - 0.1;
      g.save(); g.filter = t < hit ? "saturate(0.9)" : "saturate(1.1)"; kb(SRC(src, t, t0), t, t0, 4, t < hit ? 1.0 : 1.08, t < hit ? 1.06 : 1.16, src === "ugc2" ? 0.6 : 0.5, 0.35); g.restore();
      // ball streak at the hit
      if (t >= hit && t < hit + 0.5) { const p = prog(t, hit, hit + 0.5); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 14 * u * (1 - p); g.beginPath(); g.moveTo(CX, H * 0.7); g.lineTo(lerp(CX, W * 1.1, p), lerp(H * 0.7, H * 0.05, p)); g.stroke();
        g.fillStyle = "#c0392b"; g.beginPath(); g.arc(lerp(CX, W * 1.1, p), lerp(H * 0.7, H * 0.05, p), 22 * u, 0, 7); g.fill(); }
      flash(t, hit, 0.12);
      // replay tag + format label
      g.fillStyle = Y; rr(60 * u, 380 * u, 300 * u, 64 * u, 8 * u); g.fill(); txt(`BALL ${k + 1}  ·  REPLAY`, 210 * u, 413 * u, { size: 28 * u, weight: 900, color: NAVY });
      txt(lab, 60 * u, 500 * u, { size: 64 * u, fam: F.archivo, weight: 400, color: "#fff", align: "left", shadow: 14 });
      txt("MADE WITH AI · NO SHOOT", 60 * u, 560 * u, { size: 26 * u, fam: F.mono, weight: 700, color: "#fff", align: "left", shadow: 8, alpha: 0.9 });
      // FOUR / SIX burst
      if (t >= Wd(li, 3) - 0.05) { const p = oB(clamp((t - Wd(li, 3) + 0.05) / 0.3)); g.save(); g.translate(CX, 940 * u); g.rotate(-0.06); g.scale(p, p);
        for (let r = 0; r < 16; r++) { g.fillStyle = r % 2 ? Y : "#ff6b35"; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 330 * u, (r / 16) * 6.283 + t, ((r + 0.5) / 16) * 6.283 + t); g.fill(); }
        txt(call, 0, 10 * u, { size: 210 * u, fam: F.archivo, weight: 400, color: "#fff", stroke: NAVY, strokeW: 16 * u }); g.restore(); }
    } else {  // century: campaign grid + confetti
      const p = oC(prog(t, T_100, T_100 + 0.5)), cw = W / 3;
      GRID.forEach((im, i) => { const q = oB(clamp((t - T_100 - i * 0.07) / 0.3)), x = (i % 3) * cw, y = 300 * u + Math.floor(i / 3) * cw * 1.2; g.save(); g.translate(x + cw / 2, y + cw * 0.6); g.scale(q, q); g.beginPath(); g.rect(-cw / 2 + 4 * u, -cw * 0.6 + 4 * u, cw - 8 * u, cw * 1.2 - 8 * u); g.clip(); cover(IM[im], -cw / 2, -cw * 0.6, cw, cw * 1.2); g.restore(); });
      g.fillStyle = `rgba(10,26,63,${0.55 * p})`; g.fillRect(0, 0, W, H);
      if (t >= T_100 + 0.6) { const q = oB(clamp((t - T_100 - 0.6) / 0.35)); g.save(); g.translate(CX, 820 * u); g.scale(q, q); txt("100*", 0, 0, { size: 300 * u, fam: F.archivo, weight: 400, color: Y, stroke: NAVY, strokeW: 16 * u }); g.restore();
        txt("CAMPAIGN CENTURY · NO SHOOT", CX, 1000 * u, { size: 44 * u, weight: 900, color: "#fff", alpha: q });
        for (let c = 0; c < 70; c++) { const x = rnd(c) * W, y = ((t - T_100) * (300 + rnd(c + 1) * 500) * u + rnd(c + 2) * H) % H; g.fillStyle = [Y, "#ff6b35", "#fff", "#2ecc71"][c % 4]; g.save(); g.translate(x, y); g.rotate(t * 3 + c); g.fillRect(-8 * u, -4 * u, 16 * u, 8 * u); g.restore(); } }
    }
    // score bug (top)
    g.fillStyle = NAVY; rr(40 * u, 200 * u, 720 * u, 90 * u, 12 * u); g.fill(); g.fillStyle = Y; rr(40 * u, 200 * u, 150 * u, 90 * u, 12 * u); g.fill();
    txt("AI XI", 115 * u, 246 * u, { size: 38 * u, fam: F.archivo, weight: 400, color: NAVY }); txt(`${runs}/0`, 220 * u, 246 * u, { size: 48 * u, fam: F.archivo, weight: 400, color: "#fff", align: "left" });
    txt(`SHOOT BUDGET: ₹0`, 740 * u, 246 * u, { size: 24 * u, fam: F.mono, weight: 700, color: Y, align: "right" });
    // commentary ribbon (captions)
    g.fillStyle = "rgba(10,26,63,0.92)"; g.fillRect(0, H * 0.73 - 85 * u, W, 170 * u); g.fillStyle = Y; g.fillRect(0, H * 0.73 - 85 * u, 14 * u, 170 * u);
    txt("COMMENTARY", 50 * u, H * 0.73 - 55 * u, { size: 22 * u, fam: F.mono, weight: 700, color: Y, align: "left", ls: 3 });
    capPop(t, voChunk(t, 4, 0.4), H * 0.73 + 20 * u, { size: 62 * u, weight: 900, upper: false, hi: Y, color: "#fff", stroke: "rgba(0,0,0,0)", strokeW: 0, bounce: 0.5 });
    grain(t, 0.03);
  },
};
