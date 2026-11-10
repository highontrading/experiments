// Turns an animation HTML file into an MP4, frame-exact, with its sound.
//   node scripts/render.mjs path/to/animation.html [loops=1]
// Needs Node 22+, ffmpeg, and once: npm install && npx playwright install chromium
// Each frame is drawn by the file's own render(t) at an exact time, so nothing is dropped or
// smeared the way a screen recording would. The sound is mixed offline from the same cue list.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const req = createRequire(process.env.PW_FROM || join(process.cwd(), 'package.json'));
const { chromium } = req('playwright');
const file = resolve(process.argv[2] || ''); const loops = Number(process.argv[3] || 1);
if (!process.argv[2]) { console.error('usage: node scripts/render.mjs animation.html [loops]'); process.exit(1); }
const work = join(dirname(file), '.' + basename(file, '.html') + '-frames');
rmSync(work, { recursive: true, force: true }); mkdirSync(work, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(pathToFileURL(file).href + '?capture');
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const { LOOP, FPS } = await page.evaluate(() => ({ LOOP: window.LOOP, FPS: window.FPS }));
const N = Math.round(LOOP * FPS * loops);
// sound first: a bad cue fails in a second, not after every frame
const wav = await page.evaluate((s) => window.renderAudio(s), LOOP * loops);
writeFileSync(join(work, 'sound.wav'), Buffer.from(wav, 'base64'));
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((t) => { window.__render(t); return document.querySelector('canvas').toDataURL('image/png'); }, i / FPS);
  writeFileSync(join(work, String(i).padStart(5, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  if (i % FPS === 0) process.stdout.write(`\rframe ${i}/${N}`);
}
await browser.close();
const out = file.replace(/\.html$/, '.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(work, '%05d.png'), '-i', join(work, 'sound.wav'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
rmSync(work, { recursive: true, force: true });
console.log(`\nsaved ${out}`);
