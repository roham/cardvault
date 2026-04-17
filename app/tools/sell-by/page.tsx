import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SellByClient from './SellByClient';

export const metadata: Metadata = {
  title: 'Sell-By Date Tracker — Tax-Optimal Exit Timing | CardVault',
  description: 'Free sell-by date tracker for cards held as investments. Logs purchase date + cost basis, computes days until long-term capital gains (12-month IRS crossover), year-end tax-loss harvest deadline, and per-card HOLD / SELL-NOW / HARVEST recommendations. Multi-lot portfolio view sorted by tax urgency.',
  openGraph: {
    title: 'Sell-By Date Tracker — CardVault',
    description: 'Track tax-optimal exit windows for every card. LTCG crossover, Dec 31 loss harvest, holding period — all in one view.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sell-By Date Tracker — CardVault',
    description: 'Never miss a tax-optimal exit. 12-month LTCG crossover + Dec 31 loss harvest tracker for every card.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Sell-By Date Tracker' },
];

const faqItems = [
  {
    question: 'What does "sell-by date" mean for a card?',
    answer: 'For collectors who hold cards as investments, the IRS taxes gains differently depending on how long you have owned the card. Cards sold after holding for MORE than 12 months qualify for long-term capital gains rates (28% maximum for collectibles under IRC §1(h)(4), often lower in practice). Cards sold at 12 months or less are taxed at your ordinary-income rate (up to 37% federal plus state). The "sell-by date" is the tax-optimal window: the earliest date you can sell and still qualify for long-term treatment, or — if holding at a loss — the last day of the tax year you can realize the loss and offset other gains. The tool tracks both dates for every card you own.',
  },
  {
    question: 'When does the 12-month long-term holding period start?',
    answer: 'The holding period begins the DAY AFTER you acquire the card, not the acquisition day itself (Revenue Ruling 66-7, confirmed by IRS Publication 544). To qualify for long-term capital gains treatment, you must sell on or after the day EXACTLY ONE YEAR from the day AFTER acquisition. Example: buy on 2026-01-15, holding period starts 2026-01-16, one-year mark is 2027-01-16, so the earliest qualifying long-term sale date is 2027-01-16. The tool uses this exact IRS formula — the "crossover date" it displays is the first day you can sell at long-term rates.',
  },
  {
    question: 'What is collectibles tax? Is it different from regular capital gains?',
    answer: 'Yes. Cards are classified as COLLECTIBLES under IRC §408(m)(2), which carries a special tax rate for long-term gains. Regular long-term capital gains are taxed at 0%, 15%, or 20% depending on income. Collectibles long-term gains are taxed at your ordinary rate but CAPPED at 28% (IRC §1(h)(4)). Short-term gains on cards are taxed at full ordinary income rates, same as any other asset. The tool shows both the short-term rate (ordinary) and the long-term rate (28% max) side-by-side so you can quantify the savings from waiting past the crossover date. For high-income collectors, the 28% cap can save 9+ percentage points versus holding as ordinary income.',
  },
  {
    question: 'What is tax-loss harvesting and when does the deadline hit?',
    answer: 'Tax-loss harvesting is selling a card at a loss BEFORE December 31 of the tax year to realize the loss and offset other capital gains. Capital losses offset capital gains dollar-for-dollar, and up to $3,000 of excess loss can offset ordinary income per year (IRC §1211(b)). If you hold a card at a paper loss and believe the market will not recover meaningfully in the next ~60 days, harvesting the loss before Dec 31 converts a paper loss into an immediate tax benefit. The tool flags every card currently held at a loss and shows days until Dec 31 as the "harvest deadline." For cards at a gain that you plan to sell anyway, there is no harvest urgency — that is a pure long-term-crossover timing decision.',
  },
  {
    question: 'What is a wash-sale rule and does it apply to cards?',
    answer: 'The wash-sale rule (IRC §1091) prevents you from selling a security at a loss and buying a "substantially identical" security within 30 days before or after the sale. It disallows the loss for tax purposes. CURRENT IRS GUIDANCE: wash-sale rules apply to STOCKS and SECURITIES. Collectibles — including sports cards and trading card games — are NOT considered securities, so the wash-sale rule does NOT technically apply under current law (as of April 2026). However, the IRS could challenge a blatant roundtrip (sell a 2003-04 LeBron RC at a loss Dec 29, rebuy the same card Jan 3) under the economic-substance doctrine. Prudent practice: if you harvest a card at a loss, wait at least 31 days before rebuying the same specific card, or buy a similar-but-not-identical card.',
  },
  {
    question: 'How does this differ from the tax calculator?',
    answer: 'The tax calculator (/tools/tax-calc) computes the tax owed on ALREADY-SOLD cards for a given tax year. The sell-by date tracker works the OPPOSITE direction: it looks at cards you STILL HOLD and tells you when to sell them. The tax calc answers "what do I owe?" The sell-by tracker answers "when should I sell?" Use the sell-by tracker throughout the year to time exits; use the tax calc at year-end to prepare Schedule D. The two tools are designed to pair — you can export from the sell-by tracker into the tax calc format.',
  },
  {
    question: 'Should I really wait for long-term treatment on every card?',
    answer: 'No. Waiting makes mathematical sense only when: (a) the tax savings from the rate differential exceed the expected market drift over the wait window, AND (b) liquidity risk is acceptable (you do not need the cash now). A card at a $500 short-term gain with 30 days until crossover: short-term tax at 32% = $160, long-term at 28% = $140. Waiting 30 days saves $20. If the market drops 5% in that window, you lose $25+ on the card and the tax savings are erased. Rule of thumb: wait for long-term ONLY if (days-to-crossover × market volatility × card value) is less than (gain × rate differential). The tool shows a "wait-or-sell" verdict per card using a simplified version of this math.',
  },
  {
    question: 'Does the tool share or store my data?',
    answer: 'No. Everything you enter lives in your browser via localStorage only. No server, no login, no account. Clearing your browser data wipes the tracker. For persistence across devices, export the JSON via the Copy button and re-paste on another device. The tool does not transmit your cost basis, purchase dates, or card list anywhere.',
  },
];

export default function SellByPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sell-By Date Tracker',
        description: 'Tax-optimal exit-timing tracker for cards held as investments. Long-term capital gains crossover + tax-loss harvest deadline tracker.',
        url: 'https://cardvault-two.vercel.app/tools/sell-by',
        applicationCategory: 'FinanceApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-lime-950/60 border border-lime-800/50 text-lime-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>⏰</span>
          Tax-optimal exit timing · LTCG crossover + loss harvest · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sell-By Date Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Log what you own + when you bought it. See every card&apos;s long-term capital gains crossover date,
          year-end loss-harvest deadline, and a per-card HOLD / SELL NOW / HARVEST verdict — sorted by urgency.
        </p>
      </div>

      <SellByClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/tools/tax-calc" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Capital Gains Tax Calculator →</div>
          <div className="text-xs text-slate-400">Computes tax on cards already sold. Pairs with this tracker for year-end Schedule D prep.</div>
        </Link>
        <Link href="/tools/tax1099k-tracker" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">1099-K Threshold Tracker →</div>
          <div className="text-xs text-slate-400">Are your platform sales about to trigger a 1099-K? Track marketplace-reported gross by payment platform.</div>
        </Link>
        <Link href="/tools/grading-roi" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Grading ROI Calculator →</div>
          <div className="text-xs text-slate-400">Before you sell, consider grading. See raw-vs-graded ROI for PSA, CGC, SGC.</div>
        </Link>
        <Link href="/tools/reserve-price" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Reserve Price Calculator →</div>
          <div className="text-xs text-slate-400">When it is time to sell, set a smart reserve + starting bid across 9 auction platforms.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-lime-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500">
        Disclaimer: CardVault does not provide tax advice. Rules cited reference the U.S. Internal Revenue Code and IRS publications as of April 2026. Consult a qualified tax professional before making material tax-timing decisions. State tax laws vary and are not modeled here.
      </div>
    </div>
  );
}
