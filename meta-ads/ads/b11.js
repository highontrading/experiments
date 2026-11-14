// B11 · "3 galtiyan" (Hinglish VO Neeraj, 9:16). Three common AI-ad mistakes shown side by side with the fix:
// plastic skin, a product that changes between frames, and the same beige look on every ad.
// Captions: white Inter Black with black outline, word-by-word pop, lower third.
const L = window.TL.lines, RED = "#ff4d4f", GRN = C.lime;
const T1 = L[1].at, T2 = L[2].at, T3 = L[3].at, T4 = L[4].at, T_END = L[4].v1 + 0.7;
const LOOKS = ["i35", "i00", "i12", "i19", "i21", "i24", "i32", "i06", "i18"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "teen-galtiyan_hinglish",
  images: Object.fromEntries([...LOOKS, "i22", "i38", "i40"].map((k) => [k, `assets/img/site/${k}.jpg`])),
  music: { file: "build/music_el/tension.mp3", offset: 0, gain: -13, duck: -6, fadeOut: 0.8 },
  sfx: [["boom", 0.3, -12], ["glitch", T1, -12], ["glitch", T2, -12], ["glitch", T3, -12], ["ding", T1 + 1.6, -12], ["ding", T2 + 2.4, -12], ["ding", T3 + 1.6, -12], ["powerup", T4 + 0.2, -16], ["whoosh", T_END - 0.1, -12]],
  tag(txt0, x, y, ok, a = 1) { font(30 * u, 800, F.inter); const w0 = tw(txt0) + 70 * u; g.save(); g.globalAlpha = a; g.fillStyle = ok ? GRN : RED; rr(x - w0 / 2, y - 28 * u, w0, 56 * u, 28 * u); g.fill(); g.restore();
    txt((ok ? "✓ " : "✗ ") + txt0, x, y + 2 * u, { size: 30 * u, weight: 800, color: ok ? C.ink : "#fff", alpha: a }); },
  head(n, t, t0) { const p = oB(clamp((t - t0) / 0.3)); g.save(); g.translate(CX, 250 * u); g.scale(p, p); g.fillStyle = RED; rr(-170 * u, -44 * u, 340 * u, 88 * u, 44 * u); g.fill();
    txt(`GALTI #${n}`, 0, 3 * u, { size: 44 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore(); },
  frame(im, x, y, w, h, f = "none", ax = 0.5, z = 1) { g.save(); g.beginPath(); rr(x, y, w, h, 16 * u); g.clip(); g.filter = f; cover(IM[im], x, y, w, h, z, ax, 0.5); g.filter = "none"; g.restore(); },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0d0d0d", fg: "#fff", cta: "Sahi tareeka seekho  →" }); grain(t, 0.04); return; }
    bg("#0d0d0d");
    if (t < T1) {
      LOOKS.forEach((k, i) => { const c = i % 3, r = Math.floor(i / 3); g.save(); g.globalAlpha = 0.28; this.frame(k, 30 * u + c * 345 * u, 320 * u + r * 380 * u, 330 * u, 360 * u); g.restore(); });
      const p = oB(clamp((t - 0.3) / 0.4)); g.save(); g.translate(CX, 760 * u); g.scale(p, p); txt("3", 0, -80 * u, { size: 420 * u, fam: F.archivo, weight: 400, color: RED }); txt("GALTIYAN", 0, 210 * u, { size: 150 * u, fam: F.archivo, weight: 400, color: "#fff" }); g.restore();
    } else if (t < T2) {   // 1. plastic skin
      this.head(1, t, T1); const x = 60 * u, y = 360 * u, w = W - 120 * u, h = 980 * u, sp = ioC(prog(t, T1 + 0.4, T1 + 1.0));
      this.frame("i22", x, y, w, h, "none", 0.5, 1.05);
      g.save(); g.beginPath(); g.rect(x, y, w * 0.5 * sp + (1 - sp) * w, h); g.clip(); this.frame("i22", x, y, w, h, "blur(6px) saturate(1.35) brightness(1.1) contrast(0.85)", 0.5, 1.05); g.restore();
      if (sp > 0) { g.fillStyle = "#fff"; g.fillRect(x + w * 0.5 * sp + (1 - sp) * w - 3 * u, y, 6 * u, h); }
      this.tag("PLASTIC", x + w * 0.25, y + h - 60 * u, false, sp); this.tag("REAL TEXTURE", x + w * 0.75, y + h - 60 * u, true, oC(prog(t, T1 + 1.6, T1 + 1.9)));
    } else if (t < T3) {   // 2. product drifts
      this.head(2, t, T2); const fw = 300 * u, fh = 420 * u, xs = [60 * u, 390 * u, 720 * u];
      const bad = ["none", "hue-rotate(80deg) saturate(1.3)", "hue-rotate(-150deg)"];
      xs.forEach((x, i) => { const p = oC(clamp((t - T2 - 0.2 - i * 0.25) / 0.3)); g.save(); g.globalAlpha = p; this.frame("i38", x, 370 * u, fw, fh, bad[i], 0.08, 1.7); g.restore(); });
      this.tag("PRODUCT BADAL GAYA", CX, 840 * u, false, oC(prog(t, T2 + 1.0, T2 + 1.3)));
      const gp = prog(t, T2 + 2.2, T2 + 2.5); xs.forEach((x, i) => { g.save(); g.globalAlpha = oC(clamp(gp * 3 - i)); this.frame(i === 1 ? "i40" : "i38", x, 920 * u, fw, fh, "none", i === 1 ? 0.12 : 0.08, i === 2 ? 2.2 : 1.7); g.restore(); });
      this.tag("HAR FRAME MEIN SAME", CX, 1390 * u, true, oC(prog(t, T2 + 2.6, T2 + 2.9)));
    } else if (t < T4) {   // 3. same beige look everywhere
      this.head(3, t, T3); const fp = ioC(prog(t, T3 + 1.4, T3 + 2.0));
      LOOKS.forEach((k, i) => { const c = i % 3, r = Math.floor(i / 3), x = 60 * u + c * 330 * u, y = 360 * u + r * 340 * u; const flip = clamp(fp * 1.6 - i * 0.07);
        this.frame(k, x, y, 300 * u, 320 * u, flip < 0.5 ? "sepia(0.75) saturate(0.35) brightness(1.05) contrast(0.85)" : "none"); });
      fp < 0.5 ? this.tag("SAB EK JAISE", CX, 1420 * u, false, oC(prog(t, T3 + 0.4, T3 + 0.7))) : this.tag("HAR BRAND KA APNA LOOK", CX, 1420 * u, true, oC(prog(t, T3 + 1.6, T3 + 1.9)));
    } else {   // fix all three
      ["SKIN TEXTURE", "PRODUCT CONSISTENCY", "BRAND LOOK"].forEach((s, i) => { const p = oB(clamp((t - T4 - 0.1 - i * 0.3) / 0.3)); g.save(); g.translate(CX, 600 * u + i * 200 * u); g.scale(p * 1.7, p * 1.7); this.tag(s, 0, 0, true); g.restore(); });
      logo(CX, 300 * u, 120 * u, "white", oC(prog(t, T4, T4 + 0.4)));
    }
    capPop(t, voChunk(t, 3, 0.5), H * 0.79, { size: 80 * u, weight: 900, upper: false, hi: "#fff", color: "#fff", stroke: "#000", strokeW: 12, bounce: 0.8 });
    grain(t, 0.04);
  },
};
