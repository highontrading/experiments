import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as SC from './scenes.js';
import { W, H, drawScrim, drawHeadlines, drawHandle, drawIllus, drawSource, drawCard, drawFloat, drawEnd } from './overlay.js';

const FPS = 30, END_HOLD = 2.8;
const qs = new URLSearchParams(location.search), VID = qs.get('v');
for (const [w, f] of [['500', 'inter-latin-500'], ['600', 'inter-latin-600'], ['700', 'inter-latin-700'], ['800', 'inter-latin-800'], ['900', 'inter-latin-900']]) { const ff = new FontFace('Inter', `url(fonts/${f}-normal.woff2)`, { weight: w }); await ff.load(); document.fonts.add(ff); }
for (const [w, f] of [['500', 'jetbrains-mono-latin-500'], ['700', 'jetbrains-mono-latin-700']]) { const ff = new FontFace('JetBrains Mono', `url(fonts/${f}-normal.woff2)`, { weight: w }); await ff.load(); document.fonts.add(ff); }

const TL = await (await fetch(`../build/${VID}_timeline.json`)).json();
const SHOTS = (await import(`../shots/${VID}.js`)).default(TL);
const beats = TL.beats, TOTAL = TL.duration + END_HOLD;
// shot start times
SHOTS.forEach((s, i) => { s.start = s.at ?? (i === 0 ? 0 : beats[s.from].t0 - 0.06); });
SHOTS.forEach((s, i) => { s.t1 = i < SHOTS.length - 1 ? SHOTS[i + 1].start : TOTAL; s.dur = s.t1 - s.start; });

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const built = {};
const getScene = (n) => (built[n] ??= SC[n](env));
for (const s of SHOTS) if (s.scene) getScene(s.scene);
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 300);

const composer = new EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(W, H);
const rpass = new RenderPass(new THREE.Scene(), camera); composer.addPass(rpass); composer.addPass(new OutputPass());
const FX = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, tint: { value: new THREE.Color('#8a0f0a') }, tintAmt: { value: 0 }, rgb: { value: 0 }, flash: { value: 0 }, blackA: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, tintAmt, rgb, flash, blackA; uniform vec3 tint; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv; float band = step(0.5, h(vec2(floor(uv.y*40.0), floor(time*24.0)))) * rgb;
      uv.x += band * 0.02 * (h(vec2(floor(uv.y*40.0), time)) - 0.5);
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(rgb*0.012,0.0)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - vec2(rgb*0.012,0.0)).b);
      float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(c, vec3(l)*tint*2.4 + c*0.25, tintAmt);
      vec2 d = vUv - 0.5; c *= 1.0 - 0.55 * dot(d*vec2(0.9,1.1), d*vec2(0.9,1.1));
      c += (h(vUv*vec2(1080.0,1920.0) + fract(time*7.0)*100.0) - 0.5) * 0.045;
      c = mix(c, vec3(1.0), flash); c = mix(c, vec3(0.0), blackA);
      gl_FragColor = vec4(c, 1.0); }`,
});
composer.addPass(FX);

const oc = document.createElement('canvas'); oc.width = W; oc.height = H; const og = oc.getContext('2d');
const otex = new THREE.CanvasTexture(oc); otex.colorSpace = THREE.SRGBColorSpace;
const oscene = new THREE.Scene(), ocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
oscene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: otex, transparent: true, toneMapped: false, depthTest: false })));

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const inOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const A = (v) => new THREE.Vector3(...v);
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

function render(t) {
  t = clamp(t, 0, TOTAL - 1 / FPS);
  let si = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].start) si = i;
  const S = SHOTS[si], lt = t - S.start, P = S.P ?? {};
  og.clearRect(0, 0, W, H);
  let blackA = 0;
  if (S.scene) {
    const sc = built[S.scene]; sc.update(lt, S.dur, P);
    const c = { ...sc.cam, ...(S.cam ?? {}) }, k = (c.ease ?? inOut)(clamp(lt / S.dur));
    camera.position.copy(A(c.p0)).lerp(A(c.p1), k); tmp.copy(A(c.l0)).lerp(A(c.l1), k);
    camera.position.x += 0.03 * Math.sin(t * 0.7); camera.position.y += 0.02 * Math.sin(t * 0.9);
    camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(tmp);
    rpass.scene = sc.scene;
  } else { rpass.scene = built.__black ??= Object.assign(new THREE.Scene(), { background: new THREE.Color('#000') }); }
  const fx = S.fx ?? {};
  FX.uniforms.time.value = t; FX.uniforms.tintAmt.value = fx.red ? fx.red(lt) : 0; FX.uniforms.rgb.value = fx.glitch ? fx.glitch(lt) : 0;
  FX.uniforms.flash.value = fx.flash ? fx.flash(lt) : 0;
  if (S.end) blackA = clamp(lt / 0.35);
  FX.uniforms.blackA.value = blackA;
  composer.render();
  // overlay
  if (S.end) drawEnd(og, lt);
  else {
    drawScrim(og); drawHeadlines(og, beats, t);
    drawHandle(og);
    if (S.scene && !S.real) drawIllus(og, clamp(lt / 0.2), S.illusY);
    for (const o of S.ov ?? []) {
      const a = o.atT != null ? o.atT - S.start : (o.at ?? 0), b = o.untilT != null ? o.untilT - S.start : (o.until ?? S.dur); if (lt < a || lt > b) continue;
      if (o.type === 'float') { const sc = built[S.scene]; const p = (typeof o.anchor === 'string' ? sc.anchors[o.anchor] : A(o.anchor)); tmp2.copy(p); if (o.off) tmp2.add(A(o.off)); tmp2.project(camera);
        drawFloat(og, o, lt - a, b - a, (tmp2.x + 1) / 2 * W, (1 - tmp2.y) / 2 * H); }
      else if (o.type === 'source') drawSource(og, o.text, clamp((lt - a) / 0.25) * (1 - clamp((lt - (b - 0.2)) / 0.2)), o.y);
      else drawCard(og, o, lt - a, b - a);
    }
  }
  otex.needsUpdate = true;
  renderer.autoClear = false; renderer.render(oscene, ocam); renderer.autoClear = true;
}

// audio cue list for the mixer: whoosh on cuts, pops on labels/cards, impacts on effects
window.getCues = () => {
  const cues = [];
  SHOTS.forEach((s, i) => {
    if (i > 0) cues.push({ t: s.start, s: s.cut ?? 'whoosh', g: 0.5 });
    for (const o of s.ov ?? []) if (o.type !== 'source') cues.push({ t: o.atT ?? s.start + (o.at ?? 0), s: o.type === 'float' ? 'pop' : 'tick', g: 0.45 });
    for (const c of s.sfx ?? []) cues.push({ ...c, t: s.start + c.t });
    if (s.end) cues.push({ t: s.start + 0.4, s: 'chime', g: 0.7 });
  });
  return cues.sort((a, b) => a.t - b.t);
};
window.__render = render; window.FPS = FPS; window.TOTAL = TOTAL; window.__ready = true;
if (!qs.has('capture')) { const st = performance.now(); const loop = (n) => { render((n - st) / 1000 % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
else render(0);
function fit() { const k = Math.min(innerWidth / W, innerHeight / H); document.getElementById('stage').style.transform = `translate(${(innerWidth - W * k) / 2}px,${(innerHeight - H * k) / 2}px) scale(${k})`; }
addEventListener('resize', fit); fit();
