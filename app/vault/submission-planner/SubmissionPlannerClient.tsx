'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type GradingCompany = 'PSA' | 'BGS' | 'CGC' | 'SGC';
type Condition = 'mint' | 'near-mint' | 'excellent' | 'very-good' | 'good' | 'fair' | 'poor';
type ServiceLevel = 'economy' | 'regular' | 'express' | 'super-express';

interface PlanCard {
  id: string;
  name: string;
  rawValue: number;
  condition: Condition;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'other';
  era: 'vintage' | 'modern' | 'ultra-modern';
  recommendedCompany: GradingCompany;
  recommendedLevel: ServiceLevel;
  estimatedGrade: number;
  gradingCost: number;
  projectedGradedValue: number;
  roi: number;
  priority: number; // 1=highest
  verdict: 'GRADE' | 'MAYBE' | 'SKIP';
}

const CONDITIONS: { value: Condition; label: string; gradeRange: [number, number] }[] = [
  { value: 'mint', label: 'Mint (PSA 9-10)', gradeRange: [9, 10] },
  { value: 'near-mint', label: 'Near-Mint (PSA 8-9)', gradeRange: [8, 9] },
  { value: 'excellent', label: 'Excellent (PSA 7-8)', gradeRange: [7, 8] },
  { value: 'very-good', label: 'Very Good (PSA 5-6)', gradeRange: [5, 6] },
  { value: 'good', label: 'Good (PSA 3-4)', gradeRange: [3, 4] },
  { value: 'fair', label: 'Fair (PSA 2)', gradeRange: [2, 2] },
  { value: 'poor', label: 'Poor (PSA 1)', gradeRange: [1, 1] },
];

const GRADE_VALUE_MULTIPLIERS: Record<number, number> = {
  10: 5.0, 9.5: 3.5, 9: 2.0, 8.5: 1.5, 8: 1.15, 7.5: 0.95, 7: 0.8,
  6: 0.65, 5: 0.55, 4: 0.45, 3: 0.4, 2: 0.35, 1: 0.3,
};

interface ServiceInfo {
  level: ServiceLevel;
  label: string;
  cost: number;
  minCards: number;
  turnaround: string;
}

const SERVICE_LEVELS: Record<GradingCompany, ServiceInfo[]> = {
  PSA: [
    { level: 'economy', label: 'Economy', cost: 25, minCards: 20, turnaround: '65+ business days' },
    { level: 'regular', label: 'Regular', cost: 50, minCards: 1, turnaround: '45 business days' },
    { level: 'express', label: 'Express', cost: 100, minCards: 1, turnaround: '20 business days' },
    { level: 'super-express', label: 'Super Express', cost: 200, minCards: 1, turnaround: '5 business days' },
  ],
  BGS: [
    { level: 'regular', label: 'Standard', cost: 35, minCards: 1, turnaround: '50 business days' },
    { level: 'express', label: 'Express', cost: 80, minCards: 1, turnaround: '10 business days' },
  ],
  CGC: [
    { level: 'economy', label: 'Economy', cost: 20, minCards: 25, turnaround: '70 business days' },
    { level: 'regular', label: 'Standard', cost: 30, minCards: 1, turnaround: '50 business days' },
    { level: 'express', label: 'Express', cost: 75, minCards: 1, turnaround: '15 business days' },
  ],
  SGC: [
    { level: 'economy', label: 'Economy', cost: 22, minCards: 10, turnaround: '60 business days' },
    { level: 'regular', label: 'Regular', cost: 30, minCards: 1, turnaround: '40 business days' },
  ],
};

const COMPANY_COLORS: Record<GradingCompany, { bg: string; border: string; text: string }> = {
  PSA: { bg: 'bg-red-950/40', border: 'border-red-800/40', text: 'text-red-400' },
  BGS: { bg: 'bg-amber-950/40', border: 'border-amber-800/40', text: 'text-amber-400' },
  CGC: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', text: 'text-emerald-400' },
  SGC: { bg: 'bg-sky-950/40', border: 'border-sky-800/40', text: 'text-sky-400' },
};

const STORAGE_KEY = 'cardvault_submission_planner';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmt(n: number): string {
  if (n < 0) return `-$${Math.abs(n).toFixed(0)}`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(0)}%`;
}

function estimateGrade(condition: Condition): number {
  const c = CONDITIONS.find(c => c.value === condition);
  if (!c) return 7;
  return (c.gradeRange[0] + c.gradeRange[1]) / 2;
}

function recommendCompany(
  rawValue: number,
  sport: string,
  era: string,
  grade: number
): GradingCompany {
  // High value → PSA (highest premiums for gem mint)
  if (rawValue >= 200 && grade >= 8) return 'PSA';
  // Vintage → SGC (best reputation for vintage)
  if (era === 'vintage') return 'SGC';
  // Basketball/Baseball high-end → PSA
  if ((sport === 'basketball' || sport === 'baseball') && rawValue >= 50) return 'PSA';
  // Budget modern → CGC (cheapest)
  if (rawValue < 30 && era === 'ultra-modern') return 'CGC';
  // Football → BGS or SGC work well
  if (sport === 'football' && rawValue >= 50) return 'BGS';
  // Default mid-range → PSA
  if (rawValue >= 40) return 'PSA';
  // Low value modern → CGC (most affordable)
  return 'CGC';
}

function recommendLevel(company: GradingCompany, rawValue: number, batchSize: number): ServiceLevel {
  const levels = SERVICE_LEVELS[company];
  // Check economy eligibility
  const econ = levels.find(l => l.level === 'economy');
  if (econ && batchSize >= econ.minCards && rawValue < 500) return 'economy';
  // High value → express
  if (rawValue >= 500) return 'express';
  // Default → regular
  return 'regular';
}

function getCost(company: GradingCompany, level: ServiceLevel): number {
  const info = SERVICE_LEVELS[company].find(l => l.level === level);
  return info?.cost ?? 50;
}

function getProjectedValue(rawValue: number, grade: number): number {
  const mult = GRADE_VALUE_MULTIPLIERS[Math.round(grade)] ?? 0.5;
  return rawValue * mult;
}

function getVerdict(roi: number, rawValue: number, grade: number): 'GRADE' | 'MAYBE' | 'SKIP' {
  if (rawValue < 15) return 'SKIP';
  if (grade < 7) return 'SKIP';
  if (roi > 30) return 'GRADE';
  if (roi > 0) return 'MAYBE';
  return 'SKIP';
}

function loadPlan(): PlanCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlan(cards: PlanCard[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch {}
}

export default function SubmissionPlannerClient() {
  const [cards, setCards] = useState<PlanCard[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<'cards' | 'batch' | 'summary'>('cards');
  const [copied, setCopied] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [condition, setCondition] = useState<Condition>('near-mint');
  const [sport, setSport] = useState<PlanCard['sport']>('baseball');
  const [era, setEra] = useState<PlanCard['era']>('ultra-modern');

  useEffect(() => { setCards(loadPlan()); }, []);

  const update = useCallback((next: PlanCard[]) => {
    setCards(next);
    savePlan(next);
  }, []);

  const addCard = useCallback(() => {
    const rv = parseFloat(rawValue);
    if (!name.trim() || isNaN(rv) || rv <= 0) return;
    const grade = estimateGrade(condition);
    const company = recommendCompany(rv, sport, era, grade);
    const level = recommendLevel(company, rv, cards.length + 1);
    const cost = getCost(company, level);
    const projectedValue = getProjectedValue(rv, grade);
    const roi = ((projectedValue - rv - cost) / (rv + cost)) * 100;
    const verdict = getVerdict(roi, rv, grade);

    const newCard: PlanCard = {
      id: genId(),
      name: name.trim(),
      rawValue: rv,
      condition,
      sport,
      era,
      recommendedCompany: company,
      recommendedLevel: level,
      estimatedGrade: grade,
      gradingCost: cost,
      projectedGradedValue: projectedValue,
      roi,
      priority: 0,
      verdict,
    };

    const next = [...cards, newCard]
      .sort((a, b) => b.roi - a.roi)
      .map((c, i) => ({ ...c, priority: i + 1 }));

    update(next);
    setName('');
    setRawValue('');
    setCondition('near-mint');
    setShowAdd(false);
  }, [name, rawValue, condition, sport, era, cards, update]);

  const removeCard = useCallback((id: string) => {
    const next = cards.filter(c => c.id !== id)
      .sort((a, b) => b.roi - a.roi)
      .map((c, i) => ({ ...c, priority: i + 1 }));
    update(next);
  }, [cards, update]);

  const overrideCompany = useCallback((id: string, company: GradingCompany) => {
    const next = cards.map(c => {
      if (c.id !== id) return c;
      const level = recommendLevel(company, c.rawValue, cards.length);
      const cost = getCost(company, level);
      const roi = ((c.projectedGradedValue - c.rawValue - cost) / (c.rawValue + cost)) * 100;
      return { ...c, recommendedCompany: company, recommendedLevel: level, gradingCost: cost, roi, verdict: getVerdict(roi, c.rawValue, c.estimatedGrade) };
    }).sort((a, b) => b.roi - a.roi).map((c, i) => ({ ...c, priority: i + 1 }));
    update(next);
  }, [cards, update]);

  // Batch analysis
  const batchAnalysis = useMemo(() => {
    const byCompany: Record<GradingCompany, PlanCard[]> = { PSA: [], BGS: [], CGC: [], SGC: [] };
    cards.forEach(c => { if (c.verdict !== 'SKIP') byCompany[c.recommendedCompany].push(c); });

    const batches = (Object.keys(byCompany) as GradingCompany[])
      .filter(co => byCompany[co].length > 0)
      .map(co => {
        const batch = byCompany[co];
        const levels = SERVICE_LEVELS[co];
        const econ = levels.find(l => l.level === 'economy');
        const canEconomy = econ && batch.length >= econ.minCards;
        const needForEconomy = econ ? Math.max(0, econ.minCards - batch.length) : 0;
        const savingsIfEconomy = econ && !canEconomy && needForEconomy <= 5
          ? batch.length * (getCost(co, 'regular') - econ.cost)
          : 0;

        return {
          company: co,
          cards: batch,
          count: batch.length,
          totalCost: batch.reduce((s, c) => s + c.gradingCost, 0),
          totalRawValue: batch.reduce((s, c) => s + c.rawValue, 0),
          totalProjected: batch.reduce((s, c) => s + c.projectedGradedValue, 0),
          canEconomy,
          needForEconomy: canEconomy ? 0 : needForEconomy,
          savingsIfEconomy,
        };
      });

    return batches;
  }, [cards]);

  const stats = useMemo(() => {
    const gradeCards = cards.filter(c => c.verdict === 'GRADE');
    const maybeCards = cards.filter(c => c.verdict === 'MAYBE');
    const skipCards = cards.filter(c => c.verdict === 'SKIP');
    const activeCards = [...gradeCards, ...maybeCards];
    const totalCost = activeCards.reduce((s, c) => s + c.gradingCost, 0);
    const totalRaw = activeCards.reduce((s, c) => s + c.rawValue, 0);
    const totalProjected = activeCards.reduce((s, c) => s + c.projectedGradedValue, 0);
    const totalProfit = totalProjected - totalRaw - totalCost;
    const overallRoi = totalCost > 0 ? (totalProfit / (totalRaw + totalCost)) * 100 : 0;

    return { gradeCards, maybeCards, skipCards, activeCards, totalCost, totalRaw, totalProjected, totalProfit, overallRoi };
  }, [cards]);

  const copyPlan = useCallback(() => {
    const lines: string[] = ['GRADING SUBMISSION PLAN', '========================', ''];
    batchAnalysis.forEach(b => {
      lines.push(`${b.company} (${b.count} cards) — ${fmt(b.totalCost)} total`);
      b.cards.forEach(c => {
        lines.push(`  #${c.priority} ${c.name} — Raw: ${fmt(c.rawValue)} | Est. Grade: ${c.estimatedGrade} | Projected: ${fmt(c.projectedGradedValue)} | ROI: ${fmtPct(c.roi)} | ${c.verdict}`);
      });
      if (b.needForEconomy > 0 && b.needForEconomy <= 5) {
        lines.push(`  TIP: Add ${b.needForEconomy} more cards to qualify for Economy pricing (save ${fmt(b.savingsIfEconomy)})`);
      }
      lines.push('');
    });
    lines.push('SUMMARY');
    lines.push(`Cards to grade: ${stats.activeCards.length} | Skip: ${stats.skipCards.length}`);
    lines.push(`Total grading cost: ${fmt(stats.totalCost)}`);
    lines.push(`Total raw value: ${fmt(stats.totalRaw)}`);
    lines.push(`Total projected graded value: ${fmt(stats.totalProjected)}`);
    lines.push(`Expected profit: ${fmt(stats.totalProfit)} (${fmtPct(stats.overallRoi)} ROI)`);
    lines.push('', 'Generated by CardVault Grading Submission Planner');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [batchAnalysis, stats]);

  const clearAll = useCallback(() => {
    update([]);
  }, [update]);

  const verdictStyle = (v: string) => {
    if (v === 'GRADE') return 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50';
    if (v === 'MAYBE') return 'bg-yellow-900/50 text-yellow-400 border-yellow-800/50';
    return 'bg-red-900/50 text-red-400 border-red-800/50';
  };

  const presets = [
    { label: '5 Modern Rookies ($30 each)', action: () => {
      const names = ['2023 Topps Chrome RC', '2023 Prizm Silver RC', '2023 Donruss Optic RC', '2023 Select Concourse RC', '2023 Mosaic RC'];
      const newCards = names.map((n, i) => {
        const rv = 25 + Math.round(Math.random() * 20);
        const grade = 9;
        const company = recommendCompany(rv, 'baseball', 'ultra-modern', grade);
        const level = recommendLevel(company, rv, cards.length + i + 1);
        const cost = getCost(company, level);
        const pv = getProjectedValue(rv, grade);
        const roi = ((pv - rv - cost) / (rv + cost)) * 100;
        return { id: genId(), name: n, rawValue: rv, condition: 'near-mint' as Condition, sport: 'baseball' as const, era: 'ultra-modern' as const, recommendedCompany: company, recommendedLevel: level, estimatedGrade: grade, gradingCost: cost, projectedGradedValue: pv, roi, priority: 0, verdict: getVerdict(roi, rv, grade) };
      });
      const next = [...cards, ...newCards].sort((a, b) => b.roi - a.roi).map((c, i) => ({ ...c, priority: i + 1 }));
      update(next);
    }},
    { label: '1 High-Value Vintage ($500)', action: () => {
      const grade = 7.5;
      const rv = 500;
      const company = recommendCompany(rv, 'baseball', 'vintage', grade);
      const level = recommendLevel(company, rv, cards.length + 1);
      const cost = getCost(company, level);
      const pv = getProjectedValue(rv, grade);
      const roi = ((pv - rv - cost) / (rv + cost)) * 100;
      const nc: PlanCard = { id: genId(), name: '1955 Topps Sandy Koufax RC', rawValue: rv, condition: 'excellent' as Condition, sport: 'baseball', era: 'vintage', recommendedCompany: company, recommendedLevel: level, estimatedGrade: grade, gradingCost: cost, projectedGradedValue: pv, roi, priority: 0, verdict: getVerdict(roi, rv, grade) };
      const next = [...cards, nc].sort((a, b) => b.roi - a.roi).map((c, i) => ({ ...c, priority: i + 1 }));
      update(next);
    }},
    { label: '10 Budget Cards ($15 each)', action: () => {
      const newCards = Array.from({ length: 10 }, (_, i) => {
        const rv = 12 + Math.round(Math.random() * 10);
        const grade = 9;
        const company: GradingCompany = 'CGC';
        const level = recommendLevel(company, rv, cards.length + i + 1);
        const cost = getCost(company, level);
        const pv = getProjectedValue(rv, grade);
        const roi = ((pv - rv - cost) / (rv + cost)) * 100;
        return { id: genId(), name: `2024 Base RC #${100 + i}`, rawValue: rv, condition: 'mint' as Condition, sport: 'football' as const, era: 'ultra-modern' as const, recommendedCompany: company, recommendedLevel: level, estimatedGrade: grade, gradingCost: cost, projectedGradedValue: pv, roi, priority: 0, verdict: getVerdict(roi, rv, grade) };
      });
      const next = [...cards, ...newCards].sort((a, b) => b.roi - a.roi).map((c, i) => ({ ...c, priority: i + 1 }));
      update(next);
    }},
  ];

  return (
    <div>
      {/* Quick presets */}
      {cards.length === 0 && (
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-3">Quick start with a preset:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p.label} onClick={p.action} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-purple-600/50 hover:text-white transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Cards', value: String(cards.length), color: 'text-white' },
            { label: 'Grade', value: String(stats.gradeCards.length), color: 'text-emerald-400' },
            { label: 'Total Cost', value: fmt(stats.totalCost), color: 'text-yellow-400' },
            { label: 'Projected', value: fmt(stats.totalProjected), color: 'text-blue-400' },
            { label: 'Est. ROI', value: fmtPct(stats.overallRoi), color: stats.overallRoi > 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
        {(['cards', 'batch', 'summary'] as const).map(t => (
          <button key={t} onClick={() => setView(t)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${view === t ? 'bg-purple-900/60 text-purple-300 border border-purple-700/40' : 'text-gray-400 hover:text-white'}`}>
            {t === 'cards' ? `Cards (${cards.length})` : t === 'batch' ? `Batches (${batchAnalysis.length})` : 'Summary'}
          </button>
        ))}
      </div>

      {/* Cards view */}
      {view === 'cards' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              + Add Card
            </button>
            {cards.length > 0 && (
              <button onClick={clearAll} className="px-3 py-1.5 text-red-400 hover:text-red-300 text-sm transition-colors">
                Clear All
              </button>
            )}
          </div>

          {showAdd && (
            <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Card Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 2023 Topps Chrome Elly De La Cruz RC" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Raw Value ($)</label>
                  <input type="number" value={rawValue} onChange={e => setRawValue(e.target.value)} placeholder="50" min="1" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Condition</label>
                  <select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none">
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Sport</label>
                  <select value={sport} onChange={e => setSport(e.target.value as PlanCard['sport'])} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none">
                    <option value="baseball">Baseball</option>
                    <option value="basketball">Basketball</option>
                    <option value="football">Football</option>
                    <option value="hockey">Hockey</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Era</label>
                  <select value={era} onChange={e => setEra(e.target.value as PlanCard['era'])} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none">
                    <option value="ultra-modern">Ultra-Modern (2020+)</option>
                    <option value="modern">Modern (1980-2019)</option>
                    <option value="vintage">Vintage (pre-1980)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addCard} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">Add to Plan</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {cards.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-lg font-medium text-gray-400">No cards in your submission plan</p>
              <p className="text-sm mt-1">Add cards to get grading recommendations and ROI projections</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map(c => {
                const cc = COMPANY_COLORS[c.recommendedCompany];
                return (
                  <div key={c.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 text-xs font-mono">#{c.priority}</span>
                          <span className="text-white font-medium text-sm truncate">{c.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${verdictStyle(c.verdict)}`}>{c.verdict}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>Raw: <span className="text-white">{fmt(c.rawValue)}</span></span>
                          <span>Est. Grade: <span className="text-white">{c.estimatedGrade}</span></span>
                          <span>Projected: <span className="text-blue-400">{fmt(c.projectedGradedValue)}</span></span>
                          <span>Cost: <span className="text-yellow-400">{fmt(c.gradingCost)}</span></span>
                          <span>ROI: <span className={c.roi > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtPct(c.roi)}</span></span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {(['PSA', 'BGS', 'CGC', 'SGC'] as GradingCompany[]).map(co => (
                            <button key={co} onClick={() => overrideCompany(c.id, co)} className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${c.recommendedCompany === co ? `${cc.bg} ${cc.border} ${cc.text}` : 'bg-gray-800/50 border-gray-700/50 text-gray-500 hover:text-gray-300'}`}>
                              {co}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removeCard(c.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1" title="Remove">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Batch view */}
      {view === 'batch' && (
        <div className="space-y-4">
          {batchAnalysis.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No active batches</p>
              <p className="text-sm">Add cards and mark them as GRADE or MAYBE to see batch groupings</p>
            </div>
          ) : (
            batchAnalysis.map(b => {
              const cc = COMPANY_COLORS[b.company];
              return (
                <div key={b.company} className={`${cc.bg} border ${cc.border} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${cc.text}`}>{b.company}</span>
                      <span className="text-gray-400 text-sm">{b.count} card{b.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={`font-bold ${cc.text}`}>{fmt(b.totalCost)}</span>
                  </div>
                  {b.needForEconomy > 0 && b.needForEconomy <= 5 && (
                    <div className="bg-yellow-950/40 border border-yellow-800/40 rounded-lg p-2 mb-3 text-yellow-400 text-xs">
                      Add {b.needForEconomy} more card{b.needForEconomy !== 1 ? 's' : ''} to qualify for Economy pricing and save ~{fmt(b.savingsIfEconomy)}
                    </div>
                  )}
                  {b.canEconomy && (
                    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2 mb-3 text-emerald-400 text-xs">
                      Qualifies for Economy pricing — saving vs Regular rate
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {b.cards.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300 truncate flex-1">{c.name}</span>
                        <div className="flex items-center gap-3 text-xs ml-2">
                          <span className="text-gray-500">{fmt(c.rawValue)}</span>
                          <span className="text-gray-500">Grade {c.estimatedGrade}</span>
                          <span className={c.roi > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtPct(c.roi)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/50 text-xs">
                    <span className="text-gray-500">Raw: {fmt(b.totalRawValue)}</span>
                    <span className="text-gray-500">Projected: {fmt(b.totalProjected)}</span>
                    <span className={b.totalProjected - b.totalRawValue - b.totalCost > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      Net: {fmt(b.totalProjected - b.totalRawValue - b.totalCost)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Service level reference */}
          <div className="mt-6">
            <h3 className="text-white font-semibold text-sm mb-3">Service Level Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 py-2 pr-3">Company</th>
                    <th className="text-left text-gray-500 py-2 pr-3">Level</th>
                    <th className="text-right text-gray-500 py-2 pr-3">Cost</th>
                    <th className="text-right text-gray-500 py-2 pr-3">Min Cards</th>
                    <th className="text-right text-gray-500 py-2">Turnaround</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(SERVICE_LEVELS) as [GradingCompany, ServiceInfo[]][]).flatMap(([co, levels]) =>
                    levels.map((l, i) => (
                      <tr key={`${co}-${l.level}`} className="border-b border-gray-800/50">
                        <td className={`py-1.5 pr-3 ${COMPANY_COLORS[co].text} ${i > 0 ? 'text-transparent' : ''}`}>{co}</td>
                        <td className="py-1.5 pr-3 text-gray-300">{l.label}</td>
                        <td className="py-1.5 pr-3 text-right text-white">${l.cost}</td>
                        <td className="py-1.5 pr-3 text-right text-gray-400">{l.minCards}</td>
                        <td className="py-1.5 text-right text-gray-400">{l.turnaround}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary view */}
      {view === 'summary' && (
        <div>
          {cards.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">Add cards to see your submission summary</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verdict breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{stats.gradeCards.length}</div>
                  <div className="text-emerald-500 text-xs font-medium">GRADE</div>
                  <div className="text-gray-500 text-xs mt-1">Strong ROI</div>
                </div>
                <div className="bg-yellow-950/30 border border-yellow-800/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.maybeCards.length}</div>
                  <div className="text-yellow-500 text-xs font-medium">MAYBE</div>
                  <div className="text-gray-500 text-xs mt-1">Marginal ROI</div>
                </div>
                <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.skipCards.length}</div>
                  <div className="text-red-500 text-xs font-medium">SKIP</div>
                  <div className="text-gray-500 text-xs mt-1">Not worth it</div>
                </div>
              </div>

              {/* Financial summary */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
                <h3 className="text-white font-semibold mb-4">Financial Summary (GRADE + MAYBE cards)</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Total Raw Value', value: fmt(stats.totalRaw), color: 'text-white' },
                    { label: 'Total Grading Cost', value: fmt(stats.totalCost), color: 'text-yellow-400' },
                    { label: 'Total Investment', value: fmt(stats.totalRaw + stats.totalCost), color: 'text-white' },
                    { label: 'Projected Graded Value', value: fmt(stats.totalProjected), color: 'text-blue-400' },
                    { label: 'Expected Profit', value: fmt(stats.totalProfit), color: stats.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Overall ROI', value: fmtPct(stats.overallRoi), color: stats.overallRoi > 0 ? 'text-emerald-400' : 'text-red-400' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{r.label}</span>
                      <span className={`font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority list */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
                <h3 className="text-white font-semibold mb-3">Priority Order (Grade First)</h3>
                <div className="space-y-1.5">
                  {cards.filter(c => c.verdict !== 'SKIP').slice(0, 10).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs font-mono w-5">#{c.priority}</span>
                        <span className="text-gray-300 truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={COMPANY_COLORS[c.recommendedCompany].text}>{c.recommendedCompany}</span>
                        <span className={c.roi > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtPct(c.roi)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <button onClick={copyPlan} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                  {copied ? 'Copied!' : 'Copy Submission Plan'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
