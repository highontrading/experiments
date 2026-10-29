// Carousel 08: Vibe Editing vs Timeline Editing.
// Design system: a retro beige CRT monitor standing in a hazy flower meadow, Windows 95
// Notepad windows floating around it, a big white grotesque, a black serif on a pink
// highlight box and a bubbly white label with a lavender outline.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const PINKBOX = "#f7d6e6", LAV = "#6b62c9", NAVY = "#000a7a";
const WHITE = (size, o = {}) => ({ family: "InterD", size, weight: 800, color: "#fff", track: -size * 0.035, ...o });
function white(c, s, x, y, size, o = {}) {
  c.save(); c.shadowColor = "rgba(25,35,15,.55)"; c.shadowBlur = size * 0.35; c.shadowOffsetY = size * 0.04;
  K.text(c, s, x, y, WHITE(size, o)); c.restore();
}
const SERIF = (size, o = {}) => ({ family: "Playfair", size, weight: 500, color: "#111", ...o });
const MONO = (size, o = {}) => ({ family: "VT323", size, weight: 400, color: "#111", ...o });
const W95 = (size, o = {}) => ({ family: "InterL", size, weight: 500, color: "#111", ...o });

// --------------------------------------------------------------- meadow --
function meadowBg(c, t, zoom = 1) {
  // real meadow footage, a touch hazy like the reference
  c.save(); c.translate(K.W / 2, K.H / 2); c.scale(zoom, zoom); c.translate(-K.W / 2, -K.H / 2);
  FOOTAGE.drawFootage(c, "daisy_field", t, K.W, K.H, "raw", 0.5);
  c.restore();
  const haze = c.createLinearGradient(0, 0, 0, K.H * 0.5);
  haze.addColorStop(0, "rgba(225,232,236,.45)"); haze.addColorStop(1, "rgba(225,232,236,0)");
  c.fillStyle = haze; c.fillRect(0, 0, K.W, K.H * 0.5);
}

// ------------------------------------------------------------ components --
function bevel(c, x, y, w, h, inset = false) {
  c.fillStyle = inset ? "#808080" : "#ffffff"; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h);
  c.fillStyle = inset ? "#ffffff" : "#808080"; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
}
// Windows 95 window centred at (0,0). paint(c, w, h) draws the client area.
function win95(c, w, h, title, paint, o = {}) {
  c.save();
  c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 24; c.shadowOffsetX = 6; c.shadowOffsetY = 12;
  c.fillStyle = "#c3c3c3"; c.fillRect(-w / 2, -h / 2, w, h);
  c.restore();
  c.fillStyle = "#000"; c.fillRect(-w / 2 + w - 1, -h / 2, 1, h); c.fillRect(-w / 2, -h / 2 + h - 1, w, 1);
  bevel(c, -w / 2, -h / 2, w - 1, h - 1);
  const tb = 34;
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, NAVY); g.addColorStop(1, "#1580d6");
  c.fillStyle = g; c.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, tb);
  c.fillStyle = "#e9f3ff"; c.fillRect(-w / 2 + 12, -h / 2 + 12, 20, 20); c.fillStyle = "#3a7bd5"; c.fillRect(-w / 2 + 15, -h / 2 + 16, 14, 3); c.fillRect(-w / 2 + 15, -h / 2 + 22, 10, 3);
  K.text(c, title, -w / 2 + 40, -h / 2 + 29, W95(19, { weight: 700, color: "#fff" }));
  ["_", "□", "×"].forEach((s, i) => {
    const bx = w / 2 - 5 - 26 * (3 - i) - (i === 2 ? 0 : 2), by = -h / 2 + 9;
    c.fillStyle = "#c3c3c3"; c.fillRect(bx, by, 24, 22); bevel(c, bx, by, 24, 22);
    K.text(c, s, bx + 12, by + 17, W95(18, { weight: 700, align: "center" }));
  });
  let top = -h / 2 + tb + 8;
  if (o.menu !== false) {
    ["File", "Edit", "Search", "Help"].forEach((s, i) => K.text(c, s, -w / 2 + 14 + i * 64, top + 20, W95(17)));
    top += 28;
  }
  const cx = -w / 2 + 7, cw = w - 14, ch = h / 2 - 7 - top;
  c.fillStyle = o.fill || "#fff"; c.fillRect(cx, top, cw, ch); bevel(c, cx, top, cw, ch, true);
  c.save(); c.beginPath(); c.rect(cx + 2, top + 2, cw - 4, ch - 4); c.clip(); c.translate(cx + 2, top + 2);
  paint(c, cw - 4, ch - 4);
  c.restore();
}
// Beige CRT monitor centred at the screen centre. paint(c, sw, sh) draws the screen.
// The real retro TV (a boombox with a built-in screen). `w` is its width on the page;
// paint(c, sw, sh) fills the screen in a 725 px wide space, as the old CRT did.
function crt(c, w, paint, t) {
  const C = K.CUT.tv, h = w * C.im.height / C.im.width;
  c.save(); c.shadowColor = "rgba(25,35,15,.45)"; c.shadowBlur = 50; c.shadowOffsetY = 30;
  K.drawCut(c, "tv", h, (c, sw, sh) => {
    const k = 725 / sw;
    c.save(); c.scale(1 / k, 1 / k);
    const W2 = sw * k, H2 = sh * k;
    c.fillStyle = "#000"; c.fillRect(0, 0, W2, H2);
    c.save(); paint(c, W2, H2); c.restore();
    c.fillStyle = "rgba(0,0,0,.06)"; for (let y = 0; y < H2; y += 4) c.fillRect(0, y, W2, 1.5);
    const gl = c.createLinearGradient(0, 0, W2 * 0.7, H2 * 0.7);
    gl.addColorStop(0, "rgba(255,255,255,.18)"); gl.addColorStop(0.5, "rgba(255,255,255,0)");
    c.fillStyle = gl; c.fillRect(0, 0, W2, H2);
    const vg = c.createRadialGradient(W2 / 2, H2 / 2, H2 * 0.3, W2 / 2, H2 / 2, H2 * 0.85);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.35)");
    c.fillStyle = vg; c.fillRect(0, 0, W2, H2);
    c.restore();
  });
  c.restore();
  return { sw: 725 };
}

function pinkBox(c, s, size, o = {}) {
  const f = SERIF(size, { align: "center", italic: o.italic });
  const w = K.measure(c, s, f) + size * 0.6, h = size * 1.3;
  c.fillStyle = PINKBOX; c.fillRect(-w / 2, -h * 0.76, w, h);
  K.text(c, s, 0, 0, f);
}
function bubbly(c, s, size, o = {}) {
  const f = { family: "Fredoka", size, weight: 700, track: -size * 0.02, align: "center" };
  K.text(c, s, 0, 0, { ...f, color: "#fff", stroke: o.edge || LAV, strokeW: size * 0.28 });
  K.text(c, s, 0, 0, { ...f, color: o.fill || "#fffdf6" });
}
const notepadText = (lines, at, o = {}) => (c, w, h, t) => {
  const f = MONO(o.size || 34);
  const all = K.typed(lines.join("\n"), t, at, o.cps || 40);
  all.split("\n").forEach((l, i) => K.text(c, l, 14, 40 + i * (o.size || 34) * 1.05, { ...f, color: o.color || "#111" }));
};

// ----------------------------------------------------------------- slides --
const D = 5;
const floatWin = (x, y, rot, w, h, title, paint, at, inn, o) => ({ x, y, rot, in: inn, at, float: 1, draw: (c, t) => win95(c, w, h, title, (c, ww, hh) => paint(c, ww, hh, t), o) });
window.CAROUSEL = {
  kit: true,
  title: "Vibe Editing vs Timeline Editing",
  dur: D,
  cuts: ["tv"],
  fg: (c, t) => { K.grain(c, t, 0.1); K.vignette(c, 0.12); },
  slides: [
    // 1 · Hook
    {
      bg: (c, t) => meadowBg(c, t),
      els: [
        floatWin(175, 95, -4, 330, 280, "editor.exe", (c, w, h, t) => CARDS.editor(c, w, h, t, { mode: "messy" }, {}), 0.4, "left"),
        floatWin(880, 85, 5, 320, 300, "Untitled - Notepad", (c, w, h, t) => CARDS.reel(c, w, h, t, { look: "teal", caps: [["JUST"], ["VIBE."]], capsAt: 1.0 }, { D }), 0.5, "right"),
        { x: 540, y: 640, in: "up", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 1300, (c, sw, sh) => {
          FOOTAGE.drawFootage(c, "meadow_lapse", t, sw, sh, "raw", 0.5);
          c.translate(sw / 2, 0);
          const e1 = outBack(win(0.5, 0.9, t), 2), e2 = outBack(win(0.8, 1.2, t), 2), e3 = outBack(win(1.1, 1.5, t), 2.4);
          c.save(); c.translate(0, 190); c.scale(e1, e1); white(c, "Same reel.", 0, 0, 132, { align: "center" }); c.restore();
          c.save(); c.translate(0, 320); c.scale(e2, e2); pinkBox(c, "3 hours vs 15 min", 76); c.restore();
          c.save(); c.translate(0, 450); c.rotate(-0.04); c.scale(e3, e3); bubbly(c, "timeline vs vibe", 70); c.restore();
        }, t) },
        floatWin(150, 1180, 6, 300, 300, "before.bmp", (c, w, h, t) => K.photo(c, 0, 0, w, h, "street_vlog", t, "log", 0, 0.5), 0.7, "left"),
        floatWin(860, 1200, -5, 360, 300, "Untitled - Notepad", notepadText(["(some) things", "i don't miss:", "* rendering", "* 46 clips"], 1.0), 0.8, "right"),
        { x: 900, y: 1050, rot: -6, in: "pop", at: 1.8, draw: (c, t) => { c.translate(Math.sin(t * 5) * 6, 0); bubbly(c, "swipe →", 52, { edge: "#555" }); } },
      ],
    },
    // 2 · The timeline way
    {
      bg: (c, t) => meadowBg(c, t, 1.08),
      els: [
        { x: 420, y: 520, rot: -4, in: "left", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 1050, (c, sw, sh) => CARDS.editor(c, sw, sh, t, { mode: "messy", seed: 3 }, {}), t) },
        floatWin(820, 300, 4, 420, 200, "Rendering...", (c, w, h, t) => {
          K.text(c, "reel_FINAL_v7.mp4", 16, 34, W95(20));
          c.fillStyle = "#fff"; c.fillRect(16, 52, w - 32, 30); bevel(c, 16, 52, w - 32, 30, true);
          const p = 0.1 + 0.04 * clamp(t / 4.5);
          for (let x = 20; x < 20 + (w - 40) * p; x += 16) { c.fillStyle = NAVY; c.fillRect(x, 56, 12, 22); }
          K.text(c, `${Math.floor(p * 100)}%  ·  2h ${41 + Math.floor(t * 3)}m left`, 16, 116, W95(19));
        }, 0.6, "right", { menu: false, fill: "#c3c3c3" }),
        floatWin(770, 560, -3, 420, 190, "editor.exe", (c, w, h, t) => {
          c.fillStyle = "#e5484d"; c.beginPath(); c.arc(50, 60, 26, 0, 7); c.fill();
          c.strokeStyle = "#fff"; c.lineWidth = 6; c.beginPath(); c.moveTo(40, 50); c.lineTo(60, 70); c.moveTo(60, 50); c.lineTo(40, 70); c.stroke();
          K.text(c, "editor.exe is", 96, 52, W95(22, { weight: 700 })); K.text(c, "Not Responding", 96, 80, W95(22));
        }, 1.3, "pop", { menu: false, fill: "#c3c3c3" }),
        floatWin(260, 1010, 5, 400, 190, "Warning", (c) => {
          c.fillStyle = "#ffcc00"; c.beginPath(); c.moveTo(50, 32); c.lineTo(80, 86); c.lineTo(20, 86); c.closePath(); c.fill();
          K.text(c, "!", 50, 80, W95(36, { weight: 800, align: "center" }));
          K.text(c, "Disk almost full.", 100, 56, W95(22, { weight: 700 })); K.text(c, "Delete cache?", 100, 84, W95(22));
        }, 2.0, "pop", { menu: false, fill: "#c3c3c3" }),
        { x: 760, y: 980, in: "right", at: 0.3, draw: (c) => { white(c, "the timeline", 0, 0, 92, { align: "center" }); white(c, "way", 0, 92, 92, { align: "center" }); } },
        { x: 760, y: 1210, in: "right", at: 0.5, draw: (c) => pinkBox(c, "3 hours, 200 clicks", 62) },
      ],
    },
    // 3 · The vibe way
    {
      bg: (c, t) => meadowBg(c, t, 1.04),
      els: [
        { x: 290, y: 175, rot: -4, in: "pop", at: 0.05, draw: (c) => bubbly(c, "the vibe way", 84) },
        { x: 300, y: 300, in: "left", at: 0.25, draw: (c) => pinkBox(c, "type it. done.", 70, { italic: true }) },
        { x: 640, y: 720, rot: 3, in: "right", at: 0.1, float: 0.6, draw: (c, t) => crt(c, 1180, (c, sw, sh) => CARDS.prompt(c, sw, sh, t, { text: "30s reel, punchy, cut on the beat, captions, teal & orange", at: 0.7, cps: 30, fs: 30, press: 3.0, doneLabel: "✓  EDIT READY" }, { D }), t) },
        floatWin(230, 1140, -4, 420, 300, "log.txt - Notepad", notepadText(["> cut 46 clips to beat", "> captions synced", "> graded teal&orange", "> 4 sfx added", "> done in 0:42"], 3.1, { cps: 40, size: 32, color: "#0a6b2a" }), 0.5, "left"),
        floatWin(900, 260, 6, 300, 240, "result.mp4", (c, w, h, t) => CARDS.reel(c, w, h, t, { look: "teal", title: "VIBE", titleAt: 3.3 }, { D }), 3.0, "pop"),
      ],
    },
    // 4 · Where the time goes
    {
      bg: (c, t) => meadowBg(c, t, 1.12),
      els: [
        { x: 540, y: 170, in: "down", at: 0.05, draw: (c) => white(c, "where the time goes", 0, 0, 84, { align: "center" }) },
        { x: 540, y: 260, in: "down", at: 0.2, draw: (c) => pinkBox(c, "same 30s reel", 56, { italic: true }) },
        floatWin(540, 790, -1.5, 960, 860, "time_spent.txt - Notepad", (c, w, h, t) => {
          const rows = [["cutting", 60, 1], ["captions", 45, 1], ["color", 30, 0.3], ["sound fx", 25, 0.5], ["export + fixes", 20, 2]];
          K.text(c, "task", 24, 54, MONO(40)); K.text(c, "timeline", 330, 54, MONO(40, { color: "#666" })); K.text(c, "vibe", 760, 54, MONO(40, { color: "#c2387a" }));
          c.fillStyle = "#ddd"; c.fillRect(20, 74, w - 40, 2);
          rows.forEach(([k, a, b], i) => {
            const y = 140 + i * 112, at = 0.6 + i * 0.32, u = outCubic(win(at, at + 0.6, t));
            K.text(c, k, 24, y, MONO(42));
            c.fillStyle = "#9a9a9a"; c.fillRect(330, y - 30, 330 * (a / 60) * u, 34);
            K.text(c, `${Math.round(a * u)}m`, 330 + 330 * (a / 60) * u + 10, y, MONO(36, { color: "#555" }));
            c.fillStyle = "#e5779e"; c.fillRect(760, y - 30, Math.max(6, 120 * (b / 2)) * u, 34);
            K.text(c, b < 1 ? `${Math.round(b * 60)}s` : `${b}m`, 760 + Math.max(6, 120 * (b / 2)) * u + 10, y, MONO(36, { color: "#c2387a" }));
          });
          c.fillStyle = "#111"; c.fillRect(20, 700, w - 40, 2);
          const tt = win(2.4, 3.0, t);
          K.text(c, "total", 24, 760, MONO(48));
          K.text(c, `${(3 * tt).toFixed(1)}h`, 330, 760, MONO(56, { color: "#555" }));
          K.text(c, `${Math.round(15 * tt)}m`, 760, 760, MONO(56, { color: "#c2387a" }));
        }, 0.15, "up"),
      ],
    },
    // 5 · The part that still matters
    {
      bg: (c, t) => meadowBg(c, t, 1.02),
      els: [
        { x: 540, y: 160, in: "down", at: 0.05, draw: (c) => white(c, "you still do", 0, 0, 100, { align: "center" }) },
        { x: 540, y: 270, in: "down", at: 0.2, draw: (c) => pinkBox(c, "the part that matters", 66, { italic: true }) },
        floatWin(330, 480, -4, 520, 210, "1_pick.txt - Notepad", notepadText(["pick the best", "moments"], 0.8, { size: 44 }), 0.4, "left"),
        floatWin(420, 730, 2, 520, 210, "2_vibe.txt - Notepad", notepadText(["write the vibe", "in one sentence"], 1.5, { size: 44 }), 0.9, "left"),
        floatWin(330, 980, -3, 520, 210, "3_notes.txt - Notepad", notepadText(["give 3 notes,", "then post"], 2.2, { size: 44 }), 1.4, "left"),
        { x: 830, y: 1090, rot: 4, in: "right", at: 0.6, float: 0.6, draw: (c, t) => crt(c, 640, (c, sw, sh) => {
          FOOTAGE.drawFootage(c, "vlog_studio", t, sw, sh, "raw", 0.5);
        }, t) },
        { x: 820, y: 760, rot: 6, in: "pop", at: 2.8, draw: (c) => bubbly(c, "AI does the rest", 50) },
      ],
    },
    // 6 · CTA
    {
      bg: (c, t) => meadowBg(c, t),
      els: [
        floatWin(180, 120, -5, 330, 230, "prompt_pack.pdf", (c, w, h) => c.drawImage(K.IMG.pack, 0, 0, w, h), 0.4, "left", { menu: false }),
        floatWin(880, 110, 5, 340, 230, "Untitled - Notepad", notepadText(["new vibe", "edit tips", "every day"], 1.0, { size: 38 }), 0.5, "right"),
        { x: 540, y: 660, in: "up", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 1300, (c, sw, sh) => {
          FOOTAGE.drawFootage(c, "meadow_lapse", t, sw, sh, "raw", 0.5);
          c.translate(sw / 2, 0);
          const e1 = outBack(win(0.4, 0.8, t), 2), e2 = outBack(win(0.7, 1.1, t), 2), e3 = outBack(win(1.0, 1.4, t), 2.4);
          c.save(); c.translate(0, 190); c.scale(e1, e1); white(c, "Comment", 0, 0, 130, { align: "center" }); c.restore();
          c.save(); c.translate(0, 330); c.scale(e2 * (1 + 0.03 * Math.sin(t * 5)), e2 * (1 + 0.03 * Math.sin(t * 5))); pinkBox(c, "\"VIBE\"", 110); c.restore();
          c.save(); c.translate(0, 460); c.rotate(-0.04); c.scale(e3, e3); bubbly(c, "free prompt pack", 64); c.restore();
        }, t) },
        floatWin(200, 1200, 5, 360, 210, "save.exe", (c, w, h, t) => { K.text(c, "Save this post?", 20, 50, W95(26, { weight: 700 })); const on = t > 2.4; c.fillStyle = "#c3c3c3"; c.fillRect(20, 90, 140, 50); bevel(c, 20, 90, 140, 50, on); K.text(c, on ? "Saved ✓" : "Yes", 90, 124, W95(24, { weight: 700, align: "center" })); }, 0.7, "left", { menu: false, fill: "#c3c3c3" }),
        floatWin(870, 1210, -4, 360, 210, "follow.txt - Notepad", notepadText(["follow for", "more →"], 1.4, { size: 44 }), 0.8, "right"),
      ],
    },
  ],
};
})();
