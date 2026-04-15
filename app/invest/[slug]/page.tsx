import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

// No generateStaticParams — rendered on-demand with ISR for 1,800+ players.

interface Props {
  params: Promise<{ slug: string }>;
}

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}
function fmt(n: number): string { return `$${n.toLocaleString()}`; }

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getPlayerCards(playerName: string) {
  return sportsCards.filter(c => c.player === playerName);
}

function getAllPlayers(): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of sportsCards) {
    const slug = slugify(c.player);
    if (!map.has(slug)) map.set(slug, c.player);
  }
  return map;
}

/* ─── investment analysis engine ─── */
function analyzePlayer(name: string, cards: typeof sportsCards) {
  const rawValues = cards.map(c => parseValue(c.estimatedValueRaw));
  const gemValues = cards.map(c => parseValue(c.estimatedValueGem));
  const totalRaw = rawValues.reduce((s, v) => s + v, 0);
  const totalGem = gemValues.reduce((s, v) => s + v, 0);
  const avgRaw = totalRaw / cards.length;
  const avgGem = totalGem / cards.length;
  const maxRaw = Math.max(...rawValues);
  const maxGem = Math.max(...gemValues);
  const minRaw = Math.min(...rawValues);
  const avgSpread = totalGem > 0 && totalRaw > 0 ? totalGem / totalRaw : 1;
  const rookieCards = cards.filter(c => c.rookie);
  const years = cards.map(c => c.year);
  const earliestYear = Math.min(...years);
  const latestYear = Math.max(...years);
  const sport = cards[0].sport;
  const isVintage = earliestYear < 1980;
  const isModern = earliestYear >= 2015;
  const isActive = latestYear >= 2023;
  const hasRookies = rookieCards.length > 0;

  // Investment rating (0-100)
  let rating = 40;
  if (isVintage) rating += 15;
  if (hasRookies) rating += 10;
  if (avgSpread > 5) rating += 10;
  if (maxGem >= 10000) rating += 10;
  if (cards.length >= 5) rating += 5;
  if (isActive) rating += 10;
  rating = Math.min(100, rating);

  // Verdict
  let verdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Speculative' | 'Trophy Only';
  if (rating >= 80) verdict = 'Strong Buy';
  else if (rating >= 65) verdict = 'Buy';
  else if (rating >= 50) verdict = 'Hold';
  else if (isActive || hasRookies) verdict = 'Speculative';
  else verdict = 'Trophy Only';

  // Risk level
  let risk: 'Low' | 'Medium' | 'High';
  if (isVintage && maxGem >= 5000) risk = 'Low';
  else if (isActive && hasRookies) risk = 'High';
  else risk = 'Medium';

  // Bull and bear cases
  const bullCases: string[] = [];
  const bearCases: string[] = [];

  if (isVintage) {
    bullCases.push('Vintage cards have finite supply — scarcity increases every year as fewer copies survive');
    bullCases.push('Historical significance provides floor value regardless of market conditions');
  }
  if (isActive) {
    bullCases.push('Active player with career milestones ahead that could spike card values');
  }
  if (hasRookies) {
    bullCases.push(`Rookie cards available — the most liquid and desirable card type for ${sport} collectors`);
  }
  if (avgSpread > 5) {
    bullCases.push(`Strong grading multiplier (${avgSpread.toFixed(1)}x avg) — significant value unlock through professional grading`);
  }
  if (maxGem >= 5000) {
    bullCases.push(`Premium gem mint copies command ${fmt(maxGem)}+ — proven demand at high price points`);
  }
  if (cards.length >= 5) {
    bullCases.push(`${cards.length} cards in database — diverse entry points across multiple price tiers`);
  }

  if (isActive) {
    bearCases.push('Injury risk could significantly impact card values for active players');
    bearCases.push('Performance decline or retirement could reduce collecting interest');
  }
  if (!isVintage && !isActive) {
    bearCases.push('Retired player in a market that often favors active talent — prices may stagnate');
  }
  if (maxRaw > 1000) {
    bearCases.push('High entry cost limits buyer pool — illiquid at premium price points');
  }
  if (!hasRookies) {
    bearCases.push('No rookie cards in the database — missing the most collected card type');
  }
  if (avgSpread < 2) {
    bearCases.push('Low grading multiplier — professional grading may not be worth the cost');
  }

  // Budget recommendations
  const budgetPicks: { tier: string; budget: string; cards: typeof sportsCards }[] = [];
  const sorted = [...cards].sort((a, b) => parseValue(a.estimatedValueRaw) - parseValue(b.estimatedValueRaw));
  const under25 = sorted.filter(c => parseValue(c.estimatedValueRaw) <= 25);
  const under100 = sorted.filter(c => parseValue(c.estimatedValueRaw) > 25 && parseValue(c.estimatedValueRaw) <= 100);
  const under500 = sorted.filter(c => parseValue(c.estimatedValueRaw) > 100 && parseValue(c.estimatedValueRaw) <= 500);
  const premium = sorted.filter(c => parseValue(c.estimatedValueRaw) > 500);

  if (under25.length > 0) budgetPicks.push({ tier: 'Budget Entry', budget: 'Under $25', cards: under25.slice(0, 3) });
  if (under100.length > 0) budgetPicks.push({ tier: 'Mid-Range', budget: '$25–$100', cards: under100.slice(0, 3) });
  if (under500.length > 0) budgetPicks.push({ tier: 'Premium', budget: '$100–$500', cards: under500.slice(0, 3) });
  if (premium.length > 0) budgetPicks.push({ tier: 'Trophy Card', budget: '$500+', cards: premium.slice(0, 3) });

  return {
    totalRaw, totalGem, avgRaw, avgGem, maxRaw, maxGem, minRaw,
    avgSpread, rookieCards, earliestYear, latestYear, sport,
    isVintage, isModern, isActive, hasRookies,
    rating, verdict, risk, bullCases, bearCases, budgetPicks,
  };
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-500/20 text-red-400 border-red-500/30',
  basketball: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  football: 'bg-green-500/20 text-green-400 border-green-500/30',
  hockey: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};
const VERDICT_COLORS: Record<string, string> = {
  'Strong Buy': 'bg-green-500/20 text-green-400 border-green-500/50',
  'Buy': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'Hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  'Speculative': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  'Trophy Only': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};
const RISK_COLORS: Record<string, string> = {
  Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const players = getAllPlayers();
  const name = players.get(slug);
  if (!name) return { title: 'Player Not Found — CardVault' };

  return {
    title: `${name} Card Investment Guide — Buy, Sell, or Hold? | CardVault`,
    description: `Should you invest in ${name} cards? Free investment analysis with bull/bear cases, risk rating, grading ROI, budget picks from ${fmt(5)} to ${fmt(5000)}+. Data-driven verdict based on ${getPlayerCards(name).length} cards.`,
    openGraph: {
      title: `${name} Card Investment Guide — CardVault`,
      description: `Investment analysis for ${name} cards. Data-driven verdict with bull/bear cases and budget-specific picks.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${name} Card Investment Guide`,
      description: `Should you invest in ${name} cards? Data-driven analysis.`,
    },
    alternates: { canonical: './' },
  };
}

export default async function InvestPlayerPage({ params }: Props) {
  const { slug } = await params;
  const players = getAllPlayers();
  const name = players.get(slug);
  if (!name) notFound();

  const cards = getPlayerCards(name);
  if (cards.length === 0) notFound();

  const analysis = analyzePlayer(name, cards);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Investment Guides', href: '/invest' },
    { label: name },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${name} Card Investment Guide`,
        description: `Investment analysis for ${name} sports cards with bull/bear cases, risk assessment, and budget-specific recommendations.`,
        url: `https://cardvault-two.vercel.app/invest/${slug}`,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Should I invest in ${name} cards?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Based on our analysis of ${cards.length} ${name} cards, the current verdict is "${analysis.verdict}" with ${analysis.risk.toLowerCase()} risk. ${analysis.bullCases[0] || ''} Key factors include a ${analysis.avgSpread.toFixed(1)}x grading multiplier and price range from ${fmt(analysis.minRaw)} to ${fmt(analysis.maxRaw)} raw.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the best ${name} card to buy?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The most valuable ${name} card in our database has a gem mint value of ${fmt(analysis.maxGem)}. For budget collectors, the best entry point starts at ${fmt(analysis.minRaw)} raw. ${analysis.hasRookies ? `${name} has ${analysis.rookieCards.length} rookie card(s) which are typically the most collected and liquid.` : `${name} does not have rookie cards in our database — focus on key career-year issues.`}`,
            },
          },
          {
            '@type': 'Question',
            name: `How many ${name} cards are in the CardVault database?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `CardVault tracks ${cards.length} ${name} cards spanning ${analysis.earliestYear}–${analysis.latestYear}. Total estimated raw value: ${fmt(analysis.totalRaw)}. Total estimated gem mint value: ${fmt(analysis.totalGem)}.`,
            },
          },
        ],
      }} />

      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full border ${SPORT_COLORS[analysis.sport] || ''}`}>
            {analysis.sport.charAt(0).toUpperCase() + analysis.sport.slice(1)}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full border ${VERDICT_COLORS[analysis.verdict] || ''}`}>
            {analysis.verdict}
          </span>
          <span className="text-xs text-gray-400">
            Risk: <span className={RISK_COLORS[analysis.risk]}>{analysis.risk}</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{name} — Card Investment Guide</h1>
        <p className="text-gray-400 text-lg">
          Data-driven investment analysis based on {cards.length} cards spanning {analysis.earliestYear}–{analysis.latestYear}.
        </p>
      </div>

      {/* Rating + Key Stats */}
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/30 border border-gray-700 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
              analysis.rating >= 70 ? 'bg-green-500/20 text-green-400' :
              analysis.rating >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {analysis.rating}
            </div>
          </div>
          <div>
            <div className="text-white font-semibold text-lg">Investment Score</div>
            <div className="text-gray-400 text-sm">
              {analysis.rating >= 70 ? 'Strong fundamentals and value potential' :
               analysis.rating >= 50 ? 'Moderate upside with some risk' :
               'Proceed with caution — limited upside indicators'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Cards Tracked</div>
            <div className="text-xl font-bold text-white">{cards.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Price Range (Raw)</div>
            <div className="text-xl font-bold text-green-400">{fmt(analysis.minRaw)}–{fmt(analysis.maxRaw)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Grading Multiplier</div>
            <div className="text-xl font-bold text-amber-400">{analysis.avgSpread.toFixed(1)}x</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Top Gem Value</div>
            <div className="text-xl font-bold text-blue-400">{fmt(analysis.maxGem)}</div>
          </div>
        </div>

        {/* Rating bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                analysis.rating >= 70 ? 'bg-green-500' :
                analysis.rating >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${analysis.rating}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bull / Bear Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-950/20 border border-green-800/30 rounded-xl p-5">
          <h2 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">&#9650;</span> Bull Case
          </h2>
          <ul className="space-y-2">
            {analysis.bullCases.map((c, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-green-500 flex-shrink-0 mt-0.5">+</span>
                <span>{c}</span>
              </li>
            ))}
            {analysis.bullCases.length === 0 && (
              <li className="text-sm text-gray-500 italic">Limited bull case factors identified</li>
            )}
          </ul>
        </div>
        <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-5">
          <h2 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">&#9660;</span> Bear Case
          </h2>
          <ul className="space-y-2">
            {analysis.bearCases.map((c, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-red-500 flex-shrink-0 mt-0.5">-</span>
                <span>{c}</span>
              </li>
            ))}
            {analysis.bearCases.length === 0 && (
              <li className="text-sm text-gray-500 italic">Limited bear case factors identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Budget Picks */}
      {analysis.budgetPicks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Cards by Budget</h2>
          <div className="space-y-4">
            {analysis.budgetPicks.map(tier => (
              <div key={tier.tier} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{tier.tier}</h3>
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">{tier.budget}</span>
                </div>
                <div className="space-y-2">
                  {tier.cards.map(card => (
                    <div key={card.slug} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <div className="min-w-0">
                        <Link href={`/sports/${card.slug}`} className="text-sm text-white hover:text-amber-400 transition-colors font-medium">
                          {card.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {card.rookie && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">RC</span>
                          )}
                          <span className="text-xs text-gray-500">{card.set}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-green-400 font-medium text-sm">{fmt(parseValue(card.estimatedValueRaw))}</div>
                        <div className="text-xs text-gray-500">gem: {fmt(parseValue(card.estimatedValueGem))}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Cards Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">All {name} Cards ({cards.length})</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs">
                  <th className="text-left p-3">Card</th>
                  <th className="text-right p-3">Raw</th>
                  <th className="text-right p-3">Gem</th>
                  <th className="text-right p-3">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {[...cards].sort((a, b) => parseValue(b.estimatedValueGem) - parseValue(a.estimatedValueGem)).map(card => {
                  const raw = parseValue(card.estimatedValueRaw);
                  const gem = parseValue(card.estimatedValueGem);
                  const mult = raw > 0 ? gem / raw : 0;
                  return (
                    <tr key={card.slug} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="p-3">
                        <Link href={`/sports/${card.slug}`} className="text-white hover:text-amber-400 transition-colors">
                          {card.name}
                        </Link>
                        {card.rookie && <span className="ml-1.5 text-xs text-yellow-400">RC</span>}
                      </td>
                      <td className="p-3 text-right text-gray-300">{fmt(raw)}</td>
                      <td className="p-3 text-right text-green-400 font-medium">{fmt(gem)}</td>
                      <td className="p-3 text-right">
                        <span className={mult >= 5 ? 'text-amber-400' : mult >= 3 ? 'text-gray-300' : 'text-gray-500'}>
                          {mult.toFixed(1)}x
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <details className="group bg-gray-800/50 border border-gray-700 rounded-xl">
            <summary className="cursor-pointer px-5 py-3 text-white font-medium text-sm list-none flex items-center justify-between">
              Should I invest in {name} cards?
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-5 pb-3 text-gray-400 text-sm leading-relaxed">
              Our data-driven analysis gives {name} an investment score of {analysis.rating}/100 with a &ldquo;{analysis.verdict}&rdquo; verdict and {analysis.risk.toLowerCase()} risk.
              {analysis.bullCases.length > 0 ? ` The strongest bull case: ${analysis.bullCases[0].toLowerCase()}.` : ''}
              {analysis.bearCases.length > 0 ? ` The main risk: ${analysis.bearCases[0].toLowerCase()}.` : ''}
            </div>
          </details>
          <details className="group bg-gray-800/50 border border-gray-700 rounded-xl">
            <summary className="cursor-pointer px-5 py-3 text-white font-medium text-sm list-none flex items-center justify-between">
              What is the best {name} card to buy?
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-5 pb-3 text-gray-400 text-sm leading-relaxed">
              {analysis.hasRookies
                ? `${name} has ${analysis.rookieCards.length} rookie card(s) which are typically the best investment. Rookie cards are the most liquid and desirable card type.`
                : `${name} does not have rookie cards in our database. Focus on key career-year issues and the most iconic sets.`
              } Entry points start at {fmt(analysis.minRaw)} raw, with premium cards reaching {fmt(analysis.maxRaw)}+.
            </div>
          </details>
          <details className="group bg-gray-800/50 border border-gray-700 rounded-xl">
            <summary className="cursor-pointer px-5 py-3 text-white font-medium text-sm list-none flex items-center justify-between">
              Is grading {name} cards worth it?
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-5 pb-3 text-gray-400 text-sm leading-relaxed">
              {name} cards have an average grading multiplier of {analysis.avgSpread.toFixed(1)}x (raw to gem mint).
              {analysis.avgSpread >= 5
                ? ' This is an excellent multiplier — grading is highly recommended if the card condition supports it.'
                : analysis.avgSpread >= 3
                  ? ' This is a solid multiplier — grading is worth it for cards in strong condition.'
                  : ' This is a modest multiplier — only grade cards in exceptional condition where you expect a PSA 9 or 10.'
              } Use the <a href="/tools/grading-roi" className="text-amber-400 hover:underline">Grading ROI Calculator</a> for specific cards.
            </div>
          </details>
        </div>
      </section>

      {/* Related links */}
      <div className="border-t border-gray-800 pt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/players/${slugify(name)}`} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{name} Cards</div>
            <div className="text-gray-500 text-xs">All {cards.length} cards</div>
          </Link>
          <Link href="/tools/grading-roi" className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">Grading ROI</div>
            <div className="text-gray-500 text-xs">Should you grade?</div>
          </Link>
          <Link href="/tools/investment-calc" className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">Investment Calc</div>
            <div className="text-gray-500 text-xs">Returns analysis</div>
          </Link>
          <Link href="/tools/starter-kit" className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">Starter Kit</div>
            <div className="text-gray-500 text-xs">Build a collection</div>
          </Link>
          <Link href="/tools/flip-calc" className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">Flip Calculator</div>
            <div className="text-gray-500 text-xs">Profit potential</div>
          </Link>
          <Link href="/invest" className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">All Guides</div>
            <div className="text-gray-500 text-xs">Browse all players</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
