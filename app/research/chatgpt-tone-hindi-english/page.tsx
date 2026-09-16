import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigToneByLanguage, FigMirrorLoop, FigHonorifics, FigDataByLanguage, FigPolitenessCurve } from '../figures'

const post = getPost('chatgpt-tone-hindi-english')!

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
  ['start', 'The thing I kept noticing'],
  ['real', '1. Is it even real?'],
  ['mirror', '2. The mirror'],
  ['grammar', '3. What Hindi makes you decide'],
  ['data', '4. The data is not neutral'],
  ['tax', '5. The politeness tax'],
  ['safety', '6. Rudeness, refusals, and the English default'],
  ['human', '7. The person on the other side'],
  ['synthesis', '8. So what is actually happening'],
  ['matters', '9. Why any of this matters'],
  ['refs', 'Notes and references'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I noticed it by accident, the way you notice most things worth writing about. I was asking the same assistant the
      same kind of question, some days in English, some days in Hindi, and the replies did not just differ in language.
      They differed in <em>temperature</em>. The Hindi ones felt warmer, gentler, more like a patient older cousin. The
      English ones were faster, flatter, a little more “here is your answer, next.” At first I assumed I was imagining it.
      Then I stopped being sure. This piece is me trying to find out whether the thing I kept noticing is real, and if it
      is, what on earth is going on underneath.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={<>This one started as a personal observation I could not shake, that the same assistant felt warmer in Hindi and blunter in English. My objective was simple to state and harder to answer: find out whether that is real, and if it is, trace exactly why, using everything I could learn about how these systems are actually built.</>}>

        {/* Start */}
        <h2 id="start" style={rp.h2}>The thing I kept noticing</h2>
        <p style={rp.p}>
          Here is the small, silly example that started it. One afternoon I typed something curt into the chat box in
          English, the way you do when you are tired: “fix this. now.” I got back a clean, correct, slightly clipped answer.
          No warmth, no cushioning, just the fix. A few days later I asked almost the same thing in Hindi, because I happened
          to be thinking in Hindi that morning, something like “zara ye theek kar dijiye.” And the reply came back softer.
          It opened with the Hindi equivalent of “absolutely, here you go,” it used the respectful <em>aap</em> register
          without my asking, and it added a little “koi baat nahi,” a small it-happens reassurance that the English answer
          never bothered with.
        </p>
        <p style={rp.p}>
          I want to be honest right away: one anecdote is nothing. I know that. But once I saw it I could not unsee it, and
          when I mentioned it to a few friends who use these tools in both languages, most of them nodded before I even
          finished the sentence. So the question stopped being “did this happen to me” and became “is this a real,
          describable phenomenon, or a shared illusion we are all talking ourselves into.” Those are very different
          articles. I did not know which one I was writing when I started.
        </p>
        <FigToneByLanguage />

        {/* 1 */}
        <h2 id="real" style={rp.h2}>1. Is it even real?</h2>
        <p style={rp.p}>
          The responsible thing is to spend a minute trying to kill the idea before defending it. There are at least three
          good reasons the whole effect could be a mirage.
        </p>
        <p style={rp.p}>
          First, confirmation bias, the obvious one. Once I had a theory, every warm Hindi reply felt like proof and every
          warm English reply felt like an exception. That is exactly how a bias feels from the inside, frictionless and
          convincing. Second, I might simply write differently in the two languages. Maybe my Hindi prompts are more polite
          to begin with, and I am watching the model hand my own manners back to me. Third, translation flattens things.
          Warmth in Hindi and warmth in English are not the same texture, and when I mentally translate a Hindi reply I may
          be importing warmth that the words alone do not carry.
        </p>
        <p style={rp.p}>
          So I held the skepticism. But here is what kept the question alive for me. The effect does not actually depend on
          the model deciding anything. If you look at how these systems are built, and at the sociolinguistics of the two
          languages, there are at least four independent mechanisms that would <em>predict</em> a tone difference, whether
          or not anyone intended one. When several unrelated causes all push in the same direction, the surprising thing
          would be if there were <em>no</em> effect. That is the part that made me keep reading, and it is how the rest of
          this is organised: not as one grand claim, but as four quieter ones that happen to stack.
        </p>

        {/* 2 */}
        <h2 id="mirror" style={rp.h2}>2. The mirror</h2>
        <p style={rp.p}>
          Start with the least mysterious mechanism, because it explains more than you would expect. A modern assistant is
          trained, above almost everything else, to be helpful and agreeable, and one of the simplest ways to be agreeable
          is to match the person in front of you. Give it a terse prompt and it tends to answer tersely. Give it a formal,
          careful prompt and it turns formal and careful. It mirrors your register: your politeness, your formality, your
          warmth, even your sentence rhythm.
        </p>
        <p style={rp.p}>
          Humans do this constantly, and there is a whole theory for it. Communication Accommodation Theory (Giles and
          colleagues, developed across the 1970s to 1990s) describes how speakers converge toward each other, adopting one
          another’s accent, pace, and formality to signal belonging and reduce social distance. We do it without noticing.
          The model, trained on oceans of human conversation, has absorbed the same reflex statistically. So if my Hindi
          prompts carry even slightly more deference than my English ones, and they almost certainly do, then a good chunk
          of the warmth I am seeing is just the mirror. It is my own tone, reflected and amplified.
        </p>
        <FigMirrorLoop />
        <p style={rp.p}>
          I find this both deflating and clarifying. Deflating because part of the magic evaporates: the machine is not
          being kind to me in Hindi, it is being <em>me</em> back at me. Clarifying because it means the language I choose
          is never neutral. It sets a register before the model has said a single word, and the register comes with a whole
          culture attached. Which brings up the next mechanism, the one I think is doing the heaviest lifting.
        </p>

        {/* 3 */}
        <h2 id="grammar" style={rp.h2}>3. What Hindi makes you decide</h2>
        <p style={rp.p}>
          English lets you be vague about respect. Hindi does not. In English you address everyone, your best friend, your
          boss, a stranger, a child, as <em>you</em>. The pronoun carries no stance. Hindi forces a choice with the pronoun
          itself: <em>tu</em>, which is intimate or, in the wrong context, curt and even insulting; <em>tum</em>, familiar
          and casual; and <em>aap</em>, respectful and formal. You cannot write a Hindi sentence to another person without
          quietly declaring how much deference you are extending. The grammar will not let you stay neutral.
        </p>
        <FigHonorifics />
        <p style={rp.p}>
          This is not a Hindi quirk, it is a deep feature of a lot of the world’s languages, studied for decades as the
          T-V distinction and folded into Brown and Levinson’s (1987) theory of politeness, where much of social life is
          managing “face,” the public self-image people want respected. Languages with rich honorific systems, Japanese,
          Korean, Hindi, and many others, bake face-work into the grammar. And here is the consequence for a machine.
          Almost all the Hindi text a model has ever read that addresses a reader directly, the customer-service replies,
          the polite letters, the instructional writing, leans on <em>aap</em>. The respectful register is not a choice the
          model adds on top. It is soaked into the very distribution of Hindi it learned from. When it writes Hindi to you,
          the default gravity of the language pulls it toward deference.
        </p>
        <p style={rp.p}>
          English has no equivalent pull. Its polite register exists, obviously, but it is optional, signalled by softeners
          like “could you” and “I would suggest” rather than forced by pronouns. So when the model writes English, nothing
          in the grammar is quietly insisting on deference, and its default drifts toward the efficient, transactional
          register that dominates so much English training text, the Stack Overflow answer, the terse email, the
          documentation. Neither tone was chosen. Each is the center of gravity of a different language’s written data.
        </p>

        {/* 4 */}
        <h2 id="data" style={rp.h2}>4. The data is not neutral</h2>
        <p style={rp.p}>
          Which leads straight into the third mechanism, and it is the one people forget. These models are not tuned
          equally in every language. Not close. The raw text they learn from skews heavily toward English, and the
          <em> human feedback</em> used to polish their manners, the step that actually teaches them tone, refusal, warmth,
          and restraint, skews even harder toward English. Joshi et al. (2020) documented the vast disparity in linguistic
          resources across the field, and the pattern has softened only slowly since.
        </p>
        <FigDataByLanguage />
        <p style={rp.p}>
          Think about what that implies. The politeness of these systems in English is not an accident of the data, it is
          deliberately sculpted, prompt by prompt, by an enormous amount of human rating (the InstructGPT work of Ouyang et
          al., 2022, is the canonical description of how this reinforcement-from-feedback loop shapes behavior). English
          tone is engineered. Hindi tone, by contrast, is mostly <em>inherited</em>. There is far less Hindi-specific
          feedback teaching the model exactly how blunt or warm to be, so it falls back on the statistics of Hindi text
          itself, and, as we just saw, that text runs deferential. So the two tones come from two different processes. One
          is a carefully calibrated English register. The other is the untouched cultural default of Hindi bleeding
          through. It would honestly be strange if they matched.
        </p>
        <p style={rp.p}>
          I want to flag the schematic nature of that chart, though. Exact proportions are not public and shift with every
          model. The point is not the numbers, it is the shape: a steep English lead, a long multilingual tail, and manners
          that are precise where the feedback was thick and approximate where it was thin.
        </p>

        {/* 5 */}
        <h2 id="tax" style={rp.h2}>5. The politeness tax</h2>
        <p style={rp.p}>
          At this point I assumed politeness was purely a matter of style, harmless, cosmetic. Then I found a line of
          research suggesting it is not, and this is where the story got genuinely interesting to me. Yin and colleagues
          (2024) ran a cross-lingual study asking a plain question: does how politely you phrase a prompt change the
          <em> quality</em> of what you get back, and does the answer depend on the language? Across English, Chinese, and
          Japanese, they found that rude prompts tended to degrade performance, while piling on politeness past a point did
          not keep helping and could even nudge quality down. And, crucially, the sweet spot sat at a different place in
          each language.
        </p>
        <FigPolitenessCurve />
        <p style={rp.p}>
          I sat with that for a while. It means the register you adopt is not just setting a mood, it is, at least a little,
          steering the competence of the answer, and the map from politeness to quality is drawn differently per language.
          In a language where deference is the grammatical baseline, a blunt prompt may read as more of a violation, and the
          model, mirroring, may follow you somewhere less careful. In English, where directness is normal, a curt prompt is
          not much of a signal at all. So the same rude tone might cost you more in Hindi than in English, which, if you
          squint, is another reason the Hindi channel stays warmer: rudeness is more marked there, and both you and the
          model tend to avoid it. I am speculating slightly past the evidence here, and I want to own that. The specific
          Hindi-versus-English comparison has had less study than it deserves. But the shape of the effect is documented,
          and it is not nothing.
        </p>

        {/* 6 */}
        <h2 id="safety" style={rp.h2}>6. Rudeness, refusals, and the English default</h2>
        <p style={rp.p}>
          The other half of the observation, that the English replies feel a touch <em>ruder</em>, or at least blunter,
          deserves its own look, because “rude” is doing a lot of work there and I do not fully trust the word. I do not
          think the model is being hostile in English. I think two smaller things get read as rudeness.
        </p>
        <p style={rp.p}>
          One is simply directness. English assistant text is trained heavily on a register that values getting to the
          point, and getting to the point, stripped of the softeners Hindi supplies by default, can land as cold even when
          nothing unfriendly was meant. The second is more interesting. Safety and refusal behavior is also tuned most
          precisely in English, which means an English-speaking model is, in a sense, more <em>confident</em> about when to
          push back, correct you, or decline. Yong, Menghini, and Bach (2023) showed the flip side of the same coin: safety
          guardrails are markedly weaker in low-resource languages, so translating a disallowed request into a
          less-resourced language could slip past filters that would have caught it in English. The guardrails, like the
          manners, are sharpest where the feedback was densest.
        </p>
        <p style={rp.p}>
          Put those together and “ruder in English” starts to look less like a personality and more like a side effect of
          competence. The model is most fluent, most direct, and most willing to assert itself in the language it was
          groomed in. In Hindi it is gentler partly because it is, in a quiet way, less sure of its footing, and a less
          sure speaker hedges, softens, defers. I do not know how much of the warmth is grace and how much is caution
          wearing the mask of grace. Probably some of both.
        </p>

        {/* 7 */}
        <h2 id="human" style={rp.h2}>7. The person on the other side</h2>
        <p style={rp.p}>
          So far I have talked as if the machine were the only thing changing. It is not. I change too, and this is really a
          piece about human behavior with AI, so I should say so plainly. When I switch to Hindi I am not just switching
          vocabulary, I am switching a whole social self, the one that grew up being told to say <em>aap</em> to elders and
          to soften requests to strangers. My Hindi prompts are more polite because <em>I</em> am more polite in Hindi. The
          model mirrors that, I read the warmth, I get a little warmer still, and around we go.
        </p>
        <p style={rp.p}>
          There is a classic finding underneath this. Reeves and Nass (1996), in <em>The Media Equation</em>, and Nass and
          Moon (2000) after them, showed that people apply social rules to computers automatically, politeness,
          reciprocity, even flattery, while insisting, if asked, that of course they do no such thing. We treat the machine
          as a social actor without meaning to. So the tone difference is partly a duet. The language cues a social self in
          me, that self sets a register, the model reflects it, and neither of us is quite in charge of the result. I find
          that genuinely a little strange to sit with. The machine has no feelings to hurt and no respect to give, and yet
          the whole exchange runs on the etiquette of a relationship.
        </p>
        <p style={rp.p}>
          It also cuts the other way, and less flatteringly. A lot of people report being ruder to assistants than they
          would ever be to a person, and ruder in English specifically, maybe because English is where the tool feels most
          like a tool. I have done it. There is a small, unresolved worry in the research community, and in me, about what
          it does to us to spend hours a day being curt to something that answers in a human voice. I do not have a tidy
          answer. I am not sure there is one yet.
        </p>

        {/* 8 */}
        <h2 id="synthesis" style={rp.h2}>8. So what is actually happening</h2>
        <p style={rp.p}>
          Let me try to pull the threads together, without pretending they tie into a neater bow than they do. The tone
          difference, to the extent it is real, and I have come round to thinking a version of it is real, does not come
          from the model choosing to be kind in one language and short in another. It comes from at least four things
          happening at once:
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>The mirror.</strong> The model matches your register, so a more deferential Hindi prompt gets a more deferential reply. Some of the warmth is your own, reflected.</li>
          <li style={rp.li}><strong style={rp.strong}>The grammar.</strong> Hindi forces a stance toward the listener through <em>aap</em>, <em>tum</em>, <em>tu</em>, and the text the model learned from leans respectful. English lets it default to an efficient, neutral register instead.</li>
          <li style={rp.li}><strong style={rp.strong}>The data.</strong> Tone and safety are engineered most precisely in English and largely inherited in Hindi, so English manners are calibrated while Hindi manners fall back on the culture soaked into the language.</li>
          <li style={rp.li}><strong style={rp.strong}>You.</strong> You bring a different social self to each language, and the exchange is a loop between your etiquette and the model’s mirror of it.</li>
        </ol>
        <p style={rp.p}>
          Notice that none of these needs the others to be true, and yet they all point the same way. That is why I ended
          up believing the effect is more than a mirage, even though any single piece of it is arguable. It is
          overdetermined. Take any one mechanism away and you would still expect some drift. Stack all four and a warm Hindi
          and a brisk English fall out almost for free.
        </p>

        {/* 9 */}
        <h2 id="matters" style={rp.h2}>9. Why any of this matters</h2>
        <p style={rp.p}>
          It would be easy to file this under fun trivia. I do not think it is. If the same system is warmer, more
          deferential, and, per the politeness research, possibly a little more careful in one language, and brisker, more
          assertive, and better guarded in another, then people are not really using one product. They are using slightly
          different products depending on which language they think in, and mostly they have no idea. That has real edges.
          The English speaker gets the sharpest safety net and the bluntest tone. The Hindi speaker gets the warmer voice
          and, quite possibly, the weaker guardrail. Neither was told.
        </p>
        <p style={rp.p}>
          For anyone building on top of these tools, the practical takeaway is almost embarrassingly simple, and I say it
          as someone who ignored it for months: the language and the register you choose are a setting, as real as any
          slider in the interface, and right now it is an invisible one. If tone matters to your users, and in coaching, in
          support, in anything that touches people when they are vulnerable, it matters enormously, then you cannot treat
          the language as a neutral wrapper around the same machine. It is not the same machine.
        </p>
        <p style={rp.p}>
          I started this convinced I was probably imagining the whole thing. I am ending it fairly sure I was not, and much
          less sure about why than the confident version of this essay would pretend. The honest summary is that a small
          domestic observation, the assistant felt kinder in Hindi, turned out to have roots in grammar, in the economics
          of training data, in a real if under-studied politeness effect, and in my own divided self. That is usually how
          it goes with these systems. The strange thing on the surface is real, and the explanation is neither magic nor
          nothing. It is a stack of ordinary things you were not looking at.
        </p>

        <Divider />

        {/* Notes */}
        <h2 id="refs" style={rp.h2}>Notes and references</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          A note on evidence: the specific Hindi-versus-English tone comparison in this essay is, to my knowledge, not yet
          settled by a dedicated controlled study, and I have tried to mark where I am reasoning from mechanism and
          adjacent findings rather than from a direct result. The figures marked illustrative or schematic are exactly
          that. Treat the confident sentences as hypotheses worth testing, not as settled fact.
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
