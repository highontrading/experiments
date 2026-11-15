// C02 · "Breaking News" (Hinglish VO Neeraj as anchor, 9:16, shows price). A TV news bulletin: LIVE bug, footage
// window, red BREAKING bar, Hinglish headline lower-third and a scrolling ticker. Captions: the headline strip itself
// (white Inter Black on red/white bars), typed in per VO line.
const L = window.TL.lines, RED = "#d7191c", NAVY = "#0b1f4b";
const CLIP = [["cafe", "AI-GENERATED VISUALS"], ["studio", "FILE: TRADITIONAL SHOOT"], ["beach", "AI-GENERATED VISUALS"], ["tree", "AI-GENERATED VISUALS"], ["car", "AI-GENERATED VISUALS"]];
const HEAD = ["Brands ab bina shoot ke ads bana rahe hain", "Na studio, na crew, na model booking", "Sirf ek product photo + AI", "Yeh skill ab koi bhi seekh sakta hai", "AI & Advertising: sirf ₹2,999"];
const TICK = "AI & ADVERTISING BY IDEABRO STUDIO  •  11 MODULES  •  41 LESSONS  •  PRODUCT SHOOTS, VIDEO ADS, META ADS  •  ₹2,999 ONE-TIME  •  LIFETIME ACCESS  •  ";
const T_END = L[4].v1 + 0.8;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "breaking-news_hinglish",
  seqs: ["cafe", "studio", "beach", "tree", "car"],
  music: { file: "build/music_el/news.mp3", offset: 0, gain: -14, duck: -6, fadeOut: 0.8 },
  sfx: [["newssting", 0.0, -8], ...[1, 2, 3, 4].map((i) => ["whoosh", L[i].at - 0.1, -14]), ["register", L[4].words[L[4].words.length - 2].s, -12], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: NAVY, fg: "#fff", price: true, accent: "#fff", button: { fill: RED, color: "#fff", shadow: "#fff" }, cta: "Enroll karo  →" }); grain(t, 0.03); return; }
    bg("#0a1330");
    // studio backdrop
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#13265c"); gr.addColorStop(1, "#060c22"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 9; k++) { g.strokeStyle = "rgba(120,170,255,0.08)"; g.lineWidth = 2 * u; g.beginPath(); g.arc(W * 0.85, H * 0.2, (120 + k * 90) * u, 0, 7); g.stroke(); }
    let k = 0; L.forEach((l, i) => { if (t >= l.at - 0.1) k = i; }); const t0 = L[k].at - 0.1, [clip, tag] = CLIP[k];
    // footage window
    const fy = 330 * u, fh = 900 * u; g.save(); g.beginPath(); g.rect(0, fy, W, fh); g.clip(); kb(seq(clip, t, t0), t, t0, 4, 1.02, 1.08, 0.5, 0.45, 0, fy, W, fh);
    if (clip === "studio") { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, fy, W, fh); const sp = oC(prog(t, L[1].words[1].s, L[1].words[1].s + 0.3)); g.strokeStyle = RED; g.lineWidth = 18 * u; g.globalAlpha = sp;
      g.beginPath(); g.moveTo(CX - 200 * u, CY - 470 * u + fy); g.lineTo(CX + 200 * u, CY - 70 * u + fy); g.moveTo(CX + 200 * u, CY - 470 * u + fy); g.lineTo(CX - 200 * u, CY - 70 * u + fy); g.stroke(); g.globalAlpha = 1; }
    g.restore(); flash(t, t0 + 0.1, 0.1, "255,255,255", 0.4);
    g.fillStyle = "rgba(0,0,0,0.6)"; font(24 * u, 700, F.mono); const tgw = tw(tag) + 40 * u; g.fillRect(W - 40 * u - tgw, fy + 30 * u, tgw, 50 * u); txt(tag, W - 40 * u - tgw / 2, fy + 56 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#fff" });
    // channel bug + LIVE
    g.fillStyle = "#fff"; rr(40 * u, 220 * u, 300 * u, 76 * u, 10 * u); g.fill(); txt("AD NEWS 24", 190 * u, 259 * u, { size: 40 * u, fam: F.archivo, weight: 400, color: NAVY });
    if (FR(t) % 30 < 22) { g.fillStyle = RED; rr(360 * u, 230 * u, 130 * u, 56 * u, 8 * u); g.fill(); txt("● LIVE", 425 * u, 259 * u, { size: 30 * u, weight: 900, color: "#fff" }); }
    txt("10:42", W - 40 * u, 259 * u, { size: 36 * u, fam: F.mono, weight: 700, color: "#fff", align: "right" });
    // BREAKING bar + headline (the caption)
    const bp = oC(prog(t, 0.1, 0.5)); g.fillStyle = RED; g.fillRect(0, 1260 * u, W * bp, 90 * u); txt("BREAKING NEWS", 40 * u, 1306 * u, { size: 52 * u, fam: F.archivo, weight: 400, color: "#fff", align: "left", alpha: bp });
    g.fillStyle = "#fff"; g.fillRect(0, 1350 * u, W, 190 * u);
    const hl = HEAD[k], n = Math.floor(clamp((t - t0 - 0.1) * 40, 0, hl.length)); font(56 * u, 900, F.inter); const lines = wrap(hl.slice(0, n), W - 80 * u);
    lines.forEach((ln, i) => txt(ln, 40 * u, 1412 * u + i * 66 * u, { size: 56 * u, weight: 900, color: NAVY, align: "left" }));
    // ticker
    g.fillStyle = NAVY; g.fillRect(0, 1540 * u, W, 80 * u); g.fillStyle = "#ffcc00"; g.fillRect(0, 1540 * u, 170 * u, 80 * u); txt("TICKER", 85 * u, 1582 * u, { size: 30 * u, weight: 900, color: NAVY });
    g.save(); g.beginPath(); g.rect(170 * u, 1540 * u, W, 80 * u); g.clip(); font(34 * u, 700, F.inter); const tw0 = tw(TICK), off = (t * 260 * u) % tw0;
    for (let x = 190 * u - off; x < W; x += tw0) txt(TICK, x, 1582 * u, { size: 34 * u, weight: 700, color: "#fff", align: "left" }); g.restore();
    grain(t, 0.03);
  },
};
