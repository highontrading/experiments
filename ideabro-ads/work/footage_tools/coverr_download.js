// Use Coverr's own Download button on a video page (normal user flow).
// Usage: node coverr_download.js PAGE_URL OUT_DIR
const { chromium } = require('playwright');
(async () => {
  const [url, outDir] = [process.argv[2], process.argv[3]];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const btns = await page.$$eval('button, a', els => els.map(e => (e.innerText || '').trim()).filter(t => /download/i.test(t)).slice(0, 10));
  console.log('buttons:', JSON.stringify(btns));
  const btn = page.getByRole('button', { name: /download/i }).first();
  try {
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      btn.click(),
    ]);
    const p = require('path').join(outDir, dl.suggestedFilename());
    await dl.saveAs(p);
    console.log('saved', p);
  } catch (e) {
    console.log('no direct download:', e.message.split('\n')[0]);
    await page.waitForTimeout(2000);
    const txt = (await page.evaluate(() => document.body.innerText)).slice(0, 0);
    const opts = await page.$$eval('[role=menu] *, [role=dialog] *', els => els.map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 15));
    console.log('menu/dialog:', JSON.stringify([...new Set(opts)]).slice(0, 600));
    await page.screenshot({ path: require('path').join(outDir, 'coverr_dl_state.png') });
  }
  await browser.close();
})();
