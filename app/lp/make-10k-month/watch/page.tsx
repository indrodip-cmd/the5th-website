import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WatchView from './WatchView'
import { videoConfig, revealSecondsClient, typeformFormId } from '../config'
import { verifyVslPass, VSL_PASS_COOKIE } from '@/lib/lp-funnel'

export const dynamic = 'force-dynamic'

/* Server-side gate: the training only renders for the browser session that
   actually opted in (HttpOnly pass cookie). No cookie — a shared link, another
   browser, or incognito — is bounced to the opt-in. */
export default async function Make10kWatchPage() {
  const jar = await cookies()
  const pass = verifyVslPass(jar.get(VSL_PASS_COOKIE)?.value)
  if (!pass) redirect('/lp/make-10k-month')

  const { url } = videoConfig()
  return (
    <WatchView
      videoUrl={url}
      revealSeconds={revealSecondsClient()}
      formId={typeformFormId()}
      lead={{ name: pass.name, email: pass.email }}
    />
  )
}
