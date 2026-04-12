import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CardVault — Sports Cards & Pokémon TCG Prices',
    short_name: 'CardVault',
    description: 'Free price guide for sports cards and Pokémon TCG. Real sold data, set browser, and collector tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['sports', 'entertainment', 'reference'],
    lang: 'en',
    orientation: 'portrait',
  };
}
