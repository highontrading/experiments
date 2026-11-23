// Render stage.html with headless Chromium.
//   node render.js --times 1,2.5      stills -> build/stills/t_<t>.jpg
//   node render.js --stills 24        evenly spaced stills
//   node render.js [--from F --to T] [--workers 4]   frames -> build/frames/f00001.jpg
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, "build/timeline.json")));
const N = Math.round(TL.dur * TL.fps);
const PORT = 8765 + Math.floor(Math.random() * 200);
(async () => {
  const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: __dirname, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));
  let jobs;
  if (opt("--times")) jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/t_${(+s).toFixed(2)}.jpg` }));
  else if (opt("--stills")) { const k = +opt("--stills"); jobs = Array.from({ length: k }, (_, i) => { const t = +(0.6 + (i * (TL.dur - 1.2)) / (k - 1)).toFixed(2); return { t, file: `build/stills/s${String(i + 1).padStart(2, "0")}_${t.toFixed(2)}.jpg` }; }); }
  else { const from = +opt("--from", 1), to = +opt("--to", N); jobs = []; for (let f = from; f <= to; f++) jobs.push({ t: (f - 1) / TL.fps, file: `build/frames/f${String(f).padStart(5, "0")}.jpg` }); }
  for (const d of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, d), { recursive: true });
  const nw = Math.min(+opt("--workers", 4), jobs.length);
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--disable-gpu"] });
  const t0 = Date.now(); let done = 0;
  await Promise.all(Array.from({ length: nw }, async (_, wi) => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
    page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/stage.html`);
    await page.waitForFunction(() => window.stageReady || window.stageError, null, { timeout: 60000 });
    const err = await page.evaluate(() => window.stageError); if (err) { console.error(err); process.exit(1); }
    // contiguous chunks per worker (better cache locality)
    const per = Math.ceil(jobs.length / nw), mine = jobs.slice(wi * per, (wi + 1) * per);
    for (const j of mine) {
      const data = await page.evaluate(async (t) => { await window.renderAt(t); return window.frameJPEG(0.95); }, j.t);
      fs.writeFileSync(path.join(__dirname, j.file), Buffer.from(data.split(",")[1], "base64"));
      done++; if (done % 100 === 0) console.log(`${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
  }));
  await browser.close(); srv.kill();
  console.log(`done ${jobs.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
