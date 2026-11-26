import json, os, sys
sys.argv=['x']
exec(open('tune.py').read().split("lh=json.load")[0])
notes={}
json.dump(notes,open('/tmp/notes.json','w'))
REG=7.95*96
for it in range(6):
    render(); n,tok=pages_tokens(); fl=fills()
    starts=[tok.get(f'ch{i}') for i in range(1,10)]+[tok.get('concl')]
    rep=[]; changed=False
    for i in range(1,10):
        last=starts[i]-2; f=fl.get(last)
        rep.append((i,last,None if f is None else round(f,2),notes.get(str(i),0)))
        cur=notes.get(str(i),0)
        if f is not None and f<0.45 and cur==0:
            notes[str(i)]=(0.97-f)*REG-20; changed=True
        elif f is not None and cur>0 and f>0.995:   # overflow risk
            notes[str(i)]=cur-18; changed=True
    print(it,n,rep); json.dump(notes,open('/tmp/notes.json','w'))
    if not changed: break
