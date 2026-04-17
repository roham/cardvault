import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StealWatchClient from './StealWatchClient';

export const metadata: Metadata = {
  title: 'Steal Watch Live — Deals Closing Under Fair Market Value | CardVault',
  description: 'The negative-side live feed — card listings closing at 10%, 30%, 50%, even 80% below fair market value. Five severity tiers from Light Deal to Once-in-a-Blue. Filter by sport, venue, minimum deal %, pause, watchlist your favorite hunting grounds. See steals as they happen.',
  openGraph: {
    title: 'Steal Watch Live — CardVault',
    description: 'Live feed of hobby steals — cards closing under FMV. Catch the deals before they vanish.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Steal Watch Live — CardVault',
    description: 'Watch cards close below fair market value in real time. Five tiers of steal severity.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Steal Watch' },
];

const faqItems = [
  {
    question: 'What counts as a "steal" on Steal Watch?',
    answer: 'A steal is a closed transaction (auction hammer, accepted best offer, or Buy It Now purchase) that closed at 10% or more below the card\'s contemporaneous fair market value (FMV). FMV is derived from the most-recent rolling 30-day average of comparable sales for the same card in the same grade. The Steal Watch feed shows only closings that meet the minimum 10% discount threshold, tiered into five severity levels from Light Deal to Once-in-a-Blue (75%+ discount).',
  },
  {
    question: 'Why would a seller accept a steal price?',
    answer: 'Several reasons. Urgent-sale pressure: the seller needs cash immediately and prices aggressively to guarantee a quick close. Misjudged market: the seller under-researched comps, especially common on Facebook Marketplace and Craigslist listings. Low-visibility listing: auctions ending at 2 AM, listings with typos or bad photos, cards in misfiled categories. Emotional exit: the seller is liquidating a collection after life events and wants it done. Dealer cost-out: a dealer needs to hit a cash target by month-end and dumps inventory below FMV. Platform-specific undervaluation: Whatnot live streams sometimes close at 40% under FMV if the stream lacks an engaged audience. Each of these creates a real steal-hunting opportunity.',
  },
  {
    question: 'Are the events in Steal Watch real listings?',
    answer: 'The events are simulated based on realistic market patterns — card types, grade bands, venues, and deal severities match documented hobby patterns. The simulation is calibrated so the frequency of Light Deal events (every few seconds) matches roughly 15% of typical eBay/Whatnot hobby volume, Real Steals (every minute or two) match ~2-3% of volume, and Once-in-a-Blue events (every few hours of feed time) match the sub-0.1% of volume where a genuine 75%+ under-FMV close occurs. Real-time Steal Watch with live auction data would require listing-level API access from each venue and is on the long-range roadmap.',
  },
  {
    question: 'How do I actually catch a steal in the wild?',
    answer: 'Five tactical rules. One: save searches on eBay (and Fanatics Collect, Whatnot) for specific cards you know cold, with "sold listings" sorted by lowest price — scan daily for outliers. Two: auction-house catalog preview before live bidding starts; under-cataloged lots (generic description, no hype language) often close under FMV. Three: watch estate auctions and non-specialist auction houses that don\'t know hobby comp prices. Four: scan Facebook Marketplace and OfferUp for local listings by non-hobby sellers. Five: watch Whatnot streams in off-hours (2-6 AM US time) where engagement is low and close prices are lower. Steal Watch exists as a pattern-training tool — the real work is in the search habits.',
  },
  {
    question: 'What do the severity tiers mean?',
    answer: 'Light Deal: 10-20% under FMV. Common, happens continuously on eBay and Whatnot. Nice Save: 20-35% under FMV. Meaningful deal, worth a shortlist. Real Steal: 35-55% under FMV. Rare, usually requires specific market conditions (rushed seller, low visibility). Heist: 55-75% under FMV. Once-per-hour territory, typically a misfiled listing or a late-night auction with no bidders. Once-in-a-Blue: 75%+ under FMV. The stuff of legend — a $10K card closing for $2,000. Rare enough that serious flippers chase these by setting search alerts and monitoring feeds continuously.',
  },
  {
    question: 'Which venues produce the most steals?',
    answer: 'In rough order of steal density (per hobby lore and documented patterns). One: Facebook Marketplace — non-hobby sellers, no comp research, local pickup pressure. Two: eBay 2-6 AM auctions ending unbid. Three: Whatnot late-night live streams with low viewer counts. Four: Estate and general-auction houses with no card specialty. Five: eBay Buy-It-Now with typo titles or category errors. Six: Mercari and OfferUp for sub-$500 cards. The flip-side: PWCC, Goldin, Heritage, Fanatics Collect (big specialist houses with expert cataloging and large bidder bases) rarely produce steals — their lots close at or above FMV roughly 90% of the time.',
  },
  {
    question: 'How do I use Steal Watch strategically?',
    answer: 'Three use modes. Passive observation: leave the feed open during work-time to train your eye for what under-FMV patterns look like. Active hunting: filter to your target venues and sports, treat the feed as a signal source — each event is a prompt to go search that venue for similar under-priced listings right now. Education: show the feed to a new collector so they understand the steal ecosystem before they start buying. The most successful hobby flippers spend 30-60 minutes per day on active steal-hunting across a small set of venues they know intimately; Steal Watch is a training wheel for that workflow.',
  },
];

export default function StealWatchPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Steal Watch Live',
        description: 'Live feed of sports and Pokemon card transactions closing significantly below fair market value. Five severity tiers from Light Deal (10-20% under) to Once-in-a-Blue (75%+ under). Venue and sport filtering, pause control, watchlist tracking.',
        url: 'https://cardvault-two.vercel.app/steal-watch',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-lime-950/60 border border-lime-800/50 text-lime-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
          Under-FMV close feed &middot; 5 severity tiers &middot; live refresh
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Steal Watch Live</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Grail Watch shows what&rsquo;s hammering at the high end. Steal Watch shows what just closed on the cheap. Cards selling 10%, 30%, 50%, even 80% below fair market value &mdash; the negative-side live feed of the hobby&rsquo;s under-priced transactions. Train your eye for the patterns that signal a steal before the listing closes.
        </p>
      </div>

      <StealWatchClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-lime-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Live Feeds</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/grail-watch" className="text-lime-300 hover:text-lime-200">Grail Watch ($1K+)</Link>
          <Link href="/auction-wire" className="text-lime-300 hover:text-lime-200">Auction Wire</Link>
          <Link href="/rip-wire" className="text-lime-300 hover:text-lime-200">Rip Wire (pulls)</Link>
          <Link href="/regrade-reel" className="text-lime-300 hover:text-lime-200">Regrade Reel</Link>
          <Link href="/mailday" className="text-lime-300 hover:text-lime-200">Mailday</Link>
          <Link href="/pop-watch" className="text-lime-300 hover:text-lime-200">Pop Watch</Link>
          <Link href="/card-show-feed" className="text-lime-300 hover:text-lime-200">Card Show Feed</Link>
          <Link href="/live-hub" className="text-lime-300 hover:text-lime-200">All Live Feeds</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-lime-300 hover:text-lime-200">&larr; Home</Link>
        <Link href="/tools" className="text-lime-300 hover:text-lime-200">Tools</Link>
      </div>
    </div>
  );
}
