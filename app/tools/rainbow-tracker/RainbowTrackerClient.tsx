'use client';

import { useState, useEffect, useMemo } from 'react';

/* ---------- Types ---------- */

interface Parallel {
  name: string;
  printRun: string; // e.g. "/99", "1/1", "Unlimited"
  numericRun: number; // for sorting, 0 = unlimited, 1 = 1/1
  color: string; // tailwind gradient or bg color
  estimatedValueMultiplier: number; // multiplier over base card
  owned: boolean;
}

interface SetTemplate {
  id: string;
  name: string;
  sport: string;
  year: number;
  parallels: Omit<Parallel, 'owned'>[];
}

/* ---------- Set Templates ---------- */

const SET_TEMPLATES: SetTemplate[] = [
  {
    id: 'topps-chrome-2024',
    name: '2024 Topps Chrome',
    sport: 'Baseball',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Refractor', printRun: 'Unlimited', numericRun: 0, color: 'from-slate-400 to-slate-300', estimatedValueMultiplier: 2 },
      { name: 'Pink Refractor', printRun: '/299', numericRun: 299, color: 'from-pink-500 to-pink-400', estimatedValueMultiplier: 4 },
      { name: 'Purple Refractor', printRun: '/250', numericRun: 250, color: 'from-purple-600 to-purple-400', estimatedValueMultiplier: 5 },
      { name: 'Blue Refractor', printRun: '/150', numericRun: 150, color: 'from-blue-600 to-blue-400', estimatedValueMultiplier: 8 },
      { name: 'Green Refractor', printRun: '/99', numericRun: 99, color: 'from-green-600 to-green-400', estimatedValueMultiplier: 12 },
      { name: 'Gold Refractor', printRun: '/50', numericRun: 50, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 25 },
      { name: 'Orange Refractor', printRun: '/25', numericRun: 25, color: 'from-orange-600 to-orange-400', estimatedValueMultiplier: 50 },
      { name: 'Red Refractor', printRun: '/5', numericRun: 5, color: 'from-red-700 to-red-500', estimatedValueMultiplier: 150 },
      { name: 'Superfractor', printRun: '1/1', numericRun: 1, color: 'from-yellow-400 to-amber-300', estimatedValueMultiplier: 500 },
    ],
  },
  {
    id: 'panini-prizm-2024-nba',
    name: '2024-25 Panini Prizm (NBA)',
    sport: 'Basketball',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Silver Prizm', printRun: 'Unlimited', numericRun: 0, color: 'from-slate-300 to-white', estimatedValueMultiplier: 3 },
      { name: 'Red White Blue', printRun: 'Unlimited', numericRun: 0, color: 'from-red-500 via-white to-blue-500', estimatedValueMultiplier: 2.5 },
      { name: 'Blue', printRun: '/199', numericRun: 199, color: 'from-blue-600 to-blue-400', estimatedValueMultiplier: 6 },
      { name: 'Green', printRun: '/75', numericRun: 75, color: 'from-green-600 to-green-400', estimatedValueMultiplier: 15 },
      { name: 'Orange', printRun: '/49', numericRun: 49, color: 'from-orange-600 to-orange-400', estimatedValueMultiplier: 25 },
      { name: 'Purple', printRun: '/35', numericRun: 35, color: 'from-purple-600 to-purple-400', estimatedValueMultiplier: 40 },
      { name: 'Gold', printRun: '/10', numericRun: 10, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 100 },
      { name: 'Black', printRun: '1/1', numericRun: 1, color: 'from-gray-900 to-gray-700', estimatedValueMultiplier: 400 },
    ],
  },
  {
    id: 'panini-prizm-2024-nfl',
    name: '2024 Panini Prizm (NFL)',
    sport: 'Football',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Silver Prizm', printRun: 'Unlimited', numericRun: 0, color: 'from-slate-300 to-white', estimatedValueMultiplier: 3 },
      { name: 'Red White Blue', printRun: 'Unlimited', numericRun: 0, color: 'from-red-500 via-white to-blue-500', estimatedValueMultiplier: 2 },
      { name: 'Blue', printRun: '/199', numericRun: 199, color: 'from-blue-600 to-blue-400', estimatedValueMultiplier: 5 },
      { name: 'Neon Green', printRun: '/75', numericRun: 75, color: 'from-lime-500 to-green-400', estimatedValueMultiplier: 12 },
      { name: 'Orange', printRun: '/49', numericRun: 49, color: 'from-orange-600 to-orange-400', estimatedValueMultiplier: 20 },
      { name: 'Purple', printRun: '/35', numericRun: 35, color: 'from-purple-600 to-purple-400', estimatedValueMultiplier: 35 },
      { name: 'Gold', printRun: '/10', numericRun: 10, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 80 },
      { name: 'Black', printRun: '1/1', numericRun: 1, color: 'from-gray-900 to-gray-700', estimatedValueMultiplier: 350 },
    ],
  },
  {
    id: 'bowman-chrome-2024',
    name: '2024 Bowman Chrome',
    sport: 'Baseball',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Refractor', printRun: 'Unlimited', numericRun: 0, color: 'from-slate-400 to-slate-300', estimatedValueMultiplier: 2 },
      { name: 'Sky Blue Refractor', printRun: '/402', numericRun: 402, color: 'from-sky-400 to-sky-300', estimatedValueMultiplier: 3 },
      { name: 'Green Refractor', printRun: '/99', numericRun: 99, color: 'from-green-600 to-green-400', estimatedValueMultiplier: 10 },
      { name: 'Blue Refractor', printRun: '/75', numericRun: 75, color: 'from-blue-600 to-blue-400', estimatedValueMultiplier: 12 },
      { name: 'Gold Refractor', printRun: '/50', numericRun: 50, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 20 },
      { name: 'Orange Refractor', printRun: '/25', numericRun: 25, color: 'from-orange-600 to-orange-400', estimatedValueMultiplier: 40 },
      { name: 'Red Refractor', printRun: '/5', numericRun: 5, color: 'from-red-700 to-red-500', estimatedValueMultiplier: 120 },
      { name: 'Superfractor', printRun: '1/1', numericRun: 1, color: 'from-yellow-400 to-amber-300', estimatedValueMultiplier: 400 },
    ],
  },
  {
    id: 'donruss-optic-2024',
    name: '2024-25 Donruss Optic',
    sport: 'Basketball',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Holo', printRun: 'Unlimited', numericRun: 0, color: 'from-indigo-400 to-violet-300', estimatedValueMultiplier: 2.5 },
      { name: 'Purple', printRun: '/149', numericRun: 149, color: 'from-purple-600 to-purple-400', estimatedValueMultiplier: 5 },
      { name: 'Blue', printRun: '/49', numericRun: 49, color: 'from-blue-600 to-blue-400', estimatedValueMultiplier: 15 },
      { name: 'Red', printRun: '/25', numericRun: 25, color: 'from-red-600 to-red-400', estimatedValueMultiplier: 30 },
      { name: 'Green', printRun: '/5', numericRun: 5, color: 'from-green-600 to-green-400', estimatedValueMultiplier: 100 },
      { name: 'Gold', printRun: '1/1', numericRun: 1, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 300 },
    ],
  },
  {
    id: 'select-2024-nfl',
    name: '2024 Panini Select (NFL)',
    sport: 'Football',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'Silver Prizm', printRun: 'Unlimited', numericRun: 0, color: 'from-slate-300 to-white', estimatedValueMultiplier: 2 },
      { name: 'Tie-Dye', printRun: '/25', numericRun: 25, color: 'from-pink-500 via-blue-400 to-green-400', estimatedValueMultiplier: 40 },
      { name: 'Gold', printRun: '/10', numericRun: 10, color: 'from-yellow-600 to-yellow-400', estimatedValueMultiplier: 80 },
      { name: 'Green', printRun: '/5', numericRun: 5, color: 'from-green-600 to-green-400', estimatedValueMultiplier: 150 },
      { name: 'Black', printRun: '1/1', numericRun: 1, color: 'from-gray-900 to-gray-700', estimatedValueMultiplier: 400 },
    ],
  },
  {
    id: 'upper-deck-2024-nhl',
    name: '2024-25 Upper Deck',
    sport: 'Hockey',
    year: 2024,
    parallels: [
      { name: 'Base', printRun: 'Unlimited', numericRun: 0, color: 'from-gray-500 to-gray-400', estimatedValueMultiplier: 1 },
      { name: 'French', printRun: 'Unlimited', numericRun: 0, color: 'from-blue-400 to-red-400', estimatedValueMultiplier: 1.5 },
      { name: 'Exclusives', printRun: '/100', numericRun: 100, color: 'from-amber-500 to-amber-400', estimatedValueMultiplier: 8 },
      { name: 'High Gloss', printRun: '/10', numericRun: 10, color: 'from-yellow-500 to-yellow-300', estimatedValueMultiplier: 50 },
      { name: 'Clear Cut', printRun: '/25', numericRun: 25, color: 'from-sky-300 to-transparent', estimatedValueMultiplier: 30 },
    ],
  },
];

const STORAGE_KEY = 'cardvault-rainbow-tracker';

interface SavedRainbow {
  id: string;
  setId: string;
  playerName: string;
  baseValue: number;
  owned: boolean[];
  createdAt: string;
}

/* ---------- Component ---------- */

export default function RainbowTrackerClient() {
  const [selectedSet, setSelectedSet] = useState<string>(SET_TEMPLATES[0].id);
  const [playerName, setPlayerName] = useState('');
  const [baseValue, setBaseValue] = useState<string>('5');
  const [ownedMap, setOwnedMap] = useState<Record<number, boolean>>({});
  const [savedRainbows, setSavedRainbows] = useState<SavedRainbow[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const template = SET_TEMPLATES.find(s => s.id === selectedSet)!;
  const baseVal = parseFloat(baseValue) || 0;

  // Load saved rainbows from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedRainbows(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Build parallels with owned state
  const parallels: Parallel[] = useMemo(() => {
    return template.parallels.map((p, i) => ({
      ...p,
      owned: ownedMap[i] ?? false,
    }));
  }, [template, ownedMap]);

  const ownedCount = parallels.filter(p => p.owned).length;
  const totalCount = parallels.length;
  const completionPct = Math.round((ownedCount / totalCount) * 100);

  const estimatedTotalCost = parallels.reduce((sum, p) => sum + p.estimatedValueMultiplier * baseVal, 0);
  const ownedValue = parallels.filter(p => p.owned).reduce((sum, p) => sum + p.estimatedValueMultiplier * baseVal, 0);
  const remainingCost = estimatedTotalCost - ownedValue;

  function toggleOwned(index: number) {
    setOwnedMap(prev => ({ ...prev, [index]: !prev[index] }));
  }

  function saveRainbow() {
    if (!playerName.trim()) return;
    const rainbow: SavedRainbow = {
      id: `${Date.now()}`,
      setId: selectedSet,
      playerName: playerName.trim(),
      baseValue: baseVal,
      owned: parallels.map(p => p.owned),
      createdAt: new Date().toISOString(),
    };
    const updated = [rainbow, ...savedRainbows.filter(r => !(r.setId === selectedSet && r.playerName === playerName.trim()))].slice(0, 20);
    setSavedRainbows(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function loadRainbow(rainbow: SavedRainbow) {
    setSelectedSet(rainbow.setId);
    setPlayerName(rainbow.playerName);
    setBaseValue(rainbow.baseValue.toString());
    const map: Record<number, boolean> = {};
    rainbow.owned.forEach((owned, i) => { map[i] = owned; });
    setOwnedMap(map);
    setShowSaved(false);
  }

  function deleteRainbow(id: string) {
    const updated = savedRainbows.filter(r => r.id !== id);
    setSavedRainbows(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function resetOwned() {
    setOwnedMap({});
  }

  // Share text
  const shareText = `${playerName || 'My'} ${template.name} Rainbow: ${ownedCount}/${totalCount} (${completionPct}%) | cardvault-two.vercel.app/tools/rainbow-tracker`;

  return (
    <div className="space-y-8">
      {/* Set & Player Selection */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Choose Your Rainbow</h2>

        {/* Set Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Card Set</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SET_TEMPLATES.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedSet(s.id); setOwnedMap({}); }}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  selectedSet === s.id
                    ? 'bg-pink-900/30 border-pink-700/50 text-white'
                    : 'bg-gray-900/60 border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.sport} - {s.parallels.length} parallels</div>
              </button>
            ))}
          </div>
        </div>

        {/* Player Name & Base Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="e.g., Paul Skenes"
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Base Card Value ($)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={baseValue}
              onChange={e => setBaseValue(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveRainbow}
            disabled={!playerName.trim()}
            className="px-4 py-2 bg-pink-700 hover:bg-pink-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Progress
          </button>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            {showSaved ? 'Hide' : 'Load'} Saved ({savedRainbows.length})
          </button>
          <button
            onClick={resetOwned}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(shareText); }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            Copy Share Text
          </button>
        </div>
      </div>

      {/* Saved Rainbows Dropdown */}
      {showSaved && savedRainbows.length > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Saved Rainbows</h3>
          <div className="space-y-2">
            {savedRainbows.map(r => {
              const t = SET_TEMPLATES.find(s => s.id === r.setId);
              const ownCount = r.owned.filter(Boolean).length;
              return (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-gray-900/60 rounded-xl border border-gray-700/50">
                  <button onClick={() => loadRainbow(r)} className="text-left flex-1">
                    <div className="text-white text-sm font-medium">{r.playerName}</div>
                    <div className="text-gray-500 text-xs">{t?.name} - {ownCount}/{r.owned.length} ({Math.round(ownCount / r.owned.length * 100)}%)</div>
                  </button>
                  <button onClick={() => deleteRainbow(r.id)} className="text-gray-500 hover:text-red-400 text-xs ml-2">Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {playerName || 'Player'} — {template.name}
          </h2>
          <div className={`text-2xl font-bold ${completionPct === 100 ? 'text-yellow-400' : completionPct >= 50 ? 'text-green-400' : 'text-gray-400'}`}>
            {completionPct}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-900 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPct === 100 ? 'bg-gradient-to-r from-yellow-600 via-pink-500 to-purple-500' :
              'bg-gradient-to-r from-pink-600 to-purple-500'
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/60 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs">Owned</div>
            <div className="text-white font-bold">{ownedCount} / {totalCount}</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs">Owned Value</div>
            <div className="text-green-400 font-bold">${ownedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs">Remaining Cost</div>
            <div className="text-amber-400 font-bold">${remainingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs">Total Rainbow</div>
            <div className="text-white font-bold">${estimatedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        {/* Parallel Checklist */}
        <div className="space-y-2">
          {parallels.map((p, i) => {
            const estValue = p.estimatedValueMultiplier * baseVal;
            return (
              <button
                key={i}
                onClick={() => toggleOwned(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  p.owned
                    ? 'bg-green-900/20 border-green-700/50'
                    : 'bg-gray-900/60 border-gray-700/50 hover:bg-gray-800/60'
                }`}
              >
                {/* Color swatch */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex-shrink-0`} />

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{p.name}</span>
                    {p.owned && <span className="text-green-400 text-xs font-bold">OWNED</span>}
                  </div>
                  <div className="text-gray-500 text-xs">{p.printRun}</div>
                </div>

                {/* Value */}
                <div className="text-right">
                  <div className={`text-sm font-bold ${p.owned ? 'text-green-400' : 'text-gray-400'}`}>
                    ${estValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-gray-600 text-xs">{p.estimatedValueMultiplier}x base</div>
                </div>

                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  p.owned ? 'bg-green-600 border-green-500' : 'border-gray-600'
                }`}>
                  {p.owned && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rainbow Completion Celebration */}
      {completionPct === 100 && (
        <div className="bg-gradient-to-r from-yellow-900/30 via-pink-900/30 to-purple-900/30 border border-yellow-700/50 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🌈</div>
          <h3 className="text-xl font-bold text-yellow-400 mb-1">Rainbow Complete!</h3>
          <p className="text-gray-300 text-sm">
            You own every parallel of {playerName || 'this card'}! Total collection value: ${estimatedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}.
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Rainbow Chasing Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="bg-gray-900/60 rounded-xl p-4">
            <div className="text-white font-semibold mb-1">Start from the top</div>
            <p>Buy the 1/1 and lowest-numbered parallels first. These are hardest to find — if one never surfaces, you don&apos;t want to have already spent on the easier ones.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <div className="text-white font-semibold mb-1">Set price alerts</div>
            <p>Use eBay saved searches with notifications for specific parallels. Many low-print cards sell at odd hours when competition is low.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <div className="text-white font-semibold mb-1">Join breaker communities</div>
            <p>Card breakers often pull low-numbered parallels. Join their Discord/Facebook groups and request first dibs on your player.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <div className="text-white font-semibold mb-1">Be patient with 1/1s</div>
            <p>Superfractors and 1/1s can take months or years to surface. Don&apos;t overpay out of desperation — another copy doesn&apos;t exist, but it will eventually be listed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
