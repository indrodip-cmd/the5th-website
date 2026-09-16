import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Eq, Divider, M } from '../ui'
import { FigBackpropFA, FigPredictiveCoding, FigManifold } from '../figures'

const post = getPost('brain-ai-algorithmic-bridge')!

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
  ['align', '1. Measuring alignment: RSA, CKA, encoding models'],
  ['credit', '2. The credit-assignment problem'],
  ['approx', '3. Plausible approximations to backprop'],
  ['pc', '4. Predictive coding, the unifying substrate'],
  ['geometry', '5. Population geometry and manifold capacity'],
  ['converge', '6. Why the representations converge'],
  ['interface', '7. The read/write interface'],
  ['falsify', '8. What would falsify the bridge'],
]

export default function Article() {
  const lead = (
    <>
      We usually talk about brains and artificial neural networks with a metaphor, a loose “it is kind of like the brain”
      that nobody is meant to take literally. I want to argue that the metaphor has quietly stopped being a metaphor.
      Three results pushed it over: deep networks trained only to do a task turn out to be, so far, the best predictors we
      have of real neural responses in sensory cortex; the representations that very different systems learn are
      measurably similar, and more similar as they scale; and backpropagation, the learning rule we assumed was
      hopelessly artificial, has biological approximations that actually work. So this piece treats the brain and AI
      connection the way a technical reader deserves, as a set of alignment metrics, learning rules, geometric objects,
      and interface equations. The mathematics does the talking.
    </>
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={<>My goal was to test a claim I kept hearing, that brains and AI are “basically the same thing,” and to see how literally the evidence lets me take it. So I worked through the alignment metrics, the learning rules, and the neural-interface research myself, looking for where the comparison is genuinely real and where it quietly falls apart.</>}>
        {/* ── 1 ── */}
        <h2 id="align" style={rp.h2}>1. Measuring alignment: RSA, CKA, encoding models</h2>
        <p style={rp.p}>
          The whole empirical bridge depends on one awkward practical question. How do you measure whether two
          representations are similar when the systems have different dimensionalities, share no neurons, and sit in no
          common coordinate frame? Three families of methods dominate, and the differences between them matter more than
          people usually admit.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Encoding models</strong> ask the hardest version of the question. Can a linear map
          from model features <M>Φ(S)</M> predict held-out neural responses <M>Y</M> to the same stimuli <M>S</M>? You fit
          ridge regression and score the noise-corrected correlation on data the fit never saw:
        </p>
        <Eq label="neural predictivity">
          Ŵ = argmin<sub>W</sub> ‖ Y − Φ(S) W ‖²<sub>F</sub> + λ‖W‖²<sub>F</sub> ;  score = corr( Y<sub>test</sub> , Φ(S<sub>test</sub>) Ŵ )
        </Eq>
        <p style={rp.p}>
          This is the logic behind Yamins and DiCarlo’s 2014 result, that the intermediate layers of a
          performance-optimised convolutional network are the best available predictors of macaque V4 and IT population
          responses, and behind the Brain-Score benchmark that later formalised it. The important detail is that the
          mapping is forced to be <em>linear</em>. A linear decoder is assumed to be within reach of downstream biology,
          so linear predictivity gets read as evidence that model and cortex expose information in the same format. That
          assumption is load-bearing, and I will poke at it in a moment.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Representational Similarity Analysis</strong> (Kriegeskorte et al., 2008) skips the
          mapping altogether. For each system you build a representational dissimilarity matrix, an RDM, over the stimuli,
          with <M>D<sub>ij</sub> = 1 − corr(r<sub>i</sub>, r<sub>j</sub>)</M>, and then you compare the two RDMs. Because
          the RDM lives in stimulus space rather than neuron space, it does not care about rotation or how many units you
          have. The price you pay is that it throws away which features actually carry the geometry.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Centered Kernel Alignment</strong> (Kornblith et al., 2019) has become the default for
          comparing model to model and model to brain. It is invariant to orthogonal transformation and to isotropic
          scaling, but, unlike CCA, it is <em>not</em> invariant to arbitrary invertible linear maps, and that last
          stubbornness is exactly what makes it discriminative. Linear CKA between centered activation matrices <M>X</M>
          and <M>Y</M> is:
        </p>
        <Eq label="linear CKA">
          CKA(X, Y) = ‖ YᵀX ‖²<sub>F</sub>  ⁄  ( ‖ XᵀX ‖<sub>F</sub> · ‖ YᵀY ‖<sub>F</sub> )
        </Eq>
        <p style={rp.p}>
          One caution runs under all of this, and I think it is worth stating plainly. High linear predictivity is
          necessary but not sufficient for representational identity. Two systems can share a linearly decodable subspace
          and still disagree about everything the probe cannot see, and a readout that is expressive enough can manufacture
          alignment that says more about the probe than the representation. So treat alignment scores as hypotheses about
          a shared format, to be triangulated across several metrics, not as a verdict.
        </p>

        {/* ── 2 ── */}
        <h2 id="credit" style={rp.h2}>2. The credit-assignment problem</h2>
        <p style={rp.p}>
          Deep networks learn by backpropagation (Rumelhart, Hinton and Williams, 1986). The loss gradient travels
          backward through the layers using the transpose of the forward weights:
        </p>
        <Eq label="backpropagation">
          δ<sup>l</sup> = ( (W<sup>l+1</sup>)ᵀ δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  ΔW<sup>l</sup> = −η · δ<sup>l</sup> (a<sup>l−1</sup>)ᵀ
        </Eq>
        <p style={rp.p}>
          For a cortical circuit to run this, three requirements crash straight into neurobiology. First there is the
          <strong style={rp.strong}> weight-transport problem</strong>. The backward pass needs the exact transpose
          <M> (W<sup>l+1</sup>)ᵀ</M>, which implies a feedback synapse whose strength mirrors a separate feedforward
          synapse, a symmetry nobody has found a biological mechanism for. Second, the backward pass is a
          <strong style={rp.strong}> distinct, linear computation</strong> using the derivatives <M>σ′</M>, whereas real
          cortical feedback drives the same spiking units as feedforward drive. Third, the gradients have to be
          <strong style={rp.strong}> held and shuttled around</strong> without disturbing the activity that is still going
          on. Francis Crick pointed at the transport problem back in 1989, and for roughly twenty years it stood as a kind
          of proof that the brain simply does not do gradient descent. The last decade has, more or less, dissolved that
          proof. That is the part I did not see coming.
        </p>

        {/* ── 3 ── */}
        <h2 id="approx" style={rp.h2}>3. Plausible approximations to backprop</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>Feedback alignment</strong> (Lillicrap et al., 2016) delivered the first genuine
          surprise. The feedback weights do not need to be the transpose of the forward weights. They do not even need to
          be learned. Replace them with a <em>fixed random</em> matrix <M>B</M>:
        </p>
        <Eq label="feedback alignment">
          δ<sup>l</sup> = ( B<sup>l+1</sup> δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  B fixed, random
        </Eq>
        <p style={rp.p}>
          and the network still learns. What happens is quietly elegant: during training the forward weights rotate until
          <M> W</M> lines up approximately with <M>Bᵀ</M>, so the forward pathway teaches itself to make the random
          feedback useful. The transport requirement just disappears. It is not perfect, it degrades in very deep
          convolutional regimes, and that limitation is what motivated sign-symmetry and direct-feedback-alignment variants
          that claw back most of the performance while keeping the biology cheap.
        </p>
        <FigBackpropFA />
        <p style={rp.p}>
          <strong style={rp.strong}>Target propagation</strong> (Bengio; Lee et al., 2015) goes a different way. Instead of
          shipping gradients backward, it ships <em>targets</em>, meaning desirable activity patterns for each layer,
          computed by learned approximate inverses <M>g<sub>l</sub> ≈ f<sub>l</sub><sup>−1</sup></M>. Each layer then just
          reduces a local reconstruction loss toward its target. A global gradient problem becomes a stack of local ones,
          and the inverse it needs looks a lot like an autoencoder, which gives it an obvious feedback reading.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Equilibrium propagation</strong> (Scellier and Bengio, 2017) is, to my eye, the most
          beautiful of the three, at least for energy-based systems that could be built in physical hardware. A network
          with energy <M>E(θ, x, s)</M> relaxes to a free-phase fixed point <M>s<sub>∗</sub></M>. Then you nudge the output
          gently toward the target with strength <M>β</M> and let it relax again. The gradient of the supervised loss falls
          out of the difference between the two equilibria, using only quantities each synapse can see locally:
        </p>
        <Eq label="equilibrium propagation">
          ∂L ⁄ ∂θ  =  lim<sub>β→0</sub>  (1⁄β) ( ∂E⁄∂θ |<sub>nudged</sub> − ∂E⁄∂θ |<sub>free</sub> )
        </Eq>
        <p style={rp.p}>
          No separate backward network. No dedicated error-carrying wire. The same neurons and synapses that ran the
          inference compute the weight update out of their own two resting states. That is precisely the kind of two-phase,
          local-rule scheme a physical substrate, biological or neuromorphic, could actually run.
        </p>

        {/* ── 4 ── */}
        <h2 id="pc" style={rp.h2}>4. Predictive coding, the unifying substrate</h2>
        <p style={rp.p}>
          Here is the connection I keep coming back to. Predictive coding, a mainstream account of cortical hierarchy since
          Rao and Ballard (1999), approximates backpropagation under a local update rule. In a hierarchical Gaussian
          generative model, each level predicts the level below, only the residual prediction errors
          <M> ε<sub>l</sub></M> travel upward, and the whole hierarchy minimises one sum-of-squared-errors energy, which is
          the same thing as a Gaussian variational free energy:
        </p>
        <Eq label="predictive-coding energy">
          F = Σ<sub>l</sub>  (1 ⁄ 2Σ<sub>l</sub>) ‖ ε<sub>l</sub> ‖² ,  ε<sub>l</sub> = x<sub>l</sub> − W<sub>l</sub> f(x<sub>l+1</sub>)
        </Eq>
        <p style={rp.p}>
          Inference is gradient descent on <M>F</M> in the activity variables. Learning is gradient descent on <M>F</M> in
          the weights. Both are strictly local, in the sense that each update needs only the pre-synaptic activity and the
          error unit sitting right next to it:
        </p>
        <Eq label="local inference + learning">
          ẋ<sub>l</sub> ∝ − ∂F⁄∂x<sub>l</sub> = −(ε<sub>l</sub> ⁄ Σ<sub>l</sub>) + f′(x<sub>l</sub>) ⊙ (W<sub>l−1</sub>ᵀ ε<sub>l−1</sub> ⁄ Σ<sub>l−1</sub>) ;  ΔW<sub>l</sub> ∝ (ε<sub>l</sub> ⁄ Σ<sub>l</sub>) f(x<sub>l+1</sub>)ᵀ
        </Eq>
        <FigPredictiveCoding />
        <p style={rp.p}>
          Whittington and Bogacz (2017) then proved the punchline: once the error units settle to equilibrium, these local
          updates equal the backpropagation gradients of the corresponding deep network, to arbitrary precision. Later work
          from Millidge, Song, Salvatori and colleagues tightened the result and pushed it past the original
          fixed-prediction assumptions. Sit with what that means for a second. The operation we invented for machines and
          the operation the cortex may run for perception are, in a well-defined limit, the <em>same</em> optimisation.
          They differ only in how the error signal is physically carried. Predictive coding, in other words, stitches the
          free-energy story of the brain (Friston, 2010) to the gradient story of deep learning.
        </p>

        <Divider />

        {/* ── 5 ── */}
        <h2 id="geometry" style={rp.h2}>5. Population geometry and manifold capacity</h2>
        <p style={rp.p}>
          Representations are not really lists of tuning curves. They are geometric objects. A population of <M>N</M>
          neurons responding across a set of conditions traces out a low-dimensional manifold inside the
          <M> N</M>-dimensional firing-rate space, and it is the geometry of that manifold, not the tuning of any single
          cell, that downstream circuits and linear decoders actually read off. The effective dimensionality is captured
          by the participation ratio of the covariance eigenvalues:
        </p>
        <Eq label="participation ratio">
          PR = ( Σ<sub>i</sub> λ<sub>i</sub> )²  ⁄  Σ<sub>i</sub> λ<sub>i</sub>²
        </Eq>
        <p style={rp.p}>
          In practice, both cortical populations and trained network layers use far fewer dimensions than they have units,
          and motor and prefrontal cortex look more like <strong style={rp.strong}>dynamical systems</strong>, trajectories
          flowing across a manifold, than like static encoders (Gallego, Perich, Miller and Solla, 2017; Vyas et al.,
          2020). Sussillo and Barak (2013) showed trained RNNs solve tasks by arranging fixed points and the linearised
          flow around them, and Maheswaranathan et al. (2019) found that solution to be <em>universal</em> across
          architectures. The same topology of fixed points shows up whether the unit is an LSTM cell or a plain rectifier.
          That is exactly the sort of convergence you would hope to see between artificial and biological recurrent
          circuits, and honestly it is a little eerie that it holds.
        </p>
        <p style={rp.p}>
          The theory tying geometry to function is <strong style={rp.strong}>manifold capacity</strong> (Chung, Lee and
          Sompolinsky, 2018). Ask how many object manifolds of radius <M>R</M> and dimension <M>D</M> can be linearly
          separated by <M>N</M> neurons. The critical load per neuron <M>α<sub>c</sub> = P ⁄ N</M> is set by the effective
          radius and dimension of those manifolds:
        </p>
        <Eq label="manifold capacity">
          α<sub>c</sub> ≈ α<sub>0</sub>( R<sub>eff</sub> , D<sub>eff</sub> ) ,  with  α<sub>c</sub> → 2  as  R → 0
        </Eq>
        <FigManifold />
        <p style={rp.p}>
          As information climbs a good hierarchy, biological or artificial, the object manifolds shrink and untangle,
          capacity rises, and invariant categories become linearly separable. That hands us a common currency. You can
          measure, in the very same units, how the ventral stream and a deep vision network each reshape the geometry of
          the same images, and what you find is that they do it in strikingly parallel ways.
        </p>

        {/* ── 6 ── */}
        <h2 id="converge" style={rp.h2}>6. Why the representations converge</h2>
        <p style={rp.p}>
          So we keep bumping into the same finding. Task-optimised networks resemble cortex, and independently trained
          models resemble each other. That demands an explanation that has nothing to do with shared wiring, because there
          is no shared wiring. Huh et al. (2024) call it the <strong style={rp.strong}>Platonic Representation Hypothesis</strong>:
          systems trained on different data, with different objectives, at enough scale, drift toward a shared statistical
          model of the world’s underlying generative structure. The driver is constraint, not coincidence. A
          representation forced to support many tasks, generalise out of distribution, and stay robust gets pushed toward
          the environment’s true latent variables, and there is a lot less room in that target than in the space of
          networks that could exist.
        </p>
        <p style={rp.p}>
          Identifiability theory gives the argument a formal spine. Under contrastive and self-supervised objectives, the
          learned features provably recover the true latent factors up to a limited class of transformations, linear, or
          permutation and scaling. That happens to be the exact equivalence class RSA and CKA were built to see through.
          So if two systems each recover the same latents up to a rotation, rotation-invariant metrics will report a
          match. The convergence and our ability to measure it are two faces of one identifiability result. Evolution and
          gradient descent are just different search procedures crawling over the same loss landscape that a shared
          physical world imposes. Convergent representation is what optimisation under shared constraints looks like from
          the outside.
        </p>

        {/* ── 7 ── */}
        <h2 id="interface" style={rp.h2}>7. The read/write interface</h2>
        <p style={rp.p}>
          The connection is not only explanatory. It is also a tool. Neural decoding recovers task variables <M>k</M>, such
          as kinematics, phonemes, or intended text, from population activity <M>r</M>. The ceiling on what any decoder can
          pull out is set by the mutual information the population carries, bounded below through Fano’s inequality by the
          error of the best possible decoder:
        </p>
        <Eq label="decodable information">
          I(k ; r) ≥ H(k) − H(k | k̂(r)) ,  P<sub>e</sub> ≥ ( H(k | r) − 1 ) ⁄ log|K|
        </Eq>
        <p style={rp.p}>
          The old decoders were linear filters or Kalman filters over binned spikes. The state of the art is now openly a
          brain and AI hybrid. Latent variable models like LFADS (Pandarinath et al., 2018) fit a nonlinear dynamical
          system whose inferred latents clean up single-trial activity, and sequence models, the Neural Data Transformer
          (Ye and Pandarinath, 2021) and cross-animal models such as POYO (Azabou et al., 2023), simply treat spike trains
          as token streams. These are the systems behind the clinical headlines. Willett et al. decoded attempted
          handwriting at about 90 characters per minute (2021) and attempted speech at roughly 60 to 70 words per minute
          (2023) from motor cortex, and they did it because deep sequence models turn noisy population dynamics into clean,
          structured latent trajectories.
        </p>
        <p style={rp.p}>
          The real technical headache is <strong style={rp.strong}>non-stationarity</strong>. Recorded units drift from
          session to session and differ from person to person, so a decoder trained today quietly rots by tomorrow. The fix
          is <strong style={rp.strong}>latent alignment</strong>, which is just the geometry from section 5 put to work.
          Because the underlying neural manifold stays stable even when the individual channels do not, you can align each
          new session’s activity to a canonical latent space and keep the decoder. Formally it is a Procrustes or CCA
          problem, finding the orthogonal <M>Q</M> that minimises the distance between the new latents and the reference:
        </p>
        <Eq label="latent alignment (Procrustes)">
          Q<sub>∗</sub> = argmin<sub>QᵀQ = I</sub> ‖ Z<sub>new</sub> Q − Z<sub>ref</sub> ‖²<sub>F</sub>
        </Eq>
        <p style={rp.p}>
          Gallego et al. (2020) showed these latent dynamics hold across months, and even across individuals, which is what
          makes stable, transferable interfaces possible at all. Closing the loop, writing structured stimulation back
          through the same aligned latent space so the cortex reads it as signal, is still the frontier. And it is the
          place where the representational-alignment programme and the interface programme finally collapse into a single
          engineering discipline.
        </p>

        <Divider />

        {/* ── 8 ── */}
        <h2 id="falsify" style={rp.h2}>8. What would falsify the bridge</h2>
        <p style={rp.p}>
          A programme worth trusting names its own failure modes, so here are the ones I take seriously. The bridge gets
          weaker, not stronger, if linear predictivity turns out to be driven mostly by the flexibility of the mapping
          rather than the model, so that untrained or randomly wired networks predict cortex nearly as well as trained ones
          (a live critique, and partly borne out for some early visual areas). It gets weaker if scaling
          <em> diverges</em> representations once objectives differ enough, which would contradict the Platonic hypothesis.
          It gets weaker if the predictive-coding and backprop equivalence only holds under fixed-prediction assumptions
          that real cortical microcircuits happen to break. And it gets weaker if decoding stability rests on task
          structure rather than a genuinely conserved neural manifold. Every one of those is a concrete, measurable claim,
          and every one is under active test right now, which is more than you can say for most grand unifying stories.
        </p>
        <p style={rp.p}>
          What has already survived, though, is a lot. We can quantify representational similarity across systems that
          share no substrate. We have removed the old theoretical objection that the brain cannot approximate gradient
          descent. We have a local, energy-based learning rule that provably recovers backpropagation. We can measure the
          geometry that brains and networks impose on the same inputs and watch it transform the same way. And we can read
          intended movement and speech straight out of cortex, then align those readings across time, using the very models
          the neuroscience helped inspire. The brain and AI connection has graduated from analogy into a shared formalism,
          one where a learning rule, a representational geometry, and an interface protocol are turning out to be the same
          object, just described from two directions at once.
        </p>
      </ResearchArticleLayout>
    </>
  )
}
