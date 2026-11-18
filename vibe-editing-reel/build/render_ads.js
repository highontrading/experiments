// node render.js DATA_JSON OUT_DIR [--from a --to b] [--frames 1,50,300] [--shard k/n]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const data = JSON.parse(fs.readFileSync(args[0]));
const out = args[1]; fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exit(1); });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto('file://' + path.join(__dirname, process.env.STAGE || 'stage.html'));
  await page.evaluate(d => window.init(d), data);
  let frames;
  if (opt('--frames')) frames = opt('--frames').split(',').map(Number);
  else { const a = +opt('--from', 0), b = +opt('--to', data.frames.length - 1); frames = []; for (let f = a; f <= b; f++) frames.push(f); }
  const sh = opt('--shard'); if (sh) { const [k, n] = sh.split('/').map(Number); frames = frames.filter(f => f % n === k); }
  const t0 = Date.now(); const canvas = await page.$('canvas');
  for (const [j, f] of frames.entries()) {
    await page.evaluate(i => window.renderAt(i), f);
    await canvas.screenshot({ path: path.join(out, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
    if (j % 50 === 0) console.log(`${j + 1}/${frames.length} f=${f} ${((Date.now() - t0) / (j + 1)).toFixed(0)} ms/frame`);
  }
  await browser.close(); console.log('done', frames.length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
})();
