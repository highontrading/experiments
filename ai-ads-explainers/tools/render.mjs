// Render frames of an explainer with headless Chromium.
//   node tools/render.mjs <video_id> frames <from> <to> <outdir>     -> PNG frames [from, to)
//   node tools/render.mjs <video_id> stills <t1,t2,...> <outdir>     -> PNG stills at times (s)
//   node tools/render.mjs <video_id> info <outfile.json>             -> { total, fps, cues }
// THREE_DIR (optional): local copy of the three@0.160.0 package, used when cdn.jsdelivr.net is unreachable.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(process.env.PW_FROM || '/opt/node-tools/node_modules/');
const { chromium } = req('playwright');
const [vid, mode, a, b, outdir] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = createServer((q, r) => { const p = join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
if (process.env.THREE_DIR) await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', (route) => {
  const p = new URL(route.request().url()).pathname.replace('/npm/three@0.160.0/', ''); route.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(join(process.env.THREE_DIR, p)) }); });
await page.goto(`http://127.0.0.1:${port}/engine/index.html?v=${vid}&capture`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const { TOTAL, FPS } = await page.evaluate(() => ({ TOTAL: window.TOTAL, FPS: window.FPS }));
const grab = (t) => page.evaluate((t) => { window.__render(t); return document.querySelector('canvas').toDataURL('image/png'); }, t);
const save = (file, url) => writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
if (mode === 'info') { writeFileSync(a, JSON.stringify({ total: TOTAL, fps: FPS, frames: Math.round(TOTAL * FPS), cues: await page.evaluate(() => window.getCues()) }, null, 1)); }
else if (mode === 'stills') { mkdirSync(b, { recursive: true }); for (const t of a.split(',').map(Number)) { save(join(b, `t${t.toFixed(2).padStart(6, '0')}.png`), await grab(t)); } }
else if (mode === 'frames') {
  mkdirSync(outdir, { recursive: true }); const N = Math.round(TOTAL * FPS), from = +a, to = Math.min(+b, N), t0 = Date.now();
  for (let i = from; i < to; i++) { save(join(outdir, String(i).padStart(5, '0') + '.png'), await grab(i / FPS)); if ((i - from) % 60 === 0) console.log(`${vid} frame ${i}/${to} ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
}
else if (mode === 'video') {   // frames [a, b) piped straight into an intermediate H.264 file (outdir = .mp4 path)
  const N = Math.round(TOTAL * FPS), from = +a, to = Math.min(+b, N), t0 = Date.now();
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', outdir], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = from; i < to; i++) {
    const url = await page.evaluate((t) => { window.__render(t); return document.querySelector('canvas').toDataURL('image/jpeg', 0.96); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((i - from) % 90 === 0) console.log(`${vid} ${i}/${to} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await browser.close(); srv.close();
