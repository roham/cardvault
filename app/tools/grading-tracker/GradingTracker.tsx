'use client';

import { useState, useEffect, useMemo } from 'react';

interface GradingSubmission {
  id: string;
  cardName: string;
  company: 'PSA' | 'BGS' | 'CGC' | 'SGC';
  service: string;
  submittedDate: string;
  estimatedReturn: string;
  status: 'submitted' | 'received' | 'grading' | 'shipped' | 'complete';
  rawValue: number;
  gradingCost: number;
  expectedGrade: string;
  actualGrade?: string;
  gradedValue?: number;
  notes: string;
}

const companies = [
  { id: 'PSA' as const, name: 'PSA', color: 'text-red-400', bg: 'bg-red-950/30 border-red-800/50' },
  { id: 'BGS' as const, name: 'BGS/Beckett', color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/50' },
  { id: 'CGC' as const, name: 'CGC', color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-800/50' },
  { id: 'SGC' as const, name: 'SGC', color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-800/50' },
];

const serviceTiers: Record<string, { label: string; days: string; cost: string }[]> = {
  PSA: [
    { label: 'Value', days: '90-150 days', cost: '$20/card' },
    { label: 'Regular', days: '65-90 days', cost: '$50/card' },
    { label: 'Express', days: '20-30 days', cost: '$100/card' },
    { label: 'Super Express', days: '5-10 days', cost: '$150/card' },
    { label: 'Walk-Through', days: '1-3 days', cost: '$300/card' },
  ],
  BGS: [
    { label: 'Economy', days: '60-120 days', cost: '$22/card' },
    { label: 'Standard', days: '30-60 days', cost: '$40/card' },
    { label: 'Express', days: '10-20 days', cost: '$100/card' },
    { label: 'Premium', days: '2-5 days', cost: '$250/card' },
  ],
  CGC: [
    { label: 'Economy', days: '75-150 days', cost: '$15/card' },
    { label: 'Standard', days: '30-60 days', cost: '$25/card' },
    { label: 'Express', days: '10-15 days', cost: '$60/card' },
    { label: 'Walk-Through', days: '2-3 days', cost: '$150/card' },
  ],
  SGC: [
    { label: 'Economy', days: '45-60 days', cost: '$15/card' },
    { label: 'Regular', days: '20-30 days', cost: '$25/card' },
    { label: 'Express', days: '5-10 days', cost: '$50/card' },
  ],
};

const statusSteps = [
  { key: 'submitted', label: 'Submitted', icon: '📤' },
  { key: 'received', label: 'Received', icon: '📬' },
  { key: 'grading', label: 'Grading', icon: '🔍' },
  { key: 'shipped', label: 'Shipped Back', icon: '📦' },
  { key: 'complete', label: 'Complete', icon: '✅' },
];

let nextId = 0;

export default function GradingTracker() {
  const [submissions, setSubmissions] = useState<GradingSubmission[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [cardName, setCardName] = useState('');
  const [company, setCompany] = useState<GradingSubmission['company']>('PSA');
  const [service, setService] = useState('');
  const [submittedDate, setSubmittedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawValue, setRawValue] = useState(0);
  const [gradingCost, setGradingCost] = useState(0);
  const [expectedGrade, setExpectedGrade] = useState('PSA 9');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cardvault-grading-tracker');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSubmissions(parsed);
      nextId = parsed.length;
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cardvault-grading-tracker', JSON.stringify(submissions));
    }
  }, [submissions, mounted]);

  const resetForm = () => {
    setCardName('');
    setCompany('PSA');
    setService('');
    setSubmittedDate(new Date().toISOString().split('T')[0]);
    setRawValue(0);
    setGradingCost(0);
    setExpectedGrade('PSA 9');
    setNotes('');
    setEditingId(null);
  };

  const addSubmission = () => {
    if (!cardName) return;
    const tiers = serviceTiers[company];
    const tier = tiers.find(t => t.label === service) || tiers[0];
    const daysStr = tier.days.split('-')[1]?.replace(/\D/g, '') || '90';
    const estDays = parseInt(daysStr);
    const estReturn = new Date(submittedDate);
    estReturn.setDate(estReturn.getDate() + estDays);

    if (editingId) {
      setSubmissions(prev => prev.map(s => s.id === editingId ? {
        ...s, cardName, company, service: service || tier.label,
        submittedDate, estimatedReturn: estReturn.toISOString().split('T')[0],
        rawValue, gradingCost, expectedGrade, notes,
      } : s));
    } else {
      const sub: GradingSubmission = {
        id: `grading-${++nextId}`,
        cardName, company, service: service || tier.label,
        submittedDate, estimatedReturn: estReturn.toISOString().split('T')[0],
        status: 'submitted', rawValue, gradingCost, expectedGrade, notes,
      };
      setSubmissions(prev => [sub, ...prev]);
    }
    resetForm();
    setShowForm(false);
  };

  const updateStatus = (id: string, status: GradingSubmission['status']) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateGrade = (id: string, actualGrade: string, gradedValue: number) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, actualGrade, gradedValue, status: 'complete' } : s));
  };

  const removeSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status !== 'complete').length;
    const complete = submissions.filter(s => s.status === 'complete').length;
    const totalCost = submissions.reduce((sum, s) => sum + s.gradingCost, 0);
    const totalRawValue = submissions.reduce((sum, s) => sum + s.rawValue, 0);
    const totalGradedValue = submissions.filter(s => s.gradedValue).reduce((sum, s) => sum + (s.gradedValue || 0), 0);
    const totalInvested = totalRawValue + totalCost;
    const roi = totalInvested > 0 && totalGradedValue > 0 ? ((totalGradedValue - totalInvested) / totalInvested) * 100 : 0;
    return { total, pending, complete, totalCost, totalRawValue, totalGradedValue, totalInvested, roi };
  }, [submissions]);

  if (!mounted) return <div className="text-gray-400 text-center py-10">Loading tracker...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Total Submissions</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Grading Costs</div>
          <div className="text-2xl font-bold text-red-400">${stats.totalCost.toFixed(0)}</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Grading ROI</div>
          <div className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.complete > 0 ? `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(0)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Add New Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          + Track New Grading Submission
        </button>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Submission' : 'New Grading Submission'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Card Name</label>
              <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g., 2023 Topps Chrome Wemby RC" className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grading Company</label>
              <select value={company} onChange={e => { setCompany(e.target.value as GradingSubmission['company']); setService(''); }} className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 outline-none">
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Service Tier</label>
              <select value={service} onChange={e => setService(e.target.value)} className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 outline-none">
                <option value="">Select tier...</option>
                {serviceTiers[company].map(t => <option key={t.label} value={t.label}>{t.label} — {t.days} ({t.cost})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date Submitted</label>
              <input type="date" value={submittedDate} onChange={e => setSubmittedDate(e.target.value)} className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expected Grade</label>
              <input type="text" value={expectedGrade} onChange={e => setExpectedGrade(e.target.value)} placeholder="PSA 9" className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Raw Value (what you paid)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input type="number" min="0" step="0.01" value={rawValue || ''} onChange={e => setRawValue(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grading Cost</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input type="number" min="0" step="0.01" value={gradingCost || ''} onChange={e => setGradingCost(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., sharp corners, slight edge wear..." className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={addSubmission} disabled={!cardName} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors">
              {editingId ? 'Update' : 'Add Submission'}
            </button>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map(sub => {
            const stepIndex = statusSteps.findIndex(s => s.key === sub.status);
            const companyInfo = companies.find(c => c.id === sub.company)!;
            const daysOut = Math.floor((Date.now() - new Date(sub.submittedDate).getTime()) / 86400000);
            const profit = sub.gradedValue ? sub.gradedValue - sub.rawValue - sub.gradingCost : null;

            return (
              <div key={sub.id} className={`border rounded-2xl p-5 ${companyInfo.bg}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${companyInfo.color} bg-gray-900/60 px-2 py-0.5 rounded`}>{sub.company}</span>
                      <span className="text-xs text-gray-500">{sub.service}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{sub.cardName}</h3>
                    {sub.notes && <p className="text-gray-400 text-sm mt-1">{sub.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sub.status}
                      onChange={e => updateStatus(sub.id, e.target.value as GradingSubmission['status'])}
                      className="px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      {statusSteps.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                    </select>
                    <button onClick={() => removeSubmission(sub.id)} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-1 mb-4">
                  {statusSteps.map((step, i) => (
                    <div key={step.key} className="flex-1">
                      <div className={`h-2 rounded-full ${i <= stepIndex ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                      <div className={`text-[10px] mt-1 text-center ${i <= stepIndex ? 'text-emerald-400' : 'text-gray-600'}`}>{step.label}</div>
                    </div>
                  ))}
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Submitted</span>
                    <div className="text-white">{new Date(sub.submittedDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Days Out</span>
                    <div className="text-white">{daysOut} days</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Raw Value</span>
                    <div className="text-white">${sub.rawValue.toFixed(0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Grading Cost</span>
                    <div className="text-red-400">${sub.gradingCost.toFixed(0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Expected</span>
                    <div className="text-amber-400">{sub.expectedGrade}</div>
                  </div>
                </div>

                {/* Grade Entry for complete */}
                {sub.status === 'complete' && !sub.actualGrade && (
                  <div className="mt-4 p-3 bg-gray-900/60 rounded-xl">
                    <p className="text-sm text-gray-400 mb-2">Card returned! Enter the actual grade:</p>
                    <div className="flex gap-2">
                      <input type="text" placeholder="PSA 10" className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 outline-none" id={`grade-${sub.id}`} />
                      <input type="number" placeholder="Graded value" className="w-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 outline-none" id={`value-${sub.id}`} />
                      <button onClick={() => {
                        const gradeEl = document.getElementById(`grade-${sub.id}`) as HTMLInputElement;
                        const valueEl = document.getElementById(`value-${sub.id}`) as HTMLInputElement;
                        if (gradeEl.value) updateGrade(sub.id, gradeEl.value, parseFloat(valueEl.value) || 0);
                      }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">Save</button>
                    </div>
                  </div>
                )}

                {/* Results for graded */}
                {sub.actualGrade && (
                  <div className="mt-4 p-3 bg-gray-900/60 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏅</span>
                        <div>
                          <div className="text-white font-bold">Grade: {sub.actualGrade}</div>
                          <div className="text-gray-400 text-sm">Expected: {sub.expectedGrade}</div>
                        </div>
                      </div>
                      {profit !== null && (
                        <div className="text-right">
                          <div className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(0)} profit
                          </div>
                          <div className="text-gray-400 text-xs">${sub.rawValue} raw + ${sub.gradingCost} grading = ${(sub.rawValue + sub.gradingCost).toFixed(0)} invested</div>
                          {sub.gradedValue ? <div className="text-gray-400 text-xs">Graded value: ${sub.gradedValue.toFixed(0)}</div> : null}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/60 border border-gray-700 rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-400">No grading submissions yet. Add your first card above!</p>
          <p className="text-gray-500 text-sm mt-2">Track cards sent to PSA, BGS, CGC, or SGC and monitor their status.</p>
        </div>
      )}

      {/* Turnaround Reference */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Current Turnaround Times (Estimated)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(serviceTiers).map(([co, tiers]) => (
            <div key={co} className="bg-gray-900/60 rounded-xl p-4">
              <h3 className={`font-bold mb-3 ${companies.find(c => c.id === co)?.color}`}>{co}</h3>
              <div className="space-y-2">
                {tiers.map(t => (
                  <div key={t.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{t.label}</span>
                    <span className="text-white">{t.days} <span className="text-gray-500 ml-2">{t.cost}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">Turnaround times are estimates and may vary. Check each company&apos;s website for current timelines. Prices are per-card and do not include return shipping.</p>
      </div>
    </div>
  );
}
