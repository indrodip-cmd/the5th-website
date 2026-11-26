import subprocess, sys, glob, os
from PIL import Image
import numpy as np
pdf=sys.argv[1]; d='/tmp/aud'; os.makedirs(d,exist_ok=True)
for f in glob.glob(d+'/*.png'): os.remove(f)
subprocess.run(['pdftoppm','-r','40','-png',pdf,d+'/p'],stderr=subprocess.DEVNULL)
cream=np.array([0xFF,0xFD,0xF7]); res=[]
for f in sorted(glob.glob(d+'/p-*.png')):
    n=int(f.split('-')[-1].split('.')[0]); im=np.array(Image.open(f).convert('RGB')).astype(int)
    H,W,_=im.shape
    if im[:,:,:].mean()<90: continue  # dark full-bleed page
    # inside panel region (x .45..W-.45 in), content rows: pixels differing from cream
    x0,x1=int(.95*40),int(W-.95*40); region=im[int(.95*40):int(H-1.1*40), x0:x1]
    diff=(np.abs(region-cream).sum(axis=2)>40)
    rows=np.where(diff.any(axis=1))[0]
    if len(rows)==0: res.append((n,0,0)); continue
    top=rows.min()/region.shape[0]; bot=rows.max()/region.shape[0]
    res.append((n,round(top,2),round(bot,2)))
print('sparse (<0.55):',[(n,float(b)) for n,t,b in res if b<0.55])
print('total pages',len(glob.glob(d+'/p-*.png')))
