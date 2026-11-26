// Render the motion-graphics layer of an edit plan to transparent PNGs, one per frame.
//   node engine/render.js plans/demo.json                -> build/<plan>/f00001.png ...
//   node engine/render.js plans/demo.json --times 1,2.5  -> build/<plan>/stills/t1.00.png ...
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const planPath = path.resolve(args[0]);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const name = path.basename(planPath, ".json");
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "build", name);
const fps = plan.fps || 30;

(async () => {
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  await page.goto("file://" + path.join(__dirname, "stage.html"));
  await page.evaluate(([p, base]) => window.STYLE.boot(p, base), [plan, "file://" + root + "/"]);

  let jobs;
  if (opt("--times")) {
    fs.mkdirSync(path.join(outDir, "stills"), { recursive: true });
    jobs = opt("--times").split(",").map(Number).map((t) => ({ t, file: path.join(outDir, "stills", `t${t.toFixed(2)}.png`) }));
  } else {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const n = Math.round(plan.dur * fps);
    jobs = Array.from({ length: n }, (_, f) => ({ t: f / fps, file: path.join(outDir, `f${String(f + 1).padStart(5, "0")}.png`) }));
  }
  const t0 = Date.now();
  for (const j of jobs) {
    await page.evaluate((t) => window.renderAt(t), j.t);
    await page.screenshot({ path: j.file, omitBackground: true });
  }
  console.log(`${name}: ${jobs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${path.relative(root, outDir)}`);
  await browser.close();
})();
