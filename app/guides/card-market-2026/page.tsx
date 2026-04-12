import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'State of the Card Market: 2026 Analysis',
  description: 'Deep-dive market analysis of the trading card industry in 2026. Sports cards vs Pokémon trends, PSA grading volume, Fanatics/Topps overproduction impact, modern vs vintage, and what collectors should know.',
  keywords: ['card market 2026', 'sports card market trends', 'pokemon card market', 'PSA grading volume', 'card collecting investment 2026'],
};

export default function CardMarket2026Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Market analysis · Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          State of the Card Market: 2026
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          The pandemic boom is a memory. What remains is a more mature, more segmented market with clear winners and losers — and some of the most interesting dynamics in the hobby's history.
        </p>
      </div>

      {/* Key stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {[
          { stat: '$12.6M', label: 'Mantle 1952 Topps record', sub: 'Aug 2022 — all-time sports record' },
          { stat: '$7.25M', label: 'T206 Wagner record', sub: 'Aug 2021 — pre-war record' },
          { stat: '$5.275M', label: 'Pikachu Illustrator', sub: 'Jul 2021 — Pokémon record' },
          { stat: '3.75M', label: 'PSA submissions H1 2025', sub: 'Record grading volume' },
        ].map(item => (
          <div key={item.stat} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-amber-400 font-bold text-xl">{item.stat}</div>
            <div className="text-white text-xs font-medium mt-0.5">{item.label}</div>
            <div className="text-gray-600 text-xs mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Section 1: Overall market */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">Overall Market: The Correction and What Came After</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            The 2020-2021 card market was driven by three simultaneous forces: pandemic-era boredom and disposable income, sports returning to TV after months of darkness, and social media amplifying a culture of card unboxing. The result was a speculative frenzy where <Link href="/sports/2009-bowman-chrome-mike-trout-bdpp89" className="text-emerald-400 hover:text-emerald-300">Mike Trout Bowman Chrome PSA 10s</Link> hit $3.9M and everyone with a spare bedroom became a dealer.
          </p>
          <p>
            By mid-2022, the correction was underway. Modern cards — anything printed in the last decade — fell 50–80% from peak for most players. The casual speculators who had driven the boom disappeared. What remained was a market of genuine collectors, sophisticated investors, and the vintage segment, which held value far better than modern product.
          </p>
          <p>
            By 2025-2026, the market has restabilized into a clearer structure. Vintage cards (pre-1990 sports, pre-2003 Pokémon) have largely retained or exceeded their pre-correction values. Modern cards trade on actual player performance with much lower multiples. The speculative premium that defined 2021 has largely evaporated from modern product.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
          <h3 className="text-white font-semibold mb-3">Record Sales Timeline</h3>
          <div className="space-y-2">
            {[
              { date: 'Aug 2022', card: '1952 Topps Mickey Mantle (PSA 9)', price: '$12,600,000', venue: 'Heritage Auctions' },
              { date: 'Aug 2021', card: 'T206 Honus Wagner (PSA 5)', price: '$7,250,000', venue: 'Robert Edward Auctions' },
              { date: 'Apr 2021', card: '2003-04 Exquisite LeBron James RPA (BGS 9.5)', price: '$5,200,000', venue: 'Goldin Auctions' },
              { date: 'Jul 2021', card: 'Pikachu Illustrator (PSA 10)', price: '$5,275,000', venue: 'Private sale via PWCC' },
              { date: 'Jun 2022', card: '1914 Cracker Jack Babe Ruth (PSA 5)', price: '$4,222,000', venue: 'Goldin Auctions' },
              { date: 'Aug 2020', card: '2009 Bowman Chrome Mike Trout (PSA 10)', price: '$3,936,000', venue: 'Goldin Auctions' },
              { date: 'Sep 2022', card: '2000 Playoff Contenders Tom Brady Auto (PSA 10)', price: '$3,107,852', venue: 'Goldin Auctions' },
              { date: 'Apr 2021', card: '1986-87 Fleer Michael Jordan (PSA 10)', price: '$738,000', venue: 'Goldin Auctions' },
            ].map(item => (
              <div key={item.date + item.card} className="flex items-start gap-3 text-sm">
                <span className="text-gray-600 shrink-0 w-20">{item.date}</span>
                <span className="text-gray-300 flex-1">{item.card}</span>
                <span className="text-amber-400 font-bold shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Sports vs Pokemon */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">Sports Cards vs. Pokémon: Different Animals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-5">
            <div className="text-xl mb-3">⚾ 🏀 🏈 🏒</div>
            <h3 className="text-white font-bold mb-3">Sports Cards</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Vintage blue chips held value through correction</li>
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>PSA population data makes scarcity quantifiable</li>
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Deep collector infrastructure (Beckett, PSA, SGC)</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">–</span>Fanatics/Topps overproduction hit modern market hard</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">–</span>Signed deals lock out competitor licenses</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">–</span>Collector base skews older — younger acquisition slow</li>
            </ul>
          </div>
          <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-2xl p-5">
            <div className="text-xl mb-3">⚡</div>
            <h3 className="text-white font-bold mb-3">Pokémon TCG</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Global audience — Japan, Europe, US all active simultaneously</li>
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Pokémon TCG Pocket driving new collector interest in physical</li>
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Evergreen IP with consistent new releases</li>
              <li className="flex gap-2"><span className="text-emerald-500 shrink-0">+</span>Nostalgia cycle reliable — Gen 1 prices peak every few years</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">–</span>Modern sets difficult to distinguish collectible vs. playable</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">–</span>The Company can reprint vintage — creates ceiling risk</li>
            </ul>
          </div>
        </div>
        <div className="text-gray-400 leading-relaxed">
          <p className="mb-3">
            The fundamental difference: sports cards derive value from real-world athlete performance — a measurable, irreversible history. Pokémon cards derive value from cultural nostalgia and brand perpetuation managed by a single company. Both are valid collecting categories but carry different risk profiles.
          </p>
          <p>
            In 2025-2026, Pokémon TCG Pocket — The Pokémon Company's mobile card game — has driven a new wave of players to seek physical cards. Early data suggests the overlap between Pocket players and physical card buyers is meaningful, with entry-level vintage Base Set cards seeing increased demand from collectors introduced to the brand through the app.
          </p>
        </div>
      </section>

      {/* Section 3: Grading */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">Grading Industry: Volume, Fraud, and the PSA Effect</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            PSA processed 3.75 million submissions in the first half of 2025 — a record pace that reflects both genuine collector activity and a structural shift: grading is now considered standard practice for any card over $50, not a premium service for elite cards.
          </p>
          <p>
            This volume has consequences. PSA 10 populations for modern cards are growing rapidly, eroding grade premiums. A PSA 10 copy of a modern star's rookie card that once commanded 3-5x the raw price now commands 1.5-2x in many cases, because the population has expanded to where the grade itself is no longer scarce.
          </p>
          <p>
            Vintage cards behave differently. For cards printed before 1990, PSA 10 populations grow slowly — most submitted cards simply don't grade that high. The 1986-87 Fleer Michael Jordan has had millions of copies submitted since 1991; the PSA 10 population is ~400. The rarity is structural and permanent.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mt-4">
            <h3 className="text-white font-semibold mb-3">Grading Economics: What Changed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                {
                  era: '2019 and earlier',
                  title: 'PSA Standard pricing',
                  facts: ['$20 submission fee', '3–6 month turnaround', 'Reserved for cards with real premium upside'],
                },
                {
                  era: '2020–2022 boom',
                  title: 'Grading explosion',
                  facts: ['Wait times hit 12–18 months', 'Express service $150+', 'Speculators submitted everything'],
                },
                {
                  era: '2024–2026',
                  title: 'Normalized, higher volume',
                  facts: ['PSA Economy ~$25', '45–60 day turnaround', '3.75M+ H1 2025', 'BGS/SGC gaining share'],
                },
              ].map(era => (
                <div key={era.era} className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-gray-500 text-xs mb-1">{era.era}</div>
                  <div className="text-white font-medium text-sm mb-2">{era.title}</div>
                  <ul className="space-y-1">
                    {era.facts.map(f => (
                      <li key={f} className="text-gray-400 text-xs flex gap-1">
                        <span className="text-emerald-500 shrink-0">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Overproduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">Fanatics/Topps Overproduction: The Modern Card Problem</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            Fanatics acquired Topps in 2022 and simultaneously locked up the exclusive licenses for MLB, NFL, NBA, and eventually NHL cards. The consolidation was controversial from day one — Panini, Upper Deck, and other competitors lost their sports licenses and are no longer in the sports card business for major US leagues.
          </p>
          <p>
            The backlash from collectors is real and documented in secondary market data. The grievance: too many products at too many price points with too many parallels, making it nearly impossible to know what you actually own or what it's worth. A single player might appear in 50+ different parallel versions of the same base card — gold, silver, red, blue, numbered to 10, numbered to 5, numbered to 1, superfractors — most of which carry no meaningful collector premium.
          </p>
          <p>
            The result in the secondary market: modern base cards of active players have seen sustained price compression. Parallel economics now closely resemble the <strong className="text-gray-200">junk wax era of 1987-1992</strong> — overproduction eroding collectible value. The irony is that the same overproduction patterns that made 1990s Donruss and Fleer cards nearly worthless are being repeated with modern chrome cards.
          </p>

          <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-5 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 text-lg">⚠</span>
              <h3 className="text-white font-semibold">What This Means for Collectors</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-red-400 shrink-0">·</span>Modern base parallels are not investment-grade products. Collect what you love, not for resale value.</li>
              <li className="flex gap-2"><span className="text-emerald-400 shrink-0">·</span>Numbered cards (/10 or lower) retain better premium in a world of overproduction.</li>
              <li className="flex gap-2"><span className="text-emerald-400 shrink-0">·</span>On-card autographs from legitimate manufacturers hold value better than sticker autos.</li>
              <li className="flex gap-2"><span className="text-emerald-400 shrink-0">·</span>Pre-Fanatics cards (pre-2023) may benefit from nostalgia premium over time — similar to early 1990s Topps today.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: What's hot / cooling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">What's Hot, What's Cooling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">↑</span> Gaining momentum
            </h3>
            <ul className="space-y-3">
              {[
                {
                  item: 'Pokémon vintage (pre-2003)',
                  detail: 'Base Set, Jungle, Fossil, early Neo — all showing strength. Pokémon TCG Pocket driving new collector awareness.',
                },
                {
                  item: 'Vintage basketball (1969–1990)',
                  detail: 'Kareem, Dr. J, Magic, Bird — the pre-Jordan era is undervalued relative to historical significance.',
                },
                {
                  item: 'Pre-war baseball',
                  detail: 'T206 era cards continue to hold value through every market cycle. True rarity never corrects.',
                },
                {
                  item: 'Hockey rookies (McDavid, Bedard)',
                  detail: 'Hockey is the most undervalued major sport in the card market relative to team quality and player talent.',
                },
                {
                  item: 'Victor Wembanyama',
                  detail: 'The generational NBA talent driving modern basketball collecting. His rookie market has proven resilient.',
                },
              ].map(item => (
                <li key={item.item} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-white font-medium text-sm mb-1">{item.item}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{item.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">↓</span> Cooling or uncertain
            </h3>
            <ul className="space-y-3">
              {[
                {
                  item: 'Modern base parallels',
                  detail: 'Fanatics overproduction has compressed modern parallel values. The mass-produced parallel era may become the new junk wax.',
                },
                {
                  item: 'Zion Williamson',
                  detail: 'Injury concerns and performance questions have significantly deflated a market that ran very hot at draft.',
                },
                {
                  item: 'Sealed wax speculation',
                  detail: 'Sealed booster boxes from 2020-2022 are widely available and often below original issue price. The "sealed = safe" narrative proved false.',
                },
                {
                  item: 'Football rookies (2022-2023)',
                  detail: 'Several highly hyped QBs from recent classes have underperformed. The market overreacted to draft hype on multiple players.',
                },
                {
                  item: 'Modern Pokémon VMAX (non-Charizard)',
                  detail: 'The VMAX era is over as a format. Sword & Shield era non-Charizard cards are struggling to hold value versus the newer Scarlet & Violet releases.',
                },
              ].map(item => (
                <li key={item.item} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-white font-medium text-sm mb-1">{item.item}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{item.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: Predictions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">2026 Outlook: Key Trends to Watch</h2>
        <div className="space-y-4">
          {[
            {
              title: 'The Pokémon TCG Pocket Effect',
              body: "The Company's mobile digital card game is the most significant new user acquisition pipeline for physical Pokémon cards since the anime. Early indicators suggest conversion to physical collecting is happening at meaningful rates. Watch for Base Set and early Neo card demand to climb as Pocket players discover the originals.",
            },
            {
              title: 'AI Authentication Changing the PSA Game',
              body: "Grading companies are deploying AI-assisted authentication that can detect doctored cards at submicron scale. The short-term impact: a wave of trimmed and altered vintage cards being regraded and downgraded. Long-term impact: higher confidence in raw vintage card integrity, which should benefit legitimate vintage markets.",
            },
            {
              title: 'The Fanatics Monopoly Question',
              body: "Fanatics controls MLB, NFL, and NBA card licenses through 2035. The question is whether competition will emerge from other markets (international cards, independent artists) or whether regulatory pressure will break the monopoly. Collector dissatisfaction with overproduction is high but has not yet translated into meaningful sales drops.",
            },
            {
              title: 'Vintage Hockey as the Undervalued Segment',
              body: "Hockey cards are priced at roughly 20-30% of equivalent baseball and basketball cards for comparable eras and players. As Gretzky, Orr, and Howe's historical significance becomes more widely understood by a broader collector base, structural repricing seems inevitable.",
            },
            {
              title: 'The Next Generational Player Effect',
              body: "Wembanyama in basketball, McDavid in hockey, and potentially a breakout quarterback in football will define the next cycle. The collectors who identified Jordan, LeBron, and Brady early made generational returns. The same opportunity exists today for investors willing to hold through early-career volatility.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Dive Deeper</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/most-valuable-sports-cards', label: '50 Most Valuable Sports Cards', icon: '🏆' },
            { href: '/guides/most-valuable-pokemon-cards', label: '50 Most Valuable Pokémon Cards', icon: '⚡' },
            { href: '/guides/when-to-grade-your-cards', label: 'When to Grade Your Cards', icon: '🏅' },
            { href: '/guides/how-to-start-collecting-cards', label: 'How to Start Collecting', icon: '🃏' },
            { href: '/sports', label: 'Browse Sports Cards', icon: '⚾' },
            { href: '/pokemon', label: 'Browse Pokémon Sets', icon: '⚡' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-4 transition-all group"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-gray-300 group-hover:text-white text-sm font-medium transition-colors">{link.label}</span>
              <span className="text-gray-600 ml-auto">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
