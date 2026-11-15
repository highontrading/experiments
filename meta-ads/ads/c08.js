// C08 · "Kinetic" (English, 9:16, music only). Pure beat-synced kinetic typography on a hard phonk beat: one word per
// beat, colour flips, knockout type filled with AI footage, shakes on the drops.
// Captions: the ad IS the captions — giant Anton words fitted to the width, one per beat.
const BEATS = window.BEATS || [];
const WORDS = [["STOP", "k"], ["SCROLLING", "w"], ["PAST", "k"], ["ADS", "l"], ["THAT", "k"], ["LOOK", "w"], ["CHEAP.", "r"], ["tree", "img"],
  ["YOUR", "k"], ["BRAND", "w"], ["DESERVES", "k"], ["CINEMA.", "x:leopard"], ["NO", "k"], ["STUDIO.", "w"], ["NO", "k"], ["CREW.", "w"], ["NO", "k"], ["EXCUSES.", "l"],
  ["beach", "img"], ["JUST", "k"], ["YOU", "w"], ["+", "l"], ["AI", "x:cafe"], ["=", "k"], ["ADS", "w"], ["THAT", "k"], ["SELL.", "l"], ["LEARN", "k"], ["IT", "w"], ["NOW.", "x:tree"]];
const B0 = 0.51, BD = 0.4285, T_END = B0 + WORDS.length * BD + 0.4;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "kinetic",
  seqs: ["tree", "beach", "cafe", "leopard"],
  music: { file: "build/music_el/phonk.mp3", offset: 0, gain: -7, fadeOut: 0.6 },
  sfx: [["sub", B0 + 7 * BD, -8], ["sub", B0 + 18 * BD, -8], ["boom", B0 + 29 * BD, -8], ["whoosh", T_END - 0.1, -12]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#000", fg: "#fff", titleFam: F.anton, titleWeight: 400, titleSize: 120, title: "AI & ADVERTISING", cta: "Learn it now  →" }); grain(t, 0.05); return; }
    if (t < B0) { bg("#000"); return; }
    const k = Math.min(WORDS.length - 1, Math.floor((t - B0) / BD)), t0 = B0 + k * BD, [w, st] = WORDS[k], p = clamp((t - t0) / 0.12);
    const shake = (st === "r" || st.startsWith("x") || st === "img") ? (1 - prog(t, t0, t0 + 0.2)) * 18 * u : 0; g.save(); g.translate((rnd(FR(t)) - 0.5) * shake, (rnd(FR(t) + 3) - 0.5) * shake);
    const colors = { k: ["#000", "#fff"], w: ["#fff", "#000"], l: [C.lime, "#000"], r: ["#e5383b", "#fff"] };
    if (st === "img") { kb(seq(w, t, t0), t, t0, BD, 1.15, 1.05); txt("MADE WITH AI", CX, H * 0.72, { size: 40 * u, fam: F.mono, weight: 700, color: "#fff", ls: 6, shadow: 10 }); }
    else if (st.startsWith("x")) { bg("#000"); const src = st.split(":")[1], size = Math.min(fitSize(w, W * 0.92, 700 * u, 400, F.anton), 900 * u) * lerp(1.2, 1, oC(p));
      g.save(); font(size, 400, F.anton); g.textAlign = "center"; g.textBaseline = "middle"; g.beginPath(); // clip to text via composite
      const off = document.createElement("canvas"); off.width = W; off.height = H; const o = off.getContext("2d"); o.font = g.font; o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff"; o.fillText(w, CX, CY);
      o.globalCompositeOperation = "source-in"; const im = seq(src, t, t0); if (im) { const sc = Math.max(W / im.width, H / im.height) * 1.1; o.drawImage(im, CX - im.width * sc / 2, CY - im.height * sc / 2, im.width * sc, im.height * sc); }
      g.drawImage(off, 0, 0); g.restore(); txt("MADE WITH AI", CX, H * 0.75, { size: 30 * u, fam: F.mono, weight: 700, color: "#fff", ls: 6, alpha: 0.8 }); }
    else { const [b, f] = colors[st]; bg(b); const size = Math.min(fitSize(w, W * 0.9, 1400 * u, 400, F.anton), w.length <= 2 ? 1300 * u : 760 * u) * lerp(1.25, 1, oC(p));
      g.save(); g.translate(CX, CY); g.rotate((k % 3 - 1) * 0.02 * (1 - oC(p))); txt(w, 0, 0, { size, fam: F.anton, weight: 400, color: f }); g.restore(); }
    // beat counter / progress
    g.fillStyle = st === "w" || st === "l" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.3)"; g.fillRect(80 * u, H - 300 * u, (W - 160 * u) * ((k + 1) / WORDS.length), 6 * u);
    g.restore(); grain(t, 0.05);
  },
};
