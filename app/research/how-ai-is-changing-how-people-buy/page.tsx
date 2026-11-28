import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, Plain, C } from '../ui'
import { Figure } from '../figures'
import { BarChart, LineChart } from '../charts'

const post = getPost('how-ai-is-changing-how-people-buy')!
export const metadata: Metadata = articleMetadata(post)
const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['summary', 'The short version'],
  ['old-mind', '1. The buying mind before AI'],
  ['shift', '2. What actually changed'],
  ['discovery', '3. Discovery: from searching to asking'],
  ['choice', '4. Choice: the shrinking shortlist'],
  ['trust', '5. Trust: the gap that decides everything'],
  ['proof', '6. Proof: reviews, friends and machines'],
  ['delegate', '7. Delegation, regret and the last click'],
  ['persuasion', '8. When the helper also persuades'],
  ['who', '9. Who is doing this: ages 25 to 55'],
  ['sellers', '10. What it means if you sell'],
  ['buyers', '11. What it means if you buy'],
  ['limits', '12. What this paper cannot say'],
  ['close', '13. The takeaway'],
  ['refs', 'References'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }
const eyebrow: React.CSSProperties = { fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep }

/* Figure: old path versus new path */
function FigPath() {
  const node = (x: number, y: number, w: number, t: string, s: string, hi = false) => (
    <g>
      <rect x={x} y={y} width={w} height="58" rx="12" fill={hi ? C.gold : C.plumDark} />
      <text x={x + w / 2} y={y + 26} textAnchor="middle" fontSize="14" fontWeight="700" fill={hi ? C.plumDark : '#fff'}>{t}</text>
      <text x={x + w / 2} y={y + 44} textAnchor="middle" fontSize="11.5" fill={hi ? C.plumDark : 'rgba(255,255,255,.7)'}>{s}</text>
    </g>
  )
  const arr = (x1: number, y1: number, x2: number, y2: number) => <path d={`M${x1},${y1} L${x2},${y2}`} stroke={C.goldDeep} strokeWidth="2" markerEnd="url(#ar)" />
  return (
    <svg viewBox="0 0 760 330" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="The old path to purchase compared with the new path that runs through an AI assistant and a human check">
      <defs><marker id="ar" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={C.goldDeep} /></marker></defs>
      <text x="0" y="22" fontSize="12" fontWeight="800" letterSpacing="1.6" fill={C.muted}>BEFORE: BRAND AND SEARCH LED</text>
      {node(0, 36, 150, 'See an ad', 'awareness')}
      {node(200, 36, 150, 'Search + browse', 'many tabs, many sites')}
      {node(400, 36, 150, 'Compare', 'reviews, prices')}
      {node(600, 36, 150, 'Buy', 'on the seller site')}
      {arr(150, 65, 198, 65)}{arr(350, 65, 398, 65)}{arr(550, 65, 598, 65)}
      <line x1="0" y1="140" x2="760" y2="140" stroke={C.border} strokeDasharray="4 5" />
      <text x="0" y="170" fontSize="12" fontWeight="800" letterSpacing="1.6" fill={C.goldDeep}>NOW: ASK FIRST, VERIFY, THEN BUY</text>
      {node(0, 186, 150, 'Ask the AI', 'plain-language question')}
      {node(200, 186, 150, 'Get a shortlist', 'three or four options', true)}
      {node(400, 186, 150, 'Human check', 'reviews, friends, a call', true)}
      {node(600, 186, 150, 'Buy', 'link out or in-chat')}
      {arr(150, 215, 198, 215)}{arr(350, 215, 398, 215)}{arr(550, 215, 598, 215)}
      <path d="M475,246 C475,300 275,300 275,250" fill="none" stroke={C.goldDeep} strokeWidth="1.6" strokeDasharray="5 4" markerEnd="url(#ar)" />
      <text x="375" y="318" textAnchor="middle" fontSize="12" fill={C.muted}>if the check fails, go back and ask again</text>
    </svg>
  )
}

/* Figure: where AI use is strongest across the journey (qualitative shape) */
function FigStages() {
  const stages: [string, number][] = [['Discover', 92], ['Compare', 82], ['Shortlist', 66], ['Decide', 40], ['Pay', 18]]
  return (
    <svg viewBox="0 0 760 290" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Qualitative sketch: AI use is highest early in the buying journey and falls toward payment">
      {stages.map(([l, v], i) => {
        const x = 40 + i * 140, h = v * 2.1
        return (
          <g key={l}>
            <rect x={x} y={240 - h} width="96" height={h} rx="10" fill={i < 2 ? C.plumDark : i < 4 ? C.plum : C.goldDeep} opacity={0.95 - i * 0.05} />
            <text x={x + 48} y="264" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plumDark}>{l}</text>
          </g>
        )
      })}
      <path d="M88,60 C240,58 340,100 480,150 S660,215 728,222" fill="none" stroke={C.gold} strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
      <text x="750" y="20" textAnchor="end" fontSize="11.5" fill={C.muted}>Shape only. Not measured values.</text>
    </svg>
  )
}

export default function Article() {
  const lead = (
    <>
      Something small and enormous happened to shopping in the last two years. A person who wants to buy something no
      longer has to go and look. They can simply ask. A machine reads the whole internet in a few seconds and hands back
      three or four options in friendly, confident sentences. About half of American adults now use these tools. This
      paper is my attempt to understand, in plain words, what that does to the human mind that is doing the buying.
    </>
  )
  const objective = (
    <>
      I wanted to answer one question as honestly as the evidence allows: when an AI sits between a person and a purchase,
      what changes in how that person thinks, trusts and decides? I have gathered the strongest 2025 and 2026 evidence I
      could find and tied it to what psychology has known for fifty years. This paper is a synthesis of published research; I did
      not run a survey for it.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        <div id="summary" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ ...eyebrow, marginBottom: 10 }}>The short version</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            AI has become the front door of shopping. People use it to discover, compare and shortlist. The old
            psychology has not changed: we still hate regret, still crave proof, still shrink a hard choice into a few
            easy ones. What changed is who does the shrinking. Now a machine does it, in seconds, in the voice of a calm
            expert. The data says three things at once. Use is mainstream. Shoppers who arrive from AI buy more readily.
            And yet most people do not fully trust the machine, and want a human step before the money moves. Trust, not
            technology, is where this whole story will be decided.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> consumer psychology · AI shopping · algorithm aversion · choice overload ·
            trust calibration · agentic commerce · decision delegation
          </p>
        </div>

        <h2 id="old-mind" style={rp.h2}>1. The buying mind before AI</h2>
        <p style={rp.p}>
          To see what AI changed, start with what it met. The human buying mind is not a calculator. Daniel Kahneman
          described it as two systems working together. System 1 is fast, automatic and emotional. It likes what feels
          familiar and fluent. System 2 is slow and effortful, and it is lazy: it only steps in when something feels
          wrong or the stakes are high (Kahneman, 2011). Most purchases are System 1 purchases dressed up afterwards in
          System 2 reasons.
        </p>
        <p style={rp.p}>
          Three more ideas matter for this paper. First, <strong style={rp.strong}>loss aversion</strong>: a bad purchase
          hurts more than an equal good one pleases (Tversky &amp; Kahneman, 1979). Second, <strong style={rp.strong}>regret</strong>:
          we choose partly to avoid the feeling of having chosen wrong (Zeelenberg &amp; Pieters, 2007). Third, the
          economists&rsquo; split between goods you can judge before buying (<em>search</em> goods), goods you only judge
          by using them (<em>experience</em> goods), and goods you cannot fully judge even afterwards (<em>credence</em> goods)
          (Nelson, 1970; Darby &amp; Karni, 1973). A phone is a search good. A restaurant is an experience good. A coach, a
          doctor or a consultant is a credence good.
        </p>
        <p style={rp.p}>
          Because we cannot judge many things directly, we borrow judgement from others. Robert Cialdini&rsquo;s classic
          list of influence levers, social proof, authority, liking, scarcity, commitment, reciprocity, is really a list of
          the shortcuts we use to borrow that judgement (Cialdini, 1984). Reviews, brands, experts, friends: all of them
          are ways of saving mental effort and reducing the fear of being wrong.
        </p>
        <Plain>
          Buying is mostly an exercise in managing doubt. We look for anything that lets us stop thinking and feel safe.
          Keep that in mind, because AI is the most effective doubt-reducer ever built.
        </Plain>

        <h2 id="shift" style={rp.h2}>2. What actually changed</h2>
        <p style={rp.p}>
          The scale of the change is easy to underestimate, so here are the plain numbers. The Pew Research Center asked
          5,119 US adults in February 2026 about AI chatbots. Forty-nine percent now use them, up from 33 percent in 2024
          (Pew, 2026). The comparison is not perfectly like-for-like, but the direction is not in doubt. ChatGPT alone
          went from 18 percent of adults in 2023 to 44 percent in 2026.
        </p>

        <LineChart
          title="ChatGPT use among US adults"
          subtitle="Share who have used ChatGPT (%), and all AI chatbots where Pew reported it"
          unit="%"
          xLabels={[2023, 2024, 2025, 2026]}
          series={[
            { name: 'ChatGPT', color: '#3D2645', points: [[2023, 18], [2024, 23], [2025, 34], [2026, 44]] },
            { name: 'Any AI chatbot', color: '#C9A84C', points: [[2024, 33], [2026, 49]] },
          ]}
          src="Pew Research Center, Americans and AI, June 2026"
        />

        <p style={{ ...rp.p, marginTop: 22 }}>
          Age matters, and it matters for this paper because most people reading it sit between 25 and 55. Pew found that
          57 percent of adults under 50 use ChatGPT, against 28 percent of adults 50 and over. The buying public that
          businesses care about most is exactly the group that has moved first.
        </p>
        <p style={rp.p}>
          Then look at what happens when those people shop. Adobe, which measures more than a trillion visits to US
          retail sites, reported that traffic arriving from generative AI tools grew 693 percent year on year over the
          2025 holiday season (769 percent in November, 673 percent in December). Those visitors were worth more. They
          converted 31 percent better than visitors from other sources, spent 45 percent longer on the site and viewed 13
          percent more pages. Earlier in 2025, Adobe measured revenue per visit from AI traffic running 84 percent above
          other traffic (Adobe, 2026).
        </p>

        <BarChart
          title="How AI-referred shoppers differ"
          subtitle="Advantage of AI-referred visits over other retail traffic (%), Adobe Analytics, US retail"
          unit="%"
          max={100}
          items={[
            { label: 'Revenue per visit (Jan to Jul 2025)', value: 84, note: 'Adobe, earlier in 2025' },
            { label: 'Time on site (holiday 2025)', value: 45, note: 'Holiday 2025' },
            { label: 'Conversion rate (holiday 2025)', value: 31, highlight: true, note: 'Holiday 2025; nearly double the 2024 gap' },
            { label: 'Pages per visit (holiday 2025)', value: 13, note: 'Holiday 2025' },
          ]}
          src="Adobe Analytics, 2025 to 2026 (vendor data, not independently audited)"
        />

        <p style={{ ...rp.p, marginTop: 22 }}>
          A later Adobe release, as reported in the trade press, puts the September 2026 conversion advantage of AI
          traffic at 90 percent, the highest it has recorded, with AI traffic up 71 percent on the year. I did not open
          that primary release, so treat that one figure as to be verified. The pattern across all of Adobe&rsquo;s data is
          consistent: <strong style={rp.strong}>people who arrive from an AI have already done much of their deciding.</strong>
        </p>
        <p style={rp.p}>
          That is the key change. The shopper arrives later in the process, and warmer. Their doubts have been answered
          in a private conversation the seller never saw.
        </p>

        <Figure n={1} caption={<>The path to purchase, before and after. The loop at the bottom is the part the data keeps showing: people still check the machine before they pay.</>}>
          <FigPath />
        </Figure>

        <h2 id="discovery" style={rp.h2}>3. Discovery: from searching to asking</h2>
        <p style={rp.p}>
          Searching and asking feel similar but they are very different acts for the mind. A search returns a list and
          leaves the work of judging to you. You open tabs, skim, compare, forget what was on the first one. It costs
          effort, and effort is exactly what System 2 avoids. Asking costs almost nothing. You describe your situation in
          your own words and get an answer shaped to it.
        </p>
        <p style={rp.p}>
          Three psychological effects follow. <strong style={rp.strong}>Fluency</strong>: a smooth, confident, well-written
          answer feels more true than it should, because ease of reading is mistaken for accuracy.
          <strong style={rp.strong}> Personal relevance</strong>: an answer that mentions your budget and your situation feels
          like it was made for you, and we trust what feels made for us. <strong style={rp.strong}>Conversation</strong>: a
          back-and-forth builds a feeling of rapport that a list of links never can.
        </p>
        <p style={rp.p}>
          Conversation is also simply more persuasive than static text. In a UK randomised experiment, a live exchange
          with GPT-4o moved opinions 2.94 percentage points more than people reading the same arguments, a 41 percent
          gain. With GPT-4.5 the gain was 3.60 points, 52 percent. Both were statistically strong (arXiv 2507.13919). That
          paper tested political opinions, not purchases, so I use it only as evidence about the format, not about
          shopping. But if a chat changes minds more than a page does, a chat about what to buy has the same advantage
          built in.
        </p>
        <p style={rp.p}>
          Surveys of business buyers show the same migration. In a vendor-run 2026 survey of 1,076 software buyers, G2
          found 71 percent now rely on AI chatbots for research, up from 60 percent, and 51 percent start with a chatbot
          more often than with Google. I flagged that source as vendor-run in the earlier paper on how people buy
          expertise, and I flag it again here.
        </p>

        <h2 id="choice" style={rp.h2}>4. Choice: the shrinking shortlist</h2>
        <p style={rp.p}>
          One of the most famous experiments in consumer psychology used jam. Sheena Iyengar and Mark Lepper set up a
          tasting table in a supermarket. When it showed 24 flavours, more people stopped to look: 60 percent. When it
          showed 6, 40 percent stopped. But among those who stopped, only 3 percent bought from the big table, against 30
          percent from the small one (Iyengar &amp; Lepper, 2000). More choice attracts. Less choice converts. Researchers
          have debated how large and how reliable the effect is, but the underlying idea is solid: too many options make
          deciding harder and regret more likely.
        </p>
        <p style={rp.p}>
          AI is a choice-shrinking machine. You ask a vague question about the best option. You get a shortlist of three
          or four, each with a reason. The hard part of the decision, the thinning of the field, has been done for you.
          For the buyer this feels like relief. For the seller it is a quiet earthquake, because the old goal of being
          one of ten results on a page becomes the new goal of being one of three names in an answer.
        </p>
        <Plain>
          When a person once saw ten results, being seventh was survivable. When a machine names three, being fourth
          means not existing. The shortlist is now the whole market.
        </Plain>
        <p style={rp.p}>
          This also explains why AI-referred visitors convert better. They did not arrive to browse. They arrived because
          a trusted voice already said this one is a good fit. Lek, surveying 2,650 US consumers in April 2026, reported
          that among AI adopters 85 percent said the tools improved their shopping experience and 66 percent believed the
          results were accurate. Those are adopters only, so they overstate how the whole public feels.
        </p>

        <h2 id="trust" style={rp.h2}>5. Trust: the gap that decides everything</h2>
        <p style={rp.p}>
          Here is the most important thing I found, and the reason I think the story is not simply &ldquo;AI takes over
          shopping.&rdquo; People use the machine far more than they trust it.
        </p>
        <p style={rp.p}>
          Alchemer surveyed 1,002 US shoppers in 2026. Of them, 48.5 percent had used an AI tool to research a purchase
          in the past twelve months. But only 35.4 percent trusted AI recommendations completely or mostly. Just 15.4
          percent trusted AI more than other sources, well behind online reviews (36.1 percent) and friends and family
          (31.2 percent). The IAB, cited by eMarketer, found that only 46 percent of shoppers fully trust AI
          recommendations, while 89 percent still check the information before buying. A survey summarised by Retail Dive
          found 44 percent trust AI tools for purchase decisions against 59 percent who trust friends and family.
        </p>

        <BarChart
          title="Use outruns trust"
          subtitle="US shoppers (%), Alchemer 2026 benchmark, n=1,002"
          unit="%"
          max={60}
          items={[
            { label: 'Used AI to research a purchase (past 12 months)', value: 48.5, highlight: true },
            { label: 'Trust AI recommendations completely or mostly', value: 35.4 },
            { label: 'Trust online reviews more than other sources', value: 36.1 },
            { label: 'Trust friends and family more than other sources', value: 31.2 },
            { label: 'Trust AI more than other sources', value: 15.4 },
          ]}
          src="Alchemer 2026 Retail AI report (vendor survey)"
        />

        <p style={{ ...rp.p, marginTop: 22 }}>
          Not every survey agrees. BCG&rsquo;s 2026 consumer research reports that more than 60 percent of consumers express
          high trust in generative AI results, and that shopping-related use grew 35 percent between February and
          November 2025. The numbers differ because surveys define trust differently and sample different people. The
          honest summary is a range, roughly a third to two thirds, depending on how you ask. What none of them show is
          blind faith.
        </p>
        <h3 style={rp.h3}>Algorithm aversion and algorithm appreciation</h3>
        <p style={rp.p}>
          Psychology has two opposite findings here, and both are true. In 2015, Dietvorst and colleagues at Wharton showed
          <em> algorithm aversion</em>: people lose confidence in an algorithm much faster than in a human after seeing it
          make the same mistake (Dietvorst, Simmons &amp; Massey, 2015). In 2019, Jennifer Logg and colleagues showed
          <em> algorithm appreciation</em>: people often prefer advice from an algorithm over advice from a person, when
          the task is about numbers and facts (Logg, Minson &amp; Moore, 2019).
        </p>
        <p style={rp.p}>
          Recent shopping research says the answer depends on context. A 2025 study in <em>Electronic Commerce Research</em>
          found consumers were more receptive to AI recommendations for <em>search</em> products (facts you can check) than
          for <em>experience</em> products (taste, feel, fit). Another, in the <em>Journal of Theoretical and Applied
          Electronic Commerce</em>, found that disclosing a recommendation was AI-curated can raise purchase intention in
          pleasure-driven shopping, partly because people perceive wider choice. And coverage of work by Liu, Yang and Li
          describes people following algorithmic advice more than identical human advice, but appreciating it less when the
          explanation of its accuracy became too complicated.
        </p>
        <Plain>
          People trust AI most for things they could check (a spec, a price, a comparison). They trust it least for
          things that are personal and taste-based, and for things where a mistake would cost them. That is why a
          person will let AI shortlist laptops and still call a friend before choosing a coach.
        </Plain>

        <h2 id="proof" style={rp.h2}>6. Proof: reviews, friends and machines</h2>
        <p style={rp.p}>
          Social proof is the oldest shortcut we have. We assume that if many others chose it, it must be fine. Reviews
          turned that into an industry. AI now summarises reviews, and the data shows people are not ready to let the
          summary replace the source: online reviews and friends still out-trust AI in the Alchemer data above.
        </p>
        <p style={rp.p}>
          This creates a new two-step shape of trust that I first saw in business buying. A machine proposes, a person
          confirms. In Gartner&rsquo;s 2026 research on 645 B2B buyers, 69 percent validated AI-generated insights with sales
          representatives. In consumer shopping the confirmer is a review, a friend, or the seller&rsquo;s own page. The machine
          gets you to the door. The human proof gets you through it.
        </p>
        <p style={rp.p}>
          There is a hidden risk in the middle. A fluent, confident machine can pass on a weak claim in a strong voice. If
          the sources it read were thin, its summary can sound more certain than the evidence deserves. The person who
          checks is doing real work. The person who does not is trusting fluency. That is the same trap I wrote about in
          the paper on critical thinking and AI.
        </p>

        <h2 id="delegate" style={rp.h2}>7. Delegation, regret and the last click</h2>
        <p style={rp.p}>
          The next frontier is not AI that advises but AI that buys. Companies call it agentic commerce: you tell an
          assistant what you want and it finds, compares and completes the purchase. McKinsey&rsquo;s Agentic Commerce
          Consumer Survey, fielded in June 2026 across 11 markets, found that about half of consumers now shop with AI,
          with US consumers behind the global average. But among US AI users, only 7 to 18 percent had actually completed a
          purchase with AI, depending on the category, with apparel leading.
        </p>
        <p style={rp.p}>
          In McKinsey&rsquo;s European work, 63 percent of respondents use AI tools to compare options and learn about
          products, and 56 percent are comfortable with AI suggesting options as long as the human makes the final call.
          Synchrony&rsquo;s May 2026 study of 2,000 US consumers found the same shape: AI is used most for research, and
          use falls the closer a person gets to paying. A BigCommerce and PayPal study of about 3,000 consumers in the US,
          UK and Australia found roughly two thirds interested in trying agentic shopping, but many unwilling to let AI
          complete a purchase without their approval.
        </p>

        <Figure n={2} caption={<>A sketch of the shape that several 2026 surveys describe: AI use is highest at discovery and comparison and falls toward payment. The bar heights are an illustration of the pattern, not measured values.</>}>
          <FigStages />
        </Figure>

        <p style={rp.p}>
          Why does use fall near the checkout? Three reasons from psychology. <strong style={rp.strong}>Loss aversion</strong>:
          paying is where the loss becomes real. <strong style={rp.strong}>Regret</strong>: if a human picks badly they
          blame themselves, and if a machine picks badly they are not sure whom to blame, which is worse. And
          <strong style={rp.strong}> agency</strong>: the final click is the moment we feel ownership of the choice, and
          people guard it.
        </p>
        <Plain>
          The pattern is stable: let the machine look, let the machine suggest, but let me press the button. Anyone
          building for this moment should treat that last click as a feature of the human mind, not a bug in the
          technology.
        </Plain>

        <h2 id="persuasion" style={rp.h2}>8. When the helper also persuades</h2>
        <p style={rp.p}>
          A shopping assistant is a persuader that looks like a helper. That is not an accusation. It is a structural
          fact, and the research on persuasion makes it worth saying clearly. In the large 2025 Science experiments on
          political persuasion, 76,977 people talked to 19 different AI models across 707 issues. The most persuasion-tuned
          model shifted opinions by up to about 25 percentage points, and the techniques that made models more persuasive
          also made them less accurate (Cornell Chronicle summary of the Science paper, December 2025).
        </p>
        <p style={rp.p}>
          Translate that to a shop. A model optimised to close sales could become very good at it, and in the same stroke
          less careful with the truth. A preprint from 2026 found that AI conversation lifted signing a real petition by
          more than 10 percentage points, with no clear link between how much attitudes moved and how much behaviour moved
          (arXiv 2604.09200). Its two versions quote different headline numbers, so I treat the size as provisional, but
          the lesson is useful: attitude and action can come apart, and a system tuned for action can ignore the attitude.
        </p>
        <p style={rp.p}>
          The related risk is <strong style={rp.strong}>offloading</strong>. If we let a machine do the comparing, we also
          let our own comparing muscles rest. A 2025 survey of 319 knowledge workers by Microsoft Research and Carnegie
          Mellon found that more confidence in AI went with less critical-thinking effort, though that is a correlation
          and not proof of cause (CHI 2025). In shopping, the practical danger is not a dramatic lie. It is a
          comfortable habit of not checking.
        </p>

        <h2 id="who" style={rp.h2}>9. Who is doing this: ages 25 to 55</h2>
        <p style={rp.p}>
          People between 25 and 55 are the centre of consumer spending: first homes, young families, career peaks,
          businesses started and scaled. They are also the group sitting right on the adoption line. Pew&rsquo;s split at age
          50 (57 percent of under-50s use ChatGPT, 28 percent of those 50 and over) means the younger half of this band is
          largely already using AI, and the older half is still crossing over.
        </p>
        <p style={rp.p}>
          I can describe, from the evidence, three likely shopper types in this group. I want to be careful here:
          these are hypotheses from published research, not segments I measured.
        </p>
        <ul style={{ margin: '0 0 22px', paddingLeft: 22 }}>
          <li style={rp.li}><strong style={rp.strong}>The delegator.</strong> Comfortable letting AI shortlist and even buy low-stakes items. Probably the youngest, busiest, most time-poor.</li>
          <li style={rp.li}><strong style={rp.strong}>The verifier.</strong> Uses AI for legwork, then checks reviews and asks people. This is what most surveys describe as the modal shopper today.</li>
          <li style={rp.li}><strong style={rp.strong}>The sceptic.</strong> Uses AI rarely, trusts friends and known brands, and treats confident machine answers as a reason to be more careful.</li>
        </ul>
        <p style={rp.p}>
          Whether these three types exist in the numbers I suggest, and how men and women differ among them, is a question
          for new data. I have not measured it here.
        </p>

        <h2 id="sellers" style={rp.h2}>10. What it means if you sell</h2>
        <p style={rp.p}>
          If AI shrinks the shortlist and humans verify the winner, selling becomes a two-part job: be chosen by the
          machine, then be confirmed by the human.
        </p>
        <ol style={{ margin: '0 0 22px', paddingLeft: 22 }}>
          <li style={rp.li}><strong style={rp.strong}>Be easy to describe accurately.</strong> State what you do, for whom, at what price, with what result, in plain words and specific numbers. Vague positioning is invisible to a machine that must summarise you in one sentence.</li>
          <li style={rp.li}><strong style={rp.strong}>Be easy to verify.</strong> Named people, real reviews, case results with dates, a guarantee that reads clearly. The human check is the conversion event now.</li>
          <li style={rp.li}><strong style={rp.strong}>Own the last mile.</strong> Make the step from &ldquo;the AI said you&rdquo; to a real human conversation as short as possible: a clear booking link, a direct answer to the first doubt.</li>
          <li style={rp.li}><strong style={rp.strong}>Do not game the machine or the buyer.</strong> The persuasion research shows persuasive and accurate can pull apart. A business that wins by overstating will lose at the verification step, where the human reads the truth.</li>
          <li style={rp.li}><strong style={rp.strong}>Measure the new door.</strong> Track how many visitors arrive from AI tools, and how they behave, separately from search. Adobe&rsquo;s data suggests they behave very differently.</li>
        </ol>
        <Plain>
          The winners will not be the loudest. They will be the clearest and the most checkable.
        </Plain>

        <h2 id="buyers" style={rp.h2}>11. What it means if you buy</h2>
        <ol style={{ margin: '0 0 22px', paddingLeft: 22 }}>
          <li style={rp.li}>Use AI for the legwork you could check: specs, prices, comparisons. Be warier where taste, fit or a big cost is involved.</li>
          <li style={rp.li}>Ask for the options it rejected and why. A shortlist is only as honest as its reasons.</li>
          <li style={rp.li}>Verify the one claim that would hurt most if false, in a second, independent place.</li>
          <li style={rp.li}>Notice fluency. If an answer feels wonderfully certain, that is the moment to slow down.</li>
          <li style={rp.li}>Keep the last click yours. The research suggests that is where regret lives.</li>
        </ol>

        <h2 id="limits" style={rp.h2}>12. What this paper cannot say</h2>
        <ul style={{ margin: '0 0 22px', paddingLeft: 22 }}>
          <li style={rp.li}><strong style={rp.strong}>It is a synthesis, not an experiment.</strong> I combined other people&rsquo;s data. I ran no survey of my own for this paper.</li>
          <li style={rp.li}><strong style={rp.strong}>Many sources are commercial.</strong> Adobe, Alchemer, G2, Synchrony and BigCommerce sell into this market. Their surveys can be well made and still lean in a direction that suits them.</li>
          <li style={rp.li}><strong style={rp.strong}>Surveys are not comparable.</strong> Trust was defined differently in each, so I show a range, not one number.</li>
          <li style={rp.li}><strong style={rp.strong}>Association is not cause.</strong> AI-referred shoppers may convert better because of who they are, not what the AI did.</li>
          <li style={rp.li}><strong style={rp.strong}>Mostly US and Europe.</strong> India and other markets are barely represented in the data I could find, and they may behave differently.</li>
          <li style={rp.li}><strong style={rp.strong}>This moves fast.</strong> Figures here are as of late November 2026. Two of them, the Adobe September figure and the petition preprint, I flag as provisional.</li>
        </ul>

        <h2 id="close" style={rp.h2}>13. The takeaway</h2>
        <p style={rp.p}>
          For decades, the economics of buying were built on one scarce thing: attention. Sellers fought to be seen. AI
          changes the scarce thing. Looking is now cheap. What is scarce is <em>trust</em>: the confidence to let a
          decision stand. The machine can gather and shrink. It cannot yet carry the feeling of being sure.
        </p>
        <p style={rp.p}>
          That is why I am not afraid for human judgement and not naive about it either. People are already doing the
          sensible thing: using the machine, then checking it. The seller who understands this builds for both steps. The
          buyer who understands it keeps the last click. And the researchers who understand it keep measuring, honestly,
          what is changing. I will keep measuring too.
        </p>

        <Divider />

        <h2 id="refs" style={rp.h2}>References</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          Studies and surveys are listed with what I used from each. Vendor surveys are marked. Where I relied on a
          summary and not the full report, I say so.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Adobe (2026, January). <em>Holiday shopping season drove a record $257.8 billion online with consumers embracing generative AI tools.</em> Adobe Analytics, vendor data. news.adobe.com/news/2026/01/adobe-holiday-shopping-season. AI traffic growth, conversion, time on site, pages per visit; revenue per visit from Adobe&rsquo;s earlier 2025 reporting.</p>
          <p style={refStyle}>Alchemer (2026). <em>Retail AI adoption outpaces consumer trust: 2026 retail report</em> (n=1,002 US shoppers). Vendor survey. alchemer.com/resources/benchmark-report/2026-retail-report-ai/</p>
          <p style={refStyle}>BCG (2026). <em>Consumers trust AI to buy; brands must adapt.</em> bcg.com/publications/2026/consumers-trust-ai-to-buy-better-brands-must-adapt. Used from a search summary.</p>
          <p style={refStyle}>BigCommerce and PayPal (2026). <em>What 3,000 consumers told us about the future of AI shopping.</em> Vendor survey. bigcommerce.com/blog/ai-shopping-research-report/</p>
          <p style={refStyle}>Cialdini, R. B. (1984). <em>Influence: The Psychology of Persuasion.</em> New York: Morrow.</p>
          <p style={refStyle}>Cornell Chronicle (2025, December). AI chatbots can effectively sway voters in either direction. news.cornell.edu/stories/2025/12/ai-chatbots-can-effectively-sway-voters-either-direction. Summary of the Science experiments (76,977 participants, 19 models, 707 issues).</p>
          <p style={refStyle}>Darby, M. R., &amp; Karni, E. (1973). Free competition and the optimal amount of fraud. <em>Journal of Law and Economics, 16</em>(1), 67–88.</p>
          <p style={refStyle}>Dietvorst, B. J., Simmons, J. P., &amp; Massey, C. (2015). Algorithm aversion: People erroneously avoid algorithms after seeing them err. <em>Journal of Experimental Psychology: General, 144</em>(1), 114–126.</p>
          <p style={refStyle}>Gartner (2026, May). B2B buyer survey, 645 buyers (fielded Aug to Sep 2025). Used for the finding that 69% validate AI-generated insights with sales representatives.</p>
          <p style={refStyle}>G2 (2026, March). Buyer behaviour survey, 1,076 B2B software buyers. Vendor survey.</p>
          <p style={refStyle}>IAB, as cited by eMarketer (2026). Consumer trust in generative AI and the path to purchase. emarketer.com/content/consumer-trust-genai-reshaping-path-purchase. Used from a summary.</p>
          <p style={refStyle}>Iyengar, S. S., &amp; Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? <em>Journal of Personality and Social Psychology, 79</em>(6), 995–1006.</p>
          <p style={refStyle}>Kahneman, D. (2011). <em>Thinking, Fast and Slow.</em> New York: Farrar, Straus and Giroux.</p>
          <p style={refStyle}>Lek Consulting (2026, April). Consumer AI shopping survey, 2,650 US consumers. lek.com/insights/consumer-products/thanks-ai-consumers-are-arriving-brand-and-retailer-sites-ready-buy. Used from a summary.</p>
          <p style={refStyle}>Lee, H.-P., Sarkar, A., Tankelevitch, L., Drosos, I., Rintel, S., Banks, R., &amp; Wilson, N. (2025). The impact of generative AI on critical thinking: Self-reported reductions in cognitive effort and confidence effects from a survey of knowledge workers. <em>CHI 2025</em> (Microsoft Research and Carnegie Mellon University; 319 workers, 936 examples).</p>
          <p style={refStyle}>Logg, J. M., Minson, J. A., &amp; Moore, D. A. (2019). Algorithm appreciation: People prefer algorithmic to human judgment. <em>Organizational Behavior and Human Decision Processes, 151</em>, 90–103.</p>
          <p style={refStyle}>Ma, Du, Wang &amp; Zhou (2026). Disclosure of AI-curated recommendations and purchase intention in hedonic contexts. <em>Journal of Theoretical and Applied Electronic Commerce Research, 21.</em> Used from an abstract.</p>
          <p style={refStyle}>McKinsey &amp; Company (2026). <em>Agentic Commerce Consumer Survey</em>, fielded June 2026 (11 markets); <em>From prompt to purchase</em> (mckinsey.com/featured-insights/charts/from-prompt-to-purchase); <em>AI to browse but not to buy</em> (mckinsey.com/featured-insights/week-in-charts/ai-to-browse-but-not-to-buy). Used from summaries.</p>
          <p style={refStyle}><em>Electronic Commerce Research</em> (2025). Study comparing AI with expert human agents for search and experience products. doi:10.1007/s10660-025-10048-6. Used from an abstract; authors not verified.</p>
          <p style={refStyle}>Nelson, P. (1970). Information and consumer behavior. <em>Journal of Political Economy, 78</em>(2), 311–329.</p>
          <p style={refStyle}>Pew Research Center (2026, June 17). <em>Americans and AI 2026</em> (survey of 5,119 US adults, Feb 17 to 23, 2026). pewresearch.org</p>
          <p style={refStyle}>Retail Dive (2026). Retail shoppers warm up to agentic AI purchases. retaildive.com/news/retail-shoppers-warm-up-agentic-ai-purchases/827563. Used from a summary.</p>
          <p style={refStyle}>Synchrony (2026, May). <em>AI in commerce study</em> (2,000 US consumers). synchrony.com/AI-in-commerce-study</p>
          <p style={refStyle}>Tversky, A., &amp; Kahneman, D. (1979). Prospect theory: An analysis of decision under risk. <em>Econometrica, 47</em>(2), 263–291.</p>
          <p style={refStyle}>Zeelenberg, M., &amp; Pieters, R. (2007). A theory of regret regulation 1.0. <em>Journal of Consumer Psychology, 17</em>(1), 3–18.</p>
          <p style={refStyle}>arXiv:2507.13919 (2025). Conversation versus static text persuasion experiment, UK. Preprint.</p>
          <p style={refStyle}>arXiv:2604.09200 (2026). Artificial intelligence can persuade people to take political actions. Preprint; headline figures differ between versions.</p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
