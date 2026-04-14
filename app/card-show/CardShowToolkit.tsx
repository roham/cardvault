'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HaulItem {
  id: string;
  description: string;
  price: number;
  estimatedValue: number;
  sport: string;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'cardvault-card-show-haul';

function loadHaul(): HaulItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHaul(items: HaulItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

/* ------------------------------------------------------------------ */
/*  Quick Tools Grid                                                   */
/* ------------------------------------------------------------------ */

const QUICK_TOOLS = [
  { href: '/tools', icon: '🔎', label: 'Price Check', desc: 'Look up any card value' },
  { href: '/tools/flip-calc', icon: '💸', label: 'Flip Calculator', desc: 'Calculate profit on a flip' },
  { href: '/tools/centering-calc', icon: '📐', label: 'Centering Check', desc: 'Is it worth grading?' },
  { href: '/tools/grading-roi', icon: '💰', label: 'Grading ROI', desc: 'Grade or sell raw?' },
  { href: '/tools/compare', icon: '⚖️', label: 'Compare Cards', desc: 'Side-by-side comparison' },
  { href: '/tools/collection-value', icon: '💎', label: 'Collection Value', desc: 'Total your collection' },
  { href: '/tools/set-checklist', icon: '✅', label: 'Set Checklist', desc: 'Track set completion' },
  { href: '/tools/watchlist', icon: '👀', label: 'Price Watchlist', desc: 'Check price alerts' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CardShowToolkit() {
  const [haul, setHaul] = useState<HaulItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [estValue, setEstValue] = useState('');
  const [sport, setSport] = useState('baseball');

  useEffect(() => { setHaul(loadHaul()); }, []);

  const totalSpent = haul.reduce((s, i) => s + i.price, 0);
  const totalEstValue = haul.reduce((s, i) => s + i.estimatedValue, 0);
  const profit = totalEstValue - totalSpent;

  const addItem = () => {
    if (!desc.trim() || !price) return;
    const item: HaulItem = {
      id: Date.now().toString(36),
      description: desc.trim(),
      price: parseFloat(price) || 0,
      estimatedValue: parseFloat(estValue) || 0,
      sport,
      timestamp: Date.now(),
    };
    const updated = [item, ...haul];
    setHaul(updated);
    saveHaul(updated);
    setDesc('');
    setPrice('');
    setEstValue('');
    setShowAdd(false);
  };

  const removeItem = (id: string) => {
    const updated = haul.filter(i => i.id !== id);
    setHaul(updated);
    saveHaul(updated);
  };

  const clearHaul = () => {
    setHaul([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sportIcons: Record<string, string> = {
    baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', pokemon: '⚡', other: '🃏',
  };

  return (
    <div className="space-y-8">
      {/* Quick Tools Grid */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Quick Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_TOOLS.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-4 bg-gray-800/60 border border-gray-700 rounded-xl hover:border-blue-600 hover:bg-gray-800 transition-all text-center group"
            >
              <div className="text-2xl mb-1">{tool.icon}</div>
              <div className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">{tool.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Haul Tracker */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Show Haul Tracker</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Log Purchase
          </button>
        </div>

        {/* Stats Bar */}
        {haul.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Spent</div>
              <div className="text-lg font-bold text-red-400">${totalSpent.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Est. Value</div>
              <div className="text-lg font-bold text-green-400">${totalEstValue.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Net</div>
              <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAdd && (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 mb-4 space-y-3">
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Card description (e.g. 2024 Topps Chrome Ohtani PSA 9)"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Price Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Est. Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={estValue}
                  onChange={e => setEstValue(e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sport</label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="baseball">Baseball</option>
                  <option value="basketball">Basketball</option>
                  <option value="football">Football</option>
                  <option value="hockey">Hockey</option>
                  <option value="pokemon">Pokemon</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addItem}
                disabled={!desc.trim() || !price}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add to Haul
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Haul List */}
        {haul.length > 0 ? (
          <div className="space-y-2">
            {haul.map(item => {
              const itemProfit = item.estimatedValue - item.price;
              return (
                <div key={item.id} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-lg px-4 py-3">
                  <span className="text-lg">{sportIcons[item.sport] || '🃏'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.description}</div>
                    <div className="text-xs text-gray-500">
                      Paid ${item.price.toFixed(2)}
                      {item.estimatedValue > 0 && (
                        <> · Value ${item.estimatedValue.toFixed(2)} · <span className={itemProfit >= 0 ? 'text-green-400' : 'text-red-400'}>{itemProfit >= 0 ? '+' : ''}{itemProfit.toFixed(2)}</span></>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm">
                    &times;
                  </button>
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-500">{haul.length} item{haul.length !== 1 ? 's' : ''}</span>
              <button onClick={clearHaul} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                Clear all
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">No purchases logged yet. Tap &quot;Log Purchase&quot; to start tracking your show haul.</p>
          </div>
        )}
      </section>

      {/* Tips */}
      <section className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="font-bold text-white mb-3">Card Show Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <div className="font-medium text-gray-300 mb-1">Before You Go</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Set a budget and stick to it</li>
              <li>Check your want list and set checklists</li>
              <li>Bring a penny sleeve + toploader supply</li>
              <li>Charge your phone — you will need it for comps</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-300 mb-1">At the Show</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Walk the entire show before buying</li>
              <li>Check centering before buying raw cards to grade</li>
              <li>Always check eBay sold comps (not listings)</li>
              <li>Negotiate — especially near the end of the day</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
