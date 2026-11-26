'use client'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { decode, score } from '@/lib/quiz/engine'
import ReportView from '../ReportView'

/* Rebuilds the report from the PII-free code in the link we email. */
export default function ReportLoader() {
  const sp = useSearchParams()
  const code = sp.get('r') || ''
  const name = (sp.get('n') || '').slice(0, 40)
  const r = useMemo(() => { const a = decode(code); return a ? score(a) : null }, [code])

  return (
    <div className="qz">
      <div className="qz-bg" aria-hidden="true"><i className="o1" /><i className="o2" /><i className="o3" /></div>
      <header className="qz-head">
        <a href="/" className="qz-logo" aria-label="The5th Global Consulting"><img src="/images/logo-header-white.png" alt="The5th Global Consulting" width={150} height={46} /></a>
        <span className="qz-free">Your free report</span>
      </header>
      <main className="qz-main">
        {r ? (
          <ReportView r={r} name={name} auditHref={`/audit-checkout?src=quiz&p=${r.primary}&s=${r.secondary}&c=${r.code}`} />
        ) : (
          <section className="qz-intro" style={{ textAlign: 'center', display: 'block' }}>
            <h1>That link looks incomplete.</h1>
            <p className="qz-sub">Take the free 3-minute quiz and your personal Income Blocker Report appears instantly.</p>
            <a href="/quiz" className="qz-btn qz-btn--gold qz-btn--xl" style={{ marginTop: 24 }}>Take the free quiz <i>→</i></a>
          </section>
        )}
      </main>
    </div>
  )
}
