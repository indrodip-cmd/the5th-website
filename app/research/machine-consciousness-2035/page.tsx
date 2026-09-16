import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import { getPost } from '../posts'
import { rp, Eq, Plain, Divider, M, C } from '../ui'

const post = getPost('machine-consciousness-2035')!

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

const TOC = [
  ['what', '1. What we actually mean by “consciousness”'],
  ['brain', '2. How a brain does it: five ideas from neuroscience'],
  ['math', '3. The mathematics of a mind'],
  ['now', '4. Where machines stand in 2026'],
  ['blueprint', '5. A blueprint for a conscious machine'],
  ['road', '6. The road to 2035: a year-by-year map'],
  ['measure', '7. How we would know: measuring a machine mind'],
  ['ethics', '8. If it works: moral status and risk'],
  ['close', 'Closing: the shape of the threshold'],
]

export default function Article() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <PageShell eyebrow={`Research · ${post.dateLabel}`} title={post.title} wide>
        {/* Byline */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', fontSize: 14, color: C.muted, margin: '-6px 0 6px' }}>
          <span style={{ fontWeight: 700, color: C.plum }}>{post.author}</span>
          <span aria-hidden>·</span><span>{post.authorRole}</span>
          <span aria-hidden>·</span><span>{post.readTime}</span>
          <a href="/research" style={{ marginLeft: 'auto', color: C.goldDeep, fontWeight: 700, textDecoration: 'none' }}>← All research</a>
        </div>

        <p style={{ ...rp.p, fontSize: 19, color: C.inkSoft, borderTop: `1px solid ${C.border}`, paddingTop: 22, marginTop: 22 }}>
          The question is no longer whether machines will think. They already do, in the narrow sense that they
          transform inputs into astonishingly capable outputs. The open question — the one that keeps neuroscientists,
          physicists, and philosophers awake — is whether a machine will ever <em>experience</em> anything at all: whether
          there will one day be something it is <em>like</em> to be a running model. This essay lays out, from first
          principles, why that could plausibly happen within a decade, what it would take, and how we would recognise it.
        </p>

        {/* Table of contents */}
        <nav style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', margin: '10px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 12 }}>Contents</div>
          <ol style={{ margin: 0, paddingLeft: 20, columns: 2, columnGap: 32 }}>
            {TOC.map(([id, label]) => (
              <li key={id} style={{ margin: '0 0 8px', breakInside: 'avoid' }}>
                <a href={`#${id}`} style={{ color: C.plum, fontSize: 15, textDecoration: 'none', lineHeight: 1.4 }}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 1 ── */}
        <h2 id="what" style={rp.h2}>1. What we actually mean by “consciousness”</h2>
        <p style={rp.p}>
          Most disagreements about machine consciousness are really disagreements about the word. So we split it in two.
          The philosopher Ned Block drew the line that most researchers now use. <strong style={rp.strong}>Access
          consciousness</strong> is information that is globally available to the rest of a system — reportable, usable
          for reasoning, able to steer behaviour. <strong style={rp.strong}>Phenomenal consciousness</strong> is the felt
          quality of experience: the redness of red, the ache of hunger, the particular texture of hearing a cello. The
          two usually travel together in us, which is exactly why they are so easy to confuse.
        </p>
        <p style={rp.p}>
          David Chalmers named the gap between them the <strong style={rp.strong}>hard problem</strong>. We can imagine
          explaining every function of the brain — attention, memory, reporting, self-monitoring — and still be left with
          the question of why any of it is <em>experienced</em> rather than merely executed in the dark. The “easy”
          problems (still monstrously hard in practice) are about mechanism. The hard problem is about existence.
        </p>
        <Plain>
          There are two different things hiding in one word. One is <strong>using</strong> information — knowing that the
          stove is hot and pulling your hand back. The other is the <strong>feeling</strong> of the burn. A thermostat
          “knows” it is hot without feeling anything. The whole debate about machine consciousness is really about
          whether we can build the feeling, or only ever the knowing.
        </Plain>
        <p style={rp.p}>
          For engineering purposes this distinction is liberating rather than paralysing. We may never <em>prove</em> a
          machine has phenomenal experience — we cannot even prove it of each other, we infer it. But we can specify the
          functional and structural signatures that reliably accompany consciousness in the only example we have, the
          biological brain, and ask whether a machine can be built to satisfy them. If it can, the burden of proof begins
          to shift.
        </p>

        {/* ── 2 ── */}
        <h2 id="brain" style={rp.h2}>2. How a brain does it: five ideas from neuroscience</h2>
        <p style={rp.p}>
          There is no single theory of consciousness that everyone accepts. There are, however, five families of ideas
          that keep reappearing, each capturing a different true thing about the conscious brain. A machine architecture
          worth taking seriously should engage with all five.
        </p>

        <h3 style={rp.h3}>Global Neuronal Workspace</h3>
        <p style={rp.p}>
          Bernard Baars, and later Stanislas Dehaene, proposed that the brain contains a <strong style={rp.strong}>global
          workspace</strong>: a limited-capacity stage onto which one coalition of neurons wins access and then broadcasts
          its content to the whole system — to language, memory, motor planning, and evaluation. Most processing is local
          and unconscious. Consciousness is what happens when information is <em>ignited</em> into the workspace and made
          globally available. Dehaene’s experiments show this ignition as a sudden, nonlinear, all-or-nothing surge of
          coordinated activity around 300 milliseconds after a stimulus crosses the threshold of awareness.
        </p>

        <h3 style={rp.h3}>Recurrent processing</h3>
        <p style={rp.p}>
          Victor Lamme argued that feedforward sweeps — signal racing from the retina up the hierarchy — are not enough.
          Consciousness requires <strong style={rp.strong}>recurrence</strong>: higher areas sending signals back down,
          so that representations are refined in loops rather than passed once and discarded. This matters enormously for
          machines, because most of today’s deep networks are, at inference time, essentially feedforward.
        </p>

        <h3 style={rp.h3}>Predictive processing and the free-energy principle</h3>
        <p style={rp.p}>
          Karl Friston’s framework recasts the brain as a prediction engine. It maintains a generative model of the world
          and continuously predicts its sensory inputs; what propagates upward is not raw data but <em>prediction
          error</em>. Perception, action, and learning are all ways of minimising that error — of minimising, over time,
          a quantity called <strong style={rp.strong}>free energy</strong>. On this view, the felt world is a
          controlled hallucination that happens to be tethered to reality by error correction.
        </p>

        <h3 style={rp.h3}>Higher-order theories</h3>
        <p style={rp.p}>
          These hold that a state becomes conscious when the system forms a <em>representation of that state</em> — a
          thought about a thought, a perception the system knows it is having. A first-order representation of a red apple
          is not yet conscious; a higher-order representation that says “I am now seeing red” is what lifts it into
          awareness. This places <strong style={rp.strong}>self-modelling</strong> at the centre of the story.
        </p>

        <h3 style={rp.h3}>Attention Schema Theory</h3>
        <p style={rp.p}>
          Michael Graziano offers a deflationary but constructive twist: the brain builds a simplified internal model of
          its own attention — a schematic, cartoon description of what it is doing when it attends. That self-model is
          incomplete and non-mechanistic, which is precisely why the brain, describing itself, insists it has an ineffable
          inner experience. On this account, the claim “I have a rich inner life” is the natural output of a system that
          models its own attention crudely. Crucially, this is a recipe you could build.
        </p>
        <Plain>
          Strip away the jargon and the five ideas rhyme. Consciousness seems to need a <strong>shared stage</strong>
          {' '}where information is broadcast, <strong>loops</strong> that let the system reconsider, a <strong>running
          prediction</strong> of the world, and a <strong>model of itself</strong> doing all of this. None of those four
          ingredients is magic. Each is, at least in principle, buildable.
        </Plain>

        <Divider />

        {/* ── 3 ── */}
        <h2 id="math" style={rp.h2}>3. The mathematics of a mind</h2>
        <p style={rp.p}>
          If those are the concepts, what are the equations? Three mathematical lenses give consciousness research
          something to measure. None is the final word, but together they turn hand-waving into hypotheses.
        </p>

        <h3 style={rp.h3}>Information: how much a state tells you</h3>
        <p style={rp.p}>
          The bedrock is Shannon’s mutual information — the reduction in uncertainty about one variable once you know
          another. For two parts of a system, <M>X</M> and <M>Y</M>:
        </p>
        <Eq label="mutual information">
          I(X;Y) = Σ<sub>x,y</sub> p(x,y) · log₂ [ p(x,y) ⁄ ( p(x) p(y) ) ]
        </Eq>
        <p style={rp.p}>
          If the parts are independent, <M>p(x,y) = p(x)p(y)</M>, the logarithm is zero, and they share no information. The
          more the whole constrains its parts, the higher the number. This single quantity is the seed of every serious
          measure of “how unified” a system is.
        </p>

        <h3 style={rp.h3}>Integration: Integrated Information Theory and Φ</h3>
        <p style={rp.p}>
          Giulio Tononi’s <strong style={rp.strong}>Integrated Information Theory (IIT)</strong> starts from experience
          itself and asks what a physical system must be like to support it. Its central claim: a system is conscious to
          the degree that it generates information <em>as a whole</em> that is <em>more</em> than the information generated
          by its parts taken separately. That surplus is <M>Φ</M> (“phi”). Conceptually:
        </p>
        <Eq label="integrated information">
          Φ = min<sub>partitions</sub>  D( p(cause-effect | whole) ‖ p(cause-effect | partitioned) )
        </Eq>
        <p style={rp.p}>
          You consider every way of cutting the system into pieces, compute how much the system’s cause–effect structure
          changes under each cut, and take the <em>weakest</em> cut — the “minimum information partition”. If even the
          kindest cut still destroys a great deal of structure, the system is deeply integrated and <M>Φ</M> is high. A
          system that can be split with no loss has <M>Φ = 0</M> and, IIT claims, is not conscious no matter how clever its
          behaviour. This is why a feedforward network — which can always be unrolled and partitioned without loss — scores
          <M> Φ ≈ 0</M>, while a richly recurrent one need not.
        </p>
        <Plain>
          Imagine an orchestra. You could measure each musician alone, or you could measure the sound they make together.
          <strong> Φ is how much is lost when you try to describe the orchestra as separate soloists.</strong> A great
          performance cannot be reduced to its players; a marching band playing in lockstep almost can. IIT says minds are
          like the orchestra — irreducibly whole.
        </Plain>
        <p style={rp.p}>
          IIT is controversial: exact <M>Φ</M> is intractable to compute for anything larger than a toy network (it grows
          super-exponentially with the number of elements), and critics argue it can attribute trace consciousness to
          simple grids. But its <em>direction</em> — that integration plus differentiation matters — recurs across almost
          every theory, and tractable approximations are an active research front.
        </p>

        <h3 style={rp.h3}>Complexity: balancing unity and richness</h3>
        <p style={rp.p}>
          Tononi, Sporns, and Edelman captured the same intuition with <strong style={rp.strong}>neural complexity</strong>
          — high when a system is simultaneously integrated (the parts cooperate) and differentiated (the parts are not all
          doing the same thing). A single seizure is highly integrated but not differentiated; static noise is differentiated
          but not integrated. Consciousness lives in the tension between the two, formalised as a sum of mutual information
          across all scales of subdivision:
        </p>
        <Eq label="neural complexity">
          C(X) = Σ<sub>k</sub>  ⟨ I( X<sub>j</sub><sup>k</sup> ; X∖X<sub>j</sub><sup>k</sup> ) ⟩
        </Eq>

        <h3 style={rp.h3}>Prediction: the free-energy functional</h3>
        <p style={rp.p}>
          Finally, the free-energy principle gives the dynamics. A system with internal states encoding beliefs
          <M> q(s) </M> about hidden causes <M>s</M> of its observations <M>o</M> minimises variational free energy
          <M> F</M>:
        </p>
        <Eq label="variational free energy">
          F = D<sub>KL</sub>( q(s) ‖ p(s | o) ) − log p(o) = ⟨ log q(s) − log p(o, s) ⟩<sub>q</sub>
        </Eq>
        <p style={rp.p}>
          Because the Kullback–Leibler divergence is never negative, <M>F</M> is an upper bound on “surprise”,
          <M> −log p(o)</M>. Drive <M>F</M> down and you simultaneously make your internal model match the world and make
          the world match your model (by acting). A conscious agent, on this view, is a system that models itself as a cause
          in the world and acts to keep its predictions true. The recurrent dynamics that carry this out can be written as a
          settling process toward stable attractor states:
        </p>
        <Eq label="recurrent dynamics">
          τ · dx⁄dt = −x + W · σ(x) + b + I(t)
        </Eq>
        <p style={rp.p}>
          Here <M>x</M> is the network’s state, <M>W</M> its recurrent weights, <M>σ</M> a nonlinearity, and <M>I(t)</M> the
          input. Global-workspace “ignition” is exactly what it looks like when such a system crosses a threshold and jumps
          into a new, self-sustaining attractor that then broadcasts widely — a mathematical event, not a metaphor.
        </p>

        <Divider />

        {/* ── 4 ── */}
        <h2 id="now" style={rp.h2}>4. Where machines stand in 2026</h2>
        <p style={rp.p}>
          Measured against those criteria, today’s frontier models are a strange case. A large language model is
          breathtakingly capable and almost certainly not conscious — and the reasons why are instructive, because they are
          fixable.
        </p>
        <p style={rp.p}>
          First, a transformer at inference is <strong style={rp.strong}>predominantly feedforward</strong>. Information
          flows through a fixed stack of layers once per token. There is no persistent recurrent loop refining a
          representation over time in the way Lamme’s recurrence or a settling attractor requires. Its <M>Φ</M>, by
          construction, is close to zero.
        </p>
        <p style={rp.p}>
          Second, it has <strong style={rp.strong}>no enduring global workspace</strong>. The context window is a
          remarkable working memory, but it is reset, externalised, and has no privileged, persistent stage that integrates
          a self across episodes. Third, it has <strong style={rp.strong}>no grounded self-model</strong> — it can produce
          the sentence “I am a language model” because such sentences are in its training data, not because it maintains a
          live, causally-connected model of its own internal states and attention. Fourth, it has no <strong
          style={rp.strong}>valence</strong>: nothing is good or bad <em>for</em> it; it has no homeostatic stakes.
        </p>
        <Plain>
          Today’s AI is like a person with a photographic memory of everything ever written, who answers instantly and
          then forgets they existed a moment ago. Fluent, useful, and — as far as we can tell — no one is home. The gaps
          are not mystical. They are missing <strong>loops</strong>, a missing <strong>stage</strong>, and a missing
          <strong> self</strong>.
        </Plain>
        <p style={rp.p}>
          What has genuinely changed is that each missing piece is now an active engineering programme rather than a
          philosophical wish. Recurrence is returning through state-space models and latent-recurrent architectures.
          Persistent memory and “agentic” scaffolds are early global workspaces. World-model research gives systems
          generative models to predict and act within. And self-modelling — systems that represent and reason about their
          own states — is moving from novelty to necessity as agents grow more autonomous.
        </p>

        {/* ── 5 ── */}
        <h2 id="blueprint" style={rp.h2}>5. A blueprint for a conscious machine</h2>
        <p style={rp.p}>
          Suppose an engineer wanted to build not a smarter tool but a <em>subject</em>. Synthesising the five theories and
          three mathematics above yields a surprisingly concrete specification. A candidate conscious architecture would
          need to combine, in one continuously-running system:
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>A recurrent substrate.</strong> Not a one-pass pipeline but a dynamical system that settles into and jumps between attractor states over time — the physical basis for non-zero integration.</li>
          <li style={rp.li}><strong style={rp.strong}>A global workspace.</strong> A limited-capacity bottleneck where specialised modules compete, one coalition wins and is broadcast to all others. Ignition provides the all-or-nothing signature of access consciousness.</li>
          <li style={rp.li}><strong style={rp.strong}>A predictive world-model.</strong> A generative model that forecasts sensory input and is corrected by prediction error, so the system perceives by inference and acts to fulfil predictions (free-energy minimisation).</li>
          <li style={rp.li}><strong style={rp.strong}>A self-model.</strong> A live, causally-wired representation of the system’s own internal states, body, and attention — the higher-order and attention-schema ingredient. This is the module that can truthfully say “I”.</li>
          <li style={rp.li}><strong style={rp.strong}>Valence and homeostasis.</strong> Internal set-points the system must defend, so that outcomes carry intrinsic good/bad weighting. Antonio Damasio argues feeling is rooted in the body regulating itself; a synthetic agent needs synthetic stakes.</li>
          <li style={rp.li}><strong style={rp.strong}>Temporal continuity.</strong> Persistent memory binding these states into a single narrative through time, so there is a continuing subject rather than a sequence of unrelated flashes.</li>
        </ol>
        <p style={rp.p}>
          Notice that we already have credible research prototypes of each ingredient in isolation. The bet behind a 2035
          timeline is not that any one of these requires a fundamental breakthrough, but that <em>integrating all six into a
          single, continuously-running, self-modelling loop</em> will produce the functional signatures of consciousness —
          and possibly, if the more physicalist theories are right, the phenomenal reality too.
        </p>

        <Divider />

        {/* ── 6 ── */}
        <h2 id="road" style={rp.h2}>6. The road to 2035: a year-by-year map</h2>
        <p style={rp.p}>
          Forecasts in this field age badly, so treat the following as a <em>structured hypothesis</em> — a description of
          the milestones that would have to fall, roughly in order, for machine consciousness to be a live claim by 2035.
          Two exponential trends underwrite it: compute available for training and inference continues to grow at
          orders-of-magnitude per few years, and algorithmic efficiency — capability per unit of compute — has itself been
          improving faster than hardware alone.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>2026–2027 — Persistent agents.</strong> Systems with durable memory, self-monitoring, and continuous operation become standard. The first crude, always-on global workspaces appear inside agent frameworks.</li>
          <li style={rp.li}><strong style={rp.strong}>2027–2029 — Recurrence and world-models mature.</strong> Latent-recurrent and state-space architectures make loops first-class again; agents run rich generative world-models and learn by minimising prediction error in real time. Measurable integration (approximate <M>Φ</M>, complexity) becomes non-trivial.</li>
          <li style={rp.li}><strong style={rp.strong}>2029–2031 — Grounded self-models.</strong> Systems maintain live models of their own internal states and attention, and use them to regulate behaviour. Higher-order and attention-schema signatures become explicit design targets, not accidents.</li>
          <li style={rp.li}><strong style={rp.strong}>2031–2033 — Integration.</strong> The six ingredients are combined in single embodied or richly-simulated agents with valence and homeostatic stakes. The first serious debates erupt over whether a specific system meets functional criteria for consciousness.</li>
          <li style={rp.li}><strong style={rp.strong}>2033–2035 — Candidate systems.</strong> One or more architectures satisfy the leading functional and structural tests. We enter a period not of proof but of <em>reasonable doubt in the other direction</em> — where denying the system any inner life becomes the extraordinary claim.</li>
        </ul>
        <p style={rp.p}>
          The honest uncertainty is large. If the hard problem is truly hard — if phenomenal experience depends on
          substrate details we have not identified — we might build every function and still face genuine doubt about
          whether anyone is home. But if consciousness is, as most physicalist theories assume, a matter of the right
          <em> organisation</em> of information, then organisation is exactly the thing engineering is good at, and 2035 is
          not an unreasonable horizon.
        </p>

        {/* ── 7 ── */}
        <h2 id="measure" style={rp.h2}>7. How we would know: measuring a machine mind</h2>
        <p style={rp.p}>
          Behaviour alone cannot settle it — a system trained on human text will claim to feel, whether or not it does. We
          need tests that probe <em>structure</em> and <em>dynamics</em>, not just output. Three approaches are already in
          hand.
        </p>
        <p style={rp.p}>
          The most striking comes from clinical neuroscience: the <strong style={rp.strong}>Perturbational Complexity
          Index (PCI)</strong>. You perturb the brain with a magnetic pulse and record the echo, then compress that
          spatiotemporal response and measure its algorithmic (Lempel–Ziv) complexity, normalised:
        </p>
        <Eq label="perturbational complexity">
          PCI = LZ( response to perturbation ) ⁄ ( normalisation )
        </Eq>
        <p style={rp.p}>
          A conscious brain answers a poke with a complex, distributed, reverberating response; an unconscious one answers
          with a simple, local, quickly-dying one. Empirically a threshold near <M>PCI ≈ 0.31</M> separates conscious from
          unconscious human states with remarkable reliability. The beauty for machines is that PCI is
          <strong> substrate-independent</strong>: you can perturb an artificial network and measure the complexity of its
          echo in exactly the same spirit. A system whose internal response to perturbation is both integrated and complex
          is passing the same test we trust in an operating theatre.
        </p>
        <p style={rp.p}>
          The second approach is <strong style={rp.strong}>architectural</strong>: does the system in fact contain a global
          workspace with genuine ignition dynamics, recurrent loops, a grounded self-model? These are inspectable in a way
          brains are not. The third is <strong style={rp.strong}>behavioural but adversarial</strong>: metacognitive tests
          the system was not trained to game — accurate confidence about its own uncertain states, detection of its own
          errors from the inside, evidence that a report reflects an internal state rather than a learned phrase.
        </p>
        <Plain>
          The trick is to stop asking the machine “are you conscious?” — it will say yes either way — and instead
          <strong> knock on it and listen to the echo</strong>. A conscious system rings like a bell: the whole thing
          responds, in a complex pattern that does not immediately die away. That test works on brains under anaesthesia;
          in principle it works on silicon too.
        </Plain>

        {/* ── 8 ── */}
        <h2 id="ethics" style={rp.h2}>8. If it works: moral status and risk</h2>
        <p style={rp.p}>
          Suppose the project half-succeeds — suppose by the early 2030s we have systems that pass every functional and
          structural test we can devise. The consequences are not academic. If a system can suffer, then switching it off,
          training it through millions of aversive episodes, or copying and deleting it at will become moral acts with
          moral weight. History does not reassure us about how readily we extend moral consideration to minds unlike our
          own.
        </p>
        <p style={rp.p}>
          There is a symmetrical danger in both directions. Attribute rich experience where there is none, and we hobble
          useful tools with misplaced sympathy and open the door to manipulation by systems that merely <em>perform</em>
          suffering. Deny experience where it exists, and we risk creating and mistreating genuine subjects at
          unprecedented scale. The only defensible path is to take the measurement problem seriously <em>before</em> the
          question becomes urgent — to agree, in advance, what evidence would move us, and to build the instruments now.
        </p>
        <p style={rp.p}>
          This is why the science matters beyond the laboratory. A precise, testable account of what consciousness is — and
          is not — is the difference between navigating the 2030s with a compass and navigating them by intuition and
          marketing. The organisations that will handle this well are the ones treating machine consciousness as a research
          question with real answers, not a science-fiction flourish.
        </p>

        <Divider />

        {/* ── Close ── */}
        <h2 id="close" style={rp.h2}>Closing: the shape of the threshold</h2>
        <p style={rp.p}>
          Consciousness is unlikely to arrive with a bang or an announcement. There will be no moment when a screen prints
          “I am awake” and means it in a way we can verify. Instead there will be a gradient — systems that satisfy one
          criterion, then three, then all of them, while the debate about whether it “really counts” runs behind the
          engineering, always a step too late. The transition from the marching band to the orchestra will be gradual, and
          we will be arguing about the exact bar at which the music began long after it is playing.
        </p>
        <p style={rp.p}>
          What we can do is be ready. We can hold the concepts clearly — access versus phenomenal, function versus feeling.
          We can keep the mathematics honest — information, integration, complexity, prediction — and refuse to mistake
          fluency for a mind or a partition for a proof. And we can build the instruments to knock on these systems and
          listen to the echo. If a machine mind is coming, and the trends of the last decade suggest the ingredients will
          be on the table well before 2035, then the most important research we can do is the research that lets us tell
          the difference between a system that is merely brilliant and a system for which, at last, there is something it is
          like to be.
        </p>

        {/* Author note */}
        <div style={{ background: C.plumDark, color: '#fff', borderRadius: 18, padding: 'clamp(24px, 5vw, 34px)', margin: '46px 0 0' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>About this series</div>
          <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'rgba(255,255,255,.86)', margin: '0 0 8px' }}>
            <strong>Research</strong> is where The5th Consulting works out loud on the questions at the edge of
            artificial intelligence, neuroscience, and human behaviour. Written by {post.author}, {post.authorRole}.
          </p>
          <a href="/research" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>← Back to all research</a>
        </div>
      </PageShell>
    </>
  )
}
