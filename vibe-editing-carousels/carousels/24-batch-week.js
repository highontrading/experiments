// Carousel 24: Batch a Week of Content in One Evening.
// Design system: a pastel bento grid. Soft lilac page, rounded 36 px tiles in butter, mint,
// peach, sky and ink, each tile holding one thing (real footage, a big number, a list, a
// progress bar), Inter Display with tight tracking, small pill tags. Tiles pop in one by one.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const PAGE = "#ebe8f7", INK = "#17151f", BUTTER = "#fbe7a1", MINT = "#c4ecd6", PEACH = "#ffd3c0", SKY = "#cfe1ff", LILAC = "#d9cffc", WH = "#ffffff";
const SANS = (size, o = {}) => ({ family: "InterD", size, weight: 800, color: INK, track: -size * 0.045, lh: 0.98, ...o });
const BODY = (size, o = {}) => ({ family: "InterD", size, weight: 500, color: INK, lh: 1.3, ...o });
const G = 22, M = 48, CW = (K.W - M * 2 - G * 3) / 4;      // 4-column bento
const cx = (col) => M + col * (CW + G), cw = (n) => n * CW + (n - 1) * G;

function page(c) { c.fillStyle = PAGE; c.fillRect(0, 0, K.W, K.H); }
// A tile spanning cols [col, col+w) and the given pixel rows, with content drawn inside.
function tile(col, w, y, h, fill, draw, at, o = {}) {
  const W = cw(w), X = cx(col);
  return { x: X + W / 2, y: y + h / 2, in: o.in || "pop", at, far: 0.5, float: o.float ?? 0.4, draw: (c, t, lt, S) => {
    c.save(); c.shadowColor = "rgba(40,30,90,.12)"; c.shadowBlur = 24; c.shadowOffsetY = 10;
    rr(c, -W / 2, -h / 2, W, h, 36); c.fillStyle = fill; c.fill(); c.restore();
    c.save(); rr(c, -W / 2, -h / 2, W, h, 36); c.clip(); c.translate(-W / 2, -h / 2);
    draw(c, W, h, t, S); c.restore();
  } };
}
const clipTile = (clip, focus = 0.5, label) => (c, w, h, t) => {
  FOOTAGE.drawFootage(c, clip, 0, w, h, "raw", focus);
  if (label) { const f = BODY(20, { weight: 700 }), lw = K.measure(c, label, f) + 28; rr(c, 16, h - 52, lw, 36, 18); c.fillStyle = "rgba(255,255,255,.9)"; c.fill(); K.text(c, label, 30, h - 28, f); }
};
function pill(c, s, x, y, fill = WH) { const f = BODY(20, { weight: 700 }), w = K.measure(c, s, f) + 30; rr(c, x, y - 26, w, 38, 19); c.fillStyle = fill; c.fill(); K.text(c, s, x + 15, y, f); return w; }
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const DAYS = [["MON", "vlog_talk", 0.5], ["TUE", "barista", 0.5], ["WED", "podcast_women", 0.5], ["THU", "street_vlog", 0.45], ["FRI", "dance_girls", 0.5], ["SAT", "skate_road", 0.6], ["SUN", "cafe_coffee", 0.5]];

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Batch a Week of Content in One Evening",
  dur: D,
  bg: page,
  fg: (c, t) => K.grain(c, t, 0.04),
  slides: [
    // 1 · Hook
    { els: [
      tile(0, 4, 60, 360, INK, (c, w, h) => {
        K.text(c, "7 reels.", 40, 170, SANS(150, { color: WH }));
        K.text(c, "1 evening.", 40, 310, SANS(150, { color: LILAC }));
      }, 0.05),
      ...DAYS.map(([d, clip, f], i) => {
        const col = i < 4 ? i : i - 4, row = i < 4 ? 0 : 1;
        return tile(col, 1, 445 + row * 320, 298, WH, clipTile(clip, f, d), 0.3 + i * 0.08);
      }),
      tile(3, 1, 765, 298, BUTTER, (c, w, h, t) => { K.text(c, "the batch", 26, 70, BODY(26, { weight: 700 })); K.text(c, "method", 26, 104, BODY(26, { weight: 700 })); K.text(c, "→", w - 30, h - 34, SANS(80, { align: "right" })); }, 0.9),
      tile(0, 4, 1085, 210, PEACH, (c, w, h) => { K.text(c, "Plan, film and edit a full week in about 3 hours.", 40, 90, SANS(46, { maxW: w - 80 })); K.text(c, "Swipe for the 4 steps.", 40, 170, BODY(28)); }, 1.0),
    ] },
    // 2 · Step 1: seven hooks
    { els: [
      tile(0, 3, 60, 300, INK, (c, w) => { pill(c, "STEP 1 · 20 MIN", 40, 80, LILAC); K.text(c, "Write 7 hooks first.", 40, 220, SANS(66, { color: WH, maxW: w - 80 })); }, 0.05),
      tile(3, 1, 60, 300, BUTTER, (c, w, h) => { K.text(c, "7", w / 2, 210, SANS(190, { align: "center" })); K.text(c, "hooks", w / 2, 260, BODY(24, { align: "center", weight: 700 })); }, 0.15),
      tile(0, 4, 385, 700, WH, (c, w, h, t) => {
        const hooks = ["I stopped editing on a timeline.", "This took me 4 minutes.", "Your captions are the edit.", "Stop filming more. Do this.", "3 hours vs 15 minutes.", "The one setting I changed.", "Steal my exact prompt."];
        hooks.forEach((s, i) => {
          const at = 0.6 + i * 0.3, y = 80 + i * 88;
          c.fillStyle = [MINT, SKY, PEACH, BUTTER, LILAC, MINT, SKY][i]; rr(c, 30, y - 46, 64, 64, 18); c.fill();
          K.text(c, DAYS[i][0].slice(0, 2), 62, y - 4, BODY(22, { weight: 800, align: "center" }));
          K.text(c, K.typed(s, t, at, 50), 120, y, SANS(40, { weight: 700 }));
          if (t > at + 0.7) U.icon.check(c, w - 60, y - 14, 36, "#2f9e62", 4, win(at + 0.7, at + 0.9, t));
        });
      }, 0.3),
      tile(0, 4, 1110, 185, MINT, (c, w) => { K.text(c, "The hook decides the shot list. Write them before you touch the camera.", 40, 80, BODY(30, { weight: 600, maxW: w - 80 })); }, 0.9),
    ] },
    // 3 · Step 2: film in setups
    { els: [
      tile(0, 4, 60, 260, INK, (c, w) => { pill(c, "STEP 2 · 90 MIN", 40, 80, LILAC); K.text(c, "Film in 3 setups, not 7 days.", 40, 200, SANS(70, { color: WH, maxW: w - 80 })); }, 0.05),
      tile(0, 2, 345, 520, WH, clipTile("vlog_studio", 0.5, "SETUP A · talking"), 0.25),
      tile(2, 2, 345, 250, WH, clipTile("podcast_two", 0.4, "SETUP B · seated"), 0.35),
      tile(2, 2, 615, 250, WH, clipTile("barista", 0.5, "SETUP C · B-roll"), 0.45),
      tile(0, 1, 890, 230, BUTTER, (c, w, h) => { K.text(c, "1", w / 2, 150, SANS(130, { align: "center" })); K.text(c, "outfit", w / 2, 195, BODY(22, { weight: 700, align: "center" })); }, 0.6),
      tile(1, 1, 890, 230, SKY, (c, w, h) => { K.text(c, "1", w / 2, 150, SANS(130, { align: "center" })); K.text(c, "location", w / 2, 195, BODY(22, { weight: 700, align: "center" })); }, 0.7),
      tile(2, 2, 890, 230, PEACH, (c, w, h, t) => { K.text(c, "all 7 hooks", 30, 90, SANS(48)); K.text(c, "back to back, then B-roll", 30, 140, BODY(26)); const p = clamp((t - 0.8) / 3); c.fillStyle = "rgba(23,21,31,.12)"; rr(c, 30, 172, w - 60, 18, 9); c.fill(); c.fillStyle = INK; rr(c, 30, 172, (w - 60) * p, 18, 9); c.fill(); }, 0.8),
      tile(0, 4, 1145, 150, MINT, (c, w) => K.text(c, "Same light, same mic, same framing: it edits as one series.", 40, 92, BODY(30, { weight: 600, maxW: w - 80 })), 1.0),
    ] },
    // 4 · Step 3: one batch prompt
    { els: [
      tile(0, 4, 60, 260, INK, (c, w) => { pill(c, "STEP 3 · 40 MIN", 40, 80, LILAC); K.text(c, "Edit all 7 with one prompt.", 40, 200, SANS(70, { color: WH, maxW: w - 80 })); }, 0.05),
      tile(0, 4, 345, 300, LILAC, (c, w, h, t) => {
        K.text(c, "THE BATCH PROMPT", 40, 60, BODY(22, { weight: 800 }));
        K.text(c, K.typed("\"Cut 7 reels from today's footage, one per hook. Same captions, same look, same end card. 30 s each.\"", t, 0.5, 60), 40, 120, SANS(40, { weight: 700, maxW: w - 80, lh: 1.15 }));
      }, 0.2),
      ...DAYS.map(([d, clip, f], i) => tile(i % 4 === 3 && i < 4 ? 3 : i % 4, 1, 670 + Math.floor(i / 4) * 300, 280, WH, (c, w, h, t) => {
        FOOTAGE.drawFootage(c, clip, 0, w, h - 60, "raw", f);
        const at = 1.6 + i * 0.25, p = clamp((t - at) / 0.8);
        c.fillStyle = WH; c.fillRect(0, h - 60, w, 60);
        K.text(c, d, 18, h - 20, BODY(22, { weight: 800 }));
        c.fillStyle = "rgba(23,21,31,.1)"; rr(c, 80, h - 38, w - 100, 14, 7); c.fill(); c.fillStyle = p >= 1 ? "#2f9e62" : INK; rr(c, 80, h - 38, (w - 100) * p, 14, 7); c.fill();
      }, 0.5 + i * 0.06)),
      tile(3, 1, 970, 280, BUTTER, (c, w, h, t) => { const n = clamp(Math.floor((t - 1.6) / 0.25), 0, 7); K.text(c, `${n}/7`, w / 2, 160, SANS(90, { align: "center" })); K.text(c, n === 7 ? "done" : "editing…", w / 2, 210, BODY(24, { weight: 700, align: "center" })); }, 0.9),
    ] },
    // 5 · Step 4: schedule
    { els: [
      tile(0, 4, 60, 260, INK, (c, w) => { pill(c, "STEP 4 · 15 MIN", 40, 80, LILAC); K.text(c, "Schedule the week.", 40, 200, SANS(84, { color: WH, maxW: w - 80 })); }, 0.05),
      ...DAYS.map(([d, clip, f], i) => tile(i < 4 ? i : i - 4, 1, 345 + Math.floor(i / 4) * 370, 345, [MINT, SKY, PEACH, BUTTER, LILAC, MINT, SKY][i], (c, w, h, t) => {
        K.text(c, d, 22, 52, BODY(24, { weight: 800 }));
        K.text(c, ["6pm", "12pm", "7pm", "6pm", "5pm", "11am", "10am"][i], w - 22, 52, BODY(22, { weight: 700, align: "right" }));
        c.save(); rr(c, 16, 76, w - 32, h - 92, 22); c.clip(); c.translate(16, 76); FOOTAGE.drawFootage(c, clip, 0, w - 32, h - 92, "raw", f); c.restore();
        const at = 1.2 + i * 0.25;
        if (t > at) { const e = outBack(win(at, at + 0.3, t), 2.4); c.save(); c.translate(w - 48, h - 48); c.scale(e, e); c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 24, 0, 7); c.fill(); U.icon.check(c, 0, 1, 28, WH, 4); c.restore(); }
      }, 0.3 + i * 0.07)),
      tile(3, 1, 715, 345, INK, (c, w, h, t) => { K.text(c, "week", w / 2, 150, SANS(54, { color: WH, align: "center" })); K.text(c, "done.", w / 2, 210, SANS(54, { color: LILAC, align: "center" })); }, 1.0),
      tile(0, 4, 1110, 185, PEACH, (c, w) => K.text(c, "Post at the same times every week. Consistency beats volume.", 40, 82, BODY(30, { weight: 600, maxW: w - 80 })), 1.2),
    ] },
    // 6 · CTA
    { els: [
      tile(0, 4, 60, 560, INK, (c, w, h, t) => {
        K.text(c, "Comment", 40, 200, SANS(150, { color: WH }));
        const e = 1 + 0.03 * Math.sin(t * 5); c.save(); c.translate(40, 380); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SANS(200, { color: LILAC })); c.restore();
        K.text(c, "for the free prompt pack, batch prompt included.", 40, 480, BODY(30, { color: WH }));
      }, 0.05),
      tile(0, 2, 645, 420, WH, clipTile("street_vlog", 0.45, "save this"), 0.3),
      tile(2, 1, 645, 200, BUTTER, (c, w, h) => { K.text(c, "3h", w / 2, 120, SANS(90, { align: "center" })); K.text(c, "total", w / 2, 165, BODY(22, { weight: 700, align: "center" })); }, 0.4),
      tile(3, 1, 645, 200, MINT, (c, w, h) => { K.text(c, "7", w / 2, 120, SANS(90, { align: "center" })); K.text(c, "reels", w / 2, 165, BODY(22, { weight: 700, align: "center" })); }, 0.5),
      tile(2, 2, 865, 200, SKY, (c, w) => { K.text(c, "follow for", 30, 90, SANS(52)); K.text(c, "more systems", 30, 150, SANS(52)); }, 0.6),
      tile(0, 4, 1090, 205, PEACH, (c, w) => { K.text(c, "Plan · Film · Edit · Schedule", 40, 90, SANS(56)); K.text(c, "one evening, one week of reels", 40, 150, BODY(28)); }, 0.8),
    ] },
  ],
};
})();
