import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import fonts from './fonts.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const LEAD = 4 / FPS; // captions land a few frames before the word is heard

// ---------- math ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = (p: number) => 1 - Math.pow(1 - p, 3);
export const ei = (p: number) => p * p * p;
export const eio = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const back = (p: number) => {
  const c1 = 1.7, c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const useT = () => {
  const f = useCurrentFrame();
  return {f, t: f / FPS};
};

// ---------- fonts ----------
export const F = {
  inter: "'Inter', 'Inter Tight', Arial, sans-serif",
  tight: "'Inter Tight', 'Inter', Arial, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  anton: "'Anton', 'Bebas Neue', Impact, sans-serif",
  bebas: "'Bebas Neue', 'Anton', Impact, sans-serif",
  mont: "'Montserrat', 'Inter', Arial, sans-serif",
  marker: "'Permanent Marker', 'Comic Sans MS', cursive",
  spacemono: "'Space Mono', 'JetBrains Mono', monospace",
  corm: "'Cormorant Garamond', Georgia, serif",
  archivo: "'Archivo Black', 'Anton', Arial, sans-serif",
  poppins: "'Poppins', 'Inter', Arial, sans-serif",
};
export const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      (fonts as string[][]).map(([fam, w, st, file]) => {
        const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: w, style: st});
        return ff.load().then((x) => (document as any).fonts.add(x)).catch(() => null);
      })
    ).then(() => continueRender(h));
  }, [h]);
};

// ---------- media ----------
type MediaProps = {src: string; at?: number; from?: number; style?: React.CSSProperties; fit?: 'cover' | 'contain'; rate?: number};
export const Media: React.FC<MediaProps> = ({src, at = 0, from = 0, style, fit = 'cover', rate = 1}) => {
  const s: React.CSSProperties = {width: '100%', height: '100%', objectFit: fit, ...style};
  if (src.endsWith('.mp4')) {
    return (
      <Sequence from={Math.round(at * FPS)} layout="none">
        <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(from * FPS)} playbackRate={rate} style={s} />
      </Sequence>
    );
  }
  return <Img src={staticFile(src)} style={s} />;
};

// full-frame media with slow push (ken burns)
export const KB: React.FC<{src: string; a: number; b: number; from?: number; z0?: number; z1?: number; x?: number; y?: number; style?: React.CSSProperties}> = ({src, a, b, from = 0, z0 = 1.04, z1 = 1.14, x = 0, y = 0, style}) => {
  const {t} = useT();
  const p = prog(t, a, b);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${lerp(z0, z1, p)}) translate(${x * p}px, ${y * p}px)`}}>
        <Media src={src} at={a} from={from} style={style} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// show children only within [a,b)
export const Win: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const {t} = useT();
  return t >= a && t < b ? <>{children}</> : null;
};

export const Grain: React.FC<{o?: number}> = ({o = 0.07}) => {
  const {f} = useT();
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id={`gr${f}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={f % 89} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#gr${f})`} />
    </svg>
  );
};
export const Vignette: React.FC<{o?: number}> = ({o = 0.55}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${o}) 100%)`, pointerEvents: 'none'}} />
);
export const Shade: React.FC<{top?: number; bottom?: number}> = ({top = 0, bottom = 0}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(to bottom, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,${bottom}) 100%)`}} />
);

// ---------- audio ----------
export type Word = {w: string; s: number; e: number};
export const voWords = (id: string, at: number, data: any): Word[] => data.words.map((w: any) => ({w: w.w, s: w.s + at, e: w.e + at}));
export const Vo: React.FC<{id: string; at: number; vol?: number}> = ({id, at, vol = 1}) => (
  <Sequence from={Math.round(at * FPS)} layout="none">
    <Audio src={staticFile(`vo/${id}.mp3`)} volume={vol} />
  </Sequence>
);
export const duck = (t: number, words: Word[], low = 0.32) => {
  let d = 1;
  for (const w of words) {
    const a = w.s - 0.12, b = w.e + 0.25;
    if (t >= a - 0.15 && t <= b + 0.3) {
      const k = t < a ? (t - (a - 0.15)) / 0.15 : t > b ? 1 - (t - b) / 0.3 : 1;
      d = Math.min(d, lerp(1, low, clamp(k)));
    }
  }
  return d;
};
export const Music: React.FC<{src: string; at?: number; offset?: number; vol?: number; words?: Word[]; end?: number; fadeIn?: number; fadeOut?: number}> = ({src, at = 0, offset = 0, vol = 0.5, words = [], end = 999, fadeIn = 0.05, fadeOut = 0.4}) => (
  <Sequence from={Math.round(at * FPS)} layout="none">
    <Audio
      src={staticFile(`music/${src}`)}
      startFrom={Math.round(offset * FPS)}
      volume={(fr) => {
        const t = fr / FPS + at;
        const fi = clamp((t - at) / fadeIn);
        const fo = clamp((end - t) / fadeOut);
        return vol * fi * fo * duck(t, words);
      }}
    />
  </Sequence>
);
export const Sfx: React.FC<{n: string; at: number; vol?: number; rate?: number}> = ({n, at, vol = 0.6, rate = 1}) => (
  <Sequence from={Math.max(0, Math.round(at * FPS))} layout="none">
    <Audio src={staticFile(`sfx/${n}.mp3`)} volume={vol} playbackRate={rate} />
  </Sequence>
);

// ---------- caption paging ----------
export type Page = {words: Word[]; s: number; e: number};
export const paginate = (ws: Word[], maxChars = 16, hardBreak = true, tail = 0.5): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  for (const w of ws) {
    const len = cur.map((x) => x.w).join(' ').length + w.w.length + 1;
    if (cur.length && len > maxChars) flush();
    cur.push(w);
    if (hardBreak && /[.?!,:]$/.test(w.w) && cur.join('').length > 0) flush();
  }
  flush();
  for (let i = 0; i < pages.length; i++) pages[i].e = i + 1 < pages.length ? pages[i + 1].s : pages[i].e + tail;
  return pages;
};
const activePage = (pages: Page[], t: number) => pages.find((p) => t >= p.s - LEAD && t < p.e - LEAD);

// ---------- caption styles ----------
type CapProps = {words: Word[]; y?: number; maxChars?: number; size?: number; color?: string; accent?: string; tail?: number; align?: 'center' | 'left'};

// 1) Kinetic UGC: heavy uppercase, active word in accent, pop-in
export const CapKinetic: React.FC<CapProps> = ({words, y = 0.66, maxChars = 14, size = 78, accent = '#FFE14D', tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: H * y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: size, lineHeight: 1.06, textTransform: 'uppercase', letterSpacing: '-0.01em'}}>
      {p.words.map((w, i) => {
        const age = t - (w.s - LEAD);
        if (age < 0) return <span key={i} style={{opacity: 0, marginRight: '0.22em'}}>{w.w}</span>;
        const sc = age < 4 / FPS ? lerp(0.55, 1.12, back(age / (4 / FPS))) : lerp(1.12, 1, clamp((age - 4 / FPS) / (3 / FPS)));
        const on = t >= w.s - LEAD && t < w.e + 0.05;
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.22em', transform: `scale(${sc})`, color: on ? accent : '#fff', WebkitTextStroke: `${size * 0.1}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.45)'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// 2) Highlight: black text on yellow blocks, line by line
export const CapHighlight: React.FC<CapProps> = ({words, y = 0.7, maxChars = 18, size = 62, accent = '#FFE14D', color = '#0b0b0b', tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  const age = t - (p.s - LEAD);
  const wipe = eo(clamp(age / (5 / FPS)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: H * y, display: 'flex', justifyContent: 'center', transform: 'translateY(-50%)'}}>
      <div style={{background: accent, padding: '0.14em 0.36em 0.18em', clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, fontFamily: F.tight, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: W - 120, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
        {p.words.map((w, i) => (
          <span key={i} style={{opacity: t >= w.s - LEAD ? 1 : 0.35, marginRight: i < p.words.length - 1 ? '0.24em' : 0}}>{w.w}</span>
        ))}
      </div>
    </div>
  );
};

// 3) Boxed white bar (social native)
export const CapBoxed: React.FC<CapProps> = ({words, y = 0.7, maxChars = 22, size = 56, tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  const age = t - (p.s - LEAD);
  const sc = lerp(0.9, 1, back(clamp(age / (5 / FPS))));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: H * y, display: 'flex', justifyContent: 'center', transform: `translateY(-50%) scale(${sc})`}}>
      <div style={{background: '#fff', borderRadius: 22, padding: '0.32em 0.6em', fontFamily: F.tight, fontWeight: 700, fontSize: size, color: '#111', letterSpacing: '-0.015em', lineHeight: 1.15, maxWidth: W - 140, textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.28)'}}>
        {p.words.map((w, i) => (
          <span key={i} style={{marginRight: i < p.words.length - 1 ? '0.24em' : 0}}>{w.w}</span>
        ))}
      </div>
    </div>
  );
};

// 4) Editorial serif italic, words fade from blur
export const CapSerif: React.FC<CapProps> = ({words, y = 0.5, maxChars = 18, size = 118, color = '#fff', tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: H * y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1.0, color, letterSpacing: '-0.01em'}}>
      {p.words.map((w, i) => {
        const a = clamp((t - (w.s - LEAD)) / (6 / FPS));
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: a, filter: `blur(${(1 - a) * 10}px)`, transform: `translateY(${(1 - eo(a)) * 0.12}em)`}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// 5) Gold festive serif
export const CapGold: React.FC<CapProps> = ({words, y = 0.7, maxChars = 16, size = 92, tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: H * y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: F.corm, fontStyle: 'italic', fontWeight: 600, fontSize: size, lineHeight: 1.02}}>
      {p.words.map((w, i) => {
        const a = clamp((t - (w.s - LEAD)) / (6 / FPS));
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: a, transform: `translateY(${(1 - eo(a)) * 0.25}em)`, background: 'linear-gradient(180deg,#FFF1C9 0%,#F2C76E 45%,#B9852E 100%)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 18px rgba(255,190,90,0.45)) drop-shadow(0 4px 10px rgba(0,0,0,0.55))'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// 6) Marker (handwritten)
export const CapMarker: React.FC<CapProps> = ({words, y = 0.7, maxChars = 16, size = 84, color = '#111', accent = '#E5484D', tail}) => {
  const {t} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: H * y, transform: 'translateY(-50%) rotate(-2.5deg)', textAlign: 'center', fontFamily: F.marker, fontSize: size, lineHeight: 1.1, color}}>
      {p.words.map((w, i) => {
        const a = clamp((t - (w.s - LEAD)) / (5 / FPS));
        const em = /[?!]$/.test(w.w);
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.25em', clipPath: `inset(-20% ${(1 - a) * 100}% -20% 0)`, color: em ? accent : color}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// 7) Glitch RGB split
export const CapGlitch: React.FC<CapProps> = ({words, y = 0.5, maxChars = 14, size = 96, tail}) => {
  const {t, f} = useT();
  const p = activePage(paginate(words, maxChars, true, tail), t);
  if (!p) return null;
  const age = t - (p.s - LEAD);
  const j = age < 0.2 ? 14 : rnd(f) > 0.85 ? 8 : 2.5;
  const dx = (rnd(f * 3.1) - 0.5) * j, dy = (rnd(f * 5.7) - 0.5) * j * 0.4;
  const txt = p.words.filter((w) => t >= w.s - LEAD).map((w) => w.w).join(' ');
  const base: React.CSSProperties = {position: 'absolute', inset: 0, fontFamily: F.archivo, fontSize: size, textTransform: 'uppercase', lineHeight: 1.0, textAlign: 'center', letterSpacing: '-0.02em'};
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: H * y - size, height: size * 2.4}}>
      <div style={{...base, color: '#ff2a55', transform: `translate(${dx - 4}px, ${dy}px)`, mixBlendMode: 'screen'}}>{txt}</div>
      <div style={{...base, color: '#20e0ff', transform: `translate(${-dx + 4}px, ${-dy}px)`, mixBlendMode: 'screen'}}>{txt}</div>
      <div style={{...base, color: '#fff', clipPath: rnd(f * 7) > 0.8 ? `inset(${rnd(f) * 60}% 0 ${rnd(f * 2) * 30}% 0)` : 'none'}}>{txt}</div>
    </div>
  );
};

// 8) Mono terminal (typed)
export const Typed: React.FC<{text: string; at: number; cps?: number; style?: React.CSSProperties; cursor?: boolean}> = ({text, at, cps = 28, style, cursor = true}) => {
  const {t, f} = useT();
  const n = Math.max(0, Math.floor((t - at) * cps));
  const done = n >= text.length;
  return (
    <span style={{fontFamily: F.mono, whiteSpace: 'pre-wrap', ...style}}>
      {text.slice(0, n)}
      {cursor && t >= at && <span style={{opacity: done && f % 20 > 10 ? 0 : 1}}>▍</span>}
    </span>
  );
};

// 9) Big stacked condensed type (lines reveal upward)
export const BigStack: React.FC<{lines: {t: string; at: number; color?: string}[]; x?: number; y: number; size?: number; font?: string; color?: string; align?: 'left' | 'center'; lh?: number}> = ({lines, x = 70, y, size = 150, font = F.anton, color = '#fff', align = 'left', lh = 0.98}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', left: x, right: x, top: y, textAlign: align, fontFamily: font, fontSize: size, lineHeight: lh, textTransform: 'uppercase', color}}>
      {lines.map((l, i) => {
        const a = eo(clamp((t - l.at) / (7 / FPS)));
        return (
          <div key={i} style={{overflow: 'hidden', height: size * lh}}>
            <div style={{transform: `translateY(${(1 - a) * 105}%)`, color: l.color || color}}>{l.t}</div>
          </div>
        );
      })}
    </div>
  );
};

// simple appear helpers
export const fadeUp = (t: number, at: number, dur = 0.3, dist = 30) => {
  const a = eo(clamp((t - at) / dur));
  return {opacity: a, transform: `translateY(${(1 - a) * dist}px)`} as React.CSSProperties;
};
export const popIn = (t: number, at: number, dur = 0.28) => {
  const a = clamp((t - at) / dur);
  return {opacity: clamp(a * 3), transform: `scale(${a <= 0 ? 0 : back(a)})`} as React.CSSProperties;
};

// ---------- logo + end card ----------
export const Logo: React.FC<{h: number; dark?: boolean}> = ({h, dark}) => (
  <Img src={staticFile('brand/logo_mark.png')} style={{height: h, filter: dark ? 'invert(1)' : 'none'}} />
);

type EndProps = {at: number; theme?: 'dark' | 'light' | 'yellow' | 'gold' | 'paper'; sub?: string; price?: boolean; cta?: string};
export const EndCard: React.FC<EndProps> = ({at, theme = 'dark', sub, price = true, cta = 'Join AI in Advertising'}) => {
  const {t} = useT();
  if (t < at) return null;
  const th = {
    dark: {bg: '#050505', fg: '#fff', pill: '#fff', pillFg: '#000', mute: 'rgba(255,255,255,0.6)'},
    light: {bg: '#F4F2EE', fg: '#0b0b0b', pill: '#0b0b0b', pillFg: '#fff', mute: 'rgba(0,0,0,0.55)'},
    yellow: {bg: '#FFE14D', fg: '#0b0b0b', pill: '#0b0b0b', pillFg: '#FFE14D', mute: 'rgba(0,0,0,0.6)'},
    gold: {bg: '#120a04', fg: '#F6DFA4', pill: '#F2C76E', pillFg: '#1a0f05', mute: 'rgba(246,223,164,0.65)'},
    paper: {bg: '#F3EBDD', fg: '#151515', pill: '#151515', pillFg: '#F3EBDD', mute: 'rgba(0,0,0,0.55)'},
  }[theme];
  const darkLogo = theme !== 'dark' && theme !== 'gold';
  const a = (d: number) => fadeUp(t, at + d, 0.35, 26);
  return (
    <AbsoluteFill style={{background: th.bg, alignItems: 'center', justifyContent: 'center', opacity: clamp((t - at) / 0.12), zIndex: 50}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, marginTop: -60}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, ...a(0)}}>
          <Img src={staticFile('brand/logo_mark.png')} style={{height: 118, filter: darkLogo ? 'invert(1)' : theme === 'gold' ? 'sepia(1) saturate(2.5) brightness(1.05)' : 'none'}} />
          <div style={{fontFamily: F.tight, fontWeight: 700, color: th.fg, fontSize: 50, lineHeight: 0.98, letterSpacing: '-0.035em'}}>
            Ideabro
            <br />
            Studio
          </div>
        </div>
        <div style={{fontFamily: F.tight, fontWeight: 700, fontSize: 88, color: th.fg, letterSpacing: '-0.035em', textAlign: 'center', lineHeight: 1, ...a(0.12)}}>AI & Advertising</div>
        {sub && <div style={{fontFamily: F.inter, fontWeight: 500, fontSize: 36, color: th.mute, textAlign: 'center', maxWidth: 860, lineHeight: 1.3, ...a(0.2)}}>{sub}</div>}
        <div style={{background: th.pill, color: th.pillFg, fontFamily: F.tight, fontWeight: 700, fontSize: 46, padding: '26px 54px', borderRadius: 999, letterSpacing: '-0.01em', ...a(0.28), transform: `${a(0.28).transform} scale(${1 + 0.025 * Math.sin((t - at) * 6)})`}}>{cta} →</div>
        {price && (
          <div style={{fontFamily: F.mono, fontSize: 32, color: th.fg, display: 'flex', gap: 18, alignItems: 'baseline', ...a(0.36)}}>
            <span style={{textDecoration: 'line-through', color: th.mute}}>$99</span>
            <span style={{fontWeight: 500}}>$29 · lifetime access</span>
          </div>
        )}
        <div style={{fontFamily: F.mono, fontSize: 27, color: th.mute, ...a(0.44)}}>community.ideabrostudio.com</div>
      </div>
    </AbsoluteFill>
  );
};

// standard brand bug (small logo top-left) for social-native ads
export const Bug: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', top: 120, left: 64, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.92}}>
    <Img src={staticFile('brand/logo_mark.png')} style={{height: 46, filter: dark ? 'invert(1)' : 'none'}} />
    <span style={{fontFamily: F.tight, fontWeight: 700, fontSize: 26, color: dark ? '#111' : '#fff', letterSpacing: '-0.02em'}}>Ideabro Studio</span>
  </div>
);

// show a sub-rectangle (fractions) of an image, filling the container
export const Crop: React.FC<{src: string; x: number; y: number; w: number; h: number; style?: React.CSSProperties}> = ({src, x, y, w, h, style}) => (
  <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style}}>
    <Img src={staticFile(src)} style={{position: 'absolute', width: `${100 / w}%`, height: `${100 / h}%`, left: `${(-x / w) * 100}%`, top: `${(-y / h) * 100}%`, objectFit: 'fill'}} />
  </div>
);
// absolutely positioned box helper
export const Box: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', ...style}}>{children}</div>
);

// studio stills without prominent third-party brand marks (checked by eye)
export const SAFE = [1, 2, 8, 10, 16, 17, 18, 24, 25, 27, 28, 30, 34, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47].map((i) => `studio/img/i${String(i).padStart(2, '0')}.jpg`);
