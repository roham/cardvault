import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorWireClient from './ErrorWireClient';

export const metadata: Metadata = {
  title: 'Error Wire — Misprint & Error Cards Hitting Market | CardVault',
  description: 'Live feed of error cards, misprints, miscuts, color-swap variations, and back-side errors surfacing in the sports card market. 7 error-type taxonomy, rarity estimates, hobby-press coverage status. Simulated feed modeled on real documented error-card market activity.',
  openGraph: {
    title: 'Error Wire — CardVault',
    description: 'Misprints, miscuts, color-swap, back-errors — live feed of error cards entering the hobby market.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Error Wire — CardVault',
    description: 'Error cards surfacing in real time. 7-type taxonomy. The misprint-hunter\'s feed.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Error Wire' },
];

const faqItems = [
  {
    question: 'What is Error Wire?',
    answer: 'A live feed specifically for ERROR CARDS — cards with manufacturing mistakes like miscut borders, missing name-plate text, swapped color tints, inverted backs, and other documented misprints. Error cards occupy a distinct submarket from base hobby cards: rarity is tied to unknown production-run frequency (a miscut happens on maybe 1 in 10,000 cards, but nobody has an official count), and price is driven by collector demand for the specific error type plus how famous the error becomes in hobby press (Cardboard Connection, Beckett, Sports Card Investor coverage). Error Wire shows these surfacing in real time.',
  },
  {
    question: 'What are the 7 error types?',
    answer: 'MISCUT — card cut off-register from the printing sheet, with portions of adjacent cards visible (value multiplier 3-20× base). MISSING NAME-PLATE — the player\'s name is absent from the front (5-30×, depends on prominence). COLOR SWAP — ink channels reversed or mis-registered, producing alternate color scheme like "all-red Mantle" (10-40×, often the most collectible). BACK-SIDE ERROR — wrong back on a card, or upside-down, or mis-aligned stats (3-15×). PRINTING PLATE — 1/1 printing-plate cards that escape as production proofs (often 100-500× as they are legitimately unique). CENTERING ERROR (extreme) — beyond normal off-center, so off-center the image is cropped (2-8×). FACTORY MISSING INK — missing foil or holographic layer on a Prizm/Chrome/Optic card (5-25×, highly collectible). The feed items show which type + estimated rarity + price range.',
  },
  {
    question: 'Are these real documented errors?',
    answer: 'The feed is simulated for visualization; real documented errors are tracked via eBay "error card" searches, Blowout Cards forum error-card subforum, r/baseballcards error-card threads, and The Card Market error archive. The simulated feed models the DISTRIBUTION and CADENCE of error-card activity — miscut frequency, color-swap frequency, back-error frequency — using public documentation as baseline. If you want real-time error card alerts, set eBay saved searches for "error card [set] [year]" + the specific error type you hunt.',
  },
  {
    question: 'How is error-card pricing determined?',
    answer: 'Error cards are priced on 3 factors that compound: (1) BASE CARD VALUE — what the non-error version trades at. A miscut Common rookie is worth $5-$20; a miscut LeBron Topps Chrome PSA 9 is worth $20K+. (2) ERROR MULTIPLIER — how rare/dramatic the error is (3× for minor miscut, 30× for a famous documented color-swap). (3) PRESS HALO — did the error get written up in Cardboard Connection / Beckett / SCI articles? A "famous" error trades at 2-3× an "unknown" error of the same type. The tool shows a suggested price range per item based on these factors.',
  },
  {
    question: 'How do I verify an error is authentic?',
    answer: 'Three verification axes: (1) PSA/BGS/SGC certification — grading companies note documented errors on the flip, and will decline grading forgeries. Always prefer a certified error. (2) PRODUCTION CONSISTENCY — real production errors happen on specific production runs, so the "error type" should be consistent with the SET and YEAR. A 1989 Upper Deck Griffey "color swap" wouldn\'t happen because UD didn\'t use color-separated printing in that era. (3) PRESS COVERAGE — if the error is famous, it will be documented in hobby press with photos and a canonical-specimen cert number. Compare your card to the canonical specimen.',
  },
  {
    question: 'Are error cards a good investment?',
    answer: 'High variance. The "famous" errors (1990 Donruss Frank Thomas No Name, 1989 Upper Deck Dale Murphy reverse negative, 2000 Topps Traded A-Rod Yankees error) compound in value alongside the base player — a Frank Thomas No Name PSA 8 has traded from $200 (2010) to $2000+ (2022). Less-famous errors are highly illiquid — you may wait years for a specific buyer. Only buy error cards if: (a) the player / set is blue-chip, (b) the error type has a documented enthusiast market, (c) the card is authenticated (PSA/BGS/SGC noted). Avoid "discovery error" claims — errors that nobody else has documented are usually grading artifacts, not production errors.',
  },
  {
    question: 'How is Error Wire different from Rip Wire or First Hit?',
    answer: 'RIP WIRE tracks all pack pulls continuously (volume-based, product-agnostic). FIRST HIT LIVE tracks the first-of-set milestone pulls in launch windows (time-bounded, milestone-based). ERROR WIRE tracks the specific submarket of error/misprint cards hitting listing (type-based, production-anomaly-based). Three non-overlapping axes on pulls / milestones / production-anomalies. A collector watching for a specific famous error (e.g., a 1990 Frank Thomas No Name) would follow Error Wire filtered to "Missing Name-Plate"; watching for any big pull at all would follow Rip Wire.',
  },
  {
    question: 'Do error cards affect the base card market?',
    answer: 'Only for the rare "famous error" cases. When an error becomes famous (hobby press coverage, viral social post), it lifts the entire set\'s desirability briefly — collectors pay more attention to the set, which drives secondary sales of base cards too. But most errors stay in their own submarket and have zero effect on base cards. The canonical example: the 1990 Frank Thomas No Name error made the 1990 Leaf set more collected for 2-3 years after discovery (1992-1995), driving up base Thomas rookie prices by 15-20% during that window.',
  },
];

export default function ErrorWirePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Error Wire',
        description: 'Live feed of error cards, misprints, miscuts, and production anomalies surfacing in the sports card market.',
        url: 'https://cardvault-two.vercel.app/error-wire',
        applicationCategory: 'BusinessApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live · Misprint + error-card feed · Simulated
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Error Wire</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Error cards, misprints, miscuts, color-swaps, back-errors, and production anomalies as they surface in the
          hobby market. 7-type taxonomy, rarity estimates, press-coverage tracking.
        </p>
      </div>

      <ErrorWireClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/famous-error-cards" className="block bg-slate-900/60 border border-slate-800 hover:border-red-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Famous Error Cards →</div>
          <div className="text-xs text-slate-400">Canonical archive of the 20 most famous documented error cards in hobby history.</div>
        </Link>
        <Link href="/tools/error-cards" className="block bg-slate-900/60 border border-slate-800 hover:border-red-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Error Card Identifier →</div>
          <div className="text-xs text-slate-400">Does your card have a documented error? Lookup tool for 40+ known error types.</div>
        </Link>
        <Link href="/rip-wire" className="block bg-slate-900/60 border border-slate-800 hover:border-red-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Rip Wire →</div>
          <div className="text-xs text-slate-400">All pack pulls, all products, continuous feed.</div>
        </Link>
        <Link href="/live-hub" className="block bg-slate-900/60 border border-slate-800 hover:border-red-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">All live feeds →</div>
          <div className="text-xs text-slate-400">Hub for every CardVault real-time feed.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-red-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
