import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LoanOfficeClient from './LoanOfficeClient';

export const metadata: Metadata = {
  title: 'Card Loan Office — Borrow Cash Against Your Cards (Simulator) | CardVault',
  description: 'Simulated collateralized loans against your cards. Pick a card, choose a lender, compare LTV/APR/term, borrow cash without selling. Repay on time or lose your card. Learn how collector lending works.',
  openGraph: {
    title: 'Card Loan Office — CardVault',
    description: 'Borrow cash against your cards without selling. Three AI lenders, real card values, realistic LTV and APR math. Educational simulator.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Loan Office — CardVault',
    description: 'Collateralized card lending simulator. Keep the card, get the cash — if you can pay it back.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Loan Office' },
];

const faqItems = [
  {
    question: 'What is a card-collateralized loan?',
    answer: 'You pledge a card as collateral and borrow cash against its value. Unlike selling, you keep ownership IF you repay the loan on time with interest. If you default, the lender keeps the card. Real-world services like Provenance Capital, Chronos, and private collector lenders offer this, and it gives HODL-ers access to liquidity without triggering a taxable sale.',
  },
  {
    question: 'What is LTV and why does it matter?',
    answer: 'LTV (Loan-to-Value) is the percentage of the card\'s value the lender will front you. Conservative lenders offer 30-40% LTV, mid-tier offer 50%, aggressive offer 70%+. Lower LTV means smaller loan but lower default risk and usually lower interest. Higher LTV gives you more cash but higher rates and more chance you walk away owing more than the card is worth if prices drop.',
  },
  {
    question: 'How is APR different from monthly interest?',
    answer: 'APR (Annual Percentage Rate) is the yearly cost of the loan. A 30-day loan at 2% monthly equals roughly 24% APR — it sounds cheap monthly but expensive annualized. This simulator shows both so you can see how a "just 3% per month" loan is actually a 36% APR product. Short-term collector lending is typically 18-36% APR, sometimes higher.',
  },
  {
    question: 'What happens if I miss a payment?',
    answer: 'In the simulator, missed payments trigger a grace period with late fees, then default. Default means the lender keeps the card as full satisfaction of the debt — you walk away owing nothing but the card is gone forever. In the real world, repossession may also damage your borrowing history with that lender and others on shared blacklists.',
  },
  {
    question: 'When does a card loan make sense?',
    answer: 'A card loan makes sense when: (1) you need short-term cash for a better opportunity (flipping another deal, grading submission, tax deadline), (2) you believe card values will rise above the total repayment amount, (3) you have a clear repayment plan. It does NOT make sense when you have no repayment plan, the loan covers a non-returning expense, or the card is already declining in value.',
  },
];

export default function LoanOfficePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Loan Office',
        description: 'Simulated collateralized lending for sports cards. Borrow cash against your cards with three AI lenders.',
        url: 'https://cardvault-two.vercel.app/vault/loan-office',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Loan Sim &middot; 9,800+ Cards &middot; 3 AI Lenders
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Loan Office</h1>
        <p className="text-gray-400 text-lg">
          Need cash but don&apos;t want to sell? Borrow against your cards. Three AI lenders with different LTV ratios and APRs compete for your business.
          Repay on time, get your card back. Default, and it&apos;s gone. Educational finance simulator — no real money.
        </p>
      </div>

      <LoanOfficeClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-amber-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Vault Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/vault/pawn-shop" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div><div className="text-white text-sm font-medium">Pawn Shop</div><div className="text-gray-500 text-xs">Sell outright with AI broker</div></div>
          </Link>
          <Link href="/vault/layaway" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">📅</span>
            <div><div className="text-white text-sm font-medium">Layaway Plan</div><div className="text-gray-500 text-xs">Finance a card purchase</div></div>
          </Link>
          <Link href="/vault/auction-sniper" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎯</span>
            <div><div className="text-white text-sm font-medium">Auction Sniper</div><div className="text-gray-500 text-xs">Bid on timed auctions vs AI</div></div>
          </Link>
          <Link href="/vault/raffle" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎟️</span>
            <div><div className="text-white text-sm font-medium">Card Raffle</div><div className="text-gray-500 text-xs">Buy tickets, win cards</div></div>
          </Link>
          <Link href="/vault/negotiator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">🤝</span>
            <div><div className="text-white text-sm font-medium">Price Negotiator</div><div className="text-gray-500 text-xs">Haggle with AI sellers</div></div>
          </Link>
          <Link href="/vault/insurance" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-xl transition-colors">
            <span className="text-xl">🛡️</span>
            <div><div className="text-white text-sm font-medium">Insurance Estimator</div><div className="text-gray-500 text-xs">Cost to insure your collection</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
