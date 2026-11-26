from comps import *
import diagrams as D

def ch7():
    o = chapter_open(7, 'Chapter Seven', 'The Organic Content System', 'Christinee Mathison · Co-Author, The5th Consulting',
        '"You do not rise to the level of your goals. You fall to the level of your systems."', 'James Clear', 'You have a voice in the market.')
    o += chapter_start(7)
    o += f'''{BY('Christinee Mathison')}
{LEAD("Most people think content is about getting famous. It is not. Content is about getting found: by the right person, at the right moment, with the right message.")}
{P("And when you do that consistently, your content becomes the most powerful sales tool you have. One that works 24 hours a day, 7 days a week, whether you are asleep, on holiday, or spending the afternoon with your family.")}
{STORY('Field note: the mindset coach', "A mindset coach I worked with had been burning herself out doing one-on-one discovery calls every single week. She had zero online content. We built a 30-day content plan: reels and captions speaking directly to her One Person's fear of visibility. Within 45 days she had 12 new leads coming to her, instead of the other way around.", ic='mega')}
{CALL('The content mindset shift', "Stop thinking: 'What should I post today?'", "Start thinking: 'What does my One Person need to hear today to take one step closer to buying?'")}
{P("Every post should do at least one of these three things: <strong>attract</strong> (pull the right people into your world), <strong>build trust</strong> (prove you understand the problem and can solve it), or <strong>sell</strong> (invite him or her to take the next step).")}
{H2('The 3-Part Content Formula: Story, Lesson, CTA', 1)}
{FIG(D.story_lesson_cta())}
{NOTE('Part 1: the story (hook them in)', "Start with something real. A moment. A mistake. A client result. Do not start with: 'Here are 5 tips for...' Start with: 'Three months ago, I had a client who was a nutrition coach with 12 years of experience but could not figure out why no one was buying her online programme...'")}
{NOTE('Part 2: the lesson (teach them something)', "Extract ONE insight from your story. Not five. Not three. One. The more focused your lesson, the more it lands.")}
{NOTE('Part 3: the CTA (tell them what to do next)', "Every piece of content needs a destination. 'Save this,' 'Share this,' 'Comment below,' or 'DM me the word START.'")}
{WS('Exercise: apply the formula', [("Story: write your opening 2-3 sentences. Start with a real moment:", 3), ("Lesson: what is the one insight from that story?", 2), ("CTA: what do you want him/her to do after reading this?", 2)])}
{H2('Likes vs. Clients', 2)}
<div class="grid2">
<div class="card" style="background:#F1F3F2"><h4 style="color:#5C6B62">Content that gets likes</h4><ul class="bul" style="margin:6px 0 0 14px"><li>Motivational quotes</li><li>'This or that' polls</li><li>Trending audio + generic text</li><li>Broad inspirational messages</li><li>Feel-good affirmations</li><li>Viral challenges</li></ul></div>
<div class="card dark"><h4>Content that gets clients</h4><ul class="bul" style="margin:6px 0 0 14px"><li>Your personal story of transformation</li><li>Specific lessons from your own experience</li><li>Content that speaks to one specific pain</li><li>Offers and CTAs woven into valuable teaching</li><li>Proof: results, case studies, before-and-afters</li><li>Consistent, niche-specific educational content</li></ul></div>
</div>
{P("You need both. Reach content attracts new eyes. Trust content converts those eyes into buyers. Always ask: 'Does this move my One Person one step closer to buying?'")}
{H2('Your First 30 Days of Content', 3)}
{FIG(D.content_grid(), 'Your 30-day content map')}
{TABLE(['Day','Format','Topic prompt','CTA'], [['1','Reel','Your story: why you started this journey','Follow'],['2','Caption','The biggest mistake you made before you figured this out','Comment'],['3','Reel','A mindset shift your audience needs to hear','Save'],['4','Story','A poll or question: get your audience talking','Reply'],['5','Caption','Teach one specific lesson from your expertise','DM START'],['6','Reel','What your One Person is struggling with right now','Follow'],['7','Caption','A result you or a client achieved: before and after','Link in bio'],['8','Reel','A common myth in your niche: debunk it','Save'],['9','Caption','3 signs your audience is ready for your product','Comment'],['10','Reel','Soft intro to your product: what it is, who it is for','Link in bio'],['11-30','Mix','Rotate: story / lesson / offer / proof / behind the scenes','Rotate CTAs']])}
{WS('Plan your next 7 days', [("Monday: topic", 1), ("Tuesday: topic", 1), ("Wednesday: topic", 1), ("Thursday: topic", 1), ("Friday: topic", 1), ("Saturday: topic", 1), ("Sunday: topic", 1)])}
{H2('Your 5 Selling-Without-Selling Posts', 4)}
{P("'Selling without selling' means creating content so aligned with your One Person's problems that when you mention your offer, it feels like a natural next step, not a pitch.")}
<div class="grid2">
{CARD('clock','Post 1: the before post',"Describe your One Person's life right now, without your product. Paint the frustration so accurately he or she reads it and thinks: 'This person is talking about me.'")}
{CARD('sun','Post 2: the after post','Describe what life looks like after the problem is solved. What does the day feel like? What has changed? What is now possible?')}
{CARD('bulb','Post 3: the myth buster',"Challenge a common belief keeping him or her stuck. Example: 'The reason you are not getting clients is not what you think...'")}
{CARD('star','Post 4: the result post',"Share a real result, yours or a client's. Specific. Numbers, timelines, and before-and-afters build trust faster than anything.")}
</div>
{CALL('Post 5: the soft pitch', "Tell the story of why you built your product. Describe what is inside. Give a clear, simple CTA. Keep the ratio at 80% story, 20% pitch.")}
{H2('Short-Form vs. Long-Form: When to Use Each', 5)}
<div class="grid2">
{CARD('play','Use reels (60 to 90 seconds) when...','You want to reach NEW people, because reels get pushed beyond your existing followers. You are sharing mindset content, quick tips, or emotional hooks.')}
{CARD('book','Use long-form posts or videos when...','You want to build DEEP TRUST with people who already follow you. You are teaching a framework, sharing a story, or making an offer.',True)}
</div>
{CALL('The winning formula', "Post one reel per day to attract new eyes.", "Write 2 to 3 long captions or videos per week to convert those eyes into buyers.")}
{RECAP('CHAPTER SEVEN', 'You have a voice in the market.', ['I understand the Story, Lesson, CTA formula: Yes / Not yet', 'I have planned my first 7 days of content: Yes / Not yet', 'I have drafted my 5 selling-without-selling posts: Yes / Not yet', 'My biggest insight from this chapter:'])}
'''
    return o + chapter_end()
