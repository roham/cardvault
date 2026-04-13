import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards } from '@/data/sports-cards';
import Breadcrumb from '@/components/Breadcrumb';
import SportsCardTile from '@/components/SportsCardTile';
import CardGrid from '@/components/CardGrid';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: Promise<{ tier: string }>;
}

const tiers: Record<string, { maxPrice: number; label: string; description: string }> = {
  'under-50': { maxPrice: 50, label: 'Under $50', description: 'Affordable entry-level cards for new collectors. Quality rookie cards and vintage commons that punch above their price.' },
  'under-100': { maxPrice: 100, label: 'Under $100', description: 'The sweet spot for most collectors. Solid rookie cards, key vintage issues, and graded examples of iconic players.' },
  'under-500': { maxPrice: 500, label: 'Under $500', description: 'Mid-range cards with genuine investment potential. Key rookies in high grades and vintage hall-of-famers.' },
  'under-1000': { maxPrice: 1000, label: 'Under $1,000', description: 'Premium cards that anchor serious collections. High-grade rookies of all-time greats and scarce vintage issues.' },
};

function parseMinPrice(priceStr: string): number {
  const match = priceStr.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

export function generateStaticParams() {
  return Object.keys(tiers).map(tier => ({ tier }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tier } = await params;
  const config = tiers[tier];
  if (!config) return { title: 'Not Found' };
  return {
    title: `Best Sports Cards ${config.label} (2026) — Value Picks for Every Sport`,
    description: `The best sports cards you can buy for ${config.label.toLowerCase()} in 2026. Baseball, basketball, football, and hockey picks with real prices and collecting advice.`,
    keywords: [`sports cards ${config.label.toLowerCase()}`, `cheap sports cards`, `affordable card collecting`, `best cards to buy ${config.label.toLowerCase()}`],
  };
}

const sportMeta: Record<string, { label: string; emoji: string; color: string }> = {
  baseball: { label: 'Baseball', emoji: '⚾', color: 'text-red-400' },
  basketball: { label: 'Basketball', emoji: '🏀', color: 'text-orange-400' },
  football: { label: 'Football', emoji: '🏈', color: 'text-blue-400' },
  hockey: { label: 'Hockey', emoji: '🏒', color: 'text-cyan-400' },
};

export default async function ValueTierPage({ params }: Props) {
  const { tier } = await params;
  const config = tiers[tier];
  if (!config) notFound();

  const matchingCards = sportsCards
    .filter(card => {
      const minPrice = parseMinPrice(card.estimatedValueRaw);
      return minPrice > 0 && minPrice <= config.maxPrice;
    })
    .sort((a, b) => parseMinPrice(b.estimatedValueRaw) - parseMinPrice(a.estimatedValueRaw));

  const bySport = Object.entries(sportMeta).map(([sport, meta]) => ({
    ...meta,
    sport,
    cards: matchingCards.filter(c => c.sport === sport),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Best Sports Cards ${config.label}`,
        description: config.description,
        mainEntityOfPage: `https://cardvault-two.vercel.app/sports/value/${tier}`,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
          { '@type': 'ListItem', position: 3, name: `${config.label}` },
        ],
      }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Sports Cards', href: '/sports' },
        { label: `Best Cards ${config.label}` },
      ]} />

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Best Sports Cards {config.label}
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mb-4">{config.description}</p>
        <p className="text-gray-500 text-sm">
          {matchingCards.length} cards across all sports. Prices based on raw/low-grade estimated values.
        </p>
      </div>

      {/* Tier navigation */}
      <div className="flex flex-wrap gap-2 mb-10">
        {Object.entries(tiers).map(([key, t]) => (
          <Link
            key={key}
            href={`/sports/value/${key}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              key === tier
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Cards by sport */}
      {bySport.map(({ sport, label, emoji, color, cards }) => (
        cards.length > 0 && (
          <section key={sport} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{emoji}</span>
              <h2 className="text-2xl font-bold text-white">{label}</h2>
              <span className="text-gray-500 text-sm">{cards.length} cards</span>
            </div>
            <CardGrid>
              {cards.slice(0, 20).map(card => (
                <SportsCardTile key={card.slug} card={card} />
              ))}
            </CardGrid>
            {cards.length > 20 && (
              <p className="text-gray-500 text-sm mt-4">
                + {cards.length - 20} more {label.toLowerCase()} cards {config.label.toLowerCase()}
              </p>
            )}
          </section>
        )
      ))}

      {/* Internal links */}
      <div className="mt-16 border-t border-gray-800 pt-8">
        <h3 className="text-lg font-bold text-white mb-4">Related Guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/guides/best-cards-under-100" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors group">
            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">50 Best Cards Under $100</p>
            <p className="text-gray-500 text-sm">Curated picks with detailed analysis</p>
          </Link>
          <Link href="/guides/investing-101" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors group">
            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">Sports Card Investing 101</p>
            <p className="text-gray-500 text-sm">How to evaluate cards as investments</p>
          </Link>
          <Link href="/guides/when-to-grade-your-cards" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors group">
            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">When to Grade Your Cards</p>
            <p className="text-gray-500 text-sm">Calculate if grading makes financial sense</p>
          </Link>
          <Link href="/tools" className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors group">
            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">Collector Tools</p>
            <p className="text-gray-500 text-sm">Grade calculator and price lookup</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
