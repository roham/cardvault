'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type GradingCompany = 'PSA' | 'BGS' | 'CGC' | 'SGC';
type QueueStatus = 'queue' | 'submitted' | 'returned';

interface QueueCard {
  id: string;
  name: string;
  rawValue: number;
  expectedGrade: number;
  company: GradingCompany;
  status: QueueStatus;
  dateAdded: string;
  dateSubmitted?: string;
  dateReturned?: string;
  actualGrade?: number;
}

const GRADING_COSTS: Record<GradingCompany, number> = {
  PSA: 50,
  BGS: 35,
  CGC: 30,
  SGC: 30,
};

const GRADE_MULTIPLIERS: Record<number, number> = {
  10: 5.0,
  9.5: 3.5,
  9: 2.0,
  8.5: 1.4,
  8: 1.1,
  7.5: 0.9,
  7: 0.75,
  6: 0.6,
};

const STORAGE_KEY = 'cardvault_grading_queue';

function loadQueue(): QueueCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveQueue(cards: QueueCard[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch {}
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmt(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

function getGradeMultiplier(grade: number): number {
  return GRADE_MULTIPLIERS[grade] ?? 0.5;
}

function getEstimatedGradedValue(rawValue: number, grade: number): number {
  return rawValue * getGradeMultiplier(grade);
}

function getRoiColor(roi: number): string {
  if (roi > 50) return 'text-emerald-400';
  if (roi > 0) return 'text-yellow-400';
  return 'text-red-400';
}

function getStatusBadge(status: QueueStatus): { label: string; color: string } {
  switch (status) {
    case 'queue': return { label: 'In Queue', color: 'bg-blue-900/50 text-blue-400 border-blue-800/50' };
    case 'submitted': return { label: 'Submitted', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-800/50' };
    case 'returned': return { label: 'Returned', color: 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50' };
  }
}

export default function GradingQueueClient() {
  const [cards, setCards] = useState<QueueCard[]>([]);
  const [tab, setTab] = useState<QueueStatus>('queue');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [expectedGrade, setExpectedGrade] = useState('9');
  const [company, setCompany] = useState<GradingCompany>('PSA');

  useEffect(() => { setCards(loadQueue()); }, []);

  const update = useCallback((next: QueueCard[]) => {
    setCards(next);
    saveQueue(next);
  }, []);

  const addCard = useCallback(() => {
    const val = parseFloat(rawValue);
    if (!name.trim() || isNaN(val) || val <= 0) return;
    const card: QueueCard = {
      id: genId(),
      name: name.trim(),
      rawValue: val,
      expectedGrade: parseFloat(expectedGrade),
      company,
      status: 'queue',
      dateAdded: new Date().toISOString().split('T')[0],
    };
    update([...cards, card]);
    setName('');
    setRawValue('');
    setShowAdd(false);
  }, [name, rawValue, expectedGrade, company, cards, update]);

  const moveToSubmitted = useCallback((id: string) => {
    update(cards.map(c => c.id === id ? { ...c, status: 'submitted' as const, dateSubmitted: new Date().toISOString().split('T')[0] } : c));
  }, [cards, update]);

  const moveToReturned = useCallback((id: string, actualGrade?: number) => {
    update(cards.map(c => c.id === id ? { ...c, status: 'returned' as const, dateReturned: new Date().toISOString().split('T')[0], actualGrade: actualGrade ?? c.expectedGrade } : c));
  }, [cards, update]);

  const removeCard = useCallback((id: string) => {
    update(cards.filter(c => c.id !== id));
  }, [cards, update]);

  const filtered = useMemo(() => cards.filter(c => c.status === tab), [cards, tab]);

  const stats = useMemo(() => {
    const queued = cards.filter(c => c.status === 'queue');
    const submitted = cards.filter(c => c.status === 'submitted');
    const returned = cards.filter(c => c.status === 'returned');

    const queueCost = queued.reduce((s, c) => s + GRADING_COSTS[c.company], 0);
    const queueValue = queued.reduce((s, c) => s + c.rawValue, 0);
    const queueEstGradedValue = queued.reduce((s, c) => s + getEstimatedGradedValue(c.rawValue, c.expectedGrade), 0);

    const submittedCost = submitted.reduce((s, c) => s + GRADING_COSTS[c.company], 0);

    const returnedCost = returned.reduce((s, c) => s + GRADING_COSTS[c.company], 0);
    const returnedActualValue = returned.reduce((s, c) => s + getEstimatedGradedValue(c.rawValue, c.actualGrade ?? c.expectedGrade), 0);
    const returnedRawValue = returned.reduce((s, c) => s + c.rawValue, 0);

    return {
      queueCount: queued.length,
      queueCost,
      queueValue,
      queueEstGradedValue,
      queueEstProfit: queueEstGradedValue - queueValue - queueCost,
      submittedCount: submitted.length,
      submittedCost,
      returnedCount: returned.length,
      returnedCost,
      returnedActualValue,
      returnedRawValue,
      returnedProfit: returnedActualValue - returnedRawValue - returnedCost,
    };
  }, [cards]);

  const tabs: { key: QueueStatus; label: string; count: number }[] = [
    { key: 'queue', label: 'Queue', count: stats.queueCount },
    { key: 'submitted', label: 'Submitted', count: stats.submittedCount },
    { key: 'returned', label: 'Returned', count: stats.returnedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{cards.length}</div>
          <div className="text-xs text-gray-500">Total Cards</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{fmt(stats.queueCost)}</div>
          <div className="text-xs text-gray-500">Queue Cost</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${getRoiColor(stats.queueEstProfit)}`}>{fmt(stats.queueEstProfit)}</div>
          <div className="text-xs text-gray-500">Est. Profit (Queue)</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${getRoiColor(stats.returnedProfit)}`}>{fmt(stats.returnedProfit)}</div>
          <div className="text-xs text-gray-500">Actual Profit (Returned)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          + Add Card
        </button>
      </div>

      {/* Add Card Form */}
      {showAdd && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Add Card to Queue</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Card Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 2020 Prizm Justin Herbert RC"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Raw Value ($)</label>
              <input
                type="number"
                value={rawValue}
                onChange={e => setRawValue(e.target.value)}
                placeholder="e.g. 100"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expected Grade</label>
              <select
                value={expectedGrade}
                onChange={e => setExpectedGrade(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6].map(g => (
                  <option key={g} value={g}>{g}{g === 10 ? ' (Gem Mint)' : g === 9 ? ' (Mint)' : g === 8 ? ' (NM-MT)' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grading Company</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value as GradingCompany)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                {(Object.entries(GRADING_COSTS) as [GradingCompany, number][]).map(([co, cost]) => (
                  <option key={co} value={co}>{co} — ${cost}/card</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {name && rawValue && parseFloat(rawValue) > 0 && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-2">Submission Preview</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">Grading Cost</div>
                  <div className="text-red-400 font-medium">{fmt(GRADING_COSTS[company])}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Est. Graded Value</div>
                  <div className="text-emerald-400 font-medium">{fmt(getEstimatedGradedValue(parseFloat(rawValue), parseFloat(expectedGrade)))}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Value Increase</div>
                  <div className="text-white font-medium">{fmt(getEstimatedGradedValue(parseFloat(rawValue), parseFloat(expectedGrade)) - parseFloat(rawValue))}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Net Profit</div>
                  <div className={`font-bold ${getRoiColor(getEstimatedGradedValue(parseFloat(rawValue), parseFloat(expectedGrade)) - parseFloat(rawValue) - GRADING_COSTS[company])}`}>
                    {fmt(getEstimatedGradedValue(parseFloat(rawValue), parseFloat(expectedGrade)) - parseFloat(rawValue) - GRADING_COSTS[company])}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={addCard}
              disabled={!name.trim() || !rawValue || parseFloat(rawValue) <= 0}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors"
            >
              Add to Queue
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Card List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(c => {
            const gradedValue = getEstimatedGradedValue(c.rawValue, c.actualGrade ?? c.expectedGrade);
            const profit = gradedValue - c.rawValue - GRADING_COSTS[c.company];
            const badge = getStatusBadge(c.status);

            return (
              <div key={c.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{c.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>{badge.label}</span>
                      <span className="text-xs text-gray-500">{c.company}</span>
                      <span className="text-xs text-gray-500">&middot;</span>
                      <span className="text-xs text-gray-500">Expected: {c.expectedGrade}</span>
                      {c.actualGrade !== undefined && (
                        <>
                          <span className="text-xs text-gray-500">&middot;</span>
                          <span className={`text-xs font-medium ${c.actualGrade >= c.expectedGrade ? 'text-emerald-400' : 'text-red-400'}`}>
                            Actual: {c.actualGrade}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeCard(c.id)} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Raw Value</div>
                    <div className="text-white">{fmt(c.rawValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Grade Cost</div>
                    <div className="text-red-400">{fmt(GRADING_COSTS[c.company])}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Est. Graded</div>
                    <div className="text-emerald-400">{fmt(gradedValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Net Profit</div>
                    <div className={`font-bold ${getRoiColor(profit)}`}>{fmt(profit)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700/50">
                  {c.status === 'queue' && (
                    <button
                      onClick={() => moveToSubmitted(c.id)}
                      className="px-3 py-1.5 bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-400 border border-yellow-800/50 rounded-lg text-xs font-medium transition-colors"
                    >
                      Mark as Submitted
                    </button>
                  )}
                  {c.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => {
                          const grade = prompt('Enter actual grade received (e.g. 9, 9.5, 10):');
                          if (grade) moveToReturned(c.id, parseFloat(grade));
                        }}
                        className="px-3 py-1.5 bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-800/50 rounded-lg text-xs font-medium transition-colors"
                      >
                        Mark as Returned
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">{tab === 'queue' ? '📦' : tab === 'submitted' ? '📮' : '✅'}</div>
          <p className="text-lg mb-1">
            {tab === 'queue' ? 'No cards in queue' : tab === 'submitted' ? 'No cards submitted' : 'No returned cards yet'}
          </p>
          <p className="text-sm">
            {tab === 'queue' ? 'Add cards above to plan your next grading submission' : 'Move cards from the queue when you mail them out'}
          </p>
        </div>
      )}

      {/* Grading Cost Reference */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Grading Cost Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left pb-3 font-medium">Company</th>
                <th className="text-right pb-3 font-medium">Cost/Card</th>
                <th className="text-right pb-3 font-medium">Turnaround</th>
                <th className="text-right pb-3 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {[
                { co: 'PSA', cost: '$50', turn: '4-6 months', best: 'Highest resale value, most recognized' },
                { co: 'BGS', cost: '$35', turn: '3-5 months', best: 'Sub-grades, modern cards, Pristine 10' },
                { co: 'CGC', cost: '$30', turn: '2-4 months', best: 'Budget option, inner sleeve, growing market' },
                { co: 'SGC', cost: '$30', turn: '1-3 months', best: 'Fastest turnaround, vintage cards, tuxedo slab' },
              ].map((r, i) => (
                <tr key={i} className="border-t border-gray-700/50">
                  <td className="py-3 text-white font-medium">{r.co}</td>
                  <td className="py-3 text-right text-emerald-400">{r.cost}</td>
                  <td className="py-3 text-right text-gray-400">{r.turn}</td>
                  <td className="py-3 text-right text-gray-500 text-xs max-w-[200px]">{r.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Grading Submission Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Minimum Value Threshold', tip: 'Only grade cards worth $30+ raw. Below that, grading fees eat most of the value increase.' },
            { title: 'Batch for Savings', tip: 'Most companies offer bulk discounts at 10+ cards. Save up cards and submit together.' },
            { title: 'Clean Before Submitting', tip: 'Use a microfiber cloth to remove fingerprints and dust. Clean cards grade higher.' },
            { title: 'Use Card Savers', tip: 'Ship in Card Saver 1 semi-rigids (not top loaders). PSA specifically requests this format.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-white font-medium text-sm mb-1">{t.title}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{t.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
