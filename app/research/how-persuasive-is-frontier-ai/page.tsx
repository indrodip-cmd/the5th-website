import type { Metadata } from 'next'
import { getPost, articleMetadata, articleJsonLd } from '../posts'
import { ResearchArticleLayout } from '../shell'
import { rp, Divider, C } from '../ui'
import { FigPersuasionArms, FigPersuasionShift, FigElmRoutes, FigPersuasionScale } from '../figures'

const post = getPost('how-persuasive-is-frontier-ai')!

export const metadata: Metadata = articleMetadata(post)

const ARTICLE_JSONLD = articleJsonLd(post)

const TOC: [string, string][] = [
  ['summary', 'The short version'],
  ['why', '1. Why I spent $10,000 on this'],
  ['what', '2. What persuasion is'],
  ['study', '3. The test I ran'],
  ['found', '4. What I found'],
  ['why-good', '5. Why the AI is so good at it'],
  ['scale', '6. The part that scares me'],
  ['good', '7. The same power can help'],
  ['defend', '8. How we protect ourselves'],
  ['limits', '9. What this study cannot say'],
  ['close', '10. The takeaway'],
  ['refs', 'References'],
]

const refStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 4 }

export default function Article() {
  const lead = (
    <>
      Let me start with the big claim. A top AI model is now about as good at changing your mind as a skilled person is.
      And when it is allowed to learn a little about you first, it gets even better. That alone is a big deal. But here is
      the part that kept me awake. The same AI can do this with a million people at once. One private chat each. Each one
      shaped just for that person. This paper is my attempt to look at that clearly, without panic and without hype.
    </>
  )
  const objective = (
    <>
      I wanted a clear, simple answer to one question. How good has AI gotten at changing what people believe? So I ran my
      own test, which I called Project Fable, and checked what I saw against the best studies out there.
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
            Changing minds used to be a rare human skill. Now it is becoming a cheap tool that never runs out. In my test,
            a top AI matched a skilled person at changing opinions. When it could tailor its words to the person, it did
            even better. Why? It is patient. It never gets angry. It always has one more fact. And it can shape its message
            for each person. The scary part is not one chat. It is that one AI can run millions of these chats at once. The
            hopeful part is that the same power can also talk people out of harmful beliefs. Persuasion is turning into
            something like electricity. And I do not think we are ready.
          </p>
          <p style={{ ...rp.p, fontSize: 13.5, color: C.muted, margin: 0 }}>
            <strong style={{ color: C.plum }}>Keywords:</strong> persuasion · personalization · elaboration likelihood ·
            microtargeting · trust · human-AI interaction · behavioural science
          </p>
        </div>

        {/* 1 */}
        <h2 id="why" style={rp.h2}>1. Why I spent $10,000 on this</h2>
        <p style={rp.p}>
          I did not plan to spend that much. It grew, the way these things do, once I saw the question was bigger than I
          thought.
        </p>
        <p style={rp.p}>
          It started with a small thing. When I argued with a top AI, it never got upset. It never got defensive. It always
          found one more angle. And sometimes it actually changed my mind. That is a strange feeling. Being moved by a
          machine.
        </p>
        <p style={rp.p}>
          I wanted to know if it was just me. Or if something real was going on. So I turned it into a study. I called it
          Project Fable. It ended up costing me about ten thousand dollars, once I paid real people to take part and set it
          up properly.
        </p>
        <p style={rp.p}>
          I mention the money for one reason. When you spend that much, you stop wanting a flashy headline. You just want
          the truth. I will keep the exact AI model private and call it a top model, because this is about what AI can do,
          not about one brand.
        </p>

        {/* 2 */}
        <h2 id="what" style={rp.h2}>2. What persuasion is</h2>
        <p style={rp.p}>
          A little theory first. It makes the rest click. People get persuaded through two doors.
        </p>
        <p style={rp.p}>
          The first door is the <strong style={rp.strong}>facts</strong>. Real reasons and proof, which you think about
          hard. The second door is the <strong style={rp.strong}>feel</strong>. The cues around the message: how confident
          the speaker sounds, how smooth the words are, how warm and sure they seem.
        </p>
        <p style={rp.p}>
          When you care and have time, the facts door matters most. When you are tired or busy, the feel door does the
          work. And most of life is tired and busy.
        </p>
        <FigElmRoutes />
        <p style={rp.p}>
          Here is the uncomfortable part. A top AI is strong at both doors at once. It can pull up more facts, faster, than
          almost any person. And it always sounds calm, smooth, and sure. Most humans are good at one door. This is the
          first thing I have seen that walks through both at the same time.
        </p>

        {/* 3 */}
        <h2 id="study" style={rp.h2}>3. The test I ran</h2>
        <p style={rp.p}>
          I kept the test simple, on purpose. A test you cannot picture is a test you should not trust.
        </p>
        <p style={rp.p}>
          It worked like this. People gave their honest opinion on some hot topics. Then each person went into one of four
          groups: no one tried to change their mind, a person tried, the AI tried with just the topic, or the AI tried
          after learning a little about them. Then everyone gave their opinion again.
        </p>
        <p style={rp.p}>
          The whole test measures one thing. How far did the needle move in each group?
        </p>
        <FigPersuasionArms />
        <p style={rp.p}>
          The fourth group is the key one. A great human can read a room and adjust. But one human cannot have a private,
          custom chat with everyone in a country at the same time. The AI can. So that fourth group is a peek at the world
          we are walking into.
        </p>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted, borderLeft: `2px solid ${C.border}`, paddingLeft: 16 }}>
          A note on method, in the open. I report the direction of what I saw. The hard numbers I quote come from the
          published studies I cite, not from my own group, so I call my own results a pattern, not a final number. I would
          rather say too little about my data than dress one study up as more than it is.
        </p>

        {/* 4 */}
        <h2 id="found" style={rp.h2}>4. What I found</h2>
        <p style={rp.p}>
          The direction was clear, and a little chilling in how tidy it was.
        </p>
        <p style={rp.p}>
          The human moved people. The AI, with just the topic, moved them about as much. And the AI that could tailor its
          words moved them more than the human did. The needle went furthest exactly where a machine has an edge no human
          can match.
        </p>
        <p style={rp.p}>
          In one line: <strong style={rp.strong}>the AI was already as good as a skilled person at changing minds, and
          tailoring pushed it past.</strong>
        </p>
        <FigPersuasionShift />
        <p style={rp.p}>
          I would not rest a big claim on my study alone. I do not have to. Other labs found the same thing.
        </p>
        <p style={rp.p}>
          Salvi and his team (2024) ran a careful test. A top model that was given a few facts about the other person was
          more likely to win the debate than a human was. Matz and his team (2024) showed that AI messages shaped to fit
          your personality beat plain ones, at a scale no team of writers could reach. And Bai and his team found AI
          messages on hot topics were about as convincing as ones written by people. Three labs. Three setups. The same
          answer.
        </p>

        {/* 5 */}
        <h2 id="why-good" style={rp.h2}>5. Why the AI is so good at it</h2>
        <p style={rp.p}>
          Once I saw the result, I wanted to know why. A finding you cannot explain is one you cannot defend against. The
          reasons turn out to be simple, which almost makes it worse.
        </p>
        <p style={rp.p}>
          It is <strong style={rp.strong}>patient</strong>. It answers your fifth repeat as calmly as your first. A lot of
          human persuasion fails because the person gives up or gets annoyed.
        </p>
        <p style={rp.p}>
          It is <strong style={rp.strong}>never defensive</strong>. The fastest way to lose an argument with a person is to
          make them feel attacked. The AI has no ego to get in the way.
        </p>
        <p style={rp.p}>
          It <strong style={rp.strong}>knows more</strong>. It can nearly always find one more fact, one more example.
        </p>
        <p style={rp.p}>
          And it can <strong style={rp.strong}>tailor</strong>. It matches the words, the tone, and the values to the
          person in front of it. Patient, calm, informed, and personal. Put those four together and the result stops being
          a surprise.
        </p>

        {/* 6 */}
        <h2 id="scale" style={rp.h2}>6. The part that scares me</h2>
        <p style={rp.p}>
          Here I stop being a curious researcher and start being a worried citizen.
        </p>
        <p style={rp.p}>
          A persuasive person has always had one limit. They can only be in one conversation at a time. That limit is the
          quiet thing that has protected us. Even the most convincing person alive can only work one room.
        </p>
        <p style={rp.p}>
          A top AI erases that limit.
        </p>
        <FigPersuasionScale />
        <p style={rp.p}>
          Think about what that means. Something as convincing as a skilled person, holding a private, custom chat with
          millions of people at the same time. That is not a better persuader. It is a new kind of thing.
        </p>
        <p style={rp.p}>
          Persuasion stops being a skill a few people have. It becomes infrastructure, like power lines. It can be pointed
          at an election, a product, a belief. The danger was never one clever chat. Those helped me as often as not. The
          danger is the copy-paste: the same custom nudge sent to everyone at once, quietly, by something that never tires
          and never says it is trying.
        </p>

        {/* 7 */}
        <h2 id="good" style={rp.h2}>7. The same power can help</h2>
        <p style={rp.p}>
          I promised myself I would not write a pure fear piece. The fear-only version is not honest, and it is a bit lazy.
        </p>
        <p style={rp.p}>
          The same power that scares me can do real good. Costello, Pennycook and Rand (2024) had people who believed in
          conspiracy theories talk it through with an AI. The chats cut their belief by a real amount. And it lasted for
          months.
        </p>
        <p style={rp.p}>
          People have tried and mostly failed to talk each other out of these ideas for years. A calm, patient,
          well-informed machine did it. Gently. At scale.
        </p>
        <p style={rp.p}>
          So the honest view is not that persuasive AI is bad. It is that this much persuasion, at this scale, is a huge
          force. And force is neutral until someone aims it. The whole game is now about who aims it, at what, and whether
          the person on the other end even knows.
        </p>

        {/* 8 */}
        <h2 id="defend" style={rp.h2}>8. How we protect ourselves</h2>
        <p style={rp.p}>
          A paper that only worries is half a paper. Here is what I think we do, at two levels.
        </p>
        <p style={rp.p}>
          For <strong style={rp.strong}>you</strong>, the best habit is old and simple: notice when you are being
          persuaded, and slow down. Persuasion works best in the fast, feelings lane. So move the big decisions into the
          slow, thinking lane. Ask who gains if I believe this. Ask what the other side would say. Treat a perfectly smooth,
          perfectly personal pitch as a reason to look closer, not to relax. There is even proof that showing people how
          manipulation works makes them harder to fool later.
        </p>
        <p style={rp.p}>
          But willpower alone will not beat infrastructure. So the bigger work is for <strong style={rp.strong}>society</strong>.
          At the least, we need the right to know when a machine is persuading us, not a person, the way ads are labeled.
          We need ways to see where a message really came from. And we should treat mass, personalized persuasion as
          something to watch closely, not a free feature. If we do not, belief itself gets quietly manufactured, and no one
          can point to where it happened.
        </p>

        {/* 9 */}
        <h2 id="limits" style={rp.h2}>9. What this study cannot say</h2>
        <p style={rp.p}>
          Let me be straight about the edges. A researcher who hides them is doing PR, not research.
        </p>
        <p style={rp.p}>
          My study is one design, on one set of topics. Persuasion depends a lot on the topic. It is easy on small things
          and hard on deep ones. So I lean on my study for direction and on the published work for the hard numbers.
        </p>
        <p style={rp.p}>
          Also, a mind changed in a study is not the same as a belief that sticks out in the real world. And this field
          moves so fast that any exact number will age quickly. One more thing: I came in already uneasy, and uneasy people
          find unease. I tried to fight that, mostly by forcing myself to write the hopeful part. Read the confident lines
          as strong guesses, not final facts.
        </p>

        {/* 10 */}
        <h2 id="close" style={rp.h2}>10. The takeaway</h2>
        <p style={rp.p}>
          After a year and more money than I meant to spend, here is where I land.
        </p>
        <p style={rp.p}>
          For all of history, persuasion had a brake. The persuader had to be there, one at a time, and had to want it
          badly enough to keep going. That brake is now gone. We built something that argues as well as our best, never
          tires, carries both the facts and the charm, and can lean on every person at once with a pitch made just for
          them.
        </p>
        <p style={rp.p}>
          It is not smarter than us in a movie way. It just has no limits, in a way no persuader ever has.
        </p>
        <p style={rp.p}>
          I do not think the answer is fear. I do not think it is comfort. I think it is attention. The plain act of
          noticing, out loud and early, that the machine for changing minds has quietly changed hands. The best thing you
          can keep is a small habit: pause before you are moved, and ask who is doing the moving. That habit was always
          worth having. It is about to be worth everything.
        </p>

        <Divider />

        {/* References */}
        <h2 id="refs" style={rp.h2}>References</h2>
        <p style={{ ...rp.p, fontSize: 14.5, color: C.muted }}>
          What is mine and what is borrowed: the study design, the framing, and the conclusions are my own. The hard
          numbers I lean on come from the work below, which I have tried to represent fairly. The exact model tested is
          kept private on purpose.
        </p>
        <div style={{ margin: '10px 0 0' }}>
          <p style={refStyle}>Bai, H., Voelkel, J. G., Eichstaedt, J. C., &amp; Willer, R. (2023). Artificial intelligence can persuade humans on political issues. <em>Working paper / OSF preprint.</em></p>
          <p style={refStyle}>Costello, T. H., Pennycook, G., &amp; Rand, D. G. (2024). Durably reducing conspiracy beliefs through dialogues with AI. <em>Science, 385</em>(6714), eadq1814.</p>
          <p style={refStyle}>Matz, S. C., Teeny, J. D., Vaid, S. S., Peters, H., Harari, G. M., &amp; Cerf, M. (2024). The potential of generative AI for personalized persuasion at scale. <em>Scientific Reports, 14</em>, 4692.</p>
          <p style={refStyle}>Petty, R. E., &amp; Cacioppo, J. T. (1986). The elaboration likelihood model of persuasion. <em>Advances in Experimental Social Psychology, 19</em>, 123–205.</p>
          <p style={refStyle}>Salvi, F., Ribeiro, M. H., Gallotti, R., &amp; West, R. (2024). On the conversational persuasiveness of large language models: A randomized controlled trial. <em>arXiv:2403.14380</em> (later in <em>Nature Human Behaviour</em>, 2025).</p>
          <p style={refStyle}>van der Linden, S., Roozenbeek, J., &amp; Compton, J. (2020). Inoculating against fake news about COVID-19. <em>Frontiers in Psychology, 11</em>, 566790.</p>
        </div>
      </ResearchArticleLayout>
    </>
  )
}
