// R05 · "THEY PROMPT." — kinetic creator edit (style ref 5). Talking/UGC footage with single-word blue-box captions,
// huge white punch-in words, full-screen blue and white word cards with motion blur, a prompt-typing UI insert,
// the course site on screen, then a beat-cut hype reel. VO Liam (energetic). Music r05 (hype trap, 145 BPM).
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s, BL = "#1626ff";
const BEAT = 0.418, T_REEL = 30.256, REEL = [["giant_legs", "FASHION"], ["phone_store", "CGI"], ["boots", "CAMPAIGNS"], ["plane", "LAUNCHES"], ["surf", "PRODUCT"], ["tennis", "SPORT"], ["bottles", "BEVERAGE"], ["skyline", "ALL AI."]];
const T_END = T_REEL + REEL.length * 3 * BEAT;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "they-prompt",
  seqs: ["ugc2_talk", "ny_cross", "ugc_hi", "storm", "can_drop", "drop", "site", "vlog", ...REEL.map((r) => r[0])],
  music: { file: "build/music_el/r05.mp3", offset: 0, gain: -6, duck: -4, fadeOut: 0.8 },
  sfx: [["hit_punch", 0.25, -6], ["swoosh_fast", L[1].at - 0.1, -10], ["hit_punch", Wd(2, 5), -8], ["typing_fast", L[3].at + 0.3, -12], ["hit_punch", L[4].at, -8], ["pop", Wd(4, 2), -10],
        ...[0, 2, 4].map((i) => ["hit_punch", Wd(5, i) - 0.05, -9]), ["camera_flash", L[6].at + 0.6, -12], ["swoosh_fast", L[7].at - 0.1, -10], ["coin", Wd(8, 0), -10], ["coin", Wd(8, 2), -10],
        ["ui_click", Wd(9, 1), -6], ...REEL.map((r, i) => ["hit_punch", T_REEL + i * 3 * BEAT, -10]), ["hit_big", T_END, -6]],
  boxWord(t, y) {   // the single-word blue box caption (ref 5)
    let cur = null; L.forEach((l) => l.words.forEach((w, i) => { if (t >= w.s - 0.03) cur = { w, e: i + 1 < l.words.length ? l.words[i + 1].s : w.e + 0.3 }; }));
    if (!cur || t > cur.e + 0.05) return; const s = cur.w.w.replace(/[.,]/g, ""); font(48 * u, 800, F.tight); const w = tw(s) + 30 * u;
    g.fillStyle = BL; rr(CX - w / 2, y - 33 * u, w, 66 * u, 6 * u); g.fill(); txt(s, CX, y + 2 * u, { size: 48 * u, fam: F.tight, weight: 800, color: "#fff" });
  },
  foot(src, t, t0, d, o = {}) { g.save(); g.filter = o.f || "contrast(1.08)"; kb(seq(src, t, t0), t, t0, d, o.z0 || 1.04, o.z1 || 1.12, o.ax ?? 0.5, o.ay ?? 0.35); g.restore(); },
  card(colr, t) { bg(colr); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: BL, fg: "#fff", titleFam: F.tight, titleWeight: 800, titleSize: 110, button: { fill: "#fff", color: BL, shadow: "#000" }, cta: "Join now  →" }); return; }
    let li = 0; L.forEach((l, i) => { if (t >= l.at - 0.1) li = i; }); const t0 = L[li].at - 0.1;
    if (t >= T_REEL) { const j = Math.min(REEL.length - 1, Math.floor((t - T_REEL) / (3 * BEAT))), tj = T_REEL + j * 3 * BEAT; this.foot(REEL[j][0], t, tj, 3 * BEAT, { z0: 1.15, z1: 1.04 }); shade(H * 0.25, H * 0.75, 0.35);
      blurWord(REEL[j][1], CX, H * 0.5, Math.min(220 * u, fitSize(REEL[j][1], W * 0.9, 220 * u, 800, F.tight)), t, tj, { fam: F.tight, from: 1.5, dur: 0.22 }); grain(t, 0.04); return; }
    if (li === 0) { this.foot("ugc2_talk", t, 0, 3.4, { ay: 0.3 }); blurWord("STOP.", CX, 330 * u, 260 * u, t, 0.25, { fam: F.tight, from: 1.8, alpha: t < 1.1 ? 1 : 1 - prog(t, 1.1, 1.4) }); this.boxWord(t, 1240 * u); }
    else if (li === 1) { this.card(BL, t); blurWord("here's", CX, 900 * u, 230 * u, t, Wd(1, 0) - 0.05, { fam: F.tight, from: 1.6 }); blurWord("what nobody tells you", CX, 1080 * u, 56 * u, t, Wd(1, 1) - 0.05, { fam: F.tight, weight: 500, from: 1.2 }); }
    else if (li === 2) { this.foot("ny_cross", t, t0, 3.0); this.boxWord(t, 1240 * u); if (t >= Wd(2, 5) - 0.05) blurWord("DON'T SHOOT.", CX, 380 * u, fitSize("DON'T SHOOT.", W * 0.9, 150 * u, 800, F.tight), t, Wd(2, 5) - 0.05, { fam: F.tight, from: 1.6 }); }
    else if (li === 3) { bg("#ffffff"); blurWord("prompt.", CX, 700 * u, 240 * u, t, Wd(3, 1) - 0.05, { fam: F.tight, color: BL, from: 1.5 });
      const bp = oC(prog(t, t0 + 0.2, t0 + 0.5)); g.save(); g.globalAlpha = bp; g.fillStyle = "#16171b"; rr(110 * u, 900 * u, W - 220 * u, 360 * u, 28 * u); g.fill(); g.restore();
      txt("NEW PROMPT", 160 * u, 960 * u, { size: 22 * u, fam: F.mono, weight: 700, color: "#7f8cff", align: "left", alpha: bp, ls: 3 });
      typeText(t, "a lime soda can, mid-splash, hard studio light, macro, 85mm", 160 * u, 1030 * u, t0 + 0.4, 60, { size: 36 * u, fam: F.tight, color: "#fff", maxW: W - 340 * u, lh: 1.4, caretColor: "#7f8cff" }); }
    else if (li === 4) { bg("#0b0b0f"); const n = Math.round(lerp(1, 50, oC(prog(t, Wd(4, 2) - 0.1, Wd(4, 3) + 0.4)))); const cols = 5, cw = (W - 120 * u) / cols;
      if (t < Wd(4, 2) - 0.1) vcard(seq("can_drop", t, t0), CX - 260 * u, 520 * u, 520 * u, 700 * u, { r: 24 * u, shadow: 50 });
      else for (let i = 0; i < Math.min(n, 20); i++) { const c = i % cols, r = Math.floor(i / cols); vcard(seq("can_drop", t - i * 0.07, t0), 60 * u + c * cw + 6 * u, 380 * u + r * cw * 1.2, cw - 12 * u, cw * 1.2 - 12 * u, { r: 10 * u, shadow: false, filter: `hue-rotate(${i * 37}deg) saturate(${1 + (i % 3) * 0.2})` }); }
      g.fillStyle = BL; rr(CX - 230 * u, 1480 * u, 460 * u, 110 * u, 14 * u); g.fill(); txt(n === 1 ? "1 PHOTO" : `${n} ADS`, CX, 1537 * u, { size: 70 * u, fam: F.tight, weight: 800, color: "#fff" });
      blurWord(t < Wd(4, 2) - 0.1 ? "ONE PHOTO." : "FIFTY ADS.", CX, 250 * u, 120 * u, t, t < Wd(4, 2) - 0.1 ? Wd(4, 0) - 0.05 : Wd(4, 2) - 0.05, { fam: F.tight }); }
    else if (li === 5) { const sub = [["ugc_hi", Wd(5, 0)], ["storm", Wd(5, 2)], ["can_drop", Wd(5, 4)]], j = sub.reduce((a, s, i) => (t >= s[1] - 0.1 ? i : a), 0), tj = sub[j][1] - 0.1;
      this.foot(sub[j][0], t, tj, 1.6, { ay: j === 0 ? 0.3 : 0.45, z0: 1.12, z1: 1.04 }); if (t - tj < 0.35) { g.fillStyle = `rgba(255,120,30,${0.45 * (1 - (t - tj) / 0.35)})`; g.fillRect(0, 0, W, H); }
      blurWord(["AI CREATORS", "AI FILMS", "AI PRODUCT SHOOTS"][j], CX, 420 * u, Math.min(130 * u, fitSize(["AI CREATORS", "AI FILMS", "AI PRODUCT SHOOTS"][j], W * 0.88, 130 * u, 800, F.tight)), t, tj, { fam: F.tight }); }
    else if (li === 6) { this.foot("drop", t, t0, 2.4, { ay: 0.4 }); this.boxWord(t, 1240 * u); if (t >= Wd(6, 3) - 0.05) blurWord("REAL.", CX, 420 * u, 230 * u, t, Wd(6, 3) - 0.05, { fam: F.tight, from: 1.7 }); }
    else if (li === 7) { bg("#ffffff"); blurWord("everything.", CX, 300 * u, 150 * u, t, Wd(7, 3) - 0.05, { fam: F.tight, color: BL });
      phoneMock(seq("site", t, t0), CX, 1050 * u, 470 * u, t); }
    else if (li === 8) { this.card(BL, t); const a = Math.round(11 * oC(prog(t, Wd(8, 0) - 0.05, Wd(8, 1)))), b = Math.round(41 * oC(prog(t, Wd(8, 2) - 0.05, Wd(8, 3) + 0.2)));
      blurWord(String(a), CX, 640 * u, 300 * u, t, Wd(8, 0) - 0.05, { fam: F.tight }); txt("modules", CX, 820 * u, { size: 60 * u, fam: F.tight, weight: 500, color: "#fff", alpha: clamp((t - Wd(8, 1)) * 3) });
      if (t >= Wd(8, 2) - 0.05) { blurWord(String(b), CX, 1120 * u, 300 * u, t, Wd(8, 2) - 0.05, { fam: F.tight }); txt("lessons", CX, 1300 * u, { size: 60 * u, fam: F.tight, weight: 500, color: "#fff", alpha: clamp((t - Wd(8, 3)) * 3) }); } }
    else { this.foot("vlog", t, t0, 2.4, { ay: 0.3 }); this.boxWord(t, 1100 * u); joinButton(t, Wd(9, 0) - 0.1, CX, 1400 * u, "Join now", { fill: "#fff", color: BL, glow: "rgba(22,38,255,0.6)", tapAt: 0.25 }); }
    grain(t, 0.04);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: L[6].at - 0.1, kicker: "STOP SHOOTING. START PROMPTING.", h1: "They", h2: "prompt.", f1: F.tight, s1: "", f2: F.tight, accent: "#ffffff", btn: "#ffffff", glow: "rgba(22,38,255,0.7)", scrim: "rgba(22,38,255,0.78)",
  end: { bg: BL, fg: "#fff", titleFam: F.tight, titleWeight: 800, titleSize: 110, button: { fill: "#fff", color: BL, shadow: "#000" } } });
