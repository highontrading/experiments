// ------------------------------------------------------------ captions (16:9) --
// plain white Inter, no outline, no shadow, word-by-word
const CAPMAP = { "thirty-one": "31", "eighty-five": "85", "seventy": "70", "twenty-nine": "29", "fifteen": "15" };
const CAPS = (() => {
  const words = TL.w.map((w, i) => { const core = w.w.replace(/[.,:]$/, ""), tail = w.w.slice(core.length); return { ...w, i, d: CAPMAP[core] ? CAPMAP[core] + tail : w.w }; });
  const chunks = []; let cur = [];
  for (const w of words) {
    if (w.i >= 205) break;
    cur.push(w);
    const len = cur.map((x) => x.d).join(" ").length;
    if (/[.:]$/.test(w.w) || (/,$/.test(w.w) && len > 22) || len > 44 || cur.length >= 9) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  return chunks.map((ch, k) => ({ words: ch, t0: ch[0].s - 0.06, t1: k + 1 < chunks.length ? Math.min(chunks[k + 1][0].s - 0.06, ch[ch.length - 1].e + 0.6) : ch[ch.length - 1].e + 0.5 }));
})();
function captions(c, t) {
  const ch = CAPS.find((k) => t >= k.t0 && t < k.t1); if (!ch) return;
  const fs = 54; c.save(); c.font = `700 ${fs}px Inter`; c.textBaseline = "middle"; c.letterSpacing = "-0.4px";
  const sp = c.measureText(" ").width, lines = [[]]; let lw = 0;
  for (const w of ch.words) { const ww = c.measureText(w.d).width; if (lw + ww > 1500 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp; }
  const y0 = 992 - ((lines.length - 1) * fs * 1.2) / 2;
  lines.forEach((ln, li) => {
    const tw = ln.reduce((n, w) => n + w.ww, 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2; const y = y0 + li * fs * 1.2;
    for (const w of ln) {
      const k = win(t, w.s - 0.08, w.s + 0.08);
      if (k > 0) { c.save(); c.globalAlpha = clamp(k * 1.5); c.translate(x + w.ww / 2, y + (1 - oc(k)) * 10); c.fillStyle = WHITE; c.textAlign = "center"; c.fillText(w.d, 0, 0); c.restore(); }
      x += w.ww + sp;
    }
  });
  c.restore();
}

// ----------------------------------------------------------------- scenes --
const SH = TL.shots;
const w = (i, S) => WS(i) - S.t0;
const F = (k) => FR[k];
const scenes = {};
// full-screen footage with a slow push, caption-safe bottom shade, optional theme frame
function full(c, key, lt, S, o = {}) {
  const dur = S.t1 - S.t0, k = clamp(lt / dur);
  cover(c, F(key), 0, 0, W, H, (o.z0 ?? 1.03) + (o.dz ?? 0.05) * k, lerp(o.px0 ?? 0.5, o.px1 ?? 0.5, k), lerp(o.py0 ?? 0.5, o.py1 ?? 0.5, k));
  const g = c.createLinearGradient(0, H - 340, 0, H); g.addColorStop(0, "rgba(6,10,48,0)"); g.addColorStop(1, "rgba(6,10,48,0.6)"); c.fillStyle = g; c.fillRect(0, H - 340, W, 340);
  if (o.top) { const g2 = c.createLinearGradient(0, 0, 0, 320); g2.addColorStop(0, "rgba(6,10,48,0.55)"); g2.addColorStop(1, "rgba(6,10,48,0)"); c.fillStyle = g2; c.fillRect(0, 0, W, 320); }
  if (o.left) { const g3 = c.createLinearGradient(0, 0, 900, 0); g3.addColorStop(0, "rgba(6,10,48,0.6)"); g3.addColorStop(1, "rgba(6,10,48,0)"); c.fillStyle = g3; c.fillRect(0, 0, 900, H); }
  if (o.frame !== false) { const p = oc(win(lt, 0.05, 0.6)); drect(c, 38, 38, W - 76, H - 76, p * 0.75, { w: 2, dash: [14, 12] }); }
}
const enter = (lt, at, d = 0.32) => win(lt, at - 0.08, at + d);

// 1. old playbook: Beijing at night
scenes.old_full = { uses: ["beijing"], draw(c, lt, S) {
  full(c, "beijing", lt, S, { top: true, z0: 1.08, dz: 0.06 });
  kicker(c, "The old playbook", lt, 0.25, { x: 90, y: 165, size: 92 });
  txt(c, "since the 1960s", 96, 230, { font: "44px Hand", color: YEL, p: win(lt, 0.8, 1.5), rot: -2 });
  sparkle(c, 1760, 200, 80 * popS(lt, 0.5), 0.2, 3);
}};
// 2. loans / railways / megaprojects polaroids, then crossed out
const OLD_P = [["loans", 420, 520, -6, 8, "loans"], ["rail", 960, 500, 3, 9, "railways"], ["mega", 1500, 530, -4, 11, "megaprojects"]];
function oldCollage(c, lt, S, crossing) {
  bg(c); guides(c, lt, { vx: 1300, hy: 820, circ: [1760, 140, 90], sq: false });
  const S0 = SH.old_collage;
  const t = lt + (S.t0 - S0.t0);           // time since the collage first appeared
  kicker(c, "The old playbook", t, 0.05, { x: 90, y: 140, size: 76 });
  txt(c, "visible. loan-financed.", 96, 200, { font: "42px Hand", color: YEL, p: win(t, 0.3, 1.0) });
  if (crossing) { underline(c, 225, 112, 105, win(lt, w(23, S), w(23, S) + 0.25), { color: YEL, w: 7 }); }
  sparkle(c, 120, 700, 110 * popS(t, 0.2), 0.2, 21);
  spiky(c, 1820, 760, 80 * popS(t, WS(11) - S0.t0 + 0.2), 0.1, 22);
  const fallAt = crossing ? S.t1 - S.t0 - 0.45 : 99;
  OLD_P.forEach(([k, x, y, r, wi, cap], i) => {
    const at = WS(wi) - S0.t0; const e = win(t, at - 0.08, at + 0.3); if (e <= 0) return;
    const fk = ein(win(lt, fallAt + i * 0.05, fallAt + 0.35 + i * 0.05));
    polaroid(c, F(k), x, y - (1 - oc(e)) * 60 + fk * 1200, 470, 310, r + (1 - oc(e)) * 12 + fk * 20, { s: lerp(1.35, 1, ob(e, 1.4)), a: clamp(e * 3), cap, zoom: 1.06 + 0.04 * win(t, at, at + 8) });
    if (crossing) scribbleX(c, x, y - 20 + fk * 1200, 380, 260, win(lt, w(19 + i, S), w(19 + i, S) + 0.4), { color: WHITE, w: 10 });
  });
  if (crossing) {
    const fk = ein(win(lt, fallAt, fallAt + 0.4)) * 1200;
    inkStamp(c, "BACKLASH", 960, 300 + fk, { s: slam(lt, w(21, S) + 0.1), rot: -7, size: 92 });
    stamp(c, "COST TO BEIJING, TOO", 960, 770 + fk, { s: slam(lt, w(23, S)), rot: 2, size: 58, fill: YEL, color: BLUE_D });
  }
}
scenes.old_collage = { uses: ["loans", "rail", "mega"], draw(c, lt, S) { oldCollage(c, lt, S, false); } };
scenes.debt_full = { uses: ["burn"], draw(c, lt, S) {
  full(c, "burn", lt, S, { z0: 1.04, dz: 0.08 });
  inkStamp(c, "DEBT", 620, 420, { s: slam(lt, w(18, S)), rot: -9, size: 170 });
  txt(c, "host countries left in debt", 100, 170, { font: "60px Hand", color: YEL, p: win(lt, w(14, S), w(18, S) + 0.3), rot: -2 });
}};
scenes.backlash = { uses: ["loans", "rail", "mega"], draw(c, lt, S) { oldCollage(c, lt, S, true); } };
scenes.chess_full = { uses: ["chess"], draw(c, lt, S) {
  full(c, "chess", lt, S, { top: true, z0: 1.05, dz: 0.05 });
  txt(c, "the playbook changed", 100, 170, { font: "70px Hand", color: YEL, p: win(lt, 0.1, w(29, S) + 0.2), rot: -2 });
  underline(c, 100, 200, 560, win(lt, w(29, S), w(29, S) + 0.35), { color: YEL, w: 7 });
  sparkle(c, 1760, 180, 70 * popS(lt, w(29, S)), 0.2, 31);
}};

// 3. title
scenes.title = { uses: [], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1380, hy: 860, circ: [200, 180, 110], sq: [1650, 610, 130] });
  const [sx, sy] = shake(lt, w(34, S), 16); c.save(); c.translate(sx, sy);
  sparkle(c, 290, 330, 190 * popS(lt, 0.05, 0.5), 0.1, 41);
  sparkle(c, 1790, 760, 110 * popS(lt, w(34, S)), -0.25, 42);
  const pk = win(lt, 0, 0.4);
  polaroid(c, null, 800, 455, 900, 560, -2, { s: lerp(1.25, 1, ob(pk, 1.3)), a: clamp(pk * 3), m: 30, mb: 110, cap: "special report no. 321", capSize: 62, capP: win(lt, 0.4, 1.2), draw: (c, x, y, ww, hh) => {
    c.fillStyle = RED; c.fillRect(x, y, ww, hh);
    c.fillStyle = WHITE; c.textBaseline = "alphabetic"; c.font = "120px Anton"; c.letterSpacing = "2px";
    const words = ["THE", "LEVER", "IS"]; const tw = words.map((q) => c.measureText(q).width); const total = tw.reduce((a, b) => a + b, 0) + 2 * 30; let xx = x + ww / 2 - total / 2;
    words.forEach((q, i) => { const wi = [30, 32, 33][i]; const k = win(lt, w(wi, S) - 0.05, w(wi, S) + 0.25); c.save(); c.globalAlpha = clamp(k * 2); c.textAlign = "left"; c.fillText(q, xx, y + 150 + (1 - oc(k)) * 50); c.restore(); xx += tw[i] + 30; });
    const kk = win(lt, w(34, S) - 0.03, w(34, S) + 0.3);
    if (kk > 0) { c.save(); c.translate(x + ww / 2, y + 480); const s = lerp(2.1, 1, ob(kk, 1.1)); c.font = "330px Anton"; c.letterSpacing = "-3px"; const fitk = Math.min(1, (ww - 60) / c.measureText("PRICE").width); c.scale(s * fitk, s); c.globalAlpha = clamp(kk * 3); c.textAlign = "center"; c.fillText("PRICE", 0, 0); c.restore(); }
  }});
  const carK = win(lt, 0.15, 0.8);
  cutout(c, IMG.car, lerp(2300, 1430, oc(carK)), 610 + Math.sin(lt * 9) * 1.2, 700, -2 * (1 - oc(carK)));
  txt(c, "China's new\nleverage play", 1420, 190, { font: "74px Serif", lh: 78, a: oc(win(lt, 0.2, 0.7)) });
  txt(c, "not loans.", 1460, 360, { font: "56px Hand", color: YEL, rot: -5, p: win(lt, w(34, S) + 0.3, w(34, S) + 0.8) });
  c.restore();
}};

// 4. how the new model works
scenes.ship_full = { uses: ["shipin"], draw(c, lt, S) {
  full(c, "shipin", lt, S, { z0: 1.04, dz: 0.06, px0: 0.45, px1: 0.55 });
  stamp(c, "STATE-BACKED", 420, 190, { s: slam(lt, w(35, S)), rot: -3, size: 70, fill: YEL, color: BLUE_D });
  arrow(c, 560, 250, 820, 300, 960, 430, win(lt, w(36, S), w(37, S) + 0.3), { color: WHITE, w: 6 });
  const tk = win(lt, w(40, S) - 0.05, w(40, S) + 0.6);
  priceTag(c, 1500, 330, ob(tk, 1.5) * 1.0, -8 + Math.sin(lt * 5) * 4 * (1 - win(lt, w(40, S), w(40, S) + 2)), "CHEAP", "cheaper goods");
}};
scenes.port_full = { uses: ["cranes"], draw(c, lt, S) {
  full(c, "cranes", lt, S, { z0: 1.1, dz: -0.05 });
  stamp(c, "SUBSIDIES", 520, 300, { s: slam(lt, w(44, S)), rot: -4, size: 96, fill: YEL, color: BLUE_D });
  stamp(c, "OVERCAPACITY", 1300, 560, { s: slam(lt, w(46, S)), rot: 3, size: 96, fill: YEL, color: BLUE_D });
  sparkle(c, 1760, 170, 70 * popS(lt, w(44, S)), 0.1, 51);
}};
scenes.share_gfx = { uses: [], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1000, hy: 830, circ: false, sq: [1660, 60, 130] });
  kicker(c, "Then they stay.", lt, 0.05, { x: 90, y: 150, size: 84 });
  // market share pie
  const cx = 500, cy = 500, r = 250; const pk = popS(lt, w(48, S) - 0.1);
  if (pk > 0.01) {
    c.save(); c.translate(cx, cy); c.scale(pk, pk); shadow(c, 24, 10, 0.3); c.fillStyle = PAPER; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); noShadow(c);
    const f = oc(win(lt, w(49, S), w(51, S) + 0.4)) * 0.62; c.fillStyle = YEL; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r - 22, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); c.closePath(); c.fill();
    c.strokeStyle = BLUE_D; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r - 22, 0, 7); c.stroke(); c.restore();
    stamp(c, "MARKET SHARE", cx, cy + r + 70, { s: slam(lt, w(49, S)), size: 54 });
  }
  // host economy: dashed box the ship docks into
  const bx = 1150, by = 260, bw = 620, bh = 420;
  drect(c, bx, by, bw, bh, oc(win(lt, w(52, S) - 0.6, w(52, S))), { w: 3, dash: [16, 12] });
  txt(c, "HOST ECONOMY", bx + bw / 2, by - 22, { font: "52px Anton", align: "center", a: oc(win(lt, w(52, S) - 0.4, w(52, S))) });
  const sk = oc(win(lt, w(51, S), w(55, S)));
  cutout(c, IMG.ship, lerp(2250, bx + bw / 2, sk), by + bh / 2 + 10, 440, -4);
  inkStamp(c, "EMBEDDED", bx + bw / 2, by + bh - 40, { s: slam(lt, w(56, S)), rot: -8, size: 92, color: YEL });
}};

// 5. why thailand
scenes.bkk_full = { uses: ["bkk"], draw(c, lt, S) {
  full(c, "bkk", lt, S, { z0: 1.03, dz: 0.06 });
  const k = win(lt, w(64, S) - 0.05, w(64, S) + 0.35);
  if (k > 0) { c.save(); c.translate(W / 2, 470); const s = lerp(1.6, 1, ob(k, 1.2)); c.scale(s, s); c.globalAlpha = clamp(k * 3); c.font = "250px Anton"; c.letterSpacing = "10px"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = YEL; shadow(c, 40, 10, 0.35); c.fillText("THAILAND", 0, 0); c.restore(); }
  txt(c, "nowhere is it clearer", W / 2, 260, { font: "54px Hand", align: "center", p: win(lt, 0.1, w(61, S) + 0.3) });
}};
const MAP2 = { x: 940, y: 70, lon0: 91.5, lat0: 26, k: 29.5 };
scenes.map = { uses: ["robot", "chinatown"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 900, hy: 880, circ: false, sq: false });
  kicker(c, "Why Thailand?", lt, 0.05, { x: 90, y: 160, size: 96 });
  const m = MAP2, [tcx, tcy] = proj(101, 14.5, m), rev = oc(win(lt, 0, 0.9));
  c.save(); c.beginPath(); c.rect(900, 0, W - 900, H); c.clip(); c.beginPath(); c.arc(tcx, tcy, 60 + rev * 1300, 0, 7); c.clip();
  c.beginPath(); for (const g of GEO) { if (g.n === "Thailand") continue; countryPath(c, g.n, m); }
  c.fillStyle = "rgba(255,255,255,0.10)"; c.fill("evenodd"); c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 2; c.lineJoin = "round"; c.stroke();
  c.beginPath(); countryPath(c, "Thailand", m); shadow(c, 20, 8, 0.3); c.fillStyle = YEL; c.fill(); noShadow(c);
  c.restore();
  const lab = (s, lon, lat, at, o = {}) => { const [x, y] = proj(lon, lat, m); txt(c, s, x, y, { font: `${o.size ?? 36}px Hand`, align: "center", a: oc(win(lt, at, at + 0.4)) * (o.a ?? 0.85), rot: o.rot }); };
  lab("CHINA", 108, 23.5, 0.4, { size: 48, a: 1 }); lab("MYANMAR", 96, 21, 0.5); lab("VIETNAM", 107.3, 15.5, 0.55, { rot: 60 }); lab("MALAYSIA", 113.5, 3.4, 0.6); lab("INDONESIA", 104, -1.2, 0.6);
  stamp(c, "THAILAND", tcx - 150, tcy - 150, { s: popS(lt, 0.4), rot: -4, size: 44, fill: RED, color: WHITE });
  // lane through Malacca
  const lane = [[90, 5.5], [95, 6], [98.5, 4.8], [100.6, 2.9], [103.3, 1.25], [104.6, 1.6], [106.5, 5], [110, 10.5], [114, 16.5], [118, 21.5], [121, 25]].map(([lo, la]) => proj(lo, la, m));
  const lp = win(lt, w(66, S) - 0.1, w(70, S) + 0.4);
  if (lp > 0) { const n = lane.length - 1, upto = oc(lp) * n; dashed(c, (c) => { for (let i = 0; i <= Math.ceil(upto) && i <= n; i++) { let [x, y] = lane[i]; if (i > upto) { const [x0, y0] = lane[i - 1]; const k = upto - (i - 1); x = lerp(x0, x, k); y = lerp(y0, y, k); } i ? c.lineTo(x, y) : c.moveTo(x, y); } }, { w: 4, dash: [16, 12], off: -lt * 40 }); }
  const [mx, my] = proj(100.9, 2.9, m);
  scribbleEllipse(c, mx, my, 80, 52, win(lt, w(69, S), w(69, S) + 0.5), { color: YEL, w: 6 });
  txt(c, "MALACCA STRAIT", mx - 100, my + 95, { font: "40px Anton", color: YEL, align: "center", a: oc(win(lt, w(69, S) + 0.2, w(69, S) + 0.6)) });
  // numbered reasons on the left
  const R = [["1", "A way around the\nMalacca chokepoint", 66], ["2", "A strong\nmanufacturing base", 71], ["3", "The largest overseas\nChinese community", 75]];
  R.forEach(([n, s, wi], i) => {
    const k = win(lt, w(wi, S) - 0.1, w(wi, S) + 0.35); if (k <= 0) return; const y = 320 + i * 190;
    c.save(); c.globalAlpha = clamp(k * 2); c.translate((1 - oc(k)) * -40, 0);
    dcircle(c, 140, y + 8, 52, 1, 0, { w: 2.5, color: YEL }); txt(c, n, 140, y + 36, { font: "76px Anton", color: YEL, align: "center" });
    txt(c, s, 225, y - 6, { font: "600 44px Inter", lh: 54 }); c.restore();
  });
  const p1 = enter(lt, w(73, S));
  if (p1 > 0) polaroid(c, F("robot"), 1690, 330, 300, 200, 6, { s: lerp(1.35, 1, ob(p1)), a: clamp(p1 * 3), cap: "built here" });
  const p2 = enter(lt, w(78, S));
  if (p2 > 0) polaroid(c, F("chinatown"), 1690, 690, 300, 200, -5, { s: lerp(1.35, 1, ob(p2)), a: clamp(p2 * 3), cap: "~15% claim Chinese roots" , capSize: 34});
}};

// 6. follow the money (split)
scenes.money_split = { uses: ["skyline"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1820, hy: 860, circ: false, sq: false });
  // footage panel, left, torn right edge
  const pw = 860, R = rng(61); const edge = []; for (let y = -20; y <= H + 20; y += 20) edge.push([pw + (R() - 0.5) * 18, y]);
  const e = oc(win(lt, 0, 0.45));
  c.save(); c.translate(-(1 - e) * 900, 0);
  c.save(); shadow(c, 30, 0, 0.4); c.shadowOffsetX = 8; c.fillStyle = PAPER; c.beginPath(); c.moveTo(0, -20); edge.forEach(([x, y]) => c.lineTo(x + 14, y)); c.lineTo(0, H + 20); c.closePath(); c.fill(); c.restore();
  c.save(); c.beginPath(); c.moveTo(0, -20); edge.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(0, H + 20); c.closePath(); c.clip(); cover(c, F("skyline"), 0, 0, pw + 20, H, 1.06 + lt * 0.006);
  const g = c.createLinearGradient(0, H - 340, 0, H); g.addColorStop(0, "rgba(6,10,48,0)"); g.addColorStop(1, "rgba(6,10,48,0.6)"); c.fillStyle = g; c.fillRect(0, H - 340, pw + 20, 340); c.restore();
  inkStamp(c, "US$13.4 BN", 430, 640, { s: slam(lt, w(94, S)), rot: -7, size: 92, color: YEL });
  txt(c, "Thailand, 2025", 70, 120, { font: "60px Hand", color: WHITE, p: win(lt, w(82, S), w(82, S) + 0.6) });
  c.restore();
  stamp(c, "CHINA + HONG KONG", 1370, 130, { s: slam(lt, w(83, S)), rot: -2, size: 54 });
  const dk = win(lt, w(89, S) - 0.1, w(89, S) + 1.0), cx = 1370, cy = 470;
  c.save(); const ds = lerp(0.6, 1, ob(win(lt, 0.2, 0.7))); c.translate(cx, cy); c.scale(ds, ds); c.translate(-cx, -cy);
  donut(c, cx, cy, 255, 72, oc(dk) * 0.31);
  txt(c, `${Math.round(oc(dk) * 31)}%`, cx, cy + 62, { font: "180px Anton", color: YEL, align: "center", a: clamp(win(lt, w(89, S) - 0.2, w(89, S)) * 2) });
  c.restore();
  txt(c, "of all foreign investment applications", cx, 820, { font: "46px Hand", align: "center", p: win(lt, w(91, S), w(95, S) + 0.3) });
  sparkle(c, 1800, 330, 70 * popS(lt, w(89, S) + 0.5), 0.2, 62);
}};

// 7. cars
scenes.cars_full = { uses: ["traffic"], draw(c, lt, S) {
  full(c, "traffic", lt, S, { top: true, z0: 1.04, dz: 0.05 });
  chapter(c, "01", "Cars", lt, { x: 150, y: 175 });
  const bx = 1450, base = 830, maxH = 560; const bk = win(lt, w(100, S), w(103, S) + 0.6);
  if (bk > 0) {
    const hh = oc(bk) * maxH * 0.85;
    c.save(); shadow(c, 20, 8, 0.35); c.fillStyle = PAPER; c.fillRect(bx, base - hh, 300, hh); noShadow(c);
    c.save(); c.beginPath(); c.rect(bx, base - hh, 300, hh); c.clip(); c.strokeStyle = "rgba(43,58,216,0.18)"; c.lineWidth = 10; for (let i = -10; i < 30; i++) { c.beginPath(); c.moveTo(bx + i * 30, base); c.lineTo(bx + i * 30 + 300, base - 300); c.stroke(); } c.restore(); c.restore();
    txt(c, `${Math.round(oc(bk) * 85)}%+`, bx + 150, base - hh - 26, { font: "120px Anton", color: YEL, align: "center", shadow: true });
    txt(c, "JAPANESE BRANDS", bx + 150, base - 36, { font: "38px Anton", color: BLUE_D, align: "center", a: oc(bk), ls: 1 });
  }
  txt(c, "once ruled Thai roads", 110, 300, { font: "52px Hand", color: YEL, p: win(lt, w(100, S), w(101, S) + 0.5), rot: -3 });
}};
scenes.ev_full = { uses: ["evplug"], draw(c, lt, S) {
  full(c, "evplug", lt, S, { left: true, z0: 1.04, dz: 0.06, px0: 0.65, px1: 0.6 });
  txt(c, "Today", 100, 170, { font: "80px Serif", a: oc(win(lt, 0, 0.4)) });
  const nk = win(lt, w(114, S) - 0.15, w(114, S) + 0.9);
  txt(c, `${Math.round(oc(nk) * 70)}%+`, 90, 560, { font: "300px Anton", color: YEL, a: clamp(nk * 4), shadow: true });
  txt(c, "of Thailand's EV market\nis made by Chinese brands", 100, 660, { font: "50px Hand", lh: 58, p: win(lt, w(115, S), w(119, S) + 0.3) });
}};
scenes.ev_gfx = { uses: [], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1240, hy: 860, circ: [1720, 170, 90], sq: false });
  kicker(c, "The price edge", lt, 0.05, { x: 90, y: 150, size: 84 });
  const tk = win(lt, w(122, S) - 0.1, w(122, S) + 0.5);
  priceTag(c, 1350, 430, ob(tk, 1.6) * 1.35, -8 + Math.sin(lt * 6) * 5 * (1 - win(lt, w(122, S), w(122, S) + 2.5)), "−28.7%", "price advantage");
  txt(c, "vs Japanese & Korean imports", 1380, 640, { font: "42px Hand", align: "center", p: win(lt, w(123, S), w(126, S)) });
  cutout(c, IMG.car, lerp(-500, 560, oc(win(lt, 0.1, 0.8))), 470, 720, -2);
  for (let i = 0; i < 10; i++) { const s = popS(lt, 0.3 + i * 0.05, 0.35); if (s <= 0.01) continue; carIcon(c, 470 + i * 110, 770, 1.15 * s, i < 7 ? YEL : "rgba(255,255,255,0.92)"); }
  txt(c, "7 in 10 EVs in Thailand are Chinese-made", 960, 870, { font: "46px Hand", align: "center", a: oc(win(lt, 0.8, 1.3)) });
}};

// 8. AI
scenes.ai_full = { uses: ["dc"], draw(c, lt, S) {
  full(c, "dc", lt, S, { top: true, z0: 1.06, dz: 0.08 });
  chapter(c, "02", "AI", lt, { x: 150, y: 175 });
  txt(c, "the same path", 260, 280, { font: "52px Hand", color: YEL, p: win(lt, w(130, S), w(133, S) + 0.3) });
}};
scenes.ai_split = { uses: ["chip"], draw(c, lt, S) {
  bg(c);
  c.save(); c.beginPath(); c.rect(1000, 0, 920, H); c.clip(); cover(c, F("chip"), 1000, 0, 920, H, 1.08 + lt * 0.02); c.restore();
  dline(c, 1000, 0, 1000, H, 1, { w: 3 });
  const col = (x, title, big, sub, at, up, color) => {
    const k = win(lt, at - 0.1, at + 0.3); if (k <= 0) return;
    stamp(c, title, x, 230, { s: lerp(1.3, 1, ob(k)), size: 50, color });
    const ak = win(lt, at, at + 0.4), y0 = up ? 600 : 380, y1 = up ? 380 : 600;
    handPath(c, [[x - 160, y0], [x - 160, y1]], oc(ak), { color, w: 9 });
    handPath(c, [[x - 188, y1 + (up ? 30 : -30)], [x - 160, y1], [x - 132, y1 + (up ? 30 : -30)]], win(ak, 0.6, 1), { color, w: 9 });
    txt(c, big, x + 40, 530, { font: "110px Anton", color, align: "center", a: oc(k) });
    txt(c, sub, x + 40, 620, { font: "42px Hand", align: "center", p: win(lt, at + 0.1, at + 0.6) });
  };
  col(270, "WESTERN AI", "+30%", "pricier", 0.05, true, WHITE);
  col(730, "CHINESE AI", "CHEAP", "open-weight", w(135, S), false, YEL);
}};
scenes.dc_full = { uses: ["dc2"], draw(c, lt, S) {
  full(c, "dc2", lt, S, { z0: 1.1, dz: -0.06 });
  stamp(c, "CHINESE-LINKED MONEY", 960, 230, { s: slam(lt, w(139, S)), rot: -2, size: 72, fill: RED, color: WHITE });
  const dk = popS(lt, w(143, S));
  if (dk > 0.01) { c.save(); c.translate(960, 560); c.rotate(-3 * D2R); c.scale(dk, dk); shadow(c, 20, 8, 0.35); c.fillStyle = YEL; c.fillRect(-330, -85, 660, 170); noShadow(c);
    c.fillStyle = BLUE_D; c.font = "92px Anton"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("350 MW → 1 GW", 0, -14); c.font = "36px Hand"; c.fillText("data-centre capacity, 2024 → 2027", 0, 52); c.restore(); }
}};

// 9. pushback
scenes.push_full = { uses: ["bkknight"], draw(c, lt, S) {
  full(c, "bkknight", lt, S, { z0: 1.03, dz: 0.05 });
  const k = win(lt, 0.05, 0.5);
  const rg = c.createRadialGradient(W / 2, 500, 50, W / 2, 500, 760); rg.addColorStop(0, `rgba(6,10,48,${0.55 * oc(k)})`); rg.addColorStop(1, "rgba(6,10,48,0)"); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  txt(c, "Bangkok pushed back.", W / 2, 520, { font: "150px Serif", align: "center", a: oc(k), s: lerp(0.94, 1, oc(k)) });
  underline(c, 560, 610, 800, win(lt, w(147, S), w(148, S) + 0.3), { color: YEL, w: 8 });
}};
scenes.push_cards = { uses: ["flags", "ship", "parcels"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1880, hy: 880, circ: false, sq: false });
  kicker(c, "Three decisions", lt, 0.0, { x: 90, y: 120, size: 72 });
  const C = [["flags", 340, "WAICO", "China-led AI body.\nThailand didn't sign.", "NOT SIGNED", 149, 155, -3],
             ["ship", 960, "LAND BRIDGE", "~1 trillion baht.\nPanel: drop it.", "SHELVED", 157, 161, 2],
             ["parcels", 1580, "CHEAP PARCELS", "Low-value imports.\nTax rules tightened.", "TAXED", 163, 165, -2]];
  C.forEach(([key, x, title, sub, st, wi, si, rot], i) => {
    const ph = oc(win(lt, 0.1 + i * 0.12, 0.6 + i * 0.12)) * (1 - win(lt, w(wi, S) - 0.05, w(wi, S) + 0.1));
    if (ph > 0) { drect(c, x - 270, 190, 540, 620 * ph, 1, { w: 2.5, dash: [12, 10] }); txt(c, String(i + 1), x, 560, { font: "200px Anton", color: YEL, align: "center", a: ph * 0.9 }); }
    const k = enter(lt, w(wi, S)); if (k <= 0) return;
    c.save(); c.translate(x, 500 - (1 - oc(k)) * 120); c.rotate((rot + (1 - oc(k)) * 10) * D2R); c.scale(lerp(1.25, 1, ob(k)), lerp(1.25, 1, ob(k))); c.globalAlpha = clamp(k * 3);
    shadow(c, 30, 14, 0.38); c.fillStyle = PAPER; c.fillRect(-270, -310, 540, 620); noShadow(c);
    c.save(); c.beginPath(); c.rect(-244, -284, 488, 320); c.clip(); cover(c, F(key), -244, -284, 488, 320, 1.08); c.restore();
    txt(c, title, 0, 120, { font: "74px Anton", color: BLUE_D, align: "center" });
    txt(c, sub, 0, 190, { font: "600 32px Inter", color: "#33333a", align: "center", lh: 42 });
    c.restore();
    inkStamp(c, st, x, 360, { s: slam(lt, w(si, S) + 0.1), rot: -10 + rot, size: 66 });
  });
}};

// 10. standards
scenes.std_gfx = { uses: [], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1500, hy: 860, circ: false, sq: [1660, 60, 130] });
  chapter(c, "03", "Standards", lt, { x: 150, y: 175, size: 96 });
  txt(c, "the real contest", 262, 270, { font: "48px Hand", color: YEL, p: win(lt, w(170, S), w(171, S) + 0.3) });
  [["CONNECTORS", 169, 600, 430, -4], ["CERTIFICATION", 170, 1300, 430, 3], ["PROTOCOLS", 171, 600, 640, 2], ["DATA RULES", 173, 1300, 640, -3]].forEach(([q, i, x, y, r]) =>
    stamp(c, q, x, y, { s: slam(lt, w(i, S)), rot: r, size: 96 }));
  sparkle(c, 1780, 760, 70 * popS(lt, w(174, S)), 0.2, 91);
}};
scenes.plug_full = { uses: ["plug"], draw(c, lt, S) {
  full(c, "plug", lt, S, { z0: 1.05, dz: 0.07 });
  stamp(c, "CHARGING PLUG", 380, 170, { s: slam(lt, w(176, S)), rot: -3, size: 64, fill: YEL, color: BLUE_D });
  stamp(c, "TYPE 2 / CCS2  ·  NOT CHINA'S GB/T", 1340, 300, { s: slam(lt, w(178, S)), rot: 2, size: 48, fill: BLUE_D, color: WHITE });
  const fk = popS(lt, w(182, S));
  if (fk > 0.01) { c.save(); c.translate(1420, 560); c.rotate(-4 * D2R); c.scale(fk, fk); shadow(c, 18, 8, 0.35); c.fillStyle = YEL; c.fillRect(-250, -80, 580, 160); noShadow(c); c.restore();
    check(c, 1225, 565, 90, win(lt, w(183, S), w(183, S) + 0.4), { color: BLUE_D, w: 12 });
    txt(c, "fix: an adapter", 1500, 585, { font: "58px Hand", color: BLUE_D, align: "center", rot: -4, s: fk }); }
}};
scenes.fiber_full = { uses: ["fiber"], draw(c, lt, S) {
  full(c, "fiber", lt, S, { z0: 1.04, dz: 0.07 });
  stamp(c, "DATA ARCHITECTURE", 960, 190, { s: slam(lt, w(185, S)), rot: 2, size: 70, fill: YEL, color: BLUE_D });
  scribbleX(c, 960, 520, 620, 400, win(lt, w(187, S), w(187, S) + 0.45), { color: YEL, w: 16 });
  inkStamp(c, "NO ADAPTER FOR THIS", 960, 760, { s: slam(lt, w(187, S) + 0.2), rot: -5, size: 78 });
}};

// 11. close: chess king
scenes.close = { uses: ["globe"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1060, hy: 900, circ: false, sq: false });
  kicker(c, "The test case", lt, 0.05, { x: 90, y: 140, size: 76 });
  spiky(c, 560, 760, 290 * popS(lt, 0.2, 0.6), 0.2 + lt * 0.03, 101, 11);
  dcircle(c, 560, 500, 380, oc(win(lt, 0.1, 1.0)), lt * 0.15, { w: 3 });
  const ki = FR.__king; const kk = oc(win(lt, 0, 0.7));
  if (ki) { const kh = 900, kw = (ki.width / ki.height) * kh; c.save(); c.translate(560, 520 + (1 - kk) * 900); shadow(c, 30, 14, 0.35); c.drawImage(ki, -kw / 2, -kh / 2, kw, kh); noShadow(c); c.restore(); }
  txt(c, "Thailand", 820, 330, { font: "56px Hand", color: YEL, rot: -4, p: win(lt, w(192, S), w(192, S) + 0.5) });
  const gk = enter(lt, w(197, S));
  if (gk > 0) polaroid(c, F("globe"), 1650, 280, 320, 210, 6, { s: lerp(1.3, 1, ob(gk)), a: clamp(gk * 3), cap: "everyone else" });
  arrow(c, 1480, 380, 1380, 470, 1280, 430, win(lt, w(197, S) + 0.1, w(199, S) + 0.3), { color: YEL, w: 5 });
  const col = [["Sooner,", 200], ["and with", 202], ["less warning.", 203]];
  col.forEach(([s, i], k) => { const p = win(lt, w(i, S) - 0.05, w(i, S) + 0.3); txt(c, s, 1140, 600 + k * 105, { font: (k === 2 ? "100px SerifI" : "100px Serif"), a: oc(p), s: lerp(0.92, 1, oc(p)) }); });
  underline(c, 1140, 830, 520, win(lt, w(204, S) + 0.2, w(204, S) + 0.6), { color: YEL, w: 7 });
}};

// 12. end card
scenes.end = { uses: ["endport"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 1180, hy: 800, circ: [1750, 160, 100], sq: false });
  const [sx, sy] = shake(lt, w(206, S), 10); c.save(); c.translate(sx, sy);
  sparkle(c, 1130, 120, 110 * popS(lt, 0.15), 0.1, 111);
  [["THE LEVER", 205, 270, WHITE], ["IS PRICE", 207, 470, YEL]].forEach(([s, i, y, col]) => { const k = win(lt, w(i, S) - 0.05, w(i, S) + 0.3); if (k > 0) txt(c, s, 90, y + (1 - oc(k)) * 40, { font: "210px Anton", color: col, a: clamp(k * 3), ls: 2 }); });
  txt(c, "China's New Leverage Play in Thailand", 96, 580, { font: "64px Serif", a: oc(win(lt, w(208, S) + 0.2, w(208, S) + 0.7)) });
  txt(c, "Jaibal Naduvath  ·  ORF Special Report No. 321  ·  September 2026", 98, 660, { font: "500 34px Inter", color: "rgba(255,255,255,0.85)", a: oc(win(lt, w(209, S), w(209, S) + 0.5)) });
  const pk = win(lt, 0.25, 0.6);
  if (pk > 0) polaroid(c, F("endport"), 1500, 420, 520, 340, 5, { s: lerp(1.3, 1, ob(pk)), a: clamp(pk * 3), cap: "orfonline.org" });
  cutout(c, IMG.car, lerp(2400, 1520, oc(win(lt, 0.5, 1.2))), 700, 560, -3);
  const ok = win(lt, w(214, S) - 0.1, w(214, S) + 0.4);
  stamp(c, "OBSERVER RESEARCH FOUNDATION", 560, 820, { s: lerp(1.2, 1, ob(ok)), a: clamp(ok * 3), size: 58, ls: 3, fill: PAPER, color: BLUE_D });
  txt(c, "read the full report → orfonline.org", 960, 990, { font: "52px Hand", align: "center", p: win(lt, w(216, S), w(216, S) + 1.0) });
  c.restore();
}};

// ------------------------------------------------------------ transitions --
const SCN = Object.keys(SH);
const bufA = document.createElement("canvas"); bufA.width = W; bufA.height = H; const A = bufA.getContext("2d");
const bufB = document.createElement("canvas"); bufB.width = W; bufB.height = H; const Bc = bufB.getContext("2d");
function drawScene(c, name, t) {
  const S = SH[name]; const lt = t - S.t0;
  c.save(); scenes[name].draw(c, lt, S); c.restore();
}
function tornEdgeV(x, seed) { const R = rng(seed); const pts = []; for (let y = -20; y <= H + 20; y += 22) pts.push([x + (R() - 0.5) * 34, y]); return pts; }
function composite(c, tr, t, prev, next) {
  const p = clamp((t - (tr.at - tr.d / 2)) / tr.d);
  if (tr.type === "whip") {
    const e = io(p); drawScene(A, prev, t); drawScene(Bc, next, t);
    const blur = Math.sin(p * Math.PI) * 30; c.filter = blur > 1 ? `blur(${blur.toFixed(1)}px)` : "none";
    c.drawImage(bufA, -e * W, 0); c.drawImage(bufB, W - e * W, 0); c.filter = "none";
  } else if (tr.type === "slide") {
    const e = io(p); drawScene(A, prev, t); drawScene(Bc, next, t);
    c.drawImage(bufA, -e * W * 0.3, 0); c.fillStyle = `rgba(0,0,40,${0.4 * e})`; c.fillRect(0, 0, W, H);
    c.save(); shadow(c, 40, 0, 0.5); c.shadowOffsetX = -10; c.drawImage(bufB, W - e * W, 0); c.restore();
  } else if (tr.type === "rip") {
    const e = io(p); drawScene(A, prev, t); drawScene(Bc, next, t);
    c.drawImage(bufB, 0, 0);
    const x = lerp(-80, W + 80, e), edge = tornEdgeV(0, Math.floor(tr.at * 10));
    c.save(); c.beginPath(); c.moveTo(W + 200, -20); edge.forEach(([xx, y]) => c.lineTo(x + xx, y)); c.lineTo(W + 200, H + 20); c.closePath();
    c.save(); c.translate(-16, 0); c.fillStyle = PAPER; shadow(c, 30, 0, 0.4); c.shadowOffsetX = -6; c.fill(); c.restore(); noShadow(c);
    c.clip(); c.drawImage(bufA, 0, 0); c.restore();
  } else if (tr.type === "burst") {
    drawScene(c, p < 0.5 ? prev : next, t);
    const r = p < 0.5 ? lerp(0, 2600, ein(p * 2)) : lerp(2600, 4600, oc((p - 0.5) * 2));
    c.save(); c.globalAlpha = p < 0.5 ? 1 : 1 - oc((p - 0.5) * 2.2); sparkle(c, W / 2, H / 2, r, p * 1.2, 7); c.restore();
  } else if (tr.type === "flash") {
    drawScene(c, p < 0.5 ? prev : next, t);
    c.fillStyle = `rgba(255,252,235,${Math.sin(p * Math.PI) * 0.85})`; c.fillRect(0, 0, W, H);
  } else if (tr.type === "glitch") {
    drawScene(A, p < 0.5 ? prev : next, t); c.drawImage(bufA, 0, 0);
    const R = rng(Math.floor(t * 30) * 7 + 3), amt = Math.sin(p * Math.PI);
    for (let i = 0; i < 16; i++) { const y = R() * H, h = 8 + R() * 90; const dx = (R() - 0.5) * 220 * amt; c.drawImage(bufA, 0, y, W, h, dx, y, W, h); }
    c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.5 * amt; c.drawImage(bufA, 18 * amt, 0); c.restore();
  }
}
async function prefetch(t) {
  const need = new Set();
  for (const n of SCN) { const S = SH[n]; if (t >= S.t0 - 0.6 && t <= S.t1 + 0.6) scenes[n].uses.forEach((k) => need.add(k)); }
  await Promise.all([...need].map(async (k) => { FR[k] = await loadImg(frameURL(k, t)); }));
  const S = SH.close; if (t >= S.t0 - 0.6 && t <= S.t1 + 0.6) FR.__king = await loadImg(kingURL(Math.max(0, t - S.t0)));
}
window.renderAt = async function (t) {
  NOW = t; await prefetch(t);
  const c = ctx; c.save(); c.clearRect(0, 0, W, H);
  const tr = TL.trans.find((x) => x.d > 0 && t >= x.at - x.d / 2 && t < x.at + x.d / 2);
  if (tr) { const i = SCN.indexOf(tr.to); composite(c, tr, t, SCN[i - 1], tr.to); }
  else { const n = SCN.find((k) => t >= SH[k].t0 && t < SH[k].t1) || SCN[SCN.length - 1]; drawScene(c, n, t); }
  captions(c, t);
  c.save(); c.globalAlpha = 0.11; c.globalCompositeOperation = "overlay"; c.imageSmoothingEnabled = false; c.drawImage(GRAIN[Math.floor(t * 12) % 4], 0, 0, W, H); c.restore();
  const vg = c.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1150); vg.addColorStop(0, "rgba(0,0,30,0)"); vg.addColorStop(1, "rgba(0,0,30,0.25)"); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  const fin = 1 - win(t, 0, 0.35), fout = win(t, TL.dur - 0.5, TL.dur);
  if (fin > 0 || fout > 0) { c.fillStyle = `rgba(0,0,0,${Math.max(fin, fout)})`; c.fillRect(0, 0, W, H); }
  c.restore(); return true;
};
window.frameJPEG = (q = 0.94) => cv.toDataURL("image/jpeg", q);
window.stageReady = true;
})().catch((e) => { console.error(e); window.stageError = String(e && e.stack || e); });
