import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RipOrHoldCalculator from './RipOrHoldCalculator';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rip or Hold Calculator — Should You Open or Keep Sealed?',
  description: 'Free rip or hold calculator for sealed sports card and Pokemon products. Compare expected pull value vs sealed appreciation to decide whether to open your box or keep it sealed as an investment.',
  openGraph: {
    title: 'Rip or Hold Calculator — CardVault',
    description: 'Should you open that box or keep it sealed? Compare rip EV vs sealed appreciation. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rip or Hold Calculator — CardVault',
    description: 'Should you rip it or hold it sealed? Get a data-driven answer. Free calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Rip or Hold Calculator' },
];

const faqItems = [
  {
    question: 'How does the Rip or Hold Calculator work?',
    answer: 'The calculator compares two scenarios: (1) Rip — the expected value of cards you would pull based on published hit rates and current card values, and (2) Hold — the projected future value of the sealed product based on its age, type, sport, and historical appreciation trends. If the projected sealed value exceeds the rip EV, we recommend holding. If the rip EV is higher, we recommend opening.',
  },
  {
    question: 'What factors affect sealed product appreciation?',
    answer: 'Several factors drive sealed appreciation: product type (hobby boxes appreciate faster than retail), product age (older products gain scarcity premium), sport (some sports have stronger sealed markets), and overall hobby market conditions. Historically, sealed hobby boxes from popular sets have appreciated 8-15% annually, while retail products typically see 5-8% growth.',
  },
  {
    question: 'Should I always follow the calculator recommendation?',
    answer: 'The calculator provides a data-driven starting point, but there are factors it cannot measure: the entertainment value of opening packs, your personal financial situation, upcoming player events (draft, playoffs, awards) that could spike card values, and your storage conditions. If you enjoy the thrill of the rip and the math is close, go for it.',
  },
  {
    question: 'What time horizon should I choose?',
    answer: 'Your time horizon depends on your investing style. Short-term (1 year) is for flippers who want quick returns. Medium-term (3-5 years) is the sweet spot for most collectors — enough time for sealed premiums to build. Long-term (10 years) is for patient investors who have seen sealed wax from the 2000s and 2010s appreciate significantly.',
  },
  {
    question: 'Does the calculator account for storage costs?',
    answer: 'Not directly. If you are holding sealed products, factor in storage costs (climate-controlled environment, shelving, insurance). For most collectors with a modest sealed collection, these costs are minimal. For large-scale sealed investors, storage overhead can reduce effective returns by 1-3% annually.',
  },
];

export default function RipOrHoldPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rip or Hold Calculator',
        description: 'Compare the expected value of opening a sealed product vs keeping it sealed. Data-driven rip or hold recommendations for sports cards and Pokemon.',
        url: 'https://cardvault-two.vercel.app/tools/rip-or-hold',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Rip EV vs Sealed Appreciation Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rip or Hold Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Should you open that sealed product or keep it as an investment? Compare the expected value of pulling cards against the projected appreciation of holding it sealed.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">1.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Select a Product</h3>
          <p className="text-gray-500 text-xs">Choose from hobby boxes, blasters, and other sealed products across all major sports and Pokemon.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">2.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Set Your Price &amp; Horizon</h3>
          <p className="text-gray-500 text-xs">Enter what you paid (or current market price) and choose how long you would hold it sealed.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">3.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Get Your Verdict</h3>
          <p className="text-gray-500 text-xs">See a side-by-side comparison of rip EV vs hold appreciation with a clear recommendation and confidence level.</p>
        </div>
      </div>

      {/* Calculator */}
      <RipOrHoldCalculator />

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/tools/sealed-yield', label: 'Sealed Yield Analysis' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/heat-score', label: 'Collection Heat Score' },
            { href: '/tools/flip-calc', label: 'Flip Calculator' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
