import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { postMortems } from './data';

export const metadata: Metadata = {
  title: 'The CardVault Post-Mortems — Hobby Flops, Busts, and What Went Wrong | CardVault',
  description: 'A casefile archive of card-hobby flops. Seven product post-mortems covering overproduction disasters, gimmick sets collectors revolted against, rushed manufacturer experiments that tanked, and price crashes that took years to understand. Launch hype, timeline of the collapse, pricing arc, collector lessons — the hobby almanac nobody wants to write.',
  openGraph: {
    title: 'The CardVault Post-Mortems — CardVault',
    description: 'A casefile archive of card-hobby flops. What went wrong, what collectors lost, and the lessons future buyers need to remember.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The CardVault Post-Mortems — CardVault',
    description: 'Casefile archive of card-hobby flops. Overproduction, gimmicks, rushed sets — what went wrong and why.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Post-Mortems' },
];

const faqItems = [
  {
    question: 'Why publish a post-mortem archive?',
    answer: 'Because every new product release is pitched as the next Topps Chrome — but most releases fade, flop, or fail outright, and that institutional memory dies quickly. Collectors who started after 2015 did not live through the 1988-1994 overproduction disaster or the 2005-2009 autograph-set collapse. Post-mortems are the hobby almanac nobody writes — the receipts of what went wrong, preserved so the same marketing pitch does not sell the same mistake twice.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. Post-mortems are history, not prediction. Reading about the 1991 junk wax era teaches you what overproduction does to residual value — but it does not tell you whether 2026 Topps Chrome is going to be the next Fleer Ultra. Every flop has specific causes; general lessons are useful, but every new product is a new question. These case studies are written as journalism, not investment research.',
  },
  {
    question: 'How do you decide what counts as a flop?',
    answer: 'Three signals. First, the product launched with above-average hype or distribution and then failed to clear inventory at or near MSRP. Second, secondary-market prices dropped 50%+ from peak ask within 18 months of release. Third, manufacturer discontinued, rebranded, or quietly restructured the line. A product that satisfies any two of those three qualifies. Cult favorites that held collector attention but underperformed sales projections are a separate archive — we cover those in Hidden Gems.',
  },
  {
    question: 'Why these particular products?',
    answer: 'Seven cases span six decades and cover different failure modes: overproduction (1989 Fleer), gimmick-rush (1995 Topps Finest refractors at scale), pre-Internet pricing collapse (1990 Score Football), license-war casualty (2009 Upper Deck baseball), micro-print madness (2013 Topps Supreme), set-size bloat (2006 Topps flagship), and auction-house short-print manipulation (2022 National Convention 7-Eleven). Different eras, different villains, different lessons.',
  },
  {
    question: 'Are the prices and dates verified?',
    answer: 'Prices are sourced from PSA auction archives, PWCC/eBay completed listings, and Sports Collectors Daily retrospectives. Dates and production runs cite manufacturer press releases, Beckett magazine archives, and contemporary hobby-press coverage where available. Some peak-price claims use reasonable industry estimates when exact archival data is thin — we flag those explicitly in the case text with "est." or "reported".',
  },
  {
    question: 'Will you add more post-mortems?',
    answer: 'Yes. New cases publish quarterly. Upcoming candidates include 1992-94 Stadium Club pricing collapse, 2020-21 Panini NFL scarcity mania, 2002 Donruss Rookies and Traded, the 2001 eTopps experiment, and the late-1990s Pacific foil-variation era. Submit flop nominations via Mailbag if you want a specific product covered.',
  },
];

export default function PostMortemsIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'The CardVault Post-Mortems',
        description: 'Casefile archive of card-hobby flops, overproduction disasters, and rushed manufacturer experiments.',
        url: 'https://cardvault-two.vercel.app/post-mortems',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <header className="mt-4 mb-8 border-b border-zinc-700 pb-6">
        <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-sm mb-5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          Casefile Archive · Hobby Flops
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
          The CardVault Post-Mortems
        </h1>
        <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
          Seven card-hobby flops, examined as casefiles. Launch hype, the failure timeline, the pricing arc from peak to floor, and the lesson future buyers need to remember. The almanac nobody writes — because the people who lost money prefer not to relive it.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4">
        {postMortems.map((pm, i) => (
          <Link
            key={pm.slug}
            href={`/post-mortems/${pm.slug}`}
            className="group block bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-red-700/50 rounded-md p-5 sm:p-6 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-md flex flex-col items-center justify-center font-mono">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Case</div>
                <div className="text-xl sm:text-2xl font-black text-red-400">#{String(i + 1).padStart(2, '0')}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">{pm.year}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{pm.manufacturer}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{pm.failureMode}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-red-300 transition-colors leading-tight mb-1">
                  {pm.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-3">
                  {pm.hook}
                </p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-red-500">▼</span> {pm.priceCrashPct}% crash
                  </span>
                  <span>Peak {pm.peakPrice} → Floor {pm.floorPrice}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-12 bg-zinc-900/60 border border-zinc-800 rounded-md p-6">
        <h2 className="text-lg font-bold text-white mb-4">Six Failure Modes We See Repeat</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex gap-2"><span className="text-red-500 font-mono">01</span><span><strong className="text-white">Overproduction</strong> — manufacturer floods market, residual value evaporates. Fleer 1989, Score 1990.</span></li>
          <li className="flex gap-2"><span className="text-red-500 font-mono">02</span><span><strong className="text-white">Gimmick bloat</strong> — parallels multiply faster than collector interest. Topps Finest refractors at scale, Pacific foil variations.</span></li>
          <li className="flex gap-2"><span className="text-red-500 font-mono">03</span><span><strong className="text-white">Set-size bloat</strong> — product becomes unaffordable to complete, collectors disengage. 2006 Topps, 1993 Score.</span></li>
          <li className="flex gap-2"><span className="text-red-500 font-mono">04</span><span><strong className="text-white">License-war casualty</strong> — exclusive deals orphan competing brand. 2009 UD Baseball, 2013 Panini NFL.</span></li>
          <li className="flex gap-2"><span className="text-red-500 font-mono">05</span><span><strong className="text-white">Micro-print manipulation</strong> — short-prints engineered for manufactured scarcity, then flooded. 2013 Topps Supreme, 2022 NSCC 7-Eleven.</span></li>
          <li className="flex gap-2"><span className="text-red-500 font-mono">06</span><span><strong className="text-white">Rushed digital pivot</strong> — tech experiment without collector demand. 2001 eTopps, various Topps Bunt iterations.</span></li>
        </ul>
      </section>

      <section className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-md p-6">
        <h2 className="text-lg font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-5">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-1.5 text-sm">{item.question}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 bg-gradient-to-br from-red-950/30 to-zinc-900/60 border border-red-900/40 rounded-md p-6">
        <h2 className="text-lg font-bold text-white mb-3">Read Next</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/mailbag" className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-md transition-colors">
            <span className="text-xl">✉️</span>
            <div>
              <div className="text-white text-sm font-semibold">Mailbag</div>
              <div className="text-zinc-500 text-xs">Reader Q&A</div>
            </div>
          </Link>
          <Link href="/hobby-timeline" className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-md transition-colors">
            <span className="text-xl">🗓️</span>
            <div>
              <div className="text-white text-sm font-semibold">Hobby Timeline</div>
              <div className="text-zinc-500 text-xs">Defining moments</div>
            </div>
          </Link>
          <Link href="/news" className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-md transition-colors">
            <span className="text-xl">📰</span>
            <div>
              <div className="text-white text-sm font-semibold">News</div>
              <div className="text-zinc-500 text-xs">Weekly roundup</div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
