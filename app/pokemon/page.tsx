import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pokémon TCG Sets',
  description: 'Browse every Pokémon TCG set from Base Set through Scarlet & Violet. Find cards, check prices, and explore set details.',
};

interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  images: {
    logo: string;
    symbol: string;
  };
}

interface SetsBySeries {
  [series: string]: PokemonSet[];
}

async function getSets(): Promise<PokemonSet[]> {
  try {
    const res = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=250', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

const seriesOrder = [
  'Scarlet & Violet',
  'Sword & Shield',
  'Sun & Moon',
  'XY',
  'Black & White',
  'HeartGold & SoulSilver',
  'Platinum',
  'Diamond & Pearl',
  'EX',
  'e-Card',
  'Neo',
  'Gym',
  'Base',
  'Other',
];

export default async function PokemonPage() {
  const sets = await getSets();

  const bySeries: SetsBySeries = {};
  for (const set of sets) {
    const series = set.series ?? 'Other';
    if (!bySeries[series]) bySeries[series] = [];
    bySeries[series].push(set);
  }

  const orderedSeries = [
    ...seriesOrder.filter(s => bySeries[s]),
    ...Object.keys(bySeries).filter(s => !seriesOrder.includes(s)),
  ];

  const totalSets = sets.length;
  const totalCards = sets.reduce((sum, s) => sum + (s.total ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pokémon TCG Sets</h1>
        <p className="text-gray-400 text-lg mb-2">
          {totalSets > 0
            ? `${totalSets} sets · ${totalCards.toLocaleString()} cards — live data from the official Pokémon TCG API`
            : 'Complete set browser with live prices from the official Pokémon TCG API'}
        </p>
        <p className="text-gray-500 text-sm">Click any set to browse cards with TCGPlayer market prices.</p>
      </div>

      {sets.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-white font-semibold text-lg mb-2">Loading Pokémon TCG data</h2>
          <p className="text-gray-400 text-sm mb-6">
            Card data is fetched live from the Pokémon TCG API. If you see this message, the API may be temporarily unavailable.
          </p>
          <Link href="/pokemon" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            Try refreshing →
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {orderedSeries.map(series => {
            const seriesSets = bySeries[series] ?? [];
            return (
              <section key={series} id={series.replace(/\s+/g, '-').toLowerCase()}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-white">{series}</h2>
                  <span className="text-gray-500 text-sm">{seriesSets.length} sets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {seriesSets.map(set => (
                    <Link key={set.id} href={`/pokemon/sets/${set.id}`} className="group block">
                      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20 p-4">
                        {/* Set logo */}
                        <div className="relative h-14 mb-3 flex items-center justify-center">
                          {set.images?.logo ? (
                            <Image
                              src={set.images.logo}
                              alt={set.name}
                              fill
                              sizes="200px"
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-2xl">⚡</span>
                            </div>
                          )}
                        </div>

                        {/* Set info */}
                        <h3 className="text-white text-xs font-semibold text-center leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {set.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">
                            {set.releaseDate ? new Date(set.releaseDate).getFullYear() : '—'}
                          </span>
                          <span className="text-gray-500 text-xs">{set.total ?? '?'} cards</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
