// Carousel 02: The Vibe Prompt Formula.
// Design system: iOS Calendar page, text selection (blue highlight, handles, Copy | Share
// popover), a light iOS keyboard, photo windows with a transform box, a folder icon and
// a sticker, under a soft film-photo look (grain, warm wash, vignette).
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BLUE = "#3d8bfd", HL = "#5aa2f7", INK = "#0d0d0f", GREY = "#8e8e93", LINE = "#e3e3e8";
const SF = (size, weight = 600, o = {}) => ({ family: "InterD", size, weight, color: INK, ...o });

// -------------------------------------------------------------- backdrop --
const calCache = {};
function calendar(month, opts = {}) {
  const key = month + JSON.stringify(opts);
  if (calCache[key]) return calCache[key];
  return (calCache[key] = K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = "#fbfbfc"; c.fillRect(0, 0, W, H);
    c.strokeStyle = BLUE; c.lineWidth = 4; c.lineCap = c.lineJoin = "round";
    c.beginPath(); c.moveTo(58, 52); c.lineTo(44, 68); c.lineTo(58, 84); c.stroke();
    K.text(c, "2026", 70, 82, SF(40, 500, { color: BLUE }));
    // frosted event pills, top right (like the reference)
    [["Personal", 40], ["Work", 150]].forEach(([s, y]) => {
      c.save(); c.globalAlpha = 0.55;
      K.panel(c, 520, y, 520, 92, 46, "#d5d6db");
      c.filter = "blur(1.5px)";
      K.text(c, s, 640, y + 44, SF(30, 600, { color: "#fff" }));
      K.text(c, "Get Started", 640, y + 76, SF(22, 500, { color: "#f4f4f6" }));
      c.fillStyle = "#fff"; c.beginPath(); c.arc(580, y + 46, 16, 0, 7); c.fill();
      c.restore();
    });
    if (month) K.text(c, month, 52, 330, SF(92, 700));
    const y0 = opts.top ?? 380;
    "SMTWTFS".split("").forEach((d, i) => K.text(c, d, 80 + i * 150, y0, SF(26, 500, { color: GREY, align: "center" })));
    let day = 1 - (opts.offset ?? 4);
    for (let r = 0; r < 6; r++) {
      const y = y0 + 40 + r * 165;
      c.fillStyle = LINE; c.fillRect(30, y, W - 60, 2);
      for (let i = 0; i < 7; i++, day++) {
        if (day < 1 || day > 31) continue;
        const x = 80 + i * 150;
        if (day === opts.today) {
          c.fillStyle = BLUE; c.beginPath(); c.arc(x, y + 56, 40, 0, 7); c.fill();
          K.text(c, String(day), x, y + 72, SF(44, 600, { color: "#fff", align: "center" }));
        } else K.text(c, String(day), x, y + 72, SF(44, 400, { color: i === 0 || i === 6 ? "#b8b8bd" : "#6d6d72", align: "center" }));
      }
    }
  }));
}
function filmLook(c, t) {
  c.save(); c.globalCompositeOperation = "soft-light"; c.fillStyle = "rgba(243,222,190,.25)"; c.fillRect(0, 0, K.W, K.H); c.restore();
  K.vignette(c, 0.1);
  K.grain(c, t, 0.2);
}
const bgCal = (month, opts = {}) => (c, t) => {
  const u = (2 * Math.PI * t) / 5;
  c.save(); c.translate(0, 4 * Math.sin(u)); c.drawImage(calendar(month, opts), 0, 0); c.restore();
  if (opts.fade) { c.fillStyle = `rgba(251,251,252,${opts.fade})`; c.fillRect(0, 0, K.W, K.H); }
};

// ------------------------------------------------------------ components --
function handles(c, x0, y0, x1, y1, s = 1) {
  c.fillStyle = BLUE;
  c.fillRect(x0 - 2, y0 - 6 * s, 4, (y1 - y0) / 2 + 6 * s); c.beginPath(); c.arc(x0, y0 - 10 * s, 11 * s, 0, 7); c.fill();
  c.fillRect(x1 - 2, y1 - (y1 - y0) / 2, 4, (y1 - y0) / 2 + 6 * s); c.beginPath(); c.arc(x1, y1 + 10 * s, 11 * s, 0, 7); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 3;
  c.beginPath(); c.arc(x0, y0 - 10 * s, 11 * s, 0, 7); c.stroke();
  c.beginPath(); c.arc(x1, y1 + 10 * s, 11 * s, 0, 7); c.stroke();
}
// Text that types itself, then gets selected: blue highlight sweeps across the lines.
function selectText(c, lines, o, t, typeAt, selAt, cps = 20) {
  const lh = o.size * 1.22;
  const all = lines.join(" ");
  const shown = K.typed(all, t, typeAt, cps);
  const sel = inOut(win(selAt, selAt + 0.45, t));
  let used = 0, box = null;
  lines.forEach((ln, i) => {
    const y = i * lh;
    const vis = shown.slice(used, used + ln.length);
    used += ln.length + 1;
    const w = K.measure(c, ln, o);
    if (sel > 0) {
      const ww = w * clamp(sel * lines.length - i);
      if (ww > 0) { c.fillStyle = HL; c.fillRect(-6, y - o.size * 0.92, ww + 12, lh); }
      box = box || { x0: -6, y0: y - o.size * 0.92 };
      box.x1 = -6 + ww + 12; box.y1 = y - o.size * 0.92 + lh;
    }
    K.text(c, vis, 0, y, o);
    if (i === lines.length - 1 || vis.length < ln.length) {
      if (shown.length < all.length && vis.length && vis.length < ln.length + 1 && sel === 0 && K.caret(t * 3)) {
        c.fillStyle = BLUE; c.fillRect(K.measure(c, vis, o) + 4, y - o.size * 0.85, 4, o.size * 1.05);
      }
    }
  });
  if (sel >= 1 && box) handles(c, box.x0, box.y0, box.x1, box.y1, o.size / 60);
  return box;
}
function popover(c, x, y, items, t, at, hit = -1, hitAt = 99) {
  const e = outBack(win(at, at + 0.3, t), 2.2);
  if (t < at) return;
  c.save(); c.translate(x, y); c.scale(e, e);
  const ws = items.map((s) => K.measure(c, s, SF(30, 500)) + 52), w = ws.reduce((a, b) => a + b, 0);
  K.panel(c, -w / 2, -76, w, 70, 14, "#fff", { color: "rgba(0,0,0,.22)", blur: 26, y: 8 });
  c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-14, -7); c.lineTo(0, 10); c.lineTo(14, -7); c.fill();
  let xx = -w / 2;
  items.forEach((s, i) => {
    if (i === hit && t >= hitAt) { c.fillStyle = `rgba(61,139,253,${0.25 + 0.5 * pulse(t, hitAt, 4)})`; rr(c, xx + 4, -72, ws[i] - 8, 62, 10); c.fill(); }
    K.text(c, s, xx + ws[i] / 2, -30, SF(30, 500, { align: "center", color: s.includes("✕") ? "#e5484d" : INK }));
    if (i < items.length - 1) { c.fillStyle = LINE; c.fillRect(xx + ws[i] - 1, -66, 2, 50); }
    xx += ws[i];
  });
  c.restore();
}
function photoWindow(c, w, h, title, paint) {
  K.panel(c, -w / 2, -h / 2, w, h, 18, "#f2f2f4", { color: "rgba(0,0,0,.25)", blur: 34, y: 16 });
  ["#c9c9ce", "#c9c9ce", "#c9c9ce"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-w / 2 + 26 + i * 22, -h / 2 + 22, 7, 0, 7); c.fill(); });
  if (title) K.text(c, title, 0, -h / 2 + 30, SF(22, 600, { color: "#77777c", align: "center" }));
  c.save(); rr(c, -w / 2 + 10, -h / 2 + 46, w - 20, h - 56, 10); c.clip(); c.translate(-w / 2 + 10, -h / 2 + 46);
  paint(c, w - 20, h - 56);
  c.restore();
}
function transformBox(c, w, h, t, k = 1) {
  c.save(); c.rotate(0.06 * Math.sin(t * 1.3) * k); c.scale(1 + 0.03 * Math.sin(t * 2.1) * k, 1 + 0.03 * Math.sin(t * 2.1) * k);
  c.strokeStyle = HL; c.lineWidth = 3; c.strokeRect(-w / 2, -h / 2, w, h);
  for (const [x, y] of [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]) {
    c.fillStyle = HL; c.beginPath(); c.arc(x * w / 2, y * h / 2, 9, 0, 7); c.fill();
  }
  c.restore();
}
function folder(c, s = 1) {
  c.save(); c.scale(s, s);
  const g = c.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, "#b9dcfa"); g.addColorStop(1, "#7fb8ec");
  rr(c, -90, -62, 80, 30, 10); c.fillStyle = "#8cc2f0"; c.fill();
  K.panel(c, -90, -46, 180, 112, 12, g, { color: "rgba(0,0,0,.16)", blur: 14, y: 6 });
  c.restore();
}
function sticker(c, t, w = 170, h = 190) {
  K.panel(c, -w / 2, -h / 2, w, h, 6, "#fff", { color: "rgba(0,0,0,.25)", blur: 16, y: 6 });
  c.save(); rr(c, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 2); c.clip(); c.translate(-w / 2 + 10, -h / 2 + 10);
  FOOTAGE.drawFootage(c, "city_night", t, w - 20, h - 20, "raw", 0.5);     // a real night-city print
  c.restore();
}
// iOS keyboard. `typing` = { s, at, cps } presses the key for each character.
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
function keyboard(c, w, t, typing, extra = {}) {
  const kw = w / 10, kh = kw * 1.32, gap = kw * 0.12, h = kh * 4 + gap * 5 + 30;
  K.panel(c, -w / 2, 0, w, h, 26, "#d2d4da", { color: "rgba(0,0,0,.25)", blur: 30, y: 14 });
  let down = null;
  if (typing) {
    const i = Math.floor((t - typing.at) * typing.cps);
    const ft = typing.at + i / typing.cps;
    if (i >= 0 && i < typing.s.length && t - ft < 0.07) down = typing.s[i].toLowerCase();
  }
  if (extra.down && t >= extra.down[1] && t < extra.down[1] + 0.12) down = extra.down[0];
  const key = (x, y, ww, label, special, id) => {
    const pressed = down === (id ?? label);
    c.fillStyle = "#8a8b8f"; rr(c, x, y + 2.5, ww, kh, 9); c.fill();
    c.fillStyle = pressed ? "#babcc3" : special ? "#abb0bc" : "#fcfcfe"; rr(c, x, y, ww, kh, 9); c.fill();
    K.text(c, label, x + ww / 2, y + kh * 0.66, SF(special ? kh * 0.34 : kh * 0.5, special ? 500 : 400, { align: "center" }));
    if (pressed && !special) {                    // key preview bubble
      K.panel(c, x - ww * 0.2, y - kh * 1.25, ww * 1.4, kh * 1.3, 12, "#fcfcfe", { color: "rgba(0,0,0,.25)", blur: 10, y: 3 });
      K.text(c, label, x + ww / 2, y - kh * 0.35, SF(kh * 0.75, 400, { align: "center" }));
    }
  };
  ROWS.forEach((row, r) => {
    const y = 15 + r * (kh + gap);
    const off = r === 1 ? kw / 2 : r === 2 ? kw * 1.5 : 0;
    [...row].forEach((ch, i) => key(-w / 2 + off + i * kw + gap / 2, y, kw - gap, ch));
    if (r === 2) {
      key(-w / 2 + gap / 2, y, kw * 1.3 - gap, "⇧", true);
      key(w / 2 - kw * 1.3 + gap / 2, y, kw * 1.3 - gap, "⌫", true);
    }
  });
  const y = 15 + 3 * (kh + gap);
  key(-w / 2 + gap / 2, y, kw * 1.25 - gap, "123", true);
  key(-w / 2 + kw * 1.25 + gap / 2, y, kw * 1.25 - gap, "☺", true);
  key(-w / 2 + kw * 2.5 + gap / 2, y, kw * 5 - gap, "space", true, " ");
  c.save();
  if (extra.returnBlue && t >= extra.returnBlue) c.globalAlpha = 1;
  key(w / 2 - kw * 2.5 + gap / 2, y, kw * 2.5 - gap, "return", true, "\n");
  c.restore();
  return h;
}
function pill(c, s, o = {}) {
  const f = SF(o.size || 30, o.weight || 600, { color: o.color || INK });
  const w = K.measure(c, s, f) + (o.padX ?? 36) * 2, h = (o.size || 30) * 1.9;
  K.panel(c, -w / 2, -h / 2, w, h, h / 2, o.fill || "#ffffff", o.shadow === false ? null : { color: "rgba(0,0,0,.14)", blur: 18, y: 6 });
  K.text(c, s, 0, (o.size || 30) * 0.36, { ...f, align: "center" });
  return w;
}
const reelP = (o) => o;

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "The Vibe Prompt Formula",
  dur: D,
  fg: (c, t) => filmLook(c, t),
  slides: [
    // 1 · Hook
    {
      bg: bgCal("October", { today: 28 }),
      els: [
        { x: 600, y: 560, rot: -3, in: "pop", at: 0.05, float: 1, draw: (c, t) => {
          photoWindow(c, 500, 600, "my_reel.mov", (c, w, h) => CARDS.reel(c, w, h, t, { look: "teal", caps: [["ONE"], ["SENTENCE."]], capsAt: 1.0, capEvery: 0.4, capY: 0.62 }, { D }));
          transformBox(c, 540, 640, t);
        } },
        { x: 175, y: 470, rot: -6, in: "left", at: 0.2, float: 1, draw: (c) => folder(c, 1) },
        { x: 905, y: 880, rot: 8, in: "right", at: 0.3, float: 1, draw: (c, t) => sticker(c, t) },
        { x: 860, y: 70, in: "down", at: 0.25, draw: (c) => pill(c, "the vibe prompt formula", { size: 28, fill: "#ffffff" }) },
        { x: 540, y: 1020, rot: -3, in: "up", at: 0.15, draw: (c, t) => keyboard(c, 1010, t, { s: "one sentence edits my whole reel.", at: 0.7, cps: 19 }) },
        { x: 70, y: 905, in: "none", at: 0, draw: (c, t) => {
          selectText(c, ["one sentence edits", "my whole reel."], SF(70, 600), t, 0.7, 2.6, 19);
          popover(c, 300, -66, ["Copy", "Share…", "Swipe →"], t, 3.1, 2, 3.6);
        } },
      ],
    },
    // 2 · Problem
    {
      bg: bgCal(null, { top: 600, offset: 1, fade: 0.55 }),
      els: [
        { x: 60, y: 210, in: "left", at: 0.05, draw: (c) => { K.text(c, "vague in,", 0, 0, SF(118, 800)); K.text(c, "vague out.", 0, 118, SF(118, 800, { color: BLUE })); } },
        { x: 430, y: 560, rot: -2, in: "pop", at: 0.3, float: 1, draw: (c, t) => {
          K.panel(c, -360, -110, 720, 220, 26, "#fff", { color: "rgba(0,0,0,.16)", blur: 30, y: 12 });
          K.text(c, "your prompt", -320, -54, SF(26, 600, { color: GREY }));
          c.save(); c.translate(-320, 40); selectText(c, ["make it cool"], SF(66, 600), t, 0.8, 1.7, 14); c.restore();
          popover(c, 0, -120, ["Copy", "Share…", "Too vague ✕"], t, 2.2, 2, 2.7);
        } },
        { x: 760, y: 980, rot: 4, in: "right", at: 0.6, float: 1, draw: (c, t) => {
          photoWindow(c, 440, 560, "result.mov", (c, w, h) => {
            K.photo(c, 0, 0, w, h, "latte", t, "log", 0, 0.5);
            K.text(c, "nice video", w / 2, h * 0.78, { family: "InterL", size: 30, weight: 400, color: "#fff", align: "center" });
          });
          const b = outBack(win(3.0, 3.35, t), 2.6);
          if (t > 3.0) { c.save(); c.translate(120, -170); c.rotate(-0.2); c.scale(b, b); c.strokeStyle = "#e5484d"; c.lineWidth = 7; rr(c, -110, -40, 220, 80, 14); c.stroke(); K.text(c, "GENERIC", 0, 16, SF(40, 800, { color: "#e5484d", align: "center" })); c.restore(); }
        } },
        { x: 260, y: 980, rot: -5, in: "left", at: 0.9, float: 1, draw: (c) => {
          K.panel(c, -200, -120, 400, 240, 26, "rgba(255,255,255,.92)", { color: "rgba(0,0,0,.12)", blur: 20, y: 8 });
          K.text(c, "AI can't read", 0, -40, SF(38, 700, { align: "center" }));
          K.text(c, "your mind.", 0, 8, SF(38, 700, { align: "center" }));
          K.text(c, "give it the parts →", 0, 72, SF(30, 600, { align: "center", color: BLUE }));
        } },
      ],
    },
    // 3 · The formula
    {
      bg: bgCal(null, { top: 1600, fade: 0 }),
      els: [
        { x: 60, y: 190, in: "left", at: 0.05, draw: (c) => { K.text(c, "the formula", 0, 0, SF(112, 800)); K.text(c, "5 parts · 1 sentence", 4, 70, SF(40, 500, { color: GREY })); } },
        { x: 540, y: 420, in: "pop", at: 0.2, draw: (c, t) => {
          K.panel(c, -480, -70, 960, 140, 30, "#fff", { color: "rgba(0,0,0,.14)", blur: 24, y: 10 });
          const parts = ["platform", "length", "energy", "look", "goal"];
          const n = clamp(Math.floor((t - 0.9) / 0.5) + 1, 0, 5);
          const s = parts.slice(0, n).join(" + ");
          const px = K.fit(c, "platform + length + energy + look + goal", 900, SF(44, 700));
          K.text(c, s, -450, 16, SF(px, 700));
          if (K.caret(t)) { c.fillStyle = BLUE; c.fillRect(-450 + K.measure(c, s, SF(px, 700)) + 4, -24, 4, 50); }
        } },
        { x: 540, y: 560, in: "fade", at: 0.4, draw: (c, t) => {          // predictive bar
          const parts = ["platform", "length", "energy", "look", "goal"], w = 1010 / 5;
          c.fillStyle = "#d2d4da"; rr(c, -505, -40, 1010, 80, [26, 26, 0, 0]); c.fill();
          parts.forEach((p, i) => {
            const at = 0.9 + i * 0.5, b = pulse(t, at, 8), used = t >= at;
            const x = -505 + i * w + w / 2;
            if (b > 0.05) { c.fillStyle = `rgba(255,255,255,${b})`; rr(c, x - w / 2 + 6, -32, w - 12, 64, 12); c.fill(); }
            K.text(c, `"${p}"`, x, 12, SF(30, 600, { align: "center", color: used ? "#a0a3ab" : INK }));
            if (i < 4) { c.fillStyle = "#b6b9c1"; c.fillRect(-505 + (i + 1) * w - 1, -20, 2, 40); }
          });
        } },
        { x: 540, y: 600, in: "none", at: 0, draw: (c, t) => keyboard(c, 1010, t, null, {}) },
        { x: 540, y: 1185, in: "up", at: 0.6, draw: (c, t) => {
          const ex = [["Reel", "platform"], ["30s", "length"], ["high energy", "energy"], ["teal & orange", "look"], ["sell the shoe", "goal"]];
          const w = 1010 / 5;
          ex.forEach(([s, k], i) => {
            const at = 1.1 + i * 0.5, e = outBack(win(at, at + 0.3, t), 2.4);
            if (t < at) return;
            c.save(); c.translate(-505 + i * w + w / 2, 0); c.scale(e, e);
            K.panel(c, -w / 2 + 8, -70, w - 16, 140, 20, "#fff", { color: "rgba(0,0,0,.14)", blur: 18, y: 8 });
            const px = K.fit(c, s, w - 40, SF(30, 700));
            K.text(c, s, 0, 0, SF(px, 700, { align: "center" }));
            K.text(c, k, 0, 40, SF(20, 600, { align: "center", color: BLUE }));
            c.restore();
          });
        } },
      ],
    },
    // 4 · Example, part by part
    {
      bg: bgCal(null, { today: 28, fade: 0.6 }),
      els: [
        { x: 60, y: 200, in: "left", at: 0.05, draw: (c) => K.text(c, "fill it in:", 0, 0, SF(104, 800)) },
        { x: 540, y: 640, rot: -1.5, in: "pop", at: 0.2, float: 1, draw: (c, t) => {
          K.panel(c, -480, -270, 960, 540, 34, "#fff", { color: "rgba(0,0,0,.16)", blur: 34, y: 14 });
          const segs = [["30s", "length"], [" "], ["Reel,", "platform"], [" "], ["high energy,", "energy"], [" "], ["teal & orange,", "look"], [" "], ["bold captions,", "look"], [" "], ["end on the product.", "goal"]];
          const f = SF(66, 600), maxW = 860, lh = 86;
          let x = 0, y = 0;
          const boxes = [];
          const order = ["length", "platform", "energy", "look", "goal"];
          segs.forEach(([s, tag]) => {
            const words = s === " " ? [" "] : s.split(/(?= )/);
            words.forEach((wd) => {
              const ww = K.measure(c, wd, f);
              if (x + ww > maxW && wd !== " ") { x = 0; y += lh; wd = wd.trimStart(); }
              const w2 = K.measure(c, wd, f);
              if (tag) boxes.push({ x, y, w: w2, tag });
              x += w2;
              c.save(); c.translate(-430, -150); K.text(c, wd, x - w2, y, f); c.restore();
            });
          });
          const k = clamp(Math.floor((t - 1.0) / 0.6), -1, 4);
          if (k >= 0) {
            const tag = order[k];
            c.save(); c.translate(-430, -150); c.globalCompositeOperation = "multiply";
            const bs = boxes.filter((b) => b.tag === tag);
            bs.forEach((b) => { c.fillStyle = HL; c.fillRect(b.x - 4, b.y - 58, b.w + 8, lh - 6); });
            c.globalCompositeOperation = "source-over";
            const a = bs[0], z = bs[bs.length - 1];
            handles(c, a.x - 4, a.y - 58, z.x + z.w + 4, z.y - 58 + lh - 6, 1);
            c.restore();
          }
          // tag row along the bottom of the sheet
          order.forEach((tag, i) => {
            const on = t >= 1.0 + i * 0.6;
            c.save(); c.translate(-372 + i * 186, 210);
            K.panel(c, -84, -28, 168, 56, 28, on ? BLUE : "#f0f0f3");
            K.text(c, tag, 0, 10, SF(26, 700, { align: "center", color: on ? "#fff" : "#b0b0b6" }));
            c.restore();
          });
        } },
        { x: 860, y: 1110, rot: 5, in: "up", at: 3.6, dur: 0.6, float: 1, draw: (c, t, lt) => {
          photoWindow(c, 330, 420, "vibe_edit.mov", (c, w, h) => CARDS.reel(c, w, h, t, { look: "teal", caps: [["END", "ON"], ["THE", "PRODUCT."]], capsAt: 3.8, capEvery: 0.18, capY: 0.6 }, { D }));
        } },
        { x: 330, y: 1120, in: "fade", at: 3.7, draw: (c) => { K.text(c, "→ the edit that", 0, 0, SF(44, 700, { align: "center" })); K.text(c, "comes back", 0, 54, SF(44, 700, { align: "center", color: BLUE })); } },
      ],
    },
    // 5 · Before / after
    {
      bg: bgCal(null, { today: 28, fade: 0.3 }),
      els: [
        { x: 290, y: 600, rot: -5, in: "left", at: 0.1, float: 1, draw: (c, t) => {
          photoWindow(c, 440, 640, "\"make it cool\"", (c, w, h) => { K.photo(c, 0, 0, w, h, "street_vlog", t, "log", 0, 0.5); K.text(c, "cool video", w / 2, h * 0.8, { family: "InterL", size: 28, weight: 400, color: "#fff", align: "center" }); });
          c.save(); c.translate(0, -360); pill(c, "before", { size: 28, fill: "#ececf0", color: GREY }); c.restore();
        } },
        { x: 790, y: 650, rot: 4, in: "right", at: 0.25, float: 1, draw: (c, t) => {
          photoWindow(c, 440, 640, "the formula", (c, w, h) => CARDS.reel(c, w, h, t, { scenes: ["street_vlog"], look: "teal", title: "VIBE EDITING", titleAt: 1.2, caps: [["JUST"], ["VIBE."]], capsAt: 1.6, capEvery: 0.4, capY: 0.66 }, { D }));
          if (t > 2.2) transformBox(c, 470, 670, t, 0.4);
          const b = outBack(win(2.6, 2.95, t), 2.6);
          if (t > 2.6) { c.save(); c.translate(200, -310); c.scale(b, b); c.fillStyle = BLUE; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill(); U.icon.check(c, 0, 2, 44, "#fff", 4); c.restore(); }
          c.save(); c.translate(0, -370); pill(c, "after", { size: 28, fill: BLUE, color: "#fff" }); c.restore();
        } },
        { x: 70, y: 1135, in: "none", at: 0, draw: (c, t) => {
          K.text(c, "same clips.", 0, -10, SF(66, 800));
          c.save(); c.translate(0, 84); selectText(c, ["one better sentence."], SF(66, 800), t, 0.9, 3.0, 26); c.restore();
        } },
      ],
    },
    // 6 · CTA
    {
      bg: bgCal(null, { today: 28, fade: 0.5 }),
      els: [
        { x: 60, y: 160, in: "left", at: 0.05, draw: (c) => { K.text(c, "save this", 0, 0, SF(104, 800)); K.text(c, "formula.", 0, 104, SF(104, 800)); } },
        { x: 820, y: 200, rot: 6, in: "right", at: 0.25, float: 1, draw: (c, t) => {
          K.panel(c, -170, -110, 340, 220, 16, "#fff", { color: "rgba(0,0,0,.2)", blur: 22, y: 10 });
          c.save(); rr(c, -160, -100, 320, 200, 10); c.clip(); c.drawImage(K.IMG.pack, -160, -100, 320, 200); c.restore();
          const b = outBack(win(1.0, 1.4, t), 2.4);
          if (t > 1.0) { c.save(); c.translate(150, 90); c.scale(b, b); c.rotate(t * 0.5); K.starburst(c, 0, 0, 52, 42, 12, "#ffc93c"); c.rotate(-t * 0.5 - 0.2); K.text(c, "FREE", 0, 8, SF(24, 900, { align: "center" })); c.restore(); }
        } },
        { x: 70, y: 520, in: "none", at: 0, draw: (c, t) => {
          K.text(c, "comment", 0, -12, SF(60, 600, { color: GREY }));
          c.save(); c.translate(0, 110); selectText(c, ["\"VIBE\""], SF(120, 800), t, 0.5, 1.3, 12); c.restore();
          popover(c, 560, 90, ["Copy", "Share…"], t, 1.8, 0, 2.3);
          if (t > 2.3) { const e = outCubic(win(2.3, 2.6, t)) * (1 - win(3.6, 3.9, t)); c.save(); c.globalAlpha = e; c.translate(560, 160); pill(c, "Copied ✓", { size: 30, fill: "#1c1c1e", color: "#fff" }); c.restore(); }
          K.text(c, "for my free prompt pack.", 0, 220, SF(48, 600));
        } },
        { x: 540, y: 820, in: "pop", at: 0.6, draw: (c, t) => {
          K.panel(c, -480, -50, 960, 100, 50, "#fff", { color: "rgba(0,0,0,.14)", blur: 20, y: 8 });
          const s = K.typed("VIBE", t, 2.6, 6);
          K.text(c, s || "Add a comment…", -430, 14, SF(40, s ? 700 : 500, { color: s ? INK : "#b0b0b6" }));
          const sent = t > 3.5;
          c.fillStyle = sent ? "#c4c4c9" : BLUE; c.beginPath(); c.arc(420, 0, 32, 0, 7); c.fill();
          c.strokeStyle = "#fff"; c.lineWidth = 5; c.lineCap = c.lineJoin = "round";
          c.beginPath(); c.moveTo(420, 16); c.lineTo(420, -16); c.moveTo(406, -2); c.lineTo(420, -16); c.lineTo(434, -2); c.stroke();
          if (sent) { c.save(); c.globalAlpha = outCubic(win(3.5, 3.8, t)); c.translate(300, -100); pill(c, "VIBE", { size: 34, fill: BLUE, color: "#fff" }); c.restore(); }
        } },
        { x: 540, y: 905, in: "up", at: 0.3, draw: (c, t) => keyboard(c, 1010, t, { s: "VIBE", at: 2.6, cps: 6 }, { down: ["\n", 3.45] }) },
        { x: 540, y: 1300, in: "fade", at: 1.2, draw: (c) => pill(c, "follow for one vibe edit a day →", { size: 28, fill: "rgba(255,255,255,.95)" }) },
      ],
    },
  ],
};
})();
