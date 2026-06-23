import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'staticconnect.marham.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.marham.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oladoc.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.oladoc.com',
        pathname: '/**',
      },
    ],
  },
  // ✅ Keep this for TypeScript errors (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ❌ REMOVE this - no longer supported in next.config.ts
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;