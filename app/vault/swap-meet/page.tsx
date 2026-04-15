import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SwapMeetClient from './SwapMeetClient';

export const metadata: Metadata = {
  title: 'Card Swap Meet — Trade Cards with Other Collectors | CardVault',
  description: 'Browse card trade listings from other collectors, list your own cards for swap, and propose trades with real-time fairness ratings. See 24 daily rotating listings across all sports with value comparison, trade history, and acceptance tracking. Free card trading simulator.',
  openGraph: {
    title: 'Card Swap Meet — Trade with Collectors | CardVault',
    description: 'Browse trade listings, list cards for swap, and propose trades with fairness ratings. Free card trading tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Swap Meet — CardVault',
    description: 'Browse card listings and propose trades with fairness ratings. Free card swap simulator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Swap Meet' },
];

const faqItems = [
  {
    question: 'How does the Card Swap Meet work?',
    answer: 'The Swap Meet is a simulated card trading marketplace. Browse 24 daily-rotating listings from AI collectors, each offering a card and specifying what sport and era they want in return. Search and filter by sport, then click a listing to propose a trade. Build your offer with up to 5 cards, see a real-time fairness rating, and submit. The collector responds based on trade fairness — fair trades get accepted, unfair ones get rejected. Track your trade history and acceptance rate over time.',
  },
  {
    question: 'What makes a trade "fair" in the Swap Meet?',
    answer: 'Trade fairness is calculated by comparing the total estimated value of your offered cards to the value of the card you want. If your offer is within 5% of their card\'s value, it\'s rated "Fair Trade." If you\'re offering more value, it\'s a "Great Deal" for you. If your offer is 80-95% of their card\'s value, it\'s "Slightly Under." Below 80% is rated "Bad Deal" and will likely be rejected. The key is matching values closely — offering multiple lower-value cards that total the same as one higher-value card is a valid strategy.',
  },
  {
    question: 'Can I list my own cards for trade?',
    answer: 'Yes! Go to the "My Listings" tab to search for and list up to 12 cards you want to trade. Your listings appear alongside AI collector listings in the browse view. The Swap Meet tracks your listed cards and total listed value. This is a simulation — no real cards change hands — but it helps you practice evaluating trades and understanding card values.',
  },
  {
    question: 'How often do the listings change?',
    answer: 'Listings rotate daily. Every day, 24 new cards are selected from the 6,200+ card database using a deterministic algorithm — so everyone sees the same listings on the same day. Each listing includes the collector\'s name, what sport and era they\'re looking for, and how long ago they "listed" the card. Check back daily for fresh trade opportunities.',
  },
  {
    question: 'Why would I use a trade simulator?',
    answer: 'The Swap Meet helps collectors practice three critical skills: trade evaluation (learning to assess whether a trade is fair based on card values), negotiation strategy (understanding that offering 2-3 cards for 1 premium card is a valid approach), and market awareness (seeing which cards are "worth" what across sports and eras). It\'s especially useful for newer collectors who want to build confidence before making real trades at card shows, online forums, or social media groups.',
  },
];

export default function SwapMeetPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Swap Meet',
        description: 'Browse card trade listings, list your cards, and propose trades with real-time fairness ratings. Free card trading simulator.',
        url: 'https://cardvault-two.vercel.app/vault/swap-meet',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          24 Daily Listings &middot; Trade Fairness Ratings &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Swap Meet
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Browse card listings from other collectors, build trade offers, and see if they accept. Practice evaluating trades before making real deals.
        </p>
      </div>

      <SwapMeetClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4 border-l-2 border-gray-800">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">More Vault Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/vault', label: 'My Vault', desc: 'View and manage your card collection' },
            { href: '/vault/showcase', label: 'Collection Showcase', desc: 'Create shareable card galleries' },
            { href: '/tools/trade', label: 'Trade Evaluator', desc: 'Compare two-sided trade values' },
            { href: '/trading-sim', label: 'Trading Simulator', desc: 'Simulated card trading game' },
            { href: '/marketplace', label: 'Marketplace', desc: 'Browse cards for sale' },
            { href: '/vault/wishlist', label: 'Wishlist', desc: 'Track cards you want to acquire' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition-colors"
            >
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
