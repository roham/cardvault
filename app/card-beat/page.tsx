import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBeatClient from './CardBeatClient';

export const metadata: Metadata = {
  title: 'Card Beat — Daily Rhythm-Timing Sports Card Game | CardVault',
  description: 'Tap the cards in time with the beat. Each track runs at a fixed BPM across four lanes — when a card pulses on its lane, hit the matching tile in the target window for maximum points. Free daily rhythm game with three difficulty tiers.',
  openGraph: {
    title: 'Card Beat — CardVault',
    description: 'A rhythm-timing game with real sports cards. Watch the pulse, hit the beat, chain the perfects.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Beat — CardVault',
    description: 'Tap cards in rhythm. Perfect / Great / Good windows. Three BPM tiers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Beat' },
];

const faqItems = [
  {
    question: 'How do you play Card Beat?',
    answer: 'Four sports cards sit in four lanes at the top of the screen. A pulse indicator travels across the bottom of each lane as the beat runs. When the pulse enters the HIT WINDOW (the highlighted ring), tap the card above that lane. Timing matters: hit inside the innermost ring for PERFECT (100pt), the middle ring for GREAT (50pt), the outer ring for GOOD (25pt), miss the window and the beat scores MISS (0pt). The full track plays out for 45 seconds on Normal difficulty with 15-60 beats depending on BPM.',
  },
  {
    question: 'What are the three difficulty tiers?',
    answer: 'EASY — 60 BPM (one beat per second), 30-second track, 4-card lane pool, wide timing windows (PERFECT ±180ms, GREAT ±280ms). Good for learning the feel. NORMAL — 100 BPM, 45-second track, 4-card lane pool, standard windows (PERFECT ±120ms, GREAT ±200ms). Default tier. HARD — 140 BPM, 60-second track, 4-card lane pool, tight windows (PERFECT ±80ms, GREAT ±140ms). Pushes into speed-chunking territory — you cannot look at individual cards at 140 BPM, you have to learn to READ THE LANE PULSE directly. Your best-score stat is tracked separately per difficulty.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Every beat scores independently. PERFECT = 100 points. GREAT = 50 points. GOOD = 25 points. MISS = 0 points AND breaks your streak multiplier. COMBO MULTIPLIER: every 10-perfect-or-great consecutive streak adds a +0.1× multiplier (cap ×3.0). A perfect run at Normal (45 beats × 100 × up to 3× multiplier) caps around 8,000 points. Grade curve: S 7,500+ / A 5,500-7,499 / B 3,500-5,499 / C 2,000-3,499 / D 800-1,999 / F 0-799.',
  },
  {
    question: 'Daily mode vs Free Play — what is the difference?',
    answer: 'Daily mode uses a date-seeded BEAT PATTERN and CARD POOL — every player on the same day faces the exact same track (same lane-by-lane beat sequence at the same BPM). Your score is directly comparable to other collectors\' runs today, and your daily streak counts consecutive playthroughs. Free Play generates a fresh beat pattern on every attempt so you can practice rhythms without locking into the daily track. Both modes share lifetime stats.',
  },
  {
    question: 'What makes a beat pattern feel good?',
    answer: 'Card Beat generates beat patterns with three shaping rules. First, AVOID 4+ IN A ROW on the same lane — distributes hits across lanes for engagement. Second, CLUSTER TWO-LANE HITS occasionally — creates satisfying dual-hit phrases. Third, REST-BEAT DENSITY varies by difficulty — Easy has ~30% rest beats (breathing room), Hard has ~10% (nearly every beat is a hit). The procedural generator enforces these rules while keeping the daily-seed deterministic.',
  },
  {
    question: 'Is there a rhythm game muscle-memory effect?',
    answer: 'Yes — the same reason Guitar Hero, osu!, and Beat Saber players talk about "chunking." When you first play Hard, every beat feels independent and the 140 BPM feels overwhelming. After 5-10 tracks at Hard, your brain stops processing each beat individually and starts recognizing 4-beat or 8-beat phrases as single chunks — at which point the BPM ceases to matter and you\'re responding to pattern rather than individual hits. Card Beat mirrors this: Daily-mode repetition builds chunking specifically on the Daily pattern, and your Daily-best tends to improve over a week even without changing anything else.',
  },
  {
    question: 'How is Card Beat different from Card Echo?',
    answer: 'Card Echo (G-076) is a SEQUENCE MEMORY game — watch a pattern, reproduce it. Cognitive task: hold the sequence in working memory. Time pressure is AFTER the pattern ends. Card Beat is a RHYTHM TIMING game — beats arrive in real time, you respond to each one at the moment it enters the hit window. Cognitive task: temporal anticipation and motor-timing precision. Time pressure is DURING the beat. The two games are cognitively orthogonal — being good at Card Echo does not help Card Beat and vice versa. Together they cover working-memory and rhythm-timing cells of the cognitive-task matrix.',
  },
  {
    question: 'Why real sports cards instead of generic Guitar Hero colors?',
    answer: 'A generic rhythm game uses colored buttons that mean nothing. Card Beat uses four real sports cards per lane — each card has its sport color (baseball sky / basketball orange / football emerald / hockey cyan) which doubles as the lane-color cue. Between tracks, you incidentally learn the cards in the daily pool. Same low-pressure exposure pattern Card Echo uses, adapted for rhythm instead of memory.',
  },
];

export default function CardBeatPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Beat',
        description: 'A daily rhythm-timing game using real sports cards across four lanes. Tap on-beat for Perfect / Great / Good scoring.',
        url: 'https://cardvault-two.vercel.app/card-beat',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-300 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
          <span>🎵</span>
          Daily rhythm game · 3 BPM tiers · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Beat</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Four lanes. Four sports cards. One beat grid. Tap the card on its lane when the pulse reaches the hit window —
          PERFECT / GREAT / GOOD scoring with combo multipliers up to 3×.
        </p>
      </header>

      <CardBeatClient />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/card-echo" className="block bg-slate-900/60 border border-slate-800 hover:border-pink-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Card Echo →</div>
          <div className="text-xs text-slate-400">Sequence-memory sibling game. Watch the pattern, repeat it back.</div>
        </Link>
        <Link href="/games" className="block bg-slate-900/60 border border-slate-800 hover:border-pink-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">All games →</div>
          <div className="text-xs text-slate-400">80+ daily sports-card games across 12 cognitive-task axes.</div>
        </Link>
      </div>

      <section className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-pink-300 transition">
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
