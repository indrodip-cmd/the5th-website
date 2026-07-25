import type { Metadata } from 'next'
import PageShell, { prose } from '@/components/PageShell'
import TicketForm from '@/components/TicketForm'

export const metadata: Metadata = {
  title: 'Help & Support | The5th Consulting',
  description: 'Get help, find answers to common questions, or report a bug. Open a support ticket and a real person will get back to you.',
  alternates: { canonical: '/help' },
}

const C = { plumDark: '#2E1A35', gold: '#B0902F', inkSoft: '#4a4038', muted: '#8A8075', border: '#E2DCD2', white: '#fff' }

const QUICK: { title: string; body: string; href: string; cta: string }[] = [
  { title: 'Not sure if we can help?', body: 'Take the free 2-minute business quiz and get a personalised read on your next move.', href: '/quiz', cta: 'Take the quiz →' },
  { title: 'Want to talk to someone?', body: 'Book a free strategy call with our team, no pitch, just a real conversation.', href: '/call', cta: 'Book a call →' },
  { title: 'Prefer email?', body: 'Reach our team directly and we’ll get back to you as soon as we can.', href: 'mailto:support@10kroadmap.org', cta: 'Email support →' },
]

const FAQ: { q: string; a: string }[] = [
  { q: 'How quickly will I hear back?', a: 'We answer tickets and emails within one to two business days, usually sooner. Every ticket gets a reference number so nothing gets lost.' },
  { q: 'I found a bug. What should I include?', a: 'Tell us what you were doing, what you expected to happen, and what actually happened. If you can, include the page you were on and your device or browser. The ticket form captures the page automatically.' },
  { q: 'Can I get a refund?', a: 'Yes, within the terms of our Refund Policy. Open a billing ticket below or email us and we’ll sort it out.' },
  { q: 'How is my data handled?', a: 'We collect only what we need and never sell it. See our Data Usage summary and Privacy Policy for the full picture.' },
  { q: 'Is the AI concierge a real person?', a: 'Carolina is our AI concierge. She can answer questions, guide you around the site, and file a support ticket for you. Anything she can’t resolve goes to a human on our team.' },
]

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Help & Support"
      title="How can we help?"
      intro="Find a quick answer below, or open a ticket and a real person from our team will get back to you. There are no bad questions here."
      wide
    >
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 44 }}>
        {QUICK.map(q => (
          <a key={q.title} href={q.href} style={{ ...prose.card, margin: 0, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: C.plumDark, marginBottom: 8 }}>{q.title}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 12px' }}>{q.body}</p>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{q.cta}</span>
          </a>
        ))}
      </div>

      {/* Ticket form */}
      <div id="ticket" style={{ scrollMarginTop: 90, marginBottom: 52 }}>
        <h2 style={{ ...prose.h2, marginTop: 0 }}>Report a bug or open a ticket</h2>
        <p style={{ ...prose.p, marginBottom: 22 }}>
          Something not working, a question, or feedback? Send it over. You&apos;ll get a reference number, and if you
          leave your email, we&apos;ll reply there.
        </p>
        <TicketForm />
      </div>

      {/* FAQ */}
      <h2 style={{ ...prose.h2, marginTop: 0 }}>Common questions</h2>
      <div>
        {FAQ.map(f => (
          <details key={f.q} style={{ borderBottom: `1px solid ${C.border}`, padding: '18px 0' }}>
            <summary style={{ cursor: 'pointer', fontSize: 17, fontWeight: 700, color: C.plumDark, listStyle: 'none' }}>
              {f.q}
            </summary>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: C.inkSoft, margin: '12px 0 0' }}>{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  )
}
