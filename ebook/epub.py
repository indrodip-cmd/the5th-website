"""Build the Kindle (reflowable EPUB 3) edition of Expertise to Income.

Input : /tmp/ebook-amazon-tokens.html   (book HTML built with AMAZON=1, section tokens present)
        /tmp/ebook-amazon-final.html    (same without tokens; used only to rasterise the diagrams)
Output: amazon/expertise-to-income.epub

Design rules for the ebook edition
 - Reflowable text: no fixed page frames, no columns/grids, readers can resize type.
 - Diagrams become PNG images (Kindle does not reliably render inline SVG).
 - Worksheet boxes keep every question but drop the blank writing lines.
 - No external promotions (the print/PDF edition's free-call and bonus pages are not in the Amazon edition).
"""
import os, re, sys, uuid, zipfile, html, subprocess, base64, datetime
from bs4 import BeautifulSoup, NavigableString, Tag

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'amazon', 'expertise-to-income.epub')
WORK = '/tmp/epub-build'
os.makedirs(WORK + '/images', exist_ok=True)

TITLE = 'Expertise to Income'
SUBTITLE = 'The 10K Roadmap Workbook'
AUTHORS = ['Indrodip Ghosh', 'Christinee Mathison']

# ---------------------------------------------------------------- 1. rasterise diagrams
def rasterise(final_html: str) -> int:
    js = f"""
import {{ chromium }} from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({{ viewport: {{ width: 800, height: 900 }}, deviceScaleFactor: 2 }})
await p.goto('file://{final_html}'); await p.waitForTimeout(800)
await p.addStyleTag({{ content: 'html,body{{background:#fff!important}} .fig{{margin:0!important}}' }})
const figs = await p.$$('.fig > svg')
let n = 0
for (const f of figs) {{ n++; await f.screenshot({{ path: '{WORK}/images/fig-' + n + '.png' }}) }}
console.log(n); await b.close()
"""
    open('/opt/node-tools/rast.mjs', 'w').write(js)
    out = subprocess.run(['node', 'rast.mjs'], cwd='/opt/node-tools', capture_output=True, text=True, timeout=300)
    os.remove('/opt/node-tools/rast.mjs')
    return int(out.stdout.strip().split()[-1])

# ---------------------------------------------------------------- 2. HTML -> clean XHTML
esc = lambda s: html.escape(s, quote=False)
fig_counter = [0]
images_used = []

def text_of(n): return re.sub(r'\s+', ' ', n.get_text(' ', strip=True)).strip()

def inline(n):
    """Children as inline XHTML, keeping only b/i/em/strong/br/a."""
    out = []
    for c in n.children:
        if isinstance(c, NavigableString): out.append(esc(str(c)))
        elif c.name in ('b', 'strong'): out.append('<strong>' + inline(c) + '</strong>')
        elif c.name in ('i', 'em'): out.append('<em>' + inline(c) + '</em>')
        elif c.name == 'br': out.append('<br/>')
        elif c.name == 'a': out.append(f'<a href="{html.escape(c.get("href", "#"))}">{inline(c)}</a>')
        elif c.name == 'svg': continue
        elif c.name == 'span' and 'n' in (c.get('class') or []): out.append(esc(text_of(c)) + '. ')
        elif c.name in ('span', 'small', 'u', 'font', 'label'): out.append(inline(c))
        elif c.name == 'img': continue
        else: out.append(esc(text_of(c)) + ' ')
    return re.sub(r'\s+', ' ', ''.join(out)).strip()

BLOCKISH = {'div', 'section', 'p', 'ul', 'ol', 'table', 'h1', 'h2', 'h3', 'h4', 'blockquote'}
def has_block(n): return any(isinstance(c, Tag) and (c.name in BLOCKISH) for c in n.children)

def conv(n, ctx):
    if isinstance(n, NavigableString): return ''
    cls = set(n.get('class') or [])
    name = n.name
    if name in ('svg', 'style', 'script', 'img'):
        if name == 'img' and ctx.get('keep_images') and n.get('src', '').startswith('data:') and int(re.sub(r'\D', '', n.get('style', '').split('width:')[-1][:4]) or 0) >= 100:
            return ''
        return ''
    if 'ln' in cls or 'pg-break' in cls and False: return ''
    if 'fig' in cls:
        if n.find('svg'):
            fig_counter[0] += 1; k = fig_counter[0]
            images_used.append(f'fig-{k}.png')
            cap = n.find(class_='cap')
            alt = esc(text_of(cap)) if cap else 'Diagram'
            return f'<div class="fig"><img src="images/fig-{k}.png" alt="{alt}"/>' + (f'<p class="cap">{esc(text_of(cap))}</p>' if cap else '') + '</div>\n'
        return ''
    if 'ws' in cls:
        hd = n.find(class_='hd'); out = ['<div class="ws">']
        if hd: out.append(f'<p class="wsh">{esc(text_of(hd))}</p>')
        for c in n.children:
            if not isinstance(c, Tag) or c is hd: continue
            if 'q' in (c.get('class') or []):
                b = c.find('b'); hint = c.find(class_='hint')
                out.append('<p class="q">' + (f'<strong>{inline(b)}</strong>' if b else '') + (f' <span class="hint">{esc(text_of(hint))}</span>' if hint else '') + '</p>')
            else: out.append(conv(c, ctx))
        out.append('</div>\n'); return ''.join(out)
    if 'write' in cls:
        b = n.find('b'); return f'<div class="ws"><p class="q"><strong>{inline(b) if b else esc(text_of(n))}</strong></p></div>\n'
    if 'tbl' in cls or name == 'table':
        rows = []
        for tr in n.find_all('tr'):
            cells = tr.find_all(['th', 'td'])
            rows.append('<tr>' + ''.join(f'<{c.name}>{inline(c)}</{c.name}>' for c in cells) + '</tr>')
        return '<table>' + ''.join(rows) + '</table>\n'
    if name in ('ul', 'ol'):
        return f'<{name}>' + ''.join(f'<li>{inline(li)}</li>' for li in n.find_all('li', recursive=False)) + f'</{name}>\n'
    if name in ('h1', 'h2', 'h3', 'h4'):
        t = inline(n)
        return f'<{name if name != "h4" else "h4"}>{t}</{name}>\n' if t else ''
    if name == 'p':
        t = inline(n); return f'<p class="{" ".join(c for c in cls if c in ("lead", "kicker", "by", "why", "cap"))}">{t}</p>\n' if t else ''
    if 'step' in cls:
        num = n.find(class_='num'); body = [c for c in n.find_all('div', recursive=False)][-1] if n.find_all('div', recursive=False) else n
        h4 = body.find('h4'); out = [f'<div class="step"><p class="steph">{esc(text_of(num)) + ". " if num else ""}{esc(text_of(h4)) if h4 else ""}</p>']
        for p in body.find_all('p', recursive=False): out.append(f'<p>{inline(p)}</p>')
        out.append('</div>\n'); return ''.join(out)
    if 'card' in cls:
        h4 = n.find('h4'); out = ['<div class="card">']
        if h4: out.append(f'<p class="cardh">{inline(h4)}</p>')
        txt = ''.join(esc(str(c)) for c in n.children if isinstance(c, NavigableString)).strip()
        if txt: out.append(f'<p>{txt}</p>')
        for c in n.children:
            if isinstance(c, Tag) and c.name in ('ul', 'p'): out.append(conv(c, ctx))
        out.append('</div>\n'); return ''.join(out)
    if cls & {'call', 'note', 'story', 'quote'} or 'pull' in cls:
        kind = 'pull' if 'pull' in cls else ('call' if 'call' in cls else ('note' if 'note' in cls else ('story' if 'story' in cls else 'quote')))
        out = [f'<div class="{kind}">']
        for c in n.children:
            if not isinstance(c, Tag): 
                t = str(c).strip()
                if t: out.append(f'<p>{esc(t)}</p>')
                continue
            cc = set(c.get('class') or [])
            if cc & {'t', 'tag'}: out.append(f'<p class="label">{esc(text_of(c))}</p>')
            elif 'ic' in cc or c.name == 'small' and kind == 'pull': 
                if c.name == 'small': out.append(f'<p class="small">{esc(text_of(c))}</p>')
            elif c.name == 'b': out.append(f'<p class="small"><strong>{esc(text_of(c))}</strong></p>')
            elif c.name == 'p': out.append(f'<p>{inline(c)}</p>')
            else: out.append(conv(c, ctx))
        # pull quotes / quotes have text directly
        if kind in ('pull', 'quote') and len(out) == 1: out.append(f'<p>{inline(n)}</p>')
        out.append('</div>\n'); return ''.join(out)
    if 'kicker' in cls: return f'<p class="kicker">{esc(text_of(n))}</p>\n'
    if 'by' in cls: return f'<p class="by">{esc(text_of(n))}</p>\n'
    if 'chk' in cls: return '<ul>' + ''.join(f'<li>{inline(li)}</li>' for li in n.find_all('li')) + '</ul>\n'
    if 'recap' in cls:
        big = n.find(class_='big'); sub = n.find(class_='sub')
        out = [f'<div class="note"><p class="label">{esc(text_of(big)) if big else "Chapter complete"}</p>']
        if sub: out.append(f'<p>{esc(text_of(sub))}</p>')
        out.append('<ul>' + ''.join(f'<li>{esc(text_of(r))}</li>' for r in n.find_all(class_='row')) + '</ul></div>\n'); return ''.join(out)
    # chat bubbles & plain text divs: any div with no block children becomes a paragraph
    if name in ('div', 'section', 'span', 'body', 'main'):
        if not has_block(n):
            t = inline(n)
            if not t: return ''
            # message bubbles (script examples) look like blockquotes
            return f'<p>{t}</p>\n'
        out = []
        buf = []
        for c in n.children:
            if isinstance(c, Tag): out.append(conv(c, ctx))
        return ''.join(out)
    return ''

# --- special pages -------------------------------------------------------
def chapter_opener(sec):
    txt = [text_of(d) for d in sec.find_all('div')]
    num = re.search(r'STOP (\d) OF 9', sec.get_text(' ')); 
    title = None
    big = [d for d in sec.find_all('div') if re.search(r"Inter Display';letter-spacing:-.03em;color:#fff", d.get('style', ''))]
    title = text_of(big[0]) if big else ''
    quote = sec.find('div', style=re.compile('border-left:4px'))
    q = ''
    if quote:
        inner = quote.find('div'); qt = ''.join(str(c) for c in quote.children if isinstance(c, NavigableString)).strip()
        qb = text_of(inner) if inner else ''
        q = f'<blockquote><p>{esc(qt)}</p>' + (f'<p class="small">{esc(qb)}</p>' if qb else '') + '</blockquote>'
    author = ''
    m = re.search(r'(Indrodip Ghosh|Christinee Mathison)\s*·\s*Co-Author', sec.get_text(' '))
    if m: author = m.group(1)
    n = int(num.group(1)) if num else 0
    return n, title, f'<h1 class="chap"><span class="chnum">Chapter {n}</span><br/>{esc(title)}</h1>\n{q}\n'

def section_page(sec):
    # intro / conclusion divider pages
    kick = sec.find(class_='kicker'); title = None; sub = None
    for d in sec.find_all('div'):
        st = d.get('style', '')
        if "font:900 46px" in st: title = text_of(d)
        elif "font:500 12pt" in st: sub = text_of(d)
    return (text_of(kick) if kick else '', title or '', sub or '')

def letter_page(sec):
    out = ['<h1>You earned this. Claim it.</h1>']
    for p in sec.find_all('p'):
        t = inline(p)
        if t: out.append(f'<p>{t}</p>')
    for d in sec.find_all('div'):
        if "font:800 15pt" in d.get('style', ''): out.append(f'<p class="pull">{esc(text_of(d))}</p>')
    return '\n'.join(out) + '\n'

def title_page_xhtml():
    return f'<div class="titlepage"><h1>{TITLE}</h1><p class="sub">{SUBTITLE}</p><p class="tag">Stop selling your time. Start building an asset.</p><p class="auth">{AUTHORS[0]}<br/>and {AUTHORS[1]}</p></div>'

def page(title, body, extra_cls=''):
    return f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head><meta charset="utf-8"/><title>{esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body class="{extra_cls}">
{body}
</body></html>'''

# ---------------------------------------------------------------- 3. assemble
def main():
    n_figs = rasterise('/tmp/ebook-amazon-final.html')
    soup = BeautifulSoup(open('/tmp/ebook-amazon-tokens.html', encoding='utf-8').read(), 'lxml')
    kids = [c for c in soup.body.children if isinstance(c, Tag)]
    # group blocks by token
    groups = []; cur = None
    for k in kids:
        m = re.search(r'@@([a-z0-9]+)@@', str(k)[:400])
        if m and not str(k).startswith('<span'):
            cur = {'key': m.group(1), 'blocks': [k]}; groups.append(cur)
        elif cur is None: groups.append({'key': None, 'blocks': [k]}); cur = groups[-1]
        else: cur['blocks'].append(k)
    for g in soup.find_all(string=re.compile('@@[a-z0-9]+@@')): g.replace_with(NavigableString(re.sub(r'@@[a-z0-9]+@@', '', str(g))))
    files = []   # (filename, title, xhtml, in_toc)

    # front matter: title page, copyright, note, gratitude (skip contents; the e-reader TOC replaces it)
    front = [g for g in groups if g['key'] is None or g['key'] == 'how']
    pre = groups[0]['blocks'] if groups[0]['key'] is None else []
    fm_blocks = pre[:7]  # cover, title, copyright, note, gratitude, contents, (how is its own group)
    fi = 1
    files.append(('title.xhtml', 'Title Page', page(TITLE, title_page_xhtml()), False))
    ctx = {}
    copy = conv(fm_blocks[2], ctx)  # copyright (plain section)
    files.append(('copyright.xhtml', 'Copyright', page('Copyright', copy, 'copyright'), False))
    note = conv(fm_blocks[3], ctx) + conv(fm_blocks[4], ctx)
    files.append(('note.xhtml', 'A Note on This Book', page('A Note on This Book', note), True))

    for g in groups:
        k = g['key']
        if k is None: continue
        blocks = g['blocks']
        if k == 'how':
            body = ''.join(conv(b, ctx) for b in blocks)
            body += '<div class="note"><p class="label">Using the ebook edition</p><p>Wherever you see a worksheet, write your answers in a notebook or a notes app. The questions are all here; you simply supply the space.</p></div>'
            files.append((f'how.xhtml', 'How to Use This Workbook', page('How to Use This Workbook', body), True))
        elif k in ('intro', 'concl'):
            kick, title, sub = section_page(blocks[0])
            head = f'<h1>{esc(title)}</h1><p class="by">{esc(sub)}</p>'
            body = head + ''.join(conv(b, ctx) for b in blocks[1:])
            files.append((f'{k}.xhtml', title if k == 'intro' else 'Conclusion: Your Roadmap and Your Next 24 Hours', page(title, body), True))
        elif k.startswith('ch'):
            n, title, head = chapter_opener(blocks[0])
            body = head
            for b in blocks[1:]: body += conv(b, ctx)
            files.append((f'{k}.xhtml', f'Chapter {n}: {title}', page(title, body), True))
        elif k == 'letter':
            body = letter_page(blocks[0]) + ''.join(conv(b, {}) for b in blocks[1:])
            files.append(('letter.xhtml', 'A Letter from Indrodip', page('A Letter from Indrodip', body), True))
        elif k == 'about':
            body = ''.join(conv(b, ctx) for b in blocks)
            files.append(('about.xhtml', 'About the Authors', page('About the Authors', body), True))
    print('figures rasterised', n_figs, '| figures placed', fig_counter[0], '| files', len(files))

    css = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'epub.css')).read()
    uid = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://the5thglobal.consulting/book'))
    nav_items = ''.join(f'<li><a href="{f}">{esc(t)}</a></li>' for f, t, _, toc in files if toc)
    nav = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>Contents</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>
<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>{nav_items}</ol></nav>
<nav epub:type="landmarks" hidden="hidden"><ol><li><a epub:type="cover" href="cover.xhtml">Cover</a></li><li><a epub:type="bodymatter" href="note.xhtml">Start</a></li></ol></nav></body></html>'''
    ncx_pts = ''.join(f'<navPoint id="n{i}" playOrder="{i}"><navLabel><text>{esc(t)}</text></navLabel><content src="{f}"/></navPoint>' for i, (f, t, _, toc) in enumerate([x for x in files if x[3]], 1))
    ncx = f'<?xml version="1.0" encoding="utf-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="{uid}"/></head><docTitle><text>{TITLE}</text></docTitle><navMap>{ncx_pts}</navMap></ncx>'
    cover_x = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="utf-8"/><title>Cover</title><style>body{margin:0;text-align:center}img{max-width:100%;max-height:100%}</style></head><body><img src="images/cover.jpg" alt="Expertise to Income cover"/></body></html>'
    manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>', '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>', '<item id="css" href="style.css" media-type="text/css"/>',
                '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>', '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>']
    spine = ['<itemref idref="cover" linear="no"/>']
    for i, (f, t, x, toc) in enumerate(files): manifest.append(f'<item id="c{i}" href="{f}" media-type="application/xhtml+xml"/>'); spine.append(f'<itemref idref="c{i}"/>')
    for im in images_used: manifest.append(f'<item id="{im[:-4]}" href="images/{im}" media-type="image/png"/>')
    opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">{uid}</dc:identifier><dc:title>{TITLE}: {SUBTITLE}</dc:title><dc:language>en</dc:language>
<dc:creator id="a1">{AUTHORS[0]}</dc:creator><dc:creator id="a2">{AUTHORS[1]}</dc:creator><dc:publisher>The5th Global Consulting</dc:publisher>
<dc:rights>Copyright {datetime.date.today().year} The5th Consulting. All rights reserved.</dc:rights><dc:subject>Business and Economics: Entrepreneurship</dc:subject>
<dc:description>A step-by-step workbook that takes coaches, consultants and healers from expertise to a finished digital product, a simple offer and a 7-day launch plan.</dc:description>
<meta property="dcterms:modified">{datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}</meta><meta name="cover" content="cover-image"/></metadata>
<manifest>{''.join(manifest)}</manifest><spine toc="ncx">{''.join(spine)}</spine></package>'''
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with zipfile.ZipFile(OUT, 'w') as z:
        z.writestr(zipfile.ZipInfo('mimetype'), 'application/epub+zip')   # must be first and stored
        z.writestr('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>', compress_type=zipfile.ZIP_DEFLATED)
        z.writestr('OEBPS/content.opf', opf, compress_type=zipfile.ZIP_DEFLATED); z.writestr('OEBPS/nav.xhtml', nav, compress_type=zipfile.ZIP_DEFLATED); z.writestr('OEBPS/toc.ncx', ncx, compress_type=zipfile.ZIP_DEFLATED)
        z.writestr('OEBPS/style.css', css, compress_type=zipfile.ZIP_DEFLATED); z.writestr('OEBPS/cover.xhtml', cover_x, compress_type=zipfile.ZIP_DEFLATED)
        z.write(os.path.join(os.path.dirname(OUT), 'kindle-cover-1600x2560.jpg'), 'OEBPS/images/cover.jpg', compress_type=zipfile.ZIP_STORED)
        for f, t, x, toc in files: z.writestr('OEBPS/' + f, x, compress_type=zipfile.ZIP_DEFLATED)
        for im in images_used: z.write(f'{WORK}/images/{im}', f'OEBPS/images/{im}', compress_type=zipfile.ZIP_STORED)
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')

main()
