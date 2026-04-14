'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import CardFrame from '@/components/CardFrame';

// ─── Types ───────────────────────────────────────────────────────────

interface Decision {
  slug: string;
  choice: 'flip' | 'keep';
}

interface DayResult {
  date: string;
  decisions: Decision[];
  flippedValue: number;
  keptValue: number;
  bestKept: string | null;
  biggestMiss: string | null;
}

interface FlipOrKeepState {
  results: DayResult[];
  totalPlayed: number;
  streak: number;
  lastPlayDate: string;
  bestCollection: number;
  bestFlipped: number;
}

type Phase = 'playing' | 'reveal' | 'results';

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-flip-or-keep';
const CARDS_PER_ROUND = 10;

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

function dateHash(dateStr: string, salt: number = 0): number {
  let hash = salt;
  const str = dateStr + '-flip-or-keep-' + salt;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function parseValue(val: string): number {
  // Extract first dollar amount from strings like "$1,500–$3,000"
  const match = val.match(/\$[\d,]+/);
  if (!match) return 50;
  return parseInt(match[0].replace(/[$,]/g, ''), 10) || 50;
}

function formatMoney(val: number): string {
  return '$' + val.toLocaleString();
}

function getCardsForDate(dateStr: string): SportsCard[] {
  // Filter to only real sports cards (not pokemon)
  const eligible = sportsCards.filter(c =>
    c.sport === 'baseball' || c.sport === 'basketball' || c.sport === 'football' || c.sport === 'hockey'
  );
  const selected: SportsCard[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < CARDS_PER_ROUND && usedIndices.size < eligible.length; i++) {
    let idx = dateHash(dateStr, i) % eligible.length;
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < 100) {
      idx = (idx + 1) % eligible.length;
      attempts++;
    }
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selected.push(eligible[idx]);
    }
  }
  return selected;
}

function loadState(): FlipOrKeepState {
  if (typeof window === 'undefined') {
    return { results: [], totalPlayed: 0, streak: 0, lastPlayDate: '', bestCollection: 0, bestFlipped: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { results: [], totalPlayed: 0, streak: 0, lastPlayDate: '', bestCollection: 0, bestFlipped: 0 };
}

function saveState(state: FlipOrKeepState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── Component ───────────────────────────────────────────────────────

export default function FlipOrKeepClient() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<FlipOrKeepState>(loadState);
  const [phase, setPhase] = useState<Phase>('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showValue, setShowValue] = useState(false);
  const [animating, setAnimating] = useState(false);

  const today = useMemo(() => getTodayString(), []);
  const cards = useMemo(() => getCardsForDate(today), [today]);
  const alreadyPlayed = useMemo(() => state.results.some(r => r.date === today), [state.results, today]);

  useEffect(() => { setMounted(true); }, []);

  // Check if already played today
  useEffect(() => {
    if (mounted && alreadyPlayed) {
      setPhase('results');
    }
  }, [mounted, alreadyPlayed]);

  const currentCard = cards[currentIndex];

  const handleDecision = useCallback((choice: 'flip' | 'keep') => {
    if (animating || !currentCard) return;
    setAnimating(true);
    setShowValue(true);

    const newDecision: Decision = { slug: currentCard.slug, choice };
    const newDecisions = [...decisions, newDecision];
    setDecisions(newDecisions);

    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
        setShowValue(false);
        setAnimating(false);
      } else {
        // Game complete
        const flippedValue = newDecisions
          .filter(d => d.choice === 'flip')
          .reduce((sum, d) => {
            const card = cards.find(c => c.slug === d.slug);
            return sum + (card ? parseValue(card.estimatedValueRaw) : 0);
          }, 0);

        const keptValue = newDecisions
          .filter(d => d.choice === 'keep')
          .reduce((sum, d) => {
            const card = cards.find(c => c.slug === d.slug);
            return sum + (card ? parseValue(card.estimatedValueRaw) : 0);
          }, 0);

        const keptCards = newDecisions.filter(d => d.choice === 'keep');
        let bestKeptSlug: string | null = null;
        let bestKeptVal = 0;
        for (const d of keptCards) {
          const card = cards.find(c => c.slug === d.slug);
          if (card) {
            const v = parseValue(card.estimatedValueRaw);
            if (v > bestKeptVal) { bestKeptVal = v; bestKeptSlug = d.slug; }
          }
        }

        const flippedCards = newDecisions.filter(d => d.choice === 'flip');
        let biggestMissSlug: string | null = null;
        let biggestMissVal = 0;
        for (const d of flippedCards) {
          const card = cards.find(c => c.slug === d.slug);
          if (card) {
            const v = parseValue(card.estimatedValueRaw);
            if (v > biggestMissVal) { biggestMissVal = v; biggestMissSlug = d.slug; }
          }
        }

        const result: DayResult = {
          date: today,
          decisions: newDecisions,
          flippedValue,
          keptValue,
          bestKept: bestKeptSlug,
          biggestMiss: biggestMissSlug,
        };

        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        const streakContinues = state.lastPlayDate === yStr;

        const newState: FlipOrKeepState = {
          results: [...state.results.slice(-29), result],
          totalPlayed: state.totalPlayed + 1,
          streak: streakContinues ? state.streak + 1 : 1,
          lastPlayDate: today,
          bestCollection: Math.max(state.bestCollection, keptValue),
          bestFlipped: Math.max(state.bestFlipped, flippedValue),
        };
        setState(newState);
        saveState(newState);
        setPhase('results');
        setAnimating(false);
      }
    }, 1200);
  }, [animating, currentCard, currentIndex, cards, decisions, today, state]);

  const todayResult = useMemo(() => state.results.find(r => r.date === today), [state.results, today]);

  const shareText = useMemo(() => {
    if (!todayResult) return '';
    const kc = todayResult.decisions.filter(d => d.choice === 'keep').length;
    const fc = todayResult.decisions.filter(d => d.choice === 'flip').length;
    return `Flip or Keep ${today}\nKept ${kc} cards worth ${formatMoney(todayResult.keptValue)}\nFlipped ${fc} cards for ${formatMoney(todayResult.flippedValue)}\n\nhttps://cardvault-two.vercel.app/flip-or-keep`;
  }, [todayResult, today]);

  if (!mounted) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // ─── Results Screen ─────────────────────────────────────────────────

  if (phase === 'results' && todayResult) {
    const keptCards = todayResult.decisions.filter(d => d.choice === 'keep');
    const flippedCardsList = todayResult.decisions.filter(d => d.choice === 'flip');
    const totalValue = todayResult.flippedValue + todayResult.keptValue;
    const keptPct = totalValue > 0 ? Math.round((todayResult.keptValue / totalValue) * 100) : 0;

    return (
      <div className="space-y-8">
        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-1">Today&apos;s Results</h2>
          <p className="text-gray-500 text-sm mb-6">{new Date(today + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Collection Value</p>
              <p className="text-xl font-bold text-emerald-400">{formatMoney(todayResult.keptValue)}</p>
              <p className="text-xs text-gray-500 mt-1">{keptCards.length} cards kept</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Flip Earnings</p>
              <p className="text-xl font-bold text-blue-400">{formatMoney(todayResult.flippedValue)}</p>
              <p className="text-xs text-gray-500 mt-1">{flippedCardsList.length} cards flipped</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Streak</p>
              <p className="text-xl font-bold text-amber-400">{state.streak} day{state.streak !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500 mt-1">{state.totalPlayed} total games</p>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Collector Score</p>
              <p className="text-xl font-bold text-purple-400">{keptPct}%</p>
              <p className="text-xs text-gray-500 mt-1">kept vs total</p>
            </div>
          </div>

          {/* Kept vs Flipped bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Collection</span>
              <span>Flipped</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
              {todayResult.keptValue > 0 && (
                <div
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${keptPct}%` }}
                />
              )}
              {todayResult.flippedValue > 0 && (
                <div
                  className="bg-blue-500 h-full transition-all duration-700"
                  style={{ width: `${100 - keptPct}%` }}
                />
              )}
            </div>
          </div>

          {/* Best kept / biggest miss */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayResult.bestKept && (() => {
              const card = cards.find(c => c.slug === todayResult.bestKept);
              return card ? (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3">
                  <p className="text-xs text-emerald-400 font-medium mb-1">Best Kept Card</p>
                  <Link href={`/sports/${card.slug}`} className="text-white text-sm font-semibold hover:text-emerald-400 transition-colors">
                    {card.name}
                  </Link>
                  <p className="text-emerald-400 text-xs mt-0.5">{card.estimatedValueRaw}</p>
                </div>
              ) : null;
            })()}
            {todayResult.biggestMiss && (() => {
              const card = cards.find(c => c.slug === todayResult.biggestMiss);
              return card ? (
                <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3">
                  <p className="text-xs text-red-400 font-medium mb-1">Biggest Flip</p>
                  <Link href={`/sports/${card.slug}`} className="text-white text-sm font-semibold hover:text-red-400 transition-colors">
                    {card.name}
                  </Link>
                  <p className="text-red-400 text-xs mt-0.5">{card.estimatedValueRaw}</p>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* All cards breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Card-by-Card Breakdown</h3>
          <div className="space-y-2">
            {todayResult.decisions.map((d, i) => {
              const card = cards.find(c => c.slug === d.slug);
              if (!card) return null;
              return (
                <div key={d.slug} className="flex items-center gap-3 bg-gray-800/40 rounded-xl px-4 py-3">
                  <span className="text-gray-600 text-xs font-mono w-5">{i + 1}</span>
                  <span className="text-lg">{sportEmoji[card.sport] || ''}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/sports/${card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate block">
                      {card.name}
                    </Link>
                    <p className="text-gray-500 text-xs">{card.player} &middot; {card.year}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    d.choice === 'keep'
                      ? 'bg-emerald-900/60 text-emerald-400'
                      : 'bg-blue-900/60 text-blue-400'
                  }`}>
                    {d.choice === 'keep' ? 'KEPT' : 'FLIPPED'}
                  </span>
                  <span className="text-gray-400 text-sm font-medium w-28 text-right">{card.estimatedValueRaw.split('(')[0].trim()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share + Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Your Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Games Played</span><span className="text-white font-medium">{state.totalPlayed}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Current Streak</span><span className="text-amber-400 font-medium">{state.streak} day{state.streak !== 1 ? 's' : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Best Collection</span><span className="text-emerald-400 font-medium">{formatMoney(state.bestCollection)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Best Flip Day</span><span className="text-blue-400 font-medium">{formatMoney(state.bestFlipped)}</span></div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Share Results</h3>
            <p className="text-gray-400 text-sm mb-4">Show off your collecting decisions.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(shareText)}
                className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Copy Results
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 text-sm font-medium rounded-xl transition-colors text-center"
              >
                Share on X
              </a>
            </div>
          </div>
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/daily-pack" className="text-emerald-400 hover:text-emerald-300 transition-colors">Open Daily Pack &rarr;</Link>
          <Link href="/trivia" className="text-emerald-400 hover:text-emerald-300 transition-colors">Daily Trivia &rarr;</Link>
          <Link href="/rip-or-skip" className="text-emerald-400 hover:text-emerald-300 transition-colors">Rip or Skip &rarr;</Link>
          <Link href="/my-hub" className="text-emerald-400 hover:text-emerald-300 transition-colors">My Hub &rarr;</Link>
          <Link href="/leaderboard" className="text-emerald-400 hover:text-emerald-300 transition-colors">Leaderboards &rarr;</Link>
        </div>
      </div>
    );
  }

  // ─── Playing Screen ─────────────────────────────────────────────────

  if (!currentCard) return null;

  const cardValue = parseValue(currentCard.estimatedValueRaw);
  const progress = ((currentIndex + (showValue ? 1 : 0)) / cards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-gray-400 text-sm font-medium">{currentIndex + 1}/{cards.length}</span>
      </div>

      {/* Current card */}
      <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 ${
        showValue ? 'border-emerald-800/50' : ''
      }`}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Card visual */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <CardFrame card={currentCard} size="large" />
          </div>

          {/* Card details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{sportEmoji[currentCard.sport] || ''}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{currentCard.sport}</span>
              {currentCard.rookie && (
                <span className="text-xs bg-amber-900/60 text-amber-400 px-2 py-0.5 rounded-full font-medium">RC</span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{currentCard.name}</h2>
            <p className="text-gray-400 text-sm mb-3">{currentCard.player} &middot; {currentCard.set}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{currentCard.description}</p>

            {/* Value reveal */}
            {showValue ? (
              <div className="bg-gray-800/60 rounded-xl p-4 animate-fade-in">
                <p className="text-xs text-gray-500 mb-1">Estimated Raw Value</p>
                <p className="text-2xl font-bold text-emerald-400">{currentCard.estimatedValueRaw.split('(')[0].trim()}</p>
                {currentCard.estimatedValueGem && (
                  <p className="text-xs text-gray-500 mt-1">PSA 10: {currentCard.estimatedValueGem.split('(')[0].trim()}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/60 rounded-xl p-4 border-2 border-dashed border-gray-700">
                <p className="text-gray-500 text-sm text-center">Choose FLIP or KEEP to reveal the value</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision buttons */}
      {!showValue && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDecision('flip')}
            disabled={animating}
            className="group relative bg-blue-900/30 hover:bg-blue-900/50 border-2 border-blue-800/50 hover:border-blue-600 rounded-2xl p-6 transition-all disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">&#128176;</div>
              <h3 className="text-lg font-bold text-blue-400 mb-1">FLIP</h3>
              <p className="text-gray-400 text-xs">Sell at market price</p>
            </div>
          </button>

          <button
            onClick={() => handleDecision('keep')}
            disabled={animating}
            className="group relative bg-emerald-900/30 hover:bg-emerald-900/50 border-2 border-emerald-800/50 hover:border-emerald-600 rounded-2xl p-6 transition-all disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">&#127183;</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-1">KEEP</h3>
              <p className="text-gray-400 text-xs">Add to collection</p>
            </div>
          </button>
        </div>
      )}

      {/* Decision tally */}
      {decisions.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          {decisions.map((d, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                d.choice === 'keep'
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : 'bg-blue-900/60 text-blue-400'
              }`}
              title={`Card ${i + 1}: ${d.choice}`}
            >
              {d.choice === 'keep' ? 'K' : 'F'}
            </div>
          ))}
          {Array.from({ length: cards.length - decisions.length - (showValue ? 0 : 1) }, (_, i) => (
            <div key={`pending-${i}`} className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700" />
          ))}
        </div>
      )}

      {/* Running totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Collection</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatMoney(decisions.filter(d => d.choice === 'keep').reduce((sum, d) => {
              const card = cards.find(c => c.slug === d.slug);
              return sum + (card ? parseValue(card.estimatedValueRaw) : 0);
            }, 0))}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Flipped</p>
          <p className="text-lg font-bold text-blue-400">
            {formatMoney(decisions.filter(d => d.choice === 'flip').reduce((sum, d) => {
              const card = cards.find(c => c.slug === d.slug);
              return sum + (card ? parseValue(card.estimatedValueRaw) : 0);
            }, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
