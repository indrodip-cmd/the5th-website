import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigStudyDesign, FigOffloadingCycle, FigRelianceThinking, FigUseItLoseIt, FigAugmentReplace } from '../figures'

const post = getPost('is-ai-eroding-critical-thinking')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['summary', 'The short version'],
  ['why', '1. Why I started worrying'],
  ['offload', '2. The one big idea'],
  ['method', '3. How I studied it'],
  ['found', '4. What I found'],
  ['brain', '5. What happens in the brain'],
  ['skill', '6. The part that fades first'],
  ['who', '7. Who is most at risk'],
  ['good', '8. When AI makes you sharper'],
  ['protocol', '9. How to use AI without the cost'],
  ['limits', '10. What this cannot say'],
  ['close', '11. The takeaway'],
  ['refs', 'References'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      Let me say the finding in one breath, then earn it. I think leaning on AI every day, the small habit of asking it to
      think for us, is quietly weakening the one skill we most want to keep: the ability to reason for ourselves, and to
      doubt an answer before we take it. Not because AI makes us dumb. It does not. But a muscle you stop using gets weak.
      And we have started handing off the work of thinking at a size we have never tried before.
    </>
  )
  const objective = (
    <>
      I wanted to test a fear I could not shake, in plain words, on ordinary people. Does leaning on AI for everyday
      thinking quietly wear down the thinking itself? So I studied how a group of American adults aged 30 to 60 reason
      with and without the tool, and read it against the fast-growing research, through a brain-science lens.
    </>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }} />
      <ResearchArticleLayout post={post} toc={TOC} lead={lead} objective={objective}>

        {/* Summary */}
        <div id="summary" style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '22px 24px', margin: '6px 0 34px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>The short version</div>
          <p style={{ ...rp.p, fontSize: 15.5, margin: '0 0 10px' }}>
            The ease of AI has a hidden cost. I call it <em>cognitive debt</em>. When we hand the hard parts of thinking,
            remembering, weighing, judging, doubting, to a machine, those skills go unused and slowly fade. But our
            <em> confidence</em> stays high, or even goes up. I am running this as an open study of adults aged 30 to 60,
            which you can join in a few minutes. It tests a simple pattern that recent research already shows: the people
            who lean hardest on AI check its answers least, and reason least on their own, while feeling just as sure. This
            paper explains why in plain words, splits the real risk from the panic, says who is most at risk, and ends with
            a simple plan for keeping the good parts of AI without paying the debt.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> cognitive offloading · critical thinking · metacognition
            · the Google effect · desirable difficulties · cognitive debt · human-AI interaction
          </p>
        </div>

        {/* 1 */}
        <h2 id="why" style={rp.h2}>1. Why I started worrying</h2>
        <p style={rp.p}>
          It started with a small, embarrassing thing I saw in myself. I had stopped trying to remember phone numbers,
          directions, spellings. Worse, I had started reaching for AI before I even tried to think a problem through on my
          own.
        </p>
        <p style={rp.p}>
          The reaching had become a reflex. And it felt great. Faster, easier, less effort. Right up until I asked myself
          one question. If I never do the hard part anymore, what happens to the part of me that used to do it?
        </p>
        <p style={rp.p}>
          I am a behavioural researcher, so I did what I always do with a worry. I turned it into a question I could
          actually look at. Not the vague is AI bad for us, which no one can answer, but something you can test. When
          people lean on AI to think, does their <em>own</em> thinking get weaker? And can I see it? I began with a hunch,
          and hunches bias you. So I tried hard, all the way through, to look for the ways I might be wrong.
        </p>

        {/* 2 */}
        <h2 id="offload" style={rp.h2}>2. The one big idea</h2>
        <p style={rp.p}>
          There is one clean idea at the center of this. Once you have it, the rest clicks. Scientists call it
          <strong style={rp.strong}> cognitive offloading</strong> (the clearest overview is Risko and Gilbert, 2016). It
          just means using something outside your head to save mental effort.
        </p>
        <p style={rp.p}>
          Writing a note instead of memorizing. Using a calculator instead of doing the sum. Letting your phone hold the
          address. Offloading is old, useful, and mostly good. We have always done it.
        </p>
        <p style={rp.p}>
          So why worry now? Two things about AI are new. First, the <em>range</em>. A calculator offloads math. AI offloads
          reasoning, judgment, writing, planning, deciding, the whole toolkit we call thinking. Second, the <em>ease</em>.
          It is now easier to ask than to think, for almost any question, any time.
        </p>
        <p style={rp.p}>
          When the easy path and the hard path split that far apart, people take the easy path. Every time. That is not a
          flaw. It is just how effort works. Which means we are now offloading not the boring edges of thinking, but its
          core, and doing it more smoothly than we have ever tried on ourselves.
        </p>
        <FigOffloadingCycle />

        {/* 3 */}
        <h2 id="method" style={rp.h2}>3. How I studied it</h2>
        <p style={rp.p}>
          I wanted to look at ordinary adults, not students, because most of the scary headlines are about the young. I was
          curious about people in the thick of working life. So I focused on American men and women aged 30 to 60. Old
          enough to remember thinking without these tools, and now using them daily.
        </p>
        <p style={rp.p}>
          I kept the design simple on purpose. A study you cannot picture is one you should not trust.
        </p>
        <FigStudyDesign />
        <p style={rp.p}>
          Here is the shape. I looked at how people handled the same kinds of reasoning problems two ways: once leaning on
          an AI, once without it. And I watched three things, not one. Not just <em>did they get the answer</em>, but did
          they still <em>do the thinking</em>? Could they reason it out alone afterward? Did they check the AI or just
          accept it? And, the big one, how well did their <em>confidence</em> match their actual <em>accuracy</em>? That
          gap, between feeling right and being right, is the heart of the whole story.
        </p>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted, borderLeft: `2px solid ${C.border}`, paddingLeft: 16 }}>
          A note on method, in the open. This is a live study, and I am collecting responses right now. As more come in, I
          will report the results on this page. For now, every hard number in this paper comes from the published studies I
          cite, not from my own in-progress data. That is why I call my own result a direction, not a final number. I would
          rather say too little about my data than dress an early study up as more than it is.
        </p>
        {/* Participate CTA */}
        <div style={{ background: C.plumDark, color: '#fff', borderRadius: 16, padding: 'clamp(22px,4vw,30px)', margin: '8px 0 26px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 10 }}>Take part in the study</div>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,.86)', margin: '0 0 16px' }}>
            This research only works if real people take part. It is anonymous, takes about six minutes, and at the end you
            get your own result: how your reasoning and your confidence line up. If you are 30 to 60, I would especially
            love your response. But everyone is welcome.
          </p>
          <a href="/research/study" style={{ display: 'inline-flex', alignItems: 'center', background: `linear-gradient(180deg, #E4C879, ${C.gold})`, color: C.plumDark, fontWeight: 800, fontSize: 15.5, textDecoration: 'none', borderRadius: 999, padding: '13px 26px' }}>Take the study →</a>
        </div>

        {/* 4 */}
        <h2 id="found" style={rp.h2}>4. What I found</h2>
        <p style={rp.p}>
          Because this is a live study, let me split what I am testing from what is already known.
        </p>
        <p style={rp.p}>
          The hunch I built the study around, and the pattern that keeps showing up in the research, is simple and a little
          grim. The more a person leans on AI, the less they check its answers, and the weaker their own reasoning looks
          when the tool is taken away. Meanwhile their confidence does not drop to match. People feel just as sure of
          answers they never actually worked out or checked.
        </p>
        <p style={rp.p}>
          In one line: <strong style={rp.strong}>AI is not making people wrong. It is making them sure without being right,
          and comfortable not knowing the difference.</strong>
        </p>
        <p style={rp.p}>
          I would not lean on my own study alone. I do not have to. A lot of recent, larger research points the same way.
          Gerlich (2025) surveyed hundreds of people and found a clear link: more AI use went with weaker critical
          thinking, with offloading sitting in the middle as the cause. A team at Microsoft and Carnegie Mellon (Lee and
          colleagues, 2025) surveyed knowledge workers. The more they trusted the AI, the less thinking effort they put in.
          They shifted from doing the thinking to just checking the output. Often not even that.
        </p>
        <FigRelianceThinking />
        <p style={rp.p}>
          There are older warning lights too, from before ChatGPT, which tells me this is about how minds work, not a
          passing scare. Sparrow and colleagues (2011) found the <strong style={rp.strong}>Google effect</strong>: when we
          know a fact is saved somewhere, we remember <em>where</em> it is and forget the fact itself. Fisher, Goddu and
          Keil (2015) found something stranger: just searching the internet makes people feel they know more than they do,
          blurring the line between what is in your head and what is one click away. Ward and colleagues (2017) found that a
          phone on your desk, turned off and face down, still lowers your available brainpower. Same theme every time.
          Handing off memory and effort quietly changes what the mind bothers to hold and do.
        </p>

        {/* 5 */}
        <h2 id="brain" style={rp.h2}>5. What happens in the brain</h2>
        <p style={rp.p}>
          Let me put the brain science in plain words, because this is where use it or lose it stops being a saying and
          becomes a real mechanism.
        </p>
        <p style={rp.p}>
          Your brain is not fixed. It rewires based on what you do over and over. When you practice a skill, the links
          between the brain cells that carry it get stronger and faster. When you stop using a skill, the brain, which is
          very cheap and efficient, lets those links weaken and puts the resources elsewhere. It actually prunes what you
          do not use. It is the same power that lets you get good at anything, running in reverse.
        </p>
        <FigUseItLoseIt />
        <p style={rp.p}>
          There is a lovely proof of the upside. London taxi drivers spend years memorizing the city’s streets. Their
          memory area, the hippocampus, was found to be measurably bigger (Maguire and colleagues, 2000). Hard use built
          real, physical structure. The worry with heavy offloading is just the mirror image. The parts that carry
          effortful thinking get less of the exercise that keeps them strong.
        </p>
        <p style={rp.p}>
          Memory research sharpens the point. For years we have known about the <strong style={rp.strong}>testing effect</strong>
          and <strong style={rp.strong}>desirable difficulties</strong> (Roediger and Karpicke, 2006; Bjork and Bjork). The
          effort of pulling something from memory, or of struggling with a problem, is not a bug to remove. It is the very
          thing that makes learning stick. Struggle is how it lasts.
        </p>
        <p style={rp.p}>
          And that is exactly the effort AI is so good at removing. Here is the deep irony of this paper. The friction we
          are so happy to delete is often the part that was doing the learning. In mid-2025 a team at MIT’s Media Lab
          (Kosmyna and colleagues) put this on a brain scan. People who wrote essays with an AI showed weaker brain
          activity where you would expect the work to happen, remembered little of what they had just written, and felt
          less ownership of it. The authors called what built up <em>cognitive debt</em>. I borrowed the phrase because I
          could not find a better one.
        </p>

        {/* 6 */}
        <h2 id="skill" style={rp.h2}>6. The part that fades first</h2>
        <p style={rp.p}>
          Critical thinking is a fuzzy phrase, so let me be exact about which piece is at risk, because it is not all of
          them equally.
        </p>
        <p style={rp.p}>
          Critical thinking is really a small stack. You take in a claim. You break it down. You <em>judge</em> whether it
          holds up. You draw your own conclusion. And above all of it sits <strong style={rp.strong}>metacognition</strong>,
          the quiet act of watching your own thinking and asking, wait, is this actually right?
        </p>
        <p style={rp.p}>
          Here is the trap. When AI hands you a smooth, confident, tidy answer, it does not just save you the work of making
          it. It skips you right past the judging and the doubting. The answer <em>looks</em> finished, so the part of you
          that would have poked at it never turns on.
        </p>
        <p style={rp.p}>
          And the doubting is exactly the skill that weakens with disuse, and the one we can least afford to lose. It is the
          guard at the gate. A person with strong doubt catches the confident, wrong answer. A person who has stopped using
          it nods and moves on. So the wear is not spread evenly. It eats the judging and the doubting first, the most human
          and most valuable parts, and the hardest to notice slipping away.
        </p>

        {/* 7 */}
        <h2 id="who" style={rp.h2}>7. Who is most at risk</h2>
        <p style={rp.p}>
          Not everyone is equally exposed, and who is exposed tells you a lot about why. Two things raise the risk.
        </p>
        <p style={rp.p}>
          The first is <strong style={rp.strong}>how much you trust the tool</strong>. The more you believe the AI is
          probably right, the less you check. That is exactly what the Microsoft and Carnegie Mellon work found. So, oddly,
          the better the AI gets, the more this risk grows. Trust gets earned, and then over-extended.
        </p>
        <p style={rp.p}>
          The second is <strong style={rp.strong}>how much you already know</strong> in the area. An expert uses AI as a
          sounding board and catches its mistakes, because they have their own picture to check it against. A beginner
          cannot tell a good answer from a confident wrong one. So for them the tool quietly becomes the truth, instead of a
          draft to question.
        </p>
        <p style={rp.p}>
          On age, I want to be careful, because the honest answer is mixed. The bigger surveys tend to find the effect is
          <em> stronger</em> in younger people, who have offloaded their thinking for longer and have fewer pre-AI habits to
          fall back on. I looked at the 30-to-60 group partly because they still have those older habits. My tentative read
          is they are more protected, but only if they keep the habits alive. Protection you do not use does not last. That
          is a hunch from my group, held loosely, not a hard finding.
        </p>

        {/* 8 */}
        <h2 id="good" style={rp.h2}>8. When AI makes you sharper</h2>
        <p style={rp.p}>
          I have been gloomy for a while, so let me fix the balance. The doom-only version is false, and I do not believe
          it. The same tool that can wear down your thinking can also sharpen it. The difference is not the tool. It is
          <em> where you put it in the order</em>.
        </p>
        <FigAugmentReplace />
        <p style={rp.p}>
          If you go to the AI <em>first</em>, before you have thought, and accept what it gives you, that is replacement.
          Replacement is where the debt builds.
        </p>
        <p style={rp.p}>
          But if you think first, form your own rough view, and then bring the AI in to challenge it, to argue the other
          side, to find the hole in your logic, that is augmentation. Augmentation makes you stronger. I have felt both. As
          a crutch, it left me weaker, and I could feel it. As a sparring partner, it pushed my thinking somewhere I could
          not reach alone. Same tool. Opposite result. The whole practical question of this paper is how to stay on the
          second side of that line, which is what the next part is for.
        </p>

        {/* 9 */}
        <h2 id="protocol" style={rp.h2}>9. How to use AI without the cost</h2>
        <p style={rp.p}>
          A paper that only diagnoses is half a paper. So here is the plan I try to follow, and would hand anyone who asked.
          None of it is about using AI less for its own sake. It is about keeping the effort that does the thinking, and
          handing off only what was never building anything.
        </p>
        <ol style={{ paddingLeft: 22, margin: '0 0 18px' }}>
          <li style={rp.li}><strong style={rp.strong}>Think first, ask second.</strong> Form your own rough answer before you open the AI, even a bad one. The trying is where the learning lives. Skip it and you skip the point.</li>
          <li style={rp.li}><strong style={rp.strong}>Make it argue, not answer.</strong> Ask the AI to challenge your view, find the flaw, take the other side. Use it as a sparring partner, not an oracle. Answers you accept teach you nothing. Arguments you settle teach you a lot.</li>
          <li style={rp.li}><strong style={rp.strong}>Check what matters.</strong> For anything with real stakes, check it against a source that is not the AI. Treat a confident answer as a strong draft, never the final word.</li>
          <li style={rp.li}><strong style={rp.strong}>Keep a no-AI lane.</strong> On purpose, protect some thinking, hard reading, first drafts, real problems, that you do fully on your own. Like a workout. The point is not the output. It is keeping the muscle in use.</li>
          <li style={rp.li}><strong style={rp.strong}>Watch the sure-but-not-yours feeling.</strong> When you feel very sure of something you did not actually work out yourself, treat that feeling as a warning light, not a green light. That is where the debt hides.</li>
        </ol>
        <p style={rp.p}>
          I will be honest. Following this is harder than it reads. The whole pull of the tool is toward the lazy path, and
          willpower is a weak guard against an easy option that is there every second of the day. The real fix is probably
          not personal willpower alone. It is building tools that make you think, instead of thinking for you. The industry
          is barely taking that seriously yet. Until it does, the plan above is the best defence I have found.
        </p>

        {/* 10 */}
        <h2 id="limits" style={rp.h2}>10. What this cannot say</h2>
        <p style={rp.p}>
          Let me be clear about the edges, because a researcher who hides the limits is doing marketing, not research.
        </p>
        <p style={rp.p}>
          My own fieldwork is small and observational, so I lean on it for direction and on the published work for the hard
          numbers. I have tried to keep that line visible. Also, a link is not a cause. There is a real chicken-and-egg
          problem I cannot fully rule out. Maybe weaker thinkers just reach for AI more, rather than AI weakening them. The
          truth is probably a loop that runs both ways, which is worse, not better.
        </p>
        <p style={rp.p}>
          And some of this research is very new, the brain-scan work most of all, and will be argued over and revised. I
          could be overstating the speed and the size of it. I have tried not to. But a fear you start with has a way of
          finding the evidence it wants, and I am not immune to that.
        </p>

        {/* 11 */}
        <h2 id="close" style={rp.h2}>11. The takeaway</h2>
        <p style={rp.p}>
          Here is where I land, after my own look and a long read of everyone else’s. The danger of AI, for most of us, is
          not the dramatic one in the films. It is quiet, and it is happening now, in the smallest habit. Reaching for the
          answer before doing the thinking. Slowly forgetting the difference between knowing something and being able to
          look it up.
        </p>
        <p style={rp.p}>
          The skill most at risk is the one we can least afford to lose: the reflex to pause and doubt a confident answer.
          And it fades the way any unused skill fades. Without drama, without warning, while our confidence stays high
          enough that we never notice it going.
        </p>
        <p style={rp.p}>
          But none of this is fate. The same tool, put on the far side of your own thinking instead of in front of it,
          makes you sharper than ever. The debt is optional. You just have to keep choosing, again and again, against the
          easy path, to do the hard part yourself first. I wrote this partly to talk myself into keeping that habit, and
          partly because it is one of the biggest quiet questions of this decade, and almost nobody is saying it in plain
          enough words for ordinary people to act on. So that is the whole goal. To make the cost visible while it is still
          easy to start paying attention.
        </p>

        <Divider />

        {/* References */}
        <h2 id="refs" style={rp.h2}>References</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          A note on sources: the framing, the study direction, and the conclusions are my own. The hard numbers I rely on
          come from the peer-reviewed and preprint work below, which I have tried to represent fairly rather than bend
          toward my argument.
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
