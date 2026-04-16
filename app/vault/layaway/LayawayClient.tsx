'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Tab = 'browse' | 'active' | 'history';
type PlanLength = 4 | 8 | 12;

interface LayawayPlan {
  id: string;
  cardSlug: string;
  cardName: string;
  player: string;
  sport: string;
  marketValue: number;
  totalCost: number; // marketValue + fee
  planLength: PlanLength;
  paymentAmount: number;
  paymentsMade: number;
  missedPayments: number;
  consecutiveMissed: number;
  startDate: string;
  lastPaymentDate: string | null;
  status: 'active' | 'completed' | 'forfeited' | 'cancelled';
  totalPaid: number;
}

interface LayawayState {
  plans: LayawayPlan[];
  walletBalance: number;
  totalCompleted: number;
  totalForfeited: number;
  totalSpentOnLayaway: number;
}

const FEE_RATES: Record<PlanLength, number> = { 4: 0.05, 8: 0.10, 12: 0.15 };
const PLAN_LABELS: Record<PlanLength, string> = {
  4: '4 Payments (5% fee)',
  8: '8 Payments (10% fee)',
  12: '12 Payments (15% fee)',
};

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getInitialState(): LayawayState {
  if (typeof window === 'undefined') {
    return { plans: [], walletBalance: 250, totalCompleted: 0, totalForfeited: 0, totalSpentOnLayaway: 0 };
  }
  try {
    const stored = localStorage.getItem('cardvault-layaway');
    if (stored) return JSON.parse(stored);
    // Try to read wallet balance from vault system
    const vault = localStorage.getItem('cardvault-wallet');
    const balance = vault ? JSON.parse(vault).balance ?? 250 : 250;
    return { plans: [], walletBalance: balance, totalCompleted: 0, totalForfeited: 0, totalSpentOnLayaway: 0 };
  } catch {
    return { plans: [], walletBalance: 250, totalCompleted: 0, totalForfeited: 0, totalSpentOnLayaway: 0 };
  }
}

function saveState(state: LayawayState) {
  try {
    localStorage.setItem('cardvault-layaway', JSON.stringify(state));
  } catch { /* ignore */ }
}

export default function LayawayClient() {
  const [state, setState] = useState<LayawayState>(getInitialState);
  const [tab, setTab] = useState<Tab>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanLength>(4);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Search cards
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      })
      .slice(0, 15);
  }, [searchQuery, sportFilter]);

  const activePlans = useMemo(() => state.plans.filter(p => p.status === 'active'), [state.plans]);
  const historyPlans = useMemo(() => state.plans.filter(p => p.status !== 'active'), [state.plans]);

  const totalOnLayaway = useMemo(() => activePlans.reduce((sum, p) => sum + (p.totalCost - p.totalPaid), 0), [activePlans]);

  // Start a layaway plan
  const startLayaway = useCallback(() => {
    if (!selectedCard) return;
    const mv = parseValue(selectedCard.estimatedValueRaw);
    const fee = FEE_RATES[selectedPlan];
    const totalCost = Math.round(mv * (1 + fee) * 100) / 100;
    const paymentAmount = Math.round((totalCost / selectedPlan) * 100) / 100;

    if (state.walletBalance < paymentAmount) {
      setToast('Insufficient wallet balance for first payment');
      return;
    }

    const plan: LayawayPlan = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      cardSlug: selectedCard.slug,
      cardName: selectedCard.name,
      player: selectedCard.player,
      sport: selectedCard.sport,
      marketValue: mv,
      totalCost,
      planLength: selectedPlan,
      paymentAmount,
      paymentsMade: 1,
      missedPayments: 0,
      consecutiveMissed: 0,
      startDate: new Date().toISOString(),
      lastPaymentDate: new Date().toISOString(),
      status: 'active',
      totalPaid: paymentAmount,
    };

    setState(prev => ({
      ...prev,
      plans: [plan, ...prev.plans],
      walletBalance: Math.round((prev.walletBalance - paymentAmount) * 100) / 100,
      totalSpentOnLayaway: Math.round((prev.totalSpentOnLayaway + paymentAmount) * 100) / 100,
    }));

    setSelectedCard(null);
    setShowConfirm(false);
    setSearchQuery('');
    setToast(`Layaway started! ${selectedPlan - 1} payments remaining.`);
    setTab('active');
  }, [selectedCard, selectedPlan, state.walletBalance]);

  // Make a payment
  const makePayment = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plans.find(p => p.id === planId);
      if (!plan || plan.status !== 'active') return prev;
      if (prev.walletBalance < plan.paymentAmount) {
        setToast('Insufficient wallet balance');
        return prev;
      }

      const newPaid = plan.totalPaid + plan.paymentAmount;
      const newPaymentsMade = plan.paymentsMade + 1;
      const isComplete = newPaymentsMade >= plan.planLength;

      return {
        ...prev,
        plans: prev.plans.map(p =>
          p.id === planId
            ? {
                ...p,
                paymentsMade: newPaymentsMade,
                totalPaid: Math.round(newPaid * 100) / 100,
                lastPaymentDate: new Date().toISOString(),
                consecutiveMissed: 0,
                status: isComplete ? 'completed' as const : 'active' as const,
              }
            : p
        ),
        walletBalance: Math.round((prev.walletBalance - plan.paymentAmount) * 100) / 100,
        totalSpentOnLayaway: Math.round((prev.totalSpentOnLayaway + plan.paymentAmount) * 100) / 100,
        totalCompleted: isComplete ? prev.totalCompleted + 1 : prev.totalCompleted,
      };
    });
    setToast('Payment made!');
  }, []);

  // Cancel a plan (50% refund)
  const cancelPlan = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plans.find(p => p.id === planId);
      if (!plan || plan.status !== 'active') return prev;
      const refund = Math.round(plan.totalPaid * 0.5 * 100) / 100;

      return {
        ...prev,
        plans: prev.plans.map(p =>
          p.id === planId ? { ...p, status: 'cancelled' as const } : p
        ),
        walletBalance: Math.round((prev.walletBalance + refund) * 100) / 100,
      };
    });
    setToast('Plan cancelled. 50% refund applied.');
  }, []);

  // Simulate missed payment (for demo purposes)
  const simulateMiss = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plans.find(p => p.id === planId);
      if (!plan || plan.status !== 'active') return prev;
      const newConsecutive = plan.consecutiveMissed + 1;
      const isForfeited = newConsecutive >= 3;

      return {
        ...prev,
        plans: prev.plans.map(p =>
          p.id === planId
            ? {
                ...p,
                missedPayments: p.missedPayments + 1,
                consecutiveMissed: newConsecutive,
                status: isForfeited ? 'forfeited' as const : 'active' as const,
              }
            : p
        ),
        totalForfeited: isForfeited ? prev.totalForfeited + 1 : prev.totalForfeited,
      };
    });
  }, []);

  const sportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'baseball': return 'bg-red-900/50 text-red-400';
      case 'basketball': return 'bg-orange-900/50 text-orange-400';
      case 'football': return 'bg-blue-900/50 text-blue-400';
      case 'hockey': return 'bg-cyan-900/50 text-cyan-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900/90 border border-emerald-700 text-emerald-200 px-4 py-2 rounded-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-emerald-400 text-lg font-bold">{formatCurrency(state.walletBalance)}</div>
          <div className="text-gray-500 text-xs">Wallet Balance</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-yellow-400 text-lg font-bold">{activePlans.length}</div>
          <div className="text-gray-500 text-xs">Active Plans</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-white text-lg font-bold">{formatCurrency(totalOnLayaway)}</div>
          <div className="text-gray-500 text-xs">Remaining Balance</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-emerald-400 text-lg font-bold">{state.totalCompleted}</div>
          <div className="text-gray-500 text-xs">Cards Acquired</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800/40 p-1 rounded-lg w-fit">
        {(['browse', 'active', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {t === 'browse' ? 'New Layaway' : t === 'active' ? `Active (${activePlans.length})` : `History (${historyPlans.length})`}
          </button>
        ))}
      </div>

      {/* Browse / New Layaway Tab */}
      {tab === 'browse' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cards by player or name..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
            </select>
          </div>

          {searchResults.length > 0 && !selectedCard && (
            <div className="space-y-2 mb-6">
              {searchResults.map(card => {
                const mv = parseValue(card.estimatedValueRaw);
                const alreadyOnLayaway = activePlans.some(p => p.cardSlug === card.slug);
                return (
                  <button
                    key={card.slug}
                    onClick={() => { if (!alreadyOnLayaway) setSelectedCard(card); }}
                    disabled={alreadyOnLayaway}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      alreadyOnLayaway
                        ? 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800/60 border-gray-700/50 hover:border-emerald-600/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium text-sm">{card.player}</span>
                        <span className="text-gray-500 text-xs ml-2">{card.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ml-2 ${sportBadgeColor(card.sport)}`}>{card.sport}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-medium text-sm">{formatCurrency(mv)}</span>
                        {alreadyOnLayaway && <span className="text-yellow-500 text-xs ml-2">On Layaway</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Plan Configuration */}
          {selectedCard && !showConfirm && (
            <div className="bg-gray-800/60 border border-emerald-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedCard.player}</h3>
                  <p className="text-gray-400 text-sm">{selectedCard.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${sportBadgeColor(selectedCard.sport)}`}>
                    {selectedCard.sport}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 text-xl font-bold">{formatCurrency(parseValue(selectedCard.estimatedValueRaw))}</div>
                  <div className="text-gray-500 text-xs">Market Value</div>
                </div>
              </div>

              <h4 className="text-white font-medium mb-3">Choose Your Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {([4, 8, 12] as PlanLength[]).map(len => {
                  const mv = parseValue(selectedCard.estimatedValueRaw);
                  const total = Math.round(mv * (1 + FEE_RATES[len]) * 100) / 100;
                  const payment = Math.round((total / len) * 100) / 100;
                  const fee = Math.round(mv * FEE_RATES[len] * 100) / 100;
                  return (
                    <button
                      key={len}
                      onClick={() => setSelectedPlan(len)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedPlan === len
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-white font-bold text-lg">{len} Payments</div>
                      <div className="text-emerald-400 font-medium">{formatCurrency(payment)}/week</div>
                      <div className="text-gray-500 text-xs mt-1">
                        Total: {formatCurrency(total)} ({FEE_RATES[len] * 100}% fee = {formatCurrency(fee)})
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Review Plan
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedCard && showConfirm && (
            <div className="bg-gray-800/60 border border-emerald-600/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold text-lg mb-4">Confirm Layaway Plan</h3>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Card</span>
                  <span className="text-white font-medium">{selectedCard.player} — {selectedCard.name}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Market Value</span>
                  <span className="text-white">{formatCurrency(parseValue(selectedCard.estimatedValueRaw))}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Layaway Fee ({FEE_RATES[selectedPlan] * 100}%)</span>
                  <span className="text-yellow-400">
                    +{formatCurrency(Math.round(parseValue(selectedCard.estimatedValueRaw) * FEE_RATES[selectedPlan] * 100) / 100)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total Cost</span>
                  <span className="text-emerald-400">
                    {formatCurrency(Math.round(parseValue(selectedCard.estimatedValueRaw) * (1 + FEE_RATES[selectedPlan]) * 100) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Payment Schedule</span>
                  <span className="text-white">{selectedPlan} weekly payments of {formatCurrency(
                    Math.round((parseValue(selectedCard.estimatedValueRaw) * (1 + FEE_RATES[selectedPlan]) / selectedPlan) * 100) / 100
                  )}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>First Payment (due now)</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(
                    Math.round((parseValue(selectedCard.estimatedValueRaw) * (1 + FEE_RATES[selectedPlan]) / selectedPlan) * 100) / 100
                  )}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Your Wallet</span>
                  <span className="text-white">{formatCurrency(state.walletBalance)}</span>
                </div>
              </div>

              <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-3 mb-4 text-sm text-yellow-300">
                Missing 3 consecutive payments forfeits your plan and all payments made. Cancel anytime for a 50% refund.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startLayaway}
                  disabled={state.walletBalance < Math.round((parseValue(selectedCard.estimatedValueRaw) * (1 + FEE_RATES[selectedPlan]) / selectedPlan) * 100) / 100}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Start Layaway &amp; Pay First Installment
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors text-sm"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* How It Works */}
          {!selectedCard && searchResults.length === 0 && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">How Card Layaway Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { step: '1', title: 'Find a Card', desc: 'Search 9,500+ real sports cards. Pick one you want.' },
                  { step: '2', title: 'Choose Plan', desc: 'Select 4, 8, or 12 weekly payments. Shorter = lower fees.' },
                  { step: '3', title: 'Make Payments', desc: 'Pay from your vault wallet each week. Track progress.' },
                  { step: '4', title: 'Card Is Yours', desc: 'All payments done? Card goes to your vault collection.' },
                ].map(s => (
                  <div key={s.step} className="text-center">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {s.step}
                    </div>
                    <div className="text-white font-medium text-sm">{s.title}</div>
                    <div className="text-gray-500 text-xs mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Plans Tab */}
      {tab === 'active' && (
        <div>
          {activePlans.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="text-gray-500 text-lg mb-2">No Active Layaway Plans</div>
              <p className="text-gray-600 text-sm mb-4">Search for a card to start your first layaway plan.</p>
              <button
                onClick={() => setTab('browse')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
              >
                Browse Cards
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activePlans.map(plan => {
                const progress = (plan.paymentsMade / plan.planLength) * 100;
                const remaining = plan.totalCost - plan.totalPaid;
                const paymentsLeft = plan.planLength - plan.paymentsMade;
                return (
                  <div key={plan.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold">{plan.player}</h3>
                        <p className="text-gray-400 text-sm">{plan.cardName}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${sportBadgeColor(plan.sport)}`}>{plan.sport}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">{formatCurrency(plan.marketValue)}</div>
                        <div className="text-gray-500 text-xs">Market Value</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{plan.paymentsMade}/{plan.planLength} payments</span>
                        <span>{Math.round(progress)}% complete</span>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-500">Per Payment</div>
                        <div className="text-white font-medium">{formatCurrency(plan.paymentAmount)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-500">Paid So Far</div>
                        <div className="text-emerald-400 font-medium">{formatCurrency(plan.totalPaid)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-500">Remaining</div>
                        <div className="text-yellow-400 font-medium">{formatCurrency(remaining)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <div className="text-gray-500">Payments Left</div>
                        <div className="text-white font-medium">{paymentsLeft}</div>
                      </div>
                    </div>

                    {/* Missed payment warning */}
                    {plan.consecutiveMissed > 0 && (
                      <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-2 mb-3 text-xs text-red-300">
                        {plan.consecutiveMissed} consecutive missed payment{plan.consecutiveMissed > 1 ? 's' : ''}. {3 - plan.consecutiveMissed} more and your plan is forfeited!
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => makePayment(plan.id)}
                        disabled={state.walletBalance < plan.paymentAmount}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Make Payment ({formatCurrency(plan.paymentAmount)})
                      </button>
                      <button
                        onClick={() => simulateMiss(plan.id)}
                        className="px-4 py-2 bg-yellow-700/50 hover:bg-yellow-700 text-yellow-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        Simulate Missed Payment
                      </button>
                      <button
                        onClick={() => cancelPlan(plan.id)}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        Cancel (50% Refund)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {historyPlans.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <div className="text-gray-500 text-lg mb-2">No Layaway History</div>
              <p className="text-gray-600 text-sm">Complete or cancel a plan to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-center">
                  <div className="text-emerald-400 text-lg font-bold">{state.totalCompleted}</div>
                  <div className="text-gray-500 text-xs">Completed</div>
                </div>
                <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 text-center">
                  <div className="text-red-400 text-lg font-bold">{state.totalForfeited}</div>
                  <div className="text-gray-500 text-xs">Forfeited</div>
                </div>
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-white text-lg font-bold">{formatCurrency(state.totalSpentOnLayaway)}</div>
                  <div className="text-gray-500 text-xs">Total Spent</div>
                </div>
              </div>

              {historyPlans.map(plan => (
                <div key={plan.id} className={`border rounded-lg p-4 ${
                  plan.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-800/30'
                    : plan.status === 'forfeited'
                      ? 'bg-red-950/20 border-red-800/30'
                      : 'bg-gray-800/40 border-gray-700/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium text-sm">{plan.player}</span>
                      <span className="text-gray-500 text-xs ml-2">{plan.cardName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">
                        {plan.paymentsMade}/{plan.planLength} payments &middot; {formatCurrency(plan.totalPaid)} paid
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        plan.status === 'completed'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : plan.status === 'forfeited'
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-gray-700 text-gray-400'
                      }`}>
                        {plan.status === 'completed' ? 'COMPLETED' : plan.status === 'forfeited' ? 'FORFEITED' : 'CANCELLED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
