'use client';

import { useEffect, useMemo, useState } from 'react';

type AcquisitionMethod =
  | 'pack-pull'
  | 'auction-major'
  | 'auction-ebay'
  | 'private-sale'
  | 'dealer-shop'
  | 'card-show'
  | 'trade'
  | 'inheritance'
  | 'consignment'
  | 'unknown';

const METHOD_LABEL: Record<AcquisitionMethod, string> = {
  'pack-pull': 'Pack pull (raw from product)',
  'auction-major': 'Major auction (Heritage / Goldin / PWCC / REA)',
  'auction-ebay': 'eBay / online auction',
  'private-sale': 'Private sale',
  'dealer-shop': 'Dealer / LCS',
  'card-show': 'Card show',
  'trade': 'Trade',
  'inheritance': 'Inheritance / gift',
  'consignment': 'Consignment house',
  'unknown': 'Unknown / unrecorded',
};

type Owner = {
  id: string;
  name: string;
  start: string;           // YYYY-MM or YYYY
  end: string;             // YYYY-MM or YYYY or '' for current
  method: AcquisitionMethod;
  price: string;           // stored as string so empty works
  namedCollection: string; // optional — "Copeland Collection, REA 2012"
  events: string;          // multi-line: grading, features, etc.
  notes: string;
};

type CardMeta = {
  player: string;
  year: string;
  set: string;
  cardNumber: string;
  parallel: string;
  grade: string;
  cert: string;
};

const EMPTY_OWNER: Omit<Owner, 'id'> = {
  name: '',
  start: '',
  end: '',
  method: 'private-sale',
  price: '',
  namedCollection: '',
  events: '',
  notes: '',
};

const STORAGE_KEY = 'cv-provenance-draft-v1';

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

function parseYear(s: string): number | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function fmtDate(s: string) {
  if (!s) return '—';
  // accept YYYY, YYYY-MM, YYYY-MM-DD
  if (/^\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1] ?? m} ${y}`;
  }
  return s;
}

function fmtPrice(s: string) {
  const n = parseFloat(s);
  if (!isFinite(n) || n <= 0) return '—';
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function seedOwners(): Owner[] {
  return [
    {
      id: newId(),
      name: 'Original pack opener',
      start: '1986',
      end: '1992',
      method: 'pack-pull',
      price: '',
      namedCollection: '',
      events: 'Pulled from 1986 Fleer wax pack; stored in penny sleeve + binder.',
      notes: '',
    },
    {
      id: newId(),
      name: 'Estate / uncle',
      start: '1992',
      end: '2015',
      method: 'inheritance',
      price: '',
      namedCollection: '',
      events: 'Held in shoe box in climate-controlled closet for 23 years.',
      notes: '',
    },
    {
      id: newId(),
      name: 'Dealer — Bob\'s Cards, Cleveland',
      start: '2015',
      end: '2018',
      method: 'dealer-shop',
      price: '2500',
      namedCollection: '',
      events: 'Submitted to PSA Feb 2016; returned PSA 8. Cert #12345678.',
      notes: 'Purchased as raw NM for $2,500; graded PSA 8 on first submission.',
    },
    {
      id: newId(),
      name: 'Current owner',
      start: '2018',
      end: '',
      method: 'auction-major',
      price: '48000',
      namedCollection: '',
      events: 'Won at Goldin March 2018. Stored in bank safe-deposit box; insured with Collectibles Insurance Services.',
      notes: 'Kept in original slab; no resubmission.',
    },
  ];
}

export default function ProvenanceClient() {
  const [meta, setMeta] = useState<CardMeta>({
    player: '1986 Fleer Michael Jordan RC',
    year: '1986',
    set: 'Fleer',
    cardNumber: '57',
    parallel: 'Base',
    grade: 'PSA 8',
    cert: '12345678',
  });
  const [owners, setOwners] = useState<Owner[]>(seedOwners);
  const [copied, setCopied] = useState<string>('');

  // restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.meta) setMeta(parsed.meta);
        if (Array.isArray(parsed.owners) && parsed.owners.length > 0) setOwners(parsed.owners);
      }
    } catch { /* ignore */ }
  }, []);

  // persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, owners }));
    } catch { /* ignore */ }
  }, [meta, owners]);

  const updateOwner = (id: string, patch: Partial<Owner>) => {
    setOwners(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)));
  };
  const addOwner = () => {
    setOwners(prev => [...prev, { id: newId(), ...EMPTY_OWNER }]);
  };
  const removeOwner = (id: string) => {
    setOwners(prev => (prev.length <= 1 ? prev : prev.filter(o => o.id !== id)));
  };
  const moveOwner = (id: string, dir: -1 | 1) => {
    setOwners(prev => {
      const i = prev.findIndex(o => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // stats
  const stats = useMemo(() => {
    const years = owners
      .map(o => parseYear(o.start))
      .filter((y): y is number => y !== null);
    const firstYear = years.length ? Math.min(...years) : null;
    const currentYear = new Date().getFullYear();
    const chainYears = firstYear ? currentYear - firstYear : 0;
    const transferCount = owners.length; // total custody events (first owner counts as 1)
    const prices = owners.map(o => parseFloat(o.price)).filter(n => isFinite(n) && n > 0);
    const firstPaid = prices[0];
    const lastPaid = prices[prices.length - 1];
    const appreciation = firstPaid && lastPaid && firstPaid > 0
      ? (lastPaid - firstPaid) / firstPaid
      : null;
    const totalGradingEvents = owners
      .map(o => (o.events.match(/PSA|BGS|CGC|SGC|grade/gi) || []).length)
      .reduce((a, b) => a + b, 0);
    const namedCollections = owners
      .map(o => o.namedCollection.trim())
      .filter(Boolean);
    const unrecorded = owners.filter(o => o.method === 'unknown').length;

    // provenance quality: +1 per clean field, penalties for unknowns
    let qualityScore = 0;
    const maxScore = owners.length * 5; // name, date, method, price, events
    for (const o of owners) {
      if (o.name.trim()) qualityScore++;
      if (o.start.trim()) qualityScore++;
      if (o.method !== 'unknown') qualityScore++;
      if (parseFloat(o.price) > 0 || o.method === 'pack-pull' || o.method === 'inheritance') qualityScore++;
      if (o.events.trim()) qualityScore++;
    }
    const qualityPct = maxScore > 0 ? Math.round((qualityScore / maxScore) * 100) : 0;

    let grade: 'A' | 'B' | 'C' | 'D';
    if (qualityPct >= 85 && unrecorded === 0) grade = 'A';
    else if (qualityPct >= 65) grade = 'B';
    else if (qualityPct >= 40) grade = 'C';
    else grade = 'D';

    return {
      firstYear,
      chainYears,
      transferCount,
      firstPaid,
      lastPaid,
      appreciation,
      totalGradingEvents,
      namedCollections,
      unrecorded,
      qualityPct,
      grade,
    };
  }, [owners]);

  const provenanceStatement = useMemo(() => {
    const parts: string[] = [];
    const cardDesc = `${meta.year} ${meta.set} ${meta.player}${meta.cardNumber ? ` #${meta.cardNumber}` : ''}${meta.parallel && meta.parallel !== 'Base' ? ` — ${meta.parallel}` : ''}${meta.grade ? ` (${meta.grade}${meta.cert ? `, cert ${meta.cert}` : ''})` : ''}`;
    parts.push(`This ${cardDesc} has a documented ownership chain spanning ${stats.chainYears || 'an unknown'} year${stats.chainYears === 1 ? '' : 's'} across ${stats.transferCount} custodian${stats.transferCount === 1 ? '' : 's'}.`);
    if (stats.firstPaid && stats.lastPaid && stats.appreciation !== null) {
      const pct = Math.round(stats.appreciation * 100);
      if (pct > 0) parts.push(`The card has appreciated ${pct}% from its earliest recorded sale of $${stats.firstPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })} to its most recent recorded transaction of $${stats.lastPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}.`);
      else if (pct < 0) parts.push(`The card has depreciated ${Math.abs(pct)}% from its earliest recorded sale of $${stats.firstPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}.`);
    }
    if (stats.namedCollections.length > 0) {
      parts.push(`Provenance includes the following named collection${stats.namedCollections.length === 1 ? '' : 's'}: ${stats.namedCollections.join('; ')}.`);
    }
    if (stats.totalGradingEvents > 0) {
      parts.push(`${stats.totalGradingEvents} grading event${stats.totalGradingEvents === 1 ? '' : 's'} are documented in the chain.`);
    }
    if (stats.unrecorded > 0) {
      parts.push(`${stats.unrecorded} custody segment${stats.unrecorded === 1 ? ' is' : 's are'} marked as unknown or unrecorded — this is a disclosed gap in the chain.`);
    }
    parts.push(`Provenance quality grade: ${stats.grade} (${stats.qualityPct}% of data fields complete).`);
    return parts.join(' ');
  }, [meta, stats]);

  const markdown = useMemo(() => {
    const lines: string[] = [];
    lines.push('# Provenance Record');
    lines.push('');
    lines.push(`**Card:** ${meta.year} ${meta.set} ${meta.player}${meta.cardNumber ? ` #${meta.cardNumber}` : ''}`);
    if (meta.parallel && meta.parallel !== 'Base') lines.push(`**Parallel:** ${meta.parallel}`);
    if (meta.grade) lines.push(`**Grade:** ${meta.grade}${meta.cert ? ` (cert ${meta.cert})` : ''}`);
    lines.push('');
    lines.push(`**Chain length:** ${stats.chainYears} years · ${stats.transferCount} custodians · Quality grade ${stats.grade}`);
    lines.push('');
    lines.push('## Chain of Custody');
    lines.push('');
    owners.forEach((o, i) => {
      lines.push(`### ${i + 1}. ${o.name || '(unnamed owner)'}`);
      lines.push(`- **Period:** ${fmtDate(o.start) || '—'} – ${o.end ? fmtDate(o.end) : 'present'}`);
      lines.push(`- **Acquired via:** ${METHOD_LABEL[o.method]}`);
      if (parseFloat(o.price) > 0) lines.push(`- **Price:** ${fmtPrice(o.price)}`);
      if (o.namedCollection.trim()) lines.push(`- **Named collection:** ${o.namedCollection}`);
      if (o.events.trim()) lines.push(`- **Events:** ${o.events}`);
      if (o.notes.trim()) lines.push(`- **Notes:** ${o.notes}`);
      lines.push('');
    });
    lines.push('## Provenance Statement');
    lines.push('');
    lines.push(provenanceStatement);
    lines.push('');
    lines.push('_Generated via CardVault Provenance Tracker — cardvault-two.vercel.app/tools/provenance_');
    return lines.join('\n');
  }, [meta, owners, stats, provenanceStatement]);

  const handleCopy = async (kind: 'markdown' | 'statement') => {
    const text = kind === 'markdown' ? markdown : provenanceStatement;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* ignore */ }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (!confirm('Reset the provenance record? Local draft will be cleared.')) return;
    setMeta({ player: '', year: '', set: '', cardNumber: '', parallel: '', grade: '', cert: '' });
    setOwners([{ id: newId(), ...EMPTY_OWNER }]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const handleLoadSample = () => {
    setMeta({
      player: 'Michael Jordan RC',
      year: '1986',
      set: 'Fleer',
      cardNumber: '57',
      parallel: 'Base',
      grade: 'PSA 8',
      cert: '12345678',
    });
    setOwners(seedOwners());
  };

  const gradeColor = {
    A: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
    B: 'bg-teal-950/40 border-teal-700/40 text-teal-300',
    C: 'bg-amber-950/40 border-amber-700/40 text-amber-300',
    D: 'bg-rose-950/40 border-rose-700/40 text-rose-300',
  }[stats.grade];

  return (
    <div className="space-y-6">
      {/* Card identity */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6 print:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Card Identity</h2>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleLoadSample}
              className="text-xs text-teal-400 hover:text-teal-300 border border-teal-800/50 rounded-lg px-3 py-1"
            >
              Load Jordan RC sample
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-rose-300 border border-gray-700 rounded-lg px-3 py-1"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Player / subject</span>
            <input
              value={meta.player}
              onChange={(e) => setMeta({ ...meta, player: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g. Michael Jordan RC"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Year</span>
            <input
              value={meta.year}
              onChange={(e) => setMeta({ ...meta, year: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="1986"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Set</span>
            <input
              value={meta.set}
              onChange={(e) => setMeta({ ...meta, set: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Fleer"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Card #</span>
            <input
              value={meta.cardNumber}
              onChange={(e) => setMeta({ ...meta, cardNumber: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="57"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Parallel / variant</span>
            <input
              value={meta.parallel}
              onChange={(e) => setMeta({ ...meta, parallel: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Base / Refractor /25 / Superfractor 1/1"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Grade</span>
            <input
              value={meta.grade}
              onChange={(e) => setMeta({ ...meta, grade: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="PSA 8"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Cert #</span>
            <input
              value={meta.cert}
              onChange={(e) => setMeta({ ...meta, cert: e.target.value })}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="12345678"
            />
          </label>
        </div>
      </div>

      {/* Quality + stats tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className={`border rounded-xl p-4 ${gradeColor}`}>
          <div className="text-xs uppercase tracking-wide opacity-70">Provenance grade</div>
          <div className="text-3xl font-black mt-1">{stats.grade}</div>
          <div className="text-xs opacity-80 mt-1">{stats.qualityPct}% complete</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 print:border-gray-300">
          <div className="text-xs uppercase tracking-wide text-gray-500">Chain length</div>
          <div className="text-3xl font-black text-white mt-1">{stats.chainYears}y</div>
          <div className="text-xs text-gray-500 mt-1">{stats.firstYear ? `since ${stats.firstYear}` : 'no dates'}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 print:border-gray-300">
          <div className="text-xs uppercase tracking-wide text-gray-500">Custodians</div>
          <div className="text-3xl font-black text-white mt-1">{stats.transferCount}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.unrecorded > 0 ? `${stats.unrecorded} unknown` : 'all known'}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 print:border-gray-300">
          <div className="text-xs uppercase tracking-wide text-gray-500">Appreciation</div>
          <div className="text-3xl font-black text-white mt-1">
            {stats.appreciation !== null ? `${stats.appreciation >= 0 ? '+' : ''}${Math.round(stats.appreciation * 100)}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.firstPaid ? `$${stats.firstPaid.toLocaleString()} → $${(stats.lastPaid || 0).toLocaleString()}` : 'add prices'}
          </div>
        </div>
      </div>

      {/* Chain of custody */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6 print:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Chain of Custody</h2>
          <span className="text-xs text-gray-500">{owners.length} custodian{owners.length === 1 ? '' : 's'}</span>
        </div>

        <ol className="space-y-4">
          {owners.map((o, i) => (
            <li key={o.id} className="relative border border-gray-800 rounded-lg p-4 bg-gray-950/50 print:border-gray-300 print:bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-950/60 border border-teal-700/60 text-teal-300 text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="text-xs text-gray-500">Custodian #{i + 1}</div>
                </div>
                <div className="flex gap-1 print:hidden">
                  <button
                    onClick={() => moveOwner(o.id, -1)}
                    disabled={i === 0}
                    className="text-xs text-gray-400 hover:text-teal-300 border border-gray-700 rounded px-2 py-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveOwner(o.id, 1)}
                    disabled={i === owners.length - 1}
                    className="text-xs text-gray-400 hover:text-teal-300 border border-gray-700 rounded px-2 py-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeOwner(o.id)}
                    disabled={owners.length <= 1}
                    className="text-xs text-gray-400 hover:text-rose-400 border border-gray-700 rounded px-2 py-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Owner name / pseudonym</span>
                  <input
                    value={o.name}
                    onChange={(e) => updateOwner(o.id, { name: e.target.value })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="e.g. Roger Smith / @collector123 / Estate of J. Doe"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Acquired via</span>
                  <select
                    value={o.method}
                    onChange={(e) => updateOwner(o.id, { method: e.target.value as AcquisitionMethod })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                  >
                    {(Object.keys(METHOD_LABEL) as AcquisitionMethod[]).map(m => (
                      <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Start (YYYY or YYYY-MM)</span>
                  <input
                    value={o.start}
                    onChange={(e) => updateOwner(o.id, { start: e.target.value })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="1986 or 1986-03"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">End (blank if current)</span>
                  <input
                    value={o.end}
                    onChange={(e) => updateOwner(o.id, { end: e.target.value })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="1992 or 1992-08"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Price paid (USD)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={o.price}
                    onChange={(e) => updateOwner(o.id, { price: e.target.value })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="2500"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Named collection (optional)</span>
                  <input
                    value={o.namedCollection}
                    onChange={(e) => updateOwner(o.id, { namedCollection: e.target.value })}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="Copeland Collection · REA 2012 · Lot 142"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Notable events (grading, features, display)</span>
                  <textarea
                    value={o.events}
                    onChange={(e) => updateOwner(o.id, { events: e.target.value })}
                    rows={2}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="Submitted to PSA Feb 2016; returned PSA 8. Cert 12345678."
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Notes (optional)</span>
                  <textarea
                    value={o.notes}
                    onChange={(e) => updateOwner(o.id, { notes: e.target.value })}
                    rows={2}
                    className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 print:border-gray-300 print:text-black print:bg-white"
                    placeholder="Private notes — storage, insurance policy #, condition changes, etc."
                  />
                </label>
              </div>
            </li>
          ))}
        </ol>

        <button
          onClick={addOwner}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-700/50 text-teal-300 font-medium rounded-lg px-4 py-2 text-sm print:hidden"
        >
          + Add custodian
        </button>
      </div>

      {/* Provenance statement */}
      <div className="bg-teal-950/30 border border-teal-800/40 rounded-xl p-5 sm:p-6 print:border-gray-300 print:bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold print:text-black">Provenance Statement</h2>
          <span className="text-xs text-teal-400 print:hidden">Auto-generated</span>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed print:text-black">{provenanceStatement}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg px-4 py-2 text-sm"
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          onClick={() => handleCopy('markdown')}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium rounded-lg px-4 py-2 text-sm"
        >
          {copied === 'markdown' ? '✓ Copied' : '📋 Copy full record (Markdown)'}
        </button>
        <button
          onClick={() => handleCopy('statement')}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium rounded-lg px-4 py-2 text-sm"
        >
          {copied === 'statement' ? '✓ Copied' : '📋 Copy provenance statement'}
        </button>
      </div>

      {/* Educational note */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6 print:hidden">
        <h3 className="text-white font-semibold mb-3">What earns an A-grade provenance?</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">Named first acquirer</strong> — pack pull by a known collector, or a documented original consignment.</span></li>
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">No custody gaps</strong> — every period from pack to present is accounted for. One unknown segment drops you a full grade.</span></li>
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">Auction lot numbers</strong> — if a card passed through Heritage, Goldin, PWCC, REA, or Lelands, record the lot number. It is verifiable in public archives.</span></li>
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">Cert continuity</strong> — same cert number across sales = same physical slab = clean grading chain.</span></li>
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">Named collection tags</strong> — Copeland, Gidwitz, Newman, Fogel and others add 10-30% premium at resale.</span></li>
          <li className="flex gap-2"><span className="text-teal-400">•</span><span><strong className="text-white">Prices in the chain</strong> — each recorded sale doubles as an appraisal comp. Missing prices = missing evidence.</span></li>
        </ul>
      </div>
    </div>
  );
}
