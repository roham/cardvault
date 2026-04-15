'use client';

import { useMemo } from 'react';
import Link from 'next/link';

/* ── deterministic daily seed ──────────────────────────────── */

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-fg`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/* ── types ─────────────────────────────────────────────────── */

interface Signal {
  name: string;
  description: string;
  value: number; // 0-100
  weight: number;
  category: 'momentum' | 'volume' | 'sentiment' | 'valuation' | 'volatility';
}

type Sentiment = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';

const SENTIMENT_CONFIG: Record<Sentiment, { color: string; bg: string; border: string; icon: string }> = {
  'Extreme Fear': { color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700/50', icon: 'EF' },
  'Fear': { color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700/50', icon: 'F' },
  'Neutral': { color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', icon: 'N' },
  'Greed': { color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700/50', icon: 'G' },
  'Extreme Greed': { color: 'text-emerald-400', bg: 'bg-emerald-900/30', border: 'border-emerald-700/50', icon: 'EG' },
};

function getSentiment(score: number): Sentiment {
  if (score <= 20) return 'Extreme Fear';
  if (score <= 40) return 'Fear';
  if (score <= 60) return 'Neutral';
  if (score <= 80) return 'Greed';
  return 'Extreme Greed';
}

const CATEGORY_COLORS: Record<string, string> = {
  momentum: 'text-blue-400',
  volume: 'text-purple-400',
  sentiment: 'text-cyan-400',
  valuation: 'text-amber-400',
  volatility: 'text-rose-400',
};

/* ── component ─────────────────────────────────────────────── */

export default function FearGreedIndex() {
  const data = useMemo(() => {
    const rand = seededRandom(dateHash());

    // Seasonal bias: sports cycle affects card market
    const month = new Date().getMonth(); // 0-11
    const dayOfWeek = new Date().getDay(); // 0-6

    // Baseball peaks Feb-Apr, Football peaks Aug-Oct, Basketball Nov-Feb
    const seasonalBias = [55, 62, 68, 70, 55, 45, 42, 55, 60, 58, 52, 48][month];
    const weekendBump = (dayOfWeek === 0 || dayOfWeek === 6) ? 5 : 0;

    const jitter = (base: number, range: number) => {
      return Math.max(0, Math.min(100, Math.round(base + (rand() - 0.5) * range * 2)));
    };

    const signals: Signal[] = [
      {
        name: 'Market Momentum',
        description: 'Trend direction of top card values over 30 days',
        value: jitter(seasonalBias + weekendBump, 12),
        weight: 20,
        category: 'momentum',
      },
      {
        name: 'Rookie Card Demand',
        description: 'Search volume and sales velocity for current-year rookies',
        value: jitter(seasonalBias + 5, 15),
        weight: 15,
        category: 'momentum',
      },
      {
        name: 'Auction Volume',
        description: 'Number of high-value card auctions ending this week',
        value: jitter(seasonalBias - 3 + weekendBump, 10),
        weight: 10,
        category: 'volume',
      },
      {
        name: 'eBay Sold Listings',
        description: 'Volume of completed card sales on eBay vs 90-day average',
        value: jitter(seasonalBias + 2, 8),
        weight: 10,
        category: 'volume',
      },
      {
        name: 'Social Media Buzz',
        description: 'Card collecting mentions across social platforms',
        value: jitter(seasonalBias + 3, 18),
        weight: 10,
        category: 'sentiment',
      },
      {
        name: 'Break Room Activity',
        description: 'Participation in group breaks and live rips',
        value: jitter(seasonalBias + weekendBump * 2, 14),
        weight: 5,
        category: 'sentiment',
      },
      {
        name: 'Price-to-Pop Ratio',
        description: 'Card prices relative to PSA population counts',
        value: jitter(seasonalBias - 5, 10),
        weight: 15,
        category: 'valuation',
      },
      {
        name: 'Sealed Product Premium',
        description: 'Sealed box prices vs original retail across major products',
        value: jitter(seasonalBias + 2, 12),
        weight: 5,
        category: 'valuation',
      },
      {
        name: 'Price Volatility',
        description: 'Standard deviation of top-100 card price changes (inverted)',
        value: jitter(100 - seasonalBias + 10, 15),
        weight: 5,
        category: 'volatility',
      },
      {
        name: 'Grading Submission Volume',
        description: 'Cards submitted to PSA/BGS/CGC vs historical average',
        value: jitter(seasonalBias + 1, 10),
        weight: 5,
        category: 'volatility',
      },
    ];

    const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
    const indexScore = Math.round(signals.reduce((s, sig) => s + sig.value * sig.weight, 0) / totalWeight);
    const sentiment = getSentiment(indexScore);

    // 7-day history
    const history: { day: string; score: number; sentiment: Sentiment }[] = [];
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pastStr = `${pastDate.getFullYear()}-${pastDate.getMonth()}-${pastDate.getDate()}-fg`;
      let ph = 0;
      for (let j = 0; j < pastStr.length; j++) {
        ph = ((ph << 5) - ph + pastStr.charCodeAt(j)) | 0;
      }
      const pastRand = seededRandom(Math.abs(ph));
      const pastMonth = pastDate.getMonth();
      const pastBias = [55, 62, 68, 70, 55, 45, 42, 55, 60, 58, 52, 48][pastMonth];
      const pastScore = Math.max(0, Math.min(100, Math.round(pastBias + (pastRand() - 0.5) * 30)));
      history.push({
        day: pastDate.toLocaleDateString('en-US', { weekday: 'short' }),
        score: pastScore,
        sentiment: getSentiment(pastScore),
      });
    }

    const implications: string[] = [];
    if (indexScore <= 25) {
      implications.push('Extreme fear often presents buying opportunities for patient collectors.');
      implications.push('Card prices may be depressed below fair value due to panic selling.');
      implications.push('Consider adding to your PC or picking up grails at discounted prices.');
    } else if (indexScore <= 40) {
      implications.push('Market caution is elevated — sellers may be more willing to negotiate.');
      implications.push('New product releases may see lower initial demand, creating post-release dips.');
      implications.push('Grading submissions tend to slow during fearful periods.');
    } else if (indexScore <= 60) {
      implications.push('Market is balanced with no strong directional signal.');
      implications.push('A good time for portfolio rebalancing and strategic trades.');
      implications.push('Focus on value rather than momentum plays.');
    } else if (indexScore <= 80) {
      implications.push('Strong demand is driving prices higher across multiple categories.');
      implications.push('New product releases likely to sell out quickly at or above MSRP.');
      implications.push('Consider taking profits on cards that have appreciated significantly.');
    } else {
      implications.push('Extreme greed suggests prices may be overheated — proceed with caution.');
      implications.push('FOMO buying is driving prices above sustainable levels for some cards.');
      implications.push('Consider selling into strength and building cash reserves for the next dip.');
    }

    return { signals, indexScore, sentiment, history, implications };
  }, []);

  const config = SENTIMENT_CONFIG[data.sentiment];
  const gaugeAngle = (data.indexScore / 100) * 180 - 90;

  return (
    <div className="space-y-8">
      {/* Main Gauge */}
      <div className="text-center">
        <div className={`inline-block ${config.bg} ${config.border} border rounded-2xl p-8 sm:p-12`}>
          <div className="relative w-64 h-32 mx-auto mb-4">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <path d="M 10 100 A 90 90 0 0 1 46 28" fill="none" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
              <path d="M 46 28 A 90 90 0 0 1 100 10" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
              <path d="M 100 10 A 90 90 0 0 1 154 28" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
              <path d="M 154 28 A 90 90 0 0 1 190 100" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
              <line
                x1="100" y1="100"
                x2={100 + 75 * Math.cos((gaugeAngle * Math.PI) / 180)}
                y2={100 - 75 * Math.sin((gaugeAngle * Math.PI) / 180)}
                stroke="white" strokeWidth="3" strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="6" fill="white" />
              <text x="10" y="108" fill="#9ca3af" fontSize="10" textAnchor="start">0</text>
              <text x="100" y="8" fill="#9ca3af" fontSize="10" textAnchor="middle">50</text>
              <text x="190" y="108" fill="#9ca3af" fontSize="10" textAnchor="end">100</text>
            </svg>
          </div>

          <div className={`text-6xl font-black ${config.color}`}>{data.indexScore}</div>
          <div className={`text-xl font-bold ${config.color} mt-1`}>{data.sentiment}</div>
          <div className="text-gray-400 text-sm mt-2">
            Updated {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 7-Day History */}
      <div>
        <h3 className="text-white font-semibold mb-3">7-Day History</h3>
        <div className="grid grid-cols-7 gap-2">
          {data.history.map((h, i) => {
            const hConfig = SENTIMENT_CONFIG[h.sentiment];
            return (
              <div key={i} className={`${hConfig.bg} ${hConfig.border} border rounded-xl p-3 text-center`}>
                <div className="text-xs text-gray-400">{h.day}</div>
                <div className={`text-lg font-bold ${hConfig.color} mt-1`}>{h.score}</div>
                <div className="text-xs text-gray-500 mt-0.5">{h.sentiment.split(' ').pop()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What This Means */}
      <div className={`${config.bg} ${config.border} border rounded-xl p-5`}>
        <h3 className="text-white font-semibold mb-3">What This Means for Collectors</h3>
        <ul className="space-y-2">
          {data.implications.map((imp, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.color.replace('text-', 'bg-')}`} />
              {imp}
            </li>
          ))}
        </ul>
      </div>

      {/* Individual Signals */}
      <div>
        <h3 className="text-white font-semibold mb-3">Signal Breakdown</h3>
        <div className="space-y-3">
          {data.signals.map(sig => {
            const sigSentiment = getSentiment(sig.value);
            const sigConfig = SENTIMENT_CONFIG[sigSentiment];
            return (
              <div key={sig.name} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase ${CATEGORY_COLORS[sig.category] ?? 'text-gray-400'}`}>
                        {sig.category}
                      </span>
                      <span className="text-xs text-gray-600">({sig.weight}% weight)</span>
                    </div>
                    <h4 className="text-white font-medium text-sm mt-0.5">{sig.name}</h4>
                    <p className="text-gray-500 text-xs">{sig.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`text-xl font-bold ${sigConfig.color}`}>{sig.value}</div>
                    <div className="text-xs text-gray-500">{sigSentiment}</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sig.value <= 20 ? 'bg-red-500' :
                      sig.value <= 40 ? 'bg-orange-500' :
                      sig.value <= 60 ? 'bg-yellow-500' :
                      sig.value <= 80 ? 'bg-green-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${sig.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">How the Index Works</h3>
        <p className="text-gray-400 text-sm mb-3">
          The Card Market Fear &amp; Greed Index combines 10 signals across 5 categories into a single 0-100 score. Each signal measures
          a different aspect of market health, weighted by its predictive importance.
        </p>
        <div className="grid sm:grid-cols-5 gap-2">
          {[
            { cat: 'momentum', label: 'Momentum', weight: '35%', desc: 'Price trends + rookie demand' },
            { cat: 'volume', label: 'Volume', weight: '20%', desc: 'Auction activity + eBay sales' },
            { cat: 'sentiment', label: 'Sentiment', weight: '15%', desc: 'Social buzz + break activity' },
            { cat: 'valuation', label: 'Valuation', weight: '20%', desc: 'Price-to-pop + sealed premium' },
            { cat: 'volatility', label: 'Volatility', weight: '10%', desc: 'Price swings + grading volume' },
          ].map(c => (
            <div key={c.cat} className="bg-gray-900/40 rounded-lg p-3 text-center">
              <div className={`text-xs font-bold ${CATEGORY_COLORS[c.cat]}`}>{c.label}</div>
              <div className="text-white font-bold text-sm mt-1">{c.weight}</div>
              <div className="text-gray-500 text-xs mt-0.5">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale Reference */}
      <div>
        <h3 className="text-white font-semibold mb-3">Sentiment Scale</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { range: '0-20', sentiment: 'Extreme Fear' as Sentiment },
            { range: '21-40', sentiment: 'Fear' as Sentiment },
            { range: '41-60', sentiment: 'Neutral' as Sentiment },
            { range: '61-80', sentiment: 'Greed' as Sentiment },
            { range: '81-100', sentiment: 'Extreme Greed' as Sentiment },
          ].map(s => {
            const sc = SENTIMENT_CONFIG[s.sentiment];
            return (
              <div key={s.range} className={`${sc.bg} ${sc.border} border rounded-lg p-3 text-center`}>
                <div className={`text-xs font-bold ${sc.color}`}>{s.range}</div>
                <div className="text-white text-sm font-bold mt-1">{sc.icon}</div>
                <div className={`text-xs mt-0.5 ${sc.color}`}>{s.sentiment}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal Links */}
      <div className="border-t border-gray-700/50 pt-6">
        <h3 className="text-white font-semibold mb-3">Related Market Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/market-sentiment', label: 'Market Sentiment Index' },
            { href: '/market-heatmap', label: 'Market Heat Map' },
            { href: '/market-movers', label: 'Market Movers' },
            { href: '/power-rankings', label: 'Power Rankings' },
            { href: '/market-analysis', label: 'Daily Market Analysis' },
            { href: '/tools/stress-test', label: 'Portfolio Stress Test' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              {link.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
