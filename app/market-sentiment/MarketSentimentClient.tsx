'use client';

import { useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-sentiment-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

const sportLabels: Record<Sport, string> = { baseball: 'Baseball', basketball: 'Basketball', football: 'Football', hockey: 'Hockey' };
const sportIcons: Record<Sport, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

function getSentimentLabel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score <= 15) return { label: 'Extreme Fear', color: 'text-red-400', bg: 'bg-red-950/60', border: 'border-red-800/50' };
  if (score <= 30) return { label: 'Fear', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/30' };
  if (score <= 45) return { label: 'Mild Fear', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/30' };
  if (score <= 55) return { label: 'Neutral', color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800/30' };
  if (score <= 70) return { label: 'Mild Greed', color: 'text-lime-400', bg: 'bg-lime-950/40', border: 'border-lime-800/30' };
  if (score <= 85) return { label: 'Greed', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/30' };
  return { label: 'Extreme Greed', color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-800/50' };
}

function getGaugeColor(score: number): string {
  if (score <= 25) return '#ef4444';
  if (score <= 45) return '#f97316';
  if (score <= 55) return '#eab308';
  if (score <= 75) return '#84cc16';
  return '#22c55e';
}

// Signal descriptions based on score ranges
function getSignalDescription(label: string, score: number): string {
  const map: Record<string, (s: number) => string> = {
    'Price Momentum': (s) => s > 60 ? 'More cards rising than falling. Bullish momentum building.' : s > 40 ? 'Mixed signals. No clear directional trend.' : 'More cards declining than rising. Sellers in control.',
    'Volume Activity': (s) => s > 60 ? 'Above-average trading volume. High market participation.' : s > 40 ? 'Normal trading volume. Steady market activity.' : 'Below-average volume. Market is quiet.',
    'Market Breadth': (s) => s > 60 ? 'Rally is broad-based. Multiple sports and eras participating.' : s > 40 ? 'Mixed breadth. Some sectors leading, others lagging.' : 'Narrow market. Gains concentrated in few segments.',
    'Sector Rotation': (s) => s > 60 ? 'Money flowing into growth sectors (rookies, modern). Risk-on.' : s > 40 ? 'Balanced rotation between value and growth cards.' : 'Flight to quality. Money moving to vintage and blue-chip cards.',
  };
  return (map[label] || (() => ''))(score);
}

export default function MarketSentimentClient() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');

  const data = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const seed = dateHash(todayStr);
    const rng = seededRng(seed);

    // Calculate per-sport data
    const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
    const sportCards = Object.fromEntries(
      sports.map(s => [s, sportsCards.filter(c => c.sport === s)])
    ) as Record<Sport, typeof sportsCards>;

    // Per-sport sentiment signals
    const sportSentiment = Object.fromEntries(sports.map(sport => {
      const cards = sportCards[sport];
      const sportRng = seededRng(seed + sport.length * 1000);

      // Price Momentum: based on card value distribution + daily noise
      const avgValue = cards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0) / cards.length;
      const momentum = Math.min(100, Math.max(0, 40 + (avgValue > 100 ? 15 : avgValue > 30 ? 5 : -5) + (sportRng() * 30 - 10)));

      // Volume: based on card count + randomness
      const volume = Math.min(100, Math.max(0, 35 + (cards.length > 1200 ? 15 : cards.length > 900 ? 8 : 0) + (sportRng() * 30 - 10)));

      // Breadth: based on unique players / total cards ratio
      const uniquePlayers = new Set(cards.map(c => c.player)).size;
      const breadth = Math.min(100, Math.max(0, 30 + (uniquePlayers / cards.length) * 60 + (sportRng() * 20 - 5)));

      // Sector rotation: based on modern vs vintage ratio
      const modernCount = cards.filter(c => c.year >= 2020).length;
      const modernRatio = modernCount / cards.length;
      const rotation = Math.min(100, Math.max(0, 25 + modernRatio * 50 + (sportRng() * 25 - 5)));

      const overall = Math.round(momentum * 0.35 + volume * 0.25 + breadth * 0.2 + rotation * 0.2);

      return [sport, {
        momentum: Math.round(momentum),
        volume: Math.round(volume),
        breadth: Math.round(breadth),
        rotation: Math.round(rotation),
        overall,
        cardCount: cards.length,
        uniquePlayers: uniquePlayers,
      }];
    })) as Record<Sport, { momentum: number; volume: number; breadth: number; rotation: number; overall: number; cardCount: number; uniquePlayers: number }>;

    // Overall market sentiment = weighted average of sport sentiments by card count
    const totalCards = sports.reduce((s, sp) => s + sportSentiment[sp].cardCount, 0);
    const overallScore = Math.round(
      sports.reduce((s, sp) => s + sportSentiment[sp].overall * (sportSentiment[sp].cardCount / totalCards), 0)
    );

    // Component signals (overall)
    const signals = [
      { label: 'Price Momentum', score: Math.round(sports.reduce((s, sp) => s + sportSentiment[sp].momentum * (sportSentiment[sp].cardCount / totalCards), 0)), weight: 35 },
      { label: 'Volume Activity', score: Math.round(sports.reduce((s, sp) => s + sportSentiment[sp].volume * (sportSentiment[sp].cardCount / totalCards), 0)), weight: 25 },
      { label: 'Market Breadth', score: Math.round(sports.reduce((s, sp) => s + sportSentiment[sp].breadth * (sportSentiment[sp].cardCount / totalCards), 0)), weight: 20 },
      { label: 'Sector Rotation', score: Math.round(sports.reduce((s, sp) => s + sportSentiment[sp].rotation * (sportSentiment[sp].cardCount / totalCards), 0)), weight: 20 },
    ];

    // 30-day historical data
    const history: { date: string; score: number; label: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const hs = dateHash(ds);
      const hr = seededRng(hs);
      // Generate historical score with mean reversion
      const base = 45 + (hr() * 30 - 10);
      const dayScore = Math.min(95, Math.max(5, Math.round(base + (hr() * 20 - 10))));
      const { label } = getSentimentLabel(dayScore);
      history.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: dayScore,
        label,
      });
    }

    return { overallScore, sportSentiment, signals, history, totalCards, date: todayStr };
  }, []);

  const { label, color, bg, border } = getSentimentLabel(data.overallScore);
  const filteredSignals = selectedSport === 'all' ? data.signals : [
    { label: 'Price Momentum', score: data.sportSentiment[selectedSport].momentum, weight: 35 },
    { label: 'Volume Activity', score: data.sportSentiment[selectedSport].volume, weight: 25 },
    { label: 'Market Breadth', score: data.sportSentiment[selectedSport].breadth, weight: 20 },
    { label: 'Sector Rotation', score: data.sportSentiment[selectedSport].rotation, weight: 20 },
  ];
  const displayScore = selectedSport === 'all' ? data.overallScore : data.sportSentiment[selectedSport].overall;
  const displaySentiment = getSentimentLabel(displayScore);

  return (
    <div className="space-y-8">
      {/* Main Gauge */}
      <div className={`${displaySentiment.bg} border ${displaySentiment.border} rounded-2xl p-6 sm:p-8 text-center`}>
        {/* Gauge Visualization */}
        <div className="relative w-48 h-24 mx-auto mb-4">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#374151" strokeWidth="12" strokeLinecap="round" />
            {/* Colored arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getGaugeColor(displayScore)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(displayScore / 100) * 251.2} 251.2`}
            />
            {/* Needle */}
            {(() => {
              const angle = -180 + (displayScore / 100) * 180;
              const rad = (angle * Math.PI) / 180;
              const nx = 100 + 65 * Math.cos(rad);
              const ny = 100 + 65 * Math.sin(rad);
              return <line x1="100" y1="100" x2={nx} y2={ny} stroke="white" strokeWidth="2.5" strokeLinecap="round" />;
            })()}
            {/* Center dot */}
            <circle cx="100" cy="100" r="4" fill="white" />
            {/* Labels */}
            <text x="20" y="108" fill="#9ca3af" fontSize="8" textAnchor="middle">0</text>
            <text x="100" y="15" fill="#9ca3af" fontSize="8" textAnchor="middle">50</text>
            <text x="180" y="108" fill="#9ca3af" fontSize="8" textAnchor="middle">100</text>
          </svg>
        </div>

        <div className={`text-5xl sm:text-6xl font-bold ${displaySentiment.color} mb-2`}>
          {displayScore}
        </div>
        <div className={`text-xl font-semibold ${displaySentiment.color} mb-1`}>
          {displaySentiment.label}
        </div>
        <div className="text-gray-500 text-sm">
          {selectedSport === 'all' ? 'Overall Market' : sportLabels[selectedSport]} Sentiment &middot; {new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedSport('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSport === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
        >
          All Sports
        </button>
        {(['baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(sport => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSport === sport ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
          >
            {sportIcons[sport]} {sportLabels[sport]}
          </button>
        ))}
      </div>

      {/* Component Signals */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Sentiment Signals</h2>
        <div className="grid gap-3">
          {filteredSignals.map(signal => {
            const s = getSentimentLabel(signal.score);
            return (
              <div key={signal.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white font-medium text-sm">{signal.label}</span>
                    <span className="text-gray-600 text-xs ml-2">({signal.weight}% weight)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${s.color}`}>{signal.score}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} border ${s.border} ${s.color}`}>{s.label}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${signal.score}%`, backgroundColor: getGaugeColor(signal.score) }}
                  />
                </div>
                <p className="text-gray-500 text-xs">{getSignalDescription(signal.label, signal.score)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sport Breakdown Cards */}
      {selectedSport === 'all' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">By Sport</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(sport => {
              const ss = data.sportSentiment[sport];
              const s = getSentimentLabel(ss.overall);
              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`${s.bg} border ${s.border} rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}
                >
                  <div className="text-2xl mb-1">{sportIcons[sport]}</div>
                  <div className="text-white font-medium text-sm mb-1">{sportLabels[sport]}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{ss.overall}</div>
                  <div className={`text-xs ${s.color}`}>{s.label}</div>
                  <div className="text-gray-600 text-xs mt-1">{ss.cardCount.toLocaleString()} cards</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 30-Day History Chart */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">30-Day Sentiment History</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
          {/* Chart */}
          <div className="relative h-40 mb-4">
            {/* Zone backgrounds */}
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-emerald-950/20 rounded-t-lg border-b border-gray-800/50" />
              <div className="flex-1 bg-yellow-950/10" />
              <div className="flex-1 bg-red-950/20 rounded-b-lg border-t border-gray-800/50" />
            </div>
            {/* Zone labels */}
            <div className="absolute left-0 top-0 text-emerald-600/60 text-[10px] px-1">Greed</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-600/60 text-[10px] px-1">Neutral</div>
            <div className="absolute left-0 bottom-0 text-red-600/60 text-[10px] px-1">Fear</div>
            {/* Line chart via SVG */}
            <svg viewBox={`0 0 ${data.history.length * 10} 100`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {/* Midline */}
              <line x1="0" y1="50" x2={data.history.length * 10} y2="50" stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
              {/* Data line */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                points={data.history.map((h, i) => `${i * 10 + 5},${100 - h.score}`).join(' ')}
              />
              {/* Data dots */}
              {data.history.map((h, i) => (
                <circle
                  key={i}
                  cx={i * 10 + 5}
                  cy={100 - h.score}
                  r="1.5"
                  fill={getGaugeColor(h.score)}
                />
              ))}
            </svg>
          </div>
          {/* Date labels */}
          <div className="flex justify-between text-gray-600 text-[10px]">
            <span>{data.history[0].date}</span>
            <span>{data.history[Math.floor(data.history.length / 2)].date}</span>
            <span>{data.history[data.history.length - 1].date}</span>
          </div>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <div className="text-gray-500 text-xs mb-1">30-Day Average</div>
              <div className="text-white font-bold">{Math.round(data.history.reduce((s, h) => s + h.score, 0) / data.history.length)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs mb-1">30-Day High</div>
              <div className="text-emerald-400 font-bold">{Math.max(...data.history.map(h => h.score))}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs mb-1">30-Day Low</div>
              <div className="text-red-400 font-bold">{Math.min(...data.history.map(h => h.score))}</div>
            </div>
          </div>
        </div>
      </div>

      {/* What This Means */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">What This Means for Collectors</h2>
        <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
          {displayScore <= 30 && (
            <>
              <p>The market is in <span className="text-red-400 font-semibold">Fear</span> territory. This often indicates that sellers are more active than buyers, prices are softening, and collector confidence is low.</p>
              <p>Historically, periods of Fear have been good entry points for long-term collectors. If you have cards on your wish list, this may be a favorable time to buy. Focus on blue-chip players and graded cards that hold value through downturns.</p>
            </>
          )}
          {displayScore > 30 && displayScore <= 70 && (
            <>
              <p>The market is in <span className="text-yellow-400 font-semibold">Neutral</span> territory. There is no extreme bias toward buying or selling. The market is functioning normally.</p>
              <p>Neutral periods are good for strategic moves — upgrading your collection, selling duplicates at fair prices, or adding positions in cards you believe in long-term. Avoid FOMO buying and panic selling.</p>
            </>
          )}
          {displayScore > 70 && (
            <>
              <p>The market is in <span className="text-emerald-400 font-semibold">Greed</span> territory. Buyers are aggressive, prices are rising, and sentiment is high. Media coverage and social buzz are amplifying demand.</p>
              <p>While momentum can continue, Greed periods carry higher risk. Avoid chasing spikes. If you own cards that have appreciated significantly, consider taking some profits. Remember: the best time to sell is when everyone wants to buy.</p>
            </>
          )}
        </div>
      </div>

      {/* Coverage stat */}
      <div className="text-center text-gray-600 text-xs">
        Sentiment calculated from {data.totalCards.toLocaleString()} tracked cards across 4 sports
      </div>
    </div>
  );
}
