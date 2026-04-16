import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import OrderBookClient from './OrderBookClient';

export const metadata: Metadata = {
  title: 'Card Market Order Book — Live Depth of Market | CardVault',
  description: 'Stock exchange-style order book for sports cards. See simulated buy and sell orders at every price level, bid-ask spreads, market depth visualization, and recent trade flow for 6,500+ cards.',
  openGraph: {
    title: 'Card Market Order Book — CardVault',
    description: 'See the depth of market for any sports card. Simulated buy/sell orders, bid-ask spreads, and trade flow.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Order Book — CardVault',
    description: 'Stock exchange-style order book for sports cards. Market depth, bid-ask spreads, and trade flow.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Order Book' },
];

const faqItems = [
  {
    question: 'What is a card market order book?',
    answer: 'An order book is a concept from stock exchanges that shows all pending buy orders (bids) and sell orders (asks) at different price levels for a given asset. Our Card Market Order Book applies this concept to sports cards, showing simulated market depth so you can visualize where buyers and sellers cluster around a card\'s fair market value. Green bars represent buy interest, red bars represent sell pressure.',
  },
  {
    question: 'Is the order book data real?',
    answer: 'The order book uses simulated orders generated from real card data in our database of 6,500+ sports cards. Each card\'s estimated values (raw and gem mint) anchor the price levels, and the algorithm generates realistic bid/ask distributions based on card characteristics like age, sport, and value tier. The patterns mirror real market microstructure — tighter spreads on popular cards, wider spreads on niche ones.',
  },
  {
    question: 'What is the bid-ask spread and why does it matter?',
    answer: 'The bid-ask spread is the difference between the highest price a buyer is willing to pay (best bid) and the lowest price a seller is willing to accept (best ask). A tight spread (under 5%) indicates a liquid, actively-traded card where you can buy and sell near fair value. A wide spread (over 15%) suggests an illiquid card where you might struggle to sell quickly without accepting a significant discount.',
  },
  {
    question: 'How do I read the depth chart?',
    answer: 'The depth chart shows cumulative volume at each price level. On the bid side (green, left), bars extend from the current price downward — longer bars mean more buying interest. On the ask side (red, right), bars extend upward — longer bars mean more selling pressure. The widest bars indicate where most of the market sits. A balanced book (similar depth on both sides) suggests stable pricing, while imbalanced books can signal directional pressure.',
  },
  {
    question: 'Can I use this for actual trading decisions?',
    answer: 'While the data is simulated, the concepts are directly applicable to real card trading. Understanding market depth helps you set better buy/sell prices on eBay, at card shows, or with dealers. Cards with deep bid-side support are safer investments, while cards with thin order books are riskier. Use this alongside our Market Movers, Fear & Greed Index, and Price History tools for a complete market picture.',
  },
];

export default function OrderBookPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Order Book',
        description: 'Stock exchange-style order book for sports cards. See market depth, bid-ask spreads, and trade flow.',
        url: 'https://cardvault-two.vercel.app/order-book',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live Order Book &middot; Market Depth &middot; 6,500+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Order Book</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See the depth of market for any sports card. Simulated buy and sell orders, bid-ask spreads, and live trade flow — like a stock exchange for cards.
        </p>
      </div>

      <OrderBookClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Market Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/fear-greed', label: 'Fear & Greed Index', icon: '😱' },
            { href: '/market-sectors', label: 'Sector Report', icon: '🏛️' },
            { href: '/market-pulse', label: 'Market Pulse', icon: '💓' },
            { href: '/live-ticker', label: 'Price Ticker', icon: '📊' },
            { href: '/tools/price-history', label: 'Price History', icon: '📉' },
            { href: '/community-pulse', label: 'Community Pulse', icon: '📡' },
            { href: '/market-correlations', label: 'Correlations', icon: '🔗' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Track <Link href="/market-movers" className="text-emerald-400 hover:underline">today&apos;s market movers</Link>,
          check the <Link href="/fear-greed" className="text-emerald-400 hover:underline">Fear &amp; Greed Index</Link>,
          or see <Link href="/market-correlations" className="text-emerald-400 hover:underline">what drives card prices</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">85+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
