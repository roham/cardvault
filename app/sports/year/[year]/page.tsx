import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, SportsCard } from '@/data/sports-cards';
import SportsCardTile from '@/components/SportsCardTile';
import JsonLd from '@/components/JsonLd';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

const sportLabel: Record<Sport, string> = { baseball: 'Baseball', basketball: 'Basketball', football: 'Football', hockey: 'Hockey' };
const sportColor: Record<Sport, string> = { baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400' };

function getUniqueYears(): number[] {
  return [...new Set(sportsCards.map(c => c.year))].sort((a, b) => b - a);
}

const allYears = getUniqueYears();

function eraLabel(year: number): string {
  if (year < 1941) return 'Pre-War Era';
  if (year < 1960) return 'Post-War / Golden Age';
  if (year < 1980) return 'Vintage';
  if (year < 1993) return 'Junk Wax Era';
  if (year < 2005) return 'Post-Junk Wax';
  if (year < 2015) return 'Modern';
  return 'Ultra-Modern';
}

function eraContext(year: number): string {
  if (year < 1920) return 'Tobacco and candy companies produced the earliest trading cards as product inserts.';
  if (year < 1941) return 'Pre-war cards from this period are among the rarest and most valuable in the hobby.';
  if (year < 1953) return 'Bowman dominated the early post-war market before Topps entered the scene.';
  if (year < 1970) return 'The golden age of baseball cards with iconic Topps designs and legendary players.';
  if (year < 1981) return 'The vintage era produced beautiful card designs with limited print runs.';
  if (year < 1987) return 'The early 1980s saw the rise of Fleer and Donruss to compete with Topps.';
  if (year < 1994) return 'The junk wax era saw massive overproduction — billions of cards printed, most worth little today. Key exceptions exist.';
  if (year < 2000) return 'Premium brands like SP, Finest, and Chrome emerged as the hobby pivoted from quantity to quality.';
  if (year < 2010) return 'The modern era brought autographs, memorabilia cards, and numbered parallels as standard features.';
  if (year < 2020) return 'Prizm, Optic, and Chrome became the flagship products. The hobby entered a new golden age.';
  return 'The ultra-modern era. Record-breaking prices, mainstream attention, and unprecedented demand for rookie cards.';
}

interface Props {
  params: Promise<{ year: string }>;
}

export function generateStaticParams(): Array<{ year: string }> {
  return allYears.map(y => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!allYears.includes(year)) return { title: 'Year Not Found' };
  const cards = sportsCards.filter(c => c.year === year);
  const rookieCount = cards.filter(c => c.rookie).length;
  return {
    title: `${year} Sports Cards — ${cards.length} Cards, Values & Checklist`,
    description: `Browse all ${cards.length} sports cards from ${year} in CardVault. ${rookieCount} rookie cards. ${eraLabel(year)} era. Prices, sets, and player details.`,
    alternates: { canonical: './' },
  };
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!allYears.includes(year)) notFound();

  const cards = sportsCards.filter(c => c.year === year);
  const sports = [...new Set(cards.map(c => c.sport))] as Sport[];
  const sets = [...new Set(cards.map(c => c.set))];
  const rookieCount = cards.filter(c => c.rookie).length;

  const cardsBySport: Record<string, SportsCard[]> = {};
  for (const sport of sports) {
    cardsBySport[sport] = cards.filter(c => c.sport === sport);
  }

  // Adjacent years for navigation
  const yearIdx = allYears.indexOf(year);
  const prevYear = yearIdx < allYears.length - 1 ? allYears[yearIdx + 1] : null;
  const nextYear = yearIdx > 0 ? allYears[yearIdx - 1] : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
      { '@type': 'ListItem', position: 2, name: 'Browse by Year', item: 'https://cardvault-two.vercel.app/sports/year' },
      { '@type': 'ListItem', position: 3, name: String(year) },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${year} Sports Cards`,
    description: `${cards.length} sports cards from ${year}. ${eraLabel(year)} era.`,
    numberOfItems: cards.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
        <span>/</span>
        <Link href="/sports/year" className="hover:text-gray-300 transition-colors">Browse by Year</Link>
        <span>/</span>
        <span className="text-gray-300">{year}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{year} Sports Cards</h1>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-400">
            {eraLabel(year)}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-2">
          {cards.length} card{cards.length > 1 ? 's' : ''} tracked across {sets.length} set{sets.length > 1 ? 's' : ''}.
          {rookieCount > 0 && <> <span className="text-emerald-400">{rookieCount} rookie card{rookieCount > 1 ? 's' : ''}</span>.</>}
        </p>
        <p className="text-gray-500 text-sm">{eraContext(year)}</p>
      </div>

      {/* Year navigation */}
      <div className="flex items-center gap-4 mb-8">
        {prevYear && (
          <Link href={`/sports/year/${prevYear}`} className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; {prevYear}
          </Link>
        )}
        <span className="text-gray-600">|</span>
        {nextYear && (
          <Link href={`/sports/year/${nextYear}`} className="text-sm text-gray-400 hover:text-white transition-colors">
            {nextYear} &rarr;
          </Link>
        )}
      </div>

      {/* Cards by sport */}
      {sports.map(sport => (
        <section key={sport} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className={`text-lg font-bold ${sportColor[sport]}`}>{sportLabel[sport]}</h2>
            <span className="text-gray-500 text-sm">({cardsBySport[sport].length} cards)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cardsBySport[sport].map(card => (
              <SportsCardTile key={card.slug} card={card} />
            ))}
          </div>
        </section>
      ))}

      {/* Sets from this year */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">Sets from {year}</h2>
        <div className="flex flex-wrap gap-2">
          {sets.map(setName => {
            const setSlug = setName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const count = cards.filter(c => c.set === setName).length;
            return (
              <Link
                key={setSlug}
                href={`/sports/sets/${setSlug}`}
                className="text-xs bg-gray-900 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                {setName} ({count})
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-800">
        <div className="flex flex-wrap gap-4">
          <Link href="/sports/year" className="text-emerald-400 text-sm hover:text-emerald-300">All years</Link>
          <Link href="/sports/sets" className="text-gray-400 text-sm hover:text-gray-300">Browse by set</Link>
          <Link href="/sports/compare" className="text-gray-400 text-sm hover:text-gray-300">Compare players</Link>
          <Link href="/sports" className="text-gray-400 text-sm hover:text-gray-300">All sports cards</Link>
        </div>
      </div>
    </div>
  );
}
