import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GarageSaleClient from './GarageSaleClient';

export const metadata: Metadata = {
  title: 'Card Garage Sale — Price, List & Sell Your Cards | CardVault',
  description: 'Host a virtual card garage sale! List cards from 9,000+ database, set your prices, and watch simulated buyers decide what to buy. Learn pricing psychology and compare returns to eBay, card shows, and LCS buylists.',
  openGraph: {
    title: 'Card Garage Sale — Price & Sell Simulator | CardVault',
    description: 'Price your cards and watch buyers decide. Learn pricing psychology for card selling.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Garage Sale — CardVault',
    description: 'Virtual card garage sale. List cards, set prices, watch buyers decide. Free selling simulator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Garage Sale' },
];

const faqItems = [
  {
    question: 'What is the Card Garage Sale?',
    answer: 'The Card Garage Sale is a pricing and selling simulator. You search for cards from our database of 9,000+ sports cards, set your asking prices, and then open your virtual sale. Simulated buyers with different personalities (bargain hunters, fair dealers, PC collectors) browse your table and decide whether to buy based on your pricing. After 2 minutes, you see your results: total earned, recovery percentage, and how it compares to selling on other platforms.',
  },
  {
    question: 'How does pricing affect sales?',
    answer: 'Pricing at 50% of market value or less results in instant sales. 60-80% is competitive and attracts most buyer types. 80-100% of market value is normal but slower. Over 100% of market value means very few buyers will bite — only PC collectors willing to overpay for cards they need. The sweet spot for most sellers is 70-80% of market value.',
  },
  {
    question: 'What buyer types are simulated?',
    answer: 'Five buyer types visit your sale: Bargain Hunters (only buy at 50%+ off), Fair Dealers (pay near market), Impulse Buyers (buy almost anything priced right), Flippers (need 30% margin), and PC Collectors (pay full price for the right card). Each buyer type represents a real archetype you would encounter at an actual card show or garage sale.',
  },
  {
    question: 'How does this compare to real selling methods?',
    answer: 'After your sale, we compare your results to six real selling methods: eBay (nets ~85% after fees), Facebook Groups (~90% but slower), COMC (~80%), Card Show Dealers (~55%), LCS Buylists (~50%), and Bulk Lots (~40%). This helps you understand if your pricing was competitive with real-world alternatives.',
  },
  {
    question: 'Can I adjust prices during the sale?',
    answer: 'Currently, prices are set before the sale starts. This teaches an important lesson: know your floor price before you start selling. In real card shows, changing prices mid-event signals desperation and leads to lower offers. Set your prices with confidence beforehand.',
  },
];

export default function GarageSalePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Garage Sale',
        description: 'Virtual card garage sale simulator. List cards, set prices, and watch simulated buyers decide.',
        url: 'https://cardvault-two.vercel.app/vault/garage-sale',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Selling Sim &middot; 9,000+ Cards &middot; 5 Buyer Types
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Garage Sale
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">
          Host a virtual garage sale for your sports cards. Set your prices, watch buyers browse your table, and learn the pricing psychology that separates profitable sellers from leaving money on the table.
        </p>
      </div>

      <GarageSaleClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-zinc-200 hover:text-white">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/vault/pawn-shop', label: 'Card Pawn Shop', desc: 'Negotiate with AI broker' },
            { href: '/vault/flash-sale', label: 'Flash Sales', desc: 'Limited-time deals' },
            { href: '/vault/negotiator', label: 'Price Negotiator', desc: 'Haggle with AI sellers' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate flip profits' },
            { href: '/vault/bulk-sale', label: 'Bulk Sale Calc', desc: 'Compare selling methods' },
            { href: '/vault/liquidation', label: 'Liquidation Planner', desc: 'Clear your collection' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600 transition-colors">
              <div className="text-sm font-medium text-white">{link.label}</div>
              <div className="text-xs text-zinc-500">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
