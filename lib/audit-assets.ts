/* Post-call assets for the $29 audit: names only, safe to show on public pages.
   The two links are deliberately NOT here: they live in lib/audit-assets.server.ts
   and are only ever read by the post-call email, so they can never reach a page
   or a browser bundle. Override via env without touching code:
     NEXT_PUBLIC_AUDIT_EBOOK_TITLE, NEXT_PUBLIC_AUDIT_SOFTWARE_NAME */
export const EBOOK_TITLE = process.env.NEXT_PUBLIC_AUDIT_EBOOK_TITLE || 'Expertise to Income'
export const SOFTWARE_NAME = process.env.NEXT_PUBLIC_AUDIT_SOFTWARE_NAME || 'The5th AI'

// One sentence, three wordings (strip / booked page + confirmation / reminders), copy as specified.
export const ASSETS_STRIP = `After your session you also receive ${EBOOK_TITLE} and ${SOFTWARE_NAME} access.`
export const ASSETS_BOOKED_LINE = `After your session, you'll receive ${EBOOK_TITLE} and access to ${SOFTWARE_NAME} by email.`
export const ASSETS_REMINDER_LINE = `After the session you'll receive ${EBOOK_TITLE} and ${SOFTWARE_NAME} access.`
export const ASSETS_FAQ = {
  q: 'Do I get anything besides the call?',
  a: `Yes. After you attend your session, you receive ${EBOOK_TITLE} and access to ${SOFTWARE_NAME}. Both are sent to your email once the call is complete.`,
}
export const PREP_LIST = [
  'Have your last 90 days of revenue ready.',
  'Know your current offer and price.',
  'Write your biggest bottleneck in one sentence.',
]
