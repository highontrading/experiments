// Render the "Raw vs Edited" comparison reel.
//   node compare/render.js                 -> build/compare/frames/f00001.png ...
//   node compare/render.js --frames 1,30   -> stills only
// Needs build/compare/raw/*.jpg and build/compare/edit/*.jpg (see compare/make.sh).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(__dirname, "..");
const count = (d) => fs.readdirSync(path.join(root, "build/compare", d)).filter((f) => f.endsWith(".jpg")).length;
const RAW_N = count("raw"), EDIT_N = count("edit"), FPS = 30;
const out = path.join(root, "build/compare/frames");

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  await page.goto("file://" + path.join(__dirname, "compare.html"));
  await page.evaluate(([r, e]) => { window.RAW_N = r; window.EDIT_N = e; return document.fonts.ready; }, [RAW_N, EDIT_N]);
  const frames = opt("--frames") ? opt("--frames").split(",").map(Number) : Array.from({ length: EDIT_N }, (_, i) => i + 1);
  const t0 = Date.now();
  for (const f of frames) {
    await page.evaluate(([f, fps]) => window.frameAt(f, fps), [f, FPS]);
    await page.screenshot({ path: path.join(out, `f${String(f).padStart(5, "0")}.png`) });
  }
  console.log(`${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await browser.close();
})();
