import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Eq, Divider, M, C } from '../ui'
import { FigProspect, FigCredence, FigTrust, FigFunnel } from '../figures'

const post = getPost('how-people-buy-expertise')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['abstract', 'Abstract'],
  ['rationale', '1. Background & rationale'],
  ['method', '2. Scope, objectives & method'],
  ['f0', '3. Findings'],
  ['f1', '3.1 A credence good'],
  ['f2', '3.2 Two systems decide'],
  ['f3', '3.3 Loss aversion & framing'],
  ['f4', '3.4 Reference prices & anchoring'],
  ['f5', '3.5 Trust, the master variable'],
  ['f6', '3.6 Social proof'],
  ['f7', '3.7 Authority & signaling'],
  ['f8', '3.8 Commitment & the deposit'],
  ['f9', '3.9 Choice architecture'],
  ['f10', '3.10 The cost of inaction'],
  ['f11', '3.11 Do these services work?'],
  ['model', '4. An integrated model'],
  ['discussion', '5. Discussion & implications'],
  ['limits', '6. Limitations'],
  ['conclusion', '7. Conclusion'],
  ['refs', 'References'],
]

/* Local reference list styling. */
const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      Every year, millions of people hand real money to coaches, consultants, advisors, and other experts, on a promise
      they cannot check first. I have always found that quietly amazing. So this report asks one simple question.
      <em> What really drives that choice?</em> And it answers not with opinion, but by pulling together fifty years of
      research, across behavior, marketing, and psychology, into one clear picture of how people buy expertise.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={<>I wanted to understand, properly and from the ground up, what actually makes a person decide to buy a coach, a consultant, or any expert whose value they cannot check in advance. So I spent a long stretch reading the science of how people decide, and pulling all of it into one picture I could trust, explain simply, and use.</>}>

        {/* Abstract */}
        <div id="abstract" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>Abstract</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            Buying an expert service is one of the least certain choices a person makes on a regular basis. With most
            things, you can judge quality before you buy, or at least after. Expertise is a <em>credence good</em>: its
            value is hard to judge even after you use it. This report gathers the research on how buyers get past that
            anyway. I organize it around eleven findings, from the credence-good problem and fast-versus-slow thinking to
            loss aversion, trust, social proof, signaling, small first steps, and the pull of doing nothing. Then I fold
            them into a simple five-stage model of the choice. It ends with the evidence on whether these services actually
            work, the line between persuasion and manipulation, and the honest limits of the research.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> credence goods · decision under uncertainty · prospect
            theory · trust · social proof · signaling · services marketing · coaching efficacy
          </p>
        </div>

        {/* 1 */}
        <h2 id="rationale" style={rp.h2}>1. Background and rationale</h2>
        <p style={rp.p}>
          Economists sort products by how easily you can judge them. Nelson (1970) named
          <strong style={rp.strong}> search goods</strong>, which you can judge before you buy, like a laptop’s specs. And
          <strong style={rp.strong}> experience goods</strong>, which you can only judge after you use them, like a meal at
          a new restaurant. Then Darby and Karni (1973) added a third, more unsettling kind:
          <strong style={rp.strong}> credence goods</strong>. These are hard to judge <em>even after</em> you use them,
          because you do not have the expertise to tell what you got, and you cannot run the do-over to see what would have
          happened instead.
        </p>
        <p style={rp.p}>
          A mechanic, a surgeon, a consultant, a coach. All of them sell credence goods. You might feel better after the
          coaching. But good luck telling how much of your later success was the coach, versus the market, versus your own
          effort, versus plain luck.
        </p>
        <p style={rp.p}>
          This sets up a deep problem that no amount of good intentions can fix. The buyer is in what Akerlof (1970) called
          a market for lemons. If you cannot tell good from bad up front, you lower what you will pay. That pushes the best
          providers to spend on expensive signals, and pushes some buyers out of the market for good. The research on
          credence goods (Dulleck and Kerschbamer, 2006) shows these markets only work when something holds the trust gap
          in check: reputation, a guarantee, proof, or plain trust.
        </p>
        <p style={rp.p}>
          So buying expertise is not a tidy value-for-money sum. It cannot be. It is a choice made in the dark, and it is
          ruled by the buyer trying to manage risk without the facts they would need. To understand it, you have to borrow
          from the science of how people decide under uncertainty. That science is huge. Yet it has rarely been gathered in
          one place around this one choice. That gap is what this report is for.
        </p>

        {/* 2 */}
        <h2 id="method" style={rp.h2}>2. Scope, objectives, and method</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>Objective.</strong> To identify, organize, and integrate the robust empirical findings
          that bear on the decision to buy a high-consideration expert service, and to state them as one coherent model.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Design.</strong> This pulls together existing research. It is not new lab data, and I
          want to be upfront about that. It draws on well-known work from four fields: how people decide (prospect theory,
          biases, mental accounting); marketing (credence goods, risk, signaling, word of mouth); the psychology of trust
          and social influence; and the research on whether coaching and advice actually work. I leaned on landmark
          experiments and big review studies over one-off papers. And where a once-famous finding later failed to hold up, I
          say so plainly in section 6, instead of quietly leaving it out.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Framing.</strong> The findings are laid out descriptively first, what governs the
          decision, followed in section 5 by what that means for both sides. Throughout, I treat the mechanisms as morally
          neutral instruments. The same trust dynamics that let an honest expert get chosen also let a dishonest one
          exploit a buyer, and that tension is one I come back to.
        </p>

        <Divider />

        {/* 3 */}
        <h2 id="f0" style={rp.h2}>3. Findings</h2>
        <p style={rp.p}>
          The eleven findings below move from the shape of the problem (why the decision is hard), through the mechanisms
          buyers use to get past it (how they decide anyway), to the evidence on outcomes (whether the decision was even
          justified). Each one is stated as a finding, backed by its evidence, and closed with a single-line implication.
        </p>

        {/* 3.1 */}
        <h3 id="f1" style={rp.h3}>3.1 Finding: expertise is a credence good, so buyers substitute proxies for quality</h3>
        <p style={rp.p}>
          The thing a buyer really cares about, will this expert actually help me, is invisible at the moment of sale. So
          buyers do not judge it. They cannot. Instead they judge <em>stand-ins</em> that seem to go with quality: how
          confident and smooth the provider is, how polished the materials look, testimonials, credentials, price, who
          referred them, and how much the provider feels like people they already trust. Zeithaml (1981) found that services
          like this push people toward exactly these stand-in cues, and toward personal sources over ads. The whole report
          hangs on one fact: <strong style={rp.strong}>the buyer is not buying the outcome. They are buying signals that
          predict the outcome.</strong> Everything after this just describes which signals win, and why.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: quality that is real but invisible does not sell; quality that is credibly signalled does.</p>
        <FigCredence />

        {/* 3.2 */}
        <h3 id="f2" style={rp.h3}>3.2 Finding: the decision is produced by two interacting systems, not one</h3>
        <p style={rp.p}>
          We think in two modes, an idea Kahneman (2011) gathered from decades of work (Stanovich and West, 2000; Evans,
          2008). One is fast, automatic, and feeling-driven. The other is slow, effortful, and careful. A high-stakes buy
          pulls on both. First a quick gut read of the provider, do I like and trust this person. Then a slower check, can I
          justify the cost.
        </p>
        <p style={rp.p}>
          Here is the part people underrate. The feeling usually comes first, and the reasoning shows up afterward to back
          it up. Haidt (2001) and Zajonc (1980) both point that way. Slovic and colleagues (2007) called it the
          <strong style={rp.strong}> affect heuristic</strong>: people judge risk and benefit from one quick good-or-bad
          feeling, and that single feeling pushes the benefit up and the risk down at the same time.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the felt sense of the provider is not a tiebreaker after the analysis; it is often the input the analysis defends.</p>

        {/* 3.3 */}
        <h3 id="f3" style={rp.h3}>3.3 Finding: losses loom larger than gains, so the decision is dominated by risk, not upside</h3>
        <p style={rp.p}>
          Prospect theory (Kahneman and Tversky, 1979; Tversky and Kahneman, 1992) is still the most robust descriptive
          account we have of choice under risk. People judge outcomes as gains and losses against a reference point, not as
          absolute levels of wealth, and the value function is steeper on the loss side than on the gain side. The
          subjective value of a prospect is:
        </p>
        <Eq label="prospect-theory value">
          V = Σ<sub>i</sub> π(p<sub>i</sub>) · v(x<sub>i</sub>)
        </Eq>
        <Eq label="value function (loss aversion)">
          v(x) = x<sup>α</sup> for x ≥ 0 ;  v(x) = −λ (−x)<sup>β</sup> for x &lt; 0 ,  λ ≈ 2.25 , 0 &lt; α, β &lt; 1
        </Eq>
        <FigProspect />
        <p style={rp.p}>
          In plain words: that <M>λ ≈ 2.25</M> means a possible loss hurts about twice as much as the same-size gain
          pleases. And people overweight small chances, which is why a vivid fear of being scammed can drown out a genuinely
          tiny risk. For the expertise buyer, the loss that looms is not just the fee. It is the <em>waste</em>: the money,
          the time, and the hope poured into something that did not work, plus the sting of feeling fooled. Because that
          loss counts about double, the choice is ruled far more by <strong style={rp.strong}>killing the downside</strong>
          {' '}than by growing the upside. That is why guarantees, refunds, small first steps, and plain proof of safety move
          buyers more than a bigger promise ever does.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: removing the fear of loss is worth roughly twice as much as adding to the promise of gain.</p>

        {/* 3.4 */}
        <h3 id="f4" style={rp.h3}>3.4 Finding: willingness to pay has no fixed anchor, it is constructed on the spot</h3>
        <p style={rp.p}>
          Buyers do not carry a fixed number for what a coach or consultant is worth. They build one on the spot, from
          whatever reference points are lying around. Tversky and Kahneman (1974) showed people latch onto random numbers,
          even ones they know are meaningless. Ariely, Loewenstein, and Prelec (2003) went further. What people would pay
          for ordinary goods could be shoved around by an anchor as random as the last two digits of their ID number. And
          yet, once that anchor was set, their later prices stayed consistent with it. Thaler (1985) adds the other half.
          Buyers judge a price against a reference, what they expected, what others charge, what the other option costs, and
          feel the gap itself as a win or a loss, apart from how useful the thing is.
        </p>
        <p style={rp.p}>
          For credence services this is close to decisive, because there is usually no obvious market reference to lean on.
          So the price starts doing double duty. It is a cost, yes, but in the absence of anything else it also becomes a
          <em> signal of quality</em> (see section 3.7). Work on price-quality inference (for example Rao and Monroe, 1989,
          in meta-analysis) finds that inference is strongest exactly when other quality cues are scarce, which is to say,
          under the credence condition.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the reference set a seller establishes largely determines whether a given fee feels like a bargain or a threat.</p>

        {/* 3.5 */}
        <h3 id="f5" style={rp.h3}>3.5 Finding: trust is the master variable, and it decomposes into ability, benevolence, and integrity</h3>
        <p style={rp.p}>
          If the buyer is really buying signals that predict an outcome they cannot check, then the one signal that ties
          them all together is trust. The most tested model (Mayer, Davis, and Schoorman, 1995) breaks trust into three
          parts: <strong style={rp.strong}>ability</strong> (are they actually good at this), <strong style={rp.strong}>benevolence</strong>
          {' '}(do they want good things for me, not just my money), and <strong style={rp.strong}>integrity</strong> (do
          they stick to principles I can live with). Trust is what lets the buyer take the risk. And the model is careful on
          one point: trust only leads to action when it clears the level of risk the situation demands.
        </p>
        <p style={rp.p}>
          Trust formation is well described as Bayesian updating from evidence. Writing <M>T</M> for trustworthiness and
          <M> e</M> for a piece of evidence (a testimonial, a free resource that genuinely helped, one small promise kept),
          the buyer’s confidence updates like this:
        </p>
        <Eq label="trust as belief updating">
          O(T | e) = [ P(e | T) ⁄ P(e | ¬T) ] · O(T)
        </Eq>
        <p style={rp.p}>
          In plain words: a piece of evidence moves trust in proportion to how hard it would be to fake. Evidence a
          low-quality provider could not easily fake, a specific, checkable result, a genuinely useful free diagnosis, a
          willingness to say honestly, you are not a fit, moves trust a lot. Evidence anyone can produce, generic claims, a
          bit of self-praise, barely moves it. That is the real reason costly, hard-to-fake signals win. It is the same
          logic that comes back as signaling in section 3.7.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: trust is built fastest by supplying evidence a dishonest provider could not afford to supply.</p>
        <FigTrust />

        {/* 3.6 */}
        <h3 id="f6" style={rp.h3}>3.6 Finding: under uncertainty, people substitute the crowd’s judgment for their own</h3>
        <p style={rp.p}>
          When buyers cannot judge quality themselves, they look at what people like them did. Cialdini (2006) called this
          <strong style={rp.strong}> social proof</strong>. It is strongest under the exact conditions of an expertise buy:
          uncertainty, plus similarity. And it has been shown to actually cause behaviour, not just go with it, which is
          rarer than you would think. Salganik, Dodds, and Watts (2006) ran an online music market with more than 14,000
          people. Simply showing how many others had downloaded a song changed everything. The same song could become a hit
          or a flop, based only on the early, partly random picks of the people who came first. Quality set the outer
          limits. Social influence decided almost everything inside them.
        </p>
        <p style={rp.p}>
          In actual commerce, Chevalier and Mayzlin (2006) found that when a book’s reviews improved at one retailer
          relative to another, its relative sales rose, and that negative reviews moved sales more than positive ones,
          social proof quietly inheriting the loss-aversion asymmetry from section 3.3. And the pull is not purely
          informational. Berger’s (2016) synthesis shows observational influence works even when the observer knows nothing
          about why the others chose as they did.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: visible evidence of similar others choosing (and benefiting) is among the most powerful cues available, and its absence is read as a warning.</p>

        {/* 3.7 */}
        <h3 id="f7" style={rp.h3}>3.7 Finding: credentials and costly displays work because they are signals, not information</h3>
        <p style={rp.p}>
          Spence’s (1973) signaling theory explains why buyers lean on markers like credentials, track records, published
          work, even an expensive-looking office. A signal only separates high-quality providers from low-quality ones if
          it is <em>differentially costly</em>, cheaper for the good type to produce than the bad type. Formally, a
          separating equilibrium needs the signal cost <M>c</M> of an effort level <M>s</M> to satisfy:
        </p>
        <Eq label="separating equilibrium (signaling)">
          c<sub>low</sub>(s) &gt; Δ ≥ c<sub>high</sub>(s)
        </Eq>
        <p style={rp.p}>
          In plain words: a signal only works if it is cheap for a good provider and painful for a bad one. A real
          multi-year track record, a body of public teaching, a specific checkable result, these are costly or impossible
          for a weak provider to fake. So they carry weight. A bare claim of being great is cheap for anyone to say, so
          smart buyers ignore it, and they are right to. This also solves a puzzle: why giving away real value for free, a
          genuinely useful diagnosis, tool, or lesson, tends to win more clients, not fewer. The give-away is itself a
          costly signal. It shows the provider has expertise to spare, and a weak one cannot copy it without exposing
          themselves.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the persuasive value of a signal is proportional to how hard it would be for a bad provider to produce it.</p>

        {/* 3.8 */}
        <h3 id="f8" style={rp.h3}>3.8 Finding: small initial commitments and pre-payments change subsequent behavior</h3>
        <p style={rp.p}>
          Two well-documented mechanisms make a small first step matter far more than its size suggests. Freedman and
          Fraser (1966) showed the <strong style={rp.strong}>foot-in-the-door</strong> effect: agreeing to a small request
          sharply raises the odds of agreeing to a bigger one later, driven by a need to stay consistent with yourself
          (Cialdini, 2006). Separately, Gourville and Soman (1998) documented
          <strong style={rp.strong}> payment depreciation</strong>: the felt cost of a payment fades with time, so when you
          pay relative to when you consume reshapes both attendance and satisfaction. Gym members who paid annually showed
          up in bursts right around each payment and drifted off in between, while those who paid more often showed up more
          steadily. The felt sunk cost, it turns out, drives usage.
        </p>
        <p style={rp.p}>
          For the expertise transaction, a small, refundable, or even symbolic first commitment (a paid diagnostic, a
          deposit, a low-priced first product) does three things at once. It turns an abstract intention into a concrete
          act. It recruits the consistency motive toward the bigger decision. And because even a tiny payment creates a
          sunk cost, it raises the odds the buyer actually shows up and engages, which, per section 3.11, is a precondition
          for the service working at all. The same instrument can be used to honestly qualify and commit a serious buyer,
          or abused to ratchet commitment out of an unsuitable one. The mechanism does not care which. We should.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: a small paid step is simultaneously a filter, a consistency lever, and a predictor of follow-through.</p>

        {/* 3.9 */}
        <h3 id="f9" style={rp.h3}>3.9 Finding: the structure of the options shapes the choice as much as the options themselves</h3>
        <p style={rp.p}>
          The choice depends on how the options are set up. Three effects are well known. The
          <strong style={rp.strong}> compromise effect</strong> (Simonson and Tversky, 1992): add a high, pricey option and
          the middle one gets picked more, because the extremes feel risky. The
          <strong style={rp.strong}> decoy effect</strong> (Huber, Payne, and Puto, 1982): add an option clearly worse than
          one choice but not the other, and people shift toward the one that beats it. And
          <strong style={rp.strong}> choice overload</strong>: Iyengar and Lepper (2000) found shoppers shown 24 jams were
          far less likely to buy than shoppers shown 6, about 3 percent versus 30 percent, which suggests too many options
          can freeze the decision. Although, and this matters, that last effect turns out to be shakier than it first
          looked, which I get into in section 6.
        </p>
        <p style={rp.p}>
          For expert services, the takeaway is that how you frame the packages, how many, at what prices, with what
          default, materially changes what people pick, more or less independently of their underlying preferences. A
          well-formed set of options walks an uncertain buyer to a confident yes. An overloaded or manipulatively built set
          either freezes them or steers them somewhere they should not go.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: presenting fewer, well-contrasted options generally produces more (and more confident) decisions than presenting many.</p>

        {/* 3.10 */}
        <h3 id="f10" style={rp.h3}>3.10 Finding: the strongest competitor is inaction, which is protected by powerful biases</h3>
        <p style={rp.p}>
          The default outcome of any uncertain choice is to do nothing, and a whole set of biases guards that default.
          Samuelson and Zeckhauser (1988) named <strong style={rp.strong}>status-quo bias</strong>, sticking with the
          current state well past the point of reason. Kahneman, Knetsch, and Thaler (1991) tied it to the
          <strong style={rp.strong}> endowment effect</strong> and loss aversion, since giving up what you have feels like a
          loss. And Ritov and Baron (1990) named <strong style={rp.strong}>omission bias</strong>, our habit of preferring
          harm that comes from doing nothing over equal or smaller harm that comes from doing something, because action
          feels more like our fault. Put together, the buyer fears the vivid, blameable risk of a bad <em>buy</em> far more
          than the dull, easy-to-ignore risk of a bad <em>staying-put</em>.
        </p>
        <p style={rp.p}>
          The counterweight the literature points to is making the cost of inaction concrete and present, not abstract and
          far off. Rogers’s (1975) protection-motivation theory shows behavior change depends jointly on perceived
          severity, perceived vulnerability, and, crucially, on <em>response efficacy</em> and <em>self-efficacy</em>. Fear
          with no credible, doable path attached produces avoidance, not action. Which is why naming the real cost of
          staying stuck only works when it is paired with a believable, low-risk first step.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the buyer’s real alternative is not a competitor but doing nothing; that option must be made to feel like the risky one.</p>

        {/* 3.11 */}
        <h3 id="f11" style={rp.h3}>3.11 Finding: the outcome literature says expert help works, conditionally</h3>
        <p style={rp.p}>
          A report on how people buy expertise would feel hollow, and a bit dishonest, if it never asked whether the buy is
          even worth it. The best evidence comes from coaching, where real review studies now exist. Theeboom, Beersma, and
          van Vianen (2014) pooled 18 studies and found coaching helped performance, well-being, coping, work attitudes, and
          self-control, with small-to-medium effects. Jones, Woods, and Guillaume (2016) pooled 17 workplace studies and
          also found a positive effect. Sonesh et al. (2015) landed in the same place. The effects are real but modest.
          And, importantly, the research keeps pointing at the <em>client’s own effort and commitment</em>, not just the
          coach, as a main driver, which fits self-determination theory (Deci and Ryan, 2000): people change and stick with
          it when they feel ownership, growing skill, and connection.
        </p>
        <p style={rp.p}>
          So the honest read is neither cynical nor starry-eyed. Expert help produces genuine, measurable gains on average.
          The gains are also moderate, uneven, and conditional on the buyer actually doing the work. That connects straight
          back to section 3.8: instruments that increase real commitment and follow-through are not only persuasion, they
          raise the odds the service works, and that outcome is the only durable foundation the whole trust system rests
          on.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the service is most likely to deliver when the sale itself selects for, and secures, a committed and suitable client.</p>

        <Divider />

        {/* 4 */}
        <h2 id="model" style={rp.h2}>4. Toward an integrated model of the expertise purchase</h2>
        <p style={rp.p}>
          The eleven findings are not really independent. They line up into a sequence. Put them together and you get a
          five-stage model, in which the buyer travels from an unresolved problem to a committed decision by slowly turning
          uncertainty into trust, and trust into justified action.
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>Problem recognition and reference-point setting.</strong> A felt gap between where things are and where the buyer wants them becomes salient. Loss aversion and status-quo bias (sections 3.3, 3.10) argue for doing nothing, and the reference point that everything else gets judged against is set right here.</li>
          <li style={rp.li}><strong style={rp.strong}>Affective appraisal of the provider.</strong> A fast System 1 read (section 3.2) forms an early trust impression along the ability, benevolence, and integrity dimensions (section 3.5), often before any real deliberation.</li>
          <li style={rp.li}><strong style={rp.strong}>Proxy evaluation under the credence constraint.</strong> Unable to assess quality directly (section 3.1), the buyer weighs the observable signals, social proof (section 3.6), costly signals and credentials (section 3.7), price as a quality cue (section 3.4), and updates trust in a roughly Bayesian way (section 3.5).</li>
          <li style={rp.li}><strong style={rp.strong}>Risk resolution.</strong> The buyer weighs perceived trust against perceived risk. The de-risking instruments, guarantees, small or refundable first commitments (section 3.8), well-formed option sets (section 3.9), do most of the heavy lifting here, because loss looms larger than gain (section 3.3).</li>
          <li style={rp.li}><strong style={rp.strong}>Commitment and justification.</strong> A first action, usually a small payment, recruits consistency and sunk-cost dynamics (section 3.8), System 2 assembles a justification for the decision the gut already reached, and follow-through, the precondition for the service actually working (section 3.11), gets set in motion.</li>
        </ol>
        <FigFunnel />
        <p style={rp.p}>
          A compact way to write the decision rule at the pivot, stage 4, is that the buyer acts when perceived trust, net
          of the risk the situation demands, turns the subjectively weighted prospect positive:
        </p>
        <Eq label="the buy condition">
          buy  ⟺  V<sub>gain</sub> · Trust  −  λ · V<sub>loss</sub> · (1 − Trust)  &gt;  V<sub>status-quo</sub>
        </Eq>
        <p style={rp.p}>
          In plain words: the loss side counts more than twice the gain side. It is a rough summary, not a fitted formula,
          and I would not over-read it. But it captures the whole report in one line. Because the loss counts double,
          <strong style={rp.strong}> raising trust and cutting risk are the two big levers</strong>, and the real competitor
          is the buyer doing nothing.
        </p>

        {/* 5 */}
        <h2 id="discussion" style={rp.h2}>5. Discussion and implications</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>For buyers,</strong> the model is a checklist against your own biases. If your choice is
          being driven by a fast gut read, by a price someone else anchored, by raw social proof, or by fear with no real
          path out, those are exactly the things easiest to fake. The safe move is to ask how hard the evidence would be to
          fake. Ask for the signals a weak provider could not: a specific, checkable result, a genuinely useful free
          diagnosis, a provider willing to tell you no. Treat anything cheap to produce as close to noise.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>For providers,</strong> the same findings point to a strategy that is both ethical and,
          as it happens, effective. Because results depend on the client’s own effort (section 3.11), your interest and the
          buyer’s line up best when the sale <em>picks for fit and locks in commitment</em>, instead of chasing every sale
          at any cost. Qualify people honestly. Show costly, hard-to-fake proof of real skill. Reverse risk with a
          guarantee you actually mean. Use a small first step to filter and to bind. Offer a small, clear set of options.
          Every one of those comes straight from a finding above. And every one is a fair answer to the buyer’s real
          problem: handling uncertainty about something they cannot check.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>The ethical line.</strong> Every tool in section 3 cuts both ways, and pretending
          otherwise would be dishonest. Social proof can be faked. Scarcity can be staged. A small commitment can be used to
          push someone deeper against their interest. Fear can be cranked up with no real way out offered. So where is the
          line between persuasion and manipulation? One test. Does the influence make the buyer’s judgment
          <em> more accurate</em> about a choice that truly serves them, or <em>less</em>? Giving honest, hard-to-fake
          evidence that helps a good-fit buyer choose well is persuasion. Giving cheap, fake cues that push a bad-fit buyer
          against their own interest is manipulation. The tools are the same. The honesty, and the fit, are what differ.
        </p>

        {/* 6 */}
        <h2 id="limits" style={rp.h2}>6. Limitations</h2>
        <p style={rp.p}>
          Three limits apply, and I would rather name them than hide them. First, this
          <strong style={rp.strong}> pulls together existing research</strong>. It does not test one new model end to end on
          this exact buy. Second, a lot of the research rests on <strong style={rp.strong}>WEIRD samples</strong> (Western,
          educated, rich, industrial countries; Henrich, Heine, and Norenzayan, 2010) and on lab settings, so it may not
          carry over to every culture. Third, and most important, some once-famous effects have
          <strong style={rp.strong}> failed to hold up</strong>. Ego-depletion largely failed to replicate. Several priming
          results did not survive. And choice overload, which I used in section 3.9, is not universal. Scheibehenne,
          Greifeneder, and Todd (2010) pooled the studies and found an average effect near zero, depending on things like
          the person and how hard the choice was. I have flagged these as they came up. The solid core I lean on, loss
          aversion, reference points, the trust model, signaling, and the social-proof experiments, has held up well. But
          treat the shakier bits (specific choice tricks, priming) as unsettled.
        </p>

        {/* 7 */}
        <h2 id="conclusion" style={rp.h2}>7. Conclusion</h2>
        <p style={rp.p}>
          People do not buy expertise the way they buy a laptop, because they cannot. The main thing you are paying for is
          invisible. So the choice stops being a value-for-money sum and becomes a struggle to handle uncertainty under the
          shadow of loss. Buyers swap in stand-ins for the outcome they cannot see. They lean on a fast gut read, then
          justify it. They fear a wasted, regretted loss more than they want a gain. They build a price out of whatever
          reference points are around. And above all, they run the whole choice through trust, updating it from evidence
          in proportion to how hard that evidence would be to fake. Social proof, credentials, costly signals, small
          binding steps, clear choices, these are the tools that burn off the uncertainty. And the strongest competitor,
          start to finish, is not a rival provider. It is the well-guarded option of doing nothing.
        </p>
        <p style={rp.p}>
          There is one last thing worth saying, because it surprised me a little as the pieces came together. Since the
          outcome research says these services work conditionally, on the buyer’s own commitment, the interests of an
          honest seller and a suitable buyer are not really opposed. They point the same way. The very instruments that
          most effectively resolve the buyer’s uncertainty, diagnostic evidence, real risk reversal, honest qualification,
          a committing first step, are also the ones that most raise the odds the service actually delivers. Read carefully,
          the science of how people buy expertise turns out to be, more or less, a description of how to sell it honestly.
        </p>

        <Divider />

        {/* References */}
        <h2 id="refs" style={rp.h2}>References</h2>
        <div style={{ margin: '4px 0 0' }}>
          <p style={refStyle}>Akerlof, G. A. (1970). The market for “lemons”: Quality uncertainty and the market mechanism. <em>Quarterly Journal of Economics, 84</em>(3), 488–500.</p>
          <p style={refStyle}>Ariely, D., Loewenstein, G., &amp; Prelec, D. (2003). “Coherent arbitrariness”: Stable demand curves without stable preferences. <em>Quarterly Journal of Economics, 118</em>(1), 73–106.</p>
          <p style={refStyle}>Berger, J. (2016). <em>Invisible Influence: The Hidden Forces That Shape Behavior.</em> Simon &amp; Schuster.</p>
          <p style={refStyle}>Chevalier, J. A., &amp; Mayzlin, D. (2006). The effect of word of mouth on sales: Online book reviews. <em>Journal of Marketing Research, 43</em>(3), 345–354.</p>
          <p style={refStyle}>Cialdini, R. B. (2006). <em>Influence: The Psychology of Persuasion</em> (rev. ed.). Harper Business.</p>
          <p style={refStyle}>Darby, M. R., &amp; Karni, E. (1973). Free competition and the optimal amount of fraud. <em>Journal of Law and Economics, 16</em>(1), 67–88.</p>
          <p style={refStyle}>Deci, E. L., &amp; Ryan, R. M. (2000). The “what” and “why” of goal pursuits: Human needs and the self-determination of behavior. <em>Psychological Inquiry, 11</em>(4), 227–268.</p>
          <p style={refStyle}>Dulleck, U., &amp; Kerschbamer, R. (2006). On doctors, mechanics, and computer specialists: The economics of credence goods. <em>Journal of Economic Literature, 44</em>(1), 5–42.</p>
          <p style={refStyle}>Evans, J. St. B. T. (2008). Dual-processing accounts of reasoning, judgment, and social cognition. <em>Annual Review of Psychology, 59</em>, 255–278.</p>
          <p style={refStyle}>Festinger, L. (1954). A theory of social comparison processes. <em>Human Relations, 7</em>(2), 117–140.</p>
          <p style={refStyle}>Freedman, J. L., &amp; Fraser, S. C. (1966). Compliance without pressure: The foot-in-the-door technique. <em>Journal of Personality and Social Psychology, 4</em>(2), 195–202.</p>
          <p style={refStyle}>Gourville, J. T., &amp; Soman, D. (1998). Payment depreciation: The behavioral effects of temporally separating payments from consumption. <em>Journal of Consumer Research, 25</em>(2), 160–174.</p>
          <p style={refStyle}>Haidt, J. (2001). The emotional dog and its rational tail: A social intuitionist approach to moral judgment. <em>Psychological Review, 108</em>(4), 814–834.</p>
          <p style={refStyle}>Henrich, J., Heine, S. J., &amp; Norenzayan, A. (2010). The weirdest people in the world? <em>Behavioral and Brain Sciences, 33</em>(2–3), 61–83.</p>
          <p style={refStyle}>Huber, J., Payne, J. W., &amp; Puto, C. (1982). Adding asymmetrically dominated alternatives: Violations of regularity and the similarity hypothesis. <em>Journal of Consumer Research, 9</em>(1), 90–98.</p>
          <p style={refStyle}>Iyengar, S. S., &amp; Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing? <em>Journal of Personality and Social Psychology, 79</em>(6), 995–1006.</p>
          <p style={refStyle}>Jones, R. J., Woods, S. A., &amp; Guillaume, Y. R. F. (2016). The effectiveness of workplace coaching: A meta-analysis of learning and performance outcomes. <em>Journal of Occupational and Organizational Psychology, 89</em>(2), 249–277.</p>
          <p style={refStyle}>Kahneman, D. (2011). <em>Thinking, Fast and Slow.</em> Farrar, Straus and Giroux.</p>
          <p style={refStyle}>Kahneman, D., Knetsch, J. L., &amp; Thaler, R. H. (1991). Anomalies: The endowment effect, loss aversion, and status quo bias. <em>Journal of Economic Perspectives, 5</em>(1), 193–206.</p>
          <p style={refStyle}>Kahneman, D., &amp; Tversky, A. (1979). Prospect theory: An analysis of decision under risk. <em>Econometrica, 47</em>(2), 263–291.</p>
          <p style={refStyle}>Mayer, R. C., Davis, J. H., &amp; Schoorman, F. D. (1995). An integrative model of organizational trust. <em>Academy of Management Review, 20</em>(3), 709–734.</p>
          <p style={refStyle}>Nelson, P. (1970). Information and consumer behavior. <em>Journal of Political Economy, 78</em>(2), 311–329.</p>
          <p style={refStyle}>Rao, A. R., &amp; Monroe, K. B. (1989). The effect of price, brand name, and store name on buyers’ perceptions of product quality. <em>Journal of Marketing Research, 26</em>(3), 351–357.</p>
          <p style={refStyle}>Ritov, I., &amp; Baron, J. (1990). Reluctance to vaccinate: Omission bias and ambiguity. <em>Journal of Behavioral Decision Making, 3</em>(4), 263–277.</p>
          <p style={refStyle}>Rogers, R. W. (1975). A protection motivation theory of fear appeals and attitude change. <em>Journal of Psychology, 91</em>(1), 93–114.</p>
          <p style={refStyle}>Salganik, M. J., Dodds, P. S., &amp; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. <em>Science, 311</em>(5762), 854–856.</p>
          <p style={refStyle}>Samuelson, W., &amp; Zeckhauser, R. (1988). Status quo bias in decision making. <em>Journal of Risk and Uncertainty, 1</em>(1), 7–59.</p>
          <p style={refStyle}>Scheibehenne, B., Greifeneder, R., &amp; Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. <em>Journal of Consumer Research, 37</em>(3), 409–425.</p>
          <p style={refStyle}>Simonson, I., &amp; Tversky, A. (1992). Choice in context: Tradeoff contrast and extremeness aversion. <em>Journal of Marketing Research, 29</em>(3), 281–295.</p>
          <p style={refStyle}>Slovic, P., Finucane, M. L., Peters, E., &amp; MacGregor, D. G. (2007). The affect heuristic. <em>European Journal of Operational Research, 177</em>(3), 1333–1352.</p>
          <p style={refStyle}>Sonesh, S. C., Coultas, C. W., Lacerenza, C. N., Marlow, S. L., Benishek, L. E., &amp; Salas, E. (2015). The power of coaching: A meta-analytic investigation. <em>Coaching: An International Journal of Theory, Research and Practice, 8</em>(2), 73–95.</p>
          <p style={refStyle}>Spence, M. (1973). Job market signaling. <em>Quarterly Journal of Economics, 87</em>(3), 355–374.</p>
          <p style={refStyle}>Stanovich, K. E., &amp; West, R. F. (2000). Individual differences in reasoning: Implications for the rationality debate? <em>Behavioral and Brain Sciences, 23</em>(5), 645–665.</p>
          <p style={refStyle}>Thaler, R. (1985). Mental accounting and consumer choice. <em>Marketing Science, 4</em>(3), 199–214.</p>
          <p style={refStyle}>Theeboom, T., Beersma, B., &amp; van Vianen, A. E. M. (2014). Does coaching work? A meta-analysis on the effects of coaching on individual level outcomes in an organizational context. <em>Journal of Positive Psychology, 9</em>(1), 1–18.</p>
          <p style={refStyle}>Tversky, A., &amp; Kahneman, D. (1974). Judgment under uncertainty: Heuristics and biases. <em>Science, 185</em>(4157), 1124–1131.</p>
          <p style={refStyle}>Tversky, A., &amp; Kahneman, D. (1992). Advances in prospect theory: Cumulative representation of uncertainty. <em>Journal of Risk and Uncertainty, 5</em>(4), 297–323.</p>
          <p style={refStyle}>Zajonc, R. B. (1980). Feeling and thinking: Preferences need no inferences. <em>American Psychologist, 35</em>(2), 151–175.</p>
          <p style={refStyle}>Zeithaml, V. A. (1981). How consumer evaluation processes differ between goods and services. In <em>Marketing of Services</em> (pp. 186–190). American Marketing Association.</p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
