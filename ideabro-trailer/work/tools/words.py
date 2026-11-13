import json,sys
def words(path):
    a=json.load(open(path)); ch=a['characters']; s=a['character_start_times_seconds']; e=a['character_end_times_seconds']
    out=[];cur='';st=None
    for c,a0,a1 in zip(ch,s,e):
        if c.isspace():
            if cur: out.append((cur,st,en)); cur=''
            continue
        if not cur: st=a0
        cur+=c; en=a1
    if cur: out.append((cur,st,en))
    return out
if __name__=="__main__":
    for f in sys.argv[1:]: print(f.split('/')[-1], ' '.join(f"{w}@{a:.2f}-{b:.2f}" for w,a,b in words(f)))
