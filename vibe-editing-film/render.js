// Render stage.html frame by frame with headless Chromium.
//   node render.js                 all 360 frames -> build/frames/f0001.png ...
//   node render.js --stills 18     18 evenly spaced stills -> build/stills/
//   node render.js --times 2.0,5.3 specific times -> build/stills/
//   --sub N                        N sub-frames per frame (shutter blur), default 1
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, "build/timeline.json")));
const N = Math.round(TL.dur * TL.fps);

(async () => {
  const browser = await chromium.launch({ args: ["--disable-gpu-vsync", "--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  await page.goto("file://" + path.join(__dirname, "stage.html"));
  await page.evaluate(() => window.stageReady);

  let jobs;
  if (opt("--stills")) {
    const k = +opt("--stills");
    jobs = Array.from({ length: k }, (_, i) => {
      const t = +(0.3 + (i * (TL.dur - 0.35)) / (k - 1)).toFixed(3);
      return { t, file: `build/stills/s${String(i + 1).padStart(2, "0")}_${t.toFixed(2)}.png` };
    });
  } else if (opt("--times")) {
    jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/t_${(+s).toFixed(2)}.png` }));
  } else {
    const from = +opt("--from", 1), to = +opt("--to", N);
    jobs = [];
    for (let f = from; f <= to; f++) jobs.push({ t: (f - 1) / TL.fps, file: `build/frames/f${String(f).padStart(4, "0")}.png`, f });
  }
  const sub = +opt("--sub", 1);
  for (const dir of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, dir), { recursive: true });

  const t0 = Date.now();
  for (const [i, j] of jobs.entries()) {
    if (sub === 1) {
      await page.evaluate((t) => window.renderAt(t), j.t);
      await page.screenshot({ path: path.join(__dirname, j.file) });
    } else {
      // 0.5 shutter: sub-frames spread over half a frame, averaged by ffmpeg later
      for (let s = 0; s < sub; s++) {
        const t = j.t + ((s / sub) - 0.25) * (0.5 / TL.fps);
        await page.evaluate((tt) => window.renderAt(tt), Math.max(0, t));
        await page.screenshot({ path: path.join(__dirname, j.file.replace(".png", `_${s}.png`)) });
      }
    }
    if (i % 30 === 0) console.log(`${i + 1}/${jobs.length}  t=${j.t.toFixed(2)}  ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
  await browser.close();
  console.log(`done: ${jobs.length} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})();
