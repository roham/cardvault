import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ cardId: string }>;
}

interface Attack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  attacks?: Attack[];
  weaknesses?: { type: string; value: string }[];
  resistances?: { type: string; value: string }[];
  retreatCost?: string[];
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
    printedTotal?: number;
    total?: number;
    images: { logo: string; symbol: string };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  images: { small: string; large: string };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      holofoil?: { low?: number; mid?: number; high?: number; market?: number };
      normal?: { low?: number; mid?: number; high?: number; market?: number };
      reverseHolofoil?: { low?: number; mid?: number; high?: number; market?: number };
      firstEditionHolofoil?: { low?: number; mid?: number; high?: number; market?: number };
      '1stEditionHolofoil'?: { low?: number; mid?: number; high?: number; market?: number };
    };
  };
}

interface RelatedCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: { small?: string };
  tcgplayer?: PokemonCard['tcgplayer'];
}

async function getCard(cardId: string): Promise<PokemonCard | null> {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedCards(setId: string, excludeId: string): Promise<RelatedCard[]> {
  try {
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=8&orderBy=number`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).filter((c: RelatedCard) => c.id !== excludeId).slice(0, 8);
  } catch {
    return [];
  }
}

function formatPrice(price?: number): string {
  if (price == null) return '—';
  return `$${price.toFixed(2)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  const card = await getCard(cardId);
  if (!card) return { title: 'Card Not Found' };
  return {
    title: `${card.name} — ${card.set.name}`,
    description: `${card.name} from ${card.set.name} (#${card.number}). ${card.rarity ?? ''}. Check TCGPlayer market price and card details.`,
  };
}

const typeColors: Record<string, string> = {
  Fire: 'bg-red-900/50 text-red-300',
  Water: 'bg-blue-900/50 text-blue-300',
  Grass: 'bg-green-900/50 text-green-300',
  Lightning: 'bg-yellow-900/50 text-yellow-300',
  Psychic: 'bg-purple-900/50 text-purple-300',
  Fighting: 'bg-orange-900/50 text-orange-300',
  Darkness: 'bg-gray-800 text-gray-300',
  Metal: 'bg-slate-800 text-slate-300',
  Dragon: 'bg-indigo-900/50 text-indigo-300',
  Fairy: 'bg-pink-900/50 text-pink-300',
  Colorless: 'bg-gray-700 text-gray-300',
};

export default async function PokemonCardPage({ params }: Props) {
  const { cardId } = await params;
  const card = await getCard(cardId);
  if (!card) notFound();

  const relatedCards = await getRelatedCards(card.set.id, card.id);

  const prices = card.tcgplayer?.prices;
  const priceEntries = prices
    ? Object.entries(prices).filter(([, v]) => v && typeof v === 'object')
    : [];

  const bestMarket = priceEntries.reduce<number | undefined>((best, [, v]) => {
    const m = (v as { market?: number }).market;
    if (m == null) return best;
    return best == null ? m : Math.max(best, m);
  }, undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Pokémon', href: '/pokemon' },
        { label: card.set.name, href: `/pokemon/sets/${card.set.id}` },
        { label: card.name },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Card image */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-[2.5/3.5] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
            {card.images?.large ? (
              <Image
                src={card.images.large}
                alt={card.name}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-contain p-2"
                priority
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <span className="text-4xl">⚡</span>
              </div>
            )}
          </div>
          {card.artist && (
            <p className="text-gray-500 text-xs mt-3">Illustrated by {card.artist}</p>
          )}
        </div>

        {/* Card details */}
        <div>
          {/* Types */}
          {card.types && card.types.length > 0 && (
            <div className="flex gap-2 mb-3">
              {card.types.map(type => (
                <span key={type} className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[type] ?? 'bg-gray-800 text-gray-300'}`}>
                  {type}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-white mb-1">{card.name}</h1>
          <p className="text-gray-400 mb-6">
            {card.set.name} · #{card.number}
            {card.rarity && ` · ${card.rarity}`}
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {card.hp && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">HP</p>
                <p className="text-white font-bold text-lg">{card.hp}</p>
              </div>
            )}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">Supertype</p>
              <p className="text-white font-semibold text-sm">{card.supertype}</p>
            </div>
            {card.evolvesFrom && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Evolves From</p>
                <p className="text-white font-semibold text-sm truncate">{card.evolvesFrom}</p>
              </div>
            )}
          </div>

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-3">Attacks</h2>
              <div className="space-y-2">
                {card.attacks.map(attack => (
                  <div key={attack.name} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {attack.cost && attack.cost.length > 0 && (
                          <div className="flex gap-0.5">
                            {attack.cost.map((c, i) => (
                              <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColors[c] ?? 'bg-gray-700 text-gray-300'}`}>{c.slice(0,1)}</span>
                            ))}
                          </div>
                        )}
                        <span className="text-white text-sm font-medium">{attack.name}</span>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold">{attack.damage || '—'}</span>
                    </div>
                    {attack.text && <p className="text-gray-400 text-xs leading-relaxed">{attack.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weakness / Resistance / Retreat */}
          {(card.weaknesses || card.resistances || card.retreatCost) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {card.weaknesses && card.weaknesses.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs mb-1.5">Weakness</p>
                  {card.weaknesses.map(w => (
                    <div key={w.type} className="flex items-center justify-center gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColors[w.type] ?? 'bg-gray-700 text-gray-300'}`}>{w.type}</span>
                      <span className="text-red-400 text-xs font-bold">{w.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {card.resistances && card.resistances.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs mb-1.5">Resistance</p>
                  {card.resistances.map(r => (
                    <div key={r.type} className="flex items-center justify-center gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColors[r.type] ?? 'bg-gray-700 text-gray-300'}`}>{r.type}</span>
                      <span className="text-emerald-400 text-xs font-bold">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {card.retreatCost && card.retreatCost.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs mb-1.5">Retreat Cost</p>
                  <div className="flex items-center justify-center gap-0.5">
                    {card.retreatCost.map((c, i) => (
                      <span key={i} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-medium">{c.slice(0,1)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Set completion */}
          {card.set.total && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Set Position</p>
                <p className="text-white text-sm font-bold">
                  #{card.number} of {card.set.printedTotal ?? card.set.total}
                </p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (parseInt(card.number) / (card.set.printedTotal ?? card.set.total)) * 100)}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {card.set.name} · {card.set.series} · Released {card.set.releaseDate}
              </p>
            </div>
          )}

          {/* Flavor text */}
          {card.flavorText && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6 italic">
              <p className="text-gray-400 text-sm leading-relaxed">&ldquo;{card.flavorText}&rdquo;</p>
            </div>
          )}

          {/* Price data */}
          {priceEntries.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white font-semibold">TCGPlayer Market Prices</h2>
                <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Live TCGPlayer data</span>
              </div>
              <p className="text-gray-600 text-xs mb-4">
                Updated with live marketplace data{card.tcgplayer?.updatedAt ? ` · ${card.tcgplayer.updatedAt}` : ''} · Source: TCGPlayer via Pokémon TCG API
              </p>
              {priceEntries.map(([variant, priceData]) => {
                const p = priceData as { low?: number; mid?: number; high?: number; market?: number };
                const label = variant
                  .replace('holofoil', 'Holofoil')
                  .replace('normal', 'Normal')
                  .replace('reverseHolofoil', 'Reverse Holofoil')
                  .replace('firstEditionHolofoil', '1st Ed. Holofoil')
                  .replace('1stEditionHolofoil', '1st Ed. Holofoil');
                return (
                  <div key={variant} className="mb-3 last:mb-0">
                    <p className="text-gray-400 text-xs font-medium mb-2">{label}</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {(['low', 'mid', 'high', 'market'] as const).map(tier => (
                        <div key={tier} className="bg-gray-800/60 rounded-lg py-2">
                          <p className="text-gray-500 text-xs capitalize mb-0.5">{tier}</p>
                          <p className={`text-sm font-semibold ${tier === 'market' ? 'text-emerald-400' : 'text-white'}`}>
                            {formatPrice(p[tier])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {bestMarket && (
            <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-5 py-3 mb-6">
              <span className="text-gray-300 text-sm">Market Price</span>
              <span className="text-emerald-400 text-xl font-bold">${bestMarket.toFixed(2)}</span>
            </div>
          )}

          {/* Buy / verify links */}
          <div className="space-y-3">
            <a
              href={`https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Buy on TCGPlayer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <a
              href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' ' + card.set.name)}&LH_Complete=1&LH_Sold=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-3.5 rounded-xl transition-colors border border-gray-700"
            >
              Check eBay Sold Listings
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Related cards */}
      {relatedCards.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">More from {card.set.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {relatedCards.map(rc => (
              <Link key={rc.id} href={`/pokemon/cards/${rc.id}`} className="group block">
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all p-2">
                  <div className="relative aspect-[2.5/3.5] bg-gray-800 rounded-lg overflow-hidden mb-2">
                    {rc.images?.small ? (
                      <Image
                        src={rc.images.small}
                        alt={rc.name}
                        fill
                        sizes="120px"
                        className="object-contain group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600 text-lg">⚡</div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium text-center truncate group-hover:text-emerald-400 transition-colors">{rc.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href={`/pokemon/sets/${card.set.id}`} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
              View full {card.set.name} set →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
