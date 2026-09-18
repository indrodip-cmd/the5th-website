import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Eq, Divider, M } from '../ui'
import { FigBackpropFA, FigPredictiveCoding, FigManifold } from '../figures'

const post = getPost('brain-ai-algorithmic-bridge')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['align', '1. Measuring the match'],
  ['credit', '2. The learning puzzle'],
  ['approx', '3. How the brain might learn'],
  ['pc', '4. The idea that ties it together'],
  ['geometry', '5. The shape of thoughts'],
  ['converge', '6. Why they end up alike'],
  ['interface', '7. Reading and writing the brain'],
  ['falsify', '8. What would prove me wrong'],
]

export default function Article() {
  const lead = (
    <>
      We usually talk about brains and AI with a loose comparison. It is kind of like the brain, we say, and nobody means
      it too seriously. I want to argue that the comparison has quietly stopped being loose. Three findings pushed it over.
      AI trained only to do a task turns out to be the best predictor we have of real brain activity. Very different
      systems learn very similar inner patterns. And the way AI learns, which we thought was hopelessly artificial, has
      versions the brain could plausibly run too. This piece treats the brain-and-AI link the way a curious reader
      deserves. There is some math. I explain every piece in plain words.
    </>
  )
  const objective = (
    <>
      My goal was to test a claim I kept hearing, that brains and AI are basically the same thing, and see how literally
      the evidence lets me take it. So I worked through the ways we measure the match, the ways these systems learn, and
      the brain-reading research, looking for where the comparison is real and where it quietly breaks.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* 1 */}
        <h2 id="align" style={rp.h2}>1. Measuring the match</h2>
        <p style={rp.p}>
          The whole thing rests on one hard question. How do you measure whether two systems have similar inner patterns,
          when they have different sizes, share no cells, and use no common map? Three tools do most of the work, and the
          differences between them matter.
        </p>
        <p style={rp.p}>
          The first tool asks the toughest version. Can a simple, straight-line map from the AI’s inner features predict
          the brain’s real activity to the same pictures? You fit that map and score how well it does on data it never saw.
        </p>
        <Eq label="neural predictivity">
          Ŵ = argmin<sub>W</sub> ‖ Y − Φ(S) W ‖²<sub>F</sub> + λ‖W‖²<sub>F</sub> ;  score = corr( Y<sub>test</sub> , Φ(S<sub>test</sub>) Ŵ )
        </Eq>
        <p style={rp.p}>
          In plain words: find the best simple map from the model to the brain, then see how well it predicts brain data it
          has not seen. This is the logic behind Yamins and DiCarlo’s 2014 result: the middle layers of a task-trained
          vision network are the best predictor we have of activity in the monkey visual brain. The map is kept simple on
          purpose, because a simple readout is something real biology could do too. So a good simple match is a hint that
          the model and the brain lay information out the same way.
        </p>
        <p style={rp.p}>
          The second tool (Kriegeskorte and colleagues, 2008) skips the map. For each system you ask: which pictures does it
          treat as similar, and which as different? Then you compare those similarity patterns across the two systems. It
          does not care about size or map, but it throws away which features carry the pattern.
        </p>
        <p style={rp.p}>
          The third tool, CKA (Kornblith and colleagues, 2019), is now the go-to for comparing two systems. The formula is:
        </p>
        <Eq label="linear CKA">
          CKA(X, Y) = ‖ YᵀX ‖²<sub>F</sub>  ⁄  ( ‖ XᵀX ‖<sub>F</sub> · ‖ YᵀY ‖<sub>F</sub> )
        </Eq>
        <p style={rp.p}>
          In plain words: it gives a score from 0 to 1 for how alike two systems’ patterns are, ignoring things that should
          not matter, like rotating the picture, while still noticing real differences.
        </p>
        <p style={rp.p}>
          One warning runs under all of this. A good match is necessary, but not proof. Two systems can share a slice you
          can read easily and still differ in everything the probe cannot see. Treat these scores as clues about a shared
          format, checked across several tools, not as a verdict.
        </p>

        {/* 2 */}
        <h2 id="credit" style={rp.h2}>2. The learning puzzle</h2>
        <p style={rp.p}>
          AI learns by a method called backpropagation (Rumelhart, Hinton and Williams, 1986). When it makes a mistake, the
          error is passed backward through the layers to fix each connection:
        </p>
        <Eq label="backpropagation">
          δ<sup>l</sup> = ( (W<sup>l+1</sup>)ᵀ δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  ΔW<sup>l</sup> = −η · δ<sup>l</sup> (a<sup>l−1</sup>)ᵀ
        </Eq>
        <p style={rp.p}>
          In plain words: the error travels back through the exact same connections it came forward through, and nudges
          each one. That last bit is the problem for the brain. It needs the exact same wiring, used backward. Real brain
          cells do not seem to have that neat mirror. Francis Crick pointed this out in 1989, and for about twenty years it
          stood as near-proof that the brain does not learn this way. The last decade mostly dissolved that proof. That is
          the part I did not see coming.
        </p>

        {/* 3 */}
        <h2 id="approx" style={rp.h2}>3. How the brain might learn</h2>
        <p style={rp.p}>
          The first surprise is called feedback alignment (Lillicrap and colleagues, 2016). It turns out the backward path
          does not need the exact same wiring. You can use <em>random</em>, fixed connections instead:
        </p>
        <Eq label="feedback alignment">
          δ<sup>l</sup> = ( B<sup>l+1</sup> δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  B fixed, random
        </Eq>
        <p style={rp.p}>
          In plain words: send the error back through random wiring, and the network still learns. What happens is quietly
          neat. The forward connections slowly shift to line up with the random ones, so the forward path teaches itself to
          make random feedback useful. The mirror problem just disappears. It is not perfect, and it struggles on very deep
          networks, which is why people built better versions after it.
        </p>
        <p style={rp.p}>
          A second idea, target propagation (Bengio; Lee and colleagues, 2015), sends back <em>goals</em> instead of error.
          Each layer just tries to hit a good target for itself. A global problem becomes a stack of small local ones.
        </p>
        <p style={rp.p}>
          The third, to my eye the most beautiful, is equilibrium propagation (Scellier and Bengio, 2017). The network
          settles into a resting state. Then you gently nudge the output toward the right answer and let it settle again.
          The fix for every connection falls out of the difference between the two resting states:
        </p>
        <Eq label="equilibrium propagation">
          ∂L ⁄ ∂θ  =  lim<sub>β→0</sub>  (1⁄β) ( ∂E⁄∂θ |<sub>nudged</sub> − ∂E⁄∂θ |<sub>free</sub> )
        </Eq>
        <p style={rp.p}>
          In plain words: no separate backward network, no special error wires. The same cells that ran the thinking work
          out the fix from their own two resting states. That is exactly the kind of simple, local rule a real brain, or a
          brain-like chip, could actually run.
        </p>
        <FigBackpropFA />

        {/* 4 */}
        <h2 id="pc" style={rp.h2}>4. The idea that ties it together</h2>
        <p style={rp.p}>
          Here is the link I keep coming back to. Predictive coding, a mainstream brain theory since Rao and Ballard (1999),
          turns out to closely match backpropagation, using only local rules. Each level of the brain predicts the level
          below. Only the <em>errors</em> travel up. And the whole stack works to shrink one quantity:
        </p>
        <Eq label="predictive-coding energy">
          F = Σ<sub>l</sub>  (1 ⁄ 2Σ<sub>l</sub>) ‖ ε<sub>l</sub> ‖² ,  ε<sub>l</sub> = x<sub>l</sub> − W<sub>l</sub> f(x<sub>l+1</sub>)
        </Eq>
        <p style={rp.p}>
          In plain words: each level guesses what the level below is doing, and only the mismatch gets sent up. Both
          thinking and learning just shrink the total mismatch, and each update needs only what is right next to it:
        </p>
        <Eq label="local inference + learning">
          ẋ<sub>l</sub> ∝ − ∂F⁄∂x<sub>l</sub> = −(ε<sub>l</sub> ⁄ Σ<sub>l</sub>) + f′(x<sub>l</sub>) ⊙ (W<sub>l−1</sub>ᵀ ε<sub>l−1</sub> ⁄ Σ<sub>l−1</sub>) ;  ΔW<sub>l</sub> ∝ (ε<sub>l</sub> ⁄ Σ<sub>l</sub>) f(x<sub>l+1</sub>)ᵀ
        </Eq>
        <FigPredictiveCoding />
        <p style={rp.p}>
          Then Whittington and Bogacz (2017) proved the punchline. Once the error units settle, these local brain-style
          updates match the backpropagation updates of the matching AI, as closely as you like. Later work pushed the match
          further. Sit with what that means. The method we invented for machines and the method the brain may run for
          seeing are, in the right limit, the <em>same</em> method. They differ only in how the error signal is physically
          carried. Predictive coding ties the brain’s story to deep learning’s story.
        </p>

        <Divider />

        {/* 5 */}
        <h2 id="geometry" style={rp.h2}>5. The shape of thoughts</h2>
        <p style={rp.p}>
          Thoughts are not really lists of numbers. They are shapes. A group of <M>N</M> brain cells responding to many
          things traces out a low-dimensional shape inside a big space, and it is the shape, not any single cell, that
          gets read by the rest of the brain. How many dimensions that shape really uses is captured here:
        </p>
        <Eq label="participation ratio">
          PR = ( Σ<sub>i</sub> λ<sub>i</sub> )²  ⁄  Σ<sub>i</sub> λ<sub>i</sub>²
        </Eq>
        <p style={rp.p}>
          In plain words: a big population of cells usually uses far fewer real dimensions than it has cells. And motor and
          planning areas look more like a moving system, a path tracing across a shape, than a fixed lookup table (Gallego
          and colleagues, 2017). Trained AI networks solve tasks with the same kind of structure, and that structure keeps
          turning up across very different designs, which is exactly the kind of match you would hope to see. Honestly, it
          is a little eerie that it holds.
        </p>
        <p style={rp.p}>
          The theory that ties shape to function is manifold capacity (Chung, Lee and Sompolinsky, 2018). Ask how many
          separate object shapes a set of cells can cleanly tell apart:
        </p>
        <Eq label="manifold capacity">
          α<sub>c</sub> ≈ α<sub>0</sub>( R<sub>eff</sub> , D<sub>eff</sub> ) ,  with  α<sub>c</sub> → 2  as  R → 0
        </Eq>
        <FigManifold />
        <p style={rp.p}>
          In plain words: as information climbs a good system, brain or AI, the shapes for different objects shrink and
          untangle, and become easy to tell apart with a simple readout. That gives us a shared ruler. You can measure, in
          the same units, how the human visual brain and a vision network each reshape the same pictures, and they do it in
          strikingly similar ways.
        </p>

        {/* 6 */}
        <h2 id="converge" style={rp.h2}>6. Why they end up alike</h2>
        <p style={rp.p}>
          So we keep bumping into the same finding. Task-trained AI looks like the brain, and separately trained AIs look
          like each other. That needs an explanation with nothing to do with shared wiring, because there is none.
        </p>
        <p style={rp.p}>
          Huh and colleagues (2024) call it the Platonic Representation idea. Systems trained on different data, with
          different goals, at enough scale, drift toward the same inner picture of how the world really works. The reason
          is pressure, not luck. A picture that has to handle many tasks, work on new cases, and stay steady is pushed
          toward the world’s true underlying parts. And there is far less room in that target than in the space of possible
          networks.
        </p>
        <p style={rp.p}>
          The math backs this up. Under certain training goals, systems provably recover the world’s true hidden factors,
          up to small, harmless changes, the exact kinds of changes our matching tools are built to see through. So if two
          systems each recover the same factors, our tools report a match. The matching and our ability to measure it are
          two sides of one fact. Evolution and machine training are just two different searches over the same landscape,
          set by one shared world. Ending up alike is what that looks like from outside.
        </p>

        {/* 7 */}
        <h2 id="interface" style={rp.h2}>7. Reading and writing the brain</h2>
        <p style={rp.p}>
          This link is not only an explanation. It is a tool. Brain decoding pulls what a person is trying to do, move a
          hand, say a word, out of brain activity. The most you can ever pull out is set by how much information the
          activity carries:
        </p>
        <Eq label="decodable information">
          I(k ; r) ≥ H(k) − H(k | k̂(r)) ,  P<sub>e</sub> ≥ ( H(k | r) − 1 ) ⁄ log|K|
        </Eq>
        <p style={rp.p}>
          In plain words: there is a hard ceiling on what any decoder can recover, set by the signal itself. The old
          decoders were simple filters. The state of the art is openly a brain-and-AI hybrid. Deep models clean up messy
          brain signals and read them as smooth paths. These are the systems behind the headlines. Willett and colleagues
          decoded attempted handwriting at about 90 characters a minute (2021) and attempted speech at roughly 60 to 70
          words a minute (2023) from the motor brain, because deep models turn noisy activity into clean, structured paths.
        </p>
        <p style={rp.p}>
          The real headache is that the signal drifts. The cells you record shift from day to day and differ from person
          to person, so a decoder trained today quietly rots by tomorrow. The fix is to line up each new day’s signal with
          a stable inner shape and reuse the decoder. It is a matching problem:
        </p>
        <Eq label="latent alignment (Procrustes)">
          Q<sub>∗</sub> = argmin<sub>QᵀQ = I</sub> ‖ Z<sub>new</sub> Q − Z<sub>ref</sub> ‖²<sub>F</sub>
        </Eq>
        <p style={rp.p}>
          In plain words: rotate today’s signal until it lines up with a saved reference, and the decoder keeps working.
          Gallego and colleagues (2020) showed this inner shape holds across months, and even across people, which is what
          makes stable, reusable brain interfaces possible at all. Closing the loop, writing signal back in through the
          same shape, is the frontier. It is where brain reading and brain understanding finally become one job.
        </p>

        <Divider />

        {/* 8 */}
        <h2 id="falsify" style={rp.h2}>8. What would prove me wrong</h2>
        <p style={rp.p}>
          A serious claim names how it could fail, so here are the ways this one could. The link gets weaker if the good
          match turns out to come mostly from the flexible map, not the model, so that even untrained networks predict the
          brain about as well. It gets weaker if bigger training makes systems <em>less</em> alike, not more. It gets
          weaker if the predictive-coding-and-backprop match only holds under neat assumptions that real brains break. And
          it gets weaker if brain decoding rests on the task, not on a truly stable inner shape. Each of these is a
          concrete, testable claim, and each is being tested right now. That is more than you can say for most grand
          unifying stories.
        </p>
        <p style={rp.p}>
          But a lot has already survived. We can measure how alike two systems are with no shared parts. We have removed
          the old objection that the brain cannot do gradient learning. We have a simple, local rule that provably matches
          backpropagation. We can measure the shape brains and AIs impose on the same input and watch it change the same
          way. And we can read intended movement and speech straight out of the brain, and line those readings up over
          time, using the very models the brain science helped inspire. The brain-and-AI link has grown up. It has gone
          from a loose comparison to a shared language, one where a learning rule, a shape, and a brain interface keep
          turning out to be the same thing, seen from two sides.
        </p>
      </ResearchArticleLayout>
    </>
  )
}
