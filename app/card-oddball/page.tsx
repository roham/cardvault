import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardOddballClient from './CardOddballClient';

export const metadata: Metadata = {
  title: 'Card Oddball — Daily Spot-the-Outlier Card Puzzle Game | CardVault',
  description: 'Five daily card puzzles. Each puzzle shows four sports cards — three share a trait, one does not. Spot the outlier. Score 150 max, chain streaks, share emoji results. Deterministic daily seed means the community sees the same board.',
  openGraph: {
    title: 'Card Oddball — CardVault',
    description: 'Four cards. Three share a trait. One does not. Find the odd one out. Five daily puzzles.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Oddball — CardVault',
    description: 'Spot-the-outlier daily card puzzle. Five boards. 150 points.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Oddball' },
];

const faqItems = [
  {
    question: 'How does Card Oddball work?',
    answer: 'Each day you get five puzzles. Each puzzle shows four sports cards. Three of them share a trait — same sport, same decade, same rookie status, or same value tier. The fourth card breaks the pattern. Your job is to tap the outlier. Score 20 points per correct answer, plus up to 10 time-bonus points for answering within 5 seconds. Max single-puzzle score: 30. Max round score: 150. Grades: 135+ = S, 110+ = A, 85+ = B, 60+ = C, 30+ = D, below 30 = F. Daily seed means your puzzles match the community\'s — good for sharing.',
  },
  {
    question: 'What are the four trait categories?',
    answer: 'SPORT — three cards from one sport (e.g. three baseball, one football). DECADE — three cards from the same decade (e.g. three from the 1990s, one from the 1980s). ROOKIE — three rookies, one veteran card (or vice-versa). VALUE TIER — three cards in the same rough raw-value band ($0-100, $100-500, $500-2K, $2K-10K, $10K+), one from a different band. Each puzzle picks one category at random (via daily seed). The revealed answer names the category and shows why the outlier differs.',
  },
  {
    question: 'Why sometimes is the "correct" answer ambiguous?',
    answer: 'Cards have many attributes. In a SPORT puzzle, three baseball cards + one football card will differ on MANY axes — era, set, value, player — not just sport. The PRIMARY category is what was randomly chosen for that puzzle. The revealed answer explicitly names the category so you understand the intended pattern. If you tapped a different card that ALSO legitimately breaks a different pattern, you were not wrong in reasoning — but the puzzle\'s category is fixed, so only the designated outlier earns points. Treat it like Connections — multiple groupings exist, but one is canonical.',
  },
  {
    question: 'Can I replay the same day\'s puzzle?',
    answer: 'No — daily mode is one-shot. After you finish the 5 puzzles, your result is stored in localStorage (plays, wins, streak, best score, grade histogram). Free-play mode lets you run infinite practice rounds with fresh puzzles each time (no stats tracking). This matches the canonical Wordle pattern: daily is scored and comparable across the community; free-play is for warm-up.',
  },
  {
    question: 'How is the daily puzzle generated?',
    answer: 'The daily seed is today\'s date (ISO YYYY-MM-DD). FNV-1a hashing of the seed + puzzle index produces deterministic card picks from the 10,000+ sports card catalog, filtered to ensure the 3 similar + 1 outlier structure is clean. Two players on the same day see the same 5 puzzles in the same order. Different days produce different puzzles. This is why sharing a score is meaningful — everyone played the same board.',
  },
  {
    question: 'What\'s the time bonus?',
    answer: 'Each puzzle has a hidden 5-second clock. Answer within 5 seconds and you earn 10 bonus points on top of the 20 for correctness. Answer between 5-10 seconds: 5 bonus. Answer after 10 seconds: 0 bonus. No time penalty for being slow (other than losing the bonus). The clock resets for each puzzle. If you pass or answer wrong, you skip the bonus but can still try to answer correctly for the 20 base points.',
  },
  {
    question: 'How do I share my result?',
    answer: 'After the 5th puzzle, click "Share result." The share text is a compact 3-line summary: "Card Oddball [date] · [score] / 150 · [grade]" plus a 5-emoji result ribbon (🟢 for correct on time, 🟡 for correct slow, 🔴 for wrong). Works great on X, Discord, Bluesky. Friends can compare grids daily — the Wordle pattern. The emoji ribbon reveals your puzzle pattern without spoiling the actual cards, which means you can share results before others have played.',
  },
  {
    question: 'What strategy helps?',
    answer: 'First, quickly scan all four cards for the MOST DIFFERENT one. If three cards feel "the same" in vibe and one feels "off" — trust the gut. Second, after your first guess, if wrong, the reveal tells you the category — this is a learning signal for future rounds (you\'ll start to spot decade vs. sport patterns faster). Third, in VALUE TIER puzzles, don\'t trust gut price reads — a vintage $300 card can look more expensive than a modern $1500 card; use rookie status + era as value proxies. Fourth, in ROOKIE puzzles, check card fronts for RC/XRC logos carefully.',
  },
];

export default function CardOddballPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Oddball',
        description: 'Daily spot-the-outlier card puzzle. Four cards, three share a trait, one does not.',
        url: 'https://cardvault-two.vercel.app/card-oddball',
        genre: 'Puzzle / Pattern Recognition',
        gamePlatform: 'Web',
        numberOfPlayers: '1',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🎯</span>
          <span>Daily pattern puzzle · P5 Games · 74th game</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Card Oddball
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Three cards share a trait. One does not. Spot the outlier across five daily puzzles. Category
          changes every board — sport, decade, rookie status, or value tier. 150 points max, emoji-grid
          share, deterministic daily seed.
        </p>
      </div>

      <CardOddballClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-amber-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/card-connections" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Connections</div>
            <div className="text-sm text-slate-400">Link two players through shared card attributes</div>
          </Link>
          <Link href="/card-race" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Race</div>
            <div className="text-sm text-slate-400">Horse-race prediction, Win/Place/Show</div>
          </Link>
          <Link href="/rank-or-tank" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Rank or Tank</div>
            <div className="text-sm text-slate-400">Ordinal-ranking game, 5 cards by value</div>
          </Link>
          <Link href="/guess-the-card" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Guess the Card</div>
            <div className="text-sm text-slate-400">Wordle-style daily card puzzle, 6 tries</div>
          </Link>
          <Link href="/trivia" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Daily Trivia</div>
            <div className="text-sm text-slate-400">5 questions, 10-sec timer</div>
          </Link>
          <Link href="/games" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Games →</div>
            <div className="text-sm text-slate-400">Browse the full 75+ game catalog</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
