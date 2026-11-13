'use client'

/* All 13 real case studies, as a compact card grid that opens into a full
   detail panel — the same "collapsed card → full story" idea as /results,
   rebuilt in this page's own dark/purple tokens instead of its cream/gold
   ones. No new facts: every figure, quote and image is Study data that
   already exists in lib/case-studies.ts. */
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CASE_STUDIES, type Study } from '@/lib/case-studies'

function Initials({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return <span className="cs-poster" aria-hidden>{initials}</span>
}

function CaseCard({ study, onOpen }: { study: Study; onOpen: () => void }) {
  return (
    <button type="button" className="cs-card" onClick={onOpen}>
      <div className="cs-card__media">
        {study.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={study.image} alt={study.name} loading="lazy" />
        ) : (
          <Initials name={study.name} />
        )}
        <span className="cs-card__tag">{study.category}</span>
      </div>
      <div className="cs-card__body">
        <div className="cs-card__figure"><b>{study.headline.v}</b><span>{study.headline.period}</span></div>
        <div className="cs-card__name">{study.name}</div>
        <div className="cs-card__niche">{study.niche}</div>
        <span className="cs-card__link">View case study</span>
      </div>
    </button>
  )
}

function CaseModal({ study, onClose }: { study: Study; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [onClose])

  return (
    <motion.div
      className="cs-modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="cs-modal glass-panel"
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={`${study.name} case study`}
      >
        <button type="button" className="cs-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="cs-modal__head">
          <div className="cs-modal__media">
            {study.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={study.image} alt={study.name} />
            ) : (
              <Initials name={study.name} />
            )}
          </div>
          <div>
            <span className="cs-card__tag cs-card__tag--static">{study.category}</span>
            <h3>{study.name}</h3>
            <p className="cs-modal__niche">{study.niche}{study.location ? `, ${study.location}` : ''}</p>
          </div>
        </div>
        <div className="cs-modal__metric"><b>{study.headline.v}</b><span>{study.headline.period}</span></div>
        {study.videoUrl && (
          <div className="cs-modal__video">
            <iframe src={study.videoUrl} title={`${study.name} — video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )}
        <p className="cs-modal__tagline">{study.tagline}</p>
        <p className="cs-modal__p">{study.background}</p>
        <p className="cs-modal__p">{study.challenge}</p>
        <p className="cs-modal__p">{study.whatWeDid}</p>
        {study.metrics && (
          <div className="cs-modal__metrics">
            {study.metrics.map((m) => (
              <div key={m.l}><b>{m.v}</b><span>{m.l}</span></div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function CaseStudies() {
  const [active, setActive] = useState<Study | null>(null)
  return (
    <>
      <div className="cs-grid">
        {CASE_STUDIES.map((s) => <CaseCard key={s.slug} study={s} onOpen={() => setActive(s)} />)}
      </div>
      <AnimatePresence>
        {active && <CaseModal key={active.slug} study={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  )
}
