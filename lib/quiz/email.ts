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
  const bars = r.order.slice(0, 3).map((b) => `<tr><td style="padding:6px 0;font-size:14px;color:#403b3b;width:130px">${esc(BLOCKERS[b].name)}</td><td style="padding:6px 0"><div style="background:#EFE8DA;border-radius:99px;height:10px"><div style="background:#C9A84C;border-radius:99px;height:10px;width:${r.intensities[b]}%"></div></div></td><td style="padding:6px 0 6px 10px;font-size:14px;font-weight:700;color:#2E1A35;width:34px">${r.intensities[b]}</td></tr>`).join('')
  const wins = P.wins.map((w) => `<li style="margin:0 0 8px">${esc(w)}</li>`).join('')
  const html = `<!doctype html><html><body style="margin:0;background:#F4EEE4;font-family:Helvetica,Arial,sans-serif;color:#1A1A2E">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EEE4"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#2E1A35;padding:26px 28px"><div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;font-weight:700">Your free Income Blocker Report</div>
<div style="font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#fff;margin-top:10px">${first ? esc(first) + ', you are' : 'You are'} <i style="color:#E4C879">${esc(P.archetype)}.</i></div></td></tr>
<tr><td style="padding:26px 28px">
<p style="margin:0 0 14px;font-size:16px;line-height:1.6">${esc(P.tagline)}</p>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#5a5550">${esc(r.pair)}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px">${bars}</table>
<div style="text-align:center;margin:0 0 26px"><a href="${link}" style="display:inline-block;background:#C9A84C;color:#2E1A35;font-weight:700;text-decoration:none;padding:15px 28px;border-radius:6px;font-size:15px">Open my full report</a></div>
<h3 style="font-family:Georgia,serif;font-size:20px;margin:0 0 10px;color:#2E1A35">Three quick wins this week</h3>
<ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.55;color:#403b3b">${wins}</ul>
<div style="background:#2E1A35;border-radius:14px;padding:22px 22px;color:#fff">
<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;font-weight:700">The next step</div>
<div style="font-family:Georgia,serif;font-size:22px;line-height:1.2;margin:8px 0 10px">A report finds the block. A 60-minute audit removes it.</div>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#e6dff0">Indrodip and Manisha start from your report (${esc(P.name)} and ${esc(S.name)}), look at your real numbers and leave you with a written audit and a 100-day roadmap. $29, with a 7-day money-back guarantee.</p>
<a href="${audit}" style="display:inline-block;background:#C9A84C;color:#2E1A35;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:6px;font-size:14px">Book my $29 audit</a></div>
</td></tr>
<tr><td style="padding:0 28px 24px;font-size:12px;line-height:1.6;color:#8A8075">Educational only, based on the answers you gave. Not a guarantee of results, and not therapy, medical, legal or financial advice. Individual results vary.<br><br>The5th Global Consulting · <a href="${unsubUrl}" style="color:#8A8075">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`
  const text = `${first ? first + ', you are' : 'You are'} ${P.archetype}.\n\n${P.tagline}\n\nOpen your full report: ${link}\n\nThree quick wins this week:\n${P.wins.map((w) => '- ' + w).join('\n')}\n\nThe next step: a 60-minute $29 audit that starts from your report. ${audit}\n\nUnsubscribe: ${unsubUrl}`
  return { subject, html, text }
}
