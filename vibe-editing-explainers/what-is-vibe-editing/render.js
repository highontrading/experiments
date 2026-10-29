// Render stage.html frame by frame with headless Chromium.
//   node render.js                  all frames -> build/frames/f0001.jpg ...   (4 workers)
//   node render.js --times 2,8.5    stills at those times -> build/stills/
//   node render.js --stills 24      evenly spaced stills -> build/stills/
// During camera glides each frame is the average of 4-14 sub-frames, more at full speed (motion blur, 0.5 shutter).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
global.window = {};
eval(fs.readFileSync(path.join(__dirname, "build/timeline.js"), "utf8"));
const TL = global.window.TL;
const N = Math.round(TL.dur * TL.fps);
const WORKERS = +opt("--workers", 4);

let jobs;
if (opt("--times")) jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/t_${(+s).toFixed(2)}.jpg` }));
else if (opt("--stills")) {
  const k = +opt("--stills");
  jobs = Array.from({ length: k }, (_, i) => { const t = +(0.2 + (i * (TL.dur - 0.4)) / (k - 1)).toFixed(2); return { t, file: `build/stills/s${String(i + 1).padStart(2, "0")}_${t.toFixed(2)}.jpg` }; });
} else {
  const from = +opt("--from", 1), to = +opt("--to", N);
  jobs = [];
  for (let f = from; f <= to; f++) jobs.push({ t: (f - 1) / TL.fps, file: `build/frames/f${String(f).padStart(4, "0")}.jpg` });
}
for (const d of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, d), { recursive: true });

async function worker(browser, mine, id) {
  const page = await browser.newPage({ viewport: { width: TL.w, height: TL.h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  await page.goto("file://" + path.join(__dirname, "stage.html"));
  await page.evaluate(() => window.stageReady);
  const t0 = Date.now();
  for (const [i, j] of mine.entries()) {
    const st = await page.evaluate((t) => window.renderAt(t), j.t);
    if (st.moving && !opt("--times")) {
      // motion blur: average sub-frames spread over half a frame, in the page
      await page.evaluate(async ({ t, fps, n }) => {
        const cv = document.getElementById("c"), g = cv.getContext("2d");
        const acc = new Float32Array(cv.width * cv.height * 4);
        for (let s = 0; s < n; s++) {
          await window.renderAt(t + ((s / (n - 1)) - 0.5) * (0.5 / fps));
          const d = g.getImageData(0, 0, cv.width, cv.height).data;
          for (let k = 0; k < d.length; k++) acc[k] += d[k];
        }
        const out = g.createImageData(cv.width, cv.height);
        for (let k = 0; k < acc.length; k++) out.data[k] = acc[k] / n;
        g.putImageData(out, 0, 0);
      }, { t: j.t, fps: TL.fps, n: Math.round(4 + 10 * st.speed) });
    }
    await page.screenshot({ path: path.join(__dirname, j.file), type: "jpeg", quality: 94 });
    if (i % 60 === 0) console.log(`[w${id}] ${i + 1}/${mine.length} t=${j.t.toFixed(2)} ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
}

(async () => {
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const n = Math.min(WORKERS, jobs.length);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: n }, (_, w) => worker(browser, jobs.filter((_, i) => i % n === w), w)));
  await browser.close();
  console.log(`done: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})();
