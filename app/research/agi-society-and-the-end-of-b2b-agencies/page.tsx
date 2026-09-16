import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigAgiLevels, FigTaskExposure, FigAgencyUnbundling, FigMarginalCost } from '../figures'

const post = getPost('agi-society-and-the-end-of-b2b-agencies')!

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
  ['start', 'Where I am starting from'],
  ['what', '1. What AGI actually means'],
  ['when', '2. The timing fight'],
  ['work', '3. What it does to work'],
  ['society', '4. The society layer'],
  ['thesis', '5. The thesis: the agency dies first'],
  ['dies', '6. What dies and what survives'],
  ['shape', '7. The shape of what replaces it'],
  ['survive', '8. If you run one of these firms'],
  ['close', '9. An honest close'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I run in the world of consulting and marketing, so I have a confession to make before I start: the conclusion of
      this piece is uncomfortable for me personally. I went looking into artificial general intelligence expecting to
      write something balanced and safe about “society.” Instead I kept arriving at a much sharper, closer-to-home idea,
      that the kind of business many of my peers run, the traditional B2B marketing agency, is one of the first things
      this technology quietly takes apart. So this is me following the reasoning honestly, even though it points at my own
      backyard.
    </>
  )
  const objective = (
    <>
      I wanted to cut through the noise around AGI and answer two things for myself, in plain language a non-expert can
      follow: what would it really do to society, and which businesses break first? I follow the reasoning to an
      uncomfortable but, I think, honest conclusion about the industry I work in.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>Where I am starting from</h2>
        <p style={rp.p}>
          Let me set the ground rules, because “AGI” is a word people use to mean ten different things, usually to win an
          argument. I am not going to promise you a robot god, and I am not going to tell you it is all hype either. I am
          going to walk through what the term actually means, what the evidence says it is already doing to work, what that
          spills into for society, and then I am going to get specific about one industry, because vague futurism is easy
          and specific predictions are the only ones you can actually judge me on later.
        </p>
        <p style={rp.p}>
          One promise on style. I am writing this so my mum could follow it. Every time I use a piece of jargon I will
          hand you the plain version right after, because I genuinely believe most people are locked out of this
          conversation by vocabulary, not by difficulty. The ideas are not that hard. The words around them are just doing
          a bad job.
        </p>

        {/* 1 */}
        <h2 id="what" style={rp.h2}>1. What AGI actually means</h2>
        <p style={rp.p}>
          Start with the ordinary AI you already use. It is <em>narrow</em>. It does one kind of thing, translate, answer,
          summarise, generate an image, and it does not really understand that it is doing it. AGI, artificial
          <em> general</em> intelligence, is the idea of a system that is not stuck in one lane. It can pick up a wide
          range of tasks the way a capable person can, including ones it was not specifically built for. That is the whole
          difference in one word: general, as opposed to narrow.
        </p>
        <p style={rp.p}>
          The thing people get wrong is treating AGI as a single switch that is either off or on. I found it far more
          useful to think of it as a ladder, which is exactly how a team at DeepMind framed it (Morris and colleagues,
          2023). At the bottom you have narrow tools. Then “emerging” general systems that are roughly as good as an
          unskilled human across many tasks. Then competent, then expert, then virtuoso, then superhuman. Today’s best
          systems sit somewhere in the emerging-to-competent band, depending on the task, and, this is the key point I
          kept coming back to, you do not need the top of the ladder to turn the economy upside down. You need “competent.”
        </p>
        <FigAgiLevels />
        <p style={rp.p}>
          Why does competent matter more than superhuman? Because most paid work is not superhuman. Most paid work is a
          skilled person doing a competent job, reliably, at a price. The moment a machine can do a competent job at that
          same task for almost nothing, the economics of that task change, whether or not the machine is a genius. Hold on
          to that, because it is the hinge the whole essay turns on.
        </p>

        {/* 2 */}
        <h2 id="when" style={rp.h2}>2. The timing fight</h2>
        <p style={rp.p}>
          If you ask when full AGI arrives, you will get answers from “a few years” to “never,” often from people equally
          qualified, which is a good sign that nobody actually knows. So I stopped trying to pick a year. It is the wrong
          question, and honestly a bit of a trap. Here is the mental tool I found more useful, an old one called Amara’s
          law: we tend to overestimate what technology does in the short run and underestimate what it does in the long
          run.
        </p>
        <p style={rp.p}>
          That fits everything I have watched with my own eyes. Two years ago people oversold what these tools could do
          this quarter, and they were wrong. But almost everyone, including me, is still underselling what they will do
          across a decade. So my working position is deliberately boring: I do not need to know whether “true” AGI lands in
          2029 or 2045. The disruption I care about does not wait for the finish line. It is already happening at the
          competent rung, right now, in slow motion, and it compounds. Waiting for a headline that says “AGI achieved”
          before you take it seriously is like waiting for a flood to reach your neck before you agree it is raining.
        </p>

        {/* 3 */}
        <h2 id="work" style={rp.h2}>3. What it does to work</h2>
        <p style={rp.p}>
          Here is where it gets concrete, and where the research is genuinely useful rather than speculative. A team led by
          Eloundou (2023) did something clever. Instead of asking “will AI take jobs,” which is unanswerable, they broke
          jobs into <em>tasks</em> and asked which tasks a capable language model could already do or meaningfully speed
          up. The pattern is the important part. The most exposed work is language-heavy office work: writing, marketing,
          communications, analysis, a lot of software. The least exposed is physical and hands-on: the trades, care work,
          anything that lives in the real world with a body.
        </p>
        <FigTaskExposure />
        <p style={rp.p}>
          Notice where marketing sits on that chart. Near the very top. That is not an accident, and it is the first crack
          in the road that leads to my main argument. But before I get there, one honest nuance, because the doomer version
          of this is lazy. Exposure is not the same as replacement. A separate study I trust, Brynjolfsson, Li and Raymond
          (2023), watched real customer-support agents given an AI assistant and found the biggest gains went to the
          <em> least</em> experienced workers, who suddenly performed like seasoned ones. So in the near term the honest
          picture is augmentation, not a clean cull. The tool makes an average person good and a good person fast. Whether
          that ends in more jobs or fewer is genuinely unsettled, and anyone who tells you they are certain is selling
          something.
        </p>
        <p style={rp.p}>
          Still, there is an economic logic underneath it that I cannot argue my way out of, and it comes from a book that
          reframed all of this for me, <em>Prediction Machines</em> (Agrawal, Gans and Goldfarb). Their point is that AI
          is, at bottom, a way to make one thing radically cheap: prediction, and by extension, generation. And basic
          economics says when something becomes cheap, you use a lot more of it, and whatever it was bundled with gets
          revalued. Cheap prediction makes human judgment, taste, and accountability <em>more</em> valuable, and the
          routine production around them far less. Keep that sentence. It is the seed of the whole agency argument.
        </p>

        {/* 4 */}
        <h2 id="society" style={rp.h2}>4. The society layer</h2>
        <p style={rp.p}>
          Before I zoom in, let me zoom out once, because the business story only makes sense inside the bigger one. When a
          general-purpose technology gets cheap, three things tend to happen, and we are seeing early versions of all
          three.
        </p>
        <p style={rp.p}>
          The first is a productivity jump, real output per hour rising, which is genuinely good and is how societies get
          richer. The second, and this is the uncomfortable one, is that the gains do not land evenly. History says the
          people who own the technology, and the people whose skills pair well with it, pull ahead, while those whose work
          it simply replaces fall behind, at least for a painful stretch. Economists have argued about this for years
          (Autor’s work on how automation splits the labour market is the clearest I found), and I do not think anyone has
          a comfortable answer. The third is subtler and, to me, the scariest: when generating convincing text, images, and
          video becomes free, our shared sense of what is true gets harder to hold. If anything can be fabricated cheaply,
          trust itself becomes the scarce resource. I keep coming back to that word, trust, and you will see it is also the
          hinge of the business story.
        </p>
        <p style={rp.p}>
          I want to resist both the utopia and the apocalypse here, because both are a way of not thinking. My honest read
          is that AGI, even the partial, competent version already arriving, is a genuine amplifier. It makes capable
          people and good institutions dramatically more capable, and it makes the cracks, in inequality, in truth, in
          concentration of power, dramatically wider too. It does not decide which of those wins. We do. That is not a
          comforting conclusion, but I trust it more than the confident ones.
        </p>

        <Divider />

        {/* 5 */}
        <h2 id="thesis" style={rp.h2}>5. The thesis: the agency dies first</h2>
        <p style={rp.p}>
          Now the part I actually came to write, the part about my own industry, said plainly. I think the traditional B2B
          marketing agency is one of the first business models this technology structurally breaks. Not “disrupts” in the
          soft conference sense. Breaks. And I want to be precise about why, because “AI will change marketing” is a
          truism, while “this specific model stops working” is a claim.
        </p>
        <p style={rp.p}>
          Here is the thing a marketing agency actually sells, once you strip away the language. For decades it sold
          <em> the labour of making things</em>. Someone needed a landing page, forty ad variations, a research deck, a
          content calendar, a monthly report, a campaign concept, and doing all of that took skilled human hours that were
          scarce and therefore worth paying for. The agency was, underneath the creativity and the pitch theatre, a way to
          rent scarce production capacity. That scarcity was the whole business.
        </p>
        <FigMarginalCost />
        <p style={rp.p}>
          Watch what the falling curve does to that. As the cost of producing a competent asset, a decent landing page, a
          batch of ad variants, a first-draft strategy, a research brief, drops toward zero, you cannot keep charging for
          the labour of making it. You are trying to sell water by the bottle next to a free tap that is getting cleaner
          every month. It does not matter how good your bottling is. The customer can see the tap. And crucially, the buyer
          does not need the agency’s permission or its people to reach it, the same tap is sitting inside their own
          browser.
        </p>
        <p style={rp.p}>
          I sat with whether this was just my own anxiety talking, and I kept testing it against that task-exposure chart.
          Marketing is not near the top of the exposure list by chance. It is language, pattern, and iteration, which is
          exactly the shape of work these systems eat first. So the industry most exposed to the technology is also the one
          whose core business model was built on the very scarcity the technology destroys. That is not a coincidence. That
          is a target.
        </p>

        {/* 6 */}
        <h2 id="dies" style={rp.h2}>6. What dies and what survives</h2>
        <p style={rp.p}>
          Now, “agencies die” is too blunt, and I do not fully believe the blunt version. What actually happens is an
          <em> unbundling</em>. For a hundred years these things were sold as one lump, and AI is prying that lump into two
          piles: the parts whose cost collapses to nearly nothing, and the parts that were never really about production at
          all and therefore survive, even rise in value.
        </p>
        <FigAgencyUnbundling />
        <p style={rp.p}>
          On the collapsing side: content production, the grind of media-buying operations, dashboards and reporting, the
          first draft of a strategy, the research deck. All of it is becoming cheap, fast, and in-house. On the surviving
          side is everything that cheap production actually makes <em>more</em> scarce, and I want to name these carefully
          because this is where I would stake a business today. Taste and judgment, knowing which of the thousand cheap
          options is the right one. Accountability, someone who carries real responsibility for the outcome, not the
          output. Relationships and trust, the human thread that no model owns. Proprietary data, the thing a competitor
          and a general model both lack. And distribution, actual access to attention and to decision-makers. Notice these
          are the same words from the society section: judgment, trust. When production is free, judgment and trust are the
          only things left to sell.
        </p>
        <p style={rp.p}>
          So the honest sentence is not “the agency vanishes.” It is: the agency gets turned inside out. The part that used
          to be the product, making things, becomes the free tap. The part that used to be the soft wrapper around the
          product, judgment and accountability and relationships, becomes the entire product. Most agencies are organised
          almost exactly backwards for that world, with armies of production people and a thin layer of judgment on top.
          The layer that pays is the thin one.
        </p>

        {/* 7 */}
        <h2 id="shape" style={rp.h2}>7. The shape of what replaces it</h2>
        <p style={rp.p}>
          If I try to picture what wins instead, three shapes keep showing up, and I will be honest that I am half
          describing a business I would want to build myself.
        </p>
        <p style={rp.p}>
          The first is <strong style={rp.strong}>in-housing</strong>. When production is cheap, the reason to outsource it
          weakens, so a lot of work simply moves back inside the client, run by a small team holding a lot of AI. The
          second is the <strong style={rp.strong}>tiny AI-native firm</strong>: three or four sharp people with genuine
          taste, doing the work that used to need forty, and keeping far more of the margin because the machines do the
          heavy lifting. The old agency needed scale to hold all those production hours. The new one is punished for scale,
          because scale is mostly the cost the technology just deleted. Small, senior, and judgment-dense beats big,
          junior, and production-heavy. That is close to a reversal of the last few decades.
        </p>
        <p style={rp.p}>
          The third is the deepest, and it is a pricing shift. When you can no longer honestly charge for hours or
          deliverables, because both are nearly free, the only thing left to charge for is the <em>outcome</em>. Pay for
          the result, the pipeline, the revenue, the growth, not the volume of stuff produced on the way there. I think
          the winning firms of the next decade barely look like agencies at all. They look like partners who take
          responsibility for a number, use AI to make the production essentially free, and get paid for judgment and
          results rather than effort. That is a fundamentally different animal, and most incumbents cannot become it
          without dismantling the very thing that currently pays their salaries.
        </p>

        {/* 8 */}
        <h2 id="survive" style={rp.h2}>8. If you run one of these firms</h2>
        <p style={rp.p}>
          I did not want to write a tidy doom essay and walk away, partly because I have skin in this. So here is the
          practical version, the advice I am genuinely giving myself. Stop selling hours and deliverables, quickly, before
          the market forces you to. Move up the stack toward the things that survive: judgment, accountability, proprietary
          data, relationships, distribution. Get radically small and radically senior, and let AI absorb the production you
          used to hire for. And change how you charge, from effort to outcome, because outcome is the one thing that stays
          scarce when making things is free.
        </p>
        <p style={rp.p}>
          The uncomfortable flip side, which I include because it would be dishonest not to, is that the same playbook is
          exactly how you would <em>build the thing that kills the old agencies</em>. A tiny, senior, AI-native firm that
          takes responsibility for outcomes and charges for results will simply out-compete a large production shop on
          price, speed, and margin, all at once. I am not neutral about which side of that I want to be on, and neither
          should you be.
        </p>

        {/* 9 */}
        <h2 id="close" style={rp.h2}>9. An honest close</h2>
        <p style={rp.p}>
          Let me be careful at the end, because certainty is the tell of a bad forecaster. I could be wrong about the
          speed. Regulation, trust collapse, a plateau in the technology, or plain human stubbornness could all slow this
          down, and relationships and brand and human trust may prove stickier than my argument assumes. Marketing has
          survived every previous “this changes everything,” from the web to social to programmatic, and mostly it adapted
          rather than died. Maybe this is another of those. I hold that possibility sincerely.
        </p>
        <p style={rp.p}>
          But I do not think so, and here is the one-line version of why. Every previous wave changed the <em>tools</em> of
          production. This one changes the <em>cost</em> of production, toward zero, and an entire industry was priced on
          that cost being high. When the thing you sell becomes free and the thing you undersold, judgment and
          accountability and trust, becomes the whole game, you do not get to keep the old business with a fresh coat of
          paint. You have to become a different business, or watch a smaller, sharper one become it instead. That is the
          conclusion I did not want and could not talk myself out of. I would rather see it early, out loud, and act on it,
          than be comforted and slow. That, honestly, is the whole reason I write these at all.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          A note on what is mine and what is borrowed: the framing, the agency thesis, and the conclusions here are my own
          working view, and reasonable people disagree with me. The empirical claims about task exposure, productivity, and
          the economics of cheap prediction lean on the sources below, which I have tried to represent fairly rather than
          bend to my argument. The figures marked schematic or illustrative are exactly that.
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
