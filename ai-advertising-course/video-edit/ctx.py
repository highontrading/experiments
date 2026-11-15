import json,sys
W={v:[w for w in json.load(open(f'audio/{v}.json'))['words'] if w['type']!='spacing'] for v in ('vid1','vid2','vid3')}
def mmss(t): return f"{int(t//60)}:{t%60:05.2f}"
for spec in sys.argv[1:]:
    v,a,b=spec.split(':',2) if spec.count(':')==2 else (None,None,None)
    v,rng=spec.split('@'); a,b=[float(x.split('m')[0])*60+float(x.split('m')[1]) for x in rng.split('-')]
    print(f"== {v} {mmss(a)}-{mmss(b)}")
    print(' '.join(f"{w['text']}[{w['start']:.2f}-{w['end']:.2f}]" for w in W[v] if a<=w['start']<=b))
