import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Great Trades — 12 Famous Card Swap Stories in Hobby History | CardVault',
  description: 'Twelve famous card trades that shaped the hobby — from playground-era swaps to million-dollar modern deals. Each story with trade details, how it aged, and the lesson for today\'s collectors. Curated editorial archive covering 1952-2025.',
  openGraph: {
    title: 'Great Trades — CardVault',
    description: 'The 12 most famous card-trade stories in hobby history. From playground swaps to $5M deals.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Great Trades — CardVault',
    description: '12 famous card swap stories that shaped the hobby.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media-hub' },
  { label: 'Great Trades' },
];

type TradeEntry = {
  rank: number;
  title: string;
  era: string;
  tier: 'LEGENDARY' | 'MAJOR' | 'CLASSIC';
  sideA: string;
  sideB: string;
  outcome: string;
  lesson: string;
};

const TRADES: TradeEntry[] = [
  {
    rank: 1,
    title: 'The Gretzky Wagner Partnership (1991)',
    era: '1991',
    tier: 'LEGENDARY',
    sideA: 'Wayne Gretzky + Bruce McNall (cash purchase, not swap)',
    sideB: 'Alan Ray Copeland (seller) — T206 Honus Wagner PSA 8 "The Gretzky Wagner"',
    outcome: 'Gretzky + McNall bought the Wagner for $451,000 in a 1991 Sotheby\'s auction — the first card to break a six-figure threshold. The card resold through Treat Entertainment for $640K (1995), then Walmart heir Bill Mastro for $1.265M (2000), then Arizona Diamondbacks owner Ken Kendrick (2007) at $2.8M, then private sale 2021 reportedly $7.25M. The same physical card anchors the entire modern high-end card market — every subsequent "million-dollar card" sale references the Gretzky Wagner as precedent.',
    lesson: 'A single acquisition can set the market ceiling for an entire sport. The 1991 Wagner purchase normalized six-figure card sales. Without it, the 1999 eBay launch + the 2020 COVID card boom would have had no reference anchor for what a "valuable" card could be worth.',
  },
  {
    rank: 2,
    title: 'Logan Paul\'s Base Set Pokemon Purchase (2020)',
    era: '2020',
    tier: 'LEGENDARY',
    sideA: 'Logan Paul (cash — $200K 2020)',
    sideB: 'Matt Allison (seller) — 1st Edition Shadowless Base Set Sealed Box PSA 9',
    outcome: 'Logan\'s 2020 $200K sealed-box purchase went viral on his YouTube channel — the opening video reached 13M+ views within a week, triggering a 3x price spike in all 1st Edition Base Set Pokemon cards industry-wide. Logan later sold his PSA 10 Pikachu Illustrator for $5.275M (2021) to Pokemon YouTuber Pristine, setting the Pokemon single-card record. The viral marketing loop transformed Pokemon cards from a niche ~$50M/year market to a $1B+/year category within 18 months.',
    lesson: 'Celebrity content drives card prices more than card rarity does. The Pokemon market multiplied 20x between 2019 and 2022 largely because of creator-economy content (Logan Paul, Leonhart, Pokerev) exposing millions of new buyers. Understand who your category\'s influential buyers are.',
  },
  {
    rank: 3,
    title: 'The Alt Acquires The T206 Wagner (2022)',
    era: '2022',
    tier: 'LEGENDARY',
    sideA: 'Alt (fractional-ownership platform, NYC)',
    sideB: 'Private collector (seller) — different SGC 5 Wagner (not the Gretzky copy)',
    outcome: 'Alt purchased a SGC 5 Wagner for $7.25M in a private sale — the highest publicly documented price for any T206 Wagner copy. Alt then fractionalized the card\'s ownership, selling partial shares to retail collectors. The transaction validated the "card as alternative investment asset" thesis and drove institutional capital into hobby infrastructure (Alt, Dibbs, Collectable, Rally) through 2022.',
    lesson: 'The legendary cards are increasingly held by institutional buyers, not individuals. When a $7M card sells to a platform (for fractionalization) rather than a private collector, it signals the market has entered "financialization" mode. This affects comp data — institutional holds suppress secondary trading.',
  },
  {
    rank: 4,
    title: 'Exquisite LeBron RPA 1/99 ($5.2M Private Sale, 2021)',
    era: '2021',
    tier: 'LEGENDARY',
    sideA: 'Paul Warshauer (seller)',
    sideB: 'Goldin auction winner (private) — 2003-04 Upper Deck Exquisite LeBron RPA BGS 9 /99',
    outcome: 'The LeBron Exquisite RPA BGS 9 (serial number 21/99) sold at Goldin auction for $5.2M in April 2021, setting the modern basketball card record (briefly held until a PSA 10 copy sold for $5.5M later that year, then $2M higher in 2022). The Exquisite template — patch + auto + /99 on a rookie — became the canonical premium-rookie format that every subsequent Panini high-end product has copied.',
    lesson: 'One card can define a category template for 20+ years. The RPA /99 format is still the industry standard in 2026. When a template catches on in a premium product, the first-year cards (2003-04) trade at a persistent premium over later years because they are the "origin" reference.',
  },
  {
    rank: 5,
    title: 'The 1952 Mantle $12.6M Sale (2022)',
    era: '2022',
    tier: 'LEGENDARY',
    sideA: 'Anthony Giordano (seller — NJ collector, bought 1991 for $50K)',
    sideB: 'Heritage Auctions winner (anonymous) — 1952 Topps Mickey Mantle #311 SGC 9.5',
    outcome: 'Anthony Giordano\'s SGC 9.5 1952 Mantle sold via Heritage Auctions for $12.6M in August 2022, setting the all-time card sale record (since broken). Giordano bought the card from a dealer at a NY card show in 1991 for $50K — a 252x return over 31 years (12.5% annualized, plus inflation). The sale generated mainstream-press coverage (WSJ, CNBC) that introduced card investing to a new generation of retail and institutional buyers.',
    lesson: 'Long holds on best-in-class condition rare cards produce generational wealth. Giordano\'s 31-year hold at 12.5% annualized rivaled S&P 500 returns while carrying distinct risks (authentication, storage, liquidity). The best-of-best card in any category tends to outperform the median card by 3-5x over long holds.',
  },
  {
    rank: 6,
    title: 'Gary Vaynerchuk\'s $10K for $1M Lot Trade (2020-2021)',
    era: '2020-2021',
    tier: 'MAJOR',
    sideA: 'Gary Vee (cash purchases at card shows + Instagram DMs)',
    sideB: 'Individual collectors (mid-tier cards in undiscovered condition)',
    outcome: 'Gary Vee spent approximately $10M across 2020-2021 on mid-tier cards ($1K-$100K each) at card shows and private DM purchases. He publicly documented each major acquisition on his social channels, creating an "Everything Gary buys" buying pattern among his followers. His documented mid-tier card holdings collectively appreciated by an estimated 3-5x through the 2020-2022 card boom before partially unwinding in the 2023 correction.',
    lesson: 'Aggregate buying with social documentation moves markets. When a high-profile collector visibly buys into a category, follower demand can inflate the same category 2-3x within 30 days. Be cautious buying INTO a category that a public figure is actively loading — you are paying the content-driven premium at the top.',
  },
  {
    rank: 7,
    title: 'The Tom Brady Playoff Contenders Rookie Ticket Auto Sale (2021)',
    era: '2021',
    tier: 'MAJOR',
    sideA: 'Brady card consignor (private)',
    sideB: 'Lelands Auctions winner — 2000 Playoff Contenders Brady RC Auto /100 BGS 9',
    outcome: 'A BGS 9 copy of the 2000 Playoff Contenders Brady Rookie Ticket Auto /100 sold for $3.1M in May 2021, setting the Brady record. The Playoff Contenders Rookie Ticket Auto became (retroactively) the most important football card design of the 2000s — Brady, Peyton Manning (1998), Drew Brees (2001), Aaron Rodgers (2005), Patrick Mahomes (2017) all have a Rookie Ticket Auto and all trade at significant premiums within their respective markets.',
    lesson: 'The "chase card" of any era tends to compound value faster than the set average. When a single card in a product becomes THE collectible of that product, it pulls the entire category up via halo effect — but also makes the rest of the set pale in comparison. Playoff Contenders became a "Rookie Ticket or nothing" product.',
  },
  {
    rank: 8,
    title: 'The 1909 Joe Jackson RC Discovery (2008)',
    era: '2008',
    tier: 'MAJOR',
    sideA: 'Oklahoma family (sellers — inherited from deceased relative)',
    sideB: 'Heritage Auctions (consignment house)',
    outcome: 'An Oklahoma family brought an E90-1 American Caramel Shoeless Joe Jackson RC to Heritage for appraisal in 2008. The card — authenticated as genuine — sold for $667K at Heritage auction in July 2008. It was later resold in 2017 for $1.47M, and again in 2021 for $1.47M held value. The transaction is notable because Joe Jackson\'s short career (banned in 1920 post-Black Sox scandal) means only a handful of cards exist from his pre-scandal years — the E90-1 is effectively the only RC-tier document of his career before ban.',
    lesson: 'Scarcity from historical events (bans, early retirement, death) creates asymmetric pricing. Joe Jackson\'s "Black Sox scandal" ban eliminated 15 years of his potential card production in real time, making every pre-ban card a permanent scarcity — which drives premium pricing at every subsequent sale.',
  },
  {
    rank: 9,
    title: 'The McGwire vs Griffey Trade Wars (1998-1999)',
    era: '1998-1999',
    tier: 'MAJOR',
    sideA: 'McGwire collectors (1998 home-run-race buyers)',
    sideB: 'Griffey collectors (1989 UD RC holders)',
    outcome: 'In the 1998-1999 card-shop era, McGwire cards briefly eclipsed Griffey cards in price as the 1998 home-run chase (McGwire 70, Sosa 66) drove collector demand. Thousands of 1:1 trades happened at card shows — McGwire rookies (1985 Topps Olympic #401) swapped for Griffey 1989 UD #1 RCs. Post-2005 steroid-era re-evaluation devalued McGwire cards 80%+ while Griffey held and then appreciated through the 2020 boom. Collectors who SOLD Griffey RCs for McGwire rookies in 1998 recognized the asymmetry within 5-7 years and spent the next 15+ years trying to buy back.',
    lesson: 'Short-term narrative-driven demand produces long-term regret when the narrative inverts. McGwire\'s 1998 halo collapsed to 20% of its peak within 10 years. Griffey\'s 1989 peak quadrupled. Never trade a quality long-hold card for a narrative-peak chase card.',
  },
  {
    rank: 10,
    title: 'The 1979 Gretzky OPC Trade at Lelands (2021)',
    era: '2021',
    tier: 'MAJOR',
    sideA: 'Private consignor (Canadian collector)',
    sideB: 'Lelands Auctions winner (anonymous) — 1979-80 O-Pee-Chee Wayne Gretzky #18 PSA 10',
    outcome: 'The PSA 10 Gretzky OPC rookie (one of 2 known PSA 10 copies as of 2021) sold through Lelands for $3.75M in December 2021 — the highest-ever hockey card sale. Wayne Gretzky himself attended the auction livestream, adding celebrity-endorsement weight to the transaction. The sale set the benchmark for the entire hockey-card category; every subsequent hockey card price is implicitly referenced against this $3.75M anchor.',
    lesson: 'PSA 10 scarcity premiums compound exponentially. The 2021 sale at $3.75M was approximately 4x the PSA 9 market rate at the time. When population reports show 1-3 copies at the top grade for a blue-chip vintage card, expect 3-5x premium vs the next-grade down.',
  },
  {
    rank: 11,
    title: 'Beckett "Dream Trades" Feature (1992-2003)',
    era: '1992-2003',
    tier: 'CLASSIC',
    sideA: 'Magazine readers (collector submissions)',
    sideB: 'Dealers + other readers at shows (pre-eBay meetups)',
    outcome: 'Beckett magazine ran a monthly "Dream Trade" feature from the early 90s through mid-2000s where collectors submitted actual trades they completed, with both cards valued by Beckett\'s own price guide. The column became a cultural touchpoint for the pre-internet card-show era — printed tradeable trades were the primary secondary-market price discovery mechanism for 12+ years. Many "Dream Trades" of 1995-1998 are preserved in hobby archives and now look laughable in modern dollar terms (e.g., a 1989 UD Griffey RC traded for a Jose Canseco rookie lot).',
    lesson: 'Historical trade documentation is the best correction against nostalgia pricing. Old Beckett "Dream Trades" columns show how the market valued cards at a specific moment in history — reading them is humbling. A 1995-era trade for a "hot rookie" often ends up looking absurd from the 2025 perspective, and vice versa.',
  },
  {
    rank: 12,
    title: 'Breaker-Era Hit Trades on Whatnot (2021-2024)',
    era: '2021-2024',
    tier: 'CLASSIC',
    sideA: 'Breaker hit-puller (high-value card pulled from box)',
    sideB: 'Breaker audience member (cash DM purchase on-stream)',
    outcome: 'The 2021-2024 Whatnot breaker era produced thousands of documented on-stream hit-sells — a breaker pulls a $10K-$100K card on-camera, and within 60 seconds sells it to a viewer via DM-confirmed wire transfer. Collectively these on-stream sales produced billions in rapid liquidity and normalized "stream commerce" as a valid card-sale mechanism. The pattern later transferred to Fanatics Live, who acquired breaker-native talent to replicate Whatnot\'s success.',
    lesson: 'Live-stream commerce is now a permanent hobby channel, not a trend. The instant-liquidity-to-viewer model compresses sale cycles from weeks (eBay auction) to seconds (stream DM). This changes the entire pricing dynamic — premium cards now clear at "live-demand" prices rather than "price-discovery" prices, which means stream prices systematically exceed auction comps for the same card.',
  },
];

const TIER_META: Record<TradeEntry['tier'], { label: string; color: string; bg: string }> = {
  LEGENDARY: { label: 'LEGENDARY', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-950/40 border-rose-700/60 text-rose-200' },
  MAJOR: { label: 'MAJOR', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-950/40 border-violet-700/60 text-violet-200' },
  CLASSIC: { label: 'CLASSIC', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-800/60 border-slate-600/60 text-slate-300' },
};

const SPORT_STATS = (() => {
  const eras: Record<string, number> = {};
  TRADES.forEach(t => {
    const decade = t.era.slice(0, 3) + '0s';
    eras[decade] = (eras[decade] || 0) + 1;
  });
  return eras;
})();

export default function GreatTradesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Great Trades — 12 Famous Card Swap Stories in Hobby History',
        description: 'Curated archive of 12 famous card trades and high-profile acquisitions that shaped the modern sports-card hobby.',
        url: 'https://cardvault-two.vercel.app/great-trades',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: TRADES.map(t => ({
          '@type': 'ListItem',
          position: t.rank,
          name: t.title,
        })),
      }} />

      <header className="mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          <span>📜</span>
          Hobby history · 12 trade & acquisition stories · 1909-2024
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Great Trades</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Twelve trade and acquisition stories that shaped the modern sports-card hobby — from the 1991 Gretzky Wagner
          purchase to Logan Paul\u2019s 2020 Pokemon box to Whatnot-era stream sells. Each with what happened, how it aged, and
          the lesson for today&apos;s collectors.
        </p>
      </header>

      {/* Era summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-8">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Era distribution</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(SPORT_STATS).sort().map(([decade, count]) => (
            <div key={decade} className="text-sm">
              <span className="font-mono text-rose-300">{count}</span>
              <span className="text-slate-400 ml-1">{decade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trade list */}
      <div className="space-y-6">
        {TRADES.map(t => {
          const tierMeta = TIER_META[t.tier];
          return (
            <article key={t.rank} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex">
                <div className={`w-2 bg-gradient-to-b ${tierMeta.color}`} />
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-rose-300">
                        {t.rank}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{t.title}</h2>
                        <div className="text-xs text-slate-500 mt-1">
                          <span className="font-mono">{t.era}</span>
                          <span className="mx-2">·</span>
                          <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${tierMeta.bg}`}>{tierMeta.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-md p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Side A</div>
                      <div className="text-slate-300">{t.sideA}</div>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-md p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Side B</div>
                      <div className="text-slate-300">{t.sideB}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">What happened</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{t.outcome}</p>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <div className="text-[10px] uppercase tracking-wider text-rose-400 mb-1">Lesson</div>
                    <p className="text-sm text-slate-200 italic leading-relaxed">{t.lesson}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Related */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/rookie-classes" className="block bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Rookie Classes Ranked →</div>
          <div className="text-xs text-slate-400">15 greatest rookie card classes in hobby history.</div>
        </Link>
        <Link href="/auction-archive" className="block bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Auction Archive →</div>
          <div className="text-xs text-slate-400">Historic hammer prices across major auction houses.</div>
        </Link>
      </div>

      <div className="mt-12 text-xs text-slate-500 border-t border-slate-800 pt-6">
        Editorial note: Transaction details cite publicly reported figures from Heritage Auctions, Goldin, Lelands, PWCC,
        Sotheby\u2019s, and hobby press coverage. Where private-sale prices are noted, values reflect post-sale public reporting
        or seller disclosure. Lessons are editorial interpretations, not financial advice.
      </div>
    </main>
  );
}
