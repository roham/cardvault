import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VaultClient from './VaultClient';

export const metadata: Metadata = {
  title: 'My Vault — Digital Card Collection & Portfolio | CardVault',
  description: 'View your digital card collection. Track vault value, P&L, sell cards back at 90% FMV, and manage your sports card portfolio. Open packs to grow your vault.',
  openGraph: {
    title: 'My Vault — CardVault',
    description: 'Your digital sports card collection. Track value, P&L, and sell back at 90% FMV.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Vault' },
];

const faqItems = [
  {
    question: 'What is the CardVault vault?',
    answer: 'Your vault is your personal digital card collection. Every card you pull from packs goes into your vault. You can view all your cards, track their total value, and see your profit/loss over time.',
  },
  {
    question: 'How do I sell cards from my vault?',
    answer: 'Click the "Sell Back (90%)" button on any card. You will receive 90% of the card\'s estimated fair market value as an instant credit to your wallet balance. The card is removed from your vault.',
  },
  {
    question: 'What does P&L mean?',
    answer: 'P&L stands for Profit and Loss. It shows the difference between the total estimated value of your vault cards and the amount you paid for the packs they came from. Green means you\'re up, red means you\'re down.',
  },
  {
    question: 'How do I get more cards?',
    answer: 'Visit the Pack Store to browse and open digital card packs. You start with a $250 welcome bonus. Cards from packs automatically go into your vault. You can also earn credits by selling cards back.',
  },
  {
    question: 'Is this real money?',
    answer: 'No. The vault is a prototype experience. All card data and values are real — sourced from eBay sold comps and auction records — but the wallet and purchases are simulated using your browser\'s local storage.',
  },
];

export default function VaultPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault — My Vault',
        description: 'Digital card collection vault. Track value, P&L, sell back at 90% FMV.',
        url: 'https://cardvault-two.vercel.app/vault',
        applicationCategory: 'GameApplication',
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
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">My Vault</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-gray-400 text-lg">
          Your digital card collection. Track value, sell back at 90% FMV, and grow your portfolio.
        </p>
      </div>

      <VaultClient />

      {/* Vault Features */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/vault/analytics" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📊</span>
          <div>
            <div className="text-white text-sm font-medium">Analytics</div>
            <div className="text-gray-500 text-xs">Portfolio breakdown and ROI</div>
          </div>
        </Link>
        <Link href="/vault/wishlist" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-white text-sm font-medium">Wishlist</div>
            <div className="text-gray-500 text-xs">Cards you want to buy</div>
          </div>
        </Link>
        <Link href="/vault/buyback" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">💰</span>
          <div>
            <div className="text-white text-sm font-medium">Buyback</div>
            <div className="text-gray-500 text-xs">Sell cards back at 90% FMV</div>
          </div>
        </Link>
        <Link href="/vault/insurance" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🛡️</span>
          <div>
            <div className="text-white text-sm font-medium">Insurance Estimator</div>
            <div className="text-gray-500 text-xs">Know your replacement value</div>
          </div>
        </Link>
        <Link href="/vault/showcase" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🖼️</span>
          <div>
            <div className="text-white text-sm font-medium">Showcase</div>
            <div className="text-gray-500 text-xs">Display your best cards</div>
          </div>
        </Link>
        <Link href="/vault/bulk-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📦</span>
          <div>
            <div className="text-white text-sm font-medium">Bulk Sale Calculator</div>
            <div className="text-gray-500 text-xs">Best way to sell your collection</div>
          </div>
        </Link>
        <Link href="/vault/liquidation" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🏷️</span>
          <div>
            <div className="text-white text-sm font-medium">Liquidation Planner</div>
            <div className="text-gray-500 text-xs">Sell your collection strategically</div>
          </div>
        </Link>
        <Link href="/vault/bundle-creator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📦</span>
          <div>
            <div className="text-white text-sm font-medium">Bundle Creator</div>
            <div className="text-gray-500 text-xs">Build lots for selling</div>
          </div>
        </Link>
        <Link href="/vault/auction-sniper" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-white text-sm font-medium">Auction Sniper</div>
            <div className="text-gray-500 text-xs">Bid on timed auctions vs AI</div>
          </div>
        </Link>
        <Link href="/vault/raffle" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🎟️</span>
          <div>
            <div className="text-white text-sm font-medium">Card Raffle</div>
            <div className="text-gray-500 text-xs">Enter raffles to win card prizes</div>
          </div>
        </Link>
        <Link href="/vault/loan-office" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🏦</span>
          <div>
            <div className="text-white text-sm font-medium">Loan Office</div>
            <div className="text-gray-500 text-xs">Borrow cash against your cards</div>
          </div>
        </Link>
        <Link href="/vault/ship-it" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📦</span>
          <div>
            <div className="text-white text-sm font-medium">Shipping Simulator</div>
            <div className="text-gray-500 text-xs">Pack & ship cards safely</div>
          </div>
        </Link>
        <Link href="/vault/cash-offer" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">💵</span>
          <div>
            <div className="text-white text-sm font-medium">Cash Offer Estimator</div>
            <div className="text-gray-500 text-xs">What a dealer will pay</div>
          </div>
        </Link>
        <Link href="/vault/shipping-claim" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📦</span>
          <div>
            <div className="text-white text-sm font-medium">Shipping Claim</div>
            <div className="text-gray-500 text-xs">Lost / damaged in transit</div>
          </div>
        </Link>
        <Link href="/vault/trade-contract" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🤝</span>
          <div>
            <div className="text-white text-sm font-medium">Trade Contract</div>
            <div className="text-gray-500 text-xs">Two-party swap agreement</div>
          </div>
        </Link>
        <Link href="/vault/break-agreement" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🎲</span>
          <div>
            <div className="text-white text-sm font-medium">Break Agreement</div>
            <div className="text-gray-500 text-xs">Group break participation contract</div>
          </div>
        </Link>
        <Link href="/vault/consignment-agreement" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">📜</span>
          <div>
            <div className="text-white text-sm font-medium">Consignment Agreement</div>
            <div className="text-gray-500 text-xs">Printable auction house contract</div>
          </div>
        </Link>
        <Link href="/vault/escrow-letter" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-xl">🔐</span>
          <div>
            <div className="text-white text-sm font-medium">Escrow Letter</div>
            <div className="text-gray-500 text-xs">Three-party high-value sale protection</div>
          </div>
        </Link>
      </div>

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
