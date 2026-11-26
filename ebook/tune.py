import subprocess, json, glob, os, re, sys
import numpy as np
from PIL import Image
def render():
    subprocess.run(['python3','build.py'],check=True,stdout=subprocess.DEVNULL)
    subprocess.run(['node','pdf.mjs','/tmp/ebook.html','/tmp/ebook.pdf'],cwd='/opt/node-tools',check=True)
def pages_tokens():
    n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo','/tmp/ebook.pdf'],capture_output=True,text=True).stdout).group(1))
    found={}
    for p in range(1,n+1):
        t=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'/tmp/ebook.pdf','-'],capture_output=True,text=True).stdout
        for k in re.findall(r'@@(\w+)@@',t): found.setdefault(k,p)
    return n,found
def fills():
    d='/tmp/aud'; os.makedirs(d,exist_ok=True)
    for f in glob.glob(d+'/*.png'): os.remove(f)
    subprocess.run(['pdftoppm','-r','40','-png','/tmp/ebook.pdf',d+'/p'],stderr=subprocess.DEVNULL)
    cream=np.array([0xFF,0xFD,0xF7]); res={}
    for f in sorted(glob.glob(d+'/p-*.png')):
        n=int(f.split('-')[-1].split('.')[0]); im=np.array(Image.open(f).convert('RGB')).astype(int); H,W,_=im.shape
        if im.mean()<90: res[n]=None; continue
        reg=im[int(.95*40):int(H-1.1*40), int(.95*40):int(W-.95*40)]
        rows=np.where((np.abs(reg-cream).sum(axis=2)>40).any(axis=1))[0]
        res[n]=0 if len(rows)==0 else rows.max()/reg.shape[0]
    return res
lh=json.load(open('/tmp/lh.json')) if os.path.exists('/tmp/lh.json') else {}
for it in range(7):
    render(); n,tok=pages_tokens(); fl=fills()
    starts=[tok.get(f'ch{i}') for i in range(1,10)]+[tok.get('concl')]
    changed=False; report=[]
    for i in range(1,10):
        nxt=starts[i]; last=nxt-2   # last content page (nxt-1 is recap)
        f=fl.get(last)
        report.append((i,last,None if f is None else round(f,2),lh.get(str(i),22)))
        if f is not None and f<0.42 and lh.get(str(i),22)>16:
            lh[str(i)]=lh.get(str(i),22)-2; changed=True
    print(it,n,report); json.dump(lh,open('/tmp/lh.json','w'))
    if not changed: break
