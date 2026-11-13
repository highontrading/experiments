// Render a Coverr search page and list result video links + preview mp4s.
// Usage: node coverr_search.js "query" OUT.json
const { chromium } = require('playwright');
(async () => {
  const q = process.argv[2], out = process.argv[3];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const mp4s = new Set();
  page.on('request', r => { const u = r.url(); if (u.includes('.mp4')) mp4s.add(u); });
  await page.goto('https://coverr.co/s?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 1500); await page.waitForTimeout(800); }
  const cards = await page.$$eval('a[href^="/videos/"]', as => as.map(a => ({
    href: a.getAttribute('href'),
    text: (a.innerText || '').trim().slice(0, 80),
    html: a.innerHTML.toLowerCase().includes('premium'),
    vids: Array.from(a.querySelectorAll('video, source')).map(v => v.src || v.getAttribute('src')).filter(Boolean),
    imgs: Array.from(a.querySelectorAll('img')).map(v => v.src).slice(0, 1),
  })));
  require('fs').writeFileSync(out, JSON.stringify({ cards, mp4s: [...mp4s] }, null, 1));
  await browser.close();
})();
