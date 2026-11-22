// node render_v3.js [--jobs 4] [--from a --to b] [--stills 1.0,5.2]  -> build/v3/frames/f00001.png, build/v3/sfx.json
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const META = JSON.parse(fs.readFileSync(path.join(__dirname, "build/v3/meta.json"), "utf8"));
let jobs;
if (opt("--stills")) jobs = opt("--stills").split(",").map(Number).map((t) => ({ f: Math.round(t * 30), out: `build/v3/stills/t${t.toFixed(2).padStart(6, "0")}.png` }));
else { const from = +opt("--from", 0), to = Math.min(+opt("--to", META.nframes - 1), META.nframes - 1); jobs = [];
  for (let f = from; f <= to; f++) jobs.push({ f, out: `build/v3/frames/f${String(f + 1).padStart(5, "0")}.png` }); }
(async () => {
  fs.mkdirSync(path.join(__dirname, path.dirname(jobs[0].out)), { recursive: true });
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const N = Math.min(+opt("--jobs", 4), jobs.length), per = Math.ceil(jobs.length / N), t0 = Date.now(); let done = 0;
  await Promise.all(Array.from({ length: N }, async (_, w) => {
    const mine = jobs.slice(w * per, (w + 1) * per); if (!mine.length) return;
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
    page.on("console", (m) => { if (m.type() === "error") console.error(m.text()); });
    await page.goto(`file://${path.join(__dirname, "stage_v3.html")}`);
    await page.evaluate(() => window.stageReady);
    if (w === 0) fs.writeFileSync(path.join(__dirname, "build/v3/sfx.json"), JSON.stringify(await page.evaluate(() => window.SFX_CUES), null, 1));
    for (const j of mine) {
      await page.evaluate((f) => window.renderAt(f), j.f);
      await page.screenshot({ path: path.join(__dirname, j.out) });
      if (++done % 200 === 0) console.log(`v3: ${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
    await page.close();
  }));
  await browser.close(); console.log(`v3: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
