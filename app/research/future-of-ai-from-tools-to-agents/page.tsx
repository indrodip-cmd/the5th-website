import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigAIWaves, FigToolsToAgents, FigAgentLoop, FigInterfaceCollapse } from '../figures'

const post = getPost('future-of-ai-from-tools-to-agents')!

export const metadata: Metadata = {
  title: `${post.title} | The5th Research`,
  description: post.excerpt,
  alternates: { canonical: `/research/${post.slug}` },
  openGraph: {
    type: 'article',
    url: `https://the5th.consulting/research/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    publishedTime: post.date,
    authors: [post.author],
    tags: post.tags,
  },
  twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
}

const ARTICLE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  datePublished: post.date,
  dateModified: post.date,
  author: { '@type': 'Person', name: post.author, jobTitle: post.authorRole },
  publisher: { '@type': 'Organization', name: 'The5th Consulting' },
  mainEntityOfPage: `https://the5th.consulting/research/${post.slug}`,
  keywords: post.tags.join(', '),
  articleSection: 'Research',
}

const TOC: [string, string][] = [
  ['start', 'Why I stopped trusting the headlines'],
  ['waves', '1. How we got here, in four waves'],
  ['shift', '2. The one shift that matters: answering to acting'],
  ['agent', '3. What an agent actually is'],
  ['interface', '4. The interface quietly disappears'],
  ['memory', '5. The AI that remembers you'],
  ['world', '6. Learning the physical world'],
  ['work', '7. What a working day starts to feel like'],
  ['limits', '8. What I think will NOT happen'],
  ['close', '9. How to stand in it'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I have read a lot of confident predictions about the future of AI, and most of them are either trying to scare me or
      sell me something. So I wanted to write the version I actually wish someone had handed me: no hype, no doom, no
      jargon I do not explain, just my honest working map of where this is going over the next decade or so. If you have
      no technical background at all, good. This is written for you first, and I think you will be able to follow every
      step.
    </>
  )
  const objective = (
    <>
      I set out to build myself one clear, jargon-free picture of where AI is genuinely heading over the next ten years,
      and to be honest about the line between what I believe and what nobody can yet know. My test for every idea here was
      simple: could I explain it to someone with no background and have them nod?
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>Why I stopped trusting the headlines</h2>
        <p style={rp.p}>
          Here is a small habit I picked up. Whenever I read that AI will “change everything by next year,” I mentally
          swap it for a quieter question: what is the <em>direction</em>, and is it already visible in small ways today?
          The year in the headline is almost always wrong. The direction almost never is. So this whole piece is about
          direction, not dates, and I will try hard to only point at things I can already see the early edges of, rather
          than science fiction I am hoping for.
        </p>
        <p style={rp.p}>
          One more promise, the same one I make in everything I write here. No word gets used without a plain translation
          right beside it. If I fail that test even once, I have written a worse essay than I meant to.
        </p>

        {/* 1 */}
        <h2 id="waves" style={rp.h2}>1. How we got here, in four waves</h2>
        <p style={rp.p}>
          The clearest way I have found to hold the whole history in my head is as a set of waves, each one stacking on the
          last rather than replacing it. First, machines learned to <strong style={rp.strong}>perceive</strong>: to
          recognise a face in a photo, a word in speech. Then they learned <strong style={rp.strong}>language</strong>: to
          read and write fluently, which is the wave that produced the chatbots everyone suddenly met. We are now inside a
          third wave, <strong style={rp.strong}>reasoning and action</strong>, where systems do not just talk but plan and
          carry things out. And the next one forming is <strong style={rp.strong}>world models and bodies</strong>:
          machines with a working sense of how physical reality behaves, increasingly wired into robots.
        </p>
        <FigAIWaves />
        <p style={rp.p}>
          I find the stacking point genuinely important, because it is where a lot of the fear comes from and also where a
          lot of it is misplaced. Each wave keeps everything the earlier ones learned. A system today can see, and read,
          and now, haltingly, act, all at once. That compounding is why progress feels faster than any single breakthrough
          would suggest. It is not one miracle. It is layers, and the layers multiply.
        </p>

        {/* 2 */}
        <h2 id="shift" style={rp.h2}>2. The one shift that matters: answering to acting</h2>
        <p style={rp.p}>
          If you remember one idea from this, make it this one. The whole near future of AI is the shift from software that
          <em> answers</em> to software that <em>acts</em>. For seventy years, a computer waited for you to tell it exactly
          what to do, step by step. Even the chatbot, as clever as it feels, mostly just answers the thing in front of it
          and then waits again. What is changing is that we are handing these systems a <em>goal</em> instead of a step,
          and letting them work out the steps themselves.
        </p>
        <FigToolsToAgents />
        <p style={rp.p}>
          You can feel the ladder in that picture in your own life already. A calculator is a <strong style={rp.strong}>tool</strong>:
          it does one fixed thing when you press the buttons. A chatbot is an <strong style={rp.strong}>assistant</strong>:
          it answers what you ask, then stops. An <strong style={rp.strong}>agent</strong> is the new rung: you say “sort
          out my travel for the Delhi trip,” and it checks your calendar, compares options, books, and comes back only when
          it needs a decision. And the rung after that is <strong style={rp.strong}>teams of agents</strong> that split a
          big job between them, one drafting, one checking, one talking to another company’s agent. I want to be careful
          here, because today’s agents are still clumsy and make real mistakes. But the direction is not subtle, and it is
          not slowing.
        </p>

        {/* 3 */}
        <h2 id="agent" style={rp.h2}>3. What an agent actually is</h2>
        <p style={rp.p}>
          “Agent” is one of those words that sounds mystical and is not, so let me take the mystery out of it. An agent is
          a loop. It takes a goal and makes a rough plan. It <em>acts</em> in the world through tools, which just means it
          can do things like search the web, send an email, run some code, or call another program. It then
          <em> observes</em> what happened, updates its plan, and goes round again, until the goal is met or it gets stuck
          and asks you. Wrapped around the loop is a <em>memory</em>, so it does not forget what it learned two steps ago.
        </p>
        <FigAgentLoop />
        <p style={rp.p}>
          That is the whole thing. Perceive, plan, act, observe, remember, repeat. I sometimes call it, half-joking, a
          thermostat with imagination, because a thermostat also runs a loop: sense the temperature, act on the heater,
          observe, repeat. The agent just has a vastly richer sense of the world and a keyboard to the entire internet.
          When you strip the branding away, the future everyone is nervous or excited about is mostly this small loop,
          getting more reliable, and being trusted with bigger goals.
        </p>

        {/* 4 */}
        <h2 id="interface" style={rp.h2}>4. The interface quietly disappears</h2>
        <p style={rp.p}>
          Here is the change I think ordinary people will feel first, before any of the dramatic stuff. Right now, using a
          computer means <em>you</em> operating a dozen separate apps: the email, the spreadsheet, the calendar, the CRM,
          the ad dashboard. You are the glue between them. You learned each one, you click through each one, you carry
          information from one to the next in your own head. That is a strange amount of work we have all just accepted.
        </p>
        <FigInterfaceCollapse />
        <p style={rp.p}>
          As agents get good enough, that flips. You stop operating the apps and start stating what you want, and the agent
          operates them for you. “Win back the customers who left last quarter.” “Get this contract signed by everyone.”
          The twelve apps do not vanish, they slide behind a single line of intent. I genuinely think the app-by-app,
          click-by-click way we work today will look, in ten years, the way using a command line looks to most people now:
          powerful, still there underneath, but not how normal humans get things done. The interface does not get better.
          It mostly disappears.
        </p>

        {/* 5 */}
        <h2 id="memory" style={rp.h2}>5. The AI that remembers you</h2>
        <p style={rp.p}>
          Almost everything you have used so far forgets you the moment the chat ends. That is about to stop, and it is a
          bigger deal than it sounds. When an assistant carries a durable memory of your goals, your projects, your
          preferences, your history, it stops being a clever stranger you re-explain yourself to every morning, and starts
          being something closer to a colleague who actually knows the account. The jump in usefulness from that alone is
          large, larger, I suspect, than the next jump in raw intelligence.
        </p>
        <p style={rp.p}>
          I am honestly a little torn about this one, and I will not pretend otherwise. The same memory that makes an AI
          genuinely helpful also means it holds a detailed, persistent model of you, and that is worth being uneasy about.
          Who owns that memory? Can you read it, edit it, delete it, take it with you? I do not think those questions are
          solved, and I notice the companies building the memory are not rushing to answer them. So: useful, yes,
          probably transformative. Also the part of the future I would watch most carefully as a normal person, not as a
          technologist.
        </p>

        {/* 6 */}
        <h2 id="world" style={rp.h2}>6. Learning the physical world</h2>
        <p style={rp.p}>
          The next wave, the one still forming, is the one I find hardest to predict and most likely to surprise us. Today’s
          systems learned the world almost entirely from text and images. They know that a dropped glass shatters because
          they read it a million times, not because they have any felt sense of glass, or floors, or gravity. A
          <strong style={rp.strong}> world model</strong> is the attempt to give a machine that felt sense: an internal
          simulation of how physical reality behaves, so it can predict what happens next and plan actions in it.
        </p>
        <p style={rp.p}>
          This is the bridge to robotics, and it is why the robot demos are suddenly getting less embarrassing. For decades
          we hit something called Moravec’s paradox: the things that are hard for humans, like chess, turned out easy for
          machines, and the things any toddler can do, like picking up a soft toy without crushing it, turned out
          brutally hard. Language fell first because it lives in text, which we had oceans of. The physical world is
          harder because you cannot download it, you have to gather it. My honest guess is that this wave moves slower than
          the language one did, runs into far messier problems, and still ends up reshaping whole industries, warehouses,
          driving, elder care, farming, over the back half of the decade. But of everything here, this is the part I hold
          most loosely.
        </p>

        {/* 7 */}
        <h2 id="work" style={rp.h2}>7. What a working day starts to feel like</h2>
        <p style={rp.p}>
          Let me try to make all this concrete, because “paradigm shift” means nothing until you can picture a Tuesday.
          Picture yours a few years out. You do not open ten apps. You open one place, and you talk to something that
          already knows your week. You describe outcomes, not tasks: what you want to be true by Friday. A small crew of
          agents goes off and does the grinding middle of the work, the drafting, the chasing, the formatting, the
          first pass at the analysis, and brings you decisions, not to-do lists. Your job shifts, hard, toward the two
          things the machines are still bad at: deciding what is actually worth doing, and taking responsibility for the
          result.
        </p>
        <p style={rp.p}>
          I want to be even-handed about how that feels, because it is not all warm. For a lot of people it will be
          liberating, the boring middle of the job finally handed off. For others it will be unsettling, because the boring
          middle <em>was</em> the job, and the part that is left, judgment and accountability, is harder, more exposed, and
          not what they signed up for. Both of those are going to be true at once, for different people, sometimes for the
          same person on different days. I do not think anyone gets to skip that discomfort, myself included.
        </p>

        {/* 8 */}
        <h2 id="limits" style={rp.h2}>8. What I think will NOT happen</h2>
        <p style={rp.p}>
          A forecast is only worth anything if it also says what it does <em>not</em> expect, so here are my bets against
          the crowd. I do not think most jobs vanish in a clean sweep. I think tasks get automated, work gets reshuffled,
          and the disruption is real but uneven and slower than the scary charts. I do not think the interface flips
          overnight, trust builds slowly, and people rightly refuse to hand an agent their bank login until it has earned
          it. And I do not think a single company builds one all-knowing AI that runs the world. The messier, likelier
          future is many models, many agents, arguing and negotiating and checking each other, more like an economy than a
          brain.
        </p>
        <p style={rp.p}>
          I could be wrong on any of these, and on the timeline almost certainly am, in one direction or the other. The
          reason I write the “will not happen” list at all is that it keeps me honest. It is easy to be swept along by the
          most dramatic version of any story. The most dramatic version is usually the least accurate.
        </p>

        <Divider />

        {/* 9 */}
        <h2 id="close" style={rp.h2}>9. How to stand in it</h2>
        <p style={rp.p}>
          So what do you actually do with all this, if you are not building the models yourself? My own answer, the one I
          keep coming back to, is almost boringly practical. Stop thinking of AI as a smarter search box and start
          thinking of it as something you <em>delegate</em> to, because the whole future is about handing over goals, and
          the people who get good at delegating clearly, checking carefully, and keeping responsibility will do
          extraordinarily well. Get comfortable being the one who decides and answers for the outcome, because that is the
          part staying human longest. And stay a little suspicious, in a healthy way, of anyone, including me, who sounds
          too sure.
        </p>
        <p style={rp.p}>
          I started researching the future of AI half-expecting to end up either terrified or evangelical, because those
          are the two moods on offer. I landed somewhere quieter and, I think, truer. This is a genuinely enormous shift,
          the biggest I expect to live through, and it is also going to arrive as a long series of ordinary Tuesdays that
          each feel only slightly different from the last, until you look up and the whole landscape has moved. My job, the
          reason I keep writing these, is to keep looking up on purpose, and to describe what I see in words a normal
          person can use. That is the whole plan. I think it is enough.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          What is mine and what is borrowed: the map, the four waves framing, and the bets are my own working view, and the
          timeline especially is a guess I hold loosely. The underlying ideas, the economics of cheap prediction, task-level
          automation, world models, and the older observation about what is easy and hard for machines, come from the
          sources below, which I have tried to represent fairly.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Agrawal, A., Gans, J., &amp; Goldfarb, A. (2022). <em>Power and Prediction: The Disruptive Economics of Artificial Intelligence.</em> Harvard Business Review Press.</p>
          <p style={refStyle}>Brynjolfsson, E., &amp; McAfee, A. (2014). <em>The Second Machine Age.</em> W. W. Norton.</p>
          <p style={refStyle}>Eloundou, T., Manning, S., Mishkin, P., &amp; Rock, D. (2023). GPTs are GPTs: An early look at the labor market impact potential of large language models. <em>arXiv:2303.10130.</em></p>
          <p style={refStyle}>LeCun, Y. (2022). A path towards autonomous machine intelligence (position paper on world models). <em>OpenReview.</em></p>
          <p style={refStyle}>Moravec, H. (1988). <em>Mind Children: The Future of Robot and Human Intelligence.</em> Harvard University Press.</p>
          <p style={refStyle}>Morris, M. R., et al. (2023). Levels of AGI for operationalizing progress on the path to AGI. <em>arXiv:2311.02462.</em></p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
