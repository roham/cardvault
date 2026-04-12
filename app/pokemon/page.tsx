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

interface PokemonCard {
  id: string;
  name: string;
  set: { name: string; id: string };
  images: { small: string; large: string };
  rarity?: string;
  tcgplayer?: { prices?: { holofoil?: { market?: number }; normal?: { market?: number }; reverseHolofoil?: { market?: number }; '1stEditionHolofoil'?: { market?: number } } };
  cardmarket?: { prices?: { averageSellPrice?: number } };
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

async function getMostValuableCards(): Promise<PokemonCard[]> {
  try {
    const res = await fetch(
      'https://api.pokemontcg.io/v2/cards?q=tcgplayer.prices.holofoil.market:[50 TO *]&orderBy=-cardmarket.prices.averageSellPrice&pageSize=12',
      { next: { revalidate: 3600 } }
    );
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

const popularSetIds = ['base1', 'sv8', 'sv6', 'sv3pt5', 'swsh12pt5', 'swsh12'];
const popularSetNames = ['Base Set', 'Prismatic Evolutions', 'Twilight Masquerade', 'Paldean Fates', 'Crown Zenith', 'Silver Tempest'];

export default async function PokemonPage() {
  const [sets, valuableCards] = await Promise.all([getSets(), getMostValuableCards()]);

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

  // Build popular sets from fetched data
  const popularSets = popularSetIds
    .map(id => sets.find(s => s.id === id))
    .filter(Boolean) as PokemonSet[];
  // Fill any missing popular sets by name
  if (popularSets.length < 4) {
    for (const name of popularSetNames) {
      const found = sets.find(s => s.name === name);
      if (found && !popularSets.find(s => s.id === found.id)) popularSets.push(found);
    }
  }

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

      {/* Most Popular Sets */}
      {popularSets.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-5">Most Popular Sets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSets.slice(0, 6).map(set => (
              <Link key={set.id} href={`/pokemon/sets/${set.id}`} className="group block">
                <div className="bg-gray-900 border border-yellow-900/40 hover:border-yellow-500/60 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5">
                  {set.images?.logo && (
                    <div className="h-10 flex items-center justify-center mb-2">
                      <Image src={set.images.logo} alt={set.name} width={80} height={40} className="object-contain max-h-10" />
                    </div>
                  )}
                  <p className="text-white text-xs font-semibold group-hover:text-yellow-400 transition-colors leading-tight">{set.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{set.total} cards</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Most Valuable Cards */}
      {valuableCards.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Most Valuable Cards</h2>
            <span className="text-gray-500 text-xs">Live prices from TCGPlayer &amp; Cardmarket</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {valuableCards.slice(0, 12).map(card => {
              const prices = card.tcgplayer?.prices;
              const price =
                prices?.['1stEditionHolofoil']?.market ??
                prices?.holofoil?.market ??
                prices?.normal?.market ??
                card.cardmarket?.prices?.averageSellPrice;
              return (
                <Link key={card.id} href={`/pokemon/cards/${card.id}`} className="group block">
                  <div className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-3 text-center transition-all hover:-translate-y-0.5">
                    {card.images?.small && (
                      <div className="h-24 flex items-center justify-center mb-2">
                        <Image src={card.images.small} alt={card.name} width={80} height={96} className="object-contain max-h-24 rounded" />
                      </div>
                    )}
                    <p className="text-white text-xs font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                    <p className="text-gray-500 text-xs truncate">{card.set?.name}</p>
                    {price && (
                      <p className="text-emerald-400 text-sm font-bold mt-1">${price.toFixed(2)}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
