/* SERVER ONLY. The delivery links for the post-call assets. These must never be
   imported by a page, a client component or a pre-call email: the only consumer
   is the admin "send assets" route, which hands them to the post-call template.
   Set in the environment (never commit a real link):
     AUDIT_EBOOK_URL      direct PDF or hosted link
     AUDIT_SOFTWARE_URL   access link for the software
   If either is missing or not https, sending is refused (fail closed). */
export function assetLinks(): { ebook: string; software: string } | null {
  const ebook = (process.env.AUDIT_EBOOK_URL || '').trim()
  const software = (process.env.AUDIT_SOFTWARE_URL || '').trim()
  if (!/^https:\/\//i.test(ebook) || !/^https:\/\//i.test(software)) return null
  return { ebook, software }
}
