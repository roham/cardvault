import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTowerClimbClient from './CardTowerClimbClient';

export const metadata: Metadata = {
  title: 'Card Tower Climb — Risk-Reward Card Game | CardVault',
  description: 'Climb a 10-floor card tower. Each floor has 3 hidden tiles: 1 safe card, 2 bust tiles. Pick right to advance and multiply your bank. Pick wrong and fall. Cash Out at any floor. 10 floors, progressive multipliers, daily + random, shareable emoji ladder.',
  openGraph: {
    title: 'Card Tower Climb — CardVault',
    description: 'Pick the safe tile on each floor. Bank grows with each floor. Fall and you lose it all. How high can you go?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tower Climb — CardVault',
    description: 'Climb 10 floors of a card tower. 1 in 3 odds per floor. Cash out before you fall.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Tower Climb' },
];

const faqItems = [
  {
    question: 'How does Card Tower Climb work?',
    answer: 'A 10-floor tower. On each floor, 3 tiles: one hides a safe card, two hide busts. Click the tile you think is safe. If you pick correctly, the card\'s value (multiplied by the floor\'s multiplier) is added to your bank and you advance to the next floor. If you pick a bust, you fall — and lose your entire bank. Cash Out any time to lock in your score and end the game.',
  },
  {
    question: 'How do the floor multipliers work?',
    answer: 'Multiplier compounds by floor: F1 ×1.0, F2 ×1.2, F3 ×1.4, F4 ×1.6, F5 ×2.0, F6 ×2.5, F7 ×3.0, F8 ×4.0, F9 ×5.0, F10 ×8.0. Reaching F10 and picking the final safe tile also awards a Crown Bonus of $10,000. Every floor has independent 1-in-3 odds (33.3% bust per floor), so the raw chance of reaching F10 on any run is (2/3)^9 ≈ 2.6%. The compounding multiplier rewards the handful of runs that do make it.',
  },
  {
    question: 'What determines the card values on each floor?',
    answer: 'Card selection is biased by floor — early floors pull from the broader population (value distribution skewed toward modest $5–100 cards) and higher floors pull from rarer tiers (F7+ favors $500+ cards, F10 guarantees a $1,000+ card). This means an early-floor bust costs less in foregone progress but also nets less per correct pick. The curve rewards climbing while acknowledging that the expected value on floor 1 is much lower than floor 10.',
  },
  {
    question: 'When should I cash out?',
    answer: 'Math: reaching F5 has probability (2/3)^4 ≈ 19.8%, with expected bank around $800. Reaching F7 is 8.8% and typical bank $3K+. F10 is 2.6% and typical bank $25K+. A risk-neutral player presses to F10. A risk-averse player cashes out at F5–F6 (roughly where marginal multiplier gain per floor ≈ 50% bust risk over the next two floors). The "bank and run" crowd cashes out at F3–F4 for near-guaranteed small wins.',
  },
  {
    question: 'How is my grade calculated?',
    answer: 'Based on banked score. S: $25,000+ (usually requires reaching F9 or clearing F10). A: $10,000–24,999. B: $3,500–9,999. C: $1,500–3,499. D: $500–1,499. F: under $500 or bust on F1–F2. localStorage tracks games, best score, longest climb, Crown completions (full F10 clears), and total busts.',
  },
  {
    question: 'Daily vs Random mode?',
    answer: 'Daily seeds the tower configuration from today\'s date + sport filter — every player gets the same safe-tile layout and card distribution on the same day. Your daily streak increments each day you play (one play per day counts, regardless of outcome). Random reseeds every game for unlimited replay variety. Daily score and Random score track separately.',
  },
];

export default function CardTowerClimbPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          GAME · DAILY + RANDOM
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Card Tower Climb
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          10 floors. 3 tiles per floor — one safe, two bust. Pick right to advance and multiply your bank. Pick wrong, fall, lose everything. Cash Out any time. Reach F10 for the Crown Bonus.
        </p>
      </header>

      <CardTowerClimbClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Floor multiplier and reach odds</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="text-slate-400">
              <tr>
                <th className="px-2 py-2 text-left">Floor</th>
                <th className="px-2 py-2 text-right">Multiplier</th>
                <th className="px-2 py-2 text-right">Reach odds</th>
                <th className="px-2 py-2 text-left">Card tier bias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr><td className="px-2 py-2">F1</td><td className="px-2 py-2 text-right">×1.0</td><td className="px-2 py-2 text-right">100%</td><td className="px-2 py-2">Common $5–25</td></tr>
              <tr><td className="px-2 py-2">F2</td><td className="px-2 py-2 text-right">×1.2</td><td className="px-2 py-2 text-right">67%</td><td className="px-2 py-2">Common $5–50</td></tr>
              <tr><td className="px-2 py-2">F3</td><td className="px-2 py-2 text-right">×1.4</td><td className="px-2 py-2 text-right">44%</td><td className="px-2 py-2">Mid $25–100</td></tr>
              <tr><td className="px-2 py-2">F4</td><td className="px-2 py-2 text-right">×1.6</td><td className="px-2 py-2 text-right">30%</td><td className="px-2 py-2">Mid $50–250</td></tr>
              <tr><td className="px-2 py-2">F5</td><td className="px-2 py-2 text-right">×2.0</td><td className="px-2 py-2 text-right">20%</td><td className="px-2 py-2">Mid $100–500</td></tr>
              <tr><td className="px-2 py-2">F6</td><td className="px-2 py-2 text-right">×2.5</td><td className="px-2 py-2 text-right">13%</td><td className="px-2 py-2">High $250–1K</td></tr>
              <tr><td className="px-2 py-2">F7</td><td className="px-2 py-2 text-right">×3.0</td><td className="px-2 py-2 text-right">8.8%</td><td className="px-2 py-2">High $500–2K</td></tr>
              <tr><td className="px-2 py-2">F8</td><td className="px-2 py-2 text-right">×4.0</td><td className="px-2 py-2 text-right">5.9%</td><td className="px-2 py-2">Elite $1K–5K</td></tr>
              <tr><td className="px-2 py-2">F9</td><td className="px-2 py-2 text-right">×5.0</td><td className="px-2 py-2 text-right">3.9%</td><td className="px-2 py-2">Elite $2K–10K</td></tr>
              <tr><td className="px-2 py-2">F10</td><td className="px-2 py-2 text-right">×8.0 + $10K Crown</td><td className="px-2 py-2 text-right">2.6%</td><td className="px-2 py-2">Trophy $5K+</td></tr>
            </tbody>
          </table>
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
            { href: '/card-minesweeper', label: 'Card Minesweeper' },
            { href: '/card-briefcase', label: 'Card Briefcase' },
            { href: '/card-poker', label: 'Card Poker' },
            { href: '/card-plinko', label: 'Card Plinko' },
            { href: '/card-snake', label: 'Card Snake' },
            { href: '/games', label: 'All Games →' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Tower Climb',
          url: 'https://cardvault-two.vercel.app/card-tower-climb',
          description:
            '10-floor progressive risk card game. Pick the safe tile, advance, multiply bank. Pick wrong, fall. Cash out at any floor.',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Web',
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
