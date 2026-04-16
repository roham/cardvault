import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RainbowTrackerClient from './RainbowTrackerClient';

export const metadata: Metadata = {
  title: 'Rainbow Chase Tracker — Track Every Parallel Color | CardVault',
  description: 'Free rainbow chase tracker for sports cards. Track every parallel color of your favorite player\'s card. Covers Topps Chrome, Prizm, Select, Optic, Bowman Chrome, and more. Completion %, estimated cost, shareable.',
  openGraph: {
    title: 'Rainbow Chase Tracker — Collect Every Color | CardVault',
    description: 'Track your rainbow chase progress across Topps Chrome, Prizm, Select, and more. Free parallel color tracker.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rainbow Chase Tracker | CardVault',
    description: 'Track every parallel color of your card. Topps Chrome, Prizm, Select, Optic — see your completion %.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Rainbow Tracker' },
];

const faqItems = [
  {
    question: 'What is a "rainbow chase" in card collecting?',
    answer: 'A rainbow chase is when a collector tries to acquire every parallel color of a specific card. For example, the 2024 Topps Chrome base card of a player might exist in base, refractor, purple /299, green /99, blue /75, gold /50, orange /25, red /5, and superfractor 1/1 versions. Collecting all of them is called "completing the rainbow." It\'s one of the most popular and challenging collecting goals in the hobby.',
  },
  {
    question: 'How much does a complete rainbow cost?',
    answer: 'It varies enormously by player and set. A common player\'s rainbow in Topps Chrome might cost $100-$500 total. A star rookie\'s rainbow could cost $5,000-$50,000+ because the low-numbered parallels (/5, 1/1) are extremely expensive. The base card might be $1, but the superfractor 1/1 could be $5,000+. Our tracker estimates costs for each parallel to help you budget.',
  },
  {
    question: 'Which sets are the most popular for rainbow chasing?',
    answer: 'The most popular sets for rainbow chasing are: Topps Chrome (baseball\'s flagship chrome set), Panini Prizm (basketball and football), Bowman Chrome (prospect cards), Select (multi-tier design), and Donruss Optic. Chrome and Prizm refractors are the most recognized parallels in the hobby. Sets with fewer parallel levels are easier to complete.',
  },
  {
    question: 'Is it worth rainbow chasing a common player?',
    answer: 'Actually, yes — common player rainbows are much more affordable and achievable. A complete rainbow of any player is an impressive display piece, and the superfractor 1/1 of a common player might only cost $50-$200 vs $5,000+ for a star. Many collectors rainbow chase their favorite personal collection (PC) players regardless of market value. It\'s about the pursuit, not the investment.',
  },
  {
    question: 'What is the hardest parallel to find in a rainbow?',
    answer: 'The superfractor (1/1) is always the hardest since only one copy exists. After that, printing plates (1/1 each, 4 colors = CMYK), red parallels (/5), and gold parallels (/10 or /50) are the most difficult. Sometimes the hardest parallel isn\'t the lowest numbered — it\'s the one that hasn\'t surfaced for sale yet. Some 1/1s sit in collections for years without appearing on the market.',
  },
];

export default function RainbowTrackerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rainbow Chase Tracker',
        description: 'Track every parallel color of your sports card rainbow chase. Covers Topps Chrome, Panini Prizm, Select, Optic, Bowman Chrome, and more.',
        url: 'https://cardvault-two.vercel.app/tools/rainbow-tracker',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Track Parallels - Completion % - Cost Estimates - Shareable
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rainbow Chase Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Chasing a rainbow? Pick a set, name your player, and track every parallel color. See your completion percentage, estimated cost, and share your progress.
        </p>
      </div>

      <RainbowTrackerClient />

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

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/tools/parallel-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🌈</span>
            <div>
              <div className="text-white text-sm font-medium">Parallel Value Calculator</div>
              <div className="text-gray-500 text-xs">Compare parallel card values</div>
            </div>
          </Link>
          <Link href="/tools/numbered-premium" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔢</span>
            <div>
              <div className="text-white text-sm font-medium">Numbered Card Premium</div>
              <div className="text-gray-500 text-xs">Serial number value calculator</div>
            </div>
          </Link>
          <Link href="/tools/set-completion" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-white text-sm font-medium">Set Completion Tracker</div>
              <div className="text-gray-500 text-xs">Track full set progress</div>
            </div>
          </Link>
          <Link href="/tools/print-run" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏭</span>
            <div>
              <div className="text-white text-sm font-medium">Print Run Estimator</div>
              <div className="text-gray-500 text-xs">Estimate production numbers</div>
            </div>
          </Link>
          <Link href="/tools/rarity-score" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💎</span>
            <div>
              <div className="text-white text-sm font-medium">Rarity Score Calculator</div>
              <div className="text-gray-500 text-xs">0-100 rarity rating</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
