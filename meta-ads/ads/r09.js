// R09 · "THE FUTURE OF ADVERTISING HAS STARTED" — brand motion (style ref 9). Black / hot pink / purple; Kanit 800 headlines
// with a purple outlined key word; a sticker-badge flood with footage inside; a purple folder card with typing + cursor;
// pink vertical bar wipes; "Ready?" echo stack; logo reveal; "Welcome to the new chapter." Music r09 (124 BPM brand anthem).
const B = 0.4877, Z = 1.509, at = (n) => Z + n * B;
const S = [0, Z, at(8), at(16), at(26), at(30), at(38), at(46), at(54), at(62), at(68), at(76), at(86)], T_END = S[12];
const PINK = "#ff1f8f", PUR = "#5b3df5", CRM = "#ede6d6", K = "#0f0f10";
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "future-has-started",
  seqs: ["surf", "falls", "ny_strut", "studio", "carwin_run", "can_drop", "sky_girl", "clouds", "boots", "fly_blue", "smile", "nk_heels", "city_girl", "tennis"],
  music: { file: "build/music_el/r09.mp3", offset: 0, gain: -6, fadeOut: 1.0 },
  sfx: [["swoosh_fast", 0.05, -8], ...S.slice(1, 12).map((s) => ["hit_punch", s, -10]), ...[0, 1, 2, 3, 4, 5].map((i) => ["pop", S[2] + 0.2 + i * 0.25, -12]), ["typing_fast", S[3] + 0.3, -12], ["ui_click", S[3] + 2.4, -6],
        ["riser_short", S[5] - 2.0, -10], ["bass_drop", S[5], -6], ["swoosh_fast", S[6] - 0.1, -10], ["swoosh_fast", S[9] - 0.1, -10], ["ui_click", S[11] + 1.6, -6], ["hit_big", T_END, -6]],
  line(s, x, y, size, t, t0, o = {}) { const p = oC(clamp((t - t0) / 0.35)); if (p <= 0) return; g.save(); g.beginPath(); g.rect(0, y - size * 0.75, W, size * 1.5); g.clip();
    if (o.outline) { font(size, 800, F.kanit); g.textAlign = o.align || "left"; g.textBaseline = "middle"; g.lineWidth = 3 * u; g.strokeStyle = o.color || PUR; g.globalAlpha = p; g.strokeText(s, x, y + (1 - p) * size); }
    else txt(s, x, y + (1 - p) * size, { size, fam: F.kanit, weight: o.w || 800, color: o.color || "#fff", align: o.align || "left" }); g.restore(); },
  badge(cx, cy, r, rot, col, src, t) { g.save(); g.translate(cx, cy); g.rotate(rot); g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    if (src) { g.save(); g.beginPath(); g.arc(0, 0, r * 0.62, 0, 7); g.clip(); cover(seq(src, t, 0), -r * 0.62, -r * 0.62, r * 1.24, r * 1.24, 1.1); g.restore(); }
    else { g.save(); g.rotate(-rot); txt("AI&ADS", 0, 4 * u, { size: r * 0.27, fam: F.kanit, weight: 800, color: col === CRM ? PUR : "#fff" }); g.restore(); }
    font(r * 0.16, 800, F.kanit); const s = "AI & ADVERTISING · AI & ADVERTISING · "; for (let i = 0; i < s.length; i++) { const a = (i / s.length) * Math.PI * 2; g.save(); g.rotate(a); g.translate(0, -r * 0.82);
      txt(s[i], 0, 0, { size: r * 0.16, fam: F.kanit, weight: 800, color: col === CRM ? PUR : "#fff" }); g.restore(); } g.restore(); },
  card(src, x, y, w, h, t, t0, o = {}) { const p = oB(clamp((t - t0) / 0.35)); if (p <= 0) return; vcard(seq(src, t, t0), x, y, w, h, { r: 28 * u, border: o.border || PINK, bw: 10 * u, s: p, rot: o.rot || 0, ay: o.ay ?? 0.4 }); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: K, fg: "#fff", titleFam: F.kanit, titleWeight: 800, titleSize: 110, button: { fill: PINK, color: "#fff", shadow: PUR }, cta: "Join now  →" }); return; }
    const k = cutIdx(t, S.slice(0, 12)), t0 = S[k]; bg(K);
    if (k === 0) { bg(PINK); const r = lerp(1400 * u, 0, oC(prog(t, 0.2, Z))); g.fillStyle = K; g.beginPath(); g.arc(-200 * u, 600 * u, Math.max(0, 1600 * u - r), 0, 7); g.fill(); }
    else if (k === 1) { this.line("THE FUTURE", 110 * u, 760 * u, 120 * u, t, t0); this.line("OF", 110 * u, 890 * u, 120 * u, t, t0 + 2 * B); this.line("ADVERTISING", 300 * u, 890 * u, 120 * u, t, t0 + 3 * B, { outline: true });
      this.line("HAS STARTED.", 110 * u, 1020 * u, 120 * u, t, t0 + 5 * B); }
    else if (k === 2) { const items = [[290, 560, 190, -0.2, PINK, "surf"], [790, 600, 190, 0.3, PUR, null], [290, 970, 190, 0.1, CRM, null], [790, 1010, 190, 0.4, PINK, "falls"], [290, 1380, 190, -0.3, PUR, null], [790, 1420, 190, 0.2, CRM, "ny_strut"]];
      items.forEach(([x, y, r, rot, c, s2], i) => { const p = oB(clamp((t - t0 - 0.2 - i * 0.25) / 0.3)); if (p > 0) this.badge(x * u, y * u, r * u * p, rot + t * 0.3 * (i % 2 ? 1 : -1), c, s2, t); }); }
    else if (k === 3) { const p = oB(clamp((t - t0) / 0.35)); g.save(); g.translate(CX, 880 * u); g.scale(p, p); g.fillStyle = PUR; rr(-420 * u, -260 * u, 840 * u, 520 * u, 34 * u); g.fill(); rr(-420 * u, -320 * u, 340 * u, 120 * u, 30 * u); g.fill(); g.restore();
      typeText(t, "Five years ago,\nan ad needed\na studio…", CX - 360 * u, 740 * u, t0 + 0.3, 22, { size: 74 * u, fam: F.kanit, weight: 800, color: "#fff", lh: 1.15, caretColor: PINK, maxW: 740 * u });
      const cx2 = lerp(CX + 500 * u, CX - 40 * u, oC(prog(t, t0 + 1.6, t0 + 2.3))), cy2 = lerp(1500 * u, 1000 * u, oC(prog(t, t0 + 1.6, t0 + 2.3))), press = t > t0 + 2.4 && t < t0 + 2.6 ? 0.85 : 1;
      if (t > t0 + 2.4) { const rp = prog(t, t0 + 2.4, t0 + 3.0); g.strokeStyle = `rgba(255,255,255,${1 - rp})`; g.lineWidth = 4 * u; g.beginPath(); g.arc(cx2, cy2, 80 * u * rp, 0, 7); g.stroke(); }
      if (t > t0 + 2.6) this.card("studio", CX - 300 * u, 1180 * u, 600 * u, 420 * u, t, t0 + 2.6, { border: CRM });
      g.save(); g.translate(cx2, cy2); g.scale(press, press); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70 * u); g.lineTo(18 * u, 54 * u); g.lineTo(32 * u, 84 * u); g.lineTo(44 * u, 78 * u); g.lineTo(30 * u, 48 * u); g.lineTo(54 * u, 48 * u); g.closePath(); g.fill(); g.strokeStyle = K; g.lineWidth = 3 * u; g.stroke(); g.restore(); }
    else if (k === 4) { this.line("Today,", 110 * u, 820 * u, 90 * u, t, t0, { w: 500 }); this.line("it needs", 110 * u, 930 * u, 120 * u, t, t0 + B); this.line("an idea.", 110 * u, 1060 * u, 140 * u, t, t0 + 2 * B, { color: PINK }); }
    else if (k === 5) { this.line("one photo", 110 * u, 330 * u, 100 * u, t, t0); this.line("→ a whole campaign.", 110 * u, 450 * u, 76 * u, t, t0 + B, { color: PINK });
      this.card("can_drop", 80 * u, 600 * u, 450 * u, 640 * u, t, t0 + 0.2, { rot: -0.04 }); this.card("sky_girl", 560 * u, 640 * u, 440 * u, 600 * u, t, t0 + 0.6, { rot: 0.04, border: PUR }); this.card("clouds", 300 * u, 1180 * u, 480 * u, 420 * u, t, t0 + 1.0, { rot: 0.02, border: CRM }); }
    else if (k === 6) { bg(CRM); const wp = oC(prog(t, t0, t0 + 0.35)); g.fillStyle = PINK; g.fillRect(W - 180 * u, lerp(H, 1100 * u, wp), 120 * u, H);
      this.line("It's more than", 100 * u, 620 * u, 74 * u, t, t0 + 0.2, { color: K, w: 500 }); this.line("a new tool.", 100 * u, 720 * u, 96 * u, t, t0 + 0.5, { color: K });
      this.line("It's a new way", 100 * u, 1100 * u, 74 * u, t, t0 + 1.6, { color: K, w: 500 }); this.line("of making ads.", 100 * u, 1200 * u, 96 * u, t, t0 + 1.9, { color: K }); }
    else if (k === 7) { this.line("Now we're faster,", CX, 780 * u, 84 * u, t, t0, { align: "center" }); this.line("bolder,", CX, 890 * u, 84 * u, t, t0 + B, { align: "center" }); this.line("more creative.", CX, 1000 * u, 84 * u, t, t0 + 2 * B, { align: "center" });
      this.line("And above all,", CX, 1180 * u, 40 * u, t, t0 + 4 * B, { align: "center", w: 500 }); this.line("AUTHENTIC.", CX, 1250 * u, 52 * u, t, t0 + 5 * B, { align: "center" }); g.fillStyle = PINK; g.fillRect(CX - 170 * u, 1290 * u, 340 * u * oC(prog(t, t0 + 5.5 * B, t0 + 7 * B)), 8 * u); }
    else if (k === 8) { const sub = ["boots", "fly_blue", "smile", "nk_heels"], j = Math.min(3, Math.floor((t - t0) / (2 * B))), tj = t0 + j * 2 * B;
      vcard(seq(sub[j], t, tj), 70 * u, 330 * u, W - 140 * u, 1260 * u, { r: 40 * u, border: [PINK, PUR, CRM, PINK][j], bw: 12 * u, s: lerp(1.06, 1, oC(clamp((t - tj) / 0.3))), ay: 0.35 });
      txt(["CAMPAIGNS", "FILMS", "BEAUTY", "FASHION"][j], CX, 1670 * u, { size: 70 * u, fam: F.kanit, weight: 800, color: "#fff" }); }
    else if (k === 9) { bg(PINK); for (let i = 4; i >= 0; i--) { const y = 700 * u + i * 110 * u, p = oC(clamp((t - t0 - i * 0.12) / 0.35)); if (p <= 0) continue; font(150 * u, 800, F.kanit);
        if (i === 0) txt("Ready?", CX, y, { size: 150 * u, fam: F.kanit, weight: 800, color: "#fff", alpha: p }); else { g.save(); g.globalAlpha = p * (1 - i * 0.15); g.textAlign = "center"; g.textBaseline = "middle"; g.strokeStyle = "#fff"; g.lineWidth = 2.5 * u; g.strokeText("Ready?", CX, y); g.restore(); } } }
    else if (k === 10) { bg(CRM); const p = oB(clamp((t - t0) / 0.4)); g.save(); g.translate(CX, 820 * u); g.scale(p, p); logo(0, 0, 230 * u, "ink"); g.restore();
      const q = clamp((t - t0 - 0.5) / 0.9); font(120 * u, 400, F.dms, "italic"); const w = tw("AI & Advertising"); g.save(); g.beginPath(); g.rect(CX - w / 2 - 20 * u, 980 * u, (w + 40 * u) * q, 220 * u); g.clip();
      txt("AI & Advertising", CX, 1090 * u, { size: 120 * u, fam: F.dms, style: "italic", weight: 400, color: K }); g.restore(); }
    else { const wp = oC(prog(t, t0, t0 + 0.4)); g.fillStyle = PINK; g.fillRect(CX - 160 * u, lerp(H, 0, wp), 320 * u, H); this.card("city_girl", CX - 260 * u, 330 * u, 520 * u, 560 * u, t, t0 + 0.2, { border: CRM, ay: 0.4 });
      this.line("Welcome to the", CX, 1040 * u, 80 * u, t, t0 + 0.4, { align: "center" }); this.line("new chapter!", CX, 1140 * u, 104 * u, t, t0 + 0.7, { align: "center" });
      joinButton(t, t0 + 1.0, CX, 1380 * u, "Join now", { fill: CRM, color: K, glow: "rgba(255,31,143,0.6)", tapAt: 0.6 }); }
    grain(t, 0.03);
  },
};
if (window.META) window.AD = metaWrap(window.AD, { cut: S[6], kicker: "THE FUTURE OF ADVERTISING", h1: "has", h2: "started.", f1: F.kanit, s1: "", f2: F.kanit, accent: PINK, btn: PINK, glow: "rgba(255,31,143,0.6)", scrim: "rgba(15,15,16,0.8)",
  end: { bg: K, fg: "#fff", titleFam: F.kanit, titleWeight: 800, titleSize: 110, button: { fill: PINK, color: "#fff", shadow: PUR } } });
