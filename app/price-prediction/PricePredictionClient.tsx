'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface CardInput {
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  estimatedValueRaw: string;
  slug: string;
  rookie: boolean;
}

interface Scenario {
  card: CardInput;
  value: number;
  factor: string;
  factorType: 'positive' | 'negative';
  explanation: string;
  changePercent: number; // positive = up, negative = down
}

interface PredictionResult {
  scenario: Scenario;
  predicted: 'up' | 'down';
  correct: boolean;
  points: number;
}

/* ───── Helpers ───── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toLocaleString()}`;
}

/* ───── Scenario Templates ───── */
const positiveFactors = [
  { factor: '{player} just won the MVP award', explanation: 'MVP winners see 20-40% price increases as demand surges. Collectors and investors race to buy before prices peak.', minChange: 20, maxChange: 40 },
  { factor: '{player} was traded to a major market team', explanation: 'Big market trades increase visibility and demand. More fans = more collectors wanting the card.', minChange: 10, maxChange: 25 },
  { factor: '{player} is having a career-best season', explanation: 'Career years generate buzz and media attention. Prices climb as the narrative builds throughout the season.', minChange: 15, maxChange: 30 },
  { factor: '{player}\'s team just won the championship', explanation: 'Championship winners see sustained demand. Ring-chasing collectors push prices up 15-35%.', minChange: 15, maxChange: 35 },
  { factor: 'A new documentary featuring {player} just dropped', explanation: 'Media attention drives casual collectors into the market. The "Last Dance effect" can move prices significantly.', minChange: 10, maxChange: 20 },
  { factor: '{player} just signed a record contract extension', explanation: 'Long-term commitments signal franchise-player status. Card values rise as collectors lock in future value.', minChange: 8, maxChange: 18 },
  { factor: '{player} announced their Hall of Fame eligibility', explanation: 'HOF buzz creates buying pressure. Collectors want to own HOF cards before induction drives prices higher.', minChange: 12, maxChange: 25 },
  { factor: 'PSA announced a pop count drop for {player}\'s key card', explanation: 'Fewer high-grade copies = more scarcity = higher prices. Low population cards command premiums.', minChange: 15, maxChange: 30 },
];

const negativeFactors = [
  { factor: '{player} suffered a season-ending injury', explanation: 'Injuries create panic selling. Collectors dump cards fearing long-term career impact, even when the player will likely recover.', minChange: -30, maxChange: -15 },
  { factor: '{player} was suspended for performance violations', explanation: 'PED suspensions are devastating for card values. The stigma suppresses demand for years.', minChange: -35, maxChange: -20 },
  { factor: '{player} is in a deep slump this season', explanation: 'Poor performance reduces demand. Collectors wait for a lower entry point, pushing prices down further.', minChange: -15, maxChange: -8 },
  { factor: '{player}\'s team missed the playoffs again', explanation: 'Missing the postseason reduces visibility. Cards of players on losing teams see less demand.', minChange: -12, maxChange: -5 },
  { factor: 'A massive reprint of {player}\'s set was announced', explanation: 'Reprints flood the market with supply. More copies available means lower prices for existing holders.', minChange: -20, maxChange: -10 },
  { factor: '{player} announced retirement at end of season', explanation: 'Retirement creates selling pressure as the career narrative ends. Most retired player cards decline unless HOF-bound.', minChange: -15, maxChange: -8 },
  { factor: 'The {sport} offseason is in full swing — no games being played', explanation: 'Offseason lulls reduce collecting activity. Prices typically dip during the quiet months before picking up with the new season.', minChange: -10, maxChange: -5 },
  { factor: 'A recession is reducing hobby spending across the board', explanation: 'Economic downturns hit collectibles markets hard. Discretionary spending on cards drops as collectors tighten budgets.', minChange: -20, maxChange: -10 },
];

function generateScenario(card: CardInput, rng: () => number): Scenario {
  const value = parseValue(card.estimatedValueRaw);
  const isPositive = rng() > 0.5;
  const factors = isPositive ? positiveFactors : negativeFactors;
  const template = factors[Math.floor(rng() * factors.length)];
  const changePercent = template.minChange + Math.floor(rng() * (template.maxChange - template.minChange + 1));

  return {
    card,
    value,
    factor: template.factor.replace('{player}', card.player).replace('{sport}', card.sport),
    factorType: isPositive ? 'positive' : 'negative',
    explanation: template.explanation,
    changePercent,
  };
}

/* ───── Storage ───── */
function getStorageKey(): string {
  const d = new Date();
  return `pricepred-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function loadDailyState(): { predictions: PredictionResult[]; completed: boolean } {
  if (typeof window === 'undefined') return { predictions: [], completed: false };
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return { predictions: [], completed: false };
    return JSON.parse(raw);
  } catch { return { predictions: [], completed: false }; }
}

function saveDailyState(state: { predictions: PredictionResult[]; completed: boolean }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function loadStats(): { totalCorrect: number; totalPredictions: number; bestStreak: number; currentStreak: number } {
  if (typeof window === 'undefined') return { totalCorrect: 0, totalPredictions: 0, bestStreak: 0, currentStreak: 0 };
  try {
    const raw = localStorage.getItem('pricepred-stats');
    if (!raw) return { totalCorrect: 0, totalPredictions: 0, bestStreak: 0, currentStreak: 0 };
    return JSON.parse(raw);
  } catch { return { totalCorrect: 0, totalPredictions: 0, bestStreak: 0, currentStreak: 0 }; }
}

function saveStats(s: { totalCorrect: number; totalPredictions: number; bestStreak: number; currentStreak: number }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pricepred-stats', JSON.stringify(s));
}

const TOTAL_ROUNDS = 5;

const sportColors: Record<string, { bg: string; border: string; text: string }> = {
  baseball: { bg: 'bg-red-950/60', border: 'border-red-800/50', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/60', border: 'border-orange-800/50', text: 'text-orange-400' },
  football: { bg: 'bg-green-950/60', border: 'border-green-800/50', text: 'text-green-400' },
  hockey: { bg: 'bg-blue-950/60', border: 'border-blue-800/50', text: 'text-blue-400' },
};

/* ───── Component ───── */
export default function PricePredictionClient({ cards }: { cards: CardInput[] }) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const [stats, setStats] = useState({ totalCorrect: 0, totalPredictions: 0, bestStreak: 0, currentStreak: 0 });
  const [mounted, setMounted] = useState(false);

  // Generate daily scenarios
  const scenarios = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + 7777;
    const rng = seededRandom(seed);
    const pool = cards.filter(c => parseValue(c.estimatedValueRaw) > 0);
    const shuffled = shuffleArray(pool, rng);
    return shuffled.slice(0, TOTAL_ROUNDS).map(c => generateScenario(c, rng));
  }, [cards]);

  useEffect(() => {
    const saved = loadDailyState();
    if (saved.predictions.length > 0) {
      setPredictions(saved.predictions);
      setCurrentRound(saved.predictions.length);
    }
    setStats(loadStats());
    setMounted(true);
  }, []);

  const makePrediction = useCallback((direction: 'up' | 'down') => {
    if (revealing || currentRound >= TOTAL_ROUNDS) return;
    setRevealing(true);

    setTimeout(() => {
      const scenario = scenarios[currentRound];
      const correct = (direction === 'up' && scenario.changePercent > 0) || (direction === 'down' && scenario.changePercent < 0);
      const points = correct ? 100 : 0;

      const result: PredictionResult = { scenario, predicted: direction, correct, points };
      const newPredictions = [...predictions, result];
      const newRound = currentRound + 1;

      setPredictions(newPredictions);
      setCurrentRound(newRound);
      saveDailyState({ predictions: newPredictions, completed: newRound >= TOTAL_ROUNDS });

      // Update all-time stats
      const newStats = { ...stats };
      newStats.totalPredictions++;
      if (correct) {
        newStats.totalCorrect++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.bestStreak) newStats.bestStreak = newStats.currentStreak;
      } else {
        newStats.currentStreak = 0;
      }
      setStats(newStats);
      saveStats(newStats);

      setRevealing(false);
    }, 800);
  }, [revealing, currentRound, scenarios, predictions, stats]);

  const gameComplete = currentRound >= TOTAL_ROUNDS;
  const totalPoints = predictions.reduce((s, p) => s + p.points, 0);
  const correctCount = predictions.filter(p => p.correct).length;

  const grade = totalPoints >= 450 ? { label: 'S', color: 'text-yellow-400', desc: 'Market Oracle' } :
                totalPoints >= 350 ? { label: 'A', color: 'text-green-400', desc: 'Smart Money' } :
                totalPoints >= 250 ? { label: 'B', color: 'text-blue-400', desc: 'Market Watcher' } :
                totalPoints >= 150 ? { label: 'C', color: 'text-purple-400', desc: 'Learning the Ropes' } :
                totalPoints >= 50 ? { label: 'D', color: 'text-gray-400', desc: 'Against the Market' } :
                { label: 'F', color: 'text-red-400', desc: 'Buy High Sell Low' };

  const shareText = `Price Prediction on CardVault!\n${correctCount}/${TOTAL_ROUNDS} correct (${totalPoints} pts)\nGrade: ${grade.label} — ${grade.desc}\nAccuracy: ${stats.totalPredictions > 0 ? Math.round(stats.totalCorrect / stats.totalPredictions * 100) : 0}% all-time\nhttps://cardvault-two.vercel.app/price-prediction`;

  if (!mounted) {
    return <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center"><p className="text-gray-400">Loading...</p></div>;
  }

  const currentScenario = currentRound < TOTAL_ROUNDS ? scenarios[currentRound] : null;
  const lastResult = predictions.length > 0 ? predictions[predictions.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Round</p>
          <p className="text-white font-bold text-lg">{Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Score</p>
          <p className="text-emerald-400 font-bold text-lg">{totalPoints}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">All-time %</p>
          <p className="text-blue-400 font-bold text-lg">{stats.totalPredictions > 0 ? Math.round(stats.totalCorrect / stats.totalPredictions * 100) : 0}%</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Best Streak</p>
          <p className="text-yellow-400 font-bold text-lg">{stats.bestStreak}</p>
        </div>
      </div>

      {/* Current Scenario or Game Over */}
      {!gameComplete && currentScenario ? (
        <div className="bg-gradient-to-b from-emerald-950/20 to-gray-900/60 border-2 border-emerald-800/30 rounded-2xl p-6">
          {/* Card info */}
          <div className={`${sportColors[currentScenario.card.sport]?.bg || 'bg-gray-900/60'} ${sportColors[currentScenario.card.sport]?.border || 'border-gray-800'} border rounded-xl p-4 mb-4`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs font-medium ${sportColors[currentScenario.card.sport]?.text || 'text-gray-400'}`}>
                  {currentScenario.card.sport.toUpperCase()} {currentScenario.card.rookie ? '| ROOKIE' : ''}
                </span>
                <h3 className="text-white font-bold text-lg mt-1">{currentScenario.card.player}</h3>
                <p className="text-gray-400 text-sm">{currentScenario.card.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Current Value</p>
                <p className="text-white font-bold text-xl">{formatValue(currentScenario.value)}</p>
              </div>
            </div>
          </div>

          {/* Market factor */}
          <div className="bg-gray-950/60 border border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Market Factor</p>
            <p className="text-white text-lg font-medium leading-relaxed">{currentScenario.factor}</p>
          </div>

          {/* Prediction buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => makePrediction('up')}
              disabled={revealing}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                revealing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white active:scale-[0.98]'
              }`}
            >
              {revealing ? '...' : 'UP'}
            </button>
            <button
              onClick={() => makePrediction('down')}
              disabled={revealing}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                revealing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white active:scale-[0.98]'
              }`}
            >
              {revealing ? '...' : 'DOWN'}
            </button>
          </div>
        </div>
      ) : gameComplete ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center space-y-4">
          <p className={`text-5xl font-black ${grade.color}`}>{grade.label}</p>
          <p className="text-gray-400 text-sm">{grade.desc}</p>
          <p className="text-white font-bold text-2xl">{correctCount}/{TOTAL_ROUNDS} correct ({totalPoints} pts)</p>
          <button
            onClick={() => navigator.clipboard?.writeText(shareText)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
          >
            Copy Results to Share
          </button>
        </div>
      ) : null}

      {/* Last result */}
      {lastResult && !revealing && (
        <div className={`rounded-xl p-4 border ${lastResult.correct ? 'bg-green-950/30 border-green-800/50' : 'bg-red-950/30 border-red-800/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>
              {lastResult.correct ? '&#10003;' : '&#10007;'}
            </span>
            <span className={`font-bold ${lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>
              {lastResult.correct ? 'Correct!' : 'Wrong!'} — Price went {lastResult.scenario.changePercent > 0 ? 'UP' : 'DOWN'} {Math.abs(lastResult.scenario.changePercent)}%
            </span>
          </div>
          <p className="text-gray-400 text-sm">{lastResult.scenario.explanation}</p>
        </div>
      )}

      {/* Prediction History */}
      {predictions.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Today&apos;s Predictions</h3>
          <div className="space-y-2">
            {predictions.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    p.correct ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'
                  }`}>
                    {p.correct ? '&#10003;' : '&#10007;'}
                  </span>
                  <span className="text-white text-xs">{p.scenario.card.player}</span>
                  <span className="text-gray-500 text-xs">
                    You said {p.predicted.toUpperCase()} | Actual: {p.scenario.changePercent > 0 ? '+' : ''}{p.scenario.changePercent}%
                  </span>
                </div>
                <span className={`font-medium ${p.correct ? 'text-green-400' : 'text-gray-600'}`}>
                  {p.points > 0 ? `+${p.points}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
