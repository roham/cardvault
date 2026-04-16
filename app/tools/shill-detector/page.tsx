import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShillDetectorClient from './ShillDetectorClient';

export const metadata: Metadata = {
  title: 'Shill Bid Detector — Is This Auction Being Run Up? | CardVault',
  description: 'Free shill-bidding risk scanner for sports card and Pokemon auctions. Enter bidder age, top-bidder share, timing pattern, cross-listing history, and retraction data — get a 0-100 shill risk score with an actionable verdict before you raise your bid.',
  openGraph: {
    title: 'Shill Bid Detector — CardVault',
    description: 'Before you raise your bid: score a hobby auction for shill risk. 9 signal axes, 6 red-flag toggles, 0-100 verdict.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Shill Bid Detector — CardVault',
    description: 'Is this auction being shilled? Free 0-100 risk scanner for eBay, Whatnot, MySlabs, and live-auction venues.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Shill Bid Detector' },
];

const faqItems = [
  {
    question: 'What is shill bidding?',
    answer: 'Shill bidding is when a seller (or a confederate working with the seller) places bids on the seller\u2019s own auction to artificially inflate the price. It is a form of auction fraud. eBay, Heritage, Goldin, PWCC, Whatnot, and every major hobby venue formally ban it. The goal of shilling is either to push a real buyer past their intended ceiling, to nudge the price over a hidden reserve, or to establish a false comp that supports the seller\u2019s other listings.',
  },
  {
    question: 'How can I spot a shill account before I bid?',
    answer: 'The clearest tell is a top bidder whose feedback is private or whose account is newly created and shows activity only on this seller\u2019s listings. Other strong signals: bid retractions during the auction, a step-ladder of 1-dollar bumps that stops exactly at the reserve, the same bidder appearing on 3 or more of the seller\u2019s other current and past listings, and a bidder whose share of total bids on the auction is over 60%. On eBay you can click the bid history and inspect each bidder\u2019s feedback profile; on Whatnot and Instagram Live you typically cannot, which is why those venues are higher-risk.',
  },
  {
    question: 'Why does "top bidder share of bids" matter so much?',
    answer: 'In a legitimate auction, the top bidder typically places 1-3 bids: an opening bid and one or two re-bids after being outbid. When a single account has placed 60% or more of the bids on a listing, the most common explanation is that the account is being used to walk a real buyer up the bid ladder. Real buyers do not bid against themselves repeatedly \u2014 eBay\u2019s proxy system already covers that automatically. The exception is live auctions (Whatnot, Goldin Elite), where a single bidder paddle may place many bids in the closing minute. Context matters.',
  },
  {
    question: 'What is the single biggest red flag?',
    answer: 'A top bidder with PRIVATE feedback, especially combined with cross-listing history. Private feedback hides the account\u2019s purchase patterns, and the most common reason an account hides those patterns is that the account only "buys" from one seller and returns the items. This is the core mechanic of a two-account shill setup. If the top bidder\u2019s feedback is private AND they have been the top bidder on 2 or more of this seller\u2019s recent listings, treat the auction as confirmed shill risk and cap your bid at your independent FMV (or walk away).',
  },
  {
    question: 'The auction has 20 bids and only 2 real-looking bidders. Is that bad?',
    answer: 'Not necessarily on its own \u2014 a real bidding war between two collectors over a grail can produce 20 bids from 2 accounts. What tips it into shill territory is when one of those two accounts has private feedback, was created recently, or also appears as runner-up on the seller\u2019s other auctions. A two-bidder war between two long-standing accounts with public history and different locations is just a real war. The detector weights both conditions together.',
  },
  {
    question: 'What should I do if the scanner flags SUSPICIOUS or LIKELY SHILL?',
    answer: 'First, stop bidding. Do not place another proxy-raise that chases the inflated count. Second, document: take screenshots of the bid history, bidder feedback state, and any cross-listing evidence with timestamps. Third, report. On eBay: Report Listing \u2192 Fraudulent Activity \u2192 Shill Bidding. On Whatnot: in-app Report Host. On Goldin / Heritage / PWCC: email the house directly with your evidence. Fourth, if you still want the card, bid exactly your independent FMV one time and walk away if outbid \u2014 shill ladders collapse once the real bidder stops chasing.',
  },
  {
    question: 'Does eBay really catch shill bidders?',
    answer: 'eBay runs algorithmic detection (shared device fingerprints, IP correlation, inter-account messaging patterns) and occasionally publishes enforcement actions, but most individual cases go undetected for months or years unless a buyer reports them with evidence. Auction houses like Goldin and Heritage have stronger controls because consignors have real-world contracts with financial penalties. Unmoderated venues (Facebook groups, Instagram Live, Twitter DM auctions) have effectively zero detection \u2014 this detector is most valuable precisely because platform-side enforcement is uneven.',
  },
];

export default function ShillDetectorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Shill Bid Detector',
        description: 'Interactive shill-bidding risk scoring tool for hobby auctions. Combines bidder age, top-bidder share, bid timing, reserve pattern, feedback visibility, cross-listing history, retractions, and price-vs-FMV into a 0-100 risk score with verdict and recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/shill-detector',
        applicationCategory: 'SecurityApplication',
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
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          Shill Risk &middot; 0-100 score &middot; 9 signal axes &middot; 6 red-flag toggles
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Shill Bid Detector</h1>
        <p className="text-gray-400 text-lg">
          Before you raise your bid, score the auction. The detector combines top-bidder share, account age, bid timing, reserve behavior, feedback visibility, cross-listing pattern, retraction history, and price-vs-FMV into a 0-100 shill risk score with a verdict and next-step playbook.
        </p>
      </div>

      <ShillDetectorClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-yellow-300 transition-colors">
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
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/counterfeit-scanner" className="text-yellow-300 hover:text-yellow-200">Counterfeit Risk Scanner</Link>
          <Link href="/tools/auction-bid" className="text-yellow-300 hover:text-yellow-200">Auction Bid Calculator</Link>
          <Link href="/tools/best-offer" className="text-yellow-300 hover:text-yellow-200">Best Offer Calculator</Link>
          <Link href="/tools/negotiation-calc" className="text-yellow-300 hover:text-yellow-200">Negotiation Calculator</Link>
          <Link href="/tools/comp-calculator" className="text-yellow-300 hover:text-yellow-200">Comp Calculator</Link>
          <Link href="/auction-wire" className="text-yellow-300 hover:text-yellow-200">Auction Wire</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-yellow-300 hover:text-yellow-200">&larr; All Tools</Link>
        <Link href="/guides" className="text-yellow-300 hover:text-yellow-200">Guides</Link>
        <Link href="/" className="text-yellow-300 hover:text-yellow-200">Home</Link>
      </div>
    </div>
  );
}
