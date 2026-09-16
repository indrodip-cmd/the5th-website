import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import { POSTS } from './posts'
import NewsletterForm from './NewsletterForm'

export const metadata: Metadata = {
  title: 'Research | The5th Consulting',
  description:
    'Long-form research from The5th Consulting on artificial intelligence, consumer behavior, neuroscience, and the science of machine minds. In-depth, first-principles writing for the curious and the technical alike.',
  alternates: { canonical: '/research' },
  openGraph: {
    type: 'website',
    url: 'https://the5th.consulting/research',
    title: 'Research | The5th Consulting',
    description:
      'In-depth research on artificial intelligence, neuroscience, and the science of machine minds — written for the curious layperson and the working researcher.',
  },
}

const C = {
  cream: '#FAF6F0', plum: '#3D2645', plumDark: '#2E1A35', gold: '#C9A84C', goldDeep: '#B0902F',
  ink: '#1A1A2E', inkSoft: '#4a4038', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

export default function ResearchIndex() {
  return (
    <PageShell
      eyebrow="Research"
      title="Research"
      intro="Long-form, first-principles writing on artificial intelligence, neuroscience, and consumer behavior. We go deep — the kind of piece you can read as a curious beginner or mine as a working researcher."
      wide
    >
      {/* Article list */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, margin: '4px 0 18px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: C.plumDark, margin: 0 }}>Latest</h2>
        <span style={{ fontSize: 13.5, color: C.muted }}>{POSTS.length} {POSTS.length === 1 ? 'article' : 'articles'}</span>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {POSTS.map((p) => (
          <a
            key={p.slug}
            href={`/research/${p.slug}`}
            className="rsch-card"
            style={{
              display: 'block', textDecoration: 'none', color: 'inherit',
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 18,
              padding: 'clamp(22px, 4vw, 32px)',
              boxShadow: '0 18px 44px -34px rgba(46,26,53,.5)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {p.tags.map((t) => (
                <span key={t} style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.goldDeep, background: 'rgba(201,168,76,.12)', border: `1px solid rgba(201,168,76,.32)`, borderRadius: 999, padding: '5px 12px' }}>{t}</span>
              ))}
            </div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 3.4vw, 30px)', lineHeight: 1.12, color: C.plumDark, margin: '0 0 12px', letterSpacing: '-.015em' }}>{p.title}</h3>
            <p style={{ fontSize: 16.5, lineHeight: 1.66, color: C.inkSoft, margin: '0 0 18px' }}>{p.excerpt}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', fontSize: 13.5, color: C.muted }}>
              <span style={{ fontWeight: 700, color: C.plum }}>{p.author}</span>
              <span aria-hidden>·</span>
              <span>{p.authorRole}</span>
              <span aria-hidden>·</span>
              <time dateTime={p.date}>{p.dateLabel}</time>
              <span aria-hidden>·</span>
              <span>{p.readTime}</span>
              <span className="rsch-read" style={{ marginLeft: 'auto', color: C.goldDeep, fontWeight: 700 }}>Read →</span>
            </div>
          </a>
        ))}
      </div>

      {/* Newsletter */}
      <section style={{
        marginTop: 40, background: `radial-gradient(120% 120% at 85% 0%, #3D2645 0%, ${C.plumDark} 55%, #231029 100%)`,
        borderRadius: 22, padding: 'clamp(28px, 5vw, 44px)', position: 'relative', overflow: 'hidden',
        boxShadow: '0 30px 70px -44px rgba(46,26,53,.7)',
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'clamp(24px, 4vw, 44px)', alignItems: 'center' }} className="nl-grid">
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>The Research Newsletter</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 3.6vw, 34px)', lineHeight: 1.12, color: '#fff', margin: '0 0 12px', letterSpacing: '-.015em' }}>
              Ideas at the edge of AI, mind, and behavior — in your inbox.
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'rgba(255,255,255,.78)', margin: 0 }}>
              We publish rarely and go deep. Join researchers, founders, and the plain curious who get each new piece the day it drops.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: 'clamp(20px, 3vw, 26px)' }}>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <style>{`
        .rsch-card{transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease}
        .rsch-card:hover{transform:translateY(-4px);box-shadow:0 30px 64px -34px rgba(46,26,53,.55);border-color:rgba(201,168,76,.5)}
        .rsch-card:hover .rsch-read{text-decoration:underline}
        @media(max-width:720px){.nl-grid{grid-template-columns:1fr!important}}
      `}</style>
    </PageShell>
  )
}
