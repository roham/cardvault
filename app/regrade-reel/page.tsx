import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RegradeReelClient from './RegradeReelClient';

export const metadata: Metadata = {
  title: 'Regrade Reel — Live Crossover & Crack-and-Resub Feed | CardVault',
  description: 'Live feed of simulated card regrade events across PSA, BGS, CGC, and SGC. Crossover upgrades, crack-and-resubmit disasters, bump attempts \u2014 watch the hobby gamble unfold. Five outcome tiers from GRAIL UPGRADE to DISASTER with live value deltas.',
  openGraph: {
    title: 'Regrade Reel — CardVault',
    description: 'Watch the hobby regrade gamble in real time. Crossover, crack-and-resub, bump attempts. 5 outcome tiers with net value deltas.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Regrade Reel — CardVault',
    description: 'Live feed of crossover and crack-and-resub events. GRAIL UPGRADE to DISASTER.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Regrade Reel' },
];

const faqItems = [
  {
    question: 'What is a regrade and why does the hobby care?',
    answer: 'Regrading is the decision to resubmit an already-graded card to the same or a different grader in the hope of getting a higher grade \u2014 and therefore a higher market value. The three flavors are crossover (submit a slab straight to a new grader without cracking), crack-and-resub (break the slab and start fresh), and bump attempt (same grader, new submission hoping for luck). Each move costs $40-$150 in fees plus shipping, takes weeks to months, and has a real chance of coming back WORSE than where you started. Regrading is the single biggest dopamine mechanic in grading culture.',
  },
  {
    question: 'How do the five outcome tiers work?',
    answer: 'GRAIL UPGRADE fires when the net value delta is +100% or more \u2014 the dream outcome. UPGRADE covers +20 to +99%. WASH covers -19 to +19% (money sideways after fees). DOWNGRADE is -20 to -49%. DISASTER is -50% or worse \u2014 the classic "cracked a 10, got back an 8" nightmare. The delta is computed off published grade-to-grade multipliers for each grader, then minus a flat $55 round-trip grading and shipping cost estimate.',
  },
  {
    question: 'Why does BGS 10 have a different multiplier than PSA 10?',
    answer: 'BGS 10 (Pristine) is substantially rarer than PSA 10, and BGS 10 Black Label is rarer still. For high-value modern cards, a BGS 10 can trade at 1.5x to 2x a PSA 10 despite ostensibly being the same grade. Conversely, the CGC and SGC 10 markets are thinner, so a CGC 10 typically trades below the PSA 10 comp even on the same card. The simulation reflects this: BGS 10 is weighted 7.5x raw, PSA 10 at 5.5x, CGC at 3.8x, SGC at 4.2x. Real comps vary by card.',
  },
  {
    question: 'Is this real data?',
    answer: 'No. The feed is a simulation seeded from real cards in the CardVault database (weighted toward modern, high-value, and rookie cards because those are what collectors actually regrade). Grade transition probabilities are modeled from published crossover success rates (roughly 20-30% bump, 40-50% hold, 20-30% downgrade depending on grader pair). No individual event represents a real submission, and no pop-report numbers are implied. Use this for entertainment, pattern recognition, and conversation \u2014 not for investment decisions on a specific card.',
  },
  {
    question: 'When should I actually regrade a card?',
    answer: 'The honest calculus: regrade is worth it if the expected grade bump times the value multiplier minus the grading fee exceeds roughly 2x your fees. For a PSA 9 worth $500 that you believe has a 40% chance of bumping to PSA 10 (where the card is worth $3,500), expected value is 0.4 \u00d7 $3,500 + 0.6 \u00d7 $500 = $1,700, minus $55 fees = $1,645 vs holding at $500 \u2014 a clear buy. For a PSA 8 worth $100 where PSA 9 is $160, even a 50% bump probability is 0.5 \u00d7 $160 + 0.5 \u00d7 $100 = $130, minus $55 fees = $75 \u2014 a clear hold. The Regrade Calculator tool does this math for you.',
  },
  {
    question: 'What does the watchlist star do?',
    answer: 'Starring a card adds its slug to your local watchlist. Any future event in the feed that involves that card will surface in a dedicated Watchlist panel at the top of the page, regardless of your current filters. The watchlist is stored in your browser\u2019s localStorage \u2014 no account needed \u2014 and persists across sessions. Unstar by clicking the filled star.',
  },
  {
    question: 'Why is the feed paused automatically when I switch tabs?',
    answer: 'It isn\u2019t. The feed uses a setInterval at ~3.8 seconds per event regardless of tab focus, so you\u2019ll have a healthy backlog when you return. The manual Pause button is the only way to stop it. If the feed feels too fast, pause it and scroll through the accumulated events at your own pace.',
  },
];

export default function RegradeReelPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Regrade Reel',
        description: 'Live simulated feed of card regrade events \u2014 crossovers, crack-and-resubs, bump attempts \u2014 with five outcome tiers and net value deltas accounting for grading fees.',
        url: 'https://cardvault-two.vercel.app/regrade-reel',
        applicationCategory: 'EntertainmentApplication',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Live feed &middot; 5 outcome tiers &middot; net value delta &middot; PSA / BGS / CGC / SGC
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Regrade Reel</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          The hobby\u2019s most dopamine-soaked gamble, rendered as a live feed. Watch crossovers, crack-and-resubs, and bump attempts land across four graders with net value deltas from GRAIL UPGRADE down to DISASTER. Star the cards you\u2019re watching. Pause when the swings get too fast.
        </p>
      </div>

      <RegradeReelClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-orange-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Live Feeds & Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/pop-watch" className="text-orange-300 hover:text-orange-200">Pop Watch</Link>
          <Link href="/auction-wire" className="text-orange-300 hover:text-orange-200">Auction Wire</Link>
          <Link href="/rip-wire" className="text-orange-300 hover:text-orange-200">Rip Wire</Link>
          <Link href="/tools/regrade-calc" className="text-orange-300 hover:text-orange-200">Regrade Calculator</Link>
          <Link href="/tools/cross-grade" className="text-orange-300 hover:text-orange-200">Cross-Grade Converter</Link>
          <Link href="/tools/grading-roi" className="text-orange-300 hover:text-orange-200">Grading ROI Calculator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/live-hub" className="text-orange-300 hover:text-orange-200">&larr; Live Hub</Link>
        <Link href="/tools" className="text-orange-300 hover:text-orange-200">Tools</Link>
        <Link href="/" className="text-orange-300 hover:text-orange-200">Home</Link>
      </div>
    </div>
  );
}
