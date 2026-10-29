// Carousel 09: 1 Long Video -> 10 Reels.
// Design system: a flat light-grey page, a chunky rounded black headline, a soft
// lowercase subtitle, a lilac pixel cursor, cards fanned along an arc that runs off both
// edges, and a bold wordmark with an asterisk at the bottom.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BG = "#f0f0f2", INK = "#0d0d0d", LILAC = "#d9c4ff";
const HEAD = (size, o = {}) => ({ family: "Lexend", size, weight: 800, color: INK, track: -size * 0.06, ...o });
const SUB = (size, o = {}) => ({ family: "Lexend", size, weight: 400, color: "#1a1a1a", track: -size * 0.02, ...o });

function page(c) { c.fillStyle = BG; c.fillRect(0, 0, K.W, K.H); }
function logo(c) {
  K.text(c, "vibe editing", 0, 0, HEAD(54, { align: "center" }));
  const w = K.measure(c, "vibe editing", HEAD(54));
  K.text(c, "*", w / 2 + 14, -22, HEAD(40));
}
function cursor(c, x, y, click = 0) { c.save(); c.translate(x, y); c.scale(1 - 0.12 * click, 1 - 0.12 * click); K.pixelCursor(c, 0, 0, 5, LILAC, "#2a2140"); c.restore(); }
function card(c, w, h, paint, r = 24) {
  c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 28; c.shadowOffsetY = 14;
  rr(c, -w / 2, -h / 2, w, h, r); c.fillStyle = "#fff"; c.fill(); c.restore();
  c.save(); rr(c, -w / 2, -h / 2, w, h, r); c.clip(); c.translate(-w / 2, -h / 2); paint(c, w, h); c.restore();
}
const CAPS = [["HOOK", "#1"], ["THE", "TIP"], ["WAIT", "WHAT"], ["MY", "SECRET"], ["DON'T", "DO", "THIS"], ["3", "RULES"], ["THE", "TWIST"], ["SAVE", "THIS"], ["REAL", "TALK"], ["PART", "10"]];
const SCN = ["podcast_women", "podcast_two", "podcast_face", "podcast_women"], LK = ["raw", "raw", "film", "raw", "raw"];
const FOC = [0.5, 0.3, 0.7, 0.45, 0.6];
const reelFace = (i, t, at = 0.6) => (c, w, h) => CARDS.reel(c, w, h, t, { scenes: [SCN[i % 4]], look: LK[i % 5], focus: FOC[i % 5], caps: [CAPS[i % 10].slice(0, 2), CAPS[i % 10].slice(2)].filter((x) => x.length), capsAt: at + (i % 4) * 0.15, capEvery: 0.3, capSize: 24 }, { D: 5 });
// Cards fanned along an arc centred below the frame; `shift` slides them along the arc.
function fan(c, t, n, o) {
  const R = o.R || 1500, step = o.step || 0.2, shift = o.shift || 0;
  for (let i = 0; i < n; i++) {
    const a = (i - (n - 1) / 2) * step + shift;
    if (Math.abs(a) > 0.75) continue;
    const at = (o.at ?? 0.2) + i * (o.gap ?? 0.06), e = outBack(win(at, at + 0.5, t), 1.8);
    if (t < at) continue;
    c.save(); c.translate(o.x + Math.sin(a) * R, o.y + R - Math.cos(a) * R + (1 - e) * 300); c.rotate(a);
    card(c, o.w || 260, o.h || 440, o.face(i, t));
    c.restore();
  }
}
function pill(c, s) {
  const w = K.measure(c, s, SUB(30)) + 50;
  rr(c, -w / 2, -28, w, 56, 28); c.fillStyle = LILAC; c.fill();
  K.text(c, s, 0, 10, SUB(30, { align: "center", weight: 400 }));
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const mov = (x0, y0, x1, y1, a, b, t) => { const u = inOut(win(a, b, t)); return [lerp(x0, x1, u), lerp(y0, y1, u)]; };

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "1 Long Video to 10 Reels",
  dur: D,
  bg: page,
  fg: (c, t) => K.grain(c, t, 0.04),
  slides: [
    // 1 · Hook
    {
      els: [
        el(540, 250, (c) => K.text(c, "1 video", 0, 0, HEAD(170, { align: "center" })), 0.05, "down"),
        el(540, 410, (c) => K.text(c, "10 reels", 0, 0, HEAD(170, { align: "center" })), 0.2, "down"),
        el(0, 0, (c, t) => { const [x, y] = mov(1000, 600, 905, 330, 0.8, 1.6, t); cursor(c, x, y, pulse(t, 1.7, 8)); }, 0, "none"),
        el(540, 520, (c) => { K.text(c, "stop filming more. vibe-edit", 0, 0, SUB(44, { align: "center" })); K.text(c, "what you already have <3", 0, 54, SUB(44, { align: "center" })); }, 0.4),
        el(0, 0, (c, t) => fan(c, t, 10, { x: 540, y: 930, face: (i, t) => reelFace(i, t), shift: 0.06 * Math.sin((2 * Math.PI * t) / D), at: 0.5 }), 0, "none"),
        el(540, 1290, (c) => logo(c), 0.6, "up"),
      ],
    },
    // 2 · Drop the long one
    {
      els: [
        el(540, 170, (c) => pill(c, "step 1"), 0.05, "pop"),
        el(540, 330, (c) => K.text(c, "drop the", 0, 0, HEAD(140, { align: "center" })), 0.1, "down"),
        el(540, 470, (c) => K.text(c, "long one.", 0, 0, HEAD(140, { align: "center" })), 0.2, "down"),
        el(540, 790, (c, t) => card(c, 900, 500, (c, w, h) => {
          FOOTAGE.drawFootage(c, "podcast_two", t, w, h, "raw", 0.5);
          c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(0, h - 70, w, 70);
          const u = clamp((t - 1.2) / 3.5);
          c.fillStyle = "rgba(255,255,255,.35)"; rr(c, 30, h - 42, w - 200, 10, 5); c.fill();
          c.fillStyle = LILAC; rr(c, 30, h - 42, (w - 200) * u, 10, 5); c.fill();
          const mm = Math.floor(u * 18.7), ss = Math.floor((u * 18.7 * 60) % 60);
          K.text(c, `${mm}:${String(ss).padStart(2, "0")} / 18:42`, w - 30, h - 28, SUB(26, { color: "#fff", align: "right" }));
          K.text(c, "podcast_ep12.mp4", 30, 50, SUB(28, { color: "#fff" }));
        }), 0.3, "up"),
        el(0, 0, (c, t) => {
          if (t > 1.3) return;
          const [x, y] = mov(980, 1250, 600, 760, 0.4, 1.2, t);
          c.save(); c.translate(x, y); card(c, 150, 100, (c, w, h) => FOOTAGE.drawFootage(c, "podcast_two", 0, w, h, "raw", 0.5), 12); c.restore();
          cursor(c, x + 40, y + 30);
        }, 0, "none"),
        el(540, 1150, (c) => { K.text(c, "a podcast, a vlog, a live,", 0, 0, SUB(42, { align: "center" })); K.text(c, "anything over 10 minutes.", 0, 54, SUB(42, { align: "center" })); }, 0.6),
        el(540, 1290, (c) => logo(c), 0.7, "up"),
      ],
    },
    // 3 · Ask for the moments
    {
      els: [
        el(540, 170, (c) => pill(c, "step 2"), 0.05, "pop"),
        el(540, 330, (c) => K.text(c, "ask for the", 0, 0, HEAD(130, { align: "center" })), 0.1, "down"),
        el(540, 460, (c) => K.text(c, "moments.", 0, 0, HEAD(130, { align: "center" })), 0.2, "down"),
        el(540, 680, (c, t) => card(c, 920, 230, (c, w, h) => {
          K.text(c, "the prompt", 36, 52, SUB(26, { color: "#8a7bb5" }));
          const s = K.typed("find the 10 best moments, 20–40s each, each one opens on a strong line", t, 0.6, 38);
          K.text(c, s, 36, 104, HEAD(38, { maxW: w - 72, lh: 1.22, track: -1.2 }));
        }), 0.3, "up"),
        el(540, 960, (c, t) => {
          const w = 920;
          card(c, w, 120, (c, ww, hh) => {
            for (let i = 0; i < 180; i++) { const a = 10 + 26 * Math.abs(Math.sin(i * 0.47) * Math.cos(i * 0.13)); c.fillStyle = "#cfcfd6"; c.fillRect(20 + i * 4.9, hh / 2 - a / 2, 3, a); }
            for (let k = 0; k < 10; k++) {
              const at = 2.5 + k * 0.12, e = outBack(win(at, at + 0.3, t), 2);
              if (t < at) continue;
              const x = 30 + [0.02, 0.1, 0.21, 0.3, 0.41, 0.5, 0.6, 0.69, 0.8, 0.9][k] * (ww - 60), sw = 60;
              c.save(); c.translate(x + sw / 2, hh / 2); c.scale(1, e);
              rr(c, -sw / 2, -42, sw, 84, 10); c.fillStyle = "rgba(167,128,255,.55)"; c.fill();
              c.restore();
              K.text(c, String(k + 1), x + sw / 2, 26, SUB(18, { align: "center", color: "#5b3fae" }));
            }
          });
        }, 0.4, "up"),
        el(540, 1130, (c, t) => K.text(c, t > 3.8 ? "10 moments found ✓" : "scanning 18:42…", 0, 0, SUB(40, { align: "center" })), 0.6),
        el(540, 1290, (c) => logo(c), 0.7, "up"),
      ],
    },
    // 4 · One look, ten reels
    {
      els: [
        el(540, 170, (c) => pill(c, "step 3"), 0.05, "pop"),
        el(540, 330, (c) => K.text(c, "one look,", 0, 0, HEAD(140, { align: "center" })), 0.1, "down"),
        el(540, 470, (c) => K.text(c, "ten reels.", 0, 0, HEAD(140, { align: "center" })), 0.2, "down"),
        el(0, 0, (c, t) => fan(c, t, 10, { x: 540, y: 840, w: 240, h: 410, step: 0.19, at: 0.6, gap: 0.18, face: (i, t) => (c, w, h) => CARDS.reel(c, w, h, t, { scenes: [SCN[i % 4]], focus: FOC[i % 5], look: "raw", caps: [["PART"], [String(i + 1)]], capsAt: 0.8 + i * 0.18, capEvery: 0.05, capSize: 30 }, { D }) }), 0, "none"),
        el(540, 1160, (c, t) => { const n = clamp(Math.floor((t - 0.6) / 0.18) + 1, 0, 10); K.text(c, `${n}/10`, 0, 0, HEAD(80, { align: "center" })); }, 0.5),
        el(540, 1230, (c) => K.text(c, "same captions, same look, same end card", 0, 0, SUB(34, { align: "center" })), 0.8),
        el(540, 1305, (c) => logo(c), 0.7, "up"),
      ],
    },
    // 5 · Ten days sorted
    {
      els: [
        el(540, 170, (c) => pill(c, "step 4"), 0.05, "pop"),
        el(540, 330, (c) => K.text(c, "10 days", 0, 0, HEAD(150, { align: "center" })), 0.1, "down"),
        el(540, 480, (c) => K.text(c, "sorted.", 0, 0, HEAD(150, { align: "center" })), 0.2, "down"),
        el(540, 830, (c, t) => card(c, 960, 520, (c, w, h) => {
          const days = ["mon", "tue", "wed", "thu", "fri"];
          for (let r = 0; r < 2; r++) for (let d = 0; d < 5; d++) {
            const i = r * 5 + d, x = 24 + d * ((w - 48) / 5), y = 24 + r * 248, cw = (w - 48) / 5 - 14;
            c.fillStyle = "#f4f4f7"; rr(c, x, y, cw, 230, 14); c.fill();
            K.text(c, `${days[d]} ${r + 1 ? d + 1 + r * 7 : ""}`, x + 14, y + 34, SUB(22, { color: "#777" }));
            const at = 0.6 + i * 0.2, e = outBack(win(at, at + 0.35, t), 2);
            if (t < at) continue;
            c.save(); c.translate(x + cw / 2, y + 138 - (1 - e) * 120); c.globalAlpha = clamp(e * 2);
            card(c, cw - 30, 160, reelFace(i, t, 0), 12); c.restore();
          }
        }), 0.3, "up"),
        el(540, 1170, (c) => K.text(c, "post one a day. film once.", 0, 0, SUB(44, { align: "center" })), 0.8),
        el(540, 1290, (c) => logo(c), 0.7, "up"),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(540, 250, (c) => K.text(c, "comment", 0, 0, HEAD(170, { align: "center" })), 0.05, "down"),
        el(540, 420, (c, t) => { const e = 1 + 0.04 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, HEAD(190, { align: "center", color: "#7b55e0" })); }, 0.2, "down"),
        el(540, 520, (c) => { K.text(c, "and I'll send you the free", 0, 0, SUB(44, { align: "center" })); K.text(c, "prompt pack <3", 0, 54, SUB(44, { align: "center" })); }, 0.4),
        el(0, 0, (c, t) => fan(c, t, 9, { x: 540, y: 960, w: 250, h: 400, face: (i, t) => i === 4 ? (c, w, h) => { c.fillStyle = "#0e0b17"; c.fillRect(0, 0, w, h); c.drawImage(K.IMG.pack, -w * 0.3, h * 0.3, w * 1.6, w); K.text(c, "FREE", w / 2, h * 0.2, HEAD(56, { color: "#ffc93c", align: "center" })); } : reelFace(i, t), shift: 0.05 * Math.sin((2 * Math.PI * t) / D), at: 0.4 }), 0, "none"),
        el(540, 1150, (c, t) => {
          const done = t > 2.6, b = pulse(t, 2.6, 9);
          c.scale(1 - 0.06 * b, 1 - 0.06 * b);
          rr(c, -170, -42, 340, 84, 42); c.fillStyle = done ? "#e6e6ea" : INK; c.fill();
          K.text(c, done ? "following ✓" : "follow", 0, 12, SUB(36, { align: "center", color: done ? INK : "#fff" }));
        }, 0.8, "pop"),
        el(0, 0, (c, t) => { const [x, y] = mov(960, 1300, 560, 1150, 1.6, 2.5, t); cursor(c, x, y, pulse(t, 2.6, 8)); }, 0, "none"),
        el(540, 1300, (c) => logo(c), 0.6, "up"),
      ],
    },
  ],
};
})();
