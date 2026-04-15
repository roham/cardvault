import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InvestmentReturnClient from './InvestmentReturnClient';

export const metadata: Metadata = {
  title: 'Card Investment Return Calculator — Compare to S&P 500, Gold | CardVault',
  description: 'Calculate your sports card investment return and compare it to the S&P 500, gold, bonds, and inflation. Enter what you paid and the current value to see total return, annualized return, and whether your card beat the stock market. Free investment analysis tool.',
  openGraph: {
    title: 'Card Investment Return Calculator — CardVault',
    description: 'Did your card investment beat the stock market? Calculate total and annual returns, compare to S&P 500 and gold.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investment Return Calculator — CardVault',
    description: 'Calculate your card investment returns vs. the stock market. Free tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Investment Return Calculator' },
];

const faqItems = [
  {
    question: 'How does the card investment return calculator work?',
    answer: 'Enter three numbers: the year you bought the card, what you paid, and the current estimated value. The calculator computes your total return (percentage gain or loss), annualized return (average yearly return), and compares your results to four benchmarks: the S&P 500 (10% avg annual return), gold (7%), US bonds (4%), and inflation (3%). Visual bars show how your card stacked up against traditional investments over the same time period.',
  },
  {
    question: 'Do sports cards outperform the stock market?',
    answer: 'On average, no — most individual sports cards do not outperform the S&P 500 over long periods. However, select cards have dramatically outperformed: a 1986 Fleer Michael Jordan bought for $50 in 1990 is now worth $15,000+ (a 30,000% return). The key difference is that cards are passion investments — the enjoyment of collecting adds non-financial value. The best approach is to collect what you love while making informed decisions about cards with investment potential.',
  },
  {
    question: 'What is annualized return and why does it matter?',
    answer: 'Annualized return is your average yearly return, accounting for compounding. It\'s more useful than total return for comparing investments of different durations. For example, a 100% return over 2 years (41% annualized) is much better than 100% over 10 years (7.2% annualized). The S&P 500 averages about 10% annualized — if your card beats that, it outperformed the stock market.',
  },
  {
    question: 'Should I treat sports cards as investments?',
    answer: 'Sports cards can be part of an alternative investment strategy, but they carry unique risks: no dividends, illiquid markets, condition sensitivity, storage costs, and trend dependence. Most financial advisors suggest treating cards as a passion investment where potential appreciation is a bonus, not the primary goal. The ideal approach: collect cards you love in players and sets you enjoy, while being strategic about condition, timing, and grading to maximize any financial upside.',
  },
  {
    question: 'What cards have been the best investments historically?',
    answer: 'The best card investments share common traits: iconic rookie cards of generational talents, high-grade examples (PSA 9-10), and purchase timing during relative obscurity or off-season dips. Historical winners include the 1952 Topps Mantle, 1986 Fleer Jordan, 1979 O-Pee-Chee Gretzky, 2003 Topps Chrome LeBron, and more recently, 2017 Prizm Mahomes and 2018 Prizm Luka Doncic purchased near release. The pattern: identify generational talent early, buy the premium rookie card in the best condition you can afford, and hold through career milestones.',
  },
];

export default function InvestmentReturnPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Investment Return Calculator',
        description: 'Calculate sports card investment returns and compare to S&P 500, gold, bonds, and inflation benchmarks.',
        url: 'https://cardvault-two.vercel.app/tools/investment-return',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Free Tool - Compare to S&P 500 - Instant Results
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Investment Return Calculator
        </h1>
        <p className="text-white/60 text-lg max-w-3xl">
          Did your card beat the stock market? Enter what you paid and the current value to see your total return, annualized return, and how it compares to the S&P 500, gold, bonds, and inflation.
        </p>
      </div>

      <InvestmentReturnClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <h3 className="text-base font-semibold text-white/90 mb-2">{faq.question}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Links */}
      <div className="mt-8 text-center">
        <p className="text-white/50 text-sm mb-4">More investment tools</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/tools/portfolio" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Fantasy Portfolio
          </Link>
          <Link href="/investment-thesis" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Investment Thesis
          </Link>
          <Link href="/tools/flip-tracker" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Flip Tracker
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
