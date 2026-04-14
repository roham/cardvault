import type { MetadataRoute } from 'next';
import pokemonSets from '@/data/pokemon-sets.json';

const BASE_URL = 'https://cardvault-two.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Pokemon set pages (~172 sets)
  for (const set of pokemonSets) {
    entries.push({
      url: `${BASE_URL}/pokemon/sets/${set.id}`,
      lastModified: new Date(set.releaseDate || '2024-01-01'),
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    // Set checklist page
    entries.push({
      url: `${BASE_URL}/pokemon/sets/${set.id}/checklist`,
      lastModified: new Date(set.releaseDate || '2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    // Individual card pages for this set (1 to total)
    for (let n = 1; n <= set.total; n++) {
      entries.push({
        url: `${BASE_URL}/pokemon/cards/${set.id}-${n}`,
        lastModified: new Date(set.releaseDate || '2024-01-01'),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
