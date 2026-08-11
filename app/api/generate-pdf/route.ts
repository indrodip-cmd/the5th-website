import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { limit, clientIp } from '@/lib/rateLimit'
import { CASE_STUDIES, type Study } from '@/lib/case-studies'
import { emitEvent } from '@/lib/events'
import { logActivity } from '@/lib/crm'

export const dynamic = 'force-dynamic'

const SITE = 'https://the5th.consulting'
const BOOKING_URL = 'https://cal.com/indrodip-ghosh-ut1vxh/60min'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

/* ─────────────────────────  BRAND SYSTEM  ───────────────────────── */
const P = {
  plum: '#2E1A35', plum2: '#3D2645', plumDeep: '#231029',
  gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#9c7d28',
  green: '#1C4A32', cream: '#FAF6F0', paper: '#FFFFFF',
  ink: '#1A1A2E', sub: '#5a5550', muted: '#9a9088', line: '#E7E1D6',
}

const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ─────────────────────────  DATA PARSING  ───────────────────────── */
const parseSections = (md: string): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const part of (md || '').split(/^##\s+/m)) {
    const nl = part.indexOf('\n')
    if (nl === -1) continue
    const header = part.slice(0, nl).trim().toUpperCase()
    const body = part.slice(nl + 1).trim()
    if (header && body) out[header] = body
  }
  return out
}

type Cat = { key: string; label: string; effort: number }
/* The eight scored dimensions (from the report's ## SCORES block), with an
   effort heuristic used only to place them on the priority matrix. */
const CATS: Cat[] = [
  { key: 'offer', label: 'Offer', effort: 50 },
  { key: 'positioning', label: 'Positioning', effort: 38 },
  { key: 'pricing', label: 'Pricing', effort: 30 },
  { key: 'sales', label: 'Sales', effort: 58 },
  { key: 'content', label: 'Content', effort: 48 },
  { key: 'marketing', label: 'Marketing', effort: 66 },
  { key: 'automation', label: 'Systems', effort: 74 },
  { key: 'confidence', label: 'Confidence', effort: 44 },
]

type Score = { key: string; label: string; val: number; effort: number }
const parseScores = (scoresText: string): Score[] => {
  const ai: Record<string, number> = {}
  for (const line of (scoresText || '').split('\n')) {
    const m = line.match(/^\s*\**([A-Za-z][A-Za-z ]*?)\**\s*:\s*(\d{1,3})/)
    if (m) ai[m[1].trim().toLowerCase()] = Math.max(0, Math.min(100, parseInt(m[2], 10)))
  }
  return CATS.map(c => ({ ...c, val: ai[c.key] ?? ai[c.label.toLowerCase()] ?? 55 }))
}

const bandFor = (v: number): { label: string; priority: string; color: string } => {
  if (v >= 78) return { label: 'Strong', priority: 'Low', color: P.green }
  if (v >= 60) return { label: 'Solid', priority: 'Medium', color: '#3f7a55' }
  if (v >= 42) return { label: 'Developing', priority: 'High', color: P.goldDeep }
  return { label: 'Needs work', priority: 'Critical', color: '#a4442f' }
}

/* Pick the single most contextually-relevant real case study for the reader's
   biggest constraint. Never fabricates — only selects from approved content. */
const pickStudy = (constraintLabel: string): Study | null => {
  const map: Record<string, string[]> = {
    Offer: ['offer', 'signature offer', 'packaging', 'program'],
    Positioning: ['positioning', 'messaging', 'brand', 'niche'],
    Pricing: ['pricing', 'premium', 'price', 'high-ticket'],
    Sales: ['sales', 'conversion', 'consult', 'closing'],
    Content: ['content', 'audience', 'visibility'],
    Marketing: ['lead generation', 'funnel', 'launch', 'leads', 'marketing'],
    Systems: ['funnel', 'system', 'automation', 'launch'],
    Confidence: ['confidence', 'authority', 'positioning'],
  }
  const keys = map[constraintLabel] || ['lead generation', 'funnel']
  let best: { s: Study; hits: number } | null = null
  for (const s of CASE_STUDIES) {
    const hay = (s.tags.join(' ') + ' ' + s.category + ' ' + s.niche + ' ' + s.tagline).toLowerCase()
    const hits = keys.reduce((n, k) => n + (hay.includes(k) ? 1 : 0), 0)
    if (hits > 0 && (!best || hits > best.hits)) best = { s, hits }
  }
  return best?.s || CASE_STUDIES[0] || null
}

/* Editorial markdown → HTML (paragraphs + refined bullets). */
const richBody = (text: string, opts: { light?: boolean } = {}): string => {
  const c = opts.light ? 'rgba(255,255,255,.82)' : P.sub
  const head = opts.light ? '#fff' : P.ink
  const acc = opts.light ? P.goldSoft : P.goldDeep
  let html = '', inList = false
  for (const raw of (text || '').split('\n')) {
    const t = raw.trim()
    if (!t) { if (inList) { html += '</ul>'; inList = false } continue }
    const isBullet = /^[-•*]\s+/.test(t)
    const isSub = /^(DAY|WEEK)\s/i.test(t) || (t.length < 62 && /:$/.test(t))
    const clean = esc(t.replace(/^[-•*]\s+/, '').replace(/\*\*/g, ''))
    if (isSub) { if (inList) { html += '</ul>'; inList = false } html += `<p style="font-family:'DM Sans';font-weight:600;color:${head};margin:14px 0 4px;font-size:12.5px;letter-spacing:.01em">${clean}</p>`; continue }
    if (isBullet) { if (!inList) { html += '<ul style="list-style:none;margin:6px 0;padding:0">'; inList = true } html += `<li style="position:relative;padding:4px 0 4px 18px;font-size:11.5px;color:${c};line-height:1.65"><span style="position:absolute;left:0;top:4px;color:${acc};font-weight:700">›</span>${clean}</li>`; continue }
    if (inList) { html += '</ul>'; inList = false }
    html += `<p style="margin:7px 0;font-size:11.8px;color:${c};line-height:1.72">${clean}</p>`
  }
  if (inList) html += '</ul>'
  return html
}
const firstSentence = (t: string): string => {
  const clean = (t || '').replace(/\*\*/g, '').replace(/^[-•*]\s+/gm, '').trim()
  const m = clean.match(/[^.!?]+[.!?]/)
  return (m ? m[0] : clean.slice(0, 180)).trim()
}

/* Parse "Day N: task" lines from the report's NEXT 7 DAYS section. Shared by
   the PDF homework page and (via the report) the daily email sequence. */
export type Homework = { day: number; task: string }
const parseHomework = (text: string): Homework[] => {
  const out: Homework[] = []
  for (const raw of (text || '').split('\n')) {
    const m = raw.trim().replace(/^[-•*]\s+/, '').match(/^Day\s*(\d+)\s*[:\-–]\s*(.+)$/i)
    if (m) out.push({ day: parseInt(m[1], 10), task: m[2].replace(/\*\*/g, '').trim() })
  }
  return out.sort((a, b) => a.day - b.day).slice(0, 7)
}

/* ─────────────────────────  CHARTS (inline SVG)  ───────────────────────── */
const scorecardSVG = (scores: Score[]): string => {
  const rowH = 42, top = 8, w = 620
  const rows = scores.map((s, i) => {
    const y = top + i * rowH
    const bw = Math.max(6, (s.val / 100) * 372)
    const b = bandFor(s.val)
    return `
      <text x="0" y="${y + 15}" font-family="DM Sans" font-size="12" font-weight="500" fill="${P.ink}">${esc(s.label)}</text>
      <rect x="150" y="${y + 5}" width="372" height="12" rx="6" fill="#EFE9DE"/>
      <rect x="150" y="${y + 5}" width="${bw}" height="12" rx="6" fill="url(#g5)"/>
      <text x="536" y="${y + 15}" font-family="Cormorant Garamond" font-size="18" font-weight="600" fill="${P.goldDeep}">${s.val}</text>
      <text x="566" y="${y + 15}" font-family="DM Sans" font-size="9" font-weight="600" letter-spacing="0.5" fill="${b.color}">${esc(b.label.toUpperCase())}</text>`
  }).join('')
  return `<svg viewBox="0 0 ${w} ${top + scores.length * rowH + 6}" width="100%" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g5" x1="0" x2="1"><stop offset="0" stop-color="${P.green}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient></defs>
    ${rows}</svg>`
}

const matrixSVG = (scores: Score[]): string => {
  const S = 360, pad = 46
  const px = (effort: number) => pad + (effort / 100) * (S - pad * 1.4)
  const py = (impact: number) => (S - pad) - (impact / 100) * (S - pad * 1.4)
  const dots = scores.map(s => {
    const impact = 100 - s.val // bigger gap = bigger impact
    const x = px(s.effort), y = py(impact)
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${P.gold}" stroke="${P.plum}" stroke-width="1"/>
      <text x="${(x + 8).toFixed(1)}" y="${(y + 3).toFixed(1)}" font-family="DM Sans" font-size="9" font-weight="600" fill="${P.ink}">${esc(s.label)}</text>`
  }).join('')
  const q = (x: number, y: number, t: string, sub: string) =>
    `<text x="${x}" y="${y}" font-family="DM Sans" font-size="10" font-weight="700" letter-spacing="1" fill="${P.goldDeep}">${t}</text>
     <text x="${x}" y="${y + 13}" font-family="DM Sans" font-size="8" fill="${P.muted}">${sub}</text>`
  return `<svg viewBox="0 0 ${S} ${S}" width="330" xmlns="http://www.w3.org/2000/svg">
    <rect x="${pad}" y="${pad * 0.5}" width="${S - pad * 1.4}" height="${S - pad * 1.5}" fill="#FBF8F2" stroke="${P.line}"/>
    <line x1="${(pad + (S - pad * 1.4) / 2).toFixed(1)}" y1="${pad * 0.5}" x2="${(pad + (S - pad * 1.4) / 2).toFixed(1)}" y2="${S - pad}" stroke="${P.line}" stroke-dasharray="3 3"/>
    <line x1="${pad}" y1="${((pad * 0.5) + (S - pad * 1.5) / 2).toFixed(1)}" x2="${S - pad * 0.4}" y2="${((pad * 0.5) + (S - pad * 1.5) / 2).toFixed(1)}" stroke="${P.line}" stroke-dasharray="3 3"/>
    ${q(pad + 6, pad * 0.5 + 16, 'DO FIRST', 'High impact · Low effort')}
    ${q(pad + (S - pad * 1.4) / 2 + 6, pad * 0.5 + 16, 'PLAN', 'High impact · High effort')}
    ${q(pad + 6, S - pad - 8, 'QUICK WINS', 'Low impact · Low effort')}
    ${q(pad + (S - pad * 1.4) / 2 + 6, S - pad - 8, 'HOLD', 'Low impact · High effort')}
    <text x="${pad}" y="${S - 14}" font-family="DM Sans" font-size="9" fill="${P.muted}">EFFORT →</text>
    <text x="14" y="${pad * 0.5 + 4}" font-family="DM Sans" font-size="9" fill="${P.muted}" transform="rotate(-90 14 ${pad})">IMPACT →</text>
    ${dots}</svg>`
}

/* ─────────────────────────  REPORT ASSEMBLY  ───────────────────────── */
type Meta = { name: string; firstName: string; archetypeLabel: string; personalityLabel: string; goal: string; stage: string; dateStr: string; logo: string }

/* White wordmark for dark pages — width-constrained so a wide logo never
   stretches across the page. Falls back to a text mark if unavailable. */
const logoMark = (m: Meta, w: number) => m.logo
  ? `<img src="${m.logo}" alt="The5th Consulting" style="width:${w}px;height:auto;max-width:100%;display:block"/>`
  : `<div style="font-family:'DM Sans';font-size:${Math.round(w * 0.15)}px;font-weight:800;color:#fff">The<span style="color:${P.gold}">5th</span></div>`

const buildPremiumReport = (roadmap: string, m: Meta): string => {
  const sec = parseSections(roadmap)
  const scores = parseScores(sec['SCORES'] || '')
  const overall = Math.round(scores.reduce((s, x) => s + x.val, 0) / scores.length)
  const sorted = [...scores].sort((a, b) => b.val - a.val)
  const strength = sorted[0], constraint = sorted[sorted.length - 1]
  const lowThree = sorted.slice(-3).reverse()
  const opportunity = firstSentence(sec['YOUR BIGGEST OPPORTUNITY'] || '')
  const primaryRec = firstSentence(sec['YOUR NEXT 7 DAYS'] || sec['YOUR BIGGEST OPPORTUNITY'] || '')
  const study = pickStudy(constraint.label)

  const conf = `Confidential · Prepared exclusively for ${esc(m.name)}`
  const foot = `<div class="foot"><span>The5th Consulting · Business Growth Diagnostic</span><span class="pg"></span></div>`
  const footDark = `<div class="foot dark"><span>The5th Consulting · Business Growth Diagnostic</span><span class="pg"></span></div>`
  const eyebrow = (t: string, light = false) => `<div style="font-family:'DM Sans';font-size:10px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${light ? P.goldSoft : P.goldDeep};margin-bottom:14px">${t}</div>`
  const h2 = (t: string, light = false) => `<h2 style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;line-height:1.08;letter-spacing:-.01em;color:${light ? '#fff' : P.ink};margin:0 0 18px">${t}</h2>`
  const ctaBar = `<a href="${BOOKING_URL}" style="display:block;margin-top:22px;text-decoration:none;background:#FBF8F2;border:1px solid ${P.line};border-left:3px solid ${P.gold};border-radius:8px;padding:14px 18px;font-family:'DM Sans';font-size:11px;color:${P.sub}"><b style="color:${P.ink}">Want help implementing this?</b> Your complimentary strategy session is available. <span style="color:${P.goldDeep};font-weight:700">Book your session →</span></a>`

  const sheets: string[] = []

  /* 01 — COVER */
  sheets.push(`<section class="sheet dark cover">
    ${logoMark(m, 132)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:'DM Sans';font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${P.goldSoft};margin-bottom:22px">Business Growth Diagnostic</div>
      <h1 style="font-family:'Cormorant Garamond',serif;font-weight:500;font-size:56px;line-height:1.02;letter-spacing:-.02em;color:#fff;margin:0">Your Personalized<br/>Business Assessment<br/><span style="font-style:italic;color:${P.gold}">& Strategic Growth Roadmap</span></h1>
      <div style="height:1px;background:rgba(201,168,76,.35);margin:34px 0 26px;max-width:180px"></div>
      <div style="font-family:'DM Sans';font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:6px">Prepared exclusively for</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:#fff">${esc(m.name)}</div>
    </div>
    <div style="display:flex;justify-content:space-between;font-family:'DM Sans';font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.5)">
      <span>The5th Consulting</span><span>${esc(m.dateStr)}</span></div>
  </section>`)

  /* 02 — EXECUTIVE LETTER */
  sheets.push(`<section class="sheet">
    ${eyebrow('A note from The5th Consulting')}
    ${h2(`Your business is not a collection of<br/><span style="font-style:italic;color:${P.goldDeep}">disconnected problems.</span>`)}
    <div style="max-width:560px">
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 14px">Dear ${esc(m.firstName)},</p>
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 14px">Your marketing, positioning, offer, sales process, customer experience, and systems do not operate in isolation. They interact, and the constraint in one quietly caps the return on all the others. Most owners try to fix everything at once. The work is to find the one place that changes the most.</p>
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 14px">This assessment was built to do exactly that: to identify where your business stands today, where the largest opportunities sit, and what you should prioritize next, given your stage and your goal of ${esc(m.goal.toLowerCase())}.</p>
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 22px">Read it the way you would a strategic review. The scorecard tells you where you are. The diagnostic explains why. The priorities tell you what to do first.</p>
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:${P.ink}">Indrodip Ghosh</div>
      <div style="font-family:'DM Sans';font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${P.muted}">Founder · The5th Consulting</div>
    </div>${foot}</section>`)

  /* 03 — TABLE OF CONTENTS */
  const toc = [
    ['01', 'Executive Summary'], ['02', 'Business Health Scorecard'], ['03', 'Detailed Diagnostic'],
    ['04', 'A Strategic Insight'], ['05', 'Your Priority Matrix'], ['06', 'Your Signature Offer'],
    ['07', 'Pricing & Money Psychology'], ['08', 'Your 30-Day Plan'], ['09', 'Content & Growth Assets'],
    ['10', 'Your 7-Day Homework'], ['11', 'If We Were Running Your Business'], ['12', 'A Relevant Result'],
    ['13', 'About The5th Consulting'], ['14', 'Your Strategy Session'],
  ]
  sheets.push(`<section class="sheet">
    ${eyebrow('Contents')}
    ${h2('What is inside<br/>this report.')}
    <div style="max-width:560px;margin-top:8px">
      ${toc.map(([n, t]) => `<div style="display:flex;align-items:baseline;gap:16px;padding:13px 0;border-bottom:1px solid ${P.line}">
        <span style="font-family:'Cormorant Garamond',serif;font-size:18px;color:${P.gold};min-width:28px">${n}</span>
        <span style="flex:1;font-family:'DM Sans';font-size:13px;color:${P.ink}">${t}</span></div>`).join('')}
    </div>${foot}</section>`)

  /* 04 — EXECUTIVE SUMMARY */
  const summ = (label: string, value: string, big = false) => `<div style="border:1px solid ${P.line};border-radius:12px;padding:18px 20px;background:#fff">
    <div style="font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${P.muted};margin-bottom:8px">${label}</div>
    <div style="font-family:'${big ? 'Cormorant Garamond' : 'DM Sans'}',serif;font-size:${big ? 40 : 15}px;font-weight:${big ? 600 : 600};color:${big ? P.goldDeep : P.ink};line-height:1.25">${value}</div></div>`
  sheets.push(`<section class="sheet">
    ${eyebrow('01 · Executive Summary')}
    ${h2(`Where your business<br/>stands <span style="font-style:italic;color:${P.goldDeep}">today.</span>`)}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
      ${summ('Overall Health', `${overall}<span style="font-size:16px;color:${P.muted}"> / 100</span>`, true)}
      ${summ('Business Stage', esc(m.archetypeLabel))}
      ${summ('Profile', esc(m.personalityLabel))}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${summ('Biggest Strength', `${esc(strength.label)} · ${strength.val}/100`)}
      ${summ('Biggest Constraint', `${esc(constraint.label)} · ${constraint.val}/100`)}
    </div>
    <div style="margin-top:16px;background:#FBF8F2;border-left:3px solid ${P.gold};border-radius:8px;padding:18px 22px">
      <div style="font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${P.goldDeep};margin-bottom:8px">Your biggest opportunity</div>
      <p style="font-family:'Cormorant Garamond',serif;font-size:19px;line-height:1.4;color:${P.ink};margin:0">${esc(opportunity || 'A focused repositioning of your offer around a single, high-value outcome.')}</p>
    </div>
    <div style="margin-top:14px">
      <div style="font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${P.muted};margin-bottom:6px">Primary recommendation</div>
      <p style="font-size:12px;color:${P.sub};line-height:1.7;margin:0">${esc(primaryRec || 'Strengthen your weakest link before scaling anything else.')}</p>
    </div>${foot}</section>`)

  /* 05 — SCORECARD */
  sheets.push(`<section class="sheet">
    ${eyebrow('02 · Business Health Scorecard')}
    ${h2(`Eight dimensions,<br/>scored <span style="font-style:italic;color:${P.goldDeep}">honestly.</span>`)}
    <div style="display:flex;align-items:center;gap:14px;margin:4px 0 22px">
      <div style="font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:600;color:${P.goldDeep};line-height:1">${overall}</div>
      <div><div style="font-family:'DM Sans';font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${P.muted}">Overall business health</div>
      <div style="font-size:11.5px;color:${P.sub};max-width:340px;line-height:1.55;margin-top:4px">A weighted read across the levers that determine whether your business compounds or stalls.</div></div>
    </div>
    ${scorecardSVG(scores)}${foot}</section>`)

  /* 06 — DETAILED DIAGNOSTIC (top 4 categories by priority = lowest scores) */
  const diagCats = [...scores].sort((a, b) => a.val - b.val).slice(0, 4)
  const actionFor: Record<string, string> = {
    offer: sec['YOUR SIGNATURE OFFER'] || '', pricing: sec['YOUR PRICING STRATEGY'] || '',
    marketing: sec['7-DAY CONTENT PLAN'] || sec['30-DAY ACTION PLAN'] || '', content: sec['7-DAY CONTENT PLAN'] || '',
    positioning: sec['YOUR SITUATION RIGHT NOW'] || '', sales: sec['YOUR PRICING STRATEGY'] || '',
    automation: sec['30-DAY ACTION PLAN'] || '', confidence: sec['MONEY PSYCHOLOGY INSIGHTS'] || '',
  }
  const diagCard = (s: Score) => {
    const b = bandFor(s.val)
    const action = firstSentence(actionFor[s.key] || sec['YOUR BIGGEST OPPORTUNITY'] || '')
    return `<div style="border:1px solid ${P.line};border-radius:12px;padding:18px 20px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
        <span style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:${P.ink}">${esc(s.label)}</span>
        <span><span style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:${P.goldDeep}">${s.val}</span><span style="font-size:10px;color:${P.muted}">/100</span>
        <span style="margin-left:10px;font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:.5px;color:#fff;background:${b.color};padding:3px 9px;border-radius:20px">${b.priority.toUpperCase()} PRIORITY</span></span>
      </div>
      <p style="font-size:11.4px;color:${P.sub};line-height:1.62;margin:0 0 6px"><b style="color:${P.ink}">Assessment.</b> Your ${esc(s.label.toLowerCase())} currently reads as <b style="color:${b.color}">${esc(b.label.toLowerCase())}</b>${s.val < 60 ? ', and is likely capping the return on the areas around it' : ', a genuine asset to build around'}.</p>
      <p style="font-size:11.4px;color:${P.sub};line-height:1.62;margin:0"><b style="color:${P.ink}">Recommended action.</b> ${esc(action || 'Tighten this into one clear, repeatable process before adding anything new.')}</p>
    </div>`
  }
  sheets.push(`<section class="sheet">
    ${eyebrow('03 · Detailed Diagnostic')}
    ${h2(`The four areas that<br/>matter <span style="font-style:italic;color:${P.goldDeep}">most right now.</span>`)}
    ${diagCats.map(diagCard).join('')}${foot}</section>`)

  /* 07 — STRATEGIC INSIGHT */
  sheets.push(`<section class="sheet dark">
    ${eyebrow('04 · A Strategic Insight', true)}
    ${h2(`Your bottleneck is <span style="font-style:italic;color:${P.gold}">${esc(constraint.label)}</span>,<br/>not effort.`, true)}
    <div style="max-width:560px">
      <p style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.85;margin:0 0 16px">Your business scores <b style="color:${P.gold}">${strength.val}</b> on ${esc(strength.label)} but only <b style="color:${P.gold}">${constraint.val}</b> on ${esc(constraint.label)}. That gap is the story.</p>
      <p style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.85;margin:0 0 16px">It suggests the constraint is not your ability to deliver, it is your ${esc(constraint.label.toLowerCase())}. Pouring more energy into what is already strong will not move the number that is actually holding you back. The highest-leverage work is almost always at the weakest link, because that is where the whole system is currently rate-limited.</p>
      <p style="font-size:13px;color:rgba(255,255,255,.82);line-height:1.85;margin:0">Fix ${esc(constraint.label.toLowerCase())} first, and the strengths you already have finally get to compound.</p>
    </div>${footDark}</section>`)

  /* 08 — PRIORITY MATRIX */
  sheets.push(`<section class="sheet">
    ${eyebrow('05 · Your Priority Matrix')}
    ${h2(`What to do first,<br/><span style="font-style:italic;color:${P.goldDeep}">and what to ignore.</span>`)}
    <div style="display:flex;gap:26px;align-items:flex-start">
      <div>${matrixSVG(scores)}</div>
      <div style="flex:1;padding-top:8px">
        <p style="font-size:11.6px;color:${P.sub};line-height:1.7;margin:0 0 14px">Each dimension is plotted by the <b style="color:${P.ink}">impact</b> of improving it against the <b style="color:${P.ink}">effort</b> to do so. Start top-left.</p>
        <div style="border-left:3px solid ${P.gold};padding-left:14px;margin-bottom:12px"><div style="font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1.2px;color:${P.goldDeep};margin-bottom:2px">DO FIRST</div><div style="font-size:11.5px;color:${P.sub};line-height:1.5">${esc(constraint.label)} and ${esc(diagCats[1]?.label || lowThree[1]?.label || 'Positioning')} — highest return for the effort.</div></div>
        <div style="border-left:3px solid ${P.line};padding-left:14px"><div style="font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1.2px;color:${P.muted};margin-bottom:2px">HOLD</div><div style="font-size:11.5px;color:${P.sub};line-height:1.5">Do not spend the next 30 days polishing ${esc(strength.label.toLowerCase())}. It is already working.</div></div>
      </div>
    </div>${foot}</section>`)

  /* 06–09 — DEEP STRATEGY PAGES (the detailed, personalized substance) */
  const deepPage = (num: string, label: string, title: string, sub: string, blocks: [string, string][]) => {
    const inner = blocks.filter(([, key]) => sec[key]).map(([hd, key]) =>
      `${hd ? `<div style="font-family:'DM Sans';font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${P.goldDeep};margin:20px 0 8px">${hd}</div>` : ''}${richBody(sec[key])}`
    ).join('')
    if (!inner.trim()) return
    sheets.push(`<section class="sheet">
      ${eyebrow(num + ' · ' + label)}
      ${h2(title)}
      ${sub ? `<p style="font-size:12px;color:${P.sub};line-height:1.7;margin:0 0 12px;max-width:560px">${sub}</p>` : ''}
      <div style="max-width:620px">${inner}</div>${foot}</section>`)
  }
  deepPage('06', 'Your Signature Offer', `The offer built for <span style="font-style:italic;color:${P.goldDeep}">your niche.</span>`, 'A clear, premium way to package what you already do well.', [['', 'YOUR SIGNATURE OFFER']])
  deepPage('07', 'Pricing & Money Psychology', `What to charge, <span style="font-style:italic;color:${P.goldDeep}">and how to hold it.</span>`, '', [['Your pricing strategy', 'YOUR PRICING STRATEGY'], ['How you relate to money', 'MONEY PSYCHOLOGY INSIGHTS']])
  deepPage('08', 'Your 30-Day Plan', `The month that builds <span style="font-style:italic;color:${P.goldDeep}">momentum.</span>`, 'Four focused weeks, in order.', [['', '30-DAY ACTION PLAN']])
  deepPage('09', 'Content & Growth Assets', `Demand, <span style="font-style:italic;color:${P.goldDeep}">on repeat.</span>`, '', [['Your 7-day content plan', '7-DAY CONTENT PLAN'], ['Your lead magnet', 'YOUR LEAD MAGNET IDEA'], ['Your digital product', 'YOUR DIGITAL PRODUCT IDEA']])

  /* 10 — 7-DAY HOMEWORK PLAN (mirrors the daily email sequence) */
  const homework = parseHomework(sec['YOUR NEXT 7 DAYS'] || '')
  const hwCards = (homework.length ? homework : [
    { day: 1, task: 'Define your single best offer and the one outcome it delivers.' },
    { day: 2, task: 'Message three past leads with a specific invitation.' },
    { day: 3, task: 'Publish one story-driven post about a client result.' },
    { day: 4, task: 'Build a simple lead magnet from your best content.' },
    { day: 5, task: 'Set up a two-email follow-up sequence.' },
    { day: 6, task: 'Run one discovery call.' },
    { day: 7, task: "Review what worked and pick next week's single priority." },
  ]).map(h => `<div style="display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid ${P.line}">
      <div style="min-width:52px;font-family:'DM Sans';font-size:9px;font-weight:700;letter-spacing:1px;color:${P.goldDeep};text-transform:uppercase;padding-top:2px">Day ${h.day}</div>
      <div style="width:15px;height:15px;border:1.5px solid ${P.gold};border-radius:4px;flex-shrink:0;margin-top:1px"></div>
      <div style="flex:1;font-size:12px;color:${P.sub};line-height:1.55">${esc(h.task)}</div>
    </div>`).join('')
  sheets.push(`<section class="sheet">
    ${eyebrow('10 · Your 7-Day Homework')}
    ${h2(`One small task <span style="font-style:italic;color:${P.goldDeep}">each day.</span>`)}
    <p style="font-size:12px;color:${P.sub};line-height:1.7;margin:0 0 18px;max-width:560px">Do these in order, one per day. You'll get a short email each morning with that day's task and a real example of someone who did the same thing. Check each box as you go.</p>
    <div style="max-width:600px">${hwCards}</div>
    ${ctaBar}${foot}</section>`)

  /* 10 — IF WE WERE RUNNING YOUR BUSINESS */
  const moves = lowThree.map((s, i) => `<div style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.12)">
    <div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:${P.gold};min-width:34px">${i + 1}</div>
    <div><div style="font-family:'DM Sans';font-size:13px;font-weight:600;color:#fff;margin-bottom:3px">Fix ${esc(s.label.toLowerCase())} before anything else.</div>
    <div style="font-size:11.5px;color:rgba(255,255,255,.7);line-height:1.6">At ${s.val}/100 it is the clearest limiter on your goal of ${esc(m.goal.toLowerCase())}. One focused week here changes the trajectory more than a month spread thin.</div></div></div>`).join('')
  sheets.push(`<section class="sheet dark">
    ${eyebrow('11 · If We Were Running Your Business', true)}
    ${h2(`The first decisions<br/>we would <span style="font-style:italic;color:${P.gold}">make.</span>`, true)}
    <div style="max-width:600px">${moves}
      <p style="font-size:12px;color:rgba(255,255,255,.72);line-height:1.75;margin:18px 0 0">And the discipline underneath all of it: resist the urge to improve what is already strong. Every hour spent on ${esc(strength.label.toLowerCase())} right now is an hour not spent on the constraint that is actually capping your growth.</p>
    </div>${footDark}</section>`)

  /* 11 — RELEVANT RESULT (case study) */
  if (study) {
    const metrics = (study.metrics || []).slice(0, 4)
    sheets.push(`<section class="sheet">
      ${eyebrow('12 · A Relevant Result')}
      ${h2(`How we solved a similar<br/><span style="font-style:italic;color:${P.goldDeep}">constraint.</span>`)}
      <div style="border:1px solid ${P.line};border-radius:14px;overflow:hidden">
        <div style="background:${P.plum};padding:24px 26px;color:#fff">
          <div style="font-family:'DM Sans';font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:${P.goldSoft};margin-bottom:8px">${esc(study.niche)} · ${esc(study.location)}</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600">${esc(study.name)}</div>
          <div style="font-size:11.5px;color:rgba(255,255,255,.72);margin-top:4px">${esc(study.tagline)}</div>
          <div style="margin-top:16px;font-family:'Cormorant Garamond',serif"><span style="font-size:34px;font-weight:700;color:${P.gold}">${esc(study.headline.v)}</span> <span style="font-size:13px;color:rgba(255,255,255,.6)">${esc(study.headline.period)}</span></div>
        </div>
        <div style="padding:22px 26px">
          <p style="font-size:11.6px;color:${P.sub};line-height:1.68;margin:0 0 12px"><b style="color:${P.ink}">The challenge.</b> ${esc(firstSentence(study.challenge))}</p>
          <p style="font-size:11.6px;color:${P.sub};line-height:1.68;margin:0 0 16px"><b style="color:${P.ink}">What we did.</b> ${esc(firstSentence(study.whatWeDid))}</p>
          ${metrics.length ? `<div style="display:grid;grid-template-columns:repeat(${metrics.length},1fr);gap:10px">${metrics.map(mt => `<div style="text-align:center;background:#FBF8F2;border-radius:8px;padding:12px 6px"><div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:${P.green}">${esc(mt.v)}</div><div style="font-size:8.5px;letter-spacing:.4px;text-transform:uppercase;color:${P.muted};margin-top:2px">${esc(mt.l)}</div></div>`).join('')}</div>` : ''}
        </div>
      </div>
      <p style="font-size:10px;color:${P.muted};margin-top:12px;font-style:italic">A verified client result. Individual outcomes vary and are not a guarantee of future performance.</p>${foot}</section>`)
  }

  /* 12 — ABOUT THE5TH */
  sheets.push(`<section class="sheet">
    ${eyebrow('13 · About The5th Consulting')}
    ${h2(`We help experts turn a<br/>lifetime of experience into<br/><span style="font-style:italic;color:${P.goldDeep}">a business that lasts.</span>`)}
    <div style="max-width:560px">
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 14px">The5th works with coaches, consultants and experts, most of them established in their field, who know they are sitting on real value but have not yet built the offer, positioning and system to monetize it with confidence.</p>
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0 0 14px">Our philosophy is simple: growth is not about doing more, it is about fixing the one constraint that is holding everything else back. We diagnose it, we build the plan around it, and where it helps, we implement it with you.</p>
      <p style="font-size:12.5px;color:${P.sub};line-height:1.85;margin:0">This diagnostic exists because clarity should come before commitment. You should be able to see exactly where your business stands, and what to do next, before you ever decide to work with us.</p>
    </div>${foot}</section>`)

  /* 13 — FINAL STRATEGY SESSION CTA */
  sheets.push(`<section class="sheet dark" style="text-align:center;justify-content:center">
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center">
      ${eyebrow('14 · Your Next Step', true)}
      <h2 style="font-family:'Cormorant Garamond',serif;font-weight:500;font-size:46px;line-height:1.05;color:#fff;margin:0 0 18px;max-width:600px">Your complimentary<br/><span style="font-style:italic;color:${P.gold}">1:1 strategy session.</span></h2>
      <p style="font-size:13px;color:rgba(255,255,255,.76);line-height:1.8;max-width:500px;margin:0 0 28px">You have seen where your business stands and the highest-priority opportunities from your assessment. On your session, Indrodip will review your diagnostic with you, clarify your priorities, answer your questions, and map the exact next steps to implement it.</p>
      <a href="${BOOKING_URL}" style="display:inline-block;background:linear-gradient(180deg,${P.goldSoft},${P.gold} 60%,${P.goldDeep});color:${P.plumDeep};font-family:'DM Sans';font-weight:700;font-size:15px;padding:17px 44px;border-radius:8px;text-decoration:none">Book Your Complimentary Session →</a>
      <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:16px">Included with your diagnostic · 60 minutes · No obligation</div>
    </div>${footDark}</section>`)

  /* 14 — FINAL BRAND PAGE */
  sheets.push(`<section class="sheet dark" style="text-align:center;justify-content:center">
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center">
      <div style="margin-bottom:26px">${logoMark(m, 168)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-style:italic;color:${P.gold};margin-bottom:30px">Business Strategy · Marketing · Growth</div>
      <div style="font-family:'DM Sans';font-size:12px;color:rgba(255,255,255,.7);line-height:2">
        <a href="${SITE}" style="color:#fff;text-decoration:none">the5th.consulting</a><br/>
        <a href="${BOOKING_URL}" style="color:${P.goldSoft};text-decoration:none">Book a strategy session</a><br/>
        support@10kroadmap.org</div>
    </div>
    <div style="font-family:'DM Sans';font-size:9px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.4);text-align:center">© 2026 The5th Consulting · ${conf}</div>
  </section>`)

  const total = sheets.length
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
  <title>The5th Business Growth Diagnostic</title>
  <meta name="author" content="The5th Consulting">
  <meta name="subject" content="Personalized Business Growth Assessment">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'DM Sans', system-ui, sans-serif; color: ${P.ink}; counter-reset: pg; }
    .sheet { position: relative; width: 100%; min-height: 1122px; padding: 62px 66px 92px; page-break-after: always; display: flex; flex-direction: column; background: ${P.paper}; counter-increment: pg; }
    .sheet:last-child { page-break-after: auto; }
    .sheet.dark { background: linear-gradient(165deg, ${P.plum2}, ${P.plum} 55%, ${P.plumDeep}); color: #fff; }
    .cover { justify-content: space-between; }
    .foot { position: absolute; left: 66px; right: 66px; bottom: 40px; display: flex; justify-content: space-between; align-items: center; font-family: 'DM Sans'; font-size: 8.5px; letter-spacing: .12em; text-transform: uppercase; color: ${P.muted}; border-top: 1px solid ${P.line}; padding-top: 10px; }
    .foot.dark { color: rgba(255,255,255,.45); border-top-color: rgba(255,255,255,.16); }
    .foot .pg::after { content: counter(pg) " / ${total}"; }
    a { color: inherit; }
  </style></head><body>${sheets.join('')}</body></html>`
}

/* Fetch the white wordmark once and inline it as a data URI so the PDF never
   depends on the renderer reaching an external image (logo-white.png 404s in
   prod; logo-white2.png is the live white mark). Empty string → text fallback. */
const fetchLogo = async (): Promise<string> => {
  try {
    const r = await fetch(`${SITE}/logo-white2.png`, { signal: AbortSignal.timeout(8000) })
    if (!r.ok) return ''
    return `data:image/png;base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`
  } catch { return '' }
}

/* Render a PDF from HTML via APITemplate.io (managed, no cold starts). Returns
   the PDF bytes as base64, or null so the caller can still send the email. */
const pdfViaApiTemplate = async (html: string): Promise<string | null> => {
  const key = process.env.APITEMPLATE_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://rest.apitemplate.io/v2/create-pdf-from-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
      body: JSON.stringify({
        body: html,
        settings: { paper_size: 'A4', margin_top: '0', margin_bottom: '0', margin_left: '0', margin_right: '0', print_background: '1' },
      }),
      signal: AbortSignal.timeout(45000),
    })
    const json = await res.json().catch(() => ({}))
    const url = json?.download_url as string | undefined
    if (!res.ok || !url) { console.error('APITemplate error:', res.status, JSON.stringify(json).slice(0, 300)); return null }
    const fileRes = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!fileRes.ok) { console.error('APITemplate download failed:', fileRes.status); return null }
    return Buffer.from(await fileRes.arrayBuffer()).toString('base64')
  } catch (err) {
    console.error('APITemplate request failed:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  // Generating + emailing a PDF is expensive; cap it hard per IP.
  const rl = await limit(`genpdf:ip:${clientIp(req)}`, 8, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  try {
    const body = await req.json()
    const { name, email, roadmap, stage, goal, hours, videoSlug, archetype, personality } = body

    const personalityLabels: Record<string, string> = {
      'action': 'The Driver', 'connection': 'The Flow Worker',
      'ideas': 'The Deep Thinker', 'meaning': 'The Gentle Builder',
    }
    const personalityLabel = personalityLabels[personality as string] || 'The Driver'
    const archetypeLabel = (archetype as string) || 'The Pioneer'

    if (!name || !email || !roadmap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const firstName = name.split(' ')[0]
    const videoUrl = `https://quiz.the5th.consulting/video/${videoSlug || 'v1'}`
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const filename = `${name} Business Blueprint.pdf`
    let pdfAttachment: Array<{ filename: string; content: string }> | undefined = undefined

    // Primary: APITemplate.io renders our premium multi-page consulting report.
    const logo = await fetchLogo()
    const reportHtml = buildPremiumReport(roadmap, {
      name, firstName, archetypeLabel, personalityLabel,
      goal: goal || '$5K-$10K / month', stage: stage || 'launched', dateStr, logo,
    })
    const apiTemplateB64 = await pdfViaApiTemplate(reportHtml)
    if (apiTemplateB64) {
      pdfAttachment = [{ filename, content: apiTemplateB64 }]
    } else {
      // Fallback: legacy Render microservice (only while APITEMPLATE_API_KEY is unset).
      const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://the5th-pdf-service.onrender.com'
      try {
        fetch(`${PDF_SERVICE_URL}/health`).catch(() => {})
        await new Promise(r => setTimeout(r, 5000))
        const pdfRes = await fetch(`${PDF_SERVICE_URL}/generate-pdf`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, stage: stage || 'launched', goal: goal || '$5K-$10K / month', hours: hours || '10-20', video_url: videoUrl, roadmap, archetype: archetypeLabel, personality: personalityLabel }),
          signal: AbortSignal.timeout(90000),
        })
        if (pdfRes.ok) pdfAttachment = [{ filename, content: Buffer.from(await pdfRes.arrayBuffer()).toString('base64') }]
        else console.error('PDF service error:', pdfRes.status, await pdfRes.text())
      } catch (err) {
        console.error('PDF generation failed, sending without attachment:', err)
      }
    }

    const preheader = `${firstName}, your Business Blueprint is attached — open it when you have 10 quiet minutes.`
    const emailHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>Your Business Blueprint</title>
<style>
  @media (max-width:600px){
    .wrap{padding:14px 0!important}
    .card{width:100%!important;border-radius:0!important}
    .pad{padding:30px 24px!important}
    .h1{font-size:22px!important}
    .bd{font-size:17px!important}
  }
</style></head>
<body style="margin:0;padding:0;background:#F4F1EC;">
<span style="display:none!important;max-height:0;overflow:hidden;opacity:0;color:#F4F1EC;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;"><tr><td class="wrap" align="center" style="padding:30px 12px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" class="card" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(46,26,53,.08);">
  <tr><td class="pad" style="padding:36px 42px;">
    <div style="font-size:16px;font-weight:800;color:#2E1A35;letter-spacing:.3px;margin-bottom:24px;">The<span style="color:#C9A84C;">5th</span></div>
    <p class="bd h1" style="font-size:19px;color:#221d29;line-height:1.5;margin:0 0 14px;font-weight:700;">Hi ${esc(firstName)}, your Business Blueprint is ready.</p>
    <p class="bd" style="font-size:16px;color:#4a4550;line-height:1.6;margin:0 0 16px;">It's attached to this email as a PDF — your full business diagnostic, your scores, your biggest constraint, and a day-by-day plan.</p>
    <p class="bd" style="font-size:16px;color:#4a4550;line-height:1.6;margin:0 0 22px;"><strong style="color:#221d29;">Open the attachment</strong> when you have 10 quiet minutes. It's worth reading properly.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;"><tr>
      <td style="border:1px solid #e6e0d6;border-radius:10px;padding:13px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="width:36px;"><div style="width:36px;height:36px;border-radius:7px;background:#2E1A35;color:#C9A84C;font-size:10px;font-weight:800;text-align:center;line-height:36px;">PDF</div></td>
          <td style="padding-left:12px;"><div style="font-size:14px;color:#221d29;font-weight:600;">${esc(name)} Business Blueprint.pdf</div><div style="font-size:12px;color:#8a8377;">Open the attachment ↑</div></td>
        </tr></table>
      </td>
    </tr></table>
    <p class="bd" style="font-size:16px;color:#4a4550;line-height:1.6;margin:0 0 18px;">When you're ready to put it into action, your complimentary strategy session is included with your diagnostic.</p>
    <a href="${BOOKING_URL}" style="display:inline-block;background:#1C4A32;color:#ffffff;text-decoration:none;padding:14px 30px;font-weight:700;font-size:15px;border-radius:8px;">Book your session →</a>
    <p class="bd" style="font-size:16px;color:#221d29;line-height:1.6;margin:26px 0 0;">— Indrodip<br/><span style="color:#8a8377;font-size:13px;">Founder, The5th</span></p>
  </td></tr>
</table>
<div style="max-width:560px;margin:14px auto 0;font-size:11px;color:#a49c8f;text-align:center;line-height:1.5;">The5th Consulting · support@10kroadmap.org<br/>You're receiving this because you completed the business assessment.</div>
</td></tr></table></body></html>`

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: `${firstName}, your Business Blueprint is ready`,
      html: emailHtml,
      attachments: pdfAttachment,
    })

    if (error) { console.error('Resend error:', error); return NextResponse.json({ error: error.message }, { status: 500 }) }

    // CRM timeline + journey signal (best-effort).
    logActivity(email, 'program_view', 'Business Diagnostic report generated', pdfAttachment ? 'PDF delivered' : 'PDF pending').catch(() => {})
    emitEvent('report_generated', { email, has_pdf: !!pdfAttachment, product: 'business_growth_diagnostic' })

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (err) {
    console.error('PDF route error:', err)
    return NextResponse.json({ error: 'Failed to send blueprint' }, { status: 500 })
  }
}
