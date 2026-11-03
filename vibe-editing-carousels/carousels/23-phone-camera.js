// Carousel 23: Film Like a Pro on Your Phone.
// Design system: a live camera viewfinder. Full-bleed real footage is the "sensor"; on top
// sit the camera HUD (REC + timecode, battery, ISO / shutter / WB readouts, rule-of-thirds
// grid, focus brackets, histogram, level), in white Space Mono with camera-yellow accents.
// Copy sits in a dark translucent panel like a camera menu.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const YEL = "#ffd60a", WH = "#ffffff", RED = "#ff3b30";
const MONO = (size, o = {}) => ({ family: "SpaceMono", size, weight: 700, color: WH, track: size * 0.04, ...o });
const SANS = (size, o = {}) => ({ family: "InterD", size, weight: 800, color: WH, track: -size * 0.03, lh: 1.02, ...o });
const BODY = (size, o = {}) => ({ family: "InterD", size, weight: 400, color: "rgba(255,255,255,.88)", lh: 1.3, ...o });

function sensor(clip, focus = 0.5, look = "raw", o = {}) {
  return (c, t) => {
    c.save();
    if (o.blur) c.filter = `blur(${o.blur(t)}px)`;
    if (o.exposure) c.filter = (c.filter === "none" ? "" : c.filter + " ") + `brightness(${o.exposure(t)})`;
    if (o.tilt) { c.translate(K.W / 2, K.H / 2); c.rotate(o.tilt(t)); c.scale(1.12, 1.12); c.translate(-K.W / 2, -K.H / 2); }
    FOOTAGE.drawFootage(c, clip, 0, K.W, K.H, look, focus);
    c.restore();
    const g = c.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, "rgba(0,0,0,.45)"); g.addColorStop(0.25, "rgba(0,0,0,0)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.6)");
    c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
  };
}
// The always-on HUD: REC, timecode, battery, readouts, thirds grid.
function hud(c, t, S, read) {
  c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = 1.5;
  for (const k of [1, 2]) { c.beginPath(); c.moveTo((K.W * k) / 3, 0); c.lineTo((K.W * k) / 3, K.H); c.moveTo(0, (K.H * k) / 3); c.lineTo(K.W, (K.H * k) / 3); c.stroke(); }
  if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = RED; c.beginPath(); c.arc(70, 76, 12, 0, 7); c.fill(); }
  K.text(c, "REC", 92, 87, MONO(28));
  const f = Math.floor(t * 24), tc = `00:00:${String(Math.floor(t + S.idx * 5)).padStart(2, "0")}:${String(f % 24).padStart(2, "0")}`;
  K.text(c, tc, K.W / 2, 87, MONO(28, { align: "center" }));
  c.strokeStyle = WH; c.lineWidth = 2.5; rr(c, K.W - 130, 64, 56, 28, 5); c.stroke(); c.fillStyle = WH; c.fillRect(K.W - 72, 72, 5, 12); c.fillRect(K.W - 125, 69, 34, 18);
  K.text(c, `${S.idx + 1}/6`, K.W - 150, 87, MONO(22, { align: "right" }));
  const R = read || ["4K", "30 FPS", "1/60", "ISO 100", "5600K"];
  R.forEach((s, i) => K.text(c, s, 70 + i * 196, K.H - 60, MONO(24, { color: s.startsWith("●") ? YEL : WH })));
}
function brackets(c, w, h, col = YEL, k = 1) {
  c.strokeStyle = col; c.lineWidth = 3; const L = 34 * k;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.moveTo(sx * w / 2, sy * (h / 2 - L)); c.lineTo(sx * w / 2, sy * h / 2); c.lineTo(sx * (w / 2 - L), sy * h / 2); c.stroke(); }
}
// A camera-menu panel for the copy.
function menu(c, w, h) {
  c.save(); c.fillStyle = "rgba(10,10,12,.62)"; rr(c, 0, 0, w, h, 22); c.fill();
  c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 1.5; c.stroke(); c.restore();
}
function copy(n, title, body, prompt, y = 860) {
  return [
    el(60, y, (c) => menu(c, 960, 360), 0.2, "up", { far: 0.3 }),
    el(100, y + 70, (c) => K.text(c, `SETTING 0${n}`, 0, 0, MONO(24, { color: YEL })), 0.3),
    el(100, y + 160, (c) => K.text(c, title, 0, 0, SANS(80)), 0.35),
    el(100, y + 220, (c) => K.text(c, body, 0, 0, BODY(30, { maxW: 880 })), 0.45),
    el(100, y + 320, (c, t) => K.text(c, "> " + K.typed(prompt, t, 1.0, 40), 0, 0, MONO(22, { color: YEL })), 0.8),
  ];
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const HUD = (read) => el(0, 0, (c, t, lt, S) => hud(c, t, S, read), 0, "none", { out: "none" });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Film Like a Pro on Your Phone",
  dur: D,
  bg: (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, K.W, K.H); },
  fg: (c, t) => K.grain(c, t, 0.06),
  slides: [
    // 1 · Hook
    { bg: sensor("street_vlog", 0.45), els: [
      HUD(),
      el(650, 380, (c, t) => { brackets(c, 300, 300, YEL, 1); const b = pulse(t % 2.5, 0.2, 5); c.globalAlpha = 0.6 + 0.4 * b; K.text(c, "FACE", -150, -170, MONO(22, { color: YEL })); }, 0.4, "grow"),
      el(60, 860, (c) => menu(c, 960, 380), 0.2, "up", { far: 0.3 }),
      el(100, 960, (c) => K.text(c, "Your phone shoots 4K.", 0, 0, SANS(76)), 0.3),
      el(100, 1050, (c) => K.text(c, "Your settings don't.", 0, 0, SANS(76, { color: YEL })), 0.45),
      el(100, 1130, (c) => K.text(c, "4 settings that make phone footage look like a real camera.", 0, 0, BODY(30, { maxW: 880 })), 0.6),
      el(100, 1190, (c) => K.text(c, "SWIPE →", 0, 0, MONO(22, { color: YEL })), 0.9),
    ] },
    // 2 · Lock AE/AF
    { bg: sensor("cafe_coffee", 0.5, "raw", { exposure: (t) => t < 1.3 ? 1 + 0.35 * Math.sin(t * 7) : 1 }), els: [
      HUD(["4K", "30 FPS", "1/60", "● AE/AF LOCK", "5600K"]),
      el(560, 470, (c, t) => {
        const lock = t > 1.3, k = lock ? 1 : 1.25 - 0.25 * win(0.8, 1.3, t);
        brackets(c, 260 * k, 260 * k, YEL);
        if (lock) { c.fillStyle = YEL; rr(c, -110, -190, 220, 44, 8); c.fill(); K.text(c, "AE/AF LOCK", 0, -159, MONO(20, { color: "#000", align: "center" })); }
        c.strokeStyle = YEL; c.lineWidth = 2; c.beginPath(); c.moveTo(170, -120); c.lineTo(170, 120); c.stroke();
        c.fillStyle = YEL; c.beginPath(); c.arc(170, -30 * Math.sin(t), 14, 0, 7); c.fill();
      }, 0.3, "grow"),
      ...copy(1, "Lock it.", "Long-press the subject: exposure and focus stop hunting mid-shot.", "\"keep exposure steady, no flicker\""),
    ] },
    // 3 · 24/30 fps + shutter
    { bg: sensor("skate_road", 0.5, "raw", { blur: (t) => 0 }), els: [
      HUD(["4K", "● 24 FPS", "● 1/50", "ISO 100", "5600K"]),
      el(K.W / 2, 450, (c, t) => {
        c.fillStyle = "rgba(10,10,12,.55)"; rr(c, -360, -110, 720, 220, 22); c.fill();
        ["24", "30", "60"].forEach((fps, i) => {
          const on = i === 0; c.fillStyle = on ? YEL : "rgba(255,255,255,.15)"; rr(c, -330 + i * 230, -80, 200, 80, 14); c.fill();
          K.text(c, `${fps} FPS`, -230 + i * 230, -30, MONO(26, { color: on ? "#000" : WH, align: "center" }));
        });
        K.text(c, "shutter = 2 × frame rate", 0, 60, MONO(24, { align: "center", color: YEL }));
      }, 0.3, "pop"),
      ...copy(2, "24 fps, 1/50.", "The film look is motion blur. Double your frame rate for the shutter.", "\"conform to 24 fps, add natural motion blur\""),
    ] },
    // 4 · Grid + level
    { bg: sensor("beach_couple", 0.5, "raw", { tilt: (t) => lerp(0.08, 0, outCubic(win(0.6, 1.8, t))) }), els: [
      HUD(),
      el(K.W / 2, 560, (c, t) => {
        const a = lerp(0.08, 0, outCubic(win(0.6, 1.8, t))), ok = a < 0.005;
        c.strokeStyle = ok ? YEL : WH; c.lineWidth = 4;
        c.save(); c.rotate(-a); c.beginPath(); c.moveTo(-220, 0); c.lineTo(-40, 0); c.moveTo(40, 0); c.lineTo(220, 0); c.stroke(); c.restore();
        c.beginPath(); c.moveTo(-300, 0); c.lineTo(-250, 0); c.moveTo(250, 0); c.lineTo(300, 0); c.stroke();
        K.text(c, ok ? "LEVEL" : `${(a * 57.3).toFixed(1)}°`, 0, -30, MONO(24, { align: "center", color: ok ? YEL : WH }));
      }, 0.3, "fade"),
      ...copy(3, "Grid on. Level it.", "Horizon on a third line, never tilted. Turn on grid and level in settings.", "\"straighten the horizon, reframe on thirds\""),
    ] },
    // 5 · 1x lens + light
    { bg: sensor("phone_model", 0.5), els: [
      HUD(["4K", "30 FPS", "1/60", "● 1x", "● LIGHT"]),
      el(K.W / 2, 600, (c, t) => {
        c.fillStyle = "rgba(10,10,12,.55)"; rr(c, -210, -50, 420, 100, 50); c.fill();
        ["0.5", "1x", "3"].forEach((z, i) => { const on = i === 1; c.fillStyle = on ? YEL : "rgba(255,255,255,.18)"; c.beginPath(); c.arc(-130 + i * 130, 0, on ? 38 : 30, 0, 7); c.fill(); K.text(c, z, -130 + i * 130, 9, MONO(on ? 24 : 20, { align: "center", color: on ? "#000" : WH })); });
      }, 0.3, "pop"),
      ...copy(4, "1x lens, light in front.", "The main lens is the sharpest. Face the window, never put it behind you.", "\"even out skin tones, lift the shadows\""),
    ] },
    // 6 · CTA
    { bg: sensor("street_vlog", 0.45, "teal"), els: [
      HUD(["4K", "● 24 FPS", "● 1/50", "● LOCK", "● 1x"]),
      el(60, 260, (c) => menu(c, 960, 640), 0.2, "up", { far: 0.3 }),
      el(K.W / 2, 400, (c) => K.text(c, "SAVE THESE SETTINGS", 0, 0, MONO(26, { color: YEL, align: "center" })), 0.3),
      el(K.W / 2, 540, (c) => K.text(c, "Comment", 0, 0, SANS(130, { align: "center" })), 0.35),
      el(K.W / 2, 720, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SANS(190, { align: "center", color: YEL })); }, 0.45),
      el(K.W / 2, 830, (c) => K.text(c, "for the free prompt pack · follow for more", 0, 0, BODY(32, { align: "center" })), 0.6),
      el(K.W / 2, 1060, (c, t) => { brackets(c, 300, 240, YEL); if (Math.floor(t * 2) % 2) K.text(c, "● REC", 0, 10, MONO(30, { color: RED, align: "center" })); }, 0.8, "grow"),
    ] },
  ],
};
})();
