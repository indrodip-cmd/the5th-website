import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigStudyDesign, FigOffloadingCycle, FigRelianceThinking, FigUseItLoseIt, FigAugmentReplace } from '../figures'

const post = getPost('is-ai-eroding-critical-thinking')!

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
  ['summary', 'Executive summary'],
  ['why', '1. Why I started worrying about this'],
  ['offload', '2. The core idea: cognitive offloading'],
  ['method', '3. How I studied it'],
  ['found', '4. What I found, and what the evidence says'],
  ['brain', '5. What is happening in the brain'],
  ['skill', '6. Which part of thinking actually erodes'],
  ['who', '7. Who is most at risk'],
  ['good', '8. When AI makes you sharper, not duller'],
  ['protocol', '9. A protocol: AI without the debt'],
  ['limits', '10. Limitations and honesty'],
  ['close', '11. Conclusion'],
  ['refs', 'References'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      This is a white paper, so let me say the finding in one breath before I earn it over the next several thousand
      words. I think everyday reliance on AI, the small, constant habit of asking it to think for us, is quietly weakening
      the exact mental skill we most want to keep: our ability to reason for ourselves and to doubt an answer before we
      accept it. Not because AI makes us stupid, it does not, but because a muscle you stop using gets weaker, and we have
      started outsourcing the effort of thinking at a scale we have never tried before.
    </>
  )
  const objective = (
    <>
      I wanted to test a fear I could not shake, in plain terms and on ordinary people: does leaning on AI for everyday
      thinking quietly erode the thinking itself? So I studied how a group of American adults aged 30 to 60 reason with
      and without the tool, and read it against the fast-growing published evidence, from a cognitive-science and
      neuroscience point of view.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Executive summary */}
        <div id="summary" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>Executive summary</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            The convenience of AI carries a hidden cost I have started calling <em>cognitive debt</em>. When we hand the
            effortful parts of thinking, recalling, weighing, judging, doubting, to a machine, those skills go unpracticed
            and slowly fade, while our <em>confidence</em> stays high or even rises. I am running this as an open study of
            adults aged 30 to 60, which you can take part in yourself in a few minutes, and the pattern it tests, the one a
            wave of recent published research already shows, is that the people who lean hardest on AI for everyday
            questions are the least likely to check its answers or to reason a problem through unaided, while staying just
            as sure of themselves. This paper explains the mechanism in simple words, from cognitive
            science and neuroscience, separates the real risk from the panic, names who is most exposed, and ends with a
            concrete protocol for keeping the benefits of AI without paying the debt.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> cognitive offloading · critical thinking · metacognition
            · the Google effect · desirable difficulties · cognitive debt · human-AI interaction
          </p>
        </div>

        {/* 1 */}
        <h2 id="why" style={rp.h2}>1. Why I started worrying about this</h2>
        <p style={rp.p}>
          It started with a small, embarrassing thing I noticed in myself. I realised I had stopped trying to remember
          phone numbers, directions, spellings, and, more worryingly, that I had started reaching for AI before I had even
          tried to think a problem through on my own. The reaching had become a reflex. And the reflex felt great, faster,
          easier, less friction, right up until I asked myself a simple question: if I never do the hard part anymore, what
          happens to the part of me that used to do it?
        </p>
        <p style={rp.p}>
          I am a behavioural researcher, so I did what I always do with a worry, which is turn it into a question I can
          actually look at. Not the vague “is AI bad for us,” which is unanswerable and a bit lazy, but something testable:
          when people lean on AI for everyday thinking, does their <em>unaided</em> thinking get weaker, and can I see it?
          That is the question this paper is about. I want to be honest that I began with a suspicion, and suspicions bias
          you, so I have tried hard throughout to look for the ways I might be wrong.
        </p>

        {/* 2 */}
        <h2 id="offload" style={rp.h2}>2. The core idea: cognitive offloading</h2>
        <p style={rp.p}>
          There is a clean idea at the centre of all this, and once you have it, the rest of the paper falls into place.
          Cognitive scientists call it <strong style={rp.strong}>cognitive offloading</strong> (the clearest overview is
          Risko and Gilbert, 2016). It just means using something outside your head to reduce the mental effort of a task.
          Writing a note instead of memorising. Using a calculator instead of doing the sum. Letting the phone hold the
          address. Offloading is old, useful, and mostly good. We have always done it.
        </p>
        <p style={rp.p}>
          So why worry now? Because two things about AI are genuinely new. First, the <em>range</em>. A calculator
          offloads arithmetic. AI offloads reasoning, judgment, writing, planning, deciding, the whole high-level toolkit
          that we think of as thinking. Second, the <em>ease</em>. It is now less effortful to ask than to think, for
          almost any question, at any moment. When the easy path and the effortful path diverge that far, human beings
          take the easy path, reliably, every time. That is not a character flaw. It is just how effort works. And it means
          we are now offloading not the boring edges of thinking but its core, at a scale and a smoothness we have never
          tested on ourselves before.
        </p>
        <FigOffloadingCycle />

        {/* 3 */}
        <h2 id="method" style={rp.h2}>3. How I studied it</h2>
        <p style={rp.p}>
          I wanted to look at ordinary adults, not students, because most of the alarming headlines are about the young and
          I was curious about people in the thick of working life. So I focused on American men and women aged 30 to 60, a
          group old enough to remember thinking without these tools and now using them daily. The design was simple on
          purpose, because a white paper should be something you can picture, not a black box.
        </p>
        <FigStudyDesign />
        <p style={rp.p}>
          The shape was this. I looked at how people handled the same kinds of reasoning and judgment problems in two
          modes, once leaning on an AI assistant and once without it, and I paid attention to three things rather than one.
          Not just <em>did they get the answer</em>, but did they still <em>do the thinking</em>: could they reason the
          problem unaided afterwards, did they check or simply accept what the AI told them, and, the most revealing one,
          how well did their <em>confidence</em> track their actual <em>accuracy</em>. That gap between feeling right and
          being right is, to me, the heart of the whole story.
        </p>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted, borderLeft: `2px solid ${C.border}`, paddingLeft: 16 }}>
          A note on method, in the open. This is a live study, and I am collecting responses right now. As the sample
          grows I will report the results on this page. For now, every hard number in this paper comes from the
          peer-reviewed studies I cite, not from my own in-progress data, which is why I describe my own expected result as
          a hypothesis and a direction rather than as settled statistics. I would rather under-claim my own data and let
          the published evidence carry the weight than dress an early study up as something it is not.
        </p>
        {/* Participate CTA */}
        <div style={{ background: C.plumDark, color: '#fff', borderRadius: 16, padding: 'clamp(22px,4vw,30px)', margin: '8px 0 26px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 10 }}>Take part in the study</div>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,.86)', margin: '0 0 16px' }}>
            This research only works if real people take part. It is anonymous, takes about six minutes, and at the end you
            get your own result: how your reasoning and your confidence line up. If you are 30 to 60 I would especially
            love your response, but everyone is welcome.
          </p>
          <a href="/research/study" style={{ display: 'inline-flex', alignItems: 'center', background: `linear-gradient(180deg, #E4C879, ${C.gold})`, color: C.plumDark, fontWeight: 800, fontSize: 15.5, textDecoration: 'none', borderRadius: 999, padding: '13px 26px' }}>Take the study →</a>
        </div>

        {/* 4 */}
        <h2 id="found" style={rp.h2}>4. What I found, and what the evidence says</h2>
        <p style={rp.p}>
          Because this is a live, open study, let me separate cleanly what I am testing from what is already established.
          The hypothesis I built the study around, and the pattern that keeps surfacing across the published record, is
          sobering and simple. The heavier a person’s everyday reliance on AI, the less likely they are to interrogate its
          answers, and the weaker their unaided reasoning looks when the tool is taken away, while their confidence does
          not fall to match. People feel just as sure of answers they never actually produced or checked. The felt sense of
          competence stays high while the underlying competence thins out. If I had to compress it to one line:
          <strong style={rp.strong}> AI is not making people wrong, it is making them sure without being right, and
          comfortable not knowing the difference.</strong>
        </p>
        <p style={rp.p}>
          I would not lean on my own study alone, and I do not have to, because a striking amount of recent, larger,
          careful research points the same way. Gerlich (2025), surveying hundreds of people, found a clear negative
          relationship between frequent AI-tool use and critical-thinking ability, with cognitive offloading sitting in the
          middle as the explanation. Researchers at Microsoft and Carnegie Mellon (Lee and colleagues, 2025) surveyed
          knowledge workers and found that the more people trusted the AI, the less critical-thinking effort they put in,
          they shifted from doing the thinking to merely checking the output, and often not even that.
        </p>
        <FigRelianceThinking />
        <p style={rp.p}>
          There are older warning lights too, from long before ChatGPT, which is what convinces me this is a real feature of
          how minds work and not a passing scare. Sparrow and colleagues (2011) documented the <strong style={rp.strong}>Google
          effect</strong>: when we know a fact is stored somewhere we can retrieve it, we remember the <em>where</em> and
          forget the <em>what</em>. Fisher, Goddu and Keil (2015) showed something more unsettling, that simply searching
          the internet inflates people’s sense of how much <em>they</em> personally know, blurring the line between what is
          in your head and what is merely a click away. Ward and colleagues (2017) found that the mere presence of your
          phone on the desk, switched off, face down, measurably reduces available mental capacity. The theme across all of
          it is the same: outsourcing memory and effort quietly changes what the mind bothers to hold and do.
        </p>

        {/* 5 */}
        <h2 id="brain" style={rp.h2}>5. What is happening in the brain</h2>
        <p style={rp.p}>
          Let me put the neuroscience in plain words, because the brain part is where “use it or lose it” stops being a
          saying and becomes a mechanism. Your brain is not a fixed machine, it is constantly rewiring based on what you
          repeatedly do. When you practise a skill, the connections between the neurons that carry it, the synapses, get
          strengthened, and the wiring gets faster and better insulated. When you stop using a skill, the brain, which is
          ruthlessly economical, lets those connections weaken and reallocates the resources. It genuinely prunes what you
          do not use. This is the same plasticity that lets you get good at anything, running in reverse.
        </p>
        <FigUseItLoseIt />
        <p style={rp.p}>
          There is a beautiful piece of evidence for the upside of effort: London taxi drivers, who spend years memorising
          the city’s streets, were found to have measurably enlarged the memory structures of the hippocampus (Maguire and
          colleagues, 2000). Effortful use built physical structure. The worry with heavy offloading is simply the mirror
          image, that the structures supporting effortful reasoning and memory get less of the exercise that maintains
          them.
        </p>
        <p style={rp.p}>
          Memory research sharpens the point. We have known for years about the <strong style={rp.strong}>testing effect</strong>
          and <strong style={rp.strong}>desirable difficulties</strong> (Roediger and Karpicke, 2006; Bjork and Bjork): the
          effort of retrieving something, or of struggling with a problem, is not a bug to be removed, it is the very thing
          that lays down durable learning and understanding. Struggle is how it sticks. And this is exactly the effort AI is
          so good at removing. That is the deep irony at the centre of this paper: the friction we are so happy to delete is
          often the part that was doing the learning. In mid-2025 a team at MIT’s Media Lab (Kosmyna and colleagues) put
          this on an EEG. People who wrote essays with an AI assistant showed weaker connectivity across the brain regions
          you would expect to be working, remembered strikingly little of what they had just “written,” and felt less
          ownership of it. The authors called what accumulated <em>cognitive debt</em>, which is the phrase I have borrowed
          for this paper because I have not found a better one.
        </p>

        {/* 6 */}
        <h2 id="skill" style={rp.h2}>6. Which part of thinking actually erodes</h2>
        <p style={rp.p}>
          “Critical thinking” is a fuzzy phrase, so let me be precise about which piece is at risk, because it is not all of
          them equally. Critical thinking is really a small stack: taking in a claim, analysing it, <em>evaluating</em>
          whether it holds up, drawing your own inference, and, sitting above all of it, <strong style={rp.strong}>metacognition</strong>,
          the quiet act of noticing your own thinking and asking “wait, is this actually right?”
        </p>
        <p style={rp.p}>
          Here is the trap. When AI hands you a fluent, confident, well-formatted answer, it does not just save you the
          work of producing it. It skips you straight past the evaluation and the doubt. The answer <em>looks</em> finished,
          so the part of you that would have poked at it never switches on. And metacognition, the doubting, is precisely the
          skill that gets weaker with disuse and the one we can least afford to lose, because it is the guard at the gate. A
          person with strong metacognition catches the confident, wrong answer. A person who has stopped exercising it nods
          and moves on. So the erosion is not evenly spread. It eats the evaluation and the doubt first, which are, not
          coincidentally, the most human and the most valuable parts of thinking, and the hardest to notice going.
        </p>

        {/* 7 */}
        <h2 id="who" style={rp.h2}>7. Who is most at risk</h2>
        <p style={rp.p}>
          Not everyone is equally exposed, and the pattern of who is exposed tells you a lot about the mechanism. Two things
          consistently raise the risk. The first is <strong style={rp.strong}>how much you trust the tool</strong>. The more
          you believe the AI is probably right, the less you check, which is exactly what the Microsoft and Carnegie Mellon
          work found, so ironically the better the AI gets, the more this particular risk grows, because trust is earned and
          then over-extended. The second is <strong style={rp.strong}>how much you already know</strong> in the area. An
          expert uses AI as a sounding board and catches its mistakes, because they have their own model to check it
          against. A novice cannot tell a good answer from a confident wrong one, so for them the tool quietly becomes the
          source of truth rather than a draft to interrogate.
        </p>
        <p style={rp.p}>
          On age, I want to be careful, because the honest answer is mixed and I do not want to overclaim from my group. The
          larger surveys tend to find the effect is <em>stronger</em> in younger people, who have offloaded more of their
          thinking for longer and have fewer pre-AI habits to fall back on. My focus on the 30-to-60 group was partly to
          look at people who still have those older habits, and my tentative read is that they are more protected, but only
          if they keep the habits alive. Protection you do not use is not protection for long. That is a hunch from my
          sample, held loosely, not a hard finding, and I would want a much bigger study before I said it with any
          confidence.
        </p>

        {/* 8 */}
        <h2 id="good" style={rp.h2}>8. When AI makes you sharper, not duller</h2>
        <p style={rp.p}>
          I have been gloomy for several sections, so let me correct the balance, because the doom-only version of this is
          false and I do not believe it. The same tool that can erode your thinking can sharpen it, and the difference is
          not the tool at all. It is <em>where you put it in the sequence</em>.
        </p>
        <FigAugmentReplace />
        <p style={rp.p}>
          If you go to the AI <em>first</em>, before you have thought, and accept what it gives you, that is replacement,
          and replacement is where the debt accrues. But if you do the thinking first, form your own rough view, and then
          bring the AI in to challenge it, to argue the other side, to find the hole in your reasoning, to stretch you past
          what you could reach alone, that is augmentation, and augmentation makes you stronger. I have felt both in my own
          work. Used as a crutch, it left me weaker and I could feel it. Used as a sparring partner, it pushed my thinking
          somewhere I could not have reached by myself. Same tool. Opposite outcome. The entire practical question of this
          paper is how to stay reliably on the second side of that line, which is exactly what the next section is for.
        </p>

        {/* 9 */}
        <h2 id="protocol" style={rp.h2}>9. A protocol: AI without the debt</h2>
        <p style={rp.p}>
          A white paper that only diagnoses is half a paper, so here is the direction, the actual protocol I now try to
          follow and would put in front of anyone who asked. None of it is about using AI less for its own sake. It is
          about keeping the effort that does the thinking, and offloading only what was never building anything.
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>Think first, ask second.</strong> Form your own rough answer before you open the AI, even a bad one. The act of trying is where the learning lives. If you skip it, you skip the point.</li>
          <li style={rp.li}><strong style={rp.strong}>Make it argue, not answer.</strong> Ask the AI to challenge your view, find the flaw, take the opposite side. Use it as a sparring partner, not an oracle. Answers you accept teach you nothing; arguments you resolve teach you a lot.</li>
          <li style={rp.li}><strong style={rp.strong}>Verify what matters.</strong> For anything that carries a real consequence, check it against a source that is not the AI. Treat a confident answer as a strong draft, never as the verdict.</li>
          <li style={rp.li}><strong style={rp.strong}>Keep a no-AI lane.</strong> Deliberately protect some thinking, hard reading, first drafts, real problems, that you do entirely unaided, the way you would protect a training session. The point is not output. It is keeping the muscle in use.</li>
          <li style={rp.li}><strong style={rp.strong}>Watch the confidence-accuracy gap.</strong> When you feel very sure of something you did not actually work out yourself, treat that feeling as a warning light, not a green one. That gap is where the debt hides.</li>
        </ol>
        <p style={rp.p}>
          I will be honest that following this is harder than it reads, because the whole pull of the tool is toward the
          lazy path, and willpower is a weak defence against a frictionless option available every second of the day. The
          real fix is probably not personal discipline alone but building tools that are designed to make you think rather
          than to think for you, which is a design problem the whole industry is barely taking seriously yet. Until it
          does, the protocol above is the best individual defence I have found.
        </p>

        {/* 10 */}
        <h2 id="limits" style={rp.h2}>10. Limitations and honesty</h2>
        <p style={rp.p}>
          Let me be clear-eyed about what this paper is and is not, because a researcher who hides the limitations is not
          doing research, they are doing marketing. My own fieldwork is modest in size and observational, so I lean on it
          for direction and on the published literature for the hard numbers, and I have tried to keep that line visible
          throughout rather than blur it. Correlation is not causation, and there is a real chicken-and-egg problem I cannot
          fully rule out: maybe weaker critical thinkers simply reach for AI more, rather than AI weakening them. The truth
          is probably a loop that runs in both directions, which is worse, not better. And some of this research is very new,
          the EEG work especially, and will be argued over and revised. I could be overstating the speed and the severity. I
          have tried not to, but a suspicion you started with has a way of finding the evidence it wants, and I am not immune
          to that.
        </p>

        {/* 11 */}
        <h2 id="close" style={rp.h2}>11. Conclusion</h2>
        <p style={rp.p}>
          Here is where I have landed, after my own look and a long read of everyone else’s. The danger of AI, for most of
          us, is not the dramatic one in the films. It is quiet, and it is happening now, in the smallest habit: reaching
          for the answer before doing the thinking, and slowly forgetting how to tell the difference between knowing
          something and being able to look it up. The skill most at risk is the one we can least afford to lose, the reflex
          to pause and doubt a confident answer, and it fades in exactly the way any unused ability fades, without drama and
          without warning, while our confidence stays high enough that we never notice it going.
        </p>
        <p style={rp.p}>
          But nothing here is fate. The same tool, put on the far side of your own thinking instead of in front of it,
          makes you sharper than you have ever been. The debt is optional. You just have to keep choosing, over and over,
          against the easy path, to do the hard part yourself first. I wrote this paper partly to convince myself to keep
          doing that, and partly because I think it is one of the most important quiet questions of this decade, and almost
          nobody is talking about it in plain enough words for ordinary people to act on. So that, in the end, is the whole
          objective: to make the cost visible while there is still an easy time to start paying attention to it.
        </p>

        <Divider />

        {/* References */}
        <h2 id="refs" style={rp.h2}>References</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          A note on sources: the framing, the study direction, and the conclusions are my own. The quantitative findings I
          rely on come from the peer-reviewed and preprint work below, which I have tried to represent fairly rather than
          bend toward my argument.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Bjork, R. A., &amp; Bjork, E. L. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In <em>Psychology and the Real World.</em> Worth.</p>
          <p style={refStyle}>Fisher, M., Goddu, M. K., &amp; Keil, F. C. (2015). Searching for explanations: How the internet inflates estimates of internal knowledge. <em>Journal of Experimental Psychology: General, 144</em>(3), 674–687.</p>
          <p style={refStyle}>Gerlich, M. (2025). AI tools in society: Impacts on cognitive offloading and the future of critical thinking. <em>Societies, 15</em>(1), 6.</p>
          <p style={refStyle}>Kosmyna, N., et al. (2025). Your brain on ChatGPT: Accumulation of cognitive debt when using an AI assistant for essay writing. <em>arXiv:2506.08872.</em></p>
          <p style={refStyle}>Lee, H.-P., Sarkar, A., et al. (2025). The impact of generative AI on critical thinking: Self-reported reductions in cognitive effort and confidence effects among knowledge workers. <em>Proceedings of CHI 2025.</em></p>
          <p style={refStyle}>Maguire, E. A., et al. (2000). Navigation-related structural change in the hippocampi of taxi drivers. <em>Proceedings of the National Academy of Sciences, 97</em>(8), 4398–4403.</p>
          <p style={refStyle}>Risko, E. F., &amp; Gilbert, S. J. (2016). Cognitive offloading. <em>Trends in Cognitive Sciences, 20</em>(9), 676–688.</p>
          <p style={refStyle}>Roediger, H. L., &amp; Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. <em>Psychological Science, 17</em>(3), 249–255.</p>
          <p style={refStyle}>Sparrow, B., Liu, J., &amp; Wegner, D. M. (2011). Google effects on memory: Cognitive consequences of having information at our fingertips. <em>Science, 333</em>(6043), 776–778.</p>
          <p style={refStyle}>Ward, A. F., Duke, K., Gneezy, A., &amp; Bos, M. W. (2017). Brain drain: The mere presence of one’s own smartphone reduces available cognitive capacity. <em>Journal of the Association for Consumer Research, 2</em>(2), 140–154.</p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
