// node render.js --id 2508 [--jobs 3] [--from 0 --to 100] [--stills 1.0,5.2]   -> build/<id>/frames/f00001.png
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const ID = opt("--id");
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, "build", ID, "timeline.json"), "utf8"));
let jobs;
if (opt("--stills")) jobs = opt("--stills").split(",").map(Number).map((t) => ({ f: Math.round(t * TL.fps), out: `build/${ID}/stills/t${t.toFixed(2)}.png` }));
else {
  const from = +opt("--from", 0), to = Math.min(+opt("--to", TL.nframes - 1), TL.nframes - 1);
  jobs = []; for (let f = from; f <= to; f++) jobs.push({ f, out: `build/${ID}/frames/f${String(f + 1).padStart(5, "0")}.png` });
}
(async () => {
  fs.mkdirSync(path.join(__dirname, path.dirname(jobs[0].out)), { recursive: true });
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const N = Math.min(+opt("--jobs", 3), jobs.length), t0 = Date.now(); let done = 0;
  const per = Math.ceil(jobs.length / N);
  await Promise.all(Array.from({ length: N }, async (_, w) => {
    const mine = jobs.slice(w * per, (w + 1) * per);
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
    page.on("console", (m) => { if (m.type() === "error") console.error(m.text()); });
    await page.goto(`file://${path.join(__dirname, "stage.html")}?id=${ID}`);
    await page.evaluate(() => window.stageReady);
    for (const j of mine) {
      await page.evaluate((f) => window.renderAt(f), j.f);
      await page.screenshot({ path: path.join(__dirname, j.out) });
      if (++done % 100 === 0) console.log(`${ID}: ${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
    await page.close();
  }));
  await browser.close();
  console.log(`${ID}: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
