import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // These packages ship native binaries / heavy CJS graphs that must not be bundled
  // into the server build. Next keeps them external and requires them at runtime.
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'sharp',
    'playwright',
    '@remotion/renderer',
    '@remotion/bundler',
    'pdfjs-dist',
    'mammoth',
    'xlsx',
  ],
  experimental: {
    // Large scene-graph payloads travel through server actions during autosave.
    serverActions: { bodySizeLimit: '32mb' },
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
