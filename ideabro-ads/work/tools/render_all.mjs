import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, getCompositions} from '@remotion/renderer';
import fs from 'fs';
import {execFileSync} from 'child_process';
const only = process.argv.slice(2);
const browserExecutable = fs.readFileSync('work/browser_path.txt','utf8').trim();
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const comps = await getCompositions(serveUrl, {browserExecutable});
for (const c of comps) {
  if (only.length && !only.some((o) => c.id.startsWith(o))) continue;
  const raw = `out/raw/${c.id}.mp4`, fin = `out/final/${c.id}.mp4`;
  const t0 = Date.now();
  await renderMedia({serveUrl, composition: c, codec: 'h264', crf: 18, outputLocation: raw, browserExecutable, concurrency: 4, audioCodec: 'aac', audioBitrate: '256k', logLevel: 'error'});
  // two-pass loudnorm to -14 LUFS / -1 dBTP
  const r = execFileSync('bash', ['-c', `ffmpeg -hide_banner -i "${raw}" -af loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`], {encoding: 'utf8'});
  const js = JSON.parse(r);
  const af = `loudnorm=I=-14:TP=-1.2:LRA=9:measured_I=${js.input_i}:measured_TP=${js.input_tp}:measured_LRA=${js.input_lra}:measured_thresh=${js.input_thresh}:offset=${js.target_offset}:linear=true`;
  execFileSync('ffmpeg', ['-v','error','-y','-i',raw,'-c:v','copy','-af',af,'-ar','48000','-c:a','aac','-b:a','256k','-movflags','+faststart',fin]);
  console.log(`done ${c.id} in ${((Date.now()-t0)/1000).toFixed(0)}s (input ${js.input_i} LUFS)`);
}
