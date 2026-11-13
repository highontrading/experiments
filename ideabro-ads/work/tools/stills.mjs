import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
// usage: node stills.mjs <outDir> <compId:t1,t2,...> ...
const [,, outDir, ...specs] = process.argv;
const browserExecutable = fs.readFileSync('work/browser_path.txt','utf8').trim();
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
for (const sp of specs) {
  const [id, ts] = sp.split(':');
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  for (const tt of ts.split(',')) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(tt) * 30));
    await renderStill({serveUrl, composition, frame, output: `${outDir}/${id}_${tt}.jpg`, imageFormat: 'jpeg', jpegQuality: 75, browserExecutable, scale: 0.33});
  }
  console.log('ok', id);
}
