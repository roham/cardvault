import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Best Rookie Cards to Invest In 2026: Top Picks Across All Sports',
  description: 'Expert picks for the best rookie cards to buy in 2026 across baseball, basketball, football, and hockey. Risk tiers, entry prices, and investment thesis for each player.',
  keywords: ['best rookie cards 2026', 'rookie card investments', 'sports card investing', 'which rookie cards to buy', 'undervalued rookie cards'],
};

interface RookiePick {
  player: string;
  sport: string;
  sportIcon: string;
  keyCard: string;
  entryPrice: string;
  riskTier: 'Low' | 'Medium' | 'High' | 'Speculative';
  thesis: string;
  slug?: string;
  riskColor: string;
}

const picks: RookiePick[] = [
  // Baseball
  { player: 'Paul Skenes', sport: 'Baseball', sportIcon: '⚾', keyCard: '2024 Topps Chrome RC', entryPrice: '$5-$30 (PSA 9)', riskTier: 'Medium', thesis: 'NL ROY and All-Star Game starter as a rookie. Upper-90s fastball and devastating splinker. If he stays healthy, this card has top-of-rotation ace ceiling. Pitching RCs historically underperform position player RCs, which keeps the entry price accessible.', slug: '2024-topps-chrome-paul-skenes-rc-250', riskColor: 'text-yellow-400' },
  { player: 'Jackson Merrill', sport: 'Baseball', sportIcon: '⚾', keyCard: '2024 Topps Chrome RC', entryPrice: '$3-$15 (PSA 9)', riskTier: 'Medium', thesis: 'Converted shortstop who became a Gold Glove center fielder with a clutch bat. Still only 21 with enormous ceiling. San Diego market is underrated. This feels like buying Mookie Betts early — low entry, high ceiling.', slug: '2024-topps-chrome-jackson-merrill-rc-175', riskColor: 'text-yellow-400' },
  { player: 'Corbin Carroll', sport: 'Baseball', sportIcon: '⚾', keyCard: '2023 Topps Chrome RC', entryPrice: '$5-$30 (PSA 9)', riskTier: 'Low', thesis: '2023 NL ROY who led Arizona to the World Series. Five-tool player with speed-power combination. Already proven at the highest level. The question is whether he becomes a perennial MVP candidate or a very good player. Low risk, moderate upside.', slug: '2023-topps-chrome-corbin-carroll-rc-150', riskColor: 'text-emerald-400' },
  { player: 'Gunnar Henderson', sport: 'Baseball', sportIcon: '⚾', keyCard: '2019 Bowman Chrome Prospect', entryPrice: '$5-$30 (PSA 9)', riskTier: 'Low', thesis: '2023 AL ROY. Power-hitting shortstop on a contending Orioles team with a long window. Henderson\'s plate discipline and power profile suggest sustained excellence. One of the safest bets in the 2023 class.', slug: '2019-bowman-chrome-gunnar-henderson-bcp-85', riskColor: 'text-emerald-400' },

  // Basketball
  { player: 'Victor Wembanyama', sport: 'Basketball', sportIcon: '🏀', keyCard: '2023-24 Prizm RC', entryPrice: '$100-$500 (PSA 9)', riskTier: 'Low', thesis: 'The consensus generational talent — 7\'4" with guard skills, shot-blocking, and three-point shooting. Already ROY. The only risk is injury. His base Prizm RC is the modern LeBron Chrome — a blue-chip hold.', slug: '2022-23-panini-prizm-victor-wembanyama-258', riskColor: 'text-emerald-400' },
  { player: 'Anthony Edwards', sport: 'Basketball', sportIcon: '🏀', keyCard: '2020-21 Prizm RC', entryPrice: '$50-$200 (PSA 9)', riskTier: 'Low', thesis: 'The heir apparent to face of the NBA. Edwards\' explosive athleticism, charisma, and improving game make him the most likely next superstar after Wemby. His 2024 playoff run put the league on notice. Still only 23.', slug: '2020-21-panini-prizm-anthony-edwards-258', riskColor: 'text-emerald-400' },
  { player: 'Caitlin Clark', sport: 'Basketball', sportIcon: '🏀', keyCard: '2024 Prizm WNBA RC', entryPrice: '$200-$800 (PSA 9)', riskTier: 'High', thesis: 'The most searched sports card of 2024. Clark transcends the WNBA market — her Iowa fame drives crossover collector interest. Risk: WNBA card market depth is unproven long-term. Upside: if WNBA cards gain mainstream traction, this is the LeBron of that market.', slug: '2024-panini-prizm-caitlin-clark-rc', riskColor: 'text-red-400' },

  // Football
  { player: 'C.J. Stroud', sport: 'Football', sportIcon: '🏈', keyCard: '2023 Prizm RC', entryPrice: '$20-$100 (PSA 9)', riskTier: 'Medium', thesis: '2023 OROY who led Houston to the playoffs with remarkable poise. Stroud\'s accuracy and pocket presence are elite for any age, let alone a rookie. The question is sustained success — year 2 will tell.', slug: '2023-panini-prizm-cj-stroud-rc-301', riskColor: 'text-yellow-400' },
  { player: 'Caleb Williams', sport: 'Football', sportIcon: '🏈', keyCard: '2024 Prizm RC', entryPrice: '$20-$100 (PSA 9)', riskTier: 'High', thesis: '#1 overall pick by Chicago. Heisman winner with a generational arm. The Bears investment in surrounding talent (Odunze, Keenan Allen trade) creates a better situation than most recent #1 QBs. High risk because rookie QBs are volatile.', slug: '2024-panini-prizm-caleb-williams-rc', riskColor: 'text-red-400' },
  { player: 'Brock Purdy', sport: 'Football', sportIcon: '🏈', keyCard: '2022 Prizm RC', entryPrice: '$10-$50 (PSA 9)', riskTier: 'Medium', thesis: 'Mr. Irrelevant turned Super Bowl QB. The ultimate value play — if Purdy wins a Super Bowl, his RC will be one of the best ROI stories in the hobby. Shanahan\'s system creates debate about Purdy vs. system, which keeps prices accessible.', slug: '2022-panini-prizm-brock-purdy-rc-326', riskColor: 'text-yellow-400' },

  // Hockey
  { player: 'Connor Bedard', sport: 'Hockey', sportIcon: '🏒', keyCard: '2023-24 Upper Deck Young Guns', entryPrice: '$100-$500 (PSA 8)', riskTier: 'Medium', thesis: 'Calder Trophy winner and the most hyped hockey prospect since McDavid. Bedard\'s shot release and hockey IQ are elite. Chicago\'s rebuild timeline means patience is required, but the talent is unquestioned.', slug: '2023-24-upper-deck-young-guns-connor-bedard-201', riskColor: 'text-yellow-400' },
  { player: 'Matvei Michkov', sport: 'Hockey', sportIcon: '🏒', keyCard: '2023-24 Upper Deck Young Guns', entryPrice: '$50-$200 (PSA 8)', riskTier: 'High', thesis: 'The Flyers\' Russian phenom whose creativity and hands drew Ovechkin comparisons. Early NHL production confirmed the hype. Risk: Russia geopolitics and small sample size. Upside: potential franchise-altering talent.', slug: '2023-24-upper-deck-young-guns-matvei-michkov-469', riskColor: 'text-red-400' },
];

const riskTierExplanations = [
  { tier: 'Low', color: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400', desc: 'Proven performers with established track records. Lower ceiling but higher floor. Best for conservative collectors.' },
  { tier: 'Medium', color: 'bg-yellow-950/40 border-yellow-800/40 text-yellow-400', desc: 'Strong early careers but still proving sustained excellence. Good risk/reward ratio for most collectors.' },
  { tier: 'High', color: 'bg-red-950/40 border-red-800/40 text-red-400', desc: 'Unproven or volatile — could 5x or crash. Only buy with money you can afford to lose.' },
  { tier: 'Speculative', color: 'bg-purple-950/40 border-purple-800/40 text-purple-400', desc: 'Pure speculation on potential. Most speculative buys go to zero. For gamblers, not investors.' },
];

export default function BestRookieCards2026Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: metadata.title as string,
        description: metadata.description as string,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        datePublished: '2026-04-13',
        dateModified: '2026-04-13',
        url: 'https://cardvault-two.vercel.app/guides/best-rookie-cards-2026',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
          { '@type': 'ListItem', position: 3, name: 'Best Rookie Cards 2026' },
        ],
      }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: 'Best Rookie Cards 2026' },
      ]} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Best Rookie Cards to Invest In: 2026 Picks
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Our top rookie card picks across baseball, basketball, football, and hockey — with risk-adjusted entry prices and honest investment theses. No hype, no paid promotions. Just cards we believe in.
        </p>
      </div>

      {/* Risk tiers explained */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-3">Risk Tiers Explained</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {riskTierExplanations.map(r => (
            <div key={r.tier} className={`rounded-xl border p-4 ${r.color}`}>
              <p className="font-bold text-sm">{r.tier} Risk</p>
              <p className="text-gray-400 text-xs mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Picks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">2026 Rookie Card Picks</h2>
        <div className="space-y-6">
          {picks.map((pick, i) => (
            <div key={pick.player} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-bold text-lg">#{i + 1}</span>
                  <span className="text-2xl">{pick.sportIcon}</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">{pick.player}</h3>
                    <p className="text-gray-400 text-xs">{pick.sport}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gray-800 ${pick.riskColor}`}>
                  {pick.riskTier} Risk
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Key Card</p>
                  <p className="text-white text-sm font-medium mt-0.5">{pick.keyCard}</p>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Entry Price</p>
                  <p className="text-emerald-400 text-sm font-medium mt-0.5">{pick.entryPrice}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{pick.thesis}</p>
              {pick.slug && (
                <Link href={`/sports/${pick.slug}`} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-3 transition-colors">
                  View card details <span>&#8594;</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mb-12 bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
        <p className="text-amber-300 font-semibold text-sm mb-1">Investment Disclaimer</p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Sports cards are not regulated securities. Past performance does not guarantee future returns. Card values can drop to zero. Only invest what you can afford to lose. This guide is educational, not financial advice. Always do your own research.
        </p>
      </div>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/guides/investing-101', title: 'Sports Card Investing 101', desc: 'Fundamentals of card investing' },
            { href: '/guides/when-to-grade-your-cards', title: 'When to Grade Your Cards', desc: 'Maximize grading ROI' },
            { href: '/guides/how-to-sell-cards', title: 'How to Sell Sports Cards', desc: 'Cash in when the time is right' },
            { href: '/guides/psa-vs-bgs-vs-cgc', title: 'PSA vs BGS vs CGC', desc: 'Choose the right grader' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="group block border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
              <p className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">{link.title}</p>
              <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex justify-between items-center pt-8 border-t border-gray-800">
        <Link href="/guides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <span>&#8592;</span> All Guides
        </Link>
        <Link href="/guides/how-to-sell-cards" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          How to Sell Cards <span>&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
