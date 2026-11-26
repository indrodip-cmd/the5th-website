from comps import *
import diagrams as D

def ch4():
    o = chapter_open(4, 'Chapter Four', 'Find Your Perfect Audience', 'Christinee Mathison · Co-Author, The5th Consulting',
        '"If you speak to everyone, you speak to no one."', 'Seth Godin', 'You know exactly who you are building for.')
    o += chapter_start(4)
    o += f'''{BY('Christinee Mathison')}
{LEAD("You could have the most brilliant digital product in the world. But if you are trying to sell it to everyone, you will sell it to almost no one.")}
{P("This is the mistake I see over and over again, especially with coaches, consultants, and healers who are talented, experienced, and deeply qualified. They hold back from choosing a specific person because they are afraid of leaving someone out. They think: 'But what if I need more clients? What if I narrow too much?'", "Here is what I know for certain: the more specific you are about who you serve, the easier it becomes to attract them. The more you try to speak to everyone, the harder every part of your business gets: the content, the offer, the sales, all of it.", "This chapter is about finding your <strong>One Person</strong>. The specific human being whose life your product is designed to transform. Once you know who he or she is, everything else in your business gets easier.")}
{H2('The One Person Method', 1)}
{P("Stop trying to serve everyone. You need one clear person in mind when you write your content, build your offer, and design your product.", "Your One Person is not a demographic. He or she is not 'coaches aged 35 to 55 who are interested in business.' He or she is a real, specific human being with a specific frustration, a specific dream, and a specific reason why he or she has not made it happen yet.")}
{FIG(D.persona(), 'Know their inner world and their outer world')}
{STORY('Field note: the fitness coach', "Think of a fitness coach who has been helping clients one-on-one for five years. She knows she wants to create a digital product, but keeps asking: 'Who is my audience?' The answer is not 'anyone who wants to get fit.' The answer is: 'The busy professional in their 40s who has tried every programme and failed, because the problem was never the programme. It was the system around it.'", "When you know your One Person that well, your content feels like it was written just for him or her. And when he or she reads your words, the thought is: 'This person gets me.' That feeling is what turns a follower into a buyer.", ic='target')}
{CALL('Pick your One Person', "Think of ONE real person you already know: a friend, a past client, a colleague, who is exactly the kind of person you want to help. Someone who has the problem you solve and the desire to fix it.", "If you cannot think of a real person, think of a version of yourself from 2 to 3 years ago, before you figured out what you now know.", "That person is your One Person. He or she is who you are writing to. He or she is who every chapter of your product is designed for.")}
{WS('Exercise: describe your One Person in 10 specific details', [("His/Her first name is:", 1), ("His/Her age is approximately:", 1), ("His/Her current job, role, or situation:", 2), ("What does his/her typical day look like? (Morning to evening)", 3), ("What is the biggest frustration he/she carries into every week?", 2)])}
{WS('His/Her inner world', [("What does he/she secretly wish his/her life looked like?", 2), ("What has he/she already tried that did not work?", 2), ("What does he/she tell himself/herself is the reason he/she has not made it happen yet?", 2), ("What does he/she feel when he/she wakes up at 3am and cannot sleep?", 2)])}
{WS('His/Her external world', [("Where does he/she spend time online? (Instagram, LinkedIn, Facebook groups, YouTube?)", 2), ("What does he/she read, watch, or listen to for inspiration?", 2), ("Who does he/she already follow or admire in the online space?", 2)])}
{H2('Where Your Audience Is Already Hanging Out', 2)}
{P("Once you know your One Person, the next question is simple: where is he or she already spending his or her time? You do not need to be everywhere. You need to be where he or she already is.")}
<div class="grid3" style="grid-template-columns:1fr 1fr">
{CARD('user','Instagram','Great for coaches, healers, and wellness professionals. Reels and Stories are your tools here.')}
{CARD('mail','LinkedIn','Best for consultants and professionals who are corporate-adjacent or transitioning from a 9-5 into their own practice.')}
{CARD('chat','Facebook groups','Excellent for clients over 40 who prefer community conversations and longer-form interaction.')}
{CARD('play','YouTube','Ideal if your One Person learns by watching. Long-form how-to content builds deep trust here.')}
</div>
{CALL('Email: the most powerful platform of all', "Because you own it. No algorithm. No shadow ban. Direct access to his or her inbox.")}
{WS('Where is your One Person?', [("The platform where he/she spends the most time:", 2), ("The type of content he/she engages with most (reels, posts, podcasts, emails?):", 2), ("Three accounts, communities, or pages he/she is likely already following:", 2), ("One community or group where he/she would ask for advice from peers:", 2)])}
{H2('The 5 Problems He/She Wakes Up Thinking About', 3)}
{P("Here is something most people get wrong about selling: they describe their product instead of reflecting their buyer's pain.")}
{STORY('Field note: the management consultant', "A management consultant I worked with kept writing content about her methodology. Nobody engaged. The moment she switched to writing about her clients' pain: 'You have the expertise but you feel invisible online and you do not know how to change that,' her inbox filled up within 48 hours.", ic='mega')}
{WS('Exercise: the 5 midnight problems', [("Problem 1: What keeps him/her up at night about work or income?", 2), ("Problem 2: What has he/she tried before that let him/her down?", 2), ("Problem 3: What does he/she feel is missing that other people seem to have?", 2), ("Problem 4: What does he/she fear will still be true in 2 years if nothing changes?", 2), ("Problem 5: What would he/she type into Google at 11pm when he/she cannot sleep?", 2)])}
{H2('The Pain-to-Product Bridge', 4)}
{P("The pain-to-product bridge is simple: connect what he or she is already struggling with to what your product provides. This is not manipulation. It is clarity.")}
{FIG(D.bridge())}
{TABLE(['His/her pain','Your product bridges to...'], [['"I am exhausted from trading hours for money and I cannot see a way out."','A workbook that maps out exactly how to build an income stream that does not require his/her time every single time.'],['"I have tried online courses before but they were overwhelming and I gave up halfway."','Step-by-step, one chapter at a time, with exercises he/she can complete in under 30 minutes.'],['"I do not think anyone will pay for what I know. I am a healer, not a marketer."',"Chapter 3's Knowledge Inventory proves expertise. Chapter 5 shows exactly how to package it."]])}
{WS('My pain-to-product bridge', [("His/Her biggest pain (in his/her words, not yours):", 2), ("What your product specifically does about that pain:", 2), ("The transformation he/she experiences as a result:", 2), ('Your one-sentence bridge statement: "If you are struggling with _______, this is for you because _______."', 2)])}
{H2('Reality Check: Are You Still Being Too Broad?', 5)}
{P("Tick any that sound like you:")}
{CHK(["My ideal client is 'anyone who wants to make more money'", "I do not want to exclude certain age groups or genders", "My product could work for coaches AND consultants AND healers AND freelancers", "I am scared to niche down because it feels limiting", "My content topics change every week depending on what I think people want"])}
{CALL('The truth about niching down', "Choosing ONE person does not mean you will only ever work with one type of person. It means your MARKETING speaks to one person clearly. In reality, when your message is clear and specific, it often attracts a wider audience than a vague, generic message ever would.", "The specialist always earns more than the generalist. Choose your person. Speak to him or her. Watch what happens.")}
{RECAP('CHAPTER FOUR', 'You know exactly who you are building for.', ["My One Person's name is:", 'His/Her biggest problem is:', 'He/She hangs out most on:', 'My bridge statement:'])}
'''
    return o + chapter_end()
