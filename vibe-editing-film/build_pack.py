"""Write the prompt pack (6 pages) as HTML from timeline.py and real frames.
    python build_pack.py && node pack_pdf.js  ->  out/PROMPT_PACK_Vibe_Editing.pdf
"""
import html
import json
import pathlib

import timeline as TL

ROOT = pathlib.Path(__file__).parent
PROMPT = (ROOT / "prompts/PROMPT.txt").read_text().strip()
SOUND = (ROOT / "prompts/SOUND_PROMPT.txt").read_text().strip()
LOUD = json.loads((ROOT / "build/loudness.json").read_text()) if (ROOT / "build/loudness.json").exists() else None


def f(t):
    return TL.frame(t)


def img(t):
    return f"../build/frames/f{f(t):04d}.png"


def words(s):
    return len(s.split())


def page(n, body):
    return f"""<section class="page"><header><span>PROMPT PACK: NO TIMELINE GRIND</span><span>Vibe Editing · IdeaBro Studio</span></header>
{body}<footer><span>IdeaBro Studio · Vibe Editing</span><span>P {n:02d} / 06</span></footer></section>"""


STRIP = [(1.0, "FLAT PNG"), (2.1, "POP"), (3.5, "TOOLS"), (5.0, "KICK THE LOOK"), (7.0, "SFX STAMPS"), (9.0, "PLAYHEAD")]
HITS = [
    (0.0, 1.5, "wide on the workspace; flat Bro in the comp, handles around him, the prompt types, two knocks", "soft pad, ticking hats, key taps, two glass knocks"),
    (1.5, 1.9, "he peels up off the screen as a flat card", "sticker peel, riser"),
    (2.0, None, "pop into 3D, the comp glass cracks, shards fly", "pop, glass, sub boom, the beat drops"),
    (2.5, None, "Cut to beat: four clips snap onto V1, footage in the comp", "click, blip, four snaps"),
    (3.0, 3.5, "Captions: eleven word pills on CAP; Motion GFX: title, lower third, badge", "click, blip, caption ticks; swish, sparkles"),
    (4.02, 4.5, "flip across the comp onto Looks > Teal & Orange, the card pops up", "boing, whoosh, landing, select blip"),
    (5.0, 5.6, "kick, the card flies into the comp: the grade wipes across", "thwack, whoosh, shimmer and bells"),
    (6.0, 7.5, "four SFX stamps on the cuts, one a beat; the comp jumps to each", "rising dings C E G C"),
    (8.0, 8.4, "onto the playhead, it rewinds to 0", "tape rewind chirps"),
    (8.5, 9.6, "he surfs the playhead, the full edit plays", "skate roll, scrub ticks"),
    (10.0, None, "VIBE IT: flash, particles, EXPORTED · 4K", "click, kick, C major brass, shimmer"),
    (10.45, 11.15, "every other panel powers down and falls", "four power-downs, whooshes, boom"),
    (11.2, 12.0, "Bro waves, ^^ eyes, the end card alone", "yay chirps, sparkles, chord rings out, fade"),
]


def hit_rows():
    rows = []
    for a, b, pic, snd in HITS:
        tm = f"{a:.2f} s" if b is None else f"{a:.2f} to {b:.2f} s"
        fr = f"f{f(a)}" if b is None else f"f{f(a)} to f{min(f(b), 360)}"
        rows.append(f"<tr><td>{tm}</td><td>{fr}</td><td>{pic}</td><td>{snd}</td></tr>")
    return "\n".join(rows)


def prompt_html(s):
    out = html.escape(s)
    for k in ("BRAND", "HERO:", "APP:", "RESULT:", "SET:", "FORMAT:", "BEATS (seconds):", "CAMERA:", "LOOK:", "CHECKS:"):
        out = out.replace(k, f"<b>{k}</b>", 1)
    return out


n_hits = sum(1 for h in TL.HOPS if h["press"]) + 1      # + the kick
stats = [("12.0 s", "120 BPM, 24 BEATS"), ("30 fps", "360 FRAMES"), ("1920x1080", "2.5D: HTML + CSS 3D"),
         (str(n_hits), "BUTTONS, LOOKS, PLAYHEAD"), (str(words(PROMPT)), "WORDS OF PROMPT"), ("3", "FOLLOW-UPS")]

p1 = f"""
<div class="kicker">CHARACTER FILM / 12 S / 16:9 / 30 FPS</div>
<h1>No timeline grind.<br><em>Just vibe.</em></h1>
<p class="lede">Bro, the IdeaBro lightbulb, starts as a flat PNG layer inside a Vibe Editing comp. He peels himself off the screen,
pops into 3D and builds a whole edit by jumping on the tools: Cut to beat, Captions, Motion GFX, a kicked-in look, four SFX stamps,
a ride on the playhead, VIBE IT. Then the editor falls apart and only the finished reel is left. Interface, scene and sound come
from the prompt on page 2 and are all driven by one timeline file.</p>
<div class="stats">{''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in stats)}</div>
<div class="strip">{''.join(f'<figure><img src="{img(t)}"><figcaption><b>{t:.2f} S</b> {lab}</figcaption></figure>' for t, lab in STRIP)}</div>
<h3>THE FORMULA</h3>
<div class="formula">
<div><i>01</i><b>Build the UI in HTML</b>Real panels, labels and chips as a web page: crisp as a real app, and every pixel position is known.</div>
<div><i>02</i><b>One layout, three readers</b>timeline.py holds every button in UI pixels; the HTML, the 3D world and the sound read the same numbers.</div>
<div><i>03</i><b>Slabs, not a screenshot</b>Each panel is its own slab, so it can light up, press, power down and fall on its own.</div>
<div><i>04</i><b>The comp is a canvas</b>The reel is drawn per frame from the playhead time, so cuts, captions and the grade follow real editor logic.</div>
<div><i>05</i><b>Every hop edits</b>Each landing presses something that changes the comp and the timeline. A jump that changes nothing is cut.</div>
<div><i>06</i><b>Measure, don't guess</b>18 stills on one contact sheet before the full render; loudness per half second for the mix.</div>
</div>"""

p2 = f"""
<h2>The prompt <span class="tag">COPY-READY · {words(PROMPT)} WORDS</span></h2>
<p class="sub">Paste it as is into Claude Code (Opus 5.5, effort high) with Blender 5, Node with puppeteer and ffmpeg installed for the
full 3D route. No GPU? The same prompt with FORMAT swapped (page 4) gives the 2.5D version in this folder.</p>
<div class="two wide"><pre class="prompt tight">{prompt_html(PROMPT)}</pre>
<div class="notes">
<p><b>BRAND</b>The block you swap. HERO, APP, RESULT, SET. The rest of the prompt only uses these names.</p>
<p><b>APP</b>Name every panel and the state it is in. The more real the labels, the more the film reads as your real product.</p>
<p><b>RESULT</b>Say exactly what the edit contains: the words of the captions, the look, the end card. Vague results give vague comps.</p>
<p><b>BEATS</b>Every hop lands on something that changes the comp. That is the whole pitch of Vibe Editing: one action, one finished layer.</p>
<p><b>LOOK</b>Glossy screens and big area lights fight. Keep the lights out of the UI reflections and name the hero colour in hex.</p>
<p><b>CHECKS</b>Makes the model look before it spends render time. Most of the polish comes from this line.</p>
</div></div>"""

p3 = f"""
<h2>Every follow-up <span class="tag">3 ROUNDS</span></h2>
<p class="sub">After each contact sheet, write what you see and what to change, in order. These are the notes from this build.</p>
<div class="two"><div>
<div class="fu"><b>FOLLOW-UP 1 / AFTER THE FIRST 18 STILLS</b>The pop flash turns the whole frame grey: screen flash down to 0.14, comp flash to 0.35,
VIBE IT flash to 0.2. The opening wide crops the timeline: dolly back to -450. On the timeline the camera leaves half the frame as empty floor:
aim 120 px above Bro instead of 60. Bro hovers over the chips: feet at 28, not 36. The Teal &amp; Orange card covers him: float it at x 268.
His end wave barely reads: raise the arm to 1.95 rad. Land him at x 1395 so he stands beside the comp, not on it.</div>
<div class="fu"><b>FOLLOW-UP 2 / AFTER THE FIRST MIX</b>The intro is as loud as the drop (-12 dB from frame 1), so the pop does not hit.
Pads to 0.018 / 0.022 / 0.03 and intro hats halved. Result: -26 dB in the first half second, -19 on the knocks, -11 on the drop.</div>
<div class="fu"><b>FOLLOW-UP 3 / AFTER THE FULL RENDER</b>Three misses. Mid-leap to Looks he flies out of the top of the frame:
lower that apex from 230 to 150 and pull the camera back to -40. Two sub-frames per frame ghost the text on every whip instead of
blurring it: render one sample per frame. The cut flash while he surfs washes the comp out: 0.55 to 0.35. Re-render the whole film
(4 min on CPU); on a slow machine re-render only the ranges with <code>node render.js --from A --to B</code>.</div>
</div><div>
<figure class="big"><img src="{img(5.4)}"><figcaption>5.40 s: the look wipes across the comp, ungraded on the right, Teal &amp; Orange on the left.</figcaption></figure>
<figure class="big"><img src="{img(7.0)}"><figcaption>7.00 s: third SFX stamp; the comp has jumped to the cut it marks.</figcaption></figure>
</div></div>"""

p4 = f"""
<h2>Make it yours, render it fast</h2>
<p class="sub">Only the BRAND block changes. Swap APP for another Vibe Editing screen and RESULT for what Bro should make in it.</p>
<div class="two"><div>
<pre class="prompt small"><b>BRAND (example swap: podcast clips)</b>
HERO: the same
APP: Vibe Editing in Podcast mode: a two-camera multicam bin, a
transcript panel with highlighted quotes, Copilot chips Find hooks,
Reframe 9:16, Captions, B-roll, and a Timeline with CAM A, CAM B, CAP
RESULT: three 9:16 shorts from one episode, each with a hook title,
karaoke captions and a punch-in on the best line
SET: the same</pre>
<pre class="prompt small"><b>BRAND (example swap: product ad)</b>
HERO: the same
APP: Vibe Editing with a 3D product shot, Brand kit and Music panels
RESULT: a 6 s ad: product spin, price tag pop, logo sting, CTA</pre>
<pre class="prompt small"><b>FORMAT (2.5D swap, no Blender, no GPU: what this folder uses)</b>
FORMAT: one HTML stage, 1920x1080, 30 fps, 12.0 s at 120 BPM: panels as
CSS 3D slabs over a floor, the comp on a canvas, Bro on a canvas
billboard, every frame from renderAt(t), screenshots with Playwright,
bloom and a soft vignette in ffmpeg.</pre>
</div><div>
<figure class="big"><img src="{img(0.8)}"><figcaption>The whole workspace from HTML before the camera moves: every label is real text.</figcaption></figure>
<h3>RENDER IT FAST (2.5D, THIS FOLDER)</h3>
<ol>
<li><code>python3 timeline.py</code>: layout and events to build/timeline.json.</li>
<li><code>./make.sh stills</code>: 18 stills on one contact sheet. Read it, write a follow-up.</li>
<li><code>./make.sh</code>: 360 frames (about 0.7 s a frame on 4 CPU cores, no GPU), the WAV, the MP4.</li>
<li>Encode: H.264 High CRF 17, 30 fps, bloom + soft vignette, WAV muxed as AAC 320k, +faststart.</li>
</ol>
<h3>BLENDER ROUTE</h3>
<p class="sub">Build the .blend with <code>blender -b --factory-startup -P scene.py</code>, preview 18 stills at 50 % and 40 samples,
pass <code>-P gpu.py</code> on every render: the OptiX device is a user preference, not part of the file.</p>
</div></div>"""

p5 = f"""
<h2>Every hit on its frame</h2>
<p class="sub">Read straight from timeline.py; the frame is time x 30 + 1. At 120 BPM a beat is 0.5 s, so every landing, press and stamp sits on one.</p>
<table><tr><th>TIME</th><th>FRAME</th><th>PICTURE</th><th>SOUND</th></tr>{hit_rows()}</table>
<h3>3 TIPS</h3>
<div class="formula three">
<div><i>1</i><b>Pixels are the API</b>Keep the layout in UI pixels; the stage, the camera and the sound all address buttons by the same numbers.</div>
<div><i>2</i><b>Show the editor logic</b>Clips snap to V1, captions fill CAP, stamps jump the comp, the playhead plays it: anyone who edits smiles.</div>
<div><i>3</i><b>Every jump changes something</b>A hop that presses nothing is filler; cut it or give it a button.</div>
</div>"""

loud = ""
if LOUD:
    loud = "".join(f'<i style="height:{max(4, (v + 34) * 4):.0f}px" title="{v:.1f}"></i>' for v in LOUD["half_seconds"])
    loud = f'<div class="meter">{loud}</div><p class="sub">{LOUD["summary"]}</p>'
p6 = f"""
<h2>Sound <span class="tag">COPY-READY · {words(SOUND)} WORDS</span></h2>
<p class="sub">The picture comes from the prompt on page 2; the sound comes from this one, driven by the same timeline.py.</p>
<pre class="prompt">{html.escape(SOUND)}</pre>
<h3>THE CHECK · LOUDNESS PER HALF SECOND</h3>
{loud}
<p class="sub">Into the MP4: the WAV is muxed in as the video's AAC 320k track with ffmpeg; the same step works for your own video.</p>"""

CSS = """
@page { size: 1600px 1000px; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; color: #ece8f6; background: #0b0910; }
.page { width: 1600px; height: 1000px; padding: 64px 72px; position: relative; overflow: hidden; page-break-after: always;
  background: radial-gradient(900px 600px at 85% 0%, rgba(139,92,246,.18), transparent 70%), #0e0b14; }
header, footer { position: absolute; left: 72px; right: 72px; display: flex; justify-content: space-between; font-size: 12px;
  letter-spacing: .14em; color: #8d87a3; font-weight: 700; }
header { top: 28px; } footer { bottom: 26px; }
.kicker { color: #ffc93c; font-weight: 800; letter-spacing: .16em; font-size: 14px; margin-top: 8px; }
h1 { font-size: 76px; line-height: 1; font-weight: 900; margin: 12px 0 14px; letter-spacing: -.02em; }
h1 em { font-style: normal; color: #ffc93c; }
h2 { font-size: 44px; font-weight: 900; margin: 10px 0 8px; display: flex; align-items: center; gap: 18px; }
h3 { font-size: 13px; letter-spacing: .16em; color: #a78bfa; margin: 22px 0 10px; }
.tag { font-size: 13px; letter-spacing: .14em; color: #0e0b14; background: #ffc93c; padding: 6px 10px; border-radius: 6px; font-weight: 800; }
.lede { font-size: 17px; line-height: 1.5; color: #c9c3da; max-width: 1180px; }
.sub { font-size: 15px; line-height: 1.5; color: #a39db8; margin-bottom: 14px; }
.stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin: 22px 0 18px; }
.stats div { border-top: 2px solid #8b5cf6; padding-top: 8px; }
.stats b { display: block; font-size: 28px; font-weight: 900; }
.stats span { font-size: 11px; letter-spacing: .12em; color: #8d87a3; font-weight: 700; }
.strip { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
figure img { width: 100%; display: block; border-radius: 8px; border: 1px solid rgba(255,255,255,.1); }
figcaption { font-size: 11px; letter-spacing: .1em; color: #8d87a3; margin-top: 6px; font-weight: 600; }
figcaption b { color: #ffc93c; margin-right: 4px; }
.big figcaption { letter-spacing: 0; font-size: 13px; }
.big { margin-bottom: 14px; }
.formula { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 26px; }
.formula div { font-size: 14px; line-height: 1.45; color: #a39db8; }
.formula i { font-style: normal; color: #ffc93c; font-weight: 900; margin-right: 8px; }
.formula b { color: #ece8f6; display: inline; margin-right: 6px; }
.two { display: grid; grid-template-columns: 1.25fr 1fr; gap: 34px; }
pre.prompt { white-space: pre-wrap; font-family: "DejaVu Sans Mono", monospace; font-size: 12.6px; line-height: 1.5; color: #ddd8ea;
  background: #08070c; border: 1px solid rgba(139,92,246,.4); border-radius: 12px; padding: 18px 20px; }
pre.prompt b { color: #ffc93c; }
.wide { grid-template-columns: 1.75fr 1fr; gap: 28px; }
pre.tight { font-size: 11.6px; line-height: 1.42; padding: 14px 18px; }
pre.small { font-size: 12px; margin-bottom: 12px; }
.notes p { font-size: 14px; line-height: 1.5; color: #a39db8; margin-bottom: 14px; }
.notes b { display: block; color: #ffc93c; letter-spacing: .12em; font-size: 12px; margin-bottom: 2px; }
.fu { font-size: 15px; line-height: 1.55; color: #c9c3da; margin-bottom: 20px; }
.fu b { display: block; font-size: 12px; letter-spacing: .14em; color: #a78bfa; margin-bottom: 6px; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 13px; color: #ffc93c; }
ol { padding-left: 20px; font-size: 14px; line-height: 1.7; color: #c9c3da; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-size: 11px; letter-spacing: .14em; color: #8d87a3; padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,.15); }
td { padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,.06); color: #c9c3da; vertical-align: top; }
td:first-child, td:nth-child(2) { font-family: "DejaVu Sans Mono", monospace; font-size: 12.5px; color: #ffc93c; white-space: nowrap; }
.three { grid-template-columns: repeat(3, 1fr); }
.meter { display: flex; align-items: flex-end; gap: 6px; height: 110px; margin: 6px 0 12px; }
.meter i { flex: 1; background: linear-gradient(0deg, #8b5cf6, #ffc93c); border-radius: 3px 3px 0 0; }
"""

doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>Prompt Pack: No Timeline Grind</title><style>{CSS}</style></head>
<body>{page(1, p1)}{page(2, p2)}{page(3, p3)}{page(4, p4)}{page(5, p5)}{page(6, p6)}</body></html>"""
(ROOT / "build/pack.html").write_text(doc)
print("-> build/pack.html")
