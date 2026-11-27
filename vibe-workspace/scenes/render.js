// node render.js <scene> <duration_s> <out_dir> [fps=30] [--stills t1,t2,...]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [scene, dur, out, fpsArg] = process.argv.slice(2);
  const fps = Number(fpsArg || 30);
  const stillsIdx = process.argv.indexOf('--stills');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'stage.html'));
  await page.evaluate(() => document.fonts.ready);
  const times = stillsIdx > 0 ? process.argv[stillsIdx + 1].split(',').map(Number)
    : Array.from({ length: Math.round(Number(dur) * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate(([s, t]) => window.renderAt(s, t), [scene, times[i]]);
    await page.screenshot({ path: path.join(out, (stillsIdx > 0 ? 's_' : 'f_') + String(i).padStart(4, '0') + '.png') });
  }
  await browser.close();
})();
