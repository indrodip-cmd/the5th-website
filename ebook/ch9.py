from comps import *
import diagrams as D

def ch9():
    o = chapter_open(9, 'Chapter Nine', 'Mindset for Consistent $10K Months', 'Christinee Mathison · Co-Author, The5th Consulting',
        '"Your outer world is a reflection of your inner world."', 'T. Harv Eker', 'You have the resilience to last.')
    o += chapter_start(9)
    o += f'''{BY('Christinee Mathison')}
{LEAD("Congratulations. You have made it to the final chapter of this workbook. That alone puts you ahead of 90% of people who start something like this and quietly abandon it three chapters in.")}
{P("But before we talk about what comes next, we need to talk about the thing that will determine whether you actually reach $10K months, or whether you stay stuck at the edge of what is possible for you.", "That thing is your mindset.", "Not your funnel. Not your offer. Not even your content. All of those matter enormously, and you have spent the last eight chapters building them. But none of them will work if your inner world is working against you.")}
{H2('The Commercial Mindset vs. The Industrial-Grade Mindset', 1)}
{P("There are two types of people in business. Those with a commercial mindset, and those with an industrial-grade mindset.")}
{FIG(D.mindsets())}
{P("The commercial mindset burns you out. The industrial-grade mindset builds something that lasts.")}
{STORY('Field note: the health consultant', "A health consultant I worked with had been posting content every day for four months with minimal results. She was posting on five platforms, running two different offers, and changing her niche every two weeks. We simplified: one platform, one offer, one niche, one CTA. Within six weeks she had her first $3K month, not from more effort, but from focused, consistent effort in the right direction.", ic='target')}
{H3('The industrial-grade approach')}
{CHK(["One product. One audience. One platform. Until you hit $5K months consistently.", "One content habit. Post once a day. Show up whether you feel like it or not.", "One offer. Perfect it. Sell it. Improve it with the feedback you receive.", "One CTA in rotation. Make it easy for your audience to take the next step.", "Review once a week. Look at what worked. Do more of that."], done=True)}
{H2('How to Handle Rejection, Slow Days, and Doubt', 2)}
<div class="grid3" style="grid-template-columns:1fr">
{CARD('shield','When rejection arrives',"A 'no' is not personal. It means 'not right now' or 'not the right fit.' For every 10 people who say no, there is one who was just waiting for you to ask. Do not change your offer after one rejection. Collect data and decide based on patterns.")}
{CARD('clock','When slow days arrive','Slow days are a data point, not a verdict. Look at your numbers over 30 days, not 24 hours. On slow days, focus on inputs, not outcomes: post, respond to comments, send your email. One of my clients went 19 days without a sale, then made $1,400 in a single weekend.')}
{CARD('heart','When doubt arrives',"Doubt is not a message from the universe that you are on the wrong path. Ask yourself: 'Am I doubting myself, or am I doubting my system?' If it is your system, review it. If it is yourself, go back to your Layer 3 why from Chapter 1.",True)}
</div>
{WS('Your doubt response plan', [("When I feel like quitting, the ONE thing I will do instead is:", 2), ("The person I will call or message when doubt gets loud:", 1), ("The reminder I will read on hard days (your WHY from Chapter 1 in your own words):", 2), ("Evidence I already have that I am capable of this (list 3 things you have done that required courage):", 3)])}
{H2('The 1% Consistency Rule', 3)}
{FIG(D.one_percent(), 'Small daily improvements compound')}
{CALL('The 1% rule', "You do not need to be 100% better than where you started. You need to be 1% better every day: 1% better at understanding your audience, at writing content that connects, at explaining your offer, at believing you deserve to succeed.", "After 90 days of 1% daily improvement, you will not recognise the business you built at the start. More importantly, you will not recognise the person running it.")}
{WS('Your consistency commitment', [("I commit to posting content every day for the next 30 days. Sign here:", 1), ("The non-negotiable minimum I will do on my hardest days:", 2), ("The days of the week that will be hardest, and my plan to overcome that:", 2), ("How I will track my consistency:", 2)])}
{H2('Your Morning Business Ritual: The 5-Minute Daily Reset', 4)}
{FIG(D.clock_ring())}
{NOTE('Minute 1: read your why', 'Open to Chapter 1. Read your 12-month vision. Read your Layer 3 why. Let it land.')}
{NOTE('Minute 2: identify your one priority', 'What is the single most important thing you can do for your business today? Write it down. Just one.')}
{NOTE('Minute 3: visualise the win', 'Close your eyes. Imagine your One Person finding your product today. Imagine him or her buying it. Imagine the message saying it changed something for them.')}
{NOTE('Minute 4: gratitude check', 'Name three things you are grateful for in your business right now, even if they are small.')}
{NOTE('Minute 5: commit to one action', "Say out loud: 'Today I will _______ for my business.' Then go do it before anything else.")}
{WS('Personalise your morning ritual', [("The time I will do this every morning:", 1), ("My 12-month vision statement (copy from Chapter 1 so it lives here too):", 3), ("My ONE business priority for this week:", 1), ("Three things I am grateful for in my business right now:", 3)])}
{H2('When to Scale, When to Simplify, and When to Reassess', 5)}
{FIG(D.traffic())}
{WS('Where are you right now?', [("Based on the table above, which phase are you in? (Scale / Simplify / Reassess)", 1), ("What does that mean for your next 30 days?", 2), ("The one thing I am going to STOP doing that is not serving my business:", 2), ("The one thing I am going to focus on completely for the next 30 days:", 2)])}
{NOTES(9)}
{RECAP('CHAPTER NINE', 'You have the resilience to last.', ['My one focus for the next 30 days:', 'My morning ritual time is set:', 'My doubt response plan is written: Yes / Not yet'])}
'''
    return o + chapter_end()
