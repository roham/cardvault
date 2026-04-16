'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Jimmy Johnson / Dallas Cowboys Draft Trade Value Chart (standard NFL)
// Pick 1 = 3000, Pick 2 = 2600, ... Pick 224 = 2
const PICK_VALUES: Record<number, number> = {
  1: 3000, 2: 2600, 3: 2200, 4: 1800, 5: 1700, 6: 1600, 7: 1500, 8: 1400,
  9: 1350, 10: 1300, 11: 1250, 12: 1200, 13: 1150, 14: 1100, 15: 1050, 16: 1000,
  17: 950, 18: 900, 19: 875, 20: 850, 21: 800, 22: 780, 23: 760, 24: 740,
  25: 720, 26: 700, 27: 680, 28: 660, 29: 640, 30: 620, 31: 600, 32: 590,
  33: 580, 34: 560, 35: 550, 36: 540, 37: 530, 38: 520, 39: 510, 40: 500,
  41: 490, 42: 480, 43: 470, 44: 460, 45: 450, 46: 440, 47: 430, 48: 420,
  49: 410, 50: 400, 51: 390, 52: 380, 53: 370, 54: 360, 55: 350, 56: 340,
  57: 330, 58: 320, 59: 310, 60: 300, 61: 292, 62: 284, 63: 276, 64: 270,
  65: 265, 66: 260, 67: 255, 68: 250, 69: 245, 70: 240, 71: 235, 72: 230,
  73: 225, 74: 220, 75: 215, 76: 210, 77: 205, 78: 200, 79: 195, 80: 190,
  81: 185, 82: 180, 83: 175, 84: 170, 85: 165, 86: 160, 87: 155, 88: 150,
  89: 145, 90: 140, 91: 136, 92: 132, 93: 128, 94: 124, 95: 120, 96: 116,
  97: 112, 98: 108, 99: 104, 100: 100, 101: 96, 102: 92, 103: 88, 104: 86,
  105: 84, 106: 82, 107: 80, 108: 78, 109: 76, 110: 74, 111: 72, 112: 70,
  113: 68, 114: 66, 115: 64, 116: 62, 117: 60, 118: 58, 119: 56, 120: 54,
  121: 52, 122: 50, 123: 49, 124: 48, 125: 47, 126: 46, 127: 45, 128: 44,
  129: 43, 130: 42, 131: 41, 132: 40, 133: 39.5, 134: 39, 135: 38.5, 136: 38,
  137: 37.5, 138: 37, 139: 36.5, 140: 36, 141: 35.6, 142: 35.2, 143: 34.8,
  144: 34.4, 145: 34, 146: 33.6, 147: 33.2, 148: 32.8, 149: 32.4, 150: 32,
  151: 31.6, 152: 31.2, 153: 30.8, 154: 30.4, 155: 30, 156: 29.6, 157: 29.2,
  158: 28.8, 159: 28.4, 160: 28, 161: 27.6, 162: 27.2, 163: 26.8, 164: 26.4,
  165: 26, 166: 25.6, 167: 25.2, 168: 24.8, 169: 24.4, 170: 24, 171: 23.6,
  172: 23.2, 173: 22.8, 174: 22.4, 175: 22, 176: 21.6, 177: 21.2, 178: 20.8,
  179: 20.4, 180: 20, 181: 19.6, 182: 19.2, 183: 18.8, 184: 18.4, 185: 18,
  186: 17.6, 187: 17.2, 188: 16.8, 189: 16.4, 190: 16, 191: 15.6, 192: 15.2,
  193: 14.8, 194: 14.4, 195: 14, 196: 13.6, 197: 13.2, 198: 12.8, 199: 12.4,
  200: 12, 201: 11.6, 202: 11.2, 203: 10.8, 204: 10.4, 205: 10, 206: 9.6,
  207: 9.2, 208: 8.8, 209: 8.4, 210: 8, 211: 7.6, 212: 7.2, 213: 6.8,
  214: 6.4, 215: 6, 216: 5.6, 217: 5.2, 218: 4.8, 219: 4.4, 220: 4,
  221: 3.5, 222: 3, 223: 2.5, 224: 2, 225: 1.8, 226: 1.6, 227: 1.4,
  228: 1.2, 229: 1, 230: 0.8, 231: 0.6, 232: 0.5, 233: 0.4, 234: 0.3,
  235: 0.2, 236: 0.2, 237: 0.1, 238: 0.1, 239: 0.1, 240: 0.1,
  241: 0.1, 242: 0.1, 243: 0.1, 244: 0.1, 245: 0.1, 246: 0.1,
  247: 0.1, 248: 0.1, 249: 0.1, 250: 0.1, 251: 0.1, 252: 0.1,
  253: 0.1, 254: 0.1, 255: 0.1, 256: 0.1, 257: 0.1,
};

function getPickValue(pick: number): number {
  if (pick < 1) return 0;
  if (pick > 257) return 0.1;
  return PICK_VALUES[pick] ?? 0.1;
}

function getRound(pick: number): number {
  if (pick <= 32) return 1;
  if (pick <= 64) return 2;
  if (pick <= 100) return 3;
  if (pick <= 135) return 4;
  if (pick <= 176) return 5;
  if (pick <= 220) return 6;
  return 7;
}

function getCardImpact(pick: number): { label: string; color: string; desc: string } {
  if (pick <= 5) return { label: 'Elite', color: 'text-yellow-400', desc: 'Top 5 picks produce the most valuable rookie cards. QBs at #1 often hit $500+ for Prizm Silver RC.' };
  if (pick <= 15) return { label: 'High', color: 'text-emerald-400', desc: 'Top 15 picks generate strong card demand. Key Prizm/Select RCs typically $50-$200+ raw.' };
  if (pick <= 32) return { label: 'Moderate', color: 'text-blue-400', desc: 'Late 1st rounders have solid card value, especially at skill positions. $20-$80 for key RCs.' };
  if (pick <= 64) return { label: 'Day 2', color: 'text-purple-400', desc: 'Round 2-3 picks can breakout but card values start lower. $5-$30 for most RCs.' };
  if (pick <= 135) return { label: 'Sleeper', color: 'text-orange-400', desc: 'Mid-round picks are sleeper territory. Huge ROI if they hit (think Puka Nacua, Brock Purdy).' };
  return { label: 'Dart Throw', color: 'text-gray-400', desc: 'Late-round RCs are cheap. If they become stars (Tom Brady pick 199!), 1000x+ returns.' };
}

// 2025 NFL Draft order (first 32 picks)
const TEAM_ORDER_2025 = [
  'Titans', 'Browns', 'Giants', 'Patriots', 'Jaguars', 'Raiders', 'Jets', 'Panthers',
  'Saints', 'Bears', 'Niners', 'Cowboys', 'Dolphins', 'Colts', 'Falcons', 'Cardinals',
  'Bengals', 'Seahawks', 'Buccaneers', 'Broncos', 'Steelers', 'Commanders', 'Rams', 'Packers',
  'Chargers', 'Texans', 'Ravens', 'Lions', 'Vikings', 'Bills', 'Chiefs', 'Eagles',
];

// Notable recent trade examples
const FAMOUS_TRADES = [
  { year: 2024, desc: 'Bears trade #1 to Cardinals for #4, #33, #67, 2025 1st', sideA: [1], sideB: [4, 33, 67], valueA: 3000, valueB: 2960 },
  { year: 2023, desc: 'Panthers trade multiple picks to Bears for #1 overall (Bryce Young)', sideA: [1], sideB: [9, 61, 93, 249], valueA: 3000, valueB: 1756 },
  { year: 2021, desc: 'Niners trade up to #3 for Trey Lance (3 1sts + 3rd)', sideA: [3], sideB: [12, 102], valueA: 2200, valueB: 1288 },
  { year: 2018, desc: 'Bills trade up to #7 for Josh Allen (2 1sts + 2nds)', sideA: [7], sideB: [12, 53, 56], valueA: 1500, valueB: 1570 },
];

export default function DraftTradeCalculator() {
  const [teamAPicks, setTeamAPicks] = useState<number[]>([]);
  const [teamBPicks, setTeamBPicks] = useState<number[]>([]);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [activeTab, setActiveTab] = useState<'calculator' | 'chart' | 'history'>('calculator');

  const addPick = (side: 'A' | 'B') => {
    const input = side === 'A' ? inputA : inputB;
    const pick = parseInt(input);
    if (isNaN(pick) || pick < 1 || pick > 257) return;
    if (side === 'A') {
      setTeamAPicks(prev => [...prev, pick]);
      setInputA('');
    } else {
      setTeamBPicks(prev => [...prev, pick]);
      setInputB('');
    }
  };

  const removePick = (side: 'A' | 'B', index: number) => {
    if (side === 'A') setTeamAPicks(prev => prev.filter((_, i) => i !== index));
    else setTeamBPicks(prev => prev.filter((_, i) => i !== index));
  };

  const analysis = useMemo(() => {
    const totalA = teamAPicks.reduce((sum, p) => sum + getPickValue(p), 0);
    const totalB = teamBPicks.reduce((sum, p) => sum + getPickValue(p), 0);
    const diff = totalA - totalB;
    const pctDiff = totalA + totalB > 0 ? Math.abs(diff) / Math.max(totalA, totalB) * 100 : 0;

    let verdict: string;
    let verdictColor: string;
    if (teamAPicks.length === 0 || teamBPicks.length === 0) {
      verdict = 'Add picks to both sides to evaluate';
      verdictColor = 'text-gray-400';
    } else if (pctDiff < 5) {
      verdict = 'Fair Trade';
      verdictColor = 'text-emerald-400';
    } else if (diff > 0) {
      verdict = 'Team A Wins';
      verdictColor = 'text-blue-400';
    } else {
      verdict = 'Team B Wins';
      verdictColor = 'text-purple-400';
    }

    // Find the best pick overall for card impact
    const allPicks = [...teamAPicks, ...teamBPicks];
    const bestPick = allPicks.length > 0 ? Math.min(...allPicks) : 0;

    return { totalA, totalB, diff, pctDiff, verdict, verdictColor, bestPick };
  }, [teamAPicks, teamBPicks]);

  const handleKeyDown = (side: 'A' | 'B', e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addPick(side);
  };

  const loadExample = (ex: typeof FAMOUS_TRADES[0]) => {
    setTeamAPicks(ex.sideA);
    setTeamBPicks(ex.sideB);
  };

  const clearAll = () => {
    setTeamAPicks([]);
    setTeamBPicks([]);
    setInputA('');
    setInputB('');
  };

  const shareResults = () => {
    if (teamAPicks.length === 0 && teamBPicks.length === 0) return;
    const text = `NFL Draft Trade Evaluator\n\nTeam A: Picks ${teamAPicks.join(', ')} (${analysis.totalA.toFixed(0)} pts)\nTeam B: Picks ${teamBPicks.join(', ')} (${analysis.totalB.toFixed(0)} pts)\nVerdict: ${analysis.verdict} (${analysis.pctDiff.toFixed(1)}% gap)\n\nEvaluate your trades: cardvault-two.vercel.app/tools/draft-trade-value`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        {(['calculator', 'chart', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab === 'calculator' ? 'Trade Calculator' : tab === 'chart' ? 'Value Chart' : 'Famous Trades'}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <>
          {/* Two-sided trade builder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Team A */}
            <div className="bg-gray-800/50 border border-blue-800/30 rounded-xl p-5">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Team A</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min={1}
                  max={257}
                  value={inputA}
                  onChange={e => setInputA(e.target.value)}
                  onKeyDown={e => handleKeyDown('A', e)}
                  placeholder="Pick # (1-257)"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => addPick('A')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {teamAPicks.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No picks added yet</p>
                )}
                {teamAPicks.map((pick, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">#{pick}</span>
                      <span className="text-gray-400 text-xs">Rd {getRound(pick)}</span>
                      <span className="text-blue-400 text-sm font-medium">{getPickValue(pick).toFixed(0)} pts</span>
                    </div>
                    <button onClick={() => removePick('A', i)} className="text-gray-500 hover:text-red-400 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Value</span>
                  <span className="text-blue-400 font-bold text-xl">{analysis.totalA.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Team B */}
            <div className="bg-gray-800/50 border border-purple-800/30 rounded-xl p-5">
              <h3 className="text-lg font-bold text-purple-400 mb-4">Team B</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min={1}
                  max={257}
                  value={inputB}
                  onChange={e => setInputB(e.target.value)}
                  onKeyDown={e => handleKeyDown('B', e)}
                  placeholder="Pick # (1-257)"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => addPick('B')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {teamBPicks.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No picks added yet</p>
                )}
                {teamBPicks.map((pick, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">#{pick}</span>
                      <span className="text-gray-400 text-xs">Rd {getRound(pick)}</span>
                      <span className="text-purple-400 text-sm font-medium">{getPickValue(pick).toFixed(0)} pts</span>
                    </div>
                    <button onClick={() => removePick('B', i)} className="text-gray-500 hover:text-red-400 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Value</span>
                  <span className="text-purple-400 font-bold text-xl">{analysis.totalB.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict */}
          {(teamAPicks.length > 0 || teamBPicks.length > 0) && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${analysis.verdictColor} mb-1`}>{analysis.verdict}</div>
                {analysis.totalA + analysis.totalB > 0 && teamAPicks.length > 0 && teamBPicks.length > 0 && (
                  <p className="text-gray-400 text-sm">
                    {analysis.pctDiff < 5
                      ? 'Values are within 5% — a balanced trade.'
                      : `${Math.abs(analysis.diff).toFixed(0)} point gap (${analysis.pctDiff.toFixed(1)}%). ${analysis.diff > 0 ? 'Team A' : 'Team B'} gets more draft capital.`
                    }
                  </p>
                )}
              </div>

              {/* Value comparison bar */}
              {teamAPicks.length > 0 && teamBPicks.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Team A: {analysis.totalA.toFixed(0)}</span>
                    <span>Team B: {analysis.totalB.toFixed(0)}</span>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 transition-all"
                      style={{ width: `${(analysis.totalA / (analysis.totalA + analysis.totalB)) * 100}%` }}
                    />
                    <div
                      className="bg-purple-600 transition-all"
                      style={{ width: `${(analysis.totalB / (analysis.totalA + analysis.totalB)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Card market impact */}
              {analysis.bestPick > 0 && (
                <div className="bg-gray-900/50 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2">Rookie Card Market Impact</h4>
                  {[...new Set([...teamAPicks, ...teamBPicks])].sort((a, b) => a - b).slice(0, 4).map(pick => {
                    const impact = getCardImpact(pick);
                    return (
                      <div key={pick} className="flex items-center gap-3 mb-2 last:mb-0">
                        <span className="text-white font-bold text-sm w-10">#{pick}</span>
                        <span className={`${impact.color} text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800`}>{impact.label}</span>
                        <span className="text-gray-400 text-xs flex-1">{impact.desc}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 mt-4 justify-center">
                <button onClick={shareResults} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  Copy Results
                </button>
                <button onClick={clearAll} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* 2025 Draft Order Quick Add */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-8">
            <h3 className="text-lg font-bold text-white mb-3">2025 NFL Draft — Round 1</h3>
            <p className="text-gray-400 text-sm mb-4">Click a pick to add it to Team A. Hold Shift + click to add to Team B.</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {TEAM_ORDER_2025.map((team, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    const pick = i + 1;
                    if (e.shiftKey) {
                      setTeamBPicks(prev => [...prev, pick]);
                    } else {
                      setTeamAPicks(prev => [...prev, pick]);
                    }
                  }}
                  className="bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 text-center transition-colors group"
                >
                  <div className="text-white font-bold text-sm">#{i + 1}</div>
                  <div className="text-gray-500 text-[10px] group-hover:text-gray-300 truncate">{team}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Examples */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Try Famous Draft Trades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FAMOUS_TRADES.map((trade, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(trade)}
                  className="bg-gray-900/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg p-3 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-bold text-sm">{trade.year}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{trade.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'chart' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2">NFL Draft Pick Trade Value Chart</h3>
            <p className="text-gray-400 text-sm mb-4">
              The standard Jimmy Johnson / Dallas Cowboys trade value chart used by NFL teams since 1991.
              Higher value = more valuable pick. Add pick values to compare trade packages.
            </p>

            {/* Round-by-round tables */}
            {[
              { label: 'Round 1 (Picks 1-32)', start: 1, end: 32, color: 'border-yellow-800/30' },
              { label: 'Round 2 (Picks 33-64)', start: 33, end: 64, color: 'border-blue-800/30' },
              { label: 'Round 3 (Picks 65-100)', start: 65, end: 100, color: 'border-emerald-800/30' },
              { label: 'Rounds 4-7 (Picks 101-257)', start: 101, end: 176, color: 'border-gray-700/30' },
            ].map(round => (
              <div key={round.label} className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">{round.label}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                  {Array.from({ length: round.end - round.start + 1 }, (_, i) => round.start + i).map(pick => (
                    <div
                      key={pick}
                      className={`bg-gray-900/50 border ${round.color} rounded p-1.5 text-center`}
                    >
                      <div className="text-gray-400 text-[10px]">#{pick}</div>
                      <div className="text-white text-xs font-bold">{getPickValue(pick).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Value drop-off visualization */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Value Drop-Off by Round</h3>
            <div className="space-y-3">
              {[
                { round: 1, avg: 1225, range: '590-3000', color: 'bg-yellow-500' },
                { round: 2, avg: 462, range: '270-580', color: 'bg-blue-500' },
                { round: 3, avg: 174, range: '100-265', color: 'bg-emerald-500' },
                { round: 4, avg: 64, range: '44-96', color: 'bg-purple-500' },
                { round: 5, avg: 30, range: '18-43', color: 'bg-orange-500' },
                { round: 6, avg: 10, range: '4-17', color: 'bg-red-500' },
                { round: 7, avg: 1, range: '0.1-3.5', color: 'bg-gray-500' },
              ].map(r => (
                <div key={r.round} className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-16">Round {r.round}</span>
                  <div className="flex-1 bg-gray-900 rounded-full h-5 overflow-hidden">
                    <div
                      className={`${r.color} h-full rounded-full`}
                      style={{ width: `${(r.avg / 1225) * 100}%`, minWidth: '2%' }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-20 text-right">Avg: {r.avg}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3">Round 1 picks average 27x the value of a Round 4 pick. The #1 overall is worth more than an entire draft class of 7th rounders.</p>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Famous Draft Trades & Card Market Impact</h3>
            <div className="space-y-4">
              {[
                { year: 2024, title: 'Cardinals trade #4 + #33 + #67 + 2025 1st for #1 (Caleb Williams to Bears)', chart: 2960, got: 3000, cardNote: 'Caleb Williams Prizm Silver RC hit $300+ within weeks of draft night' },
                { year: 2021, title: 'Niners trade 2 future 1sts + 3rd for #3 (Trey Lance)', chart: 1288, got: 2200, cardNote: 'Lance Prizm RC hit $150 on draft night, crashed to $20 after bust. Classic overpay.' },
                { year: 2018, title: 'Bills trade #12 + #53 + #56 for #7 (Josh Allen)', chart: 1570, got: 1500, cardNote: 'Allen Prizm Silver RC went from $50 (draft) to $7,000+ (MVP season). Best trade ROI ever.' },
                { year: 2017, title: 'Bears trade multiple picks to move from #3 to #2 (Mitchell Trubisky)', chart: 1700, got: 2600, cardNote: 'Trubisky RCs peaked at $80, now worth $5. Textbook overpay in both picks AND cards.' },
                { year: 2016, title: 'Eagles trade #8 + future 1st + more for #2 (Carson Wentz)', chart: 1700, got: 2600, cardNote: 'Wentz Prizm Silver hit $500 in 2017, dropped to $30 after injuries. Wild ride.' },
                { year: 2012, title: 'Washington trades 3 first-round picks for #2 (Robert Griffin III)', chart: 4100, got: 2600, cardNote: 'RGIII Topps Chrome RC hit $200 as rookie, worth $10 now. Massive overpay in hindsight.' },
                { year: 2004, title: 'Giants select Eli Manning #1, trade to Chargers for #4 (Philip Rivers) + picks', chart: 2250, got: 3000, cardNote: 'Manning 2x SB MVP. His Topps Chrome RC: $200-$400. Rivers Topps Chrome: $30-$60.' },
              ].map((trade, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-bold">{trade.year}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${trade.chart >= trade.got ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                      {trade.chart >= trade.got ? 'Fair/Underpay' : 'Overpay'}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">{trade.title}</p>
                  <p className="text-amber-400/80 text-xs">{trade.cardNote}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-5">
            <h3 className="text-amber-400 font-bold mb-2">The Card Collector&apos;s Draft Trade Rule</h3>
            <p className="text-gray-300 text-sm">
              Teams that trade UP for QBs almost always overpay in draft value. But as a card collector,
              the <strong className="text-white">landing spot matters more than the pick number</strong>. A QB going to a big-market team
              (Bears, Giants, Jets) generates 2-3x the card demand of the same player going to a small market (Jaguars, Titans).
              When evaluating draft trades for card impact, weight market size heavily.
            </p>
          </div>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-10 pt-8 border-t border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Related Draft & Trading Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/draft-predictor', label: '2025 Draft Predictor', icon: '🎯' },
            { href: '/draft-hub', label: 'Draft Hub', icon: '📋' },
            { href: '/tools/prospect-tracker', label: 'Prospect Pipeline', icon: '🔮' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/trade', label: 'Card Trade Evaluator', icon: '🔄' },
            { href: '/draft-war-room', label: 'Draft War Room', icon: '🏈' },
            { href: '/tools/rookie-finder', label: 'Rookie Card Finder', icon: '⭐' },
          ].map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
