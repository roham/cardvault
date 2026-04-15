import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PriceAlert from './PriceAlert';

export const metadata: Metadata = {
  title: 'Card Price Alert Generator — Set Buy & Sell Targets for Any Card',
  description: 'Free card price alert generator. Set target buy or sell prices for any sports card. Get eBay search links, bidding strategy, and market context. Track multiple cards with personalized alerts.',
  openGraph: {
    title: 'Card Price Alert Generator — CardVault',
    description: 'Set buy/sell price targets on any card. eBay links, bid strategy, market context. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Alert Generator — CardVault',
    description: 'Track card prices and know when to buy or sell. Free alert generator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Price Alert Generator' },
];

const faqItems = [
  {
    question: 'How do the price alerts work?',
    answer: 'Set a target price (buy or sell) for any card in our 5,500+ database. The tool generates an eBay saved search link with your max price, shows where your target sits relative to market value, and provides a bidding strategy. Since we cannot send real-time notifications, bookmark your alerts page and check it when shopping.',
  },
  {
    question: 'What is the bid strategy recommendation?',
    answer: 'Based on your target price vs estimated market value, we recommend: Snipe (target is 20%+ below market — set max bid and wait for underpriced auctions), Watch (target is within 10-20% of market — be patient, deals come regularly), Buy Now (target is at or above market — plenty of listings available), or Stretch (target is far below market — you may need to increase your budget).',
  },
  {
    question: 'Can I track multiple cards at once?',
    answer: 'Yes! Add as many cards as you want with individual target prices. All alerts are saved in your browser so they persist between visits. You get a summary of all active alerts with their status.',
  },
  {
    question: 'How accurate are the market value estimates?',
    answer: 'Our estimates are based on recent sold prices and reflect approximate market values. Actual selling prices vary by condition, seller reputation, listing format (auction vs BIN), and timing. Use the eBay search links to check real-time sold comps before buying.',
  },
  {
    question: 'Should I set alerts for raw or graded cards?',
    answer: 'Both! We show estimated values for both raw and gem mint (PSA 10) versions. If you are buying raw to submit for grading, set your alert on the raw price. If you are buying already graded, compare gem value to your target. The tool helps you decide which approach gives better ROI.',
  },
];

export default function PriceAlertPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price Alert Generator',
        description: 'Set buy/sell price targets for sports cards. eBay search links, bid strategy, market context. Track multiple cards. Free.',
        url: 'https://cardvault-two.vercel.app/tools/price-alert',
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
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          5,500+ Cards &middot; Buy/Sell Targets &middot; eBay Links &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Price Alert Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set target buy and sell prices for any card. Get eBay search links, bidding strategy, and know exactly when a card hits your price.
        </p>
      </div>

      <PriceAlert />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-sky-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track card prices with sparkline trends' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit after platform fees' },
            { href: '/tools/break-even', label: 'Break-Even Calculator', desc: 'Minimum sell price after all fees' },
            { href: '/tools/heat-score', label: 'Collection Heat Score', desc: 'Know when to sell based on market heat' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
