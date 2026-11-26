// "Optimized" reel style: the design system and motion components, drawn on a transparent
// 1080x1920 canvas. render.js screenshots one PNG per frame; compose.sh lays them over the
// cut, punched-in and graded A-roll. Every number here comes from the frame-by-frame study of
// the reference (see ../STYLE_GUIDE.md); change a token and every reel follows.

const T = {
  W: 1080, H: 1920, fps: 30,
  font: '"Inter Display", "Inter", system-ui, sans-serif',
  color: { ink: "#0B0B0B", white: "#FFFFFF", red: "#F2000A", blue: "#2D6FD9", card: "#FFFFFF" },
  // captions over the A-roll (white, no outline, soft shadow, tight tracking + leading)
  cap: { S: 78, M: 96, L: 182, x: 0.5, y: 0.655, lead: 0.84, track: -0.035,
         weight: { S: 700, M: 700, L: 700 }, shadow: "rgba(0,0,0,0.55)", shadowBlur: 26, shadowY: 4 },
  // type on the white cards (black, key word big and red)
  card: { S: 82, M: 124, L: 184, P: 108, lead: 0.86, track: -0.035, weight: { S: 700, M: 700, L: 700, P: 700 } },
  enter: { dur: 0.16, blur: 10, scale: 1.10, dy: 24 },           // ~5 frames: fade+blur+scale-down, rising
  imgEnter: { dur: 0.23, blur: 18, scale: 1.06, dx: 46 },        // icons drift in from the right
  exit: { dur: 0.13, dx: -1300, stagger: 0.005, samples: 28 },    // 4 frames: whip left with motion-blur streaks
  wipe: { dur: 0.15, cx: 0.53 },                                 // white split opens from centre, ~linear
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);
const easeIn = (t) => t * t * t;
const colorOf = (c, fallback) => T.color[c] || c || fallback;

let ctx, PLAN, LAYER, IMGS = {};

function setFont(size, weight) {
  ctx.font = `${weight} ${size}px ${T.font}`;
  ctx.letterSpacing = `${(T.cap.track * size).toFixed(2)}px`;
}
function textWidth(str, size, weight) { setFont(size, weight); return ctx.measureText(str).width; }

// Entrance state of one element that appears at time `t0` (0 = not yet, 1 = settled).
function enterState(now, t0, spec = T.enter) {
  const p = clamp((now - t0) / spec.dur);
  if (now < t0) return null;
  const e = easeOut(p);
  return { a: e, blur: (1 - e) * spec.blur, scale: 1 + (spec.scale - 1) * (1 - e),
           dy: (spec.dy || 0) * (1 - e), dx: (spec.dx || 0) * (1 - e) };
}

// Exit offset (px) at time `now` for an element whose exit starts at `t0`.
function exitOffset(now, t0) {
  if (t0 == null || now < t0) return 0;
  const p = clamp((now - t0) / T.exit.dur); return T.exit.dx * (0.6 * p + 0.4 * p * p);
}

// Draw `fn` (which paints at the origin) with entrance + exit (motion-blurred) transforms.
function drawAnimated(now, x, y, st, ex0, fn) {
  const off = exitOffset(now, ex0);
  const prev = exitOffset(now - 1 / T.fps, ex0);
  const exitP = ex0 == null ? 0 : clamp((now - ex0) / T.exit.dur);
  const alpha = st.a * (1 - exitP);
  if (alpha <= 0.002) return;
  if (off === prev) {                                   // still or entering: one draw
    ctx.save();
    ctx.globalAlpha = alpha;
    if (st.blur > 0.3) ctx.filter = `blur(${st.blur.toFixed(2)}px)`;
    ctx.translate(x + off + st.dx, y + st.dy);
    ctx.scale(st.scale, st.scale);
    fn();
    ctx.restore();
    return;
  }
  // moving: smear copies along the path travelled since the last frame on a scratch layer,
  // then blur that layer once (cheap, and reads as a real shutter streak)
  const lx = LAYER.getContext("2d");
  lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, T.W, T.H);
  const n = T.exit.samples, main = ctx;
  ctx = lx;
  for (let k = 0; k < n; k++) {
    const o = prev + (off - prev) * (k / (n - 1));
    ctx.save();
    ctx.globalAlpha = Math.min(1, 2.2 / n);
    ctx.translate(x + o + st.dx, y + st.dy);
    ctx.scale(st.scale, st.scale);
    fn();
    ctx.restore();
  }
  ctx = main;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = `blur(${(st.blur + 2.5).toFixed(2)}px)`;
  ctx.drawImage(LAYER, 0, 0);
  ctx.restore();
}

// ---------- captions over the A-roll ----------
// cap = { t0, t1, x?, y?, lines: [{ size: "S"|"M"|"L", align: "left"|"center"|"right",
//          words: [{ text, t, color? }] }], items?: [img items, positions relative to frame] }
function layoutCaption(cap) {
  const lines = cap.lines.map((ln) => {
    const size = T.cap[ln.size || "M"], weight = T.cap.weight[ln.size || "M"];
    const space = textWidth(" ", size, weight) * 0.8;
    let x = 0;
    const words = ln.words.map((w) => { const wd = textWidth(w.text, size, weight); const o = { ...w, x, w: wd }; x += wd + space; return o; });
    return { ...ln, size, weight, words, width: x - space };
  });
  const anchor = lines.reduce((a, b) => (b.size > a.size || (b.size === a.size && b.width > a.width) ? b : a));
  const cx = (cap.x ?? T.cap.x) * T.W;
  const aLeft = cx - anchor.width / 2, aRight = cx + anchor.width / 2;
  for (const ln of lines) {
    const al = ln === anchor ? "center" : ln.align || "center";
    ln.left = al === "left" ? aLeft : al === "right" ? aRight - ln.width : cx - ln.width / 2;
  }
  // vertical: baselines stacked with tight leading, block centred on y
  // small over big: the small word sits right on the big word's cap line;
  // small under big: it tucks just under the baseline; same sizes: tight leading.
  let yb = 0;
  lines.forEach((ln, i) => {
    if (i) {
      const p = lines[i - 1];
      yb += ln.size > p.size ? ln.size * 0.74 : ln.size < p.size ? ln.size * 0.66 + p.size * 0.06 : ln.size * T.cap.lead * 1.1;
    }
    ln.base = yb;
  });
  const top = lines[0].base - lines[0].size * 0.72, bot = yb + lines[lines.length - 1].size * 0.2;
  const shift = (cap.y ?? T.cap.y) * T.H - (top + bot) / 2;
  lines.forEach((ln) => (ln.base += shift));
  return lines;
}

function drawCaption(cap, now) {
  if (now < cap.t0 || now >= cap.t1) return;               // hard cut in and out
  cap._lines = cap._lines || layoutCaption(cap);
  for (const ln of cap._lines) for (const w of ln.words) {
    const st = enterState(now, w.t ?? cap.t0); if (!st) continue;
    const x = ln.left + w.x + w.w / 2, y = ln.base;
    drawAnimated(now, x, y, st, null, () => {
      setFont(ln.size, ln.weight);
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.shadowColor = T.cap.shadow; ctx.shadowBlur = T.cap.shadowBlur; ctx.shadowOffsetY = T.cap.shadowY;
      ctx.fillStyle = colorOf(w.color, T.color.white);
      ctx.fillText(w.text, 0, 0);
    });
  }
  for (const it of cap.items || []) drawItem(it, now, null);
}

// ---------- white cards ----------
// card = { t0, t1, enter: "cut"|"wipe", groups: [{ t1?, exit: "slide"|"cut", items: [...] }] }
// text item: { type:"text", text, t, x, y, size:"S"|"M"|"L", color:"ink"|"red", align }
// img item:  { type:"img", src, t, x, y, w }   (x,y = centre, fractions of the frame; w = fraction of width)
function drawItem(it, now, exitAt) {
  if (it.type === "img") {
    const img = IMGS[it.src]; if (!img) return;
    const st = enterState(now, it.t, T.imgEnter); if (!st) return;
    const w = it.w * T.W, h = w * (img.naturalHeight / img.naturalWidth);
    drawAnimated(now, it.x * T.W, it.y * T.H, st, exitAt, () => ctx.drawImage(img, -w / 2, -h / 2, w, h));
    return;
  }
  const size = T.card[it.size || "S"], weight = T.card.weight[it.size || "S"];
  const st = enterState(now, it.t); if (!st) return;
  const width = textWidth(it.text, size, weight);
  const al = it.align || "left";
  const x = it.x * T.W + (al === "left" ? width / 2 : al === "right" ? -width / 2 : 0);
  drawAnimated(now, x, it.y * T.H, st, exitAt, () => {
    setFont(size, weight); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = colorOf(it.color, T.color.ink); ctx.fillText(it.text, 0, 0);
  });
}

function drawCard(card, now) {
  if (now < card.t0 || now >= card.t1) return;
  ctx.save(); ctx.fillStyle = T.color.card;
  if (card.enter === "wipe" && now < card.t0 + T.wipe.dur) {
    const q = clamp((now - card.t0) / T.wipe.dur), p = q * (0.8 + 0.2 * q);
    const cx = T.wipe.cx * T.W, half = Math.max(6, p * T.W * 0.62);
    ctx.fillRect(cx - half, 0, half * 2, T.H);
  } else ctx.fillRect(0, 0, T.W, T.H);
  ctx.restore();
  for (const g of card.groups) {
    if (!g._laid) {                                          // `follow: true` = same line, after the previous word
      let prev = null;
      for (const it of g.items) {
        if (it.type !== "text") continue;
        if (it.follow && prev) {
          const ps = T.card[prev.size || "S"], pw = T.card.weight[prev.size || "S"];
          it.x = prev.x + (textWidth(prev.text, ps, pw) + textWidth(" ", ps, pw) * 0.8) / T.W;
          it.y = it.y ?? prev.y; it.align = "left";
        }
        prev = it;
      }
      g._laid = true;
    }
    const items = [...g.items].sort((a, b) => a.y - b.y);   // exit staggers top to bottom
    items.forEach((it, i) => {
      const ex = g.exit === "slide" && g.t1 != null ? g.t1 + i * T.exit.stagger : null;
      if (g.t1 != null && g.exit !== "slide" && now >= g.t1) return;
      if (ex != null && now > ex + T.exit.dur) return;
      drawItem(it, now, ex);
    });
  }
}

function renderAt(now) {
  ctx.clearRect(0, 0, T.W, T.H);
  for (const c of PLAN.cards || []) drawCard(c, now);
  for (const c of PLAN.captions || []) drawCaption(c, now);
}

async function boot(plan, base) {
  PLAN = plan;
  const cv = document.getElementById("cv"); ctx = cv.getContext("2d");
  LAYER = document.createElement("canvas"); LAYER.width = T.W; LAYER.height = T.H;
  await document.fonts.load(`700 100px "Inter Display"`);
  const srcs = new Set();
  for (const c of [...(plan.cards || []), ...(plan.captions || [])]) {
    for (const it of c.items || []) if (it.type === "img") srcs.add(it.src);
    for (const g of c.groups || []) for (const it of g.items) if (it.type === "img") srcs.add(it.src);
  }
  await Promise.all([...srcs].map((s) => new Promise((ok, bad) => {
    const im = new Image(); im.onload = () => { IMGS[s] = im; ok(); }; im.onerror = () => bad(new Error("image " + s)); im.src = base + s;
  })));
  window.renderAt = renderAt;
}
window.STYLE = { T, boot };
