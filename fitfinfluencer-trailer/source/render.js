const { chromium } = require('playwright');
const path=require('path');
(async () => {
  const [,, out, fps, start, end, step] = process.argv;
  const b = await chromium.launch({args:['--disable-gpu-vsync']});
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname,'trailer/index.html'));
  await p.evaluate(() => window.ready);
  await p.evaluate(() => window.render(0.2)); await p.waitForTimeout(800);
  const t0=Date.now();
  for (let f=+start; f<+end; f+=+step) {
    await p.evaluate(t => window.render(t), f/(+fps));
    await p.screenshot({ path: `${out}/${String(f).padStart(5,'0')}.jpg`, quality: 95, type:'jpeg' });
  }
  console.log('done', start, (Date.now()-t0)/1000);
  await b.close();
})();
