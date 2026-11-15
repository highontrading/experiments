// C03 · "The search" (English, 9:16, music only). A search bar types the question every marketer has; autocomplete
// lands on "with AI"; the result is the course, with image results and a "people also ask" answer.
// Captions: the search UI itself (Inter, typed), plus one final ink headline.
const Q1 = "how to make product photos without a", SUG = ["photographer", "studio", "budget", "with AI"], Q2 = "is it hard to learn AI ads";
const T_SUG = 2.7, T_SEL = 4.6, T_RES = 5.0, T_PAA = 8.4, T_Q2 = 10.6, T_ANS = 12.6, T_END = 15.4, IMS = ["i35", "i38", "i22", "i00", "i32", "i12"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "the-search",
  images: Object.fromEntries(IMS.map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/search.mp3", offset: 0, gain: -11, fadeOut: 0.8 },
  sfx: [["searchtype", 0.3, -12], ["searchtype", 1.6, -12], ["tick", T_SUG + 0.5, -14], ["tick", T_SUG + 0.9, -14], ["tick", T_SUG + 1.3, -14], ["pop", T_SEL, -10], ["whoosh", T_RES, -14], ["pop", T_PAA + 0.8, -12], ["searchtype", T_Q2 + 0.1, -12], ["ding", T_ANS, -12], ["whoosh", T_END - 0.1, -12]],
  bar(y, text, caret, t) { g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.12)"; g.shadowBlur = 30 * u; rr(60 * u, y - 60 * u, W - 120 * u, 120 * u, 60 * u); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = "#999"; g.lineWidth = 5 * u; g.beginPath(); g.arc(130 * u, y - 6 * u, 20 * u, 0, 7); g.moveTo(144 * u, y + 8 * u); g.lineTo(160 * u, y + 24 * u); g.stroke();
    font(38 * u, 500, F.inter); const shown = text; const lines = [shown]; let s = shown; while (tw(s) > W - 320 * u) s = s.slice(1); txt(s, 190 * u, y + 2 * u, { size: 38 * u, weight: 500, color: "#222", align: "left" });
    if (caret && FR(t) % 16 < 9) { g.fillStyle = "#1a73e8"; g.fillRect(190 * u + tw(s) + 4 * u, y - 24 * u, 3 * u, 50 * u); } },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#f6f7f9", fg: C.ink, cta: "Start learning  →" }); return; }
    bg("#f6f7f9");
    if (t < T_RES) {
      txt("search", CX, 640 * u, { size: 110 * u, fam: F.grot, weight: 700, color: "#222", alpha: 0.9 });
      const n = Math.floor(clamp((t - 0.3) * 17, 0, Q1.length)); const sel = t >= T_SEL; this.bar(800 * u, sel ? Q1.replace(" a", "") + " with AI" : Q1.slice(0, n), !sel, t);
      if (t >= T_SUG && !sel) { const hk = clamp(Math.floor((t - T_SUG - 0.5) / 0.4), -1, 3); g.fillStyle = "#fff"; rr(60 * u, 880 * u, W - 120 * u, 4 * 110 * u + 30 * u, 30 * u); g.fill();
        SUG.forEach((s, i) => { const y = 950 * u + i * 110 * u; if (i === hk) { g.fillStyle = "#eef3fd"; g.fillRect(60 * u, y - 52 * u, W - 120 * u, 104 * u); }
          const pre = i === 3 ? "how to make product photos " : "...without a "; txt(pre, 120 * u, y, { size: 36 * u, weight: 400, color: "#555", align: "left" }); font(36 * u, 400, F.inter); const pw = tw(pre);
          txt(s, 120 * u + pw, y, { size: 36 * u, weight: 800, color: i === 3 ? "#1a73e8" : "#222", align: "left" }); }); }
    } else if (t < T_Q2) {
      const sp = oC(prog(t, T_RES, T_RES + 0.4)); g.save(); g.translate(0, (1 - sp) * 60 * u); g.globalAlpha = sp;
      this.bar(240 * u, "how to make product photos with AI", false, t);
      txt("About 1 result that matters", 80 * u, 360 * u, { size: 26 * u, color: "#777", weight: 500, align: "left" });
      txt("community.ideabrostudio.com › courses", 80 * u, 430 * u, { size: 28 * u, color: "#4d5156", weight: 500, align: "left" });
      txt("AI & Advertising — Ideabro Studio", 80 * u, 485 * u, { size: 50 * u, color: "#1a0dab", weight: 600, align: "left" });
      txt("Product shoots, video ads and Meta ads, made with AI.", 80 * u, 545 * u, { size: 30 * u, color: "#333", weight: 400, align: "left" });
      txt("11 modules · 41 lessons · lifetime access", 80 * u, 590 * u, { size: 30 * u, color: "#333", weight: 400, align: "left" });
      txt("Images", 80 * u, 690 * u, { size: 34 * u, color: "#222", weight: 700, align: "left" });
      IMS.forEach((k, i) => { const c = i % 3, r = Math.floor(i / 3), x = 80 * u + c * 312 * u, y = 730 * u + r * 330 * u, p = oB(clamp((t - T_RES - 0.3 - i * 0.12) / 0.3));
        g.save(); g.translate(x + 146 * u, y + 155 * u); g.scale(p, p); g.beginPath(); rr(-146 * u, -155 * u, 292 * u, 310 * u, 18 * u); g.clip(); cover(IM[k], -146 * u, -155 * u, 292 * u, 310 * u); g.restore(); });
      txt("All made with AI", 80 * u, 1430 * u, { size: 26 * u, color: "#777", weight: 500, align: "left" });
      if (t >= T_PAA) { const ex = oC(prog(t, T_PAA + 0.8, T_PAA + 1.1)); txt("People also ask", 80 * u, 1510 * u, { size: 34 * u, color: "#222", weight: 700, align: "left" });
        g.fillStyle = "#fff"; rr(60 * u, 1550 * u, W - 120 * u, 100 * u + ex * 90 * u, 20 * u); g.fill(); txt("Can I learn this without design skills?", 90 * u, 1600 * u, { size: 34 * u, color: "#222", weight: 600, align: "left" });
        txt("Yes. If you can type, you can direct.", 90 * u, 1680 * u, { size: 32 * u, color: "#1a73e8", weight: 700, align: "left", alpha: ex }); }
      g.restore();
    } else {
      const n = Math.floor(clamp((t - T_Q2 - 0.1) * 18, 0, Q2.length)); this.bar(700 * u, Q2.slice(0, n), t < T_ANS, t);
      if (t >= T_ANS) { const p = oB(clamp((t - T_ANS) / 0.35)); g.save(); g.translate(CX, 1000 * u); g.scale(p, p); txt("No.", 0, 0, { size: 260 * u, fam: F.grot, weight: 800, color: C.ink }); g.restore();
        txt("11 modules. Step by step. Self-paced.", CX, 1180 * u, { size: 42 * u, weight: 700, color: "#333", alpha: oC(prog(t, T_ANS + 0.4, T_ANS + 0.8)) });
        txt("Stop searching. Start making.", CX, 1300 * u, { size: 48 * u, weight: 800, color: "#1a73e8", alpha: oC(prog(t, T_ANS + 1.0, T_ANS + 1.4)) }); }
    }
  },
};
