'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CardFrame from '@/components/CardFrame';
import { sportsCards } from '@/data/sports-cards';

/* ── Types ── */
interface BinderState {
  collected: string[];
  want: string[];
  trade: string[];
  name: string;
}

interface TradeProposal {
  id: string;
  offer: string[];   // slugs I'm giving
  request: string[];  // slugs I want
  from: string;       // proposer name
  note: string;
  createdAt: number;
}

interface TradeRecord {
  id: string;
  offer: string[];
  request: string[];
  counterparty: string;
  type: 'sent' | 'received' | 'accepted';
  date: number;
}

type View = 'create' | 'incoming' | 'history';

/* ── Constants ── */
const BINDER_KEY = 'cardvault-binder';
const TRADES_KEY = 'cardvault-trades';
const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE', basketball: '\u{1F3C0}', football: '\u{1F3C8}', hockey: '\u{1F3D2}',
};

/* ── Helpers ── */
function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function encodeTrade(p: TradeProposal): string {
  return btoa(JSON.stringify({ o: p.offer, r: p.request, f: p.from, n: p.note, t: p.createdAt, i: p.id }));
}

function decodeTrade(hash: string): TradeProposal | null {
  try {
    const d = JSON.parse(atob(hash));
    return { offer: d.o || [], request: d.r || [], from: d.f || 'A Collector', note: d.n || '', createdAt: d.t || Date.now(), id: d.i || '' };
  } catch { return null; }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getCardBySlug(slug: string) {
  return sportsCards.find(c => c.slug === slug);
}

/* ── Verdict logic ── */
function getTradeVerdict(offerVal: number, requestVal: number): { label: string; color: string; desc: string } {
  if (offerVal === 0 && requestVal === 0) return { label: 'Empty', color: 'text-gray-400', desc: 'Add cards to both sides' };
  const diff = offerVal - requestVal;
  const pct = requestVal > 0 ? Math.abs(diff) / requestVal : 0;
  if (pct <= 0.1) return { label: 'Fair Trade', color: 'text-emerald-400', desc: 'Within 10% of equal value' };
  if (diff > 0) return { label: 'Overpaying', color: 'text-amber-400', desc: `Offer is $${diff.toLocaleString()} more (${(pct * 100).toFixed(0)}% above)` };
  return { label: 'Underpaying', color: 'text-red-400', desc: `Offer is $${Math.abs(diff).toLocaleString()} less (${(pct * 100).toFixed(0)}% below)` };
}

/* ── Component ── */
export default function TradeHubClient() {
  const [mounted, setMounted] = useState(false);
  const [binder, setBinder] = useState<BinderState>({ collected: [], want: [], trade: [], name: '' });
  const [view, setView] = useState<View>('create');
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);

  // Create trade state
  const [offerSlugs, setOfferSlugs] = useState<string[]>([]);
  const [requestSlugs, setRequestSlugs] = useState<string[]>([]);
  const [tradeNote, setTradeNote] = useState('');
  const [searchOffer, setSearchOffer] = useState('');
  const [searchRequest, setSearchRequest] = useState('');

  // Incoming trade state
  const [incomingTrade, setIncomingTrade] = useState<TradeProposal | null>(null);

  // Share state
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [tradeAccepted, setTradeAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load binder
    try {
      const saved = localStorage.getItem(BINDER_KEY);
      if (saved) setBinder(JSON.parse(saved));
    } catch {}
    // Load trade history
    try {
      const saved = localStorage.getItem(TRADES_KEY);
      if (saved) setTradeHistory(JSON.parse(saved));
    } catch {}
    // Check for incoming trade in hash
    const hash = window.location.hash;
    if (hash.startsWith('#trade=')) {
      const trade = decodeTrade(hash.slice('#trade='.length));
      if (trade) {
        setIncomingTrade(trade);
        setView('incoming');
      }
    }
  }, []);

  // Save trade history
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(TRADES_KEY, JSON.stringify(tradeHistory)); } catch {}
  }, [tradeHistory, mounted]);

  // Save binder changes
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(BINDER_KEY, JSON.stringify(binder)); } catch {}
  }, [binder, mounted]);

  /* ── Offer/Request value calculations ── */
  const offerCards = useMemo(() => offerSlugs.map(getCardBySlug).filter(Boolean) as typeof sportsCards, [offerSlugs]);
  const requestCards = useMemo(() => requestSlugs.map(getCardBySlug).filter(Boolean) as typeof sportsCards, [requestSlugs]);
  const offerTotal = useMemo(() => offerCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0), [offerCards]);
  const requestTotal = useMemo(() => requestCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0), [requestCards]);
  const verdict = useMemo(() => getTradeVerdict(offerTotal, requestTotal), [offerTotal, requestTotal]);

  /* ── Incoming trade values ── */
  const incomingOfferCards = useMemo(() =>
    incomingTrade ? incomingTrade.offer.map(getCardBySlug).filter(Boolean) as typeof sportsCards : [],
  [incomingTrade]);
  const incomingRequestCards = useMemo(() =>
    incomingTrade ? incomingTrade.request.map(getCardBySlug).filter(Boolean) as typeof sportsCards : [],
  [incomingTrade]);
  const incomingOfferTotal = useMemo(() => incomingOfferCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0), [incomingOfferCards]);
  const incomingRequestTotal = useMemo(() => incomingRequestCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0), [incomingRequestCards]);
  const incomingVerdict = useMemo(() => getTradeVerdict(incomingOfferTotal, incomingRequestTotal), [incomingOfferTotal, incomingRequestTotal]);

  /* ── Search results ── */
  const offerResults = useMemo(() => {
    if (!searchOffer || searchOffer.length < 2) return [];
    const q = searchOffer.toLowerCase();
    // Show cards from binder trade tab first, then all cards
    const tradeCards = binder.trade.map(getCardBySlug).filter(Boolean) as typeof sportsCards;
    const matched = tradeCards.filter(c =>
      c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q)
    );
    const other = sportsCards.filter(c =>
      !binder.trade.includes(c.slug) &&
      (c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
    );
    return [...matched, ...other].filter(c => !offerSlugs.includes(c.slug)).slice(0, 8);
  }, [searchOffer, binder.trade, offerSlugs]);

  const requestResults = useMemo(() => {
    if (!searchRequest || searchRequest.length < 2) return [];
    const q = searchRequest.toLowerCase();
    return sportsCards
      .filter(c =>
        (c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q)) &&
        !requestSlugs.includes(c.slug)
      )
      .slice(0, 8);
  }, [searchRequest, requestSlugs]);

  /* ── Actions ── */
  const addToOffer = useCallback((slug: string) => {
    setOfferSlugs(prev => prev.includes(slug) ? prev : [...prev, slug]);
    setSearchOffer('');
  }, []);

  const addToRequest = useCallback((slug: string) => {
    setRequestSlugs(prev => prev.includes(slug) ? prev : [...prev, slug]);
    setSearchRequest('');
  }, []);

  const removeFromOffer = useCallback((slug: string) => {
    setOfferSlugs(prev => prev.filter(s => s !== slug));
  }, []);

  const removeFromRequest = useCallback((slug: string) => {
    setRequestSlugs(prev => prev.filter(s => s !== slug));
  }, []);

  function createAndShare() {
    const proposal: TradeProposal = {
      id: generateId(),
      offer: offerSlugs,
      request: requestSlugs,
      from: binder.name || 'A Collector',
      note: tradeNote,
      createdAt: Date.now(),
    };
    const encoded = encodeTrade(proposal);
    const url = `${window.location.origin}/trade-hub#trade=${encoded}`;
    setShareUrl(url);
    setShowShareModal(true);
    // Save to history as sent
    const sentRecord: TradeRecord = {
      id: proposal.id,
      offer: offerSlugs,
      request: requestSlugs,
      counterparty: 'Pending',
      type: 'sent',
      date: Date.now(),
    };
    setTradeHistory(prev => [sentRecord, ...prev].slice(0, 50));
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareToX() {
    const text = `I just proposed a card trade on CardVault! Offering $${offerTotal.toLocaleString()} in cards for $${requestTotal.toLocaleString()}. Check it out:`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function acceptIncomingTrade() {
    if (!incomingTrade) return;
    // Update binder: add what they offered (I receive), remove what they requested (I give)
    setBinder(prev => {
      const newCollected = [...prev.collected];
      const newTrade = [...prev.trade];
      const newWant = [...prev.want];
      // Add offered cards to my collected
      for (const slug of incomingTrade.offer) {
        if (!newCollected.includes(slug)) newCollected.push(slug);
      }
      // Remove requested cards from all tabs
      for (const slug of incomingTrade.request) {
        const ci = newCollected.indexOf(slug);
        if (ci >= 0) newCollected.splice(ci, 1);
        const ti = newTrade.indexOf(slug);
        if (ti >= 0) newTrade.splice(ti, 1);
        const wi = newWant.indexOf(slug);
        if (wi >= 0) newWant.splice(wi, 1);
      }
      return { ...prev, collected: newCollected, trade: newTrade, want: newWant };
    });
    // Save to history
    const acceptedRecord: TradeRecord = {
      id: incomingTrade.id,
      offer: incomingTrade.request, // what I gave
      request: incomingTrade.offer, // what I received
      counterparty: incomingTrade.from,
      type: 'accepted',
      date: Date.now(),
    };
    setTradeHistory(prev => [acceptedRecord, ...prev].slice(0, 50));
    setTradeAccepted(true);
  }

  function resetTrade() {
    setOfferSlugs([]);
    setRequestSlugs([]);
    setTradeNote('');
    setShowShareModal(false);
    setShareUrl('');
  }

  function dismissIncoming() {
    setIncomingTrade(null);
    setView('create');
    setTradeAccepted(false);
    window.location.hash = '';
  }

  /* ── Render helpers ── */
  function renderCardRow(card: typeof sportsCards[0], onRemove?: () => void) {
    return (
      <div key={card.slug} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-2.5 group">
        <div className="w-14 shrink-0">
          <CardFrame card={card} size="small" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">{card.player}</p>
          <p className="text-gray-500 text-[10px] truncate">{card.year} {card.set.split(' ').slice(1, 3).join(' ')}</p>
          <p className="text-emerald-400 text-xs font-bold">{card.estimatedValueRaw}</p>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-6 h-6 bg-red-900/60 hover:bg-red-800 border border-red-700/50 rounded-full flex items-center justify-center text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            x
          </button>
        )}
      </div>
    );
  }

  function renderSearchDropdown(results: typeof sportsCards, onSelect: (slug: string) => void) {
    if (results.length === 0) return null;
    return (
      <div className="absolute left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-xl">
        {results.map(card => (
          <button
            key={card.slug}
            onClick={() => onSelect(card.slug)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/60 transition-colors border-b border-gray-800 last:border-0 text-left"
          >
            <span className="text-sm shrink-0">{SPORT_ICONS[card.sport] || ''}</span>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{card.name}</p>
              <p className="text-gray-500 text-[10px]">{card.player} &middot; {card.year}</p>
            </div>
            <p className="text-emerald-400 text-xs font-bold shrink-0">{card.estimatedValueRaw}</p>
          </button>
        ))}
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-12 bg-gray-800 rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-900 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            Phase 3: Digital Collectibles
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Trade Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Propose trades, evaluate fairness, and swap cards with collectors.</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          { key: 'create' as View, label: 'Create Trade', icon: '\u{1F4DD}', badge: 0 },
          { key: 'incoming' as View, label: 'Incoming', icon: '\u{1F4E8}', badge: incomingTrade ? 1 : 0 },
          { key: 'history' as View, label: 'History', icon: '\u{1F4CB}', badge: tradeHistory.length },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              view === tab.key
                ? 'bg-purple-600/20 border border-purple-600/50 text-purple-300'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {'badge' in tab && tab.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                view === tab.key ? 'bg-purple-600/30 text-purple-300' : 'bg-gray-800 text-gray-500'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════ CREATE TRADE VIEW ══════ */}
      {view === 'create' && (
        <>
          {/* Two-sided trade builder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* LEFT: My Offer */}
            <div className="bg-gray-900/50 border border-emerald-800/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-emerald-400">My Offer</h2>
                  <p className="text-gray-500 text-xs">Cards you are giving</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-lg">${offerTotal.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs">{offerCards.length} card{offerCards.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchOffer}
                  onChange={e => setSearchOffer(e.target.value)}
                  placeholder="Search cards to offer..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-gray-600"
                />
                {renderSearchDropdown(offerResults, addToOffer)}
              </div>
              {/* Quick add from trade binder */}
              {binder.trade.length > 0 && offerCards.length === 0 && !searchOffer && (
                <div className="mb-3">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">From your trade binder</p>
                  <div className="flex flex-wrap gap-1.5">
                    {binder.trade.slice(0, 6).map(slug => {
                      const card = getCardBySlug(slug);
                      if (!card) return null;
                      return (
                        <button
                          key={slug}
                          onClick={() => addToOffer(slug)}
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-lg border border-gray-700 transition-colors truncate max-w-[140px]"
                        >
                          + {card.player} {card.year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Card list */}
              <div className="space-y-2">
                {offerCards.map(card => renderCardRow(card, () => removeFromOffer(card.slug)))}
                {offerCards.length === 0 && (
                  <div className="text-center py-6 text-gray-600 text-sm">Search above to add cards</div>
                )}
              </div>
            </div>

            {/* RIGHT: I Want */}
            <div className="bg-gray-900/50 border border-amber-800/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-amber-400">I Want</h2>
                  <p className="text-gray-500 text-xs">Cards you want to receive</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold text-lg">${requestTotal.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs">{requestCards.length} card{requestCards.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchRequest}
                  onChange={e => setSearchRequest(e.target.value)}
                  placeholder="Search cards you want..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors placeholder:text-gray-600"
                />
                {renderSearchDropdown(requestResults, addToRequest)}
              </div>
              {/* Quick add from want list */}
              {binder.want.length > 0 && requestCards.length === 0 && !searchRequest && (
                <div className="mb-3">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">From your want list</p>
                  <div className="flex flex-wrap gap-1.5">
                    {binder.want.slice(0, 6).map(slug => {
                      const card = getCardBySlug(slug);
                      if (!card) return null;
                      return (
                        <button
                          key={slug}
                          onClick={() => addToRequest(slug)}
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-lg border border-gray-700 transition-colors truncate max-w-[140px]"
                        >
                          + {card.player} {card.year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Card list */}
              <div className="space-y-2">
                {requestCards.map(card => renderCardRow(card, () => removeFromRequest(card.slug)))}
                {requestCards.length === 0 && (
                  <div className="text-center py-6 text-gray-600 text-sm">Search above to add cards</div>
                )}
              </div>
            </div>
          </div>

          {/* Trade Verdict */}
          {(offerCards.length > 0 || requestCards.length > 0) && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-1">Trade Evaluation</h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</span>
                    <span className="text-gray-500 text-sm">{verdict.desc}</span>
                  </div>
                </div>
                {/* Value bar */}
                <div className="w-full sm:w-64">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-emerald-400">${offerTotal.toLocaleString()}</span>
                    <span className="text-gray-600">vs</span>
                    <span className="text-amber-400">${requestTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                    {(offerTotal + requestTotal > 0) && (
                      <>
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${(offerTotal / (offerTotal + requestTotal)) * 100}%` }}
                        />
                        <div
                          className="bg-amber-500 h-full transition-all"
                          style={{ width: `${(requestTotal / (offerTotal + requestTotal)) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                    <span>Offer</span>
                    <span>Request</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Note + Actions */}
          {offerCards.length > 0 && requestCards.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                value={tradeNote}
                onChange={e => setTradeNote(e.target.value)}
                placeholder="Add a note to your trade proposal (optional)"
                maxLength={140}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors placeholder:text-gray-600"
              />
              <button
                onClick={createAndShare}
                className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                Share Trade Proposal
              </button>
              <button
                onClick={resetTrade}
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-4 py-2.5 rounded-xl border border-gray-700 transition-colors text-sm whitespace-nowrap"
              >
                Clear
              </button>
            </div>
          )}

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-2">Trade Proposal Created!</h3>
                <p className="text-gray-400 text-sm mb-4">Share this link with the collector you want to trade with:</p>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-300 break-all font-mono">{shareUrl.slice(0, 80)}...</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyShareLink} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={shareToX} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl border border-gray-700 text-sm transition-colors">
                    Share to X
                  </button>
                </div>
                <button onClick={() => { setShowShareModal(false); resetTrade(); }} className="w-full mt-3 text-gray-500 hover:text-gray-400 text-sm py-2 transition-colors">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Empty state callout */}
          {offerCards.length === 0 && requestCards.length === 0 && (
            <div className="bg-gradient-to-r from-purple-950/20 to-gray-900/40 border border-purple-800/20 rounded-2xl p-6 text-center mb-6">
              <p className="text-white font-semibold mb-1">Build a trade proposal</p>
              <p className="text-gray-400 text-sm mb-3">
                Search for cards on each side. Cards from your{' '}
                <Link href="/binder" className="text-purple-400 hover:underline">digital binder</Link>{' '}
                trade list appear first.
              </p>
              <p className="text-gray-600 text-xs">Share the proposal link with any collector to execute the trade.</p>
            </div>
          )}
        </>
      )}

      {/* ══════ INCOMING TRADE VIEW ══════ */}
      {view === 'incoming' && incomingTrade && (
        <div className="mb-6">
          {tradeAccepted ? (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">{'\u2705'}</div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Trade Accepted!</h2>
              <p className="text-gray-400 text-sm mb-1">
                You received {incomingOfferCards.length} card{incomingOfferCards.length !== 1 ? 's' : ''} worth ${incomingOfferTotal.toLocaleString()}.
              </p>
              <p className="text-gray-500 text-xs mb-4">Your binder has been updated. The other party will need to accept their side separately.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/binder" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                  View Binder
                </Link>
                <button onClick={dismissIncoming} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-6 py-2.5 rounded-xl border border-gray-700 text-sm transition-colors">
                  Back to Trade Hub
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-5 mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">Trade Proposal from {incomingTrade.from}</h2>
                    <p className="text-gray-500 text-xs">
                      {new Date(incomingTrade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${incomingVerdict.color}`}>{incomingVerdict.label}</span>
                </div>
                {incomingTrade.note && (
                  <p className="text-gray-300 text-sm bg-gray-900/60 rounded-lg px-3 py-2 mt-2 italic">&ldquo;{incomingTrade.note}&rdquo;</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* They Offer (you receive) */}
                <div className="bg-gray-900/50 border border-emerald-800/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-emerald-400">You Receive</h3>
                    <p className="text-emerald-400 font-bold">${incomingOfferTotal.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    {incomingOfferCards.map(card => renderCardRow(card))}
                  </div>
                </div>
                {/* They Want (you give) */}
                <div className="bg-gray-900/50 border border-red-800/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-red-400">You Give</h3>
                    <p className="text-red-400 font-bold">${incomingRequestTotal.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    {incomingRequestCards.map(card => renderCardRow(card))}
                  </div>
                </div>
              </div>

              {/* Evaluation */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-400 mb-2">For You, This Trade Is</h3>
                {/* Flip the verdict from receiver perspective */}
                {(() => {
                  const myVerdict = getTradeVerdict(incomingRequestTotal, incomingOfferTotal);
                  const netValue = incomingOfferTotal - incomingRequestTotal;
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${netValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {netValue >= 0 ? 'Good Deal' : 'Bad Deal'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Net {netValue >= 0 ? '+' : ''}${netValue.toLocaleString()} ({myVerdict.desc})
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Accept/Decline */}
              <div className="flex gap-3">
                <button
                  onClick={acceptIncomingTrade}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                >
                  Accept Trade
                </button>
                <button
                  onClick={dismissIncoming}
                  className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-8 py-3 rounded-xl border border-gray-700 text-sm transition-colors"
                >
                  Decline
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'incoming' && !incomingTrade && (
        <div className="text-center py-16 mb-6">
          <div className="text-4xl mb-3">{'\u{1F4E8}'}</div>
          <p className="text-gray-400 text-lg font-medium mb-1">No incoming trades</p>
          <p className="text-gray-600 text-sm">When someone shares a trade proposal with you, open the link and it will appear here.</p>
        </div>
      )}

      {/* ══════ HISTORY VIEW ══════ */}
      {view === 'history' && (
        <div className="mb-6">
          {tradeHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">{'\u{1F4CB}'}</div>
              <p className="text-gray-400 text-lg font-medium mb-1">No trade history yet</p>
              <p className="text-gray-600 text-sm">Create your first trade proposal to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tradeHistory.map((trade, i) => {
                const offerC = trade.offer.map(getCardBySlug).filter(Boolean) as typeof sportsCards;
                const requestC = trade.request.map(getCardBySlug).filter(Boolean) as typeof sportsCards;
                const oVal = offerC.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
                const rVal = requestC.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
                return (
                  <div key={`${trade.id}-${i}`} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          trade.type === 'sent' ? 'bg-sky-900/40 text-sky-400 border border-sky-800/50' :
                          trade.type === 'accepted' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' :
                          'bg-amber-900/40 text-amber-400 border border-amber-800/50'
                        }`}>
                          {trade.type === 'sent' ? 'Sent' : trade.type === 'accepted' ? 'Accepted' : 'Received'}
                        </span>
                        {trade.counterparty !== 'Pending' && (
                          <span className="text-gray-500 text-xs">with {trade.counterparty}</span>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs">
                        {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Gave</p>
                        <div className="space-y-1">
                          {offerC.slice(0, 3).map(c => (
                            <p key={c.slug} className="text-xs text-gray-300 truncate">{c.player} ({c.year})</p>
                          ))}
                          {offerC.length > 3 && <p className="text-xs text-gray-600">+{offerC.length - 3} more</p>}
                        </div>
                        <p className="text-emerald-400 text-xs font-bold mt-1">${oVal.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Received</p>
                        <div className="space-y-1">
                          {requestC.slice(0, 3).map(c => (
                            <p key={c.slug} className="text-xs text-gray-300 truncate">{c.player} ({c.year})</p>
                          ))}
                          {requestC.length > 3 && <p className="text-xs text-gray-600">+{requestC.length - 3} more</p>}
                        </div>
                        <p className="text-amber-400 text-xs font-bold mt-1">${rVal.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Related features */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Related</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/binder', label: 'Digital Binder', desc: 'Manage your collection' },
            { href: '/tools/trade', label: 'Trade Evaluator', desc: 'Check trade fairness' },
            { href: '/premium-packs', label: 'Premium Packs', desc: 'Themed digital packs' },
            { href: '/digital-pack', label: 'Daily Pack', desc: '5 free cards daily' },
            { href: '/showcase', label: 'Trophy Case', desc: 'Show off your top 9' },
            { href: '/tools/head-to-head', label: 'Head-to-Head', desc: 'Compare any two cards' },
            { href: '/my-hub', label: 'Collector Hub', desc: 'Your daily dashboard' },
            { href: '/tools/collection-value', label: 'Collection Value', desc: 'Calculate total worth' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-purple-700/40 transition-all"
            >
              <p className="text-white text-sm font-medium">{link.label}</p>
              <p className="text-gray-500 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
