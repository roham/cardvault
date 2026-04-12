import type { MetadataRoute } from 'next';
import { sportsCards } from '@/data/sports-cards';

const BASE_URL = 'https://cardvault.app';

const playerSlugs = [
  'mickey-mantle', 'babe-ruth', 'mike-trout', 'derek-jeter', 'ken-griffey-jr',
  'shohei-ohtani', 'honus-wagner', 'michael-jordan', 'lebron-james', 'kobe-bryant',
  'luka-doncic', 'victor-wembanyama', 'tom-brady', 'patrick-mahomes', 'joe-montana',
  'peyton-manning', 'wayne-gretzky', 'bobby-orr', 'connor-mcdavid', 'sidney-crosby',
];

const pokemonGenerations = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/pokemon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/sports`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/price-guide`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/guides/most-valuable-sports-cards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/guides/most-valuable-pokemon-cards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/guides/card-market-2026`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guides/how-to-start-collecting-cards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guides/when-to-grade-your-cards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/players`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/card-of-the-week`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/pokemon/generations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/sports/sets`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const sportsCardPages: MetadataRoute.Sitemap = sportsCards.map(card => ({
    url: `${BASE_URL}/sports/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const playerPages: MetadataRoute.Sitemap = playerSlugs.map(slug => ({
    url: `${BASE_URL}/players/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const generationPages: MetadataRoute.Sitemap = pokemonGenerations.map(gen => ({
    url: `${BASE_URL}/pokemon/generations/${gen}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...sportsCardPages, ...playerPages, ...generationPages];
}
