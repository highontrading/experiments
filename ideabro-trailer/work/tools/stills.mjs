import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const [,, comp, ptsFile, outDir] = process.argv;
const browserExecutable = fs.readFileSync('work/browser_path.txt','utf8').trim();
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
const pts = fs.readFileSync(ptsFile,'utf8').trim().split('\n').map(l=>l.split(' '));
for (const [name, frame] of pts) {
  await renderStill({serveUrl, composition, frame: Number(frame), output: `${outDir}/${comp}_${name}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, scale: 0.5});
  console.log('ok', name, frame);
}
