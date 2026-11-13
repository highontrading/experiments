// node render.js a01 [--times 1,2,3] [--from F --to F]  -> build/a01/frames/f0001.jpg ..., build/a01/audio.json
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const ad = process.argv[2]; const args = process.argv.slice(3); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const p0 = await b.newPage({ viewport: { width: 400, height: 400 } });
  await p0.goto(`file://${path.join(__dirname, "stage.html")}?ad=${ad}`);
  const meta = await p0.evaluate(() => ({ w: AD.w, h: AD.h, dur: AD.dur, music: AD.music || null, sfx: AD.sfx || [] }));
  await p0.close();
  fs.mkdirSync(path.join(__dirname, `build/${ad}`), { recursive: true });
  fs.writeFileSync(path.join(__dirname, `build/${ad}/audio.json`), JSON.stringify(meta, null, 1));
  const page = await b.newPage({ viewport: { width: meta.w, height: meta.h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(`file://${path.join(__dirname, "stage.html")}?ad=${ad}`);
  await page.evaluate(() => window.stageReady);
  let jobs; const N = Math.round(meta.dur * 30);
  if (opt("--times")) jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/${ad}_t${(+s).toFixed(2)}.jpg` }));
  else { jobs = []; for (let f = +opt("--from", 1); f <= +opt("--to", N); f++) jobs.push({ t: (f - 1) / 30, file: `build/${ad}/frames/f${String(f).padStart(4, "0")}.jpg` }); }
  for (const d of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, d), { recursive: true });
  const t0 = Date.now();
  for (const j of jobs) { await page.evaluate((t) => window.renderAt(t), j.t); await page.screenshot({ path: path.join(__dirname, j.file), type: "jpeg", quality: 94 }); }
  await b.close(); console.log(`${ad}: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
