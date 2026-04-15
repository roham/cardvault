'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

interface ConsignmentEntry {
  id: string;
  cardName: string;
  estimatedValue: number;
  house: string;
  status: 'preparing' | 'shipped' | 'received' | 'cataloged' | 'listed' | 'sold' | 'payment-pending' | 'paid';
  dateSent: string;
  soldPrice?: number;
  notes: string;
}

interface ConsignmentHouse {
  name: string;
  commission: number; // percentage
  buyerPremium: number;
  minLot: number;
  avgTimeline: string;
  specialty: string;
  tier: 'premium' | 'standard' | 'budget';
}

const HOUSES: ConsignmentHouse[] = [
  { name: 'Heritage Auctions', commission: 0.10, buyerPremium: 0.20, minLot: 500, avgTimeline: '60-90 days', specialty: 'Vintage, high-value singles, complete collections', tier: 'premium' },
  { name: 'Goldin Auctions', commission: 0.10, buyerPremium: 0.20, minLot: 200, avgTimeline: '30-60 days', specialty: 'Modern high-end, PSA 10 rookies, cultural moments', tier: 'premium' },
  { name: 'PWCC Marketplace', commission: 0.085, buyerPremium: 0.00, minLot: 50, avgTimeline: '14-30 days', specialty: 'Volume selling, mid-range graded cards, weekly auctions', tier: 'standard' },
  { name: 'MySlabs', commission: 0.12, buyerPremium: 0.00, minLot: 25, avgTimeline: '7-21 days', specialty: 'Graded cards, fast turnaround, mobile-first', tier: 'standard' },
  { name: 'eBay Consignment', commission: 0.15, buyerPremium: 0.00, minLot: 10, avgTimeline: '7-14 days', specialty: 'Maximum audience reach, all card types', tier: 'budget' },
  { name: 'Lelands', commission: 0.12, buyerPremium: 0.20, minLot: 1000, avgTimeline: '45-90 days', specialty: 'Historic memorabilia, museum-quality vintage', tier: 'premium' },
  { name: 'REA (Robert Edward)', commission: 0.10, buyerPremium: 0.20, minLot: 500, avgTimeline: '60-120 days', specialty: 'Pre-war, tobacco cards, ultra-vintage specialists', tier: 'premium' },
  { name: 'Probstein123', commission: 0.085, buyerPremium: 0.00, minLot: 25, avgTimeline: '7-21 days', specialty: 'High-volume eBay consignment, fast listing, sports focus', tier: 'budget' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  'preparing': { label: 'Preparing', color: 'text-gray-400', icon: '📦' },
  'shipped': { label: 'Shipped', color: 'text-blue-400', icon: '🚚' },
  'received': { label: 'Received', color: 'text-indigo-400', icon: '✅' },
  'cataloged': { label: 'Cataloged', color: 'text-purple-400', icon: '📋' },
  'listed': { label: 'Listed', color: 'text-yellow-400', icon: '🔨' },
  'sold': { label: 'Sold', color: 'text-emerald-400', icon: '💰' },
  'payment-pending': { label: 'Payment Pending', color: 'text-orange-400', icon: '⏳' },
  'paid': { label: 'Paid', color: 'text-green-400', icon: '✅' },
};

const STATUS_ORDER = ['preparing', 'shipped', 'received', 'cataloged', 'listed', 'sold', 'payment-pending', 'paid'];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmt(n: number): string { return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`; }

export default function ConsignmentClient() {
  const [entries, setEntries] = useState<ConsignmentEntry[]>([]);
  const [cardName, setCardName] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [house, setHouse] = useState(HOUSES[0].name);
  const [notes, setNotes] = useState('');
  const [view, setView] = useState<'tracker' | 'compare'>('tracker');
  const [compareValue, setCompareValue] = useState('500');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-consignment');
      if (saved) setEntries(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('cv-consignment', JSON.stringify(entries));
    }
  }, [entries]);

  const addEntry = useCallback(() => {
    const val = parseFloat(estimatedValue);
    if (!cardName.trim() || isNaN(val) || val <= 0) return;
    const entry: ConsignmentEntry = {
      id: genId(),
      cardName: cardName.trim(),
      estimatedValue: val,
      house,
      status: 'preparing',
      dateSent: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };
    setEntries(prev => [entry, ...prev]);
    setCardName('');
    setEstimatedValue('');
    setNotes('');
  }, [cardName, estimatedValue, house, notes]);

  const updateStatus = useCallback((id: string, newStatus: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as ConsignmentEntry['status'] } : e));
  }, []);

  const updateSoldPrice = useCallback((id: string, price: string) => {
    const val = parseFloat(price);
    if (!isNaN(val)) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, soldPrice: val } : e));
    }
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const stats = useMemo(() => {
    const active = entries.filter(e => !['paid', 'sold'].includes(e.status));
    const sold = entries.filter(e => e.status === 'sold' || e.status === 'paid' || e.status === 'payment-pending');
    const totalEstimated = entries.reduce((s, e) => s + e.estimatedValue, 0);
    const totalSold = sold.reduce((s, e) => s + (e.soldPrice || 0), 0);
    const totalCommission = sold.reduce((s, e) => {
      const h = HOUSES.find(h => h.name === e.house);
      return s + (e.soldPrice || 0) * (h?.commission || 0.10);
    }, 0);
    return { active: active.length, sold: sold.length, totalEstimated, totalSold, totalCommission, netProceeds: totalSold - totalCommission };
  }, [entries]);

  const comparisonData = useMemo(() => {
    const val = parseFloat(compareValue) || 500;
    return HOUSES.map(h => {
      const commission = val * h.commission;
      const netToSeller = val - commission;
      const buyerPays = val * (1 + h.buyerPremium);
      return { ...h, commission, netToSeller, buyerPays };
    }).sort((a, b) => b.netToSeller - a.netToSeller);
  }, [compareValue]);

  return (
    <div>
      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('tracker')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'tracker' ? 'bg-emerald-900/60 border border-emerald-700 text-emerald-400' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'}`}>
          Consignment Tracker
        </button>
        <button onClick={() => setView('compare')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'compare' ? 'bg-emerald-900/60 border border-emerald-700 text-emerald-400' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'}`}>
          Compare Houses
        </button>
      </div>

      {view === 'compare' ? (
        <div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Consignment House Comparison</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Card Sold Price ($)</label>
              <input type="number" value={compareValue} onChange={e => setCompareValue(e.target.value)} placeholder="500"
                className="w-48 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2 pr-4">House</th>
                    <th className="text-left text-gray-400 py-2 pr-4">Commission</th>
                    <th className="text-left text-gray-400 py-2 pr-4">You Keep</th>
                    <th className="text-left text-gray-400 py-2 pr-4">Buyer Pays</th>
                    <th className="text-left text-gray-400 py-2 pr-4">Min Lot</th>
                    <th className="text-left text-gray-400 py-2">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((h, i) => (
                    <tr key={h.name} className={`border-b border-gray-800 ${i === 0 ? 'bg-emerald-900/10' : ''}`}>
                      <td className="py-3 pr-4">
                        <span className="text-white font-medium">{h.name}</span>
                        {i === 0 && <span className="ml-2 text-xs text-emerald-400 font-bold">BEST</span>}
                        <span className={`block text-xs mt-0.5 ${h.tier === 'premium' ? 'text-yellow-400' : h.tier === 'standard' ? 'text-blue-400' : 'text-gray-500'}`}>
                          {h.tier} &middot; {h.specialty.split(',')[0]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-red-400">{(h.commission * 100).toFixed(1)}% ({fmt(h.commission)})</td>
                      <td className="py-3 pr-4 text-emerald-400 font-bold">{fmt(h.netToSeller)}</td>
                      <td className="py-3 pr-4 text-gray-300">
                        {h.buyerPremium > 0 ? `${fmt(h.buyerPays)} (${(h.buyerPremium * 100).toFixed(0)}% BP)` : fmt(h.buyerPays)}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{fmt(h.minLot)}+</td>
                      <td className="py-3 text-gray-400">{h.avgTimeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Self-sell comparison */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Self-Sell Comparison</h3>
            <p className="text-sm text-gray-400 mb-4">Same {fmt(parseFloat(compareValue) || 500)} card sold yourself:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'eBay (self)', fee: 0.1325, shipping: 4, time: '3-14 days' },
                { name: 'Facebook Groups', fee: 0.03, shipping: 4, time: '1-7 days' },
                { name: 'Card Show', fee: 0, shipping: 0, time: '1-2 days' },
              ].map(ch => {
                const val = parseFloat(compareValue) || 500;
                const fees = val * ch.fee + ch.shipping;
                const net = val - fees;
                return (
                  <div key={ch.name} className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3">
                    <span className="text-white text-sm font-medium">{ch.name}</span>
                    <div className="text-emerald-400 font-bold mt-1">{fmt(net)}</div>
                    <span className="text-xs text-gray-500">Fees: {fmt(fees)} &middot; {ch.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Stats Bar */}
          {entries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.active}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.sold}</div>
                <div className="text-xs text-gray-500">Sold/Paid</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{fmt(stats.totalSold)}</div>
                <div className="text-xs text-gray-500">Total Sold</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{fmt(stats.netProceeds)}</div>
                <div className="text-xs text-gray-500">Net Proceeds</div>
              </div>
            </div>
          )}

          {/* Add Entry */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Add Consignment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Card Name</label>
                <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. 2020 Prizm Joe Burrow PSA 10"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estimated Value ($)</label>
                <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} placeholder="e.g. 500"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Consignment House</label>
                <select value={house} onChange={e => setHouse(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                  {HOUSES.map(h => (
                    <option key={h.name} value={h.name}>{h.name} ({(h.commission * 100).toFixed(1)}%)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Lot #1234"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={addEntry} disabled={!cardName.trim() || !estimatedValue}
              className={`w-full py-2.5 rounded-xl font-bold transition-colors ${cardName.trim() && estimatedValue ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
              Add to Tracker
            </button>
          </div>

          {/* Entries List */}
          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No consignments yet</p>
              <p className="text-sm">Add a card above to start tracking your consignment status</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const houseData = HOUSES.find(h => h.name === entry.house);
                const commission = houseData ? houseData.commission : 0.10;
                const expectedNet = entry.soldPrice
                  ? entry.soldPrice * (1 - commission)
                  : entry.estimatedValue * (1 - commission);
                const statusInfo = STATUS_LABELS[entry.status] || STATUS_LABELS['preparing'];
                const statusIdx = STATUS_ORDER.indexOf(entry.status);

                return (
                  <div key={entry.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold">{entry.cardName}</h3>
                        <p className="text-sm text-gray-400">{entry.house} &middot; Sent {entry.dateSent}</p>
                        {entry.notes && <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{fmt(entry.estimatedValue)}</div>
                        <div className="text-xs text-gray-500">est. value</div>
                      </div>
                    </div>

                    {/* Status Progress */}
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                      {STATUS_ORDER.slice(0, 6).map((s, i) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(entry.id, s)}
                          className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            i <= statusIdx
                              ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-gray-900 text-gray-500 border border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {STATUS_LABELS[s]?.icon} {STATUS_LABELS[s]?.label}
                        </button>
                      ))}
                    </div>

                    {/* Sold section */}
                    {(entry.status === 'sold' || entry.status === 'payment-pending' || entry.status === 'paid') && (
                      <div className="flex items-center gap-3 mb-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2">
                        <label className="text-xs text-emerald-400">Sold for:</label>
                        <input
                          type="number"
                          value={entry.soldPrice || ''}
                          onChange={e => updateSoldPrice(entry.id, e.target.value)}
                          placeholder="Sold price"
                          className="w-28 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                        {entry.soldPrice && (
                          <>
                            <span className="text-xs text-gray-400">Commission: {fmt(entry.soldPrice * commission)}</span>
                            <span className="text-xs text-emerald-400 font-bold">Net: {fmt(expectedNet)}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <div className="flex gap-2">
                        {entry.status !== 'paid' && (
                          <button
                            onClick={() => {
                              const nextIdx = Math.min(statusIdx + 1, STATUS_ORDER.length - 1);
                              updateStatus(entry.id, STATUS_ORDER[nextIdx]);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Advance Status
                          </button>
                        )}
                        <button onClick={() => removeEntry(entry.id)} className="text-xs text-red-400 hover:text-red-300">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
