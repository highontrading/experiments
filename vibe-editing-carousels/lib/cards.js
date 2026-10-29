// What plays inside each held card. Every card is CARDS[kind](c, w, h, t, p, env):
// draw into (0,0,w,h) at slide time t. `p` holds the card's copy and cue times.
(function () {
const { clamp, lerp, win, ss, outBack, outCubic, inOut, pulse, rnd, rr, F, wrap, txt, icon } = U;
const DK = { bg: "#15111e", panel: "#1f1a2c", line: "#2f2742", text: "#efeaf8", dim: "#8f86a6",
  violet: "#8b5cf6", violetL: "#c4b5fd", yellow: "#ffc93c", pink: "#ec4899", teal: "#22d3ee",
  orange: "#ff8a3d", green: "#22c55e", red: "#ef4444" };
const LT = { bg: "#f5f6fb", grid: "#dfe2f1", ink: "#16161a", dim: "#8e8e93", lilac: "#dcc7ff", blue: "#0095f6" };
const BEAT = 0.5;                                   // 120 BPM

function gridPaper(c, w, h, step = 18) {
  c.fillStyle = LT.bg; c.fillRect(0, 0, w, h);
  c.strokeStyle = LT.grid; c.lineWidth = 1;
  c.beginPath();
  for (let x = step; x < w; x += step) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); }
  for (let y = step; y < h; y += step) { c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); }
  c.stroke();
}
function darkBg(c, w, h, label, right) {
  c.fillStyle = DK.bg; c.fillRect(0, 0, w, h);
  if (label) {
    c.letterSpacing = "2px";
    txt(c, label, 16, 28, F.ui(14, 700), DK.dim);
    c.letterSpacing = "0px";
    if (right) txt(c, right, w - 16, 28, F.ui(14, 600), DK.violetL, "right");
  }
}
function typed(s, t, at, cps = 26) { return s.slice(0, Math.max(0, Math.floor((t - at) * cps))); }
function caret(t) { return Math.floor(t * 2.4) % 2 === 0; }
// Text that fits: shrink until the widest line fits maxW.
function fitFont(c, s, maxW, px, weight = 800, title = true) {
  for (; px > 8; px -= 1) { c.font = title ? F.title(px, weight) : F.ui(px, weight); if (c.measureText(s).width <= maxW) break; }
  return px;
}
function waveAmp(i, seed = 3) {
  const r = rnd(seed + i * 7919); return 0.25 + 0.75 * Math.pow(r(), 0.7);
}

const CARDS = {
  // A single clip thumbnail: footage plus a filename strip.
  thumb(c, w, h, t, p) {
    FOOTAGE.drawFootage(c, p.scene || "street_vlog", t, w, h, p.look || "raw", p.focus ?? 0.5);
    if (p.label) {
      c.fillStyle = "rgba(0,0,0,.55)"; c.fillRect(0, h - 34, w, 34);
      txt(c, p.label, 12, h - 11, F.ui(15, 600), "#fff");
      txt(c, p.len || "0:07", w - 12, h - 11, F.ui(14, 600), "#cfcfd6", "right");
    }
  },

  // Phone playing a reel: footage cut on the beat, word-by-word captions, optional title.
  reel(c, w, h, t, p, env) {
    c.fillStyle = "#0b0b0d"; c.fillRect(0, 0, w, h);
    const m = 7, sw = w - m * 2, sh = h - m * 2;
    c.save(); c.translate(m, m); rr(c, 0, 0, sw, sh, 18); c.clip();
    const scenes = p.scenes || ["influencer_talk", "street_vlog", "dance_girls"];
    const cutEvery = p.cutEvery ?? 1;
    const at = p.at ?? 0.6;
    const k = Math.max(0, Math.floor((t - at) / cutEvery));
    const lt = ((t - at) % cutEvery + cutEvery) % cutEvery;
    const look = p.lookAt != null ? (t >= p.lookAt ? p.look : "log") : (p.look || "raw");
    FOOTAGE.drawFootage(c, scenes[k % scenes.length], t, sw, sh, look, p.focus ?? 0.5);
    if (p.lookAt != null) {                         // grade wipe across the phone
      const u = inOut(win(p.lookAt - 0.35, p.lookAt, t));
      if (u > 0 && u < 1) {
        c.save(); rr(c, 0, 0, sw * u, sh, 0); c.clip();
        FOOTAGE.drawFootage(c, scenes[k % scenes.length], t, sw, sh, p.look, p.focus ?? 0.5);
        c.restore();
        c.fillStyle = "#fff"; c.fillRect(sw * u - 2, 0, 4, sh);
      }
    }
    if (p.flash !== false && t >= at) {             // cut flash
      const f = pulse(t, at + k * cutEvery, 14);
      if (f > 0.02) { c.fillStyle = `rgba(255,255,255,${0.35 * f})`; c.fillRect(0, 0, sw, sh); }
    }
    // reels chrome
    c.fillStyle = "rgba(255,255,255,.35)"; rr(c, 12, 12, sw - 24, 4, 2); c.fill();
    c.fillStyle = "#fff"; rr(c, 12, 12, (sw - 24) * clamp(t / env.D), 4, 2); c.fill();
    txt(c, "Reels", 14, 42, F.ui(17, 700), "#fff");
    const ix = sw - 22;
    icon.heart(c, ix, sh - 150, 26, p.liked && t > p.liked ? "#ff3040" : null, p.liked && t > p.liked ? null : "#fff");
    icon.bubble(c, ix, sh - 106, 24, "#fff");
    icon.plane(c, ix, sh - 64, 24, "#fff");
    // motion title
    if (p.title) {
      const ta = p.titleAt ?? 1.2, e = outBack(win(ta, ta + 0.45, t), 2);
      if (t >= ta) {
        c.save(); c.translate(sw / 2, sh * 0.3); c.scale(e, e);
        const px = fitFont(c, p.title, sw - 40, 34, 900);
        c.font = F.title(px, 900); c.textAlign = "center";
        c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 12;
        c.fillStyle = "#fff"; c.fillText(p.title, 0, 0);
        c.shadowBlur = 0;
        c.strokeStyle = DK.yellow; c.lineWidth = 4; c.lineCap = "round";
        const ww = c.measureText(p.title).width * clamp((t - ta - 0.2) * 3);
        c.beginPath(); c.moveTo(-c.measureText(p.title).width / 2, 12); c.lineTo(-c.measureText(p.title).width / 2 + ww, 12); c.stroke();
        c.restore();
      }
    }
    // captions, one word per beat
    if (p.caps) {
      const ca = p.capsAt ?? at, every = p.capEvery ?? BEAT;
      const lines = p.caps;                          // [["NO","TIMELINE"],["GRIND."]]
      const flat = lines.flat();
      const n = clamp(Math.floor((t - ca) / every) + 1, 0, flat.length);
      let idx = 0;
      const py0 = sh * (p.capY ?? 0.68);
      lines.forEach((ln, li) => {
        const words = ln.filter((_, j) => idx + j < n);
        const shown = words.join(" ");
        if (shown) {
          const px = fitFont(c, ln.join(" "), sw - 30, p.capSize || 30, 900);
          c.font = F.title(px, 900); c.textAlign = "left";
          const full = c.measureText(ln.join(" ")).width;
          let x = sw / 2 - full / 2;
          words.forEach((wd, j) => {
            const wi = idx + j, wt = ca + wi * every, e = outBack(win(wt, wt + 0.18, t), 2.4);
            const ww = c.measureText(wd).width;
            c.save(); c.translate(x + ww / 2, py0 + li * px * 1.15); c.scale(e, e);
            c.lineWidth = 7; c.strokeStyle = "#000"; c.lineJoin = "round";
            c.textAlign = "center"; c.strokeText(wd, 0, 0);
            c.fillStyle = wi === n - 1 ? DK.yellow : "#fff"; c.fillText(wd, 0, 0);
            c.restore();
            x += ww + c.measureText(" ").width;
          });
        }
        idx += ln.length;
      });
    }
    c.restore();
  },

  // Vibe Copilot on grid paper: the prompt types itself, then VIBE IT is pressed.
  prompt(c, w, h, t, p) {
    gridPaper(c, w, h);
    c.fillStyle = LT.lilac; rr(c, 14, 14, w - 28, 40, 10); c.fill();
    txt(c, p.head || "Vibe Copilot", 28, 40, F.ui(17, 700), "#3b2a63");
    for (let i = 0; i < 3; i++) { c.fillStyle = ["#ff5f57", "#febc2e", "#28c840"][i]; c.beginPath(); c.arc(w - 70 + i * 18, 34, 5.5, 0, 7); c.fill(); }
    const bx = 14, by = 66, bw = w - 28, bh = h - by - (p.button === false ? 14 : 84);
    c.fillStyle = "#fff"; rr(c, bx, by, bw, bh, 14); c.fill();
    c.strokeStyle = "#d9d3ef"; c.lineWidth = 2; c.stroke();
    const at = p.at ?? 0.7, fs = p.fs || 21;
    const s = typed(p.text, t, at, p.cps || 28);
    c.font = F.ui(fs, 600);
    const lines = wrap(c, s, bw - 32);
    lines.forEach((l, i) => txt(c, l, bx + 16, by + 34 + i * fs * 1.35, F.ui(fs, 600), LT.ink));
    if (caret(t) || s.length < p.text.length) {
      const last = lines[lines.length - 1] || "";
      c.font = F.ui(fs, 600);
      c.fillStyle = DK.violet;
      c.fillRect(bx + 17 + c.measureText(last).width, by + 34 + (lines.length - 1) * fs * 1.35 - fs + 2, 3, fs + 4);
    }
    if (p.button !== false) {
      const press = p.press ?? at + p.text.length / (p.cps || 28) + 0.4;
      const pp = pulse(t, press, 10), done = t >= press;
      const bW = w - 28, bH = 56, X = 14, Y = h - 70;
      c.save(); c.translate(X + bW / 2, Y + bH / 2); c.scale(1 - 0.06 * pp, 1 - 0.06 * pp);
      const g = c.createLinearGradient(-bW / 2, 0, bW / 2, 0);
      g.addColorStop(0, "#7c3aed"); g.addColorStop(1, "#a855f7");
      c.shadowColor = `rgba(139,92,246,${0.35 + 0.5 * pp})`; c.shadowBlur = 14 + 30 * pp;
      rr(c, -bW / 2, -bH / 2, bW, bH, 16); c.fillStyle = done && p.doneLabel ? DK.green : g; c.fill();
      c.shadowBlur = 0;
      txt(c, done && p.doneLabel ? p.doneLabel : "✦  VIBE IT", 0, 8, F.ui(21, 800), "#fff", "center");
      c.restore();
    }
  },

  // Dark editor timeline. mode "messy": jittery clips everywhere; "build": clips drop in.
  editor(c, w, h, t, p) {
    darkBg(c, w, h, "TIMELINE", p.tc || "00:00:12:04");
    const rows = p.rows || [["MG", DK.violet], ["CAP", DK.yellow], ["V1", DK.teal], ["SFX", DK.orange], ["A1", DK.pink]];
    const top = 44, rh = (h - top - 10) / rows.length, lx = 56, lw = w - lx - 10;
    const r = rnd(p.seed || 5);
    rows.forEach(([name, col], i) => {
      const y = top + i * rh;
      c.fillStyle = DK.panel; rr(c, 8, y + 3, w - 16, rh - 6, 6); c.fill();
      txt(c, name, 16, y + rh / 2 + 5, F.ui(13, 700), DK.dim);
      if (name === "A1") {
        c.fillStyle = col;
        for (let x = 0; x < lw; x += 5) {
          const a = waveAmp(x, 2) * (rh / 2 - 8) * (0.7 + 0.3 * Math.sin(t * 12.56 + x * 0.05));
          c.fillRect(lx + x, y + rh / 2 - a, 3, a * 2);
        }
        return;
      }
      if (p.mode === "messy") {
        let x = 0;
        while (x < lw - 10) {
          const cw = 10 + r() * 34, j = Math.sin(t * 9 + x) * 3;
          c.fillStyle = r() < 0.15 ? DK.red : col; c.globalAlpha = 0.85;
          rr(c, lx + x + j, y + 8, Math.min(cw, lw - x), rh - 16, 4); c.fill();
          x += cw + 2 + r() * 6;
        }
        c.globalAlpha = 1;
      } else {
        const n = p.clips?.[i] ?? 4, at = (p.at ?? 0.8) + i * (p.rowGap ?? 0.35);
        const cw = lw / n;
        for (let j = 0; j < n; j++) {
          const ct = at + j * (p.clipGap ?? 0.09), e = outBack(win(ct, ct + 0.3, t), 2);
          if (t < ct) continue;
          c.save(); c.translate(lx + j * cw + cw / 2, y + rh / 2 - (1 - e) * 26); c.globalAlpha = clamp(e * 2);
          rr(c, -cw / 2 + 2, -(rh - 16) / 2, cw - 4, rh - 16, 5); c.fillStyle = col; c.fill();
          c.restore();
        }
      }
    });
    // playhead
    const u = p.mode === "messy" ? 0.42 + 0.01 * Math.sin(t * 30) : win(p.playFrom ?? 1.2, p.playTo ?? 4.4, t);
    const px = lx + u * lw;
    c.fillStyle = DK.yellow; c.fillRect(px - 1.5, top - 6, 3, h - top);
    c.beginPath(); c.moveTo(px - 8, top - 10); c.lineTo(px + 8, top - 10); c.lineTo(px, top); c.fill();
    if (p.mode === "messy") {                        // warning toast
      const on = Math.floor(t * 2) % 2 === 0;
      c.fillStyle = on ? DK.red : "#b91c1c"; rr(c, w - 168, 8, 154, 26, 13); c.fill();
      txt(c, "⚠ Out of sync", w - 91, 26, F.ui(13, 700), "#fff", "center");
    }
  },

  // Waveform with cut markers snapping onto the beats.
  wave(c, w, h, t, p) {
    darkBg(c, w, h, p.label || "VIBE_BEAT.WAV", "120 BPM");
    const top = 46, mid = top + (h - top) / 2, amp = (h - top) / 2 - 16;
    const beatPx = p.beatPx || 44, bars = Math.floor(w / 6);
    for (let i = 0; i < bars; i++) {
      const x = 8 + i * 6;
      const onBeat = Math.abs(((x - 8) % beatPx)) < 6;
      const kick = pulse(((t % BEAT) + BEAT) % BEAT, 0, 10);
      const a = amp * waveAmp(i, 9) * (onBeat ? 1 : 0.55) * (0.75 + 0.25 * (onBeat ? kick : Math.sin(t * 8 + i)));
      c.fillStyle = onBeat ? "#f472b6" : "#9d3a72";
      rr(c, x, mid - a, 4, a * 2, 2); c.fill();
    }
    const at = p.at ?? 0.9, every = p.every || 1;
    const n = Math.floor((w - 16) / beatPx);
    for (let b = 0; b < n; b += every) {
      const ct = at + (b / every) * (p.gap ?? 0.18), e = outBack(win(ct, ct + 0.25, t), 2.5);
      if (t < ct) continue;
      const x = 8 + b * beatPx + 1;
      c.save(); c.translate(x, top - 40 * (1 - e));
      c.fillStyle = DK.yellow; c.fillRect(-1.5, 6, 3, h - top - 8);
      c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.lineTo(0, 9); c.fill();
      c.restore();
    }
    const ph = 8 + ((t * 2 * beatPx) % (w - 16));
    c.fillStyle = "#fff"; c.fillRect(ph, top, 2, h - top - 4);
  },

  // Before / after grade with a wipe that sweeps across.
  grade(c, w, h, t, p) {
    const look = p.look || "teal";
    const u = p.at != null ? lerp(0.08, 0.92, inOut(win(p.at, p.at + 1.4, t))) : 0.5 + 0.38 * Math.sin((2 * Math.PI * t) / 5);
    FOOTAGE.drawFootage(c, p.scene || "street_vlog", t, w, h, "log", p.focus ?? 0.5);
    c.save(); c.beginPath(); c.rect(0, 0, w * u, h); c.clip();
    FOOTAGE.drawFootage(c, p.scene || "street_vlog", t, w, h, look, p.focus ?? 0.5);
    c.restore();
    c.fillStyle = "#fff"; c.fillRect(w * u - 2, 0, 4, h);
    c.beginPath(); c.arc(w * u, h / 2, 16, 0, 7); c.fill();
    c.fillStyle = "#111"; c.beginPath(); c.moveTo(w * u - 9, h / 2); c.lineTo(w * u - 3, h / 2 - 6); c.lineTo(w * u - 3, h / 2 + 6); c.fill();
    c.beginPath(); c.moveTo(w * u + 9, h / 2); c.lineTo(w * u + 3, h / 2 - 6); c.lineTo(w * u + 3, h / 2 + 6); c.fill();
    const tag = (s, x, al) => {
      c.font = F.ui(14, 800); const tw = c.measureText(s).width + 20;
      c.fillStyle = "rgba(0,0,0,.6)"; rr(c, al === "right" ? x - tw : x, 12, tw, 26, 13); c.fill();
      txt(c, s, al === "right" ? x - tw / 2 : x + tw / 2, 30, F.ui(14, 800), "#fff", "center");
    };
    tag(p.name || "TEAL & ORANGE", 12, "left");
    tag("BEFORE", w - 12, "right");
  },

  // Looks list: the selection lands on one look.
  looks(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    txt(c, "Looks", 18, 36, F.ui(22, 800), LT.ink);
    const L = p.list || [["Teal & Orange", "#22d3ee", "#ff8a3d"], ["Film 35", "#3d5a4f", "#f1c27d"], ["Noir", "#0f0f10", "#e5e5e5"],
      ["Pastel Pop", "#c4b5fd", "#fbcfe8"], ["VHS 89", "#3b1d6e", "#ff5fa2"]];
    const rh = (h - 56) / L.length;
    const at = p.at ?? 0.9, pick = p.pick ?? 0;
    const cyc = t < at ? -1 : Math.floor((t - at) / 0.22);
    const sel = cyc < 0 ? -1 : cyc < L.length + pick ? cyc % L.length : pick;
    const lock = cyc >= L.length + pick;
    L.forEach(([name, a, b], i) => {
      const y = 50 + i * rh;
      if (i === sel) {
        c.fillStyle = lock ? "#fff4cf" : "#f1f1f5"; rr(c, 8, y + 3, w - 16, rh - 6, 12); c.fill();
        if (lock) { c.strokeStyle = "#e9b330"; c.lineWidth = 2.5; c.stroke(); }
      }
      const g = c.createLinearGradient(18, 0, 18 + rh - 14, 0); g.addColorStop(0, a); g.addColorStop(1, b);
      c.fillStyle = g; rr(c, 18, y + 8, rh - 16, rh - 16, 9); c.fill();
      txt(c, name, 18 + rh, y + rh / 2 + 7, F.ui(19, 700), LT.ink);
      if (i === sel && lock) { c.fillStyle = "#e9b330"; c.beginPath(); c.arc(w - 32, y + rh / 2, 13, 0, 7); c.fill(); icon.check(c, w - 32, y + rh / 2 + 1, 16, "#fff", 3); }
    });
  },

  // Copilot tool chips, pressed one after another.
  chips(c, w, h, t, p) {
    darkBg(c, w, h, "TOOLS");
    const L = p.list || ["Cut to beat", "Captions", "Motion GFX", "B-roll", "Sound FX", "Transitions"];
    const cols = p.cols || 2, gap = 10, cw = (w - 24 - gap * (cols - 1)) / cols, chh = p.chipH || 52;
    const at = p.at ?? 0.9, step = p.gap ?? 0.5;
    const on = p.on || L.map((_, i) => i);
    L.forEach((s, i) => {
      const x = 12 + (i % cols) * (cw + gap), y = 44 + Math.floor(i / cols) * (chh + gap);
      const k = on.indexOf(i), ct = k < 0 ? 1e9 : at + k * step;
      const lit = t >= ct, b = pulse(t, ct, 9);
      c.save(); c.translate(x + cw / 2, y + chh / 2); c.scale(1 + 0.07 * b, 1 + 0.07 * b);
      rr(c, -cw / 2, -chh / 2, cw, chh, 12);
      c.fillStyle = lit ? "#3b2770" : DK.panel; c.fill();
      c.strokeStyle = lit ? DK.violet : DK.line; c.lineWidth = 2; c.stroke();
      txt(c, s, -cw / 2 + 14, 7, F.ui(17, 700), lit ? "#fff" : DK.dim);
      if (lit) { c.fillStyle = DK.green; c.beginPath(); c.arc(cw / 2 - 18, 0, 10, 0, 7); c.fill(); icon.check(c, cw / 2 - 18, 1, 13, "#fff", 3, win(ct, ct + 0.2, t)); }
      c.restore();
    });
  },

  // Clock spinning through the hours an edit eats.
  clock(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.3;
    c.strokeStyle = LT.ink; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.lineWidth = i % 3 ? 2 : 4;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82); c.lineTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94); c.stroke();
    }
    const hrs = clamp(t / 4.4) * 3;                // 0 -> 3 hours over the slide
    const ma = hrs * Math.PI * 2 - Math.PI / 2, ha = (hrs / 12) * Math.PI * 2 - Math.PI / 2 + 0.3;
    c.lineCap = "round";
    c.strokeStyle = LT.ink; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ha) * R * 0.5, cy + Math.sin(ha) * R * 0.5); c.stroke();
    c.strokeStyle = DK.red; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ma) * R * 0.8, cy + Math.sin(ma) * R * 0.8); c.stroke();
    c.fillStyle = LT.ink; c.beginPath(); c.arc(cx, cy, 7, 0, 7); c.fill();
    const secs = Math.floor(hrs * 3600);
    const s = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
    txt(c, s, cx, h - 46, F.title(fitFont(c, "0:00:00", w - 40, 40), 800), hrs > 2.9 ? DK.red : LT.ink, "center");
    txt(c, p.label || "EDITING ONE REEL", cx, h - 18, F.ui(14, 700), LT.dim, "center");
  },

  // A to-do list that keeps growing.
  tasks(c, w, h, t, p) {
    c.fillStyle = "#fffdf5"; c.fillRect(0, 0, w, h);
    txt(c, p.head || "To-do · 1 reel", 18, 38, F.ui(21, 800), LT.ink);
    const L = p.list || ["Trim 46 clips", "Sync to the music", "Type captions", "Color grade", "Find SFX", "Export (again)"];
    const at = p.at ?? 0.7, step = p.gap ?? 0.45, rh = Math.min(46, (h - 70) / L.length);
    L.forEach((s, i) => {
      const ct = at + i * step, e = outBack(win(ct, ct + 0.3, t), 2);
      if (t < ct) return;
      const y = 56 + i * rh;
      c.save(); c.translate((1 - e) * w * 0.6, y); c.globalAlpha = clamp(e * 1.5);
      c.strokeStyle = "#c7c7cc"; c.lineWidth = 2.2; c.beginPath(); c.arc(28, rh / 2, 10, 0, 7); c.stroke();
      txt(c, s, 48, rh / 2 + 6, F.ui(17, 600), LT.ink);
      c.restore();
    });
    if (p.more) {
      const mt = at + L.length * step;
      if (t > mt) {
        const b = outBack(win(mt, mt + 0.3, t), 2.4);
        c.save(); c.translate(w - 70, h - 34); c.scale(b, b); c.rotate(-0.08);
        rr(c, -56, -17, 112, 34, 17); c.fillStyle = DK.red; c.fill();
        txt(c, p.more, 0, 6, F.ui(16, 800), "#fff", "center"); c.restore();
      }
    }
  },

  // An export bar that never moves.
  render(c, w, h, t, p) {
    c.fillStyle = "#f2f2f5"; c.fillRect(0, 0, w, h);
    txt(c, p.head || "Exporting…", 20, 42, F.ui(20, 800), LT.ink);
    txt(c, p.file || "reel_FINAL_v7.mp4", 20, 70, F.ui(15, 600), LT.dim);
    const pr = 0.09 + 0.05 * clamp(t / 4.6);
    c.fillStyle = "#dcdce2"; rr(c, 20, 92, w - 40, 14, 7); c.fill();
    c.fillStyle = DK.violet; rr(c, 20, 92, (w - 40) * pr, 14, 7); c.fill();
    txt(c, `${Math.floor(pr * 100)}%`, 20, 132, F.ui(16, 700), LT.ink);
    const mins = 161 + Math.floor(t * 9);
    txt(c, `${Math.floor(mins / 60)}h ${mins % 60}m left`, w - 20, 132, F.ui(16, 700), DK.red, "right");
    // spinning wheel
    const cx = w / 2, cy = (h + 150) / 2, R = Math.min(30, (h - 160) / 3);
    if (R > 10) for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.floor(t * 12) * (Math.PI / 6);
      c.strokeStyle = `rgba(30,30,40,${0.15 + 0.85 * (i / 12)})`; c.lineWidth = 5; c.lineCap = "round";
      c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
    }
  },

  // Media bin filling with clips plus one music track.
  media(c, w, h, t, p) {
    darkBg(c, w, h, "MEDIA");
    const n = p.n || 9, cols = p.cols || 3, gap = 8, tw = (w - 24 - gap * (cols - 1)) / cols, th = tw * 0.62;
    const at = p.at ?? 0.8, step = p.gap ?? 0.14;
    const scenes = ["vlog_talk", "city_night", "dance_girls", "street_vlog", "latte", "podcast_two", "waves", "skincare", "night_drive"], looks = ["raw", "log", "raw"];
    let shown = 0;
    for (let i = 0; i < n; i++) {
      const ct = at + i * step, e = outBack(win(ct, ct + 0.3, t), 2.2);
      if (t < ct) continue;
      shown++;
      const x = 12 + (i % cols) * (tw + gap), y = 44 + Math.floor(i / cols) * (th + gap);
      c.save(); c.translate(x + tw / 2, y + th / 2); c.scale(e, e); c.translate(-tw / 2, -th / 2);
      rr(c, 0, 0, tw, th, 7); c.save(); c.clip();
      FOOTAGE.drawFootage(c, scenes[i % scenes.length], 0, tw, th, looks[i % 3]);
      c.restore(); c.restore();
    }
    const rows = Math.ceil(n / cols), ay = 44 + rows * (th + gap) + 4;
    const mt = at + n * step;
    if (t > mt && ay + 40 < h) {
      const e = outBack(win(mt, mt + 0.3, t), 2);
      c.save(); c.globalAlpha = clamp(e);
      c.fillStyle = DK.panel; rr(c, 12, ay, w - 24, 40, 8); c.fill();
      c.fillStyle = DK.pink;
      for (let x = 0; x < w - 150; x += 4) { const a = waveAmp(x, 4) * 12; c.fillRect(20 + x, ay + 20 - a, 2, a * 2); }
      txt(c, "vibe_beat.wav", w - 20, ay + 26, F.ui(13, 700), DK.text, "right");
      c.restore();
    }
    txt(c, `${shown + (t > mt ? 1 : 0)} files`, w - 16, 28, F.ui(14, 700), DK.violetL, "right");
  },

  // Sound FX stamps landing on the cuts.
  sfx(c, w, h, t, p) {
    darkBg(c, w, h, "SOUND FX");
    const L = p.list || ["WHOOSH", "POP", "HIT", "RISER"];
    const lane = 52, lh = h - lane - 16;
    c.fillStyle = DK.panel; rr(c, 10, lane, w - 20, lh, 10); c.fill();
    const at = p.at ?? 0.9, step = p.gap ?? 0.55, sw = (w - 40) / L.length;
    for (let i = 0; i <= L.length; i++) { c.fillStyle = "rgba(255,201,60,.5)"; c.fillRect(20 + i * sw - 1, lane + 6, 2, lh - 12); }
    L.forEach((s, i) => {
      const ct = at + i * step;
      if (t < ct - 0.15) return;
      const fall = win(ct - 0.15, ct, t), sq = pulse(t, ct, 12);
      const x = 20 + i * sw + sw / 2, y = lane + lh / 2 - (1 - fall) * 90;
      c.save(); c.translate(x, y); c.scale(1 + 0.25 * sq, 1 - 0.2 * sq); c.rotate((i % 2 ? 1 : -1) * 0.06);
      rr(c, -sw / 2 + 6, -lh / 2 + 12, sw - 12, lh - 24, 10); c.fillStyle = DK.orange; c.fill();
      const px = fitFont(c, s, sw - 22, 16, 800, false);
      txt(c, s, 0, 6, F.ui(px, 800), "#2b1300", "center");
      c.restore();
      if (sq > 0.05) {
        c.strokeStyle = `rgba(255,138,61,${sq})`; c.lineWidth = 3;
        c.beginPath(); c.arc(x, lane + lh / 2, (1 - sq) * 60 + 20, 0, 7); c.stroke();
      }
    });
  },

  // Sticky note with director notes written in.
  sticky(c, w, h, t, p) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#fff3a3"); g.addColorStop(1, "#ffe066");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.55)"; c.save(); c.translate(w / 2, 4); c.rotate(-0.04); c.fillRect(-46, -12, 92, 26); c.restore();
    txt(c, p.head || "Director notes:", 20, 50, F.hand(30), "#5b4300");
    const L = p.list || ["punchier first 2s", "bigger captions", "end on the logo"];
    const at = p.at ?? 1.0, step = p.gap ?? 0.7, fs = p.fs || 29;
    L.forEach((s, i) => {
      const ct = at + i * step;
      if (t < ct) return;
      const y = 92 + i * (fs * 1.45);
      c.font = F.hand(fs);
      const tw = c.measureText(s).width;
      const u = win(ct, ct + 0.45, t);
      c.save(); c.beginPath(); c.rect(18, y - fs, 40 + tw * u, fs * 1.4); c.clip();
      txt(c, `${i + 1}. ${s}`, 20, y, F.hand(fs), "#2d2200");
      c.restore();
      const dt = ct + 0.9;
      if (t > dt) icon.check(c, 40 + tw + 26, y - 8, 22, "#16a34a", 3.5, win(dt, dt + 0.25, t));
    });
  },

  // Export done: a check draws itself, confetti pops.
  export(c, w, h, t, p) {
    darkBg(c, w, h);
    const at = p.at ?? 1.2;
    const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.22;
    const u = win(at, at + 0.5, t);
    c.strokeStyle = "#1f3b2a"; c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.strokeStyle = DK.green; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); c.stroke();
    if (t > at + 0.4) icon.check(c, cx, cy + 2, R * 1.1, DK.green, 4, win(at + 0.4, at + 0.7, t));
    txt(c, t > at + 0.5 ? (p.label || "EXPORTED · 4K") : "Exporting…", cx, h - 34, F.ui(20, 800), t > at + 0.5 ? DK.green : DK.dim, "center");
    const r = rnd(4), ct = t - at - 0.5;
    if (ct > 0 && ct < 1.8) for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2, v = 120 + r() * 200;
      const x = cx + Math.cos(a) * v * ct, y = cy + Math.sin(a) * v * ct + 160 * ct * ct;
      c.fillStyle = [DK.yellow, DK.violet, DK.pink, DK.teal, DK.green][i % 5];
      c.globalAlpha = clamp(1.6 - ct); c.save(); c.translate(x, y); c.rotate(ct * 8 + i); c.fillRect(-4, -2, 8, 4); c.restore();
    }
    c.globalAlpha = 1;
  },

  // An Instagram post getting saved.
  saved(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#e9e3ff"; c.beginPath(); c.arc(28, 26, 14, 0, 7); c.fill();
    K.avatar(c, 28, 26, 14, "influencer_talk");
    txt(c, p.user || "vibe.editing", 50, 32, F.ui(15, 700), LT.ink);
    const ih = h - 112;
    c.save(); c.beginPath(); c.rect(0, 50, w, ih); c.clip(); c.translate(0, 50);
    FOOTAGE.drawFootage(c, p.scene || "influencer_talk", t, w, ih, "raw");
    c.restore();
    const y = 50 + ih + 30;
    icon.heart(c, 26, y, 28, null, LT.ink); icon.bubble(c, 66, y, 26, LT.ink); icon.plane(c, 106, y, 26, LT.ink);
    const at = p.at ?? 1.4, b = outBack(win(at, at + 0.35, t), 3);
    c.save(); c.translate(w - 28, y); const sc = t > at ? 0.8 + 0.2 * b + 0.25 * pulse(t, at, 6) : 1; c.scale(sc, sc);
    icon.bookmark(c, 0, 0, 28, t > at ? LT.ink : null, LT.ink); c.restore();
    if (t > at) {
      const e = outCubic(win(at, at + 0.3, t)) * (1 - win(at + 2.2, at + 2.5, t));
      c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 20);
      rr(c, 14, 50 + ih - 54, w - 28, 42, 12); c.fillStyle = "rgba(20,20,24,.9)"; c.fill();
      txt(c, "Saved for your next edit", w / 2, 50 + ih - 27, F.ui(15, 700), "#fff", "center");
      c.restore();
    }
  },

  // Comments sheet: someone types the keyword and posts it.
  comment(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#d1d1d6"; rr(c, w / 2 - 22, 10, 44, 5, 3); c.fill();
    txt(c, "Comments", w / 2, 44, F.ui(18, 800), LT.ink, "center");
    const word = p.word || "VIBE";
    const at = p.at ?? 0.9, post = at + word.length * 0.18 + 0.4;
    const base = [["maya.creates", word], ["editwithjay", word + " please!"], ["reelsbyro", word]];
    const posted = t >= post;
    const list = posted ? [["you", word], ...base] : base;
    const slide = posted ? outCubic(win(post, post + 0.35, t)) : 1;
    list.forEach(([u, s], i) => {
      const y = 70 + (i - (posted ? 1 - slide : 0)) * 54;
      if (y > h - 70) return;
      c.save(); if (posted && i === 0) c.globalAlpha = slide;
      c.fillStyle = ["#c4b5fd", "#fbcfe8", "#a7f3d0", "#fde68a"][i % 4]; c.beginPath(); c.arc(30, y + 18, 16, 0, 7); c.fill();
      txt(c, u, 56, y + 12, F.ui(13, 700), LT.dim);
      txt(c, s, 56, y + 32, F.ui(17, 700), LT.ink);
      const liked = i === 0 && posted && t > post + 0.6;
      icon.heart(c, w - 26, y + 22, 18, liked ? "#ff3040" : null, liked ? null : "#8e8e93");
      c.restore();
    });
    const iy = h - 54;
    c.fillStyle = "#f2f2f5"; rr(c, 12, iy, w - 24, 42, 21); c.fill();
    const s = posted ? "" : typed(word, t, at, 5.5);
    txt(c, s || (posted ? "Add a comment…" : ""), 30, iy + 27, F.ui(17, s ? 700 : 500), s ? LT.ink : LT.dim);
    if (!posted && caret(t)) { c.font = F.ui(17, 700); c.fillStyle = LT.blue; c.fillRect(31 + c.measureText(s).width, iy + 11, 2, 20); }
    txt(c, "Post", w - 30, iy + 27, F.ui(16, 800), s ? LT.blue : "#b3d9fb", "right");
  },

  // The prompt pack cover with a FREE sticker.
  pack(c, w, h, t, p, env) {
    c.fillStyle = "#0e0b17"; c.fillRect(0, 0, w, h);
    const im = env.IMG.pack, s = Math.max(w / im.width, h / im.height);
    c.drawImage(im, (w - im.width * s) / 2, 0, im.width * s, im.height * s);
    const u = ((t * 0.5) % 1.4) - 0.2;                // shine sweep
    const g = c.createLinearGradient(w * u - 80, 0, w * u + 80, h * 0.3);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.28)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const at = p.at ?? 0.9, b = outBack(win(at, at + 0.4, t), 2.6);
    if (t > at) {
      c.save(); c.translate(64, h - 60); c.scale(b, b); c.rotate(t * 0.6);
      c.beginPath();
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 44 : 54; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath(); c.fillStyle = DK.yellow; c.fill();
      c.rotate(-t * 0.6 - 0.2);
      txt(c, "FREE", 0, 8, F.title(22, 900), "#1a1200", "center");
      c.restore();
    }
  },

  // Profile card with a Follow button (pressed by a tap item).
  follow(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#7c3aed"); g.addColorStop(1, "#ec4899");
    c.fillStyle = g; c.beginPath(); c.arc(56, 62, 38, 0, 7); c.fill();
    c.fillStyle = "#1a1528"; c.beginPath(); c.arc(56, 62, 33, 0, 7); c.fill();
    K.avatar(c, 56, 62, 33, "vlog_talk");
    txt(c, p.name || "Vibe Editing", 108, 54, F.ui(21, 800), LT.ink);
    txt(c, p.sub || "One vibe edit a day", 108, 80, F.ui(15, 500), LT.dim);
    const press = p.press ?? 2.4, done = t >= press, b = pulse(t, press, 10);
    const stats = [["posts", 128], ["followers", (p.followers || 12480) + (done ? 1 : 0)], ["following", 89]];
    stats.forEach(([k, v], i) => {
      const x = 30 + i * ((w - 60) / 3) + (w - 60) / 6;
      txt(c, v.toLocaleString("en-US"), x, 136, F.ui(19, 800), LT.ink, "center");
      txt(c, k, x, 156, F.ui(13, 500), LT.dim, "center");
    });
    const bw = w - 32, by = h - 62;
    c.save(); c.translate(16 + bw / 2, by + 22); c.scale(1 - 0.06 * b, 1 - 0.06 * b);
    rr(c, -bw / 2, -22, bw, 44, 10); c.fillStyle = done ? "#efeff4" : LT.blue; c.fill();
    txt(c, done ? "Following ✓" : "Follow", 0, 7, F.ui(18, 800), done ? LT.ink : "#fff", "center");
    c.restore();
  },

  // DM thread: the keyword in, the pack out.
  dm(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#f2f2f5"; c.fillRect(0, 0, w, 50);
    txt(c, p.head || "Messages", w / 2, 32, F.ui(17, 800), LT.ink, "center");
    const at = p.at ?? 0.8;
    const pop = (ct) => outBack(win(ct, ct + 0.3, t), 2);
    let y = 70;
    if (t > at) {                                   // their message, right
      const e = pop(at); c.save(); c.translate(w - 20, y + 20); c.scale(e, e);
      c.font = F.ui(17, 700); const tw = c.measureText(p.word || "VIBE").width + 30;
      rr(c, -tw, -20, tw, 40, 20); c.fillStyle = "#7c3aed"; c.fill();
      txt(c, p.word || "VIBE", -tw / 2, 6, F.ui(17, 700), "#fff", "center"); c.restore();
    }
    y += 56;
    const ty = at + 0.6, rt = at + 1.5;
    if (t > ty && t < rt) {                         // typing dots
      c.fillStyle = "#efeff4"; rr(c, 16, y, 70, 36, 18); c.fill();
      for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(100,100,110,${0.4 + 0.6 * pulse((t * 3 + i * 0.33) % 1, 0, 4)})`; c.beginPath(); c.arc(36 + i * 15, y + 18, 5, 0, 7); c.fill(); }
    }
    if (t >= rt) {
      const e = pop(rt); c.save(); c.translate(16, y); c.scale(e, e);
      const bw = Math.min(w - 50, 260);
      rr(c, 0, 0, bw, 44, 20); c.fillStyle = "#efeff4"; c.fill();
      txt(c, p.reply || "Here's your free pack!", 16, 28, F.ui(16, 600), LT.ink);
      rr(c, 0, 52, bw, 58, 14); c.fillStyle = "#f6f2ff"; c.fill(); c.strokeStyle = "#ddd2fb"; c.lineWidth = 2; c.stroke();
      rr(c, 12, 62, 30, 38, 4); c.fillStyle = DK.red; c.fill();
      txt(c, "PDF", 27, 86, F.ui(11, 800), "#fff", "center");
      txt(c, p.file || "Vibe_Editing_Prompts.pdf", 52, 86, F.ui(14, 700), LT.ink);
      c.restore();
    }
  },

  // Big BPM readout with a beat pulse.
  bpm(c, w, h, t, p) {
    darkBg(c, w, h, "TEMPO");
    const k = pulse(((t % BEAT) + BEAT) % BEAT, 0, 9);
    c.fillStyle = `rgba(236,72,153,${0.15 + 0.4 * k})`; c.beginPath(); c.arc(w / 2, h / 2 + 8, 40 + 26 * k, 0, 7); c.fill();
    txt(c, String(p.bpm || 120), w / 2, h / 2 + 24, F.title(fitFont(c, "120", w - 60, 64, 900), 900), "#fff", "center");
    txt(c, "BPM", w / 2, h - 20, F.ui(16, 800), DK.pink, "center");
    const n = 4, beat = Math.floor(t / BEAT) % n;
    for (let i = 0; i < n; i++) { c.fillStyle = i === beat ? DK.yellow : DK.line; c.beginPath(); c.arc(w / 2 + (i - 1.5) * 22, 54, 6, 0, 7); c.fill(); }
  },

  // Layers stacking onto the video, one at a time.
  layers(c, w, h, t, p) {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
    const L = p.list || [["VIDEO", DK.teal], ["CAPTIONS", DK.yellow], ["MOTION", DK.violet], ["LOOK", DK.orange]];
    const at = p.at ?? 0.8, step = p.gap ?? 0.6;
    const pw = w * 0.62, ph = pw * 0.36, cx = w / 2, base = h - 40;
    L.forEach(([s, col], i) => {
      const ct = at + (i - 1) * step;
      const e = i === 0 ? 1 : outBack(win(ct, ct + 0.35, t), 2);
      if (i > 0 && t < ct) return;
      const y = base - i * (ph * 0.55) - (1 - e) * 120;
      c.save(); c.translate(cx, y); c.globalAlpha = clamp(e * 2);
      c.transform(1, -0.3, 1, 0.3, 0, 0);                 // iso plate
      rr(c, -pw / 2, -ph / 2, pw, ph, 10); c.fillStyle = col; c.globalAlpha *= 0.9; c.fill();
      c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 2; c.stroke();
      c.restore();
      c.save(); c.globalAlpha = clamp(e * 2);
      txt(c, s, cx, y + 5, F.ui(14, 800), "rgba(0,0,0,.75)", "center"); c.restore();
    });
  },

  // Grid-paper file card (homage to the reference): the cursor clicks play.
  file(c, w, h, t, p, env) {
    gridPaper(c, w, h, 16);
    const press = p.press ?? 1.6, playing = t >= press;
    const bx = 18, by = 30, bw = w - 36, bh = Math.min(170, h * 0.42);
    c.fillStyle = "#fff"; rr(c, bx, by, bw, bh, 10); c.fill();
    c.fillStyle = LT.lilac; rr(c, bx, by, bw, 26, [10, 10, 0, 0]); c.fill();
    if (playing) {
      c.save(); rr(c, bx, by + 26, bw, bh - 26, [0, 0, 10, 10]); c.clip(); c.translate(bx, by + 26);
      FOOTAGE.drawFootage(c, p.scene || "street_vlog", t, bw, bh - 26, "raw"); c.restore();
      c.fillStyle = "rgba(255,255,255,.5)"; rr(c, bx + 10, by + bh - 14, bw - 20, 4, 2); c.fill();
      c.fillStyle = "#fff"; rr(c, bx + 10, by + bh - 14, (bw - 20) * win(press, env.D, t), 4, 2); c.fill();
    } else {
      const cx = bx + bw / 2, cy = by + 26 + (bh - 26) / 2 - 8;
      c.strokeStyle = "#555"; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.stroke();
      c.fillStyle = "#555"; c.beginPath(); c.moveTo(cx - 6, cy - 10); c.lineTo(cx + 11, cy); c.lineTo(cx - 6, cy + 10); c.fill();
      c.letterSpacing = "2px"; txt(c, (p.name || "launch_reel.vibe").toUpperCase(), cx, cy + 46, F.ui(11, 700), "#555", "center"); c.letterSpacing = "0px";
    }
    // to-do block like the reference
    const ty = by + bh + 18;
    c.fillStyle = "#fff"; rr(c, bx, ty, bw * 0.62, h - ty - 18, 8); c.fill();
    txt(c, "To Do List", bx + 10, ty + 20, F.ui(11, 800), LT.ink);
    (p.todo || ["Dump clips", "Type the vibe", "Cut to beat", "Layer it", "Sound pass"]).forEach((s, i) => {
      const yy = ty + 38 + i * 15; if (yy > h - 26) return;
      const done = t > (p.todoAt ?? 2.2) + i * 0.3;
      c.strokeStyle = "#999"; c.lineWidth = 1.2; c.strokeRect(bx + 10, yy - 8, 8, 8);
      if (done) icon.check(c, bx + 14, yy - 4, 10, "#16a34a", 2.2);
      txt(c, s, bx + 24, yy, F.ui(10, 600), "#333");
    });
    c.fillStyle = "#fff59d"; c.beginPath(); c.arc(bx + bw * 0.82, ty + 26, 9, 0, 7); c.fill();
    // cursor travels to play and clicks
    const u = inOut(win(press - 0.9, press - 0.1, t));
    const cx0 = bx + bw * 0.85, cy0 = by + bh + 40, cx1 = bx + bw / 2 + 4, cy1 = by + 26 + (bh - 26) / 2 - 4;
    const k = pulse(t, press, 12);
    icon.cursor(c, lerp(cx0, cx1, u), lerp(cy0, cy1, u), 1 - 0.15 * k);
  },
};
window.CARDS = CARDS;
})();
