import type { NextConfig } from "next";

/* Static marketing pages live in /public (served verbatim, pixel-for-pixel).
   These rewrites give them clean URLs and resolve their /public/* asset
   references. The Next app owns /quiz, /admin, and /api. */
const MARKETING_PAGES = [
  'about', 'call', 'fast-forward', 'collective', 'ai', 'start',
  'privacy', 'terms', 'refund', 'disclaimer', 'data', 'california',
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // Isolate our browsing context but still allow the Cal.com / Whop
          // checkout popups to talk back to us.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Content-Security-Policy. Deliberately allows https: broadly so the
          // third-party embeds this site depends on (Cal.com, Whop, Wistia,
          // Spotify, Google Fonts, GSAP CDN, analytics) keep working, while it
          // still shuts down the common injection vectors: no plugins/objects,
          // no <base> hijack, no framing by other origins, no mixed (http)
          // content, and no form posts to non-https targets.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https:",
              "media-src 'self' blob: data: https:",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      // Never let API responses be cached by the CDN/browser.
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/10k-coaching', destination: '/fast-forward', permanent: true },
      { source: '/help', destination: '/support', permanent: true },
      { source: '/code-of-ethics', destination: '/ethics', permanent: true },
      { source: '/community', destination: '/collective', permanent: true },
      { source: '/community/:path*', destination: '/collective/:path*', permanent: true },
      // Retired the old free VSL funnel — send any residual traffic to the
      // current $10K Roadmap Audit funnel.
      { source: '/lp/make-10k-month', destination: '/10k-roadmap', permanent: true },
      { source: '/lp/make-10k-month/:path*', destination: '/10k-roadmap', permanent: true },
      // Collapse the directly-reachable static-file URLs onto their clean
      // paths so Google never indexes both /about and /about/index.html.
      { source: '/index.html', destination: '/', permanent: true },
      ...MARKETING_PAGES.map((p) => ({
        source: `/${p}/index.html`,
        destination: `/${p}`,
        permanent: true,
      })),
    ];
  },
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      ...MARKETING_PAGES.map((p) => ({ source: `/${p}`, destination: `/${p}/index.html` })),
      // Marketing HTML references assets as /public/... — map those to the public root.
      { source: '/public/:path*', destination: '/:path*' },
    ];
  },
};

export default nextConfig;
