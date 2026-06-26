const HEADER = (title: string) => `
<div style="background:linear-gradient(135deg,#2d6a4f,#1a4a35);padding:36px 40px;text-align:center;border-radius:0">
  <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Indrodip | The5th</div>
  <div style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#fff;line-height:1.3">${title}</div>
</div>`

const FOOTER = `
<div style="padding:24px 40px;border-top:1px solid #e8e8e0;text-align:center;background:#f9f9f6">
  <p style="font-size:12px;color:#aaa;margin:0">Indrodip | The5th Consulting · noreply@10kroadmap.org</p>
  <p style="font-size:11px;color:#ccc;margin-top:6px"><a href="#" style="color:#ccc">Unsubscribe</a></p>
</div>`

const BODY_WRAP = (content: string) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f6;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,.08)">
${content}
</div></body></html>`

const CTA_BTN = (text: string, href = 'https://the5thconsulting.typeform.com/to/u9maum7Y') => `
<div style="text-align:center;margin:28px 0">
  <a href="${href}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#2d6a4f,#1a4a35);color:#fff;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none;letter-spacing:.04em">${text}</a>
</div>`

export function otpEmail(firstName: string, otpCode: string, days: { day: number; title: string; tasks: string[] }[]) {
  const preview = days.slice(0, 3).map(d => `
    <div style="border-left:3px solid #2d6a4f;padding:10px 16px;margin-bottom:10px;background:#f6faf7;border-radius:0 8px 8px 0">
      <div style="font-size:12px;color:#2d6a4f;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Day ${d.day}</div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a;margin-top:2px">${d.title}</div>
    </div>`).join('')
  return BODY_WRAP(`
${HEADER('Your 6-digit code is here')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:24px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:28px">Your personalized 15-day roadmap is ready. Enter the code below to unlock it:</p>
  <div style="background:#f6faf7;border:2px solid #2d6a4f;border-radius:16px;padding:28px;text-align:center;margin-bottom:32px">
    <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#2d6a4f;margin-bottom:12px">Your Access Code</div>
    <div style="font-size:48px;font-weight:900;color:#1a1a1a;letter-spacing:12px;font-family:monospace">${otpCode}</div>
    <div style="font-size:12px;color:#aaa;margin-top:10px">Expires in 15 minutes</div>
  </div>
  ${days.length > 0 ? `<p style="font-size:14px;font-weight:700;color:#333;margin-bottom:14px">A preview of your first 3 days:</p>${preview}` : ''}
</div>
${FOOTER}`)
}

export function email1(firstName: string, summary: string, days: { day: number; title: string; tasks: string[] }[]) {
  const preview = days.slice(0, 3).map(d => `
    <div style="border-left:3px solid #2d6a4f;padding:10px 16px;margin-bottom:10px;background:#f6faf7;border-radius:0 8px 8px 0">
      <div style="font-size:12px;color:#2d6a4f;font-weight:700">Day ${d.day}: ${d.title}</div>
      <div style="font-size:13px;color:#666;margin-top:4px">${d.tasks[0] || ''}</div>
    </div>`).join('')
  return BODY_WRAP(`
${HEADER('🗺️ Your Personal 15-Day Roadmap is inside')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:24px">${summary}</p>
  <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:14px">Your first 3 days:</p>
  ${preview}
  ${CTA_BTN('Open My Dashboard →', 'https://10kroadmap.org')}
  <p style="font-size:13px;color:#888;line-height:1.7;margin-top:24px">Over the next 7 days, I'll be sending you one personalized coaching email per day — built entirely from your quiz answers. Real homework. Zero templates.</p>
  <p style="font-size:14px;color:#2d6a4f;font-weight:600;margin-top:16px">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email2(firstName: string) {
  return BODY_WRAP(`
${HEADER('The offer mistake that keeps experts broke')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">The #1 reason coaches don't hit $5K/month isn't visibility. It's not sales skills either.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">It's <strong style="color:#2d6a4f">an offer that doesn't pass the 3-second test.</strong></p>
  <div style="background:#f6faf7;border-radius:12px;padding:24px;margin-bottom:24px">
    <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:12px">The 3-Second Test: Can your ideal client complete this sentence in 3 seconds?</p>
    <div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;font-size:15px;color:#888;font-style:italic">
      "I help ________ achieve ________ in ________ days/weeks — even if ________."
    </div>
    <p style="font-size:13px;color:#666;margin-top:12px">Fill this in for your offer right now. If it takes more than 3 seconds, that's your bottleneck.</p>
  </div>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:24px">Vague offers create vague income. Specific offers create specific clients who pay specific prices.</p>
  ${CTA_BTN('Book a Free Strategy Call →')}
  <p style="font-size:14px;color:#2d6a4f;font-weight:600">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email3(firstName: string) {
  return BODY_WRAP(`
${HEADER('Where your next 3 clients are hiding right now')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Your next 3 clients are not strangers. They're in your phone right now.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Here's the exercise: Open your contacts. Write down 5 people who could benefit from your work — or who know someone who could.</p>
  <div style="background:#f6faf7;border-radius:12px;padding:24px;margin-bottom:24px">
    <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:12px">The warm outreach DM (copy this exactly):</p>
    <div style="background:#fff;border-left:3px solid #2d6a4f;padding:16px;font-size:14px;color:#444;line-height:1.8;border-radius:0 8px 8px 0">
      "Hey [Name], I've been thinking about you. I'm working with [type of person] on [outcome]. Do you know anyone who might be dealing with this? Even just a conversation would be helpful — I'm trying to understand the problem better."
    </div>
    <p style="font-size:12px;color:#888;margin-top:10px">Notice: You're not selling. You're asking for help. That's why this works.</p>
  </div>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:24px">Send 3 of these today. That's the whole homework assignment.</p>
  ${CTA_BTN('Book a Free Strategy Call →')}
  <p style="font-size:14px;color:#2d6a4f;font-weight:600">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email4(firstName: string) {
  return BODY_WRAP(`
${HEADER('What to say when they say "tell me more"')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Someone responds to your DM. They say "tell me more." Your heart races. You don't know what to say.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Here's the framework: <strong style="color:#2d6a4f">Diagnose → Prescribe → Close</strong></p>
  <div style="background:#f6faf7;border-radius:12px;padding:24px;margin-bottom:24px">
    <div style="margin-bottom:14px"><strong style="color:#2d6a4f">Diagnose:</strong> <span style="color:#555">"Before I share anything, can I ask — what's the main challenge you're dealing with right now?"</span></div>
    <div style="margin-bottom:14px"><strong style="color:#2d6a4f">Prescribe:</strong> <span style="color:#555">"Based on what you've told me, it sounds like [restate their problem]. The way I help with this is [your solution]."</span></div>
    <div><strong style="color:#2d6a4f">Close:</strong> <span style="color:#555">"Would it make sense to get on a quick call to see if I can help? I have 20 minutes Thursday at 2pm or Friday at 11am."</span></div>
  </div>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:24px">The close isn't pushy. It's a simple, specific offer. Two options. One decision.</p>
  ${CTA_BTN('Book a Free Strategy Call →')}
  <p style="font-size:14px;color:#2d6a4f;font-weight:600">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email5(firstName: string) {
  return BODY_WRAP(`
${HEADER("You're closer than you think")}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">You're halfway through your 15-day roadmap. This is where most people start to drift.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Not because the goal is wrong. But because consistency feels invisible — you can't see the compound interest yet.</p>
  <div style="background:#f6faf7;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
    <div style="font-size:13px;color:#2d6a4f;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">Remember why you started</div>
    <div style="font-size:15px;color:#333;line-height:1.8">$5,000/month is 3–5 clients paying $1,000–$1,500 each.<br>That's 3–5 people whose lives you change this month.<br>You have everything you need.</div>
  </div>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:24px">If you want to accelerate this — if you want to do 30 days of work in 10 — that's exactly what the 10K Roadmap Accelerator is designed for.</p>
  ${CTA_BTN('Book a Free Strategy Call →')}
  <p style="font-size:14px;color:#2d6a4f;font-weight:600">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email6(firstName: string) {
  return BODY_WRAP(`
${HEADER('The pricing conversation that changes everything')}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">You mention your price. There's silence. Your stomach drops. You start to justify.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Stop.</p>
  <div style="background:#f6faf7;border-radius:12px;padding:24px;margin-bottom:24px">
    <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:12px">The silence technique:</p>
    <p style="font-size:14px;color:#555;line-height:1.8">State your price. Then say nothing. Literally nothing. Count to 10 in your head if you have to.</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin-top:8px">The first person who speaks loses. And it's usually the coach who fills the silence by dropping their price.</p>
  </div>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Your price is not a number. It's a statement of belief in your own value. Practice saying it out loud right now.</p>
  ${CTA_BTN('Book a Free Strategy Call →')}
  <p style="font-size:14px;color:#2d6a4f;font-weight:600">— Indrodip</p>
</div>
${FOOTER}`)
}

export function email7(firstName: string) {
  return BODY_WRAP(`
${HEADER("Your 15 days are almost up — here's what's next")}
<div style="padding:32px 40px">
  <p style="font-size:16px;color:#333;margin-bottom:20px">Hi ${firstName},</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">You've done the 15 days. You have the roadmap. You understand the fundamentals.</p>
  <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:20px">Now comes the question every expert eventually faces: <strong>Do I keep doing this alone, or do I get support?</strong></p>
  <div style="background:linear-gradient(135deg,#2d6a4f,#1a4a35);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px">
    <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:10px">For serious coaches &amp; consultants</div>
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:12px">The 10K Roadmap Accelerator</div>
    <div style="font-size:14px;color:rgba(255,255,255,.75);line-height:1.8;margin-bottom:20px">
      90-day private coaching program. Your offer, your content system, your sales process — built and implemented with me.<br><br>
      Average client result: first $5K month within 60 days.
    </div>
    <a href="https://the5thconsulting.typeform.com/to/u9maum7Y" style="display:inline-block;padding:16px 36px;background:#fff;color:#1a3a2a;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none">Book Your Free Strategy Call →</a>
  </div>
  <p style="font-size:13px;color:#888;line-height:1.7">No pressure. The call is free. The worst that happens is you leave with more clarity than you have now.</p>
  <p style="font-size:14px;color:#2d6a4f;font-weight:600;margin-top:16px">— Indrodip</p>
</div>
${FOOTER}`)
}
