import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTriadClient from './CardTriadClient';

export const metadata: Metadata = {
  title: 'Card Triad — 3×3 Grid Battle Game | CardVault',
  description: 'Place cards on a 3×3 grid. Each card has four edge numbers — Heritage (top), Market (right), Rookie (bottom), Clout (left) — derived from real card data. Higher edge captures the opponent\'s adjacent card. Whoever owns the most cards after the grid fills wins. Free daily strategy game for card collectors.',
  openGraph: {
    title: 'Card Triad — CardVault',
    description: '3×3 grid card battle. Edge stats from real card data. Capture to win.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Triad — CardVault',
    description: 'Play Triple Triad with real trading cards. Capture opponent cards with higher edge numbers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Triad' },
];

const faqItems = [
  {
    question: 'How do you play Card Triad?',
    answer: 'You and the AI each get a hand of 5 cards. Player places first, then you alternate placing cards into empty cells of a 3×3 grid. Each card shows 4 edge numbers — Heritage (top), Market (right), Rookie (bottom), Clout (left) — rated 1–10 (A = 10). When you place a card next to an opponent card, the facing edges battle: if your number is strictly higher than theirs, you capture that card and it flips to your color. Game ends when the grid is full (9 placements). Most owned cards wins.',
  },
  {
    question: 'What do the four edge numbers represent?',
    answer: 'Heritage (top) is how vintage or classic the card is — a 1952 Topps Mantle scores A (10), a 2025 rookie scores 2. Market (right) is log-scaled from the card\'s raw estimated value — $10k+ cards score A, $1 cards score 1. Rookie (bottom) rewards true rookie cards with a bonus — RCs average 7–9, non-RCs average 2–4. Clout (left) reflects player/sport prestige derived from card value × rookie × modern-era modifiers. All four edges are deterministic from the card\'s real data, so the same card always has the same stats.',
  },
  {
    question: 'Can there be ties?',
    answer: 'Yes, edge values can tie. When your facing edge equals the opponent\'s, nothing happens — no capture either way. You only capture when your edge is strictly greater. This means building a hand around balanced edges (a card with 8/8/8/8) is often better than one lopsided stat (A/1/1/1), since it wins more matchups overall.',
  },
  {
    question: 'Is there a daily puzzle?',
    answer: 'Today\'s Triad is the daily challenge — the same 5 player cards and 5 AI cards shuffled from the same seed for everyone visiting today. Beat the AI on Daily mode to bank the day\'s streak. Free Play gives a new random matchup each time you click New Match — no streak, pure replayability.',
  },
  {
    question: 'How does the AI choose its moves?',
    answer: 'The AI evaluates every possible (card × empty cell) pairing and scores it by: (a) how many of your cards it captures on placement, (b) how vulnerable the placed card is to your remaining hand, (c) corner and edge positioning bias. It picks the highest-scoring move, with a small randomization so matches don\'t feel scripted. Corners are strongest (only 2 exposed edges); center is weakest (4 exposed edges).',
  },
  {
    question: 'Does Card Triad use real card data?',
    answer: 'Yes. Every card drawn into a hand is a real card from CardVault\'s 9,840-card sports database. The four edge numbers are computed live from that card\'s actual year, estimated raw value, rookie flag, and sport. Nothing is fabricated. After the match you can click any card on the board to open its CardVault page.',
  },
];

export default function CardTriadPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          3×3 GRID BATTLE · DAILY PUZZLE
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Card Triad
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          Place cards on a 3×3 grid. Each card has four edge numbers — Heritage, Market, Rookie, Clout — derived from real card data. Beat the facing edge to capture. Most cards at grid-full wins.
        </p>
      </header>

      <CardTriadClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">How it works</h2>
        <ol className="space-y-2 text-sm text-slate-300">
          <li><span className="font-semibold text-emerald-300">1.</span> You and the AI each get 5 cards. Your hand shows on the left, AI\'s on the right (face-down).</li>
          <li><span className="font-semibold text-emerald-300">2.</span> You place first. Click a card in your hand, then click an empty cell on the grid.</li>
          <li><span className="font-semibold text-emerald-300">3.</span> Each placed card checks its 4 neighbors. For each adjacent opponent card, the touching edges battle. Your edge &gt; theirs = capture (flip to your color).</li>
          <li><span className="font-semibold text-emerald-300">4.</span> AI places next, same rules. You alternate 9 times total until the grid is full.</li>
          <li><span className="font-semibold text-emerald-300">5.</span> Whoever owns more cards on the grid wins the match.</li>
        </ol>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-xs font-semibold text-red-300">HERITAGE</div>
          <div className="mt-1 text-xs text-slate-400">Top edge. How vintage the card is. 1952 Topps = A. Modern RC = 2.</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="text-xs font-semibold text-amber-300">MARKET</div>
          <div className="mt-1 text-xs text-slate-400">Right edge. Log-scaled raw value. $10k+ = A. $1 = 1.</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="text-xs font-semibold text-emerald-300">ROOKIE</div>
          <div className="mt-1 text-xs text-slate-400">Bottom edge. Rookie flag + era bonus. True RCs score 7–9.</div>
        </div>
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="text-xs font-semibold text-violet-300">CLOUT</div>
          <div className="mt-1 text-xs text-slate-400">Left edge. Player/sport prestige × value × modern-era bonus.</div>
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
        <h2 className="mb-3 text-lg font-semibold">More card games</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/card-clash', label: 'Card Clash — Draft Battle' },
            { href: '/card-connections', label: 'Card Connections' },
            { href: '/card-battle', label: 'Card Battle' },
            { href: '/guess-the-card', label: 'Guess the Card' },
            { href: '/card-bracket', label: 'Card Bracket' },
            { href: '/games', label: 'All Games →' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'GameApplication',
          name: 'Card Triad',
          url: 'https://cardvault-two.vercel.app/card-triad',
          description:
            '3×3 grid battle game where real trading cards have four edge numbers. Capture opponent cards with higher facing edges to win.',
          applicationCategory: 'Game',
          operatingSystem: 'Web',
          genre: 'Strategy',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
