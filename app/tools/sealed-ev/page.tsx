import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SealedEVCalculator from './SealedEVCalculator';

export const metadata: Metadata = {
  title: 'Sealed Product EV Calculator — Is This Box Worth Buying?',
  description: 'Free expected value calculator for sealed sports card and Pokemon boxes. Compare hobby boxes, blasters, and ETBs. See hit rates, expected pulls, and whether the box is worth buying.',
  openGraph: {
    title: 'Sealed Product EV Calculator — CardVault',
    description: 'Is that hobby box worth buying? Calculate the expected value of sealed sports card and Pokemon products based on real hit rates and market prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sealed Product EV Calculator — CardVault',
    description: 'Calculate the expected value of sealed card products. Hit rates, pull odds, and market prices.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Sealed Product EV Calculator' },
];

const faqItems = [
  {
    question: 'What is Expected Value (EV) for a sealed card product?',
    answer: 'Expected Value is the average amount of value you\'d get from opening a sealed product over many openings. It\'s calculated by multiplying each possible hit\'s pull rate by its average market value, then adding all those values together plus base card value. A positive EV means you\'d profit on average; negative EV means you\'d lose money on average.',
  },
  {
    question: 'Should I only buy positive EV products?',
    answer: 'Not necessarily. EV is an average — individual boxes can be worth much more or less. Many collectors buy for the experience, to build sets, or to chase specific cards. But if you\'re buying purely for value, positive EV products are better investments. Also consider that selling individual cards takes time and fees (eBay takes ~13%).',
  },
  {
    question: 'Is a hobby box or blaster a better value?',
    answer: 'Hobby boxes generally offer better EV because they guarantee autographs and have better hit rates. But blasters have lower buy-in and offer exclusive parallels. For pure value: hobby boxes. For casual fun: blasters. For retail flipping: blasters and mega boxes when available at MSRP.',
  },
  {
    question: 'Why do most sealed products have negative EV?',
    answer: 'Manufacturers price products to make a profit. Most sealed products have slightly negative EV at retail. Products become positive EV when: (1) you find them below retail, (2) a hot rookie or chase card spikes, or (3) the product goes out of print and individual card values rise. Newly released products at MSRP are usually slightly negative EV.',
  },
  {
    question: 'Does EV account for selling fees?',
    answer: 'Our EV calculation does NOT factor in selling fees, shipping costs, or time spent listing. If you plan to sell, subtract approximately 15-18% for eBay/TCGPlayer fees and shipping. A product at +5% EV is actually negative after fees.',
  },
];

export default function SealedEVPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Sealed Product EV Calculator',
        description: 'Free expected value calculator for sealed sports card and Pokemon products. Compare hobby boxes, blasters, and ETBs.',
        url: 'https://cardvault-two.vercel.app/tools/sealed-ev',
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

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Sports + Pokemon · Hit Rates · Expected Value · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Sealed Product EV Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is that hobby box worth buying? Pick a sealed product, see the expected hit rates and market values, and calculate whether you&apos;ll profit or lose money on average.
        </p>
      </div>

      {/* Calculator */}
      <SealedEVCalculator />

      {/* How it works */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How the EV Calculator Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Pick a Product', desc: 'Select from hobby boxes, blasters, ETBs across baseball, basketball, football, hockey, and Pokemon.' },
            { step: '2', title: 'See Hit Rates', desc: 'We show published pull odds for every insert type: autos, relics, numbered parallels, and more.' },
            { step: '3', title: 'Calculate EV', desc: 'Expected hits x average market value = your expected return. Compared against the purchase price.' },
            { step: '4', title: 'Get the Verdict', desc: 'Green = positive EV (likely profit). Red = negative EV (likely loss). Enter your actual purchase price for custom analysis.' },
          ].map(s => (
            <div key={s.step} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="w-8 h-8 bg-emerald-950/60 border border-emerald-800/50 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm mb-3">{s.step}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Check
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI Calculator
          </Link>
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Compare Cards
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sports Cards
          </Link>
          <Link href="/pokemon" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Pokemon Cards
          </Link>
        </div>
      </div>
    </div>
  );
}
