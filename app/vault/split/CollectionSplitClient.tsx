'use client';

import { useState, useMemo, useCallback } from 'react';

/* ─── types ─── */
interface SplitCard {
  id: string;
  name: string;
  value: number;
}

type SplitMethod = 'balanced' | 'round-robin' | 'random';

interface PersonShare {
  name: string;
  cards: SplitCard[];
  total: number;
}

/* ─── helpers ─── */
function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function splitBalanced(cards: SplitCard[], numPeople: number): PersonShare[] {
  const shares: PersonShare[] = Array.from({ length: numPeople }, (_, i) => ({
    name: `Person ${i + 1}`,
    cards: [],
    total: 0,
  }));

  // Sort cards by value descending, assign each to person with lowest total
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  for (const card of sorted) {
    const minPerson = shares.reduce((min, p) => (p.total < min.total ? p : min), shares[0]);
    minPerson.cards.push(card);
    minPerson.total += card.value;
  }
  return shares;
}

function splitRoundRobin(cards: SplitCard[], numPeople: number): PersonShare[] {
  const shares: PersonShare[] = Array.from({ length: numPeople }, (_, i) => ({
    name: `Person ${i + 1}`,
    cards: [],
    total: 0,
  }));

  const sorted = [...cards].sort((a, b) => b.value - a.value);
  sorted.forEach((card, i) => {
    const person = shares[i % numPeople];
    person.cards.push(card);
    person.total += card.value;
  });
  return shares;
}

function splitRandom(cards: SplitCard[], numPeople: number): PersonShare[] {
  const shares: PersonShare[] = Array.from({ length: numPeople }, (_, i) => ({
    name: `Person ${i + 1}`,
    cards: [],
    total: 0,
  }));

  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  shuffled.forEach((card, i) => {
    const person = shares[i % numPeople];
    person.cards.push(card);
    person.total += card.value;
  });
  return shares;
}

const PERSON_COLORS = [
  { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-400', bar: 'bg-blue-500' },
  { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  { bg: 'bg-amber-950/40', border: 'border-amber-800/40', text: 'text-amber-400', bar: 'bg-amber-500' },
  { bg: 'bg-purple-950/40', border: 'border-purple-800/40', text: 'text-purple-400', bar: 'bg-purple-500' },
];

const SAMPLE_CARDS: SplitCard[] = [
  { id: 's1', name: '2020 Prizm Justin Herbert RC', value: 150 },
  { id: 's2', name: '2018 Topps Chrome Shohei Ohtani RC', value: 300 },
  { id: 's3', name: '1986 Fleer Michael Jordan RC', value: 5000 },
  { id: 's4', name: '2019 Mosaic Ja Morant RC', value: 80 },
  { id: 's5', name: '2020 Upper Deck Alexis Lafreniere YG', value: 40 },
  { id: 's6', name: '2017 Prizm Patrick Mahomes RC', value: 800 },
  { id: 's7', name: '2024 Topps Chrome Paul Skenes RC', value: 50 },
  { id: 's8', name: '2019 Prizm Zion Williamson RC', value: 120 },
  { id: 's9', name: '1993 SP Derek Jeter RC', value: 400 },
  { id: 's10', name: '2024 Panini Prizm Caitlin Clark RC', value: 200 },
];

/* ─── component ─── */
export default function CollectionSplitClient() {
  const [cards, setCards] = useState<SplitCard[]>([]);
  const [numPeople, setNumPeople] = useState(2);
  const [method, setMethod] = useState<SplitMethod>('balanced');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showResult, setShowResult] = useState(false);

  const addCard = useCallback(() => {
    if (!newName.trim() || !newValue.trim()) return;
    const value = parseFloat(newValue.replace(/[$,]/g, ''));
    if (isNaN(value) || value <= 0) return;
    setCards(prev => [...prev, { id: generateId(), name: newName.trim(), value }]);
    setNewName('');
    setNewValue('');
    setShowResult(false);
  }, [newName, newValue]);

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setShowResult(false);
  }, []);

  const loadSample = useCallback(() => {
    setCards(SAMPLE_CARDS);
    setShowResult(false);
  }, []);

  const importFromVault = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('cardvault-vault');
      if (!raw) return;
      const vault = JSON.parse(raw);
      if (Array.isArray(vault)) {
        const imported = vault.map((c: { name?: string; value?: number }, i: number) => ({
          id: `v${i}`,
          name: c.name || `Card ${i + 1}`,
          value: c.value || 10,
        }));
        if (imported.length > 0) {
          setCards(imported.slice(0, 100));
          setShowResult(false);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const result = useMemo(() => {
    if (!showResult || cards.length < 2) return null;
    switch (method) {
      case 'balanced': return splitBalanced(cards, numPeople);
      case 'round-robin': return splitRoundRobin(cards, numPeople);
      case 'random': return splitRandom(cards, numPeople);
    }
  }, [showResult, cards, numPeople, method]);

  const totalValue = useMemo(() => cards.reduce((a, c) => a + c.value, 0), [cards]);
  const perfectShare = totalValue / numPeople;

  const fairnessScore = useMemo(() => {
    if (!result) return 0;
    const maxDiff = Math.max(...result.map(p => Math.abs(p.total - perfectShare)));
    if (totalValue === 0) return 100;
    return Math.max(0, 100 - (maxDiff / totalValue) * 100);
  }, [result, perfectShare, totalValue]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">People</label>
            <div className="flex gap-1">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => { setNumPeople(n); setShowResult(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    numPeople === n
                      ? 'bg-teal-900/50 border border-teal-700/50 text-teal-400'
                      : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Split Method</label>
            <div className="flex gap-1">
              {([
                { value: 'balanced', label: 'Value-Balanced' },
                { value: 'round-robin', label: 'Round Robin' },
                { value: 'random', label: 'Random' },
              ] as const).map(m => (
                <button
                  key={m.value}
                  onClick={() => { setMethod(m.value); setShowResult(false); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    method === m.value
                      ? 'bg-teal-900/50 border border-teal-700/50 text-teal-400'
                      : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add card form */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            placeholder="Card name (e.g. 2020 Prizm Herbert RC)"
            className="flex-1 bg-gray-900/80 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
          />
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            placeholder="Value ($)"
            className="w-24 bg-gray-900/80 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={addCard}
            className="px-4 py-2 bg-teal-900/50 border border-teal-700/50 text-teal-400 rounded-lg text-sm font-medium hover:brightness-125 transition-all"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={loadSample} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Load sample cards
          </button>
          <span className="text-gray-700">|</span>
          <button onClick={importFromVault} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Import from Vault
          </button>
          {cards.length > 0 && (
            <>
              <span className="text-gray-700">|</span>
              <button onClick={() => { setCards([]); setShowResult(false); }} className="text-xs text-red-500/70 hover:text-red-400 transition-colors">
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">{cards.length} cards &middot; Total: {fmt(totalValue)}</h3>
            <span className="text-xs text-gray-500">Perfect share: {fmt(perfectShare)}/person</span>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {cards.map(card => (
              <div key={card.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-900/30 rounded-lg">
                <span className="text-sm text-gray-300 truncate flex-1 mr-2">{card.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-white">{fmt(card.value)}</span>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split button */}
      {cards.length >= 2 && (
        <button
          onClick={() => setShowResult(true)}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Split {cards.length} Cards Between {numPeople} People
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Fairness score */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 text-center">
            <div className="text-xs text-gray-500 mb-1">Fairness Score</div>
            <div className={`text-4xl font-bold ${
              fairnessScore >= 95 ? 'text-emerald-400' :
              fairnessScore >= 85 ? 'text-green-400' :
              fairnessScore >= 70 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {fairnessScore.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fairnessScore >= 95 ? 'Excellent — nearly perfect split' :
               fairnessScore >= 85 ? 'Good — minor imbalance' :
               fairnessScore >= 70 ? 'Fair — consider cash equalization' : 'Uneven — use cash equalizer below'}
            </div>
          </div>

          {/* Person shares */}
          <div className="grid grid-cols-1 gap-4">
            {result.map((person, i) => {
              const color = PERSON_COLORS[i];
              const diff = person.total - perfectShare;
              const barWidth = totalValue > 0 ? (person.total / totalValue) * 100 : 0;

              return (
                <div key={i} className={`${color.bg} border ${color.border} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.bar}`} />
                      <h3 className={`font-semibold ${color.text}`}>{person.name}</h3>
                      <span className="text-xs text-gray-500">{person.cards.length} cards</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{fmt(person.total)}</div>
                      <div className={`text-xs ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {diff > 0 ? `+${fmt(diff)} over` : diff < 0 ? `${fmt(Math.abs(diff))} under` : 'exact'} avg
                      </div>
                    </div>
                  </div>

                  {/* Value bar */}
                  <div className="h-2 bg-gray-700/50 rounded-full mb-3 overflow-hidden">
                    <div className={`h-full ${color.bar} rounded-full transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                  </div>

                  {/* Card list */}
                  <div className="space-y-1">
                    {person.cards.map(card => (
                      <div key={card.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 truncate flex-1 mr-2">{card.name}</span>
                        <span className="text-gray-300 font-medium shrink-0">{fmt(card.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cash equalizer */}
          {fairnessScore < 100 && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Cash Equalizer</h3>
              <p className="text-xs text-gray-500 mb-3">
                To make the split perfectly fair, the following cash transfers would be needed:
              </p>
              <div className="space-y-2">
                {result.map((person, i) => {
                  const diff = person.total - perfectShare;
                  if (Math.abs(diff) < 1) return null;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className={PERSON_COLORS[i].text}>{person.name}</span>
                      <span className={diff > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {diff > 0 ? `Pays ${fmt(diff)}` : `Receives ${fmt(Math.abs(diff))}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">✂️</div>
          <p className="font-medium">Add cards to get started</p>
          <p className="text-sm mt-1">Enter card names and values, or load sample data</p>
        </div>
      )}
    </div>
  );
}
