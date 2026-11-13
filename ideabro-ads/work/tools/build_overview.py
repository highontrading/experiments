import base64, html, subprocess, sys, json, os
sys.path.insert(0, 'work'); from ads_meta import ADS
OUT = sys.argv[1]
def thumb(id, t):
    p = f'/tmp/th_{id}_{t}.jpg'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',f'out/final/{id}.mp4','-frames:v','1','-vf','scale=270:480','-q:v','5',p])
    return base64.b64encode(open(p,'rb').read()).decode()
def dur(id):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'out/final/{id}.mp4'],capture_output=True,text=True).stdout)
cards = []
for i, a in enumerate(ADS):
    d = dur(a['id'])
    th = [thumb(a['id'], t) for t in (0.9, d * 0.45, d - 1.5)]
    imgs = ''.join(f'<img src="data:image/jpeg;base64,{b}" alt="{html.escape(a["title"])} frame" width="270" height="480">' for b in th)
    pt = html.escape(a['pt']).replace('\n', '<br>')
    lang = '<span class="tag hi">Hinglish</span>' if a['lang'] == 'Hinglish' else '<span class="tag">English</span>'
    cards.append(f'''<article class="ad">
  <header><span class="num">{a["id"][:3]}</span><h3>{html.escape(a["title"])}</h3>{lang}<span class="dur">{d:.1f}s · 9:16</span></header>
  <div class="frames">{imgs}</div>
  <dl>
    <div><dt>Theme</dt><dd>{html.escape(a["theme"])}</dd></div>
    <div><dt>Hook (0–2 s)</dt><dd>{html.escape(a["hook"])}</dd></div>
    <div><dt>Captions</dt><dd>{html.escape(a["caps"])}</dd></div>
    <div><dt>Voice / music</dt><dd>{html.escape(a["vo"])} · {html.escape(a["music"])}</dd></div>
    <div><dt>Best for</dt><dd>{html.escape(a["aud"])}</dd></div>
    <div><dt>File</dt><dd class="mono">{a["id"]}.mp4</dd></div>
  </dl>
  <div class="copy">
    <div class="copy-h">Suggested Meta copy</div>
    <p class="pt">{pt}</p>
    <p><span class="lbl">Headline</span> {html.escape(a["hl"])}</p>
    <p><span class="lbl">Button</span> {html.escape(a["cta"])} · <span class="mono">community.ideabrostudio.com/courses/ai-and-advertising</span></p>
  </div>
</article>''')
page = open('work/overview_template.html').read().replace('{{CARDS}}', '\n'.join(cards))
open(OUT, 'w').write(page); print(len(page))
