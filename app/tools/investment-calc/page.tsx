import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InvestmentCalc from './InvestmentCalc';

export const metadata: Metadata = {
  title: 'Card Investment Return Calculator — Annualized ROI vs S&P 500',
  description: 'Free card investment calculator. Enter purchase price and current value to see annualized return, benchmark comparison (S&P 500, gold, Bitcoin), and investment insights.',
  openGraph: {
    title: 'Card Investment Return Calculator — CardVault',
    description: 'How does your card investment compare to the S&P 500? Calculate annualized returns and benchmark performance.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investment Return Calculator — CardVault',
    description: 'Are your cards beating the stock market? Calculate annualized returns vs benchmarks.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Investment Calculator' },
];

const faqItems = [
  {
    question: 'Are sports cards a good investment?',
    answer: 'Sports cards can be excellent investments, but they are highly volatile and illiquid compared to stocks or bonds. Top-tier rookie cards (PSA 10 of stars like Luka Doncic, Shohei Ohtani) have produced 50-500%+ returns over 3-5 years. However, most cards lose value over time. Key success factors: buy rookies early, grade for authenticity, focus on generational players, and diversify across sports.',
  },
  {
    question: 'How do I calculate annualized return on a card?',
    answer: 'Annualized return accounts for how long you held the investment, making it comparable to stock market returns. Formula: (Current Value / Purchase Price)^(1/Years Held) - 1. For example, a card bought for $100 that is now worth $200 after 3 years has an annualized return of about 26% — significantly beating the S&P 500 average of 10.4%.',
  },
  {
    question: 'What costs should I include in my card investment calculation?',
    answer: 'Include ALL costs: purchase price, grading fees ($20-$150 depending on service level), shipping both ways ($5-$30), insurance for high-value cards, and storage costs. When calculating returns on sale, subtract platform fees (eBay ~13%, COMC ~5%, card show table fees). True ROI is often 20-30% lower than the apparent price appreciation.',
  },
  {
    question: 'How do cards compare to stocks as investments?',
    answer: 'The S&P 500 has returned about 10.4% annually since 1957. Top sports cards have beaten this, with elite rookie PSA 10s returning 20-100%+ annualized over certain periods. However, cards have no dividends, higher transaction costs, more illiquidity, and higher risk of total loss. Cards are best as 5-15% of a diversified portfolio, not a primary investment vehicle.',
  },
  {
    question: 'When should I sell my card investment?',
    answer: 'Consider selling when: (1) You have 2x+ your money and annualized returns exceed 25%, (2) The player retires or declines — prices often peak during prime years, (3) Market sentiment shifts — card markets are cyclical, (4) You need the capital for better opportunities. Hold if the player is still ascending and the card is condition-rare (low PSA 10 population).',
  },
];

export default function InvestmentCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Investment Return Calculator',
        description: 'Calculate annualized returns on card investments. Compare performance vs S&P 500, gold, real estate, and Bitcoin.',
        url: 'https://cardvault-two.vercel.app/tools/investment-calc',
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
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Annualized Returns - Benchmark Comparison - Tax Tips - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Investment Calculator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Are your cards beating the stock market? Enter your purchase details and see
          annualized returns compared to the S&P 500, gold, and Bitcoin.
        </p>
      </div>

      <InvestmentCalc />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Flip Profit Calculator', href: '/tools/flip-calc', desc: 'Calculate margins after fees and grading' },
            { title: 'Grading ROI Calculator', href: '/tools/grading-roi', desc: 'Is grading your card worth the investment?' },
            { title: 'Population Report', href: '/tools/pop-report', desc: 'Check how scarce your card is in high grades' },
            { title: 'Price Watchlist', href: '/tools/watchlist', desc: 'Track cards and get price movement alerts' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-teal-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>This calculator is for informational purposes only. Not financial advice. Past performance does not guarantee future results.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-teal-500 hover:text-teal-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/guides/budget-collecting" className="text-teal-500 hover:text-teal-400">Budget Collecting Guide</Link>
          {' '}&middot;{' '}
          <Link href="/tools/flip-calc" className="text-teal-500 hover:text-teal-400">Flip Profit Calculator</Link>
        </p>
      </div>
    </div>
  );
}
