// Frame sequences of real site interactions. usage: node capture_seq.js OUTDIR job...
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
async function dismiss(page) {
  for (const t of ['Accept all', 'Accept All', 'Accept All Cookies', 'Accept', 'Allow all', 'Got it', 'OK, got it', 'Ok, got it']) {
    const b = page.getByRole('button', { name: t, exact: true });
    if (await b.count().catch(() => 0)) { await b.first().click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(700); }
  }
}
const jobs = {
  async chatgpt_type(page, dir) {
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000); await dismiss(page);
    const box = page.locator('#prompt-textarea, [contenteditable="true"], textarea').first();
    await box.click({ timeout: 10000 });
    const text = 'Create a 30-second cinematic ad for a new coffee brand. Target Gen Z. Give me 5 hooks, a script and shot list.';
    let i = 0; await page.screenshot({ path: `${dir}/${String(i++).padStart(4, '0')}.png` });
    for (const ch of text) { await page.keyboard.type(ch); await page.screenshot({ path: `${dir}/${String(i++).padStart(4, '0')}.png` }); }
  },
  async midjourney_scroll(page, dir) {
    await page.goto('https://www.midjourney.com/explore', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000); await dismiss(page);
    await page.mouse.move(1100, 600);
    for (let i = 0; i < 70; i++) { await page.mouse.wheel(0, 18); await page.waitForTimeout(60); await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` }); }
  },
  async metalib_scroll(page, dir) {
    await page.goto('https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=AI%20generated%20ad&search_type=keyword_unordered', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000); await dismiss(page);
    for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 14); await page.waitForTimeout(50); await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` }); }
  },
  async veo_hero(page, dir) {
    await page.goto('https://deepmind.google/models/veo/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000); await dismiss(page);
    for (let i = 0; i < 50; i++) { await page.waitForTimeout(40); await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` }); }
  },
  async higgsfield_scroll(page, dir) {
    await page.goto('https://higgsfield.ai/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000); await dismiss(page);
    for (let i = 0; i < 50; i++) { await page.mouse.wheel(0, 16); await page.waitForTimeout(50); await page.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` }); }
  },
};
(async () => {
  const browser = await chromium.launch();
  for (const name of process.argv.slice(3)) {
    const dir = `${out}/${name}`; fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: 'dark', userAgent: UA, locale: 'en-US' });
    const page = await ctx.newPage();
    const t0 = Date.now();
    try { await jobs[name](page, dir); console.log('ok', name, fs.readdirSync(dir).length, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); }
    await ctx.close();
  }
  await browser.close();
})();
