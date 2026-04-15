'use client';

import { useState } from 'react';

interface SportGrade {
  sport: string;
  grade: string;
  color: string;
  momentum: number;
  demand: number;
  releases: number;
  outlook: number;
  overall: number;
  topMovers: string[];
  summary: string;
  trend: 'up' | 'stable' | 'down';
}

const Q1_2026: SportGrade[] = [
  {
    sport: 'Football',
    grade: 'A',
    color: 'text-green-400',
    momentum: 92,
    demand: 88,
    releases: 85,
    outlook: 90,
    overall: 89,
    topMovers: ['Caleb Williams Prizm RC', 'Jayden Daniels Prizm RC', 'Marvin Harrison Jr Prizm RC'],
    summary: 'Football dominates Q1 with NFL Playoffs and Super Bowl driving massive demand. 2024 rookie class RCs seeing 30-50% appreciation since September. Draft buzz already building for 2025 class.',
    trend: 'up',
  },
  {
    sport: 'Basketball',
    grade: 'B+',
    color: 'text-blue-400',
    momentum: 82,
    demand: 85,
    releases: 78,
    outlook: 80,
    overall: 81,
    topMovers: ['Victor Wembanyama Prizm RC', 'Chet Holmgren Prizm RC', 'Cooper Flagg Pre-Draft'],
    summary: 'Steady demand led by Wemby mania. All-Star weekend drove a brief spike. Vintage basketball (MJ, Kobe, LeBron) holding strong. 2025 draft class generating buzz.',
    trend: 'stable',
  },
  {
    sport: 'Baseball',
    grade: 'A-',
    color: 'text-red-400',
    momentum: 85,
    demand: 82,
    releases: 90,
    outlook: 85,
    overall: 86,
    topMovers: ['Shohei Ohtani Chrome', 'Elly De La Cruz Prizm RC', 'Paul Skenes Chrome RC'],
    summary: 'Spring training buzz fuels early demand. 2025 Topps Series 1 release drove strong box sales. Ohtani Dodgers cards up 25% since WS win. Rookie class loaded with Paul Skenes leading.',
    trend: 'up',
  },
  {
    sport: 'Hockey',
    grade: 'B-',
    color: 'text-cyan-400',
    momentum: 70,
    demand: 68,
    releases: 72,
    outlook: 75,
    overall: 71,
    topMovers: ['Connor Bedard Young Guns', 'Macklin Celebrini Young Guns', 'Connor McDavid'],
    summary: 'Hockey remains undervalued relative to star talent. Bedard and Celebrini carrying the hobby. McDavid Cup winner cards strong. Trade deadline movement creating opportunities.',
    trend: 'stable',
  },
];

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-500', 'A': 'bg-emerald-500', 'A-': 'bg-emerald-600',
  'B+': 'bg-blue-500', 'B': 'bg-blue-500', 'B-': 'bg-blue-600',
  'C+': 'bg-yellow-500', 'C': 'bg-yellow-500', 'C-': 'bg-yellow-600',
  'D': 'bg-red-500', 'F': 'bg-red-700',
};

export default function MarketReportCardClient() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Overview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Q1_2026.map(s => (
          <button
            key={s.sport}
            onClick={() => setSelected(selected === s.sport ? null : s.sport)}
            className={`p-4 rounded-xl border text-center transition-all ${
              selected === s.sport ? 'border-white/30 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50'
            }`}
          >
            <div className={`text-3xl font-black ${s.color}`}>{s.grade}</div>
            <div className="text-white font-medium text-sm mt-1">{s.sport}</div>
            <div className="text-zinc-500 text-xs mt-0.5">
              {s.trend === 'up' ? '↑ Rising' : s.trend === 'down' ? '↓ Falling' : '→ Stable'}
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (() => {
        const s = Q1_2026.find(x => x.sport === selected)!;
        return (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-black ${s.color}`}>{s.grade}</div>
              <div>
                <h3 className="text-white font-bold text-lg">{s.sport} Card Market</h3>
                <p className="text-zinc-400 text-sm">Q1 2026 (Jan-Mar)</p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{s.summary}</p>

            {/* Factor bars */}
            <div className="space-y-2">
              {[
                { label: 'Momentum', val: s.momentum },
                { label: 'Demand', val: s.demand },
                { label: 'New Releases', val: s.releases },
                { label: 'Outlook', val: s.outlook },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs w-24">{f.label}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${GRADE_COLORS[s.grade] || 'bg-zinc-500'}`} style={{ width: `${f.val}%` }} />
                  </div>
                  <span className="text-zinc-400 text-xs w-8 text-right">{f.val}</span>
                </div>
              ))}
            </div>

            {/* Top movers */}
            <div>
              <h4 className="text-white font-medium text-sm mb-2">Top Movers</h4>
              <div className="flex flex-wrap gap-2">
                {s.topMovers.map(m => (
                  <span key={m} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Overall market score */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
        <div className="text-zinc-500 text-sm mb-1">Overall Card Market Q1 2026</div>
        <div className="text-3xl font-black text-white">B+</div>
        <div className="text-zinc-400 text-sm mt-1">Composite: {Math.round(Q1_2026.reduce((s, g) => s + g.overall, 0) / Q1_2026.length)}/100</div>
      </div>
    </div>
  );
}
