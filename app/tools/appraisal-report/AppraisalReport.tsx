'use client';

import { useState, useMemo, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface AppraisalItem {
  id: string;
  name: string;
  year: number;
  set: string;
  sport: string;
  condition: string;
  estimatedValue: number;
  notes: string;
  isCustom: boolean;
  slug?: string;
}

const CONDITIONS = [
  'PSA 10 (Gem Mint)',
  'PSA 9 (Mint)',
  'PSA 8 (NM-MT)',
  'PSA 7 (NM)',
  'BGS 9.5 (Gem Mint)',
  'BGS 9 (Mint)',
  'CGC 10 (Pristine)',
  'CGC 9.5 (Gem Mint)',
  'SGC 10 (Gold Label)',
  'Raw - Mint',
  'Raw - Near Mint',
  'Raw - Excellent',
  'Raw - Very Good',
  'Raw - Good',
  'Raw - Fair',
  'Raw - Poor',
];

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, '')) || 0;
}

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

let nextId = 1;
function genId(): string { return `ai-${nextId++}`; }

export default function AppraisalReport() {
  const [items, setItems] = useState<AppraisalItem[]>([]);
  const [query, setQuery] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [purpose, setPurpose] = useState('Insurance Documentation');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customCondition, setCustomCondition] = useState('Raw - Near Mint');
  const [customNotes, setCustomNotes] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  function addFromDB(card: typeof sportsCards[0]) {
    const rawVal = parseValue(card.estimatedValueRaw);
    const gemVal = parseValue(card.estimatedValueGem);
    const item: AppraisalItem = {
      id: genId(),
      name: card.name,
      year: card.year,
      set: card.set,
      sport: card.sport,
      condition: 'Raw - Near Mint',
      estimatedValue: rawVal > 0 ? rawVal : gemVal,
      notes: '',
      isCustom: false,
      slug: card.slug,
    };
    setItems(prev => [...prev, item]);
    setQuery('');
  }

  function addCustom() {
    if (!customName) return;
    const item: AppraisalItem = {
      id: genId(),
      name: customName,
      year: parseInt(customYear) || new Date().getFullYear(),
      set: 'Custom Entry',
      sport: 'Other',
      condition: customCondition,
      estimatedValue: parseFloat(customValue) || 0,
      notes: customNotes,
      isCustom: true,
    };
    setItems(prev => [...prev, item]);
    setCustomName('');
    setCustomYear('');
    setCustomValue('');
    setCustomNotes('');
    setShowCustomForm(false);
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id: string, field: keyof AppraisalItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  const totalValue = items.reduce((s, i) => s + i.estimatedValue, 0);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8">
      {/* Report Info */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 print:hidden">
        <h2 className="text-lg font-bold text-white mb-4">Report Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Collection Owner Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
            >
              <option>Insurance Documentation</option>
              <option>Estate Planning</option>
              <option>Consignment Agreement</option>
              <option>Charitable Donation</option>
              <option>Divorce Settlement</option>
              <option>Personal Records</option>
              <option>Sale Preparation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Cards */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 print:hidden">
        <h2 className="text-lg font-bold text-white mb-4">Add Cards to Appraisal</h2>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Search Database (5,500+ cards)</label>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by player name or card name..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
          />
          {filtered.length > 0 && (
            <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {filtered.map(c => (
                <button
                  key={c.slug}
                  onClick={() => addFromDB(c)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 transition-colors"
                >
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-gray-500 text-xs">
                    {c.player} &middot; {c.sport} &middot; Raw: {c.estimatedValueRaw} &middot; Gem: {c.estimatedValueGem}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom entry toggle */}
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          {showCustomForm ? 'Hide custom entry' : '+ Add custom card (not in database)'}
        </button>

        {showCustomForm && (
          <div className="mt-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Card name (e.g. 1986 Fleer Michael Jordan #57)"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              />
              <input
                type="number"
                value={customYear}
                onChange={e => setCustomYear(e.target.value)}
                placeholder="Year"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                step="0.01"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                placeholder="Estimated value ($)"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              />
              <select
                value={customCondition}
                onChange={e => setCustomCondition(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              >
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={addCustom}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Custom Card
            </button>
          </div>
        )}
      </div>

      {/* Item List (editable, print:hidden) */}
      {items.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{items.length} Items &middot; Total: {fmt(totalValue)}</h2>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Print Report
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <span className="text-gray-500 text-xs mt-2 min-w-[24px]">{idx + 1}.</span>
                <div className="flex-1 space-y-2">
                  <div className="text-white text-sm font-medium">{item.name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={item.condition}
                      onChange={e => updateItem(item.id, 'condition', e.target.value)}
                      className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-violet-500"
                    >
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.estimatedValue || ''}
                        onChange={e => updateItem(item.id, 'estimatedValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={e => updateItem(item.id, 'notes', e.target.value)}
                      placeholder="Notes..."
                      className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm mt-1"
                  title="Remove"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Report */}
      {items.length > 0 && (
        <div ref={reportRef} className="hidden print:block bg-white text-black p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Card Collection Appraisal Report</h1>
            <p className="text-gray-600 mt-1">Generated by CardVault &mdash; cardvault-two.vercel.app</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <strong>Owner:</strong> {ownerName || 'Not specified'}
            </div>
            <div>
              <strong>Date:</strong> {today}
            </div>
            <div>
              <strong>Purpose:</strong> {purpose}
            </div>
            <div>
              <strong>Total Items:</strong> {items.length}
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-black py-2 mb-4 text-center">
            <span className="text-xl font-bold">Total Estimated Value: {fmt(totalValue)}</span>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-2 w-8">#</th>
                <th className="text-left py-2">Card Description</th>
                <th className="text-left py-2 w-24">Year</th>
                <th className="text-left py-2 w-36">Condition</th>
                <th className="text-right py-2 w-28">Est. Value</th>
                <th className="text-left py-2 w-32">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-1.5">{idx + 1}</td>
                  <td className="py-1.5">{item.name}</td>
                  <td className="py-1.5">{item.year}</td>
                  <td className="py-1.5">{item.condition}</td>
                  <td className="py-1.5 text-right">{fmt(item.estimatedValue)}</td>
                  <td className="py-1.5 text-gray-600">{item.notes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400">
                <td colSpan={4} className="py-2 text-right font-bold">Total Estimated Value:</td>
                <td className="py-2 text-right font-bold">{fmt(totalValue)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8 text-xs text-gray-500 space-y-2">
            <p><strong>Methodology:</strong> Values are estimated based on recent eBay sold listings, major auction house results, and dealer pricing data as of {today}. Values reflect fair market value for the stated condition.</p>
            <p><strong>Disclaimer:</strong> This is an estimated valuation generated by CardVault software and is not a certified professional appraisal. For collections exceeding $50,000 in value, or for legal proceedings, we recommend engaging a certified appraiser through the American Society of Appraisers (ASA) or the International Society of Appraisers (ISA).</p>
            <p><strong>Prepared by:</strong> CardVault Appraisal Tool &mdash; cardvault-two.vercel.app/tools/appraisal-report</p>
          </div>

          <div className="mt-6 flex justify-between text-xs text-gray-400">
            <span>Report ID: CV-{Date.now().toString(36).toUpperCase()}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      )}

      {/* Preview (screen version of report) */}
      {items.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Report Preview</h2>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Print / Save as PDF
            </button>
          </div>

          <div className="bg-white text-black rounded-lg p-6 text-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Card Collection Appraisal Report</h3>
              <p className="text-gray-500 text-xs mt-1">Generated by CardVault</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div><strong>Owner:</strong> {ownerName || 'Not specified'}</div>
              <div><strong>Date:</strong> {today}</div>
              <div><strong>Purpose:</strong> {purpose}</div>
              <div><strong>Items:</strong> {items.length}</div>
            </div>

            <div className="border-t-2 border-b-2 border-black py-2 mb-4 text-center">
              <span className="text-lg font-bold">Total: {fmt(totalValue)}</span>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1.5 w-6">#</th>
                  <th className="text-left py-1.5">Description</th>
                  <th className="text-left py-1.5 w-20">Condition</th>
                  <th className="text-right py-1.5 w-20">Value</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-1">{idx + 1}</td>
                    <td className="py-1">
                      {item.name}
                      {item.notes && <span className="text-gray-400 ml-1">({item.notes})</span>}
                    </td>
                    <td className="py-1 text-gray-600">{item.condition.split(' (')[0]}</td>
                    <td className="py-1 text-right">{fmt(item.estimatedValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-400">
                  <td colSpan={3} className="py-1.5 text-right font-bold">Total:</td>
                  <td className="py-1.5 text-right font-bold">{fmt(totalValue)}</td>
                </tr>
              </tfoot>
            </table>

            <p className="mt-4 text-[10px] text-gray-400">
              Values estimated from recent sales data as of {today}. Not a certified professional appraisal.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {items.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 print:hidden">
          <h3 className="text-lg font-bold text-white mb-4">Appraisal Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-white">{items.length}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-violet-400">{fmt(totalValue)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Average Per Card</div>
              <div className="text-2xl font-bold text-white">{items.length > 0 ? fmt(totalValue / items.length) : '$0'}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Highest Value</div>
              <div className="text-2xl font-bold text-emerald-400">
                {items.length > 0 ? fmt(Math.max(...items.map(i => i.estimatedValue))) : '$0'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-10 text-center print:hidden">
          <div className="text-4xl mb-3">&#x1F4CB;</div>
          <p className="text-gray-400 mb-2">Search for cards above to start building your appraisal report.</p>
          <p className="text-gray-500 text-sm">Add items from our 5,500+ card database or enter custom cards manually.</p>
        </div>
      )}
    </div>
  );
}
