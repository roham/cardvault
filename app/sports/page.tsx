import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import SportsCardTile from '@/components/SportsCardTile';
import CardGrid from '@/components/CardGrid';

export const metadata: Metadata = {
  title: 'Sports Cards',
  description: 'Browse 100+ iconic sports cards across baseball, basketball, football, and hockey. From the 1952 Topps Mickey Mantle to modern Wembanyama rookies.',
};

const sports = [
  { value: 'baseball' as const, label: 'Baseball', emoji: '⚾', color: 'bg-red-950/60 text-red-400 border-red-800/40' },
  { value: 'basketball' as const, label: 'Basketball', emoji: '🏀', color: 'bg-orange-950/60 text-orange-400 border-orange-800/40' },
  { value: 'football' as const, label: 'Football', emoji: '🏈', color: 'bg-blue-950/60 text-blue-400 border-blue-800/40' },
  { value: 'hockey' as const, label: 'Hockey', emoji: '🏒', color: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' },
];

export default function SportsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sports Cards</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          100+ iconic cards from every era — vintage tobacco issues to modern patch autos. Each with real card data and estimated value ranges.
        </p>
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
        return (
          <section key={s.value} id={s.value} className="mb-14 scroll-mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{s.emoji}</span> {s.label}
              </h2>
              <span className="text-gray-500 text-sm">{cards.length} cards</span>
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
