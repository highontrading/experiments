// Render stage.html frame by frame with headless Chromium.
//   node render.js --size 1920x1080 [--from F --to F]       -> build/frames_1920x1080/f0001.jpg ...
//   node render.js --size 1080x1920 --times 2.0,5.3          -> build/stills/1080x1920_t5.30.jpg
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, "build/timeline.json")));
const [w, h] = opt("--size", "1920x1080").split("x").map(Number);
const N = Math.round(TL.dur * TL.fps);
(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(`file://${path.join(__dirname, "stage.html")}?w=${w}&h=${h}`);
  await page.evaluate(() => window.stageReady);
  let jobs;
  if (opt("--times")) jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/${w}x${h}_t${(+s).toFixed(2)}.jpg` }));
  else { const from = +opt("--from", 1), to = +opt("--to", N); jobs = [];
    for (let f = from; f <= to; f++) jobs.push({ t: (f - 1) / TL.fps, file: `build/frames_${w}x${h}/f${String(f).padStart(4, "0")}.jpg` }); }
  for (const d of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, d), { recursive: true });
  const t0 = Date.now();
  for (const [i, j] of jobs.entries()) {
    await page.evaluate((t) => window.renderAt(t), j.t);
    await page.screenshot({ path: path.join(__dirname, j.file), type: "jpeg", quality: 95 });
    if (i % 150 === 0) console.log(`${w}x${h} ${i + 1}/${jobs.length} t=${j.t.toFixed(2)} ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
  await browser.close(); console.log(`done ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
