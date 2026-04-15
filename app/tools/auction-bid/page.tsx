import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionBidClient from './AuctionBidClient';

export const metadata: Metadata = {
  title: 'Auction Bid Calculator — True Cost of Winning a Card Auction | CardVault',
  description: 'Calculate the real cost of winning a card auction. Factor in buyer\'s premiums (15-25%), sales tax, shipping, and grading costs. Compare Heritage, Goldin, PWCC, Lelands, REA, and eBay side by side. Reverse-calculate your max bid from a total budget. Never overpay at auction again.',
  openGraph: {
    title: 'Auction Bid Calculator — CardVault',
    description: 'See the TRUE cost of winning a card auction — buyer\'s premiums, tax, shipping, grading. Compare 8 auction houses.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Auction Bid Calculator — CardVault',
    description: 'Calculate the true cost of winning any card auction. Compare 8 auction houses.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Auction Bid Calculator' },
];

const faqItems = [
  {
    question: 'What is a buyer\'s premium at card auctions?',
    answer: 'A buyer\'s premium is an additional percentage charged on top of your winning bid (hammer price) by the auction house. Most major card auction houses like Heritage, Goldin, PWCC, and Lelands charge a 20% buyer\'s premium. So if you win a card for $500, you actually owe $600 before tax and shipping. eBay auctions generally have no buyer\'s premium — the hammer price is what you pay. This premium is pure revenue for the auction house and is the single biggest hidden cost in card auctions.',
  },
  {
    question: 'How do I calculate the true cost of an auction win?',
    answer: 'Add together: (1) the hammer price (your winning bid), (2) the buyer\'s premium (typically 15-20% of the hammer), (3) applicable sales tax on the total of hammer + premium, (4) shipping cost, and (5) grading cost if the card is raw and you plan to grade it. For example, a $1,000 winning bid at Heritage becomes: $1,000 + $200 premium + $96 tax (8%) + $15 shipping = $1,311 total. That\'s 31% more than the hammer price.',
  },
  {
    question: 'Which auction house has the lowest total cost?',
    answer: 'eBay auctions have zero buyer\'s premium, making them the cheapest option in terms of added fees. However, eBay lacks the authentication guarantees and professional grading verification that Heritage, Goldin, and PWCC provide. For high-value cards ($1,000+), the premium at a reputable auction house may be worth it for the added confidence. For sub-$500 cards, eBay or Probstein123 (which runs eBay auctions) typically gives the best total cost.',
  },
  {
    question: 'How do I figure out my maximum bid at auction?',
    answer: 'Use the Max Bid Finder mode: enter your total budget (the absolute maximum you\'re willing to spend), your tax rate, and whether you need grading. The calculator works backwards to tell you the highest hammer price you can bid at each auction house while staying within budget. For example, with a $1,000 budget at Heritage (20% premium, 8% tax), your max bid is about $772 — the premium, tax, and shipping eat the rest.',
  },
  {
    question: 'Should I factor in grading costs when bidding on raw cards?',
    answer: 'Absolutely. If you\'re buying a raw card with the intent to grade it, the grading cost is part of your total investment. PSA Economy is $20 but takes 180+ days. SGC Economy is $15 and faster. Factor this in BEFORE you bid — a $200 raw card that costs $50 to grade (PSA Regular) and comes back a PSA 8 (not a PSA 10) can easily become a losing investment. Use the grading toggle in the calculator to include these costs automatically.',
  },
];

export default function AuctionBidPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Auction Bid Calculator',
        description: 'Calculate the true cost of winning a card auction. Compare buyer\'s premiums, tax, shipping, and grading costs across Heritage, Goldin, PWCC, Lelands, REA, eBay, MySlabs, and Probstein123.',
        url: 'https://cardvault-two.vercel.app/tools/auction-bid',
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
          8 Auction Houses &middot; True Cost &middot; Max Bid Finder
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Auction Bid Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Never overpay at a card auction. See the true landed cost of any winning bid — including buyer&apos;s premiums,
          tax, shipping, and grading. Compare 8 auction houses side by side or reverse-calculate your max bid from a budget.
        </p>
      </div>

      <AuctionBidClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit after fees' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Returns vs benchmarks' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', desc: 'Seller fees breakdown' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Is grading worth it?' },
            { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Compare grading tiers' },
            { href: '/vault/consignment', label: 'Consignment Tracker', desc: 'Track auction submissions' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
