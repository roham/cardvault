import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FanaticsTimeline from './FanaticsTimeline';

export const metadata: Metadata = {
  title: 'The Fanatics Era: Card Licensing Timeline 2021–2026',
  description: 'The complete timeline of how Fanatics and Topps took over sports card licensing from Panini and Upper Deck. Every deal, exclusive, and product shift from 2021 through 2026 explained — MLB, NFL, NBA, and NHL licenses tracked year by year.',
  keywords: [
    'fanatics topps', 'topps mlb exclusive', 'topps nba 2026', 'panini lost nfl license',
    'panini lost nba license', 'who makes nfl cards now', 'who makes nba cards 2026',
    'fanatics card licensing', 'topps bowman fanatics', 'upper deck nhl license',
    'panini prizm nfl final year', 'topps nba return', 'card licensing 2026',
  ],
  openGraph: {
    title: 'The Fanatics Era: Card Licensing Timeline 2021–2026 | CardVault',
    description: 'How Fanatics + Topps took over sports card licensing from Panini and Upper Deck. Every major deal, 2021 through 2026.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Fanatics Era — Card Licensing Timeline | CardVault',
    description: 'How Topps and Fanatics displaced Panini across NFL, NBA, and MLB. Full timeline 2021–2026.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Fanatics Era' },
];

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The Fanatics Era: Card Licensing Timeline 2021–2026',
  description: 'Complete timeline of how Fanatics and Topps took over sports card licensing from Panini and Upper Deck.',
  datePublished: '2026-04-16',
  dateModified: '2026-04-16',
  author: { '@type': 'Organization', name: 'CardVault' },
  publisher: { '@type': 'Organization', name: 'CardVault' },
};

const faqItems = [
  {
    question: 'Who makes NFL cards now in 2026?',
    answer: 'Topps (owned by Fanatics Collectibles) became the exclusive NFL trading card partner starting with the 2026 season. Panini\'s NFL exclusive license ended after the 2024-25 season. The 2025 season was a transition year with Panini releasing final products under their expiring deal. From 2026 onward, every licensed NFL card — Topps Chrome Football, Bowman Chrome Football, Finest Football — will be made by Topps. Panini can still release unlicensed NFL products (cards without team logos or uniforms) but lost access to the official NFL and NFLPA imagery.',
  },
  {
    question: 'Who makes NBA cards in 2026?',
    answer: 'Topps took over the NBA license starting with the 2025-26 season, ending Panini\'s 16-year run as the exclusive NBA card maker (2009-2024). Topps Chrome Basketball returned as a flagship product in early 2026, the first licensed Topps NBA card since 2009. Panini\'s last NBA products were 2024-25 Prizm, Select, and Donruss — sealed wax from those releases is already rising in value as the final Panini NBA run. Topps Bowman U (college-focused) and Topps Chrome Basketball anchor the new NBA calendar.',
  },
  {
    question: 'Does Topps still make MLB cards?',
    answer: 'Yes. Topps has held the exclusive MLB license since 2022 under Fanatics ownership. Before the Fanatics acquisition, Topps had been the MLB exclusive since 2009. The difference is that Fanatics bought Topps in January 2022 for roughly $500 million, consolidating MLB card production under the Fanatics umbrella. All Topps Chrome, Bowman Chrome, Finest, and Stadium Club Baseball continue — now as Fanatics-owned products.',
  },
  {
    question: 'Who makes NHL cards in 2026?',
    answer: 'Upper Deck retains the NHL exclusive through the 2025-26 season under a contract extension signed in 2023. NHL is the only major North American sports league NOT under Fanatics or Topps control. Upper Deck continues producing Young Guns, SP Authentic, SPx, and The Cup. The NHLPA contract is separate and runs through a similar timeline. Speculation about Fanatics pursuing the NHL license after the current Upper Deck deal expires has been ongoing since 2024.',
  },
  {
    question: 'What happened to Panini in the card industry?',
    answer: 'Panini America lost two of its three most valuable licenses in consecutive years: NFL after the 2024-25 season, and NBA after the 2024-25 season. Panini filed lawsuits against Fanatics in 2023 alleging antitrust violations. Panini still makes unlicensed NFL/NBA cards (without official league logos or team uniforms), retains the Formula 1 trading card license, and produces WWE, UFC, Premier League, and a range of international soccer products. The company remains financially solvent but has lost its dominant position in the North American sports card market.',
  },
  {
    question: 'Should I still buy Panini Prizm NBA from 2024-25?',
    answer: '2024-25 Panini Prizm Basketball is the final Panini NBA flagship before the license expired. Sealed wax from the 2024-25 Panini NBA product calendar (Prizm, Select, Donruss, National Treasures) has risen in value since late 2025 as collectors speculate on "last-year" scarcity. Whether to buy depends on your thesis: if you believe Panini NBA will become a nostalgic legacy product, sealed Prizm Hobby boxes are an accessible bet. If you believe Topps NBA will quickly establish primary value, rookie cards from 2024-25 Panini may underperform Topps 2025-26 rookies over 5+ years. Most analysts see Panini NBA legacy value as a modest premium, not a parabolic rise.',
  },
  {
    question: 'What does "Fanatics Era" mean for card values?',
    answer: 'Three observable trends since 2022: (1) Topps MLB prices stabilized post-acquisition — Fanatics invested in supply-chain consistency and product release calendars. (2) Panini NFL/NBA "final year" sealed products rose 15-40% in value as collectors speculated on scarcity. (3) Topps Chrome returning to NBA (for the first time since 2009) created early-Topps-era rookie hype: 2025-26 Topps Chrome Basketball rookies are priced similar to high-end Panini Prizm RCs despite unknown long-term demand. Expect 2-3 years of pricing volatility as the new product mix establishes equilibrium.',
  },
  {
    question: 'When will NHL cards switch away from Upper Deck?',
    answer: 'As of April 2026, Upper Deck\'s NHL exclusive runs through the 2025-26 season. No official announcement has been made about the post-2026 NHL license. Fanatics has publicly stated interest in expanding into hockey. Any transition would likely be announced 12-18 months before taking effect to give manufacturers time to align product calendars with the NHL season. If Fanatics acquires the NHL rights, expect Topps Hockey products to launch for the 2027-28 season at earliest.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function FanaticsEraPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold mb-4 border border-orange-500/20">
            📰 LONG-FORM HISTORY
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            The Fanatics Era
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 font-semibold mb-4">
            How sports card licensing changed between 2021 and 2026
          </p>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed">
            In the span of five years, Fanatics and Topps displaced Panini America as the dominant force in North American sports cards. MLB, then NFL, then NBA. This is the definitive timeline — every deal, every exclusive, every transition product that matters.
          </p>
        </div>

        <FanaticsTimeline />

        <div className="mt-12 space-y-8">
          <section className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-5">Where Each League Stands in 2026</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚾</span>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-400">MLB</div>
                </div>
                <div className="text-lg font-black text-white mb-1">Topps (Fanatics)</div>
                <div className="text-xs text-gray-400 leading-relaxed">Exclusive since 2009, Fanatics-owned since Jan 2022. Topps Chrome, Bowman Chrome, Finest, Stadium Club. Active.</div>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏈</span>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-400">NFL</div>
                </div>
                <div className="text-lg font-black text-white mb-1">Topps (Fanatics)</div>
                <div className="text-xs text-gray-400 leading-relaxed">Exclusive starting 2026 season. First Topps NFL cards since 2016 (Topps Chrome Football returns). Panini license ended 2024-25.</div>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏀</span>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-400">NBA</div>
                </div>
                <div className="text-lg font-black text-white mb-1">Topps (Fanatics)</div>
                <div className="text-xs text-gray-400 leading-relaxed">Exclusive starting 2025-26 season. First licensed Topps NBA since 2009. Panini NBA run 2009-2025 ended.</div>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏒</span>
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">NHL</div>
                </div>
                <div className="text-lg font-black text-white mb-1">Upper Deck</div>
                <div className="text-xs text-gray-400 leading-relaxed">Exclusive since 2004. Contract extended through 2025-26 season. Post-2026 NHL rights undecided as of April 2026.</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-5 leading-relaxed">
              Three of the four major North American leagues are now Topps/Fanatics. NHL is the outlier — and the next domino collectors are watching.
            </p>
          </section>

          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What This Means for Collectors</h2>
            <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
              <div>
                <h3 className="text-white font-bold mb-1">1. "Final year" Panini products became speculation assets</h3>
                <p>2024-25 Panini Prizm NFL (last Panini NFL flagship) and 2024-25 Panini Prizm NBA (last Panini NBA flagship) rose 15–40% in sealed wax value between mid-2025 and early 2026. Sealed Hobby boxes became the clearest "buy the rumor" trade in modern cards.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">2. Rookie card "universe" split for 2024 drafts</h3>
                <p>The 2024 NFL Draft class (Caleb Williams, Jayden Daniels, Marvin Harrison Jr.) has rookies in both 2024 Panini Prizm (licensed by Panini at the time) AND upcoming 2026 Topps Chrome Football. The "true rookie card" question is contested — veterans say 2024 Panini RCs hold precedence as first licensed rookie cards; others argue 2026 Topps will carry more long-term value as the new flagship.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">3. Product calendar is in transition</h3>
                <p>Expect less predictable release timing in 2026 as Topps builds out NFL and NBA product lines. Topps Chrome NBA debuted in early 2026. Topps Chrome Football projected for fall 2026. Bowman Chrome Basketball U (college) expected before end of 2026.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">4. Panini is not gone</h3>
                <p>Panini retains Formula 1, WWE, UFC, Premier League, international soccer, college-specific cards (unlicensed NCAA branding), and the Instant program. The company is not bankrupt — it lost access to two licenses but remains a major global card maker with deep non-NA market presence.</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-orange-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Related Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/hobby-timeline" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="font-semibold text-white text-sm">Hobby Timeline 1880–2026</div>
                  <div className="text-xs text-gray-400">Full history of card collecting</div>
                </div>
              </Link>
              <Link href="/guides/card-market-2026" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Market 2026 Guide</div>
                  <div className="text-xs text-gray-400">State of the market today</div>
                </div>
              </Link>
              <Link href="/parallel-rainbow" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">🌈</span>
                <div>
                  <div className="font-semibold text-white text-sm">Parallel Rainbow Encyclopedia</div>
                  <div className="text-xs text-gray-400">Every refractor &amp; Prizm explained</div>
                </div>
              </Link>
              <Link href="/brands" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">🏭</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Brands Directory</div>
                  <div className="text-xs text-gray-400">Topps, Panini, Upper Deck, Bowman</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
