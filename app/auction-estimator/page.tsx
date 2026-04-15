import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionEstimatorClient from './AuctionEstimatorClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Auction House Estimator — Compare Heritage, Goldin, PWCC, eBay & LCS',
  description: 'Free auction house comparison tool for sports cards. Estimate hammer prices, commissions, and net proceeds across Heritage Auctions, Goldin, PWCC, eBay, and your local card shop. Find the best place to sell your cards.',
  openGraph: {
    title: 'Auction House Estimator — CardVault',
    description: 'Compare what your cards would sell for at Heritage, Goldin, PWCC, eBay, and LCS. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Auction House Estimator — CardVault',
    description: 'Which auction house is best for your cards? Compare 5 venues with net proceeds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Auction House Estimator' },
];

const faqItems = [
  {
    question: 'Which auction house is best for selling sports cards?',
    answer: 'It depends on your cards. Heritage Auctions is best for vintage cards (pre-1980) worth $500+. Goldin excels with modern high-end cards ($1,000+) and autographs. PWCC handles the most volume and is great for mid-range cards ($100-$2,000). eBay gives you the widest audience and fastest turnaround. Your local card shop (LCS) is best for quick cash on lower-value cards.',
  },
  {
    question: 'What fees do auction houses charge for sports cards?',
    answer: 'Commission rates typically range from 8-15% of the hammer price for sellers. Heritage charges around 10%, Goldin around 8%, PWCC around 8.5%, and eBay takes 13.25% in final value fees. Most major auction houses also charge a buyers premium (18-20%) which is paid by the buyer, not the seller. Local card shops typically offer 60-70% of market value.',
  },
  {
    question: 'What is a buyers premium at a card auction?',
    answer: 'A buyers premium is an additional fee charged to the winning bidder on top of the hammer price. For example, if a card sells for $1,000 with a 20% buyers premium, the buyer pays $1,200 total. This premium goes to the auction house and is separate from the seller commission. As a seller, the buyers premium does not directly affect your payout.',
  },
  {
    question: 'How long does it take to get paid from a card auction?',
    answer: 'Timelines vary significantly. eBay auctions settle in 7-10 days. PWCC runs weekly auctions with 14-30 day payout. Goldin typically takes 30-60 days from consignment to payment. Heritage Auctions can take 60-90 days for scheduled auctions. Local card shops pay immediately. Factor in shipping time when you consign — you need to ship cards to the auction house before they can be listed.',
  },
  {
    question: 'Is it better to sell cards at auction or on eBay?',
    answer: 'For cards worth over $500, major auction houses often achieve higher prices due to their curated buyer base and marketing. For cards under $200, eBay or direct sales are usually more efficient since auction house minimums and timelines make small lots impractical. Cards in the $200-$500 range are a judgment call — PWCC and eBay are both good options depending on volume and convenience.',
  },
];

export default function AuctionEstimatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Auction House Estimator',
        description: 'Compare estimated auction proceeds across Heritage, Goldin, PWCC, eBay, and local card shops. Find the best place to sell your sports cards.',
        url: 'https://cardvault-two.vercel.app/auction-estimator',
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Compare 5 Selling Venues &middot; Real Commission Rates
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Auction House Estimator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Where should you sell your cards? Compare estimated hammer prices, commission fees, and net proceeds across Heritage, Goldin, PWCC, eBay, and your local card shop.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">1.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Add Your Cards</h3>
          <p className="text-gray-500 text-xs">Search our database of 5,700+ sports cards and add the ones you want to sell.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">2.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Compare Venues</h3>
          <p className="text-gray-500 text-xs">See estimated hammer prices and fees across Heritage, Goldin, PWCC, eBay, and LCS.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">3.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Maximize Proceeds</h3>
          <p className="text-gray-500 text-xs">Find the best option for each card based on value, speed, and convenience.</p>
        </div>
      </div>

      {/* Calculator */}
      <AuctionEstimatorClient />

      {/* Auction House Details */}
      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Auction House Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-amber-400 font-bold mb-2">Heritage Auctions</h3>
            <p className="text-gray-400 text-sm mb-3">Founded in 1976, Heritage is the world&apos;s largest collectibles auction house. They run signature auctions for high-value consignments and weekly online auctions for mid-range cards.</p>
            <ul className="text-gray-500 text-xs space-y-1">
              <li>Seller commission: ~10%</li>
              <li>Buyer&apos;s premium: 20%</li>
              <li>Best for: Vintage PSA-graded cards $500+</li>
              <li>Timeline: 60-90 days</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-emerald-400 font-bold mb-2">Goldin</h3>
            <p className="text-gray-400 text-sm mb-3">Goldin (formerly Goldin Auctions) became the go-to platform for modern premium cards, often featuring celebrity-owned collections and record-breaking sales.</p>
            <ul className="text-gray-500 text-xs space-y-1">
              <li>Seller commission: ~8%</li>
              <li>Buyer&apos;s premium: 20%</li>
              <li>Best for: Modern stars $1K+, premium parallels</li>
              <li>Timeline: 30-60 days</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-blue-400 font-bold mb-2">PWCC</h3>
            <p className="text-gray-400 text-sm mb-3">PWCC is the largest dedicated trading card marketplace, processing millions of cards annually through weekly auction cycles. Their volume attracts competitive bidding.</p>
            <ul className="text-gray-500 text-xs space-y-1">
              <li>Seller commission: ~8.5%</li>
              <li>Buyer&apos;s premium: 18%</li>
              <li>Best for: Volume sellers, mid-range $100-$2K</li>
              <li>Timeline: 14-30 days</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-red-400 font-bold mb-2">eBay</h3>
            <p className="text-gray-400 text-sm mb-3">eBay remains the largest marketplace for cards at every price point. DIY sellers control pricing, photography, and shipping but handle all the work themselves.</p>
            <ul className="text-gray-500 text-xs space-y-1">
              <li>Final value fee: 13.25%</li>
              <li>No buyer&apos;s premium</li>
              <li>Best for: All price points, DIY sellers</li>
              <li>Timeline: 7-10 days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/selling-platforms', label: 'Selling Platform Comparison' },
            { href: '/tools/flip-calc', label: 'Flip Calculator' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator' },
            { href: '/tools/collection-value', label: 'Collection Value' },
            { href: '/tools/appraisal-report', label: 'Appraisal Report' },
            { href: '/tools/rip-or-hold', label: 'Rip or Hold Calculator' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
