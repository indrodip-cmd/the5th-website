import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

const CAL_LINK = 'https://cal.com/indrodip-ghosh-ut1vxh/60min'

// ═══════════════════════════════════════════════════
// EMAIL BUILDER HELPERS
// ═══════════════════════════════════════════════════
function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#1C4A32;color:#ffffff;
      text-decoration:none;padding:14px 36px;font-weight:700;font-size:14px;
      border-radius:4px;font-family:sans-serif;letter-spacing:0.5px;">
      ${text} &#8594;
    </a>
  </div>`
}

function ctaSecondary(text: string, url: string): string {
  return `<div style="text-align:center;margin:12px 0 28px;">
    <a href="${url}" style="display:inline-block;color:#1C4A32;
      text-decoration:underline;font-size:13px;font-family:sans-serif;">
      ${text}
    </a>
  </div>`
}

function buildEmail(name: string, content: string): string {
  const firstName = name.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="background:#2E1A35;padding:20px 40px;border-radius:12px 12px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#ffffff;font-weight:700;font-size:12px;
          letter-spacing:2px;font-family:sans-serif;">
          THE5TH CONSULTING
        </td>
        <td align="right" style="color:#C9A84C;font-size:10px;
          font-weight:700;letter-spacing:1px;font-family:sans-serif;">
          AI COACHING SERIES
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#ffffff;padding:40px 40px 32px;
    border-left:1px solid #E2DCD2;border-right:1px solid #E2DCD2;">
    <p style="font-size:14px;color:#888;font-family:sans-serif;
      margin:0 0 24px;">Hey ${firstName},</p>
    <div style="font-size:15px;color:#2d2d2d;line-height:1.85;">
      ${content}
    </div>
    <p style="margin:32px 0 0;font-size:14px;color:#3d3d3d;font-family:sans-serif;">
      Indrodip<br>
      <span style="color:#888;font-size:12px;">The5th Consulting</span>
    </p>
  </td></tr>

  <tr><td style="background:#FAF6F0;padding:20px 40px;
    border:1px solid #E2DCD2;border-top:none;border-radius:0 0 12px 12px;">
    <p style="margin:0;font-size:11px;color:#aaa;font-family:sans-serif;text-align:center;">
      The5th Consulting &nbsp;|&nbsp; support@10kroadmap.org
      &nbsp;|&nbsp; quiz.the5th.consulting
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function taskBox(title: string, content: string): string {
  return `<div style="background:#eaf4ee;border-left:3px solid #1C4A32;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
    <p style="margin:0 0 8px;font-weight:700;color:#1C4A32;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
    <p style="margin:0 0 8px;color:#0a0a0a;"><strong>${title}</strong></p>
    ${content}
  </div>`
}

// ═══════════════════════════════════════════════════
// DAY 0 — WELCOME + 7-DAY PREVIEW (per archetype)
// ═══════════════════════════════════════════════════
const ARCHETYPE_LABELS: Record<string, string> = {
  PIONEER:    'The Pioneer',
  PATHFINDER: 'The Pathfinder',
  BUILDER:    'The Builder',
  LUMINARY:   'The Luminary',
}

const WEEK_PREVIEWS: Record<string, string[]> = {
  PIONEER: [
    'Day 1 — Why you haven\'t started yet (it\'s not what you think)',
    'Day 2 — What you\'re actually selling',
    'Day 3 — The message that starts everything',
    'Day 4 — What to do when someone responds',
    'Day 5 — How to turn a 15-minute conversation into a paying client',
    'Day 6 — A real story: zero clients for 11 months, then one conversation changed everything',
    'Day 7 — Your 30-day commitment',
  ],
  PATHFINDER: [
    'Day 1 — Why your income is inconsistent (it\'s structural, not personal)',
    'Day 2 — Your offer is probably doing too much',
    'Day 3 — Why your follow-up is killing your conversions',
    'Day 4 — The pricing conversation you keep avoiding',
    'Day 5 — How to stop starting from zero every month',
    'Day 6 — A real story: sporadic income to £4,000 every single month',
    'Day 7 — You\'re not starting. You\'re scaling.',
  ],
  BUILDER: [
    'Day 1 — Why working harder won\'t break your ceiling',
    'Day 2 — Your offer architecture is wrong — here\'s what it should look like',
    'Day 3 — The lever that doubles revenue without doubling clients',
    'Day 4 — The system that keeps your pipeline full while you sleep',
    'Day 5 — The one hire that changes everything',
    'Day 6 — A real story: £5K months to £12K months in 90 days',
    'Day 7 — You\'re not building a business. You\'re building a machine.',
  ],
  LUMINARY: [
    'Day 1 — You\'ve already proven it. Now let\'s make it untouchable.',
    'Day 2 — Your brand needs to do more of the selling',
    'Day 3 — The premium offer you\'re probably not charging enough for',
    'Day 4 — Why the coaches beneath you are starting to catch up',
    'Day 5 — How to get clients who refer other clients',
    'Day 6 — A real story: turning expertise into a seven-figure platform',
    'Day 7 — This is the beginning of the real work',
  ],
}

function makeDay0(sequence: string): { subject: string; html: (name: string, _videoUrl: string) => string } {
  const archetypeLabel = ARCHETYPE_LABELS[sequence] || 'The Pioneer'
  const preview = WEEK_PREVIEWS[sequence] || WEEK_PREVIEWS.PIONEER
  const previewHtml = preview.map(line =>
    `<li style="padding:6px 0;font-size:13px;color:#3d3d3d;font-family:sans-serif;border-bottom:1px solid #efefef;">${line}</li>`
  ).join('')
  return {
    subject: "your personalised blueprint just landed — read this first",
    html: (name: string, _videoUrl: string) => buildEmail(name, `
      <p>Your blueprint is attached. But before you open it, read this.</p>
      <p>You just found out you are <strong>${archetypeLabel}</strong>.</p>
      <p>That matters. Because every email you receive over the next 7 days is built specifically for where you are right now — your stage, your growth block, and the exact moves that work for someone at your level.</p>
      <p>Most people who take this quiz feel excited for about 20 minutes, then close the PDF and do nothing.</p>
      <p><strong>The blueprint doesn't change your income. What you do with it does.</strong></p>
      <p>Here's how I want you to use what you just received: read the whole thing once without highlighting or taking notes. Read it like a story about your business — because that's exactly what it is. Every word in that PDF came from your 20 answers.</p>
      <p>Then read it again. Circle the one section that makes you think "I already know this is the problem." That one section is your starting point. Everything else can wait.</p>
      <div style="background:#f6f9f7;border-left:3px solid #1C4A32;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 10px;font-weight:700;color:#1C4A32;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-family:sans-serif;">Your Free 7-Day Coaching — What's Coming</p>
        <p style="margin:0 0 14px;font-size:13px;color:#555;font-family:sans-serif;">One email. One task. No fluff. Built for ${archetypeLabel}.</p>
        <ul style="margin:0;padding:0;list-style:none;">
          ${previewHtml}
        </ul>
      </div>
      <p>This is not a newsletter. This is a coaching sequence. Treat it like one.</p>
      ${ctaButton("Book a Free Strategy Call with Indrodip", CAL_LINK)}
      <p style="color:#888;font-size:13px;margin-top:24px;">P.S. If you already know you don't want to wait 7 days — book a free 60-minute strategy call now: <a href="${CAL_LINK}" style="color:#1C4A32;">${CAL_LINK}</a>. I open a limited number of spots each month. They go fast.</p>
    `)
  }
}

// ═══════════════════════════════════════════════════
// ALL SEQUENCES
// ═══════════════════════════════════════════════════
const sequences: Record<string, Record<number, { subject: string; html: (name: string, videoUrl: string) => string }>> = {

  // ─────────────────────────────────────────────────
  // PIONEER — no clients yet
  // ─────────────────────────────────────────────────
  PIONEER: {
    0: makeDay0('PIONEER'),
    1: {
      subject: "Day 1 — the real reason you haven't started yet (it's not what you think)",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>You took a quiz. You got a blueprint. And if you're honest with yourself, this is probably not the first time you've taken a step toward building something.</p>
        <p>You've probably researched. Planned. Made notes. Watched videos. Maybe even bought a course.</p>
        <p>And you're still at zero.</p>
        <p>I'm not saying that to make you feel bad. I'm saying it because I want you to see what's actually happening.</p>
        <p><strong>It's not that you don't know enough.</strong></p>
        <p>You have decades of professional experience. You know more than most people will ever know in your field.</p>
        <p><strong>It's not that you don't have something valuable to offer.</strong></p>
        <p>You do. The women I've worked with who felt exactly like you — HR consultants, nurses, educators, operations leaders — all had something real. The problem was never the value. It was the identity.</p>
        <p>You are still operating as someone who earns by doing work for others. An employee. A contractor. A professional in someone else's system.</p>
        <p>To build income from your expertise, you have to make one shift before anything else:</p>
        <p><strong>You have to start seeing yourself as someone whose knowledge is worth paying for directly.</strong></p>
        <p>Not through an employer. Not through a platform. Directly. From a person to you.</p>
        <p>That shift is not automatic. It's a decision.</p>
        ${taskBox("My Expertise Has Real Value", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook. At the top write: <strong>"Day 1: My Expertise Has Real Value."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Answer these three questions honestly. Full paragraphs. No bullet points. Don't make it pretty — make it real.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;"><strong>Question 1:</strong> What do I know how to do that other people genuinely struggle with? Be specific. Not "I'm good with people." What specifically can you do, diagnose, solve, or teach that would take someone else years to figure out on their own?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Question 2:</strong> Who in my past — colleague, friend, family member, stranger — have I helped with exactly this? What happened for them? Write the story. Even one example proves the value is real.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Question 3:</strong> What would it mean for my life if I was earning £2,000–£3,000 a month from this knowledge? Not what you'd buy. What would change? Your freedom, your confidence, your relationship with money, your sense of what's possible?</p>
        `)}
        <p><strong>Win condition:</strong> Three honest paragraphs in your notebook. Written. Not thought about. Written.</p>
        <p>Reply to this email with: <strong>"Day 1 — Done."</strong></p>
        <p>If you want to shortcut this process and sit down with me directly to build your offer, identity, and 90-day plan in one session — book a strategy call. I open 10 spots a month. It's free.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The version of you that says "I'll do this later today" is the version that stays stuck. Do it now. You have 15 minutes.</p>
      `)
    },
    2: {
      subject: "Day 2 — what you're actually selling (and it's not what you think)",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Yesterday you did the identity work. Or you didn't, in which case go back and do it before reading this.</p>
        <p>Today we answer the question that keeps most beginners broke for months: <strong>"What exactly am I selling?"</strong></p>
        <p>Most people in your position say things like: "I help women find their confidence." "I support people through transitions." "I coach around mindset and clarity."</p>
        <p>That is not an offer. That is a description of a feeling.</p>
        <p>No one wakes up and thinks, "I need to buy some confidence today."</p>
        <p>They wake up thinking: "I've been trying to get my first client for six months and I still don't have one and I don't understand what I'm doing wrong."</p>
        <p><strong>That is a problem. And problems get paid for. Feelings don't.</strong></p>
        <p>So today, we build your first real offer statement. Not a polished program. Not a brand. Just a clear sentence that names a real person, a real problem, and a real result.</p>
        ${taskBox("My Offer Clarity", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook. Write: <strong>"Day 2: My Offer Clarity."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Complete this sentence:</p>
          <p style="margin:12px 0;color:#0a0a0a;font-style:italic;background:#fff;padding:12px 16px;border-radius:6px;">"I help [specific person] who [specific problem they feel right now] to [specific result] in [timeframe]."</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Rules:</strong></p>
          <p style="margin:4px 0;color:#3d3d3d;">Specific person = not "women." A type of woman. Her age, her background, her situation.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Specific problem = not "lack confidence." What does that actually look like in her day? What does she stress about?</p>
          <p style="margin:4px 0;color:#3d3d3d;">Specific result = not "feel empowered." What tangible thing changes? What does she have or do differently?</p>
          <p style="margin:4px 0;color:#3d3d3d;">Timeframe = give it one. 30 days. 90 days. 6 weeks. It creates urgency.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Write yours. Read it out loud. If it sounds vague, it is. Rewrite it until it's sharp. Then write down 5 names — real people you know — who either have this problem or know people who do.</p>
        `)}
        <p><strong>Win condition:</strong> One specific offer sentence written in your notebook. Five names on the next line.</p>
        <p>Reply with: <strong>"Day 2 — Done."</strong></p>
        <p>If you want me to look at your offer statement and tell you exactly what's sharp and what needs to change, book a strategy call. That's exactly what we do in the first 15 minutes.</p>
        ${ctaButton("Book a Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. "I'm still figuring out my niche" is not a reason to skip today. Pick something specific and test it. You can always adjust. You can't adjust nothing.</p>
      `)
    },
    3: {
      subject: "Day 3 — the message that starts everything",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Day 1 you decided who you're becoming. Day 2 you named what you're selling. Day 3 you start talking to real people.</p>
        <p>I already know what you're feeling right now.</p>
        <p>"What if they think I'm trying to sell them something?" "What if they don't respond?" "What if I sound desperate?"</p>
        <p>Let me be direct with you.</p>
        <p><strong>Those thoughts are not protecting you. They are keeping you at zero.</strong></p>
        <p>You cannot get clients by thinking about getting clients. You cannot build a business in your head. The business begins when the first message gets sent.</p>
        <p>And here's the important part: today you are not selling anything. You are asking one question. That's it.</p>
        ${taskBox("The Message That Starts Everything", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Take the 5 names you wrote yesterday. Send each of them this message — adapted to your voice, not copied word for word:</p>
          <p style="margin:12px 0;color:#0a0a0a;font-style:italic;background:#fff;padding:12px 16px;border-radius:6px;">"Hey [Name], quick question — do you know anyone who [describe the problem your offer solves]? I'm putting together something to help [type of person] with [problem], and I'm trying to connect with a few people it might be right for. If anyone comes to mind, I'd really appreciate an intro — no pressure at all."</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Send it. Via WhatsApp, DM, text, email — whatever feels natural for that person. Then close the app and move on to the next one. Do not sit and wait. Do not refresh. Do not spiral.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">If someone responds with interest, reply with: "Would you be open to a quick 15-minute chat? I'm still refining how I help with this and it'd be useful to hear more about where you're at."</p>
        `)}
        <p><strong>Win condition:</strong> 5 messages sent. Not drafted. Not planned. Sent.</p>
        <p>Reply with: <strong>"Day 3 — Done. I sent [number] messages."</strong></p>
        <p>If conversations feel terrifying and you'd rather skip straight to working with someone who can remove the fear entirely and show you exactly what to say — book a strategy call with me.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The discomfort you feel before sending the first message? That's not a stop sign. That's the feeling of growing. Send it anyway.</p>
      `)
    },
    4: {
      subject: "Day 4 — what to do when someone responds",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Some of you got responses yesterday. Some of you got nothing. Both are fine.</p>
        <p>If you got responses: today's email tells you exactly what to do next.</p>
        <p>If you got nothing: send 5 more messages today with clearer targeting. Are you messaging people who actually know your ideal client? If you help women over 40 with corporate backgrounds and you're messaging your 25-year-old gym friends — adjust.</p>
        <p><strong>For those who got responses:</strong></p>
        <p>When someone says "I might know someone" or "actually I might be interested myself" — most beginners either immediately pitch their offer or freeze and don't reply at all.</p>
        <p>Both are wrong. The right move is simple. Book a 15-minute call. Nothing more.</p>
        <p>Reply with: "That's great to hear. Would you be open to a quick 15-minute chat? I want to understand a bit more about where you're at before I suggest anything. What does your schedule look like this week?"</p>
        <p>No pitch. No price. No description of your offer. Just a call.</p>
        ${taskBox("What To Do When Someone Responds", `
          <p style="margin:8px 0 0;color:#3d3d3d;">If you have interested responses — follow up and book the call. Do it now.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">If you have no responses yet — send 5 more messages. Better targeting this time. Think: who is one person away from my ideal client?</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Also do this regardless: write in your notebook the answers to these two questions.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Question 1:</strong> What is the one result someone would get from working with me for 30 days? Not a list. One specific result. The most important one.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Question 2:</strong> What would I charge for that result if I was confident in my value? Write the number. Don't negotiate with yourself. Just write what feels honest.</p>
        `)}
        <p><strong>Win condition:</strong> Responses followed up on. Five more messages sent if you had none. Two questions answered in your notebook.</p>
        <p>Reply with: <strong>"Day 4 — Done."</strong></p>
        <p>When you get that first call booked, you'll want to be prepared. Book a strategy call with me before that happens and I'll show you exactly how to run it so it converts.</p>
        ${ctaButton("Book a Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. One "yes" from five messages is a good result. Three non-responses and two maybes is also a good result. None of them mean you're failing.</p>
      `)
    },
    5: {
      subject: "Day 5 — how to turn a 15-minute conversation into a paying client",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>By now you either have a call scheduled, have people showing interest, or you've been sending messages and building momentum. Wherever you are — today's lesson is the most important one of the week.</p>
        <p>Because this is where the money is made or lost.</p>
        <p><strong>Most coaches lose the sale before the call even starts.</strong> Not because their offer is wrong. Because they walk into the conversation thinking their job is to convince someone.</p>
        <p>It's not.</p>
        <p>Your job on a sales call is to diagnose. Like a doctor.</p>
        <p>A doctor doesn't walk in and say "Please let me help you, I'm really good at medicine." They ask questions. They listen. They diagnose. Then — if they can help — they prescribe. That's what you're doing.</p>
        ${taskBox("5 Questions for Every Call", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write these 5 questions in your notebook. Memorise them. Use them on every call.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> "Tell me where you're at right now with [the problem]."</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> "How long has this been going on?"</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> "What have you already tried?"</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>4.</strong> "What would change for you if this was solved in the next 90 days?"</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>5.</strong> "What's stopping you from making that happen right now?"</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">After those five questions, you will know: whether you can help, what to offer, and how to frame the investment. Then say: "Based on what you've told me, I think I can help. Here's what working together would look like..." Outcome first, process second. Name the price. Then stop talking. Silence after the price is normal. Do not fill it.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Practice saying your price out loud right now. Five times. Not in your head — out loud.</p>
        `)}
        <p><strong>Win condition:</strong> 5 questions written in notebook. Price said out loud 5 times. If you have a call this week — you're ready.</p>
        <p>Reply with: <strong>"Day 5 — Done."</strong></p>
        <p>If you'd rather go through the exact framework with me first in a strategy session — book here.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The women who close their first client fast are not the ones who have the most polished offer. They're the ones who had the most real conversations. Volume beats perfection every time at this stage.</p>
      `)
    },
    6: {
      subject: "Day 6 — Jeanne had zero clients for 11 months. Then one conversation changed everything.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>I want to tell you about Jeanne.</p>
        <p>Jeanne spent 14 years in HR. She'd helped hundreds of people navigate career transitions, difficult managers, redundancy, and burnout. She was genuinely brilliant at it.</p>
        <p>When she decided to start coaching, she spent 11 months doing everything except talking to clients. She built a website. She took a coaching certification. She designed her logo three times. She wrote a freebie that she never launched.</p>
        <p>When we sat down together, I asked her one question: "What specific problem do you solve, for whom, and what's your offer?"</p>
        <p>She couldn't answer it clearly.</p>
        <p>We spent 40 minutes getting that answer right. Three weeks later she signed her first client at £1,800.</p>
        <p>She emailed me and said: "I can't believe I spent 11 months avoiding the one thing that actually worked."</p>
        <p>You are not Jeanne. But if you're reading this on Day 6 and you still haven't sent 5 messages, you're making the same mistake she made.</p>
        <p>The website doesn't matter yet. The logo doesn't matter yet. The freebie doesn't matter yet.</p>
        <p><strong>The conversation matters. The offer matters. The client matters.</strong></p>
        ${taskBox("Honest Audit", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook and answer:</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> How many messages have I sent this week?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> Do I have at least one call scheduled or one person showing interest?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> What have I been doing instead of outreach this week?</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">If the answer to question 3 is "building things" — that's the pattern that keeps you broke. Building feels productive. Outreach feels uncomfortable. But only one of them generates income.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">If you're on track — send 5 more messages today and confirm any calls that are pending. If you're behind — today is your reset. Send 10 messages. Now.</p>
        `)}
        <p><strong>Win condition:</strong> Honest audit written. Minimum 5 messages sent today.</p>
        <p>Reply with: <strong>"Day 6 — Done. I've sent [total] messages this week."</strong></p>
        <p>Jeanne's turning point was one clear conversation with someone who could see exactly what she needed. I do that in a free 60-minute strategy call. Ten spots a month.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. If you've been following along all week and doing the work — you are already ahead of 80% of people who started something this month. Don't stop now.</p>
      `)
    },
    7: {
      subject: "Day 7 — what happens now",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Seven days.</p>
        <p>You've done the identity work. You have an offer statement. You've sent messages. You know the diagnostic framework.</p>
        <p>That is more than most people build in three months of "figuring it out."</p>
        <p>Now here's what I need you to understand about where you are.</p>
        <p>You are at the point where most beginners plateau. Not because the strategy stops working. Because the discomfort gets familiar and it's tempting to back off and go back to planning mode.</p>
        <p>Don't.</p>
        <p>The next 30 days are the most important ones in your business. Because momentum is real. The conversations you start now lead to clients this month. The conversations you delay push income further away.</p>
        <p><strong>Here's your focus for the next 30 days:</strong></p>
        <p>Send 5 connection messages every single day. Not five a week. Five a day.</p>
        <p>Have at least 2 diagnostic calls every week.</p>
        <p>Make at least one offer per week — to anyone who gets on a call with you and fits your offer.</p>
        <p>Three numbers. Five messages, two calls, one offer. Every week. If you do those three things consistently for 30 days, getting your first client is a matter of when, not if.</p>
        ${taskBox("My 30-Day Commitment", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"My 30-Day Commitment."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write out the three numbers — 5 messages per day, 2 calls per week, 1 offer per week — and sign your name at the bottom.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Then send 5 messages today.</p>
        `)}
        <p><strong>Win condition:</strong> Commitment written. Five messages sent.</p>
        <p>One final thing. I work with a small number of women every month at a deeper level — inside the 10K Roadmap Accelerator. We map out your entire business, build your offer, sharpen your messaging, and I personally coach you through every call until you're consistently closing.</p>
        <p>If you've done the work this week and you're serious about making this income real — book a strategy call. Let's see if we're a fit.</p>
        <p>Here's what that call includes: your expertise identified, your first offer built, your 90-day roadmap created, your biggest block removed, your exact next three steps. In 60 minutes. Free.</p>
        ${ctaButton("Book Your Free 60-Minute Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The version of you who reads this, nods, and does nothing is the version that emails me in six months saying "I haven't started yet." Don't be that version. Book the call or send the five messages. Do one of them right now.</p>
      `)
    },
  },

  // ─────────────────────────────────────────────────
  // PATHFINDER — launched, inconsistent income
  // ─────────────────────────────────────────────────
  PATHFINDER: {
    0: makeDay0('PATHFINDER'),
    1: {
      subject: "Day 1 — the real reason your income is inconsistent (it's structural, not personal)",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>You've started. You've made some money. Maybe a few clients, maybe some sporadic sales.</p>
        <p>And yet every month feels like starting over.</p>
        <p>Some months it flows. Other months there's nothing. You don't know which version you're going to get. And that uncertainty is exhausting.</p>
        <p>Here's what most people in your position tell themselves: "I need to be more consistent with content." Or "I need a better funnel." Or "I need to niche down more."</p>
        <p>Maybe. But probably not.</p>
        <p><strong>The real reason your income is inconsistent is that your pipeline is empty between clients.</strong></p>
        <p>You close someone, you focus on delivering. You finish delivering, you look up and there's no one in the pipeline. So you scramble back to outreach. You close someone. Repeat.</p>
        <p>That feast-and-famine cycle is not a content problem. It's not a niche problem. It's a pipeline problem. And a pipeline problem has a simple fix: you never stop outreach, even when you're fully booked.</p>
        ${taskBox("My Pipeline Audit", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook. Write: <strong>"Day 1: My Pipeline Audit."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Answer these four questions honestly:</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> How many clients do I currently have paying me?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> How many people am I in active conversation with right now who could become clients in the next 30 days?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> When did I last proactively reach out to someone new about my offer?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>4.</strong> What do I do between clients — do I keep outreach going or do I pause it?</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Write honest answers. Then write: "My pipeline will never be empty again because I will reach out to [number] new people every single day, regardless of how full my calendar is."</p>
        `)}
        <p><strong>Win condition:</strong> Pipeline audit written. Outreach commitment written.</p>
        <p>Reply with: <strong>"Day 1 — Done."</strong></p>
        <p>If your inconsistency runs deeper than pipeline and you're not sure what's actually broken, book a strategy call. I'll diagnose the real bottleneck in the first 15 minutes.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Inconsistent income is not a reflection of your worth. It's a reflection of your system. Systems can be fixed. Start today.</p>
      `)
    },
    2: {
      subject: "Day 2 — your offer is probably doing too much",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Yesterday you looked at your pipeline. Today we look at your offer.</p>
        <p>Here's a pattern I see constantly with women in your position.</p>
        <p>They started with something simple. "I'll coach people through [problem] for [price]." And it worked — a few clients said yes.</p>
        <p>Then they started adding. More sessions. Bonus calls. An email support thread. A workbook. A private community. A second offer. A lower-tier option.</p>
        <p>And now their offer does everything and converts nobody.</p>
        <p><strong>When your offer tries to solve everything, it's clear on nothing.</strong></p>
        <p>A confused prospect doesn't buy. They say "let me think about it" and disappear.</p>
        <p>The best offers are specific about three things: who, problem, result. Everything else is noise.</p>
        ${taskBox("Offer Simplification", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write out your current offer exactly as you'd describe it on a sales call. Everything. All the inclusions, all the sessions, all the extras.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Then answer: <strong>What is the single most important result my client gets?</strong> Circle it. That is the only thing your offer needs to lead with.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Now rewrite your offer description in three sentences:</p>
          <p style="margin:4px 0;color:#3d3d3d;">Sentence 1: Who it's for and what problem it solves.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Sentence 2: What they get and the result it creates.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Sentence 3: The timeframe and investment.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Read it out loud. Does it sound like a clear solution to a specific problem? Or does it sound like a list? If it sounds like a list, cut it down until it sounds like a solution.</p>
        `)}
        <p><strong>Win condition:</strong> Offer rewritten in three clean sentences.</p>
        <p>Reply with: <strong>"Day 2 — Done."</strong></p>
        <p>If you want my eyes on your offer and direct feedback on what's converting and what's confusing — that's what the strategy call is for.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Simpler offers close faster. Every feature you add increases the cognitive load for your prospect. Strip it back.</p>
      `)
    },
    3: {
      subject: "Day 3 — why your follow-up is killing your conversions",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Let me ask you something uncomfortable.</p>
        <p>Think about the last three people who got on a call with you and didn't buy. What happened after the call?</p>
        <p>Did you follow up with them?</p>
        <p>If yes — how? When? What did you say?</p>
        <p>Most women in your position either don't follow up at all (because it feels pushy) or follow up with something like "just checking in to see if you've made a decision" — which adds zero value and gets no response.</p>
        <p><strong>Follow-up is not chasing. Follow-up is service.</strong></p>
        <p>When someone gets off a call with you and doesn't buy, they're not saying no to you. They're usually stuck in one of three places: they don't understand the full value, they have an objection they didn't say out loud, or the timing is slightly off.</p>
        <p>The right follow-up addresses one of those three things. It's not a reminder that you exist. It's a piece of value that moves them forward.</p>
        ${taskBox("My Follow-Up System", `
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Step 1:</strong> List the last three people who didn't convert from a call. Name, date of call, what they said.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Step 2:</strong> For each one, write what you think their real objection was. Not what they said — what they meant.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Step 3:</strong> Write one follow-up message for each of them. Not "just checking in." Something that directly addresses their real objection with a specific, helpful response.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Step 4:</strong> Send all three today.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">This is not a pitch. This is: "I've been thinking about what you shared on our call. I wanted to send you [specific resource / answer / reframe] that might help with [their specific concern]." Then end with "If you're still open to continuing the conversation, I'm here."</p>
        `)}
        <p><strong>Win condition:</strong> Three past non-converts identified. Three follow-up messages written and sent.</p>
        <p>Reply with: <strong>"Day 3 — Done."</strong></p>
        <p>Some of those three people will respond. The ones who don't needed more time — and now they remember you gave value without pressure. If you want help crafting the exact language that converts hesitant prospects — book a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. One of those three follow-ups will probably convert this week. The money is already in your pipeline. You just need to go get it.</p>
      `)
    },
    4: {
      subject: "Day 4 — the pricing conversation you keep avoiding",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Today we talk about money. Specifically, why you're probably still undercharging.</p>
        <p>I know you've thought about raising your prices. I know you've read the posts that say "charge your worth." And I know there's a part of you that has found a hundred reasons why now isn't the right time.</p>
        <p>Let me show you what undercharging actually costs you.</p>
        <p>If you charge £500 for a program that delivers a £5,000 result, you need 20 clients to make £10K. That means 20 onboarding calls, 20 delivery journeys, 20 sets of client needs. You will burn out before you get to 10.</p>
        <p>If you charge £2,000 for the same program, you need 5 clients. Five conversations. Five transformations. That's a business you can actually sustain.</p>
        <p><strong>The math alone demands that you charge more. The mission demands it too.</strong> When you charge too little, you attract clients who don't take the work seriously. Because they didn't invest seriously.</p>
        ${taskBox("My Real Price", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 4: My Real Price."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> What is the total result a client gets from working with me? Write it out completely.</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> If I was fully confident in my value, what would I charge?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> What is the story I keep telling myself about why I can't charge that?</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Write the story in full. Then write: "That story is a lie. I am charging [new price] starting from this week." Then update your offer with the new price. Not next month. This week.</p>
        `)}
        <p><strong>Win condition:</strong> New price decided and written. Old story identified and challenged.</p>
        <p>Reply with: <strong>"Day 4 — Done. My new price is [X]."</strong></p>
        <p>If the pricing conversation is where you consistently lose your nerve — that's fixable in one session. Book a strategy call and we'll work through exactly what to say and how to say it.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The first call where you state the new price will feel uncomfortable. Do it anyway. Discomfort at the price is temporary. Undercharging is permanent until you change it.</p>
      `)
    },
    5: {
      subject: "Day 5 — how to stop starting from zero every month",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>You've been launching at people. Posting, pitching, closing — then closing the next client from scratch.</p>
        <p>What you don't have yet is a system that keeps warm leads coming in even when you're not actively pushing.</p>
        <p>There are two things that create consistent lead flow without constant hustle: content that speaks to your ideal client's exact problem, and a reason for people to raise their hand and start a conversation.</p>
        <p>Content is not about posting every day. It's about posting the right thing. One post that describes your ideal client's problem so specifically that she reads it and thinks "this is me" is worth more than 30 motivational carousels.</p>
        <p>And a call-to-action that invites a real conversation converts better than any link to a sales page.</p>
        ${taskBox("My Content and Conversation System", `
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Part 1:</strong> Write one post for today. Use this structure:</p>
          <p style="margin:4px 0;color:#3d3d3d;">Line 1: Name the problem your ideal client is living right now. Be specific.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Lines 2–4: Describe what that problem feels like. Show you understand it better than she does.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Lines 5–7: One insight that reframes it.</p>
          <p style="margin:4px 0;color:#3d3d3d;">Final line: "If this is you, DM me the word [WORD] and I'll send you something that helps."</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Post it today. Don't wait until it's perfect.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;"><strong>Part 2:</strong> When someone DMs you that word — reply with: "Thanks for reaching out. Tell me a bit more about where you're at with [problem] — I want to make sure what I send is actually useful for your situation." That reply starts a real conversation. From there you diagnose, and if they're a fit, you offer the call.</p>
        `)}
        <p><strong>Win condition:</strong> One post written and published. Reply script written for DM responses.</p>
        <p>Reply with: <strong>"Day 5 — Done."</strong></p>
        <p>The fastest version of this system is having a quiz that warms leads automatically and sends them to a booking page — like the one you came through. If you want to understand how to replicate that for your business, that's a great conversation for a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. One post using this structure will get you more DMs than a month of generic content. The specificity is what makes it work.</p>
      `)
    },
    6: {
      subject: "Day 6 — Jennifer went from sporadic to £4,000 every single month",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>I want to tell you about Jennifer.</p>
        <p>Jennifer was an educator. 12 years in schools, then tutoring, then she started coaching parents on how to support their children through exam stress. She was good. She had clients. But every month felt like rolling the dice.</p>
        <p>When we worked together, I asked her to show me her pipeline. She had no pipeline. She had her calendar.</p>
        <p>She was only ever thinking about the clients she had, not the clients she needed next.</p>
        <p>We fixed two things. Her offer got sharper — one specific result, one specific person, one clear price. And she started doing outreach every single day, not just when she was quiet.</p>
        <p>Three months later she had consistent revenue of £4,000 a month. Not because she worked harder. Because she stopped stopping.</p>
        <p>That's the whole lesson.</p>
        <p><strong>Consistent income comes from consistent activity. Not bursts of effort when you're desperate.</strong></p>
        ${taskBox("My Weekly Non-Negotiables", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 6: My Weekly Non-Negotiables."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Commit to three numbers you will hit every single week from this point forward. Minimum numbers, not targets.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Example:</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Minimum 5 new outreach messages sent per day</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Minimum 2 diagnostic calls per week</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Minimum 1 offer made per week</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write your three numbers. Then write: "These are not goals. These are the floor." Then do your outreach today. Send 5 messages. Now.</p>
        `)}
        <p><strong>Win condition:</strong> Three weekly non-negotiables written. Five messages sent today.</p>
        <p>Reply with: <strong>"Day 6 — Done. My three numbers are [X], [Y], [Z]."</strong></p>
        <p>Jennifer's shift happened in one clear strategy session where we diagnosed exactly what was broken and fixed it. That's what the free call is for.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Consistency is not motivation. It's a system. Build the system, and the motivation follows the results.</p>
      `)
    },
    7: {
      subject: "Day 7 — you're not starting. you're scaling. here's the difference.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Seven days.</p>
        <p>You came into this sequence with inconsistent income and a business that felt like it was always starting over.</p>
        <p>This week you audited your pipeline, sharpened your offer, fixed your follow-up, set a real price, built a content system, and committed to weekly non-negotiables.</p>
        <p>That's not beginner work. That's operator work.</p>
        <p>Here's where you are now: you have the building blocks of a consistent business. What you need next is repetition and refinement, not more new strategies.</p>
        <p>The next level from here is not learning more. It's executing what you already know at a higher volume with more precision — and having someone in your corner who can spot what's still leaking before it costs you another month.</p>
        <p>That's what the 10K Roadmap Accelerator is. Not a course. Not a program you go through alone. Twelve months of live coaching, direct access, and a proven framework that moves you from inconsistent to predictably scalable.</p>
        <p>Before you decide whether that's right for you — book the free strategy call. Sixty minutes. I'll show you exactly where your biggest leak is and what to do about it. No pressure, no pitch until we know it's the right fit.</p>
        ${ctaButton("Book Your Free 60-Minute Strategy Call", CAL_LINK)}
        <p>Send five outreach messages today. And book the call if you're serious about turning this week's work into permanent change.</p>
        <p><strong>Win condition:</strong> Five messages sent. Call booked or consciously decided against.</p>
        <p>Reply with: <strong>"Day 7 — Done."</strong></p>
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The difference between where you are and where you want to be is not a new idea. It's the consistent execution of the right actions with the right support. That's it.</p>
      `)
    },
  },

  // ─────────────────────────────────────────────────
  // BUILDER — consistent clients, hitting ceiling
  // ─────────────────────────────────────────────────
  BUILDER: {
    0: makeDay0('BUILDER'),
    1: {
      subject: "Day 1 — why you've hit a ceiling (and why working harder won't break it)",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>You've done what most people can't do. You built something. You have clients. You have revenue. You have proof that this works.</p>
        <p>And yet you're stuck at the same number, month after month.</p>
        <p>You've probably tried the obvious things. More content. More outreach. A new offer. Maybe a course or group program to scale.</p>
        <p>And the ceiling is still there.</p>
        <p>Here's what's actually happening.</p>
        <p><strong>You have a capacity problem disguised as a revenue problem.</strong></p>
        <p>You're at the limit of what you can personally deliver. And because your entire business runs through you — your time, your energy, your personal delivery — there's nowhere to grow without breaking yourself.</p>
        <p>The solution is not working harder. It's restructuring. Specifically: your offer architecture needs to change so that your highest-value work takes less of your time, and the volume work happens at a level that doesn't require you directly.</p>
        ${taskBox("My Revenue Ceiling Audit", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook. Write: <strong>"Day 1: My Revenue Ceiling Audit."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Answer these four questions:</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> What is my current average monthly revenue?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> How many hours per week am I currently working to generate that revenue?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> If I wanted to double revenue without adding hours — what would have to change structurally?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>4.</strong> What am I doing in my business right now that I am the only person who could do it? What am I doing that someone else could do?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write honest answers. This is your baseline.</p>
        `)}
        <p><strong>Win condition:</strong> Four questions answered in full. Revenue ceiling clearly identified.</p>
        <p>Reply with: <strong>"Day 1 — Done."</strong></p>
        <p>The ceiling break usually requires one structural decision, not ten tactical changes. If you want to find that decision faster, book a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The ceiling is not evidence that you've reached your limit. It's evidence that your current model has reached its limit. Different problem. Solvable problem.</p>
      `)
    },
    2: {
      subject: "Day 2 — your offer architecture is wrong. here's what it should look like.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Yesterday you saw the ceiling clearly. Today we look at what's causing it structurally.</p>
        <p>Most coaches who are stuck at a revenue plateau have one of three offer architecture problems:</p>
        <p><strong>Problem 1: One-to-one only.</strong> Every client requires your direct time. There's a hard ceiling because there are only so many hours in a week.</p>
        <p><strong>Problem 2: Too many low-ticket offers.</strong> Lots of activity, lots of clients, not enough revenue per client. You're working at high volume for medium returns.</p>
        <p><strong>Problem 3: No ascension path.</strong> Clients finish your program and have nowhere to go. You lose them, and you start recruiting again from scratch.</p>
        <p>The right architecture has three levels: a high-ticket one-to-one offer that anchors your brand and generates premium revenue, a group or community offer that creates scalable delivery and recurring income, and a lower-ticket product or resource that creates entry points and cashflow.</p>
        <p>You don't need all three today. But you need to know where you are in the build.</p>
        ${taskBox("My Offer Architecture", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 2: My Offer Architecture."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Draw three boxes: <strong>High Ticket / Group / Entry Level.</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">In each box, write what you currently have, what you're missing, and what the revenue potential is if you had all three.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Then answer: Which one missing piece would have the biggest immediate impact on revenue if you added it in the next 30 days? That is your next build priority.</p>
        `)}
        <p><strong>Win condition:</strong> Offer architecture mapped. One priority identified.</p>
        <p>Reply with: <strong>"Day 2 — Done. My priority is [X]."</strong></p>
        <p>If the architecture decision is unclear — that's the exact conversation we have in a strategy call. I've mapped this for dozens of coaches. Book it.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. You don't need to rebuild everything. You need to add one piece in the right place. That one piece changes the math entirely.</p>
      `)
    },
    3: {
      subject: "Day 3 — the lever that doubles revenue without doubling clients",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>There are only three ways to grow revenue: more clients, higher prices, or more purchases per client.</p>
        <p>Most coaches focus obsessively on the first one. And it's the hardest, most expensive, most exhausting path.</p>
        <p><strong>The fastest lever is the second one: higher prices.</strong></p>
        <p>If you currently have 6 clients at £1,000 each, you're making £6,000 a month. To get to £10,000 with the same price, you need 10 clients. That's 4 more people to find, onboard, and serve.</p>
        <p>If you raise your price to £2,000, you need 5 clients for £10,000. That's one fewer client than you have now — and £4,000 more revenue.</p>
        <p><strong>You don't need more clients. You need better pricing.</strong></p>
        <p>And the only thing stopping you from raising your price today is a story you're telling yourself about what people will pay.</p>
        ${taskBox("My Pricing Reality", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 3: My Pricing Reality."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> What do I currently charge for my core offer?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> What results do my best clients get? Write three specific outcomes with numbers or timeframes if possible.</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> If I charged 50% more starting tomorrow — what would actually happen? Write the honest answer.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Most coaches discover that the honest answer is "my current clients would probably accept it and I might lose one or two new prospects." That is not a business-ending outcome. That is a pricing adjustment. Write your new price. Commit to testing it on the next three sales conversations.</p>
        `)}
        <p><strong>Win condition:</strong> Current results documented. New price decided. Committed to testing it.</p>
        <p>Reply with: <strong>"Day 3 — Done. Testing price of [X] starting this week."</strong></p>
        <p>If pricing conversations are where you consistently back down — that's a pattern we fix directly in the strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Your price tells your prospect how seriously to take your offer. Raise it.</p>
      `)
    },
    4: {
      subject: "Day 4 — the system that keeps your pipeline full while you sleep",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>At your stage, the problem isn't getting clients. You've proven you can do that.</p>
        <p>The problem is the cost. It costs too much time and energy to keep the pipeline full manually.</p>
        <p>What you need now is a lead generation system that works without you being present for every step.</p>
        <p>This is not about ads. This is not about complicated funnels. It is about one asset that does the qualifying work before the prospect ever talks to you.</p>
        <p>That asset can be a quiz, a specific piece of content that consistently attracts your ideal client, a PDF guide, or a workshop. The format doesn't matter. The function does: it must pre-qualify the prospect, demonstrate your expertise, and direct them toward a call.</p>
        <p>The quiz you came through is an example of exactly this.</p>
        ${taskBox("My Lead Generation Asset", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 4: My Lead Generation Asset."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> What is the one lead magnet, piece of content, or tool I have (or could build in a week) that would attract my ideal client and start a conversation?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> If 10 people a week came through that asset — what percentage would likely book a call?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> What would I need to do to get that asset in front of 50 new people this week?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write the answers, then identify one specific action you can take today to either build that asset or put it in front of more people.</p>
        `)}
        <p><strong>Win condition:</strong> Lead gen asset identified or built. One distribution action taken today.</p>
        <p>Reply with: <strong>"Day 4 — Done."</strong></p>
        <p>If you want to understand exactly how the quiz funnel works and how to replicate the mechanics for your specific audience — that's a great conversation for a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Manual outreach got you here. Systems will take you to the next level. Start building the system now while outreach is still working.</p>
      `)
    },
    5: {
      subject: "Day 5 — the one hire that changes everything",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>By now you've identified your ceiling, mapped your offer architecture, set a new price, and started thinking about your lead system.</p>
        <p>The next question most builders avoid because it feels premature: who else needs to be involved?</p>
        <p>Here's the truth. At the level you're at, you are both the CEO and the delivery engine. That works until it doesn't. And it stops working right around where you are now.</p>
        <p>The first hire for most coaches in your position is not a VA. It's not a tech person. It's someone who can handle one specific part of your delivery or operations — the part that takes your time but doesn't require your expertise.</p>
        <p>Maybe that's client onboarding. Maybe it's content repurposing. Maybe it's admin and scheduling.</p>
        <p><strong>Freeing 5 hours a week of your time at this stage is worth more than any new strategy.</strong></p>
        ${taskBox("My Time Audit", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 5: My Time Audit."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Track or estimate how you spend your working hours in a typical week. Break it into:</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Client delivery (irreplaceable — only you)</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Sales and outreach (high value — keep doing this)</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Admin, scheduling, logistics (replaceable)</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Content creation (partially replaceable)</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Everything else</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Total up the hours in the third and fourth categories. That is your delegation opportunity. Even if it's 3 hours a week, that's 12 hours a month. What's the one thing you could hand off this month?</p>
        `)}
        <p><strong>Win condition:</strong> Time audit written. One delegation opportunity identified.</p>
        <p>Reply with: <strong>"Day 5 — Done. I could delegate [X]."</strong></p>
        <p>If the overwhelm of running everything yourself is part of what's keeping your ceiling in place — that's something we address directly in the strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. You don't need to hire a full-time employee. You need one person, a few hours a week, for the right task. Start there.</p>
      `)
    },
    6: {
      subject: "Day 6 — Milesa went from £5K months to £12K months in 90 days",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Milesa was a recruiter with 16 years of experience. She'd built a coaching business helping people get into senior corporate roles. Solid. Consistent. Stuck.</p>
        <p>She was doing £5K a month and had been for about eight months. Every time she tried to push past it, she ran out of time before she ran out of clients.</p>
        <p>When we sat down, the diagnosis was fast. She had a pricing problem and a delivery problem. Her price was too low for the transformation she was creating, and her delivery was so customised that she couldn't take on more than four clients at a time.</p>
        <p>We raised her price by 70%. We restructured her delivery to include a group component that handled the education, leaving the one-to-one sessions for the highest-leverage moments.</p>
        <p>Three months later she hit £12,000 in a single month. Same clients. Same expertise. Different architecture.</p>
        <p>The ceiling was never about her. It was always about the structure.</p>
        ${taskBox("My One Decision", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Look back at what you've built this week: the ceiling audit, the offer architecture, the pricing decision, the lead gen asset, the time audit.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 6: My One Decision."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">What is the single structural change — one thing — that if you implemented it in the next 30 days would have the biggest impact on your revenue? Not a list. One decision.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write it. Then write the first action to make it real.</p>
        `)}
        <p><strong>Win condition:</strong> One structural decision made. First action written.</p>
        <p>Reply with: <strong>"Day 6 — Done. My one decision is [X]."</strong></p>
        <p>Milesa's shift started in one strategy session. That's what the free call is for.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The ceiling break usually feels like a small decision, not a big one. Pick yours and execute it.</p>
      `)
    },
    7: {
      subject: "Day 7 — you're not building a business. you're building a machine.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Seven days.</p>
        <p>You've audited your ceiling, restructured your thinking around your offer, challenged your pricing, identified your lead system, found your delegation opportunity, and made one structural decision.</p>
        <p>That is genuine CEO-level work. Not tactics. Structure.</p>
        <p>Here's where you are: you have everything you need to break your current ceiling. The question is whether you'll execute alone or with support.</p>
        <p>Going alone is slower. Not because the strategy is wrong, but because you'll hit moments of doubt, resistance, and confusion — and without someone who has seen this pattern dozens of times, those moments turn into months.</p>
        <p>Going with support compresses the timeline. Dramatically.</p>
        <p>The 10K Roadmap Accelerator is built for exactly where you are. Twelve months. Live coaching. A framework that has taken women from stuck at £4K–£6K months to consistently hitting £10K–£15K. Not by working harder. By building smarter.</p>
        <p>Before you decide if it's right for you — book the free strategy call. I will show you exactly where your ceiling is and what breaks it. No pressure, no pitch unless we both agree it makes sense.</p>
        ${ctaButton("Book Your Free 60-Minute Strategy Call", CAL_LINK)}
        <p>Execute the first action on the structural decision you made yesterday. One concrete step. Today.</p>
        <p><strong>Win condition:</strong> One action taken on the structural decision. Call booked.</p>
        <p>Reply with: <strong>"Day 7 — Done."</strong></p>
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The machine doesn't build itself. But once it's built, it runs without you breaking yourself to keep it going. That's the goal. Let's build it.</p>
      `)
    },
  },

  // ─────────────────────────────────────────────────
  // LUMINARY — established, wants to expand
  // ─────────────────────────────────────────────────
  LUMINARY: {
    0: makeDay0('LUMINARY'),
    1: {
      subject: "Day 1 — you've already proven it. now let's make it untouchable.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>You're not starting. You're not struggling. You've built something real.</p>
        <p>But there's a level above where you are, and you know it. A level where your income is not just consistent but genuinely significant. Where your brand has authority, not just recognition. Where you're not just running a coaching business — you're running a platform.</p>
        <p>Most coaches at your stage plateau not because they lack skill or clients, but because they've optimised a model that was designed for a smaller scale. The strategies that got you here — personal outreach, one-to-one delivery, organic content — are not the strategies that take you to the next level.</p>
        <p>To get there, you need to shift from operator to architect.</p>
        ${taskBox("My Architect Audit", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Open your notebook. Write: <strong>"Day 1: My Architect Audit."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Answer these five questions:</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> What does my business look like right now if I step back completely for 30 days?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>2.</strong> What percentage of my revenue depends on my direct, personal involvement in delivery?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>3.</strong> What is my current highest-converting offer and what makes it work?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>4.</strong> What would I need to be true to double my revenue in 12 months?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>5.</strong> What am I still doing personally that a well-built system could do?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write honestly. This is the gap analysis between where you are and where you're going.</p>
        `)}
        <p><strong>Win condition:</strong> Five questions answered. Gap identified clearly.</p>
        <p>Reply with: <strong>"Day 1 — Done."</strong></p>
        <p>If the path from here to the next level feels unclear — that's the conversation for a strategy call. Not about basics. About architecture.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. The shift from operator to architect is the most important transition in a coaching business. Most people avoid it because it requires letting go of control. The ones who make it are the ones who become genuinely untouchable.</p>
      `)
    },
    2: {
      subject: "Day 2 — your brand needs to do more of the selling",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>At your stage, the bottleneck is not leads. It's not even conversion. It's authority.</p>
        <p>When your brand has deep authority, leads come to you pre-sold. They don't need convincing. They need confirming. The call is a formality, not a sales event.</p>
        <p>That level of authority comes from one thing: being known as the definitive voice on a specific, valuable problem.</p>
        <p>Not a generalist. Not "a coach." The person people think of when they think of your specific transformation.</p>
        <p>Most established coaches have broad credibility. "She's good at what she does." That's not authority. Authority is: "She is the person to talk to about [specific thing]."</p>
        ${taskBox("My Authority Statement", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 2: My Authority Statement."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>1.</strong> When someone in my ideal client's network says "I know someone who needs help with [my area]" — am I the first name that comes to mind? Why or why not?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>2.</strong> What is the one thing I know more about, have more experience in, or see more clearly than anyone else in my market?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>3.</strong> If I had to write one piece of content that demonstrated that authority so clearly that people read it and immediately thought "I need to talk to her" — what would it be about?</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Write that piece of content today. Not a caption. A proper piece. 500 words minimum. Post it on the platform where your ideal clients are.</p>
        `)}
        <p><strong>Win condition:</strong> Authority statement written. One deep content piece published.</p>
        <p>Reply with: <strong>"Day 2 — Done."</strong></p>
        <p>If the content isn't landing with the weight you want — that's a positioning question, not a writing question. Book a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. One genuinely authoritative piece of content does more for your brand than 30 inspirational posts. Depth beats frequency at this level.</p>
      `)
    },
    3: {
      subject: "Day 3 — the premium offer you're probably not charging enough for",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>At your stage, there should be at least one offer in your business that feels almost uncomfortable to charge for. Not because it's wrong — because it's genuinely premium and you're still working up to owning that.</p>
        <p>The market for high-ticket coaching — £5,000 to £25,000 per client — is real. It's not for everyone. But for a woman with your level of experience and a track record of results, it is absolutely accessible.</p>
        <p>The question is whether you have an offer designed for that market.</p>
        <p>Most established coaches don't. They have good offers at good prices. But they don't have a flagship, premium, invitation-only, result-guaranteed offer that signals to a senior, experienced, financially capable client: "This is for you."</p>
        ${taskBox("My Flagship Offer", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 3: My Flagship Offer."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Design your premium offer from scratch using these parameters:</p>
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Client:</strong> Who is your highest-value client? Not your most common client. Your most valuable. What does she look like, what does she earn, what does she need?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>Result:</strong> What is the most significant transformation you can create for this person? Think bigger than what you currently promise.</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>Delivery:</strong> What does the delivery look like at this level? What combination of access, accountability, and expertise justifies the premium?</p>
          <p style="margin:4px 0;color:#3d3d3d;"><strong>Price:</strong> What is the price that reflects the full value of this result? Do not anchor to what you currently charge. Anchor to the value of the result.</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write the full offer. Then write one name — one person in your network who might be exactly this client.</p>
        `)}
        <p><strong>Win condition:</strong> Flagship premium offer designed in full. One name written.</p>
        <p>Reply with: <strong>"Day 3 — Done. My flagship price is [X]."</strong></p>
        <p>If you want direct input on whether your flagship offer is positioned correctly for premium buyers — book a strategy call.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Premium clients do not respond to the same messaging as entry-level clients. The offer, the language, and the positioning all change. Design for who you want to attract.</p>
      `)
    },
    4: {
      subject: "Day 4 — why the coaches beneath you are starting to catch up",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>Something uncomfortable.</p>
        <p>The coaching market has changed. Three years ago, having experience and a track record was enough to stand out. Today, hundreds of coaches are building funnels, creating content, running ads, and positioning themselves with increasing sophistication.</p>
        <p>The gap between you and a well-positioned beginner is closing — not because they're better than you, but because they're investing in visibility and systems while established coaches often coast on reputation.</p>
        <p>This is not a threat. It's information.</p>
        <p>The coaches who remain at the top over the next five years are not the ones who worked the hardest. They're the ones who built systems that compound: a brand that grows without constant effort, an audience that deepens not just widens, and a business architecture that generates revenue at multiple levels simultaneously.</p>
        ${taskBox("My Compounding Assets", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 4: My Compounding Assets."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">List every asset in your business that generates value without requiring your direct time input:</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Content pieces that still get found and shared</p>
          <p style="margin:4px 0;color:#3d3d3d;">— A lead magnet or quiz that qualifies leads</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Testimonials and case studies</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Digital products or recorded programs</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Email sequences that nurture automatically</p>
          <p style="margin:12px 0 0;color:#3d3d3d;">Now identify what's missing. What compounding asset, if built in the next 90 days, would be generating leads or revenue 12 months from now with zero ongoing effort? Write it. Then write the first step to building it.</p>
        `)}
        <p><strong>Win condition:</strong> Compounding assets listed. One gap identified. First step written.</p>
        <p>Reply with: <strong>"Day 4 — Done. My missing asset is [X]."</strong></p>
        <p>If you want to build a lead generation system that compounds — the quiz funnel you came through is one model. Book a strategy call to talk through how to build your version.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Reputation is not a moat. Systems are. Build the systems.</p>
      `)
    },
    5: {
      subject: "Day 5 — how to get clients who refer other clients",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>At your level, the most efficient form of lead generation is not content, not ads, not outreach.</p>
        <p>It's transformation so good that clients can't stop talking about it.</p>
        <p>Most coaches think referrals are about asking. They're not. They're about delivering results so clear and specific that clients naturally tell their network.</p>
        <p>"She helped me get to £10K a month" gets shared. "She helped me feel more confident" doesn't.</p>
        <p>The specificity of your client's result determines whether they refer you or just think fondly of you.</p>
        ${taskBox("My Referral Engine", `
          <p style="margin:8px 0 0;color:#3d3d3d;"><strong>Part 1:</strong> List your last five clients. For each one, write the specific result they got. Not what they said they wanted when they started. What actually happened. Numbers, timeframes, before and after.</p>
          <p style="margin:12px 0 0;color:#3d3d3d;"><strong>Part 2:</strong> For each of those five clients, write: "Did I ask them directly if they knew anyone who needed the same result?" If not — reach out to them today. Not a pitch. A genuine question: "Working with you was one of my favourite client experiences. Do you know anyone else in your network who's trying to achieve [specific result]? I'd love an introduction."</p>
          <p style="margin:12px 0 0;color:#3d3d3d;"><strong>Part 3:</strong> For your next intake, decide how you will capture client results in specific, shareable terms — not feelings, but facts.</p>
        `)}
        <p><strong>Win condition:</strong> Five client results documented. At least two past clients messaged today asking for referrals.</p>
        <p>Reply with: <strong>"Day 5 — Done."</strong></p>
        <p>The best referral conversation is the strategy call — because the client you send there will come back having experienced the same clarity you did. Book your own call so you know exactly what you're sending them to.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. You have five people right now who think highly of you and probably haven't referred anyone because you've never asked. Ask today.</p>
      `)
    },
    6: {
      subject: "Day 6 — Laurie turned her expertise into a seven-figure platform",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Good morning.</p>
        <p>I want to tell you about Laurie.</p>
        <p>Laurie had been coaching for years. She was good. She had clients. She had revenue. And she had hit the invisible ceiling that every established coach eventually hits.</p>
        <p>The shift for Laurie wasn't a new tactic. It was a new model.</p>
        <p>She stopped thinking about her business as "I coach clients." She started thinking about it as "I run a platform for women who want [specific transformation]." The platform had multiple entry points: a flagship high-ticket offer, a group program, a digital course, and a membership.</p>
        <p>Each level fed the next. Entry clients became group clients. Group clients became high-ticket clients. High-ticket clients became advocates and referral sources.</p>
        <p>The revenue didn't double because she worked harder. It doubled because the architecture changed.</p>
        ${taskBox("My Platform Vision", `
          <p style="margin:8px 0 0;color:#3d3d3d;">Write in your notebook: <strong>"Day 6: My Platform Vision."</strong></p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write a description of your business 24 months from now. Not realistic. Ambitious. Answer:</p>
          <p style="margin:4px 0;color:#3d3d3d;">— What is your flagship offer and what does it cost?</p>
          <p style="margin:4px 0;color:#3d3d3d;">— What other income streams exist in the business?</p>
          <p style="margin:4px 0;color:#3d3d3d;">— Who else is on your team?</p>
          <p style="margin:4px 0;color:#3d3d3d;">— What does your content reach look like?</p>
          <p style="margin:4px 0;color:#3d3d3d;">— What is your monthly revenue?</p>
          <p style="margin:8px 0 0;color:#3d3d3d;">Write it as if it's already happened. Present tense. Then identify one thing you could do this week that moves toward that vision.</p>
        `)}
        <p><strong>Win condition:</strong> Platform vision written. One action identified for this week.</p>
        <p>Reply with: <strong>"Day 6 — Done."</strong></p>
        <p>The path from where you are to where you've just described isn't as long as it feels. It usually takes one clear strategy session to map the route. Book yours.</p>
        ${ctaButton("Book Your Free Strategy Call", CAL_LINK)}
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. Vision without execution is just a daydream. But execution without vision is just activity. You need both. You have the vision. Now execute.</p>
      `)
    },
    7: {
      subject: "Day 7 — this is not the end of the sequence. it's the beginning of the real work.",
      html: (name, _videoUrl) => buildEmail(name, `
        <p>Seven days.</p>
        <p>You came into this sequence as someone who has already built something significant. You're leaving it with a clearer picture of the architecture that takes you from "established" to "genuinely untouchable."</p>
        <p>This week you audited your model, built your authority statement, designed your flagship offer, identified your compounding assets, activated your referral engine, and wrote your platform vision.</p>
        <p>That is not small work. That is the roadmap.</p>
        <p>Here's the honest truth about where you are now.</p>
        <p>Everything you mapped this week can be executed alone. Slowly. With trial and error. Making the mistakes that cost you 6–12 months of time and energy at every turn.</p>
        <p>Or you can work with someone who has watched women at exactly your stage make this transition, who can shortcut the learning curve, and who can hold you to the standard your vision requires.</p>
        <p>That's what the 10K Roadmap Accelerator does for women at your level. Not basics. Not beginner frameworks. A sophisticated, personalised approach to building the next chapter of your business — with direct access, live coaching, and a proven architecture.</p>
        <p>Before you decide if it's right — book the free strategy call. 60 minutes. I'll show you exactly which piece of the architecture to build first for maximum impact.</p>
        ${ctaButton("Book Your Free 60-Minute Strategy Call", CAL_LINK)}
        <p>Take the platform vision you wrote yesterday and share it with one person — your partner, a close friend, a trusted colleague — out loud. Saying it to someone makes it real. Then book the call if you're serious about making it happen.</p>
        <p><strong>Win condition:</strong> Vision shared out loud. Call booked.</p>
        <p>Reply with: <strong>"Day 7 — Done."</strong></p>
        <p style="color:#888;font-size:13px;margin-top:24px;">P.S. You did not build what you've built by waiting for perfect conditions. You're not going to build the next chapter by waiting either. Book the call.</p>
      `)
    },
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, day, sequence, video_slug } = body

    if (!email || !name || day === undefined || !sequence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const videoUrl = `https://quiz.the5th.consulting/video/${video_slug || 'v1'}`
    const emailData = sequences[sequence as string]?.[day as number]

    if (!emailData) {
      return NextResponse.json({ error: `No email for day ${day} sequence ${sequence}` }, { status: 404 })
    }

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: emailData.subject,
      html: emailData.html(name, videoUrl),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, email_id: data?.id, day, sequence })
  } catch (err) {
    console.error('Sequence email error:', err)
    return NextResponse.json({ error: 'Failed to send sequence email' }, { status: 500 })
  }
}
