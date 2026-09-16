import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Eq, Divider, M, C } from '../ui'
import { FigProspect, FigCredence, FigTrust, FigFunnel } from '../figures'

const post = getPost('how-people-buy-expertise')!

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
  '@type': 'ScholarlyArticle',
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
      Every year, millions of people hand significant sums to coaches, consultants, advisors, therapists, and other
      experts on the basis of a promise they cannot verify in advance. This report asks a deceptively simple question —
      <em> what actually governs that decision?</em> — and answers it not with opinion but by synthesizing five decades
      of peer-reviewed findings across behavioral economics, services marketing, and psychology into a single, testable
      account of the expertise purchase.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead}>

        {/* Abstract */}
        <div id="abstract" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>Abstract</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            The purchase of expert services is among the highest-uncertainty transactions an individual routinely makes.
            Unlike goods whose quality can be inspected before or even after purchase, expertise is a <em>credence good</em>:
            its value is difficult to evaluate even after it is consumed. This report synthesizes the empirical literature
            on how buyers resolve that uncertainty. We organize the evidence around eleven findings — the credence-good
            evaluation problem, dual-process decision-making, loss aversion, reference-price formation, the tripartite
            model of trust, social proof, quality signaling, commitment and pre-payment, choice architecture, and the
            psychology of inaction — and then integrate them into a five-stage model of the decision. We conclude with the
            evidence on whether these services actually produce the outcomes they promise, the ethical line between
            persuasion and manipulation, and the limitations of the underlying literature, including replication concerns.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> credence goods · decision under uncertainty · prospect
            theory · trust · social proof · signaling · services marketing · coaching efficacy
          </p>
        </div>

        {/* 1 */}
        <h2 id="rationale" style={rp.h2}>1. Background and rationale</h2>
        <p style={rp.p}>
          Economists classify products by how easily a buyer can judge their quality. Nelson (1970) distinguished
          <strong style={rp.strong}> search goods</strong>, whose quality can be assessed before purchase (a laptop’s
          specifications), from <strong style={rp.strong}>experience goods</strong>, whose quality is revealed only through
          consumption (a meal at a new restaurant). Darby and Karni (1973) added a third and more troubling category:
          <strong style={rp.strong}> credence goods</strong>, whose quality is hard to judge <em>even after</em>
          consumption, because the buyer lacks the expertise to evaluate what was delivered and cannot run the
          counterfactual of what would have happened otherwise. A car mechanic, a surgeon, a management consultant, and a
          business coach all sell credence goods. You may feel better after the coaching, but you cannot easily isolate
          how much of your subsequent success was the coach, the market, your own effort, or regression to the mean.
        </p>
        <p style={rp.p}>
          This creates a structural problem that no amount of good intention on the seller’s side dissolves. The buyer
          faces what Akerlof (1970) called a market for lemons: unable to distinguish high quality from low quality
          <em> ex ante</em>, rational buyers discount what they will pay, which drives the best providers toward costly
          signals and drives some buyers out of the market entirely. The economics of credence goods (Dulleck and
          Kerschbamer, 2006) show that such markets can function only when specific institutions — reputation, liability,
          verifiability, or trust — are present to discipline the information asymmetry.
        </p>
        <p style={rp.p}>
          The practical consequence is that the decision to buy expertise is not, and cannot be, a straightforward
          value-for-money calculation. It is a decision made under deep uncertainty, dominated by the buyer’s attempt to
          manage risk in the absence of verifiable information. Understanding it therefore requires the branches of
          science that study judgment under uncertainty — and that literature, though vast, has rarely been assembled in
          one place around this specific transaction. That is the gap this report addresses.
        </p>

        {/* 2 */}
        <h2 id="method" style={rp.h2}>2. Scope, objectives, and method</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>Objective.</strong> To identify, organize, and integrate the robust empirical findings
          that bear on the decision to purchase a high-consideration expert service, and to express them as a single
          coherent model.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Design.</strong> This is an integrative evidence synthesis, not a report of new
          primary data. It draws on foundational and highly-cited work across four literatures: behavioral economics and
          judgment-and-decision-making (prospect theory, heuristics and biases, mental accounting); services and consumer
          marketing (credence goods, perceived risk, quality signaling, word of mouth); the psychology of trust and social
          influence; and the outcome literature on coaching and advisory effectiveness. Priority was given to seminal
          experiments, replicated effects, and quantitative meta-analyses over single studies, and — where a once-canonical
          finding has failed to replicate — that is stated explicitly in §6 rather than quietly omitted.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Framing.</strong> Findings are presented descriptively (what governs the decision),
          followed in §5 by normative implications for both sides of the transaction. Throughout, we treat the mechanisms
          as morally neutral instruments: the same trust dynamics that let an honest expert be chosen also let a dishonest
          one exploit a buyer, a tension we return to directly.
        </p>

        <Divider />

        {/* 3 */}
        <h2 id="f0" style={rp.h2}>3. Findings</h2>
        <p style={rp.p}>
          The eleven findings below move from the structure of the problem (why the decision is hard) through the
          mechanisms buyers use to resolve it (how they decide anyway) to the evidence on outcomes (whether the decision
          is justified). Each is stated as a finding, supported by its evidence, and closed with a one-line implication.
        </p>

        {/* 3.1 */}
        <h3 id="f1" style={rp.h3}>3.1 Finding: expertise is a credence good, so buyers substitute proxies for quality</h3>
        <p style={rp.p}>
          Because the core attribute — will this expert actually improve my outcome? — is unobservable at the point of
          sale, buyers do not evaluate it directly. They evaluate <em>observable proxies</em> correlated, rightly or
          wrongly, with quality: the confidence and fluency of the provider, the polish of their materials, testimonials,
          credentials, price, referral source, and the perceived similarity of the provider to people the buyer already
          trusts. Zeithaml (1981) documented that services high in credence qualities push consumers toward exactly these
          surrogate cues and toward personal sources of information over impersonal ones. The central implication of the
          entire report follows from this single fact: <strong style={rp.strong}>the buyer is not buying the outcome; the
          buyer is buying a set of signals that predict the outcome.</strong> Every subsequent finding is a description of
          which signals dominate and why.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: quality that is real but invisible does not sell; quality that is credibly signalled does.</p>
        <FigCredence />

        {/* 3.2 */}
        <h3 id="f2" style={rp.h3}>3.2 Finding: the decision is produced by two interacting systems, not one</h3>
        <p style={rp.p}>
          Dual-process theories, consolidated by Kahneman (2011) from decades of work (Stanovich and West, 2000; Evans,
          2008), distinguish a fast, automatic, affect-driven mode of judgment (System 1) from a slow, effortful,
          deliberative mode (System 2). High-uncertainty purchases engage both: an immediate affective read of the
          provider (do I like and trust this person?) and a subsequent rationalization (can I justify this expense?).
          Crucially, the evidence indicates the affective response frequently comes first and the reasoning is recruited to
          support it — Haidt’s (2001) social-intuitionist work and Zajonc’s (1980) demonstration that affective reactions
          can precede and shape cognition both point the same way. Slovic and colleagues (2007) formalized this as the
          <strong style={rp.strong}> affect heuristic</strong>: people judge risks and benefits by consulting a rapid
          feeling of good-or-bad, and that feeling drives both perceived benefit (up) and perceived risk (down) together.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the felt sense of the provider is not a tiebreaker after the analysis; it is often the input the analysis defends.</p>

        {/* 3.3 */}
        <h3 id="f3" style={rp.h3}>3.3 Finding: losses loom larger than gains, so the decision is dominated by risk, not upside</h3>
        <p style={rp.p}>
          Prospect theory (Kahneman and Tversky, 1979; Tversky and Kahneman, 1992) is the most robust descriptive account
          of choice under risk. People evaluate outcomes as gains and losses relative to a reference point, not as absolute
          states of wealth, and the value function is steeper for losses than for equivalent gains. The subjective value of
          a prospect is:
        </p>
        <Eq label="prospect-theory value">
          V = Σ<sub>i</sub> π(p<sub>i</sub>) · v(x<sub>i</sub>)
        </Eq>
        <Eq label="value function (loss aversion)">
          v(x) = x<sup>α</sup> for x ≥ 0 ;  v(x) = −λ (−x)<sup>β</sup> for x &lt; 0 ,  λ ≈ 2.25 , 0 &lt; α, β &lt; 1
        </Eq>
        <FigProspect />
        <p style={rp.p}>
          The coefficient <M>λ ≈ 2.25</M> means a prospective loss is felt roughly twice as intensely as an equivalent
          gain, and the probability-weighting function <M>π</M> means people overweight small probabilities (which is why a
          vivid fear of being scammed can dominate a modest probability). For the expertise buyer, the salient loss is not
          only the fee but the <em>waste</em> — money, time, and hope spent on something that does not work, plus the
          regret and self-blame of having been fooled. Because that loss is weighted about twice as heavily as the
          symmetric gain of success, the decision is governed far more by <strong style={rp.strong}>de-risking the downside
          </strong> than by amplifying the upside. This is why guarantees, refunds, small first commitments, and
          proof-of-safety routinely move buyers more than larger promises of reward.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: removing the fear of loss is worth roughly twice as much as adding to the promise of gain.</p>

        {/* 3.4 */}
        <h3 id="f4" style={rp.h3}>3.4 Finding: there is no intrinsic price — willingness to pay is constructed from references and anchors</h3>
        <p style={rp.p}>
          Buyers do not carry a stable internal valuation of what a coach or consultant is worth; they construct one at the
          moment of decision from whatever reference points are available. Tversky and Kahneman (1974) showed judgments
          anchor on arbitrary numbers even when those numbers are known to be irrelevant. Ariely, Loewenstein, and Prelec
          (2003), in <em>Coherent Arbitrariness</em>, demonstrated that initial willingness-to-pay for ordinary goods could
          be shifted dramatically by an anchor as arbitrary as the last two digits of a participant’s social-security
          number — yet, once set, subsequent valuations were internally consistent. Thaler’s (1985) mental-accounting
          framework adds that buyers evaluate a price against a reference (what they expected, what others charge, what the
          alternative costs) and experience the gap as gain or loss (transaction utility), independent of the good’s
          acquisition utility.
        </p>
        <p style={rp.p}>
          For credence services this is decisive, because there is rarely an obvious market reference. The price itself
          then does double duty: it is both a cost and, in the absence of other information, a <em>signal of quality</em>
          (see §3.7). Experimental work on price–quality inference (e.g., Rao and Monroe, 1989, in meta-analysis) finds the
          inference is strongest precisely when other quality cues are scarce — the credence condition.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the reference set a seller establishes largely determines whether a given fee feels like a bargain or a threat.</p>

        {/* 3.5 */}
        <h3 id="f5" style={rp.h3}>3.5 Finding: trust is the master variable, and it decomposes into ability, benevolence, and integrity</h3>
        <p style={rp.p}>
          If the buyer is purchasing signals that predict an unverifiable outcome, the meta-signal that ties them together
          is trust. The most widely-validated model (Mayer, Davis, and Schoorman, 1995) decomposes trustworthiness into
          three perceived components: <strong style={rp.strong}>ability</strong> (does this person have the competence in
          the relevant domain?), <strong style={rp.strong}>benevolence</strong> (do they want good things for me, beyond
          their own profit?), and <strong style={rp.strong}>integrity</strong> (do they adhere to principles I find
          acceptable?). Trust then licenses the buyer to accept vulnerability — to take the risk — and the model explicitly
          couples trust to perceived risk: the same level of trust yields action only when it exceeds the risk the
          situation demands.
        </p>
        <p style={rp.p}>
          Trust formation is well described as Bayesian updating from evidence. Writing <M>T</M> for trustworthiness and
          <M> e</M> for a piece of evidence (a testimonial, a free resource that actually helped, a small kept promise),
          the buyer’s posterior confidence updates as:
        </p>
        <Eq label="trust as belief updating">
          O(T | e) = [ P(e | T) ⁄ P(e | ¬T) ] · O(T)
        </Eq>
        <p style={rp.p}>
          where <M>O</M> denotes odds. The diagnostic power of a piece of evidence is the likelihood ratio in brackets:
          evidence a low-quality provider could not easily fake (a specific, verifiable result; a genuinely useful free
          diagnosis; a willingness to say “you are not a fit”) moves the posterior far more than evidence anyone can
          produce (generic claims, self-praise). This is the formal reason costly, hard-to-fake signals dominate — the
          same logic that reappears as signaling in §3.7.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: trust is built fastest by supplying evidence a dishonest provider could not afford to supply.</p>
        <FigTrust />

        {/* 3.6 */}
        <h3 id="f6" style={rp.h3}>3.6 Finding: under uncertainty, people substitute the crowd’s judgment for their own</h3>
        <p style={rp.p}>
          When buyers cannot evaluate quality directly, they look at what similar others have done — a heuristic Cialdini
          (2006) catalogued as <strong style={rp.strong}>social proof</strong> and rooted in Festinger’s (1954) social
          comparison. The effect is strongest under exactly the conditions of the expertise purchase: uncertainty and
          similarity. Its causal power has been demonstrated cleanly. Salganik, Dodds, and Watts (2006), in a controlled
          online music market of over 14,000 participants, showed that making prior download counts visible produced both
          greater inequality and greater <em>unpredictability</em> in which songs succeeded: the same song could become a
          hit or a flop depending only on the early, partly random signals of others’ choices. Quality set the outer
          bounds, but social influence determined outcomes within them.
        </p>
        <p style={rp.p}>
          In commercial settings, Chevalier and Mayzlin (2006) found that improvements in a book’s online reviews at one
          retailer relative to another produced measurable relative increases in its sales, and that negative reviews
          moved sales more than positive ones — social proof inheriting the loss-aversion asymmetry of §3.3. The mechanism
          is not merely informational; Berger’s (2016) synthesis shows observational influence operates even when the
          observer knows nothing about the others’ reasons.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: visible evidence of similar others choosing (and benefiting) is among the most powerful cues available, and its absence is read as a warning.</p>

        {/* 3.7 */}
        <h3 id="f7" style={rp.h3}>3.7 Finding: credentials and costly displays work because they are signals, not information</h3>
        <p style={rp.p}>
          Spence’s (1973) signaling theory explains why buyers rely on markers like credentials, track records, published
          work, and even expensive offices. A signal separates high- from low-quality providers only if it is
          <em> differentially costly</em> — cheaper for the high type to produce than the low type. Formally, a separating
          equilibrium requires the signal cost <M>c</M> of an effort level <M>s</M> to satisfy:
        </p>
        <Eq label="separating equilibrium (signaling)">
          c<sub>low</sub>(s) &gt; Δ ≥ c<sub>high</sub>(s)
        </Eq>
        <p style={rp.p}>
          where <M>Δ</M> is the payoff from being believed high-quality. A genuine multi-year track record, a body of
          public teaching, or a specific and checkable result is costly or impossible for a weak provider to fake, so it
          carries information; a bare claim of excellence is cheap for anyone to make, so rational buyers discount it. This
          is the same likelihood-ratio logic as §3.5, viewed from the seller’s side. It also explains an apparent paradox
          — that giving away substantial value for free (a genuinely useful diagnosis, tool, or teaching) increases
          conversion: the give-away is a costly signal that the provider has surplus expertise to spare, which a
          low-quality provider cannot mimic without exposing themselves.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the persuasive value of a signal is proportional to how hard it would be for a bad provider to produce it.</p>

        {/* 3.8 */}
        <h3 id="f8" style={rp.h3}>3.8 Finding: small initial commitments and pre-payments change subsequent behavior</h3>
        <p style={rp.p}>
          Two well-documented mechanisms make small first steps disproportionately consequential. Freedman and Fraser
          (1966) demonstrated the <strong style={rp.strong}>foot-in-the-door</strong> effect: agreeing to a small request
          markedly raises compliance with a larger later one, mediated by a drive for self-consistency (Cialdini, 2006).
          Separately, Gourville and Soman (1998) documented <strong style={rp.strong}>payment depreciation</strong>: the
          psychological cost of a payment fades over time, so the timing of payment relative to consumption reshapes both
          attendance and satisfaction. Members of a fitness facility who paid annually attended in spikes around each
          payment and let attendance decay between them, whereas those who paid more frequently attended more steadily —
          the felt sunk cost drives usage.
        </p>
        <p style={rp.p}>
          For the expertise transaction, a small, refundable, or symbolic first commitment (a paid diagnostic, a deposit, a
          low-priced first product) does three things at once: it converts an abstract intention into a concrete action,
          it recruits the consistency motive toward the larger decision, and — because even a small payment establishes a
          sunk cost — it increases the probability the buyer actually shows up and engages, which (per §3.11) is a
          precondition for the service working at all. The same instrument can be used to genuinely qualify and commit a
          serious buyer, or abused to extract escalating commitment from an unsuitable one; the mechanism does not care.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: a small paid step is simultaneously a filter, a consistency lever, and a predictor of follow-through.</p>

        {/* 3.9 */}
        <h3 id="f9" style={rp.h3}>3.9 Finding: the structure of the options shapes the choice as much as the options themselves</h3>
        <p style={rp.p}>
          Choice is context-dependent. Three effects are well established. The <strong style={rp.strong}>compromise effect
          </strong> (Simonson and Tversky, 1992): adding a high, expensive option makes a middle option more likely to be
          chosen, because extremes feel risky. The <strong style={rp.strong}>decoy (asymmetric dominance) effect</strong>
          (Huber, Payne, and Puto, 1982): introducing an option clearly inferior to one target but not to another shifts
          choice toward the dominating target. And <strong style={rp.strong}>choice overload</strong>: Iyengar and Lepper
          (2000) found shoppers presented with 24 jams were far less likely to purchase than those shown 6 (roughly 3%
          versus 30% in the original study), suggesting that too many options can suppress action altogether — though this
          effect is moderated and is discussed critically in §6.
        </p>
        <p style={rp.p}>
          For expert services, these findings imply that the framing of packages — how many, at what price points, with
          what default — materially changes what buyers choose, independent of their underlying preferences. A well-formed
          set of options guides an uncertain buyer to a confident decision; an overloaded or manipulatively-constructed set
          either paralyzes them or steers them against their interest.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: presenting fewer, well-contrasted options generally produces more (and more confident) decisions than presenting many.</p>

        {/* 3.10 */}
        <h3 id="f10" style={rp.h3}>3.10 Finding: the strongest competitor is inaction, which is protected by powerful biases</h3>
        <p style={rp.p}>
          The default outcome of any high-uncertainty decision is to do nothing, and several biases defend that default.
          Samuelson and Zeckhauser (1988) documented <strong style={rp.strong}>status-quo bias</strong>: people
          disproportionately stick with the current state. Kahneman, Knetsch, and Thaler (1991) tied this to the
          <strong style={rp.strong}> endowment effect</strong> and loss aversion — giving up the current situation is coded
          as a loss. Ritov and Baron (1990) documented <strong style={rp.strong}>omission bias</strong>: people prefer
          harms that result from inaction over equivalent or smaller harms that result from action, because action feels
          more causally and morally attributable. The upshot is that the buyer weighs the vivid, attributable risk of a bad
          <em> purchase</em> far more heavily than the diffuse, easily-ignored risk of a bad <em>status quo</em>.
        </p>
        <p style={rp.p}>
          The counterweight identified in the literature is to make the cost of inaction concrete and present. Rogers’s
          (1975) protection-motivation theory shows that behavior change is driven jointly by perceived severity,
          perceived vulnerability, and — critically — <em>response efficacy</em> and <em>self-efficacy</em>: fear without a
          credible, doable path produces avoidance, not action. This is why credible framing of the cost of staying stuck
          works only when paired with a believable, low-risk first step.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the buyer’s real alternative is not a competitor but doing nothing; that option must be made to feel like the risky one.</p>

        {/* 3.11 */}
        <h3 id="f11" style={rp.h3}>3.11 Finding: the outcome literature says expert help works — conditionally</h3>
        <p style={rp.p}>
          A report on how people buy expertise would be incomplete, and ethically hollow, without asking whether the
          purchase is justified. The strongest evidence comes from workplace and life coaching, where meta-analyses now
          exist. Theeboom, Beersma, and van Vianen (2014) meta-analyzed 18 studies and found coaching had significant
          positive effects on performance/skills, well-being, coping, work attitudes, and goal-directed self-regulation,
          with small-to-moderate effect sizes. Jones, Woods, and Guillaume (2016) meta-analyzed 17 studies of workplace
          coaching and found an overall positive effect on outcomes (with internal coaches and certain formats moderating
          results). Sonesh et al. (2015) reached broadly consistent conclusions. The effect sizes are real but modest, and
          — importantly — the literature repeatedly identifies the <em>client’s own engagement and goal commitment</em>,
          not merely the coach, as a primary driver of outcomes, consistent with self-determination theory (Deci and Ryan,
          2000), which holds that autonomy, competence, and relatedness underpin durable motivation and change.
        </p>
        <p style={rp.p}>
          The synthesis is therefore neither cynical nor credulous. Expert help produces genuine, measurable gains on
          average, but the gains are moderate, heterogeneous, and conditional on the buyer’s active participation. This has
          a direct bearing on §3.8: instruments that increase real commitment and follow-through are not merely persuasive
          devices; they raise the probability the service works, which is the only durable basis for the trust the whole
          system runs on.
        </p>
        <p style={{ ...rp.p, fontStyle: 'italic', color: C.plum }}>Implication: the service is most likely to deliver when the sale itself selects for, and secures, a committed and suitable client.</p>

        <Divider />

        {/* 4 */}
        <h2 id="model" style={rp.h2}>4. Toward an integrated model of the expertise purchase</h2>
        <p style={rp.p}>
          The eleven findings are not independent; they compose into a sequence. Synthesizing them yields a five-stage
          model in which the buyer moves from an unresolved problem to a committed decision by progressively converting
          uncertainty into trust and trust into justified action.
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>Problem recognition and reference-point setting.</strong> A felt gap between the current and desired state becomes salient. Loss aversion and status-quo/omission bias (§3.3, §3.10) initially favor inaction; the reference point against which everything else is judged is established here.</li>
          <li style={rp.li}><strong style={rp.strong}>Affective appraisal of the provider.</strong> A fast System-1 read (§3.2) forms an initial trust impression along the ability/benevolence/integrity dimensions (§3.5), often before any deliberation.</li>
          <li style={rp.li}><strong style={rp.strong}>Proxy evaluation under the credence constraint.</strong> Unable to assess quality directly (§3.1), the buyer weighs observable signals — social proof (§3.6), costly signals and credentials (§3.7), and price as a quality cue (§3.4) — updating trust in a roughly Bayesian way (§3.5).</li>
          <li style={rp.li}><strong style={rp.strong}>Risk resolution.</strong> The buyer compares perceived trust against perceived risk. De-risking instruments — guarantees, small or refundable first commitments (§3.8), and well-formed option sets (§3.9) — do the heavy lifting here, because loss looms larger than gain (§3.3).</li>
          <li style={rp.li}><strong style={rp.strong}>Commitment and justification.</strong> A first action (often a small payment) recruits consistency and sunk-cost dynamics (§3.8), System 2 assembles a justification for the affective decision already reached, and follow-through — the precondition for the service actually working (§3.11) — is set in motion.</li>
        </ol>
        <FigFunnel />
        <p style={rp.p}>
          A compact way to state the decision rule at the pivot (stage 4) is that the buyer acts when perceived trust,
          net of the risk the situation demands, turns the subjectively-weighted prospect positive:
        </p>
        <Eq label="the buy condition">
          buy  ⟺  V<sub>gain</sub> · Trust  −  λ · V<sub>loss</sub> · (1 − Trust)  &gt;  V<sub>status-quo</sub>
        </Eq>
        <p style={rp.p}>
          with <M>λ ≈ 2.25</M> carrying the loss-aversion asymmetry. The equation is a heuristic summary, not a fitted
          model, but it captures the report’s central claim compactly: because the loss term is weighted more than twice
          the gain term, <strong style={rp.strong}>raising trust and lowering perceived risk are jointly the dominant
          levers</strong>, and the status-quo term is the true competitor.
        </p>

        {/* 5 */}
        <h2 id="discussion" style={rp.h2}>5. Discussion and implications</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>For buyers,</strong> the model is a checklist against one’s own biases. If the decision
          is being driven by a fast affective read (§3.2), by an anchor someone else set (§3.4), by raw social proof
          (§3.6), or by fear untethered from a credible path (§3.10), those are precisely the inputs most easily
          manufactured. The defensible move is to interrogate the <em>diagnosticity</em> of the evidence (§3.5): demand
          signals a low-quality provider could not fake — specific verifiable results, a genuinely useful free diagnosis,
          a provider willing to disqualify you — and treat everything cheap-to-produce as close to noise.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>For providers,</strong> the same findings prescribe an ethical strategy that also
          happens to be the effective one. Because outcomes are conditional on client engagement (§3.11), the seller’s
          interest and the buyer’s interest align most when the sale <em>selects for fit and secures commitment</em>
          rather than maximizing conversion at any cost: qualify honestly, supply costly signals of real competence,
          reverse risk with genuine guarantees, use a small first commitment to filter and to bind, and present a small,
          clear set of options. Each of these is drawn directly from a finding above, and each is a legitimate response to
          the buyer’s real problem — resolving uncertainty about an unverifiable good.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>The ethical line.</strong> Every mechanism in §3 is dual-use. Social proof can be
          fabricated; scarcity can be manufactured; commitment can be escalated against a buyer’s interest; fear can be
          amplified without offering a real path. The distinction between persuasion and manipulation, following Cialdini
          and the broader literature, turns on a single test: does the influence attempt make the buyer’s judgment
          <em> more accurate</em> about a decision that genuinely serves them, or <em>less</em>? Supplying diagnostic,
          hard-to-fake evidence that helps a suitable buyer choose correctly is persuasion. Supplying cheap-to-fake cues
          that induce an unsuitable buyer to act against their interest is manipulation. The mechanisms are identical; the
          diagnosticity and the fit are what differ.
        </p>

        {/* 6 */}
        <h2 id="limits" style={rp.h2}>6. Limitations</h2>
        <p style={rp.p}>
          Three classes of limitation apply. First, this is a <strong style={rp.strong}>synthesis, not primary research</strong>:
          it integrates existing findings and proposes a model, but the model has not been tested end-to-end on the
          specific transaction. Second, much of the underlying literature draws on <strong style={rp.strong}>WEIRD samples
          </strong> (Western, educated, industrialized, rich, democratic; Henrich, Heine, and Norenzayan, 2010) and on
          laboratory or single-market settings, limiting generalization across cultures and contexts. Third, and most
          importantly, some once-canonical effects have <strong style={rp.strong}>failed to replicate or have been
          contested</strong>: ego-depletion has largely failed large-scale replication; several social-priming results did
          not survive; and choice overload in particular is not universal — Scheibehenne, Greifeneder, and Todd (2010)
          meta-analyzed the literature and found a mean effect near zero, with assortment size interacting with factors
          such as prior preferences and the difficulty of the decision. We have flagged these where they arise. The robust
          core relied on here — loss aversion, reference dependence, the tripartite trust model, signaling, and the
          causal social-proof experiments — has held up comparatively well, but readers should treat the more fragile
          effects (specific choice-architecture manipulations, priming) as provisional.
        </p>

        {/* 7 */}
        <h2 id="conclusion" style={rp.h2}>7. Conclusion</h2>
        <p style={rp.p}>
          People do not buy expertise the way they buy a laptop, because they cannot. The core attribute is unverifiable,
          so the decision is not a calculation of value for money but an exercise in resolving uncertainty under the
          shadow of loss. Buyers substitute observable proxies for the unobservable outcome; they lean on a fast affective
          read and then justify it; they are governed more by the fear of a wasted, regretted loss than by the promise of
          a gain; they construct willingness-to-pay from whatever references are at hand; and above all they route the
          entire decision through trust, updating it from evidence in proportion to how hard that evidence would be to
          fake. Social proof, credentials and costly signals, small binding commitments, and well-formed choices are the
          instruments through which that uncertainty is discharged — and the strongest competitor throughout is not
          another provider but the biased, well-defended option of doing nothing.
        </p>
        <p style={rp.p}>
          The synthesis carries a final, unifying implication. Because the outcome literature shows these services work
          conditionally on the buyer’s own commitment, the interests of an honest seller and a suitable buyer are not
          opposed but aligned: the same instruments that most effectively resolve the buyer’s uncertainty — diagnostic
          evidence, real risk reversal, honest qualification, and a committing first step — are also the ones that most
          increase the probability the service actually delivers. The science of how people buy expertise, read
          carefully, turns out to be a description of how to sell it honestly.
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
