import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PawnShopClient from './PawnShopClient';

export const metadata: Metadata = {
  title: 'Card Pawn Shop — Sell Cards to an AI Broker & Learn Negotiation | CardVault',
  description: 'Bring any sports card to our virtual pawn shop. Negotiate with Vinny the Card Broker across 3 rounds. Learn real-world selling dynamics, see what dealers actually pay, and compare to eBay, COMC, and card shows. Search 9,000+ cards.',
  openGraph: {
    title: 'Card Pawn Shop — Negotiate with an AI Card Broker | CardVault',
    description: 'Pawn your sports cards to Vinny. 3 rounds of negotiation. See what dealers really pay vs eBay and card shows.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Pawn Shop — CardVault',
    description: 'Virtual card pawn shop. Negotiate with an AI dealer. Learn real selling dynamics.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Pawn Shop' },
];

const faqItems = [
  {
    question: 'What is the CardVault Card Pawn Shop?',
    answer: 'The Card Pawn Shop is an interactive simulation where you bring any sports card from our database of 9,000+ cards and negotiate with Vinny, an AI card broker. He makes an opening offer (typically 40-55% of market value) and you can counter-offer up to 3 rounds to get a better price. It teaches real-world selling dynamics — what dealers actually pay vs what you might get on eBay or at card shows.',
  },
  {
    question: 'How much does Vinny typically offer?',
    answer: 'Opening offers range from 40-55% of estimated market value, similar to real pawn shops and dealer buylists. Through negotiation, you can push offers up to 58-72% of market value. For comparison, eBay nets about 85% after fees, COMC about 80%, and card show dealers typically offer 50-65% for instant cash. The simulation teaches you these real-world dynamics.',
  },
  {
    question: 'Is real money involved?',
    answer: 'No. The Card Pawn Shop is a free educational simulation. No real money changes hands, no real cards are sold. It uses your browser local storage to track your negotiation history and stats. The goal is to teach collectors about sell-side pricing, dealer margins, and negotiation tactics they can use in real transactions.',
  },
  {
    question: 'Can I negotiate more than 3 rounds?',
    answer: 'No, you have a maximum of 3 negotiation rounds, mirroring real-world dealer interactions. Most in-person card sales involve 1-3 back-and-forth exchanges before a deal is reached or the seller walks away. Using all 3 rounds typically gets you the best price — Vinny increases his offer with each counter.',
  },
  {
    question: 'How are card values determined?',
    answer: 'Card values come from estimated raw market prices in the CardVault database, based on recent eBay sold listings, auction house results, and market trends. The pawn shop offer is calculated as a percentage of this market value, factoring in what real dealers would pay for instant-buy inventory.',
  },
];

export default function PawnShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Pawn Shop',
        description: 'Interactive card pawn shop simulation. Negotiate with an AI card broker to learn real-world selling dynamics.',
        url: 'https://cardvault-two.vercel.app/vault/pawn-shop',
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
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Card Pawn Shop &middot; Negotiate &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Pawn Shop</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Bring any sports card to Vinny the Card Broker. Negotiate across 3 rounds to get the best price.
          Learn what dealers actually pay and how it compares to selling on eBay, COMC, or at card shows.
        </p>
      </div>

      <PawnShopClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center gap-2">
                <span className="text-amber-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/vault" className="text-amber-400 hover:underline">CardVault Vault</Link> experience.
          See also: <Link href="/vault/negotiator" className="text-amber-400 hover:underline">Price Negotiator</Link>,{' '}
          <Link href="/vault/auction-sniper" className="text-amber-400 hover:underline">Auction Sniper</Link>,{' '}
          <Link href="/tools/flip-calc" className="text-amber-400 hover:underline">Flip Calculator</Link>,{' '}
          <Link href="/vault/bulk-sale" className="text-amber-400 hover:underline">Bulk Sale Calculator</Link>,{' '}
          <Link href="/vault/liquidation" className="text-amber-400 hover:underline">Liquidation Planner</Link>.
        </p>
      </div>
    </div>
  );
}
