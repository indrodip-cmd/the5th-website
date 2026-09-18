import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigAgiLevels, FigTaskExposure, FigAgencyUnbundling, FigMarginalCost } from '../figures'

const post = getPost('agi-society-and-the-end-of-b2b-agencies')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['start', 'Where I start from'],
  ['what', '1. What AGI means'],
  ['when', '2. The timing fight'],
  ['work', '3. What it does to work'],
  ['society', '4. The bigger picture'],
  ['thesis', '5. The agency dies first'],
  ['dies', '6. What dies, what survives'],
  ['shape', '7. What replaces it'],
  ['survive', '8. If you run one of these firms'],
  ['close', '9. An honest close'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I work in consulting and marketing, so I will start with a confession. The ending of this piece is uncomfortable for
      me. I went looking into AGI expecting to write something safe about society. Instead I kept landing on a sharper
      idea, close to home. The kind of business many of my friends run, the classic B2B marketing agency, is one of the
      first things this technology quietly takes apart. So this is me following the logic honestly, even when it points at
      my own backyard.
    </>
  )
  const objective = (
    <>
      I wanted to cut through the noise about AGI and answer two things for myself, in plain words. What would it really do
      to society? And which businesses break first? I follow the logic to an uncomfortable but honest conclusion about my
      own industry.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>Where I start from</h2>
        <p style={rp.p}>
          Let me set the rules first, because AGI means ten different things to ten people, usually to win an argument.
        </p>
        <p style={rp.p}>
          I am not going to promise you a robot god. I am also not going to tell you it is all hype. I will walk through
          what the word means, what it is already doing to work, what that spills into for society, and then I will get
          specific about one industry. Vague futurism is easy. Specific bets are the only ones you can judge me on later.
        </p>
        <p style={rp.p}>
          One promise on style. I am writing this so my mum could follow it. Every time I use a tech word, I hand you the
          plain version right after. Most people are locked out of this topic by big words, not by hard ideas.
        </p>

        {/* 1 */}
        <h2 id="what" style={rp.h2}>1. What AGI means</h2>
        <p style={rp.p}>
          Start with the AI you already use. It is <em>narrow</em>. It does one kind of thing, and it does not really know
          it is doing it. AGI, artificial <em>general</em> intelligence, means a system that is not stuck in one lane. It
          can pick up a wide range of tasks, like a capable person, including ones it was not built for. That is the whole
          difference in one word. General, not narrow.
        </p>
        <p style={rp.p}>
          Here is what people get wrong. They treat AGI like one switch, off or on. It is more like a ladder. A team at
          DeepMind laid it out this way (Morris and colleagues, 2023). At the bottom, narrow tools. Then a level roughly
          as good as an untrained person. Then competent. Then expert. Then better than any human.
        </p>
        <FigAgiLevels />
        <p style={rp.p}>
          Today’s best systems sit somewhere around emerging to competent, depending on the task. And here is the key
          point I kept coming back to. You do not need the top of the ladder to flip the economy. You need competent.
        </p>
        <p style={rp.p}>
          Why does competent matter more than genius? Because most paid work is not genius work. It is a skilled person
          doing a solid job, reliably, at a price. The moment a machine can do that same job for almost nothing, the money
          math of that job changes, whether or not the machine is brilliant. Hold on to that. The whole piece turns on it.
        </p>

        {/* 2 */}
        <h2 id="when" style={rp.h2}>2. The timing fight</h2>
        <p style={rp.p}>
          Ask when full AGI arrives and you will hear everything from a few years to never, often from equally smart
          people. That is a good sign nobody actually knows. So I stopped picking a year. It is the wrong question.
        </p>
        <p style={rp.p}>
          Here is a better tool, an old one called Amara’s law. We tend to overrate what tech does in the short run, and
          underrate what it does in the long run.
        </p>
        <p style={rp.p}>
          That fits what I have watched. Two years ago people oversold what these tools could do that quarter. They were
          wrong. But almost everyone, me included, is still underselling what they will do across a decade.
        </p>
        <p style={rp.p}>
          So my position is boring on purpose. I do not need to know if true AGI lands in 2029 or 2045. The disruption I
          care about is already happening at the competent level, in slow motion, and it builds. Waiting for a headline
          that says AGI achieved is like waiting for a flood to reach your neck before you admit it is raining.
        </p>

        {/* 3 */}
        <h2 id="work" style={rp.h2}>3. What it does to work</h2>
        <p style={rp.p}>
          Here it gets concrete. A team led by Eloundou (2023) did something smart. Instead of asking will AI take jobs,
          which nobody can answer, they broke jobs into <em>tasks</em>. Then they asked which tasks a capable AI could
          already do or speed up.
        </p>
        <p style={rp.p}>
          The pattern is the point. The most exposed work is language-heavy office work: writing, marketing, comms,
          analysis, a lot of software. The least exposed is hands-on work: the trades, care work, anything with a body in
          the real world.
        </p>
        <FigTaskExposure />
        <p style={rp.p}>
          Notice where marketing sits. Near the top. That is the first crack in the road to my main point. But first, one
          fair nuance, because the doomer version is lazy.
        </p>
        <p style={rp.p}>
          Exposed is not the same as replaced. Another study I trust, Brynjolfsson, Li and Raymond (2023), watched real
          support agents get an AI helper. The biggest gains went to the <em>least</em> experienced workers, who suddenly
          did as well as veterans. So in the near term, the honest picture is help, not a clean cut. The tool makes an
          average person good and a good person fast. Whether that means more jobs or fewer is genuinely not settled.
        </p>
        <p style={rp.p}>
          Still, there is one bit of logic I cannot argue my way out of. It comes from a book that reframed all this for
          me, <em>Prediction Machines</em> (Agrawal, Gans and Goldfarb). Their point: AI makes one thing very cheap,
          guessing and generating. And when something gets cheap, you use way more of it, and whatever it was paired with
          gets re-priced. Cheap generating makes human judgment, taste, and responsibility <em>more</em> valuable, and the
          routine work around them worth far less. Keep that sentence. It is the seed of the agency argument.
        </p>

        {/* 4 */}
        <h2 id="society" style={rp.h2}>4. The bigger picture</h2>
        <p style={rp.p}>
          Before I zoom in, let me zoom out once. When a general-purpose tech gets cheap, three things tend to happen. We
          are seeing early versions of all three.
        </p>
        <p style={rp.p}>
          One, output per hour goes up. That is good. It is how societies get richer. Two, the gains land unevenly. History
          says the people who own the tech, and whose skills fit it, pull ahead, while those whose work it replaces fall
          behind, at least for a painful stretch (Autor has written the clearest version of this).
        </p>
        <p style={rp.p}>
          Three, and this is the scary one. When making convincing text, images, and video becomes free, our shared sense
          of what is true gets harder to hold. If anything can be faked cheaply, trust becomes the rare thing. I keep
          landing on that word, trust. You will see it is also the heart of the business story.
        </p>
        <p style={rp.p}>
          I want to dodge both the utopia and the apocalypse, because both are ways of not thinking. My honest read: even
          the partial, competent AI already here is an amplifier. It makes capable people and good institutions much more
          capable. And it widens the cracks, in fairness, in truth, in who holds power, at the same time. It does not pick
          which one wins. We do.
        </p>

        <Divider />

        {/* 5 */}
        <h2 id="thesis" style={rp.h2}>5. The agency dies first</h2>
        <p style={rp.p}>
          Now the part I came to write. Said plainly: I think the classic B2B marketing agency is one of the first business
          models this tech structurally breaks. Not softens. Breaks.
        </p>
        <p style={rp.p}>
          Let me be precise about why, because AI will change marketing is a truism, while this model stops working is a
          real claim.
        </p>
        <p style={rp.p}>
          Strip away the fancy words, and think about what an agency actually sells. For decades it sold
          <em> the labor of making things</em>. Someone needed a landing page, forty ad versions, a research deck, a
          content calendar, a monthly report, a campaign idea. All of that took skilled human hours. Those hours were
          scarce, so they were worth paying for. That scarcity was the whole business.
        </p>
        <FigMarginalCost />
        <p style={rp.p}>
          Watch what the falling line does to that. As the cost of making a decent asset, a landing page, ad versions, a
          first-draft strategy, drops toward zero, you cannot keep charging for the labor of making it. You are selling
          bottled water next to a free tap that gets cleaner every month. It does not matter how nice your bottle is. The
          customer can see the tap. And they do not need you to reach it. The tap is inside their own browser.
        </p>
        <p style={rp.p}>
          I asked myself if this was just my own fear talking. I kept testing it against that exposure chart. Marketing is
          not near the top by accident. It is language, pattern, and repeat, which is exactly the shape of work these
          systems eat first. So the industry most exposed to the tech is also the one whose whole business was built on the
          scarcity the tech destroys. That is not a coincidence. That is a target.
        </p>

        {/* 6 */}
        <h2 id="dies" style={rp.h2}>6. What dies, what survives</h2>
        <p style={rp.p}>
          Agencies die is too blunt, and I do not fully believe the blunt version. What really happens is an
          <em> unbundling</em>. For a hundred years these things were sold as one lump. AI is prying that lump into two
          piles.
        </p>
        <FigAgencyUnbundling />
        <p style={rp.p}>
          On one side, the stuff whose cost collapses: content production, the grind of running ads, dashboards and
          reports, the first draft of a strategy, the research deck. All of it is going cheap, fast, and in-house.
        </p>
        <p style={rp.p}>
          On the other side, the stuff that cheap production makes <em>more</em> valuable. Taste and judgment, knowing which
          of a thousand cheap options is the right one. Responsibility, someone who owns the result, not just the output.
          Relationships and trust. Data no one else has. And real access to attention and to decision-makers.
        </p>
        <p style={rp.p}>
          Notice those are the same words from the society part: judgment, trust. When making things is free, judgment and
          trust are the only things left to sell.
        </p>
        <p style={rp.p}>
          So the honest sentence is not the agency vanishes. It is: the agency gets turned inside out. The part that used to
          be the product, making things, becomes the free tap. The soft wrapper around it, judgment and responsibility and
          relationships, becomes the whole product. Most agencies are built almost exactly backwards for that world. Big
          teams making things, a thin layer of judgment on top. The thin layer is the part that pays.
        </p>

        {/* 7 */}
        <h2 id="shape" style={rp.h2}>7. What replaces it</h2>
        <p style={rp.p}>
          If I picture what wins instead, three shapes keep showing up. I will admit I am half describing a business I would
          want to build.
        </p>
        <p style={rp.p}>
          First, <strong style={rp.strong}>in-housing</strong>. When making things is cheap, the reason to outsource it
          weakens. A lot of work simply moves back inside the client, run by a small team holding a lot of AI.
        </p>
        <p style={rp.p}>
          Second, the <strong style={rp.strong}>tiny AI-native firm</strong>. Three or four sharp people with real taste,
          doing the work that used to need forty, and keeping far more of the money because the machines do the heavy
          lifting. The old agency needed size to hold all those hours. The new one is punished for size, because size is
          mostly the cost the tech just deleted.
        </p>
        <p style={rp.p}>
          Third, and deepest, a pricing change. When you cannot honestly charge for hours or deliverables, because both are
          nearly free, the only thing left to charge for is the <em>result</em>. Pay for the pipeline, the revenue, the
          growth, not the pile of stuff made along the way.
        </p>
        <p style={rp.p}>
          I think the winning firms of the next decade barely look like agencies. They look like partners who take
          responsibility for a number, use AI to make production basically free, and get paid for results, not effort. That
          is a different animal. And most old firms cannot become it without tearing down the very thing that pays their
          salaries now.
        </p>

        {/* 8 */}
        <h2 id="survive" style={rp.h2}>8. If you run one of these firms</h2>
        <p style={rp.p}>
          I did not want to write a tidy doom piece and walk away, partly because I have skin in this. So here is the
          practical version, the advice I am giving myself.
        </p>
        <p style={rp.p}>
          Stop selling hours and deliverables, fast, before the market forces you to. Move up toward the things that
          survive: judgment, responsibility, your own data, relationships, access. Get small and senior, and let AI absorb
          the production you used to hire for. And change how you charge, from effort to results, because results are the
          one thing that stays scarce when making things is free.
        </p>
        <p style={rp.p}>
          The uncomfortable flip side, which I include because hiding it would be dishonest, is that this same playbook is
          exactly how you would <em>build the thing that kills the old agencies</em>. A tiny, senior, AI-native firm that
          takes responsibility for results and charges for them will beat a big production shop on price, speed, and margin
          at once. I am not neutral about which side of that I want to be on. Neither should you be.
        </p>

        {/* 9 */}
        <h2 id="close" style={rp.h2}>9. An honest close</h2>
        <p style={rp.p}>
          Let me be careful at the end, because certainty is the tell of a bad forecaster. I could be wrong on the speed.
          Rules, a collapse in trust, a plateau in the tech, or plain human stubbornness could all slow this down. And
          relationships and brand may prove stickier than my argument assumes. Marketing has survived every past this
          changes everything, from the web to social to programmatic. Mostly it adapted instead of dying. Maybe this is
          another one of those. I hold that chance sincerely.
        </p>
        <p style={rp.p}>
          But I do not think so. Here is the one-line reason. Every past wave changed the <em>tools</em> of making things.
          This one changes the <em>cost</em> of making things, toward zero, and a whole industry was priced on that cost
          staying high. When the thing you sell becomes free, and the thing you undersold, judgment and trust, becomes the
          whole game, you do not get to keep the old business with a fresh coat of paint. You become a different business,
          or you watch a smaller, sharper one become it instead.
        </p>
        <p style={rp.p}>
          That is the conclusion I did not want and could not talk myself out of. I would rather see it early, say it out
          loud, and act on it, than feel comforted and be slow. That, honestly, is the whole reason I write these.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          What is mine and what is borrowed: the framing, the agency thesis, and the conclusions are my own view, and
          reasonable people disagree with me. The facts about task exposure, productivity, and the economics of cheap
          prediction lean on the sources below, which I have tried to represent fairly.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Agrawal, A., Gans, J., &amp; Goldfarb, A. (2018). <em>Prediction Machines: The Simple Economics of Artificial Intelligence.</em> Harvard Business Review Press.</p>
          <p style={refStyle}>Autor, D. H. (2015). Why are there still so many jobs? The history and future of workplace automation. <em>Journal of Economic Perspectives, 29</em>(3), 3–30.</p>
          <p style={refStyle}>Bostrom, N. (2014). <em>Superintelligence: Paths, Dangers, Strategies.</em> Oxford University Press.</p>
          <p style={refStyle}>Brynjolfsson, E., Li, D., &amp; Raymond, L. R. (2023). Generative AI at work. <em>NBER Working Paper 31161.</em></p>
          <p style={refStyle}>Eloundou, T., Manning, S., Mishkin, P., &amp; Rock, D. (2023). GPTs are GPTs: An early look at the labor market impact potential of large language models. <em>arXiv:2303.10130.</em></p>
          <p style={refStyle}>Frey, C. B., &amp; Osborne, M. A. (2017). The future of employment: How susceptible are jobs to computerisation? <em>Technological Forecasting and Social Change, 114</em>, 254–280.</p>
          <p style={refStyle}>Morris, M. R., et al. (2023). Levels of AGI for operationalizing progress on the path to AGI. <em>arXiv:2311.02462.</em></p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
