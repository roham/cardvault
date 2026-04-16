import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import NumberedPremiumClient from './NumberedPremiumClient';

export const metadata: Metadata = {
  title: 'Numbered Card Premium Calculator — What Is My /99 Worth? | CardVault',
  description: 'Free numbered card premium calculator. Enter your print run and serial number to see if you hit a jersey match, #1, or low serial premium. Works for /10, /25, /50, /99, /199, /250, /500, and custom print runs.',
  openGraph: {
    title: 'Numbered Card Premium Calculator | CardVault',
    description: 'Calculate the premium on your numbered card. Jersey match, #1, low serial — find out what your specific serial number is worth.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Numbered Card Premium Calculator | CardVault',
    description: 'Is your /99 card worth more because of the serial number? Free calculator.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Numbered Card Premium' },
];

const faqItems = [
  {
    question: 'What makes a numbered card serial number more valuable?',
    answer: 'Three factors create serial number premiums: (1) Jersey number match — if the serial matches the player\'s jersey number (e.g., #24/99 for Kobe Bryant), collectors pay 2-5x more. (2) Low serials — #1 gets 2-3x premium, single digits get 1.5-2x. (3) Last number — the final card in the print run (/99 of /99) commands 1.5-2x premium. Random middle numbers have no premium.',
  },
  {
    question: 'How much extra is a jersey number match worth?',
    answer: 'Jersey number matches typically add 2-5x the price of a random serial. The premium is highest on star players and lower print runs. A Luka Doncic #77/99 might sell for 4-5x a random serial, while a common player\'s jersey match might only add 1.5-2x. The market recognizes jersey matches as the most desirable serial numbers.',
  },
  {
    question: 'Is card #1 always the most valuable serial number?',
    answer: 'Usually #1 is the second most valuable after a jersey number match (if one exists within the print run). Card #1 commands a 2-3x premium over random serials. However, if the player\'s jersey number falls within the print run, that serial almost always sells for more than #1. For example, on a Steph Curry /99, card #30 (his jersey number) usually outsells card #1.',
  },
  {
    question: 'Does the print run size affect serial number premiums?',
    answer: 'Yes. Lower print runs amplify serial number premiums. A jersey match on a /10 card might command 5x+ because there are so few copies. On a /500 card, the same jersey match might only add 1.5-2x because there are many more alternatives. The scarcity of the print run multiplies the significance of each serial number.',
  },
  {
    question: 'What is a "1/1" and why is it different from numbered cards?',
    answer: 'A 1/1 (one-of-one) is a card where only one copy exists — there is no serial number variability because it\'s the only card. 1/1 cards are the pinnacle of modern card collecting, often selling for 10-100x the price of the next lowest parallel. Since there\'s only one copy, every 1/1 is inherently a premium serial. This calculator focuses on print runs of 2 or more where serial numbers create varying values.',
  },
];

export default function NumberedPremiumPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Numbered Card Premium Calculator',
        description: 'Calculate the premium on numbered sports cards based on serial number, jersey match, and print run. Covers /10, /25, /50, /99, /199, /250, /500, and custom print runs.',
        url: 'https://cardvault-two.vercel.app/tools/numbered-premium',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Jersey Match - Serial Premium - Print Run Analysis - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Numbered Card Premium Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is your serial number worth extra? Enter your card&apos;s print run, serial number, and optionally the player&apos;s jersey number to calculate premiums, desirability score, and which serials to hunt.
        </p>
      </div>

      <NumberedPremiumClient />

      {/* Educational Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Understanding Numbered Card Premiums</h2>
        <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
          <p>
            Numbered cards (also called &quot;serial numbered&quot; or &quot;/XX&quot; cards) are limited to a specific print run — typically stamped on the card as &quot;45/99&quot; meaning card 45 of 99 total copies. While every copy is equally &quot;rare&quot; in terms of scarcity, certain serial numbers command significant premiums.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">Jersey Number Match</h3>
              <p>The most premium serial. If Tom Brady is #12 and your card is 12/99, that&apos;s a jersey match — worth 2-5x a random serial depending on the player&apos;s star power and the print run.</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">Card #1</h3>
              <p>The &quot;first off the line&quot; carries prestige. #1 commands 2-3x over random serials. On ultra-low runs (/5, /10), #1 is especially prized.</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">Last Number</h3>
              <p>The final card in the run (/99 of /99, /25 of /25) gets a &quot;bookend&quot; premium of 1.5-2x. Paired with #1, they form a matched set.</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-2">Low Serials</h3>
              <p>Single-digit serials (/1-9) get 1.3-1.8x premiums. The lower the number, the higher the premium. This is pure psychology — low numbers &quot;feel&quot; rarer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
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
          <Link href="/tools/rarity-score" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💎</span>
            <div>
              <div className="text-white text-sm font-medium">Rarity Score Calculator</div>
              <div className="text-gray-500 text-xs">0-100 rarity rating</div>
            </div>
          </Link>
          <Link href="/tools/print-run" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏭</span>
            <div>
              <div className="text-white text-sm font-medium">Print Run Estimator</div>
              <div className="text-gray-500 text-xs">Estimate production numbers</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
            </div>
          </Link>
          <Link href="/tools/pop-report" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📈</span>
            <div>
              <div className="text-white text-sm font-medium">Population Report</div>
              <div className="text-gray-500 text-xs">Graded card populations</div>
            </div>
          </Link>
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💸</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit Calculator</div>
              <div className="text-gray-500 text-xs">Calculate buy/sell profits</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
