/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 (for uploaded book covers / volumes)
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
      // Production VPS — scholar images and any backend-served media
      {
        protocol: 'https',
        hostname: 'api.lo9in.com',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
  },
};

module.exports = nextConfig;
