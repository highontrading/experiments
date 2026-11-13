// Probe the course page: height, section headings with y positions, clickable accordion candidates.
// Usage: node page_probe.js WIDTH HEIGHT MOBILE(0/1) OUT_PREFIX
const { chromium } = require('playwright');
const URL = 'https://community.ideabrostudio.com/courses/ai-and-advertising';
(async () => {
  const [w, h, mob, out] = [parseInt(process.argv[2]), parseInt(process.argv[3]), process.argv[4] === '1', process.argv[5]];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await page.waitForTimeout(3000);
  // trigger lazy content
  const H0 = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H0; y += h / 2) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(250); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const r = [];
    document.querySelectorAll('h1,h2,h3,h4,button,summary,[aria-expanded]').forEach(el => {
      const b = el.getBoundingClientRect();
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 90);
      if (t) r.push({ tag: el.tagName, ae: el.getAttribute('aria-expanded'), y: Math.round(b.top + window.scrollY), h: Math.round(b.height), t });
    });
    return { H: document.documentElement.scrollHeight, title: document.title, els: r };
  });
  console.log(JSON.stringify(info, null, 0).slice(0, 20000));
  await page.screenshot({ path: out + '_full.png', fullPage: true });
  await browser.close();
})();
