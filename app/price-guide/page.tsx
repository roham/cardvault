import type { Metadata } from 'next';
import PriceTable from '@/components/PriceTable';
import { sportsCards } from '@/data/sports-cards';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: 'Price Guide',
  description: 'Searchable price guide for sports cards and Pokémon TCG. Filter by sport, category, and price range. Sort by name, year, or set.',
};

export default async function PriceGuidePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const totalCards = sportsCards.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Price Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Browse and search {totalCards} sports cards with estimated value ranges. Filter by sport, sort by year or set, and find what you're looking for fast.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl px-5 py-3 mb-8">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">Estimates only.</strong> Values reflect approximate mid-to-high grade market prices based on recent comparable sales. Card condition, centering, and market timing significantly affect actual realized prices. Always verify with live auction data before buying or selling.
        </p>
      </div>

      <PriceTable sportsCards={sportsCards} initialQuery={q ?? ''} />
    </div>
  );
}
