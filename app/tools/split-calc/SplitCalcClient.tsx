'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── types ─────────────────────────────────────────────── */

interface Participant {
  id: number;
  name: string;
}

interface CardPull {
  id: number;
  name: string;
  value: number;
  assignedTo: number; // participant id
}

type SplitMethod = 'even' | 'proportional' | 'draft';

/* ── helpers ───────────────────────────────────────────── */

function formatCurrency(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

const SPORT_COLORS: Record<string, string> = {
  even: 'bg-blue-500/20 text-blue-400 border-blue-700/50',
  proportional: 'bg-emerald-500/20 text-emerald-400 border-emerald-700/50',
  draft: 'bg-purple-500/20 text-purple-400 border-purple-700/50',
};

/* ── component ─────────────────────────────────────────── */

export default function SplitCalcClient() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: 'Person 1' },
    { id: 2, name: 'Person 2' },
  ]);
  const [totalCost, setTotalCost] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('even');
  const [cards, setCards] = useState<CardPull[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardValue, setNewCardValue] = useState('');
  const [newCardAssigned, setNewCardAssigned] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const cost = parseFloat(totalCost) || 0;

  /* ── participant management ───────── */

  const addParticipant = useCallback(() => {
    if (participants.length >= 6) return;
    const nextId = Math.max(...participants.map(p => p.id)) + 1;
    setParticipants(prev => [...prev, { id: nextId, name: `Person ${nextId}` }]);
  }, [participants]);

  const removeParticipant = useCallback((id: number) => {
    if (participants.length <= 2) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
    setCards(prev => prev.filter(c => c.assignedTo !== id));
  }, [participants]);

  const updateName = useCallback((id: number, name: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  /* ── card management ──────────────── */

  const addCard = useCallback(() => {
    const val = parseFloat(newCardValue);
    if (!newCardName.trim() || isNaN(val) || val < 0) return;
    const id = Date.now();
    setCards(prev => [...prev, { id, name: newCardName.trim(), value: val, assignedTo: newCardAssigned }]);
    setNewCardName('');
    setNewCardValue('');
  }, [newCardName, newCardValue, newCardAssigned]);

  const removeCard = useCallback((id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  /* ── calculations ─────────────────── */

  const analysis = useMemo(() => {
    const n = participants.length;
    if (n === 0) return null;

    // Per-person card totals
    const perPerson: Record<number, { cards: CardPull[]; totalValue: number }> = {};
    participants.forEach(p => {
      perPerson[p.id] = { cards: [], totalValue: 0 };
    });
    cards.forEach(c => {
      if (perPerson[c.assignedTo]) {
        perPerson[c.assignedTo].cards.push(c);
        perPerson[c.assignedTo].totalValue += c.value;
      }
    });

    const totalCardValue = cards.reduce((s, c) => s + c.value, 0);

    // Cost share per person based on method
    const costShare: Record<number, number> = {};
    if (splitMethod === 'even') {
      const share = cost / n;
      participants.forEach(p => { costShare[p.id] = share; });
    } else if (splitMethod === 'proportional') {
      // Proportional to card value received
      participants.forEach(p => {
        const fraction = totalCardValue > 0 ? perPerson[p.id].totalValue / totalCardValue : 1 / n;
        costShare[p.id] = cost * fraction;
      });
    } else {
      // Draft: even cost, value difference settled
      const share = cost / n;
      participants.forEach(p => { costShare[p.id] = share; });
    }

    // Net position: cards received value - cost paid
    const results = participants.map(p => {
      const received = perPerson[p.id].totalValue;
      const paid = costShare[p.id];
      const net = received - paid;
      return {
        participant: p,
        cardsReceived: perPerson[p.id].cards,
        cardCount: perPerson[p.id].cards.length,
        totalReceived: received,
        costPaid: paid,
        net,
      };
    });

    // Settlement: who owes whom
    const settlements: { from: string; to: string; amount: number }[] = [];
    if (splitMethod === 'draft' || splitMethod === 'even') {
      // For even/draft: people who got more value pay those who got less
      const avgValue = totalCardValue / n;
      const debtors = results.filter(r => r.totalReceived > avgValue).map(r => ({
        name: r.participant.name,
        owes: r.totalReceived - avgValue,
      }));
      const creditors = results.filter(r => r.totalReceived < avgValue).map(r => ({
        name: r.participant.name,
        owed: avgValue - r.totalReceived,
      }));

      // Simple settlement
      let di = 0, ci = 0;
      const d = [...debtors], c = [...creditors];
      while (di < d.length && ci < c.length) {
        const amount = Math.min(d[di].owes, c[ci].owed);
        if (amount > 0.01) {
          settlements.push({ from: d[di].name, to: c[ci].name, amount });
        }
        d[di].owes -= amount;
        c[ci].owed -= amount;
        if (d[di].owes < 0.01) di++;
        if (c[ci].owed < 0.01) ci++;
      }
    }

    return {
      results,
      totalCardValue,
      totalCost: cost,
      avgPerPerson: cost / n,
      settlements,
    };
  }, [participants, cards, cost, splitMethod]);

  /* ── copy results ─────────────────── */

  const copyResults = useCallback(() => {
    if (!analysis) return;
    const lines = [
      `Card Split Summary`,
      `──────────────────`,
      `Total Cost: ${formatCurrency(analysis.totalCost)}`,
      `Total Card Value: ${formatCurrency(analysis.totalCardValue)}`,
      `Split Method: ${splitMethod}`,
      `Participants: ${participants.length}`,
      `Cards: ${cards.length}`,
      '',
      ...analysis.results.map(r =>
        `${r.participant.name}: ${r.cardCount} cards (${formatCurrency(r.totalReceived)}) — Paid ${formatCurrency(r.costPaid)} — Net: ${formatCurrency(r.net)}`
      ),
      '',
      ...(analysis.settlements.length > 0
        ? ['Settlements:', ...analysis.settlements.map(s => `  ${s.from} pays ${s.to}: ${formatCurrency(s.amount)}`)]
        : ['No settlements needed.']),
      '',
      'Generated by CardVault Split Calculator — cardvault-two.vercel.app/tools/split-calc',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [analysis, splitMethod, participants, cards]);

  /* ── render ───────────────────────── */

  return (
    <div className="space-y-8">
      {/* Step 1: Participants */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Step 1: Who&apos;s Splitting?</h2>
        <p className="text-gray-400 text-sm mb-4">Add 2-6 people splitting the purchase.</p>

        <div className="space-y-3 mb-4">
          {participants.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <input
                type="text"
                value={p.name}
                onChange={e => updateName(p.id, e.target.value)}
                className="flex-1 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Name"
              />
              {participants.length > 2 && (
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                  title="Remove"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {participants.length < 6 && (
          <button
            onClick={addParticipant}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            + Add Person
          </button>
        )}
      </section>

      {/* Step 2: Total Cost & Method */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Step 2: Purchase Details</h2>
        <p className="text-gray-400 text-sm mb-4">How much did you spend total, and how do you want to split?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1 block">Total Cost ($)</label>
            <input
              type="number"
              value={totalCost}
              onChange={e => setTotalCost(e.target.value)}
              placeholder="e.g. 200"
              min="0"
              step="0.01"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1 block">Split Method</label>
            <div className="flex gap-2">
              {([
                { key: 'even' as SplitMethod, label: 'Even Split', desc: 'Everyone pays equally' },
                { key: 'proportional' as SplitMethod, label: 'By Value', desc: 'Pay based on what you keep' },
                { key: 'draft' as SplitMethod, label: 'Draft + Settle', desc: 'Even cost, settle value difference' },
              ] as const).map(m => (
                <button
                  key={m.key}
                  onClick={() => setSplitMethod(m.key)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    splitMethod === m.key
                      ? SPORT_COLORS[m.key]
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                  title={m.desc}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 text-xs text-gray-400">
          {splitMethod === 'even' && (
            <p><strong className="text-white">Even Split:</strong> Total cost divided equally. Each person pays {formatCurrency(cost / (participants.length || 1))} regardless of which cards they take.</p>
          )}
          {splitMethod === 'proportional' && (
            <p><strong className="text-white">By Value:</strong> Each person pays proportional to the value of cards they receive. Get more value = pay more of the cost.</p>
          )}
          {splitMethod === 'draft' && (
            <p><strong className="text-white">Draft + Settle:</strong> Everyone pays an equal share ({formatCurrency(cost / (participants.length || 1))}), then value differences are settled with cash transfers.</p>
          )}
        </div>
      </section>

      {/* Step 3: Log Cards */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Step 3: Log Cards Pulled</h2>
        <p className="text-gray-400 text-sm mb-4">Add each card and assign it to who keeps it.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={newCardName}
            onChange={e => setNewCardName(e.target.value)}
            placeholder="Card name (e.g. 2024 Prizm Caleb Williams RC)"
            className="flex-1 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyDown={e => e.key === 'Enter' && addCard()}
          />
          <input
            type="number"
            value={newCardValue}
            onChange={e => setNewCardValue(e.target.value)}
            placeholder="Value ($)"
            min="0"
            step="0.01"
            className="w-28 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyDown={e => e.key === 'Enter' && addCard()}
          />
          <select
            value={newCardAssigned}
            onChange={e => setNewCardAssigned(parseInt(e.target.value))}
            className="w-36 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {participants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={addCard}
            disabled={!newCardName.trim() || !newCardValue}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {cards.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {cards.map(c => {
              const owner = participants.find(p => p.id === c.assignedTo);
              return (
                <div key={c.id} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm truncate block">{c.name}</span>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">{formatCurrency(c.value)}</span>
                  <span className="text-gray-400 text-xs bg-gray-700/50 px-2 py-0.5 rounded">{owner?.name || '?'}</span>
                  <button onClick={() => removeCard(c.id)} className="text-red-400 hover:text-red-300 text-sm">&times;</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No cards logged yet. Add cards from your break, box, or lot above.
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">{cards.length} card{cards.length !== 1 ? 's' : ''} logged</span>
            <span className="text-emerald-400 font-medium">
              Total: {formatCurrency(cards.reduce((s, c) => s + c.value, 0))}
            </span>
          </div>
        )}
      </section>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowResults(true)}
          disabled={participants.length < 2 || cost <= 0}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-blue-900/30"
        >
          Calculate Split
        </button>
      </div>

      {/* Results */}
      {showResults && analysis && (
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Split Results</h2>
            <button
              onClick={copyResults}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Cost', value: formatCurrency(analysis.totalCost), color: 'text-white' },
              { label: 'Total Card Value', value: formatCurrency(analysis.totalCardValue), color: 'text-emerald-400' },
              { label: 'ROI', value: analysis.totalCost > 0 ? `${(((analysis.totalCardValue - analysis.totalCost) / analysis.totalCost) * 100).toFixed(1)}%` : '—', color: analysis.totalCardValue >= analysis.totalCost ? 'text-green-400' : 'text-red-400' },
              { label: 'Cards', value: `${cards.length}`, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">{s.label}</div>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Per-person breakdown */}
          <div className="space-y-3">
            {analysis.results.map(r => (
              <div key={r.participant.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">
                      {r.participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{r.participant.name}</span>
                  </div>
                  <div className={`text-sm font-bold ${r.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {r.net >= 0 ? '+' : ''}{formatCurrency(r.net)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-500 mb-0.5">Cards</div>
                    <div className="text-white font-medium">{r.cardCount}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-500 mb-0.5">Value Received</div>
                    <div className="text-emerald-400 font-medium">{formatCurrency(r.totalReceived)}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                    <div className="text-gray-500 mb-0.5">Cost Paid</div>
                    <div className="text-amber-400 font-medium">{formatCurrency(r.costPaid)}</div>
                  </div>
                </div>
                {r.cardsReceived.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.cardsReceived.map(c => (
                      <span key={c.id} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                        {c.name} ({formatCurrency(c.value)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Settlements */}
          {analysis.settlements.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
              <h3 className="text-amber-400 font-bold text-sm mb-2">Settlements Needed</h3>
              <p className="text-gray-400 text-xs mb-3">To make the split fair, these payments should be made:</p>
              <div className="space-y-2">
                {analysis.settlements.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{s.from}</span>
                    <span className="text-gray-500">pays</span>
                    <span className="text-white font-medium">{s.to}</span>
                    <span className="text-amber-400 font-bold ml-auto">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.settlements.length === 0 && cards.length > 0 && splitMethod !== 'proportional' && (
            <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4">
              <h3 className="text-green-400 font-bold text-sm mb-1">No Settlements Needed</h3>
              <p className="text-gray-400 text-xs">Everyone received equal value — no cash transfers required.</p>
            </div>
          )}
        </section>
      )}

      {/* How It Works */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Add Participants', desc: 'Enter 2-6 people splitting the purchase. Name each person for easy tracking.', color: 'bg-blue-500' },
            { step: '2', title: 'Set Cost & Method', desc: 'Enter total cost and choose: even split, proportional to value, or draft + settle.', color: 'bg-emerald-500' },
            { step: '3', title: 'Log & Calculate', desc: 'Add each card pulled with its value. Assign to whoever keeps it. Hit Calculate.', color: 'bg-purple-500' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className={`w-8 h-8 ${s.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {s.step}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{s.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Method Guide */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Which Split Method Should You Use?</h2>
        <div className="space-y-4">
          {[
            {
              method: 'Even Split',
              best: 'Box splits where you draft cards afterward',
              how: 'Everyone pays the same amount. Cards are assigned by agreement, draft, or random.',
              example: '4 friends buy a $400 hobby box. Each pays $100. You draft cards in snake order.',
              color: 'border-blue-700/50 bg-blue-950/20',
            },
            {
              method: 'By Value (Proportional)',
              best: 'When one person wants specific expensive cards',
              how: 'Your cost share is proportional to the total value of cards you take. Take 60% of the value, pay 60% of the cost.',
              example: 'You split a lot and you want the $200 card. Your friend takes $50 in base cards. You pay 80% of the lot price.',
              color: 'border-emerald-700/50 bg-emerald-950/20',
            },
            {
              method: 'Draft + Settle',
              best: 'Group breaks where everyone pays the same spot price',
              how: 'Everyone pays equally, but if someone gets more valuable cards, they pay the difference to those who got less.',
              example: '3 people each pay $50 for a break. Person A pulls a $100 hit. Person B and C got $20 each. Person A pays the difference.',
              color: 'border-purple-700/50 bg-purple-950/20',
            },
          ].map(m => (
            <div key={m.method} className={`border rounded-xl p-4 ${m.color}`}>
              <div className="text-white font-medium text-sm mb-1">{m.method}</div>
              <div className="text-gray-400 text-xs mb-2"><strong className="text-gray-300">Best for:</strong> {m.best}</div>
              <div className="text-gray-400 text-xs mb-1"><strong className="text-gray-300">How:</strong> {m.how}</div>
              <div className="text-gray-500 text-xs italic">{m.example}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/break-roi', title: 'Break ROI Tracker', desc: 'Track P&L across group breaks' },
            { href: '/tools/break-spot', title: 'Break Spot Picker', desc: 'Find the best team spots in breaks' },
            { href: '/tools/box-break', title: 'Box Break Calculator', desc: 'Calculate expected value per box' },
            { href: '/tools/ebay-fee-calc', title: 'eBay Fee Calculator', desc: 'See what you net after fees' },
            { href: '/tools/flip-calc', title: 'Flip Profit Calculator', desc: 'Calculate profit on card flips' },
            { href: '/tools/collection-value', title: 'Collection Value', desc: 'Estimate your collection worth' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl p-3 transition-colors group"
            >
              <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">{t.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
