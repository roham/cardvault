'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_trade_equalizer_v1';

type CardEntry = {
  id: string;
  label: string;
  fmv: number;
  basis: number;
  isLongTerm: boolean;
};

type Side = {
  name: string;
  cards: CardEntry[];
};

type State = {
  mySide: Side;
  theirSide: Side;
  additionalCashFromMyside: number; // negative = I RECEIVE cash
};

const DEFAULT_STATE: State = {
  mySide: {
    name: 'My side',
    cards: [
      { id: 'm1', label: '2003-04 Topps Chrome LeBron PSA 9', fmv: 12500, basis: 4000, isLongTerm: true },
      { id: 'm2', label: '2018 Prizm Luka Silver PSA 10', fmv: 3800, basis: 600, isLongTerm: true },
    ],
  },
  theirSide: {
    name: 'Their side',
    cards: [
      { id: 't1', label: '1986 Fleer Jordan PSA 8', fmv: 18000, basis: 0, isLongTerm: true },
    ],
  },
  additionalCashFromMyside: 0,
};

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}

function addCard(side: Side): Side {
  const id = Math.random().toString(36).slice(2, 10);
  return { ...side, cards: [...side.cards, { id, label: '', fmv: 0, basis: 0, isLongTerm: true }] };
}
function removeCard(side: Side, id: string): Side {
  return { ...side, cards: side.cards.filter(c => c.id !== id) };
}
function updateCard(side: Side, id: string, patch: Partial<CardEntry>): Side {
  return { ...side, cards: side.cards.map(c => c.id === id ? { ...c, ...patch } : c) };
}

export default function TradeEqualizerClient() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) setState({ ...DEFAULT_STATE, ...JSON.parse(s) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const mineFmv = state.mySide.cards.reduce((s, c) => s + c.fmv, 0);
  const mineBasis = state.mySide.cards.reduce((s, c) => s + c.basis, 0);
  const theirFmv = state.theirSide.cards.reduce((s, c) => s + c.fmv, 0);
  const theirBasis = state.theirSide.cards.reduce((s, c) => s + c.basis, 0);

  const recommendedBootFromMe = useMemo(() => {
    // If my cards worth less than theirs, I pay the delta
    return Math.max(0, theirFmv - mineFmv);
  }, [theirFmv, mineFmv]);
  const recommendedBootFromThem = useMemo(() => {
    return Math.max(0, mineFmv - theirFmv);
  }, [mineFmv, theirFmv]);

  // Actual trade economics (using user's entered cash)
  const myReceived = theirFmv + Math.min(0, -state.additionalCashFromMyside); // cards received + cash if I receive
  const myGiven = mineFmv + Math.max(0, state.additionalCashFromMyside); // cards given + cash if I pay
  const myNetAdvantage = myReceived - myGiven; // positive = I got more value
  const theirNetAdvantage = -myNetAdvantage;

  // Realized gain (IRC §1001): my realized gain = FMV of cards I gave - my basis in those cards
  const myRealizedGain = mineFmv - mineBasis;
  const theirRealizedGain = theirFmv - theirBasis;

  const shortTermCount = state.mySide.cards.filter(c => !c.isLongTerm).length;
  const theirShortTermCount = state.theirSide.cards.filter(c => !c.isLongTerm).length;

  async function handleCopy() {
    const lines = [
      `Trade Equalizer Report`,
      ``,
      `MY SIDE (${state.mySide.cards.length} cards):`,
      ...state.mySide.cards.map((c, i) => `  ${i+1}. ${c.label || '(unnamed)'} — FMV ${fmt(c.fmv)} / basis ${fmt(c.basis)} / ${c.isLongTerm ? 'LT' : 'ST'}`),
      `  Subtotal FMV: ${fmt(mineFmv)}`,
      `  Subtotal basis: ${fmt(mineBasis)}`,
      ``,
      `THEIR SIDE (${state.theirSide.cards.length} cards):`,
      ...state.theirSide.cards.map((c, i) => `  ${i+1}. ${c.label || '(unnamed)'} — FMV ${fmt(c.fmv)} / basis ${fmt(c.basis)} / ${c.isLongTerm ? 'LT' : 'ST'}`),
      `  Subtotal FMV: ${fmt(theirFmv)}`,
      `  Subtotal basis: ${fmt(theirBasis)}`,
      ``,
      `FAIRNESS:`,
      `  My FMV ${fmt(mineFmv)} vs Their FMV ${fmt(theirFmv)}`,
      `  Delta: ${myNetAdvantage >= 0 ? '+' : ''}${fmt(Math.abs(myNetAdvantage))} advantage to ${myNetAdvantage >= 0 ? 'me' : 'them'}`,
      `  Recommended cash boot: ${recommendedBootFromMe > 0 ? `I pay ${fmt(recommendedBootFromMe)}` : recommendedBootFromThem > 0 ? `They pay ${fmt(recommendedBootFromThem)}` : 'even — no cash'}`,
      `  Actual cash boot entered: ${state.additionalCashFromMyside > 0 ? `I pay ${fmt(state.additionalCashFromMyside)}` : state.additionalCashFromMyside < 0 ? `I receive ${fmt(-state.additionalCashFromMyside)}` : 'zero'}`,
      ``,
      `REALIZED GAINS (per IRC §1001 — collectibles no longer qualify for §1031 deferral post-TCJA 2018):`,
      `  My realized gain: ${fmt(myRealizedGain)} ${shortTermCount > 0 ? `(${shortTermCount} SHORT-TERM cards — consider waiting for LTCG)` : '(all LT)'}`,
      `  Their realized gain: ${fmt(theirRealizedGain)} ${theirShortTermCount > 0 ? `(${theirShortTermCount} ST)` : '(all LT)'}`,
      ``,
      `via CardVault · https://cardvault-two.vercel.app/vault/trade-equalizer`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function renderSide(side: Side, isMine: boolean) {
    const update = (updater: (s: Side) => Side) => {
      if (isMine) setState(s => ({ ...s, mySide: updater(s.mySide) }));
      else setState(s => ({ ...s, theirSide: updater(s.theirSide) }));
    };
    const sideFmv = side.cards.reduce((s, c) => s + c.fmv, 0);
    const sideBasis = side.cards.reduce((s, c) => s + c.basis, 0);

    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <div>
            <input
              type="text"
              value={side.name}
              onChange={e => update(s => ({ ...s, name: e.target.value }))}
              className="bg-transparent text-sm font-bold text-white focus:outline-none"
            />
            <div className="text-xs text-slate-500">{side.cards.length} cards · FMV {fmt(sideFmv)} · basis {fmt(sideBasis)}</div>
          </div>
          <button onClick={() => update(addCard)} className="text-xs px-3 py-1.5 rounded-md bg-lime-600 hover:bg-lime-500 text-slate-900 font-semibold">+ Card</button>
        </div>
        <div className="divide-y divide-slate-800">
          {side.cards.length === 0 && (
            <div className="p-5 text-center text-slate-500 text-xs">No cards. Click + Card.</div>
          )}
          {side.cards.map(c => (
            <div key={c.id} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={c.label}
                  onChange={e => update(s => updateCard(s, c.id, { label: e.target.value }))}
                  placeholder="Card ID (year / set / player / grade)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500"
                />
                <button onClick={() => update(s => removeCard(s, c.id))} className="text-xs text-slate-500 hover:text-red-400">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">FMV</div>
                  <div className="relative">
                    <span className="absolute left-2 top-1 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={c.fmv}
                      onChange={e => update(s => updateCard(s, c.id, { fmv: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </label>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Cost basis</div>
                  <div className="relative">
                    <span className="absolute left-2 top-1 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={c.basis}
                      onChange={e => update(s => updateCard(s, c.id, { basis: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={c.isLongTerm}
                    onChange={e => update(s => updateCard(s, c.id, { isLongTerm: e.target.checked }))}
                    className="accent-lime-500"
                  />
                  Long-term
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Two-side grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSide(state.mySide, true)}
        {renderSide(state.theirSide, false)}
      </div>

      {/* Cash boot */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-300">Cash boot</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Recommended (I pay)</div>
            <div className={`text-xl font-bold ${recommendedBootFromMe > 0 ? 'text-lime-300' : 'text-slate-600'}`}>
              {recommendedBootFromMe > 0 ? fmt(recommendedBootFromMe) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Recommended (they pay)</div>
            <div className={`text-xl font-bold ${recommendedBootFromThem > 0 ? 'text-lime-300' : 'text-slate-600'}`}>
              {recommendedBootFromThem > 0 ? fmt(recommendedBootFromThem) : '—'}
            </div>
          </div>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Actual cash (signed: + I pay, - I receive)</div>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
              <input
                type="number"
                value={state.additionalCashFromMyside}
                onChange={e => setState(s => ({ ...s, additionalCashFromMyside: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-sm text-white focus:outline-none focus:border-lime-500"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Fairness + realized gains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-lime-950/60 to-lime-900/30 border border-lime-700/50 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-lime-300 mb-3">Fairness check</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">My side FMV:</span><span className="font-mono text-white">{fmt(mineFmv)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Their side FMV:</span><span className="font-mono text-white">{fmt(theirFmv)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Actual cash (net to me):</span><span className={`font-mono ${state.additionalCashFromMyside < 0 ? 'text-emerald-300' : state.additionalCashFromMyside > 0 ? 'text-red-300' : 'text-slate-400'}`}>{state.additionalCashFromMyside < 0 ? '+' : state.additionalCashFromMyside > 0 ? '-' : ''}{fmt(Math.abs(state.additionalCashFromMyside))}</span></div>
            <div className="flex justify-between pt-2 border-t border-lime-800/50 mt-2"><span className="font-semibold text-slate-200">My net advantage:</span><span className={`font-mono font-bold ${myNetAdvantage >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{myNetAdvantage >= 0 ? '+' : ''}{fmt(Math.abs(myNetAdvantage))}</span></div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Realized gains (IRC §1001)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">My realized gain:</span><span className={`font-mono ${myRealizedGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{myRealizedGain >= 0 ? '+' : ''}{fmt(myRealizedGain)}</span></div>
            {shortTermCount > 0 && (
              <div className="text-xs text-amber-400">⚠ {shortTermCount} card{shortTermCount === 1 ? '' : 's'} on my side tagged SHORT-TERM — taxed at ordinary rate, not 28% LTCG cap</div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-700 mt-2"><span className="text-slate-400">Their realized gain:</span><span className={`font-mono ${theirRealizedGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{theirRealizedGain >= 0 ? '+' : ''}{fmt(theirRealizedGain)}</span></div>
          </div>
          <div className="text-xs text-slate-500 mt-3 italic">
            Post-TCJA 2018, card-for-card trades do NOT qualify for §1031 like-kind deferral. Each party realizes gain/loss at trade date.
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCopy}
          className="bg-lime-600 hover:bg-lime-500 text-slate-900 font-semibold px-6 py-2.5 rounded-lg transition"
        >
          {copied ? '✓ Copied trade report' : 'Copy trade report'}
        </button>
      </div>
    </div>
  );
}
