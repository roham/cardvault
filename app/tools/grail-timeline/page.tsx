import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GrailTimelineClient from './GrailTimelineClient';

export const metadata: Metadata = {
  title: 'Grail Timeline Calculator — When Can You Afford Your Dream Card? | CardVault',
  description: "Your grail costs $X today and appreciates Y% per year. You save $M per month. When can you actually afford it? Run the compound math — the treadmill effect most collectors ignore — and get a target date, monthly plan, and acceleration scenarios.",
  openGraph: {
    title: 'Grail Timeline Calculator — CardVault',
    description: 'Compound savings vs compound grail appreciation. See when you can afford your dream card and how much the wait costs you.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grail Timeline Calculator | CardVault',
    description: "The 'when can I afford my grail' math every collector needs. Handles compound appreciation against compound savings.",
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grail Timeline' },
];

const faqItems = [
  {
    question: 'What is the grail treadmill effect?',
    answer: 'Your grail is appreciating while you save. If the grail grows 8% per year and your savings grow 4.5% in a HYSA, every month you wait the card gets further away in real-dollar terms. The calculator shows the exact dollar delta — how much extra the card will cost by the time you afford it, versus the price today. For aspirational grails like a PSA 10 1986 Jordan RC or a T206 Honus Wagner, the treadmill can add tens of thousands to your total outlay over a 10-year savings plan. The math is why so many collectors sell adjacent cards to fund grail purchases immediately rather than saving cash — the treadmill outpaces the savings.',
  },
  {
    question: 'What appreciation rate should I use for my grail?',
    answer: 'Use conservative numbers. Vintage blue-chip cards (pre-1980 HOF rookies in PSA 8+) have historically returned 6-10% annually with high volatility. Modern blue-chip rookies (Jordan, Kobe, LeBron PSA 10) have returned 8-12% but with much higher variance — Jordan PSA 10s have doubled and halved within single years. Anything involving an active player is a speculation, not an appreciation projection, and belongs in a Monte Carlo tool. A good rule: use 5-7% for vintage HOFers, 6-8% for retired modern stars, and do not project on active players or prospects — those belong in the Hold Optimizer or Monte Carlo.',
  },
  {
    question: 'Should I just sell cards from my collection to buy the grail now?',
    answer: 'If the grail is appreciating faster than your savings grow, yes — usually. The calculator includes an "accelerator" scenario that shows what a one-time $X collection sale does to your timeline. For grails that appreciate 8%+ and savers earning 4-5%, converting lower-conviction cards into grail funding typically shortens the timeline by 30-60%. The risk is that you end up cash-poor if the grail price dips — so do not liquidate everything, and always keep a reserve. Many serious collectors consolidate 20 $1K cards into 1 $20K grail over a 5-year window precisely because the math works.',
  },
  {
    question: 'Why does the tool separate savings interest from card appreciation?',
    answer: "They compound differently and the delta is the entire point. Cash in a high-yield savings account grows at the risk-free rate (4-5% in 2026) with no variance. A card appreciates at its asset-class rate with high variance. If you lock $X into cash hoping to buy a grail that is appreciating 8%, you are accepting a 3-4% annual drag, forever. Some collectors use an intermediate strategy: put the savings into a balanced portfolio (S&P 500 + bonds) earning ~7%, which more closely matches grail appreciation and cuts the treadmill to near-zero. The calculator lets you set savings growth anywhere from 0% (mattress cash) to 10% (aggressive equity), so you can model each approach.",
  },
  {
    question: 'What if the tool says my grail is unrealistic?',
    answer: 'It means at your current monthly savings rate, the grail appreciates faster than you can save — the two lines never cross. This is common for grails above $50K when monthly savings are below $500 and the grail is growing 8%+ per year. Your options: (1) raise monthly savings substantially, (2) sell existing collection to jump-start the fund, (3) pick a more achievable grail (the tool suggests one automatically based on your savings capacity), or (4) shift savings into a higher-growth vehicle to beat the appreciation rate. "Unrealistic" is not permanent — it just means your current plan needs adjustment. Most collectors hit it once and then reorient.',
  },
];

export default function GrailTimelinePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Grail Timeline Calculator',
        description: 'Calculate how long it will take to afford your grail card, accounting for compound appreciation of the grail vs compound growth of your savings.',
        url: 'https://cardvault-two.vercel.app/tools/grail-timeline',
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
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Grail Timeline &middot; Compound math &middot; Treadmill effect &middot; Acceleration scenarios
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Grail Timeline Calculator</h1>
        <p className="text-gray-400 text-lg">
          Your grail costs <span className="text-white font-semibold">$X today</span> and is appreciating at
          <span className="text-fuchsia-400 font-semibold"> r% per year</span>. You save
          <span className="text-emerald-400 font-semibold"> $M per month</span>. When can you actually afford it?
          Run the compound math, see the treadmill cost, and test acceleration scenarios.
        </p>
      </div>

      <GrailTimelineClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/hold-optimizer" className="text-fuchsia-500 hover:text-fuchsia-400">Hold Optimizer</Link>
          <Link href="/tools/yield-comparator" className="text-fuchsia-500 hover:text-fuchsia-400">Yield Comparator</Link>
          <Link href="/tools/monte-carlo" className="text-fuchsia-500 hover:text-fuchsia-400">Monte Carlo Simulator</Link>
          <Link href="/tools/dca-calculator" className="text-fuchsia-500 hover:text-fuchsia-400">DCA Calculator</Link>
          <Link href="/tools/card-ladder" className="text-fuchsia-500 hover:text-fuchsia-400">Card Ladder</Link>
          <Link href="/tools/investment-return" className="text-fuchsia-500 hover:text-fuchsia-400">Investment Return</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-fuchsia-500 hover:text-fuchsia-400">&larr; All Tools</Link>
        <Link href="/games" className="text-fuchsia-500 hover:text-fuchsia-400">Games</Link>
        <Link href="/" className="text-fuchsia-500 hover:text-fuchsia-400">Home</Link>
      </div>
    </div>
  );
}
