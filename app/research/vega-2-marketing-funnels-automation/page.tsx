import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigFunnelLeak, FigVegaLoop, FigVegaStack, FigVegaVsGeneral } from '../figures'

const post = getPost('vega-2-marketing-funnels-automation')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['summary', 'Summary'],
  ['start', 'What I am building'],
  ['method', 'How I am judging this'],
  ['broken', '1. Why funnels are broken today'],
  ['now', '2. What Vega does now'],
  ['shift', '3. The shift: a funnel that runs itself'],
  ['stack', '4. The four parts of Vega 2.0'],
  ['loop', '5. The loop that fixes the funnel'],
  ['scale', '6. Talking to every lead, one to one'],
  ['better', '7. Why Vega beats any general AI at this'],
  ['agi', '8. Why competent AI is already enough'],
  ['human', '9. What is left for you'],
  ['limits', '10. What Vega 2.0 will not do'],
  ['close', '11. The takeaway'],
  ['notes', 'Related research'],
]

const linkStyle: React.CSSProperties = { color: C.goldDeep, textDecoration: 'none', fontWeight: 600 }

export default function Article() {
  const lead = (
    <>
      This one is not a study. It is a look at what I am building, and why. Vega is our own AI. Vega 1.0 already helps our
      members every day. Vega 2.0 is the version I am most excited about, because it changes what a funnel even is. Today a
      funnel is a thing you set up once and then fight with forever. Vega 2.0 turns it into a thing that runs itself, and
      quietly gets better while you sleep.
    </>
  )
  const objective = (
    <>
      I wanted to lay out, in plain words, what Vega 2.0 is and how it changes marketing and funnels for a coach or
      consultant. This builds on my own research into AI agents, persuasion, and where the technology is heading, so I link
      those pieces at the end.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Summary */}
        <div id="summary" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>Summary</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            A marketing funnel is the tax a coach pays to reach the people they can help. It is manual, leaky, and full of
            guesswork, so most people run a broken one. Vega is our own AI. Vega 2.0 turns the funnel from a thing you set
            up once into a system that runs and fixes itself. It learns your buyer, builds the offer, pages, emails, and
            ads, launches and tests them, and talks to every lead one to one. My central claim, which I defend below, is
            simple: <strong style={{ color: C.plum }}>for this one job, marketing and funnels for a coach or consultant,
            Vega beats any general AI you can buy.</strong> Not because the general models are weak. Because a specialist
            wired into your business beats a brilliant stranger that answers and forgets.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> AI agents · marketing automation · funnels · consumer
            behavior · personalization · self-optimizing systems
          </p>
        </div>

        {/* Start */}
        <h2 id="start" style={rp.h2}>What I am building</h2>
        <p style={rp.p}>
          Let me be upfront. This piece is about our own product, so of course I am biased. I will still try to be honest,
          including about what it cannot do. But I write it here, in the research journal, because Vega 2.0 is really the
          place where all my other research lands. The stuff about AI agents, about persuasion, about where this technology
          is heading, it all points at one thing: the work of marketing is about to be done by a machine that never sleeps.
          Vega is my attempt to build that machine, on purpose, and pointed at good.
        </p>
        <p style={rp.p}>
          I will keep the plain-words promise from everything else I write. No jargon without a simple meaning right next to
          it.
        </p>

        {/* Method */}
        <h2 id="method" style={rp.h2}>How I am judging this</h2>
        <p style={rp.p}>
          This is a vision and build piece, not a lab study, and I will not pretend otherwise. So here is the bar I am
          holding Vega 2.0 to, and the bar you should hold it to. Does it remove real work? Does it find and fix real leaks?
          Does it help the right person say a confident yes, and help the wrong person walk away clean?
        </p>
        <p style={rp.p}>
          Where I make a claim I cannot yet prove with numbers, I say so plainly. And the research underneath this, on AI
          agents, on persuasion, and on where the technology is heading, is linked at the end, so you can check the
          reasoning rather than take my word for it.
        </p>

        {/* 1 */}
        <h2 id="broken" style={rp.h2}>1. Why funnels are broken today</h2>
        <p style={rp.p}>
          First, what is a funnel? It is just the path a stranger takes to become a client. They see you, they show
          interest, they book a call, they buy. At each step, most people fall away. That is normal. But here is the
          painful part.
        </p>
        <FigFunnelLeak />
        <p style={rp.p}>
          People leak out at every step, and you are usually guessing where and why. Was it the ad? The page? The price?
          The email that never got sent? A funnel has dozens of little parts, and any one of them can quietly bleed money.
          To find the leak you have to test, wait, read the data, and fix it. That is slow and it is boring, so most people
          never do it. The leaks just stay.
        </p>
        <p style={rp.p}>
          And it is worse for a coach or consultant, because you did not get into this to run ads and write email
          sequences. You got into it to help people. The funnel is a tax on your real work, and for most people it is a
          leaky one.
        </p>

        {/* 2 */}
        <h2 id="now" style={rp.h2}>2. What Vega does now</h2>
        <p style={rp.p}>
          Vega 1.0, the version running today, is an assistant. It helps. Ask it and it will draft your offer, write your
          emails, plan your content, and make you a real, polished document. It is genuinely useful, and our members lean
          on it daily.
        </p>
        <p style={rp.p}>
          But notice the shape of that. Vega 1.0 <em>answers</em>. You ask, it helps, you take the output and go do the
          work. It is a very good helper standing next to you. It is still you doing the funnel. That is the limit I want to
          break.
        </p>

        {/* 3 */}
        <h2 id="shift" style={rp.h2}>3. The shift: a funnel that runs itself</h2>
        <p style={rp.p}>
          Here is the one idea behind Vega 2.0. It moves from software that <em>answers</em> to software that <em>acts</em>.
          You stop asking it to help with each step. You hand it the goal, and it runs the steps for you.
        </p>
        <p style={rp.p}>
          I wrote a whole piece on this shift, from tools to agents, because it is the biggest change in AI right now. An
          agent is just software that takes a goal, makes a plan, does the work through real tools, looks at what happened,
          and tries again. That is exactly what a good marketer does with a funnel. Which means a funnel is one of the most
          natural jobs in the world to hand to an agent.
        </p>
        <p style={rp.p}>
          So Vega 2.0 is not a better helper. It is a doer. You tell it what you want, more of the right clients, and it
          builds the funnel, launches it, watches it, and fixes it, coming back to you only when it needs a real decision.
        </p>

        {/* 4 */}
        <h2 id="stack" style={rp.h2}>4. The four parts of Vega 2.0</h2>
        <p style={rp.p}>
          Under the hood, Vega 2.0 is four things working together. Each one replaces a job you either do badly, pay a lot
          for, or skip.
        </p>
        <FigVegaStack />
        <p style={rp.p}>
          <strong style={rp.strong}>The Brain</strong> understands your buyer. This is the part I care most about, because
          it is what I have studied for years. Most marketing fails because it does not really know who it is talking to.
          The Brain builds a clear picture of your ideal client, what they want, what they fear, and what would actually
          move them to act.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>The Builder</strong> makes the funnel. The offer, the landing page, the emails, the ads,
          the follow-ups. In minutes, not weeks. Not a rough draft you then rewrite, but a real, on-brand funnel ready to
          go live.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>The Runner</strong> is the new part, and the important one. It launches the funnel, then
          watches it like a hawk. It sees where people leak out, tries a fix, measures whether the fix worked, keeps it if
          it did, and drops it if it did not. All by itself. This is the leak-hunting job that humans hate and skip.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>The Concierge</strong> talks to every lead. Not with one blast email to everyone, but a
          real, one-to-one conversation with each person, shaped to them. I will come back to this one, because it is the
          part that used to be impossible.
        </p>

        {/* 5 */}
        <h2 id="loop" style={rp.h2}>5. The loop that fixes the funnel</h2>
        <p style={rp.p}>
          The heart of Vega 2.0 is a simple loop. Understand your business. Build the funnel. Run it. Learn from what
          happens. Then go around again.
        </p>
        <FigVegaLoop />
        <p style={rp.p}>
          That loop is the whole difference. A normal funnel is built once and then slowly rots. A funnel inside this loop
          gets a little better every day, because every visitor teaches it something. A page that is not converting gets
          rewritten and tested overnight. An email that no one opens gets a new subject line by morning. A price that
          scares people gets flagged for you to look at.
        </p>
        <p style={rp.p}>
          The funnel stops being a thing you set up once. It becomes a thing that is always quietly improving, without you
          having to babysit it. That is what automation should have meant all along. Not a rigid set of if-this-then-that
          rules, but a system that actually thinks about the goal and adjusts.
        </p>

        {/* 6 */}
        <h2 id="scale" style={rp.h2}>6. Talking to every lead, one to one</h2>
        <p style={rp.p}>
          This is the part I find genuinely wild, and it comes straight out of my research on how persuasive AI has become.
        </p>
        <p style={rp.p}>
          For all of history, a coach could only have so many real conversations. There are only so many hours. So most
          leads got a generic email and then silence. The people who needed one more honest answer before they felt safe to
          buy never got it, and they drifted away. That is the biggest, quietest leak of all.
        </p>
        <p style={rp.p}>
          The Concierge closes it. It can hold a real, patient, one-to-one conversation with every single lead, at the same
          time, each one shaped to that person. It answers the actual question that is holding them back. It never gets
          tired, never gets pushy, and, because it is built on our consumer-behavior brain, it knows the difference between
          helping someone decide and pressuring them.
        </p>
        <p style={rp.p}>
          I want to be careful here, because this power cuts both ways, and I said so plainly in my persuasion research. A
          machine that can talk anyone into anything, at scale, is dangerous in the wrong hands. So Vega is built to do the
          honest version. It qualifies people out when they are not a fit. It gives real answers, not fake urgency. The goal
          is to help the right person say a confident yes, and help the wrong person walk away clean. That line matters to
          me, and it is built into the product on purpose.
        </p>

        {/* 7 */}
        <h2 id="better" style={rp.h2}>7. Why Vega beats any general AI at this</h2>
        <p style={rp.p}>
          Here is a claim I will stand behind. For marketing and funnels, for a coach or consultant, Vega beats any general
          AI you can buy. Not because the big general models are weak. They are amazing, and Vega uses them under the hood.
          Vega wins for the same plain reason a specialist beats a generalist at one job.
        </p>
        <p style={rp.p}>
          A general chatbot is a brilliant stranger. It knows a little about everything and nothing about you. Ask it for
          help and it gives you a good answer, then forgets you the moment you close the tab. It cannot see your funnel. It
          cannot act on it. It does not remember your buyer. It has no idea where you are leaking money. It will happily
          write you an email, but it will not send it, watch it, or fix it tomorrow.
        </p>
        <FigVegaVsGeneral />
        <p style={rp.p}>
          Vega is built for one job and wired into your business. It knows your exact buyer, because that is what our
          consumer-behavior brain is for. It does not just answer, it acts. It remembers your business across every
          conversation. It runs the whole build-run-learn loop on its own. It talks to every lead one to one. And it has
          honesty guardrails made for selling help, so it qualifies people out instead of pushing them in.
        </p>
        <p style={rp.p}>
          Yes, in theory you could tell a general model to do all of this. But <em>you</em> would be the one telling it,
          every step, every day, wiring it into every tool by hand, and it would still forget you overnight. That gap,
          between a general tool you must operate and a specialist that runs the job, is the whole point. So I will say it
          plainly: <strong style={rp.strong}>for this job, Vega is the best AI you can put on it, full stop.</strong>
          Outside this job, use the general models. They are extraordinary. Inside it, specialization wins, and it is not
          close.
        </p>

        {/* 8 */}
        <h2 id="agi" style={rp.h2}>8. Why competent AI is already enough</h2>
        <p style={rp.p}>
          You might think all this needs some far-off super-AI. It does not, and this is the key point.
        </p>
        <p style={rp.p}>
          In my piece on AGI, I made the case that you do not need a genius machine to change an industry. You need a
          <em> competent</em> one. Most marketing work is not genius work. It is a skilled person doing a solid job,
          reliably: writing a decent page, spotting an obvious leak, sending the right follow-up. Today’s AI can already do
          that level of work. So the thing that changes marketing is not some future breakthrough. It is competent AI,
          applied carefully, running all the time. That is exactly the window Vega 2.0 is built for.
        </p>
        <p style={rp.p}>
          The trend only points one way from here. Every month these systems get a little more capable, a little cheaper,
          and a little more able to run on their own. A funnel that runs itself is not a someday idea. It is the natural
          result of pointing today’s AI at a job it happens to be very well suited for.
        </p>

        {/* 8 */}
        <h2 id="human" style={rp.h2}>9. What is left for you</h2>
        <p style={rp.p}>
          If a machine builds and runs the funnel, what is left for the human? A lot, and it is the good part.
        </p>
        <p style={rp.p}>
          Vega does the production, the testing, the chasing, the grind. What it cannot do is decide what you stand for,
          who you most want to help, and what a genuinely good offer feels like. It cannot bring your taste, your judgment,
          or your reputation. And it cannot do the actual coaching, the human work you got into this for.
        </p>
        <p style={rp.p}>
          So your job shifts up, not away. You stop being the overworked operator of a leaky funnel and become the person
          who sets the direction and owns the result, while the machine handles the middle. That is a better job than the
          one most coaches have today. Honestly, it is the job most of them wanted in the first place.
        </p>

        {/* 9 */}
        <h2 id="limits" style={rp.h2}>10. What Vega 2.0 will not do</h2>
        <p style={rp.p}>
          Let me be honest about the edges, the way I try to be in all my research. Vega 2.0 will not turn a bad offer into
          a good one. If what you sell does not really help people, a great funnel just helps the wrong thing spread faster,
          and that is not a business I want to build.
        </p>
        <p style={rp.p}>
          It will not remove the human. It works best as a partner, with you steering. It will still make mistakes, so the
          important decisions stay with you, on purpose. And it is not magic or overnight riches. It is a very good system
          that removes the grind and the guesswork, so the real work, helping people, has room to grow. Anyone promising
          more than that is selling you something.
        </p>

        {/* 10 */}
        <h2 id="close" style={rp.h2}>11. The takeaway</h2>
        <p style={rp.p}>
          For a long time, the funnel has been the tax coaches pay to reach the people they can help. It is manual, leaky,
          and full of guesswork, and most people run a broken one because fixing it by hand is too slow.
        </p>
        <p style={rp.p}>
          Vega 2.0 changes the shape of that. It learns your buyer, builds the funnel, runs and fixes it, and talks to every
          lead like a person, all inside one loop that gets better on its own. It is not a smarter helper. It is a doer. And
          it frees you to do the part only you can do.
        </p>
        <p style={rp.p}>
          That is why I am building it, and why it sits here in the research and not just in a product page. Everything I
          have studied, agents, persuasion, where AI is heading, says the same thing. The machine that runs marketing is
          coming. I would rather build the honest version of it, now, and hand it to the people who actually help others for
          a living.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="notes" style={rp.h2}>Related research</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          This piece builds on three earlier essays in this journal. If you want the research underneath the product, start
          with these.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 8px' }}>
          <li style={rp.li}><a href="/research/future-of-ai-from-tools-to-agents" style={linkStyle}>From Tools to Agents</a>, on the shift from AI that answers to AI that acts.</li>
          <li style={rp.li}><a href="/research/how-persuasive-is-frontier-ai" style={linkStyle}>The Persuasion Engine</a>, on how good AI has become at changing minds, and the line I will not cross.</li>
          <li style={rp.li}><a href="/research/agi-society-and-the-end-of-b2b-agencies" style={linkStyle}>The Last Agency</a>, on why competent AI, not some far-off super-AI, is what reshapes marketing.</li>
        </ul>
      </ResearchArticleLayout>
    </>
  )
}
