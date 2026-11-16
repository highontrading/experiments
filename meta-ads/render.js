// node render.js a01 [--times 1,2,3] [--from F --to F]  -> build/a01/frames/f0001.jpg ..., build/a01/audio.json
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const ad = process.argv[2]; const args = process.argv.slice(3); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const p0 = await b.newPage({ viewport: { width: 400, height: 400 } });
  await p0.goto(`file://${path.join(__dirname, "stage.html")}?ad=${ad}`);
  const meta = await p0.evaluate(() => ({ w: AD.w, h: AD.h, dur: AD.dur, music: AD.music || null, sfx: AD.sfx || [], voAd: AD.voAd || null, voUntil: AD.voUntil ?? null }));
  await p0.close();
  fs.mkdirSync(path.join(__dirname, `build/${ad}`), { recursive: true });
  fs.writeFileSync(path.join(__dirname, `build/${ad}/audio.json`), JSON.stringify(meta, null, 1));
  const page = await b.newPage({ viewport: { width: meta.w, height: meta.h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(`file://${path.join(__dirname, "stage.html")}?ad=${ad}`);
  await page.evaluate(() => window.stageReady);
  let jobs; const N = Math.round(meta.dur * 30);
  if (args.includes("--qa")) {   // text-overlap QA: sample every 0.1 s, report overlapping text boxes
    await page.evaluate(() => { window.__QA = true; }); const bad = [];
    for (let f = 0; f < N; f += 3) { const r = await page.evaluate((t) => { window.renderAt(t); const B = window.__BOXES, out = [];
        for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const a = B[i], b = B[j]; if (a.s === b.s) continue;
          const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0); if (ix <= 2 || iy <= 2) continue;
          const ar = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0)); if (ix * iy > 0.12 * ar) out.push(a.s + " ⟂ " + b.s); }
        return out; }, f / 30);
      if (r.length) bad.push(`${(f / 30).toFixed(1)}s: ${[...new Set(r)].slice(0, 4).join(" | ")}`); }
    console.log(bad.length ? "OVERLAPS\n" + bad.join("\n") : "QA clean"); await b.close(); return; }
  if (opt("--times")) jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/${ad}_t${(+s).toFixed(2)}.jpg` }));
  else { jobs = []; for (let f = +opt("--from", 1); f <= +opt("--to", N); f++) jobs.push({ t: (f - 1) / 30, file: `build/${ad}/frames/f${String(f).padStart(4, "0")}.jpg` }); }
  for (const d of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, d), { recursive: true });
  const t0 = Date.now();
  for (const j of jobs) { await page.evaluate((t) => window.renderAt(t), j.t); await page.screenshot({ path: path.join(__dirname, j.file), type: "jpeg", quality: 94 }); }
  await b.close(); console.log(`${ad}: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
