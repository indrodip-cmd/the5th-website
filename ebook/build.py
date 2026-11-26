import sys, re, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
from lib import page_html
import front
mods = []
for name in ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8','ch9','back']:
    try: mods.append(__import__(name))
    except ModuleNotFoundError: pass
parts = [front.cover_page(), front.title_page(), front.copyright_page(), front.note_page(), front.gratitude_page(), front.contents_page(), front.how_to_page(), front.intro()]
for m in mods:
    for fn in [f for f in dir(m) if re.fullmatch(r'ch\d|back', f)]: parts.append(getattr(m, fn)())
if os.environ.get('PRINT'):
    # no cover page in the interior (separate cover file), and no tuned digital-notes pages
    parts = parts[1:]
html = '\n'.join(parts)
pages = {}
if os.path.exists('/tmp/pages.json'):
    import json; pages = json.load(open('/tmp/pages.json'))
html = re.sub(r'@@pg:(\w+)@@', lambda m: str(pages.get(m.group(1), '')), html)
if os.environ.get('FINAL'): html = re.sub(r'<span style="font-size:1px;color:transparent;position:absolute">@@\w+@@</span>', '', html)
doc = page_html(html)
if os.environ.get('PRINT'): doc = doc.replace('</head>', '<style id="print">' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'print.css')).read() + '</style></head>', 1)
open(os.environ.get('OUTHTML', '/tmp/ebook.html'), 'w').write(doc)
print('html bytes', len(html))
