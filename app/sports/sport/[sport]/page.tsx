import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardFrame from '@/components/CardFrame';

const sportMeta: Record<string, { label: string; emoji: string; color: string; borderColor: string; bgColor: string; description: string }> = {
  baseball: {
    label: 'Baseball',
    emoji: '⚾',
    color: 'text-red-400',
    borderColor: 'border-red-800/40',
    bgColor: 'from-red-950/40 to-gray-950',
    description: 'From the T206 Honus Wagner to modern Topps Chrome rookies. Baseball cards are the original collectibles — spanning over 130 years of America\'s pastime.',
  },
  basketball: {
    label: 'Basketball',
    emoji: '🏀',
    color: 'text-orange-400',
    borderColor: 'border-orange-800/40',
    bgColor: 'from-orange-950/40 to-gray-950',
    description: 'From the 1986 Fleer Michael Jordan to Wembanyama\'s Prizm rookie. Basketball cards are the fastest-growing segment of the hobby.',
  },
  football: {
    label: 'Football',
    emoji: '🏈',
    color: 'text-green-400',
    borderColor: 'border-green-800/40',
    bgColor: 'from-green-950/40 to-gray-950',
    description: 'From vintage Topps legends to modern Prizm rookies. Football cards peak every September and spike with every playoff highlight.',
  },
  hockey: {
    label: 'Hockey',
    emoji: '🏒',
    color: 'text-blue-400',
    borderColor: 'border-blue-800/40',
    bgColor: 'from-blue-950/40 to-gray-950',
    description: 'From Gretzky\'s 1979 OPC rookie to McDavid\'s Young Guns. Hockey cards are the most undervalued segment with massive upside.',
  },
};

const validSports = ['baseball', 'basketball', 'football', 'hockey'];

export function generateStaticParams() {
  return validSports.map(sport => ({ sport }));
}

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  const meta = sportMeta[sport];
  if (!meta) return {};

  const cards = sportsCards.filter(c => c.sport === sport);
  return {
    title: `${meta.label} Cards — Browse ${cards.length}+ Cards with Prices`,
    description: `${meta.description} Browse ${cards.length}+ ${meta.label.toLowerCase()} cards with estimated values, player profiles, and comparison tools.`,
    openGraph: {
      title: `${meta.label} Cards — CardVault`,
      description: `Browse ${cards.length}+ ${meta.label.toLowerCase()} cards with estimated values.`,
      type: 'website',
    },
    alternates: { canonical: './' },
  };
}

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface PlayerStats {
  name: string;
  slug: string;
  cardCount: number;
  topCard: SportsCard;
  totalValue: number;
  yearRange: [number, number];
  hasRookie: boolean;
}

function getTopPlayers(cards: SportsCard[], limit: number): PlayerStats[] {
  const map = new Map<string, PlayerStats>();
  for (const card of cards) {
    const slug = slugify(card.player);
    const existing = map.get(slug);
    const val = parseValue(card.estimatedValueRaw);
    if (existing) {
      existing.cardCount++;
      existing.totalValue += val;
      if (val > parseValue(existing.topCard.estimatedValueRaw)) {
        existing.topCard = card;
      }
      if (card.year < existing.yearRange[0]) existing.yearRange[0] = card.year;
      if (card.year > existing.yearRange[1]) existing.yearRange[1] = card.year;
      if (card.rookie) existing.hasRookie = true;
    } else {
      map.set(slug, {
        name: card.player,
        slug,
        cardCount: 1,
        topCard: card,
        totalValue: val,
        yearRange: [card.year, card.year],
        hasRookie: card.rookie,
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
}

export default async function SportHubPage({ params }: Props) {
  const { sport } = await params;
  const meta = sportMeta[sport];
  if (!meta) notFound();

  const cards = sportsCards.filter(c => c.sport === sport);
  const topPlayers = getTopPlayers(cards, 12);
  const uniquePlayers = new Set(cards.map(c => c.player)).size;
  const uniqueSets = new Set(cards.map(c => c.set)).size;
  const rookieCards = cards.filter(c => c.rookie);
  const vintageCards = cards.filter(c => c.year < 1970).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
  const modernCards = cards.filter(c => c.year >= 2020).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
  const highValueCards = [...cards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, 6);
  const decades = new Map<string, number>();
  for (const card of cards) {
    const decade = `${Math.floor(card.year / 10) * 10}s`;
    decades.set(decade, (decades.get(decade) || 0) + 1);
  }
  const decadeList = [...decades.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Sports Cards', href: '/sports' },
    { label: meta.label },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${meta.label} Cards Price Guide`,
        description: `Browse ${cards.length}+ ${meta.label.toLowerCase()} cards with estimated values.`,
        url: `https://cardvault-two.vercel.app/sports/sport/${sport}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: cards.length,
          itemListElement: highValueCards.map((card, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://cardvault-two.vercel.app/sports/${card.slug}`,
            name: card.name,
          })),
        },
      }} />

      {/* Hero */}
      <div className={`bg-gradient-to-br ${meta.bgColor} border ${meta.borderColor} rounded-2xl p-6 sm:p-8 mb-10`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{meta.emoji}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{meta.label} Cards</h1>
        </div>
        <p className="text-gray-300 text-lg max-w-3xl leading-relaxed mb-6">{meta.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-950/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${meta.color}`}>{cards.length}</p>
            <p className="text-gray-500 text-xs mt-1">Cards</p>
          </div>
          <div className="bg-gray-950/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${meta.color}`}>{uniquePlayers}</p>
            <p className="text-gray-500 text-xs mt-1">Players</p>
          </div>
          <div className="bg-gray-950/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${meta.color}`}>{uniqueSets}</p>
            <p className="text-gray-500 text-xs mt-1">Sets</p>
          </div>
          <div className="bg-gray-950/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${meta.color}`}>{rookieCards.length}</p>
            <p className="text-gray-500 text-xs mt-1">Rookie Cards</p>
          </div>
        </div>
      </div>

      {/* Most Valuable */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Most Valuable {meta.label} Cards</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {highValueCards.map(card => (
            <Link key={card.slug} href={`/sports/${card.slug}`} className="group">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-all hover:-translate-y-0.5">
                <div className="flex justify-center mb-2">
                  <div className="w-20">
                    <CardFrame card={card} size="small" />
                  </div>
                </div>
                <p className="text-white text-xs font-semibold text-center truncate group-hover:text-emerald-400 transition-colors">{card.player}</p>
                <p className="text-gray-500 text-[10px] text-center truncate">{card.year} {card.set.split(' ').slice(1, 3).join(' ')}</p>
                <p className="text-emerald-400 text-xs font-bold text-center mt-1">{card.estimatedValueRaw}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Players */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Top {meta.label} Players</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topPlayers.map((player, i) => (
            <Link key={player.slug} href={`/players/${player.slug}`} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-all group">
              <span className="text-gray-600 text-sm font-bold w-6 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{player.name}</p>
                <p className="text-gray-500 text-xs">{player.cardCount} cards · {player.yearRange[0]}–{player.yearRange[1]}{player.hasRookie ? ' · RC' : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-emerald-400 text-xs font-bold">${player.totalValue.toLocaleString()}+</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link href={`/players?sport=${sport}`} className="text-gray-400 text-sm hover:text-white transition-colors">
            View all {uniquePlayers} {meta.label.toLowerCase()} players &rarr;
          </Link>
        </div>
      </section>

      {/* Decade breakdown */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Cards by Decade</h2>
        <div className="flex flex-wrap gap-2">
          {decadeList.map(([decade, count]) => (
            <Link
              key={decade}
              href={`/sports/year/${decade.replace('s', '')}`}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 hover:border-gray-700 transition-colors"
            >
              <span className="text-white text-sm font-medium">{decade}</span>
              <span className="text-gray-500 text-xs ml-2">{count} cards</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Vintage Highlights */}
      {vintageCards.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Vintage {meta.label} Cards (Pre-1970)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {vintageCards.slice(0, 8).map(card => (
              <Link key={card.slug} href={`/sports/${card.slug}`} className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-all group">
                <p className="text-white text-xs font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                <p className="text-gray-500 text-[10px] truncate">{card.player}</p>
                <p className="text-emerald-400 text-xs font-bold mt-1">{card.estimatedValueRaw}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Modern Cards */}
      {modernCards.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Modern {meta.label} Cards (2020+)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {modernCards.slice(0, 8).map(card => (
              <Link key={card.slug} href={`/sports/${card.slug}`} className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-all group">
                <p className="text-white text-xs font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                <p className="text-gray-500 text-[10px] truncate">{card.player}</p>
                <p className="text-emerald-400 text-xs font-bold mt-1">{card.estimatedValueRaw}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tools & Features */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{meta.label} Card Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', title: 'Grading ROI Calculator', desc: 'Should you grade this card? See ROI by grading company.' },
            { href: '/tools/pack-sim', title: 'Pack Simulator', desc: `Open simulated ${meta.label.toLowerCase()} packs with real hit rates.` },
            { href: '/tools/price-history', title: 'Price History', desc: '90-day price trends for any card.' },
            { href: '/tools/head-to-head', title: 'Head-to-Head', desc: 'Compare any two cards side-by-side.' },
            { href: '/tools/identify', title: 'Card Identifier', desc: 'Search by player, year, or set to find any card.' },
            { href: `/sports/compare`, title: 'Player Comparisons', desc: `Compare ${meta.label.toLowerCase()} players head-to-head.` },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group">
              <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{tool.title}</p>
              <p className="text-gray-500 text-xs mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse All */}
      <div className="p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">Browse More</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/sports" className="text-emerald-400 hover:text-emerald-300 transition-colors">All Sports Cards &rarr;</Link>
          <Link href="/sports/sets" className="text-emerald-400 hover:text-emerald-300 transition-colors">Browse by Set &rarr;</Link>
          <Link href="/players" className="text-emerald-400 hover:text-emerald-300 transition-colors">All Players &rarr;</Link>
          <Link href="/sports/year" className="text-emerald-400 hover:text-emerald-300 transition-colors">Browse by Year &rarr;</Link>
          <Link href="/sports/compare" className="text-emerald-400 hover:text-emerald-300 transition-colors">Player Comparisons &rarr;</Link>
          <Link href="/market-report" className="text-emerald-400 hover:text-emerald-300 transition-colors">Market Report &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
