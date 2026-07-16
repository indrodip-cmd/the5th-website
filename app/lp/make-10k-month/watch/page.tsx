import { redirect } from 'next/navigation'

/* The funnel is now a single video-gated page. Anyone landing on the old
   /watch URL (bookmarks, prior links) is sent to it. */
export default function Make10kWatchRedirect() {
  redirect('/lp/make-10k-month')
}
