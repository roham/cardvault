import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FirstHitClient from './FirstHitClient';

export const metadata: Metadata = {
  title: 'First Hit Live — Launch-Day Card Pulls Feed | CardVault',
  description: 'Live feed of first-of-set hits from new card product launches. First 1/1 pulled, first superfractor, first rainbow auto, first SSP — the launch-window pulls collectors watch for. Tier-sorted, product-filtered, sport-filtered, pause/resume. Simulated feed with realistic tier distribution.',
  openGraph: {
    title: 'First Hit Live — CardVault',
    description: 'Launch-day card pulls as they happen. First 1/1s, superfractors, rainbow autos. Live feed.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'First Hit Live — CardVault',
    description: 'First hits from fresh product launches. Live-updating pulls feed.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'First Hit Live' },
];

const faqItems = [
  {
    question: 'What is First Hit Live?',
    answer: 'A live feed that captures the MOMENT a notable card is pulled from a freshly-launched product — the "first 1/1 of the set," the "first superfractor of the rookie," the "first complete-rainbow auto." Different from Rip Wire, which shows all pack pulls continuously. First Hit Live is specifically about LAUNCH-WINDOW pulls (first 2-4 weeks after a product drops) and specifically about MILESTONE pulls (the first of any notable card type in the wild). The launch window is when the hobby pays attention most — collectors are actively opening, forums are active, prices are volatile, and each "first" sets a market anchor.',
  },
  {
    question: 'What are the 5 hit tiers?',
    answer: 'LEGENDARY (first-ever 1/1 of the set pulled — ~1% of feed items, 20-50× base multiplier) / GRAIL (first superfractor, first national treasures patch auto, first shadowbox prime — ~4% of feed, 8-20× multiplier) / ELITE (first complete rainbow auto, first case-hit SSP — ~10% of feed, 3-8× multiplier) / HIGHLIGHT (first notable parallel — silver prizm, gold SP, refractor auto — ~25% of feed, 1.5-3× multiplier) / FIRST (first of any named rookie RC, first base auto — ~60% of feed, 0.8-1.5× multiplier). Tier probability distribution matches documented launch-window spotlight frequency.',
  },
  {
    question: 'Are these real pulls?',
    answer: 'No — this is a simulated feed for visualization. Real pulls are tracked by platforms like Loupe, Whatnot, Fanatics Live, and break operators in real-time. This feed models the DISTRIBUTION and CADENCE of launch-window first-hit activity across a weighted mix of recent/active products so you can see what the hobby rhythm looks like during a hot launch. If you want true live pulls, check break operator streams on Whatnot and Fanatics Live.',
  },
  {
    question: 'Which products are in the rotation?',
    answer: 'Eight products in the active rotation — a mix of recent launches and simulated in-window: 2025-26 NBA Panini Prizm, 2025 NFL Panini Prizm, 2025 Topps Chrome Baseball, 2025 Bowman Chrome Draft, 2025-26 Upper Deck Young Guns, 2024 Topps Pristine, 2025 Topps Definitive, 2024 Panini Contenders Football. Products rotate weight based on "launch heat" — a product in its first 2 weeks carries 2-3× weight vs a 2-month-old product. The product filter lets you lock to one product if you want to track a specific launch.',
  },
  {
    question: 'What do "puller handles" represent?',
    answer: 'Each feed item shows a fake @collector_xxxx handle and platform (Whatnot, Fanatics Live, personal rip, break, retail box). These are synthetic — for visualization only. Real-world first-hit pullers are mixed: high-volume breakers with live audiences, individual case-breakers, retail shoppers who get lucky, and LCS (local card shops) openers. Each source class influences how the "first" propagates — breaker-pulled firsts get immediate viral spotlight, personal-rip firsts often spread via Reddit/Twitter, retail-box firsts can stay quiet for days.',
  },
  {
    question: 'How is this different from Grail Watch or Rip Wire?',
    answer: 'Grail Watch = large cards selling for $1K+ (value-based cutoff, continuous stream, cross-product). Rip Wire = any pack pull across any time period (volume-based stream, continuous). First Hit Live = specifically the FIRST pull of a notable card type within the LAUNCH WINDOW of a product (milestone-based stream, time-bounded). Three complementary axes: by value (Grail), by volume (Rip), by milestone (First Hit). A collector who wants launch-market intelligence watches First Hit. A collector who wants to see raw activity watches Rip Wire. A collector who wants to track high-value sales watches Grail Watch.',
  },
  {
    question: 'Why does launch-window first-hit timing matter for pricing?',
    answer: 'First-hit sales SET the market anchor for a new card. When the first copy of a rookie\'s 1/1 superfractor sells for $40K, every subsequent copy references that anchor. If the first-hit sells low (cold launch), subsequent sales tend to compress below it. If the first-hit sells high (hot launch), later sales find a ceiling and compress downward from there. For sellers: first-hit is often the PEAK price — launch-window FOMO plus one-of-none scarcity. For buyers: first-hit is often the MOST expensive price — waiting 3-6 months typically captures a 20-40% discount as launch buzz fades.',
  },
  {
    question: 'What about the "time ago" stamps?',
    answer: 'Each feed item shows "X minutes ago" relative to the current time. The feed cycles items every 5 seconds, adding new hits at the top and aging older ones down. After 30 minutes, items roll off the feed. The distribution of recency is weighted to favor the last 10 minutes (hot window) with a long tail out to 30 minutes. Pause/resume freezes the feed on demand — useful if you spot a tier-LEGENDARY item and want to read details without it scrolling away.',
  },
];

export default function FirstHitPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'First Hit Live',
        description: 'Launch-window first-hit card pull feed — first 1/1, first superfractor, first rainbow auto.',
        url: 'https://cardvault-two.vercel.app/first-hit',
        applicationCategory: 'Entertainment',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="relative flex items-center">
            <span className="absolute w-2 h-2 rounded-full bg-violet-400 animate-ping opacity-75"></span>
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          </span>
          <span>Live launch-window feed · P4 Live · 12th axis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          First Hit Live
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Launch-window first pulls as they happen. The first 1/1 of a set. The first superfractor.
          The first rainbow auto of a rookie. Five hit tiers, eight active products, real-time
          cadence. Watch the hobby\u2019s launch rhythm live.
        </p>
      </div>

      <FirstHitClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-violet-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related live feeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/rip-wire" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Rip Wire</div>
            <div className="text-sm text-slate-400">Continuous pack-pull feed across all products</div>
          </Link>
          <Link href="/grail-watch" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Grail Watch Live</div>
            <div className="text-sm text-slate-400">$1K+ sales as they close</div>
          </Link>
          <Link href="/steal-watch" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Steal Watch Live</div>
            <div className="text-sm text-slate-400">Under-FMV closings across 8 venues</div>
          </Link>
          <Link href="/auction-wire" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Auction Wire</div>
            <div className="text-sm text-slate-400">Closing auction countdowns</div>
          </Link>
          <Link href="/consignment-drop" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Consignment Drop Live</div>
            <div className="text-sm text-slate-400">Pre-bidding auction catalogs</div>
          </Link>
          <Link href="/live-hub" className="bg-slate-900/60 border border-slate-800 hover:border-violet-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Live Feeds →</div>
            <div className="text-sm text-slate-400">Browse 12+ live intelligence streams</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
