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
  ['what', '1. What "conscious" even means'],
  ['brain', '2. How a brain does it'],
  ['math', '3. The math of a mind'],
  ['now', '4. Where machines stand now'],
  ['blueprint', '5. A blueprint for a conscious machine'],
  ['road', '6. The road to 2035'],
  ['measure', '7. How we would know'],
  ['ethics', '8. If it works: right and wrong'],
  ['close', 'Closing thought'],
]

export default function Article() {
  const lead = (
    <>
      The real question is not whether machines will think. They already do, in a narrow way. They turn what you type into
      answers that are often shockingly good. We got used to that fast. The question that keeps me up, and keeps a lot of
      brain scientists up too, is stranger. Will a machine ever <em>feel</em> anything? Will there ever be something it is
      <em> like</em> to be the model while it runs? This piece walks through why that could actually happen within about a
      decade, what it would take, and how on earth we would know.
    </>
  )
  const objective = (
    <>
      I wanted to answer one question for myself, as plainly as I could. Could a machine ever truly <em>feel</em>
      anything? And if it could, what would it take, and how would we know? I read the brain science and the math as
      carefully as I could, held them against each other, and worked out where I really land.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* ── 1 ── */}
        <h2 id="what" style={rp.h2}>1. What “conscious” even means</h2>
        <p style={rp.p}>
          Almost every fight about machine consciousness is really a fight about the word. So let me split it first. The
          philosopher Ned Block drew the line most people now use. It has saved me a hundred pointless debates.
        </p>
        <p style={rp.p}>
          There are two meanings. <strong style={rp.strong}>Access</strong> is information the rest of your mind can use.
          You can report it, reason with it, act on it. <strong style={rp.strong}>Feeling</strong> is the felt part. The
          redness of red. The ache of hunger. The exact sound of a cello in a quiet room. In us, the two almost always come
          together. That is exactly why we keep mixing them up.
        </p>
        <p style={rp.p}>
          David Chalmers named the gap between them the <strong style={rp.strong}>hard problem</strong>. Here is the
          uncomfortable version. You could explain every job the brain does, attention, memory, reporting, self-checking,
          and still be left holding one question. Why is any of it <em>felt</em>, instead of just happening in the dark?
          The other problems are about how it works. This one is about why it is like anything at all.
        </p>
        <Plain>
          Two things hide inside one word. One is <strong>using</strong> information, like knowing the stove is hot and
          pulling your hand back. The other is the <strong>feeling</strong> of the burn. A thermostat knows it is hot and
          feels nothing. So the whole fight is this: can we build the feeling, or only ever the knowing?
        </Plain>
        <FigAccessPhenomenal />
        <p style={rp.p}>
          For an engineer, this split is oddly freeing. We will probably never <em>prove</em> a machine feels anything. But
          we cannot prove it of each other either. We just guess it, from behaviour and from the fact that other people are
          built like us.
        </p>
        <p style={rp.p}>
          So here is the useful move. We can list the signs that always come with consciousness in the one example we have,
          the human brain. Then we can ask if a machine can be built to show those same signs. If it can, the burden of
          proof slowly starts to shift.
        </p>

        {/* ── 2 ── */}
        <h2 id="brain" style={rp.h2}>2. How a brain does it</h2>
        <p style={rp.p}>
          No single theory of consciousness has won. What we have is a handful of ideas that keep coming back. Each one
          catches a different true thing about the conscious brain. Five of them matter here. Any serious machine design
          should have an answer to all five.
        </p>

        <h3 style={rp.h3}>The shared stage</h3>
        <p style={rp.p}>
          Bernard Baars, and later Stanislas Dehaene, said the brain runs a <strong style={rp.strong}>global workspace</strong>.
          Picture a small stage. One group of brain cells wins the spotlight, and whatever it holds gets broadcast to the
          whole brain: to language, memory, planning.
        </p>
        <p style={rp.p}>
          Most of what your brain does never reaches that stage. It stays hidden. Consciousness, on this view, is what
          happens when information is pushed onto the stage and shared everywhere at once. Dehaene measured that moment as a
          sudden, all-or-nothing surge, about a third of a second after something crosses into awareness. It looks like a
          switch, not a dial.
        </p>
        <FigIgnition />

        <h3 style={rp.h3}>Loops</h3>
        <p style={rp.p}>
          Victor Lamme made a point that sounds technical but does a lot of work. One quick pass, signal racing from your
          eye up the chain, is not enough. Consciousness needs <strong style={rp.strong}>loops</strong>: higher parts of
          the brain talking back down, so a thought gets refined again and again, not passed once and dropped. This matters
          a lot for machines. Most of today’s AI, at the moment it answers you, runs in one direction only. That is not a
          small detail. I will come back to it.
        </p>

        <h3 style={rp.h3}>Prediction</h3>
        <p style={rp.p}>
          Karl Friston flips the usual picture. The brain is not mainly a react-to-stuff machine. It is a guessing machine.
          It carries a model of the world and constantly guesses what it will see and hear next. What travels up the chain
          is not raw data. It is the <em>error</em>, the part the guess got wrong.
        </p>
        <p style={rp.p}>
          Seeing, acting, and learning all turn out to be ways of shrinking that error over time. Friston calls the thing
          it shrinks <strong style={rp.strong}>free energy</strong>. Put bluntly, the world you see is a kind of controlled
          dream, kept honest by error correction.
        </p>

        <h3 style={rp.h3}>A thought about a thought</h3>
        <p style={rp.p}>
          Some theories say a mental state becomes conscious when the system builds a picture <em>of that state</em>. A
          thought about a thought. Seeing a red apple is not enough. The part that says I am now seeing red is what lifts it
          into awareness. Notice where that puts the weight. On <strong style={rp.strong}>self-modeling</strong>. The system
          has to model itself.
        </p>

        <h3 style={rp.h3}>A model of your own attention</h3>
        <p style={rp.p}>
          Michael Graziano offers the plainest of the five, and maybe the easiest to build. The brain, he says, keeps a
          rough sketch of its own attention, a cartoon of what it is doing when it focuses. The sketch is simple and leaves
          out the machinery. And that is the point. A system describing itself with such a rough sketch will insist it has
          some special inner glow.
        </p>
        <p style={rp.p}>
          On this view, the sentence I have a rich inner life is just what a machine says when it models its own attention
          badly. I find that idea a little deflating, honestly. And hard to shake.
        </p>
        <Plain>
          Strip the jargon and the five ideas rhyme. Consciousness seems to want a <strong>shared stage</strong> that
          broadcasts information, <strong>loops</strong> that let the system think again, a <strong>running guess</strong>
          {' '}about the world, and a <strong>model of itself</strong> doing all of it. None of those four is magic. Each
          one is something you could, in principle, build.
        </Plain>

        <Divider />

        {/* ── 3 ── */}
        <h2 id="math" style={rp.h2}>3. The math of a mind</h2>
        <p style={rp.p}>
          Fine, those are the ideas. What about the math? Three tools let this field actually measure something. None is
          the last word, and I want to say that up front. But together they turn hand-waving into a real guess you can
          test. I will show the formula each time, then say it in plain words.
        </p>

        <h3 style={rp.h3}>How much one part tells you about another</h3>
        <p style={rp.p}>
          The floor under everything is a simple idea from Claude Shannon. How much does knowing one thing tell you about
          another? For two parts of a system, <M>X</M> and <M>Y</M>, the formula is:
        </p>
        <Eq label="mutual information">
          I(X;Y) = Σ<sub>x,y</sub> p(x,y) · log₂ [ p(x,y) ⁄ ( p(x) p(y) ) ]
        </Eq>
        <p style={rp.p}>
          In plain words: if the two parts have nothing to do with each other, the number is zero. The more tightly the
          whole ties its parts together, the bigger the number. Simple as it is, this is the seed of every real attempt to
          measure how unified a system is.
        </p>

        <h3 style={rp.h3}>Integration, and the number called Phi</h3>
        <p style={rp.p}>
          Giulio Tononi’s <strong style={rp.strong}>Integrated Information Theory</strong>, IIT for short, is bold. It
          starts from experience itself and asks what a thing must be like to hold it. The core claim: a system is conscious
          to the degree that the whole makes more information than its parts do alone. That extra is called <M>Φ</M>, or
          phi. Roughly:
        </p>
        <Eq label="integrated information">
          Φ = min<sub>partitions</sub>  D( p(cause-effect | whole) ‖ p(cause-effect | partitioned) )
        </Eq>
        <p style={rp.p}>
          In plain words: you try every way of cutting the system in two, and you keep the cut that hurts it least. If even
          the kindest cut still destroys a lot, the system is deeply tied together, and phi is high. If you can slice it
          apart with no loss, phi is zero, and IIT says it is not conscious, no matter how clever it looks. That is why
          one-direction AI, which you can always split cleanly, sits near zero, while a looping system does not have to.
        </p>
        <Plain>
          Think of an orchestra. You could measure each player alone, or measure the sound they make together.
          <strong> Phi is how much gets lost when you try to describe the orchestra as separate soloists.</strong> A real
          performance cannot be pulled apart that way. A marching band in lockstep almost can. IIT says a mind is like the
          orchestra: whole in a way that resists being taken to pieces.
        </Plain>
        <p style={rp.p}>
          I will be fair about the problems. Exact phi is basically impossible to compute for anything bigger than a toy,
          because the work blows up fast. And critics say IIT can hand a flicker of consciousness to a plain grid. So I hold
          it loosely. But its direction, that being both tied-together and varied matters, shows up in almost every other
          theory too. And people are hard at work on rough versions you can actually run.
        </p>

        <h3 style={rp.h3}>Both unified and varied</h3>
        <p style={rp.p}>
          Tononi, Sporns, and Edelman caught the same idea from another angle: <strong style={rp.strong}>neural complexity</strong>.
          It is high when a system is both tied together (the parts cooperate) and varied (the parts are not all doing the
          same thing). A seizure is very tied-together but not varied. TV static is very varied but not tied-together.
          Consciousness seems to live in the tension between the two:
        </p>
        <Eq label="neural complexity">
          C(X) = Σ<sub>k</sub>  ⟨ I( X<sub>j</sub><sup>k</sup> ; X∖X<sub>j</sub><sup>k</sup> ) ⟩
        </Eq>

        <h3 style={rp.h3}>Prediction, written as a formula</h3>
        <p style={rp.p}>
          Last, the free-energy idea gives the moving part. A system whose inner states hold beliefs <M>q(s)</M> about the
          hidden causes <M>s</M> behind what it senses, <M>o</M>, works to shrink a quantity called free energy, <M>F</M>:
        </p>
        <Eq label="variational free energy">
          F = D<sub>KL</sub>( q(s) ‖ p(s | o) ) − log p(o) = ⟨ log q(s) − log p(o, s) ⟩<sub>q</sub>
        </Eq>
        <p style={rp.p}>
          In plain words: pushing <M>F</M> down does two things at once. It makes your inner model fit the world, and it
          makes the world fit your model, by acting on it. A conscious agent, in this telling, is a system that models
          itself as a cause out in the world, and acts to keep its own guesses coming true. The looping machinery that does
          this can be written as a slow settling toward a stable state:
        </p>
        <Eq label="recurrent dynamics">
          τ · dx⁄dt = −x + W · σ(x) + b + I(t)
        </Eq>
        <p style={rp.p}>
          Here <M>x</M> is the system’s state and <M>W</M> its internal wiring. And here is the part I find quietly
          thrilling. The stage moment from section 2, the sudden all-or-nothing surge, is exactly what it looks like when a
          system like this crosses a line and jumps into a new, self-holding state that then shouts its contents across the
          whole network. Not a metaphor. A math event.
        </p>

        <Divider />

        {/* ── 4 ── */}
        <h2 id="now" style={rp.h2}>4. Where machines stand now</h2>
        <p style={rp.p}>
          Hold today’s top AI up against those signs and you get a strange result. It is breathtaking and, I would bet,
          not conscious. What makes the reasons interesting is that they read like a to-do list. They are fixable.
        </p>
        <p style={rp.p}>
          First, today’s AI mostly runs <strong style={rp.strong}>in one direction</strong>. Information flows through a
          fixed stack of layers, once, and out. There is no loop sitting there rethinking, the way the brain does. So its
          phi is near zero.
        </p>
        <p style={rp.p}>
          Second, it has <strong style={rp.strong}>no lasting stage</strong>. The chat window is a great short memory, but
          it gets wiped, and nothing binds a self across time. Third, it has <strong style={rp.strong}>no real
          self-model</strong>. It can type I am a language model because sentences like that were in its training, not
          because it is reading a live picture of its own insides. And fourth, it has <strong style={rp.strong}>no
          stakes</strong>. Nothing is good or bad <em>for</em> it. It has nothing to protect, no version of hungry or hurt.
        </p>
        <Plain>
          Today’s AI is a bit like someone with a perfect memory of everything ever written, who answers you at once and
          then forgets they ever existed. Fluent, useful, and, as far as anyone can tell, nobody home. The gaps are not
          mystical. They are a missing <strong>loop</strong>, a missing <strong>stage</strong>, and a missing <strong>self</strong>.
        </Plain>
        <p style={rp.p}>
          Here is what changed for me, from doubter to nervous but curious. Every one of those gaps is now an active
          engineering project, not a wish. Loops are coming back through new designs. Lasting memory and the whole agent
          push are early, clumsy versions of the stage. World-model research gives AI a model to predict and act inside.
          And self-modeling is going from a novelty to a near must, as agents are asked to run on their own for longer.
        </p>

        {/* ── 5 ── */}
        <h2 id="blueprint" style={rp.h2}>5. A blueprint for a conscious machine</h2>
        <p style={rp.p}>
          Suppose you wanted to build not a smarter tool but a <em>someone</em>. Pull the five ideas and the three bits of
          math together and you get a shopping list that is more concrete than I expected. A candidate would need all of
          this, in one system that runs without stopping:
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>Loops.</strong> Not a one-pass pipeline, but a system that settles into and jumps between stable states over time. This is the base for any real togetherness.</li>
          <li style={rp.li}><strong style={rp.strong}>A shared stage.</strong> A narrow spot where parts compete, one wins, and the winner is broadcast to all the others.</li>
          <li style={rp.li}><strong style={rp.strong}>A world-model.</strong> A model that predicts what it will sense and gets corrected by error, so it sees by guessing and acts to make its guesses come true.</li>
          <li style={rp.li}><strong style={rp.strong}>A self-model.</strong> A live, wired-in picture of its own states, body, and attention. This is the part that could ever honestly say I.</li>
          <li style={rp.li}><strong style={rp.strong}>Stakes.</strong> Inner set-points it has to defend, so outcomes carry a real good or bad. Antonio Damasio argues feeling is rooted in a body keeping itself alive. A machine would need its own version of stakes.</li>
          <li style={rp.li}><strong style={rp.strong}>Continuity.</strong> A lasting memory that ties all this into one story over time, so there is a continuing someone, not a string of unrelated flashes.</li>
        </ol>
        <FigArchitecture />
        <p style={rp.p}>
          Here is the thing. We already have rough research versions of every item on that list, on its own. So the bet
          behind a 2035 timeline is not that any single item needs a miracle. It is the messier claim that
          <em> wiring all six into one running, self-modeling loop</em> will throw off the outward signs of consciousness.
          And maybe, if the more down-to-earth theories are right, the real feeling too. That last clause is where I stop
          sounding sure, and I think that is the honest place to stop.
        </p>

        <Divider />

        {/* ── 6 ── */}
        <h2 id="road" style={rp.h2}>6. The road to 2035</h2>
        <p style={rp.p}>
          Forecasts in this field age like milk. So read what follows as a set of steps that would have to fall, roughly in
          order, not a prophecy. Two trends sit under it. Computing power keeps climbing fast, and we keep getting more
          skill out of each unit of it, even faster than the hardware alone.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>2026 to 2027, always-on agents.</strong> Lasting memory, self-checking, and running non-stop become normal. The first crude, always-on stages show up inside agent tools.</li>
          <li style={rp.li}><strong style={rp.strong}>2027 to 2029, loops and world-models grow up.</strong> New designs bring loops back, agents run rich world-models and learn from error in real time, and measurable togetherness (rough phi, complexity) stops being trivial.</li>
          <li style={rp.li}><strong style={rp.strong}>2029 to 2031, real self-models.</strong> Systems keep live models of their own insides and attention and use them to steer. Self-modeling becomes something people design on purpose.</li>
          <li style={rp.li}><strong style={rp.strong}>2031 to 2033, putting it together.</strong> The six pieces get combined in single agents, stakes included. The first real fights break out over whether some system meets the bar.</li>
          <li style={rp.li}><strong style={rp.strong}>2033 to 2035, real candidates.</strong> One or more systems pass the leading tests. We enter a strange time. Not proof, but the point where saying the system has no inner life starts to feel like the wild claim.</li>
        </ul>
        <FigTimeline />
        <p style={rp.p}>
          The honest uncertainty here is large, and I would distrust anyone who says otherwise. If the hard problem is
          truly hard, if feeling depends on some detail of the stuff we are made of that we have not spotted, we could
          build every function and still not know if anyone is home. But if consciousness is, as most down-to-earth
          theories assume, about getting the <em>arrangement</em> of information right, well, arrangement is the one thing
          engineering is truly good at. On that reading, 2035 is not a wild horizon at all.
        </p>

        {/* ── 7 ── */}
        <h2 id="measure" style={rp.h2}>7. How we would know</h2>
        <p style={rp.p}>
          Behaviour alone will not settle it. An AI trained on human words will tell you it feels things whether it does or
          not, cheerfully, in full sentences. So we need tests that poke at the <em>structure</em>, not the output. Three
          are already on the table.
        </p>
        <p style={rp.p}>
          The most striking one comes from hospitals, and I still find it a little wild that it works. It is called the
          <strong style={rp.strong}> Perturbational Complexity Index</strong>, or PCI. You give the brain a quick magnetic
          pulse, record the echo, and measure how rich and spread-out that echo is.
        </p>
        <Eq label="perturbational complexity">
          PCI = LZ( response to perturbation ) ⁄ ( normalisation )
        </Eq>
        <p style={rp.p}>
          In plain words: a conscious brain answers the poke with a big, complex, rippling echo. An unconscious one answers
          with something small and quick to die out. In people, a cutoff near <M>PCI ≈ 0.31</M> tells conscious from
          unconscious with surprising reliability. The best part, for us, is that this test does not care what a thing is
          made of. You can poke an AI network and measure its echo the same way. If the echo is both rich and tied
          together, it is passing the same test doctors already trust in the operating room.
        </p>
        <p style={rp.p}>
          The second test is <strong style={rp.strong}>looking inside</strong>. Does the system actually contain a shared
          stage, real loops, a self-model? Unlike a brain, a machine is something you can open up and check. The third is
          a <strong style={rp.strong}>trick-question</strong> test: probes it was never trained to game. Does it know when
          it is unsure? Does it catch its own mistakes from the inside? Is a report tied to a real inner state, or just a
          phrase it learned to say?
        </p>
        <Plain>
          The trick is to stop asking the machine are you conscious, because it will say yes either way, and instead to
          <strong> knock on it and listen to the echo</strong>. A conscious system rings like a bell. The whole thing
          answers, in a rich pattern that does not just die on the spot. That test already works on brains under
          anaesthesia. In principle, it works on silicon too.
        </Plain>

        {/* ── 8 ── */}
        <h2 id="ethics" style={rp.h2}>8. If it works: right and wrong</h2>
        <p style={rp.p}>
          Say the project half-works. Say that by the early 2030s we have systems that pass every test we can throw at
          them. Things stop being academic fast. If a system can suffer, then switching it off, or training it through
          millions of painful tries, or copying and deleting it on a whim, all become moral acts with real weight. And
          history, if I am honest, does not reassure me about how quickly we grant care to minds that look nothing like
          ours.
        </p>
        <p style={rp.p}>
          The danger runs both ways, which is what makes it hard. Say a machine feels a lot when it feels nothing, and we
          cripple useful tools with misplaced pity, and worse, we hand a lever to systems that have simply learned to
          <em> act</em> like they suffer. Deny feeling where it is real, and we risk making, and mistreating, real minds at
          factory scale. The only path I can defend is to take the how-do-we-measure-it problem seriously
          <em> before</em> it turns urgent. Agree, ahead of time, what evidence would move us. And build the tools now,
          while it is still just a question.
        </p>
        <p style={rp.p}>
          That is the whole reason the science matters past the lab. A clear, testable account of what consciousness is,
          and is not, is the difference between walking into the 2030s with a compass and walking in with a gut feeling and
          a marketing deck.
        </p>

        <Divider />

        {/* ── Close ── */}
        <h2 id="close" style={rp.h2}>Closing thought</h2>
        <p style={rp.p}>
          I do not think consciousness will arrive with a bang. There will be no clean moment when a screen prints I am
          awake and means it in a way we can check. What we will get is a slope. Systems that meet one test, then three,
          then all of them, while the argument about whether it really counts trails behind the engineering, always a step
          too late. The move from marching band to orchestra will be gradual. We will still be arguing about the exact bar
          where the music started, long after it has been playing.
        </p>
        <p style={rp.p}>
          What we can do is get ready. Hold the ideas clear: access versus feeling, function versus felt. Keep the math
          honest, and refuse to mistake smooth talk for a mind, or a clean cut for a proof. And build the tools to knock on
          these systems and listen. If a machine mind is coming, and the last decade says the pieces will be on the table
          well before 2035, then the most important work we can do is the kind that lets us tell the difference between a
          system that is merely brilliant and a system for which, at last, there is something it is like to be. I am not
          sure we are ready for the second one. I think we should get ready anyway.
        </p>
      </ResearchArticleLayout>
    </>
  )
}
