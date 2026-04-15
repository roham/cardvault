'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

type TransactionType = 'buy' | 'sell';

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  timestamp: string;
}

interface ShowSession {
  id: string;
  name: string;
  date: string;
  budget: number;
  transactions: Transaction[];
}

const STORAGE_KEY = 'cardvault_show_budget';

function loadSessions(): ShowSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ShowSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatCurrency(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

export default function ShowBudgetTracker() {
  const [sessions, setSessions] = useState<ShowSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('200');
  const [txType, setTxType] = useState<TransactionType>('buy');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');

  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    if (loaded.length > 0) setActiveSessionId(loaded[0].id);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createSession = useCallback(() => {
    if (!newName) return;
    const session: ShowSession = {
      id: genId(),
      name: newName,
      date: new Date().toISOString().split('T')[0],
      budget: parseFloat(newBudget) || 200,
      transactions: [],
    };
    const next = [session, ...sessions];
    setSessions(next);
    saveSessions(next);
    setActiveSessionId(session.id);
    setShowNewSession(false);
    setNewName('');
    setNewBudget('200');
  }, [newName, newBudget, sessions]);

  const addTransaction = useCallback(() => {
    if (!txDesc || !txAmount || !activeSessionId) return;
    const tx: Transaction = {
      id: genId(),
      type: txType,
      description: txDesc,
      amount: parseFloat(txAmount) || 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const next = sessions.map(s => {
      if (s.id !== activeSessionId) return s;
      return { ...s, transactions: [tx, ...s.transactions] };
    });
    setSessions(next);
    saveSessions(next);
    setTxDesc('');
    setTxAmount('');
  }, [txType, txDesc, txAmount, activeSessionId, sessions]);

  const removeTransaction = useCallback((txId: string) => {
    if (!activeSessionId) return;
    const next = sessions.map(s => {
      if (s.id !== activeSessionId) return s;
      return { ...s, transactions: s.transactions.filter(t => t.id !== txId) };
    });
    setSessions(next);
    saveSessions(next);
  }, [activeSessionId, sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const next = sessions.filter(s => s.id !== sessionId);
    setSessions(next);
    saveSessions(next);
    if (activeSessionId === sessionId) {
      setActiveSessionId(next.length > 0 ? next[0].id : null);
    }
  }, [sessions, activeSessionId]);

  const stats = useMemo(() => {
    if (!activeSession) return { spent: 0, earned: 0, net: 0, remaining: 0, items: 0 };
    const spent = activeSession.transactions.filter(t => t.type === 'buy').reduce((s, t) => s + t.amount, 0);
    const earned = activeSession.transactions.filter(t => t.type === 'sell').reduce((s, t) => s + t.amount, 0);
    return {
      spent,
      earned,
      net: earned - spent,
      remaining: activeSession.budget - spent + earned,
      items: activeSession.transactions.length,
    };
  }, [activeSession]);

  const budgetPct = activeSession ? Math.min(100, (stats.spent / activeSession.budget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Session Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSessionId(s.id)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              activeSessionId === s.id
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {s.name} ({s.date})
          </button>
        ))}
        <button
          onClick={() => setShowNewSession(!showNewSession)}
          className="px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
        >
          + New Show
        </button>
      </div>

      {/* New Session Form */}
      {showNewSession && (
        <div className="bg-gray-900 border border-emerald-800/50 rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-500 mb-1 block">Show Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g., Dallas Card Show"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 mb-1 block">Budget ($)</label>
            <input
              type="number"
              value={newBudget}
              onChange={e => setNewBudget(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <button
            onClick={createSession}
            disabled={!newName}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-medium rounded-lg text-sm"
          >
            Start Show
          </button>
        </div>
      )}

      {activeSession ? (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Spent</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(stats.spent)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Earned</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(stats.earned)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Net P&L</div>
              <div className={`text-xl font-bold ${stats.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(stats.net)}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Budget Left</div>
              <div className={`text-xl font-bold ${stats.remaining >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatCurrency(stats.remaining)}
              </div>
            </div>
          </div>

          {/* Budget Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Budget: {formatCurrency(activeSession.budget)}</span>
              <span>{budgetPct.toFixed(0)}% used</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTxType('buy')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  txType === 'buy'
                    ? 'bg-red-900/50 border-red-700/50 text-red-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTxType('sell')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  txType === 'sell'
                    ? 'bg-green-900/50 border-green-700/50 text-green-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                Sell
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={txDesc}
                onChange={e => setTxDesc(e.target.value)}
                placeholder="e.g., 2024 Topps Chrome Hobby Box"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                onKeyDown={e => e.key === 'Enter' && addTransaction()}
              />
              <input
                type="number"
                value={txAmount}
                onChange={e => setTxAmount(e.target.value)}
                placeholder="$"
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                onKeyDown={e => e.key === 'Enter' && addTransaction()}
              />
              <button
                onClick={addTransaction}
                disabled={!txDesc || !txAmount}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-medium rounded-lg text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Transaction List */}
          {activeSession.transactions.length > 0 ? (
            <div className="space-y-2">
              {activeSession.transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      tx.type === 'buy' ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'
                    }`}>
                      {tx.type === 'buy' ? 'BUY' : 'SELL'}
                    </span>
                    <div>
                      <span className="text-sm text-white">{tx.description}</span>
                      <span className="text-xs text-gray-600 ml-2">{tx.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${tx.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="text-gray-600 hover:text-red-400 text-xs"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No transactions yet. Start adding buys and sells!</p>
            </div>
          )}

          {/* Delete Session */}
          <div className="text-right">
            <button
              onClick={() => deleteSession(activeSession.id)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Delete this show session
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500">Create a new show session above to start tracking!</p>
        </div>
      )}
    </div>
  );
}
