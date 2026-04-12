import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, getCardsBySlug, getCardsBySport } from '@/data/sports-cards';
import Breadcrumb from '@/components/Breadcrumb';
import SportsCardTile from '@/components/SportsCardTile';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return sportsCards.map(card => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardsBySlug(slug);
  if (!card) return { title: 'Card Not Found' };
  return {
    title: card.name,
    description: card.description,
  };
}

const sportColors: Record<string, string> = {
  baseball: 'from-red-950 via-red-900 to-gray-900',
  basketball: 'from-orange-950 via-orange-900 to-gray-900',
  football: 'from-blue-950 via-blue-900 to-gray-900',
  hockey: 'from-cyan-950 via-cyan-900 to-gray-900',
};

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const sportBadgeColor: Record<string, string> = {
  baseball: 'bg-red-900/50 text-red-300',
  basketball: 'bg-orange-900/50 text-orange-300',
  football: 'bg-blue-900/50 text-blue-300',
  hockey: 'bg-cyan-900/50 text-cyan-300',
};

export default async function SportsCardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardsBySlug(slug);
  if (!card) notFound();

  const relatedCards = getCardsBySport(card.sport)
    .filter(c => c.slug !== card.slug)
    .slice(0, 8);

  const sportLabel = card.sport.charAt(0).toUpperCase() + card.sport.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Sports Cards', href: '/sports' },
        { label: sportLabel, href: `/sports#${card.sport}` },
        { label: card.player },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Card display */}
        <div className="flex flex-col items-center">
          <div className={`relative w-full max-w-sm aspect-[2.5/3.5] rounded-2xl bg-gradient-to-br ${sportColors[card.sport]} flex flex-col items-center justify-center p-8 shadow-2xl`}>
            <div className="text-8xl mb-4">{sportIcons[card.sport]}</div>
            <div className="text-center">
              <p className="text-white font-bold text-2xl">{card.player}</p>
              <p className="text-gray-300 text-base mt-1">{card.year}</p>
              <p className="text-gray-400 text-sm mt-2">{card.set}</p>
            </div>
            {card.rookie && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                ROOKIE
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-gray-500 text-xs">#{card.cardNumber}</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3 text-center">Placeholder — actual card image varies by condition and edition</p>
        </div>

        {/* Card details */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${sportBadgeColor[card.sport]}`}>
              {sportIcons[card.sport]} {card.sport}
            </span>
            {card.rookie && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-400">
                Rookie Card
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{card.name}</h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8">{card.description}</p>

          {/* Card info grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'Player', value: card.player },
              { label: 'Year', value: card.year.toString() },
              { label: 'Set', value: card.set },
              { label: 'Card #', value: card.cardNumber },
              { label: 'Sport', value: sportLabel },
              { label: 'Type', value: card.rookie ? 'Rookie Card' : 'Base Card' },
            ].map(item => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Value estimates */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-4">Estimated Value</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400 text-sm">Mid Grade (PSA 7–8)</span>
                <span className="text-emerald-400 font-semibold">{card.estimatedValueRaw}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400 text-sm">Gem Mint (PSA 9–10)</span>
                <span className="text-emerald-400 font-semibold">{card.estimatedValueGem}</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs mt-3">
              Estimates based on recent sold comps. Actual value depends on grade, centering, and market conditions.
            </p>
          </div>

          {/* CTA */}
          <a
            href={card.ebaySearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Search on eBay
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Related cards */}
      {relatedCards.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">More {sportLabel} Cards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedCards.map(c => (
              <SportsCardTile key={c.slug} card={c} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/sports#${card.sport}`} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
              View all {sportLabel} cards →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
