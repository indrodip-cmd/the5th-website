/* The emailed copy of the Income Blocker Report: deterministic, no AI. */
import { BLOCKERS } from './content'
import type { Result } from './engine'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5thglobal.consulting').replace(/\/$/, '')
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

export function reportEmail(first: string, r: Result, unsubUrl: string): { subject: string; html: string; text: string } {
  const P = BLOCKERS[r.primary], S = BLOCKERS[r.secondary]
  const link = `${SITE}/quiz/report?r=${r.code}&n=${encodeURIComponent(first)}`
  const audit = `${SITE}/audit-checkout?src=quiz&p=${r.primary}&s=${r.secondary}&c=${r.code}`
  const subject = `${first ? first + ', you' : 'You'} are ${P.archetype}: your Income Blocker Report`
  const wins = P.wins.map((w) => `<li style="margin:0 0 6px">${esc(w)}</li>`).join('')
  const st = 'margin:0 0 14px;font-size:16px;line-height:1.6;color:#222'
  /* Plain, personal-style layout on purpose (keeps it out of the Promotions tab). */
  const html = `<!doctype html><html><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222"><div style="max-width:560px">
<p style="${st}">Hi ${first ? esc(first) : 'there'},</p>
<p style="${st}">Your Income Blocker Report is ready. Your profile is <b>${esc(P.archetype)}</b> (${esc(r.profileId)}).</p>
<p style="${st}">${esc(P.tagline)}</p>
<p style="${st}">${esc(r.pair)}</p>
<p style="${st}">Your top three blockers: ${r.order.slice(0, 3).map((b) => `${esc(BLOCKERS[b].name)} (${r.intensities[b]})`).join(', ')}.</p>
<p style="${st}"><a href="${link}" style="color:#1a55c4">Open your full report</a></p>
<p style="${st}">Three quick wins for this week:</p>
<ul style="margin:0 0 14px;padding-left:20px;font-size:16px;line-height:1.6;color:#222">${wins}</ul>
<p style="${st}">If you want a second pair of eyes, Manisha and I do a 60-minute <a href="${audit}" style="color:#1a55c4">audit call</a> that starts from your report (${esc(P.name)} and ${esc(S.name)}). $29, with a 7-day money-back guarantee. You leave with a written audit and a 100-day roadmap.</p>
<p style="${st}">Just reply to this email if you have a question.</p>
<p style="${st}">Indrodip<br><span style="font-size:13px;color:#777">The5th Global Consulting</span></p>
<p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#888">Educational only, based on the answers you gave. Not a guarantee of results, and not therapy, medical, legal or financial advice. <a href="${unsubUrl}" style="color:#888">Unsubscribe</a></p>
</div></body></html>`
  const text = `${first ? first + ', you are' : 'You are'} ${P.archetype}.\n\n${P.tagline}\n\nOpen your full report: ${link}\n\nThree quick wins this week:\n${P.wins.map((w) => '- ' + w).join('\n')}\n\nThe next step: a 60-minute $29 audit that starts from your report. ${audit}\n\nUnsubscribe: ${unsubUrl}`
  return { subject, html, text }
}
