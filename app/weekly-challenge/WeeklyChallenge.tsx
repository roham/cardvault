'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ─── Types ───────────────────────────────────────────────────────────

interface ChallengeCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  simulatedChange: number;
}

interface WeeklyEntry {
  weekId: string;
  theme: string;
  picks: string[]; // slugs
  score: number;
  submittedAt: number;
}

interface ChallengeState {
  entries: WeeklyEntry[];
  currentWeekPicks: string[];
  totalChallenges: number;
  bestScore: number;
  avgScore: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-weekly-challenge';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getWeekId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

function getWeekSeed(weekId: string): number {
  let hash = 0;
  for (let i = 0; i < weekId.length; i++) {
    hash = ((hash << 5) - hash) + weekId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const themes = [
  'Best Performing Cards This Week',
  'Rookie Card Showdown',
  'Hall of Fame Card Draft',
  'Multi-Sport Power Portfolio',
  'Vintage vs Modern Challenge',
  'Best Value Under $100',
  'Championship Card Challenge',
  'Cross-Sport All-Stars',
];

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

function getWeeklyChallenge(weekId: string) {
  const seed = getWeekSeed(weekId);
  const rand = seededRandom(seed);

  const theme = themes[Math.floor(rand() * themes.length)];

  // Get eligible cards (real sports only)
  const eligible = sportsCards.filter(c =>
    ['baseball', 'basketball', 'football', 'hockey'].includes(c.sport)
  );

  // Shuffle and pick 20 candidates
  const shuffled = [...eligible].sort(() => rand() - 0.5);
  const candidates: ChallengeCard[] = shuffled.slice(0, 20).map(card => ({
    slug: card.slug,
    name: card.name,
    player: card.player,
    sport: card.sport,
    simulatedChange: Math.round((rand() * 50 - 15) * 10) / 10, // -15% to +35%
  }));

  // Calculate time remaining in week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return { weekId, theme, candidates, endOfWeek };
}

function calculateScore(picks: string[], candidates: ChallengeCard[]): number {
  let total = 0;
  for (const slug of picks) {
    const card = candidates.find(c => c.slug === slug);
    if (card) total += card.simulatedChange;
  }
  return Math.round(total * 10) / 10;
}

function loadState(): ChallengeState {
  if (typeof window === 'undefined') return { entries: [], currentWeekPicks: [], totalChallenges: 0, bestScore: 0, avgScore: 0 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* empty */ }
  return { entries: [], currentWeekPicks: [], totalChallenges: 0, bestScore: 0, avgScore: 0 };
}

function saveState(state: ChallengeState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* empty */ }
}

// ─── Components ──────────────────────────────────────────────────────

function CandidateCard({
  card,
  selected,
  onToggle,
  disabled,
  revealed,
}: {
  card: ChallengeCard;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
  revealed: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-yellow-500 bg-yellow-950/20 ring-1 ring-yellow-500/50'
          : disabled
            ? 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
            : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span>{sportEmoji[card.sport]}</span>
        <span className="text-sm text-white font-medium truncate">{card.player}</span>
      </div>
      <p className="text-[11px] text-gray-500 truncate">{card.name}</p>
      {revealed && (
        <p className={`text-sm font-bold mt-1 ${
          card.simulatedChange >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {card.simulatedChange >= 0 ? '+' : ''}{card.simulatedChange}%
        </p>
      )}
    </button>
  );
}

function Countdown({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Challenge ended'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <span className="text-orange-400 font-mono">{timeLeft}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────

export default function WeeklyChallenge() {
  const [state, setState] = useState<ChallengeState | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const challenge = useMemo(() => getWeeklyChallenge(getWeekId()), []);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const existing = loaded.entries.find(e => e.weekId === challenge.weekId);
    if (existing) {
      setSelectedSlugs(existing.picks);
      setScore(existing.score);
      setSubmitted(true);
    }
  }, [challenge.weekId]);

  const handleToggle = useCallback((slug: string) => {
    setSelectedSlugs(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= 5) return prev;
      return [...prev, slug];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!state || selectedSlugs.length !== 5) return;

    const entryScore = calculateScore(selectedSlugs, challenge.candidates);
    const entry: WeeklyEntry = {
      weekId: challenge.weekId,
      theme: challenge.theme,
      picks: selectedSlugs,
      score: entryScore,
      submittedAt: Date.now(),
    };

    const newEntries = [entry, ...state.entries.filter(e => e.weekId !== challenge.weekId)].slice(0, 20);
    const scores = newEntries.map(e => e.score);
    const newState: ChallengeState = {
      entries: newEntries,
      currentWeekPicks: selectedSlugs,
      totalChallenges: newEntries.length,
      bestScore: Math.max(...scores),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
    };

    setState(newState);
    saveState(newState);
    setScore(entryScore);
    setSubmitted(true);
  }, [state, selectedSlugs, challenge]);

  if (!state) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{state.totalChallenges}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Challenges</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold ${state.bestScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {state.bestScore > 0 ? '+' : ''}{state.bestScore}%
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Best Score</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold ${state.avgScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {state.avgScore > 0 ? '+' : ''}{state.avgScore}%
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Score</p>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Week {challenge.weekId}</p>
        <h3 className="text-xl font-bold text-white mb-2">{challenge.theme}</h3>
        <p className="text-sm text-gray-400 mb-3">
          Pick 5 cards from the selection below. Score is based on simulated weekly price movement.
        </p>
        <p className="text-sm text-gray-500">
          Time remaining: <Countdown endDate={challenge.endOfWeek} />
        </p>
      </div>

      {/* Selection or Results */}
      {submitted ? (
        <div className="mb-8">
          <div className={`text-center p-6 rounded-xl border-2 mb-6 ${
            score >= 0
              ? 'bg-green-950/20 border-green-700/30'
              : 'bg-red-950/20 border-red-700/30'
          }`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Score</p>
            <p className={`text-4xl font-bold ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {score >= 0 ? '+' : ''}{score}%
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {score >= 50 ? 'Incredible portfolio!' :
               score >= 25 ? 'Strong picks!' :
               score >= 0 ? 'Not bad!' :
               'Tough week. Try again next week!'}
            </p>
          </div>

          <h3 className="text-lg font-bold text-white mb-3">Your Picks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {selectedSlugs.map(slug => {
              const card = challenge.candidates.find(c => c.slug === slug);
              if (!card) return null;
              return <CandidateCard key={slug} card={card} selected={true} onToggle={() => {}} disabled={true} revealed={true} />;
            })}
          </div>

          <h3 className="text-lg font-bold text-white mb-3">Full Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...challenge.candidates].sort((a, b) => b.simulatedChange - a.simulatedChange).map(card => (
              <CandidateCard
                key={card.slug}
                card={card}
                selected={selectedSlugs.includes(card.slug)}
                onToggle={() => {}}
                disabled={true}
                revealed={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Select 5 Cards ({selectedSlugs.length}/5)
            </h3>
            {selectedSlugs.length === 5 && (
              <button
                onClick={handleSubmit}
                className="py-2 px-6 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400 transition-all"
              >
                Lock In Picks!
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {challenge.candidates.map(card => (
              <CandidateCard
                key={card.slug}
                card={card}
                selected={selectedSlugs.includes(card.slug)}
                onToggle={() => handleToggle(card.slug)}
                disabled={selectedSlugs.length >= 5}
                revealed={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Entries */}
      {state.entries.length > 1 && (
        <section className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Past Challenges</h3>
          <div className="space-y-2">
            {state.entries.slice(1, 8).map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">{entry.weekId}</span>
                  <span className="text-sm text-white ml-2">{entry.theme}</span>
                </div>
                <span className={`text-sm font-bold ${entry.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.score >= 0 ? '+' : ''}{entry.score}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-12 text-center">
        <p className="text-gray-400 mb-3">Want more card games?</p>
        <div className="flex justify-center gap-3">
          <Link href="/tools/portfolio" className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">
            Fantasy Portfolio
          </Link>
          <Link href="/tools/daily-pack" className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">
            Daily Free Pack
          </Link>
        </div>
      </section>
    </div>
  );
}
