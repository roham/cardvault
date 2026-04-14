import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PackSimulator from './PackSimulator';

export const metadata: Metadata = {
  title: 'Sports Card Pack Simulator — Open Virtual Packs Free',
  description: 'Free sports card pack-opening simulator. Open virtual hobby boxes, blasters, and more. See your pulls, estimate values, and share results. Baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Sports Card Pack Simulator — CardVault',
    description: 'Open virtual card packs for free! Pick a product, rip packs, and see what you pull. Sports card pack simulator with real hit rates.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pack Simulator — CardVault',
    description: 'Open virtual sports card packs for free. Real products, real hit rates, real fun.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Pack Simulator' },
];

const faqItems = [
  {
    question: 'How does the pack simulator work?',
    answer: 'Our pack simulator uses real product data — actual pack counts, cards per pack, and approximate hit rates from official checklists. Each simulated pack pull is randomly generated based on these odds. The results simulate the experience of opening a real box, though individual outcomes will vary.',
  },
  {
    question: 'Are the pull rates accurate?',
    answer: 'Pull rates are based on officially published odds and community-verified data from real box breaks. Individual results vary — that\'s the excitement of ripping packs! Our simulator gives you a realistic experience of what opening a box might look like.',
  },
  {
    question: 'Can I share my simulator results?',
    answer: 'Yes! After opening a box, click the "Share Results" button to copy a shareable link. Your friends can see exactly what you pulled in the simulator.',
  },
  {
    question: 'Is opening a real box worth it based on my simulator results?',
    answer: 'The simulator shows approximate values based on current market data, but real box results can be much higher or lower. Use our Sealed Product EV Calculator for a statistical analysis of whether a product is a good buy. The simulator is for fun — the EV calculator is for investment decisions.',
  },
];

export default function PackSimPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sports Card Pack Simulator',
        description: 'Free virtual pack-opening simulator for sports cards. Pick a product and rip packs with real hit rates.',
        url: 'https://cardvault-two.vercel.app/tools/pack-sim',
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
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-3">
          Pack Simulator
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Pick a product. Rip packs. See what you pull. Free virtual box breaks with real hit rates.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No account required. Share your best pulls with friends.
        </p>
      </div>

      <PackSimulator />

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
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/sealed-ev" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Sealed Product EV Calculator</h3>
            <p className="text-sm text-gray-400 mt-1">Is that box worth buying? Calculate expected value.</p>
          </Link>
          <Link href="/tools/grading-roi" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Grading ROI Calculator</h3>
            <p className="text-sm text-gray-400 mt-1">Should you grade that pull? Calculate your ROI.</p>
          </Link>
          <Link href="/tools/daily-pack" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Daily Free Pack</h3>
            <p className="text-sm text-gray-400 mt-1">One free pack every day. Track your streak!</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
