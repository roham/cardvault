import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, getCardsBySlug, getCardsBySport } from '@/data/sports-cards';
import { getGradePricing } from '@/data/grade-pricing';
import { getPsaPopulation } from '@/data/psa-populations';
import Breadcrumb from '@/components/Breadcrumb';
import SportsCardTile from '@/components/SportsCardTile';
import CardFrame from '@/components/CardFrame';

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

const trendIcon = (trend: 'up' | 'down' | 'flat') => {
  if (trend === 'up') return <span className="text-emerald-400 text-xs">↑</span>;
  if (trend === 'down') return <span className="text-red-400 text-xs">↓</span>;
  return <span className="text-gray-500 text-xs">→</span>;
};

export default async function SportsCardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardsBySlug(slug);
  if (!card) notFound();

  const relatedCards = getCardsBySport(card.sport)
    .filter(c => c.slug !== card.slug)
    .slice(0, 8);

  const sportLabel = card.sport.charAt(0).toUpperCase() + card.sport.slice(1);
  const gradePricing = getGradePricing(slug);
  const psaPop = getPsaPopulation(slug);

  const ebaySearchBase = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name)}&LH_Complete=1&LH_Sold=1`;
  const psaCertUrl = `https://www.psacard.com/smrpriceguide/`;
  const comcUrl = `https://www.comc.com/Cards/Sport,${card.sport.charAt(0).toUpperCase() + card.sport.slice(1)}/View,list/?q=${encodeURIComponent(card.player)}`;

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
          <div className="w-full max-w-sm">
            <CardFrame card={card} size="large" />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-gray-500 text-xs text-center">Stylized illustration — actual card image varies by edition</p>
            <a
              href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' PSA')}&LH_Complete=1&LH_Sold=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              View sold images on eBay
            </a>
          </div>
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

          {/* CTAs */}
          <div className="space-y-3">
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
            <Link
              href="/tools#grade-calc"
              className="inline-flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-3.5 rounded-xl transition-colors border border-gray-700"
            >
              Grade Value Calculator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Grade-by-Grade Pricing Table */}
      {gradePricing && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Grade-by-Grade Pricing</h2>
            <span className="text-gray-500 text-xs">The #1 thing collectors want to know</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">PSA Grade</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Label</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Est. Value</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Pop.</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {gradePricing.grades.map((row, i) => (
                    <tr
                      key={row.grade}
                      className={`border-b border-gray-800/50 transition-colors ${row.grade === gradePricing.sweetSpot ? 'bg-emerald-950/30' : i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${row.grade === gradePricing.sweetSpot ? 'text-emerald-400' : 'text-white'}`}>PSA {row.grade}</span>
                          {row.grade === gradePricing.sweetSpot && (
                            <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs px-1.5 py-0.5 rounded font-medium">Best Value</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{row.label}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold text-sm">{row.estimatedValue}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {row.population !== undefined ? row.population.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">{trendIcon(row.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <p className="text-gray-600 text-xs">
                Source: {gradePricing.sourceName} · {gradePricing.sourceNote}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PSA Population Report */}
      {psaPop && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-4">PSA Population Report</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Total Graded', value: psaPop.totalGraded.toLocaleString(), color: 'text-white' },
              { label: 'PSA 10 Count', value: psaPop.psa10Count.toLocaleString(), color: 'text-emerald-400' },
              { label: 'PSA 9 Count', value: psaPop.psa9Count.toLocaleString(), color: 'text-blue-400' },
              { label: 'Gem Rate', value: `${psaPop.gemRate}%`, color: psaPop.gemRate < 2 ? 'text-amber-400' : 'text-gray-300' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          {/* Population bar chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Grade Distribution</h3>
            <div className="space-y-2">
              {[
                { label: 'PSA 10', count: psaPop.psa10Count, color: 'bg-emerald-500' },
                { label: 'PSA 9', count: psaPop.psa9Count, color: 'bg-blue-500' },
                { label: 'PSA 8', count: psaPop.psa8Count, color: 'bg-indigo-500' },
                { label: 'PSA 1–7', count: Math.max(0, psaPop.totalGraded - psaPop.psa10Count - psaPop.psa9Count - psaPop.psa8Count), color: 'bg-gray-600' },
              ].map(bar => {
                const pct = psaPop.totalGraded > 0 ? Math.round((bar.count / psaPop.totalGraded) * 100) : 0;
                return (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-14 shrink-0">{bar.label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs w-20 text-right shrink-0">{bar.count.toLocaleString()} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
            <p className="text-gray-600 text-xs mt-4">
              Gem Rate (% achieving PSA 10): <span className="text-amber-400 font-semibold">{psaPop.gemRate}%</span>
              {psaPop.gemRate < 2 ? ' — Extremely difficult to gem.' : psaPop.gemRate < 5 ? ' — Challenging to gem.' : ' — Achievable in near-perfect condition.'}
            </p>
          </div>
        </section>
      )}

      {/* External Resources */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">Research This Card</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'eBay Sold Listings', url: ebaySearchBase, icon: '🔍', desc: 'Real transaction prices' },
            { label: 'PSA Cert Lookup', url: psaCertUrl, icon: '🏅', desc: 'Verify grades & fakes' },
            { label: 'COMC Marketplace', url: comcUrl, icon: '🃏', desc: 'Buy/sell singles' },
            { label: 'CardLadder', url: `https://www.cardladder.com/search?q=${encodeURIComponent(card.player)}`, icon: '📈', desc: 'Price trend charts' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center bg-gray-900 border border-gray-800 hover:border-emerald-500/40 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5"
            >
              <span className="text-2xl mb-2">{link.icon}</span>
              <span className="text-white text-xs font-semibold group-hover:text-emerald-400 transition-colors">{link.label}</span>
              <span className="text-gray-500 text-xs mt-0.5">{link.desc}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Internal guide links */}
      <section className="mb-14 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">Useful Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides/grading-guide" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            PSA vs BGS vs SGC Comparison →
          </Link>
          <Link href="/guides/investing-101" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            Sports Card Investing 101 →
          </Link>
          <Link href="/guides/when-to-grade-your-cards" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            When to Grade Your Cards →
          </Link>
          <Link href="/guides/how-to-read-price-data" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            How to Read Price Data →
          </Link>
        </div>
      </section>

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
