from comps import *
import diagrams as D

def ch3():
    o = chapter_open(3, 'Chapter Three', 'The Asset Mindset', 'Indrodip Ghosh · Co-Author, The5th Consulting',
        '"Do not work for money. Make money work for you."', 'Robert Kiyosaki', 'You understand the asset game.')
    o += chapter_start(3)
    o += f'''{BY('Indrodip Ghosh')}
{LEAD("Here is the shift that separates people who stay stuck from those who build real freedom.")}
{PULL('A job gives you a paycheck. A business gives you clients. An asset gives you income whether you show up or not.')}
{P("You are not here to build a better job. You are here to build an asset.")}
{H2('What Is a Digital Asset?', 1)}
{P("A digital asset is anything you create once and can sell an unlimited number of times without your direct involvement. An ebook. A course. A template pack. A membership. A mini-training.")}
{STORY('Field note: the nutritional consultant', "A nutritional consultant I worked with had spent 12 years giving the same advice one-on-one to private clients. We packaged her method into a $47 digital toolkit. It made more in its first month than two of her consulting clients combined, without a single additional coaching call.", ic='coin')}
{FIG(D.three_models(), 'Job vs. service business vs. digital asset business')}
{H2('Your Knowledge Inventory', 2)}
{WS('Worksheet: your knowledge inventory', [("What do you know deeply, from experience, not just education?", 3), ("What transformation have you made in your own life that others are still searching for?", 3), ("What skills do you use naturally that feel effortless to you but appear difficult to others?", 3), ("What is a system, process, or method you have developed that gets results?", 3), ("My top 3 areas of expertise or lived knowledge:", 3)])}
{H2('The $7 to $10K Ladder', 3)}
{P("Here is how a digital product business actually scales. Not one big launch, but a connected ladder, each product serving the same person at a deeper level.")}
{FIG(D.ladder_stairs(), 'The product ladder')}
{TABLE(['Step','What it does'], [['$7 Ebook','The entry point. Builds trust, delivers a quick win, introduces your method.'],['$27 Mini-course','Goes deeper. Shows them how to implement what the ebook introduced.'],['$47 Toolkit','Done-for-you resources. Templates, swipe files, plug-and-play assets.'],['$10 Call','A low-barrier conversation that converts to high-ticket.'],['$1,000 to $5,000 Coaching','The premium transformation for those who want full support.']])}
{WS('Where are you on the ladder?', [("Where on this ladder does your expertise naturally fit? Start there.", 3), ("What is one digital product you could create in the next 7 days?", 3), ("What would the next product on your ladder look like after that?", 3)])}
{NOTES(3)}
{RECAP('CHAPTER THREE', 'You understand the asset game.', ['My first digital product idea:', 'My entry price point: $', 'The transformation it delivers:'])}
'''
    return o + chapter_end()
