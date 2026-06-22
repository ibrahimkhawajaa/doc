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
    ],
  },
};

export default nextConfig;
