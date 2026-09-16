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
  ['start', 'Why I ignore the headlines'],
  ['waves', '1. Four waves'],
  ['shift', '2. From answering to doing'],
  ['agent', '3. What an agent really is'],
  ['interface', '4. Apps start to disappear'],
  ['memory', '5. AI that remembers you'],
  ['world', '6. Learning the real world'],
  ['work', '7. What a workday feels like'],
  ['limits', '8. What will NOT happen'],
  ['close', '9. How to stand in it'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I have read a lot of loud predictions about AI. Most of them try to scare me or sell me something. So I wanted to
      write the version I wish someone had handed me. No hype. No doom. No big words I do not explain. Just my honest map
      of where this is going over the next ten years. If you have zero tech background, good. This is for you first.
    </>
  )
  const objective = (
    <>
      I wanted one clear, simple picture of where AI is really heading in the next ten years. And I wanted to be honest
      about what I believe versus what no one can know yet. My test for every idea here: could I explain it to someone
      with no background and have them nod?
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>Why I ignore the headlines</h2>
        <p style={rp.p}>
          I have a small habit. When I read that AI will change everything by next year, I swap it for a quieter question.
          What is the direction? And can I already see small signs of it today?
        </p>
        <p style={rp.p}>
          The year in the headline is almost always wrong. The direction almost never is. So this whole piece is about
          direction, not dates. I will only point at things I can already see starting.
        </p>
        <p style={rp.p}>
          One promise. No big word gets used without a plain meaning right next to it. If I break that even once, I wrote a
          worse piece than I meant to.
        </p>

        {/* 1 */}
        <h2 id="waves" style={rp.h2}>1. Four waves</h2>
        <p style={rp.p}>
          The clearest way I hold the whole history in my head is as waves. Each wave stacks on the last. It does not
          replace it.
        </p>
        <p style={rp.p}>
          First, machines learned to <strong style={rp.strong}>see and hear</strong>. To spot a face in a photo, a word in
          speech. Then they learned <strong style={rp.strong}>language</strong>. To read and write well. That is the wave
          that gave us the chatbots everyone met.
        </p>
        <p style={rp.p}>
          Now we are in a third wave: <strong style={rp.strong}>reasoning and action</strong>. The AI does not just talk. It
          plans and does things. And the next wave is forming: <strong style={rp.strong}>a sense of the real world</strong>,
          built into robots.
        </p>
        <FigAIWaves />
        <p style={rp.p}>
          The stacking part matters. Each wave keeps what the last one learned. Today one system can see, read, and, slowly,
          act, all at once. That is why progress feels so fast. It is not one miracle. It is layers, and layers multiply.
        </p>

        {/* 2 */}
        <h2 id="shift" style={rp.h2}>2. From answering to doing</h2>
        <p style={rp.p}>
          If you remember one thing, make it this. The near future of AI is the shift from software that
          <em> answers</em> to software that <em>acts</em>.
        </p>
        <p style={rp.p}>
          For seventy years, a computer waited for you to tell it each step. Even a smart chatbot mostly just answers the
          thing in front of it, then waits again. What is changing is that we now give the AI a goal, and let it work out
          the steps itself.
        </p>
        <FigToolsToAgents />
        <p style={rp.p}>
          You can feel the ladder in your own life. A calculator is a <strong style={rp.strong}>tool</strong>. It does one
          thing when you press the buttons. A chatbot is an <strong style={rp.strong}>assistant</strong>. It answers, then
          stops.
        </p>
        <p style={rp.p}>
          An <strong style={rp.strong}>agent</strong> is the new step. You say, sort out my trip to Delhi. It checks your
          calendar, compares options, books, and comes back only when it needs you. The step after that is
          <strong style={rp.strong}> teams of agents</strong> that split a big job between them.
        </p>
        <p style={rp.p}>
          Today’s agents are still clumsy and make real mistakes. I want to be fair about that. But the direction is not
          subtle, and it is not slowing.
        </p>

        {/* 3 */}
        <h2 id="agent" style={rp.h2}>3. What an agent really is</h2>
        <p style={rp.p}>
          The word agent sounds fancy. It is not. An agent is a loop.
        </p>
        <p style={rp.p}>
          It takes a goal and makes a rough plan. It <em>acts</em> using tools, which just means it can search the web,
          send an email, or run some code. It <em>looks</em> at what happened. It updates the plan. And it goes again,
          until the job is done or it gets stuck and asks you. Around the loop is a <em>memory</em>, so it does not forget
          what it learned two steps ago.
        </p>
        <FigAgentLoop />
        <p style={rp.p}>
          That is the whole thing. Plan, act, look, remember, repeat. I sometimes call it a thermostat with imagination. A
          thermostat also runs a loop: check the temperature, act on the heater, check again. The agent just has a much
          richer view of the world, and a keyboard to the whole internet.
        </p>

        {/* 4 */}
        <h2 id="interface" style={rp.h2}>4. Apps start to disappear</h2>
        <p style={rp.p}>
          Here is the change most people will feel first, before any dramatic stuff.
        </p>
        <p style={rp.p}>
          Right now, using a computer means <em>you</em> run a dozen apps. The email, the sheet, the calendar. You are the
          glue between them. You learned each one. You click through each one. You carry facts from one to the next in your
          head. That is a strange amount of work we all just accepted.
        </p>
        <FigInterfaceCollapse />
        <p style={rp.p}>
          As agents get good, that flips. You stop running the apps. You say what you want, and the agent runs them for you.
          Win back the customers who left last quarter. Get this contract signed.
        </p>
        <p style={rp.p}>
          The apps do not vanish. They slide behind one line of intent. I think the click-by-click way we work today will
          look, in ten years, the way a command line looks now. Still there underneath, but not how normal people get things
          done.
        </p>

        {/* 5 */}
        <h2 id="memory" style={rp.h2}>5. AI that remembers you</h2>
        <p style={rp.p}>
          Almost everything you use today forgets you the moment the chat ends. That is about to stop. And it is bigger
          than it sounds.
        </p>
        <p style={rp.p}>
          When an AI remembers your goals, your projects, and your history, it stops being a clever stranger you re-explain
          yourself to every morning. It starts to feel like a coworker who actually knows the job. That jump in usefulness
          is large. Maybe larger than the next jump in raw smarts.
        </p>
        <p style={rp.p}>
          I am torn about this one, and I will say so. The same memory that makes AI useful also means it holds a detailed
          picture of you. Who owns that? Can you read it, fix it, delete it, take it with you? Those questions are not
          solved. And the companies building the memory are not rushing to answer them. Useful, yes. Also the part I would
          watch most closely, as a normal person.
        </p>

        {/* 6 */}
        <h2 id="world" style={rp.h2}>6. Learning the real world</h2>
        <p style={rp.p}>
          The next wave is the one I find hardest to predict, and most likely to surprise us.
        </p>
        <p style={rp.p}>
          Today’s AI learned the world almost entirely from text and images. It knows a dropped glass shatters because it
          read it a million times, not because it has any feel for glass or gravity. A <strong style={rp.strong}>world
          model</strong> tries to give a machine that feel: an inner sense of how the physical world behaves, so it can
          guess what happens next and plan real actions.
        </p>
        <p style={rp.p}>
          This is the bridge to robots. And it is why the robot demos are getting less embarrassing. For years we hit a
          funny wall: the things that are hard for people, like chess, were easy for machines, and the things any toddler
          can do, like picking up a soft toy without crushing it, were brutally hard.
        </p>
        <p style={rp.p}>
          Language fell first because it lives in text, which we had oceans of. The real world is harder, because you
          cannot download it. You have to gather it. My honest guess: this wave moves slower, hits messier problems, and
          still reshapes whole industries, warehouses, driving, elder care, farming, over the back half of the decade. Of
          everything here, this is the part I hold most loosely.
        </p>

        {/* 7 */}
        <h2 id="work" style={rp.h2}>7. What a workday feels like</h2>
        <p style={rp.p}>
          Let me make this real. Big phrases mean nothing until you can picture a Tuesday.
        </p>
        <p style={rp.p}>
          Picture yours a few years out. You do not open ten apps. You open one place and talk to something that already
          knows your week. You describe results, not tasks: what you want to be true by Friday. A small crew of agents goes
          off and does the boring middle, the drafting, the chasing, the first pass, and brings you decisions, not to-do
          lists.
        </p>
        <p style={rp.p}>
          Your job shifts, hard, toward the two things machines are still bad at. Deciding what is worth doing. And taking
          responsibility for the result.
        </p>
        <p style={rp.p}>
          I want to be fair about how that feels, because it is not all warm. For many people it will be freeing. The boring
          part, finally handed off. For others it will be scary, because the boring part <em>was</em> the job, and what is
          left, judgment and responsibility, is harder and more exposed. Both will be true at once, for different people.
          Nobody gets to skip that.
        </p>

        {/* 8 */}
        <h2 id="limits" style={rp.h2}>8. What will NOT happen</h2>
        <p style={rp.p}>
          A guess is only worth something if it also says what it does not expect. So here are my bets against the crowd.
        </p>
        <p style={rp.p}>
          I do not think most jobs vanish in one clean sweep. Tasks get automated, work gets reshuffled, and the change is
          real but uneven and slower than the scary charts.
        </p>
        <p style={rp.p}>
          I do not think the interface flips overnight. Trust builds slowly. People are right to refuse to hand an agent
          their bank login until it has earned it.
        </p>
        <p style={rp.p}>
          And I do not think one company builds a single all-knowing AI that runs the world. The likelier future is many
          models and many agents, checking and arguing with each other. More like an economy than a brain.
        </p>
        <p style={rp.p}>
          I could be wrong on any of these, and on the timing almost surely am. I write the will-not list to keep myself
          honest. It is easy to get swept up in the most dramatic story. The most dramatic story is usually the least
          accurate.
        </p>

        <Divider />

        {/* 9 */}
        <h2 id="close" style={rp.h2}>9. How to stand in it</h2>
        <p style={rp.p}>
          So what do you do with all this, if you are not building the models? My answer is almost boringly practical.
        </p>
        <p style={rp.p}>
          Stop treating AI like a smarter search box. Start treating it like something you <em>hand work to</em>. The whole
          future is about handing over goals. The people who get good at handing over clearly, checking carefully, and
          keeping responsibility will do very well.
        </p>
        <p style={rp.p}>
          Get comfortable being the one who decides and answers for the result. That is the part that stays human longest.
          And stay a little suspicious, in a healthy way, of anyone, including me, who sounds too sure.
        </p>
        <p style={rp.p}>
          I started this half-expecting to end up terrified or evangelical, because those are the two moods on offer. I
          landed somewhere quieter. This is a huge shift, the biggest I expect to live through. And it will arrive as a long
          string of ordinary Tuesdays that each feel only a little different, until you look up and the whole landscape has
          moved. My job is to keep looking up on purpose, and to say what I see in words a normal person can use. That is
          the whole plan. I think it is enough.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          What is mine and what is borrowed: the map, the four-waves framing, and the bets are my own view, and the timing
          especially is a guess I hold loosely. The core ideas below, cheap prediction, task-level automation, world models,
          and the old point about what is easy and hard for machines, come from the sources here.
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
