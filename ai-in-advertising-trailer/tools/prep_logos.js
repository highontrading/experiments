// Render brand SVG icons to 360x360 transparent PNGs in brand colours (gradient for Gemini/Meta).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const L = [['openai', '#ffffff'], ['claude', '#D97757'], ['googlegemini', 'url(#g1)'], ['meta', 'url(#g2)'], ['elevenlabs', '#ffffff'], ['googleads', '#FBBC04']];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 360 } });
  for (const [n, fill] of L) {
    let svg = fs.readFileSync(path.join(dir, 'logos', n + '.svg'), 'utf8');
    svg = svg.replace('<svg ', '<svg width="300" height="300" ').replace(/<path /g, `<path fill="${fill}" `)
      .replace(/<title>.*?<\/title>/, '<defs><linearGradient id="g1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3C79E6"/><stop offset=".55" stop-color="#8E7CFF"/><stop offset="1" stop-color="#D96570"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0064E1"/><stop offset="1" stop-color="#0082FB"/></linearGradient></defs>');
    await p.setContent(`<html><body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:360px;height:360px">${svg}</body></html>`);
    await p.screenshot({ path: path.join(dir, 'logos_png', n + '.png'), omitBackground: true }); console.log('ok', n);
  }
  await b.close();
})();
