// Before / After comparison reel, Instagram-safe 9:16. BEFORE = the untouched raw take on the same cut (in sync),
// AFTER = the finished edit. Title "AI edited this.", CTA "Join Vibe Editing".
(() => {
const TL = window.TL, cv = document.getElementById("c"), X = cv.getContext("2d");
const W = 1080, H = 1920, RED = "#FF3B2F", RED2 = "#C3120C";
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), win = (t, a, d) => clamp((t - a) / d);
const eOut = (x) => 1 - Math.pow(1 - x, 3), lerp = (a, b, k) => a + (b - a) * k;
const font = (w, s, f, it) => { X.font = `${it ? "italic " : ""}${w} ${s}px "${f}"`; };
const rr = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r); };
const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });
const pad = (n) => String(n).padStart(5, "0");
// layout (all inside Instagram's safe area: top 250 / bottom 330 kept clear of key content)
const AFT = { x: 432, y: 486, w: 588, h: 1045, r: 30 }, BEF = { x: 60, y: 760, w: 334, h: 594, r: 22 };
const grain = (() => { const k = document.createElement("canvas"); k.width = 540; k.height = 960; const c = k.getContext("2d"); const id = c.createImageData(540, 960);
  let s = 7; for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = 110 + (s / 4294967296) * 60 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } c.putImageData(id, 0, 0); return k; })();
function card(img, b, t, opt) {
  X.save(); X.shadowColor = "rgba(0,0,0,0.6)"; X.shadowBlur = 60; X.shadowOffsetY = 24; rr(b.x, b.y, b.w, b.h, b.r); X.fillStyle = "#000"; X.fill(); X.restore();
  X.save(); rr(b.x, b.y, b.w, b.h, b.r); X.clip(); if (opt.raw) X.filter = "saturate(0.75) brightness(0.95)"; X.drawImage(img, b.x, b.y, b.w, b.h); X.filter = "none"; X.restore();
  rr(b.x + 0.75, b.y + 0.75, b.w - 1.5, b.h - 1.5, b.r); X.strokeStyle = opt.raw ? "rgba(255,255,255,0.18)" : "rgba(255,90,70,0.55)"; X.lineWidth = 1.5; X.stroke();
}
function label(txt, x, y, size, col, dot) {
  font(900, size, "Inter Tight"); X.letterSpacing = "3px"; X.fillStyle = col; X.textAlign = "left"; X.textBaseline = "alphabetic"; X.fillText(txt, x + (dot ? 26 : 0), y);
  if (dot) { X.beginPath(); X.arc(x + 9, y - size * 0.36, 8, 0, 7); X.fillStyle = RED; X.fill(); } X.letterSpacing = "0px";
}
async function renderAt(fi) {
  const t = fi / TL.fps, end = TL.speech_end + 0.1;
  const after = await load(`build/v3/frames/f${pad(fi + 1)}.png`);
  const before = await load(`/home/user/work3/raw_sm/s${pad(Math.min(TL.frames[fi], 3119))}.jpg`);
  // backdrop: black with a soft red key light behind the AFTER card
  X.fillStyle = "#070707"; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(760, 1000, 60, 760, 1000, 900); g.addColorStop(0, "rgba(255,59,47,0.22)"); g.addColorStop(1, "rgba(255,59,47,0)"); X.fillStyle = g; X.fillRect(0, 0, W, H);
  // title
  font(900, 96, "Inter Tight"); X.letterSpacing = "-3px"; X.fillStyle = "#fff"; X.textAlign = "center"; X.fillText("AI edited this.", 540, 380); X.letterSpacing = "0px";
  // labels + cards (gentle float on the AFTER card)
  const fy = Math.sin(t * 1.1) * 4;
  label("BEFORE", BEF.x, BEF.y - 22, 34, "rgba(255,255,255,0.55)", false);
  label("AFTER", AFT.x, AFT.y - 24 + fy, 44, "#fff", true);
  X.save(); X.globalAlpha = 1 - 0.55 * eOut(win(t, end, 0.5)); card(before, BEF, t, { raw: true }); X.restore();
  card(after, { ...AFT, y: AFT.y + fy }, t, { raw: false });
  font(700, 22, "Inter Tight"); X.letterSpacing = "3px"; X.fillStyle = "rgba(255,255,255,0.45)"; X.textAlign = "left"; X.fillText("RAW TAKE", BEF.x, BEF.y + BEF.h + 42);
  X.fillText("NO TIMELINE", BEF.x, BEF.y + BEF.h + 74); X.letterSpacing = "0px";
  // arrow from before to after
  X.save(); X.strokeStyle = "rgba(255,255,255,0.5)"; X.lineWidth = 3; X.lineCap = "round"; X.beginPath(); X.moveTo(BEF.x + BEF.w * 0.55, BEF.y - 70); X.quadraticCurveTo(BEF.x + BEF.w * 0.8, AFT.y - 30, AFT.x - 22, AFT.y + 60); X.stroke();
  X.beginPath(); X.moveTo(AFT.x - 38, AFT.y + 46); X.lineTo(AFT.x - 22, AFT.y + 60); X.lineTo(AFT.x - 42, AFT.y + 66); X.stroke(); X.restore();
  // CTA: Join Vibe Editing (stronger once the edit reaches its end card)
  const push = eOut(win(t, end, 0.5)), y = 1588, w = lerp(700, 780, push), h = 104, x = 540 - w / 2;
  X.save(); X.shadowColor = `rgba(255,59,47,${0.35 + 0.3 * push})`; X.shadowBlur = 50; X.shadowOffsetY = 12;
  const bg = X.createLinearGradient(x, 0, x + w, 0); bg.addColorStop(0, RED); bg.addColorStop(1, RED2); rr(x, y, w, h, h / 2); X.fillStyle = bg; X.fill(); X.restore();
  X.save(); rr(x, y, w, h, h / 2); X.clip(); const sx = x - 200 + ((t % 2.4) / 2.4) * (w + 400);
  const sg = X.createLinearGradient(sx - 90, 0, sx + 90, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.35)"); sg.addColorStop(1, "rgba(255,255,255,0)"); X.fillStyle = sg; X.fillRect(x, y, w, h); X.restore();
  font(900, 42, "Inter Tight"); X.letterSpacing = "1px"; X.fillStyle = "#fff"; X.textAlign = "center"; X.textBaseline = "middle"; X.fillText("JOIN VIBE EDITING", 540 - 22, y + h / 2 + 2); X.letterSpacing = "0px";
  const ax = 540 - 22 + 232 + Math.sin(t * 6) * 5; X.strokeStyle = "#fff"; X.lineWidth = 5; X.lineCap = "round"; X.lineJoin = "round";
  X.beginPath(); X.moveTo(ax - 14, y + h / 2); X.lineTo(ax + 12, y + h / 2); X.moveTo(ax + 1, y + h / 2 - 12); X.lineTo(ax + 12, y + h / 2); X.lineTo(ax + 1, y + h / 2 + 12); X.stroke();
  X.textBaseline = "alphabetic";
  X.save(); X.globalCompositeOperation = "overlay"; X.globalAlpha = 0.06; X.drawImage(grain, 0, 0, W, H); X.restore();
}
window.renderFrame = renderAt;
window.stageReady = (async () => { await Promise.all([`900 20px "Inter Tight"`, `700 20px "Inter Tight"`].map((f) => document.fonts.load(f, "Aa"))); await document.fonts.ready; return true; })();
})();
