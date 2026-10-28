// Render carousel slides with headless Chromium.
//   node render.js --c 01-five-step-system                 every slide -> build/<c>/sNN/f0001.png ...
//   node render.js --c 01-five-step-system --s 3            one slide
//   node render.js --c ... --stills 2.5                     one still per slide at t=2.5 -> build/<c>/stills/
//   node render.js --c ... --s 1 --times 0.5,1,2.5          stills at those times
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const CAR = opt("--c", "01-five-step-system");
const count = (() => {
  const src = fs.readFileSync(path.join(__dirname, "carousels", CAR + ".js"), "utf8");
  const w = {}; new Function("window", src)(w); return w.CAROUSEL.slides.length;
})();
const slides = opt("--s") ? opt("--s").split(",").map(Number) : Array.from({ length: count }, (_, i) => i + 1);
const pad = (n, k = 2) => String(n).padStart(k, "0");

async function renderSlide(browser, s) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error(`slide ${s} page error:`, e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error(`slide ${s}:`, m.text()); });
  await page.goto(`file://${path.join(__dirname, "stage.html")}?c=${CAR}&s=${s}`);
  await page.evaluate(() => window.stageReady);
  const info = await page.evaluate(() => window.SLIDE_INFO);
  let jobs;
  if (opt("--times") || opt("--stills")) {
    const ts = (opt("--times") || opt("--stills")).split(",").map(Number);
    jobs = ts.map((t) => ({ t, file: `build/${CAR}/stills/s${pad(s)}_${t.toFixed(2)}.png` }));
  } else {
    const n = Math.round(info.dur * info.fps);
    jobs = Array.from({ length: n }, (_, f) => ({ t: f / info.fps, file: `build/${CAR}/s${pad(s)}/f${pad(f + 1, 4)}.png` }));
  }
  fs.mkdirSync(path.join(__dirname, path.dirname(jobs[0].file)), { recursive: true });
  const t0 = Date.now();
  for (const j of jobs) {
    await page.evaluate((t) => window.renderAt(t), j.t);
    await page.screenshot({ path: path.join(__dirname, j.file) });
  }
  console.log(`slide ${s}: ${jobs.length} frames, ${((Date.now() - t0) / jobs.length).toFixed(0)} ms/frame`);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ args: ["--font-render-hinting=none"] });
  const queue = [...slides];
  const workers = Array.from({ length: Math.min(+opt("--jobs", 3), queue.length) }, async () => {
    while (queue.length) await renderSlide(browser, queue.shift());
  });
  await Promise.all(workers);
  await browser.close();
})();
