import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionSniperClient from './AuctionSniperClient';

export const metadata: Metadata = {
  title: 'Card Auction Sniper — Bid & Win Cards in Live Auctions | CardVault',
  description: 'Compete against AI bidders in timed card auctions. Place bids, use auto-snipe mode, and win cards below market value. Track your auction wins, spending, and deal quality. Free card auction simulator for collectors.',
  openGraph: {
    title: 'Card Auction Sniper — Win Cards Below Market Value | CardVault',
    description: 'Bid on 20 timed auctions per session. Compete against 5 AI bidders with different strategies. Auto-snipe mode. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Auction Sniper — CardVault',
    description: 'Compete against AI bidders in timed card auctions. Place bids, snipe deals, and build your vault.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Auction Sniper' },
];

const faqItems = [
  {
    question: 'How does the Card Auction Sniper work?',
    answer: 'Each session presents 20 timed auctions featuring real cards from our database of 8,700+ sports cards. Auctions run for 45-90 seconds each with live countdown timers. You compete against 5 AI bidders (BidMaster42, SilentSniper, BargainHunter, NewCollector99, and CardSharkPro) who each have different bidding strategies. Place bids manually or use Auto-Snipe mode to automatically bid in the final seconds. Won cards are added to your vault at below-market prices.',
  },
  {
    question: 'What is Auto-Snipe mode?',
    answer: 'Auto-Snipe automatically places a bid for you in the last 5 seconds of any auction where you are not the high bidder. Set your maximum bid amount and the system will bid the minimum needed to win, up to your limit. This mimics real auction sniping services used on eBay and other platforms. It is especially effective against the BargainHunter AI who tends to bid early and stop.',
  },
  {
    question: 'How do the AI bidders behave?',
    answer: 'Each AI has a distinct strategy: BidMaster42 bids aggressively throughout the auction. SilentSniper waits until the last 8 seconds to bid. BargainHunter only bids on cards priced well below market value. NewCollector99 sometimes overbids out of excitement. CardSharkPro uses a calculated approach, bidding strategically in the final 20 seconds. Learning their patterns is key to winning.',
  },
  {
    question: 'What is the difference between Daily and Random auctions?',
    answer: 'Daily auctions are seeded by today\'s date — every user sees the same 20 cards at the same starting prices. This creates a shared daily experience similar to Wordle. Random auctions generate a fresh set of 20 cards each time, allowing unlimited practice. Your balance ($500) and stats carry across sessions via localStorage.',
  },
  {
    question: 'How is my balance calculated?',
    answer: 'You start each session with $500. Winning an auction deducts the final bid amount from your balance. If you are outbid, your money is returned automatically. The goal is to maximize the total market value of cards won while spending as little as possible. Your win rate, total spent, value acquired, and best deal percentage are all tracked.',
  },
];

export default function AuctionSniperPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Auction Sniper',
        description: 'Compete against AI bidders in timed card auctions. Place bids, use auto-snipe mode, and win cards below market value.',
        url: 'https://cardvault-two.vercel.app/vault/auction-sniper',
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
          Timed Auctions &middot; AI Bidders &middot; Auto-Snipe &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Auction Sniper</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Bid on 20 timed auctions per session. Compete against 5 AI bidders with different strategies.
          Use auto-snipe to win cards in the final seconds. Build your vault at below-market prices.
        </p>
      </div>

      <AuctionSniperClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Auction Strategies</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'The Patient Sniper', desc: 'Wait for auctions with low activity. Set auto-snipe at 70-80% of market value and let the system bid for you in the final seconds.' },
            { title: 'The Value Hunter', desc: 'Focus on auctions where current bid is below 50% of market value. Bid early to scare off BargainHunter AI, then hold your position.' },
            { title: 'The Rookie Specialist', desc: 'Target RC (Rookie Card) auctions specifically. These hold long-term value and AI bidders often undervalue them compared to market.' },
            { title: 'The Budget Manager', desc: 'With $500 for 20 auctions, be selective. Win 5-6 high-quality cards rather than spreading thin across many low-value auctions.' },
          ].map(s => (
            <div key={s.title} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Features</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/vault', label: 'My Vault', desc: 'View your card collection' },
            { href: '/vault/value-tracker', label: 'Value Tracker', desc: 'Track portfolio value over time' },
            { href: '/vault/negotiator', label: 'Price Negotiator', desc: 'Practice haggling with AI sellers' },
            { href: '/live/auction', label: 'Auction House', desc: 'Browse live auction listings' },
            { href: '/tools/quick-flip', label: 'Quick-Flip Scorer', desc: 'Rate flippability of any card' },
            { href: '/vault/bundle-creator', label: 'Bundle Creator', desc: 'Build lots from vault cards' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-amber-700/50 transition-colors">
              <span className="text-white text-sm font-medium">{t.label}</span>
              <span className="text-gray-500 text-xs block mt-0.5">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
