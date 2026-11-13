// usage: node capture.js OUTDIR name=url ...   -> OUTDIR/name_view.png (1920x1080 @1.5x) and name_full.png (up to 5000 css px tall)
const { chromium } = require('playwright');
const out = process.argv[2];
const jobs = process.argv.slice(3).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5, colorScheme: 'dark',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale: 'en-US' });
  for (const [name, url] of jobs) {
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5000);
      for (const t of ['Accept all', 'Accept All', 'Accept', 'I agree', 'Agree', 'Allow all', 'Allow all cookies', 'Got it', 'OK', 'Reject all', 'Decline optional cookies', 'Only allow essential cookies']) {
        const b = page.getByRole('button', { name: t, exact: true });
        if (await b.count().catch(() => 0)) { await b.first().click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(800); break; }
      }
      await page.screenshot({ path: `${out}/${name}_view.png` });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      // trigger lazy loading
      for (let y = 0; y < Math.min(h, 5000); y += 700) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(250); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
      await page.screenshot({ path: `${out}/${name}_full.png`, fullPage: true, clip: { x: 0, y: 0, width: 1920, height: Math.min(h, 5000) } });
      console.log('ok', name, 'title=', (await page.title()).slice(0, 70), 'h=', h);
    } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); }
    await page.close();
  }
  await browser.close();
})();
