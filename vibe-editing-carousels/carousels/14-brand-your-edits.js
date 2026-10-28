// Carousel 14: Brand Your Edits.
// Design system: dusty-blue editorial page, a huge thin white sans word crossed by a white
// calligraphy script, small light caps tucked into the corners, a row of editorial cards
// that runs past the edges, and a thin white arrow.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BLUE = "#7d9cc3", WH = "#ffffff";
const THIN = (size, o = {}) => ({ family: "InterD", size, weight: 300, color: WH, track: -size * 0.03, ...o });
const SCRIPT = (size, o = {}) => ({ family: "GreatVibes", size, weight: 400, color: WH, ...o });
const CAPS = (size, o = {}) => ({ family: "InterL", size, weight: 400, color: WH, track: size * 0.06, lh: 1.15, ...o });

function page(c, t) {
  c.fillStyle = BLUE; c.fillRect(0, 0, K.W, K.H);
  const g = c.createRadialGradient(K.W * 0.5, K.H * 0.35, 80, K.W * 0.5, K.H * 0.4, K.H * 0.8);
  g.addColorStop(0, "rgba(255,255,255,.14)"); g.addColorStop(1, "rgba(30,50,80,.18)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
let NOW = 0;
const pg = (c, t) => { NOW = t; page(c, t); };

// ------------------------------------------------------------ components --
function corner(c, lines, align = "left") { lines.forEach((l, i) => K.text(c, l, 0, i * 40, CAPS(34, { align }))); }
function arrow(c, t) {
  c.save(); c.translate(Math.sin(t * 5) * 8, 0);
  c.strokeStyle = WH; c.lineWidth = 2.5; c.lineCap = "round";
  c.beginPath(); c.moveTo(-50, 0); c.lineTo(50, 0); c.moveTo(34, -14); c.lineTo(50, 0); c.lineTo(34, 14); c.stroke(); c.restore();
}
// Editorial card: a cover with a masthead, a picture and small text.
function cover(c, w, h, o) {
  c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
  c.fillStyle = o.paper || "#f7f4ee"; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.translate(-w / 2, -h / 2);
  if (o.full) FOOTAGE.drawFootage(c, o.scene, NOW * 0.25, w, h, o.look);
  else { c.save(); c.beginPath(); c.rect(18, h * 0.24, w - 36, h * 0.56); c.clip(); c.translate(18, h * 0.24); FOOTAGE.drawFootage(c, o.scene, NOW * 0.25, w - 36, h * 0.56, o.look); c.restore(); }
  if (o.mast) K.text(c, o.mast, 18, h * 0.18, { family: o.mastFont || "ArchivoBlack", size: w * 0.17, weight: 400, color: o.mastCol || "#d6302a", track: -w * 0.006 });
  if (o.small) K.text(c, o.small, 18, h * 0.88, CAPS(Math.max(12, w * 0.045), { color: "#333", maxW: w - 36 }));
  c.restore();
}
function grid9(c, s, looks, t, fix = 99) {
  const g = 8, cell = (s - g * 2) / 3;
  for (let i = 0; i < 9; i++) {
    const x = -s / 2 + (i % 3) * (cell + g), y = -s / 2 + Math.floor(i / 3) * (cell + g);
    const look = t > fix + i * 0.08 ? "film" : looks[i % looks.length];
    c.save(); c.beginPath(); c.rect(x, y, cell, cell); c.clip(); c.translate(x, y);
    FOOTAGE.drawFootage(c, ["city", "sunrise", "ocean"][i % 3], i * 0.6 + NOW * 0.2, cell, cell, look);
    c.restore();
    if (t > fix + i * 0.08 && t < fix + i * 0.08 + 0.25) { c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(x, y, cell, cell); }
  }
}
function swatch(c, col, name) {
  c.save(); c.shadowColor = "rgba(20,35,60,.25)"; c.shadowBlur = 16; c.shadowOffsetY = 8;
  c.fillStyle = col; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fill(); c.restore();
  K.text(c, name, 0, 116, CAPS(24, { align: "center" }));
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const coverEl = (x, y, w, h, o, at, inn, rot = 0) => el(x, y, (c) => cover(c, w, h, o), at, inn, { rot, float: 1 });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Brand Your Edits",
  dur: D,
  bg: pg,
  fg: (c, t) => K.grain(c, t, 0.08),
  slides: [
    // 1 · Hook
    {
      els: [
        el(60, 120, (c) => corner(c, ["WHY YOUR FEED"]), 0.05, "fade"),
        el(40, 330, (c) => K.text(c, "Brand", 0, 0, THIN(250)), 0.1, "left"),
        el(560, 330, (c) => K.text(c, "your edits", 0, 0, SCRIPT(170)), 0.35, "fade", { rot: -4 }),
        el(1020, 460, (c) => corner(c, ["DOESN'T", "LOOK"], "right"), 0.5),
        coverEl(185, 760, 330, 440, { scene: "city", look: "vhs", mast: "VHS!", small: "post 1 · vhs, neon" }, 0.5, "left", -1),
        coverEl(540, 760, 330, 440, { scene: "sunrise", look: "noir", mast: "NOIR", mastCol: "#111", small: "post 2 · black & white" }, 0.62, "up"),
        coverEl(895, 760, 330, 440, { scene: "ocean", look: "pastel", mast: "pastel", mastFont: "Playfair", mastCol: "#c94f8c", small: "post 3 · pastel pop" }, 0.74, "right", 1),
        el(60, 1130, (c) => corner(c, ["LIKE ONE", "CREATOR"]), 0.9),
        el(1020, 1130, (c) => corner(c, ["3 RULES", "TO FIX IT"], "right"), 1.0),
        el(960, 1260, (c, t) => arrow(c, t), 1.2, "right"),
      ],
    },
    // 2 · Nine posts, nine creators
    {
      els: [
        el(60, 120, (c) => corner(c, ["THE PROBLEM"]), 0.05),
        el(540, 300, (c) => K.text(c, "Nine posts,", 0, 0, THIN(150, { align: "center" })), 0.1, "down"),
        el(560, 410, (c) => K.text(c, "nine creators.", 0, 0, SCRIPT(140, { align: "center" })), 0.3, "fade", { rot: -3 }),
        el(540, 860, (c, t) => {
          c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = "#f7f4ee"; c.fillRect(-330, -330, 660, 660); c.restore();
          const k = Math.floor(t * 3);
          const pool = ["vhs", "noir", "pastel", "teal", "film", "log", "raw"];
          grid9(c, 620, pool.map((_, i) => pool[(i + k) % pool.length]), t);
        }, 0.4, "up"),
        el(60, 1260, (c) => corner(c, ["EVERY POST A NEW LOOK"]), 0.8),
        el(1020, 1260, (c) => corner(c, ["= NO BRAND"], "right"), 1.0),
      ],
    },
    // 3 · Rule 01: one look
    {
      els: [
        el(60, 120, (c) => corner(c, ["RULE 01"]), 0.05),
        el(1020, 120, (c) => corner(c, ["PICK IT ONCE"], "right"), 0.1),
        el(40, 400, (c) => K.text(c, "Look", 0, 0, THIN(300)), 0.1, "left"),
        el(640, 420, (c) => K.text(c, "just one", 0, 0, SCRIPT(160)), 0.35, "fade", { rot: -5 }),
        coverEl(200, 850, 340, 470, { scene: "city", look: "film", full: true }, 0.5, "left", -3),
        coverEl(540, 830, 340, 470, { scene: "sunrise", look: "film", full: true }, 0.62, "up"),
        coverEl(880, 850, 340, 470, { scene: "ocean", look: "film", full: true }, 0.74, "right", 3),
        el(540, 1180, (c) => K.text(c, "FILM 35 · EVERY POST", 0, 0, CAPS(34, { align: "center" })), 0.9),
        el(1020, 1270, (c) => corner(c, ["USE IT ALWAYS"], "right"), 1.0),
      ],
    },
    // 4 · Rules 02 + 03: one type, three colours
    {
      els: [
        el(60, 120, (c) => corner(c, ["RULE 02 · ONE CAPTION STYLE"]), 0.05),
        el(300, 520, (c, t) => {
          c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12; c.fillStyle = "#f7f4ee"; c.fillRect(-250, -300, 500, 600); c.restore();
          K.text(c, "Aa", -200, -60, { family: "ArchX9", size: 200, weight: 900, color: "#1d2a3d" });
          K.text(c, "ARCHIVO EXPANDED", -200, 20, CAPS(24, { color: "#1d2a3d" }));
          c.save(); c.beginPath(); c.rect(-220, 60, 440, 210); c.clip(); c.translate(-220, 60);
          CARDS.reel(c, 440, 210, t, { look: "film", caps: [["SAME", "STYLE"], ["EVERY", "TIME."]], capsAt: 0.8, capEvery: 0.3, capSize: 34, capY: 0.4 }, { D }); c.restore();
        }, 0.2, "left", { rot: -3, float: 1 }),
        el(820, 330, (c) => K.text(c, "Type", 0, 0, THIN(170, { align: "center" })), 0.3, "right"),
        el(830, 430, (c) => K.text(c, "& captions", 0, 0, SCRIPT(100, { align: "center" })), 0.5, "fade", { rot: -4 }),
        el(60, 960, (c) => corner(c, ["RULE 03 · THREE COLOURS"]), 0.7),
        ...[["#f3e9d2", "CREAM"], ["#ffc93c", "YELLOW"], ["#1d2a3d", "INK"]].map(([col, n], i) => el(250 + i * 290, 1120, (c) => swatch(c, col, n), 0.9 + i * 0.15, "grow")),
      ],
    },
    // 5 · Save it as your brand prompt
    {
      els: [
        el(60, 120, (c) => corner(c, ["MAKE IT STICK"]), 0.05),
        el(540, 290, (c) => K.text(c, "Brand", 0, 0, THIN(190, { align: "center" })), 0.1, "down"),
        el(580, 390, (c) => K.text(c, "prompt", 0, 0, SCRIPT(140, { align: "center" })), 0.3, "fade", { rot: -4 }),
        el(330, 820, (c, t) => {
          c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12; c.fillStyle = "#f7f4ee"; c.fillRect(-260, -300, 520, 600); c.restore();
          K.text(c, "MY BRAND", -220, -240, CAPS(26, { color: "#7d9cc3" }));
          const s = K.typed("Film 35 look, word-pop captions in cream, a whoosh on every cut, end on my logo.", t, 0.8, 30);
          K.text(c, s, -220, -170, { family: "Playfair", size: 50, weight: 500, italic: true, color: "#1d2a3d", maxW: 440, lh: 1.2 });
          K.text(c, "paste it before every edit", -220, 260, CAPS(22, { color: "#555" }));
        }, 0.3, "left", { rot: -2 }),
        el(800, 820, (c, t) => {
          c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12; c.fillStyle = "#f7f4ee"; c.fillRect(-220, -220, 440, 440); c.restore();
          grid9(c, 410, ["vhs", "noir", "pastel", "teal", "log"], t, 3.0);
        }, 0.5, "right", { rot: 3 }),
        el(800, 1100, (c, t) => K.text(c, t > 3.6 ? "ONE CREATOR ✓" : "BEFORE…", 0, 0, CAPS(30, { align: "center" })), 0.8),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(60, 120, (c) => corner(c, ["FREE PROMPT PACK"]), 0.05),
        el(1020, 120, (c) => corner(c, ["WITH MY BRAND", "PROMPT"], "right"), 0.1),
        el(540, 400, (c) => K.text(c, "Comment", 0, 0, THIN(200, { align: "center" })), 0.1, "left"),
        el(560, 640, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SCRIPT(210, { align: "center" })); }, 0.35, "fade", { rot: -5 }),
        coverEl(270, 930, 380, 260, { scene: "sunrise", look: "film", full: true }, 0.6, "left", -3),
        el(760, 930, (c) => { c.save(); c.shadowColor = "rgba(20,35,60,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12; c.drawImage(K.IMG.pack, -200, -125, 400, 250); c.restore(); }, 0.75, "right", { rot: 3, float: 1 }),
        el(60, 1210, (c) => corner(c, ["SAVE THIS", "SHARE IT"]), 0.9),
        el(1020, 1210, (c) => corner(c, ["FOLLOW FOR", "MORE"], "right"), 1.0),
      ],
    },
  ],
};
})();
