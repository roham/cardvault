import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardExileClient from './CardExileClient';

export const metadata: Metadata = {
  title: 'Card Exile — Daily Rule-Violator Card Puzzle Game | CardVault',
  description: 'Each puzzle shows a rule ("Exile pre-1990 cards") and 4 candidate cards. One card violates the rule. Find it before the timer. 5 daily rounds, 125 point max, grade tiers, emoji share. Deterministic daily seed means the community sees the same boards.',
  openGraph: {
    title: 'Card Exile — CardVault',
    description: 'Rule shown. 4 cards. One violates. Five daily puzzles. Spot the exile.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Exile — CardVault',
    description: 'Rule-violator spotting game. 5 daily puzzles. 125 points.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Exile' },
];

const faqItems = [
  {
    question: 'How does Card Exile work?',
    answer: 'Each puzzle displays a RULE ("Exile all football cards," "Exile cards worth over $5K," "Exile non-rookies," etc.) and four candidate cards. Exactly ONE card violates the rule — that\'s the Exile. Click the violator. Correct picks score 15 base + up to 10 time-bonus (≤5 seconds = +10, ≤10 seconds = +5, above = 0 bonus). Five daily puzzles. 125 points maximum. Grades: S (115+), A (95+), B (75+), C (50+), D (25+), F below. Deterministic daily seed = community-comparable board.',
  },
  {
    question: 'How is this different from Card Oddball?',
    answer: 'Card Oddball: rule is HIDDEN — 3 cards share a trait and 1 does not, you figure out which is the outlier. Card Exile: rule is SHOWN — the category is explicit ("Exile post-2000 cards") and you pick the one that violates it. Oddball tests pattern recognition; Exile tests rule application and fast card scanning. Complementary mechanics. Card Exile is easier (the rule is given) but time-pressured (bonus scales aggressively with speed).',
  },
  {
    question: 'What are the rule categories?',
    answer: 'AGE rules (Exile pre-1990, Exile post-2010, Exile anything older than 2000, Exile vintage). SPORT rules (Exile all football cards, Exile all baseball cards, etc.). ROOKIE rules (Exile all rookie cards, Exile all veterans). VALUE TIER rules (Exile cards worth under $100, Exile anything over $5K). Combined rules also appear (Exile rookie football cards, Exile vintage baseball). Each puzzle randomly selects a rule category — educational signal for learning the card taxonomy.',
  },
  {
    question: 'What if multiple cards could violate the rule?',
    answer: 'The procedural generator specifically seeks configurations where EXACTLY ONE of four cards violates the rule and the other three are all clean. If the pool can\'t produce a valid puzzle, the generator swaps categories until it finds one. So the answer is always unique per the given rule — no ambiguity. However, OTHER incidental traits might differ across cards (e.g. four baseball cards of varying years, but only one exiled for age) — focus on the STATED rule, not incidental differences.',
  },
  {
    question: 'Why is the time bonus so aggressive?',
    answer: 'Card Exile is a speed-recognition game, not a deep-thought puzzle. The rule is given, so the only variable is how fast you scan the cards and identify the violator. At ≤5 seconds you get the full +10 bonus (rewarding instant pattern recognition). At ≤10 seconds, +5 (rewarding considered scanning). Above 10 seconds, no bonus (rewarding accuracy without punishing failure). Pattern: fast recognition is a trainable skill; this game lets you train it with an explicit incentive gradient.',
  },
  {
    question: 'Can I practice without affecting my daily streak?',
    answer: 'Yes. Daily mode is one-shot per day and saves to your streak + gradeCounts stats. Free-play mode generates fresh puzzles with no stats tracking — pure practice. Use free-play to drill specific rule categories (keep pressing "New round" until you get an AGE puzzle, for example) or to warm up before your daily attempt. Wordle convention: daily is serious, free-play is for fun.',
  },
  {
    question: 'How do I share my result?',
    answer: 'After the 5th puzzle, click "Share result." The format is compact 3-line: "Card Exile [date] · [score] / 125 · Grade [letter]" plus a 5-emoji ribbon (🟢 correct fast, 🟡 correct slow, 🔴 wrong). Matches Wordle daily-share convention — recognizable at a glance on X, Discord, Bluesky. Share text does not reveal the actual cards or rules, so friends who have not played yet can still compare grids without spoilers.',
  },
  {
    question: 'What strategy helps me get a higher score?',
    answer: 'First, READ THE RULE FIRST — scan the rule text for ≤1 second before looking at the cards. Second, know the rule taxonomy by heart (age / sport / rookie / value) — you\'ll start recognizing "Exile non-rookies" and instantly know to scan for the veteran. Third, trust the card metadata tags (RC badge, sport-color strip, year, value) — the tool surfaces these explicitly, which is your visual scan grammar. Fourth, don\'t second-guess — the rule is explicit and the generator ensures exactly one violator. If you\'re pretty sure, click. Speed matters more than 100% certainty; the 10-point time-bonus is worth more than a coin-flip re-read.',
  },
];

export default function CardExilePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Exile',
        description: 'Daily rule-violator card puzzle. Rule shown, 4 cards, pick the one that violates.',
        url: 'https://cardvault-two.vercel.app/card-exile',
        genre: 'Puzzle / Rule Application',
        gamePlatform: 'Web',
        numberOfPlayers: '1',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>⚖️</span>
          <span>Daily rule-violator puzzle · P5 Games · 76th game</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Card Exile
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          The rule is given. Four cards are candidates. One violates. Scan, identify, click. Speed matters.
          Five daily puzzles, 125 points max, community-comparable daily board via deterministic seed.
        </p>
      </div>

      <CardExileClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-rose-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/card-oddball" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Oddball</div>
            <div className="text-sm text-slate-400">Hidden-rule outlier spotting — 5 daily puzzles</div>
          </Link>
          <Link href="/card-connections" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Connections</div>
            <div className="text-sm text-slate-400">Six-degrees player-linking puzzle</div>
          </Link>
          <Link href="/rank-or-tank" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Rank or Tank</div>
            <div className="text-sm text-slate-400">Ordinal-ranking game, 5 cards by value</div>
          </Link>
          <Link href="/guess-the-card" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Guess the Card</div>
            <div className="text-sm text-slate-400">Wordle-style daily card puzzle</div>
          </Link>
          <Link href="/trivia" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Daily Trivia</div>
            <div className="text-sm text-slate-400">5 questions, 10-sec timer</div>
          </Link>
          <Link href="/games" className="bg-slate-900/60 border border-slate-800 hover:border-rose-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Games →</div>
            <div className="text-sm text-slate-400">Browse the 75+ game catalog</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
