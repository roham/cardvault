import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MysteryPackSimulator from './MysteryPackSimulator';

export const metadata: Metadata = {
  title: 'Mystery Repack Simulator — Open Virtual Mystery Boxes Free',
  description: 'Free mystery repack box simulator. Open virtual $10, $25, $50, and $100 mystery boxes. See your pulls, track your P&L, and find out if mystery boxes are worth it. Sports cards and Pokemon.',
  openGraph: {
    title: 'Mystery Repack Simulator — CardVault',
    description: 'Open virtual mystery boxes for free! Pick a price tier, rip it open, and see if you won or lost. Track your running P&L across sessions.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mystery Box Simulator — CardVault',
    description: 'Open virtual mystery repack boxes for free. Track your wins and losses.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Mystery Repack Simulator' },
];

const faqItems = [
  {
    question: 'What is a mystery repack box?',
    answer: 'Mystery repack boxes (also called "mystery packs" or "repacks") are pre-packaged boxes of cards assembled by third-party sellers. They contain a random mix of base cards, parallels, numbered cards, and sometimes autographs or relics. Unlike factory-sealed products, the contents are curated by the seller with advertised hit rates.',
  },
  {
    question: 'Are mystery boxes worth buying?',
    answer: 'On average, mystery boxes return 70-85% of their price in card value — the seller builds their profit margin into the price. However, individual boxes can far exceed their cost if you hit a jackpot card. Use this simulator to get a feel for the variance before spending real money.',
  },
  {
    question: 'How does this simulator work?',
    answer: 'Our simulator uses realistic probability distributions based on common mystery box hit rates. Each tier (from $10 to $100) has different odds for base cards, parallels, numbered cards, autographs/relics, and jackpot hits. The estimated values reflect current market ranges for those card types.',
  },
  {
    question: 'Should I buy mystery boxes or sealed hobby products?',
    answer: 'For investment purposes, factory-sealed hobby products generally offer better expected value because there is no middleman markup. Mystery boxes are best for the entertainment value and the chance at a surprise hit. Use our Sealed Product EV Calculator to compare the math on factory products.',
  },
];

export default function MysteryPackPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Mystery Repack Box Simulator',
        description: 'Free virtual mystery box simulator for sports cards. Pick a price tier and see what you pull.',
        url: 'https://cardvault-two.vercel.app/tools/mystery-pack',
        applicationCategory: 'Entertainment',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-3">
          Mystery Repack Simulator
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Pick a price tier. Open the mystery box. See if you won or lost. Track your running P&amp;L.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Free to play. No account required. Learn what mystery boxes are really worth.
        </p>
      </div>

      <MysteryPackSimulator />

      {/* FAQ Section */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/box-break', label: 'Box Break Calculator', icon: '📦' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack', icon: '🎁' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
