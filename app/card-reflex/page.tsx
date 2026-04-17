import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardReflexClient from './CardReflexClient';

export const metadata: Metadata = {
  title: 'Card Reflex — Daily Reaction-Time Sports Card Game | CardVault',
  description: 'Cards flash on screen one at a time. Tap if the card matches today\'s target criteria. Tap wrong and you lose time; miss a match and you lose points. How many can you clear in 45 seconds? Free daily reaction-time game with adaptive difficulty.',
  openGraph: {
    title: 'Card Reflex — CardVault',
    description: 'Pure reaction-time card game. Tap the matches, skip the decoys. Go-no-go classic.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Reflex — CardVault',
    description: 'Card flashes — tap if it matches the target. Reaction-time test with real sports cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Reflex' },
];

const faqItems = [
  {
    question: 'How do you play Card Reflex?',
    answer: 'A random sports card flashes at the center of the screen every 1-1.5 seconds. Your job: TAP if the card matches the current target criterion, SKIP (do nothing) if it does not. Correct tap on a match = +10 points. Correct skip on a non-match = +2 points (quiet reward for discipline). Wrong tap on a non-match = -5 points. Missed tap on a match = -3 points. Play for 45 seconds; try to maximize points. This is the classic "go/no-go" reaction-time task used in cognitive psychology research, adapted with real sports cards instead of arbitrary shapes.',
  },
  {
    question: 'What are the target criteria?',
    answer: 'The tool rotates among 4 criterion types: BY SPORT (tap if the card is baseball), BY ERA (tap if the card is pre-1990), BY ROOKIE STATUS (tap if the card is a rookie card), BY VALUE TIER (tap if the card\'s gem value is $1,000+). Each daily round uses a single criterion so you can build muscle memory. Criterion is shown at the top of the screen throughout the round. Free-Play mode lets you cycle through all 4 criteria for practice.',
  },
  {
    question: 'What are the three difficulty tiers?',
    answer: 'EASY — card shows for 1,500ms, 45-second round, ~30 cards total, 50% match rate (half the cards you see match the criterion). Good for warm-up. NORMAL — card shows for 1,100ms, 45-second round, ~40 cards, 40% match rate (more decoys, forces active discrimination). HARD — card shows for 800ms, 60-second round, ~75 cards, 30% match rate (most cards are decoys — the task becomes genuine sustained-attention work). Your best score is tracked per difficulty.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'HIT (correctly tapped a match) = +10 points. CORRECT REJECT (correctly skipped a non-match) = +2 points. FALSE ALARM (tapped a non-match) = -5 points. MISS (failed to tap a match) = -3 points. Grade curve: S 200+, A 150-199, B 100-149, C 50-99, D 10-49, F <10. Perfect play on Normal (~16 matches × 10 + 24 correct rejects × 2 = 208 points) reaches S-tier. False alarms and misses both compound negatively, so restraint matters as much as speed.',
  },
  {
    question: 'Daily mode vs Free Play — what is the difference?',
    answer: 'DAILY MODE uses a date-seeded card pool + date-seeded criterion — every player on the same day faces the same criterion on the same cards. Your score is directly comparable across the hobby community, and your daily streak counts consecutive plays. FREE PLAY generates a fresh card pool + random criterion each time. Both modes share the per-difficulty best-score leaderboard stat locally.',
  },
  {
    question: 'What cognitive skill does this measure?',
    answer: 'Two overlapping skills: (1) SUSTAINED ATTENTION — maintaining task focus across the 45-60 second round without lapses. Fatigue and attention drift show up as MISSES in the second half of the round. (2) INHIBITORY CONTROL — resisting the urge to tap on non-matches. The "go/no-go" paradigm specifically measures your ability to INHIBIT a prepotent response. False alarms measure inhibitory failures. Research shows caffeine, sleep quality, and exercise all affect go/no-go performance in measurable ways — you can use Card Reflex as a rough cognitive-state self-test across days.',
  },
  {
    question: 'How is Card Reflex different from Card Beat and Card Echo?',
    answer: 'Card Echo (G-076) = SEQUENCE MEMORY — watch a pattern, reproduce it. Card Beat (G-077) = RHYTHM TIMING — tap in time with a fixed beat. Card Reflex (G-078 this game) = REACTION + INHIBITION — decide per-card whether to act or not, as fast as possible. Three orthogonal cognitive axes: memory / rhythm / reaction. Being good at one does not transfer much to the others. Together they form the complete "brain training" pillar of CardVault\'s game catalog.',
  },
  {
    question: 'Why the +2 points for correct rejects?',
    answer: 'Without the small reward for correct rejects, the optimal strategy would be "tap everything rapidly" — because HIT ($+10) + FALSE ALARM (-$5) on a 50/50 match rate averages to +2.50 per card, better than the $+2 reward for correctly doing nothing. The +2 for correct rejects shifts the optimal strategy toward DISCRIMINATION — you have to actually evaluate each card, not tap reflexively. This is the same mechanism used in academic go/no-go paradigms to force genuine cognitive engagement rather than motor rehearsal.',
  },
];

export default function CardReflexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Reflex',
        description: 'Reaction-time go/no-go game using real sports cards. Tap if the card matches today\'s criterion.',
        url: 'https://cardvault-two.vercel.app/card-reflex',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-300 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          <span>⚡</span>
          Daily reaction-time · Go/no-go task · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Reflex</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Cards flash one at a time — tap if it matches the target criterion, skip if it doesn&apos;t. Pure reaction +
          inhibition. 45-60 second rounds. Three difficulty tiers.
        </p>
      </header>

      <CardReflexClient />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/card-beat" className="block bg-slate-900/60 border border-slate-800 hover:border-fuchsia-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Card Beat →</div>
          <div className="text-xs text-slate-400">Rhythm-timing sibling. Tap with the beat grid.</div>
        </Link>
        <Link href="/card-echo" className="block bg-slate-900/60 border border-slate-800 hover:border-fuchsia-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Card Echo →</div>
          <div className="text-xs text-slate-400">Sequence-memory sibling. Watch the pattern, repeat it.</div>
        </Link>
        <Link href="/games" className="block bg-slate-900/60 border border-slate-800 hover:border-fuchsia-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">All games →</div>
          <div className="text-xs text-slate-400">80+ daily sports card games.</div>
        </Link>
      </div>

      <section className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-fuchsia-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
