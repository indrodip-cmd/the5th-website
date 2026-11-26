# Vector art for the ebook: icons, chapter scenes, diagrams. Flat style, funnel palette.
import math
from lib import *

def svg(w, h, inner, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {extra}>{inner}</svg>'

# ---------- icons (48x48, stroke) ----------
_I = {
 'target': '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3" fill="CUR"/><path d="M24 24 L40 8 M34 8h6v6"/>',
 'compass': '<circle cx="24" cy="24" r="18"/><path d="M31 17 L27 27 L17 31 L21 21 Z" fill="CUR"/>',
 'key': '<circle cx="16" cy="24" r="8"/><path d="M24 24h18M36 24v7M42 24v5"/>',
 'rocket': '<path d="M24 6c8 4 12 12 10 22l-6 6h-8l-6-6C12 18 16 10 24 6z"/><circle cx="24" cy="19" r="3.5" fill="CUR"/><path d="M14 30l-6 4 2 6 8-4M34 30l6 4-2 6-8-4"/>',
 'coin': '<ellipse cx="24" cy="14" rx="14" ry="6"/><path d="M10 14v10c0 3.3 6.3 6 14 6s14-2.7 14-6V14M10 24v10c0 3.3 6.3 6 14 6s14-2.7 14-6V24"/>',
 'bulb': '<path d="M17 33c0-3-5-6-5-12a12 12 0 0 1 24 0c0 6-5 9-5 12z"/><path d="M18 38h12M20 43h8"/>',
 'book': '<path d="M8 10c6-2 12-2 16 2 4-4 10-4 16-2v28c-6-2-12-2-16 2-4-4-10-4-16-2z"/><path d="M24 12v28"/>',
 'play': '<rect x="6" y="10" width="36" height="28" rx="7"/><path d="M20 17l11 7-11 7z" fill="CUR"/>',
 'grid': '<rect x="8" y="8" width="14" height="14" rx="3"/><rect x="26" y="8" width="14" height="14" rx="3"/><rect x="8" y="26" width="14" height="14" rx="3"/><rect x="26" y="26" width="14" height="14" rx="3" fill="CUR"/>',
 'chat': '<path d="M8 10h32a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H26l-9 8v-8H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"/><path d="M15 18h18M15 25h11"/>',
 'heart': '<path d="M24 41C8 29 6 20 11 14c4-4 10-3 13 2 3-5 9-6 13-2 5 6 3 15-13 27z"/>',
 'clock': '<circle cx="24" cy="24" r="18"/><path d="M24 12v13l9 5"/>',
 'flag': '<path d="M12 6v38M12 8h26l-6 9 6 9H12"/>',
 'shield': '<path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z"/><path d="M17 24l5 5 9-10"/>',
 'mail': '<rect x="5" y="10" width="38" height="28" rx="5"/><path d="M7 14l17 13 17-13"/>',
 'calendar': '<rect x="7" y="10" width="34" height="31" rx="5"/><path d="M7 19h34M16 6v8M32 6v8"/><circle cx="17" cy="28" r="2" fill="CUR"/><circle cx="24" cy="28" r="2" fill="CUR"/><circle cx="31" cy="28" r="2" fill="CUR"/>',
 'check': '<circle cx="24" cy="24" r="18"/><path d="M15 25l6 6 12-13"/>',
 'star': '<path d="M24 5l5.6 12.2 13.4 1.5-10 9 2.8 13.1L24 34l-11.8 6.8 2.8-13.1-10-9 13.4-1.5z"/>',
 'user': '<circle cx="24" cy="16" r="8"/><path d="M8 42c0-9 7-14 16-14s16 5 16 14"/>',
 'tag': '<path d="M6 24V8h16l20 20-16 16z"/><circle cx="15" cy="17" r="3" fill="CUR"/>',
 'chart': '<path d="M6 40h36M10 32l9-9 7 6 13-15"/><path d="M33 14h6v6"/>',
 'lock': '<rect x="9" y="21" width="30" height="21" rx="5"/><path d="M15 21v-6a9 9 0 0 1 18 0v6"/>',
 'pen': '<path d="M8 40l3-10L33 8l7 7-22 22z"/><path d="M28 13l7 7"/>',
 'mega': '<path d="M8 20h8l16-9v26l-16-9H8z"/><path d="M16 29l3 11h6l-3-11M38 18a8 8 0 0 1 0 12"/>',
 'sprout': '<path d="M24 42V22"/><path d="M24 26c0-8-6-12-14-12 0 8 5 12 14 12zM24 22c0-7 5-11 13-11 0 7-5 11-13 11z"/>',
 'mountain': '<path d="M3 40L18 14l8 13 5-7 14 20z"/>',
 'sun': '<circle cx="24" cy="24" r="8"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4"/>',
 'gift': '<rect x="6" y="18" width="36" height="24" rx="3"/><path d="M6 26h36M24 18v24M24 18c-6-8-14-6-12-1 1 3 7 1 12 1zm0 0c6-8 14-6 12-1-1 3-7 1-12 1z"/>',
}
def icon(name, size=28, stroke='#C9FF48', sw=3, cur=None):
    inner = _I[name].replace('CUR', cur or stroke)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="{size}" height="{size}" fill="none" '
            f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>')

# ---------- plants ----------
def frond(x, y, ln, ang, col, leaf, n=13):
    p = [f'<g transform="translate({x} {y}) rotate({ang})">',
         f'<path d="M0 0 C {ln*.1:.1f} {-ln*.35:.1f} {ln*.05:.1f} {-ln*.7:.1f} {ln*.18:.1f} {-ln:.1f}" stroke="{col}" stroke-width="3" fill="none" stroke-linecap="round"/>']
    for i in range(1, n + 1):
        t = i / (n + 1); cx = ln*.18*t*t*1.5 + ln*.02*t; cy = -ln*t; sz = leaf*(1 - t*.78)
        for s in (-1, 1):
            p.append(f'<path d="M{cx:.1f} {cy:.1f} C {cx+s*sz*.5:.1f} {cy-sz*.55:.1f} {cx+s*sz:.1f} {cy-sz*.5:.1f} {cx+s*sz*1.45:.1f} {cy-sz*.9:.1f} '
                     f'C {cx+s*sz*1.05:.1f} {cy-sz*.05:.1f} {cx+s*sz*.5:.1f} {cy+sz*.1:.1f} {cx:.1f} {cy:.1f} Z" fill="{col}"/>')
    p.append('</g>'); return ''.join(p)
def bigleaf(x, y, sc, rot, fill):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({sc})"><path d="M0 0 C 40 -40 110 -50 150 -10 C 100 20 40 20 0 0 Z" fill="{fill}"/>'
            f'<path d="M4 -2 C 50 -14 100 -22 140 -12" stroke="rgba(0,0,0,.25)" stroke-width="2.2" fill="none"/></g>')

# ---------- chapter-opener scene ----------
def _smooth(pts):
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    for i in range(len(pts) - 1):
        p0 = pts[i-1] if i else pts[i]; p1 = pts[i]; p2 = pts[i+1]; p3 = pts[i+2] if i+2 < len(pts) else pts[i+1]
        c1 = (p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6); c2 = (p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6)
        d += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return d

def trail_points(w=672, h=470):
    xs = [60, 175, 130, 255, 205, 345, 395, 480, 560]  # zigzag climb
    ys = [h-40, h-95, h-150, h-205, h-255, h-300, h-340, h-372, h-398]
    return list(zip(xs, ys))

def landscape(n, w=672, h=470, sun=True):
    pts = trail_points(w, h)
    path = _smooth(pts)
    o = [f'<defs><linearGradient id="sky{n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B2E1F"/><stop offset="1" stop-color="#17583B"/></linearGradient></defs>',
         f'<rect width="{w}" height="{h}" fill="url(#sky{n})"/>']
    if sun:
        o.append(f'<circle cx="{500}" cy="{150}" r="120" fill="{LIME}" opacity=".10"/><circle cx="500" cy="150" r="78" fill="{LIME}" opacity=".18"/><circle cx="500" cy="150" r="46" fill="{LIME}"/>')
    for sx, sy, r in [(70,60,1.8),(150,110,1.2),(250,50,1.6),(330,95,1.2),(40,150,1.2),(610,70,1.6),(420,40,1.2)]:
        o.append(f'<circle cx="{sx}" cy="{sy}" r="{r}" fill="#E9FFB0" opacity=".75"/>')
    o.append(f'<path d="M0 {h*.62:.0f} C 120 {h*.40:.0f} 220 {h*.55:.0f} 330 {h*.45:.0f} S 560 {h*.30:.0f} {w} {h*.42:.0f} V{h} H0Z" fill="#14573A"/>')
    o.append(f'<path d="M0 {h*.72:.0f} C 100 {h*.56:.0f} 210 {h*.70:.0f} 340 {h*.58:.0f} S 580 {h*.55:.0f} {w} {h*.60:.0f} V{h} H0Z" fill="#1B7A52"/>')
    o.append(f'<path d="M0 {h*.86:.0f} C 140 {h*.72:.0f} 260 {h*.84:.0f} 400 {h*.74:.0f} S 600 {h*.74:.0f} {w} {h*.78:.0f} V{h} H0Z" fill="#2FA866"/>')
    o.append(f'<path d="M0 {h*.96:.0f} C 200 {h*.88:.0f} 380 {h*.97:.0f} {w} {h*.90:.0f} V{h} H0Z" fill="#0A2A1B"/>')
    o.append(f'<path d="{path}" stroke="#F4F0DA" stroke-width="13" fill="none" stroke-linecap="round" opacity=".92"/>')
    o.append(f'<path d="{path}" stroke="#0A2A1B" stroke-width="2" fill="none" stroke-dasharray="2 9" stroke-linecap="round" opacity=".5"/>')
    for i, (x, y) in enumerate(pts, 1):
        if i < n: o.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{LIME}" stroke="#0A2A1B" stroke-width="2.5"/>')
        elif i == n:
            o.append(f'<circle cx="{x}" cy="{y}" r="22" fill="{LIME}" opacity=".25"/><circle cx="{x}" cy="{y}" r="13" fill="{LIME}" stroke="#0A2A1B" stroke-width="3"/>'
                     f'<path d="M{x} {y-13} V{y-58}" stroke="#0A2A1B" stroke-width="3.5" stroke-linecap="round"/><path d="M{x} {y-58} h30 l-8 10 8 10 h-30z" fill="{CORAL}"/>')
        else: o.append(f'<circle cx="{x}" cy="{y}" r="7" fill="#0C3A28" stroke="#F4F0DA" stroke-width="2.5" stroke-dasharray="3 3"/>')
    o.append(frond(30, h+10, 170, -8, '#1B7A52', 32) + frond(95, h+12, 120, 12, '#2FA866', 26) + frond(w-30, h+10, 180, 10, '#1B7A52', 34) + frond(w-100, h+14, 130, -14, LEAF, 26))
    o.append(bigleaf(w*.43, h+4, 1.0, -58, '#9BE02A') + bigleaf(w*.55, h+4, .95, -122, LIME))
    return svg(w, h, ''.join(o), 'style="display:block;width:100%;height:auto"')

# ---------- small people ----------
def person(x, y, s=1.0, shirt=LIME, skin='#E8B48B', hair='#2A1A12', ring=None):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-30 90c0-34 14-52 30-52s30 18 30 52z" fill="{shirt}"/><rect x="-7" y="26" width="14" height="14" rx="5" fill="{skin}"/>'
            f'<circle cx="0" cy="10" r="23" fill="{skin}"/><path d="M-24 6c0-16 10-24 24-24s24 8 24 24c-6-8-14-11-24-11S-18-2-24 6z" fill="{hair}"/></g>')

def bubble(x, y, w, h, text, fill='#fff', col='#14201A', size=11, tail='l'):
    lines = text.split('|'); ty = y + h/2 - (len(lines)-1)*size*.62 + size*.35
    t = ''.join(f'<text x="{x+w/2}" y="{ty+i*size*1.25:.1f}" font-family="Inter" font-weight="600" font-size="{size}" fill="{col}" text-anchor="middle">{esc(l)}</text>' for i, l in enumerate(lines))
    tl = f'<path d="M{x+16} {y+h-1} l-6 12 l20 -12z" fill="{fill}"/>' if tail == 'l' else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}"/>{tl}{t}'

def txt(x, y, s, size=12, fill='#14201A', weight=600, anchor='middle', fam='Inter', extra=''):
    if s.startswith('"'): s = '\u201c' + s[1:]
    if s.endswith('"'): s = s[:-1] + '\u201d'
    return f'<text x="{x}" y="{y}" font-family="{fam}" font-weight="{weight}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" {extra}>{esc(s)}</text>'

def rr(x, y, w, h, r, fill, stroke=None, sw=2):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{s}/>'
