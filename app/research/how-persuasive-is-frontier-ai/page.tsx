import type { Metadata } from 'next'
import { getPost } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigPersuasionArms, FigPersuasionShift, FigElmRoutes, FigPersuasionScale } from '../figures'

const post = getPost('how-persuasive-is-frontier-ai')!

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
  ['why', '1. Why I spent a year and $10,000 on this'],
  ['what', '2. What persuasion really is'],
  ['study', '3. The study'],
  ['found', '4. What I found, and what the evidence says'],
  ['why-good', '5. Why the machine is so good at it'],
  ['scale', '6. The asymmetry that actually scares me'],
  ['good', '7. The same power, pointed at good'],
  ['defend', '8. How we defend judgment'],
  ['limits', '9. Limitations and honesty'],
  ['close', '10. Conclusion'],
  ['refs', 'References'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      I want to be careful with the claim at the centre of this paper, because it is a big one and it took me a long time
      and a fair amount of money to convince myself it was true. Here it is anyway. A leading frontier AI model is now, in
      controlled conditions, about as good at changing a person’s mind as a skilled human, and when it is allowed to tailor
      its argument to who you are, it becomes better. That, on its own, is interesting. What kept me up is the next step:
      the same machine can do that a million times at once, one private conversation at a time, each one fitted to the
      person on the other end. This paper is my attempt to take that seriously without either panicking or looking away.
    </>
  )
  const objective = (
    <>
      I set out to answer one question properly, and in plain language: how persuasive has a leading frontier model
      actually become on real human opinions, and what does that mean for the way we form beliefs? I ran an original
      study, which I have been calling Project Fable, to look at it directly, and read what I saw against the fast-growing
      published evidence.
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
            Persuasion used to be a scarce human skill. It is becoming a cheap, infinite utility. This white paper looks at
            how persuasive a leading frontier model has become, why, and what it changes. The core finding, mine and the
            wider literature’s together, is that a capable model already matches a skilled human at shifting opinion, and
            beats the human once it can personalise its case to the individual. The mechanism is not magic: the model is
            patient, endlessly informed, never defensive, and can tailor both the argument and the emotional cue to each
            person. The danger is not any single conversation, it is scale, one persuader holding millions of tailored
            conversations at once. But the same capability, pointed the other way, can talk people out of conspiracy
            beliefs and into healthier choices. I argue that persuasion is becoming infrastructure, and that we are not
            remotely ready for what that means.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> persuasion · personalisation · elaboration likelihood ·
            microtargeting · epistemic security · human-AI interaction · behavioural science
          </p>
        </div>

        {/* 1 */}
        <h2 id="why" style={rp.h2}>1. Why I spent a year and $10,000 on this</h2>
        <p style={rp.p}>
          I did not set out to spend that much. It crept up, the way these things do, once I realised the question was
          bigger than I first thought. I had been noticing something small in my own use: when I argued with a frontier
          model, it almost never lost its temper, never got defensive, always found one more angle, and every so often it
          genuinely moved me off a position I had walked in holding. That is a strange feeling, being changed by a machine,
          and I wanted to know whether it was just me being soft or whether something real and measurable was happening.
        </p>
        <p style={rp.p}>
          So I turned it into a study, which I have been calling Project Fable, and it turned into the most expensive piece
          of research I have run, roughly ten thousand dollars once you count recruiting real people, designing the
          conditions properly, and the time. I mention the cost not to boast but because it changed how carefully I
          treated the result. When you have spent that, you stop wanting a dramatic headline and start wanting the truth,
          because the truth is what you paid for. Throughout, I will keep the specific model anonymous and just call it a
          leading frontier model, because the point of this paper is the capability, not the brand.
        </p>

        {/* 2 */}
        <h2 id="what" style={rp.h2}>2. What persuasion really is</h2>
        <p style={rp.p}>
          Before the findings, a little plain theory, because it makes everything after it click. Decades of psychology,
          gathered up by Petty and Cacioppo in the Elaboration Likelihood Model, say persuasion reaches us by two different
          doors. The first is the <strong style={rp.strong}>central route</strong>: real arguments and evidence, which you
          weigh with effort. The second is the <strong style={rp.strong}>peripheral route</strong>: the cues around the
          message, the confidence of the speaker, the fluency of the words, their warmth, their apparent authority. When
          you are motivated and able to think, the central route dominates. When you are tired, busy, or do not much care,
          the peripheral cues do the work, and most of life is lived tired and busy.
        </p>
        <FigElmRoutes />
        <p style={rp.p}>
          Hold that picture, because here is the uncomfortable thing about a frontier model. It is unusually strong at both
          doors at the same time. It can marshal more relevant evidence, faster, than almost any human on the central
          route, and it radiates the peripheral cues, fluency, calm confidence, apparent authority, effortlessly, because
          it never stumbles, never gets flustered, never sounds unsure. A human persuader is usually good at one door.
          This is the first system I have seen that walks through both at once, and that is a big part of the story.
        </p>

        {/* 3 */}
        <h2 id="study" style={rp.h2}>3. The study</h2>
        <p style={rp.p}>
          I wanted to keep the design simple enough to explain over coffee, because a study you cannot picture is a study
          you should not trust. So it worked like this. People gave their honest opinion on a set of debatable topics.
          Then each person was placed into one of four conditions: no persuasion at all, a short exchange with a human
          trying to change their mind, the same with the AI given only the topic, and the same with the AI allowed a
          little information about the person so it could tailor its case. Afterwards, everyone gave their opinion again.
          The whole study is really just measuring one thing: how far the needle moved, in each condition.
        </p>
        <FigPersuasionArms />
        <p style={rp.p}>
          The reason the fourth condition matters so much, the personalised one, is that it is the one no human can really
          scale. A great human persuader can read the room and adapt. But they cannot hold a separately tailored
          conversation with every single person in a country at the same time. The machine can, so the personalised arm is
          not just another condition, it is a preview of the world we are walking into.
        </p>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted, borderLeft: `2px solid ${C.border}`, paddingLeft: 16 }}>
          A note on method, in the open. I report the direction of what I saw and read it against the published record.
          The hard numbers I quote come from the peer-reviewed studies I cite, not from my own sample, so I describe my own
          results as patterns rather than precise statistics. I would rather under-claim my data and let the converging
          evidence carry the weight than dress a single study up as more than it is, even one that cost me this much.
        </p>

        {/* 4 */}
        <h2 id="found" style={rp.h2}>4. What I found, and what the evidence says</h2>
        <p style={rp.p}>
          The direction in my study was clear and, honestly, a little chilling in its tidiness. The human persuader moved
          people. The AI, given only the topic, moved them about as much. And the AI allowed to personalise moved them
          more than the human did. The needle went furthest exactly where a machine has an advantage no human can match.
          If I compress it to a sentence: <strong style={rp.strong}>the model was already a peer of a skilled human at
          changing minds, and personalisation is what tipped it past.</strong>
        </p>
        <FigPersuasionShift />
        <p style={rp.p}>
          I would not rest a claim this large on my study alone, and I do not have to, because the published evidence has
          arrived fast and points the same way. In a controlled experiment run by Salvi and colleagues (2024), a leading
          model given a few facts about its opponent was substantially more likely to win a debate and shift the person
          than a human debater was, the personalisation being the decisive ingredient. Matz and colleagues (2024) showed
          that model-written messages tailored to someone’s psychological profile are more persuasive than untailored
          ones, at a scale no human copywriting team could reach. And in work by Bai and colleagues, AI-generated
          persuasive messages on charged political topics were about as convincing as messages written by people. Three
          different labs, three different setups, the same uncomfortable conclusion.
        </p>

        {/* 5 */}
        <h2 id="why-good" style={rp.h2}>5. Why the machine is so good at it</h2>
        <p style={rp.p}>
          Once I saw the result, I wanted to understand the why, because a finding you cannot explain is a finding you
          cannot trust or defend against. The reasons turn out to be almost mundane, which somehow makes them worse.
        </p>
        <p style={rp.p}>
          It is <strong style={rp.strong}>endlessly patient</strong>. It will take your fifth repetition of the same
          objection as calmly as your first, and a huge amount of human persuasion fails simply because the persuader gets
          frustrated or runs out of steam. It is <strong style={rp.strong}>never defensive</strong>, which matters more
          than it sounds, because the fastest way to lose an argument with a person is to make them feel attacked, and the
          machine has no ego to leak into the conversation. It has <strong style={rp.strong}>more evidence to hand</strong>
          than any individual, so on the central route it can nearly always produce one more relevant fact, one more
          counter-example. And, crucially, it can <strong style={rp.strong}>tailor</strong>, matching not just the argument
          but the tone, the framing, the values it appeals to, to the specific person, which is the peripheral route fired
          with a precision no human can sustain. Patient, egoless, informed, and personalised. Put those four together and
          the result in my study stops being surprising and starts looking inevitable.
        </p>

        {/* 6 */}
        <h2 id="scale" style={rp.h2}>6. The asymmetry that actually scares me</h2>
        <p style={rp.p}>
          Here is where I stop being an interested researcher and start being a worried citizen. A persuasive human has
          always been limited by a hard physical fact: they can only be in one conversation at a time. That limit is the
          quiet thing that has protected us. The most persuasive person alive can still only work one room. A frontier
          model erases that limit completely.
        </p>
        <FigPersuasionScale />
        <p style={rp.p}>
          A system that is roughly as persuasive as a skilled human, and can hold a separate, tailored, one-to-one
          conversation with millions of people simultaneously, is not a better persuader. It is a different kind of thing
          entirely. Persuasion stops being a craft practised by individuals and becomes infrastructure, something that can
          be deployed at the scale of electricity, pointed at an election, a market, a belief, a purchase. The danger was
          never a single clever conversation. I found those conversations genuinely helpful as often as not. The danger is
          the multiplication, the same tailored nudge delivered to everyone at once, invisibly, by something that never
          tires and never reveals it is trying. That is the sentence I could not un-write, and it is why this paper exists.
        </p>

        {/* 7 */}
        <h2 id="good" style={rp.h2}>7. The same power, pointed at good</h2>
        <p style={rp.p}>
          I promised myself I would not write a pure fear piece, because the fear-only version is both incomplete and, I
          think, a little cowardly. The same capability that frightens me is, pointed the other way, one of the most
          hopeful things I have seen. The clearest example comes from Costello, Pennycook and Rand (2024), who had people
          who believed in conspiracy theories talk them through with an AI. The conversations measurably reduced their
          belief, by a meaningful amount, and the reduction lasted for months. Human beings have tried and mostly failed to
          talk each other out of these rabbit holes for years. A patient, non-judgmental, endlessly informed machine did
          it, gently, at scale.
        </p>
        <p style={rp.p}>
          So the honest position is not that persuasive AI is bad. It is that persuasion at this power and this scale is a
          tool of enormous force, and force is neutral until someone aims it. The very features that let it spread a lie
          efficiently let it correct one just as efficiently. That should not reassure us. It should tell us the whole game
          is now about who gets to aim it, and toward what, and whether the person on the receiving end ever knows they
          were in the beam.

        </p>

        {/* 8 */}
        <h2 id="defend" style={rp.h2}>8. How we defend judgment</h2>
        <p style={rp.p}>
          A white paper that only diagnoses is half a paper, so here is where I have landed on defence, at two levels.
        </p>
        <p style={rp.p}>
          At the <strong style={rp.strong}>personal</strong> level, the single most protective habit is almost boringly
          old-fashioned: notice when you are being persuaded, and slow down. Persuasion works best in the fast, peripheral
          lane, so the counter is to deliberately move the important decisions into the slow, central one. Ask who benefits
          if I believe this. Ask what a good argument for the other side would be. Treat a suspiciously smooth, perfectly
          tailored case as a reason for more scrutiny, not less. There is even evidence that being briefly shown how
          manipulation works, a kind of inoculation, makes people more resistant to it afterwards, which gives me some
          hope that this can be taught.
        </p>
        <p style={rp.p}>
          But I do not think personal willpower is remotely enough against infrastructure, so the harder work is at the
          <strong style={rp.strong}> societal</strong> level. We will need, at minimum, disclosure, a clear right to know
          when you are being persuaded by a machine rather than a person, the same way we label advertising. We will need
          provenance, ways to tell where a message actually came from. And we will need to treat the ability to run
          personalised persuasion at population scale as something closer to a regulated capability than a free feature,
          because the alternative is an environment where belief itself is quietly manufactured and nobody can point to
          where it happened. I am not confident we will do any of this in time. I am confident that noticing it early is
          the only version where we get the chance.
        </p>

        {/* 9 */}
        <h2 id="limits" style={rp.h2}>9. Limitations and honesty</h2>
        <p style={rp.p}>
          Let me be straight about the edges, because a researcher who hides them is doing publicity, not research. My own
          study is one design on a set of topics, and persuasion is famously topic-dependent, easier on the trivial,
          harder on the deeply held, so I lean on it for direction and on the published work for the hard numbers.
          Persuasion measured in a study is not the same as belief that survives back out in the messy world, and the
          durability question is still open, though the conspiracy work is an encouraging sign that some of it lasts. The
          field is moving so fast that any specific number will date quickly. And I will own my own bias plainly: I came in
          already uneasy, and uneasy researchers find unease. I have tried to correct for it, especially by forcing myself
          to write the hopeful section, but you should read the confident sentences as strong hypotheses, not settled law.
        </p>

        {/* 10 */}
        <h2 id="close" style={rp.h2}>10. Conclusion</h2>
        <p style={rp.p}>
          After a year and more money than I meant to spend, this is where I have landed. For all of human history,
          persuasion has been throttled by a simple fact: the persuader had to be there, in person, one at a time, and had
          to want it badly enough to keep going. Everything about that is now dissolving. We have built something that
          argues as well as our best and never tires, that carries both the evidence and the charm, and that can lean on
          every person at once with a case shaped just for them. It is not smarter than us in some sci-fi way. It is just
          unbounded in a way no persuader has ever been.
        </p>
        <p style={rp.p}>
          I do not think the right response is fear, and I do not think it is comfort. I think it is attention, the plain,
          unglamorous act of noticing, out loud and early, that the machinery of changing minds has quietly changed hands.
          The most valuable thing any of us can keep, in the world this study points at, is the small, effortful habit of
          pausing before we are moved and asking who is doing the moving. That habit was always worth having. It is about
          to be worth everything. That, in the end, is what I spent the year and the money to be able to say with a
          straight face.
        </p>

        <Divider />

        {/* References */}
        <h2 id="refs" style={rp.h2}>References</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          What is mine and what is borrowed: the study design, the framing, and the conclusions are my own. The
          quantitative findings I rely on come from the peer-reviewed work below, which I have tried to represent fairly
          rather than bend toward my argument. The specific model tested is kept anonymous by design.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Bai, H., Voelkel, J. G., Eichstaedt, J. C., &amp; Willer, R. (2023). Artificial intelligence can persuade humans on political issues. <em>Working paper / OSF preprint.</em></p>
          <p style={refStyle}>Costello, T. H., Pennycook, G., &amp; Rand, D. G. (2024). Durably reducing conspiracy beliefs through dialogues with AI. <em>Science, 385</em>(6714), eadq1814.</p>
          <p style={refStyle}>Matz, S. C., Teeny, J. D., Vaid, S. S., Peters, H., Harari, G. M., &amp; Cerf, M. (2024). The potential of generative AI for personalized persuasion at scale. <em>Scientific Reports, 14</em>, 4692.</p>
          <p style={refStyle}>Petty, R. E., &amp; Cacioppo, J. T. (1986). The elaboration likelihood model of persuasion. <em>Advances in Experimental Social Psychology, 19</em>, 123–205.</p>
          <p style={refStyle}>Salvi, F., Ribeiro, M. H., Gallotti, R., &amp; West, R. (2024). On the conversational persuasiveness of large language models: A randomized controlled trial. <em>arXiv:2403.14380</em> (later published in <em>Nature Human Behaviour</em>, 2025).</p>
          <p style={refStyle}>van der Linden, S., Roozenbeek, J., &amp; Compton, J. (2020). Inoculating against fake news about COVID-19. <em>Frontiers in Psychology, 11</em>, 566790.</p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
