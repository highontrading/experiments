"""Build out2/index.html: a local gallery of the 20 ads (videos play inline, statics show both ratios) + copy."""
import os, re, html
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(R, "out2")
md = open(os.path.join(R, "AD_BATCH_2.md")).read()

rows = re.findall(r"^\| (\d+) \| `([A-Z0-9_]+)` \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|", md, re.M)
copy = {}
for m in re.finditer(r"^### \d+ · ([A-Z0-9_]+).*?\n(.*?)(?=^### |\Z|^## )", md, re.M | re.S):
    copy[m.group(1)] = m.group(2).strip()


def poster(v):
    p = os.path.join(OUT, v.replace(".mp4", "_poster.jpg"))
    if not os.path.exists(p) or os.path.getmtime(p) < os.path.getmtime(os.path.join(OUT, v)):
        import subprocess; subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1.2", "-i", os.path.join(OUT, v), "-frames:v", "1", "-q:v", "3", p], check=True)


def media(name):
    v = [f for f in os.listdir(OUT) if f.startswith(name) and f.endswith(".mp4") and not f.startswith("_")]
    if v: poster(v[0])
    if v: return f'<video src="{v[0]}" controls playsinline preload="metadata" poster="{v[0].replace(".mp4", "_poster.jpg")}"></video>'
    imgs = sorted(f for f in os.listdir(OUT) if f.startswith(name) and f.endswith(".jpg") and "sheet" not in f)
    return "".join(f'<img src="{i}" alt="{i}">' for i in imgs)


cards = []
for n, name, fmt, lang, angle, cap, voice, music in rows:
    c = copy.get(name, "")
    c = html.escape(c).replace("\n", "<br>")
    c = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", c)
    cards.append(f"""<article><div class="m">{media(name)}</div><div class="t"><h2><span>{n}</span> {name}</h2>
<p class="meta">{html.escape(fmt.strip())} · {html.escape(lang.strip().replace('**',''))} · captions: {html.escape(cap.strip().replace('**',''))} · voice: {html.escape(voice.strip())} · music: {html.escape(music.strip())}</p>
<p class="angle">{html.escape(angle.strip())}</p><div class="copy">{c}</div></div></article>""")

page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI & Advertising · Ad batch 2</title><style>
:root{{--bg:#F1EFE6;--ink:#141414;--pink:#F6B8EA;--lime:#D8F5A2;--card:#fff;--mut:#6b6b6b}}
@media (prefers-color-scheme:dark){{:root{{--bg:#121212;--ink:#f3f1ea;--card:#1c1c1c;--mut:#a5a5a5}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Inter,system-ui,sans-serif}}
header{{padding:32px 16px 8px;max-width:1200px;margin:auto}} h1{{font:400 44px/1.1 'Instrument Serif',Georgia,serif;margin:0}}
h1 em{{background:var(--pink);color:#141414;font-style:normal;padding:0 8px}} header p{{color:var(--mut)}}
main{{max-width:1200px;margin:auto;padding:8px 16px 64px;display:grid;gap:20px}}
article{{background:var(--card);border-radius:18px;padding:16px;display:grid;grid-template-columns:minmax(0,360px) 1fr;gap:20px;border:1px solid rgba(127,127,127,.2)}}
.m{{display:flex;gap:8px;align-items:flex-start}} .m video,.m img{{width:100%;max-height:640px;border-radius:12px;background:#000;object-fit:contain}}
.m img{{width:calc(50% - 4px)}} h2{{margin:0 0 4px;font:700 18px/1.3 'JetBrains Mono',monospace}} h2 span{{background:var(--lime);color:#141414;padding:2px 8px;border-radius:8px}}
.meta{{color:var(--mut);font-size:13px;margin:4px 0}} .angle{{font-weight:600}} .copy{{font-size:14px}}
@media (max-width:760px){{article{{grid-template-columns:1fr}}}}
</style></head><body><header><h1>Ad batch 2 · <em>20 ads</em></h1>
<p>AI &amp; Advertising (₹2,999) · 15 videos (11 English, 4 Hinglish) + 5 statics (4 English, 1 Hinglish) · 12 caption styles · not posted to Meta.</p></header>
<main>{''.join(cards)}</main></body></html>"""
open(os.path.join(OUT, "index.html"), "w").write(page)
print("cards", len(cards))
