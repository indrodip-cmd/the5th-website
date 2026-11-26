from art import *
from art import _smooth

W = 640
def wrap(h, inner): return svg(W, h, inner)

# ---------- Introduction: the road so far ----------
def road_so_far():
    ev = [('2016', 'First year of college', 'Prototype built.|Co-founder leaves.|First failure.', CORAL),
          ('2017', 'Event management', 'Trying again.', AMBER),
          ('2018', 'Digital marketing', 'Traffic, conversion,|persuasion.', AMBER),
          ('2019', 'Launched an agency', 'Clients in|Southeast Asia.', LEAF),
          ('2023', 'Google offers a job', 'Salary. Stability.|He says no.', LEAF),
          ('2024', 'Digital products', 'Starts from zero|clients. Again.', LIME)]
    o = [rr(0, 0, W, 300, 18, '#0C3A28')]
    o.append(txt(32, 40, 'THE ROAD SO FAR', 11, LIME, 800, 'start', extra='letter-spacing="3"'))
    pos = [(72,190),(152,159),(232,181),(332,142),(452,181),(568,130)]
    pth = _smooth(pos)
    o.append(f'<path d="{pth}" stroke="#F4F0DA" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>')
    o.append(f'<path d="{pth}" stroke="#0A2A1B" stroke-width="2" fill="none" stroke-dasharray="2 8" opacity=".5"/>')
    for (x, y), (yr, t, d, c) in zip(pos, ev):
        up = y > 160
        o.append(f'<circle cx="{x}" cy="{y}" r="11" fill="{c}" stroke="#0A2A1B" stroke-width="3"/>')
        ty = y - 70 if up else y + 38
        o.append(txt(x, ty, yr, 17, c, 900, fam='Inter Display'))
        o.append(txt(x, ty + 17, t, 10, '#F2FFD0', 800))
        for i, l in enumerate(d.split('|')):
            o.append(txt(x, ty + 31 + i * 12, l, 9, '#B9D8C4', 500))
    o.append(txt(320, 276, '"I had built a business that could not run without me. That is a job with extra steps."', 11, '#F2FFD0', 600, fam='Inter', extra='font-style="italic"'))
    return wrap(300, ''.join(o))

# ---------- Ch1: 3-layer why ----------
def why_ladder():
    o = []
    rows = [('LAYER 1', 'The surface reason', '"I want more clients."', '#DCEBC0', 40, 28),
            ('LAYER 2', 'Why that matters', '"So I can stop working weekends."', '#B7E36A', 92, 20),
            ('LAYER 3', 'The real reason', '"Because my children are growing up|and I keep missing it."', LIME, 150, 12)]
    y = 10
    for i, (a, b, q, c, _, inset) in enumerate(rows):
        h = 84 if i < 2 else 104
        o.append(rr(20 + inset * i * 3, y, W - 40 - inset * i * 6, h, 16, c))
        cx = 20 + inset * i * 3 + 28
        o.append(f'<circle cx="{cx+8}" cy="{y+h/2}" r="22" fill="#0C3A28"/>' + txt(cx+8, y + h/2 + 6, str(i+1), 19, LIME, 900, fam='Inter Display'))
        tx = cx + 48
        o.append(txt(tx, y + 26, a + '  ·  ' + b.upper(), 9, '#0C3A28', 800, 'start', extra='letter-spacing="1.6"'))
        for j, l in enumerate(q.split('|')):
            o.append(txt(tx, y + 50 + j * 20, l, 15 if i == 2 else 14, '#0A2A1B', 800, 'start', fam='Inter Display'))
        y += h + 10
        if i < 2: o.append(f'<path d="M{W/2-10} {y-9} l10 9 l10 -9" fill="none" stroke="#0C3A28" stroke-width="3" stroke-linecap="round"/>')
    o.append(txt(W/2, y + 22, 'Ask "But why does that matter?" three times. The third answer is your fuel.', 11, '#5C6B62', 600))
    return wrap(y + 36, ''.join(o))

def sunrise():
    o = [f'<defs><linearGradient id="sr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#FFC94A"/><stop offset="1" stop-color="#FF9B5E"/></linearGradient></defs>',
         '<rect width="640" height="220" rx="18" fill="url(#sr)"/>',
         '<circle cx="320" cy="150" r="64" fill="#FFF6D6" opacity=".9"/><circle cx="320" cy="150" r="40" fill="#fff"/>']
    for a in range(-80, 81, 20):
        r = math.radians(a - 90); o.append(f'<line x1="{320+math.cos(r)*80:.0f}" y1="{150+math.sin(r)*80:.0f}" x2="{320+math.cos(r)*112:.0f}" y2="{150+math.sin(r)*112:.0f}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>')
    o.append('<path d="M0 168 C 120 140 220 170 320 158 S 520 140 640 164 V220 H0Z" fill="#2FA866"/><path d="M0 190 C 160 168 300 196 440 178 S 580 176 640 186 V220 H0Z" fill="#1B7A52"/>')
    o.append(person(320, 120, .62, '#0C3A28', '#E8B48B', '#2A1A12'))
    o.append(txt(320, 40, 'Where you will be in 12 months', 14, '#7A4A00', 800, fam='Inter Display'))
    return wrap(220, ''.join(o))

# ---------- Ch2 ----------
def income_types():
    o = []
    cols = [('ACTIVE', 'You trade time for money', CORAL, 'Income stops when you stop.', 'flat'),
            ('LEVERAGED', 'One effort, many people', AMBER, 'Income scales with your audience.', 'steps'),
            ('PASSIVE', 'Build once, sell repeatedly', LEAF, 'Income continues without you.', 'ramp')]
    for i, (t, s, c, d, kind) in enumerate(cols):
        x = 8 + i * 210
        o.append(rr(x, 8, 196, 262, 18, '#fff', '#D5E3D9', 2))
        o.append(rr(x, 8, 196, 46, 18, c) + rr(x, 36, 196, 18, 0, c))
        o.append(txt(x + 98, 38, t, 14, '#0A2A1B', 900, fam='Inter Display', extra='letter-spacing="2"'))
        o.append(txt(x + 98, 76, s, 10.5, '#14201A', 700))
        gx, gy, gw, gh = x + 20, 96, 156, 100
        o.append(f'<path d="M{gx} {gy} V{gy+gh} H{gx+gw}" stroke="#9FB3A7" stroke-width="2" fill="none"/>')
        if kind == 'flat':
            o.append(f'<path d="M{gx} {gy+gh-44} H{gx+90}" stroke="{c}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M{gx+90} {gy+gh-44} V{gy+gh}" stroke="{c}" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"/><path d="M{gx+90} {gy+gh} H{gx+gw}" stroke="{c}" stroke-width="5" stroke-linecap="round"/>')
            o.append(txt(gx + 90, gy + 18, 'you stop', 9, '#C2462A', 800))
        elif kind == 'steps':
            o.append(f'<path d="M{gx} {gy+gh-14} H{gx+38} V{gy+gh-44} H{gx+80} V{gy+gh-70} H{gx+gw}" stroke="{c}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>')
        else:
            o.append(f'<path d="M{gx} {gy+gh-6} C {gx+50} {gy+gh-10} {gx+90} {gy+gh-40} {gx+gw} {gy+6}" stroke="{c}" stroke-width="5" fill="none" stroke-linecap="round"/>')
        o.append(txt(x + 98, 222, d, 9.5, '#5C6B62', 600))
        ex = ['Coaching sessions,|retainers, hourly work', 'Group programmes,|courses, memberships', 'Ebooks, templates,|digital products'][i]
        for j, l in enumerate(ex.split('|')): o.append(txt(x + 98, 244 + j * 12, l, 9.5, '#14201A', 700))
    return wrap(280, ''.join(o))

def leaky_bucket():
    o = ['<path d="M205 40 H435 L410 250 Q320 272 230 250 Z" fill="#DCEBF2" stroke="#0C3A28" stroke-width="5" stroke-linejoin="round"/>',
         '<path d="M215 120 H425 L410 250 Q320 272 230 250 Z" fill="#7FD1AE" opacity=".9"/>',
         '<ellipse cx="320" cy="40" rx="115" ry="14" fill="#F2FFFD" stroke="#0C3A28" stroke-width="5"/>']
    for x, y, t in [(222, 150, 'Unused tools'), (422, 190, 'Time on non-revenue tasks'), (236, 214, 'Under-priced services')]:
        left = x < 320
        o.append(f'<circle cx="{x}" cy="{y}" r="6" fill="#0C3A28"/>')
        for k in range(3):
            o.append(f'<path d="M{x + (-1 if left else 1)*(14+k*3)} {y+10+k*22} q{(-1 if left else 1)*-3} 8 0 12 q{(-1 if left else 1)*3} -4 0 -12z" fill="{CORAL}"/>')
        o.append(txt(x + (-26 if left else 26), y + 4, t, 11, '#14201A', 800, 'end' if left else 'start'))
    o += [f'<path d="M320 8 v14" stroke="{LEAF}" stroke-width="5" stroke-linecap="round"/>', f'<circle cx="320" cy="2" r="0" fill="{LEAF}"/>',
          icon('coin', 34, '#0C3A28', 3, AMBER).replace('<svg ', '<svg x="303" y="-26" ')]
    return wrap(280, ''.join(o))

def iceberg():
    o = ['<rect width="640" height="300" rx="18" fill="#DDF3FA"/><rect y="118" width="640" height="182" rx="0" fill="#7FC8E0"/><rect y="118" width="640" height="182" fill="#0C6C8F" opacity=".35"/>',
         '<rect y="282" width="640" height="18" rx="0" fill="#0C6C8F" opacity=".25"/>',
         '<path d="M250 118 L290 52 L320 76 L360 28 L400 118 Z" fill="#fff"/><path d="M220 118 H430 L470 190 L430 250 L360 280 L270 262 L210 205 Z" fill="#CFEFFC" opacity=".95"/>',
         txt(325, 100, 'What you think is "obvious"', 12, '#0C3A28', 800), txt(325, 172, 'What someone else would pay to learn', 13, '#0C3A28', 900, fam='Inter Display'),
         txt(325, 196, 'years of experience  ·  results  ·  mistakes', 10.5, '#0C3A28', 600), txt(325, 216, 'systems  ·  lived transformation', 10.5, '#0C3A28', 600),
         txt(325, 240, 'Your lived experience is a curriculum.', 10.5, '#0C3A28', 800, extra='font-style="italic"')]
    return wrap(300, ''.join(o))

# ---------- Ch3 ----------
def three_models():
    o = []
    cols = [('JOB', 'Someone else decides|your hours, rate and worth.', '#9FB3A7', 'cap'),
            ('SERVICE BUSINESS', 'You decide your hours, but|income needs your presence.', AMBER, 'line'),
            ('DIGITAL ASSET', 'Build once. Sell repeatedly.|Scale without burning out.', LEAF, 'curve')]
    for i, (t, d, c, kind) in enumerate(cols):
        x = 8 + i * 210
        o.append(rr(x, 8, 196, 258, 18, '#fff', '#D5E3D9', 2))
        o.append(txt(x + 98, 36, t, 12, '#0C3A28', 900, fam='Inter Display', extra='letter-spacing="1.5"'))
        gx, gy, gw, gh = x + 22, 58, 152, 100
        o.append(f'<path d="M{gx} {gy} V{gy+gh} H{gx+gw}" stroke="#9FB3A7" stroke-width="2" fill="none"/>')
        if kind == 'cap': o.append(f'<path d="M{gx} {gy+gh-30} H{gx+gw}" stroke="{c}" stroke-width="6" stroke-linecap="round"/><path d="M{gx} {gy+gh-52} H{gx+gw}" stroke="#C2462A" stroke-width="2" stroke-dasharray="5 5"/>' + txt(gx+gw-6, gy+gh-58, 'ceiling', 8.5, '#C2462A', 800, 'end'))
        elif kind == 'line': o.append(f'<path d="M{gx} {gy+gh-10} L{gx+gw} {gy+gh-62}" stroke="{c}" stroke-width="6" stroke-linecap="round"/>' + txt(gx+gw-4, gy+gh-70, 'needs your hours', 8.5, '#8A5A00', 800, 'end'))
        else: o.append(f'<path d="M{gx} {gy+gh-6} C {gx+70} {gy+gh-10} {gx+110} {gy+gh-30} {gx+gw} {gy+4}" stroke="{c}" stroke-width="6" fill="none" stroke-linecap="round"/>' + txt(gx+gw-4, gy-4, 'compounds', 8.5, '#3E7A0F', 800, 'end'))
        for j, l in enumerate(d.split('|')): o.append(txt(x + 98, 196 + j * 14, l, 10, '#14201A', 600))
        o.append(rr(x + 36, 232, 124, 22, 11, c) + txt(x + 98, 247, ['Stuck', 'Trading time', 'Free'][i], 10.5, '#0A2A1B', 900, fam='Inter Display'))
    return wrap(274, ''.join(o))

def ladder_stairs():
    steps = [('$7', 'EBOOK', 'Entry point. Builds trust,|delivers a quick win.', '#DCEBC0'), ('$27', 'MINI-COURSE', 'Goes deeper. Shows how|to implement.', '#C4E88C'),
             ('$47', 'TOOLKIT', 'Done-for-you templates,|swipe files.', '#A9DB55'), ('$10', 'CALL', 'A low-barrier conversation|that can convert to high-ticket.', '#8ACD2E'),
             ('$1K-5K', 'COACHING', 'The premium transformation|with full support.', LIME)]
    o = []; sw = 118
    for i, (p, t, d, c) in enumerate(steps):
        x = 6 + i * 126; h = 70 + i * 36; y = 250 - h
        o.append(rr(x, y, sw, h + 14, 12, c))
        o.append(txt(x + sw/2, y + 34, p, 24 if i < 4 else 19, '#0A2A1B', 900, fam='Inter Display'))
        o.append(txt(x + sw/2, y + 54, t, 9.5, '#0A2A1B', 800, extra='letter-spacing="1.4"'))
        if h > 100:
            for j, l in enumerate(d.split('|')): o.append(txt(x + sw/2, y + 76 + j * 12, l, 8.6, '#17391F', 600))
    o.append(f'<path d="M30 250 Q 330 20 590 36" stroke="{CORAL}" stroke-width="3" fill="none" stroke-dasharray="3 7" stroke-linecap="round"/>')
    o.append(txt(320, 275, 'One connected ladder: each product serves the same person at a deeper level.', 10.5, '#5C6B62', 600))
    return wrap(288, ''.join(o))

# ---------- Ch4 ----------
def persona():
    o = [rr(0, 0, W, 330, 20, '#EAF8C8')]
    o.append(f'<circle cx="320" cy="150" r="88" fill="#fff"/><circle cx="320" cy="150" r="88" fill="none" stroke="#0C3A28" stroke-width="4" stroke-dasharray="4 8"/>')
    o.append(person(320, 112, 1.05, '#1B7A52', '#E1A97E', '#5A3A28'))
    o.append(txt(320, 262, 'YOUR ONE PERSON', 13, '#0C3A28', 900, fam='Inter Display', extra='letter-spacing="3"'))
    L = [(18, 24, 'What does she secretly|wish her life looked like?'), (18, 118, 'What has she already|tried that did not work?'), (18, 212, 'What does she feel at 3am|when she cannot sleep?')]
    R = [(452, 24, 'Where does she spend|time online?'), (452, 118, 'What does she read,|watch, or listen to?'), (452, 212, 'Who does she already|follow and admire?')]
    for x, y, t in L: o.append(bubble(x, y, 170, 56, t, '#0C3A28', '#F2FFD0', 10.5, ''))
    for x, y, t in R: o.append(bubble(x, y, 170, 56, t, '#fff', '#0C3A28', 10.5, ''))
    o.append(txt(103, 306, 'INNER WORLD', 9.5, '#1B7A52', 900, extra='letter-spacing="2.5"') + txt(537, 306, 'EXTERNAL WORLD', 9.5, '#1B7A52', 900, extra='letter-spacing="2.5"'))
    for y in (52, 146, 240): o.append(f'<path d="M188 {y} Q 240 {y} 262 150" stroke="#0C3A28" stroke-width="2" fill="none" stroke-dasharray="3 6"/><path d="M452 {y} Q 400 {y} 378 150" stroke="#0C3A28" stroke-width="2" fill="none" stroke-dasharray="3 6"/>')
    return wrap(330, ''.join(o))

def bridge():
    o = ['<rect width="640" height="250" rx="20" fill="#EAF8C8"/>',
         '<path d="M0 150 H170 V250 H0Z" fill="#7A5A3A"/><path d="M0 150 H170 V164 H0Z" fill="#2FA866"/>',
         '<path d="M470 150 H640 V250 H470Z" fill="#1B7A52"/><path d="M470 150 H640 V164 H470Z" fill="#9BE02A"/>',
         '<rect x="170" y="196" width="300" height="54" fill="#B7DFF0" opacity=".8"/>',
         f'<path d="M165 150 H475" stroke="#0C3A28" stroke-width="10" stroke-linecap="round"/><path d="M185 150 Q 320 70 455 150" stroke="{LIME}" stroke-width="5" fill="none"/>']
    for x in range(200, 441, 40): o.append(f'<path d="M{x} {150 - (1 - ((x-320)/135)**2) * 62:.0f} V150" stroke="{LIME}" stroke-width="3"/>')
    o.append(person(85, 98, .42, '#FF7A59'))
    o.append(person(555, 98, .42, LEAF))
    o.append(txt(88, 30, 'HIS/HER PAIN', 11, '#8A2A10', 900, fam='Inter Display', extra='letter-spacing="2"') + txt(88, 46, '"I am exhausted trading', 9, '#14201A', 700) + txt(88, 58, 'hours for money."', 9, '#14201A', 700))
    o.append(txt(552, 30, 'THE RESULT', 11, '#2F6B0F', 900, fam='Inter Display', extra='letter-spacing="2"') + txt(552, 46, 'Income that does not need', 9, '#14201A', 700) + txt(552, 58, 'his/her time every time.', 9, '#14201A', 700))
    o.append(rr(235, 18, 170, 36, 18, '#0C3A28') + txt(320, 41, 'YOUR PRODUCT', 13, LIME, 900, fam='Inter Display', extra='letter-spacing="2"'))
    o.append(txt(320, 232, 'The bridge is not manipulation. It is clarity.', 11.5, '#0C3A28', 800, extra='font-style="italic"'))
    return wrap(250, ''.join(o))

# ---------- Ch5 ----------
def price_steps():
    items = [('$7', 'removes every|financial objection', 70), ('$27', 'mini-courses|and toolkits', 108), ('$47', 'comprehensive|guides', 146), ('$97', 'full courses,|done-for-you', 184)]
    o = []
    for i, (p, d, h) in enumerate(items):
        x = 20 + i * 150; y = 232 - h
        o.append(rr(x, y, 128, h, 14, [LIME, '#B7E36A', '#8ACD2E', '#5DB521'][i]))
        o.append(txt(x + 64, y + 38, p, 30, '#0A2A1B', 900, fam='Inter Display'))
        for j, l in enumerate(d.split('|')): o.append(txt(x + 64, y + 58 + j * 12, l, 9.3, '#17391F', 700))
    o.append(txt(320, 262, 'The first product is not about getting rich. It is about getting buyers.', 11, '#5C6B62', 700))
    return wrap(278, ''.join(o))

def offer_stack():
    o = []
    blocks = [('THE GUARANTEE', 'Removes the risk', 'shield', '#DCEBC0', 0), ('BONUS 2', 'Name + value', 'gift', '#C4E88C', 0), ('BONUS 1', 'Name + value', 'gift', '#A9DB55', 0), ('CORE PRODUCT', 'The main deliverable and the result it creates', 'book', LIME, 0)]
    y = 10
    for i, (t, d, ic, c, _) in enumerate(blocks):
        h = 64 if i < 3 else 80
        o.append(rr(30, y, 340, h, 14, c))
        o.append(f'<circle cx="68" cy="{y+h/2}" r="22" fill="#0C3A28"/>' + icon(ic, 26, LIME).replace('<svg ', f'<svg x="55" y="{y+h/2-13}" '))
        o.append(txt(102, y + h/2 - 3, t, 13, '#0A2A1B', 900, 'start', fam='Inter Display', extra='letter-spacing="1"'))
        o.append(txt(102, y + h/2 + 15, d, 10, '#17391F', 600, 'start'))
        y += h + 8
    o.append(rr(396, 10, 214, 150, 18, '#0C3A28') + txt(503, 44, 'TOTAL VALUE', 10.5, LIME, 800, extra='letter-spacing="2"') + txt(503, 92, '$____', 38, '#fff', 900, fam='Inter Display') + txt(503, 118, 'for just', 11, '#B9D8C4', 600))
    o.append(rr(396, 176, 214, 96, 18, LIME) + txt(503, 205, "TODAY'S PRICE", 10.5, '#0A2A1B', 800, extra='letter-spacing="2"') + txt(503, 252, '$____', 38, '#0A2A1B', 900, fam='Inter Display'))
    o.append(f'<path d="M380 120 L388 120 M380 224 L388 224" stroke="#0C3A28" stroke-width="3" stroke-linecap="round"/>')
    return wrap(y + 4, ''.join(o))

# ---------- Ch7 ----------
def story_lesson_cta():
    o = []
    cols = [('1', 'STORY', 'Hook them in', 'A moment. A mistake.|A client result.', 'chat', '#C4E88C'), ('2', 'LESSON', 'Teach one thing', 'One insight.|Not three. Not five.', 'bulb', AMBER), ('3', 'CTA', 'Say what is next', 'Save. Share. Comment.|DM me START.', 'flag', LIME)]
    for i, (n, t, s, d, ic, c) in enumerate(cols):
        x = 8 + i * 214
        o.append(rr(x, 14, 196, 190, 20, c))
        o.append(f'<circle cx="{x+98}" cy="64" r="32" fill="#0C3A28"/>' + icon(ic, 34, LIME).replace('<svg ', f'<svg x="{x+81}" y="47" '))
        o.append(txt(x + 98, 122, t, 21, '#0A2A1B', 900, fam='Inter Display', extra='letter-spacing="2"'))
        o.append(txt(x + 98, 142, s, 11, '#0A2A1B', 800))
        for j, l in enumerate(d.split('|')): o.append(txt(x + 98, 164 + j * 13, l, 9.8, '#17391F', 600))
        if i < 2: o.append(f'<path d="M{x+201} 108 l12 0 m-6 -7 l7 7 l-7 7" stroke="#0C3A28" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    return wrap(216, ''.join(o))

def content_grid():
    fmt = {'Reel': '#FF7A59', 'Caption': '#2FA866', 'Story': AMBER, 'Mix': '#9FB3A7'}
    plan = ['Reel','Caption','Reel','Story','Caption','Reel','Caption','Reel','Caption','Reel'] + ['Mix'] * 20
    o = []
    for d, f in enumerate(plan):
        r, c = divmod(d, 10); x = 12 + c * 60; y = 12 + r * 60
        o.append(rr(x, y, 52, 52, 12, fmt[f]) + txt(x + 26, y + 24, str(d + 1), 17, '#fff', 900, fam='Inter Display') + txt(x + 26, y + 40, f.upper(), 7.5, '#fff', 800, extra='letter-spacing="1"'))
    lx = 14
    for k, c in fmt.items():
        o.append(rr(lx, 206, 14, 14, 4, c) + txt(lx + 20, 218, k + (' (Days 11-30 rotate: story / lesson / offer / proof / behind the scenes)' if k == 'Mix' else ''), 10, '#14201A', 700, 'start')); lx += 80
    return wrap(232, ''.join(o))

# ---------- Ch8 ----------
def reach_compare():
    o = [rr(0, 0, 640, 250, 20, '#fff', '#D5E3D9', 2)]
    o.append(txt(320, 30, 'Why we post from a personal profile first', 14, '#0C3A28', 900, fam='Inter Display'))
    o.append(txt(320, 48, 'Illustration of the idea, not measured data', 9, '#5C6B62', 600, extra='font-style="italic"'))
    for x, t, d, c, w, ic in [(40, 'BUSINESS PAGE', 'Posts are restricted unless|you pay for advertising.', '#B9C4BE', 70, 'lock'), (350, 'PERSONAL PROFILE', 'Reaches friends, family and|connections who already trust you.', LIME, 220, 'heart')]:
        o.append(rr(x, 66, 250, 168, 16, '#F4F9EC'))
        o.append(f'<circle cx="{x+36}" cy="106" r="22" fill="#0C3A28"/>' + icon(ic, 24, LIME).replace('<svg ', f'<svg x="{x+24}" y="94" '))
        o.append(txt(x + 66, 112, t, 13, '#0C3A28', 900, 'start', fam='Inter Display', extra='letter-spacing="1"'))
        o.append(rr(x + 20, 138, 210, 18, 9, '#E3EDE6') + rr(x + 20, 138, w * .95, 18, 9, c))
        for j, l in enumerate(d.split('|')): o.append(txt(x + 125, 184 + j * 14, l, 10.5, '#14201A', 600))
    return wrap(250, ''.join(o))

def launch_path():
    days = [('1', 'TEASE', 'Something is coming', 'mega'), ('2', 'STORY', 'Where you were', 'heart'), ('3', 'SOLUTION', 'Name the product', 'bulb'),
            ('4', 'PROOF', 'A real result', 'star'), ('5', 'REVEAL', 'Launch day', 'rocket'), ('6', 'OBJECTIONS', 'Answer the doubts', 'shield'), ('7', 'LAST CHANCE', 'Honest close', 'clock')]
    o = []
    pts = [(56 + i * 88, 190 - [0, 14, 30, 52, 100, 82, 96][i]) for i in range(7)]
    o.append('<path d="' + ' '.join(('M' if i == 0 else 'L') + f'{x} {y+4}' for i, (x, y) in enumerate(pts)) + f'" stroke="{LIME}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>')
    for i, ((x, y), (n, t, d, ic)) in enumerate(zip(pts, days)):
        hot = i == 4
        o.append(f'<circle cx="{x}" cy="{y}" r="{26 if hot else 21}" fill="{CORAL if hot else "#0C3A28"}" stroke="#fff" stroke-width="3"/>' + icon(ic, 26 if hot else 22, '#fff' if hot else LIME).replace('<svg ', f'<svg x="{x-(13 if hot else 11)}" y="{y-(13 if hot else 11)}" '))
        o.append(txt(x, 234, 'DAY ' + n, 8.5, '#5C6B62', 800, extra='letter-spacing="1.2"') + txt(x, 250, t, 10.5, '#0C3A28', 900, fam='Inter Display') + txt(x, 264, d, 8, '#5C6B62', 600))
    return wrap(274, ''.join(o))

# ---------- Ch9 ----------
def one_percent():
    o = [rr(0, 0, 640, 280, 18, '#0C3A28')]
    gx, gy, gw, gh = 60, 40, 540, 190
    o.append(f'<path d="M{gx} {gy} V{gy+gh} H{gx+gw}" stroke="#5F9A7C" stroke-width="2" fill="none"/>')
    pts = []
    for d in range(0, 91):
        v = 1.01 ** d; x = gx + d / 90 * gw; y = gy + gh - (v - 1) / (1.01 ** 90 - 1) * (gh - 30) - 6
        pts.append(f'{x:.1f} {y:.1f}')
    o.append(f'<path d="M{gx} {gy+gh-6} H{gx+gw}" stroke="#5F9A7C" stroke-width="3" stroke-dasharray="5 6"/>')
    o.append('<path d="M' + ' L'.join(pts) + f'" stroke="{LIME}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    o.append(f'<circle cx="{gx+gw}" cy="{pts[-1].split()[1]}" r="9" fill="{LIME}" stroke="#0C3A28" stroke-width="3"/>')
    o.append(txt(gx + gw - 8, float(pts[-1].split()[1]) - 16, '2.4x better', 15, LIME, 900, 'end', fam='Inter Display'))
    o.append(txt(gx + 6, gy + gh - 16, 'Stay the same: 1.0x', 10, '#B9D8C4', 700, 'start'))
    o.append(txt(320, 22, 'THE MATH OF 1% A DAY  (1.01 to the power of 90)', 10, '#C9FF48', 800, extra='letter-spacing="2"'))
    for d, l in [(0, 'Day 1'), (30, 'Day 30'), (60, 'Day 60'), (90, 'Day 90')]: o.append(txt(gx + d / 90 * gw, gy + gh + 22, l, 10, '#B9D8C4', 700))
    return wrap(280, ''.join(o))

def clock_ring():
    o = []; cx, cy, R = 320, 150, 108
    segs = [('1', 'READ YOUR WHY', LIME, 'book'), ('2', 'ONE PRIORITY', AMBER, 'target'), ('3', 'VISUALISE THE WIN', '#8FD3F4', 'star'), ('4', 'GRATITUDE', CORAL, 'heart'), ('5', 'ONE ACTION', LEAF, 'rocket')]
    for i, (n, t, c, ic) in enumerate(segs):
        a0 = -90 + i * 72 + 3; a1 = a0 + 66
        x0, y0 = cx + R * math.cos(math.radians(a0)), cy + R * math.sin(math.radians(a0)); x1, y1 = cx + R * math.cos(math.radians(a1)), cy + R * math.sin(math.radians(a1))
        o.append(f'<path d="M{x0:.1f} {y0:.1f} A{R} {R} 0 0 1 {x1:.1f} {y1:.1f}" stroke="{c}" stroke-width="26" fill="none" stroke-linecap="butt"/>')
        am = math.radians((a0 + a1) / 2); mx, my = cx + (R + 54) * math.cos(am), cy + (R + 40) * math.sin(am)
        ix, iy = cx + R * math.cos(am), cy + R * math.sin(am)
        o.append(icon(ic, 20, '#0A2A1B').replace('<svg ', f'<svg x="{ix-10:.1f}" y="{iy-10:.1f}" '))
        anc = 'start' if mx > cx + 10 else ('end' if mx < cx - 10 else 'middle')
        o.append(txt(mx, my - 2, f'MINUTE {n}', 8.5, '#5C6B62', 800, anc, extra='letter-spacing="1.4"') + txt(mx, my + 12, t, 11, '#0C3A28', 900, anc, fam='Inter Display'))
    o.append(f'<circle cx="{cx}" cy="{cy}" r="70" fill="#0C3A28"/>' + txt(cx, cy - 2, '5', 52, LIME, 900, fam='Inter Display') + txt(cx, cy + 22, 'MINUTES', 11, '#C9FF48', 800, extra='letter-spacing="3"'))
    return wrap(304, ''.join(o))

def mindsets():
    o = []
    for x, t, c, tc, d, items, ic in [(8, 'COMMERCIAL', '#FFE3D8', '#8A2A10', '"Hustle harder. More hours.|More content. More effort."', ['Five platforms', 'Two offers', 'New niche every two weeks'], 'clock'),
                                     (330, 'INDUSTRIAL-GRADE', '#DFF6B0', '#2F6B0F', '"Which ONE action, done|consistently, works best?"', ['One platform', 'One offer', 'One niche, one CTA'], 'target')]:
        o.append(rr(x, 8, 302, 238, 20, c))
        o.append(f'<circle cx="{x+44}" cy="52" r="26" fill="#0C3A28"/>' + icon(ic, 28, LIME).replace('<svg ', f'<svg x="{x+30}" y="38" '))
        o.append(txt(x + 84, 58, t, 15, tc, 900, 'start', fam='Inter Display', extra='letter-spacing="1.5"'))
        for j, l in enumerate(d.split('|')): o.append(txt(x + 24, 102 + j * 16, l, 11.5, '#14201A', 700, 'start', extra='font-style="italic"'))
        for j, it in enumerate(items):
            o.append(rr(x + 24, 142 + j * 32, 254, 26, 13, '#fff') + txt(x + 40, 160 + j * 32, it, 11, '#14201A', 700, 'start'))
    o.append(rr(290, 106, 60, 34, 17, '#0C3A28') + txt(320, 129, 'VS', 15, LIME, 900, fam='Inter Display'))
    return wrap(254, ''.join(o))

def traffic():
    o = []
    for x, t, c, ds in [(8, 'SCALE', '#2FA866', ['Consistent sales with|one product and one offer', 'Audience and engagement|are growing', 'A clear, repeatable|system for sales']),
                         (222, 'SIMPLIFY', AMBER, ['Multiple products,|none converting well', 'Overwhelmed; cannot|track what works', 'More time managing|complexity than selling']),
                         (436, 'REASSESS', CORAL, ['60+ days of consistent|posting, no sales', 'Unsure who you are|talking to', 'Burnt out, resentful,|or lost your why'])]:
        o.append(rr(x, 8, 196, 284, 18, '#fff', '#D5E3D9', 2))
        o.append(f'<circle cx="{x+98}" cy="52" r="26" fill="{c}"/>' + txt(x + 98, 98, t, 16, '#0C3A28', 900, fam='Inter Display', extra='letter-spacing="2"') + txt(x + 98, 116, 'WHEN...', 8.5, '#5C6B62', 800, extra='letter-spacing="2"'))
        for j, d in enumerate(ds):
            y = 134 + j * 52
            o.append(rr(x + 12, y, 172, 44, 10, '#F4F9EC'))
            for k, l in enumerate(d.split('|')): o.append(txt(x + 98, y + 19 + k * 13, l, 9.6, '#14201A', 600))
    return wrap(300, ''.join(o))

def roadmap_glance():
    pts = trail_points(640, 420)
    o = [rr(0, 0, 640, 420, 20, '#0C3A28')]
    path = _smooth(pts)
    o.append(f'<path d="{path}" stroke="#F4F0DA" stroke-width="11" fill="none" stroke-linecap="round" opacity=".92"/><path d="{path}" stroke="#0A2A1B" stroke-width="2" stroke-dasharray="2 9" fill="none" opacity=".5"/>')
    labels = ['Your why', 'Your starting point', 'The asset game', 'Your one person', 'Something to sell', 'A reason to buy', 'A voice in the market', 'A launch date', 'Resilience to last']
    for i, ((x, y), l) in enumerate(zip(pts, labels), 1):
        o.append(f'<circle cx="{x}" cy="{y}" r="15" fill="{LIME}" stroke="#0A2A1B" stroke-width="3"/>' + txt(x, y + 5, str(i), 14, '#0A2A1B', 900, fam='Inter Display'))
        o.append(txt(x, y - 24, l, 11.5, '#F2FFD0', 800))
    return wrap(420, ''.join(o))
