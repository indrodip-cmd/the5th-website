# Expertise to Income: layout library (HTML -> PDF via Chromium). 7in x 10in trade workbook.
import base64, html as _h

FOREST = '#0C3A28'; DEEP = '#07200F'; LIME = '#C9FF48'; LEAF = '#9BE02A'; MINT = '#EAF8C8'
PAPER = '#FBF9F2'; INK = '#14201A'; MUTED = '#5C6B62'; AMBER = '#FFC94A'; CORAL = '#FF7A59'; TEAL = '#2FA866'; MID = '#1B7A52'

def esc(s): return _h.escape(s, quote=False)

CHAPTERS = ['Understand Your Why','Diagnose Your Current Situation','The Asset Mindset','Find Your Perfect Audience',
            'Design Your First Digital Product','Create a Simple Offer That Sells Itself','The Organic Content System',
            'Your Simple Launch Plan','Mindset for Consistent $10K Months']

def trail_svg(n, w=190, h=16):
    """Progress trail for page footers: 9 stops, n highlighted (1-9), 0 = none."""
    gap = (w - 16) / 8
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
           f'<line x1="8" y1="8" x2="{w-8}" y2="8" stroke="#C9D8CE" stroke-width="2" stroke-dasharray="3 3"/>']
    for i in range(9):
        cx = 8 + gap * i
        if i + 1 < n: out.append(f'<circle cx="{cx}" cy="8" r="4" fill="{MID}"/>')
        elif i + 1 == n: out.append(f'<circle cx="{cx}" cy="8" r="7" fill="{LIME}" stroke="{FOREST}" stroke-width="2"/>')
        else: out.append(f'<circle cx="{cx}" cy="8" r="3.5" fill="#FBF9F2" stroke="#9FB3A7" stroke-width="1.5"/>')
    out.append('</svg>')
    return 'data:image/svg+xml;base64,' + base64.b64encode(''.join(out).encode()).decode()

def page_rules():
    r = []
    for n in range(1, 10):
        r.append(f'@page ch{n} {{ @bottom-center {{ content: url("{trail_svg(n)}"); vertical-align: middle; }} }}')
    return '\n'.join(r)

CSS = '''
@page { size: 7in 10in; margin: 0.4in 0.4in 0.95in 0.4in; background: #DCE9D0;
  @bottom-left { content: counter(page); font: 700 8.5pt 'Inter'; color: #5C6B62; vertical-align: middle; }
  @bottom-right { content: "EXPERTISE TO INCOME"; font: 800 6.5pt 'Inter'; letter-spacing: .22em; color: #9FB3A7; vertical-align: middle; }
}
@page full { margin: 0; background: #07200F; @bottom-left{content:none} @bottom-right{content:none} @bottom-center{content:none} }
@page plain { @bottom-left{content:none} @bottom-right{content:none} @bottom-center{content:none} }
''' + page_rules() + '''
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html { background: #DCE9D0; }
.full { z-index: 5; }
body { font-family: 'Bitstream Charter', 'Charter', Georgia, serif; font-size: 11.2pt; line-height: 1.58; color: #14201A; }
.full { page: full; width: 7in; height: 10in; position: relative; overflow: hidden; break-after: page; break-before: page; }
.plain { page: plain; }
.flow, .pg-break { box-decoration-break: clone; -webkit-box-decoration-break: clone; padding: 0.5in 0.45in 0.45in; background: #FFFDF7; border-radius: 20px; box-shadow: 0 0 0 1px rgba(12,58,40,.06); }
.pg-break { break-before: page; }
h1,h2,h3,h4,.sans { font-family: 'Inter', sans-serif; }
p { margin: 0 0 .78em; orphans: 3; widows: 3; }
em { font-style: italic; }
strong { font-weight: 700; }

/* ---------- chapter body headings ---------- */
.kicker { font: 800 8pt 'Inter'; letter-spacing: .26em; text-transform: uppercase; color: #1B7A52; margin-bottom: 6px; }
h2 { font: 900 19pt/1.12 'Inter Display','Inter'; letter-spacing: -.02em; color: #0C3A28; margin: 1.5em 0 .5em; break-after: avoid; }
h2 .n { display:inline-block; background:#C9FF48; color:#0A2A1B; border-radius:7px; padding:1px 8px; font-size:11pt; margin-right:9px; vertical-align:3px; letter-spacing:0; }
h3 { font: 800 11.5pt/1.25 'Inter'; color: #0C3A28; margin: 1.2em 0 .4em; break-after: avoid; }
.by { font: 600 8.5pt 'Inter'; color:#5C6B62; margin: 0 0 14px; display:flex; align-items:center; gap:8px; }
.by i { width:22px; height:2px; background:#9BE02A; display:block; }
.lead { font-size: 12.2pt; line-height: 1.55; color:#0C3A28; }
.dropcap::first-letter { font: 900 44pt/0.82 'Inter Display'; float: left; padding: 5px 9px 0 0; color: #1B7A52; }

/* ---------- boxes ---------- */
.pull { margin: 1.1em 0 1.2em; padding: 14px 0 14px 20px; border-left: 5px solid #C9FF48; font: 800 15pt/1.28 'Inter Display','Inter'; letter-spacing:-.015em; color:#0C3A28; break-inside: avoid; }
.pull small { display:block; margin-top:6px; font: 600 8.5pt 'Inter'; color:#5C6B62; letter-spacing:0; }
.story { position: relative; margin: 1.1em 0 1.3em; padding: 16px 18px 12px 74px; background: #EAF8C8; border-radius: 14px; break-inside: avoid; font-size: 10.2pt; line-height: 1.52; }
.story .ic { position:absolute; left:14px; top:14px; width:46px; height:46px; border-radius:50%; background:#0C3A28; display:flex; align-items:center; justify-content:center; }
.story .tag { font: 800 7pt 'Inter'; letter-spacing:.22em; text-transform:uppercase; color:#1B7A52; margin-bottom:3px; }
.story p:last-child { margin-bottom: 4px; }
.call { margin: 1.1em 0; padding: 14px 18px; border-radius: 14px; background: #0C3A28; color:#F2FFD0; break-inside: avoid; font-size: 10.2pt; }
.call .t { font: 800 8pt 'Inter'; letter-spacing:.2em; text-transform:uppercase; color:#C9FF48; margin-bottom: 6px; }
.call p:last-child { margin-bottom: 0; }
.note { margin: 1.1em 0; padding: 13px 16px; border-radius: 12px; background:#fff; border:1.5px solid #D5E3D9; break-inside: avoid; font-size: 10pt; }
.note .t { font: 800 8pt 'Inter'; letter-spacing:.2em; text-transform:uppercase; color:#1B7A52; margin-bottom:5px; }
.note p:last-child { margin-bottom:0; }
.fig { margin: 1.1em -8px 1.3em; break-inside: avoid; text-align:center; }
.fig svg { max-width: 92%; height: auto; display:block; margin: 0 auto; }
.fig .cap { font: 600 8pt 'Inter'; color:#5C6B62; margin-top: 4px; }
.quote { margin: 0 0 1.1em; padding: 12px 16px; border-radius: 12px; background:#fff; border: 1.5px solid #D5E3D9; font-style: italic; font-size: 10.6pt; break-inside: avoid; }
.quote b { display:block; font: 700 8.5pt 'Inter'; font-style: normal; color:#1B7A52; margin-top: 4px; }

/* ---------- worksheets ---------- */
.ws { margin: 1.2em 0; border-radius: 14px; background:#fff; border: 1.5px solid #CFE0D4; }
.ws > .hd { border-radius: 12px 12px 0 0; }
.ws > .hd { break-after: avoid; background:#0C3A28; color:#C9FF48; font: 800 8.5pt 'Inter'; letter-spacing:.16em; text-transform:uppercase; padding: 9px 16px; display:flex; align-items:center; gap:8px; }
.ws > .hd .pen { width:16px; height:16px; }
.q { padding: 10px 16px 4px; border-top: 1px solid #E3EDE6; break-inside: avoid; }
.q:first-of-type { border-top: 0; }
.q b { font: 700 9.5pt/1.35 'Inter'; color:#14201A; display:block; }
.q .hint { font: 500 8.3pt/1.35 'Inter'; color:#5C6B62; display:block; margin-top:1px; }
.ln { height: 22px; border-bottom: 1.2px solid #BFD3C5; }
.ln.sp { height: 24px; }
.ws .tight .ln { height: 20px; }
.inline-blank { display:inline-block; border-bottom: 1.2px solid #1B7A52; min-width: 120px; height: 1em; vertical-align: -1px; }
.chk { list-style:none; margin: .6em 0 1em; }
.chk li { position:relative; padding: 5px 0 5px 30px; font-size: 10.2pt; line-height:1.4; break-inside: avoid; }
.chk li::before { content:''; position:absolute; left:2px; top:6px; width:15px; height:15px; border: 2px solid #1B7A52; border-radius:4px; background:#fff; }
.chk.done li::before { background:#C9FF48; }
.chk.done li::after { content:''; position:absolute; left:8px; top:9px; width:5px; height:9px; border: solid #0A2A1B; border-width: 0 2.5px 2.5px 0; transform: rotate(40deg); }
.bul { margin: .4em 0 1em 1.2em; } .bul li { margin-bottom:.35em; }
.recap { margin: 1.6em 0 0; border-radius: 16px; overflow:hidden; background:#0C3A28; color:#F2FFD0; break-inside: avoid; }
.recap .h { padding: 14px 20px 8px; display:flex; align-items:center; gap:12px; }
.recap .h .big { font: 900 15pt 'Inter Display'; color:#C9FF48; letter-spacing:-.01em; }
.recap .h .sub { font: 600 9pt 'Inter'; color:#CFE9D6; }
.recap .b { padding: 4px 20px 16px; font: 500 10pt/1.55 'Inter'; }
.recap .b .row { display:flex; align-items:baseline; gap:8px; margin-top: 8px; }
.recap .b .row span { white-space:nowrap; color:#CFE9D6; }
.recap .b .row i { flex:1; border-bottom: 1.2px solid #5F9A7C; height: 1em; display:block; min-width: 40px; }

/* ---------- table-ish ---------- */
.tbl { width:100%; border-collapse: separate; border-spacing: 0; margin: 1em 0; font: 500 9.3pt/1.4 'Inter'; break-inside: avoid; }
.tbl th { background:#0C3A28; color:#C9FF48; text-align:left; padding: 8px 10px; font-weight:800; font-size:8pt; letter-spacing:.14em; text-transform:uppercase; }
.tbl th:first-child { border-radius: 10px 0 0 0; } .tbl th:last-child { border-radius: 0 10px 0 0; }
.tbl td { padding: 8px 10px; border-bottom: 1px solid #DCE8E0; background:#fff; vertical-align: top; }
.tbl tr:nth-child(even) td { background:#F4F9EC; }
.tbl td:first-child { font-weight:800; color:#0C3A28; }
.grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 1em 0; }
.grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 1em 0; }
.card { border-radius: 14px; background:#fff; border:1.5px solid #D5E3D9; padding: 12px 14px; font: 500 9.3pt/1.45 'Inter'; break-inside: avoid; }
.card h4 { font: 800 10pt/1.2 'Inter'; color:#0C3A28; margin: 8px 0 4px; }
.card .ico { width:38px; height:38px; border-radius:11px; background:#EAF8C8; display:flex; align-items:center; justify-content:center; }
.card.dark { background:#0C3A28; border-color:#0C3A28; color:#E6F5D0; } .card.dark h4 { color:#C9FF48; }
.card.dark .ico { background:#1C4A32; }
.step { display:flex; gap: 14px; margin: 0 0 12px; padding: 12px 14px; background:#fff; border:1.5px solid #D5E3D9; border-radius: 14px; break-inside: avoid; font: 500 9.6pt/1.5 'Inter'; }
.step .num { flex:0 0 34px; height:34px; border-radius:50%; background:#C9FF48; color:#0A2A1B; font: 900 13pt/34px 'Inter Display'; text-align:center; }
.step h4 { font: 800 10.6pt 'Inter'; color:#0C3A28; margin-bottom: 4px; }
.step p { margin: 0 0 .4em; } .step p:last-child { margin: 0; }
.step .why { color:#5C6B62; font-size: 9pt; }
.write { margin:.6em 0 1.2em; border-radius:12px; border:1.5px dashed #9BC7A9; background:#fff; padding: 10px 16px 2px; break-inside: avoid; }
.write b { font: 700 9.3pt 'Inter'; display:block; }
.sig { display:flex; gap: 10px; align-items:flex-end; margin-top: 14px; font: 600 9.5pt 'Inter'; }
.sig i { flex:1; border-bottom: 1.5px solid #1B7A52; height: 18px; display:block; }
'''

def page_html(body):
    return f'<!doctype html><html><head><meta charset="utf-8"><title>Expertise to Income</title><style>{CSS}</style></head><body>{body}</body></html>'
