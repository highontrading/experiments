// Render stage.html frame by frame with headless Chromium, in parallel workers.
//   node render.js                    all frames -> build/frames/f00001.png ...
//   node render.js --times 2.0,5.3    specific times -> build/stills/
//   node render.js --slides           one still per slide (2/3 through) -> build/stills/
//   (default) all frames, streamed into build/seg_0..N-1.mp4 (one encoder per worker)
//   --png write PNG frames instead,  --from A --to B  frame range,  --workers N (default 4)
// Also writes build/sfx_events.json (every SFX hit the stage scheduled).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes(k);
const vm = require("vm");
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "build/timeline.js"), "utf8"), ctx);
const TL = ctx.window.TL;
const N = Math.round(TL.dur * TL.fps);

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto("file://" + path.join(__dirname, "stage.html"));
  await page.evaluate(() => window.stageReady);
  return page;
}

(async () => {
  const browser = await chromium.launch({ args: ["--disable-gpu-vsync", "--font-render-hinting=none", "--allow-file-access-from-files"] });
  let jobs;
  if (has("--slides")) {
    jobs = TL.slides.map((s) => ({ t: +(s.start + (s.end - s.start) * 0.85).toFixed(3), file: `build/stills/slide_${String(s.n).padStart(2, "0")}.png` }));
    jobs.push({ t: TL.dur - 1, file: "build/stills/slide_99_outro.png" });
  } else if (opt("--times")) {
    jobs = opt("--times").split(",").map((s) => ({ t: +s, file: `build/stills/t_${(+s).toFixed(2).padStart(7, "0")}.png` }));
  } else {
    const from = +opt("--from", 1), to = +opt("--to", N);
    jobs = [];
    for (let f = from; f <= to; f++) jobs.push({ t: (f - 1) / TL.fps, file: `build/frames/f${String(f).padStart(5, "0")}.png` });
  }
  if (has("--slides") || opt("--times") || has("--png")) for (const dir of new Set(jobs.map((j) => path.dirname(j.file)))) fs.mkdirSync(path.join(__dirname, dir), { recursive: true });

  const first = await openPage(browser);
  const events = await first.evaluate(() => window.SFX_EVENTS);
  fs.writeFileSync(path.join(__dirname, "build/sfx_events.json"), JSON.stringify(events, null, 0));

  const nw = Math.min(+opt("--workers", 4), jobs.length);
  const pages = [first];
  for (let i = 1; i < nw; i++) pages.push(await openPage(browser));
  const t0 = Date.now();
  let done = 0;
  // contiguous chunks per worker keep each page's DOM caches warm
  const chunk = Math.ceil(jobs.length / nw);
  const { spawn } = require("child_process");
  const toVideo = !has("--slides") && !opt("--times") && !has("--png");
  await Promise.all(pages.map(async (page, w) => {
    const mine = jobs.slice(w * chunk, (w + 1) * chunk);
    if (toVideo) {
      // stream JPEG frames straight into one encoder per worker: build/seg_N.mp4
      const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(TL.fps), "-c:v", "mjpeg", "-i", "-",
        "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", path.join(__dirname, `build/seg_${w}.mp4`)], { stdio: ["pipe", "inherit", "inherit"] });
      const closed = new Promise((res) => ff.on("close", res));
      for (const j of mine) {
        await page.evaluate((t) => window.renderAt(t), j.t);
        const buf = await page.screenshot({ type: "jpeg", quality: 95 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
        if (++done % 300 === 0) console.log(`${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
      }
      ff.stdin.end();
      await closed;
      return;
    }
    for (const j of mine) {
      const out = path.join(__dirname, j.file);
      if (has("--resume") && fs.existsSync(out)) { done++; continue; }
      await page.evaluate((t) => window.renderAt(t), j.t);
      await page.screenshot({ path: out });
      if (++done % 150 === 0) console.log(`${done}/${jobs.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
  }));
  await browser.close();
  console.log(`done: ${jobs.length} in ${((Date.now() - t0) / 1000).toFixed(1)} s, ${events.length} sfx events`);
})();
