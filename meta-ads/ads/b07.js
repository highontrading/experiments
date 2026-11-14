// B07 · "Family group" (Hinglish, 9:16, music only, shows price). A family chat reacts to the AI ads their kid made.
// Captions = the chat itself (one consistent bubble system) + one white headline on top.
const MSG = [  // [t, who, text | {img}]   who: "me" or a name
  [0.8, "Mummy", "Beta, aajkal kya kar rahe ho? 🙂"], [2.0, "me", "Ads bana raha hoon. AI se."], [3.2, "Papa", "AI se? Dikhao zara."],
  [4.3, "me", { img: "i39" }], [5.1, "me", { img: "i32" }], [6.4, "Chachu", "Ye kisne shoot kiya?? Bada photographer hai?"],
  [8.0, "me", "Koi shoot nahi hua. Sab AI hai 😄"], [9.4, "Mummy", "Seekhne mein kitna kharcha hua?"], [10.8, "me", "₹2,999 ka course tha. AI & Advertising."],
  [12.4, "Chachu", "Meri dukaan ka bhi bana de! 🙏"], [13.6, "Papa", "Beta, office ka bhi 😂"],
];
const COL = { Mummy: "#E8A0BF", Papa: "#7FB8FF", Chachu: "#F2B263" }, T_END = 15.6;
window.AD = {
  w: 1080, h: 1920, dur: T_END + 3.6, slug: "family-group-chat_hinglish",
  images: { i39: "assets/img/site/i39.jpg", i32: "assets/img/site/i32.jpg" },
  music: { file: "build/music_el/indian.mp3", offset: 0, gain: -11, fadeOut: 0.8 },
  sfx: MSG.map((m) => [m[1] === "me" ? "send" : "notif", m[0], m[1] === "me" ? -12 : -14]).concat([["whoosh", T_END - 0.1, -12]]),
  bubbleH(m) { const [, who, c] = m; if (typeof c === "object") return 520 * u; font(40 * u, 500, F.inter); return wrap(c, 640 * u).length * 54 * u + (who === "me" ? 50 : 96) * u; },
  render(t) {
    if (t >= T_END) { endCard(t, T_END, { bg: "#0f1412", fg: "#fff", price: true, accent: C.lime, sub: "by Ideabro Studio · Hinglish batch-friendly", cta: "Course join karo  →" }); grain(t, 0.04); return; }
    // chat wallpaper
    bg("#0f1412"); g.save(); g.globalAlpha = 0.05; for (let k = 0; k < 60; k++) txt(["✦", "◦", "✿", "☕"][k % 4], rnd(k) * W, rnd(k + 9) * H, { size: 40 * u, color: "#fff" }); g.restore();
    // header
    g.fillStyle = "#1b2420"; g.fillRect(0, 0, W, 300 * u);
    g.fillStyle = "#3a4a43"; g.beginPath(); g.arc(120 * u, 220 * u, 48 * u, 0, 7); g.fill(); txt("👨‍👩‍👦", 120 * u, 222 * u, { size: 44 * u });
    txt("Family ❤️", 195 * u, 200 * u, { size: 44 * u, weight: 700, color: "#fff", align: "left" });
    txt(t < 6.4 ? "Mummy, Papa, Chachu, You" : "Chachu is typing…", 195 * u, 248 * u, { size: 28 * u, weight: 500, color: t < 6.4 ? "#9fb3aa" : C.lime, align: "left" });
    // headline (white, consistent)
    txt("Jab family ko pata chala 👀", CX, 380 * u, { size: 52 * u, weight: 800, color: "#fff", alpha: oC(prog(t, 0, 0.4)) });
    // messages: stack from bottom, newest at the bottom, scroll up smoothly
    const shown = MSG.filter((m) => t >= m[0]); let total = 0; const hs = shown.map((m) => { const h = this.bubbleH(m) + 26 * u; total += h; return h; });
    const last = shown[shown.length - 1], lp = last ? oC(clamp((t - last[0]) / 0.3)) : 1;
    let y = 1500 * u - total + (last ? (1 - lp) * hs[hs.length - 1] : 0);
    g.save(); g.beginPath(); g.rect(0, 440 * u, W, 1120 * u); g.clip();
    shown.forEach((m, i) => {
      const [t0, who, c] = m, me = who === "me", h = hs[i] - 26 * u, bw = typeof c === "object" ? 520 * u : (() => { font(40 * u, 500, F.inter); return Math.min(700 * u, Math.max(...wrap(c, 640 * u).map(tw), me ? 0 : tw(who) * 0.8) + 60 * u); })();
      const x = me ? W - 50 * u - bw : 50 * u, a = i === shown.length - 1 ? lp : 1;
      g.save(); g.globalAlpha = a; g.fillStyle = me ? "#1f5c45" : "#232c28"; rr(x, y, bw, h, 26 * u); g.fill();
      if (typeof c === "object") { g.save(); rr(x + 12 * u, y + 12 * u, bw - 24 * u, h - 24 * u, 18 * u); g.clip(); cover(IM[c.img], x + 12 * u, y + 12 * u, bw - 24 * u, h - 24 * u); g.restore(); }
      else { let ty = y + 48 * u; if (!me) { txt(who, x + 30 * u, y + 42 * u, { size: 30 * u, weight: 700, color: COL[who], align: "left" }); ty += 46 * u; }
        font(40 * u, 500, F.inter); wrap(c, 640 * u).forEach((ln, k) => txt(ln, x + 30 * u, ty + k * 54 * u, { size: 40 * u, weight: 500, color: "#f1f1f1", align: "left" })); }
      txt(`10:${String(12 + i).padStart(2, "0")} ${me ? "✓✓" : ""}`, x + bw - 24 * u, y + h - 22 * u, { size: 22 * u, weight: 500, color: me ? "#8fd3b5" : "#8a9a93", align: "right" });
      g.restore(); y += hs[i];
    });
    g.restore();
    // input bar
    g.fillStyle = "#1b2420"; g.fillRect(0, 1580 * u, W, 140 * u); g.fillStyle = "#2a3530"; rr(40 * u, 1608 * u, W - 200 * u, 84 * u, 42 * u); g.fill();
    txt("Message", 90 * u, 1651 * u, { size: 34 * u, weight: 500, color: "#7d8f87", align: "left" }); g.fillStyle = "#25a36f"; g.beginPath(); g.arc(W - 90 * u, 1650 * u, 44 * u, 0, 7); g.fill(); txt("➤", W - 88 * u, 1652 * u, { size: 36 * u, color: "#fff" });
    grain(t, 0.03);
  },
};
