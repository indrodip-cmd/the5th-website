from comps import *
import diagrams as D

def ch6():
    o = chapter_open(6, 'Chapter Six', 'Create a Simple Offer That Sells Itself', 'Christinee Mathison · Co-Author, The5th Consulting',
        '"People do not buy products. They buy better versions of themselves."', '', 'You have a reason for them to buy.')
    o += chapter_start(6)
    o += f'''{BY('Christinee Mathison')}
{LEAD("There is a difference between having a product and having an offer. A product is what you made. An offer is what you present: the complete package of value that makes your buyer think, 'I would feel ridiculous saying no to this.'")}
{P("You can have the best product in the world, but if your offer is weak, people will scroll past it. And you can have a very simple product, but if your offer is irresistible, people will line up to buy it.")}
{H2("What Makes an Offer 'Stupid Easy' to Say Yes To", 1)}
<div class="grid2">
{CARD('coin','1. The value feels much bigger than the price','Your buyer should feel like they are getting $200 of value for $7.')}
{CARD('target','2. The outcome is crystal clear',"Not 'more clarity' but 'a completed 90-day nutrition plan ready to share with your first clients by Friday.'")}
{CARD('shield','3. The risk feels near zero','A guarantee, a low price, or a tangible deliverable all reduce the perceived risk.')}
{CARD('chat','4. Easy to explain in one sentence','If you cannot explain it in under 20 words, it is not clear enough.')}
{CARD('user','5. It speaks to his or her exact situation',"He or she reads your offer and thinks: 'This was written for me.'",True)}
</div>
{H2('The 5 Components of an Irresistible Digital Offer', 2)}
{FIG(D.offer_stack(), 'Stack the value, then name the total')}
{WS('Component 1: the core product', [("What is the main deliverable?", 2), ("What specific result does it create?", 2), ("How is it delivered?", 2)])}
{WS('Component 2: the bonuses', [("Bonus 1: name and description:", 2), ("Bonus 2: name and description:", 2), ("Combined value of all bonuses: $", 1)])}
{WS('Component 3: the guarantee', [("What guarantee will you offer? (Even a 7-day satisfaction guarantee removes enormous buying resistance.)", 2), ("How long is the guarantee period?", 1), ("What does your buyer do if he/she wants a refund?", 2)])}
{WS('Component 4: urgency or scarcity (optional)', [("Is there a launch price that goes up after a certain date?", 2), ("What is the deadline or limited element? (Only use this if it is genuine.)", 2)])}
{WS('Component 5: the total value statement', [("Core product value: $          Bonus 1 value: $          Bonus 2 value: $", 1), ("Total value: $          Today's price: $", 1), ('"Everything inside is worth $____. You are getting it today for just $____."', 1)])}
{H2('Worksheet: Your Complete Offer Stack', 3)}
{WS('Your complete offer stack', [("Product name:", 1), ("What is included (list everything: every file, video, template, bonus):", 4), ("The main promise:", 2), ("Your guarantee:", 2), ("Total value: $          Today's price: $", 1), ("How it is delivered:", 1), ("Who this is for (one sentence):", 2), ("Who this is NOT for (be honest, it builds trust):", 2)])}
{H2('How to Write a One-Page Offer Description', 4)}
<div class="step"><div class="num">1</div><div><h4>The hook: who is this for and what problem does it solve?</h4><p><em>"If you have been sitting on your expertise for months but have no idea how to turn it into income, this is for you."</em></p></div></div>
<div class="step"><div class="num">2</div><div><h4>The promise: what will they have at the end?</h4><p><em>"This workbook takes you from stuck and overwhelmed to a clear product, a simple offer, and a launch plan, in less than a week."</em></p></div></div>
<div class="step"><div class="num">3</div><div><h4>What is included: your offer stack in plain language</h4><p><em>"You get the 70-page workbook, the product blueprint template, and the 30-day content calendar. Total value: $127. Yours today for $7."</em></p></div></div>
<div class="step"><div class="num">4</div><div><h4>The guarantee: remove the risk</h4><p><em>"If you go through this and feel it was not worth every cent, email me within 7 days for a full refund. No questions asked."</em></p></div></div>
<div class="step"><div class="num">5</div><div><h4>The CTA: tell him or her exactly what to do next</h4><p><em>"Click the button below and get instant access."</em></p></div></div>
{WS('Write your one-page offer description', [("Line 1: the hook", 2), ("Line 2: the promise", 2), ("Line 3: what is included", 2), ("Line 4: the guarantee", 2), ("Line 5: the CTA", 1)])}
{RECAP('CHAPTER SIX', 'You have a reason for them to buy.', ['My complete offer stack is written: Yes / Not yet', 'My one-page offer description is drafted: Yes / Not yet', 'One thing I will strengthen before launching:'])}
'''
    return o + chapter_end()
