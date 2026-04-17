'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_appraisal_letter_v1';

type Carrier = {
  id: string;
  name: string;
  abbreviation: string;
  selfAppraisalCap: number; // max value per card for self-appraisal acceptance
  requiresPhotos: boolean;
  formattingNote: string;
  openingPhrase: string;
  closingPhrase: string;
};

const CARRIERS: Carrier[] = [
  {
    id: 'cis',
    name: 'Collectibles Insurance Services',
    abbreviation: 'CIS',
    selfAppraisalCap: 5000,
    requiresPhotos: false,
    formattingNote: 'Largest hobby specialist. Accepts self-appraisals under $5K per card with recent comparable-sale citations. Worldwide coverage incl. mysterious disappearance. Standard-format letter accepted.',
    openingPhrase: 'I, the undersigned, hereby certify that I have examined the following sports card collection and have appraised each item listed below at its current fair market replacement value, based on recent public sales comparables. This appraisal is submitted for the purpose of Scheduled Personal Property coverage under policy with Collectibles Insurance Services.',
    closingPhrase: 'I affirm under penalty of perjury that the above valuations reflect my good-faith assessment of current replacement cost based on verifiable recent comparable sales. Photographic documentation of each item is available upon request.',
  },
  {
    id: 'aci',
    name: 'American Collectors Insurance',
    abbreviation: 'ACI',
    selfAppraisalCap: 5000,
    requiresPhotos: false,
    formattingNote: 'Second-largest hobby specialist. Similar terms to CIS. Accepts self-appraisals under $5K per card. Requires comparable-sale basis for each item.',
    openingPhrase: 'This appraisal letter is submitted to American Collectors Insurance for the purpose of scheduling the following sports card collection under the Valuable Personal Property endorsement of the policyholder\'s homeowners insurance. Each item has been individually examined and assigned a current fair market replacement value.',
    closingPhrase: 'The undersigned certifies the above valuations are based on recent comparable sales and reflect current hobby market conditions as of the appraisal date. All supporting documentation (certification lookups, sale comparables, photographs) is retained and available upon request.',
  },
  {
    id: 'aig',
    name: 'AIG Private Client',
    abbreviation: 'AIG-PC',
    selfAppraisalCap: 0, // requires third-party for all
    requiresPhotos: true,
    formattingNote: 'Private Client carrier — requires THIRD-PARTY appraisal for all scheduled items regardless of value. Letter should be prepared by a certified appraiser, PSA/CGC/SGC appraisal service, or major auction house evaluator. Photos required. Typical policy for collections >$250K.',
    openingPhrase: 'This appraisal report is prepared for AIG Private Client Group for the purpose of scheduling the referenced sports card collection under a Valuable Articles policy. The appraiser is a certified third-party evaluator and has no financial interest in the scheduled items.',
    closingPhrase: 'This report complies with the Uniform Standards of Professional Appraisal Practice (USPAP) and is prepared solely for insurance scheduling purposes. The appraised values represent current retail replacement cost in the hobby market, including estimated acquisition cost, shipping, and grading service fees where applicable.',
  },
  {
    id: 'chubb',
    name: 'Chubb Masterpiece',
    abbreviation: 'CHUBB',
    selfAppraisalCap: 0,
    requiresPhotos: true,
    formattingNote: 'Private Client carrier. Requires certified third-party appraisal for scheduled items. Photos required. Typical policy for high-net-worth collections >$100K. Chubb offers appraisal reimbursement up to $500 per item for items re-appraised during the policy period.',
    openingPhrase: 'This appraisal report is prepared for Chubb Masterpiece policy endorsement for the referenced sports card collection. The appraiser certifies compliance with USPAP standards and declares no personal or financial interest in the items appraised.',
    closingPhrase: 'Valuations reflect current retail replacement cost in the sports card hobby market as of the appraisal date. Supporting documentation including certification verifications, recent comparable sales records, and high-resolution photographs is attached as appendix material.',
  },
  {
    id: 'sf',
    name: 'State Farm Personal Articles',
    abbreviation: 'SF',
    selfAppraisalCap: 2500,
    requiresPhotos: false,
    formattingNote: 'Widely-available mainstream carrier. Accepts self-appraisal for items under $2,500, requires third-party appraisal above. Personal Articles Policy is separate from homeowners — scheduling is item-by-item with named perils.',
    openingPhrase: 'I am submitting this appraisal letter to State Farm Insurance for the purpose of adding the following sports card items to my Personal Articles Policy as scheduled property.',
    closingPhrase: 'I certify that the above valuations are based on my good-faith assessment of current fair market replacement cost using recent verifiable sales as the basis. I understand that State Farm may request additional documentation or a third-party appraisal for any item above $2,500 at the carrier\'s discretion.',
  },
];

type CardLine = {
  id: string;
  year: string;
  set: string;
  player: string;
  cardNumber: string;
  grade: string; // PSA 9, CGC 9.5, Raw, etc.
  certNumber: string;
  condition: string;
  appraisedValue: number;
  compSource: string;
};

type State = {
  appraiserName: string;
  appraiserAddress: string;
  appraiserCreds: string;
  ownerName: string;
  ownerAddress: string;
  policyNumber: string;
  appraisalDate: string;
  carrierId: string;
  cards: CardLine[];
};

const DEFAULT_STATE: State = {
  appraiserName: '',
  appraiserAddress: '',
  appraiserCreds: '',
  ownerName: '',
  ownerAddress: '',
  policyNumber: '',
  appraisalDate: new Date().toISOString().slice(0, 10),
  carrierId: 'cis',
  cards: [
    { id: 'c1', year: '2003', set: 'Topps Chrome', player: 'LeBron James', cardNumber: '#111', grade: 'PSA 9', certNumber: '67845123', condition: 'Mint — corners crisp, centering 55/45, surface scratch-free', appraisedValue: 12500, compSource: 'PWCC sale 2026-03-15 $11,800; Goldin sale 2026-02-08 $12,900; eBay BIN 2026-03-22 $12,300' },
    { id: 'c2', year: '1986', set: 'Fleer Basketball', player: 'Michael Jordan', cardNumber: '#57', grade: 'PSA 8', certNumber: '45123789', condition: 'Near-mint — minor wax stain upper-left border, otherwise pristine', appraisedValue: 8200, compSource: 'Heritage sale 2026-01-28 $7,900; eBay sold 2026-03-01 $8,400; PWCC sale 2026-02-20 $8,100' },
    { id: 'c3', year: '2018', set: 'Prizm Basketball', player: 'Luka Doncic', cardNumber: '#280 Silver', grade: 'PSA 10', certNumber: '71234567', condition: 'Gem-mint — perfect centering, no flaws, PSA 10 population dense', appraisedValue: 3800, compSource: 'eBay sold 2026-03-10 $3,900; Goldin sale 2026-02-15 $3,700; PWCC 2026-03-05 $3,850' },
  ],
};

function today(): string { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
function fmtMoney(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}

export default function AppraisalLetterClient() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);
  const [showLetter, setShowLetter] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        setState({ ...DEFAULT_STATE, ...parsed, cards: Array.isArray(parsed.cards) ? parsed.cards : DEFAULT_STATE.cards });
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const carrier = CARRIERS.find(c => c.id === state.carrierId) || CARRIERS[0];

  const totalValue = useMemo(() =>
    state.cards.reduce((s, c) => s + (c.appraisedValue || 0), 0)
  , [state.cards]);

  const flaggedCards = useMemo(() => {
    // Flag cards above the carrier's self-appraisal cap
    if (carrier.selfAppraisalCap === 0) {
      return state.cards.map(c => ({ card: c, reason: 'third-party required' }));
    }
    return state.cards
      .filter(c => c.appraisedValue > carrier.selfAppraisalCap)
      .map(c => ({ card: c, reason: `above $${carrier.selfAppraisalCap.toLocaleString()} self-appraisal cap` }));
  }, [state.cards, carrier]);

  function addCard() {
    const id = Math.random().toString(36).slice(2, 10);
    setState({
      ...state,
      cards: [...state.cards, { id, year: '', set: '', player: '', cardNumber: '', grade: 'Raw', certNumber: '', condition: '', appraisedValue: 0, compSource: '' }],
    });
  }
  function removeCard(id: string) {
    setState({ ...state, cards: state.cards.filter(c => c.id !== id) });
  }
  function updateCard(id: string, patch: Partial<CardLine>) {
    setState({ ...state, cards: state.cards.map(c => c.id === id ? { ...c, ...patch } : c) });
  }
  function clearSample() {
    if (!confirm('Clear the sample cards?')) return;
    setState({ ...state, cards: [] });
  }
  function resetSample() {
    if (!confirm('Replace with sample cards?')) return;
    setState({ ...state, cards: DEFAULT_STATE.cards });
  }

  const letterText = useMemo(() => {
    const lines: string[] = [];
    lines.push('');
    lines.push('APPRAISAL LETTER FOR SCHEDULED PERSONAL PROPERTY');
    lines.push('');
    lines.push(`Date: ${fmtDate(state.appraisalDate)}`);
    lines.push('');
    lines.push(`To: ${carrier.name}`);
    lines.push('    Underwriting / Claims Department');
    if (state.policyNumber) lines.push(`    Re: Policy ${state.policyNumber}`);
    lines.push('');
    lines.push(`From: ${state.appraiserName || '[Appraiser name]'}`);
    if (state.appraiserCreds) lines.push(`      ${state.appraiserCreds}`);
    if (state.appraiserAddress) lines.push(`      ${state.appraiserAddress}`);
    lines.push('');
    lines.push(`Subject: Scheduled Personal Property Appraisal — Sports Card Collection`);
    if (state.ownerName) lines.push(`         Insured: ${state.ownerName}`);
    if (state.ownerAddress) lines.push(`         Address: ${state.ownerAddress}`);
    lines.push('');
    lines.push(carrier.openingPhrase);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push('SCHEDULE OF APPRAISED ITEMS');
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push('');
    state.cards.forEach((c, i) => {
      lines.push(`ITEM ${i + 1}`);
      lines.push(`  Identification: ${c.year} ${c.set} ${c.player} ${c.cardNumber}`);
      lines.push(`  Grade: ${c.grade}${c.certNumber ? ` (Cert ${c.certNumber})` : ''}`);
      if (c.condition) lines.push(`  Condition: ${c.condition}`);
      lines.push(`  Appraised Replacement Value: ${fmtMoney(c.appraisedValue)}`);
      if (c.compSource) lines.push(`  Basis: ${c.compSource}`);
      lines.push('');
    });
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push(`TOTAL SCHEDULED VALUE: ${fmtMoney(totalValue)}`);
    lines.push(`Items scheduled: ${state.cards.length}`);
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(carrier.closingPhrase);
    lines.push('');
    lines.push('');
    lines.push('Signature: _______________________________');
    lines.push(`           ${state.appraiserName || '[Appraiser name]'}`);
    lines.push(`           ${fmtDate(state.appraisalDate)}`);
    if (carrier.requiresPhotos) {
      lines.push('');
      lines.push('APPENDIX: High-resolution front/back photographs of each item attached.');
    }
    lines.push('');
    lines.push('---');
    lines.push('Generated with CardVault Insurance Appraisal Letter · https://cardvault-two.vercel.app/vault/appraisal-letter');
    return lines.join('\n');
  }, [state, carrier, totalValue]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Carrier selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="text-sm font-semibold text-slate-300 mb-2">Carrier</div>
        <div className="flex flex-wrap gap-2">
          {CARRIERS.map(c => (
            <button
              key={c.id}
              onClick={() => setState({ ...state, carrierId: c.id })}
              className={`text-left px-3 py-2 rounded-md border transition ${
                state.carrierId === c.id
                  ? 'bg-orange-600 border-orange-500 text-white'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-semibold text-sm">{c.abbreviation}</div>
              <div className={`text-[10px] mt-0.5 ${state.carrierId === c.id ? 'text-orange-100' : 'text-slate-500'}`}>
                {c.selfAppraisalCap === 0 ? 'third-party required' : `self-appraisal ≤ $${c.selfAppraisalCap.toLocaleString()}`}
              </div>
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400 bg-slate-950/60 rounded-md p-3 leading-relaxed">
          <strong className="text-slate-300">{carrier.name}:</strong> {carrier.formattingNote}
        </div>
      </div>

      {/* Appraiser + owner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-300 mb-2">Appraiser (signer)</div>
            <input
              type="text"
              value={state.appraiserName}
              onChange={e => setState({ ...state, appraiserName: e.target.value })}
              placeholder="Full name"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-2"
            />
            <input
              type="text"
              value={state.appraiserCreds}
              onChange={e => setState({ ...state, appraiserCreds: e.target.value })}
              placeholder="Credentials (e.g., 'Certified Appraiser — ASA' or 'Collection Owner — self-appraisal')"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-2"
            />
            <input
              type="text"
              value={state.appraiserAddress}
              onChange={e => setState({ ...state, appraiserAddress: e.target.value })}
              placeholder="Address"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-300 mb-2">Insured (policyholder)</div>
            <input
              type="text"
              value={state.ownerName}
              onChange={e => setState({ ...state, ownerName: e.target.value })}
              placeholder="Full name"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-2"
            />
            <input
              type="text"
              value={state.policyNumber}
              onChange={e => setState({ ...state, policyNumber: e.target.value })}
              placeholder="Policy number (optional)"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-2"
            />
            <input
              type="text"
              value={state.ownerAddress}
              onChange={e => setState({ ...state, ownerAddress: e.target.value })}
              placeholder="Address where items are stored"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
        <label className="block">
          <div className="text-sm font-semibold text-slate-300 mb-1">Appraisal date</div>
          <input
            type="date"
            value={state.appraisalDate}
            onChange={e => setState({ ...state, appraisalDate: e.target.value || today() })}
            className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <div className="text-xs text-slate-500 mt-1">Most carriers require this within the past 12 months.</div>
        </label>
      </div>

      {/* Items */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">Scheduled items ({state.cards.length})</div>
            <div className="text-xs text-slate-500">Total appraised: <span className="text-orange-300 font-mono">{fmtMoney(totalValue)}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addCard} className="text-xs px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-semibold transition">+ Add item</button>
            <button onClick={resetSample} className="text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white transition">Reset sample</button>
            <button onClick={clearSample} className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Clear</button>
          </div>
        </div>

        {flaggedCards.length > 0 && (
          <div className="bg-amber-950/40 border-b border-amber-800/50 px-5 py-3 text-xs text-amber-200">
            ⚠️ <strong>{flaggedCards.length} item{flaggedCards.length === 1 ? '' : 's'}</strong> flagged — {flaggedCards[0].reason}. Consider a certified third-party appraisal for these items before submission.
          </div>
        )}

        {state.cards.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No items. Click <strong className="text-orange-400">+ Add item</strong> to start.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {state.cards.map((c, idx) => {
              const flagged = carrier.selfAppraisalCap === 0 || c.appraisedValue > carrier.selfAppraisalCap;
              return (
                <div key={c.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-orange-400">ITEM {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      {flagged && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/60">
                          ⚠ third-party recommended
                        </span>
                      )}
                      <button onClick={() => removeCard(c.id)} className="text-xs text-slate-500 hover:text-red-400 transition">✕ Remove</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="block">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Year</div>
                      <input
                        type="text"
                        value={c.year}
                        onChange={e => updateCard(c.id, { year: e.target.value })}
                        placeholder="2003"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block col-span-2 sm:col-span-1">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Set</div>
                      <input
                        type="text"
                        value={c.set}
                        onChange={e => updateCard(c.id, { set: e.target.value })}
                        placeholder="Topps Chrome"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block col-span-2 sm:col-span-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Player</div>
                      <input
                        type="text"
                        value={c.player}
                        onChange={e => updateCard(c.id, { player: e.target.value })}
                        placeholder="LeBron James"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="block">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Card #</div>
                      <input
                        type="text"
                        value={c.cardNumber}
                        onChange={e => updateCard(c.id, { cardNumber: e.target.value })}
                        placeholder="#111"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Grade</div>
                      <input
                        type="text"
                        value={c.grade}
                        onChange={e => updateCard(c.id, { grade: e.target.value })}
                        placeholder="PSA 9"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Cert #</div>
                      <input
                        type="text"
                        value={c.certNumber}
                        onChange={e => updateCard(c.id, { certNumber: e.target.value })}
                        placeholder="optional"
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Appraised value</div>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={c.appraisedValue}
                          onChange={e => updateCard(c.id, { appraisedValue: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                          min={0}
                        />
                      </div>
                    </label>
                  </div>

                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Condition</div>
                    <input
                      type="text"
                      value={c.condition}
                      onChange={e => updateCard(c.id, { condition: e.target.value })}
                      placeholder="Mint — corners crisp, centering 55/45, surface scratch-free"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </label>

                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Comparable sale basis</div>
                    <textarea
                      value={c.compSource}
                      onChange={e => updateCard(c.id, { compSource: e.target.value })}
                      placeholder="eBay sold 2026-03-15 $12,300; PWCC 2026-02-08 $12,900; Goldin 2026-03-22 $11,800"
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Letter preview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Generated letter preview</div>
            <div className="text-xs text-slate-500">{carrier.name} format</div>
          </div>
          <button
            onClick={() => setShowLetter(s => !s)}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {showLetter ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLetter && (
          <pre className="p-5 text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950/80 max-h-96 overflow-y-auto">
            {letterText}
          </pre>
        )}
      </div>

      {/* Copy */}
      {state.cards.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            {copied ? '✓ Copied letter' : 'Copy letter'}
          </button>
        </div>
      )}
    </div>
  );
}
