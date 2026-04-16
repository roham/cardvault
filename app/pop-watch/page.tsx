import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PopWatchClient from './PopWatchClient';

export const metadata: Metadata = {
  title: 'Pop Watch — Live Grading Population Feed | CardVault',
  description: 'Live feed of simulated sports card grading activity across PSA, BGS, CGC, and SGC. See pop-report shifts as new grade-outs hit. Bulk-return alerts flag potential saturation. Watchlist cards you care about for targeted alerts.',
  openGraph: {
    title: 'Pop Watch — CardVault',
    description: 'Live pop-report feed. PSA, BGS, CGC, SGC grade-outs as they happen. Bulk-return warnings and grail-pop flags.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pop Watch — CardVault',
    description: 'Live card grading population feed. Watch pops shift, spot bulk returns, flag grails.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Pop Watch' },
];

const faqItems = [
  {
    question: 'What is a pop report and why does it matter?',
    answer: 'Pop reports — short for population reports — count how many copies of a specific card have been graded at a specific grade by a specific grader. A 2018 Panini Prizm Luka Silver PSA 10 with a population of 124 is worth different money than the same card with a population of 2. Low pops drive scarcity premiums; high pops compress value. Every serious collector checks pop reports before buying a slabbed card. Pop Watch surfaces the feed as grade-outs happen, so you can track velocity — not just the static number.',
  },
  {
    question: 'What does the BULK RETURN flag mean?',
    answer: 'When PSA or another grader releases a large submission batch, ten or fifteen identical cards at the same grade can hit the population report within minutes. A BULK RETURN flag on Pop Watch means 8 or more grade-outs for the same card at the same grade landed in a short window — the saturation risk is real. A card that had 40 PSA 10s this morning and 55 by afternoon just had a 37% population jump, which usually compresses market price 5-15% within a week. Active buyers use this signal to pause purchases until the dust settles.',
  },
  {
    question: 'What does GRAIL POP mean?',
    answer: 'GRAIL POP means the card has 3 or fewer total copies graded at this grade level after the current update. Ultra-low pops are the holy grail for high-end collectors — a population of 1 with a strong PSA 10 case can trade at 5-10x comp for the player. Watch for cards that stay at GRAIL POP for multiple days without a bulk increase; those are the ones that hold value best.',
  },
  {
    question: 'Is this real data from PSA and BGS?',
    answer: 'No. Pop Watch is a simulation that uses real card values, rookie status, vintage status, and grader market share (PSA ~55%, CGC ~22%, BGS ~12%, SGC ~11%) to generate a realistic-feeling stream of grade-out events. The math that drives it — grade distribution (about 24% gem 10s / 36% 9s / 16% 8s / smaller shares at 8.5, 9.5, 7-or-less), value-weighted submission rates, bulk-return clustering — mirrors real grading velocity patterns. For actual population numbers, check the official grader sites: PSA\u2019s Population Report, BGS Pop Report, CGC Card Pop, SGC Pop Report.',
  },
  {
    question: 'How do I use the watchlist?',
    answer: 'Star any card in the feed to add it to your watchlist. The watchlist appears at the top of the page and shows recent activity only for cards you care about. Use it to monitor the cards you own (to see when your pop gets diluted) or cards you\'re hunting (to see if a fresh pop update shifts the supply). The watchlist persists in your browser\'s localStorage — no account needed. Clear it with a browser cache clear or by un-starring individual rows.',
  },
  {
    question: 'Why does PSA dominate the feed?',
    answer: 'PSA holds roughly 55-60% of the third-party grading market in the US, especially for sports cards. BGS is second at about 12% with strength in modern autographs and subgrades. CGC sits at roughly 22% thanks to their Pokémon and TCG dominance. SGC holds 11% with heavy vintage baseball presence. Pop Watch weights events by these market shares so the feed reflects real submission volume. If you filter to a single grader, you\'ll see their specialty segments more clearly — CGC will skew Pokémon, SGC will skew pre-1980 baseball, BGS will skew high-end autographs.',
  },
];

export default function PopWatchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Pop Watch',
        description: 'Live simulated pop-report feed for sports card grading. Shows grade-outs as they happen across PSA, BGS, CGC, and SGC with bulk-return alerts, grail-pop flags, and major-mover indicators.',
        url: 'https://cardvault-two.vercel.app/pop-watch',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Pop Watch &middot; Live &middot; PSA &middot; BGS &middot; CGC &middot; SGC
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Pop Watch</h1>
        <p className="text-gray-400 text-lg">
          Watch grade-outs as they land. Bulk returns flagged. Grail pops highlighted. Watchlist any card to get
          targeted updates without digging through the whole stream. The feed you wish the grader sites had.
        </p>
      </div>

      <PopWatchClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-teal-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Live Features */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Live Features</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/grading-feed" className="text-teal-500 hover:text-teal-400">Grading Feed</Link>
          <Link href="/mailday" className="text-teal-500 hover:text-teal-400">Mailday Live</Link>
          <Link href="/rip-wire" className="text-teal-500 hover:text-teal-400">Rip Wire</Link>
          <Link href="/card-wire" className="text-teal-500 hover:text-teal-400">Card Wire</Link>
          <Link href="/breakers-lounge" className="text-teal-500 hover:text-teal-400">Breakers Lounge</Link>
          <Link href="/live-hub" className="text-teal-500 hover:text-teal-400">Live Hub</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/live-hub" className="text-teal-500 hover:text-teal-400">&larr; All Live Features</Link>
        <Link href="/tools" className="text-teal-500 hover:text-teal-400">Tools</Link>
        <Link href="/" className="text-teal-500 hover:text-teal-400">Home</Link>
      </div>
    </div>
  );
}
