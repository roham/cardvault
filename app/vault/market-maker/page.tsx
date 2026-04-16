import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketMakerClient from './MarketMakerClient';

export const metadata: Metadata = {
  title: 'Card Market Maker — Set Prices & Trade With AI | CardVault',
  description: 'Become the market maker for sports cards. Set your bid/ask prices on 5 cards, manage inventory as AI traders buy and sell. Learn spread management, inventory risk, and market dynamics. Real data from 9,600+ cards.',
  openGraph: {
    title: 'Card Market Maker — Set Prices & Trade With AI | CardVault',
    description: 'Set bid/ask spreads, manage inventory, and profit from card trading. AI traders buy and sell around your prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Maker — CardVault',
    description: 'Set prices. Manage inventory. Profit from the spread. Card trading simulator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Market Maker' },
];

const faqItems = [
  {
    question: 'What is the Card Market Maker?',
    answer: 'The Card Market Maker is a trading simulator where you act as a dealer making markets in sports cards. You set bid prices (what you will buy for) and ask prices (what you will sell for) on 5 cards. AI traders arrive with buy and sell orders. You profit from the bid-ask spread, but must manage inventory risk — if you buy too many cards, you are exposed to price changes.',
  },
  {
    question: 'How do bid and ask prices work?',
    answer: 'The bid price is what you offer to buy a card for. The ask price is what you will sell it for. The difference (the spread) is your potential profit per trade. Wider spreads mean more profit per trade but fewer trades. Narrow spreads attract more traders but with thinner margins. Finding the right balance is the core challenge.',
  },
  {
    question: 'What happens if I run out of inventory?',
    answer: 'If a buyer wants a card you don\'t have in inventory, you cannot fill the order and lose the sale. This is why managing your bid prices to attract sellers is important — you need inventory to sell. But holding too much inventory is risky if market prices shift.',
  },
  {
    question: 'How is the final score calculated?',
    answer: 'Your score is based on total profit from completed trades, minus inventory risk (unrealized gains or losses on cards you still hold). Grades range from S (exceptional market making) down to F. The most profitable market makers balance tight spreads with active inventory management.',
  },
  {
    question: 'Are the card prices real?',
    answer: 'All cards come from our database of 9,600+ real sports cards with estimated market values. Fair market value is used as the reference price. AI trader behavior and price movements are simulated to create realistic market dynamics.',
  },
];

export default function MarketMakerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Maker — Set Prices & Trade With AI',
        description: 'Trading simulator where you set bid/ask spreads on sports cards and manage inventory as AI traders buy and sell.',
        url: 'https://cardvault-two.vercel.app/vault/market-maker',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          MARKET OPEN &middot; Set Spreads &middot; Manage Risk
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Maker
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          You are the dealer. Set bid/ask prices on 5 cards, manage your inventory as AI traders buy and sell, and profit from the spread.
        </p>
      </div>

      <MarketMakerClient />

      {/* How It Works */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How Market Making Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h3 className="font-semibold text-emerald-400 mb-1">1. Set Your Spreads</h3>
            <p>For each of 5 cards, set a bid price (what you will buy at) and an ask price (what you will sell at). The gap is your profit margin.</p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-1">2. Attract Traders</h3>
            <p>AI traders arrive every few seconds with buy or sell orders. Competitive prices attract more volume. Wide spreads scare traders away.</p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-1">3. Manage Inventory</h3>
            <p>You need cards in inventory to sell. But holding too much is risky — if fair value drops, your inventory loses value. Balance is key.</p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-1">4. Lock In Profits</h3>
            <p>After 20 trades (or 2 minutes), the market closes. Your score = realized profits + unrealized inventory value. S through F grading.</p>
          </div>
        </div>
      </div>

      {/* Real-World Context */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Real-World Market Making</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>Market makers exist in every financial market — stocks, bonds, and yes, cards. Card dealers at shows are essentially market makers: they set buy prices (what they will pay you) and sell prices (what they charge), profiting from the spread.</p>
          <p>A typical card dealer spread is 30-50% (buy at $50, sell at $75-100). Online platforms have compressed this with transparency. Understanding market making helps you negotiate better at card shows and recognize fair dealer pricing.</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-lg">
              <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-gray-200 hover:text-white">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-400">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/vault/pawn-shop', label: 'Card Pawn Shop', icon: '🏪' },
          { href: '/vault/garage-sale', label: 'Garage Sale', icon: '🏷️' },
          { href: '/vault/auction-sniper', label: 'Auction Sniper', icon: '🎯' },
          { href: '/vault/negotiator', label: 'Price Negotiator', icon: '🤝' },
          { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
          { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💰' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-emerald-700/50 transition-colors">
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
