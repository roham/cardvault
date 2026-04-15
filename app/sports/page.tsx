// Force dynamic to avoid 24MB ISR fallback from 3,500+ card data file
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import { notableSales } from '@/data/notable-sales';
import SportsCardTile from '@/components/SportsCardTile';
import CardGrid from '@/components/CardGrid';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Sports Cards',
  description: 'Browse 1,200+ iconic sports cards across baseball, basketball, football, and hockey. From the 1952 Topps Mickey Mantle to modern Wembanyama rookies — with estimated values.',
};

const sports = [
  { value: 'baseball' as const, label: 'Baseball', emoji: '⚾', color: 'bg-red-950/60 text-red-400 border-red-800/40' },
  { value: 'basketball' as const, label: 'Basketball', emoji: '🏀', color: 'bg-orange-950/60 text-orange-400 border-orange-800/40' },
  { value: 'football' as const, label: 'Football', emoji: '🏈', color: 'bg-blue-950/60 text-blue-400 border-blue-800/40' },
  { value: 'hockey' as const, label: 'Hockey', emoji: '🏒', color: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' },
];

export default function SportsPage() {
  const top20 = sportsCards.slice(0, 20);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Sports Cards Price Guide',
        description: `Browse ${sportsCards.length}+ iconic sports cards across baseball, basketball, football, and hockey with estimated values.`,
        url: 'https://cardvault-two.vercel.app/sports',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: sportsCards.length,
          itemListElement: top20.map((card, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://cardvault-two.vercel.app/sports/${card.slug}`,
            name: card.name,
          })),
        },
      }} />
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sports Cards</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          {sportsCards.length}+ iconic cards from every era — vintage tobacco issues to modern patch autos. Each with real card data and estimated value ranges.
        </p>
      </div>

      {/* Browse by Sport */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {sports.map(s => {
          const count = sportsCards.filter(c => c.sport === s.value).length;
          return (
            <Link key={s.value} href={`/sports/sport/${s.value}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.color} transition-all hover:-translate-y-0.5`}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-white text-sm font-semibold">{s.label}</p>
                <p className="text-gray-500 text-xs">{count} cards</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Browse by Set link */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/sports/sets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
        >
          Browse by Set
          <span className="text-gray-500">&rarr;</span>
        </Link>
        <Link
          href="/sports/compare"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
        >
          Compare Players
          <span className="text-gray-500">&rarr;</span>
        </Link>
        <Link
          href="/sports/year"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
        >
          Browse by Year
          <span className="text-gray-500">&rarr;</span>
        </Link>
      </div>

      {/* Sport selector */}
      <div className="flex flex-wrap gap-3 mb-10">
        {sports.map(s => {
          const count = sportsCards.filter(c => c.sport === s.value).length;
          return (
            <a key={s.value} href={`#${s.value}`} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:opacity-80 ${s.color}`}>
              <span>{s.emoji}</span>
              <span>{s.label}</span>
              <span className="opacity-60">({count})</span>
            </a>
          );
        })}
      </div>

      {/* Per-sport sections */}
      {sports.map(s => {
        const cards = sportsCards.filter(c => c.sport === s.value);
        const rookieCards = cards.filter(c => c.rookie).length;
        // Find the most valuable card in this sport by top notable sale
        const mostValuable = cards.reduce<{ card: typeof cards[0]; record: string } | null>((best, card) => {
          const sales = notableSales.find(n => n.slug === card.slug);
          if (!sales) return best;
          const topSale = sales.sales[0];
          if (!best || topSale.priceValue > (notableSales.find(n => n.slug === best.card.slug)?.sales[0]?.priceValue ?? 0)) {
            return { card, record: topSale.price };
          }
          return best;
        }, null);

        return (
          <section key={s.value} id={s.value} className="mb-14 scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{s.emoji}</span> {s.label}
              </h2>
              <span className="text-gray-500 text-sm">{cards.length} cards tracked</span>
            </div>
            {/* Sport stats strip */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-gray-500 text-xs">Rookie Cards</span>
                <span className="text-white font-bold text-sm">{rookieCards}</span>
              </div>
              {mostValuable && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Record Sale</span>
                  <span className="text-amber-400 font-bold text-sm">{mostValuable.record}</span>
                  <Link href={`/sports/${mostValuable.card.slug}`} className="text-gray-600 hover:text-emerald-400 text-xs transition-colors">
                    ({mostValuable.card.player}) →
                  </Link>
                </div>
              )}
            </div>
            <CardGrid columns={4}>
              {cards.map(card => (
                <SportsCardTile key={card.slug} card={card} />
              ))}
            </CardGrid>
          </section>
        );
      })}
    </div>
  );
}
