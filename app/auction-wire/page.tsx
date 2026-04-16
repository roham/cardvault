import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionWireClient from './AuctionWireClient';

export const metadata: Metadata = {
  title: 'Auction Wire — Live Countdown Feed of Card Auctions Ending Soon | CardVault',
  description: 'The live countdown ticker for sports card auctions. Twelve active auctions across eBay, PWCC, Goldin, Heritage, Whatnot — each with a ticking timer, live bid count, and platform badge. New bids land every few seconds. When the hammer drops, a fresh auction takes its place. Tier-coded urgency, sport filter, platform filter.',
  openGraph: {
    title: 'Auction Wire — CardVault',
    description: 'Live countdown feed of hobby auctions ending in the next hour. Platform-agnostic ticker, ever-refreshing.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Auction Wire — CardVault',
    description: 'Twelve hobby auctions, one live countdown. Which ones are about to hammer?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Auction Wire' },
];

const faqItems = [
  {
    question: 'What is Auction Wire?',
    answer: 'Auction Wire is a live countdown feed of sports card auctions ending across the major hobby platforms — eBay, PWCC Marketplace, Goldin, Heritage Auctions, Whatnot, and MySlabs. Every row shows one auction with its countdown timer, current bid, bidder count, platform badge, and a tier color indicating how close the hammer is. New bids land every few seconds; when an auction ends, it flashes SOLD and a fresh one rotates in. It\'s the closest simulation of the actual "auction finale" experience without logging into six different apps.',
  },
  {
    question: 'Are these real auctions or simulated?',
    answer: 'The cards are real (drawn from CardVault\'s 9,998-card database of actual sports and Pokemon cards), and the platforms and price ranges reflect real hobby-auction market dynamics. But the specific auctions are simulated — bid timers, bid counts, and price jumps are generated on-site for the demo feed. CardVault does not currently host live auctions. The "Bid on Platform" links take you to the appropriate external platform\'s search page for the card type. In a later phase, CardVault will integrate real auction API data so the wire shows actual cards ending now.',
  },
  {
    question: 'How do I read the urgency tiers?',
    answer: 'FOUR urgency tiers keyed to time remaining: 🔴 HAMMER TIME (under 60 seconds — expect rapid bid spam), 🟠 CLOSING (1-5 minutes — snipe window opening), 🟡 WARMING UP (5-15 minutes — bid activity building), ⚪ ACTIVE (15-60 minutes — casual watch). Each tier has its own color strip on the left edge of the row. At a glance you can tell which auctions need your attention now vs. which ones can be checked later.',
  },
  {
    question: 'What are the six platforms?',
    answer: 'eBay — highest volume, every tier, fee structure varies. PWCC Marketplace — slabbed-only focus, weekly Tuesday closures. Goldin — high-end consignment, monthly elite sales with extended bidding. Heritage Auctions — vintage + high-end weekly Sunday sales. Whatnot — live stream + timed auction hybrid, heavy on breaks-leftovers. MySlabs — boutique graded-card niche, usually 3-7 day timed. Each platform has its own fee schedule, buyer protection policies, and audience — the Auction Wire badges each so you know where a hit is coming from before clicking.',
  },
  {
    question: 'Why does the bid count keep jumping?',
    answer: 'Bid counts reflect unique bidders, not total bids — a single bidder raising themselves in a proxy bid war still counts as one. The number typically climbs in bursts near auction close when more bidders pile in. An auction with 47 bidders and 3 minutes left will usually see the price at least double in the final 60 seconds. Auction Wire simulates this pattern: final-minute bids land faster, price jumps get bigger, and sometimes a last-second snipe dramatically changes the outcome.',
  },
  {
    question: 'Can I filter the feed?',
    answer: 'Yes. Filter by sport (all / baseball / basketball / football / hockey / pokemon) and by platform (all / eBay / PWCC / Goldin / Heritage / Whatnot / MySlabs). Filters persist across feed refreshes — useful if you\'re only watching, say, PWCC vintage baseball. The 5-stat bar at the top reflects your filtered view: Active auctions in view, Ending in 5 min, Ending in 60 min, Just-Sold count, and Total Dollar Volume of active auctions visible.',
  },
  {
    question: 'Does this work on mobile?',
    answer: 'Yes. The wire stacks to a single-column list on phones with larger tap targets. Timers update in real time on both desktop and mobile. The pause button is prominent at the top of the feed for when you need to screenshot or step away.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Auction Wire',
  description: 'Live countdown feed of sports card auctions ending across eBay, PWCC, Goldin, Heritage, Whatnot, and MySlabs — tier-coded urgency, platform badges, real-time bid updates.',
  url: 'https://cardvault-two.vercel.app/auction-wire',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function AuctionWirePage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />
      <JsonLd data={appSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Live Auction Feed · 6 Platforms · Countdown Ticker
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Auction Wire
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            Twelve hobby auctions, one live feed. Countdown timers ticking down across eBay, PWCC, Goldin, Heritage, Whatnot, and MySlabs. Tier-coded urgency, live bids, new auctions rotate in when the hammer drops.
          </p>
        </div>

        <AuctionWireClient />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-indigo-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Other Live Feeds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/listing-wire" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">📋</span>
                <div>
                  <div className="font-semibold text-white text-sm">Listing Wire</div>
                  <div className="text-xs text-gray-400">New listings drop feed</div>
                </div>
              </Link>
              <Link href="/rip-wire" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">📦</span>
                <div>
                  <div className="font-semibold text-white text-sm">Rip Wire</div>
                  <div className="text-xs text-gray-400">Pack pull live feed</div>
                </div>
              </Link>
              <Link href="/mailday" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">📬</span>
                <div>
                  <div className="font-semibold text-white text-sm">Mailday Live</div>
                  <div className="text-xs text-gray-400">Card arrivals feed</div>
                </div>
              </Link>
              <Link href="/breakers-lounge" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">🎙️</span>
                <div>
                  <div className="font-semibold text-white text-sm">Breakers Lounge</div>
                  <div className="text-xs text-gray-400">Who is on the air</div>
                </div>
              </Link>
              <Link href="/card-wire" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">📰</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Wire</div>
                  <div className="text-xs text-gray-400">Hobby news ticker</div>
                </div>
              </Link>
              <Link href="/live-hub" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-2xl">📡</span>
                <div>
                  <div className="font-semibold text-white text-sm">Live Hub</div>
                  <div className="text-xs text-gray-400">All feeds directory</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
