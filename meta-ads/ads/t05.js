// T05 · TRAILER "AI Films" (English VO Don, 9:16, 2.39:1 letterbox inside 9:16). A cinematic film trailer: real crew
// footage first ("every film used to need a crew"), then a montage of AI film shots that accelerates on the drop.
// Captions: centred Cinzel-free premium system — white DM Serif italic VO lines with one cream Poppins key word,
// sitting in the bottom letterbox bar, plus a small mono slate in the top bar.
const L = window.TL.lines;
const SH = [["crew", 4.4], ["storm", 2.2], ["window", 2.2], ["zep", 2.0], ["pond", 1.6], ["leopard", 1.4], ["sea", 1.2], ["car", 1.0], ["tree", 1.0], ["moto", 0.9], ["sky", 1.0], ["desert", 1.4], ["sunset", 2.4]].map(([s, d]) => ({ s, d, z0: 1.02, z1: 1.08 }));
const T0 = 0.2, T_CUT = T0 + SH.reduce((a, s) => a + s.d, 0), T_TITLE = Math.max(T_CUT, L[4].v1 + 0.3), T_END = T_TITLE + 3.6;
const KEY = ["crew.", "year.", "vision.", "filmed.", "directed."];
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "trailer-ai-films",
  seqs: [...SH.map((s) => s.s), "earth"],
  music: { file: "build/music_el/tr_film.mp3", offset: 0, gain: -8, duck: -6, fadeOut: 1.5 },
  sfx: [["clapper", T0, -10], ["boom", L[2].at - 0.2, -10], ["boom", T_TITLE, -6]],
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#050505", fg: "#fff", titleFam: F.dms, titleStyle: "italic", cta: "Direct your first film  →" }); grain(t, 0.06); return; }
    bg("#000");
    const fh = 1180 * u, fy = (H - fh) / 2 - 40 * u;   // tall cinema frame (≈ 1.26:1) centred, black bars top/bottom
    if (t < T_TITLE) {
      const tt = Math.min(t, T_CUT - 0.01); const { k, t0, sh } = shotAt(tt, SH, T0); const im = seq(sh.s, t, t0);
      g.save(); g.beginPath(); g.rect(0, fy, W, fh); g.clip(); g.filter = k === 0 ? "saturate(0.5) contrast(1.1) brightness(0.85)" : "contrast(1.1) saturate(0.9)";
      cover(im, 0, fy, W, fh, lerp(sh.z0, sh.z1, clamp((t - t0) / sh.d)), 0.5, 0.5); g.filter = "none"; g.restore();
      if (t - t0 < 0.06 && k) { g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(0, fy, W, fh); }
      txt(k === 0 ? "REAL FOOTAGE · TRADITIONAL FILM SET" : `SCENE ${String(k).padStart(2, "0")}  ·  GENERATED, NOT FILMED`, CX, fy - 70 * u, { size: 24 * u, fam: F.mono, weight: 700, color: "#bbb", ls: 4 });
      // VO line in the bottom bar: serif italic with the key word in cream Poppins
      let li = -1; L.forEach((l, i) => { if (t >= l.words[0].s - 0.15) li = i; });
      if (li >= 0) { const l = L[li], end = li + 1 < L.length ? L[li + 1].words[0].s - 0.2 : T_TITLE; const key = KEY[li];
        const words = l.cap.split(" "), last = words.pop(); const rows = [[[words.join(" "), "S", 0.9], [last, "B", 0.82]]];
        if (words.length === 0) rows[0] = [[last, "B", 0.9]];
        edCap(t, l.words[0].s - 0.15, end, rows, { y: fy + fh + 140 * u, x: CX, align: "center", size: 92 * u, shadow: 0 }); }
    } else {
      g.save(); g.beginPath(); g.rect(0, fy, W, fh); g.clip(); kb(seq("earth", t, T_TITLE), t, T_TITLE, 4, 1.05, 1.15, 0.5, 0.5, 0, fy, W, fh); g.restore();
      g.fillStyle = `rgba(0,0,0,${0.5 * oC(prog(t, T_TITLE, T_TITLE + 0.6))})`; g.fillRect(0, fy, W, fh);
      edCap(t, T_TITLE + 0.1, T_END, [[["AI", "B"], ["Films", "S"]]], { y: CY - 30 * u, x: CX, align: "center", size: 190 * u });
      edCap(t, T_TITLE + 0.8, T_END, [[["A MODULE OF AI & ADVERTISING · IDEABRO STUDIO", "M", 0.2]]], { y: CY + 140 * u, x: CX, align: "center", size: 120 * u, ls: 3 });
    }
    filmGrade(t, 0.07);
  },
};
