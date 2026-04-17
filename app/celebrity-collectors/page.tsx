import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CelebrityCollectorsClient from './CelebrityCollectorsClient';
import { celebrityCollectors } from '@/data/celebrity-collectors';

export const metadata: Metadata = {
  title: 'Celebrity Collectors — Who Actually Buys Big Cards | CardVault',
  description: `Editorial profiles of ${celebrityCollectors.length} celebrity card collectors across sports, entertainment, media, and business — Post Malone, Logan Paul, Gary Vee, Drake, Kevin Durant and more. Notable purchases, hobby influence scores, signature pieces, and real impact on the hobby.`,
  openGraph: {
    title: 'Celebrity Collectors — Who Actually Buys Big Cards',
    description: `Profiles of ${celebrityCollectors.length} famous collectors, their signature pieces, and their real impact on the card hobby.`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Celebrity Collectors — Who Actually Buys Big Cards',
    description: `${celebrityCollectors.length} profiles across sports, entertainment, media, and business. Real purchases, real influence.`,
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Celebrity Collectors' },
];

const faqItems = [
  {
    question: 'Who is the most influential celebrity card collector?',
    answer: 'Influence is multi-axis. By auction-record impact: Logan Paul ($5.275M Pikachu Illustrator) and Post Malone (The One Ring 1/1). By mainstream evangelism: Gary Vaynerchuk (single most important pre-boom voice). By institutional infrastructure: Ken Goldin (Goldin Auctions) and Todd Boehly (Eldridge/Goldin acquisition). The Celebrity Collectors archive scores each at 1-10 on composite hobby influence.',
  },
  {
    question: 'Are celebrity collectors actually collectors, or just trophy buyers?',
    answer: 'Mixed. Post Malone, Action Bronson, and Gary Vee were hobby participants before fame — their collections have depth, multiple categories, and decade-plus continuity. Logan Paul, Drake, and DJ Khaled entered during the 2020-2022 boom and their collections skew toward trophy pieces with content value. Both patterns are real hobby participation; the archive flags the distinction in each bio.',
  },
  {
    question: 'Does a celebrity appearance actually move card prices?',
    answer: 'Yes, measurably. Card Ladder and PWCC have tracked next-day sold-price bumps of 10-30% on specific cards after Drake, Shaq, or McAfee public posts. The effect is strongest on 4-to-5-figure cards where celebrity cosign signals a potential trophy-tier elevation. It is weaker on vintage blue-chips already priced to their demand floor.',
  },
  {
    question: 'What is a "hobby influence score"?',
    answer: 'A 1-10 editorial composite covering auction-record impact (was their purchase a category-defining trade?), mainstream reach (did they introduce the hobby to new audiences?), infrastructure contribution (did they fund hobby platforms or auction houses?), and sustained presence (one-off purchase vs multi-year collecting). 10 is reserved for collectors whose absence would have measurably changed the hobby\'s trajectory.',
  },
  {
    question: 'Why are pro athletes less prominent than entertainment celebrities here?',
    answer: 'A handful of active pros (Mahomes, Durant) are sustained collectors. Most current pro athletes quietly collect but rarely showcase publicly — either to protect family investment privacy or to avoid pumping their own market. Retired athletes with media careers (Shaq, Gronk, McAfee, Ochocinco) are the more visible segment because their post-career content business rewards on-camera ripping.',
  },
  {
    question: 'How do you verify celebrity collection claims?',
    answer: 'Profiles reference publicly documented purchases (auction records, livestream authentication, on-camera opening), not rumored or self-reported holdings. Where a collector has disclosed numbers (Ochocinco\'s $30K/month spend), we cite the disclosure. Where only the auction record exists (Logan Paul\'s Illustrator), we anchor to the PSA registry + Goldin/Iconic Auctions record. Speculative "insider knowledge" is excluded.',
  },
  {
    question: 'Are these profiles financial advice?',
    answer: 'No. The archive is editorial — profiles describe hobby participation and market impact, not recommendations. Celebrity cosign is one signal among many; chasing cards purely because a celebrity posted them has historically underperformed fundamentals-driven buying across multi-year windows.',
  },
];

export default function CelebrityCollectorsPage() {
  const categoryCounts = {
    ATHLETE: celebrityCollectors.filter(c => c.category === 'ATHLETE').length,
    ENTERTAINMENT: celebrityCollectors.filter(c => c.category === 'ENTERTAINMENT').length,
    MEDIA: celebrityCollectors.filter(c => c.category === 'MEDIA').length,
    BUSINESS: celebrityCollectors.filter(c => c.category === 'BUSINESS').length,
    TECH: celebrityCollectors.filter(c => c.category === 'TECH').length,
  };
  const avgInfluence = (
    celebrityCollectors.reduce((s, c) => s + c.hobbyInfluence, 0) / celebrityCollectors.length
  ).toFixed(1);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-8 border-b border-pink-900/40 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-300">
          CARDVAULT · MEDIA · CELEBRITY COLLECTORS
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Who Actually Buys Big Cards
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          An editorial archive of <span className="font-semibold text-pink-300">{celebrityCollectors.length} celebrity collectors</span> whose buying,
          collecting, or institutional capital has shaped the modern card hobby. Notable purchases,
          hobby-influence scores, signature pieces, and the real-market impact of the cosign.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill label="Athletes" count={categoryCounts.ATHLETE} tone="orange" />
          <StatPill label="Entertainment" count={categoryCounts.ENTERTAINMENT} tone="rose" />
          <StatPill label="Media" count={categoryCounts.MEDIA} tone="amber" />
          <StatPill label="Business" count={categoryCounts.BUSINESS} tone="emerald" />
          <StatPill label="Tech" count={categoryCounts.TECH} tone="violet" />
          <span className="px-1 text-slate-600">·</span>
          <StatPill label="Avg influence" count={Number(avgInfluence)} tone="pink" suffix="/10" />
        </div>
      </header>

      <CelebrityCollectorsClient />

      <section className="mt-12 rounded-2xl border border-pink-900/40 bg-pink-950/20 p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-pink-200">Editor&apos;s Note</h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            The hobby had famous collectors long before the 2020 boom — Wayne Gretzky co-owned the T206
            Wagner with Bruce McNall in 1991, Charlie Sheen fronted the $300K Honus purchase in 2000,
            Billy Crystal owned early Mantle graded vintage. But the modern celebrity-collector archetype
            — publicly opening wax, broadcasting purchases, driving measurable price action through
            cosign — that&apos;s a 2019-2020 invention.
          </p>
          <p>
            This archive is editorial. It profiles the collectors whose participation shaped the hobby
            landscape — not who spends the most, but whose buying or infrastructure moved how the hobby
            functions. It leans toward verified public purchases over rumored holdings, and toward
            long-run influence over single-transaction records.
          </p>
          <p>
            A hobby-influence score of 10 is reserved for collectors whose absence would have measurably
            changed the hobby&apos;s trajectory: Post Malone opening the TCG trophy ceiling, Gary Vee
            evangelizing the 2020 boom, Ken Goldin modernizing the auction house, Logan Paul creating
            the celebrity-cosign template. A score of 5-7 reflects real participation that didn&apos;t
            rewrite the rulebook but demonstrably moved individual markets.
          </p>
          <p className="text-slate-500 italic text-xs pt-2">
            Editorial opinions. Not financial advice. Celebrity cosign is one signal among many — buyers
            chasing purely on posted-collector momentum have historically underperformed buyers anchored
            to grading, population, and fundamentals.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-200">Related on CardVault</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <RelatedLink href="/hall-of-fame" label="Card Hall of Fame →" sub="The 50 most iconic cards ever made" />
          <RelatedLink href="/set-archives" label="Set Archives →" sub="40 legendary sets tier-ranked" />
          <RelatedLink href="/card-companies" label="Card Companies Ranked →" sub="16 manufacturers across 120 years" />
          <RelatedLink href="/auction-archive" label="Auction Archive →" sub="40 record-setting hammer prices" />
          <RelatedLink href="/op-ed" label="The CardVault Op-Ed →" sub="Daily rotating columnist opinions" />
          <RelatedLink href="/mailbag" label="The CardVault Mailbag →" sub="Weekly Dear Auntie Mint advice" />
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Celebrity Collectors — Who Actually Buys Big Cards',
        description: `Editorial profiles of ${celebrityCollectors.length} celebrity card collectors, their signature pieces, and their hobby impact.`,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2026-04-16',
        mainEntity: celebrityCollectors.map(c => ({
          '@type': 'Person',
          name: c.name,
          jobTitle: c.profession,
          description: c.bio,
        })),
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
    </main>
  );
}

function StatPill({ label, count, tone, suffix }: { label: string; count: number; tone: string; suffix?: string }) {
  const toneMap: Record<string, string> = {
    pink: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    orange: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneMap[tone] || toneMap.pink}`}>
      <span className="text-slate-400 font-normal">{label}</span>
      <span>{count}{suffix ?? ''}</span>
    </span>
  );
}

function RelatedLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} className="group block rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 transition-colors hover:border-pink-700/50 hover:bg-pink-950/20">
      <div className="text-sm font-medium text-slate-200 group-hover:text-pink-300">{label}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </Link>
  );
}
