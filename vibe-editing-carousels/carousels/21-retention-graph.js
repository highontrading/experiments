// Carousel 21: Read Your Retention Graph.
// Design system: a phosphor-green terminal. Black screen with scanlines and glow, VT323 and
// Space Mono, ASCII-box windows, a blinking cursor, real reels playing in "monitor" panes
// with timecodes, and retention curves that draw themselves with the drops flagged in red.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const GREEN = "#39ff7a", DIMG = "rgba(57,255,122,.45)", RED = "#ff4d5e", AMBER = "#ffd166";
const VT = (size, o = {}) => ({ family: "VT323", size, weight: 400, color: GREEN, lh: 1.0, ...o });
const MONO = (size, o = {}) => ({ family: "SpaceMono", size, weight: 400, color: GREEN, lh: 1.35, ...o });

function screen(c, t) {
  c.fillStyle = "#030603"; c.fillRect(0, 0, K.W, K.H);
  const g = c.createRadialGradient(K.W / 2, K.H / 2, 100, K.W / 2, K.H / 2, K.H * 0.8);
  g.addColorStop(0, "rgba(20,70,35,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
function crt(c, t) {
  c.fillStyle = "rgba(0,0,0,.22)"; for (let y = 0; y < K.H; y += 4) c.fillRect(0, y, K.W, 2);
  const y = ((t * 260) % (K.H + 200)) - 100; const g = c.createLinearGradient(0, y - 80, 0, y + 80);
  g.addColorStop(0, "rgba(57,255,122,0)"); g.addColorStop(0.5, "rgba(57,255,122,.05)"); g.addColorStop(1, "rgba(57,255,122,0)");
  c.fillStyle = g; c.fillRect(0, y - 80, K.W, 160);
  K.vignette(c, 0.5); K.grain(c, t, 0.08);
}
function glow(c, fn) { c.save(); c.shadowColor = GREEN; c.shadowBlur = 14; fn(); c.restore(); }
// ASCII-style window box centred at (0,0).
function box(c, w, h, title) {
  c.strokeStyle = GREEN; c.lineWidth = 2; c.strokeRect(-w / 2, -h / 2, w, h); c.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
  if (title) { const tw = K.measure(c, ` ${title} `, VT(30)) + 10; c.fillStyle = "#030603"; c.fillRect(-w / 2 + 30, -h / 2 - 14, tw, 28); K.text(c, ` ${title} `, -w / 2 + 35, -h / 2 + 10, VT(30)); }
}
// A real clip in a green-tinted monitor pane with timecode and REC dot.
function monitor(c, w, h, clip, t, o = {}) {
  box(c, w + 24, h + 24, o.title || "PLAYBACK");
  c.save(); c.filter = o.raw ? "none" : "saturate(0.55) contrast(1.1)";
  K.photo(c, -w / 2, -h / 2, w, h, clip, t, "raw", 0, o.focus ?? 0.5); c.restore();
  c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(120,255,170,.85)"; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  const sec = o.sec ?? (t % 8);
  K.text(c, `00:0${Math.floor(sec)}:${String(Math.floor((sec % 1) * 30)).padStart(2, "0")}`, -w / 2 + 14, -h / 2 + 34, VT(32, { color: "#eafff0" }));
  if (Math.floor(t * 2) % 2) { c.fillStyle = RED; c.beginPath(); c.arc(w / 2 - 24, -h / 2 + 24, 9, 0, 7); c.fill(); }
}
// Retention curve: pts are [time 0..1, retention 0..1]; draws up to `u`; marks flags.
function curve(c, w, h, pts, u, flags = [], o = {}) {
  c.strokeStyle = DIMG; c.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const y = -h / 2 + (i / 4) * h; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(-w / 2, y); c.lineTo(w / 2, y); c.stroke(); K.text(c, `${100 - i * 25}%`, -w / 2 - 12, y + 8, VT(24, { align: "right", color: DIMG })); }
  c.setLineDash([]);
  const P = (p) => [-w / 2 + p[0] * w, h / 2 - p[1] * h];
  const at = (x) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i], k = (x - a[0]) / (b[0] - a[0]); return [x, lerp(a[1], b[1], k)]; } return pts[pts.length - 1]; };
  glow(c, () => {
    c.strokeStyle = o.col || GREEN; c.lineWidth = 5; c.beginPath();
    for (let x = 0; x <= u; x += 0.005) { const [px, py] = P(at(x)); x ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
  });
  if (o.ghost) { c.strokeStyle = "rgba(255,77,94,.55)"; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath(); o.ghost.forEach((p, i) => { const [px, py] = P(p); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); c.setLineDash([]); }
  flags.forEach(([x, label]) => {
    if (u < x) return;
    const [px, py] = P(at(x)), b = pulse(u, x, 6);
    c.fillStyle = RED; c.beginPath(); c.arc(px, py, 10 + 6 * b, 0, 7); c.fill();
    const right = x > 0.55;
    K.text(c, label, px + (right ? -18 : 18), py - 16, VT(32, { color: RED, align: right ? "right" : "left" }));
  });
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const prompt = (y, s, at = 0.2, size = 52) => el(70, y, (c, t) => {
  const shown = K.typed(s, t, at, 28);
  glow(c, () => K.text(c, shown + (K.caret(t) ? "█" : ""), 0, 0, VT(size)));
}, at, "none");
const FLAT = [[0, 1], [0.08, 0.55], [0.4, 0.42], [0.7, 0.3], [0.9, 0.22], [1, 0.12]];
const FIXED = [[0, 1], [0.08, 0.88], [0.4, 0.74], [0.7, 0.66], [0.9, 0.6], [1, 0.58]];

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Read Your Retention Graph",
  dur: D,
  bg: screen,
  fg: crt,
  slides: [
    // 1 · Hook
    { els: [
      el(70, 100, (c) => K.text(c, "vibe@editing:~$ analytics --reel 042", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(230, "> where do viewers leave?", 0.2, 76),
      el(K.W / 2, 600, (c, t) => {
        box(c, 940, 420, "AUDIENCE RETENTION");
        c.save(); c.translate(30, -10); curve(c, 800, 300, FLAT, win(0.6, 3.0, t), [[0.08, "0:03 · 45% GONE"]]); c.restore();
      }, 0.4, "fade"),
      el(300, 1080, (c, t) => monitor(c, 360, 330, "scrolling", t, { title: "THEM", focus: 0.5 }), 0.8, "left"),
      el(760, 1010, (c) => K.text(c, "Your graph\ntells you\nexactly where.", 0, 0, VT(66, { align: "center" })), 1.2),
      el(760, 1230, (c) => K.text(c, "[ swipe → 3 drops, 3 fixes ]", 0, 0, VT(34, { align: "center", color: AMBER })), 1.6),
    ] },
    // 2 · Drop 1: the cliff
    { els: [
      el(70, 100, (c) => K.text(c, "DROP 01 / 03", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(220, "> the 0:03 cliff", 0.2, 80),
      el(70, 290, (c) => K.text(c, "Half your viewers leave before the first point lands.\nFix: open on the payoff, not the intro.", 0, 0, MONO(28)), 0.6),
      el(K.W / 2, 640, (c, t) => {
        box(c, 940, 380, "RETENTION · BEFORE vs AFTER");
        c.save(); c.translate(30, -10); curve(c, 800, 270, FIXED, win(1.0, 2.8, t), [[0.08, "0:03 · KEPT 88%"]], { ghost: FLAT }); c.restore();
      }, 0.4),
      el(290, 1070, (c, t) => monitor(c, 380, 300, "vlog_talk", t, { title: "BEFORE: \"hey guys...\"", sec: (t % 3) })),
      el(790, 1070, (c, t) => monitor(c, 380, 300, "dance_girls", t, { title: "AFTER: the result", sec: (t % 3), raw: true })),
    ] },
    // 3 · Drop 2: the sag
    { els: [
      el(70, 100, (c) => K.text(c, "DROP 02 / 03", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(220, "> the mid-video sag", 0.2, 80),
      el(70, 290, (c) => K.text(c, "A slow stretch with nothing new on screen.\nFix: cut the dead air, change the shot every 2-3 s.", 0, 0, MONO(28)), 0.6),
      el(K.W / 2, 690, (c, t) => {
        box(c, 940, 440, "RETENTION · 0:00 → 0:30");
        const sag = [[0, 1], [0.1, 0.8], [0.35, 0.74], [0.45, 0.5], [0.6, 0.44], [1, 0.36]];
        c.save(); c.translate(30, -10); curve(c, 800, 320, sag, win(0.8, 2.6, t), [[0.45, "0:14 · SAG"]]);
        const x0 = -400 + 0.36 * 800, x1 = -400 + 0.6 * 800; c.fillStyle = "rgba(255,77,94,.12)"; c.fillRect(x0, -160, x1 - x0, 320); c.restore();
      }, 0.4),
      el(K.W / 2, 1120, (c, t) => {
        box(c, 940, 250, "TIMELINE");
        const cut = outCubic(win(2.6, 3.4, t));
        for (let i = 0; i < 12; i++) {
          const dead = i >= 4 && i <= 6, x = -440 + i * 74 - (i > 6 ? cut * 3 * 74 : 0), w = 66 * (dead ? 1 - cut : 1);
          if (w < 2) continue;
          c.fillStyle = dead ? RED : GREEN; c.globalAlpha = dead ? 0.7 : 0.85; c.fillRect(x, -50, w, 100); c.globalAlpha = 1;
        }
        K.text(c, t > 3.4 ? "-6 s · dead air removed" : "3 dead clips", 420, 100, VT(30, { align: "right", color: t > 3.4 ? GREEN : RED }));
      }, 0.8),
    ] },
    // 4 · Drop 3: the ending
    { els: [
      el(70, 100, (c) => K.text(c, "DROP 03 / 03", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(220, "> the early exit", 0.2, 80),
      el(70, 290, (c) => K.text(c, "People leave when they feel it ending.\nFix: cut the outro, end mid-sentence into a loop.", 0, 0, MONO(28)), 0.6),
      el(K.W / 2, 650, (c, t) => {
        box(c, 940, 380, "RETENTION · LAST 5 s");
        const end = [[0, 1], [0.6, 0.92], [0.75, 0.6], [1, 0.4]];
        c.save(); c.translate(30, -10); curve(c, 800, 270, end, win(0.8, 2.4, t), [[0.75, "\"thanks for watching\" · -32%"]]); c.restore();
      }, 0.4),
      el(K.W / 2, 1080, (c, t) => {
        monitor(c, 620, 340, "skate_road", t, { title: "LOOP", raw: true, sec: (t % 5) });
        const a = (t % 2.5) / 2.5 * Math.PI * 2;
        c.strokeStyle = AMBER; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 70, a, a + 4.6); c.stroke();
        c.fillStyle = AMBER; c.beginPath(); const ax = Math.cos(a + 4.6) * 70, ay = Math.sin(a + 4.6) * 70; c.arc(ax, ay, 10, 0, 7); c.fill();
      }, 0.9, "up", { far: 0.4 }),
    ] },
    // 5 · The prompt
    { els: [
      el(70, 100, (c) => K.text(c, "RUN IT", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(220, "> vibe fix --retention", 0.2, 80),
      el(K.W / 2, 720, (c, t) => {
        box(c, 940, 760, "VIBE COPILOT");
        const lines = [
          ["$ \"open on the payoff, cut every pause,", GREEN], ["   new shot every 2-3 s, end into a loop\"", GREEN], ["", GREEN],
          ["[ok] hook moved to 0:00 ......... 0.4 s", GREEN], ["[ok] 11 pauses removed ........... -6.1 s", GREEN],
          ["[ok] 9 B-roll cuts added", GREEN], ["[ok] outro trimmed, loop point set", GREEN], ["", GREEN],
          ["predicted 0:03 hold: 45% -> 88%", AMBER], ["done in 0:42", AMBER],
        ];
        lines.forEach(([s, col], i) => { const at = 0.8 + i * 0.22; if (t > at) K.text(c, K.typed(s, t, at, 110), -430, -300 + i * 62, VT(40, { color: col })); });
      }, 0.4),
      el(K.W / 2, 1210, (c) => K.text(c, "[ example numbers. read your own graph. ]", 0, 0, VT(30, { align: "center", color: DIMG })), 2.0),
    ] },
    // 6 · CTA
    { els: [
      el(70, 100, (c) => K.text(c, "vibe@editing:~$ subscribe", 0, 0, MONO(22, { color: DIMG })), 0.05),
      prompt(290, "> comment", 0.2, 120),
      el(70, 480, (c, t) => { const on = Math.floor(t * 2) % 2; glow(c, () => K.text(c, "\"VIBE\"", 0, 0, VT(230, { color: on ? GREEN : "#b6ffcf" }))); }, 0.7, "fade"),
      el(70, 590, (c) => K.text(c, "and get the free prompt pack,\nretention-fix prompt included.", 0, 0, MONO(32)), 1.0),
      el(K.W / 2, 980, (c, t) => {
        box(c, 940, 360, "YOUR NEXT GRAPH");
        c.save(); c.translate(30, -10); curve(c, 800, 250, FIXED, win(1.2, 3.0, t), [], {}); c.restore();
      }, 1.0),
      el(K.W / 2, 1250, (c) => K.text(c, "[ save · share · follow ]", 0, 0, VT(40, { align: "center", color: AMBER })), 1.4),
    ] },
  ],
};
})();
