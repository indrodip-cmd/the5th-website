import re, subprocess, sys
try:
    from rapidfuzz import fuzz, process
    ratio=lambda a,b: fuzz.ratio(a,b)/100
except Exception:
    import difflib
    ratio=lambda a,b: difflib.SequenceMatcher(None,a,b).ratio()
def norm(t):
    t=t.lower().replace('’',"'").replace("'",'').replace('“','"').replace('”','"').replace('–',' to ').replace('&',' and ')
    return ' '.join(re.sub(r'[^a-z0-9$%]+',' ',t).split())
src=subprocess.run(['pdftotext','/root/.claude/uploads/09fab164-a8d5-57c4-80fe-53fff964863d/4e48084c-10k_roadmap_final_5.pdf','-'],capture_output=True,text=True).stdout
out=subprocess.run(['pdftotext',sys.argv[1],'-'],capture_output=True,text=True).stdout
def sents(t):
    t=re.sub(r'-\n','-',t); t=re.sub(r'\n(?=[a-z,;(])',' ',t)
    res=[]
    for para in re.split(r'\n\s*\n|\n(?=[A-Z0-9•☐])',t):
        para=' '.join(para.split())
        for s in re.split(r'(?<=[.?!:])\s+(?=[A-Z"\'“‘])',para):
            n=norm(s)
            if len(n)>=28: res.append((s,n))
    return res
S=sents(src); O=sents(out); on=[n for _,n in O]; oj=' '.join(on)
bad=[]
for s,n in S:
    if n in oj: continue
    best=process.extractOne(n,on,scorer=fuzz.ratio)[1]/100 if 'fuzz' in dir() else max(ratio(n,x) for x in on)
    bad.append((round(best,2),s))
bad.sort()
print('source sentences',len(S),'not exact',len(bad))
for r,s in bad: print(r,'|',s[:170])
