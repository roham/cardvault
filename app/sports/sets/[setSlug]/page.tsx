import { sportsCards, SportsCard } from '@/data/sports-cards';
import SportsCardTile from '@/components/SportsCardTile';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function setSlug(setName: string): string {
  return setName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Pre-build list of all unique set slugs for SSG
export function generateStaticParams(): Array<{ setSlug: string }> {
  const seen = new Set<string>();
  return sportsCards
    .map(card => setSlug(card.set))
    .filter(slug => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map(slug => ({ setSlug: slug }));
}

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

const sportLabel: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};

const sportColor: Record<Sport, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const eraLabel = (year: number): string => {
  if (year < 1941) return 'Pre-War';
  if (year < 1970) return 'Golden Age';
  if (year < 1986) return 'Bronze Age';
  if (year < 2000) return 'Junk Wax Era';
  if (year < 2015) return 'Modern';
  return 'Ultra-Modern';
};

interface Props {
  params: Promise<{ setSlug: string }>;
}

export default async function SetPage({ params }: Props) {
  const { setSlug: slug } = await params;

  const cards = sportsCards.filter(c => setSlug(c.set) === slug);
  if (cards.length === 0) notFound();

  const setName = cards[0].set;
  const year = cards[0].year;
  const sports = [...new Set(cards.map(c => c.sport))] as Sport[];
  const rookieCount = cards.filter(c => c.rookie).length;

  const cardsBySport = sports.reduce<Record<string, SportsCard[]>>((acc, sport) => {
    acc[sport] = cards.filter(c => c.sport === sport);
    return acc;
  }, {});

  const manufacturers: Record<string, string> = {
    Topps: 'Topps (Fanatics)',
    Panini: 'Panini America',
    'Upper Deck': 'Upper Deck',
    Bowman: 'Topps / Bowman',
    Fleer: 'Fleer',
    Donruss: 'Donruss / Panini',
    Prizm: 'Panini Prizm',
    Chrome: 'Topps Chrome',
    'O-Pee-Chee': 'O-Pee-Chee (Upper Deck)',
    Parkhurst: 'Parkhurst',
    Star: 'Star Co.',
    SP: 'Upper Deck SP',
    Goudey: 'Goudey Gum Co.',
    Score: 'Score',
    Pacific: 'Pacific Trading Cards',
  };

  function getMfr(name: string): string {
    for (const [key, val] of Object.entries(manufacturers)) {
      if (name.includes(key)) return val;
    }
    return 'Unknown Manufacturer';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
        <span>/</span>
        <Link href="/sports/sets" className="hover:text-gray-300 transition-colors">Browse by Set</Link>
        <span>/</span>
        <span className="text-gray-300">{setName}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{setName}</h1>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-400">
            {eraLabel(year)}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>{year}</span>
          <span>{getMfr(setName)}</span>
          <span>{cards.length} card{cards.length > 1 ? 's' : ''} tracked</span>
          {rookieCount > 0 && (
            <span className="text-emerald-400">{rookieCount} rookie card{rookieCount > 1 ? 's' : ''}</span>
          )}
          {sports.map(s => (
            <span key={s} className={sportColor[s]}>{sportLabel[s]}</span>
          ))}
        </div>
      </div>

      {/* Cards by sport */}
      {sports.map(sport => (
        <div key={sport} className="mb-10">
          {sports.length > 1 && (
            <h2 className={`text-lg font-bold mb-4 ${sportColor[sport]}`}>{sportLabel[sport]}</h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cardsBySport[sport].map(card => (
              <SportsCardTile key={card.slug} card={card} />
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div className="mt-12 pt-6 border-t border-gray-800">
        <p className="text-gray-600 text-sm">
          Showing {cards.length} tracked card{cards.length > 1 ? 's' : ''} from the {setName} set. 
          CardVault covers iconic and high-value cards — not the complete checklist.
        </p>
        <div className="mt-3 flex gap-4">
          <Link href="/sports/sets" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
            Browse all sets
          </Link>
          <Link href="/sports" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
            All sports cards
          </Link>
        </div>
      </div>
    </div>
  );
}
