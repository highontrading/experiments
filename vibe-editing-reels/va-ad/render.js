// Render stage.html with headless Chromium.
//   node render.js --times 0.3,1.5,...   -> build/stills/t_<t>.jpg
//   node render.js --video               -> build/gfx.mp4 (all 804 frames, piped to ffmpeg)
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FPS = 30, N = 804;
(async () => {
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto("file://" + path.join(__dirname, "stage.html"));
  await page.evaluate(() => window.stageReady);
  const t0 = Date.now();
  if (opt("--times")) {
    fs.mkdirSync(path.join(__dirname, "build/stills"), { recursive: true });
    for (const s of opt("--times").split(",")) {
      await page.evaluate((t) => window.renderAt(t), +s);
      await page.screenshot({ path: path.join(__dirname, `build/stills/t_${(+s).toFixed(2)}.jpg`), type: "jpeg", quality: 90 });
    }
  } else {
    const from = +opt("--from", 1), to = +opt("--to", N);
    const out = opt("--out", "build/gfx.mp4");
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
    for (let f = from; f <= to; f++) {
      await page.evaluate((t) => window.renderAt(t), (f - 1) / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (f % 60 === 0) console.log(`${f}/${to}  ${((Date.now() - t0) / (f - from + 1)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  }
  await browser.close();
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})();
