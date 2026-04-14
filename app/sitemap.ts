import type { MetadataRoute } from 'next';
import { sportsCards } from '@/data/sports-cards';
import { guides } from '@/app/guides/guides-data';

const BASE_URL = 'https://cardvault-two.vercel.app';

const playerSlugs = [
  'mickey-mantle', 'babe-ruth', 'mike-trout', 'derek-jeter', 'ken-griffey-jr',
  'shohei-ohtani', 'honus-wagner', 'michael-jordan', 'lebron-james', 'kobe-bryant',
  'luka-doncic', 'victor-wembanyama', 'tom-brady', 'patrick-mahomes', 'joe-montana',
  'peyton-manning', 'wayne-gretzky', 'bobby-orr', 'connor-mcdavid', 'sidney-crosby',
  'mario-lemieux', 'larry-bird', 'stephen-curry', 'julio-rodriguez', 'juan-soto',
  'vladimir-guerrero-jr', 'ichiro-suzuki', 'trevor-lawrence', 'joe-burrow',
  'jayson-tatum', 'ja-morant', 'josh-allen', 'lamar-jackson', 'albert-pujols',
  'aaron-judge', 'ronald-acuna-jr', 'jaromir-jagr', 'brett-hull', 'saquon-barkley',
  'eric-lindros',
];

const pokemonGenerations = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const standaloneGuides = [
  'best-cards-under-100', 'best-pokemon-investments', 'card-market-2026',
  'fake-cards', 'most-valuable-pokemon-cards', 'most-valuable-sports-cards',
  'psa-vs-bgs-vs-cgc', 'tcgplayer-vs-ebay', 'how-to-sell-cards', 'best-rookie-cards-2026',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/pokemon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/sports`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/price-guide`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/players`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/card-of-the-week`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/pokemon/generations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/sports/sets`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/start`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/calendar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/collection`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic guide pages from guides-data.ts
  const guidePages: MetadataRoute.Sitemap = guides.map(g => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Standalone guide pages
  const standaloneGuidePages: MetadataRoute.Sitemap = standaloneGuides.map(slug => ({
    url: `${BASE_URL}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Sports card pages
  const sportsCardPages: MetadataRoute.Sitemap = sportsCards.map(card => ({
    url: `${BASE_URL}/sports/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Sports set pages
  const uniqueSets = [...new Set(sportsCards.map(c => c.set.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')))];
  const sportsSetPages: MetadataRoute.Sitemap = uniqueSets.map(setSlug => ({
    url: `${BASE_URL}/sports/sets/${setSlug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Player pages
  const playerPages: MetadataRoute.Sitemap = playerSlugs.map(slug => ({
    url: `${BASE_URL}/players/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Pokemon generation pages
  const generationPages: MetadataRoute.Sitemap = pokemonGenerations.map(gen => ({
    url: `${BASE_URL}/pokemon/generations/${gen}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...guidePages,
    ...standaloneGuidePages,
    ...sportsCardPages,
    ...sportsSetPages,
    ...playerPages,
    ...generationPages,
  ];
}
