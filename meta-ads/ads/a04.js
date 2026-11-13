// A04 · "THE AI ISSUE" (English, 4:5 feed, no VO). A luxury fashion-magazine cover, then page flips through
// spreads of the studio's AI work. Captions: editorial serif cover lines. Music: fashion funk.
const P1 = 4.2, P2 = 7.4, P3 = 10.6, T_END = 13.6;
window.AD = {
  w: 1080, h: 1350, dur: T_END + 3.8, slug: "the-ai-issue-magazine",
  images: { cover: "assets/img/site/i00.jpg", a: "assets/img/site/i21.jpg", b: "assets/img/site/i31.jpg", c: "assets/img/site/i22.jpg",
            d: "assets/img/site/i40.jpg", e: "assets/img/site/i12.jpg", f: "assets/img/site/i24.jpg" },
  music: { file: "build/music/1147.mp3", offset: 6, gain: -10, fadeOut: 1.0 },
  sfx: [["shutter", 0.2, -8], ["pageflip", P1 - 0.15, -4], ["pageflip", P2 - 0.15, -4], ["pageflip", P3 - 0.15, -4], ["whoosh", T_END - 0.1, -12]],
  cover(t) {
    const z = 1.04 + 0.05 * prog(t, 0, P1); cover(IM.cover, 0, 0, W, H, z, 0.5, 0.35);
    shade(H * 0.55, H, 0.55); shade(0, H * 0.3, 0.35, true);
    const p = (d) => oC(clamp((t - d) / 0.5));
    // masthead
    txt("IDEABRO", CX, 150 * u, { size: 196 * u, weight: 700, fam: F.play, color: "#fff", ls: -4, alpha: p(0.15), shadow: 18 });
    txt("THE AI ISSUE  ·  NO. 01  ·  AI & ADVERTISING", CX, 260 * u, { size: 24 * u, fam: F.mono, color: "#fff", alpha: p(0.4), ls: 2 });
    // cover lines
    txt("Shot by", 70 * u, H - 420 * u, { size: 96 * u, weight: 400, fam: F.serif, style: "italic", color: "#fff", align: "left", alpha: p(0.8), shadow: 14 });
    txt("no one.", 70 * u, H - 330 * u, { size: 96 * u, weight: 400, fam: F.serif, style: "italic", color: "#fff", align: "left", alpha: p(1.0), shadow: 14 });
    g.globalAlpha = p(1.5); g.fillStyle = C.lime; g.fillRect(70 * u, H - 260 * u, 250 * u, 4 * u); g.globalAlpha = 1;
    [["41 lessons inside", 1.7], ["The shoot is optional now", 2.0], ["Models, sets, film — directed with AI", 2.3]].forEach(([s, d], i) =>
      txt(s, 70 * u, H - 210 * u + i * 48 * u, { size: 34 * u, weight: 600, fam: F.inter, color: "#fff", align: "left", alpha: p(d), shadow: 10 }));
    // barcode + price
    const bp = p(2.6); if (bp > 0) { g.save(); g.globalAlpha = bp; g.fillStyle = "#fff"; g.fillRect(W - 250 * u, H - 210 * u, 180 * u, 120 * u);
      g.fillStyle = C.ink; for (let k = 0; k < 34; k++) { const bw = (1 + Math.floor(rnd(k) * 3)) * u * 1.6; g.fillRect(W - 236 * u + k * 4.6 * u, H - 196 * u, bw, 72 * u); }
      txt("$29", W - 160 * u, H - 108 * u, { size: 22 * u, fam: F.mono, color: C.ink }); g.restore(); }
  },
  spread(t, t0, left, right, head, sub) {
    bg("#f5f2ea"); const p = (d) => oC(clamp((t - t0 - d) / 0.45));
    // gutter shadow
    const gw = W / 2;
    g.save(); g.beginPath(); g.rect(0, 0, gw - 6 * u, H); g.clip(); cover(IM[left], 0, 0, gw, H, 1.06 + 0.03 * prog(t, t0, t0 + 3)); g.restore();
    const gr = g.createLinearGradient(gw - 60 * u, 0, gw + 60 * u, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(0,0,0,0.25)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    // right page: image top, editorial text bottom
    g.save(); g.beginPath(); g.rect(gw + 50 * u, 90 * u, gw - 100 * u, H * 0.48); g.clip(); cover(IM[right], gw + 50 * u, 90 * u, gw - 100 * u, H * 0.48, 1.04 + 0.03 * prog(t, t0, t0 + 3)); g.restore();
    g.fillStyle = gr; g.fillRect(gw - 60 * u, 0, 120 * u, H);
    txt(sub, gw + 50 * u, H * 0.48 + 160 * u, { size: 22 * u, fam: F.mono, color: "#7a7a7a", align: "left", alpha: p(0.3), ls: 2 });
    font(64 * u, 400, F.serif); const lines = wrap(head, gw - 100 * u);
    lines.forEach((ln, i) => txt(ln, gw + 50 * u, H * 0.48 + 240 * u + i * 70 * u, { size: 64 * u, weight: 400, fam: F.serif, color: C.ink, align: "left", alpha: p(0.45 + i * 0.12) }));
    txt(`— ${Math.round(t0 * 7 + 12)}`, W - 60 * u, H - 50 * u, { size: 20 * u, fam: F.mono, color: "#9a9a9a", align: "right" });
  },
  flip(t, t0, drawOld, drawNew) {   // page turn: new page sweeps in from the right with a shading fold
    const p = ioC(prog(t, t0 - 0.35, t0 + 0.15)); drawOld(); if (p <= 0) return;
    const x = W * (1 - p);
    g.save(); g.beginPath(); g.rect(x, 0, W - x, H); g.clip(); drawNew(); g.restore();
    const sh = g.createLinearGradient(x - 80 * u, 0, x + 40 * u, 0); sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.35)");
    g.fillStyle = sh; g.fillRect(x - 80 * u, 0, 120 * u, H);
  },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#f5f2ea", fg: C.ink, titleFam: F.play, titleWeight: 700, title: "AI & Advertising", sub: "THE COURSE · by Ideabro Studio", strike: "#9a9a9a" }); grain(t, 0.05); return; }
    const S1 = () => this.spread(t, P1, "a", "b", "Every frame here was made with AI.", "FEATURE · PRODUCT + MODEL");
    const S2 = () => this.spread(t, P2, "c", "d", "Jewellery, juice, shoes. One studio. No shoot.", "CAMPAIGNS · AI-DIRECTED");
    const S3 = () => this.spread(t, P3, "e", "f", "Learn the direction, not just the tools.", "11 MODULES · 41 LESSONS");
    if (t < P1 + 0.15) this.flip(t, P1, () => this.cover(t), S1);
    else if (t < P2 + 0.15) this.flip(t, P2, S1, S2);
    else if (t < P3 + 0.15) this.flip(t, P3, S2, S3);
    else S3();
    grain(t, 0.05);
  },
};
