import type { Metadata } from 'next'
import PageShell, { prose } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Data Usage | The5th Consulting',
  description: 'A plain-English summary of what data we collect, why we use it, who we share it with, and the choices and controls you have.',
  alternates: { canonical: '/data-usage' },
}

export default function DataUsagePage() {
  return (
    <PageShell
      eyebrow="Transparency"
      title="Data Usage"
      intro="A plain-English summary of what we collect, why, and the control you have. This sits alongside our full Privacy Policy, if the two ever seem to differ, the Privacy Policy is the legal source of truth."
    >
      <h2 style={prose.h2}>What we collect</h2>
      <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        <li style={prose.li}><strong>What you give us:</strong> your name and email when you take the quiz, book a call, chat with our concierge, or file a support ticket, plus anything you type into those forms.</li>
        <li style={prose.li}><strong>How you use the site:</strong> pages visited, clicks, and general device/browser info, gathered through analytics tools (Google Analytics, Microsoft Clarity, Contentsquare) and our own first-party tracking.</li>
        <li style={prose.li}><strong>Cookies:</strong> small identifiers that remember you between visits and measure what&apos;s working. You control these through our cookie banner.</li>
      </ul>

      <h2 style={prose.h2}>Why we use it</h2>
      <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        <li style={prose.li}>To deliver what you asked for, your quiz results, roadmap, a booked call, or an answer to a question.</li>
        <li style={prose.li}>To reply to your messages and support tickets, and follow up if you asked us to.</li>
        <li style={prose.li}>To understand what&apos;s helpful and improve the site and our service.</li>
        <li style={prose.li}>To keep the site secure and prevent abuse (for example, rate-limiting and bot protection).</li>
      </ul>

      <h2 style={prose.h2}>Who we share it with</h2>
      <p style={prose.p}>
        We <strong>never sell your personal data.</strong> We share it only with the trusted service providers that
        run our business, for example email delivery, scheduling, analytics, payment processing, and the AI provider
        that powers our concierge, and only so they can perform that service for us. We may also disclose data if the
        law requires it.
      </p>

      <h2 style={prose.h2}>Our AI concierge</h2>
      <p style={prose.p}>
        When you chat with our AI concierge, your messages are processed to answer you and may be stored to improve
        our service and keep a record of your request. The AI is bound by our{' '}
        <a href="/code-of-ethics" style={{ color: '#B0902F' }}>Code of Ethics</a>: it won&apos;t share one visitor&apos;s
        information with another, and it won&apos;t invent details about you.
      </p>

      <h2 style={prose.h2}>How long we keep it</h2>
      <p style={prose.p}>
        We keep your data for as long as we need it to serve you and meet our legal obligations, then delete or
        anonymise it. You can ask us to remove your data at any time.
      </p>

      <h2 style={prose.h2}>Your choices &amp; controls</h2>
      <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        <li style={prose.li}>Manage cookies anytime through the banner or your browser settings.</li>
        <li style={prose.li}>Ask for a copy of your data, or ask us to correct or delete it.</li>
        <li style={prose.li}>Unsubscribe from emails using the link in any message.</li>
        <li style={prose.li}>California residents have additional rights, see <a href="/california" style={{ color: '#B0902F' }}>California Privacy Rights</a>.</li>
      </ul>

      <div style={{ ...prose.card, marginTop: 30 }}>
        <p style={{ ...prose.p, margin: 0 }}>
          Questions about your data, or want to make a request? Email{' '}
          <a href="mailto:support@10kroadmap.org" style={{ color: '#B0902F', fontWeight: 700 }}>support@10kroadmap.org</a>{' '}
          or open a ticket on our <a href="/help" style={{ color: '#B0902F', fontWeight: 700 }}>Help &amp; Support</a> page. For the
          complete legal detail, read our <a href="/privacy" style={{ color: '#B0902F', fontWeight: 700 }}>Privacy Policy</a>.
        </p>
      </div>
    </PageShell>
  )
}
