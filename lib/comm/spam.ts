/* Spam analyzer + link/image validation (3I.8A.3). Rule-based, fast, no network
   — inspects the rendered HTML + subject for the signals mailbox providers weigh,
   returns an actionable spam score (0-100, higher = worse) with reasons. */
type Row = Record<string, unknown>

const SPAM_PHRASES = ['act now', 'limited time', 'buy now', 'click here', 'order now', 'risk-free', 'risk free', '100% free', 'no cost', 'earn money', 'make money', 'cash bonus', 'double your', 'guaranteed', 'winner', 'congratulations', 'you have been selected', 'urgent', 'apply now', 'call now', 'lowest price', 'cheap', '$$$', 'weight loss', 'viagra', 'crypto', 'investment', 'work from home']

export interface SpamReport {
  score: number; risk: 'excellent' | 'good' | 'needs improvement' | 'high risk'
  reasons: string[]; hasUnsubscribe: boolean; imageCount: number; linkCount: number
  textLength: number; links: string[]; insecureLinks: string[]
}

export function extractLinks(html: string): string[] {
  const out: string[] = []; const re = /href\s*=\s*["']([^"']+)["']/gi; let m
  while ((m = re.exec(html)) && out.length < 100) { const u = m[1]; if (/^https?:|^mailto:|^\{\{/.test(u)) out.push(u) }
  return out
}

export function analyzeSpam(html: string, subject = ''): SpamReport {
  const lower = (html + ' ' + subject).toLowerCase()
  const reasons: string[] = []
  let score = 0

  const phrases = SPAM_PHRASES.filter((p) => lower.includes(p))
  if (phrases.length) { score += Math.min(30, phrases.length * 6); reasons.push(`Spammy phrases: ${phrases.slice(0, 5).join(', ')}`) }

  const links = extractLinks(html)
  const insecureLinks = links.filter((u) => /^http:\/\//i.test(u))
  const imageCount = (html.match(/<img/gi) || []).length
  const textLength = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
  const hasUnsubscribe = /unsubscribe|\{\{\s*unsubscribe_url/i.test(html)

  if (!hasUnsubscribe) { score += 25; reasons.push('No unsubscribe link (required by Gmail/Yahoo)') }
  if (imageCount > 0 && textLength < 200) { score += 20; reasons.push('Image-heavy with little text — looks like an image-only email') }
  if (imageCount === 0 && textLength < 40) { score += 15; reasons.push('Almost no content') }
  if (insecureLinks.length) { score += 12; reasons.push(`${insecureLinks.length} non-HTTPS link(s)`) }
  if (/[A-Z]{6,}/.test(subject)) { score += 10; reasons.push('Subject has ALL-CAPS words') }
  if ((subject.match(/[!?$]/g) || []).length >= 3) { score += 8; reasons.push('Subject has excessive punctuation') }
  if (subject.length > 90) { score += 6; reasons.push('Subject line is very long') }
  if (!subject.trim()) { score += 10; reasons.push('Missing subject line') }
  if (/<style/i.test(html) && html.length > 100000) { score += 8; reasons.push('Very large HTML') }

  score = Math.min(100, Math.round(score))
  const risk = score < 15 ? 'excellent' : score < 35 ? 'good' : score < 60 ? 'needs improvement' : 'high risk'
  return { score, risk, reasons, hasUnsubscribe, imageCount, linkCount: links.length, textLength, links, insecureLinks }
}

/* Combine spam score + domain auth into a rough inbox-placement estimate.
   Never a guarantee — an explainable heuristic. */
export function inboxEstimate(spamScore: number, domainVerified: boolean): { placement: string; primary: number; promotions: number; spam: number; note: string } {
  let spam = Math.round(spamScore * 0.6)
  if (!domainVerified) spam += 30
  spam = Math.min(95, spam)
  const inbox = 100 - spam
  const primary = Math.round(inbox * 0.6), promotions = inbox - primary
  const placement = spam > 50 ? 'Spam likely' : spam > 25 ? 'Promotions/Updates' : 'Primary inbox'
  const note = !domainVerified ? 'Authenticate the sending domain (SPF/DKIM/DMARC) to move mail out of spam.' : spamScore > 35 ? 'Reduce spammy phrases and add more text to improve placement.' : 'Looks healthy — good text/image balance and authenticated domain.'
  return { placement, primary, promotions, spam, note }
}
