import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetArchivesClient from './SetArchivesClient';
import { greatestSets } from '@/data/greatest-sets';

export const metadata: Metadata = {
  title: 'Set Archives — The Greatest Sports Card Sets of All Time | CardVault',
  description: `An editorial ranking of ${greatestSets.length} legendary sports card sets across MLB, NBA, NFL, and NHL — from 1909 T206 to modern Panini Prizm. Tier-ranked by historical significance, design, rookie depth, and market impact, with key rookie cards, box values, and trivia for every entry.`,
  openGraph: {
    title: 'Set Archives — The Greatest Sports Card Sets of All Time',
    description: 'Tier-ranked rankings of the most important sports card sets ever produced. 40+ sets, 4 sports, S/A/B/C tiers.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Set Archives — The Greatest Card Sets of All Time',
    description: '40 legendary sports card sets ranked by era, sport, and tier. T206 to modern Prizm.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Set Archives' },
];

const faqItems = [
  {
    question: 'What is the CardVault Set Archives?',
    answer: `A curated editorial ranking of the ${greatestSets.length} most important sports card sets in hobby history — across MLB, NBA, NFL, and NHL. Each set is placed in one of four tiers (Legendary, Iconic, Classic, Notable) based on historical significance, design impact, rookie checklist depth, and long-run market performance. The archive is a reference for collectors, investors, and researchers who want a single place to understand what makes a set matter.`,
  },
  {
    question: 'How are tiers decided?',
    answer: 'Tiers weigh four factors: (1) Historical significance — does the set define an era or a player\'s cardboard legacy? (2) Design impact — did the layout set the template for subsequent releases? (3) Rookie checklist — how many first-ballot Hall of Famers or modern superstars debuted here? (4) Market performance — has the flagship card traded consistently above its peers for 20+ years? Legendary tier requires a card-of-record rookie (Wagner, Mantle, Jordan Fleer, Gretzky OPC) or a genre-defining insert (PMG Green, The Cup RPA). Iconic tier clears at least three of the four criteria. Classic and Notable tiers clear two.',
  },
  {
    question: 'Do any sets qualify as "sleepers" that might rise tiers later?',
    answer: '2020 Bowman Draft, 2020 Panini Prizm Football, and 2019-20 Panini Prizm Basketball are all candidates — all three launched into the hobby bubble and corrected 50-70% by 2023. If one of their anchor rookies (Herbert, Luka, Zion, Ja, Torkelson) produces a Cooperstown/Canton/Springfield career, the set\'s tier upgrades. Vintage sets move more slowly but the 1975 Topps baseball set has been quietly closing the gap with 1952 Topps as the boomer collector cohort pays down grail-level prices.',
  },
  {
    question: 'Why not include Upper Deck 1993 SP Foil Derek Jeter or 1990 Leaf Baseball?',
    answer: 'They\'re included — 1993 SP made the Iconic tier (the Jeter RC is the modern premium-era Mount Rushmore pick). 1990 Leaf was not included in v1 of the archive because its single defining rookie (Thomas / Biggio / Sosa) doesn\'t clear the historical-impact threshold against the rest of the junk-wax class. The archive will expand in future updates — reader requests welcome.',
  },
  {
    question: 'Are box values current market prices?',
    answer: 'Values cited are 2026 estimated ranges for verifiable sealed boxes in good-to-average condition. Ultra-rare wax (1952 Topps boxes, 1986 Fleer boxes) almost never trades publicly — the ranges for those sets reflect the last public auction results. Modern sets (2020+) are estimated from eBay sold and hobby-shop retail. Always cross-check a current sold listing before buying — sealed-wax prices can move 20-40% on a single MVP announcement or a rookie call-up.',
  },
];

export default function SetArchivesPage() {
  const tierCounts = {
    LEGENDARY: greatestSets.filter(s => s.tier === 'LEGENDARY').length,
    ICONIC: greatestSets.filter(s => s.tier === 'ICONIC').length,
    CLASSIC: greatestSets.filter(s => s.tier === 'CLASSIC').length,
    NOTABLE: greatestSets.filter(s => s.tier === 'NOTABLE').length,
  };
  const sportCounts = {
    MLB: greatestSets.filter(s => s.sport === 'MLB').length,
    NBA: greatestSets.filter(s => s.sport === 'NBA').length,
    NFL: greatestSets.filter(s => s.sport === 'NFL').length,
    NHL: greatestSets.filter(s => s.sport === 'NHL').length,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-8 border-b border-purple-900/40 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
          CARDVAULT · MEDIA · SET ARCHIVES
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          The Greatest Sports Card Sets of All Time
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          An editorial tier ranking of <span className="font-semibold text-purple-300">{greatestSets.length} card sets</span> across
          {' '}MLB, NBA, NFL, and NHL — from 1909 T206 to modern Panini Prizm. Each entry placed in Legendary / Iconic / Classic / Notable
          based on historical significance, design impact, rookie depth, and long-run market performance.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill label="Legendary" count={tierCounts.LEGENDARY} color="amber" />
          <StatPill label="Iconic" count={tierCounts.ICONIC} color="purple" />
          <StatPill label="Classic" count={tierCounts.CLASSIC} color="sky" />
          <StatPill label="Notable" count={tierCounts.NOTABLE} color="slate" />
          <span className="px-1 text-slate-600">·</span>
          <StatPill label="MLB" count={sportCounts.MLB} color="emerald" />
          <StatPill label="NBA" count={sportCounts.NBA} color="orange" />
          <StatPill label="NFL" count={sportCounts.NFL} color="red" />
          <StatPill label="NHL" count={sportCounts.NHL} color="cyan" />
        </div>
      </header>

      <SetArchivesClient />

      <section className="mt-12 rounded-2xl border border-purple-900/40 bg-purple-950/20 p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-purple-200">Editor&apos;s Note</h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            This archive is deliberately opinionated. Every tier placement is a judgment call — Legendary sets have
            to do more than release a good rookie. They need to reshape the category, and the names on the checklist
            have to still matter 40, 70, or 100 years later. That&apos;s a high bar, which is why only a handful of modern
            releases clear it.
          </p>
          <p>
            Some readers will disagree with placement. That&apos;s the point. If you think 1975 Topps should be Legendary,
            or that 2019-20 Panini Prizm Basketball is Notable-not-Iconic, vote with your takes on <Link href="/op-ed" className="text-purple-300 underline hover:text-purple-200">The Op-Ed</Link> or
            bring it to <Link href="/mailbag" className="text-purple-300 underline hover:text-purple-200">Dear Auntie Mint</Link>.
          </p>
          <p className="text-xs text-slate-500 italic">
            Not financial advice. Sealed-wax box values are 2026 estimates and shift quickly on HOF announcements, injury news, and auction comps.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="text-sm font-semibold text-slate-200">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">More from CardVault Media</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/card-hall-of-fame', label: 'Card Hall of Fame' },
            { href: '/famous-error-cards', label: 'Famous Error Cards' },
            { href: '/record-book', label: 'Price Record Book' },
            { href: '/fanatics-era', label: 'The Fanatics Era' },
            { href: '/op-ed', label: 'The Op-Ed' },
            { href: '/mailbag', label: 'The Mailbag' },
            { href: '/state-of-the-hobby', label: 'State of the Hobby' },
            { href: '/rookie-rankings', label: 'Rookie Rankings' },
            { href: '/card-encyclopedia', label: 'Card Encyclopedia' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-purple-500/40 hover:text-purple-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Set Archives — The Greatest Sports Card Sets of All Time',
          description: `Editorial tier ranking of ${greatestSets.length} legendary sports card sets across MLB, NBA, NFL, and NHL.`,
          url: 'https://cardvault-two.vercel.app/set-archives',
          datePublished: '2026-04-16',
          dateModified: '2026-04-16',
          author: { '@type': 'Organization', name: 'CardVault Editorial' },
          publisher: { '@type': 'Organization', name: 'CardVault' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'The Greatest Sports Card Sets of All Time',
          numberOfItems: greatestSets.length,
          itemListElement: greatestSets.slice(0, 25).map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${s.year} ${s.name}`,
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </main>
  );
}

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  const classes: Record<string, string> = {
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    purple: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    slate: 'border-slate-600/40 bg-slate-600/10 text-slate-300',
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    orange: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    red: 'border-red-500/40 bg-red-500/10 text-red-300',
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${classes[color] || classes.slate}`}>
      {label}
      <span className="rounded-full bg-black/30 px-1.5 py-0 text-[10px]">{count}</span>
    </span>
  );
}
