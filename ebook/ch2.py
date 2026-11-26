from comps import *
import diagrams as D

def ch2():
    o = chapter_open(2, 'Chapter Two', 'Diagnose Your Current Situation', 'Indrodip Ghosh · Co-Author, The5th Consulting',
        '"If you do not know where you are, a map is useless."', 'Cecile Springer', 'You know where you are.')
    o += chapter_start(2)
    o += f'''{BY('Indrodip Ghosh')}
{LEAD("Most people skip this step. They want to jump straight to the product, the launch, the money. But if you do not have an honest picture of where you are right now, you will build in the wrong direction.")}
{P("This chapter is your business audit. It might be uncomfortable. That is by design. The truth, even when it stings, is the only foundation worth building on.")}
{H2('The Time-Money Trap Audit', 1)}
{P("There are three types of income: Active, Leveraged, and Passive. Most people reading this are stuck in Active income, meaning if they stop working, the money stops too. The goal of this workbook is to move you toward Leveraged and Passive income, where you build once and sell repeatedly.")}
{FIG(D.income_types(), 'The three types of income')}
{WS('The time-money audit', [("What percentage of your current income is Active? Leveraged? Passive?", 2), ("How many hours per week are you currently trading for money?", 2), ("What would happen to your income if you took two weeks completely off?", 3)])}
{H2('The Bleeding Money Audit', 2)}
{P("Before you focus on making more, identify what is already leaking out. Most businesses, especially new ones, have small financial leaks that drain momentum before it can build.")}
{FIG(D.leaky_bucket(), 'Plug the leaks before you pour in more')}
{WS('Where is your money going?', [("Tools and subscriptions you are paying for but not actively using:", 3), ("Time spent on tasks that do not directly generate revenue:", 3), ("Services you are offering below your true market value:", 3), ("List 3 things you are paying for that are not generating return:", 3), ("What is one hour of your time actually worth? (Be honest.)", 2)])}
{H2('Your Transferable Expertise', 3)}
{P("Here is a question that changes everything: <strong>What do you know, right now, today, that someone else would pay to learn?</strong>", "Most people dismiss their own knowledge because it feels obvious to them. But obvious to you is a breakthrough for someone else. Your lived experience is a curriculum. Your scars are a roadmap.")}
{STORY('Field note: the healing practitioner', "A healing practitioner I worked with spent six months convincing herself that her knowledge of trauma recovery was 'too basic.' She had helped herself recover from burnout after a 20-year corporate career.", "That was not basic. That was a $997 course waiting to exist.", ic='sprout')}
{FIG(D.iceberg())}
{WS('Your expertise inventory', [("What is a result you have achieved that others in your life have not?", 3), ("What do people come to you for advice about, even informally?", 3), ("What skill or knowledge took you years to develop that you could teach in a weekend?", 3), ("What problem have you solved in your own life that you wish someone had guided you through?", 3), ("My biggest transferable expertise or result:", 2), ("Three problems I have personally solved that others still struggle with:", 3)])}
{NOTES(2)}
{RECAP('CHAPTER TWO', 'You know where you are.', ['My income breakdown: Active ___%  Leveraged ___%  Passive ___%', 'My biggest transferable expertise:', 'The problem others would pay me to teach:'])}
'''
    return o + chapter_end()
