import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ListingWireClient from './ListingWireClient';

export const metadata: Metadata = {
  title: 'Listing Wire — Live Sports Card Marketplace Feed | CardVault',
  description: 'Live feed of sports card listings the moment they hit marketplaces. See new eBay, COMC, Whatnot, and MySlabs listings in real time with instant deal/fair/overpriced verdicts. Filter by sport. Pause, play, and scout the marketplaces without opening 10 tabs.',
  openGraph: {
    title: 'Listing Wire — Live Marketplace Feed | CardVault',
    description: 'Real-time sports card listing stream across eBay, COMC, Whatnot, MySlabs with instant value verdicts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Listing Wire — Live Card Feed | CardVault',
    description: 'Fresh card listings, live with deal verdicts. Filter by sport. Pause when you want.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Listing Wire' },
];

const faqItems = [
  {
    question: 'Where do these listings come from?',
    answer: 'Listing Wire is a SIMULATED real-time feed built from CardVault\'s 9,923-card database plus realistic marketplace pricing patterns. Listings use actual card data (player, year, set, estimated value) but prices are synthesized to represent typical listing variance. For actual live eBay listings, use our eBay Browse integration at /tools/bulk-lookup or click through to eBay from any card page.',
  },
  {
    question: 'What do the verdict badges mean?',
    answer: 'STEAL (green): ask price is more than 30% below the card\'s estimated value — a rare, aggressive underpriced listing, often a seller who doesn\'t know what they have. DEAL (blue): 10-30% below estimated value — solid buy. FAIR (gray): within 10% of estimated value — market rate. OVERPRICED (red): more than 10% above estimated value — seller is testing the market or doesn\'t know the comps. Verdicts use the card\'s low-end raw estimated value from the CardVault database.',
  },
  {
    question: 'Which marketplaces are represented?',
    answer: 'eBay (most liquidity, highest variance), COMC (Check Out My Collectibles, curated mid-market), Whatnot (live auction platform, often fast-paced deals), MySlabs (graded-card focused). Real-world, these are four of the most-used secondary card marketplaces. The feed weights them roughly by traffic share — eBay most frequent, MySlabs least.',
  },
  {
    question: 'Can I pause the feed?',
    answer: 'Yes. The play/pause toggle in the top right stops new listings from appearing. Current listings stay on screen. Useful when you want to study a specific entry or copy the listing text before the feed moves on.',
  },
  {
    question: 'Why do some listings have rookie stars?',
    answer: 'A ⭐ ROOKIE badge appears on any card flagged as a rookie card in CardVault\'s database. These listings often get verdicts skewed toward DEAL because rookie cards have the highest appreciation potential and flippers watch them closely. A rookie card listed below comp is usually a flipper opportunity.',
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

export default function ListingWirePage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-lime-500/10 text-lime-400 text-xs font-semibold mb-4 border border-lime-500/20">
            🟢 LIVE FEED
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Listing Wire
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            Fresh card listings hit the wire every few seconds across eBay, COMC, Whatnot, and MySlabs. Every entry gets an instant STEAL / DEAL / FAIR / OVERPRICED verdict. The marketplace scout that never stops.
          </p>
        </div>

        <ListingWireClient />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Verdict Legend</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-emerald-400">STEAL</div>
                <div className="text-xs text-gray-400 mt-1">30%+ below value</div>
              </div>
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-sky-400">DEAL</div>
                <div className="text-xs text-gray-400 mt-1">10-30% below</div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-gray-400">FAIR</div>
                <div className="text-xs text-gray-400 mt-1">Within 10%</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-rose-400">OVERPRICED</div>
                <div className="text-xs text-gray-400 mt-1">10%+ above</div>
              </div>
            </div>
          </section>

          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-lime-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-lime-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-lime-500/10 to-emerald-500/5 border border-lime-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">More Live Feeds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/mailday" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-lime-500/40 transition-colors">
                <span className="text-2xl">📬</span>
                <div>
                  <div className="font-semibold text-white text-sm">Mailday Live</div>
                  <div className="text-xs text-gray-400">Card arrivals &amp; grading returns</div>
                </div>
              </Link>
              <Link href="/grading-feed" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-lime-500/40 transition-colors">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-white text-sm">Grading Feed</div>
                  <div className="text-xs text-gray-400">Live PSA/BGS/CGC results</div>
                </div>
              </Link>
              <Link href="/breakers-lounge" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-lime-500/40 transition-colors">
                <span className="text-2xl">📺</span>
                <div>
                  <div className="font-semibold text-white text-sm">Breakers Lounge</div>
                  <div className="text-xs text-gray-400">Who&apos;s streaming right now</div>
                </div>
              </Link>
              <Link href="/card-wire" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-lime-500/40 transition-colors">
                <span className="text-2xl">📡</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Wire</div>
                  <div className="text-xs text-gray-400">Breaking hobby news</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
