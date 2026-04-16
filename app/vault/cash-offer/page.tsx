import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CashOfferClient from './CashOfferClient';

export const metadata: Metadata = {
  title: 'Dealer Cash Offer Estimator — What Will a Card Shop Pay You?',
  description: 'Free dealer cash offer estimator. Enter card details, grade, and retail value — see what a card shop or dealer is likely to offer in cash, plus the math of why. Factors in velocity (fast vs slow sellers), grade tier (raw / PSA 8 / PSA 9 / PSA 10), brand tier (Topps Chrome vs unloved sets), and dealer overhead. Know the dealer offer before you walk in.',
  openGraph: {
    title: 'Dealer Cash Offer Estimator — CardVault',
    description: 'What will a card shop pay cash for your card? See the estimate before you walk in.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Dealer Cash Offer Estimator — CardVault',
    description: 'Estimate a dealer cash offer before you walk in. Factors velocity, grade, and brand tier.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Cash Offer Estimator' },
];

const faqItems = [
  {
    question: 'What percentage of retail will a dealer pay cash?',
    answer: 'Typical dealer cash offers run 40-65% of verified retail. Fast-moving modern cards (current rookie stars, top brand releases) hit the top of that range at 55-65%. Slow-moving commons, vintage non-stars, and off-brand cards fall to 30-45%. Dealers pay more for cards they can flip within 60 days on eBay or Whatnot; they pay less for inventory that will sit in a case. The estimator above applies a velocity multiplier + grade multiplier + brand multiplier to generate a realistic offer range.',
  },
  {
    question: 'Why do dealers offer so much less than retail?',
    answer: 'Dealers carry three costs you do not: (1) Platform fees if they resell — eBay 13.25% + payment processing eats ~14% of any resale. (2) Inventory time cost — if they hold the card for 90 days waiting for a buyer, their working capital is tied up. (3) Overhead — rent, show tables, insurance, staff. A dealer paying 60% of retail on a $1,000 card nets roughly $240-280 in profit after all costs, assuming the card flips within 60 days. If it takes 6 months, they break even. This is why dealers discount hard on slow movers.',
  },
  {
    question: 'How do I get a better cash offer from a dealer?',
    answer: 'Four leverage points. First, bring verified comp data (three recent sold comps on your phone). A dealer offering 45% can be pushed to 55% if you can prove the card sells fast. Second, offer bulk — a dealer paying 55% on one card may pay 60% on a 10-card lot because the per-card due-diligence time is amortized. Third, time your sale — end of month, dealers are running their P&L and may stretch to clear inventory goals. Fourth, be willing to walk — the best single move in any negotiation is showing you have a better alternative (direct eBay sale, different dealer). Dealers know which sellers are desperate and price accordingly.',
  },
  {
    question: 'Is a dealer offer better than eBay for high-value cards?',
    answer: 'Usually no for cards over $500. eBay\'s 13.25% fee is lower than the 35-45% dealer discount, and high-value cards find the right buyer regardless of exposure. For cards under $100, dealer offers can be competitive with eBay once you factor your time to list, ship, and handle buyer questions. Under $25, dealer bulk offers often beat eBay net proceeds because eBay\'s fixed $0.40 per-transaction fee eats too much of the margin.',
  },
  {
    question: 'What is the velocity multiplier in the estimator?',
    answer: 'Velocity is the rate at which a card typically sells. Fast = sells within 30 days on eBay (current rookie stars, top-graded modern, current-year product). Medium = 30-90 day typical sell cycle (most modern non-rookie base, mid-tier vintage). Slow = 90+ days (commons, unloved sets, off-brand cards). Dealers offer about 10-15 percentage points more for fast cards than slow. The estimator applies a baseline offer percentage of 55% and adjusts ±10% based on velocity.',
  },
  {
    question: 'Does the card\'s grade change the offer percentage?',
    answer: 'Yes. Graded PSA 10 / BGS 9.5+ / SGC 10 cards get higher offer percentages (55-65% of retail) because they are easier to resell — the grade commands buyer confidence. Raw cards get lower offers (35-50%) because the dealer absorbs grading risk. Graded-but-sub-10 cards (PSA 8-9) sit in the middle. The estimator applies a grade multiplier of 1.15 for top-pop grades, 1.00 for mid-grade, 0.85 for raw.',
  },
  {
    question: 'Should I take a dealer offer or consign to an auction house?',
    answer: 'Depends on card value and time horizon. Cards under $500: dealer cash offer is usually faster + simpler and the consignment fees eat the delta. Cards $500-$2,000: toss-up — auction consignment (10-20% commission at PWCC, Heritage, Goldin) nets roughly the same as a 60% dealer cash offer but takes 3-6 months. Cards $2,000+: auction consignment usually wins by 10-25% because major auction houses drive competitive bidding that dealers cannot match. Rule: above $2K, take the wait. Below $500, take the cash.',
  },
  {
    question: 'Does this tool work for sealed wax too?',
    answer: 'Yes but with caveats. Dealer offers on sealed wax run lower percentages (35-50% of retail) because wax is capital-intensive to store and pricing is volatile. Sealed boxes of current-year product get the highest dealer offers (45-55% of retail). Vintage sealed (1980s-1990s) often gets bulk-rate offers (30-40%) because dealers cannot vouch for the contents and graded pack economics take over. Use the "Slow" velocity setting for most sealed wax and reduce the offer estimate by another 5-10 percentage points.',
  },
];

export default function CashOfferPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Dealer Cash Offer Estimator',
        description: 'Free estimator for dealer cash offers on sports cards and Pokemon cards. Factors velocity, grade, and brand tier.',
        url: 'https://cardvault-two.vercel.app/vault/cash-offer',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Velocity × Grade × Brand Math · Free · No Account
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Dealer Cash Offer Estimator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Before you walk into the card shop — know what they&apos;re likely to offer. Velocity, grade tier, and brand all move the number. See the expected offer range and the math behind it.
        </p>
      </div>

      <CashOfferClient />

      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Commerce Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/vault/bill-of-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📄</span>
            <div>
              <div className="text-white text-sm font-medium">Bill of Sale</div>
              <div className="text-gray-500 text-xs">Seller document</div>
            </div>
          </Link>
          <Link href="/vault/consignment" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏛️</span>
            <div>
              <div className="text-white text-sm font-medium">Consignment Tracker</div>
              <div className="text-gray-500 text-xs">Auction houses</div>
            </div>
          </Link>
          <Link href="/tools/best-offer" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💬</span>
            <div>
              <div className="text-white text-sm font-medium">Best Offer Calc</div>
              <div className="text-gray-500 text-xs">eBay offers</div>
            </div>
          </Link>
          <Link href="/vault/buyback" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🤝</span>
            <div>
              <div className="text-white text-sm font-medium">Buyback Calculator</div>
              <div className="text-gray-500 text-xs">Dealer buyback</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
