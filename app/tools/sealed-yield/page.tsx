import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SealedYield from './SealedYield';

export const metadata: Metadata = {
  title: 'Sealed Product Yield Calculator — Is Your Wax Beating the Market?',
  description: 'Free sealed product yield calculator for card collectors. Track annualized returns on sealed boxes, cases, and ETBs. Compare vs S&P 500, gold, bonds, and inflation. See if your wax investment is winning.',
  openGraph: {
    title: 'Sealed Product Yield Calculator — CardVault',
    description: 'Is your sealed wax beating the stock market? Calculate annualized returns and compare benchmarks. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sealed Product Yield Calculator — CardVault',
    description: 'Track sealed product returns vs S&P 500, gold, bonds. Free calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Sealed Product Yield Calculator' },
];

const faqItems = [
  {
    question: 'How is the annualized return (CAGR) calculated?',
    answer: 'We use the Compound Annual Growth Rate formula: CAGR = (Current Value / Purchase Price)^(1/Years) - 1. This gives the equivalent constant annual return rate that would take your purchase price to the current value over the holding period. It accounts for compounding, making it directly comparable to stock market or bond returns.',
  },
  {
    question: 'What benchmarks do you compare against?',
    answer: 'We compare your sealed product return against four benchmarks: S&P 500 (~10.5% historical annual return), Gold (~8.1% over last 10 years), US Treasury Bonds (~4.2% 10-year yield), and CPI Inflation (~3.2% recent average). If your sealed product CAGR exceeds a benchmark, it outperformed that asset class over the same period.',
  },
  {
    question: 'Should I factor in storage costs?',
    answer: 'Yes! Storage costs eat into returns, especially for long-term holds. A climate-controlled storage unit runs $50-150/month. Even home storage has opportunity cost. Our calculator includes an optional monthly storage cost input that reduces your net return. A box appreciating 8% annually but costing $10/month to store properly may only net 3-4% after storage.',
  },
  {
    question: 'Which sealed products have historically performed best?',
    answer: 'Vintage sealed wax (pre-1990) has been the strongest performer, with some 1980s boxes returning 20-40% annually. Modern hobby boxes from popular sets (Topps Chrome, Prizm) can perform well short-term around player breakouts. ETBs and retail products generally appreciate less than hobby boxes. Products from low-print-run years (2020-2021 COVID era) have also shown strong returns.',
  },
  {
    question: 'How accurate are the benchmark comparisons?',
    answer: 'The benchmarks use long-term historical averages, not the actual return for your specific holding period. For example, the S&P 500 returned ~10.5% annually over the last 30 years, but any given 2-year period could be much higher or lower. The comparison gives a general sense of how sealed products perform vs traditional investments, not an exact head-to-head for your exact dates.',
  },
];

export default function SealedYieldPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sealed Product Yield Calculator',
        description: 'Calculate annualized returns on sealed card products. Compare vs S&P 500, gold, bonds, and inflation. Track multiple products. Free.',
        url: 'https://cardvault-two.vercel.app/tools/sealed-yield',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          CAGR Calculator &middot; 4 Benchmarks &middot; Storage Costs &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Sealed Product Yield Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is your sealed wax beating the stock market? Input your purchase details, see annualized returns, and compare against S&amp;P 500, gold, bonds, and inflation.
        </p>
      </div>

      <SealedYield />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/sealed-ev', label: 'Sealed Product EV Calculator', desc: 'Expected value per box from hit rates' },
            { href: '/tools/investment-calc', label: 'Card Investment Calculator', desc: 'Single card annualized returns vs benchmarks' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles Calculator', desc: 'Buy sealed or buy the singles?' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit after fees on any sale' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
