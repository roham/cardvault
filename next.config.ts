import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
      },
      {
        protocol: 'https',
        hostname: '*.pokemontcg.io',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.tradingcarddb.com',
      },
      {
        protocol: 'https',
        hostname: 'tradingcarddb.com',
      },
      {
        protocol: 'https',
        hostname: '*.comc.com',
      },
      {
        protocol: 'https',
        hostname: 'comc.com',
      },
    ],
  },
};

export default nextConfig;
