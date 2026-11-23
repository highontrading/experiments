import json,sys
a=json.load(open(sys.argv[1]))
ch=a['characters'];st=a['character_start_times_seconds'];en=a['character_end_times_seconds']
words=[];cur=None
for c,s,e in zip(ch,st,en):
    if c.isspace():
        if cur: words.append(cur);cur=None
        continue
    if cur is None: cur={'w':c,'s':s,'e':e}
    else: cur['w']+=c;cur['e']=e
if cur: words.append(cur)
json.dump(words,open(sys.argv[2],'w'),indent=0)
gaps=[(words[i+1]['s']-words[i]['e'],words[i]['w']) for i in range(len(words)-1)]
big=[g for g in gaps if g[0]>0.2]
print(len(words),'words; end',words[-1]['e'])
for g,w in big: print(f"{g:.2f} after {w}")
