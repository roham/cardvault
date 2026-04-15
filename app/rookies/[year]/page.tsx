import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardFrame from '@/components/CardFrame';

interface Props {
  params: Promise<{ year: string }>;
}

function getRookieYears(): number[] {
  const years = new Set<number>();
  for (const c of sportsCards) {
    if (c.rookie) years.add(c.year);
  }
  return [...years].sort((a, b) => b - a);
}

const allYears = getRookieYears();

export function generateStaticParams() {
  return allYears.map(y => ({ year: y.toString() }));
}

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

const sportConfig: Record<string, { label: string; emoji: string; color: string }> = {
  baseball: { label: 'Baseball', emoji: '⚾', color: 'text-red-400' },
  basketball: { label: 'Basketball', emoji: '🏀', color: 'text-orange-400' },
  football: { label: 'Football', emoji: '🏈', color: 'text-green-400' },
  hockey: { label: 'Hockey', emoji: '🏒', color: 'text-blue-400' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  const rookies = sportsCards.filter(c => c.rookie && c.year === year);
  if (rookies.length === 0) return { title: 'Year Not Found' };

  const sports = [...new Set(rookies.map(c => c.sport))];
  return {
    title: `${year} Rookie Cards — ${rookies.length} Cards Across ${sports.length} Sports`,
    description: `Browse all ${rookies.length} rookie cards from ${year}. ${sports.map(s => sportConfig[s]?.label || s).join(', ')} rookies with estimated values and links.`,
    openGraph: {
      title: `${year} Rookie Cards — CardVault`,
      description: `${rookies.length} rookie cards from ${year}.`,
      type: 'website',
    },
    alternates: { canonical: './' },
  };
}

export default async function RookieYearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  const rookies = sportsCards.filter(c => c.rookie && c.year === year).sort((a, b) => parseValue(b.estimatedValueGem) - parseValue(a.estimatedValueGem));
  if (rookies.length === 0) notFound();

  const sportCounts = new Map<string, number>();
  for (const c of rookies) sportCounts.set(c.sport, (sportCounts.get(c.sport) || 0) + 1);

  const prevYear = allYears.find(y => y < year);
  const nextYear = [...allYears].reverse().find(y => y > year);

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Rookie Cards', href: '/rookies' },
    { label: year.toString() },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${year} Rookie Cards`,
    description: `${rookies.length} rookie cards from ${year}.`,
    url: `https://cardvault-two.vercel.app/rookies/${year}`,
    numberOfItems: rookies.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: rookies.slice(0, 20).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://cardvault-two.vercel.app/sports/${c.slug}`,
        name: c.name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={jsonLd} />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          {prevYear ? (
            <Link href={`/rookies/${prevYear}`} className="text-sm text-blue-400 hover:text-blue-300">&larr; {prevYear}</Link>
          ) : <span />}
          {nextYear ? (
            <Link href={`/rookies/${nextYear}`} className="text-sm text-blue-400 hover:text-blue-300">{nextYear} &rarr;</Link>
          ) : <span />}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{year} Rookie Cards</h1>
        <p className="text-gray-400 mb-6">
          {rookies.length} rookie card{rookies.length !== 1 ? 's' : ''} across {[...sportCounts.keys()].map(s => sportConfig[s]?.label || s).join(', ')}.
          Sorted by estimated gem mint value.
        </p>

        {/* Sport Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[...sportCounts.entries()].map(([sport, count]) => {
            const cfg = sportConfig[sport];
            return (
              <span key={sport} className={`text-sm px-3 py-1 rounded-full bg-gray-800 ${cfg?.color || 'text-gray-400'}`}>
                {cfg?.emoji} {cfg?.label || sport} ({count})
              </span>
            );
          })}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rookies.map(card => {
            const cfg = sportConfig[card.sport];
            return (
              <Link
                key={card.slug}
                href={`/sports/${card.slug}`}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition group"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs ${cfg?.color || 'text-gray-400'}`}>{cfg?.emoji} {cfg?.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">RC</span>
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-blue-400 transition mb-2 leading-tight">
                    {card.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{card.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Raw</div>
                      <div className="font-medium text-gray-300">{card.estimatedValueRaw}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Gem Mint</div>
                      <div className="font-medium text-green-400">{card.estimatedValueGem}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Year Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {prevYear ? (
            <Link href={`/rookies/${prevYear}`} className="bg-gray-900 rounded-lg px-4 py-2 border border-gray-800 hover:border-gray-600 transition text-sm">
              &larr; {prevYear} Rookies
            </Link>
          ) : <span />}
          <Link href="/rookies" className="text-sm text-blue-400 hover:text-blue-300">All Years</Link>
          {nextYear ? (
            <Link href={`/rookies/${nextYear}`} className="bg-gray-900 rounded-lg px-4 py-2 border border-gray-800 hover:border-gray-600 transition text-sm">
              {nextYear} Rookies &rarr;
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
