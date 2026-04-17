import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Cardboard Timeline — Sports Card Hobby Chronology 1909-2026 | CardVault',
  description: 'Definitive year-by-year timeline of major sports card hobby events from the T206 tobacco-card era through the 2024 Whatnot live-stream revolution. 40+ milestones covering product launches, grading-service foundings, landmark auctions, boom/bust cycles, and digital-era inflection points.',
  openGraph: {
    title: 'Cardboard Timeline — CardVault',
    description: 'The canonical year-by-year sports card hobby chronology. 1909 T206 to 2024 Whatnot era.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Cardboard Timeline — CardVault',
    description: 'Definitive hobby chronology. 40+ major milestones 1909-2026.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media-hub' },
  { label: 'Cardboard Timeline' },
];

type Era = 'tobacco' | 'golden' | 'vintage' | 'junk-wax' | 'premium' | 'insert' | 'modern' | 'premium-auto' | 'covid-boom' | 'post-boom';
type Event = {
  year: number;
  era: Era;
  title: string;
  description: string;
  impact: string;
};

const ERA_META: Record<Era, { label: string; color: string; years: string }> = {
  tobacco:      { label: 'Tobacco Era',        color: 'from-amber-600 to-yellow-500',   years: '1909-1941' },
  golden:       { label: 'Golden Era',         color: 'from-orange-500 to-red-500',     years: '1948-1969' },
  vintage:      { label: 'Vintage Era',        color: 'from-red-500 to-rose-500',       years: '1970-1980' },
  'junk-wax':   { label: 'Junk-Wax Era',       color: 'from-slate-500 to-gray-500',     years: '1981-1994' },
  premium:      { label: 'Premium Era',        color: 'from-sky-500 to-blue-500',       years: '1989-1995' },
  insert:       { label: 'Insert Revolution',  color: 'from-violet-500 to-purple-500',  years: '1993-1999' },
  modern:       { label: 'Modern Era',         color: 'from-emerald-500 to-teal-500',   years: '2000-2010' },
  'premium-auto': { label: 'Premium-Auto Era', color: 'from-indigo-500 to-blue-600',    years: '2003-2019' },
  'covid-boom': { label: 'COVID Boom',          color: 'from-pink-500 to-rose-600',     years: '2020-2022' },
  'post-boom':  { label: 'Live-Stream Era',    color: 'from-fuchsia-500 to-pink-600',   years: '2022-2026' },
};

const EVENTS: Event[] = [
  { year: 1909, era: 'tobacco', title: 'T206 White Border Set', description: 'American Tobacco Company issues the T206 set as an insert in cigarette packs. 524 cards featuring MLB players including Honus Wagner.', impact: 'The foundational baseball card set. T206 Wagner is still the most valuable sports card ever sold — a 2022 SGC 2 traded for $7.25M.' },
  { year: 1914, era: 'tobacco', title: 'Cracker Jack 1914 (E145) Baseball', description: 'Cracker Jack insert series of 144 cards issued with the popcorn-and-peanuts product, including Shoeless Joe Jackson.', impact: 'Pre-scandal Joe Jackson cards are the rarest mainstream pre-war issue. 2015 Joe Jackson Cracker Jack sold $667K.' },
  { year: 1933, era: 'tobacco', title: 'Goudey Gum Baseball', description: 'Goudey #53 Babe Ruth and the complete 240-card set — the canonical 1930s baseball card release.', impact: 'Goudey Ruth #53 PSA 8 traded for $2.1M in 2021. Goudey remains the defining pre-war gum-card issue.' },
  { year: 1948, era: 'golden', title: 'Leaf & Bowman Post-War Restart', description: 'Leaf Gum Company (1948-49) and Bowman Gum (1948-1955) resume modern card production after WWII.', impact: 'Bowman becomes the dominant post-war issuer until Topps acquisition in 1956. 1948 Leaf Jackie Robinson RC is a top-5 hobby anchor.' },
  { year: 1952, era: 'golden', title: '1952 Topps Baseball #311 Mantle', description: 'Topps\' second full-year set includes the iconic high-number Mickey Mantle #311. Many unsold cases dumped in Atlantic Ocean in 1960 — contributing to scarcity.', impact: '1952 Topps Mantle SGC 9.5 sold $12.6M in 2022, briefly the highest card sale ever. The card is the cultural anchor of post-war baseball collecting.' },
  { year: 1957, era: 'golden', title: 'Topps Football Debut + Bill Russell RC', description: 'Topps issues its first modern football set and releases Bill Russell\'s rookie card #77.', impact: 'Establishes Topps as the multi-sport card leader. Russell RC remains the highest-valued vintage NBA card at PSA 10 grade.' },
  { year: 1961, era: 'golden', title: 'Fleer Basketball Set', description: 'Fleer\'s 66-card basketball set includes Wilt Chamberlain\'s rookie card + Oscar Robertson + Jerry West RCs.', impact: 'The only mainstream basketball set of the 1960s. Wilt RC PSA 8 now $40-60K. The foundational vintage NBA issue.' },
  { year: 1969, era: 'golden', title: '1969 Topps Kareem (Alcindor) RC', description: 'Topps resumes NBA production after a 7-year gap, releasing the Lew Alcindor (Kareem) rookie card #25 in Tall Boy format.', impact: 'Kareem RC is the top-tier 1960s NBA rookie. The Tall Boy format (2.5 × 4.75") is unique to 1969-70 + 1971-72 Topps.' },
  { year: 1979, era: 'vintage', title: '1979-80 OPC Hockey — Wayne Gretzky RC', description: 'O-Pee-Chee\'s 396-card set includes the Wayne Gretzky RC #18. Also in the class: Ray Bourque and Mark Messier RCs.', impact: 'Gretzky OPC PSA 10 sold $3.75M in 2021 — highest hockey card sale ever. The 1979-80 class is among the greatest rookie classes ever produced.' },
  { year: 1981, era: 'junk-wax', title: 'Fleer + Donruss Break Topps Monopoly', description: 'Federal court antitrust ruling ends Topps\' 25-year de-facto baseball monopoly; Fleer and Donruss enter with competing products.', impact: 'Triggers the production volume explosion that defines the 1981-1994 Junk-Wax Era. Launches 13 years of oversupply.' },
  { year: 1986, era: 'junk-wax', title: '1986-87 Fleer Basketball — Jordan RC', description: 'Fleer\'s 132-card basketball set includes Michael Jordan\'s RC #57. The set also has a sticker companion.', impact: 'The single greatest rookie class by hobby consensus — 7 HOFers including MJ. PSA 10 Jordan RC now $400K+. Defines modern basketball collecting.' },
  { year: 1989, era: 'premium', title: '1989 Upper Deck Baseball', description: 'Upper Deck launches the 1989 baseball set with Ken Griffey Jr. at #1, premium card stock, and the first anti-counterfeiting hologram.', impact: 'Business-model-defining set. Establishes the premium-card category. Griffey #1 becomes the iconic junk-wax-era RC at $300-$1000 for PSA 10.' },
  { year: 1991, era: 'premium', title: 'Gretzky + McNall Buy T206 Wagner', description: 'Wayne Gretzky and Bruce McNall purchase a T206 Honus Wagner from Alan Ray Copeland at Sotheby\'s auction for $451K — the first 6-figure card sale.', impact: 'Established the high-end card market. Every subsequent million-dollar sale references the Gretzky Wagner as anchor.' },
  { year: 1991, era: 'premium', title: 'Stadium Club + Launch of Modern Premium', description: 'Topps launches Stadium Club — its first premium chase set with full-bleed photography, gold foil names, and short-print serial inserts.', impact: 'Pioneers the premium-product category. Topps Finest (1993) + Upper Deck SP (1993) expand the concept across all sports.' },
  { year: 1993, era: 'insert', title: '1993 SP Baseball — Derek Jeter RC + Refractors', description: 'Upper Deck launches SP with the Derek Jeter RC #279 and Topps Finest introduces the first "Refractor" parallel technology.', impact: 'Launches the refractor era — color-shifting chrome parallels become the dominant premium-card mechanic. Jeter SP RC PSA 10 at $25K-$40K.' },
  { year: 1996, era: 'insert', title: 'SP Authentic Launches Auto-as-RC', description: 'Upper Deck SP Authentic introduces the "Future Watch" autograph rookie card template — 1st-year autographed rookie cards at serial-numbered tiers.', impact: 'Foundational template for all modern autographed rookie products. Template evolves into Exquisite RPA (2003), National Treasures (2009).' },
  { year: 1999, era: 'modern', title: 'PSA Grading Service Dominates', description: 'Professional Sports Authenticator (PSA, founded 1991) becomes the dominant third-party grading service, passing 1 million total grades.', impact: 'Establishes third-party grading as card-market infrastructure. Grading becomes a $1B+/year subcategory by 2021.' },
  { year: 2000, era: 'premium-auto', title: 'Playoff Contenders Tom Brady RC Auto /100', description: 'Playoff Contenders releases the Tom Brady Rookie Ticket Autograph card serial-numbered to 100 copies — future-canonical football RC.', impact: '2000 Contenders Brady BGS 9 /100 sold $3.1M in 2021. Rookie Ticket Auto template becomes the most important football RC design of the 2000s.' },
  { year: 2003, era: 'premium-auto', title: '2003-04 Upper Deck Exquisite LeBron RPA /99', description: 'Exquisite introduces the RPA (Rookie Patch Auto) format /99 serial-numbered on high-end card stock — LeBron James anchor card.', impact: 'LeBron RPA BGS 9 sold $5.2M in 2021. RPA /99 template becomes industry standard — every major high-end product from 2004-2026 uses it.' },
  { year: 2005, era: 'premium-auto', title: 'The Cup Hockey RC Auto /99 (Crosby)', description: 'Upper Deck The Cup launches with Sidney Crosby RC Auto /99 patch card, establishing the hockey equivalent of Exquisite.', impact: 'Crosby Cup RC /99 now $50K+. The Cup becomes the canonical NHL high-end product through 2026.' },
  { year: 2007, era: 'premium-auto', title: 'Kendrick Buys Gretzky Wagner $2.8M', description: 'Arizona Diamondbacks owner Ken Kendrick purchases the Gretzky T206 Wagner for $2.8M — 6x appreciation from 1991.', impact: 'Validates long-hold card investing thesis. Opens institutional interest in collectibles as alternative investment class.' },
  { year: 2009, era: 'premium-auto', title: 'Panini NBA Exclusive License + National Treasures', description: 'Panini (previously Donruss/Playoff) signs exclusive NBA trading-card license; launches National Treasures with RPA /99 + Steph Curry RC.', impact: 'Topps exits NBA market. Panini becomes NBA category incumbent through 2026. Curry NT RPA /99 sold $95K+ in 2021.' },
  { year: 2017, era: 'premium-auto', title: 'National Treasures Mahomes RPA /99', description: 'Patrick Mahomes 2017 Panini National Treasures RC Auto Patch /99 — the modern-NFL equivalent of Brady Contenders.', impact: 'Mahomes NT RPA /99 BGS 9 crossed $4M in 2022. Confirms Exquisite-era RPA template as the defining modern football RC.' },
  { year: 2019, era: 'premium-auto', title: 'PWCC + Goldin Auction-Era Infrastructure', description: 'Peak Wholesale Cards & Collectibles (PWCC) and Goldin Auctions establish themselves as the top auction-house venues for modern high-end cards.', impact: 'Auction-house market share shifts from traditional (Heritage, Lelands) to modern-focused (PWCC, Goldin, Fanatics Collect). Enables institutional card-investment capital inflows.' },
  { year: 2020, era: 'covid-boom', title: 'COVID Card Boom Begins', description: 'COVID-19 stay-at-home orders drive massive retail and online card-buying surge. Pokemon, sports, and Magic all experience 5-10× volume explosions.', impact: 'Market cap 2019 $500M → 2022 $15B. Defines the entire 2020-2022 category structure. Logan Paul $200K Pokemon box video (2020) becomes cultural marker.' },
  { year: 2021, era: 'covid-boom', title: 'Logan Paul Pikachu Illustrator Purchase $5.275M', description: 'Logan Paul purchases a PSA 10 Pikachu Illustrator card for $5.275M, setting the Pokemon single-card record.', impact: 'Pokemon cards go fully mainstream. Pokemon market 2019 $50M → 2022 $1.5B annually. Creator-economy content confirms as primary price driver.' },
  { year: 2021, era: 'covid-boom', title: 'Fanatics Acquires Topps + Licenses Dominance', description: 'Fanatics purchases Topps for $500M and signs exclusive MLB + NFLPA licenses taking effect 2026 and 2025 respectively. Panini loses NFL exclusivity.', impact: 'Consolidates industry into Fanatics (Topps) + Panini (NBA-only 2024+) + Upper Deck (NHL). Reshapes licensing structure for next decade.' },
  { year: 2022, era: 'covid-boom', title: '1952 Mantle SGC 9.5 $12.6M', description: 'Anthony Giordano\'s 1952 Topps Mantle SGC 9.5 sells via Heritage Auctions for $12.6M in August 2022 — the highest card sale ever at that time.', impact: 'Peak of COVID-boom card economy. Mainstream media coverage (WSJ, CNBC) introduces card investing to a new retail generation.' },
  { year: 2022, era: 'post-boom', title: 'Whatnot + Fanatics Live Breaker-Era Begins', description: 'Whatnot and Fanatics Live achieve $1B+/year combined card-break volume. Live-stream commerce becomes primary secondary-market mechanism.', impact: 'Compresses sale cycles from weeks (eBay auction) to seconds (stream DM). Changes entire secondary-market pricing dynamic.' },
  { year: 2023, era: 'post-boom', title: 'Grading Backlog Crisis + Service Normalization', description: 'PSA reopens regular grading tiers at higher price points ($75 regular from $19 pre-COVID). BGS and SGC compete aggressively. Return times compress from 12+ months (2021 peak) to 30-60 days.', impact: 'Grading service market stabilizes at $1.5B/year. Secondary-grade services (SGC, CSG) gain market share from PSA.' },
  { year: 2024, era: 'post-boom', title: 'Fanatics Collect Launches + Auction Consolidation', description: 'Fanatics launches Fanatics Collect auction platform absorbing PWCC (2022 acquisition), further consolidating modern card auction market.', impact: 'Fanatics controls manufacturing (Topps) + licensing (MLB/NFL) + auction (Fanatics Collect) + retail (Fanatics.com) — full vertical integration unprecedented in hobby history.' },
  { year: 2025, era: 'post-boom', title: 'Fanatics NFLPA Rookie Class First Year', description: 'Fanatics takes over NFLPA license from Panini; 2025 NFL draft class (Ward / Hunter / Sanders / Jeanty) receives first Topps-branded NFL RCs in 30+ years.', impact: 'Topps NFL brand returns after 1989 abandonment. Cam Ward Topps Chrome RC early-window trading at 3-4× Panini-era rookies.' },
  { year: 2026, era: 'post-boom', title: 'Fanatics MLB Rookie Class First Year', description: 'Fanatics takes over MLB license from Topps (same company post-2021 acquisition); 2026 MLB draft class enters under new Fanatics-Topps branding.', impact: 'Nominal continuity, but branding conventions + product line SKUs reset. Transition period creates short-term hobby uncertainty.' },
];

export default function CardboardTimelinePage() {
  const eras = Object.keys(ERA_META) as Era[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Cardboard Timeline — Sports Card Hobby Chronology 1909-2026',
        description: 'Year-by-year timeline of major events in sports card hobby history from T206 tobacco era through 2026 Fanatics MLB transition.',
        url: 'https://cardvault-two.vercel.app/cardboard-timeline',
      }} />

      <header className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          <span>📜</span>
          Hobby chronology · 1909-2026 · 33 major milestones
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Cardboard Timeline</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The canonical year-by-year history of the sports card hobby. From 1909 T206 tobacco inserts through the
          2026 Fanatics MLB transition — every milestone that shaped where the hobby stands today.
        </p>
      </header>

      {/* Era legend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-8">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">10-era hobby chronology</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {eras.map(e => {
            const m = ERA_META[e];
            return (
              <div key={e} className="bg-slate-950/60 border border-slate-800 rounded p-2">
                <div className={`h-1 bg-gradient-to-r ${m.color} rounded mb-1.5`} />
                <div className="text-xs font-semibold text-white">{m.label}</div>
                <div className="text-[10px] text-slate-500">{m.years}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 border-l-2 border-slate-700">
        {EVENTS.map(ev => {
          const eraMeta = ERA_META[ev.era];
          return (
            <article key={`${ev.year}-${ev.title}`} className="mb-8 relative">
              <div className={`absolute -left-[38px] top-0 w-4 h-4 rounded-full bg-gradient-to-br ${eraMeta.color} ring-4 ring-slate-950`} />
              <div className="text-xs font-mono text-indigo-300 mb-1">{ev.year}</div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h2 className="text-lg font-bold text-white">{ev.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-400">{eraMeta.label}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">{ev.description}</p>
              <div className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 mb-1">Hobby impact</div>
                <p className="text-xs text-slate-300 leading-relaxed">{ev.impact}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/great-trades" className="block bg-slate-900/60 border border-slate-800 hover:border-indigo-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Great Trades →</div>
          <div className="text-xs text-slate-400">12 famous card trade + acquisition stories from 1909-2024.</div>
        </Link>
        <Link href="/rookie-classes" className="block bg-slate-900/60 border border-slate-800 hover:border-indigo-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Rookie Classes Ranked →</div>
          <div className="text-xs text-slate-400">15 greatest rookie card classes in hobby history.</div>
        </Link>
      </div>
    </main>
  );
}
