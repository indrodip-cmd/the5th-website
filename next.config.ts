import type { NextConfig } from "next";

/* Static marketing pages live in /public (served verbatim, pixel-for-pixel).
   These rewrites give them clean URLs and resolve their /public/* asset
   references. The Next app owns /quiz, /admin, and /api. */
const MARKETING_PAGES = [
  'about', 'call', 'fast-forward', 'collective', 'ai',
  'privacy', 'terms', 'refund', 'disclaimer', 'data',
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/10k-coaching', destination: '/fast-forward', permanent: true },
      { source: '/community', destination: '/collective', permanent: true },
      { source: '/community/:path*', destination: '/collective/:path*', permanent: true },
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
