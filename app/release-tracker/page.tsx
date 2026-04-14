import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ReleaseTracker from './ReleaseTracker';

export const metadata: Metadata = {
  title: 'Set Release Tracker — Upcoming Sports Card & Pokemon Releases 2025',
  description: 'Track every upcoming sports card and Pokemon release in 2025. Countdown timers, prices, hit rates, key rookies, and product details for Topps, Panini, Upper Deck, and Pokemon.',
  openGraph: {
    title: 'Set Release Tracker 2025 — CardVault',
    description: 'Every upcoming card release with countdown timers, prices, and hit rates.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 Card Release Tracker — CardVault',
    description: 'Track upcoming Topps, Panini, Upper Deck, and Pokemon releases.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Release Tracker' },
];

const faqItems = [
  {
    question: 'What are the biggest sports card releases in 2025?',
    answer: '2025 Panini Prizm Football and Basketball are the most anticipated products, featuring the 2025 NFL Draft class (Shedeur Sanders, Cam Ward, Travis Hunter) and 2025 NBA Draft class (Cooper Flagg). Topps Chrome Baseball and Bowman are also major releases for baseball prospects like Roman Anthony and Ethan Salas.',
  },
  {
    question: 'When does 2025 Panini Prizm Football come out?',
    answer: 'Panini Prizm Football typically releases in September, approximately 3-4 months after the NFL Draft. The exact date is usually announced a few weeks before release. Check back here for updated release dates as they are confirmed.',
  },
  {
    question: 'What is the best sports card product to buy in 2025?',
    answer: 'The best product depends on your budget and goals. For investment: Topps Chrome Baseball and Panini Prizm offer the most liquid cards. For set building: Topps Series 1/2 and Heritage. For high-end hits: Panini Flawless and National Treasures. For fun ripping: Pokemon sets and retail blasters.',
  },
  {
    question: 'How much do sports card hobby boxes cost?',
    answer: 'Prices vary widely by product. Entry-level hobby boxes (Topps Heritage, Donruss) run $80-$200. Mid-tier products (Topps Chrome, Prizm) run $250-$500. Premium products (Select, Spectra) run $300-$800. Ultra-premium (Flawless, National Treasures) can exceed $2,000-$5,000 per box.',
  },
];

export default function ReleaseTrackerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Set Release Tracker 2025',
        description: 'Track upcoming sports card and Pokemon releases with countdown timers, prices, and hit rates.',
        url: 'https://cardvault-two.vercel.app/release-tracker',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Countdown Timers - Prices - Hit Rates - Key Rookies - 2025
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">2025 Set Release Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Every upcoming sports card and Pokemon release in one place. Countdown timers, estimated prices, hit rates, and key rookies to chase. Track the releases you care about.
        </p>
      </div>

      <ReleaseTracker />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Plan Your Purchases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/sealed-ev" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div>
              <div className="text-white text-sm font-medium">Sealed Product EV</div>
              <div className="text-gray-500 text-xs">Is the box worth the price?</div>
            </div>
          </Link>
          <Link href="/tools/wax-vs-singles" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🃏</span>
            <div>
              <div className="text-white text-sm font-medium">Wax vs Singles</div>
              <div className="text-gray-500 text-xs">Buy the box or just buy singles?</div>
            </div>
          </Link>
          <Link href="/tools/pack-sim" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🎰</span>
            <div>
              <div className="text-white text-sm font-medium">Pack Simulator</div>
              <div className="text-gray-500 text-xs">Rip packs without spending money</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
