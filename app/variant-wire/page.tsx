import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VariantWireClient from './VariantWireClient';

export const metadata: Metadata = {
  title: 'Variant Wire — Parallel & Numbered Color-Pop Feed | CardVault',
  description: 'Live feed of numbered parallels, color pops, and refractor variants hitting the secondary market. 7-tier rarity taxonomy (base / silver / gold / orange /50 / red /25 / gold /10 / black 1/1) with weighted distribution and documented tier premium multipliers.',
  openGraph: {
    title: 'Variant Wire — CardVault',
    description: 'Parallel + numbered + color-pop variants hitting the secondary market — live feed.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Variant Wire — CardVault',
    description: 'Numbered parallels + refractors + color pops as they surface.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Variant Wire' },
];

const faqItems = [
  {
    question: 'What is a parallel or variant card?',
    answer: 'A parallel is a card that uses the same design as the base card but with a different color, foil treatment, serial number, or print run. Common parallel families: PRIZM (silver / blue / red / orange /50 / gold /10 / black 1/1), TOPPS CHROME (refractor / blue /150 / gold /50 / red /5 / superfractor 1/1), PANINI OPTIC (holo / blue /299 / orange /199 / gold /10 / black 1/1), PANINI NATIONAL TREASURES (black /99 / gold /25 / platinum /10 / logo 1/1). Each tier carries a documented premium over the base card — silver is typically 3-5×, orange /50 is 10-20×, gold /10 is 30-80×, 1/1 is 100-500×.',
  },
  {
    question: 'What are the 7 rarity tiers?',
    answer: 'BASE — the common rainbow anchor. SILVER (unnumbered or /999+) — 3-5× base. COLOR /199-/299 — 5-8× base. ORANGE /50 — 10-20× base. RED /25 — 20-40× base. GOLD /10 — 30-80× base. BLACK 1/1 — 100-500× base. The distribution weight in the feed reflects real production rarity: base 40%, silver 25%, /199 12%, /50 10%, /25 6%, /10 4%, 1/1 3%. Colors vary by product (Prizm vs Optic vs Chrome use different palette conventions) but tier functions map consistently.',
  },
  {
    question: 'Are these real variants?',
    answer: 'The feed is simulated for visualization; real variant tracking requires eBay saved searches on specific parallel types (e.g., "Prizm Gold /10 LeBron") or paid services like CardLadder / Market Movers. The feed models the DISTRIBUTION and CADENCE of variant activity across weighted product + tier + sport mixes using public data. Use real platforms for acquisition signals; use Variant Wire to understand the RHYTHM of variant movement.',
  },
  {
    question: 'What is a rainbow and why does it matter?',
    answer: 'A RAINBOW is the complete set of every numbered parallel of a specific card (base + silver + blue + green + orange /50 + red /25 + gold /10 + black 1/1 = 8 cards in a typical Prizm rainbow). Completing a rainbow is the ultimate set-build challenge within a single card — it requires acquiring all 8 versions of one player\'s rookie. Rainbow completion is an instant 1.3-1.8× premium over the sum of individual card values because the set-completion scarcity is additive on top of individual-card scarcity.',
  },
  {
    question: 'What about refractor vs holo vs foil?',
    answer: 'These are different FOIL technologies by manufacturer. REFRACTOR (Topps Chrome family) uses prismatic chrome foil that shifts color when tilted — classic refractor aesthetic. HOLO (Panini Optic / Donruss) uses a holographic overlay with geometric patterns. PRIZM (Panini Prizm) uses a flat chromium foil with ice/cracked-ice variants. Each manufacturer\'s tier structure uses different color palette conventions but the rarity ladder maps consistently across them.',
  },
  {
    question: 'How is Variant Wire different from Rip Wire or First Hit?',
    answer: 'RIP WIRE = raw pack pulls across all products continuously (volume-based, product-agnostic). FIRST HIT LIVE = first-of-set milestone pulls during launch windows (time-bounded, milestone-based). ESTATE WIRE = named-source provenance-based consignments. ERROR WIRE = production-anomaly submarket. VARIANT WIRE = specifically the secondary-market movement of NUMBERED PARALLELS and color pops (tier-based, parallel-specific). Collectors chasing a specific rainbow-component watch Variant Wire filtered to their target tier.',
  },
];

export default function VariantWirePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Variant Wire',
        description: 'Live feed of numbered parallels, color pops, and refractor variants hitting the secondary card market.',
        url: 'https://cardvault-two.vercel.app/variant-wire',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-950/60 to-violet-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Live · Numbered parallels + rainbow variants · Simulated
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Variant Wire</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Numbered parallels, color pops, refractors, and rainbow components as they hit the secondary market.
          7-tier rarity taxonomy with per-tier premium multipliers.
        </p>
      </div>

      <VariantWireClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/rip-wire" className="block bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Rip Wire →</div>
          <div className="text-xs text-slate-400">All pack pulls, all products, continuous.</div>
        </Link>
        <Link href="/first-hit" className="block bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">First Hit Live →</div>
          <div className="text-xs text-slate-400">Launch-window first-of-set milestone pulls.</div>
        </Link>
        <Link href="/tools/rainbow-tracker" className="block bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Rainbow Tracker →</div>
          <div className="text-xs text-slate-400">Track which rainbow components you own vs need.</div>
        </Link>
        <Link href="/live-hub" className="block bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">All live feeds →</div>
          <div className="text-xs text-slate-400">Hub for every CardVault real-time feed.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-violet-300 transition">
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
