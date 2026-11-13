// A05 · "Raat ka brief" (Hinglish VO Rahul, 9:16). 11 PM client message -> clock runs through the night as the
// five steps light up -> dawn, the ad goes live. Captions: clean white, word-by-word fade. Music: lo-fi.
const L = window.TL.lines, Wd = (l, w) => L[l].words[w].s;
const T_MSG = Wd(0, 5), T_STEPS = Wd(2, 0), T_DAWN = Wd(3, 0), T_LIVE = Wd(4, 0), T_END = L[4].v1 + 0.7;
const STEPS = ["Brief", "Concept", "Visuals", "Motion", "Edit"];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "raat-ka-brief_hinglish",
  images: { v1: "assets/img/site/i37.jpg", v2: "assets/img/site/i31.jpg", v3: "assets/img/site/i22.jpg" },
  seqs: ["city", "laptop", "live"],
  music: { file: "build/music/135.mp3", offset: 0, gain: -10, duck: -7, fadeOut: 0.8 },
  sfx: [["notif", T_MSG - 0.3, -6], ["keys", L[1].v0, -16], ...STEPS.map((_, i) => ["tick", Wd(2, i), -9]), ["shimmer", T_DAWN, -12], ["notif", T_LIVE, -8], ["whoosh", T_END - 0.1, -12]],
  clock(t) {   // 11:02 PM -> 7:00 AM across the steps
    const m0 = 23 * 60 + 2, m1 = 31 * 60; const p = ioC(prog(t, T_STEPS - 0.2, T_LIVE)); const m = Math.round(lerp(m0, m1, p));
    const hh = Math.floor(m / 60) % 24, mm = m % 60, ap = hh >= 12 ? "PM" : "AM", h12 = ((hh + 11) % 12) + 1;
    return [`${h12}:${String(mm).padStart(2, "0")}`, ap];
  },
  render(t) {
    if (t >= T_END) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#ffd7a8"); gr.addColorStop(1, "#f6b8ea"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      endCard(t, T_END, { bg: false, fg: C.ink, strike: "#8a6a7a", cta: "Enroll now  →" }); grain(t, 0.05); return; }
    // background footage: city at night -> laptop at night, sky warms at dawn
    const bgSeq = t < T_STEPS ? seq("city", t, 0, { loop: false }) : seq("laptop", t, T_STEPS, { loop: false });
    g.save(); g.filter = `brightness(${t < T_DAWN ? 0.55 : 0.55 + 0.25 * prog(t, T_DAWN, T_LIVE)})`; cover(bgSeq, 0, 0, W, H, 1.08); g.restore();
    const dawn = prog(t, T_DAWN - 0.3, T_LIVE + 0.5);
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, `rgba(10,14,40,${0.55 * (1 - dawn)})`); sky.addColorStop(1, `rgba(255,170,110,${0.45 * dawn})`);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // the clock
    const [hm, ap] = this.clock(t);
    txt(hm, CX - 40 * u, 330 * u, { size: 210 * u, weight: 800, fam: F.grot, color: "#fff", shadow: 20 });
    txt(ap, CX + 320 * u, 370 * u, { size: 60 * u, weight: 700, fam: F.grot, color: "#fff", alpha: 0.85 });
    // phone notification card
    if (t >= T_MSG - 0.3 && t < T_STEPS + 0.3) {
      const p = oB(clamp((t - T_MSG + 0.3) / 0.35)), out = prog(t, T_STEPS - 0.1, T_STEPS + 0.3);
      g.save(); g.globalAlpha = 1 - out; g.translate(CX, 640 * u - (1 - p) * 120 * u); g.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
      g.fillStyle = "rgba(245,245,245,0.92)"; rr(-470 * u, -150 * u, 940 * u, 300 * u, 44 * u); g.fill();
      g.fillStyle = "#25d366"; rr(-430 * u, -110 * u, 96 * u, 96 * u, 22 * u); g.fill(); txt("C", -382 * u, -62 * u, { size: 44 * u, weight: 800, color: "#fff" });
      txt("Client  ·  11:02 PM", -310 * u, -80 * u, { size: 38 * u, weight: 700, color: C.ink, align: "left" });
      const msg = "Kal subah tak naya ad chahiye. Shoot ka time nahi hai."; typeText(t, msg, -310 * u, -10 * u, L[1].v0 - 0.3, 28, { size: 40 * u, fam: F.inter, weight: 500, color: "#222", maxW: 720 * u, lh: 1.3, caret: false });
      g.restore();
    }
    // five steps light up in sequence, each with its output
    if (t >= T_STEPS - 0.1) {
      const y0 = 620 * u, rowH = 150 * u, p0 = oC(prog(t, T_STEPS - 0.1, T_STEPS + 0.3)), done = prog(t, T_DAWN, T_DAWN + 0.4);
      g.save(); g.globalAlpha = p0 * (1 - prog(t, T_LIVE - 0.3, T_LIVE));
      STEPS.forEach((s, i) => {
        const on = t >= Wd(2, i), y = y0 + i * rowH, ip = oC(clamp((t - Wd(2, i)) / 0.25));
        g.fillStyle = on ? "rgba(216,245,162,0.95)" : "rgba(255,255,255,0.14)"; rr(140 * u, y, 800 * u, 112 * u, 28 * u); g.fill();
        txt(`0${i + 1}`, 200 * u, y + 56 * u, { size: 30 * u, fam: F.mono, weight: 700, color: on ? C.ink : "#fff", align: "left" });
        txt(s, 290 * u, y + 58 * u, { size: 52 * u, weight: 800, color: on ? C.ink : "rgba(255,255,255,0.7)", align: "left" });
        if (on) { txt(i < 4 ? "✓ done" : "✓ ready", 880 * u, y + 58 * u, { size: 30 * u, fam: F.mono, weight: 700, color: C.ink, align: "right", alpha: ip }); }
      });
      g.restore();
    }
    // the ad goes live on a phone
    if (t >= T_LIVE - 0.3) {
      const p = oB(clamp((t - T_LIVE + 0.3) / 0.4)), pw = 520 * u, ph = 920 * u;
      g.save(); g.translate(CX, 880 * u); g.scale(p, p);
      g.fillStyle = "#111"; rr(-pw / 2 - 18 * u, -ph / 2 - 18 * u, pw + 36 * u, ph + 36 * u, 64 * u); g.fill();
      g.beginPath(); g.roundRect(-pw / 2, -ph / 2, pw, ph, 50 * u); g.save(); g.clip(); cover(seq("live", t, T_LIVE - 0.3), -pw / 2, -ph / 2, pw, ph); shade(ph * 0.1, ph / 2, 0.6); g.restore();
      g.fillStyle = "#1b7f3a"; rr(-pw / 2 + 30 * u, -ph / 2 + 40 * u, 230 * u, 60 * u, 30 * u); g.fill();
      txt("●  AD LIVE", -pw / 2 + 145 * u, -ph / 2 + 71 * u, { size: 26 * u, fam: F.mono, weight: 700, color: "#fff" });
      txt("7:00 AM · ready before the meeting", 0, ph / 2 - 60 * u, { size: 26 * u, fam: F.mono, color: "#fff" });
      g.restore();
    }
    capClean(t, voChunk(t, 4, 0.5), H * 0.765, { size: 66 * u, weight: 800, shadow: 16, shadowColor: "rgba(0,0,0,0.85)" });
    grain(t, 0.07);
  },
};
