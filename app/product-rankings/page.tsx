import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProductRankingsClient from './ProductRankingsClient';

export const metadata: Metadata = {
  title: 'Product Rankings — The Greatest Card Products of All Time | CardVault',
  description: 'An editorial tier ranking of 30 legendary annual card products — National Treasures, Bowman Chrome, Topps Chrome, The Cup, Immaculate, Prizm, Contenders Optic, Stadium Club, and more. Box values, pull rates, hit odds, and collector notes. Tier-ranked across MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Product Rankings — The Greatest Card Products of All Time',
    description: 'Which annual card release lines are the all-time greats? 30 products, 4 tiers, 4 sports.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Rankings — CardVault',
    description: 'The Cup. National Treasures. Bowman Chrome. Topps Chrome. Prizm. Ranked.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Product Rankings' },
];

const faqItems = [
  {
    question: 'What is the difference between Product Rankings and Set Archives?',
    answer: 'Set Archives rank SETS — specific-year-specific-brand releases, like "1952 Topps Baseball" or "1986 Fleer Basketball". Product Rankings rank PRODUCT LINES — the annual release brand itself, like "Panini National Treasures" (which drops every year across baseball, basketball, football). A product line\'s ranking reflects its consistent pull-power, hit quality, design identity, and long-run box appeal — not a single vintage year. Together the two archives cover the two canonical hobby-ranking units (Sets = instances; Products = the recurring franchise).',
  },
  {
    question: 'How are tiers decided?',
    answer: 'Four criteria weighted: (1) Hit desirability — what\'s the probability and value of the chase pulls? (2) Design identity — does the product own a unique visual grammar (Chrome refractors, Prizm silvers, National Treasures jumbo patch, The Cup signature shields)? (3) Checklist quality — does the product consistently attract the year\'s best rookie autos and premium veteran parallels? (4) Market performance — have single cards from the product line traded for $100K+ at any point, and do the boxes retain or appreciate value post-release? Legendary tier clears all four at elite level — these are the products that define their category. Iconic clears three. Classic clears two with strong reputation. Notable is the tier for distinctive or beloved products that don\'t quite reach mainstream elite.',
  },
  {
    question: 'Are these rankings per-sport or cross-sport?',
    answer: 'Cross-sport. National Treasures Football and National Treasures Basketball are treated as one product line for ranking purposes even though they have different release schedules and checklist sizes — the core product identity (jumbo patch, premium auto, low-print case hits) is consistent across sports. Where a product line exists in some sports but not others (e.g. The Cup is Hockey-only at the NHL level, with a different basketball-only Upper Deck product bearing the same "The Cup" brand briefly), the entry notes the sport coverage.',
  },
  {
    question: 'Why is Prizm below National Treasures?',
    answer: 'Prizm is in Iconic tier, not Legendary. It\'s a visual-grammar icon (silver Prizm = modern-era refractor replacement) and the checklist consistency is excellent, but the chase-card ceiling is capped by the auto-rookie model — Prizm Silver Jordan LeBron RPAs haven\'t cleared $1M like National Treasures or The Cup hits. The gap between Legendary and Iconic is roughly "single-card ceiling above $500K" versus "single-card ceiling in the $50K-$500K band". Prizm is the most broadly-beloved modern product; National Treasures is the most expensive-ceiling product. Both framings matter; the tier ordering reflects the ceiling.',
  },
  {
    question: 'What products are on the "sleeper" watch for tier upgrades?',
    answer: 'Topps Dynasty (multi-sport, low-print, multi-relic) is Classic-tier but has the checklist depth and auto structure to jump to Iconic if one of its 2023-2025 rookie classes produces a Cooperstown-level career. Panini Flawless (ultra-premium one-box-per-case) has massive ceiling but inconsistent build quality — if Flawless ever locks down a reliable design template, it could clear Iconic. Topps Transcendent Baseball (boxed product, single PSA-10 jumbo auto per box) is more Legendary than Notable based on hits-per-$ but dropped in tier because production history is short. Panini Impeccable sits at Classic today; the jumbo-auto relic format has elite single-hit ceiling.',
  },
  {
    question: 'What about Pokemon and non-sport TCG products?',
    answer: 'This ranking is sports cards only. Pokemon TCG, Magic: The Gathering, Yu-Gi-Oh, Lorcana, Star Wars Unlimited, and other non-sport TCG products have their own ranking sensibilities (set rotation mechanics, print-run cycles, competitive tournament demand) that don\'t map onto the same axes as sports product lines. A future Pokemon Product Rankings would measure different criteria entirely (chase card power relative to set format, Scarlet-Violet-era print run size, etc.).',
  },
  {
    question: 'Can I disagree with a ranking?',
    answer: 'Yes — we encourage it. Each product card has Agree / Disagree votes that persist to your browser localStorage. A running tally appears in the archive header so you can see the aggregate lean on each product. Hobby canon is opinionated, not objective — if a strong majority says "Stadium Club should be Iconic, not Classic", that signal matters and future archive updates may incorporate reader sentiment.',
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

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The Greatest Card Products of All Time — Tier-Ranked Across MLB, NBA, NFL, and NHL',
  description: 'Editorial tier ranking of 30 legendary annual card product lines with box values, hit rates, and design-identity notes.',
  author: { '@type': 'Organization', name: 'CardVault' },
  datePublished: '2026-04-16',
  url: 'https://cardvault-two.vercel.app/product-rankings',
};

export default function ProductRankingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />

      <header className="mt-4 mb-8 border-b border-cyan-900/40 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
          CARDVAULT · MEDIA · PRODUCT RANKINGS
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          The Greatest Card Products of All Time
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          An editorial tier ranking of 30 legendary annual card product lines — from National Treasures and The Cup to Topps Chrome and Prizm — across MLB, NBA, NFL, and NHL. Tiered by hit desirability, design identity, checklist quality, and long-run market performance.
        </p>
      </header>

      <ProductRankingsClient />

      <section className="mt-12 bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
              <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{f.question}</span>
                <span className="text-cyan-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related Archives</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/set-archives" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold text-white text-sm">Set Archives</div>
              <div className="text-xs text-gray-400">40 greatest sets ranked</div>
            </div>
          </Link>
          <Link href="/card-hall-of-fame" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-semibold text-white text-sm">Card Hall of Fame</div>
              <div className="text-xs text-gray-400">Individual card canon</div>
            </div>
          </Link>
          <Link href="/post-mortems" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">🔎</span>
            <div>
              <div className="font-semibold text-white text-sm">Post-Mortems</div>
              <div className="text-xs text-gray-400">Hobby failure archive</div>
            </div>
          </Link>
          <Link href="/op-ed" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">🗞️</span>
            <div>
              <div className="font-semibold text-white text-sm">Op-Ed</div>
              <div className="text-xs text-gray-400">Rotating daily column</div>
            </div>
          </Link>
          <Link href="/fanatics-era" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-semibold text-white text-sm">Fanatics Era Timeline</div>
              <div className="text-xs text-gray-400">2021-2026 industry shift</div>
            </div>
          </Link>
          <Link href="/mailbag" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
            <span className="text-2xl">📬</span>
            <div>
              <div className="font-semibold text-white text-sm">The Mailbag</div>
              <div className="text-xs text-gray-400">Reader Q&amp;A column</div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
