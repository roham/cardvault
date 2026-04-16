'use client';

import { useState, useMemo } from 'react';

/* ---------- Types ---------- */

type RiskLevel = 'conservative' | 'moderate' | 'aggressive' | 'speculative';
type Timeline = 'short' | 'medium' | 'long';

interface Allocation {
  category: string;
  percentage: number;
  color: string;
  description: string;
  examples: string[];
  risk: string;
  expectedReturn: string;
}

/* ---------- Budget Presets ---------- */

const BUDGET_PRESETS = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

const RISK_OPTIONS: { id: RiskLevel; label: string; description: string; emoji: string }[] = [
  { id: 'conservative', label: 'Conservative', description: 'Protect my capital. I want stable, proven cards.', emoji: '🛡️' },
  { id: 'moderate', label: 'Moderate', description: 'Balanced growth. Mix of safe bets and upside.', emoji: '⚖️' },
  { id: 'aggressive', label: 'Aggressive', description: 'I want maximum growth potential. Higher risk OK.', emoji: '🚀' },
  { id: 'speculative', label: 'Speculative', description: 'Lottery tickets. I want 10x or nothing.', emoji: '🎲' },
];

const TIMELINE_OPTIONS: { id: Timeline; label: string; years: string }[] = [
  { id: 'short', label: 'Short-Term', years: '0-2 years' },
  { id: 'medium', label: 'Medium-Term', years: '3-5 years' },
  { id: 'long', label: 'Long-Term', years: '5-10+ years' },
];

/* ---------- Allocation Engine ---------- */

function buildAllocation(risk: RiskLevel, timeline: Timeline): Allocation[] {
  const allocations: Allocation[] = [];

  if (risk === 'conservative') {
    if (timeline === 'long') {
      allocations.push(
        { category: 'Vintage Blue Chips', percentage: 45, color: 'bg-blue-600', description: 'PSA 8+ of confirmed Hall of Famers in iconic sets', examples: ['1952 Topps Mantle', '1986 Fleer Jordan', '1979 OPC Gretzky'], risk: 'Very Low', expectedReturn: '6-10% annually' },
        { category: 'Modern Graded Stars', percentage: 25, color: 'bg-emerald-600', description: 'PSA 10 / BGS 9.5 of established superstars', examples: ['2018 Topps Chrome Ohtani PSA 10', '2019 Prizm Zion PSA 10'], risk: 'Low', expectedReturn: '4-8% annually' },
        { category: 'Sealed Wax', percentage: 20, color: 'bg-purple-600', description: 'Sealed hobby boxes of popular sets 3+ years old', examples: ['2017 Topps Chrome Hobby', '2018 Prizm Basketball'], risk: 'Low', expectedReturn: '8-15% annually' },
        { category: 'Cash Reserve', percentage: 10, color: 'bg-gray-600', description: 'Keep liquid for opportunistic buys during market dips', examples: ['Playoff sell-offs', 'Injury discount windows', 'End-of-year tax sales'], risk: 'None', expectedReturn: '0% (optionality value)' },
      );
    } else {
      allocations.push(
        { category: 'Vintage Blue Chips', percentage: 35, color: 'bg-blue-600', description: 'PSA 8+ Hall of Famers in iconic sets', examples: ['1952 Topps Mantle', '1986 Fleer Jordan'], risk: 'Very Low', expectedReturn: '6-10% annually' },
        { category: 'Modern Graded Stars', percentage: 35, color: 'bg-emerald-600', description: 'PSA 10 of current superstars with proven track records', examples: ['LeBron Chrome RC PSA 10', 'Mahomes Prizm PSA 10'], risk: 'Low', expectedReturn: '4-8% annually' },
        { category: 'Sealed Wax', percentage: 15, color: 'bg-purple-600', description: 'Sealed hobby boxes from 2-5 years ago', examples: ['2020 Bowman Chrome Hobby', '2021 Prizm Football'], risk: 'Low', expectedReturn: '8-15% annually' },
        { category: 'Cash Reserve', percentage: 15, color: 'bg-gray-600', description: 'Ready capital for buying opportunities', examples: ['Dips', 'Deals', 'Fire sales'], risk: 'None', expectedReturn: '0%' },
      );
    }
  } else if (risk === 'moderate') {
    allocations.push(
      { category: 'Established Stars', percentage: 30, color: 'bg-blue-600', description: 'Graded cards of current top-10 players in each sport', examples: ['Ohtani Chrome PSA 10', 'Wembanyama Prizm PSA 10', 'Bedard YG PSA 10'], risk: 'Low-Medium', expectedReturn: '5-12% annually' },
      { category: 'Rising Young Stars', percentage: 25, color: 'bg-emerald-600', description: 'Year 2-4 players showing All-Star trajectory', examples: ['Anthony Edwards Prizm', 'CJ Stroud Prizm', 'Paul Skenes Chrome'], risk: 'Medium', expectedReturn: '10-25% if breakout' },
      { category: 'Rookie Cards', percentage: 20, color: 'bg-orange-600', description: 'Current year rookies with strong profiles', examples: ['2024 #1 picks across all sports', '2025 Topps Chrome rookies'], risk: 'Medium-High', expectedReturn: '20-50% if successful' },
      { category: 'Sealed Product', percentage: 15, color: 'bg-purple-600', description: 'Current year hobby boxes to hold 3-5 years', examples: ['2025 Topps Chrome Hobby', '2024-25 Prizm Basketball'], risk: 'Low', expectedReturn: '8-15% annually' },
      { category: 'Speculative Picks', percentage: 10, color: 'bg-red-600', description: 'High-upside bets on prospects or buy-low situations', examples: ['Top Bowman Chrome prospects', 'Injured star buy-the-dip'], risk: 'High', expectedReturn: '-50% to +200%' },
    );
  } else if (risk === 'aggressive') {
    allocations.push(
      { category: 'Rookie Cards', percentage: 35, color: 'bg-orange-600', description: 'Current and last-year rookies with star potential', examples: ['Wembanyama parallels', 'Caleb Williams Prizm', 'Macklin Celebrini YG'], risk: 'Medium-High', expectedReturn: '25-100% if star' },
      { category: 'Prospect Cards', percentage: 25, color: 'bg-yellow-600', description: 'Pre-debut 1st Bowman Chrome and international prospects', examples: ['Top-50 MLB prospects', '2025 Draft class Bowman', 'NCAA stars'], risk: 'High', expectedReturn: '-30% to +300%' },
      { category: 'Rising Stars', percentage: 20, color: 'bg-emerald-600', description: 'Players in breakout phase, still underpriced', examples: ['Playoff breakout players', 'All-Star snubs', 'Sophomore surge'], risk: 'Medium', expectedReturn: '15-50%' },
      { category: 'Numbered Parallels', percentage: 15, color: 'bg-pink-600', description: 'Low print run parallels (/25 or less) of star players', examples: ['Gold /50 refractors', '/25 Prizm parallels', 'Jersey number matches'], risk: 'Medium', expectedReturn: '10-30%' },
      { category: 'Cash Reserve', percentage: 5, color: 'bg-gray-600', description: 'Minimal reserve for can\'t-miss opportunities', examples: ['Trade deadline deals', 'Injury buy windows'], risk: 'None', expectedReturn: '0%' },
    );
  } else {
    allocations.push(
      { category: 'Prospect Lottery', percentage: 40, color: 'bg-yellow-600', description: 'Pre-debut prospects who could be future stars', examples: ['1st Bowman Chrome of top-10 prospects', 'International signings'], risk: 'Very High', expectedReturn: '-80% to +500%' },
      { category: 'Rookie Hype', percentage: 25, color: 'bg-orange-600', description: 'Current rookie parallels of flashy players', examples: ['Numbered refractors of hype rookies', 'Auto RCs of projected stars'], risk: 'Very High', expectedReturn: '-60% to +400%' },
      { category: 'Buy-the-Dip Stars', percentage: 20, color: 'bg-blue-600', description: 'Established players in temporary value dips (injury, slump)', examples: ['Injured All-Stars', 'Trade deadline confusion', 'Bad season buys'], risk: 'High', expectedReturn: '20-100% on recovery' },
      { category: 'Sealed Wax Flip', percentage: 15, color: 'bg-purple-600', description: 'New release sealed at retail, flip at markup', examples: ['New Chrome releases', 'Limited retail exclusives'], risk: 'Medium', expectedReturn: '20-50% on hot products' },
    );
  }

  return allocations;
}

/* ---------- Component ---------- */

export default function InvestmentPlannerClient() {
  const [budget, setBudget] = useState<string>('5000');
  const [risk, setRisk] = useState<RiskLevel>('moderate');
  const [timeline, setTimeline] = useState<Timeline>('medium');

  const budgetNum = parseFloat(budget) || 0;
  const allocation = useMemo(() => buildAllocation(risk, timeline), [risk, timeline]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Your Investment Profile</h2>

        {/* Budget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Investment Budget</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {BUDGET_PRESETS.map(b => (
              <button
                key={b}
                onClick={() => setBudget(b.toString())}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  parseInt(budget) === b
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:bg-gray-700/60 hover:text-white'
                }`}
              >
                ${b.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={100}
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="Custom amount"
            className="w-full sm:w-48 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Risk Tolerance */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RISK_OPTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setRisk(r.id)}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  risk === r.id
                    ? 'bg-emerald-900/30 border-emerald-700/50 text-white'
                    : 'bg-gray-900/60 border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{r.emoji}</span>
                  <span className="font-medium text-sm">{r.label}</span>
                </div>
                <div className="text-xs text-gray-500">{r.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Investment Timeline</label>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeline(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  timeline === t.id
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:bg-gray-700/60 hover:text-white'
                }`}
              >
                {t.label} ({t.years})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allocation Results */}
      {budgetNum > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Your ${budgetNum.toLocaleString()} Portfolio — {RISK_OPTIONS.find(r => r.id === risk)?.label} / {TIMELINE_OPTIONS.find(t => t.id === timeline)?.label}
          </h2>

          {/* Visual Bar */}
          <div className="h-8 rounded-full overflow-hidden flex mb-6">
            {allocation.map((a, i) => (
              <div
                key={i}
                className={`${a.color} h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500`}
                style={{ width: `${a.percentage}%` }}
              >
                {a.percentage >= 10 ? `${a.percentage}%` : ''}
              </div>
            ))}
          </div>

          {/* Allocation Cards */}
          <div className="space-y-3">
            {allocation.map((a, i) => {
              const dollarAmount = Math.round(budgetNum * a.percentage / 100);
              return (
                <div key={i} className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${a.color} flex-shrink-0`} />
                      <div>
                        <div className="text-white font-medium">{a.category}</div>
                        <div className="text-gray-500 text-xs">{a.percentage}% — ${dollarAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 text-sm font-bold">{a.expectedReturn}</div>
                      <div className="text-gray-500 text-xs">Risk: {a.risk}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{a.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.examples.map((ex, j) => (
                      <span key={j} className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-lg">{ex}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs">Total Budget</div>
              <div className="text-white font-bold">${budgetNum.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs">Categories</div>
              <div className="text-white font-bold">{allocation.length}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs">Risk Level</div>
              <div className="text-emerald-400 font-bold">{RISK_OPTIONS.find(r => r.id === risk)?.label}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs">Timeline</div>
              <div className="text-white font-bold">{TIMELINE_OPTIONS.find(t => t.id === timeline)?.years}</div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-gray-600 text-xs mt-4 italic">
            This is educational guidance, not financial advice. Sports cards are speculative assets. Past performance does not guarantee future returns. Never invest money you cannot afford to lose.
          </p>
        </div>
      )}
    </div>
  );
}
