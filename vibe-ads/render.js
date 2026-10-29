// Render the film with headless Chromium, frame by frame.
//   node render.js                       every frame -> build/frames_out/f00001.png …
//   node render.js --times 3,21.5,40     stills -> build/stills/t<sec>.png
//   node render.js --from 20 --to 30     only part of the film
//   (frames already in build/frames_out are skipped; --force re-renders them)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const JOBS = +opt("--jobs", 4);
const AD = process.env.AD || "a1";

async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  p.on("console", (m) => { if (m.type() === "error" && !/ERR_FILE_NOT_FOUND/.test(m.text())) console.error(m.text()); });
  await p.goto(`file://${path.join(__dirname, "stage.html")}?ad=${AD}`);
  await p.evaluate(() => window.stageLoaded);
  return p;
}
(async () => {
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files", "--disable-dev-shm-usage"] });
  const probe = await page(browser);
  const info = await probe.evaluate(() => window.FILM_INFO);
  await probe.close();
  let jobs;
  if (opt("--times")) {
    jobs = opt("--times").split(",").map(Number).map((t) => ({ t, file: `build/${AD}/stills/t${t.toFixed(2)}.png` }));
  } else {
    const a = Math.round(+opt("--from", 0) * info.fps), b = Math.round(+opt("--to", info.dur) * info.fps);
    jobs = []; for (let f = a; f < b; f++) jobs.push({ t: f / info.fps, file: `build/${AD}/frames/f${String(f + 1).padStart(5, "0")}.png` });
    // resume: frames already on disk are kept unless --force
    if (!args.includes("--force")) jobs = jobs.filter((j) => { const p = path.join(__dirname, j.file); return !fs.existsSync(p) || fs.statSync(p).size === 0; });
    if (!jobs.length) { console.log("all frames present"); await browser.close(); return; }
  }
  fs.mkdirSync(path.dirname(path.join(__dirname, jobs[0].file)), { recursive: true });
  const t0 = Date.now(); let done = 0;
  // each worker takes a contiguous chunk, so its frame cache stays warm
  const per = Math.ceil(jobs.length / JOBS);
  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, async (_, w) => {
    let p = await page(browser), since = 0;
    for (const j of jobs.slice(w * per, (w + 1) * per)) {
      if (++since > 250) { await p.close(); p = await page(browser); since = 0; }   // keep each page's memory small
      for (let tries = 0; ; tries++) {              // a crashed capture gets a fresh page and another go
        try {
          await p.evaluate((t) => window.renderAt(t), j.t);
          await p.screenshot({ path: path.join(__dirname, j.file), type: "png" });
          break;
        } catch (e) {
          if (tries >= 3) throw e;
          console.error(`retry ${j.file}: ${e.message.split("\n")[0]}`);
          try { await p.close(); } catch (_) {}
          p = await page(browser);
        }
      }
      if (++done % 150 === 0) console.log(`${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
    await p.close();
  }));
  console.log(`${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await browser.close();
})();
