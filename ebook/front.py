from comps import *
import diagrams as D, base64, os

def tok(k): return f'<span style="font-size:1px;color:transparent;position:absolute">@@{k}@@</span>'

def cover_page():
    b = base64.b64encode(open(os.path.join(os.path.dirname(__file__), 'assets/cover.png'), 'rb').read()).decode()
    return f'<section class="full" style="background:#07200F"><img src="data:image/png;base64,{b}" style="width:7in;height:10in;display:block"/></section>'

def title_page():
    return f'''<section class="full" style="background:radial-gradient(120% 80% at 50% 0%,#14543A,#07200F 70%)">
  <div style="position:absolute;left:0;right:0;top:96px;text-align:center">
    <div style="display:inline-flex;align-items:center;gap:10px"><div style="width:30px;height:30px;border-radius:8px;background:#C9FF48;color:#0A2A1B;font:900 20px/30px 'Inter Display'">5</div><span style="font:800 9pt 'Inter';letter-spacing:.3em;color:#E9FFB0">THE5TH GLOBAL CONSULTING</span></div>
    <div style="font:900 64px/.98 'Inter Display';letter-spacing:-.035em;color:#fff;margin-top:70px">EXPERTISE</div>
    <div style="font:900 18px 'Inter Display';letter-spacing:.5em;color:#C9FF48;margin:12px 0 8px;padding-left:.5em">TO</div>
    <div style="font:900 84px/.98 'Inter Display';letter-spacing:-.035em;color:#C9FF48">INCOME</div>
    <div style="font:800 10pt 'Inter';letter-spacing:.28em;color:#9BE02A;margin-top:40px">THE 10K ROADMAP WORKBOOK</div>
    <div style="font:italic 14pt/1.4 'Bitstream Charter',serif;color:#E6F5D0;margin:28px auto 0;max-width:420px">Stop selling your time.<br>Start building an asset.</div>
    <div style="font:700 10.5pt 'Inter';letter-spacing:.2em;color:#fff;margin-top:70px">INDRODIP GHOSH &nbsp;&amp;&nbsp; CHRISTINEE MATHISON</div>
    <div style="font:500 8.5pt 'Inter';color:#9FC4AE;margin-top:14px">www.the5th.consulting &nbsp;|&nbsp; 10kroadmap.org</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:290px;overflow:hidden;display:flex;align-items:flex-end">{art.landscape(1, sun=False)}</div></section>'''

def copyright_page():
    return f'''<section class="plain" style="break-before:page">
 <div style="position:relative;border-radius:20px;overflow:hidden;background:#07200F;height:4.55in">
  <div style="position:absolute;left:0;right:0;bottom:-70px">{art.landscape(1, sun=True)}</div>
  <div style="position:absolute;left:0;right:0;top:34px;text-align:center">
   <div style="display:inline-flex;align-items:center;gap:9px"><div style="width:26px;height:26px;border-radius:7px;background:#C9FF48;color:#0A2A1B;font:900 17px/26px 'Inter Display'">5</div><span style="font:800 7.5pt 'Inter';letter-spacing:.28em;color:#E9FFB0">THE5TH GLOBAL CONSULTING</span></div>
   <div style="font:900 40px/1 'Inter Display';letter-spacing:-.03em;color:#fff;margin-top:22px">EXPERTISE <span style="color:#C9FF48">TO INCOME</span></div>
   <div style="font:italic 12pt/1.4 'Bitstream Charter',serif;color:#E6F5D0;margin-top:12px">Stop selling your time. Start building an asset.</div>
  </div></div>
 <div style="margin-top:.35in;font:500 8.8pt/1.6 'Inter';color:#3E4C44">
 <p><strong>Expertise to Income: The 10K Roadmap Workbook</strong></p>
 <p>Copyright © 2026 The5th Consulting. All rights reserved. No part of this workbook may be reproduced by any mechanical, photographic, or electronic process, or stored in a retrieval system, transmitted, or otherwise copied for public or private use without prior written permission of the publisher.</p>
 <p>This publication is designed to provide accurate and authoritative information regarding the subject matter covered. The authors make no guarantees about the results you will achieve by reading this book. All business requires risk and hard work. Your results may vary. Examples and client stories are shared to illustrate ideas and are not a promise or guarantee of income.</p>
 <p>Authors: Indrodip Ghosh and Christinee Mathison &nbsp;|&nbsp; www.the5th.consulting</p></div></section>'''

def note_page():
    return f'''<div class="pg-break">{BY('A NOTE ON THIS BOOK').replace(' &nbsp;·&nbsp; Co-Author, The5th Consulting','')}
{H2('How this book was written')}
{LEAD("This workbook was written by two equal partners who share one mission: to help coaches, consultants, healers, and experts stop trading their time for money, and start building something that works without them.")}
<div class="grid2" style="margin-top:14px">
 <div class="card dark" style="padding:18px"><div style="margin-bottom:10px">{avatar('Indrodip Ghosh', 62)}</div><h4 style="font-size:12pt">Indrodip Ghosh</h4><div style="font:800 7.5pt 'Inter';letter-spacing:.18em;color:#9BE02A;margin-bottom:8px">STRATEGY AND SYSTEMS</div>Business mechanics, the mindset of scaling, and the market reality of digital products.<div style="margin-top:8px;color:#B9D8C4;font-size:8.6pt">Introduction, Chapters 1, 2, 3, 8, the Conclusion, and the closing Letter.</div></div>
 <div class="card" style="padding:18px;background:#EAF8C8;border-color:#EAF8C8"><div style="margin-bottom:10px">{avatar('Christinee Mathison', 62, '#0C3A28')}</div><h4 style="font-size:12pt">Christinee Mathison</h4><div style="font:800 7.5pt 'Inter';letter-spacing:.18em;color:#1B7A52;margin-bottom:8px">TRANSFORMATION AND CLARITY</div>Knowing your audience, building your offer, creating content that connects, and the inner game of showing up consistently.<div style="margin-top:8px;color:#5C6B62;font-size:8.6pt">Chapters 4, 5, 6, 7, and 9.</div></div></div>
{P("Indrodip's chapters draw on his lived experience as a digital product strategist, his years of building and rebuilding businesses from scratch, and the real stories of the 20+ clients he has guided to their first $10K months.", "Christinee's chapters are built from her deep expertise in mindset coaching, audience clarity, and offer building, and the specific transformation required for coaches, consultants, and healers who know they have something valuable to offer but have not yet found the system to package and sell it with confidence.", "Read each chapter as it comes. Trust that both authors wrote their part with you in mind.")}
</div>'''

def gratitude_page():
    return f'''<div class="pg-break"><div class="kicker">A word of gratitude</div>{H2('To my clients')}
{LEAD('You are the reason this book exists.')}
{P("Every lesson in these pages was forged in real conversations, real struggles, and real breakthroughs, yours. You trusted me when you were afraid. You showed up when it would have been easier to quit. You proved, again and again, that it is never too late to build something that matters.", "This is for you.")}
<div class="story" style="margin-top:22px"><div class="ic">{icon('heart', 26)}</div><div class="tag">And to Christinee</div>{P("My co-author and equal partner in this work. This book would not exist without you. Your clarity, structure, and steady commitment turned ideas into something real and tangible. When things felt overwhelming, you brought focus. When momentum slowed, you kept it moving. This was not just collaboration. It was true partnership, built on equal contribution, equal vision, and equal belief in the people we wrote this for.")}</div>
<p style="font-style:italic;margin-top:18px">— Indrodip</p></div>'''

ENTRIES = [('how', '', 'How to Use This Workbook', ''), ('intro', '', 'Introduction: The Story Behind This Book', 'Indrodip Ghosh')] + \
  [(f'ch{i+1}', str(i+1), CHAPTERS[i], 'Indrodip Ghosh' if (i+1) in (1,2,3,8) else 'Christinee Mathison') for i in range(9)] + \
  [('concl', '', 'Conclusion and Your Next 24 Hours', 'Indrodip Ghosh'), ('letter', '', 'A Letter from Indrodip', 'Indrodip Ghosh'), ('about', '', 'About the Authors', 'Both Authors'), ('gift', '', 'Free Gift', 'Both Authors')]

def contents_page():
    rows = ''
    for k, n, t, a in ENTRIES:
        badge = f'<div style="flex:0 0 32px;height:32px;border-radius:50%;background:#C9FF48;color:#0A2A1B;font:900 13pt/32px \'Inter Display\';text-align:center">{n}</div>' if n else '<div style="flex:0 0 32px;height:32px;border-radius:50%;background:#0C3A28;display:flex;align-items:center;justify-content:center">' + icon('flag', 15, '#C9FF48') + '</div>'
        rows += f'<div style="display:flex;align-items:center;gap:14px;padding:4px 0;border-bottom:1px solid #DCE8E0">{badge}<div style="flex:1"><div style="font:800 11pt \'Inter\';color:#0C3A28">{sq(t)}</div>{"<div style=\"font:500 8.3pt Inter;color:#5C6B62\">"+a+"</div>" if a else ""}</div><div style="font:900 12pt \'Inter Display\';color:#1B7A52">@@pg:{k}@@</div></div>'
    return f'<div class="pg-break"><div class="kicker">Your route</div>{H2("Contents")}{rows}</div>'

def how_to_page():
    return f'''<div class="pg-break">{tok('how')}<div class="kicker">Before you start</div>{H2('How to use this workbook')}
{LEAD("This is not a book you read once and put on a shelf. This is a workbook, which means it only works if you work it.")}
<div class="grid2" style="margin:18px 0">
{CARD('book','One chapter at a time','Print it out or duplicate the pages digitally. Do not skip ahead. The chapters build on each other.')}
{CARD('pen','Do every exercise','Complete each one before moving on. Insight without action is just entertainment.')}
{CARD('shield','Be honest','Especially with yourself. The worksheets will only give you what you give them.')}
{CARD('refresh' if False else 'clock','Come back in 90 days','Use this workbook again and see how far you have moved.',True)}
</div>
<div class="ws"><div class="hd">{icon('flag',16)}Your 30-day commitment</div><div style="padding:14px 18px 16px;font:500 10.5pt/1.9 'Inter'">
I commit to reading one chapter per week.<br>I commit to completing every worksheet with honesty.<br>I commit to taking at least one new action every day.<br>I commit to finishing this workbook, even on the hard days.
<div class="sig"><span>Sign your name here:</span><i></i></div><div class="sig"><span>Today's date:</span><i></i></div></div></div>
</div>'''

def intro():
    pre = section_page('INTRODUCTION', 'The Story Behind This Book', 'Indrodip Ghosh', art.landscape(1, sun=True), tokk='intro')
    body = f'''<div class="flow" style="break-before:page">
{QUOTE('The secret of getting ahead is getting started.', 'Mark Twain')}
{LEAD("I did not grow up knowing how to build a business.")}
{P("I grew up in India, a country where the unspoken rule is: study hard, get a job, be safe. No one in my world was talking about digital products or online income. Entrepreneurship was not a career. It was a risk people like us were supposed to avoid.", "But something inside me refused to settle.")}
{P("In 2016, my first year of college, my roommate and I noticed something simple: the cheap speakers on the market were terrible. So we decided to fix it. We built a working prototype. We had a vision. Then our final-year lead engineer dropped out of the project. No tech, no funding, no guidance. It fell apart.")}
{PULL('That was my first failure. It would not be the last.')}
{FIG(D.road_so_far(), 'The years of trying')}
{H3('The years of trying')}
{P("In 2017, I tried event management. In 2018, I stepped into digital marketing, helping local businesses with their online presence, learning everything I could about traffic, conversion, and persuasion. In 2019, I launched a small agency. By 2021, we were working with international clients across Southeast Asia, including campaigns for Booking.com.", "From the outside, it looked like success. From the inside, I was exhausted. I was trading hours for money. Every client who left felt like a loss I could not recover from. I had built a business that could not run without me, and that is not a business. That is a job with extra steps.", "In 2023, Google offered me a position. A salary. Stability. I almost said yes. But I said no. Because I did not build all of this just to sit in an office, living paycheck to paycheck with no freedom.")}
{H3('The shift that changed everything')}
{P("In 2024, I stepped down from my agency and transitioned into something I had been studying for years: digital products and coaching. I started from zero clients again. But this time, I had something I had never fully used before. My story.", "I had tried to hide my background. I genuinely believed that being Indian, starting from a developing country, with no credentials or Ivy League degree, meant that people would not trust me. Several friends had told me the same: 'Western clients don't work with us.' Some coaches I knew were using fake profile pictures and borrowed credibility to seem more acceptable.")}
{PULL('I refused to do that.')}
{P("Instead, I showed up as exactly who I was: an Indian entrepreneur who had failed, learned, invested over $16,000 of his own money into education, and slowly figured it out. My clients, most of them men and women over 45 starting their first online business from scratch, did not care where I was from. They cared that I understood their fear of being seen. Their fear of technology. Their fear of failing at something they had dreamed about for years.", "By the end of 2024, I had served 20+ clients. I hit my first $10K month. Not with ads. Not with a big team. Just with clarity, story, and a simple system.")}
{H3('Why this workbook exists')}
{P("This workbook is everything I wish I had in 2016, or 2020, or 2022. It is the blueprint I have built and refined through years of failure, through real client breakthroughs, through late nights and honest conversations.", "It is for the coach who is tired of trading time for money. The consultant sitting on expertise they have not yet packaged. The healer who knows they can help more people but has no system to reach them. The person over 40 who thinks they started too late. The entrepreneur who has been told no one will trust them.", "This workbook will prove them all wrong. Chapter by chapter, exercise by exercise, decision by decision.")}
</div>
<div style="break-before:page">{H2('The route ahead')}
{LEAD("Nine stops. Each one builds on the last. You will find your why, diagnose where you are, learn how assets work, choose your person, build your product and offer, create content, launch, and then learn the mindset that keeps it going.")}
{FIG(D.roadmap_glance(), 'Your roadmap: nine stops from "why" to a business that lasts')}
{PULL('If you can send an email, you can do this.')}
<p style="font-style:italic;margin-top:14px">Let us begin.<br>— Indrodip Ghosh</p>
</div>'''
    return pre + body
