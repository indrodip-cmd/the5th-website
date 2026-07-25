import type { Metadata } from 'next'
import PageShell, { prose } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Code of Ethics | The5th Consulting',
  description: 'The principles we hold ourselves to: honesty, respect for your autonomy, and no manipulation, false urgency, or exaggerated promises.',
  alternates: { canonical: '/ethics' },
}

export default function CodeOfEthicsPage() {
  return (
    <PageShell
      eyebrow="Our Promise To You"
      title="Code of Ethics"
      intro="We help professionals over 40 turn their expertise into income. How we do that matters as much as the result. These are the standards we hold ourselves, our team, and our AI to, without exception."
    >
      <p style={prose.p}>
        Confidence converts; pressure destroys trust. Everything below flows from that belief. If you ever feel
        we&apos;ve fallen short of it, tell us at <a href="mailto:support@10kroadmap.org" style={{ color: '#B0902F' }}>support@10kroadmap.org</a> or
        through our <a href="/support" style={{ color: '#B0902F' }}>Help &amp; Support</a> page.
      </p>

      <h2 style={prose.h2}>1. Honesty over hype</h2>
      <p style={prose.p}>
        We do not use exaggerated outcomes, invented testimonials, or numbers we can&apos;t stand behind. We never
        guarantee income or results, because no honest business can. What we promise is a clear method, real tools,
        and a team that tells you the truth, even when it isn&apos;t what you hoped to hear.
      </p>

      <h2 style={prose.h2}>2. No manipulation or false urgency</h2>
      <p style={prose.p}>
        We don&apos;t manufacture fake deadlines, fake scarcity, or countdown-timer pressure to push a decision. When a
        deadline or limit is real, we say so plainly. When it isn&apos;t, we don&apos;t invent one. You should never feel
        rushed, cornered, or tricked into a purchase.
      </p>

      <h2 style={prose.h2}>3. Respect for your autonomy</h2>
      <p style={prose.p}>
        Our job is to help you become confident enough to decide for yourself, not to &quot;close&quot; you. You are free to
        say no, to take your time, to leave, and to change your mind. We will respect that every time.
      </p>

      <h2 style={prose.h2}>4. No shaming, no exploiting fear</h2>
      <p style={prose.p}>
        We will never shame you for where you are, your age, your income, or your past decisions, and we will never
        weaponise fear or insecurity to make a sale. We meet you with respect.
      </p>

      <h2 style={prose.h2}>5. Honest AI</h2>
      <p style={prose.p}>
        Our AI concierge follows the same rules our people do. It will not invent policies, prices, features, or
        results. If it doesn&apos;t know something, it will say so and connect you with a human. It treats your messages
        as private and never shares one visitor&apos;s information with another.
      </p>

      <h2 style={prose.h2}>6. We protect your data</h2>
      <p style={prose.p}>
        We collect only what we need, we tell you how we use it, and we never sell it. For the full picture, see our{' '}
        <a href="/data-usage" style={{ color: '#B0902F' }}>Data Usage</a> and{' '}
        <a href="/privacy" style={{ color: '#B0902F' }}>Privacy Policy</a> pages.
      </p>

      <h2 style={prose.h2}>7. We answer for our mistakes</h2>
      <p style={prose.p}>
        We&apos;re human and we get things wrong. When we do, we own it, fix it, and make it right. If something feels
        off, report it and a real person will look into it.
      </p>

      <div style={{ ...prose.card, marginTop: 30, background: 'rgba(201,168,76,0.06)', borderColor: 'rgba(201,168,76,0.32)' }}>
        <p style={{ ...prose.p, margin: 0 }}>
          Holding us accountable is part of the deal. If any interaction, human or AI, ever breaks one of these
          principles, please <a href="/support" style={{ color: '#B0902F', fontWeight: 700 }}>let us know</a>. We take it seriously.
        </p>
      </div>
    </PageShell>
  )
}
