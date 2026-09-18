import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigToneByLanguage, FigMirrorLoop, FigHonorifics, FigDataByLanguage, FigPolitenessCurve } from '../figures'

const post = getPost('chatgpt-tone-hindi-english')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['start', 'The thing I kept noticing'],
  ['real', '1. Is it even real?'],
  ['mirror', '2. The mirror'],
  ['grammar', '3. What Hindi makes you pick'],
  ['data', '4. The training data is not fair'],
  ['tax', '5. Rudeness has a cost'],
  ['safety', '6. Why English feels blunter'],
  ['human', '7. You change too'],
  ['synthesis', '8. So what is going on'],
  ['matters', '9. Why it matters'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I noticed it by accident. I was asking the same AI the same kind of question, some days in English, some days in
      Hindi. The answers did not just switch language. They switched <em>mood</em>. The Hindi ones felt warmer and gentler.
      The English ones felt faster and flatter. At first I thought I was imagining it. Then I was not so sure. This piece
      is me trying to find out if the thing I kept noticing is real, and if it is, why.
    </>
  )
  const objective = (
    <>
      This started as a personal itch I could not scratch: the same AI felt warmer in Hindi and blunter in English. My
      goal was simple to say and harder to answer. Find out if that is real, and if it is, trace exactly why, using what I
      could learn about how these systems are built.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>The thing I kept noticing</h2>
        <p style={rp.p}>
          Here is the small, silly example that started it. One tired afternoon I typed something short in English: fix
          this, now. I got a clean, correct, clipped answer. No warmth. Just the fix.
        </p>
        <p style={rp.p}>
          A few days later I asked almost the same thing in Hindi, because I happened to be thinking in Hindi that morning.
          Something like, zara ye theek kar dijiye. The reply came back softer. It opened with a warm, of course, here you
          go. It used the polite <em>aap</em> form without my asking. And it added a small koi baat nahi, an it-happens
          reassurance the English answer never bothered with.
        </p>
        <p style={rp.p}>
          One story means nothing. I know that. But once I saw it, I could not unsee it. And when I mentioned it to friends
          who use both languages, most of them nodded before I finished. So the question changed. Not did this happen to
          me, but is this a real thing, or a shared illusion.
        </p>
        <FigToneByLanguage />

        {/* 1 */}
        <h2 id="real" style={rp.h2}>1. Is it even real?</h2>
        <p style={rp.p}>
          The fair thing is to try to kill the idea before I defend it. There are three good reasons it could be a mirage.
        </p>
        <p style={rp.p}>
          One, my own bias. Once I had a theory, every warm Hindi reply felt like proof. That is how bias feels from the
          inside. Two, maybe I write differently in the two languages. Maybe my Hindi is more polite to start with, and I
          am just watching the AI hand my own manners back. Three, translation adds warmth. When I read a Hindi reply in my
          head, I may be adding warmth the words alone do not carry.
        </p>
        <p style={rp.p}>
          So I stayed skeptical. But here is what kept the question alive. The effect does not need the AI to decide
          anything. Look at how these systems are built, and at the two languages, and you find four separate reasons that
          would each <em>predict</em> a tone gap, whether or not anyone meant one.
        </p>
        <p style={rp.p}>
          When four unrelated causes all push the same way, the surprising thing would be no gap at all. That is what kept
          me reading. The rest of this is those four reasons, stacked.
        </p>

        {/* 2 */}
        <h2 id="mirror" style={rp.h2}>2. The mirror</h2>
        <p style={rp.p}>
          Start with the simplest reason, because it explains a lot. An AI is trained, above almost everything, to be
          helpful and agreeable. And one easy way to be agreeable is to match the person in front of you.
        </p>
        <p style={rp.p}>
          Give it a short, blunt prompt and it tends to answer short. Give it a careful, formal prompt and it turns careful
          and formal. It mirrors your style: your politeness, your warmth, even your rhythm.
        </p>
        <p style={rp.p}>
          People do this too. There is a whole theory for it (Communication Accommodation Theory, from Giles and
          colleagues). We drift toward each other, matching accent, pace, and formality, to feel closer. We do it without
          noticing. The AI soaked up the same habit from all the human talk it learned from.
        </p>
        <FigMirrorLoop />
        <p style={rp.p}>
          So if my Hindi prompts carry even a little more respect, and they do, a big chunk of the warmth I see is just my
          own tone bouncing back. The machine is not being kind to me in Hindi. It is being <em>me</em>, back at me. Which
          means the language I pick is never neutral. It sets a mood before the AI says a word, and that mood comes with a
          whole culture attached. That leads to the next reason, which I think does the heaviest lifting.
        </p>

        {/* 3 */}
        <h2 id="grammar" style={rp.h2}>3. What Hindi makes you pick</h2>
        <p style={rp.p}>
          English lets you be vague about respect. Hindi does not.
        </p>
        <p style={rp.p}>
          In English you call everyone <em>you</em>. Your friend, your boss, a stranger, a child. The word carries no
          stance. Hindi forces a choice in the word itself. <em>Tu</em>, which is close, or rude in the wrong place.
          <em> Tum</em>, familiar and casual. <em>Aap</em>, respectful and formal. You cannot write a Hindi sentence to
          someone without quietly saying how much respect you are giving. The grammar will not let you stay neutral.
        </p>
        <FigHonorifics />
        <p style={rp.p}>
          This is not just a Hindi quirk. Many languages work this way, and it has been studied for years. Here is what it
          means for a machine. Almost all the Hindi writing that speaks to a reader, the polite letters, the service
          replies, the how-to guides, leans on <em>aap</em>. Respect is not an add-on. It is baked into the Hindi the AI
          learned from. So when it writes Hindi, the language itself pulls it toward being polite.
        </p>
        <p style={rp.p}>
          English has no such pull. Polite English exists, of course, but it is optional, carried by soft words like could
          you and I would suggest, not forced by the grammar. So when the AI writes English, nothing is quietly demanding
          respect, and it drifts toward the fast, get-to-the-point style that fills so much English text online. Neither
          tone was chosen. Each is just the center of gravity of a different language.
        </p>

        {/* 4 */}
        <h2 id="data" style={rp.h2}>4. The training data is not fair</h2>
        <p style={rp.p}>
          Now the third reason, the one people forget. These systems are not tuned equally in every language. Not close.
        </p>
        <p style={rp.p}>
          The text they learn from leans heavily toward English. And the <em>human feedback</em> used to polish their
          manners, the step that actually teaches them tone, warmth, and when to say no, leans even harder toward English.
        </p>
        <FigDataByLanguage />
        <p style={rp.p}>
          Think about what that means. The politeness of these systems in English is not an accident. It is carefully
          shaped, prompt by prompt, by a huge amount of human rating. English tone is built on purpose. Hindi tone is
          mostly <em>inherited</em>. There is far less Hindi feedback telling the AI exactly how blunt or warm to be, so it
          falls back on the statistics of Hindi text, which, as we saw, run polite.
        </p>
        <p style={rp.p}>
          So the two tones come from two different places. One is a carefully tuned English voice. The other is the plain
          default of Hindi bleeding through. It would honestly be strange if they matched. One note: that chart is a rough
          sketch, not exact. The point is the shape, a big English lead, and manners that are precise where the feedback
          was thick and rough where it was thin.
        </p>

        {/* 5 */}
        <h2 id="tax" style={rp.h2}>5. Rudeness has a cost</h2>
        <p style={rp.p}>
          I assumed politeness was just style. Harmless. Then I found research that says it is not, and this is where it
          got interesting.
        </p>
        <p style={rp.p}>
          Yin and colleagues (2024) asked a plain question across languages. Does how politely you word a prompt change the
          <em> quality</em> of the answer? And does that depend on the language? Across English, Chinese, and Japanese, they
          found that rude prompts tended to make answers worse, while piling on politeness past a point did not keep
          helping and could even hurt a little. And the sweet spot sat in a different place in each language.
        </p>
        <FigPolitenessCurve />
        <p style={rp.p}>
          Sit with that. The tone you use is not just setting a mood. It is nudging how good the answer is, and the map from
          politeness to quality is drawn differently for each language.
        </p>
        <p style={rp.p}>
          In a language where respect is the default, a blunt prompt reads as more of a break in the rules, and the AI,
          mirroring, may follow you somewhere less careful. In English, where being direct is normal, a curt prompt is
          barely a signal. So the same rudeness may cost you more in Hindi than in English, which is one more reason the
          Hindi channel stays warmer. I am reaching a little past the evidence here, and I want to own that. The exact
          Hindi-versus-English test has had less study than it deserves. But the shape of the effect is real.
        </p>

        {/* 6 */}
        <h2 id="safety" style={rp.h2}>6. Why English feels blunter</h2>
        <p style={rp.p}>
          The other half of what I noticed is that English replies feel a bit <em>ruder</em>. I do not fully trust that
          word, so let me pull it apart. I do not think the AI is hostile in English. I think two smaller things read as
          rudeness.
        </p>
        <p style={rp.p}>
          One is plain directness. English AI text is trained heavily on a style that values getting to the point. Strip
          away the soft words Hindi supplies by default, and getting to the point can land as cold, even when nothing
          unkind was meant.
        </p>
        <p style={rp.p}>
          The second is more interesting. The AI’s safety and its willingness to say no are also tuned most sharply in
          English. So an English-speaking AI is, in a sense, more <em>sure of itself</em> about when to push back or
          correct you. Yong and colleagues (2023) showed the flip side: those guardrails are much weaker in
          lower-resource languages. The guardrails, like the manners, are sharpest where the feedback was thickest.
        </p>
        <p style={rp.p}>
          Put that together, and ruder in English looks less like a personality and more like a side effect of skill. The
          AI is most fluent, most direct, and most willing to assert itself in the language it was raised in. In Hindi it is
          gentler partly because it is quietly less sure of its footing, and a less sure speaker softens and defers. How
          much of the warmth is grace and how much is caution wearing the mask of grace? Probably some of both.
        </p>

        {/* 7 */}
        <h2 id="human" style={rp.h2}>7. You change too</h2>
        <p style={rp.p}>
          So far I have talked as if only the machine changes. It does not. I change too. And this is really a piece about
          how humans behave with AI, so I should say it plainly.
        </p>
        <p style={rp.p}>
          When I switch to Hindi, I am not just switching words. I am switching a whole social self, the one raised to say
          <em> aap</em> to elders and to soften requests to strangers. My Hindi prompts are more polite because <em>I</em>
          am more polite in Hindi. The AI mirrors that. I read the warmth. I get a little warmer. And round we go.
        </p>
        <p style={rp.p}>
          There is a classic finding under this. Reeves and Nass (1996), and Nass and Moon (2000) after them, showed people
          use social manners with computers automatically, politeness, give-and-take, even flattery, while swearing, if
          asked, that they do no such thing. We treat the machine as a social being without meaning to.
        </p>
        <p style={rp.p}>
          It cuts the other way too, and less kindly. Many people are ruder to AI than they would ever be to a person, and
          ruder in English, maybe because English is where the tool feels most like a tool. I have done it. There is a
          small, open worry, in the research and in me, about what it does to us to spend hours a day being curt to
          something that answers in a human voice. I do not have a tidy answer. I am not sure there is one yet.
        </p>

        {/* 8 */}
        <h2 id="synthesis" style={rp.h2}>8. So what is going on</h2>
        <p style={rp.p}>
          Let me pull the threads together, without pretending they tie into a neater bow than they do. The tone gap, as
          far as it is real, and I have come to think a version of it is, does not come from the AI choosing to be kind in
          one language and short in another. It comes from four things at once.
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>The mirror.</strong> The AI matches your style, so a more polite Hindi prompt gets a more polite reply. Some of the warmth is yours, bounced back.</li>
          <li style={rp.li}><strong style={rp.strong}>The grammar.</strong> Hindi forces a stance with <em>aap</em>, <em>tum</em>, <em>tu</em>, and the Hindi it learned from leans respectful. English lets it default to a fast, neutral voice.</li>
          <li style={rp.li}><strong style={rp.strong}>The data.</strong> Tone and safety are tuned most sharply in English and mostly inherited in Hindi, so English manners are precise while Hindi manners fall back on the culture in the language.</li>
          <li style={rp.li}><strong style={rp.strong}>You.</strong> You bring a different social self to each language, and the whole thing is a loop between your manners and the AI’s mirror of them.</li>
        </ol>
        <p style={rp.p}>
          None of these needs the others to be true, and yet they all point the same way. That is why I came to believe it
          is more than a mirage, even though any one piece is arguable. Take any one away and you would still expect some
          drift. Stack all four and a warm Hindi and a brisk English fall out almost for free.
        </p>

        {/* 9 */}
        <h2 id="matters" style={rp.h2}>9. Why it matters</h2>
        <p style={rp.p}>
          It would be easy to file this under fun trivia. I do not think it is.
        </p>
        <p style={rp.p}>
          If the same system is warmer, more polite, and maybe a bit more careful in one language, and brisker, more sure,
          and better guarded in another, then people are not really using one product. They are using slightly different
          products depending on the language they think in. And mostly they have no idea. The English speaker gets the
          sharpest safety net and the bluntest tone. The Hindi speaker gets the warmer voice and, quite possibly, the
          weaker guardrail. Nobody told them.
        </p>
        <p style={rp.p}>
          If you build on these tools, the takeaway is almost embarrassingly simple, and I ignored it for months. The
          language and tone you choose are a setting, as real as any slider in the app. Right now it is an invisible one. If
          tone matters to your users, and in coaching, support, anything that touches people when they are low, it matters a
          lot, you cannot treat the language as a neutral wrapper around the same machine. It is not the same machine.
        </p>
        <p style={rp.p}>
          I started sure I was imagining the whole thing. I am ending fairly sure I was not, and much less sure about why
          than a confident essay would pretend. A small home observation, the AI felt kinder in Hindi, turned out to have
          roots in grammar, in the money behind training data, in a real politeness effect, and in my own split self. That
          is usually how it goes with these systems. The strange thing on the surface is real, and the reason is neither
          magic nor nothing. It is a stack of ordinary things you were not looking at.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          A note on evidence: the exact Hindi-versus-English tone test in this piece is, as far as I know, not yet settled
          by a dedicated controlled study, and I have tried to mark where I am reasoning from how these systems work rather
          than from a direct result. The figures marked illustrative or schematic are exactly that. Read the confident
          lines as ideas worth testing, not settled fact.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Brown, P., &amp; Levinson, S. C. (1987). <em>Politeness: Some Universals in Language Usage.</em> Cambridge University Press.</p>
          <p style={refStyle}>Giles, H., Coupland, N., &amp; Coupland, J. (1991). Accommodation theory: Communication, context, and consequence. In <em>Contexts of Accommodation.</em> Cambridge University Press.</p>
          <p style={refStyle}>Joshi, P., Santy, S., Budhiraja, A., Bali, K., &amp; Choudhury, M. (2020). The state and fate of linguistic diversity and inclusion in the NLP world. <em>Proceedings of ACL 2020.</em></p>
          <p style={refStyle}>Nass, C., &amp; Moon, Y. (2000). Machines and mindlessness: Social responses to computers. <em>Journal of Social Issues, 56</em>(1), 81–103.</p>
          <p style={refStyle}>Ouyang, L., et al. (2022). Training language models to follow instructions with human feedback. <em>Advances in Neural Information Processing Systems (NeurIPS) 35.</em></p>
          <p style={refStyle}>Reeves, B., &amp; Nass, C. (1996). <em>The Media Equation: How People Treat Computers, Television, and New Media Like Real People and Places.</em> Cambridge University Press.</p>
          <p style={refStyle}>Yin, Z., Wang, H., Horio, K., Kawahara, D., &amp; Sekine, S. (2024). Should we respect LLMs? A cross-lingual study on the influence of prompt politeness on LLM performance. <em>arXiv:2402.14531.</em></p>
          <p style={refStyle}>Yong, Z.-X., Menghini, C., &amp; Bach, S. H. (2023). Low-resource languages jailbreak GPT-4. <em>arXiv:2310.02446.</em></p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
