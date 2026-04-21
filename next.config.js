/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimisation ─────────────────────────────────────────────
  images: {
    // Serve WebP and AVIF — smaller files, faster loads
    formats: ['image/avif', 'image/webp'],

    // Cache optimised images for 24 hours on the CDN edge
    minimumCacheTTL: 86400,

    // Allow images from VPS (scholar photos, book covers, uploads)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.lo9in.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port:     '3001',
        pathname: '/**',
      },
    ],
  },

  // ── HTTP headers ───────────────────────────────────────────────────
  // Add cache-control headers to Next.js static assets
  async headers() {
    return [
      {
        // Next.js content-hashed chunks — cache for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public folder assets (icons, manifest, offline.html)
        source: '/:path((?!api).*)',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
