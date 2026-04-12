import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import PokemonCardTile from '@/components/PokemonCardTile';

interface Props {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  images: { logo: string; symbol: string };
}

interface PokemonCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: { small?: string; large?: string };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
      reverseHolofoil?: { market?: number };
    };
  };
  set?: { id: string; name: string };
}

const PAGE_SIZE = 60;

async function getSet(setId: string): Promise<PokemonSet | null> {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/sets/${setId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

async function getCards(setId: string, page: number): Promise<{ cards: PokemonCard[]; totalCount: number }> {
  try {
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${PAGE_SIZE}&orderBy=number`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { cards: [], totalCount: 0 };
    const data = await res.json();
    return { cards: data.data ?? [], totalCount: data.totalCount ?? 0 };
  } catch {
    return { cards: [], totalCount: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setId } = await params;
  const set = await getSet(setId);
  if (!set) return { title: 'Set Not Found' };
  return {
    title: `${set.name} — Pokémon TCG Set`,
    description: `Browse all ${set.total} cards from Pokémon TCG: ${set.name} (${set.series}, ${set.releaseDate}). Check prices and card details.`,
  };
}

export default async function PokemonSetPage({ params, searchParams }: Props) {
  const { setId } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));

  const [set, { cards, totalCount }] = await Promise.all([
    getSet(setId),
    getCards(setId, page),
  ]);

  if (!set) notFound();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Pokémon', href: '/pokemon' },
        { label: set.name },
      ]} />

      {/* Set header */}
      <div className="flex items-start gap-6 mb-10">
        {set.images?.logo && (
          <div className="relative w-32 h-16 shrink-0">
            <Image
              src={set.images.logo}
              alt={set.name}
              fill
              sizes="128px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div>
          <p className="text-gray-400 text-sm mb-1">{set.series}</p>
          <h1 className="text-3xl font-bold text-white mb-2">{set.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>Released: {set.releaseDate}</span>
            <span>·</span>
            <span>{set.total} cards total</span>
            {totalCount > 0 && totalCount !== set.total && (
              <>
                <span>·</span>
                <span>Showing {totalCount} with prices</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No card data available</p>
          <p className="text-sm">This may be a region-specific set or data may be temporarily unavailable.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {cards.map(card => (
              <PokemonCardTile key={card.id} card={card} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <a
                  href={`/pokemon/sets/${setId}?page=${page - 1}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  ← Previous
                </a>
              )}
              <span className="text-gray-400 text-sm px-4">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/pokemon/sets/${setId}?page=${page + 1}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
