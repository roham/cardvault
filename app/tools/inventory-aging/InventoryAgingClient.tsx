'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_inventory_aging_v1';

type Listing = {
  id: string;
  label: string;
  listDate: string;
  platform: string;
  askPrice: number;
  costBasis: number;
};

type Band = 'fresh' | 'warm' | 'aged' | 'stale' | 'dead';

const BANDS: Record<Band, { label: string; minDays: number; maxDays: number; color: string; bg: string; action: string; severity: number }> = {
  fresh: { label: 'FRESH', minDays: 0,   maxDays: 30,   color: 'text-emerald-300', bg: 'bg-emerald-950/40 border-emerald-700/60', action: 'Hold — give listing time to work', severity: 1 },
  warm:  { label: 'WARM',  minDays: 30,  maxDays: 90,   color: 'text-teal-300',    bg: 'bg-teal-950/40 border-teal-700/60',       action: 'Check comps; cut 5-10% if ask above market', severity: 2 },
  aged:  { label: 'AGED',  minDays: 90,  maxDays: 180,  color: 'text-amber-300',   bg: 'bg-amber-950/40 border-amber-700/60',     action: 'Cut 10-15% OR migrate platform', severity: 3 },
  stale: { label: 'STALE', minDays: 180, maxDays: 365,  color: 'text-orange-300',  bg: 'bg-orange-950/40 border-orange-700/60',   action: 'Cut 20-30% OR consign to auction house', severity: 4 },
  dead:  { label: 'DEAD',  minDays: 365, maxDays: Infinity, color: 'text-red-300', bg: 'bg-red-950/40 border-red-700/60',         action: 'Bulk liquidate OR 40-60% cut — persistent mispricing', severity: 5 },
};

const PLATFORMS = ['eBay BIN', 'eBay Auction', 'Whatnot', 'PWCC Weekly', 'MySlabs', 'Heritage', 'Goldin', 'Fanatics Collect', 'Mercari', 'OfferUp'];

const DEFAULT_LISTINGS: Listing[] = [
  { id: 'l1', label: '2003 Topps Chrome LeBron PSA 9 #111', listDate: '2026-03-20', platform: 'eBay BIN', askPrice: 13500, costBasis: 4000 },
  { id: 'l2', label: '1986 Fleer Jordan PSA 8 #57', listDate: '2025-11-05', platform: 'PWCC Weekly', askPrice: 9500, costBasis: 6000 },
  { id: 'l3', label: '2018 Prizm Luka Silver PSA 10', listDate: '2025-08-02', platform: 'eBay BIN', askPrice: 4200, costBasis: 800 },
  { id: 'l4', label: '1979 OPC Gretzky RC PSA 5', listDate: '2024-11-15', platform: 'MySlabs', askPrice: 28000, costBasis: 18000 },
];

function today(): string { return new Date().toISOString().slice(0, 10); }
function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.max(0, Math.round((db - da) / (1000 * 60 * 60 * 24)));
}
function bandFor(days: number): Band {
  for (const k of ['fresh', 'warm', 'aged', 'stale', 'dead'] as Band[]) {
    if (days >= BANDS[k].minDays && days < BANDS[k].maxDays) return k;
  }
  return 'dead';
}
function fmt(n: number): string { return `$${Math.round(n).toLocaleString()}`; }

export default function InventoryAgingClient() {
  const [listings, setListings] = useState<Listing[]>(DEFAULT_LISTINGS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) { const p = JSON.parse(s); if (Array.isArray(p)) setListings(p); }
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(STATE_KEY, JSON.stringify(listings)); } catch {} }, [listings]);

  const enriched = useMemo(() => {
    const now = today();
    return listings.map(l => {
      const days = daysBetween(l.listDate, now);
      const band = bandFor(days);
      return { listing: l, days, band, bandMeta: BANDS[band] };
    }).sort((a, b) => b.bandMeta.severity - a.bandMeta.severity || b.days - a.days);
  }, [listings]);

  const portfolio = useMemo(() => {
    const totalAsk = listings.reduce((s, l) => s + l.askPrice, 0);
    const totalBasis = listings.reduce((s, l) => s + l.costBasis, 0);
    const counts: Record<Band, number> = { fresh: 0, warm: 0, aged: 0, stale: 0, dead: 0 };
    const byBand: Record<Band, number> = { fresh: 0, warm: 0, aged: 0, stale: 0, dead: 0 };
    enriched.forEach(e => { counts[e.band]++; byBand[e.band] += e.listing.askPrice; });
    const staleCapital = byBand.stale + byBand.dead + byBand.aged;
    return { totalAsk, totalBasis, counts, byBand, staleCapital };
  }, [listings, enriched]);

  function addListing() {
    const id = Math.random().toString(36).slice(2, 10);
    setListings([...listings, { id, label: '', listDate: today(), platform: 'eBay BIN', askPrice: 0, costBasis: 0 }]);
  }
  function removeListing(id: string) { setListings(listings.filter(l => l.id !== id)); }
  function updateListing(id: string, patch: Partial<Listing>) { setListings(listings.map(l => l.id === id ? { ...l, ...patch } : l)); }
  function resetSample() { if (!confirm('Replace with sample listings?')) return; setListings(DEFAULT_LISTINGS); }
  function clearAll() { if (!confirm('Remove all?')) return; setListings([]); }

  async function handleCopy() {
    const lines = [
      `Inventory Aging Report — ${today()}`,
      `Total listings: ${listings.length}`,
      `Total ask: ${fmt(portfolio.totalAsk)} | Total basis: ${fmt(portfolio.totalBasis)}`,
      `Stale+dead+aged capital: ${fmt(portfolio.staleCapital)} (needs action)`,
      ``,
      `Band distribution:`,
      ...(Object.keys(BANDS) as Band[]).map(k => `  ${BANDS[k].label}: ${portfolio.counts[k]} listings · ${fmt(portfolio.byBand[k])}`),
      ``,
      `Priority queue (action needed first):`,
      ...enriched.map((e, i) => `${i+1}. [${e.bandMeta.label}] ${e.listing.label || '(unnamed)'} — ${e.days}d held · ${e.listing.platform} · ask ${fmt(e.listing.askPrice)} · ${e.bandMeta.action}`),
      ``,
      `via CardVault · https://cardvault-two.vercel.app/tools/inventory-aging`,
    ];
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Portfolio summary */}
      <div className="bg-gradient-to-br from-teal-950/60 to-teal-900/30 border border-teal-700/50 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-teal-300 mb-3">Portfolio aging summary</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
          <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Total listed</div><div className="text-xl font-bold text-white">{listings.length}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Total ask</div><div className="text-xl font-bold text-white">{fmt(portfolio.totalAsk)}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Total basis</div><div className="text-xl font-bold text-white">{fmt(portfolio.totalBasis)}</div></div>
          <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Aged+stale+dead</div><div className="text-xl font-bold text-orange-300">{fmt(portfolio.staleCapital)}</div><div className="text-[10px] text-slate-500">capital needing action</div></div>
          <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Band counts</div><div className="text-xs font-mono text-slate-300">F:{portfolio.counts.fresh} W:{portfolio.counts.warm} A:{portfolio.counts.aged} S:{portfolio.counts.stale} D:{portfolio.counts.dead}</div></div>
        </div>
      </div>

      {/* Band legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(Object.keys(BANDS) as Band[]).map(k => {
          const b = BANDS[k];
          return (
            <div key={k} className={`${b.bg} rounded-md p-2 border`}>
              <div className={`text-[10px] font-bold ${b.color}`}>{b.label}</div>
              <div className="text-[10px] text-slate-400">{b.minDays}-{isFinite(b.maxDays) ? b.maxDays : '∞'}d</div>
            </div>
          );
        })}
      </div>

      {/* Listings */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold text-white">Listings ({listings.length})</div>
            <div className="text-xs text-slate-500">Sorted by band severity, then age.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addListing} className="text-xs px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold">+ Add</button>
            <button onClick={resetSample} className="text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white">Reset sample</button>
            <button onClick={clearAll} className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300">Clear</button>
          </div>
        </div>
        {enriched.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No listings. Click + Add or load sample.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {enriched.map(({ listing, days, band, bandMeta }) => (
              <div key={listing.id} className="p-4 space-y-2">
                <div className="flex items-start gap-3 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${bandMeta.bg} ${bandMeta.color}`}>{bandMeta.label} · {days}d</span>
                  <input
                    type="text"
                    value={listing.label}
                    onChange={e => updateListing(listing.id, { label: e.target.value })}
                    placeholder="Card ID (year / set / player / grade)"
                    className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                  <button onClick={() => removeListing(listing.id)} className="text-xs text-slate-500 hover:text-red-400">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">List date</div>
                    <input type="date" value={listing.listDate} onChange={e => updateListing(listing.id, { listDate: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500" />
                  </label>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Platform</div>
                    <select value={listing.platform} onChange={e => updateListing(listing.id, { platform: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Ask price</div>
                    <div className="relative"><span className="absolute left-2 top-1 text-slate-400 text-xs">$</span><input type="number" value={listing.askPrice} onChange={e => updateListing(listing.id, { askPrice: parseFloat(e.target.value) || 0 })} min={0} className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500" /></div>
                  </label>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Cost basis</div>
                    <div className="relative"><span className="absolute left-2 top-1 text-slate-400 text-xs">$</span><input type="number" value={listing.costBasis} onChange={e => updateListing(listing.id, { costBasis: parseFloat(e.target.value) || 0 })} min={0} className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500" /></div>
                  </label>
                </div>
                <div className={`text-xs ${bandMeta.color} font-semibold`}>→ {bandMeta.action}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {listings.length > 0 && (
        <div className="flex justify-center">
          <button onClick={handleCopy} className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-2.5 rounded-lg">
            {copied ? '✓ Copied aging report' : 'Copy aging report'}
          </button>
        </div>
      )}
    </div>
  );
}
