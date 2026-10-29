// Carousel 01: The 5-Step Vibe Editing System.
// Design system: a real cloud timelapse, real hands holding phones in from the edges (each
// screen plays real footage or a Vibe Editing screen), and an iOS Notes card in the middle.
(function () {
const { clamp, lerp, win, ss, outCubic, spring, rr, F, wrap, txt } = U;
const GOLD = "#b8862b";

// ------------------------------------------------------------- backdrop --
function sky(c, t) {
  FOOTAGE.drawFootage(c, "clouds", t, K.W, K.H, "raw", 0.5);
  c.fillStyle = "rgba(255,255,255,.06)"; c.fillRect(0, 0, K.W, K.H);
}

// ---------------------------------------------------------- Notes card --
function notesLayout(c, N) {
  const w = N.w || 820, pad = 40, iw = w - pad * 2, ops = [];
  let y = 34;
  ops.push({ k: "header", y }); y += 58;
  if (N.kicker) { ops.push({ k: "kicker", y: y + 22, s: N.kicker }); y += 44; }
  const ts = N.size || 66;
  c.font = F.title(ts);
  for (const l of wrap(c, N.title.toUpperCase(), iw)) { y += ts; ops.push({ k: "title", y, s: l, ts }); }
  y += 8;
  if (N.body) {
    const bs = N.bodySize || 31; c.font = F.ui(bs, 500);
    for (const l of wrap(c, N.body, iw)) { y += bs * 1.3; ops.push({ k: "body", y, s: l, bs }); }
  }
  if (N.pills) { y += 22; ops.push({ k: "pills", y, list: N.pills }); y += 64 * Math.ceil(N.pills.length / 3); }
  if (N.checklist) { y += 16; N.checklist.forEach((s, i) => { y += 58; ops.push({ k: "check", y, s, i }); }); y += 6; }
  return { w, h: y + 36, pad, ops };
}
function notes(c, t, S, N) {
  const L = notesLayout(c, N), p = L.pad;
  c.rotate((N.rot ?? -3) * Math.PI / 180); c.translate(-L.w / 2, -L.h / 2);
  c.save(); c.shadowColor = "rgba(20,40,80,.30)"; c.shadowBlur = 44; c.shadowOffsetY = 18;
  rr(c, 0, 0, L.w, L.h, 30); c.fillStyle = "#fff"; c.fill(); c.restore();
  for (const op of L.ops) {
    if (op.k === "header") {
      c.strokeStyle = GOLD; c.lineWidth = 3.4; c.lineCap = c.lineJoin = "round";
      c.beginPath(); c.moveTo(p + 10, op.y); c.lineTo(p, op.y + 11); c.lineTo(p + 10, op.y + 22); c.stroke();
      txt(c, "Notes", p + 22, op.y + 21, F.ui(27, 500), GOLD);
      c.font = F.ui(27, 700); const dw = c.measureText("Done").width;
      txt(c, "Done", L.w - p, op.y + 21, F.ui(27, 700), GOLD, "right");
      const cx = L.w - p - dw - 28;
      c.beginPath(); c.arc(cx, op.y + 12, 16, 0, 7); c.lineWidth = 2.6; c.stroke();
      c.fillStyle = GOLD; for (const d of [-6.5, 0, 6.5]) { c.beginPath(); c.arc(cx + d, op.y + 12, 2.1, 0, 7); c.fill(); }
      txt(c, `${S.idx + 1}/${S.n}`, L.w / 2, op.y + 21, F.ui(22, 600), "#a5a5ab", "center");
    } else if (op.k === "kicker") {
      c.letterSpacing = "3px"; txt(c, op.s.toUpperCase(), p, op.y, F.ui(22, 700), GOLD); c.letterSpacing = "0px";
    } else if (op.k === "title") txt(c, op.s, p - 2, op.y, F.title(op.ts), "#0b0b0c");
    else if (op.k === "body") txt(c, op.s, p, op.y, F.ui(op.bs, 500), "#1d1d1f");
    else if (op.k === "pills") {
      const gap = 12, pw = (L.w - p * 2 - gap * 2) / 3;
      op.list.forEach((s, i) => {
        const at = (N.pillsAt ?? 0.9) + i * (N.pillsGap ?? 0.45), on = ss(at, at + 0.2, t), bump = U.pulse(t, at, 7);
        c.save(); c.translate(p + (i % 3) * (pw + gap) + pw / 2, op.y + Math.floor(i / 3) * 64 + 26); c.scale(1 + 0.08 * bump, 1 + 0.08 * bump);
        rr(c, -pw / 2, -26, pw, 52, 26); c.fillStyle = on > 0.5 ? "#ffc93c" : "#f2f2f4"; c.fill();
        txt(c, s, 0, 9, F.ui(23, 700), on > 0.5 ? "#2a1d00" : "#8e8e93", "center"); c.restore();
      });
    } else if (op.k === "check") {
      const at = (N.checkAt ?? 0.9) + op.i * (N.checkGap ?? 0.5), on = win(at, at + 0.25, t), bump = U.pulse(t, at, 8);
      c.save(); c.translate(p + 18, op.y - 12); c.scale(1 + 0.25 * bump, 1 + 0.25 * bump);
      c.beginPath(); c.arc(0, 0, 18, 0, 7);
      if (on > 0) { c.fillStyle = "#e9b330"; c.fill(); U.icon.check(c, 0, 1, 22, "#fff", 3.4, on); }
      else { c.strokeStyle = "#c7c7cc"; c.lineWidth = 2.6; c.stroke(); }
      c.restore();
      txt(c, op.s, p + 54, op.y, F.ui(31, on > 0 ? 600 : 500), "#1d1d1f");
    }
  }
}

// ------------------------------------------------------------- hands --
// A real hand holding a phone. side: bottom | left | right. The screen shows `screen`,
// kept upright: a phone held sideways plays its content in landscape.
function handPhone(c, t, rot, mirror, screen, h = 660) {
  const a = rot * Math.PI / 180;
  c.save();
  c.rotate(a); if (mirror) c.scale(-1, 1);
  c.shadowColor = "rgba(30,40,60,.35)"; c.shadowBlur = 30; c.shadowOffsetX = 8; c.shadowOffsetY = 16;
  K.drawCut(c, "hand_green", h, (c, sw, sh) => {
    c.fillStyle = "#000"; c.fillRect(0, 0, sw, sh);
    c.save(); c.translate(sw / 2, sh / 2);
    if (mirror) c.scale(-1, 1);
    const side = Math.abs(rot) > 45;
    c.rotate(side ? -Math.sign(rot) * Math.PI / 2 : 0);
    const w = side ? sh : sw, hh = side ? sw : sh;
    c.translate(-w / 2, -hh / 2);
    screen(c, w, hh, t);
    c.restore();
  });
  c.restore();
}
// Screen painters. UI cards are drawn at `zoom` x the screen size, then scaled down.
const ui = (kind, p = {}, zoom = 1.8) => (c, w, h, t) => { c.save(); c.scale(1 / zoom, 1 / zoom); CARDS[kind](c, w * zoom, h * zoom, t, p, { D: 5, IMG: K.IMG }); c.restore(); };
const clip = (name, look = "raw", focus = 0.5) => (c, w, h, t) => FOOTAGE.drawFootage(c, name, t, w, h, look, focus);
const reel = (p) => ui("reel", { capSize: 40, ...p }, 1.9);

// An element holding a phone that slides in from its edge.
const HAND = { bottom: [0, "up"], left: [90, "left"], right: [-90, "right"] };
function hand(x, y, side, screen, o = {}) {
  const [rot, inn] = HAND[side];
  return { x, y, in: inn, at: o.at ?? 0.15, far: 0.8, float: 1, rot: 0,
    draw: (c, t) => handPhone(c, t, rot + (o.tilt || 0), !!o.mirror, screen, o.h || 660) };
}
const card = (N) => ({ x: N.x ?? 540, y: N.y ?? 690, in: "none", out: "none", draw: (c, t, lt, S) => notes(c, t, S, N) });

// ----------------------------------------------------------------- slides --
window.CAROUSEL = {
  kit: true,
  title: "The 5-Step Vibe Editing System",
  dur: 5,
  cuts: ["hand_green"],
  bg: sky,
  fg: (c, t) => K.grain(c, t, 0.08),
  slides: [
    // 1 · Hook
    { els: [
      hand(170, 250, "left", ui("editor", { mode: "messy" }, 2.4), { tilt: -8, at: 0.1 }),
      hand(910, 230, "right", clip("editor_team", "raw", 0.5), { tilt: 8, mirror: true, at: 0.2 }),
      hand(250, 1170, "bottom", reel({ scenes: ["influencer_talk"], caps: [["NO", "TIMELINE"], ["GRIND."]], capsAt: 1.0, capEvery: 0.4 }), { tilt: 10, at: 0.3 }),
      hand(830, 1180, "bottom", ui("grade", { scene: "street_vlog", at: 1.2, look: "teal" }, 2.2), { tilt: -12, mirror: true, at: 0.4 }),
      card({ title: "I stopped editing on a timeline.", size: 64, body: "My reels got better. Here's the 5-step Vibe Editing System I use instead. Swipe →", y: 700 }),
    ] },
    // 2 · Problem
    { els: [
      hand(170, 250, "left", ui("clock", {}, 2.0), { tilt: -6 }),
      hand(910, 240, "right", clip("edit_timelapse"), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", ui("tasks", { at: 0.6, gap: 0.4, more: "+12 more" }, 2.0), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", ui("render", {}, 2.0), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "The problem", title: "1 reel = 3 hours.", body: "Cutting. Syncing. Captions. Color. SFX. And it still looks \"meh\"." }),
    ] },
    // 3 · Shift
    { els: [
      hand(170, 250, "left", ui("prompt", { text: "30s reel, high energy, cut on the beat, bold captions, teal & orange", at: 0.6, cps: 34, fs: 22 }, 2.2), { tilt: -6 }),
      hand(910, 240, "right", ui("editor", { mode: "build", at: 2.0, rowGap: 0.25 }, 2.4), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", reel({ scenes: ["dance_girls"], caps: [["JUST", "TYPE"], ["THE", "VIBE."]], capsAt: 1.3, capEvery: 0.4, lookAt: 2.6, look: "teal" }), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", ui("chips", { at: 2.0, gap: 0.3, cols: 1, chipH: 70 }, 2.0), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "The shift", title: "Describe the vibe. AI does the clicks.", size: 58, body: "You type the feel, the edit builds itself, and you stay the director." }),
    ] },
    // 4 · Step 1
    { els: [
      hand(170, 250, "left", ui("thumb", { scene: "street_vlog", label: "IMG_4821.MOV", len: "0:41" }, 1.4), { tilt: -6 }),
      hand(910, 240, "right", ui("thumb", { scene: "latte", label: "IMG_4830.MOV", len: "0:18" }, 1.4), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", ui("media", { at: 0.8, gap: 0.16, cols: 2, n: 8 }, 2.0), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", clip("texting"), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "Step 1 of 5", title: "Dump everything.", body: "Raw clips + one music track. Don't trim. Don't sort. Just drop it all in." }),
    ] },
    // 5 · Step 2
    { dur: 6, els: [
      hand(170, 230, "left", ui("looks", { at: 1.0, pick: 0 }, 2.0), { tilt: -6 }),
      hand(910, 230, "right", reel({ scenes: ["skincare"], lookAt: 4.6, look: "teal", caps: [["END", "ON"], ["THE", "PRODUCT."]], capsAt: 4.4, capEvery: 0.3 }), { tilt: 4, mirror: true, at: 0.22 }),
      hand(540, 1200, "bottom", ui("prompt", { text: "30s Reel · high energy · teal & orange · bold captions · end on the product", at: 2.3, cps: 36, fs: 22, press: 4.5 }, 2.0), { tilt: 0, at: 0.3, h: 700 }),
      card({ kicker: "Step 2 of 5", title: "Type the vibe.", body: "One sentence, five parts:", pills: ["Platform", "Length", "Energy", "Look", "Goal"], pillsAt: 0.7, pillsGap: 0.3, y: 640 }),
    ] },
    // 6 · Step 3
    { els: [
      hand(170, 250, "left", ui("bpm", {}, 1.6), { tilt: -6 }),
      hand(910, 240, "right", ui("wave", { at: 0.9, gap: 0.2, beatPx: 48 }, 2.2), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", reel({ scenes: ["tiktok_dance", "dance_girls", "girl_record"], cutEvery: 0.5, at: 0.5 }), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", reel({ scenes: ["podcast_two", "podcast_face"], cutEvery: 1.0, at: 0.5, look: "film" }), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "Step 3 of 5", title: "Cut to the beat.", body: "Ask for a cut on every beat (hype) or every 2nd beat (chill). Cuts that land on the beat feel pro." }),
    ] },
    // 7 · Step 4
    { els: [
      hand(170, 250, "left", ui("chips", { list: ["Captions", "Motion GFX", "Teal & Orange", "B-roll", "Sound FX", "Transitions"], on: [0, 1, 2], at: 1.0, gap: 0.9 }, 2.2), { tilt: -6 }),
      hand(910, 240, "right", ui("layers", { at: 1.0, gap: 0.9 }, 2.0), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", ui("looks", { at: 2.2, pick: 0 }, 2.0), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", reel({ scenes: ["street_vlog"], caps: [["ONE", "LAYER"], ["AT", "A", "TIME."]], capsAt: 1.0, capEvery: 0.3, title: "VIBE EDITING", titleAt: 1.9, lookAt: 2.9, look: "teal" }), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "Step 4 of 5", title: "Layer it.", body: "Captions → motion titles → one look. Add one layer at a time and check it before the next." }),
    ] },
    // 8 · Step 5
    { els: [
      hand(170, 250, "left", ui("sfx", { at: 0.8, gap: 0.45 }, 2.2), { tilt: -6 }),
      hand(910, 240, "right", ui("sticky", { at: 1.2, gap: 0.7 }, 2.0), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", reel({ scenes: ["vlog_talk"], caps: [["PUNCHIER."]], capsAt: 1.4, title: "VIBE EDITING", titleAt: 2.4, liked: 3.2 }), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", ui("export", { at: 3.2 }, 2.0), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "Step 5 of 5", title: "Sound + director pass.", size: 60, body: "Stamp 3–4 SFX on key cuts. Then give max 3 notes and let it re-cut." }),
    ] },
    // 9 · Recap
    { dur: 5.5, els: [
      hand(170, 210, "left", ui("saved", { at: 3.4, scene: "influencer_talk" }, 2.0), { tilt: -6 }),
      hand(910, 210, "right", ui("prompt", { text: "make it feel like a movie trailer", at: 0.9, fs: 22 }, 2.0), { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1220, "bottom", ui("grade", { scene: "filmmaker", look: "film", name: "FILM 35" }, 2.2), { tilt: 9, at: 0.3 }),
      hand(830, 1230, "bottom", ui("editor", { mode: "build", at: 1.0, rowGap: 0.3 }, 2.4), { tilt: -10, mirror: true, at: 0.4 }),
      card({ title: "Save this for your next edit.", size: 56, checklist: ["Dump everything", "Type the vibe", "Cut to the beat", "Layer it", "Sound + director pass"], checkAt: 0.8, checkGap: 0.45, y: 715 }),
    ] },
    // 10 · CTA
    { els: [
      hand(170, 250, "left", ui("comment", { at: 0.9 }, 2.0), { tilt: -6 }),
      hand(910, 240, "right", (c, w, h) => { c.fillStyle = "#0e0b17"; c.fillRect(0, 0, w, h); const s = Math.min(w / 1000, h / 625); c.drawImage(K.IMG.pack, (w - 1000 * s) / 2, (h - 625 * s) / 2, 1000 * s, 625 * s); }, { tilt: 6, mirror: true, at: 0.22 }),
      hand(250, 1170, "bottom", ui("dm", { at: 1.4 }, 2.0), { tilt: 9, at: 0.3 }),
      hand(830, 1180, "bottom", ui("follow", { press: 2.6 }, 2.0), { tilt: -10, mirror: true, at: 0.4 }),
      card({ kicker: "Free prompt pack", title: "Comment \"VIBE\"", size: 70, body: "and I'll DM you my free Vibe Editing prompt pack. Follow for one vibe edit a day.", y: 690 }),
    ] },
  ],
};
})();
