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
let MEADOW = null;
function paintMeadow() {
  return K.once(K.W, K.H, (c, W, H) => {
    const r = rnd(21);
    const sky = c.createLinearGradient(0, 0, 0, 520);
    sky.addColorStop(0, "#b8c7d3"); sky.addColorStop(0.7, "#dde3e1"); sky.addColorStop(1, "#e9ebe3");
    c.fillStyle = sky; c.fillRect(0, 0, W, 560);
    c.filter = "blur(30px)";
    for (let i = 0; i < 9; i++) { c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(r() * W, 80 + r() * 250, 160 + r() * 200, 50 + r() * 50, 0, 0, 7); c.fill(); }
    c.filter = "blur(6px)";
    c.fillStyle = "#7d8d6a"; c.beginPath(); c.moveTo(0, 520);
    for (let x = 0; x <= W; x += 40) c.lineTo(x, 470 + Math.sin(x * 0.01) * 14 + r() * 18);
    c.lineTo(W, 560); c.lineTo(0, 560); c.fill();
    c.filter = "none";
    const g = c.createLinearGradient(0, 500, 0, H);
    g.addColorStop(0, "#9aa77a"); g.addColorStop(0.35, "#768a4c"); g.addColorStop(1, "#4d6630");
    c.fillStyle = g; c.fillRect(0, 500, W, H - 500);
    // grass strokes, softer and smaller toward the horizon
    for (let i = 0; i < 9000; i++) {
      const y = 500 + Math.pow(r(), 0.8) * (H - 500), k = (y - 500) / (H - 500);
      const x = r() * W, len = 6 + k * 34;
      c.strokeStyle = r() < 0.5 ? `rgba(60,85,30,${0.25 + 0.3 * k})` : `rgba(170,190,120,${0.18 + 0.25 * k})`;
      c.lineWidth = 0.8 + k * 1.6;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * len * 0.6, y - len); c.stroke();
    }
    // clover flowers and pink daisies
    for (let i = 0; i < 900; i++) {
      const y = 520 + Math.pow(r(), 0.9) * (H - 520), k = (y - 500) / (H - 500);
      const x = r() * W, s = 1.5 + k * 7;
      if (r() < 0.12) {
        c.fillStyle = r() < 0.5 ? "#f0a5c3" : "#e5799f";
        for (let p = 0; p < 6; p++) { const a = (p / 6) * Math.PI * 2; c.beginPath(); c.ellipse(x + Math.cos(a) * s, y + Math.sin(a) * s * 0.6, s * 0.9, s * 0.45, a, 0, 7); c.fill(); }
        c.fillStyle = "#f6d36b"; c.beginPath(); c.arc(x, y, s * 0.5, 0, 7); c.fill();
      } else {
        c.fillStyle = `rgba(250,250,245,${0.6 + 0.4 * k})`; c.beginPath(); c.arc(x, y, s * 0.7, 0, 7); c.fill();
      }
    }
    const haze = c.createLinearGradient(0, 440, 0, 760);
    haze.addColorStop(0, "rgba(230,234,228,.7)"); haze.addColorStop(1, "rgba(230,234,228,0)");
    c.fillStyle = haze; c.fillRect(0, 440, W, 320);
  });
}
function meadowBg(c, t, zoom = 1) {
  const u = (2 * Math.PI * t) / 5, k = zoom * (1.02 + 0.01 * Math.sin(u));
  c.drawImage(MEADOW, (K.W - K.W * k) / 2 + 8 * Math.sin(u), (K.H - K.H * k) / 2, K.W * k, K.H * k);
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
function crt(c, w, paint, t) {
  const h = w * 0.86, sw = w * 0.78, sh = h * 0.66, sy = -h * 0.06;
  c.save(); c.shadowColor = "rgba(30,40,20,.35)"; c.shadowBlur = 50; c.shadowOffsetY = 30;
  c.fillStyle = "#e2dccb"; c.beginPath(); c.ellipse(0, h * 0.5 + w * 0.06, w * 0.3, w * 0.07, 0, 0, 7); c.fill();
  c.restore();
  c.fillStyle = "#d8d1bd"; rr(c, -w * 0.16, h * 0.4, w * 0.32, w * 0.1, 10); c.fill();
  const body = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  body.addColorStop(0, "#f4efe3"); body.addColorStop(0.6, "#e8e2d2"); body.addColorStop(1, "#d6cfbb");
  c.save(); c.shadowColor = "rgba(30,40,20,.35)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
  rr(c, -w / 2, -h / 2, w, h, w * 0.05); c.fillStyle = body; c.fill(); c.restore();
  c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 3; rr(c, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, w * 0.05); c.stroke();
  // bezel recess
  const bz = 26;
  const bg = c.createLinearGradient(0, sy - sh / 2 - bz, 0, sy + sh / 2 + bz);
  bg.addColorStop(0, "#c9c2ad"); bg.addColorStop(1, "#ece6d8");
  rr(c, -sw / 2 - bz, sy - sh / 2 - bz, sw + bz * 2, sh + bz * 2, 30); c.fillStyle = bg; c.fill();
  c.save(); rr(c, -sw / 2, sy - sh / 2, sw, sh, 24); c.clip();
  c.translate(-sw / 2, sy - sh / 2);
  c.save(); paint(c, sw, sh); c.restore();
  c.fillStyle = "rgba(0,0,0,.05)"; for (let y = 0; y < sh; y += 4) c.fillRect(0, y, sw, 1.5);
  const gl = c.createLinearGradient(0, 0, sw * 0.7, sh * 0.7);
  gl.addColorStop(0, "rgba(255,255,255,.22)"); gl.addColorStop(0.5, "rgba(255,255,255,0)");
  c.fillStyle = gl; c.fillRect(0, 0, sw, sh);
  const vg = c.createRadialGradient(sw / 2, sh / 2, sh * 0.3, sw / 2, sh / 2, sh * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.28)");
  c.fillStyle = vg; c.fillRect(0, 0, sw, sh);
  c.restore();
  // chin: vent, buttons, power
  const cy = sy + sh / 2 + bz + (h / 2 - sy - sh / 2 - bz) / 2;
  c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = 2; rr(c, -w * 0.4, cy - 18, w * 0.18, 36, 6); c.stroke();
  for (const dx of [0.17, 0.23]) { c.fillStyle = "#ddd6c4"; c.beginPath(); c.ellipse(w * dx, cy + 4, 20, 13, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(0,0,0,.18)"; c.stroke(); }
  c.fillStyle = "#e9e3d4"; c.beginPath(); c.arc(w * 0.38, cy - 4, 26, 0, 7); c.fill(); c.strokeStyle = "rgba(0,0,0,.2)"; c.stroke();
  c.fillStyle = Math.floor(t * 2) % 2 ? "#57d36b" : "#3fbf55"; c.beginPath(); c.arc(w * 0.31, cy - 4, 5, 0, 7); c.fill();
  return { sw, sh };
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
  setup: () => { MEADOW = paintMeadow(); },
  fg: (c, t) => { K.grain(c, t, 0.1); K.vignette(c, 0.12); },
  slides: [
    // 1 · Hook
    {
      bg: (c, t) => meadowBg(c, t),
      els: [
        floatWin(175, 95, -4, 330, 280, "editor.exe", (c, w, h, t) => CARDS.editor(c, w, h, t, { mode: "messy" }, {}), 0.4, "left"),
        floatWin(880, 85, 5, 320, 300, "Untitled - Notepad", (c, w, h, t) => CARDS.reel(c, w, h, t, { look: "teal", caps: [["JUST"], ["VIBE."]], capsAt: 1.0 }, { D }), 0.5, "right"),
        { x: 540, y: 640, in: "up", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 930, (c, sw, sh) => {
          c.save(); c.translate(-((K.W - sw) / 2), -720); meadowBg(c, t, 1.1); c.restore();
          c.translate(sw / 2, 0);
          const e1 = outBack(win(0.5, 0.9, t), 2), e2 = outBack(win(0.8, 1.2, t), 2), e3 = outBack(win(1.1, 1.5, t), 2.4);
          c.save(); c.translate(0, 190); c.scale(e1, e1); white(c, "Same reel.", 0, 0, 132, { align: "center" }); c.restore();
          c.save(); c.translate(0, 320); c.scale(e2, e2); pinkBox(c, "3 hours vs 15 min", 76); c.restore();
          c.save(); c.translate(0, 450); c.rotate(-0.04); c.scale(e3, e3); bubbly(c, "timeline vs vibe", 70); c.restore();
        }, t) },
        floatWin(150, 1180, 6, 300, 300, "before.bmp", (c, w, h, t) => K.photo(c, 0, 0, w, h, "sunrise", t * 0.2, "log"), 0.7, "left"),
        floatWin(860, 1200, -5, 360, 300, "Untitled - Notepad", notepadText(["(some) things", "i don't miss:", "* rendering", "* 46 clips"], 1.0), 0.8, "right"),
        { x: 900, y: 1050, rot: -6, in: "pop", at: 1.8, draw: (c, t) => { c.translate(Math.sin(t * 5) * 6, 0); bubbly(c, "swipe →", 52, { edge: "#555" }); } },
      ],
    },
    // 2 · The timeline way
    {
      bg: (c, t) => meadowBg(c, t, 1.08),
      els: [
        { x: 420, y: 520, rot: -4, in: "left", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 760, (c, sw, sh) => CARDS.editor(c, sw, sh, t, { mode: "messy", seed: 3 }, {}), t) },
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
        { x: 640, y: 720, rot: 3, in: "right", at: 0.1, float: 0.6, draw: (c, t) => crt(c, 860, (c, sw, sh) => CARDS.prompt(c, sw, sh, t, { text: "30s reel, punchy, cut on the beat, captions, teal & orange", at: 0.7, cps: 30, fs: 30, press: 3.0, doneLabel: "✓  EDIT READY" }, { D }), t) },
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
        { x: 830, y: 1090, rot: 4, in: "right", at: 0.6, float: 0.6, draw: (c, t) => crt(c, 440, (c, sw, sh) => {
          c.fillStyle = "#14101f"; c.fillRect(0, 0, sw, sh);
          K.bro(c, sw / 2, sh * 0.86, 1.5, { eyes: t > 2.6 ? "happy" : null, glow: 0.6, wave: t > 2.6 ? 0.9 + 0.3 * Math.sin(t * 9) : 0 });
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
        { x: 540, y: 660, in: "up", at: 0.05, float: 0.6, draw: (c, t) => crt(c, 930, (c, sw, sh) => {
          c.save(); c.translate(-((K.W - sw) / 2), -720); meadowBg(c, t, 1.1); c.restore();
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
