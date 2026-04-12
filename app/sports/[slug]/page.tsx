import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, getCardsBySlug, getCardsBySport } from '@/data/sports-cards';
import { getGradePricing } from '@/data/grade-pricing';
import { getPsaPopulation } from '@/data/psa-populations';
import { getNotableSales } from '@/data/notable-sales';
import { getCardVariations } from '@/data/card-variations';
import Breadcrumb from '@/components/Breadcrumb';
import SportsCardTile from '@/components/SportsCardTile';
import CardFrame from '@/components/CardFrame';
import CopyLinkButton from '@/components/CopyLinkButton';

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
  const notableSalesData = getNotableSales(slug);
  const variationsData = getCardVariations(slug);

  const ebaySearchBase = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name)}&LH_Complete=1&LH_Sold=1`;
  const comcUrl = `https://www.comc.com/Cards/Sport,${card.sport.charAt(0).toUpperCase() + card.sport.slice(1)}/View,list/?q=${encodeURIComponent(card.player)}`;

  const ebayImagesUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' PSA graded')}&LH_Complete=1&LH_Sold=1&_udlo=100`;
  const psaPopUrl = `https://www.psacard.com/pop/`;
  const psaCertLookup = `https://www.psacard.com/cert/`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Sports Cards', href: '/sports' },
        { label: sportLabel, href: `/sports#${card.sport}` },
        { label: card.player },
      ]} />

      {/* Card Images Section */}
      <div className="mb-10 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          <h2 className="text-white font-semibold text-sm">Card Images</h2>
          <span className="text-gray-500 text-xs ml-auto">Real photos from verified sellers</span>
        </div>
        <div className="p-5">
          <p className="text-gray-400 text-sm mb-4">
            View real photos of this card from authenticated sellers and recent auction results. Images show actual condition — useful for grading research.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'eBay — PSA Graded',
                url: ebayImagesUrl,
                desc: 'Sold PSA copies with photos',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                ),
                color: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:border-emerald-600/60',
              },
              {
                label: 'eBay — Raw Copies',
                url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name)}&LH_Complete=1&LH_Sold=1`,
                desc: 'Ungraded sold listings',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                ),
                color: 'bg-blue-950/40 border-blue-800/40 text-blue-400 hover:border-blue-600/60',
              },
              {
                label: 'PSA Pop Report',
                url: psaPopUrl,
                desc: 'Official population data',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                ),
                color: 'bg-purple-950/40 border-purple-800/40 text-purple-400 hover:border-purple-600/60',
              },
              {
                label: 'PSA Cert Verify',
                url: psaCertLookup,
                desc: 'Verify graded card is real',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                  </svg>
                ),
                color: 'bg-amber-950/40 border-amber-800/40 text-amber-400 hover:border-amber-600/60',
              },
            ].map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center border rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 ${link.color}`}
              >
                <span className="mb-2">{link.icon}</span>
                <span className="text-xs font-semibold leading-snug mb-0.5">{link.label}</span>
                <span className="text-gray-500 text-xs">{link.desc}</span>
              </a>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-3">
            The stylized card illustration below is a representation. Real card images vary by print run, centering, and condition.
          </p>
        </div>
      </div>

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

      {/* Notable Sales */}
      {notableSalesData && notableSalesData.sales.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-4">Notable Sales</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Price</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Grade</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Venue</th>
                    <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {notableSalesData.sales.map((sale, i) => (
                    <tr key={i} className={`border-b border-gray-800/50 ${i === 0 ? 'bg-amber-950/20' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${i === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{sale.price}</span>
                        {i === 0 && <span className="ml-2 text-xs text-amber-600 font-medium">Record</span>}
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{sale.grade}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{sale.date}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{sale.venue}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">{sale.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-800">
              <p className="text-gray-600 text-xs">Figures sourced from publicly reported auction results. Private sales may exceed.</p>
            </div>
          </div>
        </section>
      )}

      {/* Card Variations */}
      {variationsData && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2">Card Variations</h2>
          <p className="text-gray-400 text-sm mb-5">{variationsData.baseDescription}</p>
          {variationsData.variants.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {variationsData.variants.map((v, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{v.name}</h4>
                    <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                      v.rarity === 'ultra-rare' ? 'bg-amber-900/50 text-amber-400' :
                      v.rarity === 'rare' ? 'bg-purple-900/50 text-purple-400' :
                      v.rarity === 'uncommon' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{v.rarity}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{v.description}</p>
                  <p className="text-emerald-400 text-xs font-semibold">{v.estimatedMultiplier}</p>
                  {v.notes && <p className="text-gray-600 text-xs mt-1 italic">{v.notes}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 text-sm shrink-0 mt-0.5">✓</span>
              <div>
                <p className="text-emerald-400 text-xs font-semibold mb-1 uppercase tracking-wider">Collector Tip</p>
                <p className="text-gray-300 text-sm leading-relaxed">{variationsData.collectingTip}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grading Company Comparison */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">PSA vs BGS vs SGC</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: 'PSA',
              fullName: 'Professional Sports Authenticators',
              pros: ['Most liquid — highest resale demand', 'Largest population database', 'Vintage specialists', 'Most recognized globally'],
              cons: ['Slowest turnaround at economy tier', 'No subgrades on base service'],
              sweet: 'Best for: Vintage, high-value singles, resale liquidity',
              color: 'border-blue-800/50 bg-blue-950/20',
              badge: 'text-blue-400',
            },
            {
              name: 'BGS',
              fullName: 'Beckett Grading Services',
              pros: ['Subgrades reveal exact condition', 'BGS 9.5 Black Label = highest premium', 'Preferred for modern parallels', 'Slab design seen as premium'],
              cons: ['Less liquid than PSA for vintage', 'Stricter centering = harder to get 10'],
              sweet: 'Best for: Modern parallels, autographs, centering-first cards',
              color: 'border-red-800/50 bg-red-950/20',
              badge: 'text-red-400',
            },
            {
              name: 'SGC',
              fullName: 'Sportscard Guaranty Corporation',
              pros: ['Faster turnaround than PSA/BGS', 'Lower cost at economy tier', 'Growing collector base', 'Good for tobacco/pre-war'],
              cons: ['Lower premium than PSA on most cards', 'Smaller population database'],
              sweet: 'Best for: Pre-war, tobacco cards, budget-conscious grading',
              color: 'border-gray-700 bg-gray-900/50',
              badge: 'text-gray-300',
            },
          ].map(company => (
            <div key={company.name} className={`border rounded-xl p-4 ${company.color}`}>
              <div className="mb-3">
                <span className={`text-lg font-black ${company.badge}`}>{company.name}</span>
                <p className="text-gray-500 text-xs mt-0.5">{company.fullName}</p>
              </div>
              <ul className="space-y-1 mb-3">
                {company.pros.map((p, i) => (
                  <li key={i} className="text-gray-300 text-xs flex gap-1.5"><span className="text-emerald-500 shrink-0">+</span>{p}</li>
                ))}
                {company.cons.map((c, i) => (
                  <li key={i} className="text-gray-500 text-xs flex gap-1.5"><span className="text-gray-600 shrink-0">−</span>{c}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 italic border-t border-gray-800 pt-2">{company.sweet}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-3">
          <Link href="/guides/grading-guide" className="text-emerald-400 hover:text-emerald-300 transition-colors">Full grading guide with cost comparison →</Link>
        </p>
      </section>

      {/* Share */}
      <section className="mb-14">
        <h2 className="text-lg font-bold text-white mb-3">Share This Card</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out the ${card.name} on CardVault — est. value ${card.estimatedValueRaw}`)}&url=${encodeURIComponent(`https://cardvault-two.vercel.app/sports/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(`https://cardvault-two.vercel.app/sports/${slug}`)}&title=${encodeURIComponent(`${card.name} — CardVault price guide`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            Share on Reddit
          </a>
          <CopyLinkButton url={`https://cardvault-two.vercel.app/sports/${slug}`} />
        </div>
      </section>

      {/* External Resources */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-4">Research This Card</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'eBay Sold Listings', url: ebaySearchBase, icon: '🔍', desc: 'Real transaction prices' },
            { label: 'PSA Cert Lookup', url: psaCertLookup, icon: '🏅', desc: 'Verify grades & fakes' },
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
