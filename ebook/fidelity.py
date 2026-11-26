import re, subprocess, sys
def words(t):
    t=t.lower().replace('’',"'").replace("'",'').replace('–',' to ').replace('&',' and ')
    return re.sub(r'[^a-z0-9$%]+',' ',t).split()
src=subprocess.run(['pdftotext','/root/.claude/uploads/09fab164-a8d5-57c4-80fe-53fff964863d/4e48084c-10k_roadmap_final_5.pdf','-'],capture_output=True,text=True).stdout
out=subprocess.run(['pdftotext',sys.argv[1],'-'],capture_output=True,text=True).stdout
S=words(src); O=words(out); N=4
oset={tuple(O[i:i+N]) for i in range(len(O)-N+1)}
miss=[i for i in range(len(S)-N+1) if tuple(S[i:i+N]) not in oset]
# cluster
spans=[]; 
for i in miss:
    if spans and i<=spans[-1][1]+1: spans[-1][1]=i
    else: spans.append([i,i])
print('source words',len(S),'missing 4-grams',len(miss),'spans',len(spans))
for a,b in spans:
    if b-a>=2: print(f'[{b-a+1:3d}]', ' '.join(S[max(0,a-2):b+N+2]))
