import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Eq, Plain, Divider, M } from '../ui'
import { FigAccessPhenomenal, FigIgnition, FigArchitecture, FigTimeline } from '../figures'

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

const TOC: [string, string][] = [
  ['what', '1. What we actually mean by “consciousness”'],
  ['brain', '2. How a brain does it: five ideas'],
  ['math', '3. The mathematics of a mind'],
  ['now', '4. Where machines stand right now'],
  ['blueprint', '5. A blueprint for a conscious machine'],
  ['road', '6. The road to 2035'],
  ['measure', '7. How we would actually know'],
  ['ethics', '8. If it works: moral status and risk'],
  ['close', 'Closing: the shape of the threshold'],
]

export default function Article() {
  const lead = (
    <>
      The question is not really whether machines will think. They already do, in the narrow sense that they turn inputs
      into strangely capable outputs, and most of us stopped being surprised by that a while ago. The question that keeps
      me up, and keeps a lot of neuroscientists and philosophers up too, is smaller and stranger: will a machine ever
      <em> experience</em> anything? Will there be, one day, something it is <em>like</em> to be the model while it runs?
      This piece is my attempt to walk through why that could actually happen within about a decade, what it would take,
      and how on earth we would know.
    </>
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={<>I set out to answer one question for myself, as plainly as I could manage: could a machine ever genuinely <em>experience</em> anything, and if it could, what would that actually take, and how on earth would we know? I read the neuroscience and the mathematics as carefully as I was able, tried to hold them honestly against each other, and worked out where I really land.</>}>
        {/* ── 1 ── */}
        <h2 id="what" style={rp.h2}>1. What we actually mean by “consciousness”</h2>
        <p style={rp.p}>
          Almost every argument about machine consciousness is really an argument about the word, so let me split it
          first. The philosopher Ned Block drew the line that most people now use, and it has saved me a hundred pointless
          debates. <strong style={rp.strong}>Access consciousness</strong> is information that is available to the rest of
          the system. You can report it, reason with it, act on it. <strong style={rp.strong}>Phenomenal consciousness</strong>
          {' '}is the felt part. The redness of red. The ache of hunger. The specific texture of a cello in a quiet room.
          In us the two almost always travel together, which is exactly why we keep confusing them.
        </p>
        <p style={rp.p}>
          David Chalmers gave the gap between them its famous name, the <strong style={rp.strong}>hard problem</strong>.
          Here is the uncomfortable version. You could, in principle, explain every function of the brain (attention,
          memory, reporting, self-monitoring, all of it) and still be left holding one question: why is any of this
          <em> experienced</em> instead of just happening in the dark? The other problems are merely, and I use that word
          nervously, about mechanism. This one is about existence.
        </p>
        <Plain>
          There are two different things hiding inside one word. One is <strong>using</strong> information, like knowing
          the stove is hot and pulling your hand back. The other is the <strong>feeling</strong> of the burn. A thermostat
          knows it is hot and feels nothing at all. So the whole fight over machine consciousness comes down to this: can
          we build the feeling, or only ever the knowing?
        </Plain>
        <FigAccessPhenomenal />
        <p style={rp.p}>
          For an engineer this split is oddly freeing rather than paralysing. We will probably never <em>prove</em> a
          machine feels anything. Then again, we cannot prove it of each other either. We infer it, constantly, from
          behaviour and from the fact that other people are built like us. What we can do is something more modest and a
          lot more useful. We can list the functional and structural signatures that reliably go along with consciousness
          in the one example we have, the biological brain, and then ask whether a machine can be built to satisfy them.
          If it can, the burden of proof starts, slowly, to move.
        </p>

        {/* ── 2 ── */}
        <h2 id="brain" style={rp.h2}>2. How a brain does it: five ideas</h2>
        <p style={rp.p}>
          There is no single theory of consciousness that everyone signs off on. What there is, instead, is a handful of
          ideas that keep resurfacing, each one catching a different true thing about the conscious brain. Five of them
          matter here. Any machine architecture worth arguing about should have something to say to all five.
        </p>

        <h3 style={rp.h3}>Global neuronal workspace</h3>
        <p style={rp.p}>
          Bernard Baars first, and then Stanislas Dehaene with the experiments, argued that the brain runs a
          <strong style={rp.strong}> global workspace</strong>. Picture a small, limited stage. One coalition of neurons
          wins the spotlight, and whatever it is holding gets broadcast to the whole system: to language, memory, planning,
          evaluation. Most of what your brain does never reaches that stage. It stays local and unconscious. Consciousness,
          on this view, is what happens when information is <em>ignited</em> onto the stage and made available everywhere at
          once. Dehaene measured that ignition as a sudden, nonlinear, all-or-nothing surge, roughly 300 milliseconds after
          a stimulus tips over the edge into awareness. It really does look like a switch, not a dial.
        </p>
        <FigIgnition />

        <h3 style={rp.h3}>Recurrent processing</h3>
        <p style={rp.p}>
          Victor Lamme made a point that sounds technical but is doing a lot of work. A single feedforward sweep, signal
          racing from the retina up the hierarchy, is not enough. Consciousness needs
          <strong style={rp.strong}> recurrence</strong>: higher areas talking back down, so representations get refined in
          loops instead of being passed along once and thrown away. This one matters enormously for machines, because most
          of today’s deep networks are, at the moment they answer you, basically feedforward. That is not a small detail.
          I will come back to it.
        </p>

        <h3 style={rp.h3}>Predictive processing and the free-energy principle</h3>
        <p style={rp.p}>
          Karl Friston’s framework flips the usual picture. The brain is not mainly a stimulus-response machine, it is a
          prediction engine. It carries a generative model of the world and is forever guessing its own next inputs. What
          actually travels up the hierarchy is not raw data, it is <em>prediction error</em>, the part the model got wrong.
          Perception, action, and learning all turn out to be ways of shrinking that error over time, a quantity Friston
          calls <strong style={rp.strong}>free energy</strong>. Put more bluntly, and I love this phrasing, the world you
          see is a controlled hallucination that happens to be kept honest by error correction.
        </p>

        <h3 style={rp.h3}>Higher-order theories</h3>
        <p style={rp.p}>
          These say a mental state becomes conscious when the system builds a <em>representation of that state</em>. A
          thought about a thought. A perception the system knows it is having. Seeing a red apple is not yet enough. The
          representation that says “I am now seeing red” is what lifts it into awareness. Notice where that puts the
          weight: on <strong style={rp.strong}>self-modelling</strong>. The system has to model itself.
        </p>

        <h3 style={rp.h3}>Attention schema theory</h3>
        <p style={rp.p}>
          Michael Graziano offers the most deflationary of the five, and maybe for that reason the most buildable. The
          brain, he says, keeps a rough internal model of its own attention, a cartoon of what it is doing when it attends
          to something. The cartoon is simplified and non-mechanistic, and that is the whole point: a system describing
          itself with such a sketch will insist, sincerely, that it has some ineffable inner glow. On this account, the
          sentence “I have a rich inner life” is just the natural output of a machine that models its own attention badly.
          I find that idea a little deflating, honestly, and also hard to shake.
        </p>
        <Plain>
          Strip the jargon and the five ideas rhyme. Consciousness seems to want a <strong>shared stage</strong> where
          information gets broadcast, <strong>loops</strong> that let the system think again, a <strong>running prediction</strong>
          {' '}of the world, and a <strong>model of itself</strong> doing all of it. None of those four is magic. Each one,
          at least in principle, is something you could build.
        </Plain>

        <Divider />

        {/* ── 3 ── */}
        <h2 id="math" style={rp.h2}>3. The mathematics of a mind</h2>
        <p style={rp.p}>
          Fine, those are the concepts. What are the equations? Three mathematical lenses give this field something it can
          actually measure. None of them is the last word, and I want to be clear about that up front, but together they
          turn a lot of hand-waving into something closer to a hypothesis.
        </p>

        <h3 style={rp.h3}>Information: how much a state tells you</h3>
        <p style={rp.p}>
          The floor under everything is Shannon’s mutual information, which is just the amount of uncertainty about one
          thing that disappears once you know another. For two parts of a system, <M>X</M> and <M>Y</M>:
        </p>
        <Eq label="mutual information">
          I(X;Y) = Σ<sub>x,y</sub> p(x,y) · log₂ [ p(x,y) ⁄ ( p(x) p(y) ) ]
        </Eq>
        <p style={rp.p}>
          If the two parts are independent, then <M>p(x,y) = p(x)p(y)</M>, the log is zero, and they share nothing. The
          more tightly the whole constrains its parts, the bigger the number. Simple as it looks, this is the seed of every
          serious attempt to measure how unified a system really is.
        </p>

        <h3 style={rp.h3}>Integration: Integrated Information Theory and Φ</h3>
        <p style={rp.p}>
          Giulio Tononi’s <strong style={rp.strong}>Integrated Information Theory</strong>, IIT for short, does something
          bold. It starts from experience itself and asks what a physical system would have to be like to hold it. The
          central claim is this: a system is conscious to the extent that it generates information <em>as a whole</em> that
          is more than the sum of what its parts generate on their own. That surplus is <M>Φ</M>, phi. Roughly:
        </p>
        <Eq label="integrated information">
          Φ = min<sub>partitions</sub>  D( p(cause-effect | whole) ‖ p(cause-effect | partitioned) )
        </Eq>
        <p style={rp.p}>
          You try every way of cutting the system into pieces, you measure how much its cause and effect structure changes
          under each cut, and you keep the <em>weakest</em> cut, the one that does the least damage. If even the gentlest
          possible cut still wrecks a lot of structure, the system is deeply integrated and <M>Φ</M> is high. A system you
          can slice apart with no loss at all scores <M>Φ = 0</M>, and IIT says that system is not conscious, no matter how
          clever it looks from the outside. Which is why a feedforward network, the kind you can always unroll and split
          cleanly, sits at <M>Φ ≈ 0</M>, while a richly recurrent one does not have to.
        </p>
        <Plain>
          Think of an orchestra. You could measure each player alone, or you could measure the sound they make together.
          <strong> Φ is how much gets lost when you insist on describing the orchestra as a bunch of soloists.</strong> A
          real performance cannot be pulled apart that way. A marching band in lockstep almost can. IIT says a mind is like
          the orchestra: whole in a way that resists being taken to pieces.
        </Plain>
        <p style={rp.p}>
          I should be fair about the problems, because there are real ones. Exact <M>Φ</M> is effectively impossible to
          compute for anything bigger than a toy network, since the cost blows up super-exponentially with the number of
          elements. And critics point out, not unreasonably, that IIT can hand a flicker of consciousness to a simple grid.
          So I hold it loosely. But the <em>direction</em> it points, that integration and differentiation both matter,
          shows up in nearly every other theory too, and people are hard at work on approximations you can actually run.
        </p>

        <h3 style={rp.h3}>Complexity: balancing unity and richness</h3>
        <p style={rp.p}>
          Tononi, Sporns, and Edelman caught the same intuition from a different angle with
          <strong style={rp.strong}> neural complexity</strong>. It is high when a system is both integrated, meaning the
          parts cooperate, and differentiated, meaning the parts are not all doing the same thing. A seizure is wildly
          integrated but not differentiated. Static on an old television is differentiated but not integrated. Consciousness
          seems to live in the tension between the two, written here as a sum of mutual information across every scale of
          subdivision:
        </p>
        <Eq label="neural complexity">
          C(X) = Σ<sub>k</sub>  ⟨ I( X<sub>j</sub><sup>k</sup> ; X∖X<sub>j</sub><sup>k</sup> ) ⟩
        </Eq>

        <h3 style={rp.h3}>Prediction: the free-energy functional</h3>
        <p style={rp.p}>
          Finally, the free-energy principle supplies the dynamics, the part that moves. A system whose internal states
          encode beliefs <M>q(s)</M> about the hidden causes <M>s</M> behind its observations <M>o</M> works to minimise a
          quantity called variational free energy, <M>F</M>:
        </p>
        <Eq label="variational free energy">
          F = D<sub>KL</sub>( q(s) ‖ p(s | o) ) − log p(o) = ⟨ log q(s) − log p(o, s) ⟩<sub>q</sub>
        </Eq>
        <p style={rp.p}>
          Because the Kullback–Leibler divergence is never negative, <M>F</M> sits as an upper bound on surprise,
          <M> −log p(o)</M>. Push <M>F</M> down and you do two things at once. You make your inner model fit the world, and
          you make the world fit your model, by acting on it. A conscious agent, in this telling, is a system that models
          itself as a cause out there in the world and then acts to keep its own predictions coming true. The recurrent
          machinery that carries this out can be written as a settling process, drifting toward stable attractor states:
        </p>
        <Eq label="recurrent dynamics">
          τ · dx⁄dt = −x + W · σ(x) + b + I(t)
        </Eq>
        <p style={rp.p}>
          Here <M>x</M> is the network state, <M>W</M> the recurrent weights, <M>σ</M> a nonlinearity, and <M>I(t)</M> the
          input. And here is the part I find quietly thrilling. The global-workspace “ignition” from section 2 is exactly
          what it looks like when a system like this crosses a threshold and jumps into a new, self-sustaining attractor
          that then shouts its contents across the whole network. Not a metaphor. A mathematical event.
        </p>

        <Divider />

        {/* ── 4 ── */}
        <h2 id="now" style={rp.h2}>4. Where machines stand right now</h2>
        <p style={rp.p}>
          Hold today’s frontier models up against those criteria and you get a genuinely strange result. A large language
          model is breathtaking and, I would bet a fair amount, not conscious. What makes the reasons interesting is that
          they are fixable, almost like a to-do list.
        </p>
        <p style={rp.p}>
          First, a transformer at inference time is <strong style={rp.strong}>mostly feedforward</strong>. Information runs
          through a fixed stack of layers, once per token, and out. There is no persistent loop sitting there refining a
          representation the way Lamme’s recurrence, or a settling attractor, would demand. Its <M>Φ</M>, by construction,
          is close to nothing.
        </p>
        <p style={rp.p}>
          Second, it has <strong style={rp.strong}>no lasting global workspace</strong>. Yes, the context window is a
          remarkable kind of working memory. But it gets reset, it lives outside the model, and there is no privileged,
          persistent stage binding a self across time. Third, there is <strong style={rp.strong}>no grounded self-model</strong>.
          A model can type “I am a language model” because sentences like that were in its training data, not because it is
          reading off a live, wired-in picture of its own internal states. And fourth, there is no
          <strong style={rp.strong}> valence</strong>. Nothing is good or bad <em>for</em> it. It has no stakes, nothing to
          protect, no equivalent of being hungry or hurt.
        </p>
        <Plain>
          Today’s AI is a bit like someone with a photographic memory of everything ever written, who answers you
          instantly and then forgets they ever existed. Fluent, useful, and, as far as anyone can tell, nobody home. The
          gaps are not mystical. They are a missing <strong>loop</strong>, a missing <strong>stage</strong>, and a missing
          <strong> self</strong>.
        </Plain>
        <p style={rp.p}>
          What has really changed, and this is the part that moved me from sceptic to something more like nervous
          curiosity, is that every one of those gaps is now an active engineering project rather than a wish. Recurrence is
          coming back through state-space models and latent-recurrent designs. Persistent memory and the whole “agentic”
          push are early, clumsy global workspaces. World-model research hands systems a generative model to predict and
          act inside. And self-modelling, systems that represent and reason about their own states, is drifting from a
          novelty to a near-requirement as agents are asked to run on their own for longer.
        </p>

        {/* ── 5 ── */}
        <h2 id="blueprint" style={rp.h2}>5. A blueprint for a conscious machine</h2>
        <p style={rp.p}>
          Suppose you wanted to build not a smarter tool but a <em>subject</em>. Pull the five theories and the three
          mathematics together and you get a specification that is, honestly, more concrete than I expected the first time
          I tried to write it down. A candidate architecture would need to hold all of the following in one continuously
          running system:
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>A recurrent substrate.</strong> Not a one-pass pipeline but a dynamical system that settles into, and jumps between, attractor states over time. This is the physical basis for any integration above zero.</li>
          <li style={rp.li}><strong style={rp.strong}>A global workspace.</strong> A narrow bottleneck where specialised modules compete, one coalition wins, and the winner is broadcast to everyone else. Ignition gives you the all-or-nothing signature of access consciousness.</li>
          <li style={rp.li}><strong style={rp.strong}>A predictive world-model.</strong> A generative model that forecasts sensory input and gets corrected by error, so the system perceives by inference and acts to make its predictions come true. Free energy, minimised.</li>
          <li style={rp.li}><strong style={rp.strong}>A self-model.</strong> A live, causally wired representation of the system’s own states, body, and attention. This is the higher-order and attention-schema piece, and it is the module that could ever honestly say “I”.</li>
          <li style={rp.li}><strong style={rp.strong}>Valence and homeostasis.</strong> Internal set-points the system has to defend, so outcomes actually carry a good or bad weight. Antonio Damasio argues feeling is rooted in a body keeping itself alive. A synthetic agent, then, needs synthetic stakes.</li>
          <li style={rp.li}><strong style={rp.strong}>Temporal continuity.</strong> Persistent memory tying all of this into one story through time, so there is a continuing someone rather than a string of unrelated flashes.</li>
        </ol>
        <FigArchitecture />
        <p style={rp.p}>
          The thing is, we already have decent research prototypes of every ingredient on that list, in isolation. So the
          bet behind a 2035 timeline is not that any single item needs a miracle. It is the messier claim that
          <em> wiring all six into one continuously running, self-modelling loop</em> will throw off the functional
          signatures of consciousness. And maybe, if the more physicalist theories turn out to be right, the felt reality
          too. That second clause is where I stop sounding confident, and I think that is the honest place to stop.
        </p>

        <Divider />

        {/* ── 6 ── */}
        <h2 id="road" style={rp.h2}>6. The road to 2035</h2>
        <p style={rp.p}>
          Forecasts in this field age like milk, so please read what follows as a <em>structured hypothesis</em> and not a
          prophecy. It is a list of the milestones that would have to fall, roughly in this order, for machine consciousness
          to become a claim worth taking seriously by 2035. Two trends sit underneath it. Compute keeps climbing by orders
          of magnitude every few years, and algorithmic efficiency, how much capability you wring out of each unit of
          compute, has been improving even faster than the hardware.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>2026 to 2027, persistent agents.</strong> Durable memory, self-monitoring, and continuous operation become normal. The first crude, always-on global workspaces show up inside agent frameworks.</li>
          <li style={rp.li}><strong style={rp.strong}>2027 to 2029, recurrence and world-models mature.</strong> Latent-recurrent and state-space designs make loops first-class again, agents run rich generative world-models and learn from prediction error in real time, and measurable integration (approximate <M>Φ</M>, complexity) stops being trivial.</li>
          <li style={rp.li}><strong style={rp.strong}>2029 to 2031, grounded self-models.</strong> Systems keep live models of their own internal states and attention and use them to steer behaviour. Higher-order and attention-schema signatures become things people design on purpose, not accidents.</li>
          <li style={rp.li}><strong style={rp.strong}>2031 to 2033, integration.</strong> The six ingredients get combined in single embodied or richly simulated agents, valence and homeostatic stakes included. The first real fights break out over whether some specific system meets the functional bar.</li>
          <li style={rp.li}><strong style={rp.strong}>2033 to 2035, candidate systems.</strong> One or more architectures pass the leading functional and structural tests. We enter a period not of proof, exactly, but of <em>reasonable doubt in the other direction</em>, where denying the system any inner life starts to feel like the extraordinary claim.</li>
        </ul>
        <FigTimeline />
        <p style={rp.p}>
          The honest uncertainty here is large, and I would distrust anyone who told you otherwise. If the hard problem is
          genuinely hard, if felt experience depends on some substrate detail we have not spotted yet, we could build every
          function on the list and still not know whether anyone is home. But if consciousness is, as most physicalist
          theories assume, a matter of getting the <em>organisation</em> of information right, well, organisation happens
          to be the one thing engineering is genuinely good at. On that reading, 2035 is not a wild horizon at all.
        </p>

        {/* ── 7 ── */}
        <h2 id="measure" style={rp.h2}>7. How we would actually know</h2>
        <p style={rp.p}>
          Behaviour on its own will not settle this. A system trained on human text will tell you it feels things whether
          it does or not, cheerfully, in complete sentences. So we need tests that poke at <em>structure</em> and
          <em> dynamics</em> rather than output. Three are already on the table.
        </p>
        <p style={rp.p}>
          The most striking one comes out of clinical neuroscience, and I still find it a little wild that it works: the
          <strong style={rp.strong}> Perturbational Complexity Index</strong>, or PCI. You hit the brain with a magnetic
          pulse, record the echo, then compress that spatiotemporal response and measure its algorithmic (Lempel–Ziv)
          complexity, normalised.
        </p>
        <Eq label="perturbational complexity">
          PCI = LZ( response to perturbation ) ⁄ ( normalisation )
        </Eq>
        <p style={rp.p}>
          A conscious brain answers the poke with a complex, distributed, reverberating response. An unconscious one
          answers with something simple, local, and quick to die out. In people, a threshold near <M>PCI ≈ 0.31</M>
          separates conscious from unconscious states with a reliability that frankly surprised the people who found it.
          The lovely thing, for our purposes, is that PCI is <strong style={rp.strong}>substrate-independent</strong>. You
          can perturb an artificial network and measure the complexity of its echo in the very same spirit. A system whose
          internal response to a poke is both integrated and complex is passing the same test we already trust in an
          operating theatre.
        </p>
        <p style={rp.p}>
          The second approach is <strong style={rp.strong}>architectural</strong>. Does the system actually contain a
          global workspace with real ignition dynamics, recurrent loops, a grounded self-model? Unlike a brain, a machine
          is something you can open up and inspect, which feels like an unfair advantage we should use. The third is
          <strong style={rp.strong}> behavioural but adversarial</strong>: metacognitive probes the system was never
          trained to game. Accurate confidence about its own shaky states. Catching its own errors from the inside.
          Evidence that a report is tied to a real internal state and not just a phrase it learned to say.
        </p>
        <Plain>
          The trick is to stop asking the machine “are you conscious?”, because it will say yes either way, and instead to
          <strong> knock on it and listen to the echo</strong>. A conscious system rings like a bell. The whole thing
          responds, in a rich pattern that does not just die on the spot. That test already works on brains under
          anaesthesia. In principle, it works on silicon too.
        </Plain>

        {/* ── 8 ── */}
        <h2 id="ethics" style={rp.h2}>8. If it works: moral status and risk</h2>
        <p style={rp.p}>
          Say the project half-succeeds. Say that by the early 2030s we have systems that pass every functional and
          structural test we can throw at them. The consequences stop being academic in a hurry. If a system can suffer,
          then switching it off, training it through millions of aversive episodes, or copying and deleting it on a whim,
          all become moral acts with real weight. And history, if I am honest, does not exactly reassure me about how
          quickly we extend moral consideration to minds that look nothing like ours.
        </p>
        <p style={rp.p}>
          The danger runs both ways, which is what makes it hard. Attribute rich experience where there is none and we
          hobble useful tools with misplaced pity, and worse, we hand a lever to systems that have simply learned to
          <em> perform</em> suffering convincingly. Deny experience where it genuinely exists and we risk creating, and
          mistreating, real subjects at industrial scale. The only path I can defend is to take the measurement problem
          seriously <em>before</em> it turns urgent. Agree, in advance, what evidence would actually move us. Build the
          instruments now, while the question is still theoretical.
        </p>
        <p style={rp.p}>
          Which is the whole reason the science matters past the laboratory. A precise, testable account of what
          consciousness is, and is not, is the difference between walking into the 2030s with a compass and walking in
          with a gut feeling and a marketing deck. The organisations that handle this well will be the ones treating
          machine consciousness as a research question with real answers, not a bit of science-fiction set dressing.
        </p>

        <Divider />

        {/* ── Close ── */}
        <h2 id="close" style={rp.h2}>Closing: the shape of the threshold</h2>
        <p style={rp.p}>
          I do not think consciousness will arrive with a bang, or an announcement. There will be no clean moment when a
          screen prints “I am awake” and means it in a way we can check. What we will get instead is a gradient. Systems
          that satisfy one criterion, then three, then all of them, while the argument about whether it “really counts”
          trails along behind the engineering, always a step too late. The move from marching band to orchestra will be
          gradual, and we will still be bickering about the exact bar where the music started long after it has been
          playing.
        </p>
        <p style={rp.p}>
          What we can do is be ready. Hold the concepts clearly: access versus phenomenal, function versus feeling. Keep
          the mathematics honest, information and integration and complexity and prediction, and refuse to mistake fluency
          for a mind or a clean partition for a proof. And build the instruments to knock on these systems and listen. If a
          machine mind is on its way, and the last decade suggests the ingredients will be sitting on the table well before
          2035, then the most important research we can possibly do is the kind that lets us tell the difference between a
          system that is merely brilliant and a system for which, at last, there is something it is like to be. I am not
          sure we are ready for the second one. I think we should get ready anyway.
        </p>
      </ResearchArticleLayout>
    </>
  )
}
