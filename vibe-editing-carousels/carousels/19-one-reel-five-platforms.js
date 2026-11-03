// Carousel 19: One Reel, Five Platforms.
// Design system: frosted glass over real night footage. A blurred, darkened city clip fills
// the frame; content sits on glass panels (blurred backdrop, white 14% tint, hairline border);
// clean Inter Display type, neon-cyan accents, aspect-ratio frames with dimension labels.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const CYAN = "#5ef2ff", WH = "#ffffff", DIM = "rgba(255,255,255,.62)";
const SANS = (size, o = {}) => ({ family: "InterD", size, weight: 700, color: WH, track: -size * 0.03, lh: 1.05, ...o });
const LIGHT = (size, o = {}) => ({ family: "InterD", size, weight: 300, color: WH, track: -size * 0.02, lh: 1.15, ...o });
const LBL = (size, o = {}) => ({ family: "InterL", size, weight: 600, color: DIM, track: size * 0.1, ...o });
let BG_CLIP = "tokyo_train";

function city(c, t, clip = BG_CLIP) {
  c.save(); c.filter = "blur(18px) brightness(0.55) saturate(1.3)";
  c.translate(-40, -40); FOOTAGE.drawFootage(c, clip, 0, K.W + 80, K.H + 80, "raw", 0.5); c.restore();
  const g = c.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, "rgba(10,12,30,.35)"); g.addColorStop(1, "rgba(10,12,30,.65)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
// A frosted-glass panel in the current transform, centred at (0,0).
function glass(c, w, h, r = 34) {
  c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 40; c.shadowOffsetY = 18;
  rr(c, -w / 2, -h / 2, w, h, r); c.fillStyle = "rgba(255,255,255,.10)"; c.fill(); c.restore();
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, "rgba(255,255,255,.18)"); g.addColorStop(1, "rgba(255,255,255,.04)");
  rr(c, -w / 2, -h / 2, w, h, r); c.fillStyle = g; c.fill();
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.5; c.stroke();
}
// The same clip in a given aspect ratio, `h` tall (or `w` wide when given), with a label.
function frame(c, ratio, size, clip, t, label, o = {}) {
  const [a, b] = ratio.split(":").map(Number);
  const h = o.byWidth ? size * b / a : size, w = o.byWidth ? size : size * a / b;
  c.save(); c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = "#000"; c.fill(); c.restore();
  K.photo(c, -w / 2, -h / 2, w, h, clip, t, "raw", 16, o.focus ?? 0.5);
  c.strokeStyle = o.hot ? CYAN : "rgba(255,255,255,.5)"; c.lineWidth = o.hot ? 4 : 2; rr(c, -w / 2, -h / 2, w, h, 16); c.stroke();
  if (label) { K.text(c, ratio, -w / 2, -h / 2 - 18, SANS(26, { color: o.hot ? CYAN : WH })); K.text(c, label, w / 2, -h / 2 - 18, LBL(16, { align: "right" })); }
  return [w, h];
}
function chip(c, s, hot) {
  const f = LBL(20, { color: hot ? "#05222a" : WH, weight: 700 }), w = K.measure(c, s, f) + 40;
  rr(c, -w / 2, -24, w, 48, 24); c.fillStyle = hot ? CYAN : "rgba(255,255,255,.14)"; c.fill();
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.5; c.stroke();
  K.text(c, s, 0, 7, { ...f, align: "center" });
  return w;
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const top = (n, s) => el(70, 110, (c) => K.text(c, `${n} · ${s}`, 0, 0, LBL(20)), 0.05);

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "One Reel, Five Platforms",
  dur: D,
  bg: (c, t) => city(c, t),
  fg: (c, t) => K.grain(c, t, 0.05),
  slides: [
    // 1 · Hook
    { bg: (c, t) => city(c, t, "times_square"), els: [
      top("01", "VIBE EDITING · REPURPOSE"),
      el(70, 290, (c) => K.text(c, "Film once.", 0, 0, SANS(140)), 0.15, "left"),
      el(70, 430, (c) => K.text(c, "Post everywhere.", 0, 0, LIGHT(120, { color: CYAN })), 0.3, "left"),
      el(70, 510, (c) => K.text(c, "One edit, five crops, zero re-editing.", 0, 0, LIGHT(36, { color: DIM })), 0.45),
      ...[["9:16", 520, "REELS", 165], ["4:5", 400, "FEED", 430], ["1:1", 300, "SQUARE", 660], ["16:9", 190, "YOUTUBE", 905]].map(([r, h, l, x], i) =>
        el(x, 900, (c, t) => frame(c, r, h, "street_vlog", t, l, { hot: i === 0 }), 0.5 + i * 0.12, "up", { far: 0.5, float: 1 })),
      el(K.W / 2, 1270, (c) => chip(c, "SWIPE FOR THE WORKFLOW →", false), 1.2, "pop"),
    ] },
    // 2 · 9:16: safe zones
    { els: [
      top("02", "VERTICAL · REELS, TIKTOK, SHORTS"),
      el(70, 270, (c) => K.text(c, "9:16 is home.", 0, 0, SANS(110)), 0.15, "left"),
      el(70, 350, (c) => K.text(c, "Keep text out of the app's buttons.", 0, 0, LIGHT(36, { color: DIM })), 0.3),
      el(370, 860, (c, t) => {
        const [w, h] = frame(c, "9:16", 820, "phone_model", t, "1080 × 1920", { hot: true });
        const u = outCubic(win(1.0, 1.6, t));
        c.fillStyle = `rgba(255,70,90,${0.32 * u})`;
        c.fillRect(-w / 2, h / 2 - h * 0.2, w, h * 0.2); c.fillRect(w / 2 - w * 0.16, -h / 2 + h * 0.3, w * 0.16, h * 0.5); c.fillRect(-w / 2, -h / 2, w, h * 0.08);
        c.strokeStyle = CYAN; c.lineWidth = 3; c.setLineDash([12, 8]); c.strokeRect(-w / 2 + 24, -h / 2 + h * 0.1, w * 0.78, h * 0.68 * u); c.setLineDash([]);
      }, 0.3, "up", { far: 0.5 }),
      el(820, 620, (c) => { glass(c, 380, 230); K.text(c, "SAFE ZONE", -160, -60, LBL(18, { color: CYAN })); K.text(c, "Captions and faces\ninside the dashed box.", -160, -10, LIGHT(30)); }, 1.0, "right"),
      el(820, 930, (c) => { glass(c, 380, 230); K.text(c, "RED ZONES", -160, -60, LBL(18, { color: "#ff6b7d" })); K.text(c, "Caption, likes and\nusername cover these.", -160, -10, LIGHT(30)); }, 1.3, "right"),
    ] },
    // 3 · 4:5 and 1:1: auto-reframe
    { els: [
      top("03", "FEED · 4:5 AND 1:1"),
      el(70, 270, (c) => K.text(c, "Reframe on the face.", 0, 0, SANS(96)), 0.15, "left"),
      el(70, 350, (c) => K.text(c, "Not a centre crop: the frame follows you.", 0, 0, LIGHT(36, { color: DIM })), 0.3),
      el(K.W / 2, 830, (c, t) => {
        glass(c, 960, 700);
        const W = 900, H = W * 9 / 16, f = 0.5 + 0.18 * Math.sin(t * 1.3);
        K.photo(c, -W / 2, -H / 2 - 40, W, H, "street_vlog", t, "raw", 12, 0.5);
        c.fillStyle = "rgba(0,0,0,.55)";
        const cw = H * 4 / 5, cx = -W / 2 + W * f - cw / 2;
        c.fillRect(-W / 2, -H / 2 - 40, cx + W / 2, H); c.fillRect(cx + cw, -H / 2 - 40, W / 2 - cx - cw, H);
        c.strokeStyle = CYAN; c.lineWidth = 4; rr(c, cx, -H / 2 - 40, cw, H, 8); c.stroke();
        K.text(c, "4:5 CROP · TRACKING FACE", cx + 10, -H / 2 - 52, LBL(16, { color: CYAN }));
        K.text(c, "SOURCE 16:9", -W / 2, H / 2 + 10, LBL(16));
        K.text(c, "the AI keeps your face in the crop, shot by shot", 0, H / 2 + 90, LIGHT(30, { align: "center" }));
      }, 0.35, "up", { far: 0.5 }),
      el(260, 1260, (c) => chip(c, "4:5 · 1080 × 1350", true), 0.9, "pop"),
      el(760, 1260, (c) => chip(c, "1:1 · 1080 × 1080", false), 1.0, "pop"),
    ] },
    // 4 · 16:9: widescreen
    { bg: (c, t) => city(c, t, "night_drive"), els: [
      top("04", "WIDESCREEN · YOUTUBE, LINKEDIN"),
      el(70, 270, (c) => K.text(c, "16:9 needs more.", 0, 0, SANS(104)), 0.15, "left"),
      el(70, 350, (c) => K.text(c, "Fill the sides with B-roll, captions bigger.", 0, 0, LIGHT(36, { color: DIM })), 0.3),
      el(K.W / 2, 720, (c, t) => {
        const [w, h] = frame(c, "16:9", 940, "vlog_studio", t, "1920 × 1080", { byWidth: true, hot: true });
        const pip = (Math.floor(t / 1.6) % 2) ? "barista" : "street_steps";
        K.photo(c, w / 2 - 300, -h / 2 + 30, 270, 170, pip, t, "raw", 10, 0.5);
        c.strokeStyle = WH; c.lineWidth = 2; rr(c, w / 2 - 300, -h / 2 + 30, 270, 170, 10); c.stroke();
        K.text(c, "THIS IS THE BIT THAT MATTERS", 0, h / 2 - 40, { family: "ArchX9", size: 34, weight: 900, color: WH, align: "center", stroke: "#000", strokeW: 7 });
      }, 0.35, "up", { far: 0.5 }),
      el(K.W / 2, 1110, (c) => { glass(c, 940, 220); K.text(c, "Picture-in-picture B-roll keeps the wide frame busy. Captions go up to 6% of the height.", -430, -40, LIGHT(32, { maxW: 860 })); }, 0.8, "up", { far: 0.3 }),
    ] },
    // 5 · The prompt
    { els: [
      top("05", "THE PROMPT"),
      el(70, 270, (c) => K.text(c, "One line,", 0, 0, SANS(120)), 0.15, "left"),
      el(70, 400, (c) => K.text(c, "five exports.", 0, 0, LIGHT(120, { color: CYAN })), 0.3, "left"),
      el(K.W / 2, 690, (c, t) => {
        glass(c, 940, 340);
        K.text(c, "VIBE COPILOT", -430, -120, LBL(18, { color: CYAN }));
        const s = K.typed("\"Export 9:16, 4:5, 1:1 and 16:9. Keep my face in frame, move captions into each safe zone, add B-roll to the wide.\"", t, 0.6, 46);
        K.text(c, s, -430, -60, LIGHT(36, { maxW: 860, lh: 1.25 }));
      }, 0.3, "up", { far: 0.4 }),
      ...[["9:16", 300], ["4:5", 240], ["1:1", 200], ["16:9", 130], ["2:3", 260]].map(([r, h], i) =>
        el(130 + i * 205, 1110, (c, t) => {
          frame(c, r, h, "street_vlog", t, null, { hot: t > 2.8 + i * 0.2 });
          if (t > 2.8 + i * 0.2) { c.fillStyle = CYAN; c.beginPath(); c.arc(0, h / 2 + 34, 16, 0, 7); c.fill(); U.icon.check(c, 0, h / 2 + 35, 20, "#05222a", 3); }
          K.text(c, r, 0, h / 2 + 84, SANS(26, { align: "center" }));
        }, 2.6 + i * 0.15, "pop")),
    ] },
    // 6 · CTA
    { bg: (c, t) => city(c, t, "times_square"), els: [
      top("06", "SAVE · SHARE · FOLLOW"),
      el(K.W / 2, 560, (c, t) => {
        glass(c, 940, 640, 44);
        K.text(c, "Comment", 0, -150, SANS(120, { align: "center" }));
        const e = 1 + 0.03 * Math.sin(t * 5); c.save(); c.translate(0, 30); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SANS(200, { align: "center", color: CYAN })); c.restore();
        K.text(c, "for the free prompt pack with the\nrepurpose prompt in it.", 0, 140, LIGHT(36, { align: "center" }));
      }, 0.2, "pop"),
      ...[["9:16", 300, "REELS"], ["4:5", 240, "FEED"], ["16:9", 150, "YOUTUBE"]].map(([r, h, l], i) =>
        el(230 + i * 310, 1140, (c, t) => frame(c, r, h, "street_vlog", t, l, { hot: i === 0 }), 0.6 + i * 0.12, "up", { far: 0.4, float: 1 })),
    ] },
  ],
};
})();
