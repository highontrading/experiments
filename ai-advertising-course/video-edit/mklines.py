import json,sys
d=json.load(open(sys.argv[1])); out=open(sys.argv[2],'w')
ws=[w for w in d['words'] if w['type'] in ('word','audio_event')]
line=[];start=None;prev_end=0
def fmt(t): return f"{int(t//60):02d}:{t%60:05.2f}"
def flush():
    global line,start
    if line: out.write(f"[{fmt(start)}] {''.join(line).strip()}\n")
    line=[];start=None
for w in d['words']:
    if w['type']=='spacing':
        if line: line.append(' ')
        continue
    gap=w['start']-prev_end
    if gap>1.2 and line:
        flush(); out.write(f"      ---- pause {gap:.1f}s ----\n")
    elif gap>1.2: out.write(f"      ---- pause {gap:.1f}s ----\n")
    if start is None: start=w['start']
    t=w['text'] if w['type']=='word' else f"({w['text']})"
    line.append(t); prev_end=w['end']
    if t.endswith(('.','?','!')) and len(''.join(line))>60: flush()
flush()
