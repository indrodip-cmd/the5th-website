import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Canonical host. Any request arriving on a different host (www, Vercel
// deployment URLs, preview aliases) is 308-redirected here so Google only
// ever indexes one hostname. This kills "Duplicate without user-selected
// canonical" caused by the site being reachable on multiple domains.
const CANONICAL_HOST = 'the5th.consulting';

// Next.js 16 renamed the `middleware` convention to `proxy` — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Leave local development and the canonical host untouched.
  if (
    host === CANONICAL_HOST ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  ) {
    return NextResponse.next();
  }

  // Redirect www + any *.vercel.app (production/preview) to the apex domain,
  // preserving the full path and query string.
  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = 'https:';
  url.port = '';
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Run on real pages only — skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.svg|.*\\..*).*)'],
};
