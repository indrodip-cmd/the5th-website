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
  ['align', '1. Measuring alignment: RSA, CKA, and encoding models'],
  ['credit', '2. The credit-assignment problem'],
  ['approx', '3. Biologically plausible approximations to backprop'],
  ['pc', '4. Predictive coding as the unifying substrate'],
  ['geometry', '5. Population geometry and manifold capacity'],
  ['converge', '6. Why the representations converge'],
  ['interface', '7. The read/write interface: decoding and alignment'],
  ['falsify', '8. What would falsify the bridge'],
]

export default function Article() {
  const lead = (
    <>
      The relationship between brains and artificial neural networks is usually told as metaphor. It is no longer a
      metaphor. Three converging results have turned it into an empirical programme: deep networks optimised only for
      task performance are, to date, the best quantitative predictors of neural responses in sensory cortex; the
      representations learned by wildly different systems are measurably similar and growing more so with scale; and
      the credit-assignment algorithm we thought was uniquely artificial — backpropagation — has plausible biological
      approximations. This piece treats the brain–AI connection as it should be treated for a technical audience: as a
      set of alignment metrics, learning rules, geometric objects, and interface equations. No analogies stand in for
      the mathematics.
    </>
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead}>
        {/* ── 1 ── */}
        <h2 id="align" style={rp.h2}>1. Measuring alignment: RSA, CKA, and encoding models</h2>
        <p style={rp.p}>
          The empirical bridge rests on being able to quantify how similar two representations are when the two systems
          have different dimensionalities, no shared neurons, and no privileged coordinate frame. Three families of
          methods dominate, and their differences matter.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Encoding models</strong> ask the strongest question: can a linear map from model
          features <M>Φ(S)</M> predict held-out neural responses <M>Y</M> to the same stimuli <M>S</M>? One fits ridge
          regression and scores the noise-corrected correlation on a held-out set:
        </p>
        <Eq label="neural predictivity">
          Ŵ = argmin<sub>W</sub> ‖ Y − Φ(S) W ‖²<sub>F</sub> + λ‖W‖²<sub>F</sub> ;  score = corr( Y<sub>test</sub> , Φ(S<sub>test</sub>) Ŵ )
        </Eq>
        <p style={rp.p}>
          This is the logic behind Yamins and DiCarlo’s 2014 result — that the intermediate layers of a
          performance-optimised convolutional network are the best available predictors of macaque V4 and IT population
          responses — and behind the Brain-Score benchmark that formalised it. The crucial property is that the mapping is
          fixed to be <em>linear</em>: a linear decoder is assumed to be within the reach of downstream biology, so linear
          predictivity is read as evidence that the model and the cortex expose information in the same format.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Representational Similarity Analysis</strong> (Kriegeskorte et al., 2008) sidesteps
          the mapping entirely. For each system one builds a representational dissimilarity matrix (RDM) over stimuli —
          <M> D<sub>ij</sub> = 1 − corr(r<sub>i</sub>, r<sub>j</sub>)</M> — and then compares the two RDMs. Because the RDM
          lives in stimulus-space rather than neuron-space, it is invariant to rotation and to the number of units. Its
          weakness is that it discards which features carry the geometry.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Centered Kernel Alignment</strong> (Kornblith et al., 2019) has become the default for
          model-to-model and model-to-brain comparison because it is invariant to orthogonal transformation and isotropic
          scaling but — unlike CCA — <em>not</em> invariant to arbitrary invertible linear maps, which is what makes it
          discriminative. Linear CKA between centered activation matrices <M>X</M> and <M>Y</M> is:
        </p>
        <Eq label="linear CKA">
          CKA(X, Y) = ‖ YᵀX ‖²<sub>F</sub>  ⁄  ( ‖ XᵀX ‖<sub>F</sub> · ‖ YᵀY ‖<sub>F</sub> )
        </Eq>
        <p style={rp.p}>
          A methodological caution runs through all of this: high linear predictivity is necessary, not sufficient, for
          representational identity. Two systems can share a linearly-decodable subspace while differing in everything the
          linear probe cannot see, and a sufficiently expressive readout can manufacture alignment that reflects the probe
          rather than the representation. Alignment scores are hypotheses about shared format, to be triangulated across
          metrics, not verdicts.
        </p>

        {/* ── 2 ── */}
        <h2 id="credit" style={rp.h2}>2. The credit-assignment problem</h2>
        <p style={rp.p}>
          Deep networks learn by backpropagation (Rumelhart, Hinton and Williams, 1986): the loss gradient is propagated
          backward through the layers using the transpose of the forward weights,
        </p>
        <Eq label="backpropagation">
          δ<sup>l</sup> = ( (W<sup>l+1</sup>)ᵀ δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  ΔW<sup>l</sup> = −η · δ<sup>l</sup> (a<sup>l−1</sup>)ᵀ
        </Eq>
        <p style={rp.p}>
          For a cortical circuit to implement this, three requirements collide with neurobiology. First, the
          <strong style={rp.strong}> weight-transport problem</strong>: the backward pass needs the exact transpose
          <M> (W<sup>l+1</sup>)ᵀ</M>, implying a feedback synapse whose strength mirrors a distinct feedforward synapse —
          a symmetry with no known biological mechanism. Second, the backward pass is a <strong style={rp.strong}>distinct,
          linear computation</strong> using the derivatives <M>σ′</M>, unlike the nonlinear forward pass, whereas cortical
          feedback drives the same kind of spiking units as feedforward drive. Third, gradients must be
          <strong style={rp.strong}> held and multiplexed</strong> without disturbing ongoing activity. Francis Crick
          flagged the transport problem in 1989; for two decades it was taken as a proof that the brain does not do
          gradient descent. The last decade has largely dissolved that argument.
        </p>

        {/* ── 3 ── */}
        <h2 id="approx" style={rp.h2}>3. Biologically plausible approximations to backprop</h2>
        <p style={rp.p}>
          <strong style={rp.strong}>Feedback alignment</strong> (Lillicrap et al., 2016) delivers the first surprise: the
          feedback weights need not be the transpose of the forward weights at all. Replace them with a
          <em> fixed random</em> matrix <M>B</M>,
        </p>
        <Eq label="feedback alignment">
          δ<sup>l</sup> = ( B<sup>l+1</sup> δ<sup>l+1</sup> ) ⊙ σ′(z<sup>l</sup>) ,  B fixed, random
        </Eq>
        <p style={rp.p}>
          and the network still learns, because during training the forward weights rotate until <M>W</M> comes into
          approximate alignment with <M>Bᵀ</M> — the forward pathway learns to make the random feedback a useful teacher.
          This removes the transport requirement outright. Its limits (it degrades in very deep convolutional regimes)
          motivated sign-symmetry and direct-feedback-alignment variants that recover most of the performance while
          keeping the biology cheap.
        </p>
        <FigBackpropFA />
        <p style={rp.p}>
          <strong style={rp.strong}>Target propagation</strong> (Bengio; Lee et al., 2015) takes a different route:
          instead of propagating gradients, it propagates <em>targets</em> — desirable activity patterns for each layer —
          computed by learned approximate inverses <M>g<sub>l</sub> ≈ f<sub>l</sub><sup>−1</sup></M>. Each layer then
          reduces a local reconstruction loss toward its target, converting a global gradient problem into a stack of
          local ones and folding in an autoencoder-like inverse that has an obvious feedback interpretation.
        </p>
        <p style={rp.p}>
          <strong style={rp.strong}>Equilibrium propagation</strong> (Scellier and Bengio, 2017) is the most elegant for
          energy-based, physically-realisable systems. A network with energy <M>E(θ, x, s)</M> relaxes to a free-phase
          fixed point <M>s<sub>∗</sub></M>. Then the output is weakly nudged toward the target with strength <M>β</M>, and
          the network relaxes again. The parameter gradient of the supervised loss is recovered from the difference of the
          two equilibria using only quantities local to each synapse:
        </p>
        <Eq label="equilibrium propagation">
          ∂L ⁄ ∂θ  =  lim<sub>β→0</sub>  (1⁄β) ( ∂E⁄∂θ |<sub>nudged</sub> − ∂E⁄∂θ |<sub>free</sub> )
        </Eq>
        <p style={rp.p}>
          No separate backward network, no distinct error-carrying pathway — the same neurons and synapses that run
          inference compute the update from their own two settling states. This is exactly the kind of two-phase,
          local-rule scheme that a physical substrate, biological or neuromorphic, can plausibly run.
        </p>

        {/* ── 4 ── */}
        <h2 id="pc" style={rp.h2}>4. Predictive coding as the unifying substrate</h2>
        <p style={rp.p}>
          The deepest connection is that predictive coding — a mainstream account of cortical hierarchy since Rao and
          Ballard (1999) — approximates backpropagation under a local update rule. In a hierarchical Gaussian generative
          model, each level predicts the level below; the residual prediction errors <M>ε<sub>l</sub></M> are the only
          signals that ascend, and the whole hierarchy minimises a single sum-of-squared-errors energy (equivalently, a
          Gaussian variational free energy):
        </p>
        <Eq label="predictive-coding energy">
          F = Σ<sub>l</sub>  (1 ⁄ 2Σ<sub>l</sub>) ‖ ε<sub>l</sub> ‖² ,  ε<sub>l</sub> = x<sub>l</sub> − W<sub>l</sub> f(x<sub>l+1</sub>)
        </Eq>
        <p style={rp.p}>
          Inference is gradient descent on <M>F</M> in the activity variables; learning is gradient descent on <M>F</M> in
          the weights. Both are strictly local — each update needs only the pre-synaptic activity and the co-located error
          unit:
        </p>
        <Eq label="local inference + learning">
          ẋ<sub>l</sub> ∝ − ∂F⁄∂x<sub>l</sub> = −(ε<sub>l</sub> ⁄ Σ<sub>l</sub>) + f′(x<sub>l</sub>) ⊙ (W<sub>l−1</sub>ᵀ ε<sub>l−1</sub> ⁄ Σ<sub>l−1</sub>) ;  ΔW<sub>l</sub> ∝ (ε<sub>l</sub> ⁄ Σ<sub>l</sub>) f(x<sub>l+1</sub>)ᵀ
        </Eq>
        <FigPredictiveCoding />
        <p style={rp.p}>
          Whittington and Bogacz (2017) proved that when the error units settle to their equilibrium, these local updates
          equal the backpropagation gradients of the corresponding deep network to arbitrary precision — with later work
          (Millidge, Song, Salvatori and colleagues) tightening and generalising the equivalence beyond the original
          fixed-prediction assumptions. The consequence is stark: the operation we invented for machines and the operation
          the cortex may run for perception are, in a well-defined limit, the <em>same</em> optimisation, differing only in
          how the error is physically carried. Predictive coding thereby unifies the free-energy account of the brain
          (Friston, 2010) with the gradient account of deep learning.
        </p>

        <Divider />

        {/* ── 5 ── */}
        <h2 id="geometry" style={rp.h2}>5. Population geometry and manifold capacity</h2>
        <p style={rp.p}>
          Representations are not lists of tuning curves; they are geometric objects. A population of <M>N</M> neurons
          responding to a set of conditions traces out a low-dimensional manifold in the <M>N</M>-dimensional firing-rate
          space, and the geometry of that manifold — not the single-cell tuning — is what downstream circuits and linear
          decoders actually read. The effective dimensionality is captured by the participation ratio of the covariance
          eigenvalues:
        </p>
        <Eq label="participation ratio">
          PR = ( Σ<sub>i</sub> λ<sub>i</sub> )²  ⁄  Σ<sub>i</sub> λ<sub>i</sub>²
        </Eq>
        <p style={rp.p}>
          Empirically, both cortical populations and trained network layers occupy far fewer dimensions than they have
          units, and motor and prefrontal cortex are described more faithfully as <strong style={rp.strong}>dynamical
          systems</strong> — trajectories on a manifold — than as static encoders (Gallego, Perich, Miller and Solla,
          2017; Vyas et al., 2020). Sussillo and Barak (2013) showed that trained RNNs solve tasks by arranging fixed
          points and their linearised flow, and Maheswaranathan et al. (2019) found this solution <em>universal</em>
          across architectures — the same topology of fixed points recurs whether the unit is an LSTM cell or a vanilla
          rectifier, which is precisely the kind of convergence one hopes to see between artificial and biological
          recurrent circuits.
        </p>
        <p style={rp.p}>
          The theory that connects geometry to function is <strong style={rp.strong}>manifold capacity</strong> (Chung,
          Lee and Sompolinsky, 2018). Ask how many object manifolds of radius <M>R</M> and dimension <M>D</M> can be
          linearly separated by <M>N</M> neurons; the critical load per neuron <M>α<sub>c</sub> = P ⁄ N</M> is set by the
          manifolds’ effective radius and dimension:
        </p>
        <Eq label="manifold capacity">
          α<sub>c</sub> ≈ α<sub>0</sub>( R<sub>eff</sub> , D<sub>eff</sub> ) ,  with  α<sub>c</sub> → 2  as  R → 0
        </Eq>
        <FigManifold />
        <p style={rp.p}>
          As information ascends a good hierarchy — biological or artificial — object manifolds shrink and untangle,
          capacity rises, and invariant categories become linearly separable. This gives a common currency: one can
          measure, in the same units, how the ventral stream and a deep vision network each transform the geometry of the
          same stimuli, and find that they do so in strikingly parallel ways.
        </p>

        {/* ── 6 ── */}
        <h2 id="converge" style={rp.h2}>6. Why the representations converge</h2>
        <p style={rp.p}>
          The recurring empirical finding — task-optimised networks resemble cortex, and independently-trained models
          resemble one another — demands an explanation that does not appeal to shared wiring. Huh et al. (2024) frame it
          as the <strong style={rp.strong}>Platonic Representation Hypothesis</strong>: systems trained on different data
          and objectives, at sufficient scale, converge toward a shared statistical model of the underlying generative
          structure of the world. The mechanism is constraint, not coincidence. A representation that must support many
          tasks, generalise out of distribution, and remain robust is pushed toward the environment’s true latent
          variables, and there is far less freedom in that target than in the space of possible networks.
        </p>
        <p style={rp.p}>
          Identifiability theory supplies the formal spine. Under contrastive and self-supervised objectives, the learned
          features provably recover the true latent factors up to a limited class of transformations (linear, or
          permutation-and-scaling), which is exactly the equivalence class that RSA and CKA are built to see through. If
          two systems each recover the same latents up to rotation, alignment metrics that are rotation-invariant will
          report a match — the convergence and our ability to measure it are two faces of the same identifiability result.
          Evolution and gradient descent are different search procedures over the same loss landscape imposed by a shared
          physical world; convergent representation is what optimisation under shared constraints looks like.
        </p>

        {/* ── 7 ── */}
        <h2 id="interface" style={rp.h2}>7. The read/write interface: decoding and alignment</h2>
        <p style={rp.p}>
          The connection is not only explanatory; it is instrumental. Neural decoding recovers task variables <M>k</M>
          (kinematics, phonemes, intended text) from population activity <M>r</M>. The upper limit on what any decoder can
          extract is set by the mutual information the population carries, bounded below through Fano’s inequality by the
          error of the best decoder:
        </p>
        <Eq label="decodable information">
          I(k ; r) ≥ H(k) − H(k | k̂(r)) ,  P<sub>e</sub> ≥ ( H(k | r) − 1 ) ⁄ log|K|
        </Eq>
        <p style={rp.p}>
          Classical decoders were linear or Kalman filters over binned spikes. The state of the art is explicitly a
          brain–AI hybrid: latent variable models such as LFADS (Pandarinath et al., 2018) fit a nonlinear dynamical
          system whose inferred latents denoise single-trial activity, and sequence models — the Neural Data Transformer
          (Ye and Pandarinath, 2021) and cross-animal models such as POYO (Azabou et al., 2023) — treat spike trains as
          token streams. These are the systems behind the recent clinical results: Willett et al. decoded attempted
          handwriting at 90 characters per minute (2021) and attempted speech at 60–70 words per minute (2023) from motor
          cortex, precisely because deep sequence models turn noisy population dynamics into structured latent
          trajectories.
        </p>
        <p style={rp.p}>
          The central technical obstacle is <strong style={rp.strong}>non-stationarity</strong>: recorded units drift
          across sessions and differ across subjects, so a decoder trained today degrades tomorrow. The solution is
          <strong style={rp.strong}> latent alignment</strong> — the same geometry from §5 put to work. Because the
          underlying neural manifold is stable even when the individual channels are not, one can align each new session’s
          activity to a canonical latent space and reuse the decoder. Formally this is a Procrustes or CCA problem: find
          the orthogonal <M>Q</M> minimising the distance between the new latents and the reference,
        </p>
        <Eq label="latent alignment (Procrustes)">
          Q<sub>∗</sub> = argmin<sub>QᵀQ = I</sub> ‖ Z<sub>new</sub> Q − Z<sub>ref</sub> ‖²<sub>F</sub>
        </Eq>
        <p style={rp.p}>
          Gallego et al. (2020) showed these latent dynamics are preserved across months and even across individuals,
          making stable, transferable interfaces possible. Closing the loop — writing structured stimulation back through
          the same aligned latent space so the cortex reads it as signal — is the frontier, and it is where the
          representational-alignment programme and the interface programme finally merge into one engineering discipline.
        </p>

        <Divider />

        {/* ── 8 ── */}
        <h2 id="falsify" style={rp.h2}>8. What would falsify the bridge</h2>
        <p style={rp.p}>
          A programme worth taking seriously names its own failure modes. The bridge weakens, not strengthens, if: linear
          predictivity turns out to be dominated by the flexibility of the mapping rather than the model, so that
          untrained or randomly-wired networks predict cortex nearly as well as trained ones (a live critique, partially
          borne out for some early visual areas); if scaling <em>diverges</em> rather than converges representations once
          objectives differ enough, contradicting the Platonic hypothesis; if the predictive-coding/backprop equivalence
          holds only under fixed-prediction assumptions that real cortical microcircuits violate; or if decoding stability
          proves to rest on task structure rather than a genuinely conserved neural manifold. Each is a concrete,
          measurable claim, and each is under active test.
        </p>
        <p style={rp.p}>
          What has already survived is substantial. We can quantify representational similarity across systems with no
          shared substrate; we have removed the theoretical objection that the brain cannot approximate gradient descent;
          we have a local, energy-based learning rule that provably recovers backpropagation; we can measure the geometry
          that both brains and networks impose on the same inputs and see it transform the same way; and we can read
          intended movement and speech out of cortex, and align those readings across time, using the very models the
          neuroscience helped inspire. The brain–AI connection has graduated from analogy to a shared formalism — one in
          which a learning rule, a representational geometry, and an interface protocol are increasingly the same object
          described from two directions.
        </p>
      </ResearchArticleLayout>
    </>
  )
}
