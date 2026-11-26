from comps import *
import diagrams as D

def tok(k): return f'<span style="font-size:1px;color:transparent;position:absolute">@@{k}@@</span>'

def ch1():
    o = chapter_open(1, 'Chapter One', 'Understand Your Why', 'Indrodip Ghosh · Co-Author, The5th Consulting',
        '"He who has a why to live can bear almost any how."', 'Friedrich Nietzsche', 'You will leave this chapter with your WHY.')
    o += chapter_start(1)
    o += f'''{BY('Indrodip Ghosh')}
{LEAD("Before we talk about products, platforms, or profits, we need to talk about why you are here.")}
{P("Not why you picked up this workbook. Why do you want to build a business at all? Because your 'why' is not decoration. It is fuel. And without the right fuel, you will quit the first time things get hard, and things will get hard.", "I have watched brilliant people abandon great ideas because they built their business on shallow reasons. 'I want to make money.' 'I want freedom.' 'I want to quit my job.' These sound motivating, but they dissolve under pressure.", "The clients I have seen succeed, the ones who pushed through the doubt, the slow weeks, the moments of wondering if this was all a mistake, every single one of them had a why that was deeper than money. They had a reason that made the work personal. Sacred, even.")}
{STORY('Field note: the fitness coach', "A fitness coach I worked with said her Layer 1 was 'I want more clients.' Her Layer 2 was 'so I can stop working weekends.' Her real Layer 3? 'Because my children are growing up and I keep missing it.'", "That is not a strategy. That is a reason to not quit.", ic='heart')}
{H2('The 3-Layer Why Method', 1)}
{P("Start with your surface reason. Then ask: 'But why does that matter?' Then ask it again. Three layers down, you find the real answer.")}
{FIG(D.why_ladder(), 'Each layer gets closer to the reason that will keep you going')}
{WS('Exercise: the 3-layer why method', [("Layer 1: I want to build this business because...", 3), ("Layer 2: That matters to me because...", 3), ("Layer 3: The real reason. What I am truly fighting for:", 4)])}
{H2('Your Non-Negotiables', 2)}
{P("Every business decision you make should be filtered through your non-negotiables: the things you are not willing to compromise, no matter what. Time with family. Your health. Your integrity. Your creative freedom.")}
<div class="grid2">
{CARD('clock','Time','How many hours per week can this business really have?')}
{CARD('coin','Money','The minimum monthly income that makes it feel like it is working.')}
{CARD('sun','Lifestyle','What your day-to-day must look like for this to feel worth it.')}
{CARD('shield','Values','What you will never do, however profitable it might be.')}
</div>
{WS('Worksheet: your non-negotiables', [("Time: How many hours per week are you willing to give to this business right now?", 2), ("Money: What is the minimum monthly income you need to generate to feel like it is working?", 2), ("Lifestyle: What must your day-to-day look like for this to feel worth it?", 3), ("Values: What will you never do, regardless of how profitable it might be?", 3)])}
{H2('Your 12-Month Vision', 3)}
{P("One clear, grounded sentence about what you want your life and business to look like 12 months from today. If you cannot write it in one sentence, it is not clear enough yet. Clarity is not a luxury. It is a prerequisite.")}
{FIG(D.sunrise())}
{WS('My 12-month vision in one sentence', [("In 12 months from today, my life and business look like this...", 4)])}
{CALL('Do this every morning', "Read that sentence every morning for the next 30 days. Before you open social media. Before you check your email. Let it orient your day.")}
{NOTES(1)}
{RECAP('CHAPTER ONE', 'You have your WHY.', ['My Layer 3 why, what I am truly fighting for:', 'My minimum income non-negotiable: $', 'My 12-month vision:'])}
'''
    return o + chapter_end()
