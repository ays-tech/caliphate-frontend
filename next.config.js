/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Production VPS — /media/ (seeded) and /uploads/ (admin uploaded)
      {
        protocol: 'https',
        hostname: 'api.lo9in.com',
        pathname: '/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port:     '3001',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
