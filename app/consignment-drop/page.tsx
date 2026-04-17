import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ConsignmentDropClient from './ConsignmentDropClient';

export const metadata: Metadata = {
  title: 'Consignment Drop Live — Fresh Auction-Catalog Listings Feed | CardVault',
  description: 'Live feed of new auction consignments landing in catalogs before active bidding opens. Six major houses (PWCC, Goldin, Heritage, REA, Lelands, Fanatics Collect) tracked with estimate bands, catalog blurb, lot number, time-to-bidding-open. Filter by house, sport, minimum estimate. The collector\'s first-look advantage.',
  openGraph: {
    title: 'Consignment Drop Live — CardVault',
    description: 'Fresh auction consignments landing in catalogs before bidding opens. Collectors see them first.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Consignment Drop Live — CardVault',
    description: 'Live feed of new auction catalog listings. Before the bidders arrive.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Consignment Drop' },
];

const faqItems = [
  {
    question: 'What is a consignment drop?',
    answer: 'A consignment drop is the moment a new lot is added to an auction house\'s public catalog — typically 1-4 weeks before bidding actually opens. Major auction houses (PWCC, Goldin, Heritage, REA, Lelands, Fanatics Collect) stagger new consignments continuously, not all at once, so serious collectors monitor catalogs for fresh listings matching their grails. The consignment-drop window is the "first-look" period before the wider bidder pool arrives, when informed buyers can decide whether to set alerts, pre-plan max-bid strategy, or opportunistically reach out to the house for a buy-it-now option.',
  },
  {
    question: 'How is this different from Auction Wire?',
    answer: 'Auction Wire shows lots with ACTIVE bidding and countdown timers — the closing window of any auction. Consignment Drop shows lots that have been LISTED in a catalog but haven\'t opened for bidding yet — typically with days or weeks to go. Different user intents: Auction Wire is for snipers and last-minute bidders; Consignment Drop is for portfolio planners, grail hunters setting alerts, and budget-strategic buyers who need time to arrange capital. Both are simulated feeds calibrated to realistic cadence — Consignment Drop fires every 6 seconds on average (slower than Auction Wire because new catalog listings are less frequent than closing auctions).',
  },
  {
    question: 'Which auction houses are tracked?',
    answer: 'Six major hobby houses, each with distinct strength. PWCC — modern-dominant, weekly and premier auctions, largest hobby-specialist brand. Goldin — high-end vintage and modern blue-chip, founder-brand strength, heavy TV presence. Heritage — vintage-focused, institutional-weight, also handles coins/comics/art. REA (Robert Edward Auctions) — pre-war baseball specialist, smaller but prestigious calendar. Lelands — vintage-focused, strong memorabilia component. Fanatics Collect (formerly PWCC Fanatics acquisition + in-house) — newest major, Fanatics distribution integrated, growing modern share. House filter chips let you scope the feed to the houses you actually buy from.',
  },
  {
    question: 'What are the estimate bands?',
    answer: 'Auction houses publish estimate ranges (low-high) for each lot — the range within which they expect the lot to hammer. $100+ is the minimum-volume filter (nearly all catalog lots clear this). $500+ focuses on meaningful single-card lots. $1K+ is the hobby\'s "serious" lot band where most flipper and investor attention concentrates. $5K+ is grail-adjacent. $25K+ is grail-tier where only the top houses carry most volume. Estimate bands inform how much time and planning to invest in any given drop — a $200 estimate lot might close before you can arrange capital; a $15K estimate lot gives you days of runway.',
  },
  {
    question: 'Is there a first-look advantage to monitoring drops?',
    answer: 'Modest but real. For $1K-$10K range cards, the first 24-48 hours after a catalog drop is when informed buyers can (a) research comps to establish their max bid before competition arrives, (b) email the house to negotiate a private buy-now if the estimate looks attractive, (c) set alerts at their max price for disciplined bidding on opening day, (d) identify hidden gems the cataloger mis-titled or under-described. For $25K+ lots, first-look advantage shrinks (institutional bidders watch all major houses continuously). For sub-$500 lots, first-look matters less because the volume is too high to chase every catalog add.',
  },
  {
    question: 'What about pre-bidding lots?',
    answer: 'Some houses (PWCC, Goldin) accept pre-bids on lots that have been listed but aren\'t officially open yet. Pre-bids don\'t close the lot but they establish an opening price for the live auction. Serious collectors use pre-bids strategically: (a) to establish an "I\'m interested" signal that may discourage other pre-bidders, (b) to set a proxy bid that gets executed automatically during the live auction. The Consignment Drop feed doesn\'t track pre-bid status per event, but you can assume any $1K+ lot in a major-house catalog has probably received at least one pre-bid before bidding opens formally.',
  },
  {
    question: 'Can I save specific cards for alert?',
    answer: 'Yes. Each event has a Watch button (toggle) that adds the card to a persistent local watchlist (up to 20 slugs). Watchlist state survives page reloads via localStorage. The watchlist is a personal alert list — when you return to Consignment Drop or Grail Watch later, watched cards are visually highlighted in the feed. It does NOT email or notify you when a watched card appears; for true alerts, set up saved searches on the auction houses themselves.',
  },
];

export default function ConsignmentDropPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Consignment Drop Live',
        description: 'Live simulated feed of new auction-catalog consignments before bidding opens. Six major auction houses tracked (PWCC, Goldin, Heritage, REA, Lelands, Fanatics Collect) with estimate bands, sport filter, house filter, watchlist tracking.',
        url: 'https://cardvault-two.vercel.app/consignment-drop',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Pre-bidding catalog feed &middot; 6 houses &middot; before the auction opens
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Consignment Drop Live</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Auction Wire watches lots closing. Consignment Drop watches lots OPENING. Fresh listings landing in PWCC, Goldin, Heritage, REA, Lelands, and Fanatics Collect catalogs &mdash; before the bidder pool arrives, before the runup to close. The collector&rsquo;s first-look window to research, plan, and strategize.
        </p>
      </div>

      <ConsignmentDropClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Live Feeds</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/auction-wire" className="text-indigo-300 hover:text-indigo-200">Auction Wire (closing)</Link>
          <Link href="/grail-watch" className="text-indigo-300 hover:text-indigo-200">Grail Watch ($1K+)</Link>
          <Link href="/steal-watch" className="text-indigo-300 hover:text-indigo-200">Steal Watch</Link>
          <Link href="/rip-wire" className="text-indigo-300 hover:text-indigo-200">Rip Wire</Link>
          <Link href="/regrade-reel" className="text-indigo-300 hover:text-indigo-200">Regrade Reel</Link>
          <Link href="/mailday" className="text-indigo-300 hover:text-indigo-200">Mailday</Link>
          <Link href="/live-hub" className="text-indigo-300 hover:text-indigo-200">All Live</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-indigo-300 hover:text-indigo-200">&larr; Home</Link>
        <Link href="/tools" className="text-indigo-300 hover:text-indigo-200">Tools</Link>
      </div>
    </div>
  );
}
