import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { limit, clientIp } from '@/lib/rateLimit';

/* ══════════════════════════════════════════════════════════════════════════
   Edge security gateway (Next.js 16 renamed `middleware` -> `proxy`).

   Runs in front of every page and API request and gives the whole site a
   single, always-on line of defence that no individual route can forget:

     1. Drops obvious vulnerability-scanner / secret-probe paths.
     2. A per-IP rate-limit BACKSTOP on /api — a global ceiling that protects
        every endpoint (and the Anthropic / Supabase / email bills behind them)
        even if a handler shipped without its own limiter. Fail-open: any error
        here can never take the API down. Set EDGE_RATELIMIT_DISABLED=1 to lift.
     3. Canonicalises the host so the site is only served on one domain.

   Per-route limiters (lib/rateLimit), Turnstile/reCAPTCHA on forms, signed
   admin/user sessions (lib/session) and the cost guard (lib/cost-guard) remain
   the primary controls; this layer is defence-in-depth on top of them.
   ══════════════════════════════════════════════════════════════════════════ */

const CANONICAL_HOST = 'the5th.consulting';

// Extension-less scanner/exploit probes. Dotted probes (/.env, /wp-login.php)
// carry a file extension and are excluded by the matcher below, where Next.js
// 404s them anyway — so we only need the extension-less variants here.
const BLOCKED_PATHS = [
  /^\/(wp-admin|wp-login|wp-includes|wp-content|xmlrpc)/i,
  /^\/(phpmyadmin|phpMyAdmin|pma|adminer|mysqladmin|dbadmin)/i,
  /^\/(vendor|node_modules)(\/|$)/i,
  /^\/(cgi-bin|actuator|solr|jenkins|manager\/html|console\/)/i,
  /^\/(\.git|\.env|\.aws|\.ssh|\.svn|\.hg)(\/|$)/i,
];

// /api paths the backstop must never throttle: providers deliver webhooks in
// bursts, cron carries its own secret, health is polled by uptime monitors.
function exemptFromApiLimit(path: string): boolean {
  return (
    path.startsWith('/api/webhooks/') ||
    path.startsWith('/api/integrations/') ||
    path.startsWith('/api/cron/') ||
    path === '/api/health' ||
    path === '/api/quiz/health'
  );
}

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // 1) Short-circuit obvious probes everywhere — scanners get nothing.
  if (BLOCKED_PATHS.some((re) => re.test(pathname))) {
    return new NextResponse('Not Found', { status: 404, headers: NO_STORE });
  }

  const onCanonical =
    host === CANONICAL_HOST || host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // 2) API rate-limit backstop (defence-in-depth over per-route limiters).
  if (
    pathname.startsWith('/api/') &&
    !exemptFromApiLimit(pathname) &&
    process.env.EDGE_RATELIMIT_DISABLED !== '1'
  ) {
    try {
      const ip = clientIp(request);
      // Generous global ceiling: normal browsing (analytics, concierge, quiz)
      // never reaches it; only floods do.
      const r = await limit(`edge:api:${ip}`, 240, 60);
      if (!r.ok) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(r.retryAfter || 60),
            ...NO_STORE,
          },
        });
      }
    } catch {
      /* fail open — never let the limiter take the API down */
    }
  }

  // 3) Canonicalise host (www, *.vercel.app, previews -> apex), preserving path.
  if (!onCanonical) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Run on pages AND /api (for the backstop). Skip Next internals and static
  // files (any path whose final segment contains a dot), so assets stay fast.
  matcher: ['/((?!_next/static|_next/image|.*\\.[^/]+$).*)'],
};
