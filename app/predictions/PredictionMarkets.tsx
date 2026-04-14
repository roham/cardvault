'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ─── Deterministic Random ──────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Types ─────────────────────────────────────────────────────────
interface Prediction {
  id: string;
  question: string;
  player: string;
  slug: string;
  sport: string;
  metric: string;
  threshold: number;
  thresholdLabel: string;
  expiresIn: string;
  overOdds: number; // 0-100, implied probability
  underOdds: number;
  status: 'active' | 'resolved';
  result?: 'over' | 'under';
  category: 'price' | 'trend' | 'milestone';
}

// ─── Parse price helper ────────────────────────────────────────────
function parsePrice(str: string): number {
  const match = str.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// ─── Sport emoji ───────────────────────────────────────────────────
const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

// ─── Generate predictions ──────────────────────────────────────────
function generatePredictions(dateStr: string): { active: Prediction[]; resolved: Prediction[] } {
  const rand = seededRandom(hashStr(dateStr + '-predictions'));
  const eligible = sportsCards.filter(c =>
    ['baseball', 'basketball', 'football', 'hockey'].includes(c.sport) && c.player.length > 3
  );
  const shuffled = [...eligible].sort(() => rand() - 0.5);
  const usedPlayers = new Set<string>();

  const active: Prediction[] = [];
  const resolved: Prediction[] = [];

  const priceQuestions = [
    { q: 'Will {player} PSA 10 exceed ${threshold} by end of month?', metric: 'PSA 10 price', cat: 'price' as const },
    { q: 'Will {player} raw card value drop below ${threshold}?', metric: 'Raw value', cat: 'price' as const },
    { q: 'Will {player} cards see 10%+ price increase this week?', metric: 'Weekly change', cat: 'trend' as const },
    { q: 'Will {player} surpass {threshold} total card sales this month?', metric: 'Monthly volume', cat: 'milestone' as const },
    { q: 'Will {player} rookie card break ${threshold} in PSA 9?', metric: 'PSA 9 price', cat: 'price' as const },
  ];

  const expiryOptions = ['24 hours', '3 days', '1 week', '2 weeks', 'End of month'];

  for (const card of shuffled) {
    if (usedPlayers.has(card.player)) continue;
    usedPlayers.add(card.player);

    const price = parsePrice(card.estimatedValueRaw);
    if (price < 5) continue;

    const template = priceQuestions[Math.floor(rand() * priceQuestions.length)];
    const threshold = template.cat === 'milestone'
      ? Math.round((rand() * 200 + 50))
      : Math.round(price * (0.8 + rand() * 0.8));

    const overOdds = Math.round(30 + rand() * 40);
    const underOdds = 100 - overOdds;
    const isResolved = rand() > 0.6;
    const result = rand() > 0.5 ? 'over' as const : 'under' as const;

    const prediction: Prediction = {
      id: `pred-${card.slug}-${dateStr}`,
      question: template.q
        .replace('{player}', card.player)
        .replace('{threshold}', threshold.toLocaleString()),
      player: card.player,
      slug: card.slug,
      sport: card.sport,
      metric: template.metric,
      threshold,
      thresholdLabel: template.cat === 'milestone' ? `${threshold} sales` : `$${threshold}`,
      expiresIn: expiryOptions[Math.floor(rand() * expiryOptions.length)],
      overOdds,
      underOdds,
      status: isResolved ? 'resolved' : 'active',
      result: isResolved ? result : undefined,
      category: template.cat,
    };

    if (isResolved && resolved.length < 5) {
      resolved.push(prediction);
    } else if (!isResolved && active.length < 12) {
      active.push(prediction);
    }

    if (active.length >= 12 && resolved.length >= 5) break;
  }

  return { active, resolved };
}

// ─── localStorage helpers ──────────────────────────────────────────
const STORAGE_KEY = 'cardvault-predictions';

interface UserPrediction {
  predId: string;
  pick: 'over' | 'under';
  date: string;
}

function loadUserPredictions(): UserPrediction[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveUserPrediction(pred: UserPrediction) {
  const existing = loadUserPredictions();
  if (existing.some(p => p.predId === pred.predId)) return;
  existing.push(pred);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

// ─── Prediction Card ───────────────────────────────────────────────
function PredictionCard({
  pred,
  userPick,
  onPick,
}: {
  pred: Prediction;
  userPick?: 'over' | 'under';
  onPick: (id: string, pick: 'over' | 'under') => void;
}) {
  const hasPicked = !!userPick;
  const isResolved = pred.status === 'resolved';
  const isCorrect = isResolved && userPick === pred.result;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isResolved
        ? isCorrect ? 'border-green-700/50 bg-green-950/20' : userPick ? 'border-red-700/50 bg-red-950/20' : 'border-gray-800 bg-gray-950/40'
        : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2 mb-3">
          <span className="text-lg shrink-0">{sportEmoji[pred.sport]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-snug">{pred.question}</p>
            <div className="flex items-center gap-2 mt-1">
              <Link href={`/sports/${pred.slug}`} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">
                {pred.player} &rarr;
              </Link>
              {!isResolved && (
                <span className="text-[10px] text-gray-500">Expires: {pred.expiresIn}</span>
              )}
            </div>
          </div>
          {isResolved && (
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              pred.result === 'over' ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'
            }`}>
              {pred.result === 'over' ? 'OVER' : 'UNDER'}
            </span>
          )}
        </div>

        {/* Odds Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>OVER ({pred.overOdds}%)</span>
            <span>UNDER ({pred.underOdds}%)</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all ${
                isResolved && pred.result === 'over' ? 'bg-green-500' : 'bg-green-700/60'
              }`}
              style={{ width: `${pred.overOdds}%` }}
            />
            <div
              className={`h-full transition-all ${
                isResolved && pred.result === 'under' ? 'bg-red-500' : 'bg-red-700/60'
              }`}
              style={{ width: `${pred.underOdds}%` }}
            />
          </div>
        </div>

        {/* Pick Buttons or Result */}
        {!isResolved && !hasPicked && (
          <div className="flex gap-2">
            <button
              onClick={() => onPick(pred.id, 'over')}
              className="flex-1 py-2 px-3 bg-green-900/30 border border-green-800/40 rounded-lg text-sm font-medium text-green-400 hover:bg-green-800/40 transition-colors"
            >
              OVER
            </button>
            <button
              onClick={() => onPick(pred.id, 'under')}
              className="flex-1 py-2 px-3 bg-red-900/30 border border-red-800/40 rounded-lg text-sm font-medium text-red-400 hover:bg-red-800/40 transition-colors"
            >
              UNDER
            </button>
          </div>
        )}
        {!isResolved && hasPicked && (
          <div className={`py-2 px-3 rounded-lg text-sm font-medium text-center ${
            userPick === 'over' ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 'bg-red-900/20 text-red-400 border border-red-800/30'
          }`}>
            You picked: {userPick === 'over' ? 'OVER' : 'UNDER'}
          </div>
        )}
        {isResolved && userPick && (
          <div className={`py-2 px-3 rounded-lg text-sm font-bold text-center ${
            isCorrect ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {isCorrect ? 'You were RIGHT!' : 'Wrong this time'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function PredictionMarkets() {
  const [mounted, setMounted] = useState(false);
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'active' | 'resolved'>('active');

  useEffect(() => {
    setMounted(true);
    setUserPredictions(loadUserPredictions());
  }, []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { active, resolved } = useMemo(() => generatePredictions(today), [today]);

  const handlePick = (predId: string, pick: 'over' | 'under') => {
    const newPred: UserPrediction = { predId, pick, date: today };
    saveUserPrediction(newPred);
    setUserPredictions(prev => [...prev, newPred]);
  };

  const getUserPick = (predId: string) => {
    return userPredictions.find(p => p.predId === predId)?.pick;
  };

  const filteredActive = filter === 'all' ? active : active.filter(p => p.sport === filter);
  const filteredResolved = filter === 'all' ? resolved : resolved.filter(p => p.sport === filter);

  // Stats
  const totalPicks = userPredictions.length;
  const correctPicks = resolved.filter(r => getUserPick(r.id) === r.result).length;

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}
        </div>
        <div className="h-40 bg-gray-800 rounded-xl" />
        <div className="h-40 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{active.length}</p>
          <p className="text-[10px] text-gray-500">Active Markets</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{totalPicks}</p>
          <p className="text-[10px] text-gray-500">Your Picks</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">
            {totalPicks > 0 ? `${correctPicks}/${resolved.filter(r => getUserPick(r.id)).length}` : '--'}
          </p>
          <p className="text-[10px] text-gray-500">Correct</p>
        </div>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2 mr-4">
          {(['active', 'resolved'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                view === v ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {v === 'active' ? 'Active' : 'Resolved'}
            </button>
          ))}
        </div>
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All' : sportEmoji[s]}
          </button>
        ))}
      </div>

      {/* Predictions */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(view === 'active' ? filteredActive : filteredResolved).map(pred => (
          <PredictionCard
            key={pred.id}
            pred={pred}
            userPick={getUserPick(pred.id)}
            onPick={handlePick}
          />
        ))}
      </div>
      {(view === 'active' ? filteredActive : filteredResolved).length === 0 && (
        <p className="text-center text-gray-500 py-8">No {view} predictions for this filter.</p>
      )}

      {/* How it works */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">How Prediction Markets Work</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-medium text-gray-300 mb-1">Pick Over or Under</p>
            <p>Each market asks a yes/no question about card prices, trends, or milestones. Pick OVER or UNDER before the deadline.</p>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Track Your Record</p>
            <p>Your picks are saved and scored when markets resolve. Build your prediction record and track your accuracy over time.</p>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Free to Play</p>
            <p>No real money involved. This is a fun way to test your card market knowledge and compete with other collectors.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
        <p className="text-xs text-gray-500">
          Prediction markets use simulated price data and are for entertainment purposes only.
          No real money is involved. Market odds represent community sentiment estimates, not actual probabilities.
          Results are determined by simulated market movements.
        </p>
      </div>
    </div>
  );
}
