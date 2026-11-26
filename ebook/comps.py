import re
from lib import *
import art
from art import icon, landscape

def sq(s):
    """Smart quotes outside of tags."""
    def fix(t):
        t = re.sub(r'(^|[\s(\[—])"', lambda m: m.group(1) + '“', t)
        t = t.replace('"', '”')
        t = re.sub(r"(^|[\s(\[—“])'", lambda m: m.group(1) + '‘', t)
        return t.replace("'", '’')
    return ''.join(p if p.startswith('<') else fix(p) for p in re.split(r'(<[^>]+>)', s))

def P(*xs, cls=''):
    return ''.join(f'<p class="{cls}">{sq(x)}</p>' if cls else f'<p>{sq(x)}</p>' for x in xs)
def LEAD(x): return f'<p class="lead dropcap">{sq(x)}</p>'
def H2(t, n=None): return f'<h2>{"<span class=n>"+str(n)+"</span>" if n else ""}{sq(t)}</h2>'
def H3(t): return f'<h3>{sq(t)}</h3>'
def PULL(t, by=''): return f'<div class="pull">{sq(t)}{"<small>"+sq(by)+"</small>" if by else ""}</div>'
def QUOTE(t, by): return f'<div class="quote">{sq(t)}<b>{sq(by)}</b></div>'
def STORY(tag, *paras, ic='heart'):
    return f'<div class="story"><div class="ic">{icon(ic, 26, "#C9FF48")}</div><div class="tag">{sq(tag)}</div>{P(*paras)}</div>'
def CALL(title, *paras): return f'<div class="call"><div class="t">{sq(title)}</div>{P(*paras)}</div>'
def NOTE(title, *paras): return f'<div class="note"><div class="t">{sq(title)}</div>{P(*paras)}</div>'
def FIG(s, cap=''): return f'<div class="fig">{s}{"<div class=cap>"+sq(cap)+"</div>" if cap else ""}</div>'
def BY(name): return f'<div class="by"><i></i>{name} &nbsp;·&nbsp; Co-Author, The5th Consulting</div>'
def CHK(items, done=False): return f'<ul class="chk{" done" if done else ""}">' + ''.join(f'<li>{sq(i)}</li>' for i in items) + '</ul>'
def BUL(items): return '<ul class="bul">' + ''.join(f'<li>{sq(i)}</li>' for i in items) + '</ul>'
def LN(n=3): return '<div class="ln"></div>' * n

def WS(title, qs, cls=''):
    """qs: list of (question, lines) or (question, lines, hint)."""
    pen = icon('pen', 16, '#C9FF48', 3)
    out = [f'<div class="ws {cls}"><div class="hd">{pen}{sq(title)}</div>']
    for q in qs:
        question, lines = q[0], q[1]; hint = q[2] if len(q) > 2 else ''
        out.append(f'<div class="q"><b>{sq(question)}</b>{"<span class=hint>"+sq(hint)+"</span>" if hint else ""}{LN(lines)}</div>')
    out.append('</div>'); return ''.join(out)

def WRITE(label, lines=2): return f'<div class="write"><b>{sq(label)}</b>{LN(lines)}</div>'

def RECAP(chapter_word, line, rows):
    rs = ''.join(f'<div class="row"><span>{sq(l)}</span><i></i></div>' for l in rows)
    return f'<div class="recap"><div class="h">{icon("flag", 30, "#C9FF48")}<div><div class="big">{chapter_word} COMPLETE.</div><div class="sub">{sq(line)}</div></div></div><div class="b">{rs}</div></div>'

def STEP(n, title, *paras, why=''):
    return f'<div class="step"><div class="num">{n}</div><div><h4>{sq(title)}</h4>{P(*paras)}{"<p class=why>"+sq(why)+"</p>" if why else ""}</div></div>'

def CARD(ic, title, body, dark=False):
    return f'<div class="card{" dark" if dark else ""}"><div class="ico">{icon(ic, 22, "#C9FF48" if dark else "#1B7A52")}</div><h4>{sq(title)}</h4>{sq(body)}</div>'

def TABLE(head, rows):
    return '<table class="tbl"><tr>' + ''.join(f'<th>{sq(h)}</th>' for h in head) + '</tr>' + ''.join('<tr>' + ''.join(f'<td>{sq(c)}</td>' for c in r) + '</tr>' for r in rows) + '</table>'

def chapter_open(n, word, title, author, quote, qby, promise):
    num = f'{n:02d}'
    t = sq(title)
    size = 50 if len(title) < 22 else (44 if len(title) < 34 else 38)
    return f'''<section class="full" style="background:linear-gradient(180deg,#07200F 0%,#0C3A28 52%,#07200F 100%)"><span style="font-size:1px;color:transparent;position:absolute">@@ch{n}@@</span>
  <div style="position:absolute;left:0;right:0;top:0;padding:54px 56px 0">
    <div style="display:flex;align-items:center;gap:12px;font:800 9pt 'Inter';letter-spacing:.3em;color:#C9FF48">STOP {n} OF 9 <span style="flex:1;height:2px;background:linear-gradient(90deg,#C9FF48,transparent)"></span></div>
    <div style="font:900 150px/.9 'Inter Display';letter-spacing:-.05em;color:transparent;-webkit-text-stroke:3px #C9FF48;margin:14px 0 4px">{num}</div>
    <div style="font:800 9pt 'Inter';letter-spacing:.3em;color:#9BE02A;text-transform:uppercase">{word}</div>
    <div style="font:900 {size}px/1.02 'Inter Display';letter-spacing:-.03em;color:#fff;margin-top:8px;max-width:520px">{t}</div>
    <div style="font:600 9.5pt 'Inter';color:#CFE9D6;margin-top:14px">{author}</div>
    <div style="margin-top:22px;padding:14px 18px;border-left:4px solid #C9FF48;background:rgba(201,255,72,.08);border-radius:0 12px 12px 0;max-width:470px;color:#F2FFD0;font:italic 11pt/1.45 'Bitstream Charter',serif">{sq(quote)}<div style="font:700 8.5pt 'Inter';font-style:normal;color:#C9FF48;margin-top:6px">{sq(qby)}</div></div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0">{landscape(n)}
    <div style="position:absolute;left:40px;right:40px;bottom:34px;text-align:center;font:800 11pt/1.3 'Inter Display';color:#0A2A1B;background:#C9FF48;border-radius:14px;padding:11px 16px">{sq(promise)}</div></div>
</section>'''

def chapter_start(n):
    return f'<div class="flow" style="page:ch{n};break-before:page">'
def chapter_end(): return '</div>'

def section_page(kicker, title, sub, art_html='', dark=True, tokk=''):
    bg = 'linear-gradient(180deg,#07200F,#0C3A28)' if dark else '#FBF9F2'
    t = f'<span style="font-size:1px;color:transparent;position:absolute">@@{tokk}@@</span>' if tokk else ''
    return f'''<section class="full" style="background:{bg}">{t}
 <div style="position:absolute;left:56px;right:56px;top:96px"><div class="kicker" style="color:#9BE02A">{kicker}</div>
 <div style="font:900 46px/1.04 'Inter Display';letter-spacing:-.03em;color:#fff">{sq(title)}</div>
 <div style="font:500 12pt/1.5 'Bitstream Charter',serif;color:#CFE9D6;margin-top:16px;max-width:460px">{sq(sub)}</div></div>
 <div style="position:absolute;left:0;right:0;bottom:0">{art_html}</div></section>'''
