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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
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
      { source: '/community', destination: '/collective', permanent: true },
      { source: '/community/:path*', destination: '/collective/:path*', permanent: true },
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
