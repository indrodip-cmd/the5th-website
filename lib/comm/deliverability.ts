/* Live deliverability check — reads the sending domain's SPF / DKIM / DMARC DNS
   records so the admin can see authentication status in-app (the #1 factor in
   whether mail reaches the inbox vs spam). Read-only DNS lookups. */
import { promises as dns } from 'dns'

async function txt(name: string): Promise<string[]> {
  try { return (await dns.resolveTxt(name)).map((a) => a.join('')) } catch { return [] }
}

export interface DomainAuth {
  domain: string
  spf: { ok: boolean; record: string | null }
  dkim: { ok: boolean; selector: string }
  dmarc: { ok: boolean; policy: string; record: string | null }
  verified: boolean
}

export async function checkDomain(domain: string): Promise<DomainAuth> {
  const d = domain.replace(/^.*@/, '').trim().toLowerCase()
  const [root, send, dmarc, dkimResend, dkimSend] = await Promise.all([
    txt(d), txt(`send.${d}`), txt(`_dmarc.${d}`), txt(`resend._domainkey.${d}`), txt(`resend._domainkey.send.${d}`),
  ])
  const spfRec = [...root, ...send].find((r) => /v=spf1/i.test(r)) || null
  const dmarcRec = dmarc.find((r) => /v=DMARC1/i.test(r)) || null
  const dkimOk = dkimResend.length > 0 || dkimSend.length > 0
  const spfOk = !!spfRec
  return {
    domain: d,
    spf: { ok: spfOk, record: spfRec },
    dkim: { ok: dkimOk, selector: 'resend._domainkey' },
    dmarc: { ok: !!dmarcRec, policy: dmarcRec ? (/(p=\w+)/.exec(dmarcRec)?.[1] || '') : '', record: dmarcRec },
    verified: spfOk && dkimOk,
  }
}
