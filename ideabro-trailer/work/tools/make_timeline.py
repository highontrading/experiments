"""Builds src/data/timeline.json from the VO word timings.
Single source of truth for picture (Remotion) and sound (mix.py)."""
import json, glob, os

FPS = 30
LEAD = 5 / FPS            # captions land 5 frames before the word is spoken (reference: 4-8)
VO = {l['id']: l for l in json.load(open('work/vo_timeline.json'))}

def w(line, i):
    return VO[line]['words'][i]['s']

def wt(line, i):
    return w(line, i) - LEAD

def end(line):
    return VO[line]['end']

T = {}
# ---- section boundaries (seconds) ----
T['strobe'] = [0.0, 2.32]
T['flash1'] = [end('L02') + 0.02, end('L02') + 0.02 + 11 / FPS]
T['eras'] = [T['flash1'][0] + 0.17, wt('L06', 0) - 0.02]
T['eraCuts'] = [T['eras'][0], wt('L04', 0), wt('L05', 0), T['eras'][1]]
T['oldCollage'] = [wt('L07', 0) - 0.12, wt('L07', 7)]          # explode at "like"
T['dotRise'] = [T['oldCollage'][1] + 0.35, wt('L08', 0)]
T['iris'] = [wt('L08', 1), wt('L08', 1) + 10 / FPS]
T['tools'] = [wt('L08', 4), wt('L08', 7)]                       # pop on "the new one", whip on "And"
T['studioCollage'] = [wt('L10', 0), wt('L11', 0)]
T['gapSplit'] = wt('L12', 2)
T['dotBetween'] = wt('L12', 3)
T['ringIn'] = wt('L12', 6)
T['ringMerge'] = wt('L12', 13)
T['blackWords'] = wt('L12', 14)
T['flash2'] = [end('L12') + 0.04, end('L12') + 0.04 + 11 / FPS]
T['proof'] = [T['flash2'][0] + 0.17, end('L15') + 0.1]
T['flash3'] = [T['proof'][1] - 0.05, T['proof'][1] - 0.05 + 11 / FPS]
T['forkDraw'] = T['flash3'][1] + 0.02
T['forkSplit'] = wt('L16', 5)
T['forkRetract'] = wt('L18', 0)
T['logo'] = [end('L18') + 0.22, end('L18') + 0.22 + 1.35]
T['url'] = [T['logo'][1], T['logo'][1] + 1.45]
T['total'] = T['url'][1]

# proof clips: (start, clip key, title, line2, line3)
P = [
    (T['proof'][0], 'product', 'Product shoots', 'Module 03 · AI product photography', 'Studio packshots from one product photo'),
    (wt('L13', 2), 'model', 'Model shoots', 'Module 04 · Models, styling and virtual sets', 'Consistent AI models you direct'),
    (wt('L13', 4), 'film', 'Campaign films', 'Module 05 · AI video ads and campaign films', 'Multi-shot stories that hold together'),
    (wt('L13', 6), 'ugc', 'AI UGC', 'Module 07 · AI UGC and brand ambassadors', 'Creators that feel real, no shoot needed'),
    (wt('L13', 7), 'meta', 'Meta ads', 'Module 08 · Statics, variations and testing', 'Ten variations from one idea'),
    (wt('L14', 0), 'course', 'AI & Advertising', '11 modules · 41 lessons', 'Self-paced video · lifetime access'),
    (wt('L14', 4), 'capstone', 'Capstone', 'Module 11 · Your full campaign', 'From the brief to a launched campaign'),
    (wt('L15', 0), 'taste', 'Ideabro Studio', 'AI-directed films from our studio', 'Anyone can press generate. Few can direct.'),
]
T['proofClips'] = [dict(s=round(a, 3), e=round(P[i + 1][0] if i + 1 < len(P) else T['proof'][1], 3), key=k, title=t, l2=l2, l3=l3)
                   for i, (a, k, t, l2, l3) in enumerate(P)]

# ---- caption cards ----
# style: over (white on photo, shadow) | rise (white on black) | fade (black on white) | dot (difference over dot) | big (large black on white)
cards = []

def card(words, style, until, **kw):
    cards.append(dict(words=[dict(t=t, s=round(s, 3)) for t, s in words], style=style, e=round(until, 3), **kw))

def single(line, idxs_groups, style, last_until, next_starts=None):
    """one card per group; each lasts until the next group starts."""
    starts = [wt(line, g[0]) for g in idxs_groups]
    for k, g in enumerate(idxs_groups):
        txt = ' '.join(VO[line]['words'][i]['w'] for i in g)
        u = starts[k + 1] if k + 1 < len(idxs_groups) else last_until
        card([(txt, starts[k])], style, u)

# Hook, over strobe: one word per card
single('L01', [[i] for i in range(7)], 'over', T['strobe'][1])
# A new medium arrives (build)
card([(VO['L02']['words'][i]['w'], wt('L02', i)) for i in range(4)], 'rise', T['flash1'][0] + 0.12)
# Eras
single('L03', [[0]], 'over', T['eraCuts'][1])
single('L04', [[0]], 'over', T['eraCuts'][2])
single('L05', [[0]], 'over', T['eras'][1])
# And every time / not every brand makes it across
card([(VO['L06']['words'][i]['w'], wt('L06', i)) for i in range(3)], 'rise', wt('L06', 3) - 0.07)
card([(VO['L06']['words'][i]['w'], wt('L06', i)) for i in range(3, 9)], 'rise', T['oldCollage'][0])
# Old playbook, over collage
single('L07', [[0], [1], [2, 3, 4], [5], [6], [7], [8], [9], [10]], 'over', wt('L08', 0))
# Others (dot behind) then white world
card([('Others', wt('L08', 0))], 'dot', T['iris'][0] + 4 / FPS)
single('L08', [[1], [2], [3], [4, 5, 6]], 'fade', T['tools'][1])
card([('And', wt('L08', 7)), ('ship.', wt('L08', 8))], 'fade', wt('L09', 0) - 0.15)
card([('No', wt('L09', 0)), ('studio.', wt('L09', 1))], 'fade', wt('L09', 2) - 0.03)
card([('No', wt('L09', 2)), ('crew.', wt('L09', 3))], 'fade', T['studioCollage'][0])
single('L10', [[0], [1], [2, 3], [4], [5, 6], [7, 8], [9]], 'over', T['studioCollage'][1])
# Right now, AI is that medium
single('L11', [[0, 1]], 'fade', wt('L11', 2))
card([('AI', wt('L11', 2))], 'big', wt('L11', 3))
single('L11', [[3], [4], [5]], 'fade', wt('L12', 0))
# gap
single('L12', [[0], [1]], 'fade', T['gapSplit'])
card([('gap', T['gapSplit'])], 'gap', T['dotBetween'])
single('L12', [[3], [4], [5], [6], [7], [8], [9], [10, 11], [12], [13]], 'dot', T['blackWords'])
single('L12', [[14], [15], [16], [17], [18]], 'rise', T['flash2'][0] + 0.1)
# fork
single('L16', [[0], [1], [2, 3], [4, 5]], 'rise', wt('L17', 0))
single('L17', [[0, 1], [2, 3], [4]], 'rise', wt('L18', 0))
single('L18', [[0], [1], [2, 3], [4]], 'rise', T['logo'][0] - 0.05)
T['cards'] = cards

# ---- SFX cues (for mix.py) ----
sfx = []
def cue(name, t, gain_db=0.0, rate=1.0):
    sfx.append(dict(n=name, t=round(t, 3), g=gain_db, r=rate))

n_cuts = int(T['strobe'][1] * FPS / 2)
for k in range(0, n_cuts, 2):
    cue('tick', k * 2 / FPS, -14 + (k % 3) * 1.5, 0.9 + (k % 5) * 0.06)
for f in ('flash1', 'flash2', 'flash3'):
    cue('flash', T[f][0] - 0.06, -4)
cue('pop', T['oldCollage'][0], -8)
T['oldTiles'] = [round(T['oldCollage'][0] + i * 0.2, 3) for i in range(9)]
for t in T['oldTiles'][1:]:
    cue('pop', t, -10, 0.95)
cue('scatter', T['oldCollage'][1] - 0.05, -6)
cue('riser', T['iris'][1] - 1.15, -8)
T['toolTimes'] = [round(T['tools'][0] + i * 2 / FPS, 3) for i in range(8)]
for i, t in enumerate(T['toolTimes']):
    cue('bubble', t, -13, 0.9 + i * 0.05)
cue('whip', T['tools'][1] - 0.04, -6)
T['studioTiles'] = [round(T['studioCollage'][0] + i * 0.14, 3) for i in range(10)] + [round(T['studioCollage'][0] + 1.9 + i * 0.12, 3) for i in range(4)]
for t in T['studioTiles']:
    cue('pop', t, -11, 1.0)
cue('impact', T['gapSplit'] - 0.02, -3)
cue('whip', T['gapSplit'] + 0.22, -12, 0.8)
cue('shimmer', T['ringIn'] - 0.1, -10)
cue('impact', T['ringMerge'], -9, 1.3)
cue('line', T['forkDraw'], -9)
cue('line', T['forkSplit'], -12, 1.2)
cue('whip', T['forkRetract'] + 0.3, -16, 0.7)
cue('ui', T['logo'][0], -6)
cue('ui', T['url'][0], -8, 1.15)
T['sfx'] = sfx
T['projector'] = [T['eras'], T['proof']]
T['musicOffset'] = round(48.0 - T['flash3'][0], 3)   # music peak (48.0 s in the cue) lands on flash3
T['musicStop'] = round(end('L18') + 0.04, 3)
T['vo'] = [dict(id=l['id'], s=l['start']) for l in VO.values()]

os.makedirs('src/data', exist_ok=True)
json.dump(T, open('src/data/timeline.json', 'w'), indent=1)
print({k: v for k, v in T.items() if k not in ('cards', 'sfx', 'proofClips', 'vo', 'oldTiles', 'studioTiles', 'toolTimes')})
print('cards', len(cards), 'sfx', len(sfx), 'total frames', round(T['total'] * FPS))
