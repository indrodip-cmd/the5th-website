from comps import *
import diagrams as D

def ch5():
    o = chapter_open(5, 'Chapter Five', 'Design Your First Digital Product', 'Christinee Mathison · Co-Author, The5th Consulting',
        '"Done is better than perfect."', 'Sheryl Sandberg', 'You have something to sell.')
    o += chapter_start(5)
    o += f'''{BY('Christinee Mathison')}
{LEAD("You have done the hard work. You know your why. You know exactly who your One Person is, what keeps him or her up at night, and what transformation he or she is desperately searching for. Now it is time to build something.")}
{P("This is where most people freeze. They stare at a blank screen and think: 'What should I create? Will it be good enough? What if nobody buys it?' And weeks turn into months, all because they were waiting to feel ready.")}
{PULL('You will never feel completely ready. But after this chapter, you will have a clear blueprint for your first digital product.', 'Something real. Something sellable. Something that can start working for you this week.')}
{H2('The 3 Fastest Digital Product Formats', 1)}
<div class="grid3">
{CARD('book','1. PDF guide or workbook','The fastest product you can create. A well-structured PDF, 15 to 70 pages, that teaches a specific skill or provides frameworks and worksheets. Best for step-by-step processes, frameworks, checklists. 3 to 7 days. Tool: Canva (free).')}
{CARD('play','2. The mini-course','3 to 6 short videos, each 10 to 20 minutes. Record on your phone or laptop. No studio required. A mobility routine, breathwork, a client proposal. 7 to 14 days. Tools: Loom (free), Gumroad or Stan Store.')}
{CARD('grid','3. Template or toolkit','A ready-to-use file your buyer can open, edit, and implement immediately: a nutrition plan template, a client onboarding system, a content calendar. 2 to 5 days. Tools: Canva, Google Sheets, or Notion.')}
</div>
{WS('Which format is right for you?', [("Which format feels most natural for how you already share information?", 2), ("Which format does your One Person prefer to consume?", 2), ("Which format could you realistically create this week if you committed to it?", 2), ("Your chosen format is:", 1)])}
{H2('How to Price Your First Product', 2)}
{FIG(D.price_steps())}
{CALL('The psychology of low-ticket pricing', "$7 removes every financial objection. It is an impulse buy. A buyer who spends $7 with you is 10 times more likely to spend $27, $47, or $97 with you later.", "The goal of your first product is not to get rich. The goal is to get buyers. Buyers become repeat buyers. That is where the $10K months come from.")}
{TABLE(['Price','Best for'], [['Under $10','Workbooks, checklists, swipe files: maximum accessibility.'],['$17 to $37','Mini-courses or toolkits with clear, specific outcomes.'],['$37 to $97','Comprehensive guides, full courses, or done-for-you templates.']])}
{WS('Pricing your product', [("What is the specific outcome your product delivers? (Not 'feel healthier' but 'complete your first week of meal prep in under 2 hours')", 3), ("How much time does your product save your buyer?", 2), ("My first product price point is: $", 1)])}
{H2('Your Product Blueprint', 3)}
{WS('Complete your product blueprint', [("Product title", 2, "Specific. 'The 7-Day Stress Reset for Burnt-Out Professionals' beats 'My Wellness Guide'."), ("The one promise", 2, "'After going through this, you will be able to...'"), ("Format", 1, "PDF / Mini-course / Template / Toolkit"), ("Price: $", 1), ("Who it is for", 2, "Your One Person in one sentence."), ("The biggest problem it solves", 2, "In his/her words, not yours."), ("Delivery method", 1, "Email download / Gumroad / Stan Store / ThriveCart"), ("What is included", 3, "List every section, module, or file."), ("Your launch deadline: I will have this product ready by:", 1)])}
{H2('Your One-Sentence Sales Promise', 4)}
{CALL('The formula', "I help [YOUR ONE PERSON] achieve [SPECIFIC OUTCOME] in [TIME FRAME], even if [THEIR BIGGEST OBJECTION].")}
{NOTE('Fitness', '"I help busy professionals over 40 build a sustainable fitness habit in 21 days, even if they have tried and failed every other programme."')}
{NOTE('Healing and mindset', '"I help burnt-out consultants reset their nervous system and rebuild their energy in 30 days, even if they have been running on empty for years."')}
{NOTE('Business', '"I help service-based consultants package their expertise into a digital product and make their first online sale in 7 days, even if they have zero tech experience."')}
{WS('Your one-sentence sales promise', [('Draft 1: "I help _______ achieve _______ in _______, even if _______."', 2), ("Draft 2: make it more specific:", 2), ("FINAL VERSION. This is the one you will use:", 2)])}
{H2('Common Mistakes to Avoid', 5)}
{CHK(["Making it too long. Your buyer needs the 20 pages that get the result, not 200.", "Trying to cover everything. Pick ONE problem and solve it completely.", "Waiting until it is perfect. 'Good enough and launched' beats 'perfect and never shipped'.", "Pricing too low out of fear. $0 signals no value; $7 signals 'this is real and worth your time'.", "Choosing a format you hate creating.", "No clear outcome. If you cannot say in one sentence what your buyer will DO after it, it is not focused enough.", "Skipping the title. A clear, curiosity-provoking title sells products."])}
{H2("The MVP Checklist: What 'Done Enough' Looks Like", 6)}
{CHK(done=True, items=["It delivers the ONE specific outcome promised in the title", "It is designed for your One Person, not for everyone", "Every section earns its place (no filler, no padding)", "It has been read or watched through once from start to finish", "The design is clean and readable", "There is a clear next step at the end", "You would be proud to show it to your ideal client today"])}
{NOTES(5)}
{RECAP('CHAPTER FIVE', 'You have something to sell.', ['My product format:', 'My product title:', 'My one-sentence sales promise:', 'My price: $          My launch deadline:'])}
'''
    return o + chapter_end()
