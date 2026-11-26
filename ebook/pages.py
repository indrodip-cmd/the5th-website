import subprocess, re, json, sys
pdf = sys.argv[1]
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
found = {}
for p in range(1, n + 1):
    t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout
    for k in re.findall(r'@@(\w+)@@', t):
        if k.startswith('pg'): continue
        found.setdefault(k, p)
json.dump(found, open('/tmp/pages.json', 'w')); print(found)
