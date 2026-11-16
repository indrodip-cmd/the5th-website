/* Emails for the $29 audit: booking confirmation, 24h and 1h reminders (pre-call)
   and the post-call assets email. Pre-call templates take no asset links at all.
   Only postCallEmail() receives links, as arguments, from the admin route. */
import { EBOOK_TITLE, SOFTWARE_NAME, ASSETS_BOOKED_LINE, ASSETS_REMINDER_LINE, PREP_LIST } from './audit-assets'

export const AUDIT_FROM = 'The5th Global Consulting <indrodip@10kroadmap.org>'
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5thglobal.consulting').replace(/\/$/, '')

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const shell = (inner: string) => `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2E1A35">${inner}
  <p style="font-size:12px;color:#9a93a2;margin-top:22px">© ${new Date().getFullYear()} The5th Global Consulting</p></div>`
const p = (t: string, extra = '') => `<p style="font-size:14px;line-height:1.6;color:#645a6e;${extra}">${t}</p>`
const when = (iso: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(iso))
const first = (name?: string | null) => esc((name || '').trim().split(' ')[0] || 'there')
const prepList = () => `<ul style="font-size:14px;line-height:1.7;color:#645a6e;padding-left:18px;margin:10px 0 0">${PREP_LIST.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
const button = (href: string, label: string) => `<p style="margin:14px 0"><a href="${esc(href)}" style="display:inline-block;background:#1C4A32;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 26px;border-radius:10px">${esc(label)}</a></p>`

export function bookingConfirmationEmail(a: { name?: string | null; start: string }) {
  return {
    subject: 'Your $10K Roadmap Audit is booked',
    html: shell(`<h1 style="font-size:22px;margin:0 0 12px">You're booked, ${first(a.name)}.</h1>
      ${p('Your private 60-minute $10K Roadmap Audit is confirmed for:')}
      <p style="font-size:17px;font-weight:700;margin:10px 0 16px">${esc(when(a.start))}</p>
      ${p(esc(ASSETS_BOOKED_LINE))}
      ${p('To get the most from the hour:', 'margin-bottom:0')}${prepList()}`),
  }
}

export function reminder24Email(a: { name?: string | null; start: string }) {
  return {
    subject: 'Your audit is tomorrow',
    html: shell(`<h1 style="font-size:20px;margin:0 0 12px">See you tomorrow, ${first(a.name)}.</h1>
      <p style="font-size:17px;font-weight:700;margin:6px 0 14px">${esc(when(a.start))}</p>
      ${p(esc(ASSETS_REMINDER_LINE))}`),
  }
}

export function reminder1hEmail(a: { name?: string | null; start: string; meetingUrl?: string | null }) {
  const link = a.meetingUrl || `${SITE}/10k-roadmap/thank-you`
  return {
    subject: 'Your audit starts in about an hour',
    html: shell(`<h1 style="font-size:20px;margin:0 0 12px">Starting soon, ${first(a.name)}.</h1>
      ${button(link, a.meetingUrl ? 'Join the call' : 'Open my booking details')}
      <p style="font-size:15px;font-weight:700;margin:6px 0 14px">${esc(when(a.start))}</p>
      ${p(esc(ASSETS_REMINDER_LINE))}`),
  }
}

/* Attendees only. Called solely by the admin send-assets route. */
export function postCallEmail(a: { name?: string | null; ebookUrl: string; softwareUrl: string }) {
  return {
    subject: `Your ${EBOOK_TITLE} and ${SOFTWARE_NAME} access`,
    html: shell(`<h1 style="font-size:22px;margin:0 0 12px">Thanks for showing up, ${first(a.name)}.</h1>
      ${p('As promised, here are your two post-call assets.')}
      ${button(a.ebookUrl, `Download ${EBOOK_TITLE}`)}
      ${button(a.softwareUrl, `Open ${SOFTWARE_NAME}`)}
      ${p(`<strong>Quick start with ${esc(SOFTWARE_NAME)}</strong>`, 'margin-bottom:4px')}
      <ol style="font-size:14px;line-height:1.7;color:#645a6e;padding-left:18px;margin:0">
        <li>Open ${esc(SOFTWARE_NAME)} with the button above.</li>
        <li>Tell it what you're trying to accomplish, or paste a link or file.</li>
        <li>Start with the bottleneck we found on your call and ask for the next step.</li>
      </ol>`),
  }
}
