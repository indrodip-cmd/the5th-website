import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { answers, name } = await req.json()

    const stageMap: Record<string, string> = {
      'starting': 'The Pioneer',
      'idea': 'The Pioneer',
      'launched': 'The Pathfinder',
      'scaling': 'The Builder',
      'established': 'The Luminary',
    }
    const archetype = stageMap[answers.q1] || 'The Pioneer'

    const energyMap: Record<string, string> = {
      'action': 'Driver — action-oriented, executes fast, needs clear direction',
      'connection': 'Flow Worker — relationship-driven, energised by genuine connection, drained by forced outreach',
      'ideas': 'Deep Thinker — creative and strategic, brilliant in bursts, struggles with consistent execution',
      'meaning': 'Gentle Builder — purpose-driven, needs sustainable pace, overwhelmed by hustle culture',
    }
    const personality = energyMap[answers.q2] || 'Driver — action-oriented, executes fast, needs clear direction'

    const hustleMap: Record<string, string> = {
      'thrives': 'thrives under pressure and loves hard work',
      'burnout': 'has burned out from hustle and will not go back',
      'overwhelm': 'gets overwhelmed by hustle and needs a gentler approach',
      'resent': 'rejects hustle culture entirely and needs a soft strategy',
    }
    const hustleStyle = hustleMap[answers.q10] || 'works at their own pace'

    const outreachMap: Record<string, string> = {
      'consistent': 'can do consistent daily outreach',
      'genuine': 'can only do outreach when it feels genuine and organic',
      'limited': 'has limited outreach capacity and gets overwhelmed by volume',
      'avoids': 'avoids cold outreach entirely and needs inbound strategies',
    }
    const outreachStyle = outreachMap[answers.q4] || 'selective with outreach'

    const visibilityMap: Record<string, string> = {
      'comfortable': 'comfortable with consistent public visibility',
      'inspired': 'shows up powerfully when inspired but goes quiet otherwise',
      'selective': 'selective with visibility — quality over quantity',
      'frightened': 'frightened of public visibility and needs gentle exposure',
    }
    const visibilityStyle = visibilityMap[answers.q5] || 'selective with visibility'

    const workMap: Record<string, string> = {
      'structured': 'works best with structured systems and clear processes',
      'intuitive': 'works intuitively and adapts in motion',
      'sprints': 'works in intense sprints and needs recovery time',
      'sustainable': 'needs slow sustainable building over hustle',
    }
    const workStyle = workMap[answers.q3] || 'works at their own pace'

    const supportMap: Record<string, string> = {
      'strategy': 'needs a clear step-by-step strategy they can execute',
      'accountability': 'needs accountability to stay consistent',
      'permission': 'needs permission and encouragement before they believe they are ready',
      'thinking': 'needs a thinking partner to process decisions',
    }
    const supportStyle = supportMap[answers.q19] || 'needs clear direction'

    const consistencyMap: Record<string, string> = {
      'consistent': 'highly consistent and disciplined',
      'intense': 'inconsistent but brilliant when on — needs to harness their peaks',
      'steady': 'steady and gradual — slow build compounds powerfully',
      'deadlines': 'deadline-driven — needs external accountability structures',
    }
    const consistencyStyle = consistencyMap[answers.q14] || 'works consistently'

    const prompt = `You are The5th AI, an expert business strategist specialising in helping women over 40 monetise their expertise.

${name} just completed a 20-question personality and business quiz. Here is everything you know about them:

ARCHETYPE: ${archetype}
PERSONALITY TYPE: ${personality}
HUSTLE RELATIONSHIP: ${hustleStyle}
OUTREACH CAPACITY: ${outreachStyle}
VISIBILITY COMFORT: ${visibilityStyle}
WORK STYLE: ${workStyle}
SUPPORT NEEDED: ${supportStyle}
CONSISTENCY STYLE: ${consistencyStyle}

BUSINESS DETAILS:
Stage: ${answers.q1}
Niche: ${answers.q6}
Client pain point: ${answers.q7}
Zone of genius: ${answers.q11}
Delivery preference: ${answers.q13}
Pricing confidence: ${answers.q15}
Revenue goal: ${answers.q18}
Decision making: ${answers.q8}
When stuck: ${answers.q16}
Content approach: ${answers.q12}
Transformation story: ${answers.q17}
Final readiness: ${answers.q20}
Biggest 12-month goal: ${answers.qgoal}
The ONE challenge they most want solved together: ${answers.qchallenge}

MONEY PSYCHOLOGY (handle with great care, supportively, never diagnose or label):
Comfort charging premium prices (1 low to 5 high): ${answers.qmp1}
Emotion that comes up most around money: ${answers.qmp2}
Belief that feels most true to them: ${answers.qmp3}
Family relationship with money growing up: ${answers.qmp4}
Fear that affects their business most: ${answers.qmp5}

CRITICAL INSTRUCTION:
This person is a ${personality}.
They ${hustleStyle}.
They ${outreachStyle}.
Do NOT recommend strategies that conflict with their personality type.
If they cannot do high-volume outreach, do NOT suggest 20 DMs a day.
If they get overwhelmed by hustle, do NOT suggest a hustle approach.
If they need sustainable pace, build everything around that.
Match every strategy to who they actually are.

Generate a DETAILED personalised business strategy for ${name}.

Use this EXACT structure with these EXACT section headers:

## SCORES
## YOUR SITUATION RIGHT NOW
## MONEY PSYCHOLOGY INSIGHTS
## YOUR SIGNATURE OFFER
## YOUR LEAD MAGNET IDEA
## YOUR DIGITAL PRODUCT IDEA
## 7-DAY CONTENT PLAN
## 30-DAY ACTION PLAN
## YOUR PRICING STRATEGY
## YOUR BIGGEST OPPORTUNITY
## YOUR NEXT 7 DAYS

CONTENT REQUIREMENTS:

## SCORES
This section comes FIRST. Score this person's business on each dimension from 0 to 100, based honestly on their answers. Earlier-stage businesses and clear gaps must score lower; established strengths score higher. Be realistic and specific to them, not generous by default. Output EXACTLY these nine lines and nothing else in this section, each as "Label: number":
Offer: [0-100]
Positioning: [0-100]
Pricing: [0-100]
Sales: [0-100]
Content: [0-100]
Marketing: [0-100]
Automation: [0-100]
Confidence: [0-100]
Use their money-psychology answers to inform the Pricing and Confidence scores especially. No commentary, no extra text in this section, just the nine lines.

The deep build sections (signature offer, pricing strategy, 30-day plan, 7-day content plan, lead magnet, digital product) must be substantial and detailed.

BUT the reader-facing summary sections (YOUR SITUATION RIGHT NOW, MONEY PSYCHOLOGY INSIGHTS, YOUR BIGGEST OPPORTUNITY, YOUR NEXT 7 DAYS) must be SCANNABLE: short paragraphs of 1-2 sentences, and bullet points for the key takeaways. People skim. Make these feel light, clear, and easy to read at a glance, never dense walls of text.

## YOUR SITUATION RIGHT NOW
Write ONE short paragraph (2-3 sentences) that makes them feel deeply understood, then 3-4 bullet points: their stage, their strength, the single biggest thing holding them back, and how it connects to their 12-month goal (${answers.qgoal}) and the one challenge they want solved (${answers.qchallenge}). Keep it warm and skimmable.

## MONEY PSYCHOLOGY INSIGHTS
Write 2-3 short, warm paragraphs based on their money-psychology answers (pricing comfort, the emotion money brings up, the belief that feels most true, their family money background, and their biggest fear). Explain gently how these beliefs may be influencing their pricing, sales, confidence, decision-making, and growth.
CRITICAL TONE RULES for this section:
- Be supportive and encouraging. Never judgmental, never clinical, never diagnostic.
- Do NOT label them (do not say "you have a scarcity mindset" or "you have money trauma").
- Use soft, observational language like "Based on your answers, you may sometimes hesitate to charge what you're worth because rejection feels risky," or "You appear to have a genuinely healthy relationship with pricing, which can become a real competitive advantage as you grow."
- Frame everything as workable and hopeful, something a coach can help them move through.
- Keep it business-focused. This is about pricing and confidence, not therapy.

## YOUR SIGNATURE OFFER
Write a complete offer breakdown:
- Offer name (creative, specific to their niche)
- Tagline (one punchy line)
- Format (exactly how it is delivered: 1:1, group, hybrid, async)
- Duration (specific timeframe)
- What is included (3-5 bullet points with detail)
- Recommended price (specific number with payment plan option)
- The transformation: FROM [current pain state] TO [desired outcome] in [timeframe]
Write 2-3 paragraphs explaining why this offer is right for them specifically.

## YOUR LEAD MAGNET IDEA
Write a complete lead magnet brief:
- Title (specific, compelling)
- Format (PDF, video, quiz, checklist)
- Exactly what it covers (3-5 points)
- Why it works for their specific audience
- How it connects to the signature offer
Write 2 paragraphs on the strategy behind it.

## YOUR DIGITAL PRODUCT IDEA
Write a complete digital product brief:
- Product name
- Format and price point
- What is inside (5-7 specific items)
- Who it is for and why they will buy it
- How to position it as a complement to the high-ticket offer

## 7-DAY CONTENT PLAN
For each day write:
DAY [N] - [PLATFORM]
Hook: [specific attention-grabbing opening line]
Content: [2-3 sentences describing exactly what to post]
Goal: [what this post is designed to do — build trust, generate leads, drive DMs]

All 7 days must be completely filled out. No placeholder text.

## 30-DAY ACTION PLAN
Write a full 4-week plan:
Week 1 - Foundation: 3-4 specific numbered tasks with detail on how to execute each
Week 2 - Visibility: 3-4 specific numbered tasks
Week 3 - Outreach: 3-4 specific numbered tasks
Week 4 - Conversion: 3-4 specific numbered tasks
Each task must be actionable enough to execute without further instruction.

## YOUR PRICING STRATEGY
Write 3 paragraphs covering:
- Exact recommended starting price and why
- How to present the price on a sales call (specific language)
- How to handle the most common objection for their archetype and personality type

## YOUR BIGGEST OPPORTUNITY
Write ONE short paragraph naming the single highest-leverage move available to this person right now, then 2-3 bullet points on why it matters and what it unlocks. Be specific, direct, and honest. Keep it skimmable.

## YOUR NEXT 7 DAYS
This is the part they act on immediately, so make it concrete and motivating. Give exactly 7 bullet lines, one per day, in this format:
- Day 1: [one specific, doable action, a single sentence]
- Day 2: [one specific, doable action]
...through Day 7.
Each day is ONE clear action, matched to their personality and money psychology (never suggest hustle to someone who burns out, never suggest high-volume outreach to someone who cannot do it). This is their starter plan, the exact first week that builds momentum toward their goal.

RULES:
- Speak directly to ${name} using you and your throughout
- No em dashes anywhere. Use commas and periods only.
- Reference their specific answers throughout
- Every strategy must match their personality type
- If they are not a hustler, never suggest hustle
- If they cannot do high outreach, never suggest high outreach
- Be specific. Generic advice is useless.
- TOTAL LENGTH: minimum 1800 words. If you are under 1800 words, you have not gone deep enough. Go deeper.
- Start directly with the first section. No preamble.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    })

    const roadmapText = message.content[0].type === 'text'
      ? message.content[0].text : ''

    return NextResponse.json({
      roadmap: roadmapText,
      archetype,
      personality: answers.q2 || 'action',
    })
  } catch (err) {
    console.error('Roadmap generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
