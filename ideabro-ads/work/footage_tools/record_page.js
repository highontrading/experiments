// Record the course page with Playwright video recording.
// Usage: node record_page.js SHOT OUT_DIR
//   SHOT: mob_scroll | mob_hero | mob_table | mob_curriculum | mob_pricing | desk_hero | desk_curriculum
// Writes OUT_DIR/<SHOT>.webm and OUT_DIR/<SHOT>.json ({start, end} seconds into the webm to keep).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'https://community.ideabrostudio.com/courses/ai-and-advertising';

const shot = process.argv[2], outDir = process.argv[3];
const mobile = shot.startsWith('mob');
const W = mobile ? 1080 : 1920, H = mobile ? 1920 : 1080;

async function smoothScrollTo(page, target, ms) {
  await page.evaluate(([target, ms]) => new Promise(res => {
    const y0 = window.scrollY, t0 = performance.now();
    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, y0 + (target - y0) * ease(t));
      if (t < 1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  }), [target, ms]);
}

async function linearScroll(page, target, ms) {
  // gentle ease-in/out only at the very ends, linear in between
  await page.evaluate(([target, ms]) => new Promise(res => {
    const y0 = window.scrollY, t0 = performance.now();
    const e = 0.08;
    const f = t => {
      // trapezoid velocity profile integrated
      const vmax = 1 / (1 - e);
      if (t < e) return vmax * t * t / (2 * e);
      if (t > 1 - e) { const u = 1 - t; return 1 - vmax * u * u / (2 * e); }
      return vmax * (t - e / 2);
    };
    function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, y0 + (target - y0) * f(t));
      if (t < 1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  }), [target, ms]);
}

async function yOf(page, selector, text) {
  return page.evaluate(([selector, text]) => {
    const els = Array.from(document.querySelectorAll(selector));
    const el = els.find(e => (e.innerText || '').replace(/\s+/g, ' ').includes(text));
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: b.top + window.scrollY, h: b.height, bottom: b.bottom + window.scrollY };
  }, [selector, text]);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
    recordVideo: { dir: outDir, size: { width: W, height: H } },
  });
  const tStart = Date.now();
  const page = await ctx.newPage();
  const now = () => (Date.now() - tStart) / 1000;
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(1500);
  // warm lazy-loaded content
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += H / 2) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(200); }
  await page.waitForTimeout(800);
  const maxY = (await page.evaluate(() => document.documentElement.scrollHeight)) - H;

  let start, end;
  const park = async (y, secs, during) => {
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, Math.min(maxY, y)));
    await page.waitForTimeout(1500);
    start = now();
    if (during) await during(); else await page.waitForTimeout(secs * 1000);
    end = now();
  };

  if (shot === 'mob_scroll') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    start = now();
    await page.waitForTimeout(1000);
    await linearScroll(page, maxY, 23000);
    await page.waitForTimeout(1000);
    end = now();
  } else if (shot === 'mob_hero' || shot === 'desk_hero') {
    await park(0, 7);
  } else if (shot === 'mob_table') {
    const h = await yOf(page, 'h2', 'The shoot is optional now');
    // put the table section into frame: heading near top with some margin
    await park(h.top - 140, 7);
  } else if (shot === 'mob_curriculum' || shot === 'desk_curriculum') {
    const h = await yOf(page, 'h2', 'What you’ll learn');
    await park(h.top - (mobile ? 120 : 60), 0, async () => {
      await page.waitForTimeout(1500);
      // expand module 03 (AI product photography)
      const btn = page.locator('button', { hasText: 'AI product photography' }).first();
      await btn.click().catch(e => console.log('click', e.message));
      await page.waitForTimeout(mobile ? 6500 : 3000);
      if (!mobile) {
        await smoothScrollTo(page, Math.min(maxY, (await yOf(page, 'button', 'AI product photography')).top - 300), 2500);
        await page.waitForTimeout(1500);
      }
    });
  } else if (shot === 'mob_pricing') {
    const h = await yOf(page, 'h3', 'AI & Advertising');
    const card = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('h3')).find(e => e.innerText.trim() === 'AI & Advertising');
      let c = el; for (let i = 0; i < 6 && c.parentElement; i++) { c = c.parentElement; if (c.getBoundingClientRect().height > 500) break; }
      const b = c.getBoundingClientRect(); return { top: b.top + window.scrollY, h: b.height };
    });
    console.log('card', JSON.stringify(card));
    await park(card.top + card.h / 2 - H / 2, 7);
  }
  const vpath = await page.video().path();
  await ctx.close();
  await browser.close();
  const dst = path.join(outDir, shot + '.webm');
  fs.renameSync(vpath, dst);
  fs.writeFileSync(path.join(outDir, shot + '.json'), JSON.stringify({ start, end, W, H }));
  console.log(shot, start.toFixed(2), end.toFixed(2));
})();
